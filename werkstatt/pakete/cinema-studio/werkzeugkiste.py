r"""Cinema Studio — lokale Werkzeuge: alles, was HyperFrames, Video-Clone und Audio brauchen, liegt im Programmordner.

    werkzeuge\
      ffmpeg\        ffmpeg + ffprobe (+ DLLs bei geteilten Builds)
      yt-dlp\        yt-dlp
      whisper\       whisper-cli + DLLs (Wortzeiten für Gesang/Sprache)
      hyperframes\   node_modules\hyperframes in fester Version (HF_VERSION)
      heim\          Heimordner der HyperFrames-Prozesse: .cache\hyperframes\{chrome,fonts,whisper\models,history}
      npm-cache\, tmp\

Der Ordner liegt am festen Ort im Repo (werkstatt\scripts\cinema-studio, in git ausgeschlossen) und wird nie
gespiegelt. Zur Laufzeit wird nur von hier gestartet; HyperFrames bekommt USERPROFILE/HOME/TEMP auf heim\ bzw.
tmp\, damit auch seine Caches (Chrome, Schriften, Modelle, Verlauf) im Repo landen und nicht im Benutzerprofil.

Einrichten: erst vorhandene Kopien übernehmen (Einstellung, PATH, bekannte Orte, alter HyperFrames-Cache), sonst
laden – nur feste Versionen von festen Adressen, jede Datei per SHA-256 geprüft. Aufruf auch ohne Server:
    python werkzeugkiste.py stand | einrichten [--nur-uebernehmen]
Nur Standardbibliothek, keine Shell.
"""
from __future__ import annotations

import hashlib
import json
import os
import shutil
import subprocess
import sys
import tempfile
import urllib.request
import zipfile
from pathlib import Path
from urllib.parse import urlparse

HF_VERSION = "0.8.143"              # wie hyperframes_werkzeuge.HF_VERSION (dort wird gegen diese Zahl geprüft)
WHISPER_MODELL = "small"
WIN = os.name == "nt"
EXE = ".exe" if WIN else ""
FLAGS = getattr(subprocess, "CREATE_NO_WINDOW", 0)

# Feste Downloads: (Adresse, SHA-256). ffmpeg kommt aus dem rollenden „latest“-Release von BtbN – dort wird
# die Prüfsumme, die GitHub zum Asset veröffentlicht, vor dem Laden abgefragt.
WHISPER_ZIP = ("https://github.com/ggml-org/whisper.cpp/releases/download/v1.8.2/whisper-bin-x64.zip",
               "b1514ebc099765e39fa37eb780b92a140a94c86bb0b3b3d98226b38825979732")
MODELL_BIN = (f"https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-{WHISPER_MODELL}.bin",
              "1be3a9b2063867b937e64e2ec7483364a79917e157fa98c5d94b5c1fffea987b")
YTDLP_EXE = ("https://github.com/yt-dlp/yt-dlp/releases/download/2026.08.19/yt-dlp.exe",
             "66674953fe251b89f4d08c5f0e35e0728679bd67ab3d7d05c0562af101dd3e7a")
FFMPEG_RELEASE = ("BtbN/FFmpeg-Builds", "latest", "ffmpeg-n8.1-latest-win64-gpl-8.1.zip")
HOSTS = {"github.com", "api.github.com", "release-assets.githubusercontent.com", "objects.githubusercontent.com",
         "huggingface.co", "cdn-lfs.huggingface.co", "cas-bridge.xethub.hf.co", "cdn-lfs-us-1.hf.co", "cdn-lfs-eu-1.hf.co"}

# Nur Quellen für „übernehmen“ beim Einrichten – zur Laufzeit wird hier nie gestartet.
ALTE_ORTE = {
    "ffmpeg": [r"D:\Werkzeuge\ffmpeg\ffmpeg.exe", r"D:\Werkzeuge\ffmpeg\bin\ffmpeg.exe"],
    "yt-dlp": [r"D:\Werkzeuge\yt-dlp\yt-dlp.exe", r"D:\Werkzeuge\yt-dlp.exe"],
}


class Fehler(Exception):
    pass


