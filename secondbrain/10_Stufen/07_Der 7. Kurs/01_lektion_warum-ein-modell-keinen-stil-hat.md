---
type: lesson
title: "Warum ein Modell keinen Stil hat"
description: "Dreimal dieselbe Frage, dreimal ein anderer Text. Woher das kommt und was wirklich dagegen hilft."
tags:
  - lesson
  - kurs-7
  - marke
timestamp: 2026-08-23T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 0
dauer_min: 18
---

# Warum ein Modell keinen Stil hat

## Der Durchschnitt von allem

Ein Sprachmodell sagt für jedes nächste Token voraus, wie wahrscheinlich es
ist — gelernt aus sehr vielen Texten von sehr vielen Menschen. Das hast du in
Stufe 1 gesehen.

Daraus folgt etwas, das man selten ausspricht: **Der Normalzustand eines
Modells ist der Mittelwert.** Nicht ein schlechter Stil, sondern gar keiner.
Was du bekommst, wenn du nichts vorgibst, ist die Mitte aller Möglichkeiten.

Diese Mitte hat erkennbare Vorlieben, weil das Internet sie hat:

- Aufzählungen statt Absätze
- „Es ist wichtig zu beachten, dass …"
- drei Beispiele, wo eines genügt
- ein zusammenfassender Schlusssatz, der nichts hinzufügt
- Ausrufezeichen bei jedem Lob

Nichts davon ist falsch. Aber es ist auch nicht **deins**.

## Der Beweis in drei Minuten

Nimm irgendeinen Bot und stelle dreimal hintereinander dieselbe Aufgabe, jedes
Mal in einem neuen Gespräch:

```
Schreib eine kurze Absage an jemanden, der einen Termin verschieben will.
```

Vergleiche die drei Antworten nach drei Merkmalen: **Länge**, **Anrede**,
**Aufbau**. In aller Regel unterscheiden sich alle drei — und keine ist
schlecht.

Genau das ist das Problem. Drei brauchbare Texte, die nicht zusammengehören.

## Warum „Schreib in meinem Stil" nicht reicht

Der naheliegende Versuch ist, den Stil in die Anfrage zu schreiben. Das
funktioniert für **diese eine** Antwort. Danach fängt es von vorn an.

Drei Gründe, warum es auf Dauer scheitert:

1. **Du schreibst nie zweimal dasselbe.** Beim ersten Mal „freundlich, aber
   sachlich", beim zweiten „nüchtern, kein Marketing". Das sind zwei
   Vorgaben, und du bekommst zwei Stile.
2. **Es ist unsichtbar.** Nach vier Wochen weißt du nicht mehr, welche
   Formulierung die gute Antwort erzeugt hat.
3. **Es lässt sich nicht weitergeben.** Ein zweiter Mensch, ein zweiter Agent,
   ein zweites Werkzeug — jedes fängt bei null an.

> **Der Satz, um den sich dieser Kurs dreht:**
> Beschreibe deinen Stil **einmal**, an einer Stelle, in einer Form, die man
> weitergeben kann. Danach musst du ihn nie wieder eintippen.

## Was ein Systemprompt anders macht

In Stufe 2 hast du gesehen, dass ein Systemprompt **über** dem Gespräch steht
und für jede Antwort gilt. Das ist der Hebel.

| | Stilvorgabe in der Frage | Stilvorgabe im Systemprompt |
|---|---|---|
| Gilt für | diese eine Antwort | jede Antwort |
| Wird getippt | jedes Mal | einmal |
| Bleibt gleich | nein | ja |
| Weitergabe | Abschreiben | Datei kopieren |

Eine Brand-Guideline ist genau das: der Inhalt, den dieser Systemprompt
braucht — aufgeschrieben so, dass auch ein Mensch ihn lesen kann.

```aufgabe
id: K7-01
typ: denkaufgabe
titel: "Woran erkennt man die Mitte?"
punkte: 20
frage: "Welche dieser Eigenschaften sind typisch für eine Modellantwort ohne jede Stilvorgabe? Mehrfachauswahl."
optionen:
  - "Aufzählungen, wo Absätze gemeint waren"
  - "Ein Schlusssatz, der nur wiederholt, was oben steht"
  - "Eine Anrede, die von Antwort zu Antwort wechselt"
  - "Genau die Fachbegriffe, die dein Betrieb benutzt"
mehrfach: true
loesung:
  - "Aufzählungen, wo Absätze gemeint waren"
  - "Ein Schlusssatz, der nur wiederholt, was oben steht"
  - "Eine Anrede, die von Antwort zu Antwort wechselt"
richtzeit_s: 90
hinweise:
  - text: "Drei Dinge kommen aus dem Mittelwert. Eines kann nur von dir kommen."
    kostet: 5
erklaerung: |
  Die ersten drei sind Merkmale des Durchschnitts: Sie entstehen, weil sehr
  viele Texte im Netz so aussehen. Deine eigenen Fachbegriffe kann ein Modell
  nicht raten — sie stehen in keinem Mittelwert, sondern nur in deinem Kopf
  oder in deinem Dokument.
```

```aufgabe
id: K7-02
typ: mathe
titel: "Was das Tippen kostet"
punkte: 20
frage: "Du schreibst deine Stilvorgabe in jede Anfrage. Sie ist 60 Wörter lang, und du stellst 40 Anfragen in der Woche. Wie viele Wörter tippst du in einem Jahr nur für die Stilvorgabe? Rechne mit 50 Wochen."
loesung: 120000
toleranz: 0
einheit: "Wörter"
richtzeit_s: 75
hinweise:
  - text: "60 Wörter mal 40 Anfragen ergibt eine Woche. Danach mal 50."
    kostet: 5
erklaerung: |
  60 x 40 x 50 = 120 000 Wörter — etwa 480 Normseiten, für einen Text, der
  einmal 60 Wörter lang ist. Die Zahl ist nicht die Pointe; die Pointe ist,
  dass jede dieser 2000 Wiederholungen ein wenig anders ausfällt.
```
