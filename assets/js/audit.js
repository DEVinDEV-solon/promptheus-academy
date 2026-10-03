/* PROMPTHEUS — Einstellungen › Audit-Trail.
 *
 * Was Academy, Schutzschicht und Werkstatt getan haben, nachprüfbar: jede
 * Modellanfrage der Werkstatt (mit Art und Anzahl der Ersetzungen, nie mit
 * Inhalt), jede Werkstatt-Sitzung (Anfragen, Antworten, Werkzeuge, Freigaben),
 * jede Protokollzeile der Academy. Alles hash-verkettet (srv/audit.php).
 *
 * Wer `audit.alles` hat, sieht alles, prüft die Kette und liest die
 * Werkstatt-Protokolle ein. Alle anderen sehen, was in ihrem Namen geschah.
 */

const AUDIT_ERGEBNIS = {
  success: 'erfolgreich', allowed: 'erlaubt', blocked: 'angehalten', denied: 'abgelehnt',
  error: 'Fehler', pending: 'offen'
};
const AUDIT_STUFE = { info: 'Info', warning: 'Warnung', critical: 'kritisch' };
const AUDIT_AKTEUR = { user: 'Person', agent: 'Agent', system: 'System' };
const AUDIT_MASKIERT = {
  geheim: 'bekannte Geheimwerte', muster: 'Schlüssel nach Muster', person: 'Kontonamen',
  pii: 'persönliche Angaben', pii_weich: 'mögliche Namen (nur gezählt)'
};
const AUDIT_AKTION = {
  llm_anfrage: 'Modellanfrage', schutzschicht_start: 'Schutzschicht gestartet', prompt: 'Anfrage',
  chat_response: 'Antwort', tool_result: 'Werkzeug', tool_attempt: 'Werkzeug (offen)',
  context_injected: 'Kontext', approval_asked: 'Freigabe erbeten', approval_decided: 'Freigabe entschieden',
  session_start: 'Sitzung begonnen', session_end: 'Sitzung beendet', command: 'Befehl',
  fremde_anfrage: 'fremde Anfrage', audit_pruefen: 'Kette geprüft', audit_export: 'Export'
};

const auditZustand = { filter: {}, seite: 1, je: 50, alles: false, pruefung: null };

function auditZeit(ts) {
  if (!ts) return '–';
  const d = new Date(ts);
  return isNaN(d) ? ts : d.toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'medium' });
}

/** Eine Zeile Balken: Wert relativ zum grössten. Zahl steht immer daneben. */
function auditBalken(titel, werte, namen) {
  const kasten = PU.el('section', 'audit-diagramm');
  kasten.appendChild(PU.el('h4', '', PU.h(titel)));
  const eintraege = Object.entries(werte || {});
  if (eintraege.length === 0) { kasten.appendChild(PU.el('p', 'klein', 'Noch nichts.')); return kasten; }
  const max = Math.max(1, ...eintraege.map(e => e[1]));
  const liste = PU.el('ul', 'audit-balken');
  eintraege.forEach(([k, n]) => {
    const li = PU.el('li');
    li.innerHTML = '<span class="audit-balken-name">' + PU.h((namen && namen[k]) || k || '–') + '</span>' +
      '<span class="audit-balken-spur"><span style="width:' + Math.max(2, Math.round(n * 100 / max)) + '%"></span></span>' +
      '<span class="audit-balken-zahl">' + n + '</span>';
    liste.appendChild(li);
  });
  kasten.appendChild(liste);
  return kasten;
}

