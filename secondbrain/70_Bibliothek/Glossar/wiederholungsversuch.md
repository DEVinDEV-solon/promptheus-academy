---
type: entity/begriff
title: "Wiederholungsversuch (Retry)"
description: "Eine gescheiterte Anfrage noch einmal schicken — aber mit Bedacht."
tags:
  - glossar
  - betrieb
verlinken:
  - Wiederholungsversuch
  - Wiederholungsversuche
  - Retry
  - Retries
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Wiederholungsversuch (Retry)

> Ein Wiederholungsversuch schickt eine Anfrage erneut, wenn sie wegen einer vorübergehenden Störung gescheitert ist.

**Richtig gemacht heisst:** nicht sofort, sondern nach einer Pause, die bei jedem Fehlschlag länger wird, und mit etwas Zufall, damit nicht alle zugleich wiederkommen. Und nur bei Fehlern, die vorübergehend sind.

Ein Fehler in der Anfrage selbst wird durch Wiederholen nicht besser.

## Verwandt

[[idempotenz]] · [[ratenlimit]] · [[timeout]] · [[fehlerbehandlung]]
