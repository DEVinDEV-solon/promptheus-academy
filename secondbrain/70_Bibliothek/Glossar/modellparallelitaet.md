---
type: entity/begriff
title: "Modellparallelität"
description: "Das Modell selbst wird aufgeteilt — jeder Chip hält nur einen Teil davon."
tags:
  - glossar
  - training
verlinken:
  - Modellparallelität
  - Model Parallelism
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Modellparallelität

> Modellparallelität ist nötig, wenn ein Modell zu gross für einen Chip ist: Dann bekommt jeder Chip ein Stück.

Man kann nach Schichten teilen oder einzelne Rechnungen quer zerschneiden. Beides erfordert viel Austausch zwischen den Chips.

Grosse Trainings kombinieren mehrere Arten der Parallelität gleichzeitig.

Welche Aufteilung am besten passt, hängt davon ab, wie eng die Chips miteinander verbunden sind. Innerhalb eines Servers lässt sich feiner teilen als zwischen Servern.

## Verwandt

[[tensorparallelitaet]] · [[pipeline-parallelitaet]] · [[datenparallelitaet]]
