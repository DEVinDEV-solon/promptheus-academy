/**
 * Vorlagen für „Aus Vorlage“ (Masterplan Workflow-Modalseite, Kapitel 11).
 *
 * Ohne Geheimnisse. Was einen Baustein aus Phase C braucht (Mail, Telegram),
 * entsteht als Entwurf und zeigt auf der App-Seite, was noch fehlt.
 *
 * @module @promptheus/dsh-plugin-workflows/apps/vorlagen
 */

export const VORLAGEN = [
  {
    vorlage: 'downloads-ueberblick',
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
    vorlage: 'pdf-sammler',
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
    vorlage: 'lernkarte',
    titel: 'Lernkarte des Tages',
    text: 'Zeigt jeden Tag drei Einträge aus deiner eigenen Liste, reihum.',
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
    vorlage: 'mail-tagesbriefing',
    titel: 'Mail-Tagesbriefing (Entwurf)',
    text: 'Jeden Morgen die neuen Mails kurz zusammengefasst an Telegram. Läuft ab Phase C.',
    app: {
      id: 'mail-tagesbriefing', name: 'Mail-Tagesbriefing', icon: 'mail', kategorie: 'post', status: 'entwurf',
      ziel: 'Jeden Morgen meine Mails kurz an Telegram.',
      ausloeser: { art: 'zeitplan', regel: { typ: 'taeglich', uhrzeit: '07:00' } },
      schritte: [
        { baustein: 'quelle/imap', einstellungen: { anbieter: 'webde', ordner: 'INBOX' } },
        { baustein: 'verarbeitung/ki-zusammenfassung', einstellungen: { format: 'tagesbriefing' } },
        { baustein: 'ziel/telegram', einstellungen: {} },
      ],
    },
  },
];

export function vorlage(name) {
  return VORLAGEN.find((v) => v.vorlage === name) || null;
}
