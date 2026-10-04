/* PROMPTHEUS — die beiden letzten Menüpunkte: „Der 7. Kurs" und „Werkstatt".
 *
 * Beide stehen immer im Menü, auch gesperrt. Wer sieht, was nach den Stufen
 * kommt, hat einen Grund, weiterzumachen — ein Menüpunkt, der erst am Ziel
 * auftaucht, erzählt nichts vom Weg dorthin. Der Weg selbst:
 *
 *   sechs Stufen bestanden  →  „Der 7. Kurs" führt in den Kurs
 *   7. Kurs zu 100 %        →  „Werkstatt" ist frei
 *
 * Hier wird nur **angezeigt**. Ob der Kurs sich öffnet und ob die Werkstatt
 * startet, prüft der Server bei jedem Aufruf selbst (pu_kurs_frei(),
 * pu_werkstatt_stand()) — ein Schloss im Menü hält niemanden auf, der die
 * Schnittstelle kennt.
 */

/** Was der Weg-Schritt „7. Kurs" je Kürzel aus pu_kurs7_weg() sagt. */
PU.WERKSTATT_WEG_TEXT = {
  stufen_offen: 'Erst die sechs Stufen, dann der 7. Kurs — danach öffnet sich die Werkstatt.',
  kurs_fehlt:   'Der 7. Kurs ist auf diesem Rechner noch nicht eingerichtet.',
  kurs_leer:    'Der 7. Kurs wird gerade geschrieben.',
  kurs_offen:   'Der 7. Kurs ist offen. Schließ ihn vollständig ab, dann ist die Werkstatt frei.',
  test:         'Frei im Testbetrieb: Der 7. Kurs ist für dieses Konto als fertig markiert.',
  betreiber:    'Frei für dich als Admin, damit du die Werkstatt vorab prüfen kannst.',
  kurs:         'Frei. Du hast den 7. Kurs abgeschlossen.'
};

/** Der zuletzt geholte Stand — für das Fenster, bis der frische da ist. */
PU.menueWeg = null;
let menueWegZuletzt = 0;

/**
 * Holt den Stand und setzt die beiden Menüpunkte.
 *
 * Nicht öfter als alle 15 Sekunden, ausser `sofort`: Der Stand ändert sich
 * mit einer bestandenen Prüfung oder einer gelösten Aufgabe, nicht mit jedem
 * Klick im Menü.
 */
PU.menueWegLaden = async function (sofort) {
  if (!document.getElementById('menue-werkstatt')) return null;
  if (!sofort && Date.now() - menueWegZuletzt < 15000) return PU.menueWeg;
  menueWegZuletzt = Date.now();

  let r;
  try { r = await PU.ruf('werkstatt_menue'); }
  catch (e) { return PU.menueWeg; }        // ohne Antwort bleibt das Schloss, wie es war

  PU.menueWeg = r;
  menueWegAnwenden(r);
  return r;
};

function menueWegAnwenden(r) {
  const k7 = document.getElementById('menue-kurs7');
  if (k7) {
    const frei = !!(r.kurs7 && r.kurs7.frei && r.kurs7.pfad);
    k7.classList.toggle('gesperrt', !frei);
    k7.classList.toggle('frei', frei);
    // Frei führt der Punkt in den Kurs selbst. Gesperrt bleibt er die
    // Auskunft darüber, was dort wartet (#/ziel).
    k7.href  = frei ? '#/kurs/' + encodeURI(r.kurs7.pfad) : '#/ziel';
    k7.title = frei ? 'Frei — alle sechs Stufen bestanden.'
                    : 'Frei, sobald alle sechs Stufen bestanden sind.';
  }

  const w = document.getElementById('menue-werkstatt');
  if (w) {
    const frei = !!(r.werkstatt && r.werkstatt.frei);
    w.classList.toggle('gesperrt', !frei);
    w.classList.toggle('frei', frei);
    w.title = frei ? 'Die Werkstatt ist frei.'
                   : 'Frei, sobald du den 7. Kurs abgeschlossen hast.';
  }
}

/**
 * Das Fenster hinter dem Menüpunkt „Werkstatt".
 *
 * Gesperrt zeigt es den Weg in drei Schritten und wo man steht; frei zeigt es
 * dasselbe wie der Reiter „Werkstatt" in den Einstellungen, mit dem Knopf zum
 * Öffnen. Gestartet wird nie schon beim Klick aufs Menü — das Fenster ist die
 * Frage, der Knopf die Antwort.
 */
