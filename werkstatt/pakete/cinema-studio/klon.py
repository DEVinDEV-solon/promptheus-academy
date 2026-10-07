"""MULTI-LLM — Video-Clone: Referenzvideo → Szenen + Standbilder → Vision-Analyse.

Quelle: Link (yt-dlp, z. B. YouTube, TikTok, Instagram, X/Twitter) oder eigene Datei.
Grundsatz: die FORM eines Videos analysieren (Aufbau, Schnitt, Kamera, Hook, CTA), nie den Inhalt kopieren.
Alle Programme werden ohne Shell mit Argumentlisten aufgerufen. Nur Standardbibliothek.
"""
from __future__ import annotations

import base64
import ipaddress
import json
import re
import shutil
import subprocess
import urllib.error
import urllib.request
from pathlib import Path
from urllib.parse import urlparse

WERKZEUG_ORTE = {
    "ffmpeg": [r"D:\Werkzeuge\ffmpeg\ffmpeg.exe", r"D:\Werkzeuge\ffmpeg\bin\ffmpeg.exe"],
    "ffprobe": [r"D:\Werkzeuge\ffmpeg\ffprobe.exe", r"D:\Werkzeuge\ffmpeg\bin\ffprobe.exe"],
    "yt-dlp": [r"D:\Werkzeuge\yt-dlp\yt-dlp.exe", r"D:\Werkzeuge\yt-dlp.exe"],
}
MAX_BILDER = 24
FLAGS = getattr(subprocess, "CREATE_NO_WINDOW", 0)


def werkzeug(name: str, eigen: str = "") -> str:
    kandidaten = [eigen] if eigen else []
    kandidaten += [shutil.which(name) or ""] + WERKZEUG_ORTE.get(name, [])
    return next((k for k in kandidaten if k and Path(k).is_file()), "")


def url_pruefen(url: str) -> str:
    """Nur http(s)-Links auf öffentliche Hosts – keine Adressen im eigenen Netz (Schutz vor SSRF)."""
    url = (url or "").strip()
    teile = urlparse(url)
    if teile.scheme not in ("http", "https") or not teile.hostname or len(url) > 2000:
        raise ValueError("Bitte einen vollständigen Link mit https:// angeben.")
    host = teile.hostname.lower()
    if host in ("localhost",) or host.endswith((".local", ".localhost", ".internal")):
        raise ValueError("Links auf lokale Adressen sind nicht erlaubt.")
    try:
        ip = ipaddress.ip_address(host)
        if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved or ip.is_unspecified:
            raise ValueError("Links auf lokale Adressen sind nicht erlaubt.")
    except ValueError as e:
        if "nicht erlaubt" in str(e):
            raise
    return url


def _lauf(args: list, zeitlimit: int) -> subprocess.CompletedProcess:
    try:
        return subprocess.run(args, capture_output=True, timeout=zeitlimit, creationflags=FLAGS)
    except subprocess.TimeoutExpired:
        raise RuntimeError(f"{Path(args[0]).stem} hat das Zeitlimit überschritten.") from None
    except OSError as e:
        raise RuntimeError(f"{Path(args[0]).stem} startet nicht: {e}") from None


def herunterladen(url: str, ordner: Path, ytdlp: str, ffmpeg: str) -> tuple[Path, str]:
    """Lädt höchstens 720p, eine Datei, max. 500 MB. Rückgabe: Datei, Titel."""
    ordner.mkdir(parents=True, exist_ok=True)
    args = [ytdlp, "--no-playlist", "--no-progress", "--restrict-filenames", "--max-filesize", "500M",
            "-f", "bv*[height<=720]+ba/b[height<=720]/bv*+ba/b", "--merge-output-format", "mp4",
            "-o", str(ordner / "quelle.%(ext)s"), "--print", "after_move:title", "--no-simulate"]
    if ffmpeg:
        args += ["--ffmpeg-location", str(Path(ffmpeg).parent)]
    r = _lauf(args + ["--", url], 900)
    dateien = [p for p in ordner.glob("quelle.*") if p.suffix.lower() in (".mp4", ".webm", ".mkv", ".mov")]
    if r.returncode != 0 or not dateien:
        fehler = r.stderr.decode("utf-8", "replace").strip().splitlines()
        letzte = next((z for z in reversed(fehler) if "ERROR" in z), fehler[-1] if fehler else "")
        raise RuntimeError("Download fehlgeschlagen" + (f": {letzte[:240]}" if letzte else "."))
    titel = r.stdout.decode("utf-8", "replace").strip().splitlines()
    return dateien[0], (titel[-1] if titel else "")[:200]


