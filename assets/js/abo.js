/* PROMPTHEUS — Das Cockpit: Plan, Token, Verbrauch.
 *
 * Die Finanzzentrale. Sie beantwortet drei Fragen, die sonst niemand
 * beantworten kann: **Welchen Plan habe ich, wann wird wieder gezahlt, und
 * wo gehen die Token hin?**
 *
 * Der letzte Teil ist der Grund, warum es diese Seite gibt. Jeder Tutor-Aufruf
 * kostet Geld, und bisher sah das niemand — weder der Betreiber noch die
 * Schule, die es bezahlt. Jetzt steht es hier, mit Modellnamen und Datum.
 *
 * **Zahlen, die geschätzt sind, sagen das.** Über OpenRouter kommt die
 * tatsächlich abgerechnete Tokenzahl zurück; die steht ohne Zusatz da. Beim
 * Claude-CLI-Weg und bei Sprachnachrichten wird gerechnet, und dann steht
 * „geschätzt" daneben. Eine Zahl, die sich genauer gibt als sie ist, ist
 * schlimmer als gar keine.
 *
 * **Hier wird nichts bezahlt.** „Buchen" und „Vormerken" schreiben eine
 * Buchung, die auf einen Haken von Ebene 1 wartet. Das steht auch überall
 * dran — ein Knopf, der aussieht wie „Kaufen", aber nur vormerkt, ist eine
 * Falle.
 */
'use strict';

PU.cockpitStand = null;

PU.cockpitZeichnen = async function () {
  const ziel = document.getElementById('view-cockpit');
  if (!ziel) return;

  ziel.innerHTML = '<p class="leer-hinweis">Lade Cockpit …</p>';

  try {
    PU.cockpitStand = await PU.ruf('cockpit');
  } catch (e) {
    ziel.innerHTML = '<p class="fehler">' + PU.h(e.message) + '</p>';
    return;
  }
  cockpitMalen(ziel);
};

function cockpitMalen(ziel) {
  const d = PU.cockpitStand;
  ziel.innerHTML = '';

  ziel.appendChild(PU.el('h1', '', 'Cockpit'));
  ziel.appendChild(PU.el('p', 'hinweis',
    'Plan, Guthaben und Verbrauch. Bezahlt wird hier nichts — gebucht schon: ' +
    'jede Buchung wartet auf die Bestätigung durch die Academy-Leitung.'));

  const gitter = PU.el('div', 'cockpit-gitter');
  gitter.appendChild(planKasten(d));
  gitter.appendChild(tokenKasten(d));
  ziel.appendChild(gitter);

  ziel.appendChild(serverKasten());
  ziel.appendChild(verbrauchKasten(d));
  ziel.appendChild(buchungenKasten(d));

  if (d.darf_einzahlen) ziel.appendChild(nachlegenKasten(d));
  if (d.darf_senden)    ziel.appendChild(talentKasten(d));
  if (d.darf_buchen)    ziel.appendChild(verwaltungKasten(d));
}

/* -------------------------------------------------------- Talente weitergeben
 *
 * Der Kasten erscheint nur, wenn dieses Konto das Recht `talente.senden` hat
 * UND jemanden unter sich — beides wird auf dem Server entschieden, nicht
 * hier. Eine Oberfläche, die selbst rechnet, wer unter wem steht, hätte die
 * Kette ein zweites Mal, und die zweite wäre irgendwann die falsche.
 *
 * **Die Empfängerliste wird nachgeladen, nicht mit dem Cockpit geliefert.**
 * Sie ist die einzige Stelle, die alle Konten der eigenen Schule nennt; wer
 * das Cockpit nur ansieht, braucht sie nicht.
 */
function talentKasten(d) {
  const k = PU.el('section', 'cockpit-block');
  k.appendChild(PU.el('h2', '', 'Talente weitergeben'));
  k.appendChild(PU.el('p', 'hinweis',
    'Talente sind Token. Was du hier überweist, wird <b>dir abgebucht</b> und ' +
    'dem Empfänger sofort gutgeschrieben — auf beiden Seiten mit Eintrag im ' +
    'Journal und im Protokoll. Weitergeben geht die Kette hinunter: an die ' +
    'Ebenen unter dir, in deinem Umkreis. Nicht nach oben und nicht zurück.'));

  const bereich = PU.el('div', 'talent-bereich');
  bereich.innerHTML = '<p class="leer-hinweis">Lade Empfänger …</p>';
  k.appendChild(bereich);

  PU.ruf('talente_ziele').then(j => talentFormular(bereich, j))
    .catch(e => { bereich.innerHTML = '<p class="fehler">' + PU.h(e.message) + '</p>'; });

  return k;
}

