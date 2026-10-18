---
type: exam
title: "Abschlussprüfung — Stufe 6 MEISTER"
description: "Sechs Aufgaben zu Bau, Tests, Betrieb, Übergabe und Wirtschaftlichkeit. 60 % zum Bestehen."
tags:
  - exam
  - stufe-6
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 6
---

# Abschlussprüfung — MEISTER

Sechs Aufgaben, **200 Punkte**, zum Bestehen 60 % — also 120. Danach ist der
7. Kurs frei.

```aufgabe
id: P6-01
typ: schiebe
titel: "Ein Schritt beim Bauen"
punkte: 25
frage: "Bring die Schritte beim Bauen eines Programmteils in die richtige Reihenfolge."
bausteine:
  - "Testen, auch an den Grenzen"
  - "Sichern mit klarer Beschreibung"
  - "Kleiner, genauer Auftrag"
  - "Code lesen und prüfen"
loesung:
  - "Kleiner, genauer Auftrag"
  - "Code lesen und prüfen"
  - "Testen, auch an den Grenzen"
  - "Sichern mit klarer Beschreibung"
erklaerung: |
  Auftrag, lesen, testen, sichern - gesichert wird nur, was läuft.
```

```aufgabe
id: P6-02
typ: uebereinstimmung
titel: "Testfälle"
punkte: 30
frage: "Eine Funktion prüft, ob jemand volljährig ist. Ordne jeden Testfall seiner Sorte zu."
links:
  - "Alter 30"
  - "Alter genau 18"
  - "Kein Alter angegeben"
  - "Alter „achtzehn“ als Wort"
rechts:
  - "Normalfall"
  - "Grenze"
  - "Leerer Fall"
  - "Falscher Fall"
loesung:
  "Alter 30": "Normalfall"
  "Alter genau 18": "Grenze"
  "Kein Alter angegeben": "Leerer Fall"
  "Alter „achtzehn“ als Wort": "Falscher Fall"
erklaerung: |
  Normalfall, Grenze, leer, falsch - an der Grenze irren Programme am
  häufigsten.
```

```aufgabe
id: P6-03
typ: plugplay
titel: "Prüfbar bei einem Modell"
punkte: 30
frage: "Welche Eigenschaften einer Modellantwort lassen sich automatisch prüfen?"
bausteine:
  - "Höchstens 120 Wörter"
  - "Gültiges JSON mit Pflichtfeldern"
  - "Klingt sympathisch"
  - "Enthält kein verbotenes Wort"
loesung:
  - "Höchstens 120 Wörter"
  - "Gültiges JSON mit Pflichtfeldern"
  - "Enthält kein verbotenes Wort"
erklaerung: |
  Zählbares prüft ein Test, Urteile prüfen Menschen.
```

```aufgabe
id: P6-04
typ: schiebe
titel: "Ein gemeldeter Fehler"
punkte: 30
frage: "Bring die Schritte beim Beheben eines gemeldeten Fehlers in die richtige Reihenfolge."
bausteine:
  - "Beheben, bis alle Tests grün sind"
  - "Den Fehler nachstellen"
  - "Sichern und ausrollen"
  - "Einen Test schreiben, der den Fehler zeigt"
loesung:
  - "Den Fehler nachstellen"
  - "Einen Test schreiben, der den Fehler zeigt"
  - "Beheben, bis alle Tests grün sind"
  - "Sichern und ausrollen"
erklaerung: |
  Der Test für den Fehler bleibt - und verhindert, dass er wiederkommt.
```

```aufgabe
id: P6-05
typ: mathe
titel: "Wann lohnt es sich?"
punkte: 30
frage: "Der Bau hat 30 Stunden gedauert. Die Lösung spart 20 Minuten an jedem von 21 Arbeitstagen im Monat, die Wartung kostet 2 Stunden im Monat. Nach wie vielen Monaten hat sich die Bauzeit zurückgezahlt?"
loesung: 6
toleranz: 0
erklaerung: |
  20 × 21 = 420 Minuten = 7 Stunden, minus 2 Stunden Wartung = 5 Stunden im
  Monat. 30 ÷ 5 = 6 Monate.
```

```aufgabe
id: P6-06
typ: planung
titel: "Bereit für den Betrieb?"
punkte: 55
frage: "Beschreibe in mindestens 80 Wörtern, was eine Lösung braucht, bevor sie in den Betrieb geht und an jemand anderen übergeben wird: Tests, Überwachung, Dokumentation und Wartung."
pruefungen:
  - art: mindestens_woerter
    wert: 80
    punkte: 10
    begruendung: "Mindestens 80 Wörter."
  - art: enthaelt_eines
    werte: [test, getestet, grenzfall]
    punkte: 10
    begruendung: "Du nennst die Tests."
  - art: enthaelt_eines
    werte: [überwachung, protokoll, meldung, alarm]
    punkte: 10
    begruendung: "Du nennst die Überwachung."
  - art: enthaelt_eines
    werte: [anleitung, dokumentation, betriebshandbuch, entwurfsnotiz]
    punkte: 15
    begruendung: "Du nennst die Dokumentation."
  - art: enthaelt_eines
    werte: [wartung, wartungstermin, updates, zugänge prüfen]
    punkte: 10
    begruendung: "Du nennst die Wartung."
erklaerung: |
  Getestet, überwacht, dokumentiert, gewartet - dann besteht eine Lösung den
  Lastwagen-Test und kann übergeben werden.
```
