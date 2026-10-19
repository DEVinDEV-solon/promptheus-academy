---
type: entity/begriff
title: "Backpropagation (Fehlerrückführung)"
description: "Das Verfahren, das den Fehler am Ausgang rückwärts auf alle Gewichte im Netz verteilt."
tags:
  - glossar
  - netze
verlinken:
  - Backpropagation
  - Fehlerrückführung
  - Rückpropagierung
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Backpropagation (Fehlerrückführung)

> Backpropagation rechnet von der falschen Antwort aus rückwärts durch jede Schicht und bestimmt, wie viel jedes einzelne Gewicht zum Fehler beigetragen hat.

Ohne sie wüsste das Training nur, dass etwas falsch war, nicht wo. Mit ihr bekommt jede der Milliarden Stellschrauben ihre eigene Korrektur.

Die Idee ist alt, sie stammt aus den 1970er- und 1980er-Jahren. Neu ist nur, dass heute genug Rechenleistung und Daten da sind, um sie auf riesige Netze anzuwenden. **Sie ist das Werkzeug, mit dem der Gradient berechnet wird** — der Gradientenabstieg benutzt ihn dann.

## Verwandt

[[gradient]] · [[gradientenabstieg]] · [[neuronales-netz]] · [[schicht]]
