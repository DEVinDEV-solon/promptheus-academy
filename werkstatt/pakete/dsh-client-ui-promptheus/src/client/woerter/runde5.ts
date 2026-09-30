/**
 * PROMPTHEUS Werkstatt — deutsche Texte, Runden 5 bis 9 (Namensräume 21 bis 40).
 *
 * Quellen (Fassung 0.2.0-rc.2), in dieser Datei gebündelt, weil die einzelnen
 * Namensräume klein sind:
 *
 *   sidebar-documentpreview   22   message-feedback        20
 *   settings.webSearch        18   workflowRun             18
 *   plan                      17   sidebar-files           17
 *   open-in-app               15   settings.shell          14
 *   sidebar-terminal          14   goal                    12
 *   settings.agentLoop        12   reference               11
 *   input-trigger              9   theme                    9
 *   skill                      8   approval                 5
 *   settings-plugins           5   settings-session-log     4
 *
 * **Die großen bleiben getrennt:** `agent-preset` (60) und `schedule` (311)
 * liegen in eigenen Dateien — sie bringen eigene Unterdateien mit.
 *
 * **Begriffe wie bisher:** Session → Chat · Agent → Agent · Subagent →
 * Unteragent · Plugin → Erweiterung · Tool → Werkzeug · Approval → Freigabe ·
 * Schedule/Reminder → Zeitplan/Erinnerung.
 */

/** Vorschau von Dokumenten (`sidebar-documentpreview`). 22 Texte. */
export const dokumentvorschau: Record<string, string> = {
  loading: 'Das Dokument wird dargestellt…',
  loadMore: 'Mehr laden',
  changed: 'Die Datei wurde geändert; angezeigt wird noch der alte Inhalt.',
  reloadNow: 'Neu laden',
  reload: 'Die Datei neu einlesen',
  autoRefresh: 'Selbsttätig erneuern',
  'autoRefresh.enable': 'Selbsttätiges Erneuern einschalten',
  'autoRefresh.disable': 'Selbsttätiges Erneuern ausschalten',
  'wrap.enable': 'Zeilenumbruch',
  'wrap.disable': 'Zeilenumbruch aus',
  'wrap.aria': 'Zeilenumbruch',
  openWith: 'Öffnen mit',
  'viewer.text': 'Reiner Text',
  resourceUnavailable: 'Der Dienst für Dateiinhalte ist nicht verfügbar',
  rendererUnavailable: 'Die Ansicht {name} ist nicht verfügbar',
  unsupportedFile: 'Dieses Dateiformat lässt sich zur Zeit nicht ansehen',
  'error.notFound': 'Die Datei gibt es nicht mehr — sie wurde vielleicht verschoben oder gelöscht',
  'error.tooLarge': 'Der Inhalt einer Seite überschreitet {limit} und lässt sich nicht lesen',
  'error.notText': 'Dieses Dateiformat lässt sich zur Zeit nicht ansehen',
  'error.notRegularFile': 'Dieser Pfad ist keine gewöhnliche Datei und hat deshalb nichts anzuzeigen',
  'error.unavailable': 'Das Lesen ist gescheitert: {message}',
  retry: 'Erneut versuchen',
}

/** Rückmeldung zu einer Nachricht (`message-feedback`). 20 Texte. */
export const rueckmeldung: Record<string, string> = {
  'action.like': 'Gute Antwort',
  'action.likeActive': 'Kennzeichnung zurücknehmen',
  'action.dislike': 'Problematische Antwort',
  'action.dislikeActive': 'Kennzeichnung zurücknehmen',
  'dialog.title': 'Rückmeldung senden',
  'dialog.categories': 'Art der Rückmeldung',
  'dialog.detail': 'Einzelheiten',
  'dialog.hint': 'Einzelheiten helfen uns weiter. Beim Senden wird das Protokoll dieses Chats mitgeschickt.',
  'category.task-result': 'Ergebnis der Aufgabe',
  'category.instruction-following': 'Anweisungen verstanden und befolgt',
  'category.product-interaction': 'Funktionen und Bedienung',
  'category.service-stability': 'Stabilität und Geschwindigkeit',
  'category.resource-cost': 'Verbrauch und Kosten',
  'category.security-privacy-permission': 'Sicherheit, Datenschutz und Zugriffsrechte',
  'category.other': 'Sonstiges',
  'toast.recorded': 'Danke für die Rückmeldung',
  'error.conflict': 'Diese Rückmeldung wurde anderswo geändert; angezeigt wird der neueste Stand',
  'error.load': 'Der Zustand der Rückmeldung liess sich nicht laden',
  'error.generic': 'Die Rückmeldung liess sich nicht speichern',
  'error.noteTooLarge': 'Die Beschreibung ist zu lang. Kürze sie und sende dann.',
}

