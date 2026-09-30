/**
 * PROMPTHEUS Werkstatt — die Namensraum-Tabelle aus dem Harness LESEN.
 *
 * **Warum diese Datei die wichtigste im Ordner ist.**
 *
 * Eine Wörterbuch-Anmeldung besteht aus zwei Teilen, und nur der erste ist
 * sichtbar:
 *
 *     ctx.locale.register('settings.agentPreset', { zh, en })
 *                        ^^^^^^^^^^^^^^^^^^^^^
 *                        DIESER Name entscheidet, ob die Texte gelesen werden.
 *
 * `woerter_pruefen.mjs` führte diese Namen von Hand — und verglich dann die
 * **Schlüssel** je Namensraum. Es bestand mit „1937 von 1937", während 16 der
 * Namen falsch waren:
 *
 *     unsere Tabelle      was der Harness wirklich anmeldet
 *     settings.general    settings
 *     sidebar-right       sidebarRight
 *     commands            command
 *     message-feedback    feedback
 *     theme               settings.theme
 *     agent-preset        settings.agentPreset
 *
 * Die Folge war stumm: die deutschen Wörterbücher wurden unter falschem Namen
 * abgelegt, niemand las sie, die Oberfläche blieb englisch — und die Prüfung
 * meldete Erfolg, weil sie die Schlüssel ja fand. Am Bildschirm sah man es:
 * „Erweiterungen" und „Arbeitsbereiche" erschienen deutsch, „Settings",
 * „General", „Language" und „Appearance" blieben englisch.
 *
 * Deshalb wird hier nichts mehr gepflegt, sondern gelesen:
 *
 *   1. **Die Anmeldung**: `.register(<ausdruck>, …)`. Der Ausdruck wird gegen
 *      die `const`-Deklarationen desselben PAKETS aufgelöst — der Harness legt
 *      `NS` oft in eine andere Datei als die Anmeldung (`apply.ts` meldet an,
 *      `namespace.ts` erklärt).
 *   2. **Das Wörterbuch**: welches Objekt als chinesisches gereicht wird.
 *   3. **Die Datei**, in der es liegt — denn dort stehen die Schlüssel.
 *
 * Damit kann die Tabelle nicht mehr veralten. Ein neuer Namensraum im Harness
 * erscheint hier von selbst, und ein umbenannter fällt sofort auf.
 *
 * @module werkzeuge/namensraeume
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Wurzel dieses Werkzeugs (…/werkstatt). */
const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/** Die Harness-Installation — die Fassung **in** der Werkstatt. */
export const HARNESS = join(WURZEL, 'deepseek-harness')

/**
 * Alle `.ts`-Dateien unterhalb eines Verzeichnisses sammeln.
 *
 * Übersprungen werden `node_modules`, `lib`, `dist` und `tests`: dort stehen
 * Kopien oder Prüfungen, keine Anmeldungen.
 * @param basis - das Wurzelverzeichnis.
 * @param tiefe - die aktuelle Tiefe (für die Begrenzung).
 * @returns die gefundenen Dateipfade.
 */
export function dateienFinden(basis, tiefe = 0) {
  const aus = []
  let eintraege
  try { eintraege = readdirSync(basis) } catch { return aus }
  for (const e of eintraege) {
    const p = join(basis, e)
    let stat
    try { stat = statSync(p) } catch { continue }
    if (!stat.isDirectory()) {
      if (/\.ts$/.test(e) && !/\.d\.ts$/.test(e)) aus.push(p)
      continue
    }
    if (['node_modules', 'lib', 'dist', 'tests'].includes(e)) continue
    if (tiefe < 8) aus.push(...dateienFinden(p, tiefe + 1))
  }
  return aus
}

/**
 * Die Zeichenketten-Konstanten einer Datei lesen.
 *
 * `const NS = 'settings.agentPreset'` ist die übliche Form. Der Typ kann dabei
 * stehen (`const NS: SomeType = '…'`), deshalb wird er mit übersprungen.
 * @param quelle - der Inhalt der Datei.
 * @returns Map von Konstantenname auf Wert.
 */
function konstantenLesen(quelle) {
  const aus = new Map()
  for (const m of quelle.matchAll(
    /const\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?::[^=\n]+)?=\s*'([^']+)'/g)) {
    aus.set(m[1], m[2])
  }
  return aus
}

