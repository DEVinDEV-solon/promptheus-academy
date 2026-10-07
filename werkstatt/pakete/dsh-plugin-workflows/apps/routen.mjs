/**
 * Routen von „Meine Apps“ (Masterplan Workflow-Modalseite, 9.4–9.7).
 *
 * Eine Präfix-Route `/promptheus-apps` am Webserver der Werkstatt:
 *   /promptheus-apps/                 die Seite (im Werkstatt-Fenster als Rahmen)
 *   /promptheus-apps/seite/<datei>    app.js, app.css (feste Liste)
 *   /promptheus-apps/api/...          JSON
 *
 * Sicherheit: Die Werkstatt lässt nur mit ihrem Zugangs-Cookie hinein. Hier
 * kommt dazu: jede API-Anfrage nur von derselben Herkunft
 * (`Sec-Fetch-Site: same-origin`), Änderungen nur per POST, Körper höchstens
 * 16 KB, jede Kennung gegen ihr Muster geprüft, bevor sie einen Pfad bildet.
 * Geheimnisse verlassen den Tresor nie; Antworten nennen nur „gesetzt“.
 *
 * @module @promptheus/dsh-plugin-workflows/apps/routen
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Fehler, KATEGORIEN, ablageOeffnen, idPruefen, kategoriePruefen, kontoErmitteln, stempelPruefen } from './ablage.mjs';
import { tresorOeffnen } from './tresor.mjs';
import { abbildLesen, ausfuehren } from './laeufer.mjs';
import { baustein, bedienfelder, folgt, kategorieVorschlag } from './bausteine/index.mjs';
import { VORLAGEN, vorlage } from './vorlagen.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
export const PFAD = '/promptheus-apps';
const STATISCH = {
  'app.js': 'text/javascript; charset=utf-8',
  'app.css': 'text/css; charset=utf-8',
};
const SEITEN_CSP = "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; frame-ancestors 'self'; base-uri 'none'; form-action 'none'";

function senden(res, status, typ, koerper, mehr = {}) {
  res.writeHead(status, { 'content-type': typ, 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', 'referrer-policy': 'no-referrer', ...mehr });
  res.end(koerper);
}
const json = (res, status, daten) => senden(res, status, 'application/json; charset=utf-8', JSON.stringify(daten));

function koerperLesen(req, grenze = 16384) {
  return new Promise((ja, nein) => {
    const teile = [];
    let n = 0;
    // Zu gross: weiterlesen und verwerfen, damit die Antwort 413 noch ankommt;
    // erst weit darüber wird die Verbindung gekappt.
    req.on('data', (c) => {
      n += c.length;
      if (n > grenze * 64) { req.destroy(); return; }
      if (n <= grenze) teile.push(c);
    });
    req.on('end', () => {
      if (n > grenze) return nein(new Fehler(413, 'Anfrage zu gross'));
      try { ja(teile.length ? JSON.parse(Buffer.concat(teile).toString('utf8')) : {}); } catch { nein(new Fehler(400, 'Kein gültiges JSON')); }
    });
    req.on('error', nein);
  });
}

/** Kennzahlen und Spalteninhalt einer App für die Übersicht. */
function karte(ablage, app, tresor) {
  const laeufe = ablage.laeufe(app.id).filter((l) => l.ausloeser !== 'probe');
  const z = ablage.zustand(app.id);
  const fehlt = [];
  for (const s of app.schritte) {
    if (!baustein(s.baustein)) fehlt.push(`${folgt(s.baustein)?.titel || s.baustein} folgt (Phase ${folgt(s.baustein)?.phase || '?'})`);
    if (s.geheimnis && !tresor.gesetzt(s.geheimnis)) fehlt.push('Zugang fehlt');
  }
  return {
    id: app.id, name: app.name, icon: app.icon, kategorie: app.kategorie, status: app.status, ungueltig: app.ungueltig,
    ausloeser: app.ausloeser, ziel: app.ziel,
    letzte: laeufe.slice(0, 10).map((l) => l.status === 'ok'),
    letzterLauf: laeufe[0] ? { start: laeufe[0].start, status: laeufe[0].status, ergebnis: laeufe[0].ergebnis } : null,
    fehlerInFolge: z.fehlerInFolge || 0,
    fehlt,
    zuletztBenutzt: laeufe[0]?.start || app.geaendert,
  };
}

