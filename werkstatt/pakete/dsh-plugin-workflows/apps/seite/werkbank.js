/* Workflow-Werkbank — PROMPTHEUS Werkstatt (Masterplan Workflow-Modalseite, Kapitel 4 und 4.6, Phase B).
   Geführter Modus: eine Frage je Schritt, Kacheln mit Tooltip, ein wippender Pfeil
   zeigt auf die nächste nötige Handlung, rechts Ring und Checkliste.
   Braucht grund.js davor. Keine Inline-Stile im HTML (CSP style-src 'self');
   Lage von Pfeil und Tooltip setzt JS über .style. */
'use strict';

// ------------------------------------------------------------------ Schritte (4.6)
const SCHRITTE = [
  { nr: 1, kurz: 'Ziel', frage: 'Was soll deine App tun?', pflicht: true,
    unter: 'Gib ihr einen Namen und beschreib in einem Satz, wofür sie da ist.' },
  { nr: 2, kurz: 'Wann', frage: 'Wann soll sie laufen?', pflicht: true,
    unter: 'Das lässt sich später jederzeit ändern.' },
  { nr: 3, kurz: 'Woher', frage: 'Woher kommen die Daten?', pflicht: true, art: 'quelle',
    unter: 'Wähle eine Quelle. Fahr mit der Maus über eine Kachel, dann erklärt sie sich.' },
  { nr: 4, kurz: 'Auswahl', frage: 'Soll nur ein Teil davon verwendet werden?', pflicht: false, art: 'filter',
    unter: 'Dieser Schritt ist freiwillig. Ohne Auswahl geht alles weiter.' },
  { nr: 5, kurz: 'Was tun', frage: 'Was soll mit den Daten passieren?', pflicht: true, art: 'verarbeitung',
    unter: 'Es passen nur Kacheln, die mit deiner Quelle etwas anfangen können.' },
  { nr: 6, kurz: 'Wohin', frage: 'Wohin mit dem Ergebnis?', pflicht: true, art: 'ziel',
    unter: 'Wähle, wo du das Ergebnis sehen willst.' },
  { nr: 7, kurz: 'Probe', frage: 'Einmal ausprobieren', pflicht: true,
    unter: 'Der Probelauf verändert nichts: keine Datei, keine Nachricht, kein Merker für „nur neue“.' },
  { nr: 8, kurz: 'Ablegen', frage: 'Wo willst du die App finden?', pflicht: true,
    unter: 'Danach startest du sie mit einem Klick auf ihrer Seite.' },
];
const ARTEN = ['quelle', 'filter', 'verarbeitung', 'ziel'];
const PFLICHT_ZAHL = SCHRITTE.filter((s) => s.pflicht).length;

const AUSLOESER = [
  { art: 'hand', titel: 'Von Hand', icon: 'hand', kurz: 'Du startest sie selbst mit einem Klick.',
    gutFuer: 'Alles, was du nur ab und zu brauchst.', daten: 'Läuft nur, wenn du klickst.' },
  { art: 'zeitplan', titel: 'Nach Zeitplan', icon: 'uhr', kurz: 'Täglich, wöchentlich oder alle paar Stunden.',
    gutFuer: 'Ein Überblick am Morgen, eine Erinnerung am Abend.', daten: 'Der Zeitplan wird jetzt gespeichert. Von allein startet die App ab Phase D; bis dahin startest du sie auf ihrer Seite.' },
  { art: 'start', titel: 'Beim Werkstatt-Start', icon: 'start', kurz: 'Läuft einmal, wenn die Werkstatt startet.',
    gutFuer: 'Was du zu Beginn jeder Sitzung sehen willst.', daten: 'Gespeichert wird das jetzt; von allein läuft es ab Phase D.' },
];
const DATEN_WORT = { dateien: 'Dateien', liste: 'eine Liste', ausgabe: 'ein Ergebnis', mails: 'Mails', artikel: 'Beiträge', seite: 'eine Webseite' };

// ------------------------------------------------------------------ Zustand
const leer = () => ({ name: '', ziel: '', ausloeser: { art: null, regel: null }, wahl: { quelle: null, filter: null, verarbeitung: null, ziel: null } });
const W = {
  kat: null,
  ansicht: 'start',
  schritt: 1,
  besucht: new Set([1]),
  alle: speicher.lies('werkbank.alle', false),
  app: leer(),
  id: null,
  warAktiv: false,
  probeAlt: true,
  probe: null,
  abgelegt: false,
  kategorie: null,
  taskleiste: false,
  uhr: 0,
  speichert: null,
  /** Ungespeicherte Änderung an Schritt 1–6. Ohne sie wird nicht gespeichert: jedes Speichern macht den Probelauf ungültig. */
  dirty: false,
};

/** Ein Baustein aus dem Katalog, laufbereit oder für später. */
function info(id) {
  if (!W.kat || !id) return null;
  const b = W.kat.bausteine.bereit.find((x) => x.id === id);
  if (b) return { ...b, bereit: true };
  const f = W.kat.bausteine.folgt.find((x) => x.id === id);
  return f ? { ...f, bereit: false, felder: [] } : null;
}
/** Was beim Schritt einer Art ankommt (die `liefert` der Wahl davor). */
function fliesstVor(art) {
  let f = null;
  for (const a of ARTEN) {
    if (a === art) return f;
    const w = W.app.wahl[a];
    const b = w && info(w.baustein);
    if (b?.liefert) f = b.liefert;
  }
  return f;
}
/** Passt ein Baustein an seine Stelle? Liefert den Grund, wenn nicht. */
function passt(b) {
  if (!b.braucht) return null;
  const f = fliesstVor(b.art);
  if (b.braucht === f) return null;
  const quelle = info(W.app.wahl.quelle?.baustein);
  if (!f) return `Braucht ${DATEN_WORT[b.braucht] || b.braucht}. Wähle erst eine passende Quelle.`;
  return `Braucht ${DATEN_WORT[b.braucht] || b.braucht}, ${quelle ? `„${quelle.titel}“` : 'die Strecke davor'} liefert ${DATEN_WORT[f] || f}.`;
}
function kacheln(art) {
  if (!W.kat) return [];
  return [...W.kat.bausteine.bereit.map((b) => ({ ...b, bereit: true })), ...W.kat.bausteine.folgt.map((b) => ({ ...b, bereit: false, felder: [] }))]
    .filter((b) => b.art === art);
}

