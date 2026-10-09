/* PROMPTHEUS Cinema Studio — Seitenchat (rechts). Nutzt die Helfer aus app.js (S, api, esc, ico, toast, geld …). */
'use strict';

const C = {
  offen: speicher.lies('chatOffen', false),
  chats: [], chat: null, laeuft: false, steuerung: null, anhang: [], status: null,
  auto: speicher.lies('chatAuto', null),
};
const CHAT_MODI = { assistent: 'Assistent', drehbuch: 'Drehbuch', klon: 'Video-Clone', hyperframes: 'HyperFrames' };
// Vorschlag bei „Wobei kann ich helfen?“: startet das HyperFrames-Onboarding statt einer Nachricht
const HF_START = 'HyperFrames-Video';
// Zustand des Onboardings (bleibt beim Neuzeichnen erhalten)
const HF = { offen: '', quelle: 'idee', laenge: 10, format: '16:9', logo: null, produktbild: null, videoUrl: '', webseite: '',
  titel: '', idee: '', produkt: '', marke: '', story: '', laeuft: '', job: null,
  audio: null, audioArt: 'de', audioAb: '0', audioGanz: false };

// ------------------------------------------------------------------ Grundgerüst
function chatUmschalten(offen = !C.offen) {
  C.offen = offen;
  speicher.setz('chatOffen', offen);
  $('#seitenchat').classList.toggle('zu', !offen);
  $('#btnChat').classList.toggle('an', offen);
  if (offen && !C.chat) chatStart().catch(fehler);
  if (offen) setTimeout(() => $('#chatText').focus(), 50);
}
$('#btnChat').onclick = () => chatUmschalten();
$('#chatZu').onclick = () => chatUmschalten(false);

async function chatStart() {
  C.status = await api('assistent/status');
  const auto = C.auto ?? (await api('einstellungen').catch(() => null))?.einstellungen?.assistent_auto;
  C.auto = !!auto;
  $('#chatAuto').checked = C.auto;
  C.chats = (await api('chats')).chats;
  const letzter = speicher.lies('chatLetzter', '');
  const c = C.chats.find(x => x.id === letzter) || C.chats[0];
  if (c) await chatOeffnen(c.id); else await chatNeu('assistent');
  chatStatusZeigen();
}
function chatStatusZeigen() {
  const st = C.status;
  if (!st) return;
  const cli = st.claude.gefunden ? `Claude-CLI ${esc(st.claude.version || '')}` : 'Claude-CLI nicht gefunden';
  $('#chatStatus').innerHTML = `<span class="punkt ${st.claude.gefunden || st.schluessel ? 'ok' : ''}"></span>${cli}${st.schluessel ? ' · OpenRouter bereit' : ''}`;
  $('#chatStatus').dataset.tip = 'Gehirn und Modell stellst du unter Profil → Einstellungen → Assistent ein.\n' +
    'Chatinhalte gehen an Anthropic (Claude-CLI) bzw. an OpenRouter und den Modellanbieter.';
}

async function chatNeu(modus = C.chat?.modus || 'assistent') {
  const d = await api('chats', { modus });
  C.chats.unshift({ id: d.chat.id, titel: '', modus, geaendert: d.chat.erstellt, anzahl: 0 });
  await chatOeffnen(d.chat.id);
}
async function chatOeffnen(id) {
  C.chat = (await api('chat/' + id)).chat;
  speicher.setz('chatLetzter', id);
  $$('#chatModus button').forEach(b => b.classList.toggle('an', b.dataset.m === C.chat.modus));
  $('#chatTitel').textContent = C.chat.titel || 'Neuer Chat';
  chatZeichnen();
}
$('#chatNeu').onclick = () => chatNeu().catch(fehler);
$('#chatVerlauf').onclick = () => {
  menue($('#chatVerlauf'), [
    { kopf: 'Letzte Chats' },
    ...(C.chats.length ? C.chats.slice(0, 30).map(c => ({ ico: c.modus === 'drehbuch' || c.modus === 'hyperframes' ? 'video' : 'text', txt: c.titel || 'Neuer Chat',
      klein: `${CHAT_MODI[c.modus] || ''} · ${c.anzahl} Nachricht(en)`, haken: c.id === C.chat?.id, fn: () => chatOeffnen(c.id) })) : [{ txt: 'Noch keine Chats', aus: true }]),
    '-',
    { ico: 'text', txt: 'Umbenennen …', aus: !C.chat, fn: async () => {
      const n = await eingabe('Chat umbenennen', 'Titel', C.chat.titel);
      if (!n) return;
      C.chat = (await api('chat/' + C.chat.id, { titel: n })).chat;
      $('#chatTitel').textContent = n;
      C.chats = (await api('chats')).chats;
    } },
    { ico: 'zurueck', txt: 'Verlauf leeren', aus: !C.chat?.nachrichten.length, fn: async () => {
      if (!await bestaetigen('Verlauf leeren?', 'Alle Nachrichten dieses Chats werden entfernt.', 'Leeren', true)) return;
      C.chat = (await api('chat/' + C.chat.id, { leeren: true })).chat; chatZeichnen();
    } },
    { ico: 'muell', txt: 'Chat löschen', gefahr: true, aus: !C.chat, fn: async () => {
      if (!await bestaetigen('Chat löschen?', `„${C.chat.titel || 'Neuer Chat'}“ wird gelöscht.`, 'Löschen', true)) return;
      await api('chat/' + C.chat.id, { loeschen: true });
      C.chats = C.chats.filter(c => c.id !== C.chat.id);
      C.chat = null;
      if (C.chats[0]) await chatOeffnen(C.chats[0].id); else await chatNeu('assistent');
    } },
  ], { seite: 'unten' });
};
$('#chatModus').addEventListener('click', async ev => {
  const b = ev.target.closest('[data-m]');
  if (!b || !C.chat || b.dataset.m === C.chat.modus) return;
  // Moduswechsel: leerer Chat wird umgestellt, sonst neuer Chat im gewünschten Modus
  if (!C.chat.nachrichten.length) { C.chat = (await api('chat/' + C.chat.id, { modus: b.dataset.m })).chat; await chatOeffnen(C.chat.id); }
  else await chatNeu(b.dataset.m);
  if (b.dataset.m === 'drehbuch' && !C.chat.nachrichten.length) {
    $('#chatText').value = 'Ich möchte ein kurzes Video planen. ';
    $('#chatText').focus();
  }
});
$('#chatAuto').onchange = ev => { C.auto = ev.target.checked; speicher.setz('chatAuto', C.auto); };

// ------------------------------------------------------------------ Darstellung
function mdEinfach(text) {
  // Sicher: erst alles escapen, dann wenige Formatierungen zulassen
  const bloecke = [];
  let t = esc(text).replace(/```(\w*)\n([\s\S]*?)```/g, (_, spr, code) => { bloecke.push(`<pre><code>${code}</code></pre>`); return `\u0000${bloecke.length - 1}\u0000`; });
  t = t.replace(/`([^`\n]+)`/g, '<code>$1</code>').replace(/\*\*([^*\n]+)\*\*/g, '<b>$1</b>');
  const html = t.split(/\n{2,}/).map(abs => {
    const z = abs.split('\n');
    if (z.every(l => /^\s*[-*•] /.test(l))) return `<ul>${z.map(l => `<li>${l.replace(/^\s*[-*•] /, '')}</li>`).join('')}</ul>`;
    if (z.every(l => /^\s*\d+[.)] /.test(l))) return `<ol>${z.map(l => `<li>${l.replace(/^\s*\d+[.)] /, '')}</li>`).join('')}</ol>`;
    if (/^#{1,4} /.test(abs)) return `<h5>${abs.replace(/^#{1,4} /, '')}</h5>`;
    return `<p>${abs.replace(/\n/g, '<br>')}</p>`;
  }).join('');
  return html.replace(/\u0000(\d+)\u0000/g, (_, i) => bloecke[+i]);
}

