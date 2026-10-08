# PROMPTHEUS Werkstatt

Die **eigene, vollständige Fassung** des DeepSeek Harness — im Brand und mit dem
Logo von PROMPTHEUS ACADEMY, bedienbar auf Deutsch.

**Der Bauplan:** `..\vps\Pläne\40_Werkstatt\Deepseek-Dashboard-Maske-Plan.md`

---

## Der schnellste Weg

1. **Einmal einrichten:** Doppelklick auf `WERKSTATT-EINRICHTEN.bat`
   (Node.js 22.19+ und Git nötig; holt den Harness beim geprüften Stand,
   installiert die Abhängigkeiten, legt das Profil an, fragt den
   OpenRouter-Schlüssel ab, baut die Pakete).
2. **Öffnen aus der Academy:** Einstellungen → Werkstatt → „Werkstatt öffnen".
   Frei mit dem 7. Kurs zu 100 %, Admins sofort. Die Academy legt ein Ticket
   ab (`data\werkstatt\ticket.json`, zwei Minuten, einmalig); ohne Ticket
   startet die Werkstatt nicht.

Danach ist die Werkstatt unter **http://127.0.0.1:3081** erreichbar.

**Zur Werkstatt (seit 03.10.2026).** Hinein kommt nur, wer die Adresse mit
Zugangstoken hat. `starten.mjs` liest sie aus der Startzeile `dsh web: …` mit
(`werkzeuge/adresse.mjs`; die Ausgabe geht unverändert ins Fenster) und legt
sie in `data\werkstatt\adresse.json` ab — mit dem Konto aus dem Ticket. Die
Academy gibt sie nur diesem Konto heraus (`werkstatt_adresse`): In der
Startkarte und im Werkstatt-Fenster steht dann „Zur Werkstatt“, auch wenn das
Browserfenster weg ist. Die Datei wird vor jedem Start und beim Beenden
gelöscht. Beim ersten Öffnen zeigt die Werkstatt über dem Eingabefeld die Karte
„Erste Schritte“ (`ersteschritte.ts`). Prüfen: `node werkzeuge\adresse_pruefen.mjs`.

**Cinema Studio (seit 06.10.2026).** Links unten unter „Community“ steht
„Cinema-Studio“. Der Knopf öffnet `/promptheus-cinema` in einem neuen Tab
(`pakete\dsh-client-ui-promptheus\src\cinema.ts`). Die Seite erklärt die drei
Schritte, legt ein Ticket in den Programmordner (`zugang\ticket.json`, zwei
Minuten, einmalig) und startet `CINEMA-STUDIO-START.bat` in einem eigenen
Fenster. Cinema Studio prüft das Ticket selbst (`zugang.py`); ohne Ticket
startet es nicht, auch nicht für Betreiber. Eine Anmeldung gibt es in Cinema
Studio nicht mehr: Bei jedem Klick legt die Werkstatt eine Einlassmarke ab
(`zugang\einlass.json`, nur sha256, 60 s, einmalig) und hängt sie hinter
`#e=` an die Adresse (`einlassAusstellen`). Zugleich bindet sie Cinema Studio
an sich (`zugang\werkstatt.json`, `bindungSchreiben`): Bilder, Videos und
Audio bleiben beim Programm in `werkstatt\scripts\cinema-studio\ablage\`,
und alle OpenRouter-Aufrufe laufen über die Schutzschicht — mit dem Schlüssel
der Werkstatt, den Cinema Studio nie sieht. Die Werkstatt sucht das Programm
an einem festen Ort, `werkstatt\scripts\cinema-studio` (`CINEMA_ORTE`, in git
ausgeschlossen); `PROMPTHEUS_CINEMA_DIR` geht vor. Den Port nimmt sie aus
`PROMPTHEUS_CINEMA_PORT`, sonst aus `BILDGEN_PORT` in der `.env` von Cinema
Studio (nur diese Zeile), sonst 8796 — so meinen beide Seiten denselben.
Der Platzhalter-Schlüssel der Werkstatt geht nicht mit (`starterUmgebung`).
Prüfen: `node werkzeuge\cinema_pruefen.mjs`.

Entwicklung ohne Academy (Warnung im Fenster):

```powershell
cd werkstatt
node werkzeuge\bauen.mjs                 # Pakete bauen und ins Zuhause spiegeln
node werkzeuge\buendel_pruefen.mjs       # das gebaute Bündel prüfen
node werkzeuge\starten.mjs --betreiber   # starten ohne Ticket
```

**Grenze der Sperre:** Sie gilt auf demselben Rechner. Wer Schreibrechte auf
den Programmordner hat, kann sie umgehen. Auf Schulrechnern gehört der Ordner
deshalb dem Verwalter-Konto, nicht dem Schülerkonto.

## Was hier liegt

| Ordner | Inhalt |
|---|---|
| `deepseek-harness\` | **der Harness selbst** — wird bei der Einrichtung geholt (nicht im Repo) |
| `.dsh\` | **das eigene Zuhause** — Profil, Sitzungen, Einstellungen, Zugangsdaten (lokal, nicht im Repo) |
| `vorlage\profil-promptheus\` | die Profilvorlage, aus der `WERKSTATT-EINRICHTEN.bat` das Profil anlegt |
| `pakete\` | die PROMPTHEUS-Pakete — Marke, Palette, deutsche Texte; `dsh-client-ui-audio\` ist die Begrüssung oben |
| `assets\audio\` | die Aufnahme der Begrüssung (`hephaistos-begruessung-werkstatt.mp3`) |
| `werkzeuge\` | Bauen, Prüfen, Zählen, Starten |
| `patches\` | die vier Sprachzeilen, als Anleitung |
| `abnahmen\` | die Abnahmen, mit Messwerten |

**Alles liegt in diesem Ordner.** Kein anderes Verzeichnis wird gebraucht.

Der gewohnte Betrieb auf `http://127.0.0.1:3080` läuft **unberührt** weiter — er
ist der Harness unter `…\scripts\deepseek-harness`, eine zweite, unabhängige
Fassung. Beide können gleichzeitig offen sein.

