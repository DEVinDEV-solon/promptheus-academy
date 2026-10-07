# Agenten-Team

Das Paket der Werkstatt für ganze Arbeitsabläufe. Ein Knopf öffnet ein großes
Fenster; darin wird in zehn Schritten zusammengestellt, was ein Ablauf tun soll.
Am Ende geht der fertige Auftrag ins Eingabefeld, und Hephaistos baut daraus den
Workflow.

## Wo es liegt

Seit dem 07.10.2026 im PROMPTHEUS-Repo unter `werkstatt\pakete\dsh-plugin-workflows\`
(vorher ausserhalb von git unter `deepseek-harness\plugins\eigene\`).
`node werkzeuge\bauen.mjs` prüft `client.js` und `index.js` mit `node --check`
und legt die Verweise an: im flachen Rückfall `.dsh\profiles\node_modules\@promptheus\`
und — falls das Paket über die Plugin-Verwaltung angemeldet ist — im Profil
selbst (`profiles\promptheus\package.json` und dessen `node_modules`).

## Die vier Plätze

| Platz | Kennung | Was dort steht |
|---|---|---|
| `conversation.input.dock` | `workflows-karte` | Die Zeile über dem Eingabefeld, mittig in Eingabefeldbreite: `Vorlage einsetzen` und `Fenster` |
| `shell.overlay` | `agenten-team-fenster` | Das grosse Fenster des Agenten-Teams |
| `shell.overlay` | `mail-fenster` | Das grosse Fenster `Mail-Abruf` |
| `shell.overlay` | `agenten-team-leiste` | Die Taskleiste am unteren Rand, über der Chat-Spalte |

Die Seitenleiste trägt seit dem 07.10.2026 kein „Agenten-Team“ und keinen
Briefumschlag mehr; beides steht in der Taskleiste. Community und Cinema-Studio
bleiben im Menü (Paket `dsh-client-ui-promptheus`) und stehen zusätzlich in der
Leiste.

## Die Taskleiste

Von links: Logo, `Agenten-Team` (öffnet das Fenster), `Mail` (öffnet den
Mail-Abruf), `Community` und `Cinema-Studio` — dieselben Routen der Werkstatt
wie im Menü (`/promptheus-community`, `/promptheus-cinema`), also dieselbe
Herkunftsprüfung und derselbe Einlass. Community läuft über den Knopf der
Seitenleiste, damit die Palette (`?v=`) mitgeht. Danach Platz für angeheftete
Workflows (Phase F), rechts das ⋯-Menü und der Pinn zum Feststellen. Wird das
Fenster schmal, scrollt die Mitte waagrecht; ⋯ und Pinn bleiben stehen.

Die Leiste beginnt rechts neben der Seitenleiste und endet vor einer rechten
Spalte; gemessen wird die Chat-Spalte per `ResizeObserver`. So bleibt der Fuss
der Seitenleiste immer klickbar. Sie liegt mit z-index 15 über dem Chat und
unter der Überlagerungsschicht des Harness (20) und den eigenen Fenstern.

**Einblenden** (Masterplan Workflow-Modalseite, 3.4):

| Weg | Regel |
|---|---|
| Kante mit Verweilen | Zeiger in den untersten 3 px über der Chat-Spalte, 180 ms |
| Kante mit Schwung | Ankommen an der Kante mit mehr als 0,6 px/ms abwärts (letzte drei Bewegungen); auch beim Verlassen des Fensters nach unten |
| Griff | Klick oder Tippen auf die Pille (48×4 px) unten in der Mitte |
| Tastatur | `Alt+T` blendet ein und aus, der Fokus geht auf den ersten Knopf; `Esc` schliesst |

**Nie über die Kante**, solange ein Eingabefeld Fokus hat und der Zeiger in
dessen Kasten plus 32 px ist, eine Maustaste gedrückt ist, ein Fenster, Dialog
oder Menü offen ist, und 400 ms nach dem Schliessen eines Fensters oder dem
Loslassen der Maustaste. Zeigerereignisse ohne Bewegung zählen nicht, Touch an
der Kante auch nicht (dafür gibt es den Griff).

**Ausblenden** 600 ms, nachdem der Zeiger die Leiste plus 24 px verlassen hat —
nicht, solange das ⋯-Menü offen ist oder der Tastaturfokus in der Leiste liegt.

**Arten** (⋯-Menü): `automatisch`, `immer sichtbar` (dann bekommt die
Chat-Spalte `padding-bottom` in Höhe der Leiste) und `nur per Griff`.

## Was im Fenster steckt

- **Zehn Schritte** als Zahlenzeilen mit kleinen Karten. Vorne Schlagwort, Art
  und der Schalter `an`/`aus`, hinten nach dem Drehen: Audioplayer,
  Ornamentteiler, Beschreibungstext, darunter `< Zurück` und `↑ Hoch`.
- **Onboarding** mit zwei Fragen. Sichtbar sind immer nur die ersten zwölf
  Antwortkarten, der Rest hinter `Mehr anzeigen`. Antworten belegen den Plan
  vor und nehmen Gegenspieler heraus. `Neu fragen` setzt zurück.
- **Filter** über Suchfeld und Art-Chips, dazu die **Legende** mit den
  Punktfarben.
- **Beratung**: feste Regeln, dann das eingestellte Helfer-Modell aus der
  Werkstatt, dann eine kurze Einschätzung des Standardmodells. Dazu
  `Hephaistos fragen` für eine ausführliche Antwort im Chat.
- **Auftrag einsetzen** schreibt den gewählten Plan ins Eingabefeld.

Standardkarten stehen grün, Sonderkarten neutral grau — rot kommt nicht vor.
Alle Farben laufen über die Marken des Themas (`var(--dsw-…)`), damit die
Oberfläche jedem Farbkatalog der Einstellungen folgt. Kein einziger roher
Farbwert steht in der Datei.

## Der Mail-Abruf

Der Knopf `Mail` in der Taskleiste öffnet ein zweites grosses Fenster. Es sammelt
die Wünsche an einer Stelle:

- **Abruf**: Quelle, Zeitplan, Zeitraum, was nach dem Abruf geschieht, und die Ablage.
  Bleibt die Quelle leer, steht darunter ein Warnhinweis. Bleibt die Ablage leer,
  setzt die Host-Hälfte `<Zuhause der Werkstatt>\mailposten` ein (`DSH_HOME`, also
  `werkstatt\.dsh` — nicht in git).
- **Mail-Workflows**: eine Zeile je Workflow mit Name, Zielordner und Regel. Rechts in
  der Zeile der Schalter — grün heisst ein, rot heisst aus, untereinander. Ein neuer
  Workflow startet grün. `Plugin erzeugen` ist gesperrt, solange der Workflow aus ist.
- **Speichern** legt alles im Browser ab (`localStorage`, Schlüssel
  `agenten-team-auswahl`, Feld `mail`). Auf die Platte kommt nichts, solange kein
  Knopf gedrückt wird.

`Plugin erzeugen` ruft den Befehl `mail-erzeugen` der Host-Hälfte. Der schreibt für den
Workflow ein eigenes Bündel nach `<Werkstatt>\deepseek-harness\plugins\eigene\<kennung>-mail\`
(die Werkstatt ergibt sich aus `DSH_HOME`, sonst aus dem Ort dieses Pakets):
`package.json`, `cordis.patch.yml`, `index.js`, `README.md`. Das Bündel meldet einen
eigenen Befehl `/<kennung>-abruf` an, der seine Einstellungen ausgibt — samt
Schalterzustand. Der Abruf selbst fehlt noch: dafür braucht es die Mailquelle. Umlaute
werden in der Kennung umgeschrieben (`ä` → `ae`), ein leerer Name wird abgewiesen.

## Die Zahlen zum Ändern

Alle stehen im Kopf von `client.js` und sind zum Ändern gedacht:

- `SPALTE`: Höchstbreite der Zeile über dem Eingabefeld — ungefähr die Breite des
  Eingabefelds.
- Im Abschnitt Taskleiste: `KANTE_PX` (3), `VERWEILEN_MS` (180), `SCHWUNG_PX_MS`
  (0,6), `EINGABE_RAND_PX` (32), `NACHLAUF_MS` (400), `AUSBLENDEN_MS` (600),
  `HYSTERESE_PX` (24).

## Die Host-Hälfte

`index.js` meldet den Befehl `team-beratung` an. Er liefert zuerst feste Regeln,
dann `Für Helfer eingestellt: …` aus dem Dienst `subagentModelSelection`, dann
eine kurze Einschätzung des Standardmodells über `llm.stream` — also über
denselben Weg wie alles andere in der Werkstatt, die Schutzschicht bleibt im
Pfad. Höchstens 400 Zeichen Antwort je Aufruf.

Das Fenster ruft den Befehl über `ctx.remote.commands.execute` auf. Der Weg wird
absichtlich *nicht* fest verlangt (`inject`), sondern über `kontext.get` geholt:
so bleibt die Zeile am Leben, falls der Weg in einem Profil nicht offen ist, und
der Fehler steht sichtbar im Fenster.

## Was gespeichert wird

Im lokalen Speicher des Browsers, unter dem Schlüssel `agenten-team-auswahl`:

- die gewählten Karten,
- die Antworten aus dem Onboarding,
- die Art der Leiste unter `leiste`: `auto`, `fest` oder `griff` (das frühere
  `hover` gilt als `auto`),
- die Eintragungen des Mail-Abrufs unter `mail`.

**Nicht** gespeichert wird der frei eingetippte Auftrag. Er kann persönliche
Dinge enthalten und soll nicht liegen bleiben.

## Prüfen

```powershell
node --check client.js
node --check index.js
```

Dazu ein Suchlauf auf Ebene der Fabrik, der Werte findet, die vor ihrer Zeile
benutzt werden (die Fehlerart „Cannot access … before initialization“):

```powershell
node -e "const fs=require('fs');const z=fs.readFileSync('client.js','utf8').split('\n');const d=[];for(let i=0;i<z.length;i++){const m=/^    (?:const|let) ([A-Za-z_][A-Za-z0-9_]*)\s*=/.exec(z[i]);if(m)d.push({n:m[1],z:i+1});}for(const a of d){const re=new RegExp('\\b'+a.n+'\\b');for(let i=0;i<a.z-1;i++){if(re.test(z[i])){console.log('VOR der Anlage: '+a.n+' | '+a.z+' vs '+(i+1));break;}}}"
```

Ob die Oberfläche wirklich zeichnet, kann nur ein Blick auf den Bildschirm
zeigen. Was die Werkstatt meldet, wenn das Modul nicht lädt, steht im Boot-Fenster
(„Failed to load plugins“) und in der Browser-Konsole.

Der Suchlauf ist absichtlich grob: er findet jeden Texttreffer vor der
Anlagestelle. Treffer in Zeichenketten (etwa das Wort `box` in `border-box`) oder
in Funktionen, die erst beim Zeichnen laufen, sind harmlos. Gefährlich ist nur
ein Zugriff **beim Laden** — so wie damals bei `SPALTE`, wo ein Stil-Objekt den
Wert sofort liest. Bei einem Treffer also immer fragen: läuft diese Zeile beim
Laden oder erst beim Zeichnen?

## Grenzen

- **MCP** lässt sich nicht prüfen: die Dienstübersicht des Hosts führt keinen
  MCP-Dienst. Die Beratung erklärt deshalb, wie ein Anschluss entsteht, statt
  seinen Zustand zu lesen.
- **Der Kartenkatalog ist von Hand gepflegt.** Die echten Skills der Werkstatt
  ließen sich nur über einen Befehl holen, und jeder Befehlsaufruf schreibt eine
  Zeile in den Chat.
- **Gesprochen wird über die Stimme des Browsers**, mit Vorliebe für eine, die
  auf dem Rechner bleibt.

## Entfernen

```
plugin_manager remove_bundle  @promptheus/dsh-plugin-workflows
```

Danach bleibt der Ordner liegen; er kann gelöscht werden.
