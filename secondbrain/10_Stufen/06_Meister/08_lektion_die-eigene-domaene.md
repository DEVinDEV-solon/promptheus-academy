---
type: lesson
title: "Die eigene Domäne wählen"
description: "Wo du dich auskennst, bist du einem Modell überlegen. Wie du ein Fachgebiet wählst, in dem du Ergebnisse beurteilen kannst — und warum genau das die Abschlussarbeit trägt."
tags:
  - lesson
  - stufe-6
  - projekt
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 6
dauer_min: 15
---

# Die eigene Domäne wählen

## Warum das Fachgebiet zählt

Die Abschlussarbeit dieser Stufe ist ein eigenes Projekt in einer **selbst
gewählten Domäne** — einem Fachgebiet, in dem du dich auskennst. Das ist keine
Formsache. Es ist die Lehre aus allen Stufen davor, zu Ende gedacht:

Ein Modell erfindet plausibel (Stufe 1). Wer das erkennen will, muss
**beurteilen** können, ob ein Ergebnis stimmt (Stufe 2). In einem fremden
Gebiet kannst du das nicht — du siehst nur, dass es gut klingt. In deinem
eigenen Gebiet siehst du sofort, wenn eine Frist falsch ist, ein Begriff schief
sitzt oder ein Schritt fehlt.

> **Dein Fachwissen ist der Prüfer, den kein Modell ersetzt.**

## Was eine gute Domäne ausmacht

| Merkmal | Frage an dich |
|---|---|
| **Du kennst sie** | Würdest du einen Fehler erkennen, ohne nachzuschlagen? |
| **Es gibt wiederkehrende Arbeit** | Gibt es etwas, das jede Woche gleich und mühsam ist? |
| **Es gibt jemanden, der es braucht** | Wer würde deine Lösung benutzen (Lektion 1)? |
| **Die Folgen sind beherrschbar** | Kannst du mit einer Freigabe absichern, was schiefgehen kann? |

Die erste Zeile ist die wichtigste. Ein Projekt im eigenen Verein, Betrieb,
Unterricht oder Hobby schlägt fast immer eines in einem Gebiet, das nur
spannend klingt.

```aufgabe
id: E6-20
typ: denkaufgabe
titel: "Welche Domäne trägt?"
punkte: 25
frage: "Eine Schulsekretärin sucht ein Abschlussprojekt. Welche Wahl passt am besten zu den Merkmalen einer guten Domäne?"
optionen:
  - "Ein Agent, der Aktienkurse vorhersagt"
  - "Ein Ablauf, der Krankmeldungen von Eltern sortiert und der Klassenleitung eine Übersicht schickt"
  - "Ein Chatbot, der medizinische Diagnosen stellt"
  - "Ein Spiel, das sie für ihre Neffen programmiert, obwohl sie Spiele nicht kennt"
loesung: "Ein Ablauf, der Krankmeldungen von Eltern sortiert und der Klassenleitung eine Übersicht schickt"
richtzeit_s: 60
erklaerung: |
  Sie kennt die Krankmeldungen, die Arbeit wiederholt sich täglich, die
  Klassenleitungen brauchen die Übersicht, und mit Datenschutz aus Stufe 5
  sind die Folgen beherrschbar. Aktien und Diagnosen liegen außerhalb ihres
  Fachs - und Diagnosen haben Folgen, die kein Projekt tragen sollte.
```

## Die Fachkurse als Abkürzung

Die Academy hat neben den Stufen **Fachkurse**: Beratung, Buchhaltung,
Bürokratie und Verwaltung, Bürobetrieb, Dienstleistung, Handel, Jura,
Personalverwaltung, Sicherheit und Verkauf. Sie zeigen für ein Gebiet, wo
Automationen typischerweise ansetzen — und wo ihre Grenzen liegen.

Sie ersetzen dein Fachwissen nicht. Aber wenn du in einem dieser Gebiete
arbeitest, liefern sie dir die typischen Abläufe, an denen du dein Projekt
festmachen kannst.

```aufgabe
id: E6-21
typ: uebereinstimmung
titel: "Domäne und Ansatz"
punkte: 30
frage: "Ordne jeder Domäne einen typischen ersten Ansatz zu."
links:
  - "Buchhaltung"
  - "Personalverwaltung"
  - "Handel"
  - "Dienstleistung"
rechts:
  - "Eingehende Belege lesen und Buchungsvorschläge machen"
  - "Bewerbungen vorsortieren — mit menschlicher Entscheidung wegen Artikel 22"
  - "Bestellvorschläge aus Lagerbestand und Verkaufszahlen"
  - "Terminanfragen beantworten und Termine vorschlagen"
loesung:
  "Buchhaltung": "Eingehende Belege lesen und Buchungsvorschläge machen"
  "Personalverwaltung": "Bewerbungen vorsortieren — mit menschlicher Entscheidung wegen Artikel 22"
  "Handel": "Bestellvorschläge aus Lagerbestand und Verkaufszahlen"
  "Dienstleistung": "Terminanfragen beantworten und Termine vorschlagen"
richtzeit_s: 80
erklaerung: |
  Allen gemeinsam: Die Maschine schlägt vor, ein Mensch mit Fachwissen
  entscheidet - besonders dort, wo es um Menschen geht wie bei Bewerbungen.
```

## Von der Domäne zum Projekt

Hast du deine Domäne, ist der nächste Schritt der aus Lektion 1: die drei
Fragen. Nur jetzt mit allem, was du seither gelernt hast. Eine gute
Projektidee lässt sich in einem Satz sagen, der Domäne, Nutzer und Nutzen
nennt:

> *„Für die Klassenleitungen unserer Schule sortiert ein Ablauf jeden Morgen
> die Krankmeldungen und schickt um 7:30 eine Übersicht — damit niemand mehr
> das Postfach durchsuchen muss."*

```aufgabe
id: E6-22
typ: planung
titel: "Deine Domäne"
punkte: 40
frage: "Wähle deine Domäne und begründe die Wahl an den vier Merkmalen. Schließe mit deiner Projektidee in einem Satz, der Nutzer und Nutzen nennt. Mindestens 70 Wörter."
pruefungen:
  - art: mindestens_woerter
    wert: 70
    punkte: 10
    begruendung: "Mindestens 70 Wörter."
  - art: enthaelt_eines
    werte: [kenne, kenne mich aus, arbeite, erfahrung, beruf, jeden tag]
    punkte: 10
    begruendung: "Du sagst, warum du dich in der Domäne auskennst."
  - art: enthaelt_eines
    werte: [jede woche, jeden tag, wiederkehrend, immer wieder, regelmäßig, täglich]
    punkte: 10
    begruendung: "Du nennst die wiederkehrende Arbeit."
  - art: enthaelt_eines
    werte: [für, nutzer, kollegen, kunden, damit]
    punkte: 10
    begruendung: "Du nennst, für wen die Lösung ist."
richtzeit_s: 600
erklaerung: |
  Mit dieser Wahl steht das Fundament der Abschlussarbeit. In der nächsten
  Lektion wird daraus das Projekt - mit allem Handwerk dieser Stufe.
```
