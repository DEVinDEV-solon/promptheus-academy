---
type: lesson
title: "GoBD und Nachvollziehbarkeit"
description: "Buchungen dürfen nicht spurlos geändert werden, jeder Beleg muss auffindbar sein, und wie die Buchhaltung arbeitet, steht in einer Verfahrensdokumentation. Auch dann, wenn ein KI-Werkzeug mitarbeitet."
tags:
  - lesson
  - domaene
  - dom-buch
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 14
---

# GoBD und Nachvollziehbarkeit

## Die Regeln für digitale Buchführung

Für die digitale Buchführung in Deutschland gelten die **GoBD**, die
Grundsätze zur ordnungsmäßigen Führung und Aufbewahrung von Büchern in
elektronischer Form. Drei davon betreffen jeden KI-Einsatz direkt:

- **Nachvollziehbarkeit:** Jede Buchung lässt sich bis zum Beleg
  zurückverfolgen, und jeder Beleg bis zur Buchung.
- **Unveränderbarkeit:** Festgeschriebene Buchungen werden nicht geändert,
  sondern storniert und neu gebucht. Die alte Fassung bleibt sichtbar.
- **Verfahrensdokumentation:** Es ist beschrieben, wie die Buchhaltung
  arbeitet — auch welche Schritte ein Werkzeug übernimmt und wie sie geprüft
  werden.

Dazu kommt die Aufbewahrung: Buchungsbelege acht Jahre, Bücher und Abschlüsse
zehn Jahre.

```aufgabe
id: D8-17
typ: plugplay
titel: "Die Verfahrensdokumentation"
punkte: 30
frage: "Was gehört in die Verfahrensdokumentation eines KI-gestützten Rechnungseingangs?"
bausteine:
  - "Beschreibung des Ablaufs vom Eingang bis zur Buchung"
  - "Welche Schritte das Werkzeug übernimmt und welche ein Mensch"
  - "Welche Prüfregeln gelten und was bei Abweichungen passiert"
  - "Wer wofür zuständig ist und wer freigibt"
  - "Die Zugangspasswörter des Werkzeugs"
  - "Lob für das Modell, weil es so gut arbeitet"
loesung:
  - "Beschreibung des Ablaufs vom Eingang bis zur Buchung"
  - "Welche Schritte das Werkzeug übernimmt und welche ein Mensch"
  - "Welche Prüfregeln gelten und was bei Abweichungen passiert"
  - "Wer wofür zuständig ist und wer freigibt"
richtzeit_s: 75
erklaerung: |
  Eine Betriebsprüferin soll aus der Dokumentation verstehen, wie eine
  Buchung entsteht. Passwörter gehören in den Tresor (Fachkurs Sicherheit),
  nicht in ein Dokument, das Prüfer bekommen.
```

## Korrigieren, nicht überschreiben

```aufgabe
id: D8-18
typ: denkaufgabe
titel: "Die falsche Buchung im März"
punkte: 25
frage: "Eine festgeschriebene Buchung aus dem März war falsch kontiert. Ein Werkzeug bietet an, sie „einfach zu korrigieren“. Was ist der richtige Weg?"
optionen:
  - "Die Buchung stornieren und neu buchen, sodass beide Vorgänge sichtbar bleiben."
  - "Die alte Buchung überschreiben, damit das Konto sauber aussieht."
  - "Die Buchung löschen und den Beleg neu erfassen."
  - "Nichts tun, ein Fehler im März fällt nicht auf."
loesung: "Die Buchung stornieren und neu buchen, sodass beide Vorgänge sichtbar bleiben."
richtzeit_s: 60
erklaerung: |
  Unveränderbarkeit heißt nicht, dass Fehler bleiben, sondern dass ihre
  Korrektur sichtbar ist. Ein Werkzeug, das spurlos überschreibt, verstößt
  gegen die GoBD - egal wie gut es gemeint ist.
```
