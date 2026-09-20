/* PROMPTHEUS — Die Modalseite der Einstellungen.
 *
 * Ein Fenster, zwei Welten: links die Reiter für alle, darunter die für
 * Tutoren. Ein zweites Zahnrad an anderer Stelle fände niemand — und drei
 * Orte für Einstellungen sind zwei zu viel.
 *
 * **Jede Änderung wird sofort gespeichert.** Es gibt keinen Speichern-Knopf,
 * weil es dann einen Zustand gäbe, in dem das Fenster etwas anderes zeigt als
 * die Academy tut. Die Darstellung wirkt zusätzlich sofort im Baum, damit man die
 * Schriftgrösse sieht, während man sie wählt.
 *
 * Der Unterschied zwischen den beiden Welten ist nicht die Optik, sondern die
 * Tragweite: persönliche Einstellungen ändern das Bild, Academy-Regeln ändern die
 * Punkte. Deshalb steht über den Regeln ein Merkzettel, der sagt, ab wann sie
 * gelten — nämlich ab dem nächsten Versuch, nie rückwirkend.
 */
'use strict';

PU.einstZustand = { reiter: 'profil', daten: null };

/* Welche Merkmale am <html> gehören zu welcher Einstellung. */
PU.EINST_MERKMAL = {
  schriftgroesse: 'schrift',
  textschrift:    'textschrift',
  kontrast:       'kontrast',
  bewegung:       'bewegung',
  breite:         'breite'
};

/* ---------------------------------------------------------------- Öffnen */
PU.einstellungenOeffnen = async function (reiter) {
  const modal = document.getElementById('modal');
  if (!modal) return;

  if (reiter) PU.einstZustand.reiter = reiter;

  // Vollbild: Die Einstellungen sind lang — Rechte-Matrix, Farben, Tutorwege.
  // In einem 940-Pixel-Fenster bekam die Liste einen eigenen Rollbalken und die
  // Seite dahinter behielt ihren. Zwei Balken für eine Liste, und man erwischte
  // immer den falschen.
  modal.classList.remove('hidden');
  modal.classList.add('vollbild');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-voll');
  modal.innerHTML = '<div class="modal-flaeche"><div class="modal-inhalt">' +
                    '<p class="leer-hinweis">Lade Einstellungen …</p></div></div>';

  try {
    PU.einstZustand.daten = await PU.ruf('einst_lesen');
  } catch (e) {
    modal.innerHTML = '<div class="modal-flaeche"><div class="modal-inhalt">' +
      '<p class="fehler">' + PU.h(e.message) + '</p></div></div>';
    return;
  }

  PU.einst = Object.assign({}, PU.einst, PU.einstZustand.daten.person);
  einstZeichnen();
};

PU.einstellungenSchliessen = function () {
  const modal = document.getElementById('modal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('vollbild');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-voll');
  modal.innerHTML = '';
  document.removeEventListener('keydown', aufEscape);
  window.removeEventListener('message', aufBotschaft);
};

function aufEscape(e) { if (e.key === 'Escape') PU.einstellungenSchliessen(); }

/**
 * Esc aus einem eingebetteten Rahmen.
 *
 * Der Reiter „Über PROMPTHEUS" zeigt `stufen/` in einem <iframe>. Wer dort
 * hineinklickt, gibt der Tastatur an das innere Fenster ab — `aufEscape` oben
 * sieht den Tastendruck dann nie. Die eingebettete Seite reicht ihn per
 * postMessage heraus, hier kommt er an.
 *
 * Die Herkunftsprüfung ist Pflicht und keine Formalie: `message` hört auf
 * JEDES Fenster, das etwas schickt. Ohne sie könnte eine fremde Seite dieses
 * Fenster fernsteuern.
 */
function aufBotschaft(e) {
  if (e.origin !== window.location.origin) return;
  if (e.data && e.data.pu === 'schliessen') PU.einstellungenSchliessen();
}

/* ---------------------------------------------------------------- Gerüst */
function einstZeichnen() {
  const modal = document.getElementById('modal');
  const d     = PU.einstZustand.daten;

  // Die Rechte kommen mit den Einstellungen mit — frisch, nicht aus dem
  // Seitenaufbau. Wer eben zum Lehrer gemacht wurde, sieht beim nächsten
  // Öffnen die richtigen Reiter, ohne die Seite neu zu laden.
  if (d.rechte) PU.rechte = d.rechte;

  // Profil zuerst, dann Über PROMPTHEUS, dann der Rest. Wer die Einstellungen
  // öffnet, sucht meistens sich selbst — und die Seite, die erklärt, wo er
  // gelandet ist. Was man selten anfasst (Lob, Konto), steht weiter unten.
  //
  // Keiner dieser Reiter hängt an einem Recht. Sie stehen jedem offen, der
  // angemeldet ist: Sie ändern nur, was diese eine Person sieht und hört.
  const reiter = [
    ['profil',      'Profil'],
    ['ueber',       'Über PROMPTHEUS'],
    ['darstellung', 'Darstellung'],
    ['sprache',     'Sprache & Stimme'],
    ['lernen',      'Lernen'],
    ['lob',         'Lob & Vertiefung'],
    ['konto',       'Konto']
  ];

  // Die Werkstatt erst, wenn die Academy den Coder eingeschaltet hat. Einen
  // Reiter zu zeigen, hinter dem nur „abgeschaltet" steht, wäre Werbung für
  // etwas, das es nicht gibt.
  if (d.coder_stand && d.coder_stand.an) reiter.splice(5, 0, ['coder', 'Werkstatt-Coder']);

  // Reiter für die Verwaltung: jeder hängt an genau dem Recht, das die
  // Aktionen dahinter fordern. Was hier fehlt, gäbe hinterher 403.
  const tutorReiter = [
    ['ki',      'Tutor-KI',      'ki.einstellungen'],
    ['regeln',  'Academy-Regeln',    'regeln.manage'],
    ['konten',  'Konten',        'lernende.manage'],
    ['wartung', 'Wartung',       'wartung.ausfuehren']
  ].filter(r => PU.darf(r[2]));

  const tutor = tutorReiter.length > 0;

  if (!reiter.concat(tutorReiter).some(r => r[0] === PU.einstZustand.reiter)) {
    PU.einstZustand.reiter = 'profil';
  }

  let html = '<div class="modal-flaeche"><div class="modal-kopf">' +
    '<h2>⚙ Einstellungen</h2>' +
    '<button class="modal-zu" type="button" aria-label="Schliessen">×</button>' +
    '</div><div class="modal-koerper"><nav class="modal-reiter">';

  reiter.forEach(r => {
    html += '<button class="reiter-knopf' + (r[0] === PU.einstZustand.reiter ? ' aktiv' : '') +
            '" data-reiter="' + r[0] + '" type="button">' + PU.h(r[1]) + '</button>';
  });

  if (tutor) {
    html += '<div class="reiter-trenner">Verwaltung</div>';
    tutorReiter.forEach(r => {
      html += '<button class="reiter-knopf' + (r[0] === PU.einstZustand.reiter ? ' aktiv' : '') +
              '" data-reiter="' + r[0] + '" type="button">' + PU.h(r[1]) + '</button>';
    });
  }

  html += '</nav><div class="modal-inhalt" id="einst-inhalt"></div></div></div>';
  modal.innerHTML = html;

  modal.querySelector('.modal-zu').addEventListener('click', PU.einstellungenSchliessen);
  modal.addEventListener('click', (e) => { if (e.target === modal) PU.einstellungenSchliessen(); });
  document.addEventListener('keydown', aufEscape);
  window.removeEventListener('message', aufBotschaft);   // doppeltes Anmelden vermeiden
  window.addEventListener('message', aufBotschaft);

  modal.querySelectorAll('.reiter-knopf').forEach(k => {
    k.addEventListener('click', () => {
      PU.einstZustand.reiter = k.dataset.reiter;
      modal.querySelectorAll('.reiter-knopf').forEach(x => x.classList.remove('aktiv'));
      k.classList.add('aktiv');
      inhaltZeichnen();
    });
  });

  inhaltZeichnen();
}

function inhaltZeichnen() {
  const ziel = document.getElementById('einst-inhalt');
  if (!ziel) return;
  ziel.innerHTML = '';
  ziel.scrollTop = 0;
  // „Über PROMPTHEUS" schaltet die Fläche auf randlos und ohne eigenen
  // Rollbalken um (siehe ueberZeichnen). Ohne dieses Zurücksetzen klebte die
  // Umschaltung am nächsten Reiter, und die Rechte-Matrix stünde randlos in
  // einem Kasten, der nicht mehr scrollt.
  ziel.classList.remove('inhalt-rahmen');

  switch (PU.einstZustand.reiter) {
    case 'darstellung': darstellungZeichnen(ziel); break;
    case 'lernen':      lernenZeichnen(ziel);      break;
    case 'lob':         lobZeichnen(ziel);         break;
    case 'konto':       kontoZeichnen(ziel);       break;
    case 'coder':       coderZeichnen(ziel);       break;
    case 'sprache':     spracheZeichnen(ziel);     break;
    case 'profil':      profilZeichnen(ziel);      break;
    case 'ueber':       ueberZeichnen(ziel);       break;
    case 'ki':          kiZeichnen(ziel);          break;
    case 'regeln':      regelnZeichnen(ziel);      break;
    case 'konten':      kontenZeichnen(ziel);      break;
    case 'wartung':     wartungZeichnen(ziel);     break;
  }
}

/* ---------------------------------------------------------------- Bausteine */
/**
 * Eine Zeile mit Auswahlknöpfen.
 *
 * Knöpfe statt eines Auswahlfelds, solange es höchstens vier Möglichkeiten
 * gibt: man sieht alle Werte auf einen Blick und braucht einen Klick statt
 * zwei. Ab fünf wird daraus ein Auswahlfeld — sonst bricht die Zeile um.
 */
function zeileWahl(ziel, titel, warum, werte, jetzt, beiWahl, beschriftung) {
  const zeile = PU.el('div', 'einst-zeile');
  zeile.innerHTML = '<div class="titel">' + PU.h(titel) + '</div>';

  const gruppe = PU.el('div', 'einst-gruppe');

  if (werte.length > 4) {
    const feld = document.createElement('select');
    werte.forEach(w => {
      const o = document.createElement('option');
      o.value = w;
      o.textContent = beschriftung ? (beschriftung[w] || w) : w;
      if (w === jetzt) o.selected = true;
      feld.appendChild(o);
    });
    feld.addEventListener('change', () => beiWahl(feld.value));
    gruppe.appendChild(feld);
  } else {
    werte.forEach(w => {
      const k = PU.el('button', 'einst-wahl' + (w === jetzt ? ' aktiv' : ''),
                      PU.h(beschriftung ? (beschriftung[w] || w) : w));
      k.type = 'button';
      k.addEventListener('click', () => {
        gruppe.querySelectorAll('.einst-wahl').forEach(x => x.classList.remove('aktiv'));
        k.classList.add('aktiv');
        beiWahl(w);
      });
      gruppe.appendChild(k);
    });
  }

  zeile.appendChild(gruppe);
  if (warum) zeile.appendChild(PU.el('p', 'warum', PU.h(warum)));
  ziel.appendChild(zeile);
  return zeile;
}

/** Eine Zeile mit Zahlenfeld. Gespeichert wird beim Verlassen, nicht je Tastendruck. */
function zeileZahl(ziel, titel, warum, jetzt, min, max, beiWahl, einheit) {
  const zeile = PU.el('div', 'einst-zeile');
  zeile.innerHTML = '<div class="titel">' + PU.h(titel) + '</div>';

  const huelle = PU.el('div', 'einst-gruppe');
  const feld = document.createElement('input');
  feld.type = 'number';
  feld.min = String(min);
  feld.max = String(max);
  feld.value = String(jetzt);
  feld.style.minWidth = '7rem';
  huelle.appendChild(feld);
  if (einheit) huelle.appendChild(PU.el('span', 'klein', PU.h(einheit)));

  const senden = () => {
    let w = parseInt(feld.value, 10);
    if (isNaN(w)) w = min;
    w = Math.max(min, Math.min(max, w));
    feld.value = String(w);
    beiWahl(String(w));
  };
  feld.addEventListener('change', senden);
  feld.addEventListener('blur', senden);

  zeile.appendChild(huelle);
  if (warum) zeile.appendChild(PU.el('p', 'warum', PU.h(warum)));
  ziel.appendChild(zeile);
}

/** Speichert eine persönliche Einstellung und lässt sie sofort wirken. */
async function personSetzen(schluessel, wert) {
  try {
    await PU.ruf('einst_setzen', { schluessel: schluessel, wert: wert });
    PU.einst = PU.einst || {};
    PU.einst[schluessel] = wert;

    // Auch der geladene Stand mit — sonst zeigt der Reiter beim nächsten
    // Zeichnen wieder den Wert von vor der Änderung, und man stellt zweimal
    // ein, weil das erste Mal nicht gewirkt zu haben scheint.
    if (PU.einstZustand.daten && PU.einstZustand.daten.person) {
      PU.einstZustand.daten.person[schluessel] = wert;
    }

    if (schluessel === 'thema') {
      PU.themaSetzen(wert, false);
    } else if (PU.EINST_MERKMAL[schluessel]) {
      document.documentElement.dataset[PU.EINST_MERKMAL[schluessel]] = wert;
    }
  } catch (e) {
    PU.melden(PU.h(e.message), 'schlecht');
  }
}

/** Speichert eine Academy-Regel. */
async function regelSetzen(schluessel, wert) {
  try {
    await PU.ruf('regel_setzen', { schluessel: schluessel, wert: wert });
    PU.einstZustand.daten.global[schluessel] = wert;
    PU.melden('Regel gespeichert: <b>' + PU.h(schluessel) + '</b> = ' + PU.h(wert), 'gut');
  } catch (e) {
    PU.melden(PU.h(e.message), 'schlecht');
  }
}

const JA_NEIN = { ja: 'Ja', nein: 'Nein' };
const AN_AUS  = { an: 'An', aus: 'Aus' };

/* ---------------------------------------------------------------- Darstellung */
function darstellungZeichnen(ziel) {
  const p = PU.einstZustand.daten.person;

  ziel.appendChild(PU.el('h3', '', 'Darstellung'));
  ziel.appendChild(PU.el('p', 'hinweis',
    'Diese Einstellungen gelten nur für dich und ändern nie eine Punktzahl.'));

  zeileWahl(ziel, 'Thema',
    'Automatisch folgt der Einstellung deines Rechners. Der Knopf oben in der Kopfzeile schaltet zwischen hell und dunkel um.',
    ['auto', 'hell', 'dunkel'], p.thema,
    w => personSetzen('thema', w),
    { auto: 'Automatisch', hell: '☀ Hell', dunkel: '☾ Dunkel' });

  zeileWahl(ziel, 'Schriftgrösse',
    'Wirkt auf die ganze Academy, nicht nur auf den Lehrtext.',
    ['klein', 'normal', 'gross', 'riesig'], p.schriftgroesse,
    w => personSetzen('schriftgroesse', w),
    { klein: 'Klein', normal: 'Normal', gross: 'Gross', riesig: 'Sehr gross' });

  zeileWahl(ziel, 'Schrift im Lehrtext',
    'Serifen lesen sich in langen Texten für viele ruhiger, serifenlos wirkt technischer.',
    ['serif', 'sans'], p.textschrift,
    w => personSetzen('textschrift', w),
    { serif: 'Mit Serifen', sans: 'Ohne Serifen' });

  zeileWahl(ziel, 'Kontrast',
    'Erhöht die Textfarben und verstärkt die Ränder. Richtig-falsch steht in der Academy immer auch als Wort da, nie nur als Farbe.',
    ['normal', 'hoch'], p.kontrast,
    w => personSetzen('kontrast', w),
    { normal: 'Normal', hoch: 'Erhöht' });

  zeileWahl(ziel, 'Bewegung',
    'Schaltet Übergänge und Einblendungen ab. Wer das braucht, weiss es.',
    ['normal', 'wenig'], p.bewegung,
    w => personSetzen('bewegung', w),
    { normal: 'Normal', wenig: 'Sparsam' });

  zeileWahl(ziel, 'Breite der Seite',
    'Schmal liest sich ruhiger, breit zeigt mehr von der Medienspalte.',
    ['schmal', 'normal', 'breit'], p.breite,
    w => personSetzen('breite', w),
    { schmal: 'Schmal', normal: 'Normal', breit: 'Breit' });
}

