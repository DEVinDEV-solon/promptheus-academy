# Agenten-Team

Das Paket der Werkstatt für ganze Arbeitsabläufe. Ein Knopf öffnet ein großes
Fenster; darin wird in zehn Schritten zusammengestellt, was ein Ablauf tun soll.
Am Ende geht der fertige Auftrag ins Eingabefeld, und Hephaistos baut daraus den
Workflow.

## Die fünf Plätze

| Platz | Kennung | Was dort steht |
|---|---|---|
| `conversation.input.dock` | `workflows-karte` | Die Zeile über dem Eingabefeld, mittig in Eingabefeldbreite: `Vorlage einsetzen` und `Fenster` |
| `sidebar.footer.action` | `agenten-team` | Die Knopfreihe in der Seitenleiste, unter Community und Cinema: `Agenten-Team` und der Briefumschlag für den Mail-Abruf |
| `shell.overlay` | `agenten-team-fenster` | Das grosse Fenster des Agenten-Teams |
| `shell.overlay` | `mail-fenster` | Das grosse Fenster `Mail-Abruf` |
| `shell.overlay` | `agenten-team-leiste` | Die flache Leiste am unteren Rand, über die ganze Fensterbreite, mit Logo, Schrittzeichen und zwei Knöpfen |

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

Der Briefumschlag in der Seitenleiste öffnet ein zweites grosses Fenster. Es sammelt
die Wünsche an einer Stelle:

- **Abruf**: Quelle, Zeitplan, Zeitraum, was nach dem Abruf geschieht, und die Ablage.
  Bleibt die Quelle leer, steht darunter ein Warnhinweis.
- **Mail-Workflows**: eine Zeile je Workflow mit Name, Zielordner und Regel. Rechts in
  der Zeile der Schalter — grün heisst ein, rot heisst aus, untereinander. Ein neuer
  Workflow startet grün. `Plugin erzeugen` ist gesperrt, solange der Workflow aus ist.
- **Speichern** legt alles im Browser ab (`localStorage`, Schlüssel
  `agenten-team-auswahl`, Feld `mail`). Auf die Platte kommt nichts, solange kein
  Knopf gedrückt wird.

`Plugin erzeugen` ruft den Befehl `mail-erzeugen` der Host-Hälfte. Der schreibt für den
Workflow ein eigenes Bündel nach `…\werkstatt\deepseek-harness\plugins\eigene\<kennung>-mail\`:
`package.json`, `cordis.patch.yml`, `index.js`, `README.md`. Das Bündel meldet einen
eigenen Befehl `/<kennung>-abruf` an, der seine Einstellungen ausgibt — samt
Schalterzustand. Der Abruf selbst fehlt noch: dafür braucht es die Mailquelle. Umlaute
werden in der Kennung umgeschrieben (`ä` → `ae`), ein leerer Name wird abgewiesen.

## Die Zahlen zum Ändern

Alle stehen im Kopf von `client.js` und sind zum Ändern gedacht:

- `SPALTE`: Höchstbreite der Zeile über dem Eingabefeld — ungefähr die Breite des
  Eingabefelds. Die Leiste dagegen läuft über die **ganze Fensterbreite**
  (`left: 0; right: 0`).
- `LINKS_ANTEIL` (0,2), `UNTEN_ANTEIL` (0,2) und `WARTEZEIT_MS` (300) im Abschnitt
  Taskleiste: die **Auslösefläche unten links** — ein Fünftel der Fensterbreite mal
  ein Fünftel der Fensterhöhe. Nur wenn der Zeiger in dieser Fläche ist, fährt die
  Leiste hoch; die Mitte bleibt frei, damit sie nicht aufspringt, wenn man zum
  Eingabefeld fährt. `WARTEZEIT_MS` ist der Nachlauf, bis sie wieder einfährt.

Die Leiste hat zwei Sperren: sie fährt **nicht** hoch, solange ein Fenster offen ist,
und sie ignoriert Zeigerereignisse **ohne Bewegung**. Solche Ereignisse schickt der
Browser, wenn unter dem Zeiger etwas abgebaut wird — früher sprang die Leiste deshalb
beim Schliessen eines Fensters auf.

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
- ob die Leiste festgehalten wird (`fest` oder `hover`).

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
