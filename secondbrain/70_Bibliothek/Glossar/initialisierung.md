---
type: entity/begriff
title: "Initialisierung"
description: "Die Startwerte der Gewichte, bevor das Training beginnt."
tags:
  - glossar
  - netze
verlinken:
  - Gewichtsinitialisierung
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Initialisierung

> Die Initialisierung legt fest, mit welchen Zufallszahlen ein Netz ins Training startet.

Alle Gewichte auf null zu setzen funktioniert nicht: Dann rechnen alle Neuronen gleich und lernen auch gleich. Zu grosse Zufallswerte lassen das Signal explodieren, zu kleine lassen es verschwinden.

Die richtigen Startwerte sind eine kleine Wissenschaft für sich. Merkt man im Alltag nichts davon — aber ein falsch initialisiertes Training kann Tage an Rechenzeit verschwenden.

## Verwandt

[[modellgewichte]] · [[training]] · [[gradientenabstieg]]