/** Die Erklärungen — aufklappbar, damit die Kontrolle oben bleibt. */
function auditErklaerung() {
  const d = PU.el('details', 'audit-erklaerung');
  d.innerHTML =
    '<summary>Was der Audit-Trail ist und wie die Werkstatt geschützt wird</summary>' +
    '<h4>Der Audit-Trail</h4>' +
    '<p>Ein Protokoll, das niemand unbemerkt ändern kann. Jeder Eintrag trägt einen Fingerabdruck ' +
    '(SHA-256), der den Fingerabdruck des vorigen Eintrags mit einrechnet — eine Kette. Ändert jemand ' +
    'später einen Eintrag, passt ab dieser Stelle kein Fingerabdruck mehr; „Kette prüfen“ zeigt die ' +
    'genaue Laufnummer. Eine Ankerdatei daneben merkt sich das letzte Glied, damit auch das Löschen der ' +
    'neuesten Einträge auffällt. Die Einträge liegen in einer eigenen Datenbank (<code>data/audit/</code>), ' +
    'getrennt von den Lernständen, und lassen sich nur anhängen.</p>' +
    '<h4>Die Schutzschicht vor dem Sprachmodell</h4>' +
    '<p>Die Werkstatt spricht nie direkt mit dem Anbieter. Jede Anfrage — deine Eingabe, der ganze ' +
    'Verlauf und alles, was Hephaistos selbst aus Dateien gelesen hat — geht durch die Schutzschicht ' +
    'auf diesem Rechner. Sie ersetzt in vier Schichten:</p>' +
    '<ol>' +
    '<li><b>Bekannte Geheimwerte</b> aus den Einstellungsdateien der Academy und der Werkstatt, wörtlich → <code>[GEHEIM:NAME]</code></li>' +
    '<li><b>Schlüssel nach Muster</b> (API-Schlüssel, Tokens, private Schlüssel) → <code>[REDACTED:typ]</code></li>' +
    '<li><b>Kontonamen</b> dieser Academy, auch echte Namen der Urkunden → <code>[PERSON]</code>. Die Schutzschicht kennt sie nur als Fingerabdrücke.</li>' +
    '<li><b>Persönliche Angaben</b> nach denselben Regeln wie in der Community (Telefon, E-Mail, Kartennummern …) → <code>xxx</code></li>' +
    '</ol>' +
    '<p>Danach der <b>Torschluss</b>: Die fertige Anfrage wird noch einmal gegen jeden bekannten Wert ' +
    'geprüft. Übersteht einer die Ersetzung, geht nichts hinaus — der Eintrag steht dann hier als ' +
    '„angehalten“, Stufe kritisch. Anfragen, die kein prüfbares Format haben, gehen ebenfalls nicht hinaus.</p>' +
    '<p>Der Schlüssel für den Anbieter liegt nur bei der Schutzschicht. Die Werkstatt selbst hat einen ' +
    'Platzhalter und kann den echten Schlüssel deshalb weder nennen noch weitergeben.</p>' +
    '<h4>Was gespeichert wird — und was nie</h4>' +
    '<div class="tabellenrahmen"><table><thead><tr><th>Was</th><th>Wie</th><th>Wie lange</th></tr></thead><tbody>' +
    '<tr><td>Modellanfrage der Werkstatt</td><td>Zeit, Modell, Grösse, Art und Anzahl der Ersetzungen — kein Inhalt</td><td>365 Tage</td></tr>' +
    '<tr><td>Deine Anfrage, die Antwort</td><td>gekürzt auf 500 Zeichen, maskiert</td><td>180 Tage</td></tr>' +
    '<tr><td>Werkzeug des Agenten</td><td>Name, Befehl oder Pfad (maskiert), Grösse des Ergebnisses — nie die Ausgabe</td><td>365 Tage</td></tr>' +
    '<tr><td>Freigaben</td><td>gefragt, erlaubt oder abgelehnt (menschliche Aufsicht)</td><td>365 Tage</td></tr>' +
    '<tr><td>Eingeblendeter Kontext</td><td>nur Art und Grösse</td><td>365 Tage</td></tr>' +
    '<tr><td>Schlüssel, Kennwörter, Namen</td><td>nie — nur als <code>[REDACTED]</code>, <code>[GEHEIM]</code>, <code>[PERSON]</code></td><td>–</td></tr>' +
    '</tbody></table></div>' +
    '<h4>Deine Rechte</h4>' +
    '<p>Du siehst hier alles, was in deinem Namen geschah, und kannst es exportieren (DSGVO Art. 15). ' +
    'Die Aufzeichnung der Agenten-Tätigkeit und der Freigaben folgt dem AI Act (Art. 12 Protokollierung, ' +
    'Art. 14 menschliche Aufsicht).</p>';
  return d;
}

