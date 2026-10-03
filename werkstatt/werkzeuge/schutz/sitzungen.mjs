/**
 * PROMPTHEUS Werkstatt — die Sitzungen der Werkstatt für den Audit-Trail.
 *
 * Übertragen aus Hermy (`audittrail/dsh_sessions.py`). Der Harness schreibt
 * jede Sitzung als Journal: `werkstatt/.dsh/sessions/<arbeitsordner>/
 * session-<id>/session.v4.jsonl.zstd` — mehrere zstd-Rahmen hintereinander,
 * je Rahmen Zeilen JSON. (Node liest einen Strom nur bis zum Ende des ersten
 * Rahmens; deshalb wird hier Rahmen für Rahmen entpackt.)
 *
 * Was in den Audit-Trail geht (DSGVO Art. 5(1)(c) und (e), AI Act Art. 12/14):
 *   Anfrage eines Menschen   gekürzt und maskiert, 180 Tage
 *   Antwort des Modells      gekürzt und maskiert, 180 Tage
 *   eingeblendeter Kontext   nur Art und Grösse
 *   Werkzeugaufruf           Name, Befehl/Pfad (maskiert), Ergebnisgrösse — NIE die Ausgabe
 *   Freigaben                gefragt / entschieden (menschliche Aufsicht)
 *
 * Wem eine Sitzung gehört: `data/werkstatt/laeufe.jsonl` hält je Start der
 * Werkstatt das Konto aus dem Ticket fest; ein Eintrag gehört dem Lauf, der
 * zuletzt vor ihm begann.
 *
 * Idempotent: Die `audit_id` folgt aus Sitzung und Eintrag; die Academy nimmt
 * jede nur einmal. Ein Merkzettel (`data/audit/sitzungen.json`) hält fest, wie
 * viele Einträge je Sitzung schon gelesen sind, damit der Spool nicht wächst.
 *
 * Aufruf: node sitzungen.mjs --einmal [--json]
 */
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { zstdDecompressSync } from 'node:zlib'
import { ACADEMY, WERKSTATT, maskeLaden } from './maske.mjs'
import { auditId, isoJetzt, spoolOrdner, spoolSchreiben } from './spool.mjs'

const MAGIE = Buffer.from([0x28, 0xb5, 0x2f, 0xfd])
const ANFRAGE_ZEICHEN = 500
const INHALT_TAGE = 180
const BETRIEB_TAGE = 365

/** Einträge, die nur wiederholen, was ein anderer schon sagt. */
const UEBERSPRINGEN = new Set(['assistant/chunk', 'text-chunks', 'tool-call-chunks', 'request/context',
  'request/header', 'session/title-llm-request', 'step/start', 'step/end', 'permission/preset',
  'sandbox/mode', 'approval/policy', 'todo/write', 'session/title', 'turn/start', 'turn/end',
  'assistant/attempt', 'model/selection', 'session-log-deepseek/delivery-accepted', 'system/message'])

/** Argumente eines Werkzeugs, die aufgezeichnet werden. Was ein Werkzeug TIPPT, nicht. */
const ARG_SCHLUESSEL = ['command', 'file_path', 'path', 'url', 'pattern', 'query', 'description', 'skill',
  'subagent_type', 'notebook_path', 'glob', 'ref', 'task_id', 'cwd']

const HEIKEL = /(\.env\b|secret|credential|passw|kennwort|zugangsdaten|token|\.ssh|id_rsa|private[_-]?key|\.credentials|oauth|api[_-]?key|login|data[\\/]|promptheus\.db|audit\.sqlite|schutzschicht\.env)/i

export function sitzungsWurzel() {
  return process.env.PU_TEST_SITZUNGEN || join(WERKSTATT, '.dsh', 'sessions')
}

function kuerzen(v, n) {
  const s = String(v ?? '').split(/\s+/).join(' ').trim()
  return s.length <= n ? s : s.slice(0, n - 1) + '…'
}

function iso(ms) {
  const z = Number(ms)
  return Number.isFinite(z) && z > 0 ? isoJetzt(z) : isoJetzt()
}

