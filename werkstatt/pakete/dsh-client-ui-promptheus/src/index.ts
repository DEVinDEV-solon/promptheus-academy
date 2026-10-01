/**
 * PROMPTHEUS Werkstatt — Node-Hälfte.
 *
 * Sie setzt **den Browser-Titel** und liefert **das Favicon** aus. Beides gehört
 * zur Marke und liegt bei einer Aufwertung des Harness sonst im Harness.
 *
 * **Der Titel, zwei Wege — und warum beide nötig sind.**
 *
 * Der Harness setzt den Tab-Titel zur Laufzeit aus einem **beim Bau
 * eingebackenen** Wert: `process.env.DSH_CLIENT_TITLE` in
 * `packages/client/ui-layout/src/client/AppFrame.tsx:233`. Dieser Wert wird vom
 * Bau-Werkzeug ersetzt und ist im ausgelieferten Bündel nicht mehr änderbar.
 * Er wird deshalb in `werkzeuge/bauen.mjs` **gesetzt** — dort, wo gebaut wird.
 *
 * Diese Node-Hälfte ergänzt den zweiten Weg: sie schreibt den Titel schon in
 * die ausgelieferte `index.html`, damit der Tab gar nicht erst kurz „DSH Local
 * Build" zeigt. Das ist der sichtbare Augenblick vor dem Anlaufen der
 * Oberfläche.
 *
 * **Das Favicon** liegt im Harness in `apps/web/public/favicon.svg`. Diese
 * Hälfte hängt stattdessen eine eigene Route ein — die Marke kommt dann aus
 * unserem Paket und überlebt jede Aufwertung.
 *
 * Die Schnittstellen sind die des Harness: `webserver/index-inject` sammelt
 * Einspeisungen für die `index.html`, `ctx.webServer.register` hängt eine Route
 * ein. `ui-theme` und `ui-settings-models` machen es genauso.
 *
 * Siehe: PROMPTHEUS\vps\Pläne\40_Werkstatt\Deepseek-Dashboard-Maske-Plan.md
 *
 * @module @promptheus/dsh-client-ui-promptheus
 */

import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Der Produktname, den der Browser im Tab zeigt. */
export const PRODUKT_TITEL = 'Werkstatt — Promptheus Academy'

/** Der Pfad, unter dem die Bildmarke als Favicon ausgeliefert wird (helles Schema). */
export const FAVICON_PFAD = '/favicon.svg'

/** Der zweite Favicon-Pfad — für das **dunkle** Farbschema.
 *
 * Die ausgelieferte Seite verweist zweimal auf ein Symbol, je nach
 * `prefers-color-scheme`. Beide müssen bedient werden, sonst zeigt der Browser
 * im dunklen Schema das Symbol des Harness.
 */
export const FAVICON_DUNKEL_PFAD = '/favicon-dark.svg'

/** Der Pfad, unter dem das Hintergrundbild ausgeliefert wird. */
export const HINTERGRUND_PFAD = '/promptheus-hintergrund.jpg'

/**
 * Der Weg in die Community (Plan 30_Community, C2): der Knopf „Community“
 * zeigt hierher, und diese Route leitet an die Academy weiter
 * (`api.php?aktion=community_oeffnen`). Die Academy kennt die Person, prüft
 * das Abo, holt die Einlassmarke und leitet in die Community.
 *
 * Über die Werkstatt und nicht direkt, weil nur die Node-Hälfte weiss, auf
 * welchem Port die Academy läuft (`PROMPTHEUS_ACADEMY_URL`, gesetzt von
 * `werkzeuge/starten.mjs` aus dem Ticket der Academy).
 */
export const GEMEINDE_PFAD = '/promptheus-community'

/** Die Academy, wenn das Ticket keine Adresse trug: die Vorgabe der Startdatei. */
export const ACADEMY_VORGABE = 'http://127.0.0.1:8801'

/** Die sechs Paletten der Werkstatt, wortgleich mit `srv/varianten.php` der Academy. */
const PALETTEN = ['schmiede', 'pergament', 'olymp', 'marmor', 'terrakotta', 'funkenflug']

/**
 * Die Adresse der Academy — nur dieser Rechner. Was nicht passt, fällt auf die
 * Vorgabe zurück: Die Route soll nie an einen fremden Server weiterleiten.
 * @param roh - der Wert aus der Umgebung.
 * @returns Ursprung ohne Schrägstrich am Ende.
 */
export function academyAdresse(roh: string | undefined): string {
  return typeof roh === 'string' && /^http:\/\/(127\.0\.0\.1|localhost):\d{1,5}$/.test(roh) ? roh : ACADEMY_VORGABE
}

