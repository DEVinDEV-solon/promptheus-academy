/**
 * Die sechs Paletten von PROMPTHEUS als Farbkasten der Werkstatt.
 *
 * Wörtlich aus der maßgeblichen Quelle übernommen: `srv/varianten.php`,
 * `PU_VARIANTEN`. Das ist dieselbe Tabelle, die das Academy-Programm benutzt —
 * eine Quelle, nicht zwei (BRAND.md §2).
 *
 * **Warum die vorhandenen Farbfilter genügen.** Der Harness trägt seine
 * gesamte Oberfläche über die Marken `--dsw-alias-*`. Vierzehn davon sind
 * überschreibbar, und diese vierzehn tragen Grund, Karten, Ränder, Schrift und
 * Akzente. Eine Palette ist damit vollständig beschrieben — es braucht kein
 * Bild und keine Schriftart. Der Presenter des Harness schreibt sie als
 * Inline-CSS auf `body` (`ui-layout/src/client/theme-presenter.ts`).
 *
 * **Warum nicht `ctx.theme.register`.** Das wäre der naheliegende Weg und ist
 * eine Sackgasse: der Farbwähler des Harness führt seine drei Würfel fest
 * verdrahtet (`ui-theme/src/client/AppearanceRow.tsx`, `CUBES`). Ein
 * angemeldetes Thema erscheint dort **nicht** — und `ThemeRuntime.setTheme`
 * speichert es auch nicht, weil `isThemePreference` nur `light`, `dark` und
 * `system` durchlässt. Man würde sechs Themen anmelden, die niemand erreicht.
 *
 * **Eine Palette ist hell oder dunkel — das ist keine zweite Einstellung.**
 * „Olymp in hell" gibt es nicht; das wäre eine andere Palette. Deshalb trägt
 * jede ihren `grundton` und einen `partner` auf der anderen Seite. Der
 * Überschreibungs-Layer des Harness verlangt für jede Marke ein Paar
 * `{ light, dark }` — genau die Form, in die diese Regel passt: die gewählte
 * Palette besetzt ihren eigenen Grundton, der Partner den anderen. Der
 * Hell/Dunkel-Knopf wechselt damit zur Partnerpalette, statt eine Farbwelt
 * aufzuhellen, die dafür nicht gebaut ist.
 *
 * **Schrift bleibt Standard.** Im Academy-Programm liess sich die Schriftfarbe
 * einmal frei einstellen; sie ist dort wieder heraus (`PU_EIGENE_FARBEN`). Der
 * Grund stand im Betrieb: eine Schriftfarbe, die im Dunkeln gut aussieht, ist
 * ein helles Grau — und dieselbe Farbe steht nach dem Wechsel auf Pergament
 * hell auf hell. Hier gibt es deshalb ebenfalls keine Schrifteinstellung: die
 * sechs Paletten bringen ihre drei Schriftstufen mit, und für die ist der
 * Kontrast gerechnet (`werkzeuge/kontrast_pruefen.mjs`).
 *
 * Siehe: PROMPTHEUS\vps\Pläne\40_Werkstatt\Deepseek-Dashboard-Maske-Plan.md
 */

/** Der Grundton einer Palette. Bestimmt, welche Seite des Paares sie besetzt. */
export type Grundton = 'hell' | 'dunkel'

/** Die Farben einer Palette, benannt wie im Brand-Kit. */
export interface Palettenfarben {
  grund: string
  'grund-2': string
  'grund-3': string
  rand: string
  'rand-hell': string
  schrift: string
  'schrift-2': string
  'schrift-3': string
  glut: string
  'glut-hell': string
  'glut-tief': string
  gold: string
  lapis: string
}

/** Was eine Palette über ihre Farben hinaus ausmacht. */
export interface Palettenkopf {
  /** Der angezeigte Name. */
  name: string
  /** Ein Satz, der sagt, wofür sie gedacht ist. */
  was: string
  /** Der Grundton — die Seite, die diese Palette im Paar besetzt. */
  grundton: Grundton
  /** Die Palette auf der anderen Seite. */
  partner: string
}

