/* PROMPTHEUS — App-Schale: Ruf an api.php, Ansichtenwechsel, Meldungen.
 *
 * Der Ansichtsschlüssel muss EXAKT zur Kennung im HTML passen: `wechsel()`
 * bildet `view-` + Schlüssel. Derselbe Fallstrick wie in ADVOCAT, und er
 * fällt nicht auf — die Ansicht bleibt einfach leer.
 */
'use strict';

window.PU = window.PU || {};

/* ---------------------------------------------------------------- Ruf */
PU.ruf = async function (aktion, daten) {
  const antwort = await fetch('api.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(Object.assign({ aktion: aktion }, daten || {}))
  });

  if (antwort.status === 401) { location.reload(); throw new Error('Nicht angemeldet.'); }

  let j;
  try { j = await antwort.json(); }
  catch (e) { throw new Error('Der Server hat kein JSON geantwortet (HTTP ' + antwort.status + ').'); }

  if (!j.ok && j.fehler) throw new Error(j.fehler);
  return j;
};

/* ---------------------------------------------------------------- Meldungen */
PU.melden = function (text, art) {
  const kasten = document.getElementById('melder');
  if (!kasten) return;
  const el = document.createElement('div');
  el.className = 'meldung ' + (art || '');
  el.innerHTML = text;
  kasten.appendChild(el);
  // Eine Warnung über das Guthaben steht so lange wie ein Lob: Sie will
  // gelesen werden, und viereinhalb Sekunden reichen für zwei Zeilen nicht,
  // wenn man nebenher eine Aufgabe im Kopf hat.
  setTimeout(() => { el.remove(); },
             (art === 'gold' || art === 'warnung') ? 8000 : 4500);
};

/* ---------------------------------------------------------------- Werkzeug */
PU.h = function (s) {
  const d = document.createElement('div');
  d.textContent = s == null ? '' : String(s);
  return d.innerHTML;
};

PU.el = function (tag, klasse, inhalt) {
  const e = document.createElement(tag);
  if (klasse) e.className = klasse;
  if (inhalt !== undefined) e.innerHTML = inhalt;
  return e;
};

/**
 * Die Wartenachricht eines Tutors — drei Punkte in einer Welle.
 *
 * Ohne dieses Zeichen sieht ein Fenster, das zehn Sekunden nachdenkt, kaputt
 * aus, und man klickt noch einmal.
 *
 * **Es steht hier und nicht in einer der Tutor-Dateien**, weil es die Tutoren
 * dreimal gibt: als Ansicht im Menü, als Seitenmenü rechts und im Glossar. Die
 * Welle gab es lange nur im Glossar; die anderen beiden schrieben „denkt nach
 * …" als Text. Dreimal dieselbe Sache, dreimal anders — jetzt einmal.
 *
 * Wer weniger Bewegung eingestellt hat, bekommt statt der Welle ein ruhiges
 * Blinken; das regelt das Stylesheet.
 *
 * @param {string} von Name des Tutors, wie er über der Nachricht steht
 * @return {HTMLElement} die Nachricht — `.text` wird später mit der Antwort
 *         überschrieben, dann verschwindet die Welle von selbst
 */
/**
 * Absenden über die Tastatur — für jedes Chatfeld der Academy.
 *
 * **Strg+Return sendet immer.** Das ist der Griff, den man nicht lernen muss:
 * Wer ihn aus anderen Programmen kennt, benutzt ihn hier genauso, und er
 * funktioniert in jedem der drei Chats gleich. Auf einem Mac zählt Cmd+Return
 * mit — dort liegt die Taste an derselben Stelle im Kopf, nur an einer anderen
 * unter dem Daumen.
 *
 * Was **Return allein** tut, ist je nach Feld verschieden, und das ist kein
 * Versehen: Ein einzeiliges Feld ist zum Abschicken da, ein dreizeiliges zum
 * Schreiben. Deshalb `enterSendet` — im Seitenmenü macht Return eine neue
 * Zeile, in der Tutor-Ansicht schickt es ab.
 *
 * Umschalt+Return und Alt+Return machen nie etwas anderes als einen Umbruch.
 *
 * @param {HTMLElement} feld  das Textfeld
 * @param {HTMLFormElement} form  das Formular, dessen `submit` gefeuert wird
 * @param {boolean} enterSendet  ob Return allein absendet (Vorgabe: ja)
 */
PU.tastenSenden = function (feld, form, enterSendet) {
  if (!feld || !form) return;
  const alleinSendet = enterSendet !== false;

  feld.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;

    // `requestSubmit` und nicht `submit()`: Nur der erste Weg löst den
    // `submit`-Horcher aus, an dem die Prüfung auf leere Eingaben hängt.
    if (e.ctrlKey || e.metaKey) { e.preventDefault(); form.requestSubmit(); return; }
    if (alleinSendet && !e.shiftKey && !e.altKey) { e.preventDefault(); form.requestSubmit(); }
  });
};

PU.denktNachricht = function (von, agent) {
  const el = PU.el('div', 'nachricht agent denkt');

  // Wer antwortet, bleibt an der Nachricht hängen — der Vorleseknopf entsteht
  // erst später und wüsste sonst nicht, mit welcher Stimme er lesen soll.
  if (agent) el.dataset.agent = agent;

  el.innerHTML =
    '<div class="von">' + PU.h(von) + '</div>' +
    '<div class="text denkt-zeile" role="status" aria-live="polite">' +
      '<span class="denkt-wort">denkt nach</span>' +
      '<span class="denkt-punkte" aria-hidden="true"><i></i><i></i><i></i></span>' +
    '</div>';
  return el;
};

