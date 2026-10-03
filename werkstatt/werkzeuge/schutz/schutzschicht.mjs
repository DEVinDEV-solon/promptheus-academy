/**
 * PROMPTHEUS Werkstatt — die Schutzschicht vor dem Sprachmodell.
 *
 * Ein kleiner Server auf 127.0.0.1. Die Werkstatt schickt ALLE Modellanfragen
 * hierher statt direkt zu OpenRouter (`DEEPSEEK_BASE_URL` und die `baseURL`
 * des Anbieters `openrouter` im Profil zeigen auf diese Adresse). Hier gilt:
 *
 *   1. **Maskieren** (maske.mjs) — jedes Text-Blatt der Anfrage: Eingabe,
 *      Verlauf, Werkzeugergebnisse, also auch Dateien, die der Agent selbst
 *      gelesen hat. Genau dort ist in Advocat etwas durchgerutscht.
 *   2. **Torschluss** — die fertige Nutzlast noch einmal gegen jeden bekannten
 *      Wert und Namen. Übersteht einer: Anfrage angehalten, nichts gesendet.
 *   3. **Unbekanntes Format** — eine Anfrage mit Inhalt, der kein JSON ist,
 *      geht nicht hinaus. Nichts ungeprüft.
 *   4. **Der Schlüssel liegt hier** (`data/werkstatt/schutzschicht.env`), nicht
 *      beim Harness. Der Harness hat nur einen Platzhalter; die Kopfzeile
 *      `Authorization`, die er schickt, wird verworfen und durch den echten
 *      Schlüssel ersetzt. Der Agent kann den Schlüssel deshalb nicht aus seiner
 *      Umgebung lesen — und würde er ihn irgendwo finden und senden wollen,
 *      fängt Schicht 1 ihn als bekannten Wert.
 *   5. **Protokoll** — jede Anfrage als Eintrag für den Audit-Trail
 *      (spool.mjs): Zeit, Modell, Grösse, Art und Anzahl der Ersetzungen,
 *      Ergebnis. Nie ein Inhalt, nie ein Wert.
 *
 * Antworten des Modells gehen unverändert zurück (gestreamt). Sie können
 * nichts enthalten, was nicht vorher maskiert hinausging.
 *
 * Aufruf (allein, für Tests): node schutzschicht.mjs [--port 3089] [--ziel URL]
 * Im Betrieb startet `werkzeuge/starten.mjs` sie im selben Prozess.
 */
import { request as httpRequest, createServer } from 'node:http'
import { request as httpsRequest } from 'node:https'
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { ACADEMY, maskeLaden } from './maske.mjs'
import { isoJetzt, spoolSchreiben } from './spool.mjs'
import { sitzungenLesen } from './sitzungen.mjs'

/** Der Port der Schutzschicht. Nicht 3082: den schlägt die Werkstatt als Ausweichport vor. */
export const SCHUTZ_PORT = 3089

/** Wohin weitergeleitet wird. */
export const ZIEL_VORGABE = 'https://openrouter.ai/api/v1'

/** Grösste Anfrage, die geprüft wird (Bilder im Verlauf können gross sein). */
const GROESSTE = 48 * 1024 * 1024

/** Kopfzeilen, die nicht weitergereicht werden. */
const NICHT_WEITER = new Set(['host', 'connection', 'content-length', 'authorization', 'x-api-key',
  'proxy-authorization', 'cookie', 'origin', 'referer', 'transfer-encoding', 'keep-alive', 'upgrade',
  'te', 'trailer'])

const STATUS_DATEI = join(ACADEMY, 'data', 'werkstatt', 'schutzschicht.json')
const SCHLUESSEL_DATEI = join(ACADEMY, 'data', 'werkstatt', 'schutzschicht.env')

