---
type: entity/begriff
title: "RoPE (Rotations-Positionskodierung)"
description: "Positionen als Drehung: Die Reihenfolge der Token steckt im Winkel ihrer Vektoren."
tags:
  - glossar
  - modellbau
verlinken:
  - RoPE
  - Rotary Position Embedding
  - Rotations-Positionskodierung
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# RoPE (Rotations-Positionskodierung)

> RoPE dreht die Query- und Key-Vektoren jedes Tokens um einen Winkel, der von seiner Position abhängt.

Der Vorteil: Beim Vergleich zweier Token zählt dann vor allem ihr Abstand zueinander, nicht ihre absolute Stelle im Text. Das passt gut zu Sprache, in der Nähe meist wichtiger ist als die Seitenzahl.

Fast alle offenen Sprachmodelle nutzen heute dieses Verfahren. Mit ein paar Kniffen lässt sich damit auch das Kontextfenster eines fertigen Modells nachträglich verlängern.

## Verwandt

[[positionskodierung]] · [[query-key-value]] · [[langer-kontext]]
