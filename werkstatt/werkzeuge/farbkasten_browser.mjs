/**
 * PROMPTHEUS Werkstatt — Browserprüfung des Farbkastens.
 *
 * **Warum das nicht die anderen Werkzeuge ersetzen kann.** Die Prüfungen in
 * `buendel_pruefen.mjs` bauen die Bausteine mit einem Gestell. Ein Gestell
 * bestätigt, dass ein Baustein *nicht abstürzt* — es bestätigt nicht, dass er
 * im echten Harness *erscheint*, dass die Steckplatz-Anmeldung greift und dass
 * ein Druck auf einen Würfel die Farben der Seite wirklich ändert. Genau das
 * prüft dieses Werkzeug: den geladenen Code im echten Browser am echten Server.
 *
 * Was geprüft wird:
 *
 *   1. Das Paket lädt ohne Fehler in der Konsole.
 *   2. Die Farbkasten-Zeile erscheint im Fenster „Allgemein" der Einstellungen.
 *   3. Es sind sechs Würfel, mit den sechs Namen aus `varianten.php`.
 *   4. Ein Druck ändert die Farbmarken auf `body` wirklich.
 *   5. Der Wechsel zwischen zwei Paletten hinterlässt keine Mischung aus beiden.
 *   6. Die Wahl überlebt ein Neuladen (Browserspeicher).
 *
 * Aufruf:  node werkzeuge/farbkasten_browser.mjs [--url http://127.0.0.1:3081/?token=…]
 */

import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Wurzel dieses Werkzeugs (…/werkstatt). */
const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/** Wo die Harness-Installation liegt (dort liegt Playwright). */
const HARNESS = join(WURZEL, 'deepseek-harness')

/** Die Adresse, wenn keine gereicht wurde. */
const VORGABE_URL = 'http://127.0.0.1:3081/'

/** Die sechs Namen in Anzeigereihenfolge. */
const NAMEN = ['Schmiede', 'Pergament', 'Olymp', 'Marmor', 'Terrakotta', 'Funkenflug']

/** Die Marken, an denen sich eine Palette ablesen lässt. */
const MARKEN = ['--dsw-alias-bg-base', '--dsw-alias-brand-primary', '--dsw-alias-label-primary']

/**
 * Liest die Adresse aus der Kommandozeile.
 * @returns die zu öffnende Adresse.
 */
function adresse() {
  const stelle = process.argv.indexOf('--url')
  if (stelle >= 0 && process.argv[stelle + 1] !== undefined) return process.argv[stelle + 1]
  const ausUmgebung = process.env.WERKSTATT_URL
  return ausUmgebung ?? VORGABE_URL
}

/**
 * Reicht eine Beanstandung weiter und zählt sie.
 * @param liste - die Liste der Beanstandungen.
 * @param text - die Meldung.
 */
function melden(liste, text) {
  liste.push(text)
  console.log(`  ✗ ${text}`)
}

/**
 * Lädt Playwright aus der Ablage des Harness.
 *
 * **Warum nicht einfach `require('playwright')`.** Der Harness führt Playwright
 * nicht als eigene Abhängigkeit; es liegt als Beigabe in der pnpm-Ablage
 * (`node_modules/.pnpm/playwright@…`) und ist von aussen nicht auflösbar. Ein
 * blankes `require('playwright')` scheitert deshalb mit MODULE_NOT_FOUND —
 * obwohl es da ist. Dasselbe Verfahren wie in `bauen.mjs` für esbuild: suchen
 * statt raten.
 * @returns das Playwright-Modul.
 */
function playwrightLaden() {
  const require = createRequire(join(HARNESS, 'package.json'))
  const { readdirSync, existsSync } = require('node:fs')
  const ablage = join(HARNESS, 'node_modules', '.pnpm')
  let kandidaten = []
  try {
    kandidaten = readdirSync(ablage).filter(n => /^playwright@\d/.test(n)).sort()
  } catch {
    // Keine Ablage: dann wird unten der Fehler gemeldet, und der nennt den Weg.
    kandidaten = []
  }
  for (const name of kandidaten.reverse()) {
    const einstieg = join(ablage, name, 'node_modules', 'playwright', 'index.js')
    if (existsSync(einstieg)) return require(einstieg)
  }
  throw new Error(
    'farbkasten_browser: Playwright wurde nicht gefunden. Im Harness liegt es unter '
    + `node_modules/.pnpm/playwright@… — dort nachsehen oder „pnpm install" im Harness laufen lassen. `
    + `Gesucht in: ${ablage}`,
  )
}

