---
type: entity/begriff
title: "Hybride Speicherchips"
description: "Speicher, der selbst mitrechnet — damit die Zahlen nicht ständig hin- und hergeschoben werden."
tags:
  - glossar
  - hardware
aliase:
  - HBM
  - High Bandwidth Memory
timestamp: 2026-08-22T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Hybride Speicherchips

> Chips, die Speichern und Rechnen zusammenlegen, statt beides auf getrennte Bausteine zu verteilen.

**Das Problem, das sie lösen.** In einem gewöhnlichen Rechner liegen Speicher und Rechenwerk nebeneinander, und jede Zahl muss über eine Leitung dazwischen. Bei einem Sprachmodell werden Milliarden Zahlen für **jedes einzelne Wort** geholt. Die Leitung ist dann der Flaschenhals, nicht das Rechnen — und der grösste Teil des Stroms geht fürs Transportieren drauf, nicht fürs Rechnen.

Zwei Wege dagegen: **HBM** (*High Bandwidth Memory*) stapelt den Speicher senkrecht direkt neben den Rechenkern, sodass die Wege kurz sind. **Rechnen im Speicher** geht weiter und lässt die Speicherzellen die Multiplikation selbst erledigen.

Wer wissen will, warum KI so viel Strom braucht, findet die Antwort seltener im Rechnen als im Bewegen von Zahlen.

## Verwandt

[[arbeitsspeicher]] · [[gpu]] · [[rechenzentrum]]
