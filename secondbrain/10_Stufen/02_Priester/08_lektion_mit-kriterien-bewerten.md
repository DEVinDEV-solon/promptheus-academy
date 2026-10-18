---
type: lesson
title: "Mit Kriterien bewerten"
description: "„Gefällt mir“ ist kein Urteil. Wie du vorher festlegst, woran ein Ergebnis gemessen wird — und warum ein Modell als Bewerter nur mit solchen Kriterien taugt."
tags:
  - lesson
  - stufe-2
  - bewertung
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 2
dauer_min: 14
---

# Mit Kriterien bewerten

## Woran merkst du, dass es gut ist?

In Lektion 2 hast du ein Ergebnis beurteilt und gezielt nachgebessert. Dabei
stand eine Frage im Hintergrund, die diese Lektion ausspricht: **Woran misst
du eigentlich, ob ein Ergebnis gut ist?**

Die bequeme Antwort ist „sehe ich doch". Sie hat zwei Probleme. Erstens
urteilst du heute anders als morgen. Zweitens kannst du sie niemandem
erklären — und keinem Modell. Deshalb legt man **vorher** fest, woran
gemessen wird. Eine solche Liste heißt **Bewertungsraster** (oder *Rubrik*).

## Gute Kriterien

Ein gutes Kriterium hat eine Eigenschaft: **Zwei Menschen, die es anwenden,
kommen zum selben Ergebnis.** Du kennst diese Probe aus der Quellenkritik
(Lektion 4) — wer nachprüft, muss dasselbe finden können.

| Schwach | Stark |
|---|---|
| „Gut verständlich" | „Kein Satz länger als 20 Wörter, keine Fachbegriffe ohne Erklärung" |
| „Vollständig" | „Beantwortet alle drei Fragen aus der Mail" |
| „Freundlich" | „Spricht mit Namen an, dankt nicht für Geduld, endet mit einem Angebot" |
| „Richtig" | „Jede Zahl stimmt mit der Quelle überein" |

Du hast diese Unterscheidung schon an den Aufgaben dieser Academy gesehen: Die
Planungsaufgaben prüfen nicht „ist gut", sondern „enthält eine Rolle",
„mindestens 40 Wörter", „nennt ein Format".

```aufgabe
id: E2-23
typ: plugplay
titel: "Welche Kriterien taugen?"
punkte: 30
frage: "Du bewertest Zusammenfassungen von Zeitungsartikeln. Welche Kriterien würden zwei Menschen gleich anwenden?"
bausteine:
  - "Höchstens 80 Wörter"
  - "Wirkt professionell"
  - "Nennt wer, was, wann und wo aus dem Artikel"
  - "Ist interessant geschrieben"
  - "Enthält keine Behauptung, die nicht im Artikel steht"
loesung:
  - "Höchstens 80 Wörter"
  - "Nennt wer, was, wann und wo aus dem Artikel"
  - "Enthält keine Behauptung, die nicht im Artikel steht"
richtzeit_s: 70
erklaerung: |
  Länge, die vier W-Fragen und „nichts Erfundenes" lassen sich nachprüfen.
  „Professionell" und „interessant" sind Eindrücke - sie gehören in ein
  Gespräch, nicht in ein Raster.
```

## Das Modell als Bewerter

Man kann ein Modell bitten, Ergebnisse zu bewerten — auch seine eigenen. Das
ist nützlich, wenn es viele sind. Aber nur unter einer Bedingung: **mit einem
Raster.** „Ist dieser Text gut?" beantwortet ein Modell fast immer mit Ja, und
es lobt bevorzugt Texte, die nach ihm selbst klingen. Das ist der
Bestätigungsfehler aus Lektion 3, eingebaut.

Mit einem Raster wird daraus eine Prüfung:

> Prüfe diese Zusammenfassung gegen drei Kriterien. Antworte für jedes mit
> „erfüllt" oder „nicht erfüllt" und einem Satz Begründung.
> 1. Höchstens 80 Wörter.
> 2. Nennt wer, was, wann und wo.
> 3. Enthält keine Behauptung, die nicht im Artikel steht.

Für Kriterium 1 brauchst du das Modell übrigens nicht — Wörter zählt man
besser selbst (Stufe 1: Ein Modell sieht Tokens).

```aufgabe
id: E2-24
typ: denkaufgabe
titel: "Der freundliche Bewerter"
punkte: 25
frage: "Du fragst ein Modell: „Ist mein Bewerbungsschreiben gut?“ Es antwortet begeistert. Warum ist diese Antwort wenig wert?"
optionen:
  - "Weil Modelle Bewerbungen nicht verstehen"
  - "Weil die Frage keine Kriterien nennt und Modelle zu Zustimmung neigen"
  - "Weil das Modell die Stelle nicht kennt"
  - "Die Antwort ist viel wert, Modelle sind ehrlich"
loesung: "Weil die Frage keine Kriterien nennt und Modelle zu Zustimmung neigen"
richtzeit_s: 50
erklaerung: |
  Ohne Raster bewertet das Modell nach Eindruck, und sein Eindruck ist
  freundlich. Mit Kriterien („Nennt es drei konkrete Erfahrungen? Passt es
  auf eine Seite?") wird aus Lob eine Prüfung.
```

## Erst das Raster, dann der Auftrag

Der eigentliche Trick dieser Lektion ist die Reihenfolge: **Wer das Raster vor
dem Auftrag schreibt, schreibt einen besseren Auftrag.** Denn jedes Kriterium
ist auch eine Anweisung. „Höchstens 80 Wörter" gehört ins Format, „nennt wer,
was, wann, wo" in die Aufgabe. Das Raster und die fünf Bausteine aus Lektion 1
sind zwei Seiten derselben Sache.

```aufgabe
id: E2-25
typ: planung
titel: "Dein Raster"
punkte: 40
frage: "Schreibe ein Bewertungsraster mit mindestens drei nachprüfbaren Kriterien für eine Aufgabe, die du einem Modell geben würdest. Nenne die Aufgabe und bei jedem Kriterium, wie man es prüft. Mindestens 45 Wörter."
pruefungen:
  - art: mindestens_woerter
    wert: 45
    punkte: 10
    begruendung: "Mindestens 45 Wörter."
  - art: enthaelt_eines
    werte: [aufgabe, auftrag, soll]
    punkte: 10
    begruendung: "Du nennst die Aufgabe."
  - art: enthaelt_eines
    werte: [höchstens, mindestens, genau, alle, keine, jede]
    punkte: 10
    begruendung: "Deine Kriterien enthalten nachprüfbare Grenzen."
  - art: enthaelt_eines
    werte: [prüfe, zählen, nachsehen, vergleichen, abgleichen, prüfen]
    punkte: 10
    begruendung: "Du sagst, wie man prüft."
richtzeit_s: 480
erklaerung: |
  Ein Raster mit nachprüfbaren Grenzen ist das Werkzeug, mit dem du in Stufe
  6 Tests schreibst und im 7. Kurs prüfst, ob deine Guideline wirkt. Es
  fängt hier an.
```
