---
type: entity/begriff
title: "KV-Cache"
description: "Das Zwischenlager, in dem ein Modell beim Antworten die Keys und Values früherer Token aufhebt."
tags:
  - glossar
  - betrieb
verlinken:
  - KV-Cache
  - Key-Value-Cache
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# KV-Cache

> Der KV-Cache speichert, was die Attention für jedes bisherige Token schon ausgerechnet hat, damit es beim nächsten Token nicht noch einmal gerechnet werden muss.

Ohne ihn müsste das Modell für jedes neue Wort den ganzen bisherigen Text neu verarbeiten. Mit ihm rechnet es nur das neue Token und schaut im Lager nach.

**Der Preis ist Speicher.** Der Cache wächst mit jedem Token und jeder gleichzeitigen Anfrage. Bei langen Texten belegt er oft mehr Speicher als das Modell selbst — der Hauptgrund, warum langer Kontext teuer ist.

## Verwandt

[[query-key-value]] · [[prefill]] · [[paged-attention]] · [[grouped-query-attention]] · [[prompt-caching]]
