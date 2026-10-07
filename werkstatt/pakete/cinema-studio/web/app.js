/* MULTI-LLM — Oberfläche (ohne Framework) */
'use strict';

// ------------------------------------------------------------------ Symbole
const P = (d, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${extra}>${d}</svg>`;
const I = {
  funke: P('<path d="M12 3l1.9 5.6L19.5 10.5 13.9 12.4 12 18l-1.9-5.6L4.5 10.5l5.6-1.9z"/><path d="M19 3v3M17.5 4.5h3"/>'),
  bilder: P('<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/>'),
  herz: P('<path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 0 0-7.1 7.1L12 21.5l8.8-8.8a5 5 0 0 0 0-7.1z"/>'),
  herzVoll: P('<path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 0 0-7.1 7.1L12 21.5l8.8-8.8a5 5 0 0 0 0-7.1z" fill="currentColor"/>'),
  ordner: P('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'),
  ordnerPlus: P('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M12 11v5M9.5 13.5h5"/>'),
  element: P('<circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.9 7.9"/>'),
  globus: P('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'),
  chart: P('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
  muell: P('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
  plus: P('<path d="M12 5v14M5 12h14"/>'),
  minus: P('<path d="M5 12h14"/>'),
  rechts: P('<path d="M9 6l6 6-6 6"/>'),
  links: P('<path d="M15 6l-6 6 6 6"/>'),
  hoch: P('<path d="M6 15l6-6 6 6"/>'),
  diamant: P('<path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20"/>'),
  download: P('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>'),
  kopie: P('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>'),
  mehr: P('<circle cx="5" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="19" cy="12" r="1.3" fill="currentColor"/>'),
  oeffnen: P('<path d="M7 17L17 7M9 7h8v8"/>'),
  neu: P('<path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5"/>'),
  at: P('<circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.9 7.9"/>'),
  zauber: P('<path d="M4 20L16 8M14 4v3M19 9h3M18 5l2-2M10 5L9 3M19 14l2 1"/>'),
  teilen: P('<path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13"/>'),
  senden: P('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  haken: P('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  x: P('<path d="M6 6l12 12M18 6L6 18"/>'),
  suche: P('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>'),
  raster: P('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>'),
  zurueck: P('<path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>'),
  menue: P('<path d="M4 6h16M4 12h16M4 18h16"/>'),
  profil: P('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
  schloss: P('<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
  zahnrad: P('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
  gruppe: P('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>'),
  abmelden: P('<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H3"/>'),
  hochladen: P('<path d="M12 16V4M7 9l5-5 5 5M5 20h14"/>'),
  link: P('<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>'),
  text: P('<path d="M5 6h14M5 12h14M5 18h9"/>'),
  lupeGross: P('<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>'),
  schere: P('<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4L8.1 15.9M14.5 14.5L20 20M8.1 8.1L12 12"/>'),
  variation: P('<rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/><path d="M15 3h4a2 2 0 0 1 2 2v4M9 21H5a2 2 0 0 1-2-2v-4"/>'),
};
Object.assign(I, {
  uhr: P('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  ton: P('<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>'),
  tonAus: P('<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9l5 5M22 9l-5 5"/>'),
  video: P('<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3"/>'),
  play: P('<path d="M7 5l12 7-12 7z" fill="currentColor"/>'),
  animieren: P('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M10 9l5 3-5 3z" fill="currentColor"/>'),
  fortsetzen: P('<path d="M5 5v14M9 5l10 7-10 7z"/>'),
});
const ico = n => I[n] || '';
function symboleEinsetzen(root = document) { root.querySelectorAll('[data-i]').forEach(el => { if (!el.firstChild) el.innerHTML = ico(el.dataset.i); }); }

// ------------------------------------------------------------------ Grundlagen
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const speicher = {
  lies(k, d) { try { const v = localStorage.getItem('bildgen.' + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  setz(k, v) { try { localStorage.setItem('bildgen.' + k, JSON.stringify(v)); } catch { /* egal */ } },
};

const S = {
  nutzer: null, csrf: null, admin: false,
  modelle: [], empfohlen: [], standard: '', waehrung: 'USD', eurKurs: 0.86, katalogFehler: '',
  ansicht: 'erstellen', bilder: [], ordner: [], elemente: [], auftraege: [], verworfen: new Set(),
  auswahl: new Set(), waehlen: false, suche: '',
  gen: { modell: '', seitenverhaeltnis: '', qualitaet: '', aufloesung: '', anzahl: 1, refs: [], elemente: [], hintergrund: '' },
  schaetzung: null, ordnerOffen: speicher.lies('ordnerOffen', true),
  // Video
  modus: speicher.lies('modus', 'bild'), typFilter: '', vmodelle: [], vempfohlen: [], vstandard: '', vkatalogFehler: '',
  vgen: { modell: '', seitenverhaeltnis: '', aufloesung: '', dauer: 5, ton: true, anzahl: 1, start: null, ende: null },
};

async function api(pfad, body) {
  const opt = { method: body === undefined ? 'GET' : 'POST', headers: {} };
  if (body !== undefined) { opt.headers['Content-Type'] = 'application/json'; opt.body = JSON.stringify(body); }
  if (S.csrf) opt.headers['X-CSRF'] = S.csrf;
  let r;
  try { r = await fetch('/api/' + pfad, opt); } catch { throw new Error('Server nicht erreichbar. Ist das Fenster von Cinema Studio noch offen? Sonst in der Werkstatt links auf „Cinema-Studio“ klicken.'); }
  let d = {};
  try { d = await r.json(); } catch { /* leer */ }
  if (r.status === 401) { zeigeZugang(); throw new Error(d.fehler || 'Öffne Cinema Studio über die Werkstatt.'); }
  if (!r.ok || d.ok === false) throw new Error(d.fehler || `Fehler ${r.status}`);
  return d;
}

function toast(text, art = '') {
  const t = document.createElement('div');
  t.className = 'toast ' + art;
  t.textContent = text;
  $('#toasts').appendChild(t);
  setTimeout(() => t.remove(), art === 'fehler' ? 7000 : 3500);
}
const fehler = e => toast(e.message || String(e), 'fehler');

function geld(usd, stellen) {
  if (usd == null || isNaN(usd)) return '–';
  const eur = S.waehrung === 'EUR';
  const v = eur ? usd * S.eurKurs : usd;
  const nach = stellen ?? (v > 0 && v < 0.1 ? 3 : 2);
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: eur ? 'EUR' : 'USD', minimumFractionDigits: nach, maximumFractionDigits: nach }).format(v);
}
const zahl = n => new Intl.NumberFormat('de-DE').format(n);

function tagName(iso) {
  const d = new Date(iso), h = new Date();
  const t = x => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((t(h) - t(d)) / 864e5);
  if (diff === 0) return 'Heute';
  if (diff === 1) return 'Gestern';
  return d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: d.getFullYear() === h.getFullYear() ? undefined : 'numeric' });
}
const zeit = iso => new Date(iso).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' });

// ------------------------------------------------------------------ Tooltips
(() => {
  const tip = $('#tip');
  let timer = null, ziel = null;
  const weg = () => { clearTimeout(timer); tip.classList.remove('an'); ziel = null; };
  document.addEventListener('mouseover', ev => {
    const el = ev.target.closest('[data-tip]');
    if (el === ziel) return;
    weg();
    if (!el || matchMedia('(hover: none)').matches) return;
    ziel = el;
    timer = setTimeout(() => {
      if (!ziel || !document.body.contains(ziel)) return;
      tip.textContent = ziel.dataset.tip;
      const r = ziel.getBoundingClientRect();
      tip.style.left = '0px'; tip.style.top = '0px';
      const w = tip.offsetWidth, h = tip.offsetHeight;
      let top = r.top - h - 8;
      if (top < 6) top = r.bottom + 8;
      const left = Math.min(Math.max(6, r.left + r.width / 2 - w / 2), innerWidth - w - 6);
      tip.style.left = left + 'px'; tip.style.top = top + 'px';
      tip.classList.add('an');
    }, 380);
  });
  document.addEventListener('mousedown', weg);
  document.addEventListener('scroll', weg, true);
})();

// ------------------------------------------------------------------ Aufklappmenüs
const POP = { el: null, fly: null, anker: null };
function popSchliessen() {
  $('#pop').classList.add('hidden'); $('#flyout').classList.add('hidden');
  $$('.chip.offen').forEach(c => c.classList.remove('offen'));
  POP.anker = null;
}
function platziere(el, anker, seite = 'unten') {
  el.classList.remove('hidden');
  el.style.left = '0px'; el.style.top = '0px';
  const r = anker.getBoundingClientRect(), w = el.offsetWidth, h = el.offsetHeight;
  let left, top;
  if (seite === 'rechts') {
    left = r.right + 4; top = r.top - 6;
    if (left + w > innerWidth - 8) left = r.left - w - 4;
  } else if (seite === 'oben') {
    left = r.left; top = r.top - h - 8;
    if (top < 8) top = r.bottom + 8;
  } else {
    left = r.right - w; top = r.bottom + 6;
    if (top + h > innerHeight - 8) top = r.top - h - 6;
  }
  el.style.left = Math.min(Math.max(8, left), innerWidth - w - 8) + 'px';
  el.style.top = Math.min(Math.max(8, top), innerHeight - h - 8) + 'px';
}
/**
 * Menü aus Einträgen: {txt, sub, ico, rechts, fn, sub: () => [...], gefahr, haken, aus, tip, klein} | '-' | {kopf}
 */
function menue(anker, eintraege, { seite = 'unten', flyout = false, cls = '' } = {}) {
  const el = flyout ? $('#flyout') : $('#pop');
  if (!flyout) $('#flyout').classList.add('hidden');
  el.className = 'pop ' + (flyout ? 'flyout ' : '') + cls;
  el.innerHTML = eintraege.map((e, i) => {
    if (e === '-') return '<div class="sep"></div>';
    if (e.kopf) return `<div class="kopf">${esc(e.kopf)}</div>`;
    return `<button class="eintrag${e.gefahr ? ' gefahr' : ''}${e.haken ? ' gewaehlt' : ''}" data-n="${i}" role="menuitem"
      ${e.aus ? 'disabled' : ''} ${e.tip ? `data-tip="${esc(e.tip)}"` : ''}>
      ${e.ico !== undefined ? `<span class="ico">${ico(e.ico)}</span>` : ''}
      <span class="txt">${esc(e.txt)}${e.klein ? `<small>${esc(e.klein)}</small>` : ''}</span>
      <span class="rechts">${e.rechts ? esc(e.rechts) : ''}${e.haken ? `<span class="haken">${ico('haken')}</span>` : ''}${e.sub ? ico('rechts') : ''}</span>
    </button>`;
  }).join('');
  symboleEinsetzen(el);
  const offenSub = btn => {
    const e = eintraege[+btn.dataset.n];
    if (e && e.sub) menue(btn, e.sub(), { seite: 'rechts', flyout: true });
    else if (!flyout) $('#flyout').classList.add('hidden');
  };
  el.onmouseover = ev => { const b = ev.target.closest('.eintrag'); if (b && !b.disabled) offenSub(b); };
  el.onclick = ev => {
    const b = ev.target.closest('.eintrag');
    if (!b || b.disabled) return;
    const e = eintraege[+b.dataset.n];
    if (e.sub) { offenSub(b); return; }
    popSchliessen();
    if (e.fn) Promise.resolve(e.fn()).catch(fehler);
  };
  platziere(el, anker, seite);
  if (!flyout) POP.anker = anker;
  const erster = el.querySelector('.eintrag:not(:disabled)');
  if (erster && !flyout) erster.focus({ preventScroll: true });
}
document.addEventListener('mousedown', ev => {
  if (!ev.target.closest('.pop') && !(POP.anker && POP.anker.contains(ev.target))) popSchliessen();
});
document.addEventListener('keydown', ev => {
  const pop = $('#pop');
  if (!pop.classList.contains('hidden') && ['ArrowDown', 'ArrowUp'].includes(ev.key)) {
    const liste = $$('.eintrag:not(:disabled)', ev.target.closest('.pop') || pop);
    const i = liste.indexOf(document.activeElement);
    const n = liste[(i + (ev.key === 'ArrowDown' ? 1 : -1) + liste.length) % liste.length];
    if (n) { n.focus(); ev.preventDefault(); }
  }
  if (ev.key === 'ArrowRight' && document.activeElement?.closest('#pop .eintrag')) document.activeElement.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
});

// ------------------------------------------------------------------ Dialoge
function modal(html, { breit = false, beimOeffnen } = {}) {
  return new Promise(resolve => {
    const m = $('#modal'), card = $('#modalCard');
    card.className = 'modal-card' + (breit ? ' breit' : '');
    card.innerHTML = html;
    symboleEinsetzen(card);
    m.classList.remove('hidden');
    const zu = wert => { m.classList.add('hidden'); card.innerHTML = ''; m.onclick = null; document.removeEventListener('keydown', taste, true); resolve(wert); };
    const taste = ev => { if (ev.key === 'Escape') { ev.stopPropagation(); zu(null); } };
    document.addEventListener('keydown', taste, true);
    m.onclick = ev => { if (ev.target === m) zu(null); const b = ev.target.closest('[data-zu]'); if (b) zu(b.dataset.zu === 'null' ? null : b.dataset.zu); };
    if (beimOeffnen) beimOeffnen(card, zu);
    const f = card.querySelector('input:not([disabled]),select,textarea');
    if (f) setTimeout(() => f.focus(), 20);
  });
}
function eingabe(titel, label, wert = '', knopf = 'Speichern') {
  return modal(`<h3>${esc(titel)}</h3><form id="mf"><div class="feld" style="margin-top:14px"><label>${esc(label)}</label>
    <input id="mfIn" value="${esc(wert)}" maxlength="60" required></div>
    <div class="knoepfe"><button type="button" class="btn" data-zu="null">Abbrechen</button><button class="btn primaer">${esc(knopf)}</button></div></form>`,
  { beimOeffnen: (c, zu) => { c.querySelector('#mf').onsubmit = ev => { ev.preventDefault(); zu(c.querySelector('#mfIn').value.trim() || null); }; } });
}
function bestaetigen(titel, text, knopf = 'OK', gefahr = false) {
  return modal(`<h3>${esc(titel)}</h3><p class="unter" style="margin-top:8px">${esc(text)}</p>
    <div class="knoepfe"><button class="btn" data-zu="null">Abbrechen</button><button class="btn ${gefahr ? 'gefahr' : 'primaer'}" data-zu="ja">${esc(knopf)}</button></div>`).then(v => v === 'ja');
}

// ------------------------------------------------------------------ Zugang
// Keine Anmeldung (seit 06.10.2026). Hinein kommt nur, wer aus der Werkstatt kommt: Sie hängt eine
// Einlassmarke hinter „#e=“ an die Adresse. Der Teil hinter „#“ geht nie an einen Server; die Seite
// liest ihn, löscht ihn sofort aus der Adresszeile und tauscht ihn gegen das Sitzungs-Cookie (zugang.py).
function zeigeZugang(meldung) {
  $('#app').classList.add('hidden');
  $('#login').classList.remove('hidden');
  const t = $('#zgText');
  t.textContent = meldung || 'Eine Anmeldung brauchst du hier nicht. Der Weg hinein führt immer über die Werkstatt:';
  t.classList.toggle('fehler', !!meldung);
}
function einlassMarke() {
  const m = /(?:^#|&)e=([A-Za-z0-9_-]{43})(?:&|$)/.exec(location.hash);
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  return m ? m[1] : '';
}

// Jeder Aufruf beginnt gleich: Erstellen mit den letzten Ergebnissen, Modus Bild, Chat zu, Cursor im
// Eingabefeld. Wer aus der Werkstatt kommt, will etwas erzeugen – nicht dort weitermachen, wo zuletzt
// eine Ordner- oder Papierkorbansicht offen war.
async function angemeldet(nutzer, csrf) {
  S.nutzer = nutzer; S.csrf = csrf; S.admin = nutzer.rolle === 'admin';
  S.modus = 'bild'; speicher.setz('modus', 'bild');
  $('#login').classList.add('hidden');
  $('#app').classList.remove('hidden');
  profilZeigen();
  railBauen();
  await Promise.all([katalogLaden(), videoKatalogLaden(), audioKatalogLaden(), ordnerLaden(), elementeLaden()]).catch(fehler);
  katalogHolen().catch(() => {});      // Katalog mit Kosten für alle Modellwahlen vorladen
  kontoLaden();
  await auftraegeLaden();
  chatUmschalten(false);
  modusSetzen('bild');
  await ansicht('erstellen');
  await begruessungZeigen();
  pr.focus();
}

// ------------------------------------------------------------------ Begrüssung
// Grosses Fenster beim Aufruf, bis „Nicht mehr anzeigen“ gesetzt ist. Der Haken gilt für jeden Weg
// hinaus (Verstanden, X, Esc, Klick daneben) – wer ihn setzt und dann X drückt, meint dasselbe.
// Aus dem Profilmenü („Begrüssung zeigen“) kommt es immer; der Haken steht dann so, wie er gespeichert
// ist, und wer ihn abwählt, bekommt die Begrüssung beim nächsten Aufruf wieder.
const BEGRUESSUNG_AUS = 'begruessungAus';
async function begruessungZeigen(immer = false) {
  let aus = speicher.lies(BEGRUESSUNG_AUS, false) === true;
  if (aus && !immer) return;
  await modal(`
    <button type="button" class="begr-zu icon-btn" data-zu="null" aria-label="Schliessen" data-tip="Schliessen"><span data-i="x"></span></button>
    <div class="begr-kopf">
      <img src="/static/favicon.svg" alt="" width="52" height="52">
      <h2 class="begr-titel">Willkommen im Cinema Studio</h2>
      <p class="begr-unter">Bilder, Videos und Stimmen aus deinen Worten</p>
    </div>
    <div class="begr-zier" aria-hidden="true"></div>
    <p class="begr-text">Hier entstehen Bilder, Videos und gesprochene Texte. Du beschreibst unten im Eingabefeld, was du sehen
      oder hören willst, wählst Modell und Format und klickst auf „Erzeugen“. Deine bisherigen Ergebnisse liegen dahinter,
      die neuesten zuerst. Bevor ein Auftrag losgeht, siehst du, was er ungefähr kostet.</p>
    <h3 class="begr-zwischen">So kommst du schneller zu guten Ergebnissen</h3>
    <ol class="begr-schritte">
      <li><b>Prompt aus der Community holen.</b> In der Community der Werkstatt liegen erprobte Bild- und Videoprompts mit
        Beispielen. Nimm einen, der deiner Idee nahekommt, als Ausgangspunkt.</li>
      <li><b>Mit dem Chat besprechen.</b> Öffne den Assistenten mit dem Zauberstab oben rechts, füge den Prompt ein und sag,
        was anders werden soll: Motiv, Stimmung, Licht, Kamera. Er fragt nach und schreibt den Prompt neu.</li>
      <li><b>Auf Englisch übernehmen.</b> Der Assistent liefert den fertigen Prompt auf Englisch, weil die Modelle Englisch am
        genauesten verstehen. Der Knopf „In Bild-Eingabe“ unter seiner Antwort trägt ihn samt Einstellungen direkt ins
        Eingabefeld ein. Die Erklärung dazu bekommst du weiter auf Deutsch.</li>
    </ol>
    <div class="begr-fuss">
      <label class="haken-zeile"><input type="checkbox" id="begrAus" ${aus ? 'checked' : ''}> Nicht mehr anzeigen</label>
      <button type="button" class="btn primaer" data-zu="ok">Verstanden</button>
    </div>`, {
    breit: true,
    beimOeffnen: card => {
      card.classList.add('begruessung');
      card.setAttribute('aria-labelledby', 'begrTitel');
      card.querySelector('.begr-titel').id = 'begrTitel';
      card.querySelector('#begrAus').onchange = ev => { aus = ev.target.checked; };
      setTimeout(() => card.querySelector('[data-zu="ok"]').focus(), 30);
    },
  });
  speicher.setz(BEGRUESSUNG_AUS, aus);
}

function profilZeigen() {
  const n = S.nutzer;
  $('#profName').textContent = n.name;
  $('#profRolle').textContent = n.rolle === 'admin' ? 'Administrator' : 'Nutzer';
  $('#avatar').textContent = (n.name || n.benutzer).split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

// ------------------------------------------------------------------ Menü links
const NAV = [
  ['erstellen', 'Erstellen', 'funke', 'Bilder und Videos erzeugen – die letzten Ergebnisse liegen dahinter'],
  ['audio', 'Audio', 'ton', 'Text sprechen lassen: Sprachmodelle, Stimmen, eigene geklonte Stimmen, Klang'],
  ['bibliothek', 'Bibliothek', 'bilder', 'Alle deine Bilder, nach Tagen sortiert'],
  ['favoriten', 'Favoriten', 'herz', 'Bilder, die du mit ♥ markiert hast'],
  ['ordner', 'Ordner', 'ordner', 'Eigene Ordner zum Sortieren'],
  ['elemente', 'Elemente', 'element', 'Wiederverwendbare Referenzen: Figuren, Produkte, Stile'],
  ['veroeffentlicht', 'Veröffentlicht', 'globus', 'Freigegebene Bilder aller Nutzer dieser Installation'],
  ['verbrauch', 'Verbrauch', 'chart', 'Kosten und Anzahl der erzeugten Bilder'],
  ['papierkorb', 'Papierkorb', 'muell', 'Gelöschte Bilder – wiederherstellen oder endgültig löschen'],
  ['modelle', 'Modelle', 'katalog', 'Modellkatalog von OpenRouter: Bild, Video, Sprache, Text, Vision – mit Kosten'],
];
function railBauen() {
  const nav = $('#railNav');
  const aktiv = S.ansicht;
  nav.innerHTML = NAV.map(([id, txt, ic, tip]) => {
    if (id === 'ordner') {
      return `<button data-nav="ordner" class="${aktiv.startsWith('ordner:') ? 'active' : ''} ${S.ordnerOffen ? 'open' : ''}" data-tip="${esc(tip)}">
          <span class="ico">${ico(ic)}</span><span class="lbl">${txt}</span><span class="sub-arrow">${ico('rechts')}</span></button>
        <div class="rail-sub ${S.ordnerOffen ? '' : 'hidden'}">
          ${S.ordner.map(o => `<button data-nav="ordner:${o.id}" class="${aktiv === 'ordner:' + o.id ? 'active' : ''}" data-tip="Ordner „${esc(o.name)}“ öffnen – Rechtsklick zum Umbenennen/Löschen">
            <span class="lbl">${esc(o.name)}</span><span class="badge">${o.anzahl}</span></button>`).join('')}
          <button data-nav="ordner-neu" class="neu" data-tip="Einen neuen Ordner anlegen"><span class="lbl">+ Neuer Ordner</span></button>
        </div>`;
    }
    return `<button data-nav="${id}" class="${aktiv === id ? 'active' : ''}" data-tip="${esc(tip)}"><span class="ico">${ico(ic)}</span><span class="lbl">${txt}</span></button>`;
  }).join('');
}
$('#railNav').addEventListener('click', async ev => {
  const b = ev.target.closest('[data-nav]');
  if (!b) return;
  const z = b.dataset.nav;
  if (z === 'ordner') {
    if ($('#rail').classList.contains('zu')) { $('#rail').classList.remove('zu'); speicher.setz('railZu', false); }
    S.ordnerOffen = !S.ordnerOffen; speicher.setz('ordnerOffen', S.ordnerOffen); railBauen(); return;
  }
  if (z === 'ordner-neu') { await ordnerNeu(); return; }
  ansicht(z);
  if (innerWidth <= 700) $('#rail').classList.add('zu');
});
$('#railNav').addEventListener('contextmenu', ev => {
  const b = ev.target.closest('[data-nav^="ordner:"]');
  if (!b) return;
  ev.preventDefault();
  const o = S.ordner.find(x => 'ordner:' + x.id === b.dataset.nav);
  menue(b, [
    { ico: 'text', txt: 'Umbenennen', fn: async () => { const n = await eingabe('Ordner umbenennen', 'Name', o.name); if (n) { S.ordner = (await api('ordner/' + o.id, { name: n })).ordner; railBauen(); } } },
    { ico: 'muell', txt: 'Ordner löschen', gefahr: true, klein: 'Bilder bleiben erhalten', fn: async () => {
      if (!await bestaetigen('Ordner löschen?', `„${o.name}“ wird entfernt. Die Bilder bleiben in der Bibliothek.`, 'Löschen', true)) return;
      S.ordner = (await api('ordner/' + o.id, { loeschen: true })).ordner;
      if (S.ansicht === 'ordner:' + o.id) ansicht('bibliothek'); else railBauen();
    } },
  ], { seite: 'rechts' });
});
(() => {
  const r = $('#rail'), t = $('#railToggle');
  t.innerHTML = ico('menue');
  if (speicher.lies('railZu', innerWidth <= 700)) r.classList.add('zu');
  t.onclick = () => { r.classList.toggle('zu'); speicher.setz('railZu', r.classList.contains('zu')); };
})();

// Profilmenü (unten links)
$('#profileBtn').onclick = () => {
  const b = $('#profileBtn');
  $('#profileBtn .chev').innerHTML = ico('hoch');
  menue(b, [
    { kopf: 'PROMPTHEUS Cinema Studio' },
    { ico: 'zahnrad', txt: 'Einstellungen', klein: 'Anschluss, Modelle, Audio, Ablage', fn: einstellungenDialog },
    { ico: 'funke', txt: 'Begrüssung zeigen', klein: 'Erklärung und Tipps vom Start', fn: () => begruessungZeigen(true).then(() => pr.focus()) },
    { ico: 'ordnerAuf', txt: 'Ablage öffnen', klein: 'Alle Bilder, Videos und Audios im Explorer', fn: () => imOrdnerZeigen(null) },
  ], { seite: 'oben' });
};

// ------------------------------------------------------------------ Daten laden
async function katalogLaden(neu = false) {
  const d = await api('modelle' + (neu ? '?neu=1' : ''));
  S.modelle = d.modelle; S.empfohlen = d.empfohlen; S.standard = d.standard;
  S.waehrung = d.waehrung; S.eurKurs = d.eur_kurs; S.katalogFehler = d.fehler; S.anpassung = d.anpassung || 'strecken';
  if (!S.modelle.length) {
    toast(d.fehler ? 'Modellkatalog nicht ladbar: ' + d.fehler : 'Modellkatalog wird geladen …', d.fehler ? 'fehler' : '');
    if (!d.fehler) setTimeout(() => katalogLaden().then(genAktualisieren).catch(fehler), 4000);
  }
  const gespeichert = speicher.lies('gen', null);
  if (!S.gen.modell) {
    if (gespeichert && S.modelle.some(m => m.id === gespeichert.modell)) Object.assign(S.gen, gespeichert, { refs: [], elemente: [], hintergrund: '' });
    else S.gen.modell = S.modelle.some(m => m.id === S.standard) ? S.standard : (S.modelle[0]?.id || '');
  }
  genAktualisieren();
}
async function videoKatalogLaden(neu = false) {
  const d = await api('videomodelle' + (neu ? '?neu=1' : ''));
  S.vmodelle = d.modelle; S.vempfohlen = d.empfohlen; S.vstandard = d.standard; S.vkatalogFehler = d.fehler;
  if (!S.vmodelle.length && !d.fehler) setTimeout(() => videoKatalogLaden().catch(fehler), 4000);
  const gespeichert = speicher.lies('vgen', null);
  if (!S.vgen.modell) {
    if (gespeichert && S.vmodelle.some(m => m.id === gespeichert.modell)) Object.assign(S.vgen, gespeichert, { start: null, ende: null });
    else S.vgen.modell = S.vmodelle.some(m => m.id === S.vstandard) ? S.vstandard : (S.vmodelle[0]?.id || '');
  }
  modusSetzen(S.modus);
}
async function ordnerLaden() { S.ordner = (await api('ordner')).ordner; railBauen(); }
async function elementeLaden() { S.elemente = (await api('elemente')).elemente; }
async function kontoLaden() {
  const box = $('#kontoBox');
  try {
    const k = await api('konto');
    if (!k.verbunden) {
      box.innerHTML = `<span class="warn">● Nicht verbunden</span><br><small>${esc(k.meldung || '')}</small>`;
      box.dataset.tip = 'Klicken, um den OpenRouter-Schlüssel einzutragen';
      box.onclick = einstellungenDialog; box.style.cursor = 'pointer';
    } else {
      const rest = k.rest != null ? `Guthaben <b>${geld(k.rest, 2)}</b>` : `Verbraucht <b>${geld(k.verbraucht, 2)}</b>`;
      box.innerHTML = `${rest}${k.limit != null ? `<br><small>Limit ${geld(k.limit, 2)}</small>` : ''}`;
      box.dataset.tip = `OpenRouter-Schlüssel: bisher ${geld(k.verbraucht, 2)} verbraucht` + (k.limit != null ? `, Limit ${geld(k.limit, 2)}` : ', kein Limit gesetzt');
      box.onclick = null; box.style.cursor = '';
    }
  } catch { box.textContent = 'Kontostand nicht abrufbar'; }
}

// ------------------------------------------------------------------ Ansichten
const TITEL = { audio: 'Audio', modelle: 'Modelle', erstellen: 'Erstellen', bibliothek: 'Bibliothek', favoriten: 'Favoriten', elemente: 'Elemente', veroeffentlicht: 'Veröffentlicht', verbrauch: 'Verbrauch', papierkorb: 'Papierkorb' };
const bildAnsicht = a => ['erstellen', 'audio', 'bibliothek', 'favoriten', 'veroeffentlicht', 'papierkorb'].includes(a) || a.startsWith('ordner:');

async function ansicht(a) {
  if (a.startsWith('ordner:') && !S.ordner.some(o => 'ordner:' + o.id === a)) a = 'bibliothek';
  if (!TITEL[a] && !a.startsWith('ordner:')) a = 'erstellen';
  S.ansicht = a; speicher.setz('ansicht', a);
  auswahlBeenden();
  railBauen();
  const o = S.ordner.find(x => 'ordner:' + x.id === a);
  $('#viewTitel').textContent = o ? o.name : TITEL[a];
  const mitBildern = bildAnsicht(a);
  $('#composer').classList.toggle('hidden', !mitBildern || a === 'papierkorb');
  $('#wand').classList.toggle('ohne-composer', !mitBildern || a === 'papierkorb');
  $('.suche').classList.toggle('hidden', !mitBildern);
  $('#typFilter').classList.toggle('hidden', !mitBildern || a === 'audio');
  if (a === 'audio' && S.modus !== 'audio') modusSetzen('audio');
  $('#btnAuswahl').classList.toggle('hidden', !mitBildern);
  $('#btnGroesse').classList.toggle('hidden', !mitBildern);
  $('#btnLeeren').classList.toggle('hidden', a !== 'papierkorb');
  $('#viewCount').textContent = '';
  if (mitBildern) await bilderLaden();
  else if (a === 'verbrauch') await verbrauchZeigen();
  else if (a === 'elemente') elementeZeigen();
  else if (a === 'modelle') await katalogZeigen();
  $('#wand').scrollTop = 0;
}

async function bilderLaden() {
  const a = S.ansicht;
  const q = new URLSearchParams({ ansicht: a === 'erstellen' || a === 'bibliothek' ? 'alle' : a });
  if (S.suche) q.set('q', S.suche);
  if (a === 'audio') q.set('typ', 'audio');
  else if (S.typFilter) q.set('typ', S.typFilter);
  try { S.bilder = (await api('bilder?' + q)).bilder; } catch (e) { fehler(e); S.bilder = []; }
  if (S.ansicht === a) wandZeichnen();
  zuschnitteErledigen();
}

// Bilder mit offenem Zuschnitt (z. B. 4:5 bei Modellen ohne dieses Format) mittig zuschneiden
const ZS_LAEUFT = new Set();
async function zuschnitteErledigen() {
  for (const b of S.bilder.filter(x => x.eigen && x.zuschnitt && !ZS_LAEUFT.has(x.id))) {
    ZS_LAEUFT.add(b.id);
    try {
      const blob = await (await fetch('/bild/' + b.id)).blob();
      const bmp = await createImageBitmap(blob);
      const [zw, zh] = b.zuschnitt.split(':').map(Number);
      // Zielgröße: eine Achse bleibt, die andere wird verkleinert (nie hochgerechnet)
      let w = bmp.width, h = Math.round(w * zh / zw);
      if (h > bmp.height) { h = bmp.height; w = Math.round(h * zw / zh); }
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const ctx = c.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      if (b.anpassung === 'strecken') ctx.drawImage(bmp, 0, 0, w, h);   // ganzes Bild, Rahmen bleibt vollständig
      else ctx.drawImage(bmp, Math.round((bmp.width - w) / 2), Math.round((bmp.height - h) / 2), w, h, 0, 0, w, h);
      const daten = b.mime === 'image/jpeg' ? c.toDataURL('image/jpeg', 0.95) : c.toDataURL('image/png');
      const d = await api('bild/' + b.id, { aktion: 'zuschnitt', daten });
      Object.assign(b, d.bild);
      delete b.zuschnitt;
      const img = document.querySelector(`.karte[data-id="${b.id}"]`);
      if (img) { img.style.setProperty('--ar', (b.breite / b.hoehe).toFixed(4)); img.querySelector('img').src = `/bild/${b.id}?v=${Date.now()}`; }
    } catch (e) { toast('Zuschnitt fehlgeschlagen: ' + e.message, 'fehler'); }
    finally { ZS_LAEUFT.delete(b.id); }
  }
}

const istVideo = b => b?.typ === 'video';
const laengeText = s => { s = Math.round(+s || 0); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
function karteHtml(b) {
  if (b.typ === 'audio') return audioKarteHtml(b);
  const ar = b.breite && b.hoehe ? (b.breite / b.hoehe).toFixed(4) : arVon(b.parameter?.seitenverhaeltnis);
  const v = istVideo(b);
  const par = [b.parameter?.seitenverhaeltnis, b.parameter?.qualitaet && QUAL[b.parameter.qualitaet]?.[0], b.parameter?.aufloesung,
    v && b.parameter?.dauer ? b.parameter.dauer + ' s' : '', v && b.parameter?.ton ? 'mit Ton' : ''].filter(Boolean).join(' · ');
  const medium = v
    ? `<video src="/bild/${b.id}#t=0.1" muted loop playsinline preload="metadata" aria-label="${esc(b.prompt.slice(0, 120))}"></video>
       <span class="laenge">${ico('play')}${laengeText(b.dauer || b.parameter?.dauer)}</span>`
    : `<img src="/bild/${b.id}" alt="${esc(b.prompt.slice(0, 120))}" loading="lazy">`;
  return `<div class="karte${S.auswahl.has(b.id) ? ' gewaehlt' : ''}${v ? ' ist-video' : ''}" data-id="${b.id}" style="--ar:${ar}">
    ${medium}
    <button class="sel" data-a="sel" data-tip="Auswählen" aria-label="Auswählen">${ico('haken')}</button>
    ${b.eigen ? '' : `<span class="marke" data-tip="Von einem anderen Nutzer veröffentlicht">geteilt</span>`}
    ${b.eigen && b.veroeffentlicht && S.ansicht !== 'veroeffentlicht' ? `<span class="marke" data-tip="Für alle Nutzer sichtbar">veröffentlicht</span>` : ''}
    <div class="aktionen">
      ${b.eigen && S.ansicht !== 'papierkorb' ? `<button class="rund ${b.like ? 'an' : ''}" data-a="like" data-tip="${b.like ? 'Aus Favoriten entfernen' : 'Zu Favoriten'}" aria-label="Favorit">${ico(b.like ? 'herzVoll' : 'herz')}</button>` : ''}
      <button class="rund" data-a="dl" data-tip="Herunterladen" aria-label="Herunterladen">${ico('download')}</button>
      <button class="rund" data-a="kopie" data-tip="${v ? 'Beschreibung kopieren' : 'Bild in die Zwischenablage kopieren'}" aria-label="Kopieren">${ico('kopie')}</button>
      <button class="rund" data-a="mehr" data-tip="Weitere Aktionen" aria-label="Weitere Aktionen" aria-haspopup="menu">${ico('mehr')}</button>
    </div>
    <div class="fuss"><p>${esc(b.prompt)}</p><small>${esc(b.modell_name)}${par ? ' · ' + esc(par) : ''}</small></div>
  </div>`;
}

function arVon(sv) {
  if (!sv || sv === 'auto') return 1;
  const [w, h] = sv.split(':').map(Number);
  return w && h ? +(w / h).toFixed(4) : 1;
}

function wandZeichnen() {
  const wand = $('#wand');
  const a = S.ansicht;
  // Laufende Aufträge dort zeigen, wo ihr Ergebnis landet: Audio-Ansicht → nur Audio, sonst nach Typ-Filter
  const typ = a === 'audio' ? 'audio' : S.typFilter;
  const passt = j => !typ || (j.art || 'bild') === typ;
  const laufend = ['erstellen', 'bibliothek', 'audio'].includes(a) && !S.suche ? S.auftraege.filter(j => j.status === 'laufend' && passt(j)) : [];
  const kaputt = ['erstellen', 'audio'].includes(a) ? S.auftraege.filter(j => j.status !== 'laufend' && j.fehler.length && !S.verworfen.has(j.id) && passt(j)) : [];
  let liste = S.bilder;
  if (a === 'erstellen') liste = liste.slice(0, 120);
  const nv = S.bilder.filter(istVideo).length, na = S.bilder.filter(b => b.typ === 'audio').length, nb = S.bilder.length - nv - na;
  $('#viewCount').textContent = [nb ? `${zahl(nb)} Bild${nb === 1 ? '' : 'er'}` : '', nv ? `${zahl(nv)} Video${nv === 1 ? '' : 's'}` : '',
    na ? `${zahl(na)} Audio${na === 1 ? '' : 's'}` : ''].filter(Boolean).join(' · ');
  if (!liste.length && !laufend.length && !kaputt.length) {
    const was = { bild: 'Bilder', video: 'Videos', audio: 'Audios' }[S.typFilter];
    const leer = {
      erstellen: ['funke', was ? `Noch keine ${was}` : 'Noch nichts erstellt', 'Beschreibe unten, was entstehen soll, wähle ein Modell und klicke auf „Erzeugen“.'],
      audio: ['ton', 'Noch keine Audios', 'Gib unten den Text ein, wähle Modell und Stimme und klicke auf „Erzeugen“.'],
      favoriten: ['herz', 'Keine Favoriten', 'Markiere Bilder mit ♥, um sie hier zu sammeln.'],
      veroeffentlicht: ['globus', 'Nichts veröffentlicht', 'Über „…“ → „Veröffentlichen“ teilst du ein Bild mit allen Nutzern dieser Installation.'],
      papierkorb: ['muell', 'Papierkorb ist leer', 'Gelöschte Bilder landen zuerst hier.'],
    }[a] || ['bilder', S.suche ? 'Keine Treffer' : was ? `Keine ${was}` : 'Noch leer', S.suche ? 'Versuche einen anderen Suchbegriff.' : 'Hier ist noch nichts.'];
    wand.innerHTML = `<div class="leer"><div class="gross">${ico(leer[0])}</div><h3>${leer[1]}</h3><p>${leer[2]}</p></div>`;
    return;
  }
  let html = '';
  if (laufend.length || kaputt.length) {
    html += `<div class="tag-kopf">In Arbeit</div><div class="raster">`;
    for (const j of laufend) {
      const fertig = j.bilder.length;
      for (let i = fertig; i < j.gesamt; i++) {
        if (j.art === 'audio') { html += `<div class="karte warten" style="--ar:2.2" data-tip="${esc(j.prompt.slice(0, 200))}"><div class="spin"></div><span>Audio · ${esc(j.modell_name)}</span></div>`; continue; }
        const vid = j.art === 'video';
        html += `<div class="karte warten" style="--ar:${arVon(j.parameter.seitenverhaeltnis || (vid ? '16:9' : ''))}" data-tip="${esc(j.prompt.slice(0, 200))}">
          <div class="spin"></div><span>${vid ? 'Video · ' : ''}${esc(j.modell_name)} · ${i + 1}/${j.gesamt}</span>
          ${vid ? `<small style="color:var(--muted2)">${j.phase ? esc(j.phase) : `${j.fortgesetzt ? 'nach Neustart fortgesetzt · ' : ''}dauert meist 1–5 Min.`}</small>` : ''}</div>`;
      }
    }
    for (const j of kaputt) {
      html += `<div class="karte fehler"><b>Auftrag ${j.status === 'teilweise' ? 'teilweise ' : ''}fehlgeschlagen</b>
        <span>${esc(j.fehler[0])}</span><small style="color:var(--muted);margin-top:6px">${esc(j.modell_name)}</small>
        <button data-verwerfen="${j.id}" data-tip="Meldung ausblenden">Ausblenden</button></div>`;
    }
    html += '</div>';
  }
  let tag = '';
  let offen = false;
  for (const b of liste) {
    const t = tagName(b.erstellt);
    if (t !== tag) {
      if (offen) html += '</div>';
      html += `<div class="tag-kopf">${esc(t)}</div><div class="raster">`;
      tag = t; offen = true;
    }
    html += karteHtml(b);
  }
  if (offen) html += '</div>';
  if (a === 'erstellen' && S.bilder.length > liste.length) html += `<div class="leer" style="margin:24px auto"><button class="btn" data-nav-to="bibliothek">Alle ${zahl(S.bilder.length)} Bilder in der Bibliothek ansehen</button></div>`;
  wand.innerHTML = html;
}

$('#wand').addEventListener('click', async ev => {
  const nav = ev.target.closest('[data-nav-to]');
  if (nav) return ansicht(nav.dataset.navTo);
  const verw = ev.target.closest('[data-verwerfen]');
  if (verw) { S.verworfen.add(verw.dataset.verwerfen); return wandZeichnen(); }
  const k = ev.target.closest('.karte[data-id]');
  if (!k) return;
  const b = S.bilder.find(x => x.id === k.dataset.id);
  if (!b) return;
  const a = ev.target.closest('[data-a]')?.dataset.a;
  try {
    if (a === 'sel' || (!a && S.waehlen)) return auswahlUmschalten(b.id, k);
    if (a === 'like') return await bildAktion(b, 'like');
    if (a === 'dl') return speichernUnter(b);
    if (a === 'spiel') return audioKarteSpielen(b, ev.target.closest('[data-a]'));
    if (a === 'kopie') return istVideo(b) || b.typ === 'audio' ? await textKopieren(b.prompt, 'Beschreibung kopiert.') : await bildKopieren(b);
    if (a === 'mehr') return mehrMenue(ev.target.closest('[data-a]'), b);
    oeffnen(b.id);
  } catch (e) { fehler(e); }
});
// Videos spielen beim Überfahren stumm ab
$('#wand').addEventListener('mouseover', ev => {
  const k = ev.target.closest('.karte.ist-video');
  if (k && !k.contains(ev.relatedTarget)) k.querySelector('video')?.play().catch(() => {});
});
$('#wand').addEventListener('mouseout', ev => {
  const k = ev.target.closest('.karte.ist-video');
  if (k && !k.contains(ev.relatedTarget)) { const v = k.querySelector('video'); if (v) { v.pause(); v.currentTime = 0.1; } }
});
$('#typFilter').addEventListener('click', ev => {
  const b = ev.target.closest('[data-typ]');
  if (!b) return;
  S.typFilter = b.dataset.typ;
  $$('#typFilter button').forEach(x => x.classList.toggle('an', x === b));
  bilderLaden();
});
$('#wand').addEventListener('contextmenu', ev => {
  const k = ev.target.closest('.karte[data-id]');
  const b = k && S.bilder.find(x => x.id === k.dataset.id);
  if (!b) return;
  ev.preventDefault();
  mehrMenue(k.querySelector('[data-a="mehr"]'), b);
});

let sucheTimer;
$('#suche').addEventListener('input', ev => {
  clearTimeout(sucheTimer);
  sucheTimer = setTimeout(() => { S.suche = ev.target.value.trim(); bilderLaden(); }, 250);
});
(() => {
  const groessen = [260, 180, 360];
  let i = speicher.lies('kachel', 0);
  const setz = () => document.documentElement.style.setProperty('--kachel', groessen[i] + 'px');
  if (innerWidth > 700) setz();
  $('#btnGroesse').onclick = () => { i = (i + 1) % groessen.length; speicher.setz('kachel', i); setz(); };
})();
$('#btnLeeren').onclick = async () => {
  if (!S.bilder.length) return toast('Der Papierkorb ist bereits leer.');
  if (!await bestaetigen('Papierkorb leeren?', `${S.bilder.length} Bild(er) werden endgültig gelöscht. Das lässt sich nicht rückgängig machen.`, 'Endgültig löschen', true)) return;
  try { const d = await api('papierkorb_leeren', {}); toast(`${d.anzahl} Bild(er) endgültig gelöscht.`, 'ok'); bilderLaden(); } catch (e) { fehler(e); }
};

// ------------------------------------------------------------------ Auswahl
function auswahlUmschalten(id, karte) {
  if (S.auswahl.has(id)) S.auswahl.delete(id); else S.auswahl.add(id);
  karte?.classList.toggle('gewaehlt', S.auswahl.has(id));
  S.waehlen = true;
  auswahlLeiste();
}
function auswahlLeiste() {
  const n = S.auswahl.size;
  $('#wand').classList.toggle('waehlen', S.waehlen);
  $('#btnAuswahl').classList.toggle('an', S.waehlen);
  $('#auswahlLeiste').classList.toggle('hidden', !S.waehlen);
  $('#auswahlZahl').textContent = `${n} ausgewählt`;
  const pk = S.ansicht === 'papierkorb', fremd = S.ansicht === 'veroeffentlicht';
  $('[data-sammel="papierkorb"]').classList.toggle('hidden', pk || fremd);
  $('[data-sammel="favorit"]').classList.toggle('hidden', pk || fremd);
  $('[data-sammel="ordner"]').classList.toggle('hidden', pk || fremd);
  $('[data-sammel="wiederherstellen"]').classList.toggle('hidden', !pk);
}
function auswahlBeenden() { S.auswahl.clear(); S.waehlen = false; $$('.karte.gewaehlt').forEach(k => k.classList.remove('gewaehlt')); auswahlLeiste(); }
$('#btnAuswahl').onclick = () => { if (S.waehlen) auswahlBeenden(); else { S.waehlen = true; auswahlLeiste(); } };
$('#auswahlLeiste').addEventListener('click', async ev => {
  const b = ev.target.closest('[data-sammel]');
  if (!b) return;
  const art = b.dataset.sammel;
  const ids = [...S.auswahl];
  if (art === 'abbrechen') return auswahlBeenden();
  if (!ids.length) return toast('Erst Bilder anklicken, um sie auszuwählen.');
  try {
    if (art === 'herunterladen') {
      return mehrereSpeichern(ids);
      for (const id of ids) { herunterladen({ id }); await new Promise(r => setTimeout(r, 350)); }
      return;
    }
    if (art === 'ordner') {
      return menue(b, [...S.ordner.map(o => ({ ico: 'ordner', txt: o.name, fn: () => sammel(ids, { aktion: 'ordner', ordner: o.id }, `In „${o.name}“ verschoben.`) })),
        '-', { ico: 'ordnerPlus', txt: 'Neuer Ordner …', fn: async () => { const oid = await ordnerNeu(); if (oid) await sammel(ids, { aktion: 'ordner', ordner: oid }, 'Verschoben.'); } }]);
    }
    if (art === 'favorit') return await sammel(ids, { aktion: 'like', wert: true }, 'Als Favoriten markiert.');
    if (art === 'papierkorb') return await sammel(ids, { aktion: 'papierkorb' }, `${ids.length} Bild(er) im Papierkorb.`);
    if (art === 'wiederherstellen') return await sammel(ids, { aktion: 'wiederherstellen' }, 'Wiederhergestellt.');
  } catch (e) { fehler(e); }
});
async function sammel(ids, daten, meldung) {
  await api('sammel', { ids, ...daten });
  toast(meldung, 'ok');
  auswahlBeenden();
  await Promise.all([bilderLaden(), ordnerLaden()]);
}

// ------------------------------------------------------------------ Bildaktionen
async function bildAktion(b, aktion, extra = {}) {
  const d = await api('bild/' + b.id, { aktion, ...extra });
  Object.assign(b, d.bild);
  if (['papierkorb', 'wiederherstellen'].includes(aktion) || (S.ansicht === 'favoriten' && aktion === 'like') || (S.ansicht.startsWith('ordner:') && aktion === 'ordner')) {
    S.bilder = S.bilder.filter(x => x.id !== b.id);
  }
  wandZeichnen();
  if (aktion === 'ordner') ordnerLaden();
  return b;
}
function herunterladen(b) {
  return speichernUnter(b);
  const a = document.createElement('a');
  a.href = `/bild/${b.id}?dl=1`; a.download = '';
  document.body.appendChild(a); a.click(); a.remove();
}
async function bildKopieren(b) {
  if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') throw new Error('Dieser Browser kann keine Bilder in die Zwischenablage kopieren.');
  const blob = await (await fetch('/bild/' + b.id)).blob();
  let png = blob;
  if (blob.type !== 'image/png') {
    const bmp = await createImageBitmap(blob);
    const c = document.createElement('canvas'); c.width = bmp.width; c.height = bmp.height;
    c.getContext('2d').drawImage(bmp, 0, 0);
    png = await new Promise(r => c.toBlob(r, 'image/png'));
  }
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })]);
  toast('Bild in die Zwischenablage kopiert.', 'ok');
}
async function textKopieren(t, meldung) { await navigator.clipboard.writeText(t); toast(meldung, 'ok'); }

function mehrMenue(anker, b, { ausLb = false } = {}) {
  // Aus der Großansicht: Aktionen, die ins Eingabefeld oder die Bildwand wirken, schließen sie vorher
  const lb = fn => () => { if (ausLb) lbZu(); return fn(); };
  if (b.typ === 'audio' && S.ansicht !== 'papierkorb') return audioMenue(anker, b, lb);
  if (S.ansicht === 'papierkorb') {
    return menue(anker, [
      { ico: 'oeffnen', txt: 'Öffnen', fn: () => oeffnen(b.id) },
      { ico: 'zurueck', txt: 'Wiederherstellen', fn: () => bildAktion(b, 'wiederherstellen').then(() => toast('Wiederhergestellt.', 'ok')) },
      '-',
      { ico: 'muell', txt: 'Endgültig löschen', gefahr: true, fn: async () => {
        if (!await bestaetigen('Endgültig löschen?', 'Das Bild wird dauerhaft entfernt.', 'Löschen', true)) return;
        await api('bild/' + b.id, { aktion: 'endgueltig' }); S.bilder = S.bilder.filter(x => x.id !== b.id); wandZeichnen();
      } },
    ]);
  }
  const eigen = b.eigen;
  const v = istVideo(b);
  const teilen = () => [
    ...(v ? [] : [{ ico: 'kopie', txt: 'Bild kopieren', fn: () => bildKopieren(b) }]),
    { ico: 'text', txt: 'Beschreibung kopieren', fn: () => textKopieren(b.prompt, 'Beschreibung kopiert.') },
    { ico: 'link', txt: 'Lokalen Link kopieren', klein: 'Nur auf diesem Rechner mit Anmeldung', fn: () => textKopieren(`${location.origin}/bild/${b.id}`, 'Link kopiert.') },
  ];
  const eintraege = [
    { ico: 'oeffnen', txt: 'Öffnen', fn: () => oeffnen(b.id) },
    { ico: 'neu', txt: 'Neu erzeugen', tip: 'Gleiche Beschreibung und Einstellungen sofort noch einmal erzeugen', fn: lb(() => neuErzeugen(b)) },
    { ico: 'kopie', txt: 'Wiederverwenden', tip: 'Beschreibung und Einstellungen ins Eingabefeld übernehmen', fn: lb(() => wiederverwenden(b)) },
    v ? { ico: 'fortsetzen', txt: 'Fortsetzen', klein: 'Letztes Bild als Startbild eines neuen Videos', fn: lb(() => videoFortsetzen(b)) }
      : { ico: 'animieren', txt: 'Animieren', klein: 'Dieses Bild als Startbild eines Videos', fn: lb(() => animieren(b)) },
  ];
  if (eigen && !v) {
    eintraege.push(
      { ico: 'at', txt: 'Element erstellen', sub: () => [['figur', 'Figur'], ['produkt', 'Produkt'], ['stil', 'Stil'], ['ort', 'Ort'], ['sonstiges', 'Sonstiges']]
        .map(([art, txt]) => ({ txt: 'Als ' + txt, fn: () => elementErstellen(b, art) })) },
      { ico: 'at', txt: 'Element zuweisen', aus: !S.elemente.length, tip: S.elemente.length ? '' : 'Noch keine Elemente vorhanden',
        sub: S.elemente.length ? () => S.elemente.map(el => ({ txt: el.name, klein: `${el.bilder.length} Bild(er)`, haken: el.bilder.some(x => x.id === b.id),
          fn: () => elementZuweisen(el, b) })) : undefined },
    );
  }
  if (!v) eintraege.push({ ico: 'zauber', txt: 'Weitere', sub: () => [
    { ico: 'variation', txt: 'Variationen', klein: 'Vier Abwandlungen vorbereiten', fn: lb(() => vorbereiten(b, 'variation')) },
    { ico: 'lupeGross', txt: 'Hochskalieren (4K)', klein: 'Mit einem 4K-fähigen Modell', fn: lb(() => vorbereiten(b, 'hoch')) },
    { ico: 'schere', txt: 'Hintergrund entfernen', klein: 'Transparenter Hintergrund', fn: lb(() => vorbereiten(b, 'freistellen')) },
    { ico: 'bilder', txt: 'Als Referenz verwenden', fn: lb(() => refHinzu({ id: b.id, url: '/bild/' + b.id })) },
  ] });
  if (eigen) eintraege.push({ ico: b.like ? 'herzVoll' : 'herz', txt: b.like ? 'Aus Favoriten entfernen' : 'Zu Favoriten', fn: () => bildAktion(b, 'like') });
  eintraege.push({ ico: 'teilen', txt: 'Teilen', sub: teilen });
  if (eigen) {
    eintraege.push(
      { ico: 'ordner', txt: 'In Ordner', sub: () => [
        ...S.ordner.map(o => ({ ico: 'ordner', txt: o.name, haken: b.ordner === o.id, fn: () => bildAktion(b, 'ordner', { ordner: o.id }).then(() => toast(`In „${o.name}“ abgelegt.`, 'ok')) })),
        ...(b.ordner ? [{ ico: 'x', txt: 'Aus Ordner entfernen', fn: () => bildAktion(b, 'ordner', { ordner: null }) }] : []),
        '-',
        { ico: 'ordnerPlus', txt: 'Neuer Ordner …', fn: async () => { const oid = await ordnerNeu(); if (oid) await bildAktion(b, 'ordner', { ordner: oid }); } },
      ] },
      { ico: 'senden', txt: b.veroeffentlicht ? 'Veröffentlichung zurückziehen' : 'Veröffentlichen', tip: 'Für alle Nutzer dieser Installation unter „Veröffentlicht“ sichtbar – nicht im Internet',
        fn: () => bildAktion(b, 'veroeffentlichen', { wert: !b.veroeffentlicht }).then(x => toast(x.veroeffentlicht ? 'Veröffentlicht.' : 'Zurückgezogen.', 'ok')) },
    );
  }
  eintraege.push({ ico: 'download', txt: 'Speichern unter …', klein: 'Ordner selbst wählen', fn: () => speichernUnter(b) },
    { ico: 'ordnerAuf', txt: 'Im Ordner zeigen', klein: 'Datei in der Ablage öffnen', fn: () => imOrdnerZeigen(b) });
  if (eigen) eintraege.push('-', { ico: 'muell', txt: 'In den Papierkorb', gefahr: true, fn: lb(() => bildAktion(b, 'papierkorb').then(() => toast('In den Papierkorb gelegt.'))) });
  menue(anker, eintraege);
}

async function ordnerNeu() {
  const n = await eingabe('Neuer Ordner', 'Name des Ordners', '', 'Anlegen');
  if (!n) return null;
  const d = await api('ordner', { name: n });
  S.ordner = d.ordner; S.ordnerOffen = true; railBauen();
  toast(`Ordner „${n}“ angelegt.`, 'ok');
  return d.id;
}
async function elementErstellen(b, art) {
  const n = await eingabe('Element erstellen', 'Name (z. B. „Lisa“, „Kaffeedose“, „Film-Look“)', '', 'Erstellen');
  if (!n) return;
  S.elemente = (await api('elemente', { name: n, art, bilder: [b.id] })).elemente;
  toast(`Element „${n}“ erstellt. Im Eingabefeld über + verwenden.`, 'ok');
}
async function elementZuweisen(el, b) {
  const drin = el.bilder.some(x => x.id === b.id);
  S.elemente = (await api('element/' + el.id, drin ? { weg: [b.id] } : { hinzu: [b.id] })).elemente;
  toast(drin ? `Aus „${el.name}“ entfernt.` : `„${el.name}“ zugewiesen.`, 'ok');
}

// ------------------------------------------------------------------ Leuchtkasten
function oeffnen(id) {
  const lb = $('#lightbox');
  const i = S.bilder.findIndex(x => x.id === id);
  const b = S.bilder[i];
  if (!b) return;
  const par = b.parameter || {};
  const v = istVideo(b);
  lb.innerHTML = `<div class="lb-bild">
      <button class="lb-nav l" data-lb="zurueck" data-tip="Vorheriges (←)" ${i <= 0 ? 'disabled' : ''}>${ico('links')}</button>
      ${v ? `<video src="/bild/${b.id}" controls autoplay loop playsinline aria-label="${esc(b.prompt.slice(0, 120))}"></video>`
          : b.typ === 'audio' ? `<div class="lb-audio">${ico('ton')}<audio src="/bild/${b.id}" controls autoplay></audio></div>`
          : `<img src="/bild/${b.id}" alt="${esc(b.prompt.slice(0, 120))}">`}
      <button class="lb-nav r" data-lb="weiter" data-tip="Nächstes (→)" ${i >= S.bilder.length - 1 ? 'disabled' : ''}>${ico('rechts')}</button>
    </div>
    <aside class="lb-seite">
      <button class="icon-btn zu" data-lb="zu" data-tip="Schließen (Esc)">${ico('x')}</button>
      <div><h4>Beschreibung</h4><div class="prompt">${esc(b.prompt)}</div></div>
      <dl>
        <dt>Modell</dt><dd>${esc(b.modell_name)}</dd>
        ${par.seitenverhaeltnis ? `<dt>Format</dt><dd>${esc(par.seitenverhaeltnis)}</dd>` : ''}
        ${par.qualitaet ? `<dt>Qualität</dt><dd>${esc(QUAL[par.qualitaet]?.[0] || par.qualitaet)}</dd>` : ''}
        ${par.aufloesung ? `<dt>Auflösung</dt><dd>${esc(par.aufloesung)}</dd>` : ''}
        ${par.hintergrund ? `<dt>Hintergrund</dt><dd>${esc(par.hintergrund)}</dd>` : ''}
        ${v ? `<dt>Länge</dt><dd>${laengeText(b.dauer || par.dauer)}</dd><dt>Ton</dt><dd>${par.ton ? 'ja' : 'nein'}</dd>` : ''}
        ${par.startbild ? `<dt>Startbild</dt><dd>${par.startbild_angepasst ? esc(par.startbild_angepasst.replace(/^Startbild /, '')) : 'ja'}</dd>` : ''}
        ${par.endbild ? `<dt>Endbild</dt><dd>${par.endbild_angepasst ? esc(par.endbild_angepasst.replace(/^Endbild /, '')) : 'ja'}</dd>` : ''}
        ${b.typ === 'audio' ? `<dt>Stimme</dt><dd>${esc(par.stimme || '')}${par.klon ? ' (geklont)' : ''}</dd><dt>Länge</dt><dd>${laengeText(b.dauer)}</dd>` : ''}
        <dt>Datei</dt><dd class="datei" data-tip="${esc(b.datei || '')}">${esc(b.dateiname || '')}</dd>
        ${b.breite ? `<dt>Pixel</dt><dd>${b.breite} × ${b.hoehe}</dd>` : ''}
        <dt>Kosten</dt><dd>${b.kosten ? geld(b.kosten) : '–'}</dd>
        <dt>Erstellt</dt><dd>${zeit(b.erstellt)}</dd>
        ${b.refs?.length ? `<dt>Referenzen</dt><dd>${b.refs.length}</dd>` : ''}
      </dl>
      <div class="lb-knoepfe">
        <button class="btn" data-lb="wieder" data-tip="Ins Eingabefeld übernehmen">${ico('kopie')}Wiederverwenden</button>
        <button class="btn" data-lb="neu" data-tip="Sofort noch einmal erzeugen">${ico('neu')}Neu erzeugen</button>
        <button class="btn" data-lb="dl" data-tip="Speichern unter … (Ordner wählen)">${ico('download')}Speichern</button>
        <button class="btn" data-lb="mehr" data-tip="Alle Aktionen">${ico('mehr')}Mehr</button>
      </div>
    </aside>`;
  lb.classList.remove('hidden');
  lb.dataset.id = id;
  lb.onclick = ev => {
    const x = ev.target.closest('[data-lb]')?.dataset.lb;
    if (!x && ev.target.classList.contains('lb-bild')) return lbZu();
    if (x === 'zu') lbZu();
    if (x === 'zurueck') oeffnen(S.bilder[i - 1].id);
    if (x === 'weiter') oeffnen(S.bilder[i + 1].id);
    if (x === 'wieder') { lbZu(); wiederverwenden(b); }
    if (x === 'neu') { lbZu(); neuErzeugen(b).catch(fehler); }
    if (x === 'dl') speichernUnter(b);
    if (x === 'mehr') mehrMenue(ev.target.closest('[data-lb]'), b, { ausLb: true });
  };
}
function lbZu() { $('#lightbox').classList.add('hidden'); $('#lightbox').innerHTML = ''; }

// ------------------------------------------------------------------ Eingabefeld
const QUAL = {
  auto: ['Automatisch', 'Das Modell entscheidet'], low: ['Niedrig', 'Am schnellsten und günstigsten'], medium: ['Mittel', 'Ausgewogene Bilder'],
  high: ['Hoch', 'Hohe Detailtreue'], xhigh: ['Extra hoch', 'Zusätzliche Details'], max: ['Maximal', 'Höchste Qualität'],
};
const AUFL = { '512': '512 px', '1K': '1024 px', '2K': '2048 px', '4K': '4096 px' };
const aktModell = () => S.modelle.find(m => m.id === S.gen.modell);
const mono = m => (m?.anbieter || '?').split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();

function formIcon(sv) {
  if (!sv || sv === 'auto') return `<i style="width:14px;height:12px;border-style:dashed"></i>`;
  const [w, h] = sv.split(':').map(Number);
  const s = 14 / Math.max(w, h);
  return `<i style="width:${Math.max(5, w * s)}px;height:${Math.max(5, h * s)}px"></i>`;
}
// Formate, die immer wählbar sind; fehlen sie beim Modell, wird danach mittig zugeschnitten.
const ZUSCHNITT = ['4:5'];
const FORM_REIHE = ['auto', '1:1', '4:5', '5:4', '3:4', '4:3', '2:3', '3:2', '9:16', '16:9', '21:9', '9:21'];
function seitenWerte(m) {
  const eigen = m?.parameter.aspect_ratio?.werte || ['auto'];
  const alle = [...new Set([...eigen, ...ZUSCHNITT])];
  const rang = v => { const i = FORM_REIHE.indexOf(v); return i < 0 ? 99 : i; };
  return alle.sort((a, b) => rang(a) - rang(b));
}
const nativ = (m, v) => (m?.parameter.aspect_ratio?.werte || []).includes(v);
// Nächstliegendes echtes Format – dieselbe Rechnung wie naechstes_format() in server.py
function naechstesFormat(m, ziel) {
  const r = f => { const [w, h] = f.split(':').map(Number); return w && h ? w / h : 0; };
  let best = '', abst = Infinity;
  for (const f of m?.parameter.aspect_ratio?.werte || []) {
    const v = r(f);
    if (v && Math.abs(Math.log(v / r(ziel))) < abst) { abst = Math.abs(Math.log(v / r(ziel))); best = f; }
  }
  return { format: best, prozent: best ? Math.round((Math.exp(abst) - 1) * 100) : null };
}
function anpassungText(m, v) {
  const n = naechstesFormat(m, v);
  const von = n.format ? `in ${n.format}` : 'im Standardformat';
  return S.anpassung === 'strecken'
    ? `Das Modell kann ${v} nicht direkt: es erzeugt ${von} und das Bild wird auf ${v} gestreckt${n.prozent != null ? ` (ca. ${n.prozent} % Verzerrung)` : ''}. Rahmen bleiben vollständig.`
    : `Das Modell kann ${v} nicht direkt: es erzeugt ${von}, danach wird mittig auf ${v} zugeschnitten.`;
}
function passend(werte, wunsch, vorzug) {
  if (!werte?.length) return '';
  if (werte.includes(wunsch)) return wunsch;
  return vorzug.find(v => werte.includes(v)) || werte[0];
}

function genAktualisieren() {
  const m = aktModell();
  const g = S.gen;
  const par = m?.parameter || {};
  g.seitenverhaeltnis = passend(seitenWerte(m), g.seitenverhaeltnis, ['auto', '1:1']);
  g.qualitaet = passend(par.quality?.werte, g.qualitaet, ['high', 'medium', 'auto']);
  g.aufloesung = passend(par.resolution?.werte, g.aufloesung, ['2K', '1K']);
  if (g.hintergrund && !par.background?.werte?.includes(g.hintergrund)) g.hintergrund = '';
  $('#chipModellTxt').textContent = m ? m.name : (S.modelle.length ? 'Modell wählen' : 'Lade Modelle …');
  $('#chipModellIco').textContent = mono(m);
  $('#chipModell').dataset.tip = m ? `${m.name} (${m.anbieter})\n${m.beschreibung}\nKlicken, um das Modell zu wechseln` : 'Bildmodell wählen';
  $('#chipSeite').classList.toggle('hidden', !g.seitenverhaeltnis);
  $('#chipSeiteTxt').textContent = g.seitenverhaeltnis === 'auto' ? 'Auto' : g.seitenverhaeltnis;
  $('#chipSeiteIco').innerHTML = formIcon(g.seitenverhaeltnis);
  $('#chipSeite').dataset.tip = m && g.seitenverhaeltnis && g.seitenverhaeltnis !== 'auto' && !nativ(m, g.seitenverhaeltnis)
    ? anpassungText(m, g.seitenverhaeltnis)
    : 'Seitenverhältnis';
  $('#chipQual').classList.toggle('hidden', !g.qualitaet);
  $('#chipQualTxt').textContent = QUAL[g.qualitaet]?.[0] || g.qualitaet;
  $('#chipAufl').classList.toggle('hidden', !g.aufloesung);
  $('#chipAuflTxt').textContent = g.aufloesung;
  $('#anzTxt').textContent = `${g.anzahl}/4`;
  $('#anzMinus').disabled = g.anzahl <= 1;
  $('#anzPlus').disabled = g.anzahl >= 4;
  refsZeichnen();
  speicher.setz('gen', { modell: g.modell, seitenverhaeltnis: g.seitenverhaeltnis, qualitaet: g.qualitaet, aufloesung: g.aufloesung, anzahl: g.anzahl });
  schaetzen();
}

let schaetzTimer;
function schaetzen() {
  clearTimeout(schaetzTimer);
  if (S.modus === 'video') { schaetzTimer = setTimeout(videoSchaetzen, 180); return; }
  if (S.modus === 'audio') { schaetzTimer = setTimeout(audioSchaetzen, 180); return; }
  schaetzTimer = setTimeout(async () => {
    const m = aktModell();
    if (!m) { $('#genPreis').textContent = '–'; return; }
    try {
      const s = await api('schaetzen', { modell: m.id, aufloesung: S.gen.aufloesung, qualitaet: S.gen.qualitaet, anzahl: S.gen.anzahl,
        prompt_len: $('#prompt').value.length, refs: refIds().length });
      S.schaetzung = s;
      const unbekannt = s.quelle === 'unbekannt';
      $('#genPreis').textContent = unbekannt ? 'Preis ?' : '≈ ' + geld(s.gesamt);
      $('#btnGen').dataset.tip = unbekannt
        ? 'Für dieses Modell liegt kein Preis vor.\nStrg+Enter erzeugt.'
        : `Geschätzte Kosten: ${s.anzahl} × ${geld(s.je_bild)} = ${geld(s.gesamt)}\n` +
          `≈ ${zahl(s.tokens)} Ausgabe-Tokens\n` +
          (s.quelle === 'gemessen' ? 'Grundlage: Mittelwert deiner bisherigen Aufträge' : 'Grundlage: OpenRouter-Preisliste (Schätzung)') +
          '\nStrg+Enter erzeugt.';
    } catch { $('#genPreis').textContent = '–'; }
  }, 180);
}

const refIds = () => [...S.gen.refs.map(r => r.id), ...S.gen.elemente.flatMap(e => (S.elemente.find(x => x.id === e.id)?.bilder || []).map(x => x.id))];
function refsZeichnen() {
  if (S.modus === 'video') return videoRefsZeichnen();
  if (S.modus === 'audio') { $('#refs').innerHTML = ''; return; }
  const m = aktModell();
  const max = m?.referenzbilder ? (m.parameter.input_references?.max || 0) : 0;
  const box = $('#refs');
  const warn = (S.gen.refs.length || S.gen.elemente.length) && refIds().length > max;
  box.innerHTML = [
    ...S.gen.refs.map((r, i) => `<div class="ref" data-tip="Referenzbild – wird mitgeschickt"><img src="${esc(r.url)}" alt=""><button class="x" data-ref="${i}" aria-label="Entfernen" data-tip="Entfernen">✕</button></div>`),
    ...S.gen.elemente.map((e, i) => `<div class="ref el" data-tip="Element: alle Bilder dieses Elements gehen als Referenz mit">${ico('at')}${esc(e.name)}<button class="x" data-el="${i}" aria-label="Entfernen">✕</button></div>`),
    S.gen.hintergrund ? `<div class="ref el" data-tip="Hintergrund des Ergebnisses">Hintergrund: ${S.gen.hintergrund === 'transparent' ? 'transparent' : esc(S.gen.hintergrund)}<button class="x" data-hg="1" aria-label="Entfernen">✕</button></div>` : '',
    warn ? `<div class="ref el" style="color:var(--warn)" data-tip="Überzählige Referenzen werden weggelassen">⚠ ${max ? `max. ${max} Referenz(en) bei diesem Modell` : 'Modell nimmt keine Referenzbilder'}</div>` : '',
  ].join('');
  $('#btnPlus').dataset.tip = max ? `Referenzbild oder Element hinzufügen (bis ${max})` : 'Dieses Modell nimmt keine Referenzbilder – Bild wird nur als Vorlage gemerkt';
}
$('#refs').addEventListener('click', ev => {
  const r = ev.target.closest('[data-ref]'), e = ev.target.closest('[data-el]'), h = ev.target.closest('[data-hg]');
  if (r) S.gen.refs.splice(+r.dataset.ref, 1);
  if (e) S.gen.elemente.splice(+e.dataset.el, 1);
  if (h) S.gen.hintergrund = '';
  if (r || e || h) genAktualisieren();
});
function refHinzu(r) {
  if (!S.gen.refs.some(x => x.id === r.id)) S.gen.refs.push(r);
  if (!$('#composer').offsetParent) ansicht('erstellen');
  genAktualisieren();
  toast('Als Referenz hinzugefügt.', 'ok');
}

// Modellwahl
$('#chipModell').onclick = () => modellPop('bild');
function modellPop(art = 'bild') {
  const vid = art === 'video';
  const liste = vid ? S.vmodelle : S.modelle, empfohlen = vid ? S.vempfohlen : S.empfohlen;
  const aktuell = vid ? S.vgen.modell : S.gen.modell, chip = $(vid ? '#vChipModell' : '#chipModell');
  const pop = $('#pop');
  $('#flyout').classList.add('hidden');
  pop.className = 'pop modelle';
  const zeile = m => {
    const alterTage = (Date.now() / 1000 - m.erstellt) / 86400;
    const neu = m.erstellt && alterTage < 60;
    const est = m.schaetzungKurz;
    const premium = est != null && est >= (vid ? 1 : 0.1);
    return `<button class="eintrag ${m.id === aktuell ? 'gewaehlt' : ''}" data-m="${esc(m.id)}" role="option" data-tip="${esc(m.id)}">
      <span class="mono">${esc(mono(m))}</span>
      <span class="txt"><span class="name">${esc(m.name)}${neu ? '<span class="plakette neu">NEU</span>' : ''}${premium ? '<span class="plakette premium">PREMIUM</span>' : ''}</span><small>${esc(m.beschreibung)}</small></span>
      <span class="kosten">${est != null ? '≈ ' + geld(est) + (vid ? ' / 5 s' : '') : ''}</span>
      ${m.id === aktuell ? `<span class="haken" style="color:var(--gold)">${ico('haken')}</span>` : ''}
    </button>`;
  };
  const zeichne = (filter = '') => {
    const f = filter.toLowerCase();
    const passt = m => !f || (m.name + ' ' + m.anbieter + ' ' + m.id + ' ' + m.beschreibung).toLowerCase().includes(f);
    const empf = empfohlen.map(id => liste.find(m => m.id === id)).filter(Boolean).filter(passt);
    const rest = liste.filter(m => !empfohlen.includes(m.id)).filter(passt).sort((a, b) => a.anbieter.localeCompare(b.anbieter) || a.name.localeCompare(b.name));
    $('#mpListe').innerHTML = (empf.length ? `<div class="kopf">${ico('funke')} Empfohlene Modelle</div>` + empf.map(zeile).join('') : '') +
      (rest.length ? `<div class="kopf">Alle Modelle</div>` + rest.map(zeile).join('') : '') +
      (!empf.length && !rest.length ? `<div class="kopf">Kein Modell gefunden.</div>` : '');
  };
  pop.innerHTML = `<div class="suchfeld">${ico('suche')}<input id="mpSuche" placeholder="Suchen …" aria-label="Modelle durchsuchen"></div><div id="mpListe" role="listbox"></div>`;
  zeichne();
  pop.onmouseover = null;
  pop.onclick = ev => {
    const b = ev.target.closest('[data-m]');
    if (!b) return;
    popSchliessen();
    if (vid) { S.vgen.modell = b.dataset.m; videoAktualisieren(); } else { S.gen.modell = b.dataset.m; genAktualisieren(); }
  };
  $('#mpSuche').oninput = ev => zeichne(ev.target.value);
  $('#mpSuche').onkeydown = ev => { if (ev.key === 'Enter') { const b = $('#mpListe [data-m]'); if (b) b.click(); } };
  chip.classList.add('offen');
  platziere(pop, chip, 'oben');
  POP.anker = chip;
  $('#mpSuche').focus();
  // Kurzschätzung je Modell (1 Bild, Standardeinstellung) nachladen
  if (!liste.some(m => 'schaetzungKurz' in m)) {
    Promise.all(liste.map(async m => {
      const p = m.parameter;
      try {
        if (vid) {
          const s = await api('schaetzen_video', { modell: m.id, anzahl: 1, dauer: 5, ton: m.ton === true,
            aufloesung: passend(m.aufloesungen, '720p', ['720p', '1080p']) });
          m.schaetzungKurz = s.quelle === 'unbekannt' ? null : s.je_sekunde * 5;
          return;
        }
        const s = await api('schaetzen', { modell: m.id, anzahl: 1, aufloesung: passend(p.resolution?.werte, '1K', ['1K']), qualitaet: passend(p.quality?.werte, 'high', ['high', 'medium']) });
        m.schaetzungKurz = s.quelle === 'unbekannt' ? null : s.je_bild;
      } catch { m.schaetzungKurz = null; }
    })).then(() => { if (POP.anker === chip) zeichne($('#mpSuche')?.value || ''); });
  }
}

$('#chipSeite').onclick = () => {
  const m = aktModell();
  const werte = seitenWerte(m);
  $('#chipSeite').classList.add('offen');
  menue($('#chipSeite'), [{ kopf: 'Seitenverhältnis' }, ...werte.map(v => ({
    txt: v === 'auto' ? 'Auto' : v, haken: v === S.gen.seitenverhaeltnis,
    klein: v !== 'auto' && !nativ(m, v) ? (S.anpassung === 'strecken' ? 'gestreckt' : 'per Zuschnitt') : '',
    tip: v !== 'auto' && !nativ(m, v) ? anpassungText(m, v) : '',
    fn: () => { S.gen.seitenverhaeltnis = v; genAktualisieren(); },
  }))], { seite: 'oben', cls: 'seiten' });
  // Formsymbole vor die Einträge setzen
  $$('#pop .eintrag').forEach((b, i) => b.insertAdjacentHTML('afterbegin', `<span class="ico form">${formIcon(werte[i])}</span>`));
};
$('#chipQual').onclick = () => {
  const werte = aktModell()?.parameter.quality?.werte || [];
  $('#chipQual').classList.add('offen');
  menue($('#chipQual'), [{ kopf: 'Qualität wählen' }, ...werte.map(v => ({
    txt: QUAL[v]?.[0] || v, klein: QUAL[v]?.[1] || '', haken: v === S.gen.qualitaet, fn: () => { S.gen.qualitaet = v; genAktualisieren(); },
  }))], { seite: 'oben' });
};
$('#chipAufl').onclick = () => {
  const werte = aktModell()?.parameter.resolution?.werte || [];
  $('#chipAufl').classList.add('offen');
  menue($('#chipAufl'), [{ kopf: 'Auflösung wählen' }, ...werte.map(v => ({
    txt: v, klein: AUFL[v] || '', haken: v === S.gen.aufloesung, fn: () => { S.gen.aufloesung = v; genAktualisieren(); },
  }))], { seite: 'oben' });
};
$('#anzMinus').onclick = () => { S.gen.anzahl = Math.max(1, S.gen.anzahl - 1); genAktualisieren(); };
$('#anzPlus').onclick = () => { S.gen.anzahl = Math.min(4, S.gen.anzahl + 1); genAktualisieren(); };

// „+“: Referenzen
$('#btnPlus').onclick = () => {
  if (S.modus === 'video') return videoPlusMenue();
  menue($('#btnPlus'), [
    { ico: 'hochladen', txt: 'Bild hochladen …', klein: 'PNG, JPEG, WebP – auch per Ziehen oder Einfügen', fn: () => $('#fileIn').click() },
    { ico: 'bilder', txt: 'Aus der Bibliothek wählen …', fn: bibliothekWaehlen },
    '-',
    { kopf: 'Elemente' },
    ...(S.elemente.length ? S.elemente.map(el => ({ ico: 'at', txt: el.name, klein: `${el.bilder.length} Bild(er) · ${el.art}`, haken: S.gen.elemente.some(e => e.id === el.id),
      fn: () => { const i = S.gen.elemente.findIndex(e => e.id === el.id); if (i >= 0) S.gen.elemente.splice(i, 1); else S.gen.elemente.push({ id: el.id, name: el.name }); genAktualisieren(); } }))
      : [{ txt: 'Noch keine Elemente', klein: 'Über „…“ an einem Bild → Element erstellen', aus: true }]),
  ], { seite: 'oben' });
};
$('#fileIn').onchange = async ev => {
  const ziel = S.modus === 'video' ? (S.uploadZiel || 'start') : 'refs';
  S.uploadZiel = null;
  await dateienHochladen([...ev.target.files], ziel);
  ev.target.value = '';
};
async function dateienHochladen(files, ziel = S.modus === 'video' ? 'start' : 'refs') {
  if (ziel !== 'refs') files = files.slice(0, 1);
  for (const f of files.filter(f => f.type.startsWith('image/'))) {
    if (f.size > 12 * 1024 * 1024) { toast(`${f.name}: größer als 12 MB.`, 'fehler'); continue; }
    try {
      const daten = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(f); });
      const d = await api('upload', { daten, name: f.name });
      if (ziel === 'refs') S.gen.refs.push({ id: d.id, url: d.url });
      else S.vgen[ziel] = { id: d.id, url: d.url };
    } catch (e) { fehler(e); }
  }
  if (ziel === 'refs') genAktualisieren(); else videoAktualisieren();
}
(() => {
  const c = $('#composer');
  c.addEventListener('dragover', ev => { if ([...ev.dataTransfer.types].includes('Files')) { ev.preventDefault(); c.classList.add('drop'); } });
  c.addEventListener('dragleave', () => c.classList.remove('drop'));
  c.addEventListener('drop', ev => { ev.preventDefault(); c.classList.remove('drop'); dateienHochladen([...ev.dataTransfer.files]); });
  $('#prompt').addEventListener('paste', ev => {
    const files = [...(ev.clipboardData?.files || [])].filter(f => f.type.startsWith('image/'));
    if (files.length) { ev.preventDefault(); dateienHochladen(files); }
  });
})();
async function bibliothekWaehlen(ziel = 'refs') {
  let alle = [];
  try { alle = (await api('bilder?ansicht=alle&typ=bild')).bilder; } catch (e) { return fehler(e); }
  if (!alle.length) return toast('Die Bibliothek enthält noch keine Bilder.');
  const einzeln = ziel !== 'refs';
  const gewaehlt = new Set();
  const erg = await modal(`<h3>${einzeln ? (ziel === 'start' ? 'Startbild wählen' : 'Endbild wählen') : 'Referenzbilder wählen'}</h3>
    <p class="unter">${einzeln ? 'Ein Bild anklicken – das Video beginnt bzw. endet mit diesem Bild.' : 'Anklicken zum Auswählen. Die Bilder werden beim Erzeugen mitgeschickt.'}</p>
    <div class="waehlraster" id="wr">${alle.slice(0, 300).map(b => `<button data-id="${b.id}" data-tip="${esc(b.prompt.slice(0, 140))}"><img src="/bild/${b.id}" loading="lazy" alt=""></button>`).join('')}</div>
    <div class="knoepfe"><button class="btn" data-zu="null">Abbrechen</button><button class="btn primaer" data-zu="ok">Übernehmen</button></div>`,
  { breit: true, beimOeffnen: c => { c.querySelector('#wr').onclick = ev => { const b = ev.target.closest('[data-id]'); if (!b) return; const id = b.dataset.id; if (einzeln) { gewaehlt.clear(); $$('#wr .an', c).forEach(x => x.classList.remove('an')); } if (gewaehlt.has(id)) gewaehlt.delete(id); else gewaehlt.add(id); b.classList.toggle('an', gewaehlt.has(id)); }; } });
  if (erg !== 'ok') return;
  if (einzeln) { const id = [...gewaehlt][0]; if (id) { S.vgen[ziel] = { id, url: '/bild/' + id }; videoAktualisieren(); } return; }
  for (const id of gewaehlt) if (!S.gen.refs.some(r => r.id === id)) S.gen.refs.push({ id, url: '/bild/' + id });
  genAktualisieren();
}

// Beschreibung
const pr = $('#prompt');
function promptHoehe() { pr.style.height = 'auto'; pr.style.height = Math.min(pr.scrollHeight, 180) + 'px'; pr.style.overflowY = pr.scrollHeight > 180 ? 'auto' : 'hidden'; }
pr.addEventListener('input', () => { promptHoehe(); speicher.setz('prompt', pr.value); schaetzen(); });
pr.addEventListener('keydown', ev => { if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) { ev.preventDefault(); erzeugen(); } });
pr.value = speicher.lies('prompt', '');
promptHoehe();

// Erzeugen
$('#btnGen').onclick = () => erzeugen();
async function erzeugen(ueber = null) {
  if (ueber ? ueber.art === 'video' : S.modus === 'video') return videoErzeugen(ueber);
  if (!ueber && S.modus === 'audio') return audioErzeugen();
  const g = { ...S.gen, ...(ueber || {}) };
  const prompt = (ueber?.prompt ?? pr.value).trim();
  if (!prompt) { pr.focus(); return toast('Bitte beschreibe zuerst, was du sehen möchtest.'); }
  if (!g.modell) return toast('Bitte zuerst ein Modell wählen.');
  const btn = $('#btnGen');
  btn.disabled = true;
  try {
    const d = await api('erzeugen', {
      prompt, modell: g.modell, seitenverhaeltnis: g.seitenverhaeltnis, qualitaet: g.qualitaet, aufloesung: g.aufloesung,
      anzahl: g.anzahl, hintergrund: g.hintergrund, refs: ueber?.refs ?? g.refs.map(r => r.id), elemente: ueber?.elemente ?? g.elemente.map(e => e.id),
    });
    if (d.auftrag.hinweis) toast(d.auftrag.hinweis);
    S.auftraege.push(d.auftrag);
    if (!['erstellen', 'bibliothek'].includes(S.ansicht)) await ansicht('erstellen');
    else { wandZeichnen(); $('#wand').scrollTop = 0; }
    abfragen();
  } catch (e) {
    fehler(e);
    if (/Schlüssel/.test(e.message)) einstellungenDialog();
  } finally { setTimeout(() => { btn.disabled = false; }, 600); }
}

// Aufträge abfragen
let abfrageTimer = null;
async function auftraegeLaden() {
  try { S.auftraege = (await api('auftraege')).auftraege; } catch { /* still */ }
  if (typeof audioKnopf === 'function') audioKnopf();
  if (S.auftraege.some(j => j.status === 'laufend')) abfragen();
}
function abfragen() {
  if (abfrageTimer) return;
  abfrageTimer = setInterval(async () => {
    const vorher = new Map(S.auftraege.map(j => [j.id, j.status]));
    let neu;
    try { neu = (await api('auftraege')).auftraege; } catch { return; }
    const lokal = S.auftraege.filter(j => !neu.some(n => n.id === j.id) && j.status === 'laufend');
    S.auftraege = [...neu, ...lokal];
    if (typeof audioKnopf === 'function') audioKnopf();
    let fertig = false;
    for (const j of neu) {
      const alt = vorher.get(j.id);
      if (alt === 'laufend' && j.status !== 'laufend') {
        fertig = true;
        if (j.status === 'fertig') toast(`${j.bilder.length} ${j.art === 'video' ? 'Video(s)' : j.art === 'audio' ? 'Audio(s)' : 'Bild(er)'} fertig · ${geld(j.kosten)}`, 'ok');
        else toast(`Auftrag ${j.status === 'teilweise' ? 'teilweise ' : ''}fehlgeschlagen: ${j.fehler[0] || ''}`, 'fehler');
      }
    }
    const zahlVorher = S.bilder.length;
    if (fertig || neu.some(j => j.status === 'laufend' && j.bilder.length)) {
      if (bildAnsicht(S.ansicht)) await bilderLaden();
    } else if (bildAnsicht(S.ansicht)) wandZeichnen();
    if (fertig) { kontoLaden(); schaetzen(); }
    if (!S.auftraege.some(j => j.status === 'laufend')) { clearInterval(abfrageTimer); abfrageTimer = null; }
    void zahlVorher;
  }, 2000);
}

function wiederverwenden(b) {
  if (istVideo(b)) return videoWiederverwenden(b);
  if (b.typ === 'audio') return audioWiederverwenden(b);
  if (S.modus !== 'bild') modusSetzen('bild');
  S.gen.modell = S.modelle.some(m => m.id === b.modell) ? b.modell : S.gen.modell;
  Object.assign(S.gen, { seitenverhaeltnis: b.parameter?.seitenverhaeltnis || S.gen.seitenverhaeltnis, qualitaet: b.parameter?.qualitaet || S.gen.qualitaet,
    aufloesung: b.parameter?.aufloesung || S.gen.aufloesung, hintergrund: b.parameter?.hintergrund || '' });
  S.gen.refs = (b.refs || []).map(id => ({ id, url: '/bild/' + id }));
  S.gen.elemente = [];
  pr.value = b.prompt; promptHoehe(); speicher.setz('prompt', pr.value);
  if (!$('#composer').offsetParent) ansicht('erstellen');
  genAktualisieren();
  pr.focus();
  toast('Beschreibung und Einstellungen übernommen.', 'ok');
}
async function neuErzeugen(b) {
  if (istVideo(b)) return videoNeuErzeugen(b);
  if (b.typ === 'audio') return audioNeuErzeugen(b);
  if (!S.modelle.some(m => m.id === b.modell)) throw new Error('Das Modell dieses Bildes ist nicht mehr verfügbar.');
  await erzeugen({ modell: b.modell, prompt: b.prompt, seitenverhaeltnis: b.parameter?.seitenverhaeltnis || '', qualitaet: b.parameter?.qualitaet || '',
    aufloesung: b.parameter?.aufloesung || '', hintergrund: b.parameter?.hintergrund || '', anzahl: 1, refs: b.refs || [], elemente: [] });
}
function modellMit(bedingung, vorzug) {
  for (const id of vorzug) { const m = S.modelle.find(x => x.id === id); if (m && bedingung(m)) return m; }
  return S.modelle.find(bedingung);
}
function vorbereiten(b, art) {
  const refsOk = m => m.referenzbilder && (m.parameter.input_references?.max || 0) > 0;
  let m, text, extra = {};
  if (art === 'variation') {
    m = modellMit(refsOk, [b.modell, S.gen.modell, S.standard]);
    text = `Erzeuge eine Variation dieses Bildes. Motiv, Stil und Stimmung bleiben erhalten, Details, Pose und Bildausschnitt dürfen sich ändern.\n\nUrsprüngliche Beschreibung: ${b.prompt}`;
    extra.anzahl = 4;
  } else if (art === 'hoch') {
    m = modellMit(x => refsOk(x) && x.parameter.resolution?.werte?.includes('4K'), [b.modell, 'google/gemini-3-pro-image', 'bytedance-seed/seedream-4.5']);
    text = 'Gib dieses Bild in höherer Auflösung wieder. Inhalt, Komposition, Farben und alle Details exakt beibehalten – nur schärfer und detailreicher.';
    extra = { aufloesung: '4K', anzahl: 1 };
  } else {
    m = modellMit(x => refsOk(x) && x.parameter.background?.werte?.includes('transparent'), ['openai/gpt-image-2.5-flare', 'openai/gpt-image-1', b.modell]);
    text = 'Entferne den Hintergrund vollständig (transparent). Das Hauptmotiv bleibt exakt unverändert.';
    extra = { hintergrund: 'transparent', anzahl: 1 };
  }
  if (!m) return toast('Kein passendes Modell im Katalog gefunden.', 'fehler');
  S.gen.modell = m.id;
  Object.assign(S.gen, extra);
  S.gen.refs = [{ id: b.id, url: '/bild/' + b.id }];
  S.gen.elemente = [];
  pr.value = text; promptHoehe();
  if (!$('#composer').offsetParent) ansicht('erstellen');
  genAktualisieren();
  pr.focus();
  toast(`Vorbereitet mit ${m.name}. Prüfe Kosten und klicke „Erzeugen“.`);
}

// ------------------------------------------------------------------ Video-Eingabe
const aktVModell = () => S.vmodelle.find(m => m.id === S.vgen.modell);
function modusSetzen(modus) {
  S.modus = ['video', 'audio'].includes(modus) ? modus : 'bild';
  speicher.setz('modus', S.modus);
  const vid = S.modus === 'video', aud = S.modus === 'audio';
  $$('#modus button').forEach(b => b.classList.toggle('an', b.dataset.modus === S.modus));
  $('#chips').classList.toggle('hidden', vid || aud);
  $('#vchips').classList.toggle('hidden', !vid);
  $('#achips').classList.toggle('hidden', !aud);
  $('#btnPlus').classList.toggle('hidden', aud);
  pr.placeholder = aud ? 'Text, der gesprochen werden soll …' : vid ? 'Beschreibe das Video: Szene, Bewegung, Kamera, Ton' : 'Beschreibe die Szene, die du dir vorstellst';
  if (aud) { $('#refs').innerHTML = ''; audioAktualisieren(); } else if (vid) videoAktualisieren(); else genAktualisieren();
  if (typeof audioKnopf === 'function') audioKnopf();
}
$('#modus').addEventListener('click', ev => { const b = ev.target.closest('[data-modus]'); if (b) modusSetzen(b.dataset.modus); });

function videoAktualisieren() {
  const m = aktVModell(), g = S.vgen;
  if (m) {
    g.seitenverhaeltnis = passend(m.formate, g.seitenverhaeltnis, ['16:9', '9:16']);
    g.aufloesung = passend(m.aufloesungen, g.aufloesung, ['720p', '1080p']);
    if (m.dauern.length && !m.dauern.includes(g.dauer)) {
      g.dauer = m.dauern.reduce((a, d) => (Math.abs(d - g.dauer) < Math.abs(a - g.dauer) ? d : a), m.dauern[0]);
    }
    if (g.start && !m.frames.includes('first_frame')) { g.start = null; toast(`${m.name} nimmt kein Startbild – entfernt.`); }
    if (g.ende && !m.frames.includes('last_frame')) { g.ende = null; toast(`${m.name} nimmt kein Endbild – entfernt.`); }
  }
  $('#vChipModellTxt').textContent = m ? m.name : (S.vmodelle.length ? 'Modell wählen' : 'Lade Videomodelle …');
  $('#vChipModellIco').textContent = mono(m);
  $('#vChipModell').dataset.tip = m ? `${m.name} (${m.anbieter})\n${m.beschreibung}\nKlicken, um das Modell zu wechseln` : 'Videomodell wählen';
  $('#vChipSeite').classList.toggle('hidden', !g.seitenverhaeltnis);
  $('#vChipSeiteTxt').textContent = g.seitenverhaeltnis;
  $('#vChipSeiteIco').innerHTML = formIcon(g.seitenverhaeltnis);
  $('#vChipAufl').classList.toggle('hidden', !g.aufloesung);
  $('#vChipAuflTxt').textContent = g.aufloesung;
  $('#vChipDauer').classList.toggle('hidden', !m?.dauern.length);
  $('#vChipDauerTxt').textContent = `${g.dauer} s`;
  const tonMoeglich = m?.ton === true;
  $('#vChipTon').classList.toggle('hidden', !tonMoeglich);
  $('#vChipTon').classList.toggle('aktiv', tonMoeglich && g.ton);
  $('#vChipTonIco').innerHTML = ico(g.ton ? 'ton' : 'tonAus');
  $('#vChipTonTxt').textContent = g.ton ? 'Ton an' : 'Ton aus';
  $('#vAnzTxt').textContent = `${g.anzahl}/4`;
  $('#vAnzMinus').disabled = g.anzahl <= 1;
  $('#vAnzPlus').disabled = g.anzahl >= 4;
  videoRefsZeichnen();
  speicher.setz('vgen', { modell: g.modell, seitenverhaeltnis: g.seitenverhaeltnis, aufloesung: g.aufloesung, dauer: g.dauer, ton: g.ton, anzahl: g.anzahl });
  schaetzen();
}

async function videoSchaetzen() {
  const m = aktVModell(), g = S.vgen;
  if (!m) { $('#genPreis').textContent = '–'; return; }
  try {
    const s = await api('schaetzen_video', { modell: m.id, aufloesung: g.aufloesung, dauer: g.dauer, ton: m.ton === true && g.ton,
      mit_bild: !!g.start, anzahl: g.anzahl });
    if (S.modus !== 'video') return;
    S.vschaetzung = s;
    const unbekannt = s.quelle === 'unbekannt';
    $('#genPreis').textContent = unbekannt ? 'Preis ?' : '≈ ' + geld(s.gesamt);
    const grundlage = { gemessen: 'Grundlage: Mittelwert deiner bisherigen Videos', schaetzung: 'Grundlage: Token-Preis (Schätzung)',
      preisliste: 'Grundlage: OpenRouter-Preisliste' }[s.quelle];
    $('#btnGen').dataset.tip = unbekannt
      ? 'Für dieses Modell liegt kein Preis vor.\nStrg+Enter erzeugt.'
      : `Geschätzte Kosten: ${s.anzahl} × ${geld(s.je_video)} = ${geld(s.gesamt)}\n${s.dauer} s × ${geld(s.je_sekunde, 3)} je Sekunde` +
        (s.tokens_je_sekunde ? `\n≈ ${zahl(s.tokens_je_sekunde * s.dauer)} Video-Tokens je Video` : '') +
        `\n${grundlage}\nVideos dauern meist 1–5 Minuten. Strg+Enter erzeugt.`;
  } catch { $('#genPreis').textContent = '–'; }
}

function videoRefsZeichnen() {
  const m = aktVModell(), g = S.vgen;
  const karte = (ziel, wort) => g[ziel]
    ? `<div class="ref" data-tip="${wort} – das Video ${ziel === 'start' ? 'beginnt' : 'endet'} mit diesem Bild"><img src="${esc(g[ziel].url)}" alt="">
         <span class="rolle">${wort}</span><button class="x" data-vref="${ziel}" aria-label="${wort} entfernen">✕</button></div>` : '';
  $('#refs').innerHTML = karte('start', 'Startbild') + karte('ende', 'Endbild');
  const f = m?.frames || [];
  $('#btnPlus').dataset.tip = f.length ? `Startbild${f.includes('last_frame') ? ' oder Endbild' : ''} hinzufügen` : 'Dieses Modell arbeitet nur mit Text';
}
$('#refs').addEventListener('click', ev => {
  const x = ev.target.closest('[data-vref]');
  if (x) { S.vgen[x.dataset.vref] = null; videoAktualisieren(); }
});
function videoPlusMenue() {
  const f = aktVModell()?.frames || [];
  const block = (ziel, wort, art) => f.includes(art) ? [
    { kopf: wort },
    { ico: 'hochladen', txt: `${wort} hochladen …`, klein: 'PNG, JPEG, WebP – auch per Ziehen', fn: () => { S.uploadZiel = ziel; $('#fileIn').click(); } },
    { ico: 'bilder', txt: `${wort} aus der Bibliothek …`, fn: () => bibliothekWaehlen(ziel) },
  ] : [];
  const e = [...block('start', 'Startbild', 'first_frame'), ...block('ende', 'Endbild', 'last_frame')];
  menue($('#btnPlus'), e.length ? e : [{ txt: 'Dieses Modell nimmt keine Bilder', klein: 'Für Start-/Endbild z. B. Veo, Kling oder Seedance wählen', aus: true }], { seite: 'oben' });
}

$('#vChipModell').onclick = () => modellPop('video');
function vChipMenue(chip, kopf, werte, feld, beschriftung = v => ({ txt: v })) {
  chip.classList.add('offen');
  menue(chip, [{ kopf }, ...werte.map(v => ({ ...beschriftung(v), haken: v === S.vgen[feld],
    fn: () => { S.vgen[feld] = v; videoAktualisieren(); } }))], { seite: 'oben', cls: 'seiten' });
}
$('#vChipSeite').onclick = () => {
  const werte = aktVModell()?.formate || [];
  vChipMenue($('#vChipSeite'), 'Seitenverhältnis', werte, 'seitenverhaeltnis');
  $$('#pop .eintrag').forEach((b, i) => b.insertAdjacentHTML('afterbegin', `<span class="ico form">${formIcon(werte[i])}</span>`));
};
$('#vChipAufl').onclick = () => vChipMenue($('#vChipAufl'), 'Auflösung wählen', aktVModell()?.aufloesungen || [], 'aufloesung');
$('#vChipDauer').onclick = () => {
  const je = S.vschaetzung?.quelle !== 'unbekannt' ? S.vschaetzung?.je_sekunde : null;
  vChipMenue($('#vChipDauer'), 'Länge wählen', aktVModell()?.dauern || [], 'dauer',
    d => ({ txt: `${d} Sekunden`, klein: je ? `≈ ${geld(je * d)} je Video` : '' }));
};
$('#vChipTon').onclick = () => { S.vgen.ton = !S.vgen.ton; videoAktualisieren(); };
$('#vAnzMinus').onclick = () => { S.vgen.anzahl = Math.max(1, S.vgen.anzahl - 1); videoAktualisieren(); };
$('#vAnzPlus').onclick = () => { S.vgen.anzahl = Math.min(4, S.vgen.anzahl + 1); videoAktualisieren(); };

async function videoErzeugen(ueber = null) {
  const g = { ...S.vgen, ...(ueber || {}) };
  const prompt = (ueber?.prompt ?? pr.value).trim();
  if (!prompt) { pr.focus(); return toast('Bitte beschreibe zuerst das Video.'); }
  if (!g.modell) return toast('Bitte zuerst ein Videomodell wählen.');
  const m = S.vmodelle.find(x => x.id === g.modell);
  const kosten = ueber ? null : S.vschaetzung;
  if (kosten && kosten.quelle !== 'unbekannt' && kosten.gesamt >= 2 &&
      !await bestaetigen('Teurer Video-Auftrag', `Dieser Auftrag kostet voraussichtlich ${geld(kosten.gesamt)} (${kosten.anzahl} × ${kosten.dauer} s). Trotzdem starten?`, 'Starten')) return;
  const btn = $('#btnGen');
  btn.disabled = true;
  try {
    const d = await api('erzeugen_video', {
      prompt, modell: g.modell, seitenverhaeltnis: g.seitenverhaeltnis, aufloesung: g.aufloesung, dauer: g.dauer, ton: !!g.ton,
      anzahl: g.anzahl, startbild: ueber ? (ueber.startbild || '') : (g.start?.id || ''), endbild: ueber ? (ueber.endbild || '') : (g.ende?.id || ''),
    });
    S.auftraege.push(d.auftrag);
    const angepasst = ['startbild_angepasst', 'endbild_angepasst'].map(k => d.auftrag.parameter?.[k]).filter(Boolean);
    if (d.auftrag.hinweis) angepasst.push(d.auftrag.hinweis);
    toast(`Video-Auftrag gestartet (${m?.name || g.modell}). ${angepasst.length ? angepasst.join('. ') + '. ' : ''}Das dauert meist 1–5 Minuten – du kannst weiterarbeiten.`);
    if (!['erstellen', 'bibliothek'].includes(S.ansicht)) await ansicht('erstellen');
    else { wandZeichnen(); $('#wand').scrollTop = 0; }
    abfragen();
  } catch (e) {
    fehler(e);
    if (/Schlüssel/.test(e.message)) einstellungenDialog();
  } finally { setTimeout(() => { btn.disabled = false; }, 600); }
}

const mediumUrl = id => (S.bilder.some(b => b.id === id) ? '/bild/' : '/upload/') + id;
function videoModellMit(bedingung, vorzug) {
  for (const id of vorzug) { const m = S.vmodelle.find(x => x.id === id); if (m && bedingung(m)) return m; }
  return S.vmodelle.find(bedingung);
}
function videoWiederverwenden(b) {
  const p = b.parameter || {};
  modusSetzen('video');
  if (S.vmodelle.some(m => m.id === b.modell)) S.vgen.modell = b.modell;
  Object.assign(S.vgen, { seitenverhaeltnis: p.seitenverhaeltnis || S.vgen.seitenverhaeltnis, aufloesung: p.aufloesung || S.vgen.aufloesung,
    dauer: p.dauer || S.vgen.dauer, ton: p.ton ?? S.vgen.ton,
    start: p.startbild ? { id: p.startbild, url: mediumUrl(p.startbild) } : null, ende: p.endbild ? { id: p.endbild, url: mediumUrl(p.endbild) } : null });
  pr.value = b.prompt; promptHoehe(); speicher.setz('prompt', pr.value);
  if (!$('#composer').offsetParent) ansicht('erstellen');
  videoAktualisieren();
  pr.focus();
  toast('Beschreibung und Video-Einstellungen übernommen.', 'ok');
}
async function videoNeuErzeugen(b) {
  if (!S.vmodelle.some(m => m.id === b.modell)) throw new Error('Das Modell dieses Videos ist nicht mehr verfügbar.');
  const p = b.parameter || {};
  await erzeugen({ art: 'video', modell: b.modell, prompt: b.prompt, seitenverhaeltnis: p.seitenverhaeltnis || '', aufloesung: p.aufloesung || '',
    dauer: p.dauer || 0, ton: !!p.ton, anzahl: 1, startbild: p.startbild || '', endbild: p.endbild || '' });
}
function mitStartbild(id, url, prompt, hinweis) {
  modusSetzen('video');
  const m = videoModellMit(x => x.frames.includes('first_frame'), [S.vgen.modell, S.vstandard]);
  if (!m) return toast('Kein Videomodell mit Startbild im Katalog.', 'fehler');
  S.vgen.modell = m.id;
  S.vgen.start = { id, url };
  S.vgen.ende = null;
  pr.value = prompt; promptHoehe(); speicher.setz('prompt', pr.value);
  if (!$('#composer').offsetParent) ansicht('erstellen');
  videoAktualisieren();
  pr.focus();
  toast(hinweis);
}
function animieren(b) {
  mitStartbild(b.id, '/bild/' + b.id, `Langsame, natürliche Bewegung, sanfte Kamerafahrt. ${b.prompt}`,
    'Startbild gesetzt. Beschreibe die Bewegung, prüfe die Kosten und klicke „Erzeugen“.');
}
async function videoFortsetzen(b) {
  toast('Letztes Bild des Videos wird gelesen …');
  const v = document.createElement('video');
  v.muted = true; v.preload = 'auto'; v.src = '/bild/' + b.id;
  await new Promise((res, rej) => { v.onloadedmetadata = res; v.onerror = () => rej(new Error('Das Video ist nicht lesbar.')); });
  v.currentTime = Math.max(0, v.duration - 0.05);
  await new Promise((res, rej) => { v.onseeked = res; v.onerror = () => rej(new Error('Das Video ist nicht lesbar.')); });
  const c = document.createElement('canvas');
  c.width = v.videoWidth; c.height = v.videoHeight;
  c.getContext('2d').drawImage(v, 0, 0);
  const gross = c.width * c.height > 2.2e6;     // über 1080p als JPEG, damit das Upload-Limit reicht
  const d = await api('upload', { daten: c.toDataURL(gross ? 'image/jpeg' : 'image/png', 0.92), name: 'letztes-bild' });
  mitStartbild(d.id, d.url, b.prompt, 'Letztes Bild als Startbild gesetzt – beschreibe, wie es weitergeht.');
}

// ------------------------------------------------------------------ Elemente-Ansicht
function elementeZeigen() {
  const w = $('#wand');
  $('#viewCount').textContent = S.elemente.length ? `${S.elemente.length} Element(e)` : '';
  if (!S.elemente.length) {
    w.innerHTML = `<div class="leer"><div class="gross">${ico('element')}</div><h3>Noch keine Elemente</h3>
      <p>Elemente sind wiederverwendbare Referenzen – eine Figur, ein Produkt, ein Stil. Öffne an einem Bild „…“ → „Element erstellen“. Danach wählst du es im Eingabefeld über + aus.</p></div>`;
    return;
  }
  const ART = { figur: 'Figur', produkt: 'Produkt', stil: 'Stil', ort: 'Ort', sonstiges: 'Sonstiges' };
  w.innerHTML = `<div class="elemente">${S.elemente.map(el => `<div class="element" data-el="${el.id}">
      <div class="vorschau">${el.bilder.slice(0, 4).map(x => `<img src="${esc(x.url)}" alt="" loading="lazy">`).join('')}${'<span></span>'.repeat(Math.max(0, 4 - el.bilder.length))}</div>
      <h4>${esc(el.name)}</h4><small>${ART[el.art] || el.art} · ${el.bilder.length} Bild(er)</small>
      <div class="knoepfe">
        <button class="btn klein primaer" data-ea="nutzen" data-tip="Dieses Element beim nächsten Bild mitschicken">Verwenden</button>
        <button class="btn klein" data-ea="name" data-tip="Umbenennen">Umbenennen</button>
        <button class="btn klein" data-ea="bilder" data-tip="Bilder des Elements verwalten">Bilder</button>
        <button class="btn klein gefahr" data-ea="weg" data-tip="Element löschen (Bilder bleiben erhalten)">Löschen</button>
      </div></div>`).join('')}</div>`;
}
$('#wand').addEventListener('click', async ev => {
  const b = ev.target.closest('[data-ea]');
  if (!b) return;
  const el = S.elemente.find(x => x.id === b.closest('[data-el]').dataset.el);
  try {
    if (b.dataset.ea === 'nutzen') {
      if (!S.gen.elemente.some(e => e.id === el.id)) S.gen.elemente.push({ id: el.id, name: el.name });
      await ansicht('erstellen'); genAktualisieren(); pr.focus();
    } else if (b.dataset.ea === 'name') {
      const n = await eingabe('Element umbenennen', 'Name', el.name);
      if (n) { S.elemente = (await api('element/' + el.id, { name: n })).elemente; elementeZeigen(); }
    } else if (b.dataset.ea === 'weg') {
      if (!await bestaetigen('Element löschen?', `„${el.name}“ wird entfernt. Die Bilder bleiben in der Bibliothek.`, 'Löschen', true)) return;
      S.elemente = (await api('element/' + el.id, { loeschen: true })).elemente; elementeZeigen();
    } else if (b.dataset.ea === 'bilder') {
      const weg = new Set();
      const erg = await modal(`<h3>Bilder von „${esc(el.name)}“</h3><p class="unter">Anklicken markiert ein Bild zum Entfernen. Neue Bilder fügst du über „…“ → „Element zuweisen“ hinzu.</p>
        <div class="waehlraster" id="wr">${el.bilder.map(x => `<button data-id="${x.id}"><img src="${esc(x.url)}" alt=""></button>`).join('') || '<p class="unter">Keine Bilder.</p>'}</div>
        <div class="knoepfe"><button class="btn" data-zu="null">Abbrechen</button><button class="btn primaer" data-zu="ok">Speichern</button></div>`,
      { breit: true, beimOeffnen: c => { c.querySelector('#wr').onclick = e2 => { const x = e2.target.closest('[data-id]'); if (!x) return; if (weg.has(x.dataset.id)) weg.delete(x.dataset.id); else weg.add(x.dataset.id); x.classList.toggle('an'); }; } });
      if (erg === 'ok' && weg.size) { S.elemente = (await api('element/' + el.id, { weg: [...weg] })).elemente; elementeZeigen(); }
    }
  } catch (e) { fehler(e); }
});

// ------------------------------------------------------------------ Verbrauch
async function verbrauchZeigen() {
  const w = $('#wand');
  let v;
  try { v = await api('verbrauch'); } catch (e) { return fehler(e); }
  const max = Math.max(...v.tage.map(t => t.kosten), 0.0001);
  const heute = new Date().toISOString().slice(0, 10);
  const heuteK = v.tage.find(t => t.tag === heute)?.kosten || 0;
  const name = id => S.modelle.find(m => m.id === id)?.name || id;
  w.innerHTML = `<div class="kacheln">
      <div class="kachel"><small>Kosten gesamt</small><b>${geld(v.summe, 2)}</b></div>
      <div class="kachel"><small>Heute</small><b>${geld(heuteK, 2)}</b></div>
      <div class="kachel"><small>Bilder erzeugt</small><b>${zahl(v.bilder)}</b></div>
      <div class="kachel"><small>Ø je Bild</small><b>${v.bilder ? geld(v.summe / v.bilder) : '–'}</b></div>
    </div>
    <div class="tag-kopf">Kosten je Tag (letzte 60 Tage mit Aufträgen)</div>
    ${v.tage.length ? `<div class="balken">${v.tage.map(t => `<div style="height:${Math.max(2, t.kosten / max * 100)}%" data-tip="${new Date(t.tag).toLocaleDateString('de-DE')}: ${geld(t.kosten)} · ${t.bilder} Bild(er)"></div>`).join('')}</div>` : '<p class="unter">Noch keine Aufträge.</p>'}
    <div class="tag-kopf">Nach Modell</div>
    <div class="rahmen"><table class="tabelle"><thead><tr><th>Modell</th><th class="zahl">Bilder</th><th class="zahl">Kosten</th><th class="zahl">Ø je Bild</th></tr></thead><tbody>
      ${v.modelle.map(m => `<tr><td>${esc(name(m.modell))}</td><td class="zahl">${zahl(m.bilder)}</td><td class="zahl">${geld(m.kosten)}</td><td class="zahl">${m.bilder ? geld(m.kosten / m.bilder) : '–'}</td></tr>`).join('') || '<tr><td colspan="4">Noch keine Daten.</td></tr>'}
    </tbody></table></div>
    <p class="unter">Kosten laut OpenRouter-Abrechnung je Auftrag (<code>usage.cost</code>). Beträge in ${S.waehrung === 'EUR' ? `Euro, umgerechnet mit ${S.eurKurs} €/$ (Einstellungen)` : 'US-Dollar'}.</p>`;
}

// ------------------------------------------------------------------ Einstellungen
async function einstellungenDialog() {
  let d;
  try { d = await api('einstellungen'); } catch (e) { return fehler(e); }
  await Promise.all([K.daten ? null : katalogHolen(), A.modelle.length ? null : audioKatalogLaden()].filter(Boolean)).catch(() => {});
  const s = d.einstellungen, adm = d.admin;
  const dis = adm ? '' : 'disabled';
  const quelle = { umgebung: 'aus der Umgebung (z. B. zsec)', 'env-datei': 'aus der .env-Datei' }[d.schluessel];
  const modellListe = [...S.modelle].sort((a, b) => a.anbieter.localeCompare(b.anbieter) || a.name.localeCompare(b.name));
  const vListe = [...S.vmodelle].sort((a, b) => a.anbieter.localeCompare(b.anbieter) || a.name.localeCompare(b.name));
  await modal(`<h3>Einstellungen</h3><p class="unter">${adm ? '' : 'Nur Administratoren können Einstellungen ändern.'}</p>
    <div class="reiter" id="rt"><button class="an" data-r="a">Anschluss</button><button data-r="m">Bildmodelle</button><button data-r="v">Video</button><button data-r="au">Audio</button><button data-r="k">Assistent</button><button data-r="ab">Ablage</button><button data-r="z">Anzeige</button></div>
    <form id="ef">
    <div data-rs="a">
      <div class="feld"><label>OpenRouter-Schlüssel</label>
      ${d.werkstatt?.schutzschicht ? `
        <span class="status ok">Kommt aus der Werkstatt</span>
        <small>Du musst hier nichts eintragen. Cinema Studio nutzt den Schlüssel, der in der Academy unter Einstellungen → Tutor-KI hinterlegt ist. Alle Anfragen laufen über die Schutzschicht der Werkstatt: Sie setzt den Schlüssel ein, ersetzt geschützte Angaben wie Namen durch Platzhalter und schreibt jede Anfrage ohne Inhalt ins Protokoll. Cinema Studio sieht den Schlüssel nie.</small>` : `
        <span class="status ${d.schluessel ? 'ok' : ''}">${d.schluessel ? 'Hinterlegt ' + quelle : 'Kein Schlüssel hinterlegt'}</span>
        <input id="efKey" type="password" autocomplete="off" placeholder="${d.schluessel ? 'Neuen Schlüssel eintragen, um ihn zu ersetzen' : 'sk-or-…'}" ${dis}>
        <small>Wird nur auf diesem Rechner in <code>.env</code> gespeichert und nie an den Browser zurückgegeben. Ein Schlüssel aus der Umgebung hat Vorrang.</small>`}
      </div>
      <div class="hinweis"><b>Datenschutz:</b> Beschreibungen und Referenzbilder gehen an OpenRouter und an den Anbieter des gewählten Modells (teils außerhalb der EU). Keine Fotos realer Personen ohne deren Einwilligung und keine vertraulichen Inhalte hochladen.</div>
      <div class="feld"><label>Modellkatalog</label><div><button type="button" class="btn klein" id="efKat" ${dis}>Jetzt neu laden</button>
        <small style="margin-left:8px">${S.modelle.length} Bild- und ${S.vmodelle.length} Videomodelle${S.katalogFehler || S.vkatalogFehler ? ' · Fehler: ' + esc(S.katalogFehler || S.vkatalogFehler) : ''}</small></div></div>
    </div>
    <div data-rs="m" class="hidden">
      <div class="feld"><label>Formate, die ein Modell nicht selbst kann (z. B. 4:5)</label><select id="efAnp" ${dis}>
        <option value="strecken" ${s.anpassung !== 'zuschneiden' ? 'selected' : ''}>Strecken – ganzes Bild und Rahmen bleiben, leichte Verzerrung</option>
        <option value="zuschneiden" ${s.anpassung === 'zuschneiden' ? 'selected' : ''}>Zuschneiden – keine Verzerrung, Ränder fallen mittig weg</option></select>
        <small>Beispiel GPT Image: 3:4 → 4:5 bedeutet ca. 7 % Stauchung bzw. 6 % weniger Höhe.</small></div>
      <div class="feld"><label>Standardmodell</label>${wahlFeld('efStd', 'bild', s.standard_modell)}</div>
      <div class="feld"><label>Empfohlene Modelle (oben in der Auswahl)</label>
        <div class="liste" id="efEmpf">${modellListe.map(m => `<label><input type="checkbox" value="${esc(m.id)}" ${s.empfohlen.includes(m.id) ? 'checked' : ''} ${dis}>${esc(m.name)}<small>${esc(kostenText('bild', katalogListe('bild').find(x => x.id === m.id)))} · ${esc(m.anbieter)}</small></label>`).join('')}</div></div>
    </div>
    <div data-rs="v" class="hidden">
      <div class="feld"><label>Standard-Videomodell</label>${wahlFeld('efVStd', 'video', s.standard_video)}</div>
      <div class="feld"><label>Empfohlene Videomodelle</label>
        <div class="liste" id="efVEmpf">${vListe.map(m => `<label><input type="checkbox" value="${esc(m.id)}" ${s.empfohlen_video.includes(m.id) ? 'checked' : ''} ${dis}>${esc(m.name)}<small>${esc(kostenText('video', katalogListe('video').find(x => x.id === m.id)))} · ${esc(m.anbieter)}</small></label>`).join('')}</div></div>
      <div class="feld"><label>Abfragetakt bei OpenRouter (Sekunden)</label><input id="efTakt" type="number" min="5" max="120" value="${s.video_takt}" ${dis}>
        <small>Wie oft der Server nach fertigen Videos fragt. Offene Aufträge werden auch nach einem Neustart weiter abgefragt.</small></div>
      <div class="feld"><label>Start-/Endbild in anderem Format als das Video</label><select id="efStartAnp" ${dis}>
        <option value="ki" ${s.startbild_anpassung === 'ki' ? 'selected' : ''}>KI erweitern – Bildmodell ergänzt das Bild auf das Videoformat (empfohlen, ≈ 0,04 $ je Bild)</option>
        <option value="zuschneiden" ${s.startbild_anpassung === 'zuschneiden' ? 'selected' : ''}>Zuschneiden – kostenlos, Ränder fallen mittig weg (bei 16:9 → 9:16 zwei Drittel)</option>
        <option value="aus" ${s.startbild_anpassung === 'aus' ? 'selected' : ''}>Unverändert – Modell übernimmt meist das Bildformat</option></select>
        <small>Videomodelle wie Seedance zeigen Start- und Endbild wörtlich und richten sich nach deren Format. KI-Erweiterung nutzt das Standard-Bildmodell (oder ein empfohlenes, das das Format kann); das Ergebnis liegt in der Bibliothek und wird beim nächsten Video mit demselben Bild wiederverwendet.</small></div>
      <div class="hinweis">Videos kosten deutlich mehr als Bilder (z. B. 8 s in 1080p mit Ton ≈ 1 $). Ab 2 $ je Auftrag fragt die App vor dem Start nach.</div>
    </div>
    <div data-rs="k" class="hidden">
      <div class="feld"><label class="haken-zeile"><input type="checkbox" id="efCli" ${s.assistent_claude ? 'checked' : ''} ${dis}> Claude-CLI (Abo) als Gehirn verwenden</label>
        <small id="efCliStatus">Prüfe Claude-CLI …</small></div>
      <div class="feld"><label>Claude-Modell</label>
        <select id="efCm" ${dis}>${CLAUDE_WAHL.map(([id, t]) => `<option value="${id}" ${id === s.assistent_claude_modell ? 'selected' : ''}>${t}</option>`).join('')}
          <option value="eigen" ${CLAUDE_WAHL.some(([id]) => id === s.assistent_claude_modell) ? '' : 'selected'}>Eigene Modell-ID …</option></select>
        <input id="efCmEigen" placeholder="z. B. claude-sonnet-4-6" value="${CLAUDE_WAHL.some(([id]) => id === s.assistent_claude_modell) ? '' : esc(s.assistent_claude_modell)}" ${dis}>
        <small>Nur Opus- und Sonnet-Familie. Abrechnung über dein Claude-Abo, ein API-Schlüssel wird nie verwendet. Der Chat läuft ohne Werkzeuge – er kann auf dem Rechner nichts ausführen.</small>
        <div><button type="button" class="btn klein" id="efCliTest" ${dis}>Verbindung testen</button> <small id="efCliTestErg"></small></div></div>
      <div class="feld"><label>OpenRouter-Chatmodell (ohne CLI oder als Ausweich)</label>${wahlFeld('efOr', 'text', s.assistent_or_modell)}
        <label class="haken-zeile"><input type="checkbox" id="efRueck" ${s.assistent_rueckfall ? 'checked' : ''} ${dis}> Bei CLI-Fehler automatisch auf OpenRouter ausweichen</label></div>
      <div class="feld"><label>Vision-Modell (wenn Bilder im Chat angehängt sind)</label>${wahlFeld('efVis', 'vision', s.assistent_vision_modell)}
        <small>Die Claude-CLI sieht keine Bilder – dafür wird immer dieses OpenRouter-Modell genutzt.</small></div>
      <div class="feld"><label>Sprache der Prompts</label><select id="efSpr" ${dis}>
        <option value="englisch" ${s.assistent_sprache !== 'deutsch' ? 'selected' : ''}>Englisch – Modelle verstehen es am besten, Erklärung auf Deutsch</option>
        <option value="deutsch" ${s.assistent_sprache === 'deutsch' ? 'selected' : ''}>Deutsch</option></select></div>
      <div class="feld"><label class="haken-zeile"><input type="checkbox" id="efAuto" ${s.assistent_auto ? 'checked' : ''} ${dis}> Vorschläge standardmäßig automatisch ins Eingabefeld eintragen</label>
        <small>Im Chat selbst lässt sich das je Browser umschalten.</small></div>
      <div class="feld"><label>Pfad zur Claude-CLI (optional)</label><input id="efPfad" placeholder="leer = automatisch suchen" value="${esc(s.claude_pfad || '')}" ${dis}></div>
      <h3 style="font-size:14px;margin:18px 0 10px">Video-Clone</h3>
      <div class="feld"><label>Analyse-Modell (sieht die Standbilder des Referenzvideos)</label>${wahlFeld('efKlon', 'vision', s.klon_modell)}</div>
      <div class="feld"><label>Werkzeuge</label><small id="efWerkzeuge">Prüfe ffmpeg, ffprobe, yt-dlp …</small></div>
      <div class="feld"><label>Pfad zu ffmpeg (optional, ffprobe wird daneben gesucht)</label><input id="efFfmpeg" placeholder="leer = automatisch suchen" value="${esc(s.ffmpeg_pfad || '')}" ${dis}></div>
      <div class="feld"><label>Pfad zu yt-dlp (optional)</label><input id="efYtdlp" placeholder="leer = automatisch suchen" value="${esc(s.ytdlp_pfad || '')}" ${dis}></div>
      <div class="hinweis">Chatinhalte gehen an Anthropic (Claude-CLI) bzw. an OpenRouter und den Modellanbieter. Keine vertraulichen oder personenbezogenen Daten eingeben.</div>
    </div>
    <div data-rs="au" class="hidden">${audioEinstellungenHtml(s, dis)}</div>
    <div data-rs="ab" class="hidden">${ablageEinstellungenHtml(s, dis, d.werkstatt?.ablage || '')}</div>
    <div data-rs="z" class="hidden">
      <div class="feld"><label>Währung der Kostenanzeige</label><select id="efWae" ${dis}><option value="USD" ${s.waehrung === 'USD' ? 'selected' : ''}>US-Dollar ($) – wie OpenRouter abrechnet</option><option value="EUR" ${s.waehrung === 'EUR' ? 'selected' : ''}>Euro (€) – umgerechnet</option></select></div>
      <div class="feld"><label>Umrechnungskurs (€ je $)</label><input id="efKurs" type="number" step="0.01" min="0.1" max="10" value="${s.eur_kurs}" ${dis}><small>Feste Annahme, kein Tageskurs.</small></div>
    </div>
    <div class="knoepfe"><button type="button" class="btn" data-zu="null">Schließen</button>${adm ? '<button class="btn primaer">Speichern</button>' : ''}</div>
    </form>`,
  { breit: true, beimOeffnen: (c, zu) => {
    c.querySelector('#rt').onclick = ev => { const b = ev.target.closest('[data-r]'); if (!b) return; $$('#rt button', c).forEach(x => x.classList.toggle('an', x === b)); $$('[data-rs]', c).forEach(x => x.classList.toggle('hidden', x.dataset.rs !== b.dataset.r)); };
    // Assistent: CLI-Status, Modelllisten, Verbindungstest
    const cmEigen = () => c.querySelector('#efCmEigen').classList.toggle('hidden', c.querySelector('#efCm').value !== 'eigen');
    c.querySelector('#efCm').onchange = cmEigen;
    cmEigen();
    api('assistent/status').then(st => {
      c.querySelector('#efCliStatus').innerHTML = st.claude.gefunden
        ? `<span class="status ok">Gefunden (${esc(st.claude.ort)})${st.claude.version ? ' · ' + esc(st.claude.version) : ''}</span>`
        : '<span class="status">Nicht gefunden – installieren oder den Pfad unten angeben</span>';
      c.querySelector('#efWerkzeuge').innerHTML = [['ffmpeg', 'ffmpeg'], ['ffprobe', 'ffprobe'], ['ytdlp', 'yt-dlp']]
        .map(([k, n]) => `<span class="status ${st.werkzeuge[k] ? 'ok' : ''}">${n}</span>`).join(' &nbsp; ');
    }).catch(() => {});
    if (adm) audioEinstellungenBinden(c); else wahlFelderBinden(c);
    c.querySelector('#efAblageAuf').onclick = () => imOrdnerZeigen(null);
    const test = c.querySelector('#efCliTest');
    if (test) test.onclick = async () => {
      const erg = c.querySelector('#efCliTestErg');
      test.disabled = true;
      erg.textContent = 'Frage Claude … (kurzer Aufruf aus dem Abo)';
      try {
        const r = await api('assistent/test', { modell: claudeModellWahl(c) });
        erg.innerHTML = r.erfolg ? `<span class="status ok">Antwort „${esc(r.meldung)}“ nach ${r.sekunden} s</span>` : `<span class="status">${esc(r.meldung)}</span>`;
      } catch (e) { erg.textContent = e.message; }
      test.disabled = false;
    };
    const kat = c.querySelector('#efKat');
    if (kat) kat.onclick = async () => { kat.disabled = true; kat.textContent = 'Lädt …'; try { await Promise.all([katalogLaden(true), videoKatalogLaden(true), katalogHolen(true).then(audioKatalogLaden)]); toast(`Kataloge aktualisiert: ${S.modelle.length} Bild- und ${S.vmodelle.length} Videomodelle.`, 'ok'); } catch (e) { fehler(e); } kat.disabled = false; kat.textContent = 'Jetzt neu laden'; };
    c.querySelector('#ef').onsubmit = async ev => {
      ev.preventDefault();
      if (!adm) return;
      const body = { anpassung: c.querySelector('#efAnp').value, standard_modell: c.querySelector('#efStd').value, empfohlen: $$('#efEmpf input:checked', c).map(x => x.value),
        standard_video: c.querySelector('#efVStd').value, empfohlen_video: $$('#efVEmpf input:checked', c).map(x => x.value),
        video_takt: parseInt(c.querySelector('#efTakt').value, 10) || 15, startbild_anpassung: c.querySelector('#efStartAnp').value,
        assistent_claude: c.querySelector('#efCli').checked, assistent_rueckfall: c.querySelector('#efRueck').checked,
        assistent_auto: c.querySelector('#efAuto').checked, assistent_sprache: c.querySelector('#efSpr').value,
        assistent_claude_modell: claudeModellWahl(c), assistent_or_modell: c.querySelector('#efOr').value.trim(),
        assistent_vision_modell: c.querySelector('#efVis').value.trim(), claude_pfad: c.querySelector('#efPfad').value.trim(),
        klon_modell: c.querySelector('#efKlon').value.trim(), ffmpeg_pfad: c.querySelector('#efFfmpeg').value.trim(),
        ytdlp_pfad: c.querySelector('#efYtdlp').value.trim(), ablage_pfad: c.querySelector('#efAblage').value.trim(),
        ...audioEinstellungenWerte(c),
        waehrung: c.querySelector('#efWae').value, eur_kurs: parseFloat(c.querySelector('#efKurs').value) || 0.86 };
      const key = c.querySelector('#efKey')?.value.trim();
      if (key) body.schluessel = key;
      if (d.werkstatt?.ablage) delete body.ablage_pfad;   // gebunden: der Arbeitsordner der Werkstatt gilt
      try {
        await api('einstellungen', body);
        if (c.querySelector('#efKey')) c.querySelector('#efKey').value = '';
        toast('Einstellungen gespeichert.', 'ok');
        zu('ok');
        await Promise.all([katalogLaden(), videoKatalogLaden(), audioKatalogLaden()]); kontoLaden();
        if (bildAnsicht(S.ansicht)) wandZeichnen(); else ansicht(S.ansicht);
      } catch (e) { fehler(e); }
    };
  } });
}
// ------------------------------------------------------------------ Tastatur
document.addEventListener('keydown', ev => {
  const lb = !$('#lightbox').classList.contains('hidden');
  if (ev.key === 'Escape') {
    if (!$('#pop').classList.contains('hidden')) return popSchliessen();
    if (lb) return lbZu();
    if (S.waehlen) return auswahlBeenden();
  }
  if (lb && (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight')) {
    const i = S.bilder.findIndex(x => x.id === $('#lightbox').dataset.id);
    const n = S.bilder[i + (ev.key === 'ArrowRight' ? 1 : -1)];
    if (n) oeffnen(n.id);
  }
  if (ev.key === '/' && !ev.target.closest('input,textarea') && !$('#composer').classList.contains('hidden')) { ev.preventDefault(); pr.focus(); }
});
let letzteBreite = innerWidth;
addEventListener('resize', () => { if (innerWidth !== letzteBreite) { letzteBreite = innerWidth; popSchliessen(); } });

// ------------------------------------------------------------------ Start
symboleEinsetzen();
(async () => {
  const marke = einlassMarke();
  let meldung = '';
  if (marke) {
    try { const d = await api('einlass', { marke }); return angemeldet(d.nutzer, d.csrf); } catch (e) { meldung = e.message; }
  }
  try {
    // Ohne (gültige) Marke: eine noch laufende Sitzung weiterführen, z. B. nach dem Neuladen.
    const s = await api('status');
    if (s.nutzer) return angemeldet(s.nutzer, s.csrf);
    zeigeZugang(meldung);
  } catch (e) { zeigeZugang(e.message); }
})();
