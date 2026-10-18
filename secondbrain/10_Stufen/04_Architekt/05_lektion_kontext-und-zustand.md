---
type: lesson
title: "Kontext, Zustand und warum Systeme vergessen"
description: "Ein Modell erinnert sich an nichts. Was ein System wissen muss, muss es selbst aufbewahren — und entscheiden, was davon wieder mitgeschickt wird."
tags:
  - lesson
  - stufe-4
  - kontext
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 4
dauer_min: 16
---

# Kontext, Zustand und warum Systeme vergessen

## Das Modell hat kein Gedächtnis

Es fühlt sich an, als würde ein Chat sich erinnern: Du schreibst „und jetzt
kürzer", und er weiß, was gemeint ist. Tatsächlich passiert etwas anderes.
**Bei jeder neuen Nachricht wird der ganze bisherige Verlauf noch einmal
mitgeschickt.** Das Modell liest ihn jedes Mal von vorn, als sähe es ihn zum
ersten Mal.

Du kennst die Folgen schon:

- aus Stufe 1, Lektion 2: Das **Kontextfenster** ist begrenzt. Was nicht
  hineinpasst, fällt vorn heraus.
- aus Stufe 3, Lektion 8: Jede Runde wird **teurer**, weil der Verlauf wächst.

## Kontext und Zustand

Für Systeme braucht man zwei Wörter, die oft verwechselt werden:

| Begriff | Was es ist | Wo es lebt |
|---|---|---|
| **Kontext** | Was das Modell bei *diesem einen Aufruf* zu lesen bekommt | Im Prompt, für einen Aufruf |
| **Zustand** | Was das System *dauerhaft* weiß | In einer Datei, einer Datenbank, einer Tabelle |

Ein Modell hat nur Kontext. Ein System hat Zustand. **Die Kunst besteht darin,
bei jedem Aufruf aus dem Zustand den passenden Kontext zu bauen** — nicht
alles, sondern das, was für diesen Schritt nötig ist.

```aufgabe
id: E4-11
typ: uebereinstimmung
titel: "Kontext oder Zustand?"
punkte: 30
frage: "Ordne zu, ob etwas Kontext eines Aufrufs oder Zustand des Systems ist."
links:
  - "Die Kundenakte mit allen Bestellungen seit 2021"
  - "Die drei letzten Bestellungen, die dem Modell für diese Antwort gezeigt werden"
  - "Der Systemprompt, der bei jedem Aufruf vorn steht"
  - "Die Liste, welche Mails schon beantwortet sind"
rechts:
  - "Zustand"
  - "Kontext"
  - "Kontext, bei jedem Aufruf neu"
  - "Zustand, den das System pflegt"
loesung:
  "Die Kundenakte mit allen Bestellungen seit 2021": "Zustand"
  "Die drei letzten Bestellungen, die dem Modell für diese Antwort gezeigt werden": "Kontext"
  "Der Systemprompt, der bei jedem Aufruf vorn steht": "Kontext, bei jedem Aufruf neu"
  "Die Liste, welche Mails schon beantwortet sind": "Zustand, den das System pflegt"
richtzeit_s: 90
erklaerung: |
  Die Akte und die Erledigt-Liste liegen dauerhaft im System. Was davon ins
  Modell geht, ist Kontext - und auch der Systemprompt ist Kontext, nur
  einer, der jedes Mal gleich mitgeschickt wird.
```

## Warum Systeme vergessen

Ein System „vergisst" an drei typischen Stellen:

1. **Das Fenster läuft über.** Ein langer Verlauf schiebt den Anfang hinaus —
   oft genau die Anweisung, die am wichtigsten war.
2. **Der Zustand wird nicht geschrieben.** Ein Agent erledigt etwas, aber
   niemand notiert es. Beim nächsten Lauf tut er es noch einmal.
3. **Zwei Agenten haben verschiedene Kontexte.** Der eine weiß, dass der Kunde
   gekündigt hat, der andere schreibt ihm ein Angebot.

Punkt 3 ist der Grund, warum in Lektion 1 die Frage *„Wer entscheidet was?"*
so wichtig war: **Wer entscheidet, braucht den Zustand.** Und zwar denselben,
nicht eine eigene Kopie.

```aufgabe
id: E4-12
typ: denkaufgabe
titel: "Die doppelte Mail"
punkte: 25
frage: "Ein Agent beantwortet jede Nacht neue Kundenmails. Manche Kunden bekommen zwei Antworten auf dieselbe Mail. Was ist die wahrscheinlichste Ursache?"
optionen:
  - "Das Modell ist zu kreativ eingestellt."
  - "Der Agent schreibt nicht in einen Zustand, welche Mails schon beantwortet sind."
  - "Das Kontextfenster ist zu klein."
  - "Die Kunden haben zweimal geschrieben."
loesung: "Der Agent schreibt nicht in einen Zustand, welche Mails schon beantwortet sind."
richtzeit_s: 60
erklaerung: |
  Ohne eine Erledigt-Liste ist jede Mail beim nächsten Lauf wieder „neu".
  Das Modell kann das nicht wissen - es hat kein Gedächtnis. Das System muss
  es wissen.
```

## Zusammenfassen statt mitschleppen

Was tun, wenn der Verlauf zu lang wird? Die übliche Antwort: **zusammenfassen.**
Statt fünfzig alter Nachrichten geht eine Zusammenfassung von zehn Zeilen mit.
Das spart Tokens und hält das Wichtige im Fenster — kostet aber Genauigkeit:
Was die Zusammenfassung weglässt, ist weg.

Deshalb gehört **das, was nie verloren gehen darf, nicht in den Verlauf**,
sondern in den Zustand oder fest in den Systemprompt. Genau das tut die
Guideline im 7. Kurs: Sie steht jedes Mal vorn, statt irgendwo im Verlauf zu
hoffen, dass sie noch drin ist.

```aufgabe
id: E4-13
typ: plugplay
titel: "Was gehört fest nach vorn?"
punkte: 25
frage: "Ein Kundenservice-Agent führt lange Gespräche. Welche Angaben sollten fest in jedem Aufruf stehen, statt nur irgendwann im Verlauf?"
bausteine:
  - "Die Regel: keine Rabatte über 10 % ohne Rückfrage"
  - "Der Gruß, mit dem der Kunde das Gespräch begonnen hat"
  - "Die Kundennummer, um die es geht"
  - "Eine Wetterbemerkung des Kunden von vorhin"
  - "Die Anrede: Wir siezen"
loesung:
  - "Die Regel: keine Rabatte über 10 % ohne Rückfrage"
  - "Die Kundennummer, um die es geht"
  - "Die Anrede: Wir siezen"
richtzeit_s: 70
erklaerung: |
  Regeln, die Sache, um die es geht, und feste Formen gehören nach vorn -
  sie dürfen nicht aus dem Fenster fallen. Gruß und Wetter dürfen in der
  Zusammenfassung verschwinden.
```
