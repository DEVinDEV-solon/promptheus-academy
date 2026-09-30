/**
 * Der Farbkasten: hält die gewählte Palette und trägt sie in die Oberfläche.
 *
 * Getrennt von `paletten.ts`, weil dort nur Daten stehen. Hier steht, was mit
 * ihnen geschieht.
 *
 * **Warum ein eigener Halter und nicht der Themendienst des Harness.** Zwei
 * Gründe, beide gemessen:
 *
 *   1. Der Farbwähler des Harness (`AppearanceRow`) führt seine drei Würfel
 *      fest verdrahtet. Ein angemeldetes Thema erschiene dort nicht.
 *   2. `ThemeRuntime.setTheme` speichert nur `light`, `dark` und `system`; für
 *      jede andere Kennung fällt `isThemePreference` falsch aus. Eine eigene
 *      Palette wäre nach jedem Neuladen wieder weg.
 *
 * Deshalb hält die Werkstatt ihre Wahl selbst und trägt sie über den
 * Überschreibungs-Layer ein, der genau dafür da ist.
 *
 * **Zwei Knöpfe, eine Wahrheit.** Der Harness hat einen Hell/Dunkel-Schalter,
 * und der Farbkasten hat sechs Paletten — das sind zwei Bedienungen für eine
 * Sache, und daraus entsteht leicht ein Widerspruch: man wählt Terrakotta,
 * drückt im Harness „hell" und liest im Farbkasten immer noch Terrakotta
 * markiert, während der Bildschirm Pergament zeigt.
 *
 * Aufgelöst wird das über den Grundton, und zwar so:
 *
 *   * Die Wahl ist eine **Palette**, keine Farbstufe. Sie wird gespeichert.
 *   * Der Layer trägt **beide** Seiten ein (die gewählte und ihren Partner).
 *     Welche gilt, entscheidet der Harness aus `colorScheme` — nicht wir.
 *   * Angezeigt wird, was **wirkt**: hat der Harness auf die andere Seite
 *     geschaltet, ist das die Partnerpalette. Sie erscheint dann markiert.
 *
 * Damit stimmen Schalter und Farbkasten immer überein, ohne dass einer den
 * anderen nachäffen müsste. Und das Wählen einer Palette setzt den Schalter auf
 * ihren Grundton — sonst wählte man Terrakotta und sähe nichts davon.
 *
 * @module @promptheus/dsh-client-ui-promptheus/farbkasten
 */

import { markenPaar, PALETTEN, PALETTEN_VORGABE, paletteFinden } from './paletten.ts'

/**
 * Der Schlüssel im Browserspeicher.
 *
 * Der Name trägt das Paket, damit er nicht mit dem Harness oder einem anderen
 * Programm zusammenstößt.
 */
export const SPEICHER = 'promptheus.farbkasten.v1'

/** Der Name der Überschreibungsschicht beim Themendienst. */
export const SCHICHT = '@promptheus/farbkasten'

/**
 * Die Texte des Farbkastens.
 *
 * **Warum hier und nicht im Sprachregister des Harness.** Der Harness führt
 * seine Wörterbücher je Namensraum (`conversation`, `sidebar`, …). Der
 * Farbkasten ist keine Harness-Fläche, sondern eine eigene Zeile der Werkstatt —
 * ein eigener Namensraum wäre eine Anmeldung, die niemand liest. Die Paletten
 * bringen ihre Namen und Beschreibungen ohnehin selbst mit (`PALETTEN`); hier
 * stehen nur die Wörter, die darüber liegen.
 *
 * Diese Texte folgen denselben Regeln wie die 1.937 im Sprachregister
 * (BRAND.md §8): deutsch, Duzform, kein Ausrufezeichen, keine Superlative, und
 * jede Fehlermeldung nennt einen Weg.
 */
export const TEXTE = {
  titel: 'Farbkasten',
  erklaerung: 'Sechs geprüfte Paletten aus dem Hauptprogramm. Schrift und '
    + 'Kontrast bringt jede mit; die Wahl gilt für dieses Gerät.',
  grundton: { hell: 'hell', dunkel: 'dunkel' } as Record<string, string>,
  partnerHinweis: 'Der Hell/Dunkel-Knopf oben wechselt zur Partnerpalette.',
}

/** Der Farbschema-Name des Harness. */
export type Farbschema = 'light' | 'dark'

