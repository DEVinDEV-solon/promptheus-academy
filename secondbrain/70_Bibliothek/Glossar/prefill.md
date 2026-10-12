---
type: entity/begriff
title: "Prefill"
description: "Das Einlesen des ganzen Prompts, bevor die erste Antwort-Token entstehen."
tags:
  - glossar
  - betrieb
verlinken:
  - Prefill
  - Prefill-Phase
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Prefill

> Im Prefill verarbeitet das Modell alle Token des Prompts auf einmal und füllt damit den KV-Cache.

Diese Phase lässt sich gut parallel rechnen und nutzt die Chips voll aus. Bei sehr langen Prompts dauert sie trotzdem spürbar — das ist die Wartezeit, bevor die Antwort zu laufen beginnt.

Prompt Caching setzt hier an: Ein schon einmal eingelesener Anfang muss nicht noch einmal verarbeitet werden.

## Verwandt

[[decode-phase]] · [[kv-cache]] · [[time-to-first-token]] · [[prompt-caching]]
