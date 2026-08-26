---
type: lesson
title: "Logik und Muster"
description: "Zahlenreihen, Wenn-Dann-Ketten und ein Fehlschluss, der bei KI-Antworten besonders oft passiert."
tags:
  - lesson
  - stufe-2
  - logik
timestamp: 2026-08-18T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 2
dauer_min: 12
---

# Logik und Muster

## Warum Logik in einer KI-Academy

Weil du entscheiden musst, ob eine Antwort **schlüssig** ist. Ein Sprachmodell
schreibt flüssig, auch wenn die Kette nicht trägt — und flüssig gelesen klingt
ein Fehlschluss überzeugend.

Diese Lektion ist deshalb kein Ausflug. Sie ist Werkzeugkunde.

## Muster erkennen

```aufgabe
id: E2-07
typ: mathe
titel: "Die Reihe"
punkte: 20
frage: "2, 6, 12, 20, 30, … — welche Zahl kommt als nächstes?"
loesung: 42
toleranz: 0
richtzeit_s: 90
hinweise:
  - text: "Bilde die Differenzen: 4, 6, 8, 10 — was fällt auf?"
    kostet: 6
erklaerung: |
  Die Abstände wachsen um 2: 4, 6, 8, 10, 12. Also 30 + 12 = 42.
  Anders gesehen: n x (n+1), also 1x2, 2x3, 3x4, 4x5, 5x6, 6x7 = 42.
  Zwei Wege, dieselbe Antwort - das ist ein gutes Zeichen für ein Muster.
```

```aufgabe
id: E2-08
typ: denkaufgabe
titel: "Der Schluss"
punkte: 25
frage: "„Alle Sprachmodelle können Text erzeugen. Dieses Programm erzeugt Text.“ — Was folgt daraus?"
optionen:
  - "Das Programm ist ein Sprachmodell."
  - "Nichts von beidem — der Schluss ist ungültig."
  - "Das Programm ist kein Sprachmodell."
  - "Das Programm ist wahrscheinlich ein Sprachmodell."
loesung: "Nichts von beidem — der Schluss ist ungültig."
richtzeit_s: 90
hinweise:
  - text: "Alle Katzen haben vier Beine. Dein Tisch hat vier Beine. Ist er eine Katze?"
    kostet: 7
erklaerung: |
  Das ist der Fehlschluss der bejahten Folge. Aus "alle A sind B" und "x ist B"
  folgt NICHT "x ist A". Ein Taschenrechner erzeugt auch Text und ist kein
  Sprachmodell.
```

## Der Fehlschluss, der bei KI besonders oft passiert

Er hat einen Namen — **Bestätigungsfehler** — und in diesem Zusammenhang eine
besonders tückische Form:

> Die Antwort klingt so, wie ich es erwartet habe. Also stimmt sie.

Das ist gefährlicher als bei einem Menschen, und zwar aus einem technischen
Grund: **ein Sprachmodell erzeugt genau das, was gut weitergeht** — und was gut
weitergeht, ist meistens das Erwartbare. Ein Modell bestätigt dich also
systematisch, nicht zufällig.

Deshalb ist die nützlichste Frage an eine KI-Antwort nicht „stimmt das?",
sondern:

> **Was müsste wahr sein, damit das falsch ist?**

```aufgabe
id: E2-09
typ: denkaufgabe
titel: "Bestätigung"
punkte: 25
frage: "Warum ist der Bestätigungsfehler bei KI-Antworten besonders tückisch?"
optionen:
  - "Weil KI-Antworten häufiger falsch sind als menschliche."
  - "Weil das Modell das Erwartbare erzeugt und dich deshalb systematisch bestätigt."
  - "Weil KI-Antworten schneller kommen."
  - "Weil Modelle darauf trainiert sind, freundlich zu sein."
loesung: "Weil das Modell das Erwartbare erzeugt und dich deshalb systematisch bestätigt."
richtzeit_s: 70
erklaerung: |
  Es liegt am Verfahren, nicht an der Fehlerquote und nicht an Höflichkeit:
  vorhergesagt wird, was gut weitergeht - und das ist meist das, was du
  ohnehin vermutet hast.
```

## Wenn-Dann-Ketten

Agenten und Automationen sind nichts anderes als Wenn-Dann-Ketten. Wer sie
nicht sauber denken kann, baut Systeme, die in der Mitte kippen — das kommt in
Stufe 3 zurück.

```aufgabe
id: E2-10
typ: schiebe
titel: "Die Kette"
punkte: 30
frage: "Ordne die Aussagen so, dass eine gültige Schlusskette entsteht."
bausteine:
  - "Ich muss die Zahl also nachschlagen"
  - "Diese Antwort enthaelt eine Jahreszahl"
  - "Wenn eine Antwort eine Jahreszahl enthaelt, kann sie erfunden sein"
  - "Also kann diese Antwort erfunden sein"
loesung:
  - "Wenn eine Antwort eine Jahreszahl enthaelt, kann sie erfunden sein"
  - "Diese Antwort enthaelt eine Jahreszahl"
  - "Also kann diese Antwort erfunden sein"
  - "Ich muss die Zahl also nachschlagen"
richtzeit_s: 100
hinweise:
  - text: "Eine Schlusskette beginnt mit der allgemeinen Regel, nicht mit dem Einzelfall."
    kostet: 6
erklaerung: |
  Regel, Fall, Schluss, Handlung. Diese vier Schritte sind das Gerüst jeder
  Prüfung - und, wie du in Stufe 3 sehen wirst, auch das Gerüst jedes Agenten.
```
