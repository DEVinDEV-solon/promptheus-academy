/* PROMPTHEUS Cinema Studio — Influencer › Bewegung: Assistent in 5 Schritten (Popup).
   @Bild 1 = Hauptfigur, wird Startbild. Bewegung und Kulisse kommen wahlweise aus einer Beschreibung (kein Video nötig),
   aus einer vorhandenen Video-Clone-Analyse (gemischt mit eigenen Änderungen) oder aus einem neu ausgelesenen Vorbild-Video.
   Nutzt die Helfer aus app.js, chat.js und influencer.js. Plan: vps/Pläne/100_Cinema-Studio/Influencer-Plan.md */
'use strict';

// [Anzeige, englisch für den Prompt]
const BW_KULISSEN = [
  ['Herbststraße in der Stadt', 'a city street in autumn, golden leaves on the asphalt, brownstone buildings'],
  ['Neon-Club', 'a dark club with neon lights, haze and moving light beams'],
  ['Strand bei Sonnenuntergang', 'a sandy beach at sunset, warm backlight, gentle waves'],
  ['Weißes Studio', 'a seamless pure white photo studio'],
  ['Dach bei Nacht', 'a rooftop above the city at night, skyline lights in the background'],
  ['Turnhalle', 'a school gym with a glossy wooden floor and bleachers'],
  ['U-Bahn-Station', 'a tiled subway station platform with fluorescent light'],
];
const BW_BEWEGUNGEN = [
  ['Gruppen-Choreo', 'a synchronized group choreography, the main dancer in the middle, backup dancers on both sides'],
  ['Solo-Freestyle', 'an energetic solo freestyle dance'],
  ['Laufsteg-Walk', 'a confident runway walk straight towards the camera'],
  ['Virale Tanzbewegung', 'a short catchy viral dance move, repeated on the beat'],
  ['Langsame Drehung', 'a slow turn on the spot while the camera circles around'],
];
const BW_SCHRITTE = ['Hauptfigur', 'Bewegung & Kulisse', 'Musik', 'Prompt', 'Los'];
const BW = {
  schritt: 1, bild: null, tab: 'meine', quelle: '', kulisse: '', bewegung: '', mix: '',
  analyseChat: '', analyse: null, analyseTitel: '', klonListe: null, klonLaeuft: false,
  musik: 'Hip-Hop', eigen: '', ohneMusik: false, prompt: '', promptEigen: false,
  bib: null, card: null, zu: null, timer: null,
};

// ------------------------------------------------------------------ Öffnen
async function bewegungAssistent(vorgabe = {}) {
  Object.assign(BW, vorgabe);
  try { await ifDatenLaden(); } catch (e) { fehler(e); }
  if (!IF.vorlagen) await ifVorlagenLaden();
  await modal('<div id="bwInhalt"></div>', {
    breit: true,
    beimOeffnen: (card, zu) => {
      BW.card = card; BW.zu = zu;
      card.classList.add('bw-karte');
      // #modalCard teilen sich alle Dialoge → Eigenschaften statt addEventListener, beim Schließen zurücksetzen
      card.onclick = ev => bwKlick(ev).catch(fehler);
      card.oninput = bwEingabe;
      bwZeichnen();
    },
  });
  const card = $('#modalCard');
  if (BW.card === card) { card.onclick = null; card.oninput = null; }
  BW.card = null; BW.zu = null;
  if (S.ansicht === 'influencer:bewegung') ifBewegungZeichnen();
}

