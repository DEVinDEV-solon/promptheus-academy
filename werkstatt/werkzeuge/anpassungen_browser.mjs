/**
 * Prüft die vier Feinanpassungen der Werkstatt im echten Browser.
 *
 * Gemessen wird, was der Nutzer sieht:
 *   1. „Neue Session" linksbündig (nicht mittig)
 *   2. „Community" linksbündig
 *   3. Der Schriftzug trägt die Gedankenstriche: „- W E R K S T A T T -"
 *   4. Der Hero-Titel heisst „Talente verdienen…" (deutsch) bzw. „Earn Talent…"
 *      (englisch)
 *
 * Aufruf:  node werkzeuge/anpassungen_browser.mjs [--url …]
 */

import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Wurzel dieses Werkzeugs (…/werkstatt). */
const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/** Wo die Harness-Installation liegt (dort liegt Playwright). */
const HARNESS = join(WURZEL, 'deepseek-harness')

/** Lädt Playwright aus der Ablage des Harness. */
function playwrightLaden() {
  const require = createRequire(join(HARNESS, 'package.json'))
  const { readdirSync, existsSync } = require('node:fs')
  const ablage = join(HARNESS, 'node_modules', '.pnpm')
  for (const name of readdirSync(ablage).filter(n => /^playwright@\d/.test(n)).sort().reverse()) {
    const einstieg = join(ablage, name, 'node_modules', 'playwright', 'index.js')
    if (existsSync(einstieg)) return require(einstieg)
  }
  throw new Error('anpassungen_browser: Playwright nicht gefunden')
}

/** Findet einen Browser. */
function browserFinden() {
  const { existsSync } = createRequire(join(HARNESS, 'package.json'))('node:fs')
  for (const pfad of [
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ]) {
    if (typeof pfad === 'string' && pfad !== '' && existsSync(pfad)) return pfad
  }
  return undefined
}

/** Meldet eine Beanstandung. */
function melden(liste, text) {
  liste.push(text)
  console.log(`  ✗ ${text}`)
}

/**
 * Misst die Ausrichtung eines Knopfes: sitzt der Inhalt links oder mittig?
 * @returns die Luft links, rechts und die Feststellung.
 */
const AUSRICHTUNG = `(el) => {
  const r = el.getBoundingClientRect()
  const kinder = [...el.children]
  if (kinder.length === 0) return null
  const k = kinder[0].getBoundingClientRect()
  return {
    links: Math.round(k.left - r.left),
    rechts: Math.round(r.right - k.right),
    breite: Math.round(r.width),
  }
}`

