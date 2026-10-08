#!/usr/bin/env python3
"""PROMPTHEUS Cinema Studio (vormals MULTI-LLM) — lokaler Server (nur Python-Standardbibliothek).

Oberfläche: web/ · Daten: data/ · Anschluss: OpenRouter /api/v1/images.
Der OpenRouter-Schlüssel verlässt den Server nie; er kommt aus der Umgebung
(zsec-fähig) oder aus der .env neben dieser Datei.
"""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import math
import os
import re
import secrets
import shutil
import subprocess
import threading
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
from http import cookies
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, quote, unquote, urlparse

import assistent
import audio
import klon
import lokal_stimme
import zugang

ROOT = Path(__file__).resolve().parent
WEB = ROOT / "web"
DATA = Path(os.environ.get("BILDGEN_DATA") or (ROOT / "data"))
OR_BASE = "https://openrouter.ai/api/v1"

MAX_BODY = 40 * 1024 * 1024          # JSON-Körper inkl. Base64-Uploads
MAX_UPLOAD = 12 * 1024 * 1024        # je Referenzbild (dekodiert)
SESSION_TTL = 12 * 3600
KATALOG_TTL = 24 * 3600
ID_RE = re.compile(r"^[a-z0-9]{6,40}$")

LOCK = threading.RLock()


