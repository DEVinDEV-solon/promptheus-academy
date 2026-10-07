"""MULTI-LLM — lokaler Sprachdienst (Chatterbox Multilingual, MIT-Lizenz).

Läuft NICHT im Portal-Python, sondern mit der eigenen Umgebung unter LOKAL_STIMME_HOME (Standard
D:\\zarbot\\lokal_stimme\\venv) — dort liegen PyTorch und Chatterbox. Das Portal bleibt ohne Zusatzpakete.

Start (macht das Portal selbst):  <venv>\\python.exe dienst.py --port 8799
  Umgebung: LOKAL_STIMME_TOKEN (Pflicht), HF_HOME (Modellablage).

Schnittstelle (nur 127.0.0.1, jeder Aufruf mit Kopf „X-Lokal-Token“):
  GET  /status    → {"bereit", "geladen", "geraet", "fehler"}
  POST /sprechen  {"text", "probe": Pfad zur Stimmprobe oder "", "sprache": "de"} → audio/mpeg (Rückfall audio/wav)

Das Modell wird beim ersten Auftrag geladen und bleibt im Grafikspeicher. Aufträge laufen nacheinander.
Die Stimmprobe verlässt den Rechner nicht.
"""
from __future__ import annotations

import argparse
import hmac
import io
import json
import os
import re
import sys
import threading
import traceback
import wave
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

TOKEN = os.environ.get("LOKAL_STIMME_TOKEN", "")
MAX_TEXT = 5000
TEIL_MAX = 280                 # Chatterbox bricht bei langen Eingaben ab → satzweise erzeugen
PAUSE_S = 0.18                 # Pause zwischen den Teilen
SPRACHEN = {"de", "en", "fr", "es", "it", "nl", "pl", "pt", "tr", "ru", "ar", "da", "el", "fi", "he", "hi",
            "ja", "ko", "ms", "no", "sv", "sw", "zh"}

LAGE = {"modell": None, "geraet": "", "fehler": "", "laedt": False}
MODELL_LOCK = threading.Lock()     # ein Auftrag zur Zeit — 8 GB Grafikspeicher reichen nicht für zwei


def modell():
    with MODELL_LOCK:
        if LAGE["modell"] is None:
            LAGE["laedt"] = True
            try:
                import torch
                from chatterbox.mtl_tts import ChatterboxMultilingualTTS
                geraet = "cuda" if torch.cuda.is_available() else "cpu"
                LAGE["modell"] = ChatterboxMultilingualTTS.from_pretrained(device=geraet)
                LAGE["geraet"] = geraet + (f" ({torch.cuda.get_device_name(0)})" if geraet == "cuda" else "")
                LAGE["fehler"] = ""
            except Exception as e:  # noqa: BLE001 — Meldung geht an die Oberfläche
                LAGE["fehler"] = f"{type(e).__name__}: {e}"[:400]
                traceback.print_exc()
                raise
            finally:
                LAGE["laedt"] = False
        return LAGE["modell"]


def teile(text: str) -> list[str]:
    """Satzweise zerlegen, zu Stücken bis TEIL_MAX Zeichen bündeln; überlange Sätze an Kommas trennen."""
    saetze = [s.strip() for s in re.split(r"(?<=[.!?…:;])\s+|\n+", text) if s.strip()]
    stuecke: list[str] = []
    for s in saetze:
        while len(s) > TEIL_MAX:
            schnitt = max(s.rfind(",", 0, TEIL_MAX), s.rfind(" ", 0, TEIL_MAX))
            schnitt = schnitt if schnitt > TEIL_MAX // 3 else TEIL_MAX
            stuecke.append(s[:schnitt + 1].strip())
            s = s[schnitt + 1:].strip()
        if stuecke and len(stuecke[-1]) + 1 + len(s) <= TEIL_MAX:
            stuecke[-1] += " " + s
        elif s:
            stuecke.append(s)
    return stuecke


def sprechen(text: str, probe: str, sprache: str) -> tuple[bytes, str]:
    import numpy as np
    import torch
    m = modell()
    stuecke = teile(text)
    if not stuecke:
        raise ValueError("Kein sprechbarer Text.")
    stille = np.zeros(int(m.sr * PAUSE_S), dtype=np.float32)
    teile_wav = []
    with MODELL_LOCK, torch.inference_mode():
        for i, t in enumerate(stuecke):
            kw = {"language_id": sprache}
            if probe:
                kw["audio_prompt_path"] = probe
            wav = m.generate(t, **kw)
            teile_wav.append(wav.squeeze().detach().float().cpu().numpy())
            if i < len(stuecke) - 1:
                teile_wav.append(stille)
    ton = np.clip(np.concatenate(teile_wav), -1.0, 1.0).astype("float32")
    return als_mp3(ton, int(m.sr))


