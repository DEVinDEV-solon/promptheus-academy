/* PROMPTHEUS — die Gemeinde (Runde 3b des Cockpit-Plans).
 *
 * Drei Reiter:
 *   Schaufenster     Werke anderer: bunt mit Bild, liken, kommentieren, melden.
 *   Meine Produkte   Prompts, Skills, Plugins aus Werkstatt oder Dashboard;
 *                    freischalten erst mit Bild und Kategorie (E17).
 *   Gegenzeichnen    Mit-Siegel für Werke Minderjähriger (Lehrkraft, Eltern,
 *                    Verwaltung).
 *
 * Alles, was man schreibt, läuft beim Tippen durch den PII-Filter
 * (assets/js/pii.js): persönliche Angaben werden „xxx“, und eine rot umrandete
 * Verbotsregel erklärt, warum (E16). Der Server prüft noch einmal.
 */
'use strict';

PU.gem = { start: null, filter: {}, seite: 0, reiter: 'schaufenster' };

/* ---------------------------------------------------------------- PII beim Tippen */

/** Lädt das Regelwerk einmal. */
PU.piiLaden = async function () {
  if (PU.pii && PU.pii.bereit()) return true;
  try {
    const j = await PU.ruf('pii_regeln');
    if (j.ok && PU.pii) { PU.pii.laden(j.regeln); return true; }
  } catch (e) { /* ohne Regeln prüft der Server allein */ }
  return false;
};

/** Die rot umrandete Verbotsregel. */
PU.verbotsregelZeigen = function (ort, treffer) {
  let kasten = ort.querySelector(':scope > .verbotsregel');
  if (!treffer || !treffer.length) { if (kasten) kasten.remove(); return; }
  if (!kasten) {
    kasten = PU.el('div', 'verbotsregel');
    kasten.setAttribute('role', 'alert');
    ort.appendChild(kasten);
  }
  const gesehen = {};
  kasten.innerHTML = '<p class="verbotsregel-kopf">⛔ Verbotsregel</p>' + treffer
    .filter(t => { if (gesehen[t.titel]) return false; gesehen[t.titel] = true; return true; })
    .map(t => '<p><b>' + PU.h(t.titel) + '.</b> ' + PU.h(t.text) + '</p>').join('') +
    '<p class="klein">Ersetzt durch „xxx“. Nimm dein Synonym und lass Persönliches weg.</p>';
};

/**
 * Hängt die Prüfung an ein Eingabefeld. Geprüft wird, sobald ein Wort fertig
 * ist (Leerzeichen, Satzzeichen), beim Einfügen und beim Verlassen des Felds —
 * nicht mitten im Wort, sonst würde „Ben“ in „Benzin“ schon ersetzt.
 */
PU.piiFeld = function (feld, ort) {
  const pruefen = () => {
    if (!PU.pii || !PU.pii.bereit()) return;
    const p = PU.pii.pruefen(feld.value);
    if (p.text !== feld.value) {
      feld.value = p.text;
      feld.setSelectionRange && feld.setSelectionRange(p.text.length, p.text.length);
    }
    PU.verbotsregelZeigen(ort, p.treffer);
  };
  feld.addEventListener('input', e => {
    const letztes = feld.value.slice(-1);
    if (e.inputType === 'insertFromPaste' || /[\s.,;:!?)\]]/.test(letztes)) pruefen();
  });
  feld.addEventListener('blur', pruefen);
  return pruefen;
};

