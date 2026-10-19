---
type: entity/begriff
title: "Datenparallelität"
description: "Jeder Chip hat eine Kopie des Modells und rechnet andere Beispiele."
tags:
  - glossar
  - training
verlinken:
  - Datenparallelität
  - Data Parallelism
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Datenparallelität

> Bei Datenparallelität bekommt jeder Chip das ganze Modell und einen eigenen Teil der Daten; danach werden die Ergebnisse zusammengeführt.

Das ist die verständlichste Form der Verteilung. Sie stösst an ihre Grenze, wenn das Modell nicht mehr auf einen einzelnen Chip passt.

Nach jedem Schritt müssen alle Kopien ihre Korrekturen austauschen, damit sie gleich bleiben. Je mehr Chips mitmachen, desto mehr Zeit fliesst in diesen Abgleich.

## Verwandt

[[verteiltes-training]] · [[modellparallelitaet]] · [[batch]]
