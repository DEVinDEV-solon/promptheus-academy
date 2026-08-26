/* PROMPTHEUS — Die Medienspalte: Video oben, Hörfolge darunter.
 *
 * Zu jedem Kurs und zu jeder Lektion gehört rechts eine Spalte. Oben ein
 * Video, darunter ein Podcast in Teilen — dieselbe Sache dreimal erzählt
 * (lesen, sehen, hören), weil dreimal derselbe Gedanke in verschiedener Form
 * mehr trägt als dreimal derselbe Text.
 *
 * Am Ende eines Kurses steht dasselbe noch einmal als **Fazit**: ein Video
 * und eine Tonspur, die die Erkenntnisse der einzelnen Teile zusammenziehen.
 *
 * **Der Spieler merkt sich, wo man war.** Position und gehörte Teile stehen
 * im localStorage, nicht in der Datenbank: es ist eine Bequemlichkeit des
 * Geräts, keine Leistung des Lernenden. Ein Podcast, der nach jedem
 * Seitenwechsel von vorn anfängt, wird nicht zu Ende gehört.
 */
'use strict';

PU.MEDIEN_SPEICHER = 'pu_pod_';

/**
 * Baut die Spalte.
 *
 * @param {Array} kaesten  [{titel, medien, leerHinweis}]
 * @returns {HTMLElement|null} null, wenn nichts anzuzeigen ist
 */
PU.medienSpalte = function (kaesten) {
  if (!PU.eJa('medienspalte')) return null;

  const echte = kaesten.filter(k => k.medien && (k.medien.video || (k.medien.audio || []).length));
  // Wer Lektionen pflegt, sieht auch die leeren Kästen. Für alle anderen
  // verschwindet die Spalte, wenn nichts da ist — ein leerer Kasten mit einem
  // Ablagepfad hilft nur dem, der etwas ablegen darf.
  const tutor = PU.darf('lektionen.manage');
  if (!echte.length && !tutor) return null;

  const spalte = PU.el('aside', 'seitenspalte');

  (echte.length ? echte : kaesten).forEach(k => {
    spalte.appendChild(PU.medienKasten(k));
  });

  return spalte;
};

PU.medienKasten = function (k) {
  const kasten = PU.el('div', 'medien-kasten');
  kasten.appendChild(PU.el('h4', '', PU.h(k.titel)));

  const m = k.medien || {};
  const hatWas = m.video || (m.audio || []).length;

  if (!hatWas) {
    const leer = PU.el('div', 'medien-leer');
    leer.innerHTML =
      PU.h(k.leerHinweis || 'Hier ist noch keine Aufnahme hinterlegt.') +
      '<br><br>Ablegen unter:<br><code>medien/' + PU.h(m.ordner || '') + '/</code>' +
      '<br><span class="klein">Ein Video (<code>video.mp4</code>) und beliebig viele ' +
      'Tonspuren (<code>01_teil.mp3</code>, <code>02_teil.mp3</code> …). ' +
      'Die Reihenfolge macht der Dateiname.</span>';
    kasten.appendChild(leer);
    return kasten;
  }

  if (m.video) {
    const v = document.createElement('video');
    v.controls = true;
    v.preload = 'metadata';
    v.src = m.video.url;
    kasten.appendChild(v);
  }

  if ((m.audio || []).length) {
    kasten.appendChild(PU.podcastSpieler(m.audio, k.schluessel || m.ordner || 'pod'));
  }

  return kasten;
};

/**
 * Der Podcast-Spieler: eine Tonspur, eine Titelliste, Weiterlauf.
 *
 * Kein eigener Abspielkopf — das `<audio controls>` des Browsers kann alles,
 * was gebraucht wird, kennt die Tastatur und die Vorlesehilfen. Dazugebaut
 * ist nur, was fehlt: die Liste der Teile, das automatische Weiterrücken und
 * die Erinnerung, wo man aufgehört hat.
 */
