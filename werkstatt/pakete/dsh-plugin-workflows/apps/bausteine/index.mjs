/**
 * Baustein-Katalog der eigenen Apps (Masterplan Workflow-Modalseite, Kapitel 6).
 *
 * Erste Runde ohne Netz und ohne Dritte: Ordner lesen, filtern, als Tabelle
 * zeigen, Lernkarte des Tages, in eine Datei schreiben. Damit laufen die
 * ersten Apps schon, bevor Mail und Telegram (Phase C) dazukommen.
 *
 * Vertrag je Baustein (6.1):
 *   id, art, titel, icon, kurz
 *   gutFuer, daten  zwei Sätze für den Tooltip der Werkbank (4.6): wofür, was mit den Daten passiert
 *   braucht, liefert  welche Art Daten der Schritt erwartet und weitergibt; die Werkbank
 *                bietet nur passende Kacheln an, der Server prüft die Kette (ketteBruch).
 *                `braucht` darf eine Liste sein: dann passt jede dieser Arten.
 *   felder       [{ name, typ, titel, werte?, worte?, vorgabe, beimStart?, pflicht?, hilfe?, ki?, laenge? }]
 *                → Formular und Bedienfläche (9.5). `ki: true` zeigt in der Werkbank „KI fragen“
 *                (Plan 11.2), `laenge` begrenzt Texte (Vorgabe 200, mehrzeilig 4000).
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
    gutFuer: 'Downloads, Dokumente oder den Desktop im Blick behalten.',
    daten: 'Nur Name, Grösse und Datum. Was in den Dateien steht, bleibt zu.',
    liefert: 'dateien',
    felder: [
      { name: 'ordner', typ: 'wahl', titel: 'Ordner', werte: ['downloads', 'dokumente', 'desktop', 'import'],
        worte: { downloads: 'Downloads', dokumente: 'Dokumente', desktop: 'Desktop', import: 'Secondbrain · 50_Import' }, vorgabe: 'downloads', beimStart: true,
        hilfe: 'Nur diese festen Ordner sind möglich, damit keine App in fremde Ordner schaut.' },
      { name: 'nurNeue', typ: 'schalter', titel: 'Nur neue seit dem letzten Lauf', vorgabe: false, beimStart: true,
        hilfe: 'Beim nächsten Lauf kommen nur Dateien, die seitdem dazugekommen sind.' },
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
    gutFuer: 'Nur PDFs, nur Bilder oder nur die neuesten zwanzig.',
    daten: 'Bleibt auf deinem Rechner.',
    braucht: 'dateien', liefert: 'dateien',
    felder: [
      { name: 'endungen', typ: 'text', titel: 'Endungen (leer = alle)', vorgabe: '', beimStart: true,
        hilfe: 'Zum Beispiel „pdf“ oder „jpg, png“. Leer heisst: alle Dateien.' },
      { name: 'hoechstens', typ: 'zahl', titel: 'Höchstens', vorgabe: 50, min: 1, max: 500, beimStart: true,
        hilfe: 'So viele Dateien bleiben höchstens übrig, in der gewählten Reihenfolge.' },
      { name: 'mindestMb', typ: 'zahl', titel: 'Mindestens so gross (MB, 0 = egal)', vorgabe: 0, min: 0, max: 100000, beimStart: true,
        hilfe: 'Nur Dateien ab dieser Grösse. Gut, um Speicherfresser zu finden.' },
      { name: 'reihenfolge', typ: 'wahl', titel: 'Reihenfolge', werte: ['neueste', 'groesste'], worte: { neueste: 'die neuesten zuerst', groesste: 'die grössten zuerst' }, vorgabe: 'neueste', beimStart: true,
        hilfe: 'Was oben stehen soll.' },
    ],
    kennzahlen: ['behalten', 'verworfen'],
    async ausfuehren(e, k) {
      const erlaubt = String(k.einst.endungen || '').toLowerCase().split(/[\s,;]+/).map((x) => x.replace(/^\./, '')).filter(Boolean);
      const max = Math.min(500, Math.max(1, Number(k.einst.hoechstens) || 50));
      const ab = Math.max(0, Number(k.einst.mindestMb) || 0) * 1048576;
      const alle = e.dateien || [];
      const passend = alle.filter((d) => (!erlaubt.length || erlaubt.includes(d.endung)) && d.groesse >= ab);
      if (k.einst.reihenfolge === 'groesste') passend.sort((a, b) => b.groesse - a.groesse);
      const behalten = passend.slice(0, max);
      return { daten: { ...e, dateien: behalten }, kennzahlen: { behalten: behalten.length, verworfen: alle.length - behalten.length } };
    },
  },
  {
    id: 'verarbeitung/tabelle', art: 'verarbeitung', titel: 'Als Tabelle', icon: 'tabelle',
    kurz: 'Ordnet die Dateien als Tabelle, dazu eine Zusammenfassung nach Endung.',
    gutFuer: 'Eine Übersicht zum Nachschlagen.',
    daten: 'Bleibt auf deinem Rechner.',
    braucht: 'dateien', liefert: 'ausgabe',
    felder: [{ name: 'gruppieren', typ: 'schalter', titel: 'Übersicht nach Endung', vorgabe: true, beimStart: true,
      hilfe: 'Zeigt über der Tabelle, wie viele Dateien es je Dateityp gibt.' }],
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
    gutFuer: 'Vokabeln, Merksätze oder Aufgaben.',
    daten: 'Die Liste liegt nur in deiner App auf diesem Rechner.',
    liefert: 'liste',
    felder: [{ name: 'eintraege', typ: 'mehrzeilig', titel: 'Einträge, je Zeile einer', vorgabe: '', pflicht: true,
      hilfe: 'Schreib jeden Eintrag in eine eigene Zeile.' }],
    kennzahlen: ['eintraege'],
    async ausfuehren(_e, k) {
      const eintraege = String(k.einst.eintraege || '').split('\n').map((x) => x.trim()).filter(Boolean).slice(0, 1000);
      return { daten: { eintraege }, kennzahlen: { eintraege: eintraege.length } };
    },
  },
  {
    id: 'verarbeitung/tageskarte', art: 'verarbeitung', titel: 'Karte des Tages', icon: 'karte',
    kurz: 'Wählt je Tag reihum Einträge aus der Liste, damit über die Woche alles drankommt.',
    gutFuer: 'Jeden Tag ein paar Dinge wiederholen.',
    daten: 'Bleibt auf deinem Rechner.',
    braucht: 'liste', liefert: 'ausgabe',
    felder: [{ name: 'anzahl', typ: 'zahl', titel: 'Einträge je Tag', vorgabe: 3, min: 1, max: 20, beimStart: true,
      hilfe: 'So viele Einträge zeigt die Karte an einem Tag.' }],
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
    gutFuer: 'Schnell nachsehen, ohne dass Dateien entstehen.',
    daten: 'Nichts verlässt den Rechner.',
    braucht: 'ausgabe',
    felder: [],
    kennzahlen: [],
    async ausfuehren(e) {
      return { daten: e, kennzahlen: {}, ausgabe: e.ausgabe || { art: 'text', titel: 'Ergebnis', text: 'Kein Ergebnis.' } };
    },
  },
  {
    id: 'ziel/datei', art: 'ziel', titel: 'In eine Datei schreiben', icon: 'datei',
    kurz: 'Schreibt das Ergebnis als Markdown in den Ergebnisordner der App.',
    gutFuer: 'Ergebnisse sammeln und später öffnen.',
    daten: 'Die Datei liegt im Ordner der App auf diesem Rechner. Der Probelauf schreibt keine.',
    braucht: 'ausgabe',
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

/** Anbieter für Mail (4.3); Server, Port und Verschlüsselung trägt Phase C aus der Anbieterliste ein. */
const ANBIETER = {
  werte: ['webde', 'gmx', 'gmail', 'outlook', 'tonline', 'eigener'],
  worte: { webde: 'web.de', gmx: 'GMX', gmail: 'Gmail (App-Passwort)', outlook: 'Outlook', tonline: 'T-Online', eigener: 'Eigener Server' },
};

