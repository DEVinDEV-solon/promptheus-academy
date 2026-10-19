---
type: entity/begriff
title: "Stoppsequenz"
description: "Eine Zeichenfolge, bei der die Ausgabe des Modells sofort endet."
tags:
  - glossar
  - denken
verlinken:
  - Stoppsequenz
  - Stoppsequenzen
  - Stop Sequence
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Stoppsequenz

> Eine Stoppsequenz sagt dem Programm: Sobald diese Zeichen erscheinen, hör auf.

Das ist nützlich, wenn man nur einen Teil einer Ausgabe braucht, etwa bis zur nächsten Leerzeile oder bis ein bestimmtes Schlusswort kommt.

Auch Rollenwechsel lassen sich so abfangen: Schreibt ein Modell plötzlich die Frage des Nutzers selbst weiter, stoppt die Sequenz es an genau dieser Stelle. Die Stoppsequenz selbst erscheint dabei meist nicht in der Ausgabe.

## Verwandt

[[ausgabelimit]] · [[end-of-sequence-token]]
