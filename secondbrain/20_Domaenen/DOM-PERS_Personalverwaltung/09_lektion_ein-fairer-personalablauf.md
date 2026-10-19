---
type: lesson
title: "Ein fairer Personalablauf"
description: "Alles aus diesem Kurs an einem Stück: ein Ablauf von der Anzeige bis zur Einstellung, in dem Werkzeuge verwalten und zuordnen — und Menschen über Menschen entscheiden."
tags:
  - lesson
  - domaene
  - dom-pers
  - projekt
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 30
---

# Ein fairer Personalablauf

## Alles an einem Stück

Du bist den Weg von der Anzeige bis zum Arbeitsalltag gegangen. Jetzt setzt
du daraus einen Ablauf für eine Stelle in deinem Umfeld zusammen.

| Frage | aus Lektion |
|---|---|
| Ist die Anzeige neutral, und nennt sie Fähigkeiten statt Etiketten? | 2 — Stellenanzeigen |
| Was macht das Werkzeug bei der Auswahl, was der Mensch, und wer wird informiert? | 3 — Bewerbungen vorsortieren |
| Welche Muss- und Kann-Kriterien gelten, wie gewichtet? | 4 — Kriterien statt Bauchgefühl |
| Wie werden Zeugnisse gelesen? | 5 — Arbeitszeugnisse lesen |
| Welche Daten darf das Werkzeug sehen, und ist der Betriebsrat beteiligt? | 6 — Personaldaten und Betriebsrat |
| Welche Fragen beantwortet ein Bot, welche ein Mensch? | 7 — Ein Wissensbot fürs Team |
| Was ist verboten? | 8 — Gespräche und Feedback |

```aufgabe
id: D9-20
typ: multitask
titel: "Eine Stelle in der Buchhaltung"
punkte: 50
frage: "Ein mittelständischer Betrieb mit Betriebsrat besetzt eine Stelle in der Buchhaltung und erwartet rund 150 Bewerbungen. Plane den Ablauf in zwei Schritten."
schritte:
  - typ: schiebe
    titel: "Die Reihenfolge"
    punkte: 20
    frage: "Bring die Schritte in die richtige Reihenfolge."
    bausteine:
      - "Neutrale Anzeige aus dem Profil schreiben und prüfen"
      - "Das Auswahlteam liest die Bewerbungen und lädt ein"
      - "Anforderungsprofil festlegen, Betriebsrat beteiligen"
      - "Werkzeug ordnet Angaben den Kriterien zu, mit Fundstelle"
      - "Gespräche führen und nach gewichteten Kriterien bewerten"
    loesung:
      - "Anforderungsprofil festlegen, Betriebsrat beteiligen"
      - "Neutrale Anzeige aus dem Profil schreiben und prüfen"
      - "Werkzeug ordnet Angaben den Kriterien zu, mit Fundstelle"
      - "Das Auswahlteam liest die Bewerbungen und lädt ein"
      - "Gespräche führen und nach gewichteten Kriterien bewerten"
  - typ: quizkarten
    titel: "Wer macht was?"
    punkte: 30
    frage: "Wer übernimmt diesen Teil im Ablauf?"
    karten:
      - "Den Eingang jeder Bewerbung bestätigen"
      - "Die Angaben zur Berufserfahrung den Kriterien zuordnen"
      - "Entscheiden, wer zum Gespräch eingeladen wird"
      - "Den gewichteten Wert aus den Bewertungen des Teams rechnen"
    stapel: [Regel, Modell, Mensch]
    loesung:
      "Den Eingang jeder Bewerbung bestätigen": Regel
      "Die Angaben zur Berufserfahrung den Kriterien zuordnen": Modell
      "Entscheiden, wer zum Gespräch eingeladen wird": Mensch
      "Den gewichteten Wert aus den Bewertungen des Teams rechnen": Regel
richtzeit_s: 240
erklaerung: |
  Profil und Betriebsrat stehen am Anfang, nicht am Ende. Das Modell ordnet
  zu, die Regel bestätigt und rechnet, und über Einladung und Zusage
  entscheiden Menschen.
```

## Dein Ablauf

```aufgabe
id: D9-21
typ: planung
titel: "Dein Bauplan für eine Stellenbesetzung"
punkte: 60
frage: "Beschreibe für eine Stelle aus deinem Umfeld, wie du sie mit Unterstützung von Werkzeugen fair besetzt. Beantworte die Fragen aus der Tabelle: Anzeige, Rolle des Werkzeugs und des Menschen, Kriterien, Zeugnisse, Datenschutz und Betriebsrat, was verboten ist. Mindestens 120 Wörter."
pruefungen:
  - art: mindestens_woerter
    wert: 120
    punkte: 10
    begruendung: "Mindestens 120 Wörter."
  - art: enthaelt_eines
    werte: [agg, neutral, benachteilig, diskriminier]
    punkte: 10
    begruendung: "Du sorgst für eine neutrale Anzeige."
  - art: enthaelt_eines
    werte: [mensch entscheidet, liest jede, entscheidet selbst, auswahlteam, art. 22, mensch]
    punkte: 10
    begruendung: "Du legst fest, dass Menschen entscheiden."
  - art: enthaelt_eines
    werte: [kriteri, anforderungsprofil, gewicht]
    punkte: 10
    begruendung: "Du nennst Kriterien und Gewichtung."
  - art: enthaelt_eines
    werte: [betriebsrat, datenschutz, dsgvo, personaldaten, informiert]
    punkte: 10
    begruendung: "Du denkst an Datenschutz und Betriebsrat."
  - art: enthaelt_eines
    werte: [hochrisiko, hohes risiko, ai act, emotionserkennung, verboten]
    punkte: 10
    begruendung: "Du kennst die Grenzen aus dem AI Act."
richtzeit_s: 900
erklaerung: |
  Ein Werkzeug kann die Personalarbeit entlasten, wenn es verwaltet und
  zuordnet. Über Menschen entscheiden Menschen - nachvollziehbar, nach
  festen Kriterien und mit den Rechten aller Beteiligten im Blick. Wenn dein
  Bauplan das zeigt, hast du den Kurs verstanden.
```
