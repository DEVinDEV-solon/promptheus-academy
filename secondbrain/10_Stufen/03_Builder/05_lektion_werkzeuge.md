---
type: lesson
title: "Werkzeuge: wie ein Agent handelt"
description: "Ein Modell kann nur Text schreiben. Damit es handelt, schreibt es einen Werkzeugaufruf — und ein Programm führt ihn aus."
tags:
  - lesson
  - stufe-3
  - agenten
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 3
dauer_min: 16
---

# Werkzeuge: wie ein Agent handelt

## Ein Modell hat keine Hände

In Lektion 1 stand: Ein Agent nimmt wahr, entscheidet und **handelt**. Aber
ein Sprachmodell kann nur eines — das nächste Token vorhersagen. Es kann keine
Mail senden, keine Datei anlegen, keine Uhrzeit nachsehen.

Der Trick, mit dem trotzdem gehandelt wird, ist einfach: **Das Modell schreibt
auf, was getan werden soll, in einer festen Form. Ein gewöhnliches Programm
liest das und tut es.** Diese feste Form heißt Werkzeugaufruf (englisch *tool
call* oder *function call*).

```
Modell schreibt:   {"werkzeug": "wetter", "ort": "Köln"}
Programm tut:      fragt den Wetterdienst nach Köln
Programm meldet:   {"temperatur": 14, "himmel": "bewölkt"}
Modell schreibt:   „In Köln sind es 14 Grad, bewölkt."
```

Das Modell hat nie das Wetter nachgesehen. Es hat einen Zettel geschrieben,
und jemand anderes ist losgegangen.

## Die Werkzeugbeschreibung

Damit das Modell weiß, welche Werkzeuge es gibt, bekommt es eine
**Beschreibung**: Name, wozu es da ist, welche Angaben es braucht. Diese
Beschreibung ist ein Prompt — und alles aus Stufe 2 gilt für sie. Eine vage
Beschreibung führt zu falschen Aufrufen, genau wie ein vager Auftrag zu einem
vagen Text.

| Teil | Beispiel |
|---|---|
| **Name** | `termin_anlegen` |
| **Zweck** | „Legt einen Termin im Kalender des Nutzers an. Nur nach ausdrücklicher Bitte." |
| **Angaben** | `titel` (Text), `datum` (JJJJ-MM-TT), `uhrzeit` (HH:MM) |

Der Satz *„Nur nach ausdrücklicher Bitte"* ist keine Höflichkeit. Er ist eine
**Grenze** — und Grenzen gehören in die Beschreibung, nicht nur in den Kopf
dessen, der sie geschrieben hat.

```aufgabe
id: E3-11
typ: denkaufgabe
titel: "Wer tut es wirklich?"
punkte: 20
frage: "Ein Agent hat erfolgreich eine Mail versendet. Wer hat die Mail tatsächlich verschickt?"
optionen:
  - "Das Sprachmodell selbst"
  - "Ein Programm, das den Werkzeugaufruf des Modells ausgeführt hat"
  - "Der Mailserver hat das Modell um Erlaubnis gefragt"
  - "Niemand, das Modell tut nur so"
loesung: "Ein Programm, das den Werkzeugaufruf des Modells ausgeführt hat"
richtzeit_s: 45
erklaerung: |
  Das Modell schreibt nur den Aufruf. Ausgeführt wird er von einem Programm,
  und genau dort - nicht im Modell - sitzen die Sicherungen: Prüfungen,
  Grenzen, Rückfragen. Das wird in Stufe 4 und 5 wichtig.
```

## Die Form ist JSON

Die feste Form ist fast immer **JSON**: Schlüssel in Anführungszeichen, ein
Doppelpunkt, der Wert, Kommas dazwischen, geschweifte Klammern außen.

```json
{"werkzeug": "termin_anlegen", "titel": "Zahnarzt", "datum": "2026-11-03", "uhrzeit": "09:30"}
```

JSON ist streng. Ein fehlendes Anführungszeichen, ein Komma zu viel, und das
Programm kann den Zettel nicht lesen. Deshalb prüft jedes ordentliche Programm
den Aufruf, **bevor** es handelt.

```aufgabe
id: E3-12
typ: technisch
titel: "Schreib den Aufruf"
punkte: 35
frage: "Schreibe einen gültigen JSON-Aufruf für das Werkzeug termin_anlegen: Titel „Elternabend“, Datum 2026-11-12, Uhrzeit 19:00. Er muss die Schlüssel werkzeug, titel, datum und uhrzeit enthalten."
pruefer: json_gueltig
schluessel: [werkzeug, titel, datum, uhrzeit]
richtzeit_s: 180
hinweise:
  - text: "Halte dich genau an das Beispiel oben und tausche nur die Werte aus."
    kostet: 5
  - text: "Jeder Schlüssel und jeder Text steht in geraden Anführungszeichen wie auf der Tastatur — nicht in „deutschen“."
    kostet: 8
erklaerung: |
  Ein gültiger Aufruf sieht so aus:
  {"werkzeug": "termin_anlegen", "titel": "Elternabend", "datum": "2026-11-12", "uhrzeit": "19:00"}
  Die häufigsten Fehler: typografische Anführungszeichen und ein Komma nach
  dem letzten Eintrag. Beides macht das JSON ungültig.
```

## Was das Modell entscheidet und was nicht

Das Modell entscheidet, **ob** und **welches** Werkzeug, und mit welchen
Angaben. Das Programm entscheidet, **ob es das darf**. Diese Trennung ist der
wichtigste Satz dieser Stufe:

> Das Modell schlägt vor. Das Programm prüft. Erst dann wird gehandelt.

```aufgabe
id: E3-13
typ: schiebe
titel: "Der Weg eines Aufrufs"
punkte: 30
frage: "Bring die Schritte eines Werkzeugaufrufs in die richtige Reihenfolge."
bausteine:
  - "Das Programm prüft, ob der Aufruf gültig und erlaubt ist"
  - "Das Modell formuliert die Antwort an den Nutzer"
  - "Das Modell schreibt den Werkzeugaufruf"
  - "Das Programm führt das Werkzeug aus und meldet das Ergebnis"
loesung:
  - "Das Modell schreibt den Werkzeugaufruf"
  - "Das Programm prüft, ob der Aufruf gültig und erlaubt ist"
  - "Das Programm führt das Werkzeug aus und meldet das Ergebnis"
  - "Das Modell formuliert die Antwort an den Nutzer"
richtzeit_s: 75
erklaerung: |
  Vorschlagen, prüfen, ausführen, berichten. Fehlt der zweite Schritt, tut
  der Agent alles, was das Modell für wahrscheinlich hält - und das ist
  nicht dasselbe wie das, was erlaubt ist.
```
