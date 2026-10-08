/* PROMPTHEUS Cinema Studio — Influencer: Charaktere bauen (Panel, Galerie, Lotse). Nutzt die Helfer aus app.js, medien.js, chat.js.
   Plan: vps/Pläne/100_Cinema-Studio/Influencer-Plan.md · Vorlagen: web/influencer_vorlagen.json (aus charakter.md) */
'use strict';

Object.assign(I, {
  wuerfel: P('<rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8.5" cy="8.5" r="1.2" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.2" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1.2" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1.2" fill="currentColor"/>'),
  nachbauen: P('<path d="M4 12a8 8 0 0 1 14-5.3L20 9"/><path d="M20 4v5h-5"/><path d="M20 12a8 8 0 0 1-14 5.3L4 15"/><path d="M4 20v-5h5"/>'),
});

// Typen: [Schlüssel, Name, Symbol, Erklärung]
const IF_TYPEN = [
  ['normal', 'Normal', '🙂', 'Alltagsnah: natürliche Proportionen, realistischer Look'],
  ['kuehn', 'Kühn', '😎', 'Ein starkes Markenzeichen: Frisur oder Outfit fällt sofort auf'],
  ['extrem', 'Extrem', '🤯', 'Skulpturale Frisur, übertriebene Silhouette – maximal auffällig'],
  ['insekt', 'Insekt', '🐝', 'Mensch-Insekt-Mischwesen mit Fühlern und Panzerglanz'],
  ['frosch', 'Frosch', '🐸', 'Frosch- oder Amphibien-Figur mit großen Augen'],
  ['katze', 'Katze', '🐱', 'Katzen-Figur mit Fell, Schnurrhaaren und Schwanz'],
  ['hund', 'Hund', '🐶', 'Hunde-Figur mit Schnauze und treuem Blick'],
  ['nager', 'Nager', '🐹', 'Maus, Ratte, Hamster, Capybara oder Eichhörnchen'],
  ['vogel', 'Vogel', '🐦', 'Vogel-Figur mit Federn, Schnabel und Flügel-Armen'],
];
const ifTyp = k => IF_TYPEN.find(t => t[0] === k) || IF_TYPEN[0];
const IF_CHAT_VORSCHLAEGE = ['Gib mir 3 virale Influencer-Ideen', 'Mach meine Figur skurriler', 'Passendes Outfit für TikTok', 'Was mache ich als Nächstes?'];
const IF_FORMATE = ['3:4', '4:5', '9:16', '1:1'];
// Bewegung: Muster-Rezepte. Der Assistent (web/bewegung.js) fragt Schritt für Schritt: @Bild 1, Bewegung/Kulisse, Musik, Prompt.
// Ein Video ist nicht Pflicht – Beschreibung oder Video-Clone-Analyse reichen (Plan, Phase 2: nur 2 Bilder).
const IF_MUSTER = [{
  id: 'M-01', name: 'Haupttänzer ersetzen', bild: '/static/muster_haupttaenzer.webp',
  kurz: 'Deine Figur tanzt in der Mitte. Kulisse und Bewegung beschreibst du – oder übernimmst sie aus einem Vorbild-Video und mischst sie.',
}];
// Musikstil: [Anzeige, englisch für den Prompt]
const IF_MUSIK = [['Hip-Hop', 'hip-hop'], ['K-Pop', 'K-pop'], ['Afrobeats', 'Afrobeats'], ['Techno', 'techno'], ['Reggaeton', 'reggaeton'],
  ['Disco-Funk', 'disco funk'], ['Jazz-Swing', 'jazz swing'], ['Schlager', 'German Schlager']];

const IF = {
  daten: null, liste: [],
  typ: 'normal', typGewaehlt: false, basis: null, basisWeg: false, text: '', vorlage: null,
  reiter: 'entdecken', pille: 'vorlagen', erzeugt: false, busy: false,
  gen: Object.assign({ modell: '', seitenverhaeltnis: '3:4', anzahl: 1, spar: false }, speicher.lies('igen', {})),
  lotse: Object.assign({ aus: false }, speicher.lies('lotse.influencer', {})), quittiert: 0,
  vorlagen: null, vfilter: 'alle',
};
const ifSpeichern = () => speicher.setz('igen', IF.gen);
const ifLaeuft = () => S.auftraege.some(j => j.status === 'laufend' && j.influencer);

async function ifDatenLaden() {
  if (!IF.daten) {
    const r = await fetch('/static/influencer_vorlagen.json');
    if (!r.ok) throw new Error('Vorlagen nicht ladbar.');
    IF.daten = await r.json();
  }
  IF.liste = (await api('influencer')).influencer;
}

// ------------------------------------------------------------------ Modell
function ifModell() {
  const passt = m => m && (!IF.basis || m.referenzbilder);
  if (IF.gen.spar) {
    const preise = Object.fromEntries((K.daten?.bild || []).map(m => [m.id, m.preis_bild]));
    const kandidaten = S.modelle.filter(passt).filter(m => preise[m.id] != null).sort((a, b) => preise[a.id] - preise[b.id]);
    if (kandidaten.length) return kandidaten[0];
  }
  const m = S.modelle.find(x => x.id === IF.gen.modell) || S.modelle.find(x => x.id === S.standard) || S.modelle[0];
  return passt(m) ? m : (S.modelle.find(passt) || m);
}
function ifParameter(m) {
  const p = m?.parameter || {};
  return {
    seitenverhaeltnis: passend(seitenWerte(m), IF.gen.seitenverhaeltnis, ['3:4', '2:3', '4:5', '1:1', 'auto']),
    qualitaet: passend(p.quality?.werte, 'medium', ['medium', 'high', 'auto']),
    aufloesung: passend(p.resolution?.werte, '1K', ['1K', '2K']),
  };
}
async function influencerKosten(anzahl = IF.gen.anzahl) {
  const m = ifModell();
  if (!m) return null;
  const par = ifParameter(m);
  try {
    const s = await api('schaetzen', { modell: m.id, aufloesung: par.aufloesung, qualitaet: par.qualitaet, anzahl, prompt_len: 1400, refs: IF.basis ? 1 : 0 });
    return s.quelle === 'unbekannt' ? null : s.gesamt;
  } catch { return null; }
}
let ifPreisTimer;
function ifPreisZeigen() {
  clearTimeout(ifPreisTimer);
  ifPreisTimer = setTimeout(async () => {
    const el = $('#ifPreis'), btn = $('#ifGen');
    if (!el) return;
    const p = await influencerKosten();
    el.textContent = p == null ? 'Preis ?' : '≈ ' + geld(p);
    const m = ifModell();
    btn.dataset.tip = `Erzeugt ${IF.gen.anzahl} Bild${IF.gen.anzahl > 1 ? 'er' : ''} mit ${m?.name || '–'}` + (p == null ? '' : ` · ca. ${geld(p)}`) +
      '\nDas Ergebnis erscheint rechts im Verlauf.';
  }, 150);
}

