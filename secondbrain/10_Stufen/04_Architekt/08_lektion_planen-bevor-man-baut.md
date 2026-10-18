---
type: lesson
title: "Ein System planen, bevor man es baut"
description: "Teile, Pfeile, Zuständigkeiten: wie aus einer Idee ein Entwurf wird, den man begründen kann — und woran man einen schlechten Schnitt erkennt."
tags:
  - lesson
  - stufe-4
  - systemdenken
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 4
dauer_min: 18
---

# Ein System planen, bevor man es baut

## Wie schneide ich es?

Die Kursseite verspricht: Nach dieser Stufe kannst du ein System entwerfen
**und begründen, warum es so geschnitten ist.** Begründen heißt: Für jede
Grenze zwischen zwei Teilen kannst du sagen, warum sie genau dort verläuft.

Ein Entwurf besteht aus drei Dingen, die du jetzt alle kennst:

| Teil des Entwurfs | Frage | Lektion |
|---|---|---|
| **Teile** | Welche Agenten, Programme, Menschen? Was tut jeder? | 1, 2 |
| **Pfeile** | Wer liefert wem was, in welchem Vertrag? | 3, 4 |
| **Zustand** | Was weiß das System dauerhaft, und wer darf es ändern? | 5 |
| **Aufsicht** | Wo sitzt ein Mensch, welche Rechte hat jeder Teil? | 6 |
| **Ausfall** | Was passiert, wenn ein Teil nicht antwortet? | 7 |

## Woran man einen guten Schnitt erkennt

Drei Prüfungen, die jeder Entwurf bestehen sollte:

1. **Jeder Teil lässt sich in einem Satz beschreiben.** Braucht er ein „und",
   tut er wahrscheinlich zwei Dinge — und ist zwei Teile.
2. **Jede Entscheidung hat genau einen Besitzer.** Wenn zwei Teile über
   dasselbe entscheiden dürfen, entscheiden sie es irgendwann verschieden.
3. **Die Pfeile sind wenige und einfach.** Ein Teil, der mit allen anderen
   spricht, ist entweder ein Dirigent (dann ist es gewollt) oder ein
   Hinweis darauf, dass die Grenzen falsch gezogen sind.

```aufgabe
id: E4-20
typ: denkaufgabe
titel: "Der verdächtige Teil"
punkte: 25
frage: "Ein Entwurf enthält den Agenten „Kundenbetreuer“: Er beantwortet Fragen, schreibt Rechnungen, ändert Verträge und pflegt die Kundendatenbank. Was ist das Problem?"
optionen:
  - "Kein Problem, ein Agent ist billiger als vier."
  - "Er tut mehrere Dinge mit sehr unterschiedlichen Rechten und Folgen — er sollte geteilt werden."
  - "Er braucht ein größeres Modell."
  - "Er braucht einen anderen Namen."
loesung: "Er tut mehrere Dinge mit sehr unterschiedlichen Rechten und Folgen — er sollte geteilt werden."
richtzeit_s: 60
erklaerung: |
  Fragen beantworten ist folgenlos, Verträge ändern nicht. Ein Teil mit
  allen Rechten ist der Teil, den ein einziger Fehler - oder ein
  eingeschleuster Text - am teuersten macht. Getrennt kann jeder genau die
  Rechte und die Aufsicht bekommen, die zu ihm passen.
```

## Erst zeichnen, dann begründen

Ein Entwurf ist fertig, wenn du ihn **jemandem erklären kannst, der ihn nicht
gebaut hat.** Dafür reicht ein Diagramm und zu jeder Grenze ein Satz:

```
[Postfach] --> [Sortierer] --> [Beantworter] --> [Freigabe: Mensch] --> Versand
                   |                 |
                   v                 v
            [Ablage: Zustand]  [Kundenakte: nur lesen]
```

- *Sortierer und Beantworter sind getrennt*, weil der Sortierer nur Regeln
  und ein kleines Modell braucht, der Beantworter ein großes.
- *Der Beantworter liest die Kundenakte nur*, weil er sie nie ändern muss.
- *Vor dem Versand steht ein Mensch*, weil die Antwort nach außen geht.

```aufgabe
id: E4-21
typ: schiebe
titel: "In welcher Reihenfolge entwirft man?"
punkte: 30
frage: "Bring die Schritte eines Systementwurfs in eine sinnvolle Reihenfolge."
bausteine:
  - "Für jeden Pfeil den Vertrag festlegen"
  - "Festlegen, was passiert, wenn ein Teil ausfällt"
  - "Die Aufgabe in Teile mit je einem Satz zerlegen"
  - "Jeder Entscheidung einen Besitzer geben"
  - "Aufsicht und Rechte je Teil bestimmen"
loesung:
  - "Die Aufgabe in Teile mit je einem Satz zerlegen"
  - "Jeder Entscheidung einen Besitzer geben"
  - "Für jeden Pfeil den Vertrag festlegen"
  - "Aufsicht und Rechte je Teil bestimmen"
  - "Festlegen, was passiert, wenn ein Teil ausfällt"
richtzeit_s: 90
erklaerung: |
  Erst die Teile, dann wer worüber entscheidet, dann die Verbindungen, dann
  die Sicherungen. Wer mit den Sicherungen anfängt, sichert Teile ab, die es
  am Ende gar nicht gibt.
```

## Der häufigste Planungsfehler

Er heißt: **zu früh zu groß.** Ein Entwurf mit acht Agenten auf dem Papier
sieht beeindruckend aus und wird selten fertig. Die Regel aus Stufe 3 gilt
auch hier: Plane das ganze System, aber **baue zuerst den kleinsten Teil, der
allein nützt** — und erweitere erst, wenn er eine Woche lang läuft.

```aufgabe
id: E4-22
typ: plugplay
titel: "Was gehört in den ersten Bauabschnitt?"
punkte: 25
frage: "Du hast ein System für Kundenanfragen entworfen. Was gehört in den ersten Bauabschnitt, der schon allein nützt?"
bausteine:
  - "Anfragen nach Thema sortieren und ablegen"
  - "Automatische Rabattangebote je nach Stimmung"
  - "Eine Übersicht, welche Anfragen offen sind"
  - "Ein Agent, der selbstständig Verträge ändert"
loesung:
  - "Anfragen nach Thema sortieren und ablegen"
  - "Eine Übersicht, welche Anfragen offen sind"
richtzeit_s: 60
erklaerung: |
  Sortieren und eine Übersicht nützen sofort, sind folgenarm und bilden die
  Grundlage für alles Weitere. Rabatte und Vertragsänderungen sind
  folgenreich - sie kommen spät, mit Freigabe.
```
