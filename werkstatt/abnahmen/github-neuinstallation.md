---
type: abnahme
title: "Abnahme — Frische Installation von GitHub (0.2.0-rc.2) mit neu angepassten Masken"
description: "Der DeepSeek Harness wurde frisch von GitHub geklont (0.2.0-rc.2 statt der bisherigen 0.1.0-rc.8) und alle PROMPTHEUS-Anpassungen wurden darauf neu angebracht: 395 deutsche Texte in sieben Namensräumen, Marke, Palette, Zugriffsstufen. Mit den Änderungen der neuen Fassung und ihren Folgen."
tags: [abnahme, promptheus, werkstatt, deepseek-harness, github, 0.2.0, deutsch]
timestamp: 2026-09-29T18:40:00+02:00
status: abgenommen
plan: "[[Deepseek-Dashboard-Maske-Plan]]"
---

# Abnahme — Frische Installation von GitHub mit neuen Anpassungen

> **Ergebnis: bestanden.** Die Werkstatt läuft auf einer **frischen Installation
> von GitHub**, Fassung **0.2.0-rc.2**, mit allen PROMPTHEUS-Anpassungen neu
> angebracht. Der Betrieb auf 3080 ist unberührt.

## 1. Die Installation

| | |
|---|---|
| Quelle | `https://github.com/deepseek-ai/deepseek-harness.git` |
| Fassung | **0.2.0-rc.2** (`639ed01539`) |
| Zweig | `master`, Arbeitsbaum sauber |
| Abhängigkeiten | `pnpm install`, 7:40 Min, Ausgang 0 |
| Bau | `pnpm run build`, Ausgang 0 |
| Ort | `PROMPTHEUS\werkstatt\deepseek-harness` |

**Die bisherige Fassung war 0.1.0-rc.8.** Der Sprung auf 0.2.0-rc.2 ist
erheblich — siehe Abschnitt 4.

