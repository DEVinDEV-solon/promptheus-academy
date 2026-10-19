---
type: lesson
title: "Personalverwaltung — Einstieg"
description: "In der Personalarbeit geht es um Entscheidungen über Menschen: einstellen, bewerten, fördern, trennen. Gerade hier zieht das Recht klare Grenzen für Werkzeuge."
tags:
  - lesson
  - domaene
  - dom-pers
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 10
---

# Personalverwaltung — Einstieg

## Die Frage, die in jeder Domäne zuerst kommt

Nicht „Was kann KI hier tun?", sondern: **Welche Entscheidung wird hier
getroffen, und was passiert, wenn sie falsch ist?**

In keinem Fachkurs ist die Antwort so deutlich wie hier. In der
Personalarbeit wird über **Menschen** entschieden: wer eingeladen wird, wer
die Stelle bekommt, wie jemand beurteilt wird. Ein Fehler trifft eine Person,
ihre Bewerbung, ihr Einkommen, ihren Ruf. Deshalb gelten hier strenge Regeln:
das Allgemeine Gleichbehandlungsgesetz, Art. 22 DSGVO, die Mitbestimmung des
Betriebsrats und der AI Act, der KI bei der Personalauswahl als **hohes
Risiko** einstuft.

Ein Vorschlag, den ein Mensch prüft, ist etwas anderes als eine Entscheidung,
die durchläuft. Das hast du in Stufe 3 als **Freigabe** kennengelernt. In
diesem Kurs wendest du es auf die Personalarbeit an.

```aufgabe
id: D9-01
typ: denkaufgabe
titel: "Vorschlag oder Entscheidung?"
punkte: 20
frage: "Ein KI-System arbeitet im Bereich Personalverwaltung. Wann ist es unbedenklich, wann braucht es eine menschliche Freigabe?"
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

## Verwaltung oder Urteil?

Vieles in der Personalabteilung ist Verwaltung: Eingänge bestätigen, Fristen
überwachen, Ansprüche nach festen Regeln berechnen. Das darf laufen. Alles,
was ein **Urteil über einen Menschen** ist, trifft ein Mensch.

```aufgabe
id: D9-02
typ: quizkarten
titel: "Verwaltung oder Urteil?"
punkte: 25
frage: "Darf der Schritt automatisch laufen, oder entscheidet ein Mensch?"
karten:
  - "Den Eingang einer Bewerbung bestätigen"
  - "Eine Bewerbung ablehnen"
  - "Den Urlaubsanspruch nach Tarifvertrag berechnen"
  - "Eine Abmahnung aussprechen"
  - "Bewerbungsunterlagen nach Ablauf der Aufbewahrungsfrist löschen"
stapel: [läuft automatisch, Mensch entscheidet]
loesung:
  "Den Eingang einer Bewerbung bestätigen": läuft automatisch
  "Eine Bewerbung ablehnen": Mensch entscheidet
  "Den Urlaubsanspruch nach Tarifvertrag berechnen": läuft automatisch
  "Eine Abmahnung aussprechen": Mensch entscheidet
  "Bewerbungsunterlagen nach Ablauf der Aufbewahrungsfrist löschen": läuft automatisch
richtzeit_s: 80
erklaerung: |
  Bestätigen, nach Regeln berechnen und fristgerecht löschen ist Verwaltung.
  Ablehnen und abmahnen sind Urteile über Menschen - und eine Ablehnung, die
  nur eine Maschine getroffen hat, verbietet Art. 22 DSGVO.
```

In den nächsten Lektionen gehst du den Weg von der Stellenanzeige über die
Auswahl bis zum Arbeitsalltag: Zeugnisse, Personaldaten, ein Wissensbot fürs
Team und Gespräche. An jeder Station fragst du: Verwaltung oder Urteil?
