/**
 * Tresor der eigenen Apps (Masterplan Workflow-Modalseite, 5.4).
 *
 * Zugangsdaten (Mail-Passwort, Bot-Schlüssel) und die Ausgabe-Abbilder des
 * Protokolls (9.6) liegen nur verschlüsselt auf der Platte:
 *
 *   - AES-256-GCM mit Node `crypto`, je Eintrag eine eigene Nonce,
 *   - der Eintragsname als AAD, damit sich Einträge nicht vertauschen lassen,
 *   - der Schlüssel einmal je Installation zufällig erzeugt und mit
 *     Windows-DPAPI (Bereich CurrentUser) geschützt abgelegt.
 *
 * Warum ein eigener Tresor: Der Credentials-Store des Harness ist
 * unverschlüsselt und gilt für alle Konten einer Installation.
 *
 * Die DPAPI erreicht Node nur über PowerShell. Der Befehl ist fest; die Daten
 * gehen als Base64 über stdin, nie über die Kommandozeile.
 *
 * @module @promptheus/dsh-plugin-workflows/apps/tresor
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

/** Der feste PowerShell-Befehl für DPAPI. `$args` gibt es nicht: Richtung und Daten kommen über stdin. */
const DPAPI_SKRIPT = [
  '$ErrorActionPreference = "Stop"',
  'Add-Type -AssemblyName System.Security',
  '$zeilen = [Console]::In.ReadToEnd().Split("`n")',
  '$richtung = $zeilen[0].Trim()',
  '$daten = [Convert]::FromBase64String($zeilen[1].Trim())',
  '$bereich = [Security.Cryptography.DataProtectionScope]::CurrentUser',
  // Ein einziger Ausdruck: Mit „; “ dazwischen zerfiele if/elseif/else.
  'if ($richtung -eq "schuetzen") { $aus = [Security.Cryptography.ProtectedData]::Protect($daten, $null, $bereich) } ' +
    'elseif ($richtung -eq "oeffnen") { $aus = [Security.Cryptography.ProtectedData]::Unprotect($daten, $null, $bereich) } ' +
    'else { throw "Richtung unbekannt" }',
  '[Console]::Out.Write([Convert]::ToBase64String($aus))',
].join('; ');

/**
 * DPAPI über PowerShell.
 * @param richtung - 'schuetzen' oder 'oeffnen'.
 * @param daten - die Bytes.
 * @returns die geschützten bzw. wieder geöffneten Bytes.
 */
export function dpapi(richtung, daten) {
  if (process.platform !== 'win32') throw new Error('Tresor: DPAPI gibt es nur unter Windows');
  const aus = execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', DPAPI_SKRIPT], {
    input: `${richtung}\n${Buffer.from(daten).toString('base64')}\n`,
    encoding: 'utf8',
    windowsHide: true,
    timeout: 20000,
  });
  return Buffer.from(aus.trim(), 'base64');
}

/** Atomar schreiben: erst neben das Ziel, dann umbenennen. */
function atomar(pfad, inhalt) {
  mkdirSync(dirname(pfad), { recursive: true });
  const tmp = `${pfad}.${process.pid}.${randomBytes(4).toString('hex')}.tmp`;
  writeFileSync(tmp, inhalt);
  renameSync(tmp, pfad);
}

/**
 * Der Schlüssel der Installation. Liegt DPAPI-geschützt in `<wurzel>\.schluessel`.
 * @param wurzel - der Ordner `eigene_workflows`.
 * @param schutz - DPAPI-Ersatz für Prüfskripte ({ schuetzen, oeffnen }).
 * @returns 32 Bytes.
 */
