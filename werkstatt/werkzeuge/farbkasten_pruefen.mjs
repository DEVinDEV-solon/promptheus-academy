/**
 * PROMPTHEUS Werkstatt — Prüfung des Farbkastens.
 *
 * Zwei Dinge, die schiefgehen können und die man am Bildschirm erst spät merkt:
 *
 * **1. Die Partner-Regel.** Eine Palette ist hell ODER dunkel — das ist keine
 * zweite Einstellung (`srv/varianten.php`). Wird eine dunkle Palette gewählt
 * und der Hell/Dunkel-Knopf gedrückt, muss die Oberfläche zur *hellen*
 * Partnerpalette wechseln, nicht zu einer aufgehellten Fassung derselben. Sonst
 * stünde Schrift auf Schrift.
 *
 * **2. Der Gleichlauf von Schalter und Anzeige.** Der Harness hat einen
 * Hell/Dunkel-Schalter, der Farbkasten sechs Paletten. Das sind zwei
 * Bedienungen für eine Sache — und daraus entsteht leicht ein Widerspruch: man
 * wählt Terrakotta, drückt „hell", und im Farbkasten steht weiter Terrakotta,
 * während der Bildschirm Pergament zeigt. Wer das nicht nachrechnet, merkt es
 * nie, weil beide Ansichten für sich plausibel aussehen.
 *
 * **Warum die Partner-Regel in `varianten.php` nicht reziprok ist.**
 * `pergament.partner` zeigt auf `schmiede`, aber `terrakotta.partner` zeigt
 * ebenfalls auf `pergament` — und `pergament` zeigt nicht zurück auf
 * `terrakotta`. Das ist Absicht: die hellen Paletten sind die Ziele, die dunklen
 * die Ausgänge. Deshalb wird hier NICHT „Partner zeigt zurück" geprüft (das wäre
 * falsch), sondern was wirklich gelten muss: **die wirksame Palette liegt auf
 * dem gefragten Grundton, und ihre Grundfarbe bestätigt ihn.**
 *
 * Aufruf:  node werkzeuge/farbkasten_pruefen.mjs
 */

import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Wurzel dieses Werkzeugs (…/werkstatt). */
const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/** Die Quelldatei mit den Paletten. */
const PALETTEN_QUELLE = join(
  WURZEL, 'pakete', 'dsh-client-ui-promptheus', 'src', 'client', 'paletten.ts')

/**
 * Zerlegt eine Farbe in ihre drei Kanäle (0–255).
 * @param farbe - ein Hexwert wie `#14110f`.
 * @returns die drei Kanäle.
 */
function kanaele(farbe) {
  const hex = farbe.replace('#', '')
  return [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16),
  ]
}

/**
 * Die relative Leuchtdichte nach WCAG 2.1 — dieselbe Rechnung wie im Harness.
 * @param farbe - ein Hexwert.
 * @returns die Leuchtdichte zwischen 0 und 1.
 */
