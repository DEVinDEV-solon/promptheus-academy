/**
 * PROMPTHEUS Werkstatt — Prüfung des Wegs ins Cinema Studio (cinema.ts).
 *
 * Läuft gegen das gebaute `lib/index.js`. Startet nichts: Der Start von
 * Cinema Studio ist nachgestellt, der Programmordner ist ein leerer
 * Zwischenordner. Geprüft wird:
 *
 *   1. Ordnersuche: nur ein Ordner mit server.py, zugang.py und Startdatei gilt.
 *   2. Ticket: Form wie in zugang.py (32 Hexzeichen, höchstens 120 s).
 *   3. Umgebung: der Platzhalter-Schlüssel der Werkstatt geht nicht mit.
 *   4. Wege: nur von der eigenen Seite, Start legt Ticket ab und startet einmal,
 *      Doppelklick startet kein zweites Fenster, laufendes Studio wird erkannt.
 *   5. Erkennung am Server-Kopf: ein fremdes Programm auf dem Port zählt nicht.
 *
 * Aufruf:  node werkzeuge\cinema_pruefen.mjs
 */

import { createServer } from 'node:http'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const lib = await import(pathToFileURL(join(WURZEL, 'pakete', 'dsh-client-ui-promptheus', 'lib', 'index.js')).href)

const fehler = []
function pruefe(bedingung, text) {
  if (!bedingung) fehler.push(text)
}

/** Eine nachgestellte Antwort, wie der Webserver des Harness sie reicht. */
function antwort() {
  return new Promise(fertig => {
    const res = {
      code: 0, kopf: {}, rumpf: '',
      writeHead(code, kopf) { this.code = code; this.kopf = kopf ?? {} },
      end(text) { this.rumpf = text ?? ''; fertig(this) },
    }
    res.fertig = fertig
    antwort.letzte = res
  })
}
async function rufe(handler, methode, seite) {
  const warten = antwort()
  handler({ method: methode, headers: seite === undefined ? {} : { 'sec-fetch-site': seite } }, antwort.letzte)
  return warten
}

