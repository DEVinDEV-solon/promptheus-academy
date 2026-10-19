---
type: entity/begriff
title: "Wiederaufnahme (Resume)"
description: "Nach einer Unterbrechung dort weitermachen, wo man aufgehört hat."
tags:
  - glossar
  - agentenbau
verlinken:
  - Sitzungswiederaufnahme
  - Agentenwiederaufnahme
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Wiederaufnahme (Resume)

> Wiederaufnahme heisst: Ein Agent wird gestoppt — durch Absturz, Pause oder Neustart — und setzt danach ohne Verlust fort.

Dazu muss sein Zustand gespeichert sein: Was ist erledigt, was läuft gerade, was kommt als Nächstes. Bereits ausgeführte Aktionen dürfen nicht doppelt passieren.

In der Praxis schreiben Agenten deshalb regelmässig einen Zwischenstand in eine Datei: erledigte Schritte, offene Fragen, nächste Aufgabe. Diese Notiz ist das Lesezeichen, an dem die Arbeit wieder einsetzt.

## Verwandt

[[zustand]] · [[idempotenz]] · [[langlaufende-aufgabe]]
