---
type: reference
title: "Räumliche Aufgabe"
description: "Diagramme lesen."
tags:
  - reference
  - aufgabentyp
  - raeumlich
timestamp: 2026-08-18T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Räumliche Aufgabe

`typ: raeumlich`

Ein Diagramm als Text (ASCII), dazu eine Frage mit Optionen.

**Wofür er taugt:** Architektur lesen, Datenfluss verfolgen, Abhängigkeiten erkennen.

**Warum ASCII und kein Bild:** ein Diagramm als Text ist versionierbar, durchsuchbar, vorlesbar und funktioniert ohne Anhang. Ein PNG ist keins davon.

## Felder

```yaml
id: X1-01
typ: raeumlich
titel: "…"
punkte: 20
diagramm: |
  Nutzer → [Agent] → [Werkzeug] → API
               ↓
           [Protokoll]
optionen: ["Agent", "Werkzeug", "Protokoll"]
loesung: "Protokoll"
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
