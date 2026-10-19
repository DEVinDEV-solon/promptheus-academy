---
type: entity/begriff
title: "Multi-Query-Attention"
description: "Die sparsamste Attention-Variante: alle Köpfe teilen sich ein einziges Paar aus Keys und Values."
tags:
  - glossar
  - modellbau
verlinken:
  - Multi-Query-Attention
  - MQA
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Multi-Query-Attention

> Multi-Query-Attention treibt das Teilen auf die Spitze: Jeder Kopf hat seine eigene Frage, aber alle schauen auf dieselben Keys und Values.

Das spart am meisten Speicher, kostet aber etwas Qualität, weil die Köpfe weniger unterschiedlich hinschauen können. Grouped-Query-Attention ist der Kompromiss dazwischen, der sich weitgehend durchgesetzt hat.

## Verwandt

[[grouped-query-attention]] · [[multi-head-attention]] · [[kv-cache]]
