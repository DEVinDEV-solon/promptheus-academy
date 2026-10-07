/**
 * PROMPTHEUS Werkstatt — die Begrüssung oben („HEPHAISTOS meint…“) an- und
 * abschalten.
 *
 * Der Player ist ein eigenes Paket (`pakete/dsh-client-ui-audio`). Er hängt im
 * Profil an zwei Stellen:
 *   1. `dsh.profile.bundles` in `profiles/promptheus/package.json` — das Paket
 *      bringt seine Kompositionszeile selbst mit (`cordis.patch.yml` im Paket),
 *      die `cordis.patch.yml` des Profils bleibt unberührt,
 *   2. ein Verweis `profiles/promptheus/node_modules/@promptheus/
 *      dsh-client-ui-audio` auf das Paket, damit der Harness es findet.
 *
 * **Wer nicht will, bekommt sie nicht wieder.** `aus` legt im Zuhause die Datei
 * `begruessung-aus.txt` ab. `starten.mjs` gleicht bei jedem Start ab und hängt
 * den Player nur ein, solange diese Datei fehlt. Das Zuhause gehört nicht zum
 * Programm, ein Update der Academy lässt die Entscheidung also stehen.
 *
 * Hephaistos führt das auf Wunsch aus (Persona, Abschnitt „Die Begrüssung
 * oben“). Sichtbar wird es nach einem Neustart der Werkstatt.
 *
 * Aufruf:  node begruessung.mjs aus      entfernen und entfernt lassen
 *          node begruessung.mjs an       wieder einhängen
 *          node begruessung.mjs stand    nur anzeigen
 */

