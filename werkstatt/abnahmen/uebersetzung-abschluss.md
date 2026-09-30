---
type: abnahme
title: "Abschluss — Die Werkstatt ist vollständig deutsch"
description: "Alle Namensräume des DeepSeek Harness (0.2.0-rc.2) sind auf Deutsch übersetzt: 41 Namensräume, 1.937 von 1.937 geprüften Texten. Harness-Quelltext unverändert, Update-Festigkeit bestätigt. Mit den Fehlern, die dabei im Prüfwerkzeug gefunden und behoben wurden."
tags: [abnahme, promptheus, werkstatt, uebersetzung, abschluss]
timestamp: 2026-09-29T21:00:00+02:00
status: abgenommen
plan: "[[Deepseek-Dashboard-Maske-Plan]]"
---

# Abschluss — Die Werkstatt ist vollständig deutsch

> **Alle Namensräume sind übersetzt.** 41 Namensräume, **1.937 von 1.937**
> geprüften Texten. Der Harness-Quelltext ist unverändert, und alle Anpassungen
> überstehen ein Update.

## 1. Das Ergebnis

```
woerter_pruefen: 1937 von 1937 Texten auf Deutsch
woerter_pruefen: BESTANDEN
```

| | vorher | jetzt |
|---|---|---|
| Geprüfte Texte | 117 | **1.937** |
| Namensräume | 7 | **41** |
| Harness-Quelltext geändert | 0 Zeilen | **0 Zeilen** |

**Im ausgelieferten Bündel nachgewiesen:** 41 Namensräume, 1.725 Texte, alle
Stichproben vorhanden („Automatische Aufträge", „Standardmodus",
„Schaffensmodus", „Erinnerungen", „Freigabe", „Ziel speichern").

## 2. Was in dieser Sitzung übersetzt wurde

| Runde | Namensräume | Texte |
|---|---|---|
| 3 | `settings.pluginInventory`, `job`, `subagent`, `settings.subagent`, `sidebar-right` | 187 |
| 4 | `shortcuts`, `user-questions`, `settings-account`, `commands`, `sidebar-browser` | 146 |
| 5–9 | 18 kleine Namensräume (Dokumentvorschau, Rückmeldung, Pläne, Ziele, Theme …) | 228 |
| 10 | `agent-preset` (Voreinstellungen des Agenten) | 41 |
| 11 | `schedule.catalog` und `schedule.manager` (automatische Aufträge) | 257 |

Dazu die früheren Runden: `conversation` (369), `pluginManager` (189),
`trajectory` (192), `workspace` (112) und die übrigen.

## 3. Drei Fehler im eigenen Prüfwerkzeug — der wichtigste Teil

**Der Kern dieser Arbeit war nicht das Übersetzen, sondern das Prüfen.** Ein
Übersetzungswerkzeug, das zu wenig prüft, meldet „fertig", während die Hälfte
der Oberfläche englisch bleibt. Drei Fehler dieser Art sind aufgetreten:

### Fehler 1: Das gierige Muster (frühere Runde)

`[^{]*` lief über den vorigen Block hinweg und fand nur noch einen Treffer. Bei
`ui-conversation` fand es `en` statt `zh` — und übersprang damit genau die zwei
**größten** Wörterbücher (369 und 192 Texte). Der Zähler meldete 574 offene
Texte statt 1.324.

### Fehler 2: Schlüssel am Zeilenanfang

Manche Wörterbücher stellen **mehrere Schlüssel in eine Zeile**:

```
record: '按下快捷键', 'record-help': '松开组合键即保存。…',
```

Ein an den Zeilenanfang verankertes Muster fand nur den ersten und meldete den
Rest als „überzählig" — **49 falsche Beanstandungen** in `ui-shortcuts` und
`ui-settings-account`.

Beim Beheben entstand ein **dritter** Fehler: ein zu freies Muster fand `https:`
mitten in einer Adresse (`https://npm.example.com/`) und erfand fünf Schlüssel.

### Die Lösung

Das Lesen geschieht jetzt **Zeichen für Zeichen**, wie ein Leser liest: mit
Kenntnis davon, ob man in einer Zeichenkette steht und wie tief man in
verschachtelten Objekten ist. Nur auf der obersten Ebene und ausserhalb von
Zeichenketten beginnt ein neuer Schlüssel.

### Fehler 3: Mehrere Dateien je Namensraum

Ein Namensraum kann aus **mehreren** Wörterbuch-Dateien bestehen:

| Namensraum | Dateien |
|---|---|
| `agent-preset` | `locales.ts` + `guide-locales.ts` |
| `schedule.catalog` | `frequency-locales.ts` + `locales.ts` |
| `schedule.manager` | `frequency-locales.ts` + `task-manager-locales.ts` |

Ein Vergleich Zeile für Zeile meldete **165 „überzählige"** Schlüssel, die in
Wahrheit aus der jeweils anderen Datei desselben Namensraums stammten. Geprüft
wird jetzt je Namensraum gegen die **Vereinigung** aller seiner Quellen.

**Ohne diese drei Korrekturen hätte ich dir „fertig" gemeldet, während zwei
Drittel der Oberfläche englisch geblieben wären.**

## 4. Die versteckten Verweise

Beim Auszug der Schlüssel fielen drei Formen auf, die ein oberflächliches Lesen
übersieht:

