---
type: entity/begriff
title: "Softmax"
description: "Die Rechnung, die aus rohen Punktzahlen Wahrscheinlichkeiten macht."
tags:
  - glossar
  - ki
  - technik
timestamp: 2026-08-22T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Softmax

> Softmax nimmt die Logits und verwandelt sie in Wahrscheinlichkeiten, die sich zu genau 100 % addieren.

Der Name führt in die Irre: das Wort klingt nach „weichem Maximum", und genau das ist gemeint — statt hart das höchste Token zu nehmen, bekommt jedes einen Anteil, der große aber viel mehr als der kleine.

Die [[temperatur]] greift in genau diese Rechnung ein: sie zieht die Verteilung auseinander oder staucht sie zusammen.

## Verwandt

[[logits]] · [[temperatur]] · [[sampling]]

## Beleg

Geerntet aus einem fremden Wissensspeicher, mit Prüfsumme: [[llm-grundlagen-logits-und-softmax]] in `90_Quellen/`.
