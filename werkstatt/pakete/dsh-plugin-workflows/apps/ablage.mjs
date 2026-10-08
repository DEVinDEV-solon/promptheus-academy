/**
 * Ablage der eigenen Apps (Masterplan Workflow-Modalseite, Kapitel 5 und 9.4–9.6).
 *
 *   <wurzel> = <werkstatt>\eigene_workflows          (gitignored)
 *     .schluessel                                     DPAPI-geschützter Tresor-Schlüssel
 *     <konto>\
 *       .tresor                                       verschlüsselte Zugangsdaten
 *       <id>\workflow.json                            was die App tut (Schema 1)
 *       <id>\zustand.json                             letzter/nächster Lauf, Fehler in Folge
 *       <id>\laeufe\<stempel>.json                    Protokoll eines Laufs, ohne Inhalte
 *       <id>\laeufe\<stempel>.ausgabe.enc             Ausgabe-Abbild, verschlüsselt (30 Tage)
 *       _papierkorb\<id>\                             gelöschte Apps
 *
 * Alles hier ist Dateiarbeit ohne Netz. Jede Kennung aus einer Anfrage geht
 * durch `idPruefen`/`kontoPruefen`, bevor sie einen Pfad bildet.
 *
 * @module @promptheus/dsh-plugin-workflows/apps/ablage
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { dirname, join } from 'node:path';

export const SCHEMA = 1;

/** Aufbewahrung der Ausgabe-Abbilder: 30 Tage (Entscheidung 07.10.2026). */
export const ABBILD_TAGE = 30;

/** Protokolldateien bleiben länger als die Abbilder; ohne Inhalte kosten sie wenig. */
export const PROTOKOLL_TAGE = 365;

/** Die festen Kategorien (9.4). Reihenfolge = Spaltenfolge. */
export const KATEGORIEN = [
  { id: 'post', name: 'Post & Mail', text: 'Postfächer abrufen und zusammenfassen', farbe: 'glut' },
  { id: 'nachrichten', name: 'Nachrichten & Feeds', text: 'Themen und Quellen verfolgen', farbe: 'lapis' },
  { id: 'lernen', name: 'Lernen & Erinnern', text: 'Pläne, Wiederholung, Erinnerungen', farbe: 'gold' },
  { id: 'dateien', name: 'Dateien & Ordner', text: 'Ordner ordnen, Secondbrain füllen', farbe: 'gut' },
  { id: 'beobachten', name: 'Beobachten', text: 'Webseiten und Stände im Blick', farbe: 'warn' },
  { id: 'sonstiges', name: 'Sonstiges', text: 'Alles andere', farbe: 'grau' },
];

export const STATUS = ['entwurf', 'aktiv', 'pausiert', 'fehler'];
export const AUSLOESER = ['hand', 'zeitplan', 'nachgeholt', 'start', 'probe'];

const ID_RE = /^[a-z0-9][a-z0-9-]{2,39}$/;
const KONTO_RE = /^(l[1-9][0-9]{0,9}|betreiber)$/;
const STEMPEL_RE = /^\d{4}-\d{2}-\d{2}_\d{6}(-\d{1,3})?$/;
const EIGENE_KAT_RE = /^k-[a-z0-9-]{3,30}$/;

export function idPruefen(id) {
  if (typeof id !== 'string' || !ID_RE.test(id)) throw new Fehler(400, 'Ungültige App-Kennung');
  return id;
}
export function kontoPruefen(konto) {
  if (typeof konto !== 'string' || !KONTO_RE.test(konto)) throw new Fehler(400, 'Ungültiges Konto');
  return konto;
}
export function stempelPruefen(s) {
  if (typeof s !== 'string' || !STEMPEL_RE.test(s)) throw new Fehler(400, 'Ungültige Lauf-Kennung');
  return s;
}
export function kategoriePruefen(k) {
  if (KATEGORIEN.some((x) => x.id === k) || (typeof k === 'string' && EIGENE_KAT_RE.test(k))) return k;
  throw new Fehler(400, 'Unbekannte Kategorie');
}

/**
 * Die Regel eines Zeitplans (8.2: nur, was die Aufgabenplanung abbilden kann):
 *   { typ: 'taeglich', uhrzeit: 'HH:MM' }
 *   { typ: 'woechentlich', tag: 0–6 (Montag = 0), uhrzeit: 'HH:MM' }
 *   { typ: 'intervall', stunden: 1–12 }
 * @returns die bereinigte Regel oder null, wenn sie nicht passt.
 */
