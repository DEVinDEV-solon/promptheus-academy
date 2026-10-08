/* MULTI-LLM — Audio, Modellkatalog, Modellwahl mit Kosten, Ablage. Nutzt die Helfer aus app.js. */
'use strict';

Object.assign(I, {
  katalog: P('<rect x="3" y="4" width="18" height="4" rx="1"/><rect x="3" y="10" width="18" height="4" rx="1"/><rect x="3" y="16" width="18" height="4" rx="1"/>'),
  regler: P('<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>'),
  pause: P('<path d="M8 5v14M16 5v14"/>'),
  ordnerAuf: P('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v1H7l-4 9z"/><path d="M3 19l3-9h16l-3 9z"/>'),
  speichern: P('<path d="M5 3h11l3 3v15H5z"/><path d="M8 3v6h8V3M8 21v-7h8v7"/>'),
  mikro: P('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8"/>'),
});

// ------------------------------------------------------------------ Katalog & Kosten
const K = { daten: null, stand: 0 };
async function katalogHolen(neu = false) {
  K.daten = await api('katalog' + (neu ? '?neu=1' : ''));
  K.stand = Date.now();
  return K.daten;
}
const preis = (v, n) => (v == null ? '' : geld(v, n ?? (v > 0 && v < 0.01 ? 4 : v < 0.1 ? 3 : 2)));
/** Kompakte Kostenangabe je Modellart – überall gleich formuliert. */
function kostenText(art, m) {
  if (!m) return '';
  if (art === 'bild') return m.preis_bild != null ? `≈ ${preis(m.preis_bild)}/Bild` : 'Preis ?';
  if (art === 'video') {
    if (m.preis_sek_min == null) return 'Preis ?';
    return m.preis_sek_min === m.preis_sek_max ? `${preis(m.preis_sek_min)}/s` : `${preis(m.preis_sek_min)}–${preis(m.preis_sek_max)}/s`;
  }
  if (art === 'sprache') return m.frei ? 'kostenlos' : `${preis(m.je_zeichen * 1000)}/1.000 Zeichen`;
  if (m.frei) return 'kostenlos';
  return `ein ${geld(m.preis_ein, 2)} · aus ${geld(m.preis_aus, 2)} /Mio. Tokens`;
}
const KAT_ARTEN = {
  bild: { titel: 'Bild', ico: 'bilder' }, video: { titel: 'Video', ico: 'video' }, sprache: { titel: 'Sprache', ico: 'ton' },
  text: { titel: 'Text/Chat', ico: 'text' }, vision: { titel: 'Vision', ico: 'suche' },
};
function katalogListe(art) {
  const d = K.daten || {};
  if (art === 'vision') return (d.text || []).filter(m => m.vision);
  return d[art] || [];
}
const anbieterVon = m => m.anbieter || (m.id.split('/')[0]);

/** Modellwahl als Aufklappliste mit Suche und Kosten. art: bild|video|sprache|text|vision */
async function modellWahl(anker, art, aktuell, beiWahl, { titel } = {}) {
  if (!K.daten) { try { await katalogHolen(); } catch (e) { return fehler(e); } }
  const pop = $('#pop');
  $('#flyout').classList.add('hidden');
  pop.className = 'pop modelle';
  const liste = katalogListe(art);
  const zeile = m => `<button class="eintrag ${m.id === aktuell ? 'gewaehlt' : ''}" data-m="${esc(m.id)}" data-tip="${esc(m.id)}">
      <span class="mono">${esc(mono({ anbieter: anbieterVon(m) }))}</span>
      <span class="txt"><span class="name">${esc(m.name)}${m.frei ? '<span class="plakette neu">FREI</span>' : ''}</span><small>${esc(anbieterVon(m))} · ${esc(m.id)}</small></span>
      <span class="kosten">${esc(kostenText(art === 'vision' ? 'text' : art, m))}</span></button>`;
  const zeichne = f => {
    f = (f || '').toLowerCase();
    const treffer = liste.filter(m => !f || `${m.name} ${m.id} ${anbieterVon(m)}`.toLowerCase().includes(f)).slice(0, 250);
    $('#mwListe').innerHTML = (titel ? `<div class="kopf">${esc(titel)}</div>` : '') + (treffer.map(zeile).join('') || '<div class="kopf">Kein Modell gefunden.</div>');
  };
  pop.innerHTML = `<div class="suchfeld">${ico('suche')}<input id="mwSuche" placeholder="${liste.length} Modelle durchsuchen …"></div><div id="mwListe"></div>`;
  zeichne('');
  pop.onmouseover = null;
  pop.onclick = ev => { const b = ev.target.closest('[data-m]'); if (!b) return; popSchliessen(); beiWahl(liste.find(m => m.id === b.dataset.m)); };
  $('#mwSuche').oninput = ev => zeichne(ev.target.value);
  platziere(pop, anker, 'unten');
  POP.anker = anker;
  $('#mwSuche').focus();
}
/** Feld mit Modellwahl-Knopf (für Einstellungen): zeigt Name + Kosten, schreibt die Id in ein verstecktes Feld. */
function wahlFeld(id, art, wert) {
  const m = katalogListe(art).find(x => x.id === wert);
  return `<div class="wahlfeld"><input type="hidden" id="${id}" value="${esc(wert || '')}">
    <button type="button" class="btn wahl" data-wahl="${id}" data-art="${art}">
      <span class="mono">${esc(mono({ anbieter: m ? anbieterVon(m) : '?' }))}</span>
      <span class="txt"><b>${esc(m?.name || wert || 'Modell wählen')}</b><small>${esc(m ? kostenText(art === 'vision' ? 'text' : art, m) : (wert ? 'nicht im Katalog' : ''))}</small></span>${ico('rechts')}
    </button></div>`;
}
function wahlFelderBinden(root) {
  $$('[data-wahl]', root).forEach(b => {
    b.onclick = () => modellWahl(b, b.dataset.art, root.querySelector('#' + b.dataset.wahl).value, m => {
      root.querySelector('#' + b.dataset.wahl).value = m.id;
      b.outerHTML = wahlFeld(b.dataset.wahl, b.dataset.art, m.id).replace(/^<div class="wahlfeld"><input[^>]*>/, '').replace(/<\/div>$/, '');
      wahlFelderBinden(root);
    });
  });
}