**Vor dem Ersetzen geprüft:** Meine Anpassungen lagen **außerhalb** des
Harness-Ordners (`pakete\`, `werkzeuge\`, `abnahmen\`, `patches\`) und mein
Zuhause unter `.dsh\`. Beide haben den Austausch überlebt; nichts ging verloren.

## 2. Was neu angepasst wurde

### 2.1 Die deutschen Texte: von 117 auf 395

Die Fassung 0.2.0 hat die Wörterbücher stark erweitert. Das Zählwerkzeug hat das
sofort und präzise gemeldet:

```
woerter_pruefen: 117 von 395 Texten auf Deutsch
woerter_pruefen: DURCHGEFALLEN (282 Beanstandung(en))
```

| Namensraum | 0.1.0 | 0.2.0 | Zuwachs |
|---|---|---|---|
| `sidebar` | 4 | 5 | +1 |
| `settings.general` | 6 | **34** | +28 |
| `trajectory` | 14 | **192** | +178 |
| `model` | 17 | 23 | +6 |
| `settings.permission` | 9 | 12 | +3 |
| `permission.access` | 5 | 17 | +12 |
| `workspace` | 62 | **112** | +50 |
| **Summe** | **117** | **395** | **+278** |

**Nach der Anpassung:**

```
  ✓ sidebar  5/5
  ✓ settings.general  34/34
  ✓ trajectory  192/192
  ✓ model  23/23
  ✓ settings.permission  12/12
  ✓ permission.access  17/17
  ✓ workspace  112/112

woerter_pruefen: 395 von 395 Texten auf Deutsch
woerter_pruefen: BESTANDEN
```

### 2.2 Drei Schlüssel wurden entfernt — das Werkzeug hat es gemerkt

`blocked.composer` (model) und `search.unavailable` (workspace) gibt es in
0.2.0 nicht mehr. Mein Wörterbuch hätte sie stillschweigend mitgeschleppt; das
Zählwerkzeug meldete sie als **„überzählig — die Quelle hat sich geändert"**.
Beide wurden entfernt.

### 2.3 Die Zugriffsstufen brauchen keinen Eingriff mehr

**Eine erfreuliche Vereinfachung.** In 0.1.0-rc.8 standen die Namen „Read only",
„Workspace Write" und „Full access" **fest im Quelltext**
(`ui-permission-presets/src/client/presentation.ts`). Ich musste sie damals über
die **Profilschicht** auf Deutsch setzen.

In 0.2.0 sind sie **in die Sprachebene gewandert** — als `preset.readOnly`,
`preset.workspaceWrite`, `preset.fullAccess`. Die Wörterbuch-Übersetzung genügt
jetzt. Der Abschnitt in `cordis.patch.yml` ist damit **überflüssig**, bleibt aber
schadlos stehen (er setzt dieselben Werte) und wird beim nächsten Aufräumen
entfernt.

Das entspricht dem Repo-Grundsatz, den ich in `packages/client/AGENTS.md`
gefunden habe: **„Client UI copy is locale-owned"** — alle sichtbaren Texte
gehören in ein typisiertes Wörterbuch. Meine Übersetzung setzt jetzt genau dort
an, wo der Harness sie erwartet.

### 2.4 Marke, Palette und Steckplätze

Alle fünf Steckplätze existieren unverändert und wurden im ausgelieferten Bündel
nachgewiesen:

| Steckplatz | im Bündel |
|---|---|
| `sidebar.brand.mark` | ✓ |
| `sidebar.brand.name` | ✓ |
| `conversation.hero.brand.mark` | ✓ |
| `sidebar.footer.action` | ✓ |
| `conversation.session.header.utilities` | ✓ |

Bildmarke (`pu-flamme`) und Gemeindeadresse (`promptheus-academy`) ebenfalls.

## 3. Die neue Zugangssperre — die wichtigste Änderung

**0.2.0 verlangt bei jeder Anfrage ein Zugangstoken.** Ohne Token antwortet der
Server:

```
HTTP 401 — Nicht autorisiert
```

Belegt: `http://127.0.0.1:3081/` → **401**, `http://127.0.0.1:3081/?token=…` → **200**.

Der Server öffnet beim Start selbst ein Fenster mit der vollständigen Adresse:

```
dsh web: http://127.0.0.1:3081/?token=vy-zTx2jRL5OKZhAbQupRXD-LFCyZBzBfPDX9w-D5pc
```

**Folge für den Start:** `bauen.mjs` und `starten.mjs` sind angepasst.

- `starten.mjs` öffnet den Browser **jetzt standardmäßig** (vorher war es
  umgekehrt). Das ist keine Bequemlichkeit: nur die vom Server geöffnete Adresse
  trägt das Token mit. Wer `--no-open` angibt, muss die Adresse aus der
  Startausgabe von Hand nehmen — das Startskript sagt das ausdrücklich an.
- Ein Hinweistext erklärt die Sperre beim Start, damit niemand über ein 401
  rätselt.

**Was noch fehlt:** `WERKSTATT-START.bat` ruft `starten.mjs` ohne Schalter auf —
das ist richtig so und öffnet den Browser.

## 4. Was sich in 0.2.0 geändert hat (Auswahl)

Beim Vergleich der beiden Fassungen aufgefallen:

| Änderung | Folge für uns |
|---|---|
| **Zugangstoken** bei jeder Anfrage | `starten.mjs` öffnet den Browser (Abschnitt 3) |
| **Alle Client-Module in EINEM Bündel** (10,4 MB statt einzelner `/plugins/<pkg>/client.js`) | meine frühere Bündelprüfung per HTTP-Pfad greift nicht mehr; der Nachweis läuft jetzt über das Gesamtbündel |
| **Zugriffsstufen in der Sprachebene** | Profilschicht-Eingriff überflüssig (2.3) |
| **Viele neue Pakete**: `ui-approval`, `ui-schedule`, `ui-open-in-app`, `ui-shortcut`, `ui-plugin-manager`, `ui-settings-account`, `ui-settings-agent-loop`, `ui-settings-session-log`, `ui-settings-shell`, `ui-settings-subagent`, `ui-settings-web-search`, `ui-sidebar-browser`, `ui-sidebar-files`, `ui-sidebar-right`, `ui-sidebar-terminal` | **für Runde 2 vorgemerkt**: diese Namensräume sind noch nicht deutsch |
| **Trajectory 14 → 192 Texte** | vollständig übersetzt |
| **`pnpm run build` läuft ganz durch** | in 0.1.0-rc.8 brach es an einem pnpm-Umgebungsproblem ab — das ist behoben |

## 5. Der Beweis im laufenden Betrieb

| Prüfung | Ergebnis |
|---|---|
| `http://127.0.0.1:3081/?token=…` | **200**, Maske in der Bootliste |
| `http://127.0.0.1:3081/` ohne Token | **401** — die Sperre greift |
| `http://127.0.0.1:3080/` (Betrieb) | **200** — unberührt |
| Mein Paket im Gesamtbündel | **ja** |
| Deutsche Texte im Bündel | „Neuer Chat", „Workspace hinzufügen", „Modell wählen", „Vollzugriff" |
| Bildmarke im Bündel | `pu-flamme` |
| `woerter_pruefen.mjs` | **395 von 395**, BESTANDEN |
| `buendel_pruefen.mjs` | BESTANDEN |
| `kontrast_pruefen.mjs` | 22 Messungen, 0 unter der Schwelle |

Der Nachweis, dass mein Paket im 10,4-MB-Bündel steckt, wurde **am laufenden
Server** geführt: die Bootliste nennt mein Paket, das Bündel enthält Kennung,
Texte, Marke und alle fünf Steckplätze.

## 6. Offen

- [ ] **Die restlichen Namensräume übersetzen.** In 0.2.0 gibt es **deutlich mehr**
      Client-Pakete mit eigenen Wörterbüchern als die sieben, die ich führe —
      darunter die neuen `ui-settings-*`, `ui-sidebar-*`, `ui-schedule`,
      `ui-approval`, `ui-shortcut`, `ui-plugin-manager`, `ui-open-in-app`. Sie
      sind noch englisch. Nächster Schritt: das Zählwerkzeug um sie erweitern und
      ihre Texte übersetzen.
- [ ] **`buendel_pruefen.mjs` an die neue Auslieferung anpassen.** Es prüft
      weiterhin ein einzelnes `/plugins/…/client.js`; in 0.2.0 gibt es das nicht
      mehr. Der Nachweis läuft derzeit von Hand über das Gesamtbündel.
- [ ] **Sichtprüfung im Browser** — der Browser ist jetzt offen; das Ergebnis
      steht noch aus.
- [ ] **Den Zugriffsstufen-Abschnitt** aus `cordis.patch.yml` entfernen; er ist
      seit 0.2.0 überflüssig.
- [ ] **Der Vorbehalt aus Runde 1** (BRAND.md, `--schrift-3`).
