---
type: entity/begriff
title: "Decoder-only-Modell"
description: "Die Bauweise heutiger Chat-Modelle: ein einziger Stapel, der nur fortsetzt."
tags:
  - glossar
  - modellbau
verlinken:
  - Decoder-only-Modell
  - Decoder-only-Modelle
  - Decoder-only
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Decoder-only-Modell

> Ein Decoder-only-Modell kennt keinen getrennten Lese- und Schreibteil. Es liest und schreibt in einem Zug, immer nur nach vorn.

Die Frage, die du stellst, und die Antwort, die kommt, sind für das Modell ein einziger fortlaufender Text. Es setzt ihn fort, bis ein Schlusszeichen kommt.

Dass diese schlichte Bauweise sich durchgesetzt hat, liegt an ihrer Skalierbarkeit: Sie lässt sich auf beliebig viel Text trainieren, und eine einzige Aufgabe — das nächste Token vorhersagen — reicht.

## Verwandt

[[decoder]] · [[autoregressives-modell]] · [[naechstes-token-vorhersage]] · [[transformer]]
