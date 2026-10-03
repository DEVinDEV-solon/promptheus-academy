/**
 * Prüft absichern.mjs an Kopien — nie am echten Profil.
 *
 * Aufruf: node werkstatt/werkzeuge/schutz/absichern_pruefen.mjs [profil.yml] [workspace.json]
 * Ohne Argumente nur mit der getrackten Vorlage und erfundenen Dateien.
 */
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { ACADEMY, WERKSTATT } from './maske.mjs'
import { PLATZHALTER, arbeitsordnerBereinigen, profilAbsichern, profilPruefen, schluesselUmziehen, schutzAdresse } from './absichern.mjs'

let fehler = 0, gut = 0
const pruefe = (was, ok, zusatz = '') => { if (ok) gut++; else { fehler++; console.log(`   ✕ ${was}${zusatz ? '  (' + zusatz + ')' : ''}`) } }
const tmp = mkdtempSync(join(tmpdir(), 'pu_absichern_'))
const PORT = 3089

// ── Profil ──────────────────────────────────────────────────────────────────
for (const [titel, quelle] of [['Vorlage', join(WERKSTATT, 'vorlage', 'profil-promptheus', 'cordis.patch.yml')],
  ...(process.argv[2] ? [['echtes Profil (Kopie)', process.argv[2]]] : [])]) {
  const p = join(tmp, `profil-${gut + fehler}.yml`)
  copyFileSync(quelle, p)
  const vorher = readFileSync(p, 'utf8')
  const g1 = profilAbsichern(p, PORT)
  const g2 = profilAbsichern(p, PORT)
  const nachher = readFileSync(p, 'utf8')
  pruefe(`${titel}: Prüfung danach ohne Befund`, profilPruefen(p, PORT).length === 0, profilPruefen(p, PORT).join('; '))
  pruefe(`${titel}: zweiter Lauf ändert nichts`, g2.length === 0, g2.join('; '))
  pruefe(`${titel}: kein Vollzugriff mehr als Vorgabe`, !/defaultPreset:\s*danger-full-access/.test(nachher))
  pruefe(`${titel}: openrouter über die Schutzschicht`, nachher.includes(`baseURL: ${schutzAdresse(PORT)}`))
  const geaenderteZeilen = nachher.split('\n').filter((z, i) => z !== vorher.split('\n')[i]).length
  pruefe(`${titel}: nur wenige Zeilen anders`, g1.length <= 2 && Math.abs(nachher.split('\n').length - vorher.split('\n').length) <= 1, String(geaenderteZeilen))
}
const fremd = join(tmp, 'fremd.yml')
writeFileSync(fremd, 'x:\n  providers:\n    openrouter:\n      baseURL: https://openrouter.ai/api/v1\n    anderer:\n      baseURL: https://example.org/v1\n')
profilAbsichern(fremd, PORT)
pruefe('fremder Anbieter wird gemeldet (Startsperre)', profilPruefen(fremd, PORT).length === 1, profilPruefen(fremd, PORT).join('; '))

// ── Schlüssel ───────────────────────────────────────────────────────────────
const env = join(tmp, 'harness.env'), ziel = join(tmp, 'data', 'schutzschicht.env')
const erfunden = 'sk-' + 'or-v1-' + 'beef'.repeat(12)
writeFileSync(env, `ANDERES=1\nOPENROUTER_API_KEY=${erfunden}\n`)
const s1 = schluesselUmziehen(env, ziel)
pruefe('Schlüssel umgezogen', s1.umgezogen && s1.ort === 'schutzschicht')
pruefe('Harness hat nur noch den Platzhalter', readFileSync(env, 'utf8').includes(`OPENROUTER_API_KEY=${PLATZHALTER}`) && !readFileSync(env, 'utf8').includes(erfunden))
pruefe('Schutzschicht hat den Schlüssel', readFileSync(ziel, 'utf8').includes(erfunden))
pruefe('andere Zeilen bleiben', readFileSync(env, 'utf8').includes('ANDERES=1'))
const s2 = schluesselUmziehen(env, ziel)
pruefe('zweiter Lauf: nichts mehr umzuziehen', !s2.umgezogen && s2.ort === 'schutzschicht')

// ── Arbeitsordner ───────────────────────────────────────────────────────────
const home = join(tmp, 'dsh')
mkdirSync(join(home, 'storages'), { recursive: true })
const ws = join(home, 'storages', 'workspace.json')
if (process.argv[3]) copyFileSync(process.argv[3], ws)
else writeFileSync(ws, JSON.stringify({ unit: { name: 'workspace', version: 2 }, global: { defaultWorkspaceId: 'b', workspaceIds: ['a', 'b'], archivedSessionIds: [] },
  tables: { workspaces: { a: { path: join(tmpdir(), 'irgendwo'), title: 'gut', sessionIds: [] }, b: { path: ACADEMY, title: 'Academy', sessionIds: ['s1'] } } } }))
const vorher = JSON.parse(readFileSync(ws, 'utf8'))
const weg = arbeitsordnerBereinigen(home)
const nachher = JSON.parse(readFileSync(ws, 'utf8'))
const reste = Object.values(nachher.tables.workspaces).map(w => w.path)
pruefe('Academy-Arbeitsordner entfernt', weg.length >= 1 && !reste.some(p => ACADEMY.toLowerCase().startsWith(p.toLowerCase())), weg.join(', '))
pruefe('Standard zeigt auf einen verbliebenen Ordner', !nachher.global.defaultWorkspaceId || nachher.tables.workspaces[nachher.global.defaultWorkspaceId] !== undefined)
pruefe('Liste und Tabelle stimmen überein', (nachher.global.workspaceIds ?? []).every(id => nachher.tables.workspaces[id]))
pruefe('Sicherung angelegt', readFileSync(ws + '.vor-schutzschicht', 'utf8') === JSON.stringify(vorher) || readFileSync(ws + '.vor-schutzschicht', 'utf8').length > 0)
pruefe('zweiter Lauf: nichts mehr', arbeitsordnerBereinigen(home).length === 0)

console.log(fehler === 0 ? `✓ ${gut} Prüfungen, alle grün.` : `✕ ${fehler} von ${gut + fehler} Prüfungen fehlgeschlagen.`)
process.exit(fehler === 0 ? 0 : 1)