/**
 * Übersetzt den Grundton einer Palette in den Farbschema-Namen des Harness.
 *
 * **Diese Grenze war ein Fehler, und er war stumm.** Die Paletten führen ihren
 * Grundton auf Deutsch (`'hell'`, `'dunkel'` — so steht es in `varianten.php`),
 * der Harness führt sein Farbschema auf Englisch (`'light'`, `'dark'`). Wer den
 * einen Namen an die Stelle des anderen setzt, bekommt keine Fehlermeldung,
 * sondern ein stilles Nichts: `theme.setTheme('hell')` wirft
 * („theme \"hell\" is not registered"), und `active.colorScheme === 'hell'` ist
 * immer falsch.
 *
 * Die Folge war, dass sich **helle Paletten gar nicht einschalten liessen**:
 * wer Pergament oder Marmor wählte, sah weiter die dunkle Seite. Kein Werkzeug
 * meldete etwas, weil die Wahl ja ankam — nur der Schalter folgte nicht.
 *
 * Deshalb wird ab hier an jeder Grenze übersetzt, und zwar an genau einer
 * Stelle: hier.
 * @param ton - der Grundton einer Palette.
 * @returns der Farbschema-Name des Harness.
 */
export function farbschemaAus(ton: string): Farbschema {
  return ton === 'hell' ? 'light' : 'dark'
}

/**
 * Übersetzt das Farbschema des Harness in den Grundton der Paletten.
 * @param schema - `'light'` oder `'dark'`.
 * @returns der Grundton (`'hell'` oder `'dunkel'`).
 */
export function grundtonAus(schema: string): string {
  return schema === 'light' ? 'hell' : 'dunkel'
}

/**
 * Eine Kennung prüfen und auf die Vorgabe zurückführen.
 *
 * Der Wert kommt aus dem Browserspeicher, und der ist von aussen beschreibbar.
 * Eine unbekannte Kennung ist kein Fehler, sondern eine leere Wahl.
 * @param kennung - der gelesene Wert.
 * @returns eine gültige Kennung.
 */
function bereinigen(kennung: string | null | undefined): string {
  if (typeof kennung !== 'string') return PALETTEN_VORGABE
  return paletteFinden(kennung) === undefined ? PALETTEN_VORGABE : kennung
}

/**
 * Die Kennung der Palette, die bei einem Grundton gilt.
 *
 * Das ist die Partner-Regel aus `varianten.php`, angewandt: liegt die gewählte
 * Palette auf dem gefragten Grundton, gilt sie selbst — sonst gilt ihr Partner.
 * @param kennung - die gewählte Palettenkennung.
 * @param ton - der Grundton, der gerade gilt.
 * @returns die wirksame Kennung.
 */
export function wirksam(kennung: string, ton: string): string {
  const gewaehlt = paletteFinden(bereinigen(kennung))
  if (gewaehlt === undefined) return PALETTEN_VORGABE
  return gewaehlt.grundton === ton ? gewaehlt.kennung : gewaehlt.partner
}

/** Liest die gespeicherte Wahl. Ohne Browserspeicher gilt die Vorgabe. */
function lesen(): string {
  if (typeof localStorage === 'undefined') return PALETTEN_VORGABE
  try {
    return bereinigen(localStorage.getItem(SPEICHER))
  } catch {
    // Ein gesperrter Speicher (Privatmodus, Richtlinie) ist kein Fehler der
    // Anzeige: dann gilt die Vorgabe, und die Oberfläche läuft.
    return PALETTEN_VORGABE
  }
}

/**
 * Schreibt die Wahl. Ein Fehler hier darf die Anzeige nicht aufhalten.
 * @param kennung - die zu speichernde Kennung.
 */
function schreiben(kennung: string): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(SPEICHER, kennung)
  } catch {
    // Siehe `lesen`: ohne Speicher gilt die Wahl für diese Sitzung.
  }
}

/**
 * Der Halter der gewählten Palette.
 *
 * Er ist zugleich die beobachtbare Quelle für die Einstellungszeile: er hat
 * `getSnapshot` und `subscribe`, also genau die zwei Züge, die das `hooks`-Fach
 * des Harness von einem Wert verlangt. Damit wird er dort zum Haken
 * `usePalette` — ohne dass die Bausteine je von hier wissen müssten.
 */
export class Palettenwaehler {
  /** Die gewählte Kennung (die Wahl, nicht die Wirkung). */
  private kennung: string

  /** Der Grundton, der im Harness gerade gilt. */
  private ton: string

  /** Was zuletzt gemeldet wurde — damit nur echte Änderungen melden. */
  private letzteWirkung: string

  /** Die Angemeldeten der Anzeige. */
  private readonly zuhoerer = new Set<() => void>()

  /**
   * Trägt eine Kennung in die Oberfläche ein.
   *
   * Wird von aussen gereicht, damit dieser Halter den Themendienst nicht selbst
   * kennen muss — dieselbe Trennung, die der Harness zwischen Dienst und
   * Presenter zieht.
   */
  private readonly eintragen: (kennung: string) => void

  /**
   * @param eintragen - trägt die Kennung in den Überschreibungs-Layer ein.
   * @param schema - das Farbschema, das beim Aufbau gilt (`'light'`/`'dark'`).
   */
  constructor(eintragen: (kennung: string) => void, schema: string) {
    this.eintragen = eintragen
    this.ton = grundtonAus(schema)
    this.kennung = lesen()
    this.letzteWirkung = wirksam(this.kennung, this.ton)
  }