/** Einstellungen → Netze (`settings.webSearch`). 18 Texte. */
export const netzsuche: Record<string, string> = {
  title: 'Suche im Netz',
  description: 'Den Suchanbieter des DeepSeek Harness einstellen.',
  apiKey: 'Zugangsschlüssel',
  apiKeyHint: 'Wird nicht in die Einstellungsdatei geschrieben. Leer lassen heisst: der bisherige Schlüssel bleibt.',
  apiKeySet: 'Ein Schlüssel ist hinterlegt.',
  apiKeyUnset: 'Es ist kein Schlüssel hinterlegt. Nur Chats mit einem DeepSeek-Kontomodell können über die vorgegebene Adresse suchen.',
  baseUrl: 'Adresse der Schnittstelle',
  baseUrlHint: 'Leer lassen heisst: die vorgegebene Adresse des Anbieters.',
  maxUses: 'Höchstzahl Suchen je Anfrage',
  maxUsesHint: 'Wie oft eine Anfrage suchen darf, bevor geantwortet werden muss.',
  overridden: 'Überdeckt',
  reset: 'Auf Vorgabe zurück',
  readOnly: 'Die Einstellungen dieser Einrichtung sind nur lesbar.',
  unavailable: 'Diese Erweiterung ist zur Zeit nicht geladen und lässt sich deshalb nicht einstellen.',
  save: 'Speichern',
  saving: 'Wird gespeichert…',
  saveFailed: 'Diese Einrichtung hat die Werte nicht angenommen. Sie bleiben zum Ändern stehen.',
  invalidNumber: 'Gib eine Zahl ein, oder lass das Feld leer für die Vorgabe.',
}

/** Arbeitsablauf-Ausführung (`workflowRun`). 18 Texte. */
export const arbeitsablauf: Record<string, string> = {
  'run.title': '{name}',
  'run.members.one': '{count} Mitwirkender',
  'run.members.other': '{count} Mitwirkende',
  'run.empty': 'Es wurde kein Mitwirkender gestartet',
  'phase.unassigned': 'Ohne Abschnitt',
  'phase.empty': 'Leerer Abschnittsname',
  'statusCount.running': '{count} laufen',
  'statusCount.completed': '{count} fertig',
  'statusCount.failed': '{count} gescheitert',
  'statusCount.cancelled': '{count} abgebrochen',
  'statusCount.interrupted': '{count} unterbrochen',
  'member.empty': 'Leerer Name',
  'member.open': '{name} öffnen',
  'status.running': 'Läuft',
  'status.completed': 'Fertig',
  'status.failed': 'Gescheitert',
  'status.cancelled': 'Abgebrochen',
  'status.interrupted': 'Unterbrochen',
}

