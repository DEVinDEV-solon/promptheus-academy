---
type: reference
title: "Mathe-Aufgabe"
description: "Rechnen mit KI-Bezug."
tags:
  - reference
  - aufgabentyp
  - mathe
timestamp: 2026-08-18T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Mathe-Aufgabe

`typ: mathe`

Eine Zahl als Antwort, mit Toleranz.

**Wofür er taugt:** Tokenkosten, Kontextlängen, Hashlängen, Wahrscheinlichkeiten.

**Die Toleranz steht in der Aufgabe, nicht im Code.** Ohne sie wäre eine Kostenschätzung praktisch nie richtig — 0,0031 statt 0,0030 ist dieselbe Erkenntnis. Deutsche Schreibweise (`1.234,56`) wird verstanden.

## Felder

```yaml
id: X1-01
typ: mathe
titel: "…"
punkte: 20
loesung: 0.0045
toleranz: 0.0005
einheit: "Euro"
```

## Bewertung

Betragsdifferenz kleiner oder gleich der Toleranz.

## Immer erlaubt

```yaml
frage: "…"              # Fragetext über der Bedienung
richtzeit_s: 90          # ab hier gibt es Schnelligkeitsbonus
hinweise:
  - text: "…"
    kostet: 5
erklaerung: |
  Warum die Lösung stimmt. Erscheint nach der Abgabe.
quelle: "[[90_Quellen/…]]"
```

Siehe auch [[Autorenleitfaden]] und [[Prüfungsordnung]].