function talentFormular(bereich, j) {
  bereich.innerHTML = '';

  if (!j.ziele.length) {
    bereich.appendChild(PU.el('p', 'leer-hinweis',
      'Unter dir steht niemand, an den du Talente weitergeben könntest. ' +
      'Bei einem Elternkonto heisst das: Es ist noch kein Kind verknüpft — ' +
      'das macht die Academy-Leitung unter Konten.'));
    return;
  }

  const zeile = PU.el('div', 'talent-zeile');

  // ---- An wen
  const wahl = document.createElement('select');
  wahl.setAttribute('aria-label', 'Empfänger');
  j.ziele.forEach(z => {
    const o = document.createElement('option');
    o.value = String(z.id);
    // Ebene dazu, weil in einer Schule mehrere gleich heissen können und die
    // Ebene der Unterschied ist, auf den es hier ankommt.
    o.textContent = z.name + ' · ' + z.ebene_anzeige + (z.gruppe ? ' · ' + z.gruppe : '');
    wahl.appendChild(o);
  });

  // ---- Wie viel
  const betrag = document.createElement('input');
  betrag.type = 'number';
  betrag.min = String(j.min);
  betrag.max = String(j.max);
  betrag.step = '100';
  betrag.value = String(j.min);
  betrag.setAttribute('aria-label', 'Talente');

  // ---- Wofür
  const notiz = document.createElement('input');
  notiz.type = 'text';
  notiz.maxLength = 60;
  notiz.placeholder = 'Verwendungszweck (freiwillig)';
  notiz.setAttribute('aria-label', 'Verwendungszweck');

  const knopf = PU.el('button', 'knopf', 'Überweisen');
  knopf.type = 'button';

  zeile.appendChild(wahl);
  zeile.appendChild(betrag);
  zeile.appendChild(notiz);
  zeile.appendChild(knopf);
  bereich.appendChild(zeile);

  /* Was verfügbar ist, steht dabei — und zwar als Zahl, nicht als Gefühl.
     Ebene 1 verbraucht ohne Grenze; dort wäre eine Restanzeige eine
     Behauptung über etwas, das nicht begrenzt ist. */
  bereich.appendChild(PU.el('p', 'warum', j.frei
    ? 'Dein Konto verbraucht ohne Grenze — du kannst verteilen, ohne selbst ' +
      'einzuzahlen. Abgebucht wird trotzdem, damit im Journal steht, woher es kam.'
    : 'Verfügbar: ' + zahl(Math.max(0, j.stand.rest)) + ' Talente. ' +
      'Der Minus-Rahmen zählt nicht dazu — er trägt eine angefangene Lektion ' +
      'über die Ziellinie und ist kein Guthaben zum Verschenken.'));

  const bericht = PU.el('p', 'warum');
  bereich.appendChild(bericht);

  knopf.addEventListener('click', async () => {
    const n = parseInt(betrag.value, 10);
    const z = j.ziele.find(x => String(x.id) === wahl.value);
    if (!z || isNaN(n)) return;

    /* Die Rückfrage nennt Empfänger UND Betrag. Ein „Wirklich?" ohne Zahlen
       ist keine Rückfrage, sondern ein Klick mehr: Man bestätigt, was man
       ohnehin gerade getan zu haben glaubt. */
    if (!confirm(zahl(n) + ' Talente an ' + z.name + ' (' + z.ebene_anzeige + ') überweisen?\n\n' +
                 'Der Betrag wird dir sofort abgebucht und dort gutgeschrieben. ' +
                 'Zurückholen kann es nur der Empfänger, wenn er selbst weitergeben darf.')) return;

    knopf.disabled = true;
    bericht.textContent = 'Überweise …';
    try {
      PU.cockpitStand = await PU.ruf('talente_senden', {
        an: z.id, betrag: n, notiz: notiz.value, sicher: 'ja'
      });
      PU.melden(zahl(n) + ' Talente an <b>' + PU.h(z.name) + '</b> überwiesen.', 'gut');
      cockpitMalen(document.getElementById('view-cockpit'));
    } catch (e) {
      bericht.innerHTML = '<b style="color:var(--schlecht)">' + PU.h(e.message) + '</b>';
      knopf.disabled = false;
    }
  });
}

/* ------------------------------------------------ Server & Registrierung
 *
 * Die Verbindung zur Serverseite (agent0.de/promptheus/relay/). Ohne sie
 * läuft die Academy vollständig — Kurse, Aufgaben, Urkunden bleiben lokal.
 * Mit ihr kommen Tutor und Werkstatt über den Relay, und der Tokenstand, der
 * zählt, steht auf dem Server.
 *
 * **Registriert wird mit dem Code aus der Zahlung.** Dabei entsteht das
 * Schlüsselpaar dieser Installation; der geheime Teil verlässt den Rechner
 * nie. Der Kasten fragt beim Öffnen nicht beim Server nach — erst auf Knopfdruck.
 */
function serverKasten() {
  const k = PU.el('section', 'cockpit-block');
  k.appendChild(PU.el('h2', '', 'Server & Registrierung'));
  const bereich = PU.el('div', 'server-bereich');
  bereich.innerHTML = '<p class="leer-hinweis">Lade Stand …</p>';
  k.appendChild(bereich);
  PU.ruf('relay_zustand').then(j => serverMalen(bereich, j))
    .catch(e => { bereich.innerHTML = '<p class="fehler">' + PU.h(e.message) + '</p>'; });
  return k;
}