/** Planmodus (`plan`). 17 Texte. */
export const plan: Record<string, string> = {
  'chip.label': 'Plan',
  'preview.title': 'Plan',
  'preview.document': 'Plan · Markdown',
  'preview.action': 'Öffnen',
  'preview.open': 'Den Plan in der Seitenleiste öffnen',
  'preview.full': 'Ganzen Text ansehen',
  'preview.openNamed': 'Plan öffnen: {title}',
  'preview.loading': 'Der Plan wird gelesen…',
  'preview.failed': 'Der Plan liess sich nicht lesen',
  'preview.invalidAddress': 'Die Adresse des Plans ist ungültig',
  'preview.historyUnavailable': 'Der Chatverlauf liess sich nicht lesen',
  'preview.notFound': 'Dieser Plan wurde nicht gefunden',
  'preview.unavailable': 'Die Planvorschau ist nicht verfügbar',
  'preview.expired': 'Diese vorläufige Planvorschau ist abgelaufen. Öffne sie über die Karte neu, die noch auf Freigabe wartet.',
  'chip.on.aria': 'Der Planmodus ist an. Drücken schaltet ihn aus.',
  'chip.on.title': 'Der Planmodus ist an — klicken schaltet ihn aus (/plan off)',
  'chip.exitFailed': 'Der Planmodus liess sich nicht verlassen',
}

/** Dateien im Arbeitsbereich (`sidebar-files`). 17 Texte. */
export const arbeitsbereichsdateien: Record<string, string> = {
  'shortcut.noSession': 'Wähle zuerst einen Chat',
  'type.label': 'Dateien',
  'guide.title': 'Dateien des Arbeitsbereichs',
  'guide.description': 'Die Dateien des Arbeitsbereichs dieses Chats ansehen',
  loading: 'Wird gelesen…',
  empty: 'Leerer Ordner',
  truncated: 'Es gibt zu viele Einträge; angezeigt wird nur ein Teil.',
  noWorkspace: 'Dieser Chat hat keinen Ordner als Arbeitsbereich.',
  reload: 'Neu einlesen',
  autoRefresh: 'Selbsttätig erneuern',
  'autoRefresh.enable': 'Selbsttätiges Erneuern einschalten',
  'autoRefresh.disable': 'Selbsttätiges Erneuern ausschalten',
  'entry.other': 'Das ist weder Datei noch Ordner und lässt sich nicht öffnen.',
  'error.notFound': 'Diesen Ordner gibt es nicht mehr. Er wurde vielleicht verschoben oder gelöscht.',
  'error.outsideWorkspace': 'Dieser Ordner liegt ausserhalb des Arbeitsbereichs; die Seitenleiste liest ihn nicht.',
  'error.notDirectory': 'Das ist kein Ordner.',
  'error.unavailable': 'Das Lesen ist gescheitert: {message}',
}

/** Im örtlichen Programm öffnen (`open-in-app`). 15 Texte. */
export const oertlichOeffnen: Record<string, string> = {
  'open.title': 'Mit {app} öffnen',
  'path.appDefault': '{app} (Vorgabe)',
  'path.appsError': 'Die Liste der Programme liess sich nicht holen',
  'shortcut.busy': 'Es wird gerade ein Arbeitsbereich geöffnet',
  'shortcut.unavailable': 'Der Arbeitsbereich oder das örtliche Programm ist nicht verfügbar',
  'open.tooltip': 'Örtlich öffnen',
  'path.open': 'Öffnen',
  'path.more': 'Weitere Programme',
  'path.reveal': 'Den Ort der Datei zeigen',
  'path.openError': 'Das Öffnen ist gescheitert. Versuche es erneut.',
  'path.revealError': 'Der Ort der Datei liess sich nicht zeigen. Versuche es erneut.',
  'app.finder': 'Finder',
  'app.explorer': 'Datei-Explorer',
  'app.filemanager': 'Dateiverwaltung',
  'app.terminal': 'Terminal',
}

/** Einstellungen → Terminal (`settings.shell`). 14 Texte. */
export const terminalEinstellungen: Record<string, string> = {
  title: 'Terminal',
  description: 'Begrenzen, wie lange ein Befehl laufen darf und wie viel Ausgabe er erzeugen kann.',
  timeoutMs: 'Zeitgrenze je Befehl (Millisekunden)',
  timeoutMsHint: 'Wie lange ein einzelner Befehl laufen darf; danach wird er beendet.',
  maxOutputBytes: 'Obergrenze je Ausgabestrom (Bytes)',
  maxOutputBytesHint: 'Was darüber hinausgeht, wird in eine Zwischendatei umgeleitet statt verworfen.',
  overridden: 'Überdeckt',
  reset: 'Auf Vorgabe zurück',
  readOnly: 'Die Einstellungen dieser Einrichtung sind nur lesbar.',
  unavailable: 'Diese Erweiterung ist zur Zeit nicht geladen und lässt sich deshalb nicht einstellen.',
  save: 'Speichern',
  saving: 'Wird gespeichert…',
  saveFailed: 'Diese Einrichtung hat die Werte nicht angenommen. Sie bleiben zum Ändern stehen.',
  invalidNumber: 'Gib eine Zahl ein, oder lass das Feld leer für die Vorgabe.',
}

