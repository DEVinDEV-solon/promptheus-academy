/**
 * Erzeugt die Arbeitsliste: welche Namensräume fehlen noch?
 *
 * Liest aus jeder `index.ts` die **tatsächliche** Zeile `locale.register(…)` und
 * daraus den Namensraum — so wie der Harness ihn anmeldet. Damit kann die Liste
 * nicht vom echten Namen abweichen.
 *
 * Ausgabe: eine Zeile je Wörterbuch mit Datei, Objektname und Namensraum.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const HARNESS = join(WURZEL, 'deepseek-harness')
const CLIENT = join(HARNESS, 'packages', 'client')

/** Alle `locales.ts` unter `packages/client`. */
function dateienFinden(basis) {
  const treffer = []
  for (const e of readdirSync(basis)) {
    const p = join(basis, e)
    if (e === 'node_modules' || e === 'lib' || e === 'dist') continue
    if (statSync(p).isDirectory()) { treffer.push(...dateienFinden(p)); continue }
    if (e === 'locales.ts' && p.includes('src')) treffer.push(p)
  }
  return treffer
}

/** Die Schlüsselnamen eines Objekts zeilenweise lesen. */
function schluessel(quelle, name) {
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
  const namen = []
  for (const z of block.split('\n')) {
    const s = z.match(/^\s*'?([A-Za-z][A-Za-z0-9_.-]*)'?\s*:/)
    if (s !== null) namen.push(s[1])
  }
  return namen
}

/** Welche Namensräume meldet unser Paket schon auf Deutsch an? */
function unsere() {
  const roh = readFileSync(join(WURZEL, 'pakete', 'dsh-client-ui-promptheus', 'lib', 'client.js'), 'utf8')
  let e
  globalThis.window = { __ModuleLoader__: { load: (x) => { e = x } } }
  new Function('window', roh)(globalThis.window)
  const rumpf = e.factory(() => ({ createElement: () => ({}), useState: () => [null, () => {}], useEffect: () => {} }))
  const reg = new Set()
  rumpf.apply({
    slots: { inject: () => {}, register: () => () => {} },
    get: (n) => n === 'locale'
      ? { register: (ns, sp) => { if (sp === 'de') reg.add(ns); return () => {} } }
      : n === 'theme' ? { overrideTokens: () => () => {} } : undefined,
    effect: (cb) => { cb(); return () => {} },
  })
  return reg
}

/**
 * Die Namensräume, die ein Paket anmeldet — aus den `register`-Zeilen gelesen.
 *
 * Die Zeile nennt den Namensraum als Konstante (`NS`, `PERMISSION_ACCESS_NS`)
 * oder als Zeichenkette (`'settings.permission'`). Beides wird aufgelöst: die
 * Konstante wird in derselben Datei nachgeschlagen.
 * @param pkgVerzeichnis - der Ordner des Pakets.
 * @returns die gefundenen Namensräume.
 */
function namensraeume(pkgVerzeichnis) {
  const datei = join(pkgVerzeichnis, 'src', 'client', 'index.ts')
  let q
  try { q = readFileSync(datei, 'utf8') } catch { return [] }

  // Konstanten einsammeln: `const NS = 'job'`
  const konstanten = {}
  for (const m of q.matchAll(/const\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*'([^']+)'/g)) konstanten[m[1]] = m[2]

  const gefunden = new Set()
  for (const m of q.matchAll(/locale\.register\(\s*([A-Za-z_][A-Za-z0-9_]*|'[^']+')/g)) {
    const roh = m[1]
    if (roh.startsWith("'")) gefunden.add(roh.slice(1, -1))
    else if (konstanten[roh] !== undefined) gefunden.add(konstanten[roh])
  }
  return [...gefunden]
}

const haben = unsere()
const zeilen = []

for (const f of dateienFinden(CLIENT).sort()) {
  const pkg = f.replace(/\\/g, '/').split('/packages/client/')[1].split('/')[0]
  const pkgDir = join(CLIENT, pkg)
  const quelle = readFileSync(f, 'utf8')

  // Die Schlüsselobjekte der Datei (zh und …Zh).
  const objekte = []
  for (const m of quelle.matchAll(/export const\s+([A-Za-z][A-Za-z0-9_]*)\s*[:=]/g)) {
    if (m[1] === 'zh' || /Zh$/.test(m[1])) objekte.push(m[1])
  }

  const nsListe = namensraeume(pkgDir)
  for (const o of objekte) {
    const k = schluessel(quelle, o)
    if (k.length === 0) continue
    // Der Namensraum dieses Objekts: bei zwei Objekten in einer Datei (etwa
    // `zh` und `accessZh`) gehören sie zu den zwei angemeldeten Namensräumen in
    // Reihenfolge. Fehlt eine Zuordnung, bleibt der Paketname.
    const ns = nsListe[objekte.indexOf(o)] ?? nsListe[0] ?? pkg.replace(/^ui-/, '')
    zeilen.push({ pkg, objekt: o, ns, anzahl: k.length, datei: f, haben: haben.has(ns) })
  }
}

const offen = zeilen.filter(z => !z.haben).sort((a, b) => b.anzahl - a.anzahl)
const fertig = zeilen.filter(z => z.haben)

console.log('=== OFFEN ===')
let summe = 0
for (const z of offen) {
  summe += z.anzahl
  console.log(`  ${z.ns.padEnd(26)} ${String(z.anzahl).padStart(4)}   [${z.objekt}]  ${z.pkg}`)
}
console.log('')
console.log(`  OFFEN: ${summe} Texte in ${offen.length} Wörterbüchern`)
console.log(`  FERTIG: ${fertig.length} Wörterbücher`)
console.log('')
console.log('=== Die Dateien (für die Übersetzung) ===')
for (const z of offen) {
  console.log(`  ${z.datei.replace(/\\/g, '/').split('/packages/client/')[1]}  ->  ns=${z.ns} obj=${z.objekt} (${z.anzahl})`)
}
