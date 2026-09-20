---
type: source
title: "00_Fundament/okf-format"
description: "Spezifikation und Dokumentation des Open Knowledge Format (OKF) v0.1."
tags:
  - source
  - index
  - okf-format
  - spezifikation
timestamp: 2026-08-18T17:43:48+00:00
kontext: "[[PROMPTHEUS WISSEN]]"
handverlesen: false
herkunft:
  vault: "25_Führungskompetenz"
  pfad: "00_Fundament/okf-format/index.md"
  geerntet: 2026-08-18T17:43:48+00:00
  pruefsumme: "sha256:0b399aceb57a285383170935424cba61ca7ab25ce8a6708a36860da435a6ea56"
---

# 📐 00_Fundament / okf-format

Dokumentation des OKF-Formats (Objekt-Kontext-Feld).

## Aufbau

Jeder Eintrag im Vault folgt dem OKF-Format:

- **Objekt** — Was wird beschrieben? (Entität, Thema, Analyse, Quelle)
- **Kontext** — In welchem Rahmen? (System, Organisation, Situation)
- **Feld** — Welche Wirkkraft? (Bewertung, Konfidenz, Ampel)

## Frontmatter-Standards

- `type` — entity-person | entity-system | theme | analysis | bewertung | source
- `ampel` — 🟢 | 🟡 | 🔴
- `konfidenz` — hoch | mittel | niedrig

## Templates

→ *Vorlagen-Übersicht*

---

> **Herkunft.** Diese Notiz wurde aus dem Wissensspeicher `25_Führungskompetenz`
> geerntet (`00_Fundament/okf-format/index.md`). Sie wird von PROMPTHEUS nicht veraendert;
> Aenderungen gehoeren in den Quellvault. Verweise auf Notizen, die es
> nur dort gibt, stehen hier kursiv statt als Link.
