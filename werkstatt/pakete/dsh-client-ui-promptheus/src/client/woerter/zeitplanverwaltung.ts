/**
 * PROMPTHEUS Werkstatt — deutsche Texte des Namensraums `schedule.manager`.
 *
 * Quelle: `packages/client/ui-schedule/src/client/task-manager-locales.ts`
 * (Fassung 0.2.0-rc.2), **187 Texte**.
 *
 * Die Verwaltung der automatischen Aufträge: Liste, Suche, Einzelheiten,
 * Ausführungsprotokolle, die Zeitregel samt Editor und das Löschen.
 *
 * **Die 54 geteilten Frequenz-Texte** kommen aus `zeitregeln.ts` und werden
 * hier hineingespreizt — genau wie im Harness, wo beide Namensräume dieselbe
 * `frequency-locales.ts` benutzen.
 *
 * **„Automatischer Auftrag"** ist die deutsche Fassung von 自动化任务: ein
 * Auftrag, den der Harness zu festgelegten Zeiten von selbst ausführt.
 * „Erinnerung" bleibt dem kleinen Knopf vorbehalten (siehe `zeitregeln.ts`).
 *
 * **Die Cron-Ausdrücke bleiben unverändert.** `0 9 * * 1-5` ist keine
 * Beschriftung, sondern eine Angabe nach aussen.
 */

import { frequenz } from './zeitregeln.ts'

