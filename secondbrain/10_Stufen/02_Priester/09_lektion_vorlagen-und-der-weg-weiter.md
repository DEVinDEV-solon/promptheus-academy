---
type: lesson
title: "Vorlagen — und der Weg zum Ablauf"
description: "Ein guter Auftrag, der sich bewährt hat, wird zur Vorlage mit Platzhaltern. Und eine Vorlage mit einer Wenn-Dann-Regel ist schon fast eine Automation."
tags:
  - lesson
  - stufe-2
  - prompting
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 2
dauer_min: 14
---

# Vorlagen — und der Weg zum Ablauf

## Nicht jedes Mal von vorn

Du hast in dieser Stufe Aufträge gebaut, verbessert, verkettet und mit
Kriterien geprüft. Ein Auftrag, der diese Mühe überstanden hat, ist etwas wert
— zu viel, um ihn beim nächsten Mal wieder aus dem Gedächtnis zu tippen.
Deshalb macht man daraus eine **Vorlage**: den bewährten Auftrag, in dem das,
was sich ändert, durch **Platzhalter** ersetzt ist.

```
Du bist Lektorin für Texte an Eltern.
Kürze die folgende Nachricht auf höchstens {LAENGE} Wörter.
Behalte alle Termine und Fristen. Sprich die Eltern mit „Sie“ an.

Nachricht:
{TEXT}
```

`{LAENGE}` und `{TEXT}` werden bei jedem Einsatz ausgefüllt, alles andere
bleibt gleich. Das hat drei Vorteile: Es geht schneller, es kommt jedes Mal
gleich gut heraus — und wenn du etwas verbesserst, verbesserst du es an einer
Stelle für alle künftigen Einsätze.

```aufgabe
id: E2-26
typ: plugplay
titel: "Was wird zum Platzhalter?"
punkte: 30
frage: "Du machst aus einem bewährten Auftrag für Produktbeschreibungen eine Vorlage. Welche Teile sollten Platzhalter werden?"
bausteine:
  - "Der Name des Produkts"
  - "Die Rolle: „Du bist Texterin für einen Onlineshop.“"
  - "Die drei wichtigsten Eigenschaften des Produkts"
  - "Die Regel: höchstens 60 Wörter, keine Ausrufezeichen"
  - "Die Zielgruppe des Produkts"
loesung:
  - "Der Name des Produkts"
  - "Die drei wichtigsten Eigenschaften des Produkts"
  - "Die Zielgruppe des Produkts"
richtzeit_s: 70
erklaerung: |
  Was sich von Produkt zu Produkt ändert, wird Platzhalter. Rolle und Regeln
  bleiben fest - sie sind der Grund, warum die Vorlage gut ist. Erinnert an
  Lektion 5: Das Feste gehört nach oben, das Wechselnde in die Lücke.
```

## Die Vorlage braucht einen Namen und ein Datum

Eine Sammlung von Vorlagen wird schnell unübersichtlich. Drei Angaben helfen:

| Angabe | Wozu |
|---|---|
| **Name** | „Elternbrief kürzen" statt „Prompt 7" |
| **Wofür und wofür nicht** | „Für Mitteilungen, nicht für Zeugnisbemerkungen" |
| **Stand** | Wann zuletzt geprüft — Modelle ändern sich |

Die letzte Zeile ist wichtig: Eine Vorlage, die mit einem Modell perfekt lief,
kann mit dem nächsten schlechter laufen. Prüf deine wichtigsten Vorlagen ab und
zu mit deinem Raster aus Lektion 8 nach.

## Von der Vorlage zum Ablauf

Jetzt nimm die Wenn-Dann-Kette aus Lektion 3 dazu:

> **Wenn** eine Mail der Elternvertretung ankommt, **dann** fülle die Vorlage
> „Elternbrief kürzen" mit ihrem Text und lege das Ergebnis der Lehrerin vor.

Das ist eine vollständige Beschreibung einer **Automation**: ein Auslöser, eine
Vorlage, ein Ergebnis, und ein Mensch am Ende. In Stufe 3 zeichnest du solche
Abläufe, baust sie aus Bausteinen und lernst, was passiert, wenn etwas
schiefgeht. Was du dafür brauchst, hast du hier gelernt: einen Auftrag, auf
den man sich verlassen kann.

```aufgabe
id: E2-27
typ: schiebe
titel: "Vom Auftrag zur Automation"
punkte: 30
frage: "Bring die Stationen auf dem Weg vom ersten Auftrag zur Automation in die richtige Reihenfolge."
bausteine:
  - "Den Auftrag mit einem Raster prüfen und verbessern"
  - "Einen Auftrag aus den fünf Bausteinen schreiben"
  - "Eine Wenn-Dann-Regel festlegen, wann die Vorlage benutzt wird"
  - "Aus dem bewährten Auftrag eine Vorlage mit Platzhaltern machen"
loesung:
  - "Einen Auftrag aus den fünf Bausteinen schreiben"
  - "Den Auftrag mit einem Raster prüfen und verbessern"
  - "Aus dem bewährten Auftrag eine Vorlage mit Platzhaltern machen"
  - "Eine Wenn-Dann-Regel festlegen, wann die Vorlage benutzt wird"
richtzeit_s: 70
erklaerung: |
  Schreiben, prüfen, als Vorlage festhalten, an einen Auslöser hängen. Die
  ersten drei Schritte sind diese Stufe, der vierte ist der erste Schritt
  von Stufe 3.
```

## Deine Vorlage

```aufgabe
id: E2-28
typ: planung
titel: "Deine erste Vorlage"
punkte: 40
frage: "Schreibe eine Vorlage für eine Aufgabe, die du öfter hast. Sie soll mindestens zwei Platzhalter in geschweiften Klammern enthalten, eine feste Rolle und eine feste Formatregel. Sag in einem Satz, wofür sie da ist. Mindestens 40 Wörter."
pruefungen:
  - art: mindestens_woerter
    wert: 40
    punkte: 10
    begruendung: "Mindestens 40 Wörter."
  - art: muster
    wert: "[{][^}]+[}][^{]*[{][^}]+[}]"
    punkte: 10
    begruendung: "Mindestens zwei Platzhalter in geschweiften Klammern."
  - art: enthaelt_eines
    werte: [du bist, rolle, du agierst, antworte als]
    punkte: 10
    begruendung: "Eine feste Rolle."
  - art: enthaelt_eines
    werte: [höchstens, wörter, sätze, stichpunkte, absatz, tabelle, liste]
    punkte: 10
    begruendung: "Eine feste Formatregel."
richtzeit_s: 480
erklaerung: |
  Mit dieser Vorlage hast du das Werkzeug, mit dem Stufe 3 beginnt. Dort
  wird aus „wenn ich daran denke, benutze ich die Vorlage" ein Ablauf, der
  sie von selbst benutzt.
```
