---
type: entity/begriff
title: "Paged Attention"
description: "Den KV-Cache in kleinen Seiten verwalten statt in einem grossen Block."
tags:
  - glossar
  - betrieb
verlinken:
  - Paged Attention
  - PagedAttention
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Paged Attention

> Paged Attention teilt den Speicher für den KV-Cache in kleine Seiten auf, die nach Bedarf vergeben werden — wie der Arbeitsspeicher eines Betriebssystems.

Vorher musste für jede Anfrage vorsorglich Platz für die längstmögliche Antwort reserviert werden. Das meiste blieb leer. Mit Seiten wird nur belegt, was gebraucht wird.

Dadurch passen mehr Anfragen gleichzeitig auf denselben Chip.

## Verwandt

[[kv-cache]] · [[inferenzserver]] · [[continuous-batching]]
