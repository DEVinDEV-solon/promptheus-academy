---
type: abnahme
title: "Abnahme Runde 0 — Fundament der PROMPTHEUS-Maske"
description: "Abnahme der Runde 0 des Plans „Deepseek-Dashboard-Maske": zweites Profil promptheus, Paketgerüst @promptheus/dsh-client-ui-promptheus, eigener Bauweg, Nachweis-Knopf am Steckplatz sidebar.footer.action. Mit den tatsächlich gefahrenen Befehlen und ihren Ergebnissen."
tags: [abnahme, promptheus, dashboard, werkstatt, deepseek-harness, runde-0]
timestamp: 2026-09-29T12:05:00+02:00
status: abgenommen
plan: "[[Deepseek-Dashboard-Maske-Plan]]"
---

# Abnahme Runde 0 — Fundament

> **Ergebnis: bestanden.** Das zweite Profil startet auf Port 3081, das eigene
> Paket wird geladen, belegt einen Listen-Steckplatz und stellt seine Bildmarke
> dar. Der heutige Betrieb auf Port 3080 läuft unberührt weiter.

## 1. Was gebaut wurde

| Knoten | Ergebnis | Ort |
|---|---|---|
| **K-PROFIL** | zweites Profil `promptheus` | `C:\Users\PC\.dsh\profiles\promptheus\` (`package.json`, `cordis.patch.yml`, `pnpm-workspace.yaml`) |
| **K-PAKETGERUEST** | Client-Paket mit Node- und Client-Hälfte | `PROMPTHEUS\deepseek-dashboard\pakete\dsh-client-ui-promptheus\` |
| **K-BAUWEG** | Bauen, Prüfen, Starten | `deepseek-dashboard\werkzeuge\bauen.mjs`, `buendel_pruefen.mjs`, `starten.mjs` |
| **K-ABNAHME0** | diese Datei | — |

## 2. Die gefahrenen Befehle und ihre Ergebnisse

Alle Befehle im Arbeitsverzeichnis
`D:\zarbot\tenants\admin\scripts\PROMPTHEUS\deepseek-dashboard`.

### 2.1 Die Komposition prüfen

```
node --import tsx/esm apps/cli/src/bin.ts --profile promptheus --dump-config
```
im Harness-Verzeichnis.

**Ergebnis:** Ausgang 0, 503 Zeilen. Die eigene Zeile steht darin:

```yaml
# == C:\Users\PC\.dsh\profiles\promptheus\cordis.patch.yml
- id: promptheus-maske
  name: '@promptheus/dsh-client-ui-promptheus'
```

Die Web-Zeilen sind vorhanden (`webserver`, `web-runtime`, `modules`), das
Profil bündelt also wirklich die Oberfläche und nicht nur den Kern.

### 2.2 Bauen

```
node werkzeuge/bauen.mjs
```

**Ergebnis:**

```
bauen: Harness      D:\zarbot\tenants\admin\scripts\deepseek-harness
bauen: Profil-Ablage C:\Users\PC\.dsh\profiles\node_modules

  ✓ @promptheus/dsh-client-ui-promptheus
      Client-Bündel  3286 Bytes
      Verweis        C:\Users\PC\.dsh\profiles\node_modules\@promptheus\dsh-client-ui-promptheus
```

### 2.3 Das Bündel prüfen

```
node werkzeuge/buendel_pruefen.mjs
```

**Ergebnis:** `BESTANDEN`. Geprüft wurden Anmeldung, Anforderungen, `apply()`
und der Belegungs-Baustein — in einer nachgebauten Umgebung, ohne Browser.

### 2.4 Die Prüfung gegen einen echten Fehler stellen

Die Prüfung wurde absichtlich gegen ein **kaputtes** Bündel laufen gelassen
(die drei Kopfzeilen entfernt). Ergebnis:

```
  ✗ @promptheus/dsh-client-ui-promptheus
      · die factory stürzte ab — module is not defined
buendel_pruefen: DURCHGEFALLEN (1 Beanstandung(en))
```

Danach wiederhergestellt: wieder `BESTANDEN`. **Damit ist belegt, dass die
Prüfung nicht nur grün leuchtet, sondern den Fehler wirklich fängt.**

### 2.5 Starten

```
node werkzeuge/starten.mjs --port 3081
```

**Ergebnis:**

```
starten: PROMPTHEUS Werkstatt
starten: Profil  promptheus
starten: Adresse http://127.0.0.1:3081

dsh web: http://127.0.0.1:3081
```

### 2.6 Beide Server nebeneinander

| Adresse | Status | Enthält das PROMPTHEUS-Paket? |
|---|---|---|
| `http://127.0.0.1:3080` | 200 | **nein** — heutiger Betrieb, unberührt |
| `http://127.0.0.1:3081` | 200 | **ja** — eigene Maske |

Die Profile sind sauber getrennt. Der heutige Betrieb hat von der ganzen Arbeit
nichts gemerkt.

### 2.7 Das Bündel ausliefern

```
GET http://127.0.0.1:3081/plugins/@promptheus/dsh-client-ui-promptheus/client.js
```

**Ergebnis:** Status 200, 3281 Bytes. Die Kopfzeile `var module = { exports: {} };`
ist vorhanden, der Steckplatz `sidebar.footer.action` steht im Bündel.

## 3. Was unterwegs schiefging

