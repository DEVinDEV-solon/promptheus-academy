/**
 * Routen von „Meine Apps“ (Masterplan Workflow-Modalseite, 9.4–9.7).
 *
 * Eine Präfix-Route `/promptheus-apps` am Webserver der Werkstatt:
 *   /promptheus-apps/                 die Seite (im Werkstatt-Fenster als Rahmen)
 *   /promptheus-apps/werkbank         die Workflow-Werkbank (Phase B, Plan 4 und 4.6)
 *   /promptheus-apps/seite/<datei>    Skripte und Stile (feste Liste)
 *   /promptheus-apps/api/...          JSON
 *   /promptheus-apps/api/ki           „KI fragen“ (Plan 11.2), mit dem gewählten Modell
 *   /promptheus-apps/api/modelle      Modellwahl der Werkbank (Plan 7.4)
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
import { baustein, bedienfelder, einstellungenPruefen, folgt, katalog, kategorieVorschlag, ketteBruch, streckeVollstaendig } from './bausteine/index.mjs';
import { GRUPPEN, VORLAGEN, fragenAufloesen, vorlage } from './vorlagen.mjs';
import { anfrageBauen, antwortPruefen, bremse, schutzschichtKi } from './ki.mjs';
import { CLI_MODELLE, DATENWEG, WAHL_RE, cliErkennung, istBetreiber, modelleSuchen, openrouterListe, wahlLesen, wahlName, wahlSchreiben, wahlZerlegen, werkstattModelle } from './modelle.mjs';
import { cliKi } from './cli.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
export const PFAD = '/promptheus-apps';
const STATISCH = {
  'grund.js': 'text/javascript; charset=utf-8',
  'app.js': 'text/javascript; charset=utf-8',
  'app.css': 'text/css; charset=utf-8',
  'werkbank.js': 'text/javascript; charset=utf-8',
  'werkbank.css': 'text/css; charset=utf-8',
};
/** Die HTML-Seiten unter dem Präfix. */
const SEITEN = { '': 'index.html', 'index.html': 'index.html', werkbank: 'werkbank.html' };
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

/** Ein Probelauf, der geklappt hat und nach der letzten Änderung lief. */
function probeBestanden(ablage, app) {
  const p = ablage.laeufe(app.id).find((l) => l.ausloeser === 'probe');
  return !!p && p.status === 'ok' && Date.parse(p.start) >= Date.parse(app.geaendert);
}

/** Eine freie App-Kennung aus dem Namen: Kleinbuchstaben, Ziffern, Bindestriche. */
function idAusName(ablage, name) {
  let grund = String(name).toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 34).replace(/-+$/, '');
  if (grund.length < 3) grund = `app-${grund || 'neu'}`;
  for (let n = 1; n < 1000; n++) {
    const id = n === 1 ? grund : `${grund}-${n}`;
    if (!ablage.gibtEs(id)) return id;
  }
  throw new Fehler(409, 'Keine freie Kennung');
}

/**
 * Ein Entwurf aus der Werkbank: jeder Baustein bekannt, Einstellungen gegen
 * sein Feld-Schema bereinigt, die Kette heil. Geheimnisse kommen hier nie an,
 * sie gehen in Phase C über die Tresor-Route.
 */
function entwurfBauen(k) {
  if (!Array.isArray(k.schritte) || k.schritte.length === 0 || k.schritte.length > 12) throw new Fehler(400, 'Eine App braucht 1 bis 12 Schritte');
  const schritte = k.schritte.map((s) => {
    const id = String(s?.baustein ?? '');
    if (!baustein(id) && !folgt(id)) throw new Fehler(400, `Unbekannter Baustein „${id.slice(0, 40)}“`);
    return { baustein: id, einstellungen: einstellungenPruefen(id, s.einstellungen) };
  });
  const bruch = ketteBruch(schritte);
  if (bruch) throw new Fehler(400, bruch.text);
  const erster = baustein(schritte[0].baustein) || folgt(schritte[0].baustein);
  return {
    name: String(k.name ?? '').trim().slice(0, 60),
    ziel: String(k.ziel ?? '').trim().slice(0, 300),
    icon: typeof k.icon === 'string' && /^[a-z]{2,20}$/.test(k.icon) ? k.icon : erster.icon,
    ausloeser: k.ausloeser && typeof k.ausloeser === 'object' ? { art: k.ausloeser.art, regel: k.ausloeser.regel } : { art: 'hand' },
    schritte,
  };
}

