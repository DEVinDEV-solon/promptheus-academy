---
type: lesson
title: "Ein eigener Bestellablauf"
description: "Alles aus diesem Kurs an einem Stück: ein Ablauf, der Bestellungen vorbereitet — mit sauberen Daten, fester Rechnung, Leitplanken und Freigabe."
tags:
  - lesson
  - domaene
  - dom-hdl
  - projekt
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 30
---

# Ein eigener Bestellablauf

## Alles an einem Stück

Du bist den Weg einer Ware einmal ganz gegangen. Jetzt setzt du ihn zu einem
Ablauf zusammen, der jede Woche läuft und dir die Arbeit vorbereitet, ohne dir
die Entscheidung abzunehmen.

| Frage | aus Lektion |
|---|---|
| Welche Daten braucht der Ablauf, und wie werden Fehlbestände markiert? | 2 — Daten aus Kasse und Lager |
| Wie entsteht die Prognose, und welche Wochen zählen nicht? | 3 — Absatz vorhersagen |
| Wie rechnet die Regel Meldebestand und Bestellmenge? | 4 — Bestellvorschläge |
| Welche Leitplanken gelten für Preise? | 5 — Preise bilden |
| Was darf ein Modell schreiben, was muss geprüft werden? | 6 — Produkttexte |
| Was lernt der Einkauf aus den Retouren? | 7 — Retouren und Reklamationen |
| Welche Daten bleiben im Haus? | 8 — Einkauf und Lieferanten |
| Wer gibt frei? | 1 und 4 |

```aufgabe
id: D1-22
typ: multitask
titel: "Der Wochenablauf für ein Getränkelager"
punkte: 50
frage: "Ein Getränkehändler will jeden Montag Bestellvorschläge für 300 Artikel. Plane den Ablauf in zwei Schritten."
schritte:
  - typ: schiebe
    titel: "Die Reihenfolge"
    punkte: 20
    frage: "Bring die Schritte des Montagsablaufs in die richtige Reihenfolge."
    bausteine:
      - "Disponent prüft die Vorschläge und gibt sie frei"
      - "Fehlbestände und Aktionswochen in den Verkaufsdaten markieren"
      - "Verkaufsdaten der letzten Wochen aus der Kasse lesen"
      - "Regel rechnet Prognose, Meldebestand und Bestellmenge"
      - "Freigegebene Bestellungen an die Lieferanten senden"
    loesung:
      - "Verkaufsdaten der letzten Wochen aus der Kasse lesen"
      - "Fehlbestände und Aktionswochen in den Verkaufsdaten markieren"
      - "Regel rechnet Prognose, Meldebestand und Bestellmenge"
      - "Disponent prüft die Vorschläge und gibt sie frei"
      - "Freigegebene Bestellungen an die Lieferanten senden"
  - typ: quizkarten
    titel: "Wer macht was?"
    punkte: 30
    frage: "Wer übernimmt diesen Teil im Ablauf?"
    karten:
      - "Bestellmengen auf volle Kisten aufrunden"
      - "Ein Hitzewellen-Wochenende in die Prognose einplanen"
      - "Eine Notiz schreiben, warum ein Artikel diese Woche auffällig ist"
      - "Eine Bestellung über 5.000 Euro freigeben"
    stapel: [Regel, Modell, Mensch]
    loesung:
      "Bestellmengen auf volle Kisten aufrunden": Regel
      "Ein Hitzewellen-Wochenende in die Prognose einplanen": Mensch
      "Eine Notiz schreiben, warum ein Artikel diese Woche auffällig ist": Modell
      "Eine Bestellung über 5.000 Euro freigeben": Mensch
richtzeit_s: 240
erklaerung: |
  Lesen, markieren, rechnen, freigeben, senden. Die Regel rechnet, das Modell
  formuliert Auffälligkeiten, der Mensch bringt Wissen ein, das in keiner
  Tabelle steht - wie die Hitzewelle - und gibt frei.
```

## Dein Ablauf

```aufgabe
id: D1-23
typ: planung
titel: "Dein Bauplan für einen Bestellablauf"
punkte: 60
frage: "Beschreibe einen Bestellablauf für ein Geschäft aus deinem Umfeld. Beantworte die Fragen aus der Tabelle: Daten und Fehlbestände, Prognose, Rechnung durch die Regel, Leitplanken, welche Daten im Haus bleiben, und wer freigibt. Mindestens 120 Wörter."
pruefungen:
  - art: mindestens_woerter
    wert: 120
    punkte: 10
    begruendung: "Mindestens 120 Wörter."
  - art: enthaelt_eines
    werte: [kasse, abverkauf, verkaufsdaten, bestand, warenwirtschaft]
    punkte: 10
    begruendung: "Du nennst die Datenquellen."
  - art: enthaelt_eines
    werte: [fehlbestand, ausreißer, aktion, markier]
    punkte: 10
    begruendung: "Du sagst, welche Wochen markiert werden."
  - art: enthaelt_alle
    werte: [regel, meldebestand]
    punkte: 10
    begruendung: "Du sagst, dass eine Regel den Meldebestand rechnet."
  - art: enthaelt_eines
    werte: [vertraulich, geschäftsgeheimnis, im haus, firmenwerkzeug, datenschutz, konditionen]
    punkte: 10
    begruendung: "Du sagst, welche Daten im Haus bleiben."
  - art: enthaelt_eines
    werte: [freigabe, freigeben, gibt frei, prüft, mensch]
    punkte: 10
    begruendung: "Du legst fest, wer freigibt."
richtzeit_s: 900
erklaerung: |
  Wenn du diese Fragen für ein echtes Geschäft beantworten kannst, hast du den
  Kurs verstanden: saubere Daten, eine feste Rechnung, ein Modell für die
  Sprache und ein Mensch, der die Bestellung verantwortet.
```
