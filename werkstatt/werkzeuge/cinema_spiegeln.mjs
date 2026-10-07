/**
 * Cinema Studio: Code aus dem Repo an den festen Ort spiegeln.
 *
 * Der Quelltext von Cinema Studio liegt versioniert in
 * `werkstatt\pakete\cinema-studio`. Laufen tut das Programm am festen Ort
 * `werkstatt\scripts\CINEMA-STUDIO` (in git ausgeschlossen), denn dort liegen
 * `.env`, `data\`, `zugang\` und die Ablage der erzeugten Medien.
 *
 * Dieses Werkzeug kopiert nur die Dateien und Ordner aus {@link TEILE} dorthin.
 * Laufzeitdaten fasst es nie an. `node werkzeuge/bauen.mjs` ruft es am Ende auf;
 * allein geht es mit `node werkzeuge/cinema_spiegeln.mjs`.
 */

import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/** Die Quelle im Repo. */
export const QUELLE = join(WURZEL, 'pakete', 'cinema-studio')

/** Der feste Ort, an dem Cinema Studio läuft. */
export const ZIEL = join(WURZEL, 'scripts', 'CINEMA-STUDIO')

/**
 * Was gespiegelt wird. Ordner werden am Ziel erst geleert und dann neu
 * kopiert, damit gelöschte Dateien nicht liegen bleiben. Nie in dieser Liste:
 * `.env`, `data`, `zugang`, `Ablage`, `prompts`, `skills`.
 */
export const TEILE = [
  'server.py', 'assistent.py', 'audio.py', 'klon.py', 'zugang.py',
  'CINEMA-STUDIO-START.bat', 'README.md', 'env.beispiel', 'logo64.jpg',
  '.gitignore', '.gitattributes',
  'lokal_stimme', 'web', 'tests', 'plan',
]

/** Ordner, die nie angefasst werden — eine zweite Sperre neben {@link TEILE}. */
const GESCHUETZT = new Set(['.env', 'data', 'zugang', 'Ablage', 'prompts', 'skills', '.claude'])

/**
 * Spiegelt den Code an den festen Ort.
 * @returns die Zahl der gespiegelten Teile.
 */
export function cinemaSpiegeln() {
  if (!existsSync(join(QUELLE, 'server.py'))) throw new Error(`cinema_spiegeln: keine Quelle in ${QUELLE}`)
  mkdirSync(ZIEL, { recursive: true })
  let zahl = 0
  for (const teil of TEILE) {
    if (GESCHUETZT.has(teil)) throw new Error(`cinema_spiegeln: ${teil} ist geschützt`)
    const von = join(QUELLE, teil)
    if (!existsSync(von)) continue
    const nach = join(ZIEL, teil)
    rmSync(nach, { recursive: true, force: true })
    cpSync(von, nach, { recursive: true, filter: pfad => !/[\\/]__pycache__([\\/]|$)/.test(pfad) })
    zahl++
  }
  return zahl
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const zahl = cinemaSpiegeln()
  console.log(`cinema_spiegeln: ${zahl} Teile nach ${ZIEL}`)
}