const KARTE_RE = /```(bildprompt|videoprompt|audioprompt|influencer)\s*\n([\s\S]*?)```/g;
const KARTE_ART = { bildprompt: 'bild', videoprompt: 'video', audioprompt: 'audio', influencer: 'influencer' };
function kartenAus(text) {
  const out = [];
  for (const [, art, roh] of text.matchAll(KARTE_RE)) {
    try { const d = JSON.parse(roh); if (d && String(d.prompt || '').trim()) out.push({ ...d, art: KARTE_ART[art] }); } catch { /* unvollständig */ }
  }
  return out;
}
/** Karte an den Katalog anpassen: unbekannte Modelle/Werte fallen auf den aktuellen Stand zurück. */
function karteBereinigen(k) {
  if (k.art === 'influencer') return influencerKarteBereinigen(k);
  if (k.art === 'audio') {
    const m = A.modelle.find(x => x.id === k.modell) || aktAModell();
    return { art: 'audio', prompt: String(k.prompt), modell: m?.id || '', titel: k.titel, fremd: !!k.modell && m?.id !== k.modell };
  }
  if (k.art === 'video') {
    const m = S.vmodelle.find(x => x.id === k.modell) || aktVModell();
    const d = Number(k.dauer);
    return { art: 'video', prompt: String(k.prompt), modell: m?.id || '', szene: k.szene, titel: k.titel,
      seitenverhaeltnis: m?.formate.includes(k.seitenverhaeltnis) ? k.seitenverhaeltnis : '',
      aufloesung: m?.aufloesungen.includes(k.aufloesung) ? k.aufloesung : '',
      dauer: m?.dauern.includes(d) ? d : 0, ton: k.ton === undefined ? S.vgen.ton : !!k.ton,
      anzahl: Math.max(1, Math.min(4, +k.anzahl || 1)), fremd: !!k.modell && m?.id !== k.modell };
  }
  const m = S.modelle.find(x => x.id === k.modell) || aktModell();
  const p = m?.parameter || {};
  const ok = (feld, wert) => (feld === 'aspect_ratio' ? seitenWerte(m) : (p[feld]?.werte || [])).includes(wert);
  return { art: 'bild', prompt: String(k.prompt), modell: m?.id || '',
    seitenverhaeltnis: ok('aspect_ratio', k.seitenverhaeltnis) ? k.seitenverhaeltnis : '',
    aufloesung: ok('resolution', k.aufloesung) ? k.aufloesung : '', qualitaet: ok('quality', k.qualitaet) ? k.qualitaet : '',
    anzahl: Math.max(1, Math.min(4, +k.anzahl || 1)), fremd: !!k.modell && m?.id !== k.modell };
}
function karteHtmlChat(k, idx) {
  if (k.art === 'influencer') return influencerKarteChat(k, idx);
  if (k.art === 'audio') return karteHtmlAudio(k, idx);
  const vid = k.art === 'video';
  const m = vid ? S.vmodelle.find(x => x.id === k.modell) : S.modelle.find(x => x.id === k.modell);
  const chips = [m?.name, k.seitenverhaeltnis, k.aufloesung, vid && k.dauer ? `${k.dauer} s` : '', vid && m?.ton === true ? (k.ton ? 'Ton' : 'ohne Ton') : '',
    !vid && k.qualitaet ? QUAL[k.qualitaet]?.[0] : '', k.anzahl > 1 ? `${k.anzahl}×` : ''].filter(Boolean);
  return `<div class="ckarte" data-k="${idx}">
    <div class="ckopf">${ico(vid ? 'video' : 'bilder')}<b>${vid ? 'Video-Prompt' : 'Bild-Prompt'}${k.szene ? ` · Szene ${esc(k.szene)}` : ''}</b>
      ${k.titel ? `<span>${esc(k.titel)}</span>` : ''}<span class="cpreis" data-preis="${idx}"></span></div>
    <div class="cprompt">${esc(k.prompt)}</div>
    <div class="cchips">${chips.map(c => `<span>${esc(c)}</span>`).join('')}${k.fremd ? '<span class="warn" data-tip="Das vorgeschlagene Modell gibt es nicht – das aktuelle wird genutzt">Modell ersetzt</span>' : ''}</div>
    <div class="cknoepfe">
      <button class="btn klein" data-ka="eintragen" data-tip="Prompt und Einstellungen ins ${vid ? 'Video' : 'Bild'}-Eingabefeld übernehmen">${ico('kopie')}In ${vid ? 'Video' : 'Bild'}-Eingabe</button>
      <button class="btn klein primaer" data-ka="erzeugen" data-tip="Sofort erzeugen – Kosten siehe oben">${ico('funke')}Direkt erzeugen</button>
    </div></div>`;
}

function karteHtmlAudio(k, idx) {
  const m = A.modelle.find(x => x.id === k.modell);
  const zuLang = k.prompt.length > A.maxText;
  const chips = [m?.name, `${zahl(k.prompt.length)} Zeichen`].filter(Boolean);
  return `<div class="ckarte" data-k="${idx}">
    <div class="ckopf">${ico('mikro')}<b>Sprechertext</b>${k.titel ? `<span>${esc(k.titel)}</span>` : ''}<span class="cpreis" data-preis="${idx}"></span></div>
    <div class="cprompt">${esc(k.prompt)}</div>
    <div class="cchips">${chips.map(c => `<span>${esc(c)}</span>`).join('')}${k.fremd ? '<span class="warn" data-tip="Das vorgeschlagene Modell gibt es nicht – das aktuelle wird genutzt">Modell ersetzt</span>' : ''}${
      zuLang ? `<span class="warn" data-tip="Höchstens ${zahl(A.maxText)} Zeichen je Sprachausgabe">zu lang</span>` : ''}</div>
    <div class="cknoepfe">
      <button class="btn klein" data-ka="eintragen" data-tip="Text ins Audio-Eingabefeld übernehmen">${ico('kopie')}In Audio-Eingabe</button>
      <button class="btn klein primaer" data-ka="erzeugen" data-tip="Sofort mit der eingestellten Stimme sprechen lassen – Kosten siehe oben">${ico('funke')}Direkt erzeugen</button>
    </div></div>`;
}