/**
 * Die Konstanten eines ganzen PAKETS lesen.
 *
 * **Warum das nötig ist.** Der Harness erklärt `NS` oft in einer anderen Datei,
 * als er anmeldet:
 *
 *     // ui-conversation/src/client/namespace.ts
 *     export const NS = 'conversation'
 *     // ui-conversation/src/client/apply.ts
 *     ctx.locale.register(NS, { zh, en })
 *
 * Wer nur die anmeldende Datei liest, findet `NS` nicht und lässt den
 * Namensraum weg — die Anmeldung verschwindet stumm aus der Tabelle.
 * @param verzeichnis - das Verzeichnis des Pakets.
 * @returns Map von Konstantenname auf Wert.
 */
function paketKonstantenLesen(verzeichnis) {
  const aus = new Map()
  for (const datei of dateienFinden(verzeichnis)) {
    let quelle
    try { quelle = readFileSync(datei, 'utf8') } catch { continue }
    for (const [name, wert] of konstantenLesen(quelle)) {
      if (!aus.has(name)) aus.set(name, wert)
    }
  }
  return aus
}

/**
 * Die Wörterbuch-Objekte einer Datei finden.
 *
 * Gesucht wird, was ein chinesisches Wörterbuch sein kann: ein Objekt namens
 * `zh`, oder ein Name, der auf `Zh` endet (`accessZh`, `managerZh`,
 * `settingsZh`). Der Harness hält sich an diese Form.
 * @param quelle - der Inhalt der Datei.
 * @returns die Objektnamen in Reihenfolge.
 */
function woerterbuchObjekte(quelle) {
  const aus = []
  for (const m of quelle.matchAll(/export const\s+([A-Za-z][A-Za-z0-9_]*)\s*[:=]/g)) {
    const name = m[1]
    if (name === 'zh' || /Zh$/.test(name)) aus.push(name)
  }
  return aus
}

/**
 * Die Anmeldungen einer Datei lesen und den Namensraum auflösen.
 *
 * **Zeichenweise, nicht mit einem Muster.** Die Aufrufe sind verschachtelt und
 * laufen über mehrere Zeilen:
 *
 *     ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-goal: dictionaries')
 *
 * Ein Muster, das die Argumentliste mit einer schliessenden Klammer beendet,
 * trifft die falsche Klammer. Deshalb wird ab `.register(` vorwärts gelesen, bis
 * die Klammerbilanz null ist; das erste Argument und das Wörterbuch-Argument
 * werden dabei herausgezogen.
 * @param quelle - der Inhalt der Datei.
 * @param fremdeKonstanten - Konstanten aus anderen Dateien desselben Pakets.
 * @returns Liste aus `{ ns, objekt }` — das Objekt kann `undefined` sein.
 */
function anmeldungenLesen(quelle, fremdeKonstanten) {
  const konst = new Map([...(fremdeKonstanten ?? []), ...konstantenLesen(quelle)])
  const aus = []
  for (const treffer of quelle.matchAll(/\.register\s*\(/g)) {
    let i = treffer.index + treffer[0].length
    let tiefe = 1
    let inString = false
    let anfuehrung = ''
    const start = i
    while (i < quelle.length && tiefe > 0) {
      const c = quelle[i]
      if (inString) {
        if (c === '\\') { i += 2; continue }
        if (c === anfuehrung) inString = false
        i += 1
        continue
      }
      if (c === "'" || c === '"') { inString = true; anfuehrung = c; i += 1; continue }
      if (c === '(' || c === '{' || c === '[') tiefe += 1
      else if (c === ')' || c === '}' || c === ']') tiefe -= 1
      i += 1
    }
    const inhalt = quelle.slice(start, i - 1)
    // Das erste Argument bis zum ersten Komma auf oberster Ebene.
    let k = 0
    let d = 0
    let s = false
    let q = ''
    for (; k < inhalt.length; k += 1) {
      const c = inhalt[k]
      if (s) { if (c === '\\') { k += 1; continue } if (c === q) s = false; continue }
      if (c === "'" || c === '"') { s = true; q = c; continue }
      if (c === '{' || c === '(' || c === '[') d += 1
      else if (c === '}' || c === ')' || c === ']') d -= 1
      else if (c === ',' && d === 0) break
    }
    const erstes = inhalt.slice(0, k).trim()
    const rest = inhalt.slice(k + 1)
    const woertlich = /^'([^']+)'$/.exec(erstes)
    const ns = woertlich !== null ? woertlich[1] : konst.get(erstes)
    if (ns === undefined) continue
    let objekt
    const benannt = rest.match(/\b(?:zh|en)\s*:\s*([A-Za-z_$][\w$]*)/)
    if (benannt !== null) objekt = benannt[1]
    else if (/(^|[{,\s])zh\s*[,}]/.test(rest)) objekt = 'zh'
    // **Nur Sprach-Anmeldungen.** `slots.register` und `configForms.get` tragen
    // ebenfalls Argumente; sie melden keine Wörterbücher an. Eine Sprach-Anmeldung
    // erkennt man am Empfänger: vor `.register(` steht `locale`.
    const davor = quelle.slice(Math.max(0, treffer.index - 40), treffer.index)
    const istSprache = /(^|[^\w.])locale\s*\.\s*$/.test(davor) || objekt !== undefined
    if (!istSprache) continue
    aus.push({ ns, objekt })
  }
  return aus
}