function regelOk(r) {
  if (!r) return false;
  const uhr = /^([01]\d|2[0-3]):[0-5]\d$/.test(r.uhrzeit || '');
  if (r.typ === 'taeglich') return uhr;
  if (r.typ === 'woechentlich') return uhr && Number.isInteger(r.tag) && r.tag >= 0 && r.tag <= 6;
  if (r.typ === 'intervall') return Number.isInteger(r.stunden) && r.stunden >= 1 && r.stunden <= 12;
  return false;
}
function pflichtLeer(w) {
  const b = info(w?.baustein);
  if (!b) return [];
  return (b.felder || []).filter((f) => f.pflicht && !String(w.einstellungen?.[f.name] ?? '').trim());
}
/** Warum eine Wahl (noch) nicht reicht, oder null. */
function wahlMangel(art) {
  const w = W.app.wahl[art];
  if (!w) return art === 'quelle' ? 'Wähle eine Quelle.' : art === 'verarbeitung' ? 'Wähle, was passieren soll.' : 'Wähle ein Ziel.';
  const b = info(w.baustein);
  if (!b) return 'Unbekannter Baustein.';
  if (!b.bereit) return `„${b.titel}“ kommt erst in Phase ${b.phase}. Wähle bis dahin eine andere Kachel.`;
  const grund = passt(b);
  if (grund) return grund;
  const fehlt = pflichtLeer(w);
  if (fehlt.length) return `Bitte ausfüllen: ${fehlt.map((f) => f.titel).join(', ')}.`;
  return null;
}
/** Was im Schritt noch fehlt (ein Satz) oder null, wenn er erfüllt ist. */
function mangel(nr) {
  const a = W.app;
  if (nr === 1) return a.name.trim().length >= 2 ? null : 'Gib der App einen Namen (mindestens zwei Zeichen).';
  if (nr === 2) {
    if (!a.ausloeser.art) return 'Wähle, wann die App laufen soll.';
    if (a.ausloeser.art === 'zeitplan' && !regelOk(a.ausloeser.regel)) return 'Der Zeitplan braucht eine gültige Uhrzeit.';
    return null;
  }
  if (nr === 3) return wahlMangel('quelle');
  if (nr === 4) {
    const w = a.wahl.filter;
    if (!w) return null;
    const b = info(w.baustein);
    return b && b.bereit && !passt(b) ? null : 'Diese Auswahl passt nicht. Nimm sie heraus oder wähle eine andere.';
  }
  if (nr === 5) return wahlMangel('verarbeitung');
  if (nr === 6) return wahlMangel('ziel');
  if (nr === 7) {
    for (let i = 1; i <= 6; i++) if (mangel(i)) return `Erst Schritt ${i} („${SCHRITTE[i - 1].kurz}“) fertig machen.`;
    if (W.probe?.status === 'laeuft') return 'Der Probelauf läuft.';
    if (W.probeAlt || W.probe?.status !== 'ok') return 'Starte den Probelauf.';
    return null;
  }
  if (nr === 8) return W.abgelegt ? null : mangel(7) ? 'Erst der Probelauf.' : 'Lege die App ab.';
  return null;
}
const erledigt = (nr) => !mangel(nr);
function ersterOffener() {
  for (const s of SCHRITTE) if (s.pflicht && !erledigt(s.nr)) return s.nr;
  return null;
}
function prozent() {
  const n = SCHRITTE.filter((s) => s.pflicht && erledigt(s.nr)).length;
  return Math.round((n / PFLICHT_ZAHL) * 100);
}
/** Bis wohin man springen darf: bis zum ersten offenen Pflichtschritt. */
function erreichbar(nr) {
  const o = ersterOffener();
  return o === null || nr <= Math.max(o, W.schritt);
}
function filterMoeglich() {
  return kacheln('filter').some((b) => b.bereit && !passt(b));
}

// ------------------------------------------------------------------ Tooltips
const TIPS = new Map();
let tipUhr = 0;
let tipAnker = null;
function tipSetzen(schluessel, titel, zeilen) { TIPS.set(schluessel, { titel, zeilen: zeilen.filter(Boolean) }); return schluessel; }
function tipZeigen(el) {
  const t = TIPS.get(el.dataset.tip);
  if (!t) return;
  const tip = $('#tip');
  tip.innerHTML = `<b>${esc(t.titel)}</b>${t.zeilen.map((z) => `<span class="tip-zeile${z.art ? ` tip-${esc(z.art)}` : ''}">${esc(z.text ?? z)}</span>`).join('')}`;
  tip.hidden = false;
  tipAnker = el;
  el.setAttribute('aria-describedby', 'tip');
  const r = el.getBoundingClientRect();
  const b = tip.getBoundingClientRect();
  let x = Math.min(window.innerWidth - b.width - 8, Math.max(8, r.left + r.width / 2 - b.width / 2));
  let y = r.bottom + 8;
  if (y + b.height > window.innerHeight - 8) y = Math.max(8, r.top - b.height - 8);
  tip.style.left = `${Math.round(x)}px`;
  tip.style.top = `${Math.round(y)}px`;
}
function tipWeg() {
  clearTimeout(tipUhr);
  $('#tip').hidden = true;
  if (tipAnker) tipAnker.removeAttribute('aria-describedby');
  tipAnker = null;
}
function tipBald(el) { clearTimeout(tipUhr); tipUhr = setTimeout(() => tipZeigen(el), 300); }
document.addEventListener('mouseover', (ev) => {
  const el = ev.target.closest?.('[data-tip]');
  if (el && el !== tipAnker) tipBald(el);
  if (!el && tipAnker) tipWeg();
});
document.addEventListener('focusin', (ev) => {
  const el = ev.target.closest?.('[data-tip]');
  if (el) tipBald(el); else tipWeg();
});
document.addEventListener('scroll', () => { tipWeg(); pfeilBald(); }, true);

// ------------------------------------------------------------------ Der wippende Pfeil
let pfeilZiel = null;
let pfeilFrame = 0;
function pfeilAuf(el, wort) {
  pfeilZiel = el ? { el, wort } : null;
  pfeilBald();
}
function pfeilBald() { cancelAnimationFrame(pfeilFrame); pfeilFrame = requestAnimationFrame(pfeilLegen); }
function pfeilLegen() {
  const p = $('#pfeil');
  const el = pfeilZiel?.el;
  if (!el || !el.isConnected || el.offsetParent === null) { p.classList.remove('an'); return; }
  const r = el.getBoundingClientRect();
  const haupt = $('#haupt').getBoundingClientRect();
  const imFuss = !!el.closest('#fuss');
  const sichtbar = imFuss || (r.bottom > haupt.top + 10 && r.top < haupt.bottom - 10);
  if (!sichtbar) { p.classList.remove('an'); return; }
  p.querySelector('.pfeil-wort').textContent = pfeilZiel.wort;
  // Breite Felder: Pfeil ans rechte Ende, damit er die Beschriftung links nicht verdeckt.
  const x = r.width > 220 ? r.right - 70 : r.left + r.width / 2;
  const unten = !imFuss && r.top - 46 < haupt.top;
  p.classList.toggle('unten', unten);
  p.style.left = `${Math.round(x)}px`;
  p.style.top = `${Math.round(unten ? r.bottom + 4 : r.top - 4)}px`;
  p.classList.add('an');
}
window.addEventListener('resize', pfeilBald);

