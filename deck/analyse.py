"""LLM-Werkzeug „Integrieren“: aus einem Link (Ordner, .bat, Adresse) einen Cockpit-Eintrag vorschlagen.

Ablauf: 1. Fakten sammeln (ohne LLM: Starter, Ports, README, Docker-Container zum Port)
        2. Vorschlag nach Regeln
        3. Optional verfeinert die Claude-CLI (Abo, keine Werkzeuge) Name, Beschreibung, Ordner und Fragen.
Datenschutz: An die Claude-CLI gehen nur Programmdateien in Auszügen (Starter, README, package.json,
docker-compose). Zeilen mit Schlüsseln/Passwörtern werden vorher entfernt, .env-Werte nie gelesen
(nur *_PORT), der Benutzerpfad wird maskiert.
"""
from __future__ import annotations

import datetime
import html
import json
import os
import re
import shutil
import subprocess
import urllib.request
from pathlib import Path
from urllib.parse import unquote, urlsplit

from prozesse import OHNE_FENSTER, port_offen

STARTER_ENDUNGEN = (".bat", ".cmd")
NEBEN_RE = re.compile(r"stop|login|anmeld|audit|export|install|update|setup|build|test|werkzeug|deploy|backup", re.I)
HAUPT_RE = re.compile(r"start|run|play|launch|go\b", re.I)
GEHEIM_RE = re.compile(r"(?i)(api[_-]?key|token|secret|passw|pwd|bearer|auth|cookie|credential)\s*[=:]")
PORT_RES = (re.compile(r"(?:127\.0\.0\.1|localhost|0\.0\.0\.0):(\d{2,5})"),
            re.compile(r"(?i)PORT\"?\s*=\s*\"?(\d{2,5})\b"),
            re.compile(r"(?i)--port[= ](\d{2,5})\b"))
HEUTE = lambda: datetime.date.today().isoformat()  # noqa: E731


def eingerichtet(p: Path) -> str:
    try:
        st = p.stat()
        return datetime.date.fromtimestamp(getattr(st, "st_birthtime", st.st_ctime)).isoformat()
    except OSError:
        return HEUTE()


def _lesen(p: Path, max_zeichen: int = 3000, max_zeilen: int = 80, ohne_rem: bool = False) -> str:
    try:
        text = p.read_text("utf-8", errors="replace")
    except OSError:
        return ""
    heim = str(Path.home())
    aus = []
    for z in text.splitlines():
        s = z.strip()
        if not s or GEHEIM_RE.search(s):
            continue
        if ohne_rem and re.match(r"(?i)^(rem\b|::)", s):
            continue
        aus.append(z.replace(heim, "%USERPROFILE%"))
        if len(aus) >= max_zeilen:
            break
    return "\n".join(aus)[:max_zeichen]


def ports_in(text: str) -> list[int]:
    gefunden: list[int] = []
    for rx in PORT_RES:
        for m in rx.findall(text):
            n = int(m)
            if 80 <= n <= 65535 and n not in gefunden:
                gefunden.append(n)
    return gefunden


def starter_sortiert(ordner: Path) -> list[Path]:
    try:
        bats = [f for f in ordner.iterdir() if f.is_file() and f.suffix.lower() in STARTER_ENDUNGEN]
    except OSError:
        return []

    def rang(f: Path) -> tuple:
        n = f.stem
        return (1 if NEBEN_RE.search(n) else 0, 0 if HAUPT_RE.search(n) else 1, 0 if n.isupper() else 1, n.lower())
    return sorted(bats, key=rang)


def env_ports(ordner: Path) -> dict[str, int]:
    """Nur Schlüssel, die auf PORT enden – alle anderen .env-Zeilen werden nicht angefasst."""
    aus: dict[str, int] = {}
    for name in (".env", ".env.example", "env.beispiel"):
        p = ordner / name
        if not p.is_file():
            continue
        try:
            for z in p.read_text("utf-8", errors="replace").splitlines():
                m = re.match(r"^\s*([A-Z0-9_]*PORT)\s*=\s*\"?(\d{2,5})\"?\s*$", z)
                if m:
                    aus.setdefault(m.group(1), int(m.group(2)))
        except OSError:
            pass
    return aus


# ------------------------------------------------------------------ Docker
def docker_exe() -> str:
    for k in (shutil.which("docker") or "",
              str(Path.home() / "AppData/Local/Programs/DockerDesktop/resources/bin/docker.exe"),
              r"C:\Program Files\Docker\Docker\resources\bin\docker.exe"):
        if k and Path(k).is_file():
            return k
    return ""


