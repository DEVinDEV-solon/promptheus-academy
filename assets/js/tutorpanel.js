/* PROMPTHEUS — Der Tutor als Seitenmenü.
 *
 * Der Tutor ist auch eine eigene Ansicht im Menü. Die ist gut, um in Ruhe
 * etwas zu besprechen — aber schlecht, wenn man **mitten in einer Aufgabe**
 * eine Frage hat: Ansicht wechseln, fragen, zurückfinden, und die halb
 * getippte Antwort ist weg.
 *
 * Deshalb fährt er hier von rechts herein und legt sich neben den Stoff. Die
 * Lektion bleibt stehen, die Aufgabe bleibt stehen, das Gespräch läuft
 * daneben. Zumachen und wieder aufmachen behält den Verlauf.
 *
 * **Vor der richtigen Antwort gibt es keine Lösung, sondern den Weg.** Das
 * ist nicht nur eine Bitte an das Modell: die Lösung wird serverseitig aus
 * der Aufgabe herausgesiebt, bevor sie in den Prompt kommt (siehe
 * `pu_aufgabe_oeffentlich`). Der Tutor kann sie nicht verraten — er kennt
 * sie nicht. Was er kann, ist zeigen, wie man eine Möglichkeit ausschliesst.
 */
'use strict';

PU.panelZustand = { offen: false, agent: 'prometheus', verlauf: [], kontext: null };

/**
 * Öffnet das Seitenmenü.
 *
 * @param {object} kontext {kurs, aufgabe, aufgabeTitel, lektion, thema, agent}
 */
PU.tutorPanelOeffnen = function (kontext) {
  if (!PU.darf('tutor.fragen') || !PU.tutorBereit) {
    PU.melden('Es ist kein Tutor eingerichtet — Aufgaben und Kurse laufen trotzdem.', 'schlecht');
    return;
  }

  const neu = kontext || {};
  const alt = PU.panelZustand.kontext || {};

  // Wechselt der Ort, fängt das Gespräch neu an. Eine Frage zu Aufgabe 3,
  // beantwortet im Zusammenhang von Aufgabe 1, ist schlimmer als keine.
  // Der Kurs zählt mit: zwischen zwei Kursen wechselt man den Gegenstand
  // vollständig, auch wenn beide Male keine Lektion offen ist.
  if (neu.aufgabe !== alt.aufgabe || neu.lektion !== alt.lektion
      || neu.kurs !== alt.kurs) {
    PU.panelZustand.verlauf = [];
  }
  PU.panelZustand.kontext = neu;
  if (neu.agent) PU.panelZustand.agent = neu.agent;

  panelBauen();
  PU.panelZustand.offen = true;
  document.body.classList.add('panel-offen');

  // Daneben klicken schliesst — so wie bei jedem anderen Fenster auch. Ohne
  // das muss man das × treffen, und wer den Tutor loswerden will, klickt
  // erfahrungsgemäss einfach zurück in den Text.
  //
  // Erst im nächsten Durchlauf anmelden: sonst fängt dieser Hörer denselben
  // Klick ab, der das Fenster gerade geöffnet hat, und es klappt sofort
  // wieder zu.
  setTimeout(() => document.addEventListener('mousedown', PU.panelDaneben), 0);
  document.addEventListener('keydown', PU.panelEscape);

  // Wer den Tutor aufruft, will etwas fragen — nicht erst ein Feld anklicken.
  // Erst im nächsten Bilddurchlauf: Der Klick, der das Fenster geöffnet hat,
  // ist noch nicht zu Ende, und der Knopf holt sich den Blick sonst zurück.
  panelFeldFokus();
};

function panelFeldFokus() {
  requestAnimationFrame(() => {
    const feld = document.querySelector('#tutorpanel .panel-form textarea');
    if (feld) feld.focus({ preventScroll: true });
  });
}

/**
 * Ein Klick ausserhalb des Fensters.
 *
 * Was NICHT schliesst: das Fenster selbst, die Knöpfe, die es öffnen
 * (Kopfleiste, „Lösungsweg" an einer Aufgabe) und alles in einem Modal, das
 * darüber liegt. Sonst wäre der Griff zum Tokenicer mitten im Gespräch ein
 * Grund, das Gespräch zu verlieren.
 */
