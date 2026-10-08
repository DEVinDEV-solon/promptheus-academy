/**
 * Modellwahl der Werkbank (Masterplan Workflow-Modalseite 7.4).
 *
 * Die Werkbank kann ein anderes KI-Modell nutzen als die Werkstatt. Drei Wege:
 *   werkstatt        das Standardmodell der Werkstatt (über die Schutzschicht)
 *   or:<kennung>     ein Modell von OpenRouter (über die Schutzschicht)
 *   cli:claude:<m>   Claude Code auf diesem Rechner, mit dem Abo des Betreibers
 *   cli:codex        Codex auf diesem Rechner, mit dem Abo des Betreibers
 *
 * Die lokalen Programme gibt es nur beim Betreiber: Ein Abo gilt für die
 * Person, die es bezahlt, nicht für Kunden oder Lernende. Ob die Werkstatt
 * beim Betreiber läuft, entscheidet die Academy (Bescheinigung, Art
 * „betreiber“, Ebene admin) und gibt es im Ticket mit; starten.mjs setzt
 * daraus `PROMPTHEUS_BETREIBER=1`.
 *
 * Erkennen heisst: Programm finden, Fassung abfragen, Anmeldestand lesen
 * (nur „angemeldet ja/nein“ und die Art, nie Adresse oder Konto).
 *
 * @module @promptheus/dsh-plugin-workflows/apps/modelle
 */

import { spawn } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { delimiter, join } from 'node:path';
import { Fehler, atomar } from './ablage.mjs';
import { modellErmitteln, schutzAdresse } from './ki.mjs';

/** Eine Wahl, wie sie gespeichert wird. */
export const WAHL_RE = /^(werkstatt|or:[A-Za-z0-9][A-Za-z0-9._:/-]{2,80}|cli:claude:(sonnet|opus|haiku)|cli:codex)$/;

/** Die Modelle der Abo-Programme. Kurznamen, die das Programm selbst auflöst. */
export const CLI_MODELLE = {
  claude: [
    { wahl: 'cli:claude:sonnet', name: 'Claude Sonnet', text: 'Ausgewogen, schnell; gut für Rückfragen und Formulierungen.' },
    { wahl: 'cli:claude:opus', name: 'Claude Opus', text: 'Das stärkste Modell; denkt gründlicher, braucht mehr vom Kontingent.' },
    { wahl: 'cli:claude:haiku', name: 'Claude Haiku', text: 'Das schnellste; schont das Kontingent.' },
  ],
  codex: [
    { wahl: 'cli:codex', name: 'Codex', text: 'Das Vorgabemodell deines ChatGPT-Abos.' },
  ],
};

/** Wohin die Daten gehen, je Weg (Plan 10.2, DSGVO/AI Act). */
export const DATENWEG = {
  schutz: 'Dein Text geht maskiert über die Schutzschicht der Werkstatt an das KI-Modell (OpenRouter, möglicherweise ausserhalb der EU). Trag keine Namen, Adressen oder Zugangsdaten ein.',
  claude: 'Dein Text geht über dein Claude-Abo direkt an Anthropic (USA). Die Werkbank maskiert ihn vorher wie die Schutzschicht und protokolliert jede Anfrage. Trag keine Namen, Adressen oder Zugangsdaten ein.',
  codex: 'Dein Text geht über dein ChatGPT-Abo direkt an OpenAI (USA). Die Werkbank maskiert ihn vorher wie die Schutzschicht und protokolliert jede Anfrage. Trag keine Namen, Adressen oder Zugangsdaten ein.',
};

/** Läuft die Werkstatt beim Betreiber? Nur das Ticket der Academy sagt das (starten.mjs). */
export function istBetreiber(env = process.env) {
  return env.PROMPTHEUS_BETREIBER === '1';
}

/** Die Wahl in ihre Teile: Weg, Modell für die Anfrage, Programm. */
export function wahlZerlegen(wahl, env = process.env) {
  if (typeof wahl !== 'string' || !WAHL_RE.test(wahl)) wahl = 'werkstatt';
  if (wahl === 'werkstatt') return { wahl, weg: 'schutz', modell: modellErmitteln(env) };
  if (wahl.startsWith('or:')) return { wahl, weg: 'schutz', modell: wahl.slice(3) };
  if (wahl === 'cli:codex') return { wahl, weg: 'cli', programm: 'codex', modell: '' };
  return { wahl, weg: 'cli', programm: 'claude', modell: wahl.split(':')[2] };
}

