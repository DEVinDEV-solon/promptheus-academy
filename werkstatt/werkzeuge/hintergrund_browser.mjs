/**
 * Prüft das Hintergrundbild der Chatseite im echten Browser.
 *
 * **Warum das kein Ersatz für die anderen Prüfungen ist.** `buendel_pruefen.mjs`
 * baut die Bausteine mit einem Gestell — ein Gestell bestätigt, dass nichts
 * abstürzt, nicht dass etwas WIRKT. Hier wird gemessen: Wird das Bild
 * ausgeliefert? Steht es auf der Chatfläche? Kommt es durch den Schleier
 * hindurch sichtbar an? Und bleibt Text lesbar?
 *
 * Aufruf:  node werkzeuge/hintergrund_browser.mjs [--url …]
 */

import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Wurzel dieses Werkzeugs (…/werkstatt). */
const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/** Wo die Harness-Installation liegt (dort liegt Playwright). */
const HARNESS = join(WURZEL, 'deepseek-harness')

/** Der Pfad, unter dem das Bild ausgeliefert werden soll. */
const BILD_PFAD = '/promptheus-hintergrund.jpg'

/**
 * Lädt Playwright aus der Ablage des Harness.
 *
 * Der Harness führt Playwright nicht als eigene Abhängigkeit; es liegt als
 * Beigabe in der pnpm-Ablage und ist von aussen nicht auflösbar. Deshalb suchen
 * statt raten — dasselbe Verfahren wie in `bauen.mjs` für esbuild.
 * @returns das Playwright-Modul.
 */
function playwrightLaden() {
  const require = createRequire(join(HARNESS, 'package.json'))
  const { readdirSync, existsSync } = require('node:fs')
  const ablage = join(HARNESS, 'node_modules', '.pnpm')
  for (const name of readdirSync(ablage).filter(n => /^playwright@\d/.test(n)).sort().reverse()) {
    const einstieg = join(ablage, name, 'node_modules', 'playwright', 'index.js')
    if (existsSync(einstieg)) return require(einstieg)
  }
  throw new Error('hintergrund_browser: Playwright nicht gefunden — „pnpm install" im Harness laufen lassen')
}

/**
 * Findet einen Browser zum Starten.
 *
 * Playwrights eigener Chromium ist nicht heruntergeladen, und ihn zu holen
 * hiesse, etwas aus dem Netz zu ziehen — wogegen BRAND.md §9 steht. Auf diesem
 * Rechner steht Chrome; der wird genommen.
 * @returns der Pfad zu einer ausführbaren Browserdatei.
 */
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

