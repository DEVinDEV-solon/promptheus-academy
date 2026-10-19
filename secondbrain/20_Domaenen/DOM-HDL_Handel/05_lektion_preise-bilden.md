---
type: lesson
title: "Preise bilden"
description: "Aufschlag, Handelsspanne, dynamische Preise: Was ein Werkzeug vorschlagen darf, welche Leitplanken es braucht und wo das Recht Grenzen zieht."
tags:
  - lesson
  - domaene
  - dom-hdl
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 15
---

# Preise bilden

## Aufschlag ist nicht Spanne

Die Ware aus Lektion 4 ist bestellt. Was soll sie kosten?

Zwei Zahlen werden im Alltag ständig verwechselt, auch von Modellen:

- **Aufschlag** rechnet vom Einkaufspreis aus: (Verkauf − Einkauf) ÷ Einkauf.
- **Handelsspanne** rechnet vom Verkaufspreis aus: (Verkauf − Einkauf) ÷ Verkauf.

Bei Einkauf 8 Euro und Verkauf 12 Euro (beides netto) sind es 50 Prozent
Aufschlag, aber nur gut 33 Prozent Spanne. Wer die beiden verwechselt,
kalkuliert jeden Artikel falsch.

```aufgabe
id: D1-12
typ: mathe
titel: "Die Handelsspanne"
punkte: 25
frage: "Ein Artikel kostet im Einkauf 8,00 Euro und wird für 12,00 Euro verkauft (beides netto). Wie hoch ist die Handelsspanne in Prozent?"
loesung: 33.33
toleranz: 0.1
einheit: "Prozent"
richtzeit_s: 80
hinweise:
  - text: "Die Spanne rechnet vom Verkaufspreis aus."
    kostet: 5
erklaerung: |
  (12 - 8) / 12 = 0,333, also rund 33,3 Prozent. Der Aufschlag wäre
  (12 - 8) / 8 = 50 Prozent. Lass dir vom Modell nicht „die Marge“ nennen,
  ohne zu fragen, welche gemeint ist.
```

## Vier Begriffe, die jeder Preisvorschlag kennen muss

Gegenüber Verbraucherinnen und Verbrauchern gelten in Deutschland feste
Regeln für die Preisangabe (Preisangabenverordnung). Ein Werkzeug, das Preise
vorschlägt, muss sie kennen, sonst schlägt es etwas vor, das nicht erlaubt
ist.

```aufgabe
id: D1-13
typ: uebereinstimmung
titel: "Begriffe der Preisangabe"
punkte: 25
frage: "Ordne jedem Begriff seine Bedeutung zu."
links: [Aufschlag, Handelsspanne, Grundpreis, 30-Tage-Tiefstpreis]
rechts:
  - "Gewinnanteil bezogen auf den Einkaufspreis"
  - "Gewinnanteil bezogen auf den Verkaufspreis"
  - "Preis je Kilogramm, Liter oder Meter zum Vergleichen"
  - "Bei einer Preisermäßigung der niedrigste Preis der letzten 30 Tage als Bezug"
loesung:
  Aufschlag: "Gewinnanteil bezogen auf den Einkaufspreis"
  Handelsspanne: "Gewinnanteil bezogen auf den Verkaufspreis"
  Grundpreis: "Preis je Kilogramm, Liter oder Meter zum Vergleichen"
  30-Tage-Tiefstpreis: "Bei einer Preisermäßigung der niedrigste Preis der letzten 30 Tage als Bezug"
richtzeit_s: 80
erklaerung: |
  Wer eine Ermäßigung bewirbt, muss sich auf den niedrigsten Preis der
  letzten 30 Tage beziehen - ein Trick mit kurz vorher erhöhten Preisen ist
  damit verboten. Ein Preiswerkzeug braucht dafür die Preishistorie.
```

## Dynamische Preise brauchen Leitplanken

Viele Shops passen Preise automatisch an: an den Bestand, an die Nachfrage,
an die Konkurrenz. Das kann sinnvoll sein. Ohne Grenzen geht es schief.
Bekannt sind Fälle, in denen zwei Preisroboter sich gegenseitig hochgeschaukelt
haben, bis ein Fachbuch Millionen kosten sollte.

Dazu kommt das Recht. Preise mit Wettbewerbern **abzustimmen**, ist verboten,
auch wenn es ein Algorithmus tut. Und wer Preise für einzelne Kundinnen
anhand ihrer Daten automatisch personalisiert, muss im Onlinehandel darauf
hinweisen.

```aufgabe
id: D1-14
typ: denkaufgabe
mehrfach: true
titel: "Leitplanken für den Preisroboter"
punkte: 30
frage: "Ein Werkzeug soll Preise im Onlineshop automatisch vorschlagen. Welche Leitplanken gehören hinein? Mehrere Antworten sind richtig."
optionen:
  - "Eine Untergrenze: nie unter Einkaufspreis plus Kosten"
  - "Eine Obergrenze für die Änderung pro Tag"
  - "Ab einer bestimmten Änderung gibt ein Mensch frei"
  - "Immer den billigsten Wettbewerber unterbieten, ohne Grenze"
  - "Preise mit den Wettbewerbern absprechen, damit keiner verliert"
loesung:
  - "Eine Untergrenze: nie unter Einkaufspreis plus Kosten"
  - "Eine Obergrenze für die Änderung pro Tag"
  - "Ab einer bestimmten Änderung gibt ein Mensch frei"
richtzeit_s: 80
erklaerung: |
  Untergrenze, Änderungsgrenze und Freigabe halten den Roboter in der Spur.
  Unterbieten ohne Grenze ruiniert die Marge, und eine Preisabsprache ist
  Kartellrecht - egal ob ein Mensch oder ein Programm sie trifft.
```