def docker_container(alle: bool = True) -> list[dict] | None:
    exe = docker_exe()
    if not exe:
        return None
    args = [exe, "ps", "--format", "{{.Names}}|{{.Ports}}|{{.State}}"] + (["-a"] if alle else [])
    try:
        r = subprocess.run(args, capture_output=True, timeout=8, creationflags=OHNE_FENSTER)
    except (OSError, subprocess.SubprocessError):
        return None
    if r.returncode != 0:
        return None
    aus = []
    for z in r.stdout.decode("utf-8", errors="replace").splitlines():
        name, _, rest = z.partition("|")
        ports, _, zustand = rest.rpartition("|")
        aus.append({"name": name.strip(), "ports": ports.strip(), "laeuft": zustand.strip() == "running"})
    return aus


def container_erstellt(name: str) -> str:
    """Anlagedatum eines Containers (JJJJ-MM-TT) – heute, wenn Docker nicht antwortet."""
    exe = docker_exe()
    if exe and re.match(r"^[A-Za-z0-9][A-Za-z0-9_.-]{0,127}$", name or ""):
        try:
            r = subprocess.run([exe, "inspect", "-f", "{{.Created}}", name], capture_output=True, timeout=8, creationflags=OHNE_FENSTER)
            m = re.match(rb"(\d{4}-\d{2}-\d{2})", r.stdout.strip())
            if r.returncode == 0 and m:
                return m.group(1).decode()
        except (OSError, subprocess.SubprocessError):
            pass
    return HEUTE()


def container_fuer_port(port: int) -> str:
    for c in docker_container() or []:
        if re.search(rf":{port}->", c["ports"]):
            return c["name"]
    return ""


# ------------------------------------------------------------------ Link deuten
def link_deuten(text: str) -> tuple[str, str]:
    t = (text or "").strip().strip('"').strip("'").strip()
    if not t:
        raise ValueError("Bitte einen Link einfügen – Ordner, .bat-Datei oder Adresse.")
    if len(t) > 2000:
        raise ValueError("Der Link ist zu lang.")
    if t.lower().startswith("file:"):
        pfad = unquote(urlsplit(t).path).lstrip("/")
        if re.match(r"^[A-Za-z]:", pfad):
            p = Path(pfad)
            return ("pfad", str(p)) if p.suffix.lower() not in (".html", ".htm") else ("url", t)
        return "url", t
    if re.match(r"(?i)^https?://", t):
        return "url", t
    if re.match(r"^[A-Za-z]:[\\/]", t) or t.startswith("\\\\"):
        return "pfad", t
    if re.match(r"(?i)^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?(/|$)", t):
        return "url", "http://" + t
    if re.match(r"(?i)^[a-z0-9.-]+\.[a-z]{2,}(:\d+)?(/\S*)?$", t):
        return "url", "https://" + t
    raise ValueError("Das sieht weder nach Pfad (D:\\…) noch nach Adresse (http://…) aus.")


# ------------------------------------------------------------------ Fakten
def pfad_fakten(roh: str) -> dict:
    p = Path(roh)
    if p.is_file():
        datei, ordner = p, p.parent
    elif p.is_dir():
        datei, ordner = None, p
    else:
        raise ValueError(f"Pfad nicht gefunden: {roh}")
    starter = starter_sortiert(ordner)
    if datei and datei.suffix.lower() in STARTER_ENDUNGEN + (".exe",):
        starter = [datei] + [s for s in starter if s != datei]
    f: dict = {"art": "pfad", "ordner": str(ordner), "ordnername": ordner.name, "eingerichtet": eingerichtet(ordner),
               "datei": str(datei) if datei else "", "starter": [], "ports": [], "env_ports": env_ports(ordner)}
    for s in starter[:6]:
        text = _lesen(s, ohne_rem=True) if s.suffix.lower() != ".exe" else ""
        f["starter"].append({"name": s.name, "pfad": str(s), "auszug": text, "ports": ports_in(text)})
        for n in ports_in(text):
            if n not in f["ports"]:
                f["ports"].append(n)
    for n in f["env_ports"].values():
        if n not in f["ports"]:
            f["ports"].append(n)
    if not f["ports"]:  # Python-/Node-Programme ohne Port im Starter
        for kandidat in ("app.py", "server.py", "main.py", "serve.py", "server.js", "serve.mjs", "vite.config.ts", "vite.config.js"):
            q = ordner / kandidat
            if q.is_file():
                f["ports"] += [n for n in ports_in(_lesen(q, 6000, 400)) if n not in f["ports"]]
    for name in ("README.md", "readme.md", "README.txt", "LIESMICH.md"):
        if (ordner / name).is_file():
            f["readme"] = _lesen(ordner / name, 2500, 50)
            break
    if (ordner / "package.json").is_file():
        try:
            pj = json.loads((ordner / "package.json").read_text("utf-8", errors="replace"))
            f["package"] = {"name": pj.get("name"), "scripts": pj.get("scripts", {})}
        except (OSError, ValueError):
            pass
    for name in ("docker-compose.yml", "compose.yml", "docker-compose.yaml", "docker/docker-compose.yml"):
        if (ordner / name).is_file():
            f["compose"] = _lesen(ordner / name, 1500, 60)
            break
    f["index_html"] = (ordner / "index.html").is_file()
    return f