/**
 * Die Zustandsfarben je Grundton.
 *
 * Diese drei stehen NICHT im Brand-Kit als Token; BRAND.md nennt sie nur als
 * Werte, und sie sind dort für dunklen Grund gewählt. Auf hellem Grund wären
 * sie unlesbar — ein helles Rot auf Pergament erreicht keine 4,5:1. Deshalb
 * gibt es sie je Grundton einmal, und `werkzeuge/kontrast_pruefen.mjs` rechnet
 * sie wie jede andere Textfarbe nach.
 */
export const ZUSTANDSFARBEN: Record<Grundton, { fehler: string; erfolg: string; warnung: string }> = {
  dunkel: { fehler: '#e8635a', erfolg: '#5fbf7a', warnung: '#e5b34a' },
  hell: { fehler: '#b3261e', erfolg: '#1f7a3d', warnung: '#8a5a00' },
}

/**
 * Übersetzt eine Brand-Palette in die Farbmarken des Harness.
 *
 * Angesetzt werden alle vierzehn Marken, die der Harness überschreibbar macht
 * (`BUILTIN_INSPECT_TOKENS` in `packages/client/ui-theme`). Vierzehn und nicht
 * dreizehn: `--dsw-alias-state-idle-primary` gehört dazu und trug vorher keinen
 * eigenen Wert. Ohne ihn bliebe der Ruhezustand in der Farbe des Harness
 * stehen und fiele aus jeder Palette heraus.
 * @param farben - die Farben der Palette.
 * @param grundton - ihr Grundton; bestimmt die Zustandsfarben.
 * @returns die Farbmarken des Harness mit ihren Werten.
 */
export function markenAus(farben: Palettenfarben, grundton: Grundton): Record<string, string> {
  const zustand = ZUSTANDSFARBEN[grundton]
  return {
    '--dsw-alias-bg-base': farben.grund,
    '--dsw-alias-bg-layer-1': farben['grund-2'],
    '--dsw-alias-bg-layer-2': farben['grund-3'],
    '--dsw-alias-bg-overlay': farben['grund-2'],
    '--dsw-alias-border-l1': farben.rand,
    '--dsw-alias-border-l2': farben['rand-hell'],
    '--dsw-alias-brand-primary': farben.glut,
    '--dsw-alias-label-primary': farben.schrift,
    '--dsw-alias-label-secondary': farben['schrift-2'],
    // Der Ruhezustand trägt den Hinweiston: gedämpft, aber lesbar.
    '--dsw-alias-state-idle-primary': farben['schrift-3'],
    '--dsw-alias-state-error-primary': zustand.fehler,
    '--dsw-alias-state-success-primary': zustand.erfolg,
    '--dsw-alias-state-warn-primary': zustand.warnung,
    '--dsw-specific-sidebar-fill': farben['grund-2'],
  }
}

/**
 * Palette „Schmiede" — die Vorgabe: Glut auf dunklem Grund, Gold für Erfolg.
 *
 * **Wichtiger Hinweis zu `schrift-3`.** Hier steht `#aaa39c`, nicht der Wert
 * `#8b8178` aus der Tokentabelle in `BRAND.md` §1. Die Tabelle ist an dieser
 * Stelle veraltet:
 *
 *   * BRAND.md verlangt im selben Abschnitt für `--schrift-3` die **AAA-Schwelle
 *     7:1** und schreibt, alle sechs Paletten erreichten „7,0–7,1:1".
 *   * `#8b8178` erreicht auf dem Grund nur **4,93:1** und auf einem Feld
 *     **4,23:1** — es verfehlt die eigene Regel.
 *   * Die maßgebliche Quelle (`srv/varianten.php`) und die lebende
 *     `assets/css/promptheus.css` tragen **`#aaa39c`**, und das erreicht
 *     **7,55:1** auf dem Grund.
 *
 * Übernommen wurde deshalb der Programmwert. `werkzeuge/kontrast_pruefen.mjs`
 * rechnet alle sechs Paletten nach und schlägt fehl, wenn eine unter ihre
 * Schwelle rutscht. Der Widerspruch in BRAND.md gehört dort gemeldet und
 * berichtigt — er ist nicht durch die Werkstatt entstanden und auch nicht
 * durch sie zu beheben.
 */
