/**
 * Prüft, dass Hephaistos die Persona der Werkstatt wird.
 *
 * Arbeitet mit Kopien in einem Wegwerf-Ordner; das echte Profil wird nicht
 * angefasst. Liegt der Harness in `werkstatt\deepseek-harness`, werden auch
 * seine echten Presets umgeschrieben (nur im Speicher).
 *
 * Aufruf: node werkstatt/werkzeuge/hephaistos/persona_pruefen.mjs
 */
import { existsSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  ANFANG, ENDE, PRESET_ORDNER, blockEntfernen, fremdeVariablen, hephaistosBlock, hephaistosPruefen,
  personaLesen, presetUmschreiben, profilHephaistos,
} from './persona.mjs'

let fehler = 0, gut = 0
const pruefe = (was, ok, zusatz = '') => {
  if (ok) gut++; else { fehler++; console.log(`   ✕ ${was}${zusatz ? '  (' + zusatz + ')' : ''}`) }
}

// ── 1: die Persona-Datei ────────────────────────────────────────────────────
const persona = personaLesen()
pruefe('Persona ohne Kopfdaten', !persona.startsWith('---') && persona.startsWith('Du bist Hephaistos'))
pruefe('nur erlaubte Variablen', fremdeVariablen(persona).length === 0, fremdeVariablen(persona).join(','))
pruefe('nennt {{model}}', persona.includes('{{model}}'))
pruefe('keine Ausrufezeichen', !persona.includes('!'))
pruefe('kein „ß“ ausser in der Regel selbst', !persona.replace('„ß“', '').includes('ß'))
pruefe('keine Verbotswörter', !/\b(einfach|schnell|mühelos)\b/i.test(persona))
pruefe('nennt den Systemnamen', persona.includes('PROMPTHEUS-Werkstatt Harness-System') && persona.includes('PROMPTHEUS Harness Web GUI'))
pruefe('nennt sich nicht DeepSeek Harness', !/DeepSeek[- ]Harness/i.test(persona))

// ── 2: Preset-Formen wie im Harness ─────────────────────────────────────────
const standard = [
  '# Agent preset standard',
  '- insert:',
  '    - id: preset-standard',
  "      name: '@deepseek-ai/dsh-agent-preset'",
  '      config:',
  '        id: standard',
  '        order: 1',
  '        plugins:',
  '          - id: persona',
  "            name: '@deepseek-ai/dsh-persona'",
  '            config:',
  '              suffix: Your working directory is {{cwd}}.',
  '              prefix: You are a coding agent powered by the {{model}} model.',
  '          - id: tool-pwsh',
  "            name: '@deepseek-ai/dsh-tool-pwsh'",
  "            disabled: !!js process.platform !== 'win32'",
  '          - id: planning',
  '            name: cordis:group',
  '            config:',
  '              - id: plan-mode',
  '                config:',
  '                  section: |',
  '                    You are in plan mode.',
  '',
  '                    Explore first.',
  '',
].join('\n')
const s = presetUmschreiben(standard, persona)
pruefe('standard: erkannt', s?.id === 'preset-standard')
const st = s?.zeilen.join('\n') ?? ''
pruefe('standard: Profilform', st.startsWith('- id: preset-standard\n  config:\n    id: standard\n    name: Hephaistos\n'))
pruefe('standard: Persona getauscht', !st.includes('You are a coding agent') && st.includes('          Du bist Hephaistos'))
pruefe('standard: Arbeitsordner auf Deutsch', st.includes('suffix: Dein Arbeitsordner ist {{cwd}}.'))
pruefe('standard: Werkzeuge bleiben', st.includes("\n      - id: tool-pwsh\n        name: '@deepseek-ai/dsh-tool-pwsh'\n        disabled: !!js process.platform !== 'win32'"))
pruefe('standard: Blocktext mit Leerzeile bleibt', st.includes('\n                You are in plan mode.\n\n                Explore first.'))

const cordis = standard
  .replace(/standard/g, 'cordis')
  .replace('          - id: persona', '          # Same persona as `standard`.\n          - id: persona')
  .replace('              prefix: You are a coding agent powered by the {{model}} model.',
    '              prefix: >-\n                You are a coding agent powered by the {{model}} model.')
  .replace('          - id: tool-pwsh', '          # the shell for this platform\n          - id: tool-pwsh')
const c = presetUmschreiben(cordis, persona)
const ct = c?.zeilen.join('\n') ?? ''
pruefe('cordis: Name', ct.includes('    name: Hephaistos · Plugins'))
pruefe('cordis: mehrzeiliger Prefix ganz ersetzt', !ct.includes('coding agent') && !ct.includes('prefix: >-'))
pruefe('cordis: Kommentar vor dem nächsten Eintrag bleibt', ct.includes('\n      # the shell for this platform\n      - id: tool-pwsh'))
pruefe('cordis: Kommentar vor der Persona bleibt', ct.includes('    # Same persona'))

