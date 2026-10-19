---
type: lesson
title: "Wenn etwas passiert"
description: "Eindämmen, tauschen, dokumentieren, melden: Ein Vorfall wird nicht besser, wenn man ihn verschweigt. Die DSGVO gibt dafür 72 Stunden, und die laufen auch am Wochenende."
tags:
  - lesson
  - domaene
  - dom-sic
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 15
---

# Wenn etwas passiert

## Der Ablauf im Ernstfall

Irgendwann passiert es trotz allem: Ein Schlüssel ist im Netz, ein Agent hat
etwas getan, was er nicht sollte, ein Postfach wurde übernommen. Dann hilft
ein Ablauf, den man vorher kennt. Das Protokoll aus Lektion 6 zeigt dabei,
was genau geschehen ist.

```aufgabe
id: D7-18
typ: schiebe
titel: "Ein Schlüssel im Netz"
punkte: 25
frage: "Ein Zugangsschlüssel zur Kundendatenbank ist in einem öffentlichen Repository aufgetaucht. Bring die Schritte in die richtige Reihenfolge."
bausteine:
  - "Im Protokoll prüfen, ob und wann der Schlüssel benutzt wurde"
  - "Ursache klären und den Ablauf ändern, damit es nicht wieder passiert"
  - "Den Schlüssel sofort sperren und einen neuen ausgeben"
  - "Entscheiden, ob eine Meldung an Aufsicht und Betroffene nötig ist"
loesung:
  - "Den Schlüssel sofort sperren und einen neuen ausgeben"
  - "Im Protokoll prüfen, ob und wann der Schlüssel benutzt wurde"
  - "Entscheiden, ob eine Meldung an Aufsicht und Betroffene nötig ist"
  - "Ursache klären und den Ablauf ändern, damit es nicht wieder passiert"
richtzeit_s: 70
erklaerung: |
  Erst den Schaden begrenzen, dann verstehen, was passiert ist. Ob gemeldet
  werden muss, hängt davon ab, ob Daten tatsächlich abgeflossen sein können -
  das zeigt das Protokoll. Am Ende steht die Ursache, nicht die Schuldfrage.
```

## Melden: wer, wann, wem

Bei einer Panne mit personenbezogenen Daten verlangt die DSGVO:

- **Intern dokumentieren:** jede Panne, auch die kleine (Art. 33 Abs. 5).
- **An die Aufsichtsbehörde melden:** binnen 72 Stunden, nachdem die Panne
  bekannt wurde, wenn ein Risiko für die Betroffenen besteht (Art. 33).
- **Die Betroffenen benachrichtigen:** wenn ein hohes Risiko besteht (Art. 34).

```aufgabe
id: D7-19
typ: uebereinstimmung
titel: "Welche Pflicht wann?"
punkte: 25
frage: "Ordne jeder Pflicht zu, wann sie greift."
links:
  - "Panne intern dokumentieren"
  - "Meldung an die Aufsichtsbehörde"
  - "Benachrichtigung der Betroffenen"
rechts:
  - "bei jeder Panne"
  - "binnen 72 Stunden, wenn ein Risiko besteht"
  - "wenn ein hohes Risiko für die Betroffenen besteht"
loesung:
  "Panne intern dokumentieren": "bei jeder Panne"
  "Meldung an die Aufsichtsbehörde": "binnen 72 Stunden, wenn ein Risiko besteht"
  "Benachrichtigung der Betroffenen": "wenn ein hohes Risiko für die Betroffenen besteht"
richtzeit_s: 70
erklaerung: |
  Drei Stufen, je nach Schwere. Ob ein Risiko besteht, entscheidet ein
  Mensch, meist mit der Datenschutzbeauftragten - ein Werkzeug kann den
  Sachverhalt aus dem Protokoll zusammenstellen.
```

```aufgabe
id: D7-20
typ: denkaufgabe
titel: "72 Stunden ab Freitag"
punkte: 25
frage: "Die Firma erfährt am Freitag um 16 Uhr von einer meldepflichtigen Datenpanne. Bis wann muss die Meldung an die Aufsichtsbehörde spätestens raus?"
optionen:
  - "Montag, 16 Uhr"
  - "Mittwoch, 16 Uhr"
  - "Dienstag, 16 Uhr"
  - "Freitag der nächsten Woche"
loesung: "Montag, 16 Uhr"
richtzeit_s: 60
erklaerung: |
  72 Stunden sind drei Tage, und sie laufen über das Wochenende weiter.
  Wer erst am Montag früh mit der Prüfung beginnt, hat nur noch wenige
  Stunden. Deshalb braucht jeder Betrieb eine Erreichbarkeit für den Ernstfall.
```
