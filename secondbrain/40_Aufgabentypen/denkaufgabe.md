---
type: reference
title: "Denkaufgabe"
description: "Logisches Denken, Mustererkennung, Schlussfolgerung."
tags:
  - reference
  - aufgabentyp
  - denkaufgabe
timestamp: 2026-08-18T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Denkaufgabe

`typ: denkaufgabe`

Der Grundtyp. Eine Frage, mehrere Optionen, eine oder mehrere richtige Antworten.

**Wofür er taugt:** Verständnis prüfen, Fehlvorstellungen aufdecken, Muster erkennen.

**Wofür nicht:** Können. Wer eine richtige Antwort ankreuzt, hat sie erkannt — nicht erzeugt.

## Felder

```yaml
id: X1-01
typ: denkaufgabe
titel: "…"
punkte: 20
optionen: ["…", "…", "…"]
loesung: "…"          # oder eine Liste
mehrfach: false        # true zeigt Kästchen statt Punkte
```

## Bewertung

Mengengleichheit. Reihenfolge egal, Doppelte werden entfernt.

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
