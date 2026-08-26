/* PROMPTHEUS — die fliessende Glut hinter dem Tor.
 *
 * **Woher das kommt und was daran anders ist.** Die Vorlage war eine
 * React-Komponente mit three.js: ein Raymarching-Shader, der eine
 * nebelartige Fläche in Bewegung hält. Übernommen ist der GLSL-Kern; alles
 * andere ist neu geschrieben.
 *
 * Der Grund ist keine Vorliebe, sondern die Grundregel dieser Academy: **es
 * geht nichts nach draussen und nichts wird nachgeladen.** Die Seite läuft auf
 * 127.0.0.1 und wird von Minderjährigen benutzt. three.js wären 600 KB, die
 * ein Paketverwalter aus dem Netz holt — für Arbeit, die der Browser hier in
 * 90 Zeilen selbst erledigt: ein Rechteck über den Bildschirm spannen, drei
 * Werte hineinreichen, den Shader laufen lassen. React gibt es hier ohnehin
 * nicht; die Oberfläche ist Vanilla.
 *
 * **Die Farben sind nicht die der Vorlage.** Dort waren es Blau, Grün und
 * Violett — die Palette, die Sprachmodelle am häufigsten ausgeben. Hier
 * kommen sie aus den Marken-Tokens: Glut, Gold, Lapis. Ändert jemand die
 * Farbvariante, ändert sich die Animation mit, weil sie dieselben Variablen
 * liest.
 *
 * **Wann sie NICHT läuft** — und das ist die halbe Arbeit:
 *   · `data-bewegung="wenig"` steht auf dem Dokument. Wer Bewegung abstellt,
 *     meint auch die im Hintergrund.
 *   · Das Fenster ist nicht sichtbar. Ein Shader, der in einem Hintergrund-
 *     tab weiterrechnet, heizt einen Laptop ohne Grund.
 *   · Es gibt kein WebGL. Dann bleibt das Bild, und niemand merkt etwas.
 *   · Der Bildschirm ist schmal. Auf einem Telefon kostet Raymarching mehr
 *     Akku, als die Fläche wert ist.
 */
'use strict';