PU.panelDaneben = function (e) {
  if (!PU.panelZustand.offen) return;

  const p = document.getElementById('tutorpanel');
  if (!p || p.contains(e.target)) return;

  if (e.target.closest('#knopf-tutor, .tutor-ruf, .tutorkarte, #modal, #lob')) return;

  PU.tutorPanelSchliessen();
};

PU.panelEscape = function (e) {
  // Nicht schliessen, während ein Fenster darüber liegt — dessen Esc gilt.
  const modal = document.getElementById('modal');
  if (modal && !modal.classList.contains('hidden')) return;

  if (e.key === 'Escape' && PU.panelZustand.offen) PU.tutorPanelSchliessen();
};

PU.tutorPanelSchliessen = function () {
  PU.panelZustand.offen = false;
  document.body.classList.remove('panel-offen');

  document.removeEventListener('mousedown', PU.panelDaneben);
  document.removeEventListener('keydown', PU.panelEscape);

  // Eine laufende Aufnahme endet mit dem Fenster. Ein Mikrofon, das
  // weiterläuft, nachdem der Chat zu ist, nimmt auf, was niemand mehr für
  // die Academy gesagt hat.
  if (PU.mikroStand && PU.mikroStand.laeuft && PU.mikroStand.rekorder) {
    if (PU.mikroStand.uhr) clearTimeout(PU.mikroStand.uhr);
    PU.mikroStand.laeuft = false;
    try { PU.mikroStand.rekorder.stop(); } catch (e) { /* schon gestoppt */ }
  }

  const p = document.getElementById('tutorpanel');
  if (p) p.classList.add('zu');
};

PU.tutorPanelUmschalten = function (kontext) {
  if (PU.panelZustand.offen) PU.tutorPanelSchliessen();
  else PU.tutorPanelOeffnen(kontext);
};

/**
 * Welcher Tutor gehört hierher?
 *
 * An einer offenen Aufgabe Athena — sie ist die Prüferin und sagt, was an
 * einem Gedanken noch fehlt. Sonst Prometheus, der erklärt und einordnet.
 * Umschalten geht immer; das hier ist nur die erste Wahl, damit niemand
 * erst eine Entscheidung treffen muss, um eine Frage zu stellen.
 */
PU.tutorFuer = function (kontext) {
  return (kontext && kontext.aufgabe) ? 'athena' : 'prometheus';
};

/**
 * Von vorn anfangen.
 *
 * **Was dabei wirklich passiert — und was nicht.** Der Verlauf steht nur im
 * Browser; er wird bei keiner Frage mitgeschickt. Der Tutor hat also kein
 * Gedächtnis über die einzelne Frage hinaus, und es gibt entsprechend auch
 * keine Sitzung, die hier beendet würde. Was dieser Knopf leert, ist die
 * Anzeige — und das ist trotzdem nützlich: Nach zehn Fragen zu einer Aufgabe
 * sucht man die neue Antwort zwischen alten, und die Vorschläge, mit denen ein
 * Gespräch leichter anfängt, sind längst nach oben geschoben.
 *
 * Sollte der Verlauf eines Tages an den Server gehen, gehört hierher auch das
 * Zurücksetzen dort. Dann ist dieser Knopf schon da, wo man ihn sucht.
 */
PU.tutorNeu = function () {
  PU.panelZustand.verlauf = [];
  panelBauen();
  panelFeldFokus();
};

