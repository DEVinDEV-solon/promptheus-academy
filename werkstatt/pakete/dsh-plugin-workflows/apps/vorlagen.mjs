/**
 * Vorlagen der Werkbank (Masterplan Workflow-Modalseite, Kapitel 11 und 11.1).
 *
 * Jede Vorlage hat einen Zweck (`gruppe`), eine fertige Strecke (`app`) und
 * einen kurzen Fragebogen (`fragen`). Die Werkbank stellt die Fragen, trägt
 * die Antworten in die Schritte ein und führt dann zum Probelauf.
 *
 * Eine Frage:
 *   { id, frage, typ, vorgabe, beispiel?, hilfe?, pflicht?, ki?, wenn?, ziel }
 *   typ    text | mehrzeilig | wahl | janein | zahl | uhrzeit | tag | stunden
 *   ziel   { app: 'name' } | { ausloeser: 'uhrzeit'|'tag'|'stunden' } | { schritt: '<baustein>', feld }
 *   wenn   { frage, ist }  die Frage erscheint nur bei dieser Antwort
 *   ki     zeigt „KI fragen“: das Modell stellt Rückfragen mit Auswahl und
 *          nennt, woran man oft nicht denkt (Plan 11.2)
 * Bei `wahl` mit Ziel in einem Schritt kommen die Werte aus dem Feld des
 * Bausteins (`fragenAufloesen`), damit es nur eine Liste gibt.
 *
 * Ohne Geheimnisse. Was einen Baustein aus Phase C oder G braucht, entsteht
 * als Entwurf und zeigt, was noch fehlt.
 *
 * @module @promptheus/dsh-plugin-workflows/apps/vorlagen
 */

import { baustein, folgt } from './bausteine/index.mjs';

/** Zwecke für die Auswahl in der Werkbank (nicht die Kategorien von „Meine Apps“). */
export const GRUPPEN = [
  { id: 'nachrichten', name: 'Nachrichten & Wissen', icon: 'feed' },
  { id: 'einkaufen', name: 'Einkaufen & Preise', icon: 'lupe' },
  { id: 'post', name: 'Post & Mail', icon: 'mail' },
  { id: 'lernen', name: 'Lernen & Erinnern', icon: 'karte' },
  { id: 'dateien', name: 'Dateien & Ordner', icon: 'ordner' },
  { id: 'beobachten', name: 'Beobachten', icon: 'auge' },
];

/** Häufige Fragen, damit jede Vorlage gleich fragt. */
const F = {
  name: (vorgabe) => ({ id: 'name', frage: 'Wie soll die App heissen?', typ: 'text', vorgabe, pflicht: true, ziel: { app: 'name' },
    hilfe: 'So steht sie in „Meine Apps“. Kurz und eindeutig.' }),
  uhrzeit: (vorgabe, frage = 'Um wie viel Uhr?') => ({ id: 'uhrzeit', frage, typ: 'uhrzeit', vorgabe, pflicht: true, ziel: { ausloeser: 'uhrzeit' },
    hilfe: 'Von allein startet die App ab Phase D (Windows-Aufgabenplanung). Bis dahin startest du sie auf ihrer Seite.' }),
  wohin: (vorgabe = 'privat') => ({ id: 'wohin', frage: 'Wohin bei Telegram?', typ: 'wahl', vorgabe, ziel: { schritt: 'ziel/telegram', feld: 'empfaenger' },
    hilfe: 'Privat an deinen eigenen Bot oder in ein Thema einer Gruppe. Gruppen gibt es für Konten ab 18.' }),
  thema: (vorgabe) => ({ id: 'thema', frage: 'Wie heisst das Thema in der Gruppe?', typ: 'text', vorgabe, wenn: { frage: 'wohin', ist: 'gruppe' },
    ziel: { schritt: 'ziel/telegram', feld: 'thema' }, beispiel: 'News',
    hilfe: 'Beim Verknüpfen (Phase C) postest du einen Einmalcode in genau diesem Thema. Danach landen die Nachrichten dort.' }),
  anbieter: () => ({ id: 'anbieter', frage: 'Bei welchem Anbieter ist dein Postfach?', typ: 'wahl', vorgabe: 'webde', ziel: { schritt: 'quelle/imap', feld: 'anbieter' },
    hilfe: 'Das Passwort fragt die Werkstatt erst in Phase C ab und legt es verschlüsselt in den Tresor.' }),
  ordner: (vorgabe) => ({ id: 'ordner', frage: 'Welcher Ordner?', typ: 'wahl', vorgabe, ziel: { schritt: 'quelle/ordner', feld: 'ordner' },
    hilfe: 'Nur diese festen Ordner sind möglich.' }),
};

