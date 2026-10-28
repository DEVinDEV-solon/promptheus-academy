/* PROMPTHEUS — Lernen: Kursliste, Kurs, Lektion, Prüfung.
 *
 * Drei Zustaende in einer Ansicht statt drei Ansichten: der Weg ist
 * Kurse → Kurs → Lektion, und ein Menüpunkt je Zwischenschritt wäre ein
 * Menü, das sich beim Lernen ständig ändert.
 */
'use strict';

PU.lernenZustand = { wo: 'liste', kurs: null, lektion: null };

PU.lernenZeichnen = function () {
  // Kopierschutz gilt seitenweise: beim Wechsel erst einmal aus.
  document.body.classList.remove('kopierschutz-an');
  const z = PU.lernenZustand;
  if (z.wo === 'kurs' && z.kurs)         return PU.kursZeichnen(z.kurs);
  if (z.wo === 'lektion' && z.lektion)   return PU.lektionZeichnen(z.lektion);
  if (z.wo === 'pruefung' && z.kurs)     return PU.pruefungZeichnen(z.kurs);
  if (z.wo === 'seite'   && z.seite)     return PU.seiteZeichnen(z.seite);
  return PU.kurslisteZeichnen();
};

/* ============================================================ Kursliste */
PU.kurslisteZeichnen = async function () {
  const ziel = document.getElementById('view-lernen');
  ziel.innerHTML = '<p class="leer-hinweis">Lade Kurse …</p>';
  PU.lernenZustand.wo = 'liste';

  let j;
  try { j = await PU.ruf('kurse'); }
  catch (e) { ziel.innerHTML = '<p class="fehler">' + PU.h(e.message) + '</p>'; return; }

  PU.letzterStand = j.stand;
  PU.standSetzen(j.stand);

  ziel.innerHTML = '';

  // Fehler im Lehrstoff sieht nur der Tutor — und er sieht sie sofort, ganz
  // oben. Ein Kurs mit einer kaputten Aufgabe darf nicht still weniger
  // Aufgaben haben als gedacht.
  if (j.fehler_im_stoff && j.fehler_im_stoff.length) {
    const k = PU.el('div', 'ergebnis falsch');
    k.innerHTML = '<div class="ergebnis-kopf"><span class="zeichen">✕</span>' +
      j.fehler_im_stoff.length + ' Fehler im Lehrstoff</div><ul>' +
      j.fehler_im_stoff.map(f => '<li>' + PU.h(f) + '</li>').join('') + '</ul>';
    ziel.appendChild(k);
  }

  // Die Tages-Challenge. Sie gibt die normalen Punkte der Aufgabe UND einen
  // Bonus obendrauf — einmal je Tag. Der Bonus steht auf der Karte, weil eine
  // Belohnung, von der man erst hinterher erfährt, keine Einladung ist.
  // Sie steht in einer Reihe zu zweit: zwei Drittel Challenge, ein Drittel
  // Ausblick. Über die volle Breite war sie eine lange, fast leere Bank — und
  // der Platz daneben trug nichts.
  const reihe = PU.el('div', 'challenge-reihe');

  const tag = PU.tagesaufgabe;
  if (tag && tag.aufgabe) {
    const k = PU.el('div', 'karte challenge-karte');
    kartenBild(k, j.challenge_bild);

    const marke = tag.erledigt
      ? '<span class="marke-stufe fertig">heute gelöst</span>'
      : '<span class="marke-stufe">' + tag.aufgabe.punkte +
        (tag.bonus > 0 ? ' + ' + tag.bonus + ' Bonus' : '') + ' P</span>';

    k.innerHTML = '<div class="karte-kopf"><h3>⭐ Tages-Challenge</h3>' + marke + '</div>' +
      '<p class="klein">' + PU.h(tag.aufgabe.titel) + '</p>' +
      '<p class="klein">' + (tag.erledigt
        ? (tag.bonus_erhalten > 0
            ? 'Bonus gutgeschrieben: <b>+' + tag.bonus_erhalten + ' Punkte</b>. Morgen wartet die nächste.'
            : 'Erledigt. Morgen wartet die nächste.')
        : 'Jeden Tag eine Aufgabe für alle, aus dem Datum gezogen — heute mit ' +
          (tag.bonus > 0 ? '<b>' + tag.bonus + ' Extrapunkten</b>' : 'ihren normalen Punkten') + '.') +
      '</p>';

    if (!tag.erledigt) {
      const knopf = PU.el('button', 'knopf still', 'Zur Aufgabe');
      knopf.addEventListener('click', () => {
        if (tag.lektion) PU.lektionOeffnen(tag.lektion);
        else PU.kursOeffnen(tag.kurs);
      });
      k.appendChild(knopf);
    }
    reihe.appendChild(k);
  }

  const stufenAlle = j.kurse.filter(k => k.art === 'stufe');
  reihe.appendChild(PU.zielKarte(stufenAlle.filter(k => k.bestanden).length, stufenAlle.length));
  ziel.appendChild(reihe);

  const stufen   = j.kurse.filter(k => k.art === 'stufe');
  const infos    = j.kurse.filter(k => k.art === 'info');
  const domaenen = j.kurse.filter(k => k.art === 'domaene');
  const zusatz   = j.kurse.filter(k => k.art === 'zusatz');

  ziel.appendChild(PU.el('h1', '', 'Die sechs Stufen'));
  ziel.appendChild(PU.el('p', 'hinweis',
    'Jede Stufe schließt mit einer Prüfung und einer Urkunde ab. ' +
    'Die nächste Stufe öffnet sich, sobald die vorige bestanden ist.'));
  ziel.appendChild(kartenGitter(stufen));

  if (domaenen.length) {
    ziel.appendChild(PU.el('h2', '', 'Fachkurse'));
    ziel.appendChild(PU.el('p', 'hinweis',
      'Wahlkurse für einzelne Anwendungsbereiche. Sie laufen neben den Stufen und ' +
      'setzen den Stoff aus Stufe 1 bis 3 voraus.'));
    ziel.appendChild(kartenGitter(domaenen));
  }

  /* Der Info-Kurs steht zwischen den Fachkursen und dem Abschluss.
   *
   * Er setzt nichts voraus und prüft nichts — deshalb ist er kein Fachkurs und
   * auch nicht das Ziel hinter allen Stufen. Eine eigene Überschrift ist die
   * ehrlichste Lösung: Eine Karte ohne Rubrik sähe aus wie ein Versehen.
   */
  if (infos.length) {
    ziel.appendChild(PU.el('h2', '', 'Info-Kurs'));
    ziel.appendChild(PU.el('p', 'hinweis',
      'Zum Hören und Ansehen: ein Kurs ohne Prüfung, ohne Punkte und ohne ' +
      'Voraussetzung. Er läuft neben den Stufen her, nicht in ihrer Reihe.'));
    ziel.appendChild(kartenGitter(infos));
  }

  /* Der Abschluss steht ganz unten — nicht, weil er unwichtig wäre, sondern
     weil er das Letzte ist. Über den Stufen stünde er wie ein Angebot; hier
     steht er wie ein Ziel, und daneben erklärt der Link, was er überhaupt
     ist. Ohne diesen Link wäre er eine gesperrte Karte ohne Begründung. */
  if (zusatz.length) {
    ziel.appendChild(PU.el('h2', '', 'Danach'));
    const wozu = PU.el('p', 'hinweis',
      'Der Abschluss hinter allen sechs Stufen. Er kostet nichts extra, hat keine ' +
      'Prüfung und läuft nicht ab. ');
    const mehr = PU.el('a', '', 'Was er ist, und wofür ›');
    mehr.href = '#/ziel';
    wozu.appendChild(mehr);
    ziel.appendChild(wozu);
    ziel.appendChild(kartenGitter(zusatz));
  }
};

