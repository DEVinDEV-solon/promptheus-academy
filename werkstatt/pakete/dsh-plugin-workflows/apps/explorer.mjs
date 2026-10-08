/**
 * „Ablage öffnen“ und „Im Ordner zeigen“ — wie in Cinema Studio.
 *
 * Öffnet einen Ordner im Explorer oder markiert dort eine Datei. Der Pfad
 * entsteht immer auf dem Server aus geprüften Kennungen (Konto, App,
 * Stempel); von der Seite kommt nie ein Pfad. Ohne Shell.
 *
 * @module @promptheus/dsh-plugin-workflows/apps/explorer
 */

import { spawn } from 'node:child_process';
import { Fehler } from './ablage.mjs';

/** Zeigt `pfad` im Explorer; mit `markieren` wird die Datei im Ordner ausgewählt. */
export function imExplorerZeigen(pfad, markieren = false) {
  if (process.platform !== 'win32') throw new Fehler(400, '„Im Ordner zeigen“ gibt es nur unter Windows.');
  const kind = spawn('explorer.exe', [markieren ? `/select,${pfad}` : pfad], { shell: false, detached: true, stdio: 'ignore' });
  kind.on('error', () => { /* Der Pfad steht trotzdem auf der Seite */ });
  kind.unref();
}
