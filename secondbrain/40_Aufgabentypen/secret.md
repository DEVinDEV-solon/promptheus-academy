---
type: reference
title: "Secret-Aufgabe"
description: "Verstecktes finden — im Stil von Capture the Flag."
tags:
  - reference
  - aufgabentyp
  - secret
timestamp: 2026-08-18T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Secret-Aufgabe

`typ: secret`

In einem Textausschnitt steckt eine Zeichenkette im Format `PROMPTHEUS{…}`.

**Wofür er taugt:** genau hinsehen. Und begreifen, wie leicht ein Geheimnis irgendwo landet, wo es nicht hingehört — in einem Protokoll, einer Fehlermeldung, einem Screenshot.

**Alle Geheimnisse sind Attrappen.** Der Parser bricht ab, wenn eine Lösung nicht mit `PROMPTHEUS{` beginnt. Ein echter Schlüssel in einer Übungsaufgabe würde genau das lehren, was Stufe 5 verbietet.

Bewertet wird nachsichtig — Groß- und Kleinschreibung egal, Leerraum getrimmt. Geprüft wird, ob jemand das Geheimnis **gefunden** hat, nicht ob er es fehlerfrei abschreiben kann.

## Felder

```yaml
id: X1-01
typ: secret
titel: "…"
punkte: 20
dump: |
  2026-08-18 12:03 INFO  Verbindung aufgebaut
  2026-08-18 12:03 DEBUG token=PROMPTHEUS{log_ist_kein_tresor}
loesung: "PROMPTHEUS{log_ist_kein_tresor}"
```

## Bewertung

Zeichenkettenvergleich, getrimmt, ohne Rücksicht auf Groß- und Kleinschreibung.

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