export function regelPruefen(r) {
  if (!r || typeof r !== 'object') return null;
  const uhr = typeof r.uhrzeit === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(r.uhrzeit) ? r.uhrzeit : null;
  if (r.typ === 'taeglich') return uhr ? { typ: 'taeglich', uhrzeit: uhr } : null;
  if (r.typ === 'woechentlich') return uhr && Number.isInteger(r.tag) && r.tag >= 0 && r.tag <= 6 ? { typ: 'woechentlich', tag: r.tag, uhrzeit: uhr } : null;
  if (r.typ === 'intervall') return Number.isInteger(r.stunden) && r.stunden >= 1 && r.stunden <= 12 ? { typ: 'intervall', stunden: r.stunden } : null;
  return null;
}

/** Ein Fehler mit HTTP-Status, den die Routen weitergeben. */
export class Fehler extends Error {
  constructor(status, text) { super(text); this.status = status; }
}

/** Atomar schreiben. */
export function atomar(pfad, inhalt) {
  mkdirSync(dirname(pfad), { recursive: true });
  const tmp = `${pfad}.${process.pid}.${randomBytes(4).toString('hex')}.tmp`;
  writeFileSync(tmp, inhalt);
  renameSync(tmp, pfad);
}

function jsonLesen(pfad, ersatz = null) {
  try { return JSON.parse(readFileSync(pfad, 'utf8')); } catch { return ersatz; }
}

/**
 * Das Konto der Werkstatt: der zuletzt eingelassene Lernende aus
 * `<academy>\data\werkstatt\laeufe.jsonl` (laufMerken in starten.mjs) als `l<nummer>`,
 * sonst `betreiber` (Start mit --betreiber). Keine Namen, nur die Nummer.
 * @param academy - der Academy-Ordner (Elternordner der Werkstatt).
 */
export function kontoErmitteln(academy) {
  try {
    const zeilen = readFileSync(join(academy, 'data', 'werkstatt', 'laeufe.jsonl'), 'utf8').trim().split('\n');
    const letzte = JSON.parse(zeilen[zeilen.length - 1]);
    if (Number.isInteger(letzte.lernender) && letzte.lernender > 0) return `l${letzte.lernender}`;
  } catch {
    // keine Läufe gemerkt
  }
  return 'betreiber';
}

/**
 * Prüft eine workflow.json gegen Schema 1. Gibt die bereinigte Fassung zurück
 * oder wirft mit einem Satz, was fehlt.
 */
export function workflowPruefen(roh) {
  const w = roh && typeof roh === 'object' ? roh : null;
  if (!w) throw new Fehler(400, 'workflow.json ist kein Objekt');
  if (w.schema !== SCHEMA) throw new Fehler(400, 'Unbekannte Schema-Version');
  idPruefen(w.id);
  const name = String(w.name ?? '').trim();
  if (!name || name.length > 60) throw new Fehler(400, 'Name fehlt oder ist zu lang');
  const status = STATUS.includes(w.status) ? w.status : 'entwurf';
  const kategorie = w.kategorie === undefined ? 'sonstiges' : kategoriePruefen(w.kategorie);
  if (!Array.isArray(w.schritte) || w.schritte.length === 0 || w.schritte.length > 12) {
    throw new Fehler(400, 'Eine App braucht 1 bis 12 Schritte');
  }
  const schritte = w.schritte.map((s) => {
    if (!s || typeof s.baustein !== 'string' || !/^[a-z]+\/[a-z0-9-]{2,30}$/.test(s.baustein)) {
      throw new Fehler(400, 'Schritt ohne gültigen Baustein');
    }
    const einstellungen = s.einstellungen && typeof s.einstellungen === 'object' ? s.einstellungen : {};
    const geheimnis = typeof s.geheimnis === 'string' ? s.geheimnis : undefined;
    return geheimnis ? { baustein: s.baustein, einstellungen, geheimnis } : { baustein: s.baustein, einstellungen };
  });
  const a = w.ausloeser && typeof w.ausloeser === 'object' ? w.ausloeser : { art: 'hand' };
  return {
    schema: SCHEMA,
    id: w.id,
    name,
    icon: typeof w.icon === 'string' ? w.icon.slice(0, 20) : 'app',
    kategorie,
    ziel: String(w.ziel ?? '').slice(0, 300),
    ausloeser: { art: ['hand', 'zeitplan', 'start'].includes(a.art) ? a.art : 'hand', regel: a.art === 'zeitplan' ? regelPruefen(a.regel) : null, zeitzone: 'Europe/Berlin' },
    schritte,
    ablage: { taskleiste: !!w.ablage?.taskleiste, meineWorkflows: w.ablage?.meineWorkflows !== false, reihenfolge: Number(w.ablage?.reihenfolge) || 0 },
    status,
    abbild: w.abbild !== false,
    erstellt: String(w.erstellt ?? new Date().toISOString()),
    geaendert: String(w.geaendert ?? new Date().toISOString()),
  };
}

