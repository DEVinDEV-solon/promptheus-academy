/* PROMPTHEUS — der Urkunden-Generator: Abschluss-Urkunde in drei Schritten,
 * Stufen-Urkunde in zwei (ohne Namensschritt, PU.stufenUrkunde).
 *
 *   1  Design wählen     — eine Variante aus drei Gruppen (secondbrain/60_Urkunden)
 *   2  Namen eintragen   — Warnung, zweites Tippen, danach unveränderlich
 *   3  Urkunde & Druck   — gestalten, am eigenen Drucker oder als PDF drucken
 *
 * Name und Prüfcode sind fest (srv/abschluss.php). Die Gestaltung gehört dem
 * Teilnehmer und lässt sich jederzeit ändern — innerhalb der Grenzen der
 * Vorlage. Die Grenzen zeigt diese Datei an; gelten tun sie im Server
 * (srv/urkunden_design.php), der jeden Wert noch einmal klemmt.
 *
 * Die Vorschau ist die echte Druckseite in einem iframe. Regler setzen dort
 * nur CSS-Variablen — dieselbe Seite, die gedruckt wird, nicht eine zweite
 * Zeichnung, die davon abweichen könnte. */
'use strict';

PU.abschlussUrkunde = async function (platz) {
  let a, vorlagen;
  try {
    [a, vorlagen] = await Promise.all([
      PU.ruf('abschluss_stand').then(j => j.abschluss),
      PU.ruf('abschluss_vorlagen')
    ]);
  } catch (e) { platz.innerHTML = '<p class="fehler">' + PU.h(e.message) + '</p>'; return; }

  const z = {
    a: a, gruppen: vorlagen.gruppen, schriften: vorlagen.schriften,
    variante: null,                     // Wahl aus Schritt 1
    platz: platz
  };
  z.art = urkundeArtAbschluss(z);
  urkundeStart(z);
  urkundeStartWunsch(z);
};

/* ------------------------------------------------------------ Art
 *
 * Was sich zwischen Abschluss- und Stufen-Urkunde unterscheidet: Überschrift,
 * Schritte, die Seite zum Ansehen und der Ruf zum Speichern. Alles andere —
 * Galerie, Werkbank, Druck — ist dasselbe. */
function urkundeArtAbschluss(z) {
  return {
    titel: '🎓 Abschluss-Urkunde', stufe: 0,
    schritte: ['Design wählen', 'Namen eintragen', 'Urkunde & Druck'],
    html: 'abschluss_html', speichern: 'abschluss_design_setzen',
    zurueck: () => urkundeStart(z)
  };
}

/**
 * Die Urkunde einer Stufe gestalten und drucken — im Vollbildfenster.
 * Noch nie gestaltet: erst die Galerie, sonst gleich die Werkbank.
 * Der Name ist der Anzeigename und steht fest; einen Namensschritt gibt es
 * hier nicht.
 */
PU.stufenUrkunde = async function (code) {
  let s, vorlagen;
  try {
    [s, vorlagen] = await Promise.all([PU.ruf('stand').then(j => j.stand), PU.ruf('abschluss_vorlagen')]);
  } catch (e) { PU.melden(PU.h(e.message), 'warnung'); return; }
  const u = (s.urkunden || []).find(x => x.pruefcode === code);
  if (!u) { PU.melden('Diese Urkunde gibt es nicht.', 'warnung'); return; }

  const stufe = (PU.stufen || {})[u.stufe] || {};
  const flaeche = PU.modalVollbild('Urkunde Stufe ' + u.stufe + (stufe.name ? ' — ' + stufe.name : ''),
    'Design wählen, anpassen, am eigenen Drucker drucken oder als PDF sichern.');
  if (!flaeche) return;
  const karte = PU.el('div', 'karte abschluss-urkunde');
  flaeche.appendChild(karte);

  const z = {
    a: { urkunden: [u] }, gruppen: vorlagen.gruppen, schriften: vorlagen.schriften,
    variante: (u.design || {}).variante || null, platz: flaeche, karte: karte
  };
  z.art = {
    titel: '📜 Stufe ' + u.stufe + (stufe.name ? ' — ' + stufe.name : ''), stufe: u.stufe,
    schritte: ['Design wählen', 'Urkunde & Druck'],
    html: 'urkunde_html', speichern: 'urkunde_design_setzen',
    zurueck: () => PU.modalSchliessen()
  };
  if (u.design) urkundeSchritt3(z, code);
  else urkundeSchritt1(z);
};

/* Knöpfe `data-stufen-urkunde="<code>"` — in „Dein Stand" und im Ergebnis
   einer Prüfung. Ein Horcher für alle, weil beide Stellen ihr HTML als Text
   setzen. */
document.addEventListener('click', (e) => {
  const b = e.target.closest && e.target.closest('[data-stufen-urkunde]');
  if (!b) return;
  e.preventDefault();
  PU.stufenUrkunde(b.dataset.stufenUrkunde);
});