/**
 * Legt ein Bild hinter eine Karte.
 *
 * Das Bild kommt vom Server und nur dann, wenn die Datei wirklich da ist —
 * hier wird also nichts geraten. Der Schutzverlauf, der den Text lesbar hält,
 * steckt in `.mit-bild`; hier steht nur, welches Bild es ist.
 */
function kartenBild(karte, url) {
  if (!url) return;
  karte.classList.add('mit-bild');
  karte.style.setProperty('--karte-bild', 'url("' + url + '")');
}

/**
 * Die Karte neben der Tages-Challenge: wohin das alles führt.
 *
 * Sie zeigt kein weiteres Angebot, sondern **das Ziel** — was am Ende aller
 * sechs Stufen wartet: ein Gratiskurs, in dem man die eigene Marke und die
 * eigene Webseite baut. Ein Ziel, das man von Anfang an sieht, trägt weiter
 * als eine Überraschung am Schluss; und weil daneben steht, wie weit es noch
 * ist, bleibt es eine Aussage über den eigenen Weg statt eine Reklame.
 */
/**
 * Die Zielkarte — sie steht auf zwei Seiten.
 *
 * Sie nimmt zwei Zahlen und nicht die Kursliste: „Lernen" kennt die Kurse,
 * „Dein Stand" kennt nur die Urkunden. Beide können zählen, wie viele Stufen
 * geschafft sind — also zählt jede selbst und die Karte rechnet nicht noch
 * einmal aus derselben Angabe in zwei Formen.
 */
PU.zielKarte = function (geschafft, gesamt) {
  const offen  = Math.max(0, gesamt - geschafft);
  const fertig = gesamt > 0 && offen === 0;

  // Damit der Menüpunkt „Der 7. Kurs" denselben Stand zeigt wie die Karte.
  // Er kennt die Kursliste nicht; hier ist sie gerade gezählt worden.
  PU.zielStand = { geschafft: geschafft, gesamt: gesamt };

  const k = PU.el('div', 'karte ziel-karte klickbar' + (fertig ? ' feier' : ''));

  /* Eine Karte, die etwas tut, muss auch mit der Tastatur zu erreichen sein.
     `div` mit Klickhorcher allein ist für alle unsichtbar, die nicht zeigen
     können — und ein Ziel, das nur mit der Maus zu öffnen ist, ist für einen
     Teil der Lernenden gar keins. */
  k.setAttribute('role', 'button');
  k.setAttribute('tabindex', '0');
  k.setAttribute('aria-label', 'Dein Ziel: Zusatzkurs Brand-Guideline — mehr erfahren');

  const oeffnen = () => { if (PU.zielSeite) PU.zielSeite(geschafft, gesamt); };
  k.addEventListener('click', oeffnen);
  k.addEventListener('keydown', (e) => {
    // Leertaste scrollt sonst die Seite unter dem Fenster weg.
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); oeffnen(); }
  });

  k.innerHTML =
    // Das Abzeichen steht ÜBER der Überschrift, nicht daneben: Bei grosser
    // Schrift war neben „🏛 Dein Ziel" kein Platz mehr, und die Überschrift
    // brach mitten im Wort (Testordner 28.09.2026).
    '<div class="zielkarte-kopf"><span class="marke-stufe' + (fertig ? ' fertig' : '') + '">' +
      (fertig ? 'freigeschaltet' : 'nach Stufe ' + gesamt) + '</span>' +
    '<h3>🏛 Dein Ziel</h3></div>' +
    '<p class="klein"><b>Deine eigene Marke, deine eigene Webseite.</b></p>' +
    '<p class="klein">Wer alle sechs Stufen besteht, bekommt den Zusatzkurs ' +
    '<b>Brand-Guideline</b> geschenkt: Farben, Schrift und Ornamente zu einer ' +
    'eigenen Handschrift bündeln — und daraus eine Webseite bauen, die nach ' +
    'dir aussieht und nicht nach Vorlage.</p>' +
    '<p class="klein warum">' + (fertig
      ? 'Alle Stufen bestanden. Der Kurs steht auf deiner Glückwunschseite bereit.'
      : 'Noch <b>' + offen + '</b> von ' + gesamt + ' Stufen.') + '</p>' +
    // Ohne diese Zeile sieht die Karte aus wie die Kurskarten daneben, die
    // gesperrt sind — dann klickt niemand.
    '<p class="ziel-mehr">Was der Kurs ist, und wofür ' +
    '<span class="ziel-pfeil" aria-hidden="true">&#8250;</span></p>';

  return k;
};

