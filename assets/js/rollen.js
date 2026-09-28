/* PROMPTHEUS — Rollen & Rechte zum Nachlesen (Entscheid 28.09.2026).
 *
 * **Für jeden sichtbar, auch ohne Registrierung.** Die Rolle kommt aus der
 * Registrierung (srv/rechte.php, PU_ARTEN): Ohne sie ist jedes Konto Schüler.
 * Wer das nicht erklärt bekommt, hält es für einen Fehler. Deshalb steht hier
 * ein Reiter, der sagt, welche Rolle man hat und woher sie kommt — und eine
 * ausführliche Seite, die alle Rollen erklärt, mit dem Weg zu Preisen und
 * Registrierung am Ende.
 *
 * Die Rechte selbst kommen vom Server (`rollen_erklaert`), aus derselben
 * Matrix, die jede Aktion prüft. Was hier steht, kann nicht von dem
 * abweichen, was gilt.
 */
'use strict';

PU.ROLLEN_TEXT = {
  admin:      'Der Betreiber, DEVinDEV. Dieses Konto gibt es nur auf unseren eigenen Rechnern. ' +
              'Auf deinem Rechner wirkt der Betreiber nur über eine Fernwartung, die du beauftragt hast.',
  verwaltung: 'Wer die Academy betreibt: die Schulleitung, die Lehrkraft mit eigener Klasse oder ' +
              'der Erwachsene, der für sich lernt. Trägt den Tutor-Schlüssel ein, legt Konten an, ' +
              'verteilt Rechte und spielt Updates ein.',
  lehrer:     'Unterrichtet: sieht die Klasse und die Antworten der Schüler, pflegt Kurse und Lektionen.',
  eltern:     'In einer Familie die Inhaber: tragen den Tutor-Schlüssel ein, legen die Konten der Kinder ' +
              'an und entscheiden, was die Kinder dürfen. An einer Schule sehen Eltern den eigenen Lernstand.',
  schueler:   'Lernt: löst Aufgaben, legt Prüfungen ab und fragt den Tutor — wenn die Erwachsenen ihn ' +
              'freigegeben haben.'
};

/* Die Arten der Registrierung, wie sie auf der Website abgefragt werden
 * (promptheus-devindev, PU_REG_ROLLEN), und welche Rolle daraus wird. */
PU.ARTEN_TEXT = [
  ['Schule, Hochschule, freie Schule, Träger', 'verwaltung'],
  ['Lehrkraft (eigene Klasse, eigene Rechnung)', 'verwaltung'],
  ['Eltern (Familie, ohne Schule)', 'eltern'],
  ['Einzelperson (Erwachsene, lernt für sich)', 'verwaltung'],
  ['Ohne Registrierung', 'schueler']
];

PU.ART_NAME = {
  betreiber: 'Betreiber', schule: 'Schule', hochschule: 'Hochschule',
  privatschule: 'Schule in freier Trägerschaft', traeger: 'Träger',
  lehrkraft: 'Lehrkraft', eltern: 'Eltern', einzelperson: 'Einzelperson'
};

PU.WEB = 'https://promptheus-academy.de/';

