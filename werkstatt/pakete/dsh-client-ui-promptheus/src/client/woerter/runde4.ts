/**
 * PROMPTHEUS Werkstatt — deutsche Texte, Runde 4 (Namensräume 16 bis 20).
 *
 * Quellen (Fassung 0.2.0-rc.2):
 *   shortcuts          ui-shortcuts            32
 *   user-questions     ui-user-questions       31
 *   settings-account   ui-settings-account     29
 *   commands           ui-commands             28
 *   sidebar-browser    ui-sidebar-browser      26
 *
 * **Bei den Tastenkürzeln ist Vorsicht geboten:** Tastennamen wie `Mod+/` oder
 * `Command+Option` sind **keine Beschriftungen**, sondern Bezeichnungen von
 * Tasten. Sie bleiben unverändert — nur die Sätze darum werden deutsch.
 *
 * **Platzhalter bleiben unverändert** — `woerter_pruefen.mjs` prüft das je Schlüssel.
 */

/** Tastenkürzel (`shortcuts`). 32 Texte. */
export const tastenkuerzel: Record<string, string> = {
  'edit-label': 'Tastenkürzel für {command} ändern',
  record: 'Tasten drücken',
  'record-help': 'Beim Loslassen wird gespeichert. Tab wechselt die Aktion, Esc beendet die Aufnahme.',
  'web-help': 'Im Browser verfügbar: Mod+/, Mod+Umschalt+, und Mod+Umschalt+. — Mod ist auf dem Mac Befehl, sonst Strg.',
  'unsupported-key': 'Diese Taste wird noch nicht unterstützt.',
  reserved: 'Diese Kombination gehört dem System oder der Textbearbeitung.',
  'modifier-required': 'Drücke zusätzlich Befehl, Strg oder Alt.',
  'too-many-keys': 'Höchstens zwei Tasten neben den Zusatztasten. Lass los und versuche es erneut.',
  'macos-web-help': 'Möglich sind Befehl+/, Befehl+,, Befehl+Backslash, Steuerung+Gravis, Befehl+Wahl+Taste oder Befehl+Umschalt+Taste. Auch drei oder vier verschiedene Zusatztasten gehen. Kombinationen, die Browser oder System belegen, erreichen die Seite vielleicht nicht.',
  'windows-web-help': 'Möglich sind Strg+/, Strg+,, Strg+Alt+Taste oder Strg+Umschalt+Taste. Auch drei oder vier verschiedene Zusatztasten gehen. Kombinationen, die Browser oder System belegen, erreichen die Seite vielleicht nicht.',
  'unsupported-browser': 'Dieser Browser kann diese Kombination nicht.',
  conflict: 'Belegt von „{commands}"',
  saved: 'Geändert',
  clear: 'Entfernen',
  'retry-save': 'Speichern erneut versuchen',
  reset: 'Auf Vorgabe zurück',
  'reset-all': 'Alle auf Vorgabe zurück',
  'modified-count': '{count} angepasst',
  'reset-title': 'Alle Tastenkürzel auf die Vorgabe zurücksetzen?',
  'reset-description': 'Die Vorgaben dieser Plattform werden wiederhergestellt. Deine Änderungen und Entfernungen fallen weg; andere Plattformen bleiben unberührt.',
  cancel: 'Abbrechen',
  'reset-saved': 'Die Vorgaben sind wiederhergestellt',
  'close-confirmation': 'Bestätigung schliessen',
  'reset-failed': 'Das Zurücksetzen ist gescheitert. Die bisherigen Kürzel bleiben erhalten. Versuche es noch einmal.',
  review: 'Die neueste Einstellung wurde geprüft',
  stale: 'Die Tastenkürzel oder die verfügbaren Befehle haben sich geändert. Prüfe die Belegung und speichere dann.',
  'write-failed': 'Das Speichern ist gescheitert. Die bisherigen Kürzel und dein Entwurf bleiben erhalten. Versuche es noch einmal.',
  'not-ready': 'Die Tastenkürzel sind noch nicht bereit. Versuche es später noch einmal.',
  read: '{location} liess sich nicht lesen. Prüfe die Zugriffsrechte und {reload}.',
  invalid: 'Die Tastenkürzel in {location} sind beschädigt. Sichere die Datei, repariere sie und {reload}.',
  future: 'Die Tastenkürzel in {location} stammen aus einer neueren Fassung. Aktualisiere den Harness und versuche es erneut.',
  'web-document': 'dsh.keybindings.v1 im lokalen Speicher dieser Seite',
  'desktop-document': 'userData/keybindings.json',
  'web-reload': 'lade die Seite neu',
  'desktop-reload': 'starte den Harness neu',
  'using-defaults': 'Zur Zeit gelten die Vorgaben.',
  'using-accepted': 'Zur Zeit gelten die zuletzt erfolgreich gelesenen Kürzel.',
  'native-failed': 'Der Schutz für die Tastenaufnahme liess sich nicht einschalten. Schliesse das Fenster und versuche es erneut.',
  'global-hint': 'Global aufrufen',
  'clear-search': 'Suche leeren',
  title: 'Tastenkürzel',
  open: 'Übersicht der Tastenkürzel',
  settings: 'Tastenkürzel',
  view: 'Tastenkürzel bearbeiten',
  description: 'Die verfügbaren Tastenkürzel und Eingaben ansehen und ändern',
  search: 'Tastenkürzel durchsuchen',
  close: 'Tastenkürzel schliessen',
  application: 'Anwendung',
  input: 'Nachrichteneingabe',
  menus: 'Menüs und Einblendungen',
  approval: 'Freigabebereich',
  unbound: 'Kein Kürzel',
  empty: 'Kein Tastenkürzel passt zur Suche',
  move: 'Die Auswahl im Menü bewegen',
  select: 'Den Menüeintrag wählen',
  dismiss: 'Das Menü oder die oberste Einblendung schliessen',
}

