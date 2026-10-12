---
type: entity/begriff
title: "Aufmerksamkeit (Attention)"
description: "Der Mechanismus, mit dem ein Modell entscheidet, welche Wörter für welches Wort zählen."
tags:
  - glossar
  - modellbau
verlinken:
  - Attention
  - Attention-Mechanismus
  - Aufmerksamkeitsmechanismus
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Aufmerksamkeit (Attention)

> Attention heisst: Für jedes Token wird ausgerechnet, wie stark jedes andere Token bei seiner Deutung mitreden soll.

Im Satz „Die Katze jagte die Maus, weil sie hungrig war" muss das Modell herausfinden, worauf sich „sie" bezieht. Attention gibt „Katze" dafür ein grosses Gewicht und „Maus" ein kleines.

Das passiert nicht nach einer Regel, sondern nach gelernten Zahlen. **Der Aufwand wächst quadratisch mit der Textlänge**: doppelt so viel Text, viermal so viele Vergleiche. Das ist der Hauptgrund, warum lange Kontexte teuer sind, und der Antrieb hinter vielen sparsameren Varianten.

## Verwandt

[[selbstaufmerksamkeit]] · [[query-key-value]] · [[multi-head-attention]] · [[transformer]] · [[kontextfenster]]
