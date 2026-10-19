---
type: lesson
title: "Daten aus Kasse und Lager"
description: "Jede Prognose ist nur so gut wie die Zahlen darunter. Woher die Daten im Handel kommen, und warum ein Nullverkauf keine Nullnachfrage ist."
tags:
  - lesson
  - domaene
  - dom-hdl
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 14
---

# Daten aus Kasse und Lager

## Vier Quellen, ein Bild

Bevor ein Werkzeug irgendetwas vorschlagen kann, braucht es Zahlen. Im Handel
kommen sie fast immer aus denselben vier Quellen:

| Quelle | liefert |
|---|---|
| **Kasse** | was wann verkauft wurde, Stück für Stück |
| **Warenwirtschaft** | was im Lager und im Regal liegt, was bestellt ist |
| **Lieferanten** | Lieferzeit, Mindestmenge, Verpackungseinheit, Preis |
| **Kalender** | Feiertage, Ferien, Aktionen, Messen |

Keine Quelle allein reicht. Die Kasse weiß nicht, was im Lager liegt. Die
Warenwirtschaft weiß nicht, dass nächste Woche Ostern ist.

```aufgabe
id: D1-03
typ: uebereinstimmung
titel: "Welche Quelle weiß was?"
punkte: 20
frage: "Ordne jede Frage der Quelle zu, die sie beantwortet."
links:
  - "Wie viele Stück wurden letzten Samstag verkauft?"
  - "Wie viele Stück liegen gerade im Lager?"
  - "Wie lange dauert eine Nachlieferung?"
  - "Liegt in der nächsten Woche ein Feiertag?"
rechts: [Kasse, Warenwirtschaft, Lieferant, Kalender]
loesung:
  "Wie viele Stück wurden letzten Samstag verkauft?": Kasse
  "Wie viele Stück liegen gerade im Lager?": Warenwirtschaft
  "Wie lange dauert eine Nachlieferung?": Lieferant
  "Liegt in der nächsten Woche ein Feiertag?": Kalender
richtzeit_s: 60
erklaerung: |
  Jede Quelle beantwortet ihre eigene Frage. Ein Bestellvorschlag braucht
  alle vier - fehlt eine, rechnet das Werkzeug mit einer Lücke, ohne es zu
  sagen.
```

## Die Falle mit der Null

Ein Artikel hat letzte Woche nichts verkauft. Heißt das, niemand wollte ihn?
Nicht unbedingt. Vielleicht war er gar nicht da. Ein leeres Regal verkauft
nichts, auch wenn zwanzig Leute danach gefragt haben.

Im Handel heißt das **Fehlbestand**. Wer ihn nicht markiert, bringt dem
Werkzeug bei, dass der Artikel nicht läuft. Dann bestellt es weniger nach, das
Regal ist öfter leer, und die Zahlen sehen noch schlechter aus. Ein Kreis, der
sich selbst bestätigt.

```aufgabe
id: D1-04
typ: denkaufgabe
titel: "Die leere Woche"
punkte: 25
frage: "Ein Artikel verkauft sonst rund 50 Stück pro Woche. Letzte Woche waren es 0, und laut Warenwirtschaft war der Bestand die ganze Woche 0. Was sagt diese Woche über die Nachfrage?"
optionen:
  - "Die Nachfrage ist eingebrochen, der Artikel kann aus dem Sortiment."
  - "Nichts: Ohne Ware im Regal lässt sich die Nachfrage nicht messen. Die Woche wird als Fehlbestand markiert."
  - "Die Nachfrage lag bei 0, das ist eine ehrliche Zahl."
  - "Das Modell soll schätzen, was verkauft worden wäre, und die Zahl ersetzen, ohne es zu vermerken."
loesung: "Nichts: Ohne Ware im Regal lässt sich die Nachfrage nicht messen. Die Woche wird als Fehlbestand markiert."
richtzeit_s: 60
erklaerung: |
  Verkauf ist nicht Nachfrage. Eine Woche ohne Bestand gehört markiert, nicht
  stillschweigend ersetzt. Eine Schätzung darf es geben, aber sichtbar als
  Schätzung - sonst weiß später niemand mehr, welche Zahl echt war.
```

## Was ein Bestellvorschlag wirklich braucht

Mehr Daten sind nicht automatisch besser. Daten, die nichts zur Frage
beitragen, machen ein Werkzeug langsamer und manchmal falsch. Und Daten über
Menschen, die nichts zur Frage beitragen, gehören aus Datenschutzgründen gar
nicht erst hinein (Stufe 5).

```aufgabe
id: D1-05
typ: plugplay
titel: "Die richtigen Zutaten"
punkte: 25
frage: "Ein Werkzeug soll Bestellvorschläge für das Lager machen. Welche Daten braucht es dafür?"
bausteine:
  - "Abverkauf der letzten Wochen"
  - "aktueller Bestand"
  - "Lieferzeit des Lieferanten"
  - "offene Bestellungen"
  - "Name der Person an der Kasse"
  - "Kundennamen aus der Bonus-Karte"
  - "Farbe des Regals"
loesung:
  - "Abverkauf der letzten Wochen"
  - "aktueller Bestand"
  - "Lieferzeit des Lieferanten"
  - "offene Bestellungen"
richtzeit_s: 70
hinweise:
  - text: "Frag bei jedem Baustein: Ändert er die Menge, die bestellt werden sollte?"
    kostet: 5
erklaerung: |
  Abverkauf, Bestand, Lieferzeit und offene Bestellungen bestimmen die
  Menge. Wer an der Kasse saß und wer mit Bonus-Karte zahlte, ändert daran
  nichts - und personenbezogene Daten ohne Zweck haben im Werkzeug nichts
  verloren.
```