export const VORLAGEN = [
  // ---------------------------------------------------------------- Nachrichten & Wissen
  {
    vorlage: 'ki-news', gruppe: 'nachrichten',
    titel: 'KI-News jeden Mittag',
    text: 'Die wichtigsten KI-Nachrichten des Tages, kurz zusammengefasst, um 12:00 an deinen Telegram-Bot, auch in ein Gruppen-Thema wie „News“.',
    fragen: [
      { id: 'fokus', frage: 'Worüber willst du auf dem Laufenden bleiben?', typ: 'text', pflicht: true, ki: true,
        vorgabe: 'Neue KI-Modelle und Werkzeuge, und was sie im Alltag ändern',
        beispiel: 'KI-Werkzeuge für Schule und Unterricht',
        hilfe: 'Je genauer, desto besser die Auswahl. „KI fragen“ hilft, aus einem breiten Thema einen klaren Blickwinkel zu machen.',
        ziel: { schritt: 'verarbeitung/ki-zusammenfassung', feld: 'fokus' } },
      { id: 'quellen', frage: 'Aus welchen Quellen?', typ: 'wahl', vorgabe: 'ki-de', ziel: { schritt: 'quelle/rss', feld: 'paket' } },
      { id: 'feeds', frage: 'Deine Feed-Adressen', typ: 'mehrzeilig', vorgabe: '', wenn: { frage: 'quellen', ist: 'eigene' },
        beispiel: 'https://beispiel.de/feed', ziel: { schritt: 'quelle/rss', feld: 'feeds' },
        hilfe: 'Je Zeile eine Adresse, die mit https:// beginnt.' },
      F.uhrzeit('12:00', 'Um wie viel Uhr sollen die News kommen?'),
      { id: 'format', frage: 'Wie sollen die News aussehen?', typ: 'wahl', vorgabe: 'stichpunkte', ziel: { schritt: 'verarbeitung/ki-zusammenfassung', feld: 'format' } },
      F.wohin('gruppe'),
      F.thema('News'),
    ],
    app: {
      id: 'ki-news', name: 'KI-News', icon: 'feed', kategorie: 'nachrichten', status: 'entwurf',
      ziel: 'Jeden Mittag die wichtigsten KI-Nachrichten kurz auf Telegram.',
      ausloeser: { art: 'zeitplan', regel: { typ: 'taeglich', uhrzeit: '12:00' } },
      schritte: [
        { baustein: 'quelle/rss', einstellungen: { paket: 'ki-de', feeds: '', stichworte: '', zeitraum: '24h' } },
        { baustein: 'verarbeitung/ki-zusammenfassung', einstellungen: { format: 'stichpunkte', fokus: '', sprache: 'de', laenge: 'kurz', datensparsam: false } },
        { baustein: 'ziel/telegram', einstellungen: { empfaenger: 'gruppe', thema: 'News' } },
      ],
    },
  },
  {
    vorlage: 'themen-woche', gruppe: 'nachrichten',
    titel: 'Wochenrückblick zu einem Thema',
    text: 'Einmal pro Woche die Beiträge zu deinem Thema als Stichpunkte, abgelegt als Datei zum Nachlesen.',
    fragen: [
      { id: 'stichworte', frage: 'Welches Thema?', typ: 'text', pflicht: true, ki: true, vorgabe: '',
        beispiel: 'Datenschutz, DSGVO, KI-Verordnung',
        hilfe: 'Stichworte mit Komma. „KI fragen“ schlägt passende Begriffe vor, auch Fachwörter, nach denen du sonst nicht suchen würdest.',
        ziel: { schritt: 'quelle/rss', feld: 'stichworte' } },
      { id: 'quellen', frage: 'Aus welchen Quellen?', typ: 'wahl', vorgabe: 'technik-de', ziel: { schritt: 'quelle/rss', feld: 'paket' } },
      { id: 'tag', frage: 'An welchem Tag?', typ: 'tag', vorgabe: 1, ziel: { ausloeser: 'tag' } },
      F.uhrzeit('08:00'),
    ],
    app: {
      id: 'themen-woche', name: 'Wochenrückblick', icon: 'feed', kategorie: 'nachrichten', status: 'entwurf',
      ziel: 'Jede Woche die Beiträge zu einem Thema als Stichpunkte.',
      ausloeser: { art: 'zeitplan', regel: { typ: 'woechentlich', tag: 1, uhrzeit: '08:00' } },
      schritte: [
        { baustein: 'quelle/rss', einstellungen: { paket: 'technik-de', feeds: '', stichworte: '', zeitraum: '7t' } },
        { baustein: 'verarbeitung/ki-zusammenfassung', einstellungen: { format: 'stichpunkte', fokus: '', sprache: 'de', laenge: 'mittel', datensparsam: false } },
        { baustein: 'ziel/datei', einstellungen: {} },
      ],
    },
  },

  // ---------------------------------------------------------------- Einkaufen & Preise
  {
    vorlage: 'ebay-suche', gruppe: 'einkaufen',
    titel: 'eBay-Suchauftrag',
    text: 'Sucht regelmässig auf eBay nach deinem Produkt, lässt die KI jedes Angebot gegen deine Kriterien prüfen und meldet nur, was passt.',
    fragen: [
      { id: 'produkt', frage: 'Was suchst du?', typ: 'text', pflicht: true, ki: true, vorgabe: '',
        beispiel: 'iPhone 13 mini, 128 GB',
        hilfe: 'Marke, Modell, Grösse. „KI fragen“ fragt nach, was bei diesem Produkt den Unterschied macht.',
        ziel: { schritt: 'quelle/ebay', feld: 'suchbegriff' } },
      { id: 'kriterien', frage: 'Woran erkennst du ein gutes Angebot?', typ: 'mehrzeilig', pflicht: true, ki: true, vorgabe: '',
        beispiel: 'Akkuzustand über 85 %\nkeine Kratzer am Display\nmit Rechnung',
        hilfe: 'Je Zeile ein Punkt. Hier hilft „KI fragen“ am meisten: Es nennt typische Schwachstellen, Fallen und Fragen an den Verkäufer.',
        ziel: { schritt: 'verarbeitung/ki-pruefen', feld: 'kriterien' } },
      { id: 'zustand', frage: 'Welcher Zustand?', typ: 'wahl', vorgabe: 'egal', ziel: { schritt: 'quelle/ebay', feld: 'zustand' } },
      { id: 'preis', frage: 'Höchstens wie viel Euro?', typ: 'zahl', vorgabe: 0, ziel: { schritt: 'quelle/ebay', feld: 'preisBis' },
        hilfe: '0 heisst: egal.' },
      { id: 'versand', frage: 'Versand oder Abholung?', typ: 'wahl', vorgabe: 'egal', ziel: { schritt: 'quelle/ebay', feld: 'versand' } },
      { id: 'verkaeufer', frage: 'Von wem?', typ: 'wahl', vorgabe: 'alle', ziel: { schritt: 'quelle/ebay', feld: 'verkaeufer' } },
      { id: 'stunden', frage: 'Wie oft suchen?', typ: 'stunden', vorgabe: 3, ziel: { ausloeser: 'stunden' },
        hilfe: 'Alle 1 bis 12 Stunden. eBay erlaubt je Tag nur eine begrenzte Zahl Abfragen; alle 3 Stunden ist ein guter Mittelweg.' },
      F.wohin('privat'),
      F.thema('Suche'),
    ],
    app: {
      id: 'ebay-suche', name: 'eBay-Suchauftrag', icon: 'lupe', kategorie: 'beobachten', status: 'entwurf',
      ziel: 'Passende eBay-Angebote finden und nur die guten melden.',
      ausloeser: { art: 'zeitplan', regel: { typ: 'intervall', stunden: 3 } },
      schritte: [
        { baustein: 'quelle/ebay', einstellungen: { suchbegriff: '', zustand: 'egal', preisBis: 0, angebot: 'alle', versand: 'egal', standort: 'de', verkaeufer: 'alle', nurNeue: true } },
        { baustein: 'verarbeitung/ki-pruefen', einstellungen: { kriterien: '', nurPassende: true } },
        { baustein: 'ziel/telegram', einstellungen: { empfaenger: 'privat', thema: '' } },
      ],
    },
  },
  {
    vorlage: 'preis-beobachten', gruppe: 'einkaufen',
    titel: 'Preis auf einer Seite beobachten',
    text: 'Schaut jeden Morgen auf eine Produktseite und meldet sich nur, wenn der Preis unter deine Grenze fällt.',
    fragen: [
      { id: 'adresse', frage: 'Welche Seite?', typ: 'text', pflicht: true, vorgabe: '', beispiel: 'https://…',
        hilfe: 'Die Adresse der Produktseite, mit https:// am Anfang.', ziel: { schritt: 'quelle/web', feld: 'adresse' } },
      { id: 'achten', frage: 'Wann soll sie sich melden?', typ: 'text', pflicht: true, ki: true, vorgabe: '',
        beispiel: 'Preis unter 250 €',
        hilfe: '„KI fragen“ denkt an Versandkosten, Varianten und „nur noch wenige auf Lager“.',
        ziel: { schritt: 'quelle/web', feld: 'achten' } },
      F.uhrzeit('09:00'),
      F.wohin('privat'),
      F.thema('Preise'),
    ],
    app: {
      id: 'preis-beobachten', name: 'Preiswächter', icon: 'web', kategorie: 'beobachten', status: 'entwurf',
      ziel: 'Melden, wenn der Preis unter meine Grenze fällt.',
      ausloeser: { art: 'zeitplan', regel: { typ: 'taeglich', uhrzeit: '09:00' } },
      schritte: [
        { baustein: 'quelle/web', einstellungen: { adresse: '', achten: '' } },
        { baustein: 'verarbeitung/ki-zusammenfassung', einstellungen: { format: 'wichtig', fokus: 'Preis und Verfügbarkeit', sprache: 'de', laenge: 'kurz', datensparsam: false } },
        { baustein: 'ziel/telegram', einstellungen: { empfaenger: 'privat', thema: '' } },
      ],
    },
  },

  // ---------------------------------------------------------------- Post & Mail
  {
    vorlage: 'mail-tagesbriefing', gruppe: 'post',
    titel: 'Mail-Tagesbriefing',
    text: 'Jeden Morgen die neuen Mails kurz zusammengefasst an Telegram.',
    fragen: [
      F.anbieter(),
      F.uhrzeit('07:00'),
      { id: 'format', frage: 'Wie soll das Briefing aussehen?', typ: 'wahl', vorgabe: 'tagesbriefing', ziel: { schritt: 'verarbeitung/ki-zusammenfassung', feld: 'format' } },
      { id: 'sparsam', frage: 'Nur Betreff und Absender an die KI (datensparsam)?', typ: 'janein', vorgabe: false,
        ziel: { schritt: 'verarbeitung/ki-zusammenfassung', feld: 'datensparsam' },
        hilfe: 'Datensparsam heisst: Das Modell sieht keinen Mailtext. Das Briefing wird dann knapper.' },
      F.wohin('privat'),
      F.thema('Post'),
    ],
    app: {
      id: 'mail-tagesbriefing', name: 'Mail-Tagesbriefing', icon: 'mail', kategorie: 'post', status: 'entwurf',
      ziel: 'Jeden Morgen meine Mails kurz an Telegram.',
      ausloeser: { art: 'zeitplan', regel: { typ: 'taeglich', uhrzeit: '07:00' } },
      schritte: [
        { baustein: 'quelle/imap', einstellungen: { anbieter: 'webde', ordner: 'INBOX', nurUngelesen: true } },
        { baustein: 'verarbeitung/ki-zusammenfassung', einstellungen: { format: 'tagesbriefing', fokus: '', sprache: 'de', laenge: 'kurz', datensparsam: false } },
        { baustein: 'ziel/telegram', einstellungen: { empfaenger: 'privat', thema: '' } },
      ],
    },
  },
  {
    vorlage: 'wichtige-mails', gruppe: 'post',
    titel: 'Wichtige Mails sofort melden',
    text: 'Prüft jede Stunde dein Postfach und meldet nur Mails von Absendern, die dir wichtig sind.',
    fragen: [
      F.anbieter(),
      { id: 'absender', frage: 'Von wem sind die wichtigen Mails?', typ: 'text', pflicht: true, vorgabe: '',
        beispiel: 'schule, chefin@…, steuerberater',
        hilfe: 'Adressen oder Namensteile, mit Komma getrennt. Die Liste bleibt auf deinem Rechner.',
        ziel: { schritt: 'filter/mails', feld: 'absender' } },
      { id: 'betreff', frage: 'Oder Wörter im Betreff?', typ: 'text', ki: true, vorgabe: '',
        beispiel: 'dringend, Frist, Termin',
        hilfe: 'Freiwillig. „KI fragen“ schlägt Wörter vor, an denen man wichtige Mails erkennt.',
        ziel: { schritt: 'filter/mails', feld: 'betreff' } },
      { id: 'stunden', frage: 'Wie oft prüfen?', typ: 'stunden', vorgabe: 1, ziel: { ausloeser: 'stunden' } },
    ],
    app: {
      id: 'wichtige-mails', name: 'Wichtige Mails', icon: 'mail', kategorie: 'post', status: 'entwurf',
      ziel: 'Mails von wichtigen Absendern sofort aufs Handy.',
      ausloeser: { art: 'zeitplan', regel: { typ: 'intervall', stunden: 1 } },
      schritte: [
        { baustein: 'quelle/imap', einstellungen: { anbieter: 'webde', ordner: 'INBOX', nurUngelesen: true } },
        { baustein: 'filter/mails', einstellungen: { absender: '', betreff: '', zeitraum: '24h' } },
        { baustein: 'verarbeitung/ki-zusammenfassung', einstellungen: { format: 'wichtig', fokus: '', sprache: 'de', laenge: 'kurz', datensparsam: true } },
        { baustein: 'ziel/telegram', einstellungen: { empfaenger: 'privat', thema: '' } },
      ],
    },
  },
  {
    vorlage: 'fristen', gruppe: 'post',
    titel: 'Fristen und Rechnungen aus Mails',
    text: 'Sammelt jeden Abend Rechnungen, Mahnungen und Termine aus den Mails der letzten Woche als Tabelle mit Frist und Betrag.',
    fragen: [
      F.anbieter(),
      { id: 'achten', frage: 'Worauf soll die KI besonders achten?', typ: 'text', ki: true, vorgabe: 'Fristen, Beträge, wer was bis wann braucht',
        hilfe: '„KI fragen“ ergänzt Dinge wie Kündigungsfristen, Abbuchungen oder Rückrufbitten.',
        ziel: { schritt: 'verarbeitung/ki-zusammenfassung', feld: 'fokus' } },
      F.uhrzeit('18:00'),
    ],
    app: {
      id: 'fristen', name: 'Fristen & Rechnungen', icon: 'kalender', kategorie: 'post', status: 'entwurf',
      ziel: 'Keine Frist und keine Rechnung mehr übersehen.',
      ausloeser: { art: 'zeitplan', regel: { typ: 'taeglich', uhrzeit: '18:00' } },
      schritte: [
        { baustein: 'quelle/imap', einstellungen: { anbieter: 'webde', ordner: 'INBOX', nurUngelesen: false } },
        { baustein: 'filter/mails', einstellungen: { absender: '', betreff: 'Rechnung, Frist, Mahnung, Termin, Zahlung', zeitraum: '7t' } },
        { baustein: 'verarbeitung/ki-zusammenfassung', einstellungen: { format: 'tabelle', fokus: '', sprache: 'de', laenge: 'mittel', datensparsam: false } },
        { baustein: 'ziel/datei', einstellungen: {} },
      ],
    },
  },

  // ---------------------------------------------------------------- Lernen & Erinnern
  {
    vorlage: 'lernkarte', gruppe: 'lernen',
    titel: 'Lernkarte des Tages',
    text: 'Zeigt jeden Tag drei Einträge aus deiner eigenen Liste, reihum.',
    fragen: [
      { id: 'eintraege', frage: 'Was willst du wiederholen?', typ: 'mehrzeilig', pflicht: true, ki: true,
        hilfe: 'Je Zeile ein Merksatz. „KI fragen“ schlägt eine Liste zu deinem Thema vor.',
        vorgabe: 'Ein Prompt hat Rolle, Ziel, Kontext und Format.\nModelle raten das nächste Wort – sie wissen nichts.\nBeispiele im Prompt wirken stärker als Regeln.\nKurze Sätze, klare Wörter.\nPrüfe jede Zahl, die ein Modell nennt.\nTemperatur steuert, wie mutig das Modell wählt.',
        ziel: { schritt: 'quelle/liste', feld: 'eintraege' } },
      { id: 'anzahl', frage: 'Wie viele am Tag?', typ: 'zahl', vorgabe: 3, ziel: { schritt: 'verarbeitung/tageskarte', feld: 'anzahl' } },
    ],
    app: {
      id: 'lernkarte', name: 'Lernkarte des Tages', icon: 'karte', kategorie: 'lernen', status: 'aktiv',
      ziel: 'Jeden Tag ein paar Merksätze wiederholen.',
      schritte: [
        { baustein: 'quelle/liste', einstellungen: { eintraege: 'Ein Prompt hat Rolle, Ziel, Kontext und Format.\nModelle raten das nächste Wort – sie wissen nichts.\nBeispiele im Prompt wirken stärker als Regeln.\nKurze Sätze, klare Wörter.\nPrüfe jede Zahl, die ein Modell nennt.\nTemperatur steuert, wie mutig das Modell wählt.' } },
        { baustein: 'verarbeitung/tageskarte', einstellungen: { anzahl: 3 } },
        { baustein: 'ziel/anzeige', einstellungen: {} },
      ],
    },
  },
  {
    vorlage: 'vokabeln', gruppe: 'lernen',
    titel: 'Vokabeln des Tages',
    text: 'Jeden Tag fünf Vokabeln aus deiner Liste, über die Woche kommt jede dran.',
    fragen: [
      { id: 'eintraege', frage: 'Welche Vokabeln?', typ: 'mehrzeilig', pflicht: true, ki: true,
        hilfe: 'Je Zeile ein Paar, zum Beispiel „reliable – zuverlässig“. „KI fragen“ stellt dir eine Liste zu Thema und Niveau zusammen.',
        vorgabe: 'reliable – zuverlässig\nto improve – verbessern\nevidence – Beleg, Nachweis\nto assume – annehmen\naccurate – genau\nto suggest – vorschlagen\nrequirement – Anforderung\nto rely on – sich verlassen auf\nsummary – Zusammenfassung\nto compare – vergleichen',
        ziel: { schritt: 'quelle/liste', feld: 'eintraege' } },
      { id: 'anzahl', frage: 'Wie viele am Tag?', typ: 'zahl', vorgabe: 5, ziel: { schritt: 'verarbeitung/tageskarte', feld: 'anzahl' } },
    ],
    app: {
      id: 'vokabeln', name: 'Vokabeln des Tages', icon: 'karte', kategorie: 'lernen', status: 'aktiv',
      ziel: 'Jeden Tag ein paar Vokabeln wiederholen.',
      schritte: [
        { baustein: 'quelle/liste', einstellungen: { eintraege: '' } },
        { baustein: 'verarbeitung/tageskarte', einstellungen: { anzahl: 5 } },
        { baustein: 'ziel/anzeige', einstellungen: {} },
      ],
    },
  },
  {
    vorlage: 'lernplan', gruppe: 'lernen',
    titel: 'Lernplan-Erinnerung aufs Handy',
    text: 'Jeden Nachmittag die nächsten zwei Aufgaben aus deinem Lernplan per Telegram.',
    fragen: [
      { id: 'aufgaben', frage: 'Was steht auf deinem Lernplan?', typ: 'mehrzeilig', pflicht: true, ki: true, vorgabe: '',
        beispiel: 'Kapitel 3 lesen\n10 Aufgaben Bruchrechnung\nVokabeln Unit 4',
        hilfe: 'Je Zeile eine Aufgabe. „KI fragen“ zerlegt ein grosses Ziel („Mathe-Klausur in drei Wochen“) in kleine Schritte.',
        ziel: { schritt: 'quelle/liste', feld: 'eintraege' } },
      F.uhrzeit('16:00'),
      { id: 'anzahl', frage: 'Wie viele Aufgaben am Tag?', typ: 'zahl', vorgabe: 2, ziel: { schritt: 'verarbeitung/tageskarte', feld: 'anzahl' } },
    ],
    app: {
      id: 'lernplan', name: 'Lernplan', icon: 'kalender', kategorie: 'lernen', status: 'entwurf',
      ziel: 'Jeden Tag wissen, was dran ist.',
      ausloeser: { art: 'zeitplan', regel: { typ: 'taeglich', uhrzeit: '16:00' } },
      schritte: [
        { baustein: 'quelle/liste', einstellungen: { eintraege: '' } },
        { baustein: 'verarbeitung/tageskarte', einstellungen: { anzahl: 2 } },
        { baustein: 'ziel/telegram', einstellungen: { empfaenger: 'privat', thema: '' } },
      ],
    },
  },
  {
    vorlage: 'gedanke', gruppe: 'lernen',
    titel: 'Gedanke zum Start',
    text: 'Bei jedem Werkstatt-Start ein Gedanke aus deiner Sammlung.',
    fragen: [
      { id: 'eintraege', frage: 'Deine Sammlung', typ: 'mehrzeilig', pflicht: true, ki: true,
        hilfe: 'Je Zeile ein Gedanke oder Zitat. „KI fragen“ schlägt Gedanken zu einem Thema vor.',
        vorgabe: 'Erkenne dich selbst. (Inschrift in Delphi)\nNicht weil es schwer ist, wagen wir es nicht; weil wir es nicht wagen, ist es schwer. (Seneca)\nDer Anfang ist die Hälfte des Ganzen. (Aristoteles)\nÜbung ist alles. (Periander)\nWer fragt, lernt.',
        ziel: { schritt: 'quelle/liste', feld: 'eintraege' } },
    ],
    app: {
      id: 'gedanke', name: 'Gedanke zum Start', icon: 'funke', kategorie: 'lernen', status: 'aktiv',
      ziel: 'Ein guter Gedanke zu Beginn.',
      ausloeser: { art: 'start' },
      schritte: [
        { baustein: 'quelle/liste', einstellungen: { eintraege: '' } },
        { baustein: 'verarbeitung/tageskarte', einstellungen: { anzahl: 1 } },
        { baustein: 'ziel/anzeige', einstellungen: {} },
      ],
    },
  },

  // ---------------------------------------------------------------- Dateien & Ordner
  {
    vorlage: 'downloads-ueberblick', gruppe: 'dateien',
    titel: 'Downloads im Überblick',
    text: 'Listet die neuesten Dateien im Download-Ordner als Tabelle, mit Übersicht nach Dateityp.',
    app: {
      id: 'downloads-ueberblick', name: 'Downloads im Überblick', icon: 'ordner', kategorie: 'dateien', status: 'aktiv',
      ziel: 'Zeig mir, was zuletzt im Download-Ordner gelandet ist.',
      schritte: [
        { baustein: 'quelle/ordner', einstellungen: { ordner: 'downloads', nurNeue: false } },
        { baustein: 'filter/dateien', einstellungen: { endungen: '', hoechstens: 40 } },
        { baustein: 'verarbeitung/tabelle', einstellungen: { gruppieren: true } },
        { baustein: 'ziel/anzeige', einstellungen: {} },
      ],
    },
  },
  {
    vorlage: 'speicherfresser', gruppe: 'dateien',
    titel: 'Speicherfresser finden',
    text: 'Zeigt die grössten Dateien in einem Ordner, damit du weisst, was Platz kostet.',
    fragen: [
      F.ordner('downloads'),
      { id: 'mb', frage: 'Ab welcher Grösse (MB)?', typ: 'zahl', vorgabe: 100, ziel: { schritt: 'filter/dateien', feld: 'mindestMb' },
        hilfe: 'Kleinere Dateien bleiben aussen vor. 100 MB findet Videos, Installationsdateien und Archive.' },
    ],
    app: {
      id: 'speicherfresser', name: 'Speicherfresser', icon: 'ordner', kategorie: 'dateien', status: 'aktiv',
      ziel: 'Sehen, welche Dateien am meisten Platz brauchen.',
      schritte: [
        { baustein: 'quelle/ordner', einstellungen: { ordner: 'downloads', nurNeue: false } },
        { baustein: 'filter/dateien', einstellungen: { endungen: '', hoechstens: 30, mindestMb: 100, reihenfolge: 'groesste' } },
        { baustein: 'verarbeitung/tabelle', einstellungen: { gruppieren: true } },
        { baustein: 'ziel/anzeige', einstellungen: {} },
      ],
    },
  },
  {
    vorlage: 'neue-bilder', gruppe: 'dateien',
    titel: 'Neue Bilder sammeln',
    text: 'Listet Bilder, die seit dem letzten Lauf dazugekommen sind, und legt die Liste als Datei ab.',
    fragen: [F.ordner('downloads')],
    app: {
      id: 'neue-bilder', name: 'Neue Bilder', icon: 'datei', kategorie: 'dateien', status: 'aktiv',
      ziel: 'Neue Bilder an einem Ort auflisten.',
      schritte: [
        { baustein: 'quelle/ordner', einstellungen: { ordner: 'downloads', nurNeue: true } },
        { baustein: 'filter/dateien', einstellungen: { endungen: 'jpg, jpeg, png, webp, heic, gif', hoechstens: 200, mindestMb: 0, reihenfolge: 'neueste' } },
        { baustein: 'verarbeitung/tabelle', einstellungen: { gruppieren: true } },
        { baustein: 'ziel/datei', einstellungen: {} },
      ],
    },
  },
  {
    vorlage: 'pdf-sammler', gruppe: 'dateien',
    titel: 'PDFs aus Dokumenten sammeln',
    text: 'Sammelt neue PDFs aus „Dokumente“ und schreibt die Liste als Markdown-Datei.',
    app: {
      id: 'pdf-sammler', name: 'PDF-Sammler', icon: 'datei', kategorie: 'dateien', status: 'aktiv',
      ziel: 'Neue PDFs in meinen Dokumenten als Liste ablegen.',
      schritte: [
        { baustein: 'quelle/ordner', einstellungen: { ordner: 'dokumente', nurNeue: true } },
        { baustein: 'filter/dateien', einstellungen: { endungen: 'pdf', hoechstens: 100 } },
        { baustein: 'verarbeitung/tabelle', einstellungen: { gruppieren: false } },
        { baustein: 'ziel/datei', einstellungen: {} },
      ],
    },
  },
  {
    vorlage: 'import-eingang', gruppe: 'dateien',
    titel: 'Neues im Secondbrain-Eingang',
    text: 'Zeigt beim Werkstatt-Start, was neu in deinem Ordner 50_Import liegt.',
    app: {
      id: 'import-eingang', name: 'Import-Eingang', icon: 'ordner', kategorie: 'dateien', status: 'aktiv',
      ziel: 'Beim Start sehen, was neu im Eingang liegt.',
      ausloeser: { art: 'start' },
      schritte: [
        { baustein: 'quelle/ordner', einstellungen: { ordner: 'import', nurNeue: true } },
        { baustein: 'verarbeitung/tabelle', einstellungen: { gruppieren: false } },
        { baustein: 'ziel/anzeige', einstellungen: {} },
      ],
    },
  },

  // ---------------------------------------------------------------- Beobachten
  {
    vorlage: 'webseite-neu', gruppe: 'beobachten',
    titel: 'Webseite auf Neuigkeiten prüfen',
    text: 'Schaut jeden Morgen auf eine Seite (Schule, Verein, Behörde) und meldet nur, was sich wirklich geändert hat.',
    fragen: [
      { id: 'adresse', frage: 'Welche Seite?', typ: 'text', pflicht: true, vorgabe: '', beispiel: 'https://…',
        hilfe: 'Die Adresse mit https:// am Anfang.', ziel: { schritt: 'quelle/web', feld: 'adresse' } },
      { id: 'achten', frage: 'Worauf soll sie achten?', typ: 'text', ki: true, vorgabe: '',
        beispiel: 'neue Termine, Ausfälle, Anmeldefristen',
        hilfe: 'Leer heisst: jede Änderung. „KI fragen“ hilft, Unwichtiges wie Datum oder Werbung auszuschliessen.',
        ziel: { schritt: 'quelle/web', feld: 'achten' } },
      F.uhrzeit('08:00'),
      F.wohin('privat'),
      F.thema('Neuigkeiten'),
    ],
    app: {
      id: 'webseite-neu', name: 'Seitenwächter', icon: 'web', kategorie: 'beobachten', status: 'entwurf',
      ziel: 'Melden, wenn sich auf der Seite etwas Wichtiges ändert.',
      ausloeser: { art: 'zeitplan', regel: { typ: 'taeglich', uhrzeit: '08:00' } },
      schritte: [
        { baustein: 'quelle/web', einstellungen: { adresse: '', achten: '' } },
        { baustein: 'verarbeitung/ki-zusammenfassung', einstellungen: { format: 'wichtig', fokus: '', sprache: 'de', laenge: 'kurz', datensparsam: false } },
        { baustein: 'ziel/telegram', einstellungen: { empfaenger: 'privat', thema: '' } },
      ],
    },
  },
];

