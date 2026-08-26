---
type: entity/begriff
title: "Logits"
description: "Die rohen Punktzahlen, die ein Modell jedem möglichen nächsten Token gibt."
tags:
  - glossar
  - ki
  - technik
timestamp: 2026-08-22T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Logits

> Bevor ein Modell sich entscheidet, vergibt es an jedes Token seines Vokabulars eine Punktzahl. Diese rohen, noch nicht umgerechneten Zahlen heißen Logits.

Sie sind noch keine Wahrscheinlichkeiten — sie können negativ sein und summieren sich zu nichts Bestimmtem. Erst [[softmax]] macht daraus eine Verteilung, aus der gezogen werden kann.

Wer die Logits verändern kann, verändert, was das Modell sagt, ohne es neu zu trainieren. Genau dort greifen Wasserzeichen an.

## Verwandt

[[softmax]] · [[temperatur]] · [[sampling]] · [[wasserzeichen]]

## Beleg

Geerntet aus einem fremden Wissensspeicher, mit Prüfsumme: [[watermarking-verfahren-uebersicht]] in `90_Quellen/`.
