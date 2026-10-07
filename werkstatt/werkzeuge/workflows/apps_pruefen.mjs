#!/usr/bin/env node
/**
 * Prüfungen für „Meine Apps“ (Masterplan Workflow-Modalseite, Phase A und F2, Checkliste 9.8).
 *
 *   node werkzeuge/workflows/apps_pruefen.mjs
 *
 * Alles in einem Temp-Ordner; die echten eigenen Apps bleiben unberührt.
 * Unter Windows läuft zusätzlich ein echter DPAPI-Durchgang.
 */

import { createServer } from 'node:http';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ablageOeffnen, workflowPruefen } from '../../pakete/dsh-plugin-workflows/apps/ablage.mjs';
import { dpapi, tresorOeffnen } from '../../pakete/dsh-plugin-workflows/apps/tresor.mjs';
import { abbildLesen, ausfuehren } from '../../pakete/dsh-plugin-workflows/apps/laeufer.mjs';
import { appsHandler } from '../../pakete/dsh-plugin-workflows/apps/routen.mjs';
import { VORLAGEN } from '../../pakete/dsh-plugin-workflows/apps/vorlagen.mjs';

let ok = 0, schlecht = 0;
const pruefe = (name, bedingung, mehr = '') => {
  if (bedingung) { ok++; console.log(`  ✓ ${name}`); } else { schlecht++; console.log(`  ✕ ${name}${mehr ? ' — ' + mehr : ''}`); }
};
const wirft = (fn) => { try { fn(); return false; } catch { return true; } };

const wurzel = mkdtempSync(join(tmpdir(), 'apps-pruefen-'));
const werkstatt = join(wurzel, '_werkstatt');
const schutz = { schuetzen: (b) => Buffer.from(b).reverse(), oeffnen: (b) => Buffer.from(b).reverse() };
const konto = 'l42';
const demo = join(werkstatt, 'secondbrain', konto, '50_Import');
mkdirSync(demo, { recursive: true });
for (const n of ['a.pdf', 'b.md', 'c.pdf']) writeFileSync(join(demo, n), 'GEHEIMER-INHALT-' + n);

