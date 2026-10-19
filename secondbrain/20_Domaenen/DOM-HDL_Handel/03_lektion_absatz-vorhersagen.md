---
type: lesson
title: "Absatz vorhersagen"
description: "Eine Prognose ist Vergangenheit plus das, was man über die Zukunft schon weiß. Die Tabelle rechnet, das Modell sammelt Gründe, und Ausreißer bekommen eine Markierung."
tags:
  - lesson
  - domaene
  - dom-hdl
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 16
---

# Absatz vorhersagen

## Der einfachste ehrliche Anfang

Die Daten aus Lektion 2 sind sauber, die Fehlbestände markiert. Jetzt die
Frage: Wie viel wird nächste Woche verkauft?

Der einfachste ehrliche Anfang ist der **gleitende Durchschnitt**: der
Durchschnitt der letzten paar Wochen, jede Woche neu berechnet. Er ist nicht
klug, aber er ist nachvollziehbar, und jede Prognose, die mehr verspricht,
muss sich mit ihm messen.

```aufgabe
id: D1-06
typ: mathe
titel: "Vier Wochen im Schnitt"
punkte: 25
frage: "Ein Artikel hat in den letzten vier Wochen 120, 135, 110 und 135 Stück verkauft. Wie hoch ist der gleitende Durchschnitt über diese vier Wochen?"
loesung: 125
toleranz: 0
einheit: "Stück"
richtzeit_s: 70
hinweise:
  - text: "Summe der vier Wochen, geteilt durch vier."
    kostet: 5
erklaerung: |
  120 + 135 + 110 + 135 = 500, geteilt durch 4 ergibt 125 Stück. Nächste
  Woche kommt die neue Woche dazu und die älteste fällt heraus - daher
  „gleitend“.
```

## Wochen, die nicht mitzählen dürfen

Manche Wochen erzählen nichts über die normale Nachfrage. Ein Räumungsverkauf
mit halbem Preis, ein Lieferausfall, ein einmaliger Großauftrag vom
Sportverein. Gehen sie unbesehen in den Durchschnitt ein, verzerren sie ihn
für Wochen.

Ein Wetterumschwung oder die Ferienzeit dagegen kommen wieder. Sie gehören in
die Prognose, als bekanntes Ereignis, nicht als Störung.

```aufgabe
id: D1-07
typ: denkaufgabe
mehrfach: true
titel: "Ausreißer markieren"
punkte: 30
frage: "Welche Wochen sollten markiert werden, damit sie nicht unbesehen in den Durchschnitt eingehen? Mehrere Antworten sind richtig."
optionen:
  - "Eine Woche mit Räumungsverkauf zum halben Preis"
  - "Eine Woche, in der der Artikel drei Tage nicht lieferbar war"
  - "Eine Woche mit einem einmaligen Großauftrag eines Vereins"
  - "Eine ganz gewöhnliche Woche im März"
  - "Eine Woche, in der es viel geregnet hat"
loesung:
  - "Eine Woche mit Räumungsverkauf zum halben Preis"
  - "Eine Woche, in der der Artikel drei Tage nicht lieferbar war"
  - "Eine Woche mit einem einmaligen Großauftrag eines Vereins"
richtzeit_s: 80
erklaerung: |
  Räumungsverkauf, Lieferlücke und Großauftrag sind Einmalereignisse. Regen
  und ein gewöhnlicher März sind Teil der normalen Nachfrage. Markieren heißt
  nicht löschen: Die Woche bleibt sichtbar, zählt aber nicht als Normalfall.
```

## Wo das Modell hilft

Ein Sprachmodell rechnet keine Prognose (Stufe 3: das Modell schätzt
Tokens, die Tabelle rechnet Zahlen). Aber es ist gut darin, **Gründe zu
sammeln**: Warum ist der Absatz von Sonnencreme im Mai eingebrochen? Es nennt
dir zwanzig mögliche Ursachen in Sekunden. Welche davon stimmt, prüfst du in
den Daten.

```aufgabe
id: D1-08
typ: quizkarten
titel: "Regel oder Modell?"
punkte: 25
frage: "Wer erledigt diesen Schritt am besten: eine feste Regel (Tabelle, Code) oder ein Sprachmodell?"
karten:
  - "Gleitenden Durchschnitt der letzten vier Wochen berechnen"
  - "Mögliche Gründe für einen Absatzeinbruch sammeln"
  - "Feiertage der nächsten acht Wochen markieren"
  - "Kundenkommentare zu einem neuen Produkt zusammenfassen"
  - "Prognose mit der Vorjahreswoche vergleichen"
stapel: [Regel, Modell]
loesung:
  "Gleitenden Durchschnitt der letzten vier Wochen berechnen": Regel
  "Mögliche Gründe für einen Absatzeinbruch sammeln": Modell
  "Feiertage der nächsten acht Wochen markieren": Regel
  "Kundenkommentare zu einem neuen Produkt zusammenfassen": Modell
  "Prognose mit der Vorjahreswoche vergleichen": Regel
richtzeit_s: 75
erklaerung: |
  Rechnen, Vergleichen und Nachschlagen im Kalender sind feste Schritte -
  jedes Mal gleich, nachprüfbar. Gründe sammeln und freien Text
  zusammenfassen sind Sprachaufgaben. Dort ist das Modell stark, und dort
  prüfst du sein Ergebnis.
```
