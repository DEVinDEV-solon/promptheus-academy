"""PROMPTHEUS Cinema Studio (vormals MULTI-LLM) — Seitenchat-Assistent.

Gehirn: Claude-CLI über das Abo (nur OAuth, kein API-Schlüssel) oder OpenRouter.
Die CLI läuft OHNE eigene Werkzeuge in einem leeren Arbeitsordner: Der Chat darf auf dem Rechner nichts
ausführen, nur Text zurückgeben. Einzige Ausnahme ist der HyperFrames-Modus: Dann bekommt die CLI genau die
Werkzeuge aus hyperframes_werkzeuge.py über den lokalen MCP-Server (eine Sandbox je Videoprojekt), OpenRouter
dieselben Werkzeuge per tool calling. Nur Standardbibliothek.
"""
from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import threading
import urllib.error
import urllib.request
from pathlib import Path
from typing import Iterator

# Aliase und bekannte Versionen; eigene IDs sind erlaubt, solange sie zur Opus- oder Sonnet-Familie gehören.
CLAUDE_MODELLE = [
    ("opus", "Opus – immer die neueste Version"),
    ("sonnet", "Sonnet – immer die neueste Version"),
    ("claude-opus-5-5", "Opus 5.5"),
    ("claude-sonnet-5", "Sonnet 5"),
    ("claude-opus-4-8", "Opus 4.8"),
]
CLAUDE_MODELL_RE = re.compile(r"^(opus|sonnet|claude-(opus|sonnet)-[a-z0-9][a-z0-9.-]{0,40})(\[1m\])?$")
KURZ_SYSTEM = ("Du bist der Assistent von PROMPTHEUS Cinema Studio. Du hast keine Werkzeuge. "
               "Folge den Anweisungen im ersten Abschnitt der Nachricht und antworte nur mit deinem Text.")
HF_SYSTEM = ("Du bist der HyperFrames-Videobauer von PROMPTHEUS Cinema Studio. Du hast nur die Werkzeuge des "
             "MCP-Servers „hf“ (Skills lesen, Projektdateien lesen/schreiben, hyperframes-CLI, Snapshots ansehen). "
             "Folge den Anweisungen im ersten Abschnitt der Nachricht und antworte auf Deutsch.")
HF_MAX_RUNDEN = 60
BILDER_AUSGEBLENDET = ("[Die Bilder aus bild_ansehen hast du schon gesehen; sie sind hier ausgeblendet, um Kosten zu sparen. "
                       "Bei Bedarf neu mit snapshot + bild_ansehen.]")
# Modelle, bei denen OpenRouter das automatische Prompt-Caching (cache_control oben im Aufruf) annimmt.
# Gemini cacht zusätzlich von selbst (implizit); Lesen aus dem Cache kostet dort ¼, bei Anthropic ⅒ des Eingabepreises.
CACHE_PRAEFIXE = ("anthropic/", "google/gemini")


def claude_finden(eigen: str = "") -> str:
    """Pfad zur Claude-CLI: eigener Pfad aus den Einstellungen, PATH, dann bekannte Ablageorte."""
    kandidaten = [eigen] if eigen else []
    kandidaten += [shutil.which("claude") or "", str(Path.home() / ".local" / "bin" / "claude.exe"),
                   str(Path.home() / ".local" / "bin" / "claude"), r"D:\Werkzeuge\claude\claude.exe",
                   r"D:\Werkzeuge\claude.exe"]
    return next((k for k in kandidaten if k and Path(k).is_file()), "")


def claude_umgebung(oauth_token: str = "") -> dict:
    """Unterprozess-Umgebung: API-Schlüssel aktiv entfernt → Abrechnung nur über das Abo."""
    env = {k: v for k, v in os.environ.items() if k not in ("ANTHROPIC_API_KEY", "ANTHROPIC_AUTH_TOKEN")}
    if oauth_token:
        env["CLAUDE_CODE_OAUTH_TOKEN"] = oauth_token
    return env


def claude_argumente(exe: str, modell: str, mcp_config: str = "", max_runden: int = HF_MAX_RUNDEN) -> list[str]:
    """--tools "" schaltet alle eingebauten Werkzeuge ab (kein Bash/Read/Write). Mit mcp_config kommen nur die
    HyperFrames-Werkzeuge des eigenen MCP-Servers „hf“ dazu; --strict-mcp-config ignoriert alle anderen Server."""
    args = [exe, "-p", "--output-format", "stream-json", "--verbose", "--include-partial-messages",
            "--tools", "", "--strict-mcp-config", "--no-session-persistence",
            "--system-prompt", HF_SYSTEM if mcp_config else KURZ_SYSTEM]
    if mcp_config:
        args += ["--mcp-config", mcp_config, "--allowedTools", "mcp__hf", "--max-turns", str(max(1, int(max_runden)))]
    if modell:
        if not CLAUDE_MODELL_RE.match(modell):
            raise ValueError("Ungültiges Claude-Modell (nur Opus- oder Sonnet-Familie).")
        args += ["--model", modell]
    return args


