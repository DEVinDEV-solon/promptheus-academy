/**
 * Prüft das Mitlesen der Werkstatt-Adresse (adresse.mjs).
 *
 * Die Tokens hier sind erfunden. Die echte Datei der Academy wird nicht
 * angefasst — geschrieben wird in einen Wegwerf-Ordner.
 *
 * Aufruf: node werkstatt/werkzeuge/adresse_pruefen.mjs
 */
import { existsSync, mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { PassThrough } from 'node:stream'
import { adresseAusZeile, adresseLoeschen, adresseSchreiben, ausgabeMitlesen } from './adresse.mjs'

let fehler = 0, gut = 0
const pruefe = (was, ok, zusatz = '') => {
  if (ok) gut++; else { fehler++; console.log(`   ✕ ${was}${zusatz ? '  (' + zusatz + ')' : ''}`) }
}

const token = 'pu-test-' + Math.random().toString(16).slice(2)
const echt = `http://127.0.0.1:3081/?token=${token}`

// ── 1: welche Zeilen gelten ─────────────────────────────────────────────────
pruefe('die Zeile des Harness', adresseAusZeile(`dsh web: ${echt}`, 3081) === echt)
pruefe('mit Leerraum und Windows-Ende', adresseAusZeile(`  dsh web: ${echt}\r`, '3081') === echt)
pruefe('LAN-Zusatz wird abgeschnitten', adresseAusZeile(`dsh web: ${echt} (LAN: http://192.168.0.2:3081/?token=x)`, 3081) === echt)
pruefe('anderer Port: nein', adresseAusZeile(`dsh web: ${echt}`, 3082) === null)
pruefe('anderer Rechner: nein', adresseAusZeile('dsh web: http://boese.example:3081/?token=x', 3081) === null)
pruefe('localhost: nein (nur 127.0.0.1)', adresseAusZeile('dsh web: http://localhost:3081/?token=x', 3081) === null)
pruefe('andere Zeile: nein', adresseAusZeile('dsh web: opening the default browser; pass --no-open to disable', 3081) === null)
pruefe('Zeile mitten im Text: nein', adresseAusZeile(`log: dsh web: ${echt}`, 3081) === null)
pruefe('überlang: nein', adresseAusZeile(`dsh web: http://127.0.0.1:3081/${'a'.repeat(2100)}`, 3081) === null)

// ── 2: Mitlesen, ohne die Ausgabe zu verändern ──────────────────────────────
const strom = new PassThrough()
const raus = []
const zeilen = []
ausgabeMitlesen(strom, { write: (b) => raus.push(Buffer.from(b)) }, z => zeilen.push(z))
const ganz = `starten: los\r\ndsh web: ${echt}\r\nletzte ohne Ende`
// In unglücklichen Stücken: mitten in der Adresse und mitten im \r\n getrennt.
for (const stueck of [ganz.slice(0, 20), ganz.slice(20, 45), ganz.slice(45, 46 + 'starten: los\r'.length), ganz.slice(46 + 'starten: los\r'.length)]) {
  strom.write(stueck)
}
strom.end()
await new Promise(ok => strom.on('end', ok))
pruefe('Ausgabe unverändert weitergereicht', Buffer.concat(raus).toString('utf8') === ganz)
pruefe('Zeilen ganz erkannt', zeilen.length === 3 && zeilen[1] === `dsh web: ${echt}` && zeilen[2] === 'letzte ohne Ende', JSON.stringify(zeilen.map(z => z.slice(0, 12))))
pruefe('Adresse aus gestückelter Ausgabe', zeilen.map(z => adresseAusZeile(z, 3081)).filter(Boolean)[0] === echt)

// ── 3: Datei schreiben und löschen ──────────────────────────────────────────
const ort = mkdtempSync(join(tmpdir(), 'pu_adresse_'))
const datei = join(ort, 'werkstatt', 'adresse.json')
adresseSchreiben(echt, { lernender: 7, port: 3081 }, datei)
const j = JSON.parse(readFileSync(datei, 'utf8'))
pruefe('Datei mit Adresse, Konto, Port', j.adresse === echt && j.lernender === 7 && j.port === 3081 && Number.isInteger(j.seit))
adresseSchreiben(echt, { lernender: undefined, port: 3081 }, datei)
pruefe('ohne Ticket: kein Konto', JSON.parse(readFileSync(datei, 'utf8')).lernender === null)
adresseSchreiben(echt, { lernender: -3, port: 3081 }, datei)
pruefe('unsinniges Konto: kein Konto', JSON.parse(readFileSync(datei, 'utf8')).lernender === null)
adresseLoeschen(datei)
pruefe('gelöscht', !existsSync(datei))
adresseLoeschen(datei)
pruefe('zweimal löschen: kein Fehler', true)

console.log(fehler === 0 ? `✓ ${gut} Prüfungen, alle grün.` : `✕ ${fehler} von ${gut + fehler} Prüfungen fehlgeschlagen.`)
process.exit(fehler === 0 ? 0 : 1)
