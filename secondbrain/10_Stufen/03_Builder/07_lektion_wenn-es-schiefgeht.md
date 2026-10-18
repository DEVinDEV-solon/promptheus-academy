---
type: lesson
title: "Wenn es schiefgeht"
description: "Wiederholen, abbrechen oder einen Menschen fragen: was ein Ablauf tun soll, wenn das Unerwartete kommt."
tags:
  - lesson
  - stufe-3
  - automation
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 3
dauer_min: 15
---

# Wenn es schiefgeht

## Das Versprechen dieser Stufe

Auf der Kursseite steht, was du nach Stufe 3 kannst: einen Ablauf
beschreiben, der ohne dich läuft — **und sagen, an welcher Stelle er
scheitert, wenn etwas Unerwartetes kommt.** Die zweite Hälfte ist die
schwierigere. Diese Lektion ist für sie da.

Ein Ablauf, der ohne dich läuft, hat niemanden, der zusieht. Was er im
Fehlerfall tut, musst du **vorher** festlegen.

## Drei Antworten auf einen Fehler

| Antwort | Wann sie passt | Beispiel |
|---|---|---|
| **Wiederholen** | Der Fehler ist vorübergehend | Der Server antwortet nicht — in einer Minute nochmal |
| **Abbrechen und melden** | Der Fehler bleibt, egal wie oft | Die Datei ist kaputt |
| **Einen Menschen fragen** | Die Entscheidung ist zu folgenreich | Das Modell ist unsicher, ob eine Zahlung freigegeben wird |

Die vierte Antwort gibt es auch, und sie ist die gefährlichste: **still
weitermachen.** Ein Ablauf, der einen Fehler verschluckt, liefert falsche
Ergebnisse, und niemand weiß es.

```aufgabe
id: E3-17
typ: uebereinstimmung
titel: "Welche Antwort passt?"
punkte: 30
frage: "Ordne jedem Fehler die passende Reaktion zu."
links:
  - "Die Verbindung zum Kalender bricht kurz ab"
  - "Eine hochgeladene Tabelle hat gar keine Spalten"
  - "Das Modell soll entscheiden, ob einem Kunden gekündigt wird"
  - "Ein Werkzeugaufruf ist kein gültiges JSON"
rechts:
  - "Wiederholen, mit Wartezeit"
  - "Abbrechen und melden"
  - "Einen Menschen fragen"
  - "Das Modell um einen neuen Aufruf bitten, höchstens zweimal"
loesung:
  "Die Verbindung zum Kalender bricht kurz ab": "Wiederholen, mit Wartezeit"
  "Eine hochgeladene Tabelle hat gar keine Spalten": "Abbrechen und melden"
  "Das Modell soll entscheiden, ob einem Kunden gekündigt wird": "Einen Menschen fragen"
  "Ein Werkzeugaufruf ist kein gültiges JSON": "Das Modell um einen neuen Aufruf bitten, höchstens zweimal"
richtzeit_s: 90
erklaerung: |
  Vorübergehendes wiederholt man, Dauerhaftes meldet man, Folgenreiches gibt
  man einem Menschen. Und ein ungültiger Aufruf darf neu versucht werden -
  aber begrenzt, sonst hast du eine Schleife, die nie endet.
```

## Die Grenze für das Wiederholen

„Nochmal versuchen" klingt harmlos. Ohne Grenze ist es eine Falle: Ein Ablauf,
der bei jedem Fehler sofort wiederholt, kann in einer Minute tausend Anfragen
schicken. Deshalb gehören zu jeder Wiederholung zwei Zahlen:

1. **Wie oft höchstens?** Meist drei bis fünf Mal.
2. **Wie lange warten?** Und zwar jedes Mal länger: 1 Sekunde, dann 2, dann 4,
   dann 8. Das nennt man *exponentielles Warten* — der Server bekommt Luft.

```aufgabe
id: E3-18
typ: mathe
titel: "Wie lange insgesamt?"
punkte: 25
frage: "Ein Ablauf wartet vor jeder Wiederholung doppelt so lange wie vorher, beginnend mit 2 Sekunden. Er wiederholt höchstens fünfmal. Wie viele Sekunden wartet er insgesamt, wenn alle fünf Versuche scheitern?"
loesung: 62
toleranz: 0
richtzeit_s: 90
hinweise:
  - text: "Die Wartezeiten sind 2, 4, 8, … — schreib alle fünf auf."
    kostet: 5
erklaerung: |
  2 + 4 + 8 + 16 + 32 = 62 Sekunden. Gut eine Minute - danach ist klar, dass
  Wiederholen nicht hilft, und der Ablauf bricht ab und meldet sich.
```

## Der Mensch als Baustein

„Einen Menschen fragen" ist kein Eingeständnis, dass die Automation versagt
hat. Es ist eine **Konstruktionsentscheidung**, und eine gute. Erinnere dich
an Stufe 1, Lektion 5: Es gibt folgenreiche und folgenlose Entscheidungen.
Eine Automation darf die folgenlosen allein treffen. Bei den folgenreichen
schlägt sie vor, und ein Mensch entscheidet.

Damit das funktioniert, muss die Rückfrage **alles enthalten, was der Mensch
zum Entscheiden braucht** — nicht nur „Bitte prüfen".

```aufgabe
id: E3-19
typ: planung
titel: "Eine gute Rückfrage"
punkte: 40
frage: "Ein Ablauf prüft Urlaubsanträge. Bei mehr als 15 Tagen am Stück soll er die Teamleitung fragen. Schreibe die Nachricht, die der Ablauf dann schickt. Mindestens 40 Wörter."
pruefungen:
  - art: mindestens_woerter
    wert: 40
    punkte: 10
    begruendung: "Mindestens 40 Wörter."
  - art: enthaelt_eines
    werte: [tage, zeitraum, vom, bis, datum]
    punkte: 10
    begruendung: "Die Nachricht nennt den Zeitraum."
  - art: enthaelt_eines
    werte: [weil, grund, mehr als 15, über 15, länger als]
    punkte: 10
    begruendung: "Die Nachricht sagt, warum gefragt wird."
  - art: enthaelt_eines
    werte: [genehmigen, ablehnen, freigeben, zustimmen, entscheiden, ja oder nein]
    punkte: 10
    begruendung: "Die Nachricht sagt, was die Teamleitung entscheiden soll."
richtzeit_s: 420
erklaerung: |
  Eine gute Rückfrage beantwortet drei Fragen, bevor sie gestellt werden:
  Worum geht es, warum fragst du mich, und was soll ich tun? Wer erst
  nachfragen muss, entscheidet langsamer - oder gar nicht.
```
