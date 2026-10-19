---
type: entity/begriff
title: "Parameterzahl"
description: "Wie viele lernbare Zahlen ein Modell hat — die übliche Angabe seiner Grösse."
tags:
  - glossar
  - modellbau
verlinken:
  - Parameterzahl
  - Parameteranzahl
  - Modellgrösse
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Parameterzahl

> Die Parameterzahl ist das Mass, mit dem Modelle meist verglichen werden: 8 Milliarden, 70 Milliarden, eine Billion.

Sie bestimmt grob, wie viel Speicher das Modell braucht. Als Faustregel: Pro Milliarde Parameter etwa zwei Gigabyte bei voller Genauigkeit, deutlich weniger nach Quantisierung.

**Sie sagt aber wenig über die Qualität.** Bessere Daten, längeres Training und kluge Bauweise lassen kleinere Modelle oft an grössere heranreichen. Und bei Mixture-of-Experts-Modellen unterscheidet man zwischen allen und den pro Token aktiven Parametern.

## Verwandt

[[parameter]] · [[mixture-of-experts]] · [[quantisierung]] · [[skalierungsgesetz]]