function serverMalen(bereich, j) {
  const z = j.zustand || {};
  bereich.innerHTML = '';

  const zeile = (name, wert, ok) =>
    '<tr><th scope="row">' + name + '</th><td>' +
    (ok === true ? '<span class="gut">✓</span> ' : ok === false ? '<span class="schlecht">✕</span> ' : '') +
    wert + '</td></tr>';
  const t = PU.el('table', 'tabelle');
  t.innerHTML = '<tbody>' +
    zeile('Serveradresse', z.adresse ? 'eingetragen'
      : 'fehlt — in der .env eintragen: <code>PU_RELAY_URL=https://agent0.de/promptheus/relay/</code>', !!z.adresse) +
    zeile('Registriert', z.registriert ? '<code>' + PU.h(z.iid) + '</code>' : 'noch nicht', !!z.registriert) +
    zeile('Bescheinigung', z.bescheinigt
      ? (z.gueltig ? 'gültig bis ' + PU.h(datum(z.gueltig_bis)) : 'abgelaufen am ' + PU.h(datum(z.gueltig_bis)))
      : 'keine', z.bescheinigt ? !!z.gueltig : null) +
    (z.plan ? zeile('Plan laut Server', PU.h(z.plan), null) : '') +
    '</tbody>';
  bereich.appendChild(t);

  const bericht = PU.el('p', 'warum');

  // ---- Registrieren (nur mit Recht, nur solange keine gültige Bescheinigung da ist)
  if (j.darf_registrieren && !z.gueltig) {
    const form = PU.el('div', 'talent-zeile');
    const eingabe = document.createElement('input');
    eingabe.type = 'text';
    eingabe.maxLength = 40;
    eingabe.placeholder = 'XXXXX-XXXXX-XXXXX-XXXXX';
    eingabe.setAttribute('aria-label', 'Registrierungscode');
    eingabe.autocomplete = 'off';
    eingabe.spellcheck = false;
    const knopf = PU.el('button', 'knopf', 'Registrieren');
    knopf.type = 'button';
    form.appendChild(eingabe);
    form.appendChild(knopf);
    bereich.appendChild(PU.el('p', 'hinweis',
      'Den Code gibt es nach der Zahlung (per E-Mail oder von der Academy-Leitung). ' +
      'Er gilt 48 Stunden und nur einmal. Gross- und Kleinschreibung spielen keine Rolle.'));
    bereich.appendChild(form);

    knopf.addEventListener('click', async () => {
      const code = eingabe.value.trim();
      if (!code) return;
      knopf.disabled = true;
      bericht.textContent = 'Registriere …';
      try {
        const r = await PU.ruf('relay_registrieren', { code: code });
        if (r.ok) {
          PU.melden('Diese Academy ist beim Server registriert.', 'gut');
          serverMalen(bereich, { zustand: r.zustand, darf_registrieren: j.darf_registrieren });
          return;
        }
        bericht.innerHTML = '<b style="color:var(--schlecht)">' + PU.h(r.meldung || 'Abgewiesen.') + '</b>';
      } catch (e) {
        bericht.innerHTML = '<b style="color:var(--schlecht)">' + PU.h(e.message) + '</b>';
      }
      knopf.disabled = false;
    });
  }

  // ---- Stand holen (fragt den Server, erneuert nebenbei die Bescheinigung)
  if (z.registriert && z.adresse) {
    const knopf = PU.el('button', 'knopf still', 'Stand vom Server holen');
    knopf.type = 'button';
    bereich.appendChild(knopf);
    const stand = PU.el('div', 'server-stand');
    bereich.appendChild(stand);
    knopf.addEventListener('click', async () => {
      knopf.disabled = true;
      bericht.textContent = 'Frage den Server …';
      try {
        const r = await PU.ruf('relay_stand');
        if (!r.ok) {
          bericht.innerHTML = '<b style="color:var(--schlecht)">' + PU.h(r.meldung || 'Abgewiesen.') + '</b>';
        } else {
          const s = r.stand || {};
          const lokal = ((PU.cockpitStand || {}).stand || {}).rest;
          const tarif = s.tarif || null;
          bericht.textContent = 'Stand von ' + datum(r.gezogen_am) + '.';
          stand.innerHTML = '<table class="tabelle"><tbody>' +
            zeile('Token laut Server', PU.h(zahl(s.tokens || 0)) +
              ' <span class="klein">— für die ganze Einrichtung</span>', (s.tokens || 0) > 0) +
            (typeof lokal === 'number'
              ? zeile('Token hier (lokal)', PU.h(zahl(lokal)) + ' <span class="klein">— nur dieses Konto, dieser Rechner</span>', null)
              : '') +
            zeile('Heute verbraucht', PU.h(zahl(s.heute || 0)) +
              (s.tagesdeckel ? ' von ' + PU.h(zahl(s.tagesdeckel)) : ''), null) +
            zeile('Plan', PU.h(s.plan || '—'), null) +
            zeile('Tarif', tarif
              ? PU.h(tarif.name) + ', ' + PU.h(zahl(tarif.kontingent || 0)) + ' Token im Monat'
              : 'keiner — Modelle laufen nicht über den Server', tarif ? true : null) +
            (tarif && (tarif.modelle || []).length
              ? zeile('Modelle über den Server', tarif.modelle.map(m => '<code>' + PU.h(m) + '</code>').join(', '), null)
              : '') +
            '</tbody></table>' +
            '<p class="hinweis">Der Server-Stand steht neben dem lokalen, nicht darüber: ' +
            'lokal steht, was hier verbraucht wurde; massgeblich für Relay, Käufe und Talente ist der Server.</p>';
        }
      } catch (e) {
        bericht.innerHTML = '<b style="color:var(--schlecht)">' + PU.h(e.message) + '</b>';
      }
      knopf.disabled = false;
    });
  }
  bereich.appendChild(bericht);
}

