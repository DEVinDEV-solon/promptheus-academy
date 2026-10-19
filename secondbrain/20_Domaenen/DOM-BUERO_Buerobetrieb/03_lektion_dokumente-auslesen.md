---
type: lesson
title: "Dokumente auslesen"
description: "Aus dem Scan werden Felder: Absender, Datum, Betrag. Das Modell liest sie in ein festes Format, und eine Regel prüft, ob die Zahlen zusammenpassen."
tags:
  - lesson
  - domaene
  - dom-buero
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 16
---

# Dokumente auslesen

## Vom Bild zum Feld

Die Rechnung ist als Rechnung erkannt (Lektion 2). Für die Weiterarbeit
braucht das Büro nicht das Bild, sondern **Felder**: wer, wann, wie viel. Das
geschieht in zwei Schritten:

1. **Texterkennung** (OCR) macht aus dem Scan Text.
2. Ein **Modell** findet in diesem Text die gesuchten Angaben und gibt sie in
   einem festen Format zurück, zum Beispiel als JSON (Stufe 4).

Fest heißt: immer dieselben Schlüssel, damit das nächste Programm weiß, wo es
suchen muss.

```aufgabe
id: D3-06
typ: technisch
titel: "Das feste Format"
punkte: 30
frage: "Schreibe einen gültigen JSON-Eintrag für ein ausgelesenes Dokument mit den Schlüsseln absender, datum und betrag. Die Werte darfst du erfinden."
pruefer: json_gueltig
schluessel: [absender, datum, betrag]
richtzeit_s: 150
hinweise:
  - text: "Geschweifte Klammern, Schlüssel und Texte in doppelten Anführungszeichen, Paare durch Kommas getrennt."
    kostet: 5
erklaerung: |
  Zum Beispiel {"absender": "Stadtwerke Musterstadt", "datum": "2026-03-14",
  "betrag": 182.40}. Das Datum im Format Jahr-Monat-Tag lässt sich sortieren
  und eindeutig lesen, der Betrag als Zahl ohne Währungszeichen rechnen.
```

## Was eine Regel danach prüft

Ein Modell kann sich verlesen: eine 8 statt einer 3, ein Datum im falschen
Jahr. Deshalb folgt auf das Auslesen eine **Plausibilitätsprüfung** durch
feste Regeln. Sie prüfen nicht, ob der Inhalt schön ist, sondern ob er in
sich stimmt.

```aufgabe
id: D3-07
typ: plugplay
titel: "Was die Regel prüfen kann"
punkte: 30
frage: "Welche Prüfungen kann eine feste Regel nach dem Auslesen zuverlässig erledigen?"
bausteine:
  - "Das Datum ist ein gültiges Datum und liegt nicht in der Zukunft"
  - "Die Summe der Positionen ergibt den Gesamtbetrag"
  - "Die IBAN hat eine gültige Prüfziffer"
  - "Der Ton des Schreibens ist freundlich"
  - "Der Absender klingt vertrauenswürdig"
  - "Die Rechnungsnummer ist nicht schon einmal gebucht"
loesung:
  - "Das Datum ist ein gültiges Datum und liegt nicht in der Zukunft"
  - "Die Summe der Positionen ergibt den Gesamtbetrag"
  - "Die IBAN hat eine gültige Prüfziffer"
  - "Die Rechnungsnummer ist nicht schon einmal gebucht"
richtzeit_s: 90
hinweise:
  - text: "Eine Regel kann rechnen und vergleichen, aber nicht einschätzen."
    kostet: 5
erklaerung: |
  Datum, Summe, Prüfziffer und Dublette sind feste Prüfungen mit eindeutigem
  Ergebnis. Ton und Vertrauenswürdigkeit sind Einschätzungen. Ob ein
  Absender echt ist, klärt ein Rückruf bei einer bekannten Nummer, nicht ein
  Gefühl.
```
