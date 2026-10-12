---
type: entity/begriff
title: "Dropout"
description: "Beim Training zufällig Neuronen abschalten, damit das Netz sich nicht auf einzelne verlässt."
tags:
  - glossar
  - netze
verlinken:
  - Dropout
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Dropout

> Dropout schaltet bei jedem Lernschritt einen zufälligen Teil der Neuronen stumm — immer einen anderen.

Das Netz kann sich dadurch nicht darauf verlassen, dass ein bestimmtes Neuron die Arbeit macht. Jedes Wissen muss mehrfach und verteilt angelegt werden. Das macht das Ergebnis robuster.

Beim Benutzen des fertigen Modells wird Dropout abgeschaltet; dann arbeiten alle Neuronen zusammen. Grosse Sprachmodelle, die ihre Daten nur einmal sehen, brauchen ihn oft gar nicht mehr.

## Verwandt

[[regularisierung]] · [[ueberanpassung]] · [[kuenstliches-neuron]]
