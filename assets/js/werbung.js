/* PROMPTHEUS — Werbe-Modal für Community und Werkstatt (Plan 30_Community, C1).
 *
 * Die Kurse 1 bis 6 kosten nichts; Werkstatt und Community gehören zum Abo.
 * Wer ohne Registrierung oder ohne Abo auf „Community“ oder „Werkstatt“
 * klickt, bekommt deshalb kein Schloss, sondern diese Seite: was dort wartet,
 * gezeigt an Beispielen. Gebaut wie die Zielseite des 7. Kurses (`ziel.js`):
 * Vollbild, Kopf mit Clip, Abschnitte mit Augenmerk, Überschrift, Text links
 * und Beispiel rechts.
 *
 * **Alles bleibt auf diesem Rechner.** Ohne Registrierung hat die Academy
 * keinen Schlüssel, und dieses Fenster fragt keinen Server. Die Clips kommen
 * mit dem Medienpaket (`medien/95_Werbung/`), die Standbilder mit dem
 * Programm (`assets/img/werbung/`). Fehlt ein Clip, bleibt das Standbild.
 *
 * Die Beispiele sind nachgebaute Oberflächen aus echten Bausteinen, keine
 * Bildschirmfotos. Synonyme darin sind als Beispiel gekennzeichnet. Preise
 * nennt die Seite nicht, sie stehen nur auf der Webseite.
 */
'use strict';

window.PU = window.PU || {};

const WERBUNG_PREISE = 'https://promptheus-academy.de/preise.php';

function werbungRuhig() {
  return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
}

/** Ein Clip mit Standbild. Spielt stumm; bei „weniger Bewegung“ nur auf Klick. */
function werbungClip(name) {
  const v = PU.el('video');
  v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'metadata';
  v.autoplay = !werbungRuhig();
  v.poster = 'assets/img/werbung/' + name + '.jpg';
  v.setAttribute('aria-hidden', 'true');
  // Ohne Medienpaket gibt es den Clip nicht: dann das Standbild allein.
  v.addEventListener('error', () => {
    const b = PU.el('img', 'ziel-foto');
    b.src = v.poster; b.alt = ''; b.loading = 'lazy';
    v.replaceWith(b);
  });
  if (werbungRuhig()) v.addEventListener('click', () => { v.paused ? v.play() : v.pause(); });
  v.src = 'medien/95_Werbung/' + name + '.mp4';
  return v;
}

function werbungFigur(inhalt, unterschrift) {
  const f = PU.el('figure', 'ziel-beispiel');
  f.appendChild(inhalt);
  if (unterschrift) f.appendChild(PU.el('figcaption', '', PU.h(unterschrift)));
  return f;
}

function werbungRaster(namen, unterschrift) {
  const r = PU.el('div', 'werbung-raster');
  namen.forEach(n => r.appendChild(werbungClip(n)));
  return werbungFigur(r, unterschrift);
}

function werbungMuster(html, unterschrift) {
  const m = PU.el('div', 'werbung-muster');
  m.innerHTML = html;
  return werbungFigur(m, unterschrift);
}

