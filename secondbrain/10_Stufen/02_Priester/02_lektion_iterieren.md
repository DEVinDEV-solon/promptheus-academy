---
type: lesson
title: "Iterieren: warum der erste Versuch selten sitzt"
description: "Ein Ergebnis beurteilen, die Ursache benennen und gezielt nachbessern — statt blind zu wiederholen."
tags:
  - lesson
  - stufe-2
  - prompting
  - iteration
timestamp: 2026-08-18T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 2
dauer_min: 14
---

# Iterieren

## Der häufigste Fehler

Das Ergebnis passt nicht. Was tun die meisten? Sie drücken **noch einmal**.

Manchmal hilft das — wegen der Ziehung aus Lektion 3, Stufe 1. Meistens
kommt dasselbe Problem in anderen Worten, denn die Ursache liegt im Auftrag,
und der hat sich nicht geändert.

**Iterieren heißt nicht wiederholen. Es heißt: benennen, was fehlt, und genau
das ergänzen.**

## Drei Fragen an ein misslungenes Ergebnis

| Frage | Wenn ja, fehlt … |
|---|---|
| Ist es **zu allgemein**? | Kontext — für wen, in welcher Lage |
| Hat es die **falsche Form**? | Format — Länge, Aufbau, Aufzählung oder Fließtext |
| Ist es **inhaltlich falsch**? | eine Quelle, oder die Aufgabe war zu groß |

Die dritte Zeile ist die wichtigste und wird am liebsten übersehen. Wenn ein
Modell etwas erfindet, ist das kein Prompt-Problem, das sich mit einer besseren
Formulierung lösen ließe. **Dann brauchst du entweder eine Quelle im Auftrag
oder eine Prüfung danach.**

```aufgabe
id: E2-04
typ: uebereinstimmung
titel: "Fehler und Ursache"
punkte: 30
frage: "Ordne jedem Problem den Baustein zu, der fehlt."
links: ["zu allgemein", "falsche Länge", "erfundene Jahreszahl", "falsche Ansprache"]
rechts:
  - "Kontext"
  - "Format"
  - "eine Quelle im Auftrag oder eine Prüfung danach"
  - "Rolle"
loesung:
  "zu allgemein": "Kontext"
  "falsche Länge": "Format"
  "erfundene Jahreszahl": "eine Quelle im Auftrag oder eine Prüfung danach"
  "falsche Ansprache": "Rolle"
richtzeit_s: 90
hinweise:
  - text: "Bei der erfundenen Jahreszahl hilft kein besserer Prompt. Warum nicht?"
    kostet: 7
erklaerung: |
  Drei der vier Fälle sind Prompt-Probleme. Der vierte ist keins - eine
  erfundene Jahreszahl entsteht aus dem Vorhersageverfahren selbst und lässt
  sich nicht wegformulieren.
```

## Die Aufgabe zerlegen

Manche Aufträge sind zu groß für einen Durchgang. Das erkennst du daran, dass
das Ergebnis überall ein bisschen und nirgends richtig stimmt.

Statt:

> Schreib mir einen kompletten Geschäftsplan für einen Fahrradladen.

Besser in Schritten:

1. „Nenne die zehn Fragen, die ein Geschäftsplan für einen Fahrradladen
   beantworten muss."
2. „Beantworte Frage 3 ausführlich. Hier sind meine Zahlen: …"
3. „Prüfe diese Antwort auf Annahmen, die ich noch belegen muss."

Schritt 3 ist der, den fast alle weglassen — und der am meisten bringt.

**Warum das funktioniert:** jeder Schritt hat weniger Wahlfreiheit als der
große Auftrag. Und du siehst nach jedem Schritt, ob es noch stimmt, statt am
Ende eine Textwand zu haben, die du nicht mehr prüfen kannst.

```aufgabe
id: E2-05
typ: denkaufgabe
titel: "Zu groß?"
punkte: 20
frage: "Woran erkennst du, dass ein Auftrag für einen Durchgang zu groß war?"
mehrfach: true
optionen:
  - "Das Ergebnis stimmt überall ein bisschen und nirgends genau."
  - "Das Ergebnis ist zu lang zum Prüfen."
  - "Das Modell hat lange gebraucht."
  - "Die Antwort enthält viele Fachbegriffe."
loesung:
  - "Das Ergebnis stimmt überall ein bisschen und nirgends genau."
  - "Das Ergebnis ist zu lang zum Prüfen."
richtzeit_s: 60
erklaerung: |
  Rechenzeit und Fachbegriffe sagen nichts über den Zuschnitt. Das
  verlässliche Zeichen ist Oberflächlichkeit über die ganze Breite -
  und ein Ergebnis, das zu lang ist, um es noch zu prüfen.
```

## Das Modell gegen sich selbst

Ein Ergebnis prüfen zu lassen, ist oft wirksamer, als es besser erzeugen zu
wollen:

> Hier ist ein Text. Nenne alle Behauptungen darin, die eine Quelle bräuchten.
> Bewerte nicht, ob sie stimmen — liste nur auf, was belegt werden müsste.

Das funktioniert erstaunlich gut, und der Grund ist wieder derselbe:
**Auflisten hat weniger Wahlfreiheit als Beurteilen.** Die zweite Aufgabe
verführt zum Erfinden, die erste kaum.

Aber Vorsicht — es hat eine harte Grenze: **das Modell erkennt seine eigenen
Erfindungen nicht zuverlässig.** Es kann sagen, welche Sätze *aussehen*, als
bräuchten sie einen Beleg. Ob der Beleg existiert, weiß es nicht.

```aufgabe
id: E2-06
typ: planung
titel: "Drei Runden"
punkte: 45
frage: "Du sollst eine Bewerbung für ein Praktikum schreiben lassen. Beschreibe in mindestens 40 Wörtern drei Schritte: erster Auftrag, was du am Ergebnis prüfst, und wie du nachbesserst."
pruefungen:
  - art: reihenfolge
    werte: [erst, dann]
    punkte: 10
    begruendung: "Deine Schritte kommen in einer erkennbaren Reihenfolge."
  - art: enthaelt_eines
    werte: [prüf, kontrollier, lese, durchgeh, schau]
    punkte: 15
    begruendung: "Du prüfst das Ergebnis, statt es ungesehen zu übernehmen."
  - art: mindestens_woerter
    wert: 40
    punkte: 10
    begruendung: "Mindestens 40 Wörter."
  - art: enthaelt_eines
    werte: [format, länge, stichpunkt, absatz, seite, kontext, stelle, firma, unternehmen]
    punkte: 10
    begruendung: "Du nennst mindestens einen konkreten Baustein — Format oder Kontext."
richtzeit_s: 300
hinweise:
  - text: "Benutze die Wörter „erst“ und „dann“, damit deine Reihenfolge erkennbar wird."
    kostet: 8
erklaerung: |
  Der zweite Schritt - prüfen - ist der, der über die Qualität entscheidet.
  Eine Bewerbung, die niemand gelesen hat, bevor sie rausging, erkennt jeder
  Personalverantwortliche.
```