/** Der echte Anbieter-Schlüssel — aus der eigenen Ebene. */
export function schluesselLesen(pfad = SCHLUESSEL_DATEI) {
  if (!existsSync(pfad)) return null
  for (const zeile of readFileSync(pfad, 'utf8').split(/\r?\n/)) {
    const t = zeile.match(/^\s*OPENROUTER_API_KEY\s*=\s*(.+)$/)
    if (t) return t[1].trim().replace(/^["']|["']$/g, '')
  }
  return null
}

/** Atomar schreiben: erst daneben, dann umbenennen. */
function atomar(pfad, inhalt) {
  mkdirSync(dirname(pfad), { recursive: true })
  const tmp = `${pfad}.${process.pid}.tmp`
  writeFileSync(tmp, inhalt, { encoding: 'utf8', mode: 0o600 })
  renameSync(tmp, pfad)
}

/**
 * Startet die Schutzschicht.
 * @param {{port?:number, ziel?:string, lernender?:number, werkstattUrsprung?:string,
 *          schluessel?:?string, maske?:object, sitzungenAlleMs?:number, still?:boolean}} o
 * @returns {Promise<{server: import('node:http').Server, port:number, stand:object, schliessen:()=>Promise<void>}>}
 */
export async function schutzschichtStarten(o = {}) {
  const port = o.port ?? SCHUTZ_PORT
  const ziel = new URL((o.ziel ?? ZIEL_VORGABE).replace(/\/+$/, '') + '/')
  const lernender = Number.isInteger(o.lernender) ? o.lernender : null
  const schluessel = o.schluessel !== undefined ? o.schluessel : schluesselLesen()
  const geladen = o.maske ? { maske: o.maske, bericht: [], namenGeladen: true, piiGeladen: true } : maskeLaden()
  const maske = geladen.maske
  const log = o.still ? () => {} : (...a) => console.log('schutzschicht:', ...a)

  const stand = {
    port, ziel: ziel.origin, gestartet: isoJetzt(), pid: process.pid,
    quellen: [
      ...geladen.bericht.map(b => ({ titel: b.titel, anzahl: b.werte })),
      { titel: 'Kontonamen (Fingerabdrücke)', anzahl: maske.stand.namen },
    ],
    regeln: maske.stand.muster + maske.stand.pii_regeln,
    anfragen: 0, angehalten: 0, maskiert: {},
    schluessel: schluessel ? 'eigene Ebene' : 'fehlt',
  }
  let statusZeit = null
  const statusSchreiben = (sofort = false) => {
    if (o.still && !o.statusDatei) return
    const tun = () => { statusZeit = null; try { atomar(o.statusDatei ?? STATUS_DATEI, JSON.stringify(stand, null, 2)) } catch { /* Anzeige */ } }
    if (sofort) return tun()
    if (statusZeit === null) statusZeit = setTimeout(tun, 1500)
  }

  const protokoll = (e) => {
    try { spoolSchreiben('schutzschicht', { ...e, metadata: { ...(e.metadata ?? {}), ...(lernender ? { lernender } : {}) } }, maske) } catch { /* Spool voll? Betrieb geht vor, Status zeigt es */ }
  }

  /** Antwort an den Harness, wenn nichts hinausgeht. Im OpenAI-Fehlerformat, damit die Werkstatt sie anzeigt. */
  const ablehnen = (res, code, text) => {
    res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
    res.end(JSON.stringify({ error: { message: `PROMPTHEUS-Schutzschicht: ${text}`, type: 'schutzschicht', code } }))
  }

  const server = createServer((req, res) => {
    const beginn = Date.now()
    const url = new URL(req.url ?? '/', 'http://127.0.0.1')

    // ── eigener Teil: Zustand und Vorschau für die Leiste über dem Eingabefeld
    if (url.pathname === '/schutz/stand') {
      res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' })
      return res.end(JSON.stringify(stand))
    }
    if (url.pathname === '/schutz/pruefen' && req.method === 'POST') {
      const teile = []
      let laenge = 0
      req.on('data', c => { laenge += c.length; if (laenge <= 256 * 1024) teile.push(c) })
      req.on('end', () => {
        let text = ''
        try { text = String(JSON.parse(Buffer.concat(teile).toString('utf8')).text ?? '') } catch { text = '' }
        const z = {}
        const maskiert = maske.text(text, z)
        res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' })
        res.end(JSON.stringify({ text: maskiert, treffer: z }))
      })
      return
    }

    // Die Entscheidung an der Schutzleiste (menschliche Aufsicht, AI Act Art. 14).
    // Nur Art und Anzahl der Treffer, nie Text.
    if (url.pathname === '/schutz/entscheidung' && req.method === 'POST') {
      const teile = []
      let laenge = 0
      req.on('data', c => { laenge += c.length; if (laenge <= 8192) teile.push(c) })
      req.on('end', () => {
        let j = {}
        try { j = JSON.parse(Buffer.concat(teile).toString('utf8')) } catch { j = {} }
        const entscheidung = ['mit_platzhaltern', 'text_aendern'].includes(j.entscheidung) ? j.entscheidung : 'unbekannt'
        const treffer = {}
        for (const [art, n] of Object.entries(j.treffer ?? {})) if (/^[a-z_]{2,20}$/.test(art) && Number.isInteger(n)) treffer[art] = n
        protokoll({ actor_type: 'user', actor_id: lernender ? `L-${lernender}` : 'werkstatt', actor_role: 'lernender',
          action_type: 'eingabe_entscheidung', action_category: 'ai_act_audit',
          action_description: entscheidung === 'mit_platzhaltern'
            ? 'Schutzleiste: Platzhalter eingesetzt, bevor die Nachricht hinausging'
            : 'Schutzleiste: Nachricht zum Ändern zurückgenommen',
          outcome: entscheidung === 'mit_platzhaltern' ? 'allowed' : 'denied',
          metadata: { hitl: true, entscheidung, maskiert: treffer } })
        res.writeHead(204, { 'cache-control': 'no-store' })
        res.end()
      })
      return
    }

    // ── alles unter /v1 geht zum Anbieter — nach der Prüfung
    if (!url.pathname.startsWith('/v1/') && url.pathname !== '/v1') {
      return ablehnen(res, 404, 'unbekannter Weg')
    }
    if (!schluessel) {
      protokoll({ action_type: 'llm_anfrage', action_description: 'Anfrage angehalten: kein Anbieter-Schlüssel in der Schutzschicht',
        outcome: 'blocked', severity: 'warning', resource: url.pathname })
      return ablehnen(res, 503, 'Es ist kein Anbieter-Schlüssel eingerichtet. In der Academy unter Einstellungen → Tutor-KI eintragen lassen.')
    }

    const teile = []
    let laenge = 0, zuGross = false
    req.on('data', c => {
      laenge += c.length
      if (laenge > GROESSTE) { zuGross = true; return }
      teile.push(c)
    })
    req.on('end', () => {
      stand.anfragen++
      if (zuGross) {
        stand.angehalten++; statusSchreiben()
        protokoll({ action_type: 'llm_anfrage', action_description: 'Anfrage angehalten: zu gross zum Prüfen',
          outcome: 'blocked', severity: 'warning', resource: url.pathname, metadata: { bytes: laenge } })
        return ablehnen(res, 413, 'Die Anfrage ist zu gross, um sie zu prüfen. Sie wurde nicht gesendet.')
      }
      const roh = Buffer.concat(teile)
      let body = null, modell = '', nachrichten = 0
      const zaehler = {}
      if (roh.length > 0) {
        let json
        try { json = JSON.parse(roh.toString('utf8')) } catch {
          stand.angehalten++; statusSchreiben()
          protokoll({ action_type: 'llm_anfrage', action_description: 'Anfrage angehalten: kein JSON, nicht prüfbar',
            outcome: 'blocked', severity: 'critical', resource: url.pathname, metadata: { bytes: roh.length } })
          return ablehnen(res, 415, 'Diese Anfrage hat ein Format, das nicht geprüft werden kann. Sie wurde nicht gesendet.')
        }
        modell = typeof json?.model === 'string' ? json.model : ''
        nachrichten = Array.isArray(json?.messages) ? json.messages.length : Array.isArray(json?.input) ? json.input.length : 0
        const maskiert = maske.wert(json, zaehler)
        body = Buffer.from(JSON.stringify(maskiert), 'utf8')
        const rest = maske.torschluss(body.toString('utf8'))
        if (rest.length > 0) {
          stand.angehalten++; statusSchreiben()
          protokoll({ action_type: 'llm_anfrage', action_description: 'Torschluss: ein bekannter Wert hat die Maskierung überstanden. Nichts gesendet.',
            outcome: 'blocked', severity: 'critical', resource: url.pathname, model: modell,
            metadata: { torschluss: rest, maskiert: zaehler, nachrichten } })
          return ablehnen(res, 451, 'Ein geschützter Wert hätte das Haus verlassen. Die Anfrage wurde angehalten und protokolliert.')
        }
      }
      for (const [art, n] of Object.entries(zaehler)) stand.maskiert[art] = (stand.maskiert[art] ?? 0) + n
      statusSchreiben()

      // ── weiterleiten
      const zielUrl = new URL(ziel.pathname.replace(/\/$/, '') + url.pathname.replace(/^\/v1/, '') + url.search, ziel)
      const kopf = {}
      for (const [k, v] of Object.entries(req.headers)) if (!NICHT_WEITER.has(k.toLowerCase())) kopf[k] = v
      kopf['authorization'] = `Bearer ${schluessel}`
      kopf['x-title'] = 'PROMPTHEUS Werkstatt'
      if (body) kopf['content-length'] = String(body.length)
      const anfrage = (zielUrl.protocol === 'https:' ? httpsRequest : httpRequest)(zielUrl, { method: req.method, headers: kopf }, antwort => {
        const zurueck = {}
        for (const [k, v] of Object.entries(antwort.headers)) if (!['connection', 'transfer-encoding', 'keep-alive'].includes(k)) zurueck[k] = v
        res.writeHead(antwort.statusCode ?? 502, zurueck)
        let aus = 0
        antwort.on('data', c => { aus += c.length })
        antwort.pipe(res)
        antwort.on('end', () => {
          const ok = (antwort.statusCode ?? 500) < 400
          const ersetzt = Object.values(zaehler).reduce((a, b) => a + b, 0)
          protokoll({
            action_type: 'llm_anfrage', resource: url.pathname, model: modell,
            action_description: `Modellanfrage ${req.method} ${url.pathname}` + (ersetzt ? ` — ${ersetzt} Ersetzung(en)` : ''),
            outcome: ok ? 'success' : 'error', severity: zaehler.geheim || zaehler.muster ? 'warning' : ok ? 'info' : 'warning',
            metadata: { maskiert: zaehler, nachrichten, bytes_hin: body?.length ?? 0, bytes_zurueck: aus,
              status: antwort.statusCode, dauer_ms: Date.now() - beginn },
          })
        })
      })
      anfrage.on('error', fehler => {
        protokoll({ action_type: 'llm_anfrage', action_description: 'Anbieter nicht erreichbar', outcome: 'error',
          severity: 'warning', resource: url.pathname, model: modell, metadata: { fehler: String(fehler.code ?? 'netz') } })
        if (!res.headersSent) ablehnen(res, 502, 'Der Anbieter ist gerade nicht erreichbar.')
        else res.destroy()
      })
      anfrage.end(body ?? undefined)
    })
  })

  await new Promise((ok, fehler) => {
    server.once('error', fehler)
    // Nur dieser Rechner. Nie 0.0.0.0.
    server.listen(port, '127.0.0.1', ok)
  })

  statusSchreiben(true)
  protokoll({ actor_type: 'system', actor_id: 'schutzschicht', action_type: 'schutzschicht_start',
    action_category: 'security', action_description: `Schutzschicht gestartet auf 127.0.0.1:${port}`,
    metadata: { quellen: stand.quellen, regeln: stand.regeln, schluessel: stand.schluessel,
      namen_geladen: geladen.namenGeladen, pii_geladen: geladen.piiGeladen } })
  log(`läuft auf http://127.0.0.1:${port} → ${ziel.origin}`)
  log(`geschützt: ${stand.quellen.map(q => `${q.titel} (${q.anzahl})`).join(', ')}; ${stand.regeln} Regeln`)

  // Die Sitzungen der Werkstatt regelmässig in den Audit-Trail.
  let uhr = null
  if (o.sitzungenAlleMs !== 0) {
    uhr = setInterval(() => { try { sitzungenLesen({ maske }) } catch { /* nächstes Mal */ } }, o.sitzungenAlleMs ?? 30000)
    uhr.unref()
  }

  return {
    server, port, stand,
    schliessen: () => new Promise(ok => { if (uhr) clearInterval(uhr); server.close(() => ok()) }),
  }
}

// ── allein gestartet ─────────────────────────────────────────────────────────
if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const arg = (name) => { const i = process.argv.indexOf(name); return i === -1 ? undefined : process.argv[i + 1] }
  const port = arg('--port') !== undefined ? Number(arg('--port')) : SCHUTZ_PORT
  schutzschichtStarten({ port, ziel: arg('--ziel') }).catch(f => {
    console.error('schutzschicht: Start fehlgeschlagen:', f.code ?? f.message)
    process.exit(1)
  })
}
