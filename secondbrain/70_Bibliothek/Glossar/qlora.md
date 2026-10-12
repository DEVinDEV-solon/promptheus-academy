---
type: entity/begriff
title: "QLoRA"
description: "LoRA auf einem quantisierten Modell — Feinabstimmung grosser Modelle auf kleiner Hardware."
tags:
  - glossar
  - training
verlinken:
  - QLoRA
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# QLoRA

> QLoRA lädt das Grundmodell stark verkleinert in den Speicher und trainiert nur die kleinen LoRA-Zusätze in voller Genauigkeit.

Damit lassen sich Modelle anpassen, die normalerweise einen Rechenzentrumsrechner bräuchten, auf einer einzelnen Grafikkarte.

Die Qualität kommt dabei erstaunlich nah an eine vollständige Feinabstimmung heran. Für Schulen, kleine Firmen und Bastler hat das die Feinabstimmung erst bezahlbar gemacht.

## Verwandt

[[lora]] · [[quantisierung]] · [[feinabstimmung]]