let zeichnenGeplant = false;
function chatZeichnen() {
  const box = $('#chatNachrichten');
  if (!C.chat) { box.innerHTML = ''; return; }
  if (C.chat.modus === 'klon') {
    box.innerHTML = (C.chat.klon ? klonUebersicht(C.chat.klon) : klonStartHtml()) + (HF.offen === C.chat.id ? hfOnboardingHtml(true) : '') +
      C.chat.nachrichten.map((n, i) => nachrichtHtml(n, i)).join('');
    preiseNachladen(box);
    if (C.chat.nachrichten.length) box.scrollTop = box.scrollHeight;
    return;
  }
  if (!C.chat.nachrichten.length && C.chat.modus === 'assistent' && S.ansicht.startsWith('influencer:')) {
    box.innerHTML = `<div class="cleer">${ico('zauber')}<h4>Influencer bauen</h4>
      <p>Ich helfe dir, eine auffällige Figur zu erfinden. Jeder Vorschlag kommt als Karte – „Ins Panel“ übernimmt ihn links.</p>
      <div class="cvorschlaege">${IF_CHAT_VORSCHLAEGE.map(v => `<button data-vorschlag="${esc(v)}">${esc(v)}</button>`).join('')}</div></div>`;
    return;
  }
  if (C.chat.modus === 'hyperframes' && (!C.chat.nachrichten.length || HF.offen === C.chat.id)) {
    box.innerHTML = C.chat.nachrichten.map((n, i) => nachrichtHtml(n, i)).join('') + hfOnboardingHtml(false);
    if (C.chat.nachrichten.length) box.scrollTop = box.scrollHeight;
    return;
  }
  if (!C.chat.nachrichten.length) {
    box.innerHTML = `<div class="cleer">${ico('zauber')}<h4>${C.chat.modus === 'drehbuch' ? 'Drehbuch planen' : 'Wobei kann ich helfen?'}</h4>
      <p>${C.chat.modus === 'drehbuch'
        ? 'Ich führe dich vom Briefing bis zur Szenenliste. Jede Szene wird ein Video-Prompt, den du einzeln oder gesammelt erzeugst.'
        : 'Beschreibe deine Idee – ich schreibe passende Prompts für das gewählte Modell. Mit einem Klick landen sie im Eingabefeld.'}</p>
      <div class="cvorschlaege">${(C.chat.modus === 'drehbuch'
        ? ['30-Sekunden-Werbeclip für ein Café', 'Erklärvideo in 5 Szenen', 'Social-Reel 9:16 mit Hook']
        : S.modus === 'audio'
          ? ['Begrüssung für meinen Podcast', 'Sprechertext für ein 30-Sekunden-Produktvideo', 'Verbessere meinen aktuellen Text']
          : [HF_START, 'Produktfoto für einen Onlineshop', 'Filmische Landschaft bei Sonnenaufgang', 'Verbessere meinen aktuellen Prompt']).map(v =>
            v === HF_START ? `<button data-vorschlag="${esc(v)}" class="hf-start">${ico('video')}<b>${esc(v)}</b><small>Motion-Graphic aus Link, Produkt, Webseite oder Idee – 5 bis 30 s</small></button>`
              : `<button data-vorschlag="${esc(v)}">${esc(v)}</button>`).join('')}</div></div>`;
    return;
  }
  box.innerHTML = C.chat.nachrichten.map((n, i) => nachrichtHtml(n, i)).join('');
  preiseNachladen(box);
  box.scrollTop = box.scrollHeight;
}
function nachrichtHtml(n, i) {
  if (n.rolle === 'nutzer') {
    return `<div class="cmsg nutzer">${(n.bilder || []).map(id => `<img src="${mediumUrl(id)}" alt="">`).join('')}<div class="cblase">${esc(n.text).replace(/\n/g, '<br>')}</div></div>`;
  }
  const kartenListe = kartenAus(n.text).map(karteBereinigen);
  let text = n.text, ki = 0;
  text = text.replace(KARTE_RE, () => `\u0001${ki++}\u0001`);
  let html = mdEinfach(text).replace(/\u0001(\d+)\u0001/g, (_, x) => kartenListe[+x] ? karteHtmlChat(kartenListe[+x], `${i}:${x}`) : '');
  const szenen = kartenListe.filter(k => k.art === 'video');
  if (szenen.length >= 2) {
    html += `<div class="calle"><button class="btn primaer klein" data-alle="${i}" data-tip="Alle ${szenen.length} Video-Prompts nacheinander als Aufträge starten">${ico('video')}Alle ${szenen.length} Szenen erzeugen</button>
      <button class="btn klein" data-export="${i}" data-tip="Drehbuch als Markdown-Datei herunterladen">${ico('download')}Drehbuch speichern</button><span class="cpreis" data-preisalle="${i}"></span></div>`;
  }
  html = hfSchritteHtml(n) + html + (n.videos || []).map(id => `<div class="cvideo"><video src="/bild/${esc(id)}" controls playsinline preload="metadata"></video>
    <div class="cknoepfe"><a class="btn klein" href="/bild/${esc(id)}" download>${ico('download')}Herunterladen</a><button class="btn klein" data-zurbib>${ico('bilder')}In der Bibliothek</button></div></div>`).join('');
  return `<div class="cmsg assistent" data-n="${i}"><div class="cinhalt">${html}</div>
    <div class="cfuss">${esc(n.gehirn || '')}${n.abgebrochen ? ' · abgebrochen' : ''}</div></div>`;
}
function karteZu(schluessel) {
  const [i, x] = schluessel.split(':').map(Number);
  return kartenAus(C.chat.nachrichten[i]?.text || '').map(karteBereinigen)[x];
}
async function karteKosten(k) {
  try {
    if (k.art === 'influencer') return await influencerKosten(1);
    if (k.art === 'audio') {
      if (!k.modell) return null;
      const s = await api('schaetzen_audio', { modell: k.modell, zeichen: k.prompt.length });
      return s.frei ? 0 : (s.gesamt ?? null);
    }
    if (k.art === 'video') {
      const m = S.vmodelle.find(x => x.id === k.modell);
      const s = await api('schaetzen_video', { modell: k.modell, aufloesung: k.aufloesung || passend(m?.aufloesungen, '720p', ['720p']),
        dauer: k.dauer || m?.dauern[0], ton: m?.ton === true && k.ton, anzahl: k.anzahl });
      return s.quelle === 'unbekannt' ? null : s.gesamt;
    }
    const s = await api('schaetzen', { modell: k.modell, aufloesung: k.aufloesung, qualitaet: k.qualitaet, anzahl: k.anzahl, prompt_len: k.prompt.length });
    return s.quelle === 'unbekannt' ? null : s.gesamt;
  } catch { return null; }
}
async function preiseNachladen(box) {
  for (const el of $$('[data-preis]', box)) {
    const k = karteZu(el.dataset.preis);
    if (k) { const p = await karteKosten(k); el.textContent = p != null ? '≈ ' + geld(p) : ''; }
  }
  for (const el of $$('[data-preisalle]', box)) {
    const karten = kartenAus(C.chat.nachrichten[+el.dataset.preisalle].text).map(karteBereinigen).filter(k => k.art === 'video');
    let summe = 0, ok = true;
    for (const k of karten) { const p = await karteKosten(k); if (p == null) ok = false; else summe += p; }
    el.textContent = ok ? `zusammen ≈ ${geld(summe)}` : '';
  }
}

