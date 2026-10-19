---
type: lesson
title: "Zahlen analysieren"
description: "Rechnen lässt man rechnen. Das Modell schreibt die Formel, die Tabelle rechnet, und du prüfst, ob es die richtige Rechnung ist."
tags:
  - lesson
  - domaene
  - dom-ber
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 16
---

# Zahlen analysieren

## Das Modell rechnet nicht, es schätzt

Ein Sprachmodell kann eine Rechnung *aufschreiben*. Ob das Ergebnis stimmt,
ist Glückssache — es sagt das wahrscheinlichste nächste Token vorher, nicht
die richtige Zahl. Bei 2 + 2 geht das gut. Bei der Summe einer Tabelle mit
3.000 Zeilen nicht.

Die Arbeitsteilung aus Stufe 3, Lektion 3 gilt hier wörtlich:

| Das Modell | Die Tabelle oder der Code |
|---|---|
| schlägt die Kennzahl vor | rechnet sie aus |
| schreibt die Formel oder das Skript | führt es aus, jedes Mal gleich |
| deutet das Ergebnis in Worten | — |

Und du? Du prüfst, ob die Formel die **richtige** ist. Eine richtig
ausgeführte falsche Rechnung ist der häufigste Analysefehler überhaupt.

## Drei Kennzahlen, die immer wieder vorkommen

**Veränderung in Prozent:** (neu − alt) ÷ alt × 100.

```aufgabe
id: D5-12
typ: mathe
titel: "Wachstum in Prozent"
punkte: 25
frage: "Ein Kunde hatte 2024 einen Umsatz von 1,20 Mio. Euro, 2025 von 1,38 Mio. Euro. Um wie viel Prozent ist der Umsatz gewachsen?"
loesung: 15
toleranz: 0.1
einheit: "Prozent"
richtzeit_s: 90
hinweise:
  - text: "Erst die Differenz, dann durch den alten Wert teilen."
    kostet: 5
erklaerung: |
  (1,38 - 1,20) / 1,20 = 0,15, also 15 Prozent. Der häufigste Fehler ist,
  durch den neuen Wert zu teilen - dann kommen 13 Prozent heraus, und der
  Bericht ist um zwei Punkte falsch.
```

**Durchschnitt oder Median?** Der Durchschnitt reagiert stark auf
Ausreißer, der Median nicht. Hat ein Kunde zehn Aufträge zu 2.000 Euro und
einen zu 200.000 Euro, sagt der Durchschnitt fast nichts über den
typischen Auftrag.

```aufgabe
id: D5-13
typ: mathe
titel: "Der typische Auftrag"
punkte: 25
frage: "Die Auftragswerte eines Monats in Euro: 800, 1.200, 1.500, 1.900, 95.000. Wie hoch ist der Median?"
loesung: 1500
toleranz: 0
einheit: "Euro"
richtzeit_s: 70
hinweise:
  - text: "Ordne die Werte und nimm den mittleren."
    kostet: 5
erklaerung: |
  Geordnet steht 1.500 in der Mitte. Der Durchschnitt läge bei 20.080 Euro
  - eine Zahl, die keinen einzigen echten Auftrag beschreibt. Wer sie in
  den Bericht schreibt, plant Vertrieb für Kunden, die es nicht gibt.
```

## Zusammenhang ist nicht Ursache

Die dritte Falle ist keine Rechnung, sondern ein Schluss. Modelle sind
besonders gut darin, aus zwei Zahlen, die zusammen steigen, eine
überzeugende Geschichte zu machen. Überzeugend ist sie, weil sie flüssig
klingt — nicht, weil sie stimmt.

```aufgabe
id: D5-14
typ: denkaufgabe
titel: "Die überzeugende Geschichte"
punkte: 25
frage: "In den Filialen mit den meisten Mitarbeiterschulungen ist auch der Umsatz am höchsten. Das Modell schreibt: „Schulungen steigern den Umsatz.“ Was ist die richtige Reaktion?"
optionen:
  - "Übernehmen — die Zahlen zeigen es ja."
  - "Prüfen, ob etwas Drittes beides erklärt, etwa die Größe der Filiale."
  - "Das Modell bitten, die Aussage selbstbewusster zu formulieren."
  - "Den Satz streichen, weil Modelle keine Zusammenhänge erkennen."
loesung: "Prüfen, ob etwas Drittes beides erklärt, etwa die Größe der Filiale."
richtzeit_s: 60
erklaerung: |
  Große Filialen haben mehr Personal, also mehr Schulungen, und mehr Umsatz.
  Der Zusammenhang ist echt, die Ursache womöglich nicht. Ein Bericht darf
  den Zusammenhang nennen - die Ursache nur, wenn sie geprüft ist.
```
