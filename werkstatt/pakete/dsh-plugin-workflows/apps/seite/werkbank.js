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
const DATEN_WORT = { dateien: 'Dateien', liste: 'eine Liste', ausgabe: 'ein Ergebnis', mails: 'Mails', artikel: 'Beiträge', seite: 'eine Webseite', angebote: 'Angebote' };
/** `braucht` darf eine Liste sein: dann passt jede dieser Arten. */
const brauchtPasst = (br, f) => !br || (Array.isArray(br) ? br.includes(f) : br === f);
const brauchtWort = (br) => (Array.isArray(br) ? br : [br]).map((x) => DATEN_WORT[x] || x).join(' oder ');
/** Was bei „KI fragen“ mit den Daten passiert (Plan 10.2), steht an jedem Knopf und in jedem Feld. */
const KI_DATEN = 'Dein Text geht maskiert über die Schutzschicht der Werkstatt an das KI-Modell (OpenRouter, möglicherweise ausserhalb der EU). Trag keine Namen, Adressen oder Zugangsdaten ein.';

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
  /** Startseite: Zweck-Filter, Suchtext, Vorschläge der KI. */
  zweck: 'alle',
  suche: '',
  kiStart: null,
  /** Fragebogen einer Vorlage: { v, antworten }. */
  fb: null,
  /** Offene KI-Hilfen je Ort („v:<vorlage>:<frage>“ oder „b:<art>:<feld>“). */
  ki: new Map(),
};