function kartenGitter(kurse) {
  const gitter = PU.el('div', 'karten');

  kurse.forEach(k => {
    const karte = PU.el('div', 'karte klickbar' + (k.frei ? '' : ' gesperrt'));
    kartenBild(karte, k.bild);

    let marke = '';
    // Gemeint ist die Abschlussprüfung, nicht „alle Aufgaben fertig“. Auf der
    // Marke steht trotzdem nur „bestanden“: „Prüfung bestanden“ war neben
    // langen Kursnamen zu breit und brach aus der Karte aus. Was gemeint ist,
    // sagt der Hinweis beim Darüberfahren.
    if (k.bestanden)   marke = '<span class="marke-stufe fertig" title="Abschlussprüfung bestanden">bestanden</span>';
    else if (!k.frei)  marke = '<span class="marke-stufe geruest">gesperrt</span>';
    else if (k.geruest) marke = '<span class="marke-stufe geruest">Gerüst</span>';
    else if (k.art === 'stufe') marke = '<span class="marke-stufe">Stufe ' + k.stufe + '</span>';
    else marke = '<span class="marke-stufe">' + PU.h(k.code) + '</span>';

    const anteil = k.aufgaben_ges > 0 ? Math.round(k.aufgaben_geloest * 100 / k.aufgaben_ges) : 0;

    /* Ein Info-Kurs hat keine Aufgaben und keine Punkte. „0 von 0 Aufgaben ·
       0 Punkte erreichbar" wäre auf seiner Karte keine Auskunft, sondern ein
       Versehen: Sie zählt auf, was fehlt, statt zu sagen, was da ist. Dort
       steht deshalb, was man bekommt — Film und Hörfolge, ohne Prüfung. */
    const fuss = k.art === 'info'
      ? '<p class="klein">Film und Hörfolge' +
        (k.dauer_h ? ' · ca. ' + PU.h(k.dauer_h) + ' h' : '') +
        ' · ohne Prüfung</p>'
      : '<div class="balken"><i style="width:' + anteil + '%"></i></div>' +
        '<p class="klein">' + k.aufgaben_geloest + ' von ' + k.aufgaben_ges + ' Aufgaben' +
        (k.dauer_h ? ' · ca. ' + PU.h(k.dauer_h) + ' h' : '') +
        ' · ' + k.punkte_max + ' Punkte erreichbar</p>';

    karte.innerHTML =
      '<div class="karte-kopf"><h3>' + PU.h(k.titel) + '</h3>' + marke + '</div>' +
      (k.untertitel ? '<p class="klein">' + PU.h(k.untertitel) + '</p>' : '') +
      fuss;

    if (k.frei) {
      karte.addEventListener('click', () => PU.kursOeffnen(k.pfad));
    } else {
      // Die Begründung muss zur Sperre passen. „Erst die vorige Stufe" ist
      // beim Abschluss schlicht falsch — dort fehlt nicht eine Stufe, sondern
      // die letzte von allen.
      karte.title = k.art === 'zusatz'
        ? 'Frei, sobald alle sechs Stufen bestanden sind.'
        : 'Erst die vorige Stufe bestehen.';
    }
    gitter.appendChild(karte);
  });

  if (!kurse.length) gitter.appendChild(PU.el('p', 'leer-hinweis', 'Hier liegt noch kein Kurs.'));
  return gitter;
}

/* ============================================================ Kurs */
/**
 * Zum Kurs — und zwar dorthin, wo man gerade war.
 *
 * `herVon` ist die Lektion, aus der man kommt. Sie wird auf der Kursseite
 * hervorgehoben und in den Blick gerückt. Wer unten auf „Zurück zum Kurs"
 * drückt, landet sonst oben in einer Auswahl und muss sich neu zurechtfinden
 * — obwohl er den Kurs nie verlassen hat.
 */
PU.kursOeffnen = function (pfad, herVon) {
  PU.lernenZustand = { wo: 'kurs', kurs: pfad, lektion: null, herVon: herVon || null };
  PU.wechsel('lernen');
};

/**
 * Schnell-Links in der Titelzeile eines Kurses.
 *
 * Nur die Geschichte der KI hat mehrere Nachschlagewerke zum selben Stoff —
 * Zeitstrahl, Register, Lehrbausteine, Vortrag. Statt sie im Fließtext zu
 * suchen, stehen sie hier oben. Bei allen anderen Kursen kommt ein leerer
 * String zurück, damit die Titelzeile unverändert bleibt.
 */
function schnellLinks(mitHome) {
  const ziele = [];
  if (mitHome) {
    ziele.push(['Geschichte der KI – Home', '#/kurs/20_Domaenen/DOM-KI-Geschichte']);
  }
  ziele.push(
    ['Personen &amp; Begriffe', '#/seite/20_Domaenen/DOM-KI-Geschichte/zeitstrahl-personen-begriffe'],
    ['Zeitstrahl',             '#/seite/zeitstrahl'],
    ['Lehrbausteine',          '#/seite/lehrbausteine'],
    ['Vortrag',                '#/seite/vortrag_von-der-logik-zur-superintelligenz']
  );
  const eintraege = ziele.map(function (z) {
    return '<a role="menuitem" href="' + z[1] + '">' + z[0] + '</a>';
  }).join('');
  return '<div class="schnell-links">' +
    '<button class="knopf still schnell-knopf" type="button" aria-haspopup="true" aria-expanded="false">' +
    '🔗 Schnell-Links</button>' +
    '<div class="schnell-liste" role="menu">' + eintraege + '</div>' +
  '</div>';
}

