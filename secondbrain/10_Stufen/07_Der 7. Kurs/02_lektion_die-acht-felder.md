---
type: lesson
title: "Die acht Felder"
description: "Ausweis, Persönlichkeit, Register, Sprache, Gestalt, Ausgabeformen, Einsatz, Trennlinie. Dein Dokument entsteht."
tags:
  - lesson
  - kurs-7
  - marke
timestamp: 2026-08-23T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 0
dauer_min: 45
---

# Die acht Felder

## Zwei Seiten sind die Obergrenze

Nicht das Minimum. Eine Guideline, die niemand ganz liest, wirkt wie keine —
und sie muss in einen Systemprompt passen. Das ist kein Zufall, das ist das
Maß.

Deshalb acht Felder und nicht dreißig. Jedes beantwortet **eine** Frage.

## 1 · Ausweis

Fünf Zeilen. Wer nur diese liest, macht wenig falsch.

| Feld | Deine Antwort |
|---|---|
| Was | |
| Für wen | |
| Der Satz | |
| Das Bild | |
| Die Haltung | |

**Die Probe:** Wenn dein Text auch unter einem fremden Namen stehen könnte,
ohne dass jemand es merkt, fehlt hier etwas.

## 2 · Persönlichkeit

Vier Eigenschaften — **und wogegen sich jede abgrenzt.** Die Gegenprobe ist
der eigentliche Trick: „freundlich" sagt nichts, „freundlich, aber nicht
kumpelhaft" sagt viel.

> **Beispiel (PROMPTHEUS):** genau, aber nicht pedantisch · geduldig, aber
> nicht herablassend · klar, aber nicht schroff · warm, aber nicht kumpelhaft

## 3 · Register

Mit welchen Gruppen sprichst du, und was ändert sich dabei? **Was sich nie
ändert, ist die Haltung.** Sonst hast du keine Marke, sondern drei.

## 4 · Sprache

Hier gehören **Gut/Schlecht-Paare** hin, keine Adjektive. Ein Modell kann mit
„sei präzise" wenig anfangen und mit zwei gegenübergestellten Sätzen sehr viel.

> **Gut:** „Noch 3 von 6 Stufen."
> **Schlecht:** „Wow, du bist schon so weit gekommen! 🎉"

Dazu deine **Verbotsliste**: Wörter, die bei dir nicht vorkommen. Sie ist der
wirksamste Teil des ganzen Dokuments, weil ein Verbot eindeutig ist.

## 5 · Gestalt

Drei Farben — und was jede **bedeutet**. Nicht „orange ist unsere Farbe",
sondern „orange heißt: hier geht es weiter".

Eine Farbe ohne Bedeutung ist Dekoration; eine Farbe mit Bedeutung ist eine
Regel, an die sich auch eine Maschine halten kann.

## 6 · Ausgabeformen

Der Teil, den die meisten vergessen. Deine fünf häufigsten Anlässe, und für
jeden die Form: Wie lang? Welche Reihenfolge? Was steht zuerst?

**Länge ist eine Marken-Entscheidung, keine Geschmacksfrage.** Wer auf jede
Frage vierzehn Absätze schreibt, ist eine andere Marke als wer in vier Sätzen
antwortet — bei identischem Wortschatz.

## 7 · Einsatz

Der Systemprompt-Baustein, herausgezogen aus 1 bis 6. Sechs Zeilen reichen.
Wie er gebaut wird, steht in Lektion 4.

## 8 · Trennlinie

Was ist fest, was bleibt frei? Das ist Lektion 3 — und die schwerste Frage des
Kurses.

```aufgabe
id: K7-03
typ: uebereinstimmung
titel: "Welches Feld beantwortet was?"
punkte: 25
frage: "Ordne jeder Frage das Feld zu, in das ihre Antwort gehört."
links:
  - "Wie lang ist eine Antwort auf eine einfache Frage?"
  - "Welches Wort kommt bei uns nie vor?"
  - "Was heißt die Farbe Gold bei uns?"
  - "Mit wem sprechen wir, und was ändert sich dabei?"
rechts:
  - "Ausgabeformen"
  - "Sprache"
  - "Gestalt"
  - "Register"
loesung:
  "Wie lang ist eine Antwort auf eine einfache Frage?": "Ausgabeformen"
  "Welches Wort kommt bei uns nie vor?": "Sprache"
  "Was heißt die Farbe Gold bei uns?": "Gestalt"
  "Mit wem sprechen wir, und was ändert sich dabei?": "Register"
richtzeit_s: 120
hinweise:
  - text: "Zwei Fragen betreffen Wörter, zwei betreffen Form und Farbe."
    kostet: 5
erklaerung: |
  Länge und Aufbau sind Form, also Ausgabeformen. Verbotene Wörter sind
  Sprache. Die Bedeutung einer Farbe ist Gestalt — und zwar der wichtigere
  Teil davon als der Farbwert selbst. Wer mit wem spricht, ist das Register.
```

```aufgabe
id: K7-04
typ: denkaufgabe
titel: "Welche Gegenprobe trägt?"
punkte: 20
frage: "Eine Eigenschaft im Feld „Persönlichkeit\" braucht eine Gegenprobe. Welche der folgenden ist brauchbar?"
optionen:
  - "professionell, aber nicht steif"
  - "professionell, aber nicht unprofessionell"
  - "professionell und sehr professionell"
  - "professionell, aber nicht langweilig oder schlecht oder unhöflich"
loesung: "professionell, aber nicht steif"
richtzeit_s: 60
hinweise:
  - text: "Eine Gegenprobe muss etwas ausschliessen, das sonst plausibel wäre."
    kostet: 5
erklaerung: |
  „Steif" ist die naheliegende Fehlform von „professionell" — die Grenze sagt
  also wirklich etwas. Das Gegenteil des Wortes selbst schliesst nichts aus,
  eine Steigerung ist keine Grenze, und eine Liste aus vier Verneinungen
  verwässert die Aussage, statt sie zu schärfen.
```
