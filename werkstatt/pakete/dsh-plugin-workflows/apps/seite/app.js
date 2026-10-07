/* Meine Apps — PROMPTHEUS Werkstatt (Masterplan Workflow-Modalseite, 9.4–9.7).
   Läuft als eigene Seite im Werkstatt-Fenster (Rahmen) oder allein im Browser.
   Kein Framework; jede Angabe aus der API geht durch esc(), bevor sie ins HTML kommt.
   Keine Inline-Stile im HTML (CSP style-src 'self'); Breiten setzt JS über .style. */
'use strict';

// ------------------------------------------------------------------ Grundlagen
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const IM_RAHMEN = window.parent !== window;
const speicher = {
  lies(k, d) { try { const v = localStorage.getItem('meine-apps.' + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  setz(k, v) { try { localStorage.setItem('meine-apps.' + k, JSON.stringify(v)); } catch { /* ohne Speicher */ } },
};

const P = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const ICONS = {
  app: P('<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>'),
  ordner: P('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'),
  datei: P('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>'),
  karte: P('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 10h10M7 14h6"/>'),
  mail: P('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'),
  lupe: P('<circle cx="11" cy="11" r="6"/><path d="m20 20-4.3-4.3"/>'),
  plus: P('<path d="M12 5v14M5 12h14"/>'),
  x: P('<path d="M6 6l12 12M18 6 6 18"/>'),
  mehr: P('<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>'),
  auge: P('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
  play: P('<path d="M7 5v14l11-7z"/>'),
  probe: P('<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3"/>'),
  pause: P('<path d="M8 5v14M16 5v14"/>'),
  zurueck: P('<path d="M15 6l-6 6 6 6"/>'),
  einklappen: P('<path d="M13 6l6 6-6 6M5 6v12"/>'),
  ausklappen: P('<path d="M11 6l-6 6 6 6M19 6v12"/>'),
  groesse: P('<path d="M4 9V4h5M20 15v5h-5M4 4l6 6M20 20l-6-6"/>'),
  uhr: P('<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>'),
  muell: P('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'),
  kategorie: P('<path d="M4 6h16M4 12h10M4 18h6"/>'),
  filter: P('<path d="M4 5h16l-6 8v5l-4 2v-7z"/>'),
  tabelle: P('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 4v16"/>'),
  liste: P('<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>'),
  funke: P('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>'),
  senden: P('<path d="M4 12l16-8-6 16-2-7z"/>'),
};
const ico = (n) => ICONS[n] || ICONS.app;
function symbole(root = document) { $$('[data-i]', root).forEach((el) => { if (!el.firstChild) el.innerHTML = ico(el.dataset.i); }); }

const STATUS_WORT = { aktiv: 'aktiv', pausiert: 'pausiert', fehler: 'Fehler', entwurf: 'Entwurf' };
const AUSLOESER_WORT = { hand: 'von Hand', zeitplan: 'Zeitplan', nachgeholt: 'nachgeholt', start: 'beim Start', probe: 'Probelauf' };
const WERT_WORT = { downloads: 'Downloads', dokumente: 'Dokumente', desktop: 'Desktop', import: 'Secondbrain · 50_Import' };
const KENNZAHL_WORT = { gefunden: 'gefunden', behalten: 'behalten', verworfen: 'verworfen', zeilen: 'Zeilen', eintraege: 'Einträge', gezeigt: 'gezeigt', zeichen: 'Zeichen' };

const zeit = (iso) => { const d = new Date(iso); return Number.isNaN(+d) ? '–' : d.toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }); };
const zeitKurz = (iso) => {
  const d = new Date(iso); if (Number.isNaN(+d)) return '–';
  const heute = new Date().toDateString() === d.toDateString();
  return heute ? d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }) + ' ' + d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
};
const dauer = (ms) => (ms == null ? '–' : ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1).replace('.', ',')} s`);
const euro = (x) => (x ? `${x.toFixed(3).replace('.', ',')} €` : '–');
const ausloeserText = (a) => (!a || a.art === 'hand' ? 'von Hand' : a.art === 'start' ? 'beim Werkstatt-Start'
  : a.regel?.typ === 'taeglich' ? `täglich ${a.regel.uhrzeit || ''}`.trim() : 'Zeitplan');

async function api(weg, koerper) {
  const r = await fetch('/promptheus-apps/api/' + weg, koerper === undefined ? { credentials: 'same-origin' }
    : { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify(koerper) });
  const d = await r.json().catch(() => ({ fehler: 'Antwort nicht lesbar' }));
  if (!r.ok) throw new Error(d.fehler || `Fehler ${r.status}`);
  return d;
}
let toastUhr;
function hinweis(text, fehler = false) {
  const t = $('#hinweis');
  t.textContent = text; t.classList.toggle('fehler', fehler); t.classList.add('an');
  clearTimeout(toastUhr); toastUhr = setTimeout(() => t.classList.remove('an'), 3200);
}
const fehler = (e) => hinweis(e.message || String(e), true);

// ------------------------------------------------------------------ Farben aus der Werkstatt
window.addEventListener('message', (ev) => {
  if (ev.origin !== location.origin || !ev.data || ev.data.art !== 'promptheus-apps:farben') return;
  const w = ev.data.werte || {};
  for (const [k, v] of Object.entries(w)) if (/^--[a-z0-9-]+$/.test(k) && typeof v === 'string' && v.length < 80 && !/[;{}]/.test(v)) document.documentElement.style.setProperty(k, v);
  document.documentElement.classList.toggle('hell', !!ev.data.hell);
});
function schliessenGanz() {
  if (IM_RAHMEN) window.parent.postMessage({ art: 'promptheus-apps:schliessen' }, location.origin);
}

// ------------------------------------------------------------------ Zustand
const U = {
  daten: null,
  suche: '', sort: speicher.lies('sort', 'benutzt'), leere: speicher.lies('leere', false),
  app: null, appDaten: null, laeufe: null, filter: '', seite: 1, gewaehlt: null, abbild: null,
  sr: Object.assign({ zu: false, groesse: 'normal', breite: null }, speicher.lies('seitenmenue', {})),
};

// ------------------------------------------------------------------ Übersicht (9.4)
async function uebersichtLaden() {
  try { U.daten = await api('uebersicht'); } catch (e) { fehler(e); return; }
  uebersichtZeichnen();
}

function zahlenZeichnen() {
  const k = U.daten.kennzahlen;
  const apps = U.daten.apps;
  const aktiv = apps.filter((a) => a.status === 'aktiv').length;
  $('#zahlen').innerHTML = [
    ['Apps', `${apps.length}`, `${aktiv} aktiv`],
    ['Läufe heute', `${k.laeufeHeute}`, ''],
    ['Erfolgreich heute', `${k.okHeute} / ${k.laeufeHeute}`, ''],
    ['Ø Dauer', dauer(k.dauerMittelMs), ''],
    ['Modellkosten Monat', k.kostenMonat ? euro(k.kostenMonat) : '0 €', ''],
  ].map(([n, w, z]) => `<div class="zahl"><small>${esc(n)}</small><b>${esc(w)}</b>${z ? `<span class="neben">${esc(z)}</span>` : ''}</div>`).join('');
}

function sortiert(apps) {
  const a = [...apps];
  if (U.sort === 'name') a.sort((x, y) => x.name.localeCompare(y.name, 'de'));
  else if (U.sort === 'fehler') a.sort((x, y) => (y.fehlerInFolge - x.fehlerInFolge) || String(y.zuletztBenutzt).localeCompare(String(x.zuletztBenutzt)));
  else a.sort((x, y) => String(y.zuletztBenutzt).localeCompare(String(x.zuletztBenutzt)));
  return a;
}

function karteHtml(a) {
  const verlauf = Array.from({ length: 10 }, (_, i) => (i < a.letzte.length ? `<i class="${a.letzte[a.letzte.length - 1 - i] ? 'ok' : 'nein'}"></i>` : '<i></i>')).join('');
  const ok = a.letzte.filter(Boolean).length;
  const zuletzt = a.letzterLauf
    ? `zuletzt ${esc(zeitKurz(a.letzterLauf.start))} ${a.letzterLauf.status === 'ok' ? '<span class="status-ok">✓</span>' : '<span class="status-fehler">✕</span>'}`
    : 'noch kein Lauf';
  const warnungen = [];
  if (a.fehlerInFolge >= 2) warnungen.push(`<span class="plakette p-schlecht">${a.fehlerInFolge} Fehler in Folge</span>`);
  for (const f of a.fehlt.slice(0, 2)) warnungen.push(`<span class="plakette p-warn">${esc(f)}</span>`);
  if (a.ungueltig) warnungen.push('<span class="plakette p-schlecht">Datei ungültig</span>');
  return `<div class="karte s-${esc(a.status)}" role="button" tabindex="0" draggable="true" data-app="${esc(a.id)}" aria-label="${esc(a.name)} öffnen">
    <div class="karte-kopf"><span class="ico" data-i="${esc(a.icon)}"></span><b>${esc(a.name)}</b></div>
    <button type="button" class="mehr" data-mehr="${esc(a.id)}" aria-label="Weitere Aktionen für ${esc(a.name)}"><span class="ico" data-i="mehr"></span></button>
    <div class="karte-zeile"><span class="plakette p-${esc(a.status)}">${esc(STATUS_WORT[a.status] || a.status)}</span><span>${esc(ausloeserText(a.ausloeser))}</span></div>
    <div class="karte-zeile"><span class="verlauf" aria-hidden="true">${verlauf}</span><span>${a.letzte.length ? `${ok}/${a.letzte.length} ✓` : ''}</span></div>
    <div class="karte-zeile">${zuletzt}</div>
    ${warnungen.length ? `<div class="warnungen">${warnungen.join('')}</div>` : ''}
  </div>`;
}

function uebersichtZeichnen() {
  if (!U.daten) return;
  zahlenZeichnen();
  const such = U.suche.trim().toLowerCase();
  const apps = U.daten.apps.filter((a) => !such || a.name.toLowerCase().includes(such) || String(a.ziel || '').toLowerCase().includes(such));
  const brett = $('#brett');
  if (!U.daten.apps.length) {
    brett.innerHTML = `<div class="leer-gross"><h2>Noch keine eigenen Apps</h2>
      <p>Eine App ist ein Ablauf, den du einmal einrichtest und dann per Klick oder nach Zeitplan laufen lässt. Fang mit einer Vorlage an.</p>
      <p><button type="button" class="knopf haupt" data-vorlagen><span class="ico" data-i="plus"></span>Vorlage wählen</button></p></div>`;
    symbole(brett);
    return;
  }
  const kats = [...U.daten.kategorien];
  for (const a of U.daten.apps) if (!kats.some((k) => k.id === a.kategorie)) kats.push({ id: a.kategorie, name: a.kategorie.replace(/^k-/, ''), text: 'Eigene Kategorie', farbe: 'grau' });
  brett.innerHTML = kats.map((k) => {
    const drin = sortiert(apps.filter((a) => a.kategorie === k.id));
    const alle = U.daten.apps.filter((a) => a.kategorie === k.id).length;
    if (!alle && !U.leere) return '';
    return `<section class="spalte" data-kategorie="${esc(k.id)}" aria-label="${esc(k.name)}">
      <div class="spalte-kopf"><div class="zeile"><span class="punkt f-${esc(k.farbe)}"></span>${esc(k.name)}<span class="anzahl">${drin.length}</span></div><p>${esc(k.text)}</p></div>
      <div class="spalte-liste">${drin.length ? drin.map(karteHtml).join('') : `<div class="spalte-leer">${alle ? 'Keine Treffer' : 'Hierher ziehen'}</div>`}</div>
    </section>`;
  }).join('');
  symbole(brett);
}

// Klicks im Brett
$('#brett').addEventListener('click', (ev) => {
  if (ev.target.closest('[data-vorlagen]')) return vorlagenDialog();
  const m = ev.target.closest('[data-mehr]');
  if (m) { ev.stopPropagation(); return appMenue(m, m.dataset.mehr); }
  const k = ev.target.closest('[data-app]');
  if (k) appOeffnen(k.dataset.app);
});
$('#brett').addEventListener('keydown', (ev) => {
  const k = ev.target.closest('[data-app]');
  if (k && (ev.key === 'Enter' || ev.key === ' ') && ev.target === k) { ev.preventDefault(); appOeffnen(k.dataset.app); }
});

// Ziehen zwischen Spalten ändert die Kategorie
let gezogen = null;
$('#brett').addEventListener('dragstart', (ev) => {
  const k = ev.target.closest('[data-app]'); if (!k) return;
  gezogen = k.dataset.app; k.classList.add('zieht');
  ev.dataTransfer.effectAllowed = 'move'; ev.dataTransfer.setData('text/plain', gezogen);
});
$('#brett').addEventListener('dragend', () => { gezogen = null; $$('.zieht, .spalte.ziel').forEach((e) => e.classList.remove('zieht', 'ziel')); });
$('#brett').addEventListener('dragover', (ev) => {
  const s = ev.target.closest('.spalte'); if (!s || !gezogen) return;
  ev.preventDefault(); $$('.spalte.ziel').forEach((e) => e !== s && e.classList.remove('ziel')); s.classList.add('ziel');
});
$('#brett').addEventListener('drop', async (ev) => {
  const s = ev.target.closest('.spalte'); if (!s || !gezogen) return;
  ev.preventDefault();
  const app = U.daten.apps.find((a) => a.id === gezogen);
  if (!app || app.kategorie === s.dataset.kategorie) return;
  try { await api('kategorie', { id: gezogen, kategorie: s.dataset.kategorie }); hinweis('Kategorie geändert.'); await uebersichtLaden(); } catch (e) { fehler(e); }
});

$('#suche').addEventListener('input', (ev) => { U.suche = ev.target.value; uebersichtZeichnen(); });
$('#sortierung').value = U.sort;
$('#sortierung').addEventListener('change', (ev) => { U.sort = ev.target.value; speicher.setz('sort', U.sort); uebersichtZeichnen(); });
$('#leereZeigen').checked = U.leere;
$('#leereZeigen').addEventListener('change', (ev) => { U.leere = ev.target.checked; speicher.setz('leere', U.leere); uebersichtZeichnen(); });
$('#ausVorlage').addEventListener('click', () => vorlagenDialog());
$('#zu').addEventListener('click', schliessenGanz);
if (!IM_RAHMEN) $('#zu').hidden = true;

// ------------------------------------------------------------------ Menü und Dialog
function menueSchliessen() { $$('.menue').forEach((m) => m.remove()); }
function menue(anker, eintraege) {
  menueSchliessen();
  const m = document.createElement('div');
  m.className = 'menue'; m.setAttribute('role', 'menu');
  m.innerHTML = eintraege.map((e, i) => (e === '-' ? '<div class="trenner"></div>' : e.ueber ? `<div class="ueber">${esc(e.ueber)}</div>`
    : `<button type="button" role="menuitem" data-n="${i}" class="${e.gefahr ? 'gefahr' : ''}"><span class="ico" data-i="${esc(e.ico || 'app')}"></span>${esc(e.text)}</button>`)).join('');
  document.body.appendChild(m); symbole(m);
  const r = anker.getBoundingClientRect();
  const x = Math.min(r.left, innerWidth - m.offsetWidth - 8), y = r.bottom + m.offsetHeight + 8 > innerHeight ? r.top - m.offsetHeight - 4 : r.bottom + 4;
  m.style.left = Math.max(8, x) + 'px'; m.style.top = Math.max(8, y) + 'px';
  m.addEventListener('click', (ev) => { const b = ev.target.closest('[data-n]'); if (!b) return; menueSchliessen(); eintraege[+b.dataset.n].tun(); });
  setTimeout(() => m.querySelector('button')?.focus(), 0);
}
document.addEventListener('pointerdown', (ev) => { if (!ev.target.closest('.menue')) menueSchliessen(); });

function appMenue(anker, id) {
  const a = U.daten.apps.find((x) => x.id === id) || U.appDaten?.app;
  if (!a) return;
  menue(anker, [
    { text: 'Öffnen', ico: 'app', tun: () => appOeffnen(id) },
    { text: 'Jetzt ausführen', ico: 'play', tun: () => ausfuehren(id, false) },
    { text: 'Probelauf', ico: 'probe', tun: () => ausfuehren(id, true) },
    a.status === 'pausiert'
      ? { text: 'Fortsetzen', ico: 'play', tun: () => statusSetzen(id, 'aktiv') }
      : { text: 'Pausieren', ico: 'pause', tun: () => statusSetzen(id, 'pausiert') },
    '-',
    { ueber: 'Kategorie' },
    ...U.daten.kategorien.filter((k) => k.id !== a.kategorie).map((k) => ({ text: k.name, ico: 'kategorie', tun: () => kategorieSetzen(id, k.id) })),
    '-',
    { text: 'Löschen', ico: 'muell', gefahr: true, tun: () => loeschen(id) },
  ]);
}

function dialog(html, beimOeffnen) {
  const d = $('#dialog');
  d.innerHTML = `<div class="dialog-karte">${html}</div>`; d.hidden = false; symbole(d);
  const zu = () => { d.hidden = true; d.innerHTML = ''; };
  d.onclick = (ev) => { if (ev.target === d || ev.target.closest('[data-zu]')) zu(); };
  if (beimOeffnen) beimOeffnen(d, zu);
  setTimeout(() => d.querySelector('button:not([data-zu]), [data-zu]')?.focus(), 0);
  return zu;
}

function vorlagenDialog() {
  const v = U.daten?.vorlagen || [];
  dialog(`<h2>Aus Vorlage</h2><p class="unter">Eine Vorlage legt eine fertige App an. Du kannst sie danach auf ihrer Seite anpassen.</p>
    <div class="vorlagen">${v.map((x) => `<div class="vorlage"><div class="zeile">${esc(x.titel)}</div><p>${esc(x.text)}</p>
      <button type="button" class="knopf klein ${x.vorhanden ? '' : 'haupt'}" data-vorlage="${esc(x.vorlage)}" ${x.vorhanden ? 'disabled' : ''}>${x.vorhanden ? 'Schon angelegt' : 'Anlegen'}</button></div>`).join('')}</div>
    <div class="dialog-fuss"><button type="button" class="knopf" data-zu>Schliessen</button></div>`, (d, zu) => {
    d.addEventListener('click', async (ev) => {
      const b = ev.target.closest('[data-vorlage]'); if (!b || b.disabled) return;
      b.disabled = true;
      try { const r = await api('vorlage', { vorlage: b.dataset.vorlage }); zu(); hinweis(`„${r.app.name}“ angelegt.`); await uebersichtLaden(); appOeffnen(r.app.id); } catch (e) { b.disabled = false; fehler(e); }
    });
  });
}

async function ausfuehren(id, probe, aenderungen = [], merken = false) {
  hinweis(probe ? 'Probelauf läuft …' : 'Läuft …');
  try {
    const p = await api('ausfuehren', { id, probe, aenderungen, merken });
    hinweis(p.status === 'ok' ? `${probe ? 'Probelauf' : 'Lauf'} fertig: ${p.ergebnis}` : `Fehler: ${p.fehler?.text || 'unbekannt'}`, p.status !== 'ok');
    await uebersichtLaden();
    if (U.app === id) { U.gewaehlt = p.stempel; await appNeuLaden(); }
  } catch (e) { fehler(e); }
}
async function statusSetzen(id, status) {
  try { await api('status', { id, status }); hinweis(status === 'aktiv' ? 'Fortgesetzt.' : 'Pausiert.'); await uebersichtLaden(); if (U.app === id) await appNeuLaden(); } catch (e) { fehler(e); }
}
async function kategorieSetzen(id, kategorie) {
  try { await api('kategorie', { id, kategorie }); hinweis('Kategorie geändert.'); await uebersichtLaden(); if (U.app === id) await appNeuLaden(); } catch (e) { fehler(e); }
}
function loeschen(id) {
  const a = U.daten.apps.find((x) => x.id === id);
  dialog(`<h2>„${esc(a?.name || id)}“ löschen?</h2><p class="unter">Die App kommt in den Papierkorb, mit Protokoll und gespeicherten Ausgaben.</p>
    <div class="dialog-fuss"><button type="button" class="knopf" data-zu>Abbrechen</button><button type="button" class="knopf haupt" data-ja>Löschen</button></div>`, (d, zu) => {
    d.querySelector('[data-ja]').onclick = async () => {
      try { await api('loeschen', { id }); zu(); hinweis('In den Papierkorb gelegt.'); if (U.app === id) appSchliessen(); await uebersichtLaden(); } catch (e) { fehler(e); }
    };
  });
}

// ------------------------------------------------------------------ App-Seite (9.5)
async function appOeffnen(id) {
  U.app = id; U.gewaehlt = null; U.abbild = null; U.filter = ''; U.seite = 1;
  $('#appSeite').hidden = false;
  $('#appSeite').innerHTML = '<div class="app-kopf"><span class="leise">Lädt …</span></div>';
  await appNeuLaden();
  $('#appSeite [data-zurueck]')?.focus();
}
function appSchliessen() {
  const war = U.app;
  U.app = null; U.appDaten = null; U.laeufe = null; U.gewaehlt = null;
  $('#appSeite').hidden = true; $('#appSeite').innerHTML = '';
  $(`[data-app="${CSS.escape(war || '')}"]`)?.focus();
}
async function appNeuLaden() {
  const id = U.app; if (!id) return;
  try {
    const [d, l] = await Promise.all([api('app?id=' + encodeURIComponent(id)), api(`laeufe?id=${encodeURIComponent(id)}&seite=${U.seite}&filter=${U.filter}`)]);
    if (U.app !== id) return;
    U.appDaten = d; U.laeufe = l;
    if (U.gewaehlt) {
      try {
        const q = `id=${encodeURIComponent(id)}&stempel=${encodeURIComponent(U.gewaehlt)}`;
        const [lauf, ab] = await Promise.all([api('lauf?' + q), api('abbild?' + q)]);
        U.lauf = lauf; U.abbild = ab.abbild;
      } catch { U.lauf = null; U.abbild = null; }
    }
    appZeichnen();
  } catch (e) { fehler(e); }
}

function feldHtml(f, i) {
  const n = `f${i}`;
  if (f.typ === 'wahl') return `<label class="feld"><span>${esc(f.titel)}</span><select id="${n}">${f.werte.map((w) => `<option value="${esc(w)}" ${w === f.wert ? 'selected' : ''}>${esc(WERT_WORT[w] || w)}</option>`).join('')}</select></label>`;
  if (f.typ === 'schalter') return `<label class="feld"><span>${esc(f.titel)}</span><span class="haken"><input type="checkbox" id="${n}" ${f.wert ? 'checked' : ''}> ${f.wert ? 'an' : 'aus'}</span></label>`;
  if (f.typ === 'zahl') return `<label class="feld"><span>${esc(f.titel)}</span><input type="number" id="${n}" value="${esc(f.wert)}" min="${esc(f.min ?? '')}" max="${esc(f.max ?? '')}"></label>`;
  if (f.typ === 'mehrzeilig') return `<label class="feld"><span>${esc(f.titel)}</span><textarea id="${n}" rows="4">${esc(f.wert)}</textarea></label>`;
  return `<label class="feld"><span>${esc(f.titel)}</span><input type="text" id="${n}" value="${esc(f.wert)}"></label>`;
}
function aenderungenLesen() {
  const felder = U.appDaten?.bedienung || [];
  const aus = [];
  felder.forEach((f, i) => {
    const el = $('#f' + i); if (!el) return;
    let wert = f.typ === 'schalter' ? el.checked : f.typ === 'zahl' ? Number(el.value) : el.value;
    if (wert !== f.wert) aus.push({ schritt: f.schritt, name: f.name, wert });
  });
  return aus;
}

function ausgabeHtml(a) {
  if (!a) return '<p class="leise">Keine Ausgabe gespeichert.</p>';
  let innen = '';
  if (a.art === 'tabelle') {
    innen = `${a.zusatz?.length ? `<div class="zusatz">${a.zusatz.map((z) => `<span>${esc(z.wort)} · ${esc(z.zahl)}</span>`).join('')}</div>` : ''}
      <div class="ausgabe-tabelle"><table><thead><tr>${a.spalten.map((s) => `<th>${esc(s)}</th>`).join('')}</tr></thead>
      <tbody>${a.zeilen.length ? a.zeilen.map((z) => `<tr>${z.map((x) => `<td>${esc(x)}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${a.spalten.length}" class="leise">Keine Einträge.</td></tr>`}</tbody></table></div>`;
  } else if (a.art === 'karte') {
    innen = `${a.punkte?.length ? `<ul>${a.punkte.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>` : ''}${a.fuss ? `<div class="fuss">${esc(a.fuss)}</div>` : ''}`;
  } else innen = `<p>${esc(a.text)}</p>`;
  return `<div class="ausgabe"><div class="ausgabe-titel">${esc(a.titel)}</div>${innen}${a.datei ? `<div class="fuss">Gespeichert als ${esc(a.datei)}</div>` : ''}</div>`;
}

function protokollHtml() {
  const l = U.laeufe;
  const zeilen = l.zeilen.map((z) => `<tr data-lauf="${esc(z.stempel)}" class="${z.stempel === U.gewaehlt ? 'gewaehlt' : ''}" tabindex="0">
      <td>${esc(zeit(z.start))}</td>
      <td>${esc(AUSLOESER_WORT[z.ausloeser] || z.ausloeser)}</td>
      <td>${esc(dauer(z.dauerMs))}</td>
      <td class="schritte-zeichen" title="${z.schritte.filter(Boolean).length} von ${z.schritte.length} Schritten erfolgreich">${z.schritte.map((s) => (s ? '<span class="status-ok">✓</span>' : '<span class="status-fehler">✕</span>')).join('')} ${z.schritte.filter(Boolean).length}/${z.schritte.length}</td>
      <td>${esc(z.ergebnis)}</td>
      <td>${z.modell ? `${esc(z.modell)} · ${esc(euro(z.kosten))}` : '<span class="leise">ohne Modell</span>'}</td>
      <td>${z.status === 'ok' ? '<span class="status-ok">✓ erfolgreich</span>' : `<span class="status-fehler">✕ ${esc(z.fehler?.text || 'Fehler')}</span>`}</td>
      <td><button type="button" class="auge" data-auge="${esc(z.stempel)}" ${z.abbild ? '' : 'disabled'} aria-label="Ausgabe dieses Laufs ansehen" title="${z.abbild ? 'Ausgabe ansehen' : 'Ausgabe nicht aufbewahrt'}"><span class="ico" data-i="auge"></span></button></td>
    </tr>`).join('');
  return `<section class="flaeche">
    <h3>Protokoll <span class="rechts">
      <select id="filter" aria-label="Filter"><option value="">Alle Läufe</option><option value="fehler" ${U.filter === 'fehler' ? 'selected' : ''}>Nur Fehler</option><option value="auto" ${U.filter === 'auto' ? 'selected' : ''}>Nur automatisch</option></select>
      <span>${esc(l.gesamt)} ${l.gesamt === 1 ? 'Lauf' : 'Läufe'}</span></span></h3>
    <div class="ausgabe-tabelle"><table class="protokoll"><thead><tr><th>Zeit</th><th>Auslöser</th><th>Dauer</th><th>Schritte</th><th>Ergebnis</th><th>Modell</th><th>Status</th><th><span class="ico" data-i="auge" aria-label="Ausgabe"></span></th></tr></thead>
    <tbody>${zeilen || '<tr><td colspan="8" class="leise">Noch keine Läufe. Starte oben einen Probelauf.</td></tr>'}</tbody></table></div>
    ${l.seiten > 1 ? `<div class="blaettern"><button type="button" class="knopf klein" data-blatt="-1" ${l.seite <= 1 ? 'disabled' : ''}>Zurück</button>Seite ${esc(l.seite)} von ${esc(l.seiten)}<button type="button" class="knopf klein" data-blatt="1" ${l.seite >= l.seiten ? 'disabled' : ''}>Weiter</button></div>` : ''}
  </section>`;
}

function appZeichnen() {
  const { app, bedienung, zustand, letzter } = U.appDaten;
  const bereit = app.schritte.every((s) => s.bereit);
  const strecke = app.schritte.map((s) => `<span class="schritt-chip ${s.bereit ? '' : 'folgt'}">${esc(s.titel)}${s.bereit ? '' : ` · folgt (Phase ${esc(s.phase)})`}</span>`).join('<span class="leise">→</span>');
  const seite = $('#appSeite');
  seite.innerHTML = `
    <header class="app-kopf">
      <button type="button" class="knopf rund" data-zurueck aria-label="Zurück zu Meine Apps" title="Zurück (Esc)"><span class="ico" data-i="zurueck"></span></button>
      <span class="ico" data-i="${esc(app.icon)}"></span>
      <h2 id="appName">${esc(app.name)}</h2>
      <span class="plakette p-${esc(app.status)}">${esc(STATUS_WORT[app.status] || app.status)}</span>
      <span class="meta">${esc(ausloeserText(app.ausloeser))}${zustand.letzterLauf ? ` · zuletzt ${esc(zeitKurz(zustand.letzterLauf))}` : ''}</span>
      <div class="rechts">
        <button type="button" class="knopf haupt" data-los ${bereit ? '' : 'disabled'}><span class="ico" data-i="play"></span>Jetzt ausführen</button>
        <button type="button" class="knopf rund" data-appmehr aria-label="Weitere Aktionen"><span class="ico" data-i="mehr"></span></button>
      </div>
    </header>
    <div class="app-koerper">
      <div class="app-haupt">
        <section class="flaeche"><h3>Bedienung</h3><div class="flaeche-innen">
          <div class="strecke-kurz">${strecke}</div>
          ${app.ziel ? `<p class="leise">${esc(app.ziel)}</p>` : ''}
          ${bedienung.length ? `<div class="felder">${bedienung.map(feldHtml).join('')}</div>` : '<p class="leise">Diese App hat keine Einstellungen für den einzelnen Lauf.</p>'}
          ${bereit ? '' : '<div class="hinweis-zeile">Diese App braucht Bausteine, die erst in einer späteren Phase kommen. Bis dahin bleibt sie ein Entwurf.</div>'}
          <div class="feld-reihe">
            <button type="button" class="knopf" data-probe ${bereit ? '' : 'disabled'}><span class="ico" data-i="probe"></span>Probelauf</button>
            <button type="button" class="knopf haupt" data-los ${bereit ? '' : 'disabled'}><span class="ico" data-i="play"></span>Jetzt ausführen</button>
            ${bedienung.length ? '<label class="haken"><input type="checkbox" id="merken"> Einstellungen als Vorgabe merken</label>' : ''}
          </div>
        </div></section>
        <section class="flaeche"><h3>Letztes Ergebnis ${letzter ? `<span class="rechts">${esc(zeit(letzter.start))} ${letzter.status === 'ok' ? '<span class="status-ok">✓</span>' : '<span class="status-fehler">✕</span>'}</span>` : ''}</h3>
          <div class="flaeche-innen">${letzter ? ausgabeHtml(letzter.abbild) : '<p class="leise">Noch kein Lauf.</p>'}</div></section>
        ${protokollHtml()}
      </div>
      ${seitenmenueHtml()}
    </div>`;
  symbole(seite);
  seitenmenueVerdrahten();
}

$('#appSeite').addEventListener('click', async (ev) => {
  const t = ev.target;
  if (t.closest('[data-zurueck]')) return appSchliessen();
  if (t.closest('[data-appmehr]')) return appMenue(t.closest('[data-appmehr]'), U.app);
  if (t.closest('[data-los]')) return ausfuehren(U.app, false, aenderungenLesen(), !!$('#merken')?.checked);
  if (t.closest('[data-probe]')) return ausfuehren(U.app, true, aenderungenLesen(), false);
  const blatt = t.closest('[data-blatt]');
  if (blatt) { U.seite += Number(blatt.dataset.blatt); return appNeuLaden(); }
  const auge = t.closest('[data-auge]');
  if (auge) { ev.stopPropagation(); return laufWaehlen(auge.dataset.auge, true); }
  const zeile = t.closest('[data-lauf]');
  if (zeile) return laufWaehlen(zeile.dataset.lauf, false);
});
$('#appSeite').addEventListener('change', (ev) => {
  if (ev.target.id === 'filter') { U.filter = ev.target.value; U.seite = 1; appNeuLaden(); }
});
$('#appSeite').addEventListener('keydown', (ev) => {
  const zeile = ev.target.closest?.('[data-lauf]');
  if (!zeile) return;
  if (ev.key === 'Enter') { ev.preventDefault(); laufWaehlen(zeile.dataset.lauf, false); }
  if (ev.key === ' ') { ev.preventDefault(); laufWaehlen(zeile.dataset.lauf, true); }
  if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
    ev.preventDefault();
    const n = ev.key === 'ArrowDown' ? zeile.nextElementSibling : zeile.previousElementSibling;
    if (n?.dataset.lauf) { n.focus(); laufWaehlen(n.dataset.lauf, false, true); }
  }
});

