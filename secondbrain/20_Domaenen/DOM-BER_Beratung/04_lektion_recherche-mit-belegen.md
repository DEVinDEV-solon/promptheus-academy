---
type: lesson
title: "Recherche mit Belegen"
description: "Ein Modell findet schnell und erfindet schnell. Ein Rechercheablauf, in dem jede Aussage ihren Beleg mitbringt."
tags:
  - lesson
  - domaene
  - dom-ber
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 16
---

# Recherche mit Belegen

## Das Problem mit der flüssigen Antwort

Aus Stufe 1 weißt du: Ein Modell sagt das nächste wahrscheinliche Token
vorher. Eine Quellenangabe entsteht genauso — sie *klingt* richtig, das
heißt nicht, dass es sie gibt. In einem Beratungsbericht ist eine erfundene
Marktzahl kein kleiner Fehler. Sie steht unter deinem Namen beim Kunden.

Deshalb gilt für jede Recherche mit Modell eine einzige Regel:
**Keine Aussage ohne Beleg, und der Beleg wird geprüft, nicht geglaubt.**

## Ein Rechercheablauf

Ein Ablauf, der diese Regel einbaut, sieht so aus:

```
[Suchauftrag aus der Kernfrage] --> [Treffer sammeln] --> [Modell zieht Aussage + wörtliches Zitat heraus]
   --> <Zitat steht wörtlich im Dokument?> --ja--> [in die Materialliste]
                    |
                   nein --> [verwerfen und vermerken]
```

Der Trick steckt in der Raute: Ob ein Zitat **wörtlich** in einem Dokument
steht, ist eine **Regel** — ein Textvergleich. Das Modell darf die Aussage
vorschlagen, aber eine Regel prüft, ob sie sich auf das Dokument stützt.
Das ist dieselbe Aufteilung wie in Stufe 3: Modell für Bedeutung, Regel für
alles, was sich vergleichen lässt.

```aufgabe
id: D5-09
typ: schiebe
titel: "Recherche in der richtigen Reihenfolge"
punkte: 30
frage: "Bring die Schritte des Rechercheablaufs in die richtige Reihenfolge."
bausteine:
  - "Prüfen, ob das Zitat wörtlich im Dokument steht"
  - "Suchauftrag aus der Kernfrage ableiten"
  - "Aussage mit Quelle in die Materialliste übernehmen"
  - "Treffer sammeln"
  - "Das Modell zieht Aussage und Zitat aus jedem Treffer"
loesung:
  - "Suchauftrag aus der Kernfrage ableiten"
  - "Treffer sammeln"
  - "Das Modell zieht Aussage und Zitat aus jedem Treffer"
  - "Prüfen, ob das Zitat wörtlich im Dokument steht"
  - "Aussage mit Quelle in die Materialliste übernehmen"
richtzeit_s: 80
erklaerung: |
  Die Prüfung steht vor der Übernahme. Was einmal in der Materialliste
  steht, wandert erfahrungsgemäß ungeprüft in den Bericht.
```

## Was du immer nachprüfst

Nicht jede Angabe ist gleich gefährlich. Am gefährlichsten sind die, die
**genau** aussehen: Zahlen, Namen, Daten, Titel von Studien. Gerade weil sie
präzise wirken, prüft sie niemand nach.

```aufgabe
id: D5-10
typ: denkaufgabe
titel: "Was muss nachgeprüft werden?"
punkte: 30
frage: "Ein Modell liefert dir eine Zusammenfassung zum Markt für Lastenräder. Welche Angaben musst du an der Originalquelle prüfen, bevor sie in den Bericht dürfen?"
mehrfach: true
optionen:
  - "„Der Markt wuchs 2025 um 11,4 Prozent.“"
  - "„Laut einer Studie des Instituts X von 2024 …“"
  - "„Lastenräder werden vor allem in Städten genutzt.“"
  - "„Hersteller Y hat 2025 einen Marktanteil von 23 Prozent.“"
loesung:
  - "„Der Markt wuchs 2025 um 11,4 Prozent.“"
  - "„Laut einer Studie des Instituts X von 2024 …“"
  - "„Hersteller Y hat 2025 einen Marktanteil von 23 Prozent.“"
richtzeit_s: 80
hinweise:
  - text: "Prüfpflichtig ist alles, was genau aussieht: Zahlen, Namen, Jahreszahlen, Studien."
    kostet: 5
erklaerung: |
  Zahlen, Studien und Marktanteile sind genau die Angaben, die ein Modell
  besonders glaubwürdig erfindet. Die allgemeine Aussage über Städte ist
  plausibel und wenig folgenreich - auch sie braucht im Bericht eine
  Quelle, aber sie ist nicht der Satz, der dich vor dem Kunden blamiert.
```

## Ergebnisse als Datensatz

Damit eine Regel die Belege prüfen kann, muss das Modell sie in einer
festen Form liefern — als JSON, wie du es in Stufe 3, Lektion 5 kennengelernt
hast. Ein Eintrag der Materialliste:

```json
{"aussage": "Der Umsatz mit Lastenrädern stieg 2025.", "quelle": "Jahresbericht Verband Z 2025, S. 4", "zitat": "Der Umsatz stieg gegenüber dem Vorjahr deutlich."}
```

```aufgabe
id: D5-11
typ: technisch
titel: "Ein Eintrag für die Materialliste"
punkte: 30
frage: "Schreibe einen gültigen JSON-Eintrag für die Materialliste mit den Schlüsseln aussage, quelle und zitat. Den Inhalt darfst du erfinden."
pruefer: json_gueltig
schluessel: [aussage, quelle, zitat]
richtzeit_s: 180
hinweise:
  - text: "Nimm das Beispiel oben und tausche nur die Werte aus."
    kostet: 5
  - text: "Gerade Anführungszeichen wie auf der Tastatur, keine deutschen „…“."
    kostet: 8
erklaerung: |
  Mit dieser festen Form kann eine Regel jeden Eintrag prüfen: Ist eine
  Quelle angegeben? Steht das Zitat wörtlich im Dokument? Ohne feste Form
  müsste ein Mensch jede Zeile lesen - und genau das wollte man sparen.
```
