---
type: lesson
title: "Wie ein Modell liest: Tokens"
description: "Warum Token und Wort nicht dasselbe sind, und warum Deutsch teurer ist als Englisch."
tags:
  - lesson
  - stufe-1
  - tokens
timestamp: 2026-08-18T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 1
dauer_min: 14
---

# Wie ein Modell liest: Tokens

## Ein Modell sieht keine Buchstaben

Und keine Wörter. Es sieht **Tokens** — Teilstücke, die ein Programm namens
Tokenizer aus riesigen Textmengen gelernt hat. Ein Token ist mal ein ganzes
Wort, mal eine Silbe, mal ein einzelnes Zeichen, oft mit dem Leerzeichen davor.

```
"Die Hauptstadt von Frankreich"
 →  ["Die", " Haupt", "stadt", " von", " Frank", "reich"]
```

Häufige Wörter sind ein Token. Seltene werden zerlegt. Das ist kein Zufall,
sondern der Sinn der Sache: so kommt ein Modell mit einem festen Vokabular
(meist 50 000 bis 200 000 Einträge) aus und kann trotzdem jedes Wort
darstellen — auch eines, das es nie gesehen hat.

## Deutsch ist teurer

| Sprache | Tokens pro Wort (ungefähr) |
|---|---|
| Englisch | 1,3 |
| Deutsch | 1,8 – 2,2 |

Deutsch hat Komposita und Flexion. **„Wasserzeichenentfernung"** ist ein Wort
und leicht vier bis sechs Tokens.

Das hat drei praktische Folgen, und alle drei wirst du merken:

- Deutscher Text **kostet mehr**, wenn du für eine Schnittstelle bezahlst.
- In dasselbe Kontextfenster passt **weniger** deutscher Text.
- Wer „300 Tokens" mit „300 Wörter" gleichsetzt, liegt im Deutschen um mehr als
  das Doppelte daneben.

Genau diesen Fehler macht ein weit verbreitetes Erklärvideo, das im
Wissensspeicher `21_Wasserzeichen` analysiert wurde: es spricht von *„300
Tokens, also etwa 300 Wörter"*. Im Deutschen sind 300 Tokens eher **140 bis
170 Wörter**.

```aufgabe
id: E1-04
typ: mathe
titel: "Wie viele Tokens?"
punkte: 25
frage: "Ein deutscher Text hat 500 Wörter. Wie viele Tokens sind das ungefähr? Rechne mit 2,0 Tokens pro Wort."
loesung: 1000
toleranz: 50
einheit: "Tokens"
richtzeit_s: 60
hinweise:
  - text: "500 Wörter, 2 Tokens je Wort. Mehr ist es nicht."
    kostet: 5
erklaerung: |
  500 x 2,0 = 1000 Tokens. Die Toleranz von 50 ist Absicht: die Faustregel
  liegt zwischen 1,8 und 2,2, also zwischen 900 und 1100. Gelernt werden soll
  die Größenordnung, nicht eine Zahl auf die Stelle genau.
quelle: "[[90_Quellen/wasserzeichen/llm-grundlagen-tokens-und-vokabular]]"
```

## Warum ein Modell nicht buchstabieren kann

Frag ein Sprachmodell, wie viele „r" in „Erdbeere" stecken. Ältere Modelle
zählen falsch, und das wirkt absurd bei einer Maschine, die
Differentialgleichungen erklärt.

Der Grund steht oben: **das Modell sieht keine Buchstaben.** Es sieht
vielleicht `["Erd", "beere"]` — zwei Klumpen. Nach Buchstaben zu zählen ist für
es ungefähr so, wie für dich die Zahl der Striche in einem chinesischen
Schriftzeichen zu zählen, das du nur als Ganzes kennst.

Dasselbe erklärt: warum Modelle bei Reimen straucheln, warum sie Wörter
rückwärts schlecht schreiben, warum sie sich beim Zeichenzählen irren.

**Nicht weil es schwer ist. Weil sie die Bausteine nicht sehen.**

```aufgabe
id: E1-05
typ: denkaufgabe
titel: "Warum verzählt sich ein Modell?"
punkte: 20
frage: "Warum tut sich ein Sprachmodell schwer damit, Buchstaben in einem Wort zu zählen?"
optionen:
  - "Weil Zählen für Computer grundsätzlich schwierig ist."
  - "Weil es das Wort als Token sieht und nicht als Folge von Buchstaben."
  - "Weil es nicht genug Rechenleistung hat."
  - "Weil es beim Training keine Wörter gesehen hat."
loesung: "Weil es das Wort als Token sieht und nicht als Folge von Buchstaben."
richtzeit_s: 45
erklaerung: |
  Die Bausteine des Modells sind Tokens, nicht Buchstaben. Was es nicht als
  getrennte Einheit sieht, kann es nicht getrennt zählen. Rechenleistung
  hat damit nichts zu tun.
```

## Das Kontextfenster

Ein Modell kann nur eine begrenzte Menge Tokens auf einmal betrachten — sein
**Kontextfenster**. Alles, was hineinmuss, zählt mit: deine Frage, die
angehängten Dokumente, der bisherige Gesprächsverlauf, die Systemanweisung.

Ist das Fenster voll, fällt das Älteste heraus. Deshalb „vergisst" ein langes
Gespräch seinen Anfang. Es vergisst nicht im menschlichen Sinn — der Text ist
schlicht nicht mehr dabei.

```aufgabe
id: E1-06
typ: schiebe
titel: "Vom Text zur Antwort"
punkte: 30
frage: "Bringe die Schritte in die richtige Reihenfolge — was passiert, wenn du einem Modell etwas schreibst?"
bausteine:
  - "Das Modell hängt das gewählte Token an und rechnet erneut"
  - "Du schreibst einen Text"
  - "Der Tokenizer zerlegt ihn in Tokens"
  - "Das Modell berechnet für jedes mögliche nächste Token eine Zahl"
  - "Ein Token wird ausgewählt"
loesung:
  - "Du schreibst einen Text"
  - "Der Tokenizer zerlegt ihn in Tokens"
  - "Das Modell berechnet für jedes mögliche nächste Token eine Zahl"
  - "Ein Token wird ausgewählt"
  - "Das Modell hängt das gewählte Token an und rechnet erneut"
richtzeit_s: 100
hinweise:
  - text: "Fang bei dir an. Was ist der allererste Schritt, bevor irgendetwas gerechnet wird?"
    kostet: 6
  - text: "Der letzte Schritt ist der, der die Schleife schließt — er führt zurück zum Rechnen."
    kostet: 8
erklaerung: |
  Diese Schleife ist der ganze Vorgang. Sie läuft für jedes einzelne Token
  der Antwort einmal durch. Wenn ein Modell dir dreihundert Tokens antwortet,
  ist sie dreihundertmal gelaufen.
quelle: "[[90_Quellen/wasserzeichen/llm-grundlagen-tokens-und-vokabular]]"
```