/* ------------------------------------------------------------ Überblick */
function urkundeStart(z) {
  const a = z.a;
  z.platz.innerHTML = '';
  const k = PU.el('div', 'karte abschluss-urkunde' + (a.faellig ? ' feier' : ''));
  z.karte = k;
  z.platz.appendChild(k);

  let html = '<div class="karte-kopf"><h3>🎓 Abschluss-Urkunde</h3>' +
    '<span class="marke-stufe' + (a.faellig ? ' fertig' : '') + '">' +
    (a.faellig ? 'bereit' : a.stufen.length + ' von ' + a.gesamt) + '</span></div>';

  if (a.urkunden.length) {
    html += '<div class="tabellenrahmen"><table><tr><th>Durchgang</th><th>Prüfcode</th>' +
      '<th>Design</th><th>Ausgestellt</th><th>Gedruckt</th><th></th></tr>';
    a.urkunden.forEach(u => {
      html += '<tr><td>' + u.durchgang + '</td><td><code>' + PU.h(u.pruefcode) + '</code></td>' +
        '<td>' + PU.h(urkundeVarianteName(z, (u.design || {}).variante)) + '</td>' +
        '<td>' + PU.h(u.ausgestellt.substring(0, 10)) + '</td><td>' + u.gedruckt + '×</td><td>' +
        (u.test ? '<span class="marke-stufe">Test</span> ' : '') +
        (u.widerrufen ? '<span class="fehler">✕ widerrufen</span>'
          : '<button class="knopf still klein" data-gestalten="' + PU.h(u.pruefcode) + '">' +
            'Gestalten &amp; drucken</button>') + '</td></tr>';
    });
    html += '</table></div>';
  }

  if (a.faellig) {
    html += '<p><b>' + (a.urkunden.length ? 'Durchgang ' + a.durchgang + ' ist komplett.'
                                          : 'Alle sechs Stufen bestanden.') + '</b> ' +
      'Deine Abschluss-Urkunde entsteht in drei Schritten: Design wählen, Namen eintragen, ' +
      'ansehen und drucken.</p>' +
      (a.test ? '<p class="hinweis-kasten"><b>Testbetrieb:</b> Dieser Durchgang enthält Prüfungen, die ' +
        'zum Testen als bestanden eingetragen wurden. Die Urkunde trägt den Stempel „Testurkunde" ' +
        'und gilt bei der Prüfung des Codes nicht.</p>' : '') +
      '<p><button class="knopf" data-los>Zu Schritt 1: Design wählen</button></p>';
  } else if (!a.urkunden.length) {
    html += '<p class="klein">Wenn alle sechs Stufenprüfungen bestanden sind, stellst du hier ' +
      'deine Abschluss-Urkunde aus — mit deinem echten Vor- und Nachnamen. Noch <b>' +
      (a.gesamt - a.stufen.length) + '</b> von ' + a.gesamt + ' Stufen.</p>';
  } else {
    html += '<p class="klein">Das Design kannst du jederzeit ändern. Der Name ist fest. Eine ' +
      'Urkunde mit einem anderen Namen gibt es nur nach einem neuen, kostenlosen Durchgang: ' +
      'alle sechs Stufenprüfungen noch einmal bestehen. Im laufenden Durchgang ' + a.durchgang +
      ': <b>' + a.stufen.length + ' von ' + a.gesamt + '</b> Stufen.</p>';
  }
  k.innerHTML = html;

  k.querySelectorAll('[data-gestalten]').forEach(b =>
    b.addEventListener('click', () => urkundeSchritt3(z, b.dataset.gestalten)));
  const los = k.querySelector('[data-los]');
  if (los) los.addEventListener('click', () => urkundeSchritt1(z));
}

function urkundeVarianteName(z, id) {
  for (const g of z.gruppen) for (const v of g.varianten) if (v.id === id) return g.name + ' · ' + v.name;
  return '—';
}

function urkundeVariante(z, id) {
  for (const g of z.gruppen) for (const v of g.varianten) if (v.id === id) return v;
  return null;
}

/** Die Schrittleiste über jedem Schritt. `nr` zählt wie bei der
 *  Abschluss-Urkunde (1, 2, 3); ohne Namensschritt wird aus 3 die 2. */
function urkundeKopf(z, nr) {
  const namen = z.art.schritte;
  if (namen.length === 2 && nr === 3) nr = 2;
  return '<ol class="urkunde-schritte">' + namen.map((n, i) =>
    '<li class="' + (i + 1 === nr ? 'jetzt' : (i + 1 < nr ? 'fertig' : '')) + '">' +
    '<span>' + (i + 1 < nr ? '✓' : (i + 1)) + '</span> ' + n + '</li>').join('') + '</ol>';
}

function urkundeMusterUrl(z, id) {
  return 'api.php?aktion=abschluss_muster&variante=' + encodeURIComponent(id) +
    (z.art.stufe ? '&stufe=' + z.art.stufe : '');
}

