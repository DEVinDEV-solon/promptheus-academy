---
type: source
title: "Adaptive Learner — sechs Methoden & sieben-Schritte-Zyklus"
description: "Übertragbare Besonderheiten des Adaptive-Learner-Ansatzes für PROMPTHEUS: 6 Lernmethoden, 7-Schritte-Zyklus, Dual-Prompt-Evaluator, Git-Tracking, Tool-Orchestrierung"
tags: [source, didaktik, methoden, adaptive-learner, lernzyklus, zweitgehirn]
timestamp: 2026-09-05T00:00:00+02:00
ampel: "🟢"
konfidenz: hoch
kontext: "[[PROMPTHEUS WISSEN]]"
handverlesen: true
---

# Adaptive Learner — Methoden-Fundstelle

> **Quelle:** Solon (Zusammenstellung für PROMPTHEUS).

## Kern

Der Adaptive-Learner-Ansatz besitzt **sechs Lernmethoden**, die nach Profil und
Thema gewählt und über einen **sieben-Schritte-Lernzyklus** pro Einzelaustausch
miteinander verknüpft werden. Das Herz: Lernen passiert **zwischen Fehler und
Feedback**; Bewertung (Dual-Prompt-Evaluator) und Lernantwort sind sauber
getrennt. Fortschritt wird **git-artig** getrackt (Snapshots/Diffs/Branches) —
keine oberflächliche Prozent-/Streak-Motrik, sondern Muster.

Diese Fundstelle hebt die Besonderheiten hervor, die sich **direkt auf
PROMPTHEUS** anlegen lassen (4 Tutoren, 7 Stufen, deterministische Bewertung,
`pu_profil()`-Konditionierung, Funke→Prometheus-Streak).

## Mechanismus

### Sechs Lernmethoden statt einer

Jede Methode hat eigene Stärke/Schwäche und einen eigenen **AI-„Persönlichkeits-
stil"**:

1. **Deduktiv** — Regel → Beispiel (erklärend, direckt)
2. **Induktiv** — Beispiele → Regel (entdeckend)
3. **Fehlerbasiert** — bewusst in klassische Fallen locken, dann „warum die Falle
   verführt"
4. **Dialogisch** — sokratisch/fragend
5. **Kontextuell** — am Bezug der Lernenden verankert
6. **AI-adaptiv** — wechselt die Methode pro Austausch je nach Fortschritt

→ PROMPTHEUS-Übertrag: **Tutoren = Personen, Methoden = umschaltbarer Lehrstil
innerhalb einer Person.** Ein Tutor kann einen „Dialektik-Schalter" für
deduktiv/induktiv/dialogisch bekommen.

### Der 7-Schritte-Lernzyklus

`Input → Attempt → Error → Feedback → Adapt → Repeat → Integrate`

Jeder Schritt hat einen kognitiven Zweck; überspringt man einen (bes. Attempt),
kostet es konkret („Skip Attempt = monatelang nicht wirklich können").

### 42-Zellen-Prompt-Matrix (6 × 7)

Eine Prompt-Datei pro (Methode, Schritt)-Paar, einmal exportiert und identisch
in Local-/Server-Modus (**„no drift"**). → Direkt übertragbar auf PROMPTHEUS'
`prompts/`.

### Dual-Prompt-AI-Evaluator (stärkstes Feature)

Nach **jedem** Austausch feuert ein **zweiter** AI-Call mit eigenem System-Prompt
und entscheidet `{advance, confidence, reason, suggested_step}` — vorwärts /
bleiben / zurück. Anwendung nur bei `confidence ≥ 0.6`.

→ PROMPTHEUS-Übertrag: deckt sich mit der **deterministischen Bewertung** und
der `pu_profil()`-Konditionierung. Bewertung ≠ Lernantwort, sauber getrennt.

### Git-fürs-Lernen-Tracking

- **Commit** = Session-Snapshot (Methode, Verständnis, Stress, Dauer)
- **Diff** = Delta zur Vor-Session
- **Branch** = Methoden-Wechsel
- **History** = abfragbares Lernprotokoll

Keine Prozent-/Streak-Oberflächlichkeit, sondern Muster („Wechselte zu dialogisch
→ Verständnis schoss hoch").

### Tool-Orchestrierung statt Konkurrenz

External Werkzeuge (Anki, NotebookLM, Excalidraw, Obsidian) werden **nach Profil
gerankt** und **Spaced-Recommendations** ausgespielt („Methode X seit 14 Tagen
nicht genutzt → Auffrischen in 1 Tag"). Lehrziel geht über die App hinaus: dem
Lernenden sagen, **welches externe Werkzeug wofür** passt.

## Evidenzlage

- 🟢 **Keine Engagement-/Guilt-Metriken, kein Leaderboard** — Streak als einzige,
  „low-key"-Gamification-Metrik.
- 🟢 **Gamification (XP/Level/Badges) = optionale Zucker-Schicht** über
  un-gamifiziertem Inhalt; darunter liegt die lasttragende Analyse
  (Step-Evaluation + Git-History). → Bestätigt PROMPTHEUS' Funke→
  Prometheus/Streak/Badges-Konzept als Glasur über echtem Lernkern.
- 🟢 **Fehler = Information, nicht Scheitern**; Methoden-Wechsel ist Ziel, nicht
  Methoden-Treue.

## Anwendung (PROMPTHEUS)

- **Methoden pro Tutor/Profil:** Sechs Methoden × `pu_profil()` (Lebensalter,
  Gruppe, Sprachstil) — Tutoren personifizieren, Methoden bleiben umschaltbar.
- **Deterministischer Evaluator:** Dual-Prompt-Muster als Rückgrat; Schritt-
  Empfehlung (advance / stay / back) in die bestehende Step-Evaluation
  integrieren.
- **7-Schritte-Zyklus** an die 7 Stufen des Programms andockbar — jedem Schritt
  einen kognitiven Zweck geben, keiner darf übersprungen werden.
- **Prompt-Matrix** als `prompts/`-Struktur: eine Datei je (Methode, Schritt),
  ohne Drift identisch in Local/Server.
- **Git-Tracking statt Punkte-Displays** als Muster-Lernerkenntnis für interne
  Fortschrittsansichten.

## Grenzen

- Methoden-Persönlichkeitsstile erfordern durchdachte System-Prompts pro
  Methode — nicht nur ein generisches Tutor-Prompt.
- Dual-Prompt heißt **doppelter AI-Call pro Austausch** → Kosten/Latenz
  einplanen.
- Git-fürs-Lernen ist konzeptionell stark, aber nur dann wertvoll, wenn die
  Snapshot-Felder (Verständnis, Stress, Dauer) sauber erfasst werden.
- Keine direkte Übernahme des Lernprogramms selbst — nur die **didaktischen
  Mechanismen** sind für PROMPTHEUS relevant.

## Verknüpfte Entitäten

- [[PROMPTHEUS WISSEN]]
- [[30_Agenten/_index]] — die 4 Tutoren (Prometheus, Athena, Hermes, Hephaistos)
- [[10_Stufen/_index]] — 6 Kurse + 1 siebter Kurs
- [[90_Quellen/sozialpaedagogik/_index]] — Lernpsychologie/Motivation