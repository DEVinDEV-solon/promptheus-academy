---
type: entity/begriff
title: "Werkzeugbeschreibung (Tool Schema)"
description: "Die Beschreibung, aus der ein Modell lernt, was ein Werkzeug kann und wie man es aufruft."
tags:
  - glossar
  - protokolle
verlinken:
  - Werkzeugbeschreibung
  - Werkzeugbeschreibungen
  - Tool Schema
  - Tool-Beschreibung
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Werkzeugbeschreibung (Tool Schema)

> Eine Werkzeugbeschreibung nennt Name, Zweck und erwartete Eingaben eines Werkzeugs — meist als JSON-Schema.

Das Modell sieht nur diese Beschreibung, nicht den Code. **Ist sie unklar, benutzt es das Werkzeug falsch** oder gar nicht.

Gute Beschreibungen sagen auch, wann man das Werkzeug nicht nehmen soll. Sie sind eine Form von Prompt und verdienen dieselbe Sorgfalt.

## Verwandt

[[werkzeugaufruf]] · [[json-schema]] · [[mcp-server]]
