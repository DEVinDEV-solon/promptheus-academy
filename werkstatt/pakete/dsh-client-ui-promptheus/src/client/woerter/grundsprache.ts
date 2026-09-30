/**
 * Die vier Namensräume, die noch fehlten.
 *
 * **Warum sie eine eigene Datei haben.** Als die Namensraum-Tabelle noch von
 * Hand geführt wurde, fehlten diese vier ganz — und niemand merkte es, weil die
 * Prüfung nur die Namensräume verglich, die in der Tabelle standen. Seit
 * `werkzeuge/namensraeume.mjs` die Tabelle aus dem Harness liest, sind sie
 * sichtbar geworden:
 *
 *   * `common` — die gemeinsame Grundsprache des Harness: OK, Abbrechen,
 *     Speichern, Suchen. 41 Texte, die an vielen Stellen auftauchen.
 *   * `settings.locale` — die Zeile „Sprache" in den Einstellungen.
 *   * `shortcuts.layout` — die Beschriftung des Befehls, der die linke Spalte
 *     umschaltet.
 *   * `settings.models` — das ganze Fenster „Modelle": Anbieter hinzufügen,
 *     Schlüssel eintragen, Modelle holen. Der größte der vier.
 *
 * BRAND.md §8: deutsch, `ss` statt `ß`, Duzform, kein Ausrufezeichen, keine
 * Superlative, und **jede Fehlermeldung nennt einen Weg**.
 */

/**
 * Die gemeinsame Grundsprache (`common`).
 *
 * Diese 41 Texte liegen nicht in einem Fenster, sondern überall: in Schaltflächen,
 * in Kontextmenüs, in Ladeanzeigen. Ein Fehler hier fällt sofort auf.
 */
export const gemeinsameSprache = {
  ok: 'OK',
  cancel: 'Abbrechen',
  close: 'Schliessen',
  copy: 'Kopieren',
  copied: 'Kopiert',
  'codeBlock.title': 'Codeblock',
  'codeBlock.wrap': 'Zeilen umbrechen',
  'codeBlock.unwrap': 'Zeilen nicht umbrechen',
  'copy.failed': 'Das Kopieren hat nicht geklappt. Markiere den Text und kopiere ihn von Hand.',
  'copy.value': 'Wert kopieren',
  'copy.json': 'JSON kopieren',
  'copy.path': 'Pfad der Eigenschaft kopieren',
  'copy.prettyJson': 'Formatiertes JSON kopieren',
  'copy.compactJson': 'Kompaktes JSON kopieren',
  'copy.optionsHint': '{action}; Rechtsklick für die Kopierarten',
  retry: 'Erneut versuchen',
  loading: 'Wird geladen …',
  'load.failed': 'Das Laden hat nicht geklappt. Versuche es erneut.',
  submit: 'Absenden',
  submitting: 'Wird gesendet …',
  next: 'Weiter',
  previous: 'Zurück',
  skip: 'Überspringen',
  delete: 'Löschen',
  edit: 'Bearbeiten',
  save: 'Speichern',
  search: 'Suchen',
  more: 'Mehr',
  collapse: 'Einklappen',
  expand: 'Ausklappen',
  back: 'Zurück',
  // Der Name des Harness bleibt stehen: es ist ein Produktname, kein Wort.
  'brand.localBuild': 'DSH lokal gebaut',
  'workspace.defaultName': 'Standardarbeitsbereich',
  unknown: 'Unbekannt',
  none: 'Keine',
  truncated: 'Abgeschnitten',
  'json.label': 'JSON',
  'markdown.footnotes': 'Fussnoten',
  'markdown.truncatedCharacters': '… bei {total} Zeichen abgeschnitten',
  'number.thousand': '{value} Tsd.',
  'number.million': '{value} Mio.',
}

/** Die Zeile „Sprache" in den Einstellungen. */
export const sprachzeile = {
  'language.title': 'Sprache',
}

/** Die Beschriftung des Befehls, der die linke Spalte umschaltet. */
export const layoutbefehle = {
  toggle: 'Linke Spalte ein- oder ausklappen',
}

/**
 * Das Fenster „Modelle" (`settings.models`).
 *
 * **Fachbegriffe bleiben englisch, wo sie es sein müssen.** `Base URL`,
 * `API-Protokoll`, `Context window` und die Protokollnamen (`OpenAI Chat
 * Completions`, `Anthropic Messages`) sind Bezeichnungen aus der Schnittstelle.
 * Wer sie eindeutscht, findet sie in der Dokumentation des Anbieters nicht
 * wieder. Übersetzt wird, was der Nutzer versteht: Beschriftungen, Hinweise und
 * Fehlermeldungen.
 */
