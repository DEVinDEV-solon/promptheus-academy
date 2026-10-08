/**
 * Das Stundenvideo: zur vollen Stunde läuft einmal `hero-kie.mp4` statt des
 * Hintergrundbildes, danach ist wieder das Bild da (Wunsch 07.10.2026).
 *
 * **Derselbe Rahmen wie das Bild.** Das Bild liegt auf dem Kind von
 * `main.conversation` (siehe `hintergrund.ts`). Das Video kommt in genau diesen
 * Knoten, füllt ihn ganz (`object-fit: cover`) und liegt mit `z-index: -1`
 * HINTER dem Gesprächstext. Damit `-1` nicht hinter die ganze Seite fällt, wird
 * die Fläche für die Laufzeit ein eigener Stapelkontext (`isolation: isolate`).
 *
 * **Keine Bedienfelder, keine Scrollbalken.** Kein `controls`, dazu
 * `pointer-events: none` (der Browser blendet sonst bei Berührung seine Leiste
 * ein), kein Bild-im-Bild, kein Fernsehen-Knopf. Das Video ist genau so gross
 * wie die Fläche und erzeugt deshalb keinen Überlauf.
 *
 * **Warum ein fremder Knoten in einem React-Knoten hier geht.** React fasst nur
 * Knoten an, die es selbst angelegt hat, und fügt seine eigenen mit Bezugsknoten
 * ein. Ein vorangestelltes Video stört das nicht. Hängt React die Fläche neu ein,
 * fällt das Video mit weg; das ist harmlos, es läuft ohnehin nur zehn Sekunden.
 *
 * **Ohne Ton.** Die Datei hat keine Tonspur, und `muted` ist ohnehin die
 * Bedingung, unter der der Browser ein Video ohne Klick startet.
 *
 * **Wann es nicht läuft.** Wenn die Seite verdeckt ist (anderer Reiter), wenn
 * der Rechner geschlafen hat und die Stunde mehr als zwei Minuten vorbei ist,
 * und wenn das System „Bewegung reduzieren“ verlangt. Fehlt die Datei (eine
 * Installation ohne `assets/video`), endet der Versuch still beim Ladefehler.
 *
 * @module @promptheus/dsh-client-ui-promptheus/stundenvideo
 */

/** Der Pfad, unter dem die Node-Hälfte das Video ausliefert. */
export const VIDEO_PFAD = '/promptheus-stundenvideo.mp4'

/** Die Fläche, auf der auch das Hintergrundbild liegt (hintergrund.ts). */
export const FLAECHE = '[data-slot="main"] [data-slot="main.conversation"] > *'

/** Wie lange das Ein- und Ausblenden dauert, in Millisekunden. */
const BLENDE_MS = 700

/** Wie spät ein Stundenschlag noch gilt (etwa nach dem Aufwachen). */
const VERSPAETUNG_MS = 2 * 60 * 1000

/** Spätestens nach dieser Zeit ist das Video wieder weg, auch ohne `ended`. */
const HOECHSTENS_MS = 60 * 1000

/** Die Klassen, an denen das Stylesheet hängt. */
const KLASSE_FLAECHE = 'promptheus-stundenvideo-flaeche'
const KLASSE_VIDEO = 'promptheus-stundenvideo'
/** Nur gesetzt, wenn die Fläche sonst statisch wäre: eine eigene Position bleibt. */
const KLASSE_RELATIV = 'promptheus-stundenvideo-relativ'

/**
 * Das Stylesheet für das Video und die Fläche während des Laufs.
 * @returns das CSS.
 */
export function stundenvideoCss(): string {
  return `
/* PROMPTHEUS Werkstatt — Stundenvideo (stundenvideo.ts). */
.${KLASSE_FLAECHE} {
  isolation: isolate;
}
.${KLASSE_RELATIV} {
  position: relative;
}
.${KLASSE_VIDEO} {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -1;
  pointer-events: none;
  opacity: 0;
  transition: opacity ${BLENDE_MS}ms ease;
  background: transparent;
}
.${KLASSE_VIDEO}.ist-sichtbar {
  opacity: 1;
}
.${KLASSE_VIDEO}::-webkit-media-controls,
.${KLASSE_VIDEO}::-webkit-media-controls-enclosure,
.${KLASSE_VIDEO}::-webkit-media-controls-panel,
.${KLASSE_VIDEO}::-webkit-media-controls-overlay-play-button,
.${KLASSE_VIDEO}::-webkit-media-controls-start-playback-button {
  display: none !important;
  -webkit-appearance: none;
}
@media (prefers-reduced-motion: reduce) {
  .${KLASSE_VIDEO} { transition: none; }
}
`.trim()
}