/* ---------------------------------------------------------------- Rahmen */
PU.gemeindeZeichnen = async function () {
  const ziel = document.getElementById('view-gemeinde');
  if (!ziel) return;
  ziel.innerHTML = '<p class="leer-hinweis">Lade Gemeinde …</p>';
  let s;
  try { s = await PU.ruf('gemeinde_start'); }
  catch (e) { ziel.innerHTML = '<p class="fehler">' + PU.h(e.message) + '</p>'; return; }
  PU.gem.start = s;
  PU.piiLaden();

  ziel.innerHTML = '';
  ziel.appendChild(PU.el('h1', '', 'Gemeinde'));
  ziel.appendChild(PU.el('p', 'hinweis',
    'Prompts, Skills und Plugins aus vielen Academies — unter Synonymen, ohne Namen. ' +
    'Jedes Werk hat ein Mensch geprüft, bevor du es siehst.'));

  if (!s.registriert) {
    ziel.appendChild(PU.el('div', 'karte gemeinde-hinweis',
      '<p><b>Die Gemeinde gibt es nur für registrierte Academies.</b></p>' +
      '<p class="klein">Im Cockpit unter „Server &amp; Registrierung“ mit dem Code aus der Zahlung registrieren. ' +
      'Deine eigenen Produkte kannst du trotzdem schon vorbereiten.</p>'));
  }

  const syn = PU.el('div', 'gemeinde-synonym');
  if (s.synonym && !s.synonym_fehler) {
    syn.innerHTML = 'Du trittst auf als <b>' + PU.h(s.synonym) + '</b>. ' +
      '<span class="klein">Ändern unter Einstellungen → Profil → Pseudonym.</span>';
  } else {
    syn.className += ' gemeinde-synonym-fehlt';
    syn.innerHTML = '<b>Wähle zuerst dein Synonym</b> (Einstellungen → Profil → Pseudonym). ' +
      PU.h(s.synonym_fehler || '') + ' <span class="klein">Echte Namen sind verboten.</span>';
  }
  ziel.appendChild(syn);

  const reiter = PU.el('div', 'gemeinde-reiter');
  reiter.setAttribute('role', 'tablist');
  const flaeche = PU.el('div', 'gemeinde-flaeche');
  const liste = [['schaufenster', 'Schaufenster']];
  if (s.darf.veroeffentlichen) liste.push(['produkte', 'Meine Produkte']);
  if (s.darf.siegeln) liste.push(['siegeln', 'Gegenzeichnen']);
  liste.forEach(([k, name]) => {
    const b = PU.el('button', 'knopf still' + (PU.gem.reiter === k ? ' aktiv' : ''), name);
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', PU.gem.reiter === k ? 'true' : 'false');
    b.addEventListener('click', () => { PU.gem.reiter = k; PU.gemeindeZeichnen(); });
    reiter.appendChild(b);
  });
  ziel.appendChild(reiter);
  ziel.appendChild(flaeche);

  if (PU.gem.reiter === 'produkte' && s.darf.veroeffentlichen) PU.produkteZeichnen(flaeche, false);
  else if (PU.gem.reiter === 'siegeln' && s.darf.siegeln) PU.produkteZeichnen(flaeche, true);
  else if (s.registriert) PU.schaufensterZeichnen(flaeche);
};

/* ---------------------------------------------------------------- Schaufenster */
PU.schaufensterZeichnen = async function (flaeche, anhaengen) {
  const s = PU.gem.start;
  if (!anhaengen) {
    flaeche.innerHTML = '';
    const filter = PU.el('div', 'gemeinde-filter');
    const auswahl = (name, werte, leer) => {
      const sel = document.createElement('select');
      sel.setAttribute('aria-label', leer);
      sel.innerHTML = '<option value="">' + PU.h(leer) + '</option>' + Object.entries(werte).map(([k, v]) =>
        '<option value="' + PU.h(Array.isArray(werte) ? v : k) + '"' +
        ((PU.gem.filter[name] || '') === (Array.isArray(werte) ? v : k) ? ' selected' : '') + '>' +
        PU.h(Array.isArray(werte) ? v : k + ' — ' + v) + '</option>').join('');
      sel.addEventListener('change', () => { PU.gem.filter[name] = sel.value; PU.gem.seite = 0; PU.schaufensterZeichnen(flaeche); });
      return sel;
    };
    filter.appendChild(auswahl('hauptfeld', s.kategorien.hauptfeld, 'Alle Felder'));
    filter.appendChild(auswahl('art', s.kategorien.art, 'Alle Arten'));
    filter.appendChild(auswahl('zielgruppe', s.kategorien.zielgruppe, 'Für alle'));
    if (PU.gem.filter.rufname) {
      const weg = PU.el('button', 'knopf still schmal', 'Profil: ' + PU.h(PU.gem.filter.rufname) + ' ✕');
      weg.type = 'button';
      weg.addEventListener('click', () => { delete PU.gem.filter.rufname; PU.gem.seite = 0; PU.schaufensterZeichnen(flaeche); });
      filter.appendChild(weg);
    }
    flaeche.appendChild(filter);
    flaeche.appendChild(PU.el('div', 'gemeinde-raster'));
    flaeche.appendChild(PU.el('div', 'gemeinde-mehr'));
  }
  const raster = flaeche.querySelector('.gemeinde-raster');
  const mehr = flaeche.querySelector('.gemeinde-mehr');
  mehr.innerHTML = '<p class="leer-hinweis">Lade Werke …</p>';
  let j;
  try { j = await PU.ruf('gemeinde_werke', Object.assign({ seite: PU.gem.seite }, PU.gem.filter)); }
  catch (e) { mehr.innerHTML = '<p class="fehler">' + PU.h(e.message) + '</p>'; return; }
  if (!j.ok) { mehr.innerHTML = '<p class="fehler">' + PU.h(j.text || 'Die Gemeinde antwortet nicht.') + '</p>'; return; }
  mehr.innerHTML = '';
  if (!j.werke.length && !PU.gem.seite) {
    raster.innerHTML = '<p class="leer-hinweis">Noch keine Werke' + (Object.values(PU.gem.filter).some(v => v) ? ' für diese Auswahl' : '') + '.</p>';
    return;
  }
  j.werke.forEach(w => raster.appendChild(PU.werkKarte(w)));
  if (j.mehr) {
    const b = PU.el('button', 'knopf still', 'Mehr laden');
    b.type = 'button';
    b.addEventListener('click', () => { PU.gem.seite++; PU.schaufensterZeichnen(flaeche, true); });
    mehr.appendChild(b);
  }
};

