---
type: entity/begriff
title: "Schrittlimit"
description: "Die Höchstzahl an Schritten, die ein Agent gehen darf."
tags:
  - glossar
  - agentenbau
verlinken:
  - Schrittlimit
  - Schrittlimits
  - Max Steps
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Schrittlimit

> Ein Schrittlimit beendet den Agenten nach einer festgelegten Zahl von Durchläufen — egal, wie weit er ist.

Es ist die einfachste Absicherung gegen Endlosschleifen. Gut gewählt, lässt es genug Raum für echte Arbeit und fängt das Kreisen ab.

Wird das Limit erreicht, sollte der Agent nicht stumm abbrechen, sondern berichten, wie weit er gekommen ist. Dann kann ein Mensch entscheiden, ob er mehr Schritte freigibt oder die Aufgabe anders stellt.

## Verwandt

[[kostenlimit]] · [[endlosschleife]] · [[abbruchbedingung]]
