/**
 * PROMPTHEUS Werkstatt — Miniplayer für die Begrüssung: die Node-Hälfte.
 *
 * Sie tut genau eines: sie liefert die Audiodatei der Begrüssung über den
 * Webserver der Werkstatt aus, unter einem festen Pfad.
 *
 * **Warum über eine Route und nicht als Bündelinhalt.** Die Datei ist 1,4 MB.
 * Als Daten-URI im Client-Bündel würde sie bei jedem Laden der Oberfläche
 * mitgeschickt. Als eigene Route holt der Browser sie einmal, kann sie
 * zwischenspeichern und beim Springen im Stück nur den gebrauchten Teil
 * nachladen. Dieselbe Überlegung steht beim Hintergrundbild der Maske.
 *
 * **Warum die Datei nicht kopiert wird.** Gelesen wird immer aus
 * `werkstatt/assets/audio/`. Wird die Aufnahme dort ersetzt, ist sie beim
 * nächsten Laden der Seite neu — ohne Neubau des Pakets. Zwei Fassungen
 * derselben Aufnahme wären genau die Sorte Doppelung, die laut auseinanderläuft.
 *
 * **Reichweiten (HTTP Range).** Ein Abspieler springt, und ein Browser lädt
 * lange Töne stückweise. Beides braucht Antworten mit `206 Partial Content`.
 * Ohne sie läuft die Wiedergabe zwar an, das Springen aber führt zu einem
 * erneuten Laden von vorn. Deshalb wird der `Range`-Kopf ausgewertet.
 *
 * **Kein `export default`.** Der Loader des Harness löst
 * `exports.default ?? exports` auf; ein `default` daneben wirft den Namensraum
 * weg, in dem `name` und `inject` stehen, und das Plugin läuft ohne einen
 * einzigen deklarierten Dienst. Der Harness hat diesen Fall selbst erlebt
 * (`docs/postmortem/0001-acp-default-export-drops-inject.md`). Es gilt hier
 * dieselbe Regel wie in der Maske: nur benannte Ausfuhren.
 *
 * @module @promptheus/dsh-client-ui-audio
 */

import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Der Plugin-Name im Namensraum — vom Loader gelesen. */
export const name = 'promptheus-audio'

/**
 * Der Dienst, den dieses Plugin braucht.
 *
 * `webServer` ist die einzige harte Abhängigkeit: ohne ihn gibt es nichts
 * auszuliefern. Der Harness wartet dann, bis der Webserver da ist, statt mit
 * einem Fehler abzubrechen.
 */
export const inject = ['webServer']

/** Der Pfad, unter dem die Begrüssung ausgeliefert wird. Der Client kennt ihn. */
export const AUDIO_PFAD = '/promptheus-begruessung.mp3'

/** Die Audiodatei im Verhältnis zur Werkstatt-Wurzel. */
const AUDIO_RELATIV = ['assets', 'audio', 'hephaistos-begruessung-werkstatt.mp3']

/**
 * Liest die Audiodatei aus der Werkstatt.
 *
 * **Warum gesucht und nicht gesetzt.** Der Abstand zwischen diesem Modul und
 * `werkstatt/assets/audio/` hängt davon ab, wo das Paket liegt:
 *
 *   * im Repo: `werkstatt/pakete/dsh-client-ui-audio/index.js` — die
 *     Werkstatt-Wurzel liegt zwei Ebenen darüber,
 *   * über einen Verweis im Profil (`werkzeuge/begruessung.mjs`): Node löst
 *     den Verweis auf und landet wieder im Repo; ohne Auflösung läge die
 *     Werkstatt-Wurzel bis zu sechs Ebenen darüber.
 *
 * Ein fest eingetragener Pfad wäre in einer der beiden Ablagen falsch. Deshalb
 * wird aufwärts gesucht, und `DSH_HOME` kommt als erster Kandidat dazu: das ist
 * das Verzeichnis `…/werkstatt/.dsh`, dessen Elternordner die Werkstatt ist.
 * Fehlt die Datei überall, liefert die Route nichts — der Player zeigt dann
 * einen Zustand ohne Ton, und das Protokoll sagt warum.
 *
 * @returns der Inhalt der Datei, oder undefined wenn sie fehlt.
 */
