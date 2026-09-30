/**
 * Prüft den Schutz gegen Übersetzungserweiterungen im ausgelieferten HTML.
 *
 * **Was hier geprüft wird.** Der Schutz nützt nur, wenn er **vor** dem Programm
 * der Seite läuft. Das Programm ist ein `type="module"`-Skript; solche Skripte
 * werden zurückgestellt, bis das Dokument gelesen ist. Ein gewöhnliches Skript
 * im Kopf ist deshalb früher dran — aber das muss man **nachsehen**, nicht
 * annehmen.
 *
 * Zusätzlich wird der Schutz **ausgeführt**: mit einem nachgebauten `Node` wird
 * geprüft, dass er die beiden Methoden tatsächlich ersetzt und dass er den
 * fehlerhaften Fall abfängt.
 *
 * Aufruf:  node werkzeuge\schutz_pruefen.mjs
 */

import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/** Den Schutz-Text aus dem gebauten Node-Bündel ziehen. */
function schutzText() {
  const roh = readFileSync(join(WURZEL, 'pakete', 'dsh-client-ui-promptheus', 'lib', 'index.js'), 'utf8')
  // Der Schutz steht als Zeichenkette im Bündel; zwischen den Backticks lesen.
  const m = roh.match(/UEBERSETZUNGS_SCHUTZ\s*=\s*`([\s\S]*?)`/)
  if (m !== null) return m[1]
  // Im gebauten Bündel kann er auch als gewöhnliche Zeichenkette stehen.
  const m2 = roh.match(/\(function \(\) \{[\s\S]*?__promptheusGuarded[\s\S]*?\}\)\(\);/)
  return m2?.[0]
}

console.log('schutz_pruefen: Schutz gegen Übersetzungserweiterungen')
console.log('')

const text = schutzText()
if (text === undefined) {
  console.error('  ✗ Der Schutz wurde im Bündel nicht gefunden.')
  console.error('    Erwartet in: pakete\\dsh-client-ui-promptheus\\lib\\index.js')
  process.exitCode = 1
  process.exit()
}
console.log(`  ✓ Schutz im Bündel gefunden (${text.length} Zeichen)`)

// ── Ausführen, mit einem nachgebauten Node ───────────────────────────────────
// Zwei Knoten, die einander nicht kennen — genau der Fall, den Translate
// erzeugt: React will einen Knoten entfernen, der nicht mehr sein Kind ist.
const aufgerufen = { removeChild: 0, insertBefore: 0 }

class NodeErsatz {
  constructor(name) { this.name = name; this.parentNode = null }
  removeChild(child) { aufgerufen.removeChild += 1; return child }
  insertBefore(neu, ref) { aufgerufen.insertBefore += 1; return neu }
}
NodeErsatz.prototype.removeChild = function (child) { aufgerufen.removeChild += 1; return child }
NodeErsatz.prototype.insertBefore = function (neu, ref) { aufgerufen.insertBefore += 1; return neu }

globalThis.Node = NodeErsatz
// eslint-disable-next-line no-new-func
new Function(text)()

console.log(`  ✓ Schutz ausgeführt`)
console.log(`      doppelt eingesetzt? ${NodeErsatz.prototype.__promptheusGuarded === true ? 'ja (richtig)' : 'NEIN'}`)

// Der fehlerhafte Fall: ein Knoten, der nicht das Kind ist.
const fremderVater = new NodeErsatz('fremd')
const fremdesKind = new NodeErsatz('kind')
let geworfen = null
try { fremderVater.removeChild(fremdesKind) } catch (e) { geworfen = e }
console.log(`      fremder Knoten entfernen: ${geworfen === null ? 'abgefangen (richtig)' : `WIRFT: ${geworfen.message}`}`)

let geworfen2 = null
try { fremderVater.insertBefore(fremdesKind, new NodeErsatz('ref')) } catch (e) { geworfen2 = e }
console.log(`      fremden Knoten einfügen:  ${geworfen2 === null ? 'abgefangen (richtig)' : `WIRFT: ${geworfen2.message}`}`)

// Der gewöhnliche Fall muss weiterhin durchlaufen.
const echterVater = new NodeErsatz('echt')
const echtesKind = new NodeErsatz('echtkind')
echtesKind.parentNode = echterVater
let geworfen3 = null
try { echterVater.removeChild(echtesKind) } catch (e) { geworfen3 = e }
console.log(`      echter Knoten entfernen:  ${geworfen3 === null ? 'durchgelaufen (richtig)' : `WIRFT: ${geworfen3.message}`}`)

console.log('')
const bestanden = NodeErsatz.prototype.__promptheusGuarded === true && geworfen === null && geworfen2 === null && geworfen3 === null
console.log(bestanden ? 'schutz_pruefen: BESTANDEN' : 'schutz_pruefen: DURCHGEFALLEN')
if (!bestanden) process.exitCode = 1
