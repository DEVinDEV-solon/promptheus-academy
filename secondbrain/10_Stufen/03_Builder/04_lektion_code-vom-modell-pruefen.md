---
type: lesson
title: "Code vom Modell prüfen"
description: "Ein Modell schreibt Code, der läuft. Ob er richtig ist, ist eine andere Frage. Vier Stellen, an denen es typischerweise danebengeht."
tags:
  - lesson
  - stufe-3
  - python
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 3
dauer_min: 16
---

# Code vom Modell prüfen

## Läuft heißt nicht stimmt

Das Tückische an Code aus einem Modell ist nicht, dass er abstürzt. Das
merkst du sofort. Tückisch ist Code, der **läuft und etwas Falsches tut** —
leise, jeden Tag, bis jemand die Zahlen nachrechnet.

Du kennst den Grund aus Stufe 1: Ein Modell setzt das Wahrscheinlichste fort.
Das Wahrscheinlichste ist meistens richtig. Aber an bestimmten Stellen ist
das Wahrscheinlichste auffällig oft falsch, und diese Stellen kann man lernen.

## Die vier Stellen

| Stelle | Was passiert | Woran du es siehst |
|---|---|---|
| **Die Grenze** | `>` statt `>=`, eins zu viel oder zu wenig | Was passiert mit genau dem Grenzwert? |
| **Der leere Fall** | Keine Zeile, keine Datei, leere Liste | Was passiert, wenn nichts kommt? |
| **Die erfundene Funktion** | Ein Befehl, den es nicht gibt | Gibt es diese Funktion wirklich? |
| **Die stille Annahme** | Das Modell rät, was du gemeint hast | Steht im Auftrag, was hier gilt? |

Die erfundene Funktion ist die Code-Fassung der erfundenen Quelle aus Stufe 1:
Sie klingt plausibel, sie hat einen passenden Namen, und es gibt sie nicht.

```aufgabe
id: E3-08
typ: uebereinstimmung
titel: "Welche Stelle ist es?"
punkte: 30
frage: "Ordne jeden Fehler der Stelle zu, an der er entstanden ist."
links:
  - "Rabatt ab 100 Euro, aber genau 100 bekommen keinen"
  - "Das Programm stürzt ab, wenn der Ordner leer ist"
  - "datei.lies_alles_schnell() gibt es nicht"
  - "Das Modell rechnet in Dollar, weil keine Währung genannt war"
rechts:
  - "Die Grenze"
  - "Der leere Fall"
  - "Die erfundene Funktion"
  - "Die stille Annahme"
loesung:
  "Rabatt ab 100 Euro, aber genau 100 bekommen keinen": "Die Grenze"
  "Das Programm stürzt ab, wenn der Ordner leer ist": "Der leere Fall"
  "datei.lies_alles_schnell() gibt es nicht": "Die erfundene Funktion"
  "Das Modell rechnet in Dollar, weil keine Währung genannt war": "Die stille Annahme"
richtzeit_s: 90
erklaerung: |
  Vier Fehler, vier Prüffragen. Wer sie sich bei jedem Programm stellt,
  findet die meisten Fehler, bevor sie jemand anderes findet.
```

## Ein Beispiel

Der Auftrag war: *„Gib allen Kunden ab 100 Euro Einkauf 10 % Rabatt und
rechne den Durchschnitt der Endbeträge aus."* Das Modell hat geliefert:

```aufgabe
id: E3-09
typ: sicherheit
titel: "Finde die falschen Zeilen"
punkte: 35
frage: "Klicke die Zeilen an, in denen das Programm nicht tut, was der Auftrag verlangt."
code: |
  def endbetraege(einkaeufe):
      ergebnis = []
      for betrag in einkaeufe:
          if betrag > 100:
              betrag = betrag * 0.9
          ergebnis.append(betrag)
      return ergebnis

  def durchschnitt(werte):
      return sum(werte) / len(werte)
zeilen: [4, 10]
richtzeit_s: 150
hinweise:
  - text: "Was passiert mit einem Einkauf von genau 100 Euro?"
    kostet: 6
  - text: "Was passiert, wenn die Liste leer ist? Wodurch wird dann geteilt?"
    kostet: 6
erklaerung: |
  Zeile 4: „ab 100" heißt >= 100, nicht > 100 - die Grenze. Zeile 10: Bei
  einer leeren Liste wird durch 0 geteilt, das Programm stürzt ab - der leere
  Fall. Alles andere tut, was es soll. Beide Fehler fallen beim normalen
  Testen nicht auf, weil man selten genau 100 oder gar nichts eingibt.
```

## Wie du das Modell selbst prüfen lässt

Das Modell gegen sich selbst, wie in Stufe 2, Lektion 2 — aber mit einem
festen Auftrag statt „prüfe das mal":

> Prüfe diesen Code auf genau vier Dinge: 1. Grenzwerte, 2. leere Eingaben,
> 3. Funktionen, die es in Python nicht gibt, 4. Annahmen, die nicht im Auftrag
> stehen. Nenne für jeden Fund die Zeile.

Eine Liste mit Nummern zwingt das Modell, jede Frage zu beantworten, statt
allgemein „sieht gut aus" zu sagen. Die Entscheidung bleibt trotzdem bei dir.

```aufgabe
id: E3-10
typ: denkaufgabe
titel: "Die beste Prüfung"
punkte: 25
frage: "Du willst wissen, ob eine Rabattfunktion stimmt. Welcher Test findet den Grenzfehler am sichersten?"
optionen:
  - "Einkäufe von 50, 200 und 1000 Euro eingeben"
  - "Einkäufe von 99,99, 100 und 100,01 Euro eingeben"
  - "Das Modell fragen, ob die Funktion stimmt"
  - "Die Funktion zehnmal mit 200 Euro aufrufen"
loesung: "Einkäufe von 99,99, 100 und 100,01 Euro eingeben"
richtzeit_s: 60
erklaerung: |
  Fehler sitzen an Grenzen, also testet man an Grenzen: knapp darunter,
  genau darauf, knapp darüber. 50, 200 und 1000 bestätigen nur, was ohnehin
  funktioniert - das ist der Bestätigungsfehler aus Stufe 2.
```
