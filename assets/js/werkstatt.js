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
    PU.werbungSeite('werkstatt', r.zugang.grund);
    return;
  }

  const w = r.werkstatt || { frei: false, grund: 'stufen_offen', prozent: 0 };
  const betreiber = w.grund === 'betreiber';
  const stufenOk  = betreiber || w.grund !== 'stufen_offen';
  const kursOk    = w.frei;

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
  flaeche.appendChild(weg);

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
    flaeche.appendChild(zeile);
  }

  if (PU.werkstattZeichnen) PU.werkstattZeichnen(flaeche, w);
};

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
