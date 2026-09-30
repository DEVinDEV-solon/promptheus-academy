---
type: abnahme
title: "Abnahme — Titel, Untertitel, Logo, Tab-Anzeige und Favicon"
description: "Vier Änderungen an der Marke umgesetzt: Titel größer, Untertitel +1pt mit gesperrtem Zeichenabstand, Logo an die Zeilenhöhe angepasst, Browser-Titel und Favicon auf PROMPTHEUS gesetzt. Mit einem gefundenen Fehler im Cordis-Exportverhalten, der einen Harness-Fall neu auslöste."
tags: [abnahme, promptheus, werkstatt, marke, favicon, titel]
timestamp: 2026-09-29T20:15:00+02:00
status: abgenommen
plan: "[[Deepseek-Dashboard-Maske-Plan]]"
---

# Abnahme — Vier Änderungen an der Marke

> **Alle vier umgesetzt und im Betrieb nachgewiesen.** Der Tab zeigt
> „Werkstatt — Promptheus Academy", das Favicon ist die PROMPTHEUS-Bildmarke,
> Titel und Untertitel sind größer, und das Logo folgt der Zeilenhöhe.

## 1. Titel und Untertitel

| | vorher | jetzt |
|---|---|---|
| „PROMPTHEUS" (Serife) | 0.76 rem (12,2 px) | **0.82 rem** (13,1 px) |
| „WERKSTATT" (Grotesk) | .42 rem (6,7 px) | **.50 rem** (8,0 px) — ein Punkt mehr |
| Zeichenabstand des Zusatzes | .22em | **.34em** |
| Mäander-Abstand | 2 px | **0** |

**Der Zeichenabstand** ergibt die gewünschte Sperrung: „W E R K S T A T T".
Bei `.34em` auf `.50rem` sind das rund 2,7 px zwischen den Zeichen — sichtbar
gesperrt, aber als Wort noch lesbar. Die vorherigen `.22em` waren dafür zu eng.

**Die Rechnung bleibt eingehalten.** Der Harness gibt der Zeile 24 px
(`SidebarRoot.module.css`: `.brandIdentity { height: 24px }`) und schneidet
Überstand ab (`.logoRow { overflow: hidden }`):

```
13,1 (Titel) + 8,0 (Zusatz) + 2,0 (Mäander) = 23,1 px   von 24 px
```

Die Vergrößerung passt nur, weil der Mäander-Abstand von 2 px auf 0 gesetzt
wurde: die Kante liegt jetzt auf der Grundlinie des Zusatzes. Diese Zahl steht
als Kommentar an der Stelle.

## 2. Das Logo folgt der Zeilenhöhe

Die Bildmarke richtete sich vorher nach dem, was die belegende Stelle anbot
(24 px). Jetzt richtet sie sich nach der **Zeilenhöhe des Schriftzugs**:

```ts
const ZEILENHOEHE = 13.1 + 8.0 + 2.0   // Titel + Zusatz + Mäander
const groesse = Math.min(angeboten, ZEILENHOEHE)
```

Die Höhe ist damit **abgeleitet, nicht gewählt**: sie ist die Summe ihrer
Bestandteile. Wer eine Schriftgröße ändert, ändert die Marke mit — beide können
nicht mehr auseinanderlaufen. Die belegende Stelle setzt weiterhin die Grenze,
damit die Marke in der schmalen Leiste nicht zu groß wird.

## 3. Die Tabanzeige

`<title>Werkstatt — Promptheus Academy</title>` — nachgewiesen an der
ausgelieferten Seite.

**Zwei Wege, beide nötig** — das war die eigentliche Arbeit dieser Runde:

| Weg | Wie | Warum nötig |
|---|---|---|
| **Eingebacken** | `DSH_CLIENT_TITLE` beim Bau gesetzt | Der Harness setzt den Tab-Titel zur **Laufzeit** aus `process.env.DSH_CLIENT_TITLE` (`packages/client/ui-layout/src/client/AppFrame.tsx:233`). Dieser Ausdruck wird beim Bau ersetzt; im ausgelieferten Bündel ist der Wert nicht mehr änderbar. |
| **In der Seite** | Einspeisung über `webserver/index-inject` | Damit der Tab gar nicht erst kurz den Bau-Vorgabewert zeigt, bevor die Oberfläche anläuft. |

**Beide Baustufen müssen mit dem Wert laufen:** `build:lib` (dort steht der
Produktname in den Client-Bündeln) **und** `build:web` (dort steht die
`index.html`). Wer nur eine baut, bekommt entweder den alten Titel im Tab oder
eine Seite, die ihn nicht kennt. `bauen.mjs` fährt jetzt beide.

