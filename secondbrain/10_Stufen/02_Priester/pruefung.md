---
type: exam
title: "Abschlussprüfung — Stufe 2 PRIESTER"
description: "Sechs Aufgaben zu Prompting, Iteration, Logik und Quellenkritik. 60 % zum Bestehen."
tags:
  - exam
  - stufe-2
timestamp: 2026-08-18T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 2
---

# Abschlussprüfung — PRIESTER

Sechs Aufgaben, **215 Punkte**, zum Bestehen 60 % — also 129.

```aufgabe
id: P2-01
typ: schiebe
titel: "Die fünf Bausteine"
punkte: 30
frage: "Ordne die Bausteine eines Auftrags."
bausteine: [beispiel, aufgabe, format, rolle, kontext]
loesung: [rolle, aufgabe, kontext, format, beispiel]
erklaerung: |
  Rolle, Aufgabe, Kontext, Format, Beispiel.
```

```aufgabe
id: P2-02
typ: denkaufgabe
titel: "Was hilft wirklich?"
punkte: 25
frage: "Welche dieser Zusätze verbessern einen Prompt messbar?"
mehrfach: true
optionen:
  - "„Antworte in höchstens fünf Stichpunkten.“"
  - "„Das ist sehr wichtig für meine Karriere.“"
  - "„Die Erklärung ist für ein Kind von zehn Jahren.“"
  - "„Du bist ein Weltklasse-Experte mit 30 Jahren Erfahrung.“"
loesung:
  - "„Antworte in höchstens fünf Stichpunkten.“"
  - "„Die Erklärung ist für ein Kind von zehn Jahren.“"
erklaerung: |
  Format und Kontext legen etwas fest. Beschwörungen und Dringlichkeit
  legen nichts fest - sie sind Anekdoten, keine Verfahren.
```

```aufgabe
id: P2-03
typ: denkaufgabe
titel: "Der ungültige Schluss"
punkte: 25
frage: "„Wenn ein Text erfundene Quellen enthält, stammt er von einer KI. Dieser Text hat keine erfundenen Quellen.“ — Was folgt?"
optionen:
  - "Der Text stammt nicht von einer KI."
  - "Nichts — der Schluss ist ungültig."
  - "Der Text stammt von einer KI."
  - "Der Text stammt wahrscheinlich von einem Menschen."
loesung: "Nichts — der Schluss ist ungültig."
erklaerung: |
  Fehlschluss der verneinten Voraussetzung: aus "wenn A dann B" und "nicht A"
  folgt nichts über B. Und die Voraussetzung ist ohnehin falsch - auch
  Menschen erfinden Quellen, und KI-Text kann richtige haben.
```

```aufgabe
id: P2-04
typ: uebereinstimmung
titel: "Drei Formen"
punkte: 30
frage: "Ordne zu."
links: [Misinformation, Desinformation, Malinformation, Kontextentzug]
rechts:
  - "Falsch, ohne Schädigungsabsicht"
  - "Falsch, mit Schädigungsabsicht"
  - "Zutreffend, aber aus dem Zusammenhang gerissen"
  - "Echtes Material, falscher Zusammenhang — die häufigste Technik"
loesung:
  Misinformation: "Falsch, ohne Schädigungsabsicht"
  Desinformation: "Falsch, mit Schädigungsabsicht"
  Malinformation: "Zutreffend, aber aus dem Zusammenhang gerissen"
  Kontextentzug: "Echtes Material, falscher Zusammenhang — die häufigste Technik"
erklaerung: |
  Malinformation ist wahr - deshalb findet ein Faktencheck sie nicht.
```

```aufgabe
id: P2-05
typ: mathe
titel: "Die Reihe"
punkte: 25
frage: "1, 4, 9, 16, 25, … — welche Zahl kommt als nächstes?"
loesung: 36
toleranz: 0
erklaerung: |
  Quadratzahlen: 6 x 6 = 36. Die Abstände wachsen um 2 (3, 5, 7, 9, 11).
```

```aufgabe
id: P2-06
typ: planung
titel: "Ein vollständiger Auftrag"
punkte: 80
frage: "Schreibe einen vollständigen Auftrag an ein Sprachmodell: Es soll die Hausordnung eines Mietshauses in einfache Sprache übersetzen. Nutze mindestens vier der fünf Bausteine. Mindestens 60 Wörter."
pruefungen:
  - art: mindestens_woerter
    wert: 60
    punkte: 15
    begruendung: "Mindestens 60 Wörter."
  - art: enthaelt_eines
    werte: [du bist, du agierst, agiere, in der rolle, antworte als, schreibe als, handle als]
    punkte: 15
    begruendung: "Rolle: du sagst, wer sprechen soll."
  - art: enthaelt_eines
    werte: [satz, stichpunkt, absatz, wörter, zeichen, liste, tabelle, abschnitt]
    punkte: 15
    begruendung: "Format: du legst Form oder Länge der Antwort fest."
  - art: enthaelt_eines
    werte: [für, zielgruppe, leser, bewohner, mieter, kind, deutsch als]
    punkte: 15
    begruendung: "Kontext: du sagst, für wen die Übersetzung ist."
  - art: enthaelt_eines
    werte: ["zum beispiel", beispiel, "etwa so", vorbild, muster]
    punkte: 10
    begruendung: "Beispiel: du zeigst, wie das Ergebnis aussehen soll."
  - art: enthaelt_nicht
    werte: [sehr wichtig für mich, weltklasse, bitte gib dir mühe, strenge dich an]
    punkte: 10
    begruendung: "Keine Beschwörungen — sie legen nichts fest."
erklaerung: |
  Die letzte Prüfung ist bewusst hart: Beschwörungen kosten Platz im
  Kontextfenster und legen nichts fest. Was zählt, steht in den anderen fünf.
```
