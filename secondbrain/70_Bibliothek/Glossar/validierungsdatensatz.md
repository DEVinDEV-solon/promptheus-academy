---
type: entity/begriff
title: "Validierungsdatensatz"
description: "Zurückgehaltene Beispiele, an denen man während des Trainings prüft, ob das Modell wirklich lernt."
tags:
  - glossar
  - netze
verlinken:
  - Validierungsdatensatz
  - Validierungsdaten
  - Validierungsset
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Validierungsdatensatz

> Der Validierungsdatensatz ist die Zwischenprüfung: Das Modell lernt nicht aus ihm, aber man schaut regelmässig, wie es dort abschneidet.

Steigt der Fehler auf diesen Daten, während er im Training weiter fällt, beginnt die Überanpassung. Dann ist es Zeit aufzuhören oder etwas zu ändern.

Auch Hyperparameter werden an ihm ausgewählt. Genau deshalb braucht man daneben noch einen dritten, ganz unberührten Satz — den Testdatensatz. Sonst passt man sich über viele Versuche hinweg doch wieder an die Zwischenprüfung an.

## Verwandt

[[trainingsdatensatz]] · [[testdatensatz]] · [[ueberanpassung]] · [[hyperparameter]]
