/** Prüft gezielt, ob bestimmte Texte im ausgelieferten Bündel stehen. */
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const roh = readFileSync(join(WURZEL, 'pakete', 'dsh-client-ui-promptheus', 'lib', 'client.js'), 'utf8')
let e
globalThis.window = { __ModuleLoader__: { load: (x) => { e = x } } }
new Function('window', roh)(globalThis.window)
const rumpf = e.factory(() => ({ createElement: () => ({}), useState: () => [null, () => {}], useEffect: () => {} }))
const reg = []
// **Der Sprachzweig wartet auf `ctx.inject`.** Seit die Anmeldung dort läuft
// (notwendig, weil `ctx.get('locale')` beim Aufbau `undefined` liefert), braucht
// jedes Gestell diesen Zug — sonst stürzt `apply()` ab und das Werkzeug meldet
// einen Fehler, den es selbst verursacht hat.
const locale = {
  register: (ns, sp, d) => { if (sp === 'de') reg.push({ ns, d }); return () => {} },
  addLanguage: () => () => {},
}
const theme = {
  overrideTokens: () => () => {},
  getTheme: () => ({ active: { colorScheme: 'dark' }, preference: 'dark', themes: [], revision: 0, fontSize: 14 }),
  setTheme: () => {},
}
const ctx = {
  slots: { inject: (n, cb) => { cb(); return () => {} }, register: () => () => {} },
  locale,
  theme,
  get: (n) => {
    if (n === 'locale') return locale
    if (n === 'theme') return theme
    return undefined
  },
  on: () => () => {},
  effect: (cb) => { cb(); return () => {} },
  inject: (abhaengigkeiten, rueckruf) => { rueckruf(ctx); return () => {} },
}
rumpf.apply(ctx)
const alle = Object.assign({}, ...reg.map(x => x.d))
const werte = Object.values(alle)

// Die Werte, die die Stichprobe als fehlend meldete.
const suchen = process.argv.slice(2)
if (suchen.length === 0) {
  console.log('Aufruf: node werkzeuge\\text_pruefen.mjs "Text" ["Text" …]')
  console.log('')
  console.log('Gesamt:', Object.keys(alle).length, 'Texte in', reg.length, 'Namensräumen')
} else {
  for (const s of suchen) {
    const genau = werte.includes(s)
    const teil = werte.filter(v => v.includes(s))
    console.log(`  ${genau ? 'OK   ' : teil.length > 0 ? 'TEIL ' : 'FEHLT'} „${s}"`)
    if (!genau && teil.length > 0) for (const v of teil.slice(0, 2)) console.log(`         -> ${v.slice(0, 90)}`)
  }
}
