---
type: entity/begriff
title: "Top-k"
description: "Nur die k wahrscheinlichsten Token zur Wahl stellen."
tags:
  - glossar
  - denken
verlinken:
  - Top-k
  - Top-K
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Top-k

> Top-k erlaubt beim Ziehen nur die besten k Kandidaten — zum Beispiel die 40 wahrscheinlichsten Token.

Das verhindert, dass ein ganz unpassendes Token zufällig gezogen wird. Anders als Top-p ist die Zahl fest, egal ob das Modell sicher ist oder nicht.

Das ist zugleich seine Schwäche: Bei einer klaren Frage bleiben unnötig viele Kandidaten im Rennen, bei einer offenen werden gute Möglichkeiten abgeschnitten. Deshalb wird Top-k oft nur als grobe Sicherung neben Top-p verwendet.

## Verwandt

[[top-p]] · [[sampling]] · [[temperatur]]