/**
 * Findet einen Browser zum Starten.
 *
 * **Warum nicht Playwrights eigener Chromium.** Der ist nicht heruntergeladen
 * (`ms-playwright` ist leer), und ihn zu holen hiesse, etwas aus dem Netz zu
 * ziehen — wogegen BRAND.md §9 steht („kein externer Bezug"). Auf diesem
 * Rechner steht Chrome; der wird genommen.
 * @returns der Pfad zu einer ausführbaren Browserdatei.
 */
function browserFinden() {
  const { existsSync } = createRequire(join(HARNESS, 'package.json'))('node:fs')
  const kandidaten = [
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  ].filter(p => typeof p === 'string' && p.length > 0)
  for (const pfad of kandidaten) {
    if (existsSync(pfad)) return pfad
  }
  // Ohne eigenen Browser versucht es Playwright mit seinem eigenen — dann nennt
  // der Fehler den Weg (`playwright install`).
  return undefined
}

/** Führt die Prüfung durch. */
async function main() {
  const { chromium } = playwrightLaden()

  const ziel = adresse()
  console.log('farbkasten_browser: PROMPTHEUS Werkstatt')
  console.log(`Adresse ${ziel}`)
  console.log('')

  const beanstandungen = []
  const ausfuehrbar = browserFinden()
  if (ausfuehrbar !== undefined) console.log(`Browser ${ausfuehrbar}`)
  const browser = await chromium.launch({
    headless: true,
    ...(ausfuehrbar !== undefined ? { executablePath: ausfuehrbar } : {}),
  })
  // **Die Browsersprache auf Deutsch stellen.** Der Harness wählt seine Sprache
  // beim ersten Start aus den Sprachen des Browsers; ohne diesen Griff prüfte
  // dieser Test die englische Oberfläche und suchte deutsche Wörter darin.
  const seite = await browser.newPage({ locale: 'de-DE' })

  // Konsolenfehler mitschreiben: ein Absturz im Client zeigt sich hier, nicht
  // im Bild.
  const konsolenfehler = []
  seite.on('console', (meldung) => {
    if (meldung.type() === 'error') konsolenfehler.push(meldung.text())
  })
  seite.on('pageerror', (fehler) => { konsolenfehler.push(`pageerror: ${fehler.message}`) })

  try {
    // ── 1. Laden ─────────────────────────────────────────────────────────────
    await seite.goto(ziel, { waitUntil: 'domcontentloaded', timeout: 60000 })
    // Der Client baut sich asynchron auf; auf die Wurzel warten.
    await seite.waitForSelector('#root', { timeout: 60000 })
    await seite.waitForTimeout(3000)

    const titel = await seite.title()
    if (titel.includes('Werkstatt')) console.log(`  ✓ Titel: ${titel}`)
    else melden(beanstandungen, `Titel ist „${titel}", erwartet „Werkstatt — Promptheus Academy"`)

    // ── 2. Die Einstellungen öffnen ──────────────────────────────────────────
    //
    // Der Weg dorthin ist ein Knopf im Harness. Statt eine feste Kennung zu
    // raten, wird nach dem Text gesucht — und wenn keiner da ist, über den
    // Titel des Fensters.
    const geoeffnet = await seite.evaluate(() => {
      const knopf = [...document.querySelectorAll('button,a,[role="button"]')]
        .find(e => /einstellung|settings/i.test(e.textContent ?? ''))
      if (knopf === undefined) return false
      knopf.click()
      return true
    })
    if (!geoeffnet) {
      melden(beanstandungen, 'kein Knopf zu den Einstellungen gefunden')
      return
    }
    await seite.waitForTimeout(2500)

    // ── 3. Die Farbkasten-Zeile ──────────────────────────────────────────────
    const gefunden = await seite.evaluate((namen) => {
      const text = document.body.innerText
      const da = namen.filter(n => text.includes(n))
      // Die Würfel tragen `aria-pressed` und enthalten Name und Grundton —
      // `textContent` liefert beides OHNE Trennzeichen ("Schmiededunkel"),
      // `innerText` mit Zeilenumbruch. Geprüft wird deshalb mit `startsWith`,
      // nicht über eine Trennung, die je nach Umgebung ausbleibt.
      const wuerfel = [...document.querySelectorAll('button[aria-pressed]')]
        .filter(k => namen.some(n => (k.textContent ?? '').startsWith(n)))
      return {
        farbkastenTitel: text.includes('Farbkasten'),
        erklaerung: text.includes('Sechs geprüfte Paletten'),
        namenDa: da,
        wuerfelZahl: wuerfel.length,
        gedrueckt: wuerfel.filter(k => k.getAttribute('aria-pressed') === 'true')
          .map(k => namen.find(n => (k.textContent ?? '').startsWith(n))),
      }
    }, NAMEN)

    if (farbkastenFehlt(gefunden, beanstandungen)) return

    // Genau einer ist gewählt — sonst stimmt die Anzeige nicht mit der Wirkung.
    if (gefunden.gedrueckt.length === 1) {
      console.log(`  ✓ genau eine Palette ist markiert: ${gefunden.gedrueckt[0]}`)
    } else {
      melden(beanstandungen,
        `${gefunden.gedrueckt.length} Paletten sind markiert (${gefunden.gedrueckt.join(', ') || 'keine'}), erwartet genau eine`)
    }

    // ── 4. Ein Druck ändert die Farben wirklich ──────────────────────────────
    const vorher = await seite.evaluate((marken) => {
      const s = getComputedStyle(document.body)
      return Object.fromEntries(marken.map(m => [m, s.getPropertyValue(m).trim()]))
    }, MARKEN)

    // „Funkenflug" wählen — die auffälligste Abweichung von der Vorgabe.
    await seite.evaluate((name) => {
      const k = [...document.querySelectorAll('button[aria-pressed]')]
        .find(e => (e.textContent ?? '').startsWith(name))
      k?.click()
    }, 'Funkenflug')
    await seite.waitForTimeout(1500)

    const nachher = await seite.evaluate((marken) => {
      const s = getComputedStyle(document.body)
      return Object.fromEntries(marken.map(m => [m, s.getPropertyValue(m).trim()]))
    }, MARKEN)

    let geaendert = 0
    for (const m of MARKEN) {
      if (vorher[m] !== nachher[m]) geaendert += 1
      console.log(`    ${vorher[m] === nachher[m] ? '·' : '→'} ${m}  ${vorher[m]}  →  ${nachher[m]}`)
    }
    if (geaendert === 0) melden(beanstandungen, 'ein Druck auf einen Würfel ändert keine Farbmarke')
    else console.log(`  ✓ ${geaendert} von ${MARKEN.length} Marken geändert`)

    // Funkenflug ist dunkel: der Grund muss sehr dunkel sein.
    if (nachher['--dsw-alias-bg-base'] === '#161028') {
      console.log('  ✓ Funkenflug-Grund steht exakt auf #161028')
    } else {
      melden(beanstandungen, `Funkenflug-Grund ist ${nachher['--dsw-alias-bg-base']}, erwartet #161028`)
    }

    // ── 5. Keine Mischung aus zwei Paletten ──────────────────────────────────
    //
    // Der Überschreibungs-Layer wird bei jeder Wahl ERSETZT, nicht gestapelt.
    // Blieben Werte der alten Palette stehen, wäre die Schrift rot auf rot.
    if (nachher['--dsw-alias-brand-primary'] === '#ff8a3d') {
      console.log('  ✓ Akzent steht exakt auf Funkenflugs #ff8a3d (keine Mischung)')
    } else {
      melden(beanstandungen,
        `Akzent ist ${nachher['--dsw-alias-brand-primary']}, erwartet #ff8a3d — Mischung aus zwei Paletten?`)
    }

    // ── 5b. Die Anzeige zieht mit ────────────────────────────────────────────
    //
    // Der Kern der Partner-Regel: nach der Wahl zeigt genau die Palette als
    // markiert, deren Farben wirklich auf dem Bildschirm stehen. Wichen die
    // beiden voneinander ab, bediente man eine Anzeige, die lügt.
    const markiert = await seite.evaluate((namen) => {
      const k = [...document.querySelectorAll('button[aria-pressed]')]
        .find(e => e.getAttribute('aria-pressed') === 'true'
          && namen.some(n => (e.textContent ?? '').startsWith(n)))
      return k === undefined ? null : namen.find(n => (k.textContent ?? '').startsWith(n))
    }, NAMEN)
    if (markiert === 'Funkenflug') {
      console.log('  ✓ markiert ist Funkenflug — Anzeige und Wirkung stimmen überein')
    } else {
      melden(beanstandungen,
        `markiert ist „${markiert ?? 'nichts'}", auf dem Bildschirm steht aber Funkenflug`)
    }

    // ── 5c. Der Hell/Dunkel-Schalter zieht die Partnerpalette nach ───────────
    //
    // Funkenflug ist dunkel, sein Partner ist Marmor. Ein Druck auf „hell"
    // im Harness muss deshalb Marmor zeigen — nicht eine aufgehellte Fassung
    // von Funkenflug. Das ist die Regel aus `varianten.php` in der Praxis.
    //
    // **Die Beschriftung ist deutsch, seit die Oberfläche deutsch ist.** Der
    // Würfel heisst „Hell", nicht „Light"; beide Formen werden zugelassen, damit
    // der Test nicht an der Sprache scheitert, die er prüfen soll.
    await seite.evaluate(() => {
      const k = [...document.querySelectorAll('button[aria-pressed]')]
        .find(e => /^(Light|Hell)$/.test((e.textContent ?? '').trim()))
      k?.click()
    })
    await seite.waitForTimeout(1500)
    const hellGrund = await seite.evaluate(() =>
      getComputedStyle(document.body).getPropertyValue('--dsw-alias-bg-base').trim())
    const hellMarkiert = await seite.evaluate((namen) => {
      const k = [...document.querySelectorAll('button[aria-pressed]')]
        .find(e => e.getAttribute('aria-pressed') === 'true'
          && namen.some(n => (e.textContent ?? '').startsWith(n)))
      return k === undefined ? null : namen.find(n => (k.textContent ?? '').startsWith(n))
    }, NAMEN)
    if (hellGrund === '#f4f5f7' && hellMarkiert === 'Marmor') {
      console.log('  ✓ „hell" wechselt zu Marmor (Funkenflugs Partner), nicht zu einer Aufhellung')
    } else {
      melden(beanstandungen,
        `nach „hell" steht der Grund auf ${hellGrund} und markiert ist „${hellMarkiert ?? 'nichts'}"`
        + ' — erwartet #f4f5f7 und Marmor')
    }
    // Zurück auf dunkel, damit die Neuladeprüfung unten ihren Ausgangswert hat.
    await seite.evaluate(() => {
      const k = [...document.querySelectorAll('button[aria-pressed]')]
        .find(e => /^(Dark|Dunkel)$/.test((e.textContent ?? '').trim()))
      k?.click()
    })
    await seite.waitForTimeout(1200)

    // ── 6. Die Wahl überlebt ein Neuladen ────────────────────────────────────
    //
    // Geprüft wird die WAHL, nicht die Wirkung: Funkenflug bleibt gewählt, und
    // weil der Harness zuletzt auf dunkel stand, muss wieder Funkenflug
    // erscheinen. Das ist der Unterschied zwischen „die Palette ist gemerkt" und
    // „der Grundton ist gemerkt".
    await seite.reload({ waitUntil: 'domcontentloaded' })
    await seite.waitForSelector('#root', { timeout: 60000 })
    await seite.waitForTimeout(3000)
    const nachNeuladen = await seite.evaluate(() =>
      getComputedStyle(document.body).getPropertyValue('--dsw-alias-bg-base').trim())
    if (nachNeuladen === '#161028') {
      console.log('  ✓ die Wahl (Funkenflug) überlebt ein Neuladen')
    } else {
      melden(beanstandungen,
        `nach dem Neuladen steht der Grund auf ${nachNeuladen || '(leer)'}, erwartet #161028 (Funkenflug)`)
    }

    // ── 7. Die Konsole ───────────────────────────────────────────────────────
    const echte = konsolenfehler.filter(f => !/favicon|404|Failed to load resource/i.test(f))
    if (echte.length === 0) {
      console.log('  ✓ keine Fehler in der Konsole')
    } else {
      for (const f of echte.slice(0, 6)) melden(beanstandungen, `Konsole: ${f}`)
    }
  } finally {
    await browser.close()
  }

  console.log('')
  if (beanstandungen.length === 0) {
    console.log('farbkasten_browser: BESTANDEN')
  } else {
    console.log(`farbkasten_browser: DURCHGEFALLEN (${beanstandungen.length} Beanstandung(en))`)
    process.exitCode = 1
  }
}