/** Wohin der Pfeil gerade zeigt: genau eine Stelle, die nächste nötige Handlung. */
function pfeilWaehlen() {
  if (W.ansicht === 'start') return pfeilAuf($('[data-neu]'), 'Hier anfangen');
  if (W.ansicht === 'fertig') return pfeilAuf($('[data-oeffnen]'), 'Ansehen');
  const nr = W.alle ? (ersterOffener() ?? 8) : W.schritt;
  const bereich = W.alle ? $(`[data-abschnitt="${nr}"]`) : $('#haupt');
  if (!bereich) return pfeilAuf(null);
  const weiter = () => (W.alle ? null : $('#weiter'));
  if (nr === 1) return W.app.name.trim().length < 2 ? pfeilAuf($('#name', bereich), 'Name eingeben') : pfeilAuf(weiter(), 'Weiter');
  if (nr === 2) {
    if (!W.app.ausloeser.art) return pfeilAuf($('.kachel:not(.gesperrt)', bereich), 'Hier wählen');
    if (mangel(2)) return pfeilAuf($('[data-regel]', bereich), 'Uhrzeit');
    return pfeilAuf(weiter(), 'Weiter');
  }
  if (nr >= 3 && nr <= 6) {
    const art = SCHRITTE[nr - 1].art;
    const w = W.app.wahl[art];
    if (nr === 4 && !w) return pfeilAuf(W.alle ? null : $('#ueberspringen'), 'Überspringen');
    const b = w && info(w.baustein);
    if (!w || !b || !b.bereit || passt(b)) return pfeilAuf($('.kachel:not(.gesperrt):not(.gewaehlt)', bereich), 'Hier wählen');
    const fehlt = pflichtLeer(w)[0];
    if (fehlt) return pfeilAuf($(`[data-feld="${CSS.escape(fehlt.name)}"]`, bereich), 'Ausfüllen');
    return pfeilAuf(weiter(), 'Weiter');
  }
  if (nr === 7) return mangel(7) ? pfeilAuf($('#probeLos', bereich), 'Ausprobieren') : pfeilAuf(weiter(), 'Weiter');
  return pfeilAuf($('#ablegen', bereich), 'Ablegen');
}

// ------------------------------------------------------------------ Laden
async function laden() {
  try { W.kat = await api('katalog'); } catch (e) { fehler(e); $('#haupt').innerHTML = `<div class="leer-gross"><h2>Die Werkbank lädt nicht</h2><p>${esc(e.message)}. Schliess das Fenster und öffne es noch einmal; hilft das nicht, starte die Werkstatt neu.</p></div>`; return; }
  const id = new URLSearchParams(location.search).get('id');
  if (id && /^[a-z0-9][a-z0-9-]{2,39}$/.test(id)) {
    try { const d = await api('bearbeiten?id=' + encodeURIComponent(id)); return uebernehmen(d.app, d.probeOk); } catch (e) { fehler(e); }
  }
  zeichnen();
}

/** Eine gespeicherte App (oder Vorlage) in den Zustand der Werkbank holen. */
function uebernehmen(app, probeOk = false, ausVorlage = false) {
  W.app = leer();
  W.app.name = app.name || '';
  W.app.ziel = app.ziel || '';
  W.app.ausloeser = { art: app.ausloeser?.art || null, regel: app.ausloeser?.regel || null };
  if (ausVorlage && !app.ausloeser) W.app.ausloeser = { art: 'hand', regel: null };
  for (const s of app.schritte || []) {
    const b = info(s.baustein);
    if (b && !W.app.wahl[b.art]) W.app.wahl[b.art] = { baustein: s.baustein, einstellungen: { ...(s.einstellungen || {}) } };
  }
  W.id = ausVorlage ? null : app.id;
  W.warAktiv = !ausVorlage && app.status === 'aktiv';
  W.abgelegt = W.warAktiv;
  W.probeAlt = !probeOk;
  W.probe = probeOk ? { status: 'ok' } : null;
  W.kategorie = ausVorlage ? app.kategorie || null : app.kategorie;
  W.taskleiste = !!app.ablage?.taskleiste;
  W.ansicht = 'bau';
  const offen = ersterOffener();
  W.schritt = offen ?? 1;
  // Eine fertige App: alle Schritte gelten als gesehen, die Leiste zeigt überall ✓.
  W.besucht = new Set(SCHRITTE.filter((s) => offen === null || s.nr <= offen).map((s) => s.nr));
  W.dirty = false;
  if (ausVorlage) aendern(false);
  zeichnen();
}

// ------------------------------------------------------------------ Speichern
function schritteListe() {
  return ARTEN.map((a) => W.app.wahl[a]).filter(Boolean).map((w) => ({ baustein: w.baustein, einstellungen: w.einstellungen || {} }));
}
/** Etwas an Schritt 1–6 hat sich geändert: Probelauf gilt nicht mehr, bald speichern. */
function aendern(neuZeichnen = true) {
  W.dirty = true;
  W.probeAlt = true;
  if (W.probe?.status !== 'laeuft') W.probe = null;
  W.abgelegt = false;
  clearTimeout(W.uhr);
  W.uhr = setTimeout(() => { sichern().catch(() => {}); }, 700);
  if (neuZeichnen) zeichnen(); else teilZeichnen();
}
/** Speichert, sobald es einen Namen und eine Quelle gibt; vorher bleibt der Entwurf im Browser. */
async function sichern() {
  clearTimeout(W.uhr);
  if (W.id && !W.dirty) return null;
  const schritte = schritteListe();
  if (W.app.name.trim().length < 2 || !schritte.length) {
    if (!W.id) speicher.setz('werkbank.entwurf', W.app);
    return null;
  }
  const koerper = { name: W.app.name.trim(), ziel: W.app.ziel, ausloeser: W.app.ausloeser, schritte, taskleiste: W.taskleiste };
  if (W.id) koerper.id = W.id;
  if (W.kategorie) koerper.kategorie = W.kategorie;
  // Ein Speichern nach dem anderen, damit kein älterer Stand einen neueren überholt.
  const vorher = W.speichert;
  W.speichert = (async () => {
    if (vorher) await vorher.catch(() => {});
    W.dirty = false;
    let r;
    try { r = await api('speichern', W.id ? { ...koerper, id: W.id } : koerper); } catch (e) { W.dirty = true; throw e; }
    W.id = r.app.id;
    W.kategorie = r.app.kategorie;
    W.warAktiv = false;
    speicher.setz('werkbank.entwurf', null);
    teilZeichnen();
    return r.app;
  })();
  try { return await W.speichert; } catch (e) { fehler(e); throw e; }
}