## Drei Dinge, die man wissen muss

**1. Das eigene Zuhause.** Der Harness legt alle Benutzerdaten unter `$DSH_HOME`
ab, **nicht** im Repo. Die Werkstatt hat deshalb ihr eigenes:
`werkstatt\.dsh\`. Ohne das würden sich beide Fassungen `C:\Users\PC\.dsh`
teilen — und der zuletzt gestartete Harness würde die Modulverweise des anderen
**umschreiben**. `starten.mjs` setzt das Zuhause, `bauen.mjs` legt die Verweise
dorthin. **Beide müssen denselben Ort nennen.**

**2. Der Anbieter — nur über die Schutzschicht (seit 03.10.2026).** Die
Werkstatt spricht nie direkt mit OpenRouter. Beide Modellwege zeigen auf die
**Schutzschicht** auf `127.0.0.1:3089` (`werkzeuge/schutz/`):
`DEEPSEEK_BASE_URL` setzt `starten.mjs`, die `baseURL` des Anbieters
`openrouter` steht im Profil. Den echten Schlüssel hält nur die Schutzschicht
(`data\werkstatt\schutzschicht.env`); der Harness hat einen Platzhalter
(`OPENROUTER_API_KEY=schutzschicht`). Ohne `DEEPSEEK_BASE_URL` fragte der
Harness `api.deepseek.com` und bekäme **HTTP 401**.

**2a. Was die Schutzschicht tut.** Jede Anfrage — Eingabe, Verlauf, Dateien,
die der Agent selbst gelesen hat — wird maskiert (`maske.mjs`): bekannte
Geheimwerte aus allen `.env`, Schlüssel nach Muster, Kontonamen (als
Fingerabdrücke von der Academy, `schutz-namen.json`), harte PII-Regeln der
Academy. Danach der **Torschluss**: Übersteht ein bekannter Wert, geht nichts
hinaus (HTTP 451). Jede Anfrage landet ohne Inhalt im Audit-Trail der Academy
(Einstellungen › Audit-Trail). Die Leiste über dem Eingabefeld
(`schutzleiste.ts`) zeigt schon beim Tippen, was ersetzt wird, und hält vor dem
Absenden an.

**2b. Was bei jedem Start gerichtet wird** (`absichern.mjs`, auch beim
Einrichten): Zugriffsstufe „Workspace schreiben“ mit Rückfrage statt
Vollzugriff; die Academy ist kein Arbeitsordner (sonst dürfte der Agent ihren
Code ändern); Skills nur aus `werkstatt\.dsh\agents`. **Startsperre:** Zeigt ein
Modellweg nicht auf die Schutzschicht oder startet sie nicht, startet die
Werkstatt nicht. Achtung: Die Sandbox unter Windows begrenzt nur das
**Schreiben** — lesen kann der Agent überall. Deshalb ist die Schutzschicht der
eigentliche Riegel.

Prüfen: `node werkzeuge\schutz\schutz_pruefen.mjs` (nachgestellter Anbieter,
nichts verlässt den Rechner) und `node werkzeuge\schutz\absichern_pruefen.mjs`.

**2c. Hephaistos ist der Agent** (`werkzeuge/hephaistos/persona.mjs`, bei
jedem Start und beim Einrichten). Der Harness stellt sich an drei Stellen
selbst vor: mit einem festen Satz („powered by DeepSeek Harness“), mit einem
englischen Abschnitt über seine Web-Oberfläche und mit der Persona jedes
Agenten-Presets („You are a coding agent …“). Das Modul schaltet die ersten
beiden ab und schreibt die Presets mit Hephaistos als Persona neu — erzeugt aus
den Preset-Dateien des Harness selbst, damit Werkzeuge und Gruppen nach einem
Update stimmen. Alles steht in einem markierten Block am Ende des Profils
(Sicherung `*.vor-hephaistos`). Den Text der Persona pflegst du in
`vorlage\hephaistos\persona.md`; erlaubt sind nur die Variablen `{{model}}`
und `{{cwd}}`. Prüfen: `node werkzeuge\hephaistos\persona_pruefen.mjs`.

**3. Das Bündel.** Die PROMPTHEUS-Pakete liegen außerhalb des Harness-Workspace
und werden mit esbuild gebaut, weil der Bau-Preset des Harness nur Pakete
**innerhalb** des Repos auflöst. Dabei sind die drei Kopfzeilen Pflicht, die
`module` und `exports` anlegen — sonst bricht die Oberfläche mit „module is not
defined" ab. `buendel_pruefen.mjs` fängt genau diesen Fehler; es wurde gegen den
echten Fehler gestellt und hat ihn erkannt.

## Stand

| Runde | Was | Stand |
|---|---|---|
| 0 | Fundament: Profil, Paketgerüst, Bauweg | **abgenommen** → `abnahmen\runde-0.md` |
| 1 | Brand: Marke, Wortmarke, Palette, Mäander | **abgenommen mit Vorbehalt** → `abnahmen\runde-1.md` |
| 2 | Deutsch: 651 Texte | **begonnen** — 117 von 651 (7 von 24 Namensräumen), Zugriffsstufen deutsch |
| 3 | Maske: Zuhause, Einstellungen, Umschalter | offen |
| 4 | Alle Funktionen sichtbar und geprüft | offen |
| 5 | Werkstatt-Anschluss (Relay, Talente, Gemeinde) | vorgemerkt |
| 6 | Betrieb und Aufwertung | offen |

Dazu zwei Abnahmen ohne Rundennummer:

- `abnahmen\umzug-start-modelwahl.md` — Umzug nach `werkstatt\`, Startdatei,
  wiederhergestellte Modelwahl, erste deutsche Texte.
- `abnahmen\harness-eigenstaendig.md` — der Harness als eigene, vollständige
  Fassung mit eigenem Zuhause, samt Beweis der Eigenständigkeit.

Dazu: `abnahmen\umzug-start-modelwahl.md` (29.09.2026) — Umzug nach `werkstatt\`,
Startdatei, wiederhergestellte Modelwahl, erste deutsche Texte.

**Der Vorbehalt aus Runde 1:** `BRAND.md` widerspricht sich bei `--schrift-3`
(Tabelle `#8b8178` = 4,93:1, Fließtext verlangt 7:1, Programm nutzt `#aaa39c`
= 7,55:1). Die Maske folgt der maßgeblichen Quelle `srv/varianten.php`. Die
Tabelle im Kit gehört berichtigt — Einzelheiten in `abnahmen\runde-1.md` §3.

