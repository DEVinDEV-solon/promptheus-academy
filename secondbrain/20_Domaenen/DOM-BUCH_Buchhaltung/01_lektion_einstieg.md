---
type: lesson
title: "Buchhaltung — Einstieg"
description: "Jede Buchung ist eine kleine Entscheidung mit Folgen für Steuer, Zahlung und Abschluss. Was darf ein Werkzeug vorbereiten, und wo braucht es Unterschrift und vier Augen?"
tags:
  - lesson
  - domaene
  - dom-buch
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 10
---

# Buchhaltung — Einstieg

## Die Frage, die in jeder Domäne zuerst kommt

Nicht „Was kann KI hier tun?", sondern: **Welche Entscheidung wird hier
getroffen, und was passiert, wenn sie falsch ist?**

In der Buchhaltung wird ständig entschieden, meist im Kleinen: Auf welches
Konto gehört diese Rechnung? Stimmt der Betrag? Darf sie bezahlt werden? Ein
Fehler hier landet in der Steuererklärung, im Jahresabschluss oder auf dem
Konto eines Betrügers. Und die Buchhaltung muss in Deutschland nachvollziehbar
und unveränderbar sein, auch wenn ein Werkzeug mitarbeitet.

Ein Vorschlag, den ein Mensch prüft, ist etwas anderes als eine Entscheidung,
die durchläuft. Das hast du in Stufe 3 als **Freigabe** kennengelernt. In
diesem Kurs wendest du es auf die Buchhaltung an.

```aufgabe
id: D8-01
typ: denkaufgabe
titel: "Vorschlag oder Entscheidung?"
punkte: 20
frage: "Ein KI-System arbeitet im Bereich Buchhaltung. Wann ist es unbedenklich, wann braucht es eine menschliche Freigabe?"
optionen:
  - "Unbedenklich, solange es nur Vorschläge macht, die ein Mensch prüft."
  - "Unbedenklich, solange es schneller ist als ein Mensch."
  - "Unbedenklich, solange die Trefferquote über 95 Prozent liegt."
  - "Unbedenklich, solange niemand widerspricht."
loesung: "Unbedenklich, solange es nur Vorschläge macht, die ein Mensch prüft."
richtzeit_s: 50
erklaerung: |
  Geschwindigkeit und Trefferquote sagen nichts über die Folgen eines
  Fehlers. 95 Prozent heißt: jeder zwanzigste Fall geht daneben - bei
  tausend Vorgängen sind das fünfzig Menschen.
```

## Übernehmen, prüfen, freigeben

Die Faustregel für diesen Kurs: **Daten übernehmen und abgleichen darf
laufen, wenn feste Regeln es prüfen. Was Geld bewegt, Stammdaten ändert oder
Abgeschlossenes anfasst, gibt ein Mensch frei — bei Zahlungen oft zwei.**

```aufgabe
id: D8-02
typ: quizkarten
titel: "Laufen lassen oder freigeben?"
punkte: 25
frage: "Darf der Schritt automatisch laufen, oder gibt ein Mensch ihn frei?"
karten:
  - "Die Daten einer E-Rechnung in die Buchhaltung übernehmen"
  - "Eine Rechnung über 12.000 Euro zur Zahlung freigeben"
  - "Einen Zahlungseingang zuordnen, wenn Betrag und Rechnungsnummer exakt passen"
  - "Eine Buchung nach dem Jahresabschluss ändern"
  - "Eine neue Bankverbindung eines Lieferanten speichern"
stapel: [läuft automatisch, Mensch gibt frei]
loesung:
  "Die Daten einer E-Rechnung in die Buchhaltung übernehmen": läuft automatisch
  "Eine Rechnung über 12.000 Euro zur Zahlung freigeben": Mensch gibt frei
  "Einen Zahlungseingang zuordnen, wenn Betrag und Rechnungsnummer exakt passen": läuft automatisch
  "Eine Buchung nach dem Jahresabschluss ändern": Mensch gibt frei
  "Eine neue Bankverbindung eines Lieferanten speichern": Mensch gibt frei
richtzeit_s: 80
erklaerung: |
  Strukturierte Daten übernehmen und eindeutige Treffer zuordnen sind
  prüfbare Regeln. Zahlungen, Änderungen am Abgeschlossenen und neue
  Bankverbindungen bewegen Geld oder verändern die Grundlage - dort steht ein
  Mensch, und bei Bankdaten am besten zwei.
```

In den nächsten Lektionen gehst du den Weg einer Rechnung einmal ganz durch:
erfassen, kontieren, prüfen, bezahlen. Dazu kommen E-Rechnung, die Regeln
für ordnungsgemäße Buchführung und die Tricks von Betrügern.
