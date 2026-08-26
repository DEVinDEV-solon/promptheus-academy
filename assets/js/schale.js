/* PROMPTHEUS — die Schale: Menüleiste links, Ziehgriffe zwischen den Spalten.
 *
 * **Warum Variablen und nicht Elementbreiten.** Advocat schreibt die Breite
 * direkt auf die Spalte (`col.style.width`). Das geht dort, weil alle drei
 * Spalten Flex-Kinder sind. Hier sind sie es nicht: die Seitenspalte im Stoff
 * ist eine Grid-Spalte, das Tutorfenster ein festes Fenster mit `max-width`.
 * Eine CSS-Variable trifft alle drei Fälle — und dieselbe Variable steuert
 * nebenbei den Platz, den der Stoff bekommt (`padding-right` am Kopf).
 *
 * **Warum localStorage und nicht das Konto.** Eine Spaltenbreite gehört zum
 * Bildschirm, an dem man sitzt, nicht zur Person. Wer zu Hause an 27 Zoll und
 * in der Schule an einem Laptop lernt, will nicht die Breite von gestern.
 * Farben und Thema hängen dagegen am Konto — die gehören zur Person.
 *
 * **Warum Pointer-Ereignisse.** `mousedown` deckt kein Tablet ab. Mit
 * `setPointerCapture` bleibt der Zug ausserdem am Griff hängen, auch wenn der
 * Zeiger schneller ist als das Neuzeichnen — sonst reisst das Ziehen ab,
 * sobald man den Griff überholt.
 */
'use strict';