// ------------------------------------------------------------------ Karten übernehmen / erzeugen
function karteEintragen(k) {
  if (k.art === 'influencer') return influencerUebernehmen(k);
  if (!$('#composer').offsetParent) ansicht('erstellen');
  if (k.art === 'audio') {
    modusSetzen('audio');
    if (k.modell && k.modell !== A.gen.modell) { A.gen.modell = k.modell; A.gen.profil = ''; }
    audioAktualisieren();
  } else if (k.art === 'video') {
    modusSetzen('video');
    if (k.modell) S.vgen.modell = k.modell;
    Object.assign(S.vgen, Object.fromEntries(Object.entries({ seitenverhaeltnis: k.seitenverhaeltnis, aufloesung: k.aufloesung,
      dauer: k.dauer, anzahl: k.anzahl }).filter(([, v]) => v)));
    S.vgen.ton = k.ton;
    videoAktualisieren();
  } else {
    modusSetzen('bild');
    if (k.modell) S.gen.modell = k.modell;
    Object.assign(S.gen, Object.fromEntries(Object.entries({ seitenverhaeltnis: k.seitenverhaeltnis, aufloesung: k.aufloesung,
      qualitaet: k.qualitaet, anzahl: k.anzahl }).filter(([, v]) => v)));
    genAktualisieren();
  }
  pr.value = k.prompt; promptHoehe(); speicher.setz('prompt', pr.value);
  schaetzen();
  $('#composer').classList.add('blitz');
  setTimeout(() => $('#composer').classList.remove('blitz'), 700);
}
async function karteErzeugen(k) {
  if (k.art === 'influencer') return influencerUebernehmen(k, true);
  if (k.art === 'audio') {
    await audioErzeugen({ prompt: k.prompt, ...(k.modell ? { modell: k.modell } : {}) });
  } else if (k.art === 'video') {
    await erzeugen({ art: 'video', modell: k.modell, prompt: k.prompt, seitenverhaeltnis: k.seitenverhaeltnis, aufloesung: k.aufloesung,
      dauer: k.dauer, ton: k.ton, anzahl: k.anzahl, startbild: S.vgen.start?.id || '', endbild: S.vgen.ende?.id || '',
      vorlagen: S.vgen.vorlagen.map(v => v.id), raster: S.vgen.raster });
  } else {
    await erzeugen({ modell: k.modell, prompt: k.prompt, seitenverhaeltnis: k.seitenverhaeltnis, aufloesung: k.aufloesung,
      qualitaet: k.qualitaet, anzahl: k.anzahl, hintergrund: '', refs: S.gen.refs.map(r => r.id), elemente: S.gen.elemente.map(e => e.id) });
  }
}
$('#chatNachrichten').addEventListener('click', async ev => {
  const v = ev.target.closest('[data-vorschlag]');
  if (v && v.dataset.vorschlag === HF_START) return hfOeffnen().catch(fehler);
  if (ev.target.closest('[data-zurbib]')) { ansicht('bibliothek'); return; }
  if (v) {
    const t = v.dataset.vorschlag;
    $('#chatText').value = t.startsWith('Verbessere')
      ? `Verbessere meinen aktuellen ${S.modus === 'audio' ? 'Sprechertext' : 'Prompt'} und schlage 2 Varianten vor:\n${pr.value || '(noch leer)'}` : t;
    return chatSenden();
  }
  const b = ev.target.closest('[data-ka]');
  try {
    if (b) {
      const k = karteZu(b.closest('[data-k]').dataset.k);
      if (!k) return;
      if (b.dataset.ka === 'eintragen') { karteEintragen(k); toast(k.art === 'influencer' ? 'Ins Panel übernommen.' : 'Ins Eingabefeld übernommen.', 'ok'); }
      else await karteErzeugen(k);
      return;
    }
    const alle = ev.target.closest('[data-alle]');
    if (alle) return await alleSzenenErzeugen(+alle.dataset.alle);
    const ex = ev.target.closest('[data-export]');
    if (ex) return drehbuchExport(+ex.dataset.export);
  } catch (e) { fehler(e); }
});
async function alleSzenenErzeugen(i) {
  const karten = kartenAus(C.chat.nachrichten[i].text).map(karteBereinigen).filter(k => k.art === 'video');
  let summe = 0;
  for (const k of karten) summe += (await karteKosten(k)) || 0;
  if (!await bestaetigen('Alle Szenen erzeugen?', `${karten.length} Video-Aufträge, zusammen voraussichtlich ${geld(summe)}. Die Videos laufen parallel und dauern meist 1–5 Minuten.`, 'Alle starten')) return;
  for (const k of karten) { await karteErzeugen(k); await new Promise(r => setTimeout(r, 400)); }
  toast(`${karten.length} Szenen gestartet.`, 'ok');
}
function drehbuchExport(i) {
  const n = C.chat.nachrichten[i];
  const karten = kartenAus(n.text).map(karteBereinigen);
  const text = `# ${C.chat.titel || 'Drehbuch'}\n\nErstellt mit PROMPTHEUS Cinema Studio am ${new Date().toLocaleString('de-DE')}\n\n` +
    n.text.replace(KARTE_RE, '').trim() + '\n\n## Szenen\n\n' +
    karten.map((k, x) => `### Szene ${k.szene || x + 1}${k.titel ? ` – ${k.titel}` : ''}\n\n${k.prompt}\n\n` +
      `Modell: ${k.modell}${k.seitenverhaeltnis ? ` · ${k.seitenverhaeltnis}` : ''}${k.aufloesung ? ` · ${k.aufloesung}` : ''}${k.dauer ? ` · ${k.dauer} s` : ''}\n`).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'text/markdown' }));
  a.download = (C.chat.titel || 'drehbuch').replace(/[^\wäöüÄÖÜß-]+/g, '_').slice(0, 60) + '.md';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

// ------------------------------------------------------------------ Senden (Live-Antwort)
async function chatSenden(zusatz = {}) {
  const feld = $('#chatText');
  const text = feld.value.trim();
  if (!text || C.laeuft) return;
  if (!C.chat) await chatStart();
  const bilder = C.anhang.map(a => a.id);
  C.chat.nachrichten.push({ rolle: 'nutzer', text, bilder });
  const antwort = { rolle: 'assistent', text: '', gehirn: '…' };
  C.chat.nachrichten.push(antwort);
  feld.value = ''; chatFeldHoehe();
  C.anhang = []; anhangZeichnen();
  chatZeichnen();
  C.laeuft = true; knopfZustand();
  C.steuerung = new AbortController();
  const kontext = { modus: S.modus, modell: S.modus === 'video' ? S.vgen.modell : S.modus === 'audio' ? A.gen.modell : S.gen.modell,
    bildmodell: S.gen.modell, videomodell: S.vgen.modell, audiomodell: A.gen.modell, prompt: pr.value, ...influencerKontext(),
    bildrollen: { start: !!S.vgen.start, ende: !!S.vgen.ende, vorlagen: S.vgen.vorlagen.length, raster: S.vgen.raster }, ...zusatz };
  let fertig = null;
  try {
    const r = await fetch(`/api/chat/${C.chat.id}/senden`, { method: 'POST', signal: C.steuerung.signal,
      headers: { 'Content-Type': 'application/json', 'X-CSRF': S.csrf }, body: JSON.stringify({ text, bilder, kontext }) });
    if (!r.ok) { const d = await r.json().catch(() => ({})); throw new Error(d.fehler || `Fehler ${r.status}`); }
    const leser = r.body.getReader(), dec = new TextDecoder();
    let puffer = '';
    for (;;) {
      const { value, done } = await leser.read();
      if (done) break;
      puffer += dec.decode(value, { stream: true });
      let z;
      while ((z = puffer.indexOf('\n')) >= 0) {
        const zeile = puffer.slice(0, z); puffer = puffer.slice(z + 1);
        if (!zeile.trim()) continue;
        const e = JSON.parse(zeile);
        if (e.t === 'text') { antwort.text += e.d; liveZeichnen(); }
        else if (e.t === 'schritt') { (antwort.schritte ||= []).push(e.d); liveZeichnen(); }
        else if (e.t === 'status') { antwort.status = e.d; liveZeichnen(); }
        else if (e.t === 'video') { (antwort.videos ||= []).push(e.id); liveZeichnen(); toast('Video fertig – liegt in der Bibliothek.', 'ok'); }
        else if (e.t === 'hinweis') toast(e.d);
        else if (e.t === 'fehler') throw new Error(e.d);
        else if (e.t === 'ende') { fertig = e; antwort.gehirn = e.gehirn; if (e.abgebrochen) antwort.abgebrochen = true; }
      }
    }
  } catch (e) {
    if (e.name === 'AbortError') antwort.abgebrochen = true;
    else { fehler(e); if (!antwort.text && !antwort.schritte) C.chat.nachrichten.splice(-2, 2); }
  } finally {
    C.laeuft = false; C.steuerung = null; knopfZustand();
    if (!antwort.text && !antwort.schritte && !antwort.abgebrochen && C.chat.nachrichten.at(-1) === antwort) C.chat.nachrichten.pop();
    if (antwort.videos?.length) bilderLaden().catch(() => {});
    chatZeichnen();
    const eintrag = C.chats.find(c => c.id === C.chat.id);
    if (eintrag && !eintrag.titel) { eintrag.titel = text.slice(0, 60); $('#chatTitel').textContent = eintrag.titel; }
  }
  // Automatisch eintragen: der letzte Vorschlag der Antwort landet im Eingabefeld
  if (fertig && C.auto) {
    const k = kartenAus(antwort.text).map(karteBereinigen).at(-1);
    if (k) { karteEintragen(k); toast('Vorschlag automatisch ins Eingabefeld eingetragen.', 'ok'); }
  }
}
function liveZeichnen() {
  if (zeichnenGeplant) return;
  zeichnenGeplant = true;
  requestAnimationFrame(() => {
    zeichnenGeplant = false;
    const box = $('#chatNachrichten');
    const i = C.chat.nachrichten.length - 1;
    const el = box.querySelector(`.cmsg.assistent[data-n="${i}"]`);
    const unten = box.scrollHeight - box.scrollTop - box.clientHeight < 60;
    const html = nachrichtHtml(C.chat.nachrichten[i], i);
    if (el) el.outerHTML = html; else box.insertAdjacentHTML('beforeend', html);
    box.querySelector(`.cmsg.assistent[data-n="${i}"]`)?.classList.add('schreibt');
    if (unten) box.scrollTop = box.scrollHeight;
  });
}
async function chatAbbrechen() {
  C.steuerung?.abort();
  await api('chat_abbrechen', {}).catch(() => {});
}
function knopfZustand() {
  $('#chatSenden').innerHTML = ico(C.laeuft ? 'x' : 'senden');
  $('#chatSenden').dataset.tip = C.laeuft ? 'Antwort abbrechen' : 'Senden (Enter) – Umschalt+Enter für neue Zeile';
  $('#chatSenden').classList.toggle('stopp', C.laeuft);
}
$('#chatSenden').onclick = () => (C.laeuft ? chatAbbrechen() : chatSenden());
const chatFeldHoehe = () => { const f = $('#chatText'); f.style.height = 'auto'; f.style.height = Math.min(f.scrollHeight, 160) + 'px'; };
$('#chatText').addEventListener('input', chatFeldHoehe);
$('#chatText').addEventListener('keydown', ev => { if (ev.key === 'Enter' && !ev.shiftKey && !ev.isComposing) { ev.preventDefault(); chatSenden(); } });