/**
 * Die drei Bedingungen für das Werbe-Modal, mit Haken: 7. Kurs,
 * Registrierung, Abo. Ohne Registrierung lässt sich das Abo nicht prüfen;
 * es steht dann ohne Zusatz da.
 */
function werkstattWerbeWeg(r) {
  const w = r.werkstatt || {};
  const grund = (r.zugang || {}).grund || '';
  const registriert = grund !== 'nicht_registriert';
  return [
    ['Den 7. Kurs abschliessen', !!w.frei,
      w.grund === 'test' ? 'im Testbetrieb markiert'
        : (w.grund === 'kurs_offen' ? 'Stand: ' + (w.prozent | 0) + ' %' : '')],
    ['Die Academy registrieren', registriert, registriert ? '' : 'im Cockpit mit dem Code aus der Zahlung'],
    ['Ein Abo, das läuft', false,
      grund === 'kein_abo' ? 'fehlt oder ist beendet; gebucht wird im Cockpit unter „Pläne verwalten“' : '']
  ];
}

PU.werkstattWerbeWeg = werkstattWerbeWeg;

PU.werkstattFenster = async function () {
  const flaeche = PU.modalZeigen('Der Weg in die Werkstatt');
  if (!flaeche) return;
  PU.fensterOffen = 'werkstatt';
  if (PU.routeSchreiben) PU.routeSchreiben();

  flaeche.appendChild(PU.el('p', 'hinweis', 'Einen Moment …'));
  const r = await PU.menueWegLaden(true);
  if (PU.fensterOffen !== 'werkstatt') return;     // inzwischen geschlossen
  flaeche.innerHTML = '';
  if (!r) {
    flaeche.appendChild(PU.el('p', 'merkzettel', 'Der Stand liess sich gerade nicht laden.'));
    return;
  }

  /* Ohne Registrierung oder Abo zuerst das Werbe-Modal (Plan 30_Community,
     C1): Die Werkstatt gehört zum Abo, die Kurse 1 bis 6 nicht. Die Adresse
     wird ersetzt, nicht angehängt — sonst führte der Zurück-Knopf wieder
     hierher und gleich wieder ins Werbe-Modal. */
  if (r.zugang && !r.zugang.ok && PU.werbungSeite) {
    PU.fensterOffen = 'werbung-werkstatt';
    if (PU.routeSchreiben) PU.routeSchreiben(true);
    PU.werbungSeite('werkstatt', r.zugang.grund, werkstattWerbeWeg(r));
    return;
  }

  const w = r.werkstatt || { frei: false, grund: 'stufen_offen', prozent: 0 };
  const betreiber = w.grund === 'betreiber';
  const stufenOk  = betreiber || w.grund !== 'stufen_offen';
  const kursOk    = w.frei;

  /* Aufbau: oben zwei Blöcke nebeneinander (links der Weg, rechts die
     Werkstatt), dann ein Mäanderband, dann der Erklärfilm. Die Knöpfe stehen
     in der Kopfzeile rechts neben dem Titel, mit Abstand zum ×. */
  const kasten = flaeche.closest('.modal-flaeche');
  if (kasten) kasten.classList.add('werkstatt-flaeche');
  const kopfKnoepfe = PU.el('div', 'werkstatt-kopf-knoepfe');
  const zu = kasten && kasten.querySelector('.modal-zu');
  if (zu) zu.parentNode.insertBefore(kopfKnoepfe, zu);

  const oben = PU.el('div', 'werkstatt-oben');
  const links = PU.el('section', 'werkstatt-block');
  const rechts = PU.el('section', 'werkstatt-block');
  links.appendChild(PU.el('h3', '', 'Drei Schritte'));
  oben.appendChild(links);
  oben.appendChild(rechts);
  flaeche.appendChild(oben);

  const weg = PU.el('ol', 'werkstatt-weg');
  [
    ['Die sechs Stufen bestehen', stufenOk, betreiber ? 'als Admin übersprungen' : ''],
    ['Den 7. Kurs abschließen', kursOk,
      betreiber ? 'als Admin übersprungen'
        : (w.grund === 'test' ? 'im Testbetrieb markiert'
          : (w.grund === 'kurs_offen' ? 'Stand: ' + (w.prozent | 0) + ' %' : ''))],
    ['Die Werkstatt öffnen', false, kursOk ? 'jetzt möglich' : '']
  ].forEach(([text, fertig, zusatz], i) => {
    const li = PU.el('li', fertig ? 'fertig' : (i === 0 || (i === 1 && stufenOk) || (i === 2 && kursOk) ? 'dran' : ''));
    li.innerHTML = '<span class="weg-zeichen" aria-hidden="true">' + (fertig ? '✓' : (i + 1)) + '</span>' +
      '<span class="weg-text"><b>' + PU.h(text) + '</b>' +
      (zusatz ? '<span class="klein"> · ' + PU.h(zusatz) + '</span>' : '') + '</span>';
    weg.appendChild(li);
  });
  links.appendChild(weg);

  // Der 7. Kurs ist offen, aber noch nicht fertig: dann ist das der nächste
  // Schritt, und er bekommt den Knopf.
  if (!w.frei && r.kurs7 && r.kurs7.frei && r.kurs7.pfad) {
    const zeile = PU.el('p', 'werkstatt-weiter');
    const zum = PU.el('button', 'knopf', 'Zum 7. Kurs');
    zum.type = 'button';
    zum.addEventListener('click', () => {
      // Erst das Fenster vergessen, dann schliessen: Sonst ginge
      // modalSchliessen() einen Schritt im Verlauf zurück — und zwar erst,
      // nachdem der Kurs schon offen ist, und man stünde wieder in der Liste.
      PU.fensterOffen = '';
      PU.modalSchliessen();
      PU.kursOeffnen(r.kurs7.pfad);
    });
    zeile.appendChild(zum);
    links.appendChild(zeile);
  }

  if (PU.werkstattZeichnen) PU.werkstattZeichnen(rechts, w, kopfKnoepfe);

  flaeche.appendChild(PU.el('div', 'zierband', ''));
  flaeche.appendChild(werkstattFilm());
};