/** Rückfragen an den Nutzer (`user-questions`). 31 Texte. */
export const rueckfragen: Record<string, string> = {
  'error.incomplete': 'Beantworte zuerst diese Frage.',
  'error.unanswered': 'Wähle eine Möglichkeit oder schreibe eine eigene Antwort.',
  'error.unavailable': 'Zur Zeit lässt sich nichts senden. Versuche es später noch einmal.',
  'error.resubmit': 'Die Antwort ist nicht angekommen; die Arbeit läuft weiter. Sende sie noch einmal.',
  'status.sent': 'Die Antwort ist gesendet; der Bereich liess sich nicht schliessen.',
  'wait.takeTime': 'Lass dir Zeit',
  'wait.countdown': 'Die Arbeit läuft in {seconds} Sekunden weiter',
  'wait.paused': 'Angehalten · noch {seconds} Sekunden',
  'wait.held': 'Es wird auf deine Antwort gewartet',
  'wait.continued': 'Die Arbeit läuft weiter; du kannst noch antworten',
  'review.status': 'Beantwortet',
  'review.skipped': 'Diese Frage wurde damals übersprungen.',
  'reply.label': 'Eine frühere offene Frage beantworten',
  'reply.open': 'Einzelheiten der Frage ausklappen',
  'reply.close': 'Einzelheiten der Frage einklappen',
  'reply.answerLabel': 'Antwort:',
  'reply.skipped': 'Übersprungen',
  'nav.prev': 'Vorige Frage',
  'nav.next': 'Nächste Frage',
  'nav.minimize': 'Die Fragenkarte einklappen',
  'nav.maximize': 'Die Fragenkarte ausklappen',
  'nav.cancel': 'Die ganze Fragengruppe verwerfen',
  'nav.close': 'Den Fragenbereich einklappen; er lässt sich über den Werkzeugaufruf wieder öffnen',
  'option.recommended': 'Empfohlen',
  'custom.placeholder': 'Deine Antwort eingeben',
  'action.skip': 'Überspringen',
  'action.next': 'Nächste Frage',
  'plan.header': 'Plan zur Prüfung',
  'plan.approve': 'Ausführen',
  'plan.decline': 'Ablehnen',
  'plan.discuss': 'Änderung verlangen',
}