// ------------------------------------------------------------------ Zustand
function bwFertig(n) {
  if (n === 1) return !!BW.bild;
  if (n === 2) return BW.quelle === 'beschreibung' ? !!(BW.kulisse.trim() || BW.bewegung.trim()) : BW.quelle === 'analyse' && !!BW.analyse;
  if (n === 3) return BW.ohneMusik || !!(BW.eigen.trim() || BW.musik);
  if (n === 4) return !!BW.prompt.trim();
  return false;
}
const bwErreichbar = n => [...Array(n - 1)].every((_, i) => bwFertig(i + 1));
function bwMusikEn() {
  if (BW.ohneMusik) return '';
  return BW.eigen.trim() || (IF_MUSIK.find(x => x[0] === BW.musik) || IF_MUSIK[0])[1];
}
function bwPromptBauen() {
  const t = [];
  if (BW.quelle === 'beschreibung') {
    t.push('Put @Image 1 as the main dancer in the middle of the scene.');
    if (BW.kulisse.trim()) t.push(`Scene: ${BW.kulisse.trim()}.`);
    if (BW.bewegung.trim()) t.push(`Movement: ${BW.bewegung.trim()}.`);
  } else if (BW.analyse) {
    const a = BW.analyse;
    t.push('Put @Image 1 as the main dancer in the middle, instead of the main dancer in the middle of the reference video. Everything else stays the same as in the reference video:');
    if (a.zusammenfassung) t.push(`Reference: ${a.zusammenfassung}`);
    if (a.stil) t.push(`Look and light: ${a.stil}.`);
    if (a.rhythmus) t.push(`Rhythm and cuts: ${a.rhythmus}.`);
    const sz = (a.szenen || []).slice(0, 8).map((s, i) => `(${s.nr ?? i + 1}) ${s.bild || ''}${s.kamera ? ' – ' + s.kamera : ''}`).join(' ');
    if (sz) t.push(`Scenes: ${sz}`);
    if (BW.mix.trim()) t.push(`Changes – these take priority over the reference: ${BW.mix.trim()}.`);
    t.push('No logos, no brand names, no on-screen text.');
  }
  t.push('Keep the face, hair and outfit of @Image 1 exactly as in the image.');
  const m = bwMusikEn();
  if (m) t.push(`Music style: ${m} – the dance moves and the soundtrack match this style.`);
  return t.join('\n');
}
function bwPromptAktualisieren() { if (!BW.promptEigen) BW.prompt = bwPromptBauen(); }

// ------------------------------------------------------------------ Zeichnen
function bwZeichnen() {
  const box = BW.card?.querySelector('#bwInhalt');
  if (!box) return;
  bwPromptAktualisieren();
  const n = BW.schritt;
  const punkte = BW_SCHRITTE.map((s, i) => {
    const k = i + 1, st = k === n ? 'jetzt' : bwFertig(k) ? 'fertig' : '';
    return `<button class="bw-punkt ${st}" data-bwschritt="${k}" ${bwErreichbar(k) ? '' : 'disabled'} data-tip="Schritt ${k}: ${s}"><b>${k}</b><span>${s}</span></button>`;
  }).join('<i></i>');
  const inhalt = [bwSchritt1, bwSchritt2, bwSchritt3, bwSchritt4, bwSchritt5][n - 1]();
  const naechstes = bwNaechstes();
  box.innerHTML = `<div class="bw-kopf"><div><small>Influencer › Bewegung</small><h3>Deine Figur in Bewegung</h3></div>
      <button class="icon-btn" data-zu="null" aria-label="Schließen" data-tip="Schließen – deine Auswahl bleibt erhalten">✕</button></div>
    <nav class="bw-punkte">${punkte}</nav>
    ${naechstes ? `<div class="bw-hinweis"><span class="bw-pfeil">➜</span><span><b>Als Nächstes:</b> ${naechstes}</span></div>` : ''}
    <div class="bw-schritt">${inhalt}</div>
    <div class="knoepfe bw-fuss">
      ${n > 1 ? '<button class="btn" id="bwZurueck">Zurück</button>' : '<button class="btn" data-zu="null">Abbrechen</button>'}
      ${n < 5 ? `<button class="btn primaer ${bwFertig(n) ? 'lotse-ziel' : ''}" id="bwWeiter" ${bwFertig(n) ? '' : 'disabled'}>Weiter</button>` : ''}
    </div>`;
  symboleEinsetzen(box);
}
function bwNaechstes() {
  const n = BW.schritt;
  if (n === 1) return BW.bild ? 'Passt die Figur? Dann „Weiter“. Sonst ein anderes Bild anklicken (Austauschen).' : 'Wähle die Hauptfigur – aus deinen Influencern, der Bibliothek, dem Vorlagen-Ordner oder das Beispielbild.';
  if (n === 2) {
    if (!BW.quelle) return 'Wähle, woher Bewegung und Kulisse kommen. Ein Video brauchst du nicht – eine Beschreibung reicht.';
    if (BW.quelle === 'beschreibung') return bwFertig(2) ? 'Fertig beschrieben? Dann „Weiter“.' : 'Kulisse und Bewegung antippen oder selbst beschreiben.';
    if (BW.quelle === 'analyse') return BW.analyse ? 'Optional mischen: unten eintragen, was anders sein soll. Dann „Weiter“.' : 'Eine vorhandene Analyse anklicken.';
    return BW.klonLaeuft ? 'Die Analyse läuft – gleich geht es automatisch weiter.' : 'Ein Video aus dem Vorlagen-Ordner auslesen oder rechts im Chat einen Link einfügen.';
  }
  if (n === 3) return 'Musikstil antippen – Tanz und Ton richten sich danach. Dann „Weiter“.';
  if (n === 4) return 'Prompt lesen und bei Bedarf ändern. Dann „Weiter“.';
  return 'Video-Modus öffnen (Preis siehst du dort vor dem Erzeugen) oder im Chat weiter verfeinern.';
}

