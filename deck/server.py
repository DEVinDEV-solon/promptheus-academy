"""Arbeits-Cockpit / PROMPTHEUS DECK – lokale Programme und Web-Seiten an einem Ort.

Start:  ARBEITS-COCKPIT-START.bat  (oder: pythonw server.py --oeffnen)
Adresse: http://127.0.0.1:8777  – bindet nur an 127.0.0.1, ohne Anmeldung.

Derselbe Code läuft zweimal: als DEVinDEV-Arbeits-Cockpit (ohne profil.json) und als PROMPTHEUS DECK
(PROMPTHEUS/deck mit profil.json: eigener Name, Port 8800, Daten in PROMPTHEUS/data/deck, feste Academy-Einträge).

Schutz ohne Login: Host-Kopf muss 127.0.0.1/localhost:PORT sein (gegen DNS-Rebinding), jede API-Anfrage
braucht den Kopf X-Cockpit (fremde Webseiten können ihn ohne CORS-Freigabe nicht senden) und ein
gesetzter Origin muss der eigene sein. Gestartet werden nur Einträge, die im Cockpit stehen.
"""
from __future__ import annotations

import argparse
import base64
import configparser
import datetime
import json
import os
import re
import shutil
import subprocess
import sys
import threading
import time
import uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlsplit

import analyse
import prozesse as pz

BASIS = Path(__file__).resolve().parent
SCRIPTS = BASIS.parent


def _profil() -> dict:
    """profil.json neben server.py: was dieses Cockpit von einem anderen unterscheidet (Name, Port, Daten,
    feste Einträge). Ohne Datei gilt das DEVinDEV-Arbeits-Cockpit."""
    try:
        d = json.loads((BASIS / "profil.json").read_text("utf-8"))
    except (OSError, ValueError):
        d = {}
    return d if isinstance(d, dict) else {}


def platz(text: str) -> str:
    """{OBEN} = der Ordner über diesem Programm (bei DECK: der PROMPTHEUS-Ordner)."""
    return str(text or "").replace("{OBEN}", str(BASIS.parent))


PROFIL = _profil()
PORT = int(PROFIL.get("port") or 8777)
TITEL = str(PROFIL.get("titel") or "Arbeits-Cockpit")
START_BAT = str(PROFIL.get("start_bat") or "ARBEITS-COCKPIT-START.bat")
WEB = BASIS / "web"
DATEN = (BASIS / str(PROFIL.get("daten") or "daten")).resolve()
LOGS = DATEN / "logs"
DATEI = DATEN / "cockpit.json"
AUTOSTART_LNK = (Path.home() / "AppData/Roaming/Microsoft/Windows/Start Menu/Programs/Startup"
                 / f"{PROFIL.get('autostart') or 'Arbeits-Cockpit'}.lnk")
# Wo die Academy nachsieht, ob DECK installiert ist und auf welchem Port (nur mit "melden" im Profil).
MELDUNG = Path(os.environ.get("LOCALAPPDATA") or Path.home() / "AppData/Local") / "PROMPTHEUS" / "deck.json"
# Farbfilter wie in der Academy (srv/varianten.php): sechs dunkle zur Wahl, Pergament/Marmor als helle Seite.
FARBEN = ("standard", "schmiede", "obsidian", "olymp", "olivenhain", "terrakotta", "funkenflug", "pergament", "marmor")
LOKAL = Path(os.environ.get("LOCALAPPDATA") or Path.home() / "AppData/Local")
CHROME_DATEN = LOKAL / "Google/Chrome/User Data"
LOG_MAX = 2_000_000

STANDARD_EINST = {
    "autostart": True, "fenster_beim_start": True, "chrome_profil": "Profile 1",
    # Öffnen ohne eigene Wahl der Karte: Browser ("standard" = Windows-Standardbrowser); browser_profil kommt
    # anfangs aus chrome_profil (Speicher). feste_folge: eigene Reihenfolge des festen Abschnitts (ids).
    "browser": "chrome", "feste_folge": [],
    "favoriten": ["DEVINDEV - LLM/DEVinDEV-Programme"], "programmordner": [str(SCRIPTS)],
    "llm": True, "llm_modell": "sonnet", "claude_konfig": "", "sortierung": "datum",
    "farbe": "standard", "thema": "dunkel", "feste_mitstarten": True,
}
STANDARD_EINST.update({k: v for k, v in (PROFIL.get("einstellungen") or {}).items() if k in STANDARD_EINST})
if isinstance(STANDARD_EINST["programmordner"], list):
    STANDARD_EINST["programmordner"] = [platz(x) for x in STANDARD_EINST["programmordner"]]
