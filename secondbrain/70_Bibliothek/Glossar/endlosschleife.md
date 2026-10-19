---
type: entity/begriff
title: "Endlosschleife (Agent)"
description: "Wenn ein Programm oder Agent sich im Kreis dreht, ohne voranzukommen."
tags:
  - glossar
  - agentenbau
verlinken:
  - Endlosschleife
  - Endlosschleifen
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Endlosschleife (Agent)

> Eine Endlosschleife entsteht, wenn ein Agent dieselbe Aktion immer wieder versucht oder zwischen zwei Zuständen hin und her springt.

Typisch: Ein Werkzeug liefert einen Fehler, der Agent versucht es genauso noch einmal, bekommt denselben Fehler und so fort. Jeder Durchgang kostet Token.

Schrittlimits, Kostenlimits und das Erkennen von Wiederholungen verhindern, dass das teuer wird.

## Verwandt

[[schrittlimit]] · [[kostenlimit]] · [[abbruchbedingung]]