(function () {

  const W = document.documentElement;
  const VOR = 'pu_schale_';

  function lesen(name) {
    try { return localStorage.getItem(VOR + name); } catch (e) { return null; }
  }
  function schreiben(name, wert) {
    try { localStorage.setItem(VOR + name, wert); } catch (e) { /* privater Modus */ }
  }

  /* ---------------------------------------------------------------- Griffe */

  const LEISTE = { name: 'leiste', token: '--leiste-breite', vorgabe: 232, min: 132, max: 440 };
  const PANEL  = { name: 'panel',  token: '--panel-breite',  vorgabe: 400, min: 300, max: 720,
                   invers: true };
  const SPALTE = { name: 'spalte', token: '--spalte-breite', vorgabe: 330, min: 220, max: 620,
                   invers: true };

  function zahl(o) {
    const n = parseFloat(getComputedStyle(W).getPropertyValue(o.token));
    return isFinite(n) ? n : o.vorgabe;
  }

  function setzen(o, px) {
    W.style.setProperty(o.token, Math.round(Math.min(o.max, Math.max(o.min, px))) + 'px');
  }

  function merken(o) { schreiben(o.name, String(Math.round(zahl(o)))); }

  function griffMachen(el, o) {
    if (!el || el.dataset.griff === '1') return;
    el.dataset.griff = '1';

    el.addEventListener('pointerdown', function (e) {
      if (e.button) return;
      e.preventDefault();

      const startX = e.clientX;
      const startB = zahl(o);

      try { el.setPointerCapture(e.pointerId); } catch (ex) { /* egal */ }
      el.classList.add('zieht');
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';

      const zieh = function (ev) {
        const dx = ev.clientX - startX;
        setzen(o, startB + (o.invers ? -dx : dx));
      };
      const los = function () {
        el.removeEventListener('pointermove', zieh);
        el.removeEventListener('pointerup', los);
        el.removeEventListener('pointercancel', los);
        el.classList.remove('zieht');
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        merken(o);
      };

      el.addEventListener('pointermove', zieh);
      el.addEventListener('pointerup', los);
      el.addEventListener('pointercancel', los);
    });

    // Doppelklick setzt zurück. Wer eine Spalte verzogen hat, soll nicht raten
    // müssen, wo „normal" war.
    el.addEventListener('dblclick', function () { setzen(o, o.vorgabe); merken(o); });

    // Mit der Tastatur: Pfeile schieben um 16 Pixel, Pos1 setzt zurück. Ein
    // Griff, den nur eine Maus trifft, ist für einen Teil der Lernenden keiner.
    el.addEventListener('keydown', function (e) {
      let d = 0;
      if (e.key === 'ArrowLeft')  d = -16;
      if (e.key === 'ArrowRight') d = 16;
      if (e.key === 'Home') { e.preventDefault(); setzen(o, o.vorgabe); merken(o); return; }
      if (!d) return;
      e.preventDefault();
      setzen(o, zahl(o) + (o.invers ? -d : d));
      merken(o);
    });
  }

  /** Gemerkte Breite wieder herstellen — vor dem ersten Zug. */
  function breiteHolen(o) {
    const w = parseFloat(lesen(o.name) || '');
    if (isFinite(w)) setzen(o, w);
  }

  /* ------------------------------------------------------------- Klappen */

  const leiste = document.getElementById('leiste');
  const knopf  = document.getElementById('knopf-leiste');

  function klappen(zu, merkenAuch) {
    if (!leiste) return;
    leiste.classList.toggle('zu', zu);
    if (knopf) knopf.setAttribute('aria-expanded', zu ? 'false' : 'true');
    if (merkenAuch !== false) schreiben('leiste_zu', zu ? '1' : '0');
  }

  /* ------------------------------------------------- Griffe im Stoff
     Die Seitenspalte entsteht erst beim Zeichnen einer Ansicht, das
     Tutorfenster beim Öffnen — und beide werden neu aufgebaut. Der Griff muss
     also nach jedem Umbau wieder da sein. Die Funktion ist absichtlich
     wiederholbar: sie erkennt einen vorhandenen Griff und lässt ihn stehen. */

  function griffAnbauen(eltern, klasse, o, beschriftung) {
    if (!eltern || eltern.querySelector(':scope > .' + klasse)) return;
    const g = document.createElement('div');
    g.className = 'griff ' + klasse;
    g.setAttribute('role', 'separator');
    g.setAttribute('aria-orientation', 'vertical');
    g.setAttribute('aria-label', beschriftung);
    g.title = 'Ziehen — Doppelklick setzt zurück';
    g.tabIndex = 0;
    eltern.appendChild(g);
    griffMachen(g, o);
  }

  const P = window.PU = window.PU || {};

  P.griffeAnbringen = function () {
    document.querySelectorAll('#haupt .mit-spalte > .seitenspalte').forEach(function (sp) {
      griffAnbauen(sp, 'griff-spalte', SPALTE, 'Breite der Seitenspalte ändern');
    });
    griffAnbauen(document.getElementById('tutorpanel'), 'griff-panel', PANEL,
                 'Breite des Tutorfensters ändern');
  };

  /* ---------------------------------------------------------------- Start */

  breiteHolen(LEISTE);
  breiteHolen(PANEL);
  breiteHolen(SPALTE);

  griffMachen(document.getElementById('griff-leiste'), LEISTE);

  if (leiste) {
    // Der Anfangszustand darf nicht animiert werden: sonst sieht man beim
    // Laden, wie eine Leiste zufährt, die nie offen war.
    const zuGemerkt = lesen('leiste_zu');
    const zu = zuGemerkt === null ? (window.innerWidth < 1000) : (zuGemerkt === '1');

    if (zu) {
      leiste.style.transition = 'none';
      klappen(true, false);
      requestAnimationFrame(function () { leiste.style.transition = ''; });
    }

    if (knopf) knopf.addEventListener('click', function () {
      klappen(!leiste.classList.contains('zu'));
    });

    // Auf einem schmalen Fenster liegt die Leiste ÜBER dem Stoff. Dort ist ein
    // Menü, das nach der Wahl offen bleibt, im Weg — auf einem breiten nicht.
    leiste.addEventListener('click', function (e) {
      if (window.innerWidth < 1000 && e.target.closest('.menue-knopf[data-ansicht]')) {
        klappen(true, false);
      }
    });
  }

  /* Die Ansichten zeichnen teils asynchron und an mehreren Stellen nach — nach
     demselben Muster wie textkarten.js beobachten wir deshalb, statt zu jedem
     `zeichnen()` einen Aufruf zu setzen, den man beim nächsten Mal vergisst. */
  const haupt = document.getElementById('haupt');
  if (haupt) {
    const beobachter = new MutationObserver(function () {
      beobachter.disconnect();
      P.griffeAnbringen();
      beobachter.observe(haupt, { childList: true, subtree: true });
    });
    P.griffeAnbringen();
    beobachter.observe(haupt, { childList: true, subtree: true });
  }

})();