def als_mp3(ton, rate: int) -> tuple[bytes, str]:
    """Gleich als MP3 ausliefern (libsndfile im soundfile-Paket kodiert selbst) — das Portal muss dann nichts
    umwandeln, und die Rohdatei in data/audio_roh bleibt klein. WAV nur als Rückfall."""
    puffer = io.BytesIO()
    try:
        import soundfile as sf
        sf.write(puffer, ton, rate, format="MP3", bitrate_mode="CONSTANT", compression_level=0.3)
        return puffer.getvalue(), "audio/mpeg"
    except Exception:  # noqa: BLE001 — z. B. libsndfile ohne MP3
        traceback.print_exc()
    puffer = io.BytesIO()
    with wave.open(puffer, "wb") as w:          # WAV selbst schreiben: torchaudio.save braucht ab 2.9 torchcodec
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(rate)
        w.writeframes((ton * 32767).astype("<i2").tobytes())
    return puffer.getvalue(), "audio/wav"


class Handler(BaseHTTPRequestHandler):
    server_version = "LokalStimme/1.0"

    def log_message(self, fmt, *args):  # keine Texte ins Protokoll
        pass

    def _antwort(self, code: int, daten: bytes, art: str = "application/json") -> None:
        self.send_response(code)
        self.send_header("Content-Type", art)
        self.send_header("Content-Length", str(len(daten)))
        self.end_headers()
        self.wfile.write(daten)

    def _json(self, code: int, obj: dict) -> None:
        self._antwort(code, json.dumps(obj, ensure_ascii=False).encode("utf-8"))

    def _erlaubt(self) -> bool:
        host = (self.headers.get("Host") or "").split(":")[0]
        if host not in ("127.0.0.1", "localhost"):
            self._json(403, {"fehler": "Nur lokal."})
            return False
        if not TOKEN or not hmac.compare_digest(self.headers.get("X-Lokal-Token", ""), TOKEN):
            self._json(403, {"fehler": "Zugangscode fehlt oder falsch."})
            return False
        return True

    def do_GET(self):
        if not self._erlaubt():
            return
        if self.path == "/status":
            return self._json(200, {"bereit": True, "geladen": LAGE["modell"] is not None, "laedt": LAGE["laedt"],
                                    "geraet": LAGE["geraet"], "fehler": LAGE["fehler"]})
        self._json(404, {"fehler": "Unbekannt."})

    def do_POST(self):
        if not self._erlaubt():
            return
        if self.path != "/sprechen":
            return self._json(404, {"fehler": "Unbekannt."})
        try:
            laenge = int(self.headers.get("Content-Length") or 0)
            if laenge > 200_000:
                return self._json(413, {"fehler": "Anfrage zu groß."})
            e = json.loads(self.rfile.read(laenge) or b"{}")
            text = str(e.get("text") or "").strip()
            if not text or len(text) > MAX_TEXT:
                return self._json(400, {"fehler": f"Text fehlt oder ist länger als {MAX_TEXT} Zeichen."})
            sprache = str(e.get("sprache") or "de")
            if sprache not in SPRACHEN:
                return self._json(400, {"fehler": "Sprache wird nicht unterstützt."})
            probe = str(e.get("probe") or "")
            if probe and not Path(probe).is_file():
                return self._json(400, {"fehler": "Stimmprobe nicht gefunden."})
            daten, art = sprechen(text, probe, sprache)
            self._antwort(200, daten, art)
        except Exception as err:  # noqa: BLE001
            traceback.print_exc()
            meldung = f"{type(err).__name__}: {err}"
            if "out of memory" in meldung.lower():
                meldung = "Grafikspeicher reicht nicht – andere GPU-Programme schließen oder kürzeren Text versuchen."
            self._json(500, {"fehler": meldung[:400]})


class ExklusiverServer(ThreadingHTTPServer):
    # HTTPServer setzt SO_REUSEADDR – unter Windows heißt das: ein zweiter Prozess darf denselben Port still
    # mitbelegen und Anfragen abgreifen. Hier nicht: ist der Port belegt, bricht der Start sichtbar ab.
    allow_reuse_address = False


def eltern_waechter(pid: int) -> None:
    """Endet mit dem Portal — auch wenn es hart beendet wird (Konsolenfenster zu), sonst blieben
    Grafikspeicher und Port belegt und der nächste Portalstart scheiterte."""
    if sys.platform == "win32":
        import ctypes
        k = ctypes.windll.kernel32
        h = k.OpenProcess(0x00100000, False, pid)          # SYNCHRONIZE
        if h:
            k.WaitForSingleObject(h, 0xFFFFFFFF)
    else:
        import time
        while os.getppid() == pid:
            time.sleep(5)
    os._exit(0)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, default=8799)
    ap.add_argument("--eltern", type=int, default=0, help="PID des Portals; der Dienst endet mit ihm")
    ap.add_argument("--vorladen", action="store_true", help="Modell sofort laden (sonst beim ersten Auftrag)")
    a = ap.parse_args()
    if not TOKEN:
        sys.exit("LOKAL_STIMME_TOKEN fehlt – der Dienst startet nur mit Zugangscode.")
    srv = ExklusiverServer(("127.0.0.1", a.port), Handler)
    if a.eltern:
        threading.Thread(target=eltern_waechter, args=(a.eltern,), daemon=True).start()
    if a.vorladen:
        threading.Thread(target=modell, daemon=True).start()
    print(f"Lokaler Sprachdienst auf 127.0.0.1:{a.port}", flush=True)
    srv.serve_forever()


if __name__ == "__main__":
    main()
