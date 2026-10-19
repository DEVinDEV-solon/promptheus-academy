---
type: entity/begriff
title: "Router (im MoE)"
description: "Das kleine Netz, das in einem Mixture-of-Experts-Modell für jedes Token die Experten wählt."
tags:
  - glossar
  - modellbau
verlinken:
  - MoE-Router
  - Expertenrouter
  - Gating-Netz
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Router (im MoE)

> Der Router schaut sich jedes Token an und entscheidet, welche Experten es bearbeiten sollen.

Er lernt das im Training mit. Schwierig ist dabei die Balance: Schickt der Router alles an dieselben zwei Experten, liegen die anderen brach, und das Modell verschenkt seine Grösse. Deshalb wird im Training nachgeholfen, damit die Last sich verteilt.

Nicht zu verwechseln mit dem Modell-Routing, bei dem ganze Anfragen an verschiedene Modelle verteilt werden.

## Verwandt

[[mixture-of-experts]] · [[modell-routing]] · [[sparsitaet]]
