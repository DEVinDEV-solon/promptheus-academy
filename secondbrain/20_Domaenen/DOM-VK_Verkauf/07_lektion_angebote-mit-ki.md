---
type: lesson
title: "Angebote mit KI"
description: "Preise aus der Liste, Rabatte nach Stufen, Freigabe nach Höhe: Ein Angebotswerkzeug braucht feste Regeln. Das Modell schreibt den Text, nicht den Preis."
tags:
  - lesson
  - domaene
  - dom-vk
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 15
---

# Angebote mit KI

## Der Preis kommt aus der Liste

Das Geschäft ist in der Phase „Angebot“ (Lektion 6). Ein Werkzeug kann das
Angebot in Minuten zusammenstellen: Positionen aus dem Katalog, Preise aus
der **Preisliste**, ein Anschreiben vom Modell. Der Preis kommt dabei nie vom
Modell, sondern immer aus der Liste. Rabatte und Skonto rechnet die Tabelle.

```aufgabe
id: D4-15
typ: mathe
titel: "Rabatt und Skonto"
punkte: 30
frage: "Der Listenpreis beträgt 12.000 Euro netto. Der Kunde bekommt 10 Prozent Rabatt und zahlt innerhalb von 10 Tagen, wofür es 2 Prozent Skonto gibt. Wie viel zahlt er netto?"
loesung: 10584
toleranz: 0.5
einheit: "Euro"
richtzeit_s: 110
hinweise:
  - text: "Erst der Rabatt vom Listenpreis, dann das Skonto vom rabattierten Preis."
    kostet: 5
erklaerung: |
  12.000 × 0,90 = 10.800 Euro, davon 2 Prozent Skonto: 10.800 × 0,98 =
  10.584 Euro. Wer beide Prozente einfach addiert (12 Prozent), kommt auf
  10.560 Euro - 24 Euro zu wenig, bei jedem Angebot.
```

## Wer welchen Rabatt freigibt

Rabatte sind Zusagen mit Geld dahinter (Lektion 1). In vielen Firmen gibt es
deshalb **Freigabestufen**. Ein Beispiel:

| Rabatt | gibt frei |
|---|---|
| bis 5 Prozent | die Verkäuferin selbst |
| über 5 bis 15 Prozent | die Vertriebsleitung |
| über 15 Prozent | die Geschäftsführung |

Das Angebotswerkzeug kennt diese Stufen als Regel. Es schickt ein Angebot erst
weiter, wenn die passende Freigabe da ist.

```aufgabe
id: D4-16
typ: quizkarten
titel: "Wer gibt frei?"
punkte: 30
frage: "Lege jedes Angebot auf den Stapel der Person, die es nach der Tabelle freigibt."
karten:
  - "3 Prozent auf ein Standardangebot"
  - "10 Prozent für einen Rahmenvertrag über zwei Jahre"
  - "25 Prozent, um einen Wettbewerber auszustechen"
  - "Kostenlose Lieferung im Wert von 2 Prozent"
  - "18 Prozent für einen Großauftrag"
  - "12 Prozent für einen Neukunden mit Referenzwert"
stapel: [Verkäuferin, Vertriebsleitung, Geschäftsführung]
loesung:
  "3 Prozent auf ein Standardangebot": Verkäuferin
  "10 Prozent für einen Rahmenvertrag über zwei Jahre": Vertriebsleitung
  "25 Prozent, um einen Wettbewerber auszustechen": Geschäftsführung
  "Kostenlose Lieferung im Wert von 2 Prozent": Verkäuferin
  "18 Prozent für einen Großauftrag": Geschäftsführung
  "12 Prozent für einen Neukunden mit Referenzwert": Vertriebsleitung
richtzeit_s: 90
erklaerung: |
  Die Regel ist einfach und fest - genau deshalb kann ein Werkzeug sie
  zuverlässig anwenden. Auch eine kostenlose Lieferung ist ein Nachlass und
  zählt mit.
```
