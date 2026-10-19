---
type: entity/begriff
title: "Optimierer"
description: "Das Verfahren, das aus dem Gradienten den tatsächlichen Lernschritt macht."
tags:
  - glossar
  - netze
verlinken:
  - Optimierer
  - Optimizer
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Optimierer

> Ein Optimierer entscheidet, wie aus „hier geht es bergab" ein konkreter Schritt für jedes Gewicht wird.

Der schlichteste Optimierer geht stur ein festes Stück entgegen dem Gradienten. Bessere merken sich, wohin es zuletzt ging, und behalten Schwung bei — wie eine Kugel, die einen Hang hinunterrollt und kleine Dellen überspringt.

Andere passen die Schrittgrösse für jedes Gewicht einzeln an. **Der Optimierer braucht oft selbst so viel Speicher wie das Modell**, weil er für jedes Gewicht eigene Zahlen mitführt.

## Verwandt

[[adam-optimierer]] · [[gradientenabstieg]] · [[lernrate]] · [[gradient]]
