/**
 * PROMPTHEUS Werkstatt — was vor jedem Start geprüft und gerichtet wird.
 *
 * Läuft in `starten.mjs` (jeder Start) und in `einrichten.mjs`. Jede Funktion
 * ist wiederholbar: ein zweiter Lauf ändert nichts mehr. Was sie ändern, melden
 * sie mit Namen, nie mit Werten.
 *
 *   profilAbsichern        Zugriffsstufe „Workspace schreiben“ mit Rückfrage
 *                          statt Vollzugriff ohne Rückfrage; der Anbieter
 *                          `openrouter` geht über die Schutzschicht.
 *   profilPruefen          Startsperre: Geht ein Modellweg NICHT über die
 *                          Schutzschicht, startet die Werkstatt nicht.
 *   schluesselUmziehen     Der Anbieter-Schlüssel wandert aus der `.env` des
 *                          Harness in die Ebene der Schutzschicht
 *                          (`data/werkstatt/schutzschicht.env`); der Harness
 *                          behält einen Platzhalter.
 *   arbeitsordnerBereinigen  Die Academy (und alles darüber) ist kein
 *                          Arbeitsordner der Werkstatt. Sonst dürfte der Agent
 *                          bei „Workspace schreiben“ Programmcode der Academy
 *                          ändern.
 *   laufMerken             Wer diese Werkstatt gestartet hat (aus dem Ticket),
 *                          für die Zuordnung im Audit-Trail.
 */
import { appendFileSync, copyFileSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve, sep } from 'node:path'
import { ACADEMY, WERKSTATT } from './maske.mjs'

/** Der Platzhalter, den der Harness statt des Schlüssels sieht. */
export const PLATZHALTER = 'schutzschicht'

function atomar(pfad, inhalt, modus = 0o600) {
  mkdirSync(dirname(pfad), { recursive: true })
  const tmp = `${pfad}.${process.pid}.tmp`
  writeFileSync(tmp, inhalt, { encoding: 'utf8', mode: modus })
  renameSync(tmp, pfad)
}

/** Die Adresse der Schutzschicht, wie Harness und Profil sie brauchen. */
export function schutzAdresse(port) {
  return `http://127.0.0.1:${port}/v1`
}

/**
 * Richtet ein Profil (`cordis.patch.yml`) aus. Textänderungen an bekannten
 * Stellen — die Datei ist unsere eigene Schicht über den Bündeln.
 * @returns {string[]} was geändert wurde
 */
export function profilAbsichern(pfad, port) {
  if (!existsSync(pfad)) return []
  let t = readFileSync(pfad, 'utf8')
  const vorher = t
  const geaendert = []
  const nl = t.includes('\r\n') ? '\r\n' : '\n'

  // 1. Vorgabe-Zugriffsstufe: schreiben nur im Arbeitsordner, mit Rückfrage.
  if (/defaultPreset:\s*danger-full-access/.test(t)) {
    t = t.replace(/defaultPreset:\s*danger-full-access/, 'defaultPreset: workspace-write')
    geaendert.push('Zugriffsstufe: Workspace schreiben (mit Rückfrage)')
  }

  // 2. Der Anbieter openrouter über die Schutzschicht.
  // Zeilenweise: der Block reicht bis zur ersten Zeile, die nicht tiefer
  // eingerückt ist als „openrouter:“ selbst.
  const adresse = schutzAdresse(port)
  const zeilen = t.split(/\r?\n/)
  const kopf = zeilen.findIndex(z => /^[ \t]*openrouter:[ \t]*$/.test(z))
  if (kopf !== -1) {
    const tiefe = zeilen[kopf].match(/^[ \t]*/)[0].length
    const einzug = ' '.repeat(tiefe + 2)
    let base = -1
    for (let i = kopf + 1; i < zeilen.length; i++) {
      const z = zeilen[i]
      if (z.trim() === '' || z.trim().startsWith('#')) continue
      if (z.match(/^[ \t]*/)[0].length <= tiefe) break
      if (z.startsWith(einzug + 'baseURL:')) { base = i; break }
    }
    if (base === -1) {
      zeilen.splice(kopf + 1, 0, `${einzug}baseURL: ${adresse}`)
      geaendert.push('Anbieter openrouter: über die Schutzschicht')
    } else if (zeilen[base].trim() !== `baseURL: ${adresse}`) {
      zeilen[base] = `${einzug}baseURL: ${adresse}`
      geaendert.push('Anbieter openrouter: Adresse auf die Schutzschicht')
    }
    t = zeilen.join(nl)
  }
  if (t !== vorher) {
    copyFileSync(pfad, `${pfad}.vor-schutzschicht`)
    atomar(pfad, t, 0o644)
  }
  return geaendert
}

/**
 * Startsperre: Jede `baseURL` im Profil muss auf die Schutzschicht zeigen, und
 * der Anbieter openrouter muss eine haben. Sonst ginge ein Weg am Riegel vorbei.
 * @returns {string[]} Befunde; leer heisst: in Ordnung
 */
export function profilPruefen(pfad, port) {
  if (!existsSync(pfad)) return ['Profil fehlt']
  const t = readFileSync(pfad, 'utf8')
  const befunde = []
  const adresse = schutzAdresse(port)
  for (const m of t.matchAll(/^[ \t]*baseURL:[ \t]*(\S+)/gm)) {
    if (m[1] !== adresse) befunde.push(`ein Anbieter zeigt nicht auf die Schutzschicht (${new URL(m[1]).host})`)
  }
  if (/^[ \t]*openrouter:[ \t]*$/m.test(t) && !t.includes(`baseURL: ${adresse}`)) {
    befunde.push('der Anbieter openrouter hat keine Adresse über die Schutzschicht')
  }
  return befunde
}

