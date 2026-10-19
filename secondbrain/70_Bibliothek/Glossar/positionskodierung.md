---
type: entity/begriff
title: "Positionskodierung"
description: "Die Zusatzinformation, aus der ein Transformer die Reihenfolge der Token kennt."
tags:
  - glossar
  - modellbau
verlinken:
  - Positionskodierung
  - Positionskodierungen
  - Positional Encoding
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Positionskodierung

> Ein Transformer sieht alle Token gleichzeitig — ohne Positionskodierung wüsste er nicht, welches zuerst kam.

„Hund beisst Mann" und „Mann beisst Hund" bestehen aus denselben Wörtern. Damit das Modell den Unterschied bemerkt, bekommt jedes Token eine Markierung seiner Stelle.

Frühe Verfahren addierten dafür feste Wellenmuster. Heute wird die Position meist als Drehung eingerechnet, was längere Texte besser verkraftet. **Wie gut ein Modell über seine Trainingslänge hinaus funktioniert, hängt stark an diesem Detail.**

## Verwandt

[[rope]] · [[transformer]] · [[langer-kontext]]