# --------------------------------------------------------------------------- Orte
def ordner() -> Path:
    """Der Werkzeugordner. Aus der Quelle (werkstatt\\pakete\\cinema-studio, z. B. in Tests) der am festen Ort."""
    eigen = os.environ.get("CINEMA_WERKZEUGE", "").strip()
    if eigen:
        return Path(eigen)
    hier = Path(__file__).resolve().parent
    if hier.parent.name == "pakete":
        return hier.parent.parent / "scripts" / hier.name / "werkzeuge"
    return hier / "werkzeuge"


def heim() -> Path:
    return ordner() / "heim"


def hf_cache() -> Path:
    return heim() / ".cache" / "hyperframes"


def modell_pfad() -> Path:
    """Dort sucht HyperFrames das Modell (homedir() ist für seine Prozesse heim\\)."""
    return hf_cache() / "whisper" / "models" / f"ggml-{WHISPER_MODELL}.bin"


DATEIEN = {
    "ffmpeg": lambda: ordner() / "ffmpeg" / f"ffmpeg{EXE}",
    "ffprobe": lambda: ordner() / "ffmpeg" / f"ffprobe{EXE}",
    "yt-dlp": lambda: ordner() / "yt-dlp" / f"yt-dlp{EXE}",
    "whisper-cli": lambda: ordner() / "whisper" / f"whisper-cli{EXE}",
    "whisper-modell": modell_pfad,
    "hyperframes": lambda: ordner() / "hyperframes" / "node_modules" / "hyperframes" / "bin" / "hyperframes.mjs",
}


def pfad(name: str) -> str:
    """Pfad eines lokalen Werkzeugs – leer, wenn es (noch) nicht eingerichtet ist."""
    f = DATEIEN[name]()
    return str(f) if f.is_file() else ""


def hf_version() -> str:
    try:
        paket = ordner() / "hyperframes" / "node_modules" / "hyperframes" / "package.json"
        return json.loads(paket.read_text("utf-8")).get("version", "")
    except (OSError, ValueError):
        return ""


def node() -> str:
    """Node.js ist Laufzeitvoraussetzung (wie Python), kein Werkzeug dieses Ordners."""
    return shutil.which("node") or (r"C:\Program Files\nodejs\node.exe" if WIN and Path(r"C:\Program Files\nodejs\node.exe").is_file() else "")


def hyperframes_befehl() -> list[str]:
    """[node, …/hyperframes.mjs] aus dem Werkzeugordner – leer, wenn nicht eingerichtet oder falsche Version."""
    cli, n = pfad("hyperframes"), node()
    return [n, cli] if cli and n and hf_version() == HF_VERSION else []


def umgebung(basis: dict | None = None) -> dict:
    """Umgebung für HyperFrames-Prozesse: Heim, Temp und npm-Cache im Werkzeugordner, Programme von hier."""
    env = dict(os.environ if basis is None else basis)
    tmp = ordner() / "tmp"
    for d in (heim(), tmp):
        d.mkdir(parents=True, exist_ok=True)
    env.update({"USERPROFILE": str(heim()), "HOME": str(heim()), "TEMP": str(tmp), "TMP": str(tmp), "TMPDIR": str(tmp),
                "npm_config_cache": str(ordner() / "npm-cache"), "npm_config_update_notifier": "false",
                "HYPERFRAMES_FONT_CACHE_DIR": str(hf_cache() / "fonts")})
    for name, var in (("ffmpeg", "HYPERFRAMES_FFMPEG_PATH"), ("ffprobe", "HYPERFRAMES_FFPROBE_PATH"),
                      ("whisper-cli", "HYPERFRAMES_WHISPER_PATH")):
        p = pfad(name)
        if p:
            env[var] = p
        else:
            env.pop(var, None)
    if pfad("ffmpeg"):
        env["PATH"] = str(ordner() / "ffmpeg") + os.pathsep + env.get("PATH", "")
    return env


