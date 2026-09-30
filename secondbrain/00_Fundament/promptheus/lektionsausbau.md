---
type: foundation
title: "Lektionsausbau — mehr Lektionen, mehr Formen"
description: "Warum die Kurse wachsen müssen, warum mehr vom Gleichen scheitert, und nach welchem Bauplan die neuen Lektionen entstehen."
tags:
  - foundation
  - didaktik
  - lehrplan
  - aufgabentypen
timestamp: 2026-09-30T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
ampel: "🟡"
konfidenz: mittel
---

# Lektionsausbau — mehr Lektionen, mehr Formen

> **Stand:** beschlossen als Richtung, Bauplan steht, Umsetzung kursweise.
> Deshalb 🟡. Grundlage: [[didaktik]], [[gamification]], [[lernpsychologie]],
> [[motivation]], [[40_Aufgabentypen/_index|die zwölf Aufgabentypen]].

## Befund (30.09.2026)

| Kurs | Lektionen | Aufgaben | Soll-Dauer laut Studienordnung |
|---|---:|---:|---|
| 1 ENTDECKER | 6 | 17 | 4–6 h |
| 2 PRIESTER | 4 | 13 | 6–8 h |
| 3 BUILDER | 1 | 1 | 8–10 h |
| 4 ARCHITEKT | 1 | 1 | 10–12 h |
| 5 WÄCHTER | 2 | 4 | 10–12 h |
| 6 MEISTER | 1 | 1 | 15–20 h |
| Der 7. Kurs | 6 | 11 | — |
| 10 Fachkurse | je 1 | je 1 | — |

Verteilung der 57 Aufgaben nach Typ: **denkaufgabe 26 (46 %)**,
uebereinstimmung 9, schiebe 5, mathe 5, planung 4, plugplay 3, technisch,
sicherheit, secret, raeumlich, multitask, krypto je 1.

Zwei Befunde folgen daraus: Die Kurse ab Stufe 3 sind **Gerüste**, keine
Kurse. Und fast die Hälfte aller Aufgaben ist dieselbe Bedienung: vier
Antworten, eine anklicken.

---

## These: Mehr Lektionen in der bewährten Form

Die bestehenden Lektionen funktionieren: Text in kurzen Abschnitten, die
Aufgabe direkt hinter dem Stoff (Constructive Alignment), eine einfache
Fassung für Jüngere, Sprechertexte je Zielgruppe. Das Naheliegende ist, diese
Form zu vervielfältigen — sie ist erprobt, die Engine kennt sie, und jede neue
Lektion ist sofort lauffähig.

Dafür spricht:

- **Tempo.** Der Engpass sind fehlende Inhalte, nicht fehlende Formate.
- **Verlässlichkeit.** Jeder bekannte Aufgabentyp ist getestet
  (`tests/aufgaben_test.php`, `tests/bewertung_test.php`).
- **Gleichmass.** Lernende wissen, was sie erwartet.

## Antithese: Mehr vom Gleichen ermüdet

Masse ohne Wechsel senkt genau das, was die Academy braucht: das Durchhalten
bis Stufe 6 und in den 7. Kurs.

- **Monotonie ist messbar.** Bei 46 % Multiple Choice lernt man nach zehn
  Lektionen vor allem, Distraktoren zu erkennen — nicht den Stoff. Das ist
  Testklugheit, keine Kompetenz.
- **Bloom wird verfehlt.** Ab Stufe 3 heisst das Lernziel *anwenden*,
  *analysieren*, *erschaffen*. Eine Auswahl aus vier Sätzen prüft höchstens
  *verstehen*. Constructive Alignment verlangt, dass die Aufgabe dasselbe meint
  wie das Ziel.
- **Kinder lernen über Handlung.** Die Academy lädt Zwölfjährige ein. Ziehen,
  Sortieren, Markieren, Schätzen und Entscheiden tragen länger als Lesen und
  Anklicken.
- **Punkte ersetzen keinen Reiz.** Wer Abwechslung über mehr Punkte erzeugen
  will, läuft in den Overjustification-Effekt ([[gamification]]): Die äussere
  Belohnung verdrängt den inneren Antrieb.
- **Neue Formate kosten Engine-Arbeit** — jedes braucht Oberfläche, Bewertung,
  Tastaturbedienung und Tests. Das ist die ehrliche Gegenrechnung zur These.

