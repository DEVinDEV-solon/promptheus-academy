---
type: entity/begriff
title: "Temperatur"
description: "Der Regler, der bestimmt, wie mutig ein Modell wählt."
tags:
  - glossar
  - ki
  - technik
timestamp: 2026-08-22T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Temperatur

> Die Temperatur staucht oder dehnt die Wahrscheinlichkeiten, bevor gezogen wird. Niedrig heißt vorhersagbar, hoch heißt überraschend.

Bei Temperatur 0 nimmt das Modell immer das wahrscheinlichste Token — dieselbe Frage ergibt dieselbe Antwort. Je höher der Wert, desto eher kommen auch weniger wahrscheinliche Wörter zum Zug.

Das ist kein Kreativitätsregler, auch wenn er oft so verkauft wird. Hohe Temperatur macht nicht klüger, sondern nur unsicherer — brauchbar beim Dichten, gefährlich bei einer Rechtsauskunft.

## Verwandt

[[softmax]] · [[sampling]] · [[entropie]] · [[llm]]

## Beleg

Geerntet aus einem fremden Wissensspeicher, mit Prüfsumme: [[llm-grundlagen-sampling-und-entropie]] in `90_Quellen/`.
