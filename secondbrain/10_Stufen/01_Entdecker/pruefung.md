---
type: exam
title: "Abschlussprüfung — Stufe 1 ENTDECKER"
description: "Sieben Aufgaben quer durch die Stufe. 60 % zum Bestehen."
tags:
  - exam
  - stufe-1
timestamp: 2026-08-18T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 1
---

# Abschlussprüfung — ENTDECKER

Sieben Aufgaben, **200 Punkte**, zum Bestehen brauchst du 60 % — also 120.

Keine Hinweise, keine Musterlösung, keine Zeitbegrenzung. Alles wird am Ende
gemeinsam bewertet. Du darfst die Prüfung so oft wiederholen, wie du willst;
es kostet nichts und niemand hält es dir vor.

```aufgabe
id: P1-01
typ: denkaufgabe
titel: "Der Kern"
punkte: 20
frage: "Was tut ein Sprachmodell, wenn es antwortet?"
optionen:
  - "Es sucht die Antwort in seinem Speicher und gibt sie aus."
  - "Es berechnet wiederholt das wahrscheinlichste nächste Token und zieht eines."
  - "Es übersetzt die Frage in eine Datenbankabfrage."
  - "Es vergleicht die Frage mit gespeicherten Frage-Antwort-Paaren."
loesung: "Es berechnet wiederholt das wahrscheinlichste nächste Token und zieht eines."
erklaerung: |
  Vorhersagen und ziehen, Token für Token. Kein Nachschlagen, kein Abgleich.
```

```aufgabe
id: P1-02
typ: mathe
titel: "Tokens rechnen"
punkte: 25
frage: "Ein deutscher Aufsatz hat 750 Wörter. Wie viele Tokens sind das ungefähr (2,0 Tokens je Wort)?"
loesung: 1500
toleranz: 75
einheit: "Tokens"
erklaerung: |
  750 x 2,0 = 1500. Im Englischen wären es bei 1,3 nur rund 975 - derselbe
  Text, ein Drittel weniger.
```

```aufgabe
id: P1-03
typ: schiebe
titel: "Die Schleife"
punkte: 30
frage: "Bringe die Schritte in die richtige Reihenfolge."
bausteine:
  - "Ein Token wird nach Wahrscheinlichkeit gezogen"
  - "Der Text wird in Tokens zerlegt"
  - "Das gezogene Token wird angehängt"
  - "Für jedes mögliche nächste Token wird ein Logit berechnet"
  - "Die Logits werden in Wahrscheinlichkeiten umgerechnet"
loesung:
  - "Der Text wird in Tokens zerlegt"
  - "Für jedes mögliche nächste Token wird ein Logit berechnet"
  - "Die Logits werden in Wahrscheinlichkeiten umgerechnet"
  - "Ein Token wird nach Wahrscheinlichkeit gezogen"
  - "Das gezogene Token wird angehängt"
erklaerung: |
  Zerlegen, rechnen, umrechnen, ziehen, anhängen - und von vorn.
```

```aufgabe
id: P1-04
typ: uebereinstimmung
titel: "Begriffe"
punkte: 25
frage: "Ordne zu."
links: [Token, Temperatur, Kontextfenster, Entropie]
rechts:
  - "Der Baustein, mit dem ein Modell rechnet"
  - "Der Regler, wie riskant gezogen wird"
  - "Wie viel Text das Modell auf einmal sehen kann"
  - "Wie viel Wahlfreiheit an einer Stelle besteht"
loesung:
  Token: "Der Baustein, mit dem ein Modell rechnet"
  Temperatur: "Der Regler, wie riskant gezogen wird"
  Kontextfenster: "Wie viel Text das Modell auf einmal sehen kann"
  Entropie: "Wie viel Wahlfreiheit an einer Stelle besteht"
erklaerung: |
  Diese vier Begriffe tragen die gesamte Stufe 1.
```

```aufgabe
id: P1-05
typ: denkaufgabe
titel: "Zweimal dieselbe Frage"
punkte: 25
frage: "Du stellst demselben Modell zweimal dieselbe Frage und bekommst zwei verschiedene Antworten. Warum?"
mehrfach: true
optionen:
  - "Weil das nächste Token nach Wahrscheinlichkeit gezogen wird, nicht fest gewählt."
  - "Weil das Modell zwischendurch dazugelernt hat."
  - "Bei Temperatur 0 würde zweimal dasselbe herauskommen."
  - "Weil das Modell im Internet nachgesehen hat und sich die Seite geändert hat."
loesung:
  - "Weil das nächste Token nach Wahrscheinlichkeit gezogen wird, nicht fest gewählt."
  - "Bei Temperatur 0 würde zweimal dasselbe herauskommen."
erklaerung: |
  Ein Modell lernt im Gespräch nicht dazu - seine Gewichte stehen fest.
  Was sich ändert, ist die Ziehung.
```

```aufgabe
id: P1-06
typ: denkaufgabe
titel: "Entscheidungen mit Folgen"
punkte: 25
frage: "Bei welcher maschinellen Entscheidung ist ein Mensch im Verfahren besonders wichtig?"
optionen:
  - "Bei der Auswahl des nächsten Musikstücks"
  - "Bei der Vorsortierung von Bewerbungen"
  - "Bei der automatischen Bildschärfung im Telefon"
  - "Bei der Rechtschreibprüfung"
loesung: "Bei der Vorsortierung von Bewerbungen"
erklaerung: |
  Weil es eine Person erheblich betrifft und sie den Fehler nicht bemerkt.
  Genau darum geht es in Artikel 22 DSGVO.
```

```aufgabe
id: P1-07
typ: planung
titel: "Erklär es jemandem"
punkte: 50
frage: "Erkläre in mindestens 50 Wörtern jemandem ohne Vorwissen, was ein Sprachmodell tut. Benutze die Begriffe Token und Wahrscheinlichkeit — und sage auch, warum es Dinge erfinden kann."
pruefungen:
  - art: enthaelt_alle
    werte: [token, wahrscheinlich]
    punkte: 20
    begruendung: "Beide Fachbegriffe kommen vor: Token und Wahrscheinlichkeit."
  - art: enthaelt_eines
    werte: [erfind, halluzin, ausgedacht, falsch, stimmt nicht]
    punkte: 15
    begruendung: "Du sprichst an, dass ein Modell Dinge erfinden kann."
  - art: mindestens_woerter
    wert: 50
    punkte: 10
    begruendung: "Mindestens 50 Wörter."
  - art: enthaelt_nicht
    werte: [gehirn, denkt nach, versteht wirklich, bewusstsein]
    punkte: 5
    begruendung: "Du greifst NICHT zum Gehirn-Bild — es erklärt nichts und führt in die Irre."
erklaerung: |
  Die letzte Prüfung ist die interessanteste: das Gehirn-Bild ist bequem und
  falsch. Wer es benutzt, hat den Vorgang nicht erklärt, sondern durch ein
  anderes Rätsel ersetzt.
```