PU.werkKarte = function (w) {
  const k = PU.el('button', 'werk-karte');
  k.type = 'button';
  k.setAttribute('aria-label', w.titel + ' von ' + w.rufname);
  k.innerHTML =
    // Vom Server, aber geprüft: nur Base64 kommt in die Adresse, nur Zahlen in die Zähler.
    (/^[A-Za-z0-9+\/=]+$/.test(w.vorschau || '') ? '<img alt="" src="data:image/jpeg;base64,' + w.vorschau + '">'
      : '<span class="werk-ohne-bild" aria-hidden="true">🔥</span>') +
    '<span class="werk-karte-text"><b>' + PU.h(w.titel) + '</b>' +
    '<span class="klein">' + PU.h(w.rufname) + ' · ' + PU.h(w.art) + '</span>' +
    '<span class="werk-zahlen"><span title="Likes">' + (w.ich_like ? '♥' : '♡') + ' ' + Number(w.likes) + '</span>' +
    '<span title="Kommentare">💬 ' + Number(w.kommentare) + '</span></span></span>';
  k.addEventListener('click', () => PU.werkOeffnen(w.id));
  return k;
};

/* ---------------------------------------------------------------- Ein Werk */
PU.werkOeffnen = async function (id) {
  const f = PU.modalZeigen('Werk');
  if (!f) return;
  f.innerHTML = '<p class="leer-hinweis">Lade …</p>';
  let j;
  try { j = await PU.ruf('gemeinde_werk', { id: id }); }
  catch (e) { f.innerHTML = '<p class="fehler">' + PU.h(e.message) + '</p>'; return; }
  if (!j.ok) { f.innerHTML = '<p class="fehler">' + PU.h(j.text || '') + '</p>'; return; }
  const w = j.werk;
  const s = PU.gem.start;
  f.innerHTML = '';
  const kopf = PU.el('div', 'werk-detail');
  const bild = PU.el('div', 'werk-detail-bild', '<p class="leer-hinweis">Bild …</p>');
  kopf.appendChild(bild);
  const text = PU.el('div', 'werk-detail-text');
  text.innerHTML = '<h2>' + PU.h(w.titel) + '</h2>' +
    '<p>' + PU.h(w.beschreibung).replace(/\n/g, '<br>') + '</p>' +
    '<p class="klein">von <button type="button" class="verweis" data-profil>' + PU.h(w.rufname) + '</button> · ' +
    PU.h(s.kategorien.hauptfeld[w.hauptfeld] || w.hauptfeld) + ' · ' + PU.h(w.art) + ' · für ' + PU.h(w.zielgruppe) +
    ' · ' + PU.h(w.medium) + ' · ' + PU.h(w.werklizenz) + '</p>' +
    '<ul class="werk-dateien">' + w.dateien.map(d => '<li><code>' + PU.h(d.pfad) + '</code> <span class="klein">' +
      Number(d.bytes) + ' Byte</span></li>').join('') + '</ul>';
  const knoepfe = PU.el('div', 'werk-knoepfe');
  const like = PU.el('button', 'knopf' + (w.ich_like ? '' : ' still'), (w.ich_like ? '♥ ' : '♡ ') + Number(w.likes));
  like.type = 'button';
  like.disabled = w.mein || !s.darf.mitmachen;
  like.title = w.mein ? 'Das eigene Werk kann man nicht liken.' : 'Gefällt mir';
  like.addEventListener('click', async () => {
    const r = await PU.ruf('gemeinde_like', { id: w.id, an: !w.ich_like });
    if (!r.ok) { PU.melden(PU.h(r.text || ''), 'warnung'); return; }
    w.ich_like = r.ich_like; w.likes = r.likes;
    like.className = 'knopf' + (w.ich_like ? '' : ' still');
    like.textContent = (w.ich_like ? '♥ ' : '♡ ') + w.likes;
  });
  const laden = PU.el('button', 'knopf still', 'Herunterladen (ZIP)');
  laden.type = 'button';
  laden.addEventListener('click', async () => {
    const r = await PU.ruf('gemeinde_paket', { id: w.id });
    if (!r.ok) { PU.melden(PU.h(r.text || ''), 'warnung'); return; }
    const roh = Uint8Array.from(atob(r.inhalt), c => c.charCodeAt(0));
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([roh], { type: 'application/zip' }));
    a.download = (w.titel.replace(/[^\p{L}\p{N} _-]/gu, '').trim() || 'werk') + '.zip';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  });
  knoepfe.appendChild(like);
  knoepfe.appendChild(laden);
  if (s.darf.mitmachen && !w.mein) knoepfe.appendChild(PU.meldenKnopf('werk', w.id));
  text.appendChild(knoepfe);
  kopf.appendChild(text);
  f.appendChild(kopf);
  text.querySelector('[data-profil]').addEventListener('click', () => {
    PU.gem.filter = { rufname: w.rufname }; PU.gem.seite = 0; PU.gem.reiter = 'schaufenster';
    PU.modalSchliessen && PU.modalSchliessen();
    PU.gemeindeZeichnen();
  });

  PU.ruf('gemeinde_bild', { id: w.id }).then(r => {
    bild.innerHTML = r.bild ? '<img alt="Bild zum Werk" src="' + r.bild + '">' : '<span class="werk-ohne-bild">🔥</span>';
  }).catch(() => { bild.innerHTML = ''; });

  // Kommentare: oben die Liste, darunter das Feld.
  const komm = PU.el('section', 'werk-kommentare');
  komm.appendChild(PU.el('h3', '', 'Kommentare'));
  const liste = PU.el('div', 'kommentar-liste');
  komm.appendChild(liste);
  const oben = j.kommentare.filter(c => c.antwort_auf === null);
  if (!oben.length) liste.appendChild(PU.el('p', 'leer-hinweis', 'Noch keine Kommentare.'));
  oben.forEach(c => {
    liste.appendChild(PU.kommentarZeile(c, w, false));
    j.kommentare.filter(a => a.antwort_auf === c.id).forEach(a => liste.appendChild(PU.kommentarZeile(a, w, true)));
  });
  if (s.darf.mitmachen) komm.appendChild(PU.kommentarFeld(w, null));
  f.appendChild(komm);
};

