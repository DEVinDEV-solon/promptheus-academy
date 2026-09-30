/**
 * PROMPTHEUS Werkstatt — Bündelprüfung.
 *
 * Führt das gebaute Client-Bündel in einer nachgebauten Umgebung aus und prüft,
 * ob es sich richtig anmeldet. Damit wird der Fehler gefunden, den eine
 * Sichtprüfung im Browser nur als Symptom zeigt — und zwar ohne Browser.
 *
 * Geprüft wird:
 *   1. Lädt das Bündel überhaupt (Kopfzeile mit `module` vorhanden)?
 *   2. Meldet es sich unter der richtigen Kennung an?
 *   3. Verlangt es nur Dinge, die die Modultabelle des Browsers auch hat?
 *   4. Läuft `apply()` durch und belegt es den erwarteten Steckplatz?
 *   5. Baut der Belegungs-Baustein ein React-Element, ohne abzustürzen?
 *
 * Aufruf:  node werkzeuge/buendel_pruefen.mjs
 */

import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Wurzel dieses Werkzeugs (…/deepseek-dashboard). */
const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/** Die Pakete, die geprüft werden, mit ihren erwarteten Angaben. */
const PAKETE = [
  {
    name: 'dsh-client-ui-promptheus',
    id: '@promptheus/dsh-client-ui-promptheus',
    /** Steckplätze, die `apply()` belegen muss. */
    erwarteteSteckplaetze: [
      'sidebar.brand.mark',
      'sidebar.brand.name',
      'conversation.hero.brand.mark',
      'sidebar.footer.action',
      'conversation.session.header.utilities',
    ],
  },
]

/** Erlaubte Anforderungen: genau das, was die Modultabelle des Browsers beisteuert. */
const ERLAUBTE_ANFORDERUNGEN = new Set([
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/client',
  '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-ui-primitives',
])

/** Ein winziger React-Ersatz: reicht, um Elemente zu bauen und Bausteine aufzurufen. */
function reactErsatz() {
  const React = {
    createElement: (typ, eigenschaften, ...kinder) => ({
      $$typ: typeof typ === 'function' ? (typ.name || 'anonym') : typ,
      props: { ...(eigenschaften ?? {}), children: kinder.length === 1 ? kinder[0] : kinder },
    }),
    useState: (start) => [start, () => {}],
    useEffect: () => {},
    useMemo: (rechner) => rechner(),
    useRef: (start) => ({ current: start }),
    Fragment: 'Fragment',
  }
  return React
}

/**
 * Prüft ein Paket.
 * @param paket - Name, Kennung und erwartete Steckplätze.
 * @returns Liste der Beanstandungen; leer heißt bestanden.
 */