/**
 * Der Erklärfilm: Hephaistos zeigt die Werkstatt (rund 2:20, mit Ton).
 *
 * Er kommt wie alle Aufnahmen mit dem Medienpaket (`medien/97_Werkstatt/`),
 * das Standbild mit dem Programm. Fehlt der Film, bleibt das Standbild. Er
 * startet nicht von selbst: Das Fenster ist zum Lesen da, der Film ein
 * Angebot daneben. Beim Schliessen leert `PU.modalSchliessen()` das Fenster,
 * damit hält auch der Film an.
 */
function werkstattFilm() {
  const poster = 'assets/img/werkstatt-film.jpg';
  const figur = PU.el('figure', 'werkstatt-film-figur');
  const hinweis = PU.el('figcaption', 'klein werkstatt-film-hinweis',
    'Hephaistos zeigt die Werkstatt: der 7. Kurs, der Zugang, Schlüssel und Fingerabdruck, ' +
    'die Sicherheit und der Weg in die Community. Rund zwei Minuten, mit Ton.');
  const v = PU.el('video', 'werkstatt-film');
  v.controls = true; v.playsInline = true; v.preload = 'metadata';
  v.poster = poster;
  v.setAttribute('aria-label', 'Erklärfilm zur Werkstatt');
  v.addEventListener('error', () => {
    const b = PU.el('img', 'werkstatt-film');
    b.src = poster; b.alt = 'Standbild aus dem Erklärfilm zur Werkstatt';
    v.replaceWith(b);
    hinweis.textContent = 'Der Film kommt mit dem Medienpaket. Bis dahin steht hier sein Standbild.';
  });
  v.src = 'medien/97_Werkstatt/werkstatt-film.mp4';
  figur.appendChild(v);
  figur.appendChild(hinweis);
  return figur;
}

/* Nach jedem Ansichtswechsel nachsehen — gedrosselt, siehe oben. So springt das
   Schloss auf, sobald man nach der letzten Prüfung oder Aufgabe weiterklickt. */
(function () {
  const wechsel = PU.wechsel;
  PU.wechsel = function () {
    const r = wechsel.apply(this, arguments);
    PU.menueWegLaden();
    return r;
  };
})();

PU.menueWegLaden(true);
