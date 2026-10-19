---
type: entity/begriff
title: "Epoche"
description: "Ein kompletter Durchgang durch alle Trainingsdaten."
tags:
  - glossar
  - netze
verlinken:
  - Epoche
  - Epochen
  - Trainingsepoche
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Epoche

> Eine Epoche ist vorbei, wenn das Modell jedes Trainingsbeispiel einmal gesehen hat.

Kleinere Modelle werden oft viele Epochen lang trainiert — dieselben Bilder zehn- oder hundertmal. Grosse Sprachmodelle dagegen sehen den grössten Teil ihrer Texte nur ein einziges Mal, weil es so viele davon gibt.

**Mehr Epochen sind nicht immer besser.** Wer dieselben Beispiele zu oft zeigt, bringt dem Modell bei, sie auswendig zu kennen, statt das Muster dahinter zu verstehen. Deshalb beobachtet man während des Trainings einen Validierungsdatensatz und hört rechtzeitig auf.

## Verwandt

[[batch]] · [[trainingsdatensatz]] · [[ueberanpassung]] · [[trainingslauf]]