// ------------------------------------------------------------------ Katalogansicht (Menü „Modelle“)
const KV = { art: 'bild', suche: '' };
async function katalogZeigen(neu = false) {
  const w = $('#wand');
  w.innerHTML = '<div class="leer"><div class="spin"></div><p>Katalog wird geladen …</p></div>';
  try { await katalogHolen(neu); } catch (e) { w.innerHTML = `<div class="leer"><h3>Katalog nicht erreichbar</h3><p>${esc(e.message)}</p></div>`; return; }
  const s = (await api('einstellungen')).einstellungen;
  KV.einst = s;
  katalogZeichnen();
}
function katalogZeichnen() {
  const d = K.daten, s = KV.einst || {};
  const liste = katalogListe(KV.art);
  const f = KV.suche.toLowerCase();
  const treffer = liste.filter(m => !f || `${m.name} ${m.id} ${anbieterVon(m)}`.toLowerCase().includes(f));
  const standard = { bild: s.standard_modell, video: s.standard_video, sprache: s.standard_audio, text: s.assistent_or_modell, vision: s.assistent_vision_modell }[KV.art];
  const empf = { bild: s.empfohlen || [], video: s.empfohlen_video || [] }[KV.art];
  const stand = d.stand?.[KV.art === 'vision' ? 'text' : KV.art];
  const gewaehlt = [[s.standard_modell, 'bild'], [s.standard_video, 'video'], [s.standard_audio, 'sprache'], [s.assistent_or_modell, 'text'],
    [s.assistent_vision_modell, 'vision'], [s.klon_modell, 'vision']].filter(([id, a]) => id && !katalogListe(a).some(m => m.id === id));
  $('#viewCount').textContent = `${treffer.length} von ${liste.length} Modellen`;
  const neuGrenze = Date.now() / 1000 - 45 * 86400;
  $('#wand').innerHTML = `
    ${gewaehlt.length ? `<div class="hinweis">Nicht mehr bei OpenRouter verfügbar: ${gewaehlt.map(([id]) => `<code>${esc(id)}</code>`).join(', ')} – bitte ein neues Modell als Standard wählen.</div>` : ''}
    <div class="kat-kopf">
      <div class="filter" id="katArt">${Object.entries(KAT_ARTEN).map(([k, v]) => `<button data-art="${k}" class="${k === KV.art ? 'an' : ''}">${ico(v.ico)}${v.titel}</button>`).join('')}</div>
      <label class="suche">${ico('suche')}<input id="katSuche" placeholder="Modell suchen …" value="${esc(KV.suche)}"></label>
      <small class="kat-stand" data-tip="Die Kataloge aktualisieren sich alle 6 Stunden selbst.">Stand ${stand ? new Date(stand * 1000).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' }) : '–'}</small>
      ${S.admin ? `<button class="btn klein" id="katNeu" data-tip="Alle Kataloge jetzt von OpenRouter holen">${ico('neu')}Aktualisieren</button>` : ''}
    </div>
    <div class="kat-liste">${treffer.map(m => `<div class="kat-zeile ${m.id === standard ? 'standard' : ''}">
        <span class="mono">${esc(mono({ anbieter: anbieterVon(m) }))}</span>
        <div class="kat-name"><b>${esc(m.name)}</b>${m.erstellt > neuGrenze ? '<span class="plakette neu">NEU</span>' : ''}${m.frei ? '<span class="plakette neu">FREI</span>' : ''}
          <small>${esc(anbieterVon(m))} · <code>${esc(m.id)}</code>${katalogFaehig(KV.art, m)}</small></div>
        <span class="kat-preis">${esc(kostenText(KV.art === 'vision' ? 'text' : KV.art, m))}</span>
        <div class="kat-knoepfe">
          ${empf ? `<button class="icon-btn klein ${empf.includes(m.id) ? 'an' : ''}" data-empf="${esc(m.id)}" data-tip="${empf.includes(m.id) ? 'Aus den empfohlenen Modellen nehmen' : 'Oben in der Modellauswahl zeigen'}" ${S.admin ? '' : 'disabled'}>★</button>` : ''}
          <button class="btn klein ${m.id === standard ? 'primaer' : ''}" data-std="${esc(m.id)}" ${S.admin ? '' : 'disabled'} data-tip="Als Standard für ${KAT_ARTEN[KV.art].titel} verwenden">${m.id === standard ? 'Standard' : 'Als Standard'}</button>
        </div></div>`).join('') || '<p class="unter">Keine Treffer.</p>'}</div>`;
}
function katalogFaehig(art, m) {
  if (art === 'video') return ` · ${esc((m.dauern || []).length ? `${m.dauern[0]}–${m.dauern.at(-1)} s` : '')} ${esc((m.aufloesungen || []).join('/'))}${m.ton === true ? ' · Ton' : ''}${m.frames?.length ? ' · Startbild' : ''}`;
  if (art === 'sprache') return ` · ${m.stimmen?.length ? `${m.stimmen.length} Stimmen` : 'eigene Stimm-ID'}`;
  if (art === 'bild') { const p = m.parameter || {}; return ` · ${esc((p.resolution?.werte || []).join('/'))}${m.referenzbilder ? ' · Referenzbilder' : ''}`; }
  return m.kontext ? ` · ${zahl(m.kontext)} Tokens Kontext${m.vision ? ' · sieht Bilder' : ''}${m.video ? ' · Video' : ''}` : '';
}
$('#wand').addEventListener('click', async ev => {
  if (S.ansicht !== 'modelle') return;
  const art = ev.target.closest('[data-art]');
  if (art && art.closest('#katArt')) { KV.art = art.dataset.art; return katalogZeichnen(); }
  if (ev.target.closest('#katNeu')) { toast('Kataloge werden aktualisiert …'); return katalogZeigen(true).then(() => toast('Kataloge aktualisiert.', 'ok')).catch(fehler); }
  const std = ev.target.closest('[data-std]');
  const emp = ev.target.closest('[data-empf]');
  try {
    if (std) {
      const feld = { bild: 'standard_modell', video: 'standard_video', sprache: 'standard_audio', text: 'assistent_or_modell', vision: 'assistent_vision_modell' }[KV.art];
      KV.einst = (await api('einstellungen', { [feld]: std.dataset.std })).einstellungen;
      toast('Standard gesetzt.', 'ok');
      katalogZeichnen();
      await Promise.all([katalogLaden(), videoKatalogLaden(), audioKatalogLaden()]);
    }
    if (emp) {
      const feld = KV.art === 'bild' ? 'empfohlen' : 'empfohlen_video';
      const alt = KV.einst[feld] || [];
      const neu = alt.includes(emp.dataset.empf) ? alt.filter(x => x !== emp.dataset.empf) : [...alt, emp.dataset.empf];
      KV.einst = (await api('einstellungen', { [feld]: neu })).einstellungen;
      katalogZeichnen();
      await Promise.all([katalogLaden(), videoKatalogLaden()]);
    }
  } catch (e) { fehler(e); }
});
$('#wand').addEventListener('input', ev => {
  if (ev.target.id !== 'katSuche') return;
  KV.suche = ev.target.value;
  const pos = ev.target.selectionStart;
  katalogZeichnen();
  const f = $('#katSuche'); f.focus(); f.setSelectionRange(pos, pos);
});

// ------------------------------------------------------------------ Audio: Katalog & Eingabe
const A = { modelle: [], profile: [], regler: {}, standard: '', standardProfil: '', maxText: 5000,
  stimmen: [], gen: { klon: '', ...speicher.lies('agen', { modell: '', stimme: '', profil: '', klang: null }) } };
