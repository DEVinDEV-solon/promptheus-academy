---
type: entity/begriff
title: "Decoder"
description: "Der Teil eines Modells, der Ausgaben erzeugt — Token für Token."
tags:
  - glossar
  - modellbau
verlinken:
  - Decoder
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Decoder

> Ein Decoder schreibt: Er sieht, was bisher dasteht, und erzeugt das nächste Stück.

Dabei darf er nur nach links schauen, also auf das, was schon geschrieben ist. Was danach kommt, gibt es ja noch nicht. Diese Einschränkung erzwingt die kausale Maske.

Heutige Chat-Modelle bestehen nur noch aus Decodern. Der Name taucht auch in anderer Bedeutung auf: Beim Erzeugen von Bildern wandelt ein Decoder die verdichtete Darstellung zurück in Pixel.

## Verwandt

[[encoder]] · [[decoder-only-modell]] · [[kausale-maske]] · [[autoregressives-modell]]
