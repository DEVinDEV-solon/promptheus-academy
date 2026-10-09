"""PROMPTHEUS Cinema Studio — Audio/Musik für HyperFrames-Projekte.

Beim Onboarding mit Audio (Voice-Over, Song oder nur Musik) bereitet der Server alles so vor, dass der
Assistent Bilder, Schnitte und Übergänge genau auf Takt und Wort setzen kann:
- Ausschnitt der Audiodatei (ab Sekunde X, Länge des Videos) nach video/assets/musik.mp3 (ffmpeg),
- <audio data-timeline-role="music"> in video/index.html,
- Takt: hyperframes beats → beats/musik.mp3.json, kompakt als beats/TAKT.md,
- Gesang/Sprache: hyperframes transcribe (whisper-cli lokal) → transcript.json, kompakt als transcript/TEXT.md.
Alle Aufrufe als Argumentliste ohne Shell. Nur Standardbibliothek.
"""
from __future__ import annotations

import json
import os
import re
import shutil
import statistics
import subprocess
from pathlib import Path

import hyperframes_werkzeuge as hw
import werkzeugkiste as wk

WHISPER_MODELL = "small"            # mehrsprachig (Deutsch + Englisch); small.en kann nur Englisch
AUDIO_ENDUNGEN = {".mp3", ".wav", ".m4a", ".aac", ".ogg", ".flac", ".opus", ".webm", ".mp4", ".mov"}
SPRACHEN = {"de": "Deutsch", "en": "Englisch"}
AUDIO_MAX = 120                      # Sekunden bei „ganze Audiolänge“
FLAGS = getattr(subprocess, "CREATE_NO_WINDOW", 0)


def whisper_finden(eigen: str = "", programm: Path | None = None) -> str:
    """whisper-cli aus dem Werkzeugordner im Repo; ein eigener Pfad aus den Einstellungen nur, solange dort nichts liegt."""
    return wk.pfad("whisper-cli") or (eigen if eigen and Path(eigen).is_file() else "")


def whisper_modell_bereit(exe: str = "") -> bool:
    """Das Modell liegt im Heim der HyperFrames-Prozesse (werkzeuge/heim/.cache/hyperframes/whisper/models)."""
    return bool(wk.pfad("whisper-modell"))


