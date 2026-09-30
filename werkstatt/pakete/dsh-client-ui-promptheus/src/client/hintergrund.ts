/**
 * Das Hintergrundbild der Chatseite.
 *
 * **Die Bauart kommt aus dem Hauptprogramm.** `srv/varianten.php` legt
 * Hintergrundbilder nicht mit roher Deckkraft an, sondern mit einem **Schleier
 * aus dem Grundton** und einer **Bildstärke**:
 *
 *     --bild-staerke: .20;   (dunkle Paletten)
 *     --bild-schleier: rgb(<grund>);
 *
 * Der Schleier liegt als erste Ebene über dem Bild. Seine Deckkraft ist
 * `1 − Bildstärke`: bei 25 % Bildstärke also 75 % Grundton. Dadurch bleibt die
 * Schrift lesbar, und das Bild wirkt als Textur statt als Plakat. Genau das ist
 * der Grund, warum das Hauptprogramm es so macht — eine rohe Deckkraft von 25 %
 * auf einem Bild mit hellen Stellen macht Text unlesbar.
 *
 * **Warum das Bild nicht in einem Steckplatz liegt.** Der naheliegende Weg wäre
 * `shell.overlay` — ein eigener Steckplatz des Harness, der wie gemacht scheint.
 * Er ist es nicht, und das ist gemessen:
 *
 *   * `shell.overlay` liegt in `.YWeqFq_overlayLayer` mit
 *     `position: absolute; z-index: 20` — das ist ein **eigener
 *     Stapelkontext**. Ein Kind darin bleibt gefangen; `z-index: -1` hilft nicht.
 *   * Der Harness beschreibt ihn selbst als „Frame-wide floating layer, **above
 *     every column**". Ein Bild darin läge ÜBER dem Text, nicht dahinter.
 *
 * Deshalb liegt das Bild auf der **Chatfläche selbst**.
 *
 * **Warum die Chatfläche und nicht der Rahmen.** Gemessen über den ganzen Baum
 * übermalt im Chatbereich **genau ein Knoten** den Grund: der Gesprächs-Wurzel-
 * knoten (1000 × 720 px). Nur er muss beiseitetreten. Die linke Spalte und die
 * rechte Leiste behalten ihren eigenen Grund — sie bleiben ruhig, und das Bild
 * wirkt dort, wo man liest.
 *
 * **Warum `[data-slot]` und nicht ein Klassenname.** Die Klassennamen des
 * Harness sind erzeugt und wechseln mit jeder Fassung (`.ZmEGJq_root` heute,
 * etwas anderes morgen). Ein Selektor darauf bräche bei der nächsten
 * Aufwertung — und zwar lautlos. `[data-slot="main.conversation"]` ist dagegen
 * ein **Steckplatz-Name** und damit Teil des Vertrags, den der Harness selbst
 * veröffentlicht. Dasselbe gilt für `> *`: die Kindbeziehung ist Aufbau, nicht
 * Name. Beides zusammen bleibt bei einer Aufwertung gültig.
 *
 * @module @promptheus/dsh-client-ui-promptheus/hintergrund
 */

/** Der Pfad, unter dem die Node-Hälfte das Bild ausliefert. */
export const BILD_PFAD = '/promptheus-hintergrund.jpg'

/**
 * Die Bildstärke — wie stark das Bild durchkommt.
 *
 * **Dieser Wert ist gerechnet, nicht gewählt.** BRAND.md §1 verlangt gemessenen
 * Kontrast, und der Zweittext (`--schrift-2`) ist die empfindlichste Stelle: er
 * steht auf derselben Fläche wie das Bild und hat den geringsten Abstand zum
 * Grund. Gerechnet wurde der ungünstigste Fall — ein Bildpunkt, der den Grund
 * am stärksten aufhellt (weiss) — für jede Stärke:
 *
 *     Bildstärke   schlechtester Zweittext-Kontrast
 *        10 %      6,01:1
 *        15 %      5,08:1
 *        18 %      4,57:1   ← hält die Schwelle 4,5:1
 *        20 %      4,23:1   ← fällt durch
 *        25 %      3,50:1   ← deutlich zu stark
 *
 * **Auch der Wert des Hauptprogramms wäre zu stark.** `varianten.php` führt für
 * dunkle Paletten `--bild-staerke: .20` — bei 20 % erreicht der Zweittext hier
 * nur noch 4,23:1. Der Unterschied kommt daher, dass dort das Bild auf anderen
 * Flächen liegt (Tor, Kursseiten) und die Schrift dort andere Größen hat. Für
 * die Chatfläche der Werkstatt ist 18 % der höchste Wert, der die eigene
 * Kontrastregel hält.
 *
 * Die Wahl des Nutzers war 25 %. Dieser Wert lässt sich halten, wenn der
 * Zweittext über dem Bild nicht vorkommt — er kommt aber vor. Deshalb steht hier
 * 18 %, und `werkzeuge/hintergrund_kontrast.mjs` rechnet es im Browser nach.
 */
