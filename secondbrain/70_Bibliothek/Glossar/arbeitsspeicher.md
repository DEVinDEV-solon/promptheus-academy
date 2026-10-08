---
type: entity/begriff
title: "Arbeitsspeicher"
description: "Der Tisch, auf dem gerechnet wird — passt das Modell nicht drauf, läuft es nicht."
tags:
  - glossar
  - hardware
aliase:
  - VRAM
timestamp: 2026-08-22T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Arbeitsspeicher

> Der Arbeitsspeicher hält das, woran gerade gerechnet wird. Bei einer Grafikkarte heisst er VRAM und ist die härteste Grenze der ganzen KI.

Ein Sprachmodell besteht aus [[modellgewichte|Gewichten]] — Milliarden Zahlen. Sie müssen alle gleichzeitig verfügbar sein, denn für jedes einzelne [[token]] wird durch alle gerechnet.

Grobe Rechnung: Ein Modell mit 7 Milliarden Gewichten braucht rund 14 Gigabyte, eines mit 70 Milliarden rund 140. Deshalb ist [[quantisierung]] keine Spielerei, sondern der Unterschied zwischen „läuft auf meinem Rechner" und „läuft nicht".

Festplatte ist nicht Arbeitsspeicher. Ein Modell auf der Platte ist wie ein Buch im Regal: Es nützt erst etwas, wenn es aufgeschlagen auf dem Tisch liegt.

## Verwandt

[[gpu]] · [[quantisierung]] · [[modellgewichte]] · [[hybride-speicherchips]]
