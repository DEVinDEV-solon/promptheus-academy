---
type: lesson
title: "Was ein Ablauf kostet"
description: "Tokens mal Aufrufe mal Tage: warum eine Automation, die einmal fast nichts kostet, im Monat teuer werden kann — und wie man es vorher ausrechnet."
tags:
  - lesson
  - stufe-3
  - kosten
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 3
dauer_min: 14
---

# Was ein Ablauf kostet

## Einmal ist keinmal

Ein einzelner Modellaufruf kostet Bruchteile eines Cents. Deshalb denkt
niemand darüber nach. Aber ein Ablauf läuft nicht einmal: Er läuft bei jeder
Mail, jede Stunde, jeden Tag. **Die Kosten eines Ablaufs sind die Kosten
eines Aufrufs mal die Zahl der Aufrufe** — und die zweite Zahl wird fast
immer unterschätzt.

Du kennst die Rechengröße aus Stufe 1: das **Token**. Anbieter berechnen
Preise je Million Tokens, getrennt nach dem, was hineingeht (Eingabe), und
dem, was herauskommt (Ausgabe). Die Ausgabe ist meist mehrfach so teuer.

## Die Rechnung

```
Kosten = Tokens ÷ 1.000.000 × Preis je Million
```

Ein Beispiel: Ein Ablauf fasst jede eingehende Mail zusammen. Eine Mail hat
im Schnitt 800 Tokens, die Zusammenfassung 100. Es kommen 200 Mails am Tag.

| Posten | Rechnung | Tokens am Tag |
|---|---|---|
| Eingabe | 200 × 800 | 160.000 |
| Ausgabe | 200 × 100 | 20.000 |

Und weil Deutsch mehr Tokens braucht als Englisch (Stufe 1, Lektion 2), ist
eine deutsche Automation bei gleichem Inhalt teurer als eine englische.

```aufgabe
id: E3-20
typ: technisch
titel: "Was kostet ein Monat?"
punkte: 30
frage: "Ein Ablauf verbraucht im Monat 4.800.000 Eingabe-Tokens. Der Preis liegt bei 2,50 Euro je Million Eingabe-Tokens. Wie viele Euro kostet die Eingabe im Monat?"
pruefer: kosten_estimate
tokens: 4800000
preis_pro_mio: 2.5
toleranz: 0.01
richtzeit_s: 120
hinweise:
  - text: "Teile die Tokens durch eine Million und nimm das Ergebnis mal den Preis."
    kostet: 5
erklaerung: |
  4.800.000 ÷ 1.000.000 = 4,8 Millionen. 4,8 × 2,50 = 12 Euro. Nicht viel -
  aber dieselbe Rechnung mit einem Modell, das 15 Euro je Million kostet,
  ergibt 72 Euro für dieselbe Arbeit.
```

## Die Schleife, die nie endet

Die teuerste Automation ist nicht die große, sondern die **kaputte**. Ein
Agent, der in Lektion 1 seine Schleife nicht verlassen kann — wahrnehmen,
entscheiden, handeln, wahrnehmen, entscheiden, handeln … —, ruft das Modell
immer wieder auf. Jedes Mal mit dem wachsenden Verlauf im Kontextfenster, also
jedes Mal teurer.

Deshalb hat jeder ordentliche Agent drei Bremsen:

1. **Höchstzahl an Schritten** — nach zwanzig Runden ist Schluss.
2. **Kostendeckel** — nach fünf Euro ist Schluss.
3. **Zeitdeckel** — nach zehn Minuten ist Schluss.

Was zuerst greift, beendet den Lauf und **meldet** es — wie in Lektion 7.

```aufgabe
id: E3-21
typ: denkaufgabe
titel: "Warum wird jede Runde teurer?"
punkte: 25
frage: "Ein Agent hängt in einer Schleife. Warum kostet jede Runde mehr als die vorige?"
optionen:
  - "Weil der Anbieter bei vielen Aufrufen die Preise erhöht"
  - "Weil der ganze bisherige Verlauf jedes Mal wieder als Eingabe mitgeschickt wird"
  - "Weil das Modell mit der Zeit müde wird"
  - "Weil die Ausgabe immer länger wird"
loesung: "Weil der ganze bisherige Verlauf jedes Mal wieder als Eingabe mitgeschickt wird"
richtzeit_s: 60
erklaerung: |
  Ein Modell hat kein Gedächtnis zwischen zwei Aufrufen. Damit es weiß, was
  bisher geschah, wird der Verlauf jedes Mal mitgeschickt - und der wächst.
  Mehr dazu in Stufe 4, Lektion „Kontext und Zustand".
```

## Sparen, ohne schlechter zu werden

Die wirksamsten Hebel, in der Reihenfolge ihrer Wirkung:

| Hebel | Wirkung |
|---|---|
| **Regeln vorn** (Lektion 6) | Viele Aufrufe fallen ganz weg |
| **Kleineres Modell** für einfache Schritte | Oft ein Zehntel des Preises |
| **Kürzere Eingabe** — nur den nötigen Teil schicken | Weniger Eingabe-Tokens |
| **Kürzere Ausgabe** — Format festlegen (Stufe 2) | Weniger der teuren Ausgabe-Tokens |

```aufgabe
id: E3-22
typ: plugplay
titel: "Was spart wirklich?"
punkte: 25
frage: "Wähle die Maßnahmen, die die Kosten eines Ablaufs senken, ohne dass das Ergebnis schlechter werden muss."
bausteine:
  - "Newsletter per Regel aussortieren, bevor das Modell gefragt wird"
  - "Im Prompt „bitte fasse dich kurz und spare Tokens“ schreiben"
  - "Nur den Text der Mail schicken, nicht die angehängten Bilder"
  - "Für „Ist das Spam?“ ein kleineres Modell nehmen"
  - "Den Ablauf stündlich statt bei jeder Mail laufen lassen und alle Mails einzeln schicken"
loesung:
  - "Newsletter per Regel aussortieren, bevor das Modell gefragt wird"
  - "Nur den Text der Mail schicken, nicht die angehängten Bilder"
  - "Für „Ist das Spam?“ ein kleineres Modell nehmen"
richtzeit_s: 80
erklaerung: |
  Aussortieren, weniger schicken und das passende Modell wählen sparen
  messbar. „Fasse dich kurz" ist eine Bitte, kein Format - besser „höchstens
  drei Sätze". Und stündlich mit einzelnen Aufrufen ändert nichts an der
  Zahl der Aufrufe.
```
