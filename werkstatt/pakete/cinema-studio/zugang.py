"""PROMPTHEUS Cinema Studio — Startsperre und Einlass: nur aus der Werkstatt.

Cinema Studio wird aus der PROMPTHEUS-Werkstatt geöffnet (Menülink links
„Cinema-Studio“). Die Werkstatt legt dafür ein Ticket nach `zugang/ticket.json`
neben dieser Datei, gültig höchstens zwei Minuten und nur für einen Start —
dasselbe Muster wie das Academy-Ticket der Werkstatt
(`werkstatt/werkzeuge/starten.mjs`). Weil die Werkstatt selbst nur mit einem
Ticket der Academy startet, ist die Kette Academy → Werkstatt → Cinema Studio
geschlossen.

Es gibt bewusst keinen Start ohne Ticket (Entscheidung vom 06.10.2026).

Grenze: Das ist eine Sperre auf demselben Rechner. Wer Schreibrechte auf den
Programmordner hat, kann ein Ticket selbst anlegen. Auf Schulrechnern gehört
der Ordner deshalb dem Verwalter-Konto, nicht dem Schülerkonto.
"""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import re
import secrets
import threading
import time
from pathlib import Path

ORDNER = Path(__file__).resolve().parent / "zugang"
TICKET = ORDNER / "ticket.json"
HOECHSTENS = 120                     # Sekunden, die ein Ticket höchstens gilt
NONCE_RE = re.compile(r"^[0-9a-f]{32}$")

HINWEIS = """
  ================================================================
   PROMPTHEUS Cinema Studio wird aus der Werkstatt geöffnet.
  ================================================================

  So geht es:
    1. Die Academy starten (PROMPTHEUS-START.bat).
    2. Einstellungen -> Werkstatt -> "Werkstatt öffnen".
    3. In der Werkstatt links unten auf "Cinema-Studio" klicken.

  Cinema Studio startet dann von selbst. Dieses Fenster kannst du schliessen.
"""


def ticket_pruefen(pfad: Path = TICKET, jetzt: float | None = None) -> dict | None:
    """Liest das Ticket, verbraucht es sofort und gibt es zurück, wenn es gilt — sonst None.

    Verbraucht wird es immer, auch wenn es abgelaufen oder kaputt ist: ein Ticket startet höchstens einmal.
    """
    jetzt = time.time() if jetzt is None else jetzt
    try:
        roh = pfad.read_text(encoding="utf-8")
    except OSError:
        return None
    try:
        pfad.unlink()
    except OSError:
        pass                         # bleibt liegen und verfällt
    try:
        ticket = json.loads(roh)
    except ValueError:
        return None
    if not isinstance(ticket, dict):
        return None
    ablauf, nonce = ticket.get("ablauf"), ticket.get("nonce")
    if isinstance(ablauf, bool) or not isinstance(ablauf, (int, float)):
        return None
    if not isinstance(nonce, str) or not NONCE_RE.match(nonce):
        return None
    # Abgelaufen, oder weiter in der Zukunft, als ein echtes Ticket je gilt.
    if not (jetzt <= ablauf <= jetzt + HOECHSTENS):
        return None
    return ticket


# --------------------------------------------------------------------------- Einlass (ab 06.10.2026)
#
# Es gibt keine Anmeldung mehr. Hinein kommt nur, wer aus der Werkstatt kommt:
# Bei jedem Klick auf „Cinema-Studio“ legt die Werkstatt eine Einlassmarke ab —
# 32 Zufallsbytes, hier nur als sha256 gespeichert, 60 Sekunden, einmalig — und
# schickt den Browser mit der Marke im Adressteil hinter `#e=` hierher. Der Teil
# hinter `#` geht nie an einen Server: nicht ins Protokoll, nicht in den Referer.
# Die Seite liest ihn, löscht ihn sofort und tauscht ihn über POST /api/einlass
# gegen das Sitzungs-Cookie. Vorlage: COMMUNITY-ONLINE-EINLASS-PLAN.md §1.

EINLASS = ORDNER / "einlass.json"
EINLASS_SEKUNDEN = 60
MARKE_RE = re.compile(r"^[A-Za-z0-9_-]{43}$")       # 32 Bytes base64url ohne „=“
KONTO = "werkstatt"                                  # das eine Konto hinter dem Einlass
KONTO_NAME = "Werkstatt"
_EINLASS_LOCK = threading.Lock()


