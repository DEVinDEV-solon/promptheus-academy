---
type: entity/begriff
title: "Beam Search"
description: "Mehrere Fortsetzungen parallel verfolgen und am Ende die beste Gesamtfolge wählen."
tags:
  - glossar
  - denken
verlinken:
  - Beam Search
  - Strahlsuche
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Beam Search

> Beam Search behält bei jedem Schritt die besten paar Teilsätze im Blick, statt sich sofort festzulegen.

So wird eine Folge gefunden, die insgesamt wahrscheinlich ist, auch wenn sie mit einem weniger wahrscheinlichen Wort beginnt. Für Übersetzung und Spracherkennung war das lange Standard.

In Chat-Modellen wird es kaum benutzt, weil die Texte dabei steif und formelhaft werden.

## Verwandt

[[greedy-decoding]] · [[sampling]]
