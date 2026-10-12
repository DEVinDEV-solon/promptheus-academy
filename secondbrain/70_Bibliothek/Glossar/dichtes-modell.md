---
type: entity/begriff
title: "Dichtes Modell (Dense Model)"
description: "Ein Modell, bei dem jedes Gewicht bei jedem Token mitrechnet."
tags:
  - glossar
  - modellbau
verlinken:
  - Dichtes Modell
  - Dichte Modelle
  - Dense Model
  - Dense-Modell
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Dichtes Modell (Dense Model)

> Ein dichtes Modell setzt für jedes Token seine ganze Grösse ein — das Gegenstück zum Mixture-of-Experts-Modell.

Es ist leichter zu trainieren und zu betreiben, weil es keine Verteilungslogik braucht. Dafür kostet jede Antwort so viel Rechenarbeit, wie das Modell gross ist.

Viele kleine und mittlere Modelle, die man lokal betreibt, sind dicht gebaut, weil sie so mit wenig Speicher auskommen.

## Verwandt

[[mixture-of-experts]] · [[parameterzahl]] · [[sparsitaet]]
