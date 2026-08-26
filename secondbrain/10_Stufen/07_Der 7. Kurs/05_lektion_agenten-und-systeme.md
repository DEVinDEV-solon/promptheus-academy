---
type: lesson
title: "Einsatz II — Agenten und Mehr-Agenten-Systeme"
description: "Ein Agent handelt, also braucht er mehr Regeln. Und vier Agenten brauchen eine Datei statt vier Absätze."
tags:
  - lesson
  - kurs-7
  - marke
  - agenten
timestamp: 2026-08-23T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 0
dauer_min: 35
---

# Einsatz II — Agenten und Mehr-Agenten-Systeme

## Ein Agent schreibt nicht nur, er tut

In Stufe 4 hast du Agenten gebaut: Programme, die ein Modell benutzen und dabei
Werkzeuge bedienen — suchen, rechnen, anlegen, ändern. Damit kommen zwei
Regelsorten dazu, die ein ChatBot nicht braucht.

### Wie er berichtet

„Fertig" ist keine Meldung. Bei PROMPTHEUS gilt: **was getan wurde, was dabei
herauskam, was noch offen ist** — drei Teile, immer in dieser Reihenfolge.

> **Schlecht:** „Fertig."
> **Gut:** „24 Aufgaben geprüft. 21 richtig, 3 mit Tippfehler. Offen:
> Aufgabe 17, dort fehlt der Text."

Ohne diese Regel bekommst du mal einen Roman und mal ein Wort — und beides zur
selben Tätigkeit.

### Wo er stehenbleibt

Vor dem Unumkehrbaren wird gefragt. Das ist **keine technische Einstellung,
sondern Marke**: Ein Werkzeug, das ungefragt löscht, ist ein anderes Werkzeug —
auch wenn dasselbe Modell darin steckt.

> „Ich würde 3 Konten löschen. Soll ich?"

## Mehrere Agenten: hier zahlt sich das Dokument aus

Vier Agenten, viermal einzeln formuliert, ergeben vier Marken. Die Lösung ist
**nicht**, denselben Absatz viermal zu schreiben — nach dem dritten Nachziehen
weicht einer ab, und niemand merkt es.

**Eine Datei, vier Verweise.** Jeder Agent bekommt die Guideline unverändert,
dazu seine Rolle:

```
[Brand-Guideline, unverändert]      ← identisch bei allen
+ Rolle: Tutor    · antwortet Lernenden   · 2–5 Sätze
+ Rolle: Prüfer   · bewertet Aufgaben     · richtig/falsch, dann warum
+ Rolle: Sprecher · schreibt Vertontes    · Hörsätze, keine Klammern
+ Rolle: Autor    · schreibt Lektionen    · Markdown, Beispiel je Absatz
```

## Was dabei wirklich entsteht

**Die Ausgaben passen zueinander, obwohl sie aus verschiedenen Läufen kommen.**
Der Prüfer widerspricht dem Tutor nicht im Ton, der Sprecher klingt wie der
Autor schreibt.

Ohne gemeinsame Grundlage merkt man an jedem Übergang, dass hier zwei
verschiedene Systeme sprechen — und das ist genau der Eindruck, den eine Marke
nicht machen darf.

Dazu kommt die Rechnung: **Eine Änderung ist eine Zeile.** Sie greift überall
gleichzeitig. Das ist der Unterschied zwischen einem System und vier
Werkzeugen, die zufällig nebeneinanderstehen.

## Die Reihenfolge im Prompt

Nicht beliebig: **Das Besondere steht hinter dem Allgemeinen, damit es im
Zweifel gewinnt.**

1. Die Guideline (gilt für alle)
2. Die Rolle (gilt für diesen einen)
3. Der Auftrag (gilt für diesen einen Lauf)

Dreht man das um, überschreibt die allgemeine Regel die besondere — und der
Prüfer antwortet plötzlich wie der Tutor.

```aufgabe
id: K7-08
typ: denkaufgabe
titel: "Vier Agenten, eine Marke"
punkte: 20
frage: "Ein System hat vier Agenten. Wie hält man ihren Stil zusammen?"
optionen:
  - "Eine Guideline-Datei, die jeder Agent unverändert bekommt, dazu je eine Rolle"
  - "Denselben Stilabsatz in alle vier Rollendateien kopieren"
  - "Nur den wichtigsten Agenten mit Stilvorgaben versehen"
  - "Den Stil in jeden einzelnen Auftrag schreiben"
loesung: "Eine Guideline-Datei, die jeder Agent unverändert bekommt, dazu je eine Rolle"
richtzeit_s: 75
hinweise:
  - text: "Frag dich, was beim vierten Nachbessern passiert."
    kostet: 5
erklaerung: |
  Kopierte Absätze laufen auseinander, sobald zum ersten Mal nachgebessert
  wird — und der Fehler fällt nicht auf, weil jeder Agent für sich stimmig
  bleibt. Ein einziger Agent mit Stil macht die Übergänge schlimmer, nicht
  besser. Und in jedem Auftrag neu getippt ist es nirgends nachlesbar.
```

```aufgabe
id: K7-09
typ: uebereinstimmung
titel: "Welche Regel gehört zu welcher Stufe?"
punkte: 25
frage: "Ordne jede Regel der Einsatzstufe zu, für die sie zuerst nötig wird."
links:
  - "Antworte in 2 bis 5 Sätzen"
  - "Frag nach, bevor du etwas Unumkehrbares tust"
  - "Alle bekommen dieselbe Guideline plus ihre Rolle"
rechts:
  - "ChatBot"
  - "Agent mit Werkzeugen"
  - "Mehr-Agenten-System"
loesung:
  "Antworte in 2 bis 5 Sätzen": "ChatBot"
  "Frag nach, bevor du etwas Unumkehrbares tust": "Agent mit Werkzeugen"
  "Alle bekommen dieselbe Guideline plus ihre Rolle": "Mehr-Agenten-System"
richtzeit_s: 100
hinweise:
  - text: "Eine Regel entsteht erst, wenn ein Programm etwas TUT statt nur zu schreiben."
    kostet: 5
erklaerung: |
  Die Antwortform braucht schon der einfachste Bot. Der Halt vor dem
  Unumkehrbaren entsteht erst, wenn Werkzeuge im Spiel sind — ein Bot, der nur
  schreibt, kann nichts löschen. Die gemeinsame Grundlage wird erst zum Thema,
  wenn mehr als einer spricht.
```