/**
 * Bausteine, die geplant sind, aber noch nicht laufen (Phase C/G). Sie tragen
 * schon ihre Felder: Vorlagen und Werkbank füllen sie aus, der Server prüft
 * die Werte, und die App bleibt Entwurf, bis der Baustein gebaut ist.
 */
const FOLGT = [
  { id: 'quelle/imap', art: 'quelle', titel: 'E-Mail (IMAP)', icon: 'mail', phase: 'C', liefert: 'mails',
    kurz: 'Holt neue Mails aus deinem Postfach (web.de, GMX, Gmail …). Die Mails bleiben ungelesen.',
    gutFuer: 'Ein Überblick über dein Postfach, ohne es zu öffnen.',
    daten: 'Das Passwort liegt verschlüsselt im Tresor. Die Mails werden nur gelesen, nie gelöscht.',
    felder: [
      { name: 'anbieter', typ: 'wahl', titel: 'Anbieter', ...ANBIETER, vorgabe: 'webde',
        hilfe: 'Server, Port und Verschlüsselung trägt die Werkstatt selbst ein. Das Passwort kommt in Phase C in den Tresor, nie in die App.' },
      { name: 'ordner', typ: 'text', titel: 'Postfach-Ordner', vorgabe: 'INBOX', hilfe: 'Meist „INBOX“, also der Posteingang.' },
      { name: 'nurUngelesen', typ: 'schalter', titel: 'Nur ungelesene', vorgabe: true, hilfe: 'Gelesene Mails bleiben aussen vor. Die App selbst markiert nichts als gelesen.' },
    ] },
  { id: 'quelle/pop3', art: 'quelle', titel: 'E-Mail (POP3)', icon: 'mail', phase: 'C', liefert: 'mails',
    kurz: 'Holt neue Mails per POP3. Es wird nichts gelöscht.',
    gutFuer: 'Postfächer, die kein IMAP anbieten.',
    daten: 'Das Passwort liegt verschlüsselt im Tresor. Es wird nichts gelöscht.',
    felder: [{ name: 'anbieter', typ: 'wahl', titel: 'Anbieter', ...ANBIETER, vorgabe: 'webde',
      hilfe: 'Server, Port und Verschlüsselung trägt die Werkstatt selbst ein.' }] },
  { id: 'quelle/rss', art: 'quelle', titel: 'Nachrichten-Feed (RSS)', icon: 'feed', phase: 'G', liefert: 'artikel',
    kurz: 'Liest neue Beiträge aus Nachrichten-Feeds, zum Beispiel von Fachseiten.',
    gutFuer: 'Täglich die Neuigkeiten zu einem Thema, ohne zehn Seiten zu öffnen.',
    daten: 'Die Werkstatt ruft nur die Feeds ab. Dabei gehen keine Angaben über dich hinaus.',
    felder: [
      { name: 'paket', typ: 'wahl', titel: 'Quellen', werte: ['ki-de', 'ki-en', 'technik-de', 'eigene'],
        worte: { 'ki-de': 'KI-Nachrichten, deutsch', 'ki-en': 'KI-Nachrichten, englisch', 'technik-de': 'Technik allgemein, deutsch', eigene: 'Eigene Feed-Adressen' }, vorgabe: 'ki-de',
        hilfe: 'Die Pakete enthalten bekannte Fachseiten; ihre Adressen prüft die Werkstatt in Phase G. Mit „Eigene“ trägst du Adressen selbst ein.' },
      { name: 'feeds', typ: 'mehrzeilig', titel: 'Eigene Feed-Adressen', vorgabe: '', laenge: 2000,
        hilfe: 'Nur bei „Eigene Feed-Adressen“: je Zeile eine Adresse, die mit https:// beginnt.' },
      { name: 'stichworte', typ: 'text', titel: 'Stichworte (leer = alles)', vorgabe: '', ki: true,
        hilfe: 'Nur Beiträge, in denen eines dieser Wörter vorkommt, mit Komma getrennt.' },
      { name: 'zeitraum', typ: 'wahl', titel: 'Zeitraum', werte: ['24h', '7t'], worte: { '24h': 'letzte 24 Stunden', '7t': 'letzte 7 Tage' }, vorgabe: '24h',
        hilfe: 'Wie weit die App zurückschaut.' },
    ] },
  { id: 'quelle/web', art: 'quelle', titel: 'Webseite', icon: 'web', phase: 'G', liefert: 'seite',
    kurz: 'Prüft eine Webseite auf Änderungen.',
    gutFuer: 'Preise, Termine oder Ankündigungen im Blick behalten.',
    daten: 'Die Werkstatt ruft nur diese eine Seite ab, mit Abstand und nach den Regeln der Seite (robots.txt).',
    felder: [
      { name: 'adresse', typ: 'text', titel: 'Adresse der Seite', vorgabe: '', pflicht: true, laenge: 500,
        hilfe: 'Beginnt mit https://. Adressen aus dem eigenen Heimnetz sind gesperrt.' },
      { name: 'achten', typ: 'text', titel: 'Worauf achten', vorgabe: '', ki: true, laenge: 300,
        hilfe: 'Zum Beispiel „Preis unter 300 €“ oder „neue Termine im Oktober“. Leer heisst: jede Änderung.' },
    ] },
  { id: 'quelle/ebay', art: 'quelle', titel: 'eBay-Suche', icon: 'lupe', phase: 'G', liefert: 'angebote',
    kurz: 'Sucht über die offizielle eBay-Schnittstelle nach Angeboten, die zu deinen Filtern passen.',
    gutFuer: 'Ein bestimmtes Produkt finden, ohne jeden Tag selbst zu suchen.',
    daten: 'Suchbegriff und Filter gehen an eBay. Dafür brauchst du einmal einen kostenlosen eBay-Entwicklerzugang; der Schlüssel liegt im Tresor.',
    felder: [
      { name: 'suchbegriff', typ: 'text', titel: 'Was suchst du?', vorgabe: '', pflicht: true, ki: true, laenge: 120,
        hilfe: 'Möglichst genau: Marke, Modell, Grösse. „KI fragen“ hilft beim Schärfen.' },
      { name: 'zustand', typ: 'wahl', titel: 'Zustand', werte: ['egal', 'neu', 'gebraucht', 'generalueberholt', 'defekt'],
        worte: { egal: 'egal', neu: 'neu', gebraucht: 'gebraucht', generalueberholt: 'generalüberholt', defekt: 'defekt / für Bastler' }, vorgabe: 'egal' },
      { name: 'preisBis', typ: 'zahl', titel: 'Höchstpreis in € (0 = egal)', vorgabe: 0, min: 0, max: 100000,
        hilfe: 'Mit Versand gerechnet, so weit eBay es angibt.' },
      { name: 'angebot', typ: 'wahl', titel: 'Angebotsart', werte: ['alle', 'sofortkauf', 'auktion'],
        worte: { alle: 'alle', sofortkauf: 'nur Sofort-Kaufen', auktion: 'nur Auktionen' }, vorgabe: 'alle' },
      { name: 'versand', typ: 'wahl', titel: 'Versand', werte: ['egal', 'versand', 'abholung'],
        worte: { egal: 'egal', versand: 'nur mit Versand', abholung: 'nur Abholung' }, vorgabe: 'egal' },
      { name: 'standort', typ: 'wahl', titel: 'Artikelstandort', werte: ['de', 'eu', 'welt'],
        worte: { de: 'Deutschland', eu: 'EU', welt: 'weltweit' }, vorgabe: 'de',
        hilfe: 'Ausserhalb der EU können Zoll und Einfuhrsteuer dazukommen.' },
      { name: 'verkaeufer', typ: 'wahl', titel: 'Verkäufer', werte: ['alle', 'privat', 'gewerblich'],
        worte: { alle: 'alle', privat: 'nur privat', gewerblich: 'nur gewerblich' }, vorgabe: 'alle',
        hilfe: 'Bei gewerblichen Verkäufern hast du in der Regel 14 Tage Widerrufsrecht und Gewährleistung.' },
      { name: 'nurNeue', typ: 'schalter', titel: 'Nur neue Angebote seit dem letzten Lauf', vorgabe: true },
    ] },
  { id: 'filter/mails', art: 'filter', titel: 'Mails auswählen', icon: 'filter', phase: 'C', braucht: 'mails', liefert: 'mails',
    kurz: 'Behält nur Mails bestimmter Absender, mit bestimmten Wörtern im Betreff oder aus einem Zeitraum.',
    gutFuer: 'Nur das, was wirklich zählt: Chefin, Schule, Rechnungen.',
    daten: 'Bleibt auf deinem Rechner.',
    felder: [
      { name: 'absender', typ: 'text', titel: 'Absender (leer = alle)', vorgabe: '', laenge: 300,
        hilfe: 'Adressen oder Namensteile, mit Komma getrennt.' },
      { name: 'betreff', typ: 'text', titel: 'Wörter im Betreff (leer = alle)', vorgabe: '', ki: true,
        hilfe: 'Zum Beispiel „Rechnung, Frist, Termin“.' },
      { name: 'zeitraum', typ: 'wahl', titel: 'Zeitraum', werte: ['24h', '7t', '30t'],
        worte: { '24h': 'letzte 24 Stunden', '7t': 'letzte 7 Tage', '30t': 'letzte 30 Tage' }, vorgabe: '24h' },
    ] },
  { id: 'verarbeitung/ki-zusammenfassung', art: 'verarbeitung', titel: 'KI-Zusammenfassung', icon: 'funke', phase: 'C',
    braucht: ['mails', 'artikel', 'seite'], liefert: 'ausgabe',
    kurz: 'Ein Sprachmodell fasst Mails, Beiträge oder eine Webseite kurz zusammen, durch die Schutzschicht der Werkstatt.',
    gutFuer: 'Briefings, Nachrichten-Überblicke, „Was hat sich geändert?“.',
    daten: 'Der Text geht maskiert über die Schutzschicht an das KI-Modell (OpenRouter, möglicherweise ausserhalb der EU).',
    felder: [
      { name: 'format', typ: 'wahl', titel: 'Format', werte: ['stichpunkte', 'tagesbriefing', 'ampel', 'tabelle', 'wichtig'],
        worte: { stichpunkte: 'Stichpunkte', tagesbriefing: 'Tagesbriefing', ampel: 'Prioritäten-Ampel', tabelle: 'Tabelle', wichtig: 'Nur Wichtiges' }, vorgabe: 'stichpunkte',
        hilfe: 'Wie das Ergebnis aussieht. Die Vorschau zeigt die Kachel in der Werkbank.' },
      { name: 'fokus', typ: 'text', titel: 'Worauf achten', vorgabe: '', ki: true, laenge: 300,
        hilfe: 'Was dir besonders wichtig ist, zum Beispiel „neue Werkzeuge für Lehrkräfte“.' },
      { name: 'sprache', typ: 'wahl', titel: 'Sprache', werte: ['de', 'en'], worte: { de: 'Deutsch', en: 'Englisch' }, vorgabe: 'de' },
      { name: 'laenge', typ: 'wahl', titel: 'Länge', werte: ['kurz', 'mittel', 'ausfuehrlich'],
        worte: { kurz: 'kurz (bis 5 Punkte)', mittel: 'mittel (bis 10 Punkte)', ausfuehrlich: 'ausführlich' }, vorgabe: 'kurz' },
      { name: 'datensparsam', typ: 'schalter', titel: 'Datensparsam (nur Betreff und Absender)', vorgabe: false,
        hilfe: 'Bei Mails geht dann kein Mailtext an das Modell. Für Konten unter 18 ist das die Vorgabe.' },
    ] },
  { id: 'verarbeitung/ki-pruefen', art: 'verarbeitung', titel: 'KI prüft Angebote', icon: 'funke', phase: 'G',
    braucht: 'angebote', liefert: 'ausgabe',
    kurz: 'Ein Sprachmodell prüft jedes Angebot gegen deine Kriterien und sortiert in passt, unsicher und passt nicht.',
    gutFuer: 'Kriterien, die kein Filter kennt: „mit Originalrechnung“, „Akku über 85 %“.',
    daten: 'Titel und Beschreibung der Angebote gehen über die Schutzschicht an das KI-Modell, deine Kriterien auch. Über dich selbst geht nichts mit.',
    felder: [
      { name: 'kriterien', typ: 'mehrzeilig', titel: 'Woran erkennst du ein gutes Angebot?', vorgabe: '', pflicht: true, ki: true, laenge: 1500,
        hilfe: 'Je Zeile ein Punkt. „KI fragen“ ergänzt, woran man bei diesem Produkt oft nicht denkt.' },
      { name: 'nurPassende', typ: 'schalter', titel: 'Nur passende melden', vorgabe: true,
        hilfe: 'Aus: „unsicher“ kommt mit, damit du selbst entscheidest.' },
    ] },
  { id: 'ziel/telegram', art: 'ziel', titel: 'Telegram', icon: 'senden', phase: 'C', braucht: 'ausgabe',
    kurz: 'Schickt das Ergebnis an deinen eigenen, verknüpften Telegram-Bot, privat oder in ein Thema einer Gruppe.',
    gutFuer: 'Ergebnisse unterwegs auf dem Handy.',
    daten: 'Telegram ist ein Dienst eines Drittanbieters; die Nachricht liegt dort im Klartext. Gesendet wird nur an Chats, die du selbst verknüpft hast.',
    felder: [
      { name: 'empfaenger', typ: 'wahl', titel: 'Wohin', werte: ['privat', 'gruppe'],
        worte: { privat: 'privater Chat mit meinem Bot', gruppe: 'Thema in einer Gruppe (ab 18)' }, vorgabe: 'privat',
        hilfe: 'Gruppe: Du fügst deinen Bot der Gruppe hinzu und postest den Einmalcode der Werkstatt in genau dem Thema, in das die Nachrichten sollen. Nur für Konten ab 18.' },
      { name: 'thema', typ: 'text', titel: 'Thema in der Gruppe', vorgabe: '', laenge: 60,
        hilfe: 'Nur bei „Gruppe“: der Name des Themas, zum Beispiel „News“. Er dient dir zur Wiedererkennung; massgeblich ist, wo du den Code postest.' },
    ] },
  { id: 'ziel/smtp', art: 'ziel', titel: 'E-Mail an mich', icon: 'mail', phase: 'G', braucht: 'ausgabe',
    kurz: 'Schickt das Ergebnis an deine eigene, im Konto bestätigte Adresse.',
    gutFuer: 'Wer kein Telegram nutzt.',
    daten: 'Versand über dein eigenes Postfach; das Passwort liegt im Tresor.',
    felder: [] },
];

