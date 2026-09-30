/**
 * PROMPTHEUS Werkstatt — deutsche Texte des Namensraums `agent-preset`.
 *
 * Quelle: `packages/client/ui-agent-preset/src/client/locales.ts` **und**
 * `guide-locales.ts` (Fassung 0.2.0-rc.2), zusammen **60 Texte**.
 *
 * **Zwei Dateien, ein Namensraum.** Die kurze Auswahlliste steht in
 * `locales.ts`, die ausführliche Anleitung in `guide-locales.ts`. Beide melden
 * denselben Namensraum an; die Anleitung wird in die Liste hineingespreizt
 * (`...guideZh`). Deshalb liegen hier beide zusammen.
 *
 * **Die langen Anleitungstexte** sind Markdown: Überschriften (`###`),
 * Aufzählungen und Beispielaufträge (`> …`). Die Auszeichnung bleibt erhalten —
 * die Oberfläche stellt sie als Text dar.
 *
 * **„Preset" heisst hier „Voreinstellung"**, weil es die Zusammensetzung
 * beschreibt, mit der ein Chat läuft. Die drei mitgelieferten heissen
 * **Standardmodus**, **PTC-Modus**, **Minimalmodus** und **Schaffensmodus**.
 */

/** Die Voreinstellungen des Agenten (`agent-preset`). 60 Texte. */
export const voreinstellungen: Record<string, string> = {
  // ── Die Anleitung: Rahmen ──────────────────────────────────────────────────
  modeExplanation: 'Erklärung des Modus',
  howToUse: 'So gehst du vor',
  guideSections: 'Inhalt der Anleitung',
  guideExampleTask: 'Beispielauftrag',
  guideCopy: 'Kopieren',
  guideCopied: 'Kopiert',
  guideFootnotes: 'Fussnoten',

  // ── Standardmodus ──────────────────────────────────────────────────────────
  guideStandardIntro: 'Wähle beim Anlegen eines Auftrags den **Standardmodus** und beschreibe, was erreicht werden soll, wo die betroffenen Dateien liegen und woran man erkennt, dass es fertig ist.',
  guideStandardExplanation: [
    '### Wie er arbeitet',
    'Der Agent ruft Werkzeuge unmittelbar auf, um Dateien zu lesen und zu ändern, zu suchen und Befehle im Terminal auszuführen. Enthalten sind Fertigkeiten, Pläne, Ziele, Unteragenten, Arbeitsabläufe und das Verdichten des Kontexts.',
    '### Wann du ihn wählst',
    'Für gewöhnliches Programmieren, Dateiarbeit und das Ordnen von Material ist er der Anfang. Der Standardmodus kann auch Skripte schreiben und Dateien stapelweise verarbeiten; PTC ändert nur die Art der Werkzeugaufrufe und ist für Stapelarbeit nicht nötig.',
  ].join('\n\n'),
  guideStandardUsage: [
    '### Einen Fehler beheben',
    '> Beim zweiten Absenden des Suchformulars verschwinden die Ergebnisse. Finde die Ursache, behebe sie, lass die betroffenen Prüfungen laufen und erkläre zum Schluss die Ursache und was du geändert hast.',
    'Erwartetes Ergebnis: eine Codeänderung, die Ergebnisse der betroffenen Prüfungen und eine Erklärung der Ursache.',
    '### Projektnotizen ordnen',
    '> Lies die Markdown-Aufzeichnungen dieses Projekts. Fasse die getroffenen Entscheidungen und die noch offenen Fragen zusammen, jeweils mit Verweis auf die Datei.',
    'Erwartetes Ergebnis: eine Zusammenfassung mit Quellenangaben, die sich am Original nachprüfen lässt.',
  ].join('\n\n'),

  // ── PTC-Modus ──────────────────────────────────────────────────────────────
  guidePtcIntro: 'Wähle beim Anlegen eines Auftrags den **PTC-Modus** und nenne die Eingabedateien, die Verarbeitungsregeln und das Ausgabeformat. Den Code schreibt der Agent.',
  guidePtcExplanation: [
    '### Wie Werkzeuge aufgerufen werden',
    'PTC heisst *Programmatic Tool Calling* — Werkzeuge werden aus einem Programm heraus aufgerufen. In dieser mitgelieferten Voreinstellung schreibt der Agent mit `run_code` ein TypeScript-Programm, das die Werkzeuge über ein erzeugtes SDK aufruft. Das Programm darf Schleifen, Bedingungen, Fehlerbehandlung und gleichzeitige Aufrufe benutzen.',
    '### Was beim Modell ankommt',
    'Die Ergebnisse der Werkzeuge gehen zuerst an das Programm, das sie filtern, berechnen und zusammenfassen kann. Das Modell bekommt, was das Programm ausgibt oder zurückgibt; Bilder werden getrennt angehängt. Aufrufe aus dem Programm werden weiterhin aufgezeichnet und bleiben an die Werkzeugrechte gebunden.',
    '### Der Unterschied zum Standardmodus',
    'Beide Modi können programmieren und Dateien stapelweise verarbeiten. Der Standardmodus stellt dem Modell die einzelnen Werkzeuge bereit; PTC lässt es die Aufrufe in Code ordnen. Die PTC-Voreinstellung hat das Arbeitsablauf-Werkzeug abgeschaltet. Geschwindigkeit und Tokenverbrauch hängen vom Auftrag und von der Art ab, wie das Programm seine Ergebnisse behandelt.',
  ].join('\n\n'),
  guidePtcUsage: [
    '### Einstellungsdateien stapelweise prüfen',
    '> Prüfe alle JSON-Dateien unter configs/ und finde anhand von schema.json fehlende Pflichtfelder und ungültige Werte. Schreibe je Problem eine Zeile in eine CSV-Datei. Nimm Dateien, die sich nicht lesen lassen, in den Bericht auf und prüfe die übrigen weiter. Die Originale bleiben unverändert.',
    'Erwartetes Ergebnis: eine Übersicht der Probleme und ein CSV-Bericht. Das Programm kann dieselben Prüfungen auf viele Dateien anwenden, einzelne Fehlschläge verkraften und die Ergebnisse sammeln.',
    '### Fehlerprotokolle zusammenfassen',
    '> Werte die Protokolle unter logs/ aus und zähle die Fehler nach Dienst und Art. Zeige die zehn häufigsten Gruppen mit je einem Beispiel. Die vollständige Zählung kommt in eine CSV-Datei.',
    'Erwartetes Ergebnis: die häufigsten Fehlergruppen und eine vollständige Zählung. Zwischenergebnisse kann das Programm sammeln, bevor die Zusammenfassung beim Modell ankommt.',
  ].join('\n\n'),

  // ── Minimalmodus ───────────────────────────────────────────────────────────
  guideMinimalIntro: 'Wähle beim Anlegen eines Auftrags den **Minimalmodus**. Für einen Vergleich halte Modell, Rechte, Eingabe und den Anfangszustand des Arbeitsbereichs über alle Läufe gleich.',
  guideMinimalExplanation: [
    '### Was enthalten ist',
    'Es gibt nur ein dauerhaftes Shell-Werkzeug und eine feste Systemanweisung. Die Voreinstellung lädt keine Fertigkeiten, Pläne und kein Verdichten des Kontexts und reicht auch den üblichen Laufzeitkontext nicht hinein.',
    '### Wann du ihn wählst',
    'Er taugt als Grundlinie für Versuche und Vergleiche. Der Agent kann über Terminalbefehle weiterhin Dateien lesen und schreiben und Skripte laufen lassen, entbehrt aber der eingebauten Hilfen für lange Aufträge. Weniger Werkzeuge heisst nicht, dass es für Anfänger leichter wäre.',
  ].join('\n\n'),
  guideMinimalUsage: [
    '### Die Grundfähigkeit beim Beheben vergleichen',
    '> Lass die Prüfungen dieses Projekts laufen, finde die Ursache des Fehlschlags, behebe ihn so knapp wie möglich, lass die betroffenen Prüfungen erneut laufen und berichte das Ergebnis.',
    'Führe denselben Auftrag einmal im Standardmodus und einmal im Minimalmodus aus, jeweils vom gleichen Zustand des Arbeitsbereichs, und vergleiche Ergebnis, Werkzeugaufrufe und die Änderungen. Der Minimalmodus erledigt das über Terminalbefehle.',
  ].join('\n\n'),

  // ── Schaffensmodus ─────────────────────────────────────────────────────────
  guideCordisIntro: 'Wähle beim Anlegen eines Auftrags den **Schaffensmodus** und beschreibe, welche Fähigkeit dazukommen soll, von wo aus sie benutzt wird und woran sich die Wirkung prüfen lässt.',
  guideCordisExplanation: [
    '### Was sich schaffen lässt',
    'Der Schaffensmodus hat die Werkzeuge des Standardmodus und zusätzlich das Prüfen der Laufzeit, das dauerhafte Verwalten von Erweiterungen sowie Anleitungen zum Schreiben von Cordis-Erweiterungen und Agenten-Voreinstellungen. Du kannst Erweiterungen schreiben, die Funktionen oder Oberflächen hinzufügen, und Werkzeuge samt Anweisungen zu eigenen Modi zusammenstellen.',
    '### Erweiterung und Modus',
    'Eine **Erweiterung** gibt dem DSH neue Fähigkeiten, etwa Werkzeuge, Verbindungen zu Diensten oder Einstiege in der Oberfläche. Ein **Modus** ist eine Agenten-Voreinstellung: sie wählt die Werkzeuge, die einem Auftrag zur Verfügung stehen, und legt fest, wie der Agent arbeitet. In einem eigenen Modus lassen sich auch selbst geschriebene Erweiterungen benutzen.',
    '### Wie das Ergebnis wirkt',
    'Du kannst den Agenten bitten, die Einrichtung abzuschliessen und die Wirkung nachzuprüfen. Eine Erweiterung lädt manchmal sofort, manchmal erst nach einem Neustart — je nach Änderung. Ein neu angelegter Modus wird beim Anlegen eines Auftrags gewählt.',
  ].join('\n\n'),
  guideCordisUsage: [
    '### Eine Oberfläche hinzufügen',
    '> Schreib mir eine DSH-Erweiterung, die in der Seitenleiste einen Einstieg „Projektnotizen" hinzufügt. Sie soll die Markdown-Dateien des Arbeitsbereichs auflisten und beim Anklicken den Inhalt zeigen. Schliesse die Einrichtung ab und prüfe, dass die Seite sich öffnet.',
    'Erwartetes Ergebnis: die Erweiterung mit dem Einstieg und der Ansicht, dazu die noch nötigen Schritte, bis sie wirkt.',
    '### Ein Werkzeug hinzufügen',
    '> Schreib eine Erweiterung, die den Testbericht des Projekts liest und die gescheiterten Fälle zusammenfasst. Melde das Werkzeug an und prüfe den Aufruf an einem Beispielbericht.',
    'Erwartetes Ergebnis: ein aufrufbares Werkzeug und das Ergebnis eines Beispielaufrufs.',
    '### Einen eigenen Modus anlegen',
    '> Leg auf Grundlage des Standardmodus einen Modus „Codeprüfung" an, der zuerst nach möglichen Fehlern und Lücken in den Prüfungen sucht, Datei und Zeile nennt und mich vor jeder Änderung fragt. Speichere ihn als wählbare Voreinstellung.',
    'Erwartetes Ergebnis: eine eigene Voreinstellung, die sich beim Anlegen eines Auftrags wählen lässt. Die Prüfanforderungen leiten den Agenten; was er wirklich darf, entscheiden weiterhin die Zugriffsrechte.',
  ].join('\n\n'),

  // ── Die Auswahlliste ───────────────────────────────────────────────────────
  builtInGroup: 'Mitgeliefert',
  customGroup: 'Eigene',
  sectionIntro: 'Wähle, welche Werkzeuge und welche Arbeitsweise der Agent hat. Für den Alltag der **Standardmodus**, zum Erweitern des DSH der **Schaffensmodus**.',
  seatHint: 'Die Voreinstellung für den Auftrag, den du beginnen willst',
  headerHint: 'Die Voreinstellung dieses Auftrags; sie steht seit seinem Beginn fest',
  nav: 'Agenten-Voreinstellungen',
  setDefault: 'Als Vorgabe für neue Aufträge',
  view: 'Zusammensetzung ansehen',
  presetStandardName: 'Standardmodus',
  presetStandardDescription: 'Für Code, Dateien und Material — für die meisten Aufträge passend. Der Agent benutzt Suche, Bearbeitung und Terminal nach Bedarf.',
  presetPtcName: 'PTC-Modus',
  presetPtcDescription: 'Kann alles, was der Standardmodus kann, eignet sich aber besser für viele Werkzeugaufrufe und für Aufträge, bei denen Ergebnisse gefiltert, geordnet, entdoppelt, gezählt oder zusammengefasst werden.',
  presetMinimalName: 'Minimalmodus',
  presetMinimalDescription: 'Der Agent arbeitet allein mit dem Terminalwerkzeug. Geeignet für Versuche und Vergleiche seiner Grundfähigkeit.',
  presetCordisName: 'Schaffensmodus',
  presetCordisDescription: 'Den DSH im Gespräch umbauen: der Agent schreibt Erweiterungen, die neue Funktionen oder Oberflächen hinzufügen; ebenso lassen sich Werkzeuge und Anweisungen zu eigenen Modi zusammenstellen.',
  inUse: 'Vorgabe für neue Aufträge',
  noDescription: 'Noch keine Beschreibung.',
  brokenBadge: 'Liess sich nicht laden',
  switchRefused: 'Der Wechsel zu „{name}" geht nicht: {reason}',
  close: 'Schliessen',
  creatorDraft: 'Den Agenten eine Voreinstellung entwerfen lassen',
}