PU.WERBUNG_ABSCHNITTE = [
  {
    id: 'bibliothek', augenmerk: 'Die Bibliothek',
    titel: '157 Bewegungsrezepte für eigene Filme.',
    text: [
      'Jedes Rezept zeigt eine Bewegung als kurzen Film: ein Titel, der sich aufbaut, ein Übergang, ' +
      'eine Kamerafahrt durch den Raum. Dazu gibt es Dauer, Energie und einen Code.',
      'Den Code schreibst du ins Drehbuch. Ein Sprachmodell kann die Bewegung daraus nachbauen, ' +
      'und Prometheus hilft dir in der Community, das passende Rezept zu finden.'
    ],
    beispiel: () => werbungRaster(['neon-triple-marquee', 'fracture', 'flying-words', 'cube-navigation'],
      'Vier von 214 Clips. Alle Texte auf Deutsch.')
  },
  {
    id: 'teilen', augenmerk: 'Aus der Werkstatt',
    titel: 'Was du baust, geht mit einem Klick hinaus.',
    text: [
      'Prompts, Skills und Plugins entstehen in der Werkstatt. Dort packst du sie als ZIP, gibst ' +
      'Titel, Beschreibung, Kategorie und ein Bild dazu und lädst sie hoch.',
      'Vor dem Hochladen prüft die Academy jede Datei auf persönliche Angaben. Was gefunden wird, ' +
      'zeigt sie dir. Nichts geht ohne deine Zustimmung hinaus.'
    ],
    beispiel: () => werbungMuster(
      '<div class="werbung-karte"><div class="werbung-zeile"><b>Vokabeln abfragen lassen</b><span>Prompt</span></div></div>' +
      '<div class="werbung-karte"><div class="werbung-zeile"><span>Paket</span><span>vokabeln.zip · 3 Dateien</span></div>' +
      '<div class="werbung-zeile"><span>Kategorie</span><span>Lernstoff und Fächer</span></div>' +
      '<div class="werbung-zeile"><span>Bild</span><span class="ok">✓ gesetzt</span></div>' +
      '<div class="werbung-zeile"><span>Persönliche Angaben</span><span class="ok">✓ keine gefunden</span></div></div>' +
      '<div class="werbung-karte"><div class="werbung-zeile"><span>Mit-Siegel</span><span class="warten">… wartet auf die Eltern</span></div></div>',
      'Nachgebaut: das Hochladen aus der Werkstatt.')
  },
  {
    id: 'siegel', augenmerk: 'Für Eltern',
    titel: 'Kein Werk eines Kindes geht ohne Unterschrift der Eltern hinaus.',
    text: [
      'Ist die Person minderjährig, wartet jedes Werk auf das <b>Mit-Siegel</b>. Zu Hause siegeln ' +
      'die Eltern, in der Schule die Lehrkraft oder die Verwaltung.',
      'Danach prüft ein Sprachmodell vor, und ein Mensch gibt frei. Erst dann steht das Werk in der ' +
      'Community, und das Kind sieht in seinen Einstellungen, wo es gerade steht.'
    ],
    beispiel: () => werbungMuster(
      '<div class="werbung-karte"><div class="werbung-zeile"><b>Gegenzeichnen</b><span>Academy</span></div>' +
      '<p class="klein">„Farben für Präsentationen“ von <b>Funkenschmied</b> (Beispiel), Skill, 2 Dateien</p>' +
      '<div class="werbung-knoepfe"><span class="knopf">Siegeln</span><span class="knopf still">Zurückgeben</span></div></div>' +
      '<div class="werbung-karte"><div class="werbung-zeile"><span>1 Hochgeladen</span><span class="ok">✓</span></div>' +
      '<div class="werbung-zeile"><span>2 Mit-Siegel</span><span class="ok">✓</span></div>' +
      '<div class="werbung-zeile"><span>3 Prüfung</span><span class="warten">…</span></div>' +
      '<div class="werbung-zeile"><span>4 Freigegeben</span><span>–</span></div></div>',
      'Nachgebaut: das Mit-Siegel der Eltern.')
  },
  {
    id: 'sicht', augenmerk: 'Für Schulen',
    titel: 'Die Schule sieht ihre Schüler. Fremde Familien sieht sie nicht.',
    text: [
      'Lehrkräfte sehen die Produktionen der Klassen, die ihnen die Schule zugeordnet hat. Die ' +
      'Schulverwaltung sieht die aller Schüler der Schule.',
      'Familien, die privat lernen, und Teilnehmende der Berufskurse haben eine eigene Academy. Die ' +
      'Schule sieht sie nicht, und sie sehen die Schule nicht. In der Community begegnen sich alle ' +
      'nur über ihr Synonym.'
    ],
    beispiel: () => werbungMuster(
      '<div class="werbung-sicht">' +
      '<div class="werbung-feld schule"><b>Schulverwaltung</b>sieht alle Klassen der Schule</div>' +
      '<div class="werbung-feld"><b>Lehrkraft A</b><ul><li>Klasse 7a</li><li>Klasse 8c</li></ul></div>' +
      '<div class="werbung-feld"><b>Lehrkraft B</b><ul><li>Klasse 7b</li></ul></div>' +
      '<div class="werbung-feld"><b>Familie</b><ul><li>eigene Academy</li><li>Eltern siegeln</li></ul></div>' +
      '<div class="werbung-feld"><b>Berufskurs</b><ul><li>eigene Academy</li><li>volljährig</li></ul></div>' +
      '</div>',
      'Wer welche Produktionen sieht.')
  },
  {
    id: 'schutz', augenmerk: 'Für alle',
    titel: 'Niemand sieht, wer du bist.',
    text: [
      'In der Community steht nur dein Synonym. Namen, Orte, Alter, Geburtstage, Telefonnummern, ' +
      'Klassen und Schlüssel werden schon beim Tippen zu „xxx“.',
      'Eine rot umrandete Verbotsregel sagt dann, warum. Kinder schreiben schnell etwas, das sie ' +
      'später bereuen. Hier kommt es gar nicht erst an.'
    ],
    beispiel: () => werbungMuster(
      '<div class="werbung-karte"><p class="klein">Ich heisse <span class="werbung-xxx">xxx</span> und gehe in die ' +
      '<span class="werbung-xxx">xxx</span>.</p></div>' +
      '<div class="verbotsregel"><p class="verbotsregel-kopf">Verbotsregel</p><p><b>Namen.</b> Nimm dein Synonym.</p>' +
      '<p><b>Klasse.</b> Sie verrät, wo man dich findet.</p><p class="klein">Ersetzt durch „xxx“.</p></div>',
      'So sieht ein Kommentar aus, bevor er abgeschickt wird.')
  },
  {
    id: 'talente', augenmerk: 'Talente',
    titel: 'Jede Woche Talente für die Bestenliste.',
    text: [
      'Was der Community hilft, bekommt Likes. Jede Woche werden 300.000 Talente auf die ersten 30 ' +
      'der Bestenliste verteilt.',
      'Eigene Likes zählen nicht. Talente kann man nicht kaufen, nur verdienen, und in der Academy ' +
      'in Token umwandeln.'
    ],
    beispiel: () => werbungMuster(
      '<div class="werbung-karte"><div class="werbung-zeile"><b>Bestenliste der Woche</b><span>Beispiel</span></div>' +
      '<div class="werbung-zeile"><span>1 Glutfuchs</span><span class="gold">120.000</span></div>' +
      '<div class="werbung-zeile"><span>2 Funkenschmied</span><span class="gold">90.000</span></div>' +
      '<div class="werbung-zeile"><span>3 Lapislicht</span><span class="gold">60.000</span></div></div>',
      'Die Talente gehen an Synonyme, nie an Namen.')
  }
];

