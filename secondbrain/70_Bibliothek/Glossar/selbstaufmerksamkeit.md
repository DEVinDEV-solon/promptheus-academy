---
type: entity/begriff
title: "Selbstaufmerksamkeit (Self-Attention)"
description: "Attention innerhalb desselben Textes: jedes Token schaut auf die anderen Token derselben Eingabe."
tags:
  - glossar
  - modellbau
verlinken:
  - Selbstaufmerksamkeit
  - Self-Attention
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Selbstaufmerksamkeit (Self-Attention)

> Bei der Selbstaufmerksamkeit befragt ein Text sich selbst — jedes Wort sucht unter seinen Nachbarn die, die es erklären.

Ältere Übersetzungsmodelle nutzten Attention nur zwischen zwei Texten: dem Ausgangssatz und der Übersetzung. Der Transformer wendet sie auch auf die Eingabe selbst an.

Dadurch kann ein Pronomen am Satzende direkt auf das Hauptwort am Anfang zugreifen, ohne dass die Information mühsam durch alle Zwischenwörter wandern muss. **Abstand spielt keine Rolle mehr** — nur Bedeutung.

## Verwandt

[[aufmerksamkeit]] · [[transformer]] · [[kausale-maske]]
