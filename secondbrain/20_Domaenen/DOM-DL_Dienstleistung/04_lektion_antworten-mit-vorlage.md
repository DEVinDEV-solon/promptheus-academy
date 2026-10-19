---
type: lesson
title: "Antworten mit Vorlage"
description: "Textbausteine geben die Sicherheit, das Modell den persönlichen Ton. Mit einem guten Auftrag klingt jede Antwort nach deinem Betrieb und verspricht nichts, was nicht stimmt."
tags:
  - lesson
  - domaene
  - dom-dl
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 14
---

# Antworten mit Vorlage

## Baustein und Formulierung

Die Anfragen sind sortiert (Lektion 3). Jetzt sollen Antworten raus. Zwei
Wege kennst du schon:

- **Textbausteine:** fest, geprüft, immer gleich. Sicher, aber steif.
- **Freier Modelltext:** persönlich und flüssig, aber er kann Dinge
  versprechen, die nicht stimmen.

Der gute Weg verbindet beides. Die **Fakten** kommen aus geprüften Bausteinen
und aus deinem Kalender: Preise, Öffnungszeiten, freie Termine. Das **Modell**
formuliert daraus eine Antwort, die auf die Anfrage eingeht. Neue oder heikle
Fälle sieht ein Mensch, bevor sie rausgehen.

Der Auftrag dafür folgt den fünf Bausteinen aus Stufe 2.

```aufgabe
id: D2-08
typ: uebereinstimmung
titel: "Die fünf Bausteine im Antwortauftrag"
punkte: 25
frage: "Ordne jeden Satz aus dem Auftrag dem Baustein zu, den er erfüllt."
links: [Rolle, Kontext, Aufgabe, Format, Grenze]
rechts:
  - "Du antwortest für die Malerei Schulz, freundlich und per Sie."
  - "Freie Termine diese Woche: Dienstag 10 Uhr, Donnerstag 14 Uhr."
  - "Beantworte die Terminanfrage unten und biete die freien Termine an."
  - "Höchstens fünf Sätze, am Ende Gruß und Telefonnummer."
  - "Nenne keine Preise und sag keine Termine zu, die nicht in der Liste stehen."
loesung:
  Rolle: "Du antwortest für die Malerei Schulz, freundlich und per Sie."
  Kontext: "Freie Termine diese Woche: Dienstag 10 Uhr, Donnerstag 14 Uhr."
  Aufgabe: "Beantworte die Terminanfrage unten und biete die freien Termine an."
  Format: "Höchstens fünf Sätze, am Ende Gruß und Telefonnummer."
  Grenze: "Nenne keine Preise und sag keine Termine zu, die nicht in der Liste stehen."
richtzeit_s: 90
erklaerung: |
  Die Grenze ist der wichtigste Baustein, wenn ein Modell im Namen deines
  Betriebs schreibt. Ohne sie bietet es freundlich einen Freitagstermin an,
  den es gar nicht gibt.
```

## Dein Auftrag

```aufgabe
id: D2-09
typ: planung
titel: "Ein Auftrag für Antwortentwürfe"
punkte: 40
frage: "Schreibe einen Auftrag an ein Modell, das Antwortentwürfe auf Anfragen an deinen Betrieb vorbereitet. Nenne die Rolle mit Ton, woher die Fakten kommen, das Format und eine Grenze, was nie zugesagt wird. Mindestens 50 Wörter."
pruefungen:
  - art: mindestens_woerter
    wert: 50
    punkte: 10
    begruendung: "Mindestens 50 Wörter."
  - art: enthaelt_eines
    werte: [du antwortest, du schreibst, rolle, im namen, für den betrieb, für die firma, für unser]
    punkte: 10
    begruendung: "Du legst die Rolle fest."
  - art: enthaelt_eines
    werte: [kalender, preisliste, baustein, liste, fakten, termine]
    punkte: 10
    begruendung: "Du sagst, woher die Fakten kommen."
  - art: enthaelt_eines
    werte: [keine, nie, nicht zusagen, nicht versprechen, keine preise, nur]
    punkte: 10
    begruendung: "Du setzt eine Grenze."
richtzeit_s: 360
erklaerung: |
  Rolle und Ton machen die Antwort zu deiner, Fakten aus Kalender und
  Preisliste machen sie richtig, die Grenze schützt vor Zusagen, die du nicht
  halten kannst. Ein Mensch, der neue Fälle vor dem Senden liest, macht den
  Rest.
```