// ------------------------------------------------------------------ Prompt
function ifPrompt({ vorlage = IF.vorlage, typ = IF.typ, text = IF.text, basis = IF.basis, variante = false } = {}) {
  const d = IF.daten;
  const teile = [];
  if (basis?.quelle === 'foto') teile.push(d.fotoanker);
  teile.push(d.grundblock);
  if (variante) {
    teile.push('Character: the exact character shown in the reference image. Keep identity, hair, outfit and colors; change only pose, expression and camera angle slightly.');
  } else {
    if (basis?.quelle === 'figur') teile.push('Base character: use the character in the reference image as the starting point. Keep the signature hair design, outfit colors and overall vibe recognizable, then apply the type below.');
    teile.push('Character:\n' + (vorlage?.prompt ? ifPromptOhneBlatt(vorlage.prompt) : (basis ? 'Subject: the character from the reference image as a memorable fashion influencer.'
      : 'Subject: an original, memorable fictional adult influencer character with one distinctive signature look.')));
    teile.push('Type: ' + d.typen[typ]);
  }
  if (text.trim()) teile.push('Extra details from the user (highest priority for styling): ' + text.trim());
  return teile.join('\n\n');
}
function ifName() {
  if (IF.vorlage?.name) return IF.vorlage.name;
  const t = IF.text.split(/[,.;\n]/)[0].trim();
  if (t) return (t[0].toUpperCase() + t.slice(1)).slice(0, 40);
  if (IF.basis?.name) return `${IF.basis.name} als ${ifTyp(IF.typ)[1]}`.slice(0, 60);
  return `${ifTyp(IF.typ)[1]}-Figur ${IF.liste.length + 1}`;
}

// ------------------------------------------------------------------ Erzeugen
async function ifErzeugen({ anzahl = IF.gen.anzahl, variante = null, vorlage = IF.vorlage, typ = IF.typ, name = null } = {}) {
  if (IF.busy) return;
  if (!IF.daten) return toast('Vorlagen werden noch geladen …');
  const m = ifModell();
  if (!m) return toast('Kein Bildmodell verfügbar. Bitte Einstellungen → Anschluss prüfen.', 'fehler');
  const basis = variante ? { id: variante.bilder[0].id, quelle: 'figur' } : IF.basis;
  if (basis && !m.referenzbilder) return toast('Dieses Modell nimmt keine Referenzbilder. Wähle ein anderes Modell oder schalte den Sparmodus ein.', 'fehler');
  if (anzahl > 2) {
    const p = await influencerKosten(anzahl);
    if (!await bestaetigen(`${anzahl} Bilder erzeugen?`, `Das kostet voraussichtlich ${p == null ? 'einen unbekannten Betrag' : geld(p)}.`, 'Erzeugen')) return;
  }
  IF.busy = true;
  const btn = $('#ifGen');
  if (btn) btn.disabled = true;
  try {
    let iid = variante?.id;
    if (!iid) {
      iid = (await api('influencer', { name: name || ifName(), typ, prompt: (vorlage?.prompt || '') + (IF.text.trim() ? '\nExtra: ' + IF.text.trim() : ''),
        vorlage_id: vorlage?.id || '', basis: basis?.id || '' })).id;
    }
    const par = ifParameter(m);
    await erzeugen({ modell: m.id, prompt: ifPrompt({ vorlage, typ, basis, variante: !!variante, text: variante ? '' : IF.text }), ...par, anzahl,
      hintergrund: '', refs: basis ? [basis.id] : [], elemente: [], influencer_id: iid });
    IF.liste = (await api('influencer')).influencer;
    if (S.ansicht.startsWith('influencer:')) ifAktualisieren();
  } catch (e) { fehler(e); }
  finally { setTimeout(() => { IF.busy = false; const b = $('#ifGen'); if (b) b.disabled = false; }, 800); }
}
function influencerNachAuftrag() {
  IF.reiter = 'verlauf'; IF.erzeugt = false;
  if (S.ansicht === 'influencer:erstellen') ifHauptZeichnen();
  else if (S.ansicht === 'influencer:meine') ifMeineZeichnen();
  lotseZeigen();
}
let ifAuftragStand = '';
async function influencerAuftraegeGeaendert(fertig) {
  const stand = S.auftraege.filter(j => j.influencer).map(j => `${j.id}:${j.status}:${j.bilder.length}`).join('|');
  if (!fertig && stand === ifAuftragStand) return;
  ifAuftragStand = stand;
  if (fertig) {
    try { IF.liste = (await api('influencer')).influencer; } catch { /* still */ }
    if (S.auftraege.some(j => j.influencer && j.status !== 'laufend' && j.bilder.length)) IF.erzeugt = true;
  }
  if (S.ansicht === 'influencer:erstellen') ifHauptZeichnen();
  else if (S.ansicht === 'influencer:meine') ifMeineZeichnen();
  lotseZeigen();
}

// ------------------------------------------------------------------ Seiten
async function influencerZeigen(a) {
  const wand = $('#wand');
  if (a === 'influencer:bewegung') { lotseWeg(); ifBewegungZeichnen(); ifVorlagenLaden(); return; }
  wand.innerHTML = `<div class="leer"><div class="gross">${ico('profil')}</div><h3>Lade Influencer …</h3></div>`;
  try { await ifDatenLaden(); } catch (e) { fehler(e); }
  if (S.ansicht !== a) return;
  if (!S.modelle.length) await katalogLaden().catch(() => {});
  if (!K.daten) katalogHolen().then(ifPreisZeigen).catch(() => {});
  await ifVorlagenLaden();         // bei jedem Besuch frisch: neue Dateien im Ordner erscheinen sofort
  if (S.ansicht !== a) return;
  if (a === 'influencer:meine') return ifMeineZeichnen();
  wand.innerHTML = `<div class="if-seite"><aside class="if-panel" id="ifPanel" aria-label="Influencer bauen"></aside>
    <section class="if-haupt" id="ifHaupt"></section></div>`;
  ifPanelZeichnen();
  ifHauptZeichnen();
  lotseZeigen();
}

