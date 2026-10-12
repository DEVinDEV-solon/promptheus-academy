---
type: entity/begriff
title: "Speichergrenze (Out of Memory)"
description: "Wenn ein Modell oder eine Rechnung nicht mehr in den verfügbaren Speicher passt."
tags:
  - glossar
  - betrieb
verlinken:
  - Speichergrenze
  - Out of Memory
  - Out-of-Memory
  - OOM
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Speichergrenze (Out of Memory)

> Die Speichergrenze ist erreicht, wenn Gewichte, Cache und Zwischenergebnisse zusammen mehr Platz brauchen, als da ist. Dann bricht das Programm ab.

Es ist die häufigste Fehlermeldung beim Betrieb eigener Modelle. Abhilfe: ein kleineres oder stärker verkleinertes Modell, kürzerer Kontext, weniger gleichzeitige Anfragen.

Tückisch ist, dass der Speicherbedarf während einer Antwort wächst. Ein Modell, das beim Start problemlos läuft, kann bei einem langen Gespräch plötzlich an die Grenze stossen.

## Verwandt

[[arbeitsspeicher]] · [[kv-cache]] · [[quantisierung]]
