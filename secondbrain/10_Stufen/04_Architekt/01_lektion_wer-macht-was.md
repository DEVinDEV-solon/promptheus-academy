---
type: lesson
title: "Wer macht was"
description: "Beispiellektion der Stufe 4 — zeigt die Form, nicht den vollen Stoff."
tags:
  - lesson
  - stufe-4
  - geruest
timestamp: 2026-08-18T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 4
dauer_min: 12
---

# Wer macht was

> **Beispiellektion.** Stufe 4 wird noch ausgearbeitet. Diese Lektion ist vollständig und benutzbar — sie zeigt, wie der Kurs aussehen wird.

Ein System aus mehreren Agenten scheitert selten an der Technik. Es scheitert am **Schnitt**: zwei Agenten, die dieselbe Entscheidung treffen dürfen, treffen sie früher oder später verschieden.

Die Frage vor jedem Bau lautet deshalb nicht 'welche Agenten brauche ich', sondern:

> **Wer entscheidet was, und wer darf es ändern?**

Ein Diagramm hilft dabei mehr als eine Aufzählung, weil es die Pfeile sichtbar macht — und Pfeile sind die Stellen, an denen etwas schiefgeht.

```aufgabe
id: E4-01
typ: raeumlich
titel: "Wo sitzt die Aufsicht?"
punkte: 25
frage: "An welcher Stelle im Diagramm könnte ein Mensch eingreifen, bevor etwas nach aussen geht?"
diagramm: |
  Eingang --> [Prüfer] --> [Verfasser] --> [Freigabe] --> Versand
                                              ^
                                              |
                                          Protokoll
optionen: ["Prüfer", "Verfasser", "Freigabe", "Protokoll"]
loesung: "Freigabe"
richtzeit_s: 60
erklaerung: |
  Die Freigabe ist der letzte Punkt vor dem Versand - danach ist es draussen.
  Das Protokoll zeichnet auf, greift aber nicht ein: es beantwortet die Frage
  "was ist passiert", nicht "soll das passieren".
```