// ------------------------------------------------------------------ Zeichnen
function zeichnen() {
  tipWeg();
  TIPS.clear();
  const haupt = $('#haupt');
  $('#schrittleiste').hidden = W.ansicht !== 'bau';
  $('#stand').hidden = W.ansicht === 'start';
  $('#fuss').hidden = W.ansicht !== 'bau' || W.alle;
  $('#alleZeigen').closest('label').hidden = W.ansicht !== 'bau';
  if (W.ansicht === 'start') haupt.innerHTML = startHtml();
  else if (W.ansicht === 'fertig') haupt.innerHTML = fertigHtml();
  else if (W.alle) haupt.innerHTML = SCHRITTE.map((s) => `<section class="abschnitt" data-abschnitt="${s.nr}">${schrittHtml(s.nr)}</section>`).join('');
  else haupt.innerHTML = `<section class="abschnitt einzeln" data-abschnitt="${W.schritt}">${schrittHtml(W.schritt)}</section>`;
  symbole(haupt);
  teilZeichnen();
}

/** Alles ausser der Hauptfläche: Kopf, Schrittleiste, Ring, Fuss, Pfeil. Bricht keine Eingabe ab. */
function teilZeichnen() {
  const titel = W.app.name.trim();
  $('#wbTitel').textContent = titel && W.ansicht !== 'start' ? `Workflow-Werkbank · „${titel}“` : 'Workflow-Werkbank';
  const stand = $('#wbStand');
  stand.hidden = W.ansicht === 'start';
  const s = W.abgelegt ? ['aktiv', 'Aktiv'] : !W.probeAlt && W.probe?.status === 'ok' ? ['aktiv', 'Probelauf ok'] : ['entwurf', W.id ? 'Entwurf gespeichert' : 'Entwurf'];
  stand.className = `plakette p-${s[0]}`;
  stand.textContent = s[1];
  if (W.ansicht === 'bau') {
    $('#schrittleiste').innerHTML = leisteHtml();
    fussSetzen();
  }
  if (W.ansicht !== 'start') {
    $('#stand').innerHTML = standHtml();
    symbole($('#stand'));
    // Die Breite des Balkens (schmale Ansicht) per JS, nicht als Inline-Stil im HTML.
    const i = $('#stand .balken i');
    if (i) i.style.width = `${i.dataset.breite}%`;
  }
  pfeilWaehlen();
}

function leisteHtml() {
  return `<ol>${SCHRITTE.map((s) => {
    const ok = erledigt(s.nr);
    const jetzt = !W.alle && s.nr === W.schritt;
    const ueber = s.nr === 4 && !W.app.wahl.filter && W.besucht.has(5);
    const zustand = jetzt ? 'jetzt' : ueber ? 'ueber' : ok && (W.besucht.has(s.nr) || s.nr < W.schritt) ? 'ok' : W.besucht.has(s.nr) && !ok ? 'fehlt' : 'offen';
    const zeichen = zustand === 'ok' ? '✓' : zustand === 'fehlt' ? '✕' : zustand === 'ueber' ? '–' : String(s.nr);
    const wort = { jetzt: 'jetzt', ok: 'erledigt', fehlt: 'fehlt noch', ueber: 'übersprungen', offen: s.pflicht ? 'offen' : 'freiwillig' }[zustand];
    return `<li class="ls-${zustand}"><button type="button" data-gehe="${s.nr}" ${erreichbar(s.nr) ? '' : 'disabled'} aria-current="${jetzt ? 'step' : 'false'}"
      aria-label="Schritt ${s.nr}: ${esc(s.kurz)}, ${wort}" data-tip="${tipSetzen(`leiste-${s.nr}`, `Schritt ${s.nr}: ${s.kurz}`, [s.frage, erreichbar(s.nr) ? '' : 'Erst die Schritte davor.'])}">
      <span class="ls-nr">${zeichen}</span><span class="ls-wort">${esc(s.kurz)}</span></button></li>`;
  }).join('')}</ol>`;
}

function standHtml() {
  const p = prozent();
  const umfang = 2 * Math.PI * 42;
  const offen = SCHRITTE.filter((s) => s.pflicht && !erledigt(s.nr)).length;
  const zeilen = SCHRITTE.map((s) => {
    const ok = erledigt(s.nr);
    const frei = !s.pflicht;
    const klasse = frei ? (W.app.wahl.filter ? 'ok' : 'frei') : ok ? 'ok' : 'fehlt';
    const zeichen = klasse === 'ok' ? '✓' : klasse === 'frei' ? '○' : '✕';
    const wort = klasse === 'ok' ? 'erledigt' : klasse === 'frei' ? 'freiwillig' : 'fehlt';
    return `<li><button type="button" class="st-${klasse}${!W.alle && s.nr === W.schritt && W.ansicht === 'bau' ? ' jetzt' : ''}" data-gehe="${s.nr}" ${W.ansicht === 'bau' && erreichbar(s.nr) ? '' : 'disabled'}>
      <span class="st-zeichen" aria-hidden="true">${zeichen}</span><span class="st-wort">${esc(s.kurz)}</span><span class="st-zustand">${wort}</span></button></li>`;
  }).join('');
  return `<div class="ring${p === 100 ? ' voll' : ''}" role="img" aria-label="${p} Prozent bereit">
      <svg viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="ringVerlauf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" class="rv-a"/><stop offset="1" class="rv-b"/></linearGradient></defs>
        <circle cx="50" cy="50" r="42" class="ring-grund"/>
        <circle cx="50" cy="50" r="42" class="ring-wert${p === 0 ? ' null' : ''}" stroke-dasharray="${(umfang * p / 100).toFixed(1)} ${umfang.toFixed(1)}" transform="rotate(-90 50 50)"/></svg>
      <div class="ring-zahl"><b>${p} %</b><small>bereit</small></div>
    </div>
    <div class="balken" aria-hidden="true"><div class="bahn"><i data-breite="${p}"></i></div><span>${p} % bereit</span></div>
    <ul class="checkliste">${zeilen}</ul>
    <p class="st-fuss">${W.abgelegt ? 'Die App ist abgelegt.' : offen === 0 ? 'Alles erledigt.' : offen === 1 ? 'Noch 1 Schritt.' : `Noch ${offen} Schritte.`}</p>`;
}

function fussSetzen() {
  const nr = W.schritt;
  const m = mangel(nr);
  $('#zurueck').disabled = nr === 1;
  $('#ueberspringen').hidden = !(nr === 4 && !W.app.wahl.filter);
  const weiter = $('#weiter');
  weiter.hidden = nr === 8;
  weiter.disabled = !!m && !(nr === 4 && !W.app.wahl.filter);
  $('#fehlt').textContent = nr === 4 && !W.app.wahl.filter ? 'Freiwillig: wähle eine Auswahl oder überspring den Schritt.' : (m && nr < 8 ? m : '');
}