/**
 * Baut den Handler.
 * @param o.werkstatt - der Werkstatt-Ordner.
 * @param o.wurzel - `<werkstatt>\eigene_workflows` (für Prüfungen umlegbar).
 * @param o.konto - Funktion, die das Konto liefert (Vorgabe: kontoErmitteln).
 * @param o.schutz - DPAPI-Ersatz für Prüfungen.
 * @param o.audit - Funktion für die Audit-Zeile.
 * @param o.sameOrigin - Prüfung der Herkunft (Prüfungen können sie ersetzen).
 * @param o.ki - Funktion (Nachricht, Wahl) → { antwort, modell }; ersetzt jeden Weg (Prüfungen setzen ein Fake-Modell ein).
 * @param o.env - Umgebung (Modelle der Werkstatt, Betreiber, Programme).
 * @param o.betreiber - () → bool; nur dann gibt es die Abo-Programme (Vorgabe: Ticket der Academy).
 * @param o.erkennen - (neu) → Programme auf diesem Rechner (Vorgabe: cliErkennung).
 * @param o.orListe - () → Modelle von OpenRouter (Vorgabe: über die Schutzschicht).
 * @param o.cliFabrik - baut die Frage-Funktion eines Abo-Programms (Vorgabe: cliKi).
 */
export function appsHandler({ werkstatt, wurzel = join(werkstatt, 'eigene_workflows'), konto = () => kontoErmitteln(dirname(werkstatt)), schutz = null, audit = null, sameOrigin = (req) => String(req.headers['sec-fetch-site'] || '') === 'same-origin', ki = null, env = process.env, betreiber = () => istBetreiber(env), erkennen = null, orListe = null, cliFabrik = cliKi }) {
  const kiBremse = bremse();
  const schutzWege = new Map();
  let erkenner = erkennen;
  let orHolen = orListe;
  const programme = async (neu = false) => {
    if (!betreiber()) return [];
    if (!erkenner) erkenner = cliErkennung({ env });
    return erkenner(neu);
  };
  const orModelle = () => { if (!orHolen) orHolen = openrouterListe(); return orHolen(); };

  /** Die Wahl, die gerade gilt: ein Abo-Programm nur beim Betreiber und nur, wenn es angemeldet ist. */
  async function wirksam(gespeichert) {
    const z = wahlZerlegen(gespeichert, env);
    if (z.weg !== 'cli') return { z, gefunden: null };
    const p = (await programme()).find((x) => x.programm === z.programm);
    if (!p || !p.gefunden || !p.angemeldet) return { z: wahlZerlegen('werkstatt', env), gefunden: null, zurueck: gespeichert };
    return { z, gefunden: p };
  }

  /** Die Frage-Funktion zur Wahl. */
  function frageWeg(w, kontoName) {
    if (ki) return (text) => ki(text, w.z);
    if (w.z.weg === 'cli') return cliFabrik({ wahl: w.z.wahl, programm: w.z.programm, ort: w.gefunden.ort, modell: w.z.modell, audit, konto: kontoName, env });
    if (!schutzWege.has(w.z.modell)) schutzWege.set(w.z.modell, schutzschichtKi({ modell: w.z.modell }));
    return schutzWege.get(w.z.modell);
  }

  /** Was die Seite über die Programme erfährt: nie ein Pfad. */
  const programmFuerSeite = (p) => ({ programm: p.programm, gefunden: !!p.gefunden, kaputt: !!p.kaputt, fassung: p.fassung || '', angemeldet: !!p.angemeldet, art: p.art || '', modelle: CLI_MODELLE[p.programm] || [] });

  async function modellStand(ablage, neu = false) {
    const werkstattListe = werkstattModelle(env);
    const cliListe = await programme(neu);
    const w = await wirksam(wahlLesen(ablage.kontoDir));
    const istB = betreiber();
    return {
      aktuell: w.z.wahl, name: wahlName(w.z.wahl, werkstattListe), weg: w.z.weg, programm: w.z.programm || null,
      datenweg: DATENWEG[w.z.weg === 'cli' ? w.z.programm : 'schutz'],
      zurueckgefallen: w.zurueck ? wahlName(w.zurueck) : null,
      werkstatt: werkstattListe,
      betreiber: istB,
      cli: istB ? cliListe.map(programmFuerSeite) : [],
    };
  }
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
    if (weg === 'katalog' && !post) {
      return {
        bausteine: katalog(),
        kategorien: KATEGORIEN,
        gruppen: GRUPPEN,
        vorlagen: VORLAGEN.map((v) => ({ vorlage: v.vorlage, titel: v.titel, text: v.text, gruppe: v.gruppe, fragen: fragenAufloesen(v), app: structuredClone(v.app) })),
        entwuerfe: ablage.liste().filter((a) => a.status === 'entwurf' && !a.ungueltig).map((a) => ({ id: a.id, name: a.name, icon: a.icon, geaendert: a.geaendert })),
      };
    }
    if (weg === 'bearbeiten' && !post) {
      const app = ablage.lesen(idPruefen(q.get('id')));
      return { app, probeOk: app.status === 'aktiv' || probeBestanden(ablage, app) };
    }
    if (weg === 'lauf' && !post) return ablage.lauf(idPruefen(q.get('id')), stempelPruefen(q.get('stempel')));
    if (weg === 'abbild' && !post) {
      const id = idPruefen(q.get('id'));
      return { abbild: abbildLesen({ ablage, tresor, id, stempel: stempelPruefen(q.get('stempel')) }) };
    }

    if (weg === 'modelle' && !post) return modellStand(ablage, q.get('neu') === '1');
    if (weg === 'modelle/openrouter' && !post) {
      return { modelle: modelleSuchen(await orModelle(), String(q.get('q') || '')) };
    }

    if (!post) throw new Fehler(404, 'Unbekannt');
    const k = await koerperLesen(req);
    if (weg === 'modelle') {
      const wahl = typeof k.modell === 'string' ? k.modell : '';
      if (!WAHL_RE.test(wahl)) throw new Fehler(400, 'Diese Modellwahl gibt es nicht');
      const z = wahlZerlegen(wahl, env);
      if (z.weg === 'cli') {
        if (!betreiber()) throw new Fehler(403, 'Programme auf diesem Rechner gibt es nur beim Betreiber');
        const p = (await programme()).find((x) => x.programm === z.programm);
        if (!p || !p.gefunden) throw new Fehler(409, 'Das Programm wurde auf diesem Rechner nicht gefunden');
        if (!p.angemeldet) throw new Fehler(409, 'Das Programm ist nicht angemeldet. Melde dich im Terminal an und such dann neu');
      } else if (wahl.startsWith('or:') && !werkstattModelle(env).some((m) => m.wahl === wahl)) {
        const liste = await orModelle();
        if (!liste.some((m) => m.wahl === wahl)) throw new Fehler(404, 'Dieses Modell gibt es bei OpenRouter nicht');
      }
      const vorher = wahlLesen(ablage.kontoDir);
      wahlSchreiben(ablage.kontoDir, wahl);
      // AI Act: Wechsel des Modells gehört in den Audit-Trail; Modell im eigenen Feld.
      audit?.({
        action_type: 'workflow_modell_gewaehlt', action_description: 'Modell der Werkbank gewählt',
        resource: `eigene_workflows/${ablage.konto}`, outcome: 'success', actor_type: 'user', actor_id: ablage.konto,
        model: z.weg === 'cli' ? wahl : z.modell, severity: 'info',
        metadata: { vorher, wahl, weg: z.weg },
      });
      return modellStand(ablage);
    }
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
    if (weg === 'speichern') {
      const neu = entwurfBauen(k);
      const alt = k.id === undefined || k.id === null ? null : ablage.lesen(idPruefen(k.id));
      const kategorie = k.kategorie === undefined ? alt?.kategorie ?? kategorieVorschlag(neu.schritte) : kategoriePruefen(k.kategorie);
      const app = ablage.schreiben({
        schema: 1,
        ...(alt || {}),
        ...neu,
        id: alt ? alt.id : idAusName(ablage, neu.name),
        kategorie,
        // Jede Änderung macht aus einer laufenden App wieder einen Entwurf: erst ein neuer Probelauf, dann ablegen.
        status: 'entwurf',
        erstellt: alt?.erstellt ?? new Date().toISOString(),
        ablage: { ...(alt?.ablage || {}), meineWorkflows: true, taskleiste: k.taskleiste === undefined ? !!alt?.ablage?.taskleiste : !!k.taskleiste },
      });
      return { app, probeOk: false };
    }
    if (weg === 'ablegen') {
      const app = ablage.lesen(idPruefen(k.id));
      const spaeter = app.schritte.find((s) => !baustein(s.baustein));
      if (spaeter) throw new Fehler(409, `„${folgt(spaeter.baustein)?.titel || spaeter.baustein}“ kommt erst in Phase ${folgt(spaeter.baustein)?.phase || '?'}`);
      if (!streckeVollstaendig(app.schritte)) throw new Fehler(409, 'Die Strecke braucht vorne eine Quelle und hinten ein Ziel');
      if (!probeBestanden(ablage, app)) throw new Fehler(409, 'Erst ein Probelauf, der klappt, dann ablegen');
      if (k.kategorie !== undefined) app.kategorie = kategoriePruefen(k.kategorie);
      app.status = 'aktiv';
      app.ablage = { ...app.ablage, meineWorkflows: true, taskleiste: !!k.taskleiste };
      const fertig = ablage.schreiben(app);
      if (audit) {
        audit({
          action_type: 'workflow_abgelegt',
          action_description: `App ${fertig.id} abgelegt`,
          resource: `eigene_workflows/${ablage.konto}/${fertig.id}`,
          outcome: 'success', actor_type: 'user', actor_id: ablage.konto,
          metadata: { app: fertig.id, schritte: fertig.schritte.length, taskleiste: fertig.ablage.taskleiste },
        });
      }
      return { app: fertig };
    }
    if (weg === 'ki') {
      const anfrage = anfrageBauen(k);
      kiBremse();
      const kiFn = frageWeg(await wirksam(wahlLesen(ablage.kontoDir)), ablage.konto);
      // AI Act: Modell im eigenen Feld, damit der Audit-Trail je Modell filterbar ist; nie ein Inhalt.
      const protokoll = (outcome, mehr = {}, model = '') => audit?.({
        action_type: 'workflow_ki_hilfe', action_description: `KI-Hilfe in der Werkbank (${anfrage.modus})`,
        resource: `eigene_workflows/${ablage.konto}`, outcome, actor_type: 'user', actor_id: ablage.konto, model,
        severity: outcome === 'success' ? 'info' : 'warning',
        metadata: { modus: anfrage.modus, vorlage: typeof k.vorlage === 'string' ? k.vorlage.slice(0, 40) : null, zeichen: anfrage.wunsch.length, ...mehr },
      });
      try {
        const { antwort, modell } = await kiFn(anfrage.text);
        const ergebnis = antwortPruefen(anfrage, antwort);
        protokoll('success', {}, modell);
        return { ...ergebnis, modell };
      } catch (f) {
        protokoll('error', { status: f instanceof Fehler ? f.status : 500 });
        throw f;
      }
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
      if (Object.hasOwn(SEITEN, rest)) {
        if (req.method !== 'GET') throw new Fehler(405, 'Nur GET');
        return senden(res, 200, 'text/html; charset=utf-8', readFileSync(join(HIER, 'seite', SEITEN[rest])), { 'content-security-policy': SEITEN_CSP });
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