function ifPanelZeichnen() {
  const el = $('#ifPanel');
  if (!el) return;
  const m = ifModell(), schritt = lotseSchritt()?.n || 0;
  const b = IF.basis;
  el.innerHTML = `
    <div class="if-kopf"><div><small>Erstelle deinen eigenen Charakter</small><h2>KI-INFLUENCER</h2></div>
      <button class="icon-btn" id="ifHilfe" data-tip="Hilfe: Ein Pfeil zeigt dir Schritt für Schritt, was als Nächstes kommt." aria-label="Hilfe">?</button></div>
    <div class="if-punkte" aria-label="Fortschritt">${[1, 2, 3, 4, 5].map(n => `<button data-ifschritt="${n}" class="${n < schritt ? 'fertig' : n === schritt ? 'jetzt' : ''}"
      data-tip="${esc(['Typ wählen', 'Foto oder Basis (optional)', 'Besonderheiten', 'Erzeugen', 'Weiterarbeiten'][n - 1])}" aria-label="Schritt ${n}"></button>`).join('')}
      <span>${schritt ? `Schritt ${schritt} von 5` : ''}</span></div>
    <div class="filter if-modus" role="tablist"><button class="an" role="tab">Bauen</button><button data-ifnav="influencer:bewegung" role="tab" data-tip="Muster: deine Figur in ein Vorbild-Video setzen">Bewegung</button></div>
    <div class="if-upload ${b ? 'belegt' : ''}" id="ifUpload" data-tip="${b ? 'Basis für den neuen Charakter' : 'Optional: Foto hierher ziehen oder hochladen.\nNur Fotos von Personen, die einverstanden sind.'}">
      ${b ? `<img src="${esc(b.url)}" alt=""><div><b>${esc(b.name || (b.quelle === 'foto' ? 'Dein Foto' : 'Basis'))}</b><small>${b.quelle === 'foto' ? 'Gesicht bleibt erhalten' : 'Neuer Charakter auf dieser Basis'}</small></div>
           <button class="x" id="ifBasisWeg" data-tip="Basis entfernen" aria-label="Basis entfernen">✕</button>`
        : `<span class="if-up-ico">${ico('hochladen')}</span><b>Eigenes Foto hochladen</b><small>optional · oder bei einer Karte „Als Basis“</small>
           <div class="if-up-knoepfe"><button class="btn klein" id="ifFoto">Hochladen</button><button class="btn klein" id="ifBib">Aus Bibliothek</button>
           ${IF.basisWeg ? '' : '<button class="btn klein" id="ifSkip" data-tip="Ohne Foto weitermachen">Überspringen</button>'}</div>`}
    </div>
    <div class="if-abschnitt">Charaktertyp <small>${IF_TYPEN.length}</small></div>
    <div class="if-typen" role="radiogroup" aria-label="Charaktertyp">${IF_TYPEN.map(([k, n, s, t]) =>
      `<button role="radio" aria-checked="${IF.typGewaehlt && IF.typ === k}" class="${IF.typGewaehlt && IF.typ === k ? 'an' : ''}" data-iftyp="${k}" data-tip="${esc(t)}"><span>${s}</span>${n}</button>`).join('')}</div>
    ${IF.vorlage ? `<div class="if-vorlage" data-tip="${esc(IF.vorlage.kurz || IF.vorlage.prompt.slice(0, 200))}">Vorlage: <b>${esc(IF.vorlage.name)}</b><button class="x" id="ifVorlageWeg" aria-label="Vorlage entfernen" data-tip="Vorlage entfernen">✕</button></div>` : ''}
    <div class="feld"><label for="ifText">Besonderheiten <small>optional</small></label>
      <textarea id="ifText" rows="3" maxlength="1500" placeholder="z. B. pinke Lederjacke, Riesenschnurrbart, Sonnenbrille">${esc(IF.text)}</textarea></div>
    <div class="if-chips">
      <button class="chip" id="ifModell" data-tip="Bildmodell wählen${m ? `\nAktuell: ${esc(m.name)}` : ''}" ${IF.gen.spar ? 'disabled' : ''}><span class="txt">${esc(m?.name || 'Modell')}</span></button>
      <button class="chip" id="ifFormat" data-tip="Seitenverhältnis – 3:4 passt zu den Karten">${formIcon(IF.gen.seitenverhaeltnis)}<span>${esc(IF.gen.seitenverhaeltnis)}</span></button>
      <div class="chip if-anz" data-tip="Wie viele Bilder auf einmal (1–4)"><button id="ifMinus" ${IF.gen.anzahl <= 1 ? 'disabled' : ''} aria-label="Weniger">${ico('minus')}</button><span>${IF.gen.anzahl}/4</span>
        <button id="ifPlus" ${IF.gen.anzahl >= 4 ? 'disabled' : ''} aria-label="Mehr">${ico('plus')}</button></div>
    </div>
    <label class="if-spar" data-tip="Nimmt automatisch das günstigste passende Bildmodell"><span><b>Sparmodus</b><small>günstigstes Modell</small></span>
      <input type="checkbox" role="switch" id="ifSpar" ${IF.gen.spar ? 'checked' : ''}></label>
    <div class="if-los">
      <button class="if-zufall" id="ifZufall" data-tip="Zufallsidee: wählt eine Vorlage und einen Typ" aria-label="Zufall">${ico('wuerfel')}</button>
      <button class="if-gen" id="ifGen" ${IF.busy ? 'disabled' : ''}><span>Erzeugen</span><small id="ifPreis">…</small></button>
    </div>`;
  ifPreisZeigen();
}

const ifEigenZuVorlage = id => IF.liste.find(i => i.vorlage_id === id && i.bilder.length);
// Bild-Vorlagen aus dem Vorlagen-Ordner: Bilder\Influencer <Typ>\datei.png + gleichnamige .txt (Prompt).
// Sie stehen in der Galerie vor den reinen Text-Vorlagen und zeigen ihr echtes Bild.
function ifBildVorlagen() {
  return (IF.vorlagen?.vorlagen || []).filter(v => v.art === 'bild' && /^influencer\s/i.test(v.ordner)).map(v => {
    const tname = v.ordner.replace(/^influencer\s+/i, '').toLowerCase();
    const typ = (IF_TYPEN.find(t => t[1].toLowerCase() === tname || t[0] === tname) || IF_TYPEN[0])[0];
    const sig = (v.prompt.match(/Signature:\s*([^.]*)/i) || [])[1] || v.prompt.split('. ')[0] || '';
    return { id: 'ord:' + v.pfad, name: v.name.replace(/^HF-(\d+)\s*(.*)$/, (_, n, s) => `${s ? s[0].toUpperCase() + s.slice(1) : 'Figur'} ${n}`),
      typ, prompt: v.prompt, kurz: sig.slice(0, 140), bild: v.url, pfad: v.pfad };
  });
}
const ifAlleVorlagen = () => [...ifBildVorlagen(), ...(IF.daten?.vorlagen || [])];
// Ansichtsblatt-Angaben aus fremden Prompts entfernen – den Bildaufbau bestimmt unser Grundblock
const ifPromptOhneBlatt = p => p.replace(/Two-panel sheet:[^.]*\.\s*/i, '');
const ifAr = v => (/full body/i.test(v.prompt) ? 0.68 : 0.82);
function ifVorlagenKarte(v) {
  const eigen = ifEigenZuVorlage(v.id);
  const t = ifTyp(v.typ);
  const bild = eigen?.bilder[0].url || v.bild;
  return `<div class="if-karte" data-vorlage="${esc(v.id)}" style="--ar:${bild ? 0.75 : ifAr(v)}">
    ${bild ? `<img class="fokus" src="${esc(bild)}" alt="${esc(v.name)}" loading="lazy">`
      : `<div class="if-silhouette"><span>${t[2]}</span><small>${esc(v.kurz)}</small>
         <button class="btn klein" data-ifa="vorschau" data-tip="Ein Bild dieser Figur erzeugen (kostet Guthaben)">Vorschau erzeugen</button></div>`}
    <span class="if-typ">${t[2]} ${esc(t[1])}</span>
    <div class="if-info"><b>${esc(v.name)}</b></div>
    <div class="if-aktionen">
      ${bild ? `<button class="rund" data-ifa="basis" data-tip="Als Basis: daraus einen neuen Charakter bauen">${ico('variation')}</button>` : ''}
      <button class="rund" data-ifa="chat" data-tip="Im Chat besprechen">${ico('zauber')}</button>
    </div>
    <button class="if-nachbauen" data-ifa="nachbauen" data-tip="Prompt und Typ dieser Vorlage ins Panel laden – dann „Erzeugen“ drücken">${ico('nachbauen')}Nachbauen</button>
  </div>`;
}
function ifEigenKarte(i, neu = false) {
  const t = ifTyp(i.typ), bild = i.bilder[0];
  return `<div class="if-karte${neu ? ' neu' : ''}" data-inf="${esc(i.id)}" style="--ar:${bild ? 0.75 : 0.82}">
    ${bild ? `<img src="${esc(bild.url)}" alt="${esc(i.name)}" loading="lazy">` : `<div class="if-silhouette"><span>${t[2]}</span><small>Noch kein Bild</small></div>`}
    <span class="if-typ">${t[2]} ${esc(t[1])}${i.bilder.length > 1 ? ` · ${i.bilder.length}` : ''}</span>
    <div class="if-info"><b>${esc(i.name)}</b></div>
    <div class="if-aktionen">
      ${bild ? `<button class="rund" data-ifa="basis" data-tip="Als Basis: daraus einen neuen Charakter bauen">${ico('variation')}</button>
      <button class="rund" data-ifa="varianten" data-tip="Varianten: 4 neue Bilder derselben Figur">${ico('raster')}</button>
      <button class="rund" data-ifa="element" data-tip="Als Element speichern – dann im Bildgenerator über „+“ nutzbar">${ico('at')}</button>` : ''}
      <button class="rund" data-ifa="chat" data-tip="Im Chat besprechen">${ico('zauber')}</button>
      <button class="rund" data-ifa="mehr" data-tip="Umbenennen, Herunterladen, Löschen">${ico('mehr')}</button>
    </div>
    ${bild ? '' : `<button class="if-nachbauen" data-ifa="erneut" data-tip="Mit diesen Einstellungen ein Bild erzeugen">${ico('funke')}Bild erzeugen</button>`}
  </div>`;
}
function ifWarteKarten() {
  return S.auftraege.filter(j => j.influencer && j.status === 'laufend').flatMap(j => {
    const n = IF.liste.find(i => i.id === j.influencer)?.name || 'Influencer';
    return Array.from({ length: Math.max(0, j.gesamt - j.bilder.length) }, () =>
      `<div class="if-karte karte warten" style="--ar:0.75"><div class="spin"></div><span>${esc(n)} entsteht …</span></div>`);
  }).join('') + S.auftraege.filter(j => j.influencer && j.status !== 'laufend' && j.fehler.length && !S.verworfen.has(j.id)).map(j =>
    `<div class="if-karte karte fehler" style="--ar:0.75"><b>Hat nicht geklappt</b><span>${esc(j.fehler[0])}</span>
      <button data-verwerfen="${j.id}">Ausblenden</button></div>`).join('');
}