/* ---------------------------------------------------------------- Plan */
function planKasten(d) {
  const k = PU.el('div', 'karte cockpit-kasten');
  const a = d.abo;

  if (!a) {
    k.innerHTML =
      '<div class="karte-kopf"><h3>Dein Plan</h3>' +
      '<span class="marke-stufe geruest">keiner</span></div>' +
      '<p class="klein">Für dieses Konto läuft kein Plan. Die Academy funktioniert ' +
      'trotzdem vollständig — ein Plan regelt, wie viele Zugänge und wie viele ' +
      'Token dazugehören.</p>';
    if (d.darf_buchen) {
      k.appendChild(PU.el('p', 'klein', 'Unten kannst du einen buchen.'));
    }
    return k;
  }

  // Beim Personenplan gibt es keinen Träger ausser dem Konto — dann steht hier
  // ein ganzer Satz und nichts wird angehängt. Vorher wurde der Name auch dort
  // drangeklebt, und zwar ohne Trennzeichen.
  const traeger = a.traeger_art === 'person'
    ? 'für dieses Konto'
    : ({ klasse: 'für die Klasse: ', schule: 'für die Einrichtung: ' }[a.traeger_art] || '')
      + (a.traeger_name || '');

  k.innerHTML =
    '<div class="karte-kopf"><h3>' + PU.h(a.plan_name) + '</h3>' +
    (a.bestaetigt
      ? '<span class="marke-stufe fertig">bestätigt</span>'
      : '<span class="marke-stufe">wartet auf Bestätigung</span>') +
    '</div>' +
    '<p class="klein">' + PU.h(traeger) + '</p>' +
    '<table class="cockpit-tabelle"><tbody>' +
    '<tr><th>Preis</th><td>' + PU.h(a.preis) + ' im Monat</td></tr>' +
    '<tr><th>Läuft seit</th><td>' + PU.h(datum(a.start)) + '</td></tr>' +
    '<tr><th>Nächste Zahlung</th><td>' + PU.h(datum(a.naechste_zahlung)) +
      ' <span class="klein">' + PU.h(inTagen(a.naechste_zahlung)) + '</span></td></tr>' +
    (a.plaetze > 1
      ? '<tr><th>Plätze</th><td>' + a.belegt + ' von ' + a.plaetze + ' belegt</td></tr>'
      : '') +
    '</tbody></table>';

  if (a.plaetze > 1) {
    const anteil = Math.min(100, Math.round(a.belegt * 100 / a.plaetze));
    const balken = PU.el('div', 'balken' + (anteil >= 100 ? ' voll' : ''));
    balken.innerHTML = '<i style="width:' + anteil + '%"></i>';
    k.appendChild(balken);
    if (anteil >= 100) {
      k.appendChild(PU.el('p', 'klein',
        'Der Plan ist voll. Neue Schülerkonten werden abgewiesen, bis ein Platz ' +
        'frei wird oder der Plan wechselt — wer drin ist, bleibt drin.'));
    }
  }

  if (!a.bestaetigt) {
    const w = PU.el('div', 'hinweis-kasten');
    w.innerHTML = '<b>Noch nicht bestätigt.</b> Der Zugang läuft vollständig; ' +
      'es fehlt nur der Haken für den Zahlungseingang.';

    // **Wer den Haken setzen darf, setzt ihn hier.** Der Knopf stand nur unten
    // in der Tabelle „Alle Pläne" — man las also eine Beschwerde und musste
    // erst suchen, wo man sie abstellt. Ein Hinweis, dessen Lösung woanders
    // liegt, ist ein halber Hinweis.
    if (d.darf_bestaetigen) {
      const knopf = PU.el('button', 'knopf still', 'Zahlungseingang bestätigen');
      knopf.type = 'button';
      knopf.style.marginTop = '.7rem';
      knopf.addEventListener('click', async () => {
        try {
          await PU.ruf('abo_bestaetigen', { abo: a.id });
          PU.melden('Bestätigt.', 'gut');
          PU.cockpitZeichnen();
        } catch (e) { PU.melden(PU.h(e.message), 'schlecht'); }
      });
      w.appendChild(knopf);
    } else {
      w.appendChild(document.createTextNode(' Den setzt die Academy-Leitung.'));
    }
    k.appendChild(w);
  }
  return k;
}