export const modelleinstellungen = {
  nav: 'Modelle',
  deepSeekAccount: 'DeepSeek-Konto',
  title: 'Modelle',
  intro: 'Trage deine API-Schlüssel ein, um Modelle der folgenden Anbieter zu nutzen.',
  edit: 'Bearbeiten',
  editProvider: '{provider} bearbeiten',
  remove: 'Löschen',
  removeProvider: '{provider} löschen',
  deleteTitle: '{provider} löschen?',
  deleteDescription: 'Beim Löschen von {provider} verschwindet seine Einrichtung. Ein '
    + 'Schlüssel, den er benutzt, wird woanders verwaltet und bleibt erhalten.',
  deleteDescriptionWithCredential: 'Beim Löschen von {provider} verschwinden seine '
    + 'Einrichtung und der gespeicherte API-Schlüssel.',
  deleteConfirm: '{provider} löschen',
  deleting: '{provider} wird gelöscht …',
  add: 'Modellanbieter hinzufügen',
  addMode: 'Wie möchtest du hinzufügen',
  addCatalog: 'Anbieter aus der Liste',
  addCustom: 'Eigene Modell-API',
  addCatalogHint: 'Wähle OpenAI, Anthropic, Kimi oder einen anderen Anbieter aus der '
    + 'mitgelieferten Liste und trage seinen API-Schlüssel ein.',
  addCustomHint: 'Verbinde eine Weiterleitung, einen eigenen Server oder eine beliebige '
    + 'Schnittstelle nach OpenAI- oder Anthropic-Art — über Basisadresse, Protokoll und '
    + 'Modelle.',
  addCatalogExhausted: 'Alle Anbieter aus der Liste sind bereits eingerichtet.',
  addCustomUnavailable: 'Es steht kein API-Protokoll zur Auswahl.',
  provider: 'Anbieter',
  close: 'Schliessen',
  cancel: 'Abbrechen',
  apply: 'Übernehmen',
  applying: 'Wird übernommen …',
  savedProvider: '{provider} gespeichert.',
  credentialConfigured: 'API-Schlüssel eingetragen',
  credentialMissing: 'API-Schlüssel fehlt',
  readOnly: 'Die Einstellungsdatei ist in dieser Umgebung schreibgeschützt.',
  loadFailed: 'Die Anbieterliste liess sich nicht laden. Versuche es erneut.',
  conflict: 'Jemand anders hat diese Einstellungen geändert, während dieses Fenster offen '
    + 'war. Schliesse es und öffne es erneut, um die jetzigen Werte zu bearbeiten.',
  retry: 'Erneut versuchen',
  keyInput: 'API-Schlüssel',
  keyPlaceholder: 'Trage deinen API-Schlüssel ein',
  keyPlaceholderNative: 'Trage einen API-Schlüssel ein, oder lass das Feld leer, um die '
    + 'Anmeldung aus der Umgebung zu nutzen',
  keyStored: 'Eingetragen — trage einen neuen Wert ein, um ihn zu ersetzen',
  keyEnvLocked: 'Kommt aus der Startumgebung (nicht änderbar)',
  customized: 'Angepasste Einstellungen',
  baseUrl: 'Base URL',
  baseUrlDefault: 'Vorgabe des Anbieters',
  deepSeekBaseUrl: 'https://api.deepseek.com/anthropic',
  deepSeekEndpointHint: 'Nutze eine Schnittstelle, die zu Anthropic Messages passt.',
  models: 'Modelle',
  modelsInherited: 'Es gelten die Vorgaben des Adapters',
  modelsCustomized: 'Angepasste Modellliste',
  resetModels: 'Vorgaben wiederherstellen',
  model: 'Modell',
  modelId: 'Modell-Kennung',
  modelName: 'Anzeigename',
  modelNamePlaceholder: 'Ohne Eintrag gilt die Modell-Kennung',
  contextWindow: 'Kontextfenster',
  contextWindowPlaceholder: 'Ohne Eintrag gilt die Vorgabe des Anbieters',
  maxTokens: 'Höchstzahl Ausgabe-Token',
  maxTokensPlaceholder: 'Ohne Eintrag gilt die Vorgabe des Anbieters',
  modelAdvanced: 'Modell-Optionen',
  modelInputTypes: 'Eingabearten',
  modelInputText: 'Text',
  modelInputImage: 'Bild',
  addModel: 'Modell hinzufügen',
  removeModel: 'Modell löschen',
  modelsEmpty: 'In der Auswahl erscheinen keine Modelle. Kennungen, die hier nicht '
    + 'stehen, lassen sich weiterhin direkt senden.',
  keyBlank: 'Trage den API-Schlüssel ein, oder lass das Feld leer, um den gespeicherten '
    + 'zu behalten.',
  keyBlankNew: 'Trage den API-Schlüssel ein, oder lass das Feld leer, wenn dieser Anbieter '
    + 'sich anders anmeldet.',
  keyIllegalCharacters: 'Dieser API-Schlüssel hat kein gültiges Format. Prüfe ihn.',
  modelIdRequired: 'Die Modell-Kennung wird gebraucht.',
  modelIdDuplicate: 'Die Modell-Kennung muss einmalig sein.',
  modelNameInvalid: 'Der Anzeigename darf nicht leer sein.',
  modelContextInvalid: 'Das Kontextfenster braucht eine positive Zahl, etwa 131072, 256K '
    + 'oder 1M.',
  modelMaxTokensInvalid: 'Die Höchstzahl Ausgabe-Token braucht eine positive Zahl, etwa '
    + '8192, 64K oder 1M.',
  advancedHint: 'Weitere Felder stehen in cordis.patch.yml; bearbeite diesen Abschnitt '
    + 'direkt.',
  modelCapacityInvalid: 'Eine Kapazität ist eine Zahl, wahlweise mit K oder M dahinter.',
  modelDuplicate: 'Jede Modell-Kennung darf einmal vorkommen.',
  fetchModels: 'Verfügbare Modelle holen',
  fetching: 'Der Anbieter wird gefragt …',
  fetchNeedsBaseUrl: 'Trage zuerst die Basisadresse ein, dann hole die Modelle.',
  fetchEmpty: 'Der Anbieter hat keine Modelle genannt. Trage sie von Hand ein.',
  fetchTitle: 'Modelle zum Hinzufügen wählen',
  fetchDescription: 'Das sind die Modelle, die dieser Anbieter führt. Wähle die aus, die '
    + 'du hinzufügen willst.',
  fetchSearch: 'Modelle durchsuchen',
  fetchNoMatches: 'Keine passenden Modelle.',
  fetchSelectAll: 'Alle auswählen',
  fetchDeselectAll: 'Auswahl aufheben',
  fetchAdopt: 'Ausgewählte hinzufügen',
  customTag: 'Eigene',
  customRoute: 'Anbieter-Kennung',
  customRouteHint: 'Eine Kennung aus Kleinbuchstaben, beginnend mit einem Buchstaben. Sie '
    + 'benennt diesen Anbieter eindeutig in Anfragen und als Name seines Schlüssels.',
  customRouteInvalid: 'Beginne mit einem Kleinbuchstaben; danach Kleinbuchstaben, Ziffern '
    + 'und Bindestriche.',
  customRouteTaken: 'Diese Kennung benutzt schon ein Anbieter.',
  customDisplayName: 'Anzeigename',
  customApi: 'API-Protokoll',
  customApiUnset: 'Nicht ausgewählt',
  protocolOpenAiCompletions: 'OpenAI Chat Completions',
  protocolOpenAiResponses: 'OpenAI Responses',
  protocolAnthropicMessages: 'Anthropic Messages',
  customNeedsBaseUrl: 'Ein eigener Anbieter braucht eine Basisadresse.',
  customBaseUrlInvalid: 'Trage eine gültige HTTP- oder HTTPS-Adresse ein.',
  customNeedsModels: 'Ein eigener Anbieter braucht mindestens ein Modell.',
  customBaseUrlPlaceholder: 'https://gateway.example/v1',
  customAnthropicBaseUrlPlaceholder: 'https://gateway.example',
  settingsPathUnresolvable: 'Pfad in den Einstellungen nicht auflösbar',
  create: 'Anbieter anlegen',
  creating: 'Wird angelegt …',
  welcomeTitle: 'Hinweis zur Vorschau',
  welcomeBody: 'DeepSeek Harness 0.2 ist noch in der Vorschau, und an vielen Stellen gibt '
    + 'es weiter zu verbessern. Wir freuen uns über Rückmeldungen von allen Entwicklern '
    + 'und Nutzern. Die neue Desktop-Anwendung richtet sich an ein breites Publikum; die '
    + 'weiterführenden Funktionen für Entwickler lassen sich in den Einstellungen '
    + 'einschalten. Die Produktfunktionen und die Plugin-Schnittstellen von DeepSeek '
    + 'Harness werden sich weiter zügig entwickeln und mit der Zeit ruhiger werden.\n\n'
    + 'Wir freuen uns darauf, die Grenzen des Machbaren gemeinsam mit Nutzern und '
    + 'Entwicklern auszuloten — auf einer offenen, wiederverwendbaren und zusammensetzbaren '
    + 'Grundlage. Bring deine Ideen mit DeepSeek Harness zum Laufen und mach in der '
    + 'Gemeinde mit, um das Ökosystem der Erweiterungen zu bereichern.',
  welcomeContinue: 'Weiter',
  welcomeError: 'Die Bestätigung liess sich nicht speichern. Versuche es erneut.',
  onboardingTitle: 'Trage einen API-Schlüssel ein, um zu beginnen',
  onboardingDescription: 'Richte den offiziellen DeepSeek-Anbieter ein, um loszulegen.',
  onboardingLater: 'Später einrichten',
  onboardingSave: 'Speichern und weiter',
  onboardingSaving: 'Wird gespeichert …',
  keyRequired: 'Trage einen API-Schlüssel ein, um fortzufahren.',
}
