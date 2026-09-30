/**
 * PROMPTHEUS Werkstatt — Client-Hälfte.
 *
 * Belegt Steckplätze der Oberfläche:
 *
 *   sidebar.brand.mark                     die Bildmarke (Flamme im Mäanderring)
 *   sidebar.brand.name                     der Schriftzug PROMPTHEUS · Werkstatt
 *   conversation.hero.brand.mark           dieselbe Marke auf der Startseite
 *   sidebar.footer.action                  der Weg in die Gemeinde (Community)
 *   conversation.session.header.utilities  derselbe Weg im Sitzungskopf
 *
 * Die Marken-Belegungen sind EINZELplätze: der bisherige Bewohner (der Wal) wird
 * verdrängt. Das ist hier gewollt und ohne Verlust — es ist eine reine
 * Markenstelle. Die beiden Gemeindeknöpfe liegen auf LISTEN: sie reihen sich
 * ein, ohne etwas zu verdrängen (Entscheidung E7, Plan §1.3).
 *
 * Bauart: dieses Paket liegt AUSSERHALB des Harness-Workspace und wird mit
 * esbuild gebündelt. Deshalb gelten zwei Regeln, die sich vom Bau-Preset des
 * Harness unterscheiden:
 *
 *   1. React kommt über den eingespeisten `require` des Modulträgers, nicht
 *      über einen Kopf-Import. Alles andere würde eine zweite React-Ausgabe
 *      einschleusen und die Haken des Harness brechen.
 *   2. Kein JSX. React-Elemente entstehen über `React.createElement`.
 *
 * Und eine Regel, die aus dem Brand folgt: es werden NUR eigene Elemente
 * gestaltet. Kein Selektor auf fremdes DOM des Harness, kein `document.body`.
 * Das Ornament sitzt deshalb auf dem eigenen Schriftzug, nicht auf einer
 * fremden Kopfleiste (Abweichung von K-KOPFKANTE, siehe Abnahme Runde 1).
 *
 * Siehe: PROMPTHEUS\vps\Pläne\40_Werkstatt\Deepseek-Dashboard-Maske-Plan.md
 *
 * @module @promptheus/dsh-client-ui-promptheus/client
 */

import { anpassungenCss } from './anpassungen.ts'
import { hintergrundCss } from './hintergrund.ts'
import { layerAus, Palettenwaehler, SCHICHT } from './farbkasten.ts'
import { FarbkastenZeile } from './farbkasten-zeile.ts'
import { BILDMARKE, MAEANDER } from './marke.ts'
import { gespraech } from './woerter/gespraech.ts'
import { ergebnisse } from './woerter/ergebnisse.ts'
import { erweiterungen } from './woerter/erweiterungen.ts'
import {
  auftraege, erweiterungsliste, rechteSpalte, unteragenten, unteragentenEinstellungen,
} from './woerter/runde3.ts'
import {
  befehle, dateibrowser, konto, rueckfragen, tastenkuerzel,
} from './woerter/runde4.ts'
import {
  agentenschleife, arbeitsablauf, arbeitsbereichsdateien, ausloeser,
  eingebauteErweiterungen, erscheinungsbild, fertigkeiten, freigabe, netzsuche,
  oertlichOeffnen, plan, rueckmeldung, seitenleistenTerminal, sitzungsprotokoll,
  terminalEinstellungen, verweise, ziele,
} from './woerter/runde5.ts'
import { voreinstellungen } from './woerter/voreinstellungen.ts'
import {
  bildvorschau, codevorschau, dokumentrahmen, htmlvorschau, markdownvorschau,
  officevorschau, pdfvorschau, tabellenvorschau,
} from './woerter/dokumentvorschau.ts'
import {
  gemeinsameSprache, layoutbefehle, modelleinstellungen, sprachzeile,
} from './woerter/grundsprache.ts'
import { gespraechstexte } from './woerter/gespraech2.ts'
import { zeitplanverwaltung } from './woerter/zeitplanverwaltung.ts'
import { zeitregeln } from './woerter/zeitregeln.ts'
import {
  model, settingsGeneral, settingsPermission, settingsPermissionAccess, sidebar, trajectory, workspace,
} from './woerter.ts'