/* Ein Klick daneben schließt die Liste. Einmal global registriert — nicht je
   Kursansicht, sonst sammelten sich die Zuhörer mit jedem Besuch. */
document.addEventListener('click', function (ev) {
  document.querySelectorAll('.schnell-links.offen').forEach(function (schale) {
    if (schale.contains(ev.target)) return;
    schale.classList.remove('offen');
    const b = schale.querySelector('.schnell-knopf');
    if (b) b.setAttribute('aria-expanded', 'false');
  });
});

/**
 * Macht das Menü bedienbar: Klick öffnet und schließt, ein Klick daneben
 * schließt ebenfalls. Wird von der Kursseite und von jeder freien Seite
 * aufgerufen — deshalb steht die Logik hier und nicht in der Titelzeile.
 */
PU.schnellLinksBinden = function (schale) {
  const knopf = schale.querySelector('.schnell-knopf');
  if (!knopf) return;
  const menue = knopf.closest('.schnell-links');
  knopf.addEventListener('click', function (ev) {
    ev.stopPropagation();
    const offen = menue.classList.toggle('offen');
    knopf.setAttribute('aria-expanded', offen ? 'true' : 'false');
  });
};

PU.kursZeichnen = async function (pfad) {
  const ziel = document.getElementById('view-lernen');
  ziel.innerHTML = '<p class="leer-hinweis">Lade Kurs …</p>';

  let j;
  try { j = await PU.ruf('kurs', { pfad: pfad }); }
  catch (e) { ziel.innerHTML = '<p class="fehler">' + PU.h(e.message) + '</p>'; return; }

  const k = j.kurs;
  ziel.innerHTML = '';
  // Jetzt ist der Titel bekannt — die Pfadleiste oben bekommt ihn.
  PU.pfadSetzen([['Home', '#/lernen'], [k.titel, null]]);

  // Zwei Spalten: links der Kurs, rechts Video, Hörfolge und der eigene Stand.
  const rahmen = PU.el('div', 'mit-spalte');
  const links  = PU.el('div');
  rahmen.appendChild(links);
  rahmen.appendChild(kursSpalte(k));
  ziel.appendChild(rahmen);

  // Titelzeile: links der Kurstitel, rechts — bei der Geschichte der KI — die
  // Schnell-Links auf die Nachschlagewerke desselben Stoffs.
  const kopf = PU.el('div', 'kurs-kopf');
  kopf.innerHTML = '<div class="kurs-titel"><h1>' + PU.h(k.titel) + '</h1>' +
    (k.untertitel ? '<p class="hinweis">' + PU.h(k.untertitel) + '</p>' : '') + '</div>' +
    (k.pfad === '20_Domaenen/DOM-KI-Geschichte' ? schnellLinks(false) : '');
  links.appendChild(kopf);
  PU.schnellLinksBinden(kopf);

  /* Beim Info-Kurs steht der Film unter dem Untertitel.
   *
   * Sonst sitzt das Video in der Seitenspalte über der Hörfolge. Hier ist es
   * der Inhalt des Kurses, nicht die Zugabe: Wer den Kurs öffnet, soll ihn
   * ansehen können, ohne die Spalte zu suchen. Die Hörfolge bleibt rechts —
   * sie ist die zweite Fassung desselben Stoffs.
   */
  if (k.art === 'info' && k.medien && (k.medien.kurs || {}).video) {
    const film = document.createElement('video');
    film.className = 'kurs-film';
    film.controls = true;
    film.preload = 'metadata';
    film.src = k.medien.kurs.video.url;
    if (k.medien.kurs.video.poster) film.poster = k.medien.kurs.video.poster;
    links.appendChild(film);
  }

  if (k.geruest) {
    const w = PU.el('div', 'hinweis-kasten');
    w.innerHTML = '<b>Gerüst.</b> Dieser Kurs ist angelegt, aber noch nicht ' +
      'ausgearbeitet. Was hier steht, zeigt die Form — nicht den vollen Stoff.';
    links.appendChild(w);
  }

  // ---------------- Die Lektionen. Ganz oben, ohne Scrollen.
  //
  // Vorher stand hier zuerst der Kurstext und darunter die Lektionen — wer
  // aus einer Lektion zurückkam, musste jedes Mal am Vorwort vorbei, um zur
  // nächsten zu kommen. Der Text ist nicht unwichtig, aber man liest ihn
  // einmal; die Lektionsliste braucht man jedes Mal.
  const gitter = PU.el('div', 'karten lektionen');
  let herVonKarte = null;

  k.lektionen.forEach((l, i) => {
    const fertig = l.aufgaben > 0 && l.gelöst === l.aufgaben;
    const hier   = l.pfad === PU.lernenZustand.herVon;

    const karte = PU.el('div', 'karte klickbar lektion-karte' +
                        (fertig ? ' fertig' : '') + (hier ? ' hier' : ''));

    const anteil = l.aufgaben > 0 ? Math.round(l.gelöst * 100 / l.aufgaben) : 0;
    const marke = fertig
      ? '<span class="marke-stufe fertig">durch</span>'
      : (l.dauer_min ? '<span class="marke-stufe">' + l.dauer_min + ' min</span>' : '');
    // Übungslektionen geben Punkte, zählen aber nicht zum Kursstand.
    const uebung = l.uebung
      ? '<p class="klein">Übung — zählt nicht zum Kursstand, bringt aber Punkte.</p>' : '';

    karte.innerHTML =
      '<div class="karte-kopf"><h3>' + (i + 1) + '. ' + PU.h(l.titel) + '</h3>' + marke + '</div>' +
      (l.beschreibung ? '<p class="klein">' + PU.h(l.beschreibung) + '</p>' : '') +
      (l.aufgaben > 0
        ? '<div class="balken"><i style="width:' + anteil + '%"></i></div>' +
          '<p class="klein">' + l.gelöst + ' von ' + l.aufgaben + ' Aufgaben gelöst</p>'
        : '<p class="klein">Zum Lesen — hier gibt es nichts abzugeben.</p>') +
      uebung +
      (hier ? '<p class="klein hier-marke">Hier warst du gerade.</p>' : '');

    karte.addEventListener('click', () => PU.lektionOeffnen(l.pfad));
    if (hier) herVonKarte = karte;
    gitter.appendChild(karte);
  });

  links.appendChild(PU.el('h2', '', 'Lektionen'));
  links.appendChild(gitter);

  // ---------------- Erst danach: worum es geht
  if (k.kopf && k.kopf.trim() !== '') {
    links.appendChild(PU.el('h2', '', 'Worum es in diesem Kurs geht'));
    const text = PU.el('div', 'lektion');
    text.innerHTML = k.kopf;
    links.appendChild(text);
  }

  // ---------------- Das Fazit am Kursende
  //
  // Es steht hinter allen Lektionen und nicht in der Spalte oben: ein
  // Rückblick, den man vor dem Stoff sieht, ist kein Rückblick.
  const fazit = (k.medien || {}).fazit;
  if (fazit && (fazit.video || (fazit.audio || []).length)) {
    links.appendChild(PU.el('h2', '', 'Fazit des Kurses'));
    links.appendChild(PU.el('p', 'hinweis',
      'Was aus den einzelnen Lektionen zusammen hängen bleibt — zum Ansehen und zum Hören.'));

    const kasten = PU.medienKasten({
      titel: 'Rückblick auf ' + k.titel,
      medien: fazit,
      schluessel: k.pfad + '|fazit'
    });
    kasten.style.maxWidth = '620px';
    links.appendChild(kasten);
  }

  if (k.hat_pruefung) {
    const p = PU.el('div', 'karte');
    p.style.marginTop = '1.6rem';
    p.innerHTML = '<div class="karte-kopf"><h3>Abschlussprüfung</h3>' +
      (k.bestanden ? '<span class="marke-stufe fertig">bestanden</span>' : '') + '</div>' +
      '<p class="klein">Zum Bestehen sind ' + k.bestehen_prozent + ' % nötig. ' +
      'In der Prüfung gibt es keine Hinweise und keine Musterlösung. ' +
      'Wer besteht, bekommt eine Urkunde mit Prüfcode.</p>' +
      // Der Unterschied, über den sonst jeder stolpert: die Prüfung hat
      // eigene Aufgaben. Man kann sie bestehen, ohne alle Übungsaufgaben
      // gelöst zu haben — und die Übungen bringen weiter Punkte, ändern am
      // Bestehen aber nichts.
      (k.bestanden
        ? '<p class="klein"><b>Diese Prüfung hast du bestanden.</b> Die Übungsaufgaben ' +
          'in den Lektionen zählen getrennt: sie bringen Punkte, ändern aber nichts ' +
          'am Bestehen. Ein zweiter Anlauf kann die Punktzahl verbessern.</p>'
        : '');
    const knopf = PU.el('button', 'knopf', k.bestanden ? 'Noch einmal antreten' : 'Prüfung starten');
    knopf.addEventListener('click', () => {
      PU.lernenZustand = { wo: 'pruefung', kurs: k.pfad, lektion: null };
      PU.wechsel('lernen');
    });
    p.appendChild(knopf);
    links.appendChild(p);
  }

  // Die Karte, aus der man kam, in den Blick rücken. `nearest` scrollt nur,
  // wenn sie nicht ohnehin schon zu sehen ist — kein Sprung aus Prinzip.
  if (herVonKarte) {
    herVonKarte.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    PU.lernenZustand.herVon = null;          // nur beim ersten Mal hervorheben
  }
};

