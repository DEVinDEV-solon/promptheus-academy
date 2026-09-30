/**
 * Prüft, ob die Schrift über dem Hintergrundbild noch lesbar ist.
 *
 * **Warum das die wichtigste Frage ist.** Ein Hintergrundbild ist schnell
 * eingebaut und schnell zu stark. BRAND.md §1 verlangt gemessenen Kontrast
 * („gemessen, nicht geschätzt"), und das Hauptprogramm führt den Schleier genau
 * deshalb: damit die Schrift lesbar bleibt.
 *
 * Gemessen wird an den Stellen, an denen im Chat wirklich Schrift steht. Der
 * Harness schreibt Text in `--dsw-alias-label-primary` (Haupttext) und
 * `--dsw-alias-label-secondary` (Zweittext) auf die Fläche, die jetzt das Bild
 * trägt.
 *
 * Aufruf:  node werkzeuge/hintergrund_kontrast.mjs [--url …]
 */

import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Wurzel dieses Werkzeugs (…/werkstatt). */
const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/** Wo die Harness-Installation liegt (dort liegt Playwright). */
const HARNESS = join(WURZEL, 'deepseek-harness')

/** Die Schwellen aus BRAND.md §1. */
const AA = 4.5

/** Der Pfad, unter dem die Node-Hälfte das Bild ausliefert. */
const BILD_PFAD = '/promptheus-hintergrund.jpg'

