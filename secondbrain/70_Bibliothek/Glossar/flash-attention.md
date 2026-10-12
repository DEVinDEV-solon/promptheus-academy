---
type: entity/begriff
title: "Flash Attention"
description: "Eine Rechenweise für Attention, die unnötiges Hin- und Herschieben im Speicher vermeidet."
tags:
  - glossar
  - modellbau
verlinken:
  - Flash Attention
  - FlashAttention
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Flash Attention

> Flash Attention rechnet genau dasselbe wie gewöhnliche Attention, nur in einer Reihenfolge, die den langsamen Speicher kaum berührt.

Der eigentliche Engpass beim Rechnen ist oft nicht die Rechnung selbst, sondern das Laden der Zahlen. Flash Attention zerlegt die Aufgabe in Kacheln, die in den kleinen, schnellen Speicher direkt auf dem Chip passen.

**Das Ergebnis ist mathematisch identisch, nur um ein Vielfaches flotter.** Ein gutes Beispiel dafür, dass Fortschritt in der KI oft aus der Kenntnis der Hardware kommt.

## Verwandt

[[aufmerksamkeit]] · [[speicherwand]] · [[sram]] · [[speicherbandbreite]]