function paketPruefen(paket) {
  const beanstandungen = []
  const pfad = join(WURZEL, 'pakete', paket.name, 'lib', 'client.js')
  let quelle
  try {
    quelle = readFileSync(pfad, 'utf8')
  } catch {
    return [`${paket.name}: Bündel fehlt unter ${pfad} — zuerst „node werkzeuge/bauen.mjs" laufen lassen`]
  }

  // ── 1. Anmeldung abfangen ─────────────────────────────────────────────────
  let anmeldung
  const fenster = {
    __ModuleLoader__: {
      load: (eintrag) => { anmeldung = eintrag },
    },
  }

  // ── 2. Anforderungen nachbauen und mitschreiben ───────────────────────────
  const gefordert = []
  const React = reactErsatz()
  const requireErsatz = (spezifizierer) => {
    gefordert.push(spezifizierer)
    if (spezifizierer === 'react') return React
    if (spezifizierer === 'react/jsx-runtime') return { jsx: React.createElement, jsxs: React.createElement }
    throw new Error(`unbekannte Anforderung „${spezifizierer}"`)
  }

  try {
    // eslint-disable-next-line no-new-func
    const laufen = new Function('window', `${quelle}\nreturn window.__ModuleLoader__;`)
    laufen(fenster)
  } catch (fehler) {
    return [`${paket.name}: das Bündel ließ sich nicht ausführen — ${fehler.message}`]
  }

  if (anmeldung === undefined) {
    return [`${paket.name}: das Bündel hat sich nicht angemeldet (kein __ModuleLoader__.load-Aufruf)`]
  }
  if (anmeldung.id !== paket.id) {
    beanstandungen.push(`${paket.name}: meldet sich als „${anmeldung.id}" statt als „${paket.id}"`)
  }
  if (typeof anmeldung.factory !== 'function') {
    beanstandungen.push(`${paket.name}: die factory ist keine Funktion`)
    return beanstandungen
  }

  // ── 3. Die factory ausführen ──────────────────────────────────────────────
  let rumpf
  try {
    rumpf = anmeldung.factory(requireErsatz)
  } catch (fehler) {
    beanstandungen.push(`${paket.name}: die factory stürzte ab — ${fehler.message}`)
    return beanstandungen
  }

  for (const anforderung of gefordert) {
    if (!ERLAUBTE_ANFORDERUNGEN.has(anforderung)) {
      beanstandungen.push(
        `${paket.name}: verlangt „${anforderung}", das die Modultabelle des Browsers nicht beisteuert`,
      )
    }
  }

  // ── 4. apply() gegen ein nachgebautes Steckplatz-Register laufen lassen ───
  const belegt = []
  const slots = {
    inject: (schlüssel, rückruf) => { rückruf(); return () => {} },
    register: (belegung, baustein) => {
      belegt.push({ ...belegung, baustein })
      return () => {}
    },
  }
  // Das Farbregister wird mitgezählt: die Palette muss genau einmal
  // überschrieben werden, und die Marken müssen vollständig sein.
  //
  // Nachgebildet werden alle Züge, die das Paket benutzt — `overrideTokens`,
  // `getTheme` und `setTheme`. Der echte Themendienst des Harness hat sie alle
  // (`ThemeRuntime` in packages/client/ui-theme); ein Gestell, das nur einen
  // kennt, lässt das Paket scheitern und meldet dann einen Fehler, den es
  // selbst verursacht hat.
  const ueberschrieben = []
  const themen = []
  const theme = {
    overrideTokens: (quelle, marken) => {
      ueberschrieben.push({ quelle, marken })
      return () => {}
    },
    getTheme: () => ({ active: { colorScheme: 'dark' }, preference: 'dark', themes: [], revision: 0, fontSize: 14 }),
    setTheme: (id) => { themen.push(id) },
  }
  // Das Sprachregister. Die Anmeldung wird mitgezählt, damit der Lauf belegen
  // kann, dass die deutschen Wörterbücher wirklich abgelegt werden.
  const sprachen = []
  const namensraeume = []
  const locale = {
    register: (ns, sprache) => { namensraeume.push(`${ns}:${sprache}`); return () => {} },
    addLanguage: (eintrag) => { sprachen.push(eintrag); return () => {} },
  }
  /** Effekte werden sofort ausgeführt; der Abräumer wird festgehalten. */
  const abraeumer = []
  const ctx = {
    get: (name) => {
      if (name === 'slots') return slots
      if (name === 'theme') return theme
      if (name === 'locale') return locale
      return undefined
    },
    slots,
    theme,
    locale,
    on: () => () => {},
    effect: (rückruf) => {
      const ab = rückruf()
      if (typeof ab === 'function') abraeumer.push(ab)
      return () => {}
    },
    // **`ctx.inject` ist Pflicht.** Das Paket wartet damit auf Dienste, die
    // später bereitstehen (`locale`, `theme`) — der Weg, den der Harness selbst
    // geht. Der Rückruf bekommt einen EIGENEN Kontext; hier wird ein Kind
    // gereicht, damit `inject` und `effect` genauso arbeiten wie am echten
    // Faden. Ein Gestell ohne diesen Zug lässt `apply()` abstürzen und meldet
    // dann einen Fehler, den es selbst verursacht hat.
    inject: (abhaengigkeiten, rueckruf) => {
      rueckruf(ctx)
      return () => {}
    },
  }
  if (typeof rumpf.apply !== 'function') {
    beanstandungen.push(`${paket.name}: der Rumpf hat kein apply()`)
    return beanstandungen
  }
  try {
    rumpf.apply(ctx)
  } catch (fehler) {
    beanstandungen.push(`${paket.name}: apply() stürzte ab — ${fehler.message}`)
    return beanstandungen
  }

  // ── 5. Die deutschen Wörterbücher und die Sprachwahl ──────────────────────
  //
  // **Beides muss da sein.** `locale.register` legt nur die Wörterbücher ab.
  // Wählbar wird eine Sprache erst durch `addLanguage` — der Harness führt seine
  // Auswahlliste aus seinem eigenen Katalog (zh, en). Fehlte der zweite Aufruf,
  // wären die Texte angemeldet und die Oberfläche trotzdem englisch, ohne dass
  // irgendetwas fehlschlüge. Genau das war einmal der Fall.
  const namensraeumeDe = namensraeume.filter(n => n.endsWith(':de'))
  if (namensraeumeDe.length === 0) {
    beanstandungen.push(`${paket.name}: meldet kein deutsches Wörterbuch an`)
  }
  // **Doppelte Namensräume sind tödlich und stumm.**
  //
  // `locale.register(ns, 'de', …)` wirft, wenn derselbe Namensraum schon mit
  // `de` belegt ist (`already has locale "de"`). Fällt das in einer Schleife,
  // bricht der GANZE Effekt ab — alle NACHFOLGENDEN Namensräume werden nie
  // angemeldet, und am Bildschirm bleibt die Oberfläche halb englisch, ohne dass
  // irgendetwas einen Grund nennt. Genau das ist passiert: `sidebarDocumentPreview`
  // stand zweimal in der Liste, und 16 Namensräume dahinter fielen aus.
  const zaehlung = new Map()
  for (const n of namensraeumeDe) {
    const ns = n.slice(0, -3)
    zaehlung.set(ns, (zaehlung.get(ns) ?? 0) + 1)
  }
  for (const [ns, anzahl] of zaehlung) {
    if (anzahl > 1) {
      beanstandungen.push(
        `${paket.name}: meldet „${ns}" ${anzahl}-mal an — der zweite Aufruf wirft, `
        + 'und alle folgenden Namensräume fallen mit aus',
      )
    }
  }
  if (sprachen.length !== 1) {
    beanstandungen.push(
      `${paket.name}: stellt ${sprachen.length}-mal eine Sprache zur Auswahl, erwartet genau einmal`,
    )
  }
  for (const sprache of sprachen) {
    if (sprache.id !== 'de') {
      beanstandungen.push(`${paket.name}: stellt „${String(sprache.id)}" zur Auswahl statt „de"`)
    }
    if (sprache.label !== 'Deutsch') {
      beanstandungen.push(`${paket.name}: die Sprache heisst „${String(sprache.label)}" statt „Deutsch"`)
    }
    // Der Rückfall muss auf eine Sprache zeigen, die der Harness selbst führt.
    if (sprache.fallback !== 'en') {
      beanstandungen.push(
        `${paket.name}: der Sprachrückfall zeigt auf „${String(sprache.fallback)}" statt auf „en"`,
      )
    }
  }

  // ── 6. Die Palette prüfen ─────────────────────────────────────────────────
  if (ueberschrieben.length !== 1) {
    beanstandungen.push(
      `${paket.name}: überschreibt die Farbmarken ${ueberschrieben.length}-mal, erwartet genau einmal`,
    )
  }
  for (const { marken } of ueberschrieben) {
    const namen = Object.keys(marken)
    if (namen.length === 0) {
      beanstandungen.push(`${paket.name}: die Farbüberschreibung ist leer`)
      continue
    }
    for (const name of namen) {
      const wert = marken[name]
      // Der Harness lehnt einen einzelnen Wert ab: beide Schemata sind Pflicht.
      if (typeof wert !== 'object' || wert === null
        || typeof wert.light !== 'string' || typeof wert.dark !== 'string') {
        beanstandungen.push(`${paket.name}: „${name}" hat kein Paar aus hell und dunkel`)
      }
    }
    // Die Marken, die der Harness kennt (BUILTIN_INSPECT_TOKENS). Alle
    // vierzehn: `--dsw-alias-state-idle-primary` gehört dazu und trägt seit dem
    // Farbkasten den Hinweiston der Palette.
    const erwarteteMarken = [
      '--dsw-alias-bg-base', '--dsw-alias-bg-layer-1', '--dsw-alias-bg-layer-2',
      '--dsw-alias-bg-overlay', '--dsw-alias-border-l1', '--dsw-alias-border-l2',
      '--dsw-alias-brand-primary', '--dsw-alias-label-primary', '--dsw-alias-label-secondary',
      '--dsw-alias-state-error-primary', '--dsw-alias-state-idle-primary',
      '--dsw-alias-state-success-primary',
      '--dsw-alias-state-warn-primary', '--dsw-specific-sidebar-fill',
    ]
    for (const marke of erwarteteMarken) {
      if (!namen.includes(marke)) {
        beanstandungen.push(`${paket.name}: die Marke „${marke}" fehlt in der Palette`)
      }
    }
  }

  for (const erwartet of paket.erwarteteSteckplaetze) {
    const treffer = belegt.find(b => b.name === erwartet)
    if (treffer === undefined) {
      beanstandungen.push(`${paket.name}: belegt „${erwartet}" nicht (belegt: ${belegt.map(b => b.name).join(', ') || 'nichts'})`)
      continue
    }
    // ── 6. Den Baustein einmal bauen ───────────────────────────────────────
    //
    // Das Gestell liefert die Anteile, die der Steckplatz zur Verfügung stellt.
    // Der Harness bindet das `hooks`-Fach eines Eintrags zu `use<Name>`-Haken;
    // hier steht für jeden Namen ein Haken bereit, der einen Wert aus dem
    // Gestell liefert. Ohne das stürzte jeder Baustein ab, der einen Haken
    // benutzt — und das Werkzeug meldete einen Fehler, den es selbst verursacht.
    const gestell = {
      // `usePalette(s => s)` liefert die Kennung, `usePalette()` den ganzen Wert.
      usePalette: (auswahl) => (typeof auswahl === 'function' ? auswahl('schmiede') : 'schmiede'),
      useStore: () => ({}),
      renderSlot: () => null,
      renderFactorySlot: () => null,
      t: (schluessel) => String(schluessel),
    }
    try {
      const element = treffer.baustein(gestell)
      if (element === undefined || element === null) {
        beanstandungen.push(`${paket.name}: der Baustein für „${erwartet}" liefert nichts`)
      }
    } catch (fehler) {
      beanstandungen.push(`${paket.name}: der Baustein für „${erwartet}" stürzte ab — ${fehler.message}`)
    }
  }

  // ── 7. Die Gemeindeadresse prüfen ─────────────────────────────────────────
  const gemeinde = rumpf.GEMEINDE_URL
  if (typeof gemeinde !== 'string' || !gemeinde.startsWith('https://promptheus-academy.de/')) {
    beanstandungen.push(
      `${paket.name}: GEMEINDE_URL fehlt oder zeigt nicht auf promptheus-academy.de (ist: ${String(gemeinde)})`,
    )
  } else if (gemeinde !== 'https://promptheus-academy.de/community') {
    beanstandungen.push(`${paket.name}: GEMEINDE_URL zeigt auf ${gemeinde} statt auf /community`)
  }

  return beanstandungen
}

/** Prüft alle Pakete und berichtet. */
function main() {
  let gesamt = 0
  console.log('buendel_pruefen: PROMPTHEUS Werkstatt')
  console.log('')

  for (const paket of PAKETE) {
    const beanstandungen = paketPruefen(paket)
    if (beanstandungen.length === 0) {
      console.log(`  ✓ ${paket.id}`)
      console.log(`      Anmeldung, Anforderungen, apply(), Baustein — alles in Ordnung`)
    } else {
      console.log(`  ✗ ${paket.id}`)
      for (const b of beanstandungen) console.log(`      · ${b}`)
    }
    gesamt += beanstandungen.length
  }

  console.log('')
  if (gesamt === 0) {
    console.log('buendel_pruefen: BESTANDEN')
  } else {
    console.log(`buendel_pruefen: DURCHGEFALLEN (${gesamt} Beanstandung(en))`)
    process.exitCode = 1
  }
}

main()
