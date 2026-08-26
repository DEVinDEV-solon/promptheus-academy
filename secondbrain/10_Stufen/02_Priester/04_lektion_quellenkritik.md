---
type: lesson
title: "Quellenkritik: einer Behauptung nachgehen"
description: "Primärquelle statt Weitergabe — und die drei Formen, in denen falsche Information auftritt."
tags:
  - lesson
  - stufe-2
  - quellenkritik
timestamp: 2026-08-18T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 2
dauer_min: 15
---

# Quellenkritik

## Die Regel

> **Geh zur Primärquelle.**

Eine Primärquelle ist die Stelle, an der eine Aussage **zuerst** steht: die
Studie selbst, nicht der Artikel darüber; das Gerichtsurteil, nicht die
Meldung; der Originalbeitrag, nicht der Kanal, der ihn weiterreicht.

Diese Regel ist älter als jede KI. Sie ist durch KI nur dringender geworden,
weil das Weiterreichen jetzt nichts mehr kostet.

## Ein Beispiel, das aus der Praxis stammt

Im Wissensspeicher `47_Anons` werden Beiträge aus Netzwerken untersucht. Dort
steht ein Befund, der genau hierher gehört: **HTML-Seiten, die solche Beiträge
sammeln, vermischen den Beitrag mit dem, worauf er antwortet.** Wer die
Sammelseite abschreibt, schreibt zwei Beiträge als einen ab — und die Aussage
verändert sich.

Deshalb wird dort ausschließlich die maschinenlesbare Schnittstelle benutzt,
nicht die Anzeige-Seite. Das ist Quellenkritik in ihrer technischen Form: **die
Auslieferung einer Quelle ist selbst schon eine Bearbeitung.**

```aufgabe
id: E2-11
typ: schiebe
titel: "Der Weg zur Quelle"
punkte: 30
frage: "Ordne die Schritte: Du siehst eine erstaunliche Zahl in einem Kurzvideo."
bausteine:
  - "Ich lese die Originalstelle und pruefe, ob die Zahl so darin steht"
  - "Ich sehe eine erstaunliche Zahl in einem Video"
  - "Ich suche die Studie oder Statistik, auf die es sich beruft"
  - "Ich frage mich, woher diese Zahl stammt"
  - "Ich pruefe, worauf sich die Zahl genau bezieht - Zeitraum, Ort, Gruppe"
loesung:
  - "Ich sehe eine erstaunliche Zahl in einem Video"
  - "Ich frage mich, woher diese Zahl stammt"
  - "Ich suche die Studie oder Statistik, auf die es sich beruft"
  - "Ich lese die Originalstelle und pruefe, ob die Zahl so darin steht"
  - "Ich pruefe, worauf sich die Zahl genau bezieht - Zeitraum, Ort, Gruppe"
richtzeit_s: 110
hinweise:
  - text: "Der letzte Schritt ist der, den fast alle weglassen — er kommt NACH dem Lesen."
    kostet: 7
erklaerung: |
  Der letzte Schritt entlarvt die häufigste Irreführung: die Zahl stimmt,
  aber sie gilt für einen anderen Zeitraum, ein anderes Land oder eine
  andere Gruppe.
```

## Drei Formen, ein Anschein

Aus der Taxonomie in `47_Anons`:

| Form | Absicht | Wahrheitsgehalt |
|---|---|---|
| **Misinformation** | keine Schädigungsabsicht | falsch |
| **Desinformation** | Schädigungsabsicht | falsch oder irreführend |
| **Malinformation** | Schädigungsabsicht | **zutreffend**, aber aus dem Zusammenhang gerissen |

Die dritte Zeile ist die, die man kennen muss. **Malinformation ist wahr.**
Jede einzelne Angabe stimmt, und trotzdem entsteht ein falsches Bild — weil der
Zusammenhang fehlt.

Ein Faktencheck, der nur prüft, ob die Angaben stimmen, findet Malinformation
nicht. Die Frage muss lauten: *Was fehlt?*

