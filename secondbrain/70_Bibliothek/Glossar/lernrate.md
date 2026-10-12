---
type: entity/begriff
title: "Lernrate"
description: "Wie gross jeder Korrekturschritt beim Training ist."
tags:
  - glossar
  - netze
verlinken:
  - Lernrate
  - Lernraten
  - Learning Rate
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Lernrate

> Die Lernrate bestimmt, wie weit das Modell bei jedem Schritt seine Gewichte verschiebt.

Zu gross, und das Training springt über das Ziel hinaus, schwankt hin und her oder läuft aus dem Ruder. Zu klein, und es dauert ewig oder bleibt in der ersten Mulde stecken.

In der Praxis wird sie nicht fest gewählt, sondern geplant: Anfangs langsam hochfahren, dann allmählich senken, damit das Modell sich am Ende fein einpendelt. **Sie ist der wichtigste Hyperparameter überhaupt** — wer an einem Training nur eine Zahl einstellen darf, stellt diese.

## Verwandt

[[hyperparameter]] · [[gradientenabstieg]] · [[optimierer]] · [[konvergenz]]
