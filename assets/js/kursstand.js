/* PROMPTHEUS — „Wie weit bin ich?" — die Karte neben dem Stoff.
 *
 * Rechts neben Kurs und Lektion war viel leerer Raum. Hier steht jetzt das,
 * was man beim Lernen tatsächlich wissen will, und zwar **ohne die Seite zu
 * verlassen**: eine Frage anklicken, die Antwort erscheint darunter.
 *
 * **Die Zahlen kommen aus der Datenbank, nicht von einem Modell**
 * (`srv/kursstand.php`). Über den eigenen Stand darf nichts geraten werden.
 * Der Tutor daneben erzählt; hier wird gezählt.
 *
 * **Der Ton ist freundlich, aber nicht verlogen.** „Stark" heisst: beim
 * ersten Versuch richtig, ohne Hinweis, ohne Musterlösung. Ein Lob, das
 * jeder für alles bekommt, ist keins — und wer merkt, dass die Academy ihm
 * schmeichelt, glaubt ihr auch das Übrige nicht mehr.
 *
 * Die Fragen richten sich nach dem Ort (Kurs oder Lektion) und nach der
 * Stufe: in Stufe 1 und 2 sind die Sätze kürzer und die Bilder gröber als
 * in Stufe 5. Ein Vierzehnjähriger und ein Zehnjähriger lesen nicht
 * dasselbe gern.
 */
'use strict';

PU.standKarten = {};        // pfad -> zuletzt geholter Stand

/**
 * Baut die Karte.
 *
 * @param {object} opt {kurs, lektion, beiWechsel}
 * @returns {HTMLElement}
 */
PU.standKarte = function (opt) {
  const kasten = PU.el('div', 'medien-kasten standkarte');
  kasten.innerHTML = '<h4>Dein Stand</h4><p class="klein">Lade …</p>';

  PU.ruf('kurs_stand', { pfad: opt.kurs })
    .then(j => {
      PU.standKarten[opt.kurs] = j.stand;
      standKarteMalen(kasten, j.stand, opt);
    })
    .catch(e => {
      kasten.innerHTML = '<h4>Dein Stand</h4><p class="fehler">' + PU.h(e.message) + '</p>';
    });

  return kasten;
};

function standKarteMalen(kasten, s, opt) {
  if (s.leer) {
    kasten.innerHTML = '<h4>Dein Stand</h4>' +
      '<p class="klein">In diesem Kurs gibt es noch keine Aufgaben — hier ist nichts zu verpassen.</p>';
    return;
  }

  const jung = s.kurs.art === 'stufe' && s.kurs.stufe > 0 && s.kurs.stufe <= 2;

  // Die Lektion, in der man gerade steht — falls die Karte dort hängt.
  const hier = opt.lektion
    ? s.lektionen.find(l => l.pfad === opt.lektion)
    : null;

  const anteil = hier
    ? (hier.aufgaben ? Math.round(hier.geloest * 100 / hier.aufgaben) : 0)
    : s.prozent;

  kasten.innerHTML =
    '<h4>' + (hier ? 'Diese Lektion' : 'Dein Stand') + '</h4>' +
    '<div class="balken"><i style="width:' + anteil + '%"></i></div>' +
    '<p class="klein">' + PU.h(kopfzeile(s, hier, jung)) + '</p>' +
    '<div class="stand-fragen"></div>' +
    '<div class="stand-antwort" id="stand-antwort"></div>';

  const knoepfe = kasten.querySelector('.stand-fragen');
  const antwort = kasten.querySelector('.stand-antwort');

  fragenFuer(s, hier, jung).forEach(f => {
    const k = PU.el('button', 'stand-frage', PU.h(f.text));
    k.type = 'button';
    k.addEventListener('click', () => {
      knoepfe.querySelectorAll('.stand-frage').forEach(x => x.classList.remove('aktiv'));
      k.classList.add('aktiv');
      antwort.innerHTML = f.antwort(s, hier, jung);

      // Ein Weiter-Knopf in der Antwort führt irgendwohin — und zwar ohne
      // Umweg über eine Liste. Genau darum geht es hier.
      antwort.querySelectorAll('[data-zu-lektion]').forEach(a => {
        a.addEventListener('click', () => PU.lektionOeffnen(a.dataset.zuLektion));
      });
      antwort.querySelectorAll('[data-zu-pruefung]').forEach(a => {
        a.addEventListener('click', () => {
          PU.lernenZustand = { wo: 'pruefung', kurs: a.dataset.zuPruefung, lektion: null };
          PU.wechsel('lernen');
        });
      });
    });
    knoepfe.appendChild(k);
  });
}

