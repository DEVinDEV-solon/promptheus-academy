/* PROMPTHEUS — der Farbwähler in der Kopfleiste.
 *
 * Er erscheint nur, wenn die Academy-Regel `farbvarianten` an ist; ist sie
 * aus, steht das Markup gar nicht erst auf der Seite und diese Datei findet
 * nichts vor.
 *
 * **Sofort sichtbar, dann gespeichert.** Der Klick setzt `data-variante` am
 * Dokument — damit gilt die neue Palette im selben Augenblick. Das Speichern
 * läuft danach und darf ruhig eine halbe Sekunde brauchen. Andersherum wäre
 * es eine Farbwahl, die erst nach dem Warten wirkt, und das fühlt sich kaputt
 * an, auch wenn nichts kaputt ist.
 *
 * Schlägt das Speichern fehl, springt die Anzeige zurück. Eine Einstellung,
 * die man sieht und die beim nächsten Laden weg ist, ist schlimmer als eine,
 * die sich gar nicht erst ändern liess.
 */
'use strict';

(function () {

  const knopf = document.getElementById('knopf-variante');
  const liste = document.getElementById('variantenliste');
  if (!knopf || !liste) return;

  const wurzel = document.documentElement;

  function auf()  {
    liste.classList.remove('hidden');
    knopf.setAttribute('aria-expanded', 'true');
    // Erst im nächsten Durchlauf horchen: sonst fängt dieser Hörer denselben
    // Klick ab, der die Liste gerade geöffnet hat.
    setTimeout(() => document.addEventListener('mousedown', daneben), 0);
    document.addEventListener('keydown', escape);
  }

  function zu() {
    liste.classList.add('hidden');
    knopf.setAttribute('aria-expanded', 'false');
    document.removeEventListener('mousedown', daneben);
    document.removeEventListener('keydown', escape);
  }

  function daneben(e) {
    if (!liste.contains(e.target) && e.target !== knopf) zu();
  }

  function escape(e) {
    if (e.key === 'Escape') { zu(); knopf.focus(); }
  }

  knopf.addEventListener('click', () => {
    liste.classList.contains('hidden') ? auf() : zu();
  });

  liste.querySelectorAll('.variante-zeile').forEach(zeile => {
    zeile.addEventListener('click', () => waehlen(zeile.dataset.variante, true));
  });

  /** Wählt eine Palette: sofort anzeigen, dann merken. */
  async function waehlen(neu, schliessen) {
    const alt = wurzel.dataset.variante;
    if (!neu || neu === alt) { if (schliessen) zu(); return; }

    setzen(neu);
    if (schliessen) zu();

    try {
      const j = await PU.ruf('einst_setzen', { schluessel: 'variante', wert: neu });
      if (!j.ok) throw new Error(j.fehler || 'Die Auswahl liess sich nicht merken.');

      // Die Palette bringt ihren Grundton mit, also wandert er in die
      // Themawahl. Sonst rechnet der Server beim nächsten Laden aus einer
      // alten Themawahl den Partner aus, und die gerade gewählte Palette
      // wäre wieder weg.
      const zeile = liste.querySelector('.variante-zeile[data-variante="' + neu + '"]');
      if (zeile && zeile.dataset.grundton) {
        await PU.ruf('einst_setzen', { schluessel: 'thema', wert: zeile.dataset.grundton });
      }
    } catch (fehler) {
      setzen(alt);
      PU.melden(fehler.message, 'schlecht');
    }
  }

  /**
   * Der ☀/☾-Knopf, solange Farbvarianten an sind.
   *
   * Er wechselt zur Partnerpalette der anderen Seite — Schmiede ↔ Pergament,
   * Olymp ↔ Marmor. Das ist die einzige Lesart, die stimmt: eine Palette hat
   * einen Grundton, sie hat nicht zwei Fassungen.
   *
   * @return {boolean} true, wenn gewechselt wurde. Dann lässt `app.js` die
   *   alte Themenumschaltung aus — sonst stünden zwei Angaben über dieselben
   *   Farben gegeneinander.
   */
  PU.variantePartnerWechseln = function () {
    const jetzt   = liste.querySelector('.variante-zeile.aktiv');
    const partner = jetzt && jetzt.dataset.partner;
    if (!partner) return false;

    // `waehlen` schreibt Palette **und** Grundton — hier ist nichts extra zu
    // tun, sonst stünden zwei Stellen, die dieselbe Themawahl setzen.
    waehlen(partner, false);
    return true;
  };

  function setzen(kennung) {
    wurzel.dataset.variante = kennung;

    // Die Palette bringt ihren Grundton mit — hell oder dunkel ist keine
    // zweite Einstellung daneben, sondern eine Eigenschaft der Palette.
    // Ohne diese Zeile bliebe `data-thema-effektiv` auf dem alten Wert, und
    // Regeln, die daran hängen (Kopfleiste, Knopffarben), passten nicht mehr
    // zu den Flächen darunter.
    const zeile = liste.querySelector('.variante-zeile[data-variante="' + kennung + '"]');
    if (zeile && zeile.dataset.grundton) {
      wurzel.dataset.themaEffektiv = zeile.dataset.grundton;
    }

    liste.querySelectorAll('.variante-zeile').forEach(z => {
      const ist = z.dataset.variante === kennung;
      z.classList.toggle('aktiv', ist);
      z.setAttribute('aria-selected', ist ? 'true' : 'false');
    });
    // Die Palette bringt neue Akzentfarben mit. Standen dort eigene, gelten
    // die weiter — sie sind die speziellere Angabe. Die Farbfelder zeigen
    // danach, was tatsächlich gilt.
    farbfelderAngleichen();
    melden(kennung);
  }

  function melden(kennung) {
    // Die Animation hinter dem Tor liest ihre Farben aus denselben Tokens und
    // muss wissen, dass sie sich geändert haben.
    window.dispatchEvent(new CustomEvent('pu-variante', { detail: kennung }));
  }

  /* ============================================================ Feineinstellung
   *
   * **Sofort sehen, verzögert speichern.** Der Regler ändert die CSS-Variable
   * bei jeder Bewegung — man sieht das Bild schwächer werden, während man
   * zieht. Gespeichert wird erst, wenn die Hand einen Moment stillsteht.
   *
   * Ohne diese Trennung gäbe es entweder eine Schreiboperation je Pixel oder
   * einen Regler, der erst nach dem Loslassen etwas tut. Beides ist falsch:
   * das eine belastet den Server, das andere macht das Einstellen zum Raten.
   */

  const reglerBild   = document.getElementById('reg-bild');
  const reglerKarten = document.getElementById('reg-karten');
  const ausBild      = document.getElementById('aus-bild');
  const ausKarten    = document.getElementById('aus-karten');
  const warnung      = document.getElementById('farb-warnung');

  /* Sechs Farben, drei Akzente und drei Schriftstufen.
   *
   * `gegen` sagt, worauf die Farbe tatsächlich liegt — und das ist nicht
   * überall dasselbe. Der Kartentitel steht auf der Kartenfläche, nicht auf
   * dem Grund; wer beides gegen `--grund` prüft, misst am falschen Ort und
   * gibt entweder falschen Alarm oder keinen, wenn es nötig wäre. */
  const FARBEN = [
    { feld: 'farb-glut',  schluessel: 'farbe_glut',  token: '--glut',
      name: 'Glut',        gegen: '--grund' },
    { feld: 'farb-gold',  schluessel: 'farbe_gold',  token: '--gold',
      name: 'Gold',        gegen: '--grund-2' },
    { feld: 'farb-lapis', schluessel: 'farbe_lapis', token: '--lapis',
      name: 'Lapis',       gegen: '--grund' }
    // Titel, Untertitel und Beschreibung standen hier. Sie sind heraus, weil
    // eine im Dunkeln gewählte Schriftfarbe nach dem Wechsel auf eine helle
    // Palette hell auf hell steht — siehe PU_EIGENE_FARBEN in
    // srv/varianten.php. Die Schriftstufen kommen jetzt aus der Palette.
  ];

  /** Speichert frühestens eine halbe Sekunde nach der letzten Bewegung. */
  const spaeter = (() => {
    const uhren = {};
    return (schluessel, wert) => {
      clearTimeout(uhren[schluessel]);
      uhren[schluessel] = setTimeout(async () => {
        try {
          const j = await PU.ruf('einst_setzen', { schluessel: schluessel, wert: String(wert) });
          if (!j.ok) throw new Error(j.fehler || 'Nicht gespeichert.');
        } catch (fehler) {
          PU.melden(fehler.message, 'schlecht');
        }
      }, 500);
    };
  })();

  function reglerBinden(regler, ausgabe, tokenName, schluessel) {
    if (!regler) return;

    const anwenden = () => {
      const p = Number(regler.value);
      ausgabe.textContent = p + ' %';
      // Faktor, nicht fester Wert: die Abstufung zwischen Seite, Tor und Tor
      // mit Animation bleibt erhalten.
      wurzel.style.setProperty(tokenName, (p / 100).toFixed(2));
    };

    regler.addEventListener('input', () => { anwenden(); spaeter(schluessel, regler.value); });
    anwenden();
  }

  reglerBinden(reglerBild,   ausBild,   '--bild-faktor',    'bild_anteil');
  reglerBinden(reglerKarten, ausKarten, '--karten-faktor',  'karten_anteil');

  FARBEN.forEach(f => {
    const feld = document.getElementById(f.feld);
    if (!feld) return;
    feld.addEventListener('input', () => {
      wurzel.style.setProperty(f.token, feld.value);
      spaeter(f.schluessel, feld.value);
      kontrastPruefen();
      melden(wurzel.dataset.variante);
    });
  });

  /**
   * Warnt, sobald eine gewählte Farbe auf dem Grund zu schwach wird.
   *
   * Verboten wird nichts — es ist die eigene Oberfläche, und eine Warnung, die
   * man wegklicken kann, wird eher gelesen als eine Sperre, die man umgehen
   * will. Aber sie steht da, und sie nennt die Zahl.
   */
  function kontrastPruefen() {
    if (!warnung) return;
    const stil = getComputedStyle(wurzel);
    const schwach = [];
    const knapp   = [];

    FARBEN.forEach(f => {
      const feld = document.getElementById(f.feld);
      if (!feld) return;
      const k = kontrast(feld.value, stil.getPropertyValue(f.gegen).trim());
      if (k < 4.5) schwach.push(f.name + ' (' + k.toFixed(1) + ':1)');
      // Zwischen 4,5 und 7 ist es erlaubt, aber für die kleinen Zeilen knapp.
      // Genau in diesem Bereich lag das Grau, das sich schlecht las.
      else if (k < 7 && f.token === '--schrift-3') knapp.push(k.toFixed(1));
    });

    if (schwach.length) {
      warnung.className = 'klein farb-warnung';
      warnung.textContent = 'Zu schwach gegen die Fläche darunter: ' +
        schwach.join(', ') + '. Nötig sind 4,5:1, damit auch schwache Augen ' +
        'es lesen.';
    } else if (knapp.length) {
      warnung.className = 'klein farb-warnung knapp';
      warnung.textContent = 'Die Beschreibung liegt bei ' + knapp[0] + ':1. ' +
        'Erlaubt, aber für die kleinen Zeilen knapp — ab 7:1 liest es sich ' +
        'auch bei schlechtem Licht mühelos.';
    } else {
      warnung.className = 'klein farb-warnung hidden';
    }
  }

  /** WCAG-Kontrast. Dieselbe Rechnung wie in `srv/varianten.php`. */
  function kontrast(a, b) {
    const hell = hex => {
      const t = hex.replace('#', '').match(/../g).map(x => {
        const v = parseInt(x, 16) / 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * t[0] + 0.7152 * t[1] + 0.0722 * t[2];
    };
    const l1 = hell(a), l2 = hell(nachHex(b));
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }

  /** `rgb(20, 17, 15)` oder `#14110f` → `#14110f`. */
  function nachHex(farbe) {
    if (farbe.startsWith('#')) return farbe;
    const t = farbe.match(/\d+/g) || [0, 0, 0];
    return '#' + t.slice(0, 3).map(v => Number(v).toString(16).padStart(2, '0')).join('');
  }

  /**
   * Setzt die Farbfelder auf das, was gerade wirklich gilt.
   *
   * Nach einem Palettenwechsel zeigten sie sonst die Farbe der vorigen — man
   * sieht Orange auf dem Bildschirm und Blau im Feld und weiss nicht, welches
   * stimmt.
   */
  function farbfelderAngleichen() {
    const stil = getComputedStyle(wurzel);
    FARBEN.forEach(f => {
      const feld = document.getElementById(f.feld);
      if (feld) feld.value = nachHex(stil.getPropertyValue(f.token).trim());
    });
    kontrastPruefen();
  }

  const zurueck = document.getElementById('fein-zurueck');
  if (zurueck) {
    zurueck.addEventListener('click', async () => {
      // Erst die Anzeige, dann das Speichern — wie überall hier.
      ['--bild-faktor', '--karten-faktor']
        .concat(FARBEN.map(f => f.token))
        .forEach(t => wurzel.style.removeProperty(t));
      if (reglerBild)   { reglerBild.value = 100;   ausBild.textContent = '100 %'; }
      if (reglerKarten) { reglerKarten.value = 100; ausKarten.textContent = '100 %'; }
      farbfelderAngleichen();
      melden(wurzel.dataset.variante);

      const felder = { bild_anteil: '100', karten_anteil: '100' };
      FARBEN.forEach(f => { felder[f.schluessel] = ''; });
      try {
        for (const [k, w] of Object.entries(felder)) {
          await PU.ruf('einst_setzen', { schluessel: k, wert: w });
        }
        PU.melden('Zurück auf die Palette.', 'gut');
      } catch (fehler) {
        PU.melden(fehler.message, 'schlecht');
      }
    });
  }

  farbfelderAngleichen();

})();
