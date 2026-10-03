/**
 * Die Schutzleiste über dem Eingabefeld (Platz `conversation.composer.dock`).
 *
 * Übernommen aus Advocat (Vorschau „Genau so geht die Nachricht hinaus“ und
 * Halt vor dem Absenden) und auf die Werkstatt übertragen:
 *
 *   - **Beim Tippen** fragt die Leiste die Schutzschicht (über die Route
 *     `/promptheus-schutz/pruefen` der Node-Hälfte), was ersetzt würde, und
 *     zeigt es: „2 Angaben werden ersetzt: Telefonnummer, Kontoname“ — mit
 *     Vorschau des Wortlauts, der hinausgeht.
 *   - **Vor dem Absenden** hält sie an, wenn etwas ersetzt würde, und fragt:
 *     „Platzhalter einsetzen“ (der Text im Feld wird durch die maskierte
 *     Fassung ersetzt, auch im eigenen Verlauf steht dann kein Klartext; danach
 *     sendet Enter) oder „Text ändern“. Die Entscheidung geht in den Audit-Trail.
 *
 * Die Leiste ist Hilfe, nicht der Riegel: Was trotzdem durchgeht — etwa aus
 * einer Datei, die der Agent selbst liest —, ersetzt die Schutzschicht am
 * Netzwerkausgang. Genau diese Lehre stammt aus Advocat.
 *
 * Kein JSX: React kommt über das eingespeiste `require` (siehe index.ts).
 */

declare const require: (name: string) => any

/** Was die Leiste für ein Treffer-Kürzel sagt. */
const ART: Record<string, string> = {
  geheim: 'Geheimwert', muster: 'Schlüssel', person: 'Name aus dieser Academy',
  pii: 'persönliche Angabe', pii_weich: 'möglicher Name',
}

/** Treffer, die vor dem Absenden anhalten. Weiche Treffer werden nur gezeigt. */
const HART = ['geheim', 'muster', 'person', 'pii']

interface Befund { text: string; treffer: Record<string, number> }

async function pruefen(text: string): Promise<Befund | null> {
  try {
    const r = await fetch('/promptheus-schutz/pruefen', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text }),
    })
    if (!r.ok) return null
    return await r.json() as Befund
  } catch { return null }
}

function melden(entscheidung: string, treffer: Record<string, number>): void {
  fetch('/promptheus-schutz/entscheidung', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ entscheidung, treffer }),
  }).catch(() => { /* Protokoll ist Zusatz, nicht Bedingung */ })
}

/** Das Eingabefeld der laufenden Unterhaltung. */
function eingabefeld(): HTMLTextAreaElement | null {
  const kandidaten = Array.from(document.querySelectorAll('textarea')) as HTMLTextAreaElement[]
  return kandidaten.find(t => !t.disabled && t.offsetParent !== null && t.closest('[data-slot*="composer"], form, footer')) ??
    kandidaten.find(t => !t.disabled && t.offsetParent !== null) ?? null
}

/** Setzt den Text eines React-gesteuerten Feldes so, dass React es mitbekommt. */
function textSetzen(feld: HTMLTextAreaElement, text: string): void {
  const setzer = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set
  setzer?.call(feld, text)
  feld.dispatchEvent(new Event('input', { bubbles: true }))
}

function zusammenfassung(treffer: Record<string, number>, nurHart: boolean): string {
  return Object.entries(treffer)
    .filter(([a, n]) => n > 0 && (!nurHart || HART.includes(a)))
    .map(([a, n]) => `${n} × ${ART[a] ?? a}`).join(', ')
}

function hartAnzahl(treffer: Record<string, number>): number {
  return HART.reduce((s, a) => s + (treffer[a] ?? 0), 0)
}

