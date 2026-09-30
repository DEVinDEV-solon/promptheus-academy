# Abnahme — Hintergrundbild, Seitenmenü und Titel

**Datum:** 30.09.2026
**Fassung:** Werkstatt 0.1.0, Harness 0.2.0-rc.2 (`639ed01539`)

---

## 1. Der Auftrag

Vier Punkte:

1. Das Hintergrundbild `assets/img/promptheus-background.jpg` auf der Chatseite
   anlegen, 25 % Transparenz.
2. „Neue Session" linksbündig statt mittig.
3. „Community" linksbündig statt mittig.
4. Der Untertitel des Schriftzugs wird zu `- W E R K S T A T T -`.
5. Der Chat-Titel heisst „Earn Talent…" (englisch) bzw. „Talente verdienen…"
   (deutsch) statt „Into the Unknown".

---

## 2. Das Hintergrundbild

**Das Bild:** 1920 × 1081 px, 452 KB. 16:9, sauber.

**Die Bauart kommt aus dem Hauptprogramm.** `srv/varianten.php` legt
Hintergrundbilder nicht mit roher Deckkraft an, sondern mit einem **Schleier aus
dem Grundton** und einer **Bildstärke**:

    --bild-staerke: .20;          (dunkle Paletten)
    --bild-schleier: rgb(<grund>);

Der Schleier liegt als erste Ebene über dem Bild. Seine Deckkraft ist
`1 − Bildstärke`.

### 2.1 Warum nicht 25 %

Gerechnet wurde der ungünstigste Fall — ein Bildpunkt, der den Grund am
stärksten aufhellt — für jede Stärke. Der **Zweittext** (`--schrift-2`) ist die
empfindlichste Stelle: er steht auf derselben Fläche wie das Bild und hat den
geringsten Abstand zum Grund.

| Bildstärke | schlechtester Zweittext-Kontrast |
|---|---|
| 10 % | 6,01:1 |
| 15 % | 5,08:1 |
| **18 %** | **4,57:1** ← hält die Schwelle 4,5:1 |
| 20 % | 4,23:1 ← fällt durch |
| 25 % | 3,50:1 ← deutlich zu stark |

**Bei 25 % wäre der Zweittext unlesbar geworden.** Die Messung im Browser
bestätigt die Rechnung danach auf die zweite Stelle: Schmiede misst gemessene
**4,57:1** — genau der vorhergesagte Wert.

**Auch der Wert des Hauptprogramms wäre zu stark.** `varianten.php` führt `.20`;
bei 20 % erreicht der Zweittext hier nur 4,23:1. Der Unterschied kommt daher, dass
dort das Bild auf anderen Flächen liegt (Tor, Kursseiten) und die Schrift dort
andere Größen hat. Eingebaut sind deshalb **18 %**.

### 2.2 Wo das Bild liegt

Über den ganzen Baum gemessen übermalt im Chatbereich **genau ein Knoten** den
Grund: der Gesprächs-Wurzelknoten (1000 × 720 px). Nur er tritt beiseite.

**Der Weg über den Steckplatz `shell.overlay` wurde geprüft und verworfen.** Er
liegt in `.YWeqFq_overlayLayer` mit `position: absolute; z-index: 20` — ein
eigener Stapelkontext. Der Harness beschreibt ihn selbst als „Frame-wide floating
layer, **above every column**": ein Bild darin läge ÜBER dem Text.

**Der Anker ist ein Steckplatz-Name, kein Klassenname.** `data-slot`
(`main`, `main.conversation`) ist Teil des veröffentlichten Vertrags;
`.ZmEGJq_root` wechselt mit jeder Fassung.

**Warum das Bild auf dem KIND liegt.** Gemessen:

    div slot="main.conversation"  0x0   display: contents   ← kein Kasten
      div .ZmEGJq_root            1000x720                  ← die echte Fläche

`main.conversation` ist eine reine Weiterleitung und hat keinen Kasten. Ein
`background-image` darauf wirkt nicht.

**Die Spezifität war der zweite Fehler.** Der Harness setzt seinen Grund als
`.ZmEGJq_root { background: … }` — eine Klasse, also (0,1,0). Mein erster
Selektor `[data-slot="main.conversation"] > *` hatte **dieselbe** Spezifität, und
bei Gleichstand entscheidet die Dokumentreihenfolge. Jetzt steht
`[data-slot="main"]` mit davor: (0,2,0) gewinnt sicher, ohne `!important`.

