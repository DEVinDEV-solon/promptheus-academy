/**
 * Vollständiger Schlüssel-Auszug für die noch offenen Namensräume.
 *
 * **Warum das nötig wurde.** Die Wörterbücher des Harness sind nicht immer eine
 * Datei je Namensraum. Drei Fälle sind aufgetreten:
 *
 *   1. **Zwei Dateien je Namensraum** — `ui-agent-preset` hat `locales.ts` und
 *      `guide-locales.ts`; `ui-schedule` hat `locales.ts`, `frequency-locales.ts`
 *      und `task-manager-locales.ts`.
 *   2. **Verweise auf Konstanten** — `...frequencyZh`, `...PRODUCT_NAMES`,
 *      `...onboardingCopy`. Die Zeile nennt nur den Namen; die Schlüssel stehen
 *      woanders.
 *   3. **Mehrere Schlüssel je Zeile** — `record: '…', 'record-help': '…',`.
 *
 * Dieses Werkzeug löst alle drei Fälle auf und schreibt je Namensraum eine
 * Datei mit **allen** Schlüsseln und ihren chinesischen Werten. Damit lässt sich
 * vollständig übersetzen, ohne einen Schlüssel zu übersehen.
 *
 * Aufruf:  node werkzeuge\alle_schluessel.mjs
 */
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const CLIENT = join(WURZEL, 'deepseek-harness', 'packages', 'client')
const AUSGABE = join(WURZEL, '.schluessel')

/** Die offenen Pakete in der Reihenfolge, in der sie übersetzt werden. */
const PAKETE = [
  'ui-sidebar-documentpreview', 'ui-agent-preset', 'ui-message-feedback',
  'ui-settings-web-search', 'ui-workflow-run', 'ui-plan', 'ui-sidebar-files',
  'ui-schedule', 'ui-open-in-app', 'ui-settings-shell', 'ui-sidebar-terminal',
  'ui-goal', 'ui-settings-agent-loop', 'ui-reference', 'ui-input-trigger',
  'ui-theme', 'ui-skill', 'ui-approval', 'ui-settings-plugins', 'ui-settings-session-log',
]

/**
 * Ein Objekt `export const <name> = { … }` ausschneiden und seine Einträge lesen.
 *
 * Folgt zusätzlich Verweisen der Form `...andereKonstante`: deren Einträge
 * werden aus derselben oder einer anderen Datei nachgeladen und an der Stelle
 * eingefügt.
 * @param datei - der Pfad der Datei.
 * @param name - der Name des Objekts.
 * @returns die Einträge als Paare (Schlüssel, chinesischer Wert).
 */
function eintraege(datei, name, tiefe = 0) {
  if (tiefe > 3) return []
  let quelle
  try { quelle = readFileSync(datei, 'utf8') } catch { return [] }

  const zeilen = quelle.split('\n')
  let ab = -1
  for (let i = 0; i < zeilen.length; i += 1) {
    const m = zeilen[i].match(new RegExp(`^export const\\s+${name}\\s*[:=]`))
    if (m === null) continue
    for (let j = i; j < Math.min(i + 4, zeilen.length); j += 1) {
      const k = zeilen[j].indexOf('{', j === i ? m[0].length : 0)
      if (k !== -1) { ab = zeilen.slice(0, j).join('\n').length + (j > 0 ? 1 : 0) + k + 1; break }
    }
    if (ab !== -1) break
  }
  if (ab === -1) return []
  let t = 1, i = ab
  while (i < quelle.length && t > 0) { if (quelle[i] === '{') t++; else if (quelle[i] === '}') t--; i++ }
  const block = quelle.slice(ab, i - 1)

  const ergebnis = []
  // Zeichenweise lesen: Zeichenketten und verschachtelte Objekte überspringen.
  let inString = false, anf = '', schluessel = null, start = -1, tiefe2 = 0
  const push = (ende) => {
    if (schluessel === null) return
    const wert = block.slice(start, ende).trim().replace(/,$/, '').trim()
    ergebnis.push([schluessel, wert])
    schluessel = null
  }
  for (let k = 0; k < block.length; k += 1) {
    const c = block[k]
    if (inString) {
      if (c === '\\') { k += 1; continue }
      if (c === anf) inString = false
      continue
    }
    if (c === "'" || c === '"' || c === '`') { if (schluessel !== null) start = start === -1 ? k : start; inString = true; anf = c; continue }
    if (c === '{' || c === '[') { tiefe2 += 1; continue }
    if (c === '}' || c === ']') { tiefe2 -= 1; if (tiefe2 < 0) break; continue }
    if (tiefe2 > 0) continue

    if (c === ',' || c === '\n') {
      const teil = block.slice(start === -1 ? 0 : start, k)
      if (schluessel !== null) push(k)
      start = -1
      // Neuen Schlüssel erkennen: alles vor dem Doppelpunkt im Segment.
      continue
    }
  }

  // Zweiter, einfacherer Durchgang: je Segment lesen.
  const segmente = []
  {
    let s = 0, is = false, a2 = '', d = 0
    for (let k = 0; k < block.length; k += 1) {
      const c = block[k]
      if (is) { if (c === '\\') { k++; continue } if (c === a2) is = false; continue }
      if (c === "'" || c === '"' || c === '`') { is = true; a2 = c; continue }
      if (c === '{' || c === '[') { d++; continue }
      if (c === '}' || c === ']') { d--; continue }
      if (d === 0 && (c === ',' || c === '\n')) { segmente.push(block.slice(s, k)); s = k + 1 }
    }
    segmente.push(block.slice(s))
  }

  const aus2 = []
  for (const seg of segmente) {
    const t = seg.trim()
    if (t === '') continue
    // Verweis auf eine andere Konstante: `...name`
    if (t.startsWith('...')) {
      const ref = (t.match(/^\.\.\.([A-Za-z_][A-Za-z0-9_]*)/) ?? [])[1]
      if (ref !== undefined) {
        // In welcher Datei steht sie? Erst hier, dann in den Nachbardateien.
        for (const kandidat of [datei, ...nachbarn(datei)]) {
          const e = eintraege(kandidat, ref, tiefe + 1)
          if (e.length > 0) { aus2.push(...e); break }
        }
      }
      continue
    }
    const i2 = t.indexOf(':')
    if (i2 === -1) continue
    let name2 = t.slice(0, i2).trim()
    const nl = name2.split('\n')
    name2 = nl[nl.length - 1].trim()
    if (name2.startsWith('//') || name2.startsWith('*')) continue
    if ((name2.startsWith("'") && name2.endsWith("'")) || (name2.startsWith('"') && name2.endsWith('"'))) name2 = name2.slice(1, -1)
    if (!/^[A-Za-z][A-Za-z0-9_.-]*$/.test(name2)) continue
    let wert = t.slice(i2 + 1).trim()
    // Mehrzeilige Werte zusammenziehen.
    wert = wert.split('\n').map(x => x.trim()).filter(x => x !== '').join(' ')
    aus2.push([name2, wert])
  }
  return aus2
}

