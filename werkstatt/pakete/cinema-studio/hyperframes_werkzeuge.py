"""PROMPTHEUS Cinema Studio — Werkzeuge für HyperFrames-Videos im Chat-Assistenten.

Eine Sandbox, eine Freigabeliste – für beide Gehirne: OpenRouter ruft die Werkzeuge direkt auf
(tool calling), die Claude-CLI über den kleinen MCP-Server hyperframes_mcp.py. Nur Standardbibliothek.

Was die Werkzeuge dürfen:
- Skills nur lesen, und nur unter <Programm>/.claude/skills.
- Dateien lesen/schreiben nur im Projektordner eines Videos (ablage/hyperframes/…/<projekt>).
- Bilder ansehen nur als PNG/JPG aus snapshots/ oder renders/ im Projektordner (verkleinert über ffmpeg).
- Ausführen nur „hyperframes <unterbefehl> …“ aus der Freigabeliste, als Argumentliste ohne Shell,
  mit Zeitlimit, gekürzter Ausgabe und im Projektordner – HyperFrames, ffmpeg und alle Caches kommen
  aus dem Werkzeugordner im Repo (werkzeugkiste.py), nichts aus dem Benutzerprofil.
"""
from __future__ import annotations

import base64
import hashlib
import ipaddress
import json
import os
import re
import struct
import subprocess
import threading
import time
from pathlib import Path
from urllib.parse import urlparse

import werkzeugkiste as wk

HF_VERSION = wk.HF_VERSION     # fest, damit Renders reproduzierbar bleiben (wie im package.json von init)

# Unterbefehle, die der Assistent ausführen darf
FREI = {"init", "add", "catalog", "capture", "lint", "check", "validate", "inspect", "snapshot", "timeline",
        "compositions", "info", "render", "doctor", "usage", "beats", "keyframes", "docs", "compare"}
# ausdrücklich gesperrt (mit Begründung für die Meldung an das Modell)
GESPERRT = {
    "cloud": "rendert bei HeyGen in der Cloud", "lambda": "AWS-Rendern", "cloudrun": "Google-Cloud-Rendern",
    "publish": "lädt das Projekt ins Internet hoch", "auth": "Anmeldung bei HeyGen", "feedback": "sendet Daten an HeyGen",
    "telemetry": "Telemetrie bleibt aus", "upgrade": "Version ist fest", "preview": "startet einen Server",
    "present": "startet einen Server", "play": "startet einen Server", "open": "öffnet die Desktop-App",
    "catch-up": "gehört zur Desktop-App", "clean": "löscht Dateien außerhalb des Projekts", "history": "nicht nötig",
    "skills": "Skills sind schon installiert – mit skill_lesen lesen", "tts": "lädt ein Sprachmodell (nur auf Wunsch)",
    "transcribe": "lädt ein Sprachmodell (nur auf Wunsch)", "models": "lädt Modelle (nur auf Wunsch)",
    "remove-background": "lädt ein Modell (nur auf Wunsch)", "browser": "verwaltet Chrome", "benchmark": "dauert lange",
}
SCHREIB_ENDUNGEN = {".html", ".htm", ".css", ".js", ".mjs", ".json", ".md", ".txt", ".svg", ".srt", ".vtt", ".csv"}
LESE_ENDUNGEN = SCHREIB_ENDUNGEN | {".yaml", ".yml", ".log", ".xml"}
SKILL_ENDUNGEN = {".md", ".json", ".txt", ".html", ".css", ".js", ".mjs", ".yaml", ".yml"}
NICHT_ZEIGEN = {"node_modules", ".git", "__pycache__", ".cache", ".hyperframes"}
MAX_LESEN = 40_000              # Zeichen je Leseaufruf (größere Dateien seitenweise über „ab“)
MAX_SCHREIBEN = 400_000
MAX_AUSGABE = 12_000
BILD_ENDUNGEN = {".png", ".jpg", ".jpeg"}
BILD_ORDNER = {"snapshots", "renders"}     # nur Standbilder aus diesen Ordnern (snapshot, check --snapshots)
MAX_BILDER = 3                  # je Aufruf von bild_ansehen
BILD_KANTE = 1024               # längste Kante, die an das Modell geht
BILD_BYTES = 350_000            # darüber wird auch ein kleines Bild neu kodiert
BILD_HART = 4_000_000           # ohne ffmpeg gehen nur Bilder bis zu dieser Größe unverkleinert durch
WIEDERHOLT = ("(Schon gelesen – der Inhalt ist unverändert und steht weiter oben im Verlauf. "
              "Nicht erneut lesen, sondern dort nachsehen.)")
