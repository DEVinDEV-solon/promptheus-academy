---
type: abnahme
title: "Abnahme — Wal-Logo im Tab und der herdr-Fehler"
description: "Zwei gemeldete Fehler behoben: Der Browser-Tab zeigte im dunklen Farbschema weiter das Wal-Symbol (favicon-dark.svg war nicht bedient), und herdr liess sich nicht aufrufen — die Ursache war ein hängender herdr-Serverprozess, kein Fehler der Werkstatt."
tags: [abnahme, promptheus, werkstatt, favicon, herdr, terminal]
timestamp: 2026-09-29T18:10:00+02:00
status: abgenommen
plan: "[[Deepseek-Dashboard-Maske-Plan]]"
---

# Abnahme — Wal-Logo und herdr-Fehler

> **Beide behoben.** Das Favicon ist jetzt in beiden Farbschemata die
> PROMPTHEUS-Bildmarke, und `herdr` läuft wieder. Der zweite Fehler lag
> **außerhalb** der Werkstatt.

## 1. Das Wal-Logo im Tab

**Die Ursache, gemessen.** Die ausgelieferte Seite trägt nicht einen
Favicon-Verweis, sondern **zwei** — je nach Farbschema des Browsers:

```html
<link rel="icon" href="./favicon-dark.svg" media="(prefers-color-scheme: dark)">
<link rel="icon" href="./favicon.svg"      media="(prefers-color-scheme: light)">
```

Meine Route bediente nur `/favicon.svg` (das helle). Ein Browser im **dunklen**
Schema lädt `favicon-dark.svg` — und bekam die Datei aus dem Harness:

| Pfad | vorher | jetzt |
|---|---|---|
| `/favicon.svg` | 1364 B, Flamme | 1364 B, **Flamme** |
| `/favicon-dark.svg` | **3634 B, Wal** | 1364 B, **Flamme** |

Nachgewiesen an der laufenden Instanz. Beide Pfade liefern dieselbe Marke — das
ist richtig, weil die Bildmarke ihren Grund selbst trägt (`<rect fill="#14110f">`)
und deshalb in hell wie dunkel gleich aussieht.

**Der Browser zeigt die Änderung erst nach einem Neuladen** (Strg+F5): Favicons
werden zäh zwischengespeichert.

## 2. Der herdr-Fehler

**Der Fehler, wie er auftrat:**

```
PS C:\Users\PC> herdr
herdr: Zugriff verweigert (os error 5)
```

**Er trat auch außerhalb der Werkstatt auf.** Das war der erste wichtige Befund:
in einer gewöhnlichen PowerShell, in `cmd`, und im PTY des Harness — überall
derselbe Fehler. Die Werkstatt war also nicht die Ursache.

**Was funktionierte und was nicht** — das Muster führte zur Ursache:

| Aufruf | Ergebnis |
|---|---|
| `herdr --version` | funktioniert |
| `herdr session list` | **funktioniert** (ExitCode 0) |
| `herdr` (Sitzung öffnen) | **Zugriff verweigert** |
| `herdr server stop` | **Zugriff verweigert** |
| `herdr api snapshot` | **Zugriff verweigert** |

Alles, was nur Daten abfragt, kam durch; **alles, was sich mit dem Server
verbindet, wurde abgewiesen.**

**Die Ursache.** Im Protokoll
(`%APPDATA%\herdr\herdr-server.log`) stand:

```
15:25:38  herdr server started            pid=18844
15:25:39  client connected                client_id=2
15:43:57  client disconnected             client_id=2
```

Danach **nichts mehr**. Der Serverprozess (PID 18844) lief weiter, nahm aber
keine neuen Verbindungen mehr an. Die Socket-Dateien trugen seinen
Prozessstempel:

```
herdr.sock         ->  18844:1790695538809315300
herdr-client.sock  ->  18844:1790695539153249600
```

**Der Beweis, dass der Prozess hing:** weder `Stop-Process -Force` noch
`taskkill /F /PID 18844` kamen durch — beide meldeten „Zugriff verweigert",
obwohl der Prozess demselben Benutzer (`MIC\PC`) und derselben
Windows-Sitzung (2) gehörte. Erst **WMI** löste ihn:

```powershell
Invoke-CimMethod -InputObject $c -MethodName Terminate
```

**Die Behebung, in drei Schritten:**

1. Sitzung gesichert (`%APPDATA%\herdr\sicherung-vor-neustart-…`). Die drei
   Panes waren leer — nichts ging verloren.
2. Hängenden Prozess und die drei Panes beendet; Socket-Dateien entfernt.
3. `herdr` frisch gestartet.

**Ergebnis, gemessen im PTY des Harness:**

```
Ausgabe in 8 s: 1874 Zeichen
Beendet: nein — es läuft (gut)
Sichtbarer Text:
  spaces│   1      +
  │PS C:\Users\PC>
```

`herdr` läuft und zeigt seine Oberfläche.

## 3. Das neue Prüfwerkzeug

`werkzeuge\herdr_pruefen.mjs` sagt in einem Satz, welcher Fall vorliegt:
„läuft im PTY" oder „beendet sich sofort". Es startet `herdr` in einem echten
PTY — genau so, wie der Harness seine Terminals startet (`node-pty`, unter
Windows ConPTY).

Bei „Zugriff verweigert" gibt es die drei Schritte aus Abschnitt 2 aus, damit
der nächste Fall schneller gelöst ist.

**Der Werkzeug-Fallstrick ist dokumentiert:** `node-pty` sucht die Datei selbst
und geht **nicht** über den Suchpfad — ein blankes `herdr` scheitert mit
„File not found". Deshalb löst das Werkzeug den vollen Pfad auf und nimmt dabei
die **jüngste** Fassung unter `~/.herdr`, weil der Suchpfad die Versionsnummer
im Ordnernamen trägt (`…\releases\0.9.1-…`) und nach einer Aktualisierung
veraltet wäre.

## 4. Was das für „herdr als Terminal" heißt

**Es ist möglich** — `herdr` läuft in einem PTY, wie gerade bewiesen. Aber es
ist eine Entscheidung mit Folgen:

| | |
|---|---|
| Was du wolltest | im Werkstatt-Terminal erscheint gleich `herdr` statt der Shell |
| Technisch | `shellPath` und `shellArgs` in unserer Profilschicht — kein Harness-Eingriff |
| Die Folge | **jedes** Terminal der Werkstatt wird zu `herdr` |
| Das Risiko | hängt `herdr` wieder, ist das Terminal unbrauchbar — auch für einfache Befehle |
| Was bleibt | die PowerShell als Rückweg gibt es dann nicht mehr |

**Empfehlung:** `herdr` bleibt über die PowerShell aufrufbar (es liegt im
Suchpfad), und wir prüfen zuerst, wie stabil es über einige Tage läuft. Wenn es
sich bewährt, trage ich es als Terminal ein — dann mit dem Wissen, dass der
Rückweg nur über die Profilschicht geht.

**Was ich nicht getan habe:** `herdr` als Terminal eintragen. Der Fehler von
heute zeigt, dass ein hängender `herdr`-Prozess das ganze Terminal lahmlegen
kann. Das gehört entschieden, nicht nebenbei gemacht.

## 5. Stand

| Prüfung | Ergebnis |
|---|---|
| `/favicon.svg` | 1364 B, **Flamme** |
| `/favicon-dark.svg` | 1364 B, **Flamme** |
| `herdr` im PTY | **läuft** (1874 Zeichen, kein Abbruch) |
| herdr-Server | PID 23868, frisch |
| Betrieb 3080 | **200** — unberührt |
| Wörter · Bündel · Kontrast | alle BESTANDEN |

## 6. Offen

- [ ] **Der Browser-Tab** zeigt die Marke erst nach Strg+F5 (Favicon-Zwischenspeicher).
- [ ] **`herdr` als Terminal eintragen** — wartet auf deine Entscheidung (Abschnitt 4).
- [ ] **Die übrigen Wörterbücher** der 0.2.0-Pakete sind noch englisch.
- [ ] **Der Vorbehalt aus Runde 1** (BRAND.md, `--schrift-3`).
