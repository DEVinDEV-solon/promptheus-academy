---
type: entity/begriff
title: "Kaltstart"
description: "Die Verzögerung, wenn ein Dienst erst geladen werden muss, bevor er antworten kann."
tags:
  - glossar
  - betrieb
verlinken:
  - Kaltstart
  - Kaltstarts
  - Cold Start
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Kaltstart

> Ein Kaltstart passiert, wenn das Modell nicht bereitliegt und erst in den Speicher geladen werden muss.

Bei grossen Modellen dauert das Sekunden bis Minuten. Anbieter halten beliebte Modelle deshalb ständig warm. Selten genutzte oder selbst betriebene Modelle kennen das Problem.

Auf dem eigenen Rechner zeigt sich das beim ersten Prompt nach dem Start: Er dauert spürbar länger als alle folgenden, weil die Gewichte erst von der Festplatte in den Speicher wandern.

## Verwandt

[[serverless]] · [[latenz]]