/**
 * Die Datei finden, in der ein Wörterbuch-Objekt wirklich steht.
 *
 * **Warum das nötig ist.** Angemeldet wird in `index.ts` oder `apply.ts`, aber
 * die Texte liegen fast immer in einer eigenen Datei daneben:
 *
 *     // ui-sidebar/src/client/index.ts
 *     import { zh, en } from './locales.ts'
 *     ctx.locale.register(NS, { zh, en })
 *
 * **Gesucht wird vom Anmeldeort nach AUSSEN**, nicht im ganzen Paket von vorn.
 * Die Dokumentvorschau zeigt, warum: sie hat acht Unterverzeichnisse, und jedes
 * führt ein eigenes `export const zh`. Wer im Paket von vorn sucht, findet für
 * `sidebarExcel` das Wörterbuch von `code` — drei Texte statt fünfzehn, und die
 * Prüfung meldete dann „15 überzählig", obwohl die Übersetzung stimmte.
 * @param anmeldeDatei - die Datei, in der angemeldet wird.
 * @param verzeichnis - das Paketverzeichnis (Rückfall).
 * @param objekt - der Name des Wörterbuch-Objekts, wie er in der Anmeldung steht.
 * @returns `{ datei, name }` — `name` ist der Name IN der Zieldatei, der sich
 *   vom Anmeldenamen unterscheiden kann (`zh as settingsZh`), oder `undefined`.
 */
function woerterbuchDateiFinden(anmeldeDatei, verzeichnis, objekt) {
  const passt = (datei, name) => {
    let quelle
    try { quelle = readFileSync(datei, 'utf8') } catch { return false }
    return deklarationMuster(name).test(quelle)
  }
  // 1. **Der Import ist die genaue Angabe.** Die anmeldende Datei nennt die
  //    Quelldatei ihres Wörterbuchs selbst.
  let anmeldeQuelle
  try { anmeldeQuelle = readFileSync(anmeldeDatei, 'utf8') } catch { anmeldeQuelle = '' }
  const ausImport = importQuelleFinden(anmeldeQuelle, anmeldeDatei, objekt)
  if (ausImport !== undefined) {
    // Im Import kann das Wörterbuch umbenannt sein (`zh as settingsZh`); in der
    // Zieldatei gilt der ursprüngliche Name.
    const verfolgt = reExportVerfolgen(ausImport.datei, ausImport.name)
    if (verfolgt !== undefined) return { datei: verfolgt, name: ausImport.name }
  }

  // 2. Die anmeldende Datei selbst — manche Pakete führen das Wörterbuch dort.
  if (passt(anmeldeDatei, objekt)) return { datei: anmeldeDatei, name: objekt }

  // 3. Die Nachbarschaft, von innen nach aussen: `excel/locales.ts` liegt neben
  //    `excel/index.ts`, das anmeldet.
  const alle = dateienFinden(verzeichnis)
  const nachTiefe = (d) => d.split(/[\\/]/).length
  const anmeldeTiefe = nachTiefe(anmeldeDatei)
  const sortiert = [...alle].sort((a, b) => {
    const da = Math.abs(nachTiefe(a) - anmeldeTiefe)
    const db = Math.abs(nachTiefe(b) - anmeldeTiefe)
    if (da !== db) return da - db
    // Bei gleicher Tiefe: der gemeinsame Pfadanfang entscheidet.
    const ga = gemeinsameTiefe(a, anmeldeDatei)
    const gb = gemeinsameTiefe(b, anmeldeDatei)
    return gb - ga
  })
  for (const datei of sortiert) {
    if (passt(datei, objekt)) return { datei, name: objekt }
  }
  return undefined
}

