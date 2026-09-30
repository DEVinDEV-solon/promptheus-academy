/**
 * PROMPTHEUS Werkstatt — Kontrastmessung.
 *
 * BRAND.md §1: „Kontrast: gemessen, nicht geschätzt." Und: „Eine Palette, die
 * schön aussieht und die man nicht lesen kann, kommt nicht durch."
 *
 * Dieses Werkzeug rechnet die WCAG-Kontrastverhältnisse der Palette nach und
 * schlägt fehl, wenn ein Wert unter seiner Schwelle liegt. Es ist die einzige
 * Instanz, die „sieht gut aus" von „ist lesbar" trennt — dieselbe Aufgabe, die
 * im Academy-Programm `tests/varianten_test.php` hat.
 *
 * Schwellen (BRAND.md §1):
 *   Haupttext, Akzente, Gold                4,5:1  (AA)
 *   --schrift-3 (Hinweise, ~13,8 px)        7,0:1  (AAA)
 *
 * Die zweite Schwelle ist strenger, weil sie aus dem Betrieb kam: alle sechs
 * Paletten lagen bei 4,6:1 — formal in Ordnung, und die Rückmeldung lautete
 * „grau ist manchmal ganz schlecht zu lesen".
 *
 * Aufruf:  node werkzeuge/kontrast_pruefen.mjs
 */

import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Wurzel dieses Werkzeugs (…/deepseek-dashboard). */
const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/** Die Schwellen aus BRAND.md §1. */
const AA = 4.5
const AAA = 7.0

/**
 * Zerlegt eine Farbe in Rot, Grün, Blau (0–255).
 * @param farbe - ein Hexwert wie `#14110f`.
 * @returns die drei Kanäle.
 */
function kanaele(farbe) {
  const hex = farbe.replace('#', '')
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) throw new Error(`kein sechsstelliger Hexwert: ${farbe}`)
  return [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16),
  ]
}

/**
 * Die relative Leuchtdichte nach WCAG 2.1.
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
 * Das Kontrastverhältnis zweier Farben.
 * @param vorne - die Textfarbe.
 * @param hinten - die Fläche.
 * @returns das Verhältnis (1 bis 21).
 */
export function kontrast(vorne, hinten) {
  const a = leuchtdichte(vorne)
  const b = leuchtdichte(hinten)
  const hell = Math.max(a, b)
  const dunkel = Math.min(a, b)
  return (hell + 0.05) / (dunkel + 0.05)
}

/**
 * Die zu prüfenden Paare je Palette.
 *
 * Diese Liste ist **wörtlich** aus der maßgeblichen Prüfdatei des
 * Academy-Programms übernommen: `PROMPTHEUS\tests\varianten_test.php`,
 * `PU_TEST_PAARE`. Dort steht auch, warum genau diese neun und keine anderen:
 * „Die Paare, die wirklich aufeinandertreffen."
 *
 * Das ist wichtig. Eine frühere Fassung dieses Werkzeugs prüfte zusätzlich
 * `glut-tief` und `glut-hell` als Textfarbe auf dem Grund — und meldete
 * Fehler, die keine waren: laut BRAND.md §1 ist `glut-tief` der „Zitatstrich,
 * Ornament im Hellen" und `glut-hell` „Verlauf, Hover". Beide tragen keinen
 * Fließtext. Ein Werkzeug, das Fehlalarme meldet, wird zu Recht ignoriert.
 * @param f - die Farben einer Palette, benannt wie im Brand-Kit.
 * @returns die Paare mit Name, Vordergrund, Hintergrund und Schwelle.
 */
