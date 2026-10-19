---
type: entity/begriff
title: "Lineare Attention"
description: "Attention-Varianten, deren Aufwand nur linear statt quadratisch mit der Textlänge wächst."
tags:
  - glossar
  - modellbau
verlinken:
  - Lineare Attention
  - Linear Attention
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Lineare Attention

> Lineare Attention ersetzt den Vergleich aller Token mit allen durch eine Rechnung, die sich mit jedem neuen Token nur fortschreibt.

Damit werden sehr lange Texte bezahlbar. Bisher kostete das aber Genauigkeit, besonders beim exakten Wiederfinden einzelner Stellen.

Viele neuere Modelle kombinieren deshalb beides: die meisten Schichten mit linearer, einige wenige mit voller Attention. Die Grenze zwischen dieser Familie und den State-Space-Modellen ist inzwischen fliessend.

## Verwandt

[[aufmerksamkeit]] · [[state-space-modell]] · [[hybridarchitektur]]
