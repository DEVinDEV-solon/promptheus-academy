---
type: entity/begriff
title: "Normalisierung (Layer Norm)"
description: "Hält die Zahlen im Netz in einem gesunden Bereich, damit das Training stabil bleibt."
tags:
  - glossar
  - netze
verlinken:
  - Layer Norm
  - Layer Normalization
  - Schichtnormalisierung
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Normalisierung (Layer Norm)

> Normalisierung bringt die Werte in jeder Schicht auf eine einheitliche Grösse, bevor sie weitergereicht werden.

Ohne sie können Zahlen von Schicht zu Schicht immer grösser oder immer kleiner werden, bis das Training entgleist. Mit ihr bleibt jede Schicht in einem vorhersagbaren Bereich.

In Transformern steht vor fast jedem Rechenblock eine solche Normalisierung. Sie ist unscheinbar, aber ohne sie liessen sich sehr tiefe Modelle kaum trainieren.

## Verwandt

[[residualverbindung]] · [[schicht]] · [[transformer]]