/** Die Fassung des Pakets, in der Maske angezeigt (K-FASSUNG, Runde 6). */
export const FASSUNG = '0.1.0'

/** Die Adresse der Gemeinde. */
export const GEMEINDE_URL = 'https://promptheus-academy.de/community'

/** Harte Abhängigkeit: ohne das Steckplatz-Register gibt es nichts zu belegen. */
export const inject = ['slots']

/** Die Farben der Marke, die auch außerhalb des Themas gebraucht werden. */
const GLUT = '#ff7a1c'
const GLUT_HELL = '#ffa347'
const GOLD = '#ffc94d'
const SERIFE = '"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif'
const SANS = '"Segoe UI",system-ui,Roboto,Helvetica,Arial,sans-serif'

/** Der Mäander als CSS-Maske, einmal gesetzt. */
const MAEANDER_MASKE = `url("data:image/svg+xml;utf8,${encodeURIComponent(MAEANDER)}")`

/**
 * Die Höhe der Markenzeile — die eine Zahl, an der alles hängt.
 *
 * Der Harness gibt der Zeile 24 px (`SidebarRoot.module.css`:
 * `.brandIdentity { height: 24px }`) und schneidet Überstand ab
 * (`.logoRow { overflow: hidden }`).
 *
 * Diese Zahl ist **abgeleitet**, nicht gewählt: sie ist die Summe der drei
 * Bestandteile des Schriftzugs. Wer eine Schriftgröße ändert, ändert damit
 * auch die Marke — so können beide nicht auseinanderlaufen.
 */
const ZEILENHOEHE = 13.1 + 8.0 + 2.0 // Titel 0.82rem + Zusatz .50rem + Mäander 2px

/**
 * Die Bildmarke als React-Baustein.
 *
 * **Die Größe folgt der Zeilenhöhe des Schriftzugs**, nicht dem Wunsch der
 * belegenden Stelle. Die belegende Stelle bietet 24 px an (`size`), aber die
 * Zeile ist nur {@link ZEILENHOEHE} px hoch — eine Marke in voller Zeilenhöhe
 * säße neben dem Text zu groß.
 *
 * Deshalb gilt: die Marke bekommt die Höhe des Schriftzugs, höchstens aber das,
 * was die belegende Stelle anbietet. Beide sitzen auf derselben Grundlinie
 * (`align-items: center` in `.brandIdentity`), sodass Marke und Text mittig
 * zueinander stehen.
 * @param eigenschaften - die Eigenschaften der belegenden Stelle.
 * @returns das Markenelement.
 */
function Marke(eigenschaften) {
  const React = require('react')
  const angeboten = typeof eigenschaften?.size === 'number' ? eigenschaften.size : 24
  // Die kleinere der beiden: die Zeilenhöhe gewinnt, die Stelle setzt die Grenze.
  const groesse = Math.min(angeboten, ZEILENHOEHE)
  return React.createElement('span', {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: `${groesse}px`,
      height: `${groesse}px`,
      flex: 'none',
    },
    // Wörtlich aus Brand/mark.svg. Kein CDN, keine Schriftanfrage (BRAND.md §9).
    dangerouslySetInnerHTML: { __html: BILDMARKE },
  })
}

/**
 * Der Schriftzug neben der Marke: PROMPTHEUS, darunter - W E R K S T A T T -.
 *
 * Die Serife trägt den Namen, die Grotesk den Zusatz — BRAND.md §3: „Die Serife
 * trägt den Inhalt, die Grotesk die Bedienung."
 *
 * **Die Gedankenstriche.** Der Zusatz steht zwischen zwei Strichen, wie eine
 * Klammer im Satz. Sie sind TEIL DES ZUSATZES und stehen im selben Element:
 * dieselbe Sperrung, dieselbe Schrift, dieselbe Farbe. Ein zweites Element
 * hätte eigene Maße gebraucht und wäre bei jeder Änderung der Zeilenhöhe
 * auseinandergelaufen.
 *
 * Darunter sitzt der Mäander als 2-px-Kante: das EINE Ornament dieser Fläche
 * (BRAND.md §5). Er liegt auf einem eigenen Element, nicht über Text, und
 * färbt sich aus dem Gold-Token.
 * @returns der Schriftzug.
 */
