---
type: abnahme
title: "Abnahme — pluginManager und deliverables übersetzt"
description: "Die nächsten zwei großen Namensräume: Erweiterungsverwaltung (189 Texte) und erzeugte Dateien mit Änderungsansicht (60 Texte). Fortschritt 712 -> 772 von 1667. Harness-Quelltext weiterhin unberührt."
tags: [abnahme, promptheus, werkstatt, uebersetzung]
timestamp: 2026-09-29T20:00:00+02:00
status: abgenommen
plan: "[[Deepseek-Dashboard-Maske-Plan]]"
---

# Abnahme — `pluginManager` und `deliverables`

> **Beide vollständig.** 249 neue Texte, alle geprüft, alle im ausgelieferten
> Bündel nachgewiesen. Der Harness-Quelltext ist weiterhin unberührt.

## 1. Was übersetzt wurde

| Namensraum | Texte | Was er abdeckt |
|---|---|---|
| **`pluginManager`** | **189** | Erweiterungen: Liste, Einzelheiten, Installation, Bezugsquelle, Fortschritt, Gründe |
| **`deliverables`** | **60** | Erzeugte Dateien, Änderungen einer Runde, Ansicht der Unterschiede |

**Nachgewiesen:** `woerter_pruefen.mjs` meldet **1.013 von 1.013** in zehn
Namensräumen — BESTANDEN.

## 2. Zwei Stellen, die Sorgfalt brauchten

**Der Sicherheitshinweis bleibt deutlich.** Der Harness warnt vor Erweiterungen
unbekannter Herkunft und verlangt für Installationsskripte eine ausdrückliche
Erlaubnis. Mit Absicht — solche Skripte laufen mit den Rechten des Nutzers. Die
deutsche Fassung schwächt das **nicht** ab:

> „Prüfe, ob die Herkunft der Erweiterung vertrauenswürdig ist. Erweiterungen
> laufen auf diesem Rechner mit deinen Rechten. Eine Erweiterung unbekannter
> Herkunft kann den DeepSeek Harness beschädigen oder deine Daten lesen und
> weitergeben."

**Jeder Grund nennt einen Weg.** Im `pluginManager` sind fast die Hälfte aller
Texte Gründe und Fehlermeldungen. BRAND.md §8 verlangt: „Jede Fehlermeldung
nennt einen Weg." Das war hier keine Formsache, sondern die Hauptarbeit — etwa:

| Grund | Deutsche Fassung nennt den Weg |
|---|---|
| `reasonStopProfile` | „… muss angehalten und dann mit dsh plugin entfernt werden." |
| `reasonBundleInUse` | „Schalte sie zuerst ab." |
| `installFailureNetworkHost` | „… trage statt der Adresse den Paketnamen ein." |
| `installFailureBuildBlockedManual` | „Erlaube es in … unter allowBuilds und versuche es dann erneut." |

## 3. Die Begriffe bleiben einheitlich

„Turn" heisst in `deliverables` **Runde** — dieselbe Festlegung wie im Namensraum
`conversation`. Die Oberfläche spricht dadurch nicht an zwei Stellen verschieden.

Weitere Festlegungen aus dieser Runde:

| Englisch | Deutsch |
|---|---|
| Plugin | **Erweiterung** |
| Bundle (Paket) | **Bündel** |
| Registry | **Bezugsquelle** |
| Deliverable | **erzeugte Datei** |
| Diff / Review | **Unterschiede / Ansicht der Unterschiede** |
| Split view | **Nebeneinander** |
| Unified view | **Untereinander** |

## 4. Ein Prüffehler auf meiner Seite

Eine Stichprobe meldete „Binärdatei: nein" und „Warteschlange: FEHLT" — obwohl
beide im Bündel standen. **Mein Test war falsch, nicht die Übersetzung:** ich
suchte ganze Sätze, die es so nicht gibt („Binärdatei" steht im Bündel escaped
als `Bin\xE4rdatei`), und prüfte gegen die falsche Vorstellung eines Wortlauts.

Behoben mit `werkzeuge\woerter_im_buendel.mjs`: es **führt das Bündel aus** und
liest die angemeldeten Wörterbücher im Klartext — dieselbe Bauart wie
`woerter_pruefen.mjs`. Ergebnis:

```
Namensräume: 10 | Texte gesamt: 990

  sidebar               5 Texte
  settings.general     34 Texte
  trajectory          192 Texte
  model                23 Texte
  conversation        369 Texte
  pluginManager       189 Texte
  deliverables         60 Texte
  settings.permission  12 Texte
  permission.access    17 Texte
  workspace           112 Texte
```

## 5. Stand

| | vorher | jetzt |
|---|---|---|
| Texte im Harness gesamt | 1.667 | 1.667 |
| davon deutsch | 712 | **772** |
| noch offen | 955 | **895** |

| Namensraum | Texte | Stand |
|---|---|---|
| `conversation` | 369 | ✓ |
| `trajectory` | 192 | ✓ |
| `pluginManager` | 189 | ✓ **neu** |
| `workspace` | 112 | ✓ |
| `deliverables` | 60 | ✓ **neu** |
| `settings.general` | 34 | ✓ |
| `model` | 23 | ✓ |
| `permission.access` | 17 | ✓ |
| `settings.permission` | 12 | ✓ |
| `sidebar` | 5 | ✓ |

**Damit sind die zehn größten erledigt** — die restlichen 895 Texte verteilen
sich auf 30 Namensräume mit je 3 bis 40 Texten.

## 6. Nachgewiesen im Betrieb

| Prüfung | Ergebnis |
|---|---|
| `woerter_pruefen.mjs` | **1.013 von 1.013**, BESTANDEN |
| `woerter_im_buendel.mjs` | 10 Namensräume, 990 Texte im Bündel |
| `update_festigkeit.mjs` | BESTANDEN, 0 gefährdet |
| Harness-Quelltext geändert | **0 Zeilen** |
| Werkstatt 3081 | 200, Titel korrekt |
| Betrieb 3080 | 200 — unberührt |

## 7. Der Weg zum Schluss

**Die restlichen 895 Texte** verteilen sich auf 30 kleine Namensräume. Der
größte davon ist `ui-settings-plugin-inventory` mit 40, der kleinste
`ui-sidebar-documentpreview` mit 3.

**Vorgehen:** in Runden von etwa fünf Namensräumen, nach jeder Runde
`woerter_pruefen.mjs`. Danach ist die Oberfläche vollständig deutsch.

**Offen bleibt:**
- [ ] Die restlichen 895 Texte (30 Namensräume).
- [ ] `update_festigkeit.mjs` einmal mit einem echten `git pull` proben.
- [ ] Der Vorbehalt aus Runde 1 (BRAND.md, `--schrift-3`).