export const BILDSTAERKE = 0.18

/**
 * Baut das Stylesheet für das Hintergrundbild.
 *
 * **Warum das Bild auf dem KIND liegt und nicht auf dem Steckplatz.** Gemessen:
 *
 *     div slot="main.conversation"  0x0   display: contents   ← KEIN Kasten
 *       div .ZmEGJq_root            1000x720 bg=rgb(20,17,15) ← die echte Fläche
 *
 * `main.conversation` ist eine reine Weiterleitung (`display: contents`) und hat
 * keinen Kasten. Ein `background-image` darauf wirkt **nicht** — es gibt nichts,
 * worauf es läge. Die Fläche, die man sieht, ist sein unmittelbares Kind. Genau
 * sie malt auch den Grund bisher deckend, und genau sie bekommt deshalb das Bild.
 *
 * **Warum zwei Attributselektoren und kein `!important`.** Der Harness setzt
 * seinen Grund als `.ZmEGJq_root { background: var(--dsw-alias-bg-base) }` —
 * eine Klasse, also Spezifität (0,1,0). Mein erster Versuch
 * `[data-slot="main.conversation"] > *` hat **dieselbe** Spezifität (0,1,0), und
 * bei Gleichstand entscheidet die Reihenfolge im Dokument — die ich nicht in der
 * Hand habe. Deshalb steht `[data-slot="main"]` mit davor: (0,2,0) gewinnt
 * sicher, ohne `!important` und ohne die Reihenfolge zu rate.
 *
 * Beide Teile sind **Steckplatz-Namen**, keine erzeugten Klassennamen. Sie
 * stehen im Vertrag des Harness (`.ZmEGJq_root` wechselt mit jeder Fassung,
 * `data-slot` nicht).
 *
 * **Kein `background-attachment: fixed`.** Damit richtete sich das Bild am
 * FENSTER aus statt an der Fläche — und weil links die Spalte 280 px belegt,
 * wäre der sichtbare Ausschnitt um genau diese 280 px nach rechts verschoben.
 * Nötig ist die Angabe ohnehin nicht: die Fläche selbst scrollt nicht, das tut
 * ihr Kind `.ZmEGJq_scrollBody`.
 *
 * @returns das CSS.
 */
export function hintergrundCss(): string {
  // Der Schleier: Grundton mit der Deckkraft `1 − Bildstärke`.
  const schleier = 1 - BILDSTAERKE
  const deckkraft = Math.round(schleier * 100)
  return `
/* PROMPTHEUS Werkstatt — Hintergrundbild der Chatseite.
   Erzeugt von pakete/dsh-client-ui-promptheus/src/client/hintergrund.ts.
   Nicht von Hand ändern: die Bildstärke steht dort als Zahl. */
:root {
  /* Als Marke veröffentlicht, damit Prüfwerkzeuge dieselbe Zahl lesen statt
     eine eigene zu führen. Zwei Zahlen an zwei Orten laufen auseinander. */
  --promptheus-bildstaerke: ${BILDSTAERKE};
}

[data-slot="main"] [data-slot="main.conversation"] > * {
  background-image:
    linear-gradient(
      color-mix(in srgb, var(--dsw-alias-bg-base) ${deckkraft}%, transparent),
      color-mix(in srgb, var(--dsw-alias-bg-base) ${deckkraft}%, transparent)
    ),
    url("${BILD_PFAD}");
  background-size: cover, cover;
  background-position: center, center;
  background-repeat: no-repeat, no-repeat;
  /* Der Grundton bleibt darunter: fehlt das Bild, sieht man ihn. */
  background-color: var(--dsw-alias-bg-base);
}
`.trim()
}
