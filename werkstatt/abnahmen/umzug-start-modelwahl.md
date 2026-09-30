---
type: abnahme
title: "Abnahme — Umzug, Start, Modelwahl und die ersten deutschen Texte"
description: "Abnahme des Umzugs nach PROMPTHEUS\\werkstatt, der Startdatei WERKSTATT-START.bat, der wiederhergestellten Modelwahl (DEEPSEEK_BASE_URL) und der ersten sieben deutschen Namensräume samt Zählwerkzeug."
tags: [abnahme, promptheus, werkstatt, deepseek-harness, umzug, modelwahl, deutsch]
timestamp: 2026-09-29T16:10:00+02:00
status: abgenommen
plan: "[[Deepseek-Dashboard-Maske-Plan]]"
---

# Abnahme — Umzug, Start, Modelwahl, erste deutsche Texte

> **Ergebnis: bestanden.** Die Maske liegt jetzt unter
> `PROMPTHEUS\werkstatt\`, startet auf 3081, die Modelwahl ist wieder
> bedienbar, und 117 Texte in sieben Namensräumen stehen auf Deutsch.

## 1. Der Umzug

| | vorher | nachher |
|---|---|---|
| Quelle | `PROMPTHEUS\deepseek-dashboard\` | `PROMPTHEUS\werkstatt\` |
| Betrieb | Port 3081, Profil `promptheus` | unverändert |
| Harness | unangetastet | unangetastet |

Der Zielordner war **leer** (null Dateien), es musste nichts zusammengeführt
werden. Der Modulverweis in der Profil-Ablage zeigt jetzt auf den neuen Ort:

```
C:\Users\PC\.dsh\profiles\node_modules\@promptheus\dsh-client-ui-promptheus
  → D:\zarbot\tenants\admin\scripts\PROMPTHEUS\werkstatt\pakete\dsh-client-ui-promptheus
```

Nach dem Umzug lief `bauen.mjs` einmal — damit ist der Verweis neu gesetzt.

**Ein Rest bleibt:** der leere alte Ordner `deepseek-dashboard\` lässt sich noch
nicht löschen, weil ein Prozess ihn als Arbeitsverzeichnis hält. Er enthält
**null Dateien** und verschwindet nach dem nächsten Neustart des Rechners.

## 2. Der Start (WERKSTATT-START.bat)

**Fehler 1 — das falsche Profil.** Die Datei rief `pnpm dsh web`. `web` ist im
Harness ein **fester Kurzbefehl für das Profil `web`** (`apps/cli/src/args.ts`,
Zeile 156) — damit startete sie immer den Betrieb auf **3080**, nie die Maske.
Port 3081 konnte so nie aufgehen, egal was im Titel stand.

**Fehler 2 — die Zeilenenden.** Die Datei hatte **Unix-Zeilenenden** (nur LF,
kein CRLF). Windows-Batch bricht daran ab, und zwar mit einer Meldung, die auf
etwas ganz anderes zeigt:

```
Der Befehl "PROMPTHEUS" ist entweder falsch geschrieben oder
konnte nicht gefunden werden.
Der Befehl "m" ist entweder falsch geschrieben oder
konnte nicht gefunden werden.
```

Die Zeile `echo  PROMPTHEUS Werkstatt` wurde also nicht als `echo` gelesen,
sondern das erste Wort als Befehl. Geprüft und belegt: die Datei hatte
**0 CRLF** und 45 LF.

**Die Behebung:** beide Fehler. Die Datei ruft jetzt das Startwerkzeug der
Maske auf (`node werkzeuge\starten.mjs`), und die Zeilenenden sind auf CRLF
umgestellt (45 CRLF, kein BOM).

**Gefahren und geprüft** — die Datei läuft:

```
 PROMPTHEUS Werkstatt
 ---------------------------------------------
 Maske    : D:\zarbot\tenants\admin\scripts\PROMPTHEUS\werkstatt
 Adresse  : http://127.0.0.1:3081
 Profil   : promptheus

starten: Anbieter https://openrouter.ai/api/v1
```

Sie endete danach mit Ausgang 1, weil Port 3081 **schon belegt** war — die
Maske lief zu diesem Zeitpunkt bereits. Das ist der erwartete Fall, kein Fehler.

## 3. Die Modelwahl — die eigentliche Ursache

**Das war der wichtigste Fund.** Die Modelwahl war nicht kaputt, sie bekam
nichts zu wählen.

| | |
|---|---|
| Der Schlüssel in `.env` | `OPENROUTER_API_KEY` = `sk-or-v1-…` |
| Der Anbieter ohne `DEEPSEEK_BASE_URL` | `https://api.deepseek.com` (`PUBLIC_BASE_URL`) |
| Das Ergebnis | **HTTP 401** — „Authentication Fails, Your api key … is invalid" |

Der Harness fragte also die **DeepSeek**-Schnittstelle mit einem
**OpenRouter**-Schlüssel. Die Modellliste blieb leer, und die Auswahl liess sich
nicht bedienen — ohne dass irgendwo stand, warum.