export function Schutzleiste(): unknown {
  const React = require('react')
  const { useEffect, useRef, useState } = React
  const [befund, setBefund] = useState(null as Befund | null)
  const [vorschau, setVorschau] = useState(false)
  const [halt, setHalt] = useState(false)
  const freigabe = useRef('')       // Text, der mit Platzhaltern freigegeben ist
  const letzter = useRef(null as Befund | null)

  useEffect(() => {
    let feld: HTMLTextAreaElement | null = null
    let uhr: ReturnType<typeof setTimeout> | null = null
    let suche: ReturnType<typeof setInterval> | null = null

    const neu = () => {
      if (!feld) return
      const text = feld.value
      if (uhr) clearTimeout(uhr)
      if (text.trim() === '') { letzter.current = null; setBefund(null); setHalt(false); return }
      uhr = setTimeout(async () => {
        const b = await pruefen(text)
        if (feld && feld.value === text) { letzter.current = b; setBefund(b) }
      }, 350)
    }

    /** Vor dem Absenden: anhalten, wenn noch ersetzt würde und nicht freigegeben ist. */
    const sperre = async (ereignis: Event) => {
      if (!feld) return
      const text = feld.value
      if (text.trim() === '' || freigabe.current === text) return
      let b = letzter.current
      if (!b || b.text === undefined) b = await pruefen(text)
      if (b && hartAnzahl(b.treffer) > 0 && b.text !== text) {
        ereignis.preventDefault()
        ereignis.stopImmediatePropagation()
        letzter.current = b
        setBefund(b)
        setHalt(true)
      }
    }
    // Die Prüfung muss VOR dem Senden fertig sein. Deshalb wird Enter immer
    // erst angehalten, wenn der letzte Befund noch zum Text passt und Treffer hat.
    const taste = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.shiftKey || e.isComposing || !feld) return
      const b = letzter.current
      if (freigabe.current === feld.value) return
      if (b && hartAnzahl(b.treffer) > 0 && b.text !== feld.value) {
        e.preventDefault(); e.stopImmediatePropagation(); setBefund(b); setHalt(true)
      }
    }
    const klick = (e: MouseEvent) => {
      const ziel = e.target as HTMLElement | null
      const knopf = ziel?.closest('button')
      if (!knopf || !feld) return
      const art = (knopf.getAttribute('aria-label') ?? '') + ' ' + (knopf.getAttribute('data-slot') ?? '') + ' ' + (knopf.getAttribute('type') ?? '')
      if (!/send|senden|submit|input\.send/i.test(art)) return
      void sperre(e)
      const b = letzter.current
      if (b && hartAnzahl(b.treffer) > 0 && b.text !== feld.value && freigabe.current !== feld.value) {
        e.preventDefault(); e.stopImmediatePropagation()
      }
    }

    const anbinden = () => {
      const f = eingabefeld()
      if (!f || f === feld) return
      if (feld) { feld.removeEventListener('input', neu); feld.removeEventListener('keydown', taste, true) }
      feld = f
      feld.addEventListener('input', neu)
      feld.addEventListener('keydown', taste, true)
      neu()
    }
    anbinden()
    suche = setInterval(anbinden, 1000)
    document.addEventListener('click', klick, true)
    return () => {
      if (suche) clearInterval(suche)
      if (uhr) clearTimeout(uhr)
      document.removeEventListener('click', klick, true)
      if (feld) { feld.removeEventListener('input', neu); feld.removeEventListener('keydown', taste, true) }
    }
  }, [])

  const h = React.createElement
  if (!befund) return null
  const hart = hartAnzahl(befund.treffer)
  const weich = befund.treffer.pii_weich ?? 0
  if (hart === 0 && weich === 0) return null

  const mitPlatzhaltern = () => {
    const feld = eingabefeld()
    if (!feld) return
    textSetzen(feld, befund.text)
    freigabe.current = befund.text
    melden('mit_platzhaltern', befund.treffer)
    setHalt(false)
    feld.focus()
  }
  const aendern = () => {
    melden('text_aendern', befund.treffer)
    setHalt(false)
    eingabefeld()?.focus()
  }

  return h('div', {
    role: halt ? 'alertdialog' : 'status', 'aria-live': 'polite',
    style: {
      margin: '0 0 6px', padding: '8px 12px', borderRadius: '10px', fontSize: '13px', lineHeight: 1.45,
      background: 'var(--dsw-alias-bg-surface, rgba(20,14,10,.92))',
      border: `1px solid ${halt ? 'var(--dsw-alias-text-danger, #e05a4f)' : 'var(--dsw-alias-border-default, rgba(255,255,255,.18))'}`,
      borderLeft: `3px solid ${halt ? 'var(--dsw-alias-text-danger, #e05a4f)' : 'var(--dsw-alias-text-accent, #ff7a1c)'}`,
    },
  },
  h('div', { style: { display: 'flex', gap: '10px', alignItems: 'baseline', flexWrap: 'wrap' } },
    h('b', null, halt ? 'Angehalten, nichts gesendet:' : 'Schutz:'),
    h('span', null, hart > 0
      ? `${zusammenfassung(befund.treffer, true)} — ${hart === 1 ? 'wird' : 'werden'} ersetzt, bevor Hephaistos die Nachricht sieht.`
      : `${weich} × möglicher Name — bleibt stehen. Ist es ein echter Name, ersetze ihn lieber.`),
    h('button', { type: 'button', onClick: () => setVorschau(!vorschau),
      style: { marginLeft: 'auto', background: 'none', border: 0, color: 'inherit', textDecoration: 'underline', cursor: 'pointer', font: 'inherit' } },
      vorschau ? 'Vorschau schliessen' : 'So geht es hinaus')),
  vorschau ? h('pre', { style: { margin: '6px 0 0', whiteSpace: 'pre-wrap', wordBreak: 'break-word', opacity: .85, maxHeight: '9em', overflow: 'auto', font: 'inherit' } }, befund.text) : null,
  halt ? h('div', { style: { display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' } },
    h('button', { type: 'button', onClick: mitPlatzhaltern, autoFocus: true,
      style: { padding: '5px 12px', borderRadius: '8px', border: 0, cursor: 'pointer', fontWeight: 600,
        background: 'var(--dsw-alias-text-accent, #ff7a1c)', color: 'var(--dsw-alias-bg-base, #14100c)' } }, 'Platzhalter einsetzen'),
    h('button', { type: 'button', onClick: aendern,
      style: { padding: '5px 12px', borderRadius: '8px', cursor: 'pointer', background: 'none', color: 'inherit',
        border: '1px solid var(--dsw-alias-border-default, rgba(255,255,255,.3))' } }, 'Text ändern')) : null)
}
