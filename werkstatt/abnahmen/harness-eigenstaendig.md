---
type: abnahme
title: "Abnahme — Der Harness als eigene Fassung in der Werkstatt"
description: "Der DeepSeek Harness liegt vollständig und eigenständig lauffähig in PROMPTHEUS\\werkstatt. Eigene Kopie, eigenes Zuhause ($DSH_HOME), eigener Port, kein iframe. Mit dem Beweis der Eigenständigkeit."
tags: [abnahme, promptheus, werkstatt, deepseek-harness, eigenstaendig, dsh-home]
timestamp: 2026-09-29T17:20:00+02:00
status: abgenommen
plan: "[[Deepseek-Dashboard-Maske-Plan]]"
---

# Abnahme — Der Harness in der Werkstatt

> **Ergebnis: bestanden.** Die Werkstatt ist eine **eigene, vollständige Fassung**
> des DeepSeek Harness. Sie liegt in `PROMPTHEUS\werkstatt\`, läuft auf Port
> 3081, hat ihr **eigenes Zuhause** und liest ihre Dateien aus **ihrem eigenen**
> Repo. Der Betrieb auf 3080 ist unberührt. **Kein iframe.**

## 1. Was jetzt in der Werkstatt liegt

```
PROMPTHEUS\werkstatt\                     1,39 GB
├── deepseek-harness\   der Harness, vollständig und lauffähig
├── .dsh\               das eigene Zuhause (Profil, Sitzungen, Daten)
├── pakete\             die PROMPTHEUS-Pakete (Marke, deutsche Texte)
├── werkzeuge\          Bauen, Prüfen, Zählen, Starten
├── patches\            die vier Sprachzeilen, als Anleitung
├── abnahmen\           die Abnahmen
├── README.md
└── WERKSTATT-START.bat Doppelklick genügt
```

**Der Doppelklick auf `WERKSTATT-START.bat` startet alles.** Kein Terminal, kein
Befehl. Der Harness, das Profil und die Pakete liegen alle im selben Ordner.

## 2. Warum kopiert und nicht verschoben

Der Harness **war der Server, der diese Arbeit ausgeliefert hat** (Port 3080,
`dsh-base` zeigte in dieses Verzeichnis). Ein Verschieben hätte die laufende
Sitzung mitten im Lauf abgeschnitten. Deshalb eine Kopie — und die lässt sich
prüfen, ohne etwas zu riskieren.

## 3. Der Weg der Kopie (und ein Irrweg)

**Der Irrweg zuerst.** Der erste Versuch kopierte alles mit `robocopy /E`. Das
Ergebnis war **falsch**:

| | |
|---|---|
| Quelle | 1,51 GB, 73.415 Dateien |
| Kopie nach `robocopy /E` | **2,96 GB, 120.381 Dateien** |

**Der Grund:** `node_modules` enthält bei pnpm **71 Junctions** (Verweise).
Robocopy kopiert einen Verweis als **echtes Verzeichnis** — die Kopie bläht sich
auf, und die pnpm-Struktur ist gebrochen. Geprüft und belegt: die Kopie trug
`LinkType: (leer)` statt `Junction`.

**Der richtige Weg:**

1. Quelltext kopieren **ohne** `node_modules` und `.git` → 0,13 GB
2. `pnpm install` im Zielordner → erzeugt `node_modules` **mit Junctions**

Ergebnis: **1,39 GB, 73.591 Dateien**, `LinkType: Junction` — wie im Original,
nur kleiner (ohne `.git`, das 0,12 GB groß ist).

## 4. Das eigene Zuhause — der wichtigste Punkt

**Hier lag eine Falle, die erst Tage später aufgefallen wäre.**

Der Harness legt **alle** Benutzerdaten unter `$DSH_HOME` ab — nicht im Repo:

| Was | Wo |
|---|---|
| die Profile | `$DSH_HOME/profiles/` |
| die Sitzungen | `$DSH_HOME/sessions/` |
| Einstellungen und Zugangsdaten | `$DSH_HOME/settings.yaml`, `.credentials.yaml` |
| der flache Modulrückfall | `$DSH_HOME/profiles/node_modules/` |

Ohne eigenes Zuhause hätten sich **beide Fassungen `C:\Users\PC\.dsh` geteilt**.
Und `healProfilesModuleFallback` legt dort **je Paket einen Verweis** an: der
zuletzt gestartete Harness hätte die Verweise des anderen **umgeschrieben** — die
Werkstatt hätte plötzlich Pakete aus dem fremden Repo geladen, oder umgekehrt.

**Die Behebung:** die Werkstatt hat ihr eigenes Zuhause.

```
D:\zarbot\tenants\admin\scripts\PROMPTHEUS\werkstatt\.dsh
```

`starten.mjs` setzt es, `bauen.mjs` legt den Modulverweis dorthin. Beide
Werkzeuge nennen denselben Ort — das war zuerst **nicht** so und ist der Fehler,
der beim ersten Start auftrat:

```
Error: Cannot find package '@promptheus/dsh-client-ui-promptheus'
  imported from ...\werkstatt\.dsh\profiles\promptheus\