function kennzahlen(ablage, apps, jetzt = new Date()) {
  const heute = jetzt.toISOString().slice(0, 10);
  const monat = jetzt.toISOString().slice(0, 7);
  let laeufeHeute = 0, okHeute = 0, dauer = 0, nDauer = 0, kostenMonat = 0, ausgaben = 0;
  for (const a of apps) {
    for (const l of ablage.laeufe(a.id)) {
      if (l.ausloeser === 'probe') continue;
      if (String(l.start).startsWith(monat)) kostenMonat += Number(l.kosten) || 0;
      if (!String(l.start).startsWith(heute)) continue;
      laeufeHeute++;
      if (l.status === 'ok') okHeute++;
      if (l.status === 'ok' && l.abbild) ausgaben++;
      if (Number.isFinite(l.dauerMs)) { dauer += l.dauerMs; nDauer++; }
    }
  }
  return { laeufeHeute, okHeute, dauerMittelMs: nDauer ? Math.round(dauer / nDauer) : null, kostenMonat, ausgabenHeute: ausgaben };
}

/**
 * Baut den Handler.
 * @param o.werkstatt - der Werkstatt-Ordner.
 * @param o.wurzel - `<werkstatt>\eigene_workflows` (für Prüfungen umlegbar).
 * @param o.konto - Funktion, die das Konto liefert (Vorgabe: kontoErmitteln).
 * @param o.schutz - DPAPI-Ersatz für Prüfungen.
 * @param o.audit - Funktion für die Audit-Zeile.
 * @param o.sameOrigin - Prüfung der Herkunft (Prüfungen können sie ersetzen).
 */
