---
type: lesson
title: "Lohnt es sich?"
description: "Was eine Lösung im Betrieb kostet, was sie spart, und warum die ehrliche Rechnung auch die Zeit für Pflege und Fehler enthält."
tags:
  - lesson
  - stufe-6
  - kosten
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 6
dauer_min: 15
---

# Lohnt es sich?

## Die Frage, die ein Auftraggeber stellt

In Lektion 1 stand, die drei Planungsfragen seien die, die ein Auftraggeber
stellen würde, **bevor er Geld gibt**. Die vierte Frage stellt er, nachdem die
Lösung eine Weile läuft: *Hat es sich gelohnt?*

In Stufe 3, Lektion 8 hast du die Kosten eines Ablaufs ausgerechnet: Tokens mal
Preis mal Aufrufe. Das war die halbe Rechnung. Die ganze hat zwei Seiten.

## Die zwei Seiten

| Kosten | Nutzen |
|---|---|
| Bauzeit (einmalig) | Eingesparte Arbeitszeit (laufend) |
| Modell- und Dienstkosten (laufend) | Weniger Fehler, die Nacharbeit kosten |
| Wartung (laufend, Lektion 5) | Schnellere Antworten für Kunden oder Kollegen |
| Fehlerbehebung, wenn etwas schiefgeht | Arbeit, die ohne die Lösung gar nicht gemacht würde |

Die laufenden Kosten, die am häufigsten vergessen werden, sind **Wartung und
Fehlerbehebung** — also deine eigene Zeit. Eine Lösung, die zwei Stunden im
Monat spart und drei Stunden im Monat Pflege braucht, lohnt sich nicht, auch
wenn sie technisch glänzt.

```aufgabe
id: E6-17
typ: mathe
titel: "Die Monatsrechnung"
punkte: 30
frage: "Eine Lösung spart einer Mitarbeiterin jeden Arbeitstag 15 Minuten, an 20 Arbeitstagen im Monat. Die Wartung kostet 1 Stunde im Monat. Wie viele Stunden spart die Lösung unterm Strich im Monat?"
loesung: 4
toleranz: 0
richtzeit_s: 90
hinweise:
  - text: "15 Minuten mal 20 Tage — wie viele Stunden sind das? Dann die Wartung abziehen."
    kostet: 5
erklaerung: |
  15 × 20 = 300 Minuten = 5 Stunden. Minus 1 Stunde Wartung bleiben 4 Stunden
  im Monat. Dazu kämen noch die Modellkosten - und die einmalige Bauzeit,
  die sich über die Monate verteilt.
```

## Wann sich die Bauzeit zurückzahlt

Die Bauzeit ist eine Investition. Sie zahlt sich zurück, wenn die monatliche
Ersparnis sie aufgewogen hat. Die Rechnung heißt **Amortisation** und ist
einfach: Bauzeit geteilt durch monatliche Ersparnis ergibt die Zahl der Monate,
nach denen sich die Lösung gelohnt hat.

```aufgabe
id: E6-18
typ: mathe
titel: "Nach wie vielen Monaten?"
punkte: 25
frage: "Der Bau einer Lösung hat 24 Stunden gedauert. Sie spart unterm Strich 4 Stunden im Monat. Nach wie vielen Monaten hat sich die Bauzeit zurückgezahlt?"
loesung: 6
toleranz: 0
richtzeit_s: 60
erklaerung: |
  24 ÷ 4 = 6 Monate. Läuft die Lösung danach noch zwei Jahre, hat sie ein
  Vielfaches ihrer Bauzeit eingespart. Läuft sie nur drei Monate, hat sie
  sich nie gelohnt.
```

## Was sich nicht in Stunden rechnen lässt

Nicht jeder Nutzen ist Zeit. Manche Lösungen lohnen sich, weil sie etwas
**möglich** machen, das vorher nicht ging — eine Übersicht, die nie jemand
erstellt hätte, eine Antwort am Wochenende. Andere lohnen sich nicht, obwohl
sie Zeit sparen, weil sie ein **Risiko** einführen (Stufe 5), das die Ersparnis
übersteigt.

Eine ehrliche Bewertung nennt deshalb beides: die Zahl und das, was die Zahl
nicht zeigt.

```aufgabe
id: E6-19
typ: denkaufgabe
titel: "Lohnt sich das?"
punkte: 25
frage: "Ein Agent spart dem Team 10 Stunden im Monat, indem er Kundenanfragen automatisch und ohne Prüfung beantwortet. Zweimal im Monat verspricht er dabei Leistungen, die es nicht gibt. Wie bewertest du das?"
optionen:
  - "Lohnt sich klar: 10 Stunden Ersparnis."
  - "Die Ersparnis ist echt, aber das Risiko falscher Zusagen muss mitgerechnet werden — mit einer Freigabe für Zusagen lohnt es sich vielleicht."
  - "Lohnt sich nie, weil Modelle Fehler machen."
  - "Lässt sich nicht bewerten."
loesung: "Die Ersparnis ist echt, aber das Risiko falscher Zusagen muss mitgerechnet werden — mit einer Freigabe für Zusagen lohnt es sich vielleicht."
richtzeit_s: 60
erklaerung: |
  Falsche Zusagen können mehr kosten als 10 Stunden - Ärger, Kulanz, Ruf.
  Die Lösung ist selten „ganz oder gar nicht", sondern eine Freigabe an der
  richtigen Stelle (Stufe 4), die einen Teil der Ersparnis kostet und das
  Risiko beseitigt.
```