/* ---------------------------------------------------------------- Lernen */
function lernenZeichnen(ziel) {
  const p = PU.einstZustand.daten.person;

  ziel.appendChild(PU.el('h3', '', 'Lernen'));

  zeileWahl(ziel, 'Medienspalte',
    'Video und Hörfolge rechts neben dem Stoff. Aus, wenn du lieber nur liest.',
    ['ja', 'nein'], p.medienspalte, w => personSetzen('medienspalte', w), JA_NEIN);

  zeileWahl(ziel, 'Vor einem Hinweis nachfragen',
    'Hinweise kosten Punkte. Die Rückfrage verhindert den versehentlichen Klick.',
    ['ja', 'nein'], p.hinweis_fragen, w => personSetzen('hinweis_fragen', w), JA_NEIN);

  zeileWahl(ziel, 'Zeit anzeigen',
    'Zeigt beim Lösen die laufende Zeit. Sie zählt ohnehin — für den Tempobonus. Manche denken damit ruhiger, andere hetzen.',
    ['ja', 'nein'], p.zeit_anzeigen, w => personSetzen('zeit_anzeigen', w), JA_NEIN);

  zeileWahl(ziel, 'Athenas Anmerkung automatisch holen',
    'Bei Freitextaufgaben schreibt Athena nach der Bewertung, was beim nächsten Mal besser geht. Die Punkte sind da längst gerechnet.',
    ['ja', 'nein'], p.athena_auto, w => personSetzen('athena_auto', w), JA_NEIN);

  zeileZahl(ziel, 'Tagesziel',
    'Punkte, die du dir für heute vornimmst. Erscheint als Balken im Fortschritt. 0 schaltet das Ziel ab.',
    p.tagesziel, 0, 2000, w => personSetzen('tagesziel', w), 'Punkte');
}

/* ---------------------------------------------------------------- Lob */
function lobZeichnen(ziel) {
  const p = PU.einstZustand.daten.person;

  ziel.appendChild(PU.el('h3', '', 'Lob & Vertiefung'));

  zeileWahl(ziel, 'Lob-Fenster nach einer richtigen Antwort',
    'Ein Spruch, ein Feuer, deine Punkte. Die Sprüche stehen im Wissensspeicher unter 00_Fundament/motivation.md — ein Tutor kann sie ändern.',
    ['ja', 'nein'], p.lob_popup, w => personSetzen('lob_popup', w), JA_NEIN);

  zeileZahl(ziel, 'Fenster schliesst sich nach',
    'Sekunden. Bei 0 bleibt es stehen, bis du das × drückst.',
    p.lob_dauer, 0, 60, w => personSetzen('lob_dauer', w), 'Sekunden');

  zeileZahl(ziel, 'Länge der Vertiefung',
    'Wörter, die "Weitere Infos" höchstens erzeugt. Der Text erscheint rechts neben der Aufgabe; die Grenze wird auch dann eingehalten, wenn das Modell weiterschreiben will.',
    p.infos_woerter, 60, 400, w => personSetzen('infos_woerter', w), 'Wörter');

  if (!PU.tutorBereit) {
    ziel.appendChild(PU.el('p', 'merkzettel',
      'Zurzeit ist kein Tutor-Modell eingerichtet. Das Lob-Fenster erscheint trotzdem — ' +
      'es braucht kein Sprachmodell. "Weitere Infos" bleibt so lange aus.'));
  }
}

/* ---------------------------------------------------------------- Konto */
function kontoZeichnen(ziel) {
  const ich = PU.einstZustand.daten.ich;

  ziel.appendChild(PU.el('h3', '', 'Konto'));

  const tabelle = PU.el('div', 'tabellenrahmen');
  tabelle.innerHTML =
    '<table><tbody>' +
    '<tr><th>Kennung</th><td>' + PU.h(ich.kennung) + '</td></tr>' +
    (ich.gruppe ? '<tr><th>Gruppe</th><td>' + PU.h(ich.gruppe) + '</td></tr>' : '') +
    '</tbody></table>';
  ziel.appendChild(tabelle);
  ziel.appendChild(PU.el('p', 'hinweis',
    'Die Kennung lässt sich nicht ändern — an ihr hängen deine Versuche und Urkunden.'));

  // -------- Anzeigename
  const nameForm = document.createElement('form');
  nameForm.innerHTML =
    '<h4>Anzeigename</h4>' +
    '<label class="klein">So stehst du in der Klassenliste und auf der Urkunde' +
    '<input name="anzeigename" maxlength="60" required value="' + PU.h(ich.name) + '"></label>';
  const nameKnopf = PU.el('button', 'knopf still', 'Namen ändern');
  nameKnopf.type = 'submit';
  nameForm.appendChild(nameKnopf);
  nameForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const j = await PU.ruf('name_aendern', { anzeigename: nameForm.anzeigename.value });
      PU.wer.name = j.anzeigename;
      PU.einstZustand.daten.ich.name = j.anzeigename;
      PU.melden('Der Anzeigename ist jetzt <b>' + PU.h(j.anzeigename) + '</b>.', 'gut');
    } catch (err) { PU.melden(PU.h(err.message), 'schlecht'); }
  });
  ziel.appendChild(nameForm);

  // -------- Kennwort
  const kwForm = document.createElement('form');
  kwForm.style.marginTop = '1.6rem';
  kwForm.innerHTML =
    '<h4>Kennwort</h4>' +
    '<label class="klein">Neues Kennwort, mindestens 8 Zeichen' +
    '<input name="neu" type="password" minlength="8" required autocomplete="new-password"></label>' +
    '<label class="klein">Zur Sicherheit noch einmal' +
    '<input name="neu2" type="password" minlength="8" required autocomplete="new-password"></label>';
  const kwKnopf = PU.el('button', 'knopf still', 'Kennwort ändern');
  kwKnopf.type = 'submit';
  kwForm.appendChild(kwKnopf);
  kwForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (kwForm.neu.value !== kwForm.neu2.value) {
      PU.melden('Die beiden Kennwörter sind nicht gleich.', 'schlecht');
      return;
    }
    try {
      await PU.ruf('kennwort_aendern', { neu: kwForm.neu.value });
      kwForm.reset();
      PU.melden('Das Kennwort ist geändert.', 'gut');
    } catch (err) { PU.melden(PU.h(err.message), 'schlecht'); }
  });
  ziel.appendChild(kwForm);
}

/* ---------------------------------------------------------------- Über */
/**
 * „Sprache" — wie man die Academy in seiner Muttersprache liest.
 *
 * **Warum diese Seite nichts einstellt.** Es gibt hier keinen Schalter für
 * Sprachen, und das ist keine Lücke: Die Academy ist ein Programm im Browser,
 * und Browser übersetzen Seiten selbst — besser und in mehr Sprachen, als eine
 * einzelne Academy es je pflegen könnte. Eine eigene Sprachwahl hier hiesse,
 * jeden neuen Satz in dreissig Sprachen nachzuziehen; ein Satz, der dann fehlt,
 * bliebe deutsch stehen, und niemand wüsste warum.
 *
 * Die Seite erklärt deshalb den Weg, der wirklich funktioniert — zwei Klicks —
 * und sagt gleich dazu, wo er nicht hinreicht: Die Tutoren antworten in der
 * Sprache, in der man sie fragt, und Aufnahmen bleiben, wie sie gesprochen
 * wurden. Beides würde ein Übersetzer nicht anfassen, und wer das nicht weiss,
 * hält es für einen Fehler.
 */
function spracheZeichnen(ziel) {
  ziel.appendChild(PU.el('h3', '', 'Die Academy in deiner Sprache'));

  const was = PU.el('div', 'einst-zeile');
  was.innerHTML =
    '<div class="titel">Wie das geht</div><div></div>' +
    '<p class="warum">Die Academy läuft <b>im Browser</b> — wie eine Internetseite. ' +
    'Browser können Seiten selbst übersetzen, und zwar die ganze Seite auf einmal: ' +
    'Menüs, Lektionen, Aufgaben, Knöpfe. Du brauchst dafür hier nichts einzustellen, ' +
    'sondern <b>zwei Klicks im Browser</b>. Die Übersetzung bleibt danach an — auch ' +
    'beim nächsten Mal.</p>';
  ziel.appendChild(was);

  const wie = PU.el('div', 'einst-zeile');
  wie.innerHTML =
    '<div class="titel">Zwei Klicks</div><div></div>' +
    '<ol class="warum" style="margin:.2rem 0 0;padding-left:1.2rem;line-height:1.7">' +
      '<li><b>Rechte Maustaste</b> irgendwo auf die Seite → <b>„Übersetzen in …"</b>.</li>' +
      '<li>Deine Sprache wählen. Fertig.</li>' +
    '</ol>' +
    '<p class="warum">Steht deine Sprache nicht dabei: In dem kleinen Fenster auf ' +
    '<b>„Sprache ändern"</b> gehen — dort stehen alle. Am Handy findest du dasselbe ' +
    'im Menü des Browsers (die drei Punkte) unter <b>„Übersetzen"</b>.</p>';
  ziel.appendChild(wie);

  /* Chrome-Verwandtschaft empfohlen — und mit Begründung, nicht als Geschmack.
     Die Übersetzung steckt in der Motorfamilie: Chrome, Brave und Comet bauen
     alle auf Chromium und bringen sie mit. */
  const welcher = PU.el('div', 'einst-zeile');
  welcher.innerHTML =
    '<div class="titel">Welcher Browser</div><div></div>' +
    '<p class="warum">Am zuverlässigsten geht es mit einem Browser aus der ' +
    '<b>Chrome-Familie</b>: Die Übersetzung ist dort eingebaut und erfasst die ganze ' +
    'Seite, auch nachgeladene Teile wie eine Tutor-Antwort. Alle drei unten sind ' +
    'kostenlos und benutzen denselben Unterbau — sie können es also gleich gut.</p>';
  ziel.appendChild(welcher);

  const laden = PU.el('div', 'einst-zeile');
  laden.innerHTML = '<div class="titel">Herunterladen</div>';

  const gruppe = PU.el('div', 'einst-gruppe');
  [['Google Chrome ↗', 'https://www.google.com/chrome/'],
   ['Brave ↗',         'https://brave.com/download/'],
   ['Comet ↗',         'https://comet.perplexity.ai/']
  ].forEach(function (b) {
    const a = PU.el('a', 'einst-link', PU.h(b[0]));
    a.href = b[1];
    a.target = '_blank';
    // Ein neu geöffnetes Fenster darf nicht auf das alte zugreifen, und wohin
    // eine Academy zeigt, die auf 127.0.0.1 läuft, geht niemanden draussen an.
    a.rel = 'noopener noreferrer';
    gruppe.appendChild(a);
  });

  laden.appendChild(gruppe);
  laden.appendChild(PU.el('p', 'warum',
    'Öffnet sich jeweils in einem neuen Fenster. Nach dem Einrichten die Academy ' +
    'dort noch einmal aufrufen — dieselbe Adresse, dieselbe Anmeldung.'));
  ziel.appendChild(laden);

  /* Was die Übersetzung NICHT anfasst. Das gehört hierher und nicht ins
     Kleingedruckte: Wer es nicht weiss, hält es für einen Fehler und sucht
     einen Schalter, den es nicht gibt. */
  const grenzen = PU.el('div', 'einst-zeile');
  grenzen.innerHTML =
    '<div class="titel">Was deutsch bleibt</div><div></div>' +
    '<p class="warum"><b>Die Tutoren</b> antworten in der Sprache, in der du fragst. ' +
    'Schreib sie auf Türkisch an, und sie antworten auf Türkisch — der Übersetzer ' +
    'des Browsers wird dafür gar nicht gebraucht. Du kannst sie auch bitten, ab jetzt ' +
    'in deiner Sprache zu antworten.</p>' +
    '<p class="warum"><b>Aufnahmen</b> bleiben, wie sie gesprochen wurden. Ton lässt ' +
    'sich nicht übersetzen — die Texte daneben schon.</p>' +
    '<p class="warum"><b>Eigennamen</b> wie Prometheus oder Athena bleiben stehen. ' +
    'Das ist Absicht: Mit ihnen sprichst du die Tutoren an.</p>';
  ziel.appendChild(grenzen);

  /* ---------------- Die eigene Tutorstimme
     Steht hier und nicht mehr nur unter „Tutor-KI": Dort kam nur die
     Verwaltung hin, und wer hinkam, verstellte die Stimme für alle. Was
     hier gesetzt wird, gilt nur für dieses Konto. */
  const p = PU.einstZustand.daten.person || {};
  const st = PU.einstZustand.daten.stimme_stand || {};

  if (!st.an) {
    const aus = PU.el('div', 'einst-zeile');
    aus.innerHTML =
      '<div class="titel">Vorlesen</div><div></div>' +
      '<p class="warum">Die Sprachausgabe ist in dieser Academy <b>abgeschaltet</b>. ' +
      'Eine Stimme lässt sich deshalb einstellen, aber nicht hören — einschalten ' +
      'kann sie nur die Verwaltung, weil sie je Tonsekunde kostet.</p>';
    ziel.appendChild(aus);
  }

  tutorStimmen(ziel, {
    ueberschrift: 'Deine Stimme je Tutor',
    einleitung:
      'Jeder Tutor kann für <b>dich</b> anders klingen, ohne dass es jemanden ' +
      'sonst betrifft. Leer heisst: die Vorgabe der Academy. Die vier Regler ' +
      'darunter wirken beim Abspielen — sie kosten nichts und lassen sich am ' +
      'fertigen Ton ausprobieren.',
    wert:      k => p[k] || '',
    speichern: (k, w) => personSetzen(k, w),
    ersatz:    kennung => (st.vorgaben || {})[kennung] || 'Vorgabe der Academy',

    /* Anhören über `vorlesen` und nicht über den Probelauf: Der Probelauf
       verlangt `stimme.pruefen`, ein Verwaltungsrecht, und darf ein fremdes
       Modell mitgeben. Hier genügt `stimme.nutzen` — dasselbe Recht, das der
       Lautsprecher an jeder Tutorantwort braucht. Das Modell bleibt dabei das
       der Academy; nur die Stimme ist die eigene.

       Erst speichern, dann hören: `vorlesen` nimmt keinen Stimmnamen entgegen
       (sonst könnte man sich auf fremde Rechnung ein teureres Modell
       aussuchen), sondern schlägt die des Tutors nach. Also muss das, was im
       Feld steht, vorher stehen — sonst hört man die alte. */
    hoeren: async function (feld, knopf, a) {
      const bericht = berichtFeld(knopf);
      if (!st.an) {
        bericht.innerHTML = '<b style="color:var(--schlecht)">Die Sprachausgabe ist abgeschaltet.</b>';
        return;
      }
      knopf.disabled = true;
      bericht.textContent = 'Lasse ' + a.name + ' sprechen …';
      try {
        await personSetzen('stimme_' + a.kennung, feld.value.trim());
        const j = await PU.ruf('vorlesen', {
          text:   'Ich bin ' + a.name + '. So klinge ich, wenn ich dir etwas vorlese.',
          agent:  a.kennung,
          wofuer: 'Stimmprobe'
        });
        if (!j.ok) {
          bericht.innerHTML = '<b style="color:var(--schlecht)">Kein Ton:</b> ' + PU.h(j.fehler || '');
        } else {
          bericht.textContent = feld.value.trim()
            ? 'Gehört: ' + feld.value.trim()
            : 'Gehört: die Vorgabe der Academy.';
          // `tonKlang` stellt nur ein — abgespielt wird hier. Die Regler
          // sollen mit zu hören sein, sonst prüft man die halbe Einstellung.
          const ton = tonBauen(j.ton, j.mime);
          if (PU.tonKlang) PU.tonKlang(ton, j.klang);
          ton.play().catch(() => {});
        }
      } catch (e) {
        bericht.innerHTML = '<b style="color:var(--schlecht)">' + PU.h(e.message) + '</b>';
      }
      knopf.disabled = false;
    }
  });
}

