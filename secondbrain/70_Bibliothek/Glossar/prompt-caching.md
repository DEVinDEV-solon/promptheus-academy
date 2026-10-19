---
type: entity/begriff
title: "Prompt Caching"
description: "Gleiche Prompt-Anfänge nur einmal einlesen und das Ergebnis wiederverwenden."
tags:
  - glossar
  - betrieb
verlinken:
  - Prompt Caching
  - Prompt-Caching
  - Prompt-Cache
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Prompt Caching

> Prompt Caching hebt das Ergebnis des Einlesens eines Prompt-Anfangs auf. Beginnt die nächste Anfrage genauso, wird nur der neue Teil gerechnet.

Langer Systemprompt, grosse Dokumente, ein langer Gesprächsverlauf — all das wiederholt sich bei jeder Nachricht. Mit Caching kostet es nur beim ersten Mal den vollen Preis.

**Die Einsparung ist erheblich**, oft ein Grossteil der Kosten und der Wartezeit. Dafür muss der feste Teil vorn stehen und der wechselnde hinten.

## Verwandt

[[kv-cache]] · [[prefill]] · [[token-preis]] · [[systemprompt]]
