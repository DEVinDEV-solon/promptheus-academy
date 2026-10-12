---
type: entity/begriff
title: "Grouped-Query-Attention"
description: "Attention, bei der sich mehrere Köpfe Keys und Values teilen — spart viel Speicher beim Antworten."
tags:
  - glossar
  - modellbau
verlinken:
  - Grouped-Query-Attention
  - GQA
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Grouped-Query-Attention

> Bei Grouped-Query-Attention behalten alle Köpfe ihre eigene Frage, aber Gruppen von Köpfen teilen sich dieselben Keys und Values.

Dadurch schrumpft der KV-Cache auf einen Bruchteil, ohne dass die Antwortqualität spürbar leidet. Für lange Texte und viele gleichzeitige Nutzer ist das der Unterschied zwischen machbar und zu teuer.

Die meisten aktuellen Modelle nutzen diese Variante oder eine noch sparsamere.

## Verwandt

[[multi-head-attention]] · [[multi-query-attention]] · [[kv-cache]]