/** Die rechte Spalte einer Kursseite: Medien, eigener Stand, Tutor. */
function kursSpalte(k) {
  // Beim Info-Kurs steht das Video unter dem Untertitel (links). In der Spalte
  // bliebe es ein zweites Mal stehen — und ein Film, der zweimal auf derselben
  // Seite beginnt, ist eine Frage, die niemand beantworten will.
  let medien = (k.medien || {}).kurs || {};
  if (k.art === 'info' && medien.video) {
    medien = Object.assign({}, medien);
    delete medien.video;
  }

  const spalte = PU.medienSpalte([{
    titel: 'Zum Kurs',
    medien: medien,
    schluessel: k.pfad + '|kurs',
    leerHinweis: 'Zu diesem Kurs ist noch kein Video und keine Hörfolge hinterlegt.'
  }]) || PU.el('aside', 'seitenspalte');

  spalte.appendChild(PU.standKarte({ kurs: k.pfad }));
  spalte.appendChild(tutorKarte({
    kurs: k.pfad, lektion: '', thema: k.titel,
    agent: 'prometheus', text: 'Über den Kurs sprechen'
  }));
  return spalte;
}

/**
 * Der Knopf, der den Tutor von rechts hereinholt.
 *
 * Er steht in der Spalte, nicht im Text: dort, wo der Tutor gleich erscheinen
 * wird. Ein Knopf, dessen Wirkung woanders passiert, muss erst gesucht werden.
 */
