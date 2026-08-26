---
type: lesson
title: "Wie ein Modell wählt: warum es nie zweimal dasselbe sagt"
description: "Logits, Temperatur und Wahlfreiheit — der Schritt vom Rechnen zum Antworten."
tags:
  - lesson
  - stufe-1
  - sampling
timestamp: 2026-08-18T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 1
dauer_min: 15
---

# Wie ein Modell wählt

## Aus einer Zahl je Token wird eine Antwort

In der letzten Lektion stand: das Modell berechnet für jedes mögliche nächste
Token eine Zahl. Diese Rohwerte heißen **Logits**. Für ein Vokabular von
100 000 Tokens gibt es also 100 000 Zahlen — für jedes einzelne Token der
Antwort neu.

Rohwerte sind unhandlich: manche sind negativ, sie ergeben zusammen nichts
Bestimmtes. Deshalb werden sie in Wahrscheinlichkeiten umgerechnet, die sich zu
100 % addieren:

```
Logits              →  Wahrscheinlichkeiten
Paris      12,4          88 %
Lyon        7,1           6 %
Marseille   6,8           4 %
Bordeaux    5,2           2 %
… 99 996 weitere         ~0 %
```

Dann wird **eines gezogen**. Nicht immer das oberste — gezogen wird nach
Wahrscheinlichkeit, wie aus einer Lostrommel, in der „Paris" 88 von 100 Losen
hat.

## Die Temperatur

Ein Regler namens **Temperatur** verändert, wie stark der Unterschied zwischen
den Losen ist:

| Temperatur | Wirkung | Wofür |
|---|---|---|
| **0** | immer das wahrscheinlichste Token | Fakten, Code, Übersetzung |
| **~0,7** | meist naheliegend, gelegentlich anders | Gespräch, Erklärungen |
| **~1,5** | auch Unwahrscheinliches kommt durch | Ideen sammeln, Dichtung |

**Hier ist die Antwort auf eine Frage, die sich jeder irgendwann stellt:**
Warum antwortet dasselbe Modell auf dieselbe Frage zweimal verschieden?

Weil gezogen wird. Bei Temperatur 0 nicht — da kommt zweimal dasselbe.

```aufgabe
id: E1-07
typ: denkaufgabe
titel: "Welche Temperatur?"
punkte: 25
frage: "Du lässt ein Modell eine Rechtsvorschrift zusammenfassen. Welche Temperatur ist richtig, und warum?"
optionen:
  - "Niedrig — bei Fakten will man das Wahrscheinlichste, nicht das Überraschende."
  - "Hoch — dann findet das Modell interessantere Formulierungen."
  - "Egal — die Temperatur wirkt sich nur auf die Länge aus."
  - "Hoch — dann prüft das Modell mehr Möglichkeiten und wird genauer."
loesung: "Niedrig — bei Fakten will man das Wahrscheinlichste, nicht das Überraschende."
richtzeit_s: 50
hinweise:
  - text: "Überlege, was „überraschend“ bei einem Paragraphen bedeuten würde."
    kostet: 6
erklaerung: |
  Bei einer Rechtsvorschrift ist jede Abweichung ein Fehler, keine Kreativität.
  Und Vorsicht bei der letzten Antwort: eine hohe Temperatur macht das Modell
  nicht gründlicher - sie macht die Auswahl nur zufälliger.
quelle: "[[90_Quellen/wasserzeichen/llm-grundlagen-sampling-und-entropie]]"
```

## Wahlfreiheit — wo sie ist und wo nicht

Manchmal hat das Modell echte Wahl: bei „Der Himmel war heute besonders …"
passen Dutzende Wörter. Manchmal hat es keine: nach „Die Hauptstadt von
Frankreich ist" ist praktisch alles außer „Paris" falsch.

Das Maß dafür heißt **Entropie** — Wahlfreiheit in Zahlen. Aus dem
Wissensspeicher `21_Wasserzeichen`:

| Textsorte | Wahlfreiheit |
|---|---|
| Freier Fließtext, Essay, Erzählung | hoch |
| Fachtext mit festen Begriffen | mittel |
| Faktenaussage | niedrig |
| Zitat, Zahl, Eigenname, Adresse | fast null |
| Quellcode | sehr niedrig |
| Kommentare **im** Quellcode | hoch |

Die letzte Zeile ist die interessanteste: derselbe Text hat an verschiedenen
Stellen völlig verschiedene Wahlfreiheit. Der Code selbst ist festgelegt — die
Kommentare daneben sind frei.

**Das ist mehr als eine Kuriosität.** Es entscheidet darüber, ob sich ein
unsichtbares Wasserzeichen in KI-Text überhaupt unterbringen lässt. Wo keine
Wahl ist, lässt sich nichts markieren. In Stufe 5 kommt das wieder.

```aufgabe
id: E1-08
typ: plugplay
titel: "Wo hat ein Modell echte Wahl?"
punkte: 30
frage: "Zieh die Textstellen in die Ablage, an denen ein Modell viel Wahlfreiheit hat. Die Reihenfolge ist egal."
bausteine:
  - "eine Beschreibung einer Landschaft"
  - "eine IBAN"
  - "ein Kommentar im Quellcode"
  - "das Geburtsjahr von Goethe"
  - "ein Werbeslogan"
  - "der Name einer Hauptstadt"
loesung:
  - "eine Beschreibung einer Landschaft"
  - "ein Kommentar im Quellcode"
  - "ein Werbeslogan"
richtzeit_s: 90
hinweise:
  - text: "Frag dich bei jedem: Gibt es hier mehrere richtige Möglichkeiten — oder nur eine?"
    kostet: 7
erklaerung: |
  Landschaft, Kommentar und Slogan lassen sich auf hundert Arten formulieren,
  die alle richtig sind. IBAN, Geburtsjahr und Hauptstadt haben genau eine
  richtige Fassung - dort hat das Modell keine Wahl, und wenn es doch etwas
  anderes wählt, ist es schlicht falsch.
quelle: "[[90_Quellen/wasserzeichen/llm-grundlagen-sampling-und-entropie]]"
```

## Was du jetzt erklären kannst

Ohne ein einziges Fachwort zu benutzen, das du nicht erklären könntest:

> Ein Sprachmodell zerlegt Text in Tokens, berechnet für jedes mögliche nächste
> Token eine Wahrscheinlichkeit und zieht eines. Dann wieder. Und wieder. Die
> Temperatur bestimmt, wie riskant gezogen wird.

Damit hast du das Kernstück. Alles Weitere in dieser Academy — Prompting, Agenten,
Sicherheit, Wasserzeichen — baut darauf auf.

```aufgabe
id: E1-09
typ: mathe
titel: "Die Lostrommel"
punkte: 20
frage: "Ein Modell gibt „Paris“ 88 %, „Lyon“ 6 % und „Marseille“ 4 %. Wie viel Prozent bleiben zusammen für ALLE übrigen Tokens?"
loesung: 2
toleranz: 0.5
einheit: "Prozent"
richtzeit_s: 45
erklaerung: |
  100 - 88 - 6 - 4 = 2 Prozent. Die verteilen sich auf zehntausende Tokens,
  also praktisch nichts je Token. Genau deshalb kommt bei einer Faktenfrage
  fast immer dieselbe Antwort - auch ohne Temperatur 0.
```