/** Die Art Daten in Worten, für Tooltips und Fehlersätze. */
export const DATEN_WORT = { dateien: 'Dateien', liste: 'eine Liste', ausgabe: 'ein Ergebnis', mails: 'Mails', artikel: 'Beiträge', seite: 'eine Webseite', angebote: 'Angebote' };

/** Passt, was ankommt, zu dem, was ein Baustein braucht? `braucht` darf eine Liste sein. */
export function brauchtPasst(braucht, fliesst) {
  if (!braucht) return true;
  return Array.isArray(braucht) ? braucht.includes(fliesst) : braucht === fliesst;
}
/** `braucht` in Worten: „Mails oder Beiträge“. */
export function brauchtWort(braucht) {
  return (Array.isArray(braucht) ? braucht : [braucht]).map((x) => DATEN_WORT[x] || x).join(' oder ');
}

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

/**
 * Die Einstellungen eines Schritts, bereinigt gegen die Felder des Bausteins:
 * unbekannte Namen fallen weg, Wahlwerte nur aus der Liste, Zahlen in ihre
 * Grenzen, Texte gekürzt. Für Bausteine späterer Phasen (noch ohne Felder)
 * bleiben nur kurze einfache Werte.
 * @param id - Baustein-Kennung.
 * @param roh - die Einstellungen aus der Anfrage.
 */
