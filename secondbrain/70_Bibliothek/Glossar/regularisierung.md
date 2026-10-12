---
type: entity/begriff
title: "Regularisierung"
description: "Sammelbegriff für Massnahmen, die ein Modell vom Auswendiglernen abhalten."
tags:
  - glossar
  - netze
verlinken:
  - Regularisierung
  - Regularization
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Regularisierung

> Regularisierung macht es dem Modell absichtlich ein wenig schwerer, damit es das Allgemeine lernt statt das Zufällige.

Die bekanntesten Mittel: grosse Gewichte bestrafen, damit sich das Modell nicht auf einzelne Ausreisser stützt. Neuronen zufällig abschalten, damit kein einzelnes unentbehrlich wird. Die Daten leicht verändern, damit das Modell nicht jedes Pixel kennt.

**Regularisierung kostet ein wenig Genauigkeit im Training und gewinnt dafür Zuverlässigkeit bei Neuem.** Das ist fast immer ein guter Tausch.

## Verwandt

[[ueberanpassung]] · [[dropout]] · [[generalisierung]] · [[adam-optimierer]]
