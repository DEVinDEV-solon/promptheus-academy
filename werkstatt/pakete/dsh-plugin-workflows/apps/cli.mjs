/**
 * „KI fragen“ über ein Abo-Programm auf diesem Rechner (Masterplan
 * Workflow-Modalseite 7.4): Claude Code oder Codex, nur beim Betreiber.
 *
 * Diese Anfragen laufen nicht durch die Schutzschicht, sondern direkt vom
 * Programm zum Anbieter. Deshalb macht dieser Weg dasselbe wie die
 * Schutzschicht, bevor etwas hinausgeht:
 *   - dieselbe Maske (Geheimwerte, Muster, Kontonamen, PII) über die ganze Anfrage,
 *   - Torschluss: steht danach noch ein bekannter Wert darin, geht nichts hinaus (451),
 *   - Audit `llm_anfrage` mit Modell, Zählwerten, Bytes und Dauer, nie mit Inhalt.
 *
 * Der Aufruf selbst: ohne Shell, in einem leeren Ordner, ohne Werkzeuge,
 * ohne MCP, ohne Einstellungen und Sitzungen des Programms, ohne die
 * Schlüssel der Werkstatt in der Umgebung, mit Zeitgrenze und immer nur
 * eine Anfrage zur Zeit.
 *
 * @module @promptheus/dsh-plugin-workflows/apps/cli
 */

import { mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Fehler } from './ablage.mjs';
import { SYSTEM, jsonAusText } from './ki.mjs';
import { ausfuehrenOhneShell, cliUmgebung } from './modelle.mjs';

const ANBIETER = { claude: 'Anthropic (USA)', codex: 'OpenAI (USA)' };

/** Programme, die gerade eine Frage bearbeiten: je Programm nur eine zur Zeit. */
const BESETZT = new Set();

/** Die Maske der Schutzschicht, einmal geladen. Ohne Maske geht nichts hinaus. */
let maskeCache = null;
async function maskeStandard() {
  if (!maskeCache) {
    const { maskeLaden } = await import('../../../werkzeuge/schutz/maske.mjs');
    maskeCache = maskeLaden().maske;
  }
  return maskeCache;
}

/** Die Aufrufzeile je Programm. Die Nachricht geht immer über stdin, nie als Argument. */
export function aufruf(programm, modell, system, ausgabeDatei) {
  if (programm === 'claude') {
    return [
      '-p', '--output-format', 'json',
      '--tools', '',
      '--strict-mcp-config', '--mcp-config', '{"mcpServers":{}}',
      '--setting-sources', '',
      '--no-session-persistence', '--disable-slash-commands',
      '--system-prompt', system,
      '--model', modell,
    ];
  }
  if (programm === 'codex') {
    return [
      'exec', '--skip-git-repo-check', '--sandbox', 'read-only', '--color', 'never',
      '--output-last-message', ausgabeDatei,
      ...(modell ? ['-m', modell] : []),
      '-',
    ];
  }
  throw new Fehler(400, 'Unbekanntes Programm');
}

/** Fehlermeldung für die Seite, ohne Ausgabe des Programms. */
function cliFehler(programm, art) {
  const name = programm === 'claude' ? 'Claude Code' : 'Codex';
  if (art === 'abgemeldet') return new Fehler(409, `${name} ist auf diesem Rechner nicht angemeldet. Melde dich im Terminal mit „${programm}“ an und such dann in der Modellwahl neu.`);
  if (art === 'kontingent') return new Fehler(429, `Das Kontingent deines Abos ist gerade aufgebraucht. Wähl ein anderes Modell oder versuch es später noch einmal.`);
  if (art === 'zeit') return new Fehler(504, `${name} hat zu lange gebraucht. Versuch es noch einmal oder wähl ein schnelleres Modell.`);
  if (art === 'besetzt') return new Fehler(429, `${name} arbeitet noch an der letzten Frage. Warte einen Moment.`);
  return new Fehler(502, `${name} hat keine verwertbare Antwort gegeben.`);
}

/** Die Antwort von Claude Code (`--output-format json`). */
export function claudeAuswerten(r) {
  let j = null;
  try { j = JSON.parse(r.aus); } catch { j = null; }
  const text = `${j?.result ?? ''}\n${r.fehler}`;
  if (/not logged in|please run \/login|invalid api key|oauth token/i.test(text) || j?.api_error_status === 401) return { art: 'abgemeldet' };
  if (j?.api_error_status === 429 || /usage limit|rate limit|limit reached|quota/i.test(text)) return { art: 'kontingent' };
  if (!j || j.is_error || r.code !== 0 || typeof j.result !== 'string') return { art: 'kaputt' };
  return { text: j.result };
}

/** Die Antwort von Codex: die letzte Nachricht steht in der Ausgabedatei. */
export function codexAuswerten(r, letzte) {
  const text = `${r.aus}\n${r.fehler}`;
  if (/not logged in|login required|unauthorized|401/i.test(text) && !letzte) return { art: 'abgemeldet' };
  if (/usage limit|rate limit|quota|429/i.test(text) && !letzte) return { art: 'kontingent' };
  if (r.code !== 0 || !letzte) return { art: 'kaputt' };
  return { text: letzte };
}

