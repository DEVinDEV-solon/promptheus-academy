---
type: lesson
title: "Ein Prüfablauf für Verträge"
description: "Alles aus diesem Kurs an einem Stück: ein Ablauf, in dem ein Werkzeug Verträge vorprüft — mit Checkliste, Fundstellen, sicheren Fristen, geschützten Daten und einer Freigabe durch einen befugten Menschen."
tags:
  - lesson
  - domaene
  - dom-jura
  - projekt
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 30
---

# Ein Prüfablauf für Verträge

## Alles an einem Stück

Du hast gelernt, wo Werkzeuge im Recht helfen und wo sie gefährlich werden.
Jetzt setzt du daraus einen Ablauf zusammen, wie ihn eine Einkaufsabteilung
oder eine Kanzlei für eingehende Verträge nutzen könnte.

| Frage | aus Lektion |
|---|---|
| Was ist Information, was Prüfung im Einzelfall, und wer verantwortet sie? | 1 — Einstieg |
| Wie wird jede Fundstelle geprüft? | 2 — Erfundene Urteile |
| Woher kommt der Wortlaut von Gesetzen? | 3 — Rechtsrecherche |
| Nach welcher Checkliste wird gelesen, und wie werden Fehlanzeigen geprüft? | 4 — Verträge lesen lassen |
| Wer rechnet Fristen, wer kontrolliert? | 5 — Fristen berechnen |
| Welche Unterlagen verlangt die DSGVO für das Werkzeug? | 6 — DSGVO-Prüfung |
| Welche Pflichten aus dem AI Act gelten? | 7 — Der AI Act im Betrieb |
| Was wird vor dem Modell anonymisiert? | 8 — Vertraulichkeit |

```aufgabe
id: D6-20
typ: multitask
titel: "Der Eingang eines Dienstleistungsvertrags"
punkte: 50
frage: "Eine Firma bekommt jeden Monat rund zehn Verträge von Dienstleistern zur Unterschrift. Ein Werkzeug soll die Prüfung vorbereiten. Plane den Ablauf in zwei Schritten."
schritte:
  - typ: schiebe
    titel: "Die Reihenfolge"
    punkte: 20
    frage: "Bring die Schritte in die richtige Reihenfolge."
    bausteine:
      - "Fristen aus dem Vertrag mit dem Kalenderprogramm berechnen und eintragen"
      - "Namen und Bankdaten durch Platzhalter ersetzen"
      - "Eine befugte Person prüft die Übersicht und gibt die Unterschrift frei"
      - "Vertrag geht ein und wird erfasst"
      - "Modell ordnet Klauseln nach der Checkliste zu, jeweils mit Ziffer"
    loesung:
      - "Vertrag geht ein und wird erfasst"
      - "Namen und Bankdaten durch Platzhalter ersetzen"
      - "Modell ordnet Klauseln nach der Checkliste zu, jeweils mit Ziffer"
      - "Fristen aus dem Vertrag mit dem Kalenderprogramm berechnen und eintragen"
      - "Eine befugte Person prüft die Übersicht und gibt die Unterschrift frei"
  - typ: quizkarten
    titel: "Wer macht was?"
    punkte: 30
    frage: "Wer übernimmt diesen Teil im Ablauf?"
    karten:
      - "Das Ende der Kündigungsfrist unter Beachtung von Wochenenden berechnen"
      - "Klauseln einer Kategorie der Checkliste zuordnen"
      - "Entscheiden, ob eine unbegrenzte Haftung akzeptabel ist"
      - "Ein genanntes Urteil in der Datenbank nachschlagen und bestätigen"
    stapel: [Regel, Modell, Mensch]
    loesung:
      "Das Ende der Kündigungsfrist unter Beachtung von Wochenenden berechnen": Regel
      "Klauseln einer Kategorie der Checkliste zuordnen": Modell
      "Entscheiden, ob eine unbegrenzte Haftung akzeptabel ist": Mensch
      "Ein genanntes Urteil in der Datenbank nachschlagen und bestätigen": Mensch
richtzeit_s: 240
erklaerung: |
  Anonymisieren steht vor dem Modell, nicht danach. Die Regel rechnet
  Fristen, das Modell sortiert Klauseln, und ein Mensch bestätigt jede
  Fundstelle und entscheidet über Risiken.
```

## Dein Ablauf

```aufgabe
id: D6-21
typ: planung
titel: "Dein Bauplan für eine Vertragsprüfung"
punkte: 60
frage: "Beschreibe einen Ablauf, in dem ein Werkzeug Verträge aus deinem Arbeitsumfeld vorprüft. Beantworte die Fragen aus der Tabelle: wer verantwortet, Checkliste und Fehlanzeigen, Fundstellen, Fristen, Datenschutz und Anonymisierung, AI Act. Mindestens 120 Wörter."
pruefungen:
  - art: mindestens_woerter
    wert: 120
    punkte: 10
    begruendung: "Mindestens 120 Wörter."
  - art: enthaelt_eines
    werte: [checkliste, kategorie, klausel]
    punkte: 10
    begruendung: "Du nennst die Checkliste."
  - art: enthaelt_eines
    werte: [fundstelle, ziffer, quelle, wortlaut, aktenzeichen]
    punkte: 10
    begruendung: "Du sagst, wie Fundstellen geprüft werden."
  - art: enthaelt_eines
    werte: [frist, kalender, vorfrist]
    punkte: 10
    begruendung: "Du sagst, wie Fristen berechnet werden."
  - art: enthaelt_eines
    werte: [anonym, pseudonym, platzhalter, auftragsverarbeitung, vertraulich, dsgvo]
    punkte: 10
    begruendung: "Du sagst, wie vertrauliche Daten geschützt werden."
  - art: enthaelt_eines
    werte: [freigabe, freigeben, gibt frei, verantwortet, anwalt, anwältin, befugt, mensch]
    punkte: 10
    begruendung: "Du legst fest, wer verantwortet und freigibt."
richtzeit_s: 900
erklaerung: |
  Das Werkzeug liest, ordnet und rechnet vor. Fundstellen, Fehlanzeigen und
  Risiken prüft ein Mensch, und die Entscheidung trifft jemand, der dafür
  befugt ist. Wenn dein Bauplan das zeigt, hast du den Kurs verstanden.
```