function textTeile(inhalt) {
  if (!Array.isArray(inhalt)) return typeof inhalt === 'string' ? inhalt : ''
  return inhalt.map(b => typeof b === 'string' ? b : (b && b.type === 'text' && b.text) ? String(b.text) : '')
    .filter(Boolean).join('\n')
}

/** Ein Journal entpacken: Rahmen für Rahmen; eine halbe letzte Zeile wird verworfen. */
export function journalLesen(pfad) {
  const buf = readFileSync(pfad)
  let text = ''
  if (buf.subarray(0, 4).equals(MAGIE)) {
    const stellen = []
    for (let i = buf.indexOf(MAGIE); i !== -1; i = buf.indexOf(MAGIE, i + 1)) stellen.push(i)
    stellen.push(buf.length)
    let start = stellen[0]
    for (let k = 1; k < stellen.length; k++) {
      // Die Magie kann zufällig auch in komprimierten Daten stehen: dann scheitert
      // das Stück und wird mit dem nächsten zusammen versucht.
      try { text += zstdDecompressSync(buf.subarray(start, stellen[k])).toString('utf8'); start = stellen[k] } catch { /* weiter */ }
    }
  } else {
    text = buf.toString('utf8')
  }
  const eintraege = []
  for (const zeile of text.split('\n')) {
    if (!zeile.trim()) continue
    try { const r = JSON.parse(zeile); if (r && typeof r === 'object') eintraege.push(r) } catch { /* halbe Zeile */ }
  }
  return eintraege
}

/** Alle Journale, neueste zuerst. */
export function journale(wurzel = sitzungsWurzel()) {
  const aus = []
  const gehe = (d, tiefe) => {
    if (tiefe > 4 || !existsSync(d)) return
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name)
      if (e.isDirectory()) gehe(p, tiefe + 1)
      else if (/\.jsonl(\.zstd?|)$/.test(e.name)) aus.push({ pfad: p, zeit: statSync(p).mtimeMs })
    }
  }
  gehe(wurzel, 0)
  return aus.sort((a, b) => b.zeit - a.zeit).map(x => x.pfad)
}

/** Die Läufe der Werkstatt (wer hat wann gestartet). */
function laeufeLesen() {
  const pfad = join(ACADEMY, 'data', 'werkstatt', 'laeufe.jsonl')
  if (!existsSync(pfad)) return []
  return readFileSync(pfad, 'utf8').split('\n').map(z => { try { return JSON.parse(z) } catch { return null } })
    .filter(l => l && Number.isInteger(l.lernender) && Number.isFinite(l.ab)).sort((a, b) => a.ab - b.ab)
}

function lernenderZu(laeufe, ms) {
  let wer = null
  for (const l of laeufe) { if (l.ab <= ms) wer = l.lernender; else break }
  return wer
}

function argumente(roh) {
  let a = roh
  if (typeof a === 'string') { try { a = JSON.parse(a) } catch { return [kuerzen(a, 300), ''] } }
  if (!a || typeof a !== 'object') return [kuerzen(a, 300), '']
  const teile = []
  let ressource = ''
  for (const k of ARG_SCHLUESSEL) {
    const v = a[k]
    if (v === undefined || v === null || v === '') continue
    if (['file_path', 'path', 'url', 'notebook_path'].includes(k) && !ressource) ressource = kuerzen(v, 300)
    teile.push(`${k}=${kuerzen(v, 300)}`)
  }
  return [kuerzen(teile.join('; '), 500), ressource]
}

/**
 * Bildet die Einträge eines Journals auf Audit-Einträge ab.
 * @returns {Array<object>} Einträge für spoolSchreiben (noch unmaskiert)
 */
