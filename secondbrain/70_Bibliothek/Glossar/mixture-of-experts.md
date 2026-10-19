---
type: entity/begriff
title: "Mixture of Experts (MoE)"
description: "Ein Modell aus vielen Spezialisten, von denen je Token nur wenige aktiv sind."
tags:
  - glossar
  - modellbau
verlinken:
  - Mixture of Experts
  - Mixture-of-Experts
  - MoE
  - Expertenmischung
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Mixture of Experts (MoE)

> Ein Mixture-of-Experts-Modell hat viele Feed-Forward-Blöcke nebeneinander, aber jedes Token wird nur durch zwei oder drei davon geschickt.

Dadurch kann ein Modell sehr viele Parameter haben, aber pro Token nur einen kleinen Teil davon rechnen. Es weiss viel und antwortet trotzdem zügig.

**Der Haken liegt im Speicher:** Alle Experten müssen bereitliegen, auch die gerade untätigen. Deshalb braucht so ein Modell viel Arbeitsspeicher, obwohl es pro Antwort wenig rechnet. Viele der stärksten Modelle sind heute so gebaut.

## Verwandt

[[router]] · [[feed-forward-schicht]] · [[dichtes-modell]] · [[sparsitaet]] · [[parameterzahl]]
