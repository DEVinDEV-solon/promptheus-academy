---
type: entity/begriff
title: "Fan-out"
description: "Eine Aufgabe auf viele Agenten gleichzeitig verteilen und die Ergebnisse wieder einsammeln."
tags:
  - glossar
  - agentenbau
verlinken:
  - Fan-out
  - Fan-Out
  - Fan-out/Fan-in
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Fan-out

> Beim Fan-out schickt ein Orchestrator dieselbe Art von Auftrag an viele Subagenten — etwa je einen pro Dokument — und fasst danach zusammen.

So lassen sich hundert Dateien in der Zeit prüfen, die einer für eine braucht. Das Einsammeln heisst Fan-in.

Die Kosten wachsen mit der Zahl der Agenten. Bei zehn Agenten ist die Rechnung zehnmal so hoch.

## Verwandt

[[parallele-agenten]] · [[subagent]] · [[orchestrator]]
