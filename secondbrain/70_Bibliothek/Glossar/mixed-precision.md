---
type: entity/begriff
title: "Mixed Precision"
description: "Mit ungenaueren Zahlen rechnen, wo es nicht schadet — für Tempo und Speicher."
tags:
  - glossar
  - training
verlinken:
  - Mixed Precision
  - Gemischte Genauigkeit
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Mixed Precision

> Mixed Precision rechnet die meisten Schritte mit kurzen, groben Zahlen und nur die heiklen mit langen, genauen.

Kurze Zahlen brauchen halb oder ein Viertel so viel Speicher und lassen sich auf heutigen Chips um ein Vielfaches flotter verarbeiten.

Die Kunst ist, die Stellen zu kennen, an denen Genauigkeit zählt. Dort wird weiter genau gerechnet, sonst schleichen sich Fehler ein, die das Training zum Entgleisen bringen.

## Verwandt

[[gleitkommagenauigkeit]] · [[quantisierung]] · [[gpu]]
