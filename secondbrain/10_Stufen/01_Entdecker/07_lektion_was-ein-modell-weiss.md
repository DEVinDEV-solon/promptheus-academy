---
type: lesson
title: "Was ein Modell weiß — und seit wann"
description: "Trainingsdaten, Stichtag und Nachschlagen: warum ein Modell über gestern nichts weiß, es aber trotzdem behaupten kann — und woran du merkst, ob eine Antwort aktuell sein kann."
tags:
  - lesson
  - stufe-1
  - wissen
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 1
dauer_min: 12
---

# Was ein Modell weiß — und seit wann

## Gelernt ist gelernt

In Lektion 1 hast du gesehen: Ein Sprachmodell berechnet, welcher Text gut
weitergeht. Woher weiß es, was „gut weitergeht"? Aus seinen **Trainingsdaten**
— einer riesigen Menge Text, aus der es einmal gelernt hat. Dieses Lernen
passiert **vor** der Benutzung und endet an einem bestimmten Tag, dem
**Stichtag** (englisch *knowledge cutoff*).

Danach lernt das Modell nichts mehr dazu. Wenn du mit ihm schreibst, lernt es
nicht von dir. Was nach dem Stichtag passiert ist — eine Wahl, ein neues
Gesetz, ein Sportergebnis von gestern —, kennt es nicht.

## Das Problem: Es merkt es nicht

Das Gefährliche ist nicht, dass ein Modell etwas nicht weiß. Das Gefährliche
ist, dass es **trotzdem antwortet**. Du kennst den Grund aus Lektion 1: Für das
Modell gibt es keinen Unterschied zwischen „weiß ich" und „klingt richtig".
Fragst du nach dem Ergebnis von gestern, rechnet es aus, wie eine Antwort auf
diese Frage typischerweise aussieht — und liefert eine, fließend und sicher.

```aufgabe
id: E1-18
typ: denkaufgabe
titel: "Die Frage nach gestern"
punkte: 25
frage: "Du fragst ein Modell ohne Internetzugang nach dem Ergebnis eines Fußballspiels von gestern Abend. Es nennt sofort ein Ergebnis mit Torschützen. Was ist am wahrscheinlichsten?"
optionen:
  - "Das Ergebnis stimmt, Modelle sind immer aktuell."
  - "Das Ergebnis ist vorhergesagt — es klingt plausibel, kann aber nicht auf Wissen über gestern beruhen."
  - "Das Modell hat heimlich im Internet nachgesehen."
  - "Das Modell hat aus früheren Gesprächen gelernt."
loesung: "Das Ergebnis ist vorhergesagt — es klingt plausibel, kann aber nicht auf Wissen über gestern beruhen."
richtzeit_s: 50
erklaerung: |
  Ohne Zugang nach außen kennt das Modell nur seine Trainingsdaten. Ein
  Ergebnis von gestern ist darin nicht enthalten - es wird erfunden, so wie
  Quellenangaben erfunden werden.
```

## Nachschlagen statt Erinnern

Manche Anwendungen geben einem Modell ein **Werkzeug**, mit dem es
nachschlagen kann: eine Websuche, ein Dokument, eine Datenbank. Dann passiert
etwas anderes. Das Modell bekommt den gefundenen Text in sein Kontextfenster
(Lektion 2) und formuliert daraus seine Antwort.

| | Aus dem Gedächtnis | Mit Nachschlagen |
|---|---|---|
| **Woher** | Trainingsdaten bis zum Stichtag | Was gerade gefunden wurde |
| **Aktuell?** | Nein | So aktuell wie die Quelle |
| **Prüfbar?** | Kaum — es gibt keine Fundstelle | Ja, wenn die Quelle angezeigt wird |

Aber Achtung: Auch mit Nachschlagen kann ein Modell die gefundene Quelle
**falsch wiedergeben**. Es fasst zusammen, und eine Zusammenfassung ist wieder
vorhergesagt. Wer sicher sein will, liest die Quelle selbst — das ist die
Regel, mit der diese Academy anfängt: Eine Zahl ohne Fundstelle ist eine
Behauptung.

```aufgabe
id: E1-19
typ: uebereinstimmung
titel: "Kann die Antwort aktuell sein?"
punkte: 30
frage: "Ordne jeder Situation die passende Einschätzung zu."
links:
  - "Ein Modell ohne Werkzeuge nennt den heutigen Wechselkurs"
  - "Ein Modell mit Websuche nennt den Wechselkurs und verlinkt die Bankseite"
  - "Ein Modell erklärt, wie der Satz des Pythagoras funktioniert"
  - "Ein Modell fasst ein Dokument zusammen, das du ihm gegeben hast"
rechts:
  - "Kann nicht aktuell sein — vermutlich erfunden oder veraltet"
  - "Kann aktuell sein — an der verlinkten Quelle nachprüfen"
  - "Ändert sich nicht — Trainingswissen reicht"
  - "Beruht auf deinem Text — aber die Zusammenfassung kann trotzdem irren"
loesung:
  "Ein Modell ohne Werkzeuge nennt den heutigen Wechselkurs": "Kann nicht aktuell sein — vermutlich erfunden oder veraltet"
  "Ein Modell mit Websuche nennt den Wechselkurs und verlinkt die Bankseite": "Kann aktuell sein — an der verlinkten Quelle nachprüfen"
  "Ein Modell erklärt, wie der Satz des Pythagoras funktioniert": "Ändert sich nicht — Trainingswissen reicht"
  "Ein Modell fasst ein Dokument zusammen, das du ihm gegeben hast": "Beruht auf deinem Text — aber die Zusammenfassung kann trotzdem irren"
richtzeit_s: 90
erklaerung: |
  Die Frage ist immer: Woher kann das Modell das wissen? Altes, festes Wissen
  steckt in den Trainingsdaten. Alles, was sich ändert, braucht eine Quelle -
  und die liest man am besten selbst.
```

## Was du dir merkst

Eine Faustregel für den Alltag: **Je neuer und je genauer eine Angabe, desto
weniger kann sie aus dem Gedächtnis eines Modells stammen.** Allgemeine
Erklärungen („Wie funktioniert Photosynthese?") sind seine Stärke. Aktuelle
Zahlen, Preise, Termine und Ereignisse sind seine Schwäche — es sei denn, es
schlägt nach, und du kannst die Quelle sehen.

```aufgabe
id: E1-20
typ: plugplay
titel: "Gedächtnis reicht — oder nicht?"
punkte: 25
frage: "Bei welchen Fragen kann ein Modell ohne Nachschlagen gut helfen?"
bausteine:
  - "Erkläre mir, was ein Verb ist"
  - "Wann fährt heute der letzte Bus nach Hause?"
  - "Wie viel kostet gerade ein Liter Benzin?"
  - "Gib mir drei Ideen für einen Geburtstagsgruß"
  - "Fasse zusammen, wie ein Regenbogen entsteht"
loesung:
  - "Erkläre mir, was ein Verb ist"
  - "Gib mir drei Ideen für einen Geburtstagsgruß"
  - "Fasse zusammen, wie ein Regenbogen entsteht"
richtzeit_s: 60
erklaerung: |
  Erklärungen und Ideen beruhen nicht auf dem heutigen Tag. Busfahrplan und
  Benzinpreis ändern sich ständig - dafür braucht es eine aktuelle Quelle.
```