/* ---------------------------------------------------------------- Kopfzeile */
function kopfzeile(s, hier, jung) {
  if (hier) {
    if (hier.aufgaben === 0) return 'Hier gibt es nichts abzugeben — nur zu lesen.';
    if (hier.fertig)         return 'Alle ' + hier.aufgaben + ' Aufgaben gelöst. Sauber.';
    if (hier.geloest === 0)  return hier.aufgaben + ' Aufgaben warten hier auf dich.';
    return hier.geloest + ' von ' + hier.aufgaben + ' geschafft — ' +
           (hier.aufgaben - hier.geloest) + ' noch offen.';
  }

  if (s.geloest === 0) return s.aufgaben_ges + ' Aufgaben, noch keine gelöst. Fang irgendwo an.';
  if (s.geloest === s.aufgaben_ges) {
    return jung ? 'Alles gelöst! 🎉' : 'Alle ' + s.aufgaben_ges + ' Aufgaben gelöst.';
  }
  return s.geloest + ' von ' + s.aufgaben_ges + ' Aufgaben · ' + s.punkte + ' Punkte geholt.';
}

/* ---------------------------------------------------------------- Die Fragen */
function fragenFuer(s, hier, jung) {
  const f = [];

  f.push({
    text: jung ? 'Wie weit bin ich?' : 'Wie weit bin ich schon?',
    antwort: antwortWieWeit
  });

  // „Wo war ich stark?" nur, wenn es etwas zu sagen gibt. Ein Knopf, der
  // „bisher nichts" antwortet, ist eine Enttäuschung mit Ansage.
  if (s.stark.length) {
    f.push({ text: 'Wo war ich stark?', antwort: antwortStark });
  }

  if (s.offene_ges > 0) {
    f.push({
      text: jung ? 'Was fehlt noch?' : 'Welche Aufgaben soll ich noch machen?',
      antwort: antwortOffen
    });
    f.push({ text: 'Was mache ich als Nächstes?', antwort: antwortNaechstes });
  } else {
    f.push({ text: 'Wie geht es weiter?', antwort: antwortNaechstes });
  }

  return f;
}

function antwortWieWeit(s, hier, jung) {
  const fertigeLek = s.lektionen.filter(l => l.fertig).length;
  const mitAufgaben = s.lektionen.filter(l => l.aufgaben > 0).length;

  let t = '<p><b>' + s.geloest + ' von ' + s.aufgaben_ges + ' Aufgaben</b> in diesem Kurs — ' +
          s.prozent + ' %.</p>';

  if (mitAufgaben > 0) {
    t += '<p class="klein">' + fertigeLek + ' von ' + mitAufgaben +
         ' Lektionen ganz durch. ' + s.punkte + ' von ' + s.punkte_moeglich +
         ' möglichen Punkten geholt.</p>';
  }

  // Die Lektionsleiste: wo man war, sieht man schneller als man es liest.
  t += '<ul class="stand-liste">';
  s.lektionen.forEach(l => {
    const zeichen = l.fertig ? '✓' : (l.angefangen ? '◐' : '○');
    const klasse  = l.fertig ? 'erfuellt' : (l.angefangen ? 'teil' : 'offen');
    t += '<li><span class="zeichen ' + klasse + '">' + zeichen + '</span>' +
         '<span>' + l.nr + '. ' + PU.h(l.titel) +
         (l.aufgaben ? ' <span class="klein">(' + l.geloest + '/' + l.aufgaben + ')</span>' : '') +
         '</span></li>';
  });
  t += '</ul>';

  if (s.serie > 1) {
    t += '<p class="klein">🔥 ' + s.serie + ' Tage in Folge dabei — das ist der Teil, ' +
         'den die meisten nicht schaffen.</p>';
  }
  return t;
}

