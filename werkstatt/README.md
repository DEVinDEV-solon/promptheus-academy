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
| `pakete\` | die PROMPTHEUS-Pakete — Marke, Palette, deutsche Texte |
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

**2. Der Anbieter.** Der Schlüssel in der `.env` des Harness ist ein
**OpenRouter**-Schlüssel. Ohne `DEEPSEEK_BASE_URL` fragt der Harness
`api.deepseek.com` und bekommt **HTTP 401** — die Modellwahl bleibt dann leer
und lässt sich nicht bedienen. `starten.mjs` setzt die Adresse und meldet
Anbieter und Schlüssel beim Start an.

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
