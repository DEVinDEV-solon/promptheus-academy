---
type: lesson
title: "Anträge prüfen"
description: "Ist der Antrag vollständig? Diese Frage lässt sich mit einer Checkliste fast ganz automatisieren. Ob er begründet ist, ist eine andere Frage, und eine Nachforderung schreibt sich mit Modell schneller."
tags:
  - lesson
  - domaene
  - dom-buero2
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 15
---

# Anträge prüfen

## Vollständig ist nicht begründet

Jeder Antrag wird zweimal geprüft, auch wenn es im Alltag oft ineinander
läuft:

- **Formell:** Ist alles da? Unterschrift, Pflichtfelder, Anlagen, aktuelles
  Formular.
- **Inhaltlich:** Liegen die Voraussetzungen vor? Reicht das Einkommen, ist es
  ein Härtefall, passt der Bauantrag zum Bebauungsplan?

Die formelle Prüfung folgt einer **Checkliste** und lässt sich gut
automatisieren. Die inhaltliche nur dort, wo das Gesetz feste Grenzen setzt.

```aufgabe
id: D10-03
typ: quizkarten
titel: "Formell oder inhaltlich?"
punkte: 30
frage: "Gehört die Frage zur formellen Prüfung auf Vollständigkeit oder zur inhaltlichen Prüfung?"
karten:
  - "Ist der Antrag unterschrieben?"
  - "Sind alle Pflichtanlagen beigefügt?"
  - "Liegt das Einkommen unter der Grenze für die Leistung?"
  - "Liegt ein Härtefall vor?"
  - "Wurde die aktuelle Fassung des Formulars verwendet?"
stapel: [formell, inhaltlich]
loesung:
  "Ist der Antrag unterschrieben?": formell
  "Sind alle Pflichtanlagen beigefügt?": formell
  "Liegt das Einkommen unter der Grenze für die Leistung?": inhaltlich
  "Liegt ein Härtefall vor?": inhaltlich
  "Wurde die aktuelle Fassung des Formulars verwendet?": formell
richtzeit_s: 80
erklaerung: |
  Die formellen Fragen beantwortet eine Checkliste. Die Einkommensgrenze ist
  inhaltlich, aber fest - eine Regel kann rechnen. Der Härtefall braucht ein
  Urteil. So zerfällt ein Antrag in Teile, die unterschiedlich viel
  Menschenarbeit brauchen.
```

## Die Anlage, die keine ist

Ein Modell kann die Anlagen eines Antrags erkennen: Gehaltsnachweis,
Mietvertrag, Meldebescheinigung. Es kann sich dabei irren, etwa einen
Kontoauszug für einen Gehaltsnachweis halten.

```aufgabe
id: D10-04
typ: denkaufgabe
titel: "Unvollständig laut Modell"
punkte: 25
frage: "Das Werkzeug meldet: „Gehaltsnachweis fehlt, Antrag unvollständig.“ Tatsächlich liegt er bei, falsch benannt. Was folgt daraus für den Ablauf?"
optionen:
  - "Eine Meldung „unvollständig“ wird vor der Nachforderung von einem Menschen geprüft, und die Erkennung wird stichprobenweise kontrolliert."
  - "Der Antrag wird automatisch abgelehnt, die Person kann ja widersprechen."
  - "Bürgerinnen und Bürger müssen ihre Anlagen künftig genauer benennen."
  - "Das Werkzeug wird abgeschaltet, weil es einmal geirrt hat."
loesung: "Eine Meldung „unvollständig“ wird vor der Nachforderung von einem Menschen geprüft, und die Erkennung wird stichprobenweise kontrolliert."
richtzeit_s: 60
erklaerung: |
  Ein Irrtum des Werkzeugs darf nicht auf dem Rücken der Antragstellenden
  landen. Eine kurze Prüfung vor der Nachforderung kostet Sekunden, eine
  unnötige Nachforderung kostet Wochen - und Vertrauen.
```

## Die Nachforderung

```aufgabe
id: D10-05
typ: schiebe
titel: "Wenn etwas fehlt"
punkte: 25
frage: "Bring die Schritte bei einem unvollständigen Antrag in die richtige Reihenfolge."
bausteine:
  - "Wiedervorlage zum Ende der Frist setzen"
  - "Antrag mit der Checkliste prüfen"
  - "Modell entwirft das Nachforderungsschreiben mit Frist, Sachbearbeitung prüft es"
  - "Fehlende Unterlagen auflisten und von einem Menschen bestätigen lassen"
  - "Antrag geht ein, Eingang wird bestätigt"
loesung:
  - "Antrag geht ein, Eingang wird bestätigt"
  - "Antrag mit der Checkliste prüfen"
  - "Fehlende Unterlagen auflisten und von einem Menschen bestätigen lassen"
  - "Modell entwirft das Nachforderungsschreiben mit Frist, Sachbearbeitung prüft es"
  - "Wiedervorlage zum Ende der Frist setzen"
richtzeit_s: 70
erklaerung: |
  Prüfen, bestätigen, schreiben, nachhalten. Das Modell spart Zeit beim
  Formulieren, und ein verständliches Schreiben spart Rückfragen. Was fehlt,
  hat vorher ein Mensch bestätigt.
```