/** Einstellungen → Konto (`settings-account`). 29 Texte. */
export const konto: Record<string, string> = {
  modelSignInRequired: 'Die aktuellen Modelle sind nicht verfügbar. Melde dich an und versuche es erneut.',
  sessionExpired: 'Die Anmeldung ist abgelaufen. Melde dich erneut an.',
  close: 'Schliessen',
  addApiKey: 'Zugangsschlüssel hinzufügen',
  retry: 'Erneut anmelden',
  loginTitle: 'Loslegen',
  loginDescription: 'Melde dich mit einem DeepSeek-Konto an oder trage einen Zugangsschlüssel ein. Deine Projekte und Dateien bleiben auf diesem Rechner.',
  browserTitle: 'Warte auf die Anmeldung',
  browserPrompt: 'Hat sich kein neues Fenster geöffnet?',
  copyLink: 'Anmeldeadresse kopieren',
  copiedLink: 'Adresse kopiert',
  copyFailed: 'Das Kopieren ist gescheitert. Schreibe die Adresse von Hand ab.',
  browserDescription: ' — öffne die Anmeldeseite von Hand und schliesse die Anmeldung dort ab.',
  timeoutTitle: 'Die Anmeldung ist abgelaufen',
  timeoutDescription: 'Melde dich erneut an und mach dann weiter.',
  failureTitle: 'Die Anmeldung ist gescheitert',
  platformFailed: 'Der Vorgang blieb unvollendet. Versuche es erneut.',
  platformRetry: 'Erneut versuchen',
  loading: 'Wird geladen…',
  backToHarness: 'Zurück zum DeepSeek Harness',
  settings: 'Einstellungen',
  contactUs: 'Rückmeldung',
  menu: 'Kontomenü',
  nav: 'Konto und Guthaben',
  signedIn: 'Bei DeepSeek angemeldet',
  signedOut: 'Nicht angemeldet',
  signIn: 'Anmelden',
  signOut: 'Abmelden',
  signOutUnknownDescription: 'Der Zustand der Aufgaben liess sich nicht feststellen. Abmelden kann Aufgaben unterbrechen, die mit diesem Konto laufen. Fortfahren?',
  signOutDescription: 'Beim Abmelden gehen keine Daten verloren; du kannst dich später wieder anmelden.',
  signOutRunningDescription: 'Es läuft gerade etwas. Abmelden unterbricht es. Willst du dich sofort abmelden?',
  cancel: 'Abbrechen',
  open: 'Browser öffnen',
  initializing: 'Die Anmeldung wird begonnen…',
  waiting: 'Mach im Browser weiter',
  completing: 'Die Anmeldung wird abgeschlossen…',
  expired: 'Die Anmeldung ist abgelaufen. Versuche es erneut.',
  failed: 'Der Vorgang blieb unvollendet. Versuche es erneut.',
  settingsSignedOutTitle: 'Du bist nicht beim DeepSeek Harness angemeldet',
  settingsSignedOutDescription: 'Melde dich an, um deinen eigenen Zugangsschlüssel zu erhalten',
  signInDescription: 'Melde dich mit einem DeepSeek-Konto an, um loszulegen',
  profileUnavailable: 'Die Kontodaten sind zur Zeit nicht verfügbar',
  balance: 'Guthaben',
  bonusBalance: 'Geschenktes Guthaben',
  balanceUnavailable: 'In der offenen Plattform nachsehen',
  balanceSignedOut: 'Nach dem Anmelden sichtbar',
  accountInfo: 'Weitere Kontodaten',
  more: 'Mehr',
  usage: 'Verbrauch ansehen',
  topUp: 'Aufladen',
  quotaTitle: 'Kein verfügbares Guthaben',
  quotaDescription: 'Ohne Guthaben kann der DeepSeek Harness keine neuen Aufgaben beginnen. Möchtest du aufladen? Das geht auch später unter Einstellungen → Konto und Guthaben.',
  quotaTopUp: 'Zum Aufladen',
  bonusNoticeTitle: 'Geschenktes Guthaben ist eingetroffen',
  // ── Die erste Einrichtung ──────────────────────────────────────────────────
  //
  // **Diese 39 Texte fehlten.** Sie liegen im Harness in einer eigenen Datei
  // (`locales/onboarding.ts`) und werden über `...onboardingEnglishCopy` in das
  // Konto-Wörterbuch gespreizt. Solange die Namensraum-Tabelle von Hand geführt
  // wurde, zählte die Prüfung nur die 54 Texte der Hauptdatei — die
  // Einrichtungsstrecke blieb englisch, und kein Werkzeug sagte etwas.
  //
  // `onboardingArtworkLocale` sagt der Abbildung, welche Sprache sie zeigen
  // soll; für uns ist das `de`. Die Marke bleibt stehen: `DeepSeek Harness` ist
  // ein Produktname.
  onboardingArtworkLocale: 'de',
  onboardingWelcome: 'Willkommen bei',
  onboardingBrand: 'DeepSeek Harness',
  onboardingIntroduction: 'DeepSeek Harness arbeitet in einem Ordner auf deinem '
    + 'Rechner und liest und schreibt Dateien mit Werkzeugen. Es hilft dir, '
    + 'Informationen zu suchen und zu ordnen, Dokumente und Tabellen zu erstellen, '
    + 'Code zu schreiben und Fehlern auf den Grund zu gehen.',
  onboardingStart: 'Einrichtung beginnen',
  onboardingCredit: 'Guthaben bereitstellen',
  onboardingCreditDescription: 'DeepSeek Harness rechnet nach den Token ab, die Modelle '
    + 'und Werkzeuge verbrauchen. Stelle rechtzeitig Guthaben bereit, damit eine Aufgabe '
    + 'nicht mittendrin abbricht. Dein Guthaben wird nur verbraucht, während der Agent '
    + 'wirklich arbeitet.',
  onboardingTopUp: 'Zum Aufladen',
  onboardingLater: 'Weiter',
  onboardingFundedTopUp: 'Zum Aufladen',
  onboardingPurposePrefix: 'Womit soll ich dir',
  onboardingPurposeSuffix: 'helfen?',
  onboardingPurposeDescription: 'Wir richten Oberfläche und Werkzeuge nach deiner Wahl '
    + 'ein, damit sie zu deiner Arbeitsweise passen.',
  onboardingOffice: 'Büro und Gestaltung',
  onboardingOfficeDescription: 'Dokumente bearbeiten, Daten ordnen, Präsentationen '
    + 'erstellen und mehr',
  onboardingDevelopment: 'Code und Entwicklung',
  onboardingDevelopmentDescription: 'Code ändern, Fehler suchen, Befehle ausführen, '
    + 'Projektdateien verwalten und mehr',
  onboardingContinue: 'Weiter',
  onboardingProcess: 'Wie viel vom Arbeitsverlauf möchtest du sehen?',
  onboardingProcessDescription: 'Das ändert nur, wie der Verlauf gezeigt wird — nicht, '
    + 'was DeepSeek Harness kann.',
  onboardingCompact: 'Nur Ergebnisse',
  onboardingCompactDescription: 'Du siehst nur die Ergebnisse, in einer ruhigen Oberfläche',
  onboardingStandard: 'Die wichtigsten Schritte',
  onboardingStandardDescription: 'Ergebnisse zuerst, dazu die wichtigen Schritte und '
    + 'Handlungen',
  onboardingDetailed: 'Der ganze Verlauf',
  onboardingDetailedDescription: 'Der vollständige Verlauf — gut zum Nachsehen und für '
    + 'die Fehlersuche',
  onboardingEnter: 'Programm öffnen',
  onboardingBack: 'Zurück',
  onboardingSkip: 'Überspringen',
  onboardingSkipTitle: 'Einrichtung überspringen?',
  onboardingSkipDescription: 'Du kannst jederzeit unter Einstellungen → Allgemein '
    + 'einstellen, wie Verlauf, Leistung und Verbrauch gezeigt werden, und die '
    + 'Codewerkzeuge einschalten.',
  onboardingKeepSetting: 'Einrichtung fortsetzen',
  onboardingNoCreditTitle: 'Aufladen überspringen?',
  onboardingNoCreditDescription: 'Ohne Guthaben kann DeepSeek Harness keine neue Aufgabe '
    + 'beginnen. Du kannst später unter Einstellungen → Konto und Guthaben aufladen.',
  onboardingUnderstood: 'Verstanden',
  onboardingGoTopUp: 'Zum Aufladen',
  onboardingSaveFailed: 'Die Einstellungen liessen sich nicht speichern. Versuche es erneut.',
  onboardingRetry: 'Erneut versuchen',
  onboardingLoading: 'Einstellungen werden geladen …',
}

