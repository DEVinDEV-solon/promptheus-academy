---
type: lesson
title: "Ein eigener Beratungsablauf"
description: "Alles aus diesem Kurs an einem Stück: ein wiederkehrender Auftrag, der zum Teil allein läuft — mit Belegen, Datenschutz und Unterschrift."
tags:
  - lesson
  - domaene
  - dom-ber
  - projekt
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 30
---

# Ein eigener Beratungsablauf

## Wiederkehrende Aufträge

Die meisten Beratungsaufträge sind einmalig. Manche kommen aber jeden Monat
wieder: eine Wettbewerbsbeobachtung, ein Marktbericht, eine Auswertung der
Kundenzufriedenheit. Hier lohnt sich ein Ablauf, der zum Teil allein läuft —
und hier zahlt sich alles aus, was du in diesem Kurs gelernt hast.

| Frage | aus Lektion |
|---|---|
| Was ist die Kernfrage, was gehört nicht dazu? | 3 — Die Frage schärfen |
| Woher kommt das Material, und wie wird jeder Beleg geprüft? | 4 — Recherche mit Belegen |
| Was rechnet eine Regel, was deutet das Modell? | 2 und 5 |
| Welche Daten dürfen ans Modell, welche nicht? | 6 — Vertrauliche Kundendaten |
| Wie sieht das Ergebnis aus? | 7 — Berichte schreiben |
| Wer prüft und gibt frei? | 8 — Die Empfehlung prüfen |

```aufgabe
id: D5-23
typ: multitask
titel: "Der Monatsbericht zum Wettbewerb"
punkte: 50
frage: "Ein Kunde will jeden Monat wissen, was seine drei wichtigsten Wettbewerber verändert haben: Preise, Produkte, Stellenanzeigen. Plane den Ablauf in zwei Schritten."
schritte:
  - typ: schiebe
    titel: "Die Reihenfolge"
    punkte: 20
    frage: "Bring die Schritte des monatlichen Ablaufs in die richtige Reihenfolge."
    bausteine:
      - "Berater prüft den Entwurf und gibt ihn frei"
      - "Webseiten und Preislisten der Wettbewerber abrufen"
      - "Regel vergleicht mit dem Stand vom Vormonat und markiert Änderungen"
      - "Modell fasst die markierten Änderungen in einem Entwurf zusammen"
    loesung:
      - "Webseiten und Preislisten der Wettbewerber abrufen"
      - "Regel vergleicht mit dem Stand vom Vormonat und markiert Änderungen"
      - "Modell fasst die markierten Änderungen in einem Entwurf zusammen"
      - "Berater prüft den Entwurf und gibt ihn frei"
  - typ: denkaufgabe
    titel: "Wo sitzt das Modell?"
    punkte: 30
    frage: "Warum vergleicht eine Regel die Preise mit dem Vormonat und nicht das Modell?"
    optionen:
      - "Weil ein Vergleich zweier Zahlen eine feste Prüfung ist, die nie zufällig irrt."
      - "Weil Modelle keine Zahlen lesen können."
      - "Weil eine Regel schöner formuliert."
      - "Weil das Modell dafür zu teuer wäre, sonst wäre es besser."
    loesung: "Weil ein Vergleich zweier Zahlen eine feste Prüfung ist, die nie zufällig irrt."
richtzeit_s: 240
erklaerung: |
  Abrufen, vergleichen, zusammenfassen, freigeben. Die Regel findet, WAS
  sich geändert hat; das Modell sagt, was es bedeuten könnte; der Mensch
  entscheidet, was davon der Kunde lesen soll.
```

## Dein Ablauf

```aufgabe
id: D5-24
typ: planung
titel: "Dein Bauplan für einen Beratungsablauf"
punkte: 60
frage: "Beschreibe einen wiederkehrenden Beratungsauftrag aus deinem Umfeld als Ablauf. Beantworte die sechs Fragen aus der Tabelle: Kernfrage, Material und Belege, Regel oder Modell, Datenschutz, Ergebnis und Freigabe. Mindestens 120 Wörter."
pruefungen:
  - art: mindestens_woerter
    wert: 120
    punkte: 10
    begruendung: "Mindestens 120 Wörter."
  - art: enthaelt_eines
    werte: [kernfrage, frage, auftrag]
    punkte: 10
    begruendung: "Du nennst die Kernfrage."
  - art: enthaelt_eines
    werte: [beleg, quelle, zitat, nachweis]
    punkte: 10
    begruendung: "Du sagst, wie Belege geprüft werden."
  - art: enthaelt_alle
    werte: [regel, modell]
    punkte: 10
    begruendung: "Du sagst, wo eine Regel und wo ein Modell arbeitet."
  - art: enthaelt_eines
    werte: [datenschutz, pseudonym, personenbezogen, vertraulich, avv, auftragsverarbeitung, lokal, dsgvo]
    punkte: 10
    begruendung: "Du sagst, welche Daten ans Modell dürfen."
  - art: enthaelt_eines
    werte: [freigabe, freigeben, prüft, unterschreibt, mensch]
    punkte: 10
    begruendung: "Du legst fest, wer freigibt."
richtzeit_s: 900
erklaerung: |
  Wenn du diese sechs Fragen für einen echten Auftrag beantworten kannst,
  hast du den Kurs verstanden: Das Werkzeug bereitet vor, eine Regel prüft,
  was sich prüfen lässt, und ein Mensch steht für das Ergebnis gerade.
```
