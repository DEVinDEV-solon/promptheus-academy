---
type: lesson
title: "Mensch oder Maschine?"
description: "Woran man KI-Text erkennt, warum Detektoren nicht taugen, und was stattdessen hilft."
tags:
  - lesson
  - stufe-1
  - erkennung
  - quellenkritik
timestamp: 2026-08-18T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 1
dauer_min: 12
---

# Mensch oder Maschine?

## Das Spiel, das jeder spielen will

„Ist das von einer KI?" — die Frage stellt sich inzwischen bei Hausaufgaben,
Bewerbungen, Bewertungen und Nachrichten. Die ehrliche Antwort lautet
meistens: **man weiß es nicht sicher.** Diese Lektion erklärt, warum, und was
trotzdem hilft.

## Was auffällt (und warum es trügt)

Typische Merkmale von KI-Text:

- gleichmäßig lange Sätze, wenig Rhythmuswechsel
- Aufzählungen, wo ein Mensch einen Absatz schriebe
- „Es ist wichtig zu beachten, dass …", „Zusammenfassend lässt sich sagen …"
- keine konkreten Einzelheiten: keine Namen, keine Zahlen, keine Anekdote
- makellose Rechtschreibung bei gleichzeitig unscharfem Inhalt

Der Haken: **jedes dieser Merkmale hat auch ein sorgfältiger Mensch**, der ein
Formular ausfüllt. Und ein Mensch, der einen KI-Entwurf überarbeitet, hat
keines mehr.

## Warum KI-Detektoren nicht taugen

Programme, die KI-Text erkennen wollen, machen zwei Fehler — und zwar den
zweiten systematisch:

**Falscher Alarm.** Menschlicher Text wird als KI markiert. Das trifft
besonders oft Menschen, die in einer Fremdsprache schreiben: ihr Text ist
einfacher gebaut und vorhersagbarer. Genau das misst der Detektor.

**Übersehen.** KI-Text wird nicht erkannt. Ein paar Wörter umstellen genügt oft.

Für eine Schule heißt das: **ein Detektor ist keine Grundlage für einen
Vorwurf.** Er behauptet Sicherheit, wo keine ist, und trifft am härtesten die,
die ohnehin schon benachteiligt sind.

```aufgabe
id: E1-12
typ: denkaufgabe
titel: "Der Detektor schlägt an"
punkte: 30
frage: "Ein Detektor meldet für den Aufsatz einer Schülerin „98 % KI-generiert“. Was ist ein angemessener Umgang damit?"
mehrfach: true
optionen:
  - "Das Ergebnis ist ein Hinweis, kein Beweis — es rechtfertigt ein Gespräch, keine Note."
  - "98 % bedeutet, dass zu 98 % feststeht, dass sie geschummelt hat."
  - "Detektoren melden bei Schreibenden in einer Fremdsprache besonders oft falschen Alarm."
  - "Wer nichts zu verbergen hat, kann seine Entwürfe zeigen — der Vorwurf ist also fair."
loesung:
  - "Das Ergebnis ist ein Hinweis, kein Beweis — es rechtfertigt ein Gespräch, keine Note."
  - "Detektoren melden bei Schreibenden in einer Fremdsprache besonders oft falschen Alarm."
richtzeit_s: 90
hinweise:
  - text: "Zwei Aussagen sind richtig. Überlege bei „98 %“, worauf sich diese Zahl eigentlich bezieht."
    kostet: 8
erklaerung: |
  "98 %" ist die Ausgabe eines Modells, keine Wahrscheinlichkeit einer
  Täuschung. Und die letzte Antwort dreht die Beweislast um: wer einen
  Vorwurf erhebt, muss ihn belegen - nicht der Beschuldigte seine Unschuld.
```

## Was wirklich hilft: Herkunft statt Erkennung

Statt im Nachhinein zu raten, kann man beim Erzeugen einen Nachweis anlegen.
Zwei Wege, beide aus dem Wissensspeicher `21_Wasserzeichen`:

