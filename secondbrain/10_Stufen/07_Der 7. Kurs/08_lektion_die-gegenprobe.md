---
type: lesson
title: "Die Gegenprobe: wirkt deine Guideline?"
description: "Ein Dokument, das gut klingt, ist noch keins, das wirkt. Drei Texte mit und drei ohne — und woran du den Unterschied misst."
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

# Die Gegenprobe: wirkt deine Guideline?

> **Übung.** Diese Lektion zählt nicht zum Kursstand — deine Werkstatt bleibt
> frei, ob du sie machst oder nicht. Sie bringt Punkte, und sie beantwortet
> die Frage, die jedes Dokument irgendwann stellt: *Ändert es etwas?*

## Gut klingen ist kein Beweis

In Lektion 1 hast du gesehen: dreimal dieselbe Frage, dreimal ein anderer
Text. In Lektion 7 hast du dein Dokument eingerichtet. Ob es wirkt, weißt du
damit noch nicht. Ein Systemprompt kann wohlformuliert sein und trotzdem nichts
festlegen — weil er Eigenschaften nennt („freundlich, kompetent"), die das
Modell ohnehin für den Durchschnitt hält.

Die Prüfung ist einfach und ehrlich: **dieselbe Aufgabe, einmal mit und einmal
ohne Guideline, je dreimal.** Dann legst du die sechs Texte nebeneinander.

## Woran du misst

Nicht „gefällt mir besser". Das ist eine Stimmung, und Stimmungen kippen. Du
misst an Dingen, die du **abzählen** kannst — genau wie in Stufe 6, wo ein
Test nachprüfbar sein musste:

| Prüfpunkt | Wie du zählst |
|---|---|
| Anrede | Steht in allen drei Texten dieselbe (du / Sie / keine)? |
| Länge | Liegen die drei Texte innerhalb deiner Grenze aus Feld 6? |
| Verbotene Wörter | Wie oft kommt ein Wort aus deiner Trennlinie vor? |
| Form | Hält sich jeder Text an die Ausgabeform (Absätze, Liste, Tabelle)? |
| Absage | Lehnt das Modell ab, was du in Feld 8 ausgeschlossen hast? |

Ein Prüfpunkt gilt als **gehalten**, wenn alle drei Texte mit Guideline ihn
erfüllen. Zwei von drei heißt: die Regel ist zu weich formuliert.

```aufgabe
id: K7-12
typ: denkaufgabe
titel: "Was ist ein Prüfpunkt?"
punkte: 20
frage: "Welche dieser Fragen taugen als Prüfpunkt für eine Gegenprobe?"
mehrfach: true
optionen:
  - "Steht in allen drei Texten dieselbe Anrede?"
  - "Klingt der Text nach mir?"
  - "Kommt das Wort „revolutionär“ vor, obwohl es verboten ist?"
  - "Ist der Text gut?"
  - "Hat jeder Text höchstens 120 Wörter?"
loesung:
  - "Steht in allen drei Texten dieselbe Anrede?"
  - "Kommt das Wort „revolutionär“ vor, obwohl es verboten ist?"
  - "Hat jeder Text höchstens 120 Wörter?"
richtzeit_s: 60
hinweise:
  - text: "Könnten zwei Menschen beim Nachzählen zu verschiedenen Ergebnissen kommen? Dann ist es kein Prüfpunkt."
    kostet: 4
erklaerung: |
  Anrede, verbotene Wörter und Länge lassen sich abzählen. „Klingt nach mir"
  und „ist gut" sind Urteile - wichtig, aber sie prüfen nichts, weil jeder
  sie anders beantwortet.
```

## Was die Gegenprobe meistens zeigt

Fast immer dasselbe Muster:

- **Die Verbote wirken.** „Nie Ausrufezeichen" hält ein Modell zuverlässig ein.
- **Die Eigenschaften wirken kaum.** „Warm, aber klar" ändert wenig, weil das
  Modell ohnehin glaubt, warm und klar zu sein.
- **Beispiele wirken am stärksten.** Ein Satz, der zeigt, wie du klingst,
  schlägt drei Adjektive — das kennst du als Few-Shot aus Stufe 2.

Daraus folgt die Reparatur: Eine Regel, die nicht gehalten hat, wird nicht
lauter („UNBEDINGT freundlich!"), sondern **konkreter**: aus „freundlich" wird
„Wir duzen, wir danken nie für Geduld, der erste Satz nennt das Ergebnis".

```aufgabe
id: K7-13
typ: uebereinstimmung
titel: "Befund und Reparatur"
punkte: 30
frage: "Ordne jedem Befund der Gegenprobe die passende Reparatur zu."
links:
  - "Zwei von drei Texten siezen"
  - "Texte sind doppelt so lang wie erlaubt"
  - "„Freundlich“ ändert nichts"
  - "Ein verbotenes Wort taucht auf"
rechts:
  - "Die Anrede als feste Regel in die erste Zeile"
  - "Eine Zahl statt „kurz“: höchstens 120 Wörter"
  - "Ein Beispielsatz statt des Adjektivs"
  - "Das Wort wörtlich in die Verbotsliste"
loesung:
  "Zwei von drei Texten siezen": "Die Anrede als feste Regel in die erste Zeile"
  "Texte sind doppelt so lang wie erlaubt": "Eine Zahl statt „kurz“: höchstens 120 Wörter"
  "„Freundlich“ ändert nichts": "Ein Beispielsatz statt des Adjektivs"
  "Ein verbotenes Wort taucht auf": "Das Wort wörtlich in die Verbotsliste"
richtzeit_s: 90
erklaerung: |
  Jede Reparatur macht aus einer Eigenschaft eine Entscheidung. Ein Modell
  kann einer Zahl, einem Wort und einem Beispiel folgen - einem Gefühl nicht.
```

## Deine Gegenprobe

Nimm eine Aufgabe, die du wirklich hast: eine Antwort an einen Kunden, einen
Beitrag, eine Bildbeschreibung für das Cinema Studio. Stelle sie in der
Werkstatt dreimal (dort gilt deine Guideline) und in einem leeren Chat
dreimal. Zähle die fünf Prüfpunkte.

```aufgabe
id: K7-14
typ: planung
titel: "Dein Prüfprotokoll"
punkte: 40
frage: "Schreibe dein Prüfprotokoll: welche Aufgabe du gestellt hast, welche Prüfpunkte gehalten haben und welche Regel du deshalb änderst. Mindestens 60 Wörter."
pruefungen:
  - art: mindestens_woerter
    wert: 60
    punkte: 10
    begruendung: "Mindestens 60 Wörter."
  - art: enthaelt_eines
    werte: [aufgabe, auftrag, gestellt, gefragt]
    punkte: 10
    begruendung: "Du nennst die Aufgabe, an der du geprüft hast."
  - art: enthaelt_eines
    werte: [gehalten, erfüllt, eingehalten, alle drei, zwei von drei, nicht gehalten]
    punkte: 10
    begruendung: "Du sagst, welche Prüfpunkte gehalten haben."
  - art: enthaelt_eines
    werte: [ändere, ersetze, streiche, ergänze, neu formuliert, statt]
    punkte: 10
    begruendung: "Du nennst eine Regel, die du deshalb änderst."
richtzeit_s: 900
erklaerung: |
  Ein Protokoll ist der Unterschied zwischen „ich glaube, es wirkt" und „es
  hat in drei von drei Fällen gehalten". Heb es auf: In der nächsten Lektion
  brauchst du es für die erste neue Fassung deines Dokuments.
```

## Verwandt

- [[10_Stufen/07_Der 7. Kurs/07_lektion_deine-guideline-einrichten|Lektion 7]] — wo du dein Dokument änderst
- [[10_Stufen/07_Der 7. Kurs/09_lektion_eine-guideline-viele-werkzeuge|Lektion 9]] — wie es lebendig bleibt