ZEIT_RENDER = 900
ZEIT_SONST = 180
NAME_RE = re.compile(r"^[a-z0-9][a-z0-9_-]{0,60}$")
ANSI_RE = re.compile(r"\x1b\[[0-9;?]*[ -/]*[@-~]")
URL_RE = re.compile(r"^https?://[^\s\"'<>]{3,500}$")
WIN = os.name == "nt"


class Verboten(ValueError):
    """Ein Aufruf verlässt die Sandbox oder die Freigabeliste."""


class MitBildern(str):
    """Werkzeugergebnis als Text plus angehängte Bilder: bilder = [{"pfad", "mime", "daten" (base64)}].
    Bleibt ein str, damit alle Stellen, die nur Text erwarten, unverändert funktionieren."""
    bilder: list

    def __new__(cls, text: str, bilder: list):
        o = super().__new__(cls, text)
        o.bilder = bilder
        return o


# --------------------------------------------------------------------------- Pfade
def _ist_link(p: Path) -> bool:
    try:
        return p.is_symlink() or (hasattr(p, "is_junction") and p.is_junction())
    except OSError:
        return True


def pfad_in(wurzel: Path, rel: str) -> Path:
    """Relativen Pfad sicher unter <wurzel> auflösen – sonst Verboten.
    Kein absoluter Pfad, kein Laufwerk, kein „..“, keine Symlinks/Junctions unterwegs."""
    rel = str(rel or ".").strip().replace("\\", "/")
    if "\x00" in rel or len(rel) > 300:
        raise Verboten("Ungültiger Pfad.")
    if rel.startswith("/") or re.match(r"^[a-zA-Z]:", rel) or rel.startswith("~"):
        raise Verboten("Nur Pfade relativ zum Projektordner.")
    teile = [t for t in rel.split("/") if t not in ("", ".")]
    if any(t == ".." for t in teile):
        raise Verboten("„..“ ist nicht erlaubt – der Projektordner wird nicht verlassen.")
    if any(t.endswith((" ", ".")) or ":" in t for t in teile):
        raise Verboten("Ungültiger Dateiname.")
    basis = wurzel.resolve()
    ziel = basis.joinpath(*teile)
    p = basis
    for t in teile:                      # jeder vorhandene Abschnitt: kein Link nach draußen
        p = p / t
        if _ist_link(p):
            raise Verboten("Verknüpfungen (Symlink/Junction) sind nicht erlaubt.")
    aufgeloest = ziel.resolve()
    if aufgeloest != basis and basis not in aufgeloest.parents:
        raise Verboten("Pfad liegt außerhalb des Projektordners.")
    return aufgeloest


# --------------------------------------------------------------------------- Skills
def _frontmatter(text: str) -> dict:
    if not text.startswith("---"):
        return {}
    ende = text.find("\n---", 3)
    if ende < 0:
        return {}
    out, schluessel = {}, ""
    for zeile in text[3:ende].splitlines():
        m = re.match(r"^([A-Za-z_][\w-]*):\s*(.*)$", zeile)
        if m:
            schluessel, wert = m.group(1), m.group(2).strip()
            out[schluessel] = "" if wert in (">", "|", ">-", "|-") else wert.strip("\"'")
        elif schluessel and zeile.startswith((" ", "\t")):
            out[schluessel] = (out[schluessel] + " " + zeile.strip()).strip()
    return out


def skills_liste(skills: Path) -> list[dict]:
    out = []
    if not skills.is_dir():
        return out
    for d in sorted(skills.iterdir()):
        f = d / "SKILL.md"
        if not d.is_dir() or _ist_link(d) or not f.is_file():
            continue
        try:
            fm = _frontmatter(f.read_text("utf-8", "replace")[:6000])
        except OSError:
            continue
        out.append({"name": fm.get("name") or d.name, "beschreibung": fm.get("description", "")[:600]})
    return out


