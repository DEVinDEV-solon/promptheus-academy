---
type: lesson
title: "Fristen berechnen"
description: "Der Tag des Zugangs zählt nicht mit, eine Monatsfrist endet am Tag mit derselben Zahl, und fällt das Ende auf ein Wochenende, verschiebt es sich. Fristen rechnet eine Regel, nie das Modell im Kopf."
tags:
  - lesson
  - domaene
  - dom-jura
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 15
---

# Fristen berechnen

## Drei Regeln aus dem BGB

Die Kündigungsfrist aus Lektion 4 ist gefunden. Wann genau läuft sie ab?
Für die meisten Fristen gelten drei Regeln aus dem Bürgerlichen Gesetzbuch:

1. **Der Tag des Ereignisses zählt nicht mit** (§ 187 BGB). Geht ein Schreiben
   am Donnerstag zu, beginnt die Frist am Freitag.
2. **Eine Wochen- oder Monatsfrist endet** an dem Tag, der nach Namen oder
   Zahl dem Ereignistag entspricht (§ 188 BGB). Zwei Wochen ab Donnerstag
   enden an einem Donnerstag; ein Monat ab dem 30. April endet am 30. Mai.
3. **Fällt das Ende auf einen Samstag, Sonntag oder Feiertag**, endet die Frist
   erst am nächsten Werktag (§ 193 BGB).

```aufgabe
id: D6-11
typ: denkaufgabe
titel: "Zwei Wochen"
punkte: 25
frage: "Ein Schreiben mit einer Frist von zwei Wochen geht am Donnerstag, 12. März 2026, zu. Wann endet die Frist?"
optionen:
  - "Donnerstag, 26. März 2026"
  - "Mittwoch, 25. März 2026"
  - "Freitag, 27. März 2026"
  - "Montag, 30. März 2026"
loesung: "Donnerstag, 26. März 2026"
richtzeit_s: 70
erklaerung: |
  Der 12. März zählt nicht mit. Die Frist endet nach zwei Wochen an dem Tag,
  der dem Zugangstag im Namen entspricht: Donnerstag, 26. März, um 24 Uhr.
```

```aufgabe
id: D6-12
typ: denkaufgabe
titel: "Ein Monat, der am Samstag endet"
punkte: 30
frage: "Eine Frist von einem Monat beginnt mit einem Zugang am Donnerstag, 30. April 2026. Der 30. Mai 2026 ist ein Samstag. Wann endet die Frist?"
optionen:
  - "Samstag, 30. Mai 2026"
  - "Freitag, 29. Mai 2026"
  - "Montag, 1. Juni 2026"
  - "Sonntag, 31. Mai 2026"
loesung: "Montag, 1. Juni 2026"
richtzeit_s: 80
hinweise:
  - text: "Erst die Monatsregel, dann die Wochenendregel."
    kostet: 5
erklaerung: |
  Nach der Monatsregel wäre es der 30. Mai. Das ist ein Samstag, also
  verschiebt sich das Ende auf den nächsten Werktag, Montag, 1. Juni.
  Genau hier rechnen Modelle im Kopf gern falsch: Sie kennen die Regel, aber
  nicht den Wochentag.
```

## Wer rechnet, wer kontrolliert

Ein Modell kennt die Regeln, aber es rechnet unzuverlässig, und es weiß nicht
sicher, auf welchen Wochentag ein Datum fällt (Stufe 3: Rechnen macht die
Regel). Fristen rechnet deshalb ein **Kalenderprogramm** oder eine feste
Regel. In Kanzleien gilt außerdem seit jeher: Jede Frist wird doppelt
eingetragen, mit einer **Vorfrist** davor, und eine zweite Person kontrolliert.

```aufgabe
id: D6-13
typ: schiebe
titel: "Die Fristenkontrolle"
punkte: 25
frage: "Bring die Schritte einer sicheren Fristenkontrolle in die richtige Reihenfolge."
bausteine:
  - "Eine zweite Person kontrolliert den Eintrag"
  - "Zugangsdatum des Schreibens feststellen und vermerken"
  - "Frist und Vorfrist im Kalender eintragen"
  - "Fristende mit dem Kalenderprogramm berechnen, Wochenende und Feiertage geprüft"
loesung:
  - "Zugangsdatum des Schreibens feststellen und vermerken"
  - "Fristende mit dem Kalenderprogramm berechnen, Wochenende und Feiertage geprüft"
  - "Frist und Vorfrist im Kalender eintragen"
  - "Eine zweite Person kontrolliert den Eintrag"
richtzeit_s: 60
erklaerung: |
  Ohne festgestelltes Zugangsdatum ist jede Rechnung geraten. Die Vorfrist
  sorgt dafür, dass die Arbeit nicht am letzten Tag beginnt, die zweite
  Person dafür, dass ein Tippfehler auffällt.
```
