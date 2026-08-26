---
type: source
title: "Übersicht der Wasserzeichen-Verfahren"
description: "Die vier Familien der KI-Kennzeichnung und wo Anthropic einsortiert"
tags:
  - source
  - fundament
  - watermarking
  - uebersicht
timestamp: 2026-08-18T17:43:49+00:00
kontext: "[[PROMPTHEUS WISSEN]]"
handverlesen: false
herkunft:
  vault: "21_Wasserzeichen"
  pfad: "00_Fundament/watermarking/verfahren-uebersicht.md"
  geerntet: 2026-08-18T17:43:49+00:00
  pruefsumme: "sha256:4831f1ff9661543512fa2132610e04ad925a3d0a846efb202f46d0d820865078"
---


# Übersicht der Wasserzeichen-Verfahren

Die zentrale Landkarte dieses Vaults. Das analysierte Video vermischt die Familien; hier werden sie getrennt.

## Die vier Familien

### 1. Metadaten-Kennzeichnung (C2PA)
Signierte Herkunftsinformation **neben** dem Inhalt, in den Dateicontainer geschrieben.
* **Gilt für:** Bilder, PNG/JPG/SVG, teils Video
* **Entfernbar:** trivial — Metadaten strippen, Screenshot, Format-Konvertierung
* → *c2pa-content-credentials*

### 2. Statistisches Textwasserzeichen mit Logit-Bias (Green-/Red-List)
Verbiegt die Wahrscheinlichkeiten zugunsten einer pseudo-zufällig ausgewählten Token-Teilmenge.
* **Vertreter:** Kirchenbauer et al. 2023
* **Eigenschaft:** *nicht* verteilungserhaltend — verändert die Ausgabe messbar
* → *kirchenbauer-green-red-list*

### 3. Verteilungserhaltendes Sampling-Wasserzeichen
Tastet die Wahrscheinlichkeiten **nicht** an, sondern ersetzt die Zufallsquelle durch eine schlüsselabhängige, pseudo-zufällige.
* **Vertreter:** Aaronson 2022 (Gumbel/Exponential), SynthID-Text 2024 (Tournament-Sampling)
* **Eigenschaft:** im Erwartungswert verteilungserhaltend → kein Qualitätsverlust
* → *aaronson-gumbel-schema* · *synthid-text-tournament-sampling*

### 4. Oberflächen-Marker (Unicode, Zeichensetzung, Formatierung)
Unsichtbare Zeichen, Zero-Width-Spaces, auffällige Gedankenstriche.
* **Status: kein ernsthaftes Verfahren.** Wird von keinem Anbieter als Wasserzeichen eingesetzt und ist mit einem Suchen-Ersetzen erledigt.
* Das Video weist korrekt darauf hin, dass dies ein **Mythos** ist.

## Wo Anthropic steht

| Inhaltstyp | Verfahren | Familie |
|---|---|---|
| **Text** | SynthID-Text-Ansatz | **3** — verteilungserhaltend |
| **Bilder/Dateien** (PNG, JPG, SVG) | C2PA Content Credentials | **1** — Metadaten |

Anthropic nennt SynthID-Text ausdrücklich als Grundlage und verweist auf Aaronsons Vorschlag von 2022 als Vorläufer. → *2026-08-11-anthropic-news-text-watermark*

> ⚠️ **Das Video erklärt Familie 2 und behauptet, das sei Anthropics Verfahren.** Es ist Familie 3.
> Ausführlich: *2026-08-16-mechanismus-divergenz*

## Warum die Unterscheidung praktisch zählt

| Frage | Familie 2 (Green-List) | Familie 3 (SynthID) |
|---|---|---|
| Verändert sich die Textqualität? | ja, messbar | nein (Erwartungswert) |
| Kann man „nur grüne Wörter" wählen? | theoretisch relevant | Frage ergibt keinen Sinn |
| Nachweis über … | Anteil grüner Tokens | Übereinstimmung mit Schlüssel-Sampling |
| Braucht der Detektor den Schlüssel? | ja | ja |
| Robust gegen Paraphrase? | nein | nein |

Die **praktischen** Folgerungen (kurze Texte schwach, Code ausgenommen, Paraphrase zerstört) sind bei beiden Familien gleich — deshalb kommt das Video trotz falscher Mechanik zu weitgehend richtigen Handlungsempfehlungen.

## Siehe auch
* *robustheit-und-angriffe*
* *glossar*

---

> **Herkunft.** Diese Notiz wurde aus dem Wissensspeicher `21_Wasserzeichen`
> geerntet (`00_Fundament/watermarking/verfahren-uebersicht.md`). Sie wird von PROMPTHEUS nicht veraendert;
> Aenderungen gehoeren in den Quellvault. Verweise auf Notizen, die es
> nur dort gibt, stehen hier kursiv statt als Link.
