/* PROMPTHEUS — Muster-Seite Login & Rechte (5 Ebenen)
   Deterministische Ebenen-Matrix; kein Modell vergibt Rechte.
   Ebene 1 = Admin (isoliert, ALLES), Ebene 2 = Schule,
   Ebene 3 = Lehrer, Ebene 4 = Eltern, Ebene 5 = Schüler.
   Ohne Suche — alle Einstellungen komplett aufgeklappt. */

'use strict';

const EBENEN = ['admin', 'schule', 'lehrer', 'eltern', 'schueler'];
const EBENE_LABEL = { admin:'Admin', schule:'Schule', lehrer:'Lehrer', eltern:'Eltern', schueler:'Schüler' };
const EBENE_HINT = { admin:'Plattform · allumfassend', schule:'Schule', lehrer:'Unterricht / Tutor', eltern:'Erziehungsberechtigte', schueler:'einfacher Zugang' };

/* Rechte-Matrix aus Login-Level-Rechte-Plan.md §2. 5 Ebenen. true = darf. */
const MATRIX = [
  { group: 'System & Dashboard', rows: [
    { label: 'dashboard.view', desc: 'Übersichts-Dashboard sehen', g: { admin:1, schule:1, lehrer:1, eltern:1, schueler:1 } },
    { label: 'login.einstellungen', desc: 'Login-/Branding-Einstellungen ändern', g: { admin:1, schule:0, lehrer:0, eltern:0, schueler:0 } },
    { label: 'rechte.einstellungen', desc: 'Rollen- & Rechte-Beschreibung ändern', g: { admin:1, schule:0, lehrer:0, eltern:0, schueler:0 } },
    { label: 'sicherheit.einstellungen', desc: 'DSGVO / Widerruf / Audit-Einstellungen', g: { admin:1, schule:0, lehrer:0, eltern:0, schueler:0 } }
  ]},
  { group: 'Schulverwaltung', rows: [
    { label: 'schulen.manage', desc: 'Schulen anlegen / bearbeiten / löschen (nur Admin)', g: { admin:1, schule:0, lehrer:0, eltern:0, schueler:0 } },
    { label: 'schulen.view', desc: 'Eigene Schule sehen', g: { admin:1, schule:1, lehrer:1, eltern:1, schueler:1 } },
    { label: 'klassen.manage', desc: 'Klassen verwalten', g: { admin:1, schule:1, lehrer:0, eltern:0, schueler:0 } },
    { label: 'klassen.view', desc: 'Klassen ansehen', g: { admin:1, schule:1, lehrer:1, eltern:0, schueler:0 } }
  ]},
  { group: 'Lehrkörper, Eltern & Lernende', rows: [
    { label: 'lehrkraefte.manage', desc: 'Lehrer-Konten anlegen / entfernen', g: { admin:1, schule:1, lehrer:0, eltern:0, schueler:0 } },
    { label: 'lehrkraefte.view', desc: 'Lehrkraft-Daten einsehen', g: { admin:1, schule:1, lehrer:1, eltern:0, schueler:0 } },
    { label: 'eltern.manage', desc: 'Eltern-Konten verwalten', g: { admin:1, schule:1, lehrer:0, eltern:0, schueler:0 } },
    { label: 'eltern.view', desc: 'Eltern-Daten einsehen', g: { admin:1, schule:1, lehrer:0, eltern:0, schueler:0 } },
    { label: 'schueler.view', desc: 'Schüler-Daten einsehen (Durchschnitt)', g: { admin:1, schule:1, lehrer:1, eltern:0, schueler:0 } },
    { label: 'schueler.selbst', desc: 'Eigenen Lern-Fortschritt sehen (nur eigen)', g: { admin:0, schule:0, lehrer:0, eltern:0, schueler:1 } },
    { label: 'lernende.manage', desc: 'Lernende erfassen / entfernen', g: { admin:1, schule:1, lehrer:1, eltern:0, schueler:0 } },
    { label: 'rollen.manage', desc: 'Rollen & Rechte (RBAC) verwalten (nur Admin)', g: { admin:1, schule:0, lehrer:0, eltern:0, schueler:0 } }
  ]},
  { group: 'Inhalte & Kurse', rows: [
    { label: 'kurse.manage', desc: 'Kurse anlegen / bearbeiten / freischalten', g: { admin:1, schule:1, lehrer:1, eltern:0, schueler:0 } },
    { label: 'kurse.veroeffentlichen', desc: 'Kurs öffentlich freigeben', g: { admin:1, schule:1, lehrer:0, eltern:0, schueler:0 } },
    { label: 'lektionen.manage', desc: 'Lektionen & Aufgaben pflegen', g: { admin:1, schule:1, lehrer:1, eltern:0, schueler:0 } },
    { label: 'lektionen.freigabe', desc: 'Lektionen validiert freigeben', g: { admin:1, schule:1, lehrer:0, eltern:0, schueler:0 } },
    { label: 'bibliothek.manage', desc: 'Bibliotheks-Inhalte kuratieren', g: { admin:1, schule:1, lehrer:0, eltern:0, schueler:0 } },
    { label: 'creator.manage', desc: 'Creator-Engine nutzen (eigene Kurse bauen)', g: { admin:1, schule:1, lehrer:1, eltern:0, schueler:0 } }
  ]},
  { group: 'Lernen, Prüfung & Fortschritt', rows: [
    { label: 'lernen.ausfuehren', desc: 'Aufgaben einer Stufe lösen', g: { admin:1, schule:1, lehrer:1, eltern:0, schueler:1 } },
    { label: 'pruefung.ausfuehren', desc: 'Prüfungen ablegen', g: { admin:1, schule:1, lehrer:1, eltern:0, schueler:1 } },
    { label: 'pruefung.bewerten', desc: 'Freitext-/Prüfungsbewertung freigeben', g: { admin:1, schule:1, lehrer:0, eltern:0, schueler:0 } },
    { label: 'urkunde.ausstellen', desc: 'Urkunden ausstellen / widerrufen', g: { admin:1, schule:1, lehrer:0, eltern:0, schueler:0 } },
    { label: 'fortschritt.sehen', desc: 'Gemeinschafts-Fortschritt sehen', g: { admin:1, schule:1, lehrer:1, eltern:1, schueler:1 } },
    { label: 'fortschritt.eigen', desc: 'Eigenen Lernfortschritt sehen', g: { admin:1, schule:1, lehrer:1, eltern:1, schueler:1 } },
    { label: 'auswertung.lehrersehen', desc: 'Lehrer-Auswertung (Können-Verteilung)', g: { admin:1, schule:1, lehrer:1, eltern:0, schueler:0 } }
  ]},
  { group: 'Netzwerk / Community (VPS)', rows: [
    { label: 'pool.upload', desc: 'In Community-Pool hochladen (mit Freigabe)', g: { admin:1, schule:1, lehrer:1, eltern:0, schueler:0 } },
    { label: 'pool.download', desc: 'Bausteine aus Pool laden', g: { admin:1, schule:1, lehrer:1, eltern:1, schueler:1 } },
    { label: 'pool.kuratieren', desc: 'Bibliothekar-Pool kuratieren / dedupe (nur Admin)', g: { admin:1, schule:0, lehrer:0, eltern:0, schueler:0 } }
  ]}
];