/**
 * Wie viele Pfadbestandteile zwei Pfade von vorn gemeinsam haben.
 * @param a - erster Pfad.
 * @param b - zweiter Pfad.
 * @returns die Zahl der gemeinsamen Bestandteile.
 */
function gemeinsameTiefe(a, b) {
  const x = a.replace(/\\/g, '/').split('/')
  const y = b.replace(/\\/g, '/').split('/')
  let i = 0
  while (i < x.length && i < y.length && x[i] === y[i]) i += 1
  return i
}

/**
 * Den Pfad relativ zum Harness bilden.
 * @param datei - der volle Pfad.
 * @returns der Pfad ab `packages/`.
 */
function relativPfad(datei) {
  const r = datei.replace(/\\/g, '/')
  const i = r.indexOf('packages/')
  return i < 0 ? r : r.slice(i)
}

/**
 * Die Zuordnung Namensraum → Wörterbuch-Datei → Objekt aus dem Harness lesen.
 *
 * Liefert je Namensraum die Vereinigung aller Quellen: ein Namensraum kann aus
 * mehreren Dateien bestehen (`agent-preset` hat zwei Wörterbücher,
 * `schedule.catalog` bekommt geteilte Texte).
 * @returns Map von Namensraum auf Liste von `{ datei, objekt }`.
 */
export function nachNamensraum() {
  const aus = new Map()
  const basis = join(HARNESS, 'packages', 'client')
  const paketKonstanten = new Map()
  const paketVerzeichnisse = new Map()

  for (const datei of dateienFinden(basis).sort()) {
    const relativ = relativPfad(datei)
    if (!relativ.startsWith('packages/client/')) continue
    const paketPfad = relativ.slice('packages/client/'.length).split('/')[0]
    const verzeichnis = join(basis, paketPfad)
    paketVerzeichnisse.set(paketPfad, verzeichnis)
    if (!paketKonstanten.has(paketPfad)) {
      paketKonstanten.set(paketPfad, paketKonstantenLesen(verzeichnis))
    }
    let quelle
    try { quelle = readFileSync(datei, 'utf8') } catch { continue }
    if (!quelle.includes('.register(')) continue

    const fremd = paketKonstanten.get(paketPfad)
    for (const { ns, objekt } of anmeldungenLesen(quelle, fremd)) {
      // Das Objekt kann eine Konstante sein (`{ zh: managerZh }`) — dann steht
      // der Name im Wörterbuch selbst.
      const name = objekt ?? 'zh'
      const ziel = woerterbuchDateiFinden(datei, verzeichnis, name)
      if (ziel === undefined) {
        // Nicht auffindbar: als Quelle die anmeldende Datei führen, damit die
        // Prüfung den Fall melden kann statt ihn zu verschweigen.
        const liste = aus.get(ns) ?? []
        liste.push({ datei: relativ, objekt: name })
        aus.set(ns, liste)
        continue
      }
      const liste = aus.get(ns) ?? []
      const zielPfad = relativPfad(ziel.datei)
      if (!liste.some(x => x.datei === zielPfad && x.objekt === ziel.name)) {
        liste.push({ datei: zielPfad, objekt: ziel.name })
      }
      // **Gespreizte Wörterbücher mitnehmen.** `schedule/locales.ts` holt sich
      // mit `...frequencyZh` die geteilten Häufigkeitstexte; im Bündel hat dieser
      // Namensraum sie. Ohne diesen Schritt meldete die Prüfung sie als
      // überzählig.
      let zielQuelle
      try { zielQuelle = readFileSync(ziel.datei, 'utf8') } catch { zielQuelle = '' }
      const zielVerzeichnis = dirname(ziel.datei)
      for (const gespreizt of spreizungenFinden(zielQuelle, ziel.name)) {
        const quelle2 = woerterbuchDateiFinden(ziel.datei, zielVerzeichnis, gespreizt)
        if (quelle2 === undefined) continue
        const p2 = relativPfad(quelle2.datei)
        if (!liste.some(x => x.datei === p2 && x.objekt === quelle2.name)) {
          liste.push({ datei: p2, objekt: quelle2.name })
        }
      }
      aus.set(ns, liste)
    }
  }
  return aus
}