function dateiLesen() {
  const hier = dirname(fileURLToPath(import.meta.url))
  const kandidaten = []

  const heim = process.env.DSH_HOME
  if (typeof heim === 'string' && heim !== '') kandidaten.push(join(heim, '..'))

  // Aufwärts bis zu sieben Ebenen; jede wird mit und ohne führendes
  // `werkstatt` versucht, damit beide Ablagen abgedeckt sind.
  for (let ebenen = 2; ebenen <= 7; ebenen += 1) {
    kandidaten.push(join(hier, ...Array(ebenen).fill('..')))
  }

  for (const basis of kandidaten) {
    for (const relativ of [AUDIO_RELATIV, ['werkstatt', ...AUDIO_RELATIV]]) {
      const pfad = join(basis, ...relativ)
      if (existsSync(pfad)) return readFileSync(pfad)
    }
  }
  return undefined
}

/**
 * Beantwortet eine Anfrage nach der Audiodatei — mit und ohne Reichweite.
 *
 * Nur-Lesen, kein Schreiben, keine Annahme von Körpern: eine Anfrage mit
 * `Range` bekommt `206` und genau das angeforderte Stück, eine ohne `Range`
 * die ganze Datei mit `200`. Eine unerfüllbare Reichweite bekommt `416` — das
 * ist die Antwort, mit der ein Browser die Gesamtlänge erfährt und neu ansetzt.
 *
 * @param req - die Anfrage des Browsers.
 * @param res - die Antwort.
 * @param datei - die vollständige Audiodatei im Speicher.
 */
function ausliefern(req, res, datei) {
  const kopf = {
    'content-type': 'audio/mpeg',
    // Sagt dem Browser, dass Springen möglich ist.
    'accept-ranges': 'bytes',
    // Kurz zwischenspeichern: die Aufnahme ändert sich nur, wenn sie ersetzt wird.
    'cache-control': 'public, max-age=3600',
  }

  const treffer = /^bytes=(\d*)-(\d*)$/.exec(String(req?.headers?.range ?? ''))
  if (treffer === null) {
    res.writeHead(200, { ...kopf, 'content-length': String(datei.length) })
    res.end(datei)
    return
  }

  const vonRoh = treffer[1]
  const bisRoh = treffer[2]
  let von
  let bis
  if (vonRoh === '' && bisRoh !== '') {
    // „bytes=-N": die letzten N Bytes.
    von = Math.max(0, datei.length - Number(bisRoh))
    bis = datei.length - 1
  } else {
    von = vonRoh === '' ? 0 : Number(vonRoh)
    bis = bisRoh === '' ? datei.length - 1 : Math.min(Number(bisRoh), datei.length - 1)
  }

  if (!Number.isFinite(von) || !Number.isFinite(bis) || von > bis || von >= datei.length) {
    res.writeHead(416, { 'content-range': `bytes */${datei.length}`, ...kopf })
    res.end()
    return
  }

  const stueck = datei.subarray(von, bis + 1)
  res.writeHead(206, {
    ...kopf,
    'content-range': `bytes ${von}-${bis}/${datei.length}`,
    'content-length': String(stueck.length),
  })
  res.end(stueck)
}

/**
 * Node-Hälfte des Pakets.
 *
 * Die Route ist ein **Effekt**: beim Stoppen oder Ersetzen des Pakets wird sie
 * wieder abgeräumt (Harness-Grundsatz „Registrations are effects").
 *
 * @param ctx - der Host-Kontext des Harness.
 */
export function apply(ctx) {
  const webServer = ctx.get?.('webServer')
  if (webServer === undefined) return

  const datei = dateiLesen()
  if (datei === undefined) {
    // Ein Warnhinweis statt eines Fehlers: die Oberfläche soll auch ohne Ton
    // erscheinen. Der Grund gehört ins Protokoll, sonst sucht man ihn am
    // Bildschirm.
    ctx.logger?.warn?.(`promptheus: ${AUDIO_RELATIV.join('/')} nicht gefunden — der Player bleibt stumm`)
    return
  }

  ctx.effect(() => webServer.register({
    kind: 'exact',
    path: AUDIO_PFAD,
    handler: (req, res) => ausliefern(req, res, datei),
  }), `promptheus: Begrüssung ${AUDIO_PFAD}`)
}