function panelBauen() {
  let p = document.getElementById('tutorpanel');
  if (!p) {
    p = PU.el('aside', 'seitenmenue');
    p.id = 'tutorpanel';
    p.setAttribute('role', 'complementary');
    document.body.appendChild(p);
  }
  p.classList.remove('zu');

  const k = PU.panelZustand.kontext || {};
  const ort = k.aufgabeTitel
    ? 'Aufgabe: ' + k.aufgabeTitel
    : (k.thema || 'Freies Gespräch');

  p.innerHTML =
    '<div class="panel-kopf">' +
      '<div>' +
        '<h3>' + PU.h(agentNameKurz(PU.panelZustand.agent)) + '</h3>' +
        '<div class="klein">' + PU.h(ort) + '</div>' +
      '</div>' +
      '<div class="panel-kopf-knoepfe">' +
        '<button class="knopf still schmal panel-neu" type="button" ' +
                'title="Von vorn anfangen">Neu</button>' +
        '<button class="modal-zu" type="button" aria-label="Seitenmenü schliessen">×</button>' +
      '</div>' +
    '</div>' +
    '<div class="panel-agenten"></div>' +
    (k.aufgabe
      ? '<p class="panel-regel">Solange die Aufgabe offen ist, gibt es hier <b>keine Lösung</b> — ' +
        'sondern den Weg dorthin. Frag ruhig, <i>woran</i> man eine falsche Möglichkeit erkennt.</p>'
      : '') +
    '<div class="panel-verlauf" id="panel-verlauf"></div>' +
    '<form class="panel-form">' +
      '<textarea name="frage" rows="3" placeholder="Was möchtest du wissen?"></textarea>' +
      '<div class="panel-fuss"><button class="knopf" type="submit" ' +
        'title="Abschicken (Strg+Return)">Fragen</button></div>' +
    '</form>';

  p.querySelector('.modal-zu').addEventListener('click', PU.tutorPanelSchliessen);
  p.querySelector('.panel-neu').addEventListener('click', PU.tutorNeu);

  // -------- Tutorenwahl, kompakt
  const wahl = p.querySelector('.panel-agenten');
  PU.AGENTEN.forEach(a => {
    const k2 = PU.el('button', 'panel-agent' + (a.kennung === PU.panelZustand.agent ? ' aktiv' : ''),
                     a.symbol + ' ' + PU.h(a.name.split(' ')[0]));
    k2.type = 'button';
    k2.title = a.rolle;
    k2.addEventListener('click', () => {
      PU.panelZustand.agent = a.kennung;
      panelBauen();
    });
    wahl.appendChild(k2);
  });

  // -------- Vorschläge statt eines leeren Feldes
  //
  // Ein leeres Textfeld ist die höchste Hürde im ganzen Fenster. Wer nicht
  // weiss, was er fragen soll, fragt nicht — und kommt nicht weiter.
  const verlauf = p.querySelector('#panel-verlauf');
  if (!PU.panelZustand.verlauf.length) {
    const vor = PU.el('div', 'panel-vorschlaege');
    vorschlaege(k).forEach(v => {
      const kn = PU.el('button', 'panel-vorschlag', PU.h(v));
      kn.type = 'button';
      kn.addEventListener('click', () => fragen(v));
      vor.appendChild(kn);
    });
    verlauf.appendChild(vor);
  } else {
    PU.panelZustand.verlauf.forEach(n =>
      verlauf.appendChild(panelNachricht(n.art, n.von, n.text, n.agent)));
    verlauf.scrollTop = verlauf.scrollHeight;
  }

  const form = p.querySelector('.panel-form');
  PU.mikroKnopfBauen(form);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const t = form.frage.value.trim();
    if (t) { form.frage.value = ''; fragen(t); }
  });

  /* Strg+Return schickt ab; Return allein macht hier eine neue Zeile.
     Das Feld ist drei Zeilen hoch — es lädt zum Schreiben ein, nicht zum
     Abschicken. Vorher gab es überhaupt keine Taste zum Senden: Wer im Feld
     stand, musste zur Maus greifen. */
  PU.tastenSenden(form.frage, form, false);

  // Der Ziehgriff an der linken Kante. Er muss hier wieder angehängt werden,
  // weil `p.innerHTML = …` weiter oben alles darin ersetzt — auch ihn.
  if (PU.griffeAnbringen) PU.griffeAnbringen();
}