function ifHauptZeichnen() {
  const el = $('#ifHaupt');
  if (!el || !IF.daten) return;
  const reiter = `<div class="filter if-reiter" role="tablist">
      <button role="tab" class="${IF.reiter === 'entdecken' ? 'an' : ''}" data-ifreiter="entdecken" data-tip="Vorlagen und deine Influencer entdecken">Entdecken</button>
      <button role="tab" class="${IF.reiter === 'verlauf' ? 'an' : ''}" data-ifreiter="verlauf" data-tip="Alles, was du hier erzeugt hast – neueste zuerst">Verlauf${ifLaeuft() ? ' ●' : ''}</button></div>`;
  if (IF.reiter === 'verlauf') {
    const bilder = IF.liste.flatMap(i => i.bilder.map(b => ({ ...i, bilder: [b] })));
    const warte = ifWarteKarten();
    el.innerHTML = reiter + (bilder.length || warte
      ? `<div class="if-mauer" id="ifVerlauf">${warte}${bilder.map((x, n) => ifEigenKarte(x, n === 0 && IF.erzeugt)).join('')}</div>`
      : `<div class="leer"><div class="gross">${ico('uhr')}</div><h3>Noch nichts erzeugt</h3><p>Wähle links einen Typ und drücke „Erzeugen“ – oder starte mit einer Vorlage.</p>
         <div class="knoepfe" style="justify-content:center"><button class="btn primaer" data-ifreiter="entdecken">Vorlagen ansehen</button></div></div>`);
    return;
  }
  const heroBilder = IF.liste.filter(i => i.bilder.length).slice(0, 5);
  const heroFuell = ifBildVorlagen().filter((v, n) => n % 7 === 0).slice(0, 5 - heroBilder.length);
  const meine = IF.liste;
  const pillen = `<div class="if-pillen" role="tablist">
      <button class="${IF.pille === 'meine' ? 'an' : ''}" data-ifpille="meine" data-tip="Deine eigenen Charaktere">Meine Influencer ${meine.length ? `<small>${meine.length}</small>` : ''}</button>
      <button class="${IF.pille === 'vorlagen' ? 'an' : ''}" data-ifpille="vorlagen" data-tip="Fertige Figuren zum Nachbauen – mit Bild aus dem Vorlagen-Ordner, danach reine Text-Vorlagen">Vorlagen <small>${ifAlleVorlagen().length}</small></button>
      <button disabled data-tip="Kommt bald: Charaktere aus der Community">Community-Trends <small>bald</small></button></div>`;
  let mauer;
  if (IF.pille === 'meine') {
    mauer = meine.length || ifLaeuft() ? `<div class="if-mauer">${ifWarteKarten()}${meine.map(i => ifEigenKarte(i)).join('')}</div>`
      : `<div class="leer"><div class="gross">${ico('profil')}</div><h3>Noch keine eigenen Influencer</h3><p>Starte mit einer Vorlage: „Nachbauen“ lädt sie ins Panel.</p>
         <div class="knoepfe" style="justify-content:center"><button class="btn primaer" data-ifpille="vorlagen">Mit einer Vorlage starten</button></div></div>`;
  } else {
    mauer = `<div class="if-mauer">${ifAlleVorlagen().map(ifVorlagenKarte).join('')}</div>`;
  }
  el.innerHTML = reiter + `<div class="if-hero">
      <div class="if-hero-bilder">${heroBilder.map(i => `<img class="fokus" src="${esc(i.bilder[0].url)}" alt="">`).join('')}${heroFuell.map(v => `<img class="fokus" src="${esc(v.bild)}" alt="" data-tip="${esc(v.name)}">`).join('')}</div>
      <h2>DEIN INFLUENCER.<br>DEIN VIRALER HIT.</h2>
      <p>Baue deinen KI-Influencer mit Gesicht, Körper und Stil, wie du ihn willst – aus einer Vorlage, deinem Foto oder einer bestehenden Figur.</p>
    </div>` + pillen + mauer;
}
// ------------------------------------------------------------------ Bewegung (Muster)
function ifBewegungZeichnen() {
  const laeuft = BW.bild || BW.quelle;
  $('#wand').innerHTML = `<div class="if-bew">
    <div class="if-hero"><h2>DEINE FIGUR. DEIN TANZ.</h2>
      <p>Ein Assistent führt dich in 5 Schritten: Hauptfigur wählen, Bewegung und Kulisse festlegen (Beschreibung reicht – Video nur, wenn du willst),
      Musik, Prompt prüfen – dann ab in den Video-Modus oder in den Chat.</p></div>
    ${IF_MUSTER.map(x => `<article class="if-muster an">
      <figure><img class="fokus" src="${esc(x.bild)}" alt="Beispiel für @Bild 1" loading="lazy"><figcaption>Beispiel für @Bild 1</figcaption></figure>
      <div class="if-muster-inhalt">
        <small>${esc(x.id)} · Muster</small><h3>${esc(x.name)}</h3><p>${esc(x.kurz)}</p>
        <ol class="if-muster-schritte">
          ${BW_SCHRITTE.map((s, i) => `<li><b>${esc(s)}</b>${['', ' – Meine Influencer, Bibliothek, Vorlagen-Ordner oder Beispielbild; jederzeit austauschbar',
            ' – Beschreibung, Video-Clone-Analyse (mischbar) oder neues Vorbild-Video', ' – Stil antippen oder eigenen eintragen', ' – frei änderbar',
            ' – Video-Modus mit deiner Figur als Startbild oder Chat'][i + 1] || ''}</li>`).join('')}
        </ol>
        <div class="if-los"><button class="if-gen lotse-ziel" id="ifBewStart" data-tip="Öffnet den Assistenten – kostet nichts, bis du im Video-Modus erzeugst">
          ${laeuft ? 'Weitermachen' : 'Schritt für Schritt starten'}<small>${laeuft ? `bei Schritt ${BW.schritt}: ${esc(BW_SCHRITTE[BW.schritt - 1])}` : 'öffnet ein Fenster'}</small></button></div>
      </div></article>`).join('')}
    <section class="if-vorlagen" id="ifVorlagen">${ifVorlagenHtml()}</section>
    <p class="hinweis">Die Bewegung wird aus der Beschreibung nachgebaut, nicht Bild für Bild kopiert. Die Identität hält über das Startbild (@Bild 1).
      Nur Vorbilder verwenden, an denen du Rechte hast – fremde Personen, Marken und Musik werden nicht übernommen.</p>
  </div>`;
}
// Vorlagen-Ordner: <Ablage>\Vorlagen\Bilder|Videos\<Ordner> – bei jedem Besuch frisch eingelesen
async function ifVorlagenLaden() {
  try { IF.vorlagen = await api('vorlagen'); } catch (e) { IF.vorlagen = { fehler: e.message, vorlagen: [] }; }
  if (S.ansicht === 'influencer:bewegung' && $('#ifVorlagen')) $('#ifVorlagen').innerHTML = ifVorlagenHtml();
}
function ifVorlagenHtml() {
  const d = IF.vorlagen;
  if (!d) return '<h3>Deine Vorlagen</h3><p class="unter">Wird eingelesen …</p>';
  if (d.fehler) return `<h3>Deine Vorlagen</h3><p class="hinweis">${esc(d.fehler)}</p>`;
  const filter = IF.vfilter, liste = d.vorlagen.filter(v => filter === 'alle' || `${v.art}:${v.ordner}` === filter || v.art === filter);
  const pillen = [['alle', 'Alle', d.vorlagen.length],
    ...['bild', 'video'].flatMap(art => {
      const ordner = [...new Set(d.vorlagen.filter(v => v.art === art).map(v => v.ordner))];
      return [[art, art === 'bild' ? 'Bilder' : 'Videos', d.vorlagen.filter(v => v.art === art).length],
        ...ordner.map(o => [`${art}:${o}`, `· ${o}`, d.vorlagen.filter(v => v.art === art && v.ordner === o).length])];
    })];
  return `<div class="if-vorlagen-kopf"><h3>Deine Vorlagen</h3>
      <button class="btn klein" id="ifVNeu" data-tip="Ordner neu einlesen">${ico('nachbauen')}Neu einlesen</button></div>
    <p class="unter">Bilder und Videos hier hineinlegen – sie erscheinen automatisch. Eine gleichnamige <code>.txt</code> daneben: bei Bildern die Figur-Beschreibung, bei Videos der Bewegungs-Prompt.</p>
    <div class="if-pfad"><code>${esc(d.pfad)}</code><button class="btn klein" id="ifVPfad">Pfad kopieren</button></div>
    <p class="unter">Unterordner: Bilder › ${esc(d.ordner.Bilder.join(', '))} · Videos › ${esc(d.ordner.Videos.join(', '))} – eigene Ordner gehen auch.</p>
    ${d.vorlagen.length ? `<div class="if-pillen">${pillen.map(([k, t, n]) => `<button class="${filter === k ? 'an' : ''}" data-ifvfilter="${esc(k)}">${esc(t)}<small>${n}</small></button>`).join('')}</div>
    <div class="if-vraster">${liste.map(v => `<div class="if-vkarte">
      ${v.art === 'bild' ? `<img class="fokus${/blatt$/i.test(v.name) || /blätter/i.test(v.ordner) ? ' blatt' : ''}" src="${esc(v.url)}" alt="" loading="lazy">` : `<video src="${esc(v.url)}#t=0.1" muted playsinline preload="metadata" data-vorschau></video>`}
      <span class="if-typ">${esc(v.ordner)}</span>
      <div class="if-vinfo"><b title="${esc(v.name)}">${esc(v.name)}</b>${v.prompt ? '<small>mit Prompt</small>' : ''}</div>
      <div class="if-vknoepfe">
        ${v.art === 'bild' ? `<button class="btn klein" data-ifv="basis" data-pfad="${esc(v.pfad)}" data-tip="Als @Bild 1 / Basis ins Panel „Erstellen“">Als @Bild 1</button>`
          : `<button class="btn klein primaer" data-ifv="klon" data-pfad="${esc(v.pfad)}" data-tip="Video-Clone liest dieses Video aus (≈ 0,01–0,05 $) – danach im Assistenten übernehmen und mischen">Auslesen</button>`}
        ${v.prompt && v.art === 'video' ? `<button class="btn klein" data-ifv="prompt" data-pfad="${esc(v.pfad)}" data-tip="${esc(v.prompt.slice(0, 160))}">Als Beschreibung</button>` : ''}
      </div></div>`).join('')}</div>`
    : '<p class="unter"><b>Noch leer.</b> Lege z. B. ein Tanzvideo in <code>Videos\\Tanz</code> und deine Figur in <code>Bilder\\Charaktere</code>, dann „Neu einlesen“.</p>'}`;
}
async function ifVorlageAktion(k) {
  const v = IF.vorlagen.vorlagen.find(x => x.pfad === k.dataset.pfad);
  if (!v) return;
  if (k.dataset.ifv === 'prompt') return bewegungAssistent({ quelle: 'beschreibung', bewegung: v.prompt, promptEigen: false, schritt: BW.bild ? 2 : 1 });
  if (k.dataset.ifv === 'basis') {
    const d = await api('vorlagen/uebernehmen', { pfad: v.pfad });
    IF.basis = { id: d.id, url: d.url, name: v.name, quelle: 'foto' }; IF.basisWeg = false;
    if (v.prompt) { IF.text = v.prompt; IF.erzeugt = false; }
    await ansicht('influencer:erstellen');
    return toast(`„${v.name}“ liegt als Basis im Panel.`, 'ok');
  }
  if (k.dataset.ifv === 'klon') return bwVideoAuslesen(v.pfad);
}