/**
 * Die Antwort einsetzen und die Welle beenden.
 *
 * Die Klassen müssen mit weg: `denkt-zeile` ist ein Flex-Kasten und würde die
 * Antwort in eine Zeile pressen.
 */
PU.denktAntwort = function (el, text, fehler) {
  el.classList.remove('denkt');
  const t = el.querySelector('.text');
  t.className = 'text';
  t.style.whiteSpace = 'pre-wrap';
  t.textContent = text;
  if (fehler) { el.classList.add('fehler'); return; }

  /* Ein Klick, und die Antwort liegt in der Zwischenablage.
     Hier und nicht in den einzelnen Chats: Diese Funktion setzt JEDE Antwort
     ein — im Seitenmenü, in der Tutoransicht, bei der Vertiefung. Ein Knopf an
     drei Stellen wäre einer, den man an der vierten vergisst.
     Nur bei einer echten Antwort. Eine Fehlermeldung will niemand kopieren. */
  PU.antwortKnoepfe(el, text);
};

/**
 * Kopieren und Vorlesen an eine Nachricht hängen.
 *
 * **Eine Funktion für alle Chats, und das ist der ganze Punkt.** Vorher hatte
 * jede Ansicht ihre eigenen Knöpfe: die Tutoransicht einen, das Seitenmenü
 * einen zweiten, das Glossar einen dritten — und der stand nur da, wenn eine
 * völlig unabhängige Einstellung („Emoji") an war. Vorlesen gab es nur an
 * einer der drei Stellen. Drei Fassungen bedeuten drei Gelegenheiten, eine zu
 * vergessen, und genau das war passiert.
 *
 * Jetzt hängt hier alles, und wer eine neue Ansicht baut, ruft eine Zeile auf.
 *
 * @param el    die Nachricht; sie braucht ein `.von`
 * @param text  was kopiert und vorgelesen wird — der ROHTEXT, nicht das HTML
 * @param wie   {agent, eigen, sprich}
 *              agent  — wessen Stimme
 *              eigen  — ob es die eigene Zeile ist (Beschriftung, Buchung)
 *              sprich — was vorgelesen wird, falls das nicht der Text ist
 */
PU.nachrichtKnoepfe = function (el, text, wie) {
  if (!el || !text) return;

  const von = el.querySelector('.von');
  if (!von || von.querySelector('.nachricht-kopie')) return;   // schon dran

  const w     = wie || {};
  const eigen = !!w.eigen;
  const was   = eigen ? 'Frage' : 'Antwort';

  const k = PU.el('button', 'nachricht-kopie', '📋');
  k.type = 'button';
  k.title = was + ' kopieren';
  k.setAttribute('aria-label', was + ' kopieren');
  k.addEventListener('click', () => PU.inZwischenablage(text, k));
  von.appendChild(k);

  // Vorlesen nur, wenn es eingeschaltet ist. Ein Knopf, der jedes Mal „ist
  // abgeschaltet" meldet, ist kein Angebot, sondern eine Sackgasse mit Symbol.
  if (!PU.stimmeAn) return;

  // Die Stimme ist die des Gesprächs, auch auf der eigenen Zeile.
  //
  // Hier stand zuerst das Gegenteil: die eigene Frage mit der allgemeinen
  // Stimme, damit es nicht klingt, als hätte der Tutor sie gesagt. Im
  // Gebrauch war das falsch herum — wer mit Athena spricht, hört zwei
  // Stimmen abwechseln und fragt sich, wer die zweite ist. Wer spricht,
  // steht ohnehin in der Zeile darüber.
  //
  // Die Buchung trägt einen eigenen Zweck: Im Cockpit muss ablesbar
  // bleiben, wofür das Guthaben ging.
  const stimme = w.agent || el.dataset.agent || '';
  const zweck  = eigen ? 'Vorlesen · eigene Frage' : '';

  // Vorgelesen wird, was abgeschickt wurde — nicht, was dasteht. Im grossen
  // Chat spricht man einen Tutor mit `@athena` an; die Anrede geht nicht an
  // das Modell, und sie gehört auch nicht in den Ton. Der Kopierknopf nimmt
  // weiter den vollen Text: Wer ihn einfügt, will die Anrede mit haben.
  const t = PU.vorleseKnopf(w.sprich || text, zweck, stimme);
  if (eigen) {
    t.title = 'Eigene Frage vorlesen';
    t.setAttribute('aria-label', 'Eigene Frage vorlesen');
  }
  von.appendChild(t);
};

/**
 * Die Knöpfe an einer Tutorantwort. Der gewohnte Name, damit die vier
 * Aufrufstellen unverändert bleiben.
 */
PU.antwortKnoepfe = function (el, text, agent) {
  PU.nachrichtKnoepfe(el, text, { agent: agent || '' });
};

/**
 * Die Knöpfe an der eigenen Frage.
 *
 * @param wie {agent, sprich} — siehe `PU.nachrichtKnoepfe`
 *
 * **Warum man vorgelesen bekommen will, was man selbst getippt hat.** Wer
 * seine Frage hört, hört, ob sie eine Frage ist — das ist in Stufe eins die
 * halbe Übung. Wer mit dem Mikrofon diktiert hat, prüft damit, ob wirklich
 * ankam, was er sagen wollte. Und wer eine Frage noch einmal stellen will,
 * kopiert sie, statt sie abzutippen.
 *
 * Es stand hier einmal, das brauche man nicht: „Was man selbst getippt hat,
 * hat man schon." Das gilt für das Lesen. Fürs Hören gilt es nicht, und für
 * eine diktierte Frage gilt es in beiden Fällen nicht.
 */
