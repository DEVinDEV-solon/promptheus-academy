---
type: lesson
title: "Zahlungen und Abgleich"
description: "Skonto nutzen, Zahlungseingänge zuordnen, Zahlungen im Vier-Augen-Prinzip freigeben. Ein Werkzeug findet den passenden offenen Posten, aber nur ein eindeutiger Treffer wird automatisch ausgeglichen."
tags:
  - lesson
  - domaene
  - dom-buch
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 14
---

# Zahlungen und Abgleich

## Skonto ist Geld

Die Rechnung ist geprüft (Lektion 4). Jetzt wird bezahlt, und zwar am besten
rechtzeitig: Viele Lieferanten gewähren **Skonto**, einen Abzug bei Zahlung
innerhalb weniger Tage. Ein Werkzeug kann die Skontofristen überwachen und
die Zahlungen so vorschlagen, dass keine verfällt. Freigegeben wird die
Zahlung von Menschen, bei größeren Beträgen von zweien.

```aufgabe
id: D8-12
typ: mathe
titel: "Mit Skonto bezahlen"
punkte: 25
frage: "Eine Rechnung über 2.380,00 Euro brutto gewährt 2 Prozent Skonto bei Zahlung innerhalb von 10 Tagen. Welcher Betrag wird überwiesen, wenn das Skonto genutzt wird?"
loesung: 2332.40
toleranz: 0.01
einheit: "Euro"
richtzeit_s: 80
erklaerung: |
  2 Prozent von 2.380 sind 47,60 Euro, überwiesen werden 2.332,40 Euro. Auf
  das Jahr gerechnet ist Skonto oft günstiger als jeder Kredit - verpasste
  Skontofristen kosten viele Betriebe mehr, als sie denken.
```

## Zahlungseingänge zuordnen

Umgekehrt kommen Zahlungen herein, und nicht jede trägt eine saubere
Rechnungsnummer. „Rg März danke" reicht dem Kunden, der Buchhaltung nicht.
Ein Werkzeug sucht passende **offene Posten** und schlägt eine Zuordnung vor.
Eindeutig heißt: genau ein Treffer bei Betrag und Kunde.

```aufgabe
id: D8-13
typ: denkaufgabe
mehrfach: true
titel: "„Rg März danke“"
punkte: 30
frage: "Ein Kunde überweist 1.190 Euro mit dem Verwendungszweck „Rg März danke“. Wie sollte das Werkzeug vorgehen? Mehrere Antworten sind richtig."
optionen:
  - "Offene Posten dieses Kunden mit genau 1.190 Euro suchen"
  - "Bei genau einem Treffer die Zuordnung vorschlagen oder ausgleichen"
  - "Bei mehreren Treffern die Zahlung einem Menschen vorlegen"
  - "Den ältesten offenen Posten des Kunden automatisch ausgleichen, egal welcher Betrag"
  - "Die Zahlung auf ein Sammelkonto buchen und nicht weiter verfolgen"
loesung:
  - "Offene Posten dieses Kunden mit genau 1.190 Euro suchen"
  - "Bei genau einem Treffer die Zuordnung vorschlagen oder ausgleichen"
  - "Bei mehreren Treffern die Zahlung einem Menschen vorlegen"
richtzeit_s: 80
erklaerung: |
  Suchen, bei eindeutigem Treffer zuordnen, bei Zweifel vorlegen. Eine
  falsche Zuordnung führt zur Mahnung einer bezahlten Rechnung - und das
  ärgert gerade die Kunden, die pünktlich zahlen.
```
