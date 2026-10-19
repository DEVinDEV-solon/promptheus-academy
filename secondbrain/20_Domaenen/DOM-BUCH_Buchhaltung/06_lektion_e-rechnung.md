---
type: lesson
title: "E-Rechnung"
description: "Seit 2025 müssen Unternehmen E-Rechnungen empfangen können, bald auch ausstellen. Mit strukturierten Daten wird das Auslesen überflüssig, und die Regel kann direkt prüfen."
tags:
  - lesson
  - domaene
  - dom-buch
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 15
---

# E-Rechnung

## Daten statt Bild

Die Lektionen 2 bis 5 haben gezeigt, wie viel Aufwand im Auslesen und Prüfen
steckt. Die **E-Rechnung** setzt einen Schritt früher an: Sie ist keine Datei
zum Ansehen, sondern ein **strukturierter Datensatz** in einem festen Format,
das Programme direkt lesen. Für den Austausch zwischen Unternehmen in
Deutschland sind vor allem zwei Formate verbreitet: XRechnung (reines XML)
und ZUGFeRD (ein PDF, in dem die XML-Daten eingebettet sind).

Eine gewöhnliche PDF-Rechnung ist dagegen keine E-Rechnung, auch wenn sie
per E-Mail kommt.

```aufgabe
id: D8-14
typ: quizkarten
titel: "E-Rechnung oder nicht?"
punkte: 25
frage: "Ist das eine E-Rechnung im Sinne des Umsatzsteuergesetzes?"
karten:
  - "Eine XRechnung als XML-Datei"
  - "Eine ZUGFeRD-Datei, also ein PDF mit eingebetteten XML-Daten"
  - "Ein gewöhnliches PDF per E-Mail"
  - "Eine eingescannte Papierrechnung"
  - "Ein Handyfoto einer Rechnung"
stapel: [E-Rechnung, keine E-Rechnung]
loesung:
  "Eine XRechnung als XML-Datei": E-Rechnung
  "Eine ZUGFeRD-Datei, also ein PDF mit eingebetteten XML-Daten": E-Rechnung
  "Ein gewöhnliches PDF per E-Mail": keine E-Rechnung
  "Eine eingescannte Papierrechnung": keine E-Rechnung
  "Ein Handyfoto einer Rechnung": keine E-Rechnung
richtzeit_s: 70
erklaerung: |
  Entscheidend ist die maschinenlesbare Struktur, nicht der Weg. Ein PDF,
  ein Scan oder ein Foto muss erst ausgelesen werden - mit allen Fehlern, die
  du in Lektion 2 kennengelernt hast.
```

## Der Zeitplan

Die Pflicht kommt in Stufen, für Rechnungen zwischen Unternehmen im Inland:

```aufgabe
id: D8-15
typ: uebereinstimmung
titel: "Wann gilt was?"
punkte: 25
frage: "Ordne jedem Zeitpunkt die Pflicht zu, die ab dann gilt."
links:
  - "ab 1. Januar 2025"
  - "ab 1. Januar 2027"
  - "ab 1. Januar 2028"
rechts:
  - "Alle Unternehmen müssen E-Rechnungen empfangen können"
  - "Unternehmen mit mehr als 800.000 Euro Vorjahresumsatz müssen E-Rechnungen ausstellen"
  - "Alle Unternehmen müssen E-Rechnungen ausstellen"
loesung:
  "ab 1. Januar 2025": "Alle Unternehmen müssen E-Rechnungen empfangen können"
  "ab 1. Januar 2027": "Unternehmen mit mehr als 800.000 Euro Vorjahresumsatz müssen E-Rechnungen ausstellen"
  "ab 1. Januar 2028": "Alle Unternehmen müssen E-Rechnungen ausstellen"
richtzeit_s: 70
erklaerung: |
  Empfangen müssen alle schon heute. Für die Übergangszeit gibt es
  Ausnahmen, etwa für Kleinbetragsrechnungen. Den genauen Stand für deinen
  Betrieb klärt die Steuerberatung.
```

## Was die E-Rechnung für KI bedeutet

```aufgabe
id: D8-16
typ: denkaufgabe
titel: "Weniger Modell, mehr Regel"
punkte: 25
frage: "Was ändert sich im Rechnungseingang, wenn fast alle Rechnungen als E-Rechnung kommen?"
optionen:
  - "Die Felder kommen fertig strukturiert, das Auslesen per Modell entfällt, und Regeln können direkt prüfen."
  - "Es braucht ein größeres Modell, weil XML schwerer zu lesen ist."
  - "Die Prüfung entfällt, weil E-Rechnungen immer stimmen."
  - "Nichts, eine E-Rechnung ist nur ein anderes PDF."
loesung: "Die Felder kommen fertig strukturiert, das Auslesen per Modell entfällt, und Regeln können direkt prüfen."
richtzeit_s: 60
erklaerung: |
  Wo die Daten sauber vorliegen, braucht es kein Sprachmodell zum Lesen - die
  Lehre aus Stufe 3. Die Prüfung bleibt: Auch eine perfekt strukturierte
  Rechnung kann eine Leistung berechnen, die nie erbracht wurde (Lektion 4).
```