/* ---------------------------------------------------------------- Token */
function tokenKasten(d) {
  const k = PU.el('div', 'karte cockpit-kasten');
  const s = d.stand;

  // Die Marke neben der Überschrift. Für ein Konto ohne Grenze steht dort
  // nichts: „leer" wäre zwar rechnerisch wahr, widerspräche aber dem Hinweis
  // darunter — und von zwei widersprüchlichen Angaben glaubt man keiner.
  const marke = d.unbegrenzt ? ''
    : (s.lage === 'stopp' ? 'gestoppt' : (s.leer ? 'leer' : ''));
  k.innerHTML = '<div class="karte-kopf"><h3>Token</h3>' +
    (marke ? '<span class="marke-stufe">' + marke + '</span>' : '') + '</div>';

  /* Im Minus wird die Beschriftung getauscht, nicht das Vorzeichen versteckt.
     „−140.000 Token übrig" ist kein Satz; „140.000 Token im Minus" ist einer,
     und er sagt dasselbe. */
  const rest = PU.el('div', 'token-rest');
  rest.innerHTML = s.rest < 0
    ? '<div class="zahl">' + zahl(-s.rest) + '</div><div class="was">Token im Minus</div>'
    : '<div class="zahl">' + zahl(s.rest) + '</div><div class="was">Token übrig</div>';
  k.appendChild(rest);

  // Zwei Töpfe, und der Unterschied ist wichtig: das Kontingent verfällt am
  // Monatsende, gekaufte Token nicht. Wer das nicht weiss, spart falsch.
  const t = PU.el('table', 'cockpit-tabelle');
  t.innerHTML = '<tbody>' +
    '<tr><th>Monatskontingent</th><td>' + zahl(s.kontingent_rest) + ' von ' +
      zahl(s.kontingent) + ' <span class="klein">— verfällt am Monatsende</span></td></tr>' +
    '<tr><th>Gekauft</th><td>' + zahl(s.guthaben) +
      ' <span class="klein">— verfällt nicht</span></td></tr>' +
    '<tr><th>Verbraucht</th><td>' + zahl(s.verbraucht) + '</td></tr>' +
    (s.offen > 0
      ? '<tr><th>Vorgemerkt</th><td>' + zahl(s.offen) +
        ' <span class="klein">— noch nicht bestätigt</span></td></tr>'
      : '') +
    '</tbody>';
  k.appendChild(t);

  if (s.kontingent > 0) {
    const anteil = Math.round(s.kontingent_rest * 100 / s.kontingent);
    const balken = PU.el('div', 'balken');
    balken.innerHTML = '<i style="width:' + anteil + '%"></i>';
    k.appendChild(balken);
  }

  /* Der Hinweis unter dem Stand — vier Fassungen, weil es vier Lagen gibt.
     Vorher stand hier ein einziger Satz: „Der Verbrauch läuft ins Minus, bis
     nachgelegt wird." Das stimmte, solange es keine Grenze gab. Jetzt trägt
     der Rahmen noch eine Lektion und hört dann auf — und ein Kasten, der das
     Gegenteil verspricht, ist schlimmer als keiner. */
  const hinweis = tokenHinweis(d);
  if (hinweis) {
    const w = PU.el('div', 'hinweis-kasten');
    w.innerHTML = hinweis;
    k.appendChild(w);
  }
  return k;
}

function tokenHinweis(d) {
  const s = d.stand;

  // Ebene 1 zuerst: Für dieses Konto gilt keine Grenze, also darf hier auch
  // kein Minus als Warnung stehen. Der Verbrauch ist trotzdem gebucht und
  // steht in der Tabelle darüber — das ist ja der Zweck des Cockpits.
  if (d.unbegrenzt) {
    return '<b>Dieses Konto läuft unbegrenzt.</b> Ebene 1 kennt keinen ' +
      'Minus-Rahmen: Aufbau und Prüfläufe sollen nicht an einer Schranke enden. ' +
      'Gebucht wird trotzdem alles — was oben steht, ist echter Verbrauch.';
  }

  if (s.lage === 'stopp') {
    return '<b>Der Rahmen ist aufgebraucht.</b> Die Tutoren antworten nicht ' +
      'mehr, bis nachgelegt wird. Lesen, Aufgaben lösen und abgeben geht ' +
      'weiter — das kostet nichts.';
  }
  if (s.lage === 'minus') {
    return '<b>Das Konto ist leer.</b> Die Tutoren antworten weiter — die ' +
      'Academy sperrt niemanden mitten in einer Aufgabe aus. Der Rahmen von ' +
      zahl(s.rahmen) + ' Token trägt noch etwa eine Lektion, danach ist Schluss.';
  }
  if (s.lage === 'knapp') {
    return '<b>Es wird knapp.</b> Was übrig ist, reicht noch für ungefähr eine ' +
      'Lektion mit Tutorhilfe.';
  }
  return '';
}

