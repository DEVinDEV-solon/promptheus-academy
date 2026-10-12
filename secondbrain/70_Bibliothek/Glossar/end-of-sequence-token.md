---
type: entity/begriff
title: "End-of-Sequence-Token"
description: "Das Zeichen, mit dem ein Modell signalisiert: Hier ist die Antwort zu Ende."
tags:
  - glossar
  - modellbau
verlinken:
  - End-of-Sequence-Token
  - EOS-Token
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# End-of-Sequence-Token

> Das End-of-Sequence-Token ist das Token, das ein Modell schreibt, wenn es fertig ist.

Ohne dieses Zeichen würde ein Modell immer weiter schreiben. Es lernt im Training, wann ein Text sinnvoll endet, und erzeugt dann genau dieses Token.

Bleibt es aus, etwa durch eine falsche Chat-Vorlage, endet die Antwort erst am Ausgabelimit — oft mitten im Satz.

## Verwandt

[[sondertoken]] · [[stoppsequenz]] · [[ausgabelimit]]