async function ifChatBereit(modus) {
  if (!C.offen) chatUmschalten(true);
  for (let i = 0; i < 60 && !C.chat; i++) await new Promise(r => setTimeout(r, 100));
  if (!C.chat) throw new Error('Der Chat ist noch nicht bereit – bitte erneut versuchen.');
  if (!modus || C.chat.modus === modus) return;
  if (C.chat.nachrichten.length || C.chat.klon) return chatNeu(modus);
  C.chat = (await api('chat/' + C.chat.id, { modus })).chat;
  await chatOeffnen(C.chat.id);
}
function ifMeineZeichnen() {
  if (S.ansicht !== 'influencer:meine') return;
  const w = $('#wand');
  $('#viewCount').textContent = IF.liste.length ? `${zahl(IF.liste.length)} Influencer` : '';
  w.innerHTML = IF.liste.length || ifLaeuft()
    ? `<div class="if-mauer if-voll">${ifWarteKarten()}${IF.liste.map(i => ifEigenKarte(i)).join('')}</div>`
    : `<div class="leer"><div class="gross">${ico('profil')}</div><h3>Noch keine Influencer</h3><p>Unter „Erstellen“ baust du deinen ersten Charakter – Schritt für Schritt.</p>
       <div class="knoepfe" style="justify-content:center"><button class="btn primaer" data-ifnav="influencer:erstellen">Ersten Influencer bauen</button></div></div>`;
}

