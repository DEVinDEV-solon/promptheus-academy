---
type: lesson
title: "Von der Anfrage bis zur Rechnung"
description: "Alles aus diesem Kurs an einem Stück: ein Ablauf für deinen Betrieb, in dem Routine läuft, Fakten aus geprüften Listen kommen und Zusagen ein Mensch gibt."
tags:
  - lesson
  - domaene
  - dom-dl
  - projekt
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 30
---

# Von der Anfrage bis zur Rechnung

## Alles an einem Stück

Du bist den Weg eines Auftrags einmal ganz gegangen. Jetzt setzt du ihn für
deinen eigenen Betrieb zusammen.

| Frage | aus Lektion |
|---|---|
| Welche Regeln gelten für Termine, Puffer und Erinnerungen? | 2 — Termine automatisch |
| In welche Kategorien sortiert das Modell, und was geht sofort an einen Menschen? | 3 — Anfragen sortieren |
| Woher kommen die Fakten in Antworten, und wo ist die Grenze? | 4 — Antworten mit Vorlage |
| Wer rechnet das Angebot, und woraus besteht die Beschreibung? | 5 — Angebote kalkulieren |
| Was darf ein Chatbot selbst, und sagt er, dass er eine KI ist? | 6 — Ein Chatbot an der Tür |
| Welche Daten werden gespeichert, und auf welcher Grundlage? | 7 — Kundendaten und Einwilligung |
| Wer entscheidet über Zusagen, Lösungen und Gutschriften? | 1 und 8 |

```aufgabe
id: D2-20
typ: multitask
titel: "Der Ablauf für einen Malerbetrieb"
punkte: 50
frage: "Ein Malerbetrieb mit vier Leuten will Anfragen bis zum Angebot zum Teil automatisch bearbeiten. Plane den Ablauf in zwei Schritten."
schritte:
  - typ: schiebe
    titel: "Die Reihenfolge"
    punkte: 20
    frage: "Bring die Schritte von der Anfrage bis zum Angebot in die richtige Reihenfolge."
    bausteine:
      - "Meisterin prüft das Angebot und gibt es frei"
      - "Modell ordnet die Anfrage einer Kategorie zu"
      - "Tabelle rechnet Stunden, Material und Umsatzsteuer"
      - "Anfrage kommt über das Kontaktformular"
      - "Angebot geht an die Kundschaft"
    loesung:
      - "Anfrage kommt über das Kontaktformular"
      - "Modell ordnet die Anfrage einer Kategorie zu"
      - "Tabelle rechnet Stunden, Material und Umsatzsteuer"
      - "Meisterin prüft das Angebot und gibt es frei"
      - "Angebot geht an die Kundschaft"
  - typ: quizkarten
    titel: "Wer macht was?"
    punkte: 30
    frage: "Wer übernimmt diesen Teil im Ablauf?"
    karten:
      - "Bruttopreis aus Nettosumme und Umsatzsteuer berechnen"
      - "Aus Stichworten eine verständliche Leistungsbeschreibung formulieren"
      - "Bei einem Stammkunden zehn Prozent Nachlass gewähren"
      - "Eine Erinnerung an den vereinbarten Besichtigungstermin senden"
    stapel: [Regel, Modell, Mensch]
    loesung:
      "Bruttopreis aus Nettosumme und Umsatzsteuer berechnen": Regel
      "Aus Stichworten eine verständliche Leistungsbeschreibung formulieren": Modell
      "Bei einem Stammkunden zehn Prozent Nachlass gewähren": Mensch
      "Eine Erinnerung an den vereinbarten Besichtigungstermin senden": Regel
richtzeit_s: 240
erklaerung: |
  Die Regel rechnet und erinnert, das Modell sortiert und formuliert, der
  Mensch gibt das Angebot frei und entscheidet über Nachlässe. So bleibt die
  Zusage bei dem, der dafür geradesteht.
```

## Dein Ablauf

```aufgabe
id: D2-21
typ: planung
titel: "Dein Bauplan für deinen Betrieb"
punkte: 60
frage: "Beschreibe für einen Dienstleistungsbetrieb aus deinem Umfeld, wie Anfragen bis zur Rechnung bearbeitet werden. Beantworte die Fragen aus der Tabelle: Terminregeln, Kategorien und was sofort zum Menschen geht, Fakten und Grenzen, wer rechnet, was ein Chatbot darf, Daten und Rechtsgrundlage, wer Zusagen gibt. Mindestens 120 Wörter."
pruefungen:
  - art: mindestens_woerter
    wert: 120
    punkte: 10
    begruendung: "Mindestens 120 Wörter."
  - art: enthaelt_eines
    werte: [termin, erinnerung, puffer, kalender]
    punkte: 10
    begruendung: "Du beschreibst die Terminregeln."
  - art: enthaelt_eines
    werte: [kategorie, sortier, einordn]
    punkte: 10
    begruendung: "Du sagst, wie Anfragen sortiert werden."
  - art: enthaelt_alle
    werte: [regel, modell]
    punkte: 10
    begruendung: "Du sagst, wo eine Regel und wo ein Modell arbeitet."
  - art: enthaelt_eines
    werte: [einwilligung, vertrag, dsgvo, datenschutz, rechtsgrundlage, notizfeld]
    punkte: 10
    begruendung: "Du sagst, welche Daten auf welcher Grundlage gespeichert werden."
  - art: enthaelt_eines
    werte: [freigabe, freigeben, gibt frei, entscheidet, mensch, zusage]
    punkte: 10
    begruendung: "Du legst fest, wer Zusagen gibt."
richtzeit_s: 900
erklaerung: |
  Routine läuft, Fakten kommen aus geprüften Listen, das Modell formuliert,
  und Zusagen gibt ein Mensch. Wenn dein Bauplan das an jeder Station zeigt,
  hast du den Kurs verstanden.
```