function bwSchritt1() {
  const tabs = [['meine', 'Meine Influencer'], ['bibliothek', 'Bibliothek'], ['vorlagen', 'Vorlagen-Ordner'], ['beispiel', 'Beispielbild']];
  let raster = '';
  if (BW.tab === 'meine') {
    const b = IF.liste.flatMap(i => i.bilder.map(x => ({ id: x.id, url: x.url, name: i.name })));
    raster = b.length ? b.map(x => bwKachel('bild', x.id, x.url, x.name)).join('')
      : `<p class="unter">Noch keine eigenen Influencer. <button class="btn klein" data-ifnav-bw="influencer:erstellen">Figur bauen</button></p>`;
  } else if (BW.tab === 'bibliothek') {
    if (!BW.bib) { bwBibLaden(); raster = '<p class="unter">Wird geladen …</p>'; }
    else raster = BW.bib.length ? BW.bib.slice(0, 200).map(x => bwKachel('bild', x.id, '/bild/' + x.id, x.prompt.slice(0, 60))).join('') : '<p class="unter">Die Bibliothek enthält noch keine Bilder.</p>';
  } else if (BW.tab === 'vorlagen') {
    const v = (IF.vorlagen?.vorlagen || []).filter(x => x.art === 'bild');
    raster = v.length ? v.map(x => bwKachel('vorlage', x.pfad, x.url, `${x.ordner} · ${x.name}`)).join('') : '<p class="unter">Im Vorlagen-Ordner liegen noch keine Bilder.</p>';
  } else {
    raster = IF_MUSTER.map(m => bwKachel('beispiel', m.id, m.bild, 'Beispiel: ' + m.name)).join('');
  }
  return `<h4>1 · Wer spielt die Hauptrolle? <small>@Bild 1 – wird das Startbild des Videos</small></h4>
    ${BW.bild ? `<div class="bw-gewaehlt"><img class="fokus${/blatt$|blätter/i.test(BW.bild.name || '') ? ' blatt' : ''}" src="${esc(BW.bild.url)}" alt=""><div><b>${esc(BW.bild.name || 'Gewählt')}</b>
      <small>Zum Austauschen einfach ein anderes Bild anklicken.</small></div></div>` : ''}
    <div class="filter bw-tabs" role="tablist">${tabs.map(([k, t]) => `<button role="tab" class="${BW.tab === k ? 'an' : ''}" data-bwtab="${k}">${t}</button>`).join('')}</div>
    <div class="bw-raster">${raster}</div>`;
}
const bwKachel = (art, wert, url, titel) =>
  `<button class="${BW.bild?.quelle === art && BW.bild?.wert === wert ? 'an' : ''}" data-bwbild="${art}" data-wert="${esc(wert)}" data-url="${esc(url)}" data-titel="${esc(titel || '')}" data-tip="${esc(titel || '')}">
    <img class="fokus${/blatt$|blätter/i.test(titel || '') ? ' blatt' : ''}" src="${esc(url)}" loading="lazy" alt=""></button>`;
async function bwBibLaden() {
  try { BW.bib = (await api('bilder?ansicht=alle&typ=bild')).bilder; } catch (e) { BW.bib = []; fehler(e); }
  if (BW.schritt === 1 && BW.tab === 'bibliothek') bwZeichnen();
}