function Wortmarke() {
  const React = require('react')
  // **Die Maße sind keine Geschmacksfrage, sondern eine Rechnung.**
  //
  // Der Harness gibt der Markenzeile genau **24 px** Höhe
  // (`SidebarRoot.module.css`: `.brandIdentity { height: 24px }`) und schneidet
  // Überstand ab (`.logoRow { overflow: hidden }`). Für Marke, Name, Zusatz und
  // Ornament stehen also zusammen 24 px zur Verfügung — und die Bildmarke daneben
  // sitzt auf derselben Grundlinie.
  //
  // Drei Fassungen, damit die Rechnung nachvollziehbar bleibt:
  //   1. 16,3 (1.02rem) + 8,8 (.55rem) + 6 (3+3) = 31,1 px  → abgeschnitten
  //   2. 12,2 (0.76rem) + 6,7 (.42rem) + 4 (2+2) = 22,9 px  → zu klein geraten
  //   3. 13,1 (0.82rem) + 8,0 (.50rem) + 2 (2+0) = 23,1 px  → diese Fassung
  //
  // Fassung 3 erfüllt beide Wünsche: der Titel ist wieder größer als in 2, und
  // der Zusatz ist um ein Punkt (1,333 px) gewachsen — von 6,7 auf 8,0 px.
  //
  // Der Mäander sitzt ohne Abstand direkt unter dem Zusatz (`marginTop: 0`).
  // Das ist der Grund, warum die Vergrößerung überhaupt hineinpasst: die zwei
  // Pixel Zwischenraum waren nicht nötig, weil die Kante auf der Grundlinie
  // liegt.
  //
  // Wer hier etwas vergrößert, muss diese Rechnung neu machen.
  return React.createElement(
    'span',
    { style: { display: 'inline-flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 } },
    React.createElement(
      'span',
      { style: { display: 'inline-flex', flexDirection: 'column', lineHeight: 1, whiteSpace: 'nowrap' } },
      React.createElement('span', {
        style: {
          fontFamily: SERIFE,
          fontSize: '0.82rem',
          fontWeight: 600,
          letterSpacing: '.05em',
          color: 'inherit',
        },
      }, 'PROMPTHEUS'),
      React.createElement('span', {
        style: {
          fontFamily: SANS,
          fontSize: '.50rem',
          fontWeight: 500,
          // Der gewünschte Zeichenabstand: „- W E R K S T A T T -".
          // .34em bei .50rem ≈ 2,7 px zwischen den Zeichen — sichtbar gesperrt,
          // aber noch lesbar als Wort. (.22em waren zu eng dafür.)
          letterSpacing: '.34em',
          textTransform: 'uppercase',
          // Hinweiston, nicht Haupttext — BRAND.md §3.
          opacity: '.6',
        },
      }, '- Werkstatt -'),
    ),
    React.createElement('span', {
      'aria-hidden': 'true',
      style: {
        display: 'block',
        height: '2px',
        marginTop: '0',
        background: GOLD,
        opacity: '.5',
        WebkitMask: `${MAEANDER_MASKE} repeat-x left center / 32px 32px`,
        mask: `${MAEANDER_MASKE} repeat-x left center / 32px 32px`,
      },
    }),
  )
}

/**
 * Der Gemeindeknopf im Fuß der linken Spalte.
 *
 * Führt in die Gemeinde unter promptheus-academy.de/community.
 *
 * Er trägt die Glutfarbe als Zeichen dafür, dass er weiterführt — BRAND.md §1:
 * „Glut heisst: hier geht es weiter." Das Zeichen ist ein Punkt, kein Symbol;
 * ein Roboter oder eine Verlaufskugel wäre verboten (BRAND.md §9).
 * @param eigenschaften - `wide` sagt, ob der breite Zustand gilt.
 * @returns der Gemeindeknopf.
 */
function Gemeindeknopf(eigenschaften) {
  const React = require('react')
  const breit = eigenschaften?.wide !== false
  return React.createElement(
    'a',
    {
      href: GEMEINDE_URL,
      target: '_blank',
      rel: 'noreferrer',
      title: 'Zur Gemeinde der PROMPTHEUS Academy',
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        // **Linksbündig, nicht mittig.** Der Knopf steht in einer Spalte mit
        // lauter linksbündigen Zeilen (Arbeitsbereiche, Erweiterungen,
        // Einstellungen). Mittiger Text darin liest sich wie ein Fremdkörper.
        justifyContent: 'flex-start',
        gap: '.45rem',
        height: '34px',
        padding: breit ? '0 .7rem' : '0',
        margin: '0 2px 6px',
        boxSizing: 'border-box',
        border: '1px solid var(--dsw-alias-border-l2, rgba(255,255,255,.14))',
        borderRadius: '10px',
        background: 'transparent',
        color: 'var(--dsw-alias-label-primary, #ede5db)',
        fontFamily: SANS,
        fontSize: '.8rem',
        fontWeight: 500,
        lineHeight: 1,
        textAlign: 'left',
        textDecoration: 'none',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        flex: '1',
        minWidth: 0,
        overflow: 'hidden',
      },
    },
    React.createElement('span', {
      'aria-hidden': 'true',
      style: {
        flex: 'none',
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: `linear-gradient(180deg, ${GLUT_HELL}, ${GLUT})`,
      },
    }),
    breit ? React.createElement('span', { style: { overflow: 'hidden', textOverflow: 'ellipsis' } }, 'Community') : null,
  )
}

/**
 * Derselbe Weg in die Gemeinde, im Kopf einer Sitzung.
 *
 * Bewusst schlicht: der Kopf trägt schon viele Knöpfe, und ein zweiter
 * auffälliger wäre Lärm. Darum der Zweittext-Ton, nicht die Glut.
 * @returns der Knopf.
 */
function GemeindeImKopf() {
  const React = require('react')
  return React.createElement(
    'a',
    {
      href: GEMEINDE_URL,
      target: '_blank',
      rel: 'noreferrer',
      title: 'Zur Gemeinde der PROMPTHEUS Academy',
      'aria-label': 'Zur Gemeinde',
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '.35rem',
        height: '28px',
        padding: '0 .55rem',
        borderRadius: '8px',
        color: 'var(--dsw-alias-label-secondary, #b3a596)',
        fontFamily: SANS,
        fontSize: '.76rem',
        lineHeight: 1,
        textDecoration: 'none',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      },
    },
    React.createElement('span', {
      'aria-hidden': 'true',
      style: {
        flex: 'none',
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: `linear-gradient(180deg, ${GLUT_HELL}, ${GLUT})`,
      },
    }),
    'Community',
  )
}

