#!/usr/bin/env node
/**
 * Läufer für eine eigene App (Masterplan Workflow-Modalseite, 8.1).
 *
 *   node werkzeuge/workflows/lauf.mjs --konto l42 --id downloads-ueberblick [--ausloeser zeitplan]
 *
 * Für die Windows-Aufgabenplanung (Phase D) und zum Ausprobieren. Nimmt nur
 * Kennungen, die ihr Muster erfüllen — nie freie Zeichenketten in Pfade oder
 * Befehle. Schreibt Protokoll, Abbild und Audit-Zeile wie ein Lauf aus der
 * Werkstatt. Ende mit Code 0 bei Erfolg, 1 bei Fehler, 2 bei falschen Angaben,
 * 3, wenn die App schon läuft.
 */

import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ablageOeffnen, idPruefen, kontoPruefen } from '../../pakete/dsh-plugin-workflows/apps/ablage.mjs';
import { tresorOeffnen } from '../../pakete/dsh-plugin-workflows/apps/tresor.mjs';
import { ausfuehren } from '../../pakete/dsh-plugin-workflows/apps/laeufer.mjs';
import { spoolSchreiben } from '../schutz/spool.mjs';

const WERKSTATT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const WURZEL = join(WERKSTATT, 'eigene_workflows');
const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : undefined; };

let konto, id;
const ausloeser = arg('--ausloeser') || 'zeitplan';
try {
  konto = kontoPruefen(arg('--konto'));
  id = idPruefen(arg('--id'));
  if (!['zeitplan', 'nachgeholt', 'start', 'hand'].includes(ausloeser)) throw new Error('Auslöser unbekannt');
} catch (f) {
  console.error(`lauf: ${f.message}`);
  process.exit(2);
}

try {
  const ablage = ablageOeffnen(WURZEL, konto);
  const app = ablage.lesen(id);
  if (app.status !== 'aktiv' && ausloeser !== 'hand') {
    console.log(`lauf: ${id} ist ${app.status}, kein Lauf.`);
    process.exit(0);
  }
  const p = await ausfuehren({
    ablage, tresor: tresorOeffnen(WURZEL, konto), id, ausloeser, werkstatt: WERKSTATT,
    audit: (e) => spoolSchreiben('workflow', e),
  });
  console.log(`lauf: ${id} ${p.status === 'ok' ? '✓' : '✕'} ${p.ergebnis} (${p.dauerMs} ms)`);
  process.exit(p.status === 'ok' ? 0 : 1);
} catch (f) {
  console.error(`lauf: ${f.message}`);
  process.exit(f.status === 409 ? 3 : 1);
}
