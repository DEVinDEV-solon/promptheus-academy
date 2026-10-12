---
type: entity/begriff
title: "LoRA"
description: "Feinabstimmung mit wenigen zusätzlichen Gewichten statt mit dem ganzen Modell."
tags:
  - glossar
  - training
verlinken:
  - LoRA
  - Low-Rank Adaptation
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# LoRA

> LoRA lässt das grosse Modell unverändert und trainiert nur kleine Zusatzmatrizen, die seine Ausgabe gezielt verbiegen.

Statt Milliarden Gewichte anzufassen, lernt man wenige Millionen. Das passt auf eine gewöhnliche Grafikkarte und das Ergebnis ist eine kleine Datei von wenigen Megabyte.

Bei Bildgeneratoren sind LoRAs der übliche Weg, einem Modell einen Stil, eine Figur oder ein Produkt beizubringen. Mehrere davon lassen sich austauschen, ohne das Grundmodell neu zu laden.

## Verwandt

[[feinabstimmung]] · [[qlora]] · [[adapter]] · [[peft]]