// Bilder an den Chat hängen (der Assistent sieht sie dann über ein Vision-Modell)
$('#chatAnhang').onclick = () => $('#chatDatei').click();
$('#chatDatei').onchange = async ev => {
  for (const f of [...ev.target.files].slice(0, 6)) {
    if (!f.type.startsWith('image/')) continue;
    try {
      const daten = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(f); });
      const d = await api('upload', { daten, name: f.name });
      C.anhang.push({ id: d.id, url: d.url });
    } catch (e) { fehler(e); }
  }
  ev.target.value = '';
  anhangZeichnen();
};
function anhangZeichnen() {
  $('#chatAnhaenge').innerHTML = C.anhang.map((a, i) => `<div class="ref"><img src="${esc(a.url)}" alt=""><button class="x" data-weg="${i}" aria-label="Entfernen">✕</button></div>`).join('');
  $('#chatAnhaenge').classList.toggle('hidden', !C.anhang.length);
}
$('#chatAnhaenge').addEventListener('click', ev => { const x = ev.target.closest('[data-weg]'); if (x) { C.anhang.splice(+x.dataset.weg, 1); anhangZeichnen(); } });

// ------------------------------------------------------------------ Video-Clone
const KLON = { job: null, timer: null, upload: null };
function klonStartHtml() {
  const w = C.status?.werkzeuge || {};
  const fehlt = [!w.ffmpeg && 'ffmpeg', !w.ffprobe && 'ffprobe'].filter(Boolean);
  const j = KLON.job && KLON.job.chat === C.chat.id ? KLON.job : null;
  const laeuft = j?.status === 'laeuft';
  return `<div class="klon">
    <div class="klon-kopf">${ico('video')}<b>Referenzvideo analysieren</b></div>
    <p>Füge einen Link ein (YouTube, TikTok, Instagram, X/Twitter …) oder lade ein eigenes Video hoch. Ich zerlege es in Szenen,
      ein Vision-Modell beschreibt Aufbau, Schnitt, Kamera, Hook und CTA – daraus bauen wir das Video <b>für deine Marke</b> neu.</p>
    <div class="klon-modell"><span>Analyse-Modell</span>${klonModellKnopf()}</div>
    <input id="klonUrl" type="url" placeholder="https://…" ${laeuft ? 'disabled' : ''} ${w.ytdlp ? '' : 'disabled title="yt-dlp nicht gefunden"'}>
    <div class="klon-zeile">
      <button class="btn klein" id="klonDateiKnopf" ${laeuft ? 'disabled' : ''}>${ico('hochladen')}${KLON.upload ? esc(KLON.upload.name) : 'Eigenes Video hochladen'}</button>
      <button class="btn klein primaer" id="klonStart" ${laeuft || fehlt.length ? 'disabled' : ''}>${ico('zauber')}Analysieren</button>
      <small>≈ 0,01–0,05 $ je Analyse</small>
    </div>
    <input type="file" id="klonDatei" accept="video/mp4,video/quicktime,video/webm" hidden>
    ${fehlt.length ? `<div class="hinweis">${fehlt.join(' und ')} nicht eingerichtet – Einstellungen → Assistent → Werkzeuge einrichten.</div>` : ''}
    ${!w.ytdlp ? '<div class="hinweis">yt-dlp nicht gefunden – Links gehen erst nach Angabe des Pfads, eigene Videos schon jetzt.</div>' : ''}
    ${j ? `<div class="klon-fortschritt ${j.status}">${j.status === 'laeuft' ? `<span class="spin"></span>Schritt ${j.nr}/${j.von}: ${esc(j.schritt)}` : j.status === 'fehler' ? `⚠ ${esc(j.fehler)}` : ''}</div>` : ''}
    <div class="hinweis">Nur Videos verwenden, an denen du Rechte hast oder die zur Analyse öffentlich zugänglich sind. Herunterladen kann den
      Nutzungsbedingungen der Plattform widersprechen. Übernommen wird nur die Form – fremde Marken, Personen und Texte nie.
      Das Quellvideo wird nach der Analyse gelöscht, nur Standbilder und Analyse bleiben.</div>
  </div>`;
}
function klonModellKnopf() {
  const id = C.status?.klon_modell || '';
  const m = katalogListe('vision').find(x => x.id === id);
  return `<button type="button" class="btn klein wahl-klein" id="klonModell" data-tip="Vision-Modell, das die Standbilder des Referenzvideos beschreibt – klicken zum Wechseln">
    <b>${esc(m?.name || id || 'wählen')}</b><small>${esc(m ? kostenText('text', m) : '')}</small>${ico('rechts')}</button>`;
}
function klonUebersicht(k) {
  const a = k.analyse || {};
  return `<div class="klon">
    <div class="klon-kopf">${ico('video')}<b>${esc(k.titel || 'Eigenes Video')}</b><span>${k.dauer?.toFixed?.(1) ?? k.dauer} s · ${k.szenen} Szenen${k.kosten ? ' · ' + geld(k.kosten) : ''}</span></div>
    <div class="klon-bilder">${(k.bilder || []).map((u, i) => `<img src="${esc(u)}" alt="Szene ${i + 1}" data-tip="${esc((a.szenen || [])[i]?.bild || 'Szene ' + (i + 1))}" loading="lazy">`).join('')}</div>
    <dl class="klon-daten">
      ${a.hook ? `<dt>Hook</dt><dd>${esc(a.hook)}</dd>` : ''}${a.stil ? `<dt>Stil</dt><dd>${esc(a.stil)}</dd>` : ''}
      ${a.rhythmus ? `<dt>Rhythmus</dt><dd>${esc(a.rhythmus)}</dd>` : ''}${a.cta ? `<dt>CTA</dt><dd>${esc(a.cta)}</dd>` : ''}
      ${a.fremdmarken?.length ? `<dt>Nicht übernehmen</dt><dd>${esc(a.fremdmarken.join(', '))}</dd>` : ''}
    </dl>
    <div class="klon-zeile">
      ${C.chat.nachrichten.length ? '' : `<button class="btn primaer klein" id="klonBauplan">${ico('zauber')}Klon-Bauplan für meine Marke erstellen</button>`}
      ${HF.offen === C.chat.id ? '' : `<button class="btn klein ${C.chat.nachrichten.length ? 'primaer' : ''}" id="hfAusKlon" data-tip="Den Aufbau dieses Videos als Motion-Graphic mit HyperFrames nachbauen – mit deiner Marke, deinem Logo und deiner Geschichte">${ico('video')}Als HyperFrames-Video bauen</button>`}
    </div>
  </div>`;
}
$('#chatNachrichten').addEventListener('click', async ev => {
  if (ev.target.closest('#klonDateiKnopf')) return $('#klonDatei').click();
  const km = ev.target.closest('#klonModell');
  if (km) {
    if (!S.admin) return toast('Nur Administratoren können das Analyse-Modell ändern.');
    return modellWahl(km, 'vision', C.status?.klon_modell, async m => {
      try {
        await api('einstellungen', { klon_modell: m.id });
        C.status.klon_modell = m.id;
        toast(`Analyse-Modell: ${m.name}`, 'ok');
        chatZeichnen();
      } catch (e) { fehler(e); }
    }, { titel: 'Modelle, die Bilder sehen können' });
  }
  if (ev.target.closest('#klonStart')) return klonStarten().catch(fehler);
  if (ev.target.closest('#hfAusKlon')) { Object.assign(HF, { offen: C.chat.id, quelle: 'klon' }); chatZeichnen(); $('.hf')?.scrollIntoView({ block: 'nearest' }); return; }
  if (ev.target.closest('#klonBauplan')) {
    $('#chatText').value = 'Erstelle aus dieser Analyse einen Klon-Bauplan für meine Marke. Frag mich zuerst nach Marke, Produkt und Ziel, falls du sie noch nicht kennst.';
    return chatSenden();
  }
});
$('#chatNachrichten').addEventListener('change', async ev => {
  if (ev.target.id !== 'klonDatei' || !ev.target.files[0]) return;
  const f = ev.target.files[0];
  if (f.size > 500 * 1024 * 1024) return toast('Das Video ist größer als 500 MB.', 'fehler');
  const knopf = $('#klonDateiKnopf');
  knopf.disabled = true; knopf.textContent = 'Wird hochgeladen …';
  try {
    const r = await fetch('/api/klon/upload', { method: 'POST', body: f,
      headers: { 'X-CSRF': S.csrf, 'Content-Type': f.type || 'video/mp4', 'X-Dateiname': encodeURIComponent(f.name) } });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || !d.ok) throw new Error(d.fehler || `Upload fehlgeschlagen (${r.status})`);
    KLON.upload = { id: d.id, name: f.name };
    $('#klonUrl') && ($('#klonUrl').value = '');
  } catch (e) { fehler(e); }
  chatZeichnen();
});
async function klonStarten(vorlage = '') {
  const url = vorlage ? '' : $('#klonUrl')?.value.trim();
  if (!url && !KLON.upload && !vorlage) return toast('Bitte einen Link einfügen oder ein Video hochladen.');
  const d = await api('klon/start', { chat: C.chat.id, ...(vorlage ? { vorlage } : url ? { url } : { upload: KLON.upload.id }) });
  KLON.job = d.job;
  KLON.upload = null;
  chatZeichnen();
  clearInterval(KLON.timer);
  KLON.timer = setInterval(async () => {
    try { KLON.job = (await api('klon/status?id=' + KLON.job.id)).job; } catch { return; }
    if (KLON.job.status !== 'laeuft') {
      clearInterval(KLON.timer);
      if (KLON.job.status === 'fertig') {
        toast('Analyse fertig.', 'ok');
        if (C.chat?.id === KLON.job.chat) await chatOeffnen(C.chat.id);
        C.chats = (await api('chats')).chats;
        kontoLaden();
        return;
      }
    }
    if (C.chat?.id === KLON.job.chat && !C.chat.klon) chatZeichnen();
  }, 1500);
}

