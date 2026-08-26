---
type: source
title: "Bewertungsraster"
description: "Ampel-Raster zur Einstufung eines KI-Systems nach Recht, Daten, Aufsicht und Nachweis."
tags:
  - source
  - fundament
  - risikoanalyse
  - hochrisiko
timestamp: 2026-08-18T17:43:49+00:00
kontext: "[[PROMPTHEUS WISSEN]]"
handverlesen: false
herkunft:
  vault: "24_Auditrail_DSGVO"
  pfad: "00_Fundament/bewertungsraster/index.md"
  geerntet: 2026-08-18T17:43:49+00:00
  pruefsumme: "sha256:a728d636bd360d335f6af958c9be6ce45c6384e9d4503c3f4cfef909a81eea23"
---



# Bewertungsraster

Einheitlicher Massstab fuer die Einstufung eines Systems. Ergebnis ist eine Ampel je Domaene
plus ein Gesamturteil. **Zwei Domaenen haben Vetorecht** — dort schlaegt Rot auf das
Gesamtergebnis durch, egal wie gut der Rest aussieht.

## Domaenen und Gewichte

| Domaene | Gewicht | Veto | Leitfrage |
|---|---|---|---|
| Risikoklasse (AI Act) | 30 % | ja | Verbotene Praktik? Hochrisiko nach Anhang III? |
| Rechtsgrundlage (DSGVO) | 30 % | ja | Traegt Art. 6/9 die Verarbeitung? |
| Nachweisfaehigkeit | 20 % | nein | Ist die Verarbeitung protokolliert und belegbar? |
| Betroffenenrechte | 20 % | nein | Sind Auskunft, Loeschung, Widerspruch praktisch bedienbar? |

## Ampel je Domaene

| Ampel | Bedeutung |
|---|---|
| Gruen (100) | Pflichten erfuellt und belegt |
| Gelb (50) | Pflichten erkannt, Umsetzung unvollstaendig oder undokumentiert |
| Rot (0) | Pflicht verletzt oder Tatbestand einschlaegig, aber nicht erfuellt |

## Gesamturteil

`Summe(Gewicht x Score)` — Schwellen: **>= 75 gruen**, **40-74 gelb**, **< 40 rot**.
Rot in *Risikoklasse* oder *Rechtsgrundlage* setzt das Gesamturteil unabhaengig davon auf rot.

## Warum Veto

Die beiden Veto-Domaenen sind **Zulaessigkeitsfragen**, keine Qualitaetsfragen. Eine verbotene
Praktik nach Art. 5 AI Act wird nicht dadurch zulaessig, dass sie hervorragend protokolliert
ist. Und eine Verarbeitung ohne Rechtsgrundlage bleibt rechtswidrig, auch wenn alle
Betroffenenrechte sauber bedient werden.

Anwendungsbeispiel: *Einstufung Personalmanager*.

---

> **Herkunft.** Diese Notiz wurde aus dem Wissensspeicher `24_Auditrail_DSGVO`
> geerntet (`00_Fundament/bewertungsraster/index.md`). Sie wird von PROMPTHEUS nicht veraendert;
> Aenderungen gehoeren in den Quellvault. Verweise auf Notizen, die es
> nur dort gibt, stehen hier kursiv statt als Link.
