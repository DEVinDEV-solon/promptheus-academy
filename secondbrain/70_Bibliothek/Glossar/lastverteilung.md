---
type: entity/begriff
title: "Lastverteilung (Load Balancing)"
description: "Anfragen so auf mehrere Rechner verteilen, dass keiner überlastet ist."
tags:
  - glossar
  - betrieb
verlinken:
  - Lastverteilung
  - Load Balancing
  - Load Balancer
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Lastverteilung (Load Balancing)

> Lastverteilung sorgt dafür, dass neue Anfragen dort landen, wo gerade Kapazität frei ist.

Bei Sprachmodellen ist das kniffliger als bei Webseiten: Eine Anfrage kann eine Sekunde oder zehn Minuten dauern. Gute Verteiler berücksichtigen auch, wo ein passender Cache schon liegt.

Fällt ein Rechner aus, schickt der Verteiler die Anfragen an die übrigen. So bleibt ein Dienst erreichbar, auch wenn einzelne Teile gerade gewartet werden.

## Verwandt

[[skalierung]] · [[durchsatz]] · [[prompt-caching]]