function tutorKarte(kontext) {
  const kasten = PU.el('div', 'medien-kasten tutorkarte');
  kasten.innerHTML = '<h4>Tutor fragen</h4>' +
    '<p class="klein">Erklären lassen, nachhaken, Beispiele holen — das Gespräch ' +
    'läuft rechts neben dem Stoff, die Seite bleibt stehen.</p>';

  if (!PU.tutorBereit || !PU.darf('tutor.fragen')) {
    kasten.appendChild(PU.el('p', 'klein',
      'Zurzeit ist kein Tutor eingerichtet. Kurse und Aufgaben laufen trotzdem.'));
    return kasten;
  }

  const k = PU.el('button', 'knopf still', '💬 ' + (kontext.text || 'Tutor öffnen'));
  k.type = 'button';
  k.addEventListener('click', () => PU.tutorPanelOeffnen(kontext));
  kasten.appendChild(k);
  return kasten;
}

PU.zurueckZurListe = function () {
  PU.lernenZustand = { wo: 'liste', kurs: null, lektion: null };
  PU.wechsel('lernen');
};

/* ============================================================ Lektion */
PU.lektionOeffnen = function (pfad) {
  PU.lernenZustand.wo = 'lektion';
  PU.lernenZustand.lektion = pfad;
  PU.wechsel('lernen');
};

/* ============================================================ Freie Seite
 * Nachschlagewerk aus dem Vault (Zeitstrahl, Register). Kein Kurs, keine
 * Aufgaben — eine Seite, die man auch verlinken und neu laden kann.
 */
PU.seiteOeffnen = function (pfad) {
  PU.lernenZustand.wo = 'seite';
  PU.lernenZustand.seite = pfad;
  PU.wechsel('lernen');
};

PU.seiteZeichnen = async function (pfad) {
  const ziel = document.getElementById('view-lernen');
  ziel.innerHTML = '<p class="leer-hinweis">Lade Seite …</p>';

  let j;
  try { j = await PU.ruf('seite', { pfad: pfad }); }
  catch (e) { ziel.innerHTML = '<p class="fehler">' + PU.h(e.message) + '</p>'; return; }

  const s = j.seite;
  ziel.innerHTML = '';
  PU.pfadSetzen([['Home', '#/lernen'], [s.titel, null]]);

  // Eine Spalte, volle Breite: Der Tutor kommt über den Knopf oben rechts als
  // Seitenmenü — dieselbe Bedienung wie in jeder anderen Ansicht.
  const rahmen = PU.el('article', 'lektion');
  rahmen.innerHTML = '<h1>' + PU.h(s.titel) + '</h1>' + s.html;
  ziel.appendChild(rahmen);

  const schutz = s.schutz || {};

  // Kopierschutz: Markieren und Kopieren aus, Kontextmenü aus. Kein echter
  // Schutz — ein Bildschirmfoto bleibt möglich —, aber die übliche Hürde für
  // ein Dokument, das als Ganzes abgegeben wird.
  rahmen.classList.toggle('kopiergeschuetzt', !!schutz.kopierschutz);
  document.body.classList.toggle('kopierschutz-an', !!schutz.kopierschutz);

  // Kopfzeile jeder freien Seite: rechts dasselbe Schnell-Menü wie auf der
  // Kursseite — mit „Geschichte der KI – Home" als erstem Eintrag, damit man
  // aus jedem Nachschlagewerk zurück in den Kurs kommt. Beim Vortrag steht
  // links daneben der PDF-Knopf.
  const kopf = PU.el('div', 'seiten-kopf');

  if (schutz.pdf) {
    let knopf;
    if (s.pdf_url) {
      // Fertige PDF-Datei: ein Klick lädt sie herunter — ohne Druckdialog,
      // ohne Chrome-Kopfzeilen, mit gesetzter Fußzeile und Seitenzahlen.
      knopf = PU.el('a', 'knopf still pdf-knopf', '📄 PDF');
      knopf.href = s.pdf_url;
      knopf.setAttribute('download', '');
      knopf.title = 'Dieses Dokument als fertige PDF-Datei herunterladen';
    } else {
      knopf = PU.el('button', 'knopf still pdf-knopf', '📄 PDF');
      knopf.type = 'button';
      // Zweizeiliger Hinweis: Der Titel-Attribut-Text bricht an \n um.
      knopf.title = 'Dieses Dokument als PDF drucken oder speichern\n\n' +
        'ACHTUNG: Für den Ausdruck bitte den Farbfilter auf „Pergament" umstellen, ' +
        'damit „gelb" heller als „dunkel" wird.';
      knopf.addEventListener('click', () => window.print());
    }
    kopf.appendChild(knopf);
  }

  kopf.insertAdjacentHTML('beforeend', schnellLinks(true));
  rahmen.insertBefore(kopf, rahmen.firstChild);
  PU.schnellLinksBinden(kopf);

  if (schutz.pdf) {

    // … und über dem Titel die Marke: Logo mit Wortmarke, mittig. Der Titel
    // selbst rückt ebenfalls in die Mitte — ein abgegebenes Dokument beginnt
    // mit einem Kopf, nicht mit einer linksbündigen Zeile.
    const marke = document.createElement('div');
    marke.className = 'seiten-marke';
    marke.innerHTML = '<img src="assets/img/marke/fackel-pin-192.png" alt="PROMPTHEUS">' +
                      '<span>PROMPTHEUS Academy</span>';
    rahmen.insertBefore(marke, rahmen.querySelector('h1'));
    rahmen.classList.add('seiten-titel-mitte');

    // Fußzeile auf jeder Seite: feste Position, der Browser wiederholt sie.
    let fuss = document.getElementById('pdf-fuss');
    if (!fuss) {
      fuss = document.createElement('div');
      fuss.id = 'pdf-fuss';
      const fassung = String(s.fassung || '').trim();
      fuss.innerHTML = '<span></span>' +
        '<span class="pdf-fuss-mitte">© 2026 PROMPTHEUS Academy | ' +
        '<a href="https://promptheus-academy.de" target="_blank" rel="noopener">promptheus-academy.de</a></span>' +
        '<span class="pdf-fuss-rechts">' + (fassung ? 'v' + PU.h(fassung) : '') + '</span>';
      document.body.appendChild(fuss);
    }
  }
};