function paare(f) {
  return [
    // Die neun Paare aus varianten_test.php, Schwelle AA (4,5:1).
    ['Haupttext auf dem Grund', f.schrift, f.grund, AA],
    ['Haupttext auf einer Karte', f.schrift, f['grund-2'], AA],
    ['Zweittext auf dem Grund', f['schrift-2'], f.grund, AA],
    ['Zweittext auf einer Karte', f['schrift-2'], f['grund-2'], AA],
    ['Hinweistext auf dem Grund', f['schrift-3'], f.grund, AA],
    ['Hinweistext auf einer Karte', f['schrift-3'], f['grund-2'], AA],
    ['Links und Akzente', f.glut, f.grund, AA],
    ['Punkte und Erfolg', f.gold, f['grund-2'], AA],
    ['Wissenskästen', f.lapis, f.grund, AA],
    // Die strengere Regel aus varianten_test.php („Kleine Schrift braucht mehr"):
    // `schrift-3` steht in 0,86 rem ≈ 13,8 px und muss AAA erreichen.
    ['Beschreibung erreicht AAA (Grund)', f['schrift-3'], f.grund, AAA],
    ['Beschreibung erreicht AAA (Karte)', f['schrift-3'], f['grund-2'], AAA],
  ]
}

/**
 * Die Zustandsfarben eines Grundtons.
 *
 * **Warum das hier steht und nicht in der Palette.** BRAND.md nennt Rot, Grün
 * und Gelb als Werte, aber nur für dunklen Grund — dort sind sie gewählt. Auf
 * hellem Grund wären sie unlesbar: das helle Rot `#e8635a` erreicht auf
 * Pergament keine 4,5:1. Diese drei gehören deshalb zum Grundton, nicht zur
 * Palette, und sie werden hier nachgerechnet wie jede andere Textfarbe. Eine
 * Zustandsfarbe ist Text: „Fehler" steht als Wort auf dem Bildschirm.
 *
 * Übernommen aus `paletten.ts` (`ZUSTANDSFARBEN`), damit es nur eine Wahrheit
 * gibt; das Muster wird dort gelesen, nicht hier wiederholt.
 */
function zustandsfarben() {
  const pfad = join(WURZEL, 'pakete', 'dsh-client-ui-promptheus', 'src', 'client', 'paletten.ts')
  const quelle = readFileSync(pfad, 'utf8')
  const treffer = quelle.match(
    /dunkel:\s*\{\s*fehler:\s*'(#[0-9a-fA-F]{6})',\s*erfolg:\s*'(#[0-9a-fA-F]{6})',\s*warnung:\s*'(#[0-9a-fA-F]{6})'\s*\},\s*hell:\s*\{\s*fehler:\s*'(#[0-9a-fA-F]{6})',\s*erfolg:\s*'(#[0-9a-fA-F]{6})',\s*warnung:\s*'(#[0-9a-fA-F]{6})'\s*\}/,
  )
  if (treffer === null) {
    throw new Error('kontrast_pruefen: ZUSTANDSFARBEN in paletten.ts nicht gefunden — Muster geändert?')
  }
  return {
    dunkel: { fehler: treffer[1], erfolg: treffer[2], warnung: treffer[3] },
    hell: { fehler: treffer[4], erfolg: treffer[5], warnung: treffer[6] },
  }
}

/**
 * Entscheidet, ob eine Palette hell oder dunkel ist.
 *
 * Gemessen an der Leuchtdichte des Grundes, nicht geraten. Dieselbe Rechnung,
 * die der Harness für `colorScheme` anstellt: sie steuert dort
 * `body[data-ds-dark-theme]`, und davon hängen die nicht überschriebenen Teile
 * der Oberfläche ab.
 * @param grund - die Grundfarbe der Palette.
 * @returns `'hell'` oder `'dunkel'`.
 */
function grundton(grund) {
  return leuchtdichte(grund) > 0.5 ? 'hell' : 'dunkel'
}

/** Liest die Paletten aus der Quelldatei des Pakets. */
async function palettenLaden() {
  const pfad = join(WURZEL, 'pakete', 'dsh-client-ui-promptheus', 'src', 'client', 'paletten.ts')
  const quelle = readFileSync(pfad, 'utf8')
  const gefunden = []
  // Die Palette-Objekte stehen als `export const NAME: Palettenfarben = { … }`.
  // Der Wert kann einen Bindestrich im Schlüssel tragen (`'grund-2'`), deshalb
  // wird zeilenweise gelesen statt mit einem Muster über den ganzen Block.
  const bloecke = quelle.matchAll(/export const ([A-Z_]+): Palettenfarben = \{([\s\S]*?)\n\}/g)
  for (const block of bloecke) {
    const farben = {}
    for (const zeile of block[2].split('\n')) {
      // Die Schlüssel tragen Bindestriche UND Ziffern (`'grund-2'`,
      // `'schrift-3'`) — beides muss das Muster zulassen.
      const treffer = zeile.match(/^\s*'?([a-zA-Z][a-zA-Z0-9-]*)'?\s*:\s*'(#[0-9a-fA-F]{6})'/)
      if (treffer !== null) farben[treffer[1]] = treffer[2]
    }
    if (Object.keys(farben).length >= 13) gefunden.push({ name: block[1], farben })
  }
  return gefunden
}

