---
type: entity/begriff
title: "Supervisor-Muster"
description: "Ein leitender Agent verteilt Aufgaben und prüft die Ergebnisse der anderen."
tags:
  - glossar
  - agentenbau
verlinken:
  - Supervisor-Muster
  - Supervisor-Agent
  - Supervisor Pattern
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Supervisor-Muster

> Im Supervisor-Muster gibt es einen Chef-Agenten, der delegiert und kontrolliert, und mehrere Arbeiter-Agenten, die ausführen.

Das schafft klare Verantwortung: Der Supervisor entscheidet, was gut genug ist. Wird er überlastet, wird er zum Engpass.

Das Muster eignet sich für Aufgaben, bei denen Qualität wichtiger ist als Tempo. Der Supervisor sieht alle Ergebnisse, kann Widersprüche zwischen den Arbeitern erkennen und eine Teilaufgabe zurückgeben, wenn sie nicht reicht.

## Verwandt

[[orchestrator]] · [[subagent]] · [[delegation]]
