---
type: entity/begriff
title: "Adam-Optimierer"
description: "Der verbreitete Standard-Optimierer, der jedem Gewicht sein eigenes Tempo gibt."
tags:
  - glossar
  - netze
verlinken:
  - Adam-Optimierer
  - AdamW
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Adam-Optimierer

> Adam merkt sich für jedes Gewicht, in welche Richtung es zuletzt ging und wie stark es geschwankt hat — und passt danach die Schrittgrösse an.

Gewichte, die ständig hin und her zappeln, bekommen kleinere Schritte. Gewichte, deren Richtung klar ist, bekommen grössere. Dadurch braucht Adam weniger Feintuning an der Lernrate als ältere Verfahren.

Die Variante mit zusätzlicher Bremse gegen zu grosse Gewichte heisst AdamW und ist bei Sprachmodellen fast Standard. **Der Preis:** Für jedes Gewicht werden zwei weitere Zahlen gespeichert, das Training braucht also ein Mehrfaches an Speicher.

## Verwandt

[[optimierer]] · [[lernrate]] · [[gradientenabstieg]] · [[regularisierung]]