const SCHLUESSEL = new Map();
export function schluesselHolen(wurzel, schutz = null) {
  const pfad = join(wurzel, '.schluessel');
  // Im Speicher nur, solange die Datei derselbe ist: DPAPI kostet einen PowerShell-Start.
  const merk = SCHLUESSEL.get(pfad);
  if (merk && !schutz && existsSync(pfad) && merk.mtime === statSync(pfad).mtimeMs) return merk.k;
  const k = schluesselLaden(pfad, schutz);
  if (!schutz) SCHLUESSEL.set(pfad, { k, mtime: statSync(pfad).mtimeMs });
  return k;
}
function schluesselLaden(pfad, schutz) {
  const schuetzen = schutz ? schutz.schuetzen : (b) => dpapi('schuetzen', b);
  const oeffnen = schutz ? schutz.oeffnen : (b) => dpapi('oeffnen', b);
  if (existsSync(pfad)) {
    const k = oeffnen(readFileSync(pfad));
    if (k.length !== 32) throw new Error('Tresor: Schlüssel beschädigt');
    return k;
  }
  const k = randomBytes(32);
  atomar(pfad, schuetzen(k));
  return k;
}

/**
 * Verschlüsselt einen Text mit dem Namen als AAD.
 * @returns { v, iv, tag, daten } als Base64.
 */
export function verschluesseln(schluessel, name, klartext) {
  const iv = randomBytes(12);
  const c = createCipheriv('aes-256-gcm', schluessel, iv);
  c.setAAD(Buffer.from(String(name), 'utf8'));
  const daten = Buffer.concat([c.update(String(klartext), 'utf8'), c.final()]);
  return { v: 1, iv: iv.toString('base64'), tag: c.getAuthTag().toString('base64'), daten: daten.toString('base64') };
}

/** Gegenstück zu `verschluesseln`. Wirft bei falschem Namen oder veränderten Daten. */
export function entschluesseln(schluessel, name, kiste) {
  if (!kiste || kiste.v !== 1) throw new Error('Tresor: unbekanntes Format');
  const d = createDecipheriv('aes-256-gcm', schluessel, Buffer.from(kiste.iv, 'base64'));
  d.setAAD(Buffer.from(String(name), 'utf8'));
  d.setAuthTag(Buffer.from(kiste.tag, 'base64'));
  return Buffer.concat([d.update(Buffer.from(kiste.daten, 'base64')), d.final()]).toString('utf8');
}

/** Erlaubte Eintragsnamen: kurz, ohne Pfadzeichen. */
const NAME_RE = /^[a-z0-9][a-z0-9-]{1,40}$/;

/**
 * Der Tresor eines Kontos: `<wurzel>\<konto>\.tresor`.
 * Nach aussen gibt es nur `gesetzt`, nie den Wert; `lesen` ist für den Läufer.
 */
export function tresorOeffnen(wurzel, konto, schutz = null) {
  const pfad = join(wurzel, konto, '.tresor');
  let schluessel = null;
  const k = () => (schluessel ??= schluesselHolen(wurzel, schutz));
  const alle = () => (existsSync(pfad) ? JSON.parse(readFileSync(pfad, 'utf8')) : {});
  const pruefen = (name) => { if (!NAME_RE.test(String(name))) throw new Error('Tresor: ungültiger Name'); };
  return {
    gesetzt(name) { pruefen(name); return Object.hasOwn(alle(), name); },
    namen() { return Object.keys(alle()); },
    setzen(name, wert) {
      pruefen(name);
      const a = alle();
      a[name] = verschluesseln(k(), `${konto}/${name}`, wert);
      atomar(pfad, JSON.stringify(a, null, 2));
    },
    lesen(name) {
      pruefen(name);
      const a = alle();
      return Object.hasOwn(a, name) ? entschluesseln(k(), `${konto}/${name}`, a[name]) : null;
    },
    loeschen(name) {
      pruefen(name);
      const a = alle();
      if (!Object.hasOwn(a, name)) return false;
      delete a[name];
      atomar(pfad, JSON.stringify(a, null, 2));
      return true;
    },
    /** Für die Ausgabe-Abbilder: verschlüsseln mit fremder Kennung als AAD. */
    kiste(kennung, text) { return verschluesseln(k(), kennung, text); },
    auspacken(kennung, kiste) { return entschluesseln(k(), kennung, kiste); },
  };
}
