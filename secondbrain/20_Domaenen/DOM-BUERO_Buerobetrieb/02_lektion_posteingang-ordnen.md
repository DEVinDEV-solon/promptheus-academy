---
type: lesson
title: "Posteingang ordnen"
description: "Ein Modell ordnet Dokumente in feste Klassen. Eine Klasse fehlt dabei fast immer: „unklar, ein Mensch schaut“. Und drei Prozent Fehler klingen wenig, bis man sie zählt."
tags:
  - lesson
  - domaene
  - dom-buero
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 15
---

# Posteingang ordnen

## Feste Klassen

Jeden Morgen dasselbe: Briefe, eingescannte Post, Anhänge aus E-Mails. Bevor
irgendjemand damit arbeiten kann, muss klar sein, **was** es ist. Diese
Einordnung heißt **Klassifikation**, und sie ist eine Stärke von Modellen:
Sie erkennen eine Rechnung auch dann, wenn das Wort „Rechnung" nirgends steht.

Wie bei jeder Sortierung gilt: Die Klassen legst du fest, nicht das Modell.

```aufgabe
id: D3-03
typ: quizkarten
titel: "Was liegt da im Posteingang?"
punkte: 30
frage: "Ordne jedes Dokument seiner Klasse zu."
karten:
  - "Zahlbar innerhalb von 14 Tagen ohne Abzug, Betrag 1.240 Euro"
  - "Hiermit bewerbe ich mich auf die Stelle als Bürokauffrau"
  - "Nur diese Woche: 30 Prozent auf alle Druckerpatronen!"
  - "Der Mietvertrag verlängert sich um ein Jahr, wenn er nicht gekündigt wird"
  - "Lebenslauf und Zeugnisse finden Sie im Anhang"
  - "Rechnungsnummer 2026-0417, Leistungszeitraum März"
stapel: [Rechnung, Vertrag, Bewerbung, Werbung]
loesung:
  "Zahlbar innerhalb von 14 Tagen ohne Abzug, Betrag 1.240 Euro": Rechnung
  "Hiermit bewerbe ich mich auf die Stelle als Bürokauffrau": Bewerbung
  "Nur diese Woche: 30 Prozent auf alle Druckerpatronen!": Werbung
  "Der Mietvertrag verlängert sich um ein Jahr, wenn er nicht gekündigt wird": Vertrag
  "Lebenslauf und Zeugnisse finden Sie im Anhang": Bewerbung
  "Rechnungsnummer 2026-0417, Leistungszeitraum März": Rechnung
richtzeit_s: 90
erklaerung: |
  Ein einzelner Satz reicht oft für die Klasse - Zahlungsziel und
  Rechnungsnummer für die Rechnung, Lebenslauf für die Bewerbung. Genau so
  erkennt ein Modell Dokumente, auch wenn sie anders aufgebaut sind als
  erwartet.
```

## Die Klasse für Zweifel

Was tut das Modell mit einem Dokument, das in keine Klasse passt? Ohne
Ausweg steckt es das Dokument in die Klasse, die am wenigsten falsch
aussieht. Ein Gerichtsbescheid landet dann bei „Werbung".

```aufgabe
id: D3-04
typ: denkaufgabe
titel: "Wenn nichts passt"
punkte: 25
frage: "Warum braucht eine Dokumentensortierung eine eigene Klasse „unklar, ein Mensch prüft“?"
optionen:
  - "Weil das Modell sonst Dokumente, die nirgends passen, in die am wenigsten falsche Klasse steckt, wo sie niemand mehr sucht."
  - "Weil das Modell dann weniger kostet."
  - "Weil Menschen sonst nichts zu tun hätten."
  - "Weil Modelle unklare Dokumente grundsätzlich löschen."
loesung: "Weil das Modell sonst Dokumente, die nirgends passen, in die am wenigsten falsche Klasse steckt, wo sie niemand mehr sucht."
richtzeit_s: 60
erklaerung: |
  Ein Modell muss sich entscheiden, wenn du ihm keinen Ausweg gibst. Die
  Klasse „unklar" ist dieser Ausweg. Besser zehn Dokumente zu viel beim
  Menschen als ein Bescheid mit Frist im Werbeordner.
```

## Drei Prozent

Ein Werkzeug, das 97 Prozent richtig sortiert, klingt sehr gut. Rechne nach,
was der Rest im Alltag bedeutet.

```aufgabe
id: D3-05
typ: mathe
titel: "Was drei Prozent heißen"
punkte: 25
frage: "Im Büro gehen pro Woche 400 Dokumente ein. Das Werkzeug sortiert 3 Prozent falsch ein. Wie viele Dokumente landen pro Woche im falschen Ordner?"
loesung: 12
toleranz: 0
einheit: "Dokumente"
richtzeit_s: 50
erklaerung: |
  400 × 0,03 = 12 Dokumente pro Woche, über 600 im Jahr. Deshalb prüfst du
  zu Beginn Stichproben, und deshalb gehören Dokumente mit Frist - Bescheide,
  Mahnungen, Kündigungen - immer zusätzlich vor menschliche Augen.
```