/**
 * Verdrahtet den Farbkasten mit dem Themendienst.
 *
 * **Warum der Halter den Dienst nicht selbst kennt.** Der Halter trägt nur eine
 * Kennung; wie sie in die Oberfläche kommt, weiss er nicht. Das ist dieselbe
 * Trennung, die der Harness zwischen Dienst und Presenter zieht, und sie hat
 * hier einen greifbaren Nutzen: `overrideTokens` und `setTheme` sind die
 * einzigen Stellen, die den Themendienst brauchen, und sie liegen in dieser
 * Funktion.
 *
 * **Warum der Layer ersetzt und nicht gestapelt wird.** `overrideTokens` führt
 * JE QUELLE genau eine Schicht. Derselbe Quellenname bei jeder Wahl bedeutet
 * deshalb: die alte Schicht verschwindet und wird durch die neue ersetzt.
 * Andernfalls sammelten sich sechs Schichten an, und die zuletzt gedrückte
 * gewänne aus dem falschen Grund.
 *
 * **Der Harness-Schalter wird nachgezogen, nicht umgangen.** Eine Palette wählen
 * heisst auch: ihren Grundton wählen. Sonst wählte man Terrakotta und sähe
 * nichts davon, weil der Schalter noch auf hell steht. Umgekehrt liest der
 * Halter jede Bewegung des Schalters mit (`theme/change`) und zeigt dann die
 * Partnerpalette als die wirksame.
 * @param theme - der Themendienst des Harness.
 * @returns der Halter und sein Abräumer.
 */