PU.eigeneKnoepfe = function (el, text, wie) {
  const w = wie || {};
  PU.nachrichtKnoepfe(el, text,
    { eigen: true, agent: w.agent || '', sprich: w.sprich || '' });
};

/* ---------------------------------------------------------------- Vorlesen
 *
 * Der Ton kommt als Base64 im JSON und nicht als Adresse: Eine Adresse, unter
 * der ein Tonstück liegt, wäre für jeden abrufbar, der sie errät. Hier wird er
 * im Browser zu einem Blob und daraus zu einer kurzlebigen Objekt-Adresse, die
 * nur dieses Fenster kennt.
 *
 * Es läuft immer nur EIN Stück. Wer den zweiten Knopf drückt, während der
 * erste spielt, will das zweite hören und nicht beide gleichzeitig.
 */
PU.stimmeAn = false;      // wird aus dem Serverstand gesetzt
PU.stimmeLaeuft = null;

/**
 * Die vier Regler auf eine Tonspur legen.
 *
 * **Sie wirken hier und nicht am Dienst — das ist gemessen.** OpenRouter nimmt
 * ein `speed`-Feld an und gibt 200 zurück; die Aufnahme ist danach exakt gleich
 * lang. Ein Faktor 16 im Wert ergab 2,55 gegen 2,63 Sekunden, weniger als zwei
 * identische Aufrufe ohnehin schwanken. Der Wert wird geschluckt.
 *
 * Im Browser wirken sie sofort und kosten nichts — man zieht und hört, statt zu
 * zahlen und zu hoffen.
 *
 * Steht alles auf Werk, wird der ganze Umweg übersprungen: Ein AudioContext,
 * der nichts tut, ist ein AudioContext, der schiefgehen kann. Und `preservesPitch`
 * ist der Grund, warum „Tempo" hier wirklich Tempo heisst und nicht heimlich
 * auch die Stimmlage verschiebt.
 */
PU.tonKlang = function (ton, klang) {
  if (!ton || !klang) return;

  const tempo = Number(klang.tempo);
  const tiefe = Number(klang.tiefe);
  const klar  = Number(klang.klarheit);
  const laut  = Number(klang.laut);

  if (tempo && tempo !== 100) {
    ton.preservesPitch = ton.mozPreservesPitch = ton.webkitPreservesPitch = true;
    ton.playbackRate = Math.max(0.25, Math.min(4, tempo / 100));
  }
  if (laut && laut !== 100) ton.volume = Math.max(0, Math.min(1, laut / 100));

  // Klangfarbe braucht Web Audio. Fehlt es oder scheitert es, bleibt der Ton
  // unbearbeitet — lieber ungefiltert hören als gar nicht.
  if ((!tiefe || tiefe === 0) && (!klar || klar === 0)) return;

  try {
    PU.tonWerk = PU.tonWerk || new (window.AudioContext || window.webkitAudioContext)();
    if (PU.tonWerk.state === 'suspended') PU.tonWerk.resume();

    const quelle = PU.tonWerk.createMediaElementSource(ton);

    const bass = PU.tonWerk.createBiquadFilter();
    bass.type = 'lowshelf';
    bass.frequency.value = 220;
    bass.gain.value = tiefe || 0;

    const hoehen = PU.tonWerk.createBiquadFilter();
    hoehen.type = 'highshelf';
    hoehen.frequency.value = 3200;
    hoehen.gain.value = klar || 0;

    quelle.connect(bass).connect(hoehen).connect(PU.tonWerk.destination);
  } catch (e) { /* Ohne Klangfarbe, aber mit Ton. */ }
};

PU.vorleseKnopf = function (text, wofuer, agent) {
  const k = PU.el('button', 'nachricht-ton', '🔊');
  k.type = 'button';
  k.title = 'Vorlesen';
  k.setAttribute('aria-label', 'Vorlesen');
  k.addEventListener('click', () => PU.vorlesen(text, k, wofuer, agent));
  return k;
};

/**
 * Alles anhalten, was gerade klingt.
 *
 * **Zwei Sorten Ton, und sie wussten nichts voneinander.** Das Vorlesen
 * benutzt ein `Audio`-Objekt, das nie im Dokument steht; die Podcastfolgen
 * und die Medien einer Lektion sind gewoehnliche `<audio>`-Leisten darin.
 * Wer eine Folge laufen liess und dann eine Antwort vorlesen liess, bekam
 * beides uebereinander — und musste die Seite neu laden, um Ruhe zu haben.
 *
 * `muted` bleibt unberuehrt: Ein Film ohne Ton traegt nichts zum Klang bei,
 * und ihn anzuhalten waere keine Ruhe, sondern ein Bild, das ohne Grund
 * einfriert.
 *
 * Angehalten wird, nicht zurueckgesetzt — wer zurueckkommt, hoert weiter,
 * wo er aufgehoert hat.
 *
 * @param ausser ein Element, das weiterlaufen darf — das gerade gestartete
 */