export function sitzungsEintraege(eintraege, pfad, laeufe = []) {
  const kopf = eintraege.find(r => r.type === 'session') ?? {}
  const sid = String(kopf.id ?? dirname(pfad).split(/[\\/]/).pop())
  const preset = String(kopf.agentPreset ?? '')
  const aus = []
  const neu = (schluessel, ms, e) => {
    const wer = lernenderZu(laeufe, Number(ms) || 0)
    aus.push({
      audit_id: auditId('dsh', sid, schluessel), ts: iso(ms), session_id: sid, project: 'werkstatt',
      actor_type: 'agent', actor_id: 'hephaistos', actor_role: 'werkstatt',
      action_category: 'ai_act_audit', retention_days: BETRIEB_TAGE, ...e,
      metadata: { agent_preset: preset, ...(wer ? { lernender: wer } : {}), ...(e.metadata ?? {}) },
    })
  }

  const bekannt = new Set()
  for (const r of eintraege) if (r.type === 'user/message' && r.data?.id) bekannt.add(r.data.id)
  const offen = new Map()

  const werkzeug = (aufruf, ergebnis) => {
    const [beschr, ressource] = argumente(aufruf.arguments)
    const name = aufruf.name || 'werkzeug'
    let outcome = 'success', severity = 'info'
    const meta = { tool: name }
    if (ergebnis) { meta.response_chars = ergebnis.zeichen; if (ergebnis.fehler) { outcome = 'error'; severity = 'warning' } }
    else outcome = 'pending'
    if (HEIKEL.test(beschr) || HEIKEL.test(ressource)) { meta.heikel = true; if (severity === 'info') severity = 'warning' }
    neu(`tool:${aufruf.callId}`, aufruf.time, {
      action_type: ergebnis ? 'tool_result' : 'tool_attempt',
      action_description: beschr ? `${name}: ${beschr}` : name, resource: ressource, outcome, severity, metadata: meta,
    })
  }

  for (const r of eintraege) {
    const typ = r.type ?? ''
    const d = r.data ?? {}
    const schl = Number.isInteger(r.seq) ? `${typ}:${r.seq}`
      : `${typ}:h` + createHash('sha1').update(JSON.stringify(r)).digest('hex').slice(0, 12)
    if (UEBERSPRINGEN.has(typ)) continue

    if (typ === 'session') {
      neu(schl, Date.parse(r.createdAt) || r.time, { action_type: 'session_start',
        action_description: `Werkstatt-Sitzung begonnen (${preset || 'Standard'})`, resource: kuerzen(kopf.cwd, 300) })
    } else if (typ === 'session/end-seed') {
      neu(schl, r.time, { action_type: 'session_end', action_description: 'Werkstatt-Sitzung beendet' })
    } else if (typ === 'user/message' || typ === 'agent/inbox/spliced') {
      const liste = typ === 'user/message' ? [d] : (Array.isArray(d.inserted) ? d.inserted : [])
      for (const m of liste) {
        if (typ === 'agent/inbox/spliced' && m.id && bekannt.has(m.id)) continue
        const art = String(m.source?.kind ?? 'unbekannt')
        const text = textTeile(m.content)
        const k = typ === 'user/message' ? schl : `${schl}:${m.id ?? art}`
        if (art === 'user') {
          neu(k, r.time, { action_type: 'prompt', action_category: 'knowledge', retention_days: INHALT_TAGE,
            action_description: text ? `Anfrage: ${kuerzen(text, ANFRAGE_ZEICHEN)}` : 'leere Anfrage',
            metadata: { chars: text.length, gekuerzt: text.length > ANFRAGE_ZEICHEN } })
        } else {
          neu(k, r.time, { action_type: 'context_injected',
            action_description: `Kontext eingeblendet (${art}, ${text.length} Zeichen)`,
            metadata: { context_kind: art, chars: text.length } })
        }
      }
    } else if (typ === 'assistant/message') {
      const m = d.message ?? {}
      const text = textTeile(m.content)
      const aufrufe = Array.isArray(m.content) ? m.content.filter(b => b && b.type === 'tool-call').length : 0
      if (text.trim()) {
        neu(schl, r.time, { action_type: 'chat_response', action_category: 'knowledge', retention_days: INHALT_TAGE,
          model: String(m.source?.model ?? ''), action_description: `Antwort: ${kuerzen(text, ANFRAGE_ZEICHEN)}`,
          metadata: { chars: text.length, gekuerzt: text.length > ANFRAGE_ZEICHEN, tool_calls: aufrufe || undefined,
            input_tokens: d.usage?.inputTokens, output_tokens: d.usage?.outputTokens } })
      }
    } else if (typ === 'tool/call') {
      offen.set(String(d.callId), { ...d, time: r.time })
    } else if (typ === 'tool/result') {
      const m = d.message ?? {}
      const cid = String(m.source?.callId ?? '')
      let zeichen = 0, fehler = false
      for (const b of Array.isArray(m.content) ? m.content : []) {
        if (!b || typeof b !== 'object') continue
        fehler = fehler || Boolean(b.isError)
        for (const t of Array.isArray(b.content) ? b.content : []) zeichen += String(t?.text ?? '').length
      }
      const aufruf = offen.get(cid)
      if (aufruf) { offen.delete(cid); werkzeug(aufruf, { zeichen, fehler }) }
      else neu(`toolresult:${cid || schl}`, r.time, { action_type: 'tool_result', action_description: 'Werkzeug-Ergebnis (Aufruf nicht im Journal)',
        outcome: fehler ? 'error' : 'success', severity: fehler ? 'warning' : 'info', metadata: { response_chars: zeichen } })
    } else if (typ === 'approval/asked') {
      neu(schl, r.time, { action_type: 'approval_asked', outcome: 'pending', severity: 'warning',
        action_description: `Freigabe erbeten: ${kuerzen(d.reason, ANFRAGE_ZEICHEN)}`, resource: kuerzen(d.toolName, 120),
        metadata: { hitl: true, tool: d.toolName, call_id: d.callId } })
    } else if (typ === 'approval/decided') {
      const erlaubt = String(d.outcome ?? '') === 'allowed-once'
      neu(schl, r.time, { action_type: 'approval_decided', outcome: erlaubt ? 'allowed' : 'denied',
        severity: erlaubt ? 'info' : 'warning', action_description: `Freigabe-Entscheidung: ${d.outcome ?? 'unbekannt'}`,
        metadata: { hitl: true, decision: d.outcome, granted: erlaubt } })
    } else if (typ === 'command/run') {
      neu(schl, r.time, { action_type: 'command', resource: kuerzen(d.name, 120),
        action_description: `Befehl: ${kuerzen(d.name, 120)} ${kuerzen(d.args, 200)}` })
    }
  }
  for (const aufruf of offen.values()) werkzeug(aufruf, null)
  return aus
}