PU.kommentarZeile = function (c, w, antwort) {
  const z = PU.el('div', 'kommentar' + (antwort ? ' kommentar-antwort' : '') + (c.wartet ? ' kommentar-wartet' : ''));
  z.innerHTML = '<p class="kommentar-kopf"><b>' + PU.h(c.rufname) + '</b> <span class="klein">' +
    PU.h((c.zeitpunkt || '').slice(0, 10)) + (c.wartet ? ' · wartet auf Prüfung — nur du siehst ihn' : '') + '</span></p>' +
    '<p>' + PU.h(c.text).replace(/\n/g, '<br>') + '</p>';
  const s = PU.gem.start;
  if (s.darf.mitmachen && !c.wartet) {
    const leiste = PU.el('div', 'kommentar-leiste');
    if (!antwort) {
      const b = PU.el('button', 'verweis', 'Antworten');
      b.type = 'button';
      b.addEventListener('click', () => { b.remove(); z.appendChild(PU.kommentarFeld(w, c.id)); });
      leiste.appendChild(b);
    }
    if (!c.mein) leiste.appendChild(PU.meldenKnopf('kommentar', String(c.id)));
    z.appendChild(leiste);
  }
  return z;
};

PU.kommentarFeld = function (w, antwortAuf) {
  const form = PU.el('div', 'kommentar-feld');
  const feld = document.createElement('textarea');
  feld.rows = antwortAuf ? 2 : 3;
  feld.maxLength = 1000;
  feld.placeholder = antwortAuf ? 'Antworten …' : 'Was hältst du davon? (keine Namen, keine Orte, keine Nummern)';
  feld.setAttribute('aria-label', antwortAuf ? 'Antwort' : 'Kommentar');
  const knopf = PU.el('button', 'knopf', antwortAuf ? 'Antworten' : 'Kommentieren');
  knopf.type = 'button';
  form.appendChild(feld);
  form.appendChild(knopf);
  const pruefen = PU.piiFeld(feld, form);
  knopf.addEventListener('click', async () => {
    pruefen();
    if (!feld.value.trim()) return;
    knopf.disabled = true;
    try {
      const r = await PU.ruf('gemeinde_kommentar', { id: w.id, text: feld.value, antwort_auf: antwortAuf });
      if (!r.ok) { PU.melden(PU.h(r.text || 'Nicht angenommen.'), 'warnung'); knopf.disabled = false; return; }
      if (r.regeln && r.regeln.length) PU.verbotsregelZeigen(form, r.regeln);
      PU.melden(r.status === 'sichtbar' ? 'Kommentar steht.' : 'Kommentar wartet auf eine Prüfung.', r.status === 'sichtbar' ? 'gut' : 'warnung');
      setTimeout(() => PU.werkOeffnen(w.id), r.regeln && r.regeln.length ? 2500 : 0);
    } catch (e) { PU.melden(PU.h(e.message), 'warnung'); knopf.disabled = false; }
  });
  return form;
};