## Werkzeuge

| Aufruf | Was |
|---|---|
| `node werkzeuge\bauen.mjs` | Pakete bauen und ins Profil spiegeln |
| `node werkzeuge\buendel_pruefen.mjs` | Bündel ausführen und Belegungen prüfen |
| `node werkzeuge\woerter_pruefen.mjs` | deutsche Texte gegen den Harness zählen |
| `node werkzeuge\kontrast_pruefen.mjs` | Farben messen (22 Messungen, AA und AAA) |
| `node werkzeuge\starten.mjs` | starten auf Port 3081 (`--open` öffnet den Browser, `--port` ändert ihn) |
| `node werkzeuge\begruessung.mjs aus` | die Begrüssung oben entfernen; bleibt auch nach Updates weg (`an` holt sie zurück, `stand` zeigt den Stand) |

**Die Begrüssung oben („HEPHAISTOS meint…“).** Ein Miniplayer in der Kopfzeile
der Werkstatt (`pakete\dsh-client-ui-audio\`, gebaut vom Werkstatt-Agenten am
04.10.2026). `starten.mjs` hängt ihn vor jedem Start ins Profil ein — über
`dsh.profile.bundles` in der `package.json` des Profils; die `cordis.patch.yml`
des Profils bleibt unberührt. Wer ihn nicht mehr will, sagt es Hephaistos: Er
führt nach Rückfrage `begruessung.mjs aus` aus (Persona, Abschnitt „Die
Begrüssung oben“). Die Abwahl steht als `.dsh\begruessung-aus.txt` im Zuhause
und überlebt damit jedes Update. Sichtbar nach einem Neustart der Werkstatt.

## Regeln, die binden

Aus `..\Brand\BRAND.md`:

1. Im Layout stehen nur `var(--…)`, nie rohe Hexwerte.
2. Glut heißt „hier geht es weiter", Gold heißt „das hast du geschafft" — sie
   sind nicht austauschbar.
3. Farbe trägt nie allein eine Aussage.
4. Höchstens ein Ornament je Fläche, nie über Text.
5. Keine Fremdquelle: kein CDN, keine Webschrift, kein externes Bild.
6. Deutsch mit `ss` statt `ß`, Duz-Form, keine Ausrufezeichen, keine Superlative.
   Jede Fehlermeldung nennt einen Weg.