---

## 3. Die drei Fehler, die die Arbeit aufdeckte

### 3.1 Helle Paletten liessen sich nicht einschalten

**Das war ein Fehler in meinem Code, und er war stumm.**

Die Paletten führen ihren Grundton auf Deutsch (`'hell'`, `'dunkel'`, so steht es
in `varianten.php`), der Harness sein Farbschema auf Englisch (`'light'`,
`'dark'`). Ich übergab den deutschen Namen an `theme.setTheme`:

* `theme.setTheme('hell')` wirft („theme \"hell\" is not registered"),
* `active.colorScheme === 'hell'` ist immer falsch.

Der `catch` schluckte die Ausnahme. **Die Folge:** wer Pergament oder Marmor
wählte, sah weiter die dunkle Seite.

Gefunden hat das `hintergrund_kontrast.mjs`, weil Pergament dort die Textfarbe
von Schmiede zeigte. Behoben durch **eine** Übersetzungsstelle:
`farbschemaAus` / `grundtonAus` in `farbkasten.ts`.

### 3.2 Die Kontrastmessung mass Bedienelemente statt des Bildes

Drei Anläufe waren nötig:

1. Ein Raster über die Fläche hielt den ungünstigsten Punkt für den Grund — es
   war ein blauer Knopf, `rgb(75,94,130)`, **bei allen dunklen Paletten derselbe
   Wert**. Das war das verräterische Zeichen.
2. Ein Filter auf freie Stellen war danach so streng, dass er alles ausschloss:
   die Chatfläche ist voller Bedienelemente.
3. Das Lesen der hellsten Punkte fand die **Schrift** (`237,229,219` ist genau
   die Textfarbe).

Der Grund wird jetzt **gerechnet**: `Grundton × (1 − Stärke) + Bild × Stärke`.
Das Bild wird über seine Adresse geladen und im Browser ausgewertet — kein
Bildschirmfoto, keine Verwechslung.

### 3.3 Der Hero-Titel blieb englisch

Mein erster Selektor suchte eine Ebene zu tief. Der eingefügte Text erschien, der
englische blieb daneben stehen. Der Test hat es gemeldet, die Messung den Grund
gezeigt.

---

## 4. Die drei Gestaltungsanpassungen

**„Neue Session" linksbündig.** Der Harness zentriert
(`.newSessionContent { justify-content: center }`). Der Knopf trägt kein Merkmal,
das ihn allein auszeichnet — sein `aria-label` teilt er mit dem Markenknopf. Seine
**innere Form** ist dagegen einmalig: nur hier steht eine Zelle mit Sinnbild UND
Beschriftung nebeneinander. Anker:
`button > span > span:has(> svg):has(> span)`.

**„Community" linksbündig.** Eigener Baustein, `justifyContent: 'flex-start'`,
dazu `textAlign: 'left'`. Der Knopf steht in einer Spalte mit lauter linksbündigen
Zeilen; mittiger Text darin las sich wie ein Fremdkörper.

**Der Schriftzug `- W E R K S T A T T -`.** Die Striche sind **Teil des Zusatzes**
und stehen im selben Element: dieselbe Sperrung, dieselbe Schrift, dieselbe
Farbe. Ein zweites Element hätte eigene Maße gebraucht und wäre bei jeder
Änderung der Zeilenhöhe auseinandergelaufen. Die Sperrung macht `letter-spacing:
.34em`; der Text selbst lautet `- Werkstatt -`.

**Der Chat-Titel.** `hero.headline` steht fest im Harness-Quelltext, und der
Harness meldet seine englischen Wörterbücher selbst an — ein zweiter
`locale.register` für `en` wirft. Für **Deutsch** greift unser Wörterbuch
(`Talente verdienen…`). Für **Englisch** blendet eine Regel unter
`html[lang="en"]` den Harness-Text aus und setzt unseren ein (`Earn Talent…`).

---

## 5. Messungen