PU.tonStoppen = function (ausser) {
  // 1. Die Abspielleisten im Dokument.
  document.querySelectorAll('audio, video').forEach(a => {
    if (a !== ausser && !a.paused && !a.muted) {
      try { a.pause(); } catch (e) { /* schon vorbei */ }
    }
  });

  // 2. Das Vorlesen. Es steht nicht im Dokument, also findet die Schleife
  //    oben es nicht — es braucht seinen eigenen Absatz.
  if (!PU.stimmeLaeuft || PU.stimmeLaeuft === ausser) return;
  const t = PU.stimmeLaeuft;
  PU.stimmeLaeuft = null;
  try { t.pause(); } catch (e) { /* schon vorbei */ }
  if (t.dataset && t.dataset.adresse) URL.revokeObjectURL(t.dataset.adresse);
  document.querySelectorAll('.nachricht-ton.laeuft')
          .forEach(b => b.classList.remove('laeuft'));
};

/**
 * Der Gegenweg: eine Abspielleiste faengt an, alles andere hoert auf.
 *
 * `play` steigt nicht auf, laesst sich aber einfangen — daher der dritte
 * Parameter. So erreicht der Hoerer auch Leisten, die erst beim Zeichnen
 * einer Lektion entstehen, ohne dass jede Stelle daran denken muss.
 */
PU.eineStimme = function () {
  document.addEventListener('play', (e) => {
    if (e.target && e.target.pause) PU.tonStoppen(e.target);
  }, true);
};

// Nicht auf `DOMContentLoaded` allein verlassen: Steht diese Datei mit
// `defer` im Kopf oder wird sie nachgeladen, ist das Ereignis laengst
// vorbei, und der Hoerer haenge sich nie ein.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => PU.eineStimme());
} else {
  PU.eineStimme();
}

PU.vorlesen = async function (text, knopf, wofuer, agent) {
  // Zweiter Klick auf denselben Knopf: aus. Das ist die Erwartung an jeden
  // Abspielknopf, und ohne sie müsste man die Seite neu laden, um Ruhe zu haben.
  if (knopf && knopf.classList.contains('laeuft')) { PU.tonStoppen(); return; }
  PU.tonStoppen();

  if (knopf) knopf.classList.add('laedt');
  let j;
  try {
    j = await PU.ruf('vorlesen', { text: text, wofuer: wofuer || '', agent: agent || '' });
  } catch (e) {
    if (knopf) knopf.classList.remove('laedt');
    PU.melden(PU.h(e.message), 'schlecht');
    return;
  }
  if (knopf) knopf.classList.remove('laedt');

  if (!j.ok) {
    // Ist das Guthaben zu Ende, kommt dasselbe Schild wie beim Tutor.
    if (!PU.stoppGezeigt(j)) PU.melden(PU.h(j.fehler || 'Vorlesen ging nicht.'), 'schlecht');
    return;
  }

  const roh = atob(j.ton);
  const bytes = new Uint8Array(roh.length);
  for (let i = 0; i < roh.length; i++) bytes[i] = roh.charCodeAt(i);
  const adresse = URL.createObjectURL(new Blob([bytes], { type: j.mime }));

  const ton = new Audio(adresse);
  ton.dataset.adresse = adresse;
  PU.tonKlang(ton, j.klang);
  PU.stimmeLaeuft = ton;
  if (knopf) knopf.classList.add('laeuft');

  const fertig = () => {
    if (PU.stimmeLaeuft === ton) PU.stimmeLaeuft = null;
    URL.revokeObjectURL(adresse);
    if (knopf) knopf.classList.remove('laeuft');
  };
  ton.addEventListener('ended', fertig);
  ton.addEventListener('error', () => {
    fertig();
    PU.melden('Der Ton liess sich nicht abspielen.', 'schlecht');
  });

  try { await ton.play(); } catch (e) { fertig(); }
};

/* ---------------------------------------------------------------- Ansichten */
PU.ANSICHTEN = {
  lernen:      { zeichnen: () => PU.lernenZeichnen() },
  fortschritt: { zeichnen: () => PU.fortschrittZeichnen() },
  tutor:       { zeichnen: () => PU.tutorZeichnen && PU.tutorZeichnen() },
  tokenicer:   { zeichnen: () => PU.tokenicerZeichnen && PU.tokenicerZeichnen() },
  klasse:      { zeichnen: () => PU.klasseZeichnen && PU.klasseZeichnen() },
  cockpit:     { zeichnen: () => PU.cockpitZeichnen && PU.cockpitZeichnen() }
};

PU.aktuell = 'lernen';

/**
 * Ansicht wechseln.
 *
 * @return {boolean} false, wenn es diese Ansicht hier nicht gibt — eine Ebene
 *         ohne Cockpit-Recht hat kein `view-cockpit`. Der Router braucht die
 *         Antwort, um eine Adresse ins Leere abzufangen, statt eine leere
 *         Seite stehen zu lassen.
 */
PU.wechsel = function (schluessel) {
  const eintrag = PU.ANSICHTEN[schluessel];
  const ziel = document.getElementById('view-' + schluessel);
  if (!eintrag || !ziel) return false;

  document.querySelectorAll('#haupt .view').forEach(v => v.classList.add('hidden'));
  ziel.classList.remove('hidden');

  document.querySelectorAll('.menue-knopf[data-ansicht]').forEach(k => {
    k.classList.toggle('aktiv', k.dataset.ansicht === schluessel);
    // Vorlesegeräte sollen nicht nur die Farbe kennen.
    if (k.dataset.ansicht === schluessel) k.setAttribute('aria-current', 'page');
    else k.removeAttribute('aria-current');
  });

  // Auch das Stylesheet soll wissen, welche Ansicht offen ist. Das Tutorfenster
  // etwa füllt die Fensterhöhe und braucht deshalb unten keinen Auslauf; jede
  // andere Ansicht schon.
  document.body.dataset.ansicht = schluessel;

  PU.aktuell = schluessel;

  // Die Adresse nachziehen und die Pfadleiste grob füllen, BEVOR gezeichnet
  // wird: Eine Ansicht lädt ihre Daten erst, und in der Zwischenzeit soll oben
  // schon stehen, wo man ist.
  if (PU.routeSchreiben) PU.routeSchreiben();
  if (PU.pfadAusRoute)   PU.pfadAusRoute();

  window.scrollTo(0, 0);
  eintrag.zeichnen();
  return true;
};