/**
 * Liest alle Journale und schreibt neue Einträge in den Spool.
 * @returns {{sitzungen:number, dateien:number, neu:number}}
 */
export function sitzungenLesen(o = {}) {
  const maske = o.maske ?? maskeLaden().maske
  const merkPfad = join(dirname(spoolOrdner()), 'sitzungen.json')
  let merk = {}
  try { merk = JSON.parse(readFileSync(merkPfad, 'utf8')) } catch { merk = {} }
  const laeufe = laeufeLesen()
  let dateien = 0, neuGesamt = 0
  const pfade = journale(o.wurzel)
  for (const pfad of pfade) {
    const st = statSync(pfad)
    const alt = merk[pfad]
    if (alt && alt.groesse === st.size && alt.zeit === st.mtimeMs) continue
    dateien++
    const eintraege = sitzungsEintraege(journalLesen(pfad), pfad, laeufe)
    const ab = alt && alt.anzahl <= eintraege.length ? alt.anzahl : 0
    // Offene Werkzeugaufrufe stehen am Ende und ändern sich noch; sie werden
    // beim nächsten Mal mit ihrem Ergebnis erneut geschrieben (eigene audit_id).
    for (const e of eintraege.slice(ab)) { spoolSchreiben('werkstatt', e, maske); neuGesamt++ }
    merk[pfad] = { groesse: st.size, zeit: st.mtimeMs, anzahl: eintraege.filter(e => e.action_type !== 'tool_attempt').length }
  }
  mkdirSync(dirname(merkPfad), { recursive: true })
  writeFileSync(merkPfad, JSON.stringify(merk), 'utf8')
  return { sitzungen: pfade.length, dateien, neu: neuGesamt }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const r = sitzungenLesen()
  if (process.argv.includes('--json')) console.log(JSON.stringify(r))
  else console.log(`sitzungen: ${r.sitzungen} Sitzungen, ${r.dateien} geändert, ${r.neu} neue Einträge`)
}
