---
type: entity/begriff
title: "Idempotenz"
description: "Eine Aktion zweimal auszuführen hat dieselbe Wirkung wie einmal."
tags:
  - glossar
  - betrieb
verlinken:
  - Idempotenz
  - Idempotent
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Idempotenz

> Eine Aktion ist idempotent, wenn ihre Wiederholung nichts zusätzlich anrichtet.

„Setze den Status auf erledigt" ist idempotent, „Buche 50 Euro ab" ist es nicht. Bei Wiederholungsversuchen ist das entscheidend: Wurde die erste Anfrage doch ausgeführt, darf die zweite nicht doppelt buchen.

**Für Agenten, die handeln, ist das eine Sicherheitsfrage.**

## Verwandt

[[wiederholungsversuch]] · [[fehlerbehandlung]]
