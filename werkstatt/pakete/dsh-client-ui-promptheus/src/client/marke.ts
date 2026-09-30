/**
 * Die Bildmarke von PROMPTHEUS ACADEMY als SVG-Zeichenkette.
 *
 * Wörtlich aus `PROMPTHEUS/Brand/mark.svg` übernommen, mit zwei Änderungen für
 * den Einsatz in der Oberfläche:
 *
 *   1. Die Hintergrundfläche (`<rect … fill="#14110f">`) ist entfernt. Im
 *      Brand-Kit füllt sie das Quadrat eines Anwendungssymbols; hier steht die
 *      Marke auf einer Fläche, deren Farbe das Thema vorgibt.
 *   2. Die Kennungen der Verläufe tragen das Präfix `pu-`, damit sie nicht mit
 *      gleichnamigen Kennungen anderer Belegungen zusammenstoßen. Kennungen in
 *      SVG sind dokumentweit eindeutig.
 *
 * Die Marke ist absichtlich als Pfad und Verlauf gesetzt und nicht als Schrift:
 * sie sieht dadurch überall gleich aus, auch dort, wo Palatino fehlt — und es
 * geht keine Schriftanfrage nach draußen (BRAND.md §3, §9).
 *
 * Siehe: PROMPTHEUS\vps\Pläne\40_Werkstatt\Deepseek-Dashboard-Maske-Plan.md
 */

/** Die Bildmarke: Flamme im Mäanderring, ohne Hintergrundfläche. */
export const BILDMARKE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="PROMPTHEUS">
  <defs>
    <linearGradient id="pu-flamme" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#ff4d1c"/>
      <stop offset=".55" stop-color="#ff9d2e"/>
      <stop offset="1" stop-color="#ffe08a"/>
    </linearGradient>
  </defs>
  <g fill="none" stroke="#ffc94d" stroke-width="2" opacity=".42">
    <path d="M8 8 H20 V14 H14 V20 H8 Z"/>
    <path d="M56 8 H44 V14 H50 V20 H56 Z"/>
    <path d="M8 56 H20 V50 H14 V44 H8 Z"/>
    <path d="M56 56 H44 V50 H50 V44 H56 Z"/>
  </g>
  <path d="M32 14C32 14 21 26 21 37a11 11 0 0 0 22 0C43 30 36.5 27.5 36.5 21c0 0-4 4-4 9.5 0 0-4-4-4-10.5 0 0 3.5-6 3.5-6z" fill="url(#pu-flamme)"/>
</svg>`

/** Der Mäander als Kachel für die Kopfkante, 32 px, einfarbig über eine Maske. */
export const MAEANDER = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><g fill="none" stroke="#fff" stroke-width="2" stroke-linecap="square"><path d="M0 28 H32"/><path d="M6 28 V6 H26 V22 H12 V16 H20"/></g></svg>`
