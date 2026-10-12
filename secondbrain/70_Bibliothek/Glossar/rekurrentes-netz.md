---
type: entity/begriff
title: "Rekurrentes Netz (RNN)"
description: "Ein Netz, das eine Folge Schritt für Schritt liest und dabei einen inneren Zustand weiterträgt."
tags:
  - glossar
  - netze
verlinken:
  - Rekurrentes Netz
  - Rekurrente Netze
  - Rekurrenten Netz
  - Recurrent Neural Network
  - RNN
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Rekurrentes Netz (RNN)

> Ein rekurrentes Netz liest Wort für Wort und gibt sich selbst nach jedem Wort eine Notiz für das nächste.

Vor dem Transformer war das die übliche Bauweise für Sprache. Ihr Nachteil: Die Notiz wird mit jedem Schritt überschrieben, frühe Wörter verblassen. Und weil jedes Wort auf das vorige warten muss, lässt sich die Rechnung schlecht parallelisieren.

Der Transformer löste beides, indem er alle Wörter gleichzeitig betrachtet. Neuere Ansätze greifen die Idee des fortgetragenen Zustands wieder auf, weil sie bei sehr langen Texten Speicher spart.

## Verwandt

[[lstm]] · [[transformer]] · [[state-space-modell]]
