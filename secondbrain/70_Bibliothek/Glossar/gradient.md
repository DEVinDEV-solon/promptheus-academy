---
type: entity/begriff
title: "Gradient"
description: "Die Richtung, in der der Fehler am stärksten wächst — und damit der Hinweis, wohin man gehen muss."
tags:
  - glossar
  - netze
verlinken:
  - Fehlergradient
  - Gradientenvektor
  - Gradientenberechnung
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Gradient

> Der Gradient sagt für jedes Gewicht: Wenn du dich ein wenig in diese Richtung bewegst, wird der Fehler grösser — also geh in die andere.

Man kann ihn sich als Gefälle in einer Landschaft vorstellen, in der die Höhe der Fehler ist. An jeder Stelle zeigt der Gradient bergauf.

Ein Modell mit Milliarden Gewichten hat einen Gradienten mit Milliarden Einträgen — einen je Stellschraube. Ihn auszurechnen ist der teuerste Teil des Trainings und der Grund, warum dafür Grafikprozessoren gebraucht werden.

## Verwandt

[[gradientenabstieg]] · [[backpropagation]] · [[verlustfunktion]] · [[lernrate]]
