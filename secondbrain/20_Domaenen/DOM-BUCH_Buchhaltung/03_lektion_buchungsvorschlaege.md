---
type: lesson
title: "Buchungsvorschläge"
description: "Auf welches Konto gehört die Rechnung? Ein Werkzeug lernt aus früheren Buchungen und schlägt vor. Bei Bekanntem stimmt das fast immer, bei Neuem und Ungewöhnlichem schaut ein Mensch."
tags:
  - lesson
  - domaene
  - dom-buch
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 16
---

# Buchungsvorschläge

## Konten zuordnen

Die Rechnung ist erfasst und geprüft (Lektion 2). Jetzt die Frage: Auf welches
**Konto** gehört sie? Dafür gibt es Kontenrahmen, etwa SKR 03 oder SKR 04, mit
Konten für Bürobedarf, Fahrzeugkosten, Bewirtung und vieles mehr. Wer das
täglich macht, entwickelt ein Gefühl dafür. Ein Werkzeug entwickelt es aus den
Buchungen der Vergangenheit.

```aufgabe
id: D8-06
typ: uebereinstimmung
titel: "Welches Konto?"
punkte: 25
frage: "Ordne jedem Beleg die passende Kontenart zu."
links:
  - "Kopierpapier und Ordner"
  - "Tankquittung für den Firmenwagen"
  - "Geschäftsessen mit einem Kunden"
  - "Lagerregal für 4.800 Euro netto"
rechts: [Bürobedarf, Fahrzeugkosten, Bewirtungskosten, Anlagevermögen]
loesung:
  "Kopierpapier und Ordner": Bürobedarf
  "Tankquittung für den Firmenwagen": Fahrzeugkosten
  "Geschäftsessen mit einem Kunden": Bewirtungskosten
  "Lagerregal für 4.800 Euro netto": Anlagevermögen
richtzeit_s: 70
erklaerung: |
  Verbrauchtes wird zum Aufwand, Dauerhaftes über einem bestimmten Wert wird
  Anlagevermögen und über die Jahre abgeschrieben. Bewirtung hat eigene
  Regeln für die Abzugsfähigkeit - einer der Fälle, die eine Fachkraft im
  Blick behält.
```

## Wann der Vorschlag reicht

Moderne Buchhaltungsprogramme schlagen das Konto vor: „Lieferant Bürowelt,
bisher immer auf Bürobedarf gebucht.“ Bei wiederkehrenden Rechnungen ist das
fast immer richtig. Gefährlich sind die Fälle, die **anders** sind als
bisher. Genau dort liegt der Vorschlag am ehesten daneben, weil das Werkzeug
nur die Vergangenheit kennt.

```aufgabe
id: D8-07
typ: quizkarten
titel: "Vorschlag übernehmen oder prüfen?"
punkte: 30
frage: "Darf der Buchungsvorschlag übernommen werden, oder schaut ein Mensch hin?"
karten:
  - "Monatsmiete, gleicher Vermieter, gleicher Betrag wie immer"
  - "Erste Rechnung eines neuen Lieferanten"
  - "Rechnung des bekannten Bürolieferanten, aber zehnmal so hoch wie sonst"
  - "Rechnung mit Material und Montageleistung gemischt"
  - "Telefonrechnung, gleicher Anbieter, Betrag wie im Vormonat"
stapel: [Vorschlag übernehmen, Mensch prüft]
loesung:
  "Monatsmiete, gleicher Vermieter, gleicher Betrag wie immer": Vorschlag übernehmen
  "Erste Rechnung eines neuen Lieferanten": Mensch prüft
  "Rechnung des bekannten Bürolieferanten, aber zehnmal so hoch wie sonst": Mensch prüft
  "Rechnung mit Material und Montageleistung gemischt": Mensch prüft
  "Telefonrechnung, gleicher Anbieter, Betrag wie im Vormonat": Vorschlag übernehmen
richtzeit_s: 80
erklaerung: |
  Bekannt und gleich: übernehmen. Neu, ungewöhnlich hoch oder gemischt:
  prüfen. Eine Regel kann diese Merkmale erkennen und solche Fälle in einen
  eigenen Korb legen - das Modell muss dafür nichts verstehen.
```

## Was übrig bleibt

```aufgabe
id: D8-08
typ: mathe
titel: "Der Korb für Menschen"
punkte: 25
frage: "Im Monat kommen 600 Eingangsrechnungen. 85 Prozent sind bekannt und gleichartig, ihr Vorschlag wird übernommen. Wie viele Rechnungen landen im Korb für die menschliche Prüfung?"
loesung: 90
toleranz: 0
einheit: "Rechnungen"
richtzeit_s: 60
erklaerung: |
  15 Prozent von 600 sind 90 Rechnungen, rund vier am Arbeitstag. Statt 600
  Rechnungen von Hand zu kontieren, prüft die Fachkraft die 90, bei denen ihr
  Urteil wirklich gebraucht wird.
```