ID_RE = re.compile(r"^[a-z0-9][a-z0-9-]{0,63}$")
CONTAINER_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_.-]{0,127}$")
STATIK = {".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
          ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon", ".json": "application/json"}


def heute() -> str:
    return datetime.date.today().isoformat()


def slug(text: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", text.lower().replace("ä", "ae").replace("ö", "oe").replace("ü", "ue").replace("ß", "ss")).strip("-")
    return (s or "eintrag")[:40]


# ====================================================================== Speicher
class Speicher:
    def __init__(self) -> None:
        self.lock = threading.RLock()
        DATEN.mkdir(parents=True, exist_ok=True)
        LOGS.mkdir(exist_ok=True)
        self.d: dict = {}
        neu = True
        if DATEI.is_file():
            try:
                self.d = json.loads(DATEI.read_text("utf-8"))
                neu = False
            except (OSError, ValueError):
                DATEI.replace(DATEI.with_name(f"cockpit.defekt-{int(time.time())}.json"))
        if neu:
            self.d = self._erstbefuellung()
        self.d.setdefault("einstellungen", {})
        # Vor dem Browser je Karte galt für alles das Chrome-Profil – so bleibt es, bis jemand etwas anderes wählt.
        self.d["einstellungen"].setdefault("browser_profil", self.d["einstellungen"].get("chrome_profil") or "")
        for k, v in STANDARD_EINST.items():
            self.d["einstellungen"].setdefault(k, v)
        self.d.setdefault("ordner", [])
        self.d.setdefault("eintraege", [])
        self.d.setdefault("ignoriert", [])
        self.feste_sichern()
        self.sichern()
        self.erstlauf = neu

    def feste_sichern(self) -> None:
        """Feste Einträge des Profils (PROMPTHEUS DECK: die Academy) – immer da, in festen Ordnern ganz oben,
        in fester Reihenfolge (Feld kern), nicht löschbar. Läuft beim Start und nach jeder Änderung."""
        feste, fo = PROFIL.get("feste") or [], PROFIL.get("feste_ordner") or {}
        if not feste:
            return
        with self.lock:
            for bereich in ("web", "programme"):
                o = fo.get(bereich)
                if not o:
                    continue
                alt = next((x for x in self.d["ordner"] if x["id"] == o["id"]), None)
                if alt:
                    self.d["ordner"].remove(alt)
                i = next((n for n, x in enumerate(self.d["ordner"]) if x["bereich"] == bereich), len(self.d["ordner"]))
                self.d["ordner"].insert(i, {"id": o["id"], "name": o["name"], "bereich": bereich, "fest": True})
            ids = set()
            for n, v in enumerate(feste, 1):
                ids.add(v["id"])
                oid = fo[v["bereich"]]["id"]
                pfad = platz(v.get("start", ""))
                e = next((x for x in self.d["eintraege"] if x["id"] == v["id"]), None)
                if e and e["bereich"] != v["bereich"]:
                    self.d["eintraege"].remove(e)
                    e = None
                if not e:
                    roh = {"id": v["id"], "bereich": v["bereich"], "name": v["name"], "url": v["url"], "ordner": oid,
                           "beschreibung": v.get("beschreibung", ""), "quelle": "fest"}
                    if v["bereich"] == "programme":
                        roh.update(port=v.get("port"), start={"art": "bat", "pfad": pfad} if Path(pfad).is_file() else {"art": "keiner"})
                    e = normalisieren(roh, self.d["ordner"], self.d["eintraege"])
                    self.d["eintraege"].append(e)
                e.update(name=v["name"], url=v["url"], ordner=oid, kern=n, kuerzel=str(v.get("kuerzel") or "")[:3])
                e.setdefault("rang", n)  # eigene Reihenfolge im Ordner bleibt (Ziehen), nur der Anfang kommt vom Profil
                if v["bereich"] != "programme":
                    continue
                e["port"] = v.get("port") or e.get("port")
                s = e.get("start") or {}
                if Path(pfad).is_file() and (s.get("art") != "bat" or not Path(s.get("pfad", "")).is_file()):
                    e["start"], e["ordnerpfad"] = {"art": "bat", "pfad": pfad}, str(Path(pfad).parent)
                # Werkstatt/Cinema-Studio starten nur mit Ticket aus der Academy: „Starten“ öffnet dort die Freigabe.
                if v.get("ticket"):
                    e["ticket"], e["ticket_ueber"] = platz(v["ticket"]), str(v.get("ticket_ueber") or "")
                else:
                    e.pop("ticket", None)
                    e.pop("ticket_ueber", None)
            for e in self.d["eintraege"]:
                if e.get("kern") and e["id"] not in ids:
                    for k in ("kern", "kuerzel", "ticket", "ticket_ueber"):
                        e.pop(k, None)

    def _erstbefuellung(self) -> dict:
        if PROFIL.get("vorlage") is False:  # DECK: nur die festen Einträge und leere eigene Ordner
            return {"version": 1, "einstellungen": dict(STANDARD_EINST), "ordner": list(PROFIL.get("ordner") or []),
                    "eintraege": [], "ignoriert": []}
        v = json.loads((BASIS / "vorlage.json").read_text("utf-8"))
        d = {"version": 1, "einstellungen": dict(STANDARD_EINST), "ordner": v["ordner"], "eintraege": [], "ignoriert": []}
        for e in v["eintraege"]:
            e = json.loads(json.dumps(e).replace("{SCRIPTS}", str(SCRIPTS).replace("\\", "\\\\")))
            e["bereich"] = "programme"
            pfad = (e.get("start") or {}).get("pfad")
            if pfad and not Path(pfad).is_file():
                continue  # Programm gibt es hier (noch) nicht
            ordnerpfad = Path(pfad).parent if pfad else None
            if ordnerpfad and ordnerpfad.parent != SCRIPTS and ordnerpfad.parent.parent == SCRIPTS:
                ordnerpfad = ordnerpfad.parent  # z. B. GAMES\SPLASH → GAMES
            e["ordnerpfad"] = str(ordnerpfad) if ordnerpfad else ""
            e["eingerichtet"] = (analyse.eingerichtet(ordnerpfad) if ordnerpfad
                                 else analyse.container_erstellt(e["start"].get("container", "")))
            d["eintraege"].append(normalisieren(e, d["ordner"], d["eintraege"]))
        return d

    def sichern(self) -> None:
        with self.lock:
            tmp = DATEI.with_suffix(".tmp")
            tmp.write_text(json.dumps(self.d, ensure_ascii=False, indent=1), "utf-8")
            os.replace(tmp, DATEI)

    @property
    def einst(self) -> dict:
        return self.d["einstellungen"]

    def eintrag(self, eid: str) -> dict:
        e = next((x for x in self.d["eintraege"] if x["id"] == eid), None)
        if not e:
            raise Fehler("Eintrag nicht gefunden.")
        return e

    def ordner_sichern(self, name: str, bereich: str) -> str:
        """Ordner nach Name finden oder anlegen; gibt die id zurück."""
        name = name.strip()[:40] or "Allgemein"
        o = next((x for x in self.d["ordner"] if x["bereich"] == bereich and x["name"].lower() == name.lower()), None)
        if o:
            return o["id"]
        oid = ("p-" if bereich == "programme" else "w-") + slug(name)
        while any(x["id"] == oid for x in self.d["ordner"]):
            oid += "-2"
        self.d["ordner"].append({"id": oid, "name": name, "bereich": bereich})
        return oid


class Fehler(Exception):
    pass


def normalisieren(roh: dict, ordner: list[dict], vorhandene: list[dict]) -> dict:
    """Prüft und bereinigt einen Eintrag aus der Oberfläche oder der Vorlage."""
    bereich = roh.get("bereich")
    if bereich not in ("programme", "web"):
        raise Fehler("Bereich muss „programme“ oder „web“ sein.")
    name = str(roh.get("name") or "").strip()[:80]
    if not name:
        raise Fehler("Bitte einen Namen angeben.")
    eid = str(roh.get("id") or "")
    if not ID_RE.match(eid):
        eid = slug(name)
        basis, n = eid, 2
        while any(x["id"] == eid for x in vorhandene):
            eid, n = f"{basis}-{n}", n + 1
    oid = roh.get("ordner")
    passend = [o for o in ordner if o["bereich"] == bereich]
    if not any(o["id"] == oid for o in passend):
        if not passend:
            raise Fehler("Kein Ordner vorhanden.")
        oid = passend[0]["id"]
    url = str(roh.get("url") or "").strip()
    if url and not re.match(r"(?i)^(https?|file):", url):
        raise Fehler("Die Adresse muss mit http://, https:// oder file:// beginnen.")
    e = {"id": eid, "bereich": bereich, "name": name, "ordner": oid, "url": url[:2000],
         "beschreibung": str(roh.get("beschreibung") or "").strip()[:300],
         "eingerichtet": str(roh.get("eingerichtet") or heute())[:10], "quelle": roh.get("quelle", "eigen")}
    if isinstance(roh.get("rang"), int) and not isinstance(roh.get("rang"), bool) and oid == roh.get("ordner"):
        e["rang"] = roh["rang"]
    b = _browser_pruefen(roh.get("browser"))
    if b:
        e["browser"] = b
    if bereich == "web":
        if not url:
            raise Fehler("Eine Web-Seite braucht eine Adresse.")
        return e
    port = roh.get("port")
    if port in ("", None):
        port = None
    else:
        try:
            port = int(port)
        except (TypeError, ValueError):
            raise Fehler("Der Port muss eine Zahl sein.") from None
        if not 1 <= port <= 65535:
            raise Fehler("Der Port muss zwischen 1 und 65535 liegen.")
    e["port"] = port
    e["start"] = _start_pruefen(roh.get("start") or {"art": "keiner"}, "Start")
    e["stopp"] = _start_pruefen(roh.get("stopp") or {"art": "auto"}, "Stopp", stopp=True)
    if e["stopp"]["art"] == "docker" and e["start"]["art"] != "docker":
        e["stopp"] = {"art": "auto"}
    e["fenster"] = "sichtbar" if roh.get("fenster") == "sichtbar" else "versteckt"
    e["auto_oeffnen"] = bool(roh.get("auto_oeffnen", e["start"]["art"] in ("docker", "befehl")))
    op = str(roh.get("ordnerpfad") or "").strip()
    if not op and e["start"].get("pfad"):
        op = str(Path(e["start"]["pfad"]).parent)
    e["ordnerpfad"] = op
    return e


def _start_pruefen(s: dict, was: str, stopp: bool = False) -> dict:
    art = s.get("art")
    erlaubt = ("auto", "bat", "docker", "befehl") if stopp else ("bat", "docker", "befehl", "keiner")
    if art not in erlaubt:
        raise Fehler(f"{was}: unbekannte Art „{art}“.")
    if art == "bat":
        p = Path(str(s.get("pfad") or ""))
        if p.suffix.lower() not in (".bat", ".cmd") or not p.is_file():
            raise Fehler(f"{was}: .bat/.cmd-Datei nicht gefunden.")
        if '"' in str(p):
            raise Fehler(f"{was}: ungültiger Pfad.")
        return {"art": "bat", "pfad": str(p)}
    if art == "docker":
        if stopp:
            return {"art": "docker"}
        c = str(s.get("container") or "").strip()
        if not CONTAINER_RE.match(c):
            raise Fehler(f"{was}: bitte den Namen des Docker-Containers angeben.")
        return {"art": "docker", "container": c}
    if art == "befehl":
        b = s.get("befehl")
        if isinstance(b, str):
            b = [b]
        if not isinstance(b, list) or not b or not all(isinstance(x, str) and x for x in b) or len(b) > 30:
            raise Fehler(f"{was}: Befehl fehlt.")
        if not (Path(b[0]).is_file() or shutil.which(b[0])):
            raise Fehler(f"{was}: Programm „{b[0]}“ nicht gefunden.")
        return {"art": "befehl", "befehl": b}
    return {"art": art}


# ====================================================================== Programme steuern
LAEUFE: dict[str, pz.Lauf] = {}
AKTION: dict[str, tuple[str, float, str]] = {}  # id -> (startet|stoppt, zeit, meldung)
_docker_cache: tuple[float, set[str] | None] = (0.0, None)


def log_pfad(eid: str) -> Path:
    return LOGS / f"{eid}.log"


def log_oeffnen(eid: str, titel: str):
    p = log_pfad(eid)
    if p.is_file() and p.stat().st_size > LOG_MAX:
        p.replace(p.with_suffix(".log.1"))
    f = open(p, "ab")
    f.write(f"\r\n===== {datetime.datetime.now():%d.%m.%Y %H:%M:%S} · {titel} =====\r\n".encode("utf-8"))
    f.flush()
    return f


def log_text(roh: bytes) -> str:
    """Zeilenweise: UTF-8, sonst OEM-Codepage 850 (so schreibt cmd.exe „Drücken Sie …“)."""
    zeilen = []
    for z in roh.split(b"\n"):
        try:
            zeilen.append(z.decode("utf-8"))
        except UnicodeDecodeError:
            zeilen.append(z.decode("cp850", errors="replace"))
    return "\n".join(zeilen).replace("\r", "")


def docker_laufend(frisch: bool = False) -> set[str] | None:
    global _docker_cache
    if not frisch and time.time() - _docker_cache[0] < 3:
        return _docker_cache[1]
    c = analyse.docker_container(alle=False)
    _docker_cache = (time.time(), {x["name"] for x in c} if c is not None else None)
    return _docker_cache[1]


def docker_desktop_sicherstellen(eid: str) -> bool:
    if docker_laufend(frisch=True) is not None:
        return True
    exe = analyse.docker_exe()
    kandidaten = [Path(exe).parents[2] / "Docker Desktop.exe"] if exe else []
    kandidaten += [Path(r"C:\Program Files\Docker\Docker\Docker Desktop.exe")]
    desk = next((k for k in kandidaten if k.is_file()), None)
    if not desk:
        AKTION[eid] = ("fehler", time.time(), "Docker Desktop nicht gefunden.")
        return False
    AKTION[eid] = ("startet", time.time(), "Docker Desktop startet …")
    subprocess.Popen([str(desk)], creationflags=subprocess.DETACHED_PROCESS)
    for _ in range(60):
        time.sleep(3)
        if docker_laufend(frisch=True) is not None:
            return True
    AKTION[eid] = ("fehler", time.time(), "Docker Desktop hat nach 3 Minuten nicht geantwortet.")
    return False


def _docker(eid: str, befehl: str, container: str) -> None:
    if not docker_desktop_sicherstellen(eid):
        return
    r = subprocess.run([analyse.docker_exe(), befehl, container], capture_output=True, timeout=120, creationflags=pz.OHNE_FENSTER)
    with open(log_pfad(eid), "ab") as f:
        f.write(f"\r\n===== {datetime.datetime.now():%d.%m.%Y %H:%M:%S} · docker {befehl} {container} =====\r\n".encode())
        f.write(r.stdout + r.stderr)
    docker_laufend(frisch=True)
    if r.returncode != 0:
        AKTION[eid] = ("fehler", time.time(), (r.stderr.decode("utf-8", "replace").strip() or "docker meldet einen Fehler")[:300])


def _hintergrund(eid: str, befehl: list[str] | str, cwd: str, titel: str, env: dict | None = None) -> subprocess.Popen:
    log = log_oeffnen(eid, titel)
    try:
        return subprocess.Popen(befehl, cwd=cwd, stdin=subprocess.DEVNULL, stdout=log, stderr=subprocess.STDOUT,
                                creationflags=pz.OHNE_FENSTER, env=env)
    finally:
        log.close()


def bat_befehl(pfad: str) -> str:
    # /s /c "" … "" – äußere Anführungszeichen fallen weg, Pfade mit Leerzeichen bleiben heil
    return f'cmd.exe /d /s /c ""{pfad}""'


STARTSPERRE = threading.Lock()


def starten(sp: Speicher, eid: str, direkt: bool = False, still: bool = False) -> str:
    """direkt: Ticket-Einträge ohne Umweg starten (Aufruf der Academy, die das Ticket schon abgelegt hat).
    still: kein Browserfenster (Mitstarten beim Cockpit-Start) – PROMPTHEUS-START.bat liest PU_OHNE_BROWSER."""
    e = sp.eintrag(eid)
    if e["bereich"] != "programme":
        raise Fehler("Nur Programme lassen sich starten.")
    if e.get("ticket") and not direkt:
        return _ueber_ticket(sp, e)
    with STARTSPERRE:  # zwei Startwege gleichzeitig (Knopf + Übergabe der Academy) → nur ein Server je Port
        return _starten(sp, e, still)


def _ueber_ticket(sp: Speicher, e: dict) -> str:
    """Werkstatt und Cinema-Studio starten nur mit Ticket aus der Academy (auch für Betreiber). DECK öffnet dort
    die Freigabe – und startet die Academy vorher, falls nötig. Die Academy reicht den Start an DECK zurück."""
    a = next((x for x in sp.d["eintraege"] if x["id"] == e.get("ticket_ueber")), None)
    if a and status_eintrag(a)["z"] == "aus":
        starten(sp, a["id"], still=True)
        # Freigabeseite im Browser/Profil der Karte (sonst der Academy) – dort ist man angemeldet.
        threading.Thread(target=_oeffnen_wenn_bereit, args=(sp, a, e["ticket"], e), daemon=True).start()
        return "Die Academy startet – dort den Start freigeben."
    oeffnen(sp, e["ticket"], e=e)
    return "In der Academy freigeben – dort startet es."


def _starten(sp: Speicher, e: dict, still: bool) -> str:
    eid = e["id"]
    zustand = status_eintrag(e)["z"]
    if zustand == "startet":
        return "Startet schon …"
    if zustand == "laeuft":
        if e.get("url") and not still:
            oeffnen(sp, e["url"], e=e)
            return "Läuft schon – geöffnet."
        return "Läuft schon."
    s = e["start"]
    if s["art"] == "keiner":
        raise Fehler("Für dieses Programm ist kein Start hinterlegt. Über ⋯ › Bearbeiten nachtragen.")
    AKTION[eid] = ("startet", time.time(), "")
    if s["art"] == "docker":
        threading.Thread(target=_docker, args=(eid, "start", s["container"]), daemon=True).start()
    else:
        befehl = bat_befehl(s["pfad"]) if s["art"] == "bat" else s["befehl"]
        cwd = str(Path(s["pfad"]).parent) if s["art"] == "bat" else (e.get("ordnerpfad") or str(BASIS))
        if not Path(cwd).is_dir():
            cwd = str(BASIS)
        if e["fenster"] == "sichtbar":
            proc = subprocess.Popen(befehl, cwd=cwd, creationflags=pz.NEUE_KONSOLE)
            LAEUFE[eid] = pz.Lauf(proc, set(), verstecken=False)
        else:
            proc = _hintergrund(eid, befehl, cwd, "Start", dict(os.environ, PU_OHNE_BROWSER="1") if still else None)
            titel = pz.titel_aus_bat(Path(s["pfad"])) if s["art"] == "bat" else set()
            LAEUFE[eid] = pz.Lauf(proc, titel, verstecken=True)
    if e.get("auto_oeffnen") and e.get("url") and e.get("port") and not still:
        threading.Thread(target=_oeffnen_wenn_bereit, args=(sp, e), daemon=True).start()
    return "Wird gestartet …"


def feste_mitstarten(sp: Speicher) -> None:
    """Beim Cockpit-Start die festen Programme ohne Ticket mitstarten (DECK: die Academy) – ohne Browserfenster."""
    for e in list(sp.d["eintraege"]):
        if e.get("kern") and e["bereich"] == "programme" and not e.get("ticket") and e["start"]["art"] != "keiner":
            try:
                starten(sp, e["id"], still=True)
            except Fehler:
                pass


def melden() -> None:
    """Hinterlegt Port und Start für die Academy (Knopf „PROMPTHEUS DECK“, Übergabe in PROMPTHEUS-START.bat)."""
    if not PROFIL.get("melden"):
        return
    try:
        MELDUNG.parent.mkdir(parents=True, exist_ok=True)
        MELDUNG.write_text(json.dumps({"name": TITEL, "port": PORT, "adresse": f"http://127.0.0.1:{PORT}/",
                                       "server": str(BASIS / "server.py"), "pythonw": pythonw(),
                                       "start": str(BASIS / START_BAT), "version": 1}, ensure_ascii=False, indent=1), "utf-8")
    except OSError:
        pass


def _oeffnen_wenn_bereit(sp: Speicher, e: dict, url: str = "", fuer: dict | None = None) -> None:
    """Öffnet url (sonst die Adresse von e), sobald der Port von e antwortet – im Browser der Karte fuer (sonst e)."""
    for _ in range(120):
        time.sleep(1)
        if pz.port_offen(e["port"]):
            oeffnen(sp, url or e["url"], e=fuer or e)
            return


def stoppen(sp: Speicher, eid: str) -> str:
    e = sp.eintrag(eid)
    if e["bereich"] != "programme":
        raise Fehler("Nur Programme lassen sich beenden.")
    AKTION[eid] = ("stoppt", time.time(), "")
    threading.Thread(target=_stoppen, args=(e,), daemon=True).start()
    return "Wird beendet …"


def _stoppen(e: dict) -> None:
    eid, st = e["id"], e["stopp"]
    if e["start"]["art"] == "docker":
        _docker(eid, "stop", e["start"]["container"])
        return
    if st["art"] in ("bat", "befehl"):
        befehl = bat_befehl(st["pfad"]) if st["art"] == "bat" else st["befehl"]
        cwd = str(Path(st["pfad"]).parent) if st["art"] == "bat" else str(BASIS)
        p = _hintergrund(eid, befehl, cwd, "Stopp")
        try:
            p.wait(timeout=180)
        except subprocess.TimeoutExpired:
            pz.beenden({p.pid})
    pids: set[int] = set()
    lauf = LAEUFE.get(eid)
    if lauf:
        pids |= lauf.lebende()
    if e.get("port"):
        pids |= pz.port_baum(e["port"])
    beendet = pz.beenden(pids) if pids else []
    with open(log_pfad(eid), "ab") as f:
        f.write(f"\r\n===== {datetime.datetime.now():%d.%m.%Y %H:%M:%S} · Stopp: {', '.join(beendet) or 'nichts zu beenden'} =====\r\n".encode())
    LAEUFE.pop(eid, None)


def status_eintrag(e: dict, docker: set[str] | None = None) -> dict:
    s = e["start"]
    lauf = LAEUFE.get(e["id"])
    if s["art"] == "docker":
        docker = docker if docker is not None else docker_laufend()
        an = bool(docker and s["container"] in docker)
    elif e.get("port"):
        an = pz.port_offen(e["port"])
    else:
        an = bool(lauf and lauf.lebende())
    info = ""
    akt = AKTION.get(e["id"])
    z = "laeuft" if an else "aus"
    if akt:
        art, seit, meldung = akt
        alter = time.time() - seit
        if art == "startet" and not an and alter < 180:
            z, info = "startet", meldung
        elif art == "stoppt" and an and alter < 60:
            z = "stoppt"
        elif art == "fehler" and alter < 120:
            info = meldung
        if (art == "startet" and an) or (art == "stoppt" and not an) or alter > 180:
            AKTION.pop(e["id"], None)
    if z == "startet" and lauf and not e.get("port") and s["art"] != "docker":
        z = "laeuft" if lauf.lebende() else "aus"
    if z == "aus" and lauf and lauf.rueckgabe() not in (None, 0) and time.time() - lauf.gestartet < 300:
        info = info or f"Starter endete mit Code {lauf.rueckgabe()} – siehe Protokoll."
    return {"z": z, "info": info}


def status_alle(sp: Speicher) -> dict:
    docker = docker_laufend() if any(e.get("start", {}).get("art") == "docker" for e in sp.d["eintraege"]) else None
    return {e["id"]: status_eintrag(e, docker) for e in sp.d["eintraege"] if e["bereich"] == "programme"}


# ====================================================================== Browser, Explorer, Autostart
_PF = Path(os.environ.get("ProgramFiles") or r"C:\Program Files")
_PF86 = Path(os.environ.get("ProgramFiles(x86)") or r"C:\Program Files (x86)")
_ROAMING = Path(os.environ.get("APPDATA") or Path.home() / "AppData/Roaming")
# id -> (Name, Art, mögliche exe, Profil-Daten). Chromium-Browser: Profilordner (--profile-directory) aus „Local State“;
# Firefox: Profilname (-P) aus profiles.ini.
BROWSER: dict[str, tuple[str, str, tuple[Path, ...], Path]] = {
    "chrome": ("Google Chrome", "chromium", (_PF / "Google/Chrome/Application/chrome.exe", _PF86 / "Google/Chrome/Application/chrome.exe",
                                              LOKAL / "Google/Chrome/Application/chrome.exe"), CHROME_DATEN),
    "edge": ("Microsoft Edge", "chromium", (_PF86 / "Microsoft/Edge/Application/msedge.exe", _PF / "Microsoft/Edge/Application/msedge.exe"),
             LOKAL / "Microsoft/Edge/User Data"),
    "brave": ("Brave", "chromium", (_PF / "BraveSoftware/Brave-Browser/Application/brave.exe", _PF86 / "BraveSoftware/Brave-Browser/Application/brave.exe",
                                    LOKAL / "BraveSoftware/Brave-Browser/Application/brave.exe"), LOKAL / "BraveSoftware/Brave-Browser/User Data"),
    "comet": ("Comet", "chromium", (LOKAL / "Perplexity/Comet/Application/comet.exe", _PF / "Perplexity/Comet/Application/comet.exe"),
              LOKAL / "Perplexity/Comet/User Data"),
    "vivaldi": ("Vivaldi", "chromium", (LOKAL / "Vivaldi/Application/vivaldi.exe", _PF / "Vivaldi/Application/vivaldi.exe"), LOKAL / "Vivaldi/User Data"),
    "firefox": ("Firefox", "firefox", (_PF / "Mozilla Firefox/firefox.exe", _PF86 / "Mozilla Firefox/firefox.exe"), _ROAMING / "Mozilla/Firefox"),
}
PROFIL_RE = re.compile(r'^[^"\x00-\x1f]{1,80}$')


def browser_exe(bid: str) -> str:
    return next((str(k) for k in (BROWSER.get(bid) or ("", "", (), Path()))[2] if k.is_file()), "")


def chrome_exe() -> str:
    return browser_exe("chrome")


def browser_profile(bid: str) -> list[dict]:
    """[{id, name, konto}] – id ist das, was beim Start übergeben wird (Profilordner bzw. Firefox-Profilname)."""
    b = BROWSER.get(bid)
    if not b or not b[3].is_dir():
        return []
    aus: list[dict] = []
    if b[1] == "firefox":
        ini = configparser.ConfigParser(interpolation=None)
        try:
            ini.read(b[3] / "profiles.ini", encoding="utf-8")
        except (OSError, configparser.Error):
            return []
        for s in ini.sections():
            name = ini[s].get("Name") if s.startswith("Profile") else None
            if name and PROFIL_RE.match(name):
                aus.append({"id": name, "name": name, "konto": ""})
        return aus
    try:
        cache = json.loads((b[3] / "Local State").read_text("utf-8")).get("profile", {}).get("info_cache", {})
    except (OSError, ValueError, AttributeError):
        cache = {}
    for ordner, info in (cache.items() if isinstance(cache, dict) else []):
        if PROFIL_RE.match(ordner) and (b[3] / ordner).is_dir():
            info = info if isinstance(info, dict) else {}
            aus.append({"id": ordner, "name": str(info.get("name") or ordner)[:60], "konto": str(info.get("user_name") or "")[:80]})
    if not aus:  # ohne „Local State“: die Ordner selbst
        aus = [{"id": p.name, "name": p.name, "konto": ""} for p in b[3].iterdir()
               if p.is_dir() and (p / "Preferences").is_file() and PROFIL_RE.match(p.name)]
    nr = lambda p: (p["id"] != "Default", int(re.sub(r"\D", "", p["id"]) or 0), p["id"])  # noqa: E731 – Default, Profile 1, 2, …
    return sorted(aus, key=nr)


def browser_liste() -> list[dict]:
    """Installierte Browser samt Profilen – für die Auswahl in Karte und Einstellungen."""
    return [{"id": bid, "name": b[0], "profile": browser_profile(bid)} for bid, b in BROWSER.items() if browser_exe(bid)]


def _browser_pruefen(b) -> dict | None:
    """Browser einer Karte: {art, profil} – ohne art gilt die Einstellung (nichts speichern)."""
    if not isinstance(b, dict) or not b.get("art"):
        return None
    art, profil = str(b["art"]), str(b.get("profil") or "").strip()
    if art == "standard":
        return {"art": "standard", "profil": ""}
    if art not in BROWSER:
        raise Fehler("Unbekannter Browser.")
    if profil and not PROFIL_RE.match(profil):
        raise Fehler("Ungültiges Browser-Profil.")
    # Ein Chromium-Profilordner, den es nicht gibt, legt der Browser stillschweigend NEU an – darum nur bekannte.
    if profil and browser_exe(art) and profil not in {p["id"] for p in browser_profile(art)}:
        raise Fehler(f"Profil „{profil}“ gibt es in {BROWSER[art][0]} nicht.")
    return {"art": art, "profil": profil}


def browser_fuer(sp: Speicher, e: dict | None) -> tuple[str, str]:
    """Wahl der Karte, sonst die der Karte, über die sie freigegeben wird (Werkstatt → Academy), sonst die Einstellung."""
    kette = [e] if e else []
    if e and e.get("ticket_ueber"):
        kette.append(next((x for x in sp.d["eintraege"] if x["id"] == e["ticket_ueber"]), None))
    for x in kette:
        b = (x or {}).get("browser") or {}
        if b.get("art"):
            return b["art"], b.get("profil") or ""
    return sp.einst.get("browser") or "chrome", sp.einst.get("browser_profil") or ""


def oeffnen(sp: Speicher, url: str, app: bool = False, e: dict | None = None) -> None:
    if not re.match(r"(?i)^(https?|file):", url or ""):
        raise Fehler("Keine gültige Adresse.")
    art, profil = browser_fuer(sp, e)
    exe = browser_exe(art) if art != "standard" else ""
    if not exe:
        os.startfile(url)  # noqa: S606 – Standardbrowser (gewählter Browser fehlt oder „Standard“)
        return
    if BROWSER[art][1] == "firefox":
        args = [exe] + (["-P", profil] if profil else []) + ["-new-window" if app else "-new-tab", url]
    else:
        args = [exe] + ([f"--profile-directory={profil}"] if profil else [])
        args += [f"--app={url}", "--window-size=1440,900"] if app else [url]
    subprocess.Popen(args, creationflags=subprocess.DETACHED_PROCESS)


def explorer(pfad: str) -> None:
    p = Path(pfad)
    if p.is_file():
        subprocess.Popen(["explorer.exe", f"/select,{p}"])
    elif p.is_dir():
        subprocess.Popen(["explorer.exe", str(p)])
    else:
        raise Fehler("Ordner nicht gefunden.")


def pythonw() -> str:
    exe = Path(sys.executable)
    w = exe.with_name("pythonw.exe")
    return str(w if w.is_file() else exe)


def autostart_setzen(an: bool) -> None:
    if not an:
        AUTOSTART_LNK.unlink(missing_ok=True)
        return
    AUTOSTART_LNK.parent.mkdir(parents=True, exist_ok=True)
    q = lambda s: str(s).replace("'", "''")  # noqa: E731 – PowerShell-String in einfachen Anführungszeichen
    symbol = BASIS / "web" / ("deck.ico" if (BASIS / "web" / "deck.ico").is_file() else "cockpit.ico")
    ps = (f"$s=(New-Object -ComObject WScript.Shell).CreateShortcut('{q(AUTOSTART_LNK)}');"
          f"$s.TargetPath='{q(pythonw())}';$s.Arguments='\"{q(BASIS / 'server.py')}\" --autostart';"
          f"$s.WorkingDirectory='{q(BASIS)}';"
          + (f"$s.IconLocation='{q(symbol)},0';" if symbol.is_file() else "")
          + f"$s.Description='{q(TITEL)}';$s.Save()")
    r = subprocess.run(["powershell.exe", "-NoProfile", "-NonInteractive", "-EncodedCommand",
                        base64.b64encode(ps.encode("utf-16-le")).decode()],
                       capture_output=True, timeout=30, creationflags=pz.OHNE_FENSTER)
    if r.returncode != 0 or not AUTOSTART_LNK.is_file():
        raise Fehler("Autostart-Verknüpfung ließ sich nicht anlegen.")


# ====================================================================== Chrome-Favoriten
def chrome_profile() -> list[str]:
    if not CHROME_DATEN.is_dir():
        return []
    return sorted(p.name for p in CHROME_DATEN.iterdir()
                  if p.is_dir() and ((p / "Bookmarks").is_file() or (p / "AccountBookmarks").is_file()))


def favoriten_lesen(profil: str, pfade: list[str]) -> list[tuple[str, str, str]]:
    """[(ordnername, name, url)] aus den Lesezeichen-Ordnern (Unterordner werden eigene Ordner)."""
    if not re.match(r"^[\w .-]{1,60}$", profil or ""):
        raise Fehler("Ungültiges Chrome-Profil.")
    aus: list[tuple[str, str, str]] = []
    gesehen: set[str] = set()
    for datei in ("Bookmarks", "AccountBookmarks"):
        p = CHROME_DATEN / profil / datei
        if not p.is_file():
            continue
        try:
            wurzeln = json.loads(p.read_text("utf-8")).get("roots", {})
        except (OSError, ValueError):
            continue
        for pfad in pfade:
            teile = [t.strip() for t in pfad.split("/") if t.strip()]
            for w in wurzeln.values():
                knoten = w if isinstance(w, dict) else None
                for t in teile:
                    knoten = next((c for c in (knoten or {}).get("children", []) if c.get("type") == "folder" and c.get("name") == t), None)
                    if not knoten:
                        break
                if knoten:
                    _sammeln(knoten, teile[-1], aus, gesehen, oben=True)
    return aus


def _sammeln(knoten: dict, ordner: str, aus: list, gesehen: set, oben: bool = False) -> None:
    for c in knoten.get("children", []):
        if c.get("type") == "folder":
            _sammeln(c, c["name"] if oben else f"{ordner} / {c['name']}", aus, gesehen)
        elif c.get("type") == "url":
            url = c.get("url", "")
            if re.match(r"(?i)^(https?|file):", url) and url not in gesehen:
                gesehen.add(url)
                aus.append((ordner, (c.get("name") or url)[:80], url))


def favoriten_importieren(sp: Speicher) -> int:
    neu = 0
    with sp.lock:
        bekannt = {e["url"] for e in sp.d["eintraege"] if e["bereich"] == "web"}
        for ordner, name, url in favoriten_lesen(sp.einst["chrome_profil"], sp.einst["favoriten"]):
            if url in bekannt:
                continue
            oid = sp.ordner_sichern(ordner, "web")
            sp.d["eintraege"].append(normalisieren({"bereich": "web", "name": name, "url": url, "ordner": oid,
                                                    "quelle": "chrome", "eingerichtet": heute()},
                                                   sp.d["ordner"], sp.d["eintraege"]))
            bekannt.add(url)
            neu += 1
        sp.sichern()
    return neu


# ====================================================================== Programmordner ohne Eintrag
def ohne_eintrag(sp: Speicher) -> list[dict]:
    registriert = []
    for e in sp.d["eintraege"]:
        for p in (e.get("ordnerpfad"), (e.get("start") or {}).get("pfad")):
            if p:
                registriert.append(Path(p).resolve())
    ignoriert = {str(Path(p)).lower() for p in sp.d["ignoriert"]}
    aus = []
    for wurzel in sp.einst["programmordner"]:
        w = Path(wurzel)
        if not w.is_dir():
            continue
        for d in w.iterdir():
            if not d.is_dir() or d.name.startswith((".", "_")) or d.resolve() == BASIS or str(d).lower() in ignoriert:
                continue
            dr = d.resolve()
            if any(r == dr or dr in r.parents for r in registriert):
                continue
            starter = [s.name for s in analyse.starter_sortiert(d)]
            aus.append({"pfad": str(d), "name": d.name, "eingerichtet": analyse.eingerichtet(d), "starter": starter})
    aus.sort(key=lambda x: x["eingerichtet"], reverse=True)
    return aus


# ====================================================================== HTTP
class Handler(BaseHTTPRequestHandler):
    server_version = "Cockpit"
    sp: Speicher

    def log_message(self, *a) -> None:  # keine Konsole unter pythonw
        pass

    def _erlaubt(self) -> bool:
        port = self.server.server_address[1]
        if self.headers.get("Host", "") not in (f"127.0.0.1:{port}", f"localhost:{port}"):
            return False
        origin = self.headers.get("Origin")
        if origin and origin not in (f"http://127.0.0.1:{port}", f"http://localhost:{port}"):
            return False
        return True

    def _senden(self, code: int, daten: bytes, typ: str) -> None:
        self.send_response(code)
        self.send_header("Content-Type", typ)
        self.send_header("Content-Length", str(len(daten)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("Content-Security-Policy", "default-src 'self'; img-src 'self' data:; style-src 'self'; "
                                                    "script-src 'self'; connect-src 'self'; frame-ancestors 'none'")
        self.end_headers()
        self.wfile.write(daten)

    def _json(self, code: int, obj: dict) -> None:
        self._senden(code, json.dumps(obj, ensure_ascii=False).encode("utf-8"), "application/json; charset=utf-8")

    def do_GET(self) -> None:  # noqa: N802
        if not self._erlaubt():
            return self._json(403, {"ok": False, "fehler": "Nur lokal erreichbar."})
        u = urlsplit(self.path)
        if u.path.startswith("/api/"):
            if self.headers.get("X-Cockpit") != "1":
                return self._json(403, {"ok": False, "fehler": "Kopf fehlt."})
            return self._api(u.path[5:], {k: v[0] for k, v in parse_qs(u.query).items()})
        name = "index.html" if u.path in ("/", "/index.html") else u.path.lstrip("/")
        p = (WEB / name).resolve()
        if WEB.resolve() not in p.parents or not p.is_file() or p.suffix not in STATIK:
            return self._senden(404, b"Nicht gefunden", "text/plain; charset=utf-8")
        self._senden(200, p.read_bytes(), STATIK[p.suffix])

    def do_POST(self) -> None:  # noqa: N802
        if not self._erlaubt() or self.headers.get("X-Cockpit") != "1":
            return self._json(403, {"ok": False, "fehler": "Nur lokal erreichbar."})
        if not self.headers.get("Content-Type", "").startswith("application/json"):
            return self._json(415, {"ok": False, "fehler": "JSON erwartet."})
        laenge = int(self.headers.get("Content-Length") or 0)
        if laenge > 1_000_000:
            return self._json(413, {"ok": False, "fehler": "Zu groß."})
        try:
            body = json.loads(self.rfile.read(laenge) or b"{}")
            if not isinstance(body, dict):
                raise ValueError
        except ValueError:
            return self._json(400, {"ok": False, "fehler": "Ungültiges JSON."})
        u = urlsplit(self.path)
        if not u.path.startswith("/api/"):
            return self._json(404, {"ok": False, "fehler": "Unbekannt."})
        self._api(u.path[5:], body)

    def _api(self, was: str, b: dict) -> None:
        sp = self.sp
        try:
            fn = getattr(self, "api_" + was, None) if re.match(r"^[a-z_]+$", was) else None
            if not fn:
                return self._json(404, {"ok": False, "fehler": "Unbekannte Aktion."})
            erg = fn(sp, b)
            self._json(200, {"ok": True, **(erg or {})})
        except Fehler as e:
            self._json(400, {"ok": False, "fehler": str(e)})
        except Exception as e:  # noqa: BLE001
            with open(DATEN / "fehler.log", "a", encoding="utf-8") as f:
                f.write(f"{datetime.datetime.now():%d.%m.%Y %H:%M:%S} {was}: {e!r}\n")
            self._json(500, {"ok": False, "fehler": f"Interner Fehler: {e}"})

    # ---------------------------------------------------------------- Lesen
    def api_zustand(self, sp: Speicher, b: dict) -> dict:
        with sp.lock:
            d = json.loads(json.dumps(sp.d))
        return {"ordner": d["ordner"], "eintraege": d["eintraege"], "einstellungen": d["einstellungen"], "ignoriert": d["ignoriert"],
                "status": status_alle(sp), "ohne": len(ohne_eintrag(sp)), "autostart_aktiv": AUTOSTART_LNK.is_file(),
                "claude": bool(analyse.claude_exe()), "claude_konten": analyse.claude_konten(),
                "chrome_profile": chrome_profile(), "browser": browser_liste(), "port": PORT,
                "profil": {"titel": TITEL, "marke": PROFIL.get("marke") or "DEVinDEV", "zusatz": PROFIL.get("zusatz") or "- Cockpit -",
                           "start_bat": START_BAT, "feste": bool(PROFIL.get("feste")), "farben": list(FARBEN)}}

    def api_status(self, sp: Speicher, b: dict) -> dict:
        return {"status": status_alle(sp), "docker": docker_laufend() is not None}

    def api_container(self, sp: Speicher, b: dict) -> dict:
        return {"container": [c["name"] for c in (analyse.docker_container() or [])]}

    def api_ohne(self, sp: Speicher, b: dict) -> dict:
        return {"liste": ohne_eintrag(sp)}

    def api_log(self, sp: Speicher, b: dict) -> dict:
        sp.eintrag(str(b.get("id")))
        p = log_pfad(str(b.get("id")))
        if not p.is_file():
            return {"text": "", "pfad": str(p)}
        with open(p, "rb") as f:
            f.seek(max(0, p.stat().st_size - 60_000))
            return {"text": log_text(f.read()), "pfad": str(p)}

    # ---------------------------------------------------------------- Steuern
    def api_starten(self, sp: Speicher, b: dict) -> dict:
        # oeffnen: still starten und die Adresse öffnen, sobald sie antwortet (Übergabe aus PROMPTHEUS-START.bat)
        eid, auf = str(b.get("id")), b.get("oeffnen") is True
        meldung = starten(sp, eid, direkt=b.get("direkt") is True, still=auf)
        e = sp.eintrag(eid)
        if auf and e.get("url") and e.get("port") and not e.get("ticket"):
            threading.Thread(target=_oeffnen_wenn_bereit, args=(sp, e), daemon=True).start()
        return {"meldung": meldung}

    def api_stoppen(self, sp: Speicher, b: dict) -> dict:
        return {"meldung": stoppen(sp, str(b.get("id")))}

    def api_oeffnen(self, sp: Speicher, b: dict) -> dict:
        e = sp.eintrag(str(b.get("id")))
        if not e.get("url"):
            raise Fehler("Keine Adresse hinterlegt – über ⋯ › Bearbeiten nachtragen.")
        oeffnen(sp, e["url"], e=e)
        return {}

    def api_explorer(self, sp: Speicher, b: dict) -> dict:
        if b.get("id") == "__cockpit__":
            explorer(str(BASIS))
            return {}
        e = sp.eintrag(str(b.get("id")))
        explorer((e.get("start") or {}).get("pfad") or e.get("ordnerpfad") or "")
        return {}

    def api_log_leeren(self, sp: Speicher, b: dict) -> dict:
        sp.eintrag(str(b.get("id")))
        log_pfad(str(b.get("id"))).unlink(missing_ok=True)
        return {}

    # ---------------------------------------------------------------- Einträge & Ordner
    def api_eintrag(self, sp: Speicher, b: dict) -> dict:
        roh = b.get("eintrag") or {}
        with sp.lock:
            if roh.get("ordner_name"):
                roh["ordner"] = sp.ordner_sichern(roh["ordner_name"], roh.get("bereich", "programme"))
            for k in ("kern", "ticket", "ticket_ueber"):
                roh.pop(k, None)
            alt = next((x for x in sp.d["eintraege"] if x["id"] == roh.get("id")), None)
            andere = [x for x in sp.d["eintraege"] if x is not alt]
            e = normalisieren({**(alt or {}), **roh, "id": roh.get("id") if alt else ""}, sp.d["ordner"], andere)
            if alt:
                sp.d["eintraege"][sp.d["eintraege"].index(alt)] = e
            else:
                sp.d["eintraege"].append(e)
            sp.feste_sichern()
            sp.sichern()
        return {"eintrag": e}

    def api_eintrag_loeschen(self, sp: Speicher, b: dict) -> dict:
        with sp.lock:
            e = sp.eintrag(str(b.get("id")))
            if e.get("kern"):
                raise Fehler(f"Fest eingetragen – gehört zu {TITEL} und lässt sich nicht entfernen.")
            sp.d["eintraege"].remove(e)
            sp.sichern()
        return {}

    def api_verschieben(self, sp: Speicher, b: dict) -> dict:
        with sp.lock:
            e = sp.eintrag(str(b.get("id")))
            o = next((x for x in sp.d["ordner"] if x["id"] == b.get("ordner")), None)
            if not o or o["bereich"] != e["bereich"]:
                raise Fehler("Programme gehören in Programm-Ordner, Web-Seiten in Web-Ordner.")
            if e.get("kern") and e["ordner"] != o["id"]:
                raise Fehler("Feste Einträge bleiben in ihrem Ordner.")
            if e["ordner"] != o["id"]:
                raenge = [x["rang"] for x in sp.d["eintraege"] if x["ordner"] == o["id"] and "rang" in x]
                e["ordner"] = o["id"]
                if raenge:
                    e["rang"] = max(raenge) + 1
                else:
                    e.pop("rang", None)
            sp.sichern()
        return {}

    def api_anordnen(self, sp: Speicher, b: dict) -> dict:
        """Eigene Reihenfolge: {bereich, ordnung: {ordner_id: [eintrag_id, …]}} – auch ordnerübergreifend."""
        bereich, ordnung = b.get("bereich"), b.get("ordnung")
        if bereich not in ("programme", "web") or not isinstance(ordnung, dict):
            raise Fehler("Ungültige Reihenfolge.")
        with sp.lock:
            ordner = {o["id"] for o in sp.d["ordner"] if o["bereich"] == bereich}
            nach_id = {e["id"]: e for e in sp.d["eintraege"] if e["bereich"] == bereich}
            for oid, ids in ordnung.items():
                if oid not in ordner or not isinstance(ids, list):
                    raise Fehler("Unbekannter Ordner.")
                for i, eid in enumerate(ids[:2000]):
                    e = nach_id.get(eid) if isinstance(eid, str) else None
                    if e and (not e.get("kern") or e["ordner"] == oid):  # feste: Reihenfolge ja, Ordner bleibt
                        e["ordner"], e["rang"] = oid, i
            sp.einst["sortierung"] = "eigen"
            sp.sichern()
        return {}

    def api_ordner(self, sp: Speicher, b: dict) -> dict:
        name = str(b.get("name") or "").strip()[:40]
        if not name:
            raise Fehler("Bitte einen Ordnernamen angeben.")
        with sp.lock:
            if b.get("id"):
                o = next((x for x in sp.d["ordner"] if x["id"] == b["id"]), None)
                if not o:
                    raise Fehler("Ordner nicht gefunden.")
                if o.get("fest"):
                    raise Fehler("Fester Ordner – der Name bleibt.")
                o["name"] = name
                oid = o["id"]
            else:
                if b.get("bereich") not in ("programme", "web"):
                    raise Fehler("Unbekannter Bereich.")
                oid = sp.ordner_sichern(name, b["bereich"])
            sp.sichern()
        return {"id": oid}

    def api_ordner_loeschen(self, sp: Speicher, b: dict) -> dict:
        with sp.lock:
            o = next((x for x in sp.d["ordner"] if x["id"] == b.get("id")), None)
            if not o:
                raise Fehler("Ordner nicht gefunden.")
            if o.get("fest"):
                raise Fehler("Fester Ordner – lässt sich nicht löschen.")
            rest = [x for x in sp.d["ordner"] if x["bereich"] == o["bereich"] and x is not o]
            inhalt = [e for e in sp.d["eintraege"] if e["ordner"] == o["id"]]
            if inhalt and not rest:
                raise Fehler("Der letzte Ordner eines Bereichs kann nicht gelöscht werden, solange er Einträge hat.")
            for e in inhalt:
                e["ordner"] = rest[0]["id"]
            sp.d["ordner"].remove(o)
            sp.sichern()
        return {"verschoben": len(inhalt)}

    def api_ordner_reihenfolge(self, sp: Speicher, b: dict) -> dict:
        ids = [x for x in (b.get("ids") or []) if isinstance(x, str)]
        with sp.lock:
            nach = {oid: i for i, oid in enumerate(ids)}
            sp.d["ordner"].sort(key=lambda o: nach.get(o["id"], 999))
            sp.feste_sichern()
            sp.sichern()
        return {}

    def api_ignorieren(self, sp: Speicher, b: dict) -> dict:
        p = str(b.get("pfad") or "")
        if not Path(p).is_dir():
            raise Fehler("Ordner nicht gefunden.")
        with sp.lock:
            if b.get("rueckgaengig"):
                sp.d["ignoriert"] = [x for x in sp.d["ignoriert"] if x.lower() != p.lower()]
            elif p not in sp.d["ignoriert"]:
                sp.d["ignoriert"].append(p)
            sp.sichern()
        return {}

    # ---------------------------------------------------------------- LLM-Werkzeug
    def api_analysieren(self, sp: Speicher, b: dict) -> dict:
        namen = [o["name"] for o in sp.d["ordner"]]
        try:
            erg = analyse.analysieren(str(b.get("link") or ""), namen, bool(sp.einst.get("llm")), sp.einst.get("llm_modell", "sonnet"),
                                      sp.einst.get("claude_konfig", ""))
        except ValueError as e:
            raise Fehler(str(e)) from None
        v = erg["vorschlag"]
        if v.get("ordner_name"):
            o = next((x for x in sp.d["ordner"] if x["bereich"] == v["bereich"] and x["name"].lower() == v["ordner_name"].lower()), None)
            if o:
                v["ordner"] = o["id"]
                v.pop("ordner_name")
        doppelt = [e["name"] for e in sp.d["eintraege"]
                   if (v.get("start", {}).get("pfad") and (e.get("start") or {}).get("pfad", "").lower() == v["start"]["pfad"].lower())
                   or (v.get("bereich") == "web" and e.get("url") == v.get("url"))]
        if doppelt:
            erg["schritte"].append("Schon im Cockpit als: " + ", ".join(doppelt))
        erg["container"] = [c["name"] for c in (analyse.docker_container() or [])]
        return erg

    # ---------------------------------------------------------------- Einstellungen
    def api_einstellungen(self, sp: Speicher, b: dict) -> dict:
        neu = b.get("einstellungen") or {}
        with sp.lock:
            e = sp.einst
            if "chrome_profil" in neu:
                if neu["chrome_profil"] not in chrome_profile():
                    raise Fehler("Chrome-Profil nicht gefunden.")
                e["chrome_profil"] = neu["chrome_profil"]
            for k in ("favoriten", "programmordner"):
                if k in neu:
                    liste = [str(x).strip() for x in neu[k] if str(x).strip()][:20]
                    if k == "programmordner" and not all(Path(x).is_dir() for x in liste):
                        raise Fehler("Ein Programmordner existiert nicht.")
                    e[k] = liste
            if "browser" in neu or "browser_profil" in neu:
                b = _browser_pruefen({"art": neu.get("browser", e.get("browser")), "profil": neu.get("browser_profil", e.get("browser_profil"))})
                if not b:
                    raise Fehler("Bitte einen Browser wählen.")
                e["browser"], e["browser_profil"] = b["art"], b["profil"]
            if "feste_folge" in neu:
                kern = {x["id"] for x in sp.d["eintraege"] if x.get("kern")}
                ids = [x for x in (neu["feste_folge"] or []) if isinstance(x, str) and x in kern]
                e["feste_folge"] = list(dict.fromkeys(ids))
            if neu.get("farbe") in FARBEN[:7]:  # Pergament/Marmor sind nur die helle Seite (☀/☾), keine Wahl
                e["farbe"] = neu["farbe"]
            if neu.get("thema") in ("dunkel", "hell"):
                e["thema"] = neu["thema"]
            for k in ("fenster_beim_start", "llm", "feste_mitstarten"):
                if k in neu:
                    e[k] = bool(neu[k])
            if "claude_konfig" in neu:
                k = str(neu["claude_konfig"] or "").strip()
                if k and k not in analyse.claude_konten():
                    raise Fehler("Unbekannter Claude-Konfigurationsordner.")
                e["claude_konfig"] = k
            if neu.get("llm_modell") in ("sonnet", "opus", "haiku"):
                e["llm_modell"] = neu["llm_modell"]
            if neu.get("sortierung") in ("datum", "name", "eigen"):
                e["sortierung"] = neu["sortierung"]
            if "autostart" in neu:
                autostart_setzen(bool(neu["autostart"]))
                e["autostart"] = bool(neu["autostart"])
            sp.sichern()
        return {"einstellungen": sp.einst, "autostart_aktiv": AUTOSTART_LNK.is_file()}

    def api_favoriten_import(self, sp: Speicher, b: dict) -> dict:
        return {"neu": favoriten_importieren(sp)}

    def api_beenden(self, sp: Speicher, b: dict) -> dict:
        threading.Timer(0.5, lambda: os._exit(0)).start()
        return {}


# ====================================================================== Start
def main() -> None:
    global PORT
    ap = argparse.ArgumentParser(description=TITEL)
    ap.add_argument("--port", type=int, default=PORT)
    ap.add_argument("--still", action="store_true", help="ohne Fenster starten (Übergabe aus PROMPTHEUS-START.bat)")
    ap.add_argument("--oeffnen", action="store_true", help="nach dem Start das Cockpit-Fenster öffnen")
    ap.add_argument("--autostart", action="store_true", help="Aufruf beim Systemstart")
    ap.add_argument("--autostart-setzen", choices=["an", "aus"], help="Autostart-Verknüpfung anlegen/entfernen und beenden")
    a = ap.parse_args()
    PORT = a.port
    sp = Speicher()
    if a.autostart_setzen:
        autostart_setzen(a.autostart_setzen == "an")
        sp.einst["autostart"] = a.autostart_setzen == "an"
        sp.sichern()
        print("Autostart:", "an" if AUTOSTART_LNK.is_file() else "aus")
        return
    adresse = f"http://127.0.0.1:{PORT}/"
    try:
        srv = ThreadingHTTPServer(("127.0.0.1", PORT), type("H", (Handler,), {"sp": sp}))
    except OSError:
        # läuft schon (zweiter Doppelklick) → nur das Fenster öffnen
        if a.oeffnen or a.autostart:
            oeffnen(sp, adresse, app=True)
        return
    srv.daemon_threads = True
    # Programme, die ein Cockpit startet, erkennen das daran (PROMPTHEUS-START.bat übergibt dann nicht an DECK).
    os.environ["PU_COCKPIT_START"] = "1"
    melden()
    if sp.einst.get("feste_mitstarten", True) and PROFIL.get("feste"):
        threading.Timer(1.5, feste_mitstarten, args=(sp,)).start()
    if sp.erstlauf:
        try:
            favoriten_importieren(sp)
        except Exception as e:  # noqa: BLE001
            with open(DATEN / "fehler.log", "a", encoding="utf-8") as f:
                f.write(f"Favoriten-Import: {e!r}\n")
        if sp.einst.get("autostart"):
            try:
                autostart_setzen(True)
            except Fehler:
                pass
    if not a.still and (a.oeffnen or (a.autostart and sp.einst.get("fenster_beim_start", True))):
        threading.Timer(0.6 if a.oeffnen else 8, oeffnen, args=(sp, adresse, True)).start()
    srv.serve_forever()


if __name__ == "__main__":
    main()