// „Mit Assistent verbessern“ am Eingabefeld
$('#btnVerbessern').onclick = () => {
  const text = pr.value.trim();
  chatUmschalten(true);
  if (S.modus === 'audio') {
    const name = aktAModell()?.name || 'das gewählte Sprachmodell';
    $('#chatText').value = text
      ? `Verbessere diesen Sprechertext für die Sprachausgabe mit ${name} und schlage 2 Varianten vor:\n${text}`
      : `Hilf mir, einen Sprechertext für die Sprachausgabe mit ${name} zu schreiben. Frag mich kurz nach Zweck, Länge und Ton.`;
  } else {
    const art = S.modus === 'video' ? 'Video' : 'Bild';
    $('#chatText').value = text
      ? `Verbessere diesen ${art}-Prompt für ${S.modus === 'video' ? aktVModell()?.name : aktModell()?.name} und schlage 2 Varianten vor:\n${text}`
      : `Hilf mir, einen ${art}-Prompt zu schreiben. Frag mich kurz nach der Idee.`;
  }
  chatFeldHoehe();
  setTimeout(() => chatSenden(), 50);
};


// ------------------------------------------------------------------ HyperFrames (Onboarding → Projekt → Assistent baut + rendert)
const HF_QUELLEN = { klon: ['Video-Link klonen', 'link'], produkt: ['Produkt', 'bilder'], webseite: ['Webseite', 'globus'], idee: ['Freie Idee', 'zauber'] };
const HF_FORMATE = { '16:9': 'Quer', '9:16': 'Hoch', '1:1': 'Quadrat' };

async function hfOeffnen() {
  if (!C.chat) await chatStart();
  if (C.chat.modus !== 'hyperframes') {
    if (!C.chat.nachrichten.length && !C.chat.klon) C.chat = (await api('chat/' + C.chat.id, { modus: 'hyperframes' })).chat;
    else await chatNeu('hyperframes');
    await chatOeffnen(C.chat.id);
  }
  HF.offen = C.chat.id;
  chatZeichnen();
}

function hfSchritteHtml(n) {
  const s = n.schritte || [];
  if (!s.length) return '';
  const laeuft = C.laeuft && n === C.chat.nachrichten.at(-1);
  const status = n.status ? `<div class="cstatus">${esc(n.status)}</div>` : '';   // Runde · laufende Kosten · Cache
  return `${status}<details class="cschritte" ${laeuft ? 'open' : ''}><summary>${laeuft ? '<span class="spin"></span>' : ico('haken')}${s.length} Arbeitsschritt${s.length === 1 ? '' : 'e'}${laeuft ? ' · ' + esc(s.at(-1)) : ''}</summary>
    <ol>${s.map(z => `<li class="${z.startsWith('⚠') ? 'warn' : ''}">${esc(z)}</li>`).join('')}</ol></details>`;
}