def seitentitel(url: str) -> str:
    if not re.match(r"(?i)^https?://", url):
        return ""
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 Arbeits-Cockpit"})
        with urllib.request.urlopen(req, timeout=4) as r:  # nosec – Adresse kommt vom Nutzer
            roh = r.read(200_000).decode("utf-8", errors="replace")
        m = re.search(r"(?is)<title[^>]*>(.*?)</title>", roh)
        return html.unescape(re.sub(r"\s+", " ", m.group(1))).strip()[:120] if m else ""
    except Exception:  # noqa: BLE001 – Titel ist nur Komfort
        return ""


def url_fakten(url: str) -> dict:
    s = urlsplit(url)
    host = (s.hostname or "").lower()
    lokal = host in ("127.0.0.1", "localhost", "::1")
    port = s.port or (443 if s.scheme == "https" else 80 if s.scheme == "http" else None)
    f = {"art": "url", "url": url, "host": host, "lokal": lokal, "port": port if lokal else None,
         "titel": seitentitel(url) if (not lokal or (port and port_offen(port))) else ""}
    if lokal and port:
        f["erreichbar"] = port_offen(port)
        f["container"] = container_fuer_port(port)
    return f


# ------------------------------------------------------------------ Vorschlag nach Regeln
def _schoen(name: str) -> str:
    n = re.sub(r"[_]+", " ", name).strip()
    return n[:1].upper() + n[1:] if n else name


def vorschlag_regeln(f: dict) -> dict:
    v: dict = {"fragen": []}
    if f["art"] == "pfad":
        v.update(bereich="programme", name=_schoen(f["ordnername"]), ordnerpfad=f["ordner"],
                 eingerichtet=f["eingerichtet"], fenster="versteckt", beschreibung="")
        if f["starter"]:
            st = f["starter"][0]
            art = "befehl" if st["pfad"].lower().endswith(".exe") else "bat"
            v["start"] = {"art": art, "pfad": st["pfad"]} if art == "bat" else {"art": "befehl", "befehl": [st["pfad"]]}
            stop = next((s for s in f["starter"] if re.search(r"stop", s["name"], re.I)), None)
            v["stopp"] = {"art": "bat", "pfad": stop["pfad"]} if stop else {"art": "auto"}
            if re.search(r"(?i)\bchoice\b|set\s+/p\b", st["auszug"]):
                v["fenster"] = "sichtbar"
                v["fragen"].append("Der Starter fragt etwas ab (Menü/Eingabe) – er läuft deshalb in einem sichtbaren Fenster.")
        else:
            v["start"] = {"art": "keiner"}
            v["stopp"] = {"art": "auto"}
            v["fragen"].append("Kein Starter (.bat) gefunden. Wie wird das Programm gestartet? Trage die Adresse ein "
                               "(z. B. http://127.0.0.1:3000/ bei Docker) und wähle ggf. den Docker-Container.")
        if f["ports"]:
            v["port"] = f["ports"][0]
            v["url"] = f"http://127.0.0.1:{f['ports'][0]}/"
            if len(f["ports"]) > 1:
                v["fragen"].append("Mehrere Ports erkannt (" + ", ".join(map(str, f["ports"][:5])) + ") – bitte prüfen.")
        elif f.get("index_html") and not f["starter"]:
            v["bereich"] = "web"
            v["url"] = Path(f["ordner"], "index.html").as_uri()
        elif f["starter"]:
            v["fragen"].append("Kein Port erkannt – unter welcher Adresse öffnet sich das Programm?")
        v["auto_oeffnen"] = False
    else:
        if f["lokal"]:
            v.update(bereich="programme", name=f.get("titel") or (f.get("container") or "").title() or f"Lokal :{f['port']}",
                     url=f["url"], port=f["port"], fenster="versteckt", eingerichtet=HEUTE(), auto_oeffnen=True)
            if f.get("container"):
                v["start"] = {"art": "docker", "container": f["container"]}
                v["eingerichtet"] = container_erstellt(f["container"])
                v["stopp"] = {"art": "docker"}
                v["name"] = f.get("titel") or _schoen(f["container"])
            else:
                v["start"] = {"art": "keiner"}
                v["stopp"] = {"art": "auto"}
                v["fragen"].append("Zu dieser lokalen Adresse ist kein Docker-Container bekannt. Wie startet das Programm? "
                                   "Wähle eine .bat-Datei oder einen Container – oder lege es als Web-Seite ab.")
        else:
            v.update(bereich="web", name=f.get("titel") or f["host"], url=f["url"], eingerichtet=HEUTE())
    return v