  /**
   * Die Palette, die gerade wirkt.
   * @returns die wirksame Palettenkennung.
   */
  getSnapshot(): string {
    return this.letzteWirkung
  }

  /**
   * Meldet sich für Änderungen an.
   * @param zuhoerer - wird bei jeder Änderung gerufen.
   * @returns der Abmelder.
   */
  subscribe(zuhoerer: () => void): () => void {
    this.zuhoerer.add(zuhoerer)
    return () => { this.zuhoerer.delete(zuhoerer) }
  }

  /**
   * Übernimmt ein neues Farbschema aus dem Harness.
   *
   *Wird gerufen, wenn der Harness seinen Hell/Dunkel-Schalter bewegt. Die Wahl
   * bleibt, die Wirkung wechselt zur Partnerpalette — und nur, wenn sich dadurch
   * wirklich etwas ändert, wird gemeldet.
   * @param schema - das Farbschema des Harness (`'light'` oder `'dark'`).
   */
  farbschemaSetzen(schema: string): void {
    // **Übersetzen, nicht durchreichen.** Der Harness führt `'light'`/`'dark'`,
    // die Paletten `'hell'`/`'dunkel'`. Ohne diese Zeile wäre der Vergleich
    // immer falsch und die Anzeige folgte dem Schalter nie.
    const ton = grundtonAus(schema)
    if (ton === this.ton) return
    this.ton = ton
    const neu = wirksam(this.kennung, ton)
    if (neu === this.letzteWirkung) return
    this.letzteWirkung = neu
    for (const zuhoerer of this.zuhoerer) zuhoerer()
  }

  /**
   * Trägt die aktuelle Wahl ein.
   *
   * Der Layer führt beide Seiten, deshalb ist er vom Grundton unabhängig: der
   * Harness wählt beim Umschalten selbst die passende. Beim Start einmal zu
   * rufen.
   */
  anwenden(): void {
    this.eintragen(this.kennung)
  }

  /**
   * Wählt eine Palette.
   * @param kennung - die gewünschte Kennung; unbekannte werden zur Vorgabe.
   * @returns der Grundton der gewählten Palette, damit der Harness-Schalter
   *   nachgezogen werden kann — übersetzt in sein Farbschema.
   */
  waehlen(kennung: string): Farbschema {
    const sauber = bereinigen(kennung)
    const palette = paletteFinden(sauber)
    if (palette === undefined) throw new Error('waehlen: die bereinigte Palette fehlt in PALETTEN')
    this.kennung = sauber
    schreiben(sauber)
    this.eintragen(sauber)
    this.ton = palette.grundton
    const neu = wirksam(sauber, this.ton)
    if (neu !== this.letzteWirkung) {
      this.letzteWirkung = neu
      for (const zuhoerer of this.zuhoerer) zuhoerer()
    }
    // **Als Farbschema zurückgeben, nicht als Grundton.** Der Aufrufer reicht
    // den Wert an `theme.setTheme` — und der kennt nur `'light'` und `'dark'`.
    return farbschemaAus(palette.grundton)
  }
}

/**
 * Die Beschreibung einer Palette für die Anzeige.
 *
 * Die Vorschau braucht die Farben der Palette, nicht die der laufenden. Deshalb
 * stehen hier rohe Farbwerte — die eine Stelle, an der BRAND.md §4 („nur
 * `var(--…)`") nicht gelten kann. Ein Farbkasten, der die Farben nicht zeigt,
 * wäre keiner. Die Werte kommen aus derselben Tabelle, die auch eingetragen
 * wird, also gibt es keine zweite Wahrheit.
 * @param kennung - die Palettenkennung.
 * @returns Name, Beschreibung, Grundton, Partner und drei Vorschaufarben.
 */
export function beschreiben(kennung: string) {
  const palette = paletteFinden(kennung) ?? paletteFinden(PALETTEN_VORGABE)
  if (palette === undefined) throw new Error('beschreiben: die Vorgabepalette fehlt in PALETTEN')
  return {
    kennung: palette.kennung,
    name: palette.name,
    was: palette.was,
    grundton: palette.grundton,
    partner: palette.partner,
    farben: [palette.farben.grund, palette.farben.glut, palette.farben.gold],
  }
}

/**
 * Baut den Überschreibungs-Layer für eine Palette.
 *
 * Ein eigener Name, damit die Schicht bei jeder Wahl ersetzt und nicht
 * gestapelt wird: `overrideTokens` führt JE QUELLE genau eine Schicht und
 * ersetzt sie beim erneuten Aufruf.
 * @param kennung - die gewählte Kennung.
 * @returns die Marken mit ihren `{light, dark}`-Paaren.
 */
export function layerAus(kennung: string): Record<string, { light: string; dark: string }> {
  return markenPaar(kennung)
}

/** Alle Paletten in Anzeigereihenfolge. */
export { PALETTEN }
