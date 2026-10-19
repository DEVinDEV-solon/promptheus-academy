---
type: entity/begriff
title: "PPO"
description: "Das klassische Verfahren des bestärkenden Lernens, mit dem RLHF lange umgesetzt wurde."
tags:
  - glossar
  - training
verlinken:
  - PPO
  - Proximal Policy Optimization
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# PPO

> PPO verbessert ein Modell in kleinen, vorsichtigen Schritten, damit es sich durch eine einzelne Belohnung nicht zu weit verändert.

Die Vorsicht ist der Kern: Ohne sie springt das Modell zu jeder gut bewerteten Antwort und verliert dabei, was es vorher konnte.

PPO ist aufwendig, weil neben dem Sprachmodell weitere Modelle mitlaufen. Neuere Verfahren sparen einige davon ein.

## Verwandt

[[bestaerkendes-lernen]] · [[rlhf]] · [[grpo]]
