---
type: lesson
title: "Eine Guideline, viele Werkzeuge"
description: "Dein Dokument lebt: Fassungen, ein Änderungsprotokoll und die Frage, wann eine Änderung ins Feste gehört."
tags:
  - lesson
  - kurs-7
  - marke
  - uebung
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 0
dauer_min: 25
uebung: true
---

# Eine Guideline, viele Werkzeuge

> **Übung.** Auch diese Lektion zählt nicht zum Kursstand. Sie ist das
> Handwerk für die Zeit nach dem Kurs: Dein Dokument wird sich ändern, und es
> soll sich dabei nicht in vier Fassungen auflösen.

## Ein Dokument, viele Abnehmer

Seit Lektion 7 liest nicht nur ein ChatBot dein Dokument. Hephaistos in der
Werkstatt bekommt es bei jedem Start, das Cinema Studio bei jeder Anfrage, und
das Paket aus Lektion 6 liegt vielleicht schon bei jemand anderem. Das ist der
Sinn der Sache — **eine Stelle statt vierzig**, wie es auf der Kursseite heißt.

Es hat aber eine Folge, die man erst merkt, wenn es zu spät ist: **Jede
Änderung wirkt überall gleichzeitig.** Ein Wort, das du aus der Verbotsliste
nimmst, darf ab sofort in jedem Text, jedem Clip-Prompt und jeder
Werkstatt-Antwort stehen. Das ist gewollt — aber es soll eine Entscheidung
sein, kein Versehen.

## Drei Regeln für ein lebendes Dokument

1. **Eine Quelle.** Geändert wird nur in Lektion 7 (oder unter Einstellungen ›
   Werkstatt). Nie in einer Kopie, nie direkt im Systemprompt eines
   Werkzeugs: sonst laufen Original und Kopie auseinander, und nach einem
   Monat weiß niemand, welche gilt.
2. **Ein Protokoll.** Jede Änderung bekommt eine Zeile: Datum, was, warum.
   Das Warum ist der wichtigste Teil — es ist das, was du in einem halben
   Jahr vergessen hast.
3. **Eine Gegenprobe.** Nach jeder Änderung an einem festen Feld die Probe aus
   Lektion 8, wenigstens einmal. Eine Regel, die du nicht nachgemessen hast,
   ist eine Absicht.

```aufgabe
id: K7-15
typ: schiebe
titel: "Eine Änderung, sauber"
punkte: 25
frage: "Dir fällt auf, dass das Cinema Studio zu oft „episch“ schreibt. Bring die Schritte in die richtige Reihenfolge."
bausteine:
  - "Gegenprobe mit drei Anfragen"
  - "Das Wort in Lektion 7 auf die Verbotsliste setzen"
  - "Zeile ins Änderungsprotokoll: Datum, was, warum"
  - "Die Werkstatt neu starten"
loesung:
  - "Das Wort in Lektion 7 auf die Verbotsliste setzen"
  - "Zeile ins Änderungsprotokoll: Datum, was, warum"
  - "Die Werkstatt neu starten"
  - "Gegenprobe mit drei Anfragen"
richtzeit_s: 80
hinweise:
  - text: "Hephaistos liest dein Dokument nur beim Start. Was muss also vor der Probe passieren?"
    kostet: 5
erklaerung: |
  Erst an der einen Quelle ändern und den Grund festhalten, dann die
  Werkzeuge die neue Fassung lesen lassen, dann nachmessen. Wer vor dem
  Neustart prüft, prüft die alte Fassung.
```

## Fest oder frei — die Frage kommt wieder

In Lektion 3 hast du die Trennlinie gezogen: was fest sein muss, was frei
bleiben darf. Jede Änderung stellt diese Frage neu. Die Faustregel von dort
gilt weiter: **Fest wird, was ein Fremder sofort als falsch erkennen würde.**
Ein neues Lieblingswort gehört nicht ins Feste. Ein Name, eine Farbe, eine
Anrede, eine Grenze, was du nie tust — schon.

```aufgabe
id: K7-16
typ: plugplay
titel: "Welche Änderung gehört ins Feste?"
punkte: 25
frage: "Wähle die Änderungen, die ins feste Feld gehören. Die übrigen dürfen frei bleiben."
bausteine:
  - "Wir siezen ab jetzt nicht mehr"
  - "Diesen Monat gern Herbstbilder"
  - "Die Akzentfarbe ist jetzt #C8102E"
  - "Mal einen Witz am Ende"
  - "Nie Gesundheitsversprechen"
loesung:
  - "Wir siezen ab jetzt nicht mehr"
  - "Die Akzentfarbe ist jetzt #C8102E"
  - "Nie Gesundheitsversprechen"
richtzeit_s: 70
erklaerung: |
  Anrede, Farbe und eine Grenze würde ein Fremder sofort als Bruch erkennen.
  Herbstbilder und ein Witz sind Spielraum - genau der, den Lektion 3 frei
  lassen wollte.
```

## Das Änderungsprotokoll

Es braucht kein Werkzeug. Eine Notiz mit drei Spalten reicht:

| Datum | Was | Warum |
|---|---|---|
| 19.10. | „episch" verboten | Cinema-Prompts klangen alle nach Trailer |
| 02.11. | Länge 120 → 90 Wörter | Gegenprobe: Kunden lesen nur den Anfang |

Nach einem Jahr ist diese Tabelle wertvoller als das Dokument selbst: Sie
erklärt, **warum** es so ist, wie es ist. Wer es übernimmt — ein Kollege, eine
Agentur, du selbst in zwei Jahren — kann dann entscheiden, statt zu raten.

```aufgabe
id: K7-17
typ: planung
titel: "Deine erste neue Fassung"
punkte: 40
frage: "Nimm dein Prüfprotokoll aus Lektion 8. Schreibe die erste Zeile deines Änderungsprotokolls und begründe, ob die Änderung ins Feste oder ins Freie gehört. Mindestens 40 Wörter."
pruefungen:
  - art: mindestens_woerter
    wert: 40
    punkte: 10
    begruendung: "Mindestens 40 Wörter."
  - art: enthaelt_eines
    werte: [weil, damit, grund, deshalb, darum]
    punkte: 10
    begruendung: "Du nennst den Grund der Änderung."
  - art: enthaelt_eines
    werte: [fest, frei, trennlinie]
    punkte: 10
    begruendung: "Du ordnest die Änderung ein: fest oder frei."
  - art: enthaelt_eines
    werte: [gegenprobe, nachgemessen, geprüft, prüfe, drei anfragen]
    punkte: 10
    begruendung: "Du sagst, wie du die Änderung nachmisst."
richtzeit_s: 600
erklaerung: |
  Damit ist der Kreis geschlossen: beschreiben, einrichten, nachmessen,
  ändern, wieder nachmessen. Das ist kein Kursstoff mehr, das ist die Arbeit
  mit einer Marke - für immer.
```

## Verwandt

- [[10_Stufen/07_Der 7. Kurs/03_lektion_fest-und-frei|Lektion 3]] — die Trennlinie
- [[10_Stufen/07_Der 7. Kurs/08_lektion_die-gegenprobe|Lektion 8]] — die Gegenprobe
