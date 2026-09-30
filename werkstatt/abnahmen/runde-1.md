---
type: abnahme
title: "Abnahme Runde 1 — Brand der PROMPTHEUS-Maske"
description: "Abnahme der Runde 1: Bildmarke, Wortmarke, Palette Schmiede/Pergament, Mäander-Kante, Gemeindeknöpfe. Mit den gefahrenen Befehlen, den Messwerten und dem gefundenen Widerspruch in BRAND.md (schrift-3)."
tags: [abnahme, promptheus, dashboard, werkstatt, deepseek-harness, runde-1, brand, kontrast]
timestamp: 2026-09-29T15:45:00+02:00
status: abgenommen-mit-vorbehalt
plan: "[[Deepseek-Dashboard-Maske-Plan]]"
---

# Abnahme Runde 1 — Brand

> **Ergebnis: bestanden, mit einem Vorbehalt.** Die Maske trägt Bildmarke,
> Wortmarke, Palette und Mäander und läuft auf `http://127.0.0.1:3081`. Der
> Vorbehalt betrifft einen **Widerspruch im Brand-Kit**, der nicht in dieser
> Runde entstanden ist und dort gemeldet gehört (Abschnitt 3).

## 1. Was gebaut wurde

| Knoten | Ergebnis | Steckplatz / Ort |
|---|---|---|
| **K-MARKE-ZEICHEN** | Bildmarke (Flamme im Mäanderring) aus `Brand/mark.svg` | `sidebar.brand.mark`, `conversation.hero.brand.mark` |
| **K-MARKE-NAME** | „PROMPTHEUS" in der Serife, darunter „WERKSTATT" in gesperrten Kapitälchen | `sidebar.brand.name` |
| **K-PALETTE** | Schmiede (dunkel) und Pergament (hell) als Farbmarken-Überschreibung | `ctx.theme.overrideTokens` |
| **K-KOPFKANTE** | Mäander als 3-px-Kante unter dem Schriftzug, als SVG-Maske | im eigenen Schriftzug |
| **K-ABNAHME1** | Kontrastmessung, 22 Messungen | `werkzeuge/kontrast_pruefen.mjs` |

**Abweichung von der Planvorgabe.** Der Plan sah für **K-KOPFKANTE** einen
8-px-Mäander unter der Kopfleiste des Harness vor. Ausgeführt wurde er als
3-px-Kante **unter dem eigenen Schriftzug**. Grund: die Kopfleiste des Harness
gehört nicht uns, und ein Ornament darauf verlangte einen Selektor auf fremdes
DOM — genau das, was BRAND.md §9 und die Arbeitsregeln des Brand-Ordners
verbieten. Eigene Flächen gestalten, fremde nicht. Die Regel „höchstens ein
Ornament je Fläche, nie über Text" ist eingehalten.

**Zwei Belegungen sind Einzelplätze** und verdrängen den bisherigen Bewohner
(den Wal): `sidebar.brand.mark` und `conversation.hero.brand.mark`. Das ist hier
ohne Verlust — es sind reine Markenstellen. Alles andere liegt auf **Listen**
und verdrängt nichts (Entscheidung E7).

## 2. Die gefahrenen Befehle und ihre Ergebnisse

### 2.1 Kontrast (K-ABNAHME1)

```
node werkzeuge/kontrast_pruefen.mjs
```

**Ergebnis: 22 Messungen, 0 unter der Schwelle — BESTANDEN.**

| Palette | engster Wert | soll |
|---|---|---|
| Schmiede | 4,65:1 (Wissenskästen, Lapis) | 4,5 |
| Schmiede | 7,08:1 (Beschreibung AAA auf Karte) | 7,0 |
| Pergament | 4,62:1 (Links und Akzente, Glut) | 4,5 |
| Pergament | 7,11:1 (Beschreibung AAA auf Grund) | 7,0 |

**Die Prüfung wurde gegen einen echten Fehler gestellt:** mit dem Tabellenwert
`#8b8178` für `schrift-3` meldet sie „2 unter der Schwelle — DURCHGEFALLEN",
mit dem Programmwert `#aaa39c` „0 unter der Schwelle — BESTANDEN". Sie leuchtet
also nicht nur grün.

**Die Prüfpaare sind wörtlich aus der maßgeblichen Datei übernommen:**
`PROMPTHEUS\tests\varianten_test.php`, `PU_TEST_PAARE`. Eine frühere Fassung
dieses Werkzeugs prüfte zusätzlich `glut-tief` und `glut-hell` als Textfarbe und
meldete 11 Fehler — **Fehlalarme**: laut BRAND.md §1 ist `glut-tief` der
„Zitatstrich, Ornament im Hellen" und `glut-hell` „Verlauf, Hover". Beide tragen
keinen Fließtext.

### 2.2 Bündel

```
node werkzeuge/buendel_pruefen.mjs
```

**Ergebnis: BESTANDEN** — Anmeldung, Anforderungen, `apply()`, alle fünf
Steckplätze, die Farbpaare hell/dunkel und die Gemeindeadresse.

### 2.3 Im laufenden Betrieb