/** Aus Base64 ein abspielbares Tonstück. Der gemeinsame Teil von zwei Wegen. */
function tonBauen(base64, mime) {
  const roh = atob(base64);
  const bytes = new Uint8Array(roh.length);
  for (let i = 0; i < roh.length; i++) bytes[i] = roh.charCodeAt(i);
  const adresse = URL.createObjectURL(new Blob([bytes], { type: mime }));
  const ton = new Audio(adresse);
  ton.addEventListener('ended', () => URL.revokeObjectURL(adresse));
  return ton;
}

/**
 * „Über PROMPTHEUS" — die Stufen-Seite, eingebaut statt verlinkt.
 *
 * Der Reiter zeigt `stufen/index.html` in einem Rahmen, der die ganze Fläche
 * einnimmt. Das ist kein Ausweichen vor der Arbeit, es ist die einzige
 * Bauweise, in der die Seite hier drin überhaupt funktioniert: Sie ist zwölf
 * Bildschirmhöhen lang und rechnet mit `window.scrollY` und `innerHeight`.
 * Ein <iframe> bringt beides mit — eigenes Fenster, eigene Höhe, eigener
 * Rollbalken. Derselbe Inhalt in dieses Dokument kopiert würde am Rollwert
 * der Academy hängen, und die wandernde Flamme liefe nach dem Schliessen der
 * Einstellungen quer über die Lektion dahinter.
 *
 * Die Sachangaben (Was hier nicht passiert, Tastatur, secondbrain/) standen
 * früher hier als Text. Sie stehen jetzt als Nachwort in der Seite selbst —
 * zwei Orte für eine Auskunft heisst, einer von beiden veraltet unbemerkt.
 *
 * `loading="lazy"` fehlt mit Absicht: Der Rahmen wird erst erzeugt, wenn
 * jemand den Reiter öffnet. Später zu laden hiesse, ihn gar nicht zu laden.
 */
function ueberZeichnen(ziel) {
  ziel.classList.add('inhalt-rahmen');

  const leiste = PU.el('div', 'rahmen-leiste');
  leiste.innerHTML =
    '<span class="titel">Die sieben Stufen — vom Entdecker bis zum Erbe</span>' +
    '<a class="einst-wahl" href="stufen/" target="_blank" rel="noopener">' +
    'In eigenem Tab öffnen ↗</a>';

  const rahmen = document.createElement('iframe');
  rahmen.className = 'inhalt-scheibe';
  rahmen.src   = 'stufen/';
  rahmen.title = 'Über PROMPTHEUS — Die sieben Stufen';

  ziel.appendChild(leiste);
  ziel.appendChild(rahmen);
}

/* ---------------------------------------------------------------- Tutor-KI */
function kiZeichnen(ziel) {
  const g = PU.einstZustand.daten.global;
  const s = PU.einstZustand.daten.tutor_stand;

  ziel.appendChild(PU.el('h3', '', 'Tutor-KI'));

  const stand = PU.el('p', 'merkzettel' + (s.bereit ? ' gut' : ''));
  stand.innerHTML = s.bereit
    ? '<b>Bereit.</b> Die Tutoren antworten über <b>' +
      (s.weg === 'openrouter' ? 'OpenRouter' : 'die Claude-CLI') + '</b>, Modell <code>' +
      PU.h(s.modell) + '</code>.'
    : '<b>Kein Modell eingerichtet.</b> Die Tutoren bleiben stumm. Kurse, Aufgaben, ' +
      'Prüfungen und Urkunden laufen davon unberührt weiter — sie brauchen kein Sprachmodell.';
  ziel.appendChild(stand);

  zeileWahl(ziel, 'Weg zum Modell',
    'Automatisch nimmt OpenRouter, sobald ein Schlüssel hinterlegt ist, sonst die Claude-CLI.',
    ['auto', 'cli', 'openrouter'], g.tutor_weg,
    w => { regelSetzen('tutor_weg', w).then(() => PU.einstellungenOeffnen('ki')); },
    { auto: 'Automatisch', cli: 'Claude-CLI', openrouter: 'OpenRouter' });

  // ---------------- OpenRouter
  ziel.appendChild(PU.el('h4', '', 'OpenRouter'));

  const orZeile = PU.el('div', 'einst-zeile');
  orZeile.innerHTML =
    '<div class="titel">API-Schlüssel <span class="klein">(' +
    (s.or_key.gesetzt ? '<b style="color:var(--gut)">gesetzt</b>, ' + s.or_key.zeichen + ' Zeichen'
                      : '<b style="color:var(--schrift-3)">nicht gesetzt</b>') +
    ')</span></div>';

  const orGruppe = PU.el('div', 'einst-gruppe');
  const orFeld = document.createElement('input');
  orFeld.type = 'password';
  orFeld.placeholder = s.or_key.gesetzt ? 'Neuen Schlüssel eintragen' : 'sk-or-…';
  orFeld.autocomplete = 'off';
  orFeld.style.minWidth = '16rem';
  const orSpeichern = PU.el('button', 'knopf', 'Speichern');
  orSpeichern.type = 'button';
  const orLoeschen = PU.el('button', 'knopf still', 'Löschen');
  orLoeschen.type = 'button';
  orGruppe.appendChild(orFeld);
  orGruppe.appendChild(orSpeichern);
  if (s.or_key.gesetzt) orGruppe.appendChild(orLoeschen);
  orZeile.appendChild(orGruppe);
  orZeile.appendChild(PU.el('p', 'warum',
    'Der Schlüssel wird in die .env geschrieben und nie wieder angezeigt — auch nicht dir. ' +
    'Angezeigt wird nur, ob einer da ist. Wer ihn verliert, trägt einen neuen ein.'));
  ziel.appendChild(orZeile);

  orSpeichern.addEventListener('click', () => geheimnisSetzen('PU_OPENROUTER_API_KEY', orFeld.value, orFeld));
  orLoeschen.addEventListener('click', () => {
    if (confirm('Den OpenRouter-Schlüssel löschen? Die Tutoren fallen dann auf die Claude-CLI zurück oder verstummen.')) {
      geheimnisSetzen('PU_OPENROUTER_API_KEY', '', orFeld);
    }
  });

  /* Die Kennung, nicht die Überschrift.
     Auf der Stöberseite von OpenRouter steht als Titel ein Anzeigename
     („GPT-Audio Mini"), im Feld gebraucht wird die Kennung
     („openai/gpt-audio-mini"). Die beiden werden verwechselt, und das Ergebnis
     ist ein stummer Tutor mit einer Meldung, die nach Netzproblem aussieht.
     Deshalb zeigt die Liste unten die KENNUNG und den Namen nur daneben. */
  modellWaehler(ziel, {
    titel: 'OpenRouter-Modell',
    warum: 'Vollständiger Name wie bei OpenRouter. Günstig und schnell: ' +
           'deepseek/deepseek-v4-flash-0731. Kostenlos: stealth/ox-alpha. ' +
           'Leer = Vorgabe aus der .env. Der Katalog unten holt die Liste herein — ' +
           'testen kannst du ein Modell, bevor du es übernimmst.',
    jetzt: g.or_modell,
    platzhalter: 'deepseek/deepseek-v4-flash-0731',
    beiWahl: w => regelSetzen('or_modell', w),
    beiTest: (id, knopf) => modellTesten(id, knopf)
  });

  coderRegelnZeichnen(ziel, g);

  // ---------------- Sprachausgabe
  //
  // Sie steht hier und nicht bei der Spracheingabe, obwohl beide „Sprache"
  // heissen. Der Grund ist, wo sie laufen: Die Eingabe wird auf diesem Rechner
  // erkannt, die Ausgabe geht über OpenRouter hinaus. Sie gehört damit zum
  // Modell-Teil, nicht zum Geräte-Teil — und wer hier etwas einschaltet, soll
  // sehen, dass es dieselbe Rechnung trifft wie die Tutoren.
  ziel.appendChild(PU.el('h4', '', 'Sprachausgabe — Texte vorlesen'));

  const stimmHinweis = PU.el('div', 'einst-zeile');
  stimmHinweis.innerHTML =
    '<div class="titel">Was das ist</div><div></div>' +
    '<p class="warum">Ein Lautsprecher-Knopf an jeder Tutorantwort. Im Unterschied ' +
    'zum Diktieren läuft das <b>nicht</b> auf diesem Rechner: Der Text geht an ' +
    'OpenRouter und kommt als Ton zurück. Er kostet je Tonsekunde und wird wie ' +
    'jede Tutorfrage gebucht. Derselbe Text wird nur einmal erzeugt — beim ' +
    'zweiten Klick kommt er aus dem Zwischenspeicher und kostet nichts.</p>';
  ziel.appendChild(stimmHinweis);

  zeileWahl(ziel, 'Vorlesen', 'Ab Werk aus, weil es Geld kostet und den Text aus dem Haus gibt.',
            ['an', 'aus'], g.stimme_an, w => regelSetzen('stimme_an', w));

  /* Der Filter „nur mit Tonausgabe" steht hier auf `ton`, und das ist die
     eigentliche Hilfe dieser Seite: Von den mehreren hundert Modellen im
     Katalog geben eine Handvoll Ton aus. Wer einen gewöhnlichen Modellnamen
     einträgt, bekommt eine Textantwort statt Ton — und sucht den Fehler dann
     bei der Stimme. Mit dem Filter kommt der Fall gar nicht erst vor. */
  const stimmStand = {
    modell: g.stimme_modell || 'openai/gpt-audio-mini',
    stimme: g.stimme_name   || 'alloy',
    format: g.stimme_format || 'pcm16',
    familien: s.stimm_familien || {}
  };

  modellWaehler(ziel, {
    titel: 'Stimm-Modell',
    warum: 'Es funktionieren nur Modelle, die Ton AUSGEBEN — das sind wenige. ' +
           'Der Katalog unten ist deshalb auf „nur mit Tonausgabe" vorgestellt. ' +
           'Kennungen, die im öffentlichen Katalog fehlen — etwa ' +
           'x-ai/grok-voice-tts-1.0 — findet er trotzdem, wenn du sie ganz eintippst. ' +
           'Leer = Vorgabe (openai/gpt-audio-mini).',
    jetzt: g.stimme_modell,
    platzhalter: 'openai/gpt-audio-mini',
    nur: 'ton',
    beiWahl: w => {
      // Der Modellwechsel kann die eingestellten Stimmen entwerten — die Namen
      // gehören zum Modell. Gesagt wird das beim Anhören, nicht beim Setzen:
      // Eine Warnung an dieser Stelle wüsste noch nicht, ob sie recht hat.
      stimmStand.modell = w || 'openai/gpt-audio-mini';
      return regelSetzen('stimme_modell', w);
    },
    beiTest: (id, knopf) => stimmeTesten(id, stimmStand, knopf)
  });

  /* Frei eintragbar, nicht ausgewählt — und das ist eine Korrektur.
     „alloy", „nova" und die anderen sind die Stimmnamen von OpenAI. Ein
     anderer Anbieter hat eigene; mit einer geschlossenen Liste wäre er hier
     unbenutzbar gewesen, ohne dass die Meldung das gesagt hätte. */
  zeileText(ziel, 'Stimme',
    'Die Namen gehören zum Modell, nicht zur Academy: alloy und nova sind von ' +
    'OpenAI, eve und gork von Grok Voice. Deshalb frei eintragbar — und eine ' +
    'Stimme des einen Modells klingt beim anderen nicht anders, sondern gar nicht. ' +
    'Leer = alloy. Ob es sie gibt, sagt der Probelauf.',
    g.stimme_name, 'alloy',
    w => { stimmStand.stimme = w || 'alloy'; return regelSetzen('stimme_name', w); },
    [], [['alloy', 'OpenAI · ruhig, neutral'], ['echo', 'OpenAI · getragen'],
         ['fable', 'OpenAI · erzählend'], ['onyx', 'OpenAI · tief'],
         ['nova', 'OpenAI · hell, freundlich'], ['shimmer', 'OpenAI · weich'],
         ['eve', 'Grok'], ['ara', 'Grok'], ['leo', 'Grok'],
         ['rex', 'Grok'], ['sal', 'Grok'], ['gork', 'Grok']]);

  /* Zwei Formate, und welches wirklich herauskommt, hängt am Weg: Weg 1 kann
     im Strom nur pcm16, Weg 2 nur mp3 und pcm. Vorher standen hier vier —
     opus und wav funktionieren auf keinem von beiden und sind geflogen. */
  zeileWahl(ziel, 'Tonformat',
            'Über chat/completions kommt immer pcm16 zurück, egal was hier steht — ' +
            'mp3 wird dort abgewiesen. Über audio/speech gilt deine Wahl. ' +
            'pcm16 bekommt hier einen WAV-Kopf und ist danach eine gewöhnliche Datei.',
            ['pcm16', 'mp3'], g.stimme_format,
            w => { stimmStand.format = w; return regelSetzen('stimme_format', w); });

  /* **Der Schalter, den man fast nie braucht — und der erklärt, was passiert.**
     OpenRouter hat zwei getrennte Endpunkte für Sprachausgabe, und kein Modell
     kann beide. `auto` schlägt im Katalog nach und wechselt im Zweifel einmal;
     von Hand setzt man das nur, wenn ein Modell dort falsch gemeldet ist. */
  /* Die Academy-Vorgabe je Tutor. Derselbe Baustein steht im Reiter
     „Sprache & Stimme" noch einmal — dort aber persönlich. Was hier gesetzt
     wird, gilt für alle, die nichts Eigenes eingestellt haben. */
  tutorStimmen(ziel, {
    ueberschrift: 'Stimme je Tutor — Vorgabe der Academy',
    einleitung:
      'Eine Stimme für alle vier macht aus Athena einen Mann. Was hier steht, ' +
      'gilt für <b>jeden</b>, der sich nichts Eigenes eingestellt hat; ' +
      'einstellen kann sich das jeder selbst unter <b>Sprache &amp; Stimme</b>. ' +
      'Leer heisst: die allgemeine Stimme von oben.',
    wert:      k => g[k] || '',
    speichern: (k, w) => regelSetzen(k, w),
    ersatz:    stimmStand.stimme || 'alloy',
    hoeren:    (feld, knopf) => stimmeTesten(
                 stimmStand.modell,
                 { stimme: feld.value.trim() || stimmStand.stimme, format: stimmStand.format },
                 knopf)
  });

  ziel.appendChild(PU.el('h4', '', 'Aufbewahren, Weg und Format'));

  /* Nicht zu verwechseln mit dem Zwischenspeicher — der Unterschied ist der
     Zweck, nicht der Ort. Der Zwischenspeicher spart Geld und ist nach 30 Tagen
     weg; seine Dateinamen sind Prüfsummen. Das Archiv ist zum Nachhören da. */
  zeileWahl(ziel, 'Aufnahmen aufbewahren',
            'Jede erzeugte Sprachausgabe wird zusätzlich unter data/voice ' +
            'abgelegt — ein Ordner je Konto, lesbar benannt, mit dem Text als ' +
            '.txt daneben. Zum Nachhören und Weitergeben. Eine Minute Ton sind ' +
            'rund 3 MB; wer den Platz braucht, schaltet es ab. Der ' +
            'Zwischenspeicher, der doppelte Kosten verhindert, bleibt davon unberührt.',
            ['an', 'aus'], g.stimme_archiv, w => regelSetzen('stimme_archiv', w));

  zeileWahl(ziel, 'Weg zum Ton',
            'Automatisch schlägt im Katalog nach: Modelle, die Ton NEBEN Text ' +
            'ausgeben (openai/gpt-audio-mini), gehen über chat/completions; reine ' +
            'Vorlesemodelle (x-ai/grok-voice-tts-1.0) über audio/speech. Kein Modell ' +
            'kann beide. Geht der erste Versuch schief, wird einmal gewechselt — ' +
            'das kostet keine Token. Von Hand setzen musst du das nur, wenn ein ' +
            'Modell im Katalog falsch gemeldet ist.',
            ['auto', 'chat', 'tts'], g.stimme_weg,
            w => regelSetzen('stimme_weg', w),
            { auto: 'Automatisch', chat: 'chat/completions', tts: 'audio/speech' });

  stimmProbe(ziel);

  // ---------------- Claude-CLI
  ziel.appendChild(PU.el('h4', '', 'Claude-CLI'));

  const cliZeile = PU.el('div', 'einst-zeile');
  cliZeile.innerHTML =
    '<div class="titel">Befehl <span class="klein">(' +
    (s.cli_gefunden ? '<b style="color:var(--gut)">gefunden</b>: <code>' + PU.h(s.cli_name) + '</code>'
                    : '<b style="color:var(--schrift-3)">nicht gefunden</b>') + ')</span></div>' +
    '<div></div>' +
    '<p class="warum">Wird im PATH gesucht. Läuft über die Anmeldung des Rechners und rechnet ' +
    'nicht über die API ab — <code>ANTHROPIC_API_KEY</code> wird bewusst nicht gelesen.</p>';
  ziel.appendChild(cliZeile);

  const tokZeile = PU.el('div', 'einst-zeile');
  tokZeile.innerHTML =
    '<div class="titel">OAuth-Token <span class="klein">(' +
    (s.token.gesetzt ? '<b style="color:var(--gut)">gesetzt</b>' : 'nicht gesetzt') +
    ')</span></div>';
  const tokGruppe = PU.el('div', 'einst-gruppe');
  const tokFeld = document.createElement('input');
  tokFeld.type = 'password';
  tokFeld.autocomplete = 'off';
  tokFeld.placeholder = 'nur nötig, wenn die CLI nicht angemeldet ist';
  tokFeld.style.minWidth = '16rem';
  const tokKnopf = PU.el('button', 'knopf still', 'Speichern');
  tokKnopf.type = 'button';
  tokKnopf.addEventListener('click', () => geheimnisSetzen('CLAUDE_CODE_OAUTH_TOKEN', tokFeld.value, tokFeld));
  tokGruppe.appendChild(tokFeld);
  tokGruppe.appendChild(tokKnopf);
  tokZeile.appendChild(tokGruppe);
  ziel.appendChild(tokZeile);

  zeileText(ziel, 'CLI-Modell',
    'Name wie in der Claude-CLI, z. B. claude-sonnet-5. Leer = Wert aus der .env.',
    g.tutor_modell, 'claude-sonnet-5', w => regelSetzen('tutor_modell', w));

  // ---------------- gemeinsam
  ziel.appendChild(PU.el('h4', '', 'Gemeinsam'));

  zeileZahl(ziel, 'Zeitgrenze',
    'Nach dieser Zeit gilt eine Antwort als ausgeblieben. Zu knapp gesetzt, brechen lange Erklärungen ab.',
    g.tutor_zeitgrenze, 15, 300, w => regelSetzen('tutor_zeitgrenze', w), 'Sekunden');

  zeileWahl(ziel, 'Tutoren insgesamt', 'Aus heisst: die Academy läuft rein deterministisch weiter.',
    ['an', 'aus'], g.tutor_an, w => regelSetzen('tutor_an', w), AN_AUS);

  [['agent_prometheus', 'Prometheus 🔥', 'Haupttutor — erklärt und ordnet ein.'],
   ['agent_athena', 'Athena 🦉', 'Prüferin — sagt, was an einer Antwort fehlt.'],
   ['agent_hermes', 'Hermes 📚', 'Bibliothekar — findet Stoff und Quellen.'],
   ['agent_hephaistos', 'Hephaistos ⚒️', 'Werkzeugmeister — Code, APIs, Kryptografie.']
  ].forEach(a => {
    zeileWahl(ziel, a[1], a[2], ['an', 'aus'], g[a[0]], w => regelSetzen(a[0], w), AN_AUS);
  });

  zeileWahl(ziel, 'Athenas Anmerkung bei Freitext',
    'Erscheint unter der Bewertung. Sie nennt nie eine Punktzahl und ändert keine.',
    ['an', 'aus'], g.athena_anmerkung, w => regelSetzen('athena_anmerkung', w), AN_AUS);

  zeileWahl(ziel, '"Weitere Infos" nach richtigen Antworten',
    'Prometheus vertieft das Thema in begrenzter Länge. Jede Vertiefung ist ein Modellaufruf und kostet.',
    ['an', 'aus'], g.weitere_infos, w => regelSetzen('weitere_infos', w), AN_AUS);

  // ---------------- Probe
  const probe = PU.el('div');
  probe.style.marginTop = '1.6rem';
  const probeKnopf = PU.el('button', 'knopf', 'Verbindung prüfen');
  probeKnopf.type = 'button';
  const probeErg = PU.el('div', 'klein');
  probeErg.style.marginTop = '.6rem';
  probeKnopf.addEventListener('click', async () => {
    probeKnopf.disabled = true;
    probeErg.innerHTML = 'Frage das Modell …';
    try {
      const j = await PU.ruf('tutor_probe');
      probeErg.innerHTML = j.ok
        ? '<span style="color:var(--gut)">✓ Antwort nach ' + j.dauer + ' s: ' + PU.h(j.text) + '</span>'
        : '<span style="color:var(--schlecht)">✕ ' + PU.h(j.fehler) + '</span>';
    } catch (e) {
      probeErg.innerHTML = '<span style="color:var(--schlecht)">✕ ' + PU.h(e.message) + '</span>';
    } finally {
      probeKnopf.disabled = false;
    }
  });
  probe.appendChild(probeKnopf);
  probe.appendChild(probeErg);
  ziel.appendChild(probe);
}

