---
type: entity/begriff
title: "Überanpassung (Overfitting)"
description: "Das Modell hat die Beispiele auswendig gelernt statt das Muster dahinter."
tags:
  - glossar
  - netze
verlinken:
  - Überanpassung
  - Overfitting
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Überanpassung (Overfitting)

> Überanpassung heisst: perfekt bei den Übungsaufgaben, hilflos bei der ersten neuen.

Ein Modell mit genug Parametern kann jedes Trainingsbeispiel speichern, samt Rauschen und Zufällen. Dann sinkt der Fehler im Training immer weiter, während er bei neuen Daten wieder steigt.

**Zu erkennen ist das nur mit Daten, die das Modell nie gesehen hat.** Deshalb hält man einen Teil zurück. Dagegen helfen mehr und vielfältigere Daten, kleinere Modelle, Regularisierung oder rechtzeitiges Aufhören.

Bei Lernenden gibt es dasselbe Muster: Wer nur alte Klausuren auswendig lernt, besteht genau diese.

## Verwandt

[[unteranpassung]] · [[generalisierung]] · [[regularisierung]] · [[validierungsdatensatz]]
