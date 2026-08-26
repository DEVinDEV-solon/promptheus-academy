/* PROMPTHEUS — Fortschritt: Punkte, Titelleiter, Serie, Abzeichen, Urkunden. */
'use strict';

PU.fortschrittZeichnen = async function () {
  const ziel = document.getElementById('view-fortschritt');
  ziel.innerHTML = '<p class="leer-hinweis">Lade Fortschritt …</p>';

  let j;
  try { j = await PU.ruf('stand'); }
  catch (e) { ziel.innerHTML = '<p class="fehler">' + PU.h(e.message) + '</p>'; return; }

  const s = j.stand;
  PU.letzterStand = s;
  PU.tagesaufgabe = j.tagesaufgabe;
  PU.standSetzen(s);

  // Der Titel steht in einer Fläche auf zwei Dritteln, daneben das Ziel. Über
  // die ganze Breite war die Überschrift eine einzelne Zeile mit viel Luft
  // rechts daneben — und das Ziel stand ganz unten, wo man es erst findet,
  // wenn man schon durch ist.
  ziel.innerHTML = '';

  const kopfreihe = PU.el('div', 'mit-spalte');
  const kopfkarte = PU.el('div', 'textkarte titelkarte');
  kopfkarte.appendChild(PU.el('h1', '', 'Dein Stand'));
  kopfkarte.appendChild(PU.el('p', 'hinweis',
    'Punkte, Abzeichen, Prüfungen und Urkunden — alles, was du bisher ' +
    'gesammelt hast, auf einer Seite.'));
  kopfreihe.appendChild(kopfkarte);

  const kopfspalte = PU.el('aside', 'seitenspalte');
  kopfspalte.appendChild(PU.zielKarte(
    (s.urkunden || []).filter(u => !u.widerrufen).length,
    Object.keys(PU.stufen || {}).length || 6));
  kopfreihe.appendChild(kopfspalte);
  ziel.appendChild(kopfreihe);

  const gitter = PU.el('div', 'gitter-2');

  /* ---------------------------------------------------- Rang */
  //
  // Vorher stand hier „Funke — 249 Punkte" und eine Leiter, ohne ein Wort
  // darüber, woran das hängt. Wer es nicht erraten hat, hat es nicht
  // verstanden — und eine Auszeichnung, deren Bedingung man nicht kennt,
  // motiviert niemanden.
  //
  // Jetzt steht die Messgrösse als Satz dabei, und sie ist je Ebene eine
  // andere: der Schüler sammelt Punkte, die Lehrkraft zählt Lernende in
  // Bewegung, die Eltern sehen den Weg ihres Kindes, die Schule ihre
  // Reichweite.
  const r = j.rang;

  if (r) {
    const punkte = PU.el('div', 'karte');
    const n = r.naechst;
    const vorige = vorigeStufe(r.stufen, r.zahl);
    const spanne = n ? Math.max(1, n.grenze - vorige) : 1;
    const anteil = n ? Math.round((r.zahl - vorige) * 100 / spanne) : 100;

    punkte.innerHTML =
      '<div class="karte-kopf"><h3>' + PU.h(r.rang) + '</h3>' +
      '<span class="aufgabe-punkte">' + r.zahl.toLocaleString('de-DE') + '</span></div>' +
      '<p class="klein rang-einheit">' + PU.h(r.einheit) + '</p>' +
      '<div class="balken"><i style="width:' + Math.max(0, Math.min(100, anteil)) + '%"></i></div>' +
      '<p class="klein">' + (n
        ? 'Noch ' + n.fehlt.toLocaleString('de-DE') + ' bis <b>' + PU.h(n.name) + '</b>.'
        : 'Höchste Stufe erreicht. Mehr geht nicht — und das ist gut so.') + '</p>' +
      // Der Satz, der vorher fehlte.
      '<p class="warum rang-woran">' + PU.h(r.woran) + '</p>';

    const leiter = PU.el('div', 'titelleiter');
    Object.keys(r.stufen).forEach(grenze => {
      const erreicht = r.zahl >= Number(grenze);
      const zeile = PU.el('div', 'titelstufe' + (erreicht ? ' erreicht' : ''));
      zeile.innerHTML = '<span>' + (erreicht ? '✓ ' : '') + PU.h(r.stufen[grenze]) + '</span>' +
                        '<span>' + Number(grenze).toLocaleString('de-DE') + '</span>';
      leiter.appendChild(zeile);
    });
    punkte.appendChild(leiter);
    gitter.appendChild(punkte);
  }

  /* ---------------------------------------------------- Serie */
  const serie = PU.el('div', 'karte');
  serie.innerHTML =
    '<div class="karte-kopf"><h3>Serie</h3>' +
    '<span class="aufgabe-punkte">🔥 ' + s.serie.tage + '</span></div>' +
    '<p class="klein">' +
    (s.serie.tage === 0
      ? 'Löse heute eine Aufgabe, dann beginnt eine neue Serie.'
      : (s.serie.heute
          ? 'Heute schon gelernt. ' + s.serie.tage + ' Tage in Folge.'
          : 'Die Serie läuft noch — heute fehlt aber noch eine Aufgabe.')) +
    '</p><p class="klein">Beste Serie: ' + s.serie.bestwert + ' Tage.</p>';

  if (j.tagesaufgabe && j.tagesaufgabe.aufgabe) {
    const t = j.tagesaufgabe;
    serie.appendChild(PU.el('p', 'klein',
      (t.erledigt ? '⭐ Tages-Challenge erledigt: ' : '⭐ Heute offen: ') +
      PU.h(t.aufgabe.titel)));
    if (!t.erledigt) {
      const knopf = PU.el('button', 'knopf still', 'Zur Tages-Challenge');
      knopf.addEventListener('click', () => PU.kursOeffnen(t.kurs));
      serie.appendChild(knopf);
    }
  }
  gitter.appendChild(serie);
  ziel.appendChild(gitter);

  /* ---------------------------------------------------- Stufen */
  ziel.appendChild(PU.el('h2', '', 'Stufen'));
  const stufenGitter = PU.el('div', 'karten');
  Object.keys(PU.stufen).forEach(nr => {
    const st = PU.stufen[nr];
    const best = s.pruefungen.filter(p => Number(p.stufe) === Number(nr) && Number(p.bestanden) === 1);
    const versucht = s.pruefungen.filter(p => Number(p.stufe) === Number(nr));
    const frei = Number(nr) <= s.hoechste_stufe;

    const karte = PU.el('div', 'karte' + (frei ? '' : ' gesperrt'));
    karte.innerHTML =
      '<div class="karte-kopf"><h3>' + PU.h(st.name) + '</h3>' +
      (best.length ? '<span class="marke-stufe fertig">bestanden</span>'
                   : (frei ? '<span class="marke-stufe">offen</span>'
                           : '<span class="marke-stufe geruest">gesperrt</span>')) + '</div>' +
      '<p class="klein">Stufe ' + nr + ' — ' + PU.h(st.titel) + '</p>' +
      (versucht.length
        ? '<p class="klein">' + versucht.length + ' Prüfungsversuch(e), bestes Ergebnis ' +
          Math.max.apply(null, versucht.map(p => Math.round(p.punkte * 100 / Math.max(1, p.max_punkte)))) + ' %</p>'
        : '<p class="klein">Noch keine Prüfung abgelegt.</p>');
    stufenGitter.appendChild(karte);
  });
  ziel.appendChild(stufenGitter);

  /* ---------------------------------------------------- Abzeichen */
  // Die Abzeichen kommen je Ebene verschieden vom Server: der Lernende hat
  // acht für einzelne Leistungen, die anderen drei haben eigene, kürzere
  // Reihen. Acht Abzeichen für einen Elternteil wären acht Enttäuschungen.
  const abz = j.abzeichen || [];
  if (abz.length) {
    ziel.appendChild(PU.el('h2', '',
      'Abzeichen (' + abz.filter(b => b.hat).length + ' von ' + abz.length + ')'));

    if (r) {
      ziel.appendChild(PU.el('p', 'hinweis',
        'Sie hängen an derselben Zahl wie dein Rang: ' + PU.h(r.was) + '.'));
    }

    const badges = PU.el('div', 'badge-liste');
    abz.forEach(b => {
      const el = PU.el('div', 'badge ' + (b.hat ? 'hat' : 'fehlt'));
      el.innerHTML = '<span class="sym">' + b.symbol + '</span>' +
        '<span><span class="name">' + PU.h(b.name) + '</span><br>' +
        '<span class="klein">' + PU.h(b.bedingung) + '</span></span>';
      badges.appendChild(el);
    });
    ziel.appendChild(badges);
  }

  /* ---------------------------------------------------- Urkunden */
  ziel.appendChild(PU.el('h2', '', 'Urkunden'));
  if (!s.urkunden.length) {
    ziel.appendChild(PU.el('p', 'hinweis',
      'Noch keine. Jede bestandene Stufenprüfung gibt eine Urkunde mit Prüfcode — ' +
      'den kann jeder überprüfen, ohne ein Konto zu haben.'));
  } else {
    const rahmen = PU.el('div', 'tabellenrahmen');
    let html = '<table><tr><th>Stufe</th><th>Prüfcode</th><th>Ausgestellt</th><th></th></tr>';
    s.urkunden.forEach(u => {
      html += '<tr><td>' + u.stufe + ' — ' + PU.h((PU.stufen[u.stufe] || {}).name || '') + '</td>' +
        '<td><code>' + PU.h(u.pruefcode) + '</code></td>' +
        '<td>' + u.ausgestellt.substring(0, 10) + '</td>' +
        '<td>' + (u.widerrufen
          ? '<span class="fehler">widerrufen</span>'
          : '<a href="api.php?aktion=urkunde_html&code=' + encodeURIComponent(u.pruefcode) +
            '" target="_blank" rel="noopener">öffnen</a>') + '</td></tr>';
    });
    rahmen.innerHTML = html + '</table>';
    ziel.appendChild(rahmen);
  }

  /* ------------------------------------------------- Nach allen Stufen */
  ziel.appendChild(abschlussKarte(s));
};

