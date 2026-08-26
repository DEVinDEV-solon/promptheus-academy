---
type: lesson
title: "KI im Alltag: wo sie längst ist"
description: "Wo dir maschinelles Lernen jeden Tag begegnet — und wo eine Entscheidung über dich getroffen wird."
tags:
  - lesson
  - stufe-1
  - alltag
  - ethik
timestamp: 2026-08-18T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 1
dauer_min: 10
---

# KI im Alltag

## Die unsichtbare Hälfte

Wenn von KI die Rede ist, denken die meisten an einen Chat. Dabei begegnet dir
maschinelles Lernen den ganzen Tag, ohne dass es sich zu erkennen gibt:

| Wo | Was entschieden wird |
|---|---|
| Spamordner | ob eine Nachricht dich erreicht |
| Kartenapp | welche Route du fährst |
| Videoplattform | was du als nächstes siehst |
| Bank | ob eine Zahlung durchgeht |
| Kamera im Telefon | wie das Bild aussieht, bevor du es siehst |
| Übersetzung | welches Wort gewählt wird |

Die letzte Spalte ist der Punkt dieser Lektion. Überall dort trifft ein
Programm eine **Entscheidung**, und du erfährst weder, dass sie getroffen
wurde, noch warum.

## Zwei Sorten von Entscheidungen

**Folgenlos.** Ein Vorschlag beim nächsten Video ist falsch — du klickst
weiter. Kein Schaden.

**Folgenreich.** Eine Bewerbung wird aussortiert. Eine Zahlung wird abgelehnt.
Ein Antrag wird als verdächtig markiert. Hier trifft es einen Menschen, und
oft erfährt er nicht einmal, dass eine Maschine beteiligt war.

Die Unterscheidung ist **nicht technisch**. Beide benutzen dieselben Verfahren.
Sie ist eine Frage danach, wen es trifft, wenn das Programm irrt.

```aufgabe
id: E1-10
typ: denkaufgabe
titel: "Folgenreich oder folgenlos?"
punkte: 25
frage: "Welche dieser maschinellen Entscheidungen sind für die betroffene Person folgenreich?"
mehrfach: true
optionen:
  - "Eine Bewerbung wird vorsortiert und landet nicht auf dem Tisch."
  - "Ein Musikdienst schlägt ein Lied vor, das nicht gefällt."
  - "Eine Kartenapp wählt eine Route, die drei Minuten länger dauert."
  - "Ein Sozialleistungsantrag wird als „prüfbedürftig“ markiert."
loesung:
  - "Eine Bewerbung wird vorsortiert und landet nicht auf dem Tisch."
  - "Ein Sozialleistungsantrag wird als „prüfbedürftig“ markiert."
richtzeit_s: 60
hinweise:
  - text: "Frag bei jedem: Was passiert der Person, wenn das Programm sich irrt?"
    kostet: 6
erklaerung: |
  Bei Bewerbung und Antrag trägt ein Mensch die Folgen eines Fehlers, und er
  merkt ihn meist nicht einmal. Bei Musik und Route korrigiert man in Sekunden.
  Dieselbe Technik, ganz andere Verantwortung.
```

## Was das Gesetz dazu sagt

Es gibt eine Regel, die genau hier ansetzt — **Artikel 22 DSGVO**. Sinngemäß:

> Niemand muss eine Entscheidung hinnehmen, die ihn erheblich betrifft und
> **ausschließlich** von einer Maschine getroffen wurde.

Es gibt Ausnahmen (Vertrag, Einwilligung, gesetzliche Erlaubnis), und selbst
dann bleiben Rechte: eine Person soll eingreifen können, man darf den eigenen
Standpunkt darlegen und die Entscheidung anfechten.

Für dich als jemanden, der solche Systeme einmal **bauen** wird, steht darin
eine Bauvorschrift: **ein Mensch muss eingreifen können, und es muss
nachvollziehbar sein, was passiert ist.** In Stufe 5 wird daraus ein eigener
Kurs.

```aufgabe
id: E1-11
typ: uebereinstimmung
titel: "Wer trägt die Folgen?"
punkte: 25
frage: "Ordne jedem System zu, was schiefgehen kann."
links: [Spamfilter, Bewerbungssortierung, Betrugserkennung, Videovorschlag]
rechts:
  - "Eine wichtige Nachricht kommt nie an"
  - "Ein geeigneter Mensch wird nie gesehen"
  - "Eine rechtmäßige Zahlung wird blockiert"
  - "Man sieht etwas Uninteressantes"
loesung:
  Spamfilter: "Eine wichtige Nachricht kommt nie an"
  Bewerbungssortierung: "Ein geeigneter Mensch wird nie gesehen"
  Betrugserkennung: "Eine rechtmäßige Zahlung wird blockiert"
  Videovorschlag: "Man sieht etwas Uninteressantes"
richtzeit_s: 80
erklaerung: |
  Drei dieser vier Fehler bemerkt der Betroffene nicht. Das ist das Tückische
  an maschinellen Entscheidungen: ein Fehler, den niemand sieht, wird auch
  nicht gemeldet - und deshalb nie behoben.
quelle: "[[90_Quellen/audittrail/audit-trail-prinzip-index]]"
```

## Woran du eine gute Anwendung erkennst

Drei Fragen, die überall taugen:

1. **Kann ich das Ergebnis prüfen?** Wenn ja, ist KI ein gutes Werkzeug. Wenn
   nein, ist Vorsicht angebracht.
2. **Was passiert, wenn sie sich irrt?** Kostet es Sekunden oder eine Stelle?
3. **Kommt ein Mensch dazwischen?** Bei allem, was jemanden erheblich betrifft,
   muss die Antwort ja sein.