/* ------------------------------------------------------------ Schritt 1 */
function urkundeSchritt1(z) {
  const k = z.karte;
  let html = '<div class="karte-kopf"><h3>' + z.art.titel + '</h3></div>' + urkundeKopf(z, 1) +
    '<p>Wähle, wie deine Urkunde aussehen soll. Schrift, Grösse und Abstände passt du im ' +
    'nächsten Schritt noch an — und du kannst das Design auch später jederzeit wechseln.</p>';

  z.gruppen.forEach(g => {
    if (!g.varianten.length) return;
    html += '<h4>' + PU.h(g.name) + '</h4><div class="urkunde-galerie">';
    g.varianten.forEach(v => {
      html += '<button type="button" class="urkunde-muster' + (z.variante === v.id ? ' gewaehlt' : '') +
        '" data-variante="' + PU.h(v.id) + '" aria-pressed="' + (z.variante === v.id) + '">' +
        '<iframe loading="lazy" tabindex="-1" title="Muster ' + PU.h(v.name) + '" src="' +
        urkundeMusterUrl(z, v.id) + '"></iframe>' +
        '<span class="muster-name">' + PU.h(v.name) + '</span>' +
        '<span class="klein">' + PU.h(v.beschreibung) + '</span></button>';
    });
    html += '</div>';
  });

  html += '<p class="urkunde-fuss"><button class="knopf still" data-zurueck>Abbrechen</button> ' +
    '<button class="knopf" data-weiter' + (z.variante ? '' : ' disabled') + '>Weiter zu Schritt 2</button></p>';
  // Stufen-Urkunde: kein Namensschritt — die Wahl wird gespeichert, dann
  // geht es gleich an die Werkbank.
  k.innerHTML = html;

  k.querySelectorAll('[data-variante]').forEach(b => b.addEventListener('click', () => {
    z.variante = b.dataset.variante;
    k.querySelectorAll('[data-variante]').forEach(x => {
      x.classList.toggle('gewaehlt', x === b);
      x.setAttribute('aria-pressed', String(x === b));
    });
    k.querySelector('[data-weiter]').disabled = false;
  }));
  k.querySelector('[data-zurueck]').addEventListener('click', () => z.art.zurueck());
  k.querySelector('[data-weiter]').addEventListener('click', async () => {
    if (z.art.stufe === 0) { urkundeSchritt2(z); return; }
    const u = z.a.urkunden[0];
    try {
      u.design = (await PU.ruf(z.art.speichern, { code: u.pruefcode, variante: z.variante, design: {} })).design;
      urkundeSchritt3(z, u.pruefcode);
    } catch (e) { PU.melden(PU.h(e.message), 'warnung'); }
  });
}

/* ------------------------------------------------------------ Schritt 2 */
/**
 * Zwei Stufen, mit Absicht: erst den Namen eintragen, dann ihn so sehen, wie
 * er auf der Urkunde steht, und ein zweites Mal tippen. Der Name lässt sich
 * danach nicht mehr ändern — eine Rückfrage, die man wegklickt, reicht dafür
 * nicht. Der Server prüft die zweite Eingabe noch einmal.
 */
function urkundeSchritt2(z) {
  const k = z.karte;
  const a = z.a;
  k.innerHTML =
    '<div class="karte-kopf"><h3>' + z.art.titel + '</h3></div>' + urkundeKopf(z, 2) +
    '<p>Design: <b>' + PU.h(urkundeVarianteName(z, z.variante)) + '</b> ' +
    '<button class="knopf still klein" data-zurueck>ändern</button></p>' +

    '<div class="hinweis-kasten"><b>⚠ Vorsicht:</b> Trage deinen <b>echten</b> Vor- und Nachnamen ' +
    'ein. Er lässt sich nach dem Ausstellen <b>nicht mehr ändern</b>. Es zählt der Name, der beim ' +
    'Ausstellen eingetragen ist; er wird fest mit deinem Konto-Hash versiegelt und erscheint bei ' +
    'jedem weiteren Abruf und Druck genau so. Prüfe Schreibweise, Umlaute und Bindestriche. ' +
    'Ein anderer Name ist erst nach einem weiteren kompletten Durchgang der Stufen 1 bis 6 ' +
    'möglich. Für einen falsch eingetragenen Namen kann die Academy nichts nachträglich ändern.</div>' +

    '<div class="feldpaar">' +
      '<label>Vorname<input name="vorname" autocomplete="given-name" maxlength="60"></label>' +
      '<label>Nachname<input name="nachname" autocomplete="family-name" maxlength="60"></label>' +
    '</div>' +
    '<p><button class="knopf" data-schritt="weiter">Weiter zur Kontrolle</button></p>' +

    '<div class="abschluss-kontrolle" hidden>' +
      '<p>So steht es auf der Urkunde:</p><p class="abschluss-name"></p>' +
      '<label>Zur Bestätigung den vollständigen Namen noch einmal eintragen' +
        '<input name="bestaetigung" autocomplete="off"></label>' +
      '<label class="klein"><input type="checkbox" name="sicher"> Ich habe den Namen geprüft. ' +
        'Mir ist klar, dass er sich danach nicht mehr ändern lässt.</label>' +
      '<p><button class="knopf" data-schritt="ausstellen" disabled>Urkunde endgültig ausstellen</button> ' +
      '<button class="knopf still" data-schritt="zurueck">Namen ändern</button></p>' +
    '</div>' +

    '<details class="klein"><summary>Datenschutz — wer den Namen sieht</summary>' +
      '<p>Die Urkunde entsteht auf diesem Rechner, ohne Sprachmodell und ohne Server. Der Name ' +
      'wird verschlüsselt gespeichert und kryptografisch mit deinem Konto verbunden. Weder die ' +
      'Academy-Leitung noch ein Administrator noch ein Sprachmodell ist an der Erstellung oder an ' +
      'der Verarbeitung deines Namens beteiligt. Wer den Prüfcode prüft, erfährt keinen Namen — ' +
      'nur Datum, Durchgang, Konto-Hash und Siegel.</p>' +
      '<p>An die Academy gemeldet werden nur Prüfcode, Durchgang, gewähltes Design und wann die ' +
      'Urkunde ausgestellt, umgestaltet oder gedruckt wurde — nie der Name.</p>' +
      '<p>Erneut öffnen und drucken können die Urkunde nur du selbst und — je nach Registrierung — ' +
      'deine Schule, deine Lehrkraft oder deine Eltern für die Kinderkonten, die sie freigeschaltet ' +
      'haben. Auch dann erscheint immer derselbe, versiegelte Name.</p>' +
    '</details>';

  const feld = n => k.querySelector('[name="' + n + '"]');
  const knopf = n => k.querySelector('[data-schritt="' + n + '"]');
  const kontrolle = k.querySelector('.abschluss-kontrolle');
  const norm = t => t.replace(/\s+/g, ' ').trim();
  const voll = () => norm(feld('vorname').value) + ' ' + norm(feld('nachname').value);

  feld('vorname').value  = a.vorschlag.vorname || '';
  feld('nachname').value = a.vorschlag.nachname || '';

  const pruefen = () => {
    knopf('ausstellen').disabled = !(feld('sicher').checked && norm(feld('bestaetigung').value) === voll());
  };
  feld('bestaetigung').addEventListener('input', pruefen);
  feld('sicher').addEventListener('change', pruefen);
  k.querySelector('[data-zurueck]').addEventListener('click', () => urkundeSchritt1(z));

  knopf('weiter').addEventListener('click', () => {
    if (!norm(feld('vorname').value) || !norm(feld('nachname').value)) {
      PU.melden('Bitte Vor- und Nachname eintragen.', 'warnung');
      return;
    }
    k.querySelector('.abschluss-name').textContent = voll();
    feld('vorname').disabled = feld('nachname').disabled = true;
    knopf('weiter').hidden = true;
    feld('bestaetigung').value = '';
    feld('sicher').checked = false;
    kontrolle.hidden = false;
    pruefen();
    feld('bestaetigung').focus();
  });

  knopf('zurueck').addEventListener('click', () => {
    feld('vorname').disabled = feld('nachname').disabled = false;
    knopf('weiter').hidden = false;
    kontrolle.hidden = true;
  });

  knopf('ausstellen').addEventListener('click', async () => {
    knopf('ausstellen').disabled = true;
    try {
      const u = (await PU.ruf('abschluss_ausstellen', {
        vorname: feld('vorname').value, nachname: feld('nachname').value,
        bestaetigung: feld('bestaetigung').value, variante: z.variante
      })).urkunde;
      PU.melden('🎓 Abschluss-Urkunde ausgestellt: ' + PU.h(u.pruefcode), 'gold');
      z.a = (await PU.ruf('abschluss_stand')).abschluss;
      urkundeSchritt3(z, u.pruefcode);
    } catch (e) {
      PU.melden(PU.h(e.message), 'warnung');
      pruefen();
    }
  });
}