function antwortStark(s, hier, jung) {
  let t = '<p>Stark heisst hier: <b>beim ersten Versuch richtig</b>, ohne Hinweis ' +
          'und ohne Musterlösung.</p><ul class="stand-liste">';

  s.stark.forEach(st => {
    t += '<li><span class="zeichen erfuellt">★</span><span>' +
         PU.h(typName(st.typ)) + ' — ' + st.sauber + ' von ' + st.gesamt +
         ' auf Anhieb <span class="klein">(' + st.prozent + ' %)</span></span></li>';
  });
  t += '</ul>';

  const bester = s.stark[0];
  if (bester && bester.prozent >= 80) {
    t += '<p class="klein">Das ist deine Sorte Aufgabe. Wenn du irgendwo Zeit sparen ' +
         'willst, dann hier — und die gesparte Zeit steckst du in das, was noch hakt.</p>';
  } else {
    t += '<p class="klein">Noch kein klarer Favorit. Das ist normal, solange der Kurs ' +
         'frisch ist — es wird sich zeigen.</p>';
  }
  return t;
}

function antwortOffen(s, hier, jung) {
  let t = '<p>Es sind noch <b>' + s.offene_ges + ' Aufgaben</b> offen' +
          (s.offene_ges > s.offene.length ? ' — hier die nächsten ' + s.offene.length : '') +
          ':</p><ul class="stand-liste">';

  s.offene.forEach(o => {
    t += '<li><span class="zeichen ' + (o.versucht ? 'teil' : 'offen') + '">' +
         (o.versucht ? '◐' : '○') + '</span><span>' + PU.h(o.titel) +
         ' <span class="klein">' + o.punkte + ' P · Lektion ' + o.nr + '</span>' +
         '<br><a class="stand-link" data-zu-lektion="' + PU.h(o.lektion) + '">' +
         (o.versucht ? 'noch einmal versuchen' : 'hingehen') + ' →</a></span></li>';
  });
  t += '</ul>';

  const angefangen = s.offene.filter(o => o.versucht).length;
  if (angefangen > 0) {
    t += '<p class="klein">' + angefangen + ' davon hast du schon einmal versucht. ' +
         'Genau die gehen beim zweiten Mal meist schnell.</p>';
  }
  return t;
}

function antwortNaechstes(s, hier, jung) {
  const n = s.naechster_schritt;

  if (n.art === 'fertig') {
    return '<p><b>Dieser Kurs ist durch.</b> ' + s.geloest + ' von ' + s.aufgaben_ges +
           ' Aufgaben, ' + s.punkte + ' Punkte.</p>' +
           '<p class="klein">Such dir den nächsten Kurs — oder komm wieder, wenn du ' +
           'etwas nachschlagen willst. Der Stoff bleibt hier stehen.</p>';
  }

  if (n.art === 'pruefung') {
    return '<p>Alle Aufgaben sind gelöst. Jetzt kommt die <b>Abschlussprüfung</b>.</p>' +
           '<p class="klein">Keine Hinweise, keine Musterlösung — dafür eine Urkunde ' +
           'mit Prüfcode, wenn du bestehst.</p>' +
           '<p><a class="stand-link" data-zu-pruefung="' + PU.h(n.pfad) + '">Zur Prüfung →</a></p>';
  }

  let t = '<p>Als Nächstes: <b>' + n.nr + '. ' + PU.h(n.titel) + '</b></p>' +
          '<p class="klein">' +
          (n.angefangen
            ? 'Da warst du schon — es fehlen noch ' + n.offen + ' Aufgaben.'
            : 'Noch nicht angefangen, ' + n.offen + ' Aufgaben warten dort.') +
          '</p>' +
          '<p><a class="stand-link" data-zu-lektion="' + PU.h(n.pfad) + '">Dorthin →</a></p>';

  if (s.zuletzt && s.zuletzt.lektion !== n.pfad) {
    t += '<p class="klein">Zuletzt gearbeitet hast du in Lektion ' + s.zuletzt.nr + ' — ' +
         PU.h(s.zuletzt.lektion_titel) + '.</p>';
  }
  return t;
}

function typName(typ) {
  return {
    denkaufgabe: 'Denkaufgaben', raeumlich: 'Räumliches', schiebe: 'Sortieraufgaben',
    plugplay: 'Zuordnen', uebereinstimmung: 'Paare finden', mathe: 'Rechnen',
    technisch: 'Technisches', krypto: 'Verschlüsselung', planung: 'Planen',
    secret: 'Geheimnisse', sicherheit: 'Sicherheit', multitask: 'Mehrschrittiges'
  }[typ] || typ;
}
