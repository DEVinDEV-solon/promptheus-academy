/**
 * PROMPTHEUS Werkstatt — Miniplayer für die Begrüssung: die Client-Hälfte.
 *
 * Er belegt **`shell.overlay`**: die rahmenweite Schwebe-Ebene des Harness über
 * allen Spalten. Sie ist eine **Liste**, dieser Eintrag reiht sich also ein und
 * verdrängt niemanden — anders als die Markenplätze der Maske, die
 * Einzelplätze sind.
 *
 * **Warum nicht ein Platz in der Kopfleiste.** Der Harness gibt die Kopfkante
 * der linken Spalte als Einzelplatz her (`shell.leading`); ihn zu belegen
 * hiesse, den vorhandenen Bewohner zu verdrängen. Der Auftrag lautet „oben im
 * Rahmen, rechts der Mitte", also eine schwebende Leiste — genau der Fall, für
 * den `shell.overlay` gedacht ist.
 *
 * **Zwei Regeln, die aus der Bauart folgen:**
 *
 *   1. React kommt über den eingespeisten `require` des Modulträgers, nicht über
 *      einen Kopf-Import. Sonst käme eine zweite React-Ausgabe hinzu und die
 *      Haken des Harness brächen. Kein JSX — Elemente entstehen über
 *      `React.createElement`.
 *   2. `shell.overlay` ist **klickdurchlässig**, bis ein Eintrag selbst
 *      Zeigerereignisse annimmt. Ohne `pointerEvents: 'auto'` auf der eigenen
 *      Leiste liesse sich der Knopf nicht drücken.
 *
 * Gestaltet wird nur das eigene Element; fremdes DOM wird nicht angefasst. Die
 * Farben kommen aus den Themen-Token des Harness, damit der Player in jeder
 * Palette und in hell wie dunkel sitzt; der Glutpunkt trägt die Marke.
 *
 * Die Beschriftung steht als deutsche Zeichenkette im Quelltext — dieselbe
 * Bauart wie beim Gemeindeknopf der Maske. Die Sprachtafeln des Harness sind
 * für dessen eigene Texte da, nicht für die eigenen.
 *
 * @module @promptheus/dsh-client-ui-audio/client
 */

