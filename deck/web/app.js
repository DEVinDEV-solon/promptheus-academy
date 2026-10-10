/* Arbeits-Cockpit / PROMPTHEUS DECK — Oberfläche (ohne Framework, Bausteine aus PROMPTHEUS Cinema Studio) */
'use strict';

// ------------------------------------------------------------------ Symbole
const P = (d, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${extra}>${d}</svg>`;
const I = {
  funke: P('<path d="M12 3l1.9 5.6L19.5 10.5 13.9 12.4 12 18l-1.9-5.6L4.5 10.5l5.6-1.9z"/><path d="M19 3v3M17.5 4.5h3"/>'),
  ordner: P('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'),
  ordnerPlus: P('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M12 11v5M9.5 13.5h5"/>'),
  globus: P('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'),
  monitor: P('<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>'),
  muell: P('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
  plus: P('<path d="M12 5v14M5 12h14"/>'),
  rechts: P('<path d="M9 6l6 6-6 6"/>'),
  links: P('<path d="M15 6l-6 6 6 6"/>'),
  hoch: P('<path d="M6 15l6-6 6 6"/>'),
  runter: P('<path d="M6 9l6 6 6-6"/>'),
  mehr: P('<circle cx="5" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="19" cy="12" r="1.3" fill="currentColor"/>'),
  oeffnen: P('<path d="M7 17L17 7M9 7h8v8"/>'),
  neu: P('<path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5"/>'),
  zauber: P('<path d="M4 20L16 8M14 4v3M19 9h3M18 5l2-2M10 5L9 3M19 14l2 1"/>'),
  haken: P('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  x: P('<path d="M6 6l12 12M18 6L6 18"/>'),
  suche: P('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>'),
  raster: P('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>'),
  liste: P('<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>'),
  menue: P('<path d="M4 6h16M4 12h16M4 18h16"/>'),
  zahnrad: P('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
  link: P('<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>'),
  text: P('<path d="M5 6h14M5 12h14M5 18h9"/>'),
  uhr: P('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  play: P('<path d="M7 5l12 7-12 7z" fill="currentColor"/>'),
  stopp: P('<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>'),
  strom: P('<path d="M12 3v9M6.3 7.3a8 8 0 1 0 11.4 0"/>'),
  stift: P('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/>'),
  pfeil: P('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  auge: P('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
  auge_zu: P('<path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.6 6.6A17 17 0 0 0 2 12s3.6 7 10 7a9.6 9.6 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>'),
  box: P('<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8M12 13v8"/>'),
  warn: P('<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>'),
  frage: P('<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17h.01"/>'),
  zurueck: P('<path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>'),
  flamme: P('<path d="M12 3c1 3.5 5 5.6 5 10a5 5 0 0 1-10 0c0-2.4 1.2-3.9 2.4-5 .1 1.6.8 2.7 1.9 3.2C11 8.8 11.4 5.6 12 3z"/>'),
  sonne: P('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
  mond: P('<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>'),
  palette: P('<path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.8 1.6-1.6 0-.9-.6-1.3-.6-2.2 0-.9.7-1.6 1.6-1.6H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3z"/><circle cx="7.5" cy="11" r="1.2" fill="currentColor"/><circle cx="10.5" cy="7" r="1.2" fill="currentColor"/><circle cx="15" cy="7.5" r="1.2" fill="currentColor"/>'),
  stern: P('<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>'),
};
const ico = n => I[n] || '';
function symboleEinsetzen(root = document) { root.querySelectorAll('[data-i]').forEach(el => { if (!el.firstChild) el.innerHTML = ico(el.dataset.i); }); }

// ------------------------------------------------------------------ Grundlagen
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const speicher = {
  lies(k, d) { try { const v = localStorage.getItem('cockpit.' + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  setz(k, v) { try { localStorage.setItem('cockpit.' + k, JSON.stringify(v)); } catch { /* egal */ } },
};
const datum = iso => { const [j, m, t] = String(iso || '').split('-'); return t ? `${t}.${m}.${j}` : ''; };

// ------------------------------------------------------------------ Farbfilter
// Dieselben Paletten wie die Academy (PROMPTHEUS srv/varianten.php) und die Werkstatt (paletten.ts):
// sechs dunkle zur Wahl, Pergament und Marmor nur als helle Seite für den ☀/☾-Knopf (wie dort: der Knopf
// wechselt zur Partnerpalette, statt eine dunkle Farbwelt aufzuhellen). „Standard“ = Cinema-Studio-Farben
// aus app.css, ohne Überschreibung.
// Reihenfolge der Farben: grund, grund-2, grund-3, rand, rand-hell, schrift, schrift-2, schrift-3,
// glut, glut-hell, glut-tief, gold, lapis.
const PALETTEN = {
  standard: { name: 'Cinema Studio', was: 'Gold-Bronze auf Graphit – die Vorgabe dieses Cockpits.', ton: 'dunkel', partner: 'pergament', probe: ['#0a0b0d', '#e6cc88', '#a76f43'] },
  schmiede: { name: 'Schmiede', was: 'Glut auf dunklem Grund, Gold für Erfolg.', ton: 'dunkel', partner: 'pergament',
    f: ['#14110f', '#1c1815', '#262019', '#3a3129', '#504338', '#ede5db', '#b3a596', '#aaa39c', '#ff7a1c', '#ffa347', '#c14e00', '#ffc94d', '#4e82b6'] },
  obsidian: { name: 'Obsidian', was: 'Neutrales Schwarz mit Bernstein – kein Farbstich, nur Arbeit.', ton: 'dunkel', partner: 'marmor',
    f: ['#101114', '#17181c', '#202227', '#32353c', '#4a4e57', '#ecebe7', '#b4b1aa', '#acaaa4', '#e8a54b', '#f3c27a', '#b5791f', '#ffd47a', '#7fa6cf'] },
  olymp: { name: 'Olymp', was: 'Nachtblau mit Gold – ruhig, für lange Sitzungen.', ton: 'dunkel', partner: 'marmor',
    f: ['#0d1420', '#141d2c', '#1c2839', '#2c3a4f', '#3e5069', '#e4ebf5', '#a3b2c6', '#9da9b9', '#5b9bd8', '#8dbcea', '#2c5f96', '#ffd27a', '#7fb0dd'] },
  olivenhain: { name: 'Olivenhain', was: 'Tiefes Grün mit Olivgold – der Hain der ersten Akademie.', ton: 'dunkel', partner: 'pergament',
    f: ['#0f1611', '#162019', '#1f2b22', '#2f4134', '#445b49', '#e7efe6', '#a9bca9', '#a3b4a3', '#d6b04c', '#e6c878', '#a17f1f', '#f2d27a', '#6fb8a4'] },
  terrakotta: { name: 'Terrakotta', was: 'Erdig und warm – gebrannter Ton statt schwarzer Bildschirm.', ton: 'dunkel', partner: 'pergament',
    f: ['#20120e', '#2b1a14', '#38231b', '#4d3225', '#6b4632', '#f3e3d5', '#c3a794', '#b5a69b', '#e0642f', '#f08a58', '#a33d13', '#e8b45c', '#5f93ab'] },
  funkenflug: { name: 'Funkenflug', was: 'Kräftig und bunt.', ton: 'dunkel', partner: 'marmor',
    f: ['#161028', '#211838', '#2d2149', '#413063', '#5b4487', '#f2ecff', '#c0b3dd', '#ada2c8', '#ff8a3d', '#ffab6b', '#d1550e', '#ffd93d', '#6ac9e8'] },
  pergament: { name: 'Pergament', was: 'Helle Seite der warmen Paletten.', ton: 'hell', partner: 'schmiede', nurPartner: true,
    f: ['#f7f3ec', '#fffdfa', '#efe8dc', '#ddd2c0', '#c4b49a', '#241d16', '#55483c', '#5a5046', '#b74e0c', '#e2711d', '#8f3800', '#9a6a00', '#2f6394'] },
  marmor: { name: 'Marmor', was: 'Helle Seite der kühlen Paletten.', ton: 'hell', partner: 'olymp', nurPartner: true,
    f: ['#f4f5f7', '#ffffff', '#e8eaee', '#d3d7de', '#b3bac5', '#1a1e26', '#454c58', '#4d535e', '#9a5b1e', '#b06d28', '#6d3c0d', '#8a6a12', '#2a5d90'] },
};
const FARB_MARKEN = ['--bg', '--bg2', '--panel', '--panel2', '--panel3', '--border', '--border2', '--txt', '--muted', '--muted2',
  '--gold', '--gold2', '--bronze', '--blue', '--good', '--warn', '--bad', '--auf-gold', '--feld', '--feld-rand', '--feld-rand2', '--rahmen-hell', '--shadow'];
const mische = (a, b, t) => '#' + [1, 3, 5].map(i => Math.round(parseInt(a.substr(i, 2), 16) * (1 - t) + parseInt(b.substr(i, 2), 16) * t)
  .toString(16).padStart(2, '0')).join('');

/** Wendet Filter + Grundton an; liefert die wirksame Palette (im Hellen der Partner). */
function farbeAnwenden(kennung, thema) {
  let k = PALETTEN[kennung] && !PALETTEN[kennung].nurPartner ? kennung : 'standard';
  if ((thema === 'hell') !== (PALETTEN[k].ton === 'hell')) k = PALETTEN[k].partner;
  const p = PALETTEN[k], r = document.documentElement;
  r.dataset.ton = p.ton;
  if (!p.f) { FARB_MARKEN.forEach(n => r.style.removeProperty(n)); return k; }
  const [g, g2, g3, ra, rh, s, s2, s3, gl, glh, glt, , la] = p.f;
  const hell = p.ton === 'hell';
  const w = {
    '--bg': g, '--bg2': mische(g, g2, .5), '--panel': g2, '--panel2': mische(g2, g3, .5), '--panel3': g3,
    '--border': ra, '--border2': rh, '--txt': s, '--muted': s2, '--muted2': s3, '--blue': la,
    '--gold': hell ? gl : glh, '--gold2': hell ? glt : gl, '--bronze': glt, '--auf-gold': hell ? '#ffffff' : g,
    '--feld': hell ? '#ffffff' : mische(g, '#000000', .35), '--feld-rand': hell ? rh : mische(rh, '#ffffff', .12),
    '--feld-rand2': hell ? mische(rh, '#000000', .18) : mische(rh, '#ffffff', .25), '--rahmen-hell': hell ? rh : mische(rh, '#ffffff', .06),
    '--shadow': hell ? '0 18px 44px rgba(40,30,20,.16)' : '0 24px 60px rgba(0,0,0,.55)',
  };
  // Zustandsfarben: auf hellem Grund die dunklen Fassungen der Werkstatt (paletten.ts, ZUSTANDSFARBEN.hell).
  if (hell) Object.assign(w, { '--good': '#1f7a3d', '--warn': '#8a5a00', '--bad': '#b3261e' });
  else ['--good', '--warn', '--bad'].forEach(n => r.style.removeProperty(n));
  for (const [n, v] of Object.entries(w)) r.style.setProperty(n, v);
  return k;
}
{ const f = speicher.lies('farbe', null); if (f) farbeAnwenden(f.k, f.t); }  // vor dem ersten Zeichnen, ohne Aufblitzen

const S = {
  ordner: [], eintraege: [], status: {}, einst: {}, ignoriert: [], claude: false, ohne: 0, ohneListe: null,
  autostart: false, chromeProfile: [], browser: [], claudeKonten: [], port: 8777, container: [],
  profil: { titel: 'Arbeits-Cockpit', marke: 'DEVinDEV', zusatz: '- Cockpit -', start_bat: 'ARBEITS-COCKPIT-START.bat', feste: false },
  ansicht: speicher.lies('ansicht', { art: 'uebersicht' }),
  offen: speicher.lies('offen', { programme: true, web: true }),
  filter: '', suche: '', kompakt: speicher.lies('kompakt', false), zielBereich: '', panelZahl: 0,
};

async function api(pfad, body) {
  const opt = { method: body === undefined ? 'GET' : 'POST', headers: { 'X-Cockpit': '1' } };
  if (body !== undefined) { opt.headers['Content-Type'] = 'application/json'; opt.body = JSON.stringify(body); }
  let r;
  try { r = await fetch('/api/' + pfad, opt); } catch { throw new Error(`${S.profil.titel} ist nicht erreichbar. ${S.profil.start_bat} erneut starten.`); }
  let d = {};
  try { d = await r.json(); } catch { /* leer */ }
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

// ------------------------------------------------------------------ Daten
async function laden() {
  const d = await api('zustand');
  Object.assign(S, {
    ordner: d.ordner, eintraege: d.eintraege, einst: d.einstellungen, ignoriert: d.ignoriert || [], status: d.status,
    ohne: d.ohne, claude: d.claude, claudeKonten: d.claude_konten || [], autostart: d.autostart_aktiv, chromeProfile: d.chrome_profile, browser: d.browser || [], port: d.port,
    profil: d.profil || S.profil,
  });
  profilAnwenden();
  farbeSetzen();
  if (S.ansicht.art === 'ordner' && !S.ordner.some(o => o.id === S.ansicht.ordner)) S.ansicht = { art: 'uebersicht' };
  if (S.ansicht.art === 'feste' && !S.profil.feste) S.ansicht = { art: 'uebersicht' };
  allesZeichnen();
}

// Name und Wortmarke kommen aus dem Profil (DEVinDEV-Cockpit oder PROMPTHEUS DECK).
const kurzTitel = () => S.profil.zusatz.replace(/[-–\s]/g, '') || 'Cockpit';
function profilAnwenden() {
  document.title = S.profil.titel;
  $('.wm-name').textContent = S.profil.marke;
  $('.wm-zusatz').textContent = S.profil.zusatz;
  $('.rail-title').setAttribute('aria-label', S.profil.titel);
}
function farbeSetzen() {
  const wirkt = farbeAnwenden(S.einst.farbe, S.einst.thema);
  speicher.setz('farbe', { k: S.einst.farbe, t: S.einst.thema });
  const hell = PALETTEN[wirkt].ton === 'hell';
  $('#btnThema').innerHTML = ico(hell ? 'mond' : 'sonne');
  $('#btnThema').dataset.tip = hell ? `Dunkel (${PALETTEN[S.einst.farbe]?.name || 'Standard'})` : `Hell (${PALETTEN[PALETTEN[S.einst.farbe]?.partner || 'pergament'].name})`;
}
async function farbeWaehlen(neu) {
  const alt = { farbe: S.einst.farbe, thema: S.einst.thema };
  Object.assign(S.einst, neu);
  farbeSetzen();
  try { await api('einstellungen', { einstellungen: neu }); } catch (e) { Object.assign(S.einst, alt); farbeSetzen(); fehler(e); }
}
// Feste Einträge (DECK: die PROMPTHEUS Academy): kurzer Name im eigenen Abschnitt, Kürzel aus dem Profil.
const kurzName = e => (e.kern ? e.name.replace(/^PROMPTHEUS Academy\s*[–-]\s*/, '') : e.name);
const festName = () => (S.ordner.find(o => o.fest) || {}).name || 'Fest';
// Reihenfolge des festen Abschnitts: eigene (gezogen, feste_folge) vor der des Profils (kern).
const festFolge = (a, b) => { const f = S.einst.feste_folge || []; const i = x => { const n = f.indexOf(x.id); return n < 0 ? 1000 + x.kern : n; }; return i(a) - i(b); };

// Browser & Profil je Karte – leer: wie in den Einstellungen. Werkstatt/Cinema-Studio erben die Wahl der Academy-Karte.
const browserName = id => (id === 'standard' ? 'Windows-Standardbrowser' : (S.browser.find(b => b.id === id) || {}).name || id);
const profilVon = (bid, pid) => ((S.browser.find(b => b.id === bid) || {}).profile || []).find(p => p.id === pid);
const profilLabel = p => p.name + (p.konto && p.konto !== p.name ? ` (${p.konto})` : '');
function browserText(b) {
  if (!b?.art) return '';
  const p = profilVon(b.art, b.profil);
  return browserName(b.art) + (b.profil ? ' · ' + (p ? profilLabel(p) : b.profil) : '');
}
function browserKurz(e) {
  if (!e.browser?.art) return '';
  const p = profilVon(e.browser.art, e.browser.profil);
  return p ? p.name : e.browser.profil || browserName(e.browser.art);
}
function profilOptionen(art, wahl) {
  const l = (S.browser.find(x => x.id === art) || {}).profile || [];
  let h = `<option value="">${l.length ? 'Zuletzt benutztes Profil' : '– kein Profil –'}</option>`;
  h += l.map(p => `<option value="${esc(p.id)}" ${p.id === wahl ? 'selected' : ''}>${esc(profilLabel(p))}</option>`).join('');
  if (wahl && !l.some(p => p.id === wahl)) h += `<option value="${esc(wahl)}" selected>${esc(wahl)} (nicht gefunden)</option>`;
  return h;
}
/** Felder „Öffnen mit“ + „Profil“. karte: die Karte (oder true) – dann mit der Wahl „wie geerbt“. */
function browserFelder(b, karte) {
  const art = b?.art || '';
  const ueber = karte?.ticket_ueber && eintrag(karte.ticket_ueber);
  const erbe = ueber?.browser?.art ? `Wie Karte „${kurzName(ueber)}“ (${browserText(ueber.browser)})`
    : `Wie in den Einstellungen (${browserText({ art: S.einst.browser, profil: S.einst.browser_profil }) || 'Standard'})`;
  const opt = (karte ? [['', erbe]] : [])
    .concat(S.browser.map(x => [x.id, x.name]), [['standard', 'Windows-Standardbrowser']]);
  return `<div class="feld"><label>Öffnen mit</label><select name="browser_art">${opt.map(([k, n]) => `<option value="${esc(k)}" ${k === art ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></div>
    <div class="feld"><label>Profil</label><select name="browser_profil" ${!art || art === 'standard' ? 'disabled' : ''}>${profilOptionen(art, b?.profil)}</select></div>`;
}
function browserVerdrahten(f) {
  const a = $('[name=browser_art]', f), s = $('[name=browser_profil]', f);
  a.addEventListener('change', () => { s.innerHTML = profilOptionen(a.value, ''); s.disabled = !a.value || a.value === 'standard'; });
}
function browserLesen(f) {
  const art = $('[name=browser_art]', f).value;
  return art ? { art, profil: art === 'standard' ? '' : $('[name=browser_profil]', f).value } : { art: '' };
}

async function statusHolen() {
  if (document.hidden || S.zieht) return;
  try {
    const d = await api('status');
    const alt = S.status;
    S.status = d.status;
    S.docker = d.docker;
    for (const [id, st] of Object.entries(S.status)) {
      const a = alt[id];
      if (!a || a.z !== st.z || a.info !== st.info) {
        const el = $(`.kachel[data-id="${CSS.escape(id)}"]`);
        const e = eintrag(id);
        if (el && e) { el.outerHTML = kachelHtml(e); }
        if (a && a.z === 'startet' && st.z === 'laeuft') toast(`${e?.name || id} läuft.`, 'ok');
        if (a && a.z !== 'aus' && st.z === 'aus' && st.info) toast(`${e?.name || id}: ${st.info}`, 'fehler');
      }
    }
    symboleEinsetzen($('#wand'));
    railZeichnen();
    kontoZeichnen();
    laufZeichnen();
  } catch { /* nächste Runde */ }
}

const eintrag = id => S.eintraege.find(e => e.id === id);
const ordnerVon = bereich => S.ordner.filter(o => o.bereich === bereich);
const zustand = e => (S.status[e.id] || {}).z || 'aus';
const laufende = () => S.eintraege.filter(e => e.bereich === 'programme' && zustand(e) === 'laeuft');

function kuerzel(name) {
  const w = String(name).replace(/[()[\]·|:]/g, ' ').split(/[\s_\-–]+/).filter(Boolean);
  const k = w.length > 1 ? w[0][0] + w[1][0] : (w[0] || '?').slice(0, 2);
  return k.toUpperCase();
}
function host(url) {
  if (/^file:/i.test(url)) return 'Lokale Datei';
  try { return new URL(url).host; } catch { return url; }
}
function sortiert(liste) {
  const nachName = (a, b) => a.name.localeCompare(b.name, 'de', { sensitivity: 'base' });
  const nachDatum = (a, b) => (b.eingerichtet || '').localeCompare(a.eingerichtet || '') || nachName(a, b);
  const nachRang = (a, b) => (a.rang ?? -1) - (b.rang ?? -1) || nachDatum(a, b);
  return [...liste].sort({ name: nachName, eigen: nachRang }[S.einst.sortierung] || nachDatum);
}
function passt(e) {
  if (S.filter) { if (e.bereich !== 'programme') return false; const z = zustand(e); if (S.filter === 'laeuft' ? z !== 'laeuft' : z === 'laeuft') return false; }
  if (!S.suche) return true;
  const q = S.suche.toLowerCase();
  return [e.name, e.beschreibung, e.url, e.start?.pfad, e.start?.container].some(x => x && String(x).toLowerCase().includes(q));
}
function portBelegung() {
  const m = {};
  S.eintraege.forEach(e => { if (e.bereich === 'programme' && e.port) (m[e.port] = m[e.port] || []).push(e.name); });
  return m;
}

// ------------------------------------------------------------------ Zeichnen
function allesZeichnen() {
  railZeichnen();
  kontoZeichnen();
  kopfZeichnen();
  wandZeichnen();
  laufZeichnen();
  panelStatusZeichnen();
}

function railZeichnen() {
  const nav = $('#railNav');
  const a = S.ansicht;
  const lauf = laufende().length;
  const b = (art, extra = {}) => a.art === art && Object.entries(extra).every(([k, v]) => a[k] === v);
  let h = `<button data-nav="uebersicht" class="${b('uebersicht') ? 'active' : ''}" data-tip="Alles auf einen Blick – laufende Programme stehen rechts"><span class="ico">${ico('raster')}</span><span class="lbl">Übersicht</span>${lauf ? `<span class="badge an">${lauf} ${lauf === 1 ? 'läuft' : 'laufen'}</span>` : ''}</button>`;
  if (S.profil.feste) {
    const f = S.eintraege.filter(e => e.kern);
    const l = f.filter(e => zustand(e) === 'laeuft').length;
    h += `<button data-nav="feste" class="${b('feste') ? 'active' : ''}" data-tip="Fest eingetragen – immer da, nicht löschbar · Reihenfolge per Ziehen"><span class="ico">${ico('flamme')}</span><span class="lbl">${esc(festName())}</span><span class="badge ${l ? 'an' : ''}">${l ? l + '/' : ''}${f.length}</span></button>`;
  }
  for (const [bereich, titel, sym] of [['programme', 'Lokale Programme', 'monitor'], ['web', 'Web-Seiten', 'globus']]) {
    const anzahl = S.eintraege.filter(e => e.bereich === bereich).length;
    h += `<button data-nav="bereich" data-bereich="${bereich}" class="${b('bereich', { bereich }) ? 'active' : ''} ${S.offen[bereich] ? 'open' : ''}"><span class="ico">${ico(sym)}</span><span class="lbl">${titel}</span><span class="badge">${anzahl}</span><span class="sub-arrow" data-auf="${bereich}">${ico('rechts')}</span></button>`;
    if (S.offen[bereich]) {
      h += '<div class="rail-sub">';
      for (const o of ordnerVon(bereich)) {
        const n = S.eintraege.filter(e => e.ordner === o.id).length;
        const l = bereich === 'programme' ? S.eintraege.filter(e => e.ordner === o.id && zustand(e) === 'laeuft').length : 0;
        h += `<button data-nav="ordner" data-ordner="${esc(o.id)}" class="${b('ordner', { ordner: o.id }) ? 'active' : ''}${o.fest ? ' fest' : ''}" data-tip="${o.fest ? 'Fester Ordner – steht immer oben' : 'Ziehen: nach oben/unten verschieben · Kacheln hierher ziehen · Rechtsklick: mehr'}"><span class="ico">${ico(o.fest ? 'flamme' : 'ordner')}</span><span class="lbl">${esc(o.name)}</span><span class="badge ${l ? 'an' : ''}">${l ? l + '/' : ''}${n}</span></button>`;
      }
      h += `<button class="neu" data-neuordner="${bereich}"><span class="ico">${ico('ordnerPlus')}</span><span class="lbl">Neuer Ordner</span></button></div>`;
    }
  }
  h += `<button data-nav="ohne" class="${b('ohne') ? 'active' : ''}" data-tip="Ordner in scripts, die noch nicht im Cockpit stehen – neueste zuerst"><span class="ico">${ico('frage')}</span><span class="lbl">Noch nicht im Cockpit</span>${S.ohne ? `<span class="badge warn">${S.ohne}</span>` : ''}</button>`;
  nav.innerHTML = h;
}

function kontoZeichnen() {
  const lauf = laufende().length;
  $('#kontoBox').innerHTML = `<span class="z"><span class="punkt an"></span>${esc(kurzTitel())} läuft · <b>:${S.port}</b></span>`
    + `<span>${lauf ? `<b>${lauf}</b> ${lauf === 1 ? 'Programm läuft' : 'Programme laufen'}` : 'Kein Programm läuft'}</span>`
    + (S.docker === false ? '<span>Docker: <b>aus</b></span>' : '');
  $('#einstUnter').textContent = 'Autostart ' + (S.autostart ? 'an' : 'aus');
}

function kopfZeichnen() {
  const a = S.ansicht;
  let titel = 'Übersicht';
  if (a.art === 'bereich') titel = a.bereich === 'web' ? 'Web-Seiten' : 'Lokale Programme';
  if (a.art === 'ordner') titel = (S.ordner.find(o => o.id === a.ordner) || {}).name || 'Ordner';
  if (a.art === 'ohne') titel = 'Noch nicht im Cockpit';
  if (a.art === 'feste') titel = festName();
  if (S.suche) titel = `Suche „${S.suche}“`;
  $('#viewTitel').textContent = titel;
  $$('#statusFilter button').forEach(b => b.classList.toggle('an', b.dataset.f === S.filter));
  $$('#sortWahl button').forEach(b => b.classList.toggle('an', b.dataset.s === (S.einst.sortierung || 'datum')));
  $('#btnGroesse').innerHTML = ico(S.kompakt ? 'raster' : 'liste');
  $('#btnGroesse').dataset.tip = S.kompakt ? 'Als Kacheln anzeigen' : 'Als kompakte Liste anzeigen';
  $('#statusFilter').classList.toggle('hidden', a.art === 'ohne' || (a.art === 'bereich' && a.bereich === 'web') || (a.art === 'ordner' && (S.ordner.find(o => o.id === a.ordner) || {}).bereich === 'web'));
}

function abschnitt(titel, sym, liste, ordnerId) {
  if (!liste.length) return '';
  return `<div class="tag-kopf" ${ordnerId ? `data-ziel="${esc(ordnerId)}"` : ''}><span class="ico">${ico(sym)}</span><b>${esc(titel)}</b><span>${liste.length}</span></div>`
    + `<div class="raster" ${ordnerId ? `data-ziel="${esc(ordnerId)}"` : ''}>${sortiert(liste).map(kachelHtml).join('')}</div>`;
}

function wandZeichnen() {
  const w = $('#wand');
  w.classList.toggle('kompakt', S.kompakt);
  const a = S.ansicht;
  if (a.art === 'ohne' && !S.suche) return ohneZeichnen();
  const sichtbar = S.eintraege.filter(passt);
  let h = '';
  let anzahl = 0;
  const gesamt = S.suche || a.art === 'uebersicht';
  const feste = sichtbar.filter(e => e.kern).sort(festFolge);
  if ((gesamt || a.art === 'feste') && feste.length) {
    // Fester Abschnitt ganz oben, gemischt Programme und Seiten – kein Ablageziel; Reihenfolge per Ziehen.
    h += `<div class="tag-kopf fest"><span class="ico">${ico('flamme')}</span><b>${esc(festName())}</b><span>${feste.length}</span></div>`
      + `<div class="raster fest">${feste.map(kachelHtml).join('')}</div>`;
    anzahl += feste.length;
  }
  const bereiche = gesamt ? ['programme', 'web'] : a.art === 'bereich' ? [a.bereich] : [];
  for (const bereich of bereiche) {
    for (const o of ordnerVon(bereich)) {
      const liste = sichtbar.filter(e => e.ordner === o.id && !(gesamt && e.kern));
      anzahl += liste.length;
      h += abschnitt(o.name, bereich === 'web' ? 'globus' : 'ordner', liste, o.id);
    }
  }
  if (a.art === 'ordner' && !S.suche) {
    const o = S.ordner.find(x => x.id === a.ordner);
    const liste = sichtbar.filter(e => e.ordner === a.ordner);
    anzahl = liste.length;
    if (liste.length) h += `<div class="raster" data-ziel="${esc(a.ordner)}">${sortiert(liste).map(kachelHtml).join('')}</div>`;
    else h = `<div class="leer"><div class="gross">${ico('ordner')}</div><h3>Ordner „${esc(o?.name)}“ ist leer</h3><p>Ziehe Kacheln auf den Ordner links im Menü – oder füge unten einen Link ein und wähle beim Vorschlag diesen Ordner.</p></div>`;
  }
  if (!h) h = `<div class="leer"><div class="gross">${ico(S.suche ? 'suche' : 'raster')}</div><h3>${S.suche ? 'Nichts gefunden' : 'Noch keine Einträge'}</h3><p>${S.suche ? 'Andere Suchwörter probieren.' : 'Füge unten einen Link zu einem Programm ein – das LLM-Werkzeug nimmt es auf.'}</p></div>`;
  w.innerHTML = h;
  $('#viewCount').textContent = anzahl ? `${anzahl} ${anzahl === 1 ? 'Eintrag' : 'Einträge'}` : '';
  symboleEinsetzen(w);
}

function kachelHtml(e) {
  if (e.bereich === 'web') {
    return `<article class="kachel web${e.kern ? ' fest' : ''}" data-id="${esc(e.id)}" tabindex="0" data-tip="${esc(e.url)}">
      <div class="k-kopf"><span class="mono web">${esc(e.kuerzel || kuerzel(kurzName(e)))}</span>
        <div class="k-titel"><b>${esc(kurzName(e))}</b><small>${esc(host(e.url))}${browserKurz(e) ? ` · <span data-tip="Öffnet in ${esc(browserText(e.browser))}">${esc(browserKurz(e))}</span>` : ''}</small></div>
        <button class="icon-btn klein mehr-btn" data-a="mehr" aria-label="Mehr">${ico('mehr')}</button></div></article>`;
  }
  const st = S.status[e.id] || { z: 'aus' };
  const z = st.z;
  const s = e.start || {};
  const pb = portBelegung();
  let unter = '';
  if (s.art === 'bat') { const t = s.pfad.split('\\'); unter = t.slice(-2).join('\\'); }
  else if (s.art === 'docker') unter = 'Docker · ' + s.container;
  else if (s.art === 'befehl') unter = (s.befehl[0] || '').split('\\').pop();
  else unter = 'Kein Start hinterlegt';
  const zText = { laeuft: 'läuft', startet: 'startet …', stoppt: 'stoppt …', aus: 'aus' }[z] || z;
  const meta = [];
  if (e.port) {
    const andere = (pb[e.port] || []).filter(n => n !== e.name);
    meta.push(`<span class="${andere.length ? 'warn' : ''}" ${andere.length ? `data-tip="Port ${e.port} nutzt auch: ${esc(andere.join(', '))}"` : ''}>:${e.port}</span>`);
  }
  if (s.art === 'docker') meta.push(`<span>${ico('box')}Docker</span>`);
  if (e.fenster === 'sichtbar') meta.push(`<span data-tip="Startet in einem sichtbaren Fenster (für Menüs/Eingaben)">${ico('auge')}Fenster</span>`);
  if (e.browser?.art) meta.push(`<span data-tip="Öffnet in ${esc(browserText(e.browser))}">${ico('globus')}${esc(browserKurz(e))}</span>`);
  if (e.eingerichtet) meta.push(`<span data-tip="Eingerichtet am">${ico('uhr')}${datum(e.eingerichtet)}</span>`);
  let knoepfe;
  if (z === 'startet' || z === 'stoppt') knoepfe = `<button class="btn klein" disabled><span class="spin"></span>${z === 'startet' ? 'Startet' : 'Stoppt'}</button>`;
  else if (z === 'laeuft') knoepfe = (e.url ? `<button class="btn primaer klein" data-a="oeffnen">${ico('oeffnen')}Öffnen</button>` : '')
    + `<button class="btn gefahr klein" data-a="stopp">${ico('stopp')}Stoppen</button>`;
  else if (s.art === 'keiner') knoepfe = `<button class="btn klein" data-a="bearbeiten">${ico('stift')}Start nachtragen</button>`;
  else if (e.ticket) knoepfe = `<button class="btn primaer klein" data-a="start" data-tip="Startet nur mit Ticket: öffnet die Freigabe in der Academy">${ico('play')}Starten</button>`;
  else knoepfe = `<button class="btn primaer klein" data-a="start">${ico('play')}Starten</button>`;
  return `<article class="kachel prog ${z}${e.kern ? ' fest' : ''}" data-id="${esc(e.id)}">
    <div class="k-kopf"><span class="mono">${esc(e.kuerzel || kuerzel(kurzName(e)))}</span>
      <div class="k-titel"><b>${esc(kurzName(e))}</b><small data-tip="${esc(s.pfad || unter)}">${esc(unter)}</small></div>
      <span class="zustand"><span class="punkt"></span>${zText}</span></div>
    ${e.beschreibung ? `<p class="k-text">${esc(e.beschreibung)}</p>` : ''}
    ${st.info ? `<p class="k-info">${esc(st.info)}</p>` : ''}
    <div class="k-meta">${meta.join('')}</div>
    <div class="k-knoepfe">${knoepfe}<span class="rechts">
      ${e.url && z !== 'laeuft' ? `<button class="icon-btn klein" data-a="oeffnen" data-tip="Adresse öffnen: ${esc(e.url)}">${ico('oeffnen')}</button>` : ''}
      <button class="icon-btn klein" data-a="log" data-tip="Protokoll (Ausgabe des Starters)">${ico('text')}</button>
      <button class="icon-btn klein" data-a="mehr" aria-label="Mehr" data-tip="Bearbeiten, verschieben, Ordner öffnen, entfernen">${ico('mehr')}</button></span></div>
  </article>`;
}

let laufAlt = '';
function laufZeichnen() {
  const l = sortiert(S.eintraege.filter(e => e.bereich === 'programme' && zustand(e) !== 'aus'));
  $('#laufLeiste').classList.toggle('hidden', !l.length);
  $('#laufZahl').textContent = l.length || '';
  const h = l.map(e => {
    const z = zustand(e);
    const tip = z === 'laeuft' ? (e.url ? 'Klick: öffnen' : 'Klick: zur Kachel') + ' · Rechtsklick: mehr' : z === 'startet' ? 'startet …' : 'stoppt …';
    return `<button class="lauf-btn ${z}" data-id="${esc(e.id)}" data-tip="${esc(tip)}"><span class="punkt"></span><span class="name">${esc(e.kern ? 'Academy · ' + kurzName(e) : e.name)}</span>`
      + (z === 'laeuft' ? `<span class="x" data-a="stopp" data-tip="Stoppen">${ico('x')}</span>` : '') + '</button>';
  }).join('');
  if (h !== laufAlt) { laufAlt = h; $('#laufListe').innerHTML = h; }
}

function zurKachel(e) {
  let k = $(`#wand .kachel[data-id="${CSS.escape(e.id)}"]`);
  if (!k) { S.filter = ''; ansicht({ art: 'ordner', ordner: e.ordner }); k = $(`#wand .kachel[data-id="${CSS.escape(e.id)}"]`); }
  if (!k) return;
  k.scrollIntoView({ block: 'center', behavior: 'smooth' });
  k.classList.remove('blitz'); void k.offsetWidth; k.classList.add('blitz');
}

function laufMenue(e, anker) {
  const l = [];
  if (e.url) l.push(['oeffnen', 'Öffnen', () => aktion(e, 'oeffnen')]);
  l.push(['raster', 'Zur Kachel', () => zurKachel(e)], ['text', 'Protokoll anzeigen', () => logZeigen(e)], null,
    ['stopp', 'Stoppen', () => aktion(e, 'stopp'), false, 'gefahr']);
  popZeigen(anker, l, e.name);
}

// Eigene Reihenfolge: Eintrag vor „vor“ (oder ans Ende) im Ordner einsortieren – auch aus einem anderen Ordner
async function anordnen(id, ordner, vor) {
  const e = eintrag(id);
  if (!e || vor === id) return;
  const ordnung = {};
  for (const o of ordnerVon(e.bereich)) {
    const l = sortiert(S.eintraege.filter(x => x.ordner === o.id && x.id !== id)).map(x => x.id);
    if (o.id === ordner) { const i = vor ? l.indexOf(vor) : -1; l.splice(i < 0 ? l.length : i, 0, id); }
    ordnung[o.id] = l;
  }
  for (const [oid, ids] of Object.entries(ordnung)) ids.forEach((x, i) => { const y = eintrag(x); if (y) { y.ordner = oid; y.rang = i; } });
  const war = S.einst.sortierung;
  S.einst.sortierung = 'eigen';
  kopfZeichnen(); railZeichnen(); wandZeichnen(); laufZeichnen();
  try {
    await api('anordnen', { bereich: e.bereich, ordnung });
    if (war !== 'eigen') toast('Eigene Reihenfolge ist jetzt aktiv. „Neueste“ oder „A–Z“ oben sortiert wieder automatisch.');
  } catch (err) { fehler(err); await laden(); }
}

// Fester Abschnitt (Übersicht): eigene Reihenfolge, gemischt Programme und Seiten – liegt in den Einstellungen.
async function festAnordnen(id, vor) {
  if (vor === id) return;
  const l = S.eintraege.filter(x => x.kern).sort(festFolge).map(x => x.id).filter(x => x !== id);
  const i = vor ? l.indexOf(vor) : -1;
  l.splice(i < 0 ? l.length : i, 0, id);
  const alt = S.einst.feste_folge;
  S.einst.feste_folge = l;
  wandZeichnen();
  try { await api('einstellungen', { einstellungen: { feste_folge: l } }); } catch (err) { S.einst.feste_folge = alt; wandZeichnen(); fehler(err); }
}

async function ordnerVerschieben(id, zielId, nach) {
  if (id === zielId) return;
  const ids = S.ordner.map(o => o.id).filter(x => x !== id);
  let i = ids.indexOf(zielId);
  if (i < 0) return;
  ids.splice(i + (nach ? 1 : 0), 0, id);
  S.ordner.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
  railZeichnen(); wandZeichnen();
  try { await api('ordner_reihenfolge', { ids }); } catch (e) { fehler(e); await laden(); }
}

async function ohneZeichnen() {
  const w = $('#wand');
  if (!S.ohneListe) {
    w.innerHTML = '<div class="leer"><div class="gross"><span class="spin"></span></div><p>Ordner werden gelesen …</p></div>';
    try { S.ohneListe = (await api('ohne')).liste; } catch (e) { fehler(e); return; }
    S.ohne = S.ohneListe.length;
    railZeichnen();
    if (S.ansicht.art !== 'ohne') return;
  }
  const l = S.ohneListe;
  $('#viewCount').textContent = l.length ? `${l.length} Ordner` : '';
  let h = `<div class="hinweisband">${ico('frage')}<span>Ordner aus ${esc((S.einst.programmordner || []).join(', '))}, die noch nicht im Cockpit stehen – zuletzt eingerichtete zuerst. „Integrieren“ lässt das LLM-Werkzeug den Ordner lesen; fehlt ein Starter, fragt es nach der Adresse.</span></div>`;
  if (!l.length) h += `<div class="leer"><div class="gross">${ico('haken')}</div><h3>Alles im Cockpit</h3><p>Jeder Programmordner hat einen Eintrag oder ist ausgeblendet.</p></div>`;
  else h += `<div class="raster">${l.map(o => `<article class="kachel ohne" data-pfad="${esc(o.pfad)}">
      <div class="k-kopf"><span class="mono web">${esc(kuerzel(o.name))}</span><div class="k-titel"><b>${esc(o.name)}</b><small>${esc(o.pfad)}</small></div></div>
      <div class="k-meta"><span>${ico('uhr')}${datum(o.eingerichtet)}</span>${o.starter.length ? o.starter.slice(0, 3).map(s => `<span>${esc(s)}</span>`).join('') : `<span class="warn">${ico('warn')}kein Starter</span>`}</div>
      <div class="k-knoepfe"><button class="btn primaer klein" data-a="integrieren">${ico('zauber')}Integrieren</button><span class="rechts"><button class="btn klein" data-a="ignorieren" data-tip="Nicht mehr anzeigen (in den Einstellungen zurückholbar)">${ico('auge_zu')}Ausblenden</button></span></div></article>`).join('')}</div>`;
  w.innerHTML = h;
}

function panelStatusZeichnen() {
  const m = S.einst.llm_modell || 'sonnet';
  $('#panelStatus').innerHTML = S.einst.llm === false
    ? `<span class="punkt"></span>LLM ausgeschaltet – Vorschläge nur nach Regeln`
    : S.claude ? `<span class="punkt an"></span>Claude-CLI bereit · Modell ${esc(m)} · Abo, ohne Werkzeuge`
      : `<span class="punkt"></span>Claude-CLI nicht gefunden – Vorschläge nur nach Regeln`;
  $('#llmName').textContent = S.einst.llm === false || !S.claude ? 'nach Regeln' : 'Claude ' + m;
  $('#llmHinweis').innerHTML = `${ico('frage')}<span>Pfad im Explorer: Umschalt + Rechtsklick › „Als Pfad kopieren“</span>`;
  $('#llmHinweis').dataset.tip = 'An Claude gehen nur Auszüge aus Programmdateien (Starter, README, package.json, docker-compose). Zeilen mit Schlüsseln/Passwörtern werden vorher entfernt, .env-Werte nie gelesen.';
}

// ------------------------------------------------------------------ Ansicht wechseln
function ansicht(neu) {
  S.ansicht = neu;
  speicher.setz('ansicht', neu);
  if (neu.art === 'ohne') S.ohneListe = null;
  S.suche = '';
  $('#suche').value = '';
  kopfZeichnen();
  railZeichnen();
  wandZeichnen();
  $('#wand').scrollTop = 0;
}

// ------------------------------------------------------------------ Aktionen
async function aktion(e, was, knopf) {
  try {
    if (was === 'start') {
      knopf && (knopf.disabled = true);
      const d = await api('starten', { id: e.id });
      if (!e.ticket) S.status[e.id] = { z: d.meldung.startsWith('Läuft') ? 'laeuft' : 'startet', info: '' };
      toast(`${e.name}: ${d.meldung}`);
      kachelNeu(e);
    } else if (was === 'stopp') {
      await api('stoppen', { id: e.id });
      S.status[e.id] = { z: 'stoppt', info: '' };
      kachelNeu(e);
    } else if (was === 'oeffnen') {
      await api('oeffnen', { id: e.id });
    } else if (was === 'log') {
      logZeigen(e);
    } else if (was === 'bearbeiten') {
      bearbeiten(e);
    }
  } catch (err) { fehler(err); laden().catch(() => {}); }
}
function kachelNeu(e) {
  const el = $(`.kachel[data-id="${CSS.escape(e.id)}"]`);
  if (el) el.outerHTML = kachelHtml(e);
  railZeichnen(); kontoZeichnen(); laufZeichnen();
}

function mehrMenue(e, anker) {
  const prog = e.bereich === 'programme';
  const eintraege = [['stift', 'Bearbeiten', () => bearbeiten(e)], ['globus', 'Browser & Profil …', () => browserDialog(e)]];
  if (!e.kern) eintraege.push(['pfeil', 'In Ordner verschieben', () => verschiebenMenue(e, anker), true]);
  if (e.url) eintraege.push(['oeffnen', 'Adresse öffnen', () => aktion(e, 'oeffnen')]);
  if (prog) {
    eintraege.push(['text', 'Protokoll anzeigen', () => logZeigen(e)]);
    if (e.start?.art !== 'docker') eintraege.push([e.fenster === 'sichtbar' ? 'auge_zu' : 'auge', e.fenster === 'sichtbar' ? 'Künftig unsichtbar starten' : 'Künftig im Fenster starten', () => speichern({ ...e, fenster: e.fenster === 'sichtbar' ? 'versteckt' : 'sichtbar' }, 'Gespeichert.')]);
    if (e.start?.pfad || e.ordnerpfad) eintraege.push(['ordner', 'Im Explorer zeigen', () => api('explorer', { id: e.id }).catch(fehler)]);
  }
  if (!e.kern) eintraege.push(null, ['muell', 'Aus dem Cockpit entfernen', () => entfernen(e), false, 'gefahr']);
  popZeigen(anker, eintraege, e.kern ? 'Fest eingetragen' : '');
}

function verschiebenMenue(e, anker) {
  const liste = ordnerVon(e.bereich).map(o => [o.id === e.ordner ? 'haken' : 'ordner', o.name, () => verschieben(e.id, o.id)]);
  liste.push(null, ['ordnerPlus', 'Neuer Ordner …', async () => { const id = await neuerOrdner(e.bereich); if (id) verschieben(e.id, id); }]);
  popZeigen(anker, liste, `In Ordner verschieben`);
}

async function verschieben(id, ordner) {
  try {
    await api('verschieben', { id, ordner });
    const e = eintrag(id); if (e) e.ordner = ordner;
    railZeichnen(); wandZeichnen();
    toast('Verschoben.', 'ok');
  } catch (err) { fehler(err); }
}

async function entfernen(e) {
  if (!await bestaetigen(`„${e.name}“ entfernen?`, 'Nur der Eintrag im Cockpit verschwindet. Das Programm und seine Dateien bleiben unangetastet.', 'Entfernen')) return;
  try { await api('eintrag_loeschen', { id: e.id }); toast('Entfernt.'); await laden(); } catch (err) { fehler(err); }
}

async function speichern(e, meldung) {
  try {
    const d = await api('eintrag', { eintrag: e });
    toast(meldung || 'Gespeichert.', 'ok');
    await laden();
    return d.eintrag;
  } catch (err) { fehler(err); return null; }
}

function ordnerMenue(o, anker) {
  if (o.fest) { toast(`„${o.name}“ ist fest eingetragen und steht immer oben.`); return; }
  const nachbarn = ordnerVon(o.bereich);
  const i = nachbarn.findIndex(x => x.id === o.id);
  const schieben = [];
  if (i > 0) schieben.push(['hoch', 'Nach oben', () => ordnerVerschieben(o.id, nachbarn[i - 1].id, false)]);
  if (i < nachbarn.length - 1) schieben.push(['runter', 'Nach unten', () => ordnerVerschieben(o.id, nachbarn[i + 1].id, true)]);
  popZeigen(anker, [
    ...schieben,
    ['stift', 'Umbenennen', async () => {
      const name = await eingabe('Ordner umbenennen', 'Neuer Name', o.name);
      if (name) { try { await api('ordner', { id: o.id, name }); await laden(); } catch (e) { fehler(e); } }
    }],
    null,
    ['muell', 'Ordner löschen', async () => {
      const n = S.eintraege.filter(e => e.ordner === o.id).length;
      if (!await bestaetigen(`Ordner „${o.name}“ löschen?`, n ? `Die ${n} Einträge darin wandern in den ersten Ordner dieses Bereichs.` : 'Der Ordner ist leer.', 'Löschen')) return;
      try { await api('ordner_loeschen', { id: o.id }); if (S.ansicht.ordner === o.id) S.ansicht = { art: 'uebersicht' }; await laden(); } catch (e) { fehler(e); }
    }, false, 'gefahr'],
  ], o.name);
}

async function neuerOrdner(bereich) {
  const name = await eingabe(bereich === 'web' ? 'Neuer Web-Ordner' : 'Neuer Programm-Ordner', 'Name des Ordners', '');
  if (!name) return null;
  try {
    const d = await api('ordner', { name, bereich });
    S.offen[bereich] = true; speicher.setz('offen', S.offen);
    await laden();
    return d.id;
  } catch (e) { fehler(e); return null; }
}

// ------------------------------------------------------------------ Protokoll
let logUhr = null;
async function logZeigen(e) {
  modalOeffnen(`<h3>Protokoll · ${esc(e.name)}</h3><p class="unter">Ausgabe des Starters – statt eines Terminalfensters landet sie hier.</p>
    <pre class="log" id="logText">Lädt …</pre><p class="log-pfad" id="logPfad"></p>
    <div class="knoepfe"><button class="btn" data-m="leeren">${ico('muell')}Leeren</button><button class="btn" data-m="explorer">${ico('ordner')}Programmordner</button><button class="btn primaer" data-m="zu">Schließen</button></div>`, 'breit');
  const holen = async () => {
    try {
      const d = await api('log?id=' + encodeURIComponent(e.id));
      const pre = $('#logText');
      if (!pre) return;
      const unten = pre.scrollHeight - pre.scrollTop - pre.clientHeight < 40;
      pre.textContent = d.text || '(noch keine Ausgabe – das Programm wurde seit der Einrichtung nicht über das Cockpit gestartet)';
      $('#logPfad').textContent = d.pfad;
      if (unten) pre.scrollTop = pre.scrollHeight;
    } catch (err) { fehler(err); }
  };
  await holen();
  $('#logText').scrollTop = 1e9;
  logUhr = setInterval(holen, 2000);
  $('#modalCard').onclick = async ev => {
    const m = ev.target.closest('[data-m]')?.dataset.m;
    if (m === 'zu') modalZu();
    if (m === 'leeren') { await api('log_leeren', { id: e.id }).catch(fehler); holen(); }
    if (m === 'explorer') api('explorer', { id: e.id }).catch(fehler);
  };
}

// ------------------------------------------------------------------ Formular (Vorschlag & Bearbeiten)
function formularHtml(v, extra = {}) {
  const bereich = v.bereich || 'programme';
  const s = v.start || { art: 'keiner' };
  const st = v.stopp || { art: 'auto' };
  const fragen = (v.fragen || []).join(' ');
  const fehlt = feld => (feld === 'start' && s.art === 'keiner') || (feld === 'url' && /Adresse|Port/i.test(fragen) && !v.url);
  const ordnerOpt = b => ordnerVon(b).map(o => `<option value="${esc(o.id)}" ${o.id === v.ordner ? 'selected' : ''}>${esc(o.name)}</option>`).join('');
  const starterOpt = (extra.starter || []).map(x => `<option value="${esc(x.pfad)}">`).join('');
  const contOpt = (extra.container || S.container || []).map(c => `<option value="${esc(c)}">`).join('');
  const lid = 'l' + Math.random().toString(36).slice(2, 8);
  return `<div class="formular ${extra.eng ? 'eng' : ''}" data-bereich="${bereich}">
    <div class="feld"><label>Bereich</label><select name="bereich"><option value="programme" ${bereich === 'programme' ? 'selected' : ''}>Lokales Programm</option><option value="web" ${bereich === 'web' ? 'selected' : ''}>Web-Seite</option></select></div>
    <div class="feld"><label>Ordner</label><select name="ordner" data-b="programme" ${bereich !== 'programme' ? 'hidden' : ''}>${ordnerOpt('programme')}<option value="__neu">＋ Neuer Ordner …</option></select><select name="ordner_w" data-b="web" ${bereich !== 'web' ? 'hidden' : ''}>${ordnerOpt('web')}<option value="__neu">＋ Neuer Ordner …</option></select>
      <input name="ordner_name" placeholder="Name des neuen Ordners" value="${esc(v.ordner_name || '')}" ${v.ordner_name ? '' : 'hidden'}></div>
    <div class="feld voll"><label>Name</label><input name="name" value="${esc(v.name || '')}" maxlength="80"></div>
    <div class="feld voll"><label>Beschreibung</label><input name="beschreibung" value="${esc(v.beschreibung || '')}" maxlength="300" placeholder="Ein Satz, was das Programm tut"></div>
    <div class="feld voll ${fehlt('url') ? 'fehlt' : ''}"><label>Adresse zum Öffnen</label><input name="url" value="${esc(v.url || '')}" placeholder="http://127.0.0.1:3000/"></div>
    ${browserFelder(v.browser, v)}
    <div class="feld ${fehlt('start') ? 'fehlt' : ''}" data-nur="programme"><label>Start</label><select name="start_art">
      ${[['bat', '.bat-Datei'], ['docker', 'Docker-Container'], ['befehl', 'Befehl'], ['keiner', '– noch keiner –']].map(([k, t]) => `<option value="${k}" ${s.art === k ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
    <div class="feld" data-nur="programme"><label>Port</label><input name="port" inputmode="numeric" value="${esc(v.port ?? '')}" placeholder="z. B. 8787"><small>Daran erkennt das Cockpit „läuft“.</small></div>
    <div class="feld voll" data-nur="programme" data-art="bat"><label>.bat-Datei</label><input name="start_pfad" list="${lid}s" value="${esc(s.pfad || '')}" placeholder="D:\\…\\START.bat"><datalist id="${lid}s">${starterOpt}</datalist></div>
    <div class="feld voll" data-nur="programme" data-art="docker"><label>Docker-Container</label><input name="start_container" list="${lid}c" value="${esc(s.container || '')}" placeholder="z. B. mirofish"><datalist id="${lid}c">${contOpt}</datalist></div>
    <div class="feld voll" data-nur="programme" data-art="befehl"><label>Befehl (je Zeile ein Teil: Programm, dann Argumente)</label><textarea name="start_befehl" rows="3">${esc((s.befehl || []).join('\n'))}</textarea></div>
    <div class="feld" data-nur="programme"><label>Beenden</label><select name="stopp_art">
      ${[['auto', 'Automatisch (Prozesse/Port)'], ['bat', 'Eigene Stopp-.bat'], ['befehl', 'Eigener Befehl']].map(([k, t]) => `<option value="${k}" ${st.art === k ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
    <div class="feld" data-nur="programme"><label>Fenster</label><select name="fenster"><option value="versteckt" ${v.fenster !== 'sichtbar' ? 'selected' : ''}>Unsichtbar (Protokoll im Cockpit)</option><option value="sichtbar" ${v.fenster === 'sichtbar' ? 'selected' : ''}>Sichtbar (für Menüs/Eingaben)</option></select></div>
    <div class="feld voll" data-nur="programme" data-stopp="bat"><label>Stopp-.bat</label><input name="stopp_pfad" list="${lid}s" value="${esc(st.pfad || '')}"></div>
    <div class="feld voll" data-nur="programme" data-stopp="befehl"><label>Stopp-Befehl (je Zeile ein Teil)</label><textarea name="stopp_befehl" rows="2">${esc((st.befehl || []).join('\n'))}</textarea></div>
    <label class="haken-zeile voll" data-nur="programme"><input type="checkbox" name="auto_oeffnen" ${v.auto_oeffnen ? 'checked' : ''}> Nach dem Start automatisch öffnen <small>(sobald der Port antwortet – nicht nötig, wenn die .bat selbst den Browser öffnet)</small></label>
  </div>`;
}

function formularVerdrahten(f) {
  const aktualisieren = () => {
    const bereich = $('[name=bereich]', f).value;
    f.dataset.bereich = bereich;
    $$('[data-nur]', f).forEach(x => { x.hidden = x.dataset.nur !== bereich; });
    $('[name=ordner]', f).hidden = bereich !== 'programme';
    $('[name=ordner_w]', f).hidden = bereich !== 'web';
    const art = $('[name=start_art]', f).value;
    $$('[data-art]', f).forEach(x => { if (bereich === 'programme') x.hidden = x.dataset.art !== art; });
    const sa = $('[name=stopp_art]', f).value;
    $$('[data-stopp]', f).forEach(x => { if (bereich === 'programme') x.hidden = x.dataset.stopp !== sa || art === 'docker'; });
    $('[name=stopp_art]', f).closest('.feld').hidden = bereich !== 'programme' || art === 'docker';
    const os = bereich === 'web' ? $('[name=ordner_w]', f) : $('[name=ordner]', f);
    $('[name=ordner_name]', f).hidden = os.value !== '__neu' && !$('[name=ordner_name]', f).value;
  };
  f.addEventListener('change', ev => {
    if (ev.target.matches('[name=ordner],[name=ordner_w]') && ev.target.value === '__neu') { const n = $('[name=ordner_name]', f); n.hidden = false; n.focus(); }
    if (ev.target.matches('[name=ordner],[name=ordner_w]') && ev.target.value !== '__neu') $('[name=ordner_name]', f).value = '';
    aktualisieren();
  });
  browserVerdrahten(f);
  aktualisieren();
}

function formularLesen(f, basis = {}) {
  const w = n => ($(`[name=${n}]`, f)?.value || '').trim();
  const zeilen = n => w(n).split(/\r?\n/).map(x => x.trim()).filter(Boolean);
  const bereich = w('bereich');
  const ordner = bereich === 'web' ? w('ordner_w') : w('ordner');
  const e = { ...basis, bereich, name: w('name'), beschreibung: w('beschreibung'), url: w('url'), browser: browserLesen(f) };
  if (ordner === '__neu' || w('ordner_name')) e.ordner_name = w('ordner_name') || 'Neuer Ordner';
  else { e.ordner = ordner; delete e.ordner_name; }
  if (bereich === 'programme') {
    const art = w('start_art');
    e.start = art === 'bat' ? { art, pfad: w('start_pfad') } : art === 'docker' ? { art, container: w('start_container') }
      : art === 'befehl' ? { art, befehl: zeilen('start_befehl') } : { art: 'keiner' };
    const sa = w('stopp_art');
    e.stopp = art === 'docker' ? { art: 'docker' } : sa === 'bat' ? { art: 'bat', pfad: w('stopp_pfad') } : sa === 'befehl' ? { art: 'befehl', befehl: zeilen('stopp_befehl') } : { art: 'auto' };
    e.port = w('port') ? Number(w('port')) : null;
    e.fenster = w('fenster');
    e.auto_oeffnen = $('[name=auto_oeffnen]', f).checked;
  }
  return e;
}

async function bearbeiten(e) {
  if (!S.container.length && e.bereich === 'programme') api('container').then(d => { S.container = d.container || []; }).catch(() => {});
  modalOeffnen(`<h3>${esc(e.name)} bearbeiten</h3><p class="unter">${e.bereich === 'web' ? 'Web-Seite' : 'Lokales Programm'} · eingerichtet ${datum(e.eingerichtet)}</p>
    <form id="bearbForm">${formularHtml(e)}</form>
    <div class="knoepfe"><button class="btn" data-m="zu">Abbrechen</button><button class="btn primaer" data-m="ok">${ico('haken')}Speichern</button></div>`, 'breit');
  const f = $('#bearbForm');
  formularVerdrahten(f);
  f.onsubmit = ev => ev.preventDefault();
  $('#modalCard').onclick = async ev => {
    const m = ev.target.closest('[data-m]')?.dataset.m;
    if (m === 'zu') modalZu();
    if (m === 'ok') { const neu = await speichern(formularLesen(f, { id: e.id }), 'Gespeichert.'); if (neu) modalZu(); }
  };
}

// Nur Browser und Profil einer Karte – schneller als das ganze Bearbeiten-Formular.
function browserDialog(e) {
  modalOeffnen(`<h3>Browser &amp; Profil · ${esc(kurzName(e))}</h3><p class="unter">In welchem Browser und mit welchem Profil sich diese Karte öffnet – z. B. das Profil, in dem du schon angemeldet bist.</p>
    <form id="browserForm" class="formular">${browserFelder(e.browser, e)}</form>
    ${e.ticket_ueber ? `<p class="unter">Die Freigabe in der Academy öffnet sich im selben Browser – ohne eigene Wahl gilt die der Karte „${esc(kurzName(eintrag(e.ticket_ueber) || { name: 'Academy' }))}“.</p>` : ''}
    <div class="knoepfe"><button class="btn" data-m="zu">Abbrechen</button><button class="btn primaer" data-m="ok">${ico('haken')}Speichern</button></div>`);
  const f = $('#browserForm');
  browserVerdrahten(f);
  f.onsubmit = ev => ev.preventDefault();
  $('#modalCard').onclick = async ev => {
    const m = ev.target.closest('[data-m]')?.dataset.m;
    if (m === 'zu') modalZu();
    if (m === 'ok') { const b = browserLesen(f); if (await speichern({ ...e, browser: b }, b.art ? `Öffnet jetzt in ${browserText(b)}.` : 'Öffnet wie in den Einstellungen.')) modalZu(); }
  };
}

// ------------------------------------------------------------------ LLM-Werkzeug „Integrieren“
function panel(auf = true) {
  $('#seitenchat').classList.toggle('zu', !auf);
  $('#btnPanel').classList.toggle('an', auf);
  if (auf && !$('#panelInhalt').children.length) panelLeer();
}
function panelLeer() {
  $('#panelInhalt').innerHTML = `<div class="cleer">${ico('zauber')}<h4>Programm integrieren</h4>
    <p>Unten einen Link einfügen – einen Programmordner, eine .bat-Datei oder eine Adresse wie <b>http://127.0.0.1:3000/</b>. Das Werkzeug liest Starter, Ports und README, erkennt Docker-Container zum Port und schlägt den Eintrag vor. Was fehlt, fragt es nach.</p></div>`;
}

async function integrieren() {
  const roh = $('#link').value.trim();
  if (!roh) { $('#link').focus(); return toast('Bitte einen Link einfügen.'); }
  const links = [...new Set(roh.split(/\r?\n/).map(x => x.trim()).filter(Boolean))].slice(0, 10);
  panel(true);
  $('.cleer', $('#panelInhalt'))?.remove();
  $('#link').value = ''; groesse();
  const knopf = $('#btnIntegrieren');
  knopf.disabled = true;
  try {
    for (const link of links) await einLink(link);
  } finally { knopf.disabled = false; }
}

async function einLink(link) {
  const box = $('#panelInhalt');
  const nr = ++S.panelZahl;
  box.insertAdjacentHTML('beforeend', `<div class="cblase">${esc(link)}</div><div class="ckarte" id="vk${nr}"><div class="laden"><span class="spin"></span>Liest den Ordner, sucht Starter und Ports${S.claude && S.einst.llm !== false ? ', fragt Claude' : ''} …</div></div>`);
  box.scrollTop = box.scrollHeight;
  const k = $('#vk' + nr);
  let d;
  try { d = await api('analysieren', { link }); } catch (e) { k.classList.add('fehler'); k.textContent = e.message; return; }
  S.container = d.container || S.container;
  const v = d.vorschlag;
  if (S.zielBereich) v.bereich = S.zielBereich;
  if (v.bereich === 'web' && !v.url) v.url = link;
  k.innerHTML = `<div class="ckopf">${ico('zauber')}Vorschlag <span>· ${d.llm ? 'mit Claude' : 'nach Regeln'}</span></div>
    <ul class="schritte">${d.schritte.map(s => `<li>${ico('haken')}<span>${esc(s)}</span></li>`).join('')}</ul>
    ${v.fragen?.length ? `<div class="fragen">${v.fragen.map(q => `<p>${esc(q)}</p>`).join('')}</div>` : ''}
    <form>${formularHtml(v, { starter: d.starter, container: d.container, eng: true })}</form>
    <div class="knoepfe"><button class="btn klein" data-m="weg">Verwerfen</button><button class="btn primaer klein" data-m="ok">${ico('haken')}Übernehmen</button></div>`;
  const f = $('form', k);
  formularVerdrahten(f);
  f.onsubmit = ev => ev.preventDefault();
  k.onclick = async ev => {
    const m = ev.target.closest('[data-m]')?.dataset.m;
    if (m === 'weg') { k.previousElementSibling?.remove(); k.remove(); if (!box.children.length) panelLeer(); }
    if (m === 'ok') {
      const roh = formularLesen(f, { eingerichtet: v.eingerichtet, ordnerpfad: v.ordnerpfad });
      const e = await speichern(roh, `„${roh.name}“ ist jetzt im Cockpit.`);
      if (!e) return;
      S.ohneListe = null;
      const o = S.ordner.find(x => x.id === e.ordner);
      k.classList.add('fertig');
      k.innerHTML = `<div class="ckopf">${ico('haken')}Übernommen <span>· ${esc(o?.name || '')}</span></div>
        <div class="k-kopf"><span class="mono ${e.bereich === 'web' ? 'web' : ''} klein">${esc(kuerzel(e.name))}</span><div class="k-titel"><b>${esc(e.name)}</b><small>${esc(e.bereich === 'web' ? host(e.url) : (e.start?.pfad || e.start?.container || ''))}</small></div></div>
        <div class="knoepfe"><button class="btn klein" data-z="zeigen">${ico('ordner')}Im Ordner zeigen</button>${e.bereich === 'programme' && e.start?.art !== 'keiner' ? `<button class="btn primaer klein" data-z="start">${ico('play')}Starten</button>` : e.url ? `<button class="btn primaer klein" data-z="oeffnen">${ico('oeffnen')}Öffnen</button>` : ''}</div>`;
      k.onclick = ev2 => {
        const z = ev2.target.closest('[data-z]')?.dataset.z;
        if (z === 'zeigen') ansicht({ art: 'ordner', ordner: e.ordner });
        if (z === 'start') aktion(eintrag(e.id) || e, 'start');
        if (z === 'oeffnen') aktion(e, 'oeffnen');
      };
    }
  };
  box.scrollTop = box.scrollHeight;
}

// ------------------------------------------------------------------ Einstellungen
function einstMenue(anker) {
  popZeigen(anker, [
    ['zahnrad', 'Einstellungen …', einstellungen],
    ['neu', 'Chrome-Favoriten neu einlesen', favoritenImport],
    ['ordner', 'Cockpit-Ordner öffnen', () => api('explorer', { id: '__cockpit__' }).catch(fehler)],
    null,
    ['strom', 'Cockpit beenden', async () => {
      if (!await bestaetigen(`${kurzTitel()} beenden?`, `Gestartete Programme laufen weiter. Neu starten mit ${S.profil.start_bat} oder beim nächsten Systemstart.`, 'Beenden')) return;
      await api('beenden', {}).catch(() => {});
      document.body.innerHTML = '<div class="leer"><h3>Cockpit beendet</h3><p>Dieses Fenster kann geschlossen werden.</p></div>';
    }, false, 'gefahr'],
  ], 'Cockpit');
}

async function favoritenImport() {
  try { const d = await api('favoriten_import', {}); toast(d.neu ? `${d.neu} neue Favoriten übernommen.` : 'Keine neuen Favoriten.', 'ok'); await laden(); } catch (e) { fehler(e); }
}

function einstellungen() {
  const e = S.einst;
  modalOeffnen(`<h3>Einstellungen</h3><p class="unter">Cockpit läuft auf http://127.0.0.1:${S.port} – nur auf diesem Rechner erreichbar, ohne Anmeldung.</p>
    <form id="einstForm">
      <label class="haken-zeile"><input type="checkbox" name="autostart" ${S.autostart ? 'checked' : ''}> Beim Systemstart automatisch starten <small>(Verknüpfung im Autostart-Ordner)</small></label>
      <label class="haken-zeile"><input type="checkbox" name="fenster_beim_start" ${e.fenster_beim_start ? 'checked' : ''}> Dabei das Cockpit-Fenster öffnen</label>
      ${S.profil.feste ? `<label class="haken-zeile"><input type="checkbox" name="feste_mitstarten" ${e.feste_mitstarten !== false ? 'checked' : ''}> ${esc(festName())} beim Start mitstarten <small>(ohne Fenster; Werkstatt und Cinema-Studio bleiben bei der Freigabe in der Academy)</small></label>` : ''}
      <div class="abschnitt"><h4>Farbfilter</h4>
        <div class="farbwahl" role="listbox" aria-label="Farbfilter">${Object.entries(PALETTEN).filter(([, p]) => !p.nurPartner).map(([k, p]) => {
          const probe = p.f ? [p.f[0], p.f[9], p.f[11]] : p.probe;
          return `<button type="button" class="farb-zeile ${k === (e.farbe || 'standard') ? 'an' : ''}" data-farbe="${k}" role="option" aria-selected="${k === (e.farbe || 'standard')}">
            <span class="farb-probe" data-probe="${probe.join(',')}"><i></i><i></i></span>
            <span class="farb-text"><b>${esc(p.name)}</b><small>${esc(p.was)}</small></span></button>`;
        }).join('')}</div>
        <small class="farb-hinweis">Hell oder dunkel stellt der ${ico('sonne')} Knopf oben um – er wechselt zur hellen Partnerpalette (Pergament oder Marmor).</small></div>
      <div class="abschnitt"><h4>Browser zum Öffnen</h4>
        <div class="formular" id="einstBrowser">${browserFelder({ art: e.browser || 'chrome', profil: e.browser_profil }, false)}</div>
        <small class="farb-hinweis">Gilt für jede Karte ohne eigene Wahl – je Karte unter ⋯ › Browser &amp; Profil. Werkstatt und Cinema-Studio übernehmen die Wahl der Academy-Karte.</small></div>
      <div class="abschnitt"><h4>Web-Seiten aus Chrome</h4>
        <div class="formular"><div class="feld"><label>Lesezeichen aus Chrome-Profil</label><select name="chrome_profil">${S.chromeProfile.map(p => { const q = profilVon('chrome', p); return `<option value="${esc(p)}" ${p === e.chrome_profil ? 'selected' : ''}>${esc(q ? profilLabel(q) : p)}</option>`; }).join('')}</select><small>Liest die Lesezeichen dieses Profils ein.</small></div>
        <div class="feld"><label>Lesezeichen-Ordner (je Zeile, mit / getrennt)</label><textarea name="favoriten" rows="3">${esc((e.favoriten || []).join('\n'))}</textarea></div></div>
        <button type="button" class="btn klein" data-m="import">${ico('neu')}Jetzt einlesen</button></div>
      <div class="abschnitt"><h4>Lokale Programme</h4>
        <div class="feld"><label>Programmordner (je Zeile) – Quelle für „Noch nicht im Cockpit“</label><textarea name="programmordner" rows="2">${esc((e.programmordner || []).join('\n'))}</textarea></div>
        ${S.ignoriert.length ? `<div class="feld"><span class="lbl">Ausgeblendete Ordner</span>${S.ignoriert.map(p => `<label class="haken-zeile"><input type="checkbox" name="zurueck" value="${esc(p)}"> ${esc(p)} <small>zurückholen</small></label>`).join('')}</div>` : ''}</div>
      <div class="abschnitt"><h4>LLM-Werkzeug</h4>
        <label class="haken-zeile"><input type="checkbox" name="llm" ${e.llm !== false ? 'checked' : ''}> Claude-CLI für Vorschläge nutzen <small>${S.claude ? '(gefunden)' : '(nicht gefunden – dann nur Regeln)'}</small></label>
        <div class="feld"><label>Modell</label><select name="llm_modell">${['sonnet', 'haiku', 'opus'].map(m => `<option ${m === e.llm_modell ? 'selected' : ''}>${m}</option>`).join('')}</select><small>Läuft über dein Claude-Abo, ohne Werkzeuge. Gesendet werden nur Auszüge aus Programmdateien; Zeilen mit Schlüsseln/Passwörtern werden vorher entfernt.</small></div>
        <div class="feld"><label>Claude-Konto</label><select name="claude_konfig"><option value="">Standard (angemeldetes Konto)</option>${S.claudeKonten.map(k => `<option value="${esc(k)}" ${k === e.claude_konfig ? 'selected' : ''}>${esc(k.split(/[\\/]/).pop())}</option>`).join('')}</select><small>Ist das Wochenlimit erreicht, hier z. B. das Zweit-Abo wählen.</small></div></div>
    </form>
    <div class="knoepfe"><button class="btn" data-m="zu">Abbrechen</button><button class="btn primaer" data-m="ok">${ico('haken')}Speichern</button></div>`, 'breit');
  const f = $('#einstForm');
  browserVerdrahten($('#einstBrowser'));
  // Farbproben über CSSOM: die CSP (style-src 'self') sperrt style-Attribute im Markup.
  $$('[data-probe]', f).forEach(el => { const [g, a, b] = el.dataset.probe.split(','); el.style.background = g; el.children[0].style.background = a; el.children[1].style.background = b; });
  $('#modalCard').onclick = async ev => {
    const m = ev.target.closest('[data-m]')?.dataset.m;
    if (m === 'zu') modalZu();
    if (m === 'import') favoritenImport();
    const fz = ev.target.closest('[data-farbe]');
    if (fz) { $$('.farb-zeile', f).forEach(x => { x.classList.toggle('an', x === fz); x.setAttribute('aria-selected', x === fz); }); farbeWaehlen({ farbe: fz.dataset.farbe }); }
    if (m === 'ok') {
      const zeilen = n => $(`[name=${n}]`, f).value.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
      try {
        for (const c of $$('[name=zurueck]:checked', f)) await api('ignorieren', { pfad: c.value, rueckgaengig: true });
        await api('einstellungen', { einstellungen: {
          autostart: $('[name=autostart]', f).checked, fenster_beim_start: $('[name=fenster_beim_start]', f).checked,
          ...($('[name=feste_mitstarten]', f) ? { feste_mitstarten: $('[name=feste_mitstarten]', f).checked } : {}),
          browser: browserLesen($('#einstBrowser')).art, browser_profil: browserLesen($('#einstBrowser')).profil || '',
          chrome_profil: $('[name=chrome_profil]', f).value, favoriten: zeilen('favoriten'), programmordner: zeilen('programmordner'),
          llm: $('[name=llm]', f).checked, llm_modell: $('[name=llm_modell]', f).value, claude_konfig: $('[name=claude_konfig]', f).value } });
        toast('Einstellungen gespeichert.', 'ok');
        modalZu(); S.ohneListe = null; await laden();
      } catch (err) { fehler(err); }
    }
  };
}

// ------------------------------------------------------------------ Menüs, Dialoge, Tooltip
function popZeigen(anker, eintraege, kopf = '') {
  const pop = $('#pop');
  pop.innerHTML = (kopf ? `<div class="kopf">${esc(kopf)}</div>` : '') + eintraege.map((x, i) => x === null ? '<div class="sep"></div>'
    : `<button class="eintrag ${x[4] || ''}" data-i2="${i}"><span class="ico">${ico(x[0])}</span><span>${esc(x[1])}</span>${x[3] ? `<span class="rechts">${ico('rechts')}</span>` : ''}</button>`).join('');
  pop.classList.remove('hidden');
  const r = anker.getBoundingClientRect();
  const pr = pop.getBoundingClientRect();
  let x = Math.min(r.left, innerWidth - pr.width - 8);
  let y = r.bottom + 6;
  if (y + pr.height > innerHeight - 8) y = Math.max(8, r.top - pr.height - 6);
  pop.style.left = Math.max(8, x) + 'px';
  pop.style.top = y + 'px';
  pop.onclick = ev => {
    const b = ev.target.closest('[data-i2]');
    if (!b) return;
    const x2 = eintraege[+b.dataset.i2];
    if (!x2[3]) popZu();
    x2[2]();
  };
  setTimeout(() => $('button', pop)?.focus(), 0);
}
const popZu = () => $('#pop').classList.add('hidden');

function modalOeffnen(html, art = '') {
  const c = $('#modalCard');
  c.className = 'modal-card ' + art;
  c.innerHTML = html;
  c.onclick = null;
  $('#modal').classList.remove('hidden');
  symboleEinsetzen(c);
  setTimeout(() => $('input:not([type=checkbox]),select,textarea', c)?.focus(), 30);
}
function modalZu() {
  $('#modal').classList.add('hidden');
  $('#modalCard').innerHTML = '';
  clearInterval(logUhr);
  modalAntwort?.(null);
  modalAntwort = null;
}
let modalAntwort = null;
function bestaetigen(titel, text, ja = 'OK') {
  return new Promise(res => {
    modalOeffnen(`<h3>${esc(titel)}</h3><p class="unter">${esc(text)}</p><div class="knoepfe"><button class="btn" data-m="nein">Abbrechen</button><button class="btn ${/Entfern|Lösch|Beend/.test(ja) ? 'gefahr' : 'primaer'}" data-m="ja">${esc(ja)}</button></div>`);
    modalAntwort = res;
    $('#modalCard').onclick = ev => {
      const m = ev.target.closest('[data-m]')?.dataset.m;
      if (!m) return;
      modalAntwort = null; modalZu(); res(m === 'ja');
    };
    setTimeout(() => $('[data-m=ja]')?.focus(), 40);
  });
}
function eingabe(titel, label, wert) {
  return new Promise(res => {
    modalOeffnen(`<h3>${esc(titel)}</h3><form id="eingForm"><div class="feld"><label>${esc(label)}</label><input name="w" value="${esc(wert)}" maxlength="40"></div>
      <div class="knoepfe"><button type="button" class="btn" data-m="nein">Abbrechen</button><button class="btn primaer" data-m="ja">OK</button></div></form>`);
    modalAntwort = res;
    const f = $('#eingForm');
    const fertig = ok => { const w = $('[name=w]', f).value.trim(); modalAntwort = null; modalZu(); res(ok && w ? w : null); };
    f.onsubmit = ev => { ev.preventDefault(); fertig(true); };
    $('#modalCard').onclick = ev => { const m = ev.target.closest('[data-m]')?.dataset.m; if (m === 'nein') fertig(false); };
    setTimeout(() => $('[name=w]', f)?.select(), 40);
  });
}

function tooltip() {
  const tip = $('#tip');
  let ziel = null;
  document.addEventListener('mouseover', ev => {
    const el = ev.target.closest('[data-tip]');
    if (el === ziel) return;
    ziel = el;
    if (!el || !el.dataset.tip) { tip.classList.remove('an'); return; }
    tip.textContent = el.dataset.tip;
    const r = el.getBoundingClientRect();
    tip.classList.add('an');
    const tr = tip.getBoundingClientRect();
    let y = r.bottom + 8;
    if (y + tr.height > innerHeight - 6) y = r.top - tr.height - 8;
    tip.style.left = Math.max(6, Math.min(r.left + r.width / 2 - tr.width / 2, innerWidth - tr.width - 6)) + 'px';
    tip.style.top = y + 'px';
  });
  document.addEventListener('mousedown', () => { tip.classList.remove('an'); ziel = null; });
}

function groesse() { const t = $('#link'); t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 150) + 'px'; }

// Spaltenbreiten: Menü links, Leiste „Läuft“, Panel „Integrieren“ – per Griff ziehbar, gemerkt im Browser
const BREITE = { rail: [268, 190, 440, 1], lauf: [184, 130, 380, -1], panel: [420, 320, 760, -1] };
function breiteSetzen(art, px) {
  const [std, min, max] = BREITE[art];
  const b = px == null ? std : Math.round(Math.min(max, Math.max(min, px)));
  document.documentElement.style.setProperty(`--${art}-b`, b + 'px');
  return b;
}
function spaltenVerdrahten() {
  const gemerkt = speicher.lies('breite', {});
  for (const art of Object.keys(BREITE)) if (gemerkt[art]) breiteSetzen(art, gemerkt[art]);
  let z = null;
  document.addEventListener('pointerdown', ev => {
    const g = ev.target.closest('[data-griff]');
    if (!g || ev.button !== 0) return;
    ev.preventDefault();
    const art = g.dataset.griff;
    z = { art, g, x: ev.clientX, b: g.parentElement.getBoundingClientRect().width };
    g.classList.add('an');
    document.body.classList.add('breite-ziehen');
  });
  document.addEventListener('pointermove', ev => {
    if (!z) return;
    z.neu = breiteSetzen(z.art, z.b + (ev.clientX - z.x) * BREITE[z.art][3]);
  });
  const ende = () => {
    if (!z) return;
    z.g.classList.remove('an');
    document.body.classList.remove('breite-ziehen');
    if (z.neu) { const m = speicher.lies('breite', {}); m[z.art] = z.neu; speicher.setz('breite', m); }
    z = null;
  };
  document.addEventListener('pointerup', ende);
  document.addEventListener('pointercancel', ende);
  document.addEventListener('dblclick', ev => {
    const g = ev.target.closest('[data-griff]');
    if (!g) return;
    breiteSetzen(g.dataset.griff, null);
    const m = speicher.lies('breite', {}); delete m[g.dataset.griff]; speicher.setz('breite', m);
  });
}

// ------------------------------------------------------------------ Ereignisse
function verdrahten() {
  symboleEinsetzen();
  spaltenVerdrahten();
  $('#btnThema').addEventListener('click', () => farbeWaehlen({ thema: document.documentElement.dataset.ton === 'hell' ? 'dunkel' : 'hell' }));
  tooltip();
  const rail = $('#rail');
  if (speicher.lies('railZu', false)) rail.classList.add('zu');
  $('#railToggle').onclick = () => { rail.classList.toggle('zu'); speicher.setz('railZu', rail.classList.contains('zu')); };

  $('#railNav').addEventListener('click', ev => {
    const auf = ev.target.closest('[data-auf]');
    if (auf) { ev.stopPropagation(); S.offen[auf.dataset.auf] = !S.offen[auf.dataset.auf]; speicher.setz('offen', S.offen); return railZeichnen(); }
    const neu = ev.target.closest('[data-neuordner]');
    if (neu) return neuerOrdner(neu.dataset.neuordner);
    const b = ev.target.closest('[data-nav]');
    if (!b) return;
    const n = b.dataset.nav;
    if (n === 'bereich') { S.offen[b.dataset.bereich] = true; speicher.setz('offen', S.offen); ansicht({ art: 'bereich', bereich: b.dataset.bereich }); }
    else if (n === 'ordner') ansicht({ art: 'ordner', ordner: b.dataset.ordner });
    else ansicht({ art: n });
  });
  $('#railNav').addEventListener('contextmenu', ev => {
    const b = ev.target.closest('[data-ordner]');
    if (!b) return;
    ev.preventDefault();
    const o = S.ordner.find(x => x.id === b.dataset.ordner);
    if (o) ordnerMenue(o, b);
  });

  // Ziehen & Ablegen mit Zeiger-Ereignissen (zuverlässiger als natives HTML5-Drag&Drop):
  // Kachel → andere Stelle (auch in anderen Ordner) oder auf einen Ordner im Menü; Menü-Ordner → nach oben/unten
  let zug = null, ablage = null, klickSperre = false;
  const markeWeg = () => $$('.ziel,.davor,.danach').forEach(x => x.classList.remove('ziel', 'davor', 'danach'));
  const marke = (el, k) => { if (!el.classList.contains(k)) { markeWeg(); el.classList.add(k); } };
  const geist = $('#geist');

  function zielSuchen(x, y) {
    ablage = null;
    const el = document.elementFromPoint(x, y);
    if (!el) return markeWeg();
    if (zug.ordner) {
      const z = el.closest('#railNav [data-ordner]');
      const o = z && S.ordner.find(q => q.id === z.dataset.ordner);
      const q = S.ordner.find(v => v.id === zug.ordner);
      if (!o || !q || o.bereich !== q.bereich || o.id === q.id || o.fest) return markeWeg();
      const r = z.getBoundingClientRect();
      const nach = y > r.top + r.height / 2;
      marke(z, nach ? 'danach' : 'davor');
      ablage = { art: 'ordnerfolge', ordner: o.id, nach };
      return;
    }
    const e = eintrag(zug.id);
    if (!e) return;
    const k = el.closest('#wand .kachel[data-id]');
    if (zug.fest) {  // aus dem festen Abschnitt: nur dort umsortieren
      const ziel = k && k.closest('.raster.fest') && eintrag(k.dataset.id);
      if (!ziel || ziel.id === e.id) return markeWeg();
      const r = k.getBoundingClientRect();
      const nach = S.kompakt ? y > r.top + r.height / 2 : x > r.left + r.width / 2;
      let vor = ziel.id;
      if (nach) {
        let n = k.nextElementSibling;
        while (n && n.dataset.id === e.id) n = n.nextElementSibling;
        vor = n?.dataset.id || null;
      }
      marke(k, nach ? 'danach' : 'davor');
      ablage = { art: 'fest', vor };
      return;
    }
    if (k) {
      const ziel = eintrag(k.dataset.id);
      // feste Karten: umsortieren ja, aber nur im eigenen Ordner
      if (!ziel || ziel.bereich !== e.bereich || ziel.id === e.id || k.closest('.raster.fest') || (e.kern && ziel.ordner !== e.ordner)) return markeWeg();
      const r = k.getBoundingClientRect();
      const nach = S.kompakt ? y > r.top + r.height / 2 : x > r.left + r.width / 2;
      let vor = ziel.id;
      if (nach) {
        let n = k.nextElementSibling;
        while (n && n.dataset.id === e.id) n = n.nextElementSibling;
        vor = n?.dataset.id || null;
      }
      marke(k, nach ? 'danach' : 'davor');
      ablage = { art: 'stelle', ordner: ziel.ordner, vor };
      return;
    }
    const z = el.closest('#railNav [data-ordner],#wand [data-ziel]');
    const oid = z && (z.dataset.ordner || z.dataset.ziel);
    const o = oid && S.ordner.find(q => q.id === oid);
    if (!o || o.bereich !== e.bereich || (e.kern && o.id !== e.ordner)) return markeWeg();
    marke(z, 'ziel');
    ablage = z.dataset.ordner ? { art: 'ordner', ordner: oid } : { art: 'stelle', ordner: oid, vor: null };
  }

  function zugStart() {
    zug.aktiv = true;
    S.zieht = true;
    getSelection()?.removeAllRanges();
    document.body.classList.add('ziehen');
    zug.quelle.classList.add('zieht');
    if (zug.id) {
      const e = eintrag(zug.id);
      geist.textContent = e?.name || '';
      if (e && !S.offen[e.bereich]) { S.offen[e.bereich] = true; zug.wiederZu = e.bereich; railZeichnen(); }
      if (rail.classList.contains('zu')) { rail.classList.remove('zu'); zug.railZu = true; }
    } else geist.textContent = (S.ordner.find(o => o.id === zug.ordner) || {}).name || '';
    geist.classList.remove('hidden');
    const rollen = () => {
      if (!zug?.aktiv) return;
      if (zug.v) { zug.v.el.scrollTop += zug.v.d; zielSuchen(zug.lx, zug.ly); }
      requestAnimationFrame(rollen);
    };
    requestAnimationFrame(rollen);
  }

  function zugEnde(ausfuehren) {
    const z = zug, a = ablage;
    zug = ablage = null;
    if (!z?.aktiv) return;
    S.zieht = false;
    klickSperre = true;
    setTimeout(() => { klickSperre = false; }, 0);
    markeWeg();
    $$('.zieht').forEach(x => x.classList.remove('zieht'));
    document.body.classList.remove('ziehen');
    geist.classList.add('hidden');
    if (z.railZu) rail.classList.add('zu');
    if (z.wiederZu) { S.offen[z.wiederZu] = false; railZeichnen(); }
    if (!ausfuehren || !a) return;
    if (a.art === 'ordnerfolge') ordnerVerschieben(z.ordner, a.ordner, a.nach);
    else if (a.art === 'fest') festAnordnen(z.id, a.vor);
    else if (a.art === 'ordner') { if (eintrag(z.id)?.ordner !== a.ordner) verschieben(z.id, a.ordner); }
    else anordnen(z.id, a.ordner, a.vor);
  }

  document.addEventListener('dragstart', ev => { if (ev.target.closest?.('#wand .kachel,#railNav')) ev.preventDefault(); });
  document.addEventListener('pointerdown', ev => {
    if (ev.button !== 0 || zug) return;
    const r = ev.target.closest('#railNav [data-ordner]');
    const k = r ? null : ev.target.closest('#wand .kachel[data-id]');
    if (!r && !k) return;
    if (k && ev.target.closest('button,a,input,textarea,select')) return;
    if (r && S.ordner.find(o => o.id === r.dataset.ordner)?.fest) return;
    zug = { quelle: r || k, ordner: r?.dataset.ordner, id: k?.dataset.id, fest: !!k?.closest('.raster.fest'), x: ev.clientX, y: ev.clientY, aktiv: false };
  });
  document.addEventListener('pointermove', ev => {
    if (!zug) return;
    if (!zug.aktiv) {
      if (Math.hypot(ev.clientX - zug.x, ev.clientY - zug.y) < 6) return;
      zugStart();
    }
    ev.preventDefault();
    zug.lx = ev.clientX; zug.ly = ev.clientY;
    geist.style.left = ev.clientX + 14 + 'px';
    geist.style.top = ev.clientY + 12 + 'px';
    zug.v = null;
    for (const c of [$('#wand'), $('#railNav')]) {
      const r = c.getBoundingClientRect();
      if (ev.clientX < r.left || ev.clientX > r.right) continue;
      if (ev.clientY < r.top + 48 && ev.clientY >= r.top - 20) zug.v = { el: c, d: -12 };
      else if (ev.clientY > r.bottom - 48 && ev.clientY <= r.bottom + 20) zug.v = { el: c, d: 12 };
    }
    zielSuchen(ev.clientX, ev.clientY);
  });
  document.addEventListener('pointerup', () => zugEnde(true));
  document.addEventListener('pointercancel', () => zugEnde(false));
  window.addEventListener('blur', () => zugEnde(false));
  document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && zug?.aktiv) zugEnde(false); }, true);
  document.addEventListener('click', ev => { if (klickSperre) { ev.stopPropagation(); ev.preventDefault(); klickSperre = false; } }, true);

  $('#laufListe').addEventListener('click', ev => {
    const b = ev.target.closest('.lauf-btn');
    const e = b && eintrag(b.dataset.id);
    if (!e) return;
    if (ev.target.closest('[data-a=stopp]')) return aktion(e, 'stopp');
    if (e.url && zustand(e) === 'laeuft') aktion(e, 'oeffnen');
    else zurKachel(e);
  });
  $('#laufListe').addEventListener('contextmenu', ev => {
    const b = ev.target.closest('.lauf-btn');
    const e = b && eintrag(b.dataset.id);
    if (!e) return;
    ev.preventDefault();
    laufMenue(e, b);
  });

  $('#wand').addEventListener('click', ev => {
    const k = ev.target.closest('.kachel');
    if (!k) return;
    const a = ev.target.closest('[data-a]');
    if (k.classList.contains('ohne')) {
      if (!a) return;
      if (a.dataset.a === 'integrieren') { $('#link').value = k.dataset.pfad; integrieren(); }
      if (a.dataset.a === 'ignorieren') api('ignorieren', { pfad: k.dataset.pfad }).then(() => { S.ohneListe = S.ohneListe.filter(o => o.pfad !== k.dataset.pfad); S.ohne = S.ohneListe.length; S.ignoriert.push(k.dataset.pfad); ohneZeichnen(); railZeichnen(); }).catch(fehler);
      return;
    }
    const e = eintrag(k.dataset.id);
    if (!e) return;
    if (a?.dataset.a === 'mehr') return mehrMenue(e, a);
    if (a) return aktion(e, a.dataset.a, a);
    if (e.bereich === 'web') aktion(e, 'oeffnen');
  });
  $('#wand').addEventListener('keydown', ev => {
    const k = ev.target.closest('.kachel.web');
    if (k && ev.key === 'Enter') aktion(eintrag(k.dataset.id), 'oeffnen');
  });
  $('#wand').addEventListener('contextmenu', ev => {
    const k = ev.target.closest('.kachel[data-id]');
    if (!k) return;
    ev.preventDefault();
    mehrMenue(eintrag(k.dataset.id), k);
  });

  $('#statusFilter').onclick = ev => { const b = ev.target.closest('[data-f]'); if (!b) return; S.filter = b.dataset.f; kopfZeichnen(); wandZeichnen(); };
  $('#sortWahl').onclick = async ev => {
    const b = ev.target.closest('[data-s]'); if (!b) return;
    S.einst.sortierung = b.dataset.s; kopfZeichnen(); wandZeichnen();
    api('einstellungen', { einstellungen: { sortierung: b.dataset.s } }).catch(fehler);
  };
  let suchUhr;
  $('#suche').oninput = ev => { clearTimeout(suchUhr); suchUhr = setTimeout(() => { S.suche = ev.target.value.trim(); kopfZeichnen(); wandZeichnen(); }, 120); };
  $('#btnGroesse').onclick = () => { S.kompakt = !S.kompakt; speicher.setz('kompakt', S.kompakt); kopfZeichnen(); wandZeichnen(); };
  $('#btnPanel').onclick = () => panel($('#seitenchat').classList.contains('zu'));
  $('#panelZu').onclick = () => panel(false);
  $('#panelLeeren').onclick = () => { $('#panelInhalt').innerHTML = ''; panelLeer(); };
  $('#einstBtn').onclick = ev => einstMenue(ev.currentTarget);

  $('#link').addEventListener('input', groesse);
  $('#link').addEventListener('keydown', ev => { if (ev.key === 'Enter' && (ev.ctrlKey || !ev.shiftKey)) { ev.preventDefault(); integrieren(); } });
  $('#btnIntegrieren').onclick = integrieren;
  $('#zielBereich').onclick = ev => { const b = ev.target.closest('[data-b]'); if (!b) return; S.zielBereich = b.dataset.b; $$('#zielBereich button').forEach(x => x.classList.toggle('an', x === b)); };
  const comp = $('#composer');
  comp.addEventListener('dragover', ev => { if (ev.dataTransfer.types.includes('text/uri-list') || ev.dataTransfer.types.includes('text/plain')) { ev.preventDefault(); comp.classList.add('drop'); } });
  comp.addEventListener('dragleave', () => comp.classList.remove('drop'));
  comp.addEventListener('drop', ev => {
    comp.classList.remove('drop');
    const t = ev.dataTransfer.getData('text/uri-list') || ev.dataTransfer.getData('text/plain');
    if (t && !ev.dataTransfer.types.includes('text/x-cockpit')) { ev.preventDefault(); $('#link').value = t.trim(); groesse(); }
  });

  $('#modal').addEventListener('mousedown', ev => { if (ev.target.id === 'modal') modalZu(); });
  document.addEventListener('mousedown', ev => { if (!ev.target.closest('#pop')) popZu(); });
  document.addEventListener('keydown', ev => {
    if (ev.key === 'Escape') { if (!$('#pop').classList.contains('hidden')) popZu(); else if (!$('#modal').classList.contains('hidden')) modalZu(); }
    if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'k') { ev.preventDefault(); $('#suche').focus(); }
  });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) statusHolen(); });
}

verdrahten();
laden().then(() => setInterval(statusHolen, 3000)).catch(fehler);