**Gemessen, nicht vermutet** (beide Proben gefahren):

| Probe | Ergebnis |
|---|---|
| `api.deepseek.com` mit diesem Schlüssel | **HTTP 401** |
| `openrouter.ai/api/v1` mit diesem Schlüssel | **HTTP 200**, Antwort kommt |
| `openrouter.ai/api/v1/models` | 460 Modelle erreichbar |

**Die Behebung:** `starten.mjs` setzt `DEEPSEEK_BASE_URL=https://openrouter.ai/api/v1`
und hebt den Schlüssel aus der `.env` in die Umgebung. Es meldet beides beim
Start an — fehlt der Schlüssel, sagt es das, statt still zu scheitern:

```
starten: Anbieter https://openrouter.ai/api/v1
starten: Schlüssel OPENROUTER_API_KEY
```

## 4. Die deutschen Texte

Die ersten **sieben Namensräume**, 117 Texte:

| Namensraum | Texte | Was |
|---|---|---|
| `sidebar` | 4 | „Neuer Chat", Seitenleiste |
| `settings.general` | 6 | „Einstellungen" |
| `trajectory` | 14 | „Verlauf" und seine Werkzeugleiste |
| `model` | 17 | „Modell wählen" |
| `settings.permission` | 9 | Zugriffsstufe in den Einstellungen |
| `permission.access` | 5 | Zugriffsfenster der laufenden Sitzung |
| `workspace` | 62 | „Workspace hinzufügen", Chat-Liste |

**Zwei Befunde unterwegs:**

1. **Der Namensraum des Zugriffsfensters heisst `permission.access`**, nicht
   `settings.permission.access`. Die beiden Fenster führen ihre Texte bewusst
   getrennt (`ACCESS_NS` in `ui-permission-presets/src/client/index.ts:46`).
   Ein falscher Name hätte bedeutet: stilvoll übersetzt und nie angezeigt.

2. **Die drei Zugriffsstufen-Namen stehen NICHT in der Sprachebene.** „Read
   only", „Workspace Write" und „Full access" sind **Konfiguration**: der Client
   liest sie aus `meta.description` der Zeile
   (`settings-store.ts:67`). Sie lassen sich deshalb in **unserer Profilschicht**
   auf Deutsch setzen, ohne ein Stück Harness-Quelltext anzufassen:

   ```yaml
   - id: permission
     config:
       presets:
         read-only:        { …, name: Nur lesen,          description: Nur lesen }
         workspace-write:  { …, name: Workspace schreiben, description: Workspace schreiben }
         danger-full-access: { …, name: Vollzugriff,       description: Vollzugriff }
   ```

## 5. Das Zählwerkzeug

```
node werkzeuge/woerter_pruefen.mjs
```

```
  ✓ sidebar  4/4
  ✓ settings.general  6/6
  ✓ trajectory  14/14
  ✓ model  17/17
  ✓ settings.permission  9/9
  ✓ permission.access  5/5
  ✓ workspace  62/62

woerter_pruefen: 117 von 117 Texten auf Deutsch
woerter_pruefen: BESTANDEN
```

Es liest die Schlüssel **aus den Harness-Dateien** (Soll) und die deutschen
**aus dem gebauten Bündel** (Ist) und meldet drei Arten von Fehlern:

- **fehlende** Schlüssel — ein Text bliebe englisch, ohne dass man sieht warum;
- **überzählige** Schlüssel — die Quelle hat sich geändert;
- **verlorene Platzhalter** — `{n}` fehlt, dann bricht die Anzeige.

**Ohne dieses Werkzeug wäre „alles übersetzt" eine Behauptung.**

## 6. Was läuft

| Prüfung | Ergebnis |
|---|---|
| `http://127.0.0.1:3081/` | 200, PROMPTHEUS-Paket geladen |
| Bündel unter `/plugins/…/client.js` | 200, 16 968 Bytes |
| `buendel_pruefen.mjs` | BESTANDEN |
| `kontrast_pruefen.mjs` | 22 Messungen, 0 unter der Schwelle |
| `woerter_pruefen.mjs` | 117 von 117 |
| `http://127.0.0.1:3080/` | 200 — heutiger Betrieb unberührt |

## 7. Offen

- [ ] **Runde 2 fortsetzen:** die übrigen **17 Namensräume** (534 Texte), darunter
      `ui-conversation` mit 170.
- [ ] **Sichtprüfung im Browser** — kein Browser installiert. Sie würde zeigen,
      ob die deutschen Texte in den Rahmen passen; deutsche Wörter sind länger
      als englische.
- [ ] **Der leere alte Ordner** `deepseek-dashboard\` (null Dateien).
- [ ] **Die Einbettung** in die Academy-Seite — eigene Entscheidung, siehe
      Plan §5 Runde 3 und die Besprechung vom 29.09.2026.