function leuchtdichte(farbe) {
  const [r, g, b] = kanaele(farbe).map((wert) => {
    const anteil = wert / 255
    return anteil <= 0.03928 ? anteil / 12.92 : ((anteil + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Liest die Paletten aus der Quelldatei.
 * @returns je Palette Kennung, Grundton, Partner und die Grundfarbe.
 */
function palettenLaden() {
  const quelle = readFileSync(PALETTEN_QUELLE, 'utf8')

  // Die Farbblöcke: `export const SCHMIEDE: Palettenfarben = { … }`.
  const farben = {}
  for (const block of quelle.matchAll(/export const ([A-Z_]+): Palettenfarben = \{([\s\S]*?)\n\}/g)) {
    const werte = {}
    for (const zeile of block[2].split('\n')) {
      const treffer = zeile.match(/^\s*'?([a-zA-Z][a-zA-Z0-9-]*)'?\s*:\s*'(#[0-9a-fA-F]{6})'/)
      if (treffer !== null) werte[treffer[1]] = treffer[2]
    }
    if (Object.keys(werte).length >= 13) farben[block[1]] = werte
  }

  // Die Liste, die alles führt: Kennung, Grundton, Partner, Farbkonstante.
  const liste = []
  for (const treffer of quelle.matchAll(
    /kennung: '(\w+)',[\s\S]*?grundton: '(\w+)',\s*partner: '(\w+)',\s*farben: ([A-Z_]+),/g)) {
    const [, kennung, grundton, partner, konstante] = treffer
    const werte = farben[konstante]
    if (werte === undefined) throw new Error(`farbkasten_pruefen: ${konstante} hat keinen Farbblock`)
    liste.push({ kennung, grundton, partner, grund: werte.grund })
  }
  return liste
}

/**
 * Die wirksame Palette — dieselbe Regel wie `wirksam()` im Paket.
 *
 * Liegt die gewählte Palette auf dem gefragten Grundton, gilt sie selbst; sonst
 * gilt ihr Partner.
 * @param liste - alle Paletten.
 * @param kennung - die gewählte Kennung.
 * @param ton - der Grundton, der gerade gilt.
 * @returns die wirksame Kennung.
 */
function wirksam(liste, kennung, ton) {
  const gewaehlt = liste.find(p => p.kennung === kennung)
  if (gewaehlt === undefined) return undefined
  return gewaehlt.grundton === ton ? gewaehlt.kennung : gewaehlt.partner
}

/** Prüft die Partner-Regel und den Gleichlauf. */
function main() {
  const liste = palettenLaden()
  if (liste.length === 0) {
    console.error('farbkasten_pruefen: keine Palette in paletten.ts gefunden')
    process.exitCode = 1
    return
  }

  console.log('farbkasten_pruefen: PROMPTHEUS Werkstatt')
  console.log(`${liste.length} Paletten`)
  console.log('')

  let fehler = 0
  let pruefungen = 0

  // ── Der Aufbau jeder Palette ───────────────────────────────────────────────
  console.log('  Aufbau')
  for (const p of liste) {
    const gemessen = leuchtdichte(p.grund) > 0.5 ? 'hell' : 'dunkel'
    const tonOk = gemessen === p.grundton
    const partner = liste.find(x => x.kennung === p.partner)
    const partnerDa = partner !== undefined
    const partnerAnders = partnerDa && partner.grundton !== p.grundton
    const ok = tonOk && partnerDa && partnerAnders
    if (!ok) fehler += 1
    pruefungen += 1
    console.log(`    ${ok ? '✓' : '✗'} ${p.kennung.padEnd(11)} ${p.grundton.padEnd(7)}`
      + `  Partner ${String(p.partner).padEnd(11)}`
      + `  ${tonOk ? 'Grundton bestätigt' : 'GRUNDTON WIDERSPRICHT DER GRUNDFARBE'}`
      + `${partnerDa ? '' : '  PARTNER FEHLT'}`
      + `${partnerDa && !partnerAnders ? '  PARTNER AUF DERSELBEN SEITE' : ''}`)
  }
  console.log('')

  // ── Der Gleichlauf: jeder Schalterstand, jede Wahl ─────────────────────────
  console.log('  Gleichlauf von Schalter und Anzeige')
  for (const p of liste) {
    for (const ton of ['hell', 'dunkel']) {
      pruefungen += 1
      const w = wirksam(liste, p.kennung, ton)
      const wirksame = liste.find(x => x.kennung === w)
      if (wirksame === undefined) {
        fehler += 1
        console.log(`    ✗ ${p.kennung} / ${ton}: keine wirksame Palette`)
        continue
      }
      // Die drei Regeln, die wirklich gelten müssen.
      const aufDemTon = wirksame.grundton === ton
      const farbeBestaetigt = (leuchtdichte(wirksame.grund) > 0.5 ? 'hell' : 'dunkel') === ton
      const richtigeRegel = w === (p.grundton === ton ? p.kennung : p.partner)
      const ok = aufDemTon && farbeBestaetigt && richtigeRegel
      if (!ok) fehler += 1
      console.log(`    ${ok ? '✓' : '✗'} Wahl ${p.kennung.padEnd(11)} Schalter ${ton.padEnd(7)}`
        + ` → ${String(w).padEnd(11)}`
        + `${aufDemTon ? '' : '  FALSCHE SEITE'}`
        + `${farbeBestaetigt ? '' : '  GRUNDFARBE WIDERSPRICHT'}`
        + `${richtigeRegel ? '' : '  REGEL VERLETZT'}`)
    }
  }
  console.log('')

  // ── Erreichbarkeit ─────────────────────────────────────────────────────────
  //
  // **Die Prüfung, die zählt.** Eine Palette im Farbkasten kann auf zwei Wegen
  // auf den Bildschirm kommen: man wählt sie selbst, oder sie ist der Partner
  // einer gewählten. Eine Palette, die auf keinem der beiden Wege erscheint,
  // ist ein toter Eintrag — sie steht im Kasten und lässt sich doch nicht
  // herbeiführen. Das fällt beim Anklicken nicht auf, weil man immer nur die
  // Paletten prüft, die man gerade sieht.
  const erreichbar = new Set()
  for (const p of liste) {
    for (const ton of ['hell', 'dunkel']) {
      const w = wirksam(liste, p.kennung, ton)
      if (w !== undefined) erreichbar.add(w)
    }
  }
  const tote = liste.filter(p => !erreichbar.has(p.kennung)).map(p => p.kennung)
  const alleErreichbar = tote.length === 0
  if (!alleErreichbar) fehler += 1
  pruefungen += 1
  console.log(`  ${alleErreichbar ? '✓' : '✗'} ${erreichbar.size} von ${liste.length} Paletten erreichbar`
    + `${alleErreichbar ? '' : `  — nicht erreichbar: ${tote.join(', ')}`}`)

  // Und die Gegenprobe zum Aufbau: eine dunkle Palette darf nie auf der hellen
  // Seite erscheinen. Das ist die Regel, die im Academy-Programm einmal
  // verletzt war und dort zu unlesbarer Schrift führte.
  const dunkelAufHell = []
  for (const p of liste) {
    const w = wirksam(liste, p.kennung, 'hell')
    const wirksame = liste.find(x => x.kennung === w)
    if (wirksame !== undefined && wirksame.grundton !== 'hell') dunkelAufHell.push(`${p.kennung}→${w}`)
  }
  const sauber = dunkelAufHell.length === 0
  if (!sauber) fehler += 1
  pruefungen += 1
  console.log(`  ${sauber ? '✓' : '✗'} keine dunkle Palette auf der hellen Seite`
    + `${sauber ? '' : `  — ${dunkelAufHell.join(', ')}`}`)

  console.log('')
  console.log(`farbkasten_pruefen: ${pruefungen} Prüfungen, ${fehler} Fehler`)
  if (fehler === 0) {
    console.log('farbkasten_pruefen: BESTANDEN')
  } else {
    console.log('farbkasten_pruefen: DURCHGEFALLEN')
    process.exitCode = 1
  }
}

main()