/**
 * Baut die Frage-Funktion für ein Abo-Programm.
 * @param o.wahl - die Wahl (`cli:claude:sonnet`, `cli:codex`), steht im Audit als Modell.
 * @param o.programm - `claude` oder `codex`.
 * @param o.ort - { befehl, vorne } aus programmFinden.
 * @param o.modell - Kurzname für `--model` (Claude) oder leer (Codex: Vorgabe des Abos).
 * @param o.audit - Funktion für die Audit-Zeile (Quelle `workflow`).
 * @param o.konto - Kennung des Kontos für das Audit.
 * @param o.maske - Prüfungen setzen eine eigene Maske ein; sonst die der Schutzschicht.
 * @param o.laufen - Prüfungen setzen ein Fake-Programm ein.
 * @returns {(nutzer: string) => Promise<{antwort: object, modell: string}>}
 */
export function cliKi({ wahl, programm, ort, modell = '', audit = null, konto = '', env = process.env, maske = null, laufen = ausfuehrenOhneShell, zeitMs = 90000, ordner = tmpdir() }) {
  if (!ort || typeof ort.befehl !== 'string') throw new Fehler(409, 'Das Programm wurde auf diesem Rechner nicht gefunden.');
  const protokoll = (outcome, severity, beschreibung, metadata) => {
    try {
      audit?.({
        action_type: 'llm_anfrage', action_description: beschreibung,
        resource: `cli:${programm}`, model: wahl, outcome, severity,
        actor_type: 'user', actor_id: konto,
        metadata: { anbieter: ANBIETER[programm], weg: 'abo-programm', ...metadata },
      });
    } catch { /* Spool voll? Die Antwort geht vor */ }
  };

  return async function fragen(nutzer) {
    if (BESETZT.has(programm)) throw cliFehler(programm, 'besetzt');
    BESETZT.add(programm);
    const start = Date.now();
    let tmp = null;
    try {
      let m;
      try { m = maske || await maskeStandard(); } catch { m = null; }
      if (!m) {
        protokoll('blocked', 'critical', 'Abo-Programm: Maske nicht geladen. Nichts gesendet.', {});
        throw new Fehler(503, 'Die Maske der Schutzschicht liess sich nicht laden. Ohne sie geht nichts an das Programm.');
      }

      // Maskieren wie die Schutzschicht: dieselbe Form einer Modellanfrage.
      const zaehler = {};
      const maskiert = m.wert({ messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: String(nutzer) }] }, zaehler);
      const nutzlast = JSON.stringify(maskiert);
      const rest = m.torschluss(nutzlast);
      if (rest.length > 0) {
        protokoll('blocked', 'critical', 'Torschluss: ein bekannter Wert hat die Maskierung überstanden. Nichts gesendet.', { torschluss: rest, maskiert: zaehler });
        throw new Fehler(451, 'Ein geschützter Wert hätte das Haus verlassen. Die Frage wurde angehalten und protokolliert. Lass Namen, Adressen und Nummern weg.');
      }
      const system = maskiert.messages[0].content;
      const text = maskiert.messages[1].content;

      tmp = mkdtempSync(join(ordner, 'pw-ki-'));
      const ausgabe = join(tmp, 'antwort.txt');
      const args = [...(ort.vorne || []), ...aufruf(programm, modell, system, ausgabe)];
      const eingabe = programm === 'codex' ? `${system}\n\n${text}` : text;
      let r;
      try {
        r = await laufen(ort.befehl, args, { eingabe, cwd: tmp, env: cliUmgebung(env), zeitMs, grenze: 262144 });
      } catch {
        protokoll('error', 'warning', `Abo-Programm ${programm} startet nicht`, { maskiert: zaehler, dauer_ms: Date.now() - start, status: 'start' });
        throw new Fehler(503, 'Das Programm liess sich nicht starten. Such in der Modellwahl neu oder wähl ein anderes Modell.');
      }
      if (r.zeitum) {
        protokoll('error', 'warning', `Abo-Programm ${programm}: Zeit abgelaufen`, { maskiert: zaehler, bytes_hin: Buffer.byteLength(nutzlast), dauer_ms: Date.now() - start, status: 'zeit' });
        throw cliFehler(programm, 'zeit');
      }
      let letzte = '';
      if (programm === 'codex') {
        try { if (statSync(ausgabe).size <= 262144) letzte = readFileSync(ausgabe, 'utf8'); } catch { letzte = ''; }
      }
      const e = programm === 'claude' ? claudeAuswerten(r) : codexAuswerten(r, letzte);
      const ersetzt = Object.values(zaehler).reduce((a, b) => a + b, 0);
      const meta = { maskiert: zaehler, bytes_hin: Buffer.byteLength(nutzlast), bytes_zurueck: Buffer.byteLength(r.aus) + Buffer.byteLength(letzte), dauer_ms: Date.now() - start };
      if (e.art) {
        protokoll('error', 'warning', `Abo-Programm ${programm}: ${e.art}`, { ...meta, status: e.art });
        throw cliFehler(programm, e.art);
      }
      protokoll('success', zaehler.geheim || zaehler.muster ? 'warning' : 'info', `Modellanfrage über ${programm}` + (ersetzt ? ` — ${ersetzt} Ersetzung(en)` : ''), { ...meta, status: 'ok' });
      return { antwort: jsonAusText(e.text), modell: wahl };
    } finally {
      BESETZT.delete(programm);
      if (tmp) { try { rmSync(tmp, { recursive: true, force: true }); } catch { /* bleibt im Temp-Ordner */ } }
    }
  };
}
