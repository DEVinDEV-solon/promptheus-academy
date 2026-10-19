---
type: lesson
title: "Ein Wissensbot fürs Team"
description: "Urlaub, Reisekosten, Elternzeit: Ein Bot, der aus den geprüften Richtlinien der Firma antwortet, nimmt der Personalabteilung viele Routinefragen ab. Wenn er die richtigen Dokumente hat und weiß, wann er weiterleitet."
tags:
  - lesson
  - domaene
  - dom-pers
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 14
---

# Ein Wissensbot fürs Team

## Antworten aus den eigenen Richtlinien

Jede Personalabteilung kennt dieselben Fragen: Wie beantrage ich Urlaub? Was
zahlt die Firma für Dienstreisen? Wo finde ich das Formular für Elternzeit?
Ein **Wissensbot** kann sie beantworten, und zwar aus den eigenen
Richtlinien, nicht aus dem allgemeinen Wissen des Modells. Technisch heißt
das: Der Bot sucht die passende Stelle in den freigegebenen Dokumenten und
antwortet mit Quelle (Stufe 4: Kontext).

Persönliche Anliegen gehören nicht zum Bot (Lektion 6). Er leitet sie an
Menschen weiter.

```aufgabe
id: D9-15
typ: quizkarten
titel: "Bot oder Personalabteilung?"
punkte: 30
frage: "Beantwortet der Wissensbot die Frage selbst, oder leitet er sie an die Personalabteilung weiter?"
karten:
  - "Wie beantrage ich Urlaub?"
  - "Wie hoch ist die Kilometerpauschale laut unserer Reisekostenrichtlinie?"
  - "Ich möchte mich über meinen Vorgesetzten beschweren."
  - "Bekomme ich im nächsten Jahr eine Gehaltserhöhung?"
  - "Wo finde ich das Formular für Elternzeit?"
stapel: [Bot antwortet, an die Personalabteilung]
loesung:
  "Wie beantrage ich Urlaub?": Bot antwortet
  "Wie hoch ist die Kilometerpauschale laut unserer Reisekostenrichtlinie?": Bot antwortet
  "Ich möchte mich über meinen Vorgesetzten beschweren.": an die Personalabteilung
  "Bekomme ich im nächsten Jahr eine Gehaltserhöhung?": an die Personalabteilung
  "Wo finde ich das Formular für Elternzeit?": Bot antwortet
richtzeit_s: 75
erklaerung: |
  Was in einer Richtlinie steht, kann der Bot mit Quelle beantworten. Eine
  Beschwerde braucht Vertraulichkeit und einen Menschen, eine
  Gehaltsfrage ist eine Entscheidung - beides gehört nicht in einen Bot.
```

## Der Bot ist so aktuell wie seine Dokumente

```aufgabe
id: D9-16
typ: denkaufgabe
titel: "Die alte Urlaubsregel"
punkte: 25
frage: "Der Bot nennt eine Urlaubsregel, die seit Januar nicht mehr gilt. Was ist die wahrscheinlichste Ursache?"
optionen:
  - "In seiner Wissensbasis liegt noch die alte Fassung der Richtlinie, vielleicht neben der neuen."
  - "Das Modell hat sich die Regel ausgedacht, um zu gefallen."
  - "Der Bot ist zu langsam für neue Regeln."
  - "Die Mitarbeitenden haben falsch gefragt."
loesung: "In seiner Wissensbasis liegt noch die alte Fassung der Richtlinie, vielleicht neben der neuen."
richtzeit_s: 60
erklaerung: |
  Ein Bot, der aus Dokumenten antwortet, gibt wieder, was dort liegt. Liegen
  alte und neue Fassung nebeneinander, erwischt er manchmal die falsche.
  Deshalb gehört zu jeder Richtlinienänderung ein fester Pflegeschritt.
```

```aufgabe
id: D9-17
typ: schiebe
titel: "Eine Richtlinie ändert sich"
punkte: 25
frage: "Die Reisekostenrichtlinie wird geändert. Bring die Pflegeschritte für den Bot in die richtige Reihenfolge."
bausteine:
  - "Den Bot mit typischen Testfragen prüfen"
  - "Das alte Dokument aus der Wissensbasis entfernen"
  - "Die geänderte Fassung freigeben und mit Datum versehen"
  - "Prüfen, ob die Antworten die neue Fassung als Quelle nennen"
  - "Die neue Fassung in die Wissensbasis legen"
loesung:
  - "Die geänderte Fassung freigeben und mit Datum versehen"
  - "Das alte Dokument aus der Wissensbasis entfernen"
  - "Die neue Fassung in die Wissensbasis legen"
  - "Den Bot mit typischen Testfragen prüfen"
  - "Prüfen, ob die Antworten die neue Fassung als Quelle nennen"
richtzeit_s: 70
erklaerung: |
  Erst freigeben, dann das Alte entfernen, dann das Neue einspielen und
  testen. Die Quelle in der Antwort zeigt sofort, ob der Bot wirklich die
  neue Fassung benutzt.
```