(function () {

  const wurzel = document.documentElement;

  // -------- Die Gründe, es gar nicht erst anzufangen.
  if (wurzel.dataset.bewegung === 'wenig') return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.innerWidth < 860) return;

  const flaeche = document.querySelector('.tor-flaeche');
  if (!flaeche) return;

  // Die Leinwand hängt am `body`, nicht an der Torfläche. Der Grund ist die
  // Reihenfolge der Ebenen: ein Kind der Torfläche läge über deren
  // Hintergrund — also über dem Bild. Als fest sitzendes Kind des `body` mit
  // negativer Tiefe liegt sie darunter, und es stapelt sich richtig:
  // Animation, Bild, Schleier, Text.
  const leinwand = document.createElement('canvas');
  leinwand.id = 'liquid';
  leinwand.setAttribute('aria-hidden', 'true');
  document.body.appendChild(leinwand);
  document.body.classList.add('mit-liquid');

  const gl = leinwand.getContext('webgl', { antialias: false, alpha: true })
          || leinwand.getContext('experimental-webgl');
  if (!gl) { leinwand.remove(); return; }

  /* ---------------------------------------------------------------- Shader */

  const eckenShader = `
    attribute vec2 lage;
    void main() { gl_Position = vec4(lage, 0.0, 1.0); }
  `;

  // Der Kern der Vorlage: eine Dichtefunktion, die mit der Zeit rotiert, und
  // fünf Schritte, die in sie hineinlaufen. Was hier anders ist: die Farben
  // kommen als Uniforms herein statt fest im Shader zu stehen, und am Ende
  // steht ein Alphawert statt einer deckenden Fläche — die Animation liegt
  // hinter Bild und Text, sie ersetzt sie nicht.
  const punktShader = `
    precision mediump float;

    uniform vec2  masse;
    uniform float zeit;
    uniform vec3  glut;
    uniform vec3  gold;
    uniform vec3  lapis;
    uniform float staerke;

    mat2 dreh(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

    float feld(vec3 p) {
      p.xz *= dreh(zeit * 0.14);
      p.xy *= dreh(zeit * 0.11);
      vec3 q = p * 2.0 + zeit * 0.35;
      return length(p + vec3(sin(zeit * 0.25))) * log(length(p) + 1.0)
           + sin(q.x + sin(q.z + sin(q.y))) * 0.5 - 1.0;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / min(masse.x, masse.y) - vec2(0.5, 0.5);
      uv.x += 0.4;

      vec3  farbe = vec3(0.0);
      float d = 2.5;

      for (int i = 0; i <= 5; i++) {
        vec3  p  = vec3(0.0, 0.0, 5.0) + normalize(vec3(uv, -1.0)) * d;
        float rz = feld(p);
        float f  = clamp((rz - feld(p + 0.1)) * 0.5, -0.1, 1.0);

        // Drei Farben statt einer: Lapis trägt den Grund, Glut das Innere,
        // Gold die Kanten. Dieselbe Reihenfolge wie in der Marke.
        vec3 basis = lapis * 0.35 + glut * f * 2.2 + gold * f * 0.8;

        farbe = farbe * basis + smoothstep(2.5, 0.0, rz) * 0.7 * basis;
        d += min(rz, 1.0);
      }

      // Zur Mitte hin dunkler: dort steht die Anmeldekarte, und ein
      // wanderndes Muster hinter einem Eingabefeld macht das Lesen schwer.
      float weite = distance(gl_FragCoord.xy, masse * 0.5);
      float rand  = min(masse.x, masse.y) * 0.5;
      float mitte = smoothstep(rand * 0.25, rand * 0.95, weite);

      float a = clamp(max(max(farbe.r, farbe.g), farbe.b), 0.0, 1.0);
      gl_FragColor = vec4(farbe, a * staerke * mitte);
    }
  `;

  function bauen(art, quelle) {
    const s = gl.createShader(art);
    gl.shaderSource(s, quelle);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      // Kein Absturz und keine Meldung an den Lernenden: ein Hintergrund, der
      // nicht läuft, ist kein Fehler, den er beheben könnte.
      console.warn('liquid: ' + gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  const ecken = bauen(gl.VERTEX_SHADER, eckenShader);
  const punkt = bauen(gl.FRAGMENT_SHADER, punktShader);
  if (!ecken || !punkt) { leinwand.remove(); return; }

  const programm = gl.createProgram();
  gl.attachShader(programm, ecken);
  gl.attachShader(programm, punkt);
  gl.linkProgram(programm);
  if (!gl.getProgramParameter(programm, gl.LINK_STATUS)) { leinwand.remove(); return; }
  gl.useProgram(programm);

  // Ein Rechteck über den ganzen Bildschirm — mehr Geometrie braucht es nicht.
  const puffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, puffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const lage = gl.getAttribLocation(programm, 'lage');
  gl.enableVertexAttribArray(lage);
  gl.vertexAttribPointer(lage, 2, gl.FLOAT, false, 0, 0);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const uMasse   = gl.getUniformLocation(programm, 'masse');
  const uZeit    = gl.getUniformLocation(programm, 'zeit');
  const uGlut    = gl.getUniformLocation(programm, 'glut');
  const uGold    = gl.getUniformLocation(programm, 'gold');
  const uLapis   = gl.getUniformLocation(programm, 'lapis');
  const uStaerke = gl.getUniformLocation(programm, 'staerke');

  /* ------------------------------------------------------- Farben und Mass */

  /**
   * Holt eine Markenfarbe als drei Werte von 0 bis 1.
   *
   * Über den Umweg eines Hilfselements, weil ein Token wie `#ff7a1c` als
   * Text ankommt und in jeder Schreibweise stehen darf. Der Browser rechnet
   * jede davon in `rgb(...)` um — das ist zuverlässiger als ein eigener
   * Zerleger, der irgendwann über `color-mix()` stolpert.
   */
  function farbe(name, ersatz) {
    const probe = document.createElement('span');
    probe.style.color = 'var(' + name + ', ' + ersatz + ')';
    probe.style.display = 'none';
    document.body.appendChild(probe);
    const t = getComputedStyle(probe).color.match(/[\d.]+/g) || [255, 122, 28];
    probe.remove();
    return [t[0] / 255, t[1] / 255, t[2] / 255];
  }

  let farben = null;
  function farbenLesen() {
    farben = {
      glut:  farbe('--glut',  '#ff7a1c'),
      gold:  farbe('--gold',  '#ffc94d'),
      lapis: farbe('--lapis', '#4a7fb5'),
      staerke: parseFloat(getComputedStyle(wurzel).getPropertyValue('--liquid-staerke')) || 0.5
    };
  }
  farbenLesen();

  function anpassen() {
    // Halbe Auflösung reicht: das Muster hat keine harten Kanten, und ein
    // Raymarcher auf einem 4K-Schirm kostet das Vierfache für nichts.
    // Das Fenster, nicht die Torfläche: die Leinwand sitzt fest im Bild und
    // ist so gross wie der Ausschnitt. An der Torfläche gemessen wäre sie so
    // hoch wie die ganze Seite — bei langer Preistafel dreimal zu gross, und
    // der sichtbare Teil zeigte nur einen Ausschnitt des Musters.
    const teiler = Math.min(window.devicePixelRatio || 1, 1) * 0.5;
    const b = Math.max(1, Math.round(window.innerWidth  * teiler));
    const h = Math.max(1, Math.round(window.innerHeight * teiler));
    if (leinwand.width === b && leinwand.height === h) return;
    leinwand.width = b; leinwand.height = h;
    gl.viewport(0, 0, b, h);
  }
  anpassen();
  window.addEventListener('resize', anpassen);

  /* ---------------------------------------------------------------- Lauf */

  const start = performance.now();
  let laeuft = true;
  let bild   = 0;

  function zeichnen(jetzt) {
    if (!laeuft) return;

    // Etwa 30 Bilder je Sekunde. Für eine Fläche, die sich langsam bewegt,
    // sieht das genauso aus wie 60 und kostet die Hälfte.
    bild++;
    if (bild % 2 === 0) {
      anpassen();
      gl.uniform2f(uMasse, leinwand.width, leinwand.height);
      gl.uniform1f(uZeit, (jetzt - start) / 1000);
      gl.uniform3fv(uGlut,  farben.glut);
      gl.uniform3fv(uGold,  farben.gold);
      gl.uniform3fv(uLapis, farben.lapis);
      gl.uniform1f(uStaerke, farben.staerke);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    requestAnimationFrame(zeichnen);
  }
  requestAnimationFrame(zeichnen);

  // Weggeklickt heisst angehalten.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      laeuft = false;
    } else if (!laeuft) {
      laeuft = true;
      requestAnimationFrame(zeichnen);
    }
  });

  // Wechselt jemand die Farbvariante, wechselt die Animation mit.
  window.addEventListener('pu-variante', farbenLesen);

})();
