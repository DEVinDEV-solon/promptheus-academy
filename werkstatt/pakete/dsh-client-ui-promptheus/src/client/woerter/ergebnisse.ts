/**
 * PROMPTHEUS Werkstatt — deutsche Texte des Namensraums `deliverables`.
 *
 * Quelle: `packages/client/ui-deliverables/src/client/locales.ts`
 * (Fassung 0.2.0-rc.2), **60 Texte**.
 *
 * Der Namensraum beschreibt, was eine Runde hervorgebracht hat: die erzeugten
 * Dateien, die Änderungen und die Ansicht der Unterschiede.
 *
 * **„Turn" heisst hier Runde** — dieselbe Festlegung wie im Namensraum
 * `conversation`, damit die Oberfläche nicht an zwei Stellen verschieden spricht.
 *
 * **Platzhalter bleiben unverändert** (`{count}`, `{name}`, `{turn}`) —
 * `woerter_pruefen.mjs` prüft das je Schlüssel.
 */

/** Die deutschen Texte des Namensraums `deliverables`. */
export const ergebnisse: Record<string, string> = {
  // ── Erzeugte Dateien ───────────────────────────────────────────────────────
  'presented.nativeUnavailable': 'Für diese Datei gibt es keinen Pfad auf diesem Rechner. Sie lässt sich in der Seitenleiste ansehen.',
  'presented.revealError': 'Die Datei liess sich im Dateimanager nicht zeigen. Versuche es noch einmal.',
  'presented.directoryError': 'Der Ordner liess sich nicht öffnen. Versuche es noch einmal.',
  'presented.directoryOpening': 'Der Ordner wird geöffnet…',
  'presented.directoryOpened': 'Der Ordner wurde angefordert',
  'presented.revealed': 'Im Dateimanager angefordert',
  'presented.revealing': 'Wird im Dateimanager gezeigt…',
  'presented.unavailable': 'Auf diesem Rechner gibt es keinen Desktop, über den sich Dateien oder Ordner mit einem anderen Programm öffnen liessen. Ansehen in der Seitenleiste geht weiterhin.',
  'presented.retry': 'Erneut versuchen',
  'presented.hostError': 'Die Angaben zum Desktop liessen sich nicht lesen.',
  'presented.preview': 'In der Seitenleiste ansehen',
  'presented.previewButton': '{name} in der Seitenleiste öffnen',
  'presented.previewCard': '{name} in der Seitenleiste ansehen',
  'presented.all': 'Alle {count} Dateien',
  'presented.expandAria': 'Alle {count} erzeugten Dateien ausklappen',
  'presented.collapse': 'Einklappen',
  'presented.collapseAria': 'Die Liste der erzeugten Dateien einklappen',
  'presented.opening': 'Wird geöffnet…',
  'presented.opened': 'Öffnen angefordert',
  'presented.error': 'Das Öffnen ist gescheitert. Klicke, um es erneut zu versuchen.',
  'presented.file': 'Datei',

  // ── Die Zeile unter der Antwort ────────────────────────────────────────────
  'row.title': 'Erzeugte Dateien',
  'row.running': 'Wird erzeugt',
  'row.preparing': 'Wird vorbereitet',
  'row.ok': 'Erzeugt',
  'row.error': 'Gescheitert',
  'row.stopped': 'Unterbrochen',
  'row.inspect': 'Aufruf ansehen',

  // ── Geänderte Dateien ──────────────────────────────────────────────────────
  'changes.title': '{count} Dateien bearbeitet',
  'changes.singleTitle': '{name} bearbeitet',
  'changes.added': '+{count}',
  'changes.deleted': '−{count}',
  'changes.binary': 'Binärdatei',
  'changes.openReview': 'Die Änderungen dieser Runde in der Seitenleiste ansehen',
  'changes.all': 'Alle {count} Dateien',
  'changes.expandAria': 'Alle {count} geänderten Dateien ausklappen',
  'changes.collapse': 'Einklappen',
  'changes.collapseAria': 'Die Liste der geänderten Dateien einklappen',
  'changes.oversized': 'Zu gross',
  'changes.viewDiff': 'Die Änderungen an {name} ansehen',

  // ── Ansicht der Unterschiede ───────────────────────────────────────────────
  'review.title': 'Änderungen der Runde {turn}',
  'review.selectFile': 'Wähle eine Datei zum Ansehen',
  'review.split': 'Auf Nebeneinander umstellen',
  'review.unified': 'Auf Untereinander umstellen',
  'review.splitAria': 'Nebeneinander',
  'review.wrap': 'Zeilenumbruch einschalten',
  'review.nowrap': 'Zeilenumbruch ausschalten',
  'review.wrapAria': 'Zeilenumbruch',
  'review.openFile': 'Die ganze Datei in der Seitenleiste öffnen',
  'review.openFileAria': '{name} in der Seitenleiste öffnen',
  'diff.loading': 'Die Änderungen werden gelesen…',
  'diff.missing': 'Der Inhalt dieser Runde ist nicht mehr verfügbar',
  'diff.error': 'Die Änderungen liessen sich nicht lesen',
  'diff.binary': 'Binärdatei — die Änderungen lassen sich nicht zeigen',
  'diff.oversized': 'Die Datei ist zu gross — die Änderungen lassen sich nicht zeigen',
  'diff.created': 'In dieser Runde neu angelegt',
  'diff.deleted': 'In dieser Runde gelöscht',
  'diff.unchanged': 'Beide Seiten sind gleich',
  'diff.coarse': 'Der Zeilenvergleich hat zu lange gedauert; es wird der ganze Dateiaustausch gezeigt.',
  'diff.truncated': 'Es werden nur die ersten {count} Zeilen gezeigt',
}