/** Ein Baustein aus dem Katalog, laufbereit oder für später. */
function info(id) {
  if (!W.kat || !id) return null;
  const b = W.kat.bausteine.bereit.find((x) => x.id === id);
  if (b) return { ...b, bereit: true };
  const f = W.kat.bausteine.folgt.find((x) => x.id === id);
  return f ? { ...f, bereit: false, felder: f.felder || [] } : null;
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
  if (brauchtPasst(b.braucht, f)) return null;
  const quelle = info(W.app.wahl.quelle?.baustein);
  if (!f) return `Braucht ${brauchtWort(b.braucht)}. Wähle erst eine passende Quelle.`;
  return `Braucht ${brauchtWort(b.braucht)}, ${quelle ? `„${quelle.titel}“` : 'die Strecke davor'} liefert ${DATEN_WORT[f] || f}.`;
}
function kacheln(art) {
  if (!W.kat) return [];
  return [...W.kat.bausteine.bereit.map((b) => ({ ...b, bereit: true })), ...W.kat.bausteine.folgt.map((b) => ({ ...b, bereit: false, felder: b.felder || [] }))]
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
  if (!b.bereit) {
    const leer = pflichtLeer(w);
    return leer.length ? `Bitte ausfüllen: ${leer.map((f) => f.titel).join(', ')}.`
      : `„${b.titel}“ kommt erst in Phase ${b.phase}. Du kannst trotzdem weiter; soll die App schon jetzt laufen, wähle eine andere Kachel.`;
  }
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
    if (b && !b.bereit) return `„${b.titel}“ kommt erst in Phase ${b.phase}.`;
    return b && !passt(b) ? null : 'Diese Auswahl passt nicht. Nimm sie heraus oder wähle eine andere.';
  }
  if (nr === 5) return wahlMangel('verarbeitung');
  if (nr === 6) return wahlMangel('ziel');
  if (nr === 7) {
    for (let i = 1; i <= 6; i++) {
      if (!mangel(i)) continue;
      if (nurSpaeter(i)) {
        const b = info(W.app.wahl[SCHRITTE[i - 1].art].baustein);
        return `„${b.titel}“ kommt erst in Phase ${b.phase}. Bis dahin bleibt die App ein Entwurf; gespeichert ist sie schon, und deine Einstellungen bleiben.`;
      }
      return `Erst Schritt ${i} („${SCHRITTE[i - 1].kurz}“) fertig machen.`;
    }
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
/**
 * Fehlt einem Schritt nur, dass sein Baustein erst später gebaut wird? Dann
 * hält er nicht auf: Man kann weiter, die übrigen Schritte ansehen und
 * einstellen. Probelauf und Ablegen bleiben bis dahin zu.
 */
function nurSpaeter(nr) {
  const art = SCHRITTE[nr - 1]?.art;
  const w = art && W.app.wahl[art];
  const b = w && info(w.baustein);
  return !!b && !b.bereit && !passt(b) && !pflichtLeer(w).length;
}
/** Der erste Schritt, der wirklich aufhält. */
function ersterSperrender() {
  for (const s of SCHRITTE) if (s.pflicht && !erledigt(s.nr) && !nurSpaeter(s.nr)) return s.nr;
  return null;
}
function prozent() {
  const n = SCHRITTE.filter((s) => s.pflicht && erledigt(s.nr)).length;
  return Math.round((n / PFLICHT_ZAHL) * 100);
}
/** Bis wohin man springen darf: bis zum ersten offenen Pflichtschritt. */
function erreichbar(nr) {
  const o = ersterSperrender();
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
  if (W.ansicht === 'start') {
    const treffer = $('[data-treffer]');
    if (treffer) return pfeilAuf(treffer, 'Einrichten');
    if (W.kiStart?.status === 'zustimmung') return pfeilAuf($('[data-ki-ja]'), 'Einverstanden?');
    return W.suche.trim().length >= 3 ? pfeilAuf($('#kiVorlage'), 'KI fragen') : pfeilAuf($('#wunsch'), 'Beschreib es hier');
  }
  if (W.ansicht === 'fragen') {
    const offen = fbOffen();
    const li = offen && `[data-frage="${CSS.escape(offen.id)}"]`;
    return offen ? pfeilAuf($(`${li} [data-fb], ${li} .wahl-chips`), 'Ausfüllen') : pfeilAuf($('#fbFertig'), 'Weiter');
  }
  if (W.ansicht === 'fertig') return pfeilAuf($('[data-oeffnen]'), 'Ansehen');
  const nr = W.alle ? (ersterSperrender() ?? 8) : W.schritt;
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
    if (!w || !b || passt(b)) return pfeilAuf($('.kachel:not(.gesperrt):not(.gewaehlt)', bereich), 'Hier wählen');
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
  // „Meine Apps“ → „Vorlage wählen“ kann gleich eine Vorlage mitgeben.
  const vq = new URLSearchParams(location.search).get('vorlage');
  const v = vq && W.kat.vorlagen.find((x) => x.vorlage === vq);
  if (v) return vorlageWaehlen(v);
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
  $('#stand').hidden = W.ansicht === 'start' || W.ansicht === 'fragen';
  $('#fuss').hidden = W.ansicht !== 'bau' || W.alle;
  $('#alleZeigen').closest('label').hidden = W.ansicht !== 'bau';
  if (W.ansicht === 'start') haupt.innerHTML = startHtml();
  else if (W.ansicht === 'fragen') haupt.innerHTML = fragebogenHtml();
  else if (W.ansicht === 'fertig') haupt.innerHTML = fertigHtml();
  else if (W.alle) haupt.innerHTML = SCHRITTE.map((s) => `<section class="abschnitt" data-abschnitt="${s.nr}">${schrittHtml(s.nr)}</section>`).join('');
  else haupt.innerHTML = `<section class="abschnitt einzeln" data-abschnitt="${W.schritt}">${schrittHtml(W.schritt)}</section>`;
  symbole(haupt);
  teilZeichnen();
}

/** Alles ausser der Hauptfläche: Kopf, Schrittleiste, Ring, Fuss, Pfeil. Bricht keine Eingabe ab. */
function teilZeichnen() {
  const titel = W.app.name.trim();
  $('#wbTitel').textContent = W.ansicht === 'fragen' ? `Workflow-Werkbank · Vorlage „${W.fb.v.titel}“`
    : titel && W.ansicht !== 'start' ? `Workflow-Werkbank · „${titel}“` : 'Workflow-Werkbank';
  const stand = $('#wbStand');
  stand.hidden = W.ansicht === 'start' || W.ansicht === 'fragen';
  const s = W.abgelegt ? ['aktiv', 'Aktiv'] : !W.probeAlt && W.probe?.status === 'ok' ? ['aktiv', 'Probelauf ok'] : ['entwurf', W.id ? 'Entwurf gespeichert' : 'Entwurf'];
  stand.className = `plakette p-${s[0]}`;
  stand.textContent = s[1];
  if (W.ansicht === 'bau') {
    $('#schrittleiste').innerHTML = leisteHtml();
    fussSetzen();
  }
  if (W.ansicht === 'bau' || W.ansicht === 'fertig') {
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
    const spaeter = nurSpaeter(s.nr) && W.besucht.has(s.nr);
    const zustand = jetzt ? 'jetzt' : ueber ? 'ueber' : spaeter ? 'spaeter' : ok && (W.besucht.has(s.nr) || s.nr < W.schritt) ? 'ok' : W.besucht.has(s.nr) && !ok ? 'fehlt' : 'offen';
    const zeichen = zustand === 'ok' ? '✓' : zustand === 'fehlt' ? '✕' : zustand === 'ueber' ? '–' : zustand === 'spaeter' ? '…' : String(s.nr);
    const wort = { jetzt: 'jetzt', ok: 'erledigt', fehlt: 'fehlt noch', ueber: 'übersprungen', spaeter: 'folgt in einer späteren Phase', offen: s.pflicht ? 'offen' : 'freiwillig' }[zustand];
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
    const klasse = frei ? (W.app.wahl.filter ? (nurSpaeter(4) ? 'spaeter' : 'ok') : 'frei') : ok ? 'ok' : nurSpaeter(s.nr) ? 'spaeter' : 'fehlt';
    const zeichen = klasse === 'ok' ? '✓' : klasse === 'frei' ? '○' : klasse === 'spaeter' ? '…' : '✕';
    const wort = klasse === 'ok' ? 'erledigt' : klasse === 'frei' ? 'freiwillig' : klasse === 'spaeter' ? 'folgt' : 'fehlt';
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
  weiter.disabled = !!m && !(nr === 4 && !W.app.wahl.filter) && !nurSpaeter(nr);
  $('#fehlt').textContent = nr === 4 && !W.app.wahl.filter ? 'Freiwillig: wähle eine Auswahl oder überspring den Schritt.' : (m && nr < 8 ? m : '');
}

// ---------- Startseite
function startHtml() {
  let lokal = speicher.lies('werkbank.entwurf', null);
  if (lokal && typeof lokal.name !== 'string') lokal = null;
  const entwuerfe = W.kat?.entwuerfe || [];
  const vorlagen = W.kat?.vorlagen || [];
  const zwecke = [{ id: 'alle', name: 'Alle', icon: 'app' }, ...(W.kat?.gruppen || [])].map((g) => {
    const n = g.id === 'alle' ? vorlagen.length : vorlagen.filter((v) => v.gruppe === g.id).length;
    return n ? `<button type="button" class="zweck" data-zweck="${esc(g.id)}" aria-pressed="${W.zweck === g.id}"><span class="ico" data-i="${esc(g.icon)}"></span>${esc(g.name)} <span class="zweck-zahl">${n}</span></button>` : '';
  }).join('');
  const weiter = [
    ...(lokal && (lokal.name || lokal.wahl?.quelle) ? [`<button type="button" class="knopf" data-lokal><span class="ico" data-i="werkzeug"></span>${esc(lokal.name || 'Ohne Namen')} <span class="leise">· nicht gespeichert</span></button>`] : []),
    ...entwuerfe.map((e) => `<button type="button" class="knopf" data-entwurf="${esc(e.id)}"><span class="ico" data-i="${esc(e.icon)}"></span>${esc(e.name)}</button>`),
  ];
  return `<div class="start">
    <h2>Was möchtest du automatisieren?</h2>
    <p class="start-unter">Eine App ist ein Ablauf, den du einmal einrichtest und dann per Klick oder nach Zeitplan laufen lässt. Beschreib in deinen Worten, was sie tun soll, oder nimm eine Vorlage. Nichts läuft, bevor du es ausprobiert hast.</p>
    <div class="wunsch-zeile">
      <label class="sr" for="wunsch">Was soll deine App tun?</label>
      <input type="search" id="wunsch" maxlength="600" autocomplete="off" value="${esc(W.suche)}"
        placeholder="zum Beispiel: KI-News jeden Mittag aufs Handy">
      <button type="button" class="knopf haupt" id="kiVorlage" data-tip="${tipSetzen('ki-start', 'KI fragen', ['Hephaistos liest deinen Satz und schlägt die passenden Vorlagen vor, mit einem Satz, warum.', { art: 'daten', text: KI_DATEN }])}"><span class="ico" data-i="funke"></span>KI fragen</button>
    </div>
    <div id="kiStart">${kiStartHtml()}</div>
    <div class="zweck-leiste" role="group" aria-label="Vorlagen nach Zweck">${zwecke}</div>
    <div class="start-raster" id="vorlagenRaster">${rasterHtml()}</div>
    ${weiter.length ? `<h3 class="start-h3">Weitermachen</h3><div class="start-weiter">${weiter.join('')}</div>` : ''}
    ${IM_RAHMEN ? '<p class="start-alt">Du suchst die bisherige Team-Beratung (Auftrag für den Chat zusammenstellen)? <button type="button" class="verweis" data-team>Hier geht es dorthin.</button> Ab Phase E übernimmt Hephaistos das in der Werkbank.</p>' : ''}
  </div>`;
}

// ---------- Vorlagen (Plan 11 und 11.1)
/** Die Phasen der Bausteine einer Vorlage, die noch nicht laufen. */
function vorlageSpaeter(v) {
  return [...new Set(v.app.schritte.map((s) => info(s.baustein)).filter((b) => b && !b.bereit).map((b) => b.phase))].sort();
}
const FUELLWORT = new Set(['und', 'oder', 'der', 'die', 'das', 'den', 'dem', 'ein', 'eine', 'einen', 'mir', 'mich', 'mein', 'meine', 'jeden', 'jede', 'auf', 'aufs', 'aus', 'mit', 'von', 'für', 'ich', 'soll', 'will', 'möchte', 'bitte', 'zum', 'zur', 'als', 'wie', 'was', 'wenn']);
/** Vorlagen nach Zweck und Suchwörtern; die besten Treffer zuerst. */
function passendeVorlagen() {
  const worte = W.suche.toLowerCase().split(/[^a-z0-9äöüß-]+/).filter((x) => x.length > 2 && !FUELLWORT.has(x));
  const liste = (W.kat?.vorlagen || []).filter((v) => W.zweck === 'alle' || v.gruppe === W.zweck);
  if (!worte.length) return liste;
  // Ein Wort im Titel zählt doppelt: „News … Mittag“ soll die KI-News vor dem „Nachmittag“ des Lernplans finden.
  return liste.map((v) => {
    const titel = v.titel.toLowerCase();
    const rest = `${v.text} ${(v.fragen || []).map((f) => f.frage).join(' ')}`.toLowerCase();
    return { v, n: worte.reduce((n, w) => n + (titel.includes(w) ? 2 : rest.includes(w) ? 1 : 0), 0) };
  }).filter((x) => x.n > 0).sort((a, b) => b.n - a.n).map((x) => x.v);
}
function vorlageKarte(v) {
  const phasen = vorlageSpaeter(v);
  const teile = v.app.schritte.map((s) => info(s.baustein)).filter((b) => b && !b.bereit).map((b) => b.titel);
  const fragen = (v.fragen || []).filter((f) => !f.wenn).length;
  const zeilen = [
    v.text,
    fragen ? `${fragen === 1 ? 'Eine Frage' : `${fragen} kurze Fragen`}, dann bist du beim Probelauf.` : 'Die Schritte sind vorausgefüllt; du prüfst sie und machst den Probelauf.',
    (v.fragen || []).some((f) => f.ki) ? 'Mit „KI fragen“ bei den Angaben, bei denen es auf Fachwissen ankommt.' : '',
    phasen.length ? { art: 'warn', text: `Noch nicht fertig: ${teile.join(', ')} (Phase ${phasen.join(' und ')}). Du kannst sie schon einrichten; sie bleibt Entwurf, bis die Teile gebaut sind.` } : '',
  ];
  return `<button type="button" class="start-karte" data-vorlage="${esc(v.vorlage)}" data-tip="${tipSetzen(`v-${v.vorlage}`, v.titel, zeilen)}">
    <span class="ico" data-i="${esc(v.app.icon)}"></span><b>${esc(v.titel)}</b><span>${esc(v.text)}</span>
    ${phasen.length ? `<em class="plakette p-warn">Teile folgen · Phase ${esc(phasen.join('/'))}</em>` : '<em class="plakette p-aktiv">Läuft sofort</em>'}</button>`;
}
function rasterHtml() {
  const liste = passendeVorlagen();
  const selbst = `<button type="button" class="start-karte neu" data-neu data-tip="${tipSetzen('neu', 'Selbst zusammenstellen', ['Acht kurze Schritte: Name, wann, woher, was tun, wohin, ausprobieren, ablegen.', 'Zu jeder Kachel gibt es eine Erklärung, wenn du mit der Maus darauf zeigst.'])}">
    <span class="ico" data-i="werkzeug"></span><b>Selbst zusammenstellen</b><span>Schritt für Schritt, mit Erklärung zu jeder Kachel.</span></button>`;
  const leer = !liste.length
    ? `<p class="raster-leer">Keine Vorlage passt zu diesen Wörtern. Frag die KI oder stell die App selbst zusammen.</p>` : '';
  return selbst + liste.map(vorlageKarte).join('') + leer;
}
function rasterNeu() {
  const r = $('#vorlagenRaster');
  if (!r) return;
  tipWeg();
  r.innerHTML = rasterHtml();
  symbole(r);
  pfeilWaehlen();
}

/** Eine Vorlage gewählt: mit Fragebogen erst die Fragen, sonst gleich in die Werkbank. */
function vorlageWaehlen(v) {
  if (!v.fragen?.length) return uebernehmen({ ...v.app, ablage: {} }, false, true);
  const antworten = {};
  for (const f of v.fragen) antworten[f.id] = f.vorgabe;
  W.fb = { v, antworten };
  W.ki.clear();
  W.ansicht = 'fragen';
  zeichnen();
  $('#haupt').scrollTop = 0;
  $('#haupt h2')?.focus({ preventScroll: true });
}

// ---------- Fragebogen einer Vorlage
const fbSichtbar = (f) => !f.wenn || W.fb.antworten[f.wenn.frage] === f.wenn.ist;
const fbLeer = (f) => String(W.fb.antworten[f.id] ?? '').trim() === '';
/** Die erste sichtbare Pflichtfrage ohne Antwort. */
function fbOffen() {
  return W.fb?.v.fragen.find((f) => f.pflicht && fbSichtbar(f) && fbLeer(f)) || null;
}
function fbFrageHtml(f, nr) {
  const wert = W.fb.antworten[f.id];
  const id = `fb-${f.id}`;
  const k = `id="${id}" data-fb="${esc(f.id)}"`;
  const chips = f.typ === 'wahl' || f.typ === 'janein';
  let feld;
  if (chips) {
    const werte = f.typ === 'janein' ? [{ wert: false, wort: 'Nein' }, { wert: true, wort: 'Ja' }] : f.werte || [];
    feld = `<div class="wahl-chips" role="radiogroup" aria-labelledby="${id}-l">${werte.map((w) => `<button type="button" class="wahl-chip" role="radio" aria-checked="${w.wert === wert}" data-fb-wahl="${esc(f.id)}|${esc(String(w.wert))}">${esc(w.wort)}</button>`).join('')}</div>`;
  } else if (f.typ === 'mehrzeilig') feld = `<textarea ${k} rows="5" maxlength="${esc(f.laenge || 4000)}" placeholder="${esc(f.beispiel || '')}">${esc(wert ?? '')}</textarea>`;
  else if (f.typ === 'uhrzeit') feld = `<input type="time" ${k} value="${esc(wert || '')}">`;
  else if (f.typ === 'tag') feld = `<select ${k}>${WOCHENTAGE.map((t, i) => `<option value="${i}" ${Number(wert) === i ? 'selected' : ''}>${t}</option>`).join('')}</select>`;
  else if (f.typ === 'stunden') feld = `<span class="fb-zahl">alle <input type="number" ${k} min="1" max="12" step="1" value="${esc(wert ?? 3)}"> Stunden</span>`;
  else if (f.typ === 'zahl') feld = `<input type="number" ${k} min="0" value="${esc(wert ?? 0)}">`;
  else feld = `<input type="text" ${k} maxlength="${esc(f.laenge || 200)}" autocomplete="off" value="${esc(wert ?? '')}" placeholder="${esc(f.beispiel ? `zum Beispiel: ${f.beispiel}` : '')}">`;
  const ort = `v:${W.fb.v.vorlage}:${f.id}`;
  const fertig = !fbLeer(f);
  const label = `${esc(f.frage)} ${f.hilfe ? infoKnopf(`fbh-${f.id}`, f.frage, f.hilfe) : ''}${f.pflicht ? '<em class="pflicht">Pflicht</em>' : ''}`;
  const hier = fbOffen()?.id === f.id;
  return `<li class="fb-frage${fertig ? ' beantwortet' : ''}${hier ? ' pfeil-hier' : ''}" data-frage="${esc(f.id)}" data-nr="${nr}">
    <span class="fb-nr" aria-hidden="true">${fertig ? '✓' : nr}</span>
    <div class="fb-inhalt">
      ${chips ? `<span class="fb-label" id="${id}-l">${label}</span>` : `<label class="fb-label" for="${id}">${label}</label>`}
      <div class="fb-feld${f.typ === 'mehrzeilig' ? ' hoch' : ''}">${feld}${f.ki ? kiKnopfHtml(ort) : ''}</div>
      ${f.ki ? `<div class="ki-ort" data-ki-ort="${esc(ort)}">${kiPanelHtml(ort)}</div>` : ''}
    </div></li>`;
}
function fragebogenHtml() {
  const { v } = W.fb;
  const gruppe = (W.kat.gruppen || []).find((g) => g.id === v.gruppe);
  const phasen = vorlageSpaeter(v);
  const teile = v.app.schritte.map((s) => info(s.baustein)).filter((b) => b && !b.bereit).map((b) => `„${b.titel}“`);
  const sichtbar = v.fragen.filter(fbSichtbar);
  const offen = fbOffen();
  return `<div class="fragebogen">
    <div class="fb-kopf"><span class="ico fb-ico" data-i="${esc(v.app.icon)}"></span><div>
      <span class="schritt-zahl">Vorlage${gruppe ? ` · ${esc(gruppe.name)}` : ''}</span>
      <h2 tabindex="-1">${esc(v.titel)} einrichten</h2>
      <p class="schritt-unter">${esc(v.text)}</p></div></div>
    <p class="fb-unter">${sichtbar.length === 1 ? 'Eine Frage' : `${sichtbar.length} kurze Fragen`}, dann bist du beim Probelauf. Alles lässt sich danach in der Werkbank ändern.</p>
    ${phasen.length ? `<div class="hinweis-zeile lapis">${esc(teile.length > 1 ? `${teile.slice(0, -1).join(', ')} und ${teile.at(-1)}` : teile[0])} ${teile.length === 1 ? 'kommt' : 'kommen'} erst in Phase ${esc(phasen.join(' und '))}. Du kannst die App schon einrichten; sie bleibt Entwurf, bis alle Teile gebaut sind.</div>` : ''}
    <ol class="fb-liste">${sichtbar.map((f, i) => fbFrageHtml(f, i + 1)).join('')}</ol>
    <div class="fb-fuss">
      <button type="button" class="knopf" data-fb-zurueck><span class="ico" data-i="zurueck"></span>Andere Vorlage</button>
      <span class="wb-fehlt" id="fbFehlt" aria-live="polite">${offen ? esc(`Noch offen: „${offen.frage}“`) : ''}</span>
      <button type="button" class="knopf haupt gross" id="fbFertig">Weiter zur Werkbank<span class="ico" data-i="weiter"></span></button>
    </div>
  </div>`;
}
/** Nach einer Eingabe: Häkchen und „Noch offen“ nachziehen, ohne das Feld neu zu zeichnen. */
function fbTeil() {
  for (const li of $$('.fb-frage')) {
    const f = W.fb.v.fragen.find((x) => x.id === li.dataset.frage);
    if (!f) continue;
    const fertig = !fbLeer(f);
    li.classList.toggle('beantwortet', fertig);
    li.classList.toggle('pfeil-hier', fbOffen()?.id === f.id);
    $('.fb-nr', li).textContent = fertig ? '✓' : li.dataset.nr;
  }
  const offen = fbOffen();
  $('#fbFehlt').textContent = offen ? `Noch offen: „${offen.frage}“` : '';
  pfeilWaehlen();
}
/** Die Antworten in die Strecke der Vorlage eintragen. */
function fbAnwenden() {
  const { v, antworten } = W.fb;
  const app = structuredClone(v.app);
  for (const f of v.fragen) {
    if (!fbSichtbar(f)) continue;
    let w = antworten[f.id];
    if (w === undefined || w === null) continue;
    if (['zahl', 'stunden', 'tag'].includes(f.typ)) w = Number(w);
    else if (f.typ === 'janein') w = w === true;
    else if (typeof w === 'string') w = w.trim();
    const z = f.ziel || {};
    if (z.app === 'name') app.name = w;
    else if (z.ausloeser && app.ausloeser?.regel) app.ausloeser.regel[z.ausloeser] = w;
    else if (z.schritt) {
      const s = app.schritte.find((x) => x.baustein === z.schritt);
      if (s) s.einstellungen[z.feld] = w;
    }
  }
  return app;
}
function fbFertig() {
  const offen = fbOffen();
  if (offen) {
    hinweis(`Bitte noch ausfüllen: „${offen.frage}“.`, true);
    $(`[data-frage="${CSS.escape(offen.id)}"] [data-fb], [data-frage="${CSS.escape(offen.id)}"] .wahl-chip`)?.focus();
    return;
  }
  const app = fbAnwenden();
  W.ki.clear();
  uebernehmen({ ...app, ablage: {} }, false, true);
}

// ---------- KI fragen (Plan 11.2)
const kiOk = () => speicher.lies('werkbank.kiOk', false) === true;
/** Der Ort einer KI-Hilfe: welche Angabe, ihr Wert, wie man ihn setzt. */
function kiOrt(ort) {
  const [art, a, b] = String(ort).split(':');
  if (art === 'v' && W.fb?.v.vorlage === a) {
    const f = W.fb.v.fragen.find((x) => x.id === b);
    return f && { art, koerper: { vorlage: a, frage: b, angaben: W.fb.antworten }, titel: f.frage, mehrzeilig: f.typ === 'mehrzeilig',
      wert: () => String(W.fb.antworten[b] ?? ''), setzen: (x) => { W.fb.antworten[b] = x; } };
  }
  if (art === 'b') {
    const w = W.app.wahl[a];
    const f = w && info(w.baustein)?.felder?.find((x) => x.name === b);
    return f && { art, koerper: { baustein: w.baustein, feld: b }, titel: f.titel, mehrzeilig: f.typ === 'mehrzeilig',
      wert: () => String(w.einstellungen?.[b] ?? ''), setzen: (x) => { w.einstellungen[b] = x; } };
  }
  return null;
}
function kiKnopfHtml(ort) {
  return `<button type="button" class="knopf ki-knopf" data-ki="${esc(ort)}" aria-expanded="${W.ki.has(ort)}"
    data-tip="${tipSetzen(`ki-${ort}`, 'KI fragen', ['Hephaistos stellt dir ein paar Rückfragen zum Antippen und nennt, woran man hier oft nicht denkt. Daraus baut er deine Angabe; übernommen wird nur, was du bestätigst.', { art: 'daten', text: KI_DATEN }])}"><span class="ico" data-i="funke"></span>KI fragen</button>`;
}
function kiZustimmungHtml(ort) {
  return `<p class="ki-unter">Bevor die KI mitdenkt: ${esc(KI_DATEN)} Die Schutzschicht ersetzt erkannte Namen, Adressen und Nummern, bevor etwas hinausgeht.</p>
    <p class="ki-zustimmen"><button type="button" class="knopf haupt" data-ki-ja="${esc(ort)}"><span class="ico" data-i="haken"></span>Einverstanden, KI fragen</button></p>`;
}
function kiKopf(ort, titel = 'Hephaistos denkt mit') {
  return `<p class="ki-kopf"><span class="ico" data-i="funke"></span><b>${esc(titel)}</b>
    <button type="button" class="knopf rund klein" data-ki-zu="${esc(ort)}" aria-label="KI-Hilfe schliessen"><span class="ico" data-i="x"></span></button></p>`;
}
function kiPanelHtml(ort) {
  const z = W.ki.get(ort);
  if (!z) return '';
  let innen = '';
  if (z.status === 'zustimmung') innen = kiZustimmungHtml(ort);
  else if (z.status === 'laedt') innen = `<p class="ki-denkt">${z.modus === 'formulieren' ? 'Hephaistos formuliert deine Angabe …' : 'Hephaistos denkt nach …'}</p>`;
  else if (z.status === 'fehler') {
    innen = `<p class="ki-fehler">✕ ${esc(z.fehler)}</p><p class="ki-unter">Du kannst die Frage auch ohne KI beantworten.</p>
      <p><button type="button" class="knopf klein" data-ki-nochmal="${esc(ort)}">Noch einmal versuchen</button></p>`;
  } else if (z.status === 'fragen') {
    const rf = (z.rueckfragen || []).map((r, i) => `<div class="ki-rf"><span class="ki-rf-frage">${esc(r.frage)}</span>
      <div class="chips">${r.optionen.map((o, j) => `<button type="button" class="wahl-chip klein" aria-pressed="${z.wahl[i] === j}" data-ki-opt="${esc(ort)}|${i}|${j}">${esc(o)}</button>`).join('')}</div></div>`).join('');
    const pk = (z.beachten || []).map((p, i) => `<button type="button" class="ki-punkt" aria-pressed="${z.punkte.has(i)}" data-ki-punkt="${esc(ort)}|${i}">
      <span class="ki-punkt-zeichen" aria-hidden="true">${z.punkte.has(i) ? '✓' : '+'}</span><span>${esc(p)}</span></button>`).join('');
    const gewaehlt = Object.keys(z.wahl).length + z.punkte.size;
    innen = `${z.hinweis ? `<p class="ki-unter">${esc(z.hinweis)}</p>` : ''}
      ${rf ? `<h4>Ein paar Rückfragen <span class="leise">· tipp an, was zutrifft</span></h4>${rf}` : ''}
      ${pk ? `<h4>Woran man oft nicht denkt <span class="leise">· antippen zum Übernehmen</span></h4><div class="ki-punkte">${pk}</div>` : ''}
      <p class="ki-los"><button type="button" class="knopf haupt" data-ki-formulieren="${esc(ort)}"><span class="ico" data-i="funke"></span>Daraus meine Angabe bauen</button>
        <span class="leise">${gewaehlt ? `${gewaehlt} gewählt` : 'Ohne Auswahl formuliert er aus deinem Text.'}</span></p>`;
  } else if (z.status === 'vorschlag') {
    innen = `<p class="ki-unter">Vorschlag für „${esc(kiOrt(ort)?.titel || '')}“:</p>
      <div class="ki-vorschlag">${esc(z.vorschlag)}</div>
      <p class="ki-los"><button type="button" class="knopf haupt" data-ki-nehmen="${esc(ort)}"><span class="ico" data-i="haken"></span>Übernehmen</button>
        <button type="button" class="knopf" data-ki-wieder="${esc(ort)}">Auswahl ändern</button>
        <button type="button" class="knopf" data-ki-zu="${esc(ort)}">Verwerfen</button></p>`;
  }
  const daten = z.status === 'zustimmung' ? '' : `<p class="ki-daten"><span class="ico" data-i="schloss"></span>${esc(KI_DATEN)}</p>`;
  return `<div class="ki-panel" role="region" aria-label="KI-Hilfe">${kiKopf(ort)}${innen}${daten}</div>`;
}
/** Nur das Panel neu zeichnen; das Eingabefeld darüber behält den Fokus. */
function kiNeu(ort) {
  const c = $(`[data-ki-ort="${CSS.escape(ort)}"]`);
  if (c) { c.innerHTML = kiPanelHtml(ort); symbole(c); }
  $(`[data-ki="${CSS.escape(ort)}"]`)?.setAttribute('aria-expanded', String(W.ki.has(ort)));
  pfeilBald();
}
async function kiFragen(ort, modus = 'fragen') {
  const o = kiOrt(ort);
  if (!o) return;
  const z = W.ki.get(ort) || {};
  if (!kiOk()) { W.ki.set(ort, { status: 'zustimmung', modus }); return kiNeu(ort); }
  const koerper = { modus, ...o.koerper, wunsch: o.wert() };
  if (modus === 'formulieren') {
    koerper.antworten = (z.rueckfragen || []).map((r, i) => (z.wahl?.[i] === undefined ? null : { frage: r.frage, option: r.optionen[z.wahl[i]] })).filter(Boolean);
    koerper.punkte = [...(z.punkte || [])].map((i) => z.beachten[i]);
  }
  W.ki.set(ort, { ...z, status: 'laedt', modus });
  kiNeu(ort);
  try {
    const r = await api('ki', koerper);
    const jetzt = W.ki.get(ort);
    if (!jetzt) return;
    if (modus === 'fragen') W.ki.set(ort, { status: 'fragen', rueckfragen: r.rueckfragen, beachten: r.beachten, hinweis: r.hinweis, wahl: {}, punkte: new Set() });
    else W.ki.set(ort, { ...jetzt, status: 'vorschlag', vorschlag: r.vorschlag });
  } catch (e) {
    if (W.ki.get(ort)) W.ki.set(ort, { ...W.ki.get(ort), status: 'fehler', fehler: e.message, modus });
  }
  kiNeu(ort);
}
function kiNehmen(ort) {
  const o = kiOrt(ort);
  const z = W.ki.get(ort);
  if (!o || !z?.vorschlag) return;
  o.setzen(z.vorschlag);
  W.ki.delete(ort);
  if (o.art === 'v') zeichnen(); else aendern();
  hinweis('Übernommen. Du kannst den Text noch ändern.');
}

// ---------- KI auf der Startseite: passende Vorlagen
function kiStartHtml() {
  const z = W.kiStart;
  if (!z) return '';
  if (z.status === 'zustimmung') return `<div class="ki-panel">${kiKopf('start', 'KI fragen')}${kiZustimmungHtml('start')}</div>`;
  if (z.status === 'laedt') return `<div class="ki-panel">${kiKopf('start', 'Hephaistos sucht')}<p class="ki-denkt">Hephaistos sucht die passende Vorlage …</p></div>`;
  if (z.status === 'fehler') return `<div class="ki-panel">${kiKopf('start', 'KI fragen')}<p class="ki-fehler">✕ ${esc(z.fehler)}</p><p class="ki-unter">Unten findest du alle Vorlagen; die Suche filtert sie auch ohne KI.</p></div>`;
  const zeilen = (z.treffer || []).map((t) => {
    const v = W.kat.vorlagen.find((x) => x.vorlage === t.vorlage);
    if (!v) return '';
    const phasen = vorlageSpaeter(v);
    return `<div class="ki-treffer-zeile"><span class="ico" data-i="${esc(v.app.icon)}"></span>
      <div class="ki-treffer-text"><b>${esc(v.titel)}</b>${phasen.length ? ` <em class="plakette p-warn">Teile folgen · Phase ${esc(phasen.join('/'))}</em>` : ''}<span>${esc(t.warum)}</span></div>
      <button type="button" class="knopf haupt klein" data-treffer="${esc(v.vorlage)}">Einrichten</button></div>`;
  }).join('');
  return `<div class="ki-panel ki-treffer">${kiKopf('start', zeilen ? 'Hephaistos schlägt vor' : 'Hephaistos hat nachgedacht')}
    ${zeilen}${z.hinweis ? `<p class="ki-unter">${esc(z.hinweis)}</p>` : ''}
    ${zeilen ? '' : '<p><button type="button" class="knopf" data-neu><span class="ico" data-i="werkzeug"></span>Selbst zusammenstellen</button></p>'}
    <p class="ki-daten"><span class="ico" data-i="schloss"></span>${esc(KI_DATEN)}</p></div>`;
}
function kiStartNeu() {
  const c = $('#kiStart');
  if (c) { c.innerHTML = kiStartHtml(); symbole(c); }
  pfeilWaehlen();
}
async function kiStartFragen() {
  const wunsch = ($('#wunsch')?.value || '').trim();
  if (wunsch.length < 3) { hinweis('Beschreib zuerst in ein paar Worten, was die App tun soll.', true); $('#wunsch')?.focus(); return; }
  if (!kiOk()) { W.kiStart = { status: 'zustimmung' }; return kiStartNeu(); }
  W.kiStart = { status: 'laedt' };
  kiStartNeu();
  try {
    const r = await api('ki', { modus: 'vorlage', wunsch });
    W.kiStart = { status: 'ok', treffer: r.treffer, hinweis: r.hinweis };
  } catch (e) { W.kiStart = { status: 'fehler', fehler: e.message }; }
  kiStartNeu();
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
  if (f.typ === 'wahl') feld = `<select ${k}>${f.werte.map((v) => `<option value="${esc(v)}" ${v === wert ? 'selected' : ''}>${esc(f.worte?.[v] || WERT_WORT[v] || v)}</option>`).join('')}</select>`;
  else if (f.typ === 'schalter') feld = `<span class="haken"><input type="checkbox" ${k} ${wert ? 'checked' : ''}> ${wert ? 'an' : 'aus'}</span>`;
  else if (f.typ === 'zahl') feld = `<input type="number" ${k} value="${esc(wert)}" min="${esc(f.min ?? '')}" max="${esc(f.max ?? '')}">`;
  else if (f.typ === 'mehrzeilig') feld = `<textarea ${k} rows="6" maxlength="${esc(f.laenge || 4000)}">${esc(wert)}</textarea>`;
  else feld = `<input type="text" ${k} value="${esc(wert)}" maxlength="${esc(f.laenge || 200)}">`;
  if (!f.ki) return `<label class="feld${f.typ === 'mehrzeilig' ? ' breit' : ''}" data-feld="${esc(f.name)}">${kopf}${feld}</label>`;
  // Mit KI-Hilfe: das Feld über die ganze Breite, „KI fragen“ daneben, das Panel darunter.
  const ort = `b:${art}:${f.name}`;
  return `<div class="feld-ki breit" data-feld="${esc(f.name)}">
    <label class="feld">${kopf}<span class="fb-feld${f.typ === 'mehrzeilig' ? ' hoch' : ''}">${feld}${kiKnopfHtml(ort)}</span></label>
    <div class="ki-ort" data-ki-ort="${esc(ort)}">${kiPanelHtml(ort)}</div></div>`;
}

function einstellungenHtml(art, w) {
  const b = info(w.baustein);
  if (!b) return '';
  const felder = (b.felder || []).map((f) => feldHtml(art, f, w.einstellungen?.[f.name] ?? f.vorgabe)).join('');
  if (!b.bereit) {
    return `<div class="einstellungen"><p class="einst-hinweis warn">„${esc(b.titel)}“ kommt in Phase ${esc(b.phase)}. Du kannst ihn schon einstellen; die App bleibt Entwurf, bis er gebaut ist. Soll sie jetzt laufen, wähle eine andere Kachel.</p>
      ${felder ? `<div class="felder">${felder}</div>` : ''}
      ${b.daten ? `<p class="einst-hinweis daten"><span class="ico" data-i="schloss"></span>${esc(b.daten)}</p>` : ''}</div>`;
  }
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
  if (mangel(nr) && !nurSpaeter(nr)) { hinweis(mangel(nr), true); return; }
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
  W.fb = null; W.ki.clear();
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
  // KI fragen
  const ki = t.closest('[data-ki]');
  if (ki) { ev.preventDefault(); const ort = ki.dataset.ki; if (W.ki.has(ort)) { W.ki.delete(ort); kiNeu(ort); } else kiFragen(ort); return; }
  const kiJa = t.closest('[data-ki-ja]');
  if (kiJa) {
    speicher.setz('werkbank.kiOk', true);
    const ort = kiJa.dataset.kiJa;
    return ort === 'start' ? kiStartFragen() : kiFragen(ort, W.ki.get(ort)?.modus || 'fragen');
  }
  const kiZu = t.closest('[data-ki-zu]');
  if (kiZu) {
    const ort = kiZu.dataset.kiZu;
    if (ort === 'start') { W.kiStart = null; kiStartNeu(); return; }
    W.ki.delete(ort); kiNeu(ort); $(`[data-ki="${CSS.escape(ort)}"]`)?.focus(); return;
  }
  const kiOpt = t.closest('[data-ki-opt]');
  if (kiOpt) {
    const [ort, i, j] = kiOpt.dataset.kiOpt.split('|');
    const z = W.ki.get(ort);
    if (!z) return;
    if (z.wahl[i] === Number(j)) delete z.wahl[i]; else z.wahl[i] = Number(j);
    kiNeu(ort); $(`[data-ki-opt="${CSS.escape(kiOpt.dataset.kiOpt)}"]`)?.focus(); return;
  }
  const kiPunkt = t.closest('[data-ki-punkt]');
  if (kiPunkt) {
    const [ort, i] = kiPunkt.dataset.kiPunkt.split('|');
    const z = W.ki.get(ort);
    if (!z) return;
    if (z.punkte.has(Number(i))) z.punkte.delete(Number(i)); else z.punkte.add(Number(i));
    kiNeu(ort); $(`[data-ki-punkt="${CSS.escape(kiPunkt.dataset.kiPunkt)}"]`)?.focus(); return;
  }
  const kiForm = t.closest('[data-ki-formulieren]');
  if (kiForm) return kiFragen(kiForm.dataset.kiFormulieren, 'formulieren');
  const kiNimm = t.closest('[data-ki-nehmen]');
  if (kiNimm) return kiNehmen(kiNimm.dataset.kiNehmen);
  const kiWieder = t.closest('[data-ki-wieder]');
  if (kiWieder) { const z = W.ki.get(kiWieder.dataset.kiWieder); if (z) { z.status = 'fragen'; kiNeu(kiWieder.dataset.kiWieder); } return; }
  const kiNochmal = t.closest('[data-ki-nochmal]');
  if (kiNochmal) { const ort = kiNochmal.dataset.kiNochmal; return kiFragen(ort, W.ki.get(ort)?.modus || 'fragen'); }
  if (t.closest('#kiVorlage')) return kiStartFragen();
  // Startseite und Fragebogen
  const zweck = t.closest('[data-zweck]');
  if (zweck) {
    W.zweck = zweck.dataset.zweck;
    $$('[data-zweck]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.zweck === W.zweck)));
    return rasterNeu();
  }
  const treffer = t.closest('[data-treffer]');
  if (treffer) { const x = W.kat.vorlagen.find((y) => y.vorlage === treffer.dataset.treffer); if (x) vorlageWaehlen(x); return; }
  const fbWahl = t.closest('[data-fb-wahl]');
  if (fbWahl) {
    const [id, roh] = fbWahl.dataset.fbWahl.split('|');
    const f = W.fb?.v.fragen.find((x) => x.id === id);
    if (!f) return;
    W.fb.antworten[id] = f.typ === 'janein' ? roh === 'true' : roh;
    const oben = $('#haupt').scrollTop;
    zeichnen();
    $('#haupt').scrollTop = oben;
    $(`[data-fb-wahl="${CSS.escape(fbWahl.dataset.fbWahl)}"]`)?.focus({ preventScroll: true });
    return;
  }
  if (t.closest('[data-fb-zurueck]')) { W.fb = null; W.ki.clear(); W.ansicht = 'start'; zeichnen(); return; }
  if (t.closest('#fbFertig')) return fbFertig();
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
  if (v) { const x = W.kat.vorlagen.find((y) => y.vorlage === v.dataset.vorlage); if (x) vorlageWaehlen(x); return; }
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
  if (t.id === 'wunsch') { W.suche = t.value.slice(0, 600); return rasterNeu(); }
  if (t.dataset.fb && W.fb) {
    const f = W.fb.v.fragen.find((x) => x.id === t.dataset.fb);
    if (!f) return;
    W.fb.antworten[f.id] = ['zahl', 'stunden', 'tag'].includes(f.typ) ? (t.value === '' ? '' : Number(t.value)) : t.value;
    return fbTeil();
  }
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
    // Esc in einer KI-Hilfe schliesst nur diese, nicht die Werkbank.
    const ort = ev.target.closest?.('[data-ki-ort]')?.dataset.kiOrt;
    if (ort && W.ki.has(ort)) { W.ki.delete(ort); kiNeu(ort); $(`[data-ki="${CSS.escape(ort)}"]`)?.focus(); return; }
    if (ev.target.closest?.('#kiStart') && W.kiStart) { W.kiStart = null; kiStartNeu(); $('#wunsch')?.focus(); return; }
    $('#zu').click();
    return;
  }
  if (ev.key === 'Enter' && ev.target.id === 'wunsch') { ev.preventDefault(); kiStartFragen(); return; }
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