export function einstellungenPruefen(id, roh) {
  const e = roh && typeof roh === 'object' && !Array.isArray(roh) ? roh : {};
  const f0 = folgt(id);
  const b = baustein(id) || (f0?.felder?.length ? f0 : null);
  if (!b) {
    const aus = {};
    for (const [k, v] of Object.entries(e).slice(0, 10)) {
      if (!/^[a-zA-Z][a-zA-Z0-9]{0,30}$/.test(k)) continue;
      if (typeof v === 'boolean' || (typeof v === 'number' && Number.isFinite(v))) aus[k] = v;
      else if (typeof v === 'string') aus[k] = v.slice(0, 200);
    }
    return aus;
  }
  const aus = {};
  for (const f of b.felder) {
    const v = e[f.name];
    if (f.typ === 'wahl') aus[f.name] = f.werte.includes(v) ? v : f.vorgabe;
    else if (f.typ === 'zahl') {
      const n = Number(v);
      aus[f.name] = Number.isFinite(n) && v !== '' && v !== null ? Math.min(f.max ?? n, Math.max(f.min ?? n, Math.round(n))) : f.vorgabe;
    } else if (f.typ === 'schalter') aus[f.name] = typeof v === 'boolean' ? v : f.vorgabe;
    else if (f.typ === 'mehrzeilig') aus[f.name] = typeof v === 'string' ? v.slice(0, f.laenge ?? 4000) : f.vorgabe;
    else aus[f.name] = typeof v === 'string' ? v.replace(/[\r\n]+/g, ' ').slice(0, f.laenge ?? 200) : f.vorgabe;
  }
  return aus;
}