/* ---------------------------------------------------------------- Kopfstand */
PU.standSetzen = function (stand) {
  if (!stand) return;
  // Die drei mit `live` aus pu_kennzahlen(). Sie stehen serverseitig schon im
  // HTML; hier werden sie nach einer Abgabe fortgeschrieben, statt die Seite
  // dafür neu zu laden.
  const p = document.getElementById('kz-punkte');
  const t = document.getElementById('kz-titel');
  const s = document.getElementById('kz-serie');
  if (p && stand.konto) p.textContent = stand.konto.summe;
  if (t && stand.konto) t.textContent = stand.konto.titel;
  if (s && stand.serie) s.textContent = '🔥 ' + stand.serie.tage;
};

/** Nach einer Abgabe: Kopfzeile, neuer Titel, neue Badges, Tagesbonus. */
PU.ertragMelden = function (a) {
  PU.standSetzen({ konto: a.konto, serie: a.serie });

  if (a.titel_neu) {
    PU.melden('🏅 Neuer Titel: <b>' + PU.h(a.titel_neu) + '</b>', 'gold');
  }
  (a.neue_badges || []).forEach(b => {
    PU.melden(b.symbol + ' Abzeichen verdient: <b>' + PU.h(b.name) + '</b>', 'gold');
  });
  if (a.tagesbonus && a.tagesbonus.punkte) {
    PU.melden('⭐ Tages-Challenge gelöst: <b>+' + a.tagesbonus.punkte +
              ' Extrapunkte</b>', 'gold');
  }
};

/* ---------------------------------------------------------------- Einstellungen
 * Der gelesene Zugriff auf die eigenen Einstellungen. `PU.einst` kommt aus
 * index.php und wird beim Speichern fortgeschrieben — deshalb liest der Rest
 * der Oberfläche NICHT direkt aus dem Objekt, sondern hierüber: eine Stelle,
 * an der eine fehlende Angabe ihre Vorgabe bekommt. */
PU.EINST_VORGABE = {
  thema: 'dunkel', schriftgroesse: 'normal', textschrift: 'serif',
  kontrast: 'normal', bewegung: 'normal', breite: 'normal',
  medienspalte: 'ja', hinweis_fragen: 'ja', zeit_anzeigen: 'nein',
  athena_auto: 'ja', infos_woerter: '160', tagesziel: '100',
  lob_popup: 'ja', lob_dauer: '6'
};

PU.e = function (schluessel) {
  const w = (PU.einst || {})[schluessel];
  return (w === undefined || w === null || w === '') ? PU.EINST_VORGABE[schluessel] : w;
};

PU.eJa = function (schluessel) { return PU.e(schluessel) === 'ja'; };

/* ---------------------------------------------------------------- Rechte
 * Darf ich das? Die Antwort kommt aus der Rechte-Matrix und steht seit dem
 * Seitenaufbau in PU.rechte.
 *
 * **Das ist eine Anzeige-Hilfe, keine Sicherung.** Sie entscheidet, ob ein
 * Knopf erscheint — nicht, ob eine Aktion durchgeht. Geprüft wird jede
 * Aktion noch einmal in api.php; wer hier trickst, bekommt dort 403. */
PU.darf = function (recht) {
  return (PU.rechte || []).indexOf(recht) >= 0;
};

/* ---------------------------------------------------------------- Fenster
 * Ein Fenster für alles, was über der Seite liegt: die Einstellungen bauen
 * sich ihr Gerüst selbst, alles andere bekommt es hier.
 *
 * Es gibt genau einen Behälter (#modal). Zwei gleichzeitig offene Fenster
 * gäbe es sonst irgendwann doch — und dann wäre die Frage, welches das Esc
 * bekommt.
 *
 * @returns {HTMLElement|null} die Fläche, in die der Inhalt gehört
 */
PU.modalZeigen = function (titel) {
  const modal = document.getElementById('modal');
  if (!modal) return null;

  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  modal.innerHTML =
    '<div class="modal-flaeche"><div class="modal-kopf">' +
    '<h2>' + PU.h(titel) + '</h2>' +
    '<button class="modal-zu" type="button" aria-label="Schliessen">×</button>' +
    '</div><div class="modal-inhalt breit"></div></div>';

  modal.querySelector('.modal-zu').addEventListener('click', PU.modalSchliessen);
  modal.addEventListener('click', (e) => { if (e.target === modal) PU.modalSchliessen(); });
  document.addEventListener('keydown', PU.modalEscape);

  return modal.querySelector('.modal-inhalt');
};

/**
 * Dasselbe Fenster, nur über die ganze Fläche — und mit einer Unterzeile.
 *
 * Vollbild ist keine Steigerung von „gross", sondern eine andere Sorte Fenster:
 * Es kommt zum Einsatz, wo **gelesen** wird. Ein 940-Pixel-Kasten mitten auf
 * der Seite hat einen Rand rundherum, und dieser Rand sagt „das hier ist ein
 * Einschub". Eine Seite, die man von oben bis unten liest, ist kein Einschub.
 *
 * Der Rückweg steht deshalb doppelt: das × oben rechts und Esc. Ein Klick
 * neben das Fenster gibt es hier nicht mehr — es gibt kein Neben.
 *
 * @returns {HTMLElement|null} die Fläche, in die der Inhalt gehört
 */
