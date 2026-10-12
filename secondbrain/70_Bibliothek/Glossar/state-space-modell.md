---
type: entity/begriff
title: "State-Space-Modell (SSM)"
description: "Eine Alternative zum Transformer, die einen kompakten Zustand durch den Text trägt."
tags:
  - glossar
  - modellbau
verlinken:
  - State-Space-Modell
  - State-Space-Modelle
  - Zustandsraummodell
  - SSM
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# State-Space-Modell (SSM)

> Ein State-Space-Modell liest Token für Token und führt dabei einen inneren Zustand fester Grösse mit, statt auf alles Frühere zurückzublicken.

Damit kehrt eine Idee der älteren rekurrenten Netze zurück, aber so gebaut, dass sie sich parallel trainieren lässt. Der Vorteil: Speicherbedarf und Tempo hängen nicht von der Textlänge ab.

Der Nachteil: Was nicht in den Zustand passt, ist verloren. **Exakt etwas wiederfinden fällt solchen Modellen schwerer** — deshalb werden sie meist mit Attention-Schichten gemischt.

## Verwandt

[[rekurrentes-netz]] · [[lineare-attention]] · [[hybridarchitektur]] · [[transformer]]