def stand() -> dict:
    """Was liegt im Werkzeugordner? (für Status und Einstellungen)"""
    chrome = hf_cache() / "chrome"
    return {"ordner": str(ordner()),
            "ffmpeg": bool(pfad("ffmpeg") and pfad("ffprobe")), "yt-dlp": bool(pfad("yt-dlp")),
            "whisper": bool(pfad("whisper-cli")), "modell": bool(pfad("whisper-modell")),
            "hyperframes": hf_version() == HF_VERSION, "hyperframes_version": hf_version(),
            "chrome": chrome.is_dir() and any(chrome.iterdir()), "node": bool(node())}


# --------------------------------------------------------------------------- Prüfen und Laden
def sha256(datei: Path) -> str:
    h = hashlib.sha256()
    with open(datei, "rb") as f:
        for block in iter(lambda: f.read(1 << 20), b""):
            h.update(block)
    return h.hexdigest()


def _url_pruefen(url: str) -> None:
    t = urlparse(url)
    if t.scheme != "https" or (t.hostname or "").lower() not in HOSTS:
        raise Fehler(f"Download-Adresse nicht erlaubt: {t.hostname}")


class _NurErlaubt(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        _url_pruefen(newurl)
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def laden(url: str, ziel: Path, sha: str, melden=print) -> None:
    """https-Download (nur erlaubte Hosts, auch nach Weiterleitungen) in eine .part-Datei, SHA-256 prüfen, umbenennen."""
    _url_pruefen(url)
    ziel.parent.mkdir(parents=True, exist_ok=True)
    teil = ziel.with_name(ziel.name + ".part")
    oeffner = urllib.request.build_opener(_NurErlaubt)
    h = hashlib.sha256()
    n = 0
    with oeffner.open(urllib.request.Request(url, headers={"User-Agent": "cinema-studio"}), timeout=60) as r, \
            open(teil, "wb") as f:
        gesamt = int(r.headers.get("Content-Length") or 0)
        while block := r.read(1 << 20):
            f.write(block)
            h.update(block)
            n += len(block)
            if n % (50 << 20) < (1 << 20):
                melden(f"  … {n >> 20} MB" + (f" von {gesamt >> 20} MB" if gesamt else ""))
    if h.hexdigest() != sha.lower():
        teil.unlink(missing_ok=True)
        raise Fehler(f"Prüfsumme von {ziel.name} stimmt nicht – Datei verworfen.")
    os.replace(teil, ziel)


def _github_digest(repo: str, tag: str, name: str) -> tuple[str, str]:
    url = f"https://api.github.com/repos/{repo}/releases/tags/{tag}"
    _url_pruefen(url)
    with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "cinema-studio"}), timeout=30) as r:
        daten = json.loads(r.read())
    a = next((a for a in daten.get("assets") or [] if a.get("name") == name), None)
    if not a or not str(a.get("digest", "")).startswith("sha256:"):
        raise Fehler(f"{name}: keine veröffentlichte Prüfsumme gefunden.")
    return a["browser_download_url"], a["digest"].split(":", 1)[1]


def _aus_zip(zipdatei: Path, ziel: Path, waehlen) -> list[str]:
    """Nur ausgewählte Dateien flach nach ziel – keine Pfade aus dem Archiv (kein Zip-Slip)."""
    ziel.mkdir(parents=True, exist_ok=True)
    genommen = []
    with zipfile.ZipFile(zipdatei) as z:
        for info in z.infolist():
            name = Path(info.filename.replace("\\", "/")).name
            if info.is_dir() or not name or not waehlen(name):
                continue
            with z.open(info) as q, open(ziel / name, "wb") as f:
                shutil.copyfileobj(q, f)
            genommen.append(name)
    return genommen


# --------------------------------------------------------------------------- Übernehmen
def _erste(kandidaten: list) -> Path | None:
    return next((Path(k) for k in kandidaten if k and Path(k).is_file()), None)


def _dateien_kopieren(quelle: Path, ziel: Path, waehlen) -> None:
    ziel.mkdir(parents=True, exist_ok=True)
    for f in quelle.iterdir():
        if f.is_file() and waehlen(f.name):
            shutil.copy2(f, ziel / f.name)


def _whisper_dll(name: str) -> bool:
    n = name.lower()
    return n == f"whisper-cli{EXE}" or (n.endswith(".dll") and (n.startswith("ggml") or n == "whisper.dll"))


