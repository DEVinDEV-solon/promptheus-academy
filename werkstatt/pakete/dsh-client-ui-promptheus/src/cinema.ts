/**
 * PROMPTHEUS Werkstatt — der Weg ins Cinema Studio (Node-Hälfte).
 *
 * Der Knopf „Cinema-Studio“ links unten (Client-Hälfte, `CINEMA_URL`) öffnet
 * in einem neuen Tab die Seite {@link CINEMA_PFAD}. Sie erklärt Schritt für
 * Schritt, was passiert, und ruft dann {@link CINEMA_PFAD}`/starten`:
 *
 *   1. Läuft Cinema Studio schon, geht es gleich weiter.
 *   2. Sonst legt die Werkstatt ein **Ticket** in den Programmordner
 *      (`zugang/ticket.json`, 32 Hexzeichen, höchstens zwei Minuten, einmalig)
 *      und startet `CINEMA-STUDIO-START.bat` in einem eigenen Fenster.
 *   3. Cinema Studio prüft das Ticket beim Start selbst (`zugang.py`) und
 *      verbraucht es. Ohne Ticket beendet es sich — einen Start ohne Ticket gibt
 *      es bewusst nicht (Entscheidung vom 06.10.2026).
 *   4. Die Seite fragt {@link CINEMA_PFAD}`/stand`, bis Cinema Studio antwortet,
 *      und leitet dann weiter.
 *
 * Die Kette ist damit Academy → Werkstatt → Cinema Studio: Die Werkstatt
 * startet nur mit dem Ticket der Academy (`werkzeuge/starten.mjs`), Cinema
 * Studio nur mit dem Ticket der Werkstatt.
 *
 * **Grenze:** eine Sperre auf demselben Rechner. Wer Schreibrechte auf den
 * Programmordner hat, kann ein Ticket selbst anlegen. Auf Schulrechnern gehört
 * der Ordner deshalb dem Verwalter-Konto.
 *
 * Alle drei Wege nehmen nur Anfragen der eigenen Werkstatt-Seite an
 * (`Sec-Fetch-Site: same-origin`). Sonst könnte eine fremde Seite auf diesem
 * Rechner Cinema Studio starten.
 */

import { spawn } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { existsSync, mkdirSync, renameSync, writeFileSync } from 'node:fs'
import { isAbsolute, join } from 'node:path'

/** Die Route der Werkstatt, auf die der Knopf zeigt. */
export const CINEMA_PFAD = '/promptheus-cinema'

/** Der Port von Cinema Studio, wenn nichts anderes gesetzt ist (`BILDGEN_PORT` in Cinema Studio). */
export const CINEMA_PORT_VORGABE = 8796

/** Die Startdatei im Programmordner. */
export const STARTER = 'CINEMA-STUDIO-START.bat'

/** So lange gilt ein Ticket höchstens — wortgleich mit `HOECHSTENS` in `zugang.py`. */
export const TICKET_SEKUNDEN = 120

/** So lange wartet die Seite auf Cinema Studio, bevor sie einen Fehler zeigt. */
export const WARTEN_SEKUNDEN = 60

/**
 * Wo Cinema Studio liegen kann, gesehen von der Werkstatt-Wurzel aus.
 *
 * Der erste Ort ist das Ziel. Der zweite ist der heutige Ort (06.10.2026): eine
 * Arbeitskopie, die tief im Ordner `CINEMA-STUDIO` steckt. Wird das Programm
 * an das Ziel gelegt, gilt automatisch der erste Ort.
 */
export const CINEMA_ORTE: readonly string[][] = [
  ['scripts', 'CINEMA-STUDIO'],
  ['scripts', 'CINEMA-STUDIO', '.claude', 'worktrees', 'image-generator-dashboard-aff1bf', 'scripts', 'cinemastudio'],
]

/** Ein Ordner gilt nur, wenn Server, Sperre und Startdatei darin liegen. */
export function istCinemaOrdner(ordner: string): boolean {
  return ['server.py', 'zugang.py', STARTER].every(datei => existsSync(join(ordner, datei)))
}

