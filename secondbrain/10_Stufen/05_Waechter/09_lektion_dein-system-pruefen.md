---
type: lesson
title: "Dein System prüfen"
description: "Der Systementwurf aus Stufe 4, diesmal mit den Augen eines Angreifers und einer Datenschützerin: ein Bedrohungsmodell in vier Fragen."
tags:
  - lesson
  - stufe-5
  - projekt
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 5
dauer_min: 30
---

# Dein System prüfen

## „Sicher" gegen wen?

Auf der Kursseite steht: Nach dieser Stufe kannst du begründen, **warum eine
Maßzahl wie „sicher" ohne Angriffsmodell nichts bedeutet.** Ein Tresor ist
sicher gegen einen Dieb mit Schraubenzieher und unsicher gegen einen mit
Schweißgerät. Ein System ist nie einfach sicher — es ist sicher **gegen
bestimmte Angriffe**, und die muss man benennen.

Dieses Benennen heißt **Bedrohungsmodell**. Es klingt nach Fachabteilung, ist
aber im Kern vier Fragen, die du an deinen Entwurf aus Stufe 4, Lektion 9
stellst.

## Die vier Fragen

| Frage | Worauf du schaust | aus Lektion |
|---|---|---|
| **1. Was ist schützenswert?** | Geheimnisse, personenbezogene Daten, Geld, Ruf | 1, 7 |
| **2. Wo kommt fremder Text herein?** | Jeder Eingang, jede gelesene Datei, jede Webseite | 3 |
| **3. Was kann jeder Teil im schlimmsten Fall anrichten?** | Rechte je Agent, unumkehrbare Aktionen | 4, 6 |
| **4. Wohin fließen Daten nach außen?** | Modellanbieter, Protokolle, Dienste | 1, 8 |

Für jede Antwort gilt dieselbe Gegenfrage: **Was hält es auf, wenn das Modell
sich irren oder überreden lassen sollte?** Steht dort nur „der Systemprompt",
fehlt eine Sicherung.

```aufgabe
id: E5-24
typ: uebereinstimmung
titel: "Frage und Befund"
punkte: 30
frage: "Ordne jedem Befund aus einer Prüfung die Frage zu, die ihn aufgedeckt hat."
links:
  - "Der Rechnungsagent darf Überweisungen ohne Freigabe ausführen"
  - "Der Agent liest Webseiten von Lieferanten und folgt Links darin"
  - "Kundennamen gehen ungekürzt an einen Modellanbieter außerhalb der EU"
  - "Im Zustand liegen Gesundheitsangaben aus Krankmeldungen"
rechts:
  - "Was kann jeder Teil im schlimmsten Fall anrichten?"
  - "Wo kommt fremder Text herein?"
  - "Wohin fließen Daten nach außen?"
  - "Was ist schützenswert?"
loesung:
  "Der Rechnungsagent darf Überweisungen ohne Freigabe ausführen": "Was kann jeder Teil im schlimmsten Fall anrichten?"
  "Der Agent liest Webseiten von Lieferanten und folgt Links darin": "Wo kommt fremder Text herein?"
  "Kundennamen gehen ungekürzt an einen Modellanbieter außerhalb der EU": "Wohin fließen Daten nach außen?"
  "Im Zustand liegen Gesundheitsangaben aus Krankmeldungen": "Was ist schützenswert?"
richtzeit_s: 90
erklaerung: |
  Jede Frage findet eine andere Sorte Schwachstelle. Wer nur eine stellt -
  meistens die nach Passwörtern -, übersieht die anderen drei.
```

## Erkennen, nicht ausnutzen

Die Kursseite sagt es gleich zu Beginn: Diese Stufe zeigt, **woran man eine
Lücke sieht**. Sie liefert keine Anleitung zum Angriff. Das gilt auch für deine
eigene Prüfung: Du prüfst deinen Entwurf auf dem Papier und an Attrappen. Ein
fremdes System prüfst du nur mit ausdrücklichem Auftrag seines Betreibers —
alles andere ist kein Test, sondern ein Angriff, und strafbar.

```aufgabe
id: E5-25
typ: denkaufgabe
titel: "Darf ich das testen?"
punkte: 20
frage: "Dir fällt auf, dass der Chatbot eines Onlineshops vielleicht für Prompt-Injection anfällig ist. Was ist der richtige Weg?"
optionen:
  - "Ausprobieren, ob man ihm Rabattcodes entlocken kann, und das Ergebnis veröffentlichen"
  - "Den Shop über einen offiziellen Kontakt auf den Verdacht hinweisen, ohne ihn auszunutzen"
  - "Den Verdacht in sozialen Netzwerken mit Anleitung teilen, damit andere es prüfen"
  - "Nichts tun, das ist nicht mein Problem"
loesung: "Den Shop über einen offiziellen Kontakt auf den Verdacht hinweisen, ohne ihn auszunutzen"
richtzeit_s: 45
erklaerung: |
  Melden statt ausnutzen. Viele Betriebe haben dafür eine eigene Adresse. Wer
  ohne Auftrag testet oder eine Anleitung verbreitet, richtet Schaden an -
  auch wenn er es gut meint.
```

## Deine Prüfung

```aufgabe
id: E5-26
typ: planung
titel: "Dein Bedrohungsmodell"
punkte: 60
frage: "Nimm deinen Systementwurf aus Stufe 4 (oder ein anderes System aus deinem Umfeld) und beantworte die vier Fragen. Nenne für mindestens eine Schwachstelle eine Sicherung, die außerhalb des Modells greift. Mindestens 120 Wörter."
pruefungen:
  - art: mindestens_woerter
    wert: 120
    punkte: 10
    begruendung: "Mindestens 120 Wörter."
  - art: enthaelt_eines
    werte: [schützenswert, schützen, personenbezogen, geheimnis, geld, vertraulich]
    punkte: 10
    begruendung: "Du sagst, was schützenswert ist."
  - art: enthaelt_eines
    werte: [fremder text, eingang, injection, webseite, dokument, mail]
    punkte: 10
    begruendung: "Du nennst, wo fremder Text hereinkommt."
  - art: enthaelt_eines
    werte: [rechte, darf, schlimmsten, unumkehrbar, löschen, überweisen]
    punkte: 10
    begruendung: "Du prüfst, was ein Teil im schlimmsten Fall anrichten kann."
  - art: enthaelt_eines
    werte: [anbieter, nach außen, übermittelt, drittland, pseudonym, abfluss]
    punkte: 10
    begruendung: "Du sagst, wohin Daten nach außen fließen."
  - art: enthaelt_eines
    werte: [freigabe, nur lesen, feste liste, protokoll, sperre, weniger rechte, platzhalter]
    punkte: 10
    begruendung: "Du nennst eine Sicherung außerhalb des Modells."
richtzeit_s: 1200
erklaerung: |
  Ein Bedrohungsmodell ist nie fertig - es wird bei jeder Änderung des
  Systems neu gestellt. In Stufe 6 baust du ein System, das jemand anderes
  benutzt; dann ist diese Prüfung ein fester Schritt vor dem Betrieb.
```
