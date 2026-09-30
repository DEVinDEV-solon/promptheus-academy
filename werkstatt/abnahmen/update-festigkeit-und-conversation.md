---
type: abnahme
title: "Abnahme — Update-Festigkeit und der größte Namensraum (conversation)"
description: "Zwei Dinge: (1) Nachgewiesen, dass alle Anpassungen ein DeepSeek-Update überstehen — kein Eingriff im Harness-Quelltext, alles außerhalb oder in gebauten Dateien. (2) Der größte Namensraum conversation mit 369 Texten übersetzt. Fortschritt 343 -> 712 von 1667."
tags: [abnahme, promptheus, werkstatt, uebersetzung, update, conversation]
timestamp: 2026-09-29T19:20:00+02:00
status: abgenommen
plan: "[[Deepseek-Dashboard-Maske-Plan]]"
---

# Abnahme — Update-Festigkeit und `conversation`

> **Beides erfüllt.** Alle Anpassungen überstehen ein Update (nachgewiesen), und
> der größte Namensraum ist mit **369 von 369** Texten vollständig deutsch.

## 1. Die Anforderung

> „Alle Anpassungen müssen auch DeepSeek-Updates in Zukunft überstehen!"

Das ist keine Nebenbedingung, sondern die **wichtigste** — eine Anpassung, die
ein Update zerstört, ist keine Anpassung, sondern eine Schuld. Deshalb wurde
zuerst geprüft, nicht übersetzt.

## 2. Der Befund: kein Eingriff im Harness

```
cd deepseek-harness && git status --porcelain
   -> 0 Zeilen
```

**Der Harness-Quelltext ist unberührt.** Alle Anpassungen liegen daneben.

## 3. Wo jede Anpassung liegt — und was ein Update mit ihr macht

Ein Update ist `git pull` → `pnpm install` → Neubau. Drei Fälle:

| Fall | Was `git pull` tut | Was der Neubau tut |
|---|---|---|
| **außerhalb des Harness** | berührt nichts | berührt nichts |
| **im Harness, von Git ignoriert** (`lib/`, `dist/`) | berührt nichts | **überschreibt** |
| **im Harness, versioniert** | **kann überschreiben** | — |

| Anpassung | Ort | Fall |
|---|---|---|
| Sprachpaket, Marke, Palette | `werkstatt\pakete\` | **außerhalb** |
| Node-Hälfte (Titel, Favicon) | `werkstatt\pakete\…\src\index.ts` | **außerhalb** |
| Profil (Kompositionsschicht) | `werkstatt\.dsh\profiles\promptheus\` | **außerhalb** |
| Deutsche Zugriffsstufen | in derselben Profilschicht | **außerhalb** |
| Eigenes Zuhause (Zugangsdaten, Sitzungen) | `werkstatt\.dsh\` | **außerhalb** |
| **Browser-Titel** | `packages/client/ui-layout/lib/client.js` | gebaut, ignoriert |
| **Titel in der Seite** | `apps/web/dist/index.html` | gebaut, ignoriert |

**Der einzige Fall mit Neubau-Bedarf ist der Browser-Titel.** Er wird beim Bau
eingebacken (`DSH_CLIENT_TITLE`) und liegt deshalb in gebauten Dateien. Beide
sind von Git ignoriert (`git check-ignore` bestätigt: `.gitignore:39` für
`dist/`, `.gitignore:7` für `lib/`) — ein `git pull` rührt sie also nicht an.
Ein Neubau überschreibt sie, und `bauen.mjs` setzt den Titel dann neu.

**Gefährdete Anpassungen: 0.**

## 4. Das Prüfwerkzeug

`werkzeuge\update_festigkeit.mjs` prüft jede Anpassung: ihren Ort, ihre Lage
gegenüber Git und — wo sinnvoll — ihren **Inhalt**. Es fragt Git selbst
(`git ls-files`, `git check-ignore`) statt zu vermuten.

```
  ✓ Sprachpaket, Marke, Palette (395 deutsche Texte)
      Lage: SICHER (außerhalb des Harness)
  …
  ✓ Browser-Titel (im gebauten Bündel)
      Lage: SICHER vor git pull — aber Neubau nötig · Inhalt vollständig

  gefährdet (unter Versionskontrolle)              : 0
  fehlend                                          : 0