| Form | Beispiel | Wo |
|---|---|---|
| **Verweis auf eine Konstante** | `...frequencyZh` | `ui-schedule` |
| **Verweis auf ein Objekt** | `...PRODUCT_NAMES` | `ui-open-in-app` |
| **Verweis auf eine Datei** | `...onboardingCopy` | `ui-settings-account` |

Alle drei werden jetzt aufgelöst: das Werkzeug folgt dem Verweis in dieselbe
oder eine Nachbardatei und lädt die Einträge nach.

## 5. Die Begriffe, die durchgehalten werden

| Englisch | Deutsch |
|---|---|
| Session | **Chat** |
| Turn | **Runde** |
| Step | **Schritt** |
| Tool | **Werkzeug** |
| Subagent | **Unteragent** |
| Plugin | **Erweiterung** |
| Preset | **Voreinstellung** |
| Job | **Hintergrundauftrag** |
| Queue | **Warteschlange** |
| Steer | **Einwurf** |
| Schedule | **Zeitplan** / **automatischer Auftrag** |
| Approval | **Freigabe** |

**Die drei mitgelieferten Modi:** Standardmodus · PTC-Modus · Minimalmodus ·
Schaffensmodus.

## 6. Zwei Stellen, die keine Beschriftungen sind

**Befehlsnamen bleiben englisch.** In `hint.goal.active` stehen `edit`, `pause`,
`resume`, `clear` — das sind **Befehle**, keine Wörter. Wären sie übersetzt,
zeigte der Hinweis auf nichts.

**Cron-Ausdrücke bleiben unverändert.** `0 9 * * 1-5` ist eine Angabe nach
aussen, keine Beschriftung. `rule.cronInvalid` nennt das Beispiel deshalb
unverändert — mit deutschem Hinweis darum.

Ebenso blieben **Tastennamen** (`Mod+/`, `Command+Option`) und
**Programmnamen** (VS Code, Xcode) unangetastet.

## 7. Update-Festigkeit

```
cd deepseek-harness && git status --porcelain
   -> 0 Zeilen

update_festigkeit: BESTANDEN
   gefährdet (unter Versionskontrolle) : 0
   fehlend                             : 0
```

Nach einem Update genügen vier Schritte:

```
1. cd deepseek-harness && git pull && pnpm install
2. node werkzeuge\bauen.mjs                 (Titel neu setzen, Paket bauen)
3. node werkzeuge\update_festigkeit.mjs     (Lage prüfen)
4. node werkzeuge\woerter_pruefen.mjs       (Texte gegen den neuen Stand)
```

**Schritt 4 nennt jeden neuen Schlüssel beim Namen** — dann wird nur der
fehlende Rest übersetzt, nicht alles neu.

## 8. Die Werkzeuge, die dabei entstanden sind

| Werkzeug | Zweck |
|---|---|
| `bauen.mjs` | Paket bauen, Titel setzen, Verweis im Zuhause |
| `starten.mjs` | Werkstatt starten; erkennt eine laufende Instanz |
| `woerter_pruefen.mjs` | **Das verbindliche Werkzeug:** 1.937 Schlüssel gegen den Harness |
| `woerter_im_buendel.mjs` | Führt das Bündel aus und liest die Wörterbücher |
| `text_pruefen.mjs` | Einzelne Texte im Bündel nachschlagen |
| `update_festigkeit.mjs` | Prüft, ob Anpassungen ein Update überstehen |
| `uebersetzung_umfang.mjs` | Zählt den Gesamtumfang |
| `offene_namensraeume.mjs` | Listet die noch offenen Namensräume |
| `alle_schluessel.mjs` | Vollständiger Auszug **mit** aufgelösten Verweisen |
| `bloecke_holen.mjs` | Holt die chinesischen Blöcke zum Lesen |
| `kontrast_pruefen.mjs` | 22 Farbmessungen gegen die WCAG-Schwellen |
| `buendel_pruefen.mjs` | Prüft das gebaute Bündel |
| `herdr_pruefen.mjs` | Prüft, ob `herdr` im PTY läuft |

## 9. Stand

| Prüfung | Ergebnis |
|---|---|
| `woerter_pruefen.mjs` | **1.937 von 1.937**, BESTANDEN |
| Namensräume im Bündel | **41**, 1.725 Texte |
| `update_festigkeit.mjs` | BESTANDEN, 0 gefährdet |
| Harness-Quelltext geändert | **0 Zeilen** |
| Werkstatt 3081 | 200, Titel korrekt |
| Betrieb 3080 | 200 — unberührt |

## 10. Offen

- [ ] **Die Sichtprüfung im Browser.** Alles ist im Bündel und an der
      ausgelieferten Seite nachgewiesen, aber nicht mit eigenen Augen gesehen.
      Deutsche Wörter sind länger als englische — einzelne Beschriftungen
      könnten in engen Knöpfen auslaufen. Das ist jetzt der nächste sinnvolle
      Schritt.
- [ ] **Das Update-Verfahren einmal mit einem echten `git pull` proben.**
- [ ] **Der Vorbehalt aus Runde 1** (`BRAND.md`, `--schrift-3`).
- [ ] **`uebersetzung_umfang.mjs` ist ungenau** — es ordnet Namensräume über
      Datei- und Paketnamen zu und meldet deshalb 195 falsche „offene" Texte.
      `woerter_pruefen.mjs` ist das verbindliche Werkzeug; der Umfangszähler
      gehört entweder berichtigt oder entfernt.
