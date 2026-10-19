---
type: lesson
title: "Ein eigener Posteingangsablauf"
description: "Alles aus diesem Kurs an einem Stück: ein Ablauf, der den Posteingang deines Büros erkennt, ausliest, benennt und ablegt — mit Zweifelsfach, Prüfregeln, Fehlerfall und Freigabe."
tags:
  - lesson
  - domaene
  - dom-buero
  - projekt
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 30
---

# Ein eigener Posteingangsablauf

## Alles an einem Stück

Du bist den Weg eines Dokuments einmal ganz gegangen. Jetzt baust du daraus
den Ablauf für dein eigenes Büro.

| Frage | aus Lektion |
|---|---|
| Welche Klassen gibt es, und wo landen unklare Dokumente? | 2 — Posteingang ordnen |
| Welche Felder werden ausgelesen, und was prüft die Regel? | 3 — Dokumente auslesen |
| Was darf der Mail-Assistent, und wie schützt du dich vor fremden Anweisungen? | 4 — E-Mails mit KI |
| Nach welchem Schema wird benannt, und wie lange bleibt es liegen? | 5 — Ablage und Benennung |
| Was ist Auslöser, Bedingung, Aktion und Fehlerfall? | 7 — Abläufe automatisieren |
| Welches Werkzeug darf welche Daten sehen? | 8 — Vertraulichkeit im Büro |
| Was sieht vorher ein Mensch? | 1 und 4 |

```aufgabe
id: D3-19
typ: multitask
titel: "Der Posteingang einer Hausverwaltung"
punkte: 50
frage: "Eine Hausverwaltung bekommt täglich 80 Briefe und Mails: Rechnungen, Mieteranfragen, Bescheide, Werbung. Plane den Ablauf in zwei Schritten."
schritte:
  - typ: schiebe
    titel: "Die Reihenfolge"
    punkte: 20
    frage: "Bring die Schritte des Ablaufs in die richtige Reihenfolge."
    bausteine:
      - "Regel prüft Datum, Summe und Dubletten"
      - "Modell erkennt die Dokumentklasse, Unklares geht ins Zweifelsfach"
      - "Dokument wird nach Schema benannt und mit Löschfrist abgelegt"
      - "Dokument kommt per Post-Scan oder Mail an"
      - "Modell liest Absender, Datum und Betrag als JSON aus"
    loesung:
      - "Dokument kommt per Post-Scan oder Mail an"
      - "Modell erkennt die Dokumentklasse, Unklares geht ins Zweifelsfach"
      - "Modell liest Absender, Datum und Betrag als JSON aus"
      - "Regel prüft Datum, Summe und Dubletten"
      - "Dokument wird nach Schema benannt und mit Löschfrist abgelegt"
  - typ: quizkarten
    titel: "Wer macht was?"
    punkte: 30
    frage: "Wer übernimmt diesen Teil im Ablauf?"
    karten:
      - "Prüfen, ob die Rechnungsnummer schon einmal gebucht wurde"
      - "Einen Bescheid mit Widerspruchsfrist in den Kalender eintragen und bearbeiten"
      - "Eine Mieteranfrage in einem Satz zusammenfassen"
      - "Eine neue Bankverbindung eines Handwerkers übernehmen"
    stapel: [Regel, Modell, Mensch]
    loesung:
      "Prüfen, ob die Rechnungsnummer schon einmal gebucht wurde": Regel
      "Einen Bescheid mit Widerspruchsfrist in den Kalender eintragen und bearbeiten": Mensch
      "Eine Mieteranfrage in einem Satz zusammenfassen": Modell
      "Eine neue Bankverbindung eines Handwerkers übernehmen": Mensch
richtzeit_s: 240
erklaerung: |
  Erkennen, auslesen, prüfen, ablegen. Die Regel prüft, was sich prüfen
  lässt, das Modell liest und fasst zusammen, der Mensch kümmert sich um
  Fristen und Geldflüsse - dort, wo ein Fehler wirklich wehtut.
```

## Dein Ablauf

```aufgabe
id: D3-20
typ: planung
titel: "Dein Bauplan für den Posteingang"
punkte: 60
frage: "Beschreibe einen Posteingangsablauf für ein Büro aus deinem Umfeld. Beantworte die Fragen aus der Tabelle: Klassen und Zweifelsfach, ausgelesene Felder und Prüfregeln, Mail-Assistent, Namensschema und Fristen, Fehlerfall, welche Daten in welches Werkzeug dürfen, und was ein Mensch vorher sieht. Mindestens 120 Wörter."
pruefungen:
  - art: mindestens_woerter
    wert: 120
    punkte: 10
    begruendung: "Mindestens 120 Wörter."
  - art: enthaelt_eines
    werte: [klasse, kategorie, zweifel, unklar]
    punkte: 10
    begruendung: "Du nennst die Klassen und was mit Unklarem passiert."
  - art: enthaelt_eines
    werte: [prüft, prüfregel, plausib, summe, dublette]
    punkte: 10
    begruendung: "Du sagst, was eine Regel prüft."
  - art: enthaelt_eines
    werte: [fehlerfall, scheitert, fehler, schiefgeht]
    punkte: 10
    begruendung: "Du denkst an den Fehlerfall."
  - art: enthaelt_eines
    werte: [firmenwerkzeug, vertrag, auftragsverarbeitung, vertraulich, datenschutz, dsgvo]
    punkte: 10
    begruendung: "Du sagst, welche Daten in welches Werkzeug dürfen."
  - art: enthaelt_eines
    werte: [freigabe, freigeben, gibt frei, mensch, prüft vorher]
    punkte: 10
    begruendung: "Du legst fest, was ein Mensch vorher sieht."
richtzeit_s: 900
erklaerung: |
  Sortieren, auslesen, prüfen und ablegen darf laufen - mit Zweifelsfach und
  Fehlerfall. Was nach außen geht, Fristen setzt oder Geld bewegt, sieht
  vorher ein Mensch. Wenn dein Bauplan das zeigt, hast du den Kurs verstanden.
```