PU.modalVollbild = function (titel, unterzeile) {
  const modal = document.getElementById('modal');
  if (!modal) return null;

  modal.classList.remove('hidden');
  modal.classList.add('vollbild');
  document.body.classList.add('modal-voll');
  modal.setAttribute('aria-hidden', 'false');
  modal.innerHTML =
    '<div class="modal-flaeche"><div class="modal-kopf">' +
    '<div class="gl-kopftext"><h2>' + PU.h(titel) + '</h2>' +
    (unterzeile ? '<p class="klein">' + PU.h(unterzeile) + '</p>' : '') +
    '</div>' +
    '<button class="modal-zu" type="button" aria-label="Schliessen">×</button>' +
    '</div><div class="modal-inhalt breit"></div></div>';

  modal.querySelector('.modal-zu').addEventListener('click', PU.modalSchliessen);
  document.addEventListener('keydown', PU.modalEscape);
  // Der Lesefluss beginnt oben. Wer das Fenster ein zweites Mal öffnet, soll
  // nicht dort weiterlesen, wo er beim letzten Mal aufgehört hat.
  const flaeche = modal.querySelector('.modal-inhalt');
  flaeche.scrollTop = 0;
  return flaeche;
};

PU.modalEscape = function (e) { if (e.key === 'Escape') PU.modalSchliessen(); };

/* ------------------------------------------------------------ Zwischenablage
 *
 * Stand als private Funktion im Glossar. Sie wird jetzt an drei Stellen
 * gebraucht — Glossar, Seiten-Chat, Tutoransicht —, und drei Abschriften
 * derselben zwanzig Zeilen sind zwei zu viel.
 *
 * Zwei Wege, weil der neue nicht überall greift: `navigator.clipboard` braucht
 * einen sicheren Kontext, und die Academy läuft auf `http://127.0.0.1`. Das
 * gilt zwar als sicher, aber nicht in jedem Browser und nicht in jedem
 * Fenster — deshalb bleibt der alte Weg über ein unsichtbares Feld daneben
 * stehen. Er ist hässlich und er funktioniert.
 *
 * @param {string} text der Inhalt
 * @param {HTMLElement} [knopf] bekommt kurz eine Rückmeldung, wenn angegeben
 */
PU.inZwischenablage = async function (text, knopf) {
  const gemeldet = () => {
    if (!knopf) { PU.melden('Kopiert.', 'gut'); return; }
    // Titel statt Beschriftung, wenn der Knopf nur ein Zeichen trägt: Ein
    // Symbolknopf, der plötzlich „✓ Kopiert" heisst, springt in der Breite
    // und schiebt die Nachricht daneben weg.
    const nurZeichen = (knopf.textContent || '').trim().length <= 2;
    const alt = nurZeichen ? knopf.title : knopf.textContent;
    if (nurZeichen) { knopf.title = 'Kopiert'; knopf.classList.add('kopiert'); }
    else            { knopf.textContent = '✓ Kopiert'; }
    setTimeout(() => {
      if (nurZeichen) { knopf.title = alt; knopf.classList.remove('kopiert'); }
      else            { knopf.textContent = alt; }
    }, 1600);
  };

  try {
    await navigator.clipboard.writeText(text);
    gemeldet();
  } catch (e) {
    const feld = document.createElement('textarea');
    feld.value = text;
    feld.setAttribute('readonly', '');
    feld.style.cssText = 'position:fixed;left:-9999px';
    document.body.appendChild(feld);
    feld.select();
    try { document.execCommand('copy'); gemeldet(); }
    catch (e2) { PU.melden('Kopieren ging nicht — bitte von Hand markieren.', 'schlecht'); }
    feld.remove();
  }
};

/* ------------------------------------------------------- Das Schild beim Stopp
 *
 * Wenn der Minus-Rahmen aufgebraucht ist, antwortet kein Tutor mehr. Der Server
 * schickt dann kein `fehler`, sondern ein `stopp` — ein fertiges Schild mit
 * Bilanz, Grund und den Wegen weiter (srv/abo.php, pu_nachlade_meldung()).
 *
 * **Ein Fenster, nicht eine rote Zeile im Chat.** Eine Zeile im Verlauf sieht
 * aus wie eine Panne und scrollt nach drei Sätzen weg; hier geht es aber um
 * eine Entscheidung, die jemand treffen soll. Die braucht Platz.
 *
 * Der Text kommt vollständig vom Server. Hier steht kein einziger Satz — sonst
 * gäbe es die Formulierung zweimal, und die zweite wäre die veraltete.
 */
PU.tokenSchild = function (meldung) {
  if (!meldung) return;

  const flaeche = PU.modalZeigen(meldung.titel);
  if (!flaeche) return;

  const wege = (meldung.wege || []).map(w =>
    '<div class="nachlade-weg' + (w.bald ? ' bald' : '') + '">' +
      '<h4>' + PU.h(w.titel) + (w.bald ? ' <span class="bald-marke">in Vorbereitung</span>' : '') + '</h4>' +
      '<p>' + PU.h(w.text) + '</p>' +
      (w.ziel && w.knopf
        ? '<a class="knopf schmal" href="' + PU.h(w.ziel) + '" data-schild-zu>' + PU.h(w.knopf) + '</a>'
        : '') +
    '</div>').join('');

  flaeche.innerHTML =
    '<div class="nachlade">' +
      '<p class="nachlade-bilanz">' + PU.h(meldung.bilanz) + '</p>' +
      '<p class="nachlade-grund">' + PU.h(meldung.grund) + '</p>' +
      '<div class="nachlade-wege">' + wege + '</div>' +
      '<p class="nachlade-weiter">' + PU.h(meldung.weiter) + '</p>' +
    '</div>';

  // Ein Knopf, der ins Cockpit führt, muss das Fenster hinter sich zumachen —
  // sonst steht die Preistafel hinter einem Schild, das sie verdeckt.
  flaeche.querySelectorAll('[data-schild-zu]').forEach(a =>
    a.addEventListener('click', PU.modalSchliessen));
};