PU.meldenKnopf = function (art, ziel) {
  const b = PU.el('button', 'verweis melden-knopf', 'Melden');
  b.type = 'button';
  b.addEventListener('click', async () => {
    const grund = prompt('Was stimmt nicht? (kurz, ohne Namen)');
    if (grund === null) return;
    const r = await PU.ruf('gemeinde_melden', { ziel_art: art, ziel: ziel, grund: grund });
    PU.melden(r.ok ? 'Gemeldet. Ein Mensch sieht es sich an.' : PU.h(r.text || ''), r.ok ? 'gut' : 'warnung');
    if (r.ok) { b.disabled = true; b.textContent = 'Gemeldet'; }
  });
  return b;
};

/* ---------------------------------------------------------------- Meine Produkte */
PU.produkteZeichnen = async function (flaeche, nurSiegeln) {
  flaeche.innerHTML = '<p class="leer-hinweis">Lade Produkte …</p>';
  let j;
  try { j = await PU.ruf('produkte', { abgleichen: !nurSiegeln && PU.gem.start.registriert }); }
  catch (e) { flaeche.innerHTML = '<p class="fehler">' + PU.h(e.message) + '</p>'; return; }
  flaeche.innerHTML = '';

  if (nurSiegeln) {
    flaeche.appendChild(PU.el('p', 'hinweis', 'Werke Minderjähriger gehen erst mit deinem Mit-Siegel in die Gemeinde. ' +
      'Sieh dir Titel, Beschreibung, Bild und Dateien an: Stehen dort persönliche Angaben oder etwas, das nicht in eine Schulgemeinde gehört?'));
    if (!j.siegeln.length) { flaeche.appendChild(PU.el('p', 'leer-hinweis', 'Nichts wartet auf dein Mit-Siegel.')); return; }
    j.siegeln.forEach(p => flaeche.appendChild(PU.produktKarte(p, true)));
    return;
  }

  flaeche.appendChild(PU.el('p', 'hinweis', 'Produkte kommen per Klick aus der Werkstatt oder dem Dashboard. ' +
    'Hier kannst du auch Dateien selbst einlegen. In die Gemeinde geht ein Produkt erst, wenn es ein <b>Bild</b> und eine ' +
    '<b>Kategorie</b> hat und du es freischaltest. Dann prüft der Server vor, und ein Mensch gibt frei.'));
  flaeche.appendChild(PU.produktEinlegen(flaeche));
  if (!j.eigene.length) flaeche.appendChild(PU.el('p', 'leer-hinweis', 'Noch keine Produkte.'));
  j.eigene.forEach(p => flaeche.appendChild(PU.produktKarte(p, false)));
};

