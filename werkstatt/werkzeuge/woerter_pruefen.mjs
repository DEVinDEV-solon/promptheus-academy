/**
 * PROMPTHEUS Werkstatt — Wörterprüfung.
 *
 * Zählt die deutschen Texte gegen die Wörterbücher des Harness. Das ist die
 * Abnahme für die Sprachrunde: **ohne dieses Werkzeug ist „alles übersetzt"
 * eine Behauptung.**
 *
 * Geprüft wird je Namensraum:
 *   1. Kennt der Harness den Namensraum überhaupt?
 *   2. Ist jeder Schlüssel des Harness auf Deutsch belegt?  (fehlend = Fehler)
 *   3. Gibt es überzählige Schlüssel?  (überzählig = Fehler, die Quelle hat
 *      sich geändert)
 *   4. Sind die Platzhalter `{name}` unverändert?  (sonst bricht die Anzeige)
 *
 * Aufruf:  node werkzeuge/woerter_pruefen.mjs
 */

import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Wurzel dieses Werkzeugs (…/werkstatt). */
const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/** Die Harness-Installation — die Fassung **in** der Werkstatt. */
const HARNESS = join(WURZEL, 'deepseek-harness')

import { nachNamensraum } from './namensraeume.mjs'


/**
 * Die Schlüssel eines Wörterbuch-Objekts aus einer TypeScript-Quelldatei lesen.
 *
 * Gelesen wird mit einem Muster über den Objektblock: `export const <name> = {`
 * bis zur schliessenden Klammer. Das ist kein TypeScript-Auswerten — es soll
 * auch dann laufen, wenn im Harness gerade etwas nicht baut.
 * @param quelle - der Inhalt der Datei.
 * @param name - der Name des Objekts (`zh`, `accessZh`, …).
 * @returns die Schlüssel in Reihenfolge; leer, wenn das Objekt fehlt.
 */