try {
  console.log('Ablage und Schema');
  const ablage = ablageOeffnen(wurzel, konto);
  pruefe('Konto-Muster weist Pfadangriffe ab', wirft(() => ablageOeffnen(wurzel, '..\\x')));
  pruefe('App-Kennung weist Pfadangriffe ab', wirft(() => ablage.lesen('../x')));
  pruefe('Schema verlangt Schritte', wirft(() => workflowPruefen({ schema: 1, id: 'abc', name: 'x', schritte: [] })));
  pruefe('Unbekannte Kategorie wird abgewiesen', wirft(() => workflowPruefen({ schema: 1, id: 'abc', name: 'x', kategorie: 'boese', schritte: [{ baustein: 'ziel/anzeige' }] })));
  for (const v of VORLAGEN) {
    const app = structuredClone(v.app);
    for (const s of app.schritte) if (s.baustein === 'quelle/ordner') s.einstellungen.ordner = 'import';
    ablage.schreiben({ schema: 1, ...app });
  }
  pruefe('Vorlagen angelegt', ablage.liste().length === VORLAGEN.length);

  console.log('Tresor');
  const tresor = tresorOeffnen(wurzel, konto, schutz);
  tresor.setzen('mail-test', 'PASSWORT-123');
  const roh = readFileSync(join(wurzel, konto, '.tresor'), 'utf8');
  pruefe('Wert steht nicht im Klartext auf der Platte', !roh.includes('PASSWORT-123'));
  pruefe('Wert kommt zurück', tresor.lesen('mail-test') === 'PASSWORT-123');
  pruefe('gesetzt() ohne Wert', tresor.gesetzt('mail-test') === true && tresor.gesetzt('fehlt-x') === false);
  const kiste = JSON.parse(roh)['mail-test'];
  const anderer = JSON.parse(roh); anderer['anders-x'] = kiste;
  writeFileSync(join(wurzel, konto, '.tresor'), JSON.stringify(anderer));
  pruefe('Vertauschte Einträge fallen auf (AAD)', wirft(() => tresor.lesen('anders-x')));
  pruefe('Ungültiger Name wird abgewiesen', wirft(() => tresor.setzen('../x', 'y')));
  if (process.platform === 'win32') {
    const probe = Buffer.from('dpapi-probe');
    const geschuetzt = dpapi('schuetzen', probe);
    pruefe('DPAPI: geschützt ist nicht gleich offen', !geschuetzt.equals(probe));
    pruefe('DPAPI: Hin und zurück', dpapi('oeffnen', geschuetzt).equals(probe));
  }

  console.log('Läufer');
  const audits = [];
  const p1 = await ausfuehren({ ablage, tresor, id: 'downloads-ueberblick', werkstatt, audit: (e) => audits.push(e) });
  pruefe('Lauf erfolgreich', p1.status === 'ok', JSON.stringify(p1.fehler));
  pruefe('Kennzahlen im Protokoll', p1.schritte[0].kennzahlen.gefunden === 3);
  const lauf = JSON.parse(readFileSync(join(ablage.appDir('downloads-ueberblick'), 'laeufe', `${p1.stempel}.json`), 'utf8'));
  pruefe('Protokoll ohne Inhalte', !JSON.stringify(lauf).includes('a.pdf') && !JSON.stringify(lauf).includes('GEHEIMER'));
  const abbildRoh = readFileSync(ablage.abbildPfad('downloads-ueberblick', p1.stempel), 'utf8');
  pruefe('Abbild verschlüsselt', !abbildRoh.includes('a.pdf'));
  const abbild = abbildLesen({ ablage, tresor, id: 'downloads-ueberblick', stempel: p1.stempel });
  pruefe('Abbild lesbar mit Schlüssel', abbild && abbild.zeilen.length === 3);
  pruefe('Audit-Zeile ohne Inhalte', audits.length === 1 && !JSON.stringify(audits).includes('a.pdf') && audits[0].metadata.app === 'downloads-ueberblick');
  pruefe('Abbild-Inhalt nie im Audit', !JSON.stringify(audits).includes('GEHEIMER'));

  // Sperre: ein zweiter Lauf während des ersten wird abgewiesen.
  writeFileSync(join(ablage.appDir('lernkarte'), '.lauf.sperre'), '1');
  let abgewiesen = false;
  try { await ausfuehren({ ablage, tresor, id: 'lernkarte', werkstatt }); } catch (f) { abgewiesen = f.status === 409; }
  pruefe('Doppelstart wird abgewiesen', abgewiesen);
  rmSync(join(ablage.appDir('lernkarte'), '.lauf.sperre'));

  // Hochwasser: nur neue Dateien, Probelauf schreibt keine Marke.
  const pdf = await ausfuehren({ ablage, tresor, id: 'pdf-sammler', werkstatt });
  pruefe('Filter behält nur PDFs', pdf.schritte[1].kennzahlen.behalten === 2);
  pruefe('ziel/datei schreibt Ergebnis', readdirSync(join(ablage.appDir('pdf-sammler'), 'ergebnisse')).length === 1);
  const zweiter = await ausfuehren({ ablage, tresor, id: 'pdf-sammler', werkstatt, jetzt: Date.now() + 2000 });
  pruefe('Zweiter Lauf findet nichts Neues', zweiter.schritte[0].kennzahlen.gefunden === 0);
  const probe = await ausfuehren({ ablage, tresor, id: 'pdf-sammler', ausloeser: 'probe', werkstatt, jetzt: Date.now() + 4000 });
  pruefe('Probelauf schreibt keine Datei', readdirSync(join(ablage.appDir('pdf-sammler'), 'ergebnisse')).length === 2 && probe.ausloeser === 'probe');

  const mail = await ausfuehren({ ablage, tresor, id: 'mail-tagesbriefing', werkstatt });
  pruefe('Fehlender Baustein endet als Fehler mit Wort', mail.status === 'fehler' && mail.fehler.code === 'baustein_fehlt');
  pruefe('Fehler in Folge gezählt', ablage.zustand('mail-tagesbriefing').fehlerInFolge === 1);

  // Aufbewahrung: Abbilder älter als 30 Tage verschwinden, Protokolle bleiben.
  const alt = new Date(Date.now() - 31 * 86400000);
  utimesSync(ablage.abbildPfad('downloads-ueberblick', p1.stempel), alt, alt);
  ablage.aufraeumen('downloads-ueberblick');
  pruefe('Abbild nach 30 Tagen weg', !existsSync(ablage.abbildPfad('downloads-ueberblick', p1.stempel)));
  pruefe('Protokoll bleibt', ablage.laeufe('downloads-ueberblick').length === 1);
  pruefe('Ohne Abbild: null statt Fehler', abbildLesen({ ablage, tresor, id: 'downloads-ueberblick', stempel: p1.stempel }) === null);

  console.log('Routen');
  const handler = appsHandler({ werkstatt, wurzel, konto: () => konto, schutz });
  const server = createServer((q, r) => handler(q, r));
  await new Promise((ja) => server.listen(0, '127.0.0.1', ja));
  const basis = `http://127.0.0.1:${server.address().port}/promptheus-apps`;
  const holen = (weg, o = {}) => fetch(basis + weg, { ...o, headers: { 'sec-fetch-site': 'same-origin', 'content-type': 'application/json', ...(o.headers || {}) } });
  pruefe('Seite wird ausgeliefert, mit CSP', (await fetch(basis + '/')).headers.get('content-security-policy')?.includes("frame-ancestors 'self'"));
  pruefe('API ohne Same-Origin: 403', (await fetch(basis + '/api/uebersicht', { headers: { 'sec-fetch-site': 'cross-site' } })).status === 403);
  const ue = await (await holen('/api/uebersicht')).json();
  pruefe('Übersicht nennt Apps und Kategorien', ue.apps.length === VORLAGEN.length && ue.kategorien.length >= 6);
  pruefe('Übersicht nennt keine Tresor-Werte', !JSON.stringify(ue).includes('PASSWORT-123'));
  pruefe('Unbekannte Datei: 404', (await fetch(basis + '/seite/..%2F..%2Fablage.mjs')).status === 404 && (await fetch(basis.replace('/promptheus-apps', '') + '/ablage.mjs')).status === 404);
  pruefe('Stempel mit Pfad: 400', (await holen('/api/lauf?id=lernkarte&stempel=..%2F..%2Fx')).status === 400);
  const r1 = await holen('/api/ausfuehren', { method: 'POST', body: JSON.stringify({ id: 'lernkarte', probe: true, aenderungen: [{ schritt: 1, name: 'anzahl', wert: 2 }] }) });
  const j1 = await r1.json();
  pruefe('Ausführen über die API (Probelauf mit Änderung)', r1.status === 200 && j1.schritte[1].kennzahlen.gezeigt === 2);
  pruefe('Nicht freigegebenes Feld wird ignoriert', (await (await holen('/api/ausfuehren', { method: 'POST', body: JSON.stringify({ id: 'lernkarte', probe: true, aenderungen: [{ schritt: 0, name: 'eintraege', wert: 'X' }] }) })).json()).schritte[0].kennzahlen.eintraege > 1);
  pruefe('Kategorie ändern', (await holen('/api/kategorie', { method: 'POST', body: JSON.stringify({ id: 'lernkarte', kategorie: 'sonstiges' }) })).status === 200 && ablage.lesen('lernkarte').kategorie === 'sonstiges');
  pruefe('Zu grosser Körper: 413', (await holen('/api/status', { method: 'POST', body: JSON.stringify({ x: 'y'.repeat(20000) }) })).status === 413);
  const laeufe = await (await holen('/api/laeufe?id=pdf-sammler&filter=fehler')).json();
  pruefe('Filter „nur Fehler“', laeufe.gesamt === 0);
  server.close();
} finally {
  rmSync(wurzel, { recursive: true, force: true });
}

console.log(`\n${ok} bestanden, ${schlecht} fehlgeschlagen`);
process.exit(schlecht ? 1 : 0);
