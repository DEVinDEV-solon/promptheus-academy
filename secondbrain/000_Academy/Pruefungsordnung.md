---
type: foundation
title: "Prüfungsordnung"
description: "Wie bewertet wird — und warum kein Sprachmodell Punkte vergibt."
tags:
  - foundation
  - uni
  - pruefung
timestamp: 2026-08-18T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
ampel: "🟢"
konfidenz: hoch
---

# Prüfungsordnung

## Der Grundsatz

**Punkte rechnet kein Sprachmodell.**

Bewertung, Punkte, Abzeichen, Prüfungen und Urkunden sind deterministisch:
derselbe Versuch gibt beim zweiten Lauf dasselbe Ergebnis. Ein Modell, das
heute 55 und morgen 70 Punkte gibt, macht jede Prüfungsordnung wertlos — und
eine Urkunde wäre keine Aussage mehr, sondern eine Momentaufnahme.

Das kostet etwas. Der Preis ist bewusst bezahlt und steht unten.

## Wie die zwölf Typen bewertet werden

Elf der zwölf [[40_Aufgabentypen/_index|Aufgabentypen]] haben eine eindeutige
Lösung, die der Server vergleicht. Die Einzelheiten stehen im jeweiligen
Steckbrief.

## Freitext — der Preis

Bei [[planung]] gibt es keine eindeutige Lösung. Bewertet wird gegen
**Prüfungen, die in der Aufgabe stehen**: bestimmte Begriffe kommen vor, andere
nicht, eine Mindestlänge, eine Reihenfolge.

Das ist gröber, als ein Mensch bewerten würde, und gröber, als ein Modell
bewerten könnte. Dafür ist es **nachrechenbar**: wer wissen will, warum er 40
und nicht 60 Punkte hat, bekommt die Liste zu sehen — welche Prüfung erfüllt
war und welche nicht.

**Athena** schreibt darunter eine Anmerkung. Sie ist oft das Nützlichste an der
ganzen Rückmeldung. Sie **ändert den Punktestand nicht**.

## Prüfungen

Eine Stufenprüfung unterscheidet sich in drei Punkten von einer Lektion:

1. Alle Aufgaben werden **gemeinsam** bewertet, am Ende.
2. Es gibt **keine Hinweise** und **keine Musterlösung** während des Laufs.
3. Wer besteht, schaltet die nächste Stufe frei und bekommt eine Urkunde.

Zum Bestehen sind in der Regel **60 %** nötig; der genaue Wert steht in der
`kurs.json` des Kurses.

**Eine Prüfung darf wiederholt werden, beliebig oft.** Eine Prüfung, die man
einmal verhaut und die dann für immer zu ist, prüft Nerven statt Wissen. Jeder
Versuch wird protokolliert; ein Tutor sieht die Reihe.

## Urkunden

Jede bestandene Stufenprüfung gibt eine Urkunde mit einem **Prüfcode**
(`PU-<stufe>-<8 Zeichen>`).

Der Code lässt sich **ohne Anmeldung** nachschlagen — ein Arbeitgeber oder eine
Schule soll eine Urkunde prüfen können, ohne ein Konto zu haben.

**Die Auskunft nennt keinen Namen.** Sie bestätigt Stufe, Datum und Gültigkeit,
also das, was auf der vorgelegten Urkunde ohnehin steht. Gäbe sie den Namen
zurück, wäre die Liste aller Codes ein Namensverzeichnis der Lernenden — und
die sind teils minderjährig.

Der Code ist zufällig, nicht aus dem Namen abgeleitet. Wäre er ableitbar,
könnte jeder die Urkunde eines anderen erraten und dessen Stand nachschlagen.

Ein Tutor kann eine Urkunde **widerrufen**. Gelöscht wird sie nie: eine
widerrufene Urkunde muss als widerrufen auffindbar bleiben.