/* ---------------------------------------------------------------- Verbrauch */
function verbrauchKasten(d) {
  const k = PU.el('section', 'cockpit-block');
  k.appendChild(PU.el('h2', '', 'Wohin die Token gehen'));
  k.appendChild(PU.el('p', 'hinweis',
    'Die letzten 30 Tage, seit ' + PU.h(datum(d.seit)) + '.'));

  if (!d.verbrauch.length) {
    k.appendChild(PU.el('p', 'leer-hinweis', 'Noch kein Verbrauch.'));
    return k;
  }

  const groesste = Math.max.apply(null, d.verbrauch.map(v => v.tokens));
  const liste = PU.el('div', 'verbrauch-liste');

  d.verbrauch.forEach(v => {
    const zeile = PU.el('div', 'verbrauch-zeile');
    zeile.innerHTML =
      '<div class="v-name">' + PU.h(v.wofuer) +
        (v.geschaetzt ? ' <span class="v-schaetzung">geschätzt</span>' : '') + '</div>' +
      '<div class="v-balken"><i style="width:' +
        Math.round(v.tokens * 100 / Math.max(1, groesste)) + '%"></i></div>' +
      '<div class="v-zahl">' + zahl(v.tokens) + '</div>' +
      '<div class="v-anzahl klein">' + v.anzahl + '×</div>';
    liste.appendChild(zeile);
  });

  k.appendChild(liste);
  return k;
}

/* ---------------------------------------------------------------- Buchungen */
function buchungenKasten(d) {
  const k = PU.el('section', 'cockpit-block');
  k.appendChild(PU.el('h2', '', 'Letzte Buchungen'));

  if (!d.letzte.length) {
    k.appendChild(PU.el('p', 'leer-hinweis', 'Noch nichts gebucht.'));
    return k;
  }

  // Ohne diese beiden Zeilen stünde in der Spalte roh `talent_ein` — die
  // Buchung wäre da, aber niemand wüsste, was sie ist.
  const wort = { einzahlung: 'Einzahlung', kontingent: 'Kontingent',
                 verbrauch: 'Verbrauch', storno: 'Storno', probe: 'Testzugang',
                 gutschrift: 'Gutschrift',
                 talent_ein: 'Talente erhalten', talent_aus: 'Talente gegeben' };

  const rahmen = PU.el('div', 'tabellenrahmen');
  let html = '<table><thead><tr><th>Wann</th><th>Was</th><th>Wofür</th>' +
             '<th class="zahl">Token</th><th></th></tr></thead><tbody>';

  d.letzte.forEach(b => {
    html += '<tr><td class="klein">' + PU.h(b.zeitpunkt.slice(0, 16)) + '</td>' +
      '<td>' + PU.h(wort[b.art] || b.art) + '</td>' +
      '<td>' + PU.h(b.wofuer) +
        (b.modell ? '<br><span class="klein">' + PU.h(b.modell) + '</span>' : '') + '</td>' +
      '<td class="zahl ' + (b.tokens < 0 ? 'minus' : 'plus') + '">' +
        (b.tokens > 0 ? '+' : '') + zahl(b.tokens) + '</td>' +
      '<td class="klein">' +
        (b.geschaetzt ? 'geschätzt ' : '') +
        (b.bestaetigt ? '' : '<b>offen</b>') +
        (b.eur ? ' ' + PU.h(b.eur) : '') +
      '</td></tr>';
  });

  rahmen.innerHTML = html + '</tbody></table>';
  k.appendChild(rahmen);
  return k;
}

/* ---------------------------------------------------------------- Nachlegen */
function nachlegenKasten(d) {
  const k = PU.el('section', 'cockpit-block');
  k.appendChild(PU.el('h2', '', 'Token nachlegen'));
  k.appendChild(PU.el('p', 'hinweis',
    'Vormerken schreibt eine Buchung, die auf Bestätigung wartet. ' +
    '<b>Es wird nichts abgebucht</b> — es ist kein Zahlungsdienst eingebunden.'));

  const reihe = PU.el('div', 'paket-reihe');
  Object.keys(d.pakete).forEach(schluessel => {
    const p = d.pakete[schluessel];
    const kasten = PU.el('div', 'paket');
    kasten.innerHTML =
      '<div class="paket-name">' + PU.h(p.name) + '</div>' +
      '<div class="paket-preis">' + PU.h(eur(p.cent)) + '</div>' +
      '<div class="paket-tokens">' + zahl(p.tokens) + ' Token</div>';

    const knopf = PU.el('button', 'knopf still', 'Vormerken');
    knopf.type = 'button';
    knopf.addEventListener('click', async () => {
      if (!confirm('Paket „' + p.name + '" für ' + eur(p.cent) + ' vormerken?\n\n' +
                   'Es wird nichts abgebucht. Die Buchung wartet auf die ' +
                   'Bestätigung durch die Academy-Leitung.')) return;
      try {
        PU.cockpitStand = await PU.ruf('token_einzahlen', {
          paket: schluessel,
          sofort: haken.sofort.checked,
          verlust_bekannt: haken.verlust.checked
        });
        PU.melden(haken.sofort.checked && haken.verlust.checked
          ? 'Vorgemerkt. Sofortige Freischaltung verlangt — das Widerrufsrecht ist damit erloschen.'
          : 'Vorgemerkt. Dein Widerrufsrecht bleibt bestehen (14 Tage).', 'gut');
        cockpitMalen(document.getElementById('view-cockpit'));
      } catch (e) { PU.melden(PU.h(e.message), 'schlecht'); }
    });
    kasten.appendChild(knopf);
    reihe.appendChild(kasten);
  });

  k.appendChild(reihe);
  k.appendChild(widerrufHaken());
  return k;
}