function farbkastenAufbauen(theme) {
  // Die laufende Schicht. Sie wird bei jeder Wahl abgelöst, damit sich nichts
  // ansammelt.
  let abraeumer
  const eintragen = (kennung) => {
    abraeumer?.()
    abraeumer = theme.overrideTokens(SCHICHT, layerAus(kennung))
  }
  const waehler = new Palettenwaehler(eintragen, theme.getTheme().active.colorScheme)
  return { waehler, abraeumer: () => abraeumer?.() }
}

/**
 * Die deutschen Wörterbücher, je Namensraum eines.
 *
 * Der Harness kennt `zh` und `en`; `de` ist frei, also belegt dieses Paket es.
 * Die Schlüssel stehen genau so, wie der Harness sie führt — geprüft von
 * `werkzeuge/woerter_pruefen.mjs`.
 */
const WOERTERBUECHER = [
  ['sidebar', sidebar],
  ['settings', settingsGeneral],
  ['trajectory', trajectory],
  ['model', model],
  // Der größte Namensraum des Harness: 369 Texte. Das Wörterbuch liegt in einer
  // eigenen Datei (`woerter/gespraech.ts`), damit die Übersicht erhalten bleibt.
  ['conversation', gespraech],
  // Erweiterungsverwaltung: 189 Texte.
  ['pluginManager', erweiterungen],
  // Erzeugte Dateien und Änderungen einer Runde: 60 Texte.
  ['deliverables', ergebnisse],
  // Runde 3: fünf Namensräume mit zusammen 187 Texten.
  ['settings.pluginInventory', erweiterungsliste],
  ['job', auftraege],
  ['subagent', unteragenten],
  ['settings.subagent', unteragentenEinstellungen],
  ['sidebarRight', rechteSpalte],
  // Runde 4: fünf Namensräume mit zusammen 146 Texten.
  ['shortcuts', tastenkuerzel],
  ['question', rueckfragen],
  ['settings.account', konto],
  ['command', befehle],
  ['sidebarBrowser', dateibrowser],
  // Runden 5 bis 9: die kleinen Namensräume, zusammen 228 Texte.
  //
  // **`sidebarDocumentPreview` steht NICHT hier.** Er steht weiter unten bei den
  // acht Namensräumen der Dokumentvorschau. Er stand eine Zeitlang an beiden
  // Stellen — und das war ein Fehler mit Folgen: der zweite `register` wirft
  // (`already has locale "de"`), der ganze Effekt stirbt, und ALLE danach
  // folgenden Namensräume werden nie angemeldet. Am Bildschirm blieb die
  // Oberfläche halb englisch, und nichts meldete einen Fehler.
  //
  // **Eine Anmeldung ist EINMALIG.** Wer hier einen Namensraum hinzufügt, prüft
  // zuerst, ob er nicht schon weiter oben oder unten steht.
  ['feedback', rueckmeldung],
  ['settings.webSearch', netzsuche],
  ['workflowRun', arbeitsablauf],
  ['plan', plan],
  ['sidebarFiles', arbeitsbereichsdateien],
  ['open-in-app', oertlichOeffnen],
  ['settings.shell', terminalEinstellungen],
  ['sidebarTerminal', seitenleistenTerminal],
  ['goal', ziele],
  ['settings.agentLoop', agentenschleife],
  ['reference', verweise],
  ['slash.menu', ausloeser],
  ['settings.theme', erscheinungsbild],
  ['skill', fertigkeiten],
  ['approval', freigabe],
  ['settings.plugins', eingebauteErweiterungen],
  ['settings.sessionLog', sitzungsprotokoll],
  // Die beiden letzten: die Voreinstellungen des Agenten (60 Texte) und die
  // automatischen Aufträge (311 Texte in zwei Namensräumen).
  ['settings.agentPreset', voreinstellungen],
  ['schedule.catalog', zeitregeln],
  ['schedule.manager', zeitplanverwaltung],
  ['settings.permission', settingsPermission],
  // Der Namensraum des Zugriffsfensters heisst `permission.access`, NICHT
  // `settings.permission.access`. Die beiden Fenster (Einstellungszeile und
  // laufende Sitzung) führen ihre Texte bewusst getrennt, damit sie sich
  // unabhängig laden lassen (`ACCESS_NS` in ui-permission-presets).
  ['permission.access', settingsPermissionAccess],
  ['workspace', workspace],
  // ── Die Dokumentvorschau: acht Namensräume ────────────────────────────────
  //
  // **Diese acht fehlten.** Die Vorschau meldet ihre Texte über eigene Dateien
  // an, nicht über eine gemeinsame (`ui-sidebar-documentpreview/src/client/
  // {code,excel,html,image,markdown,office,pdf}/locales.ts`), und die Tabelle in
  // `woerter_pruefen.mjs` führte sie nicht. Das Werkzeug meldete deshalb „1.937
  // von 1.937" und war zufrieden, während 54 Texte unübersetzt blieben.
  // Gefunden hat das `uebersetzung_umfang.mjs`, nachdem es den Namensraum nicht
  // mehr aus dem Paketnamen riet.
  //
  // Der Zoom gehört zu mehreren: der Harness spreizt `zoomEn` in die
  // Wörterbücher von Tabelle, Bild und PDF (`...zoomEn`). Deshalb steht er in
  // jedem dieser drei – hier ist er in den Wörterbüchern selbst enthalten.
  ['sidebarDocumentPreview', dokumentrahmen],
  ['sidebarCodePreview', codevorschau],
  ['sidebarExcel', tabellenvorschau],
  ['documentHtml', htmlvorschau],
  ['sidebarImage', bildvorschau],
  ['documentMarkdown', markdownvorschau],
  ['sidebarOffice', officevorschau],
  ['sidebarPdf', pdfvorschau],
  // ── Die Grundsprache und die vier, die fehlten ────────────────────────────
  //
  // **`common` ist der wichtigste davon.** Es ist die gemeinsame Sprache des
  // Harness — „OK", „Abbrechen", „Speichern", „Suchen" — und steht an Dutzenden
  // Stellen. Fehlte sie, blieben gerade die alltäglichsten Knöpfe englisch.
  //
  // Die anderen drei sind einzelne Fenster: die Zeile „Sprache", die
  // Beschriftung des Spaltenbefehls, und das ganze Fenster „Modelle".
  //
  // Auch diese vier waren unsichtbar, solange die Namensraum-Tabelle von Hand
  // geführt wurde: sie standen nicht darin, also prüfte sie niemand.
  ['common', gemeinsameSprache],
  ['settings.locale', sprachzeile],
  ['shortcuts.layout', layoutbefehle],
  ['settings.models', modelleinstellungen],
  // **`chat` ist NICHT `conversation`.** Das ist der teuerste Irrtum dieses
  // Pakets gewesen: `conversation` (369 Texte) ist der Gesprächsverlauf des
  // Hauptfensters, `chat` (186 Texte) sind die Zustandstexte daneben — „Liest
  // Dateien", „Denkt nach", „Kontext verdichtet", die Statistiktafel. Weil die
  // Tabelle von Hand geführt wurde, stand `chat` nie darin, und die deutschen
  // Texte dafür fehlten ganz. Am Bildschirm sah man es an den Hinweisen über
  // jeder Runde, die englisch blieben.
  ['chat', gespraechstexte],
]

