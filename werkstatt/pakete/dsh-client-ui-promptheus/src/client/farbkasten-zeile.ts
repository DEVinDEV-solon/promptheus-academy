/**
 * Der Farbkasten als Einstellungszeile.
 *
 * Sechs Würfel, je einer eine Palette. Der gewählte ist markiert; ein Druck
 * wählt und wirkt sofort.
 *
 * **Warum eigene Bausteine statt einer fremden Steuerung.** Der Harness hat
 * einen Farbwähler (`ui-theme/AppearanceRow`) — der führt aber seine drei
 * Würfel fest verdrahtet und zeigt nur hell, dunkel und system. Er lässt sich
 * nicht um sechs Paletten erweitern, ohne den Harness-Quelltext zu ändern, und
 * das ist die eine Regel, die hier nicht verhandelbar ist. Diese Zeile ist
 * deshalb eigen und belegt denselben Steckplatz, den auch der Harness belegt:
 * `settings.general.item` ist eine LISTE, es wird also nichts verdrängt
 * (Entscheidung E7).
 *
 * **Warum die Farben hier roh stehen.** BRAND.md §4 verlangt in der Fläche
 * `var(--…)`, nie einen rohen Wert — die Regel hat einen guten Grund: eine
 * feste Farbe läuft aus der Palette. Genau umgekehrt liegt es HIER: die
 * Vorschau soll die Farben einer Palette zeigen, die gerade NICHT gilt. Sie
 * muss roh sein, sonst zeigte sie sechsmal die laufende Palette. Die Werte
 * kommen aus derselben Tabelle, die auch eingetragen wird (`PALETTEN`), also
 * gibt es keine zweite Wahrheit.
 *
 * @module @promptheus/dsh-client-ui-promptheus/farbkasten-zeile
 */

import { beschreiben, PALETTEN, TEXTE } from './farbkasten.ts'

const SANS = '"Segoe UI",system-ui,Roboto,Helvetica,Arial,sans-serif'
const SERIFE = '"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif'

/**
 * Ein Würfel: Vorschau, Name, Grundton.
 * @param eigenschaften - die Eigenschaften des Würfels.
 * @returns der Würfel.
 */
function Wuerfel(eigenschaften) {
  const React = require('react')
  const { kennung, gewaehlt, aufWahl } = eigenschaften
  const palette = beschreiben(kennung)
  const React2 = React
  return React2.createElement(
    'button',
    {
      type: 'button',
      // Der Name trägt den Zustand mit: wer nur hört, soll wissen, welche
      // Palette gilt (BRAND.md §1: „Farbe trägt nie allein eine Bedeutung").
      'aria-pressed': gewaehlt,
      title: palette.was,
      onClick: () => { aufWahl(kennung) },
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '.4rem',
        padding: '.5rem',
        boxSizing: 'border-box',
        border: gewaehlt
          ? '2px solid var(--dsw-alias-brand-primary, #ff7a1c)'
          : '1px solid var(--dsw-alias-border-l2, rgba(255,255,255,.14))',
        borderRadius: '10px',
        // Die Grundfarbe der VORSCHAU, nicht der laufenden Oberfläche.
        background: palette.farben[0],
        color: 'var(--dsw-alias-label-primary, #ede5db)',
        fontFamily: SANS,
        textAlign: 'left',
        cursor: 'pointer',
        minWidth: 0,
        overflow: 'hidden',
      },
    },
    // Die Farbkante: Grund, Glut, Gold — die drei, die eine Palette ausmachen.
    React2.createElement('span', {
      'aria-hidden': 'true',
      style: {
        display: 'flex',
        height: '6px',
        borderRadius: '3px',
        overflow: 'hidden',
      },
    },
    palette.farben.map((farbe, i) => React2.createElement('span', {
      key: String(i),
      style: { flex: '1', background: farbe },
    }))),
    React2.createElement('span', {
      style: {
        fontFamily: SERIFE,
        fontSize: '.78rem',
        fontWeight: 600,
        // Der Name steht auf der Vorschaufläche, also in der Schriftfarbe
        // DIESER Palette — sonst wäre er auf Pergament weiss auf weiss.
        color: palette.grundton === 'hell' ? '#241d16' : '#ede5db',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
    }, palette.name),
    React2.createElement('span', {
      style: {
        fontSize: '.68rem',
        opacity: '.72',
        color: palette.grundton === 'hell' ? '#241d16' : '#ede5db',
      },
    }, TEXTE.grundton[palette.grundton] ?? palette.grundton),
  )
}

/**
 * Die Einstellungszeile „Farbkasten".
 * @param eigenschaften - der zusammengesetzte Steckplatz-Anteil; `usePalette`
 *   kommt aus dem `hooks`-Fach und ist der einzige Zugang zur Wahl.
 * @returns die Zeile.
 */
export function FarbkastenZeile(eigenschaften) {
  const React = require('react')
  const gewaehlt = eigenschaften.usePalette(s => s)
  const aufWahl = eigenschaften.aufWahl
  return React.createElement(
    'div',
    { style: { display: 'flex', flexDirection: 'column', gap: '.6rem', minWidth: 0 } },
    React.createElement('div', {
      style: {
        fontFamily: SANS,
        fontSize: '.86rem',
        fontWeight: 600,
        color: 'var(--dsw-alias-label-primary, #ede5db)',
      },
    }, TEXTE.titel),
    React.createElement('div', {
      style: {
        fontFamily: SANS,
        fontSize: '.78rem',
        lineHeight: 1.5,
        color: 'var(--dsw-alias-label-secondary, #b3a596)',
      },
    }, TEXTE.erklaerung),
    React.createElement(
      'div',
      {
        role: 'group',
        'aria-label': TEXTE.titel,
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '.5rem',
        },
      },
      PALETTEN.map(p => React.createElement(Wuerfel, {
        key: p.kennung,
        kennung: p.kennung,
        gewaehlt: p.kennung === gewaehlt,
        aufWahl,
      })),
    ),
    React.createElement('div', {
      style: {
        fontFamily: SANS,
        fontSize: '.74rem',
        color: 'var(--dsw-alias-label-secondary, #b3a596)',
      },
    }, TEXTE.partnerHinweis),
  )
}