/** Zugriff auf die Apps eines Kontos. */
export function ablageOeffnen(wurzel, konto) {
  kontoPruefen(konto);
  const kontoDir = join(wurzel, konto);
  const appDir = (id) => join(kontoDir, idPruefen(id));

  const api = {
    wurzel,
    konto,
    kontoDir,
    appDir,
    /** Alle Apps (ungültige werden mit Fehler gemeldet statt verschwiegen). */
    liste() {
      if (!existsSync(kontoDir)) return [];
      const aus = [];
      for (const e of readdirSync(kontoDir, { withFileTypes: true })) {
        if (!e.isDirectory() || !ID_RE.test(e.name)) continue;
        const roh = jsonLesen(join(kontoDir, e.name, 'workflow.json'));
        if (!roh) continue;
        try { aus.push(workflowPruefen(roh)); } catch (f) {
          aus.push({ id: e.name, name: e.name, kategorie: 'sonstiges', status: 'fehler', ungueltig: f.message, schritte: [] });
        }
      }
      return aus;
    },
    lesen(id) {
      const roh = jsonLesen(join(appDir(id), 'workflow.json'));
      if (!roh) throw new Fehler(404, 'App nicht gefunden');
      return workflowPruefen(roh);
    },
    schreiben(w) {
      const sauber = workflowPruefen({ ...w, geaendert: new Date().toISOString() });
      atomar(join(appDir(sauber.id), 'workflow.json'), JSON.stringify(sauber, null, 2));
      return sauber;
    },
    gibtEs(id) { return existsSync(join(appDir(id), 'workflow.json')); },
    zustand(id) { return jsonLesen(join(appDir(id), 'zustand.json'), {}) || {}; },
    zustandSetzen(id, z) { atomar(join(appDir(id), 'zustand.json'), JSON.stringify(z, null, 2)); },
    /** In den Papierkorb, nicht endgültig. */
    wegwerfen(id) {
      const von = appDir(id);
      if (!existsSync(von)) throw new Fehler(404, 'App nicht gefunden');
      const nach = join(kontoDir, '_papierkorb', `${id}-${Date.now()}`);
      mkdirSync(dirname(nach), { recursive: true });
      renameSync(von, nach);
    },
    /** Protokolle einer App, neueste zuerst. */
    laeufe(id) {
      const dir = join(appDir(id), 'laeufe');
      if (!existsSync(dir)) return [];
      return readdirSync(dir)
        .filter((n) => n.endsWith('.json'))
        .map((n) => n.slice(0, -5))
        .filter((s) => STEMPEL_RE.test(s))
        .sort()
        .reverse()
        .map((s) => ({ ...jsonLesen(join(dir, `${s}.json`), {}), stempel: s, abbild: existsSync(join(dir, `${s}.ausgabe.enc`)) }));
    },
    lauf(id, stempel) {
      const p = join(appDir(id), 'laeufe', `${stempelPruefen(stempel)}.json`);
      const l = jsonLesen(p);
      if (!l) throw new Fehler(404, 'Lauf nicht gefunden');
      return { ...l, stempel, abbild: existsSync(join(appDir(id), 'laeufe', `${stempel}.ausgabe.enc`)) };
    },
    abbildPfad(id, stempel) { return join(appDir(id), 'laeufe', `${stempelPruefen(stempel)}.ausgabe.enc`); },
    /** Räumt alte Abbilder (30 Tage) und sehr alte Protokolle (365 Tage) weg. */
    aufraeumen(id, jetzt = Date.now()) {
      const dir = join(appDir(id), 'laeufe');
      if (!existsSync(dir)) return 0;
      let weg = 0;
      for (const n of readdirSync(dir)) {
        const alter = (jetzt - statSync(join(dir, n)).mtimeMs) / 86400000;
        if ((n.endsWith('.ausgabe.enc') && alter > ABBILD_TAGE) || (n.endsWith('.json') && alter > PROTOKOLL_TAGE)) {
          rmSync(join(dir, n), { force: true });
          weg++;
        }
      }
      return weg;
    },
  };
  return api;
}

/** Zeitstempel für Lauf-Dateien in Ortszeit: JJJJ-MM-TT_hhmmss. */
export function stempel(d = new Date()) {
  const z = (n, l = 2) => String(n).padStart(l, '0');
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}_${z(d.getHours())}${z(d.getMinutes())}${z(d.getSeconds())}`;
}
