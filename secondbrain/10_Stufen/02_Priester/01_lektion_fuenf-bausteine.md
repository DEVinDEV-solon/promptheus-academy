---
type: lesson
title: "Die fünf Bausteine eines Auftrags"
description: "Rolle, Aufgabe, Kontext, Format, Beispiel — und warum die Reihenfolge nicht egal ist."
tags:
  - lesson
  - stufe-2
  - prompting
timestamp: 2026-08-18T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 2
dauer_min: 15
---

# Die fünf Bausteine eines Auftrags

## Warum „schreib mir was über Hunde" nicht funktioniert

Weil es nichts festlegt. Das Modell zieht das Wahrscheinlichste — und das
Wahrscheinlichste nach einem vagen Auftrag ist ein vager Text.

Denk an Lektion 3 aus Stufe 1: bei hoher Wahlfreiheit gibt es viele mögliche
Fortsetzungen, und du bekommst irgendeine davon. **Ein guter Prompt ist einer,
der die Wahlfreiheit dort einschränkt, wo sie dir schadet, und dort lässt, wo
du sie brauchst.**

## Die fünf Bausteine

| Baustein | Frage | Beispiel |
|---|---|---|
| **Rolle** | Wer spricht? | „Du bist Tierärztin." |
| **Aufgabe** | Was soll getan werden? | „Erkläre, woran man Zahnschmerzen beim Hund erkennt." |
| **Kontext** | Für wen, unter welchen Umständen? | „Für ein Kind von zehn Jahren." |
| **Format** | Wie soll die Antwort aussehen? | „Fünf Stichpunkte, je höchstens ein Satz." |
| **Beispiel** | Wie sieht gut aus? | „Zum Beispiel: — Er kaut nur noch auf einer Seite." |

Nicht jeder Auftrag braucht alle fünf. Aber wenn ein Ergebnis danebengeht,
fehlt fast immer einer davon — und meistens **Format** oder **Kontext**.

```aufgabe
id: E2-01
typ: schiebe
titel: "Bring den Auftrag in Ordnung"
punkte: 30
frage: "Ordne die fünf Bausteine so, wie sie in einem Prompt sinnvoll aufeinanderfolgen."
bausteine: [format, kontext, rolle, beispiel, aufgabe]
loesung: [rolle, aufgabe, kontext, format, beispiel]
richtzeit_s: 90
hinweise:
  - text: "Womit fängt ein Auftrag an — wer soll sprechen?"
    kostet: 5
  - text: "Das Beispiel steht am Ende: es zeigt, wie das fertige Ergebnis aussieht."
    kostet: 8
erklaerung: |
  Erst die Rolle, dann der Auftrag. Kontext und Format präzisieren ihn, das
  Beispiel zeigt die Zielform. Die Reihenfolge ist keine Vorschrift, aber sie
  hilft: du merkst beim Schreiben, was du vergessen hast.
```

## Der Unterschied in der Praxis

**Vorher**

> Schreib mir was über Hunde.

**Nachher**

> Du bist Tierärztin. Erkläre, woran man erkennt, dass ein Hund Zahnschmerzen
> hat. Die Erklärung ist für ein Kind von zehn Jahren, das den Hund der Familie
> beobachtet. Fünf Stichpunkte, je höchstens ein Satz, ohne Fachbegriffe.

Der zweite Auftrag ist nicht schöner. Er ist **enger** — und deshalb bekommst
du zweimal hintereinander etwas Brauchbares statt einmal zufällig.

## Was nicht funktioniert

**Höflichkeit.** „Bitte" und „danke" ändern nichts an der Vorhersage. Sie
schaden auch nicht — schreib, wie du willst.

**Beschwörungen.** „Denke sehr sorgfältig nach", „das ist sehr wichtig für
meine Karriere", „du bist ein Weltklasse-Experte". Das sind Anekdoten, keine
Verfahren. Was messbar hilft, ist **konkret sagen, was du willst**.

**Drohungen und Bitten.** Ein Modell hat nichts zu verlieren und nichts zu
gewinnen.

```aufgabe
id: E2-02
typ: denkaufgabe
titel: "Was fehlt hier?"
punkte: 25
frage: "„Du bist Historiker. Fasse die Ursachen des Ersten Weltkriegs zusammen.“ — Welcher Baustein fehlt am dringendsten?"
optionen:
  - "Die Rolle"
  - "Die Aufgabe"
  - "Das Format — es ist offen, ob drei Sätze oder zehn Seiten gemeint sind"
  - "Es fehlt nichts, der Auftrag ist vollständig"
loesung: "Das Format — es ist offen, ob drei Sätze oder zehn Seiten gemeint sind"
richtzeit_s: 60
hinweise:
  - text: "Rolle und Aufgabe stehen da. Geh die restlichen drei Bausteine durch."
    kostet: 5
erklaerung: |
  Ohne Format ist die Antwortlänge geraten. Der Kontext fehlt auch (für wen?),
  aber das Format fällt zuerst auf: du bekommst entweder zu wenig oder eine
  Textwand.
```

## Ein Beispiel ist stärker als drei Erklärungen

Wenn du eine bestimmte Form willst, **zeig sie**. Ein einziges Beispiel ist
meist wirksamer als drei Sätze Beschreibung.

```
Wandle die Sätze in Stichpunkte um.

Beispiel:
  Eingabe: "Der Hund frisst weniger als sonst."
  Ausgabe: "— frisst weniger"

Jetzt du:
  Eingabe: "Er kaut auffällig oft auf nur einer Seite."
```

Das nennt man **Few-Shot**: ein paar Beispiele mitgeben. Es funktioniert genau
deshalb, weil ein Modell Fortsetzungen vorhersagt — du hast ihm ein Muster
gezeigt, das es fortsetzen kann.

```aufgabe
id: E2-03
typ: multitask
titel: "Einen Auftrag reparieren"
punkte: 45
frage: "Der Auftrag „Mach mir eine Zusammenfassung“ liefert unbrauchbare Ergebnisse. Repariere ihn in zwei Schritten."
schritte:
  - typ: denkaufgabe
    titel: "Woran liegt es?"
    punkte: 15
    frage: "Was ist das Hauptproblem an „Mach mir eine Zusammenfassung“?"
    optionen:
      - "Es fehlt die Höflichkeitsform."
      - "Es ist unklar, wovon, für wen und wie lang."
      - "Das Wort Zusammenfassung versteht ein Modell nicht."
      - "Der Auftrag ist zu lang."
    loesung: "Es ist unklar, wovon, für wen und wie lang."
  - typ: planung
    titel: "Schreib ihn neu"
    punkte: 30
    frage: "Schreibe den Auftrag neu. Er soll mindestens drei der fünf Bausteine enthalten und mindestens 25 Wörter haben."
    pruefungen:
      - art: mindestens_woerter
        wert: 25
        punkte: 10
        begruendung: "Mindestens 25 Wörter."
      - art: enthaelt_eines
        werte: [satz, stichpunkt, absatz, wörter, zeichen, tabelle, liste]
        punkte: 10
        begruendung: "Du legst ein Format fest — Länge oder Form der Antwort."
      - art: enthaelt_eines
        werte: [für, zielgruppe, leser, publikum, kind, schüler, kollege, laie]
        punkte: 10
        begruendung: "Du sagst, für wen die Zusammenfassung ist."
richtzeit_s: 300
erklaerung: |
  Format und Kontext sind die beiden Bausteine, die am häufigsten fehlen -
  und deren Fehlen man dem Ergebnis sofort ansieht.
```
