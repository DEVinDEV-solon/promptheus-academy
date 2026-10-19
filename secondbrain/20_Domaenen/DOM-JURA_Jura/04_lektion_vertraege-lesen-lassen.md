---
type: lesson
title: "Verträge lesen lassen"
description: "Ein Modell findet in dreißig Seiten Vertrag die Kündigungsfrist in Sekunden. Es übersieht aber auch, und „nicht gefunden“ heißt nicht „nicht vorhanden“. Checkliste, Fundstelle und Gegenprobe."
tags:
  - lesson
  - domaene
  - dom-jura
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 16
---

# Verträge lesen lassen

## Klauseln finden und einordnen

Ein Rahmenvertrag mit einem Dienstleister, dreißig Seiten. Die Einkäuferin
will wissen: Wie lange läuft er, wie kommt man raus, wer haftet wofür? Ein
Modell findet solche Stellen schnell und ordnet sie ein. Grundlage ist eine
**Checkliste** mit den Punkten, die bei dieser Art Vertrag immer geprüft
werden. Ohne Checkliste prüft das Modell, was ihm einfällt.

```aufgabe
id: D6-08
typ: quizkarten
titel: "Welche Art Klausel?"
punkte: 30
frage: "Ordne jede Vertragsklausel ihrer Kategorie in der Checkliste zu."
karten:
  - "Der Vertrag verlängert sich um 12 Monate, wenn er nicht 3 Monate vor Ablauf gekündigt wird."
  - "Die Haftung für leichte Fahrlässigkeit ist auf den Auftragswert begrenzt."
  - "Rechnungen sind innerhalb von 30 Tagen ohne Abzug zahlbar."
  - "Gerichtsstand ist Hamburg."
  - "Jede Partei kann aus wichtigem Grund fristlos kündigen."
  - "Bei Zahlungsverzug fallen Verzugszinsen an."
stapel: [Laufzeit und Kündigung, Haftung, Zahlung, Gerichtsstand]
loesung:
  "Der Vertrag verlängert sich um 12 Monate, wenn er nicht 3 Monate vor Ablauf gekündigt wird.": Laufzeit und Kündigung
  "Die Haftung für leichte Fahrlässigkeit ist auf den Auftragswert begrenzt.": Haftung
  "Rechnungen sind innerhalb von 30 Tagen ohne Abzug zahlbar.": Zahlung
  "Gerichtsstand ist Hamburg.": Gerichtsstand
  "Jede Partei kann aus wichtigem Grund fristlos kündigen.": Laufzeit und Kündigung
  "Bei Zahlungsverzug fallen Verzugszinsen an.": Zahlung
richtzeit_s: 90
erklaerung: |
  Genau diese Einordnung macht ein Modell bei jedem Vertrag. Die automatische
  Verlängerung ist die Klausel, die im Alltag am meisten kostet - wer die
  Kündigungsfrist verpasst, ist ein weiteres Jahr gebunden.
```

## Mit Fundstelle, in festem Format

Jede gefundene Klausel braucht die **Ziffer im Vertrag**, damit ein Mensch sie
in Sekunden nachlesen kann. Gibt das Modell seine Funde in einem festen
Format zurück (Stufe 4), lassen sie sich sortieren, vergleichen und in eine
Übersicht übernehmen.

```aufgabe
id: D6-09
typ: technisch
titel: "Ein Fund als JSON"
punkte: 30
frage: "Schreibe einen gültigen JSON-Eintrag für eine gefundene Klausel mit den Schlüsseln kategorie, ziffer und risiko. Den Inhalt darfst du erfinden."
pruefer: json_gueltig
schluessel: [kategorie, ziffer, risiko]
richtzeit_s: 150
hinweise:
  - text: "Zum Beispiel ziffer als Text wie „7.2“, risiko als „hoch“, „mittel“ oder „gering“."
    kostet: 5
erklaerung: |
  Etwa {"kategorie": "Laufzeit", "ziffer": "7.2", "risiko": "hoch"}. Mit
  der Ziffer kann jeder die Stelle selbst lesen - und genau das soll er, bevor
  ein Risiko in eine Entscheidung eingeht.
```

## Nicht gefunden heißt nicht nicht da

```aufgabe
id: D6-10
typ: denkaufgabe
titel: "„Keine Haftungsbegrenzung gefunden“"
punkte: 25
frage: "Das Modell meldet für einen langen Vertrag: „Keine Haftungsbegrenzung gefunden.“ Was tust du?"
optionen:
  - "Gezielt selbst nachsehen, etwa im Inhaltsverzeichnis und bei Haftung und Gewährleistung, weil Modelle in langen Texten Stellen übersehen."
  - "Festhalten, dass der Vertrag keine Haftungsbegrenzung enthält."
  - "Das Modell dieselbe Frage noch einmal stellen und die zweite Antwort nehmen."
  - "Die Frage weglassen, sie ist nicht so wichtig."
loesung: "Gezielt selbst nachsehen, etwa im Inhaltsverzeichnis und bei Haftung und Gewährleistung, weil Modelle in langen Texten Stellen übersehen."
richtzeit_s: 60
erklaerung: |
  Ein Fund lässt sich an der Ziffer prüfen. Ein Nicht-Fund nicht - er ist
  die gefährlichere Aussage. Bei wichtigen Punkten der Checkliste prüft ein
  Mensch gerade die Fehlanzeigen nach.
```
