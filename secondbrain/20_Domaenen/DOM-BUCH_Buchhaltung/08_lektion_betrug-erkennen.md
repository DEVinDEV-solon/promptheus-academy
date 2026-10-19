---
type: lesson
title: "Betrug erkennen"
description: "Neue Bankverbindung per Mail, Rechnung für einen nie bestellten Eintrag, Eilüberweisung kurz vor Feierabend: Die Buchhaltung ist das Ziel, weil sie Geld bewegt. Feste Abläufe schützen besser als Misstrauen."
tags:
  - lesson
  - domaene
  - dom-buch
  - sicherheit
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 14
---

# Betrug erkennen

## Warum die Buchhaltung das Ziel ist

Wer Geld will, geht dorthin, wo Geld bewegt wird. Die häufigsten Maschen
kennst du teilweise aus dem Fachkurs Sicherheit, hier in ihrer Form für die
Buchhaltung:

- **Geänderte Bankverbindung:** Eine täuschend echte Mail „vom Lieferanten“
  teilt eine neue IBAN mit. Mit Sprachmodellen sind solche Mails fehlerfrei.
- **Rechnungen für nie Bestelltes:** etwa für den Eintrag in ein angebliches
  Register oder Branchenbuch, aufgemacht wie eine amtliche Gebühr.
- **Druck von oben:** eine weitergeleitete „dringende“ Zahlungsbitte der
  Geschäftsführung, kurz vor Feierabend.

```aufgabe
id: D8-19
typ: quizkarten
titel: "Unauffällig oder Warnzeichen?"
punkte: 30
frage: "Ist der Vorgang unauffällig, oder ein Warnzeichen?"
karten:
  - "Ein Lieferant teilt per Mail mit, dass ab sofort eine neue Bankverbindung gilt"
  - "Eine Rechnung für einen Registereintrag, den niemand bestellt hat"
  - "Die Monatsmiete in gleicher Höhe wie immer"
  - "Eine dringende Zahlungsbitte der Chefin um 17.45 Uhr, bitte vertraulich"
  - "Der Stromabschlag wie im Vertrag vereinbart"
stapel: [unauffällig, Warnzeichen]
loesung:
  "Ein Lieferant teilt per Mail mit, dass ab sofort eine neue Bankverbindung gilt": Warnzeichen
  "Eine Rechnung für einen Registereintrag, den niemand bestellt hat": Warnzeichen
  "Die Monatsmiete in gleicher Höhe wie immer": unauffällig
  "Eine dringende Zahlungsbitte der Chefin um 17.45 Uhr, bitte vertraulich": Warnzeichen
  "Der Stromabschlag wie im Vertrag vereinbart": unauffällig
richtzeit_s: 75
erklaerung: |
  Die Warnzeichen haben eines gemeinsam: Sie weichen vom gewohnten Weg ab.
  Eine Regel kann das erkennen - neue Bankverbindung, unbekannter Absender,
  keine Bestellung - und den Vorgang anhalten, bis ein Mensch geprüft hat.
```

## Der feste Ablauf für neue Bankverbindungen

```aufgabe
id: D8-20
typ: schiebe
titel: "Eine neue IBAN"
punkte: 25
frage: "Ein Lieferant teilt eine neue Bankverbindung mit. Bring die Schritte in die richtige Reihenfolge."
bausteine:
  - "Eine zweite Person ändert die Stammdaten und bestätigt die Änderung"
  - "Die Mitteilung als Prüffall markieren, nichts übernehmen"
  - "Den Vorgang mit Datum und Gesprächspartner dokumentieren"
  - "Beim Lieferanten über die bekannte Nummer aus den Stammdaten zurückrufen"
loesung:
  - "Die Mitteilung als Prüffall markieren, nichts übernehmen"
  - "Beim Lieferanten über die bekannte Nummer aus den Stammdaten zurückrufen"
  - "Eine zweite Person ändert die Stammdaten und bestätigt die Änderung"
  - "Den Vorgang mit Datum und Gesprächspartner dokumentieren"
richtzeit_s: 60
erklaerung: |
  Nie die Nummer aus der Mail anrufen - die gehört womöglich dem Betrüger.
  Vier Augen bei der Änderung und eine Notiz für die Nachvollziehbarkeit
  (Lektion 7) schließen den Ablauf.
```