/**
 * Was der Fragebogen vorschlägt, steht auch in der Strecke: So legt
 * „Aus Vorlage“ ohne Fragebogen (Route `vorlage`) dieselbe App an.
 */
for (const v of VORLAGEN) {
  for (const f of v.fragen || []) {
    if (!f.ziel?.schritt || f.vorgabe === '' || f.vorgabe === undefined) continue;
    const s = v.app.schritte.find((x) => x.baustein === f.ziel.schritt);
    if (s && (s.einstellungen[f.ziel.feld] === '' || s.einstellungen[f.ziel.feld] === undefined)) s.einstellungen[f.ziel.feld] = f.vorgabe;
  }
}

export function vorlage(name) {
  return VORLAGEN.find((v) => v.vorlage === name) || null;
}

/** Das Feld eines Bausteins (gebaut oder später), auf das eine Frage zielt. */
export function zielFeld(f) {
  if (!f?.ziel?.schritt) return null;
  const b = baustein(f.ziel.schritt) || folgt(f.ziel.schritt);
  return b?.felder?.find((x) => x.name === f.ziel.feld) || null;
}

/** Die Fragen einer Vorlage für die Oberfläche: Wahlwerte aus dem Feld, Länge aus dem Feld. */
export function fragenAufloesen(v) {
  return (v.fragen || []).map((f) => {
    const feld = zielFeld(f);
    const aus = { ...f };
    if (f.typ === 'wahl' && !f.werte && feld?.werte) aus.werte = feld.werte.map((w) => ({ wert: w, wort: feld.worte?.[w] || w }));
    if (feld?.laenge) aus.laenge = feld.laenge;
    if (!aus.hilfe && feld?.hilfe) aus.hilfe = feld.hilfe;
    return aus;
  });
}
