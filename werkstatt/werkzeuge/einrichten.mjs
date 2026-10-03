/**
 * PROMPTHEUS Werkstatt — Einrichtung.
 *
 * Macht aus dem Ordner `werkstatt/`, wie er im Repo liegt, eine lauffähige
 * Werkstatt. Das Repo trägt nur die PROMPTHEUS-Schicht (Pakete, Werkzeuge,
 * Profilvorlage). Der Harness selbst ist ein eigenes Upstream-Repo und wird
 * hier geholt; das Zuhause `.dsh/` und die Zugangsdaten entstehen nur lokal.
 *
 * Schritte (jeder überspringt sich selbst, wenn er schon erledigt ist):
 *   1. Node, Git und pnpm prüfen (pnpm auf Wunsch über corepack einrichten)
 *   2. Harness beim geprüften Stand klonen
 *   3. Abhängigkeiten installieren (pnpm install --frozen-lockfile)
 *   4. Profil „promptheus" aus der Vorlage anlegen (vorhandenes bleibt)
 *   5. OpenRouter-Schlüssel eintragen (aus der Academy übernehmen oder eingeben)
 *   6. Pakete bauen (werkzeuge/bauen.mjs)
 *
 * Aufruf:  node werkzeuge/einrichten.mjs
 *          node werkzeuge/einrichten.mjs --ja              alle Rückfragen mit Ja
 *          node werkzeuge/einrichten.mjs --ohne-schluessel Schlüssel später
 *          node werkzeuge/einrichten.mjs --neu             Abhängigkeiten neu installieren
 */

import { spawnSync } from 'node:child_process'
import { appendFileSync, chmodSync, cpSync, existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { createInterface } from 'node:readline'
import { fileURLToPath } from 'node:url'
import { SCHUTZ_PORT } from './schutz/schutzschicht.mjs'
import { arbeitsordnerBereinigen, profilAbsichern, profilPruefen, schluesselUmziehen } from './schutz/absichern.mjs'

const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const ACADEMY = resolve(WURZEL, '..')
const HARNESS = join(WURZEL, 'deepseek-harness')
const ZUHAUSE = join(WURZEL, '.dsh')
const PROFIL = join(ZUHAUSE, 'profiles', 'promptheus')
const VORLAGE = join(WURZEL, 'vorlage', 'profil-promptheus')

/** Der geprüfte Stand des Harness. Neuer Stand = neue Abnahme, dann hier eintragen. */
const HARNESS_URL = 'https://github.com/deepseek-ai/deepseek-harness.git'
const HARNESS_STAND = '639ed015397290b3745d163aafe02ffee4aa3f84'
const PNPM_FASSUNG = '11.7.0'

const WIN = process.platform === 'win32'
const JA = process.argv.includes('--ja')
const OHNE_SCHLUESSEL = process.argv.includes('--ohne-schluessel')
const NEU = process.argv.includes('--neu')

function melde(text) { console.log(`einrichten: ${text}`) }
function stopp(text) {
  console.error('')
  console.error(`einrichten: FEHLER — ${text}`)
  process.exit(1)
}

/** Führt einen Befehl aus; unter Windows über die Shell, damit .cmd-Dateien laufen. */
function lauf(befehl, argumente, optionen = {}) {
  const erg = spawnSync(befehl, argumente, { stdio: 'inherit', shell: WIN, ...optionen })
  return erg.status === 0 && erg.error === undefined
}

/** Führt einen Befehl still aus und liefert seine Ausgabe, oder null. */
function frage(befehl, argumente, optionen = {}) {
  const erg = spawnSync(befehl, argumente, { encoding: 'utf8', shell: WIN, ...optionen })
  return erg.status === 0 ? (erg.stdout ?? '').trim() : null
}

/** Ja/Nein-Frage. Ohne Terminal oder mit --ja: die Vorgabe. */
function jaNein(text, vorgabe = true) {
  if (JA || !process.stdin.isTTY) return Promise.resolve(vorgabe)
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((fertig) => {
    rl.question(`  ${text} [${vorgabe ? 'J/n' : 'j/N'}] `, (antwort) => {
      rl.close()
      const a = antwort.trim().toLowerCase()
      fertig(a === '' ? vorgabe : a === 'j' || a === 'ja' || a === 'y')
    })
  })
}

/** Verdeckte Eingabe (der Schlüssel erscheint nicht am Bildschirm). */
function verdeckt(text) {
  if (!process.stdin.isTTY) return Promise.resolve('')
  const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true })
  let stumm = false
  rl._writeToOutput = (s) => { if (!stumm) process.stdout.write(s) }
  return new Promise((fertig) => {
    rl.question(`  ${text} `, (antwort) => {
      rl.close()
      process.stdout.write('\n')
      fertig(antwort.trim())
    })
    stumm = true
  })
}