async function laufWaehlen(stempel, zurAusgabe, fokusBleibt = false) {
  U.gewaehlt = stempel; U.abbild = undefined;
  if (U.sr.zu) { U.sr.zu = false; srSichern(); }
  try {
    const [lauf, ab] = await Promise.all([api(`lauf?id=${encodeURIComponent(U.app)}&stempel=${encodeURIComponent(stempel)}`), api(`abbild?id=${encodeURIComponent(U.app)}&stempel=${encodeURIComponent(stempel)}`)]);
    U.lauf = lauf; U.abbild = ab.abbild;
  } catch (e) { fehler(e); return; }
  $$('#appSeite tr[data-lauf]').forEach((tr) => tr.classList.toggle('gewaehlt', tr.dataset.lauf === stempel));
  const sr = $('#seiteRechts');
  sr.outerHTML = seitenmenueHtml();
  symbole($('#seiteRechts'));
  seitenmenueVerdrahten();
  if (zurAusgabe) $('#srAusgabe')?.scrollIntoView({ block: 'start' });
  if (fokusBleibt) $(`#appSeite tr[data-lauf="${CSS.escape(stempel)}"]`)?.focus();
}

// ------------------------------------------------------------------ Seitenmenü rechts (9.7)
function srSichern() { speicher.setz('seitenmenue', U.sr); }

