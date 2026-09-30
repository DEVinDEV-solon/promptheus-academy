/**
 * PROMPTHEUS Werkstatt — Zählung: wie viele Texte fehlen noch?
 *
 * `woerter_pruefen.mjs` prüft jeden Namensraum einzeln und meldet Fehler.
 * Dieses Werkzeug gibt die ÜBERSICHT: wie viele Texte führt der Harness
 * überhaupt, wie viele davon liegen auf Deutsch, welche Namensräume fehlen
 * ganz. Damit steht am Anfang, wie viel Arbeit aussteht — statt es zu schätzen.
 *
 * **Beide Werkzeuge lesen dieselbe Quelle.** Die Namensraum-Tabelle kommt aus
 * `werkzeuge/namensraeume.mjs`, das sie aus dem Harness liest. Eine eigene,
 * von Hand geführte Zuordnung gibt es hier nicht mehr: sie lief auseinander
 * und meldete 195 Texte als offen, die längst übersetzt waren.
 *
 * Aufruf:  node werkzeuge/uebersetzung_umfang.mjs
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { HARNESS, nachNamensraum } from './namensraeume.mjs'

/**
 * Die Schlüssel eines Wörterbuch-Objekts lesen — Zeichen für Zeichen.
 *
 * **Warum nicht mit einem Muster.** Mehrere Schlüssel stehen in einer Zeile
 * (`record: '…', 'record-help': '…'`), Schlüssel stehen blank oder in
 * Anführungszeichen, und Werte enthalten Doppelpunkte (`https://…`). Ein Muster
 * erfindet dabei Schlüssel oder übersieht welche. Gelesen wird deshalb wie ein
 * Leser liest: mit Kenntnis davon, ob man in einer Zeichenkette steht.
 * @param quelle - der Inhalt der Datei.
 * @param name - der Name des Objekts (`zh`, `accessZh`, …).
 * @returns die Schlüssel in Reihenfolge; leer, wenn das Objekt fehlt.
 */
function schluesselLesen(quelle, name) {
  const zeilen = quelle.split('\n')
  let ab = -1
  for (let i = 0; i < zeilen.length; i += 1) {
    if (!new RegExp(`^export const\\s+${name}\\s*[^=\\n]*=`).test(zeilen[i])) continue
    for (let j = i; j < Math.min(i + 4, zeilen.length); j += 1) {
      const k = zeilen[j].indexOf('{', j === i ? zeilen[i].indexOf('=') + 1 : 0)
      if (k !== -1) {
        ab = zeilen.slice(0, j).join('\n').length + (j > 0 ? 1 : 0) + k + 1
        break
      }
    }
    if (ab !== -1) break
  }
  if (ab === -1) return []

  let tiefe = 1
  let i = ab
  while (i < quelle.length && tiefe > 0) {
    if (quelle[i] === '{') tiefe += 1
    else if (quelle[i] === '}') tiefe -= 1
    i += 1
  }
  const block = quelle.slice(ab, i - 1)

  const namen = []
  let d = 0
  let imString = false
  let anfuehrung = ''
  for (let k = 0; k < block.length; k += 1) {
    const c = block[k]
    if (imString) {
      if (c === '\\') { k += 1; continue }
      if (c === anfuehrung) imString = false
      continue
    }
    if (c === "'" || c === '"' || c === '`') { imString = true; anfuehrung = c; continue }
    if (c === '{' || c === '(' || c === '[') { d += 1; continue }
    if (c === '}' || c === ')' || c === ']') { d -= 1; continue }
    if (d > 0 || c !== ':') continue
    // Ein Doppelpunkt auf oberster Ebene beendet einen Schlüssel. Den Namen
    // rückwärts lesen, bis ein Trenner kommt.
    let e = k - 1
    while (e >= 0 && /\s/.test(block[e])) e -= 1
    if (e < 0) continue
    const ende = e
    let a = e
    while (a >= 0 && /[A-Za-z0-9_.-]/.test(block[a])) a -= 1
    // In Anführungszeichen gesetzt?
    if (a >= 0 && (block[a] === "'" || block[a] === '"')) {
      const q = block[a]
      let b = a - 1
      while (b >= 0 && block[b] !== q) b -= 1
      if (b >= 0) { namen.push(block.slice(b + 1, a)); continue }
    }
    const wort = block.slice(a + 1, ende + 1)
    if (/^[A-Za-z]/.test(wort)) namen.push(wort)
  }
  return namen
}

