---
type: lesson
title: "Was künstliche Intelligenz ist — und was das Wort verschleiert"
description: "Warum „Intelligenz“ ein schlechtes Wort für die Sache ist, und was stattdessen passiert."
tags:
  - lesson
  - stufe-1
  - grundlagen
timestamp: 2026-08-18T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 1
dauer_min: 12
---

# Was künstliche Intelligenz ist

## Ein schlechtes Wort für eine gute Sache

„Künstliche Intelligenz" ist ein Werbename aus dem Jahr 1956. Er sollte
Forschungsgeld einwerben, und das hat er getan. Als Beschreibung dessen, was
die Programme tun, taugt er wenig — und er richtet Schaden an, weil er zwei
falsche Erwartungen weckt:

**Erstens** klingt „Intelligenz" nach einem *Wesen*, das versteht, will und
weiß. **Zweitens** klingt „künstlich" nach *nachgebaut* — als wäre in der
Maschine ein kleines Gehirn.

Beides ist falsch. Was wirklich passiert, ist unspektakulärer und viel
nützlicher zu wissen.

## Drei Dinge, die alle „KI" heißen

| Was | Was es tut | Beispiel |
|---|---|---|
| **Regelsystem** | folgt Regeln, die ein Mensch geschrieben hat | Steuerprogramm, Schachcomputer der 1990er |
| **Maschinelles Lernen** | findet Muster in Daten und wendet sie an | Spamfilter, Bildkennung |
| **Sprachmodell (LLM)** | sagt voraus, welcher Textbaustein als nächster kommt | ChatGPT, Claude, Gemini |

Alle drei heißen im Alltag „KI". In dieser Academy geht es fast immer um das
dritte — und wenn nicht, steht es dabei.

## Was ein Sprachmodell tut

Ein **LLM** (Large Language Model, großes Sprachmodell) tut genau eine Sache:

> Es bekommt einen Text und berechnet, welches Textstück am wahrscheinlichsten
> als nächstes kommt. Dann hängt es dieses Stück an und rechnet wieder.

Das ist alles. Kein Verstehen, kein Wollen, kein Nachschlagen. Es ist eine
außerordentlich gut trainierte Vervollständigung.

Die naheliegende Frage ist: **Wie kann daraus etwas Sinnvolles werden?** Die
Antwort ist der eigentliche Grund, warum diese Werkzeuge funktionieren: um
vorherzusagen, wie ein Satz weitergeht, muss man erstaunlich viel über die
Welt gelernt haben. Wer das Wort nach „Die Hauptstadt von Frankreich ist"
richtig vorhersagen will, muss die Hauptstadt kennen.

Aber — und das ist die Kehrseite, die dich durch die ganze Academy begleiten wird —
das Modell weiß **nicht, ob es sie kennt**. Es berechnet nur, was gut
weitergeht. Klingt eine falsche Antwort glatter als die richtige, kommt die
falsche.

```aufgabe
id: E1-01
typ: denkaufgabe
titel: "Was tut ein Sprachmodell?"
punkte: 20
frage: "Ein LLM bekommt einen Text. Was macht es damit?"
optionen:
  - "Es schlägt die Antwort in einer Datenbank nach."
  - "Es berechnet, welches Textstück am wahrscheinlichsten als nächstes kommt."
  - "Es versteht die Frage und denkt über die Antwort nach."
  - "Es sucht im Internet nach der Antwort."
loesung: "Es berechnet, welches Textstück am wahrscheinlichsten als nächstes kommt."
richtzeit_s: 40
hinweise:
  - text: "Lies noch einmal den eingerückten Kasten weiter oben. Dort steht es in einem Satz."
    kostet: 5
erklaerung: |
  Ein Sprachmodell sagt das nächste Textstück voraus, sonst nichts.
  Nachschlagen und Suchen sind Zusatzwerkzeuge, die manche Programme
  drumherum bauen - das Modell selbst tut es nicht.
quelle: "[[90_Quellen/wasserzeichen/llm-grundlagen-tokens-und-vokabular]]"
```