function werteHtml(kennzahlen) {
  const e = Object.entries(kennzahlen || {}).filter(([, v]) => typeof v === 'number');
  if (!e.length) return '';
  const max = Math.max(...e.map(([, v]) => v), 1);
  return `<div class="werte">${e.map(([k, v]) => `<div class="wert"><span class="name">${esc(KENNZAHL_WORT[k] || k)}</span><span class="bahn"><i data-w="${Math.round((v / max) * 100)}"></i></span><span class="zahl-r">${esc(v)}</span></div>`).join('')}</div>`;
}

function seitenmenueHtml() {
  const zu = U.sr.zu;
  const lauf = U.gewaehlt && U.lauf && U.lauf.stempel === U.gewaehlt ? U.lauf : null;
  let titel, inhalt;
  if (lauf) {
    titel = `Lauf ${zeit(lauf.start)}`;
    const modelle = lauf.schritte.filter((s) => s.modell);
    inhalt = `
      <div class="sr-abschnitt"><h4>Lauf</h4><dl class="liste-kv">
        <dt>Auslöser</dt><dd>${esc(AUSLOESER_WORT[lauf.ausloeser] || lauf.ausloeser)}</dd>
        <dt>Status</dt><dd>${lauf.status === 'ok' ? '<span class="status-ok">✓ erfolgreich</span>' : `<span class="status-fehler">✕ ${esc(lauf.fehler?.text || 'Fehler')}</span>`}</dd>
        <dt>Dauer</dt><dd>${esc(dauer(lauf.dauerMs))}</dd>
        <dt>Ergebnis</dt><dd>${esc(lauf.ergebnis || '–')}</dd>
        <dt>Kennung</dt><dd>${esc(lauf.stempel)}</dd></dl></div>
      <div class="sr-abschnitt"><h4>Strecke</h4><ol class="kette">${lauf.schritte.map((s) => `<li><span class="knoten ${s.status === 'ok' ? '' : 'nein'}"></span>
        <div class="zeile"><b>${esc(s.titel)}</b><span class="rechts">${esc(dauer(s.dauerMs))}</span></div>
        <div class="unter">${s.status === 'ok' ? '✓ erledigt' : `✕ ${esc(s.fehler === 'baustein_fehlt' ? 'Baustein folgt später' : s.fehler === 'zeitlimit' ? 'Zeitlimit' : 'fehlgeschlagen')}${s.meldung ? ': ' + esc(s.meldung) : ''}`}</div>
        ${werteHtml(s.kennzahlen)}</li>`).join('')}</ol></div>
      <div class="sr-abschnitt" id="srAusgabe"><h4>Ausgabe</h4>${U.abbild === undefined ? '<p class="leise">Lädt …</p>' : U.abbild ? ausgabeHtml(U.abbild) : '<p class="leise">Ausgabe nicht aufbewahrt (älter als 30 Tage oder Aufbewahrung aus).</p>'}</div>
      <div class="sr-abschnitt"><h4>Aufruf und Kosten</h4>${modelle.length ? `<dl class="liste-kv">${modelle.map((s) => `<dt>Modell</dt><dd>${esc(s.modell)}</dd><dt>Token ein / aus</dt><dd>${esc(s.tokensEin ?? '–')} / ${esc(s.tokensAus ?? '–')}</dd><dt>Kosten</dt><dd>${esc(euro(s.kosten))}</dd>`).join('')}</dl>` : '<p class="leise">Kein Modellaufruf. Dieser Lauf blieb auf dem Rechner.</p>'}</div>
      <div class="sr-abschnitt"><details><summary>Rohdaten ansehen</summary><pre class="roh">${esc(JSON.stringify(lauf, null, 2))}</pre></details></div>`;
  } else if (U.appDaten) {
    const { app, statistik, zustand, datenschutz } = U.appDaten;
    const kat = U.daten?.kategorien.find((k) => k.id === app.kategorie);
    titel = 'Über diese App';
    inhalt = `
      <div class="sr-abschnitt"><h4>Strecke</h4><ol class="kette">${app.schritte.map((s) => `<li><span class="knoten ${s.bereit ? '' : 'offen'}"></span>
        <div class="zeile"><b>${esc(s.titel)}</b></div><div class="unter">${s.bereit ? '✓ eingerichtet' : `folgt in Phase ${esc(s.phase)}`}${s.geheimnis ? ` · Zugang ${s.geheimnis.gesetzt ? '✓ gesetzt' : '✕ fehlt'}` : ''}</div></li>`).join('')}</ol></div>
      <div class="sr-abschnitt"><h4>Letzte 30 Tage</h4><dl class="liste-kv">
        <dt>Läufe</dt><dd>${esc(statistik.laeufe)}</dd>
        <dt>Erfolgreich</dt><dd>${esc(statistik.erfolgreich)}${statistik.laeufe ? ` (${Math.round((statistik.erfolgreich / statistik.laeufe) * 100)} %)` : ''}</dd>
        <dt>Ø Dauer</dt><dd>${esc(dauer(statistik.dauerMittelMs))}</dd>
        <dt>Modellkosten</dt><dd>${esc(statistik.kosten ? euro(statistik.kosten) : '0 €')}</dd>
        <dt>Fehler in Folge</dt><dd>${esc(zustand.fehlerInFolge || 0)}</dd></dl></div>
      <div class="sr-abschnitt"><h4>Auslöser</h4><p>${esc(ausloeserText(app.ausloeser))}</p></div>
      <div class="sr-abschnitt"><h4>Datenschutz</h4><div class="hinweis-zeile lapis">${esc(datenschutz)} Gespeicherte Ausgaben liegen verschlüsselt auf diesem Rechner und werden nach 30 Tagen gelöscht.</div></div>
      <div class="sr-abschnitt"><h4>Steckbrief</h4><dl class="liste-kv">
        <dt>Kategorie</dt><dd>${esc(kat?.name || app.kategorie)}</dd>
        <dt>Angelegt</dt><dd>${esc(zeit(app.erstellt))}</dd>
        <dt>Geändert</dt><dd>${esc(zeit(app.geaendert))}</dd></dl></div>
      <p class="leise">Klick auf eine Zeile im Protokoll zeigt hier die Einzelheiten dieses Laufs.</p>`;
  } else { titel = ''; inhalt = ''; }
  const groesseWort = { normal: 'Breiter', halb: 'Ganze Breite', ganz: 'Schmal' }[U.sr.groesse] || 'Breiter';
  return `<aside class="seite-rechts ${zu ? 'zu' : ''} ${U.sr.groesse === 'normal' ? '' : esc(U.sr.groesse)}" id="seiteRechts" aria-label="Details">
    <div class="sr-griff" data-griff title="Ziehen, um die Breite zu ändern"></div>
    <div class="sr-kopf">
      <button type="button" class="knopf rund" data-srzu aria-label="${zu ? 'Details ausklappen' : 'Details einklappen'}" title="${zu ? 'Ausklappen' : 'Einklappen'}"><span class="ico" data-i="${zu ? 'ausklappen' : 'einklappen'}"></span></button>
      <span class="sr-titel">${esc(titel)}</span>
      ${zu ? '' : `<button type="button" class="knopf rund" data-srgroesse aria-label="${groesseWort}" title="${groesseWort}"><span class="ico" data-i="groesse"></span></button>`}
      ${lauf && !zu ? '<button type="button" class="knopf rund" data-srapp aria-label="Zurück zur App-Übersicht" title="Über diese App"><span class="ico" data-i="x"></span></button>' : ''}
    </div>
    <div class="sr-inhalt">${inhalt}</div>
  </aside>`;
}