async function audioKatalogLaden() {
  const d = await api('audiomodelle');
  Object.assign(A, { modelle: d.modelle, profile: d.profile, regler: d.regler, standard: d.standard, maxText: d.max_text,
    standardProfil: d.standard_profil || '' });
  await stimmenLaden().catch(() => {});
  // Fest eingestelltes Standardprofil: jeder Start (und jedes Speichern der Einstellungen) beginnt damit.
  const std = A.profile.find(p => p.id === A.standardProfil);
  if (std) Object.assign(A.gen, { profil: std.id, modell: std.modell, stimme: std.stimme, klang: { ...std.klang }, klon: std.klon || '' });
  if (!A.modelle.some(m => m.id === A.gen.modell)) A.gen.modell = A.modelle.some(m => m.id === A.standard) ? A.standard : (A.modelle[0]?.id || '');
  if (!A.gen.klang) A.gen.klang = klangVorgabe();
  if (S.modus === 'audio') audioAktualisieren();
}
const klangVorgabe = () => Object.fromEntries(Object.entries(A.regler).map(([k, r]) => [k, r.vorgabe]));
const aktAModell = () => A.modelle.find(m => m.id === A.gen.modell);

function audioAktualisieren() {
  const g = A.gen;
  if (g.klon && !A.stimmen.some(s => s.id === g.klon)) g.klon = '';
  if (g.klon && !aktAModell()?.klonen) { const km = klonModellFuer(g.modell); if (km) g.modell = km.id; }
  const m = aktAModell();
  if (m && m.stimmen.length && !m.stimmen.includes(g.stimme)) g.stimme = m.beispiel_stimme || m.stimmen[0];
  if (m && !m.stimmen.length && !g.stimme) g.stimme = m.beispiel_stimme || '';
  const profil = A.profile.find(p => p.id === g.profil);
  $('#aChipModellTxt').textContent = m ? m.name : (A.modelle.length ? 'Modell wählen' : 'Lade Sprachmodelle …');
  $('#aChipModellIco').textContent = mono(m ? { anbieter: m.anbieter } : null);
  $('#aChipModell').dataset.tip = m ? `${m.name} (${m.anbieter}) · ${kostenText('sprache', m)}\n${m.beschreibung}` : 'Sprachmodell wählen';
  const klon = A.stimmen.find(s => s.id === g.klon);
  $('#aChipStimmeTxt').textContent = klon ? `🎙 ${klon.name}` : profil ? `${profil.name} · ${g.stimme}` : (g.stimme || 'Stimme');
  $('#aChipStimme').classList.toggle('aktiv', !!klon);
  const k = g.klang || klangVorgabe();
  const verstellt = Object.entries(A.regler).some(([n, r]) => k[n] !== r.vorgabe);
  $('#aChipKlang').classList.toggle('aktiv', verstellt);
  $('#aChipKlang').dataset.tip = 'Klang: ' + Object.entries(A.regler).map(([n, r]) => `${r.wort} ${k[n]}${r.einheit}`).join(' · ');
  speicher.setz('agen', g);
  audioSchaetzen();
}
async function audioSchaetzen() {
  const m = aktAModell();
  if (!m) { $('#genPreis').textContent = '–'; return; }
  const z = pr.value.trim().length;
  const s = await api('schaetzen_audio', { modell: m.id, zeichen: z }).catch(() => null);
  if (!s || S.modus !== 'audio') return;
  $('#genPreis').textContent = s.frei ? 'kostenlos' : '≈ ' + preis(s.gesamt);
  $('#btnGen').dataset.tip = `${zahl(z)} von ${zahl(A.maxText)} Zeichen · ${kostenText('sprache', m)}\n` +
    `${s.frei ? 'Dieses Modell ist kostenlos.' : `Geschätzt: ${preis(s.gesamt)}`}\nDer Klang wird beim Speichern eingerechnet. Strg+Enter erzeugt.`;
}
$('#aChipModell').onclick = () => modellWahl($('#aChipModell'), 'sprache', A.gen.modell, m => {
  A.gen.modell = m.id; A.gen.profil = '';
  if (A.gen.klon && !m.klonen) { A.gen.klon = ''; toast(`${m.name} kann nicht klonen – eigene Stimme abgewählt.`); }
  audioAktualisieren();
});
$('#aChipStimme').onclick = () => {
  const m = aktAModell();
  const eintraege = [{ kopf: 'Eigene Stimmen (geklont)' },
    ...A.stimmen.map(s => ({ ico: 'mikro', txt: s.name, klein: `${laengeText(s.dauer)} Probe · nur mit Klon-Modell`, haken: A.gen.klon === s.id,
      rechts: '▶k', fn: () => { const km = klonModellFuer(A.gen.modell); Object.assign(A.gen, { klon: s.id, profil: '', modell: km?.id || A.gen.modell }); audioAktualisieren(); } })),
    { ico: 'plus', txt: 'Stimme klonen …', klein: 'Aufnehmen oder hochladen', fn: stimmeKlonenDialog }, '-'];
  if (A.profile.length) {
    eintraege.push({ kopf: 'Stimmprofile' }, ...A.profile.map(p => ({ ico: 'profil', txt: p.name,
      klein: `${p.id === A.standardProfil ? '★ Standard · ' : ''}${A.modelle.find(x => x.id === p.modell)?.name || p.modell} · ${
        p.klon ? '🎙 ' + (A.stimmen.find(s => s.id === p.klon)?.name || 'eigene Stimme') : p.stimme}`,
      haken: A.gen.profil === p.id, fn: () => { Object.assign(A.gen, { profil: p.id, modell: p.modell, stimme: p.stimme, klang: { ...p.klang }, klon: p.klon || '' }); audioAktualisieren(); } })), '-');
  }
  if (m?.stimmen.length) {
    eintraege.push({ kopf: `Stimmen von ${m.name}` }, ...m.stimmen.map(st => ({ txt: st, haken: !A.gen.profil && !A.gen.klon && A.gen.stimme === st,
      rechts: '▶', fn: () => { Object.assign(A.gen, { stimme: st, profil: '', klon: '' }); audioAktualisieren(); } })));
  } else if (m) {
    eintraege.push({ ico: 'text', txt: 'Eigene Stimm-ID eingeben …', klein: m.beispiel_stimme ? `Beispiel: ${m.beispiel_stimme}` : '', fn: async () => {
      const v = await eingabe('Stimm-ID', `Kennung der Stimme bei ${m.anbieter}`, A.gen.stimme || m.beispiel_stimme, 'Übernehmen');
      if (v) { Object.assign(A.gen, { stimme: v, profil: '', klon: '' }); audioAktualisieren(); } } });
  }
  eintraege.push('-', { ico: 'ton', txt: 'Aktuelle Stimme anhören', klein: 'Kurze Probe – einmal erzeugt, dann gespeichert', fn: () => stimmeAnhoeren(A.gen.modell, A.gen.stimme, A.gen.klang, A.gen.klon) });
  menue($('#aChipStimme'), eintraege, { seite: 'oben' });
  // ▶ in einer Stimmenzeile spielt die Probe, ohne die Stimme zu wechseln
  $$('#pop .eintrag').forEach(b => {
    const r = b.querySelector('.rechts');
    if (r && r.textContent.trim() === '▶k') {
      const s = A.stimmen.find(x => x.name === b.querySelector('.txt').firstChild.textContent.trim());
      r.innerHTML = `<span class="probe" data-tip="Original-Aufnahme anhören">${ico('play')}</span>`;
      r.firstChild.onclick = ev => { ev.stopPropagation(); if (s) tonSpielen('/stimmdatei/' + s.id, null); };
    }
    if (r && r.textContent.trim() === '▶') {
      r.innerHTML = `<span class="probe" data-tip="Anhören">${ico('play')}</span>`;
      r.firstChild.onclick = ev => { ev.stopPropagation(); stimmeAnhoeren(A.gen.modell, b.querySelector('.txt').textContent.trim(), A.gen.klang); };
    }
  });
};
const klangOeffnen = () => klangPop($('#aChipKlang'), A.gen.klang || klangVorgabe(), k => { A.gen.klang = k; A.gen.profil = ''; audioAktualisieren(); },
  () => stimmeAnhoeren(A.gen.modell, A.gen.stimme, A.gen.klang, A.gen.klon), true);
