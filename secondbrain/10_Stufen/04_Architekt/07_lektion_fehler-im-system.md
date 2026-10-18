---
type: lesson
title: "Fehler im System"
description: "Wenn ein Teil ausfällt, darf nicht alles ausfallen. Zeitgrenzen, Doppelausführung und der Fehler, der sich durch die Kette frisst."
tags:
  - lesson
  - stufe-4
  - fehler
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 4
dauer_min: 16
---

# Fehler im System

## Ein Ablauf scheitert, ein System pflanzt fort

In Stufe 3 ist ein Ablauf an einer Stelle gescheitert: Er hat wiederholt,
abgebrochen oder gefragt. In einem System aus mehreren Teilen kommt etwas
Unangenehmes dazu — **ein Fehler in einem Teil wird zur Eingabe des nächsten.**
Ein Rechercheur, der eine Zahl erfindet, liefert sie an den Verfasser, der sie
schön formuliert, an den Lektor, der die Rechtschreibung prüft. Am Ende steht
eine erfundene Zahl in einwandfreiem Deutsch.

Das nennt man einen **Kaskadenfehler**: Er wird nicht kleiner, wenn er
weitergereicht wird, sondern glaubwürdiger.

```aufgabe
id: E4-17
typ: raeumlich
titel: "Wo hätte es gestoppt werden müssen?"
punkte: 25
frage: "Eine erfundene Zahl taucht im fertigen Bericht auf. An welcher Stelle hätte eine Prüfung sie am billigsten abgefangen?"
diagramm: |
  [Rechercheur] --> [Verfasser] --> [Lektor] --> [Versand]
       |
   (erfindet eine Zahl)
optionen: ["Rechercheur", "Verfasser", "Lektor", "Versand"]
loesung: "Rechercheur"
richtzeit_s: 60
erklaerung: |
  Direkt nach dem Rechercheur: Dort ist die Zahl noch eine nackte Behauptung
  mit (fehlender) Quelle. Später ist sie in Sätze eingebaut, und der Lektor
  prüft Sprache, nicht Fakten. Fehler fängt man dort, wo sie entstehen.
```

## Drei Sicherungen gegen Systemfehler

**1. Zeitgrenzen.** Jeder Aufruf an einen anderen Teil bekommt eine Höchstzeit.
Antwortet der Teil nicht, wird abgebrochen — statt dass das ganze System
wartet. Ohne Zeitgrenze kann ein einziger hängender Dienst alles anhalten.

**2. Sichere Wiederholung.** In Stufe 3 hast du gelernt, vorübergehende Fehler
zu wiederholen. Im System lauert dabei eine Falle: Was, wenn der erste Versuch
*doch* angekommen ist und nur die Antwort verloren ging? Dann wird ein Termin
zweimal angelegt, eine Mail zweimal versendet, eine Zahlung zweimal
ausgeführt. Ein Schritt, der bei Wiederholung nichts doppelt tut, heißt
**idempotent** — und jede Aktion, die wiederholt werden kann, sollte es sein.

**3. Abgestufter Ausfall.** Fällt ein Teil aus, liefert das System weniger,
aber nicht nichts. Fehlt der Spezialist für Zahlen, kommt die Antwort ohne
Zahlen und mit einem Hinweis — nicht gar keine Antwort.

```aufgabe
id: E4-18
typ: uebereinstimmung
titel: "Welche Sicherung hilft?"
punkte: 30
frage: "Ordne jedem Problem die Sicherung zu, die es verhindert."
links:
  - "Ein Dienst antwortet nicht, und das ganze System wartet seit einer Stunde"
  - "Nach einer Wiederholung bekommt ein Kunde zwei Rechnungen"
  - "Der Übersetzungsdienst ist ausgefallen, deshalb geht gar keine Antwort raus"
rechts:
  - "Zeitgrenze für jeden Aufruf"
  - "Idempotente Aktionen, etwa mit einer eindeutigen Vorgangsnummer"
  - "Abgestufter Ausfall: Antwort im Original mit Hinweis"
loesung:
  "Ein Dienst antwortet nicht, und das ganze System wartet seit einer Stunde": "Zeitgrenze für jeden Aufruf"
  "Nach einer Wiederholung bekommt ein Kunde zwei Rechnungen": "Idempotente Aktionen, etwa mit einer eindeutigen Vorgangsnummer"
  "Der Übersetzungsdienst ist ausgefallen, deshalb geht gar keine Antwort raus": "Abgestufter Ausfall: Antwort im Original mit Hinweis"
richtzeit_s: 80
erklaerung: |
  Zeitgrenzen verhindern das Warten, idempotente Aktionen das Doppelte,
  abgestufter Ausfall das Verstummen. Ein robustes System hat alle drei.
```

## Wie man Idempotenz baut

Der übliche Weg ist eine **eindeutige Vorgangsnummer**: Jede Aktion bekommt
eine Nummer, bevor sie ausgeführt wird. Der empfangende Dienst merkt sich die
Nummern, die er schon erledigt hat — Zustand aus Lektion 5. Kommt dieselbe
Nummer ein zweites Mal, antwortet er „schon erledigt" und tut nichts.

```aufgabe
id: E4-19
typ: denkaufgabe
titel: "Ist das idempotent?"
punkte: 25
frage: "Welche dieser Aktionen kann man gefahrlos beliebig oft wiederholen?"
mehrfach: true
optionen:
  - "Den Status eines Auftrags auf „versendet“ setzen"
  - "Eine Mail an den Kunden senden"
  - "Den Lagerbestand um 1 verringern"
  - "Eine Datei unter festem Namen im Ordner ablegen und dabei überschreiben"
loesung:
  - "Den Status eines Auftrags auf „versendet“ setzen"
  - "Eine Datei unter festem Namen im Ordner ablegen und dabei überschreiben"
richtzeit_s: 75
hinweise:
  - text: "Frag dich: Ist der Zustand nach zwei Ausführungen derselbe wie nach einer?"
    kostet: 5
erklaerung: |
  „Auf versendet setzen" und „unter festem Namen überschreiben" führen
  zweimal ausgeführt zum selben Ergebnis. Eine zweite Mail und ein doppelt
  verringerter Bestand nicht - dort braucht es eine Vorgangsnummer.
```
