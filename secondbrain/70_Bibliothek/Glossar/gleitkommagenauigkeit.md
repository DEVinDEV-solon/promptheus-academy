---
type: entity/begriff
title: "Gleitkommagenauigkeit (FP32, FP16, FP8)"
description: "Mit wie vielen Bits eine Zahl gespeichert wird — und damit, wie genau sie ist."
tags:
  - glossar
  - betrieb
verlinken:
  - Gleitkommagenauigkeit
  - Gleitkommazahl
  - Gleitkommazahlen
  - FP32
  - FP16
  - FP8
  - BF16
  - FP4
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Gleitkommagenauigkeit (FP32, FP16, FP8)

> Die Gleitkommagenauigkeit legt fest, wie fein eine Zahl aufgelöst wird: FP32 nutzt 32 Bit, FP16 die Hälfte, FP8 ein Viertel.

Weniger Bits heisst weniger Speicher und flottere Rechnung, aber gröbere Zahlen. Modelle vertragen erstaunlich viel Grobheit, weshalb das Training heute meist mit 16 Bit und der Betrieb oft mit 8 oder weniger läuft.

Neue Chips werben gerade mit Leistung bei sehr kleinen Formaten — ein Zeichen dafür, wohin die Reise geht.

## Verwandt

[[quantisierung]] · [[mixed-precision]] · [[flops]]
