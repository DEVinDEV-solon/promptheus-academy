#!/usr/bin/env node
/**
 * Vorschau von „Meine Apps“ ohne laufende Werkstatt.
 *
 *   node werkzeuge/workflows/apps_vorschau.mjs [--port 3095] [--beispiel] [--ki-beispiel]
 *
 * Startet denselben Handler wie die Werkstatt (`/promptheus-apps`) auf
 * 127.0.0.1, mit einer eigenen Ablage im Temp-Ordner — die echten eigenen Apps
 * bleiben unberührt. `--beispiel` legt die Vorlagen an und füllt das Protokoll
 * mit Läufen der letzten Tage, damit Übersicht, Tabelle und Seitenmenü etwas
 * zeigen. Der Tresor-Schlüssel ist in der Vorschau ein Prüfschlüssel, kein DPAPI.
 * `--ki-beispiel` setzt für „KI fragen“ ein Schein-Modell mit festen Antworten
 * ein; ohne den Schalter geht die Frage an die Schutzschicht auf 3089.
 */

import { createServer } from 'node:http';
import { mkdirSync, mkdtempSync, readdirSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { appsHandler, PFAD } from '../../pakete/dsh-plugin-workflows/apps/routen.mjs';
import { ablageOeffnen } from '../../pakete/dsh-plugin-workflows/apps/ablage.mjs';
import { tresorOeffnen } from '../../pakete/dsh-plugin-workflows/apps/tresor.mjs';
import { ausfuehren } from '../../pakete/dsh-plugin-workflows/apps/laeufer.mjs';
import { VORLAGEN } from '../../pakete/dsh-plugin-workflows/apps/vorlagen.mjs';

const WERKSTATT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
const port = Number(arg('--port', 3095));
const wurzel = mkdtempSync(join(tmpdir(), 'meine-apps-'));
/** Prüfschlüssel statt DPAPI: nur für die Vorschau, die Ablage ist ein Temp-Ordner. */
const schutz = { schuetzen: (b) => Buffer.from(b), oeffnen: (b) => Buffer.from(b) };
const konto = 'betreiber';

/**
 * Mit --beispiel arbeitet die Vorschau in einer Schein-Werkstatt im Temp-Ordner:
 * Die Ordner-Bausteine lesen dort einen Demo-Ordner (Secondbrain · 50_Import)
 * statt Downloads oder Dokumente, damit keine echten Dateinamen erscheinen.
 */
let werkstattFuerBausteine = WERKSTATT;
if (process.argv.includes('--beispiel')) {
  werkstattFuerBausteine = join(wurzel, '_schein-werkstatt');
  const demo = join(werkstattFuerBausteine, 'secondbrain', konto, '50_Import');
  mkdirSync(demo, { recursive: true });
  const namen = ['Lernplan Oktober.pdf', 'Prompt-Muster Rollen.md', 'Kursfolie Tokens.png', 'Notizen Kurs 7.txt', 'Quellen Recherche.pdf',
    'Mindmap Sprachmodelle.png', 'Klausur Vorbereitung.docx', 'Hörbuch Kapitel 3.mp3', 'Beispiel Datensatz.csv', 'Präsentation Feuer.pptx', 'Bildprompt Schmiede.txt', 'Zusammenfassung Woche 40.md'];
  namen.forEach((n, i) => {
    const p = join(demo, n);
    writeFileSync(p, 'x'.repeat(200 + i * 3071));
    const t = new Date(Date.now() - i * 7 * 3600000);
    utimesSync(p, t, t);
  });
  const ablage = ablageOeffnen(wurzel, konto);
  const tresor = tresorOeffnen(wurzel, konto, schutz);
  for (const v of VORLAGEN.filter((x) => ['downloads-ueberblick', 'pdf-sammler', 'lernkarte', 'mail-tagesbriefing'].includes(x.vorlage))) {
    const app = structuredClone(v.app);
    for (const s of app.schritte) if (s.baustein === 'quelle/ordner') s.einstellungen.ordner = 'import';
    ablage.schreiben({ schema: 1, ...app, erstellt: new Date(Date.now() - 9 * 86400000).toISOString() });
  }
  const tag = 86400000;
  for (const [id, n] of [['downloads-ueberblick', 9], ['lernkarte', 6], ['pdf-sammler', 3]]) {
    for (let i = n; i >= 0; i--) {
      const jetzt = Date.now() - i * tag + (i % 3) * 3600000;
      await ausfuehren({ ablage, tresor, id, ausloeser: i % 2 ? 'zeitplan' : 'hand', werkstatt: werkstattFuerBausteine, jetzt });
    }
  }
  await ausfuehren({ ablage, tresor, id: 'mail-tagesbriefing', ausloeser: 'hand', werkstatt: werkstattFuerBausteine });
  // Protokoll-Dateien auf ihr Laufdatum zurückdatieren, damit die Aufbewahrung (30 Tage) stimmt.
  for (const id of ['downloads-ueberblick', 'lernkarte', 'pdf-sammler']) {
    const dir = join(ablage.appDir(id), 'laeufe');
    for (const n of readdirSync(dir)) {
      const m = n.match(/^(\d{4})-(\d{2})-(\d{2})_(\d{2})(\d{2})(\d{2})/);
      if (m) { const t = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]); utimesSync(join(dir, n), t, t); }
    }
  }
}