/* Die beiden Widerrufs-Häkchen (§ 356 Abs. 5 BGB).
   Sie sind KEINE Kaufbedingung — wer sie stehen lässt, kauft trotzdem und
   behält seine vierzehn Tage. Ein Kauf, den man ohne Rechtsverzicht nicht
   abschliessen kann, wäre genau der Zwang, den die Vorschrift verbietet.
   Nur beide zusammen wirken: die Vorschrift verlangt das Verlangen UND die
   Kenntnisbestätigung. Deshalb bleibt der Text unten stehen, solange nur
   eines gesetzt ist — sonst glaubt jemand, er habe es getan. */
let haken = { sofort: null, verlust: null };

function widerrufHaken() {
  const kasten = PU.el('section', 'widerruf-haken');
  kasten.innerHTML =
    '<h4>Sofort freischalten?</h4>' +
    '<label><input type="checkbox" data-h="sofort"> ' +
      'Ich verlange ausdrücklich, dass vor Ende der Widerrufsfrist mit der ' +
      'Ausführung begonnen wird, damit die Token sofort verfügbar sind.</label>' +
    '<label><input type="checkbox" data-h="verlust"> ' +
      'Mir ist bekannt, dass ich damit mein Widerrufsrecht für diesen Kauf ' +
      'verliere, sobald die Token freigeschaltet sind.</label>' +
    '<p class="widerruf-stand"></p>';

  haken.sofort  = kasten.querySelector('[data-h="sofort"]');
  haken.verlust = kasten.querySelector('[data-h="verlust"]');
  const stand   = kasten.querySelector('.widerruf-stand');

  const zeigen = () => {
    const beide = haken.sofort.checked && haken.verlust.checked;
    stand.textContent = beide
      ? 'Die Token werden sofort freigeschaltet. Dein Widerrufsrecht erlischt damit.'
      : 'Ohne beide Häkchen bleiben deine 14 Tage Widerrufsrecht bestehen. Die Token kommen dann nach Ablauf der Frist.';
    stand.className = 'widerruf-stand' + (beide ? ' erloschen' : '');
  };
  haken.sofort.addEventListener('change', zeigen);
  haken.verlust.addEventListener('change', zeigen);
  zeigen();

  return kasten;
}

