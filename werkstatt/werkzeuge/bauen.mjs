/**
 * PROMPTHEUS Werkstatt — Bauweg.
 *
 * Baut die eigenen Pakete und legt sie so ab, dass der Harness sie findet.
 *
 * Warum ein eigener Bauweg und nicht `pnpm run build` des Harness:
 * Der Bau-Preset des Harness (`packages/client/tsdown.client.ts`) löst jedes
 * Paket über den Workspace des Repos auf — `workspaceManifest()` sucht in
 * `packages/*​/*​/package.json` und wirft, wenn der Name dort nicht steht. Ein
 * Paket außerhalb des Repos wird von ihm nicht gefunden. Deshalb bündelt dieser
 * Bauweg mit esbuild, das im Harness ohnehin vorhanden ist.
 *
 * Was der Harness von einem Client-Paket verlangt (siehe Plan §6.8):
 *   1. eine Zeile in der Komposition (cordis.patch.yml des Profils),
 *   2. `dsh.client.platform === 'web'` in der package.json,
 *   3. `exports['./client']` zeigt auf ein gebautes Bündel,
 *   4. dieses Bündel existiert und hat die Trägerform:
 *        window.__ModuleLoader__.load({ id, factory: (require) => { … return module.exports; } });
 *
 * Aufruf:  node bauen.mjs
 */

import { spawnSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Wurzel dieses Werkzeugs (…/werkstatt). */
const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/**
 * Wo die Harness-Installation liegt.
 *
 * Seit dem 29.09.2026 liegt der Harness **in der Werkstatt** — als eigene,
 * vollständige Fassung, die unabhängig läuft. Der frühere Ort
 * (`…\scripts\deepseek-harness`) ist der laufende Betrieb auf Port 3080; er
 * wird von hier aus **nicht** angefasst.
 */
const HARNESS = join(WURZEL, 'deepseek-harness')

/**
 * Das eigene Zuhause der Werkstatt.
 *
 * **Muss mit `starten.mjs` übereinstimmen.** Der Harness legt den flachen
 * Modulrückfall unter `$DSH_HOME/profiles/node_modules` an — dort muss JE
 * Paket ein Verweis stehen, sonst findet die Komposition das eigene Paket nicht
 * („Cannot find package '@promptheus/…'").
 *
 * Zuvor lag der Verweis im globalen `C:\Users\PC\.dsh`. Das war doppelt falsch:
 * die Werkstatt hätte ihn nie gefunden, und beide Fassungen hätten sich
 * gegenseitig die Verweise umgeschrieben.
 */
const ZUHAUSE = join(WURZEL, '.dsh')

/** Wo die Profil-Ablage liegt (der flache Modulrückfall). */
const PROFIL_MODULE = join(ZUHAUSE, 'profiles', 'node_modules')

/** Die Pakete, die dieser Bauweg baut — Reihenfolge ist die Baufolge. */
const PAKETE = ['dsh-client-ui-promptheus']

/**
 * Sucht esbuild so, wie es im Harness installiert ist.
 *
 * Der Harness legt seine Abhängigkeiten unter `node_modules/.pnpm` ab. Der
 * genaue Ordnername trägt eine lange Kennung, deshalb wird gesucht statt
 * geraten.
 * @returns der Pfad zum esbuild-Einstieg.
 */
function esbuildFinden() {
  const store = join(HARNESS, 'node_modules', '.pnpm')
  const { readdirSync } = require('node:fs')
  const treffer = readdirSync(store).filter(n => n.startsWith('esbuild@')).sort()
  if (treffer.length === 0) {
    throw new Error(`bauen: kein esbuild unter ${store} gefunden — ist der Harness installiert?`)
  }
  // Die jüngste Fassung nehmen.
  const gewaehlt = treffer[treffer.length - 1]
  return join(store, gewaehlt, 'node_modules', 'esbuild', 'lib', 'main.js')
}

/**
 * Baut ein Paket: Node-Hälfte und Client-Hälfte.
 *
 * Die Node-Hälfte ist einfaches ES-Modul (der Harness lädt sie über Node).
 * Die Client-Hälfte wird in die Trägerform gewickelt, die die Modultabelle des
 * Browsers erwartet.
 * @param esbuild - das geladene esbuild-Modul.
 * @param name - der Ordnername des Pakets.
 */
async function paketBauen(esbuild, name) {
  const paketDir = join(WURZEL, 'pakete', name)
  const manifest = JSON.parse(readFileSync(join(paketDir, 'package.json'), 'utf8'))
  const id = manifest.name
  const libDir = join(paketDir, 'lib')
  mkdirSync(libDir, { recursive: true })

  // ── Node-Hälfte ────────────────────────────────────────────────────────────
  await esbuild.build({
    entryPoints: [join(paketDir, 'src', 'index.ts')],
    outfile: join(libDir, 'index.js'),
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'es2024',
    sourcemap: false,
    logLevel: 'warning',
  })

  // ── Client-Hälfte ──────────────────────────────────────────────────────────
  const clientErgebnis = await esbuild.build({
    entryPoints: [join(paketDir, 'src', 'client', 'index.ts')],
    bundle: true,
    write: false,
    format: 'cjs',
    platform: 'browser',
    target: 'es2024',
    sourcemap: false,
    logLevel: 'warning',
    // Alles, was die Modultabelle des Browsers beisteuert, bleibt ein require.
    // Sonst entstünde eine zweite React-Ausgabe, und die Haken des Harness
    // hätten eine andere Kennung als die Bausteine — die Seite bräche.
    external: [
      'react',
      'react/jsx-runtime',
      'react-dom',
      'react-dom/client',
      '@deepseek-ai/cordis',
      '@deepseek-ai/dsh-client-ui-slots',
      '@deepseek-ai/dsh-client-ui-primitives',
    ],
  })

  const rumpf = clientErgebnis.outputFiles[0].text
  // Die Trägerform. Die drei Kopfzeilen sind NICHT optional: esbuild erzeugt
  // für die CJS-Form Rumpf, der `module.exports` und `exports` benutzt, aber
  // keine der beiden Größen selbst anlegt — die Modultabelle des Browsers
  // reicht nur `require` hinein. Ohne diese Zeilen bricht die Oberfläche beim
  // Laden mit „module is not defined" ab. Der Harness-Preset setzt genau
  // dieselben Zeilen (packages/client/tsdown.client.ts, `intro`).
  const client = [
    `window.__ModuleLoader__.load({`,
    `\tid: ${JSON.stringify(id)},`,
    `\tfactory: (require) => {`,
    `\t\tvar module = { exports: {} };`,
    `\t\tvar exports = module.exports;`,
    `\t\tObject.defineProperty(exports, Symbol.toStringTag, { value: "Module" });`,
    rumpf,
    `\treturn module.exports; } });`,
    '',
  ].join('\n')
  writeFileSync(join(libDir, 'client.js'), client)

  return { id, paketDir, libDir }
}

/** Legt je Paket einen Verweis in der Profil-Ablage an, damit der Harness es findet. */
async function verweisen(id, paketDir) {
  const { mkdirSync: mk, rmSync, symlinkSync, lstatSync } = await import('node:fs')
  const ziel = join(PROFIL_MODULE, id)
  mk(PROFIL_MODULE, { recursive: true })
  try {
    const stat = lstatSync(ziel)
    if (stat.isSymbolicLink()) rmSync(ziel, { force: true })
    else throw new Error(`verweisen: ${ziel} ist kein Verweis — bitte von Hand entfernen`)
  } catch (fehler) {
    if (fehler.code !== 'ENOENT') throw fehler
  }
  symlinkSync(paketDir, ziel, 'junction')
  return ziel
}

/** Baut alle Pakete und legt die Verweise an. */
async function main() {
  const { createRequire } = await import('node:module')
  globalThis.require = createRequire(join(HARNESS, 'package.json'))
  const esbuild = globalThis.require(esbuildFinden())

  console.log(`bauen: Harness      ${HARNESS}`)
  console.log(`bauen: Profil-Ablage ${PROFIL_MODULE}`)
  console.log('')

  for (const name of PAKETE) {
    const { id } = await paketBauen(esbuild, name)
    const ziel = await verweisen(id, join(WURZEL, 'pakete', name))
    const groesse = readFileSync(join(WURZEL, 'pakete', name, 'lib', 'client.js')).length
    console.log(`  ✓ ${id}`)
    console.log(`      Client-Bündel  ${groesse} Bytes`)
    console.log(`      Verweis        ${ziel}`)
  }

  // ── Der Browser-Titel ──────────────────────────────────────────────────────
  //
  // **Warum das hier steht und nicht im Paket.** Der Harness setzt den Tab-Titel
  // zur Laufzeit, aber die Grundlage dafür wird **beim Bau eingebacken**:
  // `packages/client/ui-layout/src/client/AppFrame.tsx:233` liest
  // `process.env.DSH_CLIENT_TITLE`, und `scripts/client-build-environment.ts`
  // ersetzt diesen Ausdruck beim Bau durch den Wert der Umgebungsvariable
  // (`clientBuildEnvironmentDefines`). Ein Wert im ausgelieferten Bündel ist
  // nicht mehr änderbar — er muss beim Bau gesetzt werden.
  //
  // **Beide Stufen sind nötig.** Der Produktname steht in den Client-Bündeln
  // (`build:lib`), die Seite selbst in `apps/web/dist` (`build:web`). Wer nur
  // eine Stufe baut, bekommt entweder den alten Titel im Tab oder eine
  // `index.html`, die ihn nicht kennt.
  //
  // Das geschieht hier, im eigenen Bauwerkzeug: zwei Zeilen, kein Eingriff in
  // den Harness-Quelltext.
  const titel = 'Werkstatt — Promptheus Academy'
  const pnpm = pnpmFinden()
  console.log('')
  console.log(`  Browser-Titel wird gesetzt: ${titel}`)
  const bauUmgebung = { ...process.env, DSH_CLIENT_TITLE: titel }
  for (const stufe of ['build:lib', 'build:web']) {
    // `shell: true` ist unter Windows nötig: Node kann eine `.cmd` nicht direkt
    // starten (EINVAL). Die Argumente sind fest und enthalten keine Eingabe von
    // aussen, deshalb ist die Shell hier unbedenklich.
    const gebaut = spawnSync(pnpm, ['run', stufe], {
      cwd: HARNESS,
      env: bauUmgebung,
      stdio: 'inherit',
      shell: true,
    })
    if (gebaut.error !== undefined) throw gebaut.error
    if (gebaut.status !== 0) throw new Error(`bauen: „pnpm run ${stufe}" ist mit ${String(gebaut.status)} gescheitert`)
  }
  console.log('  ✓ Titel gesetzt (in den Client-Bündeln und in apps/web/dist)')

  // Cinema Studio: Code aus pakete\cinema-studio an den festen Ort, an dem es
  // mit seiner .env und der Ablage läuft.
  const { cinemaSpiegeln, ZIEL } = await import('./cinema_spiegeln.mjs')
  console.log(`  ✓ Cinema Studio gespiegelt (${cinemaSpiegeln()} Teile nach ${ZIEL})`)

  console.log('')
  console.log('bauen: fertig. Starten mit:  node werkzeuge/starten.mjs')
}

/**
 * Findet den Aufruf von pnpm.
 *
 * `spawnSync` startet unter Windows keine `.ps1`, und ein blankes `pnpm` liegt
 * dort nicht im Suchpfad — der Aufruf scheitert dann mit Status `null`. Deshalb
 * wird die `.cmd`-Fassung genommen, die Windows ausführen kann.
 * @returns der ausführbare Pfad von pnpm.
 */
function pnpmFinden() {
  const { existsSync } = globalThis.require('node:fs')
  const kandidaten = process.platform === 'win32'
    ? [
      join(process.env.LOCALAPPDATA ?? '', 'pnpm', 'bin', 'pnpm.cmd'),
      join(process.env.APPDATA ?? '', 'npm', 'pnpm.cmd'),
      'pnpm.cmd',
    ]
    : ['pnpm']
  for (const kandidat of kandidaten) {
    if (kandidat.endsWith('.cmd') && existsSync(kandidat)) return kandidat
    if (!kandidat.includes('\\') && !kandidat.includes('/')) return kandidat
  }
  throw new Error('bauen: pnpm wurde nicht gefunden — ist es installiert und im Suchpfad?')
}

main().catch((fehler) => {
  console.error('bauen: FEHLER')
  console.error(fehler)
  process.exitCode = 1
})