**Gesetzt wird der Titel in `bauen.mjs`** — nicht im Harness-Quelltext. Eine
Zeile im eigenen Bauwerkzeug, die jede Aufwertung überlebt.

## 4. Das Favicon

`/favicon.svg` liefert jetzt die **PROMPTHEUS-Bildmarke** — nachgewiesen:
Flamme `#ff4d1c`, Mäanderring `#ffc94d`, Pfad `M32 14`.

Die Marke wird aus `PROMPTHEUS\Brand\mark.svg` **gelesen**, nicht abgeschrieben:
das Brand-Kit bleibt die eine Quelle. Fehlt die Datei, liefert die Route nichts,
und der Harness fällt auf sein eigenes Symbol zurück — besser als ein kaputtes
Bild.

Ausgeliefert über `ctx.webServer.register` — eine eigene Route, die jede
Aufwertung überlebt.

## 5. Der gefundene Fehler: `export default` verwirft `inject`

**Das war der harte Teil dieser Runde, und der Harness hat ihn selbst erlebt.**

Titel und Favicon kamen zunächst **nicht** an: die Route wurde registriert, aber
nie erreicht. Die Ursache stand in meiner eigenen Datei:

```ts
export function apply(ctx) { … }
export default apply   // ← der Fehler
```

Der Loader des Harness normalisiert ein geladenes Plugin in
`Loader.unwrapExports`:

```js
exports = exports.default ?? exports
```

Steht ein `default` daneben, löst er auf die **nackte Funktion** auf und wirft
dabei den Namensraum weg, in dem `inject` und `name` stehen. Das Plugin läuft
dann in einer Fiber **ohne einen einzigen deklarierten Dienst** — `ctx.get('webServer')`
findet nichts, und `apply` kehrt still zurück.

Belegt durch die gebaute Datei: sie endete auf

```js
apply,
index_default as default    ← der Namensraum wird verworfen
```

Nach der Korrektur:

```js
apply,
inject,
name
```

**Der Harness hat diesen Fall in `docs/postmortem/0001-acp-default-export-drops-inject.md`
aufgeschrieben** — dort ließ dasselbe Muster den ACP-Server abstürzen, und zwar
bei 100 % Zeilenabdeckung. Die Lehre im Postmortem lautet wörtlich:

> „A namespace plugin and a default export are mutually exclusive under the
> cordis Loader. Pick the namespace form (`name`/`inject`/`Config`/`apply`) and
> do not add `export default`."

Dieser Vermerk steht jetzt als Kommentar in `src/index.ts` an der Stelle, damit
er nicht wieder verlorengeht.

**Ein Unterschied bleibt wichtig:** Im **Client**-Teil ist `export default`
harmlos, weil dessen Bündel über den `module.exports`-Träger läuft (dort liegt
`lib/client.js` als CJS-Ware vor). Nur die **Node**-Hälfte geht durch den
Cordis-Loader, und nur dort ist es der Fehler. Deshalb steht der Vermerk nur dort.

## 6. Nachweise im Betrieb

| Prüfung | Ergebnis |
|---|---|
| `<title>` der ausgelieferten Seite | **Werkstatt — Promptheus Academy** |
| `/favicon.svg` | **200**, 1364 Bytes, Flamme + Mäanderring |
| Schriftwerte im Bündel | `0.82rem`, `.50rem`, `.34em` — **ja** |
| alte Werte (`0.76rem`) | **weg** |
| Node-Hälfte ohne `default` | **ja** (`apply`, `inject`, `name`) |
| `woerter_pruefen.mjs` | BESTANDEN (395 von 395) |
| `buendel_pruefen.mjs` | BESTANDEN |
| `kontrast_pruefen.mjs` | BESTANDEN |
| Betrieb 3080 | **200** — unberührt |

## 7. Offen

- [ ] **Sichtprüfung im Browser.** Alles ist im Bündel und an der ausgelieferten
      Seite nachgewiesen, aber nicht mit eigenen Augen gesehen. Wenn der
      Schriftzug noch nicht sitzt, sind es Feinheiten: `0.82rem` ist gerechnet,
      die Serife kann breiter ausfallen.
- [ ] **Der vollständige `DSH_CLIENT_TITLE`-Wert** gilt erst nach einem Lauf von
      `bauen.mjs` mit beiden Stufen. Wer nur `starten.mjs` fährt, sieht den
      zuletzt gebauten Titel — das ist gewollt, aber wissenswert.
- [ ] **Die übrigen Wörterbücher** der 0.2.0-Pakete sind noch englisch.
- [ ] **Der Vorbehalt aus Runde 1** (BRAND.md, `--schrift-3`).