export const SCHMIEDE: Palettenfarben = {
  grund: '#14110f',
  'grund-2': '#1c1815',
  'grund-3': '#262019',
  rand: '#3a3129',
  'rand-hell': '#504338',
  schrift: '#ede5db',
  'schrift-2': '#b3a596',
  'schrift-3': '#aaa39c',
  glut: '#ff7a1c',
  'glut-hell': '#ffa347',
  'glut-tief': '#c14e00',
  gold: '#ffc94d',
  lapis: '#4e82b6',
}

/**
 * Palette „Pergament" — hell und warm, wie ein Buch bei Tageslicht.
 *
 * Auch hier der Programmwert `#5a5046` statt des Tabellenwerts `#796c5e`; die
 * Begründung steht bei {@link SCHMIEDE}. `#5a5046` erreicht 7,11:1 auf dem
 * Grund, `#796c5e` nur 4,61:1.
 */
export const PERGAMENT: Palettenfarben = {
  grund: '#f7f3ec',
  'grund-2': '#fffdfa',
  'grund-3': '#efe8dc',
  rand: '#ddd2c0',
  'rand-hell': '#c4b49a',
  schrift: '#241d16',
  'schrift-2': '#55483c',
  'schrift-3': '#5a5046',
  glut: '#b74e0c',
  'glut-hell': '#e2711d',
  'glut-tief': '#8f3800',
  gold: '#9a6a00',
  lapis: '#2f6394',
}

/** Palette „Olymp" — Nachtblau mit Gold, ruhiger als die Glut. */
export const OLYMP: Palettenfarben = {
  grund: '#0d1420',
  'grund-2': '#141d2c',
  'grund-3': '#1c2839',
  rand: '#2c3a4f',
  'rand-hell': '#3e5069',
  schrift: '#e4ebf5',
  'schrift-2': '#a3b2c6',
  'schrift-3': '#9da9b9',
  glut: '#5b9bd8',
  'glut-hell': '#8dbcea',
  'glut-tief': '#2c5f96',
  gold: '#ffd27a',
  lapis: '#7fb0dd',
}

/** Palette „Marmor" — hell und kühl, für Bildschirme in hellen Räumen. */
export const MARMOR: Palettenfarben = {
  grund: '#f4f5f7',
  'grund-2': '#ffffff',
  'grund-3': '#e8eaee',
  rand: '#d3d7de',
  'rand-hell': '#b3bac5',
  schrift: '#1a1e26',
  'schrift-2': '#454c58',
  'schrift-3': '#4d535e',
  glut: '#9a5b1e',
  'glut-hell': '#b06d28',
  'glut-tief': '#6d3c0d',
  gold: '#8a6a12',
  lapis: '#2a5d90',
}

/** Palette „Terrakotta" — erdig und warm, gebrannter Ton statt schwarzer Bildschirm. */
export const TERRAKOTTA: Palettenfarben = {
  grund: '#20120e',
  'grund-2': '#2b1a14',
  'grund-3': '#38231b',
  rand: '#4d3225',
  'rand-hell': '#6b4632',
  schrift: '#f3e3d5',
  'schrift-2': '#c3a794',
  'schrift-3': '#b5a69b',
  glut: '#e0642f',
  'glut-hell': '#f08a58',
  'glut-tief': '#a33d13',
  gold: '#e8b45c',
  lapis: '#5f93ab',
}

/** Palette „Funkenflug" — kräftig und bunt, für die jüngeren Stufen. */
export const FUNKENFLUG: Palettenfarben = {
  grund: '#161028',
  'grund-2': '#211838',
  'grund-3': '#2d2149',
  rand: '#413063',
  'rand-hell': '#5b4487',
  schrift: '#f2ecff',
  'schrift-2': '#c0b3dd',
  'schrift-3': '#ada2c8',
  glut: '#ff8a3d',
  'glut-hell': '#ffab6b',
  'glut-tief': '#d1550e',
  gold: '#ffd93d',
  lapis: '#6ac9e8',
}

/**
 * Die sechs Paletten mit ihren Köpfen — die einzige Liste, die alles führt.
 *
 * Die Reihenfolge ist die des Hauptprogramms und damit die Anzeigereihenfolge
 * im Farbkasten. Sie beginnt mit der Vorgabe.
 */