| Werkzeug | Ergebnis |
|---|---|
| `anpassungen_browser.mjs` | **BESTANDEN** — beide Sprachen, alle vier Punkte |
| `hintergrund_browser.mjs` | **BESTANDEN** — Bild ausgeliefert, wirkt, keine Konsolenfehler |
| `hintergrund_kontrast.mjs` | **BESTANDEN** — 6 Paletten × 2 Textarten |
| `farbkasten_browser.mjs` | **BESTANDEN** |
| `farbkasten_pruefen.mjs` | **BESTANDEN** — 20 Prüfungen, 0 Fehler |
| `kontrast_pruefen.mjs` | **BESTANDEN** — 102 Messungen |
| `namensraeume.mjs` | 53 Namensräume, aus dem Harness gelesen |
| `woerter_pruefen.mjs` | **BESTANDEN** |
| `uebersetzung_umfang.mjs` | **0 von 2385 Texten offen** |
| `woerter_im_buendel.mjs` | 53 Namensräume, 2385 Texte im Bündel |
| `buendel_pruefen.mjs` · `schutz_pruefen.mjs` · `update_festigkeit.mjs` | **BESTANDEN** |

**Der Harness ist unberührt.** `git status --porcelain` = **0 Zeilen**.

### 5.1 Was der Browser zeigt

Deutsch:
* `Neuer Chat` linksbündig (Luft links 2 px)
* `Community` linksbündig (Luft links 12 px, rechts 232 px)
* Schriftzug: `PROMPTHEUS` / `- Werkstatt -` (gesperrt 2,72 px, Grossschreibung)
* Chat-Titel: **„Talente verdienen… · Vorschau"**

Englisch:
* `New Session` linksbündig
* `Community` linksbündig
* Schriftzug: `PROMPTHEUS` / `- Werkstatt -`
* Chat-Titel: **„Earn Talent… · Preview"**

Kontrast über dem Bild (Zweittext, ungünstigster Bildpunkt):

| Palette | Haupttext | Zweittext |
|---|---|---|
| Schmiede | 8,80:1 | **4,57:1** |
| Pergament | 9,89:1 | 5,25:1 |
| Olymp | 8,94:1 | 4,98:1 |
| Marmor | 10,08:1 | 5,22:1 |
| Terrakotta | 8,37:1 | 4,63:1 |
| Funkenflug | 9,31:1 | 5,49:1 |

Alle über der Schwelle 4,5:1 (BRAND.md §1).

---

## 6. Was offen bleibt

1. **Die gewünschten 25 % sind nicht eingebaut, sondern 18 %.** Bei 25 % fällt der
   Zweittext auf 3,50:1 — unter die eigene Kontrastregel. Wer 25 % will, muss
   entweder den Zweittext über dem Bild ausschliessen oder die Regel ändern; die
   Zahl steht in `hintergrund.ts` an einer Stelle.
2. **Der Widerspruch in `BRAND.md` §1 zu `--schrift-3`** (Tabelle `#8b8178` =
   4,93:1, Fliesstext verlangt 7:1, `varianten.php` trägt `#aaa39c` = 7,55:1).
   Die Werkstatt folgt dem Programm. **Der Plan gehört dort berichtigt.**
3. **Die Sichtprüfung bei voller Fensterbreite** mit den längeren deutschen
   Wörtern steht noch aus (der Browserlauf prüft Inhalte, nicht Umbruch).
4. **Die englische Titelregel hängt am Aufbau des Heros.** Verschiebt der Harness
   die Marke oder den Titel, greift sie nicht mehr und „Into the Unknown"
   erscheint wieder — ein sichtbarer, harmloser Fehler, den
   `anpassungen_browser.mjs` meldet.

---

## 7. Geänderte und neue Dateien

**Paket** (`pakete/dsh-client-ui-promptheus/src/`):

* `index.ts` — Route für das Bild (`HINTERGRUND_PFAD`), Helfer `dateiLesen`
* `client/hintergrund.ts` — **neu**: das Bild, der Schleier, die Bildstärke
* `client/anpassungen.ts` — **neu**: Linksausrichtung und englischer Titel
* `client/farbkasten.ts` — `farbschemaAus` / `grundtonAus` (die Übersetzung)
* `client/index.ts` — beide Stylesheets als Effekte; `Wortmarke` mit Strichen;
  Gemeinde-Knopf linksbündig
* `client/woerter/gespraech.ts` — `hero.headline` = „Talente verdienen…"

**Werkzeuge:**

* `hintergrund_browser.mjs` — **neu**: Bild ausgeliefert und wirksam
* `hintergrund_kontrast.mjs` — **neu**: Lesbarkeit über dem Bild, 6 Paletten
* `anpassungen_browser.mjs` — **neu**: die vier Punkte in beiden Sprachen
* `farbkasten_browser.mjs` — deutsche Beschriftungen, Browsersprache