/* ------------------------------------------------------------ Schritt 3 */
/**
 * Ansehen, gestalten, drucken. Die Regler zeigen nur, was die Vorlage
 * erlaubt: das grosse Wort „Urkunde" (Schrift, Schreibweise, Grösse,
 * Sperrung), den eigenen Namen (Schrift, Grösse) und die Luft zwischen den
 * Zeilen. Der Textbereich selbst ist fest — so rutscht nichts ins Motiv.
 */
function urkundeSchritt3(z, code) {
  const u = z.a.urkunden.find(x => x.pruefcode === code);
  if (!u) { z.art.zurueck(); return; }
  const k = z.karte;

  // Gespeicherter Stand — und ein Arbeitsstand, der erst beim Speichern
  // oder Drucken zum Server geht.
  let v = urkundeVariante(z, (u.design || {}).variante) || z.gruppen.flatMap(g => g.varianten)[0];
  let d = Object.assign({}, v.vorgabe, u.design || {});
  let geaendert = false;

  const optGruppen = z.gruppen.map(g => '<optgroup label="' + PU.h(g.name) + '">' +
    g.varianten.map(x => '<option value="' + PU.h(x.id) + '">' + PU.h(x.name) + '</option>').join('') +
    '</optgroup>').join('');

  k.innerHTML =
    '<div class="karte-kopf"><h3>' + z.art.titel + ' <code>' + PU.h(code) + '</code></h3></div>' +
    urkundeKopf(z, 3) +
    '<div class="urkunde-werkbank">' +
      '<div class="urkunde-regler">' +
        '<label>Design<select data-feld="variante">' + optGruppen + '</select></label>' +
        '<fieldset data-titelregler><legend>Das Wort „Urkunde"</legend>' +
          '<label>Schrift<select data-feld="titel_schrift"></select></label>' +
          '<label>Schreibweise<select data-feld="titel_schreibweise">' +
            '<option value="normal">Urkunde</option><option value="gross">URKUNDE</option></select></label>' +
          urkundeRegler('titel_groesse', 'Grösse', 'pt', 0.5) +
          urkundeRegler('titel_sperrung', 'Buchstabenabstand', 'em', 0.01) +
        '</fieldset>' +
        '<fieldset><legend>Dein Name</legend>' +
          '<label>Schrift<select data-feld="name_schrift"></select></label>' +
          urkundeRegler('name_groesse', 'Grösse', 'pt', 0.5) +
        '</fieldset>' +
        '<fieldset><legend>Luft</legend>' +
          urkundeRegler('abstand', 'Abstand der Blöcke', '×', 0.05) +
          urkundeRegler('zeilenabstand', 'Zeilenabstand', '', 0.05) +
        '</fieldset>' +
        '<p class="urkunde-knoepfe">' +
          '<button class="knopf" data-tun="drucken">🖨 Drucken / als PDF</button> ' +
          '<button class="knopf still" data-tun="speichern">Speichern</button> ' +
          '<button class="knopf still" data-tun="vorgabe">Vorgabe</button></p>' +
        '<p class="klein">Beim Drucken im Dialog „Als PDF speichern" wählen, um eine PDF zu ' +
          'bekommen. A4 hoch, Ränder: keine bzw. Standard, „Hintergrundgrafiken" an.</p>' +
        '<p class="klein"><a target="_blank" rel="noopener" href="api.php?aktion=' + z.art.html + '&code=' +
          encodeURIComponent(code) + '">In eigenem Fenster öffnen</a> · ' +
          '<button class="knopf still klein" data-tun="zurueck">' +
            (z.art.stufe ? 'Schliessen' : 'Zur Übersicht') + '</button></p>' +
      '</div>' +
      '<div class="urkunde-vorschau"><iframe title="Vorschau der Urkunde"></iframe></div>' +
    '</div>';

  const feld = n => k.querySelector('[data-feld="' + n + '"]');
  const iframe = k.querySelector('.urkunde-vorschau iframe');

  /* Füllt Schriftlisten und Regler aus der gewählten Variante. */
  function vorlageAnlegen() {
    feld('variante').value = v.id;
    // Steht das Wort schon im Bild, gibt es daran nichts einzustellen.
    k.querySelector('[data-titelregler]').hidden = !!v.titel_im_bild;
    [['titel_schrift', v.schriften_titel], ['name_schrift', v.schriften_name]].forEach(([n, ids]) => {
      feld(n).innerHTML = ids.map(id => {
        const s = z.schriften.find(x => x.id === id);
        return '<option value="' + id + '" style="font-family:' + PU.h(s.stapel) + '">' +
          PU.h(s.name) + '</option>';
      }).join('');
    });
    ['titel_groesse', 'titel_sperrung', 'name_groesse', 'abstand', 'zeilenabstand'].forEach(n => {
      const r = feld(n);
      r.min = v.grenzen[n][0];
      r.max = v.grenzen[n][1];
    });
    d = klemmen(d);
    werteSetzen();
  }

  /* Dieselbe Klemme wie im Server — nur damit die Regler nicht lügen. */
  function klemmen(w) {
    const aus = Object.assign({}, w);
    ['titel_groesse', 'titel_sperrung', 'name_groesse', 'abstand', 'zeilenabstand'].forEach(n => {
      const x = Number(aus[n]);
      aus[n] = isFinite(x) ? Math.min(v.grenzen[n][1], Math.max(v.grenzen[n][0], x)) : v.vorgabe[n];
    });
    if (v.schriften_titel.indexOf(aus.titel_schrift) < 0) aus.titel_schrift = v.vorgabe.titel_schrift;
    if (v.schriften_name.indexOf(aus.name_schrift) < 0)   aus.name_schrift  = v.vorgabe.name_schrift;
    if (['gross', 'normal'].indexOf(aus.titel_schreibweise) < 0) aus.titel_schreibweise = v.vorgabe.titel_schreibweise;
    return aus;
  }

  function werteSetzen() {
    ['titel_schrift', 'titel_schreibweise', 'name_schrift', 'titel_groesse', 'titel_sperrung',
     'name_groesse', 'abstand', 'zeilenabstand'].forEach(n => { feld(n).value = d[n]; });
    k.querySelectorAll('[data-wert]').forEach(o => {
      const n = o.dataset.wert;
      o.textContent = Number(d[n]).toFixed(n === 'titel_sperrung' ? 2 : (n.endsWith('groesse') ? 1 : 2));
    });
  }

  /* Setzt die Werte in die Vorschau — ohne Neuladen. */
  function vorschauSetzen() {
    const doc = iframe.contentDocument;
    if (!doc || !doc.documentElement) return;
    const st = doc.documentElement.style;
    const schrift = id => z.schriften.find(x => x.id === id);
    st.setProperty('--titel-schrift', schrift(d.titel_schrift).stapel);
    st.setProperty('--titel-stil', schrift(d.titel_schrift).kursiv ? 'italic' : 'normal');
    st.setProperty('--titel-groesse', d.titel_groesse + 'pt');
    st.setProperty('--titel-sperrung', d.titel_sperrung + 'em');
    st.setProperty('--name-schrift', schrift(d.name_schrift).stapel);
    st.setProperty('--name-stil', schrift(d.name_schrift).kursiv ? 'italic' : 'normal');
    st.setProperty('--name-groesse', d.name_groesse + 'pt');
    st.setProperty('--abstand', String(d.abstand));
    st.setProperty('--zeilenabstand', String(d.zeilenabstand));
    const titel = doc.querySelector('.titel');
    if (titel) titel.textContent = d.titel_schreibweise === 'gross' ? 'URKUNDE' : 'Urkunde';
  }

  function vorschauLaden() {
    iframe.onload = vorschauSetzen;
    iframe.src = 'api.php?aktion=' + z.art.html + '&code=' + encodeURIComponent(code) + '&t=' + Date.now();
  }

  async function speichern() {
    const j = await PU.ruf(z.art.speichern, { code: code, variante: v.id, design: d });
    d = Object.assign({}, j.design);
    u.design = j.design;
    geaendert = false;
    werteSetzen();
    return j.design;
  }

  k.querySelectorAll('.urkunde-regler select, .urkunde-regler input[type="range"]').forEach(el => {
    el.addEventListener('input', async () => {
      const n = el.dataset.feld;
      if (n === 'variante') {
        // Eine andere Vorlage hat andere Grenzen, Farben und Bilder — die
        // Seite kommt deshalb neu vom Server, mit der Wahl gespeichert.
        v = urkundeVariante(z, el.value);
        d = Object.assign({}, v.vorgabe);
        vorlageAnlegen();
        try { await speichern(); vorschauLaden(); }
        catch (e) { PU.melden(PU.h(e.message), 'warnung'); }
        return;
      }
      d[n] = el.type === 'range' ? Number(el.value) : el.value;
      d = klemmen(d);
      geaendert = true;
      werteSetzen();
      vorschauSetzen();
    });
  });

  k.querySelector('[data-tun="speichern"]').addEventListener('click', async () => {
    try { await speichern(); PU.melden('Gestaltung gespeichert.', 'gut'); }
    catch (e) { PU.melden(PU.h(e.message), 'warnung'); }
  });
  k.querySelector('[data-tun="vorgabe"]').addEventListener('click', () => {
    d = Object.assign({}, v.vorgabe);
    geaendert = true;
    werteSetzen();
    vorschauSetzen();
  });
  k.querySelector('[data-tun="drucken"]').addEventListener('click', async () => {
    try {
      // Erst speichern, damit auch ein späterer Nachdruck (Schule, Eltern)
      // genau so aussieht. Der Druck selbst wird in der Seite gezählt.
      if (geaendert) await speichern();
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch (e) { PU.melden(PU.h(e.message), 'warnung'); }
  });
  k.querySelector('[data-tun="zurueck"]').addEventListener('click', () => {
    if (geaendert && !confirm('Die Änderungen sind noch nicht gespeichert. Trotzdem zurück?')) return;
    z.art.zurueck();
  });

  vorlageAnlegen();
  vorschauLaden();
}

function urkundeRegler(n, text, einheit, schritt) {
  return '<label>' + text + ' <output data-wert="' + n + '"></output> ' + einheit +
    '<input type="range" data-feld="' + n + '" step="' + schritt + '"></label>';
}

/* ============================================================ Generator starten
 *
 * Von überall erreichbar (Einstellungen → Urkunden, Testbetrieb): Ein Merker
 * in der Sitzung sagt der Karte unter „Dein Stand", dass sie gleich aufgehen
 * soll — auch über ein Neuladen hinweg (Rollenübernahme). */
PU.urkundeStarten = function () {
  try { sessionStorage.setItem('pu_urkunde_start', '1'); } catch (e) { /* ohne Speicher: Karte bleibt zu */ }
  if (PU.einstellungenSchliessen) PU.einstellungenSchliessen();
  if (location.hash === '#/fortschritt') PU.fortschrittZeichnen();
  else location.hash = '#/fortschritt';
};

function urkundeStartWunsch(z) {
  let wunsch = false;
  try { wunsch = sessionStorage.getItem('pu_urkunde_start') === '1'; sessionStorage.removeItem('pu_urkunde_start'); }
  catch (e) { wunsch = false; }
  if (!wunsch) return;
  if (z.a.faellig) urkundeSchritt1(z);
  setTimeout(() => z.karte.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
}

/* ============================================================ Einstellungen → Urkunden
 *
 * Für jeden: der eigene Stand und der Knopf zum Generator. Für Schule,
 * Lehrkraft und Eltern (urkunde.nachdrucken): die Urkunden im eigenen
 * Bereich, ohne echte Namen. Für die Verwaltung (urkunde.ausstellen):
 * Sicherheit — Schlüssel, Postausgang ans Cockpit — und der Testbetrieb, mit
 * dem sich jedes Konto bis zur Urkunde führen lässt. */
PU.urkundenEinstZeichnen = async function (ziel) {
  ziel.innerHTML = '<p class="leer-hinweis">Lade Urkunden …</p>';
  let u;
  try { u = (await PU.ruf('urkunden_uebersicht')).uebersicht; }
  catch (e) { ziel.innerHTML = '<p class="fehler">' + PU.h(e.message) + '</p>'; return; }

  const ebeneName = e => ({ admin: 'Admin', verwaltung: 'Verwaltung', lehrer: 'Lehrer',
                            eltern: 'Eltern', schueler: 'Schüler' })[e] || e;
  const e = u.eigen;
  let html = '<h3>🎓 Urkunden</h3>' +
    '<p class="hinweis">Die Abschluss-Urkunde nach allen sechs Stufen: Design wählen, echten Namen ' +
    'eintragen, drucken. Name und Prüfcode sind versiegelt, das Design gehört der Person, die ' +
    'die Urkunde erworben hat.</p>' +

    '<div class="einst-block"><h4>Deine Urkunde</h4><p>' +
    (e.urkunden ? 'Du hast <b>' + e.urkunden + '</b> Abschluss-Urkunde' + (e.urkunden > 1 ? 'n' : '') + '. ' : '') +
    (e.faellig ? '<b>Alle sechs Stufen sind bestanden — die Urkunde ist bereit.</b>'
               : 'Stufen im laufenden Durchgang: <b>' + e.stufen + ' von ' + e.gesamt + '</b>.') +
    '</p><p><button class="knopf" data-tun="starten">🎓 Urkundengenerator starten</button></p></div>';

  if (u.nachdrucken || u.verwalten) {
    html += '<div class="einst-block"><h4>Urkunden in deinem Bereich</h4>';
    if (!u.umkreis.length) {
      html += '<p class="klein">Noch keine. Hier erscheinen die Abschluss-Urkunden deiner Schüler ' +
        'bzw. Kinder — zum erneuten Drucken, immer mit dem versiegelten Namen.</p>';
    } else {
      html += '<div class="tabellenrahmen"><table><tr><th>Konto</th><th>Ebene</th><th>Durchgang</th>' +
        '<th>Prüfcode</th><th>Gedruckt</th><th>Stand</th><th></th></tr>';
      u.umkreis.forEach(x => {
        const stand = x.widerrufen ? '<span class="fehler">✕ widerrufen</span>'
          : (x.test ? '<span class="marke-stufe">Test</span>' : '<span class="gut">✓ gültig</span>');
        html += '<tr><td>' + PU.h(x.wer) + '</td><td>' + PU.h(ebeneName(x.ebene)) + '</td>' +
          '<td>' + x.durchgang + '</td><td><code>' + PU.h(x.pruefcode) + '</code></td>' +
          '<td>' + x.gedruckt + '×</td><td>' + stand + '</td><td>' +
          '<a target="_blank" rel="noopener" href="api.php?aktion=abschluss_html&code=' +
            encodeURIComponent(x.pruefcode) + '">öffnen / drucken</a>' +
          (u.verwalten && !x.widerrufen
            ? ' · <button class="knopf still klein" data-widerruf="' + PU.h(x.pruefcode) + '">widerrufen</button>' : '') +
          '</td></tr>';
      });
      html += '</table></div>';
    }
    html += '</div>';
  }

  if (u.verwalten && u.sicherheit) {
    const s = u.sicherheit;
    html += '<div class="einst-block"><h4>Sicherheit</h4><ul class="klein urkunde-sicherheit">' +
      '<li>' + (s.schluessel_da ? '✓' : '○') + ' Urkundenschlüssel <code>' + PU.h(s.schluessel_ort) + '</code> ' +
        (s.schluessel_da ? 'ist angelegt. <b>Gehört in jede Sicherung</b> — ohne ihn sind die ' +
          'eingetragenen Namen nicht mehr lesbar.'
          : 'entsteht mit der ersten Abschluss-Urkunde.') + '</li>' +
      '<li>✓ Namen liegen nur verschlüsselt vor. Die Prüfung eines Codes nennt keinen Namen.</li>' +
      '<li>' + (s.registriert ? '✓' : '○') + ' Rückmeldung ans Cockpit (Code, Ereignis, Design, Zeit — ohne Name): ' +
        '<b>' + s.offen + '</b> offen, <b>' + s.gesendet + '</b> gesendet' +
        (s.zuletzt ? ', zuletzt ' + PU.h(s.zuletzt.substring(0, 16)) : '') +
        (s.registriert ? '. Geht beim nächsten Abgleich mit (Cockpit → Stand holen).'
                       : '. Diese Installation ist nicht registriert — die Meldungen bleiben hier.') + '</li>' +
      '<li>Urkunden auf diesem Rechner: <b>' + s.urkunden + '</b>, davon ' + s.test + ' Test, ' +
        s.widerrufen + ' widerrufen.</li>' +
      '</ul></div>';

    html += '<div class="einst-block"><h4>Testbetrieb</h4>' +
      '<label class="urkunde-testschalter"><input type="checkbox" class="schalter" data-tun="testbetrieb"' +
        (u.testbetrieb ? ' checked' : '') + '> Konten zum Testen bis zur Urkunde führen</label>' +
      '<p class="klein">Für Testrechner. Ein Knopf trägt für ein Konto alle sechs Stufenprüfungen als ' +
        'bestanden ein — gekennzeichnet als Test. Jede Urkunde daraus trägt den Stempel ' +
        '„Testurkunde", die Prüfung des Codes nennt sie ungültig, und das Cockpit zählt sie nicht mit. ' +
        'Echte Prüfungen und echte Urkunden fasst der Testbetrieb nicht an. Danach lässt sich der ' +
        '7. Kurs als fertig markieren — dann geht im Menü die Werkstatt auf. Diese Markierung gilt ' +
        'nur, solange der Testbetrieb an ist.</p>';

    if (u.testbetrieb) {
      html += '<div class="tabellenrahmen"><table><tr><th>Konto</th><th>Ebene</th><th>Stufen</th>' +
        '<th>Urkunden</th><th>7. Kurs</th><th></th></tr>';
      u.konten.forEach(k => {
        html += '<tr><td>' + PU.h(k.name) + (k.ich ? ' <span class="klein">(du)</span>' : '') +
          '<br><span class="klein"><code>' + PU.h(k.kennung) + '</code></span></td>' +
          '<td>' + PU.h(ebeneName(k.ebene)) + '</td>' +
          '<td>' + k.stufen + ' / 6' + (k.faellig ? ' <span class="gut">✓</span>' : '') + '</td>' +
          '<td>' + k.urkunden + (k.testurkunden ? ' (' + k.testurkunden + ' Test)' : '') + '</td>' +
          // Der nächste Schritt nach der Urkunde: den 7. Kurs als fertig
          // markieren, damit der Menüpunkt „Werkstatt" aufgeht. Erst nach
          // den sechs Stufen — die Reihenfolge gilt auch im Test.
          '<td>' + (k.kurs7_test
            ? '<span class="gut">✓ Test</span> <button class="knopf still klein" data-kurs7="' + k.id +
              '" data-an="0">zurücknehmen</button>'
            : (k.alle_stufen
              ? '<button class="knopf klein" data-kurs7="' + k.id + '" data-an="1">7. Kurs fertig (Test)</button>'
              : '<span class="klein">erst die Stufen</span>')) + '</td><td>' +
          (!k.faellig ? '<button class="knopf klein" data-bestehen="' + k.id + '">Kurs bestanden (Test)</button> ' : '') +
          (k.test || k.testurkunden
            ? '<button class="knopf still klein" data-zuruecksetzen="' + k.id + '">Test zurücksetzen</button> ' : '') +
          (k.ich ? '<button class="knopf still klein" data-tun="starten">Generator öffnen</button>'
                 : (PU.darf('rollen.uebernehmen')
                    ? '<button class="knopf still klein" data-oeffnen="' + k.id + '">Als dieses Konto öffnen</button>'
                    : '')) +
          '</td></tr>';
      });
      html += '</table></div>' +
        '<p class="klein">Ohne „Als dieses Konto öffnen" (nur Ebene 1): mit dem Konto anmelden — das ' +
        'Kennwort lässt sich unter „Konten" zurücksetzen. Während einer Übernahme entsteht nur eine ' +
        'Testurkunde, nie eine echte.</p>';
    }
    html += '</div>';
  }

  ziel.innerHTML = html;

  ziel.querySelectorAll('[data-tun="starten"]').forEach(b => b.addEventListener('click', PU.urkundeStarten));

  ziel.querySelectorAll('[data-widerruf]').forEach(b => b.addEventListener('click', async () => {
    if (!confirm('Urkunde ' + b.dataset.widerruf + ' widerrufen?\n\nSie bleibt gespeichert, gilt aber ' +
                 'nicht mehr. Der Durchgang bleibt verbraucht.')) return;
    try { await PU.ruf('urkunde_widerrufen', { code: b.dataset.widerruf }); PU.urkundenEinstZeichnen(ziel); }
    catch (e) { PU.melden(PU.h(e.message), 'warnung'); }
  }));

  const schalter = ziel.querySelector('[data-tun="testbetrieb"]');
  if (schalter) schalter.addEventListener('change', async () => {
    try { await PU.ruf('urkunden_testbetrieb', { an: schalter.checked }); PU.urkundenEinstZeichnen(ziel); }
    catch (e) { PU.melden(PU.h(e.message), 'warnung'); schalter.checked = !schalter.checked; }
  });

  ziel.querySelectorAll('[data-bestehen]').forEach(b => b.addEventListener('click', async () => {
    try {
      await PU.ruf('urkunden_test_bestehen', { lernender: Number(b.dataset.bestehen) });
      PU.melden('Alle sechs Stufen als bestanden eingetragen (Test).', 'gut');
      PU.urkundenEinstZeichnen(ziel);
      if (PU.menueWegLaden) PU.menueWegLaden(true);
    } catch (e) { PU.melden(PU.h(e.message), 'warnung'); }
  }));

  ziel.querySelectorAll('[data-kurs7]').forEach(b => b.addEventListener('click', async () => {
    const an = b.dataset.an === '1';
    try {
      await PU.ruf('urkunden_test_kurs7', { lernender: Number(b.dataset.kurs7), an: an });
      PU.melden(an ? '7. Kurs als fertig markiert (Test) — die Werkstatt ist für dieses Konto frei.'
                   : 'Markierung zurückgenommen — die Werkstatt ist wieder gesperrt.', 'gut');
      PU.urkundenEinstZeichnen(ziel);
      if (PU.menueWegLaden) PU.menueWegLaden(true);
    } catch (e) { PU.melden(PU.h(e.message), 'warnung'); }
  }));

  ziel.querySelectorAll('[data-zuruecksetzen]').forEach(b => b.addEventListener('click', async () => {
    if (!confirm('Test-Prüfungen und Testurkunden dieses Kontos entfernen?\n\nEchte Prüfungen und ' +
                 'echte Urkunden bleiben.')) return;
    try {
      const j = await PU.ruf('urkunden_test_zuruecksetzen', { lernender: Number(b.dataset.zuruecksetzen) });
      PU.melden(j.entfernt.pruefungen + ' Test-Prüfungen und ' + j.entfernt.urkunden +
                ' Testurkunden entfernt.', 'gut');
      PU.urkundenEinstZeichnen(ziel);
      if (PU.menueWegLaden) PU.menueWegLaden(true);
    } catch (e) { PU.melden(PU.h(e.message), 'warnung'); }
  }));

  ziel.querySelectorAll('[data-oeffnen]').forEach(b => b.addEventListener('click', async () => {
    if (!confirm('Dieses Konto übernehmen und den Urkundengenerator öffnen?\n\nDu handelst danach ' +
                 'als dieses Konto; es steht mit beiden Namen im Protokoll. Oben erscheint ein Band ' +
                 'für den Rückweg.')) return;
    try {
      await PU.ruf('rolle_uebernehmen', { lernender: Number(b.dataset.oeffnen) });
      try { sessionStorage.setItem('pu_urkunde_start', '1'); } catch (e) { /* Karte bleibt zu */ }
      location.href = 'index.php#/fortschritt';
    } catch (e) { PU.melden(PU.h(e.message), 'warnung'); }
  }));
};