/**
 * Wird diese Datei direkt gestartet (und nicht importiert)?
 *
 * Nötig, weil die Leser auch von anderen Werkzeugen benutzt werden — ein Import
 * darf keine Ausgabe erzeugen.
 */
const DIREKT = process.argv[1] !== undefined
  && import.meta.url === new URL(`file:///${process.argv[1].replace(/\\/g, '/')}`).href
/**
 * Die gespreizten Objekte einer Wörterbuch-Datei auflösen.
 *
 * **Warum das nötig ist.** Der Harness teilt Texte über Dateien hinweg, indem er
 * ein fremdes Objekt in sein eigenes spreizt:
 *
 *     // ui-schedule/src/client/locales.ts
 *     export const zh = { ...frequencyZh, /* eigene *​/ … }
 *
 * Im Bündel hat dieses Wörterbuch dann AUCH die Texte aus `frequency-locales.ts`.
 * Wer nur den Block liest, hält sie für überzählig — das Werkzeug meldete
 * „70/16" und „8 überzählig", obwohl die Übersetzung stimmte.
 * @param quelle - der Inhalt der Datei.
 * @param objekt - der Name des Wörterbuch-Objekts (`zh`).
 * @returns die Namen der gespreizten Objekte mit ihrer Quelldatei.
 */
function spreizungenFinden(quelle, objekt) {
  const zeilen = quelle.split('\n')
  let ab = -1
  for (let i = 0; i < zeilen.length; i += 1) {
    if (!new RegExp(`^export const\\s+${objekt}\\s*[^=\\n]*=`).test(zeilen[i])) continue
    for (let j = i; j < Math.min(i + 4, zeilen.length); j += 1) {
      if (zeilen[j].includes('{')) { ab = j; break }
    }
    if (ab !== -1) break
  }
  if (ab === -1) return []

  let tiefe = 0
  let begonnen = false
  const namen = []
  for (let i = ab; i < zeilen.length; i += 1) {
    for (const c of zeilen[i]) {
      if (c === '{') { tiefe += 1; begonnen = true } else if (c === '}') tiefe -= 1
    }
    const m = zeilen[i].match(/\.\.\.\s*([A-Za-z_][A-Za-z0-9_]*)/)
    if (m !== null && !namen.includes(m[1])) namen.push(m[1])
    if (begonnen && tiefe <= 0) break
  }
  return namen
}

/**
 * Das Muster für eine Wörterbuch-Deklaration.
 *
 * **Die Typannotation muss mit — auch mit geschweiften Klammern.** Der Harness
 * schreibt drei Formen:
 *
 *     export const zh = {
 *     export const zh: Record<TaskManagerKey, string> = {
 *     export const zh: { [Key in keyof typeof en]: string } = {
 *
 * Die dritte trägt geschweifte Klammern IN der Typangabe. Ein Muster, das sie
 * verbietet, findet dieses Wörterbuch nicht — und meldet „führt kein Objekt",
 * obwohl es da ist. Erlaubt wird deshalb alles bis zum `=`, begrenzt auf die
 * laufende Zeile: ein `=` in derselben Zeile beendet die Suche von selbst.
 * @param objekt - der Name des Wörterbuch-Objekts.
 * @returns das Muster.
 */
function deklarationMuster(objekt) {
  return new RegExp(`export const\\s+${objekt}\\s*[^=\\n]*=`)
}

/**
 * Die Datei finden, aus der ein Wörterbuch importiert wird.
 *
 * **Warum das die genaue Suche ist.** Die Anmeldung nennt ihren Import selbst:
 *
 *     // ui-schedule/src/client/index.ts
 *     import { en as managerEn, zh as managerZh } from './task-manager-locales.ts'
 *     ctx.locale.register(MANAGER_NS, { zh: managerZh, en: managerEn })
 *
 * Der Import ist die verlässlichste Angabe — genauer als jede Suche nach
 * Nachbarschaft. Deshalb wird zuerst hier nachgesehen.
 * @param quelle - der Inhalt der anmeldenden Datei.
 * @param anmeldeDatei - ihr Pfad (für die Auflösung relativer Importe).
 * @param objekt - der Name des gesuchten Wörterbuch-Objekts.
 * @returns der Pfad, oder `undefined`.
 */
