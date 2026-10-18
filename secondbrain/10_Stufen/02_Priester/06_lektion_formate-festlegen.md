---
type: lesson
title: "Formate festlegen: Tabelle, Liste, JSON"
description: "Wenn ein Mensch das Ergebnis liest, reicht eine klare Form. Wenn ein Programm es liest, muss sie exakt sein. Wie man beides bekommt."
tags:
  - lesson
  - stufe-2
  - prompting
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 2
dauer_min: 14
---

# Formate festlegen: Tabelle, Liste, JSON

## Format ist der Baustein, der am meisten bewirkt

In Lektion 1 stand: Wenn ein Ergebnis danebengeht, fehlt meistens **Format**
oder **Kontext**. Diese Lektion nimmt sich das Format vor, weil es den größten
Unterschied macht — und weil es später entscheidet, ob ein Programm mit der
Antwort etwas anfangen kann.

Es gibt drei Stufen von Genauigkeit:

| Stufe | Beispiel | Für wen |
|---|---|---|
| **Lose** | „Fasse kurz zusammen." | Dich, wenn es nicht darauf ankommt |
| **Fest** | „Drei Stichpunkte, je höchstens zehn Wörter." | Dich, wenn du es weiterverwendest |
| **Exakt** | „Antworte nur mit JSON: {„titel": …, „punkte": […]}" | Ein Programm |

## Zeigen statt beschreiben

Du kennst Few-Shot aus Lektion 1: Ein Beispiel ist stärker als drei
Erklärungen. Für Formate gilt das ganz besonders. Statt „Mach eine Tabelle mit
den wichtigsten Angaben" zeigst du die Kopfzeile:

```
Erstelle eine Tabelle mit genau diesen Spalten:
| Land | Hauptstadt | Einwohner (Mio.) |
```

Jetzt muss das Modell nicht raten, welche Spalten „die wichtigsten" sind.

```aufgabe
id: E2-17
typ: denkaufgabe
titel: "Welcher Auftrag liefert eine verwendbare Tabelle?"
punkte: 25
frage: "Du willst eine Übersicht über drei Handytarife, die du in eine Tabellenkalkulation kopieren kannst. Welcher Auftrag ist am besten?"
optionen:
  - "„Vergleiche die Tarife.“"
  - "„Mach eine schöne Übersicht.“"
  - "„Erstelle eine Tabelle mit genau den Spalten Tarif, Preis pro Monat in Euro, Datenvolumen in GB, Laufzeit in Monaten. Nur die Tabelle, kein Text davor oder danach.“"
  - "„Bitte gib dir Mühe mit dem Vergleich.“"
loesung: "„Erstelle eine Tabelle mit genau den Spalten Tarif, Preis pro Monat in Euro, Datenvolumen in GB, Laufzeit in Monaten. Nur die Tabelle, kein Text davor oder danach.“"
richtzeit_s: 60
erklaerung: |
  Feste Spalten mit Einheiten, und kein Text drumherum: So lässt sich das
  Ergebnis direkt weiterverwenden. „Schön" und „Mühe" legen nichts fest.
```

## JSON: das Format für Programme

Wenn nicht du, sondern ein Programm die Antwort liest, braucht es ein Format,
das keinen Spielraum lässt. Das häufigste heißt **JSON**: Schlüssel und Werte
in einer strengen Schreibweise.

```json
{"tarif": "Basis", "preis_euro": 9.99, "daten_gb": 10}
```

Du musst JSON hier noch nicht selbst schreiben können — das kommt in Stufe 3,
wenn Programme mit Modellen zusammenarbeiten. Aber du solltest wissen, **warum**
man es verlangt: Ein Programm kann aus „Der Basis-Tarif kostet etwa zehn Euro"
nichts machen. Aus `"preis_euro": 9.99` schon.

Und du solltest die typische Panne kennen: Das Modell schreibt freundlich
„Gerne, hier ist das JSON:" davor. Für dich ist das harmlos, für ein Programm
ein Fehler. Deshalb gehört zu jedem JSON-Auftrag der Satz **„Antworte nur mit
dem JSON, ohne Text davor oder danach."**

```aufgabe
id: E2-18
typ: plugplay
titel: "Was macht einen Formatauftrag exakt?"
punkte: 30
frage: "Wähle die Zusätze, die einen Auftrag für ein Programm-lesbares Ergebnis exakter machen."
bausteine:
  - "Ein Beispiel der gewünschten Ausgabe"
  - "„Antworte nur mit dem JSON, ohne Text davor oder danach.“"
  - "„Sei kreativ bei der Form.“"
  - "Die genauen Namen der Felder"
  - "„Das ist sehr wichtig.“"
loesung:
  - "Ein Beispiel der gewünschten Ausgabe"
  - "„Antworte nur mit dem JSON, ohne Text davor oder danach.“"
  - "Die genauen Namen der Felder"
richtzeit_s: 60
erklaerung: |
  Beispiel, Feldnamen und das Verbot von Begleittext legen die Form fest.
  „Kreativ bei der Form" ist das Gegenteil von dem, was ein Programm braucht.
```

## Länge ist auch ein Format

Die häufigste Formatangabe ist die Länge — und die häufigste falsche ist
„kurz". Kurz für wen? Für einen Zehnjährigen sind drei Sätze kurz, für eine
Zusammenfassung eines Buches eine Seite. **Zahlen statt Adjektive**: „höchstens
50 Wörter", „genau drei Stichpunkte", „ein Absatz".

Eine Warnung aus Stufe 1: Ein Modell zählt Tokens, keine Wörter. „Genau 50
Wörter" trifft es selten genau — „höchstens 50" funktioniert besser, weil es
eine Grenze ist und kein Ziel.

```aufgabe
id: E2-19
typ: planung
titel: "Ein exakter Formatauftrag"
punkte: 40
frage: "Schreibe einen Auftrag, der aus einem Zeitungsartikel eine Übersicht für ein Programm macht: Titel, Datum und drei Kernaussagen als JSON. Nenne die Feldnamen, gib ein Beispiel und verbiete Begleittext. Mindestens 35 Wörter."
pruefungen:
  - art: mindestens_woerter
    wert: 35
    punkte: 10
    begruendung: "Mindestens 35 Wörter."
  - art: enthaelt_eines
    werte: [json]
    punkte: 10
    begruendung: "Du verlangst JSON."
  - art: enthaelt_eines
    werte: [beispiel, zum beispiel, etwa so, so aussehen]
    punkte: 10
    begruendung: "Du gibst ein Beispiel."
  - art: enthaelt_eines
    werte: [nur, ohne text, kein text, keine erklärung, nichts davor]
    punkte: 10
    begruendung: "Du verbietest Begleittext."
richtzeit_s: 420
erklaerung: |
  Format, Beispiel und eine klare Grenze: Mit diesem Auftrag kann ein
  Programm jede Antwort lesen. In Stufe 3 wird genau so ein Auftrag zum
  Werkzeugaufruf eines Agenten.
```