/**
 * Zeile mit Textfeld — für Modellnamen. Speichert beim Verlassen.
 *
 * @param {Array} [links] Nachschlagewege als [Beschriftung, Adresse]. Sie
 *        stehen NEBEN dem Feld und nicht in der Begründung darunter: Wer hier
 *        tippt, sucht einen Namen, den niemand auswendig kennt — dann gehört
 *        der Weg dorthin an die Stelle, an der die Hand schon ist.
 */
/* Der Probelauf.
 *
 * Er sagt, was WIRKLICH passiert ist, nicht ob es „funktioniert". Der häufigste
 * Fehler ist ein Modell, das den Satz beantwortet statt ihn vorzulesen — und
 * das sieht man nur am Transkript. Deshalb steht es hier neben dem Satz, den
 * das Modell vorlesen sollte, und die Oberfläche sagt, ob beides zusammenpasst.
 */
/**
 * Die vier Regler unter einem Tutor.
 *
 * Eine flache Zeile, vier nebeneinander, über jedem ein Wort — mehr passt über
 * einen kleinen Regler nicht, und mehr braucht es auch nicht. Was jeder tut,
 * steht im Wort selbst: Tempo, Tiefe, Klarheit, Lautstärke.
 *
 * Gespeichert wird beim Loslassen, nicht bei jeder Bewegung: Ein Regler feuert
 * beim Ziehen dutzendfach, und jedes Mal zu speichern wären dutzende Schreib-
 * vorgänge für eine Entscheidung.
 */
PU.KLANG_REGLER = [
  { name: 'tempo',    wort: 'Tempo',      min: 70,  max: 130, vorgabe: 100, einheit: '%'  },
  { name: 'tiefe',    wort: 'Tiefe',      min: -12, max: 12,  vorgabe: 0,   einheit: 'dB' },
  { name: 'klarheit', wort: 'Klarheit',   min: -12, max: 12,  vorgabe: 0,   einheit: 'dB' },
  { name: 'laut',     wort: 'Lautstärke', min: 30,  max: 130, vorgabe: 100, einheit: '%'  }
];

/** Aus „100,0,0,100" vier Zahlen — fehlt etwas, gilt die Vorgabe. */
PU.klangLesen = function (roh) {
  const teile = String(roh || '').split(',');
  const aus = {};
  PU.KLANG_REGLER.forEach((r, i) => {
    const w = parseInt(teile[i], 10);
    aus[r.name] = isNaN(w) ? r.vorgabe : Math.max(r.min, Math.min(r.max, w));
  });
  return aus;
};

/**
 * Eine Stimme je Tutor — der Baustein, zweimal benutzt.
 *
 * Er stand vorher fest im Reiter „Tutor-KI" und schrieb in die Academy-Regel.
 * Damit konnte ihn nur die Verwaltung erreichen, und wer ihn erreichte,
 * verstellte die Stimme für alle. Beides war falsch: **Wie eine Stimme
 * klingt, entscheidet das Ohr davor** — der eine kommt bei vollem Tempo nicht
 * mit, der andere schläft bei 85 % ein. Das gehört jedem selbst, so wie die
 * Schriftgrösse.
 *
 * Also einmal gebaut und zweimal eingesetzt, mit ausgetauschtem Schreiber:
 *
 *   Tutor-KI            → `regelSetzen`  → die Vorgabe der Academy
 *   Sprache & Stimme    → `personSetzen` → die eigene Abweichung
 *
 * Gelesen wird auf dem Server persönlich zuerst, Regel danach; siehe
 * `pu_stimme_fuer()` in srv/stimme.php.
 */
function tutorStimmen(ziel, o) {
  ziel.appendChild(PU.el('h4', '', o.ueberschrift));

  const hinweis = PU.el('div', 'einst-zeile');
  hinweis.innerHTML =
    '<div class="titel">Wie das geht</div><div></div>' +
    '<p class="warum">' + o.einleitung +
    ' Die Namen gehören zum Modell: bei Grok Voice ' +
    '<code>eve, ara, leo, rex, sal, gork</code>, bei OpenAI ' +
    '<code>alloy, echo, fable, onyx, nova, shimmer</code>.</p>';
  ziel.appendChild(hinweis);

  (PU.AGENTEN || []).forEach(function (a) {
    const schluessel = 'stimme_' + a.kennung;

    const zeile = PU.el('div', 'einst-zeile');
    zeile.innerHTML = '<div class="titel">' + PU.h(a.symbol + ' ' + a.name) + '</div>';

    const gruppe = PU.el('div', 'einst-gruppe');
    const feld = document.createElement('input');
    feld.type = 'text';
    feld.value = o.wert(schluessel);
    // Der Platzhalter sagt, was ohne Eintrag gilt — und das ist je Tutor
    // verschieden, sobald die Academy ihm eine eigene Stimme gegeben hat.
    feld.placeholder = 'leer = ' +
      (typeof o.ersatz === 'function' ? o.ersatz(a.kennung) : o.ersatz);
    feld.setAttribute('aria-label', 'Stimme für ' + a.name);
    feld.style.minWidth = '10rem';
    feld.setAttribute('list', 'stimmen-liste');
    feld.addEventListener('change', () => o.speichern(schluessel, feld.value.trim()));

    gruppe.appendChild(feld);

    // Anhören nur, wenn ein Weg dafür da ist. Der Probelauf der Verwaltung
    // verlangt ein eigenes Recht; für gewöhnliche Nutzer reicht der Vorleser,
    // der ohnehin an jeder Tutorantwort hängt.
    if (o.hoeren) {
      const knopf = PU.el('button', 'knopf still', '🔊 Anhören');
      knopf.type = 'button';
      knopf.addEventListener('click', () => o.hoeren(feld, knopf, a));
      gruppe.appendChild(knopf);
    }

    zeile.appendChild(gruppe);
    zeile.appendChild(PU.el('p', 'warum', a.rolle));

    /* **Vier Regler, und sie wirken beim Abspielen — nicht beim Erzeugen.**
       Das ist gemessen: OpenRouter nimmt ein `speed`-Feld an und gibt 200
       zurück, die Aufnahme ist danach exakt gleich lang. Ein Faktor 16 im Wert
       (0.25 gegen 4.0) ergab 2,55 gegen 2,63 Sekunden — weniger Unterschied,
       als zwei identische Aufrufe schwanken. Der Wert wird geschluckt.

       Im Browser wirken sie sofort, kosten nichts und lassen sich am fertigen
       Ton ausprobieren, ohne ihn neu zu bezahlen. Zum Justieren ist das sogar
       der bessere Ort: Man zieht und hört, statt zu zahlen und zu hoffen. */
    zeile.appendChild(klangRegler(a.kennung, o.wert('klang_' + a.kennung),
                                  w => o.speichern('klang_' + a.kennung, w)));

    ziel.appendChild(zeile);
  });

  // Eine Vorschlagsliste für alle vier Felder, statt vier gleiche im Baum.
  if (!document.getElementById('stimmen-liste')) {
    const dl = document.createElement('datalist');
    dl.id = 'stimmen-liste';
    ['eve', 'ara', 'leo', 'rex', 'sal', 'gork',
     'alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'].forEach(function (v) {
      const opt = document.createElement('option');
      opt.value = v;
      dl.appendChild(opt);
    });
    document.body.appendChild(dl);
  }
}

