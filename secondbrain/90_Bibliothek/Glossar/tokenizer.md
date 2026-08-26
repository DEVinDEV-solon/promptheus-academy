---
type: entity/begriff
title: "Tokenizer"
description: "Das Programm, das Text in Token zerlegt — immer nach derselben festen Tabelle."
tags:
  - glossar
  - ki
  - grundlagen
timestamp: 2026-08-22T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Tokenizer

> Der Tokenizer ist der Schritt vor dem Denken: er schneidet Text in die Stücke, mit denen das Modell rechnet.

Er rät nicht und lernt nicht. Er arbeitet eine feste Tabelle ab, die beim Training einmal gebaut wurde — dieselbe Eingabe ergibt immer dieselbe Zerlegung. Verschiedene Modellfamilien haben verschiedene Tabellen, deshalb kostet derselbe Text bei zwei Anbietern verschieden viel.

Die Academy hat einen eingebaut: den [[tokenicer]]. Er rechnet mit denselben Tabellen wie die echten Modelle, aber auf diesem Rechner — der Text geht nirgendwo hin.

## Verwandt

[[token]] · [[llm]] · [[tokenicer]]
