---
type: lesson
title: "Aufträge verketten"
description: "Wenn die Antwort des einen Auftrags die Eingabe des nächsten ist: wie aus mehreren kleinen Aufträgen ein verlässlicher Ablauf wird — und wo Fehler mitwandern."
tags:
  - lesson
  - stufe-2
  - prompting
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 2
dauer_min: 14
---

# Aufträge verketten

## Vom Zerlegen zum Verketten

In Lektion 2 hast du gelernt, eine zu große Aufgabe zu **zerlegen**. Diese
Lektion geht einen Schritt weiter: Die Teile werden so hintereinander
geschaltet, dass **die Antwort des einen Auftrags die Eingabe des nächsten**
ist. Das nennt man eine Kette (englisch *prompt chaining*).

```
Auftrag 1: „Finde in diesem Text alle Termine.“          → Liste der Termine
Auftrag 2: „Sortiere diese Termine nach Datum.“          → sortierte Liste
Auftrag 3: „Schreib daraus eine freundliche Erinnerung.“ → fertige Nachricht
```

Jeder einzelne Auftrag ist klein und leicht zu prüfen. Zusammen erledigen sie
etwas, das in einem einzigen Auftrag oft danebenginge.

## Warum Ketten besser funktionieren

Denk an Stufe 1: Ein Modell wählt Token für Token. Je mehr es in einem
Durchgang gleichzeitig beachten muss — finden, sortieren, formulieren, Ton
treffen —, desto eher verliert es einen Teil aus dem Blick. In einer Kette
macht jeder Schritt **eine Sache**.

Dazu kommt: Du kannst **zwischen den Schritten prüfen**. Stimmt die Liste der
Termine nicht, merkst du es nach Schritt 1 — nicht erst, wenn die freundliche
Erinnerung schon falsche Daten enthält.

```aufgabe
id: E2-20
typ: schiebe
titel: "Eine sinnvolle Kette"
punkte: 30
frage: "Aus einer langen Elternmail soll eine kurze Antwort der Lehrerin werden. Bring die Kettenglieder in eine sinnvolle Reihenfolge."
bausteine:
  - "Eine Antwort entwerfen, die auf jede Frage eingeht"
  - "Alle Fragen aus der Mail herausschreiben"
  - "Die Antwort auf höchstens 120 Wörter kürzen"
  - "Zu jeder Frage notieren, was die Lehrerin dazu weiß"
loesung:
  - "Alle Fragen aus der Mail herausschreiben"
  - "Zu jeder Frage notieren, was die Lehrerin dazu weiß"
  - "Eine Antwort entwerfen, die auf jede Frage eingeht"
  - "Die Antwort auf höchstens 120 Wörter kürzen"
richtzeit_s: 75
hinweise:
  - text: "Was muss feststehen, bevor man antworten kann?"
    kostet: 5
erklaerung: |
  Erst klären, was gefragt ist, dann was man weiß, dann antworten, dann
  kürzen. Kürzen am Anfang wäre sinnlos - es gäbe noch nichts zu kürzen.
```

## Fehler wandern mit

Ketten haben eine Schwäche, die du kennen musst: **Ein Fehler in einem frühen
Glied wird an alle folgenden weitergegeben** — und wird dabei nicht kleiner,
sondern glaubwürdiger. Erfindet Schritt 1 einen Termin, sortiert Schritt 2 ihn
ordentlich ein, und Schritt 3 formuliert ihn freundlich. Am Ende steht ein
erfundener Termin in einer perfekten Nachricht.

Daraus folgt die wichtigste Regel für Ketten: **Prüfe früh.** Ein Blick nach dem
ersten Glied kostet wenig. Ein Fehler, der bis zum Ende durchrutscht, kostet
viel.

```aufgabe
id: E2-21
typ: denkaufgabe
titel: "Wo prüfen?"
punkte: 25
frage: "Eine Kette hat vier Glieder: Zahlen aus einem Bericht lesen, Summen bilden, Diagrammtext schreiben, Zusammenfassung formulieren. Du kannst nur an einer Stelle prüfen. Wo bringt es am meisten?"
optionen:
  - "Nach dem ersten Glied: Stimmen die gelesenen Zahlen?"
  - "Nach dem dritten Glied: Ist der Diagrammtext schön?"
  - "Nach dem letzten Glied: Liest sich die Zusammenfassung gut?"
  - "Prüfen ist bei Ketten unnötig."
loesung: "Nach dem ersten Glied: Stimmen die gelesenen Zahlen?"
richtzeit_s: 50
erklaerung: |
  Alles Weitere baut auf den gelesenen Zahlen auf. Sind sie falsch, ist alles
  danach falsch - egal wie gut es klingt. Ganz am Ende prüfst du nur noch,
  ob der Fehler hübsch formuliert ist.
```

## Die Kette ist ein Ablauf

Wenn du eine Kette aufschreibst — Schritt 1, dann Schritt 2, dann Schritt 3,
mit einer Prüfung dazwischen —, hast du etwas aufgeschrieben, das in Stufe 3
einen Namen bekommt: einen **Ablauf**. Und wenn eine Maschine die Schritte
ausführt statt du, wird daraus eine Automation. Der Unterschied zwischen einem
guten Prompter und einem Builder ist kleiner, als er klingt.

```aufgabe
id: E2-22
typ: planung
titel: "Deine Kette"
punkte: 40
frage: "Beschreibe eine Kette aus mindestens drei Aufträgen für eine Aufgabe aus deinem Alltag. Sag bei jedem Glied, was hineingeht und was herauskommt, und wo du prüfst. Mindestens 50 Wörter."
pruefungen:
  - art: mindestens_woerter
    wert: 50
    punkte: 10
    begruendung: "Mindestens 50 Wörter."
  - art: enthaelt_eines
    werte: [schritt, glied, auftrag 1, erstens, zuerst]
    punkte: 10
    begruendung: "Du gliederst die Kette in Schritte."
  - art: enthaelt_eines
    werte: [herauskommt, ergebnis, liefert, ausgabe, daraus]
    punkte: 10
    begruendung: "Du sagst, was jedes Glied liefert."
  - art: enthaelt_eines
    werte: [prüfe, prüfen, kontrolliere, nachsehen, überprüfe]
    punkte: 10
    begruendung: "Du legst fest, wo du prüfst."
richtzeit_s: 480
erklaerung: |
  Eingang, Ausgang und eine Prüfung je Glied - wer das für eine Kette
  aufschreiben kann, kann in Stufe 3 einen Ablauf zeichnen.
```
