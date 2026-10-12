---
type: entity/begriff
title: "Verlustfunktion (Loss)"
description: "Misst in einer Zahl, wie falsch eine Vorhersage war — die Grösse, die das Training kleiner machen will."
tags:
  - glossar
  - netze
verlinken:
  - Verlustfunktion
  - Verlustfunktionen
  - Loss-Funktion
  - Loss
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Verlustfunktion (Loss)

> Die Verlustfunktion übersetzt „das war daneben" in eine Zahl. Je grösser die Zahl, desto falscher die Antwort.

Training ist im Kern nichts anderes als der Versuch, diese Zahl zu senken. Bei einem Sprachmodell misst sie, wie überrascht das Modell vom tatsächlich nächsten Token war.

**Was die Verlustfunktion nicht misst, lernt das Modell nicht.** Ein Modell, das nur auf „klingt wie der Text im Netz" trainiert wird, lernt genau das — nicht „ist wahr". Diese Lücke zwischen Messgrösse und eigentlichem Ziel ist der Ursprung vieler Überraschungen.

## Verwandt

[[gradientenabstieg]] · [[verlustkurve]] · [[training]] · [[naechstes-token-vorhersage]]
