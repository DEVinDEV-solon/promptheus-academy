---
type: entity/begriff
title: "Kausale Maske"
description: "Verbietet einem Sprachmodell beim Training den Blick auf die Token, die erst später kommen."
tags:
  - glossar
  - modellbau
verlinken:
  - Kausale Maske
  - Causal Mask
  - Kausalmaske
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Kausale Maske

> Die kausale Maske deckt beim Training alles ab, was rechts vom aktuellen Token steht.

Ohne sie könnte das Modell beim Lernen schummeln: Es soll das nächste Wort vorhersagen, sieht es aber schon. Mit der Maske muss es wirklich raten.

Die Maske ist es auch, die ein Modell zum Schreiber macht. Es lernt, Text nur aus dem Vorherigen fortzusetzen — genau das, was es später beim Antworten tun muss.

## Verwandt

[[decoder]] · [[selbstaufmerksamkeit]] · [[naechstes-token-vorhersage]]