PU.auditZeichnen = async function (ziel) {
  ziel.appendChild(PU.el('h3', '', 'Audit-Trail'));
  ziel.appendChild(PU.el('p', 'hinweis',
    'Hier kontrollierst du, was die Werkstatt-Agenten getan haben und was an ein Sprachmodell ging — ' +
    'lückenlos, mit nachprüfbarer Kette, ohne Geheimnisse.'));
  const kopf = PU.el('div', 'audit-kopf');
  ziel.appendChild(kopf);
  ziel.appendChild(auditErklaerung());
  const knoepfe = PU.el('p', 'audit-knoepfe');
  ziel.appendChild(knoepfe);
  const diagramme = PU.el('div', 'audit-diagramme');
  ziel.appendChild(diagramme);
  ziel.appendChild(PU.el('h4', 'audit-zwischen', 'Protokoll'));
  const filter = PU.el('form', 'audit-filter');
  ziel.appendChild(filter);
  const liste = PU.el('div', 'audit-liste');
  ziel.appendChild(liste);

  kopf.appendChild(PU.el('p', 'hinweis', 'Einen Moment …'));
  let stand;
  try { stand = await PU.ruf('audit_stand'); }
  catch (e) { kopf.innerHTML = ''; kopf.appendChild(PU.el('p', 'merkzettel', PU.h(e.message))); return; }
  auditZustand.alles = !!stand.alles;

  auditKopfZeichnen(kopf, stand);
  auditKnoepfeZeichnen(knoepfe, kopf, diagramme, liste);
  auditDiagrammeZeichnen(diagramme, stand.kennzahlen);
  auditFilterZeichnen(filter, stand.kennzahlen, liste);
  auditListeLaden(liste);
};

function auditKopfZeichnen(kopf, stand) {
  kopf.innerHTML = '';
  const k = stand.kennzahlen || {};
  const s = stand.schutzschicht || {};
  const karten = PU.el('div', 'audit-karten');
  const karte = (titel, wert, zusatz, art) => {
    const c = PU.el('div', 'audit-karte' + (art ? ' ' + art : ''));
    c.innerHTML = '<span class="klein">' + PU.h(titel) + '</span><b>' + wert + '</b>' +
      (zusatz ? '<span class="klein">' + zusatz + '</span>' : '');
    karten.appendChild(c);
  };
  karte(auditZustand.alles ? 'Einträge gesamt' : 'Deine Einträge', String(k.gesamt || 0),
    'zuletzt ' + PU.h(auditZeit(k.zuletzt)));
  const sum = Object.values(k.maskiert || {}).reduce((a, b) => a + b, 0);
  karte('Ersetzt vor dem Modell', String(sum),
    Object.entries(k.maskiert || {}).map(([a, n]) => PU.h(AUDIT_MASKIERT[a] || a) + ': ' + n).join(' · ') || 'noch nichts');
  const angehalten = (k.ergebnis && k.ergebnis.blocked) || 0;
  karte('Angehalten', String(angehalten), angehalten ? 'nichts davon ging hinaus' : 'keine Anhaltung', angehalten ? 'warnung' : '');
  if (s.bekannt) {
    karte('Schutzschicht', s.laeuft ? '✓ läuft' : 'aus',
      s.laeuft ? ('Port ' + s.port + ' · ' + s.anfragen + ' Anfragen · ' + s.regeln + ' Regeln')
               : 'läuft mit der Werkstatt; die Werkstatt startet nie ohne sie', s.laeuft ? 'gut' : '');
  } else {
    karte('Schutzschicht', '–', 'noch nie gestartet');
  }
  if (auditZustand.pruefung) {
    const p = auditZustand.pruefung;
    karte('Hash-Kette', p.ok ? '✓ heil' : '✕ gebrochen',
      p.ok ? p.anzahl + ' Einträge, ' + PU.h(p.anker.grund)
           : (p.bruch_seq ? 'ab Laufnummer ' + p.bruch_seq + ': ' + PU.h(p.grund) : PU.h(p.anker.grund)),
      p.ok ? 'gut' : 'schlecht');
  }
  kopf.appendChild(karten);

  if (s.bekannt && Array.isArray(s.quellen) && s.quellen.length) {
    const q = PU.el('p', 'klein audit-quellen');
    q.innerHTML = '<b>Geschützte Quellen:</b> ' + s.quellen.map(x => PU.h(x.titel) + ' (' + (x.anzahl | 0) + ')').join(' · ') +
      ' — die Werte selbst stehen nirgends, auch hier nicht.';
    kopf.appendChild(q);
  }
}

