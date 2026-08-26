---
type: reference
title: "Bibliothek"
description: "Nachschlagewerke der Academy — Glossar und Autorenregeln. Was man aufschlägt und wieder zuklappt."
tags:
  - index
  - bibliothek
timestamp: 2026-08-22T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Bibliothek

Hier liegt, was man **nachschlägt** — nicht, was man durcharbeitet. Die Ordner
`10_Stufen` bis `50_Sprecher_Bilder_Videos` sind ein Weg mit Stationen. Die
Bibliothek ist keine Station: Man springt hinein, holt sich eine Auskunft und
ist wieder draußen.

## Was hier steht

- [[90_Bibliothek/Glossar/_index|Glossar]] — Fremdwörter und Fachbegriffe, je Begriff eine Notiz
- [[90_Bibliothek/Brand-Guideline|Brand-Guideline PROMPTHEUS]] — Stimme, Sprache, Ausgabeformen und der Einsatz in KI-Systemen
- Autorenleitfaden — *noch nicht geschrieben*, siehe unten

## Zwei Räume, eine Richtung

Die Bibliothek ist nicht `90_Quellen`, und das ist Absicht.

**`90_Quellen` ist der Beweisraum.** Dort liegt, was aus acht fremden
Wissensspeichern geerntet wurde — jede Datei mit Vault, Pfad, Erntedatum und
SHA-256-Prüfsumme. Nichts davon haben wir geschrieben, und niemand liest es im
Programm. Es ist das Material, auf das man sich berufen kann.

**Die Bibliothek ist der Leseraum.** Hier steht, was wir selbst schreiben, in
unseren Worten, für die Lernenden. Sie *verweist* auf die Quellen, statt sie zu
schlucken: Wo ein Begriff aus einer geernteten Notiz stammt, steht der Beleg
unter der Erklärung.

Löste man die Trennung auf, wäre hinterher nicht mehr zu sehen, was belegt ist
und was wir behaupten. Daran hängt der Satz aus dem Leitbild: *„PROMPTHEUS
erfindet seine Beispiele nicht."*

## Das Glossar

Jeder Begriff ist eine eigene Datei, kein Zeilenpaar in einer Tabelle. Der
Grund ist der Graph: Die verwandten Schlagworte, die im Programm neben der
Erklärung stehen, sind die Wikilinks dieser Notiz. Sie kommen aus der
Verbindung selbst — nicht aus einer zweiten, von Hand gepflegten Liste, die
eines Tages etwas anderes sagt.

Neue Begriffe kommen als Datei in `Glossar/`, danach schreibt

```
python secondbrain/_scripts/glossar_index.py
```

die A–Z-Nabe neu.

## Autorenleitfaden — noch offen

Die alte Beschreibung dieses Ordners versprach *„Ordnungsregeln und
Autorenleitfaden"*, geschrieben war davon nichts. Der Anspruch bleibt richtig,
also steht er hier als offener Punkt statt als leerer Ordner.

Ein Teil davon steht inzwischen: Wie die Academy **klingt** — Haltung,
Register, Verbotsliste, Form je Anlass — regelt die
[[90_Bibliothek/Brand-Guideline|Brand-Guideline]]. Was noch fehlt, ist der
handwerkliche Rest: Wie eine Lektion aufgebaut wird, wie lang sie sein darf,
wann eine Aufgabe dazugehört.

Bis dahin liegen die Regeln verstreut:

- Aufgabentypen und ihre Felder: `40_Aufgabentypen/_index.md`
- Das Notizformat selbst: `00_Fundament/okf-format/index.md`
- Prüfungs- und Studienordnung: `000_Uni/`
- Gestaltung des Programms: `Brand/BRAND.md` im Programmordner
