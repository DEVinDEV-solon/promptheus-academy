---
type: exam
title: "Abschlussprüfung — Stufe 3 BUILDER"
description: "Sechs Aufgaben zu Abläufen, Code lesen, Werkzeugen, Fehlerfällen und Kosten. 60 % zum Bestehen."
tags:
  - exam
  - stufe-3
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 3
---

# Abschlussprüfung — BUILDER

Sechs Aufgaben, **200 Punkte**, zum Bestehen 60 % — also 120.

```aufgabe
id: P3-01
typ: schiebe
titel: "Die Agentenschleife"
punkte: 25
frage: "Ordne die Schritte eines Agenten."
bausteine:
  - "Handeln"
  - "Von vorn beginnen"
  - "Wahrnehmen"
  - "Entscheiden"
loesung:
  - "Wahrnehmen"
  - "Entscheiden"
  - "Handeln"
  - "Von vorn beginnen"
erklaerung: |
  Wahrnehmen, Entscheiden, Handeln, wiederholen.
```

```aufgabe
id: P3-02
typ: plugplay
titel: "Regel oder Modell?"
punkte: 30
frage: "Wähle die Schritte, für die ein Sprachmodell nötig ist."
bausteine:
  - "Prüfen, ob eine Datei eine PDF ist"
  - "Erkennen, ob ein Brief eine Mahnung ist"
  - "Prüfen, ob ein Datum in der Zukunft liegt"
  - "Eine Antwort auf eine Kundenfrage entwerfen"
loesung:
  - "Erkennen, ob ein Brief eine Mahnung ist"
  - "Eine Antwort auf eine Kundenfrage entwerfen"
erklaerung: |
  Dateityp und Datumsvergleich sind Regeln. Bedeutung erkennen und
  formulieren kann nur ein Modell.
```

```aufgabe
id: P3-03
typ: mathe
titel: "Was druckt das Programm?"
punkte: 30
frage: "werte = [4, 15, 9, 22]; summe = 0; für jeden Wert w: wenn w >= 9, dann summe = summe + w. Welche Zahl steht am Ende in summe?"
loesung: 46
toleranz: 0
erklaerung: |
  15 + 9 + 22 = 46. Die 9 zählt mit, weil >= die Grenze einschließt; die 4
  fällt heraus.
```

```aufgabe
id: P3-04
typ: schiebe
titel: "Der Weg eines Werkzeugaufrufs"
punkte: 30
frage: "Bring die Schritte eines Werkzeugaufrufs in die richtige Reihenfolge."
bausteine:
  - "Das Programm führt aus und meldet das Ergebnis"
  - "Das Modell schreibt den Aufruf"
  - "Das Modell antwortet dem Nutzer"
  - "Das Programm prüft, ob der Aufruf gültig und erlaubt ist"
loesung:
  - "Das Modell schreibt den Aufruf"
  - "Das Programm prüft, ob der Aufruf gültig und erlaubt ist"
  - "Das Programm führt aus und meldet das Ergebnis"
  - "Das Modell antwortet dem Nutzer"
erklaerung: |
  Das Modell schlägt vor, das Programm prüft und handelt.
```

```aufgabe
id: P3-05
typ: uebereinstimmung
titel: "Fehler und Antwort"
punkte: 30
frage: "Ordne jedem Fehler die passende Reaktion zu."
links:
  - "Der Server antwortet für einige Sekunden nicht"
  - "Die Eingabedatei ist beschädigt"
  - "Eine Zahlung über 5.000 Euro soll freigegeben werden"
rechts:
  - "Wiederholen, mit wachsender Wartezeit"
  - "Abbrechen und melden"
  - "Einen Menschen fragen"
loesung:
  "Der Server antwortet für einige Sekunden nicht": "Wiederholen, mit wachsender Wartezeit"
  "Die Eingabedatei ist beschädigt": "Abbrechen und melden"
  "Eine Zahlung über 5.000 Euro soll freigegeben werden": "Einen Menschen fragen"
erklaerung: |
  Vorübergehendes wiederholen, Dauerhaftes melden, Folgenreiches einem
  Menschen geben.
```

```aufgabe
id: P3-06
typ: planung
titel: "Ein Ablauf, vollständig beschrieben"
punkte: 55
frage: "Beschreibe einen Ablauf, der eingehende Bewerbungen sortiert. Nenne Auslöser, wo eine Regel und wo ein Modell entscheidet, was im Fehlerfall passiert und wie du die Kosten begrenzt. Mindestens 80 Wörter."
pruefungen:
  - art: mindestens_woerter
    wert: 80
    punkte: 10
    begruendung: "Mindestens 80 Wörter."
  - art: enthaelt_eines
    werte: [auslöser, kommt an, eingang, startet, sobald]
    punkte: 10
    begruendung: "Du nennst den Auslöser."
  - art: enthaelt_alle
    werte: [regel, modell]
    punkte: 15
    begruendung: "Du sagst, wo eine Regel und wo ein Modell entscheidet."
  - art: enthaelt_eines
    werte: [fehler, abbrechen, wiederholen, mensch, melden]
    punkte: 10
    begruendung: "Du legst den Fehlerfall fest."
  - art: enthaelt_eines
    werte: [kosten, deckel, höchstens, grenze, tokens, sparen]
    punkte: 10
    begruendung: "Du begrenzt die Kosten."
erklaerung: |
  Auslöser, Regel vor Modell, ein festgelegter Fehlerfall und eine
  Kostengrenze: Das sind die vier Dinge, an denen ein Ablauf in der Praxis
  scheitert, wenn sie fehlen.
```
