---
type: reference
title: "Planungs-Aufgabe"
description: "Freitext — planen, schreiben, begründen."
tags:
  - reference
  - aufgabentyp
  - planung
timestamp: 2026-08-18T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Planungs-Aufgabe

`typ: planung`

Der einzige Typ mit freier Antwort. Bewertet wird gegen **deterministische Prüfungen**, die in der Aufgabe stehen.

**Hier liegt der wichtigste Kompromiss der ganzen Academy.** Ein Sprachmodell könnte einen Plan besser beurteilen als diese Regeln — aber es würde heute 55 und morgen 70 Punkte geben, und eine Urkunde wäre dann keine Aussage mehr, sondern eine Momentaufnahme.

Also: die Punkte kommen aus den Prüfungen. **Athena** schreibt darunter eine Anmerkung — sie hilft beim Lernen und rührt den Punktestand nicht an.

Arten: `enthaelt_alle`, `enthaelt_eines`, `enthaelt_nicht`, `mindestens_woerter`, `hoechstens_woerter`, `reihenfolge`, `muster`.

Die Prüfungen müssen zusammen die Gesamtpunktzahl ergeben — sonst wäre eine perfekte Antwort nicht die volle Punktzahl wert, und niemand wüsste warum.

## Felder

```yaml
id: X1-01
typ: planung
titel: "…"
punkte: 20
pruefungen:
  - art: enthaelt_alle
    werte: [rolle, ziel, einschränkung]
    punkte: 30
  - art: mindestens_woerter
    wert: 40
    punkte: 10
  - art: enthaelt_nicht
    werte: ["api_key", "passwort"]
    punkte: 20
    begruendung: "Ein Plan, der ein Geheimnis im Klartext nennt, ist kein Plan."
```

## Bewertung

Summe der erfüllten Prüfungen.

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
