---
type: entity/begriff
title: "Gradient Checkpointing"
description: "Speicher sparen, indem man Zwischenergebnisse nicht aufhebt, sondern bei Bedarf neu rechnet."
tags:
  - glossar
  - training
verlinken:
  - Gradient Checkpointing
  - Activation Checkpointing
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Gradient Checkpointing

> Gradient Checkpointing wirft beim Training die meisten Zwischenwerte weg und rechnet sie beim Rückwärtsgang neu aus.

Damit passt ein grösseres Modell oder ein grösserer Batch in denselben Speicher. Der Preis ist etwa ein Drittel mehr Rechenzeit.

Ein typischer Tausch in der KI: Rechenzeit gegen Speicher, denn Speicher ist oft der knappere Rohstoff.

## Verwandt

[[backpropagation]] · [[speichergrenze]] · [[arbeitsspeicher]]