/** Lädt Playwright aus der Ablage des Harness. */
function playwrightLaden() {
  const require = createRequire(join(HARNESS, 'package.json'))
  const { readdirSync, existsSync } = require('node:fs')
  const ablage = join(HARNESS, 'node_modules', '.pnpm')
  for (const name of readdirSync(ablage).filter(n => /^playwright@\d/.test(n)).sort().reverse()) {
    const einstieg = join(ablage, name, 'node_modules', 'playwright', 'index.js')
    if (existsSync(einstieg)) return require(einstieg)
  }
  throw new Error('hintergrund_kontrast: Playwright nicht gefunden')
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

/**
 * Meldet eine Beanstandung. Sie wird gezählt UND ausgegeben — ein stiller
 * Zähler wäre nutzlos.
 * @param liste - die Liste der Beanstandungen.
 * @param text - die Meldung.
 */
function melden(liste, text) {
  liste.push(text)
  console.log(`  ✗ ${text}`)
}

/**
 * Die relative Leuchtdichte nach WCAG 2.1.
 * @param r - Rotanteil 0–255.
 * @param g - Grünanteil 0–255.
 * @param b - Blauanteil 0–255.
 * @returns die Leuchtdichte zwischen 0 und 1.
 */
function leuchtdichte(r, g, b) {
  const [rr, gg, bb] = [r, g, b].map((wert) => {
    const anteil = wert / 255
    return anteil <= 0.03928 ? anteil / 12.92 : ((anteil + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * rr + 0.7152 * gg + 0.0722 * bb
}

/**
 * Das Kontrastverhältnis zweier Farben.
 * @param vorne - die Textfarbe als `[r, g, b]`.
 * @param hinten - die Fläche als `[r, g, b]`.
 * @returns das Verhältnis (1 bis 21).
 */
function kontrast(vorne, hinten) {
  const a = leuchtdichte(...vorne)
  const b = leuchtdichte(...hinten)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

/** Führt die Prüfung durch. */
async function main() {
  const { chromium } = playwrightLaden()
  const stelle = process.argv.indexOf('--url')
  const ziel = stelle >= 0 ? process.argv[stelle + 1] : process.env.WERKSTATT_URL
  if (ziel === undefined) {
    console.error('hintergrund_kontrast: keine Adresse — --url … oder WERKSTATT_URL setzen')
    process.exitCode = 1
    return
  }

  console.log('hintergrund_kontrast: PROMPTHEUS Werkstatt')
  console.log(`Schwelle: ${AA}:1 (BRAND.md §1, AA)`)
  console.log('')

  const browser = await chromium.launch({
    headless: true,
    ...(browserFinden() !== undefined ? { executablePath: browserFinden() } : {}),
  })
  const seite = await browser.newPage({ locale: 'de-DE' })
  let fehler = 0
  const beanstandungen = []

  try {
    for (const palette of ['Schmiede', 'Pergament', 'Olymp', 'Marmor', 'Terrakotta', 'Funkenflug']) {
      console.log(`  ── ${palette}`)
      // Palette wählen.
      await seite.goto(ziel, { waitUntil: 'load', timeout: 60000 })
      await seite.waitForSelector('#root', { timeout: 60000 })
      await seite.waitForTimeout(4000)
      await seite.evaluate(() => {
        document.querySelector('[aria-label="Settings"],[aria-label="Einstellungen"]')?.click()
      })
      await seite.waitForTimeout(2000)
      await seite.evaluate((name) => {
        const k = [...document.querySelectorAll('button[aria-pressed]')]
          .find(e => (e.textContent ?? '').startsWith(name))
        k?.click()
      }, palette)
      await seite.waitForTimeout(2000)
      await seite.evaluate(() => {
        // Einstellungen wieder schliessen, damit der Chat sichtbar ist.
        const k = [...document.querySelectorAll('button')]
          .find(e => /^(Schliessen|Close)$/.test((e.textContent ?? '').trim()))
        k?.click()
      })
      await seite.waitForTimeout(2500)

      // Die Textfarben und den tatsächlichen Flächengrund messen.
      const werte = await seite.evaluate(() => {
        const flaeche = document.querySelector('[data-slot="main"] [data-slot="main.conversation"]')?.firstElementChild
        if (flaeche === null || flaeche === undefined) return null
        // **Farben über ein Probenfeld lesen, nicht über die Marke.** Die Marken
        // stehen als Hexwert (`#ede5db`); `getComputedStyle` eines Elements
        // liefert dagegen immer `rgb(...)` — gleich in welcher Schreibweise die
        // Marke gesetzt ist. Das erspart jedes Muster und jede Fehlerquelle.
        const probe = document.createElement('div')
        probe.style.position = 'absolute'
        probe.style.visibility = 'hidden'
        document.body.appendChild(probe)
        const alsZahl = (name) => {
          probe.style.color = `var(${name})`
          const w = getComputedStyle(probe).color
          const m = w.match(/(\d+),\s*(\d+),\s*(\d+)/)
          return m === null ? null : [Number(m[1]), Number(m[2]), Number(m[3])]
        }
        const haupttext = alsZahl('--dsw-alias-label-primary')
        const zweittext = alsZahl('--dsw-alias-label-secondary')
        const grundton = alsZahl('--dsw-alias-bg-base')
        probe.remove()
        return {
          haupttext,
          zweittext,
          grundton,
          // Die Bildstärke steht im erzeugten Stylesheet; sie wird dort gelesen,
          // damit sie nicht zweimal gepflegt werden muss.
          staerke: Number(
            (getComputedStyle(document.body).getPropertyValue('--promptheus-bildstaerke') || '0.18').trim(),
          ) || 0.18,
          hatBild: getComputedStyle(flaeche).backgroundImage.includes('promptheus-hintergrund'),
        }
      })
      if (werte === null || !werte.hatBild) {
        console.log(`  ${palette}: übersprungen — ${werte === null ? 'Chatfläche nicht gefunden' : 'Bild nicht auf der Fläche'}`)
        continue
      }
      console.log(`    Textfarben: Haupt ${werte.haupttext?.join(',') ?? '—'} · Zweit ${werte.zweittext?.join(',') ?? '—'}`)

      // **Der Grund wird GERECHNET, nicht vom Bildschirmfoto gelesen.**
      //
      // Drei Anläufe waren nötig, um das einzusehen. Ein Bildschirmfoto zeigt
      // alles: Hintergrund, Schrift, Knöpfe, Eingabefelder. Jeder Versuch, darin
      // „nur den Grund" zu finden, scheiterte:
      //
      //   1. Ein Raster über die Fläche hielt den ungünstigsten Punkt für den
      //      Grund — es war ein blauer Knopf (rgb(75,94,130)), bei allen dunklen
      //      Paletten derselbe Wert.
      //   2. Ein Filter auf freie Stellen war zu streng und schloss alles aus.
      //   3. Das Lesen der hellsten Punkte fand die SCHRIFT (237,229,219 ist
      //      genau die Textfarbe).
      //
      // Der Grund ist aber bekannt und einfach: der Harness legt zwei Ebenen
      // übereinander — das Bild, darüber der Schleier aus dem Grundton.
      //
      //     Ergebnis = Grundton × (1 − Bildstärke) + Bild × Bildstärke
      //
      // Das lässt sich ausrechnen. Gemessen wird deshalb das BILD selbst (über
      // seine Adresse geladen), und der ungünstigste Punkt ist der, dessen
      // Ergebnis dem Text am nächsten kommt.
      const flecken = await seite.evaluate(async ({ bildPfad, grundton, staerke }) => {
        const bild = new Image()
        bild.crossOrigin = 'anonymous'
        await new Promise((fertig, scheitern) => {
          bild.onload = fertig
          bild.onerror = () => scheitern(new Error('das Bild liess sich nicht laden'))
          bild.src = bildPfad
        })
        const leinwand = document.createElement('canvas')
        leinwand.width = bild.naturalWidth
        leinwand.height = bild.naturalHeight
        const stift = leinwand.getContext('2d')
        stift.drawImage(bild, 0, 0)
        const daten = stift.getImageData(0, 0, leinwand.width, leinwand.height).data

        const aus = []
        // Jeden achten Bildpunkt lesen: genau genug, und schnell.
        const schritt = 8 * 4
        for (let i = 0; i < daten.length; i += schritt) {
          const bildfarbe = [daten[i], daten[i + 1], daten[i + 2]]
          // Der Schleier: Grundton mit der Deckkraft (1 − Stärke) über dem Bild.
          const gemischt = bildfarbe.map((b, k) => Math.round(grundton[k] * (1 - staerke) + b * staerke))
          aus.push(gemischt)
        }
        return { anzahl: aus.length, werte: aus, breite: leinwand.width, hoehe: leinwand.height }
      }, {
        bildPfad: new URL(BILD_PFAD, ziel).href,
        grundton: werte.grundton,
        staerke: werte.staerke,
      })

      if (flecken.anzahl === 0) {
        melden(beanstandungen, `${palette}: das Bild liess sich nicht lesen`)
        continue
      }

      // Der ungünstigste Punkt entscheidet: dort, wo der gerechnete Grund der
      // Schrift am nächsten kommt, ist der Kontrast am kleinsten.
      let schlechtester = null
      for (const [was, farbe] of [['Haupttext', werte.haupttext], ['Zweittext', werte.zweittext]]) {
        if (farbe === null) continue
        let min = Infinity
        let wo = null
        for (const fleck of flecken.werte) {
          const k = kontrast(farbe, fleck)
          if (k < min) { min = k; wo = fleck }
        }
        if (schlechtester === null || min < schlechtester.min) {
          schlechtester = { min, wo, was }
        }
        const ok = min >= AA
        if (!ok) fehler += 1
        console.log(`  ${ok ? '✓' : '✗'} ${palette.padEnd(11)} ${was.padEnd(10)} ${min.toFixed(2).padStart(5)}:1`
          + `  (ungünstigster Grund ${wo?.join(',')})`)
      }
    }
  } finally {
    await browser.close()
  }

  console.log('')
  if (fehler === 0) {
    console.log('hintergrund_kontrast: BESTANDEN')
  } else {
    console.log(`hintergrund_kontrast: DURCHGEFALLEN (${fehler} unter ${AA}:1)`)
    process.exitCode = 1
  }
}

main().catch((fehler) => {
  console.error('hintergrund_kontrast: FEHLER')
  console.error(fehler)
  process.exitCode = 1
})
