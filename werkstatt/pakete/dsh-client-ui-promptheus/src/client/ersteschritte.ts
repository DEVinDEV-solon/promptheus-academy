/**
 * Die Karte „Erste Schritte“ (Platz `conversation.input.dock`, über dem
 * Eingabefeld).
 *
 * Erscheint, bis sie einmal mit „Verstanden“ geschlossen wurde. Der Merker
 * liegt im Browser (localStorage, nur diese Werkstatt). Ohne Speicher — etwa im
 * privaten Fenster — erscheint sie bei jedem Öffnen wieder; das ist harmlos.
 *
 * Inhalt: wer Hephaistos ist, dass er vor dem Schreiben fragt, wo die Farben
 * eingestellt werden, und was die Schutzleiste tut. Keine Links nach draussen.
 *
 * Kein JSX: React kommt über das eingespeiste `require` (siehe index.ts).
 */

declare const require: (name: string) => any

/** Der Merker. Mit Fassung, damit eine überarbeitete Karte wieder erscheint. */
export const MERKER = 'promptheus.ersteSchritte.1'

/** Die Punkte der Karte — Text, kein HTML. */
export const PUNKTE: readonly (readonly [string, string])[] = [
  ['Hephaistos', 'ist dein Werkstattleiter. Schreib ihm unten, was du bauen willst — ein Satz reicht für den Anfang.'],
  ['Rückfrage', 'Bevor er etwas schreibt, verschiebt oder löscht, fragt er dich. Du entscheidest.'],
  ['Farben', 'Unter „Einstellungen“ › „Allgemein“ › „Farbkasten“ wählst du eine von sechs Paletten: Schmiede, Pergament, Olymp, Marmor, Terrakotta, Funkenflug.'],
  ['Schutz', 'Tippst du eine Telefonnummer, Mail-Adresse oder einen Namen, zeigt die Leiste über dem Eingabefeld, was durch einen Platzhalter ersetzt wird.'],
  ['Fragen', 'Zur Werkstatt selbst — Zugang, Einstellungen, Community — fragst du Hephaistos.'],
]

function gesehen(): boolean {
  try { return localStorage.getItem(MERKER) === '1' } catch { return false }
}

function merken(): void {
  try { localStorage.setItem(MERKER, '1') } catch { /* ohne Speicher erscheint die Karte wieder */ }
}

export function ErsteSchritte(): unknown {
  const React = require('react')
  const [offen, setOffen] = React.useState(() => !gesehen())
  if (!offen) return null
  const h = React.createElement
  return h('section', {
    'aria-label': 'Erste Schritte in der Werkstatt',
    style: {
      margin: '0 0 8px', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', lineHeight: 1.5,
      background: 'var(--dsw-alias-bg-surface, rgba(20,14,10,.92))',
      border: '1px solid var(--dsw-alias-border-default, rgba(255,255,255,.18))',
      borderLeft: '3px solid var(--dsw-alias-text-accent, #ff7a1c)',
    },
  },
  h('div', { style: { fontWeight: 600, marginBottom: '4px' } }, 'Erste Schritte in der Werkstatt'),
  h('ul', { style: { margin: '0 0 8px', paddingLeft: '18px' } },
    ...PUNKTE.map(([wort, satz]) => h('li', { key: wort }, h('b', null, wort), ' ', satz))),
  h('button', {
    type: 'button',
    onClick: () => { merken(); setOffen(false) },
    style: {
      padding: '5px 12px', borderRadius: '8px', border: 0, cursor: 'pointer', fontWeight: 600,
      background: 'var(--dsw-alias-text-accent, #ff7a1c)', color: 'var(--dsw-alias-bg-base, #14100c)',
    },
  }, 'Verstanden'))
}
