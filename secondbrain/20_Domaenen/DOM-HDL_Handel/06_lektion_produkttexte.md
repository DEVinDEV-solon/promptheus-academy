---
type: lesson
title: "Produkttexte"
description: "Ein Modell schreibt in Sekunden hundert Artikeltexte. Was es dabei erfindet, steht danach als Versprechen im Shop. Fakten hinein, Erfundenes heraus."
tags:
  - lesson
  - domaene
  - dom-hdl
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 14
---

# Produkttexte

## Schnell geschrieben, schnell versprochen

Der Artikel hat einen Preis (Lektion 5). Jetzt braucht er einen Text. Für
hundert neue Artikel ist ein Modell eine echte Hilfe: Es schreibt flüssig,
in einheitlichem Ton und in mehreren Sprachen.

Die Gefahr kennst du aus Stufe 1: Ein Modell füllt Lücken mit dem
Wahrscheinlichen. Steht im Datenblatt nichts über Wasser, schreibt es bei
einer Outdoor-Jacke trotzdem gern „wasserdicht“, weil das bei Jacken oft so
ist. Im Shop ist das ein **Versprechen**. Stimmt es nicht, ist der Text
irreführende Werbung, und die Retoure kommt sicher.

```aufgabe
id: D1-15
typ: plugplay
titel: "Was deckt das Datenblatt?"
punkte: 30
frage: "Datenblatt einer Jacke: Material 100 % Polyester, wasserabweisend beschichtet, Kapuze abnehmbar, Größen S bis XL, maschinenwaschbar bei 30 Grad. Welche Sätze aus dem Entwurf des Modells sind NICHT durch das Datenblatt gedeckt?"
bausteine:
  - "Die Jacke ist vollständig wasserdicht."
  - "Die Kapuze lässt sich abnehmen."
  - "Hergestellt aus recyceltem Material."
  - "Erhältlich in den Größen S bis XL."
  - "Atmungsaktiv auch bei intensivem Sport."
  - "Waschbar in der Maschine bei 30 Grad."
loesung:
  - "Die Jacke ist vollständig wasserdicht."
  - "Hergestellt aus recyceltem Material."
  - "Atmungsaktiv auch bei intensivem Sport."
richtzeit_s: 100
hinweise:
  - text: "Wasserabweisend und wasserdicht sind zwei verschiedene Eigenschaften."
    kostet: 5
erklaerung: |
  „Wasserdicht“ ist mehr als „wasserabweisend“, „recycelt“ und „atmungsaktiv“
  stehen nirgends. Gerade Umweltaussagen wie „recycelt“ oder „klimaneutral“
  sind heikel: Sie brauchen einen Beleg, sonst sind sie unlauter.
```

## Der Auftrag, der nichts erfinden lässt

Die Antwort ist nicht, auf das Modell zu verzichten, sondern es richtig zu
beauftragen. Die fünf Bausteine aus Stufe 2 passen hier genau:

- **Rolle:** Du schreibst Artikeltexte für einen Onlineshop.
- **Kontext:** die Fakten aus dem Datenblatt, am besten als feste Liste oder
  JSON (Stufe 4).
- **Aufgabe:** ein Text von 60 bis 80 Wörtern, drei Stichpunkte.
- **Format:** Überschrift, Text, Stichpunkte.
- **Grenze:** Verwende nur die Fakten aus dem Kontext. Fehlt eine Angabe,
  lass sie weg und erfinde keine.

Danach prüft ein Mensch, oder eine Regel vergleicht jede Eigenschaft im Text
mit dem Datenblatt, bevor der Text online geht.

```aufgabe
id: D1-16
typ: planung
titel: "Dein Auftrag für Artikeltexte"
punkte: 40
frage: "Schreibe einen Auftrag an ein Modell, das Artikeltexte für deinen Shop schreiben soll. Nenne die Rolle, woher die Fakten kommen, das Format und die Grenze, dass nichts erfunden wird. Mindestens 50 Wörter."
pruefungen:
  - art: mindestens_woerter
    wert: 50
    punkte: 10
    begruendung: "Mindestens 50 Wörter."
  - art: enthaelt_eines
    werte: [datenblatt, fakten, stammdaten, angaben, eigenschaften]
    punkte: 10
    begruendung: "Du sagst, woher die Fakten kommen."
  - art: enthaelt_eines
    werte: [format, wörter, stichpunkt, überschrift, absatz, länge]
    punkte: 10
    begruendung: "Du legst das Format fest."
  - art: enthaelt_eines
    werte: [nicht erfinden, erfinde keine, nichts erfinden, keine erfundenen, weglassen, nur die angaben, nur die fakten, ausschließlich]
    punkte: 10
    begruendung: "Du verbietest erfundene Eigenschaften."
richtzeit_s: 360
erklaerung: |
  Mit Fakten und klarer Grenze wird das Modell vom Erzähler zum Formulierer.
  Es kann immer noch irren - deshalb bleibt die Prüfung vor der
  Veröffentlichung. Aber es irrt deutlich seltener.
```