$('#aChipKlang').onclick = klangOeffnen;

/** Kompakte Regler (wie PROMPTHEUS) als Aufklappfeld. */
function klangPop(anker, klang, beiAenderung, anhoeren, mitSpeichern = false) {
  const pop = $('#pop');
  $('#flyout').classList.add('hidden');
  pop.className = 'pop klang';
  const k = { ...klang };
  pop.innerHTML = `<div class="kopf">Klang – Feinjustierung</div>${reglerHtml(k)}
    <div class="klang-knoepfe"><button class="btn klein" data-k="hoeren">${ico('play')}Anhören</button><button class="btn klein" data-k="reset" data-tip="Alle Regler auf Werk">↺ Zurücksetzen</button></div>
    ${mitSpeichern ? klangSpeicherHtml() : ''}
    <small class="unter">Probehören kostet nichts; beim Erzeugen wird der Klang eingerechnet.</small>`;
  const binden = () => {
    reglerBinden(pop, k, () => beiAenderung({ ...k }));
    pop.onclick = async ev => {
      const b = ev.target.closest('[data-k]');
      if (!b) return;
      if (b.dataset.k === 'reset') { Object.assign(k, klangVorgabe()); pop.querySelector('.regler-gitter').outerHTML = reglerHtml(k); binden(); beiAenderung({ ...k }); }
      if (b.dataset.k === 'hoeren') anhoeren();
      if (b.dataset.k === 'speichern') await feinjustierungSpeichern();
    };
    const wahl = pop.querySelector('#klangLaden');
    if (wahl) wahl.onchange = () => {
      const p = A.profile.find(x => x.id === wahl.value);
      if (!p) return;
      Object.assign(A.gen, { profil: p.id, modell: p.modell, stimme: p.stimme, klang: { ...p.klang }, klon: p.klon || '' });
      Object.assign(k, klangVorgabe(), p.klang);
      pop.querySelector('.regler-gitter').outerHTML = reglerHtml(k);
      binden();
      audioAktualisieren();
      toast(`„${p.name}“ geladen.`);
    };
  };
  binden();
  platziere(pop, anker, 'oben');
  POP.anker = anker;
}

/** Gespeicherte Feinjustierungen (= Stimmprofile) laden und die aktuelle unter einem Namen sichern. */
function klangSpeicherHtml() {
  const aktiv = A.gen.profil;
  return `<div class="klang-speicher">
    <select id="klangLaden" aria-label="Gespeicherte Einstellung laden">
      <option value="">${A.profile.length ? 'Gespeicherte Einstellung laden …' : 'Noch nichts gespeichert'}</option>
      ${A.profile.map(p => `<option value="${esc(p.id)}" ${p.id === aktiv ? 'selected' : ''}>${p.id === A.standardProfil ? '★ ' : ''}${esc(p.name)}${
        p.klon ? ' · 🎙' : ''}</option>`).join('')}
    </select>
    ${S.admin ? `<button class="btn klein" data-k="speichern" data-tip="Modell, Stimme und Regler unter einem Namen sichern">Speichern unter …</button>` : ''}
  </div>`;
}

async function feinjustierungSpeichern() {
  const jetzt = A.profile.find(p => p.id === A.gen.profil);
  const name = (await eingabe('Einstellung speichern', 'Name, z. B. „Solon ruhig“ – gleicher Name überschreibt',
    jetzt?.name || '', 'Speichern'))?.trim();
  if (!name) return;
  const doppelt = A.profile.find(p => p.name.trim().toLowerCase() === name.toLowerCase());
  if (doppelt && doppelt.id !== A.gen.profil &&
      !await bestaetigen('Überschreiben?', `„${doppelt.name}“ gibt es schon. Mit der aktuellen Einstellung überschreiben?`, 'Überschreiben')) return;
  try {
    const d = await api('stimmprofil_speichern', { name, modell: A.gen.modell, stimme: A.gen.stimme, klon: A.gen.klon || '',
      klang: A.gen.klang || klangVorgabe() });
    A.profile = d.profile;
    A.standardProfil = d.standard_profil;
    A.gen.profil = d.profil.id;
    audioAktualisieren();
    klangOeffnen();                       // Regler mit aktualisierter Liste neu zeigen
    toast(d.ueberschrieben ? `„${name}“ überschrieben.` : `„${name}“ gespeichert – auch unter „Stimme“ wählbar.`);
  } catch (e) { fehler(e); }
}
function reglerHtml(k) {
  return `<div class="regler-gitter">${Object.entries(A.regler).map(([n, r]) => `<label class="regler">
    <span>${r.wort}</span><input type="range" min="${r.min}" max="${r.max}" step="1" value="${k[n] ?? r.vorgabe}" data-r="${n}">
    <b>${k[n] ?? r.vorgabe}${r.einheit}</b></label>`).join('')}</div>`;
}
function reglerBinden(root, k, beiAenderung) {
  $$('input[data-r]', root).forEach(inp => {
    inp.oninput = () => { k[inp.dataset.r] = +inp.value; inp.nextElementSibling.textContent = inp.value + A.regler[inp.dataset.r].einheit; beiAenderung(); };
    inp.ondblclick = () => { inp.value = A.regler[inp.dataset.r].vorgabe; inp.oninput(); };
  });
}

// Abspielen mit Klang (wie PROMPTHEUS: Tempo ohne Tonhöhenänderung, Bass-/Höhenfilter) – kostenlos
const TON = { el: null, werk: null };
function tonSpielen(url, klang) {
  tonStopp();
  const t = new Audio(url);
  TON.el = t;
  const k = klang || {};
  if (k.tempo && k.tempo !== 100) { t.preservesPitch = true; t.playbackRate = k.tempo / 100; }
  if ((k.tiefe || k.klarheit) || (k.laut && k.laut !== 100)) {
    try {
      TON.werk = TON.werk || new (window.AudioContext || window.webkitAudioContext)();
      if (TON.werk.state === 'suspended') TON.werk.resume();
      const q = TON.werk.createMediaElementSource(t);
      const bass = TON.werk.createBiquadFilter(); bass.type = 'lowshelf'; bass.frequency.value = 220; bass.gain.value = k.tiefe || 0;
      const hoch = TON.werk.createBiquadFilter(); hoch.type = 'highshelf'; hoch.frequency.value = 3200; hoch.gain.value = k.klarheit || 0;
      const laut = TON.werk.createGain(); laut.gain.value = (k.laut || 100) / 100;
      q.connect(bass).connect(hoch).connect(laut).connect(TON.werk.destination);
    } catch { /* ohne Klangfarbe, aber mit Ton */ }
  }
  t.play().catch(e => toast('Abspielen nicht möglich: ' + e.message, 'fehler'));
  return t;
}
function tonStopp() { if (TON.el) { TON.el.pause(); TON.el = null; } }
async function stimmeAnhoeren(modell, stimme, klang, klon = '') {
  const m = A.modelle.find(x => x.id === modell);
  if (!m) return toast('Bitte zuerst ein Sprachmodell wählen.');
  toast(m.frei ? 'Probe wird erzeugt …' : 'Probe wird erzeugt (einmalig, < 0,001 $) …');
  try { const d = await api('stimmprobe', { modell, stimme, klon }); tonSpielen(d.url, klang); } catch (e) { fehler(e); }
}