/**
 * Das Ziel der Weiterleitung, mit der Palette der Werkstatt (`?v=`), damit
 * der Übergang Werkstatt → Community farblich gleich bleibt.
 * @param academy - Ursprung der Academy.
 * @param url - die angefragte Adresse samt Query.
 * @returns die Adresse von `community_oeffnen`.
 */
export function gemeindeZiel(academy: string, url: string | undefined): string {
  const v = new URL(url ?? '/', 'http://x').searchParams.get('v') ?? ''
  return `${academy}/api.php?aktion=community_oeffnen${PALETTEN.includes(v) ? `&v=${v}` : ''}`
}

/** Das Hintergrundbild im Verhältnis zur Werkstatt-Wurzel. */
const HINTERGRUND_RELATIV = ['assets', 'img', 'promptheus-background.jpg']

/**
 * Der Plugin-Name im Namensraum — vom Loader gelesen.
 *
 * Die Form ist bindend: `name`, `inject`, `apply` als **benannte** Ausfuhren,
 * ohne `default`. Siehe den Vermerk am Ende dieser Datei.
 */
export const name = 'promptheus-werkstatt'

/**
 * Dienste, die dieses Plugin braucht.
 *
 * `webServer` ist die einzige harte Abhängigkeit: ohne ihn gibt es keine
 * ausgelieferte Seite, an der Titel oder Symbol hängen könnten. Der Harness
 * wartet dann, bis der Webserver da ist, statt mit einem Fehler abzubrechen.
 */
export const inject = ['webServer']

/** Der Pfad der Marke im Brand-Ordner, ausgehend von `PROMPTHEUS\`. */
const MARKE_RELATIV = ['Brand', 'mark.svg']

/**
 * Liest die Bildmarke aus `PROMPTHEUS/Brand/mark.svg`.
 *
 * **Warum aus der Datei und nicht als Zeichenkette im Quelltext:** Die Marke ist
 * das Herzstück der Marke und liegt als gepflegte Datei im Brand-Kit. Sie hier
 * abzuschreiben hieße, zwei Fassungen zu pflegen, die auseinanderlaufen.
 *
 * Gesucht wird an mehreren Stellen, weil der Abstand zwischen dem gebauten
 * `lib/index.js` und dem Brand-Ordner von der Ablage abhängt (die Werkstatt
 * liegt in `PROMPTHEUS\werkstatt\`, das Brand-Kit in `PROMPTHEUS\Brand\`).
 * Fehlt die Datei überall, liefert die Route nichts — der Harness fällt dann auf
 * sein eigenes Symbol zurück, und das ist besser als ein kaputtes Bild.
 * @returns die Marke als SVG-Text, oder undefined wenn die Datei fehlt.
 */
function markeLesen(): string | undefined {
  const roh = dateiLesen(MARKE_RELATIV)
  return roh === undefined ? undefined : roh.toString('utf8')
}

/**
 * Liest eine Datei aus der Werkstatt — an mehreren möglichen Ablageorten.
 *
 * Der Abstand zwischen dem gebauten `lib/index.js` und den Ordnern der Werkstatt
 * hängt von der Ablage ab (die Werkstatt liegt in `PROMPTHEUS\werkstatt\`, das
 * Brand-Kit in `PROMPTHEUS\Brand\`). Fehlt die Datei überall, liefert die Route
 * nichts — der Harness fällt dann auf seine eigene Fassung zurück, und das ist
 * besser als ein kaputtes Bild.
 * @param relativ - der Pfad innerhalb der Werkstatt, als Teile.
 * @returns der Inhalt der Datei, oder undefined wenn sie fehlt.
 */
function dateiLesen(relativ: string[]): Buffer | undefined {
  const hier = dirname(fileURLToPath(import.meta.url))
  // Vom gebauten `lib/index.js` aus: Paket → pakete → Werkstatt → PROMPTHEUS.
  const kandidaten = [
    join(hier, '..', '..'), // …\werkstatt
    join(hier, '..', '..', '..'), // …\PROMPTHEUS
    join(hier, '..', '..', '..', '..'), // …\scripts
  ]
  for (const basis of kandidaten) {
    for (const teil of [relativ, ['werkstatt', ...relativ]]) {
      const pfad = join(basis, ...teil)
      if (existsSync(pfad)) return readFileSync(pfad)
    }
  }
  return undefined
}