/* Zustand (bei Start = Standard-Matrix) */
let state = {};
function initState(){
  state = {};
  EBENEN.forEach(e => { state[e] = {}; });
  MATRIX.forEach(gr => gr.rows.forEach(row => {
    EBENEN.forEach(e => state[e][row.label] = !!row.g[e]);
  }));
}
initState();

let aktuelleEbene = 'admin';
const auditEintraege = [];

/* ---- Rendern (alle Zeilen komplett aufgeklappt) ---- */
function render(){
  const groupsEl = document.getElementById('groups');
  groupsEl.innerHTML = '';
  MATRIX.forEach(group => {
    const sec = document.createElement('section');
    sec.className = 'group';

    const head = document.createElement('div');
    head.className = 'group-head';
    const hLabel = document.createElement('span');
    hLabel.textContent = group.group;
    const hBtn = document.createElement('button');
    hBtn.className = 'g-toggle';
    hBtn.textContent = 'alle ein/aus';
    hBtn.addEventListener('click', () => toggleAll(group));
    head.append(hLabel, hBtn);
    sec.appendChild(head);

    const rows = document.createElement('div');
    rows.className = 'group-rows';
    group.rows.forEach(row => rows.appendChild(buildRow(row)));
    sec.appendChild(rows);
    groupsEl.appendChild(sec);
  });
}

function buildRow(row){
  const el = document.createElement('div');
  el.className = 'row';

  /* Name + Beschreibung (volle Breite) */
  const main = document.createElement('div');
  main.className = 'main';
  const name = document.createElement('div');
  name.className = 'name';
  name.textContent = row.label;
  main.appendChild(name);
  if (row.desc){
    const d = document.createElement('div');
    d.className = 'desc';
    d.textContent = row.desc;
    main.appendChild(d);
  }
  el.appendChild(main);

  /* Darunter: 5 Schalter, eine Reihe */
  const cells = document.createElement('div');
  cells.className = 'cells';
  EBENEN.forEach(e => {
    const cell = document.createElement('label');
    cell.className = 'cell';
    const sw = document.createElement('input');
    sw.type = 'checkbox';
    sw.className = 'sw';
    sw.checked = state[e][row.label];
    sw.addEventListener('change', () => { state[e][row.label] = sw.checked; updateSim(); });
    const tag = document.createElement('small');
    tag.textContent = EBENE_LABEL[e];
    cell.append(sw, tag);
    cells.appendChild(cell);
  });
  el.appendChild(cells);
  return el;
}