PU.WERBUNG_KOPF = {
  community: {
    titel: 'Community', augenmerk: 'Die Community',
    h1: 'Zeig, was du baust.<br>Sieh, was andere bauen.',
    vorspann: 'In der Community teilen Schulen, Lehrkräfte, Eltern und Lernende aus registrierten ' +
      'Academies ihre Prompts, Skills und Plugins. Dazu kommt eine Bibliothek mit 157 ' +
      'Bewegungsrezepten für eigene Filme.',
    clip: 'carousel-3d'
  },
  werkstatt: {
    titel: 'Werkstatt', augenmerk: 'Die Werkstatt',
    h1: 'Bau eigene Werkzeuge.<br>Teil sie mit der Community.',
    vorspann: 'In der Werkstatt baust du mit einem Coder eigene Prompts, Skills und Plugins, ' +
      'Präsentationen und Webseiten. Was gelingt, geht von dort in die Community, und Eltern ' +
      'behalten den Überblick.',
    clip: 'terminal-3d'
  }
};

/** Warum das Fenster kommt — in einem Satz, ohne Schuld. */
PU.WERBUNG_GRUND = {
  nicht_registriert: 'Diese Academy ist noch nicht registriert. Registriert wird im Cockpit mit dem Code aus der Zahlung.',
  kein_abo: 'Für dein Konto läuft noch kein Abo, weder ein eigenes noch eines deiner Klasse oder Schule.'
};

/**
 * Das Werbe-Modal öffnen.
 *
 * @param {string} art   'community' oder 'werkstatt'
 * @param {string} grund 'nicht_registriert' | 'kein_abo' | '' (dann ohne Satz)
 * @param {Array<[string, boolean, string]>} [weg] Schritte mit Haken, etwa
 *        7. Kurs, Registrierung, Abo. Wer den 7. Kurs fertig hat und hier
 *        landet, soll sehen, dass er angekommen ist und nur noch eines fehlt
 *        (Rückmeldung 04.10.2026: „trotz 7. Kurs nur die Werbeseite“).
 */
