---
type: lesson
title: "Kundendaten und Einwilligung"
description: "Buchungstool, Erinnerung, Newsletter, Notizfeld: Jede Kundendatei braucht einen Grund, warum sie da ist. Und was im Notizfeld steht, kann die Kundschaft lesen."
tags:
  - lesson
  - domaene
  - dom-dl
  - datenschutz
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 14
---

# Kundendaten und Einwilligung

## Jede Verarbeitung braucht einen Grund

Termine, Anfragen, Angebote, Chatbot: In allen bisherigen Lektionen sind
Kundendaten geflossen. Aus Stufe 5 kennst du die Grundregel der DSGVO: Ohne
**Rechtsgrundlage** keine Verarbeitung. Im Alltag eines Dienstleisters sind es
fast immer drei:

- **Vertrag:** Was nötig ist, um die gebuchte Leistung zu erbringen, etwa die
  Erinnerung an den gebuchten Termin.
- **Gesetzliche Pflicht:** Rechnungen müssen aufbewahrt werden.
- **Einwilligung:** Alles, was darüber hinausgeht, etwa Werbung per E-Mail.

```aufgabe
id: D2-16
typ: uebereinstimmung
titel: "Der Grund hinter den Daten"
punkte: 25
frage: "Ordne jeder Verarbeitung die passende Rechtsgrundlage zu."
links:
  - "Erinnerung an den Termin, den die Kundin gebucht hat"
  - "Monatlicher Newsletter mit Angeboten"
  - "Rechnung mit Name und Anschrift aufbewahren"
rechts: [Vertrag, Einwilligung, gesetzliche Pflicht]
loesung:
  "Erinnerung an den Termin, den die Kundin gebucht hat": Vertrag
  "Monatlicher Newsletter mit Angeboten": Einwilligung
  "Rechnung mit Name und Anschrift aufbewahren": gesetzliche Pflicht
richtzeit_s: 70
erklaerung: |
  Die Erinnerung gehört zur gebuchten Leistung. Werbung nicht - dafür braucht
  es eine Einwilligung, die man jederzeit widerrufen kann. Die Aufbewahrung
  von Rechnungen schreibt das Steuerrecht vor.
```

## Das Notizfeld

Fast jedes Buchungstool hat ein freies Notizfeld. Dort landet schnell mehr, als
gut ist. Zwei Dinge solltest du wissen:

1. **Auskunftsrecht:** Jede Kundin kann verlangen, alle über sie gespeicherten
   Daten zu sehen (Art. 15 DSGVO). Das Notizfeld gehört dazu.
2. **Besondere Daten:** Angaben zur Gesundheit, etwa eine Allergie, sind
   besonders geschützt (Art. 9 DSGVO). Du darfst sie nur mit ausdrücklicher
   Einwilligung notieren, und nur, wenn du sie für die Leistung brauchst.

Und wenn ein Modell aus dem Notizfeld Antworten vorbereitet, bekommt es
alles mit, was dort steht.

```aufgabe
id: D2-17
typ: quizkarten
titel: "Gehört das ins Notizfeld?"
punkte: 30
frage: "Welche Notiz darf ins Buchungstool, welche gehört dort nicht hinein?"
karten:
  - "Möchte gern einen Termin am Vormittag."
  - "Ist schwierig, hat bestimmt Geldprobleme."
  - "Allergie gegen Duftstoffe, mit ausdrücklicher Einwilligung notiert."
  - "Bevorzugt die Kollegin Sandra."
  - "Steckt gerade mitten in einer Scheidung."
stapel: [darf hinein, gehört nicht hinein]
loesung:
  "Möchte gern einen Termin am Vormittag.": darf hinein
  "Ist schwierig, hat bestimmt Geldprobleme.": gehört nicht hinein
  "Allergie gegen Duftstoffe, mit ausdrücklicher Einwilligung notiert.": darf hinein
  "Bevorzugt die Kollegin Sandra.": darf hinein
  "Steckt gerade mitten in einer Scheidung.": gehört nicht hinein
richtzeit_s: 80
hinweise:
  - text: "Frag dich bei jeder Notiz: Brauche ich das für die Leistung, und würde ich es der Kundin zeigen?"
    kostet: 5
erklaerung: |
  Wünsche zur Zeit und zur Person helfen bei der Leistung. Die Allergie auch,
  mit Einwilligung. Wertungen und private Lebensumstände braucht niemand für
  einen Termin - und spätestens bei einer Auskunft nach Art. 15 liest die
  Kundin sie.
```