```

`bauen.mjs` schrieb den Verweis noch ins globale Zuhause, `starten.mjs` suchte
ihn im eigenen. Behoben, und der alte Verweis im globalen Zuhause wurde
**entfernt** — er gehörte dort nicht hin.

## 5. Der Beweis der Eigenständigkeit

Nicht behauptet, sondern gemessen. Die Werkstatt-Kopie wurde an einer Stelle
sichtbar markiert (`apps/web/dist/manifest.webmanifest`), dann wurden **beide**
Server gefragt:

| Server | Antwort |
|---|---|
| `http://127.0.0.1:3081` (Werkstatt) | `"name": "WERKSTATT-KOPIE"` |
| `http://127.0.0.1:3080` (Betrieb) | `"name": "DeepSeek Harness"` |

**Zwei verschiedene Antworten aus zwei verschiedenen Repos.** Damit ist belegt:
die Werkstatt liest ihre Dateien aus ihrem eigenen Ordner, nicht aus dem alten.
Die Markierung wurde danach zurückgenommen.

## 6. Was läuft

| Prüfung | Ergebnis |
|---|---|
| `http://127.0.0.1:3081/` | 200, Maske geladen |
| `http://127.0.0.1:3080/` | 200 — Betrieb unberührt |
| `buendel_pruefen.mjs` | BESTANDEN |
| `woerter_pruefen.mjs` | 117 von 117 Texten auf Deutsch |
| `kontrast_pruefen.mjs` | 22 Messungen, 0 unter der Schwelle |
| Der Harness startet aus der Kopie | ja (`dsh web: http://127.0.0.1:3081`) |

## 7. Was das für die Einbettung heißt

**Keine Einbettung. Ein Menü-Link.** So war es gewünscht, und technisch ist es
der einzige saubere Weg:

- Die Academy ist **PHP auf einem Webserver**, die Werkstatt ist ein
  **Node-Prozess** auf dem Rechner. Zwei Laufzeiten — ein iframe könnte daran
  nichts ändern.
- Der Harness **weist fremde Ursprünge ab**, auch eingebettete Rahmen
  (`api-request-trust.ts`: der Ursprung `null` eines eingebetteten Rahmens wird
  „refused"). Das ist Absicht, kein Versehen.
- Ein Menü-Link in die Werkstatt ist deshalb nicht der zweitbeste Weg, sondern
  **der richtige**: die Werkstatt läuft eigenständig, im eigenen Fenster, mit
  eigenem Brand und eigenem Zuhause.

**Was dafür noch fehlt:** ein Link in der Academy-Oberfläche, der die Werkstatt
startet. Die Werkstatt läuft auf demselben Rechner wie der Nutzer; ob der Link
nur den Startbefehl auslöst oder ob die Werkstatt als Dienst bereitsteht, ist
eine eigene Entscheidung (Plan §5, Runde 3).

## 8. Offen

- [ ] **Sichtprüfung im Browser** — kein Browser installiert.
- [ ] **Runde 2 fortsetzen:** die übrigen 17 Namensräume (534 Texte).
- [ ] **Der Menü-Link** aus der Academy in die Werkstatt.
- [ ] **Der leere alte Ordner** `deepseek-dashboard\` (null Dateien, verschwindet
      beim nächsten Rechnerstart).
- [ ] **Der Vorbehalt aus Runde 1:** `BRAND.md` widerspricht sich bei
      `--schrift-3` — siehe `runde-1.md` §3.