/** Führt die Prüfung durch. */
async function main() {
  const { chromium } = playwrightLaden()
  const stelle = process.argv.indexOf('--url')
  const ziel = stelle >= 0 ? process.argv[stelle + 1] : process.env.WERKSTATT_URL
  if (ziel === undefined) {
    console.error('anpassungen_browser: keine Adresse — --url … oder WERKSTATT_URL setzen')
    process.exitCode = 1
    return
  }

  console.log('anpassungen_browser: PROMPTHEUS Werkstatt')
  console.log(`Adresse ${ziel}`)
  console.log('')

  const beanstandungen = []
  const browser = await chromium.launch({
    headless: true,
    ...(browserFinden() !== undefined ? { executablePath: browserFinden() } : {}),
  })

  try {
    for (const sprache of ['de-DE', 'en-US']) {
      const seite = await browser.newPage({ locale: sprache })
      const kurz = sprache.startsWith('de') ? 'deutsch' : 'englisch'
      console.log(`── ${kurz} (${sprache})`)

      await seite.goto(ziel, { waitUntil: 'load', timeout: 60000 })
      await seite.waitForSelector('#root', { timeout: 60000 })
      await seite.waitForTimeout(5000)

      // **Die Sprache ausdrücklich wählen.** Der Harness merkt sie sich in den
      // Einstellungen des Servers; die Browsersprache gilt nur beim allerersten
      // Start. Ohne diesen Griff prüfte der Lauf zweimal dieselbe Sprache.
      const wunsch = sprache.startsWith('de') ? 'Deutsch' : 'English'
      await seite.evaluate(() => {
        document.querySelector('[aria-label="Settings"],[aria-label="Einstellungen"]')?.click()
      })
      await seite.waitForTimeout(2500)
      await seite.evaluate((zielSprache) => {
        const knopf = [...document.querySelectorAll('button[aria-haspopup="menu"]')]
          .find(k => /^(English|Deutsch|中文)$/.test((k.textContent ?? '').trim()))
        knopf?.click()
      })
      await seite.waitForTimeout(1200)
      await seite.evaluate((zielSprache) => {
        const eintrag = [...document.querySelectorAll('[role="menuitem"],[role="option"]')]
          .find(e => (e.textContent ?? '').trim() === zielSprache)
        eintrag?.click()
      }, wunsch)
      await seite.waitForTimeout(2500)
      await seite.evaluate(() => {
        const k = [...document.querySelectorAll('button')]
          .find(e => /^(Schliessen|Close)$/.test((e.textContent ?? '').trim()))
        k?.click()
      })
      await seite.waitForTimeout(2000)

      const lang = await seite.evaluate(() => document.documentElement.lang)
      console.log(`  Sprache der Seite: ${lang}${lang === (sprache.startsWith('de') ? 'de' : 'en') ? ' (richtig)' : ' — erwartet ' + (sprache.startsWith('de') ? 'de' : 'en')}`)

      // ── 1. „Neue Session" linksbündig ─────────────────────────────────────
      const knopf = await seite.evaluate((fn) => {
        const messen = new Function('return ' + fn)()
        const seite = document.querySelector('[data-slot="sidebar"]')
        const kandidat = [...seite.querySelectorAll('button')]
          .find(b => b.querySelector('span > span:has(> svg):has(> span)'))
        if (kandidat === undefined) return null
        const innen = kandidat.querySelector('span > span:has(> svg):has(> span)')
        return {
          text: (kandidat.textContent ?? '').trim().slice(0, 30),
          justify: getComputedStyle(innen).justifyContent,
          ...messen(innen),
        }
      }, AUSRICHTUNG)

      if (knopf === null) {
        melden(beanstandungen, `${kurz}: der „Neue Session"-Knopf wurde nicht gefunden`)
      } else if (knopf.justify === 'flex-start') {
        console.log(`  ✓ „${knopf.text}" ist linksbündig (justify-content: flex-start, Luft links ${knopf.links} px)`)
      } else {
        melden(beanstandungen, `${kurz}: „${knopf.text}" ist NICHT linksbündig (${knopf.justify})`)
      }

      // ── 2. „Community" linksbündig ────────────────────────────────────────
      const gemeinde = await seite.evaluate((fn) => {
        const messen = new Function('return ' + fn)()
        const a = [...document.querySelectorAll('a')].find(e => /community/i.test(e.getAttribute('href') ?? ''))
        if (a === undefined) return null
        return { justify: getComputedStyle(a).justifyContent, ...messen(a) }
      }, AUSRICHTUNG)

      if (gemeinde === null) {
        melden(beanstandungen, `${kurz}: der Gemeinde-Knopf wurde nicht gefunden`)
      } else if (gemeinde.justify === 'flex-start') {
        console.log(`  ✓ „Community" ist linksbündig (Luft links ${gemeinde.links} px, rechts ${gemeinde.rechts} px)`)
      } else {
        melden(beanstandungen, `${kurz}: „Community" ist NICHT linksbündig (${gemeinde.justify})`)
      }

      // ── 3. Der Schriftzug mit Gedankenstrichen ────────────────────────────
      //
      // **Der Text enthält KEINE Leerzeichen zwischen den Buchstaben.** Die
      // Sperrung macht `letter-spacing` im CSS (`.34em`); der Text selbst lautet
      // „- Werkstatt -". Ein Muster, das gesperrte Buchstaben erwartet, prüft
      // die Darstellung statt des Inhalts — und meldete hier zu Recht nichts.
      // Geprüft wird deshalb der Inhalt: zwei Gedankenstriche, einer vorn, einer
      // hinten, und „Werkstatt" dazwischen.
      const schriftzug = await seite.evaluate(() => {
        const el = document.querySelector('[data-slot="sidebar.brand.name"]')
        if (el === null) return null
        // **Die beiden Textzeilen einzeln lesen.** `innerText` fügt sie ohne
        // Trenner zusammen („PROMPTHEUS- Werkstatt -") — der Schriftzug ist aber
        // ein Stapel aus zwei Zeilen. Gesucht sind die Blätter des Stapels.
        const blaetter = [...el.querySelectorAll('span')]
          .filter(s => s.children.length === 0 && (s.textContent ?? '').trim() !== '')
        const zeilen = blaetter.map(s => (s.textContent ?? '').trim())
        const zweite = blaetter[1]
        return {
          zeilen,
          zweite: zeilen[1] ?? '',
          sperrung: zweite ? getComputedStyle(zweite).letterSpacing : '—',
          grossschreibung: zweite ? getComputedStyle(zweite).textTransform : '—',
        }
      })

      if (schriftzug === null) {
        melden(beanstandungen, 'der Schriftzug wurde nicht gefunden')
      } else if (/^-\s*Werkstatt\s*-$/.test(schriftzug.zweite)
        && schriftzug.grossschreibung === 'uppercase') {
        console.log(`  ✓ Der Schriftzug: „${schriftzug.zeilen.join('" / "')}"`
          + ` (gesperrt ${schriftzug.sperrung}, ${schriftzug.grossschreibung})`)
      } else {
        melden(beanstandungen,
          `der Schriftzug lautet „${schriftzug.zeilen.join(' / ')}" — erwartet „PROMPTHEUS / - Werkstatt -"`)
      }

      // ── 4. Der Hero-Titel ─────────────────────────────────────────────────
      // Dazu einen neuen Chat beginnen — sonst gibt es keinen Hero.
      await seite.evaluate(() => {
        const k = [...document.querySelectorAll('button')]
          .find(b => /neue session|new session/i.test(b.getAttribute('aria-label') ?? ''))
        k?.click()
      })
      await seite.waitForTimeout(4000)

      const titel = await seite.evaluate(() => {
        // Die Titelgruppe ist die Kopfzeile des Heros. Gesucht wird die Zelle,
        // in der Titel und Vorschau-Abzeichen stehen — nicht über eine Position,
        // die sich beim Umbau des Harness verschiebt.
        const marke = document.querySelector('[data-slot="conversation.hero.brand.mark"]')
        if (marke === null) return { gefunden: false, text: document.body.innerText.slice(0, 200) }
        const kopfzeile = marke.parentElement?.parentElement
        if (kopfzeile === null || kopfzeile === undefined) return { gefunden: false, text: '' }
        const gruppe = kopfzeile.lastElementChild
        if (gruppe === null) return { gefunden: false, text: '' }
        // **Den sichtbaren Text lesen, samt `::before`.** Der eingefügte Text
        // steht NICHT in `textContent` — er kommt aus dem CSS. Ohne diesen Griff
        // sähe die Messung leer aus, obwohl auf dem Bildschirm etwas steht.
        const ausVorher = getComputedStyle(gruppe, '::before').content
        const ausText = [...gruppe.querySelectorAll('span')]
          .filter(s => getComputedStyle(s).display !== 'none')
          .map(s => (s.textContent ?? '').trim())
          .filter(t => t !== '')
        const vorher = ausVorher === 'none' || ausVorher === 'normal'
          ? []
          : [ausVorher.replace(/^"|"$/g, '')]
        return { gefunden: true, text: [...vorher, ...ausText].join(' · ') }
      })

      const erwartet = sprache.startsWith('de') ? 'Talente verdienen' : 'Earn Talent'
      if (!titel.gefunden) {
        melden(beanstandungen, `${kurz}: der Hero-Bereich wurde nicht gefunden`)
      } else if (titel.text.includes(erwartet)) {
        console.log(`  ✓ Der Hero-Titel lautet „${titel.text}"`)
      } else {
        melden(beanstandungen,
          `${kurz}: der Hero-Titel lautet „${titel.text}" — erwartet „${erwartet}…"`)
      }

      await seite.close()
      console.log('')
    }
  } finally {
    await browser.close()
  }

  if (beanstandungen.length === 0) {
    console.log('anpassungen_browser: BESTANDEN')
  } else {
    console.log(`anpassungen_browser: DURCHGEFALLEN (${beanstandungen.length} Beanstandung(en))`)
    process.exitCode = 1
  }
}

main().catch((fehler) => {
  console.error('anpassungen_browser: FEHLER')
  console.error(fehler)
  process.exitCode = 1
})
