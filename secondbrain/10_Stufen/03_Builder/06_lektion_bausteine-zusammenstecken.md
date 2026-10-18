---
type: lesson
title: "Bausteine zusammenstecken statt programmieren"
description: "Auslöser, Bedingung, Aktion: wie Automationen ohne eine Zeile Code entstehen — und wo diese Werkzeuge an ihre Grenze kommen."
tags:
  - lesson
  - stufe-3
  - automation
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 3
dauer_min: 15
---

# Bausteine zusammenstecken statt programmieren

## Der Ablauf als Steckbrett

Viele Automationen brauchen gar kein eigenes Programm. Es gibt Werkzeuge —
man nennt sie *No-Code* oder *Low-Code* —, in denen du einen Ablauf aus
fertigen Kästchen zusammensteckst. Die Namen wechseln, das Prinzip ist
überall dasselbe, und du kennst es schon aus Lektion 2:

| Baustein | Frage | Beispiel |
|---|---|---|
| **Auslöser** | Wann geht es los? | „Eine neue Mail mit Anhang kommt an" |
| **Bedingung** | Unter welchen Umständen weiter? | „Absender endet auf @schule.de" |
| **Aktion** | Was wird getan? | „Anhang im Ordner Schule ablegen" |

Ein Auslöser, beliebig viele Bedingungen und Aktionen dahinter. Mehr ist es
nicht. Der Unterschied zu Lektion 2: Hier zeichnest du nicht nur — die
Zeichnung **läuft**.

```aufgabe
id: E3-14
typ: uebereinstimmung
titel: "Welcher Baustein ist das?"
punkte: 30
frage: "Ordne jedem Kästchen seine Rolle im Ablauf zu."
links:
  - "Jeden Montag um 8 Uhr"
  - "Nur wenn die Tabelle neue Zeilen hat"
  - "Eine Zusammenfassung an das Team senden"
  - "Ein Formular wurde abgeschickt"
rechts:
  - "Auslöser: Zeitplan"
  - "Bedingung"
  - "Aktion"
  - "Auslöser: Ereignis"
loesung:
  "Jeden Montag um 8 Uhr": "Auslöser: Zeitplan"
  "Nur wenn die Tabelle neue Zeilen hat": "Bedingung"
  "Eine Zusammenfassung an das Team senden": "Aktion"
  "Ein Formular wurde abgeschickt": "Auslöser: Ereignis"
richtzeit_s: 75
erklaerung: |
  Es gibt zwei Sorten Auslöser: die Uhr und das Ereignis. Bedingungen
  filtern, Aktionen tun. Jede Automation, die du je bauen wirst, ist eine
  Kombination daraus.
```

## Das Modell als ein Kästchen unter vielen

In diesen Werkzeugen ist ein Sprachmodell **ein Baustein wie jeder andere**:
„Text zusammenfassen", „Stimmung erkennen", „Antwort entwerfen". Und hier
zahlt sich Lektion 2 aus: Setz das Modell-Kästchen nur dort ein, wo eine
Regel nicht reicht. Jedes Modell-Kästchen kostet Geld, braucht Zeit und
antwortet nicht jedes Mal gleich.

Ein gut gebauter Ablauf sieht deshalb meistens so aus: **Regeln vorn, die
aussortieren, ein Modell in der Mitte, das versteht, Regeln hinten, die
prüfen.**

```aufgabe
id: E3-15
typ: schiebe
titel: "Ein sparsamer Ablauf"
punkte: 30
frage: "Ein Ablauf soll Kundenmails mit Beschwerden an die Chefin weiterleiten. Bring die Kästchen in die sparsamste sinnvolle Reihenfolge."
bausteine:
  - "Modell: Ist das eine Beschwerde?"
  - "Auslöser: neue Mail im Postfach"
  - "Aktion: an die Chefin weiterleiten"
  - "Bedingung: Absender ist kein Newsletter"
loesung:
  - "Auslöser: neue Mail im Postfach"
  - "Bedingung: Absender ist kein Newsletter"
  - "Modell: Ist das eine Beschwerde?"
  - "Aktion: an die Chefin weiterleiten"
richtzeit_s: 75
hinweise:
  - text: "Welches Kästchen kostet Geld? Was sollte vorher schon aussortiert sein?"
    kostet: 5
erklaerung: |
  Die billige Regel sortiert die Newsletter aus, bevor das teure Modell
  überhaupt gefragt wird. Bei hundert Mails am Tag, davon siebzig
  Newsletter, spart das siebzig Modellaufrufe - jeden Tag.
```

## Wo das Steckbrett endet

Bausteine sind schnell gebaut und für jeden lesbar. Sie stoßen an Grenzen,
sobald es **verwickelt** wird:

- Schleifen über viele Einträge mit Sonderfällen werden unübersichtlich.
- Fehler sind schwer zu finden, weil man nicht Zeile für Zeile lesen kann.
- Der Ablauf liegt beim Anbieter: Ändert er etwas oder stellt er ein, steht
  deine Automation.

Die ehrliche Regel: **Fang mit Bausteinen an. Wenn du merkst, dass du mehr
Zeit mit Umgehungen verbringst als mit dem Ablauf, ist es Zeit für Code** —
und den kannst du seit Lektion 3 und 4 lesen und prüfen.

```aufgabe
id: E3-16
typ: denkaufgabe
titel: "Steckbrett oder Code?"
punkte: 25
frage: "In welchem Fall ist ein eigenes kleines Programm die bessere Wahl als ein Baustein-Werkzeug?"
optionen:
  - "Jeden Freitag eine Erinnerung an das Team senden"
  - "Neue Formulareinträge in eine Tabelle schreiben"
  - "3.000 Rechnungen mit zwölf Sonderregeln je Lieferant prüfen, die sich monatlich ändern"
  - "Anhänge einer Mail in einem Ordner ablegen"
loesung: "3.000 Rechnungen mit zwölf Sonderregeln je Lieferant prüfen, die sich monatlich ändern"
richtzeit_s: 60
erklaerung: |
  Viele Sonderfälle, große Mengen und häufige Änderungen sind genau das, was
  Steckbretter unübersichtlich macht. Die anderen drei sind Paradebeispiele
  für einen Auslöser mit einer Aktion.
```