// ---------- Startseite
function startHtml() {
  let lokal = speicher.lies('werkbank.entwurf', null);
  if (lokal && typeof lokal.name !== 'string') lokal = null;
  const entwuerfe = W.kat?.entwuerfe || [];
  const vorlagen = W.kat?.vorlagen || [];
  const vk = vorlagen.map((v) => {
    const spaeter = v.app.schritte.filter((s) => !info(s.baustein)?.bereit).map((s) => info(s.baustein)?.titel || s.baustein);
    return `<button type="button" class="start-karte" data-vorlage="${esc(v.vorlage)}" data-tip="${tipSetzen(`v-${v.vorlage}`, v.titel, [v.text, spaeter.length ? { art: 'warn', text: `Noch nicht fertig: ${spaeter.join(', ')} kommen in Phase C.` } : 'Die Schritte sind vorausgefüllt; du prüfst sie und machst den Probelauf.'])}">
      <span class="ico" data-i="${esc(v.app.icon)}"></span><b>${esc(v.titel)}</b><span>${esc(v.text)}</span>${spaeter.length ? '<em class="plakette p-warn">Teile folgen</em>' : ''}</button>`;
  }).join('');
  const weiter = [
    ...(lokal && (lokal.name || lokal.wahl?.quelle) ? [`<button type="button" class="knopf" data-lokal><span class="ico" data-i="werkzeug"></span>${esc(lokal.name || 'Ohne Namen')} <span class="leise">· nicht gespeichert</span></button>`] : []),
    ...entwuerfe.map((e) => `<button type="button" class="knopf" data-entwurf="${esc(e.id)}"><span class="ico" data-i="${esc(e.icon)}"></span>${esc(e.name)}</button>`),
  ];
  return `<div class="start">
    <h2>Was möchtest du automatisieren?</h2>
    <p class="start-unter">Eine App ist ein Ablauf, den du einmal einrichtest und dann per Klick laufen lässt. Du wirst Schritt für Schritt geführt; nichts läuft, bevor du es ausprobiert hast.</p>
    <div class="start-raster">
      <button type="button" class="start-karte neu" data-neu data-tip="${tipSetzen('neu', 'Selbst zusammenstellen', ['Acht kurze Schritte: Name, wann, woher, was tun, wohin, ausprobieren, ablegen.', 'Zu jeder Kachel gibt es eine Erklärung, wenn du mit der Maus darauf zeigst.'])}">
        <span class="ico" data-i="werkzeug"></span><b>Selbst zusammenstellen</b><span>Schritt für Schritt, mit Erklärung zu jeder Kachel.</span></button>
      ${vk}
    </div>
    ${weiter.length ? `<h3 class="start-h3">Weitermachen</h3><div class="start-weiter">${weiter.join('')}</div>` : ''}
    ${IM_RAHMEN ? '<p class="start-alt">Du suchst die bisherige Team-Beratung (Auftrag für den Chat zusammenstellen)? <button type="button" class="verweis" data-team>Hier geht es dorthin.</button> Ab Phase E übernimmt Hephaistos das in der Werkbank.</p>' : ''}
  </div>`;
}

// ---------- Fertig
function fertigHtml() {
  return `<div class="fertig">
    <div class="fertig-zeichen" aria-hidden="true">✓</div>
    <h2>„${esc(W.app.name)}“ liegt jetzt in Meine Apps.</h2>
    <p>Starte sie dort mit „Jetzt ausführen“. Auf ihrer Seite siehst du jedes Ergebnis und das Protokoll.${W.taskleiste ? ' In der Taskleiste erscheint sie, sobald Phase F gebaut ist.' : ''}</p>
    <div class="fertig-knoepfe">
      <button type="button" class="knopf haupt" data-oeffnen><span class="ico" data-i="app"></span>App ansehen</button>
      <button type="button" class="knopf" data-nochmal><span class="ico" data-i="plus"></span>Noch eine App bauen</button>
    </div>
  </div>`;
}

// ---------- Ein Schritt
function kopfHtml(nr) {
  const s = SCHRITTE[nr - 1];
  return `<div class="schritt-kopf"><span class="schritt-zahl">Schritt ${nr} von 8${s.pflicht ? '' : ' · freiwillig'}</span>
    <h2>${esc(s.frage)}</h2><p class="schritt-unter">${esc(s.unter)}</p></div>`;
}

function schrittHtml(nr) {
  const warnung = nr === 1 && W.warAktiv
    ? '<div class="hinweis-zeile lapis">Diese App ist abgelegt und läuft. Sobald du etwas änderst, wird sie wieder ein Entwurf, bis du sie nach einem Probelauf neu ablegst.</div>' : '';
  if (nr === 1) return kopfHtml(1) + warnung + zielHtml();
  if (nr === 2) return kopfHtml(2) + ausloeserHtml();
  if (nr === 7) return kopfHtml(7) + probeHtml();
  if (nr === 8) return kopfHtml(8) + ablegenHtml();
  return kopfHtml(nr) + wahlHtml(SCHRITTE[nr - 1].art);
}

function infoKnopf(schluessel, titel, text) {
  return `<button type="button" class="info" aria-label="Erklärung: ${esc(titel)}" data-tip="${tipSetzen(schluessel, titel, [text])}"><span class="ico" data-i="info"></span></button>`;
}

function zielHtml() {
  return `<div class="felder-block">
    <label class="feld gross" data-feld="name"><span>Name der App ${infoKnopf('f-name', 'Name', 'So heisst die App in „Meine Apps“. Kurz und eindeutig, zum Beispiel „Downloads im Überblick“.')}<em class="pflicht">Pflicht</em></span>
      <input type="text" id="name" maxlength="60" autocomplete="off" placeholder="zum Beispiel: Downloads im Überblick" value="${esc(W.app.name)}"></label>
    <label class="feld gross" data-feld="ziel"><span>Wofür ist sie da? ${infoKnopf('f-ziel', 'Ein Satz zum Ziel', 'Hilft dir später beim Wiederfinden. In Phase E schlägt Hephaistos aus diesem Satz die passenden Schritte vor.')}<em class="frei">freiwillig</em></span>
      <textarea id="ziel" rows="2" maxlength="300" placeholder="zum Beispiel: Zeig mir, was zuletzt im Download-Ordner gelandet ist.">${esc(W.app.ziel)}</textarea></label>
  </div>`;
}

function kachelHtml({ schluessel, wahl, titel, icon, kurz, gutFuer, daten, gewaehlt, gesperrt, grund, ecke }) {
  const zeilen = [kurz, gutFuer ? `Gut für: ${gutFuer}` : '', daten ? { art: 'daten', text: daten } : '', grund ? { art: 'warn', text: grund } : ''];
  return `<button type="button" class="kachel${gewaehlt ? ' gewaehlt' : ''}${gesperrt ? ' gesperrt' : ''}" data-wahl="${esc(wahl)}"
      aria-pressed="${gewaehlt ? 'true' : 'false'}" ${gesperrt ? 'aria-disabled="true"' : ''} data-tip="${tipSetzen(schluessel, titel, zeilen)}">
    <span class="ico kachel-ico" data-i="${esc(icon)}"></span>
    <span class="kachel-titel">${esc(titel)}</span>
    <span class="kachel-kurz">${esc(kurz || '')}</span>
    ${ecke ? `<span class="kachel-ecke">${ecke}</span>` : ''}
  </button>`;
}