/** Die Verwaltung der automatischen Aufträge (`schedule.manager`). 187 Texte. */
export const zeitplanverwaltung: Record<string, string> = {
  ...frequenz,

  // ── Rahmen ─────────────────────────────────────────────────────────────────
  panel: 'Automatische Aufträge',
  title: 'Automatische Aufträge',
  'new.action': 'Neu',

  // ── Liste ──────────────────────────────────────────────────────────────────
  'list.label': 'Auftragsliste',
  'list.nextPrefix': 'Nächster Lauf: ',
  'list.loading': 'Die Aufträge werden geladen…',
  'list.error': 'Die Aufträge liessen sich nicht laden',
  'list.retry': 'Erneut versuchen',
  'list.empty': 'Es gibt noch keine automatischen Aufträge. Aufträge, die du in einem Chat anlegst, erscheinen hier.',
  'list.emptyInactive': 'Es gibt keine beendeten automatischen Aufträge',
  'list.noMatches': 'Kein automatischer Auftrag passt zur Suche',
  'search.label': 'Aufträge durchsuchen',
  'search.placeholder': 'Automatische Aufträge durchsuchen',
  'search.clear': 'Suche leeren',
  'empty.action': 'Automatischen Auftrag anlegen',
  'statusFilter.label': 'Zustand des Auftrags',
  'statusFilter.all': 'Alle',
  'status.active': 'Eingeschaltet',
  'status.inactive': 'Beendet',

  // ── Einzelheiten ───────────────────────────────────────────────────────────
  'detail.label': 'Einzelheiten des Auftrags',
  'detail.close': 'Einzelheiten schliessen',
  'detail.more': 'Aktionen für den Auftrag',
  'detail.nextRun': 'Nächster Lauf',
  'detail.tabs': 'Ansichten der Einzelheiten',
  'detail.rule': 'Regel',
  'detail.records': 'Aufzeichnungen der Läufe',
  'detail.name': 'Name des Auftrags',
  'detail.instruction': 'Inhalt des Auftrags',
  'detail.status': 'Zustand',
  'detail.next': 'Nächste geplante Zeit',
  'detail.frequency': 'Häufigkeit',
  'detail.id': 'Kennung',
  'detail.session': 'Zugehöriger Chat',
  'detail.openSession': 'Zugehöriger Chat: den ursprünglichen Chat öffnen',
  'detail.openSessionTitle': 'Zugehöriger Chat {title}: den ursprünglichen Chat öffnen',
  'detail.sessionLoading': 'Die Angaben zum ursprünglichen Chat werden geladen',
  'detail.sessionArchived': 'Der ursprüngliche Chat ist archiviert',
  'detail.sessionUnavailable': 'Der ursprüngliche Chat ist zur Zeit nicht verfügbar',
  'detail.missing': 'Diesen Auftrag gibt es nicht mehr — vielleicht wurde er gelöscht',

  // ── Aufzeichnungen der Läufe ───────────────────────────────────────────────
  'delivery.label': 'Gespeicherte Aufzeichnungen der Läufe',
  'delivery.empty': 'Noch keine Aufzeichnung',
  'delivery.loading': 'Die Aufzeichnungen werden geladen…',
  'delivery.error': 'Die Aufzeichnungen liessen sich nicht laden',
  'delivery.notFound': 'Der Auftrag ist nicht mehr verfügbar',
  'delivery.cursorError': 'Die Aufzeichnungen wurden erneuert',
  'delivery.retry': 'Erneut versuchen',
  'delivery.refresh': 'Neu laden',
  'delivery.loadMore': 'Mehr laden',
  'delivery.expand': 'Ausklappen',
  'delivery.collapse': 'Einklappen',
  'delivery.pruned': 'Ältere Aufzeichnungen wurden aufgeräumt',
  'delivery.retention': 'Aufbewahrung',
  'delivery.retentionBounds': 'Je Auftrag werden höchstens {records} Aufzeichnungen aus den letzten {days} Tagen behalten.',
  'delivery.retentionExplanation': 'Kommen neue Aufzeichnungen hinzu, werden ältere ausserhalb dieser Grenze selbsttätig aufgeräumt. Das Aufräumen stört den weiteren Lauf des Auftrags nicht.',

  // ── Zeitregel ──────────────────────────────────────────────────────────────
  'frequency.once': 'Nur einmal',
  'frequency.every': 'Alle {value} {unit}',
  'rule.title': 'Laufzeit',
  'rule.repeat': 'Wiederholung',
  'rule.weekday': 'Wochentag',
  'rule.weekdayOption': '{weekday}',
  'rule.unsaved': 'Es gibt ungespeicherte Änderungen',
  'rule.save': 'Änderungen speichern',
  'rule.saving': 'Wird gespeichert…',
  'rule.cancel': 'Abbrechen',
  'rule.invalidTitle': 'Der Name darf höchstens 120 Zeichen haben',
  'rule.invalidPrompt': 'Gib den Inhalt des Auftrags ein',
  'rule.once': 'Nur einmal',
  'rule.everyMinutes': 'Alle N Minuten',
  'rule.everyHours': 'Alle N Stunden',
  'rule.everySeconds': 'Alle N Sekunden',
  'rule.daily': 'Täglich',
  'rule.weekdays': 'Montag bis Freitag',
  'rule.weekly': 'Wöchentlich',
  'rule.cron': 'Eigene Regel',
  'rule.cronLabel': 'Cron-Ausdruck',
  'rule.cronInvalid': 'Gib einen Cron-Ausdruck mit fünf Feldern ein, zum Beispiel 0 9 * * 1-5',
  'rule.zone.system': ' (System)',
  'rule.error.conflict': 'Der Auftrag hat sich vor dem Speichern geändert. Angezeigt wird die gespeicherte Regel. Versuche es erneut.',
  'rule.error.notFound': 'Dieser Auftrag ist zur Zeit nicht verfügbar',
  'rule.error.unknown': 'Ob die Regel übernommen wurde, liess sich nicht feststellen. Angezeigt wird die gespeicherte Regel.',

  // ── Der Regel-Editor ───────────────────────────────────────────────────────
  'cronForm.frequency': 'Häufigkeit',
  'cronForm.monthly': 'Monatlich',
  'cronForm.weekly': 'Wöchentlich',
  'cronForm.daily': 'Täglich',
  'cronForm.dates': 'An diesen Tagen',
  'cronForm.dateOption': 'Am {day}.',
  'cronForm.atMinute': 'Zur Minute',
  'cronForm.minuteIncrease': 'Minute erhöhen',
  'cronForm.minuteDecrease': 'Minute verringern',

  // ── Zeit und Zeitzone ──────────────────────────────────────────────────────
  'timing.date': 'Datum',
  'timing.time': 'Uhrzeit',
  'timing.hour': 'Stunde',
  'timing.minute': 'Minute',
  'timing.second': 'Sekunde',
  'timing.prevMonth': 'Voriger Monat',
  'timing.nextMonth': 'Nächster Monat',
  'timing.zone': 'Zeitzone',
  'timing.zoneSearch': 'Nach UTC-Versatz, IANA-Kennung oder Stadt suchen',
  'timing.zoneNoResults': 'Keine Zeitzone passt zur Suche',
  'timing.interval': 'Abstand der Wiederholung',
  'timing.intervalIncrease': 'Abstand vergrössern',
  'timing.intervalDecrease': 'Abstand verkleinern',
  'timing.unit.hour': 'Stunden',
  'timing.unit.minute': 'Minuten',
  'timing.unit.second': 'Sekunden',
  'timing.intervalHint.hour': 'Mindestens 1 Stunde. Der Abstand zählt ab dem Anlegen des Auftrags oder ab der letzten Regeländerung und hängt nicht von der Zeitzone ab.',
  'timing.intervalHint.minute': 'Mindestens 1 Minute. Der Abstand zählt ab dem Anlegen des Auftrags oder ab der letzten Regeländerung und hängt nicht von der Zeitzone ab.',
  'timing.intervalHint.second': 'Mindestens 60 Sekunden. Der Abstand zählt ab dem Anlegen des Auftrags oder ab der letzten Regeländerung und hängt nicht von der Zeitzone ab.',
  'timing.zoneNoStored': 'Ein einmaliger Auftrag speichert nur den Zeitpunkt, nicht die Zeitzone. Datum und Uhrzeit werden in die gewählte Zeitzone umgerechnet.',
  'timing.inactive': 'Ein beendeter Auftrag ist nur lesbar; die Zeit lässt sich nicht ändern.',
  'timing.conflict': 'Der Auftrag hat sich während der Bearbeitung geändert; dein Entwurf bleibt erhalten. Lade neu, brich ab und öffne den Editor erneut, um die neueste Regel zu ändern.',
  'timing.notFound': 'Dieser Auftrag ist zur Zeit nicht verfügbar; dein Entwurf bleibt erhalten. Brich ab, um den Editor zu schliessen.',
  'timing.invalid': 'Gib ein gültiges Datum und eine gültige Uhrzeit ein, oder prüfe die Zeitfelder.',
  'timing.invalidZone': 'Gib eine gültige IANA-Zeitzone ein, zum Beispiel Europe/Berlin',
  'timing.notFuture': 'Wähle ein Datum und eine Uhrzeit in der Zukunft',
  'timing.invalidInterval': 'Gib einen Abstand von mindestens 1 Minute ein',
  'timing.invalidInterval.hour': 'Gib einen Abstand von mindestens 1 Stunde ein',
  'timing.invalidInterval.minute': 'Gib einen Abstand von mindestens 1 Minute ein',
  'timing.invalidInterval.second': 'Gib einen Abstand von mindestens 60 Sekunden ein',
  'timing.error': 'Ob die Zeitänderung gespeichert wurde, liess sich nicht feststellen. Dein Entwurf bleibt erhalten; prüfe den Auftrag, bevor du es erneut versuchst.',

  // ── Löschen ────────────────────────────────────────────────────────────────
  'delete.action': 'Auftrag löschen',
  'delete.title': 'Diesen Auftrag löschen?',
  'delete.description': 'Der Auftrag löst nichts mehr aus und wird samt seinen gespeicherten Aufzeichnungen gelöscht. Der ursprüngliche Chat und seine Nachrichten bleiben erhalten; bereits eingereihte Nachrichten werden nicht zurückgeholt.',
  'delete.confirm': 'Löschen bestätigen',
  'delete.cancel': 'Abbrechen',
  'delete.close': 'Bestätigung schliessen',
  'delete.pending': 'Wird gelöscht…',
  'toast.deleted': 'Der Auftrag ist gelöscht',
  'toast.deleteFailed': 'Der Auftrag liess sich nicht löschen',

  // ── Karten und Werkzeug ────────────────────────────────────────────────────
  'card.open': 'Öffnen',
  'card.openLabel': 'Einzelheiten des Auftrags öffnen: {title}',
  'card.deleted': 'Gelöscht',
  'tool.invoked': '{name} aufgerufen',
}
