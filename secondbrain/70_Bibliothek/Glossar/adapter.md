---
type: entity/begriff
title: "Adapter"
description: "Ein kleines Zusatzmodul, das ein fertiges Modell für eine neue Aufgabe anpasst."
tags:
  - glossar
  - training
verlinken:
  - Adapter-Modul
  - Adapter-Module
  - Adapterschicht
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Adapter

> Ein Adapter wird in ein bestehendes Modell eingehängt und trainiert, während das eigentliche Modell unverändert bleibt.

So kann ein Grundmodell viele Aufgaben bedienen: Für jede gibt es einen eigenen kleinen Adapter, der bei Bedarf geladen wird. LoRA ist die verbreitetste Form.

Der Gewinn liegt in der Ordnung: Ein Grundmodell, viele austauschbare Zusätze, und jeder davon lässt sich einzeln prüfen, verbessern oder wieder entfernen, ohne die anderen zu stören.

## Verwandt

[[lora]] · [[peft]] · [[feinabstimmung]]
