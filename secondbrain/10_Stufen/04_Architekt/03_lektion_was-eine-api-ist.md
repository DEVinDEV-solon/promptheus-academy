---
type: lesson
title: "Was eine API ist und wie man sie anspricht"
description: "Anfrage und Antwort, Adresse und Methode, Statuscode und Inhalt — die Sprache, in der Programme miteinander reden."
tags:
  - lesson
  - stufe-4
  - api
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 4
dauer_min: 16
---

# Was eine API ist und wie man sie anspricht

## Ein Schalter, kein Schaufenster

In Stufe 3 hat ein Programm den Werkzeugaufruf des Modells ausgeführt — es hat
zum Beispiel einen Wetterdienst gefragt. Wie fragt ein Programm einen anderen
Dienst? Über eine **API** (*Application Programming Interface*, deutsch etwa
Programmierschnittstelle).

Das beste Bild ist ein **Schalter**: Du kannst nicht hinter den Tresen gehen
und dir selbst nehmen, was du brauchst. Du stellst eine Anfrage in der Form,
die der Schalter verlangt, und bekommst eine Antwort in der Form, die er
liefert. Was dahinter passiert, siehst du nicht — und musst es auch nicht.

## Die vier Teile einer Anfrage

| Teil | Frage | Beispiel |
|---|---|---|
| **Adresse** (Endpunkt) | Wohin? | `https://api.example.com/termine` |
| **Methode** | Was soll passieren? | `GET` lesen, `POST` anlegen, `DELETE` löschen |
| **Kopf** (Header) | Wer fragt, in welchem Format? | Zugangsschlüssel, „ich schicke JSON" |
| **Inhalt** (Body) | Mit welchen Daten? | `{"titel": "Zahnarzt", "datum": "2026-11-03"}` |

Die Methode ist wichtiger, als sie aussieht: Ein `GET` darf nichts verändern,
ein `DELETE` verändert unwiderruflich. Ein Agent, der lesen soll, braucht nur
`GET` — und sollte auch nur `GET` dürfen. Das wird in Stufe 5 zur Regel.

```aufgabe
id: E4-05
typ: uebereinstimmung
titel: "Welche Methode?"
punkte: 30
frage: "Ordne jeder Absicht die passende Methode zu."
links:
  - "Die Liste aller Termine abrufen"
  - "Einen neuen Termin anlegen"
  - "Einen Termin entfernen"
  - "Die Uhrzeit eines Termins ändern"
rechts:
  - "GET"
  - "POST"
  - "DELETE"
  - "PATCH"
loesung:
  "Die Liste aller Termine abrufen": "GET"
  "Einen neuen Termin anlegen": "POST"
  "Einen Termin entfernen": "DELETE"
  "Die Uhrzeit eines Termins ändern": "PATCH"
richtzeit_s: 75
erklaerung: |
  GET liest, POST legt an, DELETE entfernt, PATCH ändert einen Teil. Wer die
  Methode kennt, weiß, wie gefährlich ein Aufruf ist - noch bevor er den
  Inhalt gelesen hat.
```

## Die Antwort: erst der Code, dann der Inhalt

Jede Antwort beginnt mit einem dreistelligen **Statuscode**. Er sagt, ob es
geklappt hat, noch bevor man den Inhalt liest:

| Bereich | Bedeutung | Häufig |
|---|---|---|
| **2xx** | Hat geklappt | 200 OK, 201 angelegt |
| **4xx** | Du hast etwas falsch gemacht | 400 falsche Anfrage, 401 nicht angemeldet, 403 verboten, 404 gibt es nicht, 429 zu viele Anfragen |
| **5xx** | Der Dienst hat ein Problem | 500 interner Fehler, 503 gerade nicht erreichbar |

Und hier schließt sich der Kreis zu Stufe 3, Lektion 7: **Bei 5xx und 429 hilft
Wiederholen mit Wartezeit. Bei 4xx hilft es nicht** — die Anfrage bleibt
falsch, egal wie oft man sie schickt.

```aufgabe
id: E4-06
typ: plugplay
titel: "Lohnt sich ein zweiter Versuch?"
punkte: 30
frage: "Bei welchen Statuscodes ist es sinnvoll, die Anfrage nach einer Wartezeit zu wiederholen?"
bausteine:
  - "503 — Dienst gerade nicht erreichbar"
  - "404 — gibt es nicht"
  - "429 — zu viele Anfragen"
  - "401 — nicht angemeldet"
  - "500 — interner Fehler"
loesung:
  - "503 — Dienst gerade nicht erreichbar"
  - "429 — zu viele Anfragen"
  - "500 — interner Fehler"
richtzeit_s: 70
hinweise:
  - text: "Liegt der Fehler beim Dienst (5xx) oder bei dir (4xx)? Die 429 ist die Ausnahme in der 4er-Reihe."
    kostet: 5
erklaerung: |
  5xx sind Probleme des Dienstes, die vergehen können. 429 heißt „langsamer",
  also warten und wiederholen. 404 und 401 bleiben, wie sie sind - wer sie
  wiederholt, verschwendet nur Anfragen.
```

## Der Schlüssel am Schalter

Fast jede API verlangt einen **Zugangsschlüssel** im Kopf der Anfrage. Er sagt,
wer fragt, und wird abgerechnet. Merk dir schon jetzt, was Stufe 5 ausführlich
zeigt: Der Schlüssel gehört in den Kopf, **nie in die Adresse**. Eine Adresse
landet in Protokollen, im Browserverlauf, in Screenshots.

```aufgabe
id: E4-07
typ: denkaufgabe
titel: "Wohin mit dem Schlüssel?"
punkte: 20
frage: "Wo gehört ein API-Zugangsschlüssel in einer Anfrage hin?"
optionen:
  - "In die Adresse, als ?key=…"
  - "In den Kopf der Anfrage"
  - "In den Inhalt, als normales Feld"
  - "In den Systemprompt des Agenten"
loesung: "In den Kopf der Anfrage"
richtzeit_s: 45
erklaerung: |
  Der Kopf ist für genau so etwas gemacht und wird nicht in Adresszeilen
  und Server-Logs mitgeschrieben. Im Systemprompt hätte ihn das Modell - und
  was das Modell hat, kann es auch ausgeben.
```
