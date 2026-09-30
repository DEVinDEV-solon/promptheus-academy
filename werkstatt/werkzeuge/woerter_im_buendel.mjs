/** Prüft, ob alle deutschen Texte im gebauten Bündel ankommen. */
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
// Der Sprachzweig wartet auf `ctx.inject`; ohne diesen Zug stürzt `apply()` ab
// und dieses Werkzeug meldete einen Fehler, den es selbst verursacht hat.
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

// **Je Namensraum zählen, nicht zusammengeworfen.** Viele Namensräume führen
// dieselben Schlüsselnamen (`close`, `cancel`, `title`, `retry` …). Ein
// `Object.assign` über alle würde sie überschreiben und eine zu kleine Zahl
// melden — das Bündel hätte scheinbar Texte verloren, die es sehr wohl führt.
const alle = Object.assign({}, ...reg.map(x => x.d))
const gesamt = reg.reduce((summe, x) => summe + Object.keys(x.d).length, 0)
console.log('Namensräume: ' + reg.length + ' | Texte gesamt: ' + gesamt
  + ' | verschiedene Schlüsselnamen: ' + Object.keys(alle).length)
console.log('')
reg.forEach(x => console.log('  ' + x.ns.padEnd(22) + Object.keys(x.d).length + ' Texte'))
console.log('')

const werte = Object.values(alle)
console.log('Stichproben:')
for (const s of ['Binärdatei', 'Erweiterungen', 'Erzeugte Dateien', 'Nebeneinander', 'Bezugsquelle', 'Rückfrage', 'Ins Unbekannte']) {
  console.log('  ' + (werte.includes(s) ? 'OK   ' : 'FEHLT') + ' ' + s)
}
console.log('')

// Teilstücke suchen, wo der ganze Satz nicht vorkommt.
for (const s of ['Installationsskript', 'Warteschlange']) {
  const treffer = werte.filter(v => v.includes(s))
  console.log('  „' + s + '": ' + treffer.length + ' Texte')
  for (const v of treffer.slice(0, 2)) console.log('      -> ' + v)
}
