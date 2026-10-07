/**
 * Baustein-Katalog der eigenen Apps (Masterplan Workflow-Modalseite, Kapitel 6).
 *
 * Erste Runde ohne Netz und ohne Dritte: Ordner lesen, filtern, als Tabelle
 * zeigen, Lernkarte des Tages, in eine Datei schreiben. Damit laufen die
 * ersten Apps schon, bevor Mail und Telegram (Phase C) dazukommen.
 *
 * Vertrag je Baustein (6.1):
 *   id, art, titel, icon, kurz
 *   felder       [{ name, typ, titel, werte?, vorgabe, beimStart? }]  → Formular und Bedienfläche (9.5)
 *   kennzahlen   Namen der Zahlen, die der Schritt ins Protokoll meldet (9.6)
 *   ausfuehren(eingabe, kontext) → { daten, kennzahlen, ausgabe? }
 *
 * `ausgabe` ist das, was der Lauf herausgibt: { art: 'tabelle'|'text'|'karte', titel, ... }.
 * Nur sie landet (verschlüsselt) im Abbild; Eingaben nie.
 *
 * @module @promptheus/dsh-plugin-workflows/apps/bausteine
 */

import { existsSync, readdirSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { extname, join } from 'node:path';
import { atomar } from '../ablage.mjs';

/** Die Ordner, die `quelle/ordner` lesen darf. Feste Liste, kein freier Pfad aus der Oberfläche. */
export function erlaubteOrdner(werkstatt, konto) {
  return {
    downloads: { titel: 'Downloads', pfad: join(homedir(), 'Downloads') },
    dokumente: { titel: 'Dokumente', pfad: join(homedir(), 'Documents') },
    desktop: { titel: 'Desktop', pfad: join(homedir(), 'Desktop') },
    import: { titel: 'Secondbrain · 50_Import', pfad: join(werkstatt, 'secondbrain', konto, '50_Import') },
  };
}

const groesse = (b) => (b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`);
const datum = (ms) => new Date(ms).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

const KATALOG = [
  {
    id: 'quelle/ordner', art: 'quelle', titel: 'Ordner lesen', icon: 'ordner',
    kurz: 'Liest Dateinamen, Grösse und Datum aus einem festen Ordner. Inhalte werden nicht geöffnet.',
    felder: [
      { name: 'ordner', typ: 'wahl', titel: 'Ordner', werte: ['downloads', 'dokumente', 'desktop', 'import'], vorgabe: 'downloads', beimStart: true },
      { name: 'nurNeue', typ: 'schalter', titel: 'Nur neue seit dem letzten Lauf', vorgabe: false, beimStart: true },
    ],
    kennzahlen: ['gefunden'],
    async ausfuehren(_eingabe, k) {
      const orte = erlaubteOrdner(k.werkstatt, k.konto);
      const ort = orte[k.einst.ordner] || orte.downloads;
      if (!existsSync(ort.pfad)) return { daten: { ordner: ort.titel, dateien: [] }, kennzahlen: { gefunden: 0 } };
      const seit = k.einst.nurNeue ? Number(k.zustand.hochwasser || 0) : 0;
      const dateien = [];
      for (const e of readdirSync(ort.pfad, { withFileTypes: true })) {
        if (!e.isFile() || e.name.startsWith('.')) continue;
        let st;
        try { st = statSync(join(ort.pfad, e.name)); } catch { continue; }
        if (st.mtimeMs <= seit) continue;
        dateien.push({ name: e.name, groesse: st.size, geaendert: st.mtimeMs, endung: extname(e.name).slice(1).toLowerCase() || '–' });
        if (dateien.length >= 5000) break;
      }
      dateien.sort((a, b) => b.geaendert - a.geaendert);
      k.zustandNeu.hochwasser = Math.max(seit, ...dateien.map((d) => d.geaendert), 0);
      return { daten: { ordner: ort.titel, dateien }, kennzahlen: { gefunden: dateien.length } };
    },
  },
  {
    id: 'filter/dateien', art: 'filter', titel: 'Dateien filtern', icon: 'filter',
    kurz: 'Behält nur bestimmte Endungen und höchstens so viele Dateien.',
    felder: [
      { name: 'endungen', typ: 'text', titel: 'Endungen (leer = alle)', vorgabe: '', beimStart: true },
      { name: 'hoechstens', typ: 'zahl', titel: 'Höchstens', vorgabe: 50, min: 1, max: 500, beimStart: true },
    ],
    kennzahlen: ['behalten', 'verworfen'],
    async ausfuehren(e, k) {
      const erlaubt = String(k.einst.endungen || '').toLowerCase().split(/[\s,;]+/).map((x) => x.replace(/^\./, '')).filter(Boolean);
      const max = Math.min(500, Math.max(1, Number(k.einst.hoechstens) || 50));
      const alle = e.dateien || [];
      const passend = erlaubt.length ? alle.filter((d) => erlaubt.includes(d.endung)) : alle;
      const behalten = passend.slice(0, max);
      return { daten: { ...e, dateien: behalten }, kennzahlen: { behalten: behalten.length, verworfen: alle.length - behalten.length } };
    },
  },
  {
    id: 'verarbeitung/tabelle', art: 'verarbeitung', titel: 'Als Tabelle', icon: 'tabelle',
    kurz: 'Ordnet die Dateien als Tabelle, dazu eine Zusammenfassung nach Endung.',
    felder: [{ name: 'gruppieren', typ: 'schalter', titel: 'Übersicht nach Endung', vorgabe: true, beimStart: true }],
    kennzahlen: ['zeilen'],
    async ausfuehren(e, k) {
      const dateien = e.dateien || [];
      const nachEndung = {};
      for (const d of dateien) nachEndung[d.endung] = (nachEndung[d.endung] || 0) + 1;
      const ausgabe = {
        art: 'tabelle',
        titel: `${e.ordner || 'Ordner'}: ${dateien.length} Dateien`,
        spalten: ['Datei', 'Endung', 'Grösse', 'Geändert'],
        zeilen: dateien.map((d) => [d.name, d.endung, groesse(d.groesse), datum(d.geaendert)]),
        zusatz: k.einst.gruppieren !== false
          ? Object.entries(nachEndung).sort((a, b) => b[1] - a[1]).map(([x, n]) => ({ wort: x, zahl: n }))
          : [],
      };
      return { daten: { ...e, ausgabe }, kennzahlen: { zeilen: dateien.length } };
    },
  },
  {
    id: 'quelle/liste', art: 'quelle', titel: 'Eigene Liste', icon: 'liste',
    kurz: 'Eine Liste, die du selbst pflegst, eine Zeile je Eintrag (Vokabeln, Merksätze, Aufgaben).',
    felder: [{ name: 'eintraege', typ: 'mehrzeilig', titel: 'Einträge, je Zeile einer', vorgabe: '' }],
    kennzahlen: ['eintraege'],
    async ausfuehren(_e, k) {
      const eintraege = String(k.einst.eintraege || '').split('\n').map((x) => x.trim()).filter(Boolean).slice(0, 1000);
      return { daten: { eintraege }, kennzahlen: { eintraege: eintraege.length } };
    },
  },
  {
    id: 'verarbeitung/tageskarte', art: 'verarbeitung', titel: 'Karte des Tages', icon: 'karte',
    kurz: 'Wählt je Tag reihum Einträge aus der Liste, damit über die Woche alles drankommt.',
    felder: [{ name: 'anzahl', typ: 'zahl', titel: 'Einträge je Tag', vorgabe: 3, min: 1, max: 20, beimStart: true }],
    kennzahlen: ['gezeigt'],
    async ausfuehren(e, k) {
      const liste = e.eintraege || [];
      const n = Math.min(20, Math.max(1, Number(k.einst.anzahl) || 3));
      const tag = Math.floor(k.jetzt / 86400000);
      const gewaehlt = liste.length ? Array.from({ length: Math.min(n, liste.length) }, (_, i) => liste[(tag * n + i) % liste.length]) : [];
      const ausgabe = { art: 'karte', titel: 'Heute dran', punkte: gewaehlt, fuss: liste.length ? `${liste.length} Einträge in der Liste` : 'Die Liste ist leer.' };
      return { daten: { ...e, ausgabe }, kennzahlen: { gezeigt: gewaehlt.length } };
    },
  },
  {
    id: 'ziel/anzeige', art: 'ziel', titel: 'Auf der App-Seite zeigen', icon: 'auge',
    kurz: 'Zeigt das Ergebnis auf der App-Seite. Nichts verlässt den Rechner.',
    felder: [],
    kennzahlen: [],
    async ausfuehren(e) {
      return { daten: e, kennzahlen: {}, ausgabe: e.ausgabe || { art: 'text', titel: 'Ergebnis', text: 'Kein Ergebnis.' } };
    },
  },
  {
    id: 'ziel/datei', art: 'ziel', titel: 'In eine Datei schreiben', icon: 'datei',
    kurz: 'Schreibt das Ergebnis als Markdown in den Ergebnisordner der App.',
    felder: [],
    kennzahlen: ['zeichen'],
    async ausfuehren(e, k) {
      const a = e.ausgabe || { art: 'text', titel: 'Ergebnis', text: '' };
      const md = markdown(a);
      if (!k.probe) atomar(join(k.appDir, 'ergebnisse', `${k.stempel}.md`), md);
      return { daten: e, kennzahlen: { zeichen: md.length }, ausgabe: { ...a, datei: k.probe ? null : `ergebnisse\\${k.stempel}.md` } };
    },
  },
];

/** Bausteine, die geplant sind, aber noch nicht laufen (Phase C/G). */
const FOLGT = [
  { id: 'quelle/imap', art: 'quelle', titel: 'E-Mail (IMAP)', icon: 'mail', phase: 'C' },
  { id: 'quelle/pop3', art: 'quelle', titel: 'E-Mail (POP3)', icon: 'mail', phase: 'C' },
  { id: 'verarbeitung/ki-zusammenfassung', art: 'verarbeitung', titel: 'KI-Zusammenfassung', icon: 'funke', phase: 'C' },
  { id: 'ziel/telegram', art: 'ziel', titel: 'Telegram', icon: 'senden', phase: 'C' },
  { id: 'quelle/rss', art: 'quelle', titel: 'RSS-Feed', icon: 'feed', phase: 'G' },
  { id: 'quelle/web', art: 'quelle', titel: 'Webseite', icon: 'web', phase: 'G' },
];

/** Ergebnis als Markdown, für `ziel/datei`. */
export function markdown(a) {
  const zeilen = [`# ${a.titel || 'Ergebnis'}`, ''];
  if (a.art === 'tabelle') {
    zeilen.push(`| ${a.spalten.join(' | ')} |`, `|${a.spalten.map(() => '---').join('|')}|`);
    for (const z of a.zeilen) zeilen.push(`| ${z.map((x) => String(x).replace(/\|/g, '\\|')).join(' | ')} |`);
  } else if (a.art === 'karte') {
    for (const p of a.punkte || []) zeilen.push(`- ${p}`);
    if (a.fuss) zeilen.push('', a.fuss);
  } else zeilen.push(String(a.text || ''));
  return `${zeilen.join('\n')}\n`;
}

export function baustein(id) { return KATALOG.find((b) => b.id === id) || null; }
export function folgt(id) { return FOLGT.find((b) => b.id === id) || null; }

/** Der Katalog für die Oberfläche: ohne Funktionen. */
export function katalog() {
  return {
    bereit: KATALOG.map(({ ausfuehren, ...rest }) => rest),
    folgt: FOLGT,
  };
}

/** Kategorie-Vorschlag aus den Bausteinen (9.4). */
export function kategorieVorschlag(schritte) {
  const ids = (schritte || []).map((s) => s.baustein);
  if (ids.some((x) => x.includes('imap') || x.includes('pop3'))) return 'post';
  if (ids.some((x) => x.includes('rss'))) return 'nachrichten';
  if (ids.includes('quelle/web')) return 'beobachten';
  if (ids.includes('verarbeitung/tageskarte')) return 'lernen';
  if (ids.includes('quelle/ordner')) return 'dateien';
  return 'sonstiges';
}

/** Die Felder einer App, die auf der App-Seite bedienbar sind (beimStart). */
export function bedienfelder(app) {
  const aus = [];
  app.schritte.forEach((s, i) => {
    const b = baustein(s.baustein);
    if (!b) return;
    for (const f of b.felder) {
      if (!f.beimStart) continue;
      aus.push({ schritt: i, baustein: b.id, ...f, wert: s.einstellungen?.[f.name] ?? f.vorgabe });
    }
  });
  return aus;
}
