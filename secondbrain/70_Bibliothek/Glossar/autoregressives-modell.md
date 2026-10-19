---
type: entity/begriff
title: "Autoregressives Modell"
description: "Erzeugt Token für Token, jedes aus allen vorigen — die eigene Ausgabe wird zur nächsten Eingabe."
tags:
  - glossar
  - modellbau
verlinken:
  - Autoregressives Modell
  - Autoregressive Modelle
  - Autoregressiv
  - Autoregressive
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Autoregressives Modell

> Ein autoregressives Modell schreibt ein Token, hängt es an, liest alles noch einmal und schreibt das nächste.

So entsteht jede Antwort eines Sprachmodells: nicht als Ganzes geplant, sondern Stück für Stück. Darum erscheint sie auch Wort für Wort auf dem Bildschirm.

**Eine Folge davon:** Ein früher Fehler wird mitgeschleppt. Hat das Modell einmal eine falsche Zahl geschrieben, rechnet es mit ihr weiter. Deshalb hilft es oft, ein Modell erst nachdenken und dann antworten zu lassen.

## Verwandt

[[naechstes-token-vorhersage]] · [[decoder-only-modell]] · [[chain-of-thought]] · [[decode-phase]]