function bwSchritt2() {
  const karten = [
    ['beschreibung', '✍️', 'Kulisse beschreiben', 'Kein Video nötig: Ort und Bewegung antippen oder selbst schreiben.'],
    ['analyse', '🧩', 'Aus Video-Clone übernehmen', 'Eine fertige Analyse nehmen und mit eigenen Änderungen mischen.'],
    ['video', '🎬', 'Neues Vorbild-Video', 'Ein Video aus dem Vorlagen-Ordner oder per Link auslesen lassen.'],
  ];
  let detail = '';
  if (BW.quelle === 'beschreibung') {
    detail = `<label class="bw-label">Kulisse</label>
      <div class="if-chips">${BW_KULISSEN.map(([d, en]) => `<button class="chip ${BW.kulisse === en ? 'aktiv' : ''}" data-bwkulisse="${esc(en)}">${esc(d)}</button>`).join('')}</div>
      <textarea id="bwKulisse" rows="2" maxlength="600" placeholder="… oder selbst beschreiben, z. B. Herbststraße in New York, Laub, warmes Gegenlicht">${esc(BW.kulisse)}</textarea>
      <label class="bw-label">Bewegung</label>
      <div class="if-chips">${BW_BEWEGUNGEN.map(([d, en]) => `<button class="chip ${BW.bewegung === en ? 'aktiv' : ''}" data-bwbewegung="${esc(en)}">${esc(d)}</button>`).join('')}</div>
      <textarea id="bwBewegung" rows="2" maxlength="600" placeholder="… oder selbst beschreiben">${esc(BW.bewegung)}</textarea>`;
  } else if (BW.quelle === 'analyse') {
    if (!BW.klonListe) { bwKlonListeLaden(); detail = '<p class="unter">Analysen werden gesucht …</p>'; }
    else if (!BW.klonListe.length) detail = '<p class="hinweis">Noch keine Video-Clone-Analyse vorhanden. Wähle „Neues Vorbild-Video“.</p>';
    else detail = `<label class="bw-label">Analyse wählen</label>
      <div class="bw-liste">${BW.klonListe.map(c => `<button class="${BW.analyseChat === c.id ? 'an' : ''}" data-bwanalyse="${c.id}">${ico('video')}<span>${esc(c.titel || 'Analyse')}</span><small>${esc((c.geaendert || '').slice(0, 10))}</small></button>`).join('')}</div>
      ${BW.analyse ? `<div class="bw-analyse"><b>${esc(BW.analyseTitel || 'Analyse')}</b>
        ${BW.analyse.zusammenfassung ? `<p>${esc(BW.analyse.zusammenfassung)}</p>` : ''}
        <small>${(BW.analyse.szenen || []).length} Szenen${BW.analyse.stil ? ' · ' + esc(BW.analyse.stil) : ''}</small></div>
        <label class="bw-label">Mischen (optional) – was soll anders sein?</label>
        <textarea id="bwMix" rows="2" maxlength="600" placeholder="z. B. Kulisse: Strand statt Straße · hält ein Glas Saft statt einer Zigarette">${esc(BW.mix)}</textarea>` : ''}`;
  } else if (BW.quelle === 'video') {
    const v = (IF.vorlagen?.vorlagen || []).filter(x => x.art === 'video');
    detail = BW.klonLaeuft ? `<div class="bw-analyse"><span class="spin"></span> Video-Clone liest das Video aus … ${esc(KLON.job?.schritt || '')}</div>`
      : `<label class="bw-label">Aus dem Vorlagen-Ordner (Videos)</label>
      ${v.length ? `<div class="bw-liste">${v.map(x => `<button data-bwvideo="${esc(x.pfad)}">${ico('video')}<span>${esc(x.ordner)} · ${esc(x.name)}</span><small>Auslesen ≈ 0,01–0,05 $</small></button>`).join('')}</div>`
        : '<p class="unter">Noch keine Videos im Ordner <code>Vorlagen\\Videos</code>.</p>'}
      <button class="btn klein" id="bwKlonChat">${ico('video')}Link oder eigenes Video im Chat (Video-Clone)</button>
      <p class="unter">Danach hier „Aus Video-Clone übernehmen“ wählen.</p>`;
  }
  return `<h4>2 · Woher kommen Bewegung und Kulisse?</h4>
    <div class="bw-wahl">${karten.map(([k, e, t, s]) => `<button class="${BW.quelle === k ? 'an' : ''}" data-bwquelle="${k}"><span>${e}</span><b>${t}</b><small>${s}</small></button>`).join('')}</div>
    <div class="bw-detail">${detail}</div>`;
}
async function bwKlonListeLaden() {
  try { BW.klonListe = (await api('chats')).chats.filter(c => c.klon); } catch (e) { BW.klonListe = []; fehler(e); }
  if (BW.schritt === 2) bwZeichnen();
}
async function bwAnalyseWaehlen(id) {
  const c = (await api('chat/' + id)).chat;
  if (!c.klon?.analyse) return toast('In diesem Chat liegt keine Analyse.', 'fehler');
  Object.assign(BW, { analyseChat: id, analyse: c.klon.analyse, analyseTitel: c.klon.titel || c.titel || 'Analyse', quelle: 'analyse' });
}

