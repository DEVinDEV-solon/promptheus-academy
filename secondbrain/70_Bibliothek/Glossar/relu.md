---
type: entity/begriff
title: "ReLU"
description: "Die einfachste gebräuchliche Aktivierung: Negatives wird null, Positives bleibt."
tags:
  - glossar
  - netze
verlinken:
  - ReLU
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# ReLU

> ReLU lässt jede positive Zahl unverändert durch und macht aus jeder negativen eine Null.

Das klingt fast zu schlicht, um zu funktionieren — und gerade darin liegt der Wert. Die Rechnung kostet so gut wie nichts, und beim Lernen verschwindet das Signal nicht so leicht wie bei älteren, weich gekrümmten Funktionen.

Mit ReLU wurden tiefe Netze um 2012 herum praktisch trainierbar. Heutige Sprachmodelle nutzen meist leicht abgerundete Verwandte davon, die an der Null keinen Knick haben.

## Verwandt

[[aktivierungsfunktion]] · [[deep-learning]] · [[gradient]]
