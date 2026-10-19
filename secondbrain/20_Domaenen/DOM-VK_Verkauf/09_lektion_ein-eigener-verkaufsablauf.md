---
type: lesson
title: "Ein eigener Verkaufsablauf"
description: "Alles aus diesem Kurs an einem Stück: ein Verkaufsablauf, in dem Werkzeuge bewerten, pflegen, rechnen und entwerfen — und Menschen versprechen."
tags:
  - lesson
  - domaene
  - dom-vk
  - projekt
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 30
---

# Ein eigener Verkaufsablauf

## Alles an einem Stück

Du bist den Weg eines Geschäfts einmal ganz gegangen. Jetzt setzt du ihn für
deinen eigenen Verkauf zusammen.

| Frage | aus Lektion |
|---|---|
| Nach welchen sachlichen Kriterien werden Interessenten bewertet? | 2 — Interessenten bewerten |
| Wie bleibt das CRM sauber, und wer führt Dubletten zusammen? | 3 — Das CRM pflegen |
| Was wird recherchiert, und welcher Weg zur Ansprache ist erlaubt? | 4 — Kunden recherchieren |
| Woher kommen die Fakten in der ersten Nachricht? | 5 — Ansprache ohne Lüge |
| Wie wird die Prognose gerechnet? | 6 — Umsatz prognostizieren |
| Woher kommen Preise, und wer gibt Rabatte frei? | 7 — Angebote mit KI |
| Was kommt nach dem Gespräch ins CRM? | 8 — Gespräche vorbereiten |

```aufgabe
id: D4-19
typ: multitask
titel: "Der Ablauf für einen Regalhersteller"
punkte: 50
frage: "Ein Regalhersteller mit drei Verkäufern will Anfragen bis zum Angebot zum Teil automatisch bearbeiten. Plane den Ablauf in zwei Schritten."
schritte:
  - typ: schiebe
    titel: "Die Reihenfolge"
    punkte: 20
    frage: "Bring die Schritte in die richtige Reihenfolge."
    bausteine:
      - "Regel bewertet den Interessenten nach festen Kriterien"
      - "Verkäufer prüft den Entwurf und sendet die Antwort"
      - "Anfrage kommt über das Webformular"
      - "Modell entwirft eine Antwort nur aus den Angaben im CRM"
      - "Werkzeug legt den Interessenten im CRM an und prüft auf Dubletten"
    loesung:
      - "Anfrage kommt über das Webformular"
      - "Werkzeug legt den Interessenten im CRM an und prüft auf Dubletten"
      - "Regel bewertet den Interessenten nach festen Kriterien"
      - "Modell entwirft eine Antwort nur aus den Angaben im CRM"
      - "Verkäufer prüft den Entwurf und sendet die Antwort"
  - typ: quizkarten
    titel: "Wer macht was?"
    punkte: 30
    frage: "Wer übernimmt diesen Teil im Ablauf?"
    karten:
      - "Die gewichtete Prognose für das Quartal rechnen"
      - "Aus Gesprächsnotizen Risiken für ein Geschäft herauslesen"
      - "12 Prozent Rabatt für einen Neukunden freigeben"
      - "Prüfen, ob für eine Werbe-E-Mail eine Einwilligung vorliegt"
    stapel: [Regel, Modell, Mensch]
    loesung:
      "Die gewichtete Prognose für das Quartal rechnen": Regel
      "Aus Gesprächsnotizen Risiken für ein Geschäft herauslesen": Modell
      "12 Prozent Rabatt für einen Neukunden freigeben": Mensch
      "Prüfen, ob für eine Werbe-E-Mail eine Einwilligung vorliegt": Regel
richtzeit_s: 240
erklaerung: |
  Ob eine Einwilligung vorliegt, ist ein Feld im CRM - das prüft eine Regel,
  bevor eine Mail rausgeht. Rechnen macht die Regel, Lesen und Entwerfen das
  Modell, Rabatt und Versand der Mensch.
```

## Dein Ablauf

```aufgabe
id: D4-20
typ: planung
titel: "Dein Bauplan für den Verkauf"
punkte: 60
frage: "Beschreibe einen Verkaufsablauf für ein Unternehmen aus deinem Umfeld. Beantworte die Fragen aus der Tabelle: Kriterien der Bewertung, CRM und Dubletten, Recherche und erlaubte Ansprache, Fakten in der Nachricht, Prognose, Preise und Rabattfreigabe, Notizen. Mindestens 120 Wörter."
pruefungen:
  - art: mindestens_woerter
    wert: 120
    punkte: 10
    begruendung: "Mindestens 120 Wörter."
  - art: enthaelt_eines
    werte: [kriteri, punkte, bewert]
    punkte: 10
    begruendung: "Du nennst die Kriterien der Bewertung."
  - art: enthaelt_eines
    werte: [einwilligung, uwg, erlaubt, werbung]
    punkte: 10
    begruendung: "Du sagst, welche Ansprache erlaubt ist."
  - art: enthaelt_eines
    werte: [gewichtet, wahrscheinlichkeit, prognose, pipeline]
    punkte: 10
    begruendung: "Du sagst, wie die Prognose entsteht."
  - art: enthaelt_eines
    werte: [preisliste, rabatt, freigabe, freigeben, gibt frei]
    punkte: 10
    begruendung: "Du sagst, woher Preise kommen und wer Rabatte freigibt."
  - art: enthaelt_eines
    werte: [nicht erfinden, fakten, crm, keine erfundenen, prüft, mensch]
    punkte: 10
    begruendung: "Du sagst, wie erfundene Aussagen verhindert werden."
richtzeit_s: 900
erklaerung: |
  Sachliche Kriterien, ein sauberes CRM, erlaubte Wege, Fakten statt
  Erfindungen, gewichtete Zahlen und klare Freigaben. Wenn dein Bauplan das
  zeigt, hast du den Kurs verstanden.
```
