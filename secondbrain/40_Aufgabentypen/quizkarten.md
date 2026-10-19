---
type: reference
title: "Quizkarten"
description: "Karten einzeln lesen und auf zwei bis vier Stapel legen."
tags:
  - reference
  - aufgabentyp
  - quizkarten
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Quizkarten

`typ: quizkarten`

Oben liegt eine Karte mit einer Aussage, einem Fall oder einer Frage. Sie wird
auf einen Stapel gelegt, per Knopf oder durch Hinüberziehen. Danach kommt die
nächste Karte. Eine abgelegte Karte lässt sich anklicken, dann liegt sie wieder
oben.

**Wofür er taugt:** stimmt / stimmt nicht, darf ins Modell / bleibt draussen,
Mensch entscheidet / Werkzeug darf vorbereiten, Einordnen in bis zu vier
Kategorien. Das ist das Format `koerbe` aus dem [[lektionsausbau|Lektionsausbau]].

**Regeln, an denen der Parser abbricht:**

- mindestens zwei Karten, kein Kartentext doppelt,
- zwei bis vier Stapel (einer wäre keine Entscheidung, fünf passen auf kein Handy),
- jede Karte steht genau einmal in der Lösung, und nur auf einem Stapel, den es gibt.

Die Karten werden gemischt, die Stapel bleiben in ihrer Reihenfolge.

## Felder

```yaml
id: X1-02
typ: quizkarten
titel: "…"
punkte: 25
karten:
  - "Ein Modell kann eine Rechnungsnummer erfinden."
  - "Was ein Modell mit „sicher“ beantwortet, stimmt auch."
stapel: [stimmt, stimmt nicht]
loesung:
  "Ein Modell kann eine Rechnungsnummer erfinden.": stimmt
  "Was ein Modell mit „sicher“ beantwortet, stimmt auch.": stimmt nicht
```

Kartentexte mit Doppelpunkt oder Komma in Anführungszeichen setzen, innen nur
typografische Anführungszeichen „…“.

## Bewertung

Wie bei [[uebereinstimmung]]: Jede Karte muss auf dem richtigen Stapel liegen.
Eine Karte, die noch oben liegt, zählt als falsch.

## Immer erlaubt

```yaml
frage: "…"              # Fragetext über der Bedienung
richtzeit_s: 90          # ab hier gibt es Schnelligkeitsbonus
hinweise:
  - text: "…"
    kostet: 5
erklaerung: |
  Warum die Lösung stimmt. Erscheint nach der Abgabe.
```

Siehe auch [[Autorenleitfaden]] und [[Prüfungsordnung]].
