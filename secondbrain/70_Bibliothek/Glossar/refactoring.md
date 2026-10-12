---
type: entity/begriff
title: "Refactoring"
description: "Code verbessern, ohne sein Verhalten zu ändern."
tags:
  - glossar
  - protokolle
verlinken:
  - Refactoring
  - Refaktorierung
  - Refaktorisieren
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Refactoring

> Refactoring räumt Code auf: klarere Namen, kleinere Funktionen, weniger Doppeltes — das Programm tut danach genau dasselbe.

Ohne Tests ist das riskant, weil man nicht merkt, wenn sich doch etwas ändert. Agenten können Refactoring gut, brauchen aber dieselbe Absicherung.

Gutes Refactoring passiert in kleinen Schritten, nach jedem wird getestet. Ein Agent, der in einem Zug hunderte Dateien umbaut, liefert einen Diff, den niemand mehr sinnvoll prüfen kann. Kleine Schritte sind hier auch eine Frage der Kontrolle.

## Verwandt

[[technische-schuld]] · [[regressionstest]]