# --------------------------------------------------------------------------- Hilfen
def jetzt() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def neue_id(n: int = 12) -> str:
    return secrets.token_hex(n // 2 + 1)[:n]


def pfad(name: str) -> Path:
    return DATA / name


def lies_json(name: str, default):
    p = pfad(name)
    with LOCK:
        if not p.is_file():
            return default
        try:
            return json.loads(p.read_text("utf-8"))
        except (OSError, ValueError):
            return default


def schreib_json(name: str, daten) -> None:
    p = pfad(name)
    with LOCK:
        p.parent.mkdir(parents=True, exist_ok=True)
        tmp = p.with_suffix(p.suffix + ".tmp")
        tmp.write_text(json.dumps(daten, ensure_ascii=False, indent=1), "utf-8")
        os.replace(tmp, p)


def verzeichnisse() -> None:
    for d in ("bilder", "cache"):
        (DATA / d).mkdir(parents=True, exist_ok=True)


def lade_env() -> dict:
    env = {}
    f = ROOT / ".env"
    if f.is_file():
        for zeile in f.read_text("utf-8", errors="replace").splitlines():
            zeile = zeile.strip()
            if not zeile or zeile.startswith("#") or "=" not in zeile:
                continue
            k, v = zeile.split("=", 1)
            env[k.strip()] = v.strip().strip('"').strip("'")
    return env


def env(key: str, default: str = "") -> str:
    return os.environ.get(key) or lade_env().get(key) or default


def setze_env(key: str, wert: str) -> None:
    f = ROOT / ".env"
    zeilen = f.read_text("utf-8").splitlines() if f.is_file() else []
    gefunden = False
    for i, z in enumerate(zeilen):
        if re.match(r"^\s*" + re.escape(key) + r"\s*=", z):
            zeilen[i] = f"{key}={wert}"
            gefunden = True
    if not gefunden:
        zeilen.append(f"{key}={wert}")
    f.write_text("\n".join(zeilen) + "\n", "utf-8")


SCHUTZ_PLATZHALTER = "schutzschicht"   # die Schutzschicht verwirft ihn und setzt den Schlüssel der Werkstatt ein


def or_basis() -> str:
    """OpenRouter direkt — oder, aus der Werkstatt gestartet, über deren Schutzschicht (zugang.bindung)."""
    schutz = zugang.bindung()["schutzschicht"]
    return f"{schutz}/v1" if schutz else OR_BASE


def api_key() -> str:
    if zugang.bindung()["schutzschicht"]:
        return SCHUTZ_PLATZHALTER
    return env("OPENROUTER_API_KEY") or env("API_KEY_OPENROUTER")


def key_quelle() -> str:
    if zugang.bindung()["schutzschicht"]:
        return "werkstatt"
    if os.environ.get("OPENROUTER_API_KEY") or os.environ.get("API_KEY_OPENROUTER"):
        return "umgebung"
    e = lade_env()
    if e.get("OPENROUTER_API_KEY") or e.get("API_KEY_OPENROUTER"):
        return "env-datei"
    return ""


def bild_typ(daten: bytes) -> tuple[str, str] | None:
    """Erkennt das Format an den ersten Bytes → (mime, endung)."""
    if daten.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png", "png"
    if daten.startswith(b"\xff\xd8\xff"):
        return "image/jpeg", "jpg"
    if daten[:4] == b"RIFF" and daten[8:12] == b"WEBP":
        return "image/webp", "webp"
    if daten[:6] in (b"GIF87a", b"GIF89a"):
        return "image/gif", "gif"
    if daten[4:8] == b"ftyp":
        return ("video/quicktime", "mov") if daten[8:12] == b"qt  " else ("video/mp4", "mp4")
    if daten.startswith(b"\x1a\x45\xdf\xa3"):
        return "video/webm", "webm"
    if daten.startswith(b"ID3") or (len(daten) > 1 and daten[0] == 0xFF and daten[1] & 0xE0 == 0xE0):
        return "audio/mpeg", "mp3"
    if daten[:4] == b"RIFF" and daten[8:12] == b"WAVE":
        return "audio/wav", "wav"
    if daten[:4] == b"OggS":
        return "audio/ogg", "ogg"
    if daten[:4] == b"fLaC":
        return "audio/flac", "flac"
    kopf = daten[:512].lstrip().lower()
    if kopf.startswith(b"<svg") or (kopf.startswith(b"<?xml") and b"<svg" in daten[:2048].lower()):
        return "image/svg+xml", "svg"
    return None


def bild_masse(daten: bytes) -> tuple[int, int]:
    """Breite/Höhe aus PNG-, JPEG- oder WebP-Kopf; (0, 0) wenn unbekannt."""
    try:
        if daten.startswith(b"\x89PNG"):
            return int.from_bytes(daten[16:20], "big"), int.from_bytes(daten[20:24], "big")
        if daten[:4] == b"RIFF" and daten[8:12] == b"WEBP":
            art = daten[12:16]
            if art == b"VP8X":
                return 1 + int.from_bytes(daten[24:27], "little"), 1 + int.from_bytes(daten[27:30], "little")
            if art == b"VP8 ":
                return int.from_bytes(daten[26:28], "little") & 0x3FFF, int.from_bytes(daten[28:30], "little") & 0x3FFF
            if art == b"VP8L":
                b = int.from_bytes(daten[21:25], "little")
                return (b & 0x3FFF) + 1, ((b >> 14) & 0x3FFF) + 1
        if daten.startswith(b"\xff\xd8"):
            i = 2
            while i < len(daten) - 9:
                if daten[i] != 0xFF:
                    i += 1
                    continue
                marke = daten[i + 1]
                laenge = int.from_bytes(daten[i + 2:i + 4], "big")
                if marke in (0xC0, 0xC1, 0xC2):
                    return int.from_bytes(daten[i + 7:i + 9], "big"), int.from_bytes(daten[i + 5:i + 7], "big")
                i += 2 + laenge
    except (IndexError, ValueError):
        pass
    return 0, 0


def video_masse(daten: bytes) -> tuple[int, int, float]:
    """Breite, Höhe, Dauer (s) aus den MP4-Boxen tkhd/mvhd; Nullen, wenn nicht lesbar."""
    breite = hoehe = 0
    dauer = 0.0
    try:
        i = daten.find(b"mvhd")
        if i > 0:
            v = daten[i + 4]
            if v == 1:
                skala = int.from_bytes(daten[i + 24:i + 28], "big")
                laenge = int.from_bytes(daten[i + 28:i + 36], "big")
            else:
                skala = int.from_bytes(daten[i + 16:i + 20], "big")
                laenge = int.from_bytes(daten[i + 20:i + 24], "big")
            if skala:
                dauer = round(laenge / skala, 2)
        start = 0
        while True:
            i = daten.find(b"tkhd", start)
            if i < 0:
                break
            v = daten[i + 4]
            o = i + 4 + (88 if v == 1 else 76)       # Breite/Höhe (16.16) am Ende der tkhd-Box
            w = int.from_bytes(daten[o:o + 4], "big") >> 16
            h = int.from_bytes(daten[o + 4:o + 8], "big") >> 16
            if w and h:
                breite, hoehe = w, h
                break
            start = i + 4
    except (IndexError, ValueError):
        pass
    return breite, hoehe, dauer


# --------------------------------------------------------------------------- Konten
# Keine Anmeldung, keine Passwörter (06.10.2026): Der Einlass aus der Werkstatt führt immer in
# das eine Konto „werkstatt“. Andere Konten in benutzer.json bleiben liegen, sind aber nicht erreichbar.
def benutzer() -> dict:
    return lies_json("benutzer.json", {})


def werkstatt_konto() -> dict:
    """Das Konto hinter dem Einlass; wird beim ersten Einlass angelegt (Administrator, ohne Passwort)."""
    with LOCK:
        alle = benutzer()
        if zugang.KONTO not in alle:
            alle[zugang.KONTO] = {"name": zugang.KONTO_NAME, "email": "", "rolle": "admin", "erstellt": jetzt()}
            schreib_json("benutzer.json", alle)
        return alle[zugang.KONTO]


def oeffentlich(u: dict, name: str) -> dict:
    return {"benutzer": name, "name": u.get("name") or name, "email": u.get("email", ""),
            "rolle": u.get("rolle", "nutzer"), "erstellt": u.get("erstellt", "")}


SITZUNGEN: dict[str, dict] = {}


def sitzung_neu(name: str) -> tuple[str, str]:
    token, csrf = secrets.token_urlsafe(32), secrets.token_urlsafe(24)
    with LOCK:
        SITZUNGEN[token] = {"benutzer": name, "csrf": csrf, "bis": time.time() + SESSION_TTL}
    return token, csrf


# --------------------------------------------------------------------------- Einstellungen
STANDARD_EMPFOHLEN = [
    "openai/gpt-image-2.5-sunburst", "openai/gpt-image-2.5-flare", "openai/gpt-image-2",
    "bytedance-seed/seedream-5-0-pro", "bytedance-seed/seedream-5-0-lite", "bytedance-seed/seedream-4.5",
    "google/gemini-3-pro-image", "google/gemini-3.1-flash-image", "black-forest-labs/flux.2-pro",
    "x-ai/grok-imagine-image-2.0", "qwen/qwen-image-3-pro", "recraft/recraft-v4.1-pro",
]
STANDARD_EMPFOHLEN_VIDEO = [
    "google/veo-3.1", "google/veo-3.1-fast", "google/veo-3.1-lite", "openai/sora-2-pro",
    "kwaivgi/kling-v3.0-pro", "kwaivgi/kling-v3.0-std", "bytedance/seedance-2.0", "bytedance/seedance-2.0-fast",
    "minimax/hailuo-3", "runway/gen-4.5", "alibaba/wan-3.0", "x-ai/grok-imagine-video-1.5",
]


def einstellungen() -> dict:
    s = lies_json("einstellungen.json", {})
    s.setdefault("standard_modell", "openai/gpt-image-2.5-flare")
    s.setdefault("empfohlen", list(STANDARD_EMPFOHLEN))
    s.setdefault("waehrung", "USD")
    s.setdefault("eur_kurs", 0.86)
    s.setdefault("anpassung", "strecken")   # fehlendes Format (4:5): strecken | zuschneiden
    s.setdefault("standard_video", "google/veo-3.1-fast")
    s.setdefault("empfohlen_video", list(STANDARD_EMPFOHLEN_VIDEO))
    s.setdefault("video_takt", 15)
    s.setdefault("startbild_anpassung", "ki")        # ki | zuschneiden | aus
    if s["startbild_anpassung"] not in ("ki", "zuschneiden", "aus"):
        s["startbild_anpassung"] = "ki"
    # Seitenchat
    s.setdefault("assistent_claude", True)             # Claude-CLI (Abo) als Gehirn
    s.setdefault("assistent_claude_modell", "sonnet")
    s.setdefault("assistent_or_modell", "google/gemini-3.8-flash")
    s.setdefault("assistent_vision_modell", "google/gemini-3.8-flash")
    s.setdefault("assistent_rueckfall", True)          # bei CLI-Fehler auf OpenRouter ausweichen
    s.setdefault("assistent_auto", False)              # Vorschläge automatisch ins Eingabefeld
    s.setdefault("assistent_sprache", "englisch")      # Sprache der Prompts
    s.setdefault("claude_pfad", "")
    # Video-Clone
    s.setdefault("klon_modell", "google/gemini-3.8-flash")
    s.setdefault("ffmpeg_pfad", "")
    s.setdefault("ytdlp_pfad", "")
    # Audio & Ablage
    s.setdefault("standard_audio", "x-ai/grok-voice-tts-1.0")
    s.setdefault("stimmprofile", [dict(p) for p in PROFIL_VORGABE])
    s.setdefault("ablage_pfad", "")
    return s


# --------------------------------------------------------------------------- Modellkatalog
BESCHREIBUNG = {
    "openai/gpt-image-2.5-sunburst": "Höchste Qualität, präzise Bearbeitung",
    "openai/gpt-image-2.5-flare": "Starke Alltagsbilder, schnell",
    "openai/gpt-image-2": "Nahezu perfekte Schrift im Bild",
    "openai/gpt-image-1": "Bewährtes OpenAI-Bildmodell",
    "openai/gpt-image-1-mini": "Günstig und schnell",
    "bytedance-seed/seedream-5-0-pro": "Logisch stimmige Bilder mit Bildverständnis",
    "bytedance-seed/seedream-5-0-lite": "Schnelle Erzeugung mit Bildverständnis",
    "bytedance-seed/seedream-4.5": "ByteDance-Modell in 4K",
    "google/gemini-3-pro-image": "Nano Banana Pro – Googles Spitzenmodell",
    "google/gemini-3.1-flash-image": "Nano Banana 2 – schnell, bis 4K",
    "google/gemini-3.1-flash-lite-image": "Nano Banana 2 Lite – sehr günstig",
    "google/gemini-2.5-flash-image": "Nano Banana – schnelle Bearbeitung",
    "black-forest-labs/flux.2-pro": "Fotorealismus mit feiner Kontrolle",
    "black-forest-labs/flux.2-max": "FLUX in höchster Güte",
    "black-forest-labs/flux.2-flex": "Flexibel, gut für Typografie",
    "black-forest-labs/flux.2-klein-4b": "Kleines, sehr günstiges FLUX",
    "x-ai/grok-imagine-image-2.0": "Kreativ und schnell",
    "x-ai/grok-imagine-image-quality": "Grok mit Fokus auf Qualität",
    "qwen/qwen-image-3-pro": "Stark bei Text und Layout",
    "qwen/qwen-image-3": "Vielseitig und günstig",
    "recraft/recraft-v4.1-pro": "Design, Illustration, Markenbilder",
    "recraft/recraft-v4.1": "Design und Illustration",
    "sourceful/riverflow-v2.5-pro": "Produktbilder mit freigestelltem Hintergrund",
    "microsoft/mai-image-2.6": "Fotorealistische Szenen",
    "krea/krea-2-large": "Ästhetische, künstlerische Bilder",
}

ANBIETER = {
    "openai": "OpenAI", "google": "Google", "bytedance-seed": "ByteDance", "black-forest-labs": "Black Forest Labs",
    "x-ai": "xAI", "qwen": "Qwen", "recraft": "Recraft", "sourceful": "Sourceful", "microsoft": "Microsoft",
    "krea": "Krea", "meta": "Meta", "inclusionai": "inclusionAI",
}

KATALOG: dict = {"modelle": [], "stand": 0, "fehler": ""}
KATALOG_LAUF = threading.Lock()


def or_anfrage(pfad_: str, daten: dict | None = None, timeout: int = 30, mit_key: bool = True) -> dict:
    """HTTP-Aufruf an OpenRouter. Fehler werden als RuntimeError mit lesbarer Meldung geworfen."""
    kopf = {"Content-Type": "application/json", "HTTP-Referer": "http://127.0.0.1", "X-Title": "MULTI-LLM"}
    if mit_key:
        k = api_key()
        if not k:
            raise RuntimeError("Kein OpenRouter-Schlüssel hinterlegt (Einstellungen → Anschluss).")
        kopf["Authorization"] = "Bearer " + k
    koerper = json.dumps(daten).encode("utf-8") if daten is not None else None
    req = urllib.request.Request(or_basis() + pfad_, data=koerper, headers=kopf, method="POST" if koerper else "GET")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        text = e.read().decode("utf-8", errors="replace")
        try:
            meldung = json.loads(text).get("error", {}).get("message") or text
        except ValueError:
            meldung = text
        raise RuntimeError(f"OpenRouter {e.code}: {str(meldung)[:400]}") from None
    except (urllib.error.URLError, TimeoutError) as e:
        if zugang.bindung()["schutzschicht"]:
            raise RuntimeError("Die Werkstatt antwortet nicht. Ist ihr Fenster noch offen? Sonst die Werkstatt "
                               "aus der Academy wieder öffnen und es dann noch einmal versuchen.") from None
        raise RuntimeError(f"OpenRouter nicht erreichbar: {e}") from None


def _param(sp: dict, name: str):
    p = (sp or {}).get(name)
    if not isinstance(p, dict):
        return None
    if p.get("type") == "enum":
        return {"typ": "liste", "werte": p.get("values", [])}
    if p.get("type") == "range":
        return {"typ": "bereich", "min": p.get("min", 0), "max": p.get("max", 0)}
    return {"typ": "schalter"}


def modell_aufbereiten(m: dict, endpunkte: list) -> dict:
    mid = m["id"]
    anbieter_slug = mid.split("/", 1)[0]
    name = m.get("name") or mid
    if ": " in name:
        name = name.split(": ", 1)[1]
    sp = m.get("supported_parameters") or {}
    preise = {}
    if endpunkte:
        for p in endpunkte[0].get("pricing") or []:
            preise[p.get("billable")] = {"einheit": p.get("unit"), "usd": float(p.get("cost_usd") or 0)}
    return {
        "id": mid,
        "name": name,
        "anbieter": ANBIETER.get(anbieter_slug, anbieter_slug),
        "beschreibung": BESCHREIBUNG.get(mid) or f"Bildmodell von {ANBIETER.get(anbieter_slug, anbieter_slug)}",
        "erstellt": m.get("created") or 0,
        "referenzbilder": "image" in (m.get("architecture") or {}).get("input_modalities", []),
        "parameter": {k: _param(sp, k) for k in ("aspect_ratio", "resolution", "quality", "n",
                                                  "input_references", "background", "seed")
                      if _param(sp, k)},
        "preise": preise,
    }


def katalog_laden(erzwingen: bool = False) -> dict:
    cache = pfad("cache/modelle.json")
    if not erzwingen and not KATALOG["modelle"] and cache.is_file():
        try:
            KATALOG.update(json.loads(cache.read_text("utf-8")))
        except ValueError:
            pass
    if not erzwingen and KATALOG["modelle"] and time.time() - KATALOG["stand"] < KATALOG_TTL:
        return KATALOG
    if not KATALOG_LAUF.acquire(blocking=False):
        return KATALOG
    try:
        liste = or_anfrage("/images/models", mit_key=False).get("data", [])
        liste = [m for m in liste if not m["id"].startswith("openrouter/")]

        def ep(m):
            try:
                return or_anfrage(f"/images/models/{m['id']}/endpoints", mit_key=False, timeout=20).get("endpoints", [])
            except RuntimeError:
                return []

        with ThreadPoolExecutor(8) as pool:
            eps = list(pool.map(ep, liste))
        KATALOG.update({"modelle": [modell_aufbereiten(m, e) for m, e in zip(liste, eps)],
                        "stand": time.time(), "fehler": ""})
        schreib_json("cache/modelle.json", KATALOG)
    except RuntimeError as e:
        KATALOG["fehler"] = str(e)
    finally:
        KATALOG_LAUF.release()
    return KATALOG


def modell(mid: str) -> dict | None:
    for m in katalog_laden()["modelle"]:
        if m["id"] == mid:
            return m
    return None


# --------------------------------------------------------------------------- Kosten
MP = {"512": 0.26, "1K": 1.05, "2K": 4.19, "4K": 16.78}
OPENAI_TOKENS = {"low": 272, "medium": 1056, "high": 4160, "xhigh": 6240, "max": 8320, "auto": 1056}


def tokens_je_bild(mid: str, aufl: str, qual: str) -> int:
    if mid.startswith("openai/"):
        return OPENAI_TOKENS.get(qual or "auto", 1056)
    if mid.startswith("google/"):
        if "2.5-flash" in mid:
            return 1290
        return {"512": 747, "1K": 1120, "2K": 1120 if "3-pro" in mid else 1680, "4K": 2000 if "3-pro" in mid else 2520}.get(aufl or "1K", 1120)
    return 4175


def kosten_schluessel(mid: str, aufl: str, qual: str) -> str:
    return f"{mid}|{aufl or '-'}|{qual or '-'}"


def schaetzen(m: dict, aufl: str, qual: str, anzahl: int, prompt_len: int = 0, refs: int = 0) -> dict:
    """Schätzt Kosten und Tokens. Ein gemessener Mittelwert ersetzt die Schätzung je Bild."""
    anzahl = max(1, min(int(anzahl or 1), 10))
    preise = m.get("preise") or {}
    aus = preise.get("output_image") or {}
    toks = tokens_je_bild(m["id"], aufl, qual)
    einheit = aus.get("einheit")
    if einheit == "megapixel":
        je_bild = aus["usd"] * MP.get(aufl or "1K", 1.05)
    elif einheit == "image":
        je_bild = aus["usd"]
    elif einheit == "token":
        je_bild = aus["usd"] * toks
    else:
        je_bild = 0.0
    eingabe = 0.0
    if preise.get("input_text", {}).get("einheit") == "token":
        eingabe += preise["input_text"]["usd"] * max(prompt_len, 1) / 4
    if refs and preise.get("input_image", {}).get("einheit") == "token":
        eingabe += preise["input_image"]["usd"] * 1000 * refs
    quelle = "schaetzung" if einheit else "unbekannt"
    gemessen = lies_json("kosten_mittel.json", {}).get(kosten_schluessel(m["id"], aufl, qual))
    if gemessen and gemessen.get("anzahl", 0) > 0:
        je_bild = gemessen["summe"] / gemessen["anzahl"]
        eingabe = 0.0
        quelle = "gemessen"
    return {"je_bild": round(je_bild + eingabe, 5), "gesamt": round((je_bild + eingabe) * anzahl, 5),
            "tokens": toks * anzahl, "quelle": quelle, "anzahl": anzahl}


def kosten_merken(mid: str, aufl: str, qual: str, usd_je_bild: float) -> None:
    with LOCK:
        d = lies_json("kosten_mittel.json", {})
        k = kosten_schluessel(mid, aufl, qual)
        e = d.get(k, {"summe": 0.0, "anzahl": 0})
        # gleitend: nur die letzten ~20 Werte zählen
        if e["anzahl"] >= 20:
            e["summe"] *= 19 / e["anzahl"]
            e["anzahl"] = 19
        e["summe"] += usd_je_bild
        e["anzahl"] += 1
        d[k] = e
        schreib_json("kosten_mittel.json", d)


def verbrauch_schreiben(eintrag: dict) -> None:
    with LOCK:
        with open(pfad("verbrauch.jsonl"), "a", encoding="utf-8") as f:
            f.write(json.dumps(eintrag, ensure_ascii=False) + "\n")


# --------------------------------------------------------------------------- Bibliothek
def bilder() -> list:
    return lies_json("bilder.json", [])


def bild_finden(bid: str) -> dict | None:
    for b in bilder():
        if b["id"] == bid:
            return b
    return None


def bild_aendern(bid: str, owner: str, fn) -> dict | None:
    with LOCK:
        liste = bilder()
        for b in liste:
            if b["id"] == bid and b["owner"] == owner:
                fn(b)
                schreib_json("bilder.json", liste)
                return b
    return None


def darf_sehen(b: dict, name: str) -> bool:
    return b["owner"] == name or (b.get("veroeffentlicht") and not b.get("geloescht"))


# --------------------------------------------------------------------------- Ablage (strukturiert)
# Seit 08.10.2026 liegt alles, was Cinema Studio erzeugt und braucht, an EINEM Ort beim Programm – Namen klein:
#   <Programm>\ablage\bilder|videos|audio\JJJJ-MM\…   Ergebnisse
#   <Programm>\ablage\uploads\…                    eigene Fotos, Referenzbilder; uploads\clone = Videos für Video-Clone
#   <Programm>\ablage\vorlagen\bilder|videos\…    Vorlagen
#   <Programm>\data\…                              nur Zustand (Chats, Einstellungen, Listen)
TYP_ORDNER = {"bild": "bilder", "video": "videos", "audio": "audio"}

FRUEHERE_ABLAGE_IM_ARBEITSORDNER = "Cinema-Studio"      # bis 08.10.2026: <Werkstatt-Arbeitsordner>\Cinema-Studio


def ablage_wurzel() -> Path:
    """<Programm>\\ablage – eine andere Ablage nur über die Einstellung „ablage_pfad“ (Tests: BILDGEN_ABLAGE)."""
    pfad_ = str(einstellungen().get("ablage_pfad") or "").strip() or os.environ.get("BILDGEN_ABLAGE", "")
    return Path(pfad_) if pfad_ else ROOT / "ablage"


def uploads_ordner() -> Path:
    p = ablage_wurzel() / "uploads"
    p.mkdir(parents=True, exist_ok=True)
    return p


def clone_ordner() -> Path:
    """Hochgeladene Videos für Video-Clone – nur bis zur Analyse, danach gelöscht."""
    p = uploads_ordner() / "clone"
    p.mkdir(parents=True, exist_ok=True)
    return p


def nutzerordner(owner: str) -> str:
    """Unterordner je Konto in der Ablage. Das Werkstatt-Konto legt ohne Zwischenordner ab:
    <Ablage>\\Bilder|Videos|Audio\\JJJJ-MM\\… statt <Ablage>\\werkstatt\\Bilder\\…"""
    return "" if owner == zugang.KONTO else owner


def stichwort(text: str) -> str:
    wort = re.sub(r"[^a-z0-9äöüß]+", "-", (text or "").lower()).strip("-")
    return "-".join(wort.split("-")[:5])[:40].strip("-") or "ohne-titel"


def ablage_relativ(typ: str, erstellt: str, text: str, bid: str, endung: str, wurzel: Path | None = None,
                   owner: str = "") -> str:
    """Bilder/2026-09/2026-09-25_1830_moewe-am-meer_ab12cd.png — relativ zum Nutzerordner der Ablage.
    Würde der volle Pfad die Windows-Grenze (260 Zeichen) sprengen, entfällt das Stichwort."""
    zeit = datetime.fromisoformat(erstellt).astimezone()     # Ordner nach Ortszeit, wie der Nutzer sie kennt
    ordner = f"{TYP_ORDNER.get(typ, 'Bilder')}/{zeit:%Y-%m}"
    rel = f"{ordner}/{zeit:%Y-%m-%d_%H%M}_{stichwort(text)}_{bid}.{endung}"
    if wurzel is not None and len(str(wurzel / nutzerordner(owner) / rel)) > 240:
        rel = f"{ordner}/{zeit:%Y-%m-%d_%H%M}_{bid}.{endung}"
    return rel


def medium_pfad(b: dict) -> Path:
    """Datei eines Eintrags: neue Einträge liegen in der Ablage (datei mit '/'), alte noch in data/bilder."""
    d = str(b["datei"])
    if "/" in d:
        rel = Path(nutzerordner(b["owner"]), *d.split("/"))
        if b.get("wurzel"):
            p = Path(b["wurzel"]) / rel
            # Programmordner umbenannt oder verschoben (Bildgenerator → MULTI-LLM): der gespeicherte absolute
            # Pfad zeigt ins Leere, die Datei liegt aber in der aktuellen Ablage → dort nehmen.
            if p.is_file() or not (ablage_wurzel() / rel).is_file():
                return p
        return ablage_wurzel() / rel
    return DATA / "bilder" / d


def name_klein(name: str) -> str:
    """Einheitliche Ordner-/Dateinamen: klein, Umlaute ausgeschrieben, Leerzeichen → „-“ („Influencer Kühn“ → „influencer-kuehn“)."""
    s = name.strip().lower().replace("ä", "ae").replace("ö", "oe").replace("ü", "ue").replace("ß", "ss")
    return re.sub(r"\s+", "-", s)


def _gleich(a: Path, b: Path) -> bool:
    try:
        return a.exists() and b.exists() and os.path.samefile(a, b)
    except OSError:
        return False


def _umbenennen(p: Path, neu: str) -> Path:
    """Umbenennen, auch wenn sich nur Groß-/Kleinschreibung ändert (Windows: über einen Zwischennamen)."""
    if p.name == neu:
        return p
    zw = p.with_name(p.name + ".umbenennen")
    p.rename(zw)
    return zw.rename(p.with_name(neu))


def _zusammenfuehren(quelle: Path, ziel: Path, dateien_klein: bool) -> int:
    """Inhalt von quelle nach ziel verschieben (rekursiv), Ordnernamen klein; bei dateien_klein auch Dateinamen.
    Vorhandenes im Ziel wird nie überschrieben."""
    n = 0
    ziel.mkdir(parents=True, exist_ok=True)
    for p in sorted(quelle.iterdir()):
        neu = name_klein(p.name) if (p.is_dir() or dateien_klein) else p.name
        z = ziel / neu
        if _gleich(p, z):                       # derselbe Eintrag, nur anders geschrieben → an Ort und Stelle umbenennen
            p = _umbenennen(p, neu)
            if p.is_dir():
                n += _zusammenfuehren(p, p, dateien_klein)
            continue
        if p.is_dir():
            n += _zusammenfuehren(p, z, dateien_klein)
            try:
                p.rmdir()
            except OSError:
                pass
        elif not z.exists():
            shutil.move(str(p), str(z))
            n += 1
        else:
            print(f"Ablage: {p} nicht verschoben – {z} gibt es schon.", flush=True)
    return n


def _holen(p: Path, z: Path, dateien_klein: bool) -> int:
    """Ordner p nach z bringen. Ist es derselbe Ordner (nur anders geschrieben), wird er an Ort und Stelle umbenannt."""
    if _gleich(p, z):
        p = _umbenennen(p, z.name)
        return _zusammenfuehren(p, p, dateien_klein)
    n = _zusammenfuehren(p, z, dateien_klein)
    _leere_ordner_weg(p)
    return n


def _leere_ordner_weg(p: Path) -> None:
    if not p.is_dir():
        return
    for k in p.iterdir():
        if k.is_dir():
            _leere_ordner_weg(k)
    try:
        p.rmdir()
    except OSError:
        pass


def ablage_vereinheitlichen() -> int:
    """Einmalig beim Start: alles an den einen Ort <Programm>\\ablage holen und Namen klein schreiben.
    Quellen: frühere Ablage im Werkstatt-Arbeitsordner, <Programm>\\Ablage, data\\uploads, data\\klon_uploads.
    Danach zeigen die Einträge in bilder.json auf die neuen Pfade. Läuft ohne Fehler auch mehrfach."""
    ziel = ablage_wurzel()
    n = 0
    try:
        for p in ROOT.iterdir():               # <Programm>\\Ablage → ablage (nur Schreibweise)
            if p.is_dir() and p.name != "ablage" and p.name.lower() == "ablage" and _gleich(p, ziel):
                _umbenennen(p, "ablage")
        quellen = [ziel, ROOT / "Ablage"]
        ao = zugang.bindung()["arbeitsordner"]
        if ao:
            quellen.append(Path(ao) / FRUEHERE_ABLAGE_IM_ARBEITSORDNER)
        bekannt = {"bilder", "videos", "audio", "uploads"}
        for q in quellen:
            if not q.is_dir() or (q is not quellen[0] and _gleich(q, ziel)):
                continue
            ziel.mkdir(parents=True, exist_ok=True)
            for p in sorted(q.iterdir()):
                if not p.is_dir():
                    continue
                k = p.name.lower()
                if k in bekannt:
                    n += _holen(p, ziel / k, False)
                elif k == "vorlagen":
                    n += _holen(p, ziel / "vorlagen", True)
                elif not k.startswith(".") and any(c.is_dir() and c.name.lower() in bekannt for c in p.iterdir()):
                    for c in sorted(p.iterdir()):        # Nutzerordner <Ablage>\\<konto>\\Bilder …
                        if c.is_dir() and c.name.lower() in bekannt:
                            n += _holen(c, ziel / p.name / c.name.lower(), False)
            if not _gleich(q, ziel):
                _leere_ordner_weg(q)
        for alt, neu in ((DATA / "uploads", ziel / "uploads"), (DATA / "klon_uploads", ziel / "uploads" / "clone")):
            if alt.is_dir():
                n += _holen(alt, neu, False)
    except OSError as e:                     # ein Rest darf den Start nie verhindern
        print(f"Ablage: nicht alles einsortiert ({e}).", flush=True)
    with LOCK:
        liste = bilder()
        geaendert = False
        for b in liste:
            d = str(b.get("datei") or "")
            if "/" not in d:
                continue
            teile = d.split("/")
            teile[0] = TYP_ORDNER.get({"bilder": "bild", "videos": "video", "audio": "audio"}.get(teile[0].lower(), ""), teile[0])
            neu = "/".join(teile)
            if (ziel / nutzerordner(b["owner"]) / Path(*teile)).is_file() and (neu != d or b.get("wurzel") != str(ziel)):
                b.update({"datei": neu, "wurzel": str(ziel)})
                geaendert = True
        if geaendert:
            schreib_json("bilder.json", liste)
    return n


def ablage_einsortieren() -> int:
    """Einmalig beim Start: alte, flach abgelegte Dateien in die Ablage verschieben."""
    n = 0
    with LOCK:
        liste = bilder()
        wurzel = ablage_wurzel()
        for b in liste:
            if "/" in str(b.get("datei", "")):
                continue
            alt = DATA / "bilder" / b["datei"]
            if not alt.is_file():
                continue
            rel = ablage_relativ(b.get("typ", "bild"), b["erstellt"], b.get("prompt", ""), b["id"],
                                 b["datei"].rsplit(".", 1)[-1], wurzel, b["owner"])
            ziel = wurzel / nutzerordner(b["owner"]) / Path(*rel.split("/"))
            try:
                ziel.parent.mkdir(parents=True, exist_ok=True)
                shutil.move(str(alt), str(ziel))
            except OSError as e:           # eine Datei darf den Start nie verhindern – sie bleibt, wo sie ist
                print(f"Ablage: {b['id']} nicht einsortiert ({e}) – bleibt in data/bilder.", flush=True)
                continue
            b.update({"datei": rel, "wurzel": str(wurzel)})
            n += 1
        if n:
            schreib_json("bilder.json", liste)
    return n


def bild_speichern(owner: str, daten: bytes, info: dict) -> dict | None:
    typ = bild_typ(daten)
    if not typ:
        return None
    bid = neue_id()
    mime, endung = typ
    extra: dict = {"typ": "bild"}
    breite = hoehe = 0
    if mime.startswith("video/"):
        breite, hoehe, dauer = video_masse(daten)
        extra = {"typ": "video", "dauer": dauer}
    elif mime.startswith("audio/"):
        extra = {"typ": "audio"}
    else:
        breite, hoehe = bild_masse(daten)
    erstellt = jetzt()
    wurzel = ablage_wurzel()
    rel = ablage_relativ(extra["typ"], erstellt, str(info.get("prompt", "")), bid, endung, wurzel, owner)
    ziel = wurzel / nutzerordner(owner) / Path(*rel.split("/"))
    try:
        ziel.parent.mkdir(parents=True, exist_ok=True)
        ziel.write_bytes(daten)
    except OSError as e:
        raise RuntimeError(f"Ablage nicht beschreibbar ({ziel.parent}): {e}") from None
    eintrag = {"id": bid, "owner": owner, "datei": rel, "wurzel": str(wurzel), "mime": mime, "breite": breite,
               "hoehe": hoehe, "erstellt": erstellt, "like": False, "ordner": None,
               "veroeffentlicht": False, "geloescht": None, **extra, **info}
    if not eintrag.get("breite"):
        eintrag.pop("breite", None)
        eintrag.pop("hoehe", None)
    with LOCK:
        liste = bilder()
        liste.append(eintrag)
        schreib_json("bilder.json", liste)
    return eintrag


def referenz_daten(ref: str, owner: str) -> str | None:
    """Referenz-Id (Bild oder Upload) → data-URL; None, wenn nicht erlaubt/vorhanden."""
    if not ID_RE.match(ref or ""):
        return None
    b = bild_finden(ref)
    if b and darf_sehen(b, owner):
        f = medium_pfad(b)
        mime = b["mime"]
    else:
        ups = lies_json("uploads.json", {})
        u = ups.get(ref)
        if not u or u["owner"] != owner:
            return None
        f = uploads_ordner() / u["datei"]
        mime = u["mime"]
    if not f.is_file() or mime == "image/svg+xml" or not mime.startswith("image/"):
        return None      # Videos und SVG taugen nicht als Referenzbild
    return f"data:{mime};base64," + base64.b64encode(f.read_bytes()).decode("ascii")


def startbild_angleichen(daten_url: str, fmt: str, modus: str, ffmpeg: str) -> tuple[str, str]:
    """Start-/Endbild mittig auf das Videoformat zuschneiden – Videomodelle übernehmen sonst das Bildformat.
    (Auffüllen mit Rand taugt nicht: das Modell zeigt Start-/Endbild wörtlich, samt Rand.)
    Rückgabe (data-URL, Hinweis); Hinweis ist leer, wenn nichts zu tun war."""
    ziel = verhaeltnis(fmt)
    if modus != "zuschneiden" or ziel <= 0 or not ffmpeg:
        return daten_url, ""
    roh = base64.b64decode(daten_url.split(",", 1)[1])
    w, h = bild_masse(roh)
    if not w or not h or abs(math.log((w / h) / ziel)) < 0.03:
        return daten_url, ""
    lang = max(w, h)
    zw, zh = (lang, lang / ziel) if ziel >= 1 else (lang * ziel, lang)
    zw, zh = int(zw) // 2 * 2, int(zh) // 2 * 2
    filt = f"crop='min(iw,ih*{ziel:.6f})':'min(ih,iw/{ziel:.6f})',scale={zw}:{zh}"
    try:
        r = subprocess.run([ffmpeg, "-v", "error", "-f", "image2pipe", "-i", "pipe:0", "-filter_complex", filt,
                            "-frames:v", "1", "-f", "image2pipe", "-c:v", "png", "pipe:1"],
                           input=roh, capture_output=True, timeout=60, creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
    except (OSError, subprocess.TimeoutExpired):
        return daten_url, ""
    if r.returncode or not r.stdout.startswith(b"\x89PNG"):
        return daten_url, ""
    return ("data:image/png;base64," + base64.b64encode(r.stdout).decode("ascii"),
            f"Startbild {w}×{h} auf {fmt} mittig zugeschnitten")


def format_weicht_ab(daten_url: str, fmt: str) -> bool:
    ziel = verhaeltnis(fmt)
    try:
        w, h = bild_masse(base64.b64decode(daten_url.split(",", 1)[1]))
    except (ValueError, IndexError):
        return False
    return bool(w and h and ziel > 0 and abs(math.log((w / h) / ziel)) >= 0.03)


ERWEITERN_PROMPT = ("Outpaint this image to a {fmt} frame. Keep every existing element – characters, faces, text, "
                    "style, colours and lighting – exactly as in the reference and continue the scene naturally beyond "
                    "the current edges so the whole {fmt} frame is filled. No borders, no blur, no letterboxing, "
                    "no new text.")


def erweitern_modell(fmt: str) -> dict | None:
    """Bildmodell mit Referenzbild und genau diesem Format: Standardmodell, dann Empfehlungen, dann Katalog."""
    s, kat = einstellungen(), katalog_laden()["modelle"]
    def passt(m):
        return m and m["referenzbilder"] and fmt in (m["parameter"].get("aspect_ratio") or {}).get("werte", [])
    for mid in [s["standard_modell"], *s["empfohlen"]]:
        m = next((x for x in kat if x["id"] == mid), None)
        if passt(m):
            return m
    return next((x for x in kat if passt(x)), None)


def bild_erweitern(job: dict, ref: str, fmt: str, ffmpeg: str) -> tuple[str, str]:
    """Referenzbild per Bildmodell auf fmt erweitern (Outpainting). Ergebnis wird in der Bibliothek abgelegt und
    für dieselbe Quelle + Format wiederverwendet, damit „Neu erzeugen“ nicht erneut zahlt. → (data-URL, Bild-Id)"""
    owner, schluessel = job["owner"], f"{ref}:{fmt}"
    alt = bild_finden(lies_json("erweitert.json", {}).get(schluessel, ""))
    if alt and not alt.get("geloescht") and darf_sehen(alt, owner):
        url = referenz_daten(alt["id"], owner)
        if url:
            return url, alt["id"]
    m = erweitern_modell(fmt)
    if not m:
        raise RuntimeError(f"kein Bildmodell für {fmt} mit Referenzbild verfügbar")
    quelle = referenz_daten(ref, owner)
    if not quelle:
        raise RuntimeError("Quellbild nicht verfügbar")
    nl = {"model": m["id"], "prompt": ERWEITERN_PROMPT.format(fmt=fmt), "aspect_ratio": fmt,
          "input_references": [{"type": "image_url", "image_url": {"url": quelle}}]}
    if "n" in m["parameter"]:
        nl["n"] = 1
    daten, kosten, _ = ein_aufruf(nl)
    job["kosten"] = round(job["kosten"] + kosten, 5)
    if not daten:
        raise RuntimeError("das Bildmodell lieferte kein Bild")
    e = bild_speichern(owner, daten[0], {"prompt": f"Auf {fmt} erweitert (für Video)", "modell": m["id"],
                                         "modell_name": m["name"], "parameter": {"seitenverhaeltnis": fmt},
                                         "refs": [ref], "kosten": round(kosten, 5), "auftrag": job["id"]})
    if not e:
        raise RuntimeError("Antwort enthielt kein lesbares Bild")
    with LOCK:
        d = lies_json("erweitert.json", {})
        d[schluessel] = e["id"]
        schreib_json("erweitert.json", d)
    job.setdefault("hilfsbilder", []).append(e["id"])
    url = f"data:{e['mime']};base64," + base64.b64encode(daten[0]).decode("ascii")
    if ffmpeg:          # Modelle liefern oft 1024×1792 statt exakt 9:16 – kleine Reste mittig wegschneiden
        url, _ = startbild_angleichen(url, fmt, "zuschneiden", ffmpeg)
    return url, e["id"]


# --------------------------------------------------------------------------- Zuschnitt
ZUSCHNITT_FORMATE = {"4:5"}


def verhaeltnis(fmt: str) -> float:
    try:
        w, h = (float(x) for x in fmt.split(":"))
        return w / h
    except (ValueError, ZeroDivisionError):
        return 0.0


def naechstes_format(ziel: str, werte: list) -> str:
    """Nächstliegendes echtes Format (logarithmischer Abstand); '' wenn das Modell keins nennt."""
    zv = verhaeltnis(ziel)
    kandidaten = [(abs(math.log(verhaeltnis(w) / zv)), w) for w in werte if verhaeltnis(w) > 0]
    return min(kandidaten)[1] if kandidaten else ""


def zuschnitt_speichern(name: str, bid: str, daten_url: str) -> dict:
    """Ersetzt ein zum Zuschnitt markiertes Bild durch die zugeschnittene Fassung der Oberfläche."""
    if not ID_RE.match(bid or "") or "," not in daten_url:
        raise Fehler(400, "Ungültiger Zuschnitt.")
    try:
        roh = base64.b64decode(daten_url.split(",", 1)[1], validate=True)
    except ValueError:
        raise Fehler(400, "Bilddaten beschädigt.") from None
    typ = bild_typ(roh)
    if len(roh) > 60 * 1024 * 1024 or not typ or typ[0] not in ("image/png", "image/jpeg", "image/webp"):
        raise Fehler(400, "Zuschnitt muss PNG, JPEG oder WebP sein.")
    breite, hoehe = bild_masse(roh)
    with LOCK:
        liste = bilder()
        b = next((x for x in liste if x["id"] == bid and x["owner"] == name), None)
        if not b or not b.get("zuschnitt"):
            raise Fehler(404, "Kein offener Zuschnitt für dieses Bild.")
        if not hoehe or abs(breite / hoehe - verhaeltnis(b["zuschnitt"])) > 0.02:
            raise Fehler(400, f"Zuschnitt hat nicht das Format {b['zuschnitt']}.")
        alt = medium_pfad(b)
        neu_datei = b["datei"].rsplit(".", 1)[0] + "." + typ[1]
        b.update({"datei": neu_datei, "mime": typ[0], "breite": breite, "hoehe": hoehe})
        b.pop("zuschnitt")
        neu = medium_pfad(b)
        neu.parent.mkdir(parents=True, exist_ok=True)
        neu.write_bytes(roh)
        if alt != neu:
            alt.unlink(missing_ok=True)
        schreib_json("bilder.json", liste)
    return b


# --------------------------------------------------------------------------- Video: Katalog & Preise
VBESCHREIBUNG = {
    "google/veo-3.1": "Googles Spitzenmodell mit Ton, bis 4K",
    "google/veo-3.1-fast": "Veo schneller und günstiger, mit Ton",
    "google/veo-3.1-lite": "Günstiger Einstieg, mit Ton",
    "openai/sora-2-pro": "Filmische Szenen bis 20 s, mit Ton",
    "kwaivgi/kling-v3.0-pro": "Sehr gute Bewegung, Start- und Endbild",
    "kwaivgi/kling-v3.0-std": "Kling günstiger",
    "kwaivgi/kling-video-o1": "Kling mit Bildverständnis",
    "bytedance/seedance-2.5": "Bis 30 s, mit Ton",
    "bytedance/seedance-2.0": "Vielseitig, bis 4K, mit Ton",
    "bytedance/seedance-2.0-fast": "Seedance schnell",
    "bytedance/seedance-2.0-mini": "Seedance sehr günstig",
    "minimax/hailuo-3": "2K-Clips mit Ton",
    "minimax/hailuo-3-max": "Hailuo lang und günstig",
    "runway/gen-4.5": "Kreative Kamerafahrten",
    "alibaba/wan-3.0": "Bis 30 s, günstig",
    "alibaba/wan-3.0-prime": "Wan in höherer Güte",
    "x-ai/grok-imagine-video-1.5": "Schnell, bis 1080p",
    "black-forest-labs/flux-3-video": "FLUX-Video bis 20 s",
}
ANBIETER.update({"kwaivgi": "Kling", "minimax": "MiniMax", "alibaba": "Alibaba", "runway": "Runway",
                 "heygen": "HeyGen", "bytedance": "ByteDance"})
VKATALOG: dict = {"modelle": [], "stand": 0, "fehler": ""}
VKATALOG_LAUF = threading.Lock()


def videomodell_aufbereiten(m: dict) -> dict:
    mid = m["id"]
    slug = mid.split("/", 1)[0]
    name = m.get("name") or mid
    if ": " in name:
        name = name.split(": ", 1)[1]
    preise = {}
    for k, v in (m.get("pricing_skus") or {}).items():
        try:
            preise[k.lower()] = float(v)
        except (TypeError, ValueError):
            pass
    return {"id": mid, "name": name, "anbieter": ANBIETER.get(slug, slug),
            "beschreibung": VBESCHREIBUNG.get(mid) or f"Videomodell von {ANBIETER.get(slug, slug)}",
            "erstellt": m.get("created") or 0,
            "art": "erzeugen" if m.get("supported_durations") else "bearbeiten",
            "aufloesungen": m.get("supported_resolutions") or [],
            "formate": m.get("supported_aspect_ratios") or [],
            "dauern": sorted(int(d) for d in (m.get("supported_durations") or [])),
            "frames": m.get("supported_frame_images") or [],
            "ton": m.get("generate_audio"), "seed": bool(m.get("seed")), "preise": preise}


def vkatalog_laden(erzwingen: bool = False) -> dict:
    cache = pfad("cache/videomodelle.json")
    if not erzwingen and not VKATALOG["modelle"] and cache.is_file():
        try:
            VKATALOG.update(json.loads(cache.read_text("utf-8")))
        except ValueError:
            pass
    if not erzwingen and VKATALOG["modelle"] and time.time() - VKATALOG["stand"] < KATALOG_TTL:
        return VKATALOG
    if not VKATALOG_LAUF.acquire(blocking=False):
        return VKATALOG
    try:
        liste = or_anfrage("/videos/models", mit_key=False).get("data", [])
        VKATALOG.update({"modelle": [videomodell_aufbereiten(m) for m in liste], "stand": time.time(), "fehler": ""})
        schreib_json("cache/videomodelle.json", VKATALOG)
    except RuntimeError as e:
        VKATALOG["fehler"] = str(e)
    finally:
        VKATALOG_LAUF.release()
    return VKATALOG


def videomodell(mid: str) -> dict | None:
    return next((m for m in vkatalog_laden()["modelle"] if m["id"] == mid), None)


VIDEO_PIXEL = {"480p": 854 * 480, "720p": 1280 * 720, "768p": 1366 * 768, "1024p": 1792 * 1024,
               "1080p": 1920 * 1080, "1k": 1920 * 1080, "2k": 2560 * 1440, "4k": 3840 * 2160}


def video_preis(m: dict, aufl: str, ton: bool, mit_bild: bool) -> dict:
    """Preis je Sekunde (USD) aus pricing_skus; Suchreihenfolge siehe plan/Video-und-Chat-Plan.md."""
    p, r = m.get("preise") or {}, (aufl or "").lower()
    tk = "with_audio" if ton else "without_audio"
    modus = "image_to_video" if mit_bild else "text_to_video"

    def g(*schluessel):
        return next((p[k] for k in schluessel if k in p), None)

    usd = g(f"duration_seconds_{tk}_{r}", f"duration_seconds_{tk}", f"{modus}_duration_seconds_{r}",
            f"duration_seconds_{r}", "duration_seconds")
    if usd is not None:
        return {"je_sekunde": usd, "minimum": 0.0, "fix": 0.0, "quelle": "preisliste"}
    cent = g(f"cents_per_second_output_{r}", f"cents_per_video_output_second_{r}", "cents_per_second_output")
    if cent is not None:
        return {"je_sekunde": cent / 100, "minimum": (g("minimum_cents_per_generation") or 0) / 100,
                "fix": (g("cents_per_image_input") or 0) / 100 if mit_bild else 0.0, "quelle": "preisliste"}
    tok = g(f"video_tokens_{r}", "video_tokens" if ton else "video_tokens_without_audio", "video_tokens")
    if tok is not None:
        je_sek_tokens = VIDEO_PIXEL.get(r, VIDEO_PIXEL["720p"]) * 24 / 1024
        return {"je_sekunde": tok * je_sek_tokens, "minimum": 0.0, "fix": 0.0, "quelle": "schaetzung",
                "tokens_je_sekunde": int(je_sek_tokens)}
    return {"je_sekunde": 0.0, "minimum": 0.0, "fix": 0.0, "quelle": "unbekannt"}


def video_kosten_schluessel(mid: str, aufl: str, ton: bool) -> str:
    return f"video|{mid}|{aufl or '-'}|{int(bool(ton))}"


def schaetzen_video(m: dict, aufl: str, dauer: int, ton: bool, mit_bild: bool, anzahl: int) -> dict:
    anzahl = max(1, min(int(anzahl or 1), 4))
    dauer = int(dauer or (m["dauern"][0] if m["dauern"] else 5))
    pr = video_preis(m, aufl, ton, mit_bild)
    je_sek, quelle = pr["je_sekunde"], pr["quelle"]
    gemessen = lies_json("kosten_mittel.json", {}).get(video_kosten_schluessel(m["id"], aufl, ton))
    if gemessen and gemessen.get("anzahl", 0) > 0:
        je_sek, quelle = gemessen["summe"] / gemessen["anzahl"], "gemessen"
    je_video = max(je_sek * dauer, pr["minimum"]) + pr["fix"]
    return {"je_video": round(je_video, 4), "gesamt": round(je_video * anzahl, 4), "je_sekunde": round(je_sek, 4),
            "dauer": dauer, "anzahl": anzahl, "quelle": quelle, "tokens_je_sekunde": pr.get("tokens_je_sekunde")}


def kosten_merken_schluessel(k: str, wert: float) -> None:
    with LOCK:
        d = lies_json("kosten_mittel.json", {})
        e = d.get(k, {"summe": 0.0, "anzahl": 0})
        if e["anzahl"] >= 20:
            e["summe"] *= 19 / e["anzahl"]
            e["anzahl"] = 19
        e["summe"] += wert
        e["anzahl"] += 1
        d[k] = e
        schreib_json("kosten_mittel.json", d)


# --------------------------------------------------------------------------- Aufträge
AUFTRAEGE: dict[str, dict] = {}


def ein_aufruf(nutzlast: dict) -> tuple[list[bytes], float, int]:
    antwort = or_anfrage("/images", nutzlast, timeout=300)
    bilder_ = []
    for d in antwort.get("data") or []:
        if d.get("b64_json"):
            bilder_.append(base64.b64decode(d["b64_json"]))
        elif str(d.get("url", "")).startswith("data:"):
            bilder_.append(base64.b64decode(d["url"].split(",", 1)[1]))
        elif str(d.get("url", "")).startswith("https://"):
            with urllib.request.urlopen(d["url"], timeout=120) as r:
                bilder_.append(r.read(50 * 1024 * 1024))
    usage = antwort.get("usage") or {}
    return bilder_, float(usage.get("cost") or 0), int(usage.get("completion_tokens") or usage.get("total_tokens") or 0)


def auftrag_ausfuehren(job: dict, m: dict, basis: dict, refs_urls: list[str]) -> None:
    n = job["gesamt"]
    n_max = (m["parameter"].get("n") or {}).get("max", 1) or 1
    if refs_urls:
        basis["input_references"] = [{"type": "image_url", "image_url": {"url": u}} for u in refs_urls]
    # Modell kann n Bilder auf einmal → ein Aufruf; sonst mehrere parallele Aufrufe.
    pakete = [n] if n_max >= n else [1] * n
    kosten_summe, token_summe = 0.0, 0

    def paket(k):
        nl = dict(basis)
        if k > 1 or "n" in m["parameter"]:
            nl["n"] = k
        return ein_aufruf(nl)

    with ThreadPoolExecutor(min(4, len(pakete))) as pool:
        futs = [pool.submit(paket, k) for k in pakete]
        for f in futs:
            try:
                daten_liste, kosten, toks = f.result()
            except Exception as e:  # noqa: BLE001 — Meldung geht an die Oberfläche
                job["fehler"].append(str(e)[:400])
                continue
            kosten_summe += kosten
            token_summe += toks
            je = kosten / max(len(daten_liste), 1)
            for daten in daten_liste:
                e = bild_speichern(job["owner"], daten, {
                    "prompt": job["prompt"], "modell": m["id"], "modell_name": m["name"],
                    "parameter": job["parameter"], "refs": job["refs"], "kosten": round(je, 5),
                    "auftrag": job["id"], **({"zuschnitt": job["zuschnitt"], "anpassung": job["anpassung"]}
                                             if job.get("zuschnitt") else {})})
                if e:
                    job["bilder"].append(e["id"])
                    if je > 0:
                        kosten_merken(m["id"], job["parameter"].get("aufloesung", ""),
                                      job["parameter"].get("qualitaet", ""), je)
                else:
                    job["fehler"].append("Antwort enthielt kein lesbares Bild.")
    job["kosten"] = round(kosten_summe, 5)
    job["tokens"] = token_summe
    if job.get("influencer") and job["bilder"]:
        influencer_bilder_anhaengen(job["owner"], job["influencer"], job["bilder"])
    job["status"] = "fertig" if job["bilder"] and not job["fehler"] else ("teilweise" if job["bilder"] else "fehler")
    job["ende"] = jetzt()
    verbrauch_schreiben({"zeit": job["ende"], "owner": job["owner"], "modell": m["id"], "bilder": len(job["bilder"]),
                         "kosten": job["kosten"], "tokens": token_summe, "status": job["status"]})


def auftrag_starten(owner: str, e: dict) -> dict:
    m = modell(str(e.get("modell", "")))
    if not m:
        raise ValueError("Unbekanntes Modell.")
    prompt = str(e.get("prompt", "")).strip()
    if not prompt:
        raise ValueError("Bitte beschreibe zuerst das Bild.")
    if len(prompt) > 8000:
        raise ValueError("Die Beschreibung ist zu lang (max. 8.000 Zeichen).")
    n = max(1, min(int(e.get("anzahl") or 1), 4))
    p = m["parameter"]
    nutzlast: dict = {"model": m["id"], "prompt": prompt}
    parameter = {}
    for feld, schluessel in (("seitenverhaeltnis", "aspect_ratio"), ("aufloesung", "resolution"),
                             ("qualitaet", "quality"), ("hintergrund", "background")):
        wert = str(e.get(feld) or "")
        if wert and schluessel in p and wert in p[schluessel].get("werte", []):
            nutzlast[schluessel] = wert
            parameter[feld] = wert
    # Zuschnittformate (z. B. 4:5): kann das Modell sie nicht selbst, wird im nächstliegenden
    # Format erzeugt und die Oberfläche schneidet danach mittig zu.
    zuschnitt, anpassung = "", ""
    wunsch = str(e.get("seitenverhaeltnis") or "")
    if wunsch in ZUSCHNITT_FORMATE and "seitenverhaeltnis" not in parameter:
        naechstes = naechstes_format(wunsch, (p.get("aspect_ratio") or {}).get("werte", []))
        if naechstes:
            nutzlast["aspect_ratio"] = naechstes
        parameter["seitenverhaeltnis"] = wunsch
        zuschnitt = wunsch
        anpassung = einstellungen()["anpassung"]
        if anpassung == "zuschneiden":
            nutzlast["prompt"] = prompt + f"\n\n(Bildaufbau für einen {wunsch}-Zuschnitt: Hauptmotiv mittig, Ränder ohne wichtige Details.)"
    refs = [str(r) for r in (e.get("refs") or [])][:16]
    for el_id in e.get("elemente") or []:
        el = lies_json("elemente.json", {}).get(str(el_id))
        if el and el["owner"] == owner:
            refs.extend(el.get("bilder", []))
    refs = list(dict.fromkeys(refs))
    ref_max = (p.get("input_references") or {}).get("max", 0) if m["referenzbilder"] else 0
    urls = [u for u in (referenz_daten(r, owner) for r in refs[:ref_max]) if u]
    job = {"id": neue_id(), "owner": owner, "art": "bild", "status": "laufend", "gesamt": n, "bilder": [], "fehler": [],
           "prompt": prompt, "modell": m["id"], "modell_name": m["name"], "parameter": parameter,
           "refs": refs[:ref_max], "start": jetzt(), "ende": None, "kosten": 0.0, "tokens": 0, "zuschnitt": zuschnitt, "anpassung": anpassung,
           "schaetzung": schaetzen(m, parameter.get("aufloesung", ""), parameter.get("qualitaet", ""), n,
                                   len(prompt), len(urls))}
    if refs and not urls:
        job["hinweis"] = "Referenzbilder werden von diesem Modell nicht unterstützt und wurden weggelassen."
    iid = str(e.get("influencer_id") or "")
    if iid:
        inf = lies_json("influencer.json", {}).get(iid)
        if not inf or inf["owner"] != owner:
            raise Fehler(404, "Influencer nicht gefunden.")
        job["influencer"] = iid
    with LOCK:
        AUFTRAEGE[job["id"]] = job
    threading.Thread(target=auftrag_ausfuehren, args=(job, m, nutzlast, urls), daemon=True).start()
    return job


# --------------------------------------------------------------------------- Video-Aufträge
VIDEO_MAX = 800 * 1024 * 1024
VIDEO_ZEITLIMIT = 90 * 60
VIDEO_TEST_TAKT: float | None = None     # nur für Tests: kürzerer Abfragetakt
RID_RE = re.compile(r"^[A-Za-z0-9_.:-]{1,160}$")


class _KeineWeiterleitung(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None


def or_video_laden(rid: str) -> bytes:
    """Lädt das fertige Video. Eine Weiterleitung auf einen fremden Speicher wird OHNE Schlüssel verfolgt."""
    req = urllib.request.Request(f"{or_basis()}/videos/{rid}/content?index=0",
                                 headers={"Authorization": "Bearer " + api_key()})
    try:
        antwort = urllib.request.build_opener(_KeineWeiterleitung).open(req, timeout=300)
    except urllib.error.HTTPError as e:
        ziel = e.headers.get("Location", "") if e.code in (301, 302, 303, 307, 308) else ""
        if not ziel.startswith("https://"):
            raise RuntimeError(f"Video-Download fehlgeschlagen (HTTP {e.code}).") from None
        antwort = urllib.request.urlopen(ziel, timeout=300)
    except (urllib.error.URLError, TimeoutError) as e:
        raise RuntimeError(f"Video-Download fehlgeschlagen: {e}") from None
    with antwort:
        daten = antwort.read(VIDEO_MAX + 1)
    if len(daten) > VIDEO_MAX:
        raise RuntimeError("Video größer als 800 MB.")
    return daten


def video_offen_setzen(rid: str, eintrag: dict | None) -> None:
    with LOCK:
        offen = lies_json("video_offen.json", {})
        if eintrag is None:
            offen.pop(rid, None)
        else:
            offen[rid] = eintrag
        schreib_json("video_offen.json", offen)


def video_auftrag_ausfuehren(job: dict, nutzlasten: list, info: dict, vorhandene: list | None = None) -> None:
    """Schickt die Videos ab (oder übernimmt offene Ids) und fragt sie bis zum Ergebnis ab."""
    rids = list(vorhandene or [])
    for nl in nutzlasten:
        try:
            antwort = or_anfrage("/videos", nl, timeout=120)
            rid = str(antwort.get("id") or "")
            if not RID_RE.match(rid):
                raise RuntimeError("OpenRouter lieferte keine Auftragsnummer.")
            rids.append(rid)
            # sofort sichern: ein bezahltes Video darf bei einem Neustart nicht verloren gehen
            video_offen_setzen(rid, {"job": job["id"], "owner": job["owner"], "info": info, "start": jetzt()})
        except RuntimeError as e:
            job["fehler"].append(str(e)[:400])
    offen, t0 = set(rids), time.time()
    dauer = int(info["parameter"].get("dauer") or 0)
    while offen and time.time() - t0 < VIDEO_ZEITLIMIT:
        time.sleep(VIDEO_TEST_TAKT or max(5, int(einstellungen().get("video_takt", 15))))
        for rid in list(offen):
            try:
                st = or_anfrage(f"/videos/{rid}", timeout=30)
            except RuntimeError:
                continue          # kurzzeitiger Fehler: im nächsten Takt erneut
            status = str(st.get("status") or "")
            if status == "completed":
                offen.discard(rid)
                try:
                    kosten = float((st.get("usage") or {}).get("cost") or 0)
                    e = bild_speichern(job["owner"], or_video_laden(rid),
                                       {**info, "kosten": round(kosten, 4), "auftrag": job["id"]})
                    if not e or e.get("typ") != "video":
                        raise RuntimeError("Die Antwort war kein lesbares Video.")
                    job["bilder"].append(e["id"])
                    job["kosten"] = round(job["kosten"] + kosten, 4)
                    if kosten > 0 and dauer:
                        kosten_merken_schluessel(video_kosten_schluessel(
                            info["modell"], info["parameter"].get("aufloesung", ""), info["parameter"].get("ton", False)),
                            kosten / dauer)
                    video_offen_setzen(rid, None)
                except RuntimeError as err:
                    # Eintrag bleibt in video_offen.json → wird beim nächsten Start erneut geladen
                    job["fehler"].append(str(err)[:400])
            elif status in ("failed", "cancelled", "canceled", "expired"):
                offen.discard(rid)
                job["fehler"].append(f"Video fehlgeschlagen: {str(st.get('error') or status)[:300]}")
                video_offen_setzen(rid, None)
    if offen:
        job["fehler"].append("Zeitüberschreitung – der Auftrag wird beim nächsten Start erneut abgefragt.")
    job["status"] = "fertig" if job["bilder"] and not job["fehler"] else ("teilweise" if job["bilder"] else "fehler")
    job["ende"] = jetzt()
    verbrauch_schreiben({"zeit": job["ende"], "owner": job["owner"], "modell": info["modell"], "art": "video",
                         "bilder": len(job["bilder"]), "kosten": job["kosten"], "tokens": 0, "status": job["status"]})


def video_auftrag_starten(owner: str, e: dict) -> dict:
    m = videomodell(str(e.get("modell", "")))
    if not m or m["art"] != "erzeugen":
        raise ValueError("Unbekanntes Videomodell.")
    prompt = str(e.get("prompt", "")).strip()
    if not prompt:
        raise ValueError("Bitte beschreibe zuerst das Video.")
    if len(prompt) > 8000:
        raise ValueError("Die Beschreibung ist zu lang (max. 8.000 Zeichen).")
    n = max(1, min(int(e.get("anzahl") or 1), 4))
    nl: dict = {"model": m["id"], "prompt": prompt}
    parameter: dict = {}
    aufl = str(e.get("aufloesung") or "")
    if aufl in m["aufloesungen"]:
        nl["resolution"] = parameter["aufloesung"] = aufl
    fmt = str(e.get("seitenverhaeltnis") or "")
    if fmt in m["formate"]:
        nl["aspect_ratio"] = parameter["seitenverhaeltnis"] = fmt
    if m["dauern"]:
        dauer = int(e.get("dauer") or 0)
        if dauer not in m["dauern"]:
            ziel = dauer or 5      # nächstliegende Dauer; bei Gleichstand die kürzere (günstigere)
            dauer = min(m["dauern"], key=lambda d: (abs(d - ziel), d))
        nl["duration"] = parameter["dauer"] = dauer
    if m["ton"] is True:
        nl["generate_audio"] = parameter["ton"] = bool(e.get("ton"))
    frames, refs, erweitern = [], [], []
    s = einstellungen()
    modus = s["startbild_anpassung"] if fmt in m["formate"] else "aus"
    ffmpeg = werkzeug_pfade(s)["ffmpeg"]
    for art, feld, wort in (("first_frame", "startbild", "Startbild"), ("last_frame", "endbild", "Endbild")):
        ref = str(e.get(feld) or "")
        if not ref:
            continue
        if art not in m["frames"]:
            raise ValueError(f"{m['name']} unterstützt kein {wort}.")
        url = referenz_daten(ref, owner)
        if not url:
            raise ValueError(f"Das {wort} ist nicht verfügbar.")
        if modus == "zuschneiden" and ffmpeg:
            url, hinweis = startbild_angleichen(url, fmt, "zuschneiden", ffmpeg)
            if hinweis:
                parameter[feld + "_angepasst"] = hinweis.replace("Startbild", wort)
        elif modus == "ki" and format_weicht_ab(url, fmt):
            erweitern.append((len(frames), feld, wort, ref))
        frames.append({"type": "image_url", "image_url": {"url": url}, "frame_type": art})
        refs.append(ref)
        parameter[feld] = ref
    if frames:
        nl["frame_images"] = frames
    info = {"prompt": prompt, "modell": m["id"], "modell_name": m["name"], "parameter": parameter, "refs": refs}
    job = {"id": neue_id(), "owner": owner, "art": "video", "status": "laufend", "gesamt": n, "bilder": [],
           "fehler": [], "prompt": prompt, "modell": m["id"], "modell_name": m["name"], "parameter": parameter,
           "refs": refs, "start": jetzt(), "ende": None, "kosten": 0.0, "tokens": 0,
           "schaetzung": schaetzen_video(m, aufl, parameter.get("dauer", 0), parameter.get("ton", False), bool(frames), n)}
    if erweitern:
        em = erweitern_modell(fmt)
        if not em:
            raise ValueError(f"Kein Bildmodell kann Bilder auf {fmt} erweitern. Einstellungen → Video → „Zuschneiden“ wählen.")
        je = schaetzen(em, "", "", 1, 300, 1).get("gesamt") or 0
        job["hinweis"] = (f"{' und '.join(w for _, _, w, _ in erweitern)} {'wird' if len(erweitern) == 1 else 'werden'} "
                          f"zuerst per {em['name']} auf {fmt} erweitert (≈ {je * len(erweitern):.2f} $, "
                          "nur beim ersten Mal – das Ergebnis liegt dann in der Bibliothek)")
    with LOCK:
        AUFTRAEGE[job["id"]] = job
    threading.Thread(target=video_vorbereiten, args=(job, nl, n, info, erweitern, fmt, ffmpeg), daemon=True).start()
    return job


def video_vorbereiten(job: dict, nl: dict, n: int, info: dict, erweitern: list, fmt: str, ffmpeg: str) -> None:
    """Start-/Endbild bei Bedarf erst per Bildmodell auf das Videoformat erweitern, dann das Video abschicken.
    Scheitert die Erweiterung, wird KEIN Video bezahlt."""
    for idx, feld, wort, ref in erweitern:
        job["phase"] = f"{wort} wird auf {fmt} erweitert …"
        try:
            url, bid = bild_erweitern(job, ref, fmt, ffmpeg)
        except Exception as e:  # noqa: BLE001 — Meldung geht an die Oberfläche
            job["fehler"].append(f"{wort} konnte nicht auf {fmt} erweitert werden – kein Video erzeugt: {str(e)[:300]}")
            job.update({"status": "fehler", "ende": jetzt(), "phase": ""})
            return
        nl["frame_images"][idx]["image_url"]["url"] = url
        info["parameter"][feld + "_angepasst"] = f"{wort} per KI auf {fmt} erweitert"
        info["parameter"][feld + "_erweitert"] = bid
    job["phase"] = ""
    video_auftrag_ausfuehren(job, [json.loads(json.dumps(nl)) for _ in range(n)], info)


def video_offen_fortsetzen() -> int:
    """Nach dem Start: Videos, die bei OpenRouter noch laufen oder fertig sind, weiter abfragen."""
    gruppen: dict[str, list] = {}
    for rid, v in lies_json("video_offen.json", {}).items():
        gruppen.setdefault(v["job"], []).append((rid, v))
    for jid, eintraege in gruppen.items():
        v0 = eintraege[0][1]
        info = v0["info"]
        job = {"id": jid, "owner": v0["owner"], "art": "video", "status": "laufend", "gesamt": len(eintraege),
               "bilder": [], "fehler": [], "prompt": info["prompt"], "modell": info["modell"],
               "modell_name": info["modell_name"], "parameter": info["parameter"], "refs": info.get("refs", []),
               "start": v0["start"], "ende": None, "kosten": 0.0, "tokens": 0, "fortgesetzt": True}
        with LOCK:
            AUFTRAEGE[jid] = job
        threading.Thread(target=video_auftrag_ausfuehren, args=(job, [], info, [r for r, _ in eintraege]),
                         daemon=True).start()
    return len(gruppen)


# --------------------------------------------------------------------------- Audio (Sprache)
ANBIETER.update({"deepgram": "Deepgram", "fish-audio": "Fish Audio", "hexgrad": "hexgrad", "canopylabs": "Canopy Labs",
                 "sesame": "Sesame", "mistralai": "Mistral"})
AKATALOG: dict = {"modelle": [], "stand": 0, "fehler": ""}
AKATALOG_LAUF = threading.Lock()
PROFIL_VORGABE = [{"id": "standard", "name": "Standard", "modell": "x-ai/grok-voice-tts-1.0", "stimme": "eve",
                   "klang": audio.klang_saeubern({})}]


def akatalog_laden(erzwingen: bool = False) -> dict:
    cache = pfad("cache/audiomodelle.json")
    if not erzwingen and not AKATALOG["modelle"] and cache.is_file():
        try:
            AKATALOG.update(json.loads(cache.read_text("utf-8")))
        except ValueError:
            pass
    if not erzwingen and AKATALOG["modelle"] and time.time() - AKATALOG["stand"] < KATALOG_TTL:
        return AKATALOG
    if not AKATALOG_LAUF.acquire(blocking=False):
        return AKATALOG
    try:
        liste = or_anfrage("/models?output_modalities=speech", mit_key=False).get("data", [])
        def endpunkte(m):
            try:
                return or_anfrage(f"/models/{m['id']}/endpoints", mit_key=False, timeout=20)
            except RuntimeError:
                return {}

        with ThreadPoolExecutor(6) as pool:        # Stimmen (llms.txt) und Klon-Fähigkeit (endpoints) je Modell
            texte = list(pool.map(lambda m: audio.llms_laden(m["id"]), liste))
            eps = list(pool.map(endpunkte, liste))
        alt = {m["id"]: m for m in AKATALOG.get("modelle") or []}
        modelle, luecken = [], 0
        for m, text, ep in zip(liste, texte, eps):
            vorher = alt.get(m["id"]) or {}
            if text:
                stimmen, bsp = audio.stimmen_aus_llms(text)
            else:
                # Abruf gescheitert: letzte bekannte Stimmen behalten. Sonst stünde das Modell 24 h lang ohne
                # Stimmenliste da und die Oberfläche böte nur noch „Eigene Stimm-ID eingeben“ an.
                luecken += 1
                stimmen, bsp = vorher.get("stimmen", []), vorher.get("beispiel_stimme", "")
            klonen = audio.klonen_moeglich(ep) if ep else vorher.get("klonen", False)
            modelle.append(audio.modell_aufbereiten(m, stimmen, bsp, ANBIETER, klonen))
        # Mit Lücken nicht für die volle Frist cachen, sondern in 15 Minuten neu versuchen.
        stand = time.time() - (KATALOG_TTL - 15 * 60 if luecken else 0)
        AKATALOG.update({"modelle": sorted(modelle, key=lambda x: (x["anbieter"], x["name"])), "stand": stand, "fehler": ""})
        schreib_json("cache/audiomodelle.json", AKATALOG)
    except RuntimeError as e:
        AKATALOG["fehler"] = str(e)
    finally:
        AKATALOG_LAUF.release()
    return AKATALOG


def audiomodell(mid: str) -> dict | None:
    if lokal_stimme.ist_lokal(mid):
        return next((m for m in lokal_stimme.modelle() if m["id"] == mid), None)
    return next((m for m in akatalog_laden()["modelle"] if m["id"] == mid), None)


def tts(m: dict, text: str, stimme: str, refs: list | None = None, klon_id: str = "") -> tuple[bytes, str, str]:
    """Ein Weg für Cloud und lokal. Lokal bekommt der Dienst nur den Pfad der Stimmprobe – sie verlässt den PC nicht."""
    if m.get("lokal"):
        return lokal_stimme.sprechen(text, DATA / "stimmen" / f"{klon_id}.mp3" if klon_id else None)
    return audio.sprechen(api_key(), m["id"], text, stimme, or_basis(), refs)


def stimme_pruefen(m: dict, stimme: str) -> str:
    stimme = str(stimme or "").strip()[:80]
    if m["stimmen"]:
        if stimme not in m["stimmen"]:
            stimme = m["beispiel_stimme"] or m["stimmen"][0]
    elif stimme and not re.match(r"^[\w .:+-]{1,80}$", stimme):
        raise ValueError("Ungültige Stimmen-Kennung.")
    return stimme or m.get("beispiel_stimme", "")


def generation_kosten(gid: str) -> float | None:
    """Echte Kosten eines Aufrufs nachfragen (stehen erst kurz nach dem Aufruf bereit)."""
    if not gid or not re.match(r"^[A-Za-z0-9_-]{4,120}$", gid):
        return None
    for _ in range(3):
        time.sleep(1.5)
        try:
            d = or_anfrage(f"/generation?id={gid}", timeout=15).get("data") or {}
            if d.get("total_cost") is not None:
                return float(d["total_cost"])
        except RuntimeError:
            continue
    return None


# --- eigene (geklonte) Stimmen: Probe + Abschrift, nur mit Einwilligung
STIMM_UPLOAD_MAX = 15 * 1024 * 1024


def eigene_stimmen(name: str) -> list:
    return sorted(({"id": k, **{x: v.get(x) for x in ("name", "transkript", "erstellt", "dauer")}}
                   for k, v in lies_json("stimmen.json", {}).items() if v["owner"] == name),
                  key=lambda s: s["erstellt"], reverse=True)


def eigene_stimme(name: str, sid: str) -> dict:
    s = lies_json("stimmen.json", {}).get(str(sid or ""))
    if not s or s["owner"] != name:
        raise Fehler(404, "Eigene Stimme nicht gefunden.")
    return s


def stimme_anlegen(name: str, e: dict) -> dict:
    if e.get("einwilligung") is not True:
        raise Fehler(400, "Bitte bestätigen, dass es deine Stimme ist oder die Person ausdrücklich eingewilligt hat.")
    titel = str(e.get("name") or "").strip()[:40]
    if not titel:
        raise Fehler(400, "Bitte der Stimme einen Namen geben.")
    up = lies_json("stimm_uploads.json", {}).get(str(e.get("upload") or ""))
    if not up or up["owner"] != name:
        raise Fehler(400, "Bitte zuerst eine Stimmprobe hochladen oder aufnehmen.")
    quelle = DATA / "stimmen" / "_roh" / up["datei"]
    sid = neue_id()
    ziel = DATA / "stimmen" / f"{sid}.mp3"
    w = werkzeug_pfade(einstellungen())
    try:
        audio.probe_normalisieren(w["ffmpeg"], quelle, ziel)
    finally:
        quelle.unlink(missing_ok=True)
    dauer = audio.dauer(w["ffprobe"], ziel)
    if dauer and dauer < 3:
        ziel.unlink(missing_ok=True)
        raise Fehler(400, "Die Probe ist zu kurz – bitte 10 bis 30 Sekunden deutlich sprechen.")
    with LOCK:
        alle = lies_json("stimmen.json", {})
        alle[sid] = {"owner": name, "name": titel, "transkript": str(e.get("transkript") or "").strip()[:2000],
                     "erstellt": jetzt(), "dauer": dauer, "einwilligung": jetzt()}
        schreib_json("stimmen.json", alle)
    return {"id": sid, **{k: alle[sid][k] for k in ("name", "transkript", "erstellt", "dauer")}}


def audio_auftrag_starten(owner: str, e: dict) -> dict:
    m = audiomodell(str(e.get("modell", "")))
    if not m:
        raise ValueError("Unbekanntes Sprachmodell.")
    text = str(e.get("text") or e.get("prompt") or "").strip()
    if not text:
        raise ValueError("Bitte zuerst den Text eingeben, der gesprochen werden soll.")
    if len(text) > audio.MAX_TEXT:
        raise ValueError(f"Der Text ist zu lang (max. {audio.MAX_TEXT} Zeichen).")
    stimme = stimme_pruefen(m, e.get("stimme"))
    klang = audio.klang_saeubern(e.get("klang"))
    parameter = {"stimme": stimme, "klang": klang, **({"profil": str(e["profil"])[:40]} if e.get("profil") else {})}
    refs = None
    if e.get("klon"):
        if not m.get("klonen"):
            raise ValueError(f"{m['name']} kann keine Stimmen klonen – bitte ein Modell mit Klon-Funktion wählen.")
        s = eigene_stimme(owner, str(e["klon"]))
        refs = audio.referenzen((DATA / "stimmen" / f"{e['klon']}.mp3").read_bytes(), "audio/mpeg", s.get("transkript", ""))
        parameter.update({"klon": str(e["klon"]), "stimme": s["name"]})
        stimme = ""        # Stimmprobe UND voice zusammen → Fish Audio antwortet mit 400
    job = {"id": neue_id(), "owner": owner, "art": "audio", "status": "laufend", "gesamt": 1, "bilder": [], "fehler": [],
           "prompt": text, "modell": m["id"], "modell_name": m["name"], "parameter": parameter, "refs": [],
           "start": jetzt(), "ende": None, "kosten": 0.0, "tokens": 0,
           "schaetzung": {"gesamt": audio.kosten(m, len(text)), "quelle": "preisliste"}}
    with LOCK:
        AUFTRAEGE[job["id"]] = job
    threading.Thread(target=audio_ausfuehren, args=(job, m, text, stimme, klang, refs), daemon=True).start()
    return job


def audio_ausfuehren(job: dict, m: dict, text: str, stimme: str, klang: dict, refs: list | None = None) -> None:
    ordner = DATA / "audio_roh"
    ordner.mkdir(parents=True, exist_ok=True)
    try:
        daten, art, gid = tts(m, text, stimme, refs, job["parameter"].get("klon", ""))
        endung = "wav" if "wav" in art else "mp3"
        roh = ordner / f"_{job['id']}.{endung}"
        roh.write_bytes(daten)
        w = werkzeug_pfade(einstellungen())
        fertig = ordner / f"_{job['id']}_fertig.mp3"
        if w["ffmpeg"] or audio.klang_filter(klang) or endung != "mp3":
            audio.klang_einrechnen(w["ffmpeg"], roh, fertig, klang)
        else:
            fertig = roh
        kosten = generation_kosten(gid)
        if kosten is None:
            kosten = audio.kosten(m, len(text))
        e = bild_speichern(job["owner"], fertig.read_bytes(), {
            "prompt": text, "modell": m["id"], "modell_name": m["name"], "parameter": job["parameter"],
            "refs": [], "kosten": round(kosten, 6), "auftrag": job["id"], "dauer": audio.dauer(w["ffprobe"], fertig)})
        if not e:
            raise RuntimeError("Die Antwort war keine lesbare Audiodatei.")
        ziel_roh = ordner / f"{e['id']}.{endung}"
        roh.replace(ziel_roh)              # Original bleibt → „Klang anpassen“ kostet nichts
        bild_aendern(e["id"], job["owner"], lambda b: b.update({"roh": ziel_roh.name}))
        if fertig != roh:
            fertig.unlink(missing_ok=True)
        job["bilder"].append(e["id"])
        job["kosten"] = round(kosten, 6)
        job["status"] = "fertig"
    except (RuntimeError, OSError, ValueError) as err:
        job["fehler"].append(str(err)[:400])
        job["status"] = "fehler"
    job["ende"] = jetzt()
    verbrauch_schreiben({"zeit": job["ende"], "owner": job["owner"], "modell": m["id"], "art": "audio",
                         "bilder": len(job["bilder"]), "kosten": job["kosten"], "tokens": 0, "status": job["status"]})


def audio_klang_aendern(name: str, bid: str, klang: dict) -> dict:
    """Regler neu einrechnen – aus dem gespeicherten Original, ohne neuen Aufruf."""
    b = bild_finden(bid) if ID_RE.match(bid or "") else None
    if not b or b["owner"] != name or b.get("typ") != "audio":
        raise Fehler(404, "Audio nicht gefunden.")
    roh = DATA / "audio_roh" / str(b.get("roh") or "")
    if not b.get("roh") or not roh.is_file():
        raise Fehler(409, "Das Original fehlt – der Klang lässt sich nicht mehr ändern.")
    klang = audio.klang_saeubern(klang)
    w = werkzeug_pfade(einstellungen())
    neu = DATA / "audio_roh" / f"_{bid}_neu.mp3"
    audio.klang_einrechnen(w["ffmpeg"], roh, neu, klang)
    medium_pfad(b).write_bytes(neu.read_bytes())
    dauer = audio.dauer(w["ffprobe"], neu)
    neu.unlink(missing_ok=True)

    def fn(x):
        x["parameter"] = {**(x.get("parameter") or {}), "klang": klang}
        x["dauer"] = dauer
    return bild_aendern(bid, name, fn)


def stimmprobe(m: dict, stimme: str, klon: str = "", owner: str = "") -> str:
    """Kurze Probe je Modell+Stimme (bzw. geklonter Stimme), einmal bezahlt und dann gespeichert."""
    stimme = stimme_pruefen(m, stimme)
    refs = None
    if klon:
        if not m.get("klonen"):
            raise Fehler(400, f"{m['name']} kann keine Stimmen klonen.")
        s = eigene_stimme(owner, klon)
        refs = audio.referenzen((DATA / "stimmen" / f"{klon}.mp3").read_bytes(), "audio/mpeg", s.get("transkript", ""))
        stimme = ""        # siehe audio_auftrag_starten: nie voice zusammen mit einer Stimmprobe
    kennung = hashlib.sha1(f"{m['id']}|{stimme}|{klon}".encode()).hexdigest()
    ziel = DATA / "cache" / "stimmproben" / f"{kennung}.mp3"
    if not ziel.is_file():
        if not api_key() and not m.get("lokal"):
            raise Fehler(400, "Für Stimmproben wird ein OpenRouter-Schlüssel gebraucht.")
        try:
            daten, art, _ = tts(m, audio.PROBE_TEXT, stimme, refs, klon)
        except RuntimeError as err:
            raise Fehler(502, str(err)[:300]) from None
        ziel.parent.mkdir(parents=True, exist_ok=True)
        if "wav" in art:
            tmp = ziel.with_suffix(".wav")
            tmp.write_bytes(daten)
            audio.klang_einrechnen(werkzeug_pfade(einstellungen())["ffmpeg"], tmp, ziel, {})
            tmp.unlink(missing_ok=True)
        else:
            ziel.write_bytes(daten)
        verbrauch_schreiben({"zeit": jetzt(), "owner": "-", "modell": m["id"], "art": "stimmprobe", "bilder": 0,
                             "kosten": audio.kosten(m, len(audio.PROBE_TEXT)), "tokens": 0, "status": "fertig"})
    return kennung


def profile_saeubern(liste) -> list:
    out = []
    for p in (liste if isinstance(liste, list) else [])[:30]:
        if not isinstance(p, dict):
            continue
        pid = str(p.get("id") or "")
        klon = str(p.get("klon") or "")      # eigene (geklonte) Stimme; Besitz wird erst beim Erzeugen geprüft
        out.append({"id": pid if ID_RE.match(pid) or pid == "standard" else neue_id(),
                    "name": str(p.get("name") or "Profil").strip()[:40], "modell": str(p.get("modell") or "")[:120],
                    "stimme": str(p.get("stimme") or "")[:80], "klon": klon if ID_RE.match(klon) else "",
                    "klang": audio.klang_saeubern(p.get("klang"))})
    return out


def stimmprofil_speichern(e: dict) -> dict:
    """Feinjustierung aus dem Klang-Regler unter einem Namen sichern. Gleicher Name (ohne Groß/klein) → überschreiben."""
    name = str(e.get("name") or "").strip()[:40]
    if not name:
        raise Fehler(400, "Bitte einen Namen angeben.")
    if not audiomodell(str(e.get("modell") or "")):
        raise Fehler(400, "Unbekanntes Sprachmodell.")
    with LOCK:
        s = einstellungen()
        liste = list(s["stimmprofile"])
        alt = next((p for p in liste if p["name"].strip().lower() == name.lower()), None)
        neu = {"id": alt["id"] if alt else "", "name": name, "modell": e.get("modell"), "stimme": e.get("stimme"),
               "klon": e.get("klon"), "klang": e.get("klang")}
        if alt:
            liste[liste.index(alt)] = neu
        elif len(liste) >= 30:
            raise Fehler(400, "Höchstens 30 Profile – bitte unter Einstellungen → Audio aufräumen.")
        else:
            liste.append(neu)
        s["stimmprofile"] = profile_saeubern(liste)
        profil = next(p for p in s["stimmprofile"] if p["name"] == name)
        if e.get("standard"):
            s["standard_profil"] = profil["id"]
        schreib_json("einstellungen.json", s)
    return {"profil": profil, "profile": s["stimmprofile"], "standard_profil": s.get("standard_profil", ""),
            "ueberschrieben": bool(alt)}


# --------------------------------------------------------------------------- Gesamtkatalog
def katalog_gesamt() -> dict:
    """Alle Modellarten mit kompakten Kostenangaben – für die Katalogansicht und die Modellwahl."""
    bild = []
    for m in katalog_laden()["modelle"]:
        p = m["parameter"]
        aufl = "1K" if "1K" in (p.get("resolution") or {}).get("werte", ["1K"]) else ""
        qual = next((q for q in ("high", "medium", "auto") if q in (p.get("quality") or {}).get("werte", [])), "")
        s = schaetzen(m, aufl, qual, 1)
        bild.append({**m, "preis_bild": None if s["quelle"] == "unbekannt" else s["je_bild"]})
    video = []
    for m in vkatalog_laden()["modelle"]:
        preise = [video_preis(m, r, t, False) for r in (m["aufloesungen"] or [""]) for t in (False, True)]
        werte = [p["je_sekunde"] for p in preise if p["quelle"] != "unbekannt" and p["je_sekunde"] > 0]
        video.append({**m, "preis_sek_min": min(werte) if werte else None, "preis_sek_max": max(werte) if werte else None})
    return {"bild": bild, "video": video, "sprache": lokal_stimme.modelle() + akatalog_laden()["modelle"], "text": chatmodelle(),
            "stand": {"bild": KATALOG["stand"], "video": VKATALOG["stand"], "sprache": AKATALOG["stand"],
                      "text": CHATMODELLE["stand"]},
            "fehler": {"bild": KATALOG["fehler"], "video": VKATALOG["fehler"], "sprache": AKATALOG["fehler"]}}


KATALOG_TAKT = 6 * 3600


def katalog_waechter() -> None:
    """Hält alle Kataloge aktuell, ohne dass jemand nachschauen muss (alle 6 Stunden)."""
    while True:
        time.sleep(KATALOG_TAKT)
        for fn in (katalog_laden, vkatalog_laden, akatalog_laden):
            try:
                fn(erzwingen=True)
            except Exception:  # noqa: BLE001 — ein Fehler darf den Wächter nicht beenden
                pass
        CHATMODELLE["stand"] = 0
        chatmodelle()


def im_explorer_zeigen(pfad_: Path) -> None:
    if os.name != "nt":
        raise Fehler(400, "„Im Ordner zeigen“ gibt es nur unter Windows.")
    if pfad_.is_file():
        subprocess.Popen(["explorer", f"/select,{pfad_}"], creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
    else:
        pfad_.mkdir(parents=True, exist_ok=True)
        subprocess.Popen(["explorer", str(pfad_)], creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))


# --------------------------------------------------------------------------- Seitenchat
CHAT_MODI =("assistent", "drehbuch", "klon")
CHAT_LAEUFT: dict[str, threading.Event] = {}
CLAUDE_INFO: dict = {}


def chat_ordner(name: str) -> Path:
    p = DATA / "chats" / name
    p.mkdir(parents=True, exist_ok=True)
    return p


def chat_laden(name: str, cid: str) -> dict:
    if not ID_RE.match(cid or ""):
        raise Fehler(404, "Chat nicht gefunden.")
    f = chat_ordner(name) / f"{cid}.json"
    if not f.is_file():
        raise Fehler(404, "Chat nicht gefunden.")
    return json.loads(f.read_text("utf-8"))


def chat_speichern(name: str, chat: dict) -> None:
    chat["geaendert"] = jetzt()
    schreib_json(f"chats/{name}/{chat['id']}.json", chat)


def chat_liste(name: str) -> list:
    out = []
    for f in chat_ordner(name).glob("*.json"):
        try:
            c = json.loads(f.read_text("utf-8"))
        except (OSError, ValueError):
            continue
        out.append({"id": c["id"], "titel": c.get("titel", ""), "modus": c.get("modus", "assistent"),
                    "geaendert": c.get("geaendert", ""), "anzahl": len(c.get("nachrichten", [])),
                    "klon": bool((c.get("klon") or {}).get("analyse"))})
    return sorted(out, key=lambda c: c["geaendert"], reverse=True)


def claude_status(s: dict) -> dict:
    """Ist die CLI da? Version wird einmal je Pfad ermittelt (kein Modellaufruf, kostet nichts)."""
    exe = assistent.claude_finden(s.get("claude_pfad", ""))
    if exe and CLAUDE_INFO.get("exe") != exe:
        try:
            r = subprocess.run([exe, "--version"], capture_output=True, text=True, timeout=20,
                               creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
            CLAUDE_INFO.update({"exe": exe, "version": (r.stdout or "").strip()[:60]})
        except (OSError, subprocess.SubprocessError):
            CLAUDE_INFO.update({"exe": exe, "version": ""})
    return {"gefunden": bool(exe), "version": CLAUDE_INFO.get("version", "") if exe else "",
            "ort": ("eigener Pfad" if s.get("claude_pfad") else "automatisch gefunden") if exe else ""}


def gehirne(s: dict, mit_bildern: bool) -> list[str]:
    """Reihenfolge der Gehirne. Bilder im Chat → nur OpenRouter-Vision (die CLI sieht keine Bilder)."""
    or_ok = bool(api_key())
    if mit_bildern:
        return ["vision"] if or_ok else []
    liste = []
    if s["assistent_claude"] and assistent.claude_finden(s.get("claude_pfad", "")):
        liste.append("claude")
    if or_ok and (not liste or s["assistent_rueckfall"]):
        liste.append("openrouter")
    return liste


def prompt_modelle(s: dict, kontext: dict) -> tuple[list, list]:
    """Empfohlene Modelle + das gerade gewählte – hält die Anweisung kurz."""
    bm, vm = katalog_laden()["modelle"], [m for m in vkatalog_laden()["modelle"] if m["art"] == "erzeugen"]
    b_ids = set(s["empfohlen"]) | {str(kontext.get("bildmodell") or "")}
    v_ids = set(s["empfohlen_video"]) | {str(kontext.get("videomodell") or "")}
    b = [m for m in bm if m["id"] in b_ids] or bm[:12]     # nie ohne Modelle: sonst keine gültigen Karten
    v = [m for m in vm if m["id"] in v_ids] or vm[:12]
    return b, v


def claude_testen(s: dict, modell: str) -> dict:
    """Kurzer echter Aufruf (wenige Tokens aus dem Abo), nur auf Knopfdruck in den Einstellungen."""
    exe = assistent.claude_finden(s.get("claude_pfad", ""))
    if not exe:
        return {"erfolg": False, "meldung": "Claude-CLI nicht gefunden."}
    t0, text, fehler_ = time.time(), "", ""
    for art, wert in assistent.claude_strom(exe, modell or s["assistent_claude_modell"], "Antworte nur mit dem Wort: Bereit",
                                            DATA / "assistent_arbeit", env("CLAUDE_CODE_OAUTH_TOKEN"),
                                            threading.Event(), zeitlimit=120):
        if art == "text":
            text += str(wert)
        elif art == "fehler":
            fehler_ = str(wert)
    return {"erfolg": bool(text) and not fehler_, "meldung": fehler_ or text.strip()[:80],
            "sekunden": round(time.time() - t0, 1)}


# --------------------------------------------------------------------------- Video-Clone
KLON_JOBS: dict[str, dict] = {}
KLON_MAX = 500 * 1024 * 1024


def werkzeug_pfade(s: dict) -> dict:
    ffmpeg = klon.werkzeug("ffmpeg", s.get("ffmpeg_pfad", ""))
    ffprobe_neben = str(Path(ffmpeg).with_name("ffprobe" + Path(ffmpeg).suffix)) if ffmpeg else ""
    return {"ffmpeg": ffmpeg, "ffprobe": klon.werkzeug("ffprobe", ffprobe_neben if Path(ffprobe_neben or ".").is_file() else ""),
            "ytdlp": klon.werkzeug("yt-dlp", s.get("ytdlp_pfad", ""))}


def werkzeug_status(s: dict) -> dict:
    return {k: bool(v) for k, v in werkzeug_pfade(s).items()}


def klon_starten(name: str, e: dict) -> dict:
    chat = chat_laden(name, str(e.get("chat") or ""))
    s = einstellungen()
    w = werkzeug_pfade(s)
    if not (w["ffmpeg"] and w["ffprobe"]):
        raise Fehler(400, "ffmpeg/ffprobe nicht gefunden – Pfad unter Einstellungen → Assistent angeben.")
    if not api_key():
        raise Fehler(400, "Für die Analyse wird ein OpenRouter-Schlüssel gebraucht (Einstellungen → Anschluss).")
    url, datei, vorlage = str(e.get("url") or "").strip(), None, None
    if url:
        url = klon.url_pruefen(url)
        if not w["ytdlp"]:
            raise Fehler(400, "yt-dlp nicht gefunden – Pfad unter Einstellungen → Assistent angeben.")
    elif e.get("vorlage"):
        vorlage, mime = vorlage_datei(str(e["vorlage"]))
        if not mime.startswith("video/") or vorlage.stat().st_size > KLON_MAX:
            raise Fehler(400, "Diese Vorlage ist kein Video bis 500 MB.")
    else:
        up = lies_json("klon_uploads.json", {}).get(str(e.get("upload") or ""))
        if not up or up["owner"] != name:
            raise Fehler(400, "Bitte einen Link angeben oder ein Video hochladen.")
        datei = clone_ordner() / up["datei"]
    if any(j["owner"] == name and j["status"] == "laeuft" for j in KLON_JOBS.values()):
        raise Fehler(409, "Es läuft bereits eine Analyse.")
    if vorlage:     # Kopie analysieren – die Analyse löscht ihre Quelle, die Vorlage bleibt liegen
        datei = clone_ordner() / f"{neue_id()}{vorlage.suffix.lower()}"
        shutil.copyfile(vorlage, datei)
    job = {"id": neue_id(), "owner": name, "chat": chat["id"], "status": "laeuft", "schritt": "Wird vorbereitet …",
           "nr": 0, "von": 4, "fehler": "", "start": jetzt()}
    KLON_JOBS[job["id"]] = job
    threading.Thread(target=klon_ausfuehren, args=(job, url, datei, s, w), daemon=True).start()
    return {k: v for k, v in job.items() if k != "owner"}


def klon_ausfuehren(job: dict, url: str, datei: Path | None, s: dict, w: dict) -> None:
    ordner = DATA / "klon" / job["id"]
    ordner.mkdir(parents=True, exist_ok=True)
    schreib_json(f"klon/{job['id']}/info.json", {"owner": job["owner"], "chat": job["chat"]})

    def schritt(nr, text):
        job.update({"nr": nr, "schritt": text})

    quelle, titel = datei, ""
    try:
        if url:
            schritt(1, "Video wird geladen …")
            quelle, titel = klon.herunterladen(url, ordner, w["ytdlp"], w["ffmpeg"])
        else:
            schritt(1, "Hochgeladenes Video wird gelesen …")
        dauer = klon.dauer_messen(w["ffprobe"], quelle)
        if dauer > 600:
            raise RuntimeError("Das Video ist länger als 10 Minuten – bitte ein kürzeres wählen.")
        schritt(2, "Szenenschnitte werden erkannt …")
        szenen = klon.szenen_bilden(klon.schnitte_finden(w["ffmpeg"], quelle), dauer)
        schritt(3, f"{len(szenen)} Standbilder werden gezogen …")
        bilder_ = klon.standbilder(w["ffmpeg"], quelle, szenen, ordner / "bilder")
        schritt(4, f"Analyse mit {s['klon_modell']} …")
        analyse, kosten = klon.analysieren(api_key(), s["klon_modell"], szenen, bilder_, dauer, titel, or_basis())
        bericht = klon.bericht(analyse, dauer, titel)
        schreib_json(f"klon/{job['id']}/analyse.json", {"analyse": analyse, "szenen": szenen, "titel": titel,
                                                         "quelle": url or "eigene Datei", "dauer": dauer})
        name = job["owner"]
        with LOCK:
            chat = chat_laden(name, job["chat"])
            chat["klon"] = {"job": job["id"], "titel": titel, "quelle": url or "eigene Datei", "dauer": dauer,
                            "szenen": len(szenen), "bilder": [f"/klonbild/{job['id']}/{p.stem}" for p in bilder_],
                            "analyse": analyse, "bericht": bericht, "kosten": round(kosten, 4)}
            if not chat.get("titel"):
                chat["titel"] = ("Clone: " + (titel or "eigenes Video"))[:60]
            chat_speichern(name, chat)
        if kosten:
            verbrauch_schreiben({"zeit": jetzt(), "owner": name, "modell": s["klon_modell"], "art": "analyse",
                                 "bilder": 0, "kosten": kosten, "tokens": 0, "status": "fertig"})
        job.update({"status": "fertig", "schritt": "Analyse fertig.", "kosten": round(kosten, 4)})
    except (RuntimeError, ValueError, OSError, Fehler) as e:
        job.update({"status": "fehler", "fehler": getattr(e, "meldung", None) or str(e)[:400]})
    finally:
        # Quellvideo nicht aufbewahren: nur Standbilder und Analyse bleiben
        for p in ordner.glob("quelle.*"):
            p.unlink(missing_ok=True)
        if datei:
            datei.unlink(missing_ok=True)


CHATMODELLE: dict = {"liste": [], "stand": 0}


def chatmodelle() -> list:
    """Textmodelle von OpenRouter für die Auswahl in den Einstellungen (24 h im Speicher)."""
    if CHATMODELLE["liste"] and time.time() - CHATMODELLE["stand"] < KATALOG_TTL:
        return CHATMODELLE["liste"]
    try:
        daten = or_anfrage("/models", mit_key=False).get("data", [])
    except RuntimeError:
        return CHATMODELLE["liste"]
    liste = []
    for m in daten:
        a = m.get("architecture") or {}
        if "text" not in (a.get("output_modalities") or []) or "image" in (a.get("output_modalities") or []):
            continue
        try:
            preis = float(m["pricing"]["prompt"]) * 1e6, float(m["pricing"]["completion"]) * 1e6
        except (KeyError, TypeError, ValueError):
            continue
        if preis[0] < 0:
            continue
        liste.append({"id": m["id"], "name": m.get("name", m["id"]), "erstellt": m.get("created") or 0,
                      "kontext": m.get("context_length") or 0, "frei": preis[0] == 0 and preis[1] == 0,
                      "vision": "image" in (a.get("input_modalities") or []),
                      "video": "video" in (a.get("input_modalities") or []), "preis_ein": round(preis[0], 3),
                      "preis_aus": round(preis[1], 3)})
    CHATMODELLE.update({"liste": sorted(liste, key=lambda x: x["id"]), "stand": time.time()})
    return CHATMODELLE["liste"]


# --------------------------------------------------------------------------- Prompt übersetzen
UEBERSETZ_AUFTRAG = ("Übersetze den folgenden Bild- bzw. Video-Prompt ins Deutsche. Behalte Absätze, Aufzählungen und Fachbegriffe "
                     "(z. B. Kameraeinstellungen) bei. Nichts erklären, nichts kommentieren – antworte nur mit der Übersetzung.")


def prompt_uebersetzen(name: str, e: dict) -> dict:
    """Prompt eines Bildes (oder freien Text) ins Deutsche. Beim eigenen Bild wird die Übersetzung gespeichert."""
    bid = str(e.get("bild") or "")
    b = bild_finden(bid) if bid else None
    if bid and (not b or not darf_sehen(b, name)):
        raise Fehler(404, "Bild nicht gefunden.")
    if b and b.get("prompt_de"):
        return {"text": b["prompt_de"], "kosten": 0}
    text = str(b["prompt"] if b else e.get("text") or "").strip()[:8000]
    if not text:
        raise Fehler(400, "Kein Text zum Übersetzen.")
    if not api_key():
        raise Fehler(400, "Für die Übersetzung wird ein OpenRouter-Schlüssel gebraucht (Einstellungen → Anschluss).")
    modell_id = einstellungen()["assistent_or_modell"]
    teile, kosten = [], 0.0
    for art, wert in assistent.openrouter_strom(api_key(), modell_id, [{"role": "system", "content": UEBERSETZ_AUFTRAG},
                                                                      {"role": "user", "content": text}], threading.Event(), or_basis()):
        if art == "text":
            teile.append(str(wert))
        elif art == "fehler":
            raise RuntimeError(str(wert))
        elif art == "ende":
            kosten = float((wert or {}).get("kosten") or 0)
    de = "".join(teile).strip()
    if not de:
        raise RuntimeError("Die Übersetzung kam leer zurück.")
    if b and b["owner"] == name:
        with LOCK:
            liste = bilder()
            for x in liste:
                if x["id"] == b["id"]:
                    x["prompt_de"] = de
            schreib_json("bilder.json", liste)
    if kosten:
        verbrauch_schreiben({"zeit": jetzt(), "owner": name, "modell": modell_id, "art": "uebersetzung",
                             "bilder": 0, "kosten": kosten, "tokens": 0, "status": "fertig"})
    return {"text": de, "kosten": round(kosten, 5)}


# --------------------------------------------------------------------------- Vorlagen-Ordner
# Liegen neben den Ergebnissen: <Ablage>\vorlagen\bilder|videos\<ordner>\datei (+ gleichnamige .txt = Prompt).
# Wer dort Dateien hineinlegt, sieht sie beim nächsten Öffnen von Influencer › Bewegung – ohne Neustart.
VORLAGEN_ARTEN = {"bilder": "image/", "videos": "video/"}
VORLAGEN_ORDNER = {"bilder": ("charaktere", "posen", "outfits", "hintergruende"),
                   "videos": ("tanz", "gehen", "gruppe", "sport", "sonstiges")}
VORLAGEN_ENDUNGEN = {".png", ".jpg", ".jpeg", ".webp", ".mp4", ".mov", ".webm"}


def vorlagen_wurzel() -> Path:
    return ablage_wurzel() / "vorlagen"


def vorlagen_liste() -> dict:
    w = vorlagen_wurzel()
    for art, ordner in VORLAGEN_ORDNER.items():
        for o in ordner:
            try:
                (w / art / o).mkdir(parents=True, exist_ok=True)
            except OSError:
                pass
    aus = []
    for art, praefix in VORLAGEN_ARTEN.items():
        try:
            unterordner = sorted((p for p in (w / art).iterdir() if p.is_dir()), key=lambda p: p.name.lower())
        except OSError:
            continue
        for ordner in unterordner:
            for f in sorted(ordner.iterdir(), key=lambda p: p.name.lower()):
                if len(aus) >= 1000 or not f.is_file() or f.suffix.lower() not in VORLAGEN_ENDUNGEN:
                    continue
                if not ((praefix == "image/") == (f.suffix.lower() in (".png", ".jpg", ".jpeg", ".webp"))):
                    continue
                prompt, txt = "", f.with_suffix(".txt")
                if txt.is_file():
                    try:
                        prompt = txt.read_text("utf-8", errors="replace")[:4000].strip()
                    except OSError:
                        pass
                rel = f"{art}/{ordner.name}/{f.name}"
                aus.append({"art": "bild" if art == "bilder" else "video", "ordner": ordner.name, "name": f.stem,
                            "pfad": rel, "url": "/vorlage/" + quote(rel), "prompt": prompt})
    return {"pfad": str(w), "ordner": VORLAGEN_ORDNER, "vorlagen": aus}


def vorlage_datei(rel: str) -> tuple[Path, str]:
    """Pfad „bilder|videos/<ordner>/<datei>“ → Datei und Typ (an den ersten Bytes geprüft). Nichts außerhalb von Vorlagen."""
    teile = str(rel).replace("\\", "/").split("/")
    if len(teile) != 3 or teile[0] not in VORLAGEN_ARTEN or any(t in ("", ".", "..") for t in teile):
        raise Fehler(404, "Vorlage nicht gefunden.")
    w = vorlagen_wurzel().resolve()
    f = (w / teile[0] / teile[1] / teile[2]).resolve()
    if f.suffix.lower() not in VORLAGEN_ENDUNGEN or not f.is_relative_to(w) or not f.is_file():
        raise Fehler(404, "Vorlage nicht gefunden.")
    with open(f, "rb") as d:
        typ = bild_typ(d.read(64))
    if not typ or not typ[0].startswith(VORLAGEN_ARTEN[teile[0]]) or typ[0] == "image/svg+xml":
        raise Fehler(415, "Diese Vorlage hat kein unterstütztes Format.")
    return f, typ[0]


def vorlage_als_upload(name: str, rel: str) -> dict:
    """Bild-Vorlage als Referenz übernehmen (Kopie in uploads), z. B. als Basis eines Influencers."""
    f, mime = vorlage_datei(rel)
    if not mime.startswith("image/") or f.stat().st_size > MAX_UPLOAD:
        raise Fehler(400, "Nur Bild-Vorlagen bis 12 MB lassen sich übernehmen.")
    uid, endung = neue_id(), bild_typ(f.read_bytes()[:64])[1]
    shutil.copyfile(f, uploads_ordner() / f"{uid}.{endung}")
    with LOCK:
        ups = lies_json("uploads.json", {})
        ups[uid] = {"owner": name, "datei": f"{uid}.{endung}", "mime": mime, "erstellt": jetzt(), "name": f.stem[:120]}
        schreib_json("uploads.json", ups)
    return {"id": uid, "url": f"/upload/{uid}"}


# --------------------------------------------------------------------------- HTTP
STATIC = {"index.html": "text/html; charset=utf-8", "app.css": "text/css; charset=utf-8",
          "app.js": "text/javascript; charset=utf-8", "chat.js": "text/javascript; charset=utf-8", "medien.js": "text/javascript; charset=utf-8",
          "influencer.js": "text/javascript; charset=utf-8", "bewegung.js": "text/javascript; charset=utf-8", "influencer_vorlagen.json": "application/json; charset=utf-8",
          "muster_haupttaenzer.webp": "image/webp", "logo.jpg": "image/jpeg", "favicon.svg": "image/svg+xml"}


class Fehler(Exception):
    def __init__(self, code: int, meldung: str):
        super().__init__(meldung)
        self.code, self.meldung = code, meldung


class Handler(BaseHTTPRequestHandler):
    server_version = "Multi-LLM"
    sys_version = ""

    def log_message(self, fmt, *args):  # knappes Protokoll ohne Abfrageparameter
        pass

    # ---- Antworten
    def _kopf_sicherheit(self):
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("X-Frame-Options", "DENY")

    def json(self, daten, code: int = 200, extra: dict | None = None):
        roh = json.dumps(daten, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(roh)))
        self.send_header("Cache-Control", "no-store")
        self._kopf_sicherheit()
        for k, v in (extra or {}).items():
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(roh)

    def datei(self, f: Path, mime: str, download: str = "", cache: bool = False):
        st = f.stat()
        groesse = st.st_size
        etag = f'"{st.st_mtime_ns:x}-{groesse:x}"'
        bereich = self.headers.get("Range") if mime.startswith(("video/", "audio/")) else None
        if cache and not bereich and self.headers.get("If-None-Match") == etag:
            # Datei unverändert → 304; ein Zuschnitt ändert mtime/Größe und damit das ETag
            self.send_response(304)
            self.send_header("ETag", etag)
            self.end_headers()
            return
        anfang, ende, code = 0, groesse - 1, 200
        if bereich:     # Vorspulen im Videoplayer (HTTP-Range, nur ein Bereich)
            m = re.match(r"^bytes=(\d*)-(\d*)$", bereich.strip())
            if m and (m.group(1) or m.group(2)):
                if m.group(1):
                    anfang = int(m.group(1))
                    ende = min(int(m.group(2)), groesse - 1) if m.group(2) else groesse - 1
                else:
                    anfang = max(0, groesse - int(m.group(2)))
                if anfang > ende or anfang >= groesse:
                    self.send_response(416)
                    self.send_header("Content-Range", f"bytes */{groesse}")
                    self.send_header("Content-Length", "0")
                    self.end_headers()
                    return
                code = 206
        self.send_response(code)
        self.send_header("Content-Type", mime)
        self.send_header("Content-Length", str(ende - anfang + 1))
        self.send_header("Cache-Control", "private, no-cache" if cache else "no-cache")
        if mime.startswith(("video/", "audio/")):
            self.send_header("Accept-Ranges", "bytes")
        if code == 206:
            self.send_header("Content-Range", f"bytes {anfang}-{ende}/{groesse}")
        if cache:
            self.send_header("ETag", etag)
        self._kopf_sicherheit()
        if mime.startswith(("image/", "video/", "audio/")):
            self.send_header("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; sandbox")
        if download:
            self.send_header("Content-Disposition", f'attachment; filename="{download}"')
        self.end_headers()
        with open(f, "rb") as fh:
            fh.seek(anfang)
            rest = ende - anfang + 1
            while rest > 0:
                stueck = fh.read(min(1 << 20, rest))
                if not stueck:
                    break
                self.wfile.write(stueck)
                rest -= len(stueck)

    # ---- Anfrage-Hilfen
    def _host_ok(self) -> bool:
        host = (self.headers.get("Host") or "").split(":")[0].lower()
        return host in ("127.0.0.1", "localhost")

    def _sitzung(self):
        c = cookies.SimpleCookie(self.headers.get("Cookie") or "")
        token = c["bildgen_sid"].value if "bildgen_sid" in c else ""
        with LOCK:
            s = SITZUNGEN.get(token)
            if s and s["bis"] < time.time():
                SITZUNGEN.pop(token, None)
                s = None
            if s:
                s["bis"] = time.time() + SESSION_TTL
        return token, s

    def _nutzer(self, post: bool) -> tuple[str, dict]:
        token, s = self._sitzung()
        if not s:
            raise Fehler(401, "Öffne Cinema Studio über die Werkstatt: links unten auf „Cinema-Studio“.")
        if post and not hmac.compare_digest(self.headers.get("X-CSRF", ""), s["csrf"]):
            raise Fehler(403, "Sicherheitsprüfung fehlgeschlagen – Seite neu laden.")
        u = benutzer().get(s["benutzer"])
        if not u:
            raise Fehler(401, "Konto nicht mehr vorhanden.")
        return s["benutzer"], u

    def _koerper(self) -> dict:
        laenge = int(self.headers.get("Content-Length") or 0)
        if laenge > MAX_BODY:
            raise Fehler(413, "Anfrage zu groß.")
        if not laenge:
            return {}
        try:
            d = json.loads(self.rfile.read(laenge).decode("utf-8"))
        except ValueError:
            raise Fehler(400, "Ungültige Anfrage.") from None
        if not isinstance(d, dict):
            raise Fehler(400, "Ungültige Anfrage.")
        return d

    # ---- Einstieg
    def do_GET(self):
        self._ausfuehren(False)

    def do_POST(self):
        self._ausfuehren(True)

    def _ausfuehren(self, post: bool):
        if not self._host_ok():
            self.send_error(421, "Falscher Host")
            return
        url = urlparse(self.path)
        try:
            if not post and not url.path.startswith(("/api/", "/bild/", "/upload/", "/klonbild/", "/stimmprobe/", "/stimmdatei/", "/vorlage/")):
                return self._statisch(url.path)
            if url.path.startswith("/klonbild/"):
                return self._klonbild(url)
            if url.path.startswith("/stimmprobe/"):
                return self._stimmprobe(url)
            if url.path.startswith("/stimmdatei/"):
                return self._stimmdatei(url)
            if url.path.startswith(("/bild/", "/upload/")):
                return self._bilddatei(url)
            if url.path.startswith("/vorlage/") and not post:
                self._nutzer(False)
                f, mime = vorlage_datei(unquote(url.path[len("/vorlage/"):]))
                return self.datei(f, mime, cache=True)
            return self._api(url, post)
        except Fehler as e:
            self.json({"ok": False, "fehler": e.meldung}, e.code)
        except (ValueError, KeyError, TypeError) as e:
            self.json({"ok": False, "fehler": str(e) or "Ungültige Eingabe."}, 400)
        except RuntimeError as e:
            self.json({"ok": False, "fehler": str(e)}, 502)
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
            # Der Browser hat abgebrochen (z. B. Bild beim Scrollen nicht mehr gebraucht, WinError 10053).
            pass

    def _statisch(self, p: str):
        name = "index.html" if p in ("/", "/index.html") else p.lstrip("/").removeprefix("static/")
        if name not in STATIC or not (WEB / name).is_file():
            self.send_error(404)
            return
        self.datei(WEB / name, STATIC[name])

    def _bilddatei(self, url):
        name, _ = self._nutzer(False)
        teile = url.path.strip("/").split("/")
        if len(teile) != 2 or not ID_RE.match(teile[1]):
            raise Fehler(404, "Nicht gefunden.")
        if teile[0] == "bild":
            b = bild_finden(teile[1])
            if not b or not darf_sehen(b, name):
                raise Fehler(404, "Nicht gefunden.")
            f, mime = medium_pfad(b), b["mime"]
            dl = medium_pfad(b).name
            if "roh" in parse_qs(url.query) and b.get("typ") == "audio" and b["owner"] == name and b.get("roh"):
                f = DATA / "audio_roh" / str(b["roh"])        # Original für „Klang anpassen“ (Probehören)
                mime = "audio/wav" if f.suffix == ".wav" else "audio/mpeg"
        else:
            u = lies_json("uploads.json", {}).get(teile[1])
            if not u or u["owner"] != name:
                raise Fehler(404, "Nicht gefunden.")
            f, mime, dl = uploads_ordner() / u["datei"], u["mime"], u["datei"]
        if not f.is_file():
            raise Fehler(404, "Datei fehlt.")
        self.datei(f, mime, dl if "dl" in parse_qs(url.query) else "", cache=True)

    # ---- API
    def _api(self, url, post: bool):
        p = url.path[len("/api/"):]
        q = {k: v[0] for k, v in parse_qs(url.query).items()}
        if p == "stimme_upload" and post:        # Stimmprobe (Datei oder Mikrofonaufnahme) als Rohdaten
            name, _ = self._nutzer(True)
            return self._stimm_upload(name)
        if p == "klon/upload" and post:          # Rohdaten (Video) statt JSON
            name, _ = self._nutzer(True)
            return self._klon_upload(name)
        e = self._koerper() if post else {}

        # --- ohne Sitzung: nur Stand und Einlass. Eine Anmeldung gibt es nicht mehr (06.10.2026);
        # hinein kommt nur, wer aus der Werkstatt kommt (zugang.py).
        if p == "status" and not post:
            _, s = self._sitzung()
            u = benutzer().get(s["benutzer"]) if s else None
            return self.json({"ok": True, "nutzer": oeffentlich(u, s["benutzer"]) if u else None,
                              "csrf": s["csrf"] if u else None})
        if p == "einlass" and post:
            if not zugang.einlass_pruefen(e.get("marke")):
                raise Fehler(403, "Dieser Zugang ist abgelaufen oder schon benutzt. "
                                  "Öffne Cinema Studio noch einmal über die Werkstatt: links unten auf „Cinema-Studio“.")
            return self._anmelden(zugang.KONTO, werkstatt_konto())

        name, u = self._nutzer(post)
        admin = u.get("rolle") == "admin"

        # --- Einstellungen & Anschluss
        if p == "einstellungen" and not post:
            s = einstellungen()
            bindung_ = zugang.bindung()
            return self.json({"ok": True, "einstellungen": s, "schluessel": key_quelle(), "admin": admin,
                              "werkstatt": {"ablage": "",
                                            "schutzschicht": bool(bindung_["schutzschicht"])}})
        if p == "einstellungen" and post:
            if not admin:
                raise Fehler(403, "Nur für Administratoren.")
            s = einstellungen()
            if "standard_modell" in e:
                s["standard_modell"] = str(e["standard_modell"])[:120]
            if isinstance(e.get("empfohlen"), list):
                s["empfohlen"] = [str(x)[:120] for x in e["empfohlen"]][:40]
            if "standard_video" in e:
                s["standard_video"] = str(e["standard_video"])[:120]
            if isinstance(e.get("empfohlen_video"), list):
                s["empfohlen_video"] = [str(x)[:120] for x in e["empfohlen_video"]][:40]
            if "video_takt" in e:
                s["video_takt"] = max(5, min(int(e["video_takt"]), 120))
            if e.get("startbild_anpassung") in ("ki", "zuschneiden", "aus"):
                s["startbild_anpassung"] = e["startbild_anpassung"]
            for k in ("assistent_claude", "assistent_rueckfall", "assistent_auto"):
                if k in e:
                    s[k] = bool(e[k])
            if "assistent_claude_modell" in e:
                cm = str(e["assistent_claude_modell"]).strip()
                if cm and not assistent.CLAUDE_MODELL_RE.match(cm):
                    raise Fehler(400, "Claude-Modell: nur opus, sonnet oder claude-opus-…/claude-sonnet-… .")
                s["assistent_claude_modell"] = cm
            for k in ("assistent_or_modell", "assistent_vision_modell"):
                if k in e:
                    v = str(e[k]).strip()
                    if not re.match(r"^[a-z0-9._-]+/[A-Za-z0-9._:-]+$", v):
                        raise Fehler(400, "OpenRouter-Modell im Format anbieter/modell angeben.")
                    s[k] = v
            if e.get("assistent_sprache") in ("englisch", "deutsch"):
                s["assistent_sprache"] = e["assistent_sprache"]
            if "klon_modell" in e:
                v = str(e["klon_modell"]).strip()
                if not re.match(r"^[a-z0-9._-]+/[A-Za-z0-9._:-]+$", v):
                    raise Fehler(400, "Analyse-Modell im Format anbieter/modell angeben.")
                s["klon_modell"] = v
            for k, stamm in (("ffmpeg_pfad", "ffmpeg"), ("ytdlp_pfad", "yt-dlp")):
                if k in e:
                    pf = str(e[k]).strip().strip('"')
                    if pf and (not Path(pf).is_file() or Path(pf).stem.lower() != stamm):
                        raise Fehler(400, f"Unter diesem Pfad liegt keine {stamm}-Programmdatei.")
                    s[k] = pf
            if "standard_audio" in e:
                s["standard_audio"] = str(e["standard_audio"])[:120]
            if "stimmprofile" in e:
                s["stimmprofile"] = profile_saeubern(e["stimmprofile"])
            if "standard_profil" in e:       # Profil, mit dem das Audio-Eingabefeld beim Laden startet
                s["standard_profil"] = str(e["standard_profil"] or "")[:40]
            if s.get("standard_profil") and not any(p["id"] == s["standard_profil"] for p in s["stimmprofile"]):
                s["standard_profil"] = ""
            if "ablage_pfad" in e:
                ap = str(e["ablage_pfad"]).strip().strip('"')
                if ap:
                    try:
                        Path(ap).mkdir(parents=True, exist_ok=True)
                    except OSError:
                        raise Fehler(400, "Der Ablage-Ordner lässt sich nicht anlegen.") from None
                s["ablage_pfad"] = ap
            if "claude_pfad" in e:
                pf = str(e["claude_pfad"]).strip().strip('"')
                if pf and (not Path(pf).is_file() or Path(pf).stem.lower() != "claude"):
                    raise Fehler(400, "Unter diesem Pfad liegt keine claude-Programmdatei.")
                s["claude_pfad"] = pf
            if e.get("waehrung") in ("USD", "EUR"):
                s["waehrung"] = e["waehrung"]
            if e.get("anpassung") in ("strecken", "zuschneiden"):
                s["anpassung"] = e["anpassung"]
            if "eur_kurs" in e:
                s["eur_kurs"] = max(0.1, min(float(e["eur_kurs"]), 10.0))
            schreib_json("einstellungen.json", s)
            if e.get("schluessel") and zugang.bindung()["schutzschicht"]:
                raise Fehler(400, "Hier ist kein Schlüssel nötig: Cinema Studio nutzt den Schlüssel der Werkstatt. "
                                  "Ändern lässt er sich in der Academy unter Einstellungen → Tutor-KI.")
            if e.get("schluessel"):
                k = str(e["schluessel"]).strip()
                if not re.match(r"^sk-or-[A-Za-z0-9_-]{10,200}$", k):
                    raise Fehler(400, "Das sieht nicht wie ein OpenRouter-Schlüssel aus (sk-or-…).")
                setze_env("OPENROUTER_API_KEY", k)
                KONTO.clear()
            return self.json({"ok": True, "einstellungen": s, "schluessel": key_quelle()})
        # --- Seitenchat
        if p == "assistent/status" and not post:
            s = einstellungen()
            return self.json({"ok": True, "claude": claude_status(s), "schluessel": bool(api_key()),
                              "werkzeuge": werkzeug_status(s), "klon_modell": s["klon_modell"],
                              "modelle_claude": assistent.CLAUDE_MODELLE, "laeuft": name in CHAT_LAEUFT})
        if p == "assistent/modelle" and not post:
            return self.json({"ok": True, "modelle": chatmodelle()})
        if p == "assistent/test" and post:
            if not admin:
                raise Fehler(403, "Nur für Administratoren.")
            return self.json({"ok": True, **claude_testen(einstellungen(), str(e.get("modell") or ""))})
        if p == "chats" and not post:
            return self.json({"ok": True, "chats": chat_liste(name)})
        if p == "chats" and post:
            modus = e.get("modus") if e.get("modus") in CHAT_MODI else "assistent"
            chat = {"id": neue_id(), "titel": "", "modus": modus, "erstellt": jetzt(), "nachrichten": []}
            chat_speichern(name, chat)
            return self.json({"ok": True, "chat": chat})
        if p == "klon/start" and post:
            return self.json({"ok": True, "job": klon_starten(name, e)})
        if p == "klon/status" and not post:
            job = KLON_JOBS.get(q.get("id", ""))
            if not job or job["owner"] != name:
                raise Fehler(404, "Analyse nicht gefunden.")
            return self.json({"ok": True, "job": {k: v for k, v in job.items() if k != "owner"}})
        if p == "chat_abbrechen" and post:
            ev = CHAT_LAEUFT.get(name)
            if ev:
                ev.set()
            return self.json({"ok": True, "lief": bool(ev)})
        if p.startswith("chat/"):
            teile = p.split("/")
            cid = teile[1] if len(teile) > 1 else ""
            if len(teile) == 3 and teile[2] == "senden" and post:
                return self._chat_senden(name, cid, e)
            chat = chat_laden(name, cid)
            if not post:
                return self.json({"ok": True, "chat": chat})
            if e.get("loeschen"):
                (chat_ordner(name) / f"{cid}.json").unlink(missing_ok=True)
                return self.json({"ok": True})
            if e.get("leeren"):
                chat["nachrichten"] = []
            if "titel" in e:
                chat["titel"] = str(e["titel"]).strip()[:80]
            if e.get("modus") in CHAT_MODI:
                chat["modus"] = e["modus"]
            chat_speichern(name, chat)
            return self.json({"ok": True, "chat": chat})

        if p == "konto" and not post:
            return self.json({"ok": True, **konto_info()})

        # --- Modelle & Kosten
        if p == "modelle" and not post:
            k = katalog_laden(erzwingen=q.get("neu") == "1" and admin)
            s = einstellungen()
            return self.json({"ok": True, "modelle": k["modelle"], "stand": k["stand"], "fehler": k["fehler"],
                              "empfohlen": s["empfohlen"], "standard": s["standard_modell"],
                              "waehrung": s["waehrung"], "eur_kurs": s["eur_kurs"],
                              "anpassung": s["anpassung"]})
        if p == "schaetzen" and post:
            m = modell(str(e.get("modell", "")))
            if not m:
                raise Fehler(404, "Unbekanntes Modell.")
            return self.json({"ok": True, **schaetzen(m, str(e.get("aufloesung") or ""), str(e.get("qualitaet") or ""),
                                                        int(e.get("anzahl") or 1), int(e.get("prompt_len") or 0),
                                                        int(e.get("refs") or 0))})

        # --- Aufträge
        if p == "videomodelle" and not post:
            k = vkatalog_laden(erzwingen=q.get("neu") == "1" and admin)
            s = einstellungen()
            return self.json({"ok": True, "modelle": [m for m in k["modelle"] if m["art"] == "erzeugen"],
                              "bearbeiten": [m for m in k["modelle"] if m["art"] != "erzeugen"],
                              "stand": k["stand"], "fehler": k["fehler"],
                              "empfohlen": s["empfohlen_video"], "standard": s["standard_video"]})
        if p == "schaetzen_video" and post:
            m = videomodell(str(e.get("modell", "")))
            if not m:
                raise Fehler(404, "Unbekanntes Videomodell.")
            return self.json({"ok": True, **schaetzen_video(m, str(e.get("aufloesung") or ""), int(e.get("dauer") or 0),
                                                              bool(e.get("ton")), bool(e.get("mit_bild")),
                                                              int(e.get("anzahl") or 1))})
        if p == "audiomodelle" and not post:
            k = akatalog_laden(erzwingen=q.get("neu") == "1" and admin)
            s = einstellungen()
            return self.json({"ok": True, "modelle": lokal_stimme.modelle() + k["modelle"], "stand": k["stand"], "fehler": k["fehler"],
                              "standard": s["standard_audio"], "profile": s["stimmprofile"], "regler": audio.REGLER,
                              "standard_profil": s.get("standard_profil", ""),
                              "max_text": audio.MAX_TEXT})
        if p == "schaetzen_audio" and post:
            m = audiomodell(str(e.get("modell", "")))
            if not m:
                raise Fehler(404, "Unbekanntes Sprachmodell.")
            z = max(0, int(e.get("zeichen") or 0))
            return self.json({"ok": True, "gesamt": audio.kosten(m, z), "je_1000": round(m["je_zeichen"] * 1000, 4),
                              "frei": m["frei"], "zeichen": z})
        if p == "erzeugen_audio" and post:
            if not api_key() and not lokal_stimme.ist_lokal(str(e.get("modell", ""))):
                raise Fehler(400, "Kein OpenRouter-Schlüssel hinterlegt (Einstellungen → Anschluss).")
            return self.json({"ok": True, "auftrag": audio_auftrag_starten(name, e)})
        if p == "stimmprobe" and post:
            m = audiomodell(str(e.get("modell", "")))
            if not m:
                raise Fehler(404, "Unbekanntes Sprachmodell.")
            return self.json({"ok": True, "url": "/stimmprobe/" + stimmprobe(m, str(e.get("stimme") or ""),
                                                                              str(e.get("klon") or ""), name)})
        if p == "stimmprofil_speichern" and post:      # Profile gelten für alle – wie die Einstellungen nur Admin
            if not admin:
                raise Fehler(403, "Nur Administratoren können Einstellungen speichern.")
            return self.json({"ok": True, **stimmprofil_speichern(e)})
        if p == "stimmen" and not post:
            return self.json({"ok": True, "stimmen": eigene_stimmen(name)})
        if p == "stimmen" and post:
            return self.json({"ok": True, "stimme": stimme_anlegen(name, e), "stimmen": eigene_stimmen(name)})
        if p.startswith("stimme/") and post:
            sid = p.split("/", 1)[1]
            with LOCK:
                alle = lies_json("stimmen.json", {})
                if sid not in alle or alle[sid]["owner"] != name:
                    raise Fehler(404, "Eigene Stimme nicht gefunden.")
                if e.get("loeschen"):
                    alle.pop(sid)
                    (DATA / "stimmen" / f"{sid}.mp3").unlink(missing_ok=True)
                else:
                    if e.get("name"):
                        alle[sid]["name"] = str(e["name"]).strip()[:40]
                    if "transkript" in e:
                        alle[sid]["transkript"] = str(e["transkript"]).strip()[:2000]
                schreib_json("stimmen.json", alle)
            return self.json({"ok": True, "stimmen": eigene_stimmen(name)})
        if p == "katalog" and not post:
            if q.get("neu") == "1":
                if not admin:
                    raise Fehler(403, "Nur für Administratoren.")
                katalog_laden(True)
                vkatalog_laden(True)
                akatalog_laden(True)
                CHATMODELLE["stand"] = 0
            return self.json({"ok": True, **katalog_gesamt()})
        if p == "zeigen" and post:
            if e.get("id"):
                b = bild_finden(str(e["id"])) if ID_RE.match(str(e["id"])) else None
                if not b or b["owner"] != name:
                    raise Fehler(404, "Nicht gefunden.")
                im_explorer_zeigen(medium_pfad(b))
            else:
                im_explorer_zeigen(ablage_wurzel() / nutzerordner(name))
            return self.json({"ok": True, "pfad": str(ablage_wurzel() / nutzerordner(name))})
        if p == "erzeugen_video" and post:
            if not api_key():
                raise Fehler(400, "Kein OpenRouter-Schlüssel hinterlegt (Einstellungen → Anschluss).")
            return self.json({"ok": True, "auftrag": video_auftrag_starten(name, e)})
        if p == "erzeugen" and post:
            if not api_key():
                raise Fehler(400, "Kein OpenRouter-Schlüssel hinterlegt (Einstellungen → Anschluss).")
            return self.json({"ok": True, "auftrag": auftrag_starten(name, e)})
        if p == "auftraege" and not post:
            grenze = (datetime.now(timezone.utc) - timedelta(minutes=10)).isoformat()
            with LOCK:
                liste = [j for j in AUFTRAEGE.values() if j["owner"] == name
                         and (j["status"] == "laufend" or (j["ende"] or "") > grenze)]
            return self.json({"ok": True, "auftraege": liste})

        # --- Uploads (Referenzbilder)
        if p == "upload" and post:
            daten_url = str(e.get("daten", ""))
            if "," not in daten_url:
                raise Fehler(400, "Keine Bilddaten.")
            try:
                roh = base64.b64decode(daten_url.split(",", 1)[1], validate=True)
            except ValueError:
                raise Fehler(400, "Bilddaten beschädigt.") from None
            if len(roh) > MAX_UPLOAD:
                raise Fehler(413, "Bild zu groß (max. 12 MB).")
            typ = bild_typ(roh)
            if not typ or not typ[0].startswith("image/") or typ[0] == "image/svg+xml":
                raise Fehler(400, "Nur PNG, JPEG, WebP oder GIF.")
            uid = neue_id()
            (uploads_ordner() / f"{uid}.{typ[1]}").write_bytes(roh)
            with LOCK:
                ups = lies_json("uploads.json", {})
                ups[uid] = {"owner": name, "datei": f"{uid}.{typ[1]}", "mime": typ[0], "erstellt": jetzt(),
                            "name": str(e.get("name", ""))[:120]}
                schreib_json("uploads.json", ups)
            return self.json({"ok": True, "id": uid, "url": f"/upload/{uid}"})

        # --- Bibliothek
        if p == "bilder" and not post:
            return self.json({"ok": True, "bilder": bilder_liste(name, q)})
        if p == "sammel" and post:
            ids = [str(i) for i in (e.get("ids") or [])][:500]
            n = 0
            for bid in ids:
                if bild_aktion(name, bid, e):
                    n += 1
            return self.json({"ok": True, "anzahl": n})
        if p.startswith("bild/") and post and e.get("aktion") == "klang":
            return self.json({"ok": True, "bild": audio_klang_aendern(name, p.split("/", 1)[1], e.get("klang") or {})})
        if p.startswith("bild/") and post and e.get("aktion") == "zuschnitt":
            return self.json({"ok": True, "bild": zuschnitt_speichern(name, p.split("/", 1)[1], str(e.get("daten", "")))})
        if p.startswith("bild/") and post:
            b = bild_aktion(name, p.split("/", 1)[1], e)
            if b is None:
                raise Fehler(404, "Bild nicht gefunden.")
            return self.json({"ok": True, "bild": b})
        if p == "papierkorb_leeren" and post:
            with LOCK:
                liste = bilder()
                weg = [b for b in liste if b["owner"] == name and b.get("geloescht")]
                for b in weg:
                    medium_pfad(b).unlink(missing_ok=True)
                schreib_json("bilder.json", [b for b in liste if b not in weg])
            return self.json({"ok": True, "anzahl": len(weg)})

        # --- Ordner
        if p == "ordner" and not post:
            return self.json({"ok": True, "ordner": ordner_liste(name)})
        if p == "ordner" and post:
            titel = str(e.get("name", "")).strip()[:60]
            if not titel:
                raise Fehler(400, "Bitte einen Namen angeben.")
            with LOCK:
                alle = lies_json("ordner.json", {})
                oid = neue_id()
                alle[oid] = {"owner": name, "name": titel, "erstellt": jetzt()}
                schreib_json("ordner.json", alle)
            return self.json({"ok": True, "id": oid, "ordner": ordner_liste(name)})
        if p.startswith("ordner/") and post:
            oid = p.split("/", 1)[1]
            with LOCK:
                alle = lies_json("ordner.json", {})
                if oid not in alle or alle[oid]["owner"] != name:
                    raise Fehler(404, "Ordner nicht gefunden.")
                if e.get("loeschen"):
                    alle.pop(oid)
                    liste = bilder()
                    for b in liste:
                        if b.get("ordner") == oid:
                            b["ordner"] = None
                    schreib_json("bilder.json", liste)
                elif e.get("name"):
                    alle[oid]["name"] = str(e["name"]).strip()[:60]
                schreib_json("ordner.json", alle)
            return self.json({"ok": True, "ordner": ordner_liste(name)})

        # --- Elemente
        if p == "elemente" and not post:
            return self.json({"ok": True, "elemente": elemente_liste(name)})
        if p == "elemente" and post:
            titel = str(e.get("name", "")).strip()[:60]
            if not titel:
                raise Fehler(400, "Bitte einen Namen angeben.")
            art = e.get("art") if e.get("art") in ("figur", "produkt", "stil", "ort", "sonstiges") else "sonstiges"
            refs = [r for r in (str(x) for x in e.get("bilder") or []) if referenz_daten_erlaubt(r, name)]
            with LOCK:
                alle = lies_json("elemente.json", {})
                eid = neue_id()
                alle[eid] = {"owner": name, "name": titel, "art": art, "bilder": refs[:14], "erstellt": jetzt()}
                schreib_json("elemente.json", alle)
            return self.json({"ok": True, "id": eid, "elemente": elemente_liste(name)})
        if p.startswith("element/") and post:
            eid = p.split("/", 1)[1]
            with LOCK:
                alle = lies_json("elemente.json", {})
                el = alle.get(eid)
                if not el or el["owner"] != name:
                    raise Fehler(404, "Element nicht gefunden.")
                if e.get("loeschen"):
                    alle.pop(eid)
                else:
                    if e.get("name"):
                        el["name"] = str(e["name"]).strip()[:60]
                    for r in e.get("hinzu") or []:
                        if referenz_daten_erlaubt(str(r), name) and str(r) not in el["bilder"]:
                            el["bilder"].append(str(r))
                    weg = {str(r) for r in e.get("weg") or []}
                    el["bilder"] = [r for r in el["bilder"] if r not in weg][:14]
                schreib_json("elemente.json", alle)
            return self.json({"ok": True, "elemente": elemente_liste(name)})

        # --- Vorlagen-Ordner (Bilder/Videos neben den Ergebnissen)
        if p == "uebersetzen" and post:
            return self.json({"ok": True, **prompt_uebersetzen(name, e)})
        if p == "vorlagen" and not post:
            return self.json({"ok": True, **vorlagen_liste()})
        if p == "vorlagen/uebernehmen" and post:
            return self.json({"ok": True, **vorlage_als_upload(name, str(e.get("pfad") or ""))})

        # --- Influencer (Charaktere)
        if p == "influencer" and not post:
            return self.json({"ok": True, "influencer": influencer_liste(name)})
        if p == "influencer" and post:
            return self.json({"ok": True, "id": influencer_speichern(name, e), "influencer": influencer_liste(name)})
        if p.startswith("influencer/") and p.endswith("/loeschen") and post:
            iid = p.split("/")[1]
            with LOCK:
                alle = lies_json("influencer.json", {})
                if iid not in alle or alle[iid]["owner"] != name:
                    raise Fehler(404, "Influencer nicht gefunden.")
                alle.pop(iid)
                schreib_json("influencer.json", alle)
            return self.json({"ok": True, "influencer": influencer_liste(name)})

        # --- Verbrauch
        if p == "verbrauch" and not post:
            return self.json({"ok": True, **verbrauch_auswerten(name, admin and q.get("alle") == "1")})

        raise Fehler(404, "Unbekannter Aufruf.")

    def _klon_upload(self, name: str):
        """Eigenes Referenzvideo als Rohdaten (kein Base64), max. 500 MB, Format an den ersten Bytes geprüft."""
        laenge = int(self.headers.get("Content-Length") or 0)
        if not 0 < laenge <= KLON_MAX:
            raise Fehler(413, "Kein Video oder größer als 500 MB.")
        ordner = clone_ordner()
        uid = neue_id()
        teil = ordner / f"{uid}.part"
        kopf, rest = b"", laenge
        with open(teil, "wb") as f:
            while rest > 0:
                stueck = self.rfile.read(min(1 << 20, rest))
                if not stueck:
                    break
                kopf = kopf or stueck[:64]
                f.write(stueck)
                rest -= len(stueck)
        typ = bild_typ(kopf)
        if rest > 0 or not typ or not typ[0].startswith("video/"):
            teil.unlink(missing_ok=True)
            raise Fehler(400, "Nur MP4-, MOV- oder WebM-Videos." if rest <= 0 else "Upload unvollständig.")
        os.replace(teil, ordner / f"{uid}.{typ[1]}")
        with LOCK:
            ups = lies_json("klon_uploads.json", {})
            ups[uid] = {"owner": name, "datei": f"{uid}.{typ[1]}", "erstellt": jetzt(),
                        "name": re.sub(r"[^\w .-]", "", unquote(self.headers.get("X-Dateiname", "")))[:120]}
            schreib_json("klon_uploads.json", ups)
        return self.json({"ok": True, "id": uid})

    def _stimm_upload(self, name: str):
        """Stimmprobe als Rohdaten, max. 15 MB. Audio aller Art sowie WebM/MP4 aus Browser-Aufnahmen."""
        laenge = int(self.headers.get("Content-Length") or 0)
        if not 0 < laenge <= STIMM_UPLOAD_MAX:
            raise Fehler(413, "Keine Probe oder größer als 15 MB.")
        roh = self.rfile.read(laenge)
        typ = bild_typ(roh[:64])
        if len(roh) < laenge or not typ or not typ[0].startswith(("audio/", "video/webm", "video/mp4")):
            raise Fehler(400, "Bitte eine Audiodatei (MP3, WAV, OGG, FLAC, M4A) oder eine Aufnahme hochladen.")
        uid = neue_id()
        ordner = DATA / "stimmen" / "_roh"
        ordner.mkdir(parents=True, exist_ok=True)
        (ordner / f"{uid}.{typ[1]}").write_bytes(roh)
        with LOCK:
            ups = lies_json("stimm_uploads.json", {})
            ups[uid] = {"owner": name, "datei": f"{uid}.{typ[1]}", "erstellt": jetzt()}
            schreib_json("stimm_uploads.json", ups)
        return self.json({"ok": True, "id": uid})

    def _stimmdatei(self, url):
        name, _ = self._nutzer(False)
        sid = url.path.rsplit("/", 1)[-1]
        eigene_stimme(name, sid)
        f = DATA / "stimmen" / f"{sid}.mp3"
        if not f.is_file():
            raise Fehler(404, "Nicht gefunden.")
        self.datei(f, "audio/mpeg", cache=True)

    def _stimmprobe(self, url):
        self._nutzer(False)
        kennung = url.path.rsplit("/", 1)[-1]
        f = DATA / "cache" / "stimmproben" / f"{kennung}.mp3"
        if not re.match(r"^[0-9a-f]{40}$", kennung) or not f.is_file():
            raise Fehler(404, "Nicht gefunden.")
        self.datei(f, "audio/mpeg", cache=True)

    def _klonbild(self, url):
        name, _ = self._nutzer(False)
        teile = url.path.strip("/").split("/")
        if len(teile) != 3 or not ID_RE.match(teile[1]) or not re.match(r"^\d{2}$", teile[2]):
            raise Fehler(404, "Nicht gefunden.")
        info = lies_json(f"klon/{teile[1]}/info.json", {})
        f = DATA / "klon" / teile[1] / "bilder" / f"{teile[2]}.jpg"
        if info.get("owner") != name or not f.is_file():
            raise Fehler(404, "Nicht gefunden.")
        self.datei(f, "image/jpeg", cache=True)

    def _chat_senden(self, name: str, cid: str, e: dict):
        """Antwort als NDJSON-Strom: {"t":"text"|"hinweis"|"ende"|"fehler", …} je Zeile."""
        chat = chat_laden(name, cid)
        text = str(e.get("text") or "").strip()[:20000]
        if not text:
            raise Fehler(400, "Bitte eine Nachricht eingeben.")
        bild_ids = [str(i) for i in (e.get("bilder") or [])][:6]
        urls = [u for u in (referenz_daten(i, name) for i in bild_ids) if u]
        s = einstellungen()
        reihenfolge = gehirne(s, bool(urls))
        if not reihenfolge:
            raise Fehler(400, "Kein Gehirn verfügbar: Claude-CLI einschalten/installieren oder einen OpenRouter-Schlüssel hinterlegen.")
        abbruch = threading.Event()
        with LOCK:
            if name in CHAT_LAEUFT:
                raise Fehler(409, "Es läuft bereits eine Antwort – erst abwarten oder abbrechen.")
            CHAT_LAEUFT[name] = abbruch
        try:
            chat["nachrichten"].append({"rolle": "nutzer", "text": text, "zeit": jetzt(), "bilder": bild_ids})
            if not chat.get("titel"):
                chat["titel"] = re.sub(r"\s+", " ", text)[:60]
            chat_speichern(name, chat)
            kontext = e.get("kontext") if isinstance(e.get("kontext"), dict) else {}
            bm, vm = prompt_modelle(s, kontext)
            anweisung = assistent.anweisungen(chat.get("modus", "assistent"), bm, vm, kontext, s["assistent_sprache"])
            analyse = (chat.get("klon") or {}).get("bericht")
            if analyse:                     # Video-Clone: Analyse des Referenzvideos
                anweisung += "\n\n# Analyse des Referenzvideos\n" + str(analyse)[:30000]
        except BaseException:
            CHAT_LAEUFT.pop(name, None)
            raise

        self.send_response(200)
        self.send_header("Content-Type", "application/x-ndjson; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Accel-Buffering", "no")
        self._kopf_sicherheit()
        self.end_headers()

        def senden(obj):
            self.wfile.write((json.dumps(obj, ensure_ascii=False) + "\n").encode("utf-8"))
            self.wfile.flush()

        antwort, gehirn, fehlermeldung, info = "", "", "", {}
        try:
            for i, g in enumerate(reihenfolge):
                if g == "claude":
                    modell = s["assistent_claude_modell"]
                    strom = assistent.claude_strom(assistent.claude_finden(s.get("claude_pfad", "")), modell,
                                                   assistent.verlauf_als_text(anweisung, chat["nachrichten"]),
                                                   DATA / "assistent_arbeit", env("CLAUDE_CODE_OAUTH_TOKEN"), abbruch)
                    bez = f"Claude-CLI · {modell}"
                else:
                    modell = s["assistent_vision_modell"] if g == "vision" else s["assistent_or_modell"]
                    strom = assistent.openrouter_strom(api_key(), modell, assistent.verlauf_als_nachrichten(
                        anweisung, chat["nachrichten"], urls), abbruch, or_basis())
                    bez = f"OpenRouter · {modell}"
                fehlermeldung = ""
                for art, wert in strom:
                    if art == "text":
                        antwort += wert
                        senden({"t": "text", "d": wert})
                    elif art == "ende":
                        info = wert
                    elif art == "fehler":
                        fehlermeldung = str(wert)
                if antwort or not fehlermeldung or abbruch.is_set():
                    gehirn = bez
                    break
                if i + 1 < len(reihenfolge):
                    senden({"t": "hinweis", "d": f"{fehlermeldung} – weiter mit OpenRouter."})
            if gehirn.startswith("OpenRouter") and info.get("kosten"):
                verbrauch_schreiben({"zeit": jetzt(), "owner": name, "modell": gehirn.split(" · ", 1)[1], "art": "chat",
                                     "bilder": 0, "kosten": float(info["kosten"]), "tokens": 0, "status": "fertig"})
            if fehlermeldung and not antwort:
                senden({"t": "fehler", "d": fehlermeldung})
            else:
                senden({"t": "ende", "gehirn": gehirn, "abgebrochen": abbruch.is_set(),
                        "kosten": info.get("kosten") if gehirn.startswith("OpenRouter") else None})
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
            abbruch.set()          # Browser hat abgebrochen → Unterprozess/Strom beenden
        finally:
            CHAT_LAEUFT.pop(name, None)
            if antwort.strip():
                chat["nachrichten"].append({"rolle": "assistent", "text": antwort, "zeit": jetzt(), "gehirn": gehirn,
                                            **({"abgebrochen": True} if abbruch.is_set() else {})})
                chat_speichern(name, chat)

    def _anmelden(self, name: str, u: dict):
        token, csrf = sitzung_neu(name)
        return self.json({"ok": True, "nutzer": oeffentlich(u, name), "csrf": csrf},
                         extra={"Set-Cookie": f"bildgen_sid={token}; Path=/; HttpOnly; SameSite=Strict"})


def referenz_daten_erlaubt(ref: str, owner: str) -> bool:
    if not ID_RE.match(ref):
        return False
    b = bild_finden(ref)
    if b:
        return darf_sehen(b, owner)
    u = lies_json("uploads.json", {}).get(ref)
    return bool(u and u["owner"] == owner)


def bilder_liste(name: str, q: dict) -> list:
    ansicht = q.get("ansicht", "alle")
    suche = q.get("q", "").lower().strip()
    out = []
    for b in bilder():
        if ansicht == "veroeffentlicht":
            if not b.get("veroeffentlicht") or b.get("geloescht"):
                continue
        elif b["owner"] != name:
            continue
        elif ansicht == "papierkorb":
            if not b.get("geloescht"):
                continue
        elif b.get("geloescht"):
            continue
        elif ansicht == "favoriten" and not b.get("like"):
            continue
        elif ansicht.startswith("ordner:") and b.get("ordner") != ansicht[7:]:
            continue
        if suche and suche not in (b.get("prompt", "") + " " + b.get("modell_name", "")).lower():
            continue
        if q.get("typ") in ("bild", "video", "audio") and b.get("typ", "bild") != q["typ"]:
            continue
        out.append({**b, "eigen": b["owner"] == name, "dateiname": Path(str(b["datei"])).name})
    out.sort(key=lambda b: b["erstellt"], reverse=True)
    return out


def bild_aktion(name: str, bid: str, e: dict) -> dict | None:
    if not ID_RE.match(bid or ""):
        return None
    aktion = e.get("aktion")
    if aktion == "endgueltig":
        with LOCK:
            liste = bilder()
            b = next((x for x in liste if x["id"] == bid and x["owner"] == name and x.get("geloescht")), None)
            if not b:
                return None
            medium_pfad(b).unlink(missing_ok=True)
            schreib_json("bilder.json", [x for x in liste if x is not b])
            return b

    def fn(b):
        if aktion == "like":
            b["like"] = bool(e.get("wert", not b.get("like")))
        elif aktion == "veroeffentlichen":
            b["veroeffentlicht"] = bool(e.get("wert", not b.get("veroeffentlicht")))
        elif aktion == "papierkorb":
            b["geloescht"] = jetzt()
        elif aktion == "wiederherstellen":
            b["geloescht"] = None
        elif aktion == "ordner":
            oid = e.get("ordner")
            ordner = lies_json("ordner.json", {})
            b["ordner"] = oid if oid in ordner and ordner[oid]["owner"] == name else None
        else:
            raise Fehler(400, "Unbekannte Aktion.")

    return bild_aendern(bid, name, fn)


def ordner_liste(name: str) -> list:
    alle = lies_json("ordner.json", {})
    zaehl = {}
    for b in bilder():
        if b["owner"] == name and b.get("ordner") and not b.get("geloescht"):
            zaehl[b["ordner"]] = zaehl.get(b["ordner"], 0) + 1
    return sorted(({"id": k, "name": v["name"], "anzahl": zaehl.get(k, 0)} for k, v in alle.items()
                   if v["owner"] == name), key=lambda o: o["name"].lower())


def elemente_liste(name: str) -> list:
    alle = lies_json("elemente.json", {})
    bild_ids = {b["id"] for b in bilder()}

    def mit_url(r):
        return {"id": r, "url": ("/bild/" if r in bild_ids else "/upload/") + r}

    return sorted(({"id": k, "name": v["name"], "art": v["art"], "erstellt": v["erstellt"],
                    "bilder": [mit_url(r) for r in v.get("bilder", [])]}
                   for k, v in alle.items() if v["owner"] == name), key=lambda x: x["name"].lower())


INFLUENCER_TYPEN = ("normal", "kuehn", "extrem", "insekt", "frosch", "katze", "hund", "nager", "vogel")


def influencer_speichern(owner: str, e: dict) -> str:
    """Legt einen Charakter an oder ändert Name, Typ, Prompt (nur eigene)."""
    titel = str(e.get("name", "")).strip()[:60]
    if not titel:
        raise Fehler(400, "Bitte gib dem Influencer einen Namen.")
    typ = e.get("typ") if e.get("typ") in INFLUENCER_TYPEN else "normal"
    prompt = str(e.get("prompt", "")).strip()[:4000]
    vorlage = str(e.get("vorlage_id") or "")[:40]
    basis = str(e.get("basis") or "")
    if basis and not referenz_daten_erlaubt(basis, owner):
        basis = ""
    with LOCK:
        alle = lies_json("influencer.json", {})
        iid = str(e.get("id") or "")
        if iid:
            inf = alle.get(iid)
            if not inf or inf["owner"] != owner:
                raise Fehler(404, "Influencer nicht gefunden.")
            inf.update({"name": titel, "typ": typ, "prompt": prompt or inf["prompt"]})
        else:
            iid = neue_id()
            alle[iid] = {"owner": owner, "name": titel, "typ": typ, "prompt": prompt, "vorlage_id": vorlage,
                         "basis": basis, "bilder": [], "erstellt": jetzt()}
        schreib_json("influencer.json", alle)
    return iid


def influencer_bilder_anhaengen(owner: str, iid: str, bild_ids: list) -> None:
    with LOCK:
        alle = lies_json("influencer.json", {})
        inf = alle.get(iid)
        if inf and inf["owner"] == owner:
            inf["bilder"] = list(dict.fromkeys([*bild_ids, *inf.get("bilder", [])]))[:200]
            schreib_json("influencer.json", alle)


def influencer_liste(name: str) -> list:
    alle = lies_json("influencer.json", {})
    sichtbar = {b["id"] for b in bilder() if b["owner"] == name and not b.get("geloescht")}
    aus = []
    for k, v in alle.items():
        if v["owner"] != name:
            continue
        bild_ids = [b for b in v.get("bilder", []) if b in sichtbar]
        basis = v.get("basis") or ""
        aus.append({"id": k, "name": v["name"], "typ": v["typ"], "prompt": v["prompt"], "vorlage_id": v.get("vorlage_id", ""),
                    "basis": {"id": basis, "url": ("/bild/" if basis in sichtbar else "/upload/") + basis} if basis else None,
                    "bilder": [{"id": b, "url": "/bild/" + b} for b in bild_ids], "erstellt": v["erstellt"]})
    return sorted(aus, key=lambda x: x["erstellt"], reverse=True)


def verbrauch_auswerten(name: str, alle: bool) -> dict:
    tage, modelle = {}, {}
    summe, n_bilder = 0.0, 0
    f = pfad("verbrauch.jsonl")
    if f.is_file():
        for zeile in f.read_text("utf-8").splitlines():
            try:
                v = json.loads(zeile)
            except ValueError:
                continue
            if not alle and v.get("owner") != name:
                continue
            tag = v["zeit"][:10]
            k = float(v.get("kosten") or 0)
            summe += k
            n_bilder += int(v.get("bilder") or 0)
            tage.setdefault(tag, {"kosten": 0.0, "bilder": 0})
            tage[tag]["kosten"] += k
            tage[tag]["bilder"] += int(v.get("bilder") or 0)
            modelle.setdefault(v["modell"], {"kosten": 0.0, "bilder": 0})
            modelle[v["modell"]]["kosten"] += k
            modelle[v["modell"]]["bilder"] += int(v.get("bilder") or 0)
    return {"summe": round(summe, 4), "bilder": n_bilder,
            "tage": [{"tag": t, **w} for t, w in sorted(tage.items())][-60:],
            "modelle": sorted(({"modell": m, **w} for m, w in modelle.items()), key=lambda x: -x["kosten"])}


KONTO: dict = {}


def konto_info() -> dict:
    if KONTO.get("zeit", 0) > time.time() - 60:
        return KONTO["daten"]
    if not api_key():
        daten = {"verbunden": False, "meldung": "Kein Schlüssel hinterlegt."}
    else:
        try:
            d = or_anfrage("/key", timeout=15).get("data", {})
            # Bezeichnung (label) enthält einen Schlüsselausschnitt → wird bewusst nicht weitergegeben.
            daten = {"verbunden": True, "verbraucht": d.get("usage"), "limit": d.get("limit"),
                     "rest": d.get("limit_remaining"), "gratis": d.get("is_free_tier")}
        except RuntimeError as e:
            daten = {"verbunden": False, "meldung": str(e)[:200]}
    KONTO.update({"zeit": time.time(), "daten": daten})
    return daten


def main():
    zugang.startfreigabe()          # nur mit Ticket aus der Werkstatt, sonst Ende mit Hinweis
    verzeichnisse()
    port = int(env("BILDGEN_PORT", "8796"))
    threading.Thread(target=katalog_laden, daemon=True).start()
    threading.Thread(target=vkatalog_laden, daemon=True).start()
    threading.Thread(target=akatalog_laden, daemon=True).start()
    threading.Thread(target=katalog_waechter, daemon=True).start()
    n_v = ablage_vereinheitlichen()
    if n_v:
        print(f"{n_v} Datei(en) nach {ablage_wurzel()} geholt (ein Ort, Namen klein).", flush=True)
    n_ab = ablage_einsortieren()
    if n_ab:
        print(f"{n_ab} Datei(en) in die Ablage {ablage_wurzel()} einsortiert.", flush=True)
    n = video_offen_fortsetzen()
    if n:
        print(f"{n} offene(r) Video-Auftrag/Aufträge werden weiter abgefragt.", flush=True)
    srv = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    srv.daemon_threads = True
    print(f"PROMPTHEUS Cinema Studio läuft auf http://127.0.0.1:{port}/  (Strg+C beendet)", flush=True)
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
