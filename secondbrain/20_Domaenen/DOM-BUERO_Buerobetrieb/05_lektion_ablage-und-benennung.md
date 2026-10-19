---
type: lesson
title: "Ablage und Benennung"
description: "Ein festes Namensschema macht jedes Dokument wiederfindbar, für Menschen und für Werkzeuge. Und manche Dokumente müssen Jahre liegen bleiben, andere dürfen weg."
tags:
  - lesson
  - domaene
  - dom-buero
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 14
---

# Ablage und Benennung

## Ein Name, der etwas sagt

Das Dokument ist erkannt (Lektion 2) und ausgelesen (Lektion 3). Jetzt muss es
irgendwo hin, unter einem Namen, unter dem man es wiederfindet. „scan0034.pdf"
und „Rechnung neu final2.pdf" findet niemand wieder.

Ein festes **Namensschema** löst das, zum Beispiel:

> JJJJ-MM-TT_Absender_Dokumentart.pdf

Das Datum vorne in der Form Jahr-Monat-Tag sortiert sich von selbst richtig.
Den Namen kann das Werkzeug aus den ausgelesenen Feldern bauen, und eine
Regel prüft, ob er dem Schema entspricht.

```aufgabe
id: D3-10
typ: plugplay
titel: "Welche Namen passen zum Schema?"
punkte: 25
frage: "Das Schema lautet JJJJ-MM-TT_Absender_Dokumentart.pdf. Welche Dateinamen halten es ein?"
bausteine:
  - "2026-03-14_Stadtwerke_Rechnung.pdf"
  - "Rechnung neu final2.pdf"
  - "2026-03-02_Mueller-GmbH_Angebot.pdf"
  - "14.03.2026_Stadtwerke_Rechnung.pdf"
  - "scan0034.pdf"
  - "2026-02-27_Finanzamt_Bescheid.pdf"
loesung:
  - "2026-03-14_Stadtwerke_Rechnung.pdf"
  - "2026-03-02_Mueller-GmbH_Angebot.pdf"
  - "2026-02-27_Finanzamt_Bescheid.pdf"
richtzeit_s: 70
erklaerung: |
  Drei Namen folgen dem Schema. „14.03.2026" hat das Datum in der falschen
  Reihenfolge - sortiert nach Namen landet der März dann zwischen Januar und
  Februar anderer Jahre. Eine Regel erkennt das sofort.
```

## Wie lange etwas liegen bleibt

Nicht alles darf sofort weg, nicht alles muss ewig bleiben. Für Unternehmen
schreibt das Steuer- und Handelsrecht Fristen vor. Seit 2025 gilt grob:

- **Jahresabschlüsse und Bücher:** 10 Jahre
- **Buchungsbelege**, etwa Rechnungen: 8 Jahre
- **Geschäftsbriefe**, die ein Geschäft betreffen: 6 Jahre

Werbung und Rundschreiben ohne Bezug zu einem Geschäft müssen nicht
aufbewahrt werden. Die Fristen beginnen mit dem Ende des Kalenderjahres. Für
den eigenen Betrieb klärt die Steuerberatung die Einzelheiten.

```aufgabe
id: D3-11
typ: uebereinstimmung
titel: "Wie lange bleibt es?"
punkte: 25
frage: "Ordne jedem Dokument die Aufbewahrungsfrist zu."
links:
  - "Jahresabschluss 2025"
  - "Eingangsrechnung eines Lieferanten"
  - "Brief an einen Kunden zur Auftragsbestätigung"
  - "Werbeprospekt eines Druckerhändlers"
rechts: [10 Jahre, 8 Jahre, 6 Jahre, keine Pflicht]
loesung:
  "Jahresabschluss 2025": 10 Jahre
  "Eingangsrechnung eines Lieferanten": 8 Jahre
  "Brief an einen Kunden zur Auftragsbestätigung": 6 Jahre
  "Werbeprospekt eines Druckerhändlers": keine Pflicht
richtzeit_s: 80
erklaerung: |
  Die Dokumentklasse aus Lektion 2 entscheidet also auch, wie lange ein
  Dokument liegen bleibt. Ein gutes Ablagesystem legt die Löschfrist gleich
  beim Ablegen fest - dann muss sie später niemand mehr suchen.
```
