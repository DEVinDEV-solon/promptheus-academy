---
type: entity/begriff
title: "Spekulatives Dekodieren"
description: "Ein kleines Modell rät mehrere Token voraus, das grosse prüft sie in einem Zug."
tags:
  - glossar
  - betrieb
verlinken:
  - Spekulatives Dekodieren
  - Speculative Decoding
  - Spekulative Dekodierung
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Spekulatives Dekodieren

> Beim spekulativen Dekodieren schreibt ein kleines Modell einen Entwurf von mehreren Token, und das grosse Modell bestätigt oder verwirft ihn auf einmal.

Weil Prüfen sich parallel rechnen lässt, Schreiben aber nicht, spart das Zeit. Stimmt der Entwurf, kommen mehrere Token zum Preis von einem. Stimmt er nicht, verwirft das grosse Modell den Rest und schreibt selbst weiter.

**Das Ergebnis ist exakt dasselbe**, als hätte das grosse Modell allein geschrieben — nur flotter.

## Verwandt

[[entwurfsmodell]] · [[decode-phase]] · [[latenz]]