/** Liest unsere deutschen Wörterbücher, indem das gebaute Bündel ausgeführt wird. */
async function eigeneWoerterLesen() {
  const pfad = join(HARNESS, '..', 'pakete', 'dsh-client-ui-promptheus', 'lib', 'client.js')
  const quelle = readFileSync(pfad, 'utf8')
  let anmeldung
  globalThis.window = { __ModuleLoader__: { load: (e) => { anmeldung = e } } }
  // eslint-disable-next-line no-new-func
  new Function('window', quelle)(globalThis.window)

  const react = {
    createElement: () => ({}),
    useState: () => [null, () => {}],
    useEffect: () => {},
  }
  const rumpf = anmeldung.factory((s) => {
    if (s === 'react') return react
    throw new Error(`unerwartete Anforderung ${s}`)
  })

  const registriert = new Map()
  const locale = {
    register: (ns, sprache, woerter) => {
      if (sprache === 'de') registriert.set(ns, woerter)
      return () => {}
    },
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
  return registriert
}

/** Zählt alle Namensräume des Harness und vergleicht. */
async function main() {
  console.log('uebersetzung_umfang: PROMPTHEUS Werkstatt')
  console.log('')

  const unsere = await eigeneWoerterLesen()
  if (unsere.size === 0) {
    console.error('uebersetzung_umfang: das Paket meldet keinen deutschen Namensraum an')
    console.error('                    zuerst „node werkzeuge/bauen.mjs" laufen lassen')
    process.exitCode = 1
    return
  }

  const gruppen = nachNamensraum()
  let gesamt = 0
  let fehlend = 0
  const zeilen = []

  for (const [ns, quellen] of gruppen) {
    const erwartet = new Set()
    for (const { datei, objekt } of quellen) {
      let quelle
      try { quelle = readFileSync(join(HARNESS, datei), 'utf8') } catch { continue }
      for (const k of schluesselLesen(quelle, objekt)) erwartet.add(k)
    }
    if (erwartet.size === 0) continue
    gesamt += erwartet.size
    const haben = unsere.get(ns)
    const offen = haben === undefined
      ? erwartet.size
      : [...erwartet].filter(k => !(k in haben)).length
    fehlend += offen
    zeilen.push({ ns, anzahl: erwartet.size, offen, vorhanden: haben !== undefined })
  }

  console.log(`  Namensräume im Harness        : ${gruppen.size}`)
  console.log(`  davon bei uns angemeldet      : ${zeilen.filter(z => z.vorhanden).length}`)
  console.log(`  Texte im Harness gesamt       : ${gesamt}`)
  console.log(`  davon auf Deutsch             : ${gesamt - fehlend}`)
  console.log(`  noch offen                    : ${fehlend}`)
  console.log('')
  console.log('  Je Namensraum:')
  for (const z of zeilen.sort((a, b) => b.anzahl - a.anzahl)) {
    const marke = z.offen === 0 ? '✓' : z.vorhanden ? '~' : ' '
    const zusatz = z.offen === 0 ? '' : `  (${z.offen} offen)`
    console.log(`    ${marke} ${z.ns.padEnd(28)} ${String(z.anzahl).padStart(4)} Texte${zusatz}`)
  }
  console.log('')
  console.log(`uebersetzung_umfang: ${fehlend} von ${gesamt} Texten offen`)
  if (fehlend > 0) process.exitCode = 1
}

main().catch((f) => {
  console.error('uebersetzung_umfang: FEHLER')
  console.error(f)
  process.exitCode = 1
})
