---
type: lesson
title: "Bestellvorschläge"
description: "Meldebestand, Sicherheitsbestand, Bestellmenge: drei Formeln, die eine Regel zuverlässig rechnet. Der Mensch prüft den Vorschlag, bevor er zum Lieferanten geht."
tags:
  - lesson
  - domaene
  - dom-hdl
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 16
---

# Bestellvorschläge

## Wann nachbestellen? Der Meldebestand

Aus Lektion 3 kommt die Prognose: wie viel pro Tag verkauft wird. Jetzt die
nächste Frage: Ab welchem Bestand muss bestellt werden, damit die Ware
ankommt, bevor das Regal leer ist?

Das ist der **Meldebestand**:

> Meldebestand = Tagesbedarf × Lieferzeit in Tagen + Sicherheitsbestand

Der **Sicherheitsbestand** ist der Puffer für alles, was nicht nach Plan
läuft: ein Lieferant, der zwei Tage später kommt, ein Wochenende mit mehr
Andrang als erwartet.

```aufgabe
id: D1-09
typ: mathe
titel: "Der Meldebestand"
punkte: 25
frage: "Ein Artikel verkauft sich 40-mal am Tag. Der Lieferant braucht 5 Tage. Als Sicherheitsbestand sind 60 Stück festgelegt. Bei welchem Bestand muss bestellt werden?"
loesung: 260
toleranz: 0
einheit: "Stück"
richtzeit_s: 80
hinweise:
  - text: "Erst den Bedarf während der Lieferzeit, dann den Puffer dazu."
    kostet: 5
erklaerung: |
  40 × 5 = 200 Stück werden verkauft, während die Lieferung unterwegs ist.
  Plus 60 Stück Sicherheit ergibt 260. Fällt der Bestand darunter, erzeugt
  die Regel einen Bestellvorschlag.
```

## Wie viel bestellen? Die Bestellmenge

Die Menge ergibt sich aus dem Ziel, das man auffüllen will:

> Bestellmenge = Zielbestand − aktueller Bestand − schon offene Bestellungen

Die offenen Bestellungen werden gern vergessen. Dann bestellt das Werkzeug
dieselbe Ware zweimal, weil die erste Lieferung noch unterwegs ist. Und am
Ende wird auf volle **Verpackungseinheiten** aufgerundet, denn kein Lieferant
schickt 10,4 Kartons.

```aufgabe
id: D1-10
typ: mathe
titel: "Volle Kartons"
punkte: 30
frage: "Zielbestand 600 Stück, aktueller Bestand 230 Stück, offene Bestellung 120 Stück. Geliefert wird in Kartons zu 24 Stück. Wie viele Stück werden bestellt, wenn auf volle Kartons aufgerundet wird?"
loesung: 264
toleranz: 0
einheit: "Stück"
richtzeit_s: 120
hinweise:
  - text: "600 − 230 − 120 ergibt den Bedarf. Dann durch 24 teilen und aufrunden."
    kostet: 10
erklaerung: |
  600 - 230 - 120 = 250 Stück Bedarf. 250 / 24 = 10,4, also 11 Kartons.
  11 × 24 = 264 Stück. Wer die offene Bestellung vergisst, bestellt 370 Stück
  und hat bald doppelt so viel im Lager wie geplant.
```

## Vom Vorschlag zur Bestellung

Diese Rechnungen sind ein Fall für eine **Regel**, nicht für ein Modell: Sie
sind fest, nachprüfbar und jedes Mal gleich. Trotzdem geht der Vorschlag nicht
ungeprüft an den Lieferanten. Die Disponentin weiß Dinge, die in keiner
Tabelle stehen: dass der Artikel ausläuft, dass der Lieferant gerade
Probleme hat, dass im Nachbarort ein Konkurrent eröffnet.

```aufgabe
id: D1-11
typ: schiebe
titel: "Der Bestellablauf"
punkte: 25
frage: "Bring die Schritte eines automatischen Bestellablaufs in die richtige Reihenfolge."
bausteine:
  - "Disponentin prüft den Vorschlag und gibt ihn frei"
  - "Bestellmenge berechnen und auf Kartons aufrunden"
  - "Bestellung an den Lieferanten senden"
  - "Bestand und offene Bestellungen aus der Warenwirtschaft lesen"
  - "Prüfen, ob der Meldebestand unterschritten ist"
loesung:
  - "Bestand und offene Bestellungen aus der Warenwirtschaft lesen"
  - "Prüfen, ob der Meldebestand unterschritten ist"
  - "Bestellmenge berechnen und auf Kartons aufrunden"
  - "Disponentin prüft den Vorschlag und gibt ihn frei"
  - "Bestellung an den Lieferanten senden"
richtzeit_s: 70
erklaerung: |
  Lesen, prüfen, rechnen - das macht die Regel. Die Freigabe steht vor dem
  Senden, nicht danach: Eine verschickte Bestellung ist ein Vertrag.
```