/* Modul-Alle umschalten: invertiert je Ebene */
function toggleAll(group){
  let allOn = true;
  group.rows.forEach(row => EBENEN.forEach(e => { if (!state[e][row.label]) allOn = false; }));
  group.rows.forEach(row => EBENEN.forEach(e => state[e][row.label] = !allOn));
  render();
  updateSim();
}

/* ---- Vorschau (Simulation) — jeder Eintrag ist ein eigener Umschalter ---- */
function updateSim(){
  const e = aktuelleEbene;
  document.getElementById('sim-role').textContent = EBENE_LABEL[e];
  document.getElementById('sim-hint').textContent = EBENE_HINT[e];
  const list = document.getElementById('sim');
  list.innerHTML = '';
  MATRIX.forEach(group => group.rows.forEach(row => {
    const li = document.createElement('button');
    li.type = 'button';
    li.className = 'sim-item';
    li.dataset.label = row.label;
    li.addEventListener('click', () => {
      state[e][row.label] = !state[e][row.label];
      rebuild();
    });
    const t = document.createElement('span');
    t.className = 't';
    t.textContent = row.label;
    const st = document.createElement('span');
    st.className = state[e][row.label] ? 'sim-on' : 'sim-off';
    st.textContent = state[e][row.label] ? 'AN' : 'AUS';
    li.append(t, st);
    list.appendChild(li);
  }));
}

function rebuild(){
  render();
  updateSim();
}

function setEbene(e){
  aktuelleEbene = e;
  document.body.dataset.role = e;
  document.querySelectorAll('[data-role-trigger]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.roleTrigger === e);
  });
  updateSim();
}

/* ---- Audit ---- */
function hash(s){
  let h = 0, i;
  for (i = 0; i < s.length; i++){ h = (h << 5) - h + s.charCodeAt(i); h |= 0; }
  return (h >>> 0).toString(16).padStart(8, '0');
}
function logAudit(aktion){
  const prev = auditEintraege.length ? auditEintraege[auditEintraege.length - 1].hash : '00000000';
  const eintrag = { aktion, at: new Date().toISOString().slice(11, 19) };
  eintrag.hash = hash(prev + eintrag.aktion + eintrag.at);
  auditEintraege.push(eintrag);
  renderAudit();
}
function renderAudit(){
  const ul = document.getElementById('audit');
  ul.innerHTML = '';
  auditEintraege.slice(-8).reverse().forEach(e => {
    const li = document.createElement('li');
    li.textContent = `${e.at} · ${e.aktion} · #${e.hash}`;
    ul.appendChild(li);
  });
}

/* ---- Boot ---- */
render();
setEbene('admin');
renderAudit();
logAudit('System: Muster initialisiert (5 Ebenen)');

/* ---- Events ---- */
document.querySelectorAll('[data-role-trigger]').forEach(btn => {
  btn.addEventListener('click', () => setEbene(btn.dataset.roleTrigger));
});

document.getElementById('reset').addEventListener('click', () => {
  initState();
  rebuild();
  flashNote('Zurück auf Standard-Matrix gesetzt.');
});

document.getElementById('save').addEventListener('click', () => {
  const diff = [];
  EBENEN.forEach(e => MATRIX.forEach(g => g.rows.forEach(m => {
    if (!!m.g[e] !== state[e][m.label]) diff.push(`${EBENE_LABEL[e]} · ${m.label}`);
  })));
  if (diff.length === 0){
    logAudit('Keine Änderung (gespeichert)');
  } else {
    diff.slice(0, 6).forEach(a => logAudit('Änderung: ' + a));
    if (diff.length > 6) logAudit('… und ' + (diff.length - 6) + ' weitere');
  }
  flashNote(diff.length
    ? diff.length + ' Recht-Änderung(en) übernommen · Audit aktualisiert'
    : 'Matrix unverändert — nichts gespeichert.');
});

function flashNote(text){
  const note = document.getElementById('save-note');
  note.textContent = text;
  note.style.color = getComputedStyle(document.documentElement).getPropertyValue('--ok');
  if (note._t) clearTimeout(note._t);
  note._t = setTimeout(() => { note.textContent = ''; }, 3200);
}