/** Datei → base64 (ohne Kopf). */
PU.dateiBase64 = function (datei) {
  return new Promise((ja, nein) => {
    const l = new FileReader();
    l.onload = () => ja(String(l.result).replace(/^data:[^,]*,/, ''));
    l.onerror = () => nein(new Error('Datei nicht lesbar: ' + datei.name));
    l.readAsDataURL(datei);
  });
};

PU.produktEinlegen = function (flaeche) {
  const k = PU.el('details', 'karte produkt-einlegen');
  k.innerHTML = '<summary>Produkt von Hand einlegen</summary>';
  const titel = document.createElement('input');
  titel.type = 'text'; titel.maxLength = 80; titel.placeholder = 'Titel';
  titel.setAttribute('aria-label', 'Titel');
  const beschr = document.createElement('textarea');
  beschr.rows = 3; beschr.maxLength = 1000; beschr.placeholder = 'Was es tut und für wen (ohne Namen)';
  beschr.setAttribute('aria-label', 'Beschreibung');
  const dateien = document.createElement('input');
  dateien.type = 'file'; dateien.multiple = true;
  dateien.accept = '.md,.txt,.json,.yaml,.yml,.csv,.py,.js,.mjs,.ts,.php,.html,.css,.zip';
  dateien.setAttribute('aria-label', 'Dateien oder ein ZIP');
  const knopf = PU.el('button', 'knopf', 'Einlegen');
  knopf.type = 'button';
  const ort = PU.el('div', 'produkt-einlegen-felder');
  [titel, beschr].forEach(f => { ort.appendChild(f); PU.piiFeld(f, ort); });
  ort.appendChild(PU.el('p', 'klein', 'Dateien: Text (md, txt, json, yaml, csv, py, js, ts, php, html, css) oder ein ZIP. Höchstens 2 MB.'));
  ort.appendChild(dateien);
  ort.appendChild(knopf);
  k.appendChild(ort);
  knopf.addEventListener('click', async () => {
    if (!titel.value.trim() || !dateien.files.length) { PU.melden('Titel und mindestens eine Datei.', 'warnung'); return; }
    knopf.disabled = true;
    try {
      const liste = [...dateien.files];
      const daten = { titel: titel.value, beschreibung: beschr.value, herkunft: 'eingelegt' };
      if (liste.length === 1 && /\.zip$/i.test(liste[0].name)) daten.zip = await PU.dateiBase64(liste[0]);
      else daten.dateien = await Promise.all(liste.map(async d => ({ pfad: d.name, inhalt: await PU.dateiBase64(d) })));
      const r = await PU.ruf('produkt_anlegen', daten);
      if (!r.ok) { PU.melden(PU.h(r.text || 'Nicht angenommen.'), 'warnung'); knopf.disabled = false; return; }
      PU.melden('Eingelegt. Jetzt Bild und Kategorie setzen.', 'gut');
      PU.produkteZeichnen(flaeche, false);
    } catch (e) { PU.melden(PU.h(e.message), 'warnung'); knopf.disabled = false; }
  });
  return k;
};

PU.produktStand = function (p) {
  const st = {
    '': ['lokal', 'Nur hier. Noch nicht in der Gemeinde.'],
    wartet_auf_freigabe: ['wartet', 'Hochgeladen. Ein Mensch prüft es.'],
    frei: ['frei', 'In der Gemeinde sichtbar.'],
    abgelehnt: ['abgelehnt', 'Abgelehnt: ' + (p.ablehnung || '')],
    widerrufen: ['zurückgezogen', 'Aus der Gemeinde genommen.']
  }[p.server_status] || [p.server_status, ''];
  return '<span class="produkt-stand produkt-' + PU.h(p.server_status || 'lokal') + '">' + PU.h(st[0]) + '</span> ' +
    '<span class="klein">' + PU.h(st[1]) + '</span>';
};