/** Schein-Modell für die Vorschau: denkt nicht, antwortet fest, damit die Oberfläche etwas zeigt. */
async function kiBeispiel(text) {
  await new Promise((r) => setTimeout(r, 700));
  if (text.includes('"treffer"')) {
    return { modell: 'beispiel', antwort: { treffer: [
      { vorlage: 'ki-news', warum: 'Holt täglich KI-Nachrichten und schickt sie zur Wunschzeit an Telegram; Uhrzeit und Gruppen-Thema stellst du im Fragebogen ein.' },
      { vorlage: 'themen-woche', warum: 'Wenn dir einmal pro Woche reicht: dieselben Quellen als Rückblick in einer Datei.' },
    ], hinweis: 'Beide Vorlagen brauchen Bausteine aus Phase C und G; du kannst sie schon einrichten.' } };
  }
  if (text.includes('"rueckfragen"')) {
    const ebay = text.includes('eBay');
    return { modell: 'beispiel', antwort: ebay ? {
      rueckfragen: [
        { frage: 'Wofür brauchst du das Gerät vor allem?', optionen: ['Alltag', 'Fotos', 'Spiele', 'als Zweitgerät'] },
        { frage: 'Wie wichtig ist dir der Akku?', optionen: ['sehr wichtig', 'egal, tausche ich', 'mittel'] },
        { frage: 'Welche Farbe?', optionen: ['egal', 'schwarz', 'weiss', 'blau'] },
      ],
      beachten: [
        'Akkuzustand mindestens 85 % (in den Einstellungen ablesbar)',
        'Keine iCloud-Sperre: „Mein iPhone suchen“ muss deaktiviert sein',
        'Kein Displaytausch mit Fremdteil (Meldung „Unbekanntes Teil“)',
        'Original-Rechnung oder Kaufbeleg vorhanden',
        'Netzbetreiber-Sperre (SIM-Lock) ausgeschlossen',
      ],
      hinweis: 'Bei gebrauchten Smartphones entscheiden Akku und Sperren mehr als der Preis.',
    } : {
      rueckfragen: [
        { frage: 'Für wen sind die Neuigkeiten?', optionen: ['nur für mich', 'für mein Team', 'für den Unterricht'] },
        { frage: 'Wie tief soll es gehen?', optionen: ['Überblick', 'Fachlich', 'Nur Werkzeuge'] },
      ],
      beachten: [
        'Nur Meldungen der letzten 24 Stunden, keine Wiederholungen',
        'Werbung und Gewinnspiele weglassen',
        'Je Meldung die Quelle nennen',
      ],
      hinweis: 'Ein klarer Blickwinkel macht die Auswahl besser als viele Stichworte.',
    } };
  }
  return { modell: 'beispiel', antwort: { vorschlag: text.includes('Je Zeile ein Punkt')
    ? ['Akkuzustand mindestens 85 %', 'Keine iCloud-Sperre', 'Kein Displaytausch mit Fremdteil', 'Mit Rechnung'].join('\n')
    : 'Neue KI-Werkzeuge für den Unterricht, mit Quelle, ohne Werbung' } };
}

const handler = appsHandler({ werkstatt: werkstattFuerBausteine, wurzel, konto: () => konto, schutz, ki: process.argv.includes('--ki-beispiel') ? kiBeispiel : null });
createServer((req, res) => {
  const pfad = new URL(req.url, 'http://x').pathname;
  if (pfad === '/' ) { res.writeHead(302, { location: `${PFAD}/` }); return res.end(); }
  if (pfad === PFAD || pfad.startsWith(`${PFAD}/`)) return handler(req, res);
  res.writeHead(404); res.end();
}).listen(port, '127.0.0.1', () => {
  console.log(`Meine Apps (Vorschau): http://127.0.0.1:${port}${PFAD}/`);
  console.log(`Ablage: ${wurzel}`);
});