// ------------------------------------------------------------------ Modelle der Werkstatt

/**
 * Die Modelle, die auch die Werkstatt anbietet (`llm-deepseek.models` in den
 * Einstellungen des Harness). Kennungen ohne Anbieter bekommen `deepseek/`,
 * wie in modellErmitteln.
 */
export function werkstattModelle(env = process.env) {
  const aus = [];
  try {
    for (const datei of ['settings.yaml', 'settings.yaml.imported']) {
      const p = env.DSH_HOME ? join(env.DSH_HOME, datei) : null;
      if (!p || !existsSync(p)) continue;
      const t = readFileSync(p, 'utf8').replace(/\r\n?/g, '\n');
      const block = t.match(/^llm-deepseek:[ \t]*\n((?:[ \t]+.*\n?|\n)*)/m)?.[1] || '';
      let akt = null;
      for (const z of block.split('\n')) {
        const id = z.match(/^\s*-\s+id:\s*['"]?([A-Za-z0-9][A-Za-z0-9._:/-]{2,80})/);
        if (id) { akt = { id: id[1].includes('/') ? id[1] : `deepseek/${id[1]}`, name: '' }; aus.push(akt); continue; }
        const nm = z.match(/^\s+name:\s*['"]?([^'"\n]{1,60})/);
        if (nm && akt && !akt.name) akt.name = nm[1].trim();
      }
      if (aus.length) break;
    }
  } catch { /* dann nur das Standardmodell */ }
  const vorgabe = modellErmitteln(env);
  const gesehen = new Set();
  const liste = [{ id: vorgabe, name: aus.find((m) => m.id === vorgabe)?.name || '' }, ...aus].filter((m) => !gesehen.has(m.id) && gesehen.add(m.id));
  return liste.map((m) => ({ wahl: m.id === vorgabe ? 'werkstatt' : `or:${m.id}`, id: m.id, name: m.name || m.id, vorgabe: m.id === vorgabe }));
}

// ------------------------------------------------------------------ OpenRouter

/** Preis je Token (Text) → Dollar je Million Token, gerundet; null wenn unbekannt. */
function jeMillion(x) {
  const n = Number(x);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 1e6 * 100) / 100 : null;
}

/**
 * Die Modelliste von OpenRouter, über die Schutzschicht (`GET /v1/models`).
 * Eine Stunde zwischengespeichert. Nur Modelle, die Text ausgeben.
 */
export function openrouterListe({ schutz = schutzAdresse(), zeitMs = 15000, holen = fetch } = {}) {
  let cache = null;
  let stand = 0;
  return async function liste() {
    if (cache && Date.now() - stand < 3600000) return cache;
    let r;
    try {
      r = await holen(`${schutz}/v1/models`, { headers: { authorization: 'Bearer werkstatt' }, signal: AbortSignal.timeout(zeitMs) });
    } catch {
      throw new Fehler(503, 'Die Schutzschicht der Werkstatt antwortet nicht. Starte die Werkstatt neu.');
    }
    if (!r.ok) throw new Fehler(502, `Die Modellliste kam nicht an (Fehler ${r.status}).`);
    let d;
    try { d = await r.json(); } catch { throw new Fehler(502, 'Die Modellliste ist nicht lesbar.'); }
    const roh = Array.isArray(d?.data) ? d.data : [];
    cache = roh
      .filter((m) => typeof m?.id === 'string' && /^[A-Za-z0-9][A-Za-z0-9._:/-]{2,80}$/.test(m.id))
      .filter((m) => !Array.isArray(m.architecture?.output_modalities) || m.architecture.output_modalities.includes('text'))
      .map((m) => ({
        wahl: `or:${m.id}`, id: m.id,
        name: String(m.name || m.id).replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 80),
        ein: jeMillion(m.pricing?.prompt), aus: jeMillion(m.pricing?.completion),
        kontext: Number.isInteger(m.context_length) ? m.context_length : null,
      }));
    stand = Date.now();
    return cache;
  };
}

/** Suche in der Liste: jedes Wort muss in Kennung oder Name vorkommen. Höchstens 40 Treffer. */
export function modelleSuchen(liste, q = '') {
  const woerter = String(q).toLowerCase().slice(0, 60).split(/\s+/).filter(Boolean);
  const passt = (m) => woerter.every((w) => m.id.toLowerCase().includes(w) || m.name.toLowerCase().includes(w));
  return liste.filter(passt).slice(0, 40);
}

// ------------------------------------------------------------------ Programme auf diesem Rechner

/** Was das Programm braucht, aber kein Schlüssel ist, der es auf einen anderen Weg lenkt. */
const UMGEBUNG_WEG = /^(ANTHROPIC_|OPENAI_|DEEPSEEK_|OPENROUTER_|CLAUDE_CODE_|CLAUDECODE$|DSH_|PROMPTHEUS_|GEMINI_|GOOGLE_API)/i;

/**
 * Die Umgebung für ein Abo-Programm: ohne API-Schlüssel und Umleitungen der
 * Werkstatt. Sonst nähme Claude Code den Platzhalter-Schlüssel der Werkstatt
 * statt des Abos, und kein Schlüssel der Werkstatt erreicht ein fremdes Programm.
 */
export function cliUmgebung(env = process.env) {
  const aus = {};
  for (const [k, v] of Object.entries(env)) if (!UMGEBUNG_WEG.test(k) && typeof v === 'string') aus[k] = v;
  return aus;
}

/**
 * Wo das Programm liegen kann: im PATH, bei Claude Code auch im eigenen
 * Ordner unter dem Benutzerprofil. Unter Windows zuerst `.exe`; eine
 * npm-Hülle (`.cmd`) wird auf ihr Skript aufgelöst, damit nie eine Shell
 * dazwischen steht.
 */
export function programmFinden(name, env = process.env, gibt = existsSync) {
  const win = process.platform === 'win32';
  const ordner = (env.PATH || env.Path || '').split(delimiter).filter(Boolean);
  if (name === 'claude') ordner.unshift(join(homedir(), '.local', 'bin'));
  if (name === 'codex' && win && env.APPDATA) ordner.push(join(env.APPDATA, 'npm'));
  const skript = { claude: ['@anthropic-ai', 'claude-code', 'cli.js'], codex: ['@openai', 'codex', 'bin', 'codex.js'] }[name];
  for (const o of ordner) {
    if (win) {
      const exe = join(o, `${name}.exe`);
      if (gibt(exe)) return { befehl: exe, vorne: [] };
      const cmd = join(o, `${name}.cmd`);
      const js = join(o, 'node_modules', ...skript);
      if (gibt(cmd) && gibt(js)) {
        const node = ordner.map((x) => join(x, 'node.exe')).find((x) => gibt(x));
        if (node) return { befehl: node, vorne: [js] };
      }
    } else {
      const p = join(o, name);
      if (gibt(p)) return { befehl: p, vorne: [] };
    }
  }
  return null;
}

/**
 * Startet ein Programm ohne Shell, mit Zeitgrenze und Grenze für die Ausgabe.
 * Liefert { code, aus, fehler } — wirft nur, wenn es gar nicht startet.
 */
export function ausfuehrenOhneShell(befehl, args, { eingabe = null, cwd, env, zeitMs = 10000, grenze = 1048576 } = {}) {
  return new Promise((ja, nein) => {
    let kind;
    try {
      kind = spawn(befehl, args, { cwd, env, shell: false, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
    } catch (e) { nein(e); return; }
    let aus = '';
    let fehler = '';
    let zeitum = false;
    const uhr = setTimeout(() => { zeitum = true; kind.kill(); }, zeitMs);
    kind.stdout.on('data', (c) => { if (aus.length < grenze) aus += c.toString('utf8'); });
    kind.stderr.on('data', (c) => { if (fehler.length < 8192) fehler += c.toString('utf8'); });
    kind.on('error', (e) => { clearTimeout(uhr); nein(e); });
    kind.on('close', (code) => { clearTimeout(uhr); ja({ code, aus, fehler, zeitum }); });
    kind.stdin.on('error', () => { /* Programm hat früh beendet */ });
    if (eingabe !== null) kind.stdin.end(eingabe, 'utf8'); else kind.stdin.end();
  });
}

/** Der Anmeldestand, ohne Adresse oder Konto. */
async function claudeStand(p, env, laufen) {
  const r = await laufen(p.befehl, [...p.vorne, 'auth', 'status', '--json'], { env, zeitMs: 10000 });
  try {
    const j = JSON.parse(r.aus);
    const art = j.authMethod === 'claude.ai' ? `Abo ${String(j.subscriptionType || '').replace(/[^a-z0-9 -]/gi, '').slice(0, 20)}`.trim() : j.loggedIn ? 'API-Schlüssel' : '';
    return { angemeldet: j.loggedIn === true, art };
  } catch { return { angemeldet: false, art: '' }; }
}
async function codexStand(p, env, laufen) {
  const r = await laufen(p.befehl, [...p.vorne, 'login', 'status'], { env, zeitMs: 10000 });
  // Die Ausgabe kann Teile eines Schlüssels zeigen: nur die Art übernehmen, nie den Text.
  const text = `${r.aus}\n${r.fehler}`;
  if (r.code !== 0 || /not logged in/i.test(text)) return { angemeldet: false, art: '' };
  return { angemeldet: true, art: /chatgpt/i.test(text) ? 'Abo ChatGPT' : 'API-Schlüssel' };
}

/**
 * Sucht Claude Code und Codex. Zehn Minuten zwischengespeichert; `neu` fragt
 * sofort nach (Knopf „Neu suchen“).
 * @returns {() => Promise<Array<{programm, gefunden, fassung, angemeldet, art, pfad}>>}
 */
export function cliErkennung({ env = process.env, finden = programmFinden, laufen = ausfuehrenOhneShell } = {}) {
  let cache = null;
  let stand = 0;
  let laeuft = null;
  async function suchen() {
    const umgebung = cliUmgebung(env);
    const aus = [];
    for (const programm of ['claude', 'codex']) {
      const p = finden(programm, env);
      if (!p) { aus.push({ programm, gefunden: false }); continue; }
      let fassung = '';
      try {
        const r = await laufen(p.befehl, [...p.vorne, '--version'], { env: umgebung, zeitMs: 8000 });
        fassung = (r.aus.match(/\d+\.\d+\.\d+[\w.-]*/) || [''])[0];
      } catch { /* startet nicht */ }
      if (!fassung) { aus.push({ programm, gefunden: false, kaputt: true }); continue; }
      let st = { angemeldet: false, art: '' };
      try { st = programm === 'claude' ? await claudeStand(p, umgebung, laufen) : await codexStand(p, umgebung, laufen); } catch { /* bleibt abgemeldet */ }
      aus.push({ programm, gefunden: true, fassung, ...st, ort: p });
    }
    return aus;
  }
  return async function erkennen(neu = false) {
    if (!neu && cache && Date.now() - stand < 600000) return cache;
    if (!laeuft) laeuft = suchen().then((x) => { cache = x; stand = Date.now(); return x; }).finally(() => { laeuft = null; });
    return laeuft;
  };
}

// ------------------------------------------------------------------ Wahl je Konto

/** Die gespeicherte Wahl eines Kontos (`<konto>/einstellungen.json`). */
export function wahlLesen(kontoDir) {
  try {
    const p = join(kontoDir, 'einstellungen.json');
    if (!existsSync(p) || statSync(p).size > 65536) return 'werkstatt';
    const w = JSON.parse(readFileSync(p, 'utf8'))?.ki?.modell;
    return typeof w === 'string' && WAHL_RE.test(w) ? w : 'werkstatt';
  } catch { return 'werkstatt'; }
}

export function wahlSchreiben(kontoDir, wahl) {
  if (!WAHL_RE.test(wahl)) throw new Fehler(400, 'Diese Modellwahl gibt es nicht');
  const p = join(kontoDir, 'einstellungen.json');
  let alt = {};
  try { if (existsSync(p)) alt = JSON.parse(readFileSync(p, 'utf8')) || {}; } catch { alt = {}; }
  atomar(p, JSON.stringify({ ...alt, ki: { ...(alt.ki || {}), modell: wahl, geaendert: new Date().toISOString() } }, null, 2));
  return wahl;
}

/** Name einer Wahl für Kopfzeile und Audit. */
export function wahlName(wahl, werkstatt = []) {
  const z = wahlZerlegen(wahl);
  if (z.weg === 'cli') return [...CLI_MODELLE.claude, ...CLI_MODELLE.codex].find((m) => m.wahl === wahl)?.name || wahl;
  const w = werkstatt.find((m) => m.wahl === wahl);
  return w ? w.name : z.modell;
}