def dauer_messen(ffprobe: str, datei: Path) -> float:
    r = _lauf([ffprobe, "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(datei)], 60)
    try:
        return round(float(r.stdout.decode().strip()), 2)
    except ValueError:
        raise RuntimeError("Das Video ist nicht lesbar (Dauer unbekannt).") from None


def schnitte_finden(ffmpeg: str, datei: Path, schwelle: float = 0.3) -> list[float]:
    """Szenenwechsel über ffmpegs Szenen-Filter (Zeitpunkte in Sekunden)."""
    r = _lauf([ffmpeg, "-hide_banner", "-nostdin", "-i", str(datei), "-an", "-vf",
               f"select='gt(scene,{schwelle})',showinfo", "-f", "null", "-"], 900)
    zeiten = [float(x) for x in re.findall(r"pts_time:([0-9.]+)", r.stderr.decode("utf-8", "replace"))]
    return sorted({round(t, 2) for t in zeiten})


def szenen_bilden(schnitte: list[float], dauer: float, max_bilder: int = MAX_BILDER) -> list[dict]:
    """Szenengrenzen → Liste {nr, von, bis, t}; t = Zeitpunkt für das Standbild (Szenenmitte)."""
    grenzen = [0.0] + [t for t in schnitte if 0.2 < t < dauer - 0.2] + [dauer]
    szenen = [{"von": a, "bis": b} for a, b in zip(grenzen, grenzen[1:]) if b - a > 0.15]
    if len(szenen) > max_bilder:            # sehr schnelle Schnitte: gleichmäßig ausdünnen
        schritt = len(szenen) / max_bilder
        auswahl = [szenen[int(i * schritt)] for i in range(max_bilder)]
        szenen = [{"von": s["von"], "bis": (auswahl[i + 1]["von"] if i + 1 < len(auswahl) else dauer)}
                  for i, s in enumerate(auswahl)]
    for i, s in enumerate(szenen, 1):
        s.update({"nr": i, "t": round((s["von"] + s["bis"]) / 2, 2), "von": round(s["von"], 2), "bis": round(s["bis"], 2)})
    return szenen


def standbilder(ffmpeg: str, datei: Path, szenen: list[dict], ordner: Path) -> list[Path]:
    ordner.mkdir(parents=True, exist_ok=True)
    pfade = []
    for s in szenen:
        ziel = ordner / f"{s['nr']:02d}.jpg"
        _lauf([ffmpeg, "-hide_banner", "-nostdin", "-y", "-ss", str(s["t"]), "-i", str(datei), "-frames:v", "1",
               "-vf", "scale=512:-2", "-q:v", "4", str(ziel)], 120)
        if ziel.is_file():
            pfade.append(ziel)
    if not pfade:
        raise RuntimeError("Aus dem Video ließen sich keine Standbilder ziehen.")
    return pfade


ANALYSE_AUFTRAG = """Du analysierst ein Referenzvideo für einen Werbe-/Social-Video-Klon. Ziel ist, die FORM zu verstehen
(Aufbau, Rhythmus, Schnitt, Kamera, Bildsprache, Hook, Call-to-Action) – nicht den Inhalt zu kopieren.
Du bekommst je Szene ein Standbild mit Zeitangabe. Antworte NUR mit JSON in genau dieser Form (deutsch):
{"zusammenfassung": "2–3 Sätze", "format": "z. B. 9:16", "stil": "Bildsprache, Farben, Licht",
 "zielgruppe": "vermutet", "hook": "was die ersten Sekunden tun", "cta": "Handlungsaufforderung am Ende, falls erkennbar",
 "rhythmus": "Schnitttempo, Dramaturgie", "ton_vermutung": "Musik/Sprache/Geräusche, soweit aus Bildern ableitbar",
 "szenen": [{"nr": 1, "von": 0.0, "bis": 2.1, "bild": "was man sieht", "kamera": "Einstellung/Bewegung",
             "text_im_bild": "eingeblendeter Text oder leer", "zweck": "Hook|Problem|Lösung|Produkt|Beweis|Emotion|CTA|…"}],
 "fremdmarken": ["erkennbare Marken/Logos/Personen, die NICHT übernommen werden dürfen"]}"""


def analysieren(key: str, modell: str, szenen: list[dict], bilder: list[Path], dauer: float, titel: str,
                basis: str = "https://openrouter.ai/api/v1") -> tuple[dict, float]:
    """Ein Vision-Aufruf mit allen Standbildern. Rückgabe: Analyse, Kosten (USD)."""
    inhalt: list = [{"type": "text", "text": f"{ANALYSE_AUFTRAG}\n\nVideolänge: {dauer:.1f} s, {len(szenen)} Szenen."
                     + (f" Titel: {titel}" if titel else "")}]
    for s, bild in zip(szenen, bilder):
        inhalt.append({"type": "text", "text": f"Szene {s['nr']}: {s['von']:.1f}–{s['bis']:.1f} s"})
        inhalt.append({"type": "image_url", "image_url": {
            "url": "data:image/jpeg;base64," + base64.b64encode(bild.read_bytes()).decode("ascii")}})
    koerper = json.dumps({"model": modell, "messages": [{"role": "user", "content": inhalt}],
                          "usage": {"include": True}, "temperature": 0.2}).encode()
    req = urllib.request.Request(basis + "/chat/completions", data=koerper, method="POST", headers={
        "Authorization": "Bearer " + key, "Content-Type": "application/json",
        "HTTP-Referer": "http://127.0.0.1", "X-Title": "MULTI-LLM"})
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            antwort = json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        try:
            meldung = json.loads(e.read().decode("utf-8", "replace")).get("error", {}).get("message", "")
        except ValueError:
            meldung = ""
        raise RuntimeError(f"Analyse fehlgeschlagen (OpenRouter {e.code}): {meldung or e.reason}"[:300]) from None
    except (urllib.error.URLError, TimeoutError) as e:
        raise RuntimeError(f"OpenRouter nicht erreichbar: {e}") from None
    text = ((antwort.get("choices") or [{}])[0].get("message") or {}).get("content") or ""
    return json_aus_text(text), float((antwort.get("usage") or {}).get("cost") or 0)


def json_aus_text(text: str) -> dict:
    """Erstes JSON-Objekt aus einer Modellantwort (auch in ```json-Blöcken)."""
    m = re.search(r"\{.*\}", text, re.S)
    if not m:
        raise RuntimeError("Die Analyse enthielt kein lesbares Ergebnis.")
    try:
        d = json.loads(m.group(0))
    except ValueError:
        raise RuntimeError("Die Analyse enthielt kein gültiges JSON.") from None
    if not isinstance(d, dict):
        raise RuntimeError("Die Analyse hat ein unerwartetes Format.")
    return d


def bericht(a: dict, dauer: float, titel: str) -> str:
    """Lesbare Fassung für den Chat-Kontext (der Assistent baut daraus den Bauplan)."""
    zeilen = [f"Titel: {titel or '–'} · Länge: {dauer:.1f} s · Format: {a.get('format', '–')}",
              f"Zusammenfassung: {a.get('zusammenfassung', '')}", f"Stil: {a.get('stil', '')}",
              f"Zielgruppe: {a.get('zielgruppe', '')}", f"Hook: {a.get('hook', '')}", f"CTA: {a.get('cta', '')}",
              f"Rhythmus: {a.get('rhythmus', '')}", f"Ton (vermutet): {a.get('ton_vermutung', '')}", "Szenen:"]
    for s in a.get("szenen") or []:
        zeilen.append(f"- Szene {s.get('nr')} ({s.get('von')}–{s.get('bis')} s, {s.get('zweck', '')}): {s.get('bild', '')}"
                      f" | Kamera: {s.get('kamera', '')}" + (f" | Text: {s['text_im_bild']}" if s.get("text_im_bild") else ""))
    if a.get("fremdmarken"):
        zeilen.append("Fremdmarken/Personen (NICHT übernehmen): " + ", ".join(map(str, a["fremdmarken"])))
    return "\n".join(zeilen)
