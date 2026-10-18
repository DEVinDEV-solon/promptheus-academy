---
type: lesson
title: "Python lesen, mit einem Modell an der Seite"
description: "Du musst nicht programmieren können, um ein Programm zu verstehen. Variablen, Listen, Schleifen und Bedingungen — gelesen, nicht auswendig gelernt."
tags:
  - lesson
  - stufe-3
  - python
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 3
dauer_min: 18
---

# Python lesen, mit einem Modell an der Seite

## Lesen kommt vor Schreiben

Ein Modell schreibt dir in zehn Sekunden ein Programm. Ob es tut, was du
willst, weißt du damit nicht. **Wer Code nicht lesen kann, kann ihn nicht
prüfen — und wer ihn nicht prüfen kann, führt Fremdes blind aus.**

Diese Lektion macht dich nicht zum Programmierer. Sie gibt dir die vier
Bausteine, aus denen fast jedes kleine Programm besteht, damit du einem
Modell über die Schulter sehen kannst.

## Die vier Bausteine

| Baustein | In Python | Was er tut |
|---|---|---|
| **Variable** | `preis = 12` | Ein Name für einen Wert |
| **Liste** | `preise = [12, 30, 7]` | Mehrere Werte in einer Reihe |
| **Schleife** | `for p in preise:` | Tu etwas für jeden Wert |
| **Bedingung** | `if p > 10:` | Tu es nur, wenn etwas zutrifft |

Das ist dieselbe Wenn-Dann-Kette wie im Ablauf der vorigen Lektion — nur in
einer Form, die ein Computer ausführen kann. Die Einrückung ist dabei kein
Schmuck: **Was eingerückt ist, gehört zu der Zeile darüber.**

```python
preise = [12, 30, 7, 45]
summe = 0
for p in preise:
    if p > 10:
        summe = summe + p
print(summe)
```

Lies es Zeile für Zeile, wie ein Computer: Die Summe beginnt bei 0. Für jeden
Preis wird geprüft, ob er über 10 liegt. Nur dann wird er dazugezählt. 12 ja,
30 ja, 7 nein, 45 ja.

```aufgabe
id: E3-05
typ: mathe
titel: "Was druckt das Programm?"
punkte: 25
frage: "Welche Zahl gibt das Programm oben aus?"
loesung: 87
toleranz: 0
richtzeit_s: 90
hinweise:
  - text: "Die 7 fällt durch die Bedingung. Zähl die anderen drei zusammen."
    kostet: 5
erklaerung: |
  12 + 30 + 45 = 87. Die 7 ist nicht größer als 10 und wird übersprungen.
  Genau so liest ein Computer: Zeile für Zeile, ohne zu raten, was gemeint war.
```

## Das Modell als Erklärer

Hier hilft dir das Modell wirklich — nicht als Schreiber, sondern als
**Erklärer**. Ein Auftrag nach den fünf Bausteinen aus Stufe 2:

> Du bist ein geduldiger Programmierlehrer. Erkläre mir dieses Python-Programm
> Zeile für Zeile. Ich bin Anfänger. Sag bei jeder Zeile in einem Satz, was
> sie tut, und am Ende, was das Programm ausgibt.

Und dann der wichtigste Schritt: **Prüfe die Erklärung gegen dein eigenes
Lesen.** Ein Modell erklärt Code meistens richtig. Aber es sagt die Ausgabe
vorher, statt sie auszurechnen — dieselbe Schwäche wie beim Buchstabenzählen
in Stufe 1. Bei langen Schleifen verrechnet es sich.

```aufgabe
id: E3-06
typ: denkaufgabe
titel: "Wem glaubst du?"
punkte: 25
frage: "Das Modell sagt, ein Programm gebe 120 aus. Du hast es Zeile für Zeile gelesen und kommst auf 112. Was tust du?"
optionen:
  - "Ich glaube dem Modell, es kennt Python besser."
  - "Ich führe das Programm aus — der Computer rechnet, statt vorherzusagen."
  - "Ich frage das Modell noch dreimal und nehme die häufigste Antwort."
  - "Ich nehme den Mittelwert, 116."
loesung: "Ich führe das Programm aus — der Computer rechnet, statt vorherzusagen."
richtzeit_s: 60
erklaerung: |
  Ein Modell sagt vorher, was wahrscheinlich herauskommt. Der Computer
  rechnet es aus. Wo es eine Ausführung gibt, ist sie die Quelle - das ist
  die Quellenkritik aus Stufe 2, angewendet auf Code.
```

## Die Bedingung, die alles umdreht

Ein Zeichen genügt, um ein Programm das Gegenteil tun zu lassen. Achte beim
Lesen besonders auf diese:

| Zeichen | Bedeutung |
|---|---|
| `>` / `>=` | größer / größer oder gleich |
| `==` | ist gleich (zwei Gleichheitszeichen!) |
| `!=` | ist ungleich |
| `not` | dreht Wahr und Falsch um |

```aufgabe
id: E3-07
typ: uebereinstimmung
titel: "Was bedeutet die Zeile?"
punkte: 30
frage: "Ordne jeder Python-Zeile ihre Bedeutung zu."
links:
  - "alter >= 18"
  - "name == „Ada“"
  - "betrag != 0"
  - "not erledigt"
rechts:
  - "Mindestens 18"
  - "Der Name ist genau Ada"
  - "Der Betrag ist nicht null"
  - "Noch nicht erledigt"
loesung:
  "alter >= 18": "Mindestens 18"
  "name == „Ada“": "Der Name ist genau Ada"
  "betrag != 0": "Der Betrag ist nicht null"
  "not erledigt": "Noch nicht erledigt"
richtzeit_s: 75
erklaerung: |
  >= schließt die Grenze ein, == vergleicht, != verneint den Vergleich, not
  dreht einen Wahrheitswert um. Die meisten Fehler in kleinen Programmen
  sitzen genau an diesen Zeichen.
```