def skills_index(skills: Path) -> str:
    return "\n".join(f"- {s['name']}: {s['beschreibung'][:260]}" for s in skills_liste(skills))


# --------------------------------------------------------------------------- Ausführen
def hf_befehl() -> list[str]:
    """[node, hyperframes.mjs] aus dem Werkzeugordner – ohne cmd.exe und ohne npx-Download."""
    return wk.hyperframes_befehl()


def hf_umgebung() -> dict:
    env = wk.umgebung({k: v for k, v in os.environ.items()
                       if not re.search(r"(KEY|TOKEN|SECRET|PASSWORD|PASSWORT)", k, re.I) or k.startswith("HYPERFRAMES_PYTHON")})
    env.update({"HYPERFRAMES_NO_TELEMETRY": "1", "HYPERFRAMES_SKIP_SKILLS": "1", "HYPERFRAMES_NO_UPDATE_CHECK": "1",
                "DO_NOT_TRACK": "1", "NO_COLOR": "1", "FORCE_COLOR": "0", "CI": "1"})
    return env


def url_oeffentlich(url: str) -> str:
    """Nur http(s) auf öffentliche Hosts – nichts im eigenen Rechner oder Netz (kein SSRF über capture)."""
    t = urlparse(url)
    host = (t.hostname or "").lower()
    if t.scheme not in ("http", "https") or not host or t.username or t.password:
        raise Verboten("Bitte einen vollständigen öffentlichen Link mit https:// angeben.")
    if host == "localhost" or host.endswith((".local", ".localhost", ".internal", ".lan", ".home")):
        raise Verboten("Links auf lokale Adressen sind nicht erlaubt.")
    try:
        ip = ipaddress.ip_address(host.strip("[]"))
    except ValueError:
        return url
    if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved or ip.is_unspecified or ip.is_multicast:
        raise Verboten("Links auf lokale Adressen sind nicht erlaubt.")
    return url


def argumente_pruefen(befehl: str, argumente: list) -> list[str]:
    if befehl in GESPERRT:
        raise Verboten(f"„{befehl}“ ist gesperrt ({GESPERRT[befehl]}).")
    if befehl not in FREI:
        raise Verboten(f"Unbekannter oder nicht freigegebener Unterbefehl „{befehl}“. Erlaubt: {', '.join(sorted(FREI))}.")
    if not isinstance(argumente, list) or len(argumente) > 30:
        raise Verboten("„argumente“ muss eine Liste mit höchstens 30 Einträgen sein.")
    out = []
    for a in argumente:
        if not isinstance(a, (str, int, float)) or isinstance(a, bool):
            raise Verboten("Jedes Argument muss ein Text sein.")
        a = str(a)
        if len(a) > 2000 or any(c in a for c in "\x00\r\n"):
            raise Verboten("Argument zu lang oder mit Zeilenumbruch.")
        wert = a.split("=", 1)[1] if a.startswith("-") and "=" in a else a
        if URL_RE.match(wert):
            if befehl not in ("capture", "add", "catalog"):
                raise Verboten("Links sind nur bei capture erlaubt.")
            url_oeffentlich(wert)
        elif "://" in wert or re.match(r"^(file|data|javascript|vbscript|blob):", wert, re.I):
            raise Verboten("Nur http(s)-Links, und nur bei capture.")
        elif not wert.lstrip().startswith(("{", "[")):         # JSON-Werte (z. B. --variables) sind keine Pfade
            w = wert.replace("\\", "/")
            if w.startswith(("/", "~")) or re.match(r"^[a-zA-Z]:", w) or ".." in w.split("/"):
                raise Verboten(f"Argument „{a[:80]}“ zeigt aus dem Projektordner hinaus.")
        if a.split("=", 1)[0] in ("--docker", "--gpu", "--browser-gpu"):
            raise Verboten(f"{a.split('=', 1)[0]} ist hier nicht vorgesehen.")
        out.append(a)
    if befehl == "init":
        namen = [a for a in out if not a.startswith("-")]
        if any(not NAME_RE.match(n) for n in namen):
            raise Verboten("Projektname für init: nur a–z, 0–9, - und _.")
        if "--non-interactive" not in out:
            out.append("--non-interactive")
    return out