function hfOnboardingHtml(ausKlon) {
  const quelle = ausKlon ? 'klon' : HF.quelle;
  const hf = C.status?.hyperframes || {};
  const j = HF.job && HF.job.chat === C.chat.id ? HF.job : null;
  const aus = HF.laeuft ? 'disabled' : '';
  const feld = (k, label, ph, zeilen = 0) => `<label class="hf-feld"><span>${label}</span>${zeilen
    ? `<textarea data-hf="${k}" rows="${zeilen}" placeholder="${esc(ph)}" maxlength="3000" ${aus}>${esc(HF[k])}</textarea>`
    : `<input data-hf="${k}" type="${k === 'webseite' || k === 'videoUrl' ? 'url' : 'text'}" placeholder="${esc(ph)}" maxlength="${k === 'titel' ? 120 : 2000}" value="${esc(HF[k])}" ${aus}>`}</label>`;
  const bild = (k, label) => `<div class="hf-bild">${HF[k] ? `<img src="${esc(HF[k].url)}" alt=""><button class="x" data-hfweg="${k}" aria-label="Entfernen" ${aus}>✕</button>` : ''}
    <button class="btn klein" data-hfbild="${k}" ${aus}>${ico('hochladen')}${HF[k] ? 'Anderes Bild' : label}</button></div>`;
  return `<div class="klon hf">
    <div class="klon-kopf">${ico('video')}<b>${ausKlon ? 'HyperFrames-Video aus diesem Clone' : 'HyperFrames-Video'}</b><span>Motion-Graphic · 5–30 s</span></div>
    <p>${ausKlon ? 'Aufbau, Rhythmus, Hook und CTA des analysierten Videos – neu gebaut mit deiner Marke und Geschichte.'
      : 'Ich frage kurz, worum es geht, baue das Video als HTML-Komposition, prüfe es und rendere eine MP4 in deine Bibliothek.'}</p>
    ${hf.node === false ? '<div class="hinweis">Node.js nicht gefunden – HyperFrames braucht Node.js 22 oder neuer.</div>' : ''}
    ${ausKlon ? '' : `<div class="hf-titel">1 · Ausgangspunkt</div>
    <div class="hf-wahl" data-hfgruppe="quelle">${Object.entries(HF_QUELLEN).map(([k, [t, i]]) =>
      `<button data-hfwert="${k}" class="${quelle === k ? 'an' : ''}" ${aus}>${ico(i)}${t}</button>`).join('')}</div>
    ${quelle === 'klon' ? (C.chat.klon?.analyse ? `<div class="hinweis">Analyse vorhanden: ${esc(C.chat.klon.titel || 'Referenzvideo')}</div>`
      : feld('videoUrl', 'Link zum Referenzvideo (YouTube, TikTok, Instagram …)', 'https://…') +
        '<div class="hinweis">Das Video wird per Reverse Engineering zerlegt (Szenen, Schnitt, Hook, CTA). Übernommen wird nur die Form – nie fremde Marken, Personen oder Texte. Eigene Videodateien gehen über den Reiter Video-Clone.</div>') : ''}
    ${quelle === 'produkt' ? bild('produktbild', 'Produktbild hochladen') + feld('produkt', 'Produktbeschreibung', 'Was ist es, was kann es, für wen?', 3) : ''}
    ${quelle === 'idee' ? feld('idee', 'Deine Idee', 'z. B. Animierter Titel „Sommer-Sale 30 %“ mit Gold-Funken', 3) : ''}`}
    ${feld('webseite', quelle === 'webseite' ? 'Link zur Webseite – Texte, Farben, Schrift und Logo werden dort geholt' : 'Webseite für Texte und Marke (optional)', 'https://…')}
    <div class="hf-titel">2 · Länge und Format</div>
    <div class="hf-laenge"><input type="range" min="5" max="30" step="1" value="${HF.laenge}" data-hf="laenge" ${aus} ${HF.audio && HF.audioGanz ? 'disabled' : ''}><b>${HF.audio && HF.audioGanz ? 'wie Audio' : HF.laenge + ' s'}</b></div>
    <div class="hf-wahl" data-hfgruppe="format">${Object.entries(HF_FORMATE).map(([k, t]) =>
      `<button data-hfwert="${k}" class="${HF.format === k ? 'an' : ''}" ${aus}>${k} <small>${t}</small></button>`).join('')}</div>
    <div class="hf-titel">3 · Ton (optional) – Bilder und Übergänge folgen Takt und Wort</div>
    ${hfAudioHtml(aus, hf)}
    <div class="hf-titel">4 · Marke</div>
    ${bild('logo', 'Logo hinzufügen (optional)')}
    ${feld('titel', 'Kernbotschaft oder Titel (optional)', 'Die eine Aussage, die hängen bleiben soll')}
    ${feld('marke', 'Brand-Guideline (optional)', 'Farben, Schriften, Tonalität, No-Gos …', 2)}
    ${feld('story', 'Storytelling (optional)', 'Problem → Lösung → Aufruf, Zielgruppe, Stimmung …', 2)}
    ${j?.status === 'laeuft' ? `<div class="klon-fortschritt laeuft"><span class="spin"></span>Analyse ${j.nr}/${j.von}: ${esc(j.schritt)}</div>`
      : j?.status === 'fehler' ? `<div class="klon-fortschritt fehler">⚠ ${esc(j.fehler)}</div>` : ''}
    <div class="klon-zeile">
      <button class="btn primaer klein" id="hfBauen" ${aus}>${HF.laeuft ? '<span class="spin"></span>' + esc(HF.laeuft) : ico('funke') + 'Video bauen'}</button>
      ${ausKlon || C.chat.nachrichten.length ? `<button class="btn klein" id="hfZu" ${aus}>Abbrechen</button>` : ''}
      <small>Rendern kostet nichts; nur das Sprachmodell (Abo bzw. OpenRouter).</small>
    </div>
  </div>`;
}

function hfAudioHtml(aus, hf) {
  if (!HF.audio) return `<div class="klon-zeile">
      <button class="btn klein" data-hfaudiowahl ${aus}>${ico('ton')}Aus Uploads › ${esc(hf.musik || 'musik')} wählen</button>
      <button class="btn klein" data-hfaudioup ${aus}>${ico('hochladen')}Audio hochladen</button></div>
    <small class="hf-klein">Voice-Over, Song oder Musik (mp3, wav, m4a …). Hochgeladenes landet in Uploads › ${esc(hf.musik || 'musik')}.</small>`;
  const arten = { de: 'Gesang/Sprache Deutsch', en: 'Gesang/Sprache Englisch', takt: 'Nur Takt' };
  return `<div class="hf-audio">${ico('ton')}<b>${esc(HF.audio.name)}</b><button class="x" data-hfaudioweg aria-label="Audio entfernen" ${aus}>✕</button></div>
    <div class="hf-wahl" data-hfgruppe="audioArt">${Object.entries(arten).map(([k, t]) =>
      `<button data-hfwert="${k}" class="${HF.audioArt === k ? 'an' : ''}" ${aus}>${t}</button>`).join('')}</div>
    ${HF.audioArt !== 'takt' && hf.whisper === false ? '<div class="hinweis">whisper ist nicht eingerichtet – es gibt nur den Takt, keine Wortzeiten (Einstellungen → Assistent → Werkzeuge einrichten).</div>' : ''}
    <div class="klon-zeile hf-audiozeile">
      <label class="hf-feld"><span>Ab Sekunde</span><input data-hf="audioAb" type="number" min="0" step="0.5" value="${esc(HF.audioAb)}" ${aus}></label>
      <label class="auto"><input type="checkbox" data-hf="audioGanz" ${HF.audioGanz ? 'checked' : ''} ${aus}> Länge = Audio (bis 120 s)</label>
    </div>
    <small class="hf-klein">${HF.audioArt === 'takt' ? 'Schnitte und Übergänge landen auf den Schlägen.' : 'Takt für Schnitte, dazu Wortzeiten: Texte und Bildwechsel laufen synchron zu Gesang bzw. Sprache.'}</small>`;
}