function klangRegler(kennung, roh, speichern) {
  // Ohne dritten Wert bleibt es beim alten Verhalten: schreibt in die
  // Academy-Regel. Der Sprache-Reiter reicht stattdessen einen Schreiber
  // herein, der in die persönliche Einstellung schreibt.
  if (typeof speichern !== 'function') {
    speichern = (wert) => regelSetzen('klang_' + kennung, wert);
  }
  const werte = PU.klangLesen(roh);
  const kasten = PU.el('div', 'klang-reihe');

  const felder = {};

  PU.KLANG_REGLER.forEach(r => {
    const spalte = PU.el('div', 'klang-regler');

    const kopf = PU.el('label', 'klang-wort', r.wort);
    const wert = PU.el('span', 'klang-wert', String(werte[r.name]) + r.einheit);

    const schieber = document.createElement('input');
    schieber.type = 'range';
    schieber.min  = String(r.min);
    schieber.max  = String(r.max);
    schieber.step = '1';
    schieber.value = String(werte[r.name]);
    schieber.setAttribute('aria-label', r.wort + ' für ' + kennung);
    kopf.appendChild(schieber);

    // Beim Ziehen nur die Zahl daneben, gespeichert wird beim Loslassen.
    schieber.addEventListener('input', () => {
      wert.textContent = schieber.value + r.einheit;
    });
    schieber.addEventListener('change', () => {
      const zeile = PU.KLANG_REGLER.map(x => felder[x.name].value).join(',');
      speichern(zeile);
    });

    felder[r.name] = schieber;

    spalte.appendChild(kopf);
    spalte.appendChild(wert);
    kasten.appendChild(spalte);
  });

  // Zurück auf Werk — sonst muss man vier Regler einzeln zurechtrücken und
  // trifft die Mitte nie genau.
  const zurueck = PU.el('button', 'klang-werk', '↺');
  zurueck.type = 'button';
  zurueck.title = 'Zurück auf Werkseinstellung';
  zurueck.setAttribute('aria-label', 'Regler zurücksetzen');
  zurueck.addEventListener('click', () => {
    PU.KLANG_REGLER.forEach(r => {
      felder[r.name].value = String(r.vorgabe);
      felder[r.name].dispatchEvent(new Event('input'));
    });
    speichern('');
  });
  kasten.appendChild(zurueck);

  return kasten;
}

/**
 * Wohin ein Probelauf berichtet.
 *
 * Nicht in eine Meldung, die nach acht Sekunden verschwindet: Ein Bericht mit
 * Modell, Dauer und Transkript will gelesen und verglichen werden, notfalls
 * zweimal. Er bleibt deshalb an der Zeile stehen, zu der er gehört.
 */
function berichtFeld(knopf) {
  const zeile = knopf.closest('.einst-zeile') || knopf.parentNode;
  let p = zeile.querySelector('.probe-bericht');
  if (!p) {
    p = PU.el('p', 'warum probe-bericht');
    zeile.appendChild(p);
  }
  return p;
}

/** Prüft ein Textmodell — ohne es zu übernehmen. */
async function modellTesten(id, knopf) {
  const p = berichtFeld(knopf);
  if (!id) { p.innerHTML = '<b style="color:var(--schlecht)">Kein Modell eingetragen.</b>'; return; }

  p.textContent = 'Frage „' + id + '" …';
  knopf.disabled = true;
  let j;
  try { j = await PU.ruf('tutor_probe', { modell: id }); }
  catch (e) {
    p.innerHTML = '<b style="color:var(--schlecht)">' + PU.h(e.message) + '</b>';
    knopf.disabled = false; return;
  }
  knopf.disabled = false;

  p.innerHTML = j.ok
    ? '<b style="color:var(--gut)">Antwortet.</b> <code>' + PU.h(j.modell) + '</code> · '
      + j.dauer + ' s · „' + PU.h(j.text) + '"'
    : '<b style="color:var(--schlecht)">Keine Antwort:</b> ' + PU.h(j.fehler);
}

/**
 * Prüft ein Stimm-Modell — ohne es zu übernehmen — und spielt das Ergebnis ab.
 *
 * Der Bericht nennt das Transkript, und das ist der eigentliche Punkt: Der
 * häufigste Fehler ist ein Modell, das den Satz beantwortet statt ihn
 * vorzulesen. Am Ton allein hört man das erst, wenn er läuft; am Transkript
 * sieht man es sofort.
 */
async function stimmeTesten(id, stand, knopf) {
  const p = berichtFeld(knopf);
  if (!id) { p.innerHTML = '<b style="color:var(--schlecht)">Kein Modell eingetragen.</b>'; return; }

  p.textContent = 'Lasse „' + id + '" vorlesen …';
  knopf.disabled = true;
  let j;
  try {
    j = await PU.ruf('stimme_probe', { modell: id, stimme: stand.stimme, format: stand.format });
  } catch (e) {
    p.innerHTML = '<b style="color:var(--schlecht)">' + PU.h(e.message) + '</b>';
    knopf.disabled = false; return;
  }
  knopf.disabled = false;
  probeBerichten(j.probe, p);
}

/** Der gemeinsame Bericht für beide Wege zum Probelauf. */
function probeBerichten(p, ziel) {
  if (!p.ok) {
    ziel.innerHTML = '<b style="color:var(--schlecht)">Kein Ton:</b> ' + PU.h(p.fehler);
    return;
  }

  // Der Abgleich: Steht „Prometheus" im Transkript, wurde vorgelesen. Steht
  // etwas anderes da, hat das Modell geantwortet — und dann ist das Modell
  // falsch gewählt, nicht die Stimme.
  const warnung = p.passt ? ''
    : '<br><b style="color:var(--schlecht)">Achtung:</b> Das Transkript passt nicht '
    + 'zum Satz. Das Modell hat wahrscheinlich geantwortet statt vorgelesen.';

  // Welcher Weg es war, steht dabei — sonst bleibt unerklärlich, warum bei
  // „mp3" plötzlich pcm16 herauskommt oder warum es zwei Sekunden länger dauerte.
  const wege = { chat: 'chat/completions', tts: 'audio/speech' };

  ziel.innerHTML =
    '<b style="color:var(--gut)">Ton kam an.</b> <code>' + PU.h(p.modell) + '</code> · Stimme ' +
    PU.h(p.stimme) + ' · ' + PU.h(p.format) +
    (p.weg ? ' über ' + PU.h(wege[p.weg] || p.weg) : '') + ' · ' +
    Math.round(p.bytes / 1024) + ' KB · ' + p.dauer + ' s' +
    (p.aus_speicher ? ' · <i>aus dem Zwischenspeicher, hat nichts gekostet</i>' : '') +
    (p.transkript ? '<br>Vorgelesen wurde: „' + PU.h(p.transkript) + '"' : '') +
    warnung;

  if (p.ton) tonAbspielen(p.ton, p.mime);
}

/** Base64 hinein, Ton heraus. Die Adresse wird nach dem Abspielen freigegeben. */
function tonAbspielen(base64, mime) {
  const roh = atob(base64);
  const bytes = new Uint8Array(roh.length);
  for (let i = 0; i < roh.length; i++) bytes[i] = roh.charCodeAt(i);
  const adresse = URL.createObjectURL(new Blob([bytes], { type: mime }));
  const ton = new Audio(adresse);
  ton.addEventListener('ended', () => URL.revokeObjectURL(adresse));
  ton.play().catch(() => URL.revokeObjectURL(adresse));
}

function stimmProbe(ziel) {
  const zeile = PU.el('div', 'einst-zeile');
  zeile.innerHTML = '<div class="titel">Probelauf</div>';

  const gruppe = PU.el('div', 'einst-gruppe');
  const knopf = PU.el('button', 'knopf still', '🔊 Stimme prüfen');
  knopf.type = 'button';
  gruppe.appendChild(knopf);
  zeile.appendChild(gruppe);

  const bericht = PU.el('p', 'warum');
  bericht.textContent = 'Liest einen Satz vor und zeigt, was zurückkam: Modell, '
                      + 'Dauer, Grösse und das Transkript. Kostet einmal Token.';
  zeile.appendChild(bericht);
  ziel.appendChild(zeile);

  knopf.addEventListener('click', async () => {
    knopf.disabled = true;
    bericht.textContent = 'Läuft …';
    let j;
    try { j = await PU.ruf('stimme_probe'); }
    catch (e) { bericht.innerHTML = '<b style="color:var(--schlecht)">' + PU.h(e.message) + '</b>';
                knopf.disabled = false; return; }
    knopf.disabled = false;

    // Derselbe Bericht wie beim Testen aus dem Katalog — und er spielt den Ton
    // gleich ab. Sonst weiss man, dass Bytes kamen, aber nicht, wie sie klingen.
    probeBerichten(j.probe, bericht);
  });
}

function zeileText(ziel, titel, warum, jetzt, platzhalter, beiWahl, links, vorschlaege) {
  const zeile = PU.el('div', 'einst-zeile');
  zeile.innerHTML = '<div class="titel">' + PU.h(titel) + '</div>';

  const gruppe = PU.el('div', 'einst-gruppe');
  const feld = document.createElement('input');
  feld.type = 'text';
  feld.value = jetzt || '';
  feld.placeholder = platzhalter || '';
  feld.style.minWidth = '17rem';
  feld.addEventListener('change', () => beiWahl(feld.value.trim()));

  /* Vorschläge statt Vorschriften: Das Feld bleibt frei beschreibbar, die
     Liste hängt nur daneben. Bei den Stimmen ist das der Unterschied zwischen
     „geht" und „geht nicht" — alloy und nova sind Namen von OpenAI, andere
     Anbieter haben eigene, und eine geschlossene Liste hätte die ausgesperrt. */
  if (vorschlaege && vorschlaege.length) {
    const kennung = 'vorschlag-' + Math.random().toString(36).slice(2, 9);
    const liste = document.createElement('datalist');
    liste.id = kennung;
    vorschlaege.forEach(function (v) {
      const o = document.createElement('option');
      o.value = typeof v === 'string' ? v : v[0];
      if (typeof v !== 'string' && v[1]) o.label = v[1];
      liste.appendChild(o);
    });
    feld.setAttribute('list', kennung);
    gruppe.appendChild(liste);
  }

  gruppe.appendChild(feld);

  (links || []).forEach(function (l) {
    const a = PU.el('a', 'einst-link', PU.h(l[0]));
    a.href = l[1];
    a.target = '_blank';
    // Ein neu geöffnetes Fenster darf nicht auf das alte zugreifen, und wohin
    // eine Academy zeigt, die auf 127.0.0.1 läuft, geht niemanden draussen an.
    a.rel = 'noopener noreferrer';
    gruppe.appendChild(a);
  });

  zeile.appendChild(gruppe);
  if (warum) zeile.appendChild(PU.el('p', 'warum', PU.h(warum)));
  ziel.appendChild(zeile);
}

/* ================================================================ Werkstatt-Coder
 *
 * Zwei Hälften, zwei Reiter: Die Academy legt im Reiter „Tutor-KI" fest,
 * welche Modelle es gibt; jeder Lernende wählt im Reiter „Werkstatt-Coder"
 * eines davon. Ob er schon darf, entscheidet der Server (srv/coder.php) —
 * hier wird es nur gesagt.
 */

/** Was die Kürzel aus pu_coder_stand() für einen Lernenden bedeuten. */
const CODER_GRUND = {
  aus:         'Die Academy hat den Coder noch nicht eingeschaltet.',
  kein_modell: 'Es ist noch kein Modell für den Coder eingetragen.',
  kurs_fehlt:  'Der 7. Kurs ist auf diesem Rechner noch nicht eingerichtet.',
  kurs_leer:   'Der 7. Kurs wird gerade geschrieben. Sobald er Aufgaben hat, kannst du ihn abschliessen.',
  kurs_offen:  'Der Coder wird frei, wenn du den 7. Kurs vollständig abgeschlossen hast.',
  betreiber:   'Frei für dich als Betreiber, damit du die Werkstatt vorab prüfen kannst.',
  kurs:        'Frei. Der Coder arbeitet mit deiner Brand-Guideline aus dem 7. Kurs.'
};

function coderZeichnen(ziel) {
  const c = PU.einstZustand.daten.coder_stand;

  ziel.appendChild(PU.el('h3', '', 'Werkstatt-Coder'));
  ziel.appendChild(PU.el('p', 'hinweis',
    'Der Coder baut in der Werkstatt, was du beschreibst — nach deiner eigenen ' +
    'Brand-Guideline. Deshalb kommt er erst nach dem 7. Kurs.'));

  const stand = PU.el('p', 'merkzettel' + (c.frei ? ' gut' : ''));
  let text = '<b>' + (c.frei ? 'Frei.' : 'Noch nicht frei.') + '</b> ' +
             PU.h(CODER_GRUND[c.grund] || '');
  if (c.grund === 'kurs_offen') text += ' Stand: <b>' + c.prozent + ' %</b>.';
  stand.innerHTML = text;
  ziel.appendChild(stand);

  // Die Wahl steht auch vor der Freigabe da — wer weiss, womit er später
  // arbeitet, hat einen Grund mehr, den Kurs fertigzumachen.
  const modelle = c.modelle || [];
  if (modelle.length === 0) return;

  const haus = modelle[0];
  const beschriftung = {};
  modelle.forEach(m => { beschriftung[m] = m === haus ? m + ' (Vorgabe)' : m; });

  zeileWahl(ziel, 'Modell',
    'Die Vorgabe ist günstig und schnell. Die anderen sind stärker bei grossen ' +
    'Vorhaben und kosten mehr Token von deinem Konto.',
    // Angezeigt wird, was der Server auflöst — nicht der gespeicherte Wert.
    // Hat die Academy ein gewähltes Modell gestrichen, gilt das Hausmodell,
    // und genau das soll hier markiert sein.
    modelle, c.modell || haus,
    w => { personSetzen('coder_modell', w === haus ? '' : w); c.modell = w; },
    beschriftung);
}

function coderRegelnZeichnen(ziel, g) {
  if (!g) return;   // ohne regeln.manage kommen die Regeln gar nicht mit

  ziel.appendChild(PU.el('h4', '', 'Werkstatt-Coder'));

  const was = PU.el('div', 'einst-zeile');
  was.innerHTML =
    '<div class="titel">Was das ist</div><div></div>' +
    '<p class="warum">Der Agent der Werkstatt. Er läuft über denselben ' +
    'OpenRouter-Schlüssel wie die Tutoren und bucht auf das Tokenkonto des ' +
    'Lernenden. Frei wird er für jeden erst mit dem <b>7. Kurs zu 100 %</b> — ' +
    'geprüft auf dem Server, nicht am Knopf. Admins sind davon ausgenommen, ' +
    'damit die Werkstatt vorab geprüft werden kann.</p>';
  ziel.appendChild(was);

  zeileWahl(ziel, 'Coder', 'Ab Werk aus: Er gibt Text aus dem Haus und kostet je Token.',
    ['an', 'aus'], g.coder_an,
    w => { regelSetzen('coder_an', w).then(() => PU.einstellungenOeffnen('ki')); }, AN_AUS);

  modellWaehler(ziel, {
    titel: 'Hausmodell',
    warum: 'Die Vorgabe für jeden, der nichts anderes wählt. Das Modell muss ' +
           'Werkzeugaufrufe können — sonst ist es kein Coder.',
    jetzt: g.coder_modell,
    platzhalter: 'deepseek/deepseek-v4.1-flash',
    beiWahl: w => regelSetzen('coder_modell', w),
    beiTest: (id, knopf) => modellTesten(id, knopf)
  });

  zeileText(ziel, 'Weitere zur Wahl',
    'Kennungen durch Komma getrennt, höchstens 12. Nur was hier steht, können ' +
    'Lernende auswählen. Leer = nur das Hausmodell.',
    g.coder_auswahl, 'anthropic/claude-sonnet-5,anthropic/claude-opus-5',
    // Leerzeichen nach dem Komma tippt jeder — die Regel verlangt keine.
    w => regelSetzen('coder_auswahl', w.split(',').map(s => s.trim()).filter(Boolean).join(',')));

  zeileWahl(ziel, 'Nur Anbieter ohne Datenspeicherung',
    'An: OpenRouter leitet nur an Anbieter weiter, die Eingaben weder speichern ' +
    'noch zum Training nutzen. Weniger Auswahl, dafür bleibt die Guideline ' +
    'eines Lernenden nicht bei Dritten liegen.',
    ['an', 'aus'], g.coder_datenschutz, w => regelSetzen('coder_datenschutz', w), AN_AUS);
}

