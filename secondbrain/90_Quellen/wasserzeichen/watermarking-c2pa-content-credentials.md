---
type: source
title: "C2PA Content Credentials"
description: "Die Metadaten-Kennzeichnung für Bilder — trivial entfernbar, oft mit Textwasserzeichen verwechselt"
tags:
  - source
  - fundament
  - watermarking
  - c2pa
  - bilder
timestamp: 2026-08-18T17:43:49+00:00
kontext: "[[PROMPTHEUS WISSEN]]"
handverlesen: false
herkunft:
  vault: "21_Wasserzeichen"
  pfad: "00_Fundament/watermarking/c2pa-content-credentials.md"
  geerntet: 2026-08-18T17:43:49+00:00
  pruefsumme: "sha256:be7f64fa103a771d6cd7c59dd51c0e2732bfaac37e4e711a6e8e8571a2088ab8"
---


# C2PA Content Credentials

**C2PA** = Coalition for Content Provenance and Authenticity. Offener Standard, getragen u. a. von Adobe, Microsoft, BBC, Intel, Sony, Truepic. Wird von Anthropic für **Bilder und Dateien** eingesetzt — ausdrücklich genannt: SVG, PNG, JPG. → *anthropic-support-marking-content*

## Was es ist

Ein **kryptografisch signierter Herkunftsnachweis** („Manifest"), der in den Metadatenbereich der Datei geschrieben wird. Inhalt typischerweise:

* Wer/was hat es erzeugt (Modell, Anbieter)
* Wann
* Welche Bearbeitungsschritte folgten
* Signatur zur Integritätsprüfung

## Der entscheidende Unterschied zum Textwasserzeichen

| | C2PA | Textwasserzeichen |
|---|---|---|
| Sitzt | **neben** dem Inhalt (Container) | **im** Inhalt (Tokenwahl) |
| Entfernung | trivial | schwer |
| Überlebt Screenshot | **nein** | — |
| Überlebt Copy-&-Paste | **nein** | ja |
| Überlebt Format-Konvertierung | meist nicht | ja |
| Prüfbar von | jedem (Signatur ist öffentlich) | nur mit Geheimschlüssel |

**Das ist die Verwechslung, die das Video aufklärt — und die es selbst teilweise reproduziert.** Die kursierenden „Watermark Remover"-Tools entfernen C2PA-Metadaten aus Bildern. Auf Text haben sie keinerlei Wirkung, weil dort schlicht nichts im Container steht. Das Video stellt das ab 01:54 korrekt dar.

## Entfernbarkeit in der Praxis

C2PA-Manifeste verschwinden bereits durch:
* Screenshot
* Upload auf fast jede Social-Plattform (die meisten strippen Metadaten beim Re-Encoding)
* `exiftool -all=`
* Konvertierung PNG → JPG

Die Signatur schützt gegen **Fälschung**, nicht gegen **Entfernung**. Ein fehlendes Manifest beweist nichts — Anthropic weist im Support-Artikel selbst darauf hin, dass eine fehlende Markierung nicht bedeute, der Inhalt sei nicht KI-erzeugt.

## Folge für die Regulierung

Art. 50 AI Act verlangt maschinenlesbare Markierung. C2PA erfüllt das formal, ist aber der **schwächste** Teil der Kette. Genau hier setzt die Kritik des Videos an, dass die Kennzeichnung ihren Zweck verfehle — für Bilder ist das Argument deutlich stärker als für Text. → *these-05-eu-wettbewerbsnachteil*

## Siehe auch
* *c2pa-coalition* · *eu-ai-act-artikel-50*

---

> **Herkunft.** Diese Notiz wurde aus dem Wissensspeicher `21_Wasserzeichen`
> geerntet (`00_Fundament/watermarking/c2pa-content-credentials.md`). Sie wird von PROMPTHEUS nicht veraendert;
> Aenderungen gehoeren in den Quellvault. Verweise auf Notizen, die es
> nur dort gibt, stehen hier kursiv statt als Link.
