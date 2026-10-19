---
type: lesson
title: "Ein eigener Antragsablauf"
description: "Alles aus diesem Kurs an einem Stück: ein Antragsverfahren, in dem Werkzeuge prüfen, ausfüllen, rechnen und erklären — und Menschen abwägen, begründen und verantworten."
tags:
  - lesson
  - domaene
  - dom-buero2
  - projekt
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 30
---

# Ein eigener Antragsablauf

## Alles an einem Stück

Du bist den Weg eines Antrags einmal ganz gegangen. Jetzt setzt du ihn für
ein Verfahren aus deinem Umfeld zusammen.

| Frage | aus Lektion |
|---|---|
| Was prüft die Checkliste, was der Mensch? | 2 — Anträge prüfen |
| Woher kommen die Daten, und was prüft die Regel danach? | 3 — Formulare ausfüllen |
| Wie werden Bekanntgabe und Fristen berechnet? | 4 — Fristen und Wiedervorlage |
| Wie wird der Bescheid verständlich, ohne Verbindliches zu ändern? | 5 — Bescheide verständlich |
| Wo gibt es Ermessen, und wer wägt ab? | 6 — Ermessen und Begründung |
| Was beantwortet der Chatbot, was die Sachbearbeitung? | 7 — Bürgeranfragen |
| Welche Daten dürfen woher übernommen werden? | 8 — Daten zwischen Behörden |

```aufgabe
id: D10-20
typ: multitask
titel: "Ein Antrag auf Anwohnerparken"
punkte: 50
frage: "Eine Stadt bekommt jedes Jahr tausende Anträge auf einen Bewohnerparkausweis. Die Gebühr steht in einer festen Tabelle, Ausnahmen für Pflegedienste werden nach Ermessen erteilt. Plane den Ablauf in zwei Schritten."
schritte:
  - typ: schiebe
    titel: "Die Reihenfolge"
    punkte: 20
    frage: "Bring die Schritte für einen Regelantrag in die richtige Reihenfolge."
    bausteine:
      - "Bescheid mit Gebühr nach Tabelle wird erstellt, mit verständlichem Begleittext"
      - "Checkliste prüft Vollständigkeit, Wohnsitz wird mit Rechtsgrundlage abgeglichen"
      - "Antrag kommt über das Portal, Eingang wird bestätigt"
      - "Bekanntgabe und Widerspruchsfrist werden berechnet und vermerkt"
    loesung:
      - "Antrag kommt über das Portal, Eingang wird bestätigt"
      - "Checkliste prüft Vollständigkeit, Wohnsitz wird mit Rechtsgrundlage abgeglichen"
      - "Bescheid mit Gebühr nach Tabelle wird erstellt, mit verständlichem Begleittext"
      - "Bekanntgabe und Widerspruchsfrist werden berechnet und vermerkt"
  - typ: quizkarten
    titel: "Wer macht was?"
    punkte: 30
    frage: "Wer übernimmt diesen Teil im Ablauf?"
    karten:
      - "Die Gebühr nach der Gebührentabelle festsetzen"
      - "Einen Begleittext in klarer Sprache entwerfen"
      - "Über eine Ausnahme für einen Pflegedienst entscheiden"
      - "Das Ende der Widerspruchsfrist berechnen"
    stapel: [Regel, Modell, Mensch]
    loesung:
      "Die Gebühr nach der Gebührentabelle festsetzen": Regel
      "Einen Begleittext in klarer Sprache entwerfen": Modell
      "Über eine Ausnahme für einen Pflegedienst entscheiden": Mensch
      "Das Ende der Widerspruchsfrist berechnen": Regel
richtzeit_s: 240
erklaerung: |
  Der Regelantrag ohne Spielraum kann weitgehend automatisch laufen, wenn
  eine Rechtsvorschrift es erlaubt. Die Ausnahme nach Ermessen nicht. Das
  Modell hilft beim Erklären, die Regel beim Rechnen.
```

## Dein Ablauf

```aufgabe
id: D10-21
typ: planung
titel: "Dein Bauplan für ein Antragsverfahren"
punkte: 60
frage: "Beschreibe ein Antragsverfahren aus deinem Umfeld, in dem Werkzeuge helfen. Beantworte die Fragen aus der Tabelle: Prüfung, Datenquellen, Fristen, verständlicher Bescheid, Ermessen, Chatbot, Datenschutz. Mindestens 120 Wörter."
pruefungen:
  - art: mindestens_woerter
    wert: 120
    punkte: 10
    begruendung: "Mindestens 120 Wörter."
  - art: enthaelt_eines
    werte: [checkliste, vollständig, formell]
    punkte: 10
    begruendung: "Du beschreibst die Prüfung auf Vollständigkeit."
  - art: enthaelt_eines
    werte: [frist, bekanntgabe, widerspruch, wiedervorlage]
    punkte: 10
    begruendung: "Du denkst an Fristen."
  - art: enthaelt_eines
    werte: [ermessen, abwäg, härtefall, ausnahme, beurteilungsspielraum]
    punkte: 10
    begruendung: "Du sagst, wo abgewogen wird."
  - art: enthaelt_eines
    werte: [zweckbindung, rechtsgrundlage, datenschutz, dsgvo, once-only]
    punkte: 10
    begruendung: "Du sagst, welche Daten woher übernommen werden dürfen."
  - art: enthaelt_eines
    werte: [mensch, sachbearbeit, entscheidet, verantwort, begründ]
    punkte: 10
    begruendung: "Du legst fest, wer entscheidet und begründet."
richtzeit_s: 900
erklaerung: |
  Ein gutes Verfahren entlastet die Verwaltung bei allem, was feststeht, und
  lässt Zeit für das, was Abwägung braucht. Wenn dein Bauplan zeigt, wo die
  Regel rechnet, das Modell erklärt und der Mensch entscheidet, hast du den
  Kurs verstanden.
```
