---
type: lesson
title: "Wer spricht mit wem: drei Muster"
description: "Kette, Dirigent, Prüfer — die drei Grundformen, nach denen sich mehrere Agenten organisieren, und wofür jede taugt."
tags:
  - lesson
  - stufe-4
  - multiagenten
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 4
dauer_min: 15
---

# Wer spricht mit wem: drei Muster

## Warum überhaupt mehrere?

In Stufe 3 hast du einen Agenten gebaut: eine Schleife, ein Modell an der
Entscheidungsstelle, ein paar Werkzeuge. Warum sollte man daraus mehrere
machen? Aus demselben Grund, aus dem ein Betrieb nicht aus einer Person
besteht: **Eine Aufgabe, die zu groß für einen Durchgang ist, wird zerlegt** —
das kennst du aus Stufe 2, Lektion 2. Hier wird jedes Teilstück einem eigenen
Agenten gegeben, mit eigenem Auftrag und eigenen Werkzeugen.

Der Preis: Jetzt gibt es Pfeile. Und wie die vorige Lektion gesagt hat —
**Pfeile sind die Stellen, an denen etwas schiefgeht.** Deshalb lohnt es sich,
die wenigen Grundmuster zu kennen, statt jedes Mal neu zu erfinden.

## Die drei Muster

**1. Die Kette.** Jeder Agent gibt sein Ergebnis an den nächsten weiter.

```
[Rechercheur] --> [Verfasser] --> [Lektor] --> fertig
```

Einfach, gut nachvollziehbar, aber starr: Ein Fehler am Anfang wandert bis ans
Ende, und niemand fragt zurück.

**2. Der Dirigent.** Ein Agent verteilt Teilaufgaben an Spezialisten und setzt
die Ergebnisse zusammen. (Englisch: *Orchestrator*.)

```
              +--> [Spezialist Recht]
[Dirigent] ---+--> [Spezialist Zahlen]  --> zurück an den Dirigenten
              +--> [Spezialist Text]
```

Flexibel, aber der Dirigent ist ein einzelner Punkt, an dem alles hängt.

**3. Der Prüfer.** Ein Agent erzeugt, ein zweiter prüft und schickt bei Bedarf
zurück — das Modell gegen sich selbst aus Stufe 2, als feste Einrichtung.

```
[Verfasser] <--> [Prüfer] --> fertig, wenn der Prüfer zustimmt
```

Gut für Qualität, aber ohne Rundengrenze eine Schleife, die nie endet — du
kennst das Problem aus Stufe 3, Lektion 8.

```aufgabe
id: E4-02
typ: uebereinstimmung
titel: "Welches Muster passt?"
punkte: 30
frage: "Ordne jeder Aufgabe das Muster zu, das am besten passt."
links:
  - "Ein Text wird übersetzt, dann gekürzt, dann formatiert"
  - "Eine Kundenanfrage betrifft Vertrag, Rechnung und Technik zugleich"
  - "Ein Angebot darf erst raus, wenn die Zahlen nachgerechnet sind"
rechts:
  - "Die Kette"
  - "Der Dirigent"
  - "Der Prüfer"
loesung:
  "Ein Text wird übersetzt, dann gekürzt, dann formatiert": "Die Kette"
  "Eine Kundenanfrage betrifft Vertrag, Rechnung und Technik zugleich": "Der Dirigent"
  "Ein Angebot darf erst raus, wenn die Zahlen nachgerechnet sind": "Der Prüfer"
richtzeit_s: 75
erklaerung: |
  Feste Reihenfolge ist eine Kette. Mehrere Fachgebiete gleichzeitig
  brauchen jemanden, der verteilt und zusammensetzt. Und „erst raus, wenn
  geprüft" ist der Prüfer - mit einer Grenze für die Zahl der Runden.
```

## Die Frage nach der Entscheidung

Bei jedem Muster gilt die Frage aus Lektion 1: **Wer entscheidet was?** Im
Dirigenten-Muster entscheidet der Dirigent, welcher Spezialist gefragt wird —
nicht der Spezialist selbst. Im Prüfer-Muster entscheidet der Prüfer, ob etwas
fertig ist — nicht der Verfasser.

Verwischt man das, entsteht der typische Fehler: Zwei Agenten halten sich beide
für zuständig, und das Ergebnis hängt davon ab, wer zuerst antwortet.

```aufgabe
id: E4-03
typ: denkaufgabe
titel: "Wer hat das letzte Wort?"
punkte: 25
frage: "In einem Prüfer-Muster schreibt der Verfasser einen Text und erklärt ihn selbst für fertig. Der Prüfer hat ihn noch nicht gesehen. Was ist falsch gebaut?"
optionen:
  - "Nichts, der Verfasser kennt seinen Text am besten."
  - "Die Entscheidung „fertig“ liegt beim Falschen — sie gehört dem Prüfer."
  - "Es fehlt ein dritter Agent, der beide überwacht."
  - "Der Prüfer hätte den Text schreiben sollen."
loesung: "Die Entscheidung „fertig“ liegt beim Falschen — sie gehört dem Prüfer."
richtzeit_s: 60
erklaerung: |
  Wer erzeugt, darf nicht selbst freigeben - sonst ist der Prüfer
  Dekoration. Das ist dasselbe Prinzip wie das Vier-Augen-Prinzip in einem
  Betrieb, und es gilt für Agenten genauso.
```

## Weniger ist meistens mehr

Ein letzter Rat, bevor du Systeme zeichnest: **Jeder zusätzliche Agent kostet
Geld, Zeit und eine Schnittstelle, die brechen kann.** Ein System aus zwei
Agenten, das zuverlässig läuft, ist besser als eines aus sieben, das elegant
aussieht. Fang mit dem kleinsten Muster an, das die Aufgabe löst.

```aufgabe
id: E4-04
typ: raeumlich
titel: "Wo hängt alles?"
punkte: 25
frage: "Fällt in diesem System ein einziger Agent aus, steht alles still. Welcher ist es?"
diagramm: |
                +--> [Recht]  ---+
  Anfrage --> [Dirigent]         +--> [Dirigent] --> Antwort
                +--> [Zahlen] ---+
optionen: ["Recht", "Zahlen", "Dirigent", "Anfrage"]
loesung: "Dirigent"
richtzeit_s: 50
erklaerung: |
  Der Dirigent verteilt und sammelt ein. Fällt er aus, kommt keine Anfrage
  bei den Spezialisten an und keine Antwort zurück. Fällt ein Spezialist aus,
  fehlt nur ein Teil - das System kann es melden statt zu schweigen.
```
