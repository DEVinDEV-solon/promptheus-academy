---
type: reference
title: "Multitask"
description: "Mehrere Schritte in Folge."
tags:
  - reference
  - aufgabentyp
  - multitask
timestamp: 2026-08-18T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Multitask

`typ: multitask`

Eine Aufgabe aus mehreren Schritten, jeder mit eigenem Typ und eigenen Punkten.

**Wofür er taugt:** den ganzen Weg zeigen — Prompt schreiben, Ergebnis bewerten, verbessern.

**Teilpunkte je Schritt.** Ohne sie wäre der Multitask die härteste Aufgabe der Academy: vier Schritte richtig und einer falsch gäbe null. Das entmutigt genau die Lernenden, die schon fast durch sind.

Ein Multitask darf keinen Multitask enthalten.

## Felder

```yaml
id: X1-01
typ: multitask
titel: "…"
punkte: 20
schritte:
  - typ: denkaufgabe
    titel: "Welcher Prompt ist besser?"
    punkte: 15
    optionen: ["…", "…"]
    loesung: "…"
  - typ: planung
    titel: "Verbessere ihn"
    punkte: 25
    pruefungen: [ … ]
```

## Bewertung

Summe der Teilpunkte. Die Schritte müssen zusammen die Gesamtpunktzahl ergeben.

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