function auditKnoepfeZeichnen(knoepfe, kopf, diagramme, liste) {
  knoepfe.innerHTML = '';
  const knopf = (text, still, tun) => {
    const b = PU.el('button', 'knopf' + (still ? ' still' : ''), text);
    b.type = 'button';
    b.addEventListener('click', async () => {
      b.disabled = true;
      try { await tun(); } catch (e) { (PU.fensterInfo || PU.melden)(PU.h(e.message), 'schlecht'); }
      finally { b.disabled = false; }
    });
    knoepfe.appendChild(b);
  };
  const neuLaden = async () => {
    const stand = await PU.ruf('audit_stand');
    auditKopfZeichnen(kopf, stand);
    diagramme.innerHTML = '';
    auditDiagrammeZeichnen(diagramme, stand.kennzahlen);
    await auditListeLaden(liste);
  };
  if (auditZustand.alles) {
    knopf('Kette prüfen', false, async () => {
      const r = await PU.ruf('audit_pruefen');
      auditZustand.pruefung = r.pruefung;
      await neuLaden();
      (PU.fensterInfo || PU.melden)(r.pruefung.ok
        ? '<b>Die Kette ist heil.</b> ' + r.pruefung.anzahl + ' Einträge nachgerechnet; kein Eintrag wurde verändert, keiner fehlt.'
        : '<b>Die Kette ist nicht heil.</b> ' + PU.h(r.pruefung.grund || r.pruefung.anker.grund) +
          (r.pruefung.bruch_seq ? ' (ab Laufnummer ' + r.pruefung.bruch_seq + ')' : '') +
          '. Exportiere den Trail und melde es der Person, die die Academy betreut.',
        r.pruefung.ok ? 'gut' : 'schlecht');
    });
    knopf('Werkstatt-Protokolle einlesen', true, async () => {
      const r = await PU.ruf('audit_einlesen');
      await neuLaden();
      const s = r.sitzungen || {};
      (PU.fensterInfo || PU.melden)(s.ok
        ? (r.spool.neu + ' neue Einträge übernommen (' + (s.sitzungen | 0) + ' Werkstatt-Sitzungen gelesen).')
        : 'Die Werkstatt-Sitzungen liessen sich nicht lesen (' + PU.h(s.grund || 'unbekannt') + '). ' +
          r.spool.neu + ' Einträge der Schutzschicht übernommen.', s.ok ? 'gut' : 'warnung');
    });
  }
  knopf('Aktualisieren', true, neuLaden);
  knopf('Export CSV', true, () => auditExport('csv'));
  knopf('Export JSON', true, () => auditExport('json'));
}