/**
 * Der Schutz gegen Übersetzungserweiterungen.
 *
 * **Das Problem.** Übersetzungserweiterungen wie Google Translate übersetzen
 * nicht den Text, sondern **ersetzen die Textknoten** im DOM durch eigene
 * Elemente (`<font>`). React führt darüber ein eigenes Schatten-DOM: es glaubt,
 * einen Knoten zu besitzen, den die Erweiterung längst ausgetauscht hat. Will es
 * ihn dann entfernen, bricht es ab:
 *
 *     NotFoundError: Failed to execute 'removeChild' on 'Node':
 *     The node to be removed is not a child of this node.
 *
 * Das ist kein Randfall, sondern ein seit Jahren offener Fehler
 * ([react#11538](https://github.com/react/react/issues/11538)). **Ohne
 * Fehlergrenze hängt React den ganzen Baum ab — die Maske wird weiss.**
 *
 * **Die Behebung** ist die von React selbst empfohlene: die beiden
 * DOM-Methoden, die scheitern können, werden abgesichert. Sie tun dann nichts,
 * wenn sie mit einem Knoten aufgerufen werden, der nicht (mehr) ihr Kind ist,
 * statt eine Ausnahme zu werfen.
 *
 * **Was dieser Schutz NICHT behebt.** Er verhindert den Absturz, nicht das
 * Einfrieren: von Translate ersetzte Textknoten werden im Speicher
 * weiterverändert, im Browser aber nicht mehr angezeigt. Streaming-Ausgaben,
 * Fortschrittsbalken und Tokenzähler **bleiben bei aktiver Übersetzung stehen**.
 * Das lässt sich von aussen nicht beheben — es wäre Arbeit am fremden Quelltext.
 * Wer die Live-Anzeigen braucht, schaltet die Übersetzung ab.
 *
 * **Warum er nichts kostet, wenn nicht übersetzt wird.** Die Absicherung greift
 * nur, wenn der Knoten tatsächlich nicht das Kind ist. Im gewöhnlichen Betrieb
 * läuft jeder Aufruf unverändert durch.
 */
const UEBERSETZUNGS_SCHUTZ = `
(function () {
  if (typeof Node !== 'function' || !Node.prototype) return;
  if (Node.prototype.__promptheusGuarded) return;
  Node.prototype.__promptheusGuarded = true;
  var originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function (child) {
    if (child && child.parentNode !== this) return child;
    return originalRemoveChild.apply(this, arguments);
  };
  var originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) return newNode;
    return originalInsertBefore.apply(this, arguments);
  };
})();
`

/**
 * Node-Hälfte des Pakets.
 *
 * Alle drei Beigaben sind **Effekte**: beim Stoppen oder Ersetzen des Pakets
 * werden sie wieder abgeräumt (Harness-Grundsatz „Registrations are effects").
 *
 * Die ersten beiden sind **optional**: fehlt der Webserver — etwa in einem
 * Nur-Text-Betrieb —, bleibt der Rest des Pakets unberührt. Deshalb `ctx.get`
 * mit Prüfung statt einer festen Abhängigkeit.
 * @param ctx - der Host-Kontext des Harness.
 */