async function audioErzeugen(ueber = null) {
  const g = { ...A.gen, ...(ueber || {}) };
  const text = (ueber?.prompt ?? pr.value).trim();
  if (!text) { pr.focus(); return toast('Bitte den Text eingeben, der gesprochen werden soll.'); }
  if (text.length > A.maxText) return toast(`Der Text ist zu lang (${zahl(text.length)} von max. ${zahl(A.maxText)} Zeichen).`, 'fehler');
  const btn = $('#btnGen');
  btn.disabled = true;
  try {
    const profil = A.profile.find(p => p.id === g.profil);
    const d = await api('erzeugen_audio', { text, modell: g.modell, stimme: g.stimme, klang: g.klang, profil: profil?.name || '', klon: g.klon || '' });
    S.auftraege.push(d.auftrag);
    if (!['erstellen', 'bibliothek', 'audio'].includes(S.ansicht)) await ansicht('audio');
    else { wandZeichnen(); $('#wand').scrollTop = 0; }
    abfragen();
  } catch (e) { fehler(e); if (/Schlüssel/.test(e.message)) einstellungenDialog(); }
  finally { setTimeout(() => { audioSperre = null; audioKnopf(); }, 600); }
}

/** Erzeugen-Knopf bleibt grau, solange im Audio-Modus eine Sprachausgabe läuft (wie bei Bildern sichtbar „in Arbeit“). */
let audioSperre = false;
function audioKnopf() {
  const laeuft = S.modus === 'audio' && S.auftraege.some(j => j.art === 'audio' && j.status === 'laufend');
  if (laeuft === audioSperre) return;
  audioSperre = laeuft;
  const btn = $('#btnGen');
  btn.disabled = laeuft;
  btn.classList.toggle('arbeitet', laeuft);
  btn.querySelector('b').textContent = laeuft ? 'Wird gesprochen …' : 'Erzeugen';
}
function audioWiederverwenden(b) {
  const p = b.parameter || {};
  modusSetzen('audio');
  if (A.modelle.some(m => m.id === b.modell)) A.gen.modell = b.modell;
  Object.assign(A.gen, { stimme: p.stimme || A.gen.stimme, klang: { ...klangVorgabe(), ...(p.klang || {}) }, profil: '', klon: p.klon || '' });
  pr.value = b.prompt; promptHoehe(); speicher.setz('prompt', pr.value);
  if (!$('#composer').offsetParent) ansicht('audio');
  audioAktualisieren();
  pr.focus();
}
async function audioNeuErzeugen(b) {
  const p = b.parameter || {};
  await audioErzeugen({ modell: b.modell, prompt: b.prompt, stimme: p.stimme || '', klang: p.klang || klangVorgabe(), profil: '', klon: p.klon || '' });
}

// ------------------------------------------------------------------ Audio in Bildwand, Großansicht, Menü
function audioKarteHtml(b) {
  const p = b.parameter || {};
  return `<div class="karte ist-audio${S.auswahl.has(b.id) ? ' gewaehlt' : ''}" data-id="${b.id}" style="--ar:2.2">
    <div class="audio-flaeche">
      <button class="audio-spiel" data-a="spiel" data-tip="Abspielen" aria-label="Abspielen">${ico('play')}</button>
      <div class="audio-welle">${Array.from({ length: 28 }, (_, i) => `<i style="height:${20 + ((i * 37 + b.id.charCodeAt(i % b.id.length)) % 70)}%"></i>`).join('')}</div>
      <p>${esc(b.prompt.slice(0, 160))}</p>
      <small>${esc(b.modell_name)} · ${esc(p.stimme || '')}${p.profil ? ' · ' + esc(p.profil) : ''} · ${laengeText(b.dauer)}</small>
    </div>
    <button class="sel" data-a="sel" data-tip="Auswählen" aria-label="Auswählen">${ico('haken')}</button>
    <div class="aktionen">
      ${b.eigen && S.ansicht !== 'papierkorb' ? `<button class="rund ${b.like ? 'an' : ''}" data-a="like" data-tip="${b.like ? 'Aus Favoriten entfernen' : 'Zu Favoriten'}">${ico(b.like ? 'herzVoll' : 'herz')}</button>` : ''}
      <button class="rund" data-a="dl" data-tip="Speichern unter …">${ico('download')}</button>
      <button class="rund" data-a="kopie" data-tip="Text kopieren">${ico('kopie')}</button>
      <button class="rund" data-a="mehr" data-tip="Weitere Aktionen" aria-haspopup="menu">${ico('mehr')}</button>
    </div></div>`;
}
function audioKarteSpielen(b, knopf) {
  if (TON.el && TON.el.dataset?.id === b.id && !TON.el.paused) { tonStopp(); knopf.innerHTML = ico('play'); return; }
  $$('.audio-spiel').forEach(x => { x.innerHTML = ico('play'); });
  const t = tonSpielen('/bild/' + b.id, null);
  t.dataset.id = b.id;
  knopf.innerHTML = ico('pause');
  t.onended = () => { knopf.innerHTML = ico('play'); };
}
function audioMenue(anker, b, lb) {
  const eigen = b.eigen;
  const e = [
    { ico: 'oeffnen', txt: 'Öffnen', fn: () => oeffnen(b.id) },
    { ico: 'neu', txt: 'Neu erzeugen', tip: 'Gleicher Text, gleiche Stimme', fn: lb(() => audioNeuErzeugen(b)) },
    { ico: 'kopie', txt: 'Wiederverwenden', tip: 'Text, Stimme und Klang ins Eingabefeld', fn: lb(() => audioWiederverwenden(b)) },
  ];
  if (eigen) e.push({ ico: 'regler', txt: 'Klang anpassen', klein: 'Ohne neue Kosten, aus dem Original', aus: !b.roh, fn: () => klangAnpassen(b) });
  if (eigen) e.push({ ico: b.like ? 'herzVoll' : 'herz', txt: b.like ? 'Aus Favoriten entfernen' : 'Zu Favoriten', fn: () => bildAktion(b, 'like') });
  e.push({ ico: 'teilen', txt: 'Teilen', sub: () => [
    { ico: 'text', txt: 'Text kopieren', fn: () => textKopieren(b.prompt, 'Text kopiert.') },
    { ico: 'link', txt: 'Lokalen Link kopieren', fn: () => textKopieren(`${location.origin}/bild/${b.id}`, 'Link kopiert.') },
  ] });
  if (eigen) {
    e.push({ ico: 'ordner', txt: 'In Ordner', sub: () => [
      ...S.ordner.map(o => ({ ico: 'ordner', txt: o.name, haken: b.ordner === o.id, fn: () => bildAktion(b, 'ordner', { ordner: o.id }) })),
      ...(b.ordner ? [{ ico: 'x', txt: 'Aus Ordner entfernen', fn: () => bildAktion(b, 'ordner', { ordner: null }) }] : []),
      '-', { ico: 'ordnerPlus', txt: 'Neuer Ordner …', fn: async () => { const oid = await ordnerNeu(); if (oid) await bildAktion(b, 'ordner', { ordner: oid }); } },
    ] }, { ico: 'senden', txt: b.veroeffentlicht ? 'Veröffentlichung zurückziehen' : 'Veröffentlichen',
      fn: () => bildAktion(b, 'veroeffentlichen', { wert: !b.veroeffentlicht }) });
  }
  e.push({ ico: 'download', txt: 'Speichern unter …', fn: () => speichernUnter(b) },
    { ico: 'ordnerAuf', txt: 'Im Ordner zeigen', fn: () => imOrdnerZeigen(b) });
  if (eigen) e.push('-', { ico: 'muell', txt: 'In den Papierkorb', gefahr: true, fn: lb(() => bildAktion(b, 'papierkorb')) });
  menue(anker, e);
}
async function klangAnpassen(b) {
  if (!A.regler.tempo) await audioKatalogLaden().catch(() => {});
  const k = { ...klangVorgabe(), ...(b.parameter?.klang || {}) };
  const erg = await modal(`<h3>Klang anpassen</h3><p class="unter">Aus dem gespeicherten Original neu berechnet – ohne neue Kosten.</p>
    ${reglerHtml(k)}
    <div class="knoepfe" style="justify-content:space-between">
      <div style="display:flex;gap:8px"><button type="button" class="btn" id="kaHoeren">${ico('play')}Probehören</button><button type="button" class="btn" id="kaReset">↺ Werk</button></div>
      <div style="display:flex;gap:8px"><button class="btn" data-zu="null">Abbrechen</button><button class="btn primaer" data-zu="ok">Übernehmen</button></div></div>`,
  { beimOeffnen: c => {
    reglerBinden(c, k, () => {});
    c.querySelector('#kaHoeren').onclick = () => tonSpielen(`/bild/${b.id}?roh=1`, k);
    c.querySelector('#kaReset').onclick = () => { Object.assign(k, klangVorgabe()); c.querySelector('.regler-gitter').outerHTML = reglerHtml(k); reglerBinden(c, k, () => {}); };
  } });
  tonStopp();
  if (erg !== 'ok') return;
  try {
    const d = await api('bild/' + b.id, { aktion: 'klang', klang: k });
    Object.assign(b, d.bild);
    toast('Klang übernommen.', 'ok');
    wandZeichnen();
  } catch (e) { fehler(e); }
}

