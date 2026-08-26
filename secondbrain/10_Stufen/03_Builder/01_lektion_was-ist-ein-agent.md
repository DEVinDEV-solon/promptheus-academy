---
type: lesson
title: "Was ein Agent ist"
description: "Beispiellektion der Stufe 3 — zeigt die Form, nicht den vollen Stoff."
tags:
  - lesson
  - stufe-3
  - geruest
timestamp: 2026-08-18T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 3
dauer_min: 12
---

# Was ein Agent ist

> **Beispiellektion.** Stufe 3 wird noch ausgearbeitet. Diese Lektion ist vollständig und benutzbar — sie zeigt, wie der Kurs aussehen wird.

Ein **Agent** ist ein Programm, das drei Dinge in einer Schleife tut:

1. **Wahrnehmen** — es liest etwas: eine Nachricht, eine Datei, eine Uhrzeit.
2. **Entscheiden** — es wählt, was zu tun ist. Hier sitzt oft das Modell.
3. **Handeln** — es tut etwas: schreibt, sendet, legt ab, ruft auf.

Das ist die Wenn-Dann-Kette aus Stufe 2, nur dass die Entscheidung nicht fest verdrahtet ist.

**Und genau daher kommt die Schwierigkeit.** Eine feste Regel tut immer dasselbe. Ein Modell an derselben Stelle tut *meistens* dasselbe — und das ist etwas anderes. Ein Agent, der in 99 von 100 Fällen richtig handelt, macht bei tausend Läufen zehn Fehler. Ob das tragbar ist, hängt daran, was er anrichtet.

```aufgabe
id: E3-01
typ: schiebe
titel: "Die Agentenschleife"
punkte: 30
frage: "Ordne die drei Schritte eines Agenten - und den vierten, der die Schleife schließt."
bausteine:
  - "Handeln - etwas tun"
  - "Wahrnehmen - etwas lesen"
  - "Von vorn beginnen"
  - "Entscheiden - wählen, was zu tun ist"
loesung:
  - "Wahrnehmen - etwas lesen"
  - "Entscheiden - wählen, was zu tun ist"
  - "Handeln - etwas tun"
  - "Von vorn beginnen"
richtzeit_s: 70
hinweise:
  - text: "Ohne den ersten Schritt hat der Agent nichts, worüber er entscheiden könnte."
    kostet: 5
erklaerung: |
  Wahrnehmen, Entscheiden, Handeln, wiederholen. Jeder Agent, den du je
  bauen wirst, hat diese Schleife - auch wenn sie im Code nicht so aussieht.
```