def dauer(ffprobe: str, datei: Path) -> float:
    r = subprocess.run([ffprobe, "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(datei)],
                       capture_output=True, text=True, timeout=60, creationflags=FLAGS)
    try:
        return float(r.stdout.strip())
    except ValueError:
        raise ValueError("Die Audiodatei ist nicht lesbar.") from None


def ausschnitt(ffmpeg: str, quelle: Path, ziel: Path, ab: float, laenge: float) -> None:
    ziel.parent.mkdir(parents=True, exist_ok=True)
    r = subprocess.run([ffmpeg, "-loglevel", "error", "-y", "-ss", f"{ab:.3f}", "-t", f"{laenge:.3f}", "-i", str(quelle),
                        "-vn", "-c:a", "libmp3lame", "-q:a", "2", str(ziel)],
                       capture_output=True, text=True, timeout=180, creationflags=FLAGS)
    if r.returncode or not ziel.is_file():
        raise RuntimeError("Audio-Ausschnitt fehlgeschlagen: " + (r.stderr or "")[-300:])


def einbinden(index: Path, laenge: float, src: str = "assets/musik.mp3") -> None:
    """Gesamtlänge der Komposition setzen und die Musikspur einfügen (vor dem ersten Clip im #root)."""
    html = index.read_text("utf-8")
    html = re.sub(r'(data-composition-id="main"[^>]*?data-duration=")[^"]*(")', rf"\g<1>{laenge:g}\g<2>", html, count=1, flags=re.S)
    spur = (f'\n      <audio id="musik" data-timeline-role="music" src="{src}" data-start="0" '
            f'data-duration="{laenge:g}" data-track-index="9" data-volume="1"></audio>\n')
    m = re.search(r'<div[^>]*data-composition-id="main"[^>]*>', html, re.S)
    if not m:
        raise RuntimeError("index.html hat keine Hauptkomposition.")
    if 'id="musik"' not in html:
        html = html[:m.end()] + spur + html[m.end():]
    index.write_text(html, "utf-8", newline="\n")


def cli(befehl: str, argumente: list[str], cwd: Path, zeitlimit: int = 300, whisper: str = "") -> tuple[int, str]:
    """HyperFrames-CLI für die Vorbereitung durch den Server (auch beats/transcribe, die der Assistent nicht darf)."""
    hf = hw.hf_befehl()
    if not hf:
        return 1, "HyperFrames ist nicht eingerichtet (Einstellungen → Werkzeuge einrichten) oder Node.js fehlt."
    env = hw.hf_umgebung()
    if whisper:
        env["HYPERFRAMES_WHISPER_PATH"] = whisper
    try:
        r = subprocess.run([*hf, befehl, *argumente], cwd=str(cwd),
                           capture_output=True, timeout=zeitlimit, env=env, creationflags=FLAGS)
    except subprocess.TimeoutExpired:
        return 1, f"Zeitlimit {zeitlimit} s überschritten."
    return r.returncode, hw._kuerzen((r.stdout + r.stderr).decode("utf-8", "replace"), 3000)


def takt_md(beats_json: Path, laenge: float) -> str:
    """Kompakte Taktliste fürs Modell: Tempo, alle Schläge mit Stärke, Akzente und Vorschlag für Schnittpunkte."""
    daten = json.loads(beats_json.read_text("utf-8"))
    schlaege = [b for b in daten.get("beats") or [] if isinstance(b, dict) and 0 <= float(b.get("time", -1)) <= laenge]
    if not schlaege:
        return "# Takt\n\nKeine Schläge erkannt – Schnitte frei setzen.\n"
    zeiten = [float(b["time"]) for b in schlaege]
    abstaende = [b - a for a, b in zip(zeiten, zeiten[1:]) if b > a]
    bpm = 60 / statistics.median(abstaende) if abstaende else 0
    gefuehlt, teiler = bpm, 1         # Detektor zählt oft Achtel oder Sechzehntel: gefühltes Tempo meist 70–180
    while gefuehlt > 180:
        gefuehlt, teiler = gefuehlt / 2, teiler * 2
    akzente = [b for b in schlaege if float(b.get("strength") or 0) >= 0.7]
    schnitte, letzt = [], -9.0
    for b in sorted(akzente or schlaege, key=lambda x: float(x["time"])):
        t = float(b["time"])
        if t - letzt >= 1.2 and t <= laenge - 0.8:
            schnitte.append(t)
            letzt = t
    zeilen = ["# Takt (aus hyperframes beats, Zeiten in Sekunden ab Videostart)", "",
              f"- Tempo ≈ {bpm:.0f} BPM" + (f" (gefühlt ≈ {gefuehlt:.0f} BPM, jeder {teiler}. Schlag ist ein Viertel)" if teiler > 1 else ""),
              f"- {len(schlaege)} Schläge, {len(akzente)} Akzente (Stärke ≥ 0,7)",
              "- Szenenwechsel und Übergänge auf diese Zeiten legen; ein Übergang ENDET auf dem Schlag.",
              "", "## Vorschlag Schnittpunkte (Akzente, mindestens 1,2 s Abstand)",
              ", ".join(f"{t:.2f}" for t in schnitte) or "-",
              "", "## Alle Schläge (Zeit/Stärke)",
              " ".join(f"{float(b['time']):.2f}/{float(b.get('strength') or 0):.2f}" for b in schlaege)]
    return "\n".join(zeilen) + "\n"


def text_md(transcript_json: Path) -> str:
    """Wortzeiten zu Zeilen (Pause ≥ 0,6 s, Satzende oder 7 Wörter) – für Text-Einblendungen synchron zum Audio."""
    woerter = [w for w in json.loads(transcript_json.read_text("utf-8")) if isinstance(w, dict) and str(w.get("text") or "").strip()]
    if not woerter:
        return "# Text\n\nKein gesprochener oder gesungener Text erkannt.\n"
    zeilen, akt = [], []
    for w in woerter:
        if akt and (float(w["start"]) - float(akt[-1]["end"]) >= 0.6 or len(akt) >= 7
                    or float(w["end"]) - float(akt[0]["start"]) > 4.0):     # eine Zeile höchstens ~4 s
            zeilen.append(akt)
            akt = []
        akt.append(w)
        if re.search(r"[.!?]$", str(w["text"]).strip()):
            zeilen.append(akt)
            akt = []
    if akt:
        zeilen.append(akt)
    aus = ["# Text (aus hyperframes transcribe, Zeiten in Sekunden ab Videostart)", "",
           "Wortgenaue Zeiten stehen in transcript.json (text/start/end). Einblendungen erscheinen mit dem ersten Wort "
           "und gehen mit dem letzten; Erkennungsfehler bei Gesang mit dem Songtext (falls vorhanden) korrigieren.", ""]
    aus += [f"- {float(z[0]['start']):6.2f}–{float(z[-1]['end']):6.2f}  {' '.join(str(w['text']).strip() for w in z)}" for z in zeilen]
    return "\n".join(aus) + "\n"


def songinfo_finden(audio: Path) -> Path | None:
    """Textdatei neben dem Audio, deren Name mit dem Audionamen beginnt (z. B. Songtext oder Stil-Notizen)."""
    stamm = audio.stem.lower()
    for f in sorted(audio.parent.glob("*.txt")):
        if f.stem.lower().startswith(stamm) and f.stat().st_size <= 100_000:
            return f
    return None


def vorbereiten(video: Path, quelle: Path, ab: float, laenge: float, art: str, w: dict, whisper: str) -> dict:
    """Alles für ein Video mit Audio vorbereiten. art: 'de' | 'en' (mit Gesang/Sprache) oder 'takt' (nur Musik).
    Gibt zurück, was entstanden ist (für BRIEF.md und die Oberfläche)."""
    ausschnitt(w["ffmpeg"], quelle, video / "assets" / "musik.mp3", ab, laenge)
    einbinden(video / "index.html", laenge)
    info = {"datei": "assets/musik.mp3", "ab": round(ab, 2), "laenge": round(laenge, 2), "art": art, "takt": False,
            "text": False, "hinweise": []}
    code, aus = cli("beats", ["--json"], video, 300)
    # die CLI legt die Datei nach dem src-Pfad der Spur ab (beats/assets/musik.mp3.json) – also suchen
    beats = next(iter(sorted((video / "beats").rglob("musik.mp3.json"))), video / "beats" / "musik.mp3.json") \
        if (video / "beats").is_dir() else video / "beats" / "musik.mp3.json"
    if code == 0 and beats.is_file():
        (video / "beats" / "TAKT.md").write_text(takt_md(beats, laenge), "utf-8")
        info["takt"] = True
    else:
        info["hinweise"].append("Takt nicht erkannt: " + aus[-200:])
    if art in SPRACHEN:
        if not whisper or not whisper_modell_bereit(whisper):
            info["hinweise"].append("whisper-cli oder Modell nicht gefunden – kein Wort-Timing (Einstellungen → whisper-Pfad).")
        else:
            code, aus = cli("transcribe", ["assets/musik.mp3", "--model", WHISPER_MODELL, "--language", art,
                                           "--no-runtime-install", "--json"], video, 600, whisper)
            t = video / "transcript.json"
            neben = video / "assets" / "transcript.json"      # die CLI schreibt neben die Eingabedatei
            if neben.is_file():
                os.replace(neben, t)
            if code == 0 and t.is_file():
                (video / "transcript").mkdir(exist_ok=True)
                (video / "transcript" / "TEXT.md").write_text(text_md(t), "utf-8")
                info["text"] = True
            else:
                info["hinweise"].append("Transkription fehlgeschlagen: " + aus[-200:])
    song = songinfo_finden(quelle)
    if song:
        shutil.copyfile(song, video / "assets" / "songinfo.txt")
        info["songinfo"] = "assets/songinfo.txt"
    return info
