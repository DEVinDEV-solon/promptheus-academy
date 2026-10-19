---
type: lesson
title: "Die Frage schärfen"
description: "Eine gute Kernfrage ist der billigste Teil eines Auftrags und der teuerste, wenn er fehlt. Das Modell hilft beim Sammeln, nicht beim Festlegen."
tags:
  - lesson
  - domaene
  - dom-ber
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 14
---

# Die Frage schärfen

## Der Auftrag ist noch keine Frage

„Schauen Sie sich mal unseren Vertrieb an.“ So beginnen viele Aufträge.
Das ist ein Thema, keine Frage. Wer damit losrecherchiert, findet alles und
beantwortet nichts.

Eine **Kernfrage** hat drei Eigenschaften:

1. **Sie ist entscheidbar.** Am Ende steht eine Antwort, mit der der Kunde
   etwas tun kann.
2. **Sie ist abgegrenzt.** Es ist klar, was *nicht* dazugehört.
3. **Sie hat einen Maßstab.** Woran misst man, ob die Antwort gut ist —
   Umsatz, Kosten, Zeit, Zufriedenheit?

```aufgabe
id: D5-06
typ: denkaufgabe
titel: "Welche Frage taugt?"
punkte: 25
frage: "Welche dieser Formulierungen ist eine brauchbare Kernfrage für einen Beratungsauftrag?"
optionen:
  - "Wie können wir im Vertrieb besser werden?"
  - "Was sagt die KI zu unserem Vertrieb?"
  - "Sollen wir den Außendienst in Region Nord bis Mitte 2027 durch Telefonvertrieb ersetzen, gemessen an Kosten je Abschluss?"
  - "Welche Trends gibt es im Vertrieb?"
loesung: "Sollen wir den Außendienst in Region Nord bis Mitte 2027 durch Telefonvertrieb ersetzen, gemessen an Kosten je Abschluss?"
richtzeit_s: 60
erklaerung: |
  Nur diese Frage ist entscheidbar (ja oder nein), abgegrenzt (Region Nord,
  bis Mitte 2027) und hat einen Maßstab (Kosten je Abschluss). Die anderen
  sind Themen - man kann ewig daran arbeiten, ohne fertig zu werden.
```

## Hypothesen: was wir vermuten, bevor wir suchen

Gute Berater recherchieren nicht ins Blaue. Sie schreiben vorher auf, was
sie **vermuten** — und suchen dann gezielt nach Belegen dafür *und
dagegen*. Das spart Zeit und schützt vor einer Falle: Wer keine Hypothese
aufschreibt, merkt nicht, dass er nur noch Bestätigung sucht.

Hier ist ein Modell ein guter Helfer. Es kennt viele typische Ursachen und
schlägt in Sekunden zwanzig Hypothesen vor. **Auswählen** musst du: Welche
drei passen zu diesem Kunden, und welche lassen sich überhaupt prüfen?

```aufgabe
id: D5-07
typ: plugplay
titel: "Prüfbare Hypothesen"
punkte: 30
frage: "Ein Modell schlägt Hypothesen vor, warum die Kosten je Abschluss in Region Nord gestiegen sind. Wähle die aus, die sich mit Daten prüfen lassen."
bausteine:
  - "Die Fahrzeiten im Außendienst sind seit 2024 gestiegen."
  - "Das Team ist einfach nicht motiviert genug."
  - "Der Anteil kleiner Aufträge unter 1.000 Euro hat zugenommen."
  - "Die Konkurrenz ist irgendwie besser geworden."
  - "Seit der Preiserhöhung im März brechen mehr Angebote ab."
loesung:
  - "Die Fahrzeiten im Außendienst sind seit 2024 gestiegen."
  - "Der Anteil kleiner Aufträge unter 1.000 Euro hat zugenommen."
  - "Seit der Preiserhöhung im März brechen mehr Angebote ab."
richtzeit_s: 90
hinweise:
  - text: "Kannst du dir eine Tabelle vorstellen, die die Aussage bestätigt oder widerlegt?"
    kostet: 5
erklaerung: |
  Fahrzeiten, Auftragsgrößen und Abbruchquoten stehen in Daten, die es
  gibt. „Nicht motiviert genug“ und „irgendwie besser“ kann man glauben,
  aber nicht prüfen - sie gehören nicht in die Hypothesenliste.
```

## Die Auftragsklärung schriftlich

Was du mit dem Kunden geklärt hast, schreibst du auf — als kurze
**Auftragsklärung**. Sie ist später auch der beste Kontext für jedes Modell,
das du im Auftrag einsetzt: der fünfte Baustein aus Stufe 2, nur diesmal
für ein ganzes Projekt.

```aufgabe
id: D5-08
typ: planung
titel: "Deine Auftragsklärung"
punkte: 40
frage: "Schreibe eine Auftragsklärung für einen erdachten Kunden. Nenne die Kernfrage, den Maßstab, was ausdrücklich nicht dazugehört, und mindestens eine Hypothese. Mindestens 50 Wörter."
pruefungen:
  - art: mindestens_woerter
    wert: 50
    punkte: 10
    begruendung: "Mindestens 50 Wörter."
  - art: enthaelt_eines
    werte: [kernfrage, frage lautet, wir klären, soll]
    punkte: 10
    begruendung: "Du nennst die Kernfrage."
  - art: enthaelt_eines
    werte: [nicht dazu, nicht teil, ausgenommen, nicht betrachtet, ausgeschlossen, abgrenzung, nicht untersucht]
    punkte: 10
    begruendung: "Du grenzt ab, was nicht dazugehört."
  - art: enthaelt_eines
    werte: [hypothese, vermut, annahme]
    punkte: 10
    begruendung: "Du nennst mindestens eine Hypothese."
richtzeit_s: 420
erklaerung: |
  Eine halbe Seite Auftragsklärung erspart Wochen in der falschen Richtung.
  Und sie ist der Text, an dem du später jede Rechercheaufgabe misst: Hilft
  das, die Kernfrage zu beantworten? Wenn nicht, gehört es nicht in den
  Auftrag.
```
