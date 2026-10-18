---
type: lesson
title: "Dokumentation und Übergabe"
description: "Wer seine Lösung nicht erklären kann, kann sie nicht abgeben. Drei Dokumente, die jede Lösung braucht — für die, die sie benutzen, betreiben und weiterbauen."
tags:
  - lesson
  - stufe-6
  - betrieb
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 6
dauer_min: 15
---

# Dokumentation und Übergabe

## Der Lastwagen-Test

In der Softwareentwicklung gibt es eine etwas makabre Frage: *Was passiert mit
deiner Lösung, wenn du morgen vom Lastwagen überfahren wirst?* Freundlicher
gefragt: wenn du in Urlaub gehst, die Stelle wechselst, das Projekt abgibst.

Läuft sie weiter? Weiß jemand, was zu tun ist, wenn sie stehen bleibt? Kann
jemand sie ändern? Wenn die Antwort „nein" ist, ist die Lösung nicht fertig —
sie hängt an einer Person. **Eine Lösung, die jemand anderes benutzen kann,
muss auch jemand anderes betreiben können.**

## Drei Leser, drei Dokumente

| Dokument | Für wen | Beantwortet |
|---|---|---|
| **Anleitung** | Die, die es benutzen | Wozu ist es da? Wie benutze ich es? Was tue ich, wenn etwas nicht klappt? |
| **Betriebshandbuch** | Die, die es am Laufen halten | Wo läuft es? Welche Zugänge braucht es? Was steht auf der Wartungsliste? Was tun bei Ausfall? |
| **Entwurfsnotiz** | Die, die es weiterbauen | Wie ist es geschnitten und warum? Welche Entscheidungen wurden getroffen? |

Die Entwurfsnotiz ist dein Systementwurf aus Stufe 4, nachgeführt auf das, was
tatsächlich gebaut wurde. Und das Wichtigste darin ist — wie beim
Änderungsprotokoll im 7. Kurs — das **Warum**. Der Code zeigt, *was* gebaut
wurde. Warum es so gebaut wurde, steht nirgends sonst.

```aufgabe
id: E6-14
typ: uebereinstimmung
titel: "Welches Dokument?"
punkte: 30
frage: "Ordne jede Frage dem Dokument zu, in dem ihre Antwort stehen sollte."
links:
  - "Wie lasse ich mir die Termine für eine andere Woche schicken?"
  - "Wo ist der Zugang zum Kalender hinterlegt, und wann läuft er ab?"
  - "Warum wird das Modell nur zum Formulieren benutzt und nicht zum Sortieren?"
  - "Was tue ich, wenn die Nachricht morgens nicht kommt?"
rechts:
  - "Anleitung"
  - "Betriebshandbuch"
  - "Entwurfsnotiz"
  - "Anleitung und Betriebshandbuch: Nutzer melden, Betreiber beheben"
loesung:
  "Wie lasse ich mir die Termine für eine andere Woche schicken?": "Anleitung"
  "Wo ist der Zugang zum Kalender hinterlegt, und wann läuft er ab?": "Betriebshandbuch"
  "Warum wird das Modell nur zum Formulieren benutzt und nicht zum Sortieren?": "Entwurfsnotiz"
  "Was tue ich, wenn die Nachricht morgens nicht kommt?": "Anleitung und Betriebshandbuch: Nutzer melden, Betreiber beheben"
richtzeit_s: 90
erklaerung: |
  Benutzen, betreiben, weiterbauen - drei Leser mit verschiedenen Fragen.
  Der Ausfall steht in beiden ersten Dokumenten, aus zwei Blickwinkeln:
  wen der Nutzer benachrichtigt und was der Betreiber dann tut.
```

## Was nicht in die Dokumentation gehört

Eine Stelle, an der Geheimnisse besonders gern landen (Stufe 5, Lektion 1), ist
die Dokumentation: „Der Zugang ist …", direkt hineingeschrieben, damit es der
Nachfolger leichter hat. Richtig ist: Die Dokumentation sagt, **wo** der Zugang
liegt und **wer** ihn verwalten darf — nie, wie er lautet.

```aufgabe
id: E6-15
typ: denkaufgabe
titel: "Die hilfreiche Zeile"
punkte: 25
frage: "Welche Zeile gehört so in ein Betriebshandbuch?"
optionen:
  - "Kalenderzugang: Passwort steht unten, damit es jeder findet."
  - "Kalenderzugang: im Passwortmanager des Teams unter „Kalender-Bot“, verwaltet von der IT."
  - "Kalenderzugang: frag mich einfach."
  - "Kalenderzugang: derselbe wie für alles andere."
loesung: "Kalenderzugang: im Passwortmanager des Teams unter „Kalender-Bot“, verwaltet von der IT."
richtzeit_s: 50
erklaerung: |
  Ort und Zuständigkeit - aber nicht das Geheimnis selbst. „Frag mich" fällt
  durch den Lastwagen-Test, und „derselbe wie für alles" ist ein geteilter
  Schlüssel, den Stufe 5 verboten hat.
```

## Kurz schlägt vollständig

Dokumentation, die niemand liest, ist keine. Die Faustregel: **Die Anleitung
passt auf eine Seite, das Betriebshandbuch auf zwei.** Was länger ist, wird
nicht gelesen, sondern überflogen — und dann fehlt gerade der eine Satz, der
gebraucht wurde. Das ist dieselbe Grenze wie im 7. Kurs: zwei Seiten, weil man
mehr nicht behält.

```aufgabe
id: E6-16
typ: planung
titel: "Deine Anleitung"
punkte: 40
frage: "Schreibe die Anleitung für deine Lösung: wozu sie da ist, wie man sie benutzt und was man tut, wenn etwas nicht klappt. Höchstens eine Seite, mindestens 60 Wörter."
pruefungen:
  - art: mindestens_woerter
    wert: 60
    punkte: 10
    begruendung: "Mindestens 60 Wörter."
  - art: hoechstens_woerter
    wert: 400
    punkte: 10
    begruendung: "Höchstens 400 Wörter — eine Seite."
  - art: enthaelt_eines
    werte: [wozu, dient, ist dafür da, hilft, damit]
    punkte: 10
    begruendung: "Du sagst, wozu die Lösung da ist."
  - art: enthaelt_eines
    werte: [wenn etwas nicht, falls, fehler, klappt nicht, melde, kontakt]
    punkte: 10
    begruendung: "Du sagst, was im Fehlerfall zu tun ist."
richtzeit_s: 600
erklaerung: |
  Eine Anleitung, die diese drei Fragen auf einer Seite beantwortet, ist
  besser als zwanzig Seiten, die alles erklären. Gib sie der Person aus
  deinem Test mit Menschen - sie merkt sofort, was fehlt.
```
