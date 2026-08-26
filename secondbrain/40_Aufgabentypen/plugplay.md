---
type: reference
title: "Plug & Play"
description: "Bausteine zusammensetzen, ohne Code."
tags:
  - reference
  - aufgabentyp
  - plugplay
timestamp: 2026-08-18T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Plug & Play

`typ: plugplay`

Aus einem Vorrat werden die passenden Bausteine in die Ablage gezogen. **Die Reihenfolge zählt nicht** — es geht um die Auswahl.

**Wofür er taugt:** „Welche Teile braucht ein Agent?“ — Vollständigkeit statt Ablauf.

**Der Vorrat enthält absichtlich mehr Bausteine als die Lösung.** Ohne Ablenker wäre die Aufgabe „schiebe alles hinüber“ und prüfte nichts.

## Felder

```yaml
id: X1-01
typ: plugplay
titel: "…"
punkte: 20
bausteine: [ziel, werkzeug, ablenker1, rolle, ablenker2]
loesung: [ziel, werkzeug, rolle]
```

## Bewertung

Mengengleichheit.

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