Drei Fehler, alle behoben — sie stehen hier, weil sie beim nächsten Mal wieder
auftreten können.

| Nr. | Fehler | Ursache | Behebung |
|---|---|---|---|
| **F1** | `error: web takes none of parent --profile …` | `web` ist ein fester Kurzname für das Profil `web` und nimmt kein `--profile` an. | Der eigene Profilname geht über den **Wurzelbefehl**: `--profile promptheus --port 3081`, ohne `web`. |
| **F2** | `failed to import loader entry …: module is not defined` | Dem Bündel fehlten die Kopfzeilen, die `module` und `exports` anlegen. Der Harness-Preset setzt sie (`intro` in `packages/client/tsdown.client.ts`); der eigene esbuild-Bauweg tat es nicht. | Drei Zeilen im Bauweg ergänzt (`var module = …`). |
| **F3** | Der Browser ging bei jedem Start auf | `--no-open` fehlte. | Vorgabe im Startskript ist jetzt „nicht öffnen"; `--open` schaltet es ein. |

**F2 ist der wichtige.** Er zeigt, warum der eigene Bauweg so genau dokumentiert
sein muss: die Trägerform des Bündels ist ein Vertrag mit der Modultabelle des
Browsers, und esbuild kennt ihn nicht von allein. Deshalb gibt es jetzt
`buendel_pruefen.mjs`.

## 4. Prüfliste

- [x] Das zweite Profil startet auf einem **anderen Port** (3081).
- [x] Der heutige Betrieb auf 3080 läuft weiter und ist unberührt.
- [x] Das eigene Paket wird geladen und belegt `sidebar.footer.action`.
- [x] Das Bündel wird unter `/plugins/<name>/client.js` ausgeliefert.
- [x] `buendel_pruefen.mjs` ist grün **und** fängt den bekannten Fehler.
- [x] Die eigene Zeile steht in der Komposition.
- [x] Ein **Listen**-Steckplatz wurde belegt — es wurde nichts verdrängt (E7).
- [x] Der Harness-Quelltext ist für Runde 0 **nicht** angefasst worden.
- [x] `pnpm run build:lib` und `pnpm run build:web` laufen **grün** (Ausgang 0).

## 5. Die Absicherung: bleibt der Harness heil?

Runde 0 hat den Harness-Quelltext nicht angefasst. Zur Absicherung wurden beide
Baustufen trotzdem gefahren:

| Befehl | Ergebnis |
|---|---|
| `pnpm run build:lib` | **Ausgang 0** — alle Client-Bündel gebaut |
| `pnpm run build:web` | **Ausgang 0** — `✓ built in 6.91s` |
| `pnpm run build` (verbunden) | bricht ab, **aber nicht wegen dieser Runde** (siehe unten) |

**Der Abbruch von `pnpm run build`** liegt an einem Umgebungsproblem von pnpm
unter Windows: das verbindende Skript ruft `scripts/build.ts` auf, das die
Baustufen über `process.execPath` mit `npm_execpath` startet. Dieser Wert zeigt
hier auf `pnpm.exe`, und Node lehnt `.exe` als Modul ab:

```
TypeError [ERR_UNKNOWN_FILE_EXTENSION]: Unknown file extension ".exe"
  …\@pnpm\exe\11.7.0\…\node_modules\@pnpm\exe\pnpm.exe
```

Das ist **unabhängig** von dieser Runde: der Fehler tritt in `build.ts` auf,
bevor irgendein Paket betrachtet wird. Beide Stufen einzeln aufgerufen laufen
sauber durch.

**Prüfung, dass von dieser Runde nichts im Harness liegt:**

```
git status --porcelain -- packages/client packages/bundle apps/web
```

Ergebnis: **keine** Änderung unter `packages/client` und `apps/web`. Unter
`packages/bundle` stehen zwei Änderungen, und sie sind **älter als diese Runde**
— es ist die OpenRouter-Suche, die schon vorher dort lag (`searchProvider:
openrouter-online`, `@promptheus/dsh-web-search-openrouter`).

## 6. Offene Punkte aus Runde 0

- [ ] **Die Sichtprüfung im Browser** steht noch aus. Die Prüfungen belegen,
      dass das Paket lädt und den Steckplatz belegt — sie belegen **nicht**, wie
      der Knopf aussieht. (Kein Browser ist installiert: `ms-playwright` ist leer.)
- [ ] **`pnpm run build` als Ganzes** bleibt an der pnpm-Umgebung hängen. Das
      ist älter als diese Runde und gehört in einen eigenen Vermerk, nicht in
      diesen Plan.
- [ ] Der Verweis in der Profil-Ablage zeigt auf das Arbeitsverzeichnis. Bei
      einem Umzug von `PROMPTHEUS` muss `bauen.mjs` erneut laufen.

## 7. Was Runde 1 braucht

Runde 0 hat die Kette bewiesen. Runde 1 setzt dieselbe Bewegung an vier weiteren
Stellen: `sidebar.brand.mark`, `sidebar.brand.name`,
`conversation.hero.brand.mark` — diesmal sind es **Einzelplätze**, es wird also
verdrängt, und die Palette kommt als Thema dazu.

Siehe [Deepseek-Dashboard-Maske-Plan](Deepseek-Dashboard-Maske-Plan.md) §5, Runde 1.
