---
type: entity/begriff
title: "Continuous Batching"
description: "Anfragen laufend in einen Batch nachfüllen, sobald andere fertig sind."
tags:
  - glossar
  - betrieb
verlinken:
  - Continuous Batching
  - Kontinuierliches Batching
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Continuous Batching

> Continuous Batching wartet nicht, bis alle Antworten eines Bündels fertig sind, sondern ersetzt jede beendete sofort durch eine neue.

Antworten sind verschieden lang. Beim starren Bündeln müssten kurze auf lange warten. Mit laufendem Nachfüllen bleiben die Chips immer ausgelastet.

Fast alle modernen Inferenzserver arbeiten so.

## Verwandt

[[batching]] · [[inferenzserver]] · [[durchsatz]]