// ------------------------------------------------------------------ Eigene Stimmen: klonen per Mikrofon oder Upload
const VORLESETEXT = 'Guten Tag! Ich lese diesen kurzen Text in meiner ganz normalen Stimme vor. ' +
  'Heute ist ein schöner Tag, um etwas Neues auszuprobieren. Zahlen wie eins, zwei, drei und Fragen wie: Kommst du mit? ' +
  'gehören genauso dazu wie ein ruhiger, freundlicher Abschluss. Vielen Dank fürs Zuhören.';
const klonModelle = () => A.modelle.filter(m => m.klonen);
function klonModellFuer(aktuell) {
  const liste = klonModelle();
  return liste.find(m => m.id === aktuell) || liste.find(m => !m.frei) || liste[0];
}
async function stimmenLaden() { A.stimmen = (await api('stimmen')).stimmen; }

async function stimmeKlonenDialog() {
  if (!klonModelle().length) return toast('Im Katalog ist gerade kein Modell mit Klon-Funktion verfügbar.', 'fehler');
  const R = { rec: null, stuecke: [], blob: null, datei: null, start: 0, uhr: null, strom: null };
  const stopp = () => { clearInterval(R.uhr); R.rec?.state === 'recording' && R.rec.stop(); R.strom?.getTracks().forEach(t => t.stop()); };
  const erg = await modal(`<h3>Stimme klonen</h3>
    <p class="unter">10–30 Sekunden deutlich sprechen – aufnehmen oder eine Datei hochladen. Geklont wird mit
      ${klonModelle().map(m => `<b>${esc(m.name)}</b> (${esc(kostenText('sprache', m))})`).join(' oder ')}.</p>
    <div class="klon-quelle">
      <div class="aufnahme">
        <button type="button" class="btn primaer" id="skAuf">${ico('mikro')}Aufnahme starten</button>
        <span class="skUhr" id="skUhr">0:00</span>
        <div class="pegel"><i id="skPegel"></i></div>
      </div>
      <span class="oder">oder</span>
      <button type="button" class="btn" id="skDateiKnopf">${ico('hochladen')}Audiodatei hochladen</button>
      <input type="file" id="skDatei" accept="audio/*,.m4a,.webm" hidden>
    </div>
    <audio id="skVorschau" controls class="hidden"></audio>
    <details class="vorlese"><summary>Vorlesetext (zum Ablesen während der Aufnahme)</summary><p>${esc(VORLESETEXT)}</p></details>
    <div class="feld"><label>Name der Stimme</label><input id="skName" maxlength="40" placeholder="z. B. Meine Stimme"></div>
    <div class="feld"><label>Abschrift (optional, verbessert das Ergebnis)</label><textarea id="skText" rows="2" maxlength="2000" placeholder="Was in der Probe gesagt wird"></textarea>
      <small><a href="#" id="skVorlese">Vorlesetext übernehmen</a></small></div>
    <label class="einwilligung"><input type="checkbox" id="skOk"> Das ist <b>meine eigene Stimme</b> oder die Person hat mir ihre <b>ausdrückliche Einwilligung</b> zum Klonen gegeben.</label>
    <div class="hinweis">Eine Stimmprobe ist ein biometrisches Merkmal (DSGVO Art. 9). Sie wird lokal gespeichert und bei jeder Erzeugung
      an OpenRouter und den Modellanbieter geschickt. Geklonte Stimmen nie zur Täuschung oder ohne Kennzeichnung einsetzen.</div>
    <div class="knoepfe"><button type="button" class="btn" data-zu="null">Abbrechen</button><button type="button" class="btn primaer" id="skSpeichern">Stimme speichern</button></div>`,
  { beimOeffnen: (c, zu) => {
    const vorschau = c.querySelector('#skVorschau');
    const zeigen = blob => { R.blob = blob; vorschau.src = URL.createObjectURL(blob); vorschau.classList.remove('hidden'); };
    c.querySelector('#skVorlese').onclick = ev => { ev.preventDefault(); c.querySelector('#skText').value = VORLESETEXT; };
    c.querySelector('#skDateiKnopf').onclick = () => c.querySelector('#skDatei').click();
    c.querySelector('#skDatei').onchange = ev => {
      const f = ev.target.files[0];
      if (!f) return;
      if (f.size > 15 * 1024 * 1024) return toast('Die Datei ist größer als 15 MB.', 'fehler');
      R.datei = f; zeigen(f);
      if (!c.querySelector('#skName').value) c.querySelector('#skName').value = f.name.replace(/\.[^.]+$/, '').slice(0, 40);
    };
    const knopf = c.querySelector('#skAuf');
    knopf.onclick = async () => {
      if (R.rec?.state === 'recording') { stopp(); knopf.innerHTML = `${ico('mikro')}Neu aufnehmen`; return; }
      try { R.strom = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }); }
      catch { return toast('Kein Zugriff auf das Mikrofon – bitte im Browser erlauben.', 'fehler'); }
      R.stuecke = [];
      R.rec = new MediaRecorder(R.strom);
      R.rec.ondataavailable = e => e.data.size && R.stuecke.push(e.data);
      R.rec.onstop = () => { R.datei = null; zeigen(new Blob(R.stuecke, { type: R.rec.mimeType || 'audio/webm' })); };
      // Pegelanzeige, damit man sieht, dass das Mikrofon etwas hört
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const an = ctx.createAnalyser(); ctx.createMediaStreamSource(R.strom).connect(an);
        const puffer = new Uint8Array(an.fftSize);
        const pegel = () => { if (R.rec?.state !== 'recording') return ctx.close(); an.getByteTimeDomainData(puffer);
          const max = Math.max(...puffer.map(v => Math.abs(v - 128))); c.querySelector('#skPegel').style.width = Math.min(100, max * 1.6) + '%'; requestAnimationFrame(pegel); };
        requestAnimationFrame(pegel);
      } catch { /* ohne Pegel */ }
      R.rec.start(250); R.start = Date.now();
      knopf.innerHTML = `${ico('pause')}Aufnahme beenden`;
      R.uhr = setInterval(() => {
        const s = Math.round((Date.now() - R.start) / 1000);
        c.querySelector('#skUhr').textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
        if (s >= 30) { stopp(); knopf.innerHTML = `${ico('mikro')}Neu aufnehmen`; toast('30 Sekunden erreicht – das reicht zum Klonen.'); }
      }, 250);
    };
    c.querySelector('#skSpeichern').onclick = async () => {
      if (R.rec?.state === 'recording') stopp();
      if (!R.blob) return toast('Bitte erst aufnehmen oder eine Datei wählen.');
      if (!c.querySelector('#skOk').checked) return toast('Bitte die Einwilligung bestätigen.', 'fehler');
      const name = c.querySelector('#skName').value.trim();
      if (!name) return toast('Bitte der Stimme einen Namen geben.');
      const btn = c.querySelector('#skSpeichern');
      btn.disabled = true; btn.textContent = 'Wird gespeichert …';
      try {
        const r = await fetch('/api/stimme_upload', { method: 'POST', body: R.blob, headers: { 'X-CSRF': S.csrf, 'Content-Type': R.blob.type || 'audio/webm' } });
        const up = await r.json().catch(() => ({}));
        if (!r.ok || !up.ok) throw new Error(up.fehler || `Upload fehlgeschlagen (${r.status})`);
        const d = await api('stimmen', { upload: up.id, name, transkript: c.querySelector('#skText').value, einwilligung: true });
        A.stimmen = d.stimmen;
        Object.assign(A.gen, { klon: d.stimme.id, modell: klonModellFuer(A.gen.modell).id, profil: '' });
        toast(`Stimme „${name}“ gespeichert und ausgewählt.`, 'ok');
        zu('ok');
      } catch (e) { fehler(e); btn.disabled = false; btn.textContent = 'Stimme speichern'; }
    };
  } });
  stopp();
  if (erg === 'ok') { modusSetzen('audio'); audioAktualisieren(); }
}
$('#aChipMikro').onclick = () => stimmeKlonenDialog();

