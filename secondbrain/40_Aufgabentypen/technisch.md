---
type: reference
title: "Technische Aufgabe"
description: "Etwas wirklich ausrechnen."
tags:
  - reference
  - aufgabentyp
  - technisch
timestamp: 2026-08-18T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Technische Aufgabe

`typ: technisch`

Die Antwort wird von einer **benannten Prüfroutine** geprüft, die im Programm steht.

**Wofür er taugt:** einen Hash bilden, Base64 dekodieren, gültiges JSON abliefern.

**Die Notiz nennt nur einen Namen.** Es gibt kein `eval`, keinen dynamischen Aufruf und keinen Prozessstart aus dem Lehrstoff: eine Notiz darf Lehrstoff sein, nie Code. Wer eine neue Prüfung braucht, trägt sie in `srv/bewertung.php` ein — dann steht sie im Test und in der Versionsgeschichte.

Verfügbar sind unter anderem: `sha256_von`, `sha1_von`, `md5_von`, `hash_laenge`, `base64_kodiert`, `base64_dekodiert`, `rot13`, `hex_kodiert`, `hex_dekodiert`, `token_anzahl`, `kosten_estimate`, `json_gueltig`, `beginnt_mit`.

## Felder

```yaml
id: X1-01
typ: technisch
titel: "…"
punkte: 20
pruefer: sha256_von
eingabe: "PROMPTHEUS"
```

## Bewertung

Die benannte Routine entscheidet.

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
