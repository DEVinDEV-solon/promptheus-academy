---
type: reference
title: "Übereinstimmung"
description: "Zuordnung, Matching."
tags:
  - reference
  - aufgabentyp
  - uebereinstimmung
timestamp: 2026-08-18T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Übereinstimmung

`typ: uebereinstimmung`

Links steht ein Begriff, rechts wird ausgewählt, was dazugehört.

**Wofür er taugt:** Begriff ↔ Definition, Werkzeug ↔ Zweck, Fehler ↔ Ursache.

**Es muss zu jeder linken Seite genau ein Paar geben.** Der Parser bricht sonst ab: eine Zuordnung mit einer unbesetzten Zeile ist keine Zuordnung, sondern eine Fangfrage.

## Felder

```yaml
id: X1-01
typ: uebereinstimmung
titel: "…"
punkte: 20
links:  [prompt, token, agent]
rechts: ["Anweisung an ein Modell", "Textbaustein", "handelndes Programm"]
loesung:
  prompt: "Anweisung an ein Modell"
  token: "Textbaustein"
  agent: "handelndes Programm"
```

## Bewertung

Paarabbildung vollständig und richtig.

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