# ------------------------------------------------------------------ Claude-CLI
SYSTEM = (
    "Du hilfst, Programme in ein lokales Arbeits-Cockpit (Windows) aufzunehmen. Du bekommst Fakten zu einem "
    "Programmordner oder einer Adresse und einen Vorschlag nach Regeln. Antworte NUR mit einem JSON-Objekt, ohne "
    "Text drumherum. Felder: name (kurz, wie das Programm heißt, max 40 Zeichen), beschreibung (ein deutscher Satz, "
    "max 140 Zeichen, was das Programm tut), ordner (passender Ordnername: bevorzugt einer der vorhandenen, sonst ein "
    "neuer kurzer deutscher Name), starter (Dateiname des Haupt-Starters aus der Liste oder null), port (Zahl oder "
    "null), url (Adresse zum Öffnen oder \"\"), fenster (\"versteckt\" für Server, \"sichtbar\" nur bei interaktiven "
    "Menüs/Eingaben), fragen (Liste kurzer deutscher Rückfragen an den Nutzer, nur wenn etwas wirklich unklar ist, "
    "z. B. fehlender Starter oder Port). Erfinde keine Dateien oder Ports, die nicht in den Fakten stehen."
)


def claude_exe() -> str:
    for k in (shutil.which("claude") or "", str(Path.home() / ".local" / "bin" / "claude.exe")):
        if k and Path(k).is_file():
            return k
    return ""


def _umgebung(konfig: str = "") -> dict:
    """API-Schlüssel entfernen → die CLI rechnet über das Abo ab. Optional ein anderes Konto (CLAUDE_CONFIG_DIR)."""
    env = {k: v for k, v in os.environ.items()
           if k not in ("ANTHROPIC_API_KEY", "ANTHROPIC_AUTH_TOKEN", "CLAUDECODE", "CLAUDE_CODE_ENTRYPOINT")}
    if konfig and Path(konfig).is_dir():
        env["CLAUDE_CONFIG_DIR"] = konfig
    return env


def claude_konten() -> list[str]:
    """Mögliche Claude-Konfigurationsordner (~/.claude, ~/.claude-advocat2 …) – nur Ordnernamen, keine Inhalte."""
    try:
        return sorted(str(p) for p in Path.home().iterdir() if p.is_dir() and p.name.startswith(".claude"))
    except OSError:
        return []