def ffmpeg_einrichten(eigen: str, laden_ok: bool, melden) -> str:
    q = _erste([eigen, *ALTE_ORTE["ffmpeg"], shutil.which("ffmpeg") or ""])
    if q and (q.parent / f"ffprobe{EXE}").is_file():
        _dateien_kopieren(q.parent, ordner() / "ffmpeg",
                          lambda n: n.lower() in (f"ffmpeg{EXE}", f"ffprobe{EXE}") or n.lower().endswith(".dll"))
        return f"übernommen aus {q.parent}"
    if not (laden_ok and WIN):
        return "fehlt"
    url, sha = _github_digest(*FFMPEG_RELEASE)
    with tempfile.TemporaryDirectory(dir=ordner()) as t:
        z = Path(t) / "ffmpeg.zip"
        laden(url, z, sha, melden)
        _aus_zip(z, ordner() / "ffmpeg", lambda n: n.lower() in (f"ffmpeg{EXE}", f"ffprobe{EXE}"))
    return f"geladen ({FFMPEG_RELEASE[2]})"


def ytdlp_einrichten(eigen: str, laden_ok: bool, melden) -> str:
    q = _erste([eigen, *ALTE_ORTE["yt-dlp"], shutil.which("yt-dlp") or ""])
    ziel = ordner() / "yt-dlp" / f"yt-dlp{EXE}"
    if q:
        ziel.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(q, ziel)
        return f"übernommen aus {q.parent}"
    if not (laden_ok and WIN):
        return "fehlt"
    laden(YTDLP_EXE[0], ziel, YTDLP_EXE[1], melden)
    return "geladen (yt-dlp 2026.08.19)"


def whisper_einrichten(eigen: str, laden_ok: bool, melden) -> str:
    skripte = ordner().resolve().parents[4] if len(ordner().resolve().parents) > 4 else ordner()
    q = _erste([eigen, shutil.which("whisper-cli") or "",
                str(skripte / "VoiceVibe" / "transcriber" / "whisper.cpp" / "bin" / f"whisper-cli{EXE}"),
                str(skripte / "Advocat" / "werkzeuge" / "whisper" / f"whisper-cli{EXE}")])
    if q:
        _dateien_kopieren(q.parent, ordner() / "whisper", _whisper_dll)
        return f"übernommen aus {q.parent}"
    if not (laden_ok and WIN):
        return "fehlt"
    with tempfile.TemporaryDirectory(dir=ordner()) as t:
        z = Path(t) / "whisper.zip"
        laden(WHISPER_ZIP[0], z, WHISPER_ZIP[1], melden)
        _aus_zip(z, ordner() / "whisper", _whisper_dll)
    return "geladen (whisper.cpp v1.8.2)"


def modell_einrichten(laden_ok: bool, melden) -> str:
    ziel = modell_pfad()
    alt = Path.home() / ".cache" / "hyperframes" / "whisper" / "models" / ziel.name
    if alt.is_file() and alt.resolve() != ziel.resolve():
        if sha256(alt) == MODELL_BIN[1]:
            ziel.parent.mkdir(parents=True, exist_ok=True)
            teil = ziel.with_name(ziel.name + ".part")
            shutil.copyfile(alt, teil)
            os.replace(teil, ziel)
            return f"übernommen aus dem alten HyperFrames-Cache ({alt.parent})"
    if not laden_ok:
        return "fehlt"
    laden(MODELL_BIN[0], ziel, MODELL_BIN[1], melden)
    return f"geladen (ggml-{WHISPER_MODELL}.bin)"


