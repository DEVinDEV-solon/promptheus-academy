/**
 * Die acht Namensräume der Dokumentvorschau.
 *
 * **Warum sie eine eigene Datei haben.** Die Dokumentvorschau meldet ihre acht
 * Namensräume über eigene Dateien an (`sidebarCodePreview`, `sidebarExcel`,
 * `documentHtml`, `sidebarImage`, `documentMarkdown`, `sidebarOffice`,
 * `sidebarPdf` und den Rahmen `sidebarDocumentPreview`) — nicht über eine
 * gemeinsame. Solange die Namensraum-Tabelle von Hand geführt wurde, fehlten
 * sie darin; die Prüfung meldete trotzdem Erfolg, weil sie nur die Namensräume
 * verglich, die in der Tabelle standen. Seit `werkzeuge/namensraeume.mjs` die
 * Tabelle aus dem Harness LIEST, kann das nicht mehr vorkommen.
 *
 * Sie liegen zusammen in einer Datei, weil sie zusammengehören: es sind die
 * Meldungen EINES Fensters — „Rendern läuft", „das ging nicht", „das ist zu
 * gross". Getrennt nach Dokumentart wären es acht Dateien mit je drei Zeilen.
 *
 * BRAND.md §8: deutsch, `ss` statt `ß`, Duzform, kein Ausrufezeichen, keine
 * Superlative, und **jede Fehlermeldung nennt einen Weg**.
 */

/**
 * Der Rahmen der Dokumentvorschau — Titelzeile, Werkzeugleiste, Fehlerfälle.
 *
 * **Die Schlüssel sind hier NICHT geraten.** Eine erste Fassung hatte
 * `zoom.in`, `tab.close` und ähnliche erfunden; die wirklichen Namen stehen in
 * `ui-sidebar-documentpreview/src/client/locales.ts` und lauten `zoomIn`,
 * `reloadNow`, `error.notFound`. Geratene Schlüssel fallen nicht auf: das
 * Wörterbuch wird angenommen, und an der Stelle erscheint der Schlüssel selbst
 * als Text. Deshalb steht hier, was wirklich dort steht — geprüft von
 * `werkzeuge/woerter_pruefen.mjs`.
 */
export const dokumentrahmen = {
  loading: 'Dokument wird dargestellt …',
  loadMore: 'Mehr laden',
  changed: 'Die Datei hat sich geändert; angezeigt wird der vorige Inhalt.',
  reloadNow: 'Neu laden',
  reload: 'Die Datei erneut lesen',
  autoRefresh: 'Selbsttätig auffrischen',
  'autoRefresh.enable': 'Selbsttätiges Auffrischen einschalten',
  'autoRefresh.disable': 'Selbsttätiges Auffrischen ausschalten',
  'wrap.enable': 'Zeilenumbruch einschalten',
  'wrap.disable': 'Zeilenumbruch ausschalten',
  'wrap.aria': 'Zeilenumbruch',
  openWith: 'Öffnen mit',
  'viewer.text': 'Reiner Text',
  resourceUnavailable: 'Der Dateidienst steht nicht zur Verfügung.',
  rendererUnavailable: 'Die Vorschau für {name} steht nicht zur Verfügung.',
  unsupportedFile: 'Für diesen Dateityp gibt es noch keine Vorschau.',
  'error.notFound': 'Datei nicht gefunden. Sie wurde vielleicht verschoben oder gelöscht.',
  'error.tooLarge': 'Diese Seite überschreitet die Grenze von {limit} und lässt sich nicht '
    + 'lesen.',
  'error.notText': 'Für diesen Dateityp gibt es noch keine Vorschau.',
  'error.notRegularFile': 'Keine gewöhnliche Datei — es gibt nichts anzuzeigen.',
  'error.unavailable': 'Lesen fehlgeschlagen: {message}',
  retry: 'Erneut versuchen',
}

/**
 * Die Zoom-Bedienung.
 *
 * Diese sechs Texte stehen im Harness in `zoom/locales.ts` und werden in die
 * Wörterbücher der einzelnen Vorschauen HINEINGESPREIZT (`...zoomEn`) — sie
 * gehören also zu mehreren Namensräumen gleichzeitig. Hier stehen sie einmal,
 * und die Anmeldung legt sie in jeden davon.
 */
export const zoomtexte = {
  zoomControls: 'Zoom-Bedienung',
  zoomMenu: 'Zoom wählen',
  zoomOut: 'Verkleinern',
  zoomIn: 'Vergrössern',
  zoomFitWidth: 'An Breite anpassen',
  zoomValue: '{percent} %',
}

/** Die Codevorschau. */
export const codevorschau = {
  title: 'Quelltext',
  copy: 'Kopieren',
  copied: 'Kopiert',
}

/**
 * Die Tabellenvorschau.
 *
 * **Kein Zoom.** Anders als Bild und PDF spreizt die Tabelle `zoomZh` NICHT
 * hinein — sie hat ihre eigenen fünfzehn Texte und keine Zoom-Bedienung. Eine
 * erste Fassung hatte die Zoomtexte trotzdem eingetragen; das Werkzeug meldete
 * sie zu Recht als überzählig.
 */