export function apply(ctx: any): void {
  const webServer = ctx.get?.('webServer')
  if (webServer === undefined) return

  // ── Der Weg in die Community ───────────────────────────────────────────────
  // Zuerst, weil die Routen weiter unten bei fehlenden Dateien früh aussteigen.
  const academy = academyAdresse(process.env.PROMPTHEUS_ACADEMY_URL)
  ctx.effect(() => webServer.register({
    kind: 'exact',
    path: GEMEINDE_PFAD,
    handler: (req: any, res: any) => {
      res.writeHead(302, {
        'location': gemeindeZiel(academy, req?.url),
        'cache-control': 'no-store',
        'referrer-policy': 'no-referrer',
      })
      res.end()
    },
  }), `promptheus: Community ${GEMEINDE_PFAD}`)

  // ── Schutz gegen Übersetzungserweiterungen ─────────────────────────────────
  //
  // Diese Einspeisung steht **absichtlich zuerst**: sie muss laufen, bevor React
  // den ersten Knoten anfasst. Die Einspeisungen landen in Tabellenreihenfolge
  // unmittelbar hinter `<head>`, und das Programm der Seite ist ein
  // `type="module"`-Skript — solche Skripte laufen erst nach dem Lesen des
  // Dokuments. Ein gewöhnliches Skript an dieser Stelle ist also früher dran.
  ctx.effect(() => ctx.on('webserver/index-inject', (table: unknown[]) => {
    table.push({ kind: 'script', placement: 'head', text: UEBERSETZUNGS_SCHUTZ })
  }), 'promptheus: Schutz gegen Übersetzungserweiterungen')

  // ── Titel in der ausgelieferten Seite ──────────────────────────────────────
  // `index.html` trägt beim Ausliefern noch den Bau-Vorgabewert. Diese
  // Einspeisung ersetzt ihn, bevor der Browser die Seite anzeigt.
  ctx.effect(() => ctx.on('webserver/index-inject', (table: unknown[]) => {
    table.push({
      // `<` wird escaped, damit der Wert nicht aus dem Element bricht.
      kind: 'html',
      placement: 'head',
      html: `<title>${escapeHtml(PRODUKT_TITEL)}</title>`,
    })
  }), 'promptheus: Browser-Titel')

  // ── Favicon ────────────────────────────────────────────────────────────────
  //
  // **Warum ZWEI Pfade bedient werden.** Die ausgelieferte Seite trägt nicht
  // einen Favicon-Verweis, sondern zwei — je nach Farbschema des Browsers:
  //
  //   <link rel="icon" href="./favicon-dark.svg"  media="(prefers-color-scheme: dark)">
  //   <link rel="icon" href="./favicon.svg"       media="(prefers-color-scheme: light)">
  //
  // Ein Browser im dunklen Schema lädt also **`favicon-dark.svg`**. Genau das
  // war der Grund, warum im Tab weiter das Wal-Symbol zu sehen war: die Route
  // bediente nur `favicon.svg` (das helle), und der dunkle Pfad fiel auf die
  // Datei aus dem Harness zurück.
  //
  // Beide Pfade liefern deshalb dieselbe Marke. Das ist richtig so: die
  // PROMPTHEUS-Bildmarke trägt ihren Grund selbst (`<rect fill="#14110f">`) und
  // ist damit in hell wie dunkel dieselbe.
  const marke = markeLesen()
  if (marke === undefined) {
    // Ohne Marke keine Route: der Harness liefert dann sein eigenes Symbol aus.
    ctx.logger?.warn?.('promptheus: Brand/mark.svg nicht gefunden — der Harness liefert sein eigenes Symbol')
    return
  }
  for (const pfad of [FAVICON_PFAD, FAVICON_DUNKEL_PFAD]) {
    ctx.effect(() => webServer.register({
      kind: 'exact',
      path: pfad,
      handler: (_req: unknown, res: any) => {
        res.writeHead(200, {
          'content-type': 'image/svg+xml; charset=utf-8',
          // Kurz zwischenspeichern; die Marke ändert sich nur bei neuem Bau.
          'cache-control': 'public, max-age=300',
        })
        res.end(marke)
      },
    }), `promptheus: Favicon ${pfad}`)
  }

  // ── Das Hintergrundbild ────────────────────────────────────────────────────
  //
  // **Warum es über den Webserver geht und nicht als Bündelinhalt.** Die Datei
  // ist 452 KB. Als Daten-URI im Client-Bündel würde sie bei jedem Laden
  // mitgeschickt und ließe sich nicht zwischenspeichern. Als eigene Route holt
  // der Browser sie EINMAL und behält sie.
  const bild = dateiLesen(HINTERGRUND_RELATIV)
  if (bild === undefined) {
    ctx.logger?.warn?.('promptheus: assets/img/promptheus-background.jpg nicht gefunden — kein Hintergrundbild')
    return
  }
  ctx.effect(() => webServer.register({
    kind: 'exact',
    path: HINTERGRUND_PFAD,
    handler: (_req: unknown, res: any) => {
      res.writeHead(200, {
        'content-type': 'image/jpeg',
        'content-length': String(bild.length),
        // Lange zwischenspeichern: das Bild ändert sich nur, wenn es ersetzt wird.
        'cache-control': 'public, max-age=86400',
      })
      res.end(bild)
    },
  }), `promptheus: Hintergrundbild ${HINTERGRUND_PFAD}`)
}

/** Escaped Text für die Einbettung in ein HTML-Element. */
function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// **KEIN `export default apply` — das ist kein Stil, sondern ein Vertrag.**
//
// Der Loader des Harness normalisiert ein geladenes Plugin in
// `Loader.unwrapExports`:
//
//   exports = exports.default ?? exports
//
// Steht ein `default` daneben, löst er auf die **nackte Funktion** auf — und
// wirft dabei den Namensraum weg, in dem `inject` und `name` stehen. Das Plugin
// läuft dann in einer Fiber **ohne einen einzigen deklarierten Dienst**, und
// `ctx.get('webServer')` findet nichts.
//
// Genau das ist mir passiert: Titel und Favicon kamen nicht an. Der Harness hat
// den Fall selbst erlebt und in `docs/postmortem/0001-acp-default-export-drops-inject.md`
// aufgeschrieben — ein `export default apply` ließ dort den ACP-Server
// abstürzen, bei 100 % Zeilenabdeckung.
//
// Deshalb gilt ab hier: nur benannte Ausfuhren.
