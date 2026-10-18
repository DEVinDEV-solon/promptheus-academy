---
type: lesson
title: "Mit Menschen testen"
description: "Eine Lösung ist erst fertig, wenn jemand anderes sie benutzen kann. Zuschauen statt fragen, fünf Personen statt fünfzig — und was man mit den Ergebnissen macht."
tags:
  - lesson
  - stufe-6
  - testen
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 6
dauer_min: 15
---

# Mit Menschen testen

## Du bist der schlechteste Tester deiner Lösung

Die Kursseite verspricht eine Lösung, **die jemand anderes benutzen kann**.
Genau dieser Satz macht dich zum schlechtesten Tester: Du weißt, wie es
gemeint ist. Du klickst automatisch richtig, du liest die Fehlermeldung, die
du selbst geschrieben hast, und verstehst sie. Jemand anderes nicht.

Automatische Tests (vorige Lektion) prüfen, ob das Programm **richtig rechnet**.
Menschen prüfen, ob es **richtig gedacht** ist — ob es die Aufgabe löst, für die
es gebaut wurde.

## Zuschauen statt fragen

Der häufigste Fehler beim Testen mit Menschen ist die Frage *„Wie findest du
es?"*. Die Antwort ist fast immer höflich und fast nie nützlich. Viel mehr
erfährst du, wenn du **zuschaust**:

1. Gib der Person eine **echte Aufgabe** („Lass dir die Termine für morgen
   schicken"), keine Erklärung.
2. Bitte sie, **laut zu denken** — was sie sucht, was sie erwartet.
3. **Hilf nicht.** Jede Stelle, an der du helfen willst, ist ein Befund.
4. Schreib auf, **wo sie zögert, sucht oder sich irrt**.

```aufgabe
id: E6-08
typ: denkaufgabe
titel: "Die nützlichste Frage"
punkte: 25
frage: "Du testest deine Lösung mit einer Kollegin. Was bringt dir die verwertbarsten Erkenntnisse?"
optionen:
  - "Du fragst am Ende: „Wie gefällt es dir?“"
  - "Du erklärst ihr alles vorher genau, damit sie nichts falsch macht."
  - "Du gibst ihr eine echte Aufgabe, schaust zu, wie sie sie löst, und hilfst nicht."
  - "Du schickst ihr einen Fragebogen mit zwanzig Fragen."
loesung: "Du gibst ihr eine echte Aufgabe, schaust zu, wie sie sie löst, und hilfst nicht."
richtzeit_s: 50
erklaerung: |
  Was Menschen tun, ist ehrlicher als was sie sagen. Wer vorher alles
  erklärt, testet seine Erklärung, nicht seine Lösung.
```

## Fünf reichen

Du brauchst keine fünfzig Testpersonen. Die meisten Hürden zeigen sich schon
bei den **ersten drei bis fünf** — danach siehst du dieselben Stellen immer
wieder. Besser: fünf Personen testen, die größten Hürden beheben, wieder fünf
Personen testen.

Wichtig ist, **wen** du fragst: Menschen, die die Lösung später wirklich
benutzen sollen. Für ein Werkzeug, das Lehrkräfte nutzen, testet eine Lehrkraft
mehr als zehn Programmierer.

## Befunde ordnen

Nach dem Test hast du eine Liste mit Stellen, an denen es hakte. Nicht alle
sind gleich wichtig. Eine einfache Ordnung:

| Schwere | Bedeutung | Was tun |
|---|---|---|
| **Blocker** | Die Aufgabe ließ sich nicht lösen | Vor allem anderen beheben |
| **Hürde** | Gelöst, aber mit Mühe oder Umweg | Bald beheben |
| **Schönheit** | Störte, behinderte aber nicht | Auf die Liste für später |

```aufgabe
id: E6-09
typ: uebereinstimmung
titel: "Wie schwer wiegt es?"
punkte: 30
frage: "Ordne jeden Befund aus einem Test seiner Schwere zu."
links:
  - "Niemand fand den Knopf zum Absenden, alle gaben auf"
  - "Zwei von fünf brauchten drei Versuche für das Datumsformat"
  - "Eine Person fand die Farbe der Überschrift zu blass"
rechts:
  - "Blocker"
  - "Hürde"
  - "Schönheit"
loesung:
  "Niemand fand den Knopf zum Absenden, alle gaben auf": "Blocker"
  "Zwei von fünf brauchten drei Versuche für das Datumsformat": "Hürde"
  "Eine Person fand die Farbe der Überschrift zu blass": "Schönheit"
richtzeit_s: 60
erklaerung: |
  Wer aufgibt, hat einen Blocker gefunden. Wer es mit Mühe schafft, eine
  Hürde. Was nur stört, ist Schönheit - wichtig, aber zuletzt.
```

## Und was die Menschen eingeben

Ein letzter Punkt, der beim Testen mit echten Menschen auffällt: Sie geben
**echte Daten** ein. Namen, Adressen, vielleicht Dinge, die sie nicht
verbreitet sehen wollen. Stufe 5 gilt hier vollständig: Testdaten sollten
**ausgedachte** Daten sein, und wenn echte Menschen testen, muss vorher klar
sein, wohin ihre Eingaben fließen — besonders, wenn ein Modellanbieter im
Spiel ist.

```aufgabe
id: E6-10
typ: planung
titel: "Dein Testplan"
punkte: 40
frage: "Schreibe einen kurzen Plan für einen Test deiner Lösung mit Menschen: wen du fragst, welche echte Aufgabe du stellst und wie du mit den Daten der Testpersonen umgehst. Mindestens 50 Wörter."
pruefungen:
  - art: mindestens_woerter
    wert: 50
    punkte: 10
    begruendung: "Mindestens 50 Wörter."
  - art: enthaelt_eines
    werte: [kollege, kollegin, nutzer, lehrkraft, kunde, person, personen, schüler]
    punkte: 10
    begruendung: "Du sagst, wen du fragst."
  - art: enthaelt_eines
    werte: [aufgabe, auftrag, soll, lösen]
    punkte: 10
    begruendung: "Du nennst die echte Aufgabe."
  - art: enthaelt_eines
    werte: [daten, testdaten, ausgedacht, datenschutz, anonym, pseudonym]
    punkte: 10
    begruendung: "Du sagst, wie du mit den Daten umgehst."
richtzeit_s: 480
erklaerung: |
  Wen, was und wie mit den Daten: Mit diesen drei Antworten ist ein Test mit
  Menschen in einer Stunde vorbereitet - und er bringt mehr als eine Woche
  Grübeln über die beste Lösung.
```
