---
type: entity/begriff
title: "Regressionstest"
description: "Ein Test, der prüft, dass bisher Funktionierendes nach einer Änderung noch funktioniert."
tags:
  - glossar
  - protokolle
verlinken:
  - Regressionstest
  - Regressionstests
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Regressionstest

> Ein Regressionstest wird nach jeder Änderung wiederholt, damit Altes nicht unbemerkt kaputtgeht.

Bei Software mit KI-Anteilen gehören auch Prompts und Modellwechsel dazu: Dieselben Prüffälle müssen nach jedem Wechsel durchlaufen.

Ein Prüffall entsteht oft aus einem gefundenen Fehler: Man schreibt einen Test, der genau diesen Fehler zeigt, behebt ihn und behält den Test. Kommt der Fehler je zurück, schlägt der Test sofort an. So wächst mit jedem behobenen Fehler das Sicherheitsnetz.

## Verwandt

[[testgetriebene-entwicklung]] · [[verhaltensregression]] · [[ci-cd]]