async function auditExport(format) {
  const r = await PU.ruf('audit_export', { filter: auditZustand.filter, format: format });
  const blob = new Blob([r.inhalt], { type: format === 'json' ? 'application/json' : 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = r.datei;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

function auditDiagrammeZeichnen(ziel, k) {
  k = k || {};
  const tage = {};
  Object.entries(k.pro_tag || {}).forEach(([t, n]) => { tage[t.slice(8, 10) + '.' + t.slice(5, 7) + '.'] = n; });
  ziel.appendChild(auditBalken('Einträge je Tag (14 Tage)', tage));
  ziel.appendChild(auditBalken('Quelle', k.quelle, k.quellen));
  ziel.appendChild(auditBalken('Ergebnis', k.ergebnis, AUDIT_ERGEBNIS));
  ziel.appendChild(auditBalken('Stufe', k.stufe, AUDIT_STUFE));
  ziel.appendChild(auditBalken('Häufigste Aktionen', k.aktion, AUDIT_AKTION));
}

function auditFilterZeichnen(form, k, liste) {
  const auswahl = (name, titel, werte) => {
    const opts = '<option value="">' + PU.h(titel) + ': alle</option>' +
      Object.entries(werte).map(([w, t]) => '<option value="' + PU.h(w) + '">' + PU.h(t) + '</option>').join('');
    return '<label class="klein">' + PU.h(titel) + '<select name="' + name + '">' + opts + '</select></label>';
  };
  form.innerHTML =
    '<label class="klein">Von<input type="date" name="von"></label>' +
    '<label class="klein">Bis<input type="date" name="bis"></label>' +
    auswahl('quelle', 'Quelle', (k && k.quellen) || {}) +
    auswahl('outcome', 'Ergebnis', AUDIT_ERGEBNIS) +
    auswahl('severity', 'Stufe', AUDIT_STUFE) +
    auswahl('actor_type', 'Akteur', AUDIT_AKTEUR) +
    auswahl('action_type', 'Aktion', AUDIT_AKTION) +
    '<label class="klein audit-suche">Suche<input type="search" name="q" placeholder="Beschreibung, Pfad, Aktion"></label>' +
    '<label class="klein">Sitzung<input type="text" name="session_id" placeholder="Sitzungs-Kennung"></label>' +
    '<span class="audit-filter-knoepfe"><button class="knopf" type="submit">Filtern</button>' +
    '<button class="knopf still" type="reset">Zurücksetzen</button></span>';
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = {};
    new FormData(form).forEach((v, n) => { if (String(v).trim() !== '') f[n] = String(v).trim(); });
    auditZustand.filter = f;
    auditZustand.seite = 1;
    auditListeLaden(liste);
  });
  form.addEventListener('reset', () => {
    setTimeout(() => { auditZustand.filter = {}; auditZustand.seite = 1; auditListeLaden(liste); }, 0);
  });
}

async function auditListeLaden(liste) {
  liste.innerHTML = '';
  liste.appendChild(PU.el('p', 'hinweis', 'Einen Moment …'));
  let r;
  try { r = await PU.ruf('audit_liste', { filter: auditZustand.filter, seite: auditZustand.seite, je: auditZustand.je }); }
  catch (e) { liste.innerHTML = ''; liste.appendChild(PU.el('p', 'merkzettel', PU.h(e.message))); return; }
  liste.innerHTML = '';
  if (!r.eintraege.length) {
    liste.appendChild(PU.el('p', 'merkzettel', 'Für diese Auswahl gibt es keine Einträge.'));
    return;
  }
  const rahmen = PU.el('div', 'tabellenrahmen');
  const tab = PU.el('table', 'audit-tabelle');
  tab.innerHTML = '<thead><tr><th>Nr.</th><th>Zeit</th><th>Quelle</th><th>Akteur</th><th>Aktion</th>' +
    '<th>Beschreibung</th><th>Ergebnis</th></tr></thead>';
  const koerper = PU.el('tbody');
  r.eintraege.forEach(e => {
    const z = PU.el('tr', 'audit-zeile stufe-' + PU.h(e.severity));
    z.tabIndex = 0;
    z.innerHTML =
      '<td>' + e.seq + '</td>' +
      '<td>' + PU.h(auditZeit(e.ts)) + '</td>' +
      '<td>' + PU.h(e.quelle || '') + '</td>' +
      '<td>' + PU.h((AUDIT_AKTEUR[e.actor_type] || e.actor_type) + ' · ' + e.actor_id) + '</td>' +
      '<td>' + PU.h(AUDIT_AKTION[e.action_type] || e.action_type) + '</td>' +
      '<td class="audit-beschreibung">' + PU.h(e.action_description) + '</td>' +
      '<td><span class="audit-marke ergebnis-' + PU.h(e.outcome) + '">' + PU.h(AUDIT_ERGEBNIS[e.outcome] || e.outcome) +
      '</span>' + (e.severity !== 'info' ? ' <span class="audit-marke stufe-' + PU.h(e.severity) + '">' +
      PU.h(AUDIT_STUFE[e.severity] || e.severity) + '</span>' : '') + '</td>';
    const detail = PU.el('tr', 'audit-detail hidden');
    const zelle = PU.el('td');
    zelle.colSpan = 7;
    zelle.appendChild(auditDetail(e));
    detail.appendChild(zelle);
    const umschalten = () => { detail.classList.toggle('hidden'); z.classList.toggle('offen'); };
    z.addEventListener('click', umschalten);
    z.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); umschalten(); } });
    koerper.appendChild(z);
    koerper.appendChild(detail);
  });
  tab.appendChild(koerper);
  rahmen.appendChild(tab);
  liste.appendChild(rahmen);

  const seiten = Math.max(1, Math.ceil(r.gesamt / r.je));
  const nav = PU.el('p', 'audit-seiten');
  nav.innerHTML = '<span class="klein">' + r.gesamt + ' Einträge · Seite ' + r.seite + ' von ' + seiten + '</span>';
  const blaettern = (text, seite, aus) => {
    const b = PU.el('button', 'knopf still', text);
    b.type = 'button'; b.disabled = aus;
    b.addEventListener('click', () => { auditZustand.seite = seite; auditListeLaden(liste); });
    nav.appendChild(b);
  };
  blaettern('← Neuere', r.seite - 1, r.seite <= 1);
  blaettern('Ältere →', r.seite + 1, r.seite >= seiten);
  liste.appendChild(nav);
}

