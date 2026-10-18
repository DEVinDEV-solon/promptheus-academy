---
type: lesson
title: "Systemprompt und Frage: zwei Ebenen"
description: "Was immer gilt und was nur jetzt gilt: warum eine Anweisung im Systemprompt anders wirkt als dieselbe Anweisung in der Frage."
tags:
  - lesson
  - stufe-2
  - prompting
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 2
dauer_min: 14
---

# Systemprompt und Frage: zwei Ebenen

## Zwei Sorten Anweisungen

In Lektion 1 hast du einen Auftrag aus fünf Bausteinen gebaut. Manche davon
ändern sich mit jeder Frage — die **Aufgabe** zum Beispiel. Andere bleiben
immer gleich: Wer spricht (**Rolle**), für wen (**Kontext**), in welcher Form
(**Format**). Es wäre mühsam, sie jedes Mal neu zu tippen.

Deshalb haben die meisten Chat-Werkzeuge zwei Ebenen:

| Ebene | Was hinein gehört | Wie oft |
|---|---|---|
| **Systemprompt** (auch *Systemanweisung*) | Rolle, feste Regeln, Ton, Format, Grenzen | Einmal, gilt für das ganze Gespräch |
| **Frage** (Nutzernachricht) | Die konkrete Aufgabe | Jedes Mal neu |

Der Systemprompt steht **vor** dem ganzen Gespräch im Kontextfenster (Stufe 1,
Lektion 2) und wird bei jeder Antwort mitgeschickt. Das Modell liest ihn als
Rahmen, in dem alles Weitere stattfindet.

```aufgabe
id: E2-14
typ: uebereinstimmung
titel: "Wohin gehört das?"
punkte: 30
frage: "Ordne jede Anweisung der Ebene zu, auf die sie gehört."
links:
  - "Du bist Nachhilfelehrer für Mathematik in der 7. Klasse."
  - "Erkläre mir, wie man 3/4 und 2/3 addiert."
  - "Antworte immer in höchstens fünf Sätzen und ohne Fachwörter."
  - "Was ist der Unterschied zwischen Umfang und Fläche?"
rechts:
  - "Systemprompt: Rolle"
  - "Frage: konkrete Aufgabe"
  - "Systemprompt: Format und Regel"
  - "Frage: weitere Aufgabe"
loesung:
  "Du bist Nachhilfelehrer für Mathematik in der 7. Klasse.": "Systemprompt: Rolle"
  "Erkläre mir, wie man 3/4 und 2/3 addiert.": "Frage: konkrete Aufgabe"
  "Antworte immer in höchstens fünf Sätzen und ohne Fachwörter.": "Systemprompt: Format und Regel"
  "Was ist der Unterschied zwischen Umfang und Fläche?": "Frage: weitere Aufgabe"
richtzeit_s: 80
erklaerung: |
  Was für alle Fragen gilt, gehört in den Systemprompt. Was sich jedes Mal
  ändert, ist die Frage. Das Wort „immer" ist ein gutes Zeichen: Es gehört
  fast nie in eine einzelne Frage.
```

## Warum es anders wirkt

Man könnte denken: Text ist Text, egal wo er steht. Stimmt nicht ganz.
Modelle werden darauf trainiert, den Systemprompt als **übergeordnete
Anweisung** zu behandeln. Eine Regel dort wirkt deshalb stabiler als dieselbe
Regel mitten im Gespräch, und sie geht nicht verloren, wenn das Gespräch lang
wird — sie steht ja immer vorn.

Eine Regel, die du in der dritten Frage nebenbei erwähnst („übrigens: bitte
immer kurz"), wirkt dagegen nur eine Weile. Nach zwanzig Nachrichten ist sie
weit hinten im Verlauf, und das Modell folgt ihr immer seltener.

```aufgabe
id: E2-15
typ: denkaufgabe
titel: "Die vergessene Regel"
punkte: 25
frage: "Du hast in deiner zweiten Nachricht geschrieben: „Antworte bitte immer auf Englisch.“ Nach dreißig Nachrichten antwortet das Modell wieder auf Deutsch. Was hilft am zuverlässigsten?"
optionen:
  - "Die Regel in Großbuchstaben wiederholen"
  - "Die Regel in den Systemprompt schreiben, damit sie bei jeder Antwort vorn steht"
  - "Dem Modell drohen"
  - "Ein neues Modell nehmen"
loesung: "Die Regel in den Systemprompt schreiben, damit sie bei jeder Antwort vorn steht"
richtzeit_s: 50
erklaerung: |
  Eine Regel mitten im Verlauf rutscht mit jeder Nachricht weiter nach
  hinten. Im Systemprompt steht sie jedes Mal an derselben Stelle. Lautstärke
  und Drohungen legen nichts fest - das weißt du aus Lektion 1.
```

## Grenzen gehören nach oben

Ein Systemprompt ist auch der Ort für **Grenzen**: was das Modell nicht tun
soll. „Gib keine medizinischen Ratschläge, sondern verweise an eine Ärztin."
„Nenne nie Preise, die nicht in der Liste stehen."

Aber Vorsicht — und das ist eine Vorschau auf Stufe 5: **Ein Systemprompt ist
eine starke Bitte, keine Sperre.** Jemand, der es darauf anlegt, kann ein Modell
dazu bringen, ihn zu ignorieren. Für Dinge, die wirklich nie passieren dürfen,
braucht es mehr als einen Satz.

## Wo du das wiederfindest

Diese zwei Ebenen begleiten dich durch die ganze Academy. In Stufe 3 wird der
Systemprompt zur Anweisung eines Agenten. Im 7. Kurs schreibst du deine
Brand-Guideline — und aus ihr werden sechs Zeilen, die als Systemprompt vor
jeder Anfrage stehen. Wer weiß, warum ein Systemprompt anders wirkt als eine
Frage, schreibt dort ein Dokument, das etwas ändert.

```aufgabe
id: E2-16
typ: planung
titel: "Dein erster Systemprompt"
punkte: 40
frage: "Schreibe einen Systemprompt für einen Lernhelfer in einem Fach deiner Wahl. Er soll eine Rolle, eine Zielgruppe, eine Formatregel und eine Grenze enthalten. Mindestens 40 Wörter."
pruefungen:
  - art: mindestens_woerter
    wert: 40
    punkte: 10
    begruendung: "Mindestens 40 Wörter."
  - art: enthaelt_eines
    werte: [du bist, du agierst, in der rolle, rolle, antworte als]
    punkte: 10
    begruendung: "Du legst eine Rolle fest."
  - art: enthaelt_eines
    werte: [satz, sätze, stichpunkt, wörter, liste, absatz, kurz]
    punkte: 10
    begruendung: "Du legst ein Format fest."
  - art: enthaelt_eines
    werte: [nie, nicht, keine, kein, niemals, verweise]
    punkte: 10
    begruendung: "Du ziehst eine Grenze."
richtzeit_s: 420
erklaerung: |
  Rolle, Zielgruppe, Format und eine Grenze - das ist das Gerüst jedes
  Systemprompts. Probier ihn aus: Stell dem Lernhelfer drei verschiedene
  Fragen und prüf, ob er sich bei allen dreien an deine Regeln hält.
```
