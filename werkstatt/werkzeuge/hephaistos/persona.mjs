/**
 * PROMPTHEUS Werkstatt — Hephaistos als Agent der Werkstatt.
 *
 * Der Harness stellt sich an drei Stellen selbst vor:
 *   1. `harness:identity` — „You are an AI agent powered by DeepSeek Harness.“
 *      (Zeile `system-prompt`, Schalter `includeHarnessIdentity`)
 *   2. `app:web-surface` und der Quellordner des Harness (Zeile `web-runtime`,
 *      Schalter `surfaceContext`)
 *   3. die Persona jedes Agenten-Presets („You are a coding agent …“). Sie
 *      überschattet die Persona des Profils für ihre Sitzung.
 *
 * Eine Profilzeile ersetzt die ganze `config` einer Bündelzeile — auch die
 * ganze Plugin-Liste eines Presets. Deshalb werden die Preset-Zeilen bei jedem
 * Start aus den Preset-Dateien des Harness selbst erzeugt, nur mit getauschter
 * Persona und deutschem Namen. So bleiben Werkzeuge und Gruppen nach einem
 * Harness-Update aktuell.
 *
 * Alles steht in einem Block mit Markierung am Ende des Profils. Der Block
 * gehört diesem Modul; ein zweiter Lauf ändert nichts mehr.
 */
import { copyFileSync, existsSync, readdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { WERKSTATT } from '../schutz/maske.mjs'

export const ANFANG = '# >>> PROMPTHEUS Hephaistos — erzeugt von werkzeuge/hephaistos/persona.mjs, nicht von Hand ändern'
export const ENDE = '# <<< PROMPTHEUS Hephaistos'

/** Die Persona-Datei (Prompt mit Kopfdaten). */
export const PERSONA_DATEI = join(WERKSTATT, 'vorlage', 'hephaistos', 'persona.md')
/** Wo der Harness seine Presets mitbringt. */
export const PRESET_ORDNER = join(WERKSTATT, 'deepseek-harness', 'packages', 'bundle', 'web-app', 'presets')

export const SUFFIX = 'Dein Arbeitsordner ist {{cwd}}.'

/** Sichtbare Namen der Presets in der Werkstatt. Unbekannte heissen „Hephaistos · <id>“. */
export const PRESET_NAMEN = {
  standard: 'Hephaistos',
  ptc: 'Hephaistos · Abläufe',
  minimal: 'Hephaistos · schlank',
  cordis: 'Hephaistos · Plugins',
}

/** Erlaubte Prompt-Variablen; jede andere `{{…}}`-Gruppe liesse den Harness abbrechen. */
const VARIABLEN = new Set(['model', 'cwd'])

/**
 * Liest die Persona ohne Kopfdaten.
 * @returns {string}
 */
export function personaLesen(datei = PERSONA_DATEI) {
  const t = readFileSync(datei, 'utf8').replace(/^﻿/, '').replace(/\r\n/g, '\n')
  const ohneKopf = t.startsWith('---\n') ? t.slice(t.indexOf('\n---\n', 4) + 5) : t
  return ohneKopf.trim()
}

/** Prüft die `{{…}}`-Gruppen eines Textes. @returns {string[]} unbekannte Namen */
export function fremdeVariablen(text) {
  return [...text.matchAll(/\{\{([^}]*)\}\}/g)].map(m => m[1]).filter(n => !VARIABLEN.has(n))
}

const einzug = z => z.match(/^ */)[0].length
const leer = z => z.trim() === '' || z.trim().startsWith('#')

/** Ein YAML-Blocktext (`|-`) mit gegebenem Einzug. */
function block(text, tiefe) {
  const e = ' '.repeat(tiefe)
  return text.split('\n').map(z => (z === '' ? '' : e + z))
}

/** Die Persona-Zeile eines Presets, mit `- ` auf Einzug `d`. */
function personaZeilen(prefix, d) {
  const e = ' '.repeat(d)
  return [
    `${e}- id: persona`,
    `${e}  name: '@deepseek-ai/dsh-persona'`,
    `${e}  config:`,
    `${e}    suffix: ${SUFFIX}`,
    `${e}    prefix: |-`,
    ...block(prefix, d + 6),
  ]
}

/**
 * Macht aus einer Preset-Datei des Harness (`- insert: - id: preset-x …`) eine
 * Profilzeile, die dieses Preset ersetzt — mit Hephaistos als Persona.
 * @returns {{id:string, zeilen:string[]}|null} null, wenn die Form nicht passt
 */
