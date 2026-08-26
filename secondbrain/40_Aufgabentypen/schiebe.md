---
type: reference
title: "Schiebe-Aufgabe"
description: "Drag and Drop, Reihenfolge finden."
tags:
  - reference
  - aufgabentyp
  - schiebe
timestamp: 2026-08-18T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Schiebe-Aufgabe

`typ: schiebe`

Wie Plug & Play, aber **die Reihenfolge ist die Antwort**.

**Wofür er taugt:** Abläufe. Pipeline-Schritte, Prompt-Aufbau, Zeilen eines Programms.

Bedienbar mit Maus **und** Tastatur: ein Klick schiebt den Baustein hin und zurück. Eine Academy, die Zwölfjährige einlädt, darf keine Aufgabe haben, die nur mit der Maus lösbar ist.

## Felder

```yaml
id: X1-01
typ: schiebe
titel: "…"
punkte: 20
bausteine: [format, kontext, rolle, beispiel, aufgabe]
loesung: [rolle, aufgabe, kontext, format, beispiel]
```

## Bewertung

Folgengleichheit — dieselben Elemente in derselben Reihenfolge.

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