/**
 * Kommt in einer Antwort ein Stopp mit? Dann zeigen und `true` melden.
 *
 * Die drei Chats — Seitenmenü, Tutoransicht, Glossar — fragen alle dasselbe.
 * Hier steht es einmal, damit nicht der dritte vergessen wird.
 */
PU.stoppGezeigt = function (j) {
  if (!j || !j.stopp) return false;
  PU.tokenSchild(j.stopp);
  return true;
};

/* ----------------------------------------------------------- Die Vorwarnung
 *
 * Damit der Stopp niemanden überrascht. `pu_token_lage()` schickt bei jedem
 * Laden mit, wie es steht; bei `knapp` steht hier eine Zeile — einmal, nicht
 * bei jeder Frage. Eine Warnung, die sich wiederholt, wird zur Tapete.
 */
PU.tokenLage = null;
PU.tokenGewarnt = false;

PU.tokenLageSetzen = function (lage) {
  if (!lage) return;
  PU.tokenLage = lage;

  if (lage.lage === 'knapp' && !PU.tokenGewarnt) {
    PU.tokenGewarnt = true;
    PU.melden('Dein Guthaben reicht noch für etwa <b>' + lage.antworten +
              ' Fragen</b> an die Tutoren.', 'warnung');
  }
  if (lage.lage === 'minus' && !PU.tokenGewarnt) {
    PU.tokenGewarnt = true;
    PU.melden('Dein Guthaben ist aufgebraucht. Die Tutoren antworten noch bis ' +
              'zum Ende dieser Lektion.', 'warnung');
  }
};

PU.modalSchliessen = function () {
  const modal = document.getElementById('modal');
  if (!modal) return;

  /* Hatte das Fenster eine Adresse, muss sie mit weg — sonst steht `#/ziel`
     noch da, während nichts mehr offen ist, und der nächste Klick auf denselben
     Menüpunkt tut nichts (die Adresse ändert sich ja nicht).
     `history.back()` ist der bessere Weg als eine neue Adresse: Er nimmt den
     Eintrag aus dem Verlauf heraus, statt einen zweiten danebenzulegen. Nur
     wenn hinter uns nichts Eigenes liegt — jemand hat die Adresse direkt
     aufgerufen —, wird die Adresse ersetzt. */
  if (PU.fensterOffen) {
    PU.fensterOffen = '';
    if (PU.routeSchritte > 0 && location.hash.startsWith('#/ziel')) history.back();
    else if (PU.routeSchreiben) PU.routeSchreiben(true);
  }
  modal.classList.add('hidden');
  // Auch aufräumen, was ein Vollbildfenster gesetzt hat. Bliebe `modal-voll`
  // am Körper stehen, wäre die Seite dahinter für immer festgehalten.
  modal.classList.remove('vollbild');
  document.body.classList.remove('modal-voll');
  modal.setAttribute('aria-hidden', 'true');
  modal.innerHTML = '';
  document.removeEventListener('keydown', PU.modalEscape);
};

/* ---------------------------------------------------------------- Lob-Fenster
 * Erscheint nach einer richtigen Antwort. Es schliesst sich über das × oder
 * nach der eingestellten Zeit; steht dort 0, bleibt es stehen, bis jemand
 * es wegklickt. Beides ist gewollt: manche lesen den Satz, andere sind schon
 * bei der nächsten Aufgabe. */
PU.lobZeigen = function (spruch, punkte) {
  if (!PU.eJa('lob_popup') || !spruch) return;

  const kasten = document.getElementById('lob');
  if (!kasten) return;

  const dauer = parseInt(PU.e('lob_dauer'), 10) || 0;

  kasten.innerHTML =
    '<button class="lob-zu" type="button" aria-label="Schliessen">×</button>' +
    '<div class="lob-zeichen" aria-hidden="true">🔥</div>' +
    '<p class="lob-spruch">' + PU.h(spruch) + '</p>' +
    (punkte ? '<p class="lob-punkte">+' + punkte + ' Punkte</p>' : '') +
    (dauer > 0 ? '<div class="lob-balken"><i></i></div>' : '');

  kasten.classList.remove('hidden');
  kasten.setAttribute('aria-hidden', 'false');

  if (PU._lobUhr) { clearTimeout(PU._lobUhr); PU._lobUhr = null; }

  const zu = () => {
    kasten.classList.add('hidden');
    kasten.setAttribute('aria-hidden', 'true');
    kasten.innerHTML = '';
    if (PU._lobUhr) { clearTimeout(PU._lobUhr); PU._lobUhr = null; }
    document.removeEventListener('keydown', aufEsc);
  };
  const aufEsc = (e) => { if (e.key === 'Escape') zu(); };

  kasten.querySelector('.lob-zu').addEventListener('click', zu);
  document.addEventListener('keydown', aufEsc);

  if (dauer > 0) {
    const balken = kasten.querySelector('.lob-balken i');
    if (balken) {
      balken.style.transition = 'width ' + dauer + 's linear';
      requestAnimationFrame(() => { balken.style.width = '0%'; });
    }
    PU._lobUhr = setTimeout(zu, dauer * 1000);
  }
};

