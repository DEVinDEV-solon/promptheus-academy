# Abnahme — Farbkasten und der Namensraum-Fehler

**Datum:** 30.09.2026
**Fassung:** Werkstatt 0.1.0, Harness 0.2.0-rc.2 (`639ed01539`)
**Auftrag:** „Ist es möglich, Themen einzubauen, um das Aussehen farblich anzupassen —
wie im Hauptprogramm mit einem voreingestellten Farbkasten?"
**Antwort:** Ja. Sechs Paletten, wählbar im Fenster „Allgemein" der Einstellungen.

---

## 1. Was gebaut wurde

Ein **Farbkasten** mit den **sechs geprüften Paletten des Hauptprogramms** —
wörtlich aus `srv/varianten.php` (`PU_VARIANTEN`):

| Palette | Grundton | Partner | Was sie ist |
|---|---|---|---|
| Schmiede | dunkel | Pergament | die Vorgabe: Glut auf dunklem Grund |
| Pergament | hell | Schmiede | hell und warm, wie ein Buch bei Tageslicht |
| Olymp | dunkel | Marmor | Nachtblau mit Gold, für lange Sitzungen |
| Marmor | hell | Olymp | hell und kühl, für helle Räume |
| Terrakotta | dunkel | Pergament | erdig und warm, gebrannter Ton |
| Funkenflug | dunkel | Marmor | kräftig und bunt, für die jüngeren Stufen |

Es braucht **keine Bilder** — nur die vorhandenen Farbfilter des Harness. Die
Marken, auf die eine Palette wirkt, tragen die ganze Oberfläche.

---

## 2. Die Entscheidung, die den Entwurf bestimmt hat

**`ctx.theme.register` wäre eine Sackgasse gewesen.** Das war der naheliegende
Weg, und er hätte sechs Themen angemeldet, die niemand erreicht:

* Der Farbwähler des Harness führt seine drei Würfel **fest verdrahtet**
  (`ui-theme/src/client/AppearanceRow.tsx`, `CUBES` = hell, dunkel, system).
  Ein angemeldetes Thema erscheint dort **nicht**.
* `ThemeRuntime.setTheme` speichert nur `light`, `dark` und `system` — für jede
  andere Kennung fällt `isThemePreference` falsch aus. Die Wahl wäre nach jedem
  Neuladen wieder weg.

Gewählt wurde deshalb der **Überschreibungs-Layer** (`overrideTokens`) mit einer
**eigenen Einstellungszeile**. Zwei Dinge passten dabei zusammen:

* Der Layer verlangt für jede Marke ein Paar `{ light, dark }` — **genau die
  Form, in die die Partner-Regel des Hauptprogramms passt**: die gewählte
  Palette besetzt ihren Grundton, ihr Partner den anderen.
* Der Harness reicht die Wahl über `theme/change` zurück. Damit stimmen
  Harness-Schalter und Farbkasten-Anzeige immer überein: drückt man „hell",
  zeigt der Kasten die **Partnerpalette** als die wirksame — nicht die eigene,
  aufgehellt.

---

## 3. Messungen

| Werkzeug | Ergebnis |
|---|---|
| `kontrast_pruefen.mjs` | **102 Messungen, 0 unter der Schwelle** |
| `farbkasten_pruefen.mjs` | **20 Prüfungen, 0 Fehler** |
| `farbkasten_browser.mjs` | **BESTANDEN** (16 Einzelprüfungen) |
| `namensraeume.mjs` | **53 Namensräume, aus dem Harness gelesen** |
| `woerter_pruefen.mjs` | **BESTANDEN** |
| `uebersetzung_umfang.mjs` | **0 von 2385 Texten offen** |
| `buendel_pruefen.mjs` | **BESTANDEN** |
| `schutz_pruefen.mjs` | **BESTANDEN** |
| `update_festigkeit.mjs` | **BESTANDEN** |

Die Kontrastmessung deckt jetzt **alle sechs Paletten** ab und zusätzlich die
**Zustandsfarben** (Fehler, Erfolg, Warnung) — 36 weitere Messungen, weil eine
Zustandsfarbe Text ist: „Fehler" steht als Wort auf dem Bildschirm.

**Der Harness ist unberührt.** `git status --porcelain` in `deepseek-harness`
ergibt **0 Zeilen**. Alle Änderungen liegen in der Werkstatt daneben.

