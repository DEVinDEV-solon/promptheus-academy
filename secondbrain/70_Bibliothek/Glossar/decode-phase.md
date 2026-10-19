---
type: entity/begriff
title: "Decode-Phase"
description: "Das Erzeugen der Antwort, ein Token nach dem anderen."
tags:
  - glossar
  - betrieb
verlinken:
  - Decode-Phase
  - Decoding-Phase
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Decode-Phase

> In der Decode-Phase schreibt das Modell seine Antwort Token für Token, jedes auf Grundlage aller vorigen.

Anders als das Prefill lässt sie sich nicht beschleunigen, indem man mehr parallel rechnet — jedes Token wartet auf das vorige. Ihr Tempo hängt vor allem davon ab, wie flink die Gewichte aus dem Speicher geladen werden.

**Deshalb ist bei Sprachmodellen oft der Speicher der Engpass, nicht die Rechenleistung.**

## Verwandt

[[prefill]] · [[autoregressives-modell]] · [[speicherbandbreite]] · [[token-pro-sekunde]]
