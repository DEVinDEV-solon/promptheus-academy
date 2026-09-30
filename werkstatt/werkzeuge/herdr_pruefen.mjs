/**
 * PROMPTHEUS Werkstatt — Prüfung: läuft `herdr` in einem PTY?
 *
 * Der Werkstatt-Terminal des Harness startet seine Sitzung über `node-pty`
 * (echtes PTY, unter Windows ConPTY). `herdr` ist ein vollflächiges
 * Terminal-Programm und verlangt genau das. Diese Prüfung startet `herdr` in
 * einem PTY und sieht nach, ob es hochkommt.
 *
 * **Wozu das gut ist.** Am 29.09.2026 ließ sich `herdr` weder im Terminal noch
 * in einer gewöhnlichen Eingabeaufforderung aufrufen:
 *
 *     PS C:\Users\PC> herdr
 *     herdr: Zugriff verweigert (os error 5)
 *
 * Die Ursache war **kein** Fehler der Werkstatt und auch kein Rechteproblem:
 * ein `herdr`-Serverprozess aus einer früheren Sitzung lief noch, nahm aber
 * keine Verbindungen mehr an — auch `herdr server stop` und `taskkill /F`
 * kamen nicht mehr durch. Erst das Beenden über WMI (`Invoke-CimMethod
 * Terminate`) löste den hängenden Prozess; danach lief `herdr` wieder.
 *
 * Diese Prüfung sagt in einem Satz, welcher der beiden Fälle vorliegt:
 * „läuft im PTY" oder „beendet sich sofort".
 *
 * Aufruf:  node werkzeuge\herdr_pruefen.mjs
 */

import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Wurzel dieses Werkzeugs (…/werkstatt). */
const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const HARNESS = join(WURZEL, 'deepseek-harness')

/** Wie lange auf eine Ausgabe gewartet wird. */
const WARTEZEIT_MS = 8000

/**
 * Findet die ausführbare Datei von `herdr`.
 *
 * Der Suchpfad ist die erste Wahl. Weil `herdr` seine Fassung aber in den
 * Ordnernamen schreibt (`…\releases\0.9.1-x86_64-pc-windows-msvc\`), wäre der
 * Eintrag nach einer Aktualisierung ungültig. Deshalb wird zusätzlich unter
 * `~/.herdr` gesucht und die **jüngste** Fassung genommen.
 * @returns der volle Pfad zur ausführbaren Datei.
 */
function herdrFinden() {
  const { existsSync, readdirSync } = globalThis.require('node:fs')
  const { homedir } = globalThis.require('node:os')
  const name = process.platform === 'win32' ? 'herdr.exe' : 'herdr'

  // Windows-Umgebungsnamen sind groß/klein-unabhängig; `Path` ist die übliche
  // Schreibweise, `PATH` die von Node gesetzte.
  const suchpfad = process.env.Path ?? process.env.PATH ?? ''
  const ausPfad = suchpfad.split(';')
    .filter(p => p.toLowerCase().includes('herdr'))
    .map(p => join(p, name))
    .find(p => existsSync(p))
  if (ausPfad !== undefined) return ausPfad

  const freigaben = join(homedir(), '.herdr', 'packages', 'standalone', 'releases')
  if (existsSync(freigaben)) {
    for (const fassung of readdirSync(freigaben).sort().reverse()) {
      const kandidat = join(freigaben, fassung, name)
      if (existsSync(kandidat)) return kandidat
    }
  }
  throw new Error('herdr_pruefen: herdr wurde nicht gefunden — ist es installiert?')
}

/** Startet `herdr` in einem PTY und berichtet, was herauskommt. */
async function main() {
  globalThis.require = createRequire(join(HARNESS, 'package.json'))
  const require = globalThis.require
  // `node-pty` liegt im pnpm-Speicher, nicht im Wurzelverzeichnis: der Harness
  // erreicht es über eine Kette von Verweisen. Hier wird es direkt gesucht.
  const { readdirSync } = require('node:fs')
  const speicher = join(HARNESS, 'node_modules', '.pnpm')
  const treffer = readdirSync(speicher).filter(n => n.startsWith('node-pty@'))
  if (treffer.length === 0) throw new Error(`herdr_pruefen: node-pty nicht unter ${speicher} gefunden`)
  const pty = require(join(speicher, treffer[0], 'node_modules', 'node-pty'))

  console.log('herdr_pruefen: läuft herdr in einem PTY?')
  console.log('')

  const ausgabe = []
  let beendet = null

  // **Der volle Pfad ist nötig.** `node-pty` sucht die Datei selbst und geht
  // nicht über den Suchpfad der Shell; ein blankes `herdr` scheitert mit
  // „File not found". Deshalb wird die ausführbare Datei hier aufgelöst.
  const exe = herdrFinden()
  console.log(`  Programm: ${exe}`)
  console.log('')

  const sitzung = pty.spawn(exe, [], {
    name: 'xterm-256color',
    cols: 120,
    rows: 30,
    cwd: HARNESS,
    env: { ...process.env, TERM: 'xterm-256color' },
  })

  sitzung.onData((daten) => { ausgabe.push(daten) })
  sitzung.onExit(({ exitCode, signal }) => { beendet = { exitCode, signal } })

  await new Promise(fertig => setTimeout(fertig, WARTEZEIT_MS))

  const text = ausgabe.join('')
  console.log(`  Ausgabe in ${WARTEZEIT_MS / 1000} s: ${text.length} Zeichen`)
  console.log(`  Beendet: ${beendet === null ? 'nein — es läuft (gut)' : `ja, Code ${beendet.exitCode}`}`)
  console.log('')

  // Steuerzeichen entfernen, damit die Meldung lesbar wird.
  const klar = text
    .replace(/\u001b\[[0-9;?]*[a-zA-Z]/g, '')
    .replace(/\u001b\][^\u0007]*\u0007/g, '')
    .replace(/\u001b[()][0-9A-Za-z]/g, '')
    .trim()
  if (klar.length > 0) {
    console.log('  Sichtbarer Text:')
    console.log('  ' + klar.slice(0, 300).replace(/\n/g, '\n  '))
  } else {
    console.log('  (kein sichtbarer Text — das ist bei einem Vollbildprogramm normal)')
  }

  try { sitzung.kill() } catch { /* schon beendet */ }

  console.log('')
  const laeuft = beendet === null || beendet.exitCode === 0
  if (laeuft) {
    console.log('herdr_pruefen: herdr läuft im PTY')
  } else {
    console.log(`herdr_pruefen: herdr beendet sich sofort (Code ${String(beendet?.exitCode)})`)
    if (klar.includes('Zugriff verweigert') || klar.includes('PermissionDenied')) {
      console.log('')
      console.log('  Das ist der bekannte Fall: ein hängender herdr-Serverprozess')
      console.log('  nimmt keine Verbindungen mehr an. Abhilfe:')
      console.log('    1. hängenden Prozess beenden (taskkill hilft oft nicht):')
      console.log('       Get-CimInstance Win32_Process -Filter "Name like \'%herdr%\'" |')
      console.log('         ForEach-Object { Invoke-CimMethod -InputObject $_ -MethodName Terminate }')
      console.log('    2. Socket-Reste entfernen:')
      console.log('       Remove-Item "$env:APPDATA\\herdr\\*.sock" -Force')
      console.log('    3. diese Prüfung erneut laufen lassen')
    }
  }
  process.exitCode = laeuft ? 0 : 1
}

main().catch((fehler) => {
  console.error('herdr_pruefen: FEHLER')
  console.error(fehler)
  process.exitCode = 1
})