---

## 4. Der Fehler, den die Arbeit aufgedeckt hat

Das ist der wichtigere Teil dieser Abnahme.

### 4.1 Was gemeldet wurde — und was wirklich war

`woerter_pruefen.mjs` meldete **„1937 von 1937 Texten auf Deutsch — BESTANDEN"**.
Am Bildschirm stand trotzdem die halbe Oberfläche englisch: „Settings",
„General", „Language", „Appearance", „Plugins", „Workspaces".

**Ursache: 16 der Namensraum-Namen waren falsch.** Das Werkzeug führte die
Tabelle von Hand und verglich dann die **Schlüssel** je Namensraum. Die Schlüssel
stimmten — die Namen nicht:

| unsere Tabelle | was der Harness anmeldet |
|---|---|
| `settings.general` | `settings` |
| `sidebar-right` | `sidebarRight` |
| `commands` | `command` |
| `message-feedback` | `feedback` |
| `theme` | `settings.theme` |
| `agent-preset` | `settings.agentPreset` |
| `settings-plugins` | `settings.plugins` |
| `input-trigger` | `slash.menu` |
| … 8 weitere | |

Die deutschen Wörterbücher wurden also unter Namen abgelegt, die **niemand
liest**. Und kein Werkzeug sagte etwas, weil es die Schlüssel ja fand.

### 4.2 Warum das so lange unsichtbar blieb

Vier Fehler wirkten zusammen, jeder für sich stumm:

1. **Die Tabelle war von Hand geführt.** Sie konnte veralten, und sie veraltete.
2. **Geprüft wurden Schlüssel, nicht Namen.** Ein falscher Name fiel nicht auf.
3. **`ctx.get('locale')` lief zu früh.** Der Dienst wird asynchron
   bereitgestellt; ohne `ctx.inject` unterblieb die Anmeldung ganz.
4. **`locale.register` legt nur Wörterbücher ab.** Wählbar wird eine Sprache
   erst durch **`addLanguage`** — der Harness führt seine Auswahlliste aus
   seinem eigenen Katalog (`zh`, `en`). Ohne diesen Aufruf waren 1937 Texte
   angemeldet und niemand konnte sie einschalten.

### 4.3 Der Fehler, der alles erklärte

`sidebarDocumentPreview` stand **zweimal** in der Liste — einmal als Rahmen,
einmal bei der Dokumentvorschau. Der zweite `register` wirft
(`already has locale "de"`), **der ganze Effekt stirbt**, und **alle danach
folgenden Namensräume** werden nie angemeldet.

Am Bildschirm blieb die Oberfläche halb englisch, und nichts nannte einen Grund.

### 4.4 Was dagegen gebaut wurde

* **`werkzeuge/namensraeume.mjs`** liest die Tabelle **aus dem Harness**: jede
  `.locale.register`-Anmeldung, mit aufgelöstem Namensraum (auch über
  Konstanten, mehrzeilige Importe und Re-Exporte) und der Datei, in der das
  Wörterbuch wirklich liegt. Eine neue Sprache im Harness erscheint damit von
  selbst; ein umbenannter fällt sofort auf.
* **`woerter_pruefen.mjs`** nimmt seine Tabelle von dort. Sie kann nicht mehr
  veralten.
* **`buendel_pruefen.mjs`** meldet jetzt **doppelte Namensräume** — der Fehler
  aus 4.3 wird künftig gefangen, statt still zu bleiben.
* **`index.ts`** meldet beim Anmelden, **welcher** Namensraum scheitert, und
  wirft weiter. Ein stiller Abbruch ist damit ausgeschlossen.

### 4.5 Was dabei zutage kam

Mit der gelesenen Tabelle wurden **Texte sichtbar, die nie erfasst waren**:

| Namensraum | Texte | warum unsichtbar |
|---|---|---|
| `chat` | 186 | nicht in der Tabelle (`conversation` ist ein anderer) |
| `settings.models` | 113 | nicht in der Tabelle |
| `settings.account` (Einrichtung) | 39 | über `...onboardingEnglishCopy` gespreizt |
| `common` | 41 | nicht in der Tabelle |
| acht der Dokumentvorschau | 74 | je eigene Dateien, nicht in der Tabelle |
| `settings.locale`, `shortcuts.layout` | 2 | nicht in der Tabelle |
| **zusammen** | **455** | |

