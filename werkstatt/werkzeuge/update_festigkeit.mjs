/**
 * PROMPTHEUS Werkstatt — Prüfung: überstehen unsere Anpassungen ein Update?
 *
 * **Die Anforderung, die dieses Werkzeug prüft:** Alle Anpassungen müssen
 * DeepSeek-Updates in Zukunft überstehen. Ein Update ist ein `git pull` im
 * Harness-Ordner, gefolgt von `pnpm install` und einem Neubau.
 *
 * Geprüft wird deshalb für **jede** Anpassung, wo sie liegt und was ein Update
 * mit ihr macht:
 *
 *   1. Liegt sie außerhalb des Harness? Dann kann `git pull` sie nicht berühren.
 *   2. Liegt sie im Harness, aber in einer von Git **ignorierten** Datei
 *      (gebautes `lib/`, `dist/`)? Dann rührt `git pull` sie nicht an, aber ein
 *      Neubau überschreibt sie — sie muss also neu gesetzt werden.
 *   3. Liegt sie im Harness **unter Versionskontrolle**? Dann ist sie in
 *      Gefahr und muss als Patch geführt werden. **Das ist der Fall, der
 *      gemeldet werden muss.**
 *
 * Aufruf:  node werkzeuge\update_festigkeit.mjs
 */

