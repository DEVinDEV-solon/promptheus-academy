/* Gemeinsame Grundlage der Seiten unter /promptheus-apps (Meine Apps, Werkbank).
   Klassisches Skript vor app.js bzw. werkbank.js: was hier oben steht, sehen beide.
   Jede Angabe aus der API geht durch esc(), bevor sie ins HTML kommt. */
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
  hand: P('<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12m0-1.5v-2a1.5 1.5 0 0 1 3 0V12m0-1a1.5 1.5 0 0 1 3 0v4a6 6 0 0 1-6 6h-1a6 6 0 0 1-5-2.7L4.3 15a1.5 1.5 0 0 1 2.4-1.8L8 15"/>'),
  start: P('<path d="M12 3v8"/><path d="M6.3 6.3a8 8 0 1 0 11.4 0"/>'),
  kalender: P('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
  werkzeug: P('<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/>'),
  haken: P('<path d="M5 12l5 5 9-10"/>'),
  leiste: P('<rect x="3" y="15" width="18" height="5" rx="1.5"/><path d="M7 17.5h.01M11 17.5h.01"/>'),
  feed: P('<path d="M5 5a14 14 0 0 1 14 14M5 11a8 8 0 0 1 8 8"/><circle cx="6" cy="18" r="1.3"/>'),
  web: P('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'),
  info: P('<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/>'),
  schloss: P('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
  weiter: P('<path d="M9 6l6 6-6 6"/>'),
  ziel: P('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".8"/>'),
};
const ico = (n) => ICONS[n] || ICONS.app;
function symbole(root = document) { $$('[data-i]', root).forEach((el) => { if (!el.firstChild) el.innerHTML = ico(el.dataset.i); }); }

const WOCHENTAGE = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
/** Der Auslöser in Worten, auch für Zeitpläne (täglich, wöchentlich, alle N Stunden). */
function ausloeserText(a) {
  if (!a || a.art === 'hand') return 'von Hand';
  if (a.art === 'start') return 'beim Werkstatt-Start';
  const r = a.regel || {};
  if (r.typ === 'taeglich') return `täglich ${r.uhrzeit || ''}`.trim();
  if (r.typ === 'woechentlich') return `${WOCHENTAGE[r.tag] ? `jeden ${WOCHENTAGE[r.tag]}` : 'wöchentlich'} ${r.uhrzeit || ''}`.trim();
  if (r.typ === 'intervall') return Number(r.stunden) === 1 ? 'jede Stunde' : `alle ${r.stunden} Stunden`;
  return 'Zeitplan';
}

/** Die festen Wahlwerte der Bausteine in Worten. */
const WERT_WORT = { downloads: 'Downloads', dokumente: 'Dokumente', desktop: 'Desktop', import: 'Secondbrain · 50_Import' };

/** Die Ausgabe eines Laufs (Tabelle, Karte, Text) als HTML; alles geht durch esc(). */
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
