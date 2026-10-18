---
type: lesson
title: "Mehr als Text: Bilder, Stimmen, Videos"
description: "Dieselbe Idee wie beim Text, nur mit anderen Stücken: wie Modelle Bilder, Stimmen und Videos erzeugen — und warum man einem Bild heute nicht mehr ansieht, ob es echt ist."
tags:
  - lesson
  - stufe-1
  - medien
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 1
dauer_min: 13
---

# Mehr als Text: Bilder, Stimmen, Videos

## Dieselbe Idee, andere Stücke

Bisher ging es um Text: Er wird in Tokens zerlegt (Lektion 2), und das Modell
wählt das nächste Stück (Lektion 4). Modelle für Bilder, Stimmen und Videos
arbeiten nach einer verwandten Idee — sie haben aus riesigen Mengen Beispielen
gelernt, **wie solche Dinge typischerweise aussehen oder klingen**, und
erzeugen etwas Neues, das dazu passt.

Viele Bildmodelle gehen dabei einen überraschenden Weg: Sie beginnen mit einem
Bild aus reinem **Rauschen** — zufälligen Punkten, wie ein altes Fernsehbild
ohne Sender — und entfernen dieses Rauschen in vielen kleinen Schritten, bis ein
Bild entsteht, das zu deiner Beschreibung passt. Man nennt sie
*Diffusionsmodelle*.

| Art | Was das Modell gelernt hat | Was es erzeugt |
|---|---|---|
| **Text** | Wie Text weitergeht | Das nächste Token |
| **Bild** | Wie Bilder zu Beschreibungen aussehen | Ein Bild aus Rauschen |
| **Stimme** | Wie Sprache klingt | Gesprochenen Text in einer Stimme |
| **Video** | Wie Bilder sich über die Zeit bewegen | Eine Folge passender Bilder |

## Die gleichen Schwächen

Weil es dieselbe Idee ist, haben diese Modelle auch dieselben Schwächen. Ein
Bildmodell erzeugt, **was typisch aussieht**, nicht, was stimmt. Deshalb
stimmen auf erzeugten Bildern oft Dinge nicht, die man erst beim zweiten
Hinsehen bemerkt: Schrift, die keine echten Wörter ergibt, Hände mit falscher
Fingerzahl, Uhren mit unmöglichen Zeigern. Neuere Modelle machen das seltener —
aber der Grund bleibt: Auch hier gibt es keinen Unterschied zwischen „wahr"
und „sieht richtig aus".

```aufgabe
id: E1-21
typ: denkaufgabe
titel: "Warum ist die Schrift falsch?"
punkte: 25
frage: "Ein erzeugtes Bild zeigt ein Café. Auf dem Schild steht ein Wort, das es nicht gibt. Warum passiert so etwas?"
optionen:
  - "Das Modell hat absichtlich einen Fehler eingebaut."
  - "Das Modell erzeugt, was wie Schrift auf einem Schild aussieht — nicht, was richtig geschrieben ist."
  - "Das Modell kann keine Cafés darstellen."
  - "Das Bild wurde beim Herunterladen beschädigt."
loesung: "Das Modell erzeugt, was wie Schrift auf einem Schild aussieht — nicht, was richtig geschrieben ist."
richtzeit_s: 50
erklaerung: |
  Dasselbe Prinzip wie beim Text: Es wird erzeugt, was typisch aussieht. Für
  ein Bildmodell sind Buchstaben Formen - und Formen, die wie Schrift
  aussehen, ergeben nicht automatisch echte Wörter.
```

## Was du einem Bild nicht mehr ansiehst

Lektion 6 hat für Text gezeigt: Detektoren taugen nicht, und Merkmale trügen.
Für Bilder, Stimmen und Videos gilt das inzwischen genauso. Eine Stimme lässt
sich aus wenigen Sekunden Aufnahme nachbilden, ein Gesicht in ein Video setzen.
Solche Fälschungen heißen **Deepfakes**.

Die Lehre ist dieselbe wie bei Text: **Herkunft statt Erkennung.** Statt zu
raten, ob ein Bild echt aussieht, fragst du: Woher kommt es? Wer hat es zuerst
veröffentlicht? Gibt es eine zweite, unabhängige Quelle? Manche Bilder tragen
inzwischen auch einen digitalen Herkunftsnachweis, der zeigt, mit welchem
Werkzeug sie entstanden sind — fehlt er, beweist das allerdings nichts.

```aufgabe
id: E1-22
typ: schiebe
titel: "Ein verdächtiges Video"
punkte: 30
frage: "Ein Video zeigt angeblich eine bekannte Politikerin bei einer schockierenden Aussage. Bring die Prüfschritte in eine sinnvolle Reihenfolge."
bausteine:
  - "Prüfen, ob seriöse Medien oder die Person selbst darüber berichten"
  - "Nicht sofort weiterleiten"
  - "Suchen, wo das Video zuerst aufgetaucht ist"
  - "Erst danach entscheiden, ob man es teilt"
loesung:
  - "Nicht sofort weiterleiten"
  - "Suchen, wo das Video zuerst aufgetaucht ist"
  - "Prüfen, ob seriöse Medien oder die Person selbst darüber berichten"
  - "Erst danach entscheiden, ob man es teilt"
richtzeit_s: 75
erklaerung: |
  Zuerst innehalten - Fälschungen leben davon, dass sie schnell geteilt
  werden. Dann die Herkunft suchen und eine unabhängige Bestätigung. Ob das
  Video „echt aussieht", steht bewusst nicht auf der Liste.
```

## Die gute Seite

Das alles heißt nicht, dass diese Werkzeuge schlecht sind. In dieser Academy
gibt es ein ganzes Studio dafür, das Cinema Studio in der Werkstatt. Wer weiß,
wie sie funktionieren, nutzt sie besser: Er beschreibt genauer, was er will, er
prüft das Ergebnis auf die typischen Fehler, und er kennzeichnet ehrlich, was
erzeugt ist.

```aufgabe
id: E1-23
typ: plugplay
titel: "Ehrlicher Umgang"
punkte: 25
frage: "Du hast mit einem Bildmodell ein Plakat für ein Schulfest gestaltet. Was gehört zu einem ehrlichen Umgang damit?"
bausteine:
  - "Die Schrift auf dem Bild Buchstabe für Buchstabe prüfen"
  - "Behaupten, es sei ein Foto vom letzten Fest"
  - "Kennzeichnen, dass das Bild mit KI erzeugt wurde, wo es eine Rolle spielt"
  - "Keine echten Personen ohne deren Zustimmung abbilden lassen"
loesung:
  - "Die Schrift auf dem Bild Buchstabe für Buchstabe prüfen"
  - "Kennzeichnen, dass das Bild mit KI erzeugt wurde, wo es eine Rolle spielt"
  - "Keine echten Personen ohne deren Zustimmung abbilden lassen"
richtzeit_s: 60
erklaerung: |
  Prüfen, kennzeichnen, niemanden ungefragt abbilden. Ein erzeugtes Bild als
  echtes Foto auszugeben, ist genau die Täuschung, vor der diese Lektion
  warnt.
```