/** Der Reiter in den Einstellungen. */
PU.rollenZeichnen = function (ziel) {
  ziel.appendChild(PU.el('h3', '', 'Rollen &amp; Rechte'));
  const rahmen = PU.el('div');
  rahmen.innerHTML = '<p class="leer-hinweis">Lade …</p>';
  ziel.appendChild(rahmen);

  PU.ruf('rollen_erklaert')
    .then(d => {
      rahmen.innerHTML = '';
      const name = (d.ebenen[d.meine_ebene] || {}).anzeige || d.meine_ebene;

      const kasten = PU.el('div', 'rollen-kasten');
      kasten.innerHTML =
        '<p class="rollen-meine">Deine Rolle: <b>' + PU.h(name) + '</b></p>' +
        '<p>' + (d.art === ''
          ? 'Diese Academy ist <b>noch nicht registriert</b>. Bis dahin ist jedes Konto Schüler: ' +
            'Man kann sich alles ansehen und lernen, aber niemand kann einen Tutor-Schlüssel eintragen, ' +
            'Konten anlegen oder Rechte verteilen. Die Verwaltungsrolle entsteht nur durch die Registrierung.'
          : 'Registriert als <b>' + PU.h(PU.ART_NAME[d.art] || d.art) + '</b>. Wer registriert hat, ist ' +
            '<b>' + PU.h((d.ebenen[d.inhaber] || {}).anzeige || d.inhaber) + '</b> und legt die übrigen Konten an.') +
        '</p>';
      const knopf = PU.el('button', 'knopf', 'Rollen &amp; Rechte ausführlich');
      knopf.type = 'button';
      knopf.addEventListener('click', () => PU.rollenFenster(d));
      kasten.appendChild(knopf);
      rahmen.appendChild(kasten);

      // Wer Rechte verteilen darf, bekommt darunter die Matrix.
      if (d.darf_aendern && PU.rechteZeichnen) PU.rechteZeichnen(rahmen);
    })
    .catch(e => { rahmen.innerHTML = '<p class="fehler">' + PU.h(e.message) + '</p>'; });
};

/**
 * Die ausführliche Seite. Ein eigenes Fenster ÜBER den Einstellungen — die
 * liegen schon im #modal, und wer die Erklärung schliesst, soll wieder dort
 * stehen, wo er war.
 */
PU.rollenFenster = function (d) {
  PU.rollenFensterZu();

  const huelle = PU.el('div', 'modal modal-oben');
  huelle.id = 'rollen-fenster';
  huelle.setAttribute('role', 'dialog');
  huelle.setAttribute('aria-modal', 'true');
  huelle.setAttribute('aria-labelledby', 'rollen-titel');

  const flaeche = PU.el('div', 'modal-flaeche');
  const kopf = PU.el('div', 'modal-kopf');
  kopf.innerHTML = '<h2 id="rollen-titel">Rollen &amp; Rechte</h2>';
  const zu = PU.el('button', 'modal-zu', '×');
  zu.type = 'button';
  zu.setAttribute('aria-label', 'Schliessen');
  zu.addEventListener('click', PU.rollenFensterZu);
  kopf.appendChild(zu);
  flaeche.appendChild(kopf);

  const inhalt = PU.el('div', 'modal-inhalt rollen-inhalt');
  inhalt.appendChild(rollenWeg(d));
  inhalt.appendChild(rollenListe(d));
  inhalt.appendChild(rollenKinder());
  inhalt.appendChild(rollenBetreiber(d));
  inhalt.appendChild(rollenSicher());
  flaeche.appendChild(inhalt);
  flaeche.appendChild(rollenFuss(d));

  huelle.appendChild(flaeche);
  huelle.addEventListener('click', e => { if (e.target === huelle) PU.rollenFensterZu(); });
  document.addEventListener('keydown', rollenEscape, true);
  document.body.appendChild(huelle);
  zu.focus();
};

PU.rollenFensterZu = function () {
  const f = document.getElementById('rollen-fenster');
  if (f) f.remove();
  document.removeEventListener('keydown', rollenEscape, true);
};

// Esc schliesst nur die Erklärung, nicht die Einstellungen darunter.
function rollenEscape(e) {
  if (e.key !== 'Escape') return;
  e.stopPropagation();
  PU.rollenFensterZu();
}

function rollenAbschnitt(titel) {
  const s = PU.el('section', 'rollen-abschnitt');
  s.appendChild(PU.el('h3', '', PU.h(titel)));
  return s;
}