/**
 * Was nach der letzten Stufe kommt.
 *
 * Die Karte steht **immer** da, nicht erst am Ende — nur ihr Inhalt wechselt.
 * Ein Ziel, das man von Anfang an sieht, trägt weiter als eine Überraschung
 * zum Schluss; und solange noch Stufen offen sind, steht daneben, wie viele.
 * Das macht aus der Ankündigung eine Aussage über den eigenen Weg statt einer
 * Reklame.
 *
 * Freigeschaltet wird nichts automatisch: die Karte sagt, was bereitsteht,
 * gehalten wird der Kurs von Menschen.
 */
function abschlussKarte(s) {
  const gesamt = Object.keys(PU.stufen || {}).length || 6;
  const hat    = (s.urkunden || []).filter(u => !u.widerrufen).length;
  const fertig = hat >= gesamt;

  const k = PU.el('div', 'karte abschluss-karte' + (fertig ? ' feier' : ''));

  k.innerHTML =
    '<div class="karte-kopf"><h3>🏛 Nach der letzten Stufe</h3>' +
    '<span class="marke-stufe' + (fertig ? ' fertig' : '') + '">' +
      (fertig ? 'freigeschaltet' : hat + ' von ' + gesamt) + '</span></div>' +

    '<p><b>Der Zusatzkurs Brand-Guideline — kostenlos, wenn alle sechs Stufen ' +
    'bestanden sind.</b></p>' +

    '<p class="klein">Sechs Stufen lang geht es darum, wie eine Maschine denkt. ' +
    'Danach geht es darum, wie <i>du</i> aussiehst: Farben, Schrift, Ornamente ' +
    'und Tonfall zu einer eigenen Handschrift bündeln — und daraus eine Webseite ' +
    'bauen, die nach dir aussieht und nicht nach Vorlage.</p>' +

    '<ul class="klein abschluss-liste">' +
      '<li><b>Deine Marke festlegen</b> — Farben, Schrift, Formen, und warum ' +
        'gerade diese</li>' +
      '<li><b>Auf Lesbarkeit prüfen</b> — Kontrast rechnen statt schätzen, ' +
        'so wie diese Academy es mit ihren eigenen Farben tut</li>' +
      '<li><b>Die Regeln aufschreiben</b>, damit sie auch beim zehnten Mal ' +
        'noch gelten</li>' +
      '<li><b>Eine eigene Webseite bauen</b> und veröffentlichen</li>' +
      '<li><b>Bilder kennzeichnen</b>, wenn eine KI sie gemacht hat</li>' +
    '</ul>' +

    '<p class="warum">' + (fertig
      ? 'Alle Stufen bestanden. Melde dich bei deiner Lehrkraft — der Kurs ' +
        'steht für dich bereit.'
      : 'Noch <b>' + (gesamt - hat) + '</b> von ' + gesamt + ' Stufen. ' +
        'Der Kurs kostet nichts extra; er gehört zum Abschluss.') + '</p>';

  return k;
}

/**
 * Die zuletzt erreichte Schwelle — für den Balken zwischen zwei Stufen.
 *
 * Arbeitet auf der Leiter der eigenen Ebene, nicht auf einer fest
 * eingetragenen Punktreihe: die galt nur für Lernende, und ein Elternteil
 * hätte damit einen Balken gesehen, der zu seinen Zahlen nicht passt.
 */
function vorigeStufe(stufen, zahl) {
  let vor = 0;
  Object.keys(stufen).forEach(g => { if (Number(g) <= zahl) vor = Number(g); });
  return vor;
}