/**
 * Prüft die gefundene Farbkasten-Zeile und meldet, was fehlt.
 * @param gefunden - das Ergebnis der Auswertung im Browser.
 * @param beanstandungen - die Liste der Beanstandungen.
 * @returns ob abgebrochen werden muss.
 */
function farbkastenFehlt(gefunden, beanstandungen) {
  let abbruch = false
  if (!gefunden.farbkastenTitel) {
    melden(beanstandungen, 'die Zeile „Farbkasten" erscheint nicht in den Einstellungen')
    abbruch = true
  } else {
    console.log('  ✓ die Zeile „Farbkasten" erscheint')
  }
  if (!gefunden.erklaerung) melden(beanstandungen, 'die Erklärung unter dem Titel fehlt')
  else console.log('  ✓ die Erklärung steht darunter')

  const fehlend = NAMEN.filter(n => !gefunden.namenDa.includes(n))
  if (fehlend.length === 0) console.log(`  ✓ alle ${NAMEN.length} Palettennamen erscheinen`)
  else melden(beanstandungen, `diese Palettennamen fehlen: ${fehlend.join(', ')}`)

  if (gefunden.wuerfelZahl === NAMEN.length) {
    console.log(`  ✓ ${NAMEN.length} Würfel mit aria-pressed`)
  } else {
    melden(beanstandungen, `${gefunden.wuerfelZahl} Würfel gefunden, erwartet ${NAMEN.length}`)
  }
  return abbruch
}

main().catch((fehler) => {
  console.error('farbkasten_browser: FEHLER')
  console.error(fehler)
  process.exitCode = 1
})