/* ================================================================ Modellwahl
 *
 * Vorher stand hier ein leeres Textfeld und daneben ein Link nach draussen.
 * Wer ein Modell wechseln wollte, öffnete einen Reiter, suchte die Kennung,
 * kopierte sie zurück — und hatte sie im Zweifel falsch, weil die Überschrift
 * auf der Stöberseite nicht die Kennung ist. Das Ergebnis waren stumme Tutoren
 * und eine Fehlermeldung, die nach einem Netzproblem aussah.
 *
 * Jetzt kommt die Liste herein: **Hersteller eintippen, Modelle aufklappen,
 * eines anklicken, testen, übernehmen.** In dieser Reihenfolge, und das Testen
 * kommt bewusst VOR dem Übernehmen — sonst überschreibt man den einzigen Wert,
 * der nachweislich funktioniert hat, um herauszufinden, ob ein anderer geht.
 */

/** Der geholte Katalog, damit die Herstellerliste nicht bei jedem Klick neu kommt. */
let katalogStand = null;

/**
 * Ein Modellfeld mit Katalog dahinter.
 *
 * @param o.titel/warum/jetzt/platzhalter  wie bei zeileText
 * @param o.beiWahl   (id) => Promise      speichert
 * @param o.nur       '' | 'ton' | 'frei'  Voreinstellung des Filters
 * @param o.beiTest   (id, melden) => void oder null
 */
function modellWaehler(ziel, o) {
  const zeile = PU.el('div', 'einst-zeile');
  zeile.innerHTML = '<div class="titel">' + PU.h(o.titel) + '</div>';

  const gruppe = PU.el('div', 'einst-gruppe');
  const feld = document.createElement('input');
  feld.type = 'text';
  feld.value = o.jetzt || '';
  feld.placeholder = o.platzhalter || '';
  feld.style.minWidth = '17rem';
  feld.addEventListener('change', () => o.beiWahl(feld.value.trim()));
  gruppe.appendChild(feld);

  const auf = PU.el('button', 'knopf still', '▾ Aus dem Katalog wählen');
  auf.type = 'button';
  gruppe.appendChild(auf);

  if (o.beiTest) {
    const test = PU.el('button', 'knopf still', '⚡ Testen');
    test.type = 'button';
    test.addEventListener('click', () => o.beiTest(feld.value.trim(), test));
    gruppe.appendChild(test);
  }

  zeile.appendChild(gruppe);
  if (o.warum) zeile.appendChild(PU.el('p', 'warum', PU.h(o.warum)));

  // ---------------- die Schublade
  const kasten = PU.el('div', 'modellwahl');
  kasten.hidden = true;
  zeile.appendChild(kasten);
  ziel.appendChild(zeile);

  const filter = PU.el('div', 'modellwahl-filter');

  const hFeld = document.createElement('input');
  hFeld.type = 'text';
  hFeld.placeholder = 'Hersteller, z. B. openai oder x-ai';
  hFeld.setAttribute('list', 'hersteller-liste');
  hFeld.setAttribute('aria-label', 'Hersteller');

  const sFeld = document.createElement('input');
  sFeld.type = 'text';
  sFeld.placeholder = 'im Namen suchen';
  sFeld.setAttribute('aria-label', 'Modellname');

  const nurFeld = document.createElement('select');
  [['', 'alle Modelle'], ['ton', 'nur mit Tonausgabe'], ['frei', 'nur kostenlose']]
    .forEach(function (w) {
      const opt = document.createElement('option');
      opt.value = w[0]; opt.textContent = w[1];
      if (w[0] === (o.nur || '')) opt.selected = true;
      nurFeld.appendChild(opt);
    });

  const zeigen = PU.el('button', 'knopf', 'Modelle zeigen');
  zeigen.type = 'button';
  const neu = PU.el('button', 'knopf still', '↻ Neu holen');
  neu.type = 'button';

  [hFeld, sFeld, nurFeld, zeigen, neu].forEach(x => filter.appendChild(x));
  kasten.appendChild(filter);

  const stand = PU.el('p', 'warum');
  kasten.appendChild(stand);

  const liste = document.createElement('select');
  liste.size = 12;
  liste.className = 'modellwahl-liste';
  liste.setAttribute('aria-label', 'Gefundene Modelle');
  kasten.appendChild(liste);

  const info = PU.el('div', 'modellwahl-info');
  kasten.appendChild(info);

  const uebernehmen = PU.el('button', 'knopf', 'Übernehmen');
  uebernehmen.type = 'button';
  uebernehmen.disabled = true;
  const probieren = PU.el('button', 'knopf still', '⚡ Erst testen');
  probieren.type = 'button';
  probieren.disabled = true;

  const knoepfe = PU.el('div', 'einst-gruppe');
  knoepfe.appendChild(uebernehmen);
  if (o.beiTest) knoepfe.appendChild(probieren);
  kasten.appendChild(knoepfe);

  let gefunden = [];

  async function laden(frisch) {
    stand.textContent = frisch ? 'Katalog wird geholt …' : 'Wird gesucht …';
    zeigen.disabled = neu.disabled = true;
    let j;
    try {
      j = await PU.ruf('or_katalog', {
        frisch: frisch ? '1' : '', hersteller: hFeld.value.trim(),
        suche: sFeld.value.trim(), nur: nurFeld.value
      });
    } catch (e) {
      stand.innerHTML = '<b style="color:var(--schlecht)">' + PU.h(e.message) + '</b>';
      zeigen.disabled = neu.disabled = false;
      return;
    }
    zeigen.disabled = neu.disabled = false;

    if (!j.ok && !j.modelle.length) {
      stand.innerHTML = '<b style="color:var(--schlecht)">' + PU.h(j.fehler) + '</b>';
      return;
    }

    katalogStand = j;
    herstellerListe(j.hersteller);

    gefunden = j.modelle;
    liste.innerHTML = '';
    gefunden.forEach(function (m, i) {
      const opt = document.createElement('option');
      opt.value = String(i);
      // Was in der Zeile steht, ist die KENNUNG — nicht der Anzeigename.
      // Genau die gehört ins Feld, und genau die wird sonst verwechselt.
      opt.textContent = m.id
        + (m.frei ? '  · kostenlos' : '')
        + (m.kann_ton ? '  · 🔊 Ton' : '')
        + (m.ungelistet ? '  · nicht in der Liste' : '');
      liste.appendChild(opt);
    });

    // Eine alte Liste ist besser als keine — aber sie darf sich nicht für
    // aktuell ausgeben. Deshalb steht das Alter dabei, wenn es eines gibt.
    const alt = j.alt
      ? ' <b style="color:var(--warn,var(--gold))">Aus dem Zwischenspeicher</b> — ' +
        'das Netz war nicht erreichbar. Stand: ' +
        (j.geholt ? new Date(j.geholt * 1000).toLocaleString('de-DE') : 'unbekannt') + '.'
      : '';

    /* Wurde im Namen statt beim Hersteller gefunden, steht das hin. „grok" ist
       kein Hersteller — der heisst `x-ai` —, aber sieben Modelle heissen so.
       Stillschweigend etwas anderes zu zeigen, als gefragt wurde, wäre die
       schlechtere Hälfte dieser Hilfe: Beim nächsten Mal sucht man wieder falsch. */
    const ausweich = j.ausweich
      ? ' <b>Kein Hersteller heisst „' + PU.h(hFeld.value.trim()) + '"</b> — '
        + 'gesucht wurde deshalb im Modellnamen. Der Hersteller von Grok heisst '
        + 'bei OpenRouter <code>x-ai</code>.'
      : '';

    stand.innerHTML = j.gefunden + ' von ' + j.gesamt + ' Modellen'
      + (j.gefunden > j.modelle.length ? ' — gezeigt werden die ersten ' + j.modelle.length : '')
      + '.' + ausweich + alt;

    /* Die öffentliche Liste ist unvollständig, und das ist kein Lesefehler:
       x-ai/grok-voice-tts-1.0 steht in keinem der 422 Einträge, es gibt das
       Modell aber. Wer die Kennung kennt, bekommt sie deshalb einzeln
       nachgeschlagen — und erfährt, dass es an der Liste lag, nicht an ihm. */
    if (j.ungelistet) {
      stand.innerHTML =
        '<b style="color:var(--gut)">Gefunden — aber nicht über die Liste.</b> '
        + 'Diese Kennung fehlt im öffentlichen Katalog von OpenRouter (' + j.gesamt
        + ' Einträge). Sie wurde einzeln nachgeschlagen und steht ab jetzt hier mit drin.';
      liste.selectedIndex = 0;
      liste.dispatchEvent(new Event('change'));
    }

    if (!gefunden.length) {
      info.innerHTML = '';
      uebernehmen.disabled = probieren.disabled = true;
      stand.innerHTML = '<b>Nichts gefunden.</b> Weder ein Hersteller noch ein Modellname '
        + 'passt dazu. Vollständige Kennungen wie <code>x-ai/grok-voice-tts-1.0</code> '
        + 'werden auch dann gefunden, wenn sie in der Liste fehlen — dafür muss die '
        + 'Kennung aber ganz dastehen. Das Herstellerfeld leer lassen zeigt alle '
        + j.gesamt + '.' + alt;
    }
  }

  function herstellerListe(hersteller) {
    let dl = document.getElementById('hersteller-liste');
    if (!dl) {
      dl = document.createElement('datalist');
      dl.id = 'hersteller-liste';
      document.body.appendChild(dl);
    }
    dl.innerHTML = '';
    (hersteller || []).forEach(function (h) {
      const opt = document.createElement('option');
      opt.value = h.name;
      opt.label = h.anzahl + ' Modelle' + (h.ton ? ', ' + h.ton + ' mit Ton' : '');
      dl.appendChild(opt);
    });
  }

  liste.addEventListener('change', function () {
    const m = gefunden[parseInt(liste.value, 10)];
    if (!m) return;
    uebernehmen.disabled = probieren.disabled = false;

    /* Was hier steht, entscheidet über Geld. Preise sind je Million Token —
       die einzige Einheit, in der sich zwei Modelle vergleichen lassen. Je
       Token wären es Zahlen mit sieben Nullen, und die vergleicht niemand. */
    const preis = m.frei
      ? '<b style="color:var(--gut)">kostenlos</b>'
      : (m.preis_ein * 1000000).toFixed(2) + ' $ hinein / '
        + (m.preis_aus * 1000000).toFixed(2) + ' $ heraus, je Mio. Token';

    info.innerHTML =
      '<code>' + PU.h(m.id) + '</code><br>' +
      '<b>' + PU.h(m.name) + '</b> · ' + preis +
      (m.kontext ? ' · ' + Math.round(m.kontext / 1000) + 'k Kontext' : '') +
      (m.ungelistet ? ' · <b>nicht im öffentlichen Katalog</b>' : '') +
      '<br><span class="klein">Hinein: ' + PU.h((m.ein || []).join(', ') || '—') +
      ' · Heraus: ' + PU.h((m.aus || []).join(', ') || '—') +
      (m.kann_ton ? ' · <b style="color:var(--gut)">gibt Ton aus</b>' : '') + '</span>' +
      (m.kurz ? '<p class="warum">' + PU.h(m.kurz) + '</p>' : '');
  });

  uebernehmen.addEventListener('click', function () {
    const m = gefunden[parseInt(liste.value, 10)];
    if (!m) return;
    feld.value = m.id;
    o.beiWahl(m.id);
  });

  probieren.addEventListener('click', function () {
    const m = gefunden[parseInt(liste.value, 10)];
    if (m && o.beiTest) o.beiTest(m.id, probieren);
  });

  auf.addEventListener('click', function () {
    kasten.hidden = !kasten.hidden;
    auf.textContent = (kasten.hidden ? '▾' : '▴') + ' Aus dem Katalog wählen';
    if (!kasten.hidden && !liste.options.length) laden(false);
  });

  zeigen.addEventListener('click', () => laden(false));
  neu.addEventListener('click', () => laden(true));
  sFeld.addEventListener('keydown', e => { if (e.key === 'Enter') laden(false); });
  hFeld.addEventListener('keydown', e => { if (e.key === 'Enter') laden(false); });
  nurFeld.addEventListener('change', () => laden(false));
}

/** Setzt oder löscht ein Geheimnis. Der Wert wird nie zurückgelesen. */
async function geheimnisSetzen(name, wert, feld) {
  try {
    await PU.ruf('geheimnis_setzen', { name: name, wert: wert });
    if (feld) feld.value = '';
    PU.melden(wert === '' ? 'Der Schlüssel wurde gelöscht.' : 'Der Schlüssel ist gespeichert.', 'gut');
    PU.einstellungenOeffnen('ki');
  } catch (e) {
    PU.melden(PU.h(e.message), 'schlecht');
  }
}

