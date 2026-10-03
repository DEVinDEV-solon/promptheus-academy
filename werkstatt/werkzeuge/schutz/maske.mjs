/**
 * PROMPTHEUS Werkstatt — die Maske: was ein Sprachmodell nie sehen darf.
 *
 * Ein Modul für drei Stellen, damit überall dieselbe Regel gilt:
 *   - die Schutzschicht vor dem Modell (`schutzschicht.mjs`), der letzte Riegel,
 *   - die Leiste über dem Eingabefeld der Werkstatt (Vorschau vor dem Senden),
 *   - der Sitzungsleser für den Audit-Trail (`sitzungen.mjs`).
 *
 * Vier Schichten, in dieser Reihenfolge:
 *
 *   1. **Bekannte Geheimwerte** — jeder Wert aus den `.env`-Dateien der Academy
 *      und der Werkstatt, dessen Name nach Geheimnis klingt, wörtlich. Wird zu
 *      `[GEHEIM:NAME]`. Das fängt auch Kennwörter, die keinem Muster folgen.
 *   2. **Geheimnis-Muster** — Schlüssel, Tokens, private Schlüssel. Wortgleich
 *      mit Hermy (`audittrail/redaction.py`) und `srv/audit.php`. Wird zu
 *      `[REDACTED:typ]`.
 *   3. **Bekannte Namen** — Anzeigenamen und Kennungen der Konten dieser
 *      Academy. Die Academy gibt sie nur als Fingerabdruck heraus (sha256 mit
 *      Salz, `data/werkstatt/schutz-namen.json`), hier wird jede Wortfolge
 *      gehasht und verglichen. Wird zu `[PERSON]`.
 *   4. **Harte PII-Regeln der Academy** — Telefon, E-Mail, Kartennummern …,
 *      dasselbe Regelwerk wie in der Community (`srv/pii_regeln.json`,
 *      ausgelegt von `assets/js/pii.js`). Weiche Regeln (Vornamenlisten) nur
 *      zählen: in Programmcode wären sie zu oft falscher Alarm.
 *
 * **Torschluss** (aus Advocat, `srv/schutzschild.php`): Nach dem Maskieren wird
 * die fertige Nutzlast als Ganzes noch einmal gegen jeden bekannten Wert und
 * jeden Namen geprüft. Übersteht einer, geht nichts hinaus. Das ist die Lehre
 * aus Advocat: Dort ist trotz Filter etwas durchgerutscht, weil das Modell
 * Dateien selbst las — am Nachrichtenfilter vorbei. Die Schutzschicht sitzt
 * deshalb am Netzwerkausgang, wo auch Verlauf und Dateiinhalte vorbeimüssen.
 *
 * Werte werden nie protokolliert, nur Art und Anzahl der Treffer.
 */
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** …/werkstatt */
export const WERKSTATT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
/** …/PROMPTHEUS (die Academy) */
export const ACADEMY = resolve(WERKSTATT, '..')

