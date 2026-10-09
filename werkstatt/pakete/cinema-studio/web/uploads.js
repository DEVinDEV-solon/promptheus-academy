/* Bibliothek › Uploads – eigene Dateien jeder Art (Bilder, Videos, Audio, Texte, Vorlagen …) */
'use strict';

// Liegen in <Ablage>\uploads und eigenen Ordnern darin. Was im Explorer hineingelegt wird, erscheint beim
// nächsten Öffnen – der Server gleicht den Ordner ab. Bilder (PNG, JPEG, WebP, GIF bis 12 MB) lassen sich
// direkt als Referenzbild, Startbild, Endbild oder Vorlage verwenden (⋯ an der Karte oder +-Menü → Uploads).
// Zustand UP und istUploadAnsicht() stehen in app.js, weil Menü und Ansichten sie schon beim Start brauchen.
I.datei = P('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>');
const UP_ARTEN = [['', 'Alle'], ['bild', 'Bilder'], ['video', 'Videos'], ['audio', 'Audio'], ['text', 'Texte'], ['datei', 'Sonstige']];
const UP_TYPNAME = { bild: 'Bild', video: 'Video', audio: 'Audio', text: 'Text', datei: 'Datei' };
const UP_MAX = 500 * 1024 * 1024;
const uploadOrdnerAus = a => (a || '').startsWith('uploads:') ? a.slice(8) : '';
const groesseText = n => n >= 1048576 ? `${(n / 1048576).toLocaleString('de-DE', { maximumFractionDigits: 1 })} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;

function upUebernehmen(d) {
  UP.ordner = d.ordner || UP.ordner; UP.pfad = d.pfad || UP.pfad;
  if (d.gesamt != null) UP.gesamt = d.gesamt;
}
async function uploadsOrdnerLaden() {
  try { upUebernehmen(await api('uploads?typ=_')); } catch { /* Menü bleibt, wie es war */ }
  railBauen();
}
async function uploadsLaden() {
  const a = S.ansicht;
  const q = new URLSearchParams({ ordner: uploadOrdnerAus(a) || '*' });
  if (UP.art) q.set('typ', UP.art);
  if (S.suche) q.set('q', S.suche);
  try { const d = await api('uploads?' + q); upUebernehmen(d); UP.liste = d.uploads; } catch (e) { fehler(e); UP.liste = []; }
  if (S.ansicht !== a) return;
  railBauen();
  uploadsZeichnen();
}

function uploadKarteHtml(u) {
  const knoepfe = `<div class="aktionen">
      <button class="rund" data-ua="dl" data-tip="Herunterladen" aria-label="Herunterladen">${ico('download')}</button>
      <button class="rund" data-ua="mehr" data-tip="Weitere Aktionen – auch als Referenz, Startbild oder Vorlage verwenden" aria-label="Weitere Aktionen" aria-haspopup="menu">${ico('mehr')}</button>
    </div>`;
  const info = [u.ordner, UP_TYPNAME[u.typ], groesseText(u.groesse), u.nutzbar ? 'als Referenz nutzbar' : ''].filter(Boolean).join(' · ');
  const fuss = `<div class="fuss"><p>${esc(u.dateiname)}</p><small>${esc(info)}</small></div>`;
  if (u.typ === 'audio') {
    return `<div class="karte up-karte ist-audio" data-uid="${u.id}" style="--ar:2.2">
      <div class="audio-flaeche">
        <button class="audio-spiel" data-ua="spiel" data-tip="Abspielen" aria-label="Abspielen">${ico('play')}</button>
        <div class="audio-welle">${Array.from({ length: 28 }, (_, i) => `<i style="height:${20 + ((i * 37 + u.id.charCodeAt(i % u.id.length)) % 70)}%"></i>`).join('')}</div>
        <p>${esc(u.dateiname)}</p><small>${esc(info)}</small>
      </div>${knoepfe}</div>`;
  }
  if (u.typ === 'bild' || u.typ === 'video') {
    const v = u.typ === 'video';
    const ar = !v && u.breite && u.hoehe ? (u.breite / u.hoehe).toFixed(4) : v ? '1.7778' : '1';
    const medium = v
      ? `<video src="${u.url}#t=0.1" muted loop playsinline preload="metadata" aria-label="${esc(u.name)}"></video><span class="laenge">${ico('play')}Video</span>`
      : `<img src="${u.url}" alt="${esc(u.name)}" loading="lazy">`;
    return `<div class="karte up-karte${v ? ' ist-video' : ''}" data-uid="${u.id}" style="--ar:${ar}">${medium}${knoepfe}${fuss}</div>`;
  }
  const endung = (u.dateiname.match(/\.([^.]+)$/)?.[1] || u.typ).toUpperCase().slice(0, 6);
  return `<div class="karte up-karte up-datei" data-uid="${u.id}" style="--ar:1.25">
    <div class="up-flaeche"><span class="up-symbol">${ico(u.typ === 'text' ? 'text' : 'datei')}</span><b>${esc(endung)}</b><p>${esc(u.dateiname)}</p></div>
    ${knoepfe}${fuss}</div>`;
}

function uploadsZeichnen() {
  const wand = $('#wand');
  const akt = uploadOrdnerAus(S.ansicht);
  const n = UP.liste.length;
  $('#viewCount').textContent = n ? `${zahl(n)} Datei${n === 1 ? '' : 'en'}` : '';
  const chip = (attr, wert, txt, an, tip = '') => `<button ${attr}="${esc(wert)}" class="${an ? 'an' : ''}"${tip ? ` data-tip="${esc(tip)}"` : ''}>${txt}</button>`;
  let html = `<div class="up-kopf">
    <div class="up-reihe">
      <button class="btn primaer" data-up="hochladen" data-tip="Dateien jeder Art: Bilder, Videos, Audio, Texte, Vorlagen – bis 500 MB je Datei. Auch per Ziehen auf diese Fläche.">${ico('hochladen')} Dateien hochladen …</button>
      <button class="btn" data-up="ordner-neu" data-tip="Einen eigenen Ordner in Uploads anlegen">${ico('ordnerPlus')} Neuer Ordner</button>
      <button class="btn" data-up="explorer" data-tip="${esc(akt ? `Ordner „${akt}“` : 'Den Uploads-Ordner')} im Windows-Explorer öffnen – dort hineingelegte Dateien erscheinen hier">${ico('ordnerAuf')} Im Explorer öffnen</button>
    </div>
    <div class="up-reihe up-chips"><span class="up-lbl">Ordner</span>
      ${chip('data-up-ordner', '*', `Alle${UP.gesamt != null ? ` <small>${UP.gesamt}</small>` : ''}`, !akt)}
      ${UP.ordner.map(o => chip('data-up-ordner', o.name, `${ico('ordner')} ${esc(o.name)} <small>${o.anzahl}</small>`, akt === o.name, 'Rechtsklick im Menü links: umbenennen, im Explorer zeigen, auflösen')).join('')}
    </div>
    <div class="up-reihe up-chips"><span class="up-lbl">Art</span>
      ${UP_ARTEN.map(([k, t]) => chip('data-up-art', k, t, UP.art === k)).join('')}
    </div>
    <p class="up-hinweis">Ordner: <code>${esc(UP.pfad + (akt ? '\\' + akt : ''))}</code> · Was du dort im Explorer hineinlegst, erscheint hier beim nächsten Öffnen.
      Bilder lassen sich über ⋯ oder im +-Menü (→ „Aus Uploads“) als Referenz, Startbild, Endbild oder Vorlage verwenden.</p>
  </div>`;
  if (!n) {
    html += `<div class="leer"><div class="gross">${ico('hochladen')}</div><h3>${S.suche ? 'Keine Treffer' : akt ? `Ordner „${esc(akt)}“ ist leer` : 'Noch keine Uploads'}</h3>
      <p>${S.suche ? 'Versuche einen anderen Suchbegriff.' : 'Dateien hierher ziehen, oben auf „Dateien hochladen“ klicken oder im Explorer in den Ordner legen.'}</p></div>`;
  } else {
    let tag = '', offen = false;
    for (const u of UP.liste) {
      const t = tagName(u.erstellt);
      if (t !== tag) { if (offen) html += '</div>'; html += `<div class="tag-kopf">${esc(t)}</div><div class="raster">`; tag = t; offen = true; }
      html += uploadKarteHtml(u);
    }
    if (offen) html += '</div>';
  }
  wand.innerHTML = html;
}

// ---- Hochladen (Rohdaten, behält den Dateinamen)
async function uploadsHochladen(files, ordner = '') {
  let n = 0;
  for (const f of files) {
    if (!f.size) { toast(`${f.name}: leer oder ein Ordner – bitte Dateien wählen.`, 'fehler'); continue; }
    if (f.size > UP_MAX) { toast(`${f.name}: größer als 500 MB.`, 'fehler'); continue; }
    if (f.size > 20 * 1024 * 1024) toast(`Lade ${f.name} hoch (${groesseText(f.size)}) …`);
    try {
      const r = await fetch('/api/uploads/datei?ordner=' + encodeURIComponent(ordner), { method: 'POST', body: f,
        headers: { 'X-CSRF': S.csrf, 'Content-Type': 'application/octet-stream', 'X-Dateiname': encodeURIComponent(f.name) } });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || d.ok === false) throw new Error(`${f.name}: ${d.fehler || 'Fehler ' + r.status}`);
      n++;
    } catch (e) { fehler(e); }
  }
  if (n) toast(`${n} Datei${n === 1 ? '' : 'en'} hochgeladen${ordner ? ` nach „${ordner}“` : ''}.`, 'ok');
  if (istUploadAnsicht(S.ansicht)) await uploadsLaden(); else await uploadsOrdnerLaden();
}
function uploadDialog(ordner = '') {
  const i = document.createElement('input');
  i.type = 'file'; i.multiple = true;
  i.onchange = () => uploadsHochladen([...i.files], ordner);
  i.click();
}
async function uploadOrdnerNeu() {
  const n = await eingabe('Neuer Ordner in Uploads', 'Name', '', 'Anlegen');
  if (!n) return '';
  const d = await api('uploads/ordner', { name: n });
  upUebernehmen(d);
  if (!S.bibOffen) { S.bibOffen = true; speicher.setz('bibOffen', true); }
  toast(`Ordner „${d.name}“ angelegt.`, 'ok');
  await ansicht('uploads:' + d.name);
  return d.name;
}
function uploadOrdnerMenue(anker, name) {
  menue(anker, [
    { ico: 'hochladen', txt: 'Dateien hochladen …', fn: () => uploadDialog(name) },
    { ico: 'text', txt: 'Umbenennen', fn: async () => {
      const n = await eingabe('Upload-Ordner umbenennen', 'Name', name);
      if (!n || n === name) return;
      const d = await api('uploads/ordner', { name, neu: n }); upUebernehmen(d);
      if (S.ansicht === 'uploads:' + name) await ansicht('uploads:' + d.name); else railBauen();
    } },
    { ico: 'ordnerAuf', txt: 'Im Explorer zeigen', fn: () => api('uploads/ordner', { name, zeigen: true }) },
    '-',
    { ico: 'muell', txt: 'Ordner auflösen', gefahr: true, klein: 'Dateien bleiben, liegen dann direkt in Uploads', fn: async () => {
      if (!await bestaetigen('Ordner auflösen?', `„${name}“ wird entfernt. Die Dateien darin bleiben erhalten und liegen danach direkt in Uploads.`, 'Auflösen', true)) return;
      const d = await api('uploads/ordner', { name, loeschen: true }); upUebernehmen(d);
      if (istUploadAnsicht(S.ansicht)) await ansicht('uploads'); else railBauen();
    } },
  ], { seite: 'rechts' });
}

// ---- Einzelne Datei
function uploadOeffnen(u) {
  if (u.typ === 'bild') return bildZeigen(u.url, u.dateiname, { herkunft: 'Aus „Uploads“' + (u.ordner ? ' · ' + u.ordner : '') });
  if (u.typ === 'video') return bildZeigen(u.url, u.dateiname, { video: true, herkunft: 'Aus „Uploads“' + (u.ordner ? ' · ' + u.ordner : '') });
  if (u.typ === 'audio') return uploadSpielen(u, document.querySelector(`.karte[data-uid="${u.id}"] .audio-spiel`));
  window.open(u.url, '_blank', 'noopener');
}
function uploadSpielen(u, knopf) {
  if (TON.el && TON.el.dataset?.uid === u.id && !TON.el.paused) { tonStopp(); if (knopf) knopf.innerHTML = ico('play'); return; }
  $$('.audio-spiel').forEach(x => { x.innerHTML = ico('play'); });
  const t = tonSpielen(u.url, null);
  t.dataset.uid = u.id;
  if (knopf) { knopf.innerHTML = ico('pause'); t.onended = () => { knopf.innerHTML = ico('play'); }; }
}
function uploadHerunterladen(u) {
  const a = document.createElement('a');
  a.href = u.url + '?dl=1'; a.download = u.dateiname;
  document.body.appendChild(a); a.click(); a.remove();
}
async function uploadAktion(u, daten, meldung) {
  await api('upload/' + u.id, daten);
  if (meldung) toast(meldung, 'ok');
  await uploadsLaden();
}
// Als Referenzbild (Bild-Modus) oder Startbild/Endbild/Vorlage (Video-Modus) ins Eingabefeld übernehmen
function uploadVerwenden(u, ziel) {
  const bild = { id: u.id, url: u.url };
  if (ziel === 'refs') {
    if (S.modus !== 'bild') modusSetzen('bild');
    if (!S.gen.refs.some(r => r.id === u.id)) S.gen.refs.push(bild);
    genAktualisieren();
    toast('Als Referenzbild angehängt – beim Erzeugen wird es mitgeschickt.', 'ok');
  } else {
    if (S.modus !== 'video') modusSetzen('video');
    if (!vRolleMoeglich(ziel, aktVModell())) return toast(`${V_ROLLEN[ziel].wort}: Das gewählte Videomodell nimmt das nicht – bitte ein anderes Modell wählen.`, 'fehler');
    vBildSetzen(ziel, bild);
    videoAktualisieren();
    toast(`„${u.dateiname}“ ist jetzt ${ziel === 'vorlage' ? 'eine Vorlage (@Bild ' + S.vgen.vorlagen.length + ')' : 'das ' + V_ROLLEN[ziel].wort}.`, 'ok');
  }
  pr.focus();
}
async function uploadTextEinfuegen(u) {
  const t = await (await fetch(u.url)).text();
  pr.value = (pr.value.trim() ? pr.value.trimEnd() + '\n\n' : '') + t.slice(0, 4000);
  promptHoehe(); speicher.setz('prompt', pr.value); schaetzen(); pr.focus();
  toast(t.length > 4000 ? 'Text übernommen (auf 4.000 Zeichen gekürzt).' : 'Text in die Beschreibung übernommen.', 'ok');
}
function uploadMenue(anker, u) {
  const e = [{ ico: 'oeffnen', txt: 'Öffnen', fn: () => uploadOeffnen(u) }];
  if (u.nutzbar) {
    e.push('-', { kopf: 'Verwenden' },
      { ico: 'bilder', txt: 'Als Referenzbild', klein: 'Bild erzeugen: wird mitgeschickt', fn: () => uploadVerwenden(u, 'refs') },
      { ico: 'animieren', txt: 'Als Startbild', klein: 'Video beginnt genau mit diesem Bild', fn: () => uploadVerwenden(u, 'start') },
      { ico: 'fortsetzen', txt: 'Als Endbild', klein: 'Video endet genau mit diesem Bild', fn: () => uploadVerwenden(u, 'ende') },
      { ico: 'profil', txt: 'Als Vorlage (@Bild)', klein: 'Grundlage für Figur und Stil – kein Startbild', fn: () => uploadVerwenden(u, 'vorlage') });
  } else if (u.typ === 'bild') {
    e.push({ txt: 'Nicht als Referenz nutzbar', klein: 'Nur PNG, JPEG, WebP oder GIF bis 12 MB', aus: true });
  }
  if (u.typ === 'text' && /^text\//.test(u.mime)) e.push({ ico: 'text', txt: 'In die Beschreibung übernehmen', klein: 'Text ins Eingabefeld einfügen', fn: () => uploadTextEinfuegen(u) });
  e.push('-',
    { ico: 'ordner', txt: 'In Ordner verschieben', sub: () => [
      ...UP.ordner.filter(o => o.name !== u.ordner).map(o => ({ ico: 'ordner', txt: o.name, fn: () => uploadAktion(u, { aktion: 'ordner', ordner: o.name }, `Nach „${o.name}“ verschoben.`) })),
      ...(u.ordner ? [{ ico: 'ordner', txt: 'Ohne Ordner', klein: 'direkt in Uploads', fn: () => uploadAktion(u, { aktion: 'ordner', ordner: '' }, 'Nach Uploads verschoben.') }] : []),
      '-',
      { ico: 'ordnerPlus', txt: 'Neuer Ordner …', fn: async () => {
        const n = await eingabe('Neuer Ordner in Uploads', 'Name', '', 'Anlegen und verschieben');
        if (n) await uploadAktion(u, { aktion: 'ordner', ordner: n, anlegen: true }, `Nach „${n}“ verschoben.`);
      } }] },
    { ico: 'text', txt: 'Umbenennen …', fn: async () => {
      const n = await eingabe('Datei umbenennen', 'Name (Endung bleibt)', u.name);
      if (n && n !== u.name) await uploadAktion(u, { aktion: 'umbenennen', name: n }, 'Umbenannt.');
    } },
    { ico: 'ordnerAuf', txt: 'Im Explorer zeigen', fn: () => api('upload/' + u.id, { aktion: 'zeigen' }) },
    { ico: 'link', txt: 'Lokalen Link kopieren', klein: 'Nur auf diesem Rechner', fn: () => textKopieren(location.origin + u.url, 'Link kopiert.') },
    '-',
    { ico: 'muell', txt: 'Löschen', gefahr: true, klein: 'Wandert nach uploads\\_papierkorb', fn: async () => {
      if (!await bestaetigen('Datei löschen?', `„${u.dateiname}“ wird nach uploads\\_papierkorb verschoben und verschwindet aus der Bibliothek. Endgültig löschen kannst du sie dort im Explorer.`, 'Löschen', true)) return;
      await uploadAktion(u, { aktion: 'loeschen' }, 'Gelöscht – liegt in uploads\\_papierkorb.');
    } });
  menue(anker, e);
}

// ---- Ereignisse auf der Wand (nur in der Uploads-Ansicht)
$('#wand').addEventListener('click', async ev => {
  if (!istUploadAnsicht(S.ansicht)) return;
  try {
    const k = ev.target.closest('[data-up]');
    if (k) {
      const akt = uploadOrdnerAus(S.ansicht);
      if (k.dataset.up === 'hochladen') return uploadDialog(akt);
      if (k.dataset.up === 'ordner-neu') return await uploadOrdnerNeu();
      if (k.dataset.up === 'explorer') return await api('uploads/ordner', { name: akt, zeigen: true });
    }
    const o = ev.target.closest('[data-up-ordner]');
    if (o) return await ansicht(o.dataset.upOrdner === '*' ? 'uploads' : 'uploads:' + o.dataset.upOrdner);
    const art = ev.target.closest('[data-up-art]');
    if (art) { UP.art = art.dataset.upArt; return await uploadsLaden(); }
    const karte = ev.target.closest('.karte[data-uid]');
    const u = karte && UP.liste.find(x => x.id === karte.dataset.uid);
    if (!u) return;
    const a = ev.target.closest('[data-ua]');
    if (a?.dataset.ua === 'dl') return uploadHerunterladen(u);
    if (a?.dataset.ua === 'mehr') return uploadMenue(a, u);
    if (a?.dataset.ua === 'spiel') return uploadSpielen(u, a);
    uploadOeffnen(u);
  } catch (e) { fehler(e); }
});
$('#wand').addEventListener('contextmenu', ev => {
  const karte = ev.target.closest('.karte[data-uid]');
  const u = karte && UP.liste.find(x => x.id === karte.dataset.uid);
  if (!u) return;
  ev.preventDefault();
  uploadMenue(karte.querySelector('[data-ua="mehr"]'), u);
});
(() => {
  const w = $('#wand');
  w.addEventListener('dragover', ev => {
    if (istUploadAnsicht(S.ansicht) && [...ev.dataTransfer.types].includes('Files')) { ev.preventDefault(); w.classList.add('drop'); }
  });
  w.addEventListener('dragleave', ev => { if (!w.contains(ev.relatedTarget)) w.classList.remove('drop'); });
  w.addEventListener('drop', ev => {
    w.classList.remove('drop');
    if (!istUploadAnsicht(S.ansicht) || !ev.dataTransfer.files.length) return;
    ev.preventDefault();
    uploadsHochladen([...ev.dataTransfer.files], uploadOrdnerAus(S.ansicht));
  });
})();