def claude_fragen(fakten: dict, vorschlag: dict, ordner_namen: list[str], modell: str = "sonnet",
                  konfig: str = "") -> tuple[dict | None, str]:
    exe = claude_exe()
    if not exe:
        return None, "Claude-CLI nicht gefunden"
    if modell not in ("sonnet", "opus", "haiku"):
        modell = "sonnet"
    eingabe = json.dumps({"fakten": fakten, "vorschlag_nach_regeln": vorschlag, "vorhandene_ordner": ordner_namen},
                         ensure_ascii=False)
    args = [exe, "-p", "--output-format", "json", "--tools", "", "--no-session-persistence",
            "--model", modell, "--system-prompt", SYSTEM]
    try:
        r = subprocess.run(args, input=eingabe.encode("utf-8"), capture_output=True, timeout=150,
                           env=_umgebung(konfig), creationflags=OHNE_FENSTER, cwd=str(Path(__file__).parent))
    except subprocess.TimeoutExpired:
        return None, "Claude-CLI hat nicht rechtzeitig geantwortet"
    except (OSError, subprocess.SubprocessError) as e:
        return None, f"Claude-CLI startet nicht: {e}"
    try:
        antwort = json.loads(r.stdout.decode("utf-8", errors="replace"))
    except ValueError:
        return None, "Claude-CLI: " + (r.stderr.decode("utf-8", "replace").strip()[:160] or "keine Antwort")
    if not isinstance(antwort, dict):
        return None, "Claude-CLI: unerwartete Antwort"
    text = str(antwort.get("result", ""))
    if antwort.get("is_error"):
        return None, "Claude-CLI: " + (text.strip()[:160] or "Fehler")
    m = re.search(r"\{.*\}", text, re.S)
    try:
        return (json.loads(m.group(0)), "") if m else (None, "Claude-CLI: Antwort ohne JSON")
    except ValueError:
        return None, "Claude-CLI: Antwort war kein gültiges JSON"


def zusammenfuehren(v: dict, llm: dict, fakten: dict) -> dict:
    """Nur plausible LLM-Werte übernehmen."""
    if isinstance(llm.get("name"), str) and 0 < len(llm["name"].strip()) <= 60:
        v["name"] = llm["name"].strip()
    if isinstance(llm.get("beschreibung"), str):
        v["beschreibung"] = llm["beschreibung"].strip()[:200]
    if isinstance(llm.get("ordner"), str) and 0 < len(llm["ordner"].strip()) <= 40:
        v["ordner_name"] = llm["ordner"].strip()
    if fakten["art"] == "pfad" and isinstance(llm.get("starter"), str):
        st = next((s for s in fakten["starter"] if s["name"].lower() == llm["starter"].lower()), None)
        if st and not st["pfad"].lower().endswith(".exe"):
            v["start"] = {"art": "bat", "pfad": st["pfad"]}
    if isinstance(llm.get("port"), int) and llm["port"] in (fakten.get("ports") or [fakten.get("port")]):
        v["port"] = llm["port"]
        if not v.get("url") or "127.0.0.1" in v.get("url", ""):
            v["url"] = f"http://127.0.0.1:{llm['port']}/"
    if llm.get("fenster") in ("versteckt", "sichtbar") and v.get("bereich") == "programme":
        v["fenster"] = llm["fenster"]
    if isinstance(llm.get("fragen"), list):
        neu = [str(x).strip()[:300] for x in llm["fragen"] if str(x).strip()]
        v["fragen"] = list(dict.fromkeys(v.get("fragen", []) + neu))[:5]
    return v


def analysieren(link: str, ordner_namen: list[str], llm_an: bool = True, modell: str = "sonnet", konfig: str = "") -> dict:
    art, wert = link_deuten(link)
    fakten = pfad_fakten(wert) if art == "pfad" else url_fakten(wert)
    v = vorschlag_regeln(fakten)
    schritte = []
    if art == "pfad":
        schritte.append(f"Ordner gelesen: {fakten['ordnername']} (eingerichtet {fakten['eingerichtet']})")
        schritte.append(f"{len(fakten['starter'])} Starter gefunden" + (": " + ", ".join(s['name'] for s in fakten['starter'][:4]) if fakten['starter'] else ""))
        schritte.append("Ports: " + (", ".join(map(str, fakten["ports"][:5])) if fakten["ports"] else "keiner erkannt"))
    else:
        schritte.append(f"Adresse: {fakten['host']}" + (f" · Titel „{fakten['titel']}“" if fakten.get("titel") else ""))
        if fakten["lokal"]:
            schritte.append(("Docker-Container: " + fakten["container"]) if fakten.get("container") else "Kein Docker-Container zu diesem Port")
    llm_genutzt = False
    if llm_an:
        antwort, grund = claude_fragen(fakten, v, ordner_namen, modell, konfig)
        if antwort:
            v = zusammenfuehren(v, antwort, fakten)
            llm_genutzt = True
            schritte.append("Claude hat Name, Beschreibung und Ordner vorgeschlagen")
        else:
            schritte.append(f"{grund} – Vorschlag nur nach Regeln")
    starter = [{"name": s["name"], "pfad": s["pfad"]} for s in fakten.get("starter", [])]
    return {"vorschlag": v, "schritte": schritte, "starter": starter, "llm": llm_genutzt}