/* ---------------------------------------------------------------- Verwaltung */
function verwaltungKasten(d) {
  const k = PU.el('section', 'cockpit-block');
  k.appendChild(PU.el('h2', '', 'Pläne verwalten'));

  // -------- Neuen Plan buchen
  const form = document.createElement('form');
  form.className = 'abo-form';
  form.innerHTML =
    '<h4>Plan buchen</h4>' +
    '<label class="klein">Plan<select name="plan">' +
      Object.keys(d.plaene).map(s =>
        '<option value="' + s + '">' + PU.h(d.plaene[s].name) + ' — ' +
        PU.h(eur(d.plaene[s].cent)) + ' / Monat</option>').join('') +
    '</select></label>' +
    // **Das Feld erscheint nur, wenn es etwas bedeutet.** Vorher stand es
    // immer da, mit einem Absatz darunter, der bat, es beim Schüler- und
    // Familienplan leerzulassen. Wer eine Schule betreibt, trägt sie trotzdem
    // ein — und hatte dann einen Schülerplan „für dieses Konto PROMPTHEUS
    // GYMNASIUM", der beides behauptete. Eine Bitte im Kleingedruckten ist
    // keine Regel; ein ausgeblendetes Feld ist eine.
    '<div class="abo-traeger" hidden>' +
      '<label class="klein">Für wen<input name="traeger_name"></label>' +
      '<p class="warum"></p>' +
    '</div>';

  const knopf = PU.el('button', 'knopf', 'Buchen');
  knopf.type = 'submit';
  form.appendChild(knopf);

  // Der Träger hängt am Plan, also folgt das Feld der Auswahl.
  const traegerFeld = form.querySelector('.abo-traeger');
  const warum       = traegerFeld.querySelector('.warum');
  const eingabe     = traegerFeld.querySelector('input');

  const traegerZeigen = () => {
    const p = d.plaene[form.plan.value] || {};
    if (p.traeger_art === 'klasse') {
      traegerFeld.hidden = false;
      eingabe.placeholder = 'z. B. 7b';
      warum.textContent = 'Der Klassenname muss genau so geschrieben sein wie in '
        + 'den Konten der Schüler — daran erkennt die Academy, wer zu diesem Plan gehört.';
    } else if (p.traeger_art === 'schule') {
      traegerFeld.hidden = false;
      eingabe.placeholder = 'Name der Einrichtung';
      warum.textContent = 'Der Name muss genau so geschrieben sein wie im Feld '
        + '„Schule" der Konten — daran erkennt die Academy, wer zu diesem Plan gehört.';
    } else {
      traegerFeld.hidden = true;
      eingabe.value = '';
      warum.textContent = '';
    }
  };
  form.plan.addEventListener('change', traegerZeigen);
  traegerZeigen();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const plan = form.plan.value;
    const art  = d.plaene[plan].traeger_art;
    const name = form.traeger_name.value.trim();

    if (art !== 'person' && name === '') {
      PU.melden('Für diesen Plan fehlt der Name — Klasse oder Schule.', 'schlecht');
      return;
    }
    if (!confirm('Plan „' + d.plaene[plan].name + '" buchen?\n\n' +
                 'Es wird nichts abgebucht. Die Buchung wartet auf Bestätigung.')) return;

    try {
      await PU.ruf('abo_buchen', { plan: plan, traeger_art: art, traeger_name: name });
      PU.melden('Gebucht. Wartet auf Bestätigung.', 'gut');
      PU.cockpitZeichnen();
    } catch (err) { PU.melden(PU.h(err.message), 'schlecht'); }
  });
  k.appendChild(form);

  // -------- Alle Pläne
  if (d.alle && d.alle.length) {
    k.appendChild(PU.el('h4', '', 'Alle Pläne'));
    const rahmen = PU.el('div', 'tabellenrahmen');

    let html = '<table><thead><tr><th>Plan</th><th>Für</th><th>Seit</th>' +
               '<th>Nächste Zahlung</th><th>Plätze</th><th></th></tr></thead><tbody>';

    d.alle.forEach(a => {
      html += '<tr' + (a.laeuft ? '' : ' class="spaeter"') + '>' +
        '<td>' + PU.h(a.plan_name) + '<br><span class="klein">' + PU.h(a.preis) + '</span></td>' +
        '<td>' + PU.h(a.traeger_name || 'dieses Konto') +
          '<br><span class="klein">' + PU.h(a.traeger_art) + '</span></td>' +
        '<td class="klein">' + PU.h(datum(a.start)) + '</td>' +
        '<td class="klein">' + PU.h(datum(a.naechste_zahlung)) + '</td>' +
        '<td class="klein">' + (a.plaetze > 1 ? a.belegt + '/' + a.plaetze : '—') + '</td>' +
        '<td>' +
          (!a.bestaetigt && d.darf_bestaetigen
            ? '<button class="knopf still" data-ok="' + a.id + '">Bestätigen</button> '
            : (a.bestaetigt ? '<span class="klein">bestätigt</span> ' : '<span class="klein">offen</span> ')) +
          (a.laeuft ? '<button class="knopf still" data-weg="' + a.id + '">Beenden</button>' : '') +
        '</td></tr>';
    });

    rahmen.innerHTML = html + '</tbody></table>';
    k.appendChild(rahmen);

    rahmen.querySelectorAll('[data-ok]').forEach(b => b.addEventListener('click', async () => {
      try {
        await PU.ruf('abo_bestaetigen', { abo: parseInt(b.dataset.ok, 10) });
        PU.melden('Bestätigt.', 'gut');
        PU.cockpitZeichnen();
      } catch (e) { PU.melden(PU.h(e.message), 'schlecht'); }
    }));

    rahmen.querySelectorAll('[data-weg]').forEach(b => b.addEventListener('click', async () => {
      if (!confirm('Diesen Plan beenden? Zugänge bleiben bestehen, die Platzgrenze entfällt.')) return;
      try {
        await PU.ruf('abo_beenden', { abo: parseInt(b.dataset.weg, 10) });
        PU.melden('Beendet.', 'gut');
        PU.cockpitZeichnen();
      } catch (e) { PU.melden(PU.h(e.message), 'schlecht'); }
    }));
  }

  return k;
}

/* ---------------------------------------------------------------- Kleinkram */
function zahl(n) {
  return new Intl.NumberFormat('de-DE').format(n);
}

function eur(cent) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' })
    .format(cent / 100);
}

function datum(iso) {
  if (!iso) return '—';
  const t = iso.slice(0, 10).split('-');
  return t.length === 3 ? t[2] + '.' + t[1] + '.' + t[0] : iso;
}

/** „in 12 Tagen" — die Zahl, die man wirklich wissen will. */
function inTagen(iso) {
  if (!iso) return '';
  const tage = Math.round((new Date(iso + 'T00:00:00') - new Date()) / 86400000);
  if (tage < 0)  return '(überfällig)';
  if (tage === 0) return '(heute)';
  if (tage === 1) return '(morgen)';
  return '(in ' + tage + ' Tagen)';
}
