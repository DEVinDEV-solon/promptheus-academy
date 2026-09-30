/**
 * Zeitregeln und Erinnerungen (`schedule.catalog`).
 *
 * Quelle: `packages/client/ui-schedule/src/client/frequency-locales.ts`
 * und `locales.ts` (Fassung 0.2.0-rc.2).
 *
 * **Die Frequenz-Texte sind geteilt.** Der Harness führt sie in einer eigenen
 * Datei (`frequency-locales.ts`) und spreizt sie in **beide** Namensräume:
 * `schedule.catalog` (der Erinnerungs-Knopf) und `schedule.manager` (die
 * Verwaltung). Dasselbe geschieht hier — {@link frequenz} wird in beide
 * Wörterbücher hineingespreizt, damit die Wortwahl an einer Stelle steht.
 *
 * **Zwei Dinge, die hier anders sind als sonst:**
 *
 *   1. **`time.locale`** ist keine Beschriftung, sondern ein **Sprachkürzel für
 *      die Zeitangabe** (`zh-CN`). Deutsch ist `de-DE`. Ebenso ist
 *      `frequency.weekday.join` das Trennzeichen einer Aufzählung und
 *      `cron.list.join` das der Cron-Teile — beides wird zu `, `.
 *   2. **Wochentage werden ausgeschrieben** („montags"), weil
 *      `cron.weekday.name` sie in einen Satz einsetzt („Jeden Montag um …").
 *
 * **Platzhalter bleiben unverändert** — `woerter_pruefen.mjs` prüft das.
 */

/** Die geteilten Texte für Zeitregeln. 54 Stück, in beiden Namensräumen benutzt. */
export const frequenz: Record<string, string> = {
  // ── Zeitangabe ─────────────────────────────────────────────────────────────
  // Das Sprachkürzel bestimmt, wie Datum und Uhrzeit dargestellt werden.
  'time.locale': 'de-DE',
  'time.utcPrefix': 'UTC',

  // ── Wiederholungen ─────────────────────────────────────────────────────────
  'frequency.daily': 'Täglich um {time} ({timeZone})',
  'frequency.dailyLocal': 'Täglich um {time}',
  'frequency.weekly': 'Wöchentlich {weekdays} um {time} ({timeZone})',
  'frequency.weeklyLocal': 'Wöchentlich {weekdays} um {time}',
  'frequency.cron': 'Cron {expression} ({timeZone})',
  'frequency.cronLocal': 'Cron {expression}',
  'frequency.cronRule': '{rule} ({timeZone})',

  // ── Cron-Regel in Worte fassen ─────────────────────────────────────────────
  'cron.list.join': ', ',
  'cron.part.join': ' ',
  'cron.weekday.name': '{weekday}',
  'cron.weekday.range': '{from} bis {to}',
  'cron.months': ' im {months}',
  'cron.day.every': 'Jeden Tag{months}',
  'cron.day.weekdays': '{weekdays}{months}',
  'cron.day.monthDays': 'Am {days}. jedes Monats{months}',
  'cron.day.both': 'Am {days}. jedes Monats oder {weekdays}{months}',
  'cron.day.bothStarred': 'Am {days}. jedes Monats und {weekdays}{months}',
  'cron.hours.range': '{from} bis {to}',
  'cron.hours.list': '{hours}',

  // ── Uhrzeiten ──────────────────────────────────────────────────────────────
  'cron.time.everyMinute': 'Jede Minute',
  'cron.time.everyMinutes': 'Alle {step} Minuten',
  'cron.time.joinedEveryMinute': 'jede Minute',
  'cron.time.joinedEveryMinutes': 'alle {step} Minuten',
  'cron.time.everyHour': 'Jede Stunde',
  'cron.time.joinedEveryHour': 'jede Stunde',
  'cron.time.everyNHours': 'Alle {count} Stunden',
  'cron.time.joinedEveryNHours': 'alle {count} Stunden',
  'cron.time.hourlyAt': 'Jede Stunde zur Minute {minutes}',
  'cron.time.joinedHourlyAt': 'jede Stunde zur Minute {minutes}',
  'cron.time.hoursEveryMinute': 'jede Minute in den Stunden {hours}',
  'cron.time.hoursEveryMinutes': 'alle {step} Minuten in den Stunden {hours}',
  'cron.time.at': 'um {times}',
  'cron.time.hoursAt': 'zur Minute {minutes} in den Stunden {hours}',

  // ── Wochentage ─────────────────────────────────────────────────────────────
  'frequency.weekday.join': ', ',
  'frequency.weekday.1': 'montags',
  'frequency.weekday.2': 'dienstags',
  'frequency.weekday.3': 'mittwochs',
  'frequency.weekday.4': 'donnerstags',
  'frequency.weekday.5': 'freitags',
  'frequency.weekday.6': 'samstags',
  'frequency.weekday.7': 'sonntags',

  // ── Zeiteinheiten ──────────────────────────────────────────────────────────
  'unit.day.one': 'Tag',
  'unit.day.other': 'Tage',
  'unit.hour.one': 'Stunde',
  'unit.hour.other': 'Stunden',
  'unit.minute.one': 'Minute',
  'unit.minute.other': 'Minuten',
  'unit.second.one': 'Sekunde',
  'unit.second.other': 'Sekunden',

  // ── Verhältnis zur Jetztzeit ───────────────────────────────────────────────
  'relative.now': 'Jetzt fällig',
  'relative.future': 'in {value} {unit}',
  'relative.overdue': 'seit {value} {unit} überfällig',
}

/**
 * Der Erinnerungs-Knopf und seine kleine Liste (`schedule.catalog`).
 *
 * Quelle: `ui-schedule/src/client/locales.ts` (70 Schlüssel: 54 geteilte plus 16 eigene).
 */
export const zeitregeln: Record<string, string> = {
  ...frequenz,
  'trigger.label': 'Erinnerungen',
  'list.loading': 'Die Erinnerungen werden geladen…',
  'list.error': 'Die Erinnerungen liessen sich nicht laden.',
  'list.retry': 'Erneut versuchen',
  'delete.action': 'Löschen',
  'delete.pending': 'Wird gelöscht…',
  'delete.label': 'Erinnerung löschen: {title}',
  'list.open': 'Einzelheiten der Erinnerung öffnen: {title}',
  'trigger.one': '{count} Erinnerung',
  'trigger.other': '{count} Erinnerungen',
  'list.aria': 'Laufende Erinnerungen',
  'list.nextRun': 'Nächster Lauf',
  'frequency.once': 'Einmalig',
  'frequency.every': 'Alle {value} {unit}',
  'mark.aria': '{count} automatische Aufträge',
  'hover.more': 'und {count} weitere Aufträge',
}