window.__ModuleLoader__.load({
  id: '@promptheus/dsh-client-ui-audio',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    /**
     * Der Player hängt am Seitenkörper, wie die Fenster des Agenten-Teams.
     * In `shell.overlay` lag er in einer Ebene über deren Fenster (z-index
     * 9000 am Seitenkörper) und blieb darauf sichtbar. Am Seitenkörper mit
     * z-index 30 liegt er über der Werkstatt, aber unter jedem Fenster.
     * Fehlt ReactDOM, bleibt er dort, wo der Platz ihn zeichnet.
     */
    const anBody = (() => {
      try {
        const rd = require('react-dom')
        if (rd && typeof rd.createPortal === 'function') return knoten => rd.createPortal(knoten, document.body)
      } catch {
        // ohne ReactDOM: an Ort und Stelle zeichnen
      }
      return knoten => knoten
    })()

    /** Woher der Ton kommt — die Route der Node-Hälfte. */
    const QUELLE = '/promptheus-begruessung.mp3'

    /** Was auf der Leiste steht — die Stimme, die hier spricht. */
    const TITEL = 'HEPHAISTOS meint…'

    /**
     * Wie der Knopf heisst, für den Hinweistext und die Vorlesehilfe.
     *
     * Getrennt von {@link TITEL}: „HEPHAISTOS meint… abspielen" wäre kein Satz.
     * Der Hinweistext sagt die Sache, die Leiste sagt die Stimme.
     */
    const KNOPF_TEXT = 'Begruessung von Hephaistos'

    /** Die Markenfarben, die auch ausserhalb des Themas gebraucht werden. */
    const GLUT = '#ff7a1c'
    const GLUT_HELL = '#ffa347'
    const SANS = '"Segoe UI",system-ui,Roboto,Helvetica,Arial,sans-serif'

    /**
     * Wie weit die Leiste aus der Mitte nach rechts rückt.
     *
     * **Warum nicht genau mittig.** Im oberen Rand des Rahmens liegt in der
     * Mitte die Anzeige der laufenden Sitzung. Genau darüber lag die Leiste und
     * verdeckte sie.
     *
     * **Woher die Zahl kommt.** Die Leiste ist rund 300 px breit — Knopf, Titel,
     * Fortschritt und Zeit. Damit ihre LINKE Kante erst hinter der Mitte
     * beginnt, muss der Versatz mindestens ihre halbe Breite betragen, also
     * 150 px, dazu 20 px Luft. Deshalb 170.
     *
     * **Die eine Zahl zum Nachziehen.** Wird oben weiter rechts oder links
     * gebraucht, ändert sich nur dieser Wert. Er wirkt als Zuschlag auf die
     * halbe Fensterbreite, die Leiste bleibt also mittig auf diesem Punkt.
     * Ändert sich die Beschriftung, ändert sich die Breite — dann gehört diese
     * Zahl mitgezogen.
     */
    const SEITWAERTS = '170px'

    /**
     * Die Leiste: fest, oben rechts der Mitte, schmal.
     *
     * `position: 'fixed'` und nicht `absolute`: die Schwebe-Ebene ist selbst
     * `absolute` innerhalb des Rahmens. Ein `fixed` darin hängt am Fenster und
     * bleibt oben stehen, auch wenn der Rahmen seine Grösse ändert.
     */
    const RAHMEN = {
      position: 'fixed',
      top: '8px',
      left: `calc(50% + ${SEITWAERTS})`,
      transform: 'translateX(-50%)',
      display: 'flex',
      alignItems: 'center',
      gap: '.5rem',
      height: '30px',
      padding: '0 .55rem 0 .3rem',
      boxSizing: 'border-box',
      border: '1px solid var(--dsw-alias-border-l2, rgba(255,255,255,.14))',
      borderRadius: '999px',
      background: 'var(--dsw-alias-bg-overlay, rgba(20,17,15,.86))',
      color: 'var(--dsw-alias-label-primary, #ede5db)',
      boxShadow: '0 6px 18px rgba(0,0,0,.28)',
      fontFamily: SANS,
      fontSize: '.76rem',
      fontWeight: 500,
      lineHeight: 1,
      whiteSpace: 'nowrap',
      // Ohne das bliebe der Knopf unerreichbar: die Ebene ist klickdurchlässig.
      pointerEvents: 'auto',
      zIndex: 30,
    }

    /** Der runde Knopf: Glut heisst „hier geht es weiter" (BRAND.md §1). */
    const KNOPF = {
      flex: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '24px',
      height: '24px',
      padding: 0,
      border: 'none',
      borderRadius: '50%',
      background: `linear-gradient(180deg, ${GLUT_HELL}, ${GLUT})`,
      color: '#1a1206',
      cursor: 'pointer',
      boxSizing: 'border-box',
    }

    /** Der Fortschritt als schmale Rinne mit gefülltem Anteil. */
    const RINNE = {
      position: 'relative',
      display: 'block',
      flex: 'none',
      width: '76px',
      height: '3px',
      borderRadius: '2px',
      background: 'var(--dsw-alias-border-l2, rgba(255,255,255,.18))',
      overflow: 'hidden',
    }

    /** Der gefüllte Anteil. */
    const FUELLUNG = {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      borderRadius: '2px',
      background: GLUT,
    }

    /** Die Zeit in Zweittext-Ton — sie ist Beiwerk, nicht Inhalt. */
    const ZEIT = {
      flex: 'none',
      minWidth: '68px',
      textAlign: 'right',
      color: 'var(--dsw-alias-label-secondary, #b3a596)',
      fontVariantNumeric: 'tabular-nums',
    }

    /**
     * Eine Sekundenzahl als `m:ss`.
     * @param sekunden - die Sekunden, notfalls NaN.
     * @returns die Anzeige.
     */
    function alsZeit(sekunden) {
      if (!Number.isFinite(sekunden) || sekunden < 0) return '0:00'
      const ganz = Math.floor(sekunden)
      return `${Math.floor(ganz / 60)}:${String(ganz % 60).padStart(2, '0')}`
    }

    /**
     * Das Sinnbild im Knopf: Dreieck zum Spielen, zwei Striche zum Anhalten.
     * @param laeuft - ob gerade gespielt wird.
     * @returns das Sinnbild.
     */
    function Sinnbild(laeuft) {
      const formen = laeuft
        ? [
          h('rect', { key: 'a', x: 4.4, y: 3.4, width: 2.4, height: 7.2, rx: 0.7, fill: 'currentColor' }),
          h('rect', { key: 'b', x: 9.2, y: 3.4, width: 2.4, height: 7.2, rx: 0.7, fill: 'currentColor' }),
        ]
        : [h('path', { key: 'a', d: 'M6 3.4 L12 7 L6 10.6 Z', fill: 'currentColor' })]
      return h('svg', {
        viewBox: '0 0 16 14', width: 14, height: 13, 'aria-hidden': true,
        style: { display: 'block' },
      }, formen)
    }

    /**
     * Die Leiste mit Knopf, Titel, Fortschritt und Zeit.
     * @returns das Element.
     */
    function Begruessung() {
      const [laeuft, setLaeuft] = React.useState(false)
      const [stellung, setStellung] = React.useState(0)
      const [dauer, setDauer] = React.useState(0)
      const ton = React.useRef(null)

      // Das Ton-Element gehört dem Baustein: beim Abräumen wird angehalten und
      // jeder Zuhörer wieder abgenommen. Ohne das liefe der Ton nach dem
      // Entfernen des Players weiter.
      React.useEffect(() => {
        const el = ton.current
        if (el === null) return undefined
        const aufZeit = () => {
          setStellung(el.currentTime)
        }
        const aufDaten = () => {
          setDauer(Number.isFinite(el.duration) ? el.duration : 0)
        }
        const aufEnde = () => {
          setLaeuft(false)
          setStellung(0)
          el.currentTime = 0
        }
        const aufFehler = () => {
          // Sichtbar machen statt still bleiben: der Grund steht im Protokoll.
          setLaeuft(false)
          console.warn(`promptheus: „${QUELLE}" liess sich nicht laden`)
        }
        el.addEventListener('timeupdate', aufZeit)
        el.addEventListener('loadedmetadata', aufDaten)
        el.addEventListener('durationchange', aufDaten)
        el.addEventListener('ended', aufEnde)
        el.addEventListener('error', aufFehler)
        return () => {
          el.pause()
          el.removeEventListener('timeupdate', aufZeit)
          el.removeEventListener('loadedmetadata', aufDaten)
          el.removeEventListener('durationchange', aufDaten)
          el.removeEventListener('ended', aufEnde)
          el.removeEventListener('error', aufFehler)
        }
      }, [])

      const umschalten = () => {
        const el = ton.current
        if (el === null) return
        if (el.paused) {
          // `play()` gibt ein Versprechen zurück. Der Browser verweigert Ton
          // ohne vorausgegangene Nutzerhandlung; eine unbeachtete Absage liesse
          // den Knopf „anhalten" zeigen, obwohl nichts läuft.
          const start = el.play()
          if (start !== undefined && typeof start.catch === 'function') {
            start.catch(() => setLaeuft(false))
          }
          setLaeuft(true)
        } else {
          el.pause()
          setLaeuft(false)
        }
      }

      const anteil = Number.isFinite(dauer) && dauer > 0
        ? Math.min(1, Math.max(0, stellung / dauer))
        : 0

      return anBody(h(React.Fragment, null,
        // Ohne `controls`: die Bedienung ist unsere Leiste. Das Element bleibt
        // unsichtbar, weil es keine Steuerleiste zeichnet.
        h('audio', { ref: ton, src: QUELLE, preload: 'metadata' }),
        h('span', { style: RAHMEN, 'data-plugin': '@promptheus/dsh-client-ui-audio' },
          h('button', {
            type: 'button',
            style: KNOPF,
            onClick: umschalten,
            title: laeuft ? `${KNOPF_TEXT} anhalten` : `${KNOPF_TEXT} abspielen`,
            'aria-label': laeuft ? `${KNOPF_TEXT} anhalten` : `${KNOPF_TEXT} abspielen`,
          }, Sinnbild(laeuft)),
          h('span', { style: { overflow: 'hidden', textOverflow: 'ellipsis' } }, TITEL),
          h('span', { style: RINNE },
            h('span', { style: { ...FUELLUNG, width: `${Math.round(anteil * 100)}%` } })),
          h('span', { style: ZEIT }, `${alsZeit(stellung)} / ${alsZeit(dauer)}`),
        ),
      ))
    }

    return {
      // Harte Abhängigkeit: ohne das Steckplatz-Register gibt es nichts zu belegen.
      inject: ['slots'],
      apply(ctx) {
        // `shell.overlay` gehört `@deepseek-ai/dsh-client-ui-layout` und wird im
        // Rahmen (`AppFrame`) gezeichnet. Der Eintrag reiht sich ein; `order`
        // hält ihn hinter den Hinweisen des Harness.
        ctx.slots.inject('shell.overlay', () => ctx.slots.register({
          name: 'shell.overlay',
          id: 'promptheus-begruessung',
          order: 20,
        }, Begruessung))
      },
    }
  },
})
