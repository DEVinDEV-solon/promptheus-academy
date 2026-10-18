---
type: lesson
title: "Vom Plan zum lauffähigen Programm"
description: "Kleine Schritte, die jeder für sich laufen, eine Versionsgeschichte als Sicherheitsnetz und ein Modell als Mitarbeiter mit klarem Auftrag."
tags:
  - lesson
  - stufe-6
  - projekt
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 6
dauer_min: 18
---

# Vom Plan zum lauffähigen Programm

## Der Plan ist fertig, und jetzt?

In Lektion 1 hast du drei Fragen beantwortet: Wer benutzt es, woran merkst du,
dass es funktioniert, und was ist der kleinste nützliche Schritt. Dazwischen
liegen fünf Stufen Handwerk: Aufträge (2), Abläufe (3), Systeme (4),
Sicherheit (5). Diese Lektion verbindet beides zu einer Arbeitsweise.

Die wichtigste Regel beim Bauen lautet:

> **Immer nur einen kleinen Schritt — und nach jedem Schritt läuft es.**

Nicht „erst alles schreiben, dann ausprobieren". Sondern: ein Teil, ausprobiert,
gesichert. Der nächste Teil, ausprobiert, gesichert. Wer zwanzig Dinge auf
einmal ändert und es läuft nicht, weiß nicht, welches der zwanzig schuld ist.

## Die Versionsgeschichte als Sicherheitsnetz

Jeder gesicherte Schritt bekommt einen Eintrag in einer **Versionsgeschichte**.
Das bekannteste Werkzeug dafür heißt *Git*; jeder Eintrag heißt *Commit* und
trägt eine kurze Beschreibung. Der Nutzen ist einfach:

- Geht etwas kaputt, springst du zurück zum letzten Stand, der lief.
- Du siehst, **was** sich wann geändert hat, und **warum** — wenn die
  Beschreibung gut ist.
- Du kannst etwas ausprobieren, ohne Angst, den funktionierenden Stand zu
  verlieren.

Und denk an Stufe 5, Lektion 1: **Was einmal in der Geschichte steht, bleibt
dort.** Schlüssel und Passwörter kommen nie in einen Commit.

```aufgabe
id: E6-02
typ: denkaufgabe
titel: "Die gute Beschreibung"
punkte: 20
frage: "Welche Commit-Beschreibung hilft dir in drei Monaten am meisten?"
optionen:
  - "Änderungen"
  - "Fix"
  - "Rabatt gilt jetzt ab genau 100 Euro (vorher erst ab 100,01)"
  - "Viele Sachen verbessert und aufgeräumt"
loesung: "Rabatt gilt jetzt ab genau 100 Euro (vorher erst ab 100,01)"
richtzeit_s: 45
erklaerung: |
  Sie sagt, was sich geändert hat und warum - und sie beschreibt genau einen
  Schritt. „Viele Sachen verbessert" ist ein Zeichen, dass zu viel auf
  einmal gesichert wurde.
```

## Das Modell als Mitarbeiter

Beim Bauen hilft dir ein Modell enorm — wenn du es behandelst wie einen
**neuen Mitarbeiter mit klarem Auftrag**, nicht wie einen Zauberer. Alles aus
Stufe 2 und 3 gilt:

| Statt | Besser |
|---|---|
| „Bau mir eine App für Rechnungen." | „Schreibe eine Funktion, die aus einer Liste von Beträgen die Summe über 100 Euro bildet. Eingabe: Liste von Zahlen. Ausgabe: eine Zahl." |
| Den ganzen Code auf einmal übernehmen | Einen Teil übernehmen, lesen, testen, sichern (Stufe 3, Lektion 4) |
| „Mach es besser." | „Prüfe auf Grenzwerte, leere Eingaben und erfundene Funktionen." |

Je kleiner der Auftrag, desto besser das Ergebnis — und desto leichter
erkennst du, ob es stimmt.

```aufgabe
id: E6-03
typ: schiebe
titel: "Ein Schritt, sauber gemacht"
punkte: 30
frage: "Bring die Schritte beim Bauen eines Programmteils in die richtige Reihenfolge."
bausteine:
  - "Den Code lesen und auf die vier typischen Fehler prüfen"
  - "Dem Modell einen kleinen, genauen Auftrag geben"
  - "Mit Testfällen ausprobieren, auch an den Grenzen"
  - "Den Stand mit einer klaren Beschreibung sichern"
loesung:
  - "Dem Modell einen kleinen, genauen Auftrag geben"
  - "Den Code lesen und auf die vier typischen Fehler prüfen"
  - "Mit Testfällen ausprobieren, auch an den Grenzen"
  - "Den Stand mit einer klaren Beschreibung sichern"
richtzeit_s: 75
erklaerung: |
  Auftrag, lesen, testen, sichern - und dann der nächste Schritt. Gesichert
  wird erst, was läuft. So enthält die Geschichte nur Stände, zu denen man
  gefahrlos zurückkann.
```

## Die erste lauffähige Fassung

Die erste Fassung soll nicht schön sein. Sie soll **den kleinsten nützlichen
Schritt** aus Lektion 1 erfüllen — und nichts sonst. Alles, was dir beim Bauen
einfällt („es wäre doch toll, wenn …"), kommt auf eine Liste für später.

Diese Liste ist wichtig. Ohne sie wächst das Projekt beim Bauen, und du landest
dort, wo Stufe 3 gewarnt hat: bei einem Projekt, das nie fertig wird.

```aufgabe
id: E6-04
typ: plugplay
titel: "Jetzt oder später?"
punkte: 30
frage: "Dein kleinster nützlicher Schritt ist: „Die Termine des Tages kommen jeden Morgen als eine Nachricht.“ Was gehört in die erste Fassung?"
bausteine:
  - "Termine des heutigen Tages aus dem Kalender lesen"
  - "Eine Wettervorhersage dazuschreiben"
  - "Die Termine als eine Nachricht um 7 Uhr senden"
  - "Ein eigenes Design für die Nachricht mit Logo"
  - "Eine Meldung, wenn der Kalender nicht erreichbar ist"
loesung:
  - "Termine des heutigen Tages aus dem Kalender lesen"
  - "Die Termine als eine Nachricht um 7 Uhr senden"
  - "Eine Meldung, wenn der Kalender nicht erreichbar ist"
richtzeit_s: 70
erklaerung: |
  Lesen, senden und der Fehlerfall gehören zum kleinsten Schritt - ohne
  Fehlerfall würde die Nachricht an manchen Tagen einfach fehlen, und
  niemand wüsste warum. Wetter und Design kommen auf die Liste für später.
```
