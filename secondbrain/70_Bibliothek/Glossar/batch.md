---
type: entity/begriff
title: "Batch (Stapel)"
description: "Die Portion Beispiele, nach der das Modell einmal seine Gewichte korrigiert."
tags:
  - glossar
  - netze
verlinken:
  - Minibatch
  - Minibatches
  - Trainingsbatch
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Batch (Stapel)

> Ein Batch ist ein Stapel von Beispielen, die das Modell gemeinsam durchrechnet, bevor es aus ihnen lernt.

Nach jedem einzelnen Beispiel zu korrigieren wäre zu sprunghaft; erst nach allen Daten zu korrigieren wäre zu langsam. Der Batch liegt dazwischen: genug Beispiele, damit die Richtung stimmt, wenig genug, damit es vorangeht.

Die Grösse richtet sich vor allem nach dem Speicher der Grafikprozessoren. Grosse Trainings arbeiten mit Batches aus Millionen Token. Beim Betrieb eines Modells meint das Wort etwas Verwandtes: mehrere Anfragen zusammen zu rechnen.

## Verwandt

[[epoche]] · [[gradientenabstieg]] · [[batching]] · [[gpu]]