**Wasserzeichen im Text.** Beim Ziehen des nächsten Tokens wird die Auswahl
leicht gelenkt — statistisch nachweisbar, für Leser unsichtbar. Erinnerst du
dich an die Wahlfreiheit aus Lektion 3? Genau dort steckt der Nachweis. Wo
keine Wahl ist, geht auch kein Wasserzeichen hinein: in einer IBAN, einem
Zitat, einer Jahreszahl.

**Content Credentials (C2PA).** Der Nachweis hängt nicht am Text, sondern an
der Datei: wer sie erzeugt hat, womit, wann. Kryptografisch signiert.
Schwachstelle ist ebenso offensichtlich — einmal kopieren und einfügen, und
die Signatur ist weg.

Beide Verfahren sagen dir, **woher etwas kommt**, wenn es einen Nachweis gibt.
Keines sagt dir, ob ein Text ohne Nachweis von einer KI stammt. Das ist kein
Mangel der Verfahren, sondern die Natur der Sache.

```aufgabe
id: E1-13
typ: uebereinstimmung
titel: "Zwei Wege, eine Frage"
punkte: 25
frage: "Ordne jedem Ansatz seine wichtigste Schwäche zu."
links: [Detektor, Wasserzeichen, C2PA]
rechts:
  - "Behauptet Sicherheit, die es nicht gibt — und trifft die Falschen"
  - "Braucht Wahlfreiheit im Text; bei Zahlen und Zitaten geht nichts hinein"
  - "Geht beim Kopieren und Einfügen verloren"
loesung:
  Detektor: "Behauptet Sicherheit, die es nicht gibt — und trifft die Falschen"
  Wasserzeichen: "Braucht Wahlfreiheit im Text; bei Zahlen und Zitaten geht nichts hinein"
  C2PA: "Geht beim Kopieren und Einfügen verloren"
richtzeit_s: 80
erklaerung: |
  Kein Verfahren löst das Problem allein. Deshalb ist die brauchbarste
  Haltung nicht "Ist das KI?", sondern "Woher kommt das, und kann ich es
  prüfen?" - eine Frage, die schon vor der KI die richtige war.
quelle: "[[90_Quellen/wasserzeichen/watermarking-verfahren-uebersicht]]"
```

## Die Frage, die weiterhilft

Nicht: *Ist das von einer KI?*

Sondern: **Stimmt es? Und woran kann ich das prüfen?**

Ein KI-Text mit belegbaren Angaben ist brauchbarer als ein menschlicher Text
ohne. Und ein erfundener Beleg ist ein erfundener Beleg — gleich, wer ihn
aufgeschrieben hat.

```aufgabe
id: E1-14
typ: planung
titel: "Deine Prüfregel"
punkte: 40
frage: "Du bekommst einen Text mit drei Behauptungen und Quellenangaben, von dem du nicht weißt, ob eine KI beteiligt war. Schreibe in mindestens 30 Wörtern, wie du vorgehst."
pruefungen:
  - art: enthaelt_eines
    werte: [pruef, überprüf, nachschlag, nachprüf, verifizier, kontrollier]
    punkte: 15
    begruendung: "Du sagst, dass du die Angaben nachprüfst — das ist der Kern."
  - art: enthaelt_eines
    werte: [quelle, fundstelle, beleg, original]
    punkte: 10
    begruendung: "Du nimmst dir die Quellen selbst vor, nicht nur den Text."
  - art: mindestens_woerter
    wert: 30
    punkte: 5
    begruendung: "Mindestens 30 Wörter — ein Vorgehen braucht mehr als einen Halbsatz."
  - art: enthaelt_nicht
    werte: [detektor, "ki-detektor", erkennungstool]
    punkte: 10
    begruendung: "Du verlässt dich NICHT auf einen Detektor. Warum, steht in dieser Lektion."
richtzeit_s: 300
hinweise:
  - text: "Denk an den letzten Abschnitt: nicht „Ist das KI?“, sondern „Stimmt es?“"
    kostet: 8
erklaerung: |
  Es gibt keine Musterlösung - aber es gibt eine falsche Antwort, nämlich
  "ich lasse einen Detektor drüberlaufen". Alles andere ist eine Frage
  deines Vorgehens, und das prüft die Academy an dem, was du aufschreibst.
```