/* ---------------------------------------------------------------- Mikro
 *
 * Sprechen statt tippen. Für ein Kind in Klasse 6 ist das der Unterschied
 * zwischen „ich frag mal" und „ach, lass".
 *
 * **Die Aufnahme verlässt den Rechner nicht.** Sie geht an die eigene
 * `api.php`, wird dort mit whisper.cpp örtlich erkannt und sofort gelöscht.
 * Kein Dienst im Netz, kein Konto, keine Wolke — bei Kinderstimmen ist das
 * keine Vorsicht, sondern Bedingung.
 *
 * Der erkannte Text landet **im Eingabefeld, nicht beim Tutor**. Man liest,
 * was verstanden wurde, kann es ändern, und schickt es dann selbst ab. Eine
 * Spracherkennung, die direkt losschickt, verschickt irgendwann etwas, das
 * niemand sagen wollte.
 */
PU.mikroStand = { laeuft: false, rekorder: null, seit: 0, bereit: null };

/**
 * Baut den Mikrofonknopf in ein beliebiges Frageformular.
 *
 * `einhaengen` sagt, wohin der fertige Knopf gehört — das Seitenmenü setzt ihn
 * an den Anfang seiner Fusszeile, der grosse Chat zwischen Eingabefeld und
 * Absenden. Ohne diesen Parameter wäre die Bauweise des Seitenmenüs hier fest
 * verdrahtet, und der zweite Ort hätte eine Kopie gebraucht.
 */
PU.mikroKnopfBauen = async function (form, einhaengen) {
  if (!einhaengen) {
    einhaengen = k => {
      const fuss = form.querySelector('.panel-fuss');
      if (fuss) fuss.insertBefore(k, fuss.firstChild);
    };
  }

  // Einmal fragen, ob whisper überhaupt da ist. Fehlt es, erscheint kein
  // Knopf — ein Mikro, das nichts kann, ist schlimmer als keins.
  if (PU.mikroStand.bereit === null) {
    try {
      PU.mikroStand.bereit = await PU.ruf('sprache_stand');
    } catch (e) {
      PU.mikroStand.bereit = { ok: false, an: false, fehlt: [], hinweis: e.message };
    }
  }

  const s = PU.mikroStand.bereit;
  if (!s.an) return;                       // Academy-Regel: Spracheingabe aus

  if (!s.ok) {
    // Wer die KI einrichtet, soll sehen, WAS fehlt. Alle anderen sehen nichts:
    // ein Hinweis auf eine fehlende Programmdatei hilft einem Zwölfjährigen
    // nicht weiter.
    if (PU.darf('ki.einstellungen')) {
      const hinweis = PU.el('p', 'klein', '🎤 ' + PU.h(s.hinweis));
      hinweis.style.marginTop = '.4rem';
      (form.querySelector('.panel-fuss') || form).appendChild(hinweis);
    }
    return;
  }

  if (!navigator.mediaDevices || !window.MediaRecorder) return;

  const knopf = PU.el('button', 'mikro-knopf', '🎤');
  knopf.type  = 'button';
  // Kein Modellname im Titel: welches Modell wirklich läuft, entscheidet sich
  // erst beim Erkennen — bei knappem Speicher fällt der Server auf ein
  // kleineres zurück. Was tatsächlich benutzt wurde, steht hinterher an der
  // Buchung im Cockpit.
  knopf.title = 'Sprechen statt tippen. Die Erkennung läuft mit whisper.cpp auf '
              + 'diesem Rechner — die Aufnahme geht nirgendwo hin.';
  knopf.setAttribute('aria-label', 'Sprachnachricht aufnehmen');

  einhaengen(knopf);

  knopf.addEventListener('click', () => {
    if (PU.mikroStand.laeuft) mikroStoppen(knopf, form);
    else                      mikroStarten(knopf, form);
  });
};

/**
 * Warum das Mikrofon nicht geht — im Klartext.
 *
 * Die erste Fassung sagte auf jeden Fehlschlag „Der Browser muss den Zugriff
 * erlauben". Das war in den häufigsten Fällen **falsch**: ist gar kein
 * Mikrofon angeschlossen, fragt Chrome nie, und der Nutzer sucht in den
 * Browsereinstellungen nach einem Schalter, den es nicht gibt. Gemessen:
 * `NotFoundError — Requested device not found`, ganz ohne Nachfrage.
 *
 * Also wird unterschieden. Jede Zeile hier steht für einen Fall, in dem
 * jemand sonst zehn Minuten am falschen Ende sucht.
 */
