---
type: entity/begriff
title: "Zustandsautomat (State Machine)"
description: "Ein Ablauf mit festen Zuständen und klar festgelegten Übergängen."
tags:
  - glossar
  - agentenbau
verlinken:
  - Zustandsautomat
  - Zustandsautomaten
  - State Machine
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Zustandsautomat (State Machine)

> Ein Zustandsautomat kennt nur bestimmte Zustände — etwa „wartet", „prüft", „fertig" — und erlaubt nur bestimmte Wechsel dazwischen.

In Agentensystemen gibt er Struktur: Das Modell entscheidet innerhalb eines Zustands, aber nicht, welche Zustände es gibt.

So lassen sich Abläufe bauen, die flexibel und trotzdem kontrollierbar sind.

Ein Beispiel: Ein Bestellagent darf vom Zustand „Warenkorb“ nur nach einer Freigabe in den Zustand „bezahlt“ wechseln. Diese Regel steht im Code, nicht im Prompt, und lässt sich deshalb nicht wegreden.

## Verwandt

[[zustand]] · [[agentengraph]] · [[workflow]]