/** Führt die Prüfung durch. */
async function main() {
  const { chromium } = playwrightLaden()
  const stelle = process.argv.indexOf('--url')
  const ziel = stelle >= 0 ? process.argv[stelle + 1] : process.env.WERKSTATT_URL
  if (ziel === undefined) {
    console.error('hintergrund_browser: keine Adresse — --url … oder WERKSTATT_URL setzen')
    process.exitCode = 1
    return
  }

  console.log('hintergrund_browser: PROMPTHEUS Werkstatt')
  console.log(`Adresse ${ziel}`)
  console.log('')

  const beanstandungen = []
  const ausfuehrbar = browserFinden()
  const browser = await chromium.launch({
    headless: true,
    ...(ausfuehrbar !== undefined ? { executablePath: ausfuehrbar } : {}),
  })
  // Browsersprache deutsch: der Harness wählt seine Sprache daraus.
  const seite = await browser.newPage({ locale: 'de-DE' })
  const konsolenfehler = []
  seite.on('console', (m) => { if (m.type() === 'error') konsolenfehler.push(m.text()) })
  seite.on('pageerror', (e) => { konsolenfehler.push(`pageerror: ${e.message}`) })

  try {
    // ── 1. Wird das Bild ausgeliefert? ───────────────────────────────────────
    const antwort = await seite.request.get(new URL(BILD_PFAD, ziel).href)
    if (antwort.status() === 200) {
      const art = antwort.headers()['content-type'] ?? '(kein Typ)'
      const laenge = (await antwort.body()).length
      console.log(`  ✓ Das Bild wird ausgeliefert: ${art}, ${laenge} Bytes`)
      if (!art.startsWith('image/')) melden(beanstandungen, `falscher Inhaltstyp: ${art}`)
      if (laenge < 10000) melden(beanstandungen, `das Bild ist verdächtig klein: ${laenge} Bytes`)
    } else {
      melden(beanstandungen, `das Bild wird nicht ausgeliefert (HTTP ${antwort.status()})`)
      return
    }

    // ── 2. Wirkt es auf der Chatfläche? ──────────────────────────────────────
    await seite.goto(ziel, { waitUntil: 'load', timeout: 60000 })
    await seite.waitForSelector('#root', { timeout: 60000 })
    await seite.waitForTimeout(6000)

    const gemessen = await seite.evaluate(() => {
      // **Die Fläche mit Kasten, nicht der Steckplatz.** `main.conversation` ist
      // `display: contents` und hat keinen Kasten — ein Hintergrund darauf wirkt
      // nicht. Das Bild liegt auf seinem unmittelbaren Kind.
      const steckplatz = document.querySelector('[data-slot="main"] [data-slot="main.conversation"]')
      if (steckplatz === null) return { fehlt: true, grund: 'main.conversation fehlt' }
      const flaeche = steckplatz.firstElementChild
      if (flaeche === null) return { fehlt: true, grund: 'main.conversation hat kein Kind' }
      const st = getComputedStyle(flaeche)
      const r = flaeche.getBoundingClientRect()
      return {
        fehlt: false,
        klasse: typeof flaeche.className === 'string' ? flaeche.className.slice(0, 30) : '',
        groesse: `${Math.round(r.width)}x${Math.round(r.height)}`,
        hatBild: st.backgroundImage.includes('promptheus-hintergrund.jpg'),
        hintergrundBild: st.backgroundImage.slice(0, 140),
        grundfarbe: st.backgroundColor,
        // Hat der Steckplatz selbst einen Kasten? Wenn nicht, ist das die
        // Erklärung dafür, warum das Bild auf dem Kind liegen muss.
        steckplatzDisplay: getComputedStyle(steckplatz).display,
      }
    })

    if (gemessen.fehlt) {
      melden(beanstandungen, `die Chatfläche ist nicht auffindbar: ${gemessen.grund}`)
      return
    }
    if (gemessen.hatBild) {
      console.log(`  ✓ Die Chatfläche trägt das Bild (${gemessen.klasse}, ${gemessen.groesse})`)
    } else {
      melden(beanstandungen, `die Chatfläche trägt das Bild NICHT: ${gemessen.hintergrundBild}`)
    }
    if (gemessen.steckplatzDisplay === 'contents') {
      console.log('  ✓ Der Steckplatz ist display:contents — das Bild liegt richtig auf dem Kind')
    } else {
      console.log(`    Hinweis: der Steckplatz ist „${gemessen.steckplatzDisplay}" — das Bild könnte auch dort liegen`)
    }
    if (/^0x0$/.test(gemessen.groesse)) {
      melden(beanstandungen, 'die gemessene Fläche ist 0x0 px — sie kann nichts zeigen')
    }

    // ── 3. Kommt das Bild sichtbar an? ───────────────────────────────────────
    //
    // Ein Bild in der Fläche zu haben heisst nicht, dass man es SIEHT. Geprüft
    // wird deshalb, ob sich die Bildpunkte auf dem Schirm vom reinen Grundton
    // unterscheiden. Der Schleier lässt nur 25 % durch — die Abweichung ist
    // klein, aber sie muss messbar sein.
    const sichtbar = await seite.evaluate(() => {
      const flaeche = document.querySelector('[data-slot="main"] [data-slot="main.conversation"]')?.firstElementChild
      if (flaeche === null || flaeche === undefined) return { punkte: [], grund: '' }
      const r = flaeche.getBoundingClientRect()
      // Ein Streifen quer über die Fläche, ohne Bedienelemente zu treffen.
      const y = Math.round(r.top + r.height * 0.5)
      const punkte = []
      for (let i = 1; i <= 8; i += 1) {
        punkte.push([Math.round(r.left + (r.width * i) / 9), y])
      }
      // Der Grundton, gegen den verglichen wird.
      const grund = getComputedStyle(document.body).backgroundColor
      return { punkte, grund }
    })

    // Bildschirmfoto machen und die Punkte daraus auslesen. Ein Bild in der
    // Fläche zu haben heisst nicht, dass man es SIEHT — der Schleier lässt nur
    // 25 % durch, die Abweichung ist klein, aber sie muss messbar sein.
    const foto = await seite.screenshot({ type: 'png' })
    const farben = await seite.evaluate(async ({ datenUrl, punkte }) => {
      const bild = new Image()
      await new Promise((fertig) => { bild.onload = fertig; bild.src = datenUrl })
      const leinwand = document.createElement('canvas')
      leinwand.width = bild.width
      leinwand.height = bild.height
      const stift = leinwand.getContext('2d')
      stift.drawImage(bild, 0, 0)
      const aus = []
      for (const [x, y] of punkte) {
        const d = stift.getImageData(x, y, 1, 1).data
        aus.push(`${d[0]},${d[1]},${d[2]}`)
      }
      return aus
    }, { datenUrl: `data:image/png;base64,${foto.toString('base64')}`, punkte: sichtbar.punkte })

    const verschiedene = new Set(farben)
    const grundton = sichtbar.grund.replace(/[^\d,]/g, '').split(',').slice(0, 3).join(',')
    const alleGleichGrund = farben.every(f => f === grundton)
    console.log(`    Bildpunkte auf der Fläche: ${farben.join(' | ')}`)
    console.log(`    Grundton: ${grundton}`)
    if (alleGleichGrund) {
      melden(beanstandungen, 'die Fläche ist überall der reine Grundton — das Bild ist NICHT zu sehen')
    } else if (verschiedene.size === 1) {
      melden(beanstandungen, 'die Fläche zeigt überall dieselbe Farbe — das Bild wirkt nicht')
    } else {
      console.log(`  ✓ Das Bild ist zu sehen: ${verschiedene.size} verschiedene Farbwerte über die Fläche`)
    }

    // ── 4. Die Konsole ───────────────────────────────────────────────────────
    const echte = konsolenfehler.filter(f => !/favicon|404|Failed to load resource/i.test(f))
    if (echte.length === 0) console.log('  ✓ keine Fehler in der Konsole')
    else for (const f of echte.slice(0, 5)) melden(beanstandungen, `Konsole: ${f}`)
  } finally {
    await browser.close()
  }

  console.log('')
  if (beanstandungen.length === 0) {
    console.log('hintergrund_browser: BESTANDEN')
  } else {
    console.log(`hintergrund_browser: DURCHGEFALLEN (${beanstandungen.length} Beanstandung(en))`)
    process.exitCode = 1
  }
}

main().catch((fehler) => {
  console.error('hintergrund_browser: FEHLER')
  console.error(fehler)
  process.exitCode = 1
})
