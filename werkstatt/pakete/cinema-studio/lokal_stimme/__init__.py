"""MULTI-LLM — Anbindung des lokalen Sprachdienstes (Stimmen klonen ohne Cloud).

Das Portal bleibt reine Standardbibliothek. Die schwere Laufzeit (PyTorch, Chatterbox, Modelldateien) liegt in
LOKAL_STIMME_HOME (Standard D:\\zarbot\\lokal_stimme) — bewusst ein kurzer Pfad: lange Pfade sind unter Windows
abgeschaltet, und PyTorch scheitert sonst an der 260-Zeichen-Grenze.

Der Dienst (dienst.py) wird beim ersten Bedarf gestartet, bindet nur 127.0.0.1 und nimmt nur Aufträge mit dem
Zugangscode an, den dieses Modul bei jedem Start neu erzeugt.
"""
from __future__ import annotations

import atexit
import json
import os
import secrets
import socket
import subprocess
import threading
import time
import urllib.error
import urllib.request
from pathlib import Path

HOME = Path(os.environ.get("LOKAL_STIMME_HOME") or r"D:\zarbot\lokal_stimme")
PYTHON = HOME / "venv" / "Scripts" / "python.exe"
DIENST = Path(__file__).resolve().parent / "dienst.py"
PORT_FEST = int(os.environ.get("LOKAL_STIMME_PORT") or 0)   # 0 = bei jedem Start einen freien Port wählen
FLAGS = getattr(subprocess, "CREATE_NO_WINDOW", 0)

MODELL_ID = "lokal/chatterbox-multilingual"
MODELL = {
    "id": MODELL_ID, "name": "Chatterbox Multilingual (lokal)", "anbieter": "Lokal", "erstellt": 0,
    "beschreibung": "Läuft auf diesem Rechner: kostenlos, klont eigene Stimmen, die Probe verlässt den PC nicht",
    "je_zeichen": 0.0, "frei": True, "stimmen": ["standard"], "stimme_frei": False, "beispiel_stimme": "standard",
    "klonen": True, "lokal": True,
}

_LOCK = threading.Lock()
_ZUSTAND = {"prozess": None, "token": "", "port": 0}


def _freier_port() -> int:
    """Freier Port statt fester Nummer: zwei Portal-Instanzen (oder ein Test) kommen sich sonst in die Quere."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def installiert() -> bool:
    """Laufzeit vorhanden? (venv + chatterbox-Paket)"""
    return PYTHON.is_file() and (HOME / "venv" / "Lib" / "site-packages" / "chatterbox").is_dir()


def modelle() -> list:
    return [dict(MODELL)] if installiert() else []


def ist_lokal(mid: str) -> bool:
    return str(mid or "").startswith("lokal/")


def _anfrage(pfad: str, koerper: dict | None = None, timeout: float = 5) -> tuple[bytes, str]:
    req = urllib.request.Request(f"http://127.0.0.1:{_ZUSTAND['port']}{pfad}", method="POST" if koerper is not None else "GET",
                                 data=json.dumps(koerper).encode() if koerper is not None else None,
                                 headers={"X-Lokal-Token": _ZUSTAND["token"], "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.read(200 * 1024 * 1024), r.headers.get("Content-Type", "")
    except urllib.error.HTTPError as e:
        try:
            meldung = json.loads(e.read()).get("fehler", "")
        except ValueError:
            meldung = ""
        raise RuntimeError(f"Lokaler Sprachdienst: {meldung or e.reason}") from None


def _laeuft() -> bool:
    p = _ZUSTAND["prozess"]
    if not p or p.poll() is not None:
        return False
    try:
        _anfrage("/status", timeout=3)
        return True
    except (RuntimeError, urllib.error.URLError, OSError, TimeoutError):
        return False


def starten() -> None:
    """Dienst starten, falls er nicht läuft. Wartet, bis er antwortet (das Modell lädt erst beim ersten Auftrag)."""
    if not installiert():
        raise RuntimeError(f"Die lokale Stimmklonung ist nicht installiert (erwartet unter {HOME}).")
    with _LOCK:
        if _laeuft():
            return
        alt = _ZUSTAND["prozess"]
        if alt and alt.poll() is None:
            alt.terminate()
        _ZUSTAND["token"] = secrets.token_urlsafe(24)
        _ZUSTAND["port"] = PORT_FEST or _freier_port()
        env = {**os.environ, "LOKAL_STIMME_TOKEN": _ZUSTAND["token"], "HF_HOME": str(HOME / "hf"),
               "HF_HUB_DISABLE_TELEMETRY": "1", "PYTHONIOENCODING": "utf-8"}
        for k in ("OPENROUTER_API_KEY", "API_KEY_OPENROUTER"):   # der Dienst braucht keine Schlüssel
            env.pop(k, None)
        log = open(HOME / "dienst.log", "ab")
        _ZUSTAND["prozess"] = subprocess.Popen([str(PYTHON), str(DIENST), "--port", str(_ZUSTAND["port"]),
                                                "--eltern", str(os.getpid())], cwd=str(HOME), env=env,
                                               stdout=log, stderr=subprocess.STDOUT, stdin=subprocess.DEVNULL,
                                               creationflags=FLAGS)
        for _ in range(120):
            time.sleep(0.5)
            if _ZUSTAND["prozess"].poll() is not None:
                raise RuntimeError(f"Der lokale Sprachdienst ist beim Start abgestürzt (Protokoll: {HOME / 'dienst.log'}).")
            if _laeuft():
                return
        raise RuntimeError("Der lokale Sprachdienst antwortet nicht.")


def sprechen(text: str, probe: Path | None, sprache: str = "de") -> tuple[bytes, str, str]:
    """Wie audio.sprechen: (Audio-Bytes, Content-Type, Generation-Id). Erster Aufruf lädt das Modell (bis ~1 min)."""
    starten()
    daten, art = _anfrage("/sprechen", {"text": text, "probe": str(probe) if probe else "", "sprache": sprache},
                          timeout=1800)
    if not art.startswith("audio/") or len(daten) < 1000:
        raise RuntimeError("Der lokale Sprachdienst hat keinen Ton geliefert.")
    return daten, ("audio/wav" if "wav" in art else "audio/mpeg"), ""    # MP3, nur im Rückfall WAV


def beenden() -> None:
    p = _ZUSTAND["prozess"]
    if p and p.poll() is None:
        p.terminate()


atexit.register(beenden)      # der Dienst hält ~4 GB Grafikspeicher – mit dem Portal beenden