/* ---------------------------------------------------------------- Academy-Regeln */
function regelnZeichnen(ziel) {
  const g = PU.einstZustand.daten.global;

  ziel.appendChild(PU.el('h3', '', 'Academy-Regeln'));

  const merk = PU.el('p', 'merkzettel');
  merk.innerHTML =
    '<b>Diese Regeln gelten ab dem nächsten Versuch — nie rückwirkend.</b> ' +
    'Wer den Tempobonus abschaltet, nimmt niemandem Punkte weg, die gestern verdient wurden: ' +
    'gerechnet wurde damals, und das Ergebnis steht in den Versuchen.';
  ziel.appendChild(merk);

  ziel.appendChild(PU.el('h4', '', 'Punkte'));

  zeileWahl(ziel, 'Tempobonus',
    'Zusatzpunkte, wenn eine Aufgabe deutlich schneller als ihre Richtzeit richtig gelöst wird.',
    ['an', 'aus'], g.tempobonus, w => regelSetzen('tempobonus', w), AN_AUS);

  zeileZahl(ziel, 'Deckel für den Tempobonus',
    'Höchstens so viel Prozent obendrauf. Ohne Deckel belohnte die Academy schnelles Raten statt Denken.',
    g.tempobonus_deckel, 0, 50, w => regelSetzen('tempobonus_deckel', w), '%');

  zeileZahl(ziel, 'Bonus für die Tages-Challenge',
    'Extrapunkte, einmal je Tag, für die richtig gelöste Aufgabe des Tages. 0 schaltet den Bonus ab.',
    g.tagesbonus, 0, 200, w => regelSetzen('tagesbonus', w), 'Punkte');

  ziel.appendChild(PU.el('h4', '', 'Hilfen'));

  zeileWahl(ziel, 'Hinweise', 'Kosten Punkte, die in der Aufgabe stehen.',
    ['an', 'aus'], g.hinweise_erlaubt, w => regelSetzen('hinweise_erlaubt', w), AN_AUS);

  zeileWahl(ziel, 'Musterlösung zeigen',
    'Wer sie sich zeigen lässt, bekommt null Punkte — aber der Stoff bleibt. Abschalten lohnt nur für Klassenarbeiten.',
    ['an', 'aus'], g.loesung_erlaubt, w => regelSetzen('loesung_erlaubt', w), AN_AUS);

  ziel.appendChild(PU.el('h4', '', 'Aufgaben'));

  zeileWahl(ziel, 'Antworten mischen',
    'Aus, wenn die Klasse eine Aufgabe gemeinsam am Beamer bespricht: sonst ist "die dritte Option" für jeden eine andere.',
    ['an', 'aus'], g.mischen, w => regelSetzen('mischen', w), AN_AUS);

  zeileWahl(ziel, 'Tages-Challenge',
    'Eine Aufgabe des Tages für alle, aus dem Datum gezogen.',
    ['an', 'aus'], g.tagesaufgabe, w => regelSetzen('tagesaufgabe', w), AN_AUS);

  ziel.appendChild(PU.el('h4', '', 'Werkzeuge'));

  zeileWahl(ziel, 'Tokenicer im Menü',
    'Der Token-Zähler mit OpenAIs echten BPE-Tabellen. Rechnet lokal.',
    ['an', 'aus'], g.tokenicer, w => {
      regelSetzen('tokenicer', w).then(() => PU.melden('Wirkt nach dem nächsten Laden der Seite.', 'gut'));
    }, AN_AUS);

  zeileWahl(ziel, 'Medienspalte',
    'Video und Hörfolge neben Kursen und Lektionen. Aus blendet sie für alle aus.',
    ['an', 'aus'], g.medien, w => regelSetzen('medien', w), AN_AUS);

  zeileWahl(ziel, 'Farbvarianten',
    'Sechs geprüfte Paletten zur Wahl — Schmiede, Pergament, Olymp, Marmor, ' +
    'Terrakotta, Funkenflug. An blendet oben im Kopf einen Farbwähler ein, und ' +
    'jeder stellt für sich um. Aus heisst: die Academy sieht für alle gleich aus.',
    ['an', 'aus'], g.farbvarianten, w => {
      regelSetzen('farbvarianten', w).then(() =>
        PU.melden('Wirkt nach dem nächsten Laden der Seite.', 'gut'));
    }, AN_AUS);
}

/* ---------------------------------------------------------------- Konten */
function kontenZeichnen(ziel) {
  ziel.appendChild(PU.el('h3', '', 'Konten'));
  ziel.appendChild(PU.el('p', 'hinweis',
    'Wer wie weit ist, steht in der Klassenübersicht. Hier geht es um die Konten selbst.'));

  const liste = PU.el('div', 'tabellenrahmen');
  liste.innerHTML = '<p class="leer-hinweis">Lade Konten …</p>';
  ziel.appendChild(liste);

  PU.ruf('klasse').then(j => {
    // Die Ebene ist ein Auswahlfeld, kein Umschalt-Knopf: bei zwei Rollen war
    // „zu Tutor" eindeutig, bei fünf Ebenen wäre es ein Ratespiel.
    const darfEbene = PU.darf('rollen.manage');

    // Alter und Klasse stehen hier zum Eintragen, nicht nur zum Ansehen: sie
    // entscheiden, wie die Tutoren mit dem Kind reden. Wer eine Klasse
    // aufnimmt, trägt sie einmal ein und ist fertig.
    let html = '<table><thead><tr><th>Name</th><th>Kennung</th><th>Ebene</th>' +
               '<th>Klasse</th><th>Alter</th><th>Punkte</th><th></th></tr></thead><tbody>';
    j.klasse.forEach(k => {
      html += '<tr><td>' + PU.h(k.anzeigename) +
        (k.pseudonym && k.pseudonym !== k.anzeigename
          ? '<br><span class="klein">tritt auf als ' + PU.h(k.pseudonym) + '</span>' : '') +
        '</td><td><code>' + PU.h(k.kennung) + '</code></td>' +
        '<td>' + (darfEbene
          ? '<select data-rolle="' + k.id + '">' + PU.ebenenOptionen(k.rolle) + '</select>'
          : PU.h(PU.ebenenName(k.rolle))) + '</td>' +
        '<td><input class="feld-schmal" data-feld="gruppe" data-id="' + k.id + '" value="' +
          PU.h(k.gruppe || '') + '" maxlength="40" placeholder="—"></td>' +
        '<td><input class="feld-winzig" type="number" min="0" max="120" data-feld="lebensalter" ' +
          'data-id="' + k.id + '" value="' + (k.lebensalter || '') + '" placeholder="—"></td>' +
        '<td>' + k.punkte + '</td>' +
        '<td><button class="knopf still" data-kw="' + k.id + '">Kennwort</button></td></tr>';
    });
    liste.innerHTML = html + '</tbody></table>';

    liste.querySelectorAll('[data-feld]').forEach(f => {
      let vorher = f.value;
      f.addEventListener('change', async () => {
        try {
          await PU.ruf('profil_pflegen', {
            lernender: parseInt(f.dataset.id, 10), feld: f.dataset.feld, wert: f.value
          });
          vorher = f.value;
          PU.melden('Gespeichert.', 'gut');
        } catch (e) {
          f.value = vorher;
          PU.melden(PU.h(e.message), 'schlecht');
        }
      });
    });

    liste.querySelectorAll('[data-kw]').forEach(b => b.addEventListener('click', async () => {
      const neu = prompt('Neues Kennwort (mindestens 8 Zeichen):');
      if (!neu) return;
      try {
        await PU.ruf('kennwort_zuruecksetzen', { lernender: parseInt(b.dataset.kw, 10), neu: neu });
        PU.melden('Kennwort gesetzt.', 'gut');
      } catch (e) { PU.melden(PU.h(e.message), 'schlecht'); }
    }));

    liste.querySelectorAll('[data-rolle]').forEach(f => {
      const vorher = f.value;
      f.addEventListener('change', async () => {
        try {
          await PU.ruf('rolle_setzen', { lernender: parseInt(f.dataset.rolle, 10), rolle: f.value });
          PU.melden('Ebene geändert: ' + PU.ebenenName(f.value), 'gut');
          inhaltZeichnen();
        } catch (e) {
          f.value = vorher;                       // die Academy hat Nein gesagt
          PU.melden(PU.h(e.message), 'schlecht');
        }
      });
    });
  }).catch(e => { liste.innerHTML = '<p class="fehler">' + PU.h(e.message) + '</p>'; });

  // -------- Neues Konto
  const form = document.createElement('form');
  form.style.marginTop = '1.6rem';
  form.innerHTML =
    '<h4>Neues Konto</h4>' +
    '<label class="klein">Kennung (klein, ohne Leerzeichen)' +
    '<input name="kennung" required pattern="[a-z0-9][a-z0-9._-]{2,31}" placeholder="z.b. mia"></label>' +
    '<label class="klein">Anzeigename<input name="anzeigename" required maxlength="60"></label>' +
    '<label class="klein">Kennwort (mindestens 8 Zeichen)' +
    '<input name="kennwort" type="password" required minlength="8"></label>' +
    '<label class="klein">Gruppe (frei, z. B. Klasse 8b)<input name="gruppe" maxlength="40"></label>' +
    '<label class="klein">Ebene<select name="rolle">' + PU.ebenenOptionen('schueler') + '</select></label>';
  const knopf = PU.el('button', 'knopf', 'Konto anlegen');
  knopf.type = 'submit';
  form.appendChild(knopf);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await PU.ruf('konto_anlegen', {
        kennung: form.kennung.value, anzeigename: form.anzeigename.value,
        kennwort: form.kennwort.value, gruppe: form.gruppe.value, rolle: form.rolle.value
      });
      form.reset();
      PU.melden('Konto angelegt.', 'gut');
      inhaltZeichnen();
    } catch (err) { PU.melden(PU.h(err.message), 'schlecht'); }
  });
  ziel.appendChild(form);
}

/* Die fünf Ebenen für Auswahlfelder. Die Namen stehen serverseitig in
 * PU_EBENEN (srv/rechte.php); hier steht nur die Beschriftung. */
PU.EBENEN_NAMEN = {
  admin:      'Admin — Plattform',
  verwaltung: 'Verwaltung — Schule · Direktor',
  lehrer:     'Lehrer',
  eltern:     'Eltern',
  schueler:   'Schüler'
};

PU.ebenenName = function (e) { return PU.EBENEN_NAMEN[e] || e; };

PU.ebenenOptionen = function (jetzt) {
  return Object.keys(PU.EBENEN_NAMEN).map(e =>
    '<option value="' + e + '"' + (e === jetzt ? ' selected' : '') + '>' +
    PU.h(PU.EBENEN_NAMEN[e]) + '</option>').join('');
};

/* ---------------------------------------------------------------- Profil
 *
 * Wer du bist — und was die Tutoren davon wissen.
 *
 * Das ist kein Steckbrief zum Ausfüllen, sondern der Hebel, mit dem man den
 * Ton der Academy verstellt. Ein Elfjähriger und seine Lehrerin fragen dasselbe
 * und brauchen zwei verschiedene Antworten; woran die Academy das erkennt, steht
 * hier. Deshalb zeigt die Seite auch offen an, **welcher Sprachstil sich
 * daraus ergibt** — sonst wäre es ein Formular, das im Verborgenen wirkt.
 *
 * Alle Felder sind freiwillig. Ein leeres Alter heisst „nicht gesagt", und
 * die Academy antwortet dann eben allgemeiner.
 */
function profilZeichnen(ziel) {
  ziel.appendChild(PU.el('h3', '', 'Profil'));
  ziel.appendChild(PU.el('p', 'hinweis',
    'Diese Angaben gehen an die Tutoren — damit sie wissen, mit wem sie reden. ' +
    'Nicht an die Punkte: die rechnet die Academy für alle gleich.'));

  const rahmen = PU.el('div');
  rahmen.innerHTML = '<p class="leer-hinweis">Lade Profil …</p>';
  ziel.appendChild(rahmen);

  PU.ruf('profil_lesen')
    .then(j => profilMalen(rahmen, j))
    .catch(e => { rahmen.innerHTML = '<p class="fehler">' + PU.h(e.message) + '</p>'; });
}

function profilMalen(rahmen, j) {
  const p = j.profil;
  rahmen.innerHTML = '';

  // -------- Was gerade daraus folgt
  const folge = PU.el('div', 'hinweis-kasten');
  folge.id = 'profil-folge';
  rahmen.appendChild(folge);
  profilFolgeMalen(folge, j.sprachstil, j.kontext_da);

  const speichern = async (feld, wert, el) => {
    try {
      const r = await PU.ruf('profil_setzen', { feld: feld, wert: String(wert) });
      if (el) el.value = r.wert;
      profilFolgeMalen(document.getElementById('profil-folge'), r.sprachstil, j.kontext_da);
      PU.melden('Gespeichert.', 'gut');
    } catch (e) {
      PU.melden(PU.h(e.message), 'schlecht');
    }
  };

  // -------- Pseudonym
  profilZeile(rahmen, 'Pseudonym', p.pseudonym,
    'So sprechen dich die Tutoren an. Für Minderjährige ist das der Name, der die Academy ' +
    'verlässt — der Klarname bleibt in der Klassenliste.',
    (w, el) => speichern('pseudonym', w, el), 40);

  // -------- Alter
  const alterZeile = PU.el('div', 'einst-zeile');
  alterZeile.innerHTML = '<div class="titel">Alter</div>';
  const alterGruppe = PU.el('div', 'einst-gruppe');
  const alterFeld = document.createElement('input');
  alterFeld.type = 'number';
  alterFeld.min = '0';
  alterFeld.max = '120';
  alterFeld.value = String(p.lebensalter || '');
  alterFeld.style.width = '6rem';
  alterFeld.addEventListener('change', () => speichern('lebensalter', alterFeld.value || '0', null));
  alterGruppe.appendChild(alterFeld);
  alterGruppe.appendChild(PU.el('span', 'klein', 'Jahre — leer lassen ist in Ordnung'));
  alterZeile.appendChild(alterGruppe);
  alterZeile.appendChild(PU.el('p', 'warum',
    'Bei Lernenden bestimmt das Alter, wie ausführlich erklärt wird. Bei allen anderen ' +
    'entscheidet die Ebene: eine Lehrkraft bekommt Fachsprache, ein Elternteil nicht.'));
  rahmen.appendChild(alterZeile);

  // -------- Klasse und Schule
  profilZeile(rahmen, 'Klasse oder Gruppe', p.gruppe,
    'Steht in der Klassenliste und hilft den Tutoren beim Einordnen. Zum Beispiel „6a".',
    (w, el) => speichern('gruppe', w, el), 40);

  profilZeile(rahmen, 'Schule oder Einrichtung', p.schule, '',
    (w, el) => speichern('schule', w, el), 80);

  // -------- Sprachstil
  zeileWahl(rahmen, 'Sprachstil',
    'Überschreibt die Ableitung aus Alter und Ebene. „Von selbst" heisst: die Academy ' +
    'entscheidet — was sie gerade entscheidet, steht oben im Kasten.',
    ['', 'einfach', 'normal', 'fachlich'], p.sprachstil,
    (w) => speichern('sprachstil', w, null),
    { '': 'von selbst', einfach: 'einfach', normal: 'normal', fachlich: 'fachlich' });

  // -------- Notiz
  const notizZeile = PU.el('div', 'einst-zeile');
  notizZeile.innerHTML = '<div class="titel">Was die Tutoren wissen sollen</div>';
  const notizGruppe = PU.el('div', 'einst-gruppe');
  const notizFeld = document.createElement('textarea');
  notizFeld.rows = 4;
  notizFeld.maxLength = 400;
  notizFeld.style.width = '100%';
  notizFeld.value = p.notiz;
  notizFeld.placeholder = 'Zum Beispiel: „Ich verstehe Mathe gut, aber lange Texte lesen ' +
                          'strengt mich an." oder „Ich bereite damit meinen Unterricht vor."';
  notizFeld.addEventListener('blur', () => {
    if (notizFeld.value !== p.notiz) {
      p.notiz = notizFeld.value;
      speichern('notiz', notizFeld.value, null);
    }
  });
  notizGruppe.appendChild(notizFeld);
  notizZeile.appendChild(notizGruppe);
  notizZeile.appendChild(PU.el('p', 'warum',
    'Ein bis zwei Sätze. Sie gehen bei jeder Frage mit an den Tutor — schreib nichts ' +
    'hinein, was nicht auch ein Fremder lesen dürfte.'));
  rahmen.appendChild(notizZeile);
}

/** Der Kasten oben: was aus den Angaben gerade folgt. */
function profilFolgeMalen(kasten, stil, kontextDa) {
  if (!kasten) return;
  const satz = {
    einfach:  'kurze Sätze, ein Bild aus dem Alltag, höchstens ein Fachwort',
    normal:   'klar und ohne Jargon, Fachwörter werden beim ersten Mal erklärt',
    fachlich: 'knapp und fachlich, Fachbegriffe werden vorausgesetzt'
  }[stil] || stil;

  kasten.innerHTML =
    '<b>Daraus folgt gerade:</b> Sprachstil <b>' + PU.h(stil) + '</b> — ' + PU.h(satz) + '.' +
    (kontextDa
      ? '<br><span class="klein">Dazu kommt der Kontext deiner Ebene aus ' +
        '<code>secondbrain/000_Kontext/</code>. Wer ihn ändern will, ändert dort eine ' +
        'Textdatei — nicht das Programm.</span>'
      : '<br><span class="klein">Für deine Ebene ist noch kein Kontext hinterlegt ' +
        '(<code>secondbrain/000_Kontext/</code>).</span>');
}

