---
type: entity/begriff
title: "Sparsität"
description: "Wenn ein grosser Teil der Zahlen null ist oder nicht gerechnet wird — und man das ausnutzt."
tags:
  - glossar
  - modellbau
verlinken:
  - Sparsität
  - Sparsity
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Sparsität

> Sparsität heisst: Von vielen möglichen Rechnungen werden nur wenige wirklich ausgeführt.

Bei Mixture-of-Experts-Modellen ist das gewollt: Pro Token arbeitet nur ein Bruchteil des Netzes. Auch Gewichte, die fast null sind, kann man weglassen.

Der Gewinn ist Rechenzeit und Energie. **Der Haken:** Hardware ist auf dichte Rechnungen getrimmt. Damit Sparsität wirklich spart, muss sie in Mustern auftreten, die der Chip ausnutzen kann.

## Verwandt

[[mixture-of-experts]] · [[pruning]] · [[dichtes-modell]]
