---
name: promptheus-brand
description: PROMPTHEUS ACADEMY Marken-Guide. IMMER laden, wenn fuer die Academy etwas Visuelles oder Textliches produziert wird — Seiten, Komponenten, Grafiken, Urkunden, Flyer, Tutor-Texte. Enthaelt Palette, Typo, Ton, Bildsprache und Verbote.
metadata:
  author: devindev
  version: 1.0.0
  argument-hint: [was-produziert-werden-soll]
---

# PROMPTHEUS ACADEMY — Brand-Skill

Wenn du für PROMPTHEUS ACADEMY irgendetwas produzierst (HTML-Seite,
Komponente, Grafik, Urkunde, Flyer, Sprechertext), gilt **immer** der
Brand-Guide des Projekts. Er liegt im Repo:

## Verbindliche Quelle

| Datei | Inhalt | Status |
|---|---|---|
| `Brand/BRAND.md` | **Die Kurzfassung.** Tokens, Palette „Schmiede", Typo, Ton, Verbote | verbindlich |
| `Brand/REFERENCE.md` | Hintergrund und Begründung zu jeder Regel | nachschlagen |
| `Brand/LANDING-BRIEF.md` | Vorgaben speziell für Landing-/Verkaufsseiten | bei Seiten |
| `Brand/brand-props.json` | Maschinenlesbare Tokens (Farben, Abstände) | für Code |
| `Brand/beispiel/` | fertige Beispiel-HTML + Varianten-CSS | als Vorlage |

## Arbeitsweise

1. Lies **`Brand/BRAND.md` vollständig**, bevor du das erste Element schreibst.
2. Farben **nur** als CSS-Variablen (`var(--…)`) aus
   `assets/css/promptheus.css` / `assets/css/marke.css` verwenden — nie rohe
   Hexwerte ins Layout schreiben.
3. Bei Unsicherheit: `REFERENCE.md` konsultieren, dann entscheiden.
4. Das eine Bild: **Prometheus bringt das Feuer — Schmiede, nicht Start-up.**
   Kein Roboter, kein Gehirn mit Platinen, kein blau-violetter Verlauf.
5. Ton: ernsthaft, aber nicht steif; antik, aber nicht museal; erklären
   statt beeindrucken.

## Selbstprüfung vor der Ausgabe

- Nur Token-Farben? Kein Verlaufs-Blauviolett?
- Bildsprache passt zur Schmiede-Metapher?
- Text klingt wie die Academy, nicht wie ein SaaS-Pitch?

Hält die Ausgabe einer dieser Prüfungen nicht stand: überarbeiten, nicht
abschicken.
