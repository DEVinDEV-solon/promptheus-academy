/**
 * PROMPTHEUS Werkstatt — die Adresse mit Zugangstoken für die Academy.
 *
 * Der Harness druckt beim Start eine Zeile `dsh web: http://127.0.0.1:3081/…`.
 * Nur diese Adresse trägt das Zugangstoken; ohne sie kommt niemand hinein. Bisher
 * öffnete der Harness damit ein Browserfenster, und war es weg, half nur ein
 * Neustart.
 *
 * Jetzt liest `starten.mjs` die Zeile mit (die Ausgabe geht unverändert weiter
 * ins Konsolenfenster) und legt die Adresse in `data/werkstatt/adresse.json`
 * ab — mit dem Konto, das gestartet hat. Die Academy gibt sie nur diesem Konto
 * heraus (api.php, `werkstatt_adresse`): Knopf „Zur Werkstatt“.
 *
 * Die Datei lebt so lange wie die Werkstatt: Sie wird vor dem Start gelöscht
 * und beim Beenden auch. Bleibt sie nach einem harten Abbruch liegen, gibt die
 * Academy sie nicht heraus, weil dann niemand auf dem Port antwortet.
 *
 * Die Adresse ist ein Geheimnis. Sie wird nirgends protokolliert.
 */
import { mkdirSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { ACADEMY } from './schutz/maske.mjs'

export const ADRESSE_DATEI = join(ACADEMY, 'data', 'werkstatt', 'adresse.json')

/** Höchstlänge einer Adresse; länger ist keine, die der Harness druckt. */
const LAENGE = 2048

/**
 * Die Adresse aus einer Ausgabezeile des Harness — nur für diesen Rechner und
 * diesen Port.
 * @returns {string|null}
 */
export function adresseAusZeile(zeile, port) {
  const m = /^dsh web: (http:\/\/127\.0\.0\.1:(\d{1,5})\/\S*)/.exec(String(zeile).trim())
  if (m === null || m[2] !== String(port) || m[1].length > LAENGE) return null
  return m[1]
}

/** Schreibt die Datei atomar, nur für das eigene Konto lesbar. */
export function adresseSchreiben(adresse, { lernender = null, port }, datei = ADRESSE_DATEI) {
  mkdirSync(dirname(datei), { recursive: true })
  const inhalt = JSON.stringify({
    adresse,
    lernender: Number.isInteger(lernender) && lernender > 0 ? lernender : null,
    port: Number(port),
    seit: Math.floor(Date.now() / 1000),
  })
  const tmp = `${datei}.${process.pid}.tmp`
  writeFileSync(tmp, inhalt, { encoding: 'utf8', mode: 0o600 })
  renameSync(tmp, datei)
}

export function adresseLoeschen(datei = ADRESSE_DATEI) {
  try { rmSync(datei, { force: true }) } catch { /* bleibt liegen; die Academy prüft den Port */ }
}

/**
 * Reicht einen Ausgabestrom unverändert weiter und meldet jede ganze Zeile.
 * @param {import('node:stream').Readable} strom
 * @param {{write(b:Buffer|string):unknown}} ziel
 * @param {(zeile:string)=>void} beiZeile
 */
export function ausgabeMitlesen(strom, ziel, beiZeile) {
  let rest = ''
  strom.on('data', (stueck) => {
    ziel.write(stueck)
    rest += stueck.toString('utf8')
    let i
    while ((i = rest.indexOf('\n')) !== -1) {
      beiZeile(rest.slice(0, i).replace(/\r$/, ''))
      rest = rest.slice(i + 1)
    }
    // Eine Zeile ohne Ende wächst nicht ohne Grenze.
    if (rest.length > 4 * LAENGE) rest = rest.slice(-LAENGE)
  })
  strom.on('end', () => { if (rest !== '') beiZeile(rest) })
}
