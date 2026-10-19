---
type: lesson
title: "Handel — Einstieg"
description: "Im Handel wird jeden Tag hundertfach entschieden: was bestellt wird, was es kostet, was zurückgeht. Welche dieser Entscheidungen darf ein Werkzeug vorbereiten?"
tags:
  - lesson
  - domaene
  - dom-hdl
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 10
---

# Handel — Einstieg

## Die Frage, die in jeder Domäne zuerst kommt

Nicht „Was kann KI hier tun?", sondern: **Welche Entscheidung wird hier
getroffen, und was passiert, wenn sie falsch ist?**

Im Handel sind es viele kleine Entscheidungen statt weniger großer. Wie viel
bestelle ich nach? Was kostet der Artikel ab Montag? Nehme ich diese Rücksendung
an? Jede einzelne ist klein. Falsch getroffen, tausendfach wiederholt, kostet
sie Geld: volle Lager mit Ware, die niemand will, leere Regale bei der Ware,
die alle wollen.

Ein Vorschlag, den ein Mensch prüft, ist etwas anderes als eine Entscheidung,
die durchläuft. Das hast du in Stufe 3 als **Freigabe** kennengelernt. In
diesem Kurs wendest du es auf den Handel an.

```aufgabe
id: D1-01
typ: denkaufgabe
titel: "Vorschlag oder Entscheidung?"
punkte: 20
frage: "Ein KI-System arbeitet im Bereich Handel. Wann ist es unbedenklich, wann braucht es eine menschliche Freigabe?"
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

## Was laufen darf und was nicht

Nicht jeder Schritt braucht eine Unterschrift. Den Tagesumsatz der Kasse in
die Warenwirtschaft zu übertragen, ist eine Rechnung ohne Ermessen, die darf
laufen. Den Preis eines Artikels um ein Drittel zu senken, ist eine
Entscheidung mit Folgen für Marge, Kundschaft und Wettbewerb. Die gehört
einem Menschen, auch wenn ein Werkzeug sie gut vorbereitet hat.

Die Faustregel für den ganzen Kurs: **Was sich ohne Ermessen nachrechnen
lässt, darf eine Regel erledigen. Was Geld, Kundschaft oder Recht berührt und
Ermessen braucht, ist ein Vorschlag, den ein Mensch freigibt.**

```aufgabe
id: D1-02
typ: quizkarten
titel: "Laufen lassen oder freigeben?"
punkte: 25
frage: "Lege jede Karte auf den passenden Stapel: Darf der Schritt automatisch laufen, oder ist er ein Vorschlag, den ein Mensch freigibt?"
karten:
  - "Tagesumsatz der Kasse in die Warenwirtschaft übertragen"
  - "Preis eines Artikels um 30 Prozent senken"
  - "Einer Kundin eine Kulanzgutschrift über 80 Euro geben"
  - "Bestellvorschlag erzeugen, weil der Meldebestand unterschritten ist"
  - "Lagerbestand nach der Inventur dauerhaft korrigieren"
stapel: [läuft automatisch, Mensch gibt frei]
loesung:
  "Tagesumsatz der Kasse in die Warenwirtschaft übertragen": läuft automatisch
  "Preis eines Artikels um 30 Prozent senken": Mensch gibt frei
  "Einer Kundin eine Kulanzgutschrift über 80 Euro geben": Mensch gibt frei
  "Bestellvorschlag erzeugen, weil der Meldebestand unterschritten ist": läuft automatisch
  "Lagerbestand nach der Inventur dauerhaft korrigieren": Mensch gibt frei
richtzeit_s: 80
hinweise:
  - text: "Ein Vorschlag erzeugen ist etwas anderes als ihn ausführen."
    kostet: 5
erklaerung: |
  Übertragen und Vorschlagen sind Rechnungen ohne Ermessen - der Vorschlag
  wird ja erst noch geprüft. Preis, Kulanz und Inventurkorrektur verändern
  Geld oder Bestand dauerhaft. Dort steht am Ende ein Mensch.
```

In den nächsten Lektionen gehst du den Weg einer Ware einmal ganz durch: von
den Daten an der Kasse über Prognose, Bestellung und Preis bis zu Retoure und
Einkauf. An jeder Station fragst du, was eine Regel, was ein Modell und was
nur ein Mensch tun darf.