/** Befehlsmenü (`commands`). 28 Texte. */
export const befehle: Record<string, string> = {
  'section.add': 'Hinzufügen',
  'section.commands': 'Befehle',
  'label.goal': 'Ziel',
  'label.plan': 'Plan',
  'label.feedback': 'Rückmeldung',
  'label.compact': 'Verdichten',
  'label.permission': 'Zugriff',
  'label.export': 'Protokoll laden',
  'description.goal': 'Ein langfristiges Ziel setzen oder ansehen',
  'description.plan': 'In den Planmodus wechseln oder ihn verlassen',
  'description.feedback': 'Eine Rückmeldung zu diesem Chat senden',
  'description.compact': 'Das Gespräch bis hierher verdichten',
  'description.permission': 'Die Zugriffsstufe wechseln (Sandkasten und Freigaben)',
  'description.export': 'Diesen Chat als ZIP-Datei ausführen',
  'token.goal': 'Ziel',
  'token.plan': 'Plan',
  'token.feedback': 'Rückmeldung',
  'token.compact': 'Verdichten',
  'token.permission': 'Zugriff',
  'token.export': 'Ausfuhren',
  'search.placeholder': 'Suchen…',
  'search.aria': 'Möglichkeiten filtern',
  'status.loading': 'Die Möglichkeiten werden geladen…',
  'status.applying': 'Wird übernommen…',
  'status.empty': 'Keine Möglichkeiten',
  'overlay.aria': 'Möglichkeiten für /{command}',
  'listbox.aria': 'Treffer für /{command}',
  'notice.attachmentsUnsupported': '/{command} nimmt keine Anhänge. Entferne sie zuerst.',
}