def mcp_config_schreiben(ziel: Path, python: str, projekt: Path, skills: Path, ffmpeg: str = "") -> Path:
    """MCP-Konfiguration für den HyperFrames-Server (eine Datei je Lauf, im Arbeitsordner des Assistenten)."""
    server = Path(__file__).resolve().parent / "hyperframes_mcp.py"
    ziel.parent.mkdir(parents=True, exist_ok=True)
    ziel.write_text(json.dumps({"mcpServers": {"hf": {
        "type": "stdio", "command": python,
        "args": ["-I", str(server), "--projekt", str(projekt), "--skills", str(skills),
                 *(["--ffmpeg", ffmpeg] if ffmpeg else [])], "env": {}}}},
        ensure_ascii=False), "utf-8")
    return ziel


def _baum_beenden(proc: subprocess.Popen) -> None:
    """CLI samt Kindern (MCP-Server, node, Chrome) beenden."""
    if proc.poll() is not None:
        return
    if os.name == "nt":
        subprocess.run(["taskkill", "/PID", str(proc.pid), "/T", "/F"], capture_output=True,
                       creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
    if proc.poll() is None:
        proc.kill()


def _werkzeug_zeile(name: str, eingabe: dict) -> str:
    import hyperframes_werkzeuge as hw
    return hw.kurz(name.removeprefix("mcp__hf__"), eingabe)


def claude_strom(exe: str, modell: str, prompt: str, ordner: Path, oauth_token: str,
                 abbruch: threading.Event, zeitlimit: int = 600, mcp_config: str = "",
                 max_runden: int = HF_MAX_RUNDEN) -> Iterator[tuple[str, object]]:
    """Startet die CLI und liefert ('text', stück), ('schritt', zeile) … und am Ende ('ende', info) oder ('fehler', meldung)."""
    ordner.mkdir(parents=True, exist_ok=True)
    flags = getattr(subprocess, "CREATE_NO_WINDOW", 0)
    try:
        proc = subprocess.Popen(claude_argumente(exe, modell, mcp_config, max_runden), stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                                stderr=subprocess.PIPE, cwd=str(ordner), env=claude_umgebung(oauth_token),
                                creationflags=flags)
    except OSError as e:
        yield "fehler", f"Claude-CLI startet nicht: {e}"
        return
    fehlertext: list[bytes] = []
    threading.Thread(target=lambda: fehlertext.append(proc.stderr.read()), daemon=True).start()
    wache = threading.Timer(zeitlimit, lambda: _baum_beenden(proc))
    wache.start()
    # Abbruch auch dann, wenn die CLI gerade lange auf ein Werkzeug wartet (Render) und nichts ausgibt
    fertig = threading.Event()
    threading.Thread(target=lambda: _abbruch_waechter(proc, abbruch, fertig), daemon=True).start()
    try:
        proc.stdin.write(prompt.encode("utf-8"))
        proc.stdin.close()
        ergebnis, schon_text = None, False
        for zeile in proc.stdout:
            if abbruch.is_set():
                _baum_beenden(proc)
                yield "fehler", "Abgebrochen."
                return
            try:
                e = json.loads(zeile)
            except ValueError:
                continue
            if e.get("type") == "stream_event":
                ev = e.get("event") or {}
                d = ev.get("delta") or {}
                if ev.get("type") == "message_start" and schon_text:
                    yield "text", "\n\n"          # neue Runde nach Werkzeugen: Absatz
                    schon_text = False
                if d.get("type") == "text_delta" and d.get("text"):
                    schon_text = True
                    yield "text", d["text"]
            elif e.get("type") == "assistant":
                for block in (e.get("message") or {}).get("content") or []:
                    if isinstance(block, dict) and block.get("type") == "tool_use":
                        yield "schritt", _werkzeug_zeile(str(block.get("name") or ""), block.get("input") or {})
            elif e.get("type") == "user":
                for block in (e.get("message") or {}).get("content") or []:
                    if isinstance(block, dict) and block.get("type") == "tool_result" and block.get("is_error"):
                        inhalt = block.get("content")
                        if isinstance(inhalt, list):
                            inhalt = " ".join(str(x.get("text") or "") for x in inhalt if isinstance(x, dict))
                        yield "schritt", "⚠ " + str(inhalt or "Werkzeugfehler")[:200]
            elif e.get("type") == "result":
                ergebnis = e
        proc.wait(timeout=30)
        if ergebnis is None:
            meldung = b"".join(fehlertext).decode("utf-8", "replace").strip()[:300]
            yield "fehler", "Claude-CLI lieferte kein Ergebnis." + (f" {meldung}" if meldung else "")
            return
        if ergebnis.get("is_error"):
            text = str(ergebnis.get("result") or "")
            if "login" in text.lower():
                text = "Claude-CLI ist nicht angemeldet – einmal im Terminal „claude login“ ausführen."
            yield "fehler", f"Claude-CLI: {text[:300]}"
            return
        yield "ende", {"dauer_ms": ergebnis.get("duration_ms"), "kosten_abo": ergebnis.get("total_cost_usd")}
    finally:
        fertig.set()
        wache.cancel()
        _baum_beenden(proc)


def _abbruch_waechter(proc: subprocess.Popen, abbruch: threading.Event, fertig: threading.Event) -> None:
    while not fertig.is_set():
        if abbruch.wait(0.5):
            _baum_beenden(proc)
            return


def _or_oeffnen(key: str, koerper: dict, basis: str):
    """POST /chat/completions mit Streaming → (antwort, None) oder (None, fehlermeldung)."""
    req = urllib.request.Request(basis + "/chat/completions", data=json.dumps(koerper).encode(), method="POST", headers={
        "Authorization": "Bearer " + key, "Content-Type": "application/json",
        "HTTP-Referer": "http://127.0.0.1", "X-Title": "MULTI-LLM"})
    try:
        return urllib.request.urlopen(req, timeout=300), None
    except urllib.error.HTTPError as e:
        try:
            meldung = json.loads(e.read().decode("utf-8", "replace")).get("error", {}).get("message", "")
        except ValueError:
            meldung = ""
        return None, f"OpenRouter {e.code}: {meldung or e.reason}"[:300]
    except (urllib.error.URLError, TimeoutError) as e:
        return None, f"OpenRouter nicht erreichbar: {e}"


def _sse(antwort, abbruch: threading.Event) -> Iterator[dict]:
    """SSE-Zeilen → JSON-Ereignisse. Bei Abbruch kommt {"_abbruch": True}."""
    for roh in antwort:
        if abbruch.is_set():
            yield {"_abbruch": True}
            return
        zeile = roh.decode("utf-8", "replace").strip()
        if not zeile.startswith("data:"):
            continue
        daten = zeile[5:].strip()
        if daten == "[DONE]":
            return
        try:
            yield json.loads(daten)
        except ValueError:
            continue


def _reasoning_zusammen(teile: list) -> list:
    """Gestreamte reasoning_details (Gemini, Claude …) zu ganzen Einträgen zusammensetzen – sie müssen beim
    nächsten Aufruf zurück, sonst verlieren manche Modelle nach einem Werkzeug den Faden."""
    out: dict = {}
    for t in teile:
        if not isinstance(t, dict):
            continue
        k = (t.get("type"), t.get("index", 0))
        if k not in out:
            out[k] = dict(t)
            continue
        z = out[k]
        for feld, wert in t.items():
            if feld in ("text", "summary", "data") and isinstance(wert, str):
                z[feld] = (z.get(feld) or "") + wert
            elif wert not in (None, ""):
                z[feld] = wert
    return list(out.values())


def cache_passend(modell: str) -> bool:
    return str(modell or "").startswith(CACHE_PRAEFIXE)


def _bild_nachricht(bilder: list) -> dict:
    """Bilder aus bild_ansehen als eigene Nutzernachricht – tool-Antworten dürfen im OpenAI-Format keine Bilder tragen."""
    return {"role": "user", "content": [
        {"type": "text", "text": "Hier die Bilder aus bild_ansehen: " + ", ".join(b["pfad"] for b in bilder)}] + [
        {"type": "image_url", "image_url": {"url": f"data:{b['mime']};base64,{b['daten']}"}} for b in bilder]}


def _geld(usd: float) -> str:
    return f"{usd:.3f} $".replace(".", ",")


def openrouter_agent(key: str, modell: str, nachrichten: list, kasten, abbruch: threading.Event,
                     basis: str = "https://openrouter.ai/api/v1", max_runden: int = HF_MAX_RUNDEN,
                     max_kosten: float = 0.0, bilder: bool = True, cache: bool | None = None) -> Iterator[tuple[str, object]]:
    """Werkzeug-Kreislauf über OpenRouter (OpenAI-Format tools/tool_calls), Streaming bleibt.
    Liefert ('text', stück), ('schritt', zeile), ('status', zeile) je Runde, am Ende ('ende', {kosten, runden, …})
    oder ('fehler', meldung).

    Kostenbremse: Bilder bleiben nur für die nächste Antwort im Verlauf, Prompt-Caching (cache_control) bei passenden
    Modellen, Rundenlimit und – wenn max_kosten > 0 – Halt, sobald die Kosten die Grenze erreichen."""
    import hyperframes_werkzeuge as hw
    msgs, kosten, schon_text = list(nachrichten), 0.0, False
    tools = hw.openai_tools(() if bilder else ("bild_ansehen",))
    cache = cache_passend(modell) if cache is None else bool(cache)
    sichtbar: list[int] = []            # Nachrichten mit Bildern, die das Modell noch nicht gesehen hat
    ein_summe = cache_summe = 0
    for runde in range(1, max_runden + 1):
        for versuch in (1, 2):          # bricht der Anbieter ab, bevor etwas kam, wird die Runde einmal wiederholt
            koerper = {"model": modell, "messages": msgs, "tools": tools, "tool_choice": "auto", "stream": True,
                       "usage": {"include": True}}
            if cache:
                koerper["cache_control"] = {"type": "ephemeral"}
            antwort, fehler = _or_oeffnen(key, koerper, basis)
            if fehler and cache and fehler.startswith("OpenRouter 400"):
                cache = False           # Anbieter nimmt cache_control nicht an → ohne weiter
                koerper.pop("cache_control", None)
                antwort, fehler = _or_oeffnen(key, koerper, basis)
            if fehler:
                if versuch == 1 and re.match(r"OpenRouter (5\d\d|429|nicht erreichbar)", fehler):
                    yield "schritt", f"⚠ {fehler[:120]} – neuer Versuch"
                    continue
                yield "fehler", fehler
                return
            inhalt, aufrufe, reasoning, stoerung = "", {}, [], ""
            with antwort:
                for e in _sse(antwort, abbruch):
                    if e.get("_abbruch"):
                        yield "fehler", "Abgebrochen."
                        return
                    if e.get("error"):
                        stoerung = f"OpenRouter: {str(e['error'].get('message', e['error']))[:300]}"
                        break
                    for wahl in e.get("choices") or []:
                        d = wahl.get("delta") or {}
                        if d.get("content"):
                            if not inhalt and schon_text:
                                yield "text", "\n\n"
                            inhalt += d["content"]
                            schon_text = True
                            yield "text", d["content"]
                        if isinstance(d.get("reasoning_details"), list):
                            reasoning += d["reasoning_details"]
                        for tc in d.get("tool_calls") or []:
                            z = aufrufe.setdefault(int(tc.get("index") or 0), {"id": "", "name": "", "args": ""})
                            z["id"] = tc.get("id") or z["id"]
                            f = tc.get("function") or {}
                            if f.get("name") and f["name"] != z["name"]:
                                z["name"] += f["name"]
                            z["args"] += f.get("arguments") or ""
                    u = e.get("usage")
                    if u:
                        kosten += float(u.get("cost") or 0)
                        ein_summe += int(u.get("prompt_tokens") or 0)
                        cache_summe += int((u.get("prompt_tokens_details") or {}).get("cached_tokens") or 0)
            if not stoerung:
                break
            if versuch == 1 and not inhalt and not aufrufe:
                yield "schritt", f"⚠ {stoerung[:120]} – neuer Versuch"
                continue
            yield "fehler", stoerung
            return
        for i in sichtbar:              # gesehen ist gesehen: beim nächsten Aufruf nicht noch einmal bezahlen
            msgs[i] = {"role": "user", "content": BILDER_AUSGEBLENDET}
        sichtbar = []
        info ={"kosten": round(kosten, 6), "runden": runde, "eingabe_tokens": ein_summe, "cache_tokens": cache_summe}
        anteil = f" · {round(100 * cache_summe / ein_summe)} % aus dem Cache" if ein_summe and cache_summe else ""
        yield "status", f"Runde {runde}/{max_runden} · {_geld(kosten)}{anteil}"
        if not aufrufe:
            yield "ende", info
            return
        liste = [aufrufe[i] for i in sorted(aufrufe)]
        for i, z in enumerate(liste):
            z["id"] = z["id"] or f"aufruf_{runde}_{i}"
        msg = {"role": "assistant", "content": inhalt or None,
               "tool_calls": [{"id": z["id"], "type": "function",
                               "function": {"name": z["name"], "arguments": z["args"] or "{}"}} for z in liste]}
        if reasoning:
            msg["reasoning_details"] = _reasoning_zusammen(reasoning)
        msgs.append(msg)
        neue_bilder = []
        for z in liste:
            if abbruch.is_set():
                yield "fehler", "Abgebrochen."
                return
            try:
                args = json.loads(z["args"] or "{}")
            except ValueError:
                args, ergebnis = None, "FEHLER: Die Argumente waren kein gültiges JSON."
            if args is not None:
                yield "schritt", hw.kurz(z["name"], args)
                ergebnis = kasten.ausfuehren(z["name"], args) if bilder or z["name"] != "bild_ansehen" else \
                    "VERWEIGERT: Dieses Modell sieht keine Bilder."
            if ergebnis.startswith(("FEHLER:", "VERWEIGERT:")):
                yield "schritt", "⚠ " + ergebnis[:200]
            if getattr(ergebnis, "bilder", None):
                neue_bilder += ergebnis.bilder
                ergebnis = str(ergebnis) + "\n(Die Bilder folgen gleich als eigene Nachricht.)"
            msgs.append({"role": "tool", "tool_call_id": z["id"], "content": str(ergebnis)})
        if neue_bilder:                 # erst nach allen tool-Antworten, sonst bricht die Reihenfolge
            msgs.append(_bild_nachricht(neue_bilder[:hw.MAX_BILDER * 2]))
            sichtbar.append(len(msgs) - 1)
        if max_kosten and kosten >= max_kosten:
            yield "text", (f"\n\n(Kostenbremse: {_geld(kosten)} erreicht, Grenze {_geld(max_kosten)} – "
                           "schreib „weiter“, dann mache ich dort weiter.)")
            yield "ende", {**info, "kostenbremse": True}
            return
    yield "text", "\n\n(Rundenlimit erreicht – schreib „weiter“, dann mache ich dort weiter.)"
    yield "ende", {"kosten": round(kosten, 6), "runden": max_runden, "eingabe_tokens": ein_summe, "cache_tokens": cache_summe}


def openrouter_strom(key: str, modell: str, nachrichten: list, abbruch: threading.Event,
                     basis: str = "https://openrouter.ai/api/v1") -> Iterator[tuple[str, object]]:
    """Chat über OpenRouter mit Streaming (SSE). Nachrichten im OpenAI-Format, Bilder als data-URL-Teile."""
    antwort, fehler = _or_oeffnen(key, {"model": modell, "messages": nachrichten, "stream": True,
                                        "usage": {"include": True}}, basis)
    if fehler:
        yield "fehler", fehler
        return
    kosten = None
    with antwort:
        for e in _sse(antwort, abbruch):
            if e.get("_abbruch"):
                yield "fehler", "Abgebrochen."
                return
            if e.get("error"):
                yield "fehler", f"OpenRouter: {str(e['error'].get('message', e['error']))[:300]}"
                return
            for wahl in e.get("choices") or []:
                stueck = (wahl.get("delta") or {}).get("content")
                if stueck:
                    yield "text", stueck
            if e.get("usage"):
                kosten = e["usage"].get("cost")
    yield "ende", {"kosten": kosten}


# --------------------------------------------------------------------------- Anweisungen
def modell_zeile_bild(m: dict) -> str:
    p = m.get("parameter") or {}
    teile = [f"{m['id']} ({m['name']})"]
    if p.get("aspect_ratio"):
        teile.append("formate=" + ",".join(p["aspect_ratio"]["werte"]))
    if p.get("resolution"):
        teile.append("aufloesung=" + ",".join(p["resolution"]["werte"]))
    if p.get("quality"):
        teile.append("qualitaet=" + ",".join(p["quality"]["werte"]))
    if m.get("referenzbilder") and p.get("input_references"):
        teile.append(f"referenzbilder<={p['input_references'].get('max')}")
    return "- " + " | ".join(teile)


def modell_zeile_video(m: dict) -> str:
    teile = [f"{m['id']} ({m['name']})", "formate=" + ",".join(m.get("formate") or []),
             "aufloesung=" + ",".join(m.get("aufloesungen") or []),
             "dauer=" + ",".join(str(d) for d in m.get("dauern") or [])]
    if m.get("frames"):
        teile.append("bilder=" + ",".join(m["frames"]))
    if m.get("ton") is True:
        teile.append("ton")
    return "- " + " | ".join(teile)


def anweisungen(modus: str, bildmodelle: list, videomodelle: list, kontext: dict, sprache: str) -> str:
    prompt_sprache = ("Schreibe den Text im Feld \"prompt\" auf Englisch (die Modelle verstehen Englisch am besten) "
                      "und erkläre ihn im Chat kurz auf Deutsch."
                      if sprache != "deutsch" else "Schreibe den Text im Feld \"prompt\" auf Deutsch.")
    teile = [
        "# Rolle",
        "Du bist der kreative Prompt-Assistent in PROMPTHEUS Cinema Studio, einer Plattform zum Erzeugen von Bildern, Videos und Audio. "
        "Du sprichst Deutsch, bist konkret und stellst höchstens eine Rückfrage je Antwort. Du erzeugst selbst "
        "keine Bilder, sondern schreibst Prompts, die der Nutzer per Klick ins Eingabefeld übernimmt oder direkt erzeugt.",
        "",
        "# Prompt-Karten",
        "Jeder konkrete Vorschlag steht zusätzlich in einem eigenen Codeblock, genau so:",
        "```bildprompt",
        '{"prompt": "…", "modell": "<id>", "seitenverhaeltnis": "…", "aufloesung": "…", "qualitaet": "…", "anzahl": 1}',
        "```",
        "bzw. für Videos:",
        "```videoprompt",
        '{"prompt": "…", "modell": "<id>", "seitenverhaeltnis": "…", "aufloesung": "…", "dauer": 5, "ton": true, "anzahl": 1}',
        "```",
        "bzw. für Sprachausgaben (Audio):",
        "```audioprompt",
        '{"prompt": "…", "titel": "…"}',
        "```",
        "Regeln: gültiges JSON; nur Modell-IDs und Werte aus den Listen unten; Felder, die das Modell nicht kennt, "
        "weglassen; mehrere Varianten = mehrere Blöcke. " + prompt_sprache,
        "Video-Prompts beschreiben Motiv, Bewegung, Kamera (Einstellung, Fahrt), Licht, Stimmung und bei Ton "
        "die Geräusche/Musik/Sprache. Bild-Prompts beschreiben Motiv, Komposition, Licht, Stil, Objektiv.",
        "Keine realen Personen ohne deren Einwilligung, keine geschützten Marken oder Figuren nachbauen – "
        "stattdessen eigenständige Alternativen vorschlagen.",
    ]
    if modus == "drehbuch":
        teile += ["", "# Modus Drehbuch",
                  "Führe den Nutzer Schritt für Schritt: Briefing (Ziel, Zielgruppe, Länge, Format) → Konzept → "
                  "Stil/Technik → Szenenliste → Figuren/Produkte (gleichbleibend über alle Szenen) → Ton/Musik → Abschluss/CTA. "
                  "Stelle je Schritt eine fokussierte Frage. Wenn die Szenenliste steht, gib JEDE Szene als eigenen "
                  "```videoprompt```-Block aus und füge im JSON die Felder \"szene\" (Nummer) und \"titel\" hinzu. "
                  "Wiederhole das Aussehen von Figuren und Produkten in jedem Szenen-Prompt wörtlich, damit sie gleich bleiben."]
    if modus == "klon":
        teile += ["", "# Modus Video-Clone",
                  "Du bekommst eine Analyse eines Referenzvideos. Übernimm die Form (Aufbau, Rhythmus, Schnitte, Kamera, "
                  "Hook, CTA), aber NIE den Inhalt: keine fremden Marken, Personen, Texte oder Figuren kopieren – alles "
                  "durch die Marke und das Produkt des Nutzers ersetzen. Frage zuerst nach Marke/Produkt, falls unbekannt. "
                  "Gib danach einen Klon-Bauplan und je Szene einen ```videoprompt```-Block mit \"szene\" und \"titel\" aus."]
    teile += ["", "# Bilder im Video-Modus (für technischen Rat)",
              "Unter dem Eingabefeld gibt es im Video-Modus anklickbare Kästchen (und dieselbe Auswahl im +-Menü). "
              "Jedes mitgegebene Bild hat eine Rolle; ein Klick auf das Rollenschild eines Bildes ändert sie:",
              "- Startbild (frame_images first_frame): Das Video beginnt GENAU mit diesem Bild. Nur Modelle mit bilder=first_frame.",
              "- Endbild (frame_images last_frame): Das Video endet genau mit diesem Bild. Nur Modelle mit bilder=…last_frame.",
              "- Vorlage (input_references, bis zu 3 = @Bild 1, 2, 3 in der gewählten Reihenfolge): Grundlage für Figur, Aussehen, "
              "Produkt oder Stil, aber KEIN Startbild. Den ersten Moment (Startposition) beschreibt der Text.",
              "- Storyboard-Raster (Kästchen ▦, Arten 6 Felder 3×2, 4 Felder 2×2, 3 Felder 3×1): @Bild 1 ist ein zusammenhängendes "
              "Raster; das Video beginnt wie Feld 1 und folgt den Feldern, ohne Raster, Trennlinien oder Ziffern zu zeigen.",
              "Regeln: Vorlagen und Start-/Endbild schließen sich aus (OpenRouter behandelt beides zusammen als Bild-zu-Video, "
              "die Vorlagen gingen unter). Ob ein Modell Vorlagen wirklich beachtet, ist nur für bytedance/seedance-2.0-fast "
              "bestätigt – bei anderen ehrlich sagen, dass es unbestätigt ist, und zu einem kurzen, günstigen Test raten. "
              "Bei Vorlagen und Raster setzt das Programm selbst einen deutschen Vorsatz vor den Prompt (welche Bilder Vorlagen sind, "
              "wie das Raster zu lesen ist) – diesen Vorsatz NICHT im Feld \"prompt\" wiederholen; dort nur Startposition, "
              "Handlung, Kamera, Licht und Ton beschreiben und die Bilder bei Bedarf mit @Bild 1/2/3 ansprechen.",
              "Faustregeln: Startbild, wenn das Bild exakt so im Video erscheinen soll (z. B. ein fertiges Produktfoto animieren); "
              "Start- + Endbild für eine gezielte Verwandlung oder einen Übergang; Vorlage, wenn eine Figur oder ein Profilblatt "
              "(Charakter-Variante, Profil-Screen) nur als Grundlage dienen soll; Storyboard-Raster, wenn ein mehrteiliges "
              "Storyboard-Bild den Ablauf vorgibt. Weicht ein Start-/Endbild vom Videoformat ab, erweitert oder beschneidet es "
              "das Programm je nach Einstellung (Einstellungen → Video). Bilder setzt der Nutzer selbst, du kannst sie nicht anhängen."]
    k = kontext or {}
    br = k.get("bildrollen") if isinstance(k.get("bildrollen"), dict) else {}
    if k.get("modus") == "video" and br:
        teile.append(f"Gerade gesetzt: Startbild {'ja' if br.get('start') else 'nein'} · Endbild {'ja' if br.get('ende') else 'nein'} · "
                     f"Vorlagen {min(int(br['vorlagen']), 3) if str(br.get('vorlagen') or '').isdigit() else 0} · Storyboard-Raster "
                     f"{str(br.get('raster') or 'aus')[:8]}")
    if k.get("modus") == "audio" and modus not in ("drehbuch", "klon"):
        teile += ["", "# Modus Audio (Sprachausgabe)",
                  "Der Nutzer erzeugt gerade eine Sprachausgabe: Ein Sprachmodell liest den Text mit der eingestellten Stimme vor. "
                  "Schreibe hier keine Bild- oder Video-Prompts, sondern Sprechertexte, also genau die Worte, die gesprochen werden. "
                  "Gib jeden Vorschlag als ```audioprompt```-Block aus, das Feld \"modell\" lässt du weg (es gilt das gewählte Sprachmodell).",
                  "Der Text im Feld \"prompt\" steht in der Sprache, in der gesprochen werden soll, ohne Wunsch des Nutzers auf Deutsch. "
                  "Er wird nicht ins Englische übersetzt; diese Regel geht der Sprachregel oben vor.",
                  "Schreibe für das Ohr: kurze, natürliche Sätze; Zahlen, Daten, Einheiten und Abkürzungen ausgeschrieben; "
                  "Pausen über Satzzeichen statt über Regieanweisungen; kein Markdown, keine Emojis, keine Klammern mit Hinweisen im Feld \"prompt\". "
                  "Rechne mit etwa 140 gesprochenen Wörtern pro Minute und bleibe unter 5000 Zeichen je Block.",
                  "Fehlen Zweck, Länge oder Ton, stelle dazu eine kurze Rückfrage."]
    if k.get("modus") == "influencer" and modus not in ("drehbuch", "klon"):
        ik = k.get("influencer") if isinstance(k.get("influencer"), dict) else {}
        teile += ["", "# Modus Influencer (Charaktere bauen)",
                  "Der Nutzer baut auf der Seite „Influencer › Erstellen“ einen KI-Charakter. Links ist ein Panel mit "
                  "Charaktertyp (normal, kuehn, extrem, insekt, frosch, katze, hund, nager, vogel), optionalem Foto oder Basis-Charakter, "
                  "einem Feld „Besonderheiten“ und dem Knopf „Erzeugen“. Erkläre in einfachen Worten, ohne Fachsprache, was als Nächstes zu tun ist.",
                  "Schlage skurrile, auffällige, aber respektvolle Figuren vor, die in sozialen Netzwerken auffallen und Jugendlichen gefallen. "
                  "Nur erfundene Erwachsene, keine echten oder berühmten Personen, keine Marken oder Logos, nichts Sexualisiertes. "
                  "„extrem“ übertreibt Frisur, Outfit, Silhouette und Haltung, niemals Herkunft, Hautfarbe oder Gesichtszüge einer Gruppe.",
                  "Gib jeden Charaktervorschlag als eigenen Block aus, genau so:",
                  "```influencer",
                  '{"name": "…", "typ": "frosch", "prompt": "…"}',
                  "```",
                  "Das Feld \"prompt\" beschreibt nur den Charakter (Figur, Haar, Gesicht, Outfit, Pose, Bildausschnitt) auf Englisch in 40 bis 90 Wörtern; "
                  "Studiohintergrund und Licht ergänzt die Seite selbst. Der Name ist kurz und einprägsam (gern deutsch und mit Wortwitz).",
                  "Stand im Panel: "
                  f"Typ {str(ik.get('typ') or '-')[:20]} · Besonderheiten: {str(ik.get('besonderheiten') or '(leer)')[:500]} · "
                  f"Basis: {str(ik.get('basis') or '(keine)')[:80]} · nächster Schritt: {str(ik.get('schritt') or '-')[:80]}"]
    teile += ["", "# Bildmodelle (id | Fähigkeiten)"] + [modell_zeile_bild(m) for m in bildmodelle]
    teile += ["", "# Videomodelle (id | Fähigkeiten)"] + [modell_zeile_video(m) for m in videomodelle]
    teile += ["", "# Aktueller Stand im Eingabefeld",
              f"Modus: {k.get('modus', 'bild')} · Modell: {k.get('modell', '-')}",
              f"Beschreibung im Feld: {str(k.get('prompt') or '(leer)')[:2000]}"]
    return "\n".join(teile)


def hf_anweisungen(skills_index: str, projekt: str, dateien: str, briefing: dict | None, analyse: str = "",
                   bilder: bool = True) -> str:
    """Systemanweisung im HyperFrames-Modus: Skill-Index, Sandbox-Regeln, Projektstand."""
    b = briefing or {}
    teile = [
        "# Rolle",
        "Du baust in PROMPTHEUS Cinema Studio Videos mit HyperFrames (HTML-Komposition → MP4). Du sprichst Deutsch, "
        "bist knapp und erklärst in einfachen Worten, was du tust. Du arbeitest selbstständig mit deinen Werkzeugen.",
        "",
        "# Werkzeuge und Grenzen",
        "- skills_liste / skill_lesen: Die HyperFrames-Skills sind installiert. Beginne IMMER mit skill_lesen skill='hyperframes' "
        "(SKILL.md), lies dann den passenden Workflow-Skill (z. B. motion-graphics, general-video, product-launch-video) und "
        "vor dem Schreiben von HTML hyperframes-core. Lies Referenzdateien gezielt statt alles.",
        "- ordner_auflisten / datei_lesen / datei_schreiben: nur im Projektordner (relative Pfade wie 'video/index.html').",
        "- hyperframes_ausfuehren: nur die HyperFrames-CLI (z. B. init, lint, check, snapshot, render, capture, add, catalog). "
        "Arbeitsordner meist 'video'.",
        *(["- bild_ansehen: zeigt dir bis zu 3 Standbilder aus snapshots/ oder renders/ (ohne pfade: die neuesten Snapshots) – "
           "so siehst du, was wirklich gerendert wird."] if bilder else []),
        "Diese Umgebung hat KEIN Bash, kein node, kein npm und keine Unteragenten. Schritte aus den Skills, die das brauchen "
        "(Skripte unter scripts/, prefs.mjs, Unteragenten, „skills update“, preview/Studio, Desktop-App/Framey, feedback, usage), "
        "überspringst du still und machst das Nötige selbst mit deinen Werkzeugen. Kein Cloud-Rendern, kein Publish.",
        "",
        "# Arbeitsweise",
        "1. Gibt es video/BRIEF.md, lies es: dann ist das Briefing bestätigt – stelle KEINE Briefing-Fragen, baue direkt.",
        "   Gibt es noch kein Projekt, frage höchstens eine kurze Rückfrage (Thema, Länge, Format) oder lege es mit "
        "   hyperframes_ausfuehren befehl='init' argumente=['video','--resolution','landscape'] an (portrait = 9:16, square = 1:1).",
        "2. Schreibe die Komposition (video/index.html, ggf. video/compositions/*.html) nach hyperframes-core: Zeitangaben über "
        "data-*-Attribute, class=\"clip\", eine pausierte GSAP-Timeline in window.__timelines, deterministisch.",
        "3. Prüfe mit befehl='lint' (und bei Bedarf 'check'), behebe Fehler. Warnungen sind kein Grund zum Umbau: "
        "nach höchstens zwei Korrekturrunden geht es weiter.",
        *(["4. Sichtkontrolle vor dem Render, genau einmal: befehl='snapshot', argumente=['--at','<Anfang>,<Mitte>,<Ende>'] "
           "(Sekunden, z. B. '0.5,2.5,4.5'), ordner='video'; danach bild_ansehen ohne pfade. Achte auf Lesbarkeit, "
           "abgeschnittene Texte, leere Bilder und ungewollte Kästen, Balken oder Rahmen (z. B. ein Schimmer als sichtbares "
           "Rechteck). Behebe Sichtbares in einem Durchgang, ohne erneuten Snapshot."] if bilder else []),
        f"{5 if bilder else 4}. Rendere mit befehl='render', argumente=['-o','renders/<kurzer-name>.mp4'], ordner='video'. "
        "Das Programm übernimmt jede fertige MP4 automatisch in die Bibliothek – sag das dem Nutzer am Ende in einem Satz.",
        "Sei sparsam, jede Runde kostet: Lies jede Datei und jeden Skill nur einmal (ein zweites Lesen liefert nur einen "
        "Hinweis), lies Referenzen nur, wenn du sie wirklich brauchst, und fasse Werkzeugaufrufe einer Runde zusammen. "
        "Höchstens etwa 25 Werkzeugaufrufe bis zum Render.",
        "Texte im Video auf Deutsch, außer der Nutzer will etwas anderes. Keine fremden Marken, Logos oder realen Personen "
        "nachbauen; nur Material des Nutzers (assets/) und eigene Gestaltung.",
        "",
        "# Installierte Skills",
        skills_index or "(keine gefunden)",
        "",
        "# Projekt",
        f"Projektordner: {projekt}",
        "Inhalt:",
        dateien or "(leer)",
    ]
    if b:
        teile += ["", "# Onboarding (vom Nutzer bestätigt)", json.dumps(b, ensure_ascii=False)[:4000]]
    if analyse:
        teile += ["", "# Analyse des Referenzvideos (Video-Clone)",
                  "Übernimm Form, Rhythmus, Szenenfolge, Hook und CTA – nie Inhalt, Marken, Personen oder Texte des Originals.",
                  analyse[:20000]]
    return "\n".join(teile)


def verlauf_als_text(anweisung: str, nachrichten: list, max_zeichen: int = 60000) -> str:
    """Für die CLI: Anweisungen + Verlauf als ein Text (älteste Nachrichten fallen zuerst weg)."""
    zeilen = []
    for n in reversed(nachrichten):
        zeilen.insert(0, f"{'ASSISTENT' if n['rolle'] == 'assistent' else 'NUTZER'}: {n['text']}")
        if sum(len(z) for z in zeilen) > max_zeichen:
            zeilen.pop(0)
            break
    return (anweisung + "\n\n# Gesprächsverlauf\n" + "\n\n".join(zeilen)
            + "\n\nAntworte jetzt als ASSISTENT auf die letzte NUTZER-Nachricht. Gib nur deine Antwort aus.")


def verlauf_als_nachrichten(anweisung: str, nachrichten: list, bilder_urls: list[str],
                            max_zeichen: int = 60000) -> list:
    """Für OpenRouter: Systemnachricht + Verlauf; Bilder hängen an der letzten Nutzernachricht."""
    auswahl, summe = [], 0
    for n in reversed(nachrichten):
        summe += len(n["text"])
        if summe > max_zeichen and auswahl:
            break
        auswahl.insert(0, n)
    msgs = [{"role": "system", "content": anweisung}]
    for i, n in enumerate(auswahl):
        rolle = "assistant" if n["rolle"] == "assistent" else "user"
        if i == len(auswahl) - 1 and rolle == "user" and bilder_urls:
            msgs.append({"role": "user", "content": [{"type": "text", "text": n["text"]}] +
                         [{"type": "image_url", "image_url": {"url": u}} for u in bilder_urls]})
        else:
            msgs.append({"role": rolle, "content": n["text"]})
    return msgs


KARTE_RE = re.compile(r"```(bildprompt|videoprompt)\s*\n(.*?)```", re.S)


def karten(text: str) -> list[dict]:
    """Prompt-Karten aus einer Antwort (für Tests und die Drehbuch-Übernahme)."""
    out = []
    for art, roh in KARTE_RE.findall(text):
        try:
            d = json.loads(roh)
        except ValueError:
            continue
        if isinstance(d, dict) and str(d.get("prompt") or "").strip():
            out.append({"art": "video" if art == "videoprompt" else "bild", **d})
    return out
