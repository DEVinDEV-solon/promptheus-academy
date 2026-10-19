---
type: entity/begriff
title: "Top-p (Nucleus Sampling)"
description: "Nur die wahrscheinlichsten Token zur Wahl stellen, bis zusammen ein bestimmter Anteil erreicht ist."
tags:
  - glossar
  - denken
verlinken:
  - Top-p
  - Top-P
  - Nucleus Sampling
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Top-p (Nucleus Sampling)

> Top-p schneidet die unwahrscheinlichen Token ab: Gezogen wird nur aus der kleinsten Gruppe, die zusammen etwa 90 Prozent der Wahrscheinlichkeit ausmacht.

Ist das Modell sicher, bleiben wenige Kandidaten übrig. Ist es unsicher, sind es viele. Das Verfahren passt sich also der Lage an.

Meist stellt man entweder Top-p oder die Temperatur ein, nicht beides stark.

## Verwandt

[[top-k]] · [[temperatur]] · [[sampling]]