## Synthese: Bauplan für den Ausbau

Die bewährte Lektionsform bleibt der Rahmen. Innerhalb dieses Rahmens gelten
**Pflichtwechsel** — in der Lektion, im Kurs und in der Aufgabenform. Neue
Formate kommen dazu, aber nur die, die ein Lernziel prüfen, das heute nicht
prüfbar ist.

### 1. Der Rhythmus einer Lektion

Jede Lektion (5–15 Minuten, [[didaktik]]) folgt fünf Takten. Nicht jeder Takt
braucht eine Aufgabe, aber keiner fehlt:

| Takt | Zweck | Beispiel-Techniken |
|---|---|---|
| **1 Anstoss** | Neugier vor Erklärung | Rätsel, Widerspruch, kurze Szene mit einem Tutor, „Was glaubst du?"-Schätzung |
| **2 Erklären** | Der Stoff, in Abschnitten | Analogie, Schaubild, Gegenbeispiel |
| **3 Handeln** | Selbst etwas tun | Sortieren, Markieren, Zusammensetzen, Mini-Experiment mit dem Tutor |
| **4 Prüfen** | Abruf (Testing-Effekt) | Aufgabe direkt hinter dem Abschnitt |
| **5 Übertragen** | In das eigene Leben | „Wo begegnet dir das morgen?" — freie Antwort, ohne Punkte |

Takt 1 ist neu verbindlich. Der Anstoss ist der billigste Hebel gegen
Monotonie: Eine Lektion, die mit einer Frage beginnt, wird anders gelesen als
eine, die mit einer Definition beginnt.

### 2. Pflichtwechsel bei den Aufgaben

| Regel | Grenze |
|---|---|
| Anteil `denkaufgabe` je Kurs | **höchstens 30 %** |
| Verschiedene Typen je Lektion | **mindestens 2** (ab 2 Aufgaben) |
| Verschiedene Typen je Kurs | **mindestens 6** |
| Rückblick-Aufgabe | **jede 3. Lektion** eine Aufgabe zum Stoff von vor 2–4 Lektionen (Ebbinghaus, verteiltes Wiederholen) |
| Abschlussaufgabe je Kurs | eine **Meisteraufgabe** (multitask oder planung), die mehrere Lektionen verbindet |

Welche Typen je Stufe vorherrschen, steht in [[didaktik]] (Bloom-Tabelle). Sie
bleibt gültig; die Quote oben verhindert, dass sie in der Praxis zur
Multiple-Choice-Stufe zusammenfällt.

### 3. Anwendungstechniken im Text

Wechsel entsteht nicht nur in der Aufgabe, sondern auch im Erzählen:

- **Die vier Tutoren als Figuren** ([[30_Agenten/_index|Athena, Hephaistos,
  Hermes, Prometheus]]): Jeder Kurs hat einen Tutor, der eine kleine Geschichte
  durch die Lektionen trägt — ein Fall, der sich mit dem Stoff auflöst.
- **Gegenstimme:** In jeder zweiten Lektion ein Kasten „Einwand" — die beste
  Gegenposition zum Stoff und ihre Antwort. Das ist die Dialektik der Academy
  im Kleinen.
