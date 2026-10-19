---
type: lesson
title: "Formulare ausfüllen"
description: "Was die Verwaltung schon weiß, soll niemand noch einmal eintragen müssen. Werkzeuge übernehmen Daten und füllen Felder aus Freitext. Eine Regel prüft, ob das Ergebnis gültig ist."
tags:
  - lesson
  - domaene
  - dom-buero2
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 14
---

# Formulare ausfüllen

## Felder aus Freitext

Der Antrag aus Lektion 2 ist vollständig. Jetzt müssen seine Angaben in die
Fachanwendung, Feld für Feld. Kommt der Antrag als Brief oder freie E-Mail,
kann ein Modell die Angaben herauslesen und in ein festes Format bringen
(Stufe 4), damit die Fachanwendung sie übernehmen kann.

```aufgabe
id: D10-06
typ: technisch
titel: "Ein Antrag als JSON"
punkte: 30
frage: "Schreibe einen gültigen JSON-Eintrag für einen ausgelesenen Antrag mit den Schlüsseln aktenzeichen, antragsart und eingang. Die Werte darfst du erfinden."
pruefer: json_gueltig
schluessel: [aktenzeichen, antragsart, eingang]
richtzeit_s: 150
hinweise:
  - text: "Geschweifte Klammern, Schlüssel und Texte in doppelten Anführungszeichen, Paare durch Kommas getrennt."
    kostet: 5
erklaerung: |
  Etwa {"aktenzeichen": "2026-WG-0815", "antragsart": "Wohngeld",
  "eingang": "2026-11-02"}. Ein festes Format macht die Übernahme in die
  Fachanwendung prüfbar - und das Eingangsdatum wird für die Fristen in
  Lektion 4 gebraucht.
```

## Was eine Regel danach prüft

Wie in jedem Fachkurs: Was das Modell ausgelesen hat, prüft danach eine Regel,
soweit es sich prüfen lässt. Sie fängt Lesefehler ab, bevor sie in einem
Bescheid landen.

```aufgabe
id: D10-07
typ: denkaufgabe
mehrfach: true
titel: "Die Prüfregeln"
punkte: 30
frage: "Welche Prüfungen kann eine feste Regel nach dem Ausfüllen zuverlässig erledigen? Mehrere Antworten sind richtig."
optionen:
  - "Die Postleitzahl hat fünf Ziffern und passt zum Ort"
  - "Das Geburtsdatum ist ein gültiges Datum in der Vergangenheit"
  - "Alle Pflichtfelder sind gefüllt"
  - "Die IBAN für die Auszahlung hat eine gültige Prüfziffer"
  - "Die Begründung des Antrags ist überzeugend"
loesung:
  - "Die Postleitzahl hat fünf Ziffern und passt zum Ort"
  - "Das Geburtsdatum ist ein gültiges Datum in der Vergangenheit"
  - "Alle Pflichtfelder sind gefüllt"
  - "Die IBAN für die Auszahlung hat eine gültige Prüfziffer"
richtzeit_s: 75
erklaerung: |
  Format, Datum, Vollständigkeit und Prüfziffer sind feste Prüfungen. Ob eine
  Begründung trägt, ist eine inhaltliche Frage - die beantwortet die
  Sachbearbeitung, nicht eine Regel und nicht das Modell.
```

## Einmal angeben reicht

Viele Angaben kennt die Verwaltung schon: Name, Anschrift, Geburtsdatum aus
dem Melderegister. Das Ziel heißt **Once-Only**: Bürgerinnen und Bürger
sollen dieselben Daten nicht immer wieder eintragen müssen. Die Daten
dürfen aber nur dort übernommen werden, wo eine Rechtsgrundlage es erlaubt
(Lektion 8).

```aufgabe
id: D10-08
typ: uebereinstimmung
titel: "Woher kommt der Wert?"
punkte: 25
frage: "Ordne jedem Formularfeld die verlässlichste Quelle zu."
links:
  - "Anschrift"
  - "Aktenzeichen des früheren Bescheids"
  - "Begründung des Antrags"
  - "Eingangsdatum"
rechts:
  - "Melderegister, soweit die Übernahme erlaubt ist"
  - "Der frühere Bescheid in der Akte"
  - "Die antragstellende Person selbst"
  - "Der Eingangsstempel oder der Zeitstempel des Portals"
loesung:
  "Anschrift": "Melderegister, soweit die Übernahme erlaubt ist"
  "Aktenzeichen des früheren Bescheids": "Der frühere Bescheid in der Akte"
  "Begründung des Antrags": "Die antragstellende Person selbst"
  "Eingangsdatum": "Der Eingangsstempel oder der Zeitstempel des Portals"
richtzeit_s: 75
erklaerung: |
  Was ein Register oder die Akte verlässlich weiß, muss niemand abtippen.
  Was nur die Person selbst sagen kann - ihre Gründe -, darf auch kein
  Modell erfinden oder „sinngemäß ergänzen“.
```