def _baum_beenden(proc: subprocess.Popen) -> None:
    if proc.poll() is not None:
        return
    if WIN:      # node startet Chrome-Kinder → ganzen Prozessbaum beenden
        subprocess.run(["taskkill", "/PID", str(proc.pid), "/T", "/F"], capture_output=True,
                       creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
    if proc.poll() is None:
        proc.kill()


def _kuerzen(text: str, n: int = MAX_AUSGABE) -> str:
    text = ANSI_RE.sub("", text).replace("\r\n", "\n")
    text = re.sub(r"[^\n]*\r", "", text)            # Fortschrittsbalken (Wagenrücklauf) zusammenfalten
    if len(text) <= n:
        return text
    return text[: n // 3] + f"\n… ({len(text) - n} Zeichen ausgelassen) …\n" + text[-(2 * n) // 3:]


# --------------------------------------------------------------------------- Bilder
def bild_art(daten: bytes) -> str:
    """MIME-Typ nach dem Dateiinhalt (nicht nach der Endung) – nur PNG und JPEG."""
    if daten[:8] == b"\x89PNG\r\n\x1a\n":
        return "image/png"
    if daten[:3] == b"\xff\xd8\xff":
        return "image/jpeg"
    return ""


def bild_masse(daten: bytes) -> tuple[int, int]:
    """(Breite, Höhe) aus dem PNG-Kopf bzw. dem JPEG-SOF-Abschnitt; (0, 0), wenn unlesbar."""
    if daten[:8] == b"\x89PNG\r\n\x1a\n" and len(daten) >= 24:
        return struct.unpack(">II", daten[16:24])
    i = 2
    while daten[:2] == b"\xff\xd8" and i + 9 < len(daten):
        if daten[i] != 0xFF:
            i += 1
            continue
        m = daten[i + 1]
        if m in (0xD8, 0x01, 0xFF) or 0xD0 <= m <= 0xD7:
            i += 1 if m == 0xFF else 2
            continue
        if m in (0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF):
            h, w = struct.unpack(">HH", daten[i + 5:i + 9])
            return w, h
        i += 2 + struct.unpack(">H", daten[i + 2:i + 4])[0]
    return 0, 0


def _in_bildordner(projekt: Path, f: Path) -> bool:
    return bool({t.lower() for t in f.relative_to(projekt.resolve()).parts[:-1]} & BILD_ORDNER)


# --------------------------------------------------------------------------- Werkzeugkasten
WERKZEUGE = [
    {"name": "skills_liste", "description": "Listet die installierten HyperFrames-Skills (Name und Beschreibung).",
     "parameters": {"type": "object", "properties": {}, "additionalProperties": False}},
    {"name": "skill_lesen",
     "description": "Liest eine Datei eines Skills, z. B. skill='hyperframes', datei='SKILL.md' oder "
                    "datei='references/brief-format.md'. Lange Dateien seitenweise mit 'ab' (Zeichenposition).",
     "parameters": {"type": "object", "properties": {
         "skill": {"type": "string", "description": "Skill-Name aus skills_liste"},
         "datei": {"type": "string", "description": "Pfad im Skill-Ordner, Standard SKILL.md"},
         "ab": {"type": "integer", "description": "Startposition in Zeichen, Standard 0"}},
         "required": ["skill"], "additionalProperties": False}},
    {"name": "ordner_auflisten", "description": "Zeigt Dateien und Ordner im Projektordner (relativer Pfad, Standard '.').",
     "parameters": {"type": "object", "properties": {
         "pfad": {"type": "string"}, "tiefe": {"type": "integer", "description": "1–4, Standard 2"}},
         "additionalProperties": False}},
    {"name": "datei_lesen", "description": "Liest eine Textdatei im Projektordner (relativer Pfad). Lange Dateien seitenweise mit 'ab'.",
     "parameters": {"type": "object", "properties": {"pfad": {"type": "string"}, "ab": {"type": "integer"}},
                    "required": ["pfad"], "additionalProperties": False}},
    {"name": "datei_schreiben",
     "description": "Schreibt (überschreibt) eine Textdatei im Projektordner, z. B. 'video/index.html'. "
                    "Erlaubte Endungen: html, css, js, mjs, json, md, txt, svg, srt, vtt, csv.",
     "parameters": {"type": "object", "properties": {"pfad": {"type": "string"}, "inhalt": {"type": "string"}},
                    "required": ["pfad", "inhalt"], "additionalProperties": False}},
    {"name": "hyperframes_ausfuehren",
     "description": "Führt die HyperFrames-CLI aus: hyperframes <befehl> <argumente…> im Ordner 'ordner' (relativ zum "
                    "Projektordner, meist 'video'). Erlaubt: " + ", ".join(sorted(FREI)) + ". Beispiele: "
                    "befehl='lint', ordner='video'; befehl='render', argumente=['-o','renders/titel.mp4'], ordner='video'. "
                    "Die fertige MP4 übernimmt das Programm automatisch in die Bibliothek.",
     "parameters": {"type": "object", "properties": {
         "befehl": {"type": "string"}, "argumente": {"type": "array", "items": {"type": "string"}},
         "ordner": {"type": "string", "description": "Arbeitsordner relativ zum Projektordner, Standard '.'"}},
         "required": ["befehl"], "additionalProperties": False}},
    {"name": "bild_ansehen",
     "description": "Zeigt dir bis zu " + str(MAX_BILDER) + " Standbilder (PNG/JPG) aus snapshots/ oder renders/ im "
                    "Projektordner, damit du das Video wirklich siehst – z. B. nach befehl='snapshot'. Ohne 'pfade' "
                    "kommen die neuesten Snapshots. Bilder werden auf höchstens " + str(BILD_KANTE) + " px verkleinert.",
     "parameters": {"type": "object", "properties": {
         "pfade": {"type": "array", "items": {"type": "string"}, "maxItems": MAX_BILDER,
                   "description": "z. B. ['video/snapshots/frame-01.png']; leer = neueste Snapshots"}},
         "additionalProperties": False}},
]


class Werkzeugkasten:
    """Alle Werkzeuge für ein Projekt. ausfuehren() wirft nie – Fehler gehen als Text an das Modell."""

    def __init__(self, projekt: Path, skills: Path, abbruch: threading.Event | None = None, hf: list | None = None,
                 ffmpeg: str | None = None):
        self.projekt = Path(projekt)
        self.projekt.mkdir(parents=True, exist_ok=True)
        self.skills = Path(skills)
        self.abbruch = abbruch or threading.Event()
        self.hf = hf if hf is not None else hf_befehl()
        self.ffmpeg = ffmpeg if ffmpeg is not None else wk.pfad("ffmpeg")
        # Kostenbremse: was in diesem Lauf schon geliefert wurde (Schlüssel → Prüfsumme des Textes).
        # Liest das Modell dieselbe Stelle unverändert noch einmal, kommt nur ein kurzer Hinweis statt des Textes.
        self._gelesen: dict[tuple, str] = {}

    # ---- Werkzeuge
    def skills_liste(self) -> str:
        return json.dumps(skills_liste(self.skills), ensure_ascii=False)

    def skill_lesen(self, skill: str, datei: str = "SKILL.md", ab: int = 0) -> str:
        if not NAME_RE.match(str(skill or "")):
            raise Verboten("Unbekannter Skill.")
        wurzel = self.skills / skill
        if not wurzel.is_dir() or _ist_link(wurzel):
            raise Verboten(f"Skill „{skill}“ gibt es nicht – siehe skills_liste.")
        f = pfad_in(wurzel, datei or "SKILL.md")
        if f.is_dir():
            return "\n".join(sorted(str(p.relative_to(f)).replace("\\", "/") + ("/" if p.is_dir() else "")
                                    for p in f.iterdir()))[:MAX_LESEN]
        if f.suffix.lower() not in SKILL_ENDUNGEN:
            raise Verboten("Diese Dateiart wird nicht gelesen.")
        return self._einmal(("skill", str(f), max(0, int(ab or 0))), self._seite(f, ab))

    def ordner_auflisten(self, pfad: str = ".", tiefe: int = 2) -> str:
        start = pfad_in(self.projekt, pfad)
        if not start.is_dir():
            raise Verboten("Kein Ordner.")
        tiefe, zeilen = max(1, min(int(tiefe or 2), 4)), []

        def gehe(d: Path, ebene: int):
            for p in sorted(d.iterdir(), key=lambda x: (x.is_file(), x.name.lower())):
                if len(zeilen) >= 300:
                    return
                if p.name in NICHT_ZEIGEN or _ist_link(p):
                    continue
                rel = str(p.relative_to(self.projekt)).replace("\\", "/")
                zeilen.append(rel + "/" if p.is_dir() else f"{rel}  ({p.stat().st_size} B)")
                if p.is_dir() and ebene < tiefe:
                    gehe(p, ebene + 1)
        gehe(start, 1)
        return "\n".join(zeilen) or "(leer)"

    def datei_lesen(self, pfad: str, ab: int = 0) -> str:
        f = pfad_in(self.projekt, pfad)
        if not f.is_file():
            raise Verboten("Datei nicht gefunden.")
        if f.suffix.lower() not in LESE_ENDUNGEN:
            raise Verboten("Nur Textdateien werden gelesen.")
        return self._einmal(("datei", str(f), max(0, int(ab or 0))), self._seite(f, ab))

    def datei_schreiben(self, pfad: str, inhalt: str) -> str:
        f = pfad_in(self.projekt, pfad)
        if f.suffix.lower() not in SCHREIB_ENDUNGEN:
            raise Verboten(f"Endung {f.suffix or '(keine)'} ist nicht erlaubt.")
        inhalt = str(inhalt if inhalt is not None else "")
        if len(inhalt) > MAX_SCHREIBEN:
            raise Verboten("Datei zu groß.")
        if f.is_dir():
            raise Verboten("Das ist ein Ordner.")
        f.parent.mkdir(parents=True, exist_ok=True)
        pfad_in(self.projekt, str(f.relative_to(self.projekt.resolve())))     # nach mkdir erneut prüfen
        f.write_text(inhalt, "utf-8", newline="\n")
        # den Inhalt kennt das Modell aus seinem eigenen Aufruf – sofortiges Zurücklesen wäre doppelt
        self._gelesen = {k: v for k, v in self._gelesen.items() if k[1] != str(f)}
        self._gelesen[("datei", str(f), 0)] = self._pruefsumme(self._seite(f, 0))
        return f"Gespeichert: {str(f.relative_to(self.projekt.resolve())).replace(chr(92), '/')} ({len(inhalt)} Zeichen)"

    def hyperframes_ausfuehren(self, befehl: str, argumente: list | None = None, ordner: str = ".") -> str:
        befehl = str(befehl or "").strip()
        args = argumente_pruefen(befehl, list(argumente or []))
        cwd = pfad_in(self.projekt, ordner or ".")
        if not cwd.is_dir():
            raise Verboten(f"Ordner „{ordner}“ gibt es nicht (erst init?).")
        if not self.hf:
            return ("FEHLER: HyperFrames ist nicht eingerichtet (Einstellungen → Werkzeuge einrichten) "
                    "oder Node.js fehlt.")
        zeitlimit = ZEIT_RENDER if befehl in ("render", "capture") else ZEIT_SONST
        flags = getattr(subprocess, "CREATE_NO_WINDOW", 0)
        t0 = time.time()
        try:
            proc = subprocess.Popen([*self.hf, befehl, *args], cwd=str(cwd),
                                    stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                                    env=hf_umgebung(), creationflags=flags)
        except OSError as e:
            return f"FEHLER: hyperframes startet nicht: {e}"
        teile: list[bytes] = []
        leser = threading.Thread(target=lambda: teile.append(proc.stdout.read()), daemon=True)
        leser.start()
        grund = ""
        while proc.poll() is None:
            if self.abbruch.is_set():
                grund = "abgebrochen"
            elif time.time() - t0 > zeitlimit:
                grund = f"Zeitlimit {zeitlimit} s überschritten"
            if grund:
                _baum_beenden(proc)
                break
            time.sleep(0.2)
        leser.join(timeout=10)
        proc.stdout.close()
        text =_kuerzen(b"".join(teile).decode("utf-8", "replace"))
        kopf = f"$ hyperframes {befehl} {' '.join(args)}\n" + (
            f"ABBRUCH: {grund}\n" if grund else f"Exit-Code {proc.returncode} · {time.time() - t0:.0f} s\n")
        return kopf + text

    def bild_ansehen(self, pfade: list | str | None = None) -> MitBildern:
        if isinstance(pfade, str):
            pfade = [pfade]
        pfade = [str(p).strip() for p in (pfade or []) if str(p).strip()]
        if len(pfade) > MAX_BILDER:
            raise Verboten(f"Höchstens {MAX_BILDER} Bilder je Aufruf.")
        dateien = [pfad_in(self.projekt, p) for p in pfade] if pfade else self._neueste_snapshots()
        if not dateien:
            raise Verboten("Keine Snapshots gefunden – erst hyperframes_ausfuehren befehl='snapshot' ordner='video'.")
        bilder, zeilen = [], []
        for f in dateien:
            rel = str(f.relative_to(self.projekt.resolve())).replace("\\", "/")
            if f.suffix.lower() not in BILD_ENDUNGEN:
                raise Verboten(f"{rel}: nur PNG oder JPG.")
            if not _in_bildordner(self.projekt, f):
                raise Verboten(f"{rel}: nur Bilder aus snapshots/ oder renders/.")
            if not f.is_file():
                raise Verboten(f"{rel}: Datei nicht gefunden.")
            if f.stat().st_size > 40_000_000:
                raise Verboten(f"{rel}: Bild zu groß.")
            daten = f.read_bytes()
            mime = bild_art(daten)
            if not mime:
                raise Verboten(f"{rel}: kein gültiges PNG/JPG.")
            w, h = bild_masse(daten)
            info = f"{w}×{h}" if w else "?"
            if max(w, h) > BILD_KANTE or len(daten) > BILD_BYTES or not w:
                klein = self._verkleinern(f)
                if klein:
                    daten, mime = klein, "image/jpeg"
                    w2, h2 = bild_masse(daten)
                    info += f" → {w2}×{h2} JPEG"
                elif len(daten) > BILD_HART:
                    raise Verboten(f"{rel}: zu groß und ffmpeg zum Verkleinern fehlt.")
            bilder.append({"pfad": rel, "mime": mime, "daten": base64.b64encode(daten).decode("ascii")})
            zeilen.append(f"- {rel} ({info}, {len(daten) // 1024} KB)")
        return MitBildern(f"{len(bilder)} Bild{'er' if len(bilder) != 1 else ''} angehängt:\n" + "\n".join(zeilen), bilder)

    def _neueste_snapshots(self) -> list[Path]:
        """Die jüngste Serie aus einem snapshots/-Ordner (bis 2 min vor dem neuesten Bild), gleichmäßig auf
        höchstens MAX_BILDER verteilt – bei 5 Schlüsselbildern also Anfang, Mitte, Ende."""
        funde = []
        for wurzel, ordner, namen in os.walk(self.projekt):
            w = Path(wurzel)
            ordner[:] = [d for d in ordner if d not in NICHT_ZEIGEN and not _ist_link(w / d)]
            if "snapshots" not in {t.lower() for t in w.relative_to(self.projekt).parts}:
                continue
            for n in namen:
                p = w / n
                if p.suffix.lower() in BILD_ENDUNGEN and not _ist_link(p):
                    funde.append((p.stat().st_mtime, p))
        if not funde:
            return []
        neu = max(t for t, _ in funde)
        serie = sorted((p for t, p in funde if t >= neu - 120), key=lambda p: str(p).lower())
        if len(serie) > MAX_BILDER:
            schritt = (len(serie) - 1) / (MAX_BILDER - 1)
            serie = [serie[round(i * schritt)] for i in range(MAX_BILDER)]
        return [pfad_in(self.projekt, str(p.relative_to(self.projekt))) for p in serie]

    def _verkleinern(self, f: Path) -> bytes:
        """Längste Kante auf BILD_KANTE (nie vergrößern), JPEG – über ffmpeg als Argumentliste ohne Shell."""
        if not self.ffmpeg:
            return b""
        k = BILD_KANTE
        try:
            r = subprocess.run([self.ffmpeg, "-v", "error", "-nostdin", "-i", str(f), "-frames:v", "1",
                                "-vf", f"scale='min(iw,{k})':'min(ih,{k})':force_original_aspect_ratio=decrease",
                                "-f", "image2pipe", "-c:v", "mjpeg", "-q:v", "4", "-"],
                               capture_output=True, timeout=60, creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
        except (OSError, subprocess.TimeoutExpired):
            return b""
        return r.stdout if r.returncode == 0 and bild_art(r.stdout) == "image/jpeg" else b""

    @staticmethod
    def _pruefsumme(text: str) -> str:
        return hashlib.sha1(text.encode("utf-8", "replace")).hexdigest()

    def _einmal(self, schluessel: tuple, text: str) -> str:
        """Text nur beim ersten Mal (oder nach einer Änderung) liefern, sonst den kurzen Hinweis."""
        summe = self._pruefsumme(text)
        if self._gelesen.get(schluessel) == summe:
            return WIEDERHOLT
        self._gelesen[schluessel] = summe
        return text

    # ---- Verteiler
    def ausfuehren(self, name: str, argumente: dict | None) -> str:
        a = argumente if isinstance(argumente, dict) else {}
        try:
            if name == "skills_liste":
                return self.skills_liste()
            if name == "skill_lesen":
                return self.skill_lesen(str(a.get("skill") or ""), str(a.get("datei") or "SKILL.md"), int(a.get("ab") or 0))
            if name == "ordner_auflisten":
                return self.ordner_auflisten(str(a.get("pfad") or "."), int(a.get("tiefe") or 2))
            if name == "datei_lesen":
                return self.datei_lesen(str(a.get("pfad") or ""), int(a.get("ab") or 0))
            if name == "datei_schreiben":
                return self.datei_schreiben(str(a.get("pfad") or ""), a.get("inhalt"))
            if name == "hyperframes_ausfuehren":
                arg = a.get("argumente")
                if isinstance(arg, str):            # manche Modelle schicken einen Text statt einer Liste
                    arg = arg.split()
                return self.hyperframes_ausfuehren(str(a.get("befehl") or ""), arg or [], str(a.get("ordner") or "."))
            if name == "bild_ansehen":
                return self.bild_ansehen(a.get("pfade"))
            return f"FEHLER: Unbekanntes Werkzeug „{name}“."
        except Verboten as e:
            return f"VERWEIGERT: {e}"
        except (OSError, ValueError, TypeError) as e:
            return f"FEHLER: {e}"[:600]

    def _seite(self, f: Path, ab: int) -> str:
        text = f.read_text("utf-8", "replace")
        ab = max(0, int(ab or 0))
        stueck = text[ab:ab + MAX_LESEN]
        if ab + MAX_LESEN < len(text):
            stueck += f"\n\n[… Datei hat {len(text)} Zeichen – weiter mit ab={ab + MAX_LESEN}]"
        return stueck


def openai_tools(ohne: tuple = ()) -> list[dict]:
    return [{"type": "function", "function": w} for w in WERKZEUGE if w["name"] not in ohne]


def kurz(name: str, argumente: dict | None) -> str:
    """Eine Zeile für die Statusanzeige im Chat."""
    a = argumente if isinstance(argumente, dict) else {}
    if name == "hyperframes_ausfuehren":
        arg = a.get("argumente")
        arg = " ".join(map(str, arg)) if isinstance(arg, list) else str(arg or "")
        return f"hyperframes {a.get('befehl', '')} {arg}".strip()[:160]
    if name == "skill_lesen":
        return f"Skill {a.get('skill', '')} › {a.get('datei') or 'SKILL.md'}"[:160]
    if name in ("datei_lesen", "datei_schreiben"):
        return f"{'liest' if name == 'datei_lesen' else 'schreibt'} {a.get('pfad', '')}"[:160]
    if name == "ordner_auflisten":
        return f"Ordner {a.get('pfad') or '.'}"
    if name == "bild_ansehen":
        p = a.get("pfade")
        p = [p] if isinstance(p, str) else p if isinstance(p, list) else []
        return ("sieht sich an: " + ", ".join(map(str, p)) if p else "sieht sich die neuesten Snapshots an")[:160]
    return name


def renders_finden(projekt: Path) -> list[Path]:
    """Fertige Videos im Projekt (renders/ oder direkt erzeugte MP4/WebM, ohne assets/ und node_modules/)."""
    out = []
    if not projekt.is_dir():
        return out
    for f in projekt.rglob("*"):
        if f.suffix.lower() not in (".mp4", ".webm", ".mov") or not f.is_file():
            continue
        teile = {t.lower() for t in f.relative_to(projekt).parts[:-1]}
        if teile & {"assets", "node_modules", "public", "capture", "captures", ".debug", "media"}:
            continue
        out.append(f)
    return sorted(out, key=lambda p: p.stat().st_mtime)
