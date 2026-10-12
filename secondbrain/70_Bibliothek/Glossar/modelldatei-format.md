---
type: entity/begriff
title: "Modelldatei-Format"
description: "Wie die Gewichte eines Modells als Datei gespeichert werden."
tags:
  - glossar
  - betrieb
verlinken:
  - Modelldatei-Format
  - Modellformat
  - Safetensors
  - GGUF
timestamp: 2026-10-12T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Modelldatei-Format

> Ein Modelldatei-Format legt fest, wie Milliarden Gewichte samt Bauplan in eine Datei geschrieben werden.

Manche Formate sind für das Training gemacht, andere für den Betrieb auf dem eigenen Rechner, oft in verkleinerter Form.

**Ein sicheres Format enthält nur Zahlen, keinen ausführbaren Code.** Ältere Formate konnten beim Laden Programmcode ausführen — ein Risiko bei Dateien aus fremder Quelle.

## Verwandt

[[modellgewichte]] · [[quantisierung]] · [[checkpoint]] · [[lokales-modell]]