/** Liest eine einfache SCHLUESSEL=WERT-Datei. */
function envLesen(pfad) {
  if (!existsSync(pfad)) return {}
  const werte = {}
  for (const zeile of readFileSync(pfad, 'utf8').split(/\r?\n/)) {
    const t = zeile.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
    if (t !== null) werte[t[1]] = t[2].trim().replace(/^["']|["']$/g, '')
  }
  return werte
}

const SCHLUESSEL_FORM = /^sk-or-v1-[A-Za-z0-9]{20,}$/

// ── 1. Voraussetzungen ───────────────────────────────────────────────────────
function nodePruefen() {
  const [haupt, neben] = process.versions.node.split('.').map(Number)
  const passt = (haupt === 22 && neben >= 19) || haupt >= 24
  if (!passt) {
    stopp(`Node ${process.versions.node} ist zu alt. Der Harness braucht Node 22.19 oder neuer ` +
      '(oder 24+). Download: https://nodejs.org/ — danach dieses Skript erneut starten.')
  }
  melde(`Node ${process.versions.node} ✓`)
}

function gitPruefen() {
  const v = frage('git', ['--version'])
  if (v === null) stopp('Git fehlt. Installieren: winget install --id Git.Git -e')
  melde(`${v} ✓`)
}

function pnpmFassung() {
  return frage(WIN ? 'pnpm.cmd' : 'pnpm', ['--version']) ?? frage('pnpm', ['--version'])
}

async function pnpmPruefen() {
  let v = pnpmFassung()
  if (v !== null) { melde(`pnpm ${v} ✓`); return }

  melde(`pnpm fehlt. Es kann über corepack (Teil von Node) eingerichtet werden: pnpm@${PNPM_FASSUNG}.`)
  if (!await jaNein('pnpm jetzt einrichten?')) stopp('Ohne pnpm lässt sich der Harness nicht installieren.')

  lauf('corepack', ['enable', 'pnpm'])
  lauf('corepack', ['prepare', `pnpm@${PNPM_FASSUNG}`, '--activate'])
  v = pnpmFassung()
  if (v === null) {
    melde('corepack hat nicht gereicht, versuche npm …')
    lauf('npm', ['install', '-g', `pnpm@${PNPM_FASSUNG}`])
    v = pnpmFassung()
  }
  if (v === null) stopp('pnpm ließ sich nicht einrichten. Von Hand: npm install -g pnpm@' + PNPM_FASSUNG)
  melde(`pnpm ${v} ✓`)
}

// ── 2. Harness ───────────────────────────────────────────────────────────────
function harnessHolen() {
  if (existsSync(join(HARNESS, '.git'))) {
    const stand = frage('git', ['-C', HARNESS, 'rev-parse', 'HEAD'])
    if (stand === HARNESS_STAND) { melde(`Harness beim geprüften Stand ${HARNESS_STAND.slice(0, 10)} ✓`); return }
    // Ein abweichender Stand wird NICHT still umgestellt: dort kann Arbeit liegen.
    melde(`ACHTUNG: Harness steht auf ${String(stand).slice(0, 10)}, geprüft ist ${HARNESS_STAND.slice(0, 10)}.`)
    melde('         Er bleibt unverändert. Umstellen von Hand:')
    melde(`         git -C "${HARNESS}" fetch && git -C "${HARNESS}" checkout --detach ${HARNESS_STAND}`)
    return
  }
  if (existsSync(HARNESS)) stopp(`${HARNESS} existiert, ist aber kein Git-Repo. Bitte prüfen und ggf. umbenennen.`)

  melde('Harness wird geholt (einmalig, einige Minuten) …')
  if (!lauf('git', ['clone', '--filter=blob:none', '--no-checkout', HARNESS_URL, HARNESS])) {
    stopp('Klonen fehlgeschlagen. Netz und GitHub erreichbar?')
  }
  if (!lauf('git', ['-C', HARNESS, 'checkout', '--detach', HARNESS_STAND])) {
    stopp(`Der geprüfte Stand ${HARNESS_STAND} ließ sich nicht auschecken.`)
  }
  melde('Harness geholt ✓')
}

// ── 3. Abhängigkeiten ────────────────────────────────────────────────────────
function abhaengigkeiten() {
  if (!NEU && existsSync(join(HARNESS, 'node_modules', '.pnpm'))) {
    melde('Abhängigkeiten vorhanden ✓ (neu installieren mit --neu)')
    return
  }
  melde('Abhängigkeiten werden installiert (pnpm install) …')
  if (!lauf(WIN ? 'pnpm.cmd' : 'pnpm', ['install', '--frozen-lockfile'], { cwd: HARNESS })) {
    stopp('pnpm install ist gescheitert. Ausgabe oben prüfen.')
  }
  melde('Abhängigkeiten ✓')
}

// ── 4. Profil ────────────────────────────────────────────────────────────────
function profilAnlegen() {
  if (existsSync(join(PROFIL, 'package.json'))) { melde('Profil „promptheus" vorhanden ✓ (bleibt unverändert)'); return }
  cpSync(VORLAGE, PROFIL, { recursive: true })
  melde('Profil „promptheus" aus der Vorlage angelegt ✓')
}

// ── 5. Schlüssel ─────────────────────────────────────────────────────────────
async function schluessel() {
  const envPfad = join(HARNESS, '.env')
  const vorhanden = envLesen(envPfad)
  if (vorhanden.OPENROUTER_API_KEY || vorhanden.DEEPSEEK_API_KEY) { melde('Schlüssel in der Harness-.env vorhanden ✓'); return }
  if (OHNE_SCHLUESSEL) { melde('Schlüssel übersprungen (--ohne-schluessel). Die Werkstatt startet erst mit Schlüssel.'); return }

  let wert = ''
  const academy = envLesen(join(ACADEMY, '.env')).PU_OPENROUTER_API_KEY ?? ''
  if (SCHLUESSEL_FORM.test(academy) && await jaNein('Den OpenRouter-Schlüssel der Academy auch für die Werkstatt nutzen?')) {
    wert = academy
  } else {
    melde('Die Werkstatt braucht einen OpenRouter-Schlüssel (sk-or-v1-…). Enter = später eintragen.')
    wert = await verdeckt('Schlüssel:')
  }

  if (wert === '') { melde('Kein Schlüssel eingetragen. Später erneut starten oder in der Maske eintragen.'); return }
  if (!SCHLUESSEL_FORM.test(wert)) stopp('Das sieht nicht nach einem OpenRouter-Schlüssel aus (sk-or-v1-…). Nichts gespeichert.')

  appendFileSync(envPfad, `\nOPENROUTER_API_KEY=${wert}\n`, { encoding: 'utf8', mode: 0o600 })
  try { chmodSync(envPfad, 0o600) } catch { /* Windows: ohne Wirkung */ }
  melde('Schlüssel in die Harness-.env geschrieben ✓ (nie im Repo, .gitignore)')
}

// ── 6. Bauen ─────────────────────────────────────────────────────────────────
/**
 * Die Schutzschicht vorbereiten (werkzeuge/schutz/absichern.mjs) — dieselben
 * Schritte wie bei jedem Start, hier schon beim Einrichten, damit eine neue
 * Installation vom ersten Augenblick an geschützt ist: Zugriffsstufe mit
 * Rückfrage, Anbieter über die Schutzschicht, Schlüssel in deren Ebene, die
 * Academy kein Arbeitsordner.
 */
function absichern() {
  const profil = join(WURZEL, '.dsh', 'profiles', 'promptheus', 'cordis.patch.yml')
  for (const z of profilAbsichern(profil, SCHUTZ_PORT)) melde(`Profil: ${z}`)
  const umzug = schluesselUmziehen(join(WURZEL, 'deepseek-harness', '.env'))
  if (umzug.umgezogen) melde('Schlüssel in die Ebene der Schutzschicht umgezogen; der Harness behält einen Platzhalter.')
  for (const t of arbeitsordnerBereinigen(join(WURZEL, '.dsh'))) melde(`Arbeitsordner „${t}“ entfernt (liegt in der Academy).`)
  const befunde = profilPruefen(profil, SCHUTZ_PORT)
  if (befunde.length > 0) {
    for (const b of befunde) melde(`ACHTUNG: ${b}`)
    melde('Die Werkstatt wird so nicht starten. Profil prüfen.')
  } else {
    melde(`Schutzschicht vorbereitet: alle Modellanfragen über 127.0.0.1:${SCHUTZ_PORT} ✓`)
  }
}

function bauen() {
  melde('PROMPTHEUS-Pakete werden gebaut …')
  if (!lauf(process.execPath, [join(WURZEL, 'werkzeuge', 'bauen.mjs')], { shell: false })) {
    stopp('Bauen gescheitert. Ausgabe oben prüfen.')
  }
}

// ── Ablauf ───────────────────────────────────────────────────────────────────
console.log('')
console.log('  PROMPTHEUS Werkstatt — Einrichtung')
console.log(`  Ordner: ${WURZEL}`)
console.log('')
nodePruefen()
gitPruefen()
await pnpmPruefen()
harnessHolen()
abhaengigkeiten()
profilAnlegen()
await schluessel()
bauen()
absichern()
console.log('')
melde('fertig ✓')
melde('Die Werkstatt öffnest du aus der Academy: Einstellungen → Werkstatt (frei ab Kurs 7).')
console.log('')
