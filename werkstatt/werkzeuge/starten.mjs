/**
 * PROMPTHEUS Werkstatt — Start.
 *
 * Startet den Harness mit dem eigenen Profil auf einem eigenen Port. Der
 * heutige Betrieb auf Port 3080 bleibt unberührt (Entscheidung P2).
 *
 * Aufruf:  node starten.mjs
 *          node starten.mjs --port 3082
 */

import { spawn } from 'node:child_process'
import { existsSync, readFileSync, rmSync } from 'node:fs'
import { createConnection } from 'node:net'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SCHUTZ_PORT, schluesselLesen, schutzschichtStarten } from './schutz/schutzschicht.mjs'
import { arbeitsordnerBereinigen, laufMerken, profilAbsichern, profilPruefen, schluesselUmziehen, schutzAdresse } from './schutz/absichern.mjs'
import { profilHephaistos } from './hephaistos/persona.mjs'
import { begruessungAbgleichen } from './begruessung.mjs'
import { adresseAusZeile, adresseLoeschen, adresseSchreiben, ausgabeMitlesen } from './adresse.mjs'

/** Wurzel dieses Werkzeugs (…/werkstatt). */
const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/**
 * Wo die Harness-Installation liegt.
 *
 * Seit dem 29.09.2026 liegt der Harness **in der Werkstatt** — eine eigene,
 * vollständige Fassung, die unabhängig läuft. Der frühere Ort
 * (`…\scripts\deepseek-harness`) ist der laufende Betrieb auf Port 3080 und
 * wird von hier aus nicht angefasst.
 */
const HARNESS = join(WURZEL, 'deepseek-harness')

/** Der eigene Port (Entscheidung P2). */
const VORGABE_PORT = '3081'

/** Die Basisadresse des Anbieters. Der Schlüssel in `.env` ist ein OpenRouter-Schlüssel. */
const BASIS_URL = 'https://openrouter.ai/api/v1'

/**
 * Liest eine einfache `SCHLUESSEL=WERT`-Datei.
 *
 * Nur das Nötige: keine Anführungszeichen-Auswertung, keine Ersetzungen, keine
 * Mehrzeiler. Die Datei ist eine`.env` des Harness und hat genau diese Form.
 * @param pfad - der Pfad zur Datei.
 * @returns die Schlüssel-Wert-Paare; leer, wenn die Datei fehlt.
 */