/* 1. Woher die Rolle kommt */
function rollenWeg(d) {
  const s = rollenAbschnitt('Wie man zu seiner Rolle kommt');
  s.appendChild(PU.el('p', '',
    'Nach der Installation ist jedes Konto <b>Schüler</b>. Die Verwaltungsrolle entsteht nur auf einem Weg: ' +
    'mit dem <b>Registrierungscode</b>, den es nach der Zahlung gibt. Wer ihn hier eingibt, bekommt die Rolle, ' +
    'die zur Registrierung passt, und legt danach alle weiteren Konten an.'));

  const t = PU.el('table', 'tabelle rollen-tabelle');
  t.innerHTML = '<thead><tr><th>Registriert als</th><th>Rolle der Person, die registriert</th></tr></thead><tbody>' +
    PU.ARTEN_TEXT.map(a => '<tr><td>' + PU.h(a[0]) + '</td><td>' +
      PU.h((d.ebenen[a[1]] || {}).anzeige || a[1]) + '</td></tr>').join('') + '</tbody>';
  s.appendChild(t);

  s.appendChild(PU.el('p', 'klein',
    'Schüler registrieren sich nicht selbst: Für ein Kind registrieren die Eltern oder die Schule.'));
  return s;
}

/* 2. Die Rollen, jede mit dem, was sie darf — aus der Matrix. */
function rollenListe(d) {
  const s = rollenAbschnitt('Die Rollen');
  const zeigen = Object.keys(d.ebenen).filter(e => e !== 'admin');

  zeigen.forEach(e => {
    const darf = [];
    Object.keys(d.gruppen).forEach(g => d.gruppen[g].forEach(r => {
      if (r.stand[e] && r.wirkt) darf.push(r.was);
    }));
    const box = PU.el('details', 'rollen-rolle');
    if (e === d.meine_ebene) box.open = true;
    box.innerHTML =
      '<summary><b>' + PU.h(d.ebenen[e].anzeige) + '</b>' +
      (e === d.meine_ebene ? ' <span class="recht-marke">du</span>' : '') +
      (d.art !== '' && d.ebenen_hier.indexOf(e) < 0
        ? ' <span class="recht-marke still">gibt es hier nicht</span>' : '') +
      '</summary>' +
      '<p>' + PU.h(PU.ROLLEN_TEXT[e] || '') + '</p>' +
      '<p class="klein">Darf ' + darf.length + ' Dinge:</p>' +
      '<ul class="rollen-darf">' + darf.map(w => '<li>' + PU.h(w) + '</li>').join('') + '</ul>';
    s.appendChild(box);
  });
  s.appendChild(PU.el('p', 'klein',
    'So steht es ab Werk. Verwaltung und Eltern können Rechte weitergeben — aber nur solche, die sie selbst haben.'));
  return s;
}

/* 3. Warum Kinder manches nicht selbst einstellen */
function rollenKinder() {
  const s = rollenAbschnitt('Warum Kinder manches nicht selbst dürfen');
  const ul = PU.el('ul');
  ul.innerHTML =
    '<li><b>Tutor-Schlüssel:</b> Wer ihn einträgt, bezahlt die Modell-Aufrufe. Das entscheiden die Eltern ' +
    'oder die Schule. Geben sie ihn nicht frei, gibt es keinen Tutor.</li>' +
    '<li><b>Mikrofon:</b> Ein offenes Mikrofon bei einem Kind schalten Erwachsene zu, nicht das Programm.</li>' +
    '<li><b>Tagesziel und Rückfrage vor Hinweisen:</b> Beides dreht an den Punkten. Kinder lernen mit der ' +
    'Vorgabe, bis ein Erwachsener es anders einstellt.</li>' +
    '<li><b>Eigene Werke in der Community:</b> Bei Minderjährigen zeichnet ein Erwachsener mit (Mit-Siegel).</li>';
  s.appendChild(ul);
  return s;
}

/* 4. Was nur der Betreiber kann */
function rollenBetreiber(d) {
  const s = rollenAbschnitt('Was nur der Betreiber kann');
  const liste = [];
  Object.keys(d.gruppen).forEach(g => d.gruppen[g].forEach(r => { if (r.nur_admin) liste.push(r.was); }));
  s.appendChild(PU.el('p', '',
    'Diese Rechte gehören der Plattform und lassen sich nicht weitergeben. Auf deinem Rechner übt der Betreiber ' +
    'sie nur im Rahmen einer Fernwartung aus, die du beauftragt und bestätigt hast.'));
  s.appendChild(PU.el('ul', 'rollen-darf', liste.map(w => '<li>' + PU.h(w) + '</li>').join('')));
  return s;
}