function importQuelleFinden(quelle, anmeldeDatei, objekt) {
  const verzeichnis = dirname(anmeldeDatei)
  // **Über Zeilen hinweg.** Die Importe des Harness sind umbrochen:
  //
  //     import {
  //       en as settingsEn, zh as settingsZh, type SettingsLocaleKey,
  //     } from '../locales/settings.ts'
  //
  // Ein zeilenweises Muster findet davon nichts.
  //
  // **Und mit dem URSPRÜNGLICHEN Namen weitersuchen.** Importiert wird
  // `zh as settingsZh`: in der Zieldatei heisst das Wörterbuch `zh`, nicht
  // `settingsZh`. Wer den örtlichen Namen weiterverfolgt, findet nichts — und die
  // Prüfung meldet „führt kein Objekt", obwohl alles in Ordnung ist.
  for (const m of quelle.matchAll(/import\s*\{([\s\S]*?)\}\s*from\s*'(\.[^']+)'/g)) {
    const [, namen, pfad] = m
    let original
    const umbenannt = new RegExp(`(\\w+)\\s+as\\s+${objekt}\\b`).exec(namen)
    if (umbenannt !== null) original = umbenannt[1]
    else if (new RegExp(`(^|[,{\\s])${objekt}([,\\s}]|$)`).test(namen)) original = objekt
    if (original === undefined) continue
    // `.ts` kann im Import stehen oder fehlen.
    for (const endung of ['', '.ts', '/index.ts']) {
      const ziel = resolve(verzeichnis, pfad + endung)
      try {
        if (statSync(ziel).isFile()) return { datei: ziel, name: original }
      } catch { /* weiter probieren */ }
    }
  }
  return undefined
}

/**
 * Ein Wörterbuch-Objekt über Re-Exporte hindurch auflösen.
 *
 * **Warum das nötig ist.** Der Harness schiebt Wörterbücher oft durch eine
 * Sammeldatei:
 *
 *     // locale/src/locales/index.ts
 *     export { zh } from './zh.ts'
 *     export { en } from './en.ts'
 *
 * Wer nur `index.ts` liest, findet dort kein `export const zh` — und die
 * Prüfung meldet „führt kein Objekt", obwohl das Wörterbuch einen Schritt
 * weiter liegt. Verfolgt wird deshalb der Re-Export, notfalls mehrere Stufen.
 * @param datei - die gefundene Datei.
 * @param objekt - der gesuchte Objektname.
 * @param tiefe - die bereits verfolgten Stufen.
 * @returns der Pfad mit dem Objekt, oder `undefined`.
 */
function reExportVerfolgen(datei, objekt, tiefe = 0) {
  if (tiefe > 4) return undefined
  let quelle
  try { quelle = readFileSync(datei, 'utf8') } catch { return undefined }
  if (deklarationMuster(objekt).test(quelle)) return datei
  const verzeichnis = dirname(datei)
  for (const m of quelle.matchAll(
    new RegExp(`export\\s*\\{([^}]*)\\}\\s*from\\s*'(\\.?[^']+)'`, 'g'))) {
    const [, namen, pfad] = m
    // `zh` muss in der Ausfuhrliste stehen (auch als `zh as etwas`).
    if (!new RegExp(`(^|[,{\\s])(\\w+\\s+as\\s+)?${objekt}([,\\s}]|$)`).test(namen)) continue
    for (const endung of ['', '.ts', '/index.ts']) {
      const ziel = resolve(verzeichnis, pfad + endung)
      try {
        if (!statSync(ziel).isFile()) continue
      } catch { continue }
      const gefunden = reExportVerfolgen(ziel, objekt, tiefe + 1)
      if (gefunden !== undefined) return gefunden
    }
  }
  return undefined
}

/** Gibt die gelesene Tabelle aus. */
function main() {
  const gruppen = nachNamensraum()
  console.log('namensraeume: PROMPTHEUS Werkstatt')
  console.log(`${gruppen.size} Namensräume, aus dem Harness gelesen`)
  console.log('')
  for (const [ns, quellen] of [...gruppen].sort((a, b) => a[0].localeCompare(b[0]))) {
    console.log(`  ${ns}`)
    for (const q of quellen) console.log(`      ${q.datei}  →  ${q.objekt}`)
  }
}

if (DIREKT) main()
