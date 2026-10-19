---
type: entity/begriff
title: "Residualverbindung"
description: "Eine Abkürzung, die die Eingabe einer Schicht unverändert an ihrer Ausgabe vorbeiführt."
tags:
  - glossar
  - netze
verlinken:
  - Residualverbindung
  - Residualverbindungen
  - Skip Connection
  - Residual Connection
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Residualverbindung

> Eine Residualverbindung addiert zur Ausgabe einer Schicht wieder ihre Eingabe dazu.

So muss jede Schicht nur noch eine Korrektur lernen, nicht alles neu. Und das Lernsignal findet beim Rückwärtsrechnen einen direkten Weg durch das ganze Netz.

**Diese kleine Idee machte Netze mit hunderten Schichten möglich.** In jedem Transformer läuft so ein Hauptstrang durch alle Schichten, an den jede Schicht ihren Beitrag anhängt.

## Verwandt

[[schicht]] · [[normalisierung]] · [[backpropagation]] · [[transformer]]