**Der wahre Stand war 2385 Texte, nicht 1937.** Alle sind jetzt übersetzt:
`uebersetzung_umfang.mjs` meldet **0 von 2385 offen**.

---

## 5. Was der Browser zeigt

Gemessen mit `farbkasten_browser.mjs` und einer Prüfung der Fenstertexte
(Browsersprache `de-DE`, wie sie ein deutscher Nutzer hat):

**Startseite** — Neuer Chat · Erweiterungen · Arbeitsbereiche · Einstellungen ·
Ins Unbekannte · Vorschau · Schaffensmodus · „Beschreibe, was du bauen willst ·
/ für Befehle · @ für Dateien oder Chats" · Community

**Einstellungen** — Allgemein · Modelle · Eingebaute Erweiterungen ·
Agenten-Voreinstellungen · Konfigurationsdatei öffnen · Schliessen · Sprache ·
Deutsch · Erscheinungsbild · Schriftgrösse · **Farbkasten** · Zugriffsstufe ·
Tastenkürzel · Arbeitsdetails · Leistung und Verbrauch

**Modelle** — „Trage deine API-Schlüssel ein, um Modelle der folgenden Anbieter
zu nutzen." · Bearbeiten · Löschen · Modellanbieter hinzufügen

**Der Farbkasten** — sechs Würfel mit Namen und Grundton; ein Druck ändert die
Farbmarken auf `body` exakt (Grund `#14110f` → `#161028`, Akzent `#ff7a1c` →
`#ff8a3d`); **keine Mischung** aus zwei Paletten; „hell" wechselt zur
**Partnerpalette Marmor** statt aufzuhellen; die Wahl überlebt ein Neuladen.

---

## 6. Was offen bleibt

1. **Der Widerspruch in `BRAND.md` §1 zu `--schrift-3`.** Die Tokentabelle nennt
   `#8b8178` (erreicht 4,93:1), der Fliesstext verlangt im selben Abschnitt
   7:1 — und die maßgebliche Quelle `srv/varianten.php` trägt `#aaa39c`
   (7,55:1). Die Werkstatt folgt dem Programm. **Der Plan gehört dort
   berichtigt, nicht hier.**
2. **`--dsw-alias-state-idle-primary`** war vorher nicht gesetzt und trägt jetzt
   den Hinweiston der Palette. Das ist eine Verbesserung, aber sie war nie
   gemessen — die Messung ist mit dieser Runde nachgeholt.
3. **Die Sichtprüfung bei voller Fensterbreite** mit den längeren deutschen
   Wörtern steht noch aus (der Browserlauf prüft Inhalte, nicht Umbruch).

---

## 7. Geänderte und neue Dateien

**Paket** (`pakete/dsh-client-ui-promptheus/src/client/`):

* `paletten.ts` — die sechs Paletten, `markenAus`, `markenPaar`, `PALETTEN`
* `farbkasten.ts` — der Halter der Wahl, die Partner-Regel, der Speicher
* `farbkasten-zeile.ts` — die sichtbare Einstellungszeile
* `woerter/grundsprache.ts` — `common`, `settings.locale`, `shortcuts.layout`, `settings.models`
* `woerter/gespraech2.ts` — `chat` (186 Texte)
* `woerter/runde4.ts` — die 39 Einrichtungstexte des Kontos ergänzt
* `woerter/dokumentvorschau.ts` — die acht Namensräume der Dokumentvorschau
* `index.ts` — `ctx.inject`, `addLanguage`, 53 Namensräume, Farbkasten

**Werkzeuge:**

* `namensraeume.mjs` — **neu**: liest die Namensraum-Tabelle aus dem Harness
* `farbkasten_pruefen.mjs` — **neu**: Partner-Regel und Gleichlauf
* `farbkasten_browser.mjs` — **neu**: der Beweis im echten Browser
* `kontrast_pruefen.mjs` — alle sechs Paletten und die Zustandsfarben
* `woerter_pruefen.mjs` — Tabelle gelesen statt gepflegt; Spreizungen aufgelöst
* `uebersetzung_umfang.mjs` — auf dieselbe Quelle umgebaut
* `buendel_pruefen.mjs` — doppelte Namensräume werden gemeldet