/** Alle Felder eines Eintrags, wie im Hermy-Programm: nichts versteckt. */
function auditDetail(e) {
  const dl = PU.el('dl', 'audit-felder');
  const feld = (t, w, code) => {
    if (w === '' || w === null || w === undefined) return;
    dl.appendChild(PU.el('dt', '', PU.h(t)));
    const dd = PU.el('dd');
    dd.innerHTML = code ? '<code>' + PU.h(w) + '</code>' : PU.h(w);
    dl.appendChild(dd);
  };
  feld('Laufnummer', e.seq);
  feld('Kennung', e.audit_id, true);
  feld('Zeit (UTC)', e.ts, true);
  feld('Akteur', (AUDIT_AKTEUR[e.actor_type] || e.actor_type) + ' · ' + e.actor_id + ' · ' + e.actor_role);
  feld('Aktion', e.action_type + ' (' + e.action_category + ')', true);
  feld('Beschreibung', e.action_description);
  feld('Ressource', e.resource, true);
  feld('Ergebnis', (AUDIT_ERGEBNIS[e.outcome] || e.outcome) + ' · ' + (AUDIT_STUFE[e.severity] || e.severity));
  feld('Sitzung', e.session_id, true);
  feld('Modell', e.model, true);
  feld('Personendaten', e.pii_handling);
  feld('Aufbewahrung', e.retention_days + ' Tage');
  const meta = e.metadata || {};
  if (meta.maskiert && Object.keys(meta.maskiert).length) {
    feld('Ersetzt vor dem Modell', Object.entries(meta.maskiert).map(([a, n]) => (AUDIT_MASKIERT[a] || a) + ': ' + n).join(' · '));
  }
  if (meta.torschluss) feld('Torschluss', [].concat(meta.torschluss).join(', '));
  feld('Metadaten', JSON.stringify(meta, null, 2), true);
  feld('Vorgänger-Hash', e.prev_hash, true);
  feld('Eintrags-Hash', e.entry_hash, true);
  return dl;
}