/** Pflichtfelder, die leer sind, als Titel. */
export function pflichtFehlt(id, einst) {
  const b = baustein(id);
  if (!b) return [];
  return b.felder.filter((f) => f.pflicht && !String(einst?.[f.name] ?? '').trim()).map((f) => f.titel);
}

/**
 * Prüft, ob jeder Schritt bekommt, was er braucht.
 * @returns null, wenn die Kette hält; sonst { schritt, text }.
 */
export function ketteBruch(schritte) {
  let fliesst = null;
  let vorher = null;
  for (let i = 0; i < schritte.length; i++) {
    const b = baustein(schritte[i].baustein) || folgt(schritte[i].baustein);
    if (!b) return { schritt: i, text: `Unbekannter Baustein „${schritte[i].baustein}“` };
    if (b.art === 'quelle' && i > 0) return { schritt: i, text: 'Eine Quelle steht nur am Anfang' };
    if (!brauchtPasst(b.braucht, fliesst)) {
      return { schritt: i, text: vorher
        ? `„${b.titel}“ braucht ${brauchtWort(b.braucht)}, „${vorher.titel}“ liefert ${DATEN_WORT[fliesst] || 'nichts davon'}`
        : `„${b.titel}“ braucht davor eine Quelle` };
    }
    if (b.liefert) fliesst = b.liefert;
    vorher = b;
  }
  return null;
}

/** Vollständig ist eine Strecke mit Quelle vorn, Ziel hinten und heiler Kette. */
export function streckeVollstaendig(schritte) {
  if (!schritte.length) return false;
  const art = (s) => (baustein(s.baustein) || folgt(s.baustein))?.art;
  return art(schritte[0]) === 'quelle' && art(schritte[schritte.length - 1]) === 'ziel' && !ketteBruch(schritte);
}

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
  if (ids.includes('quelle/web') || ids.includes('quelle/ebay')) return 'beobachten';
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
