---
type: lesson
title: "Einkauf und Lieferanten"
description: "Angebote vergleichen heißt mehr als Stückpreise vergleichen. Das Modell bringt Angebote in eine Tabelle, die Regel rechnet — und Konditionen bleiben im Haus."
tags:
  - lesson
  - domaene
  - dom-hdl
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 14
---

# Einkauf und Lieferanten

## Der Stückpreis lügt

Die Retouren aus Lektion 7 haben gezeigt, dass ein Artikel Probleme macht.
Vielleicht braucht es einen anderen Lieferanten. Drei Angebote liegen als PDF
im Postfach, jedes anders aufgebaut.

Hier hilft ein Modell beim **Auslesen**: Es bringt die Angebote in dieselbe
Tabelle, mit festen Spalten (Stufe 4: ein festes Format, zum Beispiel JSON).
Gerechnet wird danach in der Tabelle. Und verglichen wird nicht der
Stückpreis allein, sondern alles, was am Ende auf der Rechnung steht: Fracht,
Mindestmenge, Zahlungsziel.

```aufgabe
id: D1-20
typ: mathe
titel: "Frei Haus oder mit Fracht?"
punkte: 30
frage: "Angebot A: 4,20 Euro je Stück plus 60 Euro Fracht. Angebot B: 4,35 Euro je Stück, frei Haus. Bestellt werden 500 Stück. Wie viele Euro spart das günstigere Angebot gegenüber dem teureren?"
loesung: 15
toleranz: 0
einheit: "Euro"
richtzeit_s: 100
hinweise:
  - text: "Rechne beide Angebote komplett aus: Stückpreis mal Menge, plus Fracht."
    kostet: 5
erklaerung: |
  A: 500 × 4,20 + 60 = 2.160 Euro. B: 500 × 4,35 = 2.175 Euro. A ist 15 Euro
  günstiger. Bei 300 Stück wäre es umgekehrt (1.320 gegen 1.305 Euro) - die
  Fracht verteilt sich auf weniger Stück.
```

## Was der Einkauf nicht in ein Chatfenster gibt

Einkaufspreise, Rabattstaffeln und Rahmenverträge sind **Geschäftsgeheimnisse**.
Lieferanten geben sie oft nur unter der Bedingung heraus, dass sie vertraulich
bleiben. In ein kostenloses Chatfenster, das Eingaben vielleicht zum Training
nutzt, gehören sie nicht. Aus Stufe 5 kennst du die Frage: Wo landet das, was
ich eingebe?

Ein Firmenwerkzeug mit Vertrag zur Auftragsverarbeitung, ohne Training auf
den Eingaben, ist etwas anderes. Und manche Fragen brauchen gar keine echten
Daten.

```aufgabe
id: D1-21
typ: quizkarten
titel: "Wohin damit?"
punkte: 30
frage: "Lege jede Karte auf den richtigen Stapel: Darf sie in ein kostenloses öffentliches Chatfenster, oder nur in das Firmenwerkzeug mit Vertrag oder gar nicht?"
karten:
  - "Die Einkaufspreise eines Lieferanten"
  - "Die allgemeine Frage, wie man Termintreue von Lieferanten misst"
  - "Der Rahmenvertrag mit einem Lieferanten"
  - "Eine Musterrechnung ohne Namen und ohne echte Preise"
  - "Die Liste aller Lieferanten mit ihren Rabattstaffeln"
stapel: [öffentliches Chatfenster geht, nur Firmenwerkzeug oder gar nicht]
loesung:
  "Die Einkaufspreise eines Lieferanten": nur Firmenwerkzeug oder gar nicht
  "Die allgemeine Frage, wie man Termintreue von Lieferanten misst": öffentliches Chatfenster geht
  "Der Rahmenvertrag mit einem Lieferanten": nur Firmenwerkzeug oder gar nicht
  "Eine Musterrechnung ohne Namen und ohne echte Preise": öffentliches Chatfenster geht
  "Die Liste aller Lieferanten mit ihren Rabattstaffeln": nur Firmenwerkzeug oder gar nicht
richtzeit_s: 80
erklaerung: |
  Allgemeine Fragen und echte Muster ohne Geheimnis sind unbedenklich.
  Preise, Verträge und Konditionen sind es nicht. Im Zweifel hilft eine Frage:
  Würde der Lieferant zustimmen, dass ich das dort eingebe?
```
