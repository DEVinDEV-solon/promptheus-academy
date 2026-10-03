/**
 * Prüft die Schutzschicht gegen einen nachgestellten Anbieter.
 *
 * Nichts verlässt den Rechner: Der „Anbieter“ ist ein Server auf 127.0.0.1,
 * der nur aufschreibt, was ankommt. Die Geheimnisse sind erfunden und werden
 * hier zusammengesetzt. Die echten `.env`-Dateien werden nicht gelesen — die
 * Maske wird aus Testwerten gebaut; nur das PII-Regelwerk der Academy ist echt.
 *
 * Aufruf: node werkstatt/werkzeuge/schutz/schutz_pruefen.mjs
 */
import { createServer, request } from 'node:http'
import { createHash } from 'node:crypto'
import { mkdtempSync, readFileSync, readdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

process.env.PU_TEST_AUDIT = mkdtempSync(join(tmpdir(), 'pu_schutz_'))
const { maskeBauen, piiLaden, namenForm, NUR_FUER_EINGABEN } = await import('./maske.mjs')
const { schutzschichtStarten } = await import('./schutzschicht.mjs')

let fehler = 0, gut = 0
const pruefe = (was, ok, zusatz = '') => {
  if (ok) gut++; else { fehler++; console.log(`   ✕ ${was}${zusatz ? '  (' + zusatz + ')' : ''}`) }
}

// ── erfundene Werte ─────────────────────────────────────────────────────────
const academySchluessel = 'sk-' + 'or-v1-' + 'f00d'.repeat(12)
const kennwort = 'Feuer' + 'Schmied' + '2026' + 'x'          // kein Muster, nur als bekannter Wert
const echterSchluessel = 'test-' + 'anbieter-' + 'schluessel'
const salz = 'testsalz'
const name = 'Mia Beispielkind'
const hash = s => createHash('sha256').update(salz + '|' + namenForm(s)).digest('hex')

const maske = maskeBauen({
  werte: new Map([[academySchluessel, 'PU_OPENROUTER_API_KEY'], [kennwort, 'PU_ADMIN_PASSWORT']]),
  namen: { salz, hashes: new Set([hash(name)]), laengste: 3 },
  pii: piiLaden(),
  piiCode: piiLaden(NUR_FUER_EINGABEN),
})

// ── der nachgestellte Anbieter ──────────────────────────────────────────────
const angekommen = []
const anbieter = createServer((req, res) => {
  const teile = []
  req.on('data', c => teile.push(c))
  req.on('end', () => {
    angekommen.push({ url: req.url, auth: req.headers.authorization, body: Buffer.concat(teile).toString('utf8') })
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ id: 'x', choices: [{ message: { role: 'assistant', content: 'ok' } }] }))
  })
})
await new Promise(ok => anbieter.listen(0, '127.0.0.1', ok))
const ziel = `http://127.0.0.1:${anbieter.address().port}/api/v1`

const schutz = await schutzschichtStarten({ port: 0, ziel, schluessel: echterSchluessel, maske, still: true, sitzungenAlleMs: 0 })
const port = schutz.server.address().port

const senden = (pfad, body, methode = 'POST', kopf = {}) => new Promise((ok, f) => {
  const daten = body === undefined ? undefined : (typeof body === 'string' ? body : JSON.stringify(body))
  const r = request({ host: '127.0.0.1', port, path: pfad, method: methode,
    headers: { 'content-type': 'application/json', authorization: 'Bearer platzhalter', ...kopf } }, res => {
    const t = []; res.on('data', c => t.push(c)); res.on('end', () => ok({ status: res.statusCode, body: Buffer.concat(t).toString('utf8') }))
  })
  r.on('error', f)
  if (daten !== undefined) r.write(daten)
  r.end()
})

// ── 1: eine normale Anfrage mit allem, was nicht hinaus darf ────────────────
const telefon = '0171 ' + '2345678'
const mail = 'mia' + '@' + 'beispiel.de'
const r1 = await senden('/v1/chat/completions', {
  model: 'deepseek/deepseek-v4-flash',
  messages: [
    { role: 'system', content: 'Du bist Hephaistos.' },
    { role: 'user', content: `Ich heisse ${name}, Telefon ${telefon}, Mail ${mail}. Mein Schlüssel: ${academySchluessel}` },
    { role: 'assistant', content: null, tool_calls: [{ id: 'call_1', type: 'function', function: { name: 'read', arguments: '{"path":"../../.env"}' } }] },
    { role: 'tool', tool_call_id: 'call_1', content: `PU_OPENROUTER_API_KEY=${academySchluessel}\nPU_ADMIN_PASSWORT=${kennwort}` },
  ],
})
const a1 = angekommen.at(-1)
pruefe('normale Anfrage geht durch', r1.status === 200, String(r1.status))
pruefe('Weg richtig umgesetzt', a1?.url === '/api/v1/chat/completions', a1?.url)
pruefe('echter Schlüssel eingesetzt, Platzhalter verworfen', a1?.auth === `Bearer ${echterSchluessel}`)
pruefe('Academy-Schlüssel kommt nicht an', !a1.body.includes(academySchluessel))
pruefe('Kennwort aus gelesener .env kommt nicht an', !a1.body.includes(kennwort))
pruefe('… stattdessen [GEHEIM:Name]', a1.body.includes('[GEHEIM:PU_ADMIN_PASSWORT]'))
pruefe('Kontoname kommt nicht an', !a1.body.includes('Beispielkind') && a1.body.includes('[PERSON]'))
pruefe('Telefonnummer kommt nicht an', !a1.body.includes('2345678'))
pruefe('E-Mail kommt nicht an', !a1.body.includes(mail))
pruefe('Struktur bleibt: Modell, Rolle, Werkzeug-ID', a1.body.includes('"model":"deepseek/deepseek-v4-flash"') && a1.body.includes('"tool_call_id":"call_1"'))
pruefe('Systemanweisung bleibt lesbar', a1.body.includes('Du bist Hephaistos.'))

