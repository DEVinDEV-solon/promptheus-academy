---
type: lesson
title: "Die Empfehlung prüfen"
description: "Bevor du unterschreibst: Gegenprobe, Annahmen, Rechnung mit schlechteren Zahlen. Und warum ein Modell, das zustimmt, wenig beweist."
tags:
  - lesson
  - domaene
  - dom-ber
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 14
---

# Die Empfehlung prüfen

## Das Modell, das zustimmt

Fragst du ein Modell „Ist meine Empfehlung gut?“, sagt es meistens ja.
Sprachmodelle neigen dazu, der Richtung der Frage zu folgen. Eine
Zustimmung vom Modell ist deshalb fast nichts wert.

Wertvoll ist das Gegenteil: Lass das Modell **gegen** dich argumentieren.
„Du bist der Finanzvorstand des Kunden und hältst diese Empfehlung für
falsch. Nenne die drei stärksten Einwände." So wird aus dem Modell ein
Gegenspieler — und du siehst, wo die Empfehlung dünn ist.

```aufgabe
id: D5-20
typ: denkaufgabe
titel: "Welche Frage hilft?"
punkte: 25
frage: "Mit welchem Auftrag an ein Modell findest du am ehesten die Schwächen deiner Empfehlung?"
optionen:
  - "„Ist diese Empfehlung überzeugend?“"
  - "„Formuliere die Empfehlung noch überzeugender.“"
  - "„Du hältst diese Empfehlung für falsch. Nenne die drei stärksten Einwände mit Begründung.“"
  - "„Fasse die Empfehlung in einem Satz zusammen.“"
loesung: "„Du hältst diese Empfehlung für falsch. Nenne die drei stärksten Einwände mit Begründung.“"
richtzeit_s: 50
erklaerung: |
  Nur der dritte Auftrag zwingt das Modell auf die Gegenseite. Die anderen
  laden zur Zustimmung ein - und Zustimmung findest du auch ohne Modell.
```

## Annahmen sichtbar machen

Jede Empfehlung steht auf Annahmen: Die Einsparung wird so hoch sein, die
Kunden machen den Wechsel mit, die Preise bleiben stabil. Schreib sie auf
— und rechne einmal mit **schlechteren** Zahlen. Hält die Empfehlung dann
noch, ist sie robust. Kippt sie, muss das im Bericht stehen.

```aufgabe
id: D5-21
typ: mathe
titel: "Rechnung mit schlechteren Zahlen"
punkte: 30
frage: "Die Umstellung kostet einmalig 100.000 Euro. Erwartet wird eine Einsparung von 40.000 Euro im Jahr, also eine Amortisation nach 2,5 Jahren. Wie viele Jahre dauert es, wenn die Einsparung nur 25.000 Euro im Jahr beträgt?"
loesung: 4
toleranz: 0.05
einheit: "Jahre"
richtzeit_s: 70
hinweise:
  - text: "Einmalige Kosten geteilt durch Einsparung pro Jahr."
    kostet: 5
erklaerung: |
  100.000 / 25.000 = 4 Jahre. Aus zweieinhalb werden vier Jahre. Ob die
  Empfehlung das aushält, entscheidet der Kunde - aber er muss es wissen.
  Genau dafür ist die Rechnung mit schlechteren Zahlen da.
```

## Die letzte Freigabe

Am Ende des Ablaufs steht kein Modell und keine Regel, sondern eine
Person, die unterschreibt. Bevor sie das tut, geht sie eine kurze
Prüfliste durch. Sie ist die Freigabe aus Stufe 3, Lektion 7 — nur mit
mehr Gewicht.

```aufgabe
id: D5-22
typ: plugplay
titel: "Die Prüfliste vor der Unterschrift"
punkte: 30
frage: "Welche Punkte gehören auf die Prüfliste, bevor eine Empfehlung an den Kunden geht?"
bausteine:
  - "Beantwortet die Empfehlung die Kernfrage aus der Auftragsklärung?"
  - "Hat jede Zahl im Bericht einen geprüften Beleg?"
  - "Hat das Modell der Empfehlung zugestimmt?"
  - "Ist gerechnet, was passiert, wenn die wichtigste Annahme schlechter ausfällt?"
  - "Ist der Bericht länger als der des Wettbewerbers?"
loesung:
  - "Beantwortet die Empfehlung die Kernfrage aus der Auftragsklärung?"
  - "Hat jede Zahl im Bericht einen geprüften Beleg?"
  - "Ist gerechnet, was passiert, wenn die wichtigste Annahme schlechter ausfällt?"
richtzeit_s: 80
erklaerung: |
  Kernfrage, Belege, Annahmen: Das sind die drei Stellen, an denen ein
  Bericht scheitert. Zustimmung des Modells und Seitenzahl sagen darüber
  nichts.
```
