"""MULTI-LLM — Sprachausgabe (Text → Audio) über OpenRouter.

Katalog: GET /api/v1/models?output_modalities=speech. Stimmen stehen nicht in der API, sondern maschinenlesbar
in https://openrouter.ai/<modell>/llms.txt (Zeile „- voice: "a" | "b" …“). Erzeugung: POST /api/v1/audio/speech.
Feinjustierung wie in PROMPTHEUS: Tempo, Tiefe, Klarheit, Lautstärke — beim Speichern per ffmpeg eingerechnet.
Nur Standardbibliothek.
"""
from __future__ import annotations

import json
import re
import struct
import subprocess
import time
import urllib.error
import urllib.request
from pathlib import Path

REGLER = {  # gleiche Bereiche wie PU_STIMM_REGLER in PROMPTHEUS
    "tempo": {"wort": "Tempo", "min": 70, "max": 130, "vorgabe": 100, "einheit": "%"},
    "tiefe": {"wort": "Tiefe", "min": -12, "max": 12, "vorgabe": 0, "einheit": "dB"},
    "klarheit": {"wort": "Klarheit", "min": -12, "max": 12, "vorgabe": 0, "einheit": "dB"},
    "laut": {"wort": "Lautstärke", "min": 30, "max": 130, "vorgabe": 100, "einheit": "%"},
}
MAX_TEXT = 5000
PROBE_TEXT = "Hallo, so klinge ich. Diese kurze Probe hilft dir, die passende Stimme zu finden."
FLAGS = getattr(subprocess, "CREATE_NO_WINDOW", 0)
BESCHREIBUNG = {
    "x-ai/grok-voice-tts-1.0": "Grok-Stimmen eve, ara, rex, sal, leo – 20+ Sprachen",
    "google/gemini-3.8-flash-tts": "30 Google-Stimmen, sehr natürlich",
    "google/gemini-3.8-flash-lite-tts": "Gemini-TTS schnell und günstig",
    "google/gemini-3.1-flash-tts-preview": "Gemini-TTS Vorschau",
    "deepgram/flux-tts:free": "Kostenlos, englische Stimmen",
    "fish-audio/s2.1-pro-free:free": "Kostenlos, mehrsprachig",
    "fish-audio/s2.1-pro": "Ausdrucksstark, mehrsprachig",
    "minimax/speech-2.8-hd": "Hohe Qualität, viele Stimmen",
    "minimax/speech-2.8-turbo": "MiniMax schnell",
    "microsoft/mai-voice-2": "Ausdrucksstarke Microsoft-Stimmen",
    "microsoft/mai-voice-2-flash": "Microsoft schnell, u. a. deutsche Stimme",
    "hexgrad/kokoro-82m": "Sehr günstig, viele Stimmen",
    "mistralai/voxtral-mini-tts-2603": "Mistral, mehrsprachig",
    "qwen/qwen-audio-3.0-tts-flash": "Qwen schnell",
}


def klang_saeubern(k: dict | None) -> dict:
    """Werte auf ihren Bereich stutzen statt abweisen (wie PROMPTHEUS)."""
    k = k or {}
    out = {}
    for name, r in REGLER.items():
        try:
            v = float(k.get(name, r["vorgabe"]))
        except (TypeError, ValueError):
            v = r["vorgabe"]
        out[name] = int(round(max(r["min"], min(r["max"], v))))
    return out


def klang_filter(k: dict) -> str:
    """ffmpeg-Filterkette; leer, wenn alles auf Werk steht."""
    k = klang_saeubern(k)
    teile = []
    if k["tempo"] != 100:
        teile.append(f"atempo={k['tempo'] / 100:.2f}")        # Tempo ohne Tonhöhenänderung
    if k["tiefe"]:
        teile.append(f"bass=g={k['tiefe']}:f=220")           # wie der Lowshelf in PROMPTHEUS
    if k["klarheit"]:
        teile.append(f"treble=g={k['klarheit']}:f=3200")     # wie der Highshelf in PROMPTHEUS
    if k["laut"] != 100:
        teile.append(f"volume={k['laut'] / 100:.2f}")
    return ",".join(teile)