export function appsHandler({ werkstatt, wurzel = join(werkstatt, 'eigene_workflows'), konto = () => kontoErmitteln(dirname(werkstatt)), schutz = null, audit = null, sameOrigin = (req) => String(req.headers['sec-fetch-site'] || '') === 'same-origin' }) {
  const oeffnen = () => {
    const k = konto();
    return { ablage: ablageOeffnen(wurzel, k), tresor: tresorOeffnen(wurzel, k, schutz) };
  };

  async function api(weg, req, url) {
    const post = req.method === 'POST';
    if (!post && req.method !== 'GET') throw new Fehler(405, 'Nur GET und POST');
    if (!sameOrigin(req)) throw new Fehler(403, 'Nur aus der Werkstatt');
    const { ablage, tresor } = oeffnen();
    const q = url.searchParams;

    if (weg === 'uebersicht' && !post) {
      const apps = ablage.liste();
      const vorhanden = new Set(apps.map((a) => a.id));
      return {
        konto: ablage.konto,
        kategorien: KATEGORIEN,
        apps: apps.map((a) => karte(ablage, a, tresor)),
        kennzahlen: kennzahlen(ablage, apps),
        vorlagen: VORLAGEN.map((v) => ({ vorlage: v.vorlage, titel: v.titel, text: v.text, kategorie: v.app.kategorie, vorhanden: vorhanden.has(v.app.id) })),
      };
    }
    if (weg === 'app' && !post) {
      const app = ablage.lesen(idPruefen(q.get('id')));
      const laeufe = ablage.laeufe(app.id);
      const echt = laeufe.filter((l) => l.ausloeser !== 'probe');
      const tage30 = Date.now() - 30 * 86400000;
      const jung = echt.filter((l) => Date.parse(l.start) >= tage30);
      return {
        app: { ...app, schritte: app.schritte.map((s) => ({ baustein: s.baustein, titel: baustein(s.baustein)?.titel || folgt(s.baustein)?.titel || s.baustein, bereit: !!baustein(s.baustein), phase: folgt(s.baustein)?.phase || null, geheimnis: s.geheimnis ? { name: s.geheimnis, gesetzt: tresor.gesetzt(s.geheimnis) } : null })) },
        bedienung: bedienfelder(app),
        zustand: ablage.zustand(app.id),
        statistik: {
          laeufe: jung.length,
          erfolgreich: jung.filter((l) => l.status === 'ok').length,
          dauerMittelMs: jung.length ? Math.round(jung.reduce((s, l) => s + (l.dauerMs || 0), 0) / jung.length) : null,
          kosten: jung.reduce((s, l) => s + (Number(l.kosten) || 0), 0),
        },
        letzter: laeufe[0] ? { stempel: laeufe[0].stempel, start: laeufe[0].start, status: laeufe[0].status, abbild: laeufe[0].abbild ? abbildLesen({ ablage, tresor, id: app.id, stempel: laeufe[0].stempel }) : null } : null,
        datenschutz: 'Diese App arbeitet nur auf diesem Rechner. Nichts geht an ein Modell oder an Dritte.',
      };
    }
    if (weg === 'laeufe' && !post) {
      const id = idPruefen(q.get('id'));
      let zeilen = ablage.laeufe(id);
      const filter = q.get('filter');
      if (filter === 'fehler') zeilen = zeilen.filter((l) => l.status !== 'ok');
      if (filter === 'auto') zeilen = zeilen.filter((l) => ['zeitplan', 'nachgeholt', 'start'].includes(l.ausloeser));
      const je = 25;
      const seite = Math.max(1, Number.parseInt(q.get('seite') || '1', 10) || 1);
      return {
        gesamt: zeilen.length, seite, seiten: Math.max(1, Math.ceil(zeilen.length / je)),
        zeilen: zeilen.slice((seite - 1) * je, seite * je).map((l) => ({
          stempel: l.stempel, start: l.start, ausloeser: l.ausloeser, dauerMs: l.dauerMs, status: l.status,
          fehler: l.fehler || null, ergebnis: l.ergebnis || '', kosten: l.kosten || 0, abbild: l.abbild,
          schritte: (l.schritte || []).map((s) => s.status === 'ok'),
          modell: (l.schritte || []).find((s) => s.modell)?.modell || null,
        })),
      };
    }
    if (weg === 'lauf' && !post) return ablage.lauf(idPruefen(q.get('id')), stempelPruefen(q.get('stempel')));
    if (weg === 'abbild' && !post) {
      const id = idPruefen(q.get('id'));
      return { abbild: abbildLesen({ ablage, tresor, id, stempel: stempelPruefen(q.get('stempel')) }) };
    }

    if (!post) throw new Fehler(404, 'Unbekannt');
    const k = await koerperLesen(req);
    if (weg === 'ausfuehren') {
      const id = idPruefen(k.id);
      const aenderungen = Array.isArray(k.aenderungen) ? k.aenderungen.slice(0, 40).filter((a) => a && Number.isInteger(a.schritt) && typeof a.name === 'string' && ['string', 'number', 'boolean'].includes(typeof a.wert)).map((a) => ({ schritt: a.schritt, name: a.name.slice(0, 40), wert: typeof a.wert === 'string' ? a.wert.slice(0, 2000) : a.wert })) : [];
      const app = ablage.lesen(id);
      if (k.merken) {
        for (const a of aenderungen) if (app.schritte[a.schritt]) app.schritte[a.schritt].einstellungen[a.name] = a.wert;
        ablage.schreiben(app);
      }
      return ausfuehren({ ablage, tresor, id, ausloeser: k.probe ? 'probe' : 'hand', aenderungen, werkstatt, audit });
    }
    if (weg === 'kategorie') {
      const app = ablage.lesen(idPruefen(k.id));
      app.kategorie = kategoriePruefen(k.kategorie);
      return { app: ablage.schreiben(app) };
    }
    if (weg === 'status') {
      const app = ablage.lesen(idPruefen(k.id));
      if (!['aktiv', 'pausiert'].includes(k.status)) throw new Fehler(400, 'Status nur aktiv oder pausiert');
      app.status = k.status;
      return { app: ablage.schreiben(app) };
    }
    if (weg === 'vorlage') {
      const v = vorlage(String(k.vorlage || ''));
      if (!v) throw new Fehler(404, 'Vorlage unbekannt');
      if (ablage.gibtEs(v.app.id)) throw new Fehler(409, 'Diese App gibt es schon');
      const jetzt = new Date().toISOString();
      const app = ablage.schreiben({ schema: 1, ...structuredClone(v.app), kategorie: v.app.kategorie || kategorieVorschlag(v.app.schritte), erstellt: jetzt, ablage: { meineWorkflows: true } });
      return { app };
    }
    if (weg === 'loeschen') {
      ablage.wegwerfen(idPruefen(k.id));
      return { ok: true };
    }
    throw new Fehler(404, 'Unbekannt');
  }

  return async function handler(req, res) {
    const url = new URL(req.url || '/', 'http://werkstatt.local');
    try {
      if (url.pathname !== PFAD && !url.pathname.startsWith(`${PFAD}/`)) throw new Fehler(404, 'Unbekannt');
      const rest = url.pathname.slice(PFAD.length).replace(/^\/+/, '');
      if (rest === '' || rest === 'index.html') {
        if (req.method !== 'GET') throw new Fehler(405, 'Nur GET');
        return senden(res, 200, 'text/html; charset=utf-8', readFileSync(join(HIER, 'seite', 'index.html')), { 'content-security-policy': SEITEN_CSP });
      }
      if (rest.startsWith('seite/')) {
        const datei = rest.slice(6);
        if (!Object.hasOwn(STATISCH, datei)) throw new Fehler(404, 'Unbekannt');
        return senden(res, 200, STATISCH[datei], readFileSync(join(HIER, 'seite', datei)));
      }
      if (rest.startsWith('api/')) return json(res, 200, await api(rest.slice(4), req, url));
      throw new Fehler(404, 'Unbekannt');
    } catch (f) {
      const status = f instanceof Fehler ? f.status : 500;
      json(res, status, { fehler: status === 500 ? 'Interner Fehler' : f.message });
    }
  };
}