// ── 2: Torschluss — ein Wert in einem Feld, das nicht maskiert wird ─────────
const vorher = angekommen.length
const r2 = await senden('/v1/chat/completions', { model: academySchluessel, messages: [{ role: 'user', content: 'Hallo' }] })
pruefe('Torschluss hält an (451)', r2.status === 451, String(r2.status))
pruefe('… und nichts kam beim Anbieter an', angekommen.length === vorher)
pruefe('… Antwort nennt keinen Wert', !r2.body.includes(academySchluessel))

// ── 3: kein JSON ────────────────────────────────────────────────────────────
const r3 = await senden('/v1/chat/completions', 'kein json ' + kennwort)
pruefe('kein JSON: abgelehnt (415)', r3.status === 415 && angekommen.length === vorher, String(r3.status))

// ── 4: GET ohne Inhalt geht durch (Modellliste) ─────────────────────────────
const r4 = await senden('/v1/models', undefined, 'GET')
pruefe('GET /v1/models weitergeleitet', r4.status === 200 && angekommen.at(-1).url === '/api/v1/models')

// ── 5: fremde Wege ──────────────────────────────────────────────────────────
pruefe('unbekannter Weg: 404', (await senden('/irgendwo', {})).status === 404)

// ── 6: Vorschau für die Leiste über dem Eingabefeld ─────────────────────────
const r6 = JSON.parse((await senden('/schutz/pruefen', { text: `Ruf ${telefon} an, ${name}` })).body)
pruefe('Vorschau maskiert', !r6.text.includes('2345678') && r6.text.includes('[PERSON]') && r6.treffer.person === 1, JSON.stringify(r6.treffer))

// ── 6b: Code in Werkzeugergebnissen bleibt heil, Eingaben werden streng geprüft
const profil = '@' + 'mia_' + 'kind2014'
const r6b = await senden('/v1/chat/completions', { model: 'm', messages: [
  { role: 'user', content: `Mein Profil ist ${profil}` },
  { role: 'tool', tool_call_id: 'c2', content: `/** @param x Wert */ const stand = '2026-10-03' // Tel ${telefon}` },
] })
const a6b = angekommen.at(-1).body
pruefe('Eingabe: Profilname ersetzt', r6b.status === 200 && !a6b.includes(profil), a6b.slice(0, 120))
pruefe('Werkzeugergebnis: @param und Datum bleiben', a6b.includes('@param x') && a6b.includes('2026-10-03'))
pruefe('Werkzeugergebnis: Telefonnummer trotzdem ersetzt', !a6b.includes('2345678'))

// ── 6c: lange Namen, die keine Geheimnisse sind
const { randomBytes } = await import('node:crypto')
const zufall = randomBytes(30).toString('base64url')
const datei = '2026-07-28-directory-picker-capability-seam.md'
const sha1 = 'a3f5c9e1b2d4f6a8c0e2b4d6f8a0c2e4b6d8f0a2'
const r6c = await senden('/v1/chat/completions', { model: 'm', messages: [
  { role: 'tool', tool_call_id: 'c3', content: `Datei ${datei}, Commit ${sha1}, Token ${zufall}` },
  { role: 'user', content: '<system-reminder>\nWorkspace: @promptheus/ui seit 2026-10-03</system-reminder>' },
] })
const a6c = angekommen.at(-1).body
pruefe('Dateiname bleibt lesbar', r6c.status === 200 && a6c.includes(datei))
pruefe('Git-Hash bleibt lesbar', a6c.includes(sha1))
pruefe('zufälliges Token wird ersetzt', !a6c.includes(zufall))
pruefe('eingeblendeter Kontext (Rolle user): wie Code geprüft', a6c.includes('@promptheus/ui') && a6c.includes('2026-10-03'))

// ── 7: das Protokoll ────────────────────────────────────────────────────────
await new Promise(ok => setTimeout(ok, 50))
const spool = join(process.env.PU_TEST_AUDIT, 'spool')
const zeilen = readdirSync(spool).flatMap(d => readFileSync(join(spool, d), 'utf8').trim().split('\n'))
const alles = zeilen.join('\n')
pruefe('Protokoll geschrieben', zeilen.length >= 4, String(zeilen.length))
pruefe('Protokoll ohne Schlüssel, Kennwort, Name, Telefon', !alles.includes(academySchluessel) && !alles.includes(kennwort)
  && !alles.includes('Beispielkind') && !alles.includes('2345678') && !alles.includes(echterSchluessel))
const eintraege = zeilen.map(z => JSON.parse(z))
const blockiert = eintraege.filter(e => e.outcome === 'blocked')
pruefe('zwei Anhaltungen protokolliert (Torschluss, kein JSON)', blockiert.length === 2, String(blockiert.length))
const ersteAnfrage = eintraege.find(e => e.action_type === 'llm_anfrage' && e.outcome === 'success')
pruefe('Ersetzungen gezählt', (ersteAnfrage?.metadata?.maskiert?.geheim ?? 0) >= 3 && ersteAnfrage.metadata.maskiert.person === 1,
  JSON.stringify(ersteAnfrage?.metadata?.maskiert))

await schutz.schliessen()
anbieter.close()
console.log(fehler === 0 ? `✓ ${gut} Prüfungen, alle grün.` : `✕ ${fehler} von ${gut + fehler} Prüfungen fehlgeschlagen.`)
process.exit(fehler === 0 ? 0 : 1)