function bwSchritt3() {
  return `<h4>3 · Welche Musik?</h4>
    <div class="if-chips">${IF_MUSIK.map(([n]) => `<button class="chip ${!BW.ohneMusik && !BW.eigen.trim() && BW.musik === n ? 'aktiv' : ''}" data-bwmusik="${esc(n)}">${esc(n)}</button>`).join('')}
      <button class="chip ${BW.ohneMusik ? 'aktiv' : ''}" data-bwmusik="">Ohne Musik</button></div>
    <input id="bwEigen" class="if-eingabe" maxlength="60" placeholder="… oder eigener Stil, z. B. 90er Eurodance" value="${esc(BW.eigen)}">`;
}
function bwSchritt4() {
  return `<h4>4 · Prompt prüfen <small>frei änderbar</small></h4>
    <textarea id="bwPrompt" class="bw-prompt" rows="9">${esc(BW.prompt)}</textarea>
    <div class="bw-zeile">${BW.promptEigen ? '<button class="btn klein" id="bwNeuBauen">Aus der Auswahl neu zusammensetzen</button><small>Du hast den Prompt geändert – er bleibt so, bis du neu zusammensetzt.</small>'
      : '<small>Wird aus deiner Auswahl gebaut. Sobald du tippst, bleibt deine Fassung erhalten.</small>'}</div>`;
}
function bwSchritt5() {
  const q = { beschreibung: 'Beschreibung', analyse: 'Video-Clone-Analyse' + (BW.mix.trim() ? ' + Änderungen' : '') }[BW.quelle] || '';
  return `<h4>5 · Wie geht es weiter?</h4>
    <div class="bw-zusammen"><img class="fokus${/blatt$|blätter/i.test(BW.bild?.name || '') ? ' blatt' : ''}" src="${esc(BW.bild?.url || '')}" alt="">
      <dl><dt>@Bild 1</dt><dd>${esc(BW.bild?.name || '')}</dd><dt>Bewegung</dt><dd>${esc(q)}</dd><dt>Musik</dt><dd>${esc(BW.ohneMusik ? 'ohne' : (BW.eigen.trim() || BW.musik))}</dd></dl></div>
    <div class="bw-wahl bw-ende">
      <button id="bwVideo" class="an lotse-ziel"><span>🎬</span><b>Im Video-Modus öffnen</b><small>Deine Figur ist das Startbild, der Prompt steht drin. Preis und Modell siehst du dort vor dem Erzeugen.</small></button>
      <button id="bwChat"><span>💬</span><b>Im Chat verfeinern</b><small>Prompt und Bild gehen ins Chatfeld – der Assistent baut daraus Szenen-Karten. Gesendet wird erst von dir.</small></button>
    </div>`;
}

