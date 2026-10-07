"""PROMPTHEUS Cinema Studio (vormals MULTI-LLM) — Seitenchat-Assistent.

Gehirn: Claude-CLI über das Abo (nur OAuth, kein API-Schlüssel) oder OpenRouter.
Die CLI läuft OHNE Werkzeuge und ohne MCP-Server in einem leeren Arbeitsordner: Der Chat darf auf
dem Rechner nichts ausführen, nur Text zurückgeben. Nur Standardbibliothek.
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


def claude_argumente(exe: str, modell: str) -> list[str]:
    args = [exe, "-p", "--output-format", "stream-json", "--verbose", "--include-partial-messages",
            "--tools", "", "--strict-mcp-config", "--no-session-persistence", "--system-prompt", KURZ_SYSTEM]
    if modell:
        if not CLAUDE_MODELL_RE.match(modell):
            raise ValueError("Ungültiges Claude-Modell (nur Opus- oder Sonnet-Familie).")
        args += ["--model", modell]
    return args


def claude_strom(exe: str, modell: str, prompt: str, ordner: Path, oauth_token: str,
                 abbruch: threading.Event, zeitlimit: int = 600) -> Iterator[tuple[str, object]]:
    """Startet die CLI und liefert ('text', stück) … und am Ende ('ende', info) oder ('fehler', meldung)."""
    ordner.mkdir(parents=True, exist_ok=True)
    flags = getattr(subprocess, "CREATE_NO_WINDOW", 0)
    try:
        proc = subprocess.Popen(claude_argumente(exe, modell), stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                                stderr=subprocess.PIPE, cwd=str(ordner), env=claude_umgebung(oauth_token),
                                creationflags=flags)
    except OSError as e:
        yield "fehler", f"Claude-CLI startet nicht: {e}"
        return
    fehlertext: list[bytes] = []
    threading.Thread(target=lambda: fehlertext.append(proc.stderr.read()), daemon=True).start()
    wache = threading.Timer(zeitlimit, proc.kill)
    wache.start()
    try:
        proc.stdin.write(prompt.encode("utf-8"))
        proc.stdin.close()
        ergebnis = None
        for zeile in proc.stdout:
            if abbruch.is_set():
                proc.kill()
                yield "fehler", "Abgebrochen."
                return
            try:
                e = json.loads(zeile)
            except ValueError:
                continue
            if e.get("type") == "stream_event":
                d = (e.get("event") or {}).get("delta") or {}
                if d.get("type") == "text_delta" and d.get("text"):
                    yield "text", d["text"]
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
        wache.cancel()
        if proc.poll() is None:
            proc.kill()


def openrouter_strom(key: str, modell: str, nachrichten: list, abbruch: threading.Event,
                     basis: str = "https://openrouter.ai/api/v1") -> Iterator[tuple[str, object]]:
    """Chat über OpenRouter mit Streaming (SSE). Nachrichten im OpenAI-Format, Bilder als data-URL-Teile."""
    koerper = json.dumps({"model": modell, "messages": nachrichten, "stream": True, "usage": {"include": True}}).encode()
    req = urllib.request.Request(basis + "/chat/completions", data=koerper, method="POST", headers={
        "Authorization": "Bearer " + key, "Content-Type": "application/json",
        "HTTP-Referer": "http://127.0.0.1", "X-Title": "MULTI-LLM"})
    try:
        antwort = urllib.request.urlopen(req, timeout=300)
    except urllib.error.HTTPError as e:
        try:
            meldung = json.loads(e.read().decode("utf-8", "replace")).get("error", {}).get("message", "")
        except ValueError:
            meldung = ""
        yield "fehler", f"OpenRouter {e.code}: {meldung or e.reason}"[:300]
        return
    except (urllib.error.URLError, TimeoutError) as e:
        yield "fehler", f"OpenRouter nicht erreichbar: {e}"
        return
    kosten = None
    with antwort:
        for roh in antwort:
            if abbruch.is_set():
                yield "fehler", "Abgebrochen."
                return
            zeile = roh.decode("utf-8", "replace").strip()
            if not zeile.startswith("data:"):
                continue
            daten = zeile[5:].strip()
            if daten == "[DONE]":
                break
            try:
                e = json.loads(daten)
            except ValueError:
                continue
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
    k = kontext or {}
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
    teile += ["", "# Bildmodelle (id | Fähigkeiten)"] + [modell_zeile_bild(m) for m in bildmodelle]
    teile += ["", "# Videomodelle (id | Fähigkeiten)"] + [modell_zeile_video(m) for m in videomodelle]
    teile += ["", "# Aktueller Stand im Eingabefeld",
              f"Modus: {k.get('modus', 'bild')} · Modell: {k.get('modell', '-')}",
              f"Beschreibung im Feld: {str(k.get('prompt') or '(leer)')[:2000]}"]
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
