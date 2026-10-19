---
type: lesson
title: "Umsatz prognostizieren"
description: "Eine gewichtete Pipeline macht aus Hoffnung eine Rechnung: Wert mal Wahrscheinlichkeit je Phase. Das Modell rechnet nicht, aber es liest Risiken aus den Notizen."
tags:
  - lesson
  - domaene
  - dom-vk
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 15
---

# Umsatz prognostizieren

## Die Phasen eines Geschäfts

Aus der Anfrage (Lektion 5) wird vielleicht ein Abschluss, vielleicht nicht.
Dazwischen liegen Phasen, die in fast jedem CRM ähnlich heißen. Zusammen
heißen sie **Pipeline**.

```aufgabe
id: D4-12
typ: schiebe
titel: "Die Pipeline"
punkte: 20
frage: "Bring die Phasen eines Geschäfts in die richtige Reihenfolge."
bausteine:
  - "Verhandlung"
  - "Interessent"
  - "Abschluss"
  - "Angebot"
  - "Erstgespräch"
loesung:
  - "Interessent"
  - "Erstgespräch"
  - "Angebot"
  - "Verhandlung"
  - "Abschluss"
richtzeit_s: 45
erklaerung: |
  Jede Phase hat eine typische Wahrscheinlichkeit, dass am Ende ein
  Abschluss steht. Je weiter hinten, desto höher. Genau damit rechnet die
  gewichtete Prognose.
```

## Gewichtet rechnen

Wer einfach alle offenen Angebote zusammenzählt, prognostiziert Wunschdenken.
Die **gewichtete Pipeline** multipliziert jeden Auftragswert mit der
Wahrscheinlichkeit seiner Phase:

> Prognose = Summe aus (Auftragswert × Wahrscheinlichkeit)

```aufgabe
id: D4-13
typ: mathe
titel: "Die gewichtete Pipeline"
punkte: 30
frage: "Drei offene Geschäfte: 20.000 Euro im Erstgespräch (20 Prozent), 50.000 Euro im Angebot (50 Prozent), 10.000 Euro in der Verhandlung (90 Prozent). Wie hoch ist die gewichtete Prognose?"
loesung: 38000
toleranz: 0
einheit: "Euro"
richtzeit_s: 100
hinweise:
  - text: "Jeden Wert mit seiner Wahrscheinlichkeit malnehmen, dann addieren."
    kostet: 5
erklaerung: |
  4.000 + 25.000 + 9.000 = 38.000 Euro. Die ungewichtete Summe wäre
  80.000 Euro - mehr als doppelt so viel. Eine Planung auf dieser Zahl stellt
  Leute ein, die es nicht bezahlen kann.
```

## Wo das Modell hilft

Ein Modell soll die Prognose nicht rechnen (Stufe 3). Es kann aber etwas, was
die Tabelle nicht kann: **Notizen lesen**. „Kunde wartet auf Budgetfreigabe
im Herbst", „Ansprechpartner hat gekündigt" — solche Sätze stehen in den
Gesprächsnotizen und nie in der Wahrscheinlichkeitsspalte.

```aufgabe
id: D4-14
typ: denkaufgabe
titel: "„Sicher 120.000 Euro“"
punkte: 25
frage: "Das Modell schreibt in seinem Wochenbericht: „Der Umsatz im nächsten Quartal wird sicher 120.000 Euro betragen.“ Was ist die richtige Reaktion?"
optionen:
  - "Die Prognose aus der gewichteten Pipeline rechnen lassen und das Modell nur Risiken aus den Notizen benennen lassen."
  - "Die Zahl übernehmen, das Modell kennt ja alle Daten."
  - "Die Zahl halbieren, um vorsichtig zu sein."
  - "Das Modell bitten, die Zahl noch genauer anzugeben."
loesung: "Die Prognose aus der gewichteten Pipeline rechnen lassen und das Modell nur Risiken aus den Notizen benennen lassen."
richtzeit_s: 60
erklaerung: |
  „Sicher" ist bei einer Prognose ein Warnsignal. Die Zahl kommt aus der
  Rechnung, das Modell liefert die Gründe, warum sie wackeln könnte. So sieht
  die Leitung beides: den Wert und das Risiko.
```