export function presetUmschreiben(text, prefix) {
  const zeilen = text.replace(/\r\n/g, '\n').split('\n')
  const kopf = zeilen.findIndex(z => /^ *- id: preset-[\w-]+ *$/.test(z))
  if (kopf === -1) return null
  const zeile = zeilen[kopf].trim().slice('- id: '.length)
  const tiefe = einzug(zeilen[kopf])                    // „- “ der Zeile
  const schluessel = tiefe + 2                          // name:, config:
  const cfg = zeilen.findIndex((z, i) => i > kopf && einzug(z) === schluessel && /^ *config: *$/.test(z))
  if (cfg === -1) return null
  // Der Unterbaum von config: alles tiefer Eingerückte bis zum nächsten Schlüssel.
  const baum = []
  for (let i = cfg + 1; i < zeilen.length; i++) {
    const z = zeilen[i]
    if (!leer(z) && einzug(z) <= schluessel) break
    baum.push(z)
  }
  // Auf die Profilform bringen: `- id:` ganz links, config auf 2, Kinder auf 4.
  const weg = schluessel - 2
  const neu = baum.map(z => (z.trim() === '' ? '' : (einzug(z) >= weg ? z.slice(weg) : z.trimStart())))
  while (neu.length > 0 && neu.at(-1) === '') neu.pop()

  const idZeile = neu.findIndex(z => /^ {4}id: \S+ *$/.test(z))
  if (idZeile === -1) return null
  const id = neu[idZeile].trim().slice('id: '.length)
  const name = PRESET_NAMEN[id] ?? `Hephaistos · ${id}`
  const alterName = neu.findIndex(z => /^ {4}name: /.test(z))
  if (alterName !== -1) neu.splice(alterName, 1)
  neu.splice(neu.findIndex(z => /^ {4}id: /.test(z)) + 1, 0, `    name: ${name}`)

  const p = neu.findIndex(z => /^ *- id: persona *$/.test(z))
  if (p === -1) return null
  const d = einzug(neu[p])
  let ende = p + 1
  while (ende < neu.length && (neu[ende].trim() === '' || einzug(neu[ende]) > d)) ende++
  // Kommentarzeilen direkt vor dem nächsten Eintrag gehören zu ihm.
  while (ende > p + 1 && neu[ende - 1].trim().startsWith('#') && einzug(neu[ende - 1]) === d) ende--
  neu.splice(p, ende - p, ...personaZeilen(prefix, d))

  return { id: zeile, zeilen: [`- id: ${zeile}`, '  config:', ...neu] }
}

/**
 * Der ganze Block für das Profil.
 * @returns {{zeilen:string[], presets:string[], fehler:string[]}}
 */
export function hephaistosBlock({ presetOrdner = PRESET_ORDNER, personaDatei = PERSONA_DATEI } = {}) {
  const prefix = personaLesen(personaDatei)
  const fehler = fremdeVariablen(prefix).map(n => `Persona: unbekannte Variable {{${n}}}`)
  const zeilen = [
    ANFANG,
    '#',
    '# 1. Keine eingebaute Selbstvorstellung des Harness; Hephaistos als Persona.',
    '- id: system-prompt',
    '  config:',
    '    includeHarnessIdentity: false',
    '    includeRuntimeContext: true',
    '    personaPrefix: |-',
    ...block(prefix, 6),
    `    personaSuffix: ${SUFFIX}`,
    '',
    '# 2. Ohne den englischen Abschnitt über die Web-Oberfläche und den',
    '#    Quellordner des Harness (die Persona nennt die Oberfläche selbst).',
    '- id: web-runtime',
    '  config:',
    '    openBrowser: !!js ctx.webStartup.openBrowser',
    '    printUrl: true',
    '    surfaceContext: false',
    '    trustedHosts: !!js ctx.webStartup.trustedHosts',
  ]
  const presets = []
  if (existsSync(presetOrdner)) {
    zeilen.push('', '# 3. Die Presets des Harness, mit Hephaistos als Persona.')
    for (const datei of readdirSync(presetOrdner).filter(n => n.endsWith('.patch.yml')).sort()) {
      const r = presetUmschreiben(readFileSync(join(presetOrdner, datei), 'utf8'), prefix)
      if (r === null) { fehler.push(`Preset ${datei}: Form unbekannt, nicht umgestellt`); continue }
      presets.push(r.id)
      zeilen.push('', ...r.zeilen)
    }
  }
  zeilen.push(ENDE)
  return { zeilen, presets, fehler }
}

/**
 * Schreibt den Block ans Ende des Profils (ersetzt einen alten Block).
 * @returns {{geaendert:string[], fehler:string[]}}
 */
export function profilHephaistos(pfad, optionen = {}) {
  if (!existsSync(pfad)) return { geaendert: [], fehler: [] }
  const t = readFileSync(pfad, 'utf8')
  const nl = t.includes('\r\n') ? '\r\n' : '\n'
  const { zeilen, presets, fehler } = hephaistosBlock(optionen)
  const ohne = blockEntfernen(t).replace(/(\r?\n)+$/, '')
  const neu = ohne + nl + nl + zeilen.join(nl) + nl
  if (neu === t) return { geaendert: [], fehler }
  if (!existsSync(`${pfad}.vor-hephaistos`)) copyFileSync(pfad, `${pfad}.vor-hephaistos`)
  const tmp = `${pfad}.${process.pid}.tmp`
  writeFileSync(tmp, neu, 'utf8')
  renameSync(tmp, pfad)
  return { geaendert: [`Hephaistos: Persona und ${presets.length} Presets (${presets.join(', ')})`], fehler }
}

/** Entfernt einen vorhandenen Block samt Markierungen. */
export function blockEntfernen(text) {
  const a = text.indexOf(ANFANG)
  if (a === -1) return text
  const e = text.indexOf(ENDE, a)
  if (e === -1) return text.slice(0, a)
  return text.slice(0, a) + text.slice(e + ENDE.length).replace(/^\r?\n/, '')
}

/**
 * Prüft, ob das Profil Hephaistos trägt.
 * @returns {string[]} Befunde; leer heisst: in Ordnung
 */
export function hephaistosPruefen(pfad) {
  if (!existsSync(pfad)) return ['Profil fehlt']
  const t = readFileSync(pfad, 'utf8')
  const befunde = []
  if (!t.includes(ANFANG) || !t.includes(ENDE)) befunde.push('Hephaistos-Block fehlt im Profil')
  else {
    const b = t.slice(t.indexOf(ANFANG), t.indexOf(ENDE))
    if (!/includeHarnessIdentity: false/.test(b)) befunde.push('Selbstvorstellung des Harness ist noch an')
    if (!/surfaceContext: false/.test(b)) befunde.push('englischer Web-Abschnitt ist noch an')
    if (/You are a coding agent/.test(b)) befunde.push('ein Preset hat noch die Persona des Harness')
  }
  return befunde
}