async function mikroGrund(fehler) {
  // Kein sicherer Kontext: getUserMedia gibt es dann gar nicht. Betrifft den
  // Zugriff über die LAN-Adresse — 127.0.0.1 und localhost gelten als sicher.
  if (!window.isSecureContext) {
    return 'Das Mikrofon geht nur über <b>http://localhost</b> oder eine ' +
           'gesicherte Verbindung. Diese Seite läuft über ' + PU.h(location.origin) +
           ' — dort gibt der Browser das Mikrofon nicht frei.';
  }

  const name = fehler ? fehler.name : '';

  // Zuerst zählen, ob überhaupt ein Gerät da ist. Das erklärt den häufigsten
  // Fall, und es erklärt ihn, bevor irgendjemand von „Erlauben" spricht.
  let anzahl = -1;
  try {
    const geraete = await navigator.mediaDevices.enumerateDevices();
    anzahl = geraete.filter(g => g.kind === 'audioinput').length;
  } catch (e) { /* dann eben nicht */ }

  if (name === 'NotFoundError' || anzahl === 0) {
    return '<b>Es ist kein Mikrofon angeschlossen.</b> Der Browser fragt ' +
           'deshalb auch nicht nach Erlaubnis — er hat nichts zu fragen. ' +
           'Schliess ein Mikrofon oder ein Headset an und öffne die Seite neu.';
  }

  if (name === 'NotAllowedError' || name === 'SecurityError') {
    let dauerhaft = false;
    try {
      const p = await navigator.permissions.query({ name: 'microphone' });
      dauerhaft = p.state === 'denied';
    } catch (e) { /* Firefox kann das nicht abfragen */ }

    return dauerhaft
      ? '<b>Das Mikrofon ist für diese Seite dauerhaft blockiert.</b> ' +
        'Zum Aufheben: auf das Symbol links in der Adresszeile klicken → ' +
        'Mikrofon → <i>Zulassen</i>, dann die Seite neu laden.'
      : 'Der Zugriff wurde abgelehnt. Beim nächsten Klick fragt der Browser ' +
        'wieder — dann auf <i>Zulassen</i> gehen.';
  }

  if (name === 'NotReadableError' || name === 'AbortError') {
    return 'Das Mikrofon ist belegt. Meist hält ein anderes Programm es fest — ' +
           'ein Besprechungsfenster, ein Aufnahmeprogramm, ein zweiter Browser-Tab.';
  }

  if (name === 'OverconstrainedError') {
    return 'Das angeschlossene Mikrofon liefert kein brauchbares Signal.';
  }

  return 'Das Mikrofon liess sich nicht öffnen' +
         (name ? ' (' + PU.h(name) + ')' : '') + '.';
}