const tmp = mkdtempSync(join(tmpdir(), 'cinema_pruefen_'))
try {
  // ── 1. Ordnersuche ──────────────────────────────────────────────────────────
  const werkstatt = join(tmp, 'werkstatt')
  const ziel = join(werkstatt, 'scripts', 'CINEMA-STUDIO')
  mkdirSync(ziel, { recursive: true })
  pruefe(lib.cinemaOrdner(werkstatt) === undefined, '1: leerer Ordner darf nicht als Cinema Studio gelten')
  for (const datei of ['server.py', 'zugang.py', 'CINEMA-STUDIO-START.bat']) writeFileSync(join(ziel, datei), '')
  pruefe(lib.cinemaOrdner(werkstatt) === ziel, '1: Zielordner scripts\\CINEMA-STUDIO wird nicht gefunden')
  pruefe(lib.cinemaOrdner(werkstatt, 'relativ\\pfad') === ziel, '1: relativer PROMPTHEUS_CINEMA_DIR muss verworfen werden')
  pruefe(lib.cinemaPort('80') === 8796 && lib.cinemaPort('8797') === 8797 && lib.cinemaPort('x') === 8796,
    '1: Port-Regel stimmt nicht')

  // ── 2. Ticket ───────────────────────────────────────────────────────────────
  const jetzt = 1_800_000_000_000
  const pfad = lib.ticketSchreiben(ziel, jetzt)
  const ticket = JSON.parse(readFileSync(pfad, 'utf8'))
  pruefe(/^[0-9a-f]{32}$/.test(ticket.nonce), '2: nonce hat nicht 32 Hexzeichen')
  pruefe(ticket.ablauf === jetzt / 1000 + 120, '2: Ticket gilt nicht genau 120 s')
  pruefe(pfad === join(ziel, 'zugang', 'ticket.json'), '2: Ticket liegt nicht in zugang\\ticket.json')
  rmSync(pfad)

  // ── 3. Umgebung ─────────────────────────────────────────────────────────────
  const sauber = lib.starterUmgebung({
    PATH: 'C:\\Windows', SystemRoot: 'C:\\Windows', OPENROUTER_API_KEY: 'platzhalter', openrouter_api_key: 'klein',
    DEEPSEEK_BASE_URL: 'http://127.0.0.1:3089', ANTHROPIC_API_KEY: 'x', DSH_HOME: 'x', PROMPTHEUS_ACADEMY_URL: 'x',
    CLAUDE_CODE_OAUTH_TOKEN: 'x', BILDGEN_PORT: '1', NODE_OPTIONS: '--x',
  })
  pruefe(JSON.stringify(Object.keys(sauber).sort()) === JSON.stringify(['PATH', 'SystemRoot']),
    `3: Umgebung nicht bereinigt (übrig: ${Object.keys(sauber).join(', ')})`)

  // ── 4. Wege ─────────────────────────────────────────────────────────────────
  let gestartet = 0
  let laeuftJetzt = false
  let uhr = jetzt
  const routen = lib.cinemaRouten({
    werkstatt, port: 8796,
    starten: () => { gestartet += 1 },
    laeuftPruefen: async () => laeuftJetzt,
    jetzt: () => uhr,
  })
  const seite = routen['/promptheus-cinema']
  const starten = routen['/promptheus-cinema/starten']
  const stand = routen['/promptheus-cinema/stand']
  pruefe(seite && starten && stand, '4: nicht alle drei Wege da')

  let r = await rufe(seite, 'GET', 'same-origin')
  pruefe(r.code === 200 && r.rumpf.includes('PROMPTHEUS') && r.rumpf.includes('Cinema Studio wird geöffnet'),
    '4: Startseite fehlt')
  pruefe(/script-src 'nonce-/.test(r.kopf['content-security-policy'] ?? ''), '4: Startseite ohne CSP mit nonce')
  pruefe(!/https?:\/\/(?!127\.0\.0\.1)/.test(r.rumpf), '4: Startseite lädt etwas von aussen')
  r = await rufe(seite, 'GET', 'cross-site')
  pruefe(r.code === 403 && r.rumpf.includes('var ERLAUBT = false'), '4: fremde Seite bekommt die Startseite freigeschaltet')

  r = await rufe(starten, 'POST', 'cross-site')
  pruefe(r.code === 403 && gestartet === 0, '4: fremde Seite darf starten')
  r = await rufe(starten, 'GET', 'same-origin')
  pruefe(r.code === 405, '4: Start per GET muss abgelehnt werden')

  r = await rufe(starten, 'POST', 'same-origin')
  pruefe(r.code === 200 && JSON.parse(r.rumpf).stand === 'startet' && gestartet === 1, '4: Start legt nicht los')
  pruefe(existsSync(join(ziel, 'zugang', 'ticket.json')), '4: Start legt kein Ticket ab')
  r = await rufe(starten, 'POST', 'same-origin')
  pruefe(gestartet === 1, '4: Doppelklick startet ein zweites Fenster')
  uhr += 61_000
  r = await rufe(starten, 'POST', 'same-origin')
  pruefe(gestartet === 2, '4: nach Ablauf der Wartezeit muss ein neuer Start möglich sein')

  r = await rufe(stand, 'GET', 'same-origin')
  pruefe(JSON.parse(r.rumpf).stand === 'startet', '4: Stand meldet „läuft“, obwohl nichts läuft')
  laeuftJetzt = true
  r = await rufe(stand, 'GET', 'same-origin')
  const d = JSON.parse(r.rumpf)
  pruefe(d.stand === 'laeuft' && d.adresse === 'http://127.0.0.1:8796/', '4: Stand erkennt laufendes Studio nicht')
  r = await rufe(starten, 'POST', 'same-origin')
  pruefe(JSON.parse(r.rumpf).stand === 'laeuft' && gestartet === 2, '4: läuft schon, darf aber nicht neu starten')
  r = await rufe(stand, 'GET', 'cross-site')
  pruefe(r.code === 403, '4: fremde Seite darf den Stand lesen')

  const leer = lib.cinemaRouten({ werkstatt: join(tmp, 'nichts'), port: 8796, starten: () => { gestartet += 1 } })
  r = await rufe(leer['/promptheus-cinema/starten'], 'POST', 'same-origin')
  pruefe(r.code === 404 && JSON.parse(r.rumpf).fehler === 'nicht-eingerichtet', '4: fehlendes Studio wird nicht gemeldet')

  // ── 5. Erkennung am Server-Kopf ─────────────────────────────────────────────
  for (const [kopf, erwartet] of [['Multi-LLM Python/3.14.0', true], ['nginx', false]]) {
    const srv = createServer((_q, a) => { a.writeHead(200, { server: kopf }); a.end('ok') })
    await new Promise(f => srv.listen(0, '127.0.0.1', f))
    const ja = await lib.cinemaRouten({ werkstatt, port: srv.address().port, starten: () => {} })
    const w = await rufe(ja['/promptheus-cinema/stand'], 'GET', 'same-origin')
    pruefe((JSON.parse(w.rumpf).stand === 'laeuft') === erwartet, `5: Server-Kopf „${kopf}“ falsch erkannt`)
    await new Promise(f => srv.close(f))
  }
} finally {
  rmSync(tmp, { recursive: true, force: true })
}

console.log('cinema_pruefen: PROMPTHEUS Werkstatt → Cinema Studio')
if (fehler.length === 0) {
  console.log('  ✓ Ordnersuche, Ticket, Umgebung, Wege, Erkennung')
  console.log('cinema_pruefen: BESTANDEN')
} else {
  for (const f of fehler) console.log(`  ✗ ${f}`)
  console.log(`cinema_pruefen: ${fehler.length} BEANSTANDUNG(EN)`)
  process.exitCode = 1
}