function envLesen(pfad) {
  if (!existsSync(pfad)) return {}
  const werte = {}
  for (const zeile of readFileSync(pfad, 'utf8').split(/\r?\n/)) {
    const treffer = zeile.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
    if (treffer === null) continue
    werte[treffer[1]] = treffer[2].trim().replace(/^["']|["']$/g, '')
  }
  return werte
}

/** Liest `--port <n>` aus der Befehlszeile, sonst die Vorgabe. */
function portLesen() {
  const stelle = process.argv.indexOf('--port')
  if (stelle === -1) return VORGABE_PORT
  const wert = process.argv[stelle + 1]
  if (wert === undefined || !/^\d+$/.test(wert)) {
    throw new Error('starten: --port braucht eine Zahl, z. B. --port 3081')
  }
  return wert
}

/**
 * Ob der Browser geöffnet werden soll.
 *
 * **Vorgabe ist JA** — seit 0.2.0 ist das nicht mehr nur Bequemlichkeit:
 * der Server verlangt bei jeder Anfrage ein Zugangstoken, und nur die vom
 * Server selbst geöffnete Adresse trägt es mit. Wer den Browser abschaltet,
 * muss die vollständige Adresse aus der Startausgabe von Hand nehmen.
 * Mit `--no-open` bleibt das Fenster zu.
 */
function oeffnen() {
  return !process.argv.includes('--no-open')
}

/**
 * Ob auf einem Port schon jemand lauscht.
 *
 * Der Test ist eine schlichte Verbindung: kommt sie zustande, hört dort jemand
 * zu. Das ist verlässlicher als ein Blick in die Prozessliste, denn es fragt
 * genau das, was der Harness gleich fragen wird.
 * @param port - der zu prüfende Port.
 * @returns true, wenn der Port belegt ist.
 */
function portBelegt(port) {
  return new Promise((fertig) => {
    const verbindung = createConnection({ host: '127.0.0.1', port: Number(port) })
    const schluss = (ergebnis) => {
      verbindung.removeAllListeners()
      verbindung.destroy()
      fertig(ergebnis)
    }
    verbindung.once('connect', () => schluss(true))
    verbindung.once('error', () => schluss(false))
    // Ohne Zeitgrenze bliebe der Start bei einem halb offenen Port hängen.
    const frist = setTimeout(() => schluss(false), 1500)
    frist.unref?.()
  })
}

/**
 * Meldet, ob die Werkstatt schon läuft — und was dann zu tun ist.
 *
 * **Warum diese Prüfung nötig ist.** Ein zweiter Start auf einem belegten Port
 * scheitert mit einer Meldung, die den Zusammenhang nicht nennt:
 *
 *     Error: listen EADDRINUSE: address already in use 127.0.0.1:3081
 *     dsh: startup failed: 2 required plugins did not activate
 *
 * Der Harness bricht sauber ab (er schreibt sogar ein Diagnoseprotokoll), aber
 * am Bildschirm steht „Starten nicht möglich" — und der wahre Grund ist
 * schlicht, dass die Werkstatt **schon läuft**.
 *
 * Beendet **nichts** von selbst: eine laufende Instanz kann eine bewusst offene
 * Sitzung sein. Sie zu beenden wäre ein Eingriff, den niemand verlangt hat.
 * @param port - der Port, auf dem die Werkstatt starten soll.
 */
async function laufendePruefen(port) {
  if (!await portBelegt(port)) return
  console.log('')
  console.log('  ================================================================')
  console.log('   Die Werkstatt laeuft BEREITS.')
  console.log('  ================================================================')
  console.log('')
  console.log(`  Auf http://127.0.0.1:${port} hoert schon jemand zu. Ein zweiter`)
  console.log('  Start scheitert mit "EADDRINUSE" - das ist kein Defekt, sondern')
  console.log('  eine Doppelung.')
  console.log('')
  console.log('  So findest du die laufende Instanz:')
  console.log('    * Oeffne das Fenster, das sie geoeffnet hat.')
  console.log('    * Oder starte auf einem anderen Port:')
  console.log(`        node werkzeuge\\starten.mjs --port 3082`)
  console.log('')
  console.log('  So beendest du sie, um neu zu starten:')
  console.log(`    Get-NetTCPConnection -LocalPort ${port} -State Listen |`)
  console.log('      ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }')
  console.log('')
  process.exit(2)
}

const port = portLesen()

// ── Freigabe: nur mit Ticket aus der Academy ─────────────────────────────────
//
// Die Werkstatt ist bis zum 7. Kurs gesperrt. Entschieden wird das auf dem
// Server der Academy (srv/werkstatt.php), nicht hier: Nur ein freigegebenes
// Konto bekommt beim Klick auf „Werkstatt öffnen" ein Ticket. Es liegt in
// data/werkstatt/ticket.json, gilt zwei Minuten und nur für einen Start.
//
// Grenze: Das ist eine Sperre auf demselben Rechner. Wer Schreibrechte auf den
// Ordner hat, kann sie umgehen. Auf Schulrechnern gehört der Programmordner
// deshalb dem Verwalter-Konto, nicht dem Schülerkonto.
//
// `--betreiber` startet ohne Ticket — für die Entwicklung, mit Warnung.
const TICKET = join(WURZEL, '..', 'data', 'werkstatt', 'ticket.json')

function ticketPruefen() {
  if (process.argv.includes('--betreiber')) {
    console.log('starten: --betreiber: Start ohne Ticket aus der Academy (nur Entwicklung).')
    return null
  }
  let ticket = null
  try { ticket = JSON.parse(readFileSync(TICKET, 'utf8')) } catch { ticket = null }
  // Einmalig: gleich verbrauchen, auch wenn es abgelaufen ist.
  try { rmSync(TICKET, { force: true }) } catch { /* bleibt liegen, verfällt */ }

  const gueltig = ticket !== null && typeof ticket.ablauf === 'number' &&
    ticket.ablauf >= Math.floor(Date.now() / 1000) && typeof ticket.nonce === 'string' &&
    /^[0-9a-f]{32}$/.test(ticket.nonce)
  if (gueltig) return ticket

  console.log('')
  console.log('  ================================================================')
  console.log('   Die Werkstatt wird aus der Academy geöffnet.')
  console.log('  ================================================================')
  console.log('')
  console.log('  Academy starten → Einstellungen → Werkstatt → „Werkstatt öffnen".')
  console.log('  Frei ist sie mit dem 7. Kurs zu 100 % (Admins: sofort).')
  console.log('')
  process.exit(3)
}
const ticket = ticketPruefen()
// Wer gestartet hat — für die Zuordnung der Sitzungen im Audit-Trail.
laufMerken(ticket?.lernender)

/**
 * Wo die Academy läuft, die diese Werkstatt geöffnet hat. Der Knopf
 * „Community“ leitet dorthin (`api.php?aktion=community_oeffnen`), denn nur
 * die Academy kennt die Person und das Abo. Das Ticket trägt die Adresse; ohne
 * Ticket (`--betreiber`) gilt die Vorgabe der Startdatei. Nur dieser Rechner.
 */
const ACADEMY = typeof ticket?.academy === 'string' &&
  /^http:\/\/(127\.0\.0\.1|localhost):\d{1,5}$/.test(ticket.academy) ? ticket.academy : 'http://127.0.0.1:8801'

// ── Die Anbieter-Umgebung ────────────────────────────────────────────────────
//
// Das ist der Punkt, an dem die Modelwahl scheitert, wenn er fehlt.
//
// Der Anbieter `deepseek-official` zeigt ohne `DEEPSEEK_BASE_URL` auf
// `https://api.deepseek.com` (PUBLIC_BASE_URL in packages/llm/llm-deepseek).
// Der Schlüssel in der `.env` ist aber ein **OpenRouter**-Schlüssel (`sk-or-v1-…`).
// Ergebnis: der Anbieter antwortet mit einem Fehler, die Modellliste bleibt leer,
// und die Modelwahl läßt sich nicht bedienen — ohne dass irgendwo steht, warum.
//
// Der Vertrag aus packages/llm/llm-deepseek sagt: `baseURL` fällt auf
// `$DEEPSEEK_BASE_URL` „from a trusted environment layer" zurück. Diese Schicht
// ist der Startprozess; also muß er die Adresse setzen.
// ── Das eigene Zuhause ───────────────────────────────────────────────────────
//
// **Der wichtigste Punkt beim Eigenbetrieb.** Der Harness legt ALLE seine
// Benutzerdaten unter `$DSH_HOME` ab — nicht im Repo: die Profile
// (`profiles/`), die Sitzungen (`sessions/`), die Einstellungen
// (`settings.yaml`), die Zugangsdaten (`credentials.yaml`), den flachen
// Modulrückfall (`profiles/node_modules`, wo `healProfilesModuleFallback` je
// Paket einen Verweis anlegt).
//
// Ohne eigenes Zuhause teilen sich beide Fassungen `C:\Users\PC\.dsh`. Dann
// gilt: **der zuletzt gestartete Harness schreibt die Verweise des anderen um**,
// und die Werkstatt lädt plötzlich Pakete aus dem fremden Repo — oder umgekehrt.
// Das ist ein Fehler, der erst Tage später auffällt.
//
// Deshalb bekommt die Werkstatt ihr eigenes Zuhause im eigenen Ordner. Nichts
// wird geteilt, nichts wird umgeschrieben, und ein Löschen der Werkstatt lässt
// den Betrieb auf 3080 unberührt.
const ZUHAUSE = join(WURZEL, '.dsh')

// ── Die Schutzschicht (werkzeuge/schutz/) ────────────────────────────────────
//
// Seit dem 03.10.2026 spricht die Werkstatt NIE direkt mit dem Anbieter. Beide
// Modellwege zeigen auf die Schutzschicht auf 127.0.0.1:3089:
//   * `DEEPSEEK_BASE_URL` (Anbieter deepseek-official, hier),
//   * `baseURL` des Anbieters `openrouter` im Profil (profilAbsichern).
// Sie maskiert jede Anfrage, hält sie im Zweifel an und protokolliert sie für
// den Audit-Trail der Academy. Den echten Schlüssel hält nur sie
// (`data/werkstatt/schutzschicht.env`); der Harness hat einen Platzhalter.
//
// `DSH_AGENTS_HOME`: Skills nur aus dem eigenen Zuhause, nicht aus dem
// `~/.agents` des Windows-Kontos, das andere Werkzeuge mitbenutzen.
const umgebung = { ...process.env, DEEPSEEK_BASE_URL: schutzAdresse(SCHUTZ_PORT), DSH_HOME: ZUHAUSE,
  DSH_AGENTS_HOME: join(ZUHAUSE, 'agents'), PROMPTHEUS_ACADEMY_URL: ACADEMY,
  // Für die Schutzleiste über dem Eingabefeld (Plugin, Node-Hälfte).
  PROMPTHEUS_SCHUTZ_URL: `http://127.0.0.1:${SCHUTZ_PORT}` }
// Schlüssel aus der Umgebung des Windows-Kontos erbt die Werkstatt nicht.
for (const name of ['OPENROUTER_API_KEY', 'DEEPSEEK_API_KEY', 'PU_OPENROUTER_API_KEY']) delete umgebung[name]

// **Den Schlüssel NICHT in die Umgebung heben.**
//
// Der Harness läutet seine Zugangsquellen so (packages/credentials/credentials-local):
//
//   inherited process environment      (read-only, wins)      ← gesperrt
//   > $DSH_HOME/.credentials.yaml      (provider-managed, writable)
//   > <invocation cwd>/.env            (read-only fallback)
//   > $DSH_HOME/.env                   (read-only fallback)
//
// Was in der **Prozessumgebung** steht, gewinnt — und ist von innen nicht
// beschreibbar. Genau das war der Fehler: eine frühere Fassung dieses Skripts
// hob `OPENROUTER_API_KEY` und `DEEPSEEK_API_KEY` in die Umgebung, und danach
// war das Schlüsselfeld in den Modelle-Einstellungen **gesperrt** („Provided by
// the launch environment (read-only)"). Der Nutzer konnte keinen Schlüssel
// eintragen, und kein Chat lief.
//
// Richtig ist: die Schlüssel bleiben in der `.env` des Harness. Der Harness
// liest sie selbst als „fallback" — und diese Schicht ist **beschreibbar**:
// ein über die Modelle-Seite eingetragener Schlüssel ersetzt sie wirksam.
//
// **Die Umgebungsvariable `DEEPSEEK_BASE_URL` ist davon nicht betroffen.** Sie
// ist keine Zugangsangabe, sondern die Adresse des Anbieters; ohne sie fragt der
// Harness `api.deepseek.com` und bekommt mit einem OpenRouter-Schlüssel
// HTTP 401. Sie darf und muss hier gesetzt werden.
//
// Nur melden, was in der `.env` steht — ohne es in die Umgebung zu heben.
// ── Absichern vor jedem Start (werkzeuge/schutz/absichern.mjs) ───────────────
const PROFIL = join(ZUHAUSE, 'profiles', 'promptheus', 'cordis.patch.yml')
const umzug = schluesselUmziehen(join(HARNESS, '.env'))
const profilAenderung = profilAbsichern(PROFIL, SCHUTZ_PORT)
const ordnerWeg = arbeitsordnerBereinigen(ZUHAUSE)
for (const z of profilAenderung) console.log(`starten: Profil    ${z}`)
for (const t of ordnerWeg) console.log(`starten: Arbeitsordner „${t}“ entfernt (liegt in der Academy oder darüber)`)
if (umzug.umgezogen) console.log('starten: Schlüssel in die Schutzschicht umgezogen; der Harness hat einen Platzhalter.')

// Hephaistos als Agent der Werkstatt (werkzeuge/hephaistos/persona.mjs): keine
// Selbstvorstellung als „DeepSeek Harness“, eigene Persona in jedem Preset.
const hephaistos = profilHephaistos(PROFIL)
for (const z of hephaistos.geaendert) console.log(`starten: Profil    ${z}`)
for (const f of hephaistos.fehler) console.warn(`starten: Hinweis   ${f}`)

// Die Begrüssung oben (werkzeuge/begruessung.mjs): eingehängt, solange
// niemand sie abgewählt hat. Ein Fehler hier hält den Start nicht auf.
const begruessung = begruessungAbgleichen(ZUHAUSE)
for (const z of begruessung.geaendert) console.log(`starten: Profil    ${z}`)
for (const f of begruessung.fehler) console.warn(`starten: Hinweis   ${f}`)

// Startsperre: Ein Modellweg, der nicht über die Schutzschicht geht, wäre ein
// Loch im Riegel. Dann startet die Werkstatt nicht.
const befunde = profilPruefen(PROFIL, SCHUTZ_PORT)
if (befunde.length > 0) {
  console.error('starten: Die Werkstatt startet nicht — sie wäre nicht geschützt:')
  for (const b of befunde) console.error(`         ${b}`)
  console.error(`         Profil: ${PROFIL}`)
  process.exit(4)
}

const dateiUmgebung = envLesen(join(HARNESS, '.env'))
const schluesselName = dateiUmgebung.OPENROUTER_API_KEY !== undefined ? 'OPENROUTER_API_KEY'
  : dateiUmgebung.DEEPSEEK_API_KEY !== undefined ? 'DEEPSEEK_API_KEY'
    : undefined

/**
 * Zugangsschlüssel, die die **Prozessumgebung** mitbringt.
 *
 * Sie gewinnen gegen alles andere und sind von innen nicht beschreibbar — das
 * Schlüsselfeld in den Modelle-Einstellungen wäre also gesperrt. Das ist kein
 * Fehler des Harness, sondern seine Absicht („a CI secret is this run's explicit
 * intent"). Es ist aber fast nie gewollt, wenn jemand die Maske bedienen will.
 * Deshalb wird es ausdrücklich gemeldet, statt still zu geschehen.
 */
const gesperrteSchluessel = ['OPENROUTER_API_KEY', 'DEEPSEEK_API_KEY']
  .filter(name => process.env[name] !== undefined && process.env[name] !== '')

console.log('starten: PROMPTHEUS Werkstatt')
console.log(`starten: Profil   promptheus`)
console.log(`starten: Adresse  http://127.0.0.1:${port}`)
console.log(`starten: Zuhause  ${ZUHAUSE}`)
console.log(`starten: Academy  ${ACADEMY}`)
console.log(`starten: Anbieter ${BASIS_URL} — nur über die Schutzschicht 127.0.0.1:${SCHUTZ_PORT}`)
console.log(`starten: Schlüssel ${schluesselLesen() ? 'in der Schutzschicht' : 'FEHLT — Modelle werden nicht laden'}`)
console.log('')

if (gesperrteSchluessel.length > 0) {
  console.log('  ACHTUNG: Diese Schlüssel stehen in der Prozessumgebung und')
  console.log('  sperren damit das Schlüsselfeld in den Modelle-Einstellungen:')
  for (const name of gesperrteSchluessel) console.log(`    ${name}`)
  console.log('  Die Umgebung gewinnt und ist von innen nicht beschreibbar.')
  console.log('  Entferne sie aus der Windows-Umgebung dieses Nutzers, wenn du')
  console.log('  Schlüssel in der Maske eintragen willst:')
  console.log('    [Environment]::SetEnvironmentVariable("<NAME>", $null, "User")')
  console.log('')
}

console.log('  Der Harness öffnet gleich ein Fenster mit der richtigen Adresse.')
console.log('  Diese Adresse trägt ein Zugangstoken — seit 0.2.0 verlangt der')
console.log('  Server es bei jeder Anfrage. Öffnest du die Maske ohne Token,')
console.log('  antwortet sie mit „401 Nicht autorisiert". Nimm deshalb die')
console.log('  Adresse aus dem Fenster oder aus der Zeile „dsh web: …" unten.')
console.log('')

if (schluesselName === undefined || !schluesselLesen()) {
  console.error('starten: Es ist kein Anbieter-Schlüssel eingerichtet.')
  console.error('         Er gehört in die Ebene der Schutzschicht (data\\werkstatt\\schutzschicht.env),')
  console.error('         nicht zum Harness. Eintragen mit: WERKSTATT-EINRICHTEN.bat')
  process.exit(1)
}

// ── Läuft schon etwas auf diesem Port? ───────────────────────────────────────
// Die Prüfung und ihre Begründung stehen bei `laufendePruefen` oben.
await laufendePruefen(port)

// Die Schutzschicht zuerst. Startet sie nicht, startet die Werkstatt nicht:
// ohne Riegel kein Modellzugang (der Harness fände nur einen toten Port).
let schutz
try {
  schutz = await schutzschichtStarten({ port: SCHUTZ_PORT, lernender: ticket?.lernender })
} catch (fehler) {
  console.error(`starten: Die Schutzschicht startet nicht (${fehler.code ?? fehler.message}).`)
  console.error(`         Ist Port ${SCHUTZ_PORT} belegt? Dann läuft noch eine alte Werkstatt; in der Academy „Neu starten“.`)
  process.exit(5)
}

// Der Harness wird aus dem Quelltext gestartet — genau wie der heutige Betrieb.
//
// Die Aufrufform ist bindend und nicht offensichtlich:
//   * `web` ist ein fester Kurzname für das Profil `web` und nimmt kein
//     `--profile` an. Der eigene Profilname geht deshalb über den Wurzelbefehl.
//   * Die Schalter des Programms (`--port`, `--no-open`) stehen HINTER den
//     Schaltern des Starters. Der Starter gibt alles ab dem ersten Token, das
//     er nicht kennt, unverändert an das Programm weiter.
// Also: `--profile promptheus --port 3081` — und kein `web` dazwischen.
//
// Die Standardausgabe läuft durch dieses Skript (unverändert ins Fenster), damit
// die Zeile „dsh web: …“ mitgelesen werden kann: Ihre Adresse trägt das
// Zugangstoken, und die Academy öffnet damit „Zur Werkstatt“ (adresse.mjs).
// Eine alte Adresse vom letzten Lauf gilt nicht mehr.
adresseLoeschen()
process.on('exit', () => adresseLoeschen())
const kind = spawn(
  process.execPath,
  [
    '--import', 'tsx/esm', join('apps', 'cli', 'src', 'bin.ts'),
    '--profile', 'promptheus',
    '--port', port,
    ...(oeffnen() ? [] : ['--no-open']),
  ],
  {
    cwd: HARNESS,
    stdio: ['inherit', 'pipe', 'inherit'],
    env: umgebung,
  },
)

ausgabeMitlesen(kind.stdout, process.stdout, (zeile) => {
  const adresse = adresseAusZeile(zeile, port)
  if (adresse === null) return
  try {
    adresseSchreiben(adresse, { lernender: ticket?.lernender, port })
  } catch (fehler) {
    // Ohne Datei fehlt nur der Knopf „Zur Werkstatt“; das Fenster öffnet der Harness selbst.
    console.warn(`starten: Adresse für die Academy nicht ablegbar (${fehler.code ?? fehler.message}).`)
  }
})

kind.on('exit', (code) => {
  adresseLoeschen()
  console.log(`\nstarten: beendet (${String(code)})`)
  schutz.schliessen().finally(() => process.exit(code ?? 0))
})
