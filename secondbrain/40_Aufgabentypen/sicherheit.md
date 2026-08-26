---
type: reference
title: "Sicherheits-Aufgabe"
description: "Schwachstellen erkennen."
tags:
  - reference
  - aufgabentyp
  - sicherheit
timestamp: 2026-08-18T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Sicherheits-Aufgabe

`typ: sicherheit`

Ein Stück Code mit Zeilennummern. Angeklickt werden die Zeilen mit der Schwachstelle.

**Wofür er taugt:** Prompt-Injection, ein Schlüssel im Quelltext, eine fehlende Prüfung.

**Erkennen, nicht ausnutzen.** Die Academy zeigt, woran man eine Lücke sieht — sie liefert keine Anleitung zum Angriff. Das ist keine Zimperlichkeit: wer die Lücke erkennt, schließt sie; wer nur den Angriff kennt, kann bloß angreifen.

## Felder

```yaml
id: X1-01
typ: sicherheit
titel: "…"
punkte: 20
code: |
  $key = "sk-ant-1234";
  $antwort = frage_modell($_GET['frage']);
  echo $antwort;
zeilen: [1, 2, 3]
```

## Bewertung

Mengengleichheit der Zeilennummern. Eine leere Auswahl ist immer falsch.

## Immer erlaubt

```yaml
frage: "…"              # Fragetext über der Bedienung
richtzeit_s: 90          # ab hier gibt es Schnelligkeitsbonus
hinweise:
  - text: "…"
    kostet: 5
erklaerung: |
  Warum die Lösung stimmt. Erscheint nach der Abgabe.
quelle: "[[90_Quellen/…]]"
```

Siehe auch [[Autorenleitfaden]] und [[Prüfungsordnung]].