- **Mini-Experiment:** ein vorbereiteter Auftrag an den Tutor („Frag ihn nach
  X und achte auf Y"). Kostet Token, deshalb höchstens einmal je Lektion und
  immer optional.
- **Fehler zeigen, nicht nur Regeln:** eine echte, schlechte Modellantwort, die
  seziert wird. Das prüft Analysieren, nicht Wiedererkennen.
- **Sichtbarer Fortschritt im Fall:** Der Fall des Kurses kommt am Kursende in
  der Meisteraufgabe zurück.

### 4. Neue Aufgabenformate (Engine)

Nur Formate, die ein heute nicht prüfbares Ziel prüfen. Reihenfolge = Nutzen je
Aufwand:

| Format | Prüft | Bedienung | Aufwand |
|---|---|---|---|
| `koerbe` | Einordnen in Kategorien (z. B. „personenbezogen / nicht") | Karten in 2–4 Körbe | klein (Variante von uebereinstimmung) |
| `schaetzen` | Grössenordnungen: Tokens, Kosten, Wahrscheinlichkeit | Schieberegler mit Toleranzband | klein |
| `vergleich` | Bewerten: zwei Modellantworten, die bessere wählen **und** das Kriterium | A/B + Kriterium | klein |
| `markieren` | Analysieren: Fehler, erfundene Quelle, Personendaten *im Text* finden | Wörter/Sätze antippen | mittel |
| `pfad` | Entscheiden in einer Situation, 2–4 Schritte, jede Wahl hat Folgen | Szenenkarten | mittel |
| `labor` | Erschaffen: eigenen Prompt schreiben, Tutor bewertet nach Rubrik | Freitext + Rubrik | gross, kostet Token |

Für jedes neue Format gilt dasselbe wie für die zwölf bestehenden: Steckbrief in
`40_Aufgabentypen/`, Bedienung mit Maus **und** Tastatur, Bewertung in
`srv/`, Tests. `labor` kommt zuletzt, weil es als einziges laufende Kosten hat
und eine Bewertung durch ein Modell braucht, die selbst geprüft werden muss.

### 5. Zielumfang je Kurs

Gerechnet mit rund 20 Minuten je Lektion inklusive Aufgaben, abgeleitet aus der
Soll-Dauer der [[000_Academy/Studienordnung|Studienordnung]]:

| Kurs | heute | Ziel | Schwerpunkt der neuen Lektionen |
|---|---:|---:|---|
| 1 ENTDECKER | 6 | 14 | Daten und Training, Bild- und Sprachmodelle, Grenzen, Verantwortung |
| 2 PRIESTER | 4 | 18 | Prompt-Bausteine, Rollen, Beispiele, Ketten, Quellenkritik, Logikfallen |
| 3 BUILDER | 1 | 22 | Agenten, erste Automation, Python-Grundlagen, Werkzeuge, Fehler lesen |
| 4 ARCHITEKT | 1 | 24 | APIs, Datenflüsse, mehrere Agenten, Kosten, Systemgrenzen |
| 5 WÄCHTER | 2 | 24 | Angriffe auf Prompts, Datenschutz/DSGVO, Kryptografie-Grundlagen, Geheimnisse |
| 6 MEISTER | 1 | 18 | ein Projekt in Etappen: Idee, Plan, Bau, Test, Übergabe |
| Der 7. Kurs | 6 | 10 | Brand-Guideline: Stimme, Bild, Grenzen, Einsatz in der Werkstatt |
| je Fachkurs | 1 | 8 | Einstieg, drei Anwendungsfälle, Risiken, Werkzeugkette, Fallstudie, Meisteraufgabe |

Summe Ziel: rund 210 Lektionen (heute 31).

### 6. Reihenfolge

1. **Stufe 3 BUILDER als Pilot** — der dünnste Kurs auf dem Weg zum 7. Kurs und
   zur Werkstatt. An ihm wird der Bauplan geprüft: Rhythmus, Quote, Einwand,
   einfache Fassung, Sprechertexte.
2. Formate `koerbe`, `schaetzen`, `vergleich` in die Engine (klein, hoher Nutzen).
3. Stufe 4 und 6, dann 5, dann 1 und 2 auffüllen.
4. Formate `markieren` und `pfad`.
5. Fachkurse, je 8 Lektionen.
6. `labor` — erst wenn die Token-Abrechnung je Modell steht.

### 7. Qualitätsschranken je neuer Lektion

- Lernziel in einem Satz im Frontmatter (`description`) — und die Aufgaben
  prüfen genau dieses Ziel.
- Aufgaben-IDs fortlaufend je Kurs (`B3-07`, …), nie wiederverwendet: Der beste
  Versuch je ID zählt, eine wiederverwendete ID vermischt Punkte.
- Einfache Fassung nach [[10_Stufen/_ANLEITUNG-Niveau-Varianten]].
- Keine erfundenen Zahlen: Jede Zahl mit Quelle aus `90_Quellen/`.
- Keine privaten Namen, Firmen oder Domains im Lehrstoff.
- Die Engine-Tests laufen grün, bevor eine Lektion als fertig gilt.

## Offene Fragen

- Wer schreibt die Sprechertexte der neuen Lektionen — Modell mit Abnahme, oder
  von Hand?
- Soll die Rückblick-Aufgabe automatisch aus alten Aufgaben gezogen werden
  (Engine) oder fest in der Lektion stehen (Autor)?