/* ---------------------------------------------------------------- Thema
 * Der Umschalter kennt nur hell und dunkel. "Auto" gibt es in den
 * Einstellungen — im Kopf wäre ein dritter Zustand ein Ratespiel darüber,
 * was der nächste Klick tut. */
PU.themaSetzen = function (wahl, speichern) {
  const w = document.documentElement;
  w.dataset.thema = wahl;

  const dunkel = wahl === 'dunkel' ||
    (wahl === 'auto' && window.matchMedia &&
     window.matchMedia('(prefers-color-scheme: dark)').matches);
  w.dataset.themaEffektiv = dunkel ? 'dunkel' : 'hell';

  PU.einst = PU.einst || {};
  PU.einst.thema = wahl;

  if (speichern !== false) {
    PU.ruf('einst_setzen', { schluessel: 'thema', wert: wahl }).catch(() => {});
  }
};

/* ---------------------------------------------------------------- Start */
PU.start = function () {
  // Menüpunkte sind echte Links (`<a href="#/tokenicer">`). Sie brauchen
  // keinen Klickhorcher: Der Browser setzt die Adresse, `hashchange` macht den
  // Rest. Das ist nicht Sparsamkeit, sondern der Unterschied zwischen einem
  // Link und etwas, das aussieht wie einer — nur ein echter lässt sich in
  // einem neuen Tab öffnen, kopieren und vom Zurück-Knopf zurücknehmen.
  //
  // Für alles, was kein Link sein kann, bleibt der Horcher.
  document.querySelectorAll('[data-ansicht]').forEach(el => {
    if (el.tagName === 'A') return;
    el.addEventListener('click', () => PU.wechsel(el.dataset.ansicht));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); PU.wechsel(el.dataset.ansicht); }
    });
  });

  // Der Rückweg aus einer Rollenübernahme. Er hängt an keinem Recht — sonst
  // sperrte sich Ebene 1 im Konto eines Schülers ein.
  const zur = document.getElementById('knopf-rolle-zurueck');
  if (zur) zur.addEventListener('click', async () => {
    try {
      await PU.ruf('rolle_zurueck', {});
      location.href = 'index.php';
    } catch (e) { PU.melden(PU.h(e.message), 'schlecht'); }
  });

  const ab = document.getElementById('knopf-abmelden');
  if (ab) ab.addEventListener('click', async () => {
    await PU.ruf('abmelden');
    location.reload();
  });

  const gl = document.getElementById('knopf-glossar');
  if (gl) gl.addEventListener('click', () => PU.glossarOeffnen && PU.glossarOeffnen());

  const th = document.getElementById('knopf-thema');
  if (th) th.addEventListener('click', () => {
    // Sind Farbvarianten an, ist hell/dunkel keine eigene Einstellung mehr:
    // eine Palette IST das eine oder das andere. Der Knopf wechselt dann zur
    // Partnerpalette — Schmiede ↔ Pergament, Olymp ↔ Marmor.
    //
    // Vorher drehte er nur `data-thema-effektiv`. Weil der Variantenblock
    // dieselben Farben mit gleicher Spezifität später setzt, blieb dabei alles
    // wie es war; sichtbar wechselte allein die Kopfleiste, deren Hell-Regel
    // zufällig eine höhere Spezifität hat.
    if (PU.variantePartnerWechseln && PU.variantePartnerWechseln()) return;

    const jetzt = document.documentElement.dataset.themaEffektiv;
    PU.themaSetzen(jetzt === 'dunkel' ? 'hell' : 'dunkel');
  });

  const ein = document.getElementById('knopf-einstellungen');
  if (ein) ein.addEventListener('click', () => PU.einstellungenOeffnen());

  // Der Tutor fährt von rechts herein — im Zusammenhang mit dem, was gerade
  // offen ist. Steht eine Lektion auf dem Schirm, weiss er, welche.
  const tut = document.getElementById('knopf-tutor');
  if (tut) tut.addEventListener('click', () => {
    const z = PU.lernenZustand || {};
    PU.tutorPanelUmschalten({
      kurs:    z.kurs || '',
      lektion: z.wo === 'lektion' ? z.lektion : '',
      thema:   z.wo === 'lektion' ? 'Diese Lektion'
             : (z.wo === 'kurs' ? 'Dieser Kurs' : 'Freies Gespräch')
    });
  });

  // Folgt das Thema dem Betriebssystem, muss es das auch dann tun, wenn
  // sich dort etwas ändert, während die Academy offen ist.
  if (window.matchMedia) {
    const mm = window.matchMedia('(prefers-color-scheme: dark)');
    const nach = () => { if (PU.e('thema') === 'auto') PU.themaSetzen('auto', false); };
    if (mm.addEventListener) mm.addEventListener('change', nach);
  }

  PU.ruf('stand').then(j => {
    PU.standSetzen(j.stand);
    PU.letzterStand = j.stand;
    PU.tagesaufgabe = j.tagesaufgabe;
    PU.tokenLageSetzen(j.token);
    PU.stimmeAn = !!j.stimme;
  }).catch(() => {});

  // Nicht mehr fest auf „lernen": Die Adresse entscheidet, wo es losgeht.
  // Genau daran hing, dass Neuladen einen aus dem Kurs zurück auf die
  // Startseite warf.
  PU.routeStart();
};