/**
 * Millisekunden bis zur nächsten vollen Stunde nach Ortszeit.
 * @param jetzt - der Zeitpunkt, ab dem gerechnet wird.
 * @returns die Wartezeit, immer grösser als 0.
 */
export function bisZurVollenStunde(jetzt: Date): number {
  const naechste = new Date(jetzt.getTime())
  naechste.setMinutes(60, 0, 0)
  return Math.max(1, naechste.getTime() - jetzt.getTime())
}

/**
 * Spielt das Video einmal auf der Chatfläche ab.
 *
 * Läuft schon eines, passiert nichts. Fehlt die Fläche oder die Datei, auch nicht.
 * @returns ein Versprechen, das nach dem Ausblenden erfüllt ist.
 */
export function stundenvideoAbspielen(): Promise<void> {
  const flaeche = document.querySelector<HTMLElement>(FLAECHE)
  if (flaeche === null || flaeche.querySelector(`.${KLASSE_VIDEO}`) !== null) {
    return Promise.resolve()
  }

  const video = document.createElement('video')
  video.className = KLASSE_VIDEO
  video.muted = true
  video.defaultMuted = true
  video.playsInline = true
  video.preload = 'auto'
  video.controls = false
  video.loop = false
  video.disablePictureInPicture = true
  video.setAttribute('muted', '')
  video.setAttribute('playsinline', '')
  video.setAttribute('disablepictureinpicture', '')
  video.setAttribute('disableremoteplayback', '')
  video.setAttribute('controlslist', 'nodownload nofullscreen noremoteplayback noplaybackrate')
  video.setAttribute('aria-hidden', 'true')
  video.tabIndex = -1

  return new Promise<void>((fertig) => {
    let vorbei = false
    const notbremse = window.setTimeout(() => aufraeumen(), HOECHSTENS_MS)

    function aufraeumen(): void {
      if (vorbei) return
      vorbei = true
      window.clearTimeout(notbremse)
      video.classList.remove('ist-sichtbar')
      window.setTimeout(() => {
        video.pause()
        video.removeAttribute('src')
        video.load()
        video.remove()
        flaeche!.classList.remove(KLASSE_FLAECHE, KLASSE_RELATIV)
        fertig()
      }, BLENDE_MS)
    }

    video.addEventListener('ended', aufraeumen, { once: true })
    video.addEventListener('error', aufraeumen, { once: true })
    video.addEventListener('playing', () => video.classList.add('ist-sichtbar'), { once: true })

    flaeche.classList.add(KLASSE_FLAECHE)
    if (getComputedStyle(flaeche).position === 'static') flaeche.classList.add(KLASSE_RELATIV)
    flaeche.prepend(video)
    video.src = VIDEO_PFAD
    video.play().catch(() => aufraeumen())
  })
}

/**
 * Stellt den Wecker auf jede volle Stunde.
 * @returns eine Funktion, die den Wecker abstellt und ein laufendes Video entfernt.
 */
export function stundenvideoStarten(): () => void {
  let wecker = 0
  let soll = 0

  function stellen(): void {
    const warten = bisZurVollenStunde(new Date())
    soll = Date.now() + warten
    wecker = window.setTimeout(schlagen, warten)
  }

  function schlagen(): void {
    const verspaetet = Date.now() - soll > VERSPAETUNG_MS
    const ruhig = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
    if (!verspaetet && !ruhig && document.visibilityState === 'visible') {
      void stundenvideoAbspielen()
    }
    stellen()
  }

  stellen()
  return () => {
    window.clearTimeout(wecker)
    document.querySelectorAll(`.${KLASSE_VIDEO}`).forEach((v) => {
      v.parentElement?.classList.remove(KLASSE_FLAECHE, KLASSE_RELATIV)
      v.remove()
    })
  }
}
