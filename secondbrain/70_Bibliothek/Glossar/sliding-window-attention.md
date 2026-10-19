---
type: entity/begriff
title: "Sliding-Window-Attention"
description: "Attention, bei der jedes Token nur einen festen Abschnitt davor sieht."
tags:
  - glossar
  - modellbau
verlinken:
  - Sliding-Window-Attention
  - Gleitfenster-Attention
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Sliding-Window-Attention

> Bei Sliding-Window-Attention schaut jedes Token nur auf die letzten paar tausend Token, nicht auf den ganzen Text.

Der Aufwand wächst dann nicht mehr quadratisch, sondern nur linear mit der Länge. Über mehrere Schichten hinweg kann Information trotzdem weiter wandern, wie bei einer Stillen Post, die über viele Stationen läuft.

Oft wird die Variante mit vollständiger Attention gemischt: Manche Schichten sehen alles, andere nur ihr Fenster.

## Verwandt

[[aufmerksamkeit]] · [[lineare-attention]] · [[langer-kontext]]
