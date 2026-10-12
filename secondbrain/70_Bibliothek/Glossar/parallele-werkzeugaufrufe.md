---
type: entity/begriff
title: "Parallele Werkzeugaufrufe"
description: "Ein Modell ruft mehrere Werkzeuge auf einmal auf, statt nacheinander."
tags:
  - glossar
  - protokolle
verlinken:
  - Parallele Werkzeugaufrufe
  - Parallel Tool Calls
  - Parallelen Werkzeugaufrufen
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Parallele Werkzeugaufrufe

> Parallele Werkzeugaufrufe erlauben dem Modell, in einem Schritt etwa drei Dateien zu lesen oder zwei Suchen zu starten.

Das spart Zeit und Schleifendurchläufe, wenn die Aufrufe unabhängig voneinander sind. Hängt der zweite vom Ergebnis des ersten ab, muss es weiter nacheinander gehen.

Agenten, die das nutzen, wirken spürbar flotter, weil sie beim Einlesen eines Projekts nicht Datei für Datei warten. Wichtig ist, dass die Werkzeuge sich nicht gegenseitig stören — zwei Schreibvorgänge auf dieselbe Datei gleichzeitig führen zu Chaos.

## Verwandt

[[werkzeugaufruf]] · [[agentenschleife]]