| Prüfung | Ergebnis |
|---|---|
| `http://127.0.0.1:3081/` | 200 |
| Bündel unter `/plugins/…/client.js` | 200, 9716 Bytes |
| Bildmarke (`pu-flamme`) im Bündel | ✓ |
| Mäander (`M0 28 H32`) im Bündel | ✓ |
| Wortmarke (`PROMPTHEUS`) | ✓ |
| Gemeindeadresse (`promptheus-academy`) | ✓ |
| Palette trägt `#aaa39c` (7,55:1) | ✓ |
| Palette trägt den veralteten `#8b8178` | **nein** — entfernt |
| `http://127.0.0.1:3080` (heutiger Betrieb) | 200 — unberührt |

## 3. Der Vorbehalt: BRAND.md widerspricht sich bei `schrift-3`

**Das ist der wichtigste Fund dieser Runde.**

`BRAND.md` §1 nennt in der Tokentabelle „Schmiede" für `--schrift-3` den Wert
**`#8b8178`**. Im selben Abschnitt steht die Regel:

> „**`--schrift-3`** — Hinweise, Beschreibungen | **7:1** (AAA)"
> „jetzt gilt AAA, und alle sechs erreichen **7,0–7,1:1**."

**Beides kann nicht gleichzeitig stimmen.** Nachgerechnet:

| Quelle | Wert | auf dem Grund | auf einem Feld |
|---|---|---|---|
| BRAND.md, Tokentabelle | `#8b8178` | **4,93:1** | **4,23:1** |
| BRAND.md, Fließtext verlangt | — | 7,0:1 | — |
| `srv/varianten.php` (maßgebliche Quelle) | `#aaa39c` | **7,55:1** | 6,47:1 |
| `assets/css/promptheus.css` (lebendes Programm) | `#aaa39c` | 7,55:1 | — |

Und die Probe aufs Exempel — die Programmwerte **aller sechs** Paletten ergeben
für `schrift-3`:

| Palette | min(schrift-3 auf grund/karte) |
|---|---|
| Schmiede | 7,08 |
| Pergament | 7,11 |
| Olymp | 7,09 |
| Marmor | 7,09 |
| Terrakotta | 7,05 |
| Funkenflug | 7,01 |

**Genau die „7,0–7,1:1", die BRAND.md behauptet.** Damit ist die Sache
entschieden:

- **Die Tokentabelle ist veraltet**, nicht der Fließtext und nicht das Programm.
- Die Maske übernimmt deshalb **`#aaa39c`** (und für Pergament `#5a5046` statt
  des Tabellenwerts `#796c5e`, der nur 4,61:1 erreicht).
- **Der Fehler ist nicht in dieser Runde entstanden** und auch nicht durch sie
  zu beheben. Er gehört in `BRAND.md` berichtigt: eine Zeile in der Tabelle.
  Bis dahin trägt die Tabelle weiter einen Wert, der die eigene Regel verletzt —
  und wer nach der Tabelle baut, baut unlesbare Hinweise.
- `web.css` trägt denselben veralteten Wert `#8b8178` und ist aus demselben
  Grund zu prüfen.

**Warum das hier steht und nicht stillschweigend korrigiert wurde:** das
Brand-Kit ist laut den Arbeitsregeln des Brand-Ordners Regel 3 „Änderungen am
Kit sind abzustimmen" — eine Farbänderung dort ändert das Aussehen des ganzen
Programms. Die Maske folgt der maßgeblichen Quelle; das Kit selbst zu ändern
ist eine eigene Entscheidung.

## 4. Prüfliste

- [x] Beide Marken zeigen die Flamme im Mäanderring, nicht den Fisch.
- [x] Die Palette Schmiede ist in hell und dunkel vollständig (13 Marken).
- [x] Kontrast: Haupttext und Akzente ≥ 4,5:1, Hinweise ≥ 7,0:1 — **22 Messungen, 0 darunter**.
- [x] Höchstens ein Ornament je Fläche, keines über Text.
- [ ] **Läuft ohne Fremdquelle** — noch nicht im Netzblick geprüft (kein Browser installiert).
- [x] Alle Funktionen der Runde 0 sind noch da (Listen statt Einzelplätze).
- [ ] **K-TITEL und K-ZEICHEN stehen noch aus:** `manifest.webmanifest` trägt
      weiter „DeepSeek Harness", `favicon.svg` ist unverändert.
- [ ] **Sichtprüfung im Browser** steht aus — sie würde die Marke, die
      Schriftzug-Kante und die Farbwirkung zeigen. Kein Browser installiert.

## 5. Was Runde 1 nicht angefasst hat

Der Harness ist **unverändert**: K-TITEL und K-ZEICHEN hätten
`apps/web/public/manifest.webmanifest`, `favicon.svg` und die
Umgebungsvariable `DSH_CLIENT_TITLE` gebraucht. Alle drei liegen im Harness
und wurden bewusst nicht geändert, solange der Weg dafür nicht abgestimmt ist.

## 6. Was Runde 2 braucht

Runde 2 ist die Sprachrunde: `de` anmelden (vier Zeilen, Anleitung liegt in
`patches\sprache-de.md`) und **651 Texte** in 25 Namensräumen übersetzen, dazu
das Zählwerkzeug `woerter_pruefen.mjs`.

**Vorher zu entscheiden:** der BRAND.md-Widerspruch aus Abschnitt 3 — sonst
wird die Sprachrunde auf einer Palette gebaut, deren Tabelle nicht stimmt.