// ------------------------------------------------------------------ Aktionen
const ifVorlage = id => ifAlleVorlagen().find(v => v.id === id);
const ifEigen = id => IF.liste.find(i => i.id === id);
function ifBlitz() {
  const p = $('#ifPanel');
  if (!p) return;
  p.classList.add('blitz');
  setTimeout(() => p.classList.remove('blitz'), 700);
}
// Panel geändert = neuer Bau beginnt: Schritt 5 („Fertig!“) ist erledigt
function ifNeuZeichnen() { IF.erzeugt = false; ifPanelZeichnen(); lotseZeigen(); }

async function influencerUebernehmen(k, sofort = false) {
  if (S.ansicht !== 'influencer:erstellen') await ansicht('influencer:erstellen');
  IF.vorlage = { id: '', name: k.name, typ: k.typ, prompt: k.prompt, kurz: '' };
  IF.typ = k.typ; IF.typGewaehlt = true; IF.text = '';
  ifNeuZeichnen(); ifBlitz();
  if (sofort) await ifErzeugen();
}
function influencerKarteBereinigen(k) {
  return { art: 'influencer', name: String(k.name || 'Neuer Influencer').slice(0, 60), typ: ifTyp(k.typ)[0], prompt: String(k.prompt).slice(0, 4000) };
}
function influencerKarteChat(k, idx) {
  const t = ifTyp(k.typ);
  return `<div class="ckarte" data-k="${idx}">
    <div class="ckopf">${ico('profil')}<b>Influencer</b><span>${esc(k.name)}</span><span class="cpreis" data-preis="${idx}"></span></div>
    <div class="cprompt">${esc(k.prompt)}</div>
    <div class="cchips"><span>${t[2]} ${esc(t[1])}</span></div>
    <div class="cknoepfe">
      <button class="btn klein" data-ka="eintragen" data-tip="Figur und Typ links ins Panel übernehmen">${ico('kopie')}Ins Panel</button>
      <button class="btn klein primaer" data-ka="erzeugen" data-tip="Sofort 1 Bild erzeugen – Kosten siehe oben">${ico('funke')}Direkt erzeugen</button>
    </div></div>`;
}
function influencerKontext() {
  if (!S.ansicht.startsWith('influencer:')) return {};
  return { modus: 'influencer', influencer: { typ: IF.typGewaehlt ? IF.typ : '', besonderheiten: IF.text, basis: IF.basis?.name || IF.vorlage?.name || '',
    schritt: lotseSchritt()?.text || '' } };
}
function ifImChat(text) {
  chatUmschalten(true);
  setTimeout(() => { $('#chatText').value = text; chatSenden(); }, 120);
}

async function ifKartenAktion(btn) {
  const karte = btn.closest('.if-karte');
  const a = btn.dataset.ifa;
  const v = karte.dataset.vorlage ? ifVorlage(karte.dataset.vorlage) : null;
  const i = karte.dataset.inf ? ifEigen(karte.dataset.inf) : (v ? ifEigenZuVorlage(v.id) : null);
  if (a === 'nachbauen') {
    IF.vorlage = v; IF.typ = v.typ; IF.typGewaehlt = true; IF.text = '';
    ifNeuZeichnen(); ifBlitz();
    $('#ifPanel')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    return toast(`„${v.name}“ ist im Panel – jetzt „Erzeugen“ drücken.`, 'ok');
  }
  if (a === 'vorschau') {
    const p = await influencerKosten(1);
    if (!await bestaetigen(`Vorschau für „${v.name}“?`, `Erzeugt 1 Bild dieser Vorlage${p == null ? '' : ` für ca. ${geld(p)}`}.`, 'Erzeugen')) return;
    const merk = { basis: IF.basis, text: IF.text };
    IF.basis = null; IF.text = '';
    try { await ifErzeugen({ anzahl: 1, vorlage: v, typ: v.typ, name: v.name }); } finally { IF.basis = merk.basis; IF.text = merk.text; }
    return;
  }
  if (a === 'basis' && !i && v?.bild) {
    const d = await api('vorlagen/uebernehmen', { pfad: v.pfad });
    IF.basis = { id: d.id, url: d.url, name: v.name, quelle: 'figur' };
    IF.vorlage = null;
    ifNeuZeichnen(); ifBlitz();
    return toast(`„${v.name}“ ist die Basis. Wähle jetzt einen Typ – z. B. „Frosch“.`, 'ok');
  }
  if (a === 'basis' && i?.bilder.length) {
    IF.basis = { id: i.bilder[0].id, url: i.bilder[0].url, name: i.name, quelle: 'figur' };
    IF.vorlage = null;
    if (S.ansicht !== 'influencer:erstellen') await ansicht('influencer:erstellen');
    ifNeuZeichnen(); ifBlitz();
    return toast(`„${i.name}“ ist die Basis. Wähle jetzt einen Typ – z. B. „Frosch“.`, 'ok');
  }
  if (a === 'varianten' && i) return ifErzeugen({ anzahl: 4, variante: i, typ: i.typ });
  if (a === 'erneut' && i) {
    IF.vorlage = { id: i.vorlage_id, name: i.name, typ: i.typ, prompt: i.prompt, kurz: '' }; IF.typ = i.typ; IF.typGewaehlt = true;
    if (S.ansicht !== 'influencer:erstellen') await ansicht('influencer:erstellen');
    ifNeuZeichnen(); ifBlitz();
    return;
  }
  if (a === 'element' && i) {
    await api('elemente', { name: i.name, art: 'figur', bilder: i.bilder.slice(0, 14).map(b => b.id) });
    await elementeLaden();
    return toast(`„${i.name}“ ist jetzt ein Element – im Bildgenerator über „+“ nutzbar.`, 'ok');
  }
  if (a === 'chat') {
    const n = i?.name || v?.name;
    return ifImChat(`Hilf mir, den Influencer „${n}“ weiterzuentwickeln${v ? ` (${v.kurz})` : ''}. Schlage 2 Varianten als Karten vor.`);
  }
  if (a === 'mehr' && i) {
    menue(btn, [
      { ico: 'text', txt: 'Umbenennen', fn: async () => {
        const n = await eingabe('Influencer umbenennen', 'Name', i.name);
        if (n) { IF.liste = (await api('influencer', { id: i.id, name: n, typ: i.typ, prompt: i.prompt })).influencer; ifAktualisieren(); }
      } },
      ...(i.bilder.length ? [{ ico: 'download', txt: 'Bild herunterladen', fn: () => { location.href = i.bilder[0].url + '?dl=1'; } }] : []),
      '-',
      { ico: 'muell', txt: 'Influencer löschen', gefahr: true, klein: 'Bilder bleiben in der Bibliothek', fn: async () => {
        if (!await bestaetigen('Influencer löschen?', `„${i.name}“ wird entfernt. Die Bilder bleiben in der Bibliothek.`, 'Löschen', true)) return;
        IF.liste = (await api(`influencer/${i.id}/loeschen`, {})).influencer;
        if (IF.basis?.name === i.name) IF.basis = null;
        ifAktualisieren();
      } },
    ], { seite: 'oben' });
  }
}
function ifAktualisieren() {
  if (S.ansicht === 'influencer:meine') ifMeineZeichnen();
  else { ifPanelZeichnen(); ifHauptZeichnen(); }
  lotseZeigen();
}

