/* PROMPTHEUS — Deine Guideline einrichten (7. Kurs, Lektion 7).
 *
 * Ein Fenster, acht Schritte in der Reihenfolge von Lektion 2, dann die
 * Zusammenfassung. Nach jedem Schritt wird gespeichert: Ein Entwurf geht nicht
 * verloren, und was die PII-Sperre des Servers ersetzt hat, steht sofort so
 * im Feld, wie es gespeichert ist.
 *
 * Entschieden wird auf dem Server (srv/handschrift.php): ob das Konto schon
 * einrichten darf, was gekürzt wird, was fehlt. Hier wird nur gezeigt.
 *
 * Zwei Orte öffnen dasselbe Fenster: der Platzhalter in Lektion 7
 * (```einrichtung) und Einstellungen › Werkstatt.
 */
(function () {
  'use strict';

  const H = { stand: null, d: null, schritt: 0 };

  const SCHRITTE = [
    'Art', 'Ausweis', 'Persönlichkeit', 'Register', 'Sprache',
    'Gestalt', 'Ausgabeformen', 'Trennlinie', 'Zusammenfassung'
  ];

  /** Was die Kürzel aus pu_kurs7_weg() hier bedeuten. */
  const GESPERRT = {
    stufen_offen: 'Erst die sechs Stufen bestehen, dann den 7. Kurs abschliessen.',
    kurs_fehlt:   'Der 7. Kurs ist auf diesem Rechner noch nicht eingerichtet.',
    kurs_leer:    'Der 7. Kurs hat noch keine Aufgaben.',
    kurs_offen:   'Löse zuerst alle Aufgaben aus Lektion 1 bis 6.'
  };

  const marke = () => H.d.art === 'marke';

  async function laden() {
    const j = await PU.ruf('handschrift_lesen');
    H.stand = j.handschrift;
    H.d = JSON.parse(JSON.stringify(j.handschrift.daten));
    if (!j.handschrift.vorhanden) H.d.art = j.handschrift.vorgabe_art;
    return H.stand;
  }

  /* ------------------------------------------------------------ Karte */

  /** Die Karte in der Lektion und in den Einstellungen. */
  PU.handschriftKarte = function (platz) {
    const karte = PU.el('div', 'karte hs-karte');
    karte.innerHTML = '<p class="klein">Lade deinen Stand …</p>';
    platz.appendChild(karte);
    laden().then(st => karteFuellen(karte, st)).catch(e => {
      karte.innerHTML = '<p class="merkzettel warn">' + PU.h(e.message) + '</p>';
    });
    return karte;
  };

  function karteFuellen(karte, st) {
    karte.innerHTML = '';
    karte.appendChild(PU.el('h3', '', st.vorgabe_art === 'marke' && st.daten.art !== 'persoenlich'
      ? 'Deine Brand-Guideline' : 'Deine Guideline'));

    if (!st.frei) {
      const p = PU.el('p', 'merkzettel');
      p.innerHTML = '<b>Noch nicht frei.</b> ' + PU.h(GESPERRT[st.grund] || '') +
        (st.grund === 'kurs_offen' ? ' Stand: <b>' + st.prozent + ' %</b>.' : '');
      karte.appendChild(p);
      return;
    }

    const p = PU.el('p', 'merkzettel' + (st.im_einsatz ? ' gut' : ''));
    if (!st.vorhanden) {
      p.innerHTML = '<b>Noch nicht eingerichtet.</b> Etwa zwanzig Minuten, acht Schritte.';
    } else if (st.fehlt && st.fehlt.length) {
      p.innerHTML = '<b>Entwurf.</b> Es fehlt noch: ' + PU.h(st.fehlt.join(' · ')) + '.';
    } else {
      p.innerHTML = '<b>Vollständig.</b> ' + (st.im_einsatz
        ? 'Im Einsatz für Werkstatt und Cinema Studio.'
        : 'Beim nächsten Öffnen der Werkstatt im Einsatz.');
    }
    karte.appendChild(p);

    const knopf = PU.el('button', 'knopf', st.vorhanden ? 'Guideline bearbeiten' : 'Guideline einrichten');
    knopf.type = 'button';
    knopf.addEventListener('click', () => PU.handschriftOeffnen(() => karteFuellen(karte, H.stand)));
    karte.appendChild(knopf);
  }

  /* ------------------------------------------------------------ Fenster */

  let nachher = null;

  PU.handschriftOeffnen = async function (danach) {
    nachher = danach || null;
    try { await laden(); } catch (e) { PU.melden(e.message, 'fehler'); return; }
    if (!H.stand.frei) { PU.melden(GESPERRT[H.stand.grund] || 'Noch nicht frei.', 'fehler'); return; }
    if (PU.piiLaden) PU.piiLaden();
    H.schritt = H.stand.vorhanden ? SCHRITTE.length - 1 : 0;
    zeichnen();
  };

  function zeichnen() {
    const flaeche = PU.modalZeigen(marke() ? 'Brand-Guideline einrichten' : 'Deine Guideline einrichten');
    if (!flaeche) return;
    flaeche.classList.add('hs');

    const leiste = PU.el('ol', 'hs-leiste');
    SCHRITTE.forEach((name, i) => {
      const li = PU.el('li', i === H.schritt ? 'an' : '', (i === 0 ? '' : i + ' · ') + name);
      li.addEventListener('click', () => gehen(i));
      leiste.appendChild(li);
    });
    flaeche.appendChild(leiste);

    const inhalt = PU.el('div', 'hs-schritt');
    flaeche.appendChild(inhalt);
    [schrittArt, schrittAusweis, schrittPersoenlichkeit, schrittRegister, schrittSprache,
     schrittGestalt, schrittFormen, schrittTrennlinie, schrittZusammenfassung][H.schritt](inhalt);

    const meldung = PU.el('div', 'hs-meldung');
    flaeche.appendChild(meldung);

    const fuss = PU.el('div', 'hs-fuss');
    if (H.schritt > 0) fuss.appendChild(knopf('Zurück', 'knopf still', () => gehen(H.schritt - 1)));
    if (H.schritt < SCHRITTE.length - 1) {
      fuss.appendChild(knopf('Speichern und weiter', 'knopf', () => gehen(H.schritt + 1)));
    } else {
      fuss.appendChild(knopf('Speichern', 'knopf', () => gehen(H.schritt)));
    }
    flaeche.appendChild(fuss);
  }

  function knopf(text, klasse, tun) {
    const k = PU.el('button', klasse, text);
    k.type = 'button';
    k.addEventListener('click', tun);
    return k;
  }

  /** Speichert, zeigt PII-Treffer, geht weiter. Mit Treffern bleibt man stehen. */
  async function gehen(ziel) {
    let j;
    try {
      j = await PU.ruf('handschrift_speichern', { daten: H.d });
    } catch (e) {
      const m = document.querySelector('#modal .hs-meldung');
      if (m) m.innerHTML = '<p class="merkzettel warn">' + PU.h(e.message) + '</p>';
      return;
    }
    H.stand = j.handschrift;
    H.d = JSON.parse(JSON.stringify(j.handschrift.daten));
    if (j.treffer && j.treffer.length) {
      zeichnen();
      const ort = document.querySelector('#modal .hs-meldung');
      if (ort && PU.verbotsregelZeigen) PU.verbotsregelZeigen(ort, j.treffer);
      else if (ort) ort.innerHTML = '<p class="merkzettel warn"><b>Persönliches ersetzt.</b> ' +
        PU.h(j.treffer.map(t => t.titel).join(', ')) + ' — steht jetzt als „xxx“ im Feld.</p>';
      return;
    }
    H.schritt = ziel;
    zeichnen();
    if (nachher) nachher();
  }

  /* ------------------------------------------------------------ Felder */

  /** Ein Textfeld, das direkt in H.d schreibt. */
  function feld(ort, titel, hinweis, lesen, schreiben, max) {
    const z = PU.el('label', 'hs-feld');
    z.appendChild(PU.el('span', 'hs-titel', titel));
    const f = PU.el('input');
    f.type = 'text';
    f.maxLength = max || 200;
    f.value = lesen() || '';
    f.placeholder = hinweis || '';
    f.addEventListener('input', () => schreiben(f.value));
    z.appendChild(f);
    ort.appendChild(z);
    if (PU.piiFeld) PU.piiFeld(f, z);
    return f;
  }

  /** Eine Reihe von Zeilen mit zwei Feldern (Eigenschaft/aber nicht, Anlass/Form …). */
  function reihen(ort, liste, anzahl, links, rechts, mitte) {
    while (liste.length < anzahl) liste.push({ [links[0]]: '', [rechts[0]]: '' });
    const tab = PU.el('div', 'hs-reihen');
    liste.forEach((z, i) => {
      const r = PU.el('div', 'hs-reihe');
      const a = PU.el('input'); a.type = 'text'; a.maxLength = links[2] || 200;
      a.placeholder = links[1]; a.value = z[links[0]] || '';
      a.addEventListener('input', () => { z[links[0]] = a.value; });
      const b = PU.el('input'); b.type = 'text'; b.maxLength = rechts[2] || 200;
      b.placeholder = rechts[1]; b.value = z[rechts[0]] || '';
      b.addEventListener('input', () => { z[rechts[0]] = b.value; });
      r.appendChild(PU.el('span', 'hs-nr', String(i + 1)));
      r.appendChild(a);
      if (mitte) r.appendChild(PU.el('span', 'hs-mitte', mitte));
      r.appendChild(b);
      tab.appendChild(r);
      if (PU.piiFeld) { PU.piiFeld(a, r); PU.piiFeld(b, r); }
    });
    ort.appendChild(tab);
  }

  /** Eine Liste einzelner Wörter oder Sätze, eine Zeile je Eintrag. */
  function zeilenFeld(ort, titel, hinweis, liste, max) {
    const z = PU.el('label', 'hs-feld');
    z.appendChild(PU.el('span', 'hs-titel', titel));
    const t = PU.el('textarea');
    t.rows = Math.min(max, 6);
    t.placeholder = hinweis;
    t.value = liste.join('\n');
    t.addEventListener('input', () => {
      liste.length = 0;
      t.value.split(/\n|,/).map(s => s.trim()).filter(Boolean).slice(0, max).forEach(s => liste.push(s));
    });
    z.appendChild(t);
    ort.appendChild(z);
    if (PU.piiFeld) PU.piiFeld(t, z);
  }

  function kopf(ort, titel, text) {
    ort.appendChild(PU.el('h3', '', titel));
    if (text) ort.appendChild(PU.el('p', 'hinweis', text));
  }

  /* ------------------------------------------------------------ Schritte */

  function schrittArt(o) {
    kopf(o, 'Welche Guideline?', 'Dieselben acht Felder, zwei Anlässe. Umstellen kannst du jederzeit.');
    const wahl = PU.el('div', 'hs-wahl');
    [['marke', 'Brand-Guideline', 'Für eine Marke, einen Verein, ein Gewerbe. Alle Felder zählen.'],
     ['persoenlich', 'Persönliche Guideline', 'Für deine eigenen Projekte. Weniger Pflichtfelder.']]
      .forEach(([wert, name, text]) => {
        const k = PU.el('button', 'hs-art' + (H.d.art === wert ? ' an' : ''));
        k.type = 'button';
        k.innerHTML = '<b>' + PU.h(name) + '</b><span>' + PU.h(text) + '</span>';
        k.addEventListener('click', () => { H.d.art = wert; zeichnen(); });
        wahl.appendChild(k);
      });
    o.appendChild(wahl);

    const p = PU.el('p', 'merkzettel');
    p.innerHTML = '<b>Bevor du anfängst.</b> Kein voller Name, keine Adresse, Telefonnummer, ' +
      'E-Mail oder Schule mit Ort. Was persönlich aussieht, wird zu „xxx“. Der Grund: ' +
      'Werkstatt und Cinema Studio schicken deine Guideline mit jeder Anfrage an ein ' +
      'Sprachmodell (über OpenRouter). Gespeichert wird sie nur auf diesem Rechner.';
    o.appendChild(p);
  }

  function schrittAusweis(o) {
    const a = H.d.ausweis;
    kopf(o, '1 · Ausweis', 'Fünf Zeilen. Wer nur diese liest, macht wenig falsch.');
    feld(o, 'Was', marke() ? 'z. B. Fahrradladen im Viertel' : 'z. B. meine Comics und Referate', () => a.was, v => { a.was = v; });
    feld(o, 'Für wen', marke() ? 'z. B. Pendler, die keine Zeit verlieren wollen' : 'z. B. meine Klasse, meine Familie', () => a.fuer_wen, v => { a.fuer_wen = v; });
    feld(o, 'Der Satz', 'Der eine Satz, an dem man dich erkennt', () => a.satz, v => { a.satz = v; });
    feld(o, 'Das Bild', 'Welches Bild steht für dich?', () => a.bild, v => { a.bild = v; });
    feld(o, 'Die Haltung', 'z. B. erklären statt beeindrucken', () => a.haltung, v => { a.haltung = v; });
  }

  function schrittPersoenlichkeit(o) {
    kopf(o, '2 · Persönlichkeit', 'Vier Eigenschaften — und wogegen sich jede abgrenzt. ' +
      '„Freundlich“ sagt nichts, „freundlich, aber nicht kumpelhaft“ sagt viel.');
    reihen(o, H.d.persoenlichkeit, H.stand.grenzen.persoenlichkeit,
      ['eigenschaft', 'Eigenschaft', 40], ['aber_nicht', 'Gegenprobe', 40], 'aber nicht');
  }

  function schrittRegister(o) {
    kopf(o, '3 · Register', 'Mit welchen Gruppen sprichst du, und was ändert sich dabei? ' +
      'Die Haltung ändert sich nie.' + (marke() ? '' : ' Bei der persönlichen Guideline darf das leer bleiben.'));
    reihen(o, H.d.register, H.stand.grenzen.register,
      ['gruppe', 'Gruppe, z. B. Kunden', 80], ['aenderung', 'Was ändert sich?', 200]);
  }

  function schrittSprache(o) {
    const s = H.d.sprache;
    kopf(o, '4 · Sprache', 'Gut/Schlecht-Paare statt Adjektiven — und deine Verbotsliste.');
    const z = PU.el('label', 'hs-feld');
    z.appendChild(PU.el('span', 'hs-titel', 'Ansprache'));
    const sel = PU.el('select');
    ['du', 'Sie', 'ihr'].forEach(w => {
      const op = PU.el('option', '', w); op.value = w; if (s.ansprache === w) op.selected = true; sel.appendChild(op);
    });
    sel.addEventListener('change', () => { s.ansprache = sel.value; });
    z.appendChild(sel);
    o.appendChild(z);
    o.appendChild(PU.el('p', 'hs-titel', 'Gut und schlecht'));
    reihen(o, s.paare, H.stand.grenzen.paare, ['gut', 'Gut: „Noch 3 von 6 Stufen.“'], ['schlecht', 'Schlecht: „Wow, super! 🎉“']);
    zeilenFeld(o, 'Verbotsliste', 'Ein Wort je Zeile oder durch Komma getrennt', s.verbote, H.stand.grenzen.verbote);
  }

  function schrittGestalt(o) {
    const g = H.d.gestalt;
    kopf(o, '5 · Gestalt', 'Drei Farben — und was jede bedeutet. Der Name wird zum CSS-Token (--weiter).');
    const vorgabe = [['weiter', '#b74e0c'], ['geschafft', '#9a6a00'], ['erklaert', '#2f6394']];
    while (g.farben.length < H.stand.grenzen.farben) {
      const [n, hex] = vorgabe[g.farben.length];
      g.farben.push({ name: n, hex: hex, bedeutung: '' });
    }
    const tab = PU.el('div', 'hs-reihen');
    g.farben.forEach(f => {
      const r = PU.el('div', 'hs-reihe hs-farbe');
      const c = PU.el('input'); c.type = 'color'; c.value = f.hex;
      c.addEventListener('input', () => { f.hex = c.value; });
      const n = PU.el('input'); n.type = 'text'; n.maxLength = 24; n.placeholder = 'Name'; n.value = f.name;
      n.addEventListener('input', () => { f.name = n.value; });
      const b = PU.el('input'); b.type = 'text'; b.maxLength = 200; b.placeholder = 'Bedeutung, z. B. hier geht es weiter'; b.value = f.bedeutung;
      b.addEventListener('input', () => { f.bedeutung = b.value; });
      r.appendChild(c); r.appendChild(n); r.appendChild(b);
      tab.appendChild(r);
      if (PU.piiFeld) PU.piiFeld(b, r);
    });
    o.appendChild(tab);
    feld(o, 'Schrift (optional)', 'z. B. Atkinson Hyperlegible', () => g.schrift, v => { g.schrift = v; }, 80);
  }

  function schrittFormen(o) {
    kopf(o, '6 · Ausgabeformen', 'Deine häufigsten Anlässe, und für jeden die Form: Wie lang? Was steht zuerst?');
    reihen(o, H.d.formen, H.stand.grenzen.formen,
      ['anlass', 'Anlass, z. B. Antwort auf eine Frage', 80], ['form', 'Form, z. B. 2 bis 5 Sätze, Ergebnis zuerst', 200]);
  }

  function schrittTrennlinie(o) {
    const t = H.d.trennlinie;
    kopf(o, '7 · Trennlinie', 'Fest ist, was der Leser wiedererkennen soll. Frei ist, was der Anlass verlangt.');
    const zwei = PU.el('div', 'hs-zwei');
    zeilenFeld(zwei, 'Fest', 'z. B. Ansprache du', t.fest, H.stand.grenzen.fest);
    zeilenFeld(zwei, 'Frei', 'z. B. Beispiele', t.frei, H.stand.grenzen.frei);
    o.appendChild(zwei);
    feld(o, 'Regel für Absagen', 'z. B. Jede Absage nennt einen Weg', () => H.d.absage, v => { H.d.absage = v; });
  }

  function schrittZusammenfassung(o) {
    const st = H.stand;
    kopf(o, '8 · Einsatz', 'Dein Systemprompt-Baustein, gezogen aus den Feldern davor.');
    const p = PU.el('p', 'merkzettel' + (st.fehlt && !st.fehlt.length ? ' gut' : ''));
    if (!st.vorhanden) p.innerHTML = '<b>Noch nicht gespeichert.</b>';
    else if (st.fehlt.length) p.innerHTML = '<b>Entwurf.</b> Es fehlt noch: ' + PU.h(st.fehlt.join(' · ')) + '.';
    else p.innerHTML = '<b>Vollständig.</b> ' + (st.im_einsatz
      ? 'Im Einsatz. Starte die Werkstatt einmal neu, damit Hephaistos diese Fassung liest; das Cinema Studio nimmt sie bei der nächsten Anfrage.'
      : 'Beim nächsten Öffnen der Werkstatt im Einsatz — für Hephaistos und das Cinema Studio.');
    o.appendChild(p);

    if (st.systemprompt) {
      const pre = PU.el('pre', 'code hs-baustein');
      pre.textContent = st.systemprompt;
      o.appendChild(pre);
    }

    const leiste = PU.el('div', 'hs-fuss links');
    if (st.vorhanden) {
      leiste.appendChild(knopf('Baustein kopieren', 'knopf still', e => PU.inZwischenablage(st.systemprompt, e.currentTarget)));
      leiste.appendChild(knopf('Paket herunterladen (.zip)', 'knopf still', paketLaden));
      leiste.appendChild(knopf('Guideline löschen', 'knopf still hs-weg', loeschen));
    }
    o.appendChild(leiste);
  }

  async function paketLaden() {
    try {
      const j = await PU.ruf('handschrift_paket');
      const roh = atob(j.inhalt);
      const bytes = new Uint8Array(roh.length);
      for (let i = 0; i < roh.length; i++) bytes[i] = roh.charCodeAt(i);
      const url = URL.createObjectURL(new Blob([bytes], { type: 'application/zip' }));
      const a = Object.assign(document.createElement('a'), { href: url, download: j.datei });
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (e) { PU.melden(e.message, 'fehler'); }
  }

  async function loeschen() {
    if (!confirm('Deine Guideline löschen? Werkstatt und Cinema Studio arbeiten danach ohne sie.')) return;
    try {
      const j = await PU.ruf('handschrift_loeschen');
      H.stand = j.handschrift;
      H.d = JSON.parse(JSON.stringify(j.handschrift.daten));
      H.d.art = j.handschrift.vorgabe_art;
      H.schritt = 0;
      zeichnen();
      if (nachher) nachher();
    } catch (e) { PU.melden(e.message, 'fehler'); }
  }
})();