/**
 * Findet den Programmordner von Cinema Studio.
 * @param werkstatt - die Werkstatt-Wurzel.
 * @param roh - `PROMPTHEUS_CINEMA_DIR`, falls gesetzt (absoluter Pfad).
 * @returns der Ordner, oder undefined, wenn keiner passt.
 */
export function cinemaOrdner(werkstatt: string, roh?: string): string | undefined {
  if (typeof roh === 'string' && roh !== '' && isAbsolute(roh) && istCinemaOrdner(roh)) return roh
  for (const teile of CINEMA_ORTE) {
    const ordner = join(werkstatt, ...teile)
    if (istCinemaOrdner(ordner)) return ordner
  }
  return undefined
}

/** Der Port aus `PROMPTHEUS_CINEMA_PORT`, sonst die Vorgabe. */
export function cinemaPort(roh?: string): number {
  const zahl = typeof roh === 'string' && /^\d{4,5}$/.test(roh) ? Number(roh) : NaN
  return zahl >= 1024 && zahl <= 65535 ? zahl : CINEMA_PORT_VORGABE
}

/**
 * Darf dieser Pfad in eine cmd-Zeile? Zeichen, die cmd oder die verzögerte
 * Erweiterung der Startdatei deuten würden, sind ausgeschlossen.
 */
