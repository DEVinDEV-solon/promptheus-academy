---
type: lesson
title: "Rechte und Zugänge"
description: "Jeder bekommt so viele Rechte, wie er für seine Arbeit braucht, nicht mehr. Das gilt für Menschen und erst recht für KI-Agenten, die im Postfach oder im Laufwerk arbeiten."
tags:
  - lesson
  - domaene
  - dom-sic
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 15
---

# Rechte und Zugänge

## So wenig wie nötig

Ein Secret aus Lektion 2 ist nur so gefährlich wie die Rechte dahinter. Ein
geleakter Schlüssel, der nur lesen darf, ist ärgerlich. Einer, der alles
darf, ist eine Katastrophe. Daher der Grundsatz aus Stufe 5: **geringste
Rechte**. Jede Rolle bekommt genau die Rechte, die ihre Aufgabe braucht.

```aufgabe
id: D7-06
typ: uebereinstimmung
titel: "Rolle und Rechte"
punkte: 25
frage: "Ordne jeder Rolle die Rechte zu, die sie für ihre Arbeit braucht."
links:
  - "Mitarbeiterin im Empfang"
  - "Buchhalter"
  - "IT-Administratorin"
  - "Externer Dienstleister für die Webseite"
rechts:
  - "Kalender und Besucherliste lesen und bearbeiten"
  - "Buchhaltungsprogramm und Belegordner"
  - "Verwaltung der Konten, mit eigenem Admin-Konto getrennt vom Alltagskonto"
  - "Zugang nur zum Webserver, befristet auf die Dauer des Auftrags"
loesung:
  "Mitarbeiterin im Empfang": "Kalender und Besucherliste lesen und bearbeiten"
  "Buchhalter": "Buchhaltungsprogramm und Belegordner"
  "IT-Administratorin": "Verwaltung der Konten, mit eigenem Admin-Konto getrennt vom Alltagskonto"
  "Externer Dienstleister für die Webseite": "Zugang nur zum Webserver, befristet auf die Dauer des Auftrags"
richtzeit_s: 80
erklaerung: |
  Selbst die Administratorin arbeitet im Alltag ohne Adminrechte und meldet
  sich nur dafür eigens an. Externe Zugänge laufen ab - wer sie unbefristet
  vergibt, hat in drei Jahren Zugänge, an die sich niemand erinnert.
```

## Rechte für einen KI-Agenten

Ein KI-Agent, der Rechnungen aus dem Postfach holt und ablegt, braucht Zugang
zu Postfach und Ablage. Aber welchen? Ein Agent liest auch Texte von Fremden
(Lektion 5 zeigt, was dann passieren kann). Jedes Recht, das er nicht braucht,
ist ein Recht, das ein Angreifer über ihn nutzen könnte.

```aufgabe
id: D7-07
typ: plugplay
titel: "Was der Agent braucht"
punkte: 30
frage: "Ein KI-Agent soll eingehende Rechnungen aus dem Postfach der Buchhaltung im Ordner „Rechnungen“ ablegen. Welche Rechte braucht er?"
bausteine:
  - "Lesen im Postfach der Buchhaltung"
  - "Schreiben im Ordner „Rechnungen“"
  - "E-Mails im Namen der Buchhaltung senden"
  - "E-Mails löschen"
  - "Lesen im Ordner „Personal“"
  - "Administratorrechte auf dem Dateiserver"
loesung:
  - "Lesen im Postfach der Buchhaltung"
  - "Schreiben im Ordner „Rechnungen“"
richtzeit_s: 70
erklaerung: |
  Lesen und an einer Stelle schreiben - mehr braucht die Aufgabe nicht. Darf
  der Agent senden, kann eine manipulierte Mail ihn dazu bringen, Daten
  hinauszuschicken. Darf er löschen, kann er Spuren beseitigen.
```

## Wenn jemand geht

Rechte sammeln sich an. Wer zehn Jahre in einer Firma ist und dreimal die
Abteilung gewechselt hat, hat oft die Rechte aller drei. Spätestens beim
Ausscheiden muss alles weg, und dazu gehört eine Liste, was überhaupt da ist.

```aufgabe
id: D7-08
typ: denkaufgabe
mehrfach: true
titel: "Der letzte Arbeitstag"
punkte: 25
frage: "Ein Mitarbeiter verlässt die Firma. Was gehört zum Entzug der Zugänge? Mehrere Antworten sind richtig."
optionen:
  - "Alle persönlichen Konten am letzten Arbeitstag sperren"
  - "Gemeinsam genutzte Passwörter ändern, die er kannte"
  - "Seine Zugänge zu KI-Werkzeugen und Schnittstellen mit Firmenschlüsseln beenden"
  - "Sein Konto offen lassen, falls er noch Fragen hat"
  - "Nur das E-Mail-Konto sperren, der Rest ist egal"
loesung:
  - "Alle persönlichen Konten am letzten Arbeitstag sperren"
  - "Gemeinsam genutzte Passwörter ändern, die er kannte"
  - "Seine Zugänge zu KI-Werkzeugen und Schnittstellen mit Firmenschlüsseln beenden"
richtzeit_s: 75
erklaerung: |
  Persönliche Konten, gemeinsam genutzte Passwörter und die oft vergessenen
  Zugänge zu KI-Diensten mit Firmenschlüssel. Für Fragen gibt es Telefon und
  E-Mail - kein offenes Konto.
```
