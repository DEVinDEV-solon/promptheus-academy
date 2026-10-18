---
type: lesson
title: "Dein Systementwurf"
description: "Alles aus dieser Stufe an einem eigenen Entwurf: Teile, Pfeile, Zustand, Aufsicht und Ausfall — so aufgeschrieben, dass jemand anderes ihn bauen könnte."
tags:
  - lesson
  - stufe-4
  - projekt
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 4
dauer_min: 35
---

# Dein Systementwurf

## Vom Ablauf zum System

Am Ende von Stufe 3 stand ein Mini-Projekt: ein Ablauf, der allein läuft. Am
Ende dieser Stufe steht ein **Entwurf**: ein System aus mehreren Teilen, auf
Papier, begründet. Du musst es nicht bauen. Aber du sollst es so beschreiben,
dass jemand anderes es bauen könnte — und dass du jede Grenze verteidigen
kannst.

Nimm dafür gern dein Mini-Projekt aus Stufe 3 und frag: *Was müsste dazukommen,
damit es für ein ganzes Team arbeitet?* Dann wird aus einem Ablauf ein System,
und du siehst, wo die neuen Pfeile entstehen.

## Die Probe vor der Abgabe

Bevor du schreibst, geh deinen Entwurf mit den Prüfungen dieser Stufe durch:

| Prüfung | aus Lektion |
|---|---|
| Lässt sich jeder Teil in einem Satz beschreiben? | 8 |
| Hat jede Entscheidung genau einen Besitzer? | 1, 8 |
| Hat jeder Pfeil einen Vertrag mit Pflichtfeldern? | 4 |
| Weiß ich, wo der Zustand liegt und wer ihn ändert? | 5 |
| Sitzt die Aufsicht dort, wo es unumkehrbar wird? | 6 |
| Hat jeder Teil nur die Rechte, die er braucht? | 6 |
| Was passiert, wenn ein Teil nicht antwortet? | 7 |

```aufgabe
id: E4-23
typ: denkaufgabe
titel: "Welche Prüfung fällt durch?"
punkte: 25
frage: "In einem Entwurf dürfen der Verfasser und der Prüfer beide entscheiden, ob ein Text veröffentlicht wird. Welche Prüfung fällt damit durch?"
optionen:
  - "Jeder Teil lässt sich in einem Satz beschreiben."
  - "Jede Entscheidung hat genau einen Besitzer."
  - "Jeder Pfeil hat einen Vertrag."
  - "Jeder Teil hat nur die nötigen Rechte."
loesung: "Jede Entscheidung hat genau einen Besitzer."
richtzeit_s: 50
erklaerung: |
  „Veröffentlichen" hat zwei Besitzer - und damit irgendwann zwei
  verschiedene Antworten. Einer muss es sein, und im Prüfer-Muster ist es
  der Prüfer.
```

## Ein Beispiel in Kurzform

> **Aufgabe:** Ein Sportverein will Anmeldungen für Kurse automatisch
> bearbeiten.
>
> **Teile:** *Eingang* liest das Formular (Regel). *Prüfer* sieht nach, ob noch
> Plätze frei sind (Regel, liest die Kursliste). *Antwortschreiber* formuliert
> Zu- oder Absage (Modell). *Kassenwart* bestätigt Gebühren über 100 Euro
> (Mensch).
>
> **Zustand:** Die Kursliste mit belegten Plätzen. Nur der Prüfer schreibt
> hinein — sonst könnten zwei Anmeldungen denselben letzten Platz bekommen.
>
> **Ausfall:** Antwortet das Modell nicht, geht eine kurze Standardbestätigung
> raus, und die ausführliche folgt später.

Achte darauf, dass das Modell nur an **einer** Stelle sitzt: dort, wo
formuliert wird. Alles andere sind Regeln und ein Mensch. Das ist kein Zufall,
sondern die Lehre aus Stufe 3.

```aufgabe
id: E4-24
typ: uebereinstimmung
titel: "Warum so geschnitten?"
punkte: 30
frage: "Ordne jeder Entscheidung im Beispiel ihre Begründung zu."
links:
  - "Nur der Prüfer schreibt in die Kursliste"
  - "Das Modell formuliert nur die Antwort"
  - "Der Kassenwart bestätigt Gebühren über 100 Euro"
  - "Bei Modellausfall geht eine Standardbestätigung raus"
rechts:
  - "Eine Entscheidung, ein Besitzer: kein Platz wird doppelt vergeben"
  - "Ein Modell nur dort, wo eine Regel nicht reicht"
  - "Aufsicht dort, wo Geld fließt"
  - "Abgestufter Ausfall statt Schweigen"
loesung:
  "Nur der Prüfer schreibt in die Kursliste": "Eine Entscheidung, ein Besitzer: kein Platz wird doppelt vergeben"
  "Das Modell formuliert nur die Antwort": "Ein Modell nur dort, wo eine Regel nicht reicht"
  "Der Kassenwart bestätigt Gebühren über 100 Euro": "Aufsicht dort, wo Geld fließt"
  "Bei Modellausfall geht eine Standardbestätigung raus": "Abgestufter Ausfall statt Schweigen"
richtzeit_s: 90
erklaerung: |
  Jede Grenze im Entwurf hat einen Grund, den man in einem Satz sagen kann.
  Genau das heißt „begründen, warum es so geschnitten ist".
```

## Dein Entwurf

```aufgabe
id: E4-25
typ: planung
titel: "Dein Systementwurf"
punkte: 60
frage: "Entwirf ein System aus mindestens drei Teilen für eine Aufgabe aus deinem Umfeld. Beschreibe die Teile, wer welche Entscheidung trifft, wo der Zustand liegt, wo ein Mensch freigibt und was bei einem Ausfall passiert. Mindestens 120 Wörter."
pruefungen:
  - art: mindestens_woerter
    wert: 120
    punkte: 10
    begruendung: "Mindestens 120 Wörter."
  - art: enthaelt_eines
    werte: [entscheidet, besitzer, zuständig, darf entscheiden]
    punkte: 10
    begruendung: "Du sagst, wer welche Entscheidung trifft."
  - art: enthaelt_eines
    werte: [zustand, datenbank, tabelle, liste, akte, gespeichert]
    punkte: 10
    begruendung: "Du sagst, wo der Zustand liegt."
  - art: enthaelt_eines
    werte: [freigabe, freigeben, mensch, prüft vorher, bestätigt]
    punkte: 10
    begruendung: "Du legst fest, wo ein Mensch freigibt."
  - art: enthaelt_eines
    werte: [ausfall, fällt aus, antwortet nicht, zeitgrenze, nicht erreichbar]
    punkte: 10
    begruendung: "Du sagst, was bei einem Ausfall passiert."
  - art: enthaelt_eines
    werte: [vertrag, felder, pflichtfeld, json, format, übergibt]
    punkte: 10
    begruendung: "Du beschreibst, was zwischen den Teilen übergeben wird."
richtzeit_s: 1200
erklaerung: |
  Ein Entwurf, der diese sechs Punkte beantwortet, lässt sich bauen, prüfen
  und erklären. In Stufe 5 nimmst du ihn wieder in die Hand - dann mit der
  Frage, wo ein Angreifer ansetzen würde.
```