/** Terminal in der Seitenleiste (`sidebar-terminal`). 14 Texte. */
export const seitenleistenTerminal: Record<string, string> = {
  'shortcut.noSession': 'Wähle zuerst einen Chat',
  recoveryFailed: 'Das Terminal liess sich nicht wiederherstellen: {message}',
  retryRecovery: 'Wiederherstellung erneut versuchen',
  shell: 'Shell wählen',
  shellLoading: 'Die Shell wird gelesen…',
  shellEmpty: 'Keine Shell verfügbar',
  description: 'Befehle im Arbeitsbereich des Chats ausführen',
  title: 'Terminal',
  new: 'Neues Terminal',
  loading: 'Die Terminalumgebung wird gelesen…',
  creating: 'Wird gestartet…',
  connecting: 'Verbindung wird aufgebaut…',
  disconnected: 'Die Verbindung ist abgerissen.',
  reconnect: 'Neu verbinden',
  readonly: 'Diese Seite ist zur Zeit nur lesbar.',
  control: 'Eingabe übernehmen',
  closed: 'Das Terminal ist geschlossen.',
  exited: 'Der Prozess ist beendet ({code})',
  failed: 'Terminalfehler: {message}',
  rename: 'Name des Terminals',
  unavailable: 'Nicht verfügbar',
  retry: 'Erneut versuchen',
  cleanupFailed: 'Das Terminal „{title}" liess sich nicht beenden: {message}',
  missingTerminal: 'Dieses Terminal gibt es nicht mehr. Lege ein neues an.',
  inputFull: 'Der Eingabepuffer ist voll. Verbinde neu und versuche es dann.',
  attachmentEnded: 'Die Terminalverbindung ist beendet. Verbinde neu.',
  invalidOutput: 'Die Bildübertragung des Terminals ist gestört. Verbinde neu.',
  terminalLimit: 'Die Höchstzahl Terminals ist erreicht. Schliesse nicht gebrauchte; auch beendete zählen mit.',
}

/** Ziele (`goal`). 12 Texte. */
export const ziele: Record<string, string> = {
  'phase.active': 'Laufendes Ziel',
  'phase.active.disarmed': 'Ziel ohne Fortsetzung',
  'phase.paused': 'Angehaltenes Ziel',
  'phase.blocked': 'Blockiertes Ziel',
  'objective.aria': 'Inhalt des Ziels',
  'commandInput.aria': 'Befehlseingabe',
  'action.save': 'Ziel speichern',
  'action.cancel': 'Bearbeiten abbrechen',
  'action.pause': 'Ziel anhalten',
  'action.resume': 'Ziel fortsetzen',
  'action.edit': 'Ziel ändern',
  'action.clear': 'Ziel löschen',
}

/** Einstellungen → Agentenschleife (`settings.agentLoop`). 12 Texte. */
export const agentenschleife: Record<string, string> = {
  title: 'Agentenschleife',
  description: 'Steuern, wie der Agent Werkzeugaufrufe verteilt.',
  maxParallel: 'Gleichzeitige Werkzeugaufrufe',
  maxParallelHint: 'Wie viele Aufrufe innerhalb eines Schritts gleichzeitig laufen dürfen.',
  overridden: 'Überdeckt',
  reset: 'Auf Vorgabe zurück',
  readOnly: 'Die Einstellungen dieser Einrichtung sind nur lesbar.',
  unavailable: 'Diese Erweiterung ist zur Zeit nicht geladen und lässt sich deshalb nicht einstellen.',
  save: 'Speichern',
  saving: 'Wird gespeichert…',
  saveFailed: 'Diese Einrichtung hat die Werte nicht angenommen. Sie bleiben zum Ändern stehen.',
  invalidNumber: 'Gib eine Zahl ein, oder lass das Feld leer für die Vorgabe.',
}