PU.werbungSeite = function (art, grund, weg) {
  const k = PU.WERBUNG_KOPF[art] || PU.WERBUNG_KOPF.community;
  const flaeche = PU.modalVollbild(k.titel, 'Gehört zum Abo. Die Kurse 1 bis 6 kosten nichts.');
  if (!flaeche) return;

  PU.fensterOffen = art === 'werkstatt' ? 'werbung-werkstatt' : 'werbung';
  if (PU.routeSchreiben) PU.routeSchreiben();

  const seite = PU.el('div', 'ziel-seite werbung-seite');

  const kopf = PU.el('header', 'ziel-kopf');
  const text = PU.el('div', 'ziel-kopftext');
  text.innerHTML =
    '<p class="ziel-augenmerk">' + PU.h(k.augenmerk) + '</p>' +
    '<h1>' + k.h1 + '</h1>' +
    '<p class="ziel-vorspann">' + PU.h(k.vorspann) + '</p>' +
    '<p class="ziel-stand">' + PU.h(PU.WERBUNG_GRUND[grund] ||
      'Die Kurse 1 bis 6 kosten nichts. Werkstatt und Community gehören zum Abo.') + '</p>';
  if (Array.isArray(weg) && weg.length) {
    const liste = PU.el('ol', 'werkstatt-weg werbung-weg');
    liste.setAttribute('aria-label', 'Dein Stand');
    let dran = false;
    weg.forEach(([titel, fertig, zusatz], i) => {
      // Der erste offene Schritt ist dran, die danach warten.
      const klasse = fertig ? 'fertig' : (dran ? '' : 'dran');
      if (!fertig) dran = true;
      const li = PU.el('li', klasse);
      li.innerHTML = '<span class="weg-zeichen" role="img" aria-label="' + (fertig ? 'erledigt' : 'offen') + '">' +
        (fertig ? '✓' : (i + 1)) + '</span>' +
        '<span class="weg-text"><b>' + PU.h(titel) + '</b>' +
        (zusatz ? '<span class="klein"> · ' + PU.h(zusatz) + '</span>' : '') + '</span>';
      liste.appendChild(li);
    });
    text.appendChild(liste);
  }
  kopf.appendChild(text);
  kopf.appendChild(werbungFigur(werbungClip(k.clip)));
  seite.appendChild(kopf);

  PU.WERBUNG_ABSCHNITTE.forEach(a => {
    const s = PU.el('section', 'ziel-abschnitt');
    s.id = 'werbung-' + a.id;
    const t = PU.el('div', 'ziel-text');
    t.innerHTML = '<p class="ziel-augenmerk">' + PU.h(a.augenmerk) + '</p>' +
      '<h2>' + PU.h(a.titel) + '</h2>' + a.text.map(x => '<p>' + x + '</p>').join('');
    s.appendChild(t);
    s.appendChild(a.beispiel());
    seite.appendChild(s);
  });

  const schluss = PU.el('footer', 'ziel-schluss');
  schluss.appendChild(PU.el('p', '',
    'Die Kurse 1 bis 6 bleiben kostenlos. Für Werkstatt und Community brauchst du ein Abo. ' +
    'Die Preise stehen auf der Webseite der Academy.'));
  const knoepfe = PU.el('div', 'werbung-knoepfe');
  const preise = PU.el('a', 'knopf', 'Preise ansehen');
  preise.href = WERBUNG_PREISE; preise.target = '_blank'; preise.rel = 'noopener noreferrer';
  const weiter = PU.el('button', 'knopf still', 'Weiterlernen');
  weiter.type = 'button';
  weiter.addEventListener('click', () => {
    PU.modalSchliessen();
    if (PU.wechsel) PU.wechsel('lernen');
  });
  knoepfe.appendChild(preise);
  knoepfe.appendChild(weiter);
  schluss.appendChild(knoepfe);
  seite.appendChild(schluss);

  flaeche.appendChild(seite);
};

/**
 * Über die Adresse geöffnet (`#/werbung`, `#/werbung-werkstatt`) — etwa wenn
 * der Knopf „Community“ der Werkstatt hierher umgeleitet hat. Den Grund kennt
 * dann nur der Server; das Fenster steht sofort, der Satz kommt nach.
 */
PU.werbungAusAdresse = async function (art) {
  PU.werbungSeite(art, '');
  let r;
  try { r = await PU.ruf(art === 'werkstatt' ? 'werkstatt_menue' : 'gemeinde_start'); }
  catch (e) { return; }
  const grund = ((r && r.zugang) || {}).grund || '';
  const stand = document.querySelector('.werbung-seite .ziel-stand');
  if (stand && PU.WERBUNG_GRUND[grund]) stand.textContent = PU.WERBUNG_GRUND[grund];
  // Für die Werkstatt den Weg mit Haken neu zeichnen (werkstatt.js).
  if (art === 'werkstatt' && r && r.zugang && !r.zugang.ok && PU.werkstattWerbeWeg) {
    PU.werbungSeite(art, grund, PU.werkstattWerbeWeg(r));
  }
};