/** Eingebauter Browser (`sidebar-browser`). 26 Texte. */
export const dateibrowser: Record<string, string> = {
  'type.label': 'Browser',
  'guide.title': 'Browser',
  'guide.description': 'Seiten im Netz ansehen',
  'shortcut.noSession': 'Öffne zuerst einen Chat',
  'address.placeholder': 'Eine HTTP(S)-Adresse eingeben',
  'address.changed': 'Die Adresse hat sich geändert',
  back: 'Zurück',
  forward: 'Vorwärts',
  reload: 'Neu laden',
  go: 'Aufrufen',
  external: 'Im Browser des Systems öffnen',
  'sandbox.disable': 'Die Sandkastengrenze ausschalten',
  'sandbox.enable': 'Die Sandkastengrenze wieder einschalten',
  'sandbox.warning': 'Die Sandkastengrenze ist aus. Seiten dürfen die oberste Anwendung wegnavigieren und Download, modale Fenster sowie Tastensperre benutzen.',
  start: 'Gib eine HTTP(S)-Adresse ein und beginne zu blättern',
  loading: 'Wird geöffnet…',
  'restore.previous': 'Zuletzt geöffnet',
  'restore.action': 'Seite wiederherstellen',
  'error.empty': 'Gib eine Adresse ein.',
  'error.invalid': 'Diese Adresse ist ungültig oder zu lang.',
  'error.protocol': 'Nur HTTP und HTTPS gehen. Örtliche Dateien siehst du in der Dokumentvorschau.',
  'error.credentials': 'Die Adresse darf keinen Benutzernamen und kein Kennwort enthalten.',
  'error.application-origin': 'Die DSH-Anwendung selbst lässt sich nicht im eingebauten Browser öffnen.',
  'load.failed': 'Die Seite liess sich nicht laden. Lade sie neu oder öffne sie im Browser des Systems.',
  'load.failed.detail': 'Die Seite liess sich nicht laden ({code}): {description}',
  'address.unknown': 'Die Seite hat gewechselt; die neue Adresse lässt sich hier nicht lesen.',
}
