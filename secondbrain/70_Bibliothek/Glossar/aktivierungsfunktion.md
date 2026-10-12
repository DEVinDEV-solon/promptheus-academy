---
type: entity/begriff
title: "Aktivierungsfunktion"
description: "Die Rechnung, die entscheidet, wie stark ein Neuron sein Signal weitergibt."
tags:
  - glossar
  - netze
verlinken:
  - Aktivierungsfunktion
  - Aktivierungsfunktionen
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Aktivierungsfunktion

> Eine Aktivierungsfunktion biegt die Summe eines Neurons um — erst dadurch kann ein Netz mehr als gerade Linien lernen.

Ohne sie wäre jedes Netz, egal wie tief, nur eine einzige grosse Multiplikation. Hundert Schichten hintereinander könnten nicht mehr als eine einzige. **Die Biegung ist es, die Tiefe überhaupt sinnvoll macht.**

Bekannte Formen sind ReLU, die alles Negative auf null setzt, und weichere Kurven, die in heutigen Sprachmodellen üblich sind. Welche man nimmt, entscheidet über Tempo und Stabilität des Trainings, selten über die Qualität am Ende.

## Verwandt

[[relu]] · [[kuenstliches-neuron]] · [[softmax]] · [[neuronales-netz]]
