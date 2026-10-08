---
type: entity/begriff
title: "Token"
description: "Das Stück Text, mit dem ein Sprachmodell rechnet — meist kürzer als ein Wort."
tags:
  - glossar
  - ki
  - grundlagen
timestamp: 2026-08-22T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Token

> Ein Token ist kein Wort und kein Buchstabe, sondern etwas dazwischen: das Stück, in das ein Modell Text zerlegt, bevor es rechnet.

Häufige Wörter sind ein einziges Token, seltene zerfallen in mehrere. „Haus" ist eins, „Donaudampfschifffahrt" sind viele. Deutsch zerfällt dabei stärker als Englisch, weil die Trainingsdaten überwiegend englisch waren — dieselbe Aussage kostet auf Deutsch also mehr.

Das ist der Grund, warum ein Modell manchmal an einer Stelle scheitert, die einem Menschen leicht fällt: Buchstaben zählen etwa. Das Modell sieht keine Buchstaben, es sieht Tokens.

Probier es im [[tokenicer]] aus: schreib denselben Satz auf Deutsch und auf Englisch und vergleich die Zahl.

## Verwandt

[[tokenizer]] · [[llm]] · [[kontextfenster]] · [[talent]]
