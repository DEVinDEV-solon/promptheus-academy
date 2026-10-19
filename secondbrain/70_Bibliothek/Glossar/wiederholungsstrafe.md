---
type: entity/begriff
title: "Wiederholungsstrafe"
description: "Eine Einstellung gegen Endlosschleifen und ständig wiederkehrende Wörter."
tags:
  - glossar
  - denken
verlinken:
  - Wiederholungsstrafe
  - Repetition Penalty
  - Frequency Penalty
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Wiederholungsstrafe

> Die Wiederholungsstrafe macht Token, die schon vorkamen, beim nächsten Ziehen etwas unwahrscheinlicher.

Ohne sie verfangen sich besonders kleine Modelle gern in Schleifen und schreiben denselben Satz immer wieder.

Zu stark eingestellt, verbietet sie aber auch sinnvolle Wiederholungen — Namen, Fachbegriffe, Zahlen.

Dann weicht das Modell auf Umschreibungen aus, und aus „Photosynthese“ wird beim dritten Mal „der grüne Umwandlungsvorgang“. Für Fachtexte ist eine sanfte Einstellung deshalb meist besser.

## Verwandt

[[sampling]] · [[greedy-decoding]]