/* Kopierschutz gilt nur, solange eine geschützte Seite offen ist. */
document.addEventListener('copy', function (ev) {
  if (!document.body.classList.contains('kopierschutz-an')) return;
  ev.preventDefault();
  if (PU.melden) PU.melden('Dieser Vortrag ist zur Abgabe gedacht — Kopieren ist gesperrt.', 'schlecht');
});
document.addEventListener('cut', function (ev) {
  if (document.body.classList.contains('kopierschutz-an')) ev.preventDefault();
});
document.addEventListener('contextmenu', function (ev) {
  if (document.body.classList.contains('kopierschutz-an')) ev.preventDefault();
});
document.addEventListener('dragstart', function (ev) {
  if (document.body.classList.contains('kopierschutz-an') && ev.target && ev.target.tagName === 'IMG') {
    ev.preventDefault();
  }
});

/* Ein [[Wikilink]] führt auf eine Seite im Vault. Bis hierher war er ein
   <a href="#">: Der Klick sprang an den Seitenanfang — genau die Beschwerde,
   die zu dieser Seite geführt hat. */
document.addEventListener('click', function (ev) {
  const a = ev.target.closest && ev.target.closest('a.wikilink');
  if (!a) return;
  const zielPfad = String(a.dataset.ziel || '').trim();
  if (!zielPfad) return;
  ev.preventDefault();
  PU.seiteOeffnen(zielPfad);
});

PU.lektionZeichnen = async function (pfad) {
  const ziel = document.getElementById('view-lernen');
  ziel.innerHTML = '<p class="leer-hinweis">Lade Lektion …</p>';

  let j;
  try { j = await PU.ruf('lektion', { pfad: pfad }); }
  catch (e) { ziel.innerHTML = '<p class="fehler">' + PU.h(e.message) + '</p>'; return; }

  const l = j.lektion;
  ziel.innerHTML = '';
  PU.pfadSetzen([
    ['Home', '#/lernen'],
    [l.kurs_titel, '#/kurs/' + encodeURI(l.kurs)],
    [l.titel, null]
  ]);

  // Zwei Spalten: links die Lektion, rechts Video, Hörfolge, der eigene Stand
  // und der Tutor — und später die Vertiefungen aus „Weitere Infos".
  const zweispaltig = PU.el('div', 'mit-spalte');
  const rahmen = PU.el('article', 'lektion');
  rahmen.innerHTML = '<h1>' + PU.h(l.titel) + '</h1>' + l.html;
  zweispaltig.appendChild(rahmen);

  const spalte = PU.medienSpalte([{
    titel: 'Zur Lektion',
    medien: l.medien,
    schluessel: l.pfad,
    leerHinweis: 'Zu dieser Lektion ist noch kein Video und keine Hörfolge hinterlegt.'
  }]) || PU.el('aside', 'seitenspalte');

  // Unter der Medienkarte: der eigene Stand und der Tutor. Der Raum daneben
  // stand vorher leer, und leerer Raum neben einer Aufgabe ist verschenkt —
  // genau dort stellt man sich die Fragen, die hier beantwortet werden.
  spalte.appendChild(PU.standKarte({ kurs: l.kurs, lektion: l.pfad }));
  spalte.appendChild(tutorKarte({
    kurs: l.kurs, lektion: l.pfad, thema: l.titel,
    agent: 'prometheus', text: 'Über das Thema sprechen'
  }));

  zweispaltig.appendChild(spalte);
  ziel.appendChild(zweispaltig);

  // Aufgaben in ihre Platzhalter setzen. Steht kein Platzhalter im Text,
  // hängen sie hinten an — sonst verschwände eine Aufgabe stillschweigend,
  // nur weil jemand den Block ans Dateiende geschrieben hat.
  l.aufgaben.forEach(a => {
    const platz = rahmen.querySelector('.aufgabe-platz[data-aufgabe="' + CSS.escape(a.id) + '"]');
    PU.aufgabeZeichnen(platz || rahmen, a, { pruefung: false, lektion: l.pfad });
    if (platz) platz.classList.remove('aufgabe-platz');
  });

  // Einrichtungs-Fenster im Text (```einrichtung), etwa die Guideline in
  // Lektion 7 des 7. Kurses. Unbekannte Arten bleiben leer.
  rahmen.querySelectorAll('.einrichtung-platz').forEach(platz => {
    if (platz.dataset.einrichtung === 'handschrift' && PU.handschriftKarte) PU.handschriftKarte(platz);
  });

  rahmen.appendChild(lektionFuss(l));
};

/**
 * Der Fuss einer Lektion: weiter, zurück, und was noch fehlt.
 *
 * **„Weiter" steht links und ist der Hauptknopf.** Der übliche Weg durch
 * einen Kurs ist vorwärts; wer ihn geht, soll nicht erst über eine
 * Zwischenseite müssen. Zurück zum Kurs gibt es auch — und es führt genau
 * auf die Karte, aus der man gekommen ist.
 */
