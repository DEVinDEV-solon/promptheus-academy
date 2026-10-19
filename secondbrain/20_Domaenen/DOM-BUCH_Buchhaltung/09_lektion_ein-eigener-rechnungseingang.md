---
type: lesson
title: "Ein eigener Rechnungseingang"
description: "Alles aus diesem Kurs an einem Stück: ein Rechnungseingang, der erfasst, kontiert, prüft und zur Zahlung vorschlägt — GoBD-gerecht, mit Betrugsschutz und klaren Freigaben."
tags:
  - lesson
  - domaene
  - dom-buch
  - projekt
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 30
---

# Ein eigener Rechnungseingang

## Alles an einem Stück

Du bist den Weg einer Rechnung einmal ganz gegangen. Jetzt setzt du ihn zu
einem Ablauf für deinen Betrieb zusammen.

| Frage | aus Lektion |
|---|---|
| Wie wird erfasst, und was prüft die Regel nach dem Auslesen? | 2 — Belege erfassen |
| Wann wird ein Kontierungsvorschlag übernommen, wann geprüft? | 3 — Buchungsvorschläge |
| Wie werden Bestellung, Lieferschein und Rechnung abgeglichen? | 4 — Rechnungen prüfen |
| Wie werden Zahlungen freigegeben, und wie wird zugeordnet? | 5 — Zahlungen und Abgleich |
| Welche Rechnungen kommen als E-Rechnung? | 6 — E-Rechnung |
| Wie bleibt alles nachvollziehbar, und wo ist es dokumentiert? | 7 — GoBD |
| Was schützt vor Betrug? | 8 — Betrug erkennen |

```aufgabe
id: D8-21
typ: multitask
titel: "Der Rechnungseingang eines Handwerksbetriebs"
punkte: 50
frage: "Ein Handwerksbetrieb mit 25 Beschäftigten bekommt rund 300 Eingangsrechnungen im Monat, ein Drittel davon schon als E-Rechnung. Plane den Ablauf in zwei Schritten."
schritte:
  - typ: schiebe
    titel: "Die Reihenfolge"
    punkte: 20
    frage: "Bring die Schritte in die richtige Reihenfolge."
    bausteine:
      - "Bauleiter bestätigt die sachliche Richtigkeit"
      - "Regel gleicht mit Bestellung und Lieferschein ab"
      - "Rechnung kommt an, E-Rechnung direkt, PDF wird ausgelesen"
      - "Zwei Personen geben die Zahlung frei"
      - "Werkzeug schlägt das Konto vor, Ungewöhnliches geht in den Prüfkorb"
    loesung:
      - "Rechnung kommt an, E-Rechnung direkt, PDF wird ausgelesen"
      - "Werkzeug schlägt das Konto vor, Ungewöhnliches geht in den Prüfkorb"
      - "Regel gleicht mit Bestellung und Lieferschein ab"
      - "Bauleiter bestätigt die sachliche Richtigkeit"
      - "Zwei Personen geben die Zahlung frei"
  - typ: quizkarten
    titel: "Wer macht was?"
    punkte: 30
    frage: "Wer übernimmt diesen Teil im Ablauf?"
    karten:
      - "Prüfen, ob Netto plus Steuer den Bruttobetrag ergibt"
      - "Aus einer gescannten PDF-Rechnung Lieferant, Datum und Beträge auslesen"
      - "Eine neue Bankverbindung nach Rückruf in die Stammdaten übernehmen"
      - "Bestätigen, dass die berechnete Montage wirklich stattfand"
    stapel: [Regel, Modell, Mensch]
    loesung:
      "Prüfen, ob Netto plus Steuer den Bruttobetrag ergibt": Regel
      "Aus einer gescannten PDF-Rechnung Lieferant, Datum und Beträge auslesen": Modell
      "Eine neue Bankverbindung nach Rückruf in die Stammdaten übernehmen": Mensch
      "Bestätigen, dass die berechnete Montage wirklich stattfand": Mensch
richtzeit_s: 240
erklaerung: |
  Das Modell wird nur noch für Papier und PDF gebraucht. Regeln prüfen
  Summen und gleichen ab. Menschen bestätigen die Leistung, ändern Bankdaten
  und geben Zahlungen frei.
```

## Dein Ablauf

```aufgabe
id: D8-22
typ: planung
titel: "Dein Bauplan für den Rechnungseingang"
punkte: 60
frage: "Beschreibe einen Rechnungseingang für einen Betrieb aus deinem Umfeld. Beantworte die Fragen aus der Tabelle: Erfassen und Prüfregeln, Kontierung, Abgleich, Zahlungsfreigabe, E-Rechnung, GoBD und Dokumentation, Schutz vor Betrug. Mindestens 120 Wörter."
pruefungen:
  - art: mindestens_woerter
    wert: 120
    punkte: 10
    begruendung: "Mindestens 120 Wörter."
  - art: enthaelt_eines
    werte: [e-rechnung, xrechnung, zugferd, auslesen, erfass]
    punkte: 10
    begruendung: "Du beschreibst, wie Rechnungen erfasst werden."
  - art: enthaelt_eines
    werte: [abgleich, bestellung, lieferschein, sachlich]
    punkte: 10
    begruendung: "Du beschreibst die Prüfung gegen Bestellung und Leistung."
  - art: enthaelt_eines
    werte: [vier augen, vier-augen, zwei personen, freigabe, freigeben, gibt frei]
    punkte: 10
    begruendung: "Du legst die Zahlungsfreigabe fest."
  - art: enthaelt_eines
    werte: [gobd, verfahrensdokumentation, storn, nachvollzieh, unveränder]
    punkte: 10
    begruendung: "Du denkst an GoBD und Dokumentation."
  - art: enthaelt_eines
    werte: [bankverbindung, iban, betrug, rückruf]
    punkte: 10
    begruendung: "Du schützt den Ablauf vor Betrug."
richtzeit_s: 900
erklaerung: |
  Ein guter Rechnungseingang spart viel Zeit und verliert dabei nichts an
  Sorgfalt: Regeln prüfen, was sich prüfen lässt, Menschen bestätigen, was
  nur sie wissen, und alles bleibt nachvollziehbar. Wenn dein Bauplan das
  zeigt, hast du den Kurs verstanden.
```