// ------------------------------------------------------------------ Einstellungen: Audio & Ablage (kompakt)
function profilZeile(p, dis, std = '') {
  const m = A.modelle.find(x => x.id === p.modell);
  const stimmen = m?.stimmen || [];
  return `<div class="profil" data-pid="${esc(p.id)}">
    <div class="profil-kopf">
      <input class="p-name" value="${esc(p.name)}" maxlength="40" ${dis} aria-label="Profilname">
      ${wahlFeld('pm_' + p.id, 'sprache', p.modell)}
      ${stimmen.length ? `<select class="p-stimme" ${dis}>${stimmen.map(s => `<option ${s === p.stimme ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select>`
        : `<input class="p-stimme" value="${esc(p.stimme)}" placeholder="Stimm-ID" ${dis}>`}
      <select class="p-klon" ${dis} data-tip="Eigene geklonte Stimme (nur mit Klon-Modell)"><option value="">– keine eigene –</option>
        ${A.stimmen.map(s => `<option value="${esc(s.id)}" ${s.id === p.klon ? 'selected' : ''}>🎙 ${esc(s.name)}</option>`).join('')}</select>
      <label class="p-std" data-tip="Mit diesem Profil startet das Audio-Eingabefeld"><input type="radio" name="efStdProfil"
        value="${esc(p.id)}" ${p.id === std ? 'checked' : ''} ${dis}> Standard</label>
      <button type="button" class="icon-btn klein" data-p="hoeren" data-tip="Anhören">${ico('play')}</button>
      <button type="button" class="icon-btn klein" data-p="reset" data-tip="Regler auf Werk" ${dis}>↺</button>
      <button type="button" class="icon-btn klein" data-p="weg" data-tip="Profil löschen" ${dis}>${ico('muell')}</button>
    </div>${reglerHtml(p.klang)}</div>`;
}
function audioEinstellungenHtml(s, dis) {
  const profile = (s.stimmprofile || []).map(p => ({ klon: '', ...p, klang: { ...klangVorgabe(), ...p.klang } }));
  return `<div class="feld"><label>Standard-Sprachmodell</label>${wahlFeld('efAStd', 'sprache', s.standard_audio)}</div>
    <div class="feld"><label>Stimmprofile <small>– im Eingabefeld unter „Stimme“ wählbar</small></label>
      <div id="efProfile">${profile.map(p => profilZeile(p, dis, s.standard_profil || '')).join('')}</div>
      ${dis ? '' : '<button type="button" class="btn klein" id="efProfilNeu">+ Profil</button>'}</div>
    <div class="feld"><label>Eigene Stimmen (geklont)</label>
      <div class="eigene">${A.stimmen.map(st => `<div class="eigene-zeile" data-sid="${esc(st.id)}">🎙 <b>${esc(st.name)}</b>
        <small>${laengeText(st.dauer)} Probe · ${new Date(st.erstellt).toLocaleDateString('de-DE')}</small>
        <button type="button" class="icon-btn klein" data-s="orig" data-tip="Originalprobe anhören">${ico('play')}</button>
        <button type="button" class="icon-btn klein" data-s="weg" data-tip="Stimme und Probe löschen">${ico('muell')}</button></div>`).join('')
        || '<small>Noch keine eigene Stimme.</small>'}</div>
      <button type="button" class="btn klein" id="efKlonen">${ico('mikro')} Stimme klonen (aufnehmen oder hochladen)</button></div>`;
}
function audioEinstellungenBinden(c) {
  const dis = !S.admin;
  wahlFelderBinden(c);
  const bindeProfil = el => {
    const k = Object.fromEntries($$('input[data-r]', el).map(i => [i.dataset.r, +i.value]));
    reglerBinden(el, k, () => {});
    el.onclick = ev => {
      const b = ev.target.closest('[data-p]');
      if (!b) return;
      const werte = profilWerte(el);
      if (b.dataset.p === 'hoeren') stimmeAnhoeren(werte.modell, werte.stimme, werte.klang, werte.klon);
      if (b.dataset.p === 'weg') el.remove();
      if (b.dataset.p === 'reset') { el.querySelector('.regler-gitter').outerHTML = reglerHtml(klangVorgabe()); bindeProfil(el); }
    };
  };
  $$('.profil', c).forEach(bindeProfil);
  const neu = c.querySelector('#efProfilNeu');
  if (neu) neu.onclick = () => {
    const m = A.modelle.find(x => x.id === (c.querySelector('#efAStd')?.value)) || A.modelle[0];
    const p = { id: 'n' + Math.random().toString(36).slice(2, 10), name: 'Neues Profil', modell: m?.id || '', stimme: m?.beispiel_stimme || '', klon: '', klang: klangVorgabe() };
    c.querySelector('#efProfile').insertAdjacentHTML('beforeend', profilZeile(p, dis ? 'disabled' : ''));
    const el = c.querySelector('#efProfile').lastElementChild;
    wahlFelderBinden(el); bindeProfil(el);
  };
  c.querySelector('.eigene').onclick = async ev => {
    const b = ev.target.closest('[data-s]');
    if (!b) return;
    const sid = b.closest('[data-sid]').dataset.sid;
    if (b.dataset.s === 'orig') tonSpielen('/stimmdatei/' + sid, null);
    if (b.dataset.s === 'weg' && await bestaetigen('Eigene Stimme löschen?', 'Die Stimmprobe wird gelöscht. Bereits erzeugte Audios bleiben erhalten.', 'Löschen', true)) {
      A.stimmen = (await api('stimme/' + sid, { loeschen: true })).stimmen;
      b.closest('[data-sid]').remove();
    }
  };
  c.querySelector('#efKlonen').onclick = () => stimmeKlonenDialog();
}
function profilWerte(el) {
  const modell = el.querySelector('[id^="pm_"]').value;
  return { id: el.dataset.pid, name: el.querySelector('.p-name').value.trim() || 'Profil', modell,
    stimme: el.querySelector('.p-stimme').value.trim(), klon: el.querySelector('.p-klon').value,
    klang: Object.fromEntries($$('input[data-r]', el).map(i => [i.dataset.r, +i.value])) };
}
function audioEinstellungenWerte(c) {
  return { standard_audio: c.querySelector('#efAStd').value, stimmprofile: $$('.profil', c).map(profilWerte),
    standard_profil: c.querySelector('input[name="efStdProfil"]:checked')?.value || '' };
}
function ablageEinstellungenHtml(s, dis, werkstattAblage = '') {
  // Aus der Werkstatt gestartet: Der Arbeitsordner der Werkstatt gilt, hier wird nichts gewählt (zugang.bindung).
  if (werkstattAblage) return `<div class="feld"><label>Ablage-Ordner</label>
      <span class="status ok">Im Arbeitsordner der Werkstatt</span>
      <input id="efAblage" value="${esc(werkstattAblage)}" disabled>
      <small>Alles, was du hier erzeugst, landet geordnet in diesem Ordner: <code>Bilder</code>, <code>Videos</code> und <code>Audio</code>,
      darin je Monat ein Ordner (<code>JJJJ-MM</code>) und jede Datei mit Datum, Uhrzeit und einem Stichwort aus deiner Beschreibung.
      Den Ordner legt die Werkstatt fest; er ist auch dort im Arbeitsbereich zu sehen.</small></div>
    <button type="button" class="btn klein" id="efAblageAuf">${ico('ordnerAuf')} Ablage im Explorer öffnen</button>`;
  return `<div class="feld"><label>Ablage-Ordner</label>
      <input id="efAblage" value="${esc(s.ablage_pfad || '')}" placeholder="leer = Ordner „ablage“ im Programmordner" ${dis}>
      <small>Jede Datei landet automatisch in <code>&lt;ablage&gt;/bilder|videos|audio/JJJJ-MM/Datum_Uhrzeit_Stichwort_Kennung</code>.
      Ein neuer Ordner gilt für neue Dateien; vorhandene bleiben, wo sie sind.</small></div>
    <button type="button" class="btn klein" id="efAblageAuf">${ico('ordnerAuf')} Ablage im Explorer öffnen</button>
    <div class="hinweis">„Speichern unter …“ an jedem Bild, Video und Audio lässt dich zusätzlich einen eigenen Ordner wählen (Chrome/Edge) – nichts landet mehr ungefragt in „Downloads“.</div>`;
}

// ------------------------------------------------------------------ Speichern & Ablage
async function speichernUnter(b) {
  const name = b.dateiname || `${b.id}`;
  if (window.showSaveFilePicker) {
    try {
      const griff = await window.showSaveFilePicker({ suggestedName: name, startIn: 'documents' });
      const blob = await (await fetch('/bild/' + b.id)).blob();
      const w = await griff.createWritable();
      await w.write(blob); await w.close();
      return toast(`Gespeichert als „${griff.name}“.`, 'ok');
    } catch (e) { if (e.name === 'AbortError') return; }
  }
  const a = document.createElement('a');
  a.href = `/bild/${b.id}?dl=1`; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
}
async function mehrereSpeichern(ids) {
  if (window.showDirectoryPicker) {
    try {
      const ordner = await window.showDirectoryPicker({ mode: 'readwrite', startIn: 'documents' });
      let n = 0;
      for (const id of ids) {
        const b = S.bilder.find(x => x.id === id);
        const blob = await (await fetch('/bild/' + id)).blob();
        const w = await (await ordner.getFileHandle(b?.dateiname || id, { create: true })).createWritable();
        await w.write(blob); await w.close(); n++;
      }
      return toast(`${n} Datei(en) in „${ordner.name}“ gespeichert.`, 'ok');
    } catch (e) { if (e.name === 'AbortError') return; }
  }
  for (const id of ids) { await speichernUnter(S.bilder.find(x => x.id === id) || { id }); await new Promise(r => setTimeout(r, 350)); }
}
async function imOrdnerZeigen(b) {
  try { await api('zeigen', b ? { id: b.id } : {}); toast(b ? 'Explorer geöffnet.' : 'Ablage im Explorer geöffnet.', 'ok'); } catch (e) { fehler(e); }
}

// Symbole, die erst hier definiert werden (Klang, Mikrofon …), nachträglich einsetzen
symboleEinsetzen();