import { existsSync, lstatSync, mkdirSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Wurzel dieses Werkzeugs (…/werkstatt). */
const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/** Das Zuhause der Werkstatt — wie in `starten.mjs`. */
export const ZUHAUSE = join(WURZEL, '.dsh')

/** Der Paketname des Players. */
export const PAKET = '@promptheus/dsh-client-ui-audio'

/** Wo das Paket im Repo liegt. */
export const PAKET_ORDNER = join(WURZEL, 'pakete', 'dsh-client-ui-audio')

/** Die Merkdatei für „nicht mehr haben“. */
export const MERKER = 'begruessung-aus.txt'

const profilOrdner = zuhause => join(zuhause, 'profiles', 'promptheus')
const verweisPfad = zuhause => join(profilOrdner(zuhause), 'node_modules', ...PAKET.split('/'))

/**
 * Liest den Stand.
 * @returns {{profil:boolean, eingehaengt:boolean, abgewaehlt:boolean}}
 */
export function begruessungStand(zuhause = ZUHAUSE) {
  const datei = join(profilOrdner(zuhause), 'package.json')
  if (!existsSync(datei)) return { profil: false, eingehaengt: false, abgewaehlt: existsSync(join(zuhause, MERKER)) }
  const pkg = JSON.parse(readFileSync(datei, 'utf8').replace(/^﻿/, ''))
  const buendel = pkg?.dsh?.profile?.bundles
  return {
    profil: true,
    eingehaengt: Array.isArray(buendel) && buendel.includes(PAKET),
    abgewaehlt: existsSync(join(zuhause, MERKER)),
  }
}

/**
 * Schreibt die package.json des Profils — nur, wenn sich etwas ändert.
 * @param {(pkg:object)=>void} aendern
 * @returns {boolean} ob geschrieben wurde
 */
function profilAendern(zuhause, aendern) {
  const datei = join(profilOrdner(zuhause), 'package.json')
  const alt = readFileSync(datei, 'utf8').replace(/^﻿/, '')
  const pkg = JSON.parse(alt)
  aendern(pkg)
  const neu = `${JSON.stringify(pkg, null, 2)}\n`
  if (neu === alt) return false
  writeFileSync(datei, neu)
  return true
}

/**
 * Entfernt den Verweis, wenn er einer ist. Ein echter Ordner an dieser Stelle
 * wird nicht angefasst — er gehört nicht diesem Werkzeug.
 * @returns {boolean} ob entfernt wurde
 */
function verweisEntfernen(ziel) {
  let stat
  try { stat = lstatSync(ziel) } catch (fehler) {
    if (fehler.code === 'ENOENT') return false
    throw fehler
  }
  if (!stat.isSymbolicLink()) throw new Error(`${ziel} ist kein Verweis — bitte von Hand prüfen`)
  rmSync(ziel, { force: true })
  return true
}

/**
 * Hängt den Player ein.
 * @returns {string[]} was sich geändert hat
 */
export function einhaengen(zuhause = ZUHAUSE, paketOrdner = PAKET_ORDNER) {
  const geaendert = []
  const link = `link:${paketOrdner.replace(/\\/g, '/')}`
  const geschrieben = profilAendern(zuhause, (pkg) => {
    pkg.dsh ??= {}
    pkg.dsh.profile ??= {}
    const buendel = Array.isArray(pkg.dsh.profile.bundles) ? pkg.dsh.profile.bundles : []
    if (!buendel.includes(PAKET)) buendel.push(PAKET)
    pkg.dsh.profile.bundles = buendel
    pkg.dependencies ??= {}
    pkg.dependencies[PAKET] = link
  })
  if (geschrieben) geaendert.push('Begrüssung im Profil eingetragen')

  // Der Verweis: steht er schon richtig, bleibt er. Ein alter, der woanders
  // hinzeigt (etwa auf einen früheren Bauordner), wird ersetzt.
  const ziel = verweisPfad(zuhause)
  let richtig = false
  try { richtig = realpathSync(ziel) === realpathSync(paketOrdner) } catch { /* fehlt */ }
  if (!richtig) {
    verweisEntfernen(ziel)
    mkdirSync(dirname(ziel), { recursive: true })
    symlinkSync(paketOrdner, ziel, 'junction')
    geaendert.push('Verweis auf das Paket gelegt')
  }
  return geaendert
}

/**
 * Hängt den Player aus.
 * @returns {string[]} was sich geändert hat
 */
export function aushaengen(zuhause = ZUHAUSE) {
  const geaendert = []
  const geschrieben = profilAendern(zuhause, (pkg) => {
    const buendel = pkg?.dsh?.profile?.bundles
    if (Array.isArray(buendel)) pkg.dsh.profile.bundles = buendel.filter(b => b !== PAKET)
    if (pkg.dependencies && PAKET in pkg.dependencies) delete pkg.dependencies[PAKET]
  })
  if (geschrieben) geaendert.push('Begrüssung aus dem Profil genommen')
  if (verweisEntfernen(verweisPfad(zuhause))) geaendert.push('Verweis auf das Paket entfernt')
  return geaendert
}

/**
 * Der Abgleich vor jedem Start: ein, solange niemand „aus“ gesagt hat.
 * Ohne Profil (noch nicht eingerichtet) geschieht nichts.
 * @returns {{geaendert:string[], fehler:string[]}}
 */
export function begruessungAbgleichen(zuhause = ZUHAUSE, paketOrdner = PAKET_ORDNER) {
  try {
    const stand = begruessungStand(zuhause)
    if (!stand.profil) return { geaendert: [], fehler: [] }
    if (stand.abgewaehlt) return { geaendert: aushaengen(zuhause), fehler: [] }
    if (!existsSync(join(paketOrdner, 'package.json'))) {
      return { geaendert: [], fehler: [`Begrüssung: Paket fehlt (${paketOrdner})`] }
    }
    return { geaendert: einhaengen(zuhause, paketOrdner), fehler: [] }
  } catch (fehler) {
    // Ein Fehler hier soll den Start nicht verhindern — die Werkstatt läuft
    // auch ohne Begrüssung.
    return { geaendert: [], fehler: [`Begrüssung: ${fehler.message}`] }
  }
}

/** `aus`: merken und aushängen. */
export function begruessungAus(zuhause = ZUHAUSE) {
  const geaendert = []
  const merker = join(zuhause, MERKER)
  if (!existsSync(merker)) {
    mkdirSync(zuhause, { recursive: true })
    writeFileSync(merker,
      'Die Begrüssung oben in der Werkstatt ist abgewählt.\n' +
      'Wieder einschalten: node werkzeuge\\begruessung.mjs an\n')
    geaendert.push('Abwahl gemerkt')
  }
  if (begruessungStand(zuhause).profil) geaendert.push(...aushaengen(zuhause))
  return geaendert
}

/** `an`: Abwahl vergessen und einhängen. */
export function begruessungAn(zuhause = ZUHAUSE, paketOrdner = PAKET_ORDNER) {
  const geaendert = []
  if (existsSync(join(zuhause, MERKER))) {
    rmSync(join(zuhause, MERKER), { force: true })
    geaendert.push('Abwahl aufgehoben')
  }
  if (begruessungStand(zuhause).profil) geaendert.push(...einhaengen(zuhause, paketOrdner))
  return geaendert
}

// ── Aufruf von der Kommandozeile ─────────────────────────────────────────────
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const was = process.argv[2] ?? 'stand'
  if (!['an', 'aus', 'stand'].includes(was)) {
    console.error('Aufruf: node begruessung.mjs an | aus | stand')
    process.exit(2)
  }
  try {
    const geaendert = was === 'an' ? begruessungAn() : was === 'aus' ? begruessungAus() : []
    for (const z of geaendert) console.log(`begruessung: ${z}`)
    const s = begruessungStand()
    if (!s.profil) console.log('begruessung: Die Werkstatt ist noch nicht eingerichtet.')
    console.log(`begruessung: Die Begrüssung oben ist ${s.abgewaehlt ? 'AUS' : 'AN'}` +
      `${s.profil && s.eingehaengt === s.abgewaehlt ? ' (gilt ab dem nächsten Start)' : ''}.`)
    if (was !== 'stand' && geaendert.length > 0) {
      console.log('begruessung: Sichtbar nach einem Neustart der Werkstatt (Academy › Werkstatt › Neu starten).')
    }
  } catch (fehler) {
    console.error(`begruessung: ${fehler.message}`)
    process.exit(1)
  }
}
