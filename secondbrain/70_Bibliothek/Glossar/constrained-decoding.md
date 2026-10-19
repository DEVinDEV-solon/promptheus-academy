---
type: entity/begriff
title: "Constrained Decoding"
description: "Beim Erzeugen nur Token zulassen, die zu einem gültigen Format führen."
tags:
  - glossar
  - protokolle
verlinken:
  - Constrained Decoding
  - Eingeschränkte Dekodierung
  - Grammatikgesteuerte Dekodierung
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Constrained Decoding

> Constrained Decoding sperrt bei jedem Schritt alle Token, die das gewünschte Format verletzen würden.

Steht im Schema, dass jetzt eine Zahl kommen muss, sind nur Ziffern erlaubt. So entsteht garantiert gültiges JSON oder eine Antwort aus einer festen Liste.

Das ist die Technik hinter strukturierten Ausgaben.

## Verwandt

[[strukturierte-ausgabe]] · [[sampling]] · [[json-schema]]