## Warum es Dinge erfindet

Wenn ein Modell nur berechnet, was gut weitergeht, dann gibt es keinen
Unterschied zwischen „wahr" und „klingt richtig". Beides ist für die Maschine
dasselbe: ein Text, der gut weitergeht.

Deshalb erfindet ein Sprachmodell Quellenangaben, Paragraphen, Jahreszahlen und
Namen — **fließend und ohne jedes Zögern**. Es lügt dabei nicht. Lügen setzt
voraus, dass man die Wahrheit kennt und etwas anderes sagt.

Das ist der Grund, warum in dieser Academy jede Zahl eine Fundstelle hat. Und der
Grund, warum du eine KI-Antwort mit Quellenangabe **nicht** für besser halten
sollst als eine ohne: die Quellenangabe ist genauso vorhergesagt wie der Rest.

```aufgabe
id: E1-02
typ: denkaufgabe
titel: "Eine erfundene Quelle"
punkte: 25
frage: "Ein Sprachmodell nennt dir für eine Behauptung eine Studie mit Titel, Autor und Jahr. Was folgt daraus?"
mehrfach: true
optionen:
  - "Die Angabe kann vollständig erfunden sein und muss geprüft werden."
  - "Die Behauptung ist belegt, weil eine Quelle dabeisteht."
  - "Das Modell hat gelogen, es kannte die Wahrheit und sagte etwas anderes."
  - "Eine Quellenangabe entsteht genauso durch Vorhersage wie der übrige Text."
loesung:
  - "Die Angabe kann vollständig erfunden sein und muss geprüft werden."
  - "Eine Quellenangabe entsteht genauso durch Vorhersage wie der übrige Text."
richtzeit_s: 70
hinweise:
  - text: "Zwei der vier Aussagen sind richtig. Denk daran, wie eine Quellenangabe im Modell entsteht."
    kostet: 6
erklaerung: |
  Eine Quellenangabe ist für das Modell nur weiterer Text, der gut
  weitergeht. Sie ist deshalb kein Beleg, sondern selbst eine Behauptung.
  "Lügen" trifft es nicht: dazu müsste das Modell die Wahrheit kennen
  und sich dagegen entscheiden.
```

## Was daraus folgt

Drei Sätze, die den Rest der Academy tragen:

1. **Ein Sprachmodell erzeugt Text, keine Wahrheit.** Prüfen bleibt deine Arbeit.
2. **Es kennt seine eigene Unsicherheit nicht.** Eine sichere Formulierung sagt
   nichts über die Verlässlichkeit.
3. **Es ist trotzdem ein außergewöhnliches Werkzeug** — für alles, wo man das
   Ergebnis prüfen kann. Und das ist überraschend viel.

```aufgabe
id: E1-03
typ: uebereinstimmung
titel: "Ordne die Begriffe zu"
punkte: 25
frage: "Welcher Begriff gehört zu welcher Erklärung?"
links: [LLM, Token, Prompt, Halluzination]
rechts:
  - "Ein großes Sprachmodell, das den nächsten Textbaustein vorhersagt"
  - "Ein Textbaustein — das Stück, mit dem ein Modell rechnet"
  - "Der Text, den du dem Modell gibst"
  - "Eine erfundene Angabe, die richtig klingt"
loesung:
  LLM: "Ein großes Sprachmodell, das den nächsten Textbaustein vorhersagt"
  Token: "Ein Textbaustein — das Stück, mit dem ein Modell rechnet"
  Prompt: "Der Text, den du dem Modell gibst"
  Halluzination: "Eine erfundene Angabe, die richtig klingt"
richtzeit_s: 90
hinweise:
  - text: "Fang mit Prompt an — das ist der Text, den DU schreibst."
    kostet: 5
erklaerung: |
  Diese vier Begriffe brauchst du ab jetzt ständig. "Halluzination" ist
  übrigens auch ein schlechtes Wort: es klingt nach einem Fehler, ist aber
  dasselbe Verfahren, das sonst richtige Antworten erzeugt.
```