update_festigkeit: BESTANDEN
```

## 5. Das Verfahren nach einem Update

```
1. cd deepseek-harness && git pull && pnpm install
2. node werkzeuge\bauen.mjs                 (setzt den Titel neu, baut unser Paket)
3. node werkzeuge\update_festigkeit.mjs     (diese Prüfung)
4. node werkzeuge\woerter_pruefen.mjs       (Texte gegen den neuen Stand)
```

**Schritt 4 ist wichtig:** Bringt ein Update neue Schlüssel, meldet das
Zählwerkzeug sie als fehlend und nennt sie beim Namen. Dann wird nur der
fehlende Rest übersetzt — nicht alles neu.

## 6. Der größte Namensraum: `conversation`

**369 Texte, alle übersetzt.** Quelle:
`packages/client/ui-conversation/src/client/locales.ts`.

Der Namensraum deckt die gesamte Gesprächsfläche ab: Eingabezeile,
Anhänge, Bilder, Aufgabenliste, Werkzeugtitel und -einzelheiten, Zeitpläne,
Rückfragen, Warteschlange, Terminal.

### Die Begriffe, die jetzt durchgehalten werden

| Englisch | Deutsch |
|---|---|
| Session | **Chat** |
| Turn | **Runde** |
| Step | **Schritt** |
| Tool | **Werkzeug** |
| Queue | **Warteschlange** |
| Steer | **Einwurf** |
| Schedule | **Zeitplan** |
| Attachment | **Anhang** |

### Drei Stellen, die Sorgfalt brauchten

1. **Die Befehlsnamen bleiben englisch.** In `hint.goal.active` stehen `edit`,
   `pause`, `resume`, `clear` — das sind **Befehle**, keine Beschriftungen. Sie
   mussten unverändert bleiben, sonst hätte der Hinweis auf nichts gezeigt.
2. **31 Platzhalter** (`{count}`, `{size}`, `{kilobytes}`, `{sessionId}` …)
   blieben unverändert. `woerter_pruefen.mjs` prüft das je Schlüssel.
3. **Deutsche Fassungen eher kürzer.** Viele Texte sitzen in Knöpfen, die für
   das Englische bemessen sind. „Collapse calls" wird zu „Aufrufe einklappen" —
   wo es ging, wurde gekürzt statt erweitert.

### Eine Strukturentscheidung

`woerter.ts` wurde bei 369 Einträgen unübersichtlich. Die neuen Texte liegen
deshalb in **`woerter/gespraech.ts`** — ein Namensraum, eine Datei. Ein
Harness-Update lässt sich so je Namensraum nachziehen.

## 7. Ein Fehler im Werkzeug, der dabei auffiel

Beim Zählen fehlten zunächst genau die zwei **größten** Pakete
(`ui-conversation` 369, `ui-trajectory` 192). Die Ursache war ein **gieriges**
Muster (`[^{]*`): es lief über den vorigen Block hinweg bis zur letzten Klammer
und lieferte nur noch einen Treffer — bei `ui-conversation` fand es `en`, aber
nicht `zh`.

**Derselbe Fehler steckte in `woerter_pruefen.mjs`**, dem Prüfwerkzeug. Das ist
der gefährlichere Fall: es hätte die größten Wörterbücher stillschweigend
übersprungen und „bestanden" gemeldet. Beide Werkzeuge suchen die Deklaration
jetzt zeilenweise statt mit einem gierigen Muster.

## 8. Fortschritt

| | vorher | jetzt |
|---|---|---|
| Texte im Harness gesamt | 1.667 | 1.667 |
| davon deutsch | 343 | **712** |
| offen | 1.324 | **955** |

| Namensraum | Texte | Stand |
|---|---|---|
| `conversation` | 369 | **✓ fertig** |
| `trajectory` | 192 | ✓ fertig |
| `workspace` | 112 | ✓ fertig |
| `settings.general` | 34 | ✓ fertig |
| `model` | 23 | ✓ fertig |
| `permission.access` | 17 | ✓ fertig |
| `settings.permission` | 12 | ✓ fertig |
| `sidebar` | 5 | ✓ fertig |

## 9. Nachgewiesen im Betrieb

| Prüfung | Ergebnis |
|---|---|
| `woerter_pruefen.mjs` | **764 von 764**, BESTANDEN |
| `update_festigkeit.mjs` | **BESTANDEN**, 0 gefährdet |
| Deutsche Texte im Bündel | „Nachricht senden", „Warteschlange", „Ins Unbekannte", „Rückfrage", „Werkzeugaufruf" |
| Bündelgröße | 32.929 → **56.748 Bytes** |
| Werkstatt 3081 | **200**, Titel korrekt |
| Betrieb 3080 | **200** — unberührt |
| Harness-Quelltext geändert | **0 Zeilen** |

## 10. Offen

- [ ] **Die nächsten zwei größten:** `ui-plugin-manager` (189) und
      `ui-deliverables` (60) — dann sind es 1.100 von 1.667.
- [ ] **Das Update-Verfahren einmal proben.** Es ist beschrieben und geprüft,
      aber noch nicht mit einem echten `git pull` gefahren.
- [ ] **Die übrigen 955 Texte** in 32 Namensräumen.
- [ ] **Der Vorbehalt aus Runde 1** (BRAND.md, `--schrift-3`).