export const PALETTEN: ReadonlyArray<Palettenkopf & { kennung: string; farben: Palettenfarben }> = [
  {
    kennung: 'schmiede',
    name: 'Schmiede',
    was: 'Die Vorgabe: Glut auf dunklem Grund, Gold für Erfolg.',
    grundton: 'dunkel',
    partner: 'pergament',
    farben: SCHMIEDE,
  },
  {
    kennung: 'pergament',
    name: 'Pergament',
    was: 'Hell und warm, wie ein Buch bei Tageslicht.',
    grundton: 'hell',
    partner: 'schmiede',
    farben: PERGAMENT,
  },
  {
    kennung: 'olymp',
    name: 'Olymp',
    was: 'Nachtblau mit Gold — ruhiger als die Glut, für lange Sitzungen.',
    grundton: 'dunkel',
    partner: 'marmor',
    farben: OLYMP,
  },
  {
    kennung: 'marmor',
    name: 'Marmor',
    was: 'Hell und kühl, sehr ruhig. Für Bildschirme in hellen Räumen.',
    grundton: 'hell',
    partner: 'olymp',
    farben: MARMOR,
  },
  {
    kennung: 'terrakotta',
    name: 'Terrakotta',
    was: 'Erdig und warm — gebrannter Ton statt schwarzer Bildschirm.',
    grundton: 'dunkel',
    partner: 'pergament',
    farben: TERRAKOTTA,
  },
  {
    kennung: 'funkenflug',
    name: 'Funkenflug',
    was: 'Kräftig und bunt. Gedacht für die jüngeren Stufen.',
    grundton: 'dunkel',
    partner: 'marmor',
    farben: FUNKENFLUG,
  },
]

/** Die Palette, die gilt, wenn niemand etwas gewählt hat. */
export const PALETTEN_VORGABE = 'schmiede'

/** Eine gültige Palettenkennung. */
export type Palettenkennung = 'schmiede' | 'pergament' | 'olymp' | 'marmor' | 'terrakotta' | 'funkenflug'

/**
 * Findet eine Palette zu ihrer Kennung.
 * @param kennung - die Kennung, aus welcher Quelle auch immer.
 * @returns die Palette, oder `undefined` bei unbekannter Kennung.
 */
export function paletteFinden(kennung: string) {
  return PALETTEN.find(p => p.kennung === kennung)
}

/**
 * Baut das Wertepaar für den Überschreibungs-Layer des Harness.
 *
 * **Hier sitzt die Partner-Regel des Hauptprogramms.** Der Harness verlangt für
 * jede Marke einen Wert für hell UND für dunkel. Die gewählte Palette besetzt
 * ihre eigene Seite, ihr Partner die andere. Wer „Olymp" wählt und den
 * Hell/Dunkel-Knopf drückt, landet auf „Marmor" — genau wie in der Academy.
 *
 * Eine unbekannte oder fehlende Kennung fällt auf die Vorgabe zurück, statt zu
 * werfen: der Wert kommt aus dem Browserspeicher, und der ist von aussen
 * beschreibbar.
 * @param kennung - die gewählte Palettenkennung.
 * @returns je Marke ein `{ light, dark }`-Paar, fertig für `overrideTokens`.
 */
export function markenPaar(kennung: string): Record<string, { light: string; dark: string }> {
  const gewaehlt = paletteFinden(kennung) ?? paletteFinden(PALETTEN_VORGABE)
  if (gewaehlt === undefined) throw new Error('markenPaar: die Vorgabepalette fehlt in PALETTEN')
  const partner = paletteFinden(gewaehlt.partner) ?? gewaehlt
  const eigen = markenAus(gewaehlt.farben, gewaehlt.grundton)
  const fremd = markenAus(partner.farben, partner.grundton)
  const hell = gewaehlt.grundton === 'hell' ? eigen : fremd
  const dunkel = gewaehlt.grundton === 'dunkel' ? eigen : fremd
  const aus: Record<string, { light: string; dark: string }> = {}
  for (const name of Object.keys(eigen)) {
    aus[name] = { light: hell[name], dark: dunkel[name] }
  }
  return aus
}
