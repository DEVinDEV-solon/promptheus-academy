---
type: lesson
title: "Einsatz I — der einzelne ChatBot"
description: "Aus acht Feldern werden sechs Zeilen. Einmal oben, danach nie wieder."
tags:
  - lesson
  - kurs-7
  - marke
  - systemprompt
timestamp: 2026-08-23T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 0
dauer_min: 30
---

# Einsatz I — der einzelne ChatBot

## Vom Dokument zum Baustein

Dein Dokument ist zwei Seiten lang. In den Systemprompt kommt nicht alles,
sondern das, was **in jede Antwort** muss. Erfahrungsgemäß sind das sechs
Zeilen.

Der Baustein von PROMPTHEUS, als Muster:

```
Du bist der Tutor der PROMPTHEUS ACADEMY.
Haltung: erklären statt beeindrucken. Ruhig, genau, geduldig.
Ansprache: du — immer, für jedes Alter.
Form: 2 bis 5 Sätze. Fachbegriff beim ersten Mal erklären.
Nie: Ausrufezeichen, Emoji im Fließtext, "einfach", "schnell",
     Superlative, erfundene Zahlen.
Jede Absage nennt einen Weg: was ist, warum, was jetzt zu tun ist.
```

Was hier fehlt, ist Absicht: die Farben (der Bot malt nicht), das Register
(er spricht nur mit einer Gruppe), die Trennlinie (sie steht implizit in den
Regeln).

## Vier Regeln für den Baustein

**1 · Kein „bitte", kein „versuche".** Eine Regel im Systemprompt ist ein
Zustand, keine Bitte. „Bitte antworte kurz" ist eine Einladung zum Abweichen.

**2 · Verbote sind stärker als Wünsche.** „Nie Superlative" wirkt zuverlässiger
als „schreibe sachlich", weil es eindeutig prüfbar ist — für das Modell und
für dich.

**3 · Zahlen statt Adjektive.** „2 bis 5 Sätze" ist eine Vorgabe, „kurz" ist
eine Meinung.

**4 · Was nicht in jede Antwort muss, gehört nicht hinein.** Jede Zeile kostet
bei jeder Anfrage. Ein Systemprompt von zwei Seiten ist kein besserer, sondern
ein teurerer.

## Der Vorher-Nachher-Versuch

Nimm denselben Bot und stelle zweimal dieselbe Frage — einmal ohne Baustein,
einmal mit. Vergleiche wieder Länge, Anrede, Aufbau.

Was du sehen wirst: **Die Antworten werden sich untereinander ähnlicher.** Das
ist der ganze Zweck. Nicht „besser" im Einzelfall, sondern verlässlich über
viele Fälle.

## Wo der Baustein hingehört

| Werkzeug | Stelle |
|---|---|
| Eigener Bot über eine Schnittstelle | Feld `system` bei jeder Anfrage |
| Fertige Oberflächen | „Eigene Anweisungen", „Custom Instructions", „Projekt-Anweisung" |
| Agent in einem Rahmenwerk | Rollen- oder Systemdatei des Agenten |
| Kommandozeilen-Werkzeuge | eine Datei, die als Systemprompt mitgegeben wird |

Überall gilt dasselbe: **eine Stelle, ein Text, unverändert.**

```aufgabe
id: K7-06
typ: denkaufgabe
titel: "Welche Zeile taugt für einen Systemprompt?"
punkte: 20
frage: "Welche dieser Zeilen ist als Regel im Systemprompt brauchbar?"
optionen:
  - "Antworte in 2 bis 5 Sätzen."
  - "Bitte versuche, dich eher kurz zu fassen."
  - "Schreibe ansprechend und zielgruppengerecht."
  - "Sei bitte nicht zu lang, aber auch nicht zu knapp."
loesung: "Antworte in 2 bis 5 Sätzen."
richtzeit_s: 60
hinweise:
  - text: "Eine Regel muss prüfbar sein — von dir und vom Modell."
    kostet: 5
erklaerung: |
  Nur die erste Zeile nennt eine Zahl und ist damit überprüfbar. „Bitte
  versuche" lädt zum Abweichen ein, „ansprechend" und „zielgruppengerecht"
  sind Adjektive ohne Inhalt, und „nicht zu lang, nicht zu knapp" beschreibt
  einen Bereich, den niemand kennt.
```

```aufgabe
id: K7-07
typ: plugplay
titel: "Dein Baustein in sechs Zeilen"
punkte: 25
frage: "Welche sechs Angaben gehören in einen Systemprompt-Baustein? Zieh sie hinüber — die anderen gehören ins Dokument, aber nicht in jede Anfrage."
bausteine:
  - "Rolle (wer spricht)"
  - "Haltung"
  - "Ansprache"
  - "Antwortform"
  - "Verbotsliste"
  - "Regel für Absagen"
  - "Die Hexwerte der drei Farben"
  - "Die Entstehungsgeschichte der Marke"
  - "Alle Gut/Schlecht-Paare vollständig"
loesung:
  - "Rolle (wer spricht)"
  - "Haltung"
  - "Ansprache"
  - "Antwortform"
  - "Verbotsliste"
  - "Regel für Absagen"
richtzeit_s: 150
hinweise:
  - text: "Was ein Textmodell beim Antworten nicht braucht, kostet nur Platz."
    kostet: 5
erklaerung: |
  Die sechs gewählten Angaben formen jede einzelne Antwort. Farbwerte braucht
  ein Bot, der Text schreibt, nie; die Entstehungsgeschichte gehört ins
  Dokument für Menschen; und die vollständige Beispielsammlung würde den
  Prompt vervierfachen, ohne die Regeln zu schärfen — zwei, drei Paare als
  Muster genügen.
```