/** Geheimnis-Muster, spezifisch vor allgemein. Wortgleich mit srv/audit.php. */
export const GEHEIM_MUSTER = [
  ['private-key', /-----BEGIN[ A-Z]*PRIVATE KEY-----[\s\S]*?-----END[ A-Z]*PRIVATE KEY-----/g],
  ['aws-access-key', /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g],
  ['jwt', /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g],
  ['bearer-token', /\b[Bb]earer\s+[A-Za-z0-9._-]{12,}/g],
  ['slack-token', /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g],
  ['github-token', /\bgh[pousr]_[A-Za-z0-9]{20,}\b/g],
  ['openai-key', /\bsk-[A-Za-z0-9_-]{20,}\b/g],
  ['telegram-bot-token', /\b\d{6,12}:[A-Za-z0-9_-]{30,}\b/g],
  ['google-oauth-secret', /\bGOCSPX-[A-Za-z0-9_-]{20,}/g],
  ['google-api-key', /\bAIza[0-9A-Za-z_-]{30,}/g],
  ['google-refresh-token', /\b1\/\/[0-9A-Za-z_-]{30,}/g],
  ['opaque-token', /(?<![A-Za-z0-9_-])(?=[A-Za-z0-9_\-#]*\d)(?=[A-Za-z0-9_\-#]*[A-Za-z])[A-Za-z0-9_-]{32,}(?:#[A-Za-z0-9_-]{8,})?(?![A-Za-z0-9_-])/g],
]

/**
 * Sieht eine lange Zeichenkette wirklich zufällig aus (Token, Schlüssel) — oder
 * ist sie ein Dateiname wie `2026-07-28-directory-picker-capability-seam`,
 * eine Sitzungs-ID oder ein Git-Hash? Das Hermy-Muster `opaque-token` trifft
 * alle davon; in Protokollen ist das egal, im Verkehr mit dem Modell nicht:
 * Der Agent könnte die Datei sonst nicht mehr benennen (gemessen 03.10.2026:
 * 10 Dateinamen in einer einzigen Anfrage).
 *   - mehr als 2 Bindestriche/Unterstriche: Wörter, kein Token (auch UUIDs)
 *   - reines Hex: erst ab 48 Zeichen (Git-SHA-1 hat 40, SHA-256-Schlüssel 64)
 *   - sonst: Streuung der Zeichen mindestens 4 Bit je Zeichen
 */
export function siehtZufaelligAus(s) {
  if ((s.match(/[-_]/g) ?? []).length > 2) return false
  if (/^[0-9a-f]+$/i.test(s)) return s.length >= 48
  const zahl = new Map()
  for (const z of s) zahl.set(z, (zahl.get(z) ?? 0) + 1)
  let bits = 0
  for (const n of zahl.values()) { const p = n / s.length; bits -= p * Math.log2(p) }
  return bits >= 4.0
}

/** Eingeblendeter Kontext des Harness kommt als Rolle `user`, ist aber nicht getippt. */
const EINGEBLENDET = /^\s*(<system-reminder>|Current runtime context)/

/** „schlüssel = wert“ mit einem Namen, der nach Geheimnis klingt. */
const ZUWEISUNG = /((?:api[_-]?key|secret|password|passwd|passwort|kennwort|token|access[_-]?key|private[_-]?key))(\s*[:=]\s*)(['"]?[A-Za-z0-9/+_.-]{8,}['"]?)/gi

/** Namen in einer `.env`, deren Wert als Geheimnis gilt. */
const GEHEIMER_NAME = /(KEY|TOKEN|SECRET|PASS|PASSWORT|KENNWORT|SCHLUESSEL|SALT|SALZ|PRIVATE|CREDENTIAL|COOKIE|DSN|WEBHOOK)/i

/**
 * Strukturfelder einer Modellanfrage, die nie maskiert werden: Kennungen,
 * Rollen, Modellnamen, Signaturen und eingebettete Bilder. Ein ersetzter
 * Signaturwert würde die Antwort des Anbieters brechen, ein ersetztes Bild
 * wäre kaputt — und keins davon trägt Text, den ein Mensch geschrieben hat.
 */
const NIE_MASKIEREN = new Set(['model', 'role', 'type', 'id', 'tool_call_id', 'call_id', 'name',
  'signature', 'encrypted_content', 'thought_signature', 'finish_reason', 'object', 'format',
  'media_type', 'mime_type', 'detail', 'provider', 'reasoning_effort', 'effort'])

/** Einfache `NAME=WERT`-Datei lesen. */
function envLesen(pfad) {
  if (!existsSync(pfad)) return {}
  const werte = {}
  for (const zeile of readFileSync(pfad, 'utf8').split(/\r?\n/)) {
    const t = zeile.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
    if (t) werte[t[1]] = t[2].trim().replace(/^["']|["']$/g, '')
  }
  return werte
}

/**
 * Die Orte, an denen Geheimnisse liegen. Gelesen wird nur, was nach
 * Geheimnis klingt; gemeldet werden Name und Anzahl, nie der Wert.
 */
export function geheimQuellen() {
  return [
    ['Academy .env', join(ACADEMY, '.env')],
    ['Werkstatt-Harness .env', join(WERKSTATT, 'deepseek-harness', '.env')],
    ['Werkstatt-Zuhause .env', join(WERKSTATT, '.dsh', '.env')],
    ['Schutzschicht', join(ACADEMY, 'data', 'werkstatt', 'schutzschicht.env')],
  ]
}

/** Wörtliche Geheimwerte aus allen Quellen (mindestens 8 Zeichen). */
export function geheimWerteLaden(quellen = geheimQuellen()) {
  const werte = new Map()
  const bericht = []
  for (const [titel, pfad] of quellen) {
    const env = envLesen(pfad)
    let n = 0
    for (const [name, wert] of Object.entries(env)) {
      if (!GEHEIMER_NAME.test(name) || wert.length < 8 || /^(true|false|null|\d+)$/i.test(wert)) continue
      if (wert === 'schutzschicht' || wert.startsWith('PLATZHALTER')) continue
      if (!werte.has(wert)) { werte.set(wert, name); n++ }
    }
    if (existsSync(pfad)) bericht.push({ titel, werte: n })
  }
  return { werte, bericht }
}

/** Kleinschreibung und einfache Leerzeichen — wie pu_werkstatt_schutzliste(). */
export function namenForm(s) {
  return String(s).toLowerCase().replace(/\s+/g, ' ').trim()
}

/** Die Fingerabdrücke der Kontonamen, wie die Academy sie ablegt. */
export function namenLaden(pfad = join(ACADEMY, 'data', 'werkstatt', 'schutz-namen.json')) {
  try {
    const j = JSON.parse(readFileSync(pfad, 'utf8'))
    if (typeof j.salz === 'string' && Array.isArray(j.hashes)) {
      return { salz: j.salz, hashes: new Set(j.hashes), laengste: Math.max(1, Math.min(4, j.laengste ?? 3)) }
    }
  } catch { /* keine Liste: Schicht 3 entfällt, gemeldet im Bericht */ }
  return null
}

/**
 * Regeln, die in Programmcode und Systemtexten zu viel treffen: `@param`,
 * `@media`, Paketnamen wie `@promptheus/…` sähen aus wie ein soziales Profil,
 * jedes Datum `2026-10-03` wie ein Geburtstag. Für getippte Nachrichten gelten
 * sie weiter (dort schreibt ein Kind vielleicht seinen Geburtstag), für
 * Werkzeugergebnisse, Systemtext und Antworten nicht — sonst sähe der Agent
 * „xxx“ statt `@param` und schriebe kaputten Code zurück (gemessen am
 * 03.10.2026: 10 von 12 Ersetzungen einer echten Anfrage waren solche).
 */
export const NUR_FUER_EINGABEN = ['soziales_profil', 'geburtstag']

/**
 * Das PII-Regelwerk der Academy, ausgelegt von assets/js/pii.js.
 * `ohne`: Regelkennungen, die diese Auslegung weglässt. assets/js/pii.js hält
 * seine Regeln im Modul; für eine zweite Auslegung wird es frisch geladen.
 */
export function piiLaden(ohne = []) {
  const modul = join(ACADEMY, 'assets', 'js', 'pii.js')
  const regeln = join(ACADEMY, 'srv', 'pii_regeln.json')
  if (!existsSync(modul) || !existsSync(regeln)) return null
  const laden = createRequire(import.meta.url)
  delete laden.cache[laden.resolve(modul)]
  const pii = laden(modul)
  const json = JSON.parse(readFileSync(regeln, 'utf8'))
  if (ohne.length > 0 && Array.isArray(json.regeln)) json.regeln = json.regeln.filter(r => !ohne.includes(r.id))
  pii.laden(json)
  return { pii, anzahl: Array.isArray(json.regeln) ? json.regeln.length : 0 }
}

/** Ersetzt jedes Vorkommen, ohne Sonderzeichen als Muster zu deuten. */
function ersetzeWoertlich(text, wert, ersatz) {
  if (!text.includes(wert)) return [text, 0]
  const teile = text.split(wert)
  return [teile.join(ersatz), teile.length - 1]
}

/** Ein Wort: beginnt und endet mit Buchstabe oder Ziffer („Mia-Sophie“, nicht „Mia.“). */
const WORT = /[\p{L}\p{N}](?:[\p{L}\p{N}'.-]*[\p{L}\p{N}])?/gu

/**
 * Baut eine Maske aus geladenen Quellen.
 * @param {{werte?: Map<string,string>, namen?: ?{salz:string,hashes:Set<string>,laengste:number}, pii?: ?object}} q
 */
export function maskeBauen(q = {}) {
  const werte = [...(q.werte ?? new Map()).entries()].sort((a, b) => b[0].length - a[0].length)
  const namen = q.namen ?? null
  const pii = q.pii?.pii ?? null
  // Für alles, was kein Mensch getippt hat; ohne Zweitauslegung gilt die volle.
  const piiCode = q.piiCode?.pii ?? pii

  const hashName = s => createHash('sha256').update(namen.salz + '|' + namenForm(s)).digest('hex')

  /** Schicht 3: jede Folge von 1 bis `laengste` Wörtern hashen und vergleichen. */
  function namenErsetzen(text, zaehler) {
    if (!namen || namen.hashes.size === 0) return text
    const woerter = [...text.matchAll(WORT)].map(m => ({ von: m.index, bis: m.index + m[0].length }))
    const treffer = []
    for (let i = 0; i < woerter.length; i++) {
      for (let n = Math.min(namen.laengste, woerter.length - i); n >= 1; n--) {
        const von = woerter[i].von, bis = woerter[i + n - 1].bis
        if (namen.hashes.has(hashName(text.slice(von, bis)))) { treffer.push([von, bis]); i += n - 1; break }
      }
    }
    for (let k = treffer.length - 1; k >= 0; k--) {
      text = text.slice(0, treffer[k][0]) + '[PERSON]' + text.slice(treffer[k][1])
    }
    zaehler.person = (zaehler.person ?? 0) + treffer.length
    return text
  }

  /**
   * Maskiert einen Text. Zählt Treffer je Art in `zaehler`.
   * `eingabe`: von einem Menschen getippt (alle harten PII-Regeln); sonst
   * Code, Systemtext, Werkzeugergebnis (ohne NUR_FUER_EINGABEN).
   */
  function text(s, zaehler = {}, eingabe = true) {
    if (typeof s !== 'string' || s === '') return s
    let t = s, n
    for (const [wert, name] of werte) {
      [t, n] = ersetzeWoertlich(t, wert, `[GEHEIM:${name}]`)
      if (n) zaehler.geheim = (zaehler.geheim ?? 0) + n
    }
    for (const [typ, muster] of GEHEIM_MUSTER) {
      t = t.replace(muster, (fund) => {
        if (typ === 'opaque-token' && !siehtZufaelligAus(fund)) return fund
        zaehler.muster = (zaehler.muster ?? 0) + 1
        return `[REDACTED:${typ}]`
      })
    }
    t = t.replace(ZUWEISUNG, (_, k, sep) => { zaehler.muster = (zaehler.muster ?? 0) + 1; return `${k}${sep}[REDACTED:generic-secret]` })
    t = namenErsetzen(t, zaehler)
    const regelwerk = eingabe ? pii : piiCode
    if (regelwerk) {
      const p = regelwerk.pruefen(t, true)
      for (const tr of p.treffer) {
        if (tr.art === 'hart') zaehler.pii = (zaehler.pii ?? 0) + 1
        else zaehler.pii_weich = (zaehler.pii_weich ?? 0) + 1
      }
      t = p.text
    }
    return t
  }

  /**
   * Maskiert alle Text-Blätter einer Modellanfrage. Strukturfelder
   * (NIE_MASKIEREN) und eingebettete Bilder (`data:`-Adressen, Base64) bleiben.
   */
  function wert(v, zaehler = {}, schluessel = '', rolle = '') {
    if (typeof v === 'string') {
      if (NIE_MASKIEREN.has(schluessel)) return v
      if (v.startsWith('data:') || (schluessel === 'data' && v.length > 200 && /^[A-Za-z0-9+/=\s]+$/.test(v))) return v
      return text(v, zaehler, rolle === 'user' && !EINGEBLENDET.test(v))
    }
    if (Array.isArray(v)) return v.map(x => wert(x, zaehler, schluessel, rolle))
    if (v && typeof v === 'object') {
      // Die Rolle einer Nachricht gilt für alles darin (OpenAI- und Responses-Form).
      const eigene = typeof v.role === 'string' ? v.role : rolle
      const aus = {}
      for (const [k, x] of Object.entries(v)) aus[k] = wert(x, zaehler, k, eigene)
      return aus
    }
    return v
  }

  /**
   * Torschluss: steht in der fertigen Nutzlast noch ein bekannter Wert oder
   * Name? Liefert die Arten (nie die Werte). Leer heisst: darf hinaus.
   */
  function torschluss(nutzlast) {
    const rest = []
    for (const [w, name] of werte) if (nutzlast.includes(w)) rest.push(`geheim:${name}`)
    if (namen && namen.hashes.size > 0) {
      const z = {}
      namenErsetzen(nutzlast, z)
      if (z.person) rest.push(`person:${z.person}`)
    }
    return rest
  }

  return {
    text, wert, torschluss,
    stand: {
      geheimwerte: werte.length,
      namen: namen ? namen.hashes.size : 0,
      muster: GEHEIM_MUSTER.length + 1,
      pii_regeln: q.pii?.anzahl ?? 0,
    },
  }
}

/** Lädt alle Quellen und baut die Maske. */
export function maskeLaden() {
  const { werte, bericht } = geheimWerteLaden()
  const namen = namenLaden()
  let pii = null, piiCode = null
  try { pii = piiLaden(); piiCode = piiLaden(NUR_FUER_EINGABEN) } catch { pii = null; piiCode = null }
  const maske = maskeBauen({ werte, namen, pii, piiCode })
  return { maske, bericht, namenGeladen: namen !== null, piiGeladen: pii !== null }
}
