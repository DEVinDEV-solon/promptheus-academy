---
type: entity/begriff
title: "Transformer"
description: "Die Bauweise fast aller heutigen Sprachmodelle — jedes Token schaut auf alle anderen."
tags:
  - glossar
  - modellbau
verlinken:
  - Transformer
  - Transformer-Architektur
  - Transformers
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Transformer

> Ein Transformer verarbeitet alle Token eines Textes gleichzeitig und lässt jedes darauf achten, welche anderen für es wichtig sind.

Vorgestellt wurde die Bauweise 2017, ursprünglich für maschinelle Übersetzung. Ihr Vorteil gegenüber den älteren Netzen: Sie liest nicht Wort für Wort, sondern alles auf einmal, und lässt sich deshalb auf tausenden Chips parallel trainieren.

Ein Transformer besteht aus vielen gleich gebauten Blöcken übereinander. In jedem steckt ein Attention-Teil, der Bezüge zwischen den Token herstellt, und ein Rechenblock, der jedes Token für sich weiterverarbeitet. **Das „T" in vielen Modellnamen steht für genau diese Bauweise.**

## Verwandt

[[aufmerksamkeit]] · [[selbstaufmerksamkeit]] · [[feed-forward-schicht]] · [[decoder-only-modell]] · [[llm]]