/* 5. Warum sich das nicht umbauen lässt */
function rollenSicher() {
  const s = rollenAbschnitt('Warum sich die Rolle nicht einfach umstellen lässt');
  s.appendChild(PU.el('p', '',
    'Die Rolle hängt an einer <b>Bescheinigung</b>, die unser Server unterschreibt. Die Academy prüft die ' +
    'Unterschrift mit einem Schlüssel, der fest im Programm steht. Ein Eintrag in der Datenbank oder in einer ' +
    'Einstellungsdatei macht niemanden zur Verwaltung. Was Geld kostet — Token, der Tutor über unseren Server, ' +
    'die Community, Updates —, prüft der Server bei jeder Anfrage noch einmal selbst.'));
  return s;
}

/* Der Fuss: Schliessen · Preise · Registrieren */
function rollenFuss(d) {
  const fuss = PU.el('div', 'rollen-fuss');

  const zu = PU.el('button', 'knopf still', 'Schliessen');
  zu.type = 'button';
  zu.addEventListener('click', PU.rollenFensterZu);
  fuss.appendChild(zu);

  const preise = PU.el('a', 'knopf still', 'Preise ↗');
  preise.href = PU.WEB + 'preise.php';
  preise.target = '_blank';
  preise.rel = 'noopener noreferrer';
  fuss.appendChild(preise);

  // Registrieren nur, solange es nicht geschehen ist. Danach wäre der Knopf
  // ein Versprechen, das nichts tut.
  if (d.art === '') {
    const reg = PU.el('button', 'knopf', 'Registrieren');
    reg.type = 'button';
    fuss.appendChild(reg);

    const form = PU.el('div', 'rollen-registrieren hidden');
    form.innerHTML =
      '<p class="klein">Den Code gibt es nach der Zahlung per E-Mail. Er gilt 48 Stunden und nur einmal. ' +
      'Noch keinen? <a href="' + PU.WEB + 'registrierung.php" target="_blank" rel="noopener noreferrer">' +
      'Registrierung auf promptheus-academy.de ↗</a></p>';
    const zeile = PU.el('div', 'talent-zeile');
    const feld = document.createElement('input');
    feld.type = 'text';
    feld.maxLength = 40;
    feld.placeholder = 'XXXXX-XXXXX-XXXXX-XXXXX';
    feld.autocomplete = 'off';
    feld.spellcheck = false;
    feld.setAttribute('aria-label', 'Registrierungscode');
    const los = PU.el('button', 'knopf', 'Code einlösen');
    los.type = 'button';
    zeile.appendChild(feld);
    zeile.appendChild(los);
    form.appendChild(zeile);
    const bericht = PU.el('p', 'warum');
    form.appendChild(bericht);
    fuss.appendChild(form);

    reg.addEventListener('click', () => { form.classList.remove('hidden'); feld.focus(); });
    los.addEventListener('click', async () => {
      const code = feld.value.trim();
      if (!code) return;
      los.disabled = true;
      bericht.textContent = 'Registriere …';
      try {
        const r = await PU.ruf('relay_registrieren', { code: code });
        if (r.ok) {
          bericht.textContent = 'Registriert. Die Seite lädt neu — mit deiner neuen Rolle.';
          setTimeout(() => location.reload(), 900);
          return;
        }
        bericht.innerHTML = '<b style="color:var(--schlecht)">' + PU.h(r.meldung || 'Abgewiesen.') + '</b>';
      } catch (e) {
        bericht.innerHTML = '<b style="color:var(--schlecht)">' + PU.h(e.message) + '</b>';
      }
      los.disabled = false;
    });
  }
  return fuss;
}