def hyperframes_einrichten(laden_ok: bool, melden) -> str:
    ziel = ordner() / "hyperframes"
    npx = Path(os.environ.get("LOCALAPPDATA", "")) / "npm-cache" / "_npx" if WIN else Path.home() / ".npm" / "_npx"
    for paket in sorted(npx.glob("*/node_modules/hyperframes/package.json")) if npx.is_dir() else []:
        try:
            if json.loads(paket.read_text("utf-8")).get("version") != HF_VERSION:
                continue
        except (OSError, ValueError):
            continue
        quelle = paket.parents[2]
        shutil.rmtree(ziel, ignore_errors=True)
        shutil.copytree(quelle / "node_modules", ziel / "node_modules", symlinks=False)
        break
    if hf_version() == HF_VERSION:
        (ziel / "package.json").write_text(json.dumps({"private": True, "dependencies": {"hyperframes": HF_VERSION}},
                                                     indent=2) + "\n", "utf-8")
        return "übernommen aus dem npx-Cache"
    if not laden_ok:
        return "fehlt"
    n = node()
    npm = Path(n).parent / "node_modules" / "npm" / "bin" / "npm-cli.js" if n else None
    if not (npm and npm.is_file()):
        raise Fehler("Node.js/npm nicht gefunden – bitte Node.js 22+ installieren.")
    ziel.mkdir(parents=True, exist_ok=True)
    (ziel / "package.json").write_text(json.dumps({"private": True}) + "\n", "utf-8")
    r = subprocess.run([n, str(npm), "install", f"hyperframes@{HF_VERSION}", "--save-exact", "--no-audit", "--no-fund",
                        "--loglevel=error", "--prefix", str(ziel)], cwd=str(ziel), env=umgebung(),
                       capture_output=True, timeout=900, creationflags=FLAGS)
    if r.returncode or hf_version() != HF_VERSION:
        raise Fehler("npm install hyperframes ist gescheitert: " + (r.stderr or r.stdout).decode("utf-8", "replace")[-400:])
    return f"geladen (npm hyperframes@{HF_VERSION})"


def caches_uebernehmen() -> str:
    """Chrome (headless shell) und Schriften aus dem alten HyperFrames-Cache – sonst lädt HyperFrames sie selbst
    beim ersten Render nach heim\\."""
    alt = Path.home() / ".cache" / "hyperframes"
    genommen = []
    for teil in ("chrome", "fonts"):
        q, z = alt / teil, hf_cache() / teil
        if q.is_dir() and q.resolve() != z.resolve() and not (z.is_dir() and any(z.iterdir())):
            shutil.copytree(q, z, dirs_exist_ok=True)
            genommen.append(teil)
    return ("übernommen: " + ", ".join(genommen)) if genommen else "–"


def einrichten(eigen: dict | None = None, laden_ok: bool = True, melden=print) -> dict:
    """Fehlende Teile einrichten. eigen: Pfade aus den Einstellungen (ffmpeg, yt-dlp, whisper-cli) als Quelle."""
    eigen = eigen or {}
    ordner().mkdir(parents=True, exist_ok=True)
    schritte = [
        ("ffmpeg", lambda: pfad("ffmpeg") and pfad("ffprobe"), lambda: ffmpeg_einrichten(eigen.get("ffmpeg", ""), laden_ok, melden)),
        ("yt-dlp", lambda: pfad("yt-dlp"), lambda: ytdlp_einrichten(eigen.get("yt-dlp", ""), laden_ok, melden)),
        ("whisper", lambda: pfad("whisper-cli"), lambda: whisper_einrichten(eigen.get("whisper-cli", ""), laden_ok, melden)),
        ("modell", lambda: pfad("whisper-modell"), lambda: modell_einrichten(laden_ok, melden)),
        ("hyperframes", lambda: hf_version() == HF_VERSION, lambda: hyperframes_einrichten(laden_ok, melden)),
        ("caches", lambda: False, caches_uebernehmen),
    ]
    ergebnis = {}
    for name, da, tun in schritte:
        if da():
            ergebnis[name] = "vorhanden"
            continue
        melden(f"{name} …")
        try:
            ergebnis[name] = tun()
        except (Fehler, OSError, subprocess.SubprocessError, zipfile.BadZipFile) as e:
            ergebnis[name] = f"FEHLER: {e}"
        melden(f"{name}: {ergebnis[name]}")
    return ergebnis


if __name__ == "__main__":
    befehl = sys.argv[1] if len(sys.argv) > 1 else "stand"
    if befehl == "einrichten":
        print(json.dumps(einrichten(laden_ok="--nur-uebernehmen" not in sys.argv), ensure_ascii=False, indent=2))
    print(json.dumps(stand(), ensure_ascii=False, indent=2))
