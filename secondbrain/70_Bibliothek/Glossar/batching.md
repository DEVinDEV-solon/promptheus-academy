---
type: entity/begriff
title: "Batching"
description: "Mehrere Anfragen bündeln, damit die Chips sie gemeinsam abarbeiten."
tags:
  - glossar
  - betrieb
verlinken:
  - Batching
  - Request Batching
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Batching

> Beim Batching werden mehrere Anfragen gleichzeitig durch das Modell geschickt, statt eine nach der anderen.

Weil beim Erzeugen vor allem das Laden der Gewichte Zeit kostet, lohnt es sich, sie einmal zu laden und für viele Anfragen zu nutzen. Der Durchsatz steigt dadurch um ein Vielfaches.

Im Training heisst die gebündelte Portion Beispiele ebenfalls Batch.

## Verwandt

[[continuous-batching]] · [[durchsatz]] · [[batch]] · [[batch-api]]
