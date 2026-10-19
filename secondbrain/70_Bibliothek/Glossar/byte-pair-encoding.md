---
type: entity/begriff
title: "Byte-Pair-Encoding (BPE)"
description: "Das gängige Verfahren, mit dem aus Text ein Token-Vokabular gebaut wird."
tags:
  - glossar
  - modellbau
verlinken:
  - Byte-Pair-Encoding
  - BPE
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Byte-Pair-Encoding (BPE)

> Byte-Pair-Encoding beginnt mit einzelnen Zeichen und fasst immer das häufigste Paar zu einem neuen Baustein zusammen.

Aus „e" und „r" wird „er", aus „er" und „n" vielleicht „ern" — so lange, bis das Vokabular die gewünschte Grösse hat. Häufige Wörter werden so zu einem einzigen Token, seltene bleiben in Stücke zerlegt.

Weil kein Text ausserhalb dieses Verfahrens liegt, kann ein Modell jede Zeichenfolge verarbeiten, auch Tippfehler und erfundene Wörter. **Es sieht dabei aber keine Buchstaben**, sondern Bausteine — der Grund, warum Modelle beim Buchstabenzählen stolpern.

## Verwandt

[[tokenizer]] · [[vokabular]] · [[token]]