// ------------------------------------------------------------------ Bedienung
async function bwKlick(ev) {
  const t = ev.target;
  const nav = t.closest('[data-ifnav-bw]');
  if (nav) { BW.zu?.(null); await ansicht(nav.dataset.ifnavBw); return; }
  const p = t.closest('[data-bwschritt]');
  if (p && !p.disabled) { BW.schritt = +p.dataset.bwschritt; return bwZeichnen(); }
  if (t.closest('#bwWeiter')) { if (bwFertig(BW.schritt)) BW.schritt++; return bwZeichnen(); }
  if (t.closest('#bwZurueck')) { BW.schritt--; return bwZeichnen(); }
  const tab = t.closest('[data-bwtab]');
  if (tab) { BW.tab = tab.dataset.bwtab; return bwZeichnen(); }
  const b = t.closest('[data-bwbild]');
  if (b) return bwBildWaehlen(b.dataset.bwbild, b.dataset.wert, b.dataset.url, b.dataset.titel);
  const q = t.closest('[data-bwquelle]');
  if (q) { BW.quelle = q.dataset.bwquelle; return bwZeichnen(); }
  const k = t.closest('[data-bwkulisse]');
  if (k) { BW.kulisse = BW.kulisse === k.dataset.bwkulisse ? '' : k.dataset.bwkulisse; return bwZeichnen(); }
  const bw = t.closest('[data-bwbewegung]');
  if (bw) { BW.bewegung = BW.bewegung === bw.dataset.bwbewegung ? '' : bw.dataset.bwbewegung; return bwZeichnen(); }
  const an = t.closest('[data-bwanalyse]');
  if (an) { await bwAnalyseWaehlen(an.dataset.bwanalyse); return bwZeichnen(); }
  const vi = t.closest('[data-bwvideo]');
  if (vi) return bwVideoAuslesen(vi.dataset.bwvideo);
  const mu = t.closest('[data-bwmusik]');
  if (mu) { BW.ohneMusik = !mu.dataset.bwmusik; if (mu.dataset.bwmusik) BW.musik = mu.dataset.bwmusik; BW.eigen = ''; return bwZeichnen(); }
  switch (t.closest('button')?.id) {
    case 'bwNeuBauen': BW.promptEigen = false; return bwZeichnen();
    case 'bwKlonChat': BW.zu?.(null); await ifChatBereit('klon'); if (C.chat.klon || C.chat.nachrichten.length) await chatNeu('klon');
      return toast('Video-Clone ist rechts offen. Nach der Analyse: Bewegung › Schritt 2 › „Aus Video-Clone übernehmen“.', 'ok');
    case 'bwVideo': return bwInsVideo();
    case 'bwChat': return bwInDenChat();
  }
}
function bwEingabe(ev) {
  const id = ev.target.id, w = ev.target.value;
  if (id === 'bwKulisse') BW.kulisse = w;
  else if (id === 'bwBewegung') BW.bewegung = w;
  else if (id === 'bwMix') BW.mix = w;
  else if (id === 'bwEigen') { BW.eigen = w; BW.ohneMusik = false; }
  else if (id === 'bwPrompt') { BW.prompt = w; BW.promptEigen = true; }
  else return;
  bwPromptAktualisieren();
  // Nur Knopf und Punkte nachführen, damit der Cursor im Feld bleibt
  const weiter = BW.card.querySelector('#bwWeiter');
  if (weiter) { const ok = bwFertig(BW.schritt); weiter.disabled = !ok; weiter.classList.toggle('lotse-ziel', ok); }
  BW.card.querySelectorAll('.if-chips .chip[data-bwkulisse]').forEach(c => c.classList.toggle('aktiv', c.dataset.bwkulisse === BW.kulisse));
  BW.card.querySelectorAll('.if-chips .chip[data-bwbewegung]').forEach(c => c.classList.toggle('aktiv', c.dataset.bwbewegung === BW.bewegung));
  if (id === 'bwEigen') BW.card.querySelectorAll('[data-bwmusik]').forEach(c => c.classList.toggle('aktiv', !w.trim() && c.dataset.bwmusik === BW.musik));
}
async function bwBildWaehlen(art, wert, url, titel) {
  if (art === 'bild') BW.bild = { quelle: art, wert, id: wert, url, name: titel };
  else if (art === 'vorlage') {
    const d = await api('vorlagen/uebernehmen', { pfad: wert });
    BW.bild = { quelle: art, wert, id: d.id, url: d.url, name: titel };
  } else {
    // Beispielbild liegt nur statisch vor → einmal als Upload ablegen, damit es Startbild sein kann
    const blob = await (await fetch(url)).blob();
    const daten = await new Promise((ok, nein) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = nein; r.readAsDataURL(blob); });
    const d = await api('upload', { daten, name: titel });
    BW.bild = { quelle: art, wert, id: d.id, url: d.url, name: titel };
  }
  bwZeichnen();
}
async function bwVideoAuslesen(pfad) {
  BW.zu?.(null);                // erst den Assistenten schließen, dann fragen – Dialoge nicht verschachteln
  if (!await bestaetigen('Video auslesen?', 'Video-Clone analysiert das Video (≈ 0,01–0,05 $). Die Vorlage bleibt im Ordner.', 'Auslesen')) return bewegungAssistent();
  await ifChatBereit('klon');
  if (C.chat.klon || C.chat.nachrichten.length) await chatNeu('klon');
  const chatId = C.chat.id;
  await klonStarten(pfad);
  BW.klonLaeuft = true; BW.quelle = 'video';
  bewegungAssistent();          // Bestätigung hat das Popup ersetzt – wieder öffnen
  clearInterval(BW.timer);
  BW.timer = setInterval(async () => {
    if (KLON.job?.status === 'laeuft') { if (BW.card && BW.schritt === 2) bwZeichnen(); return; }
    clearInterval(BW.timer); BW.klonLaeuft = false; BW.klonListe = null;
    if (KLON.job?.status === 'fertig') { await bwAnalyseWaehlen(chatId).catch(fehler); toast('Analyse fertig – sie ist übernommen.', 'ok'); }
    if (BW.card) bwZeichnen();
  }, 1500);
}
function bwInsVideo() {
  const prompt = BW.prompt.replaceAll('@Image 1', 'the person from the start frame');
  BW.zu?.(null);
  mitStartbild(BW.bild.id, BW.bild.url, prompt, 'Video-Modus: deine Figur ist das Startbild. Prüfen, dann „Erzeugen“.');
}
async function bwInDenChat() {
  BW.zu?.(null);
  await ifChatBereit();
  if (!C.anhang.some(a => a.id === BW.bild.id)) C.anhang.push({ id: BW.bild.id, url: BW.bild.url });
  anhangZeichnen();
  $('#chatText').value = 'Bewegung: Bau daraus Szenen-Prompts für den Video-Modus. @Image 1 ist meine Figur (Bild im Anhang) und wird das Startbild.\n\n' + BW.prompt;
  chatFeldHoehe();
  $('#chatText').focus();
  toast('Im Chatfeld, Bild hängt an – prüfen und abschicken.', 'ok');
}