/**
 * Client-Rumpf: meldet die Belegungen an der Oberfläche an.
 * @param ctx - der Client-Kontext des Harness.
 */
export function apply(ctx) {
  const slots = ctx.slots

  // ── Hintergrundbild ────────────────────────────────────────────────────────
  //
  // Das Bild liegt auf der Chatfläche, mit einem Schleier aus dem Grundton
  // darüber (Bauart aus `srv/varianten.php`). Warum nicht in einem Steckplatz
  // und warum die Chatfläche: siehe `hintergrund.ts` — dort steht die Messung.
  //
  // Das Stylesheet wird als Effekt eingehängt und beim Abräumen wieder entfernt,
  // wie es der Harness für eigene Stile vorsieht (`ui-theme/src/client/styles.ts`).
  if (typeof document !== 'undefined') {
    ctx.effect(() => {
      const marke = document.createElement('style')
      marke.dataset.plugin = '@promptheus/dsh-client-ui-promptheus'
      marke.dataset.pluginCss = '@promptheus/dsh-client-ui-promptheus/hintergrund.css'
      marke.textContent = hintergrundCss()
      document.head.appendChild(marke)
      return () => { marke.remove() }
    }, 'promptheus: Hintergrundbild')

    // ── Feinanpassungen ──────────────────────────────────────────────────────
    // Zwei Stellen, an denen die Werkstatt anders aussieht als der Harness:
    // „Neue Session" linksbündig, und der Hero-Titel in englischer Sprache.
    // Beides über Vertrags-Selektoren — siehe `anpassungen.ts`.
    ctx.effect(() => {
      const marke = document.createElement('style')
      marke.dataset.plugin = '@promptheus/dsh-client-ui-promptheus'
      marke.dataset.pluginCss = '@promptheus/dsh-client-ui-promptheus/anpassungen.css'
      marke.textContent = anpassungenCss()
      document.head.appendChild(marke)
      return () => { marke.remove() }
    }, 'promptheus: Feinanpassungen')
  }

  // ── Sprache ────────────────────────────────────────────────────────────────
  //
  // **Warum `ctx.inject` und nicht `ctx.get`.** Die Dienste des Harness werden
  // nicht alle vor diesem Paket bereitgestellt; `ctx.get('locale')` liefert beim
  // Aufbau `undefined`, und die Anmeldung unterbliebe stillschweigend. Genau das
  // war der Fehler: die Oberfläche blieb englisch, und kein Werkzeug meldete
  // etwas, weil die Texte ja im Bündel standen. `ctx.inject` wartet, bis der
  // Dienst wirklich da ist — das ist der Weg, den der Harness selbst geht
  // (`ui-agent-preset` und andere).
  ctx.inject(['locale'], (lokal) => {
    // `register(ns, locale, dict)` nimmt jeden Sprachschlüssel an; `de` ist
    // frei, weil der Harness nur zh und en führt. Damit liegen alle deutschen
    // Texte an EINER Stelle, und keine Harness-Datei wird angefasst.
    lokal.effect(() => {
      const abraeumer = []
      for (const [ns, woerter] of WOERTERBUECHER) {
        try {
          abraeumer.push(lokal.locale.register(ns, 'de', woerter))
        } catch (fehler) {
          // **Sichtbar machen statt still sterben.** Ein `register` wirft, wenn
          // ein Namensraum schon mit `de` belegt ist. Ohne diese Meldung bricht
          // der ganze Effekt ab, und ALLE folgenden Namensräume werden nie
          // angemeldet — die Oberfläche bleibt halb englisch, und nichts sagt
          // einen Grund. Genau das ist passiert.
          console.error(`promptheus: „${ns}" liess sich nicht anmelden:`, fehler?.message)
          throw fehler
        }
      }
      return () => { for (const ab of abraeumer) ab() }
    }, 'promptheus: deutsche Texte')

    // **Beides ist nötig.** `register` legt nur die Wörterbücher ab. Wählbar
    // wird eine Sprache erst durch `addLanguage`: der Harness führt seine
    // Auswahlliste aus seinem eigenen Katalog (`BUILT_IN_LOCALES` = zh, en).
    // Ohne diesen Aufruf sind die 1.937 Texte zwar angemeldet, aber niemand
    // kann sie einschalten.
    //
    // `fallback: 'en'` ist Pflicht und die richtige Wahl: fehlt ein Schlüssel
    // einmal, erscheint Englisch statt Chinesisch.
    lokal.effect(
      () => lokal.locale.addLanguage({ id: 'de', label: 'Deutsch', fallback: 'en' }),
      'promptheus: Deutsch zur Auswahl stellen',
    )
  })

  // ── Farbkasten ─────────────────────────────────────────────────────────────
  //
  // Die gewählte Palette kommt über den Überschreibungs-Layer des Harness in
  // die Oberfläche — nicht über ein eigenes Thema. Warum, steht in
  // `farbkasten.ts`: der Farbwähler des Harness zeigt angemeldete Themen nicht,
  // und `setTheme` speichert sie nicht.
  //
  // Auch hier `ctx.inject`: derselbe Grund wie bei der Sprache. Fehlt der
  // Themendienst in einer anderen Zusammensetzung, unterbleibt nur der
  // Farbkasten — Marke und Gemeinde erscheinen weiterhin.
  ctx.inject(['theme'], (thema) => {
    const theme = thema.theme
    const { waehler, abraeumer } = farbkastenAufbauen(theme)
    // Beim Start einmal eintragen, dann je Wahl.
    waehler.anwenden()
    thema.effect(() => {
      // Jede Bewegung des Harness-Schalters mithören: dann zeigt das
      // Einstellungsfenster die Partnerpalette als die wirksame.
      const ab = thema.on('theme/change', (stand) => {
        // `stand.active.colorScheme` ist `'light'` oder `'dark'` — der Halter
        // übersetzt selbst in seinen Grundton.
        waehler.farbschemaSetzen(stand.active.colorScheme)
      })
      return () => { ab(); abraeumer() }
    }, 'promptheus: Farbkasten')

    // Die Einstellungszeile. `settings.general.item` ist eine LISTE: die Zeilen
    // des Harness bleiben stehen, diese reiht sich ein (Entscheidung E7).
    //
    // **Über `thema.slots`, nicht über `slots`.** Der Rückruf läuft in einem
    // eigenen Zweig; die Anmeldung muss auf DESSEN Kontext gehen, sonst hängt
    // sie am falschen Faden und wird beim Abräumen nicht mitgenommen. Genau so
    // macht es der Harness (`ui-agent-preset`: `scope.slots.register`).
    //
    // Der Zugang zur Wahl läuft über das `hooks`-Fach: dort wird der Halter zum
    // Haken `usePalette`, und der Baustein sieht nie den Halter selbst. Die
    // Schreibseite (`aufWahl`) ist gewöhnliches Geschäft und geht über `inject`.
    thema.slots.inject('settings.general.item', () =>
      thema.slots.register({
        name: 'settings.general.item',
        id: 'promptheus-farbkasten',
        order: 12,
        inject: () => ({
          hooks: { palette: waehler },
          aufWahl: (kennung) => {
            // Erst eintragen, dann den Harness-Schalter auf das Farbschema der
            // gewählten Palette ziehen — sonst bliebe der Bildschirm auf der
            // alten Seite stehen und die Wahl wäre unsichtbar.
            //
            // `waehlen` liefert bereits `'light'` oder `'dark'` (das Farbschema
            // des Harness). Eine frühere Fassung reichte `'hell'`/`'dunkel'`
            // weiter — `setTheme` warf, der `catch` unten schluckte es, und
            // **helle Paletten liessen sich gar nicht einschalten**. Stumm.
            const schema = waehler.waehlen(kennung)
            try {
              theme.setTheme(schema)
            } catch (fehler) {
              // Sichtbar machen statt schlucken. Der Fall kann eintreten, wenn
              // eine andere Zusammensetzung `light`/`dark` nicht führt — dann
              // gilt die Palette für die laufende Seite, und das gehört gesagt.
              console.warn(`promptheus: Farbschema „${schema}" liess sich nicht setzen —`, fehler?.message)
            }
          },
        }),
      }, FarbkastenZeile))
  })

  // ── Marke ──────────────────────────────────────────────────────────────────
  // Einzelplätze: der Wal wird verdrängt. Reine Markenstellen, kein Verlust.
  slots.inject('sidebar.brand.mark', () =>
    slots.register({ name: 'sidebar.brand.mark' }, Marke))
  slots.inject('sidebar.brand.name', () =>
    slots.register({ name: 'sidebar.brand.name' }, Wortmarke))
  slots.inject('conversation.hero.brand.mark', () =>
    slots.register({ name: 'conversation.hero.brand.mark' }, Marke))

  // ── Gemeinde ───────────────────────────────────────────────────────────────
  // Listen: es wird nichts verdrängt (Entscheidung E7).
  slots.inject('sidebar.footer.action', () =>
    slots.register(
      { name: 'sidebar.footer.action', id: 'promptheus-community', order: 10 },
      Gemeindeknopf,
    ))
  slots.inject('conversation.session.header.utilities', () =>
    slots.register(
      { name: 'conversation.session.header.utilities', id: 'promptheus-community-kopf', order: 10 },
      GemeindeImKopf,
    ))
}

export default { apply, inject }