function lektionFuss(l) {
  const fuss = PU.el('div', 'lektion-fuss');

  const offen = l.aufgaben.filter(a => !(a.stand && a.stand.richtig)).length;
  const alle  = l.aufgaben.length;

  if (alle > 0) {
    const stand = PU.el('p', 'klein');
    stand.innerHTML = offen === 0
      ? '<b>Alle ' + alle + ' Aufgaben dieser Lektion sind gelöst.</b> Weiter im Kurs.'
      : offen + ' von ' + alle + ' Aufgaben sind hier noch offen — ' +
        'du kannst auch weitergehen und später zurückkommen.';
    fuss.appendChild(stand);
  }

  const reihe = PU.el('div', 'fuss-reihe');

  if (l.naechste) {
    const w = PU.el('button', 'knopf', 'Weiter: ' + PU.h(l.naechste.titel) + ' →');
    w.addEventListener('click', () => PU.lektionOeffnen(l.naechste.pfad));
    reihe.appendChild(w);
  } else {
    const w = PU.el('button', 'knopf', 'Das war die letzte Lektion — zur Übersicht');
    w.addEventListener('click', () => PU.kursOeffnen(l.kurs, l.pfad));
    reihe.appendChild(w);
  }

  const zurueck = PU.el('button', 'knopf still', '← Zurück zum Kurs');
  zurueck.addEventListener('click', () => PU.kursOeffnen(l.kurs, l.pfad));
  reihe.appendChild(zurueck);

  if (l.vorige) {
    const v = PU.el('button', 'knopf still', '← ' + PU.h(l.vorige.titel));
    v.title = 'Zurück zu Lektion ' + PU.h(l.vorige.titel);
    v.addEventListener('click', () => PU.lektionOeffnen(l.vorige.pfad));
    reihe.appendChild(v);
  }

  fuss.appendChild(reihe);
  return fuss;
}

/* ============================================================ Prüfung */
PU.pruefungZeichnen = async function (kurspfad) {
  const ziel = document.getElementById('view-lernen');
  ziel.innerHTML = '<p class="leer-hinweis">Lade Prüfung …</p>';

  let j;
  try { j = await PU.ruf('pruefung_start', { pfad: kurspfad }); }
  catch (e) { ziel.innerHTML = '<p class="fehler">' + PU.h(e.message) + '</p>'; return; }

  const p = j.pruefung;
  ziel.innerHTML = '';
  PU.pfadSetzen([
    ['Home', '#/lernen'],
    [p.kurs_titel || 'Kurs', '#/kurs/' + encodeURI(kurspfad)],
    ['Prüfung', null]
  ]);

  const rahmen = PU.el('article', 'lektion');
  rahmen.innerHTML = '<h1>' + PU.h(p.titel) + '</h1>' +
    '<div class="hinweis-kasten"><b>Prüfung.</b> Alle Aufgaben werden gemeinsam ' +
    'bewertet. Es gibt keine Hinweise und keine Musterlösung. Zum Bestehen sind ' +
    p.bestehen_prozent + ' % nötig.</div>' + p.html;
  ziel.appendChild(rahmen);

  const griffe = {};
  p.aufgaben.forEach(a => { griffe[a.id] = PU.aufgabeZeichnen(rahmen, a, { pruefung: true }); });

  const fuss = PU.el('div');
  fuss.style.marginTop = '2rem';
  const abgeben = PU.el('button', 'knopf groß', 'Prüfung abgeben');
  const ergebnis = PU.el('div');

  abgeben.addEventListener('click', async () => {
    if (!confirm('Prüfung abgeben? Danach lässt sich nichts mehr ändern.')) return;
    abgeben.disabled = true;
    const antworten = {};
    Object.keys(griffe).forEach(id => { antworten[id] = griffe[id].antwort(); });
    try {
      const r = (await PU.ruf('pruefung_abgeben', { pfad: kurspfad, antworten: antworten })).ergebnis;
      ergebnis.innerHTML = pruefungErgebnisHtml(r);
      PU.ertragMelden({ konto: PU.letzterStand && PU.letzterStand.konto, neue_badges: r.neue_badges });
      PU.ruf('stand').then(s => { PU.standSetzen(s.stand); PU.letzterStand = s.stand; });
      if (r.bestanden) PU.melden('🎓 Stufe ' + r.stufe + ' bestanden!', 'gold');
      ergebnis.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (e) {
      PU.melden(PU.h(e.message), 'schlecht');
      abgeben.disabled = false;
    }
  });

  fuss.appendChild(abgeben);
  fuss.appendChild(ergebnis);
  ziel.appendChild(fuss);
};

function pruefungErgebnisHtml(r) {
  let html = '<div class="ergebnis ' + (r.bestanden ? 'richtig' : 'falsch') + '" style="margin-top:1.4rem">' +
    '<div class="ergebnis-kopf"><span class="zeichen">' + (r.bestanden ? '✓' : '✕') + '</span>' +
    (r.bestanden ? 'Bestanden' : 'Nicht bestanden') + ' — ' +
    r.punkte + ' von ' + r.max + ' Punkten (' + r.prozent + ' %, nötig: ' + r.grenze + ' %)</div>';

  if (r.urkunde) {
    html += '<p>Deine Urkunde: <b>' + PU.h(r.urkunde.pruefcode) + '</b> — ' +
      '<a href="api.php?aktion=urkunde_html&code=' + encodeURIComponent(r.urkunde.pruefcode) +
      '" target="_blank" rel="noopener">öffnen und drucken</a></p>';
  }
  if (r.naechste_frei) {
    html += '<p>Stufe ' + r.naechste_frei + ' ist jetzt freigeschaltet.</p>';
  }

  html += '<ul class="teilliste">';
  r.einzeln.forEach(e => {
    html += '<li><span class="zeichen ' + (e.richtig ? 'erfuellt' : 'offen') + '">' +
      (e.richtig ? '✓' : '✕') + '</span><span>' + PU.h(e.titel) +
      ' <span class="klein">(' + e.punkte + '/' + e.max + ')</span>' +
      (e.erklaerung && !e.richtig ? '<br><span class="klein">' + PU.h(e.erklaerung) + '</span>' : '') +
      '</span></li>';
  });
  return html + '</ul></div>';
}

/* Die Brotkrume stand früher hier und wurde in jede Ansicht einzeln
   eingehängt — mit Klickhorchern statt Adressen, also nicht kopierbar und
   nicht in einem neuen Tab zu öffnen. Sie sitzt jetzt einmal oben in der
   Pfadleiste (assets/js/route.js, `PU.pfadSetzen`) und gilt für alle
   Ansichten, nicht nur für die drei, die sie hatten. */