function ausloeserHtml() {
  const a = W.app.ausloeser;
  const reihe = AUSLOESER.map((x) => kachelHtml({
    schluessel: `a-${x.art}`, wahl: `ausloeser|${x.art}`, titel: x.titel, icon: x.icon, kurz: x.kurz, gutFuer: x.gutFuer, daten: x.daten,
    gewaehlt: a.art === x.art, ecke: a.art === x.art ? '<span class="ecke-ok">✓</span>' : '',
  })).join('');
  let mehr = '';
  if (a.art === 'zeitplan') {
    const r = a.regel || { typ: 'taeglich', uhrzeit: '07:00' };
    mehr = `<div class="einstellungen" data-regel>
      <label class="feld"><span>Wie oft</span><select data-regel-feld="typ">
        <option value="taeglich" ${r.typ === 'taeglich' ? 'selected' : ''}>täglich</option>
        <option value="woechentlich" ${r.typ === 'woechentlich' ? 'selected' : ''}>einmal pro Woche</option>
        <option value="intervall" ${r.typ === 'intervall' ? 'selected' : ''}>alle paar Stunden</option></select></label>
      ${r.typ === 'woechentlich' ? `<label class="feld"><span>Tag</span><select data-regel-feld="tag">${WOCHENTAGE.map((t, i) => `<option value="${i}" ${r.tag === i ? 'selected' : ''}>${t}</option>`).join('')}</select></label>` : ''}
      ${r.typ === 'intervall'
        ? `<label class="feld"><span>Alle … Stunden</span><input type="number" min="1" max="12" step="1" data-regel-feld="stunden" value="${esc(r.stunden ?? 4)}"></label>`
        : `<label class="feld"><span>Uhrzeit</span><input type="time" data-regel-feld="uhrzeit" value="${esc(r.uhrzeit || '07:00')}"></label>`}
      <p class="einst-hinweis">Der Zeitplan wird gespeichert. Von allein startet die App ab Phase D (Windows-Aufgabenplanung); bis dahin startest du sie auf ihrer Seite.</p>
    </div>`;
  } else if (a.art === 'start') {
    mehr = '<div class="einstellungen"><p class="einst-hinweis">Gespeichert wird das jetzt. Von allein läuft die App beim Werkstatt-Start ab Phase D.</p></div>';
  }
  return `<div class="kacheln" role="group" aria-label="Wann die App läuft">${reihe}</div>${mehr}`;
}

function wahlHtml(art) {
  const w = W.app.wahl[art];
  const liste = kacheln(art);
  if (art === 'filter' && !filterMoeglich() && !w) {
    const q = info(W.app.wahl.quelle?.baustein);
    return `<div class="hinweis-zeile">Für ${q ? `„${esc(q.titel)}“` : 'diese Quelle'} gibt es keine Auswahl. Dieser Schritt wird übersprungen.</div>`;
  }
  const reihe = liste.map((b) => {
    const grund = !b.bereit ? `Kommt in Phase ${b.phase}.` : passt(b);
    const gewaehlt = w?.baustein === b.id;
    const ecke = !b.bereit ? `<span class="ecke-schloss"><span class="ico" data-i="schloss"></span>Phase ${esc(b.phase)}</span>`
      : gewaehlt ? (wahlMangel(art) && art !== 'filter' ? '<span class="ecke-fehlt">✕</span>' : '<span class="ecke-ok">✓</span>') : '';
    return kachelHtml({ schluessel: `b-${b.id}`, wahl: `${art}|${b.id}`, titel: b.titel, icon: b.icon, kurz: b.kurz, gutFuer: b.gutFuer, daten: b.daten, gewaehlt, gesperrt: !!grund && !gewaehlt, grund, ecke });
  }).join('');
  return `<div class="kacheln" role="group" aria-label="${esc(SCHRITTE.find((s) => s.art === art).frage)}">${reihe}</div>${w ? einstellungenHtml(art, w) : ''}`;
}

function feldHtml(art, f, wert) {
  const k = `data-art="${esc(art)}" data-name="${esc(f.name)}"`;
  const kopf = `<span>${esc(f.titel)} ${f.hilfe ? infoKnopf(`h-${art}-${f.name}`, f.titel, f.hilfe) : ''}${f.pflicht ? '<em class="pflicht">Pflicht</em>' : ''}</span>`;
  let feld;
  if (f.typ === 'wahl') feld = `<select ${k}>${f.werte.map((v) => `<option value="${esc(v)}" ${v === wert ? 'selected' : ''}>${esc(WERT_WORT[v] || v)}</option>`).join('')}</select>`;
  else if (f.typ === 'schalter') feld = `<span class="haken"><input type="checkbox" ${k} ${wert ? 'checked' : ''}> ${wert ? 'an' : 'aus'}</span>`;
  else if (f.typ === 'zahl') feld = `<input type="number" ${k} value="${esc(wert)}" min="${esc(f.min ?? '')}" max="${esc(f.max ?? '')}">`;
  else if (f.typ === 'mehrzeilig') feld = `<textarea ${k} rows="6">${esc(wert)}</textarea>`;
  else feld = `<input type="text" ${k} value="${esc(wert)}" maxlength="200">`;
  return `<label class="feld${f.typ === 'mehrzeilig' ? ' breit' : ''}" data-feld="${esc(f.name)}">${kopf}${feld}</label>`;
}

function einstellungenHtml(art, w) {
  const b = info(w.baustein);
  if (!b) return '';
  if (!b.bereit) return `<div class="einstellungen"><p class="einst-hinweis warn">„${esc(b.titel)}“ kommt in Phase ${esc(b.phase)}. Bis dahin bleibt die App ein Entwurf; wähle eine andere Kachel, wenn sie jetzt laufen soll.</p></div>`;
  const felder = (b.felder || []).map((f) => feldHtml(art, f, w.einstellungen?.[f.name] ?? f.vorgabe)).join('');
  return `<div class="einstellungen">
    <p class="einst-titel"><span class="ico" data-i="${esc(b.icon)}"></span>${esc(b.titel)}: ${esc(b.kurz)}</p>
    ${felder ? `<div class="felder">${felder}</div>` : '<p class="einst-hinweis">Hier gibt es nichts einzustellen.</p>'}
    ${b.daten ? `<p class="einst-hinweis daten"><span class="ico" data-i="schloss"></span>${esc(b.daten)}</p>` : ''}
    ${art === 'filter' ? '<p><button type="button" class="knopf klein" data-filter-weg>Auswahl herausnehmen</button></p>' : ''}
  </div>`;
}