pruefe('unbekannte Form: null', presetUmschreiben('- id: irgendwas\n  config: {}\n', persona) === null)
pruefe('ohne Persona: null', presetUmschreiben(standard.replace(/- id: persona[\s\S]*?(?=          - id: tool-pwsh)/, ''), persona) === null)

// ── 3: das Profil ───────────────────────────────────────────────────────────
const ort = mkdtempSync(join(tmpdir(), 'pu_hephaistos_'))
const presets = join(ort, 'presets')
mkdirSync(presets)
writeFileSync(join(presets, 'standard.patch.yml'), standard)
writeFileSync(join(presets, 'cordis.patch.yml'), cordis)
writeFileSync(join(presets, 'kaputt.patch.yml'), '- id: nichts\n')
const vorher = '# Profil\n- id: permission\n  config:\n    defaultPreset: workspace-write\n'
const profil = join(ort, 'cordis.patch.yml')
writeFileSync(profil, vorher)
const o = { presetOrdner: presets }

const r1 = profilHephaistos(profil, o)
pruefe('erster Lauf ändert', r1.geaendert.length === 1 && r1.geaendert[0].includes('2 Presets'), r1.geaendert.join())
pruefe('unbekannte Preset-Form gemeldet', r1.fehler.some(f => f.includes('kaputt.patch.yml')))
const t1 = readFileSync(profil, 'utf8')
pruefe('alter Inhalt unverändert vorne', t1.startsWith(vorher))
pruefe('Block am Ende', t1.trimEnd().endsWith(ENDE))
pruefe('Sicherung angelegt', existsSync(`${profil}.vor-hephaistos`) && readFileSync(`${profil}.vor-hephaistos`, 'utf8') === vorher)
pruefe('Selbstvorstellung aus', t1.includes('includeHarnessIdentity: false'))
pruefe('Web-Abschnitt aus, inject-Werte bleiben', t1.includes('surfaceContext: false') && t1.includes('trustedHosts: !!js ctx.webStartup.trustedHosts'))
pruefe('Prüfung: in Ordnung', hephaistosPruefen(profil).length === 0, hephaistosPruefen(profil).join())

const r2 = profilHephaistos(profil, o)
pruefe('zweiter Lauf ändert nichts', r2.geaendert.length === 0 && readFileSync(profil, 'utf8') === t1)

writeFileSync(profil, t1.replace('includeHarnessIdentity: false', 'includeHarnessIdentity: true'))
pruefe('Prüfung erkennt Handänderung', hephaistosPruefen(profil).some(b => b.includes('Selbstvorstellung')))
profilHephaistos(profil, o)
const t3 = readFileSync(profil, 'utf8')
pruefe('alter Block ersetzt, nicht verdoppelt', t3 === t1 && t3.split(ANFANG).length === 2)
pruefe('Block entfernbar', blockEntfernen(t3).trimEnd() === vorher.trimEnd())

writeFileSync(profil, blockEntfernen(t3))
pruefe('Prüfung erkennt fehlenden Block', hephaistosPruefen(profil).some(b => b.includes('fehlt')))

const crlf = join(ort, 'crlf.patch.yml')
writeFileSync(crlf, vorher.replace(/\n/g, '\r\n'))
profilHephaistos(crlf, o)
const tc = readFileSync(crlf, 'utf8')
pruefe('Windows-Zeilenenden bleiben', !/[^\r]\n/.test(tc))

const fremd = join(ort, 'persona.md')
writeFileSync(fremd, '---\ntitle: x\n---\nDu bist Hephaistos auf {{platform}}.\n')
pruefe('fremde Variable gemeldet', hephaistosBlock({ presetOrdner: presets, personaDatei: fremd }).fehler.some(f => f.includes('{{platform}}')))
pruefe('fehlendes Profil: nichts geändert', profilHephaistos(join(ort, 'gibt-es-nicht.yml'), o).geaendert.length === 0)

// ── 4: die echten Presets des Harness ───────────────────────────────────────
if (existsSync(PRESET_ORDNER)) {
  const b = hephaistosBlock()
  const text = b.zeilen.join('\n')
  pruefe('Harness: alle Presets umgestellt', b.fehler.length === 0 && b.presets.length >= 4, `${b.presets.join(',')} ${b.fehler.join(';')}`)
  pruefe('Harness: keine Harness-Persona mehr', !text.includes('You are a coding agent'))
  pruefe('Harness: Standard heisst Hephaistos', /- id: preset-standard\n {2}config:\n {4}id: standard\n {4}name: Hephaistos\n/.test(text))
} else {
  console.log('   (Harness nicht eingerichtet — echte Presets übersprungen)')
}

console.log(fehler === 0 ? `✓ ${gut} Prüfungen, alle grün.` : `✕ ${fehler} von ${gut + fehler} Prüfungen fehlgeschlagen.`)
process.exit(fehler === 0 ? 0 : 1)
