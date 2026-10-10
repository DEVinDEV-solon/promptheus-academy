# PROMPTHEUS DECK

Die Zentrale für alle Programme auf diesem Rechner, auf **http://127.0.0.1:8800** (nur lokal, ohne Anmeldung).

- **Fest eingetragen:** PROMPTHEUS Academy – Webseite, Registrieren, Lokal (8801), Werkstatt (3081),
  Community, Cinema-Studio (8796). Sie stehen oben und lassen sich nicht entfernen; ihre Reihenfolge lässt sich
  per Ziehen ändern (im festen Abschnitt und im eigenen Ordner).
- **Browser & Profil je Karte** (⋯ › Browser & Profil): Chrome, Edge, Brave, Firefox … mit dem Profil, in dem man
  angemeldet ist. Ohne eigene Wahl gilt die Einstellung; Werkstatt und Cinema-Studio erben die Wahl der Karte „Lokal“
  – dort öffnet sich auch ihre Freigabe.
- **Eigene Programme und Seiten** kommen dazu: unten einen Link, Ordner oder eine `.bat` einfügen.
- Programme starten **ohne eigenes Fenster**; Ausgaben stehen im Protokoll (`data\deck\logs`).
- **Werkstatt und Cinema-Studio** starten weiterhin nur mit Ticket aus der Academy. „Starten“ öffnet dort
  die Freigabe; die Academy reicht den Start danach an DECK zurück, sodass kein Fenster aufgeht.
- **Farbfilter** wie in der Academy (Einstellungen), ☀/☾ oben schaltet auf die helle Partnerpalette.

## Start

- `PROMPTHEUS-DECK-START.bat` (Doppelklick), oder automatisch: `PROMPTHEUS-START.bat` startet DECK beim
  ersten Start der Academy mit und übergibt ihm die Academy. Beim Systemstart nur, wenn der Autostart an ist.
- Braucht **Python 3.10+**. Fehlt Python, läuft die Academy wie bisher allein.
- **Autostart** richtet DECK nicht von selbst ein (`profil.json`: `"autostart": false`); einschalten unter
  Einstellungen oder mit `PROMPTHEUS-DECK-START.bat --autostart-setzen an`.
- DECK hinterlegt Port und Startweg in `%LOCALAPPDATA%\PROMPTHEUS\deck.json`. Daran erkennt die Academy, dass
  es installiert ist (Knopf „PROMPTHEUS DECK ›“ in der Community).

## Technik

Derselbe Code wie das DEVinDEV-Arbeits-Cockpit (`server.py`, `prozesse.py`, `analyse.py`, `web/`); was DECK
unterscheidet, steht in `profil.json`. Daten liegen in `..\data\deck\` und überstehen damit jedes Update.