function probeHtml() {
  const m7 = mangel(7);
  const vorher = [1, 2, 3, 5, 6].find((i) => mangel(i));
  if (vorher) return `<div class="hinweis-zeile">${esc(mangel(7))}</div>`;
  const p = W.probe;
  const strecke = schritteListe().map((s) => `<span class="schritt-chip">${esc(info(s.baustein)?.titel || s.baustein)}</span>`).join('<span class="leise">→</span>');
  let ergebnis = '';
  if (p?.status === 'laeuft') ergebnis = '<p class="leise">Der Probelauf läuft …</p>';
  else if (p?.status === 'ok' && !W.probeAlt) ergebnis = `<div class="probe-ok"><b>✓ Probelauf hat geklappt.</b> ${esc(p.ergebnis || '')}</div>${p.ausgabe !== undefined ? `<div class="probe-ausgabe">${ausgabeHtml(p.ausgabe)}</div>` : ''}`;
  else if (p?.status === 'fehler') {
    const schritt = (p.schritte || []).find((s) => s.status !== 'ok');
    ergebnis = `<div class="probe-fehler"><b>✕ Der Probelauf ist nicht durchgelaufen.</b> ${esc(p.fehler?.text || 'Unbekannter Fehler')}${schritt ? ` — beim Schritt „${esc(schritt.titel)}“.` : '.'}
      Prüf die Einstellungen dieses Schritts und versuch es noch einmal.</div>`;
  }
  return `<div class="probe">
    <div class="strecke-kurz">${strecke}</div>
    <p><button type="button" class="knopf ${m7 ? 'haupt' : ''}" id="probeLos" ${p?.status === 'laeuft' ? 'disabled' : ''}><span class="ico" data-i="probe"></span>${p && !W.probeAlt ? 'Noch einmal ausprobieren' : 'Probelauf starten'}</button></p>
    ${ergebnis}
  </div>`;
}

function ablegenHtml() {
  if (mangel(7)) return '<div class="hinweis-zeile">Erst der Probelauf in Schritt 7, dann kannst du die App ablegen.</div>';
  const kats = W.kat?.kategorien || [];
  return `<div class="ablegen">
    <div class="kacheln" role="group" aria-label="Ablageort">
      ${kachelHtml({ schluessel: 'o-apps', wahl: 'ort|apps', titel: 'Meine Apps', icon: 'app', kurz: 'Immer dabei: die Übersicht im linken Menü.', gutFuer: 'Alle Apps an einem Ort, nach Kategorien.', gewaehlt: true, ecke: '<span class="ecke-ok">✓</span>' })}
      ${kachelHtml({ schluessel: 'o-leiste', wahl: 'ort|leiste', titel: 'Auch in die Taskleiste', icon: 'leiste', kurz: 'Ein Knopf unten am Bildschirmrand.', gutFuer: 'Apps, die du oft brauchst.', daten: 'Wird jetzt gemerkt; der Knopf erscheint ab Phase F.', gewaehlt: W.taskleiste, ecke: W.taskleiste ? '<span class="ecke-ok">✓</span>' : '' })}
    </div>
    <div class="felder">
      <label class="feld"><span>Kategorie ${infoKnopf('f-kat', 'Kategorie', 'In dieser Spalte steht die App in „Meine Apps“. Du kannst sie dort später per Ziehen umsortieren.')}</span>
        <select id="kategorie">${kats.map((k) => `<option value="${esc(k.id)}" ${k.id === W.kategorie ? 'selected' : ''}>${esc(k.name)}</option>`).join('')}</select></label>
    </div>
    <p><button type="button" class="knopf haupt gross" id="ablegen" ${W.abgelegt ? 'disabled' : ''}><span class="ico" data-i="haken"></span>${W.abgelegt ? 'Abgelegt' : 'App ablegen'}</button></p>
  </div>`;
}

// ------------------------------------------------------------------ Handlungen
function gehe(nr) {
  if (nr < 1 || nr > 8 || !erreichbar(nr)) return;
  if (W.alle) {
    $(`[data-abschnitt="${nr}"]`)?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    return;
  }
  W.schritt = nr;
  W.besucht.add(nr);
  zeichnen();
  $('#haupt').scrollTop = 0;
  $('#haupt .abschnitt h2')?.setAttribute('tabindex', '-1');
  $('#haupt .abschnitt h2')?.focus({ preventScroll: true });
}
function weiter() {
  const nr = W.schritt;
  if (nr === 4 && !W.app.wahl.filter) return gehe(5);
  if (mangel(nr)) { hinweis(mangel(nr), true); return; }
  if (nr === 3 && !filterMoeglich()) { W.besucht.add(4); return gehe(5); }
  gehe(nr + 1);
}
function zurueck() {
  let nr = W.schritt - 1;
  if (nr === 4 && !filterMoeglich() && !W.app.wahl.filter) nr = 3;
  gehe(nr);
}

/** Eine Kachel gewählt. Spätere Wahlen, die nicht mehr passen, fallen mit Hinweis heraus. */
function waehlen(art, id) {
  if (art === 'ausloeser') {
    if (W.app.ausloeser.art === id) return;
    W.app.ausloeser = { art: id, regel: id === 'zeitplan' ? (W.app.ausloeser.regel && regelOk(W.app.ausloeser.regel) ? W.app.ausloeser.regel : { typ: 'taeglich', uhrzeit: '07:00' }) : null };
    return aendern();
  }
  if (art === 'ort') {
    // Taskleiste und Kategorie gehen mit „App ablegen“ an den Server, nicht über Speichern.
    if (id === 'leiste') { W.taskleiste = !W.taskleiste; zeichnen(); }
    return;
  }
  const b = info(id);
  if (!b || !b.bereit || passt(b)) return;
  if (W.app.wahl[art]?.baustein === id) return;
  const einstellungen = {};
  for (const f of b.felder || []) einstellungen[f.name] = f.vorgabe;
  W.app.wahl[art] = { baustein: id, einstellungen };
  const raus = [];
  for (const spaeter of ARTEN.slice(ARTEN.indexOf(art) + 1)) {
    const w = W.app.wahl[spaeter];
    const sb = w && info(w.baustein);
    if (sb && passt(sb)) { raus.push(sb.titel); W.app.wahl[spaeter] = null; }
  }
  if (raus.length) hinweis(`${raus.map((t) => `„${t}“`).join(' und ')} passt nicht mehr dazu und wurde herausgenommen.`);
  aendern();
}

async function probeStarten() {
  if ([1, 2, 3, 5, 6].some((i) => mangel(i))) return;
  W.probe = { status: 'laeuft' };
  zeichnen();
  try {
    await sichern();
    if (!W.id) throw new Error('Die App ist noch nicht gespeichert. Prüf Name und Quelle');
    const p = await api('ausfuehren', { id: W.id, probe: true });
    let ausgabe = null;
    if (p.stempel) {
      try { ausgabe = (await api(`abbild?id=${encodeURIComponent(W.id)}&stempel=${encodeURIComponent(p.stempel)}`)).abbild; } catch { ausgabe = null; }
    }
    W.probe = { status: p.status, ergebnis: p.ergebnis, fehler: p.fehler, schritte: p.schritte, ausgabe };
    W.probeAlt = p.status !== 'ok';
  } catch (e) {
    W.probe = { status: 'fehler', fehler: { text: e.message } };
  }
  zeichnen();
  if (W.probe.status === 'ok' && !W.alle) $('#weiter')?.focus();
}

