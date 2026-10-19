---
type: entity/begriff
title: "Tensorparallelität"
description: "Eine einzelne Rechnung auf mehrere Chips aufteilen."
tags:
  - glossar
  - betrieb
verlinken:
  - Tensorparallelität
  - Tensor Parallelism
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Tensorparallelität

> Bei der Tensorparallelität wird jede grosse Matrix zerschnitten, jeder Chip rechnet seinen Teil, danach werden die Ergebnisse zusammengefügt.

Das ermöglicht Modelle, die auf keinen einzelnen Chip passen. Es verlangt aber extrem schnelle Verbindungen zwischen den Chips, weil nach jeder Schicht ausgetauscht wird.

Deshalb wird es meist nur innerhalb eines Servers eingesetzt.

## Verwandt

[[pipeline-parallelitaet]] · [[modellparallelitaet]] · [[chipverbindung]]