PU.podcastSpieler = function (stuecke, schluessel) {
  const huelle = PU.el('div', 'podcast');
  const ton    = document.createElement('audio');
  ton.controls = true;
  ton.preload  = 'metadata';

  const merker = PU.MEDIEN_SPEICHER + schluessel;
  let stand    = {};
  try { stand = JSON.parse(localStorage.getItem(merker) || '{}'); } catch (e) { stand = {}; }
  if (!stand.gehoert) stand.gehoert = [];

  let jetzt = Math.min(stand.nr || 0, stuecke.length - 1);

  const liste = PU.el('ul', 'pod-liste');
  const knoepfe = [];

  /* **Zwei Arten von Stücken, und sie verhalten sich verschieden.**
     Die Erklärstücke eines Kurses erzählen eine Geschichte in Teilen — sie
     laufen von selbst durch, so wie eine Folge. Was sonst im Ordner liegt, ein
     Lied etwa, tut das nicht: Es hinter Teil fünf automatisch anzuhängen wäre
     eine Entscheidung, die niemand getroffen hat.

     Wer es trotzdem will, schaltet es je Stück mit ⏭ ein. Das ist der
     Unterschied zwischen „läuft automatisch" und „kann automatisch laufen",
     und er soll sichtbar sein statt geraten. */
  const weiter = {};      // von Hand eingeschaltete Fortsetzung, je Stück

  stuecke.forEach((s, i) => {
    // Ein Strich zwischen den Gruppen — dahinter hört nichts mehr von selbst auf.
    if (i > 0 && (stuecke[i - 1].gruppe || '') !== (s.gruppe || '')) {
      const trenner = document.createElement('li');
      trenner.className = 'pod-trenner';
      trenner.setAttribute('aria-hidden', 'true');
      liste.appendChild(trenner);
    }

    const li = document.createElement('li');
    const k  = PU.el('button', 'pod-stueck');
    k.type = 'button';
    // Die Nummer kommt aus dem Dateinamen, wenn er eine trägt — sonst aus der
    // Reihenfolge. Beides zusammen anzuzeigen ergäbe „11 · Worum es geht".
    k.innerHTML = '<span class="nr">' + (s.nr != null ? s.nr : i + 1) + '</span>' +
                  '<span>' + PU.h(s.titel) + '</span>';
    k.addEventListener('click', () => spielen(i, true));
    li.appendChild(k);

    if (s.kette) {
      // Kein Schalter, sondern eine Auskunft: Diese Teile laufen durch.
      const zeichen = PU.el('span', 'pod-kette', '⏵');
      zeichen.title = 'Läuft automatisch weiter';
      zeichen.setAttribute('aria-label', 'läuft automatisch weiter');
      li.appendChild(zeichen);
    } else {
      const schalter = PU.el('button', 'pod-auto', '⏭');
      schalter.type = 'button';
      schalter.title = 'Danach automatisch weiter — aus';
      schalter.setAttribute('aria-pressed', 'false');
      schalter.addEventListener('click', () => {
        weiter[i] = !weiter[i];
        schalter.classList.toggle('an', !!weiter[i]);
        schalter.setAttribute('aria-pressed', weiter[i] ? 'true' : 'false');
        schalter.title = 'Danach automatisch weiter — ' + (weiter[i] ? 'an' : 'aus');
      });
      li.appendChild(schalter);
    }

    liste.appendChild(li);
    knoepfe.push(k);
  });

  function merken() {
    try { localStorage.setItem(merker, JSON.stringify(stand)); } catch (e) { /* privater Modus */ }
  }

  function malen() {
    knoepfe.forEach((k, i) => {
      k.classList.toggle('aktiv', i === jetzt);
      k.classList.toggle('gehoert', stand.gehoert.indexOf(i) >= 0);
    });
  }

  function spielen(i, sofort) {
    jetzt = i;
    stand.nr = i;
    ton.src = stuecke[i].url;

    // Nur beim Fortsetzen desselben Teils an die alte Stelle springen. Wer
    // einen Teil in der Liste anklickt, will ihn von vorn hören.
    if (!sofort && stand.zeit && stand.nr === i) {
      ton.currentTime = stand.zeit;
    }
    if (sofort) ton.play().catch(() => { /* Der Browser darf Nein sagen. */ });

    merken();
    malen();
  }

  ton.addEventListener('timeupdate', () => {
    // Höchstens alle fünf Sekunden schreiben. `timeupdate` feuert viermal je
    // Sekunde; jedes Mal in den Speicher zu schreiben wäre Verschwendung.
    if (!ton.currentTime) return;
    if (Math.abs(ton.currentTime - (stand.zeit || 0)) < 5) return;
    stand.zeit = ton.currentTime;
    merken();
  });

  ton.addEventListener('ended', () => {
    if (stand.gehoert.indexOf(jetzt) < 0) stand.gehoert.push(jetzt);
    stand.zeit = 0;

    /* Weitergelaufen wird nur innerhalb einer Gruppe — oder wo es jemand für
       dieses Stück ausdrücklich eingeschaltet hat. Ohne die zweite Bedingung
       liefe hinter Teil fünf das Lied an, und das hat niemand verlangt. */
    const naechstes = jetzt + 1;
    const kettet = naechstes < stuecke.length
                && (weiter[jetzt] === true
                    || (stuecke[jetzt].kette && stuecke[naechstes].kette));

    if (kettet) { spielen(naechstes, true); return; }

    merken();
    malen();

    // Nur wenn wirklich alles gehört wurde. „Alle Teile gehört" nach dem
    // ersten Stück wäre gelogen, und beim zweiten Mal glaubt es niemand mehr.
    if (stand.gehoert.length >= stuecke.length) {
      PU.melden('🎧 Hörfolge zu Ende. Alle Teile gehört.', 'gut');
    } else if (stuecke[jetzt].kette && !(stuecke[naechstes] || {}).kette) {
      PU.melden('🎧 Die Erklärstücke sind durch.', 'gut');
    }
  });

  huelle.appendChild(ton);
  huelle.appendChild(liste);

  spielen(jetzt, false);
  return huelle;
};

/**
 * Hängt einen Text in die Medienspalte — dorthin gehen die Vertiefungen.
 *
 * Er steht oben, nicht unten: er ist gerade entstanden, und die Aufnahmen
 * darunter waren schon da.
 */
PU.spalteText = function (titel, text, quelle) {
  const spalte = document.querySelector('#view-lernen .seitenspalte');
  if (!spalte) return null;

  // Die Spalte steht immer im Baum, ist aber ausgeblendet, solange sie leer
  // ist — eine leere 330-Pixel-Säule neben dem Text wäre nur weisser Raum.
  // Mit dem ersten Inhalt klappt sie auf.
  spalte.classList.remove('leer');
  const rahmen = spalte.closest('.mit-spalte');
  if (rahmen) rahmen.classList.remove('ohne-spalte');

  const kasten = PU.el('div', 'vertiefung');
  kasten.innerHTML = '<h4>' + PU.h(titel) + '</h4>' +
    text.split(/\n{2,}/).map(a => '<p>' + PU.h(a.trim()) + '</p>').join('') +
    (quelle ? '<p class="quelle">' + PU.h(quelle) + '</p>' : '');

  spalte.insertBefore(kasten, spalte.firstChild);
  kasten.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  return kasten;
};
