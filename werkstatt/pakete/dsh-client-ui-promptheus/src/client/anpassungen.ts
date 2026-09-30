/**
 * Feinanpassungen an der Oberfläche des Harness.
 *
 * Hier stehen die wenigen Stellen, an denen die Werkstatt anders aussehen soll
 * als der Harness. Alles davon ist **CSS über Vertrags-Selektoren** — kein
 * Eingriff in den Quelltext, kein Anfassen fremder Bausteine.
 *
 * **Warum `data-slot` und `html[lang]` und keine Klassennamen.** Die
 * Klassennamen des Harness sind erzeugt und wechseln mit jeder Fassung
 * (`.O6coaW_newSession` heute, etwas anderes morgen). Ein Selektor darauf
 * bräche bei der nächsten Aufwertung — lautlos. `data-slot` ist dagegen ein
 * **Steckplatz-Name** und damit Teil des veröffentlichten Vertrags;
 * `html[lang]` setzt der Harness selbst aus der gewählten Sprache
 * (`syncDocumentLanguage` in `locale/src/client/index.ts`).
 *
 * @module @promptheus/dsh-client-ui-promptheus/anpassungen
 */

/**
 * Der Hero-Titel der leeren Chatseite.
 *
 * **Warum das überhaupt sein muss.** Der Titel steht fest im Quelltext des
 * Harness (`EmptyHero.tsx`: `t('hero.headline')`), und der Harness meldet seine
 * englischen Wörterbücher **selbst** an. Ein zweiter `locale.register` für `en`
 * wirft („already has locale"), `en` lässt sich also nicht überschreiben. Für
 * **Deutsch** geht es sauber — dort greift unser eigenes Wörterbuch.
 *
 * Für **Englisch** bleibt der Weg über die Anzeige: der Harness-Text wird
 * ausgeblendet und unser eigener eingesetzt. Das geschieht nur unter
 * `html[lang="en"]`; bei deutscher Sprache rendert der Harness unseren Text
 * ohnehin selbst, und es wird nichts verdoppelt.
 *
 * **Der Anker ist der eigene Steckplatz.** `conversation.hero.brand.mark` ist
 * die Stelle, an der unsere Bildmarke sitzt — die erste Zelle der Kopfzeile.
 * `:has(> …)` findet damit ihren Rahmen, `+ span` den Titel daneben. Beides ist
 * Aufbau, kein Name.
 *
 * **Was passiert, wenn der Harness umbaut.** Verschiebt er die Marke oder den
 * Titel, greift die Regel nicht mehr — dann erscheint wieder „Into the Unknown".
 * Das ist ein sichtbarer, harmloser Fehler, und
 * `werkzeuge/anpassungen_browser.mjs` prüft ihn nach.
 */
const HERO_TITEL_EN = 'Earn Talent…'

/**
 * Baut das Stylesheet der Feinanpassungen.
 * @returns das CSS.
 */
export function anpassungenCss(): string {
  return `
/* PROMPTHEUS Werkstatt — Feinanpassungen.
   Erzeugt von pakete/dsh-client-ui-promptheus/src/client/anpassungen.ts. */

/* ── 1. „Neue Session" linksbündig ──────────────────────────────────────────
   Der Harness zentriert Inhalt und Kürzel in der Knopfmitte
   (.newSessionContent { justify-content: center }). Die Werkstatt setzt den
   Text an den linken Rand, wie es die Liste darunter auch tut.

   **Der Anker.** Der gesuchte Knopf trägt kein Merkmal, das ihn allein
   auszeichnet: sein aria-label „New session" teilt er mit dem Markenknopf
   darüber, und aria-keyshortcuts mit mehreren. Seine INNERE FORM ist dagegen
   einmalig — nur hier steht eine Zelle, die ein Sinnbild UND eine Beschriftung
   nebeneinander führt:

       button > span > span:has(> svg):has(> span)

   Beim eingeklappten Streifen fehlt die Beschriftung; dann greift die Regel
   nicht, und es gibt auch nichts auszurichten. */
[data-slot="sidebar"] button > span > span:has(> svg):has(> span) {
  justify-content: flex-start;
  /* Der Inhalt füllt den Knopf nicht mehr mittig, deshalb rückt er an den
     Innenabstand — sonst klebte das Sinnbild am Rand. */
  padding-left: 2px;
}

/* ── 2. Der Hero-Titel: eigener Text statt „Into the Unknown" ───────────────
   Nur unter englischer Sprache — bei Deutsch rendert der Harness unseren Text
   aus dem eigenen Wörterbuch, und es wird nichts verdoppelt.

   **Der Anker.** Die Kopfzeile des Heros ist

       <div class="headline">
         <span>                       ← die Marke und ihr Rahmen
           <div data-slot="conversation.hero.brand.mark">…
         </span>
         <span class="titleGroup">     ← hier steht der Titel
           <span>Into the Unknown</span>
           <span class="previewBadge">Preview</span>
         </span>
       </div>

   Der Titel ist das ERSTE KIND der Titelgruppe. Eine erste Fassung hatte eine
   Ebene zu tief gesucht und traf ihn deshalb nicht: der eingefügte Text
   erschien, der englische blieb aber daneben stehen.

   **Keine Backticks in diesen Kommentaren.** Sie stehen in einer
   Vorlagenzeichenkette von TypeScript; ein Backtick darin beendet sie, und der
   Bau bricht ab. Das ist zweimal passiert. */
html[lang="en"] span:has(> [data-slot="conversation.hero.brand.mark"]) + span > span:first-child {
  display: none;
}
html[lang="en"] span:has(> [data-slot="conversation.hero.brand.mark"]) + span::before {
  content: "${HERO_TITEL_EN}";
}
`.trim()
}