function envZeilen(pfad) {
  return existsSync(pfad) ? readFileSync(pfad, 'utf8').split(/\r?\n/) : []
}

/**
 * Zieht den Anbieter-Schlüssel in die Ebene der Schutzschicht um.
 * @returns {{ort:'schutzschicht'|'fehlt', umgezogen:boolean}}
 */
export function schluesselUmziehen(harnessEnv = join(WERKSTATT, 'deepseek-harness', '.env'),
  ziel = join(ACADEMY, 'data', 'werkstatt', 'schutzschicht.env')) {
  const zielZeilen = envZeilen(ziel)
  const hatZiel = zielZeilen.some(z => /^\s*OPENROUTER_API_KEY\s*=\s*\S{8,}/.test(z))

  const zeilen = envZeilen(harnessEnv)
  let gefunden = null
  let umgezogen = false
  const neu = zeilen.map(z => {
    const m = z.match(/^(\s*)(OPENROUTER_API_KEY|DEEPSEEK_API_KEY)(\s*=\s*)(.*)$/)
    if (!m) return z
    const wert = m[4].trim().replace(/^["']|["']$/g, '')
    if (wert === '' || wert === PLATZHALTER) return z
    if (gefunden === null) gefunden = wert
    return `${m[1]}${m[2]}${m[3]}${PLATZHALTER}`
  })
  if (gefunden !== null) {
    // Steht beim Harness ein echter Schlüssel, ist er neuer als der in der
    // Schutzschicht (Einrichten schreibt dorthin) — er ersetzt ihn.
    {
      atomar(ziel,`# PROMPTHEUS Werkstatt — Anbieter-Schlüssel der Schutzschicht.\n# Nur die Schutzschicht liest ihn. Nie in Git, nie an ein Modell.\nOPENROUTER_API_KEY=${gefunden}\n`)
    }
    copyFileSync(harnessEnv, `${harnessEnv}.vor-schutzschicht`)
    atomar(harnessEnv, neu.join('\n'))
    umgezogen = true
  }
  return { ort: (hatZiel || gefunden !== null) ? 'schutzschicht' : 'fehlt', umgezogen }
}

/** Liegt `pfad` in `wurzel` (oder ist es)? Ohne Gross/Klein unter Windows. */
function innerhalb(pfad, wurzel) {
  const a = resolve(pfad).toLowerCase(), b = resolve(wurzel).toLowerCase()
  return a === b || a.startsWith(b.endsWith(sep) ? b : b + sep)
}

/**
 * Entfernt Arbeitsordner, die die Academy enthalten oder in ihr liegen
 * (ausser dem künftigen Secondbrain der Werkstatt). Die Sitzungen bleiben auf
 * der Platte und im Audit-Trail; nur der Ordner ist nicht mehr wählbar.
 * @returns {string[]} Titel der entfernten Arbeitsordner
 */
export function arbeitsordnerBereinigen(dshHome = join(WERKSTATT, '.dsh')) {
  const pfad = join(dshHome, 'storages', 'workspace.json')
  if (!existsSync(pfad)) return []
  let j
  try { j = JSON.parse(readFileSync(pfad, 'utf8')) } catch { return ['workspace.json unlesbar — nicht geändert'] }
  const tabelle = j?.tables?.workspaces
  if (!tabelle || typeof tabelle !== 'object') return []
  const erlaubt = [join(WERKSTATT, 'secondbrain')]
  const weg = []
  for (const [id, w] of Object.entries(tabelle)) {
    const p = String(w?.path ?? '')
    if (p === '') continue
    const gefaehrlich = innerhalb(ACADEMY, p) || (innerhalb(p, ACADEMY) && !erlaubt.some(e => innerhalb(p, e)))
    if (gefaehrlich) weg.push([id, w])
  }
  if (weg.length === 0) return []
  copyFileSync(pfad, `${pfad}.vor-schutzschicht`)
  for (const [id, w] of weg) {
    delete tabelle[id]
    if (Array.isArray(j.global?.workspaceIds)) j.global.workspaceIds = j.global.workspaceIds.filter(x => x !== id)
    if (Array.isArray(w.sessionIds) && Array.isArray(j.global?.archivedSessionIds)) {
      for (const s of w.sessionIds) if (!j.global.archivedSessionIds.includes(s)) j.global.archivedSessionIds.push(s)
    }
    if (j.global?.defaultWorkspaceId === id) {
      const rest = Object.keys(tabelle)
      if (rest.length > 0) j.global.defaultWorkspaceId = rest[0]
      else delete j.global.defaultWorkspaceId
    }
  }
  atomar(pfad, JSON.stringify(j, null, 2), 0o644)
  return weg.map(([, w]) => String(w.title ?? 'ohne Titel'))
}

/** Merkt sich, wer diese Werkstatt gestartet hat (Konto-Nummer aus dem Ticket). */
export function laufMerken(lernender) {
  if (!Number.isInteger(lernender) || lernender <= 0) return
  const pfad = join(ACADEMY, 'data', 'werkstatt', 'laeufe.jsonl')
  mkdirSync(dirname(pfad), { recursive: true })
  appendFileSync(pfad, JSON.stringify({ lernender, ab: Date.now() }) + '\n', 'utf8')
}