def einlass_ausstellen(pfad: Path | None = None, jetzt: float | None = None) -> str:
    """Legt eine Marke ab und gibt sie zurück — wie die Werkstatt (cinema.ts). Hier für die Prüfungen."""
    pfad = pfad or EINLASS
    jetzt = time.time() if jetzt is None else jetzt
    marke = base64.urlsafe_b64encode(secrets.token_bytes(32)).decode().rstrip("=")
    pfad.parent.mkdir(parents=True, exist_ok=True)
    pfad.write_text(json.dumps({"hash": hashlib.sha256(marke.encode()).hexdigest(),
                                "ablauf": int(jetzt) + EINLASS_SEKUNDEN}), encoding="utf-8")
    return marke


def einlass_pruefen(marke, pfad: Path | None = None, jetzt: float | None = None) -> bool:
    """True genau einmal für die gültige Marke; danach ist sie verbraucht.

    Eine falsche Marke verbraucht die liegende nicht — sonst könnte jede Seite auf diesem Rechner
    den Einlass mit Unsinn wegschiessen. Abgelaufene Marken werden weggeräumt.
    """
    pfad = pfad or EINLASS
    jetzt = time.time() if jetzt is None else jetzt
    if not isinstance(marke, str) or not MARKE_RE.match(marke):
        return False
    with _EINLASS_LOCK:
        try:
            daten = json.loads(pfad.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            return False
        ablauf = daten.get("ablauf") if isinstance(daten, dict) else None
        gespeichert = daten.get("hash") if isinstance(daten, dict) else None
        if (isinstance(ablauf, bool) or not isinstance(ablauf, (int, float)) or not isinstance(gespeichert, str)
                or not (jetzt <= ablauf <= jetzt + EINLASS_SEKUNDEN)):
            _weg(pfad)
            return False
        if not hmac.compare_digest(hashlib.sha256(marke.encode()).hexdigest(), gespeichert):
            return False
        _weg(pfad)
        return True


def _weg(pfad: Path) -> None:
    try:
        pfad.unlink()
    except OSError:
        pass


# --------------------------------------------------------------------------- Bindung an die Werkstatt (ab 06.10.2026)
#
# Bei jedem Klick schreibt die Werkstatt `zugang/werkstatt.json` (cinema.ts, bindungSchreiben):
#   arbeitsordner  der Arbeitsordner der Werkstatt → Bilder, Videos, Audio landen in <arbeitsordner>\Cinema-Studio
#   schutzschicht  die Schutzschicht der Werkstatt (127.0.0.1) → alle OpenRouter-Aufrufe gehen dorthin; sie setzt
#                  den Schlüssel der Werkstatt ein, maskiert und protokolliert. Cinema Studio braucht dann keinen
#                  eigenen Schlüssel und sieht den echten nie.
# Gelesen wird bei jedem Gebrauch (zwischengespeichert nach Änderungszeit), damit ein neuer Arbeitsordner ohne
# Neustart gilt. Was nicht passt, wird verworfen — dann gilt der eigene Weg wie früher.

BINDUNG = ORDNER / "werkstatt.json"
SCHUTZ_RE = re.compile(r"^http://127\.0\.0\.1:\d{1,5}$")
_BINDUNG_LEER = {"arbeitsordner": None, "schutzschicht": None}
_bindung_merk: dict = {"schluessel": None, "wert": _BINDUNG_LEER}


def bindung(pfad: Path | None = None) -> dict:
    pfad = pfad or BINDUNG
    try:
        st = pfad.stat()
    except OSError:
        return dict(_BINDUNG_LEER)
    schluessel = (str(pfad), st.st_mtime_ns, st.st_size)
    if _bindung_merk["schluessel"] == schluessel:
        return dict(_bindung_merk["wert"])
    wert = dict(_BINDUNG_LEER)
    try:
        daten = json.loads(pfad.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        daten = {}
    if isinstance(daten, dict):
        ao = daten.get("arbeitsordner")
        if isinstance(ao, str) and ao and Path(ao).is_absolute() and Path(ao).is_dir():
            wert["arbeitsordner"] = Path(ao)
        sc = daten.get("schutzschicht")
        if isinstance(sc, str) and SCHUTZ_RE.match(sc):
            wert["schutzschicht"] = sc
    _bindung_merk.update({"schluessel": schluessel, "wert": wert})
    return dict(wert)


def startfreigabe() -> dict:
    """Beendet das Programm mit Rückgabewert 3 und einem Hinweis, wenn kein gültiges Ticket da ist."""
    ticket = ticket_pruefen()
    if ticket is None:
        print(HINWEIS, flush=True)
        raise SystemExit(3)
    return ticket