async function ablegen() {
  try {
    await sichern();
    const r = await api('ablegen', { id: W.id, kategorie: W.kategorie || undefined, taskleiste: W.taskleiste });
    W.abgelegt = true;
    W.kategorie = r.app.kategorie;
    W.ansicht = 'fertig';
    zeichnen();
    $('[data-oeffnen]')?.focus();
  } catch (e) { fehler(e); }
}

function neuAnfangen() {
  W.app = leer(); W.id = null; W.warAktiv = false; W.probe = null; W.probeAlt = true; W.abgelegt = false;
  W.kategorie = null; W.taskleiste = false; W.schritt = 1; W.besucht = new Set([1]); W.dirty = false;
  W.ansicht = 'bau';
  zeichnen();
  $('#name')?.focus();
}

async function zuApps(id) {
  try { await sichern(); } catch { /* der Hinweis steht schon */ }
  location.href = '/promptheus-apps/' + (id ? `#app=${encodeURIComponent(id)}` : '');
}

// Klicks
document.addEventListener('click', async (ev) => {
  const t = ev.target;
  if (!t.closest) return;
  const kachel = t.closest('[data-wahl]');
  if (kachel) {
    if (kachel.classList.contains('gesperrt')) { tipZeigen(kachel); return; }
    const [art, id] = kachel.dataset.wahl.split('|');
    return waehlen(art, id);
  }
  const g = t.closest('[data-gehe]');
  if (g && !g.disabled) return gehe(Number(g.dataset.gehe));
  if (t.closest('[data-neu]')) return neuAnfangen();
  const v = t.closest('[data-vorlage]');
  if (v) { const x = W.kat.vorlagen.find((y) => y.vorlage === v.dataset.vorlage); if (x) uebernehmen({ ...x.app, ablage: {} }, false, true); return; }
  const e = t.closest('[data-entwurf]');
  if (e) { try { const d = await api('bearbeiten?id=' + encodeURIComponent(e.dataset.entwurf)); uebernehmen(d.app, d.probeOk); } catch (f) { fehler(f); } return; }
  if (t.closest('[data-lokal]')) {
    const l = speicher.lies('werkbank.entwurf', null);
    if (l) { W.app = { ...leer(), ...l, wahl: { ...leer().wahl, ...(l.wahl || {}) }, ausloeser: l.ausloeser || leer().ausloeser }; W.id = null; W.ansicht = 'bau'; W.schritt = ersterOffener() ?? 1; W.besucht = new Set(SCHRITTE.filter((s) => s.nr <= W.schritt).map((s) => s.nr)); zeichnen(); }
    return;
  }
  if (t.closest('[data-filter-weg]')) { W.app.wahl.filter = null; return aendern(); }
  if (t.closest('#probeLos')) return probeStarten();
  if (t.closest('#ablegen')) return ablegen();
  if (t.closest('[data-oeffnen]')) return zuApps(W.id);
  if (t.closest('[data-nochmal]')) return neuAnfangen();
  if (t.closest('[data-team]')) { window.parent.postMessage({ art: 'promptheus-apps:team-beratung' }, location.origin); return; }
  if (t.closest('.info')) { ev.preventDefault(); const i = t.closest('.info'); if (tipAnker === i) tipWeg(); else tipZeigen(i); }
});
$('#weiter').addEventListener('click', weiter);
$('#zurueck').addEventListener('click', zurueck);
$('#ueberspringen').addEventListener('click', () => { W.besucht.add(4); gehe(5); });
$('#zu').addEventListener('click', async () => { try { await sichern(); } catch { /* steht schon da */ } schliessenGanz(); });
if (!IM_RAHMEN) $('#zu').hidden = true;
$('#zuApps').addEventListener('click', () => zuApps());
$('#alleZeigen').checked = W.alle;
$('#alleZeigen').addEventListener('change', (ev) => { W.alle = ev.target.checked; speicher.setz('werkbank.alle', W.alle); zeichnen(); });

// Eingaben: Zustand mitschreiben, ohne die Hauptfläche neu zu zeichnen (sonst ginge der Fokus verloren).
document.addEventListener('input', (ev) => {
  const t = ev.target;
  if (t.id === 'name') { W.app.name = t.value.slice(0, 60); return aendern(false); }
  if (t.id === 'ziel') { W.app.ziel = t.value.slice(0, 300); return aendern(false); }
  if (t.dataset.regelFeld) {
    const r = { ...(W.app.ausloeser.regel || { typ: 'taeglich' }) };
    const f = t.dataset.regelFeld;
    r[f] = f === 'tag' || f === 'stunden' ? Number.parseInt(t.value, 10) : t.value;
    W.app.ausloeser.regel = r;
    return aendern(f === 'typ');
  }
  if (t.dataset.art && t.dataset.name) {
    const w = W.app.wahl[t.dataset.art];
    if (!w) return;
    const b = info(w.baustein);
    const f = b?.felder?.find((x) => x.name === t.dataset.name);
    if (!f) return;
    w.einstellungen[f.name] = f.typ === 'schalter' ? t.checked : f.typ === 'zahl' ? (t.value === '' ? f.vorgabe : Number(t.value)) : t.value;
    if (f.typ === 'schalter') t.parentElement.lastChild.textContent = t.checked ? ' an' : ' aus';
    return aendern(false);
  }
  if (t.id === 'kategorie') W.kategorie = t.value;
});
document.addEventListener('change', (ev) => {
  // Auswahllisten melden sich in manchen Browsern nur mit change.
  if (ev.target.tagName === 'SELECT' || ev.target.type === 'checkbox') ev.target.dispatchEvent(new Event('input', { bubbles: true }));
});

// Tastatur: Pfeiltasten in einer Kachelreihe, Alt+Pfeil für Weiter/Zurück, Esc.
document.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape') {
    if (!$('#tip').hidden) { tipWeg(); return; }
    $('#zu').click();
    return;
  }
  if (ev.altKey && W.ansicht === 'bau' && !W.alle) {
    if (ev.key === 'ArrowRight' && !$('#weiter').disabled && !$('#weiter').hidden) { ev.preventDefault(); weiter(); }
    if (ev.key === 'ArrowLeft' && W.schritt > 1) { ev.preventDefault(); zurueck(); }
    return;
  }
  const k = ev.target.closest?.('.kachel');
  if (!k || !['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(ev.key)) return;
  const alle = $$('.kachel', k.parentElement);
  const i = alle.indexOf(k) + (ev.key === 'ArrowRight' || ev.key === 'ArrowDown' ? 1 : -1);
  if (alle[i]) { ev.preventDefault(); alle[i].focus(); }
});

symbole();
laden();
if (IM_RAHMEN) window.parent.postMessage({ art: 'promptheus-apps:bereit' }, location.origin);
