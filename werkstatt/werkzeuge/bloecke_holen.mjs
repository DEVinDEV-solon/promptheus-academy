/**
 * Holt die chinesischen Wörterbuch-Blöcke der noch offenen Pakete in Dateien,
 * damit sie sich vollständig lesen und übersetzen lassen.
 *
 * Aufruf:  node werkzeuge\bloecke_holen.mjs uber-01 ui-jobs uber-02 ui-subagent …
 *          node werkzeuge\bloecke_holen.mjs            (alle offenen)
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const CLIENT = join(WURZEL, 'deepseek-harness', 'packages', 'client')
const AUSGABE = join(WURZEL, '.bloecke')

/** Die offenen Pakete mit Nummer, wie sie nacheinander drankommen. */
const REIHENFOLGE = [
  ['01-inventory', 'ui-settings-plugin-inventory'],
  ['02-jobs', 'ui-jobs'],
  ['03-subagent', 'ui-subagent'],
  ['04-setsubagent', 'ui-settings-subagent'],
  ['05-sidebarright', 'ui-sidebar-right'],
  ['06-shortcuts', 'ui-shortcuts'],
  ['07-question', 'ui-user-questions'],
  ['08-account', 'ui-settings-account'],
  ['09-command', 'ui-commands'],
  ['10-browser', 'ui-sidebar-browser'],
  ['11-docpreview', 'ui-sidebar-documentpreview'],
  ['12-agentpreset', 'ui-agent-preset'],
  ['13-feedback', 'ui-message-feedback'],
  ['14-websearch', 'ui-settings-web-search'],
  ['15-workflowrun', 'ui-workflow-run'],
  ['16-plan', 'ui-plan'],
  ['17-sidebarfiles', 'ui-sidebar-files'],
  ['18-schedule', 'ui-schedule'],
  ['19-openinapp', 'ui-open-in-app'],
  ['20-shell', 'ui-settings-shell'],
  ['21-terminal', 'ui-sidebar-terminal'],
  ['22-goal', 'ui-goal'],
  ['23-agentloop', 'ui-settings-agent-loop'],
  ['24-reference', 'ui-reference'],
  ['25-inputtrigger', 'ui-input-trigger'],
  ['26-theme', 'ui-theme'],
  ['27-skill', 'ui-skill'],
  ['28-approval', 'ui-approval'],
  ['29-plugins', 'ui-settings-plugins'],
  ['30-sessionlog', 'ui-settings-session-log'],
]

/** Ein Objekt `export const <name> = { … }` aus einer Datei schneiden. */
function block(quelle, name) {
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
  if (ab === -1) return undefined
  let t = 1, i = ab
  while (i < quelle.length && t > 0) { if (quelle[i] === '{') t++; else if (quelle[i] === '}') t--; i++ }
  return quelle.slice(ab, i - 1)
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
    } catch { /* Datei fehlt */ }
  }
  return pkg.replace(/^ui-/, '')
}

mkdirSync(AUSGABE, { recursive: true })

const args = process.argv.slice(2)
const auswahl = args.length > 0
  ? REIHENFOLGE.filter(([, pkg]) => args.includes(pkg) || args.includes(pkg.replace(/^ui-/, '')))
  : REIHENFOLGE

console.log('bloecke_holen: Die chinesischen Blöcke der offenen Pakete')
console.log('')
for (const [name, pkg] of auswahl) {
  const datei = join(CLIENT, pkg, 'src', 'client', 'locales.ts')
  let quelle
  try { quelle = readFileSync(datei, 'utf8') } catch {
    console.log(`  ${name.padEnd(16)} ${pkg.padEnd(32)} KEINE locales.ts`)
    continue
  }
  const ns = namensraum(pkg)
  // Alle Objekte der Datei (zh und …Zh).
  const objekte = []
  for (const m of quelle.matchAll(/export const\s+([A-Za-z][A-Za-z0-9_]*)\s*[:=]/g)) {
    if (m[1] === 'zh' || /Zh$/.test(m[1])) objekte.push(m[1])
  }
  const teile = []
  let gesamt = 0
  for (const o of objekte) {
    const b = block(quelle, o)
    if (b === undefined) continue
    const n = (b.match(/^\s*'?[A-Za-z][A-Za-z0-9_.-]*'?\s*:/gm) ?? []).length
    if (n === 0) continue
    gesamt += n
    teile.push(`### Objekt: ${o}  (${n} Schlüssel)\n${b}`)
  }
  writeFileSync(join(AUSGABE, `${name}.txt`), `# ${pkg}  ·  Namensraum: ${ns}\n\n${teile.join('\n\n')}`, 'utf8')
  console.log(`  ${name.padEnd(16)} ${ns.padEnd(26)} ${String(gesamt).padStart(4)} Texte  ->  .bloecke/${name}.txt`)
}
console.log('')
console.log(`  Ausgabe in: ${AUSGABE}`)