/** Die anderen `.ts`-Dateien im Ordner einer Datei. */
function nachbarn(datei) {
  const ordner = dirname(datei)
  const treffer = []
  for (const e of readdirSync(ordner)) {
    if (!e.endsWith('.ts')) continue
    const p = join(ordner, e)
    if (p === datei || !statSync(p).isFile()) continue
    treffer.push(p)
  }
  return treffer
}

/** Den Namensraum eines Pakets ermitteln. */
function namensraum(pkg) {
  for (const kandidat of [
    join(CLIENT, pkg, 'src', 'client', 'locales.ts'),
    join(CLIENT, pkg, 'src', 'client', 'index.ts'),
  ]) {
    try {
      const m = readFileSync(kandidat, 'utf8').match(/export const NS = '([^']+)'/)
      if (m !== null) return m[1]
    } catch { /* fehlt */ }
  }
  return pkg.replace(/^ui-/, '')
}

mkdirSync(AUSGABE, { recursive: true })

/** Welche Objekte gehören zu einem Paket? */
function objekteVon(pkg) {
  const ordner = join(CLIENT, pkg, 'src', 'client')
  const gefunden = []
  let dateien
  try { dateien = readdirSync(ordner) } catch { return gefunden }
  for (const e of dateien) {
    if (!e.endsWith('.ts')) continue
    const p = join(ordner, e)
    let q
    try { q = readFileSync(p, 'utf8') } catch { continue }
    for (const m of q.matchAll(/export const\s+([A-Za-z][A-Za-z0-9_]*)\s*[:=]/g)) {
      if (m[1] === 'zh' || /Zh$/.test(m[1])) gefunden.push({ datei: p, objekt: m[1], kurz: e })
    }
  }
  return gefunden
}

let gesamt = 0
console.log('alle_schluessel: vollständiger Auszug')
console.log('')
for (const pkg of PAKETE) {
  const ns = namensraum(pkg)
  const objekte = objekteVon(pkg)
  const zeilen = [`# ${pkg}   ·   Namensraum: ${ns}`, '']
  let n = 0
  for (const o of objekte) {
    const e = eintraege(o.datei, o.objekt)
    if (e.length === 0) continue
    zeilen.push(`## ${o.kurz}  [${o.objekt}]  ${e.length} Schlüssel`, '')
    for (const [k, v] of e) { zeilen.push(`  ${JSON.stringify(k)}: ${v}`); n += 1 }
    zeilen.push('')
  }
  writeFileSync(join(AUSGABE, `${pkg}.txt`), zeilen.join('\n'), 'utf8')
  gesamt += n
  console.log(`  ${pkg.padEnd(34)} ${ns.padEnd(24)} ${String(n).padStart(4)} Texte  -> ${pkg}.txt`)
}
console.log('')
console.log(`  GESAMT: ${gesamt} Texte in ${PAKETE.length} Paketen`)
