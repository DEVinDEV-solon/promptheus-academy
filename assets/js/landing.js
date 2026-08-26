/* PROMPTHEUS — Landingpage: Scroll-Mittel und der Login-Schirm.
 *
 * Eine eigene kleine Datei neben tor.js. tor.js kuemmert sich weiter um die
 * Formulare (Anmelden, Einrichten, Urkunde) — es sendet an api.php und laedt
 * bei Erfolg neu. Diese Datei macht nur die Seite lebendig und blendet den
 * Login-Schirm ein und aus.
 *
 * Alles ist ohne JavaScript vollstaendig benutzbar: die Formulare stehen im
 * HTML, die Preise auch. Wer JavaScript aus hat oder „weniger Bewegung" waehlt,
 * sieht die Seite ruhig und ganz.                                             */
'use strict';

(function () {
  const wurzel  = document.documentElement;
  const wenig   =
    wurzel.dataset.bewegung === 'wenig' ||
    (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* -------------------------------------------------- Kopfleiste: fest ab dem ersten Scrollen */
  const bar = document.getElementById('lp-bar');
  if (bar) {
    const setzeBar = () => bar.classList.toggle('fest', window.scrollY > 12);
    setzeBar();
    window.addEventListener('scroll', setzeBar, { passive: true });
  }

  /* -------------------------------------------------- Login-Schirm oeffnen und schliessen
     Der Knopf rechts oben blendet die Landingpage weg — dann ist nur der Login
     zu sehen. Der Zurueck-Pfeil holt sie zurueck. ?login=1 oeffnet direkt. */
  const schirm  = document.getElementById('login-schirm');
  if (schirm) {
    const oeffnen = (an) => {
      document.body.classList.toggle('zeigt-login', an);
      schirm.hidden = !an;
      if (an) {
        const feld = schirm.querySelector('input:not([type=hidden])');
        if (feld) feld.focus();
      }
    };
    document.querySelectorAll('[data-login-auf]').forEach((k) =>
      k.addEventListener('click', (e) => {
        e.preventDefault();
        oeffnen(true);
        try { history.replaceState(null, '', '?login=1'); } catch (_) {}
      }));
    const zu = schirm.querySelector('[data-login-zu]');
    if (zu) zu.addEventListener('click', () => {
      oeffnen(false);
      try { history.replaceState(null, '', location.pathname); } catch (_) {}
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.body.classList.contains('zeigt-login')) {
        oeffnen(false);
        try { history.replaceState(null, '', location.pathname); } catch (_) {}
      }
    });
    // Direkter Einstieg per Adresse.
    const p = new URLSearchParams(location.search);
    if (p.get('login') === '1' || p.has('anmelden') || p.has('einrichten')) oeffnen(true);
  }

  /* -------------------------------------------------- Sanftes Springen der Menuepunkte */
  document.querySelectorAll('.lp-bar-nav a[href^="#"]').forEach((a) =>
    a.addEventListener('click', (e) => {
      const ziel = document.querySelector(a.getAttribute('href'));
      if (!ziel) return;
      e.preventDefault();
      ziel.scrollIntoView({ behavior: wenig ? 'auto' : 'smooth', block: 'start' });
    }));

  /* Ab hier nur Bewegung. Ist sie abgeschaltet, steht alles sichtbar da. */
  if (wenig) return;

  /* -------------------------------------------------- Aufdecken beim Scrollen */
  const beo = new IntersectionObserver((eintraege) => {
    eintraege.forEach((ein) => {
      if (ein.isIntersecting) { ein.target.classList.add('sicht'); beo.unobserve(ein.target); }
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
  document.querySelectorAll('.lp-auf, .lp-wisch, .lp-features-raster').forEach((el) => beo.observe(el));

  /* -------------------------------------------------- Fortschritt einer „Bahn"
     Eine Bahn ist hoeher als der Schirm; ihr Inneres (`-halt`) klebt oben fest,
     waehrend die Bahn durchlaeuft. 0 = gerade angekommen, 1 = gleich vorbei. */
  function fortschritt(bahn) {
    const r  = bahn.getBoundingClientRect();
    const vh = window.innerHeight;
    const weg = r.height - vh;
    if (weg <= 0) return r.top <= 0 ? 1 : 0;
    return Math.min(1, Math.max(0, -r.top / weg));
  }

  /* -------------------------------------------------- Held: leichter Parallax */
  const heldInhalt = document.querySelector('.lp-hero-inhalt');

  /* -------------------------------------------------- Frage: Zeilen bauen sich auf */
  const frageBahn  = document.querySelector('.lp-frage-bahn');
  const frageZeilen = frageBahn ? [...frageBahn.querySelectorAll('.z')] : [];
  const frageStufen = [0.10, 0.40, 0.68];

  /* -------------------------------------------------- Hoehepunkt: Feuer waechst, Spruch entzuendet sich */
  const peakBahn   = document.querySelector('.lp-peak-bahn');
  const peakHalt   = document.querySelector('.lp-peak-halt');
  const peakZeilen = peakBahn ? [...peakBahn.querySelectorAll('.z')] : [];
  const peakStufen = [0.16, 0.42, 0.66];
  const peakVideo  = document.querySelector('.lp-peak-video');
  let   videoBereit = false;
  if (peakVideo) {
    peakVideo.addEventListener('loadedmetadata', () => { videoBereit = true; }, { once: true });
    // Ein stummer, nicht selbst spielender Clip — wir bewegen ihn von Hand.
    peakVideo.muted = true; peakVideo.playsInline = true;
  }

  /* -------------------------------------------------- Ein rAF-Takt fuer alles Scrollende */
  let laeuft = false;
  function takt() {
    laeuft = false;
    const y = window.scrollY;

    if (heldInhalt) {
      const s = Math.min(y * 0.18, 120);
      heldInhalt.style.setProperty('--sy', s.toFixed(1));
    }

    if (frageBahn && frageZeilen.length) {
      const p = fortschritt(frageBahn);
      frageZeilen.forEach((z, i) => z.classList.toggle('an', p >= (frageStufen[i] ?? 1)));
    }

    if (peakBahn && peakHalt) {
      const p = fortschritt(peakBahn);
      peakHalt.style.setProperty('--p', p.toFixed(3));
      peakZeilen.forEach((z, i) => z.classList.toggle('an', p >= (peakStufen[i] ?? 1)));
      if (peakVideo && videoBereit && peakVideo.duration) {
        // Scrubben: die Position im Clip folgt dem Scrollfortschritt.
        const t = p * (peakVideo.duration - 0.05);
        if (Math.abs(t - peakVideo.currentTime) > 0.03) peakVideo.currentTime = t;
      }
    }
  }
  function anstoss() { if (!laeuft) { laeuft = true; requestAnimationFrame(takt); } }
  window.addEventListener('scroll', anstoss, { passive: true });
  window.addEventListener('resize', anstoss, { passive: true });
  takt();
})();