Die häufigste Technik dabei heißt **Kontextentzug** — echtes Material, falscher
Zusammenhang. Kein einziger erfundener Satz nötig.

```aufgabe
id: E2-12
typ: uebereinstimmung
titel: "Drei Formen"
punkte: 30
frage: "Ordne jedem Fall die Form zu."
links:
  - "Jemand teilt eine veraltete Zahl, weil er sie für aktuell hält"
  - "Jemand erfindet ein Zitat, um jemandem zu schaden"
  - "Jemand veröffentlicht ein echtes Foto ohne Ort und Datum, um es umzudeuten"
rechts: [Misinformation, Desinformation, Malinformation]
loesung:
  "Jemand teilt eine veraltete Zahl, weil er sie für aktuell hält": "Misinformation"
  "Jemand erfindet ein Zitat, um jemandem zu schaden": "Desinformation"
  "Jemand veröffentlicht ein echtes Foto ohne Ort und Datum, um es umzudeuten": "Malinformation"
richtzeit_s: 100
hinweise:
  - text: "Zwei Merkmale entscheiden: stimmt es, und war Schaden beabsichtigt?"
    kostet: 7
erklaerung: |
  Der dritte Fall ist der schwierigste, weil nichts daran falsch ist. Genau
  deshalb kommt er am häufigsten vor - er ist mit einem Faktencheck nicht
  zu widerlegen.
quelle: "[[90_Quellen/anons/desinformation-taxonomie-index]]"
```

## Was das mit KI zu tun hat

Drei Dinge, und alle drei sind unangenehm konkret:

**Ein Modell nennt dir Quellen, die es nicht gibt.** Steht in Stufe 1. Eine
Quellenangabe von einer KI ist ein Vorschlag, wo du suchen könntest — kein Beleg.

**Ein Modell gibt dir wieder, was oft geschrieben wurde.** Nicht, was stimmt.
Bei einem verbreiteten Irrtum bekommst du den Irrtum, weil er häufiger
vorkommt als die Richtigstellung.

**Ein Modell macht Kontextentzug mühelos.** Zusammenfassen heißt weglassen.
Beim Weglassen verschwindet regelmäßig genau das, was die Aussage einordnet —
und das Modell weiß nicht, dass es wichtig war.

```aufgabe
id: E2-13
typ: planung
titel: "Deine Prüfkette"
punkte: 50
frage: "Ein Modell behauptet: „Studien zeigen, dass Methode X die Fehlerquote um 40 % senkt.“ Beschreibe in mindestens 45 Wörtern, wie du dieser Behauptung nachgehst."
pruefungen:
  - art: enthaelt_eines
    werte: [primärquelle, originalstudie, studie selbst, quelle selbst, original]
    punkte: 15
    begruendung: "Du gehst zur Primärquelle, nicht zu einem Artikel darüber."
  - art: enthaelt_eines
    werte: [im vergleich, verglichen, wozu, gegenüber, ausgangswert, basis, bezug]
    punkte: 15
    begruendung: "Du fragst, WOMIT verglichen wurde — „40 % besser“ ohne Bezug sagt nichts."
  - art: mindestens_woerter
    wert: 45
    punkte: 10
    begruendung: "Mindestens 45 Wörter."
  - art: enthaelt_nicht
    werte: ["frage das modell noch einmal", "nachfragen beim modell", "das modell bestätigen lassen"]
    punkte: 10
    begruendung: "Du lässt die Behauptung NICHT vom selben Modell bestätigen — es bestätigt dich systematisch."
richtzeit_s: 360
hinweise:
  - text: "Zwei Dinge fehlen in der Behauptung völlig: welche Studien — und 40 % im Vergleich wozu?"
    kostet: 10
erklaerung: |
  "Senkt um 40 %" ist ohne Bezugsgröße bedeutungslos. Von 50 auf 30 Prozent?
  Von 0,5 auf 0,3 Promille? Beides wäre "40 % weniger" und beides hiesse
  etwas völlig anderes. Diese eine Frage entlarvt die meisten Zahlen.
```