def klang_einrechnen(ffmpeg: str, quelle: Path, ziel: Path, k: dict) -> None:
    """Rechnet die Regler in eine MP3-Datei ein. Ohne Einstellung wird nur kopiert (kein Qualitätsverlust)."""
    filt = klang_filter(k)
    if not filt and quelle.suffix.lower() == ".mp3":
        ziel.write_bytes(quelle.read_bytes())
        return
    if not ffmpeg:
        raise RuntimeError("Für die Klang-Einstellung wird ffmpeg gebraucht (Einstellungen → Assistent).")
    args = [ffmpeg, "-hide_banner", "-nostdin", "-loglevel", "error", "-y", "-i", str(quelle)]
    if filt:
        args += ["-af", filt]
    args += ["-c:a", "libmp3lame", "-q:a", "2", str(ziel)]
    try:
        r = subprocess.run(args, capture_output=True, timeout=180, creationflags=FLAGS)
    except (OSError, subprocess.TimeoutExpired) as e:
        raise RuntimeError(f"ffmpeg: {e}") from None
    if r.returncode != 0 or not ziel.is_file():
        raise RuntimeError("ffmpeg konnte den Klang nicht einrechnen: " + r.stderr.decode("utf-8", "replace")[-200:])


def dauer(ffprobe: str, datei: Path) -> float:
    if not ffprobe:
        return 0.0
    try:
        r = subprocess.run([ffprobe, "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(datei)],
                           capture_output=True, timeout=30, creationflags=FLAGS)
        return round(float(r.stdout.decode().strip()), 2)
    except (OSError, subprocess.TimeoutExpired, ValueError):
        return 0.0


def pcm_als_wav(pcm: bytes, rate: int = 24000) -> bytes:
    """Rohes 16-bit-Mono-PCM in einen WAV-Rahmen setzen (falls ein Anbieter kein MP3 liefert)."""
    return (b"RIFF" + struct.pack("<I", 36 + len(pcm)) + b"WAVEfmt " + struct.pack("<IHHIIHH", 16, 1, 1, rate, rate * 2, 2, 16)
            + b"data" + struct.pack("<I", len(pcm)) + pcm)


# --------------------------------------------------------------------------- Katalog & Stimmen
def stimmen_aus_llms(text: str) -> tuple[list[str], str]:
    """Aus llms.txt: (Liste der Stimmen, Beispielstimme). Leere Liste = freie Eingabe."""
    liste: list[str] = []
    for zeile in text.splitlines():
        m = re.match(r'^\s*-\s*voice:\s*(.+)$', zeile)
        if m:
            teil = m.group(1).split(" (", 1)[0]
            liste = re.findall(r'"([^"]{1,80})"', teil)
            break
    bsp = re.search(r'"voice":\s*"([^"]{1,80})"', text)
    return liste, (bsp.group(1) if bsp else (liste[0] if liste else ""))


def klonen_moeglich(endpunkte: dict) -> bool:
    """Aus /models/<id>/endpoints: unterstützt mindestens ein Anbieter das Stimmenklonen?"""
    return any(e.get("supports_voice_cloning") for e in ((endpunkte or {}).get("data") or {}).get("endpoints") or [])


def modell_aufbereiten(m: dict, stimmen: list[str], beispiel: str, anbieter: dict, klonen: bool = False) -> dict:
    mid = m["id"]
    slug = mid.split("/", 1)[0]
    name = m.get("name") or mid
    if ": " in name:
        name = name.split(": ", 1)[1]
    try:
        je_zeichen = float((m.get("pricing") or {}).get("prompt") or 0)
    except (TypeError, ValueError):
        je_zeichen = 0.0
    return {"id": mid, "name": name, "anbieter": anbieter.get(slug, slug), "erstellt": m.get("created") or 0,
            "beschreibung": BESCHREIBUNG.get(mid) or (m.get("description") or "")[:120],
            "je_zeichen": je_zeichen, "frei": je_zeichen == 0, "stimmen": stimmen,
            "stimme_frei": not stimmen, "beispiel_stimme": beispiel, "klonen": bool(klonen)}


def llms_laden(mid: str, timeout: int = 20) -> str:
    # Ohne eigenen User-Agent antwortet openrouter.ai hier mit 403 (Python-Standard wird geblockt).
    req = urllib.request.Request(f"https://openrouter.ai/{mid}/llms.txt", headers={"User-Agent": "MULTI-LLM/1.0 (+http://127.0.0.1)"})
    for versuch in range(2):          # ein kurzer zweiter Versuch – ein Aussetzer soll keine Stimmenliste kosten
        try:
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.read(400_000).decode("utf-8", "replace")
        except (urllib.error.URLError, TimeoutError, ValueError):
            if versuch == 0:
                time.sleep(1.5)
    return ""                         # "" = Abruf gescheitert (akatalog_laden behält dann die alte Liste)


def kosten(m: dict, zeichen: int) -> float:
    return round(m.get("je_zeichen", 0) * max(0, zeichen), 6)


# --------------------------------------------------------------------------- Erzeugung
def referenzen(probe: bytes, mime: str, transkript: str = "") -> list:
    """input_references für das Stimmenklonen: eine Stimmprobe (+ optional ihre Abschrift)."""
    import base64
    fmt = {"audio/mpeg": "mp3", "audio/wav": "wav"}.get(mime, "mp3")
    teile: list = [{"type": "input_audio", "input_audio": {
        "data": f"data:{mime};base64," + base64.b64encode(probe).decode("ascii"), "format": fmt}}]
    if transkript.strip():
        teile.append({"type": "text", "text": transkript.strip()[:10000]})
    return teile


def probe_normalisieren(ffmpeg: str, quelle: Path, ziel: Path) -> None:
    """Stimmprobe → MP3 mono 44,1 kHz, höchstens 30 s (reicht fürs Klonen, bleibt klein)."""
    if not ffmpeg:
        raise RuntimeError("Für Stimmproben wird ffmpeg gebraucht (Einstellungen → Assistent).")
    r = subprocess.run([ffmpeg, "-hide_banner", "-nostdin", "-loglevel", "error", "-y", "-i", str(quelle), "-t", "30",
                        "-vn", "-ac", "1", "-ar", "44100", "-c:a", "libmp3lame", "-q:a", "3", str(ziel)],
                       capture_output=True, timeout=120, creationflags=FLAGS)
    if r.returncode != 0 or not ziel.is_file():
        raise RuntimeError("Die Stimmprobe ist nicht lesbar: " + r.stderr.decode("utf-8", "replace")[-160:])


FORMAT_PFLICHT: dict[str, str] = {}      # Modell → Format, das es statt MP3 verlangt (Gemini TTS: nur "pcm")
FORMATE = ("mp3", "pcm", "wav", "opus", "flac", "aac")


class FormatFalsch(RuntimeError):
    def __init__(self, fmt: str):
        super().__init__(fmt)
        self.fmt = fmt


def sprechen(key: str, modell: str, text: str, stimme: str, basis: str,
             refs: list | None = None) -> tuple[bytes, str, str]:
    """POST /audio/speech → (Audio-Bytes, Content-Type, Generation-Id). refs = geklonte Stimme.
    Immer zuerst MP3 (spart das Umwandeln). Lehnt ein Modell MP3 ab (Gemini TTS kann nur PCM), wird das Format
    gemerkt und sofort neu angefragt; PCM wird danach wie jedes WAV per ffmpeg zu MP3."""
    fmt = FORMAT_PFLICHT.get(modell, "mp3")
    try:
        return _sprechen(key, modell, text, stimme, basis, refs, fmt)
    except FormatFalsch as e:
        FORMAT_PFLICHT[modell] = e.fmt
        return _sprechen(key, modell, text, stimme, basis, refs, e.fmt)


def _sprechen(key: str, modell: str, text: str, stimme: str, basis: str, refs: list | None,
              fmt: str) -> tuple[bytes, str, str]:
    koerper = {"model": modell, "input": text, "response_format": fmt}
    if stimme:
        koerper["voice"] = stimme
    if refs:
        koerper["input_references"] = refs
    req = urllib.request.Request(basis + "/audio/speech", data=json.dumps(koerper).encode(), method="POST", headers={
        "Authorization": "Bearer " + key, "Content-Type": "application/json",
        "HTTP-Referer": "http://127.0.0.1", "X-Title": "MULTI-LLM"})
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            daten = r.read(60 * 1024 * 1024)
            art = r.headers.get("Content-Type", "")
            gid = r.headers.get("X-Generation-Id", "")
    except urllib.error.HTTPError as e:
        roh = e.read().decode("utf-8", "replace")
        try:
            meldung = json.loads(roh).get("error", {}).get("message", "")
        except ValueError:
            meldung = roh[:200]
        verlangt = re.search(r'supports\s+response_format\s*=\s*"?(\w+)', meldung or "")
        if e.code == 400 and verlangt and verlangt.group(1) in FORMATE and verlangt.group(1) != fmt:
            raise FormatFalsch(verlangt.group(1)) from None
        raise RuntimeError(f"OpenRouter {e.code}: {meldung or e.reason}"[:300]) from None
    except (urllib.error.URLError, TimeoutError) as e:
        raise RuntimeError(f"OpenRouter nicht erreichbar: {e}") from None
    if art.startswith("application/json"):
        try:
            meldung = json.loads(daten).get("error", {}).get("message", "")
        except ValueError:
            meldung = ""
        raise RuntimeError(f"Keine Audiodaten: {meldung or 'unbekannter Fehler'}"[:300])
    if not daten:
        raise RuntimeError("Leere Antwort ohne Audiodaten.")
    if daten[:4] == b"RIFF":
        art = "audio/wav"
    elif fmt == "pcm" or "pcm" in art or "l16" in art.lower():
        rate = re.search(r"rate=(\d+)", art)          # Gemini: 24 kHz, 16 bit, mono
        daten, art = pcm_als_wav(daten, int(rate.group(1)) if rate else 24000), "audio/wav"
    return daten, art, gid