/** Eine Profilzeile mit Textfeld, gespeichert beim Verlassen. */
function profilZeile(ziel, titel, wert, warum, beiWahl, max) {
  const zeile = PU.el('div', 'einst-zeile');
  zeile.innerHTML = '<div class="titel">' + PU.h(titel) + '</div>';

  const gruppe = PU.el('div', 'einst-gruppe');
  const feld = document.createElement('input');
  feld.type = 'text';
  feld.value = wert || '';
  feld.maxLength = max;
  feld.style.minWidth = '16rem';

  let vorher = feld.value;
  feld.addEventListener('blur', () => {
    if (feld.value === vorher) return;
    vorher = feld.value;
    beiWahl(feld.value, feld);
  });

  gruppe.appendChild(feld);
  zeile.appendChild(gruppe);
  if (warum) zeile.appendChild(PU.el('p', 'warum', PU.h(warum)));
  ziel.appendChild(zeile);
  return feld;
}

/* ---------------------------------------------------------------- Rechte
 *
 * Die Rechte-Matrix aus `Login-Level-Rechte-Plan.md`, hier als Schalterfeld.
 * Fünf Ebenen nebeneinander, jede Zeile ein Recht — dieselbe Anordnung wie
 * in der Muster-Seite unter `tests/Login-Levelsystem/`, nur dass ein Klick
 * hier wirkt: er geht in die Datenbank und ins Protokoll, und die nächste
 * Aktion dieser Ebene wird danach anders beantwortet.
 *
 * Zwei Sorten Schalter sind festgenagelt und sehen auch so aus:
 *   · die **Admin-Spalte** — sonst könnte Ebene 1 sich selbst aussperren,
 *   · die **Ebene-1-Rechte** (Schlüssel, Matrix, Wartung) in allen anderen
 *     Spalten — sie sind nicht weitergebbar, so steht es im Plan.
 *
 * Jede Änderung wird sofort gespeichert. Einen Speichern-Knopf gäbe es nur,
 * damit man vergessen kann, ihn zu drücken.
 */
/* ──────────────────────────────────────────────────────────────────────
 * Der Reiter "Login & Rechte" ist seit dem 20.09.2026 nicht mehr im
 * Einstellungsfenster, und mit ihm die Zeile "Ebene" im Reiter Konto sowie
 * die Ebenen-Überschrift über den Verwaltungsreitern. Der Grund ist der
 * heutige Betrieb: es gibt ein Konto, das alles darf — eine Matrix
 * anzuzeigen, in der überall ein Haken steht, erklärt nichts.
 *
 * Das Rechtesystem selbst bleibt unangetastet (srv/rechte.php, pu_recht_hat,
 * die Matrix, das Protokoll mit Hash-Kette). Sobald eine Schule getrennte
 * Konten für Lehrkräfte und Schüler führt, wird die Trennung wieder
 * gebraucht — und dann fehlt nur die Zeile in `tutorReiter`, nicht die
 * Mechanik. Deshalb bleiben die Zeichenfunktionen hier stehen.
 * ────────────────────────────────────────────────────────────────────── */
PU.rechteStand = { ebene: 'lehrer', daten: null };

function rechteZeichnen(ziel) {
  ziel.appendChild(PU.el('h3', '', 'Login & Rechte'));
  ziel.appendChild(PU.el('p', 'hinweis',
    'Fünf Ebenen, eine Matrix. Was hier aus steht, endet im Programm mit einer ' +
    'abschlägigen Antwort — nicht mit einem versteckten Knopf.'));

  const rahmen = PU.el('div');
  rahmen.innerHTML = '<p class="leer-hinweis">Lade Rechte …</p>';
  ziel.appendChild(rahmen);

  PU.ruf('rechte_lesen')
    .then(j => { PU.rechteStand.daten = j; rechteMalen(rahmen); })
    .catch(e => { rahmen.innerHTML = '<p class="fehler">' + PU.h(e.message) + '</p>'; });
}

function rechteMalen(rahmen) {
  const d      = PU.rechteStand.daten;
  const ebenen = Object.keys(d.ebenen);

  rahmen.innerHTML = '';

  // -------- Kopfzeile: welche Ebene hervorgehoben wird
  const chips = PU.el('div', 'rechte-chips');
  ebenen.forEach(e => {
    const k = PU.el('button', 'rechte-chip' + (e === PU.rechteStand.ebene ? ' aktiv' : ''),
                    PU.h(d.ebenen[e].anzeige));
    k.type  = 'button';
    k.title = d.ebenen[e].hinweis;
    k.addEventListener('click', () => { PU.rechteStand.ebene = e; rechteMalen(rahmen); });
    chips.appendChild(k);
  });
  rahmen.appendChild(chips);

  const gewaehlt = PU.rechteStand.ebene;
  rahmen.appendChild(PU.el('p', 'warum',
    'Hervorgehoben: <b>' + PU.h(d.ebenen[gewaehlt].anzeige) + '</b> — ' +
    PU.h(d.ebenen[gewaehlt].hinweis) + '. ' + rechteZaehlung(d, gewaehlt)));

  // -------- Die Gruppen
  Object.keys(d.gruppen).forEach(gruppe => {
    const block = PU.el('section', 'rechte-gruppe');
    block.appendChild(PU.el('h4', '', PU.h(gruppe)));
    d.gruppen[gruppe].forEach(r => block.appendChild(rechteZeile(r, ebenen, gewaehlt, rahmen)));
    rahmen.appendChild(block);
  });

  // -------- Zurücksetzen
  const fuss = PU.el('div', 'rechte-fuss');
  const zurueck = PU.el('button', 'knopf still', 'Zurück zur Standard-Matrix');
  zurueck.type = 'button';
  zurueck.disabled = d.abweichungen === 0;
  zurueck.addEventListener('click', async () => {
    if (!confirm('Alle Abweichungen verwerfen und die Matrix aus dem Plan wiederherstellen?')) return;
    try {
      PU.rechteStand.daten = await PU.ruf('rechte_zuruecksetzen');
      PU.melden('Matrix zurückgesetzt.', 'gut');
      rechteMalen(rahmen);
    } catch (e) { PU.melden(PU.h(e.message), 'schlecht'); }
  });
  fuss.appendChild(zurueck);
  fuss.appendChild(PU.el('span', 'klein', d.abweichungen === 0
    ? 'Unverändert — die Matrix steht genau so im Plan.'
    : d.abweichungen + ' Abweichung' + (d.abweichungen === 1 ? '' : 'en') + ' von der Vorgabe.'));
  rahmen.appendChild(fuss);

  // -------- Protokoll
  rahmen.appendChild(PU.el('h4', '', 'Änderungs-Protokoll'));
  rahmen.appendChild(PU.el('p', 'warum',
    'Angehängt, nie geändert. Jeder Eintrag trägt den Hash seines Vorgängers: ' +
    'wer eine Zeile herausnimmt, bricht die Kette sichtbar ab. ' +
    (d.kette.ok
      ? '<b>Kette in Ordnung</b> (' + d.kette.geprueft + ' Einträge).'
      : '<b class="fehler">Kette gebrochen ab Eintrag ' + d.kette.bruch + '.</b>')));

  const liste = PU.el('ul', 'audit-liste');
  if (!d.audit.length) {
    liste.innerHTML = '<li class="klein">Noch nichts geändert.</li>';
  } else {
    d.audit.forEach(a => {
      const li = document.createElement('li');
      li.innerHTML =
        '<span class="klein">' + PU.h(a.zeit) + '</span> · ' + PU.h(a.wer) + ' · ' +
        (a.aktion === 'zurueckgesetzt'
          ? '<b>Matrix zurückgesetzt</b>'
          : PU.h(a.ebene) + ' · <code>' + PU.h(a.recht) + '</code> ' +
            (a.wert ? '<b class="an">an</b>' : '<b class="aus">aus</b>')) +
        ' · <span class="klein">#' + PU.h(a.hash) + '</span>';
      liste.appendChild(li);
    });
  }
  rahmen.appendChild(liste);
}

/** „Darf 18 von 31 Rechten." — die Vorschau in einem Satz. */
function rechteZaehlung(d, ebene) {
  let hat = 0, alle = 0;
  Object.keys(d.gruppen).forEach(g => d.gruppen[g].forEach(r => {
    alle++;
    if (r.stand[ebene]) hat++;
  }));
  return 'Darf ' + hat + ' von ' + alle + ' Rechten.';
}

function rechteZeile(r, ebenen, gewaehlt, rahmen) {
  const zeile = PU.el('div', 'rechte-zeile');

  const name = PU.el('div', 'recht-name');
  name.innerHTML = '<code>' + PU.h(r.name) + '</code>' +
    (r.nur_admin ? ' <span class="recht-marke">nur Admin</span>' : '') +
    (r.wirkt ? '' : ' <span class="recht-marke still">noch nicht in Betrieb</span>') +
    '<div class="desc">' + PU.h(r.was) + '</div>';
  zeile.appendChild(name);

  const zellen = PU.el('div', 'recht-zellen');
  ebenen.forEach(e => {
    const zelle = PU.el('label', 'recht-zelle' + (e === gewaehlt ? ' hell' : ''));
    const schalter = document.createElement('input');
    schalter.type    = 'checkbox';
    schalter.checked = !!r.stand[e];

    // Festgenagelt: die Admin-Spalte immer, und die Ebene-1-Rechte überall
    // sonst. Beides steht so im Plan — und beides verhindert, dass sich die
    // Academy mit einem Klick selbst aussperrt.
    const fest = (e === 'admin') || r.nur_admin;
    if (fest) {
      schalter.disabled = true;
      zelle.classList.add('fest');
      zelle.title = e === 'admin'
        ? 'Ebene 1 hat immer alles — sonst käme niemand mehr an die Matrix.'
        : 'Dieses Recht gehört Ebene 1 allein und lässt sich nicht weitergeben.';
    } else {
      if (r.stand[e] !== r.vorgabe[e]) zelle.classList.add('abweichend');
      schalter.addEventListener('change', async () => {
        try {
          PU.rechteStand.daten = await PU.ruf('recht_setzen',
            { ebene: e, recht: r.name, an: schalter.checked });
          rechteMalen(rahmen);
        } catch (err) {
          schalter.checked = !schalter.checked;
          PU.melden(PU.h(err.message), 'schlecht');
        }
      });
    }

    zelle.appendChild(schalter);
    zelle.appendChild(PU.el('small', '', PU.h(PU.ebenenKurz(e))));
    zellen.appendChild(zelle);
  });
  zeile.appendChild(zellen);
  return zeile;
}

PU.ebenenKurz = function (e) {
  return { admin: 'Admin', verwaltung: 'Verw.', lehrer: 'Lehrer',
           eltern: 'Eltern', schueler: 'Schüler' }[e] || e;
};

/* ---------------------------------------------------------------- Wartung */
function wartungZeichnen(ziel) {
  const u = PU.einstZustand.daten.uni;

  ziel.appendChild(PU.el('h3', '', 'Wartung'));

  const kacheln = PU.el('div', 'stand-liste');
  [['Konten', u.konten], ['Versuche', u.versuche], ['Prüfungen', u.pruefungen],
   ['Urkunden', u.urkunden], ['Kurse', u.kurse], ['Aufgaben', u.aufgaben]
  ].forEach(k => {
    const kachel = PU.el('div', 'stand-kachel');
    kachel.innerHTML = '<div class="zahl">' + k[1] + '</div><div class="was">' + PU.h(k[0]) + '</div>';
    kacheln.appendChild(kachel);
  });
  ziel.appendChild(kacheln);

  const info = PU.el('p', 'hinweis');
  info.innerHTML = 'Datenbank: ' + (u.db_bytes / 1024).toFixed(0) + ' kB, Schema v' + u.db_version +
    (u.letzter_tag ? ' · zuletzt geübt am ' + PU.h(u.letzter_tag) : ' · noch kein Versuch');
  info.style.marginTop = '1rem';
  ziel.appendChild(info);

  if (u.stoff_fehler && u.stoff_fehler.length) {
    const f = PU.el('div', 'merkzettel warn');
    f.innerHTML = '<b>' + u.stoff_fehler.length + ' Fehler im Lehrstoff:</b><ul>' +
      u.stoff_fehler.map(x => '<li>' + PU.h(x) + '</li>').join('') + '</ul>';
    ziel.appendChild(f);
  }

  ziel.appendChild(PU.el('h4', '', 'Arbeiten'));
  ziel.appendChild(PU.el('p', 'hinweis',
    'Alle drei lassen sich beliebig oft ausführen. Keine löscht etwas: Punkte und Abzeichen ' +
    'werden aus den gespeicherten Versuchen neu abgeleitet.'));

  const ergebnis = PU.el('div', 'klein');
  ergebnis.style.margin = '.8rem 0';

  const reihe = PU.el('div', 'einst-gruppe');
  [['punkte_neu', 'Punkte neu rechnen'],
   ['badges_neu', 'Abzeichen nachprüfen'],
   ['stoff',      'Lehrstoff prüfen'],
   // Für Konten, die umbenannt wurden, bevor das Umbenennen das Pseudonym
   // ablegte. Ein Knopf und kein Automatismus: Wer sich sein Pseudonym selbst
   // ausgesucht hat, soll es nicht bei einer Wartung verlieren.
   ['pseudonyme', 'Pseudonyme ablegen'],
   ['protokoll',  'Protokoll zeigen']
  ].forEach(w => {
    const k = PU.el('button', 'knopf still', w[1]);
    k.type = 'button';
    k.addEventListener('click', async () => {
      k.disabled = true;
      ergebnis.innerHTML = 'Läuft …';
      try {
        const j = await PU.ruf('wartung', { was: w[0] });
        if (j.protokoll) {
          ergebnis.innerHTML = protokollHtml(j.protokoll);
        } else {
          ergebnis.innerHTML = '<b>' + PU.h(j.getan) + '</b>' +
            (j.fehler && j.fehler.length
              ? '<ul>' + j.fehler.map(x => '<li>' + PU.h(x) + '</li>').join('') + '</ul>' : '');
        }
      } catch (e) {
        ergebnis.innerHTML = '<span class="fehler">' + PU.h(e.message) + '</span>';
      } finally { k.disabled = false; }
    });
    reihe.appendChild(k);
  });

  ziel.appendChild(reihe);
  ziel.appendChild(ergebnis);
}

function protokollHtml(zeilen) {
  let html = '<div class="tabellenrahmen"><table><thead><tr>' +
             '<th>Zeit</th><th>Wer</th><th>Was</th><th>Gegenstand</th><th>Notiz</th>' +
             '</tr></thead><tbody>';
  zeilen.forEach(z => {
    html += '<tr><td>' + PU.h(z.zeitpunkt) + '</td><td>' + PU.h(z.wer) + '</td>' +
            '<td>' + PU.h(z.aktion) + '</td><td>' + PU.h(z.gegenstand) + '</td>' +
            '<td>' + PU.h(z.notiz) + '</td></tr>';
  });
  return html + '</tbody></table></div>';
}