async function ifFotoHochladen(files) {
  const f = files.find(x => x.type.startsWith('image/'));
  if (!f) return;
  if (f.size > 12 * 1024 * 1024) return toast(`${f.name}: größer als 12 MB.`, 'fehler');
  try {
    const daten = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(f); });
    const d = await api('upload', { daten, name: f.name });
    IF.basis = { id: d.id, url: d.url, name: 'Dein Foto', quelle: 'foto' };
    ifNeuZeichnen();
  } catch (e) { fehler(e); }
}
const ifFileIn = Object.assign(document.createElement('input'), { type: 'file', accept: 'image/png,image/jpeg,image/webp', hidden: true });
document.body.appendChild(ifFileIn);
ifFileIn.onchange = async () => { await ifFotoHochladen([...ifFileIn.files]); ifFileIn.value = ''; };

async function ifAusBibliothek() {
  let alle = [];
  try { alle = (await api('bilder?ansicht=alle&typ=bild')).bilder; } catch (e) { return fehler(e); }
  if (!alle.length) return toast('Die Bibliothek enthält noch keine Bilder.');
  const id = await modal(`<h3>Basis wählen</h3><p class="unter">Ein Bild anklicken – daraus entsteht der neue Charakter.</p>
    <div class="waehlraster" id="wr">${alle.slice(0, 300).map(b => `<button data-zu="${b.id}" data-tip="${esc(b.prompt.slice(0, 140))}"><img src="/bild/${b.id}" loading="lazy" alt=""></button>`).join('')}</div>
    <div class="knoepfe"><button class="btn" data-zu="null">Abbrechen</button></div>`, { breit: true });
  if (!id) return;
  IF.basis = { id, url: '/bild/' + id, name: 'Bild aus der Bibliothek', quelle: 'figur' };
  ifNeuZeichnen();
}

// Klicks und Eingaben auf der Wand (nur Influencer-Ansichten)
$('#wand').addEventListener('click', async ev => {
  if (!S.ansicht.startsWith('influencer:')) return;
  const t = ev.target;
  try {
    const nav = t.closest('[data-ifnav]');
    if (nav) {
      if (nav.dataset.ifnav === 'video') { await ansicht('erstellen'); modusSetzen('video'); } else await ansicht(nav.dataset.ifnav);
      return;
    }
    const ty = t.closest('[data-iftyp]');
    if (ty) { IF.typ = ty.dataset.iftyp; IF.typGewaehlt = true; ifNeuZeichnen(); return; }
    const r = t.closest('[data-ifreiter]');
    if (r) { IF.reiter = r.dataset.ifreiter; ifHauptZeichnen(); lotseZeigen(); return; }
    const pi = t.closest('[data-ifpille]');
    if (pi) { IF.pille = pi.dataset.ifpille; IF.reiter = 'entdecken'; ifHauptZeichnen(); lotseZeigen(); return; }
    const vw = t.closest('[data-verwerfen]');
    if (vw) { S.verworfen.add(vw.dataset.verwerfen); ifAktualisieren(); return; }
    const sch = t.closest('[data-ifschritt]');
    if (sch) { IF.quittiert = 0; lotseZeigen(true); return; }
    const ka = t.closest('[data-ifa]');
    if (ka) { await ifKartenAktion(ka); return; }
    const vf = t.closest('[data-ifvfilter]');
    if (vf) { IF.vfilter = vf.dataset.ifvfilter; $('#ifVorlagen').innerHTML = ifVorlagenHtml(); return; }
    const va = t.closest('[data-ifv]');
    if (va) { await ifVorlageAktion(va); return; }
    switch (t.closest('button')?.id) {
      case 'ifHilfe': IF.lotse.aus = false; IF.quittiert = 0; speicher.setz('lotse.influencer', IF.lotse); lotseZeigen(true); return;
      case 'ifFoto': ifFileIn.click(); return;
      case 'ifBib': await ifAusBibliothek(); return;
      case 'ifSkip': IF.basisWeg = true; ifNeuZeichnen(); return;
      case 'ifBasisWeg': IF.basis = null; ifNeuZeichnen(); return;
      case 'ifVorlageWeg': IF.vorlage = null; ifNeuZeichnen(); return;
      case 'ifMinus': IF.gen.anzahl = Math.max(1, IF.gen.anzahl - 1); ifSpeichern(); ifPanelZeichnen(); return;
      case 'ifPlus': IF.gen.anzahl = Math.min(4, IF.gen.anzahl + 1); ifSpeichern(); ifPanelZeichnen(); return;
      case 'ifGen': await ifErzeugen(); return;
      case 'ifBewStart': await bewegungAssistent(); return;
      case 'ifVNeu': IF.vorlagen = null; $('#ifVorlagen').innerHTML = ifVorlagenHtml(); await ifVorlagenLaden(); return;
      case 'ifVPfad': await textKopieren(IF.vorlagen.pfad, 'Pfad kopiert – im Explorer einfügen.'); return;
      case 'ifZufall': {
        const vl = ifAlleVorlagen(), v = vl[Math.floor(Math.random() * vl.length)];
        IF.vorlage = v;
        IF.typ = Math.random() < 0.6 ? v.typ : IF_TYPEN[Math.floor(Math.random() * IF_TYPEN.length)][0];
        IF.typGewaehlt = true;
        ifNeuZeichnen(); ifBlitz();
        toast(`Zufallsidee: ${v.name} als ${ifTyp(IF.typ)[1]}.`, 'ok');
        return;
      }
      case 'ifModell':
        return modellWahl($('#ifModell'), 'bild', ifModell()?.id, m => {
          if (!S.modelle.some(x => x.id === m.id)) return toast('Dieses Modell kann hier nicht genutzt werden.', 'fehler');
          IF.gen.modell = m.id; ifSpeichern(); ifPanelZeichnen();
        });
      case 'ifFormat':
        return menue($('#ifFormat'), IF_FORMATE.map(f => ({ txt: f, haken: IF.gen.seitenverhaeltnis === f,
          klein: f === '3:4' ? 'Standard, passt zu den Karten' : f === '9:16' ? 'Hochformat für Reels/TikTok' : '',
          fn: () => { IF.gen.seitenverhaeltnis = f; ifSpeichern(); ifPanelZeichnen(); } })), { seite: 'oben' });
    }
  } catch (e) { fehler(e); }
});
$('#wand').addEventListener('input', ev => {
  if (ev.target.id === 'ifText') { IF.text = ev.target.value; IF.erzeugt = false; lotseZeigen(); }
});
// Video-Vorlagen spielen beim Darüberfahren stumm an
$('#wand').addEventListener('mouseover', ev => { const v = ev.target.closest?.('video[data-vorschau]'); if (v && v.paused) v.play().catch(() => {}); });
$('#wand').addEventListener('mouseout', ev => { const v = ev.target.closest?.('video[data-vorschau]'); if (v) v.pause(); });
$('#wand').addEventListener('change', ev => {
  if (ev.target.id === 'ifSpar') { IF.gen.spar = ev.target.checked; ifSpeichern(); ifPanelZeichnen(); }
});
$('#wand').addEventListener('dragover', ev => {
  const z = ev.target.closest?.('#ifUpload');
  if (z && [...ev.dataTransfer.types].includes('Files')) { ev.preventDefault(); z.classList.add('drop'); }
});
$('#wand').addEventListener('dragleave', ev => ev.target.closest?.('#ifUpload')?.classList.remove('drop'));
$('#wand').addEventListener('drop', ev => {
  const z = ev.target.closest?.('#ifUpload');
  if (!z) return;
  ev.preventDefault(); z.classList.remove('drop');
  ifFotoHochladen([...ev.dataTransfer.files]);
});