export const tabellenvorschau = {
  title: 'Tabelle',
  // Wird an den Tabellenleser durchgereicht: `de` wählt dort die Zahlen- und
  // Datumsformate. Der Harness schreibt hier sonst seine eigene Sprache hinein.
  language: 'de',
  loading: 'Dokument wird dargestellt …',
  invalid: 'Diese Tabelle liess sich nicht öffnen. Prüfe das Dateiformat, den Inhalt '
    + 'oder den Passwortschutz.',
  tooLarge: 'Diese Tabelle überschreitet die Grösse für die Vorschau.',
  timeout: 'Das Öffnen dieser Tabelle hat zu lange gedauert. Versuche es mit einer '
    + 'kleineren Datei.',
  encoding: 'Diese Textkodierung liess sich nicht lesen. Speichere die Datei als UTF-8 '
    + 'oder als UTF-16 mit BOM und versuche es erneut.',
  formulaWarning: 'Diese Arbeitsmappe enthält Formeln. Angezeigte Ergebnisse können '
    + 'fehlen oder ungenau sein.',
  unsupportedNotice: 'Diese Vorschau unterstützt {features} in dieser Arbeitsmappe nicht. '
    + 'Öffne sie in einer Systemanwendung für den vollen Umfang.',
  charts: 'Diagramme',
  images: 'Bilder',
  shapes: 'Formen',
  conditionalFormatting: 'bedingte Formatierung',
  // Die Aufzählung in `unsupportedNotice` braucht ein Trennzeichen, das zur
  // Sprache passt. Im Chinesischen ist es `、`, im Englischen `, `.
  featureSeparator: ', ',
  retry: 'Erneut versuchen',
}

/** Die HTML-Vorschau. */
export const htmlvorschau = {
  title: 'HTML',
  frame: 'HTML-Dokumentvorschau',
  loading: 'Dokument wird dargestellt …',
  failed: 'Dieses HTML-Dokument liess sich nicht darstellen.',
}

/** Die Bildvorschau. */
export const bildvorschau = {
  ...zoomtexte,
  title: 'Bild',
  preview: 'Bildvorschau: {name}',
  loading: 'Dokument wird dargestellt …',
  failed: 'Dieses Bild liess sich nicht anzeigen.',
  unsupported: 'Die Bildvorschau braucht den vollständigen Dateiinhalt.',
}

/** Die Markdown-Vorschau. */
export const markdownvorschau = {
  'viewer.label': 'Markdown',
  'code.copy': 'Kopieren',
  'code.copied': 'Kopiert',
  'footnotes': 'Fussnoten',
}

/** Die Office-Vorschau. */
export const officevorschau = {
  title: 'Office-Dokument',
  loading: 'Dokument wird dargestellt …',
  retry: 'Erneut versuchen',
  viewMissingFonts: 'Fehlende Schriften: {count}. Zum Ansehen drücken.',
  missingFontsTitle: 'Fehlende Schriften',
  missingFontsDescription: 'Diese Schriften stehen für die Vorschau nicht zur Verfügung. '
    + 'Text und Satz können vom Original abweichen.',
  missingFontsCount: 'Schriften: {count}',
  closeDetails: 'Schriftangaben schliessen',
  unavailable: 'Die Office-Vorschau steht nicht zur Verfügung. Aktiviere den '
    + 'Dokumentvorschau-Dienst auf dem Rechner, auf dem DeepSeek Harness läuft.',
  invalid: 'Diese Office-Datei liess sich nicht darstellen. Sie kann beschädigt oder '
    + 'passwortgeschützt sein, oder die Endung passt nicht zum Inhalt.',
  tooLarge: 'Die Office-Datei oder das umgewandelte PDF überschreitet die Grösse für die '
    + 'Vorschau. Verkleinere die Datei oder passe die Vorschau-Einstellung an.',
  failed: 'Die Umwandlung hat kein brauchbares PDF ergeben. Prüfe die Datei und versuche '
    + 'es erneut.',
  timeout: 'Die Umwandlung hat zu lange gedauert. Versuche es erneut.',
  busy: 'Die Office-Vorschau ist gerade ausgelastet. Versuche es gleich noch einmal.',
  changed: 'Die Datei wurde während des Lesens geändert. Öffne die Vorschau erneut.',
}

/** Die PDF-Vorschau. */
export const pdfvorschau = {
  ...zoomtexte,
  title: 'PDF',
  pageImage: 'PDF-Seite {page}',
  loading: 'Dokument wird dargestellt …',
  rendering: 'Seite wird gezeichnet …',
  failed: 'Das PDF liess sich nicht anzeigen: {message}',
  password: 'Dieses PDF ist passwortgeschützt. Geschützte Vorschauen werden nicht '
    + 'unterstützt.',
  workerFailed: 'Der Zeichenvorgang des PDF konnte nicht fortgesetzt werden. Versuche es '
    + 'erneut.',
  unsupported: 'Die PDF-Vorschau braucht den vollständigen Dateiinhalt.',
  retry: 'Erneut versuchen',
}
