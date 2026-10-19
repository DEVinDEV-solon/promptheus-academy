---
type: lesson
title: "Rechnungen prüfen"
description: "Bestellt, geliefert, berechnet: Der Abgleich von Bestellung, Lieferschein und Rechnung findet die meisten Fehler. Eine Regel vergleicht, ein Mensch bestätigt, dass die Leistung wirklich da ist."
tags:
  - lesson
  - domaene
  - dom-buch
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 15
---

# Rechnungen prüfen

## Drei Papiere, ein Abgleich

Erfasst (Lektion 2) und kontiert (Lektion 3) heißt noch nicht richtig. Bevor
eine Rechnung bezahlt wird, prüft die Buchhaltung, ob das Berechnete auch
**bestellt und geliefert** wurde. Der bewährte Weg ist der Abgleich dreier
Papiere: Bestellung, Lieferschein, Rechnung. Liegen alle drei digital vor,
erledigt eine Regel den Vergleich in Sekunden.

```aufgabe
id: D8-09
typ: schiebe
titel: "Der Weg zur Zahlungsfreigabe"
punkte: 25
frage: "Bring die Schritte der Rechnungsprüfung in die richtige Reihenfolge."
bausteine:
  - "Zur Zahlung freigeben"
  - "Rechnung mit der Bestellung vergleichen: Artikel, Menge, Preis"
  - "Abweichungen mit dem Lieferanten oder dem Einkauf klären"
  - "Rechnung erfassen und Pflichtangaben prüfen"
  - "Rechnung mit Lieferschein und Wareneingang vergleichen"
loesung:
  - "Rechnung erfassen und Pflichtangaben prüfen"
  - "Rechnung mit der Bestellung vergleichen: Artikel, Menge, Preis"
  - "Rechnung mit Lieferschein und Wareneingang vergleichen"
  - "Abweichungen mit dem Lieferanten oder dem Einkauf klären"
  - "Zur Zahlung freigeben"
richtzeit_s: 70
erklaerung: |
  Bestellung sagt, was vereinbart war, Lieferschein, was kam, Rechnung, was
  verlangt wird. Passen alle drei, ist die Freigabe Formsache. Passen sie
  nicht, wird geklärt, bevor Geld fließt.
```

## Nachrechnen

```aufgabe
id: D8-10
typ: mathe
titel: "Stimmt die Summe?"
punkte: 30
frage: "Bestellt wurden 40 Stück zu 12,50 Euro netto mit 5 Prozent Rabatt. Welcher Bruttobetrag mit 19 Prozent Umsatzsteuer ist richtig?"
loesung: 565.25
toleranz: 0.01
einheit: "Euro"
richtzeit_s: 120
hinweise:
  - text: "Menge mal Preis, dann Rabatt abziehen, dann mal 1,19."
    kostet: 5
erklaerung: |
  40 × 12,50 = 500 Euro, minus 5 Prozent = 475 Euro netto, mal 1,19 =
  565,25 Euro. Steht auf der Rechnung 595 Euro, fehlt der Rabatt - ein
  Fehler, den die Regel über den Vergleich mit der Bestellung sofort findet.
```

## Was eine Regel nicht sehen kann

Die Regel vergleicht Zahlen, Nummern und Mengen. Ob eine Leistung tatsächlich
erbracht wurde oder ob sie in Ordnung war, steht in keinem Papier. Das
bestätigt die Person, die sie bekommen hat: die **sachliche Richtigkeit**.

```aufgabe
id: D8-11
typ: quizkarten
titel: "Wer findet den Fehler?"
punkte: 30
frage: "Welcher Fehler fällt einer Regel auf, und welchen kann nur ein Mensch erkennen?"
karten:
  - "Dieselbe Rechnungsnummer kommt ein zweites Mal"
  - "Die Reinigung wurde in Rechnung gestellt, fand aber nie statt"
  - "Die Summe der Positionen ergibt nicht den Gesamtbetrag"
  - "Der Stückpreis ist höher als in der Bestellung"
  - "Die gelieferte Software tut nicht, was vereinbart war"
stapel: [Regel findet es, Mensch findet es]
loesung:
  "Dieselbe Rechnungsnummer kommt ein zweites Mal": Regel findet es
  "Die Reinigung wurde in Rechnung gestellt, fand aber nie statt": Mensch findet es
  "Die Summe der Positionen ergibt nicht den Gesamtbetrag": Regel findet es
  "Der Stückpreis ist höher als in der Bestellung": Regel findet es
  "Die gelieferte Software tut nicht, was vereinbart war": Mensch findet es
richtzeit_s: 80
erklaerung: |
  Dubletten, Rechenfehler und Preisabweichungen lassen sich vergleichen. Ob
  eine Leistung stattfand und taugte, weiß nur, wer dabei war. Deshalb gehört
  die Bestätigung der sachlichen Richtigkeit vor jede Freigabe.
```