function schluesselLesen(quelle, name) {
  // Der Block kann eine Typangabe tragen, auch über mehrere Zeilen:
  //   `export const en: Record<Key, string> = {`
  //   `export const zh: { [Key in keyof typeof en]: string } = {`
  // Die Typangabe steht deshalb IM Muster, aber so, dass keine geschweifte
  // Klammer darin vorkommen darf — sonst würde die öffnende Klammer des
  // Wörterbuchs selbst verschluckt und der Block wäre leer.
  //
  // **Kein `[^{]*` verwenden.** Dieses Muster ist gierig: es läuft über den
  // vorigen Block hinweg bis zur letzten Klammer und liefert dann den falschen
  // Block — bei `ui-conversation` fand es `en` statt `zh` und übersprang damit
  // genau die größten Wörterbücher. Ein zeilenweises Suchen nach der
  // Deklaration vermeidet das.
  const zeilen = quelle.split('\n')
  let ab = -1
  for (let i = 0; i < zeilen.length; i += 1) {
    const m = zeilen[i].match(new RegExp(`^export const\\s+${name}\\s*[^=\\n]*=`))
    if (m === null) continue
    // Die öffnende Klammer steht in dieser Zeile oder in einer der nächsten.
    for (let j = i; j < Math.min(i + 4, zeilen.length); j += 1) {
      const k = zeilen[j].indexOf('{', j === i ? m[0].length : 0)
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
  // Bis zur passenden schliessenden Klammer zählen — Objekte können verschachtelt sein.
  while (i < quelle.length && tiefe > 0) {
    if (quelle[i] === '{') tiefe += 1
    else if (quelle[i] === '}') tiefe -= 1
    i += 1
  }
  const block = quelle.slice(ab, i - 1)
  return schluesselImBlock(block)
}

/**
 * Die gespreizten Objekte eines Wörterbuch-Blocks auflösen.
 *
 * **Warum das nötig ist.** Der Harness teilt Texte über Dateien hinweg, indem er
 * ein fremdes Objekt in sein eigenes spreizt:
 *
 *     // image/locales.ts
 *     export const zh = { ...zoomZh, title: '图片', … }
 *
 * Im Bündel hat dieses Wörterbuch dann **elf** Schlüssel — fünf eigene und sechs
 * aus `zoom/locales.ts`. Wer nur den Block liest, sieht fünf und meldet die
 * sechs anderen als „überzählig". Das ist ein Fehlalarm: die Übersetzung ist
 * richtig, das Werkzeug hat zu wenig gelesen.
 *
 * Aufgelöst wird eine Ebene tief — genug für die Bauart des Harness, und
 * absichtlich nicht mehr: eine Kette von Spreizungen wäre ein Zeichen dafür,
 * dass hier etwas aus dem Ruder läuft.
 * @param quelle - der Inhalt der Datei mit dem Wörterbuch.
 * @param objekte - die Namen der Objekte, die gelesen werden sollen (`['zh']`).
 * @returns die Namen der gespreizten Objekte mit ihrer Quelldatei.
 */
function spreizungenFinden(quelle, objekte) {
  const aus = []
  for (const name of objekte) {
    const zeilen = quelle.split('\n')
    let ab = -1
    for (let i = 0; i < zeilen.length; i += 1) {
      const m = zeilen[i].match(new RegExp(`^export const\\s+${name}\\s*[:=]`))
      if (m === null) continue
      for (let j = i; j < Math.min(i + 4, zeilen.length); j += 1) {
        const k = zeilen[j].indexOf('{', j === i ? m[0].length : 0)
        if (k !== -1) { ab = j; break }
      }
      if (ab !== -1) break
    }
    if (ab === -1) continue
    // Bis zur schliessenden Klammer; darin nach `...name` suchen.
    let tiefe = 0
    let begonnen = false
    const teile = []
    for (let i = ab; i < zeilen.length; i += 1) {
      const zeile = zeilen[i]
      for (const c of zeile) {
        if (c === '{') { tiefe += 1; begonnen = true } else if (c === '}') tiefe -= 1
      }
      const m = zeile.match(/\.\.\.\s*([A-Za-z_][A-Za-z0-9_]*)/)
      if (m !== null) teile.push(m[1])
      if (begonnen && tiefe <= 0) break
    }
    for (const teil of teile) aus.push(teil)
  }
  return aus
}

/**
 * Die Schlüssel eines Wörterbuch-Blocks lesen — Zeichen für Zeichen.
 *
 * **Warum nicht mit einem Muster.** Zwei Eigenschaften der Harness-Dateien
 * haben sich als Muster-Fallen erwiesen:
 *
 *   1. Mehrere Schlüssel stehen in **einer** Zeile:
 *      `record: '…', 'record-help': '…',`
 *      Ein an den Zeilenanfang verankertes Muster fand nur den ersten.
 *   2. Schlüssel stehen **blank oder in Anführungszeichen**:
 *      `record: '…'` und `'edit-label': '…'` — beide Formen kommen vor.
 *   3. Werte enthalten Doppelpunkte (`https://npm.example.com/`), sodass ein
 *      freies Suchen nach `wort:` erfundene Schlüssel liefert.
 *
 * Deshalb wird der Block gelesen wie ein Leser ihn liest: Zeichen für Zeichen,
 * mit Kenntnis davon, ob man gerade in einer Zeichenkette steht und wie tief
 * man in verschachtelten Objekten ist. Nur auf der obersten Ebene und außerhalb
 * von Zeichenketten beginnt ein neuer Schlüssel.
 * @param block - der Inhalt zwischen den geschweiften Klammern.
 * @returns die Schlüssel in Reihenfolge.
 */
function schluesselImBlock(block) {
  const namen = []
  let tiefe = 0
  let inString = false
  let anfuehrung = ''
  let start = 0

  for (let i = 0; i < block.length; i += 1) {
    const c = block[i]

    if (inString) {
      if (c === '\\') { i += 1; continue }
      if (c === anfuehrung) inString = false
      continue
    }
    if (c === "'" || c === '"' || c === '`') { inString = true; anfuehrung = c; continue }
    if (c === '{' || c === '[') { tiefe += 1; continue }
    if (c === '}' || c === ']') { tiefe -= 1; continue }

    // Ein Segment endet bei einem Komma oder Zeilenumbruch auf der obersten Ebene.
    if (tiefe === 0 && (c === ',' || c === '\n')) {
      const teil = block.slice(start, i)
      const name = schluesselAusSegment(teil)
      if (name !== undefined) namen.push(name)
      start = i + 1
    }
  }
  const letzter = schluesselAusSegment(block.slice(start))
  if (letzter !== undefined) namen.push(letzter)
  return namen
}

/**
 * Den Schlüssel aus einem Segment lesen: alles vor dem ersten Doppelpunkt.
 *
 * Ein Segment ohne Doppelpunkt ist kein Eintrag (etwa ein Kommentar oder eine
 * Leerzeile) und liefert `undefined`.
 * @param teil - das Segment zwischen zwei Kommas.
 * @returns der Schlüssel, oder undefined wenn das Segment keiner ist.
 */
function schluesselAusSegment(teil) {
  const i = teil.indexOf(':')
  if (i === -1) return undefined
  // Der Name steht vor dem Doppelpunkt, in Anführungszeichen oder blank.
  let name = teil.slice(0, i).trim()
  // Ein Kommentar am Segmentanfang gehört nicht zum Namen.
  const zeilen = name.split('\n')
  name = zeilen[zeilen.length - 1].trim()
  if (name.startsWith('//') || name.startsWith('/*') || name.startsWith('*')) return undefined
  if ((name.startsWith("'") && name.endsWith("'")) || (name.startsWith('"') && name.endsWith('"'))) {
    name = name.slice(1, -1)
  }
  return /^[A-Za-z][A-Za-z0-9_.-]*$/.test(name) ? name : undefined
}

/** Liest die Wörterbücher unseres Pakets, indem das Bündel ausgeführt wird. */
async function eigeneWoerterLesen() {
  const pfad = join(WURZEL, 'pakete', 'dsh-client-ui-promptheus', 'lib', 'client.js')
  const roh = readFileSync(pfad, 'utf8')
  let anmeldung
  globalThis.window = { __ModuleLoader__: { load: (e) => { anmeldung = e } } }
  // eslint-disable-next-line no-new-func
  new Function('window', roh)(globalThis.window)

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
  // Das Farbregister wird nachgebildet, so weit das Paket es benutzt. Der echte
  // Themendienst des Harness hat vier Züge — `overrideTokens`, `getTheme`,
  // `setTheme` und die Ereignisse über `ctx.on`. Ein Gestell, das nur einen
  // davon kennt, lässt das Paket scheitern und meldet dann einen Fehler, den es
  // selbst verursacht hat.
  const theme = {
    overrideTokens: () => () => {},
    getTheme: () => ({ active: { colorScheme: 'dark' }, preference: 'dark', themes: [], revision: 0, fontSize: 14 }),
    setTheme: () => {},
  }
  const locale = {
    register: (ns, sprache, woerter) => {
      if (sprache === 'de') registriert.set(ns, woerter)
      return () => {}
    },
    addLanguage: () => () => {},
  }
  /** Die Steckplatz-Anmeldungen; hier zählt nur, dass `inject` sie ausführt. */
  const slots = {
    inject: (name, rueckruf) => { rueckruf(); return () => {} },
    register: () => () => {},
  }
  const ctx = {
    slots,
    // **Die Dienste liegen auch als Eigenschaften an.** Der echte Harness reicht
    // sie so (`ctx.locale`, `ctx.theme`) — nach einer `inject`-Erklärung ist das
    // der vorgesehene Zugriff. Ein Gestell mit nur `get()` lässt `apply()`
    // scheitern und meldet dann einen Fehler, den es selbst verursacht hat.
    locale,
    theme,
    get: (n) => {
      if (n === 'locale') return locale
      if (n === 'theme') return theme
      return undefined
    },
    on: () => () => {},
    effect: (cb) => { cb(); return () => {} },
    // **`ctx.inject` ist Pflicht.** Das Paket wartet damit auf Dienste, die
    // später bereitstehen (`locale`, `theme`). Es ist der Weg, den der Harness
    // selbst geht, und ohne ihn stürzt `apply()` ab. Der Rückruf bekommt einen
    // eigenen Kontext; der trägt hier dieselben Dienste.
    inject: (abhaengigkeiten, rueckruf) => { rueckruf(ctx); return () => {} },
  }
  rumpf.apply(ctx)
  return registriert
}

/** Vergleicht Soll und Ist. */
async function main() {
  console.log('woerter_pruefen: PROMPTHEUS Werkstatt')
  console.log('')

  const eigene = await eigeneWoerterLesen()
  if (eigene.size === 0) {
    console.error('woerter_pruefen: das Paket hat keinen deutschen Namensraum angemeldet')
    console.error('                 zuerst „node werkzeuge/bauen.mjs" laufen lassen')
    process.exitCode = 1
    return
  }

  let soll = 0
  let ist = 0
  let fehler = 0

  // **Die Tabelle wird GELESEN, nicht gepflegt.**
  //
  // Hier stand eine von Hand geführte Liste — und sie war an 16 Stellen falsch:
  // sie nannte `settings.general`, während der Harness `settings` anmeldet, und
  // `sidebar-right` statt `sidebarRight`. Weil dieses Werkzeug danach nur die
  // SCHLÜSSEL verglich, bestand es trotzdem: die Wörterbücher wurden unter
  // falschem Namen abgelegt, niemand las sie, und die Oberfläche blieb englisch.
  //
  // Gelesen wird jetzt aus dem Harness (`werkzeuge/namensraeume.mjs`): jede
  // `.locale.register`-Anmeldung mit aufgelöstem Namensraum und Wörterbuch. Eine
  // neue Sprache im Harness erscheint damit von selbst, ein umbenannter fällt
  // sofort auf — und die Liste kann nicht mehr veralten.
  const nachNs = nachNamensraum()

  for (const [ns, quellen] of nachNs) {
    const erwartet = []
    const platzhalterSoll = new Map()
    for (const { datei, objekt } of quellen) {
      let quelle
      try { quelle = readFileSync(join(HARNESS, datei), 'utf8') } catch {
        console.log(`  ✗ ${ns}`)
        console.log(`      die Quelle ${datei} fehlt`)
        fehler += 1
        continue
      }
      const teile = schluesselLesen(quelle, objekt)
      if (teile.length === 0) {
        console.log(`  ✗ ${ns}`)
        console.log(`      die Quelle ${datei} führt kein Objekt «${objekt}»`)
        fehler += 1
        continue
      }
      erwartet.push(...teile)
      // Die Platzhalter je Schlüssel aus der Quelle merken.
      for (const k of teile) {
        const m = quelle.match(new RegExp(`'${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}':\\s*'([^']*)'`))
        if (m !== null) platzhalterSoll.set(k, m[1])
      }
      // **Gespreizte Objekte mitlesen.** `image/locales.ts` holt sich mit
      // `...zoomZh` sechs Texte aus `zoom/locales.ts`. Im Bündel hat das
      // Wörterbuch sie; wer nur den Block liest, hält sie überzählig.
      //
      // **Nur die Zoom-Spreizung wird verfolgt.** Andere Spreizungen im Harness
      // holen ihren Inhalt aus derselben Datei (`...guideZh`) oder aus einer
      // anderen (`...frequencyZh`); beide stehen ohnehin schon in der Tabelle,
      // weil sie EIGENE Namensräume sind. Sie hier mitzuverfolgen hiesse, denselben
      // Text zweimal zu zählen — und für `...PRODUCT_NAMES` gäbe es gar keine
      // Datei. Verfolgt wird deshalb genau die eine Spreizung, deren Ziel nicht
      // in der Tabelle steht: die gemeinsame Zoom-Bedienung.
      for (const gespreizt of spreizungenFinden(quelle, [objekt])) {
        if (!/^zoom[A-Z]/.test(gespreizt)) continue
        const verzeichnis = datei.slice(0, datei.lastIndexOf('/'))
        const eltern = verzeichnis.slice(0, verzeichnis.lastIndexOf('/'))
        const pfad = `${eltern}/zoom/locales.ts`
        let zoomQuelle
        try { zoomQuelle = readFileSync(join(HARNESS, pfad), 'utf8') } catch {
          console.log(`  ✗ ${ns}`)
          console.log(`      „…${gespreizt}" wird gespreizt, aber ${pfad} fehlt`)
          fehler += 1
          continue
        }
        const zoomTeile = schluesselLesen(zoomQuelle, gespreizt)
        if (zoomTeile.length === 0) {
          console.log(`  ✗ ${ns}`)
          console.log(`      ${pfad} führt kein Objekt «${gespreizt}»`)
          fehler += 1
          continue
        }
        erwartet.push(...zoomTeile)
        for (const k of zoomTeile) {
          const m = zoomQuelle.match(new RegExp(`'${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}':\\s*'([^']*)'`))
          if (m !== null) platzhalterSoll.set(k, m[1])
        }
      }
    }
    if (erwartet.length === 0) continue

    const vorhanden = eigene.get(ns)
    soll += erwartet.length

    if (vorhanden === undefined) {
      console.log(`  ✗ ${ns}`)
      console.log(`      nicht auf Deutsch angemeldet (${erwartet.length} Texte fehlen)`)
      fehler += erwartet.length
      continue
    }

    const fehlend = erwartet.filter(k => !(k in vorhanden))
    const ueberzaehlig = Object.keys(vorhanden).filter(k => !erwartet.includes(k))
    // Platzhalter müssen erhalten bleiben, sonst bricht die Anzeige.
    const platzhalterFehler = []
    for (const k of erwartet) {
      if (!(k in vorhanden)) continue
      const sollP = platzhalterSoll.get(k) ?? ''
      const sollSet = new Set(sollP.match(/\{(\w+)\}/g) ?? [])
      const istSet = new Set(String(vorhanden[k]).match(/\{(\w+)\}/g) ?? [])
      for (const p of sollSet) if (!istSet.has(p)) platzhalterFehler.push(`${k}: {…} ${p} fehlt`)
    }

    ist += Object.keys(vorhanden).length
    const sauber = fehlend.length === 0 && ueberzaehlig.length === 0 && platzhalterFehler.length === 0
    console.log(`  ${sauber ? '✓' : '✗'} ${ns}  ${Object.keys(vorhanden).length}/${erwartet.length}`)
    if (fehlend.length > 0) {
      fehler += fehlend.length
      console.log(`      fehlt: ${fehlend.slice(0, 8).join(', ')}${fehlend.length > 8 ? ` … (+${fehlend.length - 8})` : ''}`)
    }
    if (ueberzaehlig.length > 0) {
      fehler += ueberzaehlig.length
      console.log(`      überzählig (Quelle hat sich geändert): ${ueberzaehlig.slice(0, 8).join(', ')}`)
    }
    for (const p of platzhalterFehler.slice(0, 5)) console.log(`      Platzhalter: ${p}`)
  }

  console.log('')
  console.log(`woerter_pruefen: ${ist} von ${soll} Texten auf Deutsch`)
  if (fehler === 0) {
    console.log('woerter_pruefen: BESTANDEN')
  } else {
    console.log(`woerter_pruefen: DURCHGEFALLEN (${fehler} Beanstandung(en))`)
    console.log('')
    console.log('Hinweis: Runde 2 ist noch nicht fertig. Die hier geprüften sieben')
    console.log('Namensräume sind der Anfang — die übrigen 17 folgen.')
    process.exitCode = 1
  }
}

main().catch((f) => {
  console.error('woerter_pruefen: FEHLER')
  console.error(f)
  process.exitCode = 1
})
