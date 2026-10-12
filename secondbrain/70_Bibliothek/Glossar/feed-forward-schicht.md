---
type: entity/begriff
title: "Feed-Forward-Schicht"
description: "Der Rechenblock nach der Attention, in dem jedes Token einzeln weiterverarbeitet wird."
tags:
  - glossar
  - modellbau
verlinken:
  - Feed-Forward-Schicht
  - Feed-Forward-Schichten
  - Feed-Forward-Block
  - MLP-Block
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Feed-Forward-Schicht

> Nach der Attention, die Bezüge zwischen Token herstellt, kommt in jedem Block eine Feed-Forward-Schicht, die jedes Token für sich umformt.

Hier steckt der grösste Teil der Parameter eines Sprachmodells. Forschende vermuten, dass in diesen Schichten viel von dem gespeicherten Faktenwissen liegt — etwa, dass Paris die Hauptstadt Frankreichs ist.

Bei Mixture-of-Experts-Modellen wird genau diese Schicht in viele kleine Experten aufgeteilt, von denen je Token nur wenige rechnen.

## Verwandt

[[transformer]] · [[aufmerksamkeit]] · [[mixture-of-experts]] · [[parameter]]
