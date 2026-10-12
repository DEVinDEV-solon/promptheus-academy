---
type: entity/begriff
title: "Query, Key, Value"
description: "Die drei Rollen in der Attention-Rechnung: was gesucht wird, was angeboten wird, was übergeben wird."
tags:
  - glossar
  - modellbau
verlinken:
  - Query, Key, Value
  - Query-Key-Value
  - Query-Vektor
  - Key-Vektor
  - Value-Vektor
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Query, Key, Value

> Jedes Token bekommt drei Vektoren: eine Frage (Query), ein Etikett (Key) und einen Inhalt (Value).

Das Bild einer Bibliothek hilft: Die Query ist dein Suchwunsch, die Keys sind die Rückenschilder der Bücher, die Values sind die Inhalte. Wo Query und Key gut zusammenpassen, wird viel vom Value übernommen.

Gemessen wird das Zusammenpassen mit dem Skalarprodukt. **Keys und Values früherer Token werden beim Antworten zwischengespeichert** — das ist der KV-Cache, der beim Betrieb so viel Speicher frisst.

## Verwandt

[[aufmerksamkeit]] · [[skalarprodukt]] · [[kv-cache]] · [[vektor]]
