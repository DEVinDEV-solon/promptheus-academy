---
type: entity/begriff
title: "Katastrophales Vergessen"
description: "Ein Modell lernt etwas Neues und verliert dabei, was es vorher konnte."
tags:
  - glossar
  - training
verlinken:
  - Katastrophales Vergessen
  - Catastrophic Forgetting
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Katastrophales Vergessen

> Katastrophales Vergessen tritt auf, wenn neues Training die Gewichte so verschiebt, dass altes Können überschrieben wird.

Ein Modell, das nur noch mit medizinischen Texten nachtrainiert wird, kann danach schlechter rechnen oder höflich antworten. Das Wissen steckt in denselben Zahlen, und die werden für die neue Aufgabe umgebaut.

Dagegen hilft, alte Beispiele beizumischen, sparsame Verfahren wie LoRA zu verwenden oder nur wenig zu trainieren.

## Verwandt

[[kontinuierliches-lernen]] · [[feinabstimmung]] · [[lora]]