export function pfadSicherFuerCmd(pfad: string): boolean {
  return !/["%^&|<>!\r\n]/.test(pfad)
}

/**
 * Antwortet Cinema Studio auf diesem Port? Geprüft wird der Server-Kopf
 * (`server_version = "Multi-LLM"` in `server.py`), damit kein fremdes Programm
 * auf demselben Port für Cinema Studio gehalten wird.
 */
export async function laeuft(port: number): Promise<boolean> {
  try {
    const antwort = await fetch(`http://127.0.0.1:${port}/`, {
      redirect: 'manual',
      signal: AbortSignal.timeout(1500),
    })
    await antwort.body?.cancel()
    return /^Multi-LLM\b/i.test(antwort.headers.get('server') ?? '')
  } catch {
    return false
  }
}

/**
 * Legt das Ticket ab: erst unter einem Zufallsnamen, dann umbenannt — so liest
 * Cinema Studio nie eine halb geschriebene Datei.
 * @returns der Pfad des Tickets.
 */
export function ticketSchreiben(ordner: string, jetzt: number = Date.now()): string {
  const zugang = join(ordner, 'zugang')
  mkdirSync(zugang, { recursive: true })
  const ticket = {
    nonce: randomBytes(16).toString('hex'),
    ablauf: Math.floor(jetzt / 1000) + TICKET_SEKUNDEN,
    von: 'werkstatt',
  }
  const zwischen = join(zugang, `ticket.${randomBytes(4).toString('hex')}.tmp`)
  writeFileSync(zwischen, JSON.stringify(ticket), 'utf8')
  const ziel = join(zugang, 'ticket.json')
  renameSync(zwischen, ziel)
  return ziel
}

/**
 * Die Umgebung für Cinema Studio — ohne die Werte der Werkstatt.
 *
 * Wichtig: Die Werkstatt trägt `OPENROUTER_API_KEY` als **Platzhalter** für die
 * Schutzschicht. Cinema Studio liest denselben Namen und gibt der Umgebung
 * Vorrang vor seiner eigenen Einstellung — mit dem Platzhalter bekäme es von
 * OpenRouter nur HTTP 401. Deshalb fallen alle Anbieter- und Werkstattwerte weg.
 */
export function starterUmgebung(umgebung: Record<string, string | undefined>): Record<string, string> {
  const weg = /^(OPENROUTER_|DEEPSEEK_|ANTHROPIC_|OPENAI_|DSH_|PROMPTHEUS_|CLAUDE_CODE_|BILDGEN_)|^NODE_OPTIONS$/i
  const sauber: Record<string, string> = {}
  for (const [name, wert] of Object.entries(umgebung)) {
    if (typeof wert === 'string' && !weg.test(name)) sauber[name] = wert
  }
  return sauber
}

/**
 * Startet `CINEMA-STUDIO-START.bat` in einem eigenen, sichtbaren Fenster.
 *
 * Über `cmd /d /s /c "start …"`: Node startet eine `.bat` nicht ohne Shell
 * (EINVAL), und `start` gibt ihr ein eigenes Fenster, das nach dem Schliessen
 * des Tabs offen bleibt. Der Pfad ist vorher mit {@link pfadSicherFuerCmd}
 * geprüft; sonst steht nichts Veränderliches in der Zeile.
 */
export function starterAufrufen(ordner: string): void {
  const zeile = `"start "PROMPTHEUS Cinema Studio" /d "${ordner}" "${join(ordner, STARTER)}""`
  const kind = spawn('cmd.exe', ['/d', '/s', '/c', zeile], {
    cwd: ordner,
    env: starterUmgebung(process.env),
    detached: true,
    stdio: 'ignore',
    windowsVerbatimArguments: true,
  })
  kind.on('error', () => { /* die Seite meldet es über die Wartezeit */ })
  kind.unref()
}

/** Was die Routen brauchen — in den Prüfungen nachgestellt. */
export interface CinemaUmgebung {
  werkstatt: string
  ordnerRoh?: string
  port: number
  starten?: (ordner: string) => void
  laeuftPruefen?: (port: number) => Promise<boolean>
  jetzt?: () => number
}

/** Kam die Anfrage von der eigenen Werkstatt-Seite? */
function eigeneSeite(req: any): boolean {
  return String(req?.headers?.['sec-fetch-site'] ?? '') === 'same-origin'
}

function json(res: any, code: number, daten: unknown): void {
  res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
  res.end(JSON.stringify(daten))
}

/**
 * Die drei Wege: Startseite, Start und Stand.
 * @returns je Pfad ein Handler.
 */
export function cinemaRouten(u: CinemaUmgebung): Record<string, (req: any, res: any) => void> {
  const starten = u.starten ?? starterAufrufen
  const laeuftPruefen = u.laeuftPruefen ?? laeuft
  const jetzt = u.jetzt ?? Date.now
  const adresse = `http://127.0.0.1:${u.port}/`
  // Zwei Klicks kurz hintereinander starten nur ein Fenster.
  let letzterStart = 0

  return {
    [CINEMA_PFAD]: (req, res) => {
      if (req?.method !== 'GET' && req?.method !== 'HEAD') return json(res, 405, { fehler: 'nur GET' })
      const nonce = randomBytes(16).toString('base64')
      res.writeHead(eigeneSeite(req) ? 200 : 403, {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store',
        'referrer-policy': 'no-referrer',
        'x-content-type-options': 'nosniff',
        'content-security-policy':
          `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'nonce-${nonce}'; ` +
          `connect-src 'self'; img-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`,
      })
      res.end(req?.method === 'HEAD' ? undefined : startseite(nonce, eigeneSeite(req)))
    },

    [`${CINEMA_PFAD}/starten`]: (req, res) => {
      if (req?.method !== 'POST') return json(res, 405, { fehler: 'nur POST' })
      if (!eigeneSeite(req)) return json(res, 403, { fehler: 'fremd' })
      void (async () => {
        const ordner = cinemaOrdner(u.werkstatt, u.ordnerRoh)
        if (ordner === undefined) return json(res, 404, { fehler: 'nicht-eingerichtet' })
        if (await laeuftPruefen(u.port)) return json(res, 200, { stand: 'laeuft', adresse })
        if (jetzt() - letzterStart < WARTEN_SEKUNDEN * 1000) return json(res, 200, { stand: 'startet' })
        if (!pfadSicherFuerCmd(ordner)) return json(res, 500, { fehler: 'pfad' })
        try {
          ticketSchreiben(ordner, jetzt())
          starten(ordner)
        } catch {
          return json(res, 500, { fehler: 'start' })
        }
        letzterStart = jetzt()
        return json(res, 200, { stand: 'startet' })
      })()
    },

    [`${CINEMA_PFAD}/stand`]: (req, res) => {
      if (req?.method !== 'GET') return json(res, 405, { fehler: 'nur GET' })
      if (!eigeneSeite(req)) return json(res, 403, { fehler: 'fremd' })
      void laeuftPruefen(u.port).then(ja => json(res, 200, ja ? { stand: 'laeuft', adresse } : { stand: 'startet' }))
    },
  }
}

/**
 * Die Startseite: Marke, drei Schritte, eine Meldung. Alles eingebettet — keine
 * Schrift, kein Bild, kein Skript von aussen. Die Bildmarke kommt von der
 * Werkstatt selbst (`/favicon.svg`).
 */
export function startseite(nonce: string, erlaubt: boolean): string {
  const SEKUNDEN = WARTEN_SEKUNDEN
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Cinema Studio wird geöffnet — PROMPTHEUS</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<style nonce="${nonce}">
:root{
  --grund:#14110f; --grund-2:#1c1815; --grund-3:#262019; --rand:#3a3129;
  --schrift:#ede5db; --schrift-2:#b3a596; --glut:#ff7a1c; --glut-hell:#ffa347; --gold:#ffc94d;
  --serife:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;
  --grotesk:"Segoe UI",system-ui,Roboto,Helvetica,Arial,sans-serif;
}
*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px 16px;
  background:var(--grund);color:var(--schrift);font:15px/1.55 var(--grotesk)}
.karte{width:100%;max-width:520px;background:var(--grund-2);border:1px solid var(--rand);border-radius:16px;padding:28px 26px}
.marke{display:flex;align-items:center;gap:12px;margin-bottom:22px}
.marke img{width:40px;height:40px}
.name{font-family:var(--serife);font-size:1.3rem;font-weight:600;letter-spacing:.05em;line-height:1}
.zusatz{font-size:.68rem;letter-spacing:.3em;text-transform:uppercase;color:var(--schrift-2);margin-top:5px}
h1{font-family:var(--serife);font-weight:600;font-size:1.25rem;margin:0 0 6px}
p{margin:0 0 14px;color:var(--schrift-2)}
ol{list-style:none;margin:18px 0 0;padding:0;display:flex;flex-direction:column;gap:12px}
li{display:flex;gap:12px;align-items:flex-start;padding:12px 14px;border:1px solid var(--rand);border-radius:12px;background:var(--grund-3)}
li .punkt{flex:none;width:24px;height:24px;border-radius:50%;border:1px solid var(--rand);display:flex;align-items:center;
  justify-content:center;font-size:.8rem;color:var(--schrift-2);margin-top:1px}
li b{display:block;font-weight:600;color:var(--schrift)}
li span.text{color:var(--schrift-2);font-size:.92rem}
li.aktiv{border-color:var(--glut)}
li.aktiv .punkt{border-color:var(--glut);color:var(--glut);animation:puls 1.4s ease-in-out infinite}
li.fertig .punkt{background:var(--gold);border-color:var(--gold);color:var(--grund)}
@keyframes puls{50%{opacity:.35}}
@media (prefers-reduced-motion:reduce){li.aktiv .punkt{animation:none}}
.meldung{margin-top:18px;padding:12px 14px;border-radius:12px;border:1px solid var(--glut);background:var(--grund-3);display:none}
.meldung.an{display:block}
.meldung b{display:block;margin-bottom:4px}
button{margin-top:12px;font:inherit;font-weight:600;padding:9px 16px;border-radius:10px;border:0;cursor:pointer;
  background:linear-gradient(180deg,var(--glut-hell),var(--glut));color:var(--grund)}
button:focus-visible{outline:2px solid var(--gold);outline-offset:2px}
</style>
</head>
<body>
<main class="karte" aria-live="polite">
  <div class="marke"><img src="/favicon.svg" alt="">
    <div><div class="name">PROMPTHEUS</div><div class="zusatz">- Cinema Studio -</div></div></div>
  <h1>Cinema Studio wird geöffnet</h1>
  <p>Hier erzeugst du gleich Bilder, Videos und Audio. Du musst nichts tun — diese Seite zeigt dir, was gerade passiert.</p>
  <ol>
    <li id="s1"><span class="punkt">1</span><div><b>Zugang prüfen</b>
      <span class="text">Die Werkstatt stellt dir einen Zugangsschein aus. Er gilt zwei Minuten und nur für diesen einen Start.</span></div></li>
    <li id="s2"><span class="punkt">2</span><div><b>Programm starten</b>
      <span class="text">Gleich öffnet sich ein schwarzes Fenster. Lass es offen, solange du mit Cinema Studio arbeitest. Schliesst du es, endet Cinema Studio.</span></div></li>
    <li id="s3"><span class="punkt">3</span><div><b>Weiter zu Cinema Studio</b>
      <span class="text">Sobald Cinema Studio bereit ist, geht es hier von selbst weiter.</span></div></li>
  </ol>
  <div class="meldung" id="meldung" role="alert"><b id="mTitel"></b><span id="mText"></span>
    <div><button type="button" id="nochmal">Noch einmal versuchen</button></div></div>
</main>
<script nonce="${nonce}">
(function () {
  var ERLAUBT = ${erlaubt ? 'true' : 'false'};
  var GRENZE = Date.now() + ${SEKUNDEN} * 1000;
  var MELDUNGEN = {
    fremd: ['Bitte aus der Werkstatt öffnen', 'Cinema Studio öffnet sich nur über den Knopf „Cinema-Studio“ links unten in der Werkstatt. Geh zurück in die Werkstatt und klicke dort darauf.'],
    'nicht-eingerichtet': ['Cinema Studio ist auf diesem Rechner nicht eingerichtet', 'Die Werkstatt findet das Programm nicht. Es gehört in den Ordner werkstatt\\\\scripts\\\\CINEMA-STUDIO. Wende dich an die Person, die bei dir die Academy betreut.'],
    pfad: ['Der Ordner von Cinema Studio hat einen ungewöhnlichen Namen', 'Im Pfad steht eines der Zeichen " % ^ & | < > !. Damit lässt sich das Programm nicht sicher starten. Benenne den Ordner um und versuche es dann noch einmal.'],
    start: ['Cinema Studio liess sich nicht starten', 'Die Werkstatt konnte den Zugangsschein nicht ablegen oder das Programm nicht aufrufen. Versuche es noch einmal. Klappt es wieder nicht, starte die Werkstatt neu.'],
    zeit: ['Cinema Studio meldet sich nicht', 'Schau in das schwarze Fenster „PROMPTHEUS Cinema Studio“: Dort steht, was fehlt — zum Beispiel Python. Ist kein Fenster aufgegangen, versuche es noch einmal.'],
    netz: ['Die Werkstatt antwortet nicht', 'Läuft die Werkstatt noch? Ist ihr Fenster zu, öffne sie wieder aus der Academy und klicke dann noch einmal auf „Cinema-Studio“.']
  };
  function schritt(n) {
    for (var i = 1; i <= 3; i++) {
      var el = document.getElementById('s' + i);
      el.className = i < n ? 'fertig' : (i === n ? 'aktiv' : '');
      el.querySelector('.punkt').textContent = i < n ? '\\u2713' : String(i);
    }
  }
  function melden(art) {
    var m = MELDUNGEN[art] || MELDUNGEN.start;
    document.getElementById('mTitel').textContent = m[0];
    document.getElementById('mText').textContent = m[1];
    document.getElementById('meldung').className = 'meldung an';
    document.getElementById('nochmal').hidden = art === 'fremd' || art === 'nicht-eingerichtet';
  }
  function weiter(adresse) {
    schritt(4);
    if (/^http:\\/\\/127\\.0\\.0\\.1:\\d{1,5}\\/$/.test(adresse)) setTimeout(function () { location.replace(adresse); }, 600);
  }
  function abfragen() {
    fetch('${CINEMA_PFAD}/stand', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (d) {
      if (d.stand === 'laeuft') return weiter(d.adresse);
      if (Date.now() > GRENZE) return melden('zeit');
      setTimeout(abfragen, 1000);
    }).catch(function () { melden('netz'); });
  }
  function los() {
    document.getElementById('meldung').className = 'meldung';
    GRENZE = Date.now() + ${SEKUNDEN} * 1000;
    if (!ERLAUBT) { schritt(1); return melden('fremd'); }
    schritt(1);
    fetch('${CINEMA_PFAD}/starten', { method: 'POST', cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (d) {
      if (d.fehler) return melden(d.fehler);
      if (d.stand === 'laeuft') { schritt(3); return weiter(d.adresse); }
      schritt(2);
      setTimeout(function () { schritt(3); abfragen(); }, 1500);
    }).catch(function () { melden('netz'); });
  }
  document.getElementById('nochmal').addEventListener('click', los);
  los();
})();
</script>
</body>
</html>
`
}
