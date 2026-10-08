/**
 * Der Läufer der eigenen Apps (Masterplan Workflow-Modalseite, Kapitel 8 und 9.6).
 *
 * Ein Lauf:
 *   1. Sperre `<app>\.lauf.sperre` exklusiv anlegen — ein zweiter Lauf derselben
 *      App wird abgewiesen (eine Sperre älter als 15 Minuten gilt als verwaist).
 *   2. Schritte der Reihe nach, jeder mit Zeitlimit.
 *   3. Protokoll `laeufe\<stempel>.json`: Auslöser, Schritte mit Dauer, Status
 *      und Kennzahlen — ohne Inhalte.
 *   4. Ausgabe-Abbild `laeufe\<stempel>.ausgabe.enc` — nur die Ausgabe,
 *      verschlüsselt mit dem Tresor-Schlüssel, 30 Tage.
 *   5. Zustand fortschreiben (Hochwassermarken erst nach Erfolg), Audit-Zeile.
 *
 * Ein Probelauf schreibt Protokoll und Abbild, aber keine Hochwassermarke und
 * keine Datei ausserhalb des Protokolls.
 *
 * @module @promptheus/dsh-plugin-workflows/apps/laeufer
 */

import { closeSync, existsSync, openSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { AUSLOESER, Fehler, atomar, stempel as stempelBilden } from './ablage.mjs';
import { baustein, folgt } from './bausteine/index.mjs';

const SPERRE_VERWAIST_MS = 15 * 60 * 1000;
const SCHRITT_LIMIT_MS = 60 * 1000;

/** Fehlercodes in Worten (9.6: Status immer als Wort). */
export const FEHLER_WORTE = {
  baustein_fehlt: 'Baustein folgt in einer späteren Phase',
  zeitlimit: 'Zeitlimit überschritten',
  schritt: 'Schritt fehlgeschlagen',
  laeuft_schon: 'Läuft schon',
};

function sperren(appDir) {
  const pfad = join(appDir, '.lauf.sperre');
  if (existsSync(pfad) && Date.now() - statSync(pfad).mtimeMs > SPERRE_VERWAIST_MS) rmSync(pfad, { force: true });
  try {
    const fd = openSync(pfad, 'wx');
    writeFileSync(fd, String(process.pid));
    closeSync(fd);
  } catch (f) {
    if (f.code === 'EEXIST') throw new Fehler(409, FEHLER_WORTE.laeuft_schon);
    throw f;
  }
  return () => rmSync(pfad, { force: true });
}

function mitLimit(versprechen, ms) {
  let t;
  return Promise.race([
    versprechen,
    new Promise((_, nein) => { t = setTimeout(() => nein(Object.assign(new Error('zeitlimit'), { code: 'zeitlimit' })), ms); }),
  ]).finally(() => clearTimeout(t));
}

/** Kennzahlen in Worten. */
const KENNZAHL_WORT = { gefunden: 'gefunden', behalten: 'behalten', verworfen: 'verworfen', zeilen: 'Zeilen', eintraege: 'Einträge', gezeigt: 'gezeigt', zeichen: 'Zeichen' };

/** Kurzer Ergebnissatz aus den Kennzahlen, für die Protokollspalte „Ergebnis“. */
function ergebnisSatz(schritte, ausgabe) {
  const erst = schritte[0]?.kennzahlen || {};
  const vorne = Object.entries(erst)[0];
  const hinten = ausgabe ? (ausgabe.art === 'tabelle' ? `Tabelle mit ${ausgabe.zeilen.length} Zeilen`
    : ausgabe.art === 'karte' ? `${(ausgabe.punkte || []).length} Einträge` : 'Text') : 'keine Ausgabe';
  return vorne ? `${vorne[1]} ${KENNZAHL_WORT[vorne[0]] || vorne[0]} → ${hinten}` : hinten;
}

/**
 * Führt eine App aus.
 * @param o.ablage - aus ablageOeffnen.
 * @param o.tresor - aus tresorOeffnen.
 * @param o.id - App-Kennung.
 * @param o.ausloeser - hand | zeitplan | nachgeholt | start | probe.
 * @param o.aenderungen - [{ schritt, name, wert }] aus der Bedienfläche (nur dieser Lauf).
 * @param o.werkstatt - der Werkstatt-Ordner (für feste Ordner der Bausteine).
 * @param o.audit - Funktion (eintrag) → void, schreibt die Audit-Zeile.
 * @returns das Protokoll des Laufs.
 */
export async function ausfuehren({ ablage, tresor, id, ausloeser = 'hand', aenderungen = [], werkstatt = '', audit = null, jetzt = Date.now() }) {
  if (!AUSLOESER.includes(ausloeser)) throw new Fehler(400, 'Unbekannter Auslöser');
  const app = ablage.lesen(id);
  const appDir = ablage.appDir(id);
  const probe = ausloeser === 'probe';
  const loesen = sperren(appDir);
  const zustand = ablage.zustand(id);
  const zustandNeu = { ...(zustand.schritte || {}) };
  let st = stempelBilden(new Date(jetzt));
  for (let n = 1; existsSync(join(appDir, 'laeufe', `${st}.json`)); n++) st = `${stempelBilden(new Date(jetzt))}-${n}`;

  // `jetzt` ist die Uhr des Laufs (Prüfungen und Vorschau setzen sie zurück); gemessen wird echt.
  const start = Date.now();
  const versatz = jetzt - start;
  const iso = (ms) => new Date(ms + versatz).toISOString();
  const protokoll = { schema: 1, id, name: app.name, start: iso(start), ausloeser, status: 'ok', schritte: [] };
  let daten = {};
  let ausgabe = null;
  try {
    for (let i = 0; i < app.schritte.length; i++) {
      const s = app.schritte[i];
      const b = baustein(s.baustein);
      const eintrag = { baustein: s.baustein, titel: b ? b.titel : (folgt(s.baustein)?.titel || s.baustein), start: iso(Date.now()), status: 'ok', kennzahlen: {} };
      protokoll.schritte.push(eintrag);
      const t0 = Date.now();
      if (!b) {
        eintrag.status = 'fehler';
        eintrag.fehler = 'baustein_fehlt';
        throw Object.assign(new Error('baustein_fehlt'), { code: 'baustein_fehlt' });
      }
      const einst = { ...s.einstellungen };
      for (const a of aenderungen) if (a.schritt === i && b.felder.some((f) => f.name === a.name && f.beimStart)) einst[a.name] = a.wert;
      const schrittZustand = { ...(zustand.schritte?.[i] || {}) };
      const kontext = { einst, zustand: schrittZustand, zustandNeu: schrittZustand, konto: ablage.konto, werkstatt, appDir, stempel: st, probe, jetzt, tresor };
      try {
        const r = await mitLimit(b.ausfuehren(daten, kontext), SCHRITT_LIMIT_MS);
        daten = r.daten ?? daten;
        eintrag.kennzahlen = r.kennzahlen || {};
        if (r.ausgabe) ausgabe = r.ausgabe;
        if (r.modell) Object.assign(eintrag, { modell: r.modell, tokensEin: r.tokensEin, tokensAus: r.tokensAus, kosten: r.kosten });
        zustandNeu[i] = schrittZustand;
      } catch (f) {
        eintrag.status = 'fehler';
        eintrag.fehler = f.code === 'zeitlimit' ? 'zeitlimit' : 'schritt';
        eintrag.meldung = String(f.message || '').slice(0, 200);
        throw f;
      } finally {
        eintrag.dauerMs = Date.now() - t0;
      }
    }
  } catch (f) {
    protokoll.status = 'fehler';
    const code = f.code && FEHLER_WORTE[f.code] ? f.code : 'schritt';
    protokoll.fehler = { code, text: FEHLER_WORTE[code] };
  } finally {
    protokoll.dauerMs = Date.now() - start;
    protokoll.ende = iso(Date.now());
    protokoll.ergebnis = protokoll.status === 'ok' ? ergebnisSatz(protokoll.schritte, ausgabe) : protokoll.fehler?.text;
    const kosten = protokoll.schritte.reduce((s, x) => s + (Number(x.kosten) || 0), 0);
    if (kosten) protokoll.kosten = kosten;
    try {
      atomar(join(appDir, 'laeufe', `${st}.json`), JSON.stringify(protokoll, null, 2));
      if (ausgabe && app.abbild) {
        const kiste = tresor.kiste(`abbild/${ablage.konto}/${id}/${st}`, JSON.stringify(ausgabe));
        atomar(ablage.abbildPfad(id, st), JSON.stringify(kiste));
      }
      const fehlerInFolge = protokoll.status === 'ok' ? 0 : (Number(zustand.fehlerInFolge) || 0) + 1;
      ablage.zustandSetzen(id, {
        ...zustand,
        schritte: probe || protokoll.status !== 'ok' ? zustand.schritte || {} : zustandNeu,
        letzterLauf: protokoll.start,
        letzterStatus: protokoll.status,
        letzterStempel: st,
        fehlerInFolge: probe ? zustand.fehlerInFolge || 0 : fehlerInFolge,
      });
      ablage.aufraeumen(id, jetzt);
      if (audit) {
        audit({
          action_type: probe ? 'workflow_probelauf' : 'workflow_lauf',
          action_description: `App ${id}: ${protokoll.status === 'ok' ? 'erfolgreich' : protokoll.fehler?.text}`,
          resource: `eigene_workflows/${ablage.konto}/${id}`,
          outcome: protokoll.status === 'ok' ? 'success' : 'error',
          actor_type: ausloeser === 'hand' || probe ? 'user' : 'system',
          actor_id: ablage.konto,
          metadata: { app: id, ausloeser, dauer_ms: protokoll.dauerMs, schritte: protokoll.schritte.length, stempel: st },
        });
      }
    } finally {
      loesen();
    }
  }
  return { ...protokoll, stempel: st };
}

/** Das Ausgabe-Abbild eines Laufs, entschlüsselt. `null`, wenn keines (mehr) da ist. */
export function abbildLesen({ ablage, tresor, id, stempel }) {
  const pfad = ablage.abbildPfad(id, stempel);
  if (!existsSync(pfad)) return null;
  return JSON.parse(tresor.auspacken(`abbild/${ablage.konto}/${id}/${stempel}`, JSON.parse(readFileSync(pfad, 'utf8'))));
}
