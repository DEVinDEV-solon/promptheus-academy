---
type: entity/begriff
title: "Quantisierung"
description: "Ein Modell mit gröberen Zahlen kleiner machen — damit es auf normale Geräte passt."
tags:
  - glossar
  - hardware
timestamp: 2026-08-22T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Quantisierung

> Bei der Quantisierung werden die [[modellgewichte|Gewichte]] mit weniger Nachkommastellen gespeichert. Das Modell schrumpft, ohne dass viel verloren geht.

Statt 16 Bit je Zahl nimmt man 8 oder 4. Aus 140 Gigabyte werden 35 — und plötzlich läuft ein grosses Modell auf einem guten Spielerechner statt nur im [[rechenzentrum]].

Kostenlos ist es nicht: Das Modell wird etwas ungenauer, und bei sehr starker Quantisierung merkt man es an schlechteren Antworten. Für die meisten Aufgaben ist der Unterschied kleiner als der Gewinn an Erreichbarkeit.

Das ist einer der Gründe, warum es KI heute auch ohne Rechenzentrum gibt.

## Verwandt

[[modellgewichte]] · [[arbeitsspeicher]] · [[edge-ki]] · [[open-weights]]