/** Verweise (`reference`). 11 Texte. */
export const verweise: Record<string, string> = {
  'section.files': 'Dateien und Ordner',
  'section.subagents': 'Unteragenten',
  'section.sessions': 'Chats',
  'candidate.noCwd': '(ohne Arbeitsordner)',
  'crumb.root': 'Arbeitsbereich',
  'time.now': 'gerade eben',
  'time.minutes': '{n} Minuten',
  'time.hours': '{n} Stunden',
  'time.days': '{n} Tage',
  'time.months': '{n} Monate',
  'time.years': '{n} Jahre',
}

/** Auslösermenü (`input-trigger`). 9 Texte. */
export const ausloeser: Record<string, string> = {
  command: 'Befehl',
  skill: 'Fertigkeit',
  subagent: 'Unteragent',
  loading: 'Wird geladen…',
  'drill.aria': 'In den Ordner wechseln',
  'drill.hint': 'In den Ordner wechseln',
  'drill.key': 'Tab',
  'crumbs.aria': 'Navigation durch die Ordner',
  'suggestions.aria': 'Vorschläge zum Auslöser',
}

/** Erscheinungsbild (`theme`). 9 Texte. */
export const erscheinungsbild: Record<string, string> = {
  'appearance.title': 'Erscheinungsbild',
  'appearance.light': 'Hell',
  'appearance.dark': 'Dunkel',
  'appearance.system': 'Wie das System',
  'fontSize.title': 'Schriftgrösse',
  'fontSize.description': 'Wirkt nur auf die Schriftgrösse des Gesprächs',
  'fontSize.unit': 'px',
  'fontSize.increase': 'Schrift vergrössern',
  'fontSize.decrease': 'Schrift verkleinern',
}

/** Fertigkeiten (`skill`). 8 Texte. */
export const fertigkeiten: Record<string, string> = {
  'row.title': 'Fertigkeit laden',
  'row.running': 'Die Fertigkeit wird geladen',
  'row.preparing': 'Das Laden wird vorbereitet',
  'row.failed': 'Die Fertigkeit liess sich nicht laden',
  'row.stopped': 'Das Laden wurde abgebrochen',
  'row.instructions': 'Anleitung',
  'row.inspect': 'Ansehen',
  'menu.userOnly': 'Nur von Hand',
}

/** Freigabe (`approval`). 5 Texte. */
export const freigabe: Record<string, string> = {
  waiting: 'Wartet auf Freigabe',
  'detail.aria': 'Einzelheiten der Freigabe',
  escalation: 'Das Werkzeug {toolName} bittet um erweiterte Rechte',
  reject: 'Ablehnen',
  allowOnce: 'Einmal erlauben',
}

/** Einstellungen → Eingebaute Erweiterungen (`settings-plugins`). 5 Texte. */
export const eingebauteErweiterungen: Record<string, string> = {
  nav: 'Eingebaute Erweiterungen',
  title: 'Eingebaute Erweiterungen',
  intro: 'Die Erweiterungen ansehen, die diese Einrichtung mitbringt',
  tabs: 'Ansichten',
  empty: 'Diese Einrichtung bietet keine Ansicht der Erweiterungen an.',
}

/** Einstellungen → Sitzungsprotokoll (`settings-session-log`). 4 Texte. */
export const sitzungsprotokoll: Record<string, string> = {
  title: 'Beim Nutzen der offiziellen Modellschnittstelle das Sitzungsprotokoll hochladen',
  description: 'Hilft, die DeepSeek-Modelle und das Erzeugnis zu verbessern',
  saved: 'Die Einstellung ist gespeichert',
  failed: 'Die Einstellung liess sich nicht speichern',
}