PU.produktKarte = function (p, siegeln) {
  const s = PU.gem.start;
  const k = PU.el('article', 'karte produkt-karte');
  const bild = PU.el('div', 'produkt-bild', p.bild ? '<img alt="Bild des Produkts" src="' + p.bild + '">'
    : '<span class="produkt-bild-fehlt">Bild fehlt</span>');
  k.appendChild(bild);
  const rechts = PU.el('div', 'produkt-rechts');
  k.appendChild(rechts);
  const fehlt = { bild: 'Bild', kategorie: 'Kategorie', siegel: 'Mit-Siegel', synonym: 'Synonym' };
  const liste = ['bild', 'kategorie'].concat(p.minderjaehrig ? ['siegel'] : [], ['synonym']);

  if (siegeln) {
    rechts.innerHTML = '<h3>' + PU.h(p.titel) + '</h3><p class="klein">von ' + PU.h(p.urheber) + ' (nur hier sichtbar)</p>' +
      '<p>' + PU.h(p.beschreibung) + '</p><ul class="werk-dateien">' + (p.dateien || []).map(d =>
        '<li><code>' + PU.h(d.pfad) + '</code></li>').join('') + '</ul>';
    const b = PU.el('button', 'knopf', 'Mit-Siegel geben');
    b.type = 'button';
    b.addEventListener('click', async () => {
      if (!confirm('Mit-Siegel geben?\n\nDu bestätigst: Das Werk enthält nichts Persönliches und passt in eine Schulgemeinde.')) return;
      await PU.ruf('produkt_siegeln', { id: p.id });
      PU.melden('Gegengezeichnet.', 'gut');
      k.remove();
    });
    rechts.appendChild(b);
    return k;
  }

  const bearbeitbar = p.bearbeitbar;
  rechts.innerHTML = '<p>' + PU.produktStand(p) + '</p>' +
    '<ul class="produkt-liste">' + liste.map(f => '<li class="' + (p.fehlt.indexOf(f) >= 0 ? 'fehlt' : 'da') + '">' +
      (p.fehlt.indexOf(f) >= 0 ? '✕ ' : '✓ ') + fehlt[f] + '</li>').join('') + '</ul>';
  const felder = PU.el('div', 'produkt-felder');
  const titel = document.createElement('input');
  titel.type = 'text'; titel.maxLength = 80; titel.value = p.titel; titel.disabled = !bearbeitbar;
  titel.setAttribute('aria-label', 'Titel');
  const beschr = document.createElement('textarea');
  beschr.rows = 3; beschr.maxLength = 1000; beschr.value = p.beschreibung; beschr.disabled = !bearbeitbar;
  beschr.setAttribute('aria-label', 'Beschreibung');
  felder.appendChild(titel);
  felder.appendChild(beschr);
  [titel, beschr].forEach(f => PU.piiFeld(f, felder));
  const zeile = PU.el('div', 'produkt-kategorie');
  const wahl = (name, werte, leer) => {
    const sel = document.createElement('select');
    sel.name = name; sel.disabled = !bearbeitbar;
    sel.setAttribute('aria-label', leer);
    sel.innerHTML = '<option value="">' + PU.h(leer) + '</option>' + Object.entries(werte).map(([kk, v]) => {
      const wert = Array.isArray(werte) ? v : kk;
      return '<option value="' + PU.h(wert) + '"' + (p[name] === wert ? ' selected' : '') + '>' +
        PU.h(Array.isArray(werte) ? v : kk + ' — ' + v) + '</option>';
    }).join('');
    zeile.appendChild(sel);
    return sel;
  };
  const w = {
    hauptfeld: wahl('hauptfeld', s.kategorien.hauptfeld, 'Feld wählen'),
    art: wahl('art', s.kategorien.art, 'Art wählen'),
    zielgruppe: wahl('zielgruppe', s.kategorien.zielgruppe, 'Für wen'),
    medium: wahl('medium', s.kategorien.medium, 'Ergebnis'),
    lizenz: wahl('lizenz', s.kategorien.lizenz, 'Lizenz')
  };
  if (!w.lizenz.value) w.lizenz.value = p.lizenz || 'CC-BY-4.0';
  felder.appendChild(zeile);
  rechts.appendChild(felder);
  if (p.dateien && p.dateien.length) {
    rechts.appendChild(PU.el('p', 'klein', 'Dateien: ' + p.dateien.map(d => '<code>' + PU.h(d.pfad) + '</code>').join(', ')));
  }

  const knoepfe = PU.el('div', 'werk-knoepfe');
  if (bearbeitbar) {
    const speichern = PU.el('button', 'knopf still', 'Speichern');
    speichern.type = 'button';
    speichern.addEventListener('click', async () => {
      const r = await PU.ruf('produkt_aendern', { id: p.id, titel: titel.value, beschreibung: beschr.value,
        hauptfeld: w.hauptfeld.value, art: w.art.value, zielgruppe: w.zielgruppe.value, medium: w.medium.value, lizenz: w.lizenz.value });
      if (r.regeln && r.regeln.length) PU.verbotsregelZeigen(felder, r.regeln);
      PU.melden('Gespeichert.', 'gut');
      setTimeout(() => PU.gemeindeZeichnen(), r.regeln && r.regeln.length ? 2500 : 300);
    });
    const bildWahl = document.createElement('input');
    bildWahl.type = 'file'; bildWahl.accept = 'image/png,image/jpeg,image/gif'; bildWahl.className = 'hidden';
    bildWahl.setAttribute('aria-label', 'Bild wählen');
    const bildKnopf = PU.el('button', 'knopf still', p.bild ? 'Bild ändern' : 'Bild wählen');
    bildKnopf.type = 'button';
    bildKnopf.addEventListener('click', () => bildWahl.click());
    bildWahl.addEventListener('change', async () => {
      const d = bildWahl.files[0];
      if (!d) return;
      if (d.size > 1048576) { PU.melden('Das Bild ist größer als 1 MB.', 'warnung'); return; }
      try {
        const r = await PU.ruf('produkt_bild', { id: p.id, bild: await PU.dateiBase64(d) });
        if (r.bild) bild.innerHTML = '<img alt="Bild des Produkts" src="' + r.bild + '">';
        PU.gemeindeZeichnen();
      } catch (e) { PU.melden(PU.h(e.message), 'warnung'); }
    });
    const frei = PU.el('button', 'knopf', 'Freischalten');
    frei.type = 'button';
    frei.disabled = !p.freischaltbar || !s.registriert;
    frei.title = !s.registriert ? 'Erst registrieren (Cockpit).' : (p.freischaltbar ? 'In die Gemeinde geben'
      : 'Es fehlt noch: ' + p.fehlt.map(f => fehlt[f]).join(', '));
    frei.addEventListener('click', async () => {
      if (!confirm('Freischalten?\n\nDas Produkt geht an den Server. Ein LLM prüft vor, ein Mensch entscheidet. ' +
                   'In der Gemeinde erscheint es unter deinem Synonym.')) return;
      frei.disabled = true;
      const r = await PU.ruf('produkt_freischalten', { id: p.id });
      if (!r.ok) {
        if (r.hart && r.hart.length) PU.verbotsregelZeigen(felder, r.hart.map(h => ({ titel: h.titel + ' (' + h.datei + ')', text: h.text || '' })));
        PU.melden(PU.h(r.text || 'Nicht angenommen.'), 'warnung');
        frei.disabled = false;
        return;
      }
      PU.melden('Hochgeladen. Es wartet jetzt auf die Freigabe.', 'gut');
      PU.gemeindeZeichnen();
    });
    const weg = PU.el('button', 'verweis', 'Löschen');
    weg.type = 'button';
    weg.addEventListener('click', async () => {
      if (!confirm('Dieses Produkt hier löschen?')) return;
      await PU.ruf('produkt_loeschen', { id: p.id });
      k.remove();
    });
    [speichern, bildKnopf, bildWahl, frei, weg].forEach(x => knoepfe.appendChild(x));
  } else {
    const zurueck = PU.el('button', 'knopf still', 'Zurückziehen');
    zurueck.type = 'button';
    zurueck.addEventListener('click', async () => {
      if (!confirm('Aus der Gemeinde zurückziehen?')) return;
      const r = await PU.ruf('produkt_zurueckziehen', { id: p.id });
      PU.melden(r.ok ? 'Zurückgezogen.' : PU.h(r.text || ''), r.ok ? 'gut' : 'warnung');
      PU.gemeindeZeichnen();
    });
    knoepfe.appendChild(zurueck);
  }
  rechts.appendChild(knoepfe);
  return k;
};