// Bildausschnitt aufs Gesicht: Vorlagen haben weißen Hintergrund → oberste nicht-weiße Stelle (Kopf) suchen und den
// sichtbaren Ausschnitt darauf zentrieren. Charakterblätter (Klasse „blatt“: links Porträt, rechts Ganzkörper) bleiben links.
function fokusSetzen(i) {
  if (i.classList.contains('blatt') || !i.naturalWidth || !i.clientWidth) return;
  try {
    const W = 48, H = Math.max(8, Math.round(W * i.naturalHeight / i.naturalWidth));
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(i, 0, 0, W, H);
    const d = g.getImageData(0, 0, W, H).data;
    const motiv = (x, y) => { const k = (y * W + x) * 4; return d[k] < 232 || d[k + 1] < 232 || d[k + 2] < 232; };
    let oben = -1;
    for (let y = 0; y < H && oben < 0; y++) { let n = 0; for (let x = 0; x < W; x++) if (motiv(x, y)) n++; if (n >= 2) oben = y; }
    if (oben < 0) return;
    let sx = 0, n = 0;
    for (let y = oben; y < Math.min(H, oben + Math.ceil(H * 0.14)); y++) for (let x = 0; x < W; x++) if (motiv(x, y)) { sx += x; n++; }
    const fx = n ? (sx / n + 0.5) / W : 0.5, fy = oben / H;
    // Sichtbarer Anteil je Achse bei object-fit:cover
    const bild = i.naturalWidth / i.naturalHeight, box = i.clientWidth / i.clientHeight;
    const vx = Math.min(1, box / bild), vy = Math.min(1, bild / box);
    const px = vx < 1 ? Math.max(0, Math.min(1, (fx - vx / 2) / (1 - vx))) : 0.5;
    const py = vy < 1 ? Math.max(0, Math.min(1, (fy - 0.04) / (1 - vy))) : 0.5;
    i.style.objectPosition = `${(px * 100).toFixed(1)}% ${(py * 100).toFixed(1)}%`;
  } catch { /* Bild nicht lesbar – Standard-Ausschnitt bleibt */ }
}
document.addEventListener('load', ev => { const i = ev.target; if (i.tagName === 'IMG' && i.classList.contains('fokus')) fokusSetzen(i); }, true);