const hfWert = el => el.type === 'checkbox' ? el.checked : el.dataset.hf === 'laenge' ? +el.value : el.value;
function hfFelderMerken() {
  for (const el of $$('[data-hf]', $('#chatNachrichten'))) HF[el.dataset.hf] = hfWert(el);
}
async function hfAudioWaehlen(anker) {
  const ordner = C.status?.hyperframes?.musik || 'musik';
  const alle = (await api('uploads?typ=audio')).uploads;
  const musik = alle.filter(u => u.ordner.toLowerCase() === ordner.toLowerCase());
  const andere = alle.filter(u => u.ordner.toLowerCase() !== ordner.toLowerCase());
  const punkt = u => ({ ico: 'ton', txt: u.name, klein: u.ordner || 'ohne Ordner', fn: () => { HF.audio = { id: u.id, name: u.dateiname }; chatZeichnen(); } });
  menue(anker, [{ kopf: `Uploads › ${ordner}` }, ...(musik.length ? musik.map(punkt) : [{ txt: 'Noch nichts in diesem Ordner', aus: true }]),
    ...(andere.length ? ['-', { kopf: 'Weitere Audios' }, ...andere.slice(0, 20).map(punkt)] : [])], { seite: 'unten' });
}
function hfAudioHochladen() {
  const ordner = C.status?.hyperframes?.musik || 'musik';
  const inp = Object.assign(document.createElement('input'), { type: 'file', accept: 'audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac' });
  inp.onchange = async () => {
    const f = inp.files[0];
    if (!f) return;
    if (f.size > 500 * 1024 * 1024) return toast('Die Datei ist größer als 500 MB.', 'fehler');
    HF.laeuft = 'Audio wird hochgeladen …'; chatZeichnen();
    try {
      const r = await fetch('/api/uploads/datei?ordner=' + encodeURIComponent(ordner), { method: 'POST', body: f,
        headers: { 'X-CSRF': S.csrf, 'Content-Type': f.type || 'application/octet-stream', 'X-Dateiname': encodeURIComponent(f.name) } });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.ok) throw new Error(d.fehler || `Upload fehlgeschlagen (${r.status})`);
      HF.audio = { id: d.upload.id, name: d.upload.dateiname };
    } catch (e) { fehler(e); }
    HF.laeuft = ''; chatZeichnen();
  };
  inp.click();
}
$('#chatNachrichten').addEventListener('input', ev => {
  const el = ev.target.closest('[data-hf]');
  if (!el) return;
  HF[el.dataset.hf] = hfWert(el);
  if (el.dataset.hf === 'laenge') el.nextElementSibling.textContent = `${el.value} s`;
  if (el.dataset.hf === 'audioGanz') chatZeichnen();
});
$('#chatNachrichten').addEventListener('click', async ev => {
  const w = ev.target.closest('[data-hfwert]');
  if (w) { hfFelderMerken(); HF[w.closest('[data-hfgruppe]').dataset.hfgruppe] = w.dataset.hfwert; return chatZeichnen(); }
  const weg = ev.target.closest('[data-hfweg]');
  if (weg) { hfFelderMerken(); HF[weg.dataset.hfweg] = null; return chatZeichnen(); }
  const b = ev.target.closest('[data-hfbild]');
  if (b) {
    hfFelderMerken();
    const inp = Object.assign(document.createElement('input'), { type: 'file', accept: 'image/png,image/jpeg,image/webp' });
    inp.onchange = async () => {
      const f = inp.files[0];
      if (!f) return;
      try {
        const daten = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(f); });
        const d = await api('upload', { daten, name: f.name });
        HF[b.dataset.hfbild] = { id: d.id, url: d.url };
        chatZeichnen();
      } catch (e) { fehler(e); }
    };
    return inp.click();
  }
  const aw = ev.target.closest('[data-hfaudiowahl]');
  if (aw) { hfFelderMerken(); return hfAudioWaehlen(aw).catch(fehler); }
  if (ev.target.closest('[data-hfaudioup]')) { hfFelderMerken(); return hfAudioHochladen(); }
  if (ev.target.closest('[data-hfaudioweg]')) { hfFelderMerken(); HF.audio = null; return chatZeichnen(); }
  if (ev.target.closest('#hfZu')) { HF.offen = ''; return chatZeichnen(); }
  if (ev.target.closest('#hfBauen')) { hfFelderMerken(); return hfBauen().catch(e => { HF.laeuft = ''; chatZeichnen(); fehler(e); }); }
});

async function hfBauen() {
  if (C.laeuft || HF.laeuft) return;
  const ausKlon = C.chat.modus === 'klon';
  const quelle = ausKlon ? 'klon' : HF.quelle;
  const chatId = C.chat.id;
  if (quelle === 'klon' && !C.chat.klon?.analyse) {             // erst das Referenzvideo zerlegen
    if (!HF.videoUrl.trim()) return toast('Bitte den Link zum Referenzvideo einfügen.');
    HF.laeuft = 'Video wird analysiert …'; chatZeichnen();
    HF.job = (await api('klon/start', { chat: chatId, url: HF.videoUrl.trim() })).job;
    while (HF.job.status === 'laeuft') {
      await new Promise(r => setTimeout(r, 1500));
      try { HF.job = (await api('klon/status?id=' + HF.job.id)).job; } catch { /* nächster Takt */ }
      if (C.chat?.id === chatId) chatZeichnen();
    }
    if (HF.job.status !== 'fertig') throw new Error(HF.job.fehler || 'Analyse fehlgeschlagen.');
    C.chat = (await api('chat/' + chatId)).chat;
    kontoLaden();
  }
  HF.laeuft = HF.audio ? 'Projekt, Takt und Wortzeiten werden vorbereitet …' : 'Projekt wird angelegt …'; chatZeichnen();
  const d = await api('hyperframes/start', { chat: chatId, quelle, laenge: HF.laenge, format: HF.format, logo: HF.logo?.id || '',
    produktbild: quelle === 'produkt' ? HF.produktbild?.id || '' : '', webseite: HF.webseite.trim(), titel: HF.titel, marke: HF.marke,
    story: HF.story, produkt: quelle === 'produkt' ? HF.produkt : '', idee: quelle === 'idee' ? HF.idee : '',
    ...(HF.audio ? { audio: HF.audio.id, audio_art: HF.audioArt, audio_ab: +HF.audioAb || 0, audio_ganz: !!HF.audioGanz } : {}) });
  for (const h of d.audio?.hinweise || []) toast(h);
  HF.laeuft = ''; HF.offen = ''; HF.job = null;
  if (C.chat?.id !== chatId) return;
  C.chat = (await api('chat/' + chatId)).chat;
  $('#chatTitel').textContent = C.chat.titel || 'HyperFrames';
  C.chats = (await api('chats')).chats;
  $('#chatText').value = d.auftrag;
  await chatSenden();
}
