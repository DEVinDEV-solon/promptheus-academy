---
type: entity/begriff
title: "Compute-optimales Training"
description: "Das richtige Verhältnis von Modellgrösse und Datenmenge für ein gegebenes Rechenbudget."
tags:
  - glossar
  - training
verlinken:
  - Compute-optimales Training
  - Compute-optimal
  - Chinchilla-optimal
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Compute-optimales Training

> Compute-optimales Training heisst: Ein Budget so auf Modellgrösse und Trainingsdaten verteilen, dass am Ende das beste Modell herauskommt.

Untersuchungen von 2022 zeigten, dass viele Modelle zu gross und zu kurz trainiert waren. Als Faustregel ergaben sich rund 20 Token Trainingstext pro Parameter.

Heute wird bewusst weit darüber hinaus trainiert. Ein kleineres, länger trainiertes Modell kostet mehr im Training, aber weniger bei jeder späteren Antwort — und es wird millionenfach benutzt.

## Verwandt

[[skalierungsgesetz]] · [[rechenbudget]] · [[parameterzahl]] · [[inferenzkosten]]