// ------------------------------------------------------------------ Lotse (zustandsgesteuert)
// Bestimmt aus dem Seitenzustand den einen nächsten Schritt: Ziel, Text, Pfeilrichtung.
function lotseSchritt() {
  if (S.ansicht !== 'influencer:erstellen' || !$('#ifPanel')) return null;
  if (ifLaeuft()) return { n: 4, ziel: IF.reiter === 'verlauf' ? '#ifVerlauf .warten' : '[data-ifreiter="verlauf"]', seite: 'oben',
    text: IF.reiter === 'verlauf' ? 'Dein Bild entsteht gerade – gleich erscheint es hier.' : 'Dein Bild entsteht gerade. Schau im „Verlauf“ zu.' };
  if (IF.erzeugt) return { n: 5, ziel: IF.reiter === 'verlauf' ? '#ifVerlauf .if-karte.neu' : '[data-ifreiter="verlauf"]', seite: 'oben',
    text: 'Fertig! Auf der Karte: „Als Basis“ baut daraus neue Figuren, „Varianten“ macht 4 Versionen, „Als Element“ nutzt ihn im Bildgenerator.' };
  if (!IF.typGewaehlt) return { n: 1, ziel: '.if-typen', seite: 'rechts', text: 'Als Nächstes: Wähle einen Charaktertyp. „Normal“ ist der leichteste Start – oder drücke rechts bei einer Vorlage „Nachbauen“.' };
  if (!IF.basis && !IF.basisWeg && !IF.vorlage && !IF.text) return { n: 2, ziel: '#ifUpload', seite: 'rechts',
    text: 'Optional: Lade ein Foto hoch oder nimm eine Karte „Als Basis“. Ohne Foto geht es mit „Überspringen“ weiter.' };
  if (!IF.text && !IF.vorlage) return { n: 3, ziel: '#ifText', seite: 'rechts', text: 'Beschreibe in ein paar Wörtern, was die Figur besonders macht – oder drücke den Würfel für eine Zufallsidee.' };
  return { n: 4, ziel: '#ifGen', seite: 'rechts', text: 'Alles bereit! Drücke „Erzeugen“ – der Preis steht auf dem Knopf.' };
}
const LOTSE = { pfeil: null, blase: null, ziel: null, schritt: null };
function lotseWeg() {
  LOTSE.pfeil?.remove(); LOTSE.blase?.remove();
  LOTSE.pfeil = LOTSE.blase = null;
  LOTSE.ziel?.classList.remove('lotse-ziel');
  LOTSE.ziel = null; LOTSE.schritt = null;
}
function lotseZeigen(erzwingen = false) {
  const s = lotseSchritt();
  // Schrittpunkte im Panel nachführen
  $$('.if-punkte [data-ifschritt]').forEach(b => { const n = +b.dataset.ifschritt; b.className = s && n < s.n ? 'fertig' : s && n === s.n ? 'jetzt' : ''; });
  const zahlEl = $('.if-punkte span');
  if (zahlEl) zahlEl.textContent = s ? `Schritt ${s.n} von 5` : '';
  if (!s || IF.lotse.aus || (!erzwingen && IF.quittiert === s.n * 100 + (s.ziel.length % 97))) { lotseWeg(); return; }
  const ziel = $(s.ziel);
  if (!ziel) { lotseWeg(); return; }
  if (LOTSE.ziel !== ziel) { LOTSE.ziel?.classList.remove('lotse-ziel'); ziel.classList.add('lotse-ziel'); LOTSE.ziel = ziel; }
  if (!LOTSE.pfeil) {
    LOTSE.pfeil = Object.assign(document.createElement('div'), { className: 'lotse-pfeil', ariaHidden: 'true' });
    LOTSE.blase = Object.assign(document.createElement('div'), { className: 'lotse-blase' });
    LOTSE.blase.setAttribute('role', 'status');
    document.body.append(LOTSE.pfeil, LOTSE.blase);
    LOTSE.blase.onclick = ev => {
      const b = ev.target.closest('[data-lotse]');
      if (!b) return;
      if (b.dataset.lotse === 'aus') { IF.lotse.aus = true; speicher.setz('lotse.influencer', IF.lotse); toast('Hilfe aus. Mit „?“ im Panel kommt sie zurück.'); }
      else { const st = lotseSchritt(); if (st) IF.quittiert = st.n * 100 + (st.ziel.length % 97); }
      lotseWeg();
    };
  }
  if (LOTSE.schritt !== s.text) {
    LOTSE.blase.innerHTML = `<small>Schritt ${s.n} von 5</small><p><b>Als Nächstes:</b> ${esc(s.text.replace(/^Als Nächstes: /, ''))}</p>
      <div><button data-lotse="ok">Verstanden</button><button data-lotse="aus">Hilfe aus</button></div>`;
    LOTSE.schritt = s.text;
  }
  LOTSE.pfeil.dataset.seite = s.seite;
  lotsePlatzieren();
}
function lotsePlatzieren() {
  if (!LOTSE.pfeil || !LOTSE.ziel) return;
  const r = LOTSE.ziel.getBoundingClientRect();
  // auf schmalen Bildschirmen liegt die offene Leiste über der Seite → Lotse so lange ausblenden
  const leisteDrueber = innerWidth <= 700 && !$('#rail').classList.contains('zu');
  const sichtbar = !leisteDrueber && r.bottom > 40 && r.top < innerHeight - 20 && r.width > 0;
  LOTSE.pfeil.style.display = LOTSE.blase.style.display = sichtbar ? '' : 'none';
  if (!sichtbar) return;
  const p = LOTSE.pfeil, b = LOTSE.blase, bw = b.offsetWidth, bh = b.offsetHeight;
  if (p.dataset.seite === 'rechts' && r.right + 60 + bw < innerWidth) {
    p.textContent = '⬅';
    p.style.left = r.right + 8 + 'px'; p.style.top = r.top + Math.min(r.height, 80) / 2 - 18 + 'px';
    b.style.left = r.right + 56 + 'px'; b.style.top = Math.max(8, Math.min(innerHeight - bh - 8, r.top + Math.min(r.height, 80) / 2 - bh / 2)) + 'px';
  } else {
    p.dataset.seite = 'oben';
    p.textContent = '⬇';
    const mitte = r.left + r.width / 2;
    p.style.left = mitte - 16 + 'px'; p.style.top = Math.max(4, r.top - 44) + 'px';
    b.style.left = Math.max(8, Math.min(innerWidth - bw - 8, mitte - bw / 2)) + 'px';
    b.style.top = Math.max(8, r.top - 52 - bh) + 'px';
    if (r.top - 52 - bh < 8) b.style.top = Math.min(innerHeight - bh - 8, r.bottom + 12) + 'px';
  }
}
$('#wand').addEventListener('scroll', () => requestAnimationFrame(lotsePlatzieren), { passive: true });
addEventListener('resize', () => requestAnimationFrame(lotsePlatzieren));
// Leiste/Chat klappen mit Übergang auf: die Wand ändert danach ihre Breite → Pfeil neu setzen
new ResizeObserver(() => requestAnimationFrame(lotsePlatzieren)).observe($('#wand'));
new MutationObserver(() => requestAnimationFrame(lotsePlatzieren)).observe($('#rail'), { attributes: true, attributeFilter: ['class'] });
document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && LOTSE.blase) { const st = lotseSchritt(); if (st) IF.quittiert = st.n * 100 + (st.ziel.length % 97); lotseWeg(); } });