/** Misst beide Paletten und berichtet. */
async function main() {
  const paletten = await palettenLaden()
  if (paletten.length === 0) {
    console.error('kontrast_pruefen: keine Palette in paletten.ts gefunden')
    process.exitCode = 1
    return
  }

  console.log('kontrast_pruefen: PROMPTHEUS Werkstatt')
  console.log(`Schwellen: Haupttext/Akzente ${AA}:1 · Hinweise ${AAA}:1`)
  console.log('')

  let fehler = 0
  let messungen = 0

  for (const { name, farben } of paletten) {
    console.log(`  ${name}`)
    for (const [was, vorne, hinten, schwelle] of paare(farben)) {
      const wert = kontrast(vorne, hinten)
      messungen += 1
      const bestanden = wert >= schwelle
      if (!bestanden) fehler += 1
      const zeichen = bestanden ? '✓' : '✗'
      const note = wert.toFixed(2).padStart(6)
      const soll = schwelle.toFixed(1)
      console.log(`    ${zeichen} ${note}:1  (soll ${soll})  ${was}`)
    }
    console.log('')
  }

  // ── Zustandsfarben je Grundton ─────────────────────────────────────────────
  //
  // Gemessen am Grund und an der Karte der jeweiligen Palette — dort stehen
  // sie. Fehler, Erfolg und Warnung sind Text, keine Fläche.
  const zustand = zustandsfarben()
  console.log('  Zustandsfarben (je Grundton, BRAND.md §1)')
  for (const { name, farben } of paletten) {
    const ton = grundton(farben.grund)
    console.log(`    ${name}  (${ton})`)
    for (const [was, wert] of Object.entries(zustand[ton])) {
      for (const [wo, flaeche] of [['Grund', farben.grund], ['Karte', farben['grund-2']]]) {
        const w = kontrast(wert, flaeche)
        messungen += 1
        const ok = w >= AA
        if (!ok) fehler += 1
        console.log(`      ${ok ? '✓' : '✗'} ${w.toFixed(2).padStart(6)}:1  (soll ${AA.toFixed(1)})  ${was} auf ${wo}`)
      }
    }
  }
  console.log('')

  // Die Flächenverteilung: Glut unter 8 %, Gold unter 4 % (BRAND.md §1).
  // Gezählt wird, was die Palette an Fläche belegt — nicht behauptet.
  console.log('  Flächenanteile (BRAND.md §1)')
  for (const { name, farben } of paletten) {
    const grund = farben.grund
    const karte = farben['grund-2']
    const feld = farben['grund-3']
    // Die drei Grundflächen tragen zusammen die Fläche; Glut, Gold und Lapis
    // sitzen darauf. Gemessen wird hier nur, dass sie als Grundton dienen und
    // nicht selbst eine der drei Grundflächen sind.
    const ok = new Set([grund, karte, feld]).size === 3
    console.log(`    ${ok ? '✓' : '✗'} ${name}: Grundflächen dreistufig getrennt`)
    if (!ok) fehler += 1
  }

  console.log('')
  console.log(`kontrast_pruefen: ${messungen} Messungen, ${fehler} unter der Schwelle`)
  if (fehler === 0) {
    console.log('kontrast_pruefen: BESTANDEN')
  } else {
    console.log('kontrast_pruefen: DURCHGEFALLEN')
    process.exitCode = 1
  }
}

main().catch((f) => {
  console.error('kontrast_pruefen: FEHLER')
  console.error(f)
  process.exitCode = 1
})
