# Vier Sprachzeilen — Deutsch im DeepSeek Harness
#
# Diese Datei ist eine ANLEITUNG, kein ausführbarer Patch. Sie beschreibt die
# einzigen vier Änderungen, die im Harness-Quelltext nötig sind, damit die
# Oberfläche Deutsch sprechen kann. Sie werden in Runde 2 gesetzt.
#
# WARUM ÜBERHAUPT VIER ZEILEN
# Die Sprachebene des Harness kennt nur die Sprachen aus LOCALE_IDS. Ohne eine
# Zeile dort ist `de` nicht wählbar; ohne Wählbarkeit ist jede Übersetzung
# unerreichbar. Alles andere an der Sprachebene ist bereits mehrsprachig gebaut:
# register(ns, locale, dict) nimmt jeden Sprachschlüssel an, und die
# Nachschlage-Kette geht aktiv → en → Schlüsselname.
#
# WARUM NICHT MEHR
# Der andere Weg wäre, die 24 Wörterbücher des Harness selbst umzuschreiben.
# Dann wäre jede Aufwertung Handarbeit an 24 Dateien. Diese vier Zeilen sind
# das kleinere Übel und in einer Minute neu gesetzt.
#
# WICHTIG: NICHT die Dateien im Harness von Hand ändern, ohne das hier
# nachzuziehen. Sonst weiß beim nächsten Stand niemand, was fehlt.
#
# Siehe: PROMPTHEUS\vps\Pläne\40_Werkstatt\Deepseek-Dashboard-Maske-Plan.md §6.2

## Datei 1 von 2

packages/client/locale/src/locale-settings.ts

Suchen:   export const LOCALE_IDS = ['zh', 'en'] as const
Ersetzen: export const LOCALE_IDS = ['zh', 'en', 'de'] as const

Wirkung:  Die Sprachliste kennt Deutsch. Das Prüfschema darunter baut sich aus
          dieser Liste und nimmt `de` dadurch ebenfalls an. Ein gespeicherter
          Wert bleibt gültig.

## Datei 2 von 2

packages/client/locale/src/client/index.ts

Änderung 2a — die Auswahlliste:

Suchen:   const LOCALES: readonly LocaleDefinition[] = Object.freeze([
            { id: 'zh', label: '中文' },
            { id: 'en', label: 'English' },
          ])
Ersetzen: const LOCALES: readonly LocaleDefinition[] = Object.freeze([
            { id: 'zh', label: '中文' },
            { id: 'en', label: 'English' },
            { id: 'de', label: 'Deutsch' },
          ])

Änderung 2b — der Sprachwert der Seite:

Suchen:   const DOCUMENT_LANGUAGE: Record<LocaleId, string> = { zh: 'zh-CN', en: 'en' }
Ersetzen: const DOCUMENT_LANGUAGE: Record<LocaleId, string> = { zh: 'zh-CN', en: 'en', de: 'de' }

Wirkung:  Deutsch erscheint in den Einstellungen unter „Sprache", und die Seite
          meldet dem Browser `lang="de"`. Das ist wichtig für Silbentrennung,
          Vorlesewerkzeuge und die Rechtschreibprüfung.

## Danach

1. Deutsch in den Einstellungen wählen und die Seite neu laden — die Wahl muss
   bleiben (sie wird in den Benutzereinstellungen des Harness gespeichert).

2. `node werkzeuge\woerter_pruefen.mjs` laufen lassen. Es muss 651 von 651
   melden. Vor Runde 2 meldet es null deutsche Texte — das ist richtig, denn
   das Sprachpaket gibt es noch nicht. Die vier Zeilen allein ändern nichts
   Sichtbares: sie machen Deutsch nur wählbar.

3. Erst danach beginnt das Sprachpaket (`pakete\dsh-client-locale-de\`) mit dem
   Anmelden der 651 Texte je Namensraum.
