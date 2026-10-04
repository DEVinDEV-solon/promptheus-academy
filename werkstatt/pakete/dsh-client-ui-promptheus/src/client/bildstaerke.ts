/**
 * Die Bildstärke des Hintergrundbilds — einstellbar mit einem Regler im
 * Farbkasten (04.10.2026).
 *
 * Vorher stand sie fest auf 18 %, dem höchsten Wert, der den Zweittext noch
 * über 4,5:1 hält (Rechnung in `hintergrund.ts`). Im Alltag reichte das nicht:
 * über unruhigen Bildstellen wurden die Antworten schwer lesbar. Deshalb:
 *
 *   * **Regler von 0 bis 18 %.** 0 % heisst: kein Bild, nur der Grundton.
 *     Über 18 % geht es nicht — dort fällt der Zweittext durch die eigene
 *     Kontrastregel (BRAND.md §1). Wer mehr Bild will, bekommt weniger Lesbarkeit,
 *     und das bieten wir nicht an.
 *   * **Vorgabe 7 %** (schlechtester Zweittext-Kontrast rund 6,6:1) statt 18 %.
 *     Zuerst 10 %, am 04.10.2026 auf Wunsch auf 7 % gesenkt.
 *
 * Wirkung: zwei CSS-Variablen auf `<html>` (`--promptheus-bildstaerke`, z. B.
 * `0.07`, und `--promptheus-schleier`, z. B. `93%`). Das Stylesheet aus
 * `hintergrund.ts` liest nur diese Variablen; der Regler ändert also kein
 * Stylesheet, nur zwei Werte.
 *
 * Der Halter hat `getSnapshot` und `subscribe` — wie der Palettenwähler — und
 * wird im `hooks`-Fach zum Haken `useBild`.
 *
 * @module @promptheus/dsh-client-ui-promptheus/bildstaerke
 */

/** Der Schlüssel im Browserspeicher (Paketname davor, wie beim Farbkasten). */
export const BILD_SPEICHER = 'promptheus.bildstaerke.v1'

/** Höchstwert in Prozent: darüber hält der Zweittext 4,5:1 nicht mehr. */
export const BILD_HOECHST = 18

/** Vorgabe in Prozent: Zweittext im schlechtesten Fall rund 6,6:1. */
export const BILD_VORGABE = 7

/** Die Texte des Reglers (BRAND.md §8: deutsch, Duzform, kein Ausrufezeichen). */
export const BILD_TEXTE = {
  titel: 'Hintergrundbild',
  erklaerung: 'Weniger Bild heisst ruhigere Schrift. Bei 0 % siehst du nur den Grundton; '
    + `mehr als ${BILD_HOECHST} % lässt die Schrift nicht mehr sicher lesbar.`,
  wert: (p: number) => (p === 0 ? 'aus' : `${p} %`),
}

/** Prüft einen Wert und führt ihn in den erlaubten Bereich (ganze Prozent). */
export function bildBereinigen(wert: unknown): number {
  const n = typeof wert === 'number' ? wert : Number.parseInt(String(wert ?? ''), 10)
  if (!Number.isFinite(n)) return BILD_VORGABE
  return Math.min(BILD_HOECHST, Math.max(0, Math.round(n)))
}

/** Die beiden CSS-Werte zu einer Bildstärke in Prozent. */
export function bildWerte(prozent: number): { staerke: string; schleier: string } {
  const p = bildBereinigen(prozent)
  return { staerke: String(p / 100), schleier: `${100 - p}%` }
}

function lesen(): number {
  if (typeof localStorage === 'undefined') return BILD_VORGABE
  try {
    const roh = localStorage.getItem(BILD_SPEICHER)
    return roh === null ? BILD_VORGABE : bildBereinigen(roh)
  } catch {
    // Gesperrter Speicher: Vorgabe, die Oberfläche läuft weiter.
    return BILD_VORGABE
  }
}

function schreiben(prozent: number): void {
  if (typeof localStorage === 'undefined') return
  try { localStorage.setItem(BILD_SPEICHER, String(prozent)) } catch { /* gilt dann für diese Sitzung */ }
}

/** Der Halter der Bildstärke. */
export class Bildstaerke {
  private prozent: number
  private readonly zuhoerer = new Set<() => void>()

  constructor() {
    this.prozent = lesen()
  }

  getSnapshot(): number {
    return this.prozent
  }

  subscribe(zuhoerer: () => void): () => void {
    this.zuhoerer.add(zuhoerer)
    return () => { this.zuhoerer.delete(zuhoerer) }
  }

  /** Trägt den Wert in die Seite ein. Beim Start einmal zu rufen. */
  anwenden(): void {
    if (typeof document === 'undefined') return
    const { staerke, schleier } = bildWerte(this.prozent)
    const wurzel = document.documentElement.style
    wurzel.setProperty('--promptheus-bildstaerke', staerke)
    wurzel.setProperty('--promptheus-schleier', schleier)
  }

  /** Nimmt die eingetragenen Werte wieder heraus (beim Abräumen des Pakets). */
  entfernen(): void {
    if (typeof document === 'undefined') return
    const wurzel = document.documentElement.style
    wurzel.removeProperty('--promptheus-bildstaerke')
    wurzel.removeProperty('--promptheus-schleier')
  }

  /**
   * Setzt einen neuen Wert (vom Regler).
   * @returns der bereinigte Wert.
   */
  setzen(wert: unknown): number {
    const p = bildBereinigen(wert)
    if (p === this.prozent) return p
    this.prozent = p
    schreiben(p)
    this.anwenden()
    for (const z of this.zuhoerer) z()
    return p
  }
}