async function mikroStarten(knopf, form) {
  let strom;
  try {
    strom = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (e) {
    // Der Grund steht in der Meldung, nicht nur „geht nicht". Als Fenster
    // statt als Kurzmeldung: der Text ist zwei Sätze lang und nennt einen
    // Weg — dafür ist eine Meldung, die nach vier Sekunden verschwindet,
    // die falsche Form.
    const grund = await mikroGrund(e);
    PU.melden('🎤 ' + grund.replace(/<[^>]+>/g, ''), 'schlecht');

    // An das Formular, an dem geklickt wurde — es gibt zwei davon: das
    // Seitenmenü und den grossen Chat.
    let kasten = form.querySelector('.mikro-grund');
    if (!kasten) {
      kasten = PU.el('div', 'hinweis-kasten mikro-grund');
      form.appendChild(kasten);
    }
    kasten.innerHTML = '🎤 ' + grund;
    return;
  }

  // Beim nächsten Mal ist der alte Grund nicht mehr wahr.
  const alt = document.querySelector('.mikro-grund');
  if (alt) alt.remove();

  const stuecke = [];
  const r = new MediaRecorder(strom);

  r.addEventListener('dataavailable', e => { if (e.data.size) stuecke.push(e.data); });

  r.addEventListener('stop', async () => {
    // Das Mikrofon freigeben — sonst leuchtet die Aufnahmelampe weiter, auch
    // wenn längst nichts mehr aufgenommen wird.
    strom.getTracks().forEach(t => t.stop());

    const ton = new Blob(stuecke, { type: r.mimeType || 'audio/webm' });
    if (ton.size < 2000) {
      PU.melden('Das war zu kurz.', 'schlecht');
      mikroZurueck(knopf);
      return;
    }

    knopf.textContent = '⏳';
    knopf.disabled = true;

    const daten = new FormData();
    daten.append('aktion', 'sprache_erkennen');
    daten.append('ton', ton, 'aufnahme.webm');

    try {
      const antwort = await fetch('api.php', { method: 'POST', body: daten });
      const j = await antwort.json();

      if (j.ok && j.text) {
        // In das Feld, nicht zum Tutor. Angehängt statt ersetzt: wer schon
        // etwas getippt hat, verliert es nicht.
        const feld = form.frage;
        feld.value = (feld.value.trim() + ' ' + j.text).trim();
        feld.focus();
        PU.melden('Verstanden: ' + j.sekunden + ' Sekunden, ' + j.tokens + ' Token.', 'gut');
      } else {
        PU.melden(PU.h(j.fehler || 'Es wurde nichts verstanden.'), 'schlecht');
      }
    } catch (e) {
      PU.melden('Die Erkennung ist fehlgeschlagen: ' + PU.h(e.message), 'schlecht');
    }
    mikroZurueck(knopf);
  });

  r.start();
  PU.mikroStand = Object.assign(PU.mikroStand, { laeuft: true, rekorder: r, seit: Date.now() });

  knopf.classList.add('aktiv');
  knopf.textContent = '⏹';
  knopf.title = 'Aufnahme beenden';

  // Harte Grenze, passend zu PU_TON_MAX_SEK auf der Serverseite. Ein
  // vergessenes Mikro nimmt sonst auf, bis der Rechner ausgeht.
  PU.mikroStand.uhr = setTimeout(() => {
    if (PU.mikroStand.laeuft) {
      PU.melden('Nach drei Minuten ist Schluss — das ist die Grenze.', 'schlecht');
      mikroStoppen(knopf, form);
    }
  }, 175000);
}

function mikroStoppen(knopf, form) {
  if (PU.mikroStand.uhr) clearTimeout(PU.mikroStand.uhr);
  if (PU.mikroStand.rekorder && PU.mikroStand.laeuft) {
    PU.mikroStand.rekorder.stop();
  }
  PU.mikroStand.laeuft = false;
}

function mikroZurueck(knopf) {
  PU.mikroStand.laeuft = false;
  knopf.classList.remove('aktiv');
  knopf.disabled = false;
  knopf.textContent = '🎤';
  knopf.title = 'Sprechen statt tippen. Die Erkennung läuft mit whisper.cpp auf '
              + 'diesem Rechner — die Aufnahme geht nirgendwo hin.';
}

function vorschlaege(k) {
  if (k.aufgabe) {
    return [
      'Wo fange ich bei dieser Aufgabe an?',
      'Woran erkenne ich, dass eine Antwortmöglichkeit nicht stimmen kann?',
      'Welchen Teil der Lektion muss ich dafür verstanden haben?'
    ];
  }
  if (k.lektion) {
    return [
      'Erklär mir das Thema dieser Lektion mit einem Beispiel.',
      'Wofür brauche ich das im Alltag?',
      'Was ist der häufigste Denkfehler dabei?'
    ];
  }
  return ['Was lerne ich in diesem Kurs?', 'Womit fange ich am besten an?'];
}

async function fragen(text) {
  const p = document.getElementById('tutorpanel');
  const verlauf = p.querySelector('#panel-verlauf');
  const vor = verlauf.querySelector('.panel-vorschlaege');
  if (vor) vor.remove();

  // Der Tutor wird auch an der eigenen Zeile mitgeschrieben: Wer nach drei
  // Fragen auf Hermes umschaltet, baut den Verlauf neu auf — und die alten
  // Zeilen sollen dann die Stimme behalten, mit der sie gesprochen wurden.
  const k = PU.panelZustand.kontext || {};
  PU.panelZustand.verlauf.push({ art: 'ich', von: 'Du', text: text,
                                 agent: PU.panelZustand.agent });
  verlauf.appendChild(panelNachricht('ich', 'Du', text, PU.panelZustand.agent));

  // Dieselbe Welle wie in der Tutor-Ansicht und im Glossar — PU.denktNachricht
  // in app.js. Hier stand vorher „denkt nach …" als Text.
  const warte = PU.denktNachricht(agentNameKurz(PU.panelZustand.agent), PU.panelZustand.agent);
  verlauf.appendChild(warte);
  verlauf.scrollTop = verlauf.scrollHeight;

  try {
    const j = await PU.ruf('tutor_fragen', {
      agent:   PU.panelZustand.agent,
      frage:   text,
      // Der Kurs muss mit, sonst hat „dieser Kurs" in der Frage keinen
      // Gegenstand und der Tutor fragt zurück. Der Rückgriff auf
      // lernenZustand fängt die Aufrufer ab, die ihn nicht mitgeben — besser
      // eine Stelle als vier, die es einzeln richtig machen müssen.
      kurs:    k.kurs || (PU.lernenZustand || {}).kurs || '',
      lektion: k.lektion || '',
      aufgabe: k.aufgabe || ''
    });
    // Guthaben zu Ende: das Schild als Fenster, im Verlauf nur eine Zeile.
    const antwort = PU.stoppGezeigt(j)
      ? j.stopp.titel + '\n\n' + j.stopp.weiter
      : (j.ok ? j.text : j.fehler);
    PU.denktAntwort(warte, antwort, !j.ok);
    // Der Tutor wird mitgeschrieben, nicht nur sein Anzeigename: Beim
    // Wiederherstellen des Verlaufs muss der Vorleseknopf wissen, wessen
    // Stimme er nehmen soll — und aus „🦉 Athena" liesse sich das nur raten.
    PU.panelZustand.verlauf.push({
      art: 'agent', von: agentNameKurz(PU.panelZustand.agent), text: antwort,
      agent: PU.panelZustand.agent
    });
  } catch (e) {
    PU.denktAntwort(warte, e.message, true);
  }
  verlauf.scrollTop = verlauf.scrollHeight;
}

/* Kopieren und Vorlesen kommen aus app.js — dieselben Knöpfe wie in der
   Tutoransicht und im Glossar. Vorher stand hier eine eigene Fassung, die nur
   kopieren konnte; das Vorlesen fehlte im Seitenmenü, weil niemand daran
   gedacht hat, es an der dritten Stelle nachzutragen.

   **An beiden Seiten des Gesprächs, nicht nur an der Antwort.** Hier stand
   einmal „Was man selbst getippt hat, hat man schon" — das stimmt fürs Lesen
   und nicht fürs Hören. Wer diktiert hat, will hören, was angekommen ist;
   wer übt, hört an der eigenen Frage, ob sie eine ist.

   Beide Seiten mit derselben Stimme: Ein Gespräch mit Athena, in dem die
   eigene Zeile jemand anders spricht, klingt nach einem dritten im Raum. */
function panelNachricht(art, von, text, agent) {
  const el = PU.el('div', 'nachricht ' + art);
  el.innerHTML = '<div class="von">' + PU.h(von) + '</div>' +
                 '<div class="text" style="white-space:pre-wrap"></div>';
  el.querySelector('.text').textContent = text;

  const wer = agent || PU.panelZustand.agent;
  if (art === 'agent') PU.antwortKnoepfe(el, text, wer);
  else                 PU.eigeneKnoepfe(el, text, { agent: wer });
  return el;
}

function agentNameKurz(kennung) {
  const a = PU.AGENTEN.find(x => x.kennung === kennung);
  return a ? a.symbol + ' ' + a.name : kennung;
}