function seitenmenueVerdrahten() {
  const sr = $('#seiteRechts'); if (!sr) return;
  $$('[data-w]', sr).forEach((i) => { i.style.width = Math.max(2, Number(i.dataset.w)) + '%'; });
  if (U.sr.breite && U.sr.groesse === 'normal' && !U.sr.zu) sr.style.width = U.sr.breite + 'px';
  sr.querySelector('[data-srzu]').onclick = () => { U.sr.zu = !U.sr.zu; srSichern(); neuSeitenmenue(); };
  const g = sr.querySelector('[data-srgroesse]');
  if (g) g.onclick = () => { U.sr.groesse = { normal: 'halb', halb: 'ganz', ganz: 'normal' }[U.sr.groesse] || 'normal'; U.sr.breite = null; srSichern(); neuSeitenmenue(); };
  const a = sr.querySelector('[data-srapp]');
  if (a) a.onclick = () => { U.gewaehlt = null; U.lauf = null; $$('#appSeite tr.gewaehlt').forEach((tr) => tr.classList.remove('gewaehlt')); neuSeitenmenue(); };
  const griff = sr.querySelector('[data-griff]');
  griff.onpointerdown = (ev) => {
    ev.preventDefault(); griff.setPointerCapture(ev.pointerId);
    const rechts = sr.getBoundingClientRect().right;
    griff.onpointermove = (e) => { const b = Math.min(innerWidth - 200, Math.max(280, rechts - e.clientX)); sr.classList.remove('halb', 'ganz'); sr.style.width = b + 'px'; U.sr.breite = b; U.sr.groesse = 'normal'; };
    griff.onpointerup = () => { griff.onpointermove = null; griff.onpointerup = null; srSichern(); };
  };
}
function neuSeitenmenue() {
  const sr = $('#seiteRechts'); if (!sr) return;
  sr.outerHTML = seitenmenueHtml(); symbole($('#seiteRechts')); seitenmenueVerdrahten();
}

// ------------------------------------------------------------------ Tastatur
document.addEventListener('keydown', (ev) => {
  if (ev.key !== 'Escape') return;
  if ($('.menue')) { menueSchliessen(); return; }
  if (!$('#dialog').hidden) { $('#dialog').hidden = true; $('#dialog').innerHTML = ''; return; }
  if (U.app && U.gewaehlt) { U.gewaehlt = null; U.lauf = null; $$('#appSeite tr.gewaehlt').forEach((tr) => tr.classList.remove('gewaehlt')); neuSeitenmenue(); return; }
  if (U.app) { appSchliessen(); return; }
  schliessenGanz();
});

symbole();
uebersichtLaden();
if (IM_RAHMEN) window.parent.postMessage({ art: 'promptheus-apps:bereit' }, location.origin);