import { existsSync, readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Wurzel dieses Werkzeugs (…/werkstatt). */
const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const HARNESS = join(WURZEL, 'deepseek-harness')

/**
 * Unsere Anpassungen, je mit Ort und Erwartung.
 *
 * `erwartung` ist der Vertrag: „ausserhalb" heißt, die Datei liegt nicht im
 * Harness; „gebaut" heißt, sie liegt im Harness, aber Git ignoriert sie.
 */
const ANPASSUNGEN = [
  {
    was: 'Sprachpaket, Marke, Palette (395 deutsche Texte)',
    ort: 'pakete/dsh-client-ui-promptheus/src/**',
    pfad: join(WURZEL, 'pakete', 'dsh-client-ui-promptheus', 'src', 'client', 'woerter.ts'),
    erwartung: 'ausserhalb',
  },
  {
    was: 'Node-Hälfte: Browser-Titel und Favicon',
    ort: 'pakete/dsh-client-ui-promptheus/src/index.ts',
    pfad: join(WURZEL, 'pakete', 'dsh-client-ui-promptheus', 'src', 'index.ts'),
    erwartung: 'ausserhalb',
  },
  {
    was: 'Profil (eigene Kompositionsschicht)',
    ort: '.dsh/profiles/promptheus/cordis.patch.yml',
    pfad: join(WURZEL, '.dsh', 'profiles', 'promptheus', 'cordis.patch.yml'),
    erwartung: 'ausserhalb',
  },
  {
    was: 'Deutsche Zugriffsstufen (in der Profilschicht)',
    ort: '.dsh/profiles/promptheus/cordis.patch.yml',
    pfad: join(WURZEL, '.dsh', 'profiles', 'promptheus', 'cordis.patch.yml'),
    erwartung: 'ausserhalb',
    // Zusätzlich inhaltlich prüfen.
    enthaelt: ['Nur lesen', 'Workspace schreiben', 'Vollzugriff'],
  },
  {
    was: 'Das eigene Zuhause (Profil, Zugangsdaten, Sitzungen)',
    ort: '.dsh/',
    pfad: join(WURZEL, '.dsh', 'settings.yaml.imported'),
    erwartung: 'ausserhalb',
  },
  {
    was: 'Browser-Titel (im gebauten Bündel)',
    ort: 'deepseek-harness/packages/client/ui-layout/lib/client.js',
    pfad: join(HARNESS, 'packages', 'client', 'ui-layout', 'lib', 'client.js'),
    erwartung: 'gebaut',
    enthaelt: ['Werkstatt — Promptheus Academy'],
  },
  {
    was: 'Titel in der ausgelieferten Seite',
    ort: 'deepseek-harness/apps/web/dist/index.html',
    pfad: join(HARNESS, 'apps', 'web', 'dist', 'index.html'),
    erwartung: 'gebaut',
    enthaelt: ['Werkstatt — Promptheus Academy'],
  },
]

/** Fragt Git, ob eine Datei unter Versionskontrolle steht. */
function gitKennt(pfad) {
  if (!existsSync(join(HARNESS, '.git'))) return undefined
  const relativ = pfad.replace(/\\/g, '/').replace(HARNESS.replace(/\\/g, '/') + '/', '')
  const r = spawnSync('git', ['ls-files', '--error-unmatch', '--', relativ], {
    cwd: HARNESS, encoding: 'utf8', shell: true,
  })
  return r.status === 0
}

/** Fragt Git, ob eine Datei ignoriert wird. */
function gitIgnoriert(pfad) {
  const relativ = pfad.replace(/\\/g, '/').replace(HARNESS.replace(/\\/g, '/') + '/', '')
  const r = spawnSync('git', ['check-ignore', '--', relativ], { cwd: HARNESS, encoding: 'utf8', shell: true })
  return r.status === 0
}

/** Prüft alle Anpassungen und berichtet. */
function main() {
  console.log('update_festigkeit: Überstehen die Anpassungen ein DeepSeek-Update?')
  console.log('')
  console.log('  Ein Update ist: git pull  ->  pnpm install  ->  Neubau')
  console.log('')

  let gefaehrdet = 0
  let fehlend = 0
  let gebaut = 0

  for (const a of ANPASSUNGEN) {
    const da = existsSync(a.pfad)
    const imHarness = a.pfad.startsWith(HARNESS)

    let lage
    if (!da) {
      lage = 'FEHLT'
      fehlend += 1
    } else if (!imHarness) {
      lage = 'SICHER (außerhalb des Harness)'
    } else if (gitIgnoriert(a.pfad)) {
      lage = 'SICHER vor git pull — aber Neubau nötig'
      gebaut += 1
    } else if (gitKennt(a.pfad) === true) {
      lage = 'GEFAHR: unter Versionskontrolle'
      gefaehrdet += 1
    } else {
      lage = 'unklar'
    }

    // Inhaltliche Prüfung, wo erwartet.
    let inhalt = ''
    if (da && a.enthaelt !== undefined) {
      const text = readFileSync(a.pfad, 'utf8')
      const fehlendInhalt = a.enthaelt.filter(s => !text.includes(s))
      inhalt = fehlendInhalt.length === 0
        ? ' · Inhalt vollständig'
        : ` · INHALT FEHLT: ${fehlendInhalt.join(', ')}`
      if (fehlendInhalt.length > 0) gefaehrdet += 1
    }

    const zeichen = lage.startsWith('SICHER') ? '✓' : lage === 'FEHLT' ? '!' : '✗'
    console.log(`  ${zeichen} ${a.was}`)
    console.log(`      Ort:  ${a.ort}`)
    console.log(`      Lage: ${lage}${inhalt}`)
    console.log('')
  }

  console.log('  ────────────────────────────────────────────────────────────')
  console.log(`  außerhalb des Harness (git pull berührt sie nie) : unberührt`)
  console.log(`  im Harness, von Git ignoriert (Neubau nötig)     : ${gebaut}`)
  console.log(`  gefährdet (unter Versionskontrolle)              : ${gefaehrdet}`)
  console.log(`  fehlend                                          : ${fehlend}`)
  console.log('')

  if (gefaehrdet > 0 || fehlend > 0) {
    console.log('update_festigkeit: NICHT BESTANDEN')
    console.log('')
    console.log('  Was zu tun ist:')
    if (fehlend > 0) console.log('    * Fehlende Anpassungen neu anbringen (node werkzeuge\\bauen.mjs).')
    if (gefaehrdet > 0) console.log('    * Gefährdete Anpassungen als Patch führen und nach jedem Update neu setzen.')
    process.exitCode = 1
    return
  }

  console.log('update_festigkeit: BESTANDEN')
  console.log('')
  console.log('  Nach einem Update genügt:')
  console.log('    1. cd deepseek-harness && git pull && pnpm install')
  console.log('    2. node werkzeuge\\bauen.mjs      (setzt Titel neu, baut unser Paket)')
  console.log('    3. node werkzeuge\\update_festigkeit.mjs   (diese Prüfung)')
}

main()
