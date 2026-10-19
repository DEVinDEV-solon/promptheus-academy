/* PROMPTHEUS — Klassenübersicht. Nur für Tutoren.
 *
 * Zeigt Punkte, Serie und bestandene Stufen — NICHT die Antworten. Die stehen
 * in der Datenbank und werden erst sichtbar, wenn ein Tutor gezielt eine
 * Aufgabe aufmacht. Eine Übersicht, die nebenbei jede Antwort ausbreitet,
 * lädt zum Stöbern ein statt zum Helfen.
 */
'use strict';

PU.klasseZeichnen = async function () {
  const ziel = document.getElementById('view-klasse');
  if (!ziel) return;
  ziel.innerHTML = '<p class="leer-hinweis">Lade Klasse …</p>';

  let j;
  try { j = await PU.ruf('klasse'); }
  catch (e) { ziel.innerHTML = '<p class="fehler">' + PU.h(e.message) + '</p>'; return; }

  ziel.innerHTML = '<h1>Klasse</h1>' +
    '<p class="hinweis">Wer lernt, wie weit — und wo jemand hängt. ' +
    'Von hier aus legst du Konten an und setzt Kennwörter zurück.</p>';

  /* Eine Lehrkraft sieht nur die Klassen, die ihr die Schule zugeordnet hat
     (Plan 30_Community, C8). Steht noch keine da, soll sie wissen, warum die
     Liste leer ist — und wer das ändert. */
  if (Array.isArray(j.meine_klassen)) {
    ziel.appendChild(PU.el('p', j.meine_klassen.length ? 'hinweis' : 'merkzettel',
      j.meine_klassen.length
        ? 'Deine Klassen: <b>' + PU.h(j.meine_klassen.join(', ')) + '</b>. Zugeordnet von der Schulverwaltung.'
        : 'Die Schulverwaltung hat dir noch keine Klasse zugeordnet. Bis dahin siehst du hier nur dich selbst ' +
          'und gibst kein Mit-Siegel.'));
  }
  const zuordnung = j.lehrer_klassen || {};

  /* Eltern ↔ Kinder (Recht eltern.manage). Seit 20.10.2026 bis zu drei Kinder
     je Elternkonto (`eltern_kinder`), ein Kind hat vorerst ein Elternkonto.
     Zur Wahl stehen die Schülerkonten unter ihrem Pseudonym, wie überall, wo
     Lernende in einer Liste auftauchen — ohne die, die schon Eltern haben. */
  const elternKinder = j.eltern_kinder || {};
  const kinderMax = j.kinder_max || 3;
  const kindWahl = PU.darf('eltern.manage') && j.klasse.some(l => l.rolle === 'eltern');
  const kinder = kindWahl
    ? j.klasse.filter(l => l.rolle === 'schueler')
        .map(l => ({ id: Number(l.id), name: (l.pseudonym || '').trim() || l.anzeigename, gruppe: l.gruppe || '' }))
        .sort((a, b) => a.name.localeCompare(b.name, 'de'))
    : [];
  const kindName = id => {
    const k = kinder.find(x => x.id === id);
    return k ? k.name + (k.gruppe ? ' · ' + k.gruppe : '') : 'Konto Nr. ' + id;
  };
  const vergeben = new Set(Object.values(elternKinder).flat().map(Number));
  const kindZelle = (l) => {
    const meine = (elternKinder[l.id] || []).map(Number);
    let h = '<span class="kinder-liste">';
    meine.forEach(id => {
      h += '<span class="kind-marke">' + PU.h(kindName(id)) +
           ' <button class="knopf still schmal" type="button" data-kind-loesen="' + l.id + ':' + id + '" ' +
           'aria-label="' + PU.h(kindName(id)) + ' lösen">lösen</button></span>';
    });
    if (meine.length < kinderMax) {
      const frei = kinder.filter(k => !vergeben.has(k.id));
      if (frei.length) {
        h += '<span class="klassen-zuordnen"><select data-kind="' + l.id + '" ' +
             'aria-label="Kind für ' + PU.h(l.anzeigename) + ' wählen">' +
             '<option value="0">— Kind wählen —</option>' +
             frei.map(k => '<option value="' + k.id + '">' + PU.h(k.name + (k.gruppe ? ' · ' + k.gruppe : '')) + '</option>').join('') +
             '</select><button class="knopf still schmal" type="button" data-kind-speichern="' + l.id + '">Verknüpfen</button></span>';
      }
    } else {
      h += '<span class="klein">' + kinderMax + ' Kinder, mehr geht nicht</span>';
    }
    return h + '</span>';
  };

  const spalte = ['Gruppe'];
  if (Object.keys(zuordnung).length) spalte.push('Klassen');
  if (kindWahl) spalte.push('Kinder');

  const rahmen = PU.el('div', 'tabellenrahmen');
  let html = '<table><tr><th>Name</th><th>Kennung</th><th>' + spalte.join(' · ') + '</th>' +
             '<th>Punkte</th><th>Titel</th><th>Serie</th>' +
             '<th>Stufen</th><th>Abzeichen</th><th>Versuche</th><th></th></tr>';
  j.klasse.forEach(l => {
    html += '<tr>' +
      '<td>' + PU.h(l.anzeigename) + (l.rolle === 'schueler' ? '' : ' <span class="klein">(' + PU.h(PU.ebenenKurz(l.rolle)) + ')</span>') + '</td>' +
      '<td><code>' + PU.h(l.kennung) + '</code></td>' +
      '<td>' + (zuordnung[l.id] !== undefined
        // Bei einer Lehrkraft steht hier nicht ihre eigene Gruppe, sondern
        // die Klassen, die sie sieht — für die Verwaltung zum Eintragen.
        ? '<span class="klassen-zuordnen"><input data-klassen="' + l.id + '" value="' +
          PU.h(zuordnung[l.id].join(', ')) + '" placeholder="z. B. 7a, 8c" size="10" ' +
          'aria-label="Klassen von ' + PU.h(l.anzeigename) + '">' +
          '<button class="knopf still schmal" type="button" data-klassen-speichern="' + l.id + '">Zuordnen</button></span>'
        : kindWahl && l.rolle === 'eltern'
        // Beim Elternkonto stehen hier seine Kinder und die Wahl für ein weiteres.
        ? kindZelle(l)
        : PU.h(l.gruppe)) + '</td>' +
      '<td>' + l.punkte + '</td>' +
      '<td>' + PU.h(l.titel) + '</td>' +
      '<td>' + l.serie + '</td>' +
      '<td>' + l.stufen + '</td>' +
      '<td>' + l.badges + '</td>' +
      '<td>' + l.versuche + '</td>' +
      '<td><button class="knopf still schmal" data-zuruecksetzen="' + l.id + '">Kennwort</button>' +
        // Übernehmen nur, wo das Recht besteht — und nie für ein Admin-Konto:
        // der Server weist das ohnehin ab, und ein Knopf, der zuverlässig eine
        // Fehlermeldung erzeugt, ist kein Angebot.
        (PU.darf('rollen.uebernehmen') && l.rolle !== 'admin'
          ? ' <button class="knopf still schmal" data-uebernehmen="' + l.id + '" ' +
            'title="Als dieses Konto handeln, um einen Ablauf zu prüfen. ' +
            'Jede Handlung steht mit beiden Namen im Protokoll.">Übernehmen</button>'
          : '') +
      '</td></tr>';
  });
  rahmen.innerHTML = html + '</table>';
  ziel.appendChild(rahmen);

  rahmen.querySelectorAll('[data-uebernehmen]').forEach(k => {
    k.addEventListener('click', async () => {
      if (!confirm('Dieses Konto übernehmen?\n\n' +
                   'Du handelst danach WIRKLICH als dieses Konto — was du tust, ' +
                   'geschieht in seinem Namen und steht mit beiden Namen im ' +
                   'Protokoll. Oben erscheint ein Band, über das du zurückkommst.')) return;
      try {
        await PU.ruf('rolle_uebernehmen', { lernender: Number(k.dataset.uebernehmen) });
        // Neu laden statt umschalten: Menü, Rechte und Kennzahlen stehen
        // serverseitig im HTML. Ein halb umgestelltes Fenster wäre schlimmer
        // als ein kurzer Neuaufbau.
        location.href = 'index.php';
      } catch (e) { PU.melden(PU.h(e.message), 'schlecht'); }
    });
  });

  rahmen.querySelectorAll('[data-klassen-speichern]').forEach(k => {
    k.addEventListener('click', async () => {
      const feld = rahmen.querySelector('[data-klassen="' + k.dataset.klassenSpeichern + '"]');
      try {
        const r = await PU.ruf('lehrer_klassen_setzen',
          { lehrer: Number(k.dataset.klassenSpeichern), klassen: feld ? feld.value : '' });
        if (feld) feld.value = r.klassen.join(', ');
        PU.melden(r.klassen.length ? 'Klassen zugeordnet: ' + PU.h(r.klassen.join(', ')) + '.'
                                   : 'Keine Klasse mehr zugeordnet.', 'gut');
      } catch (e) { PU.melden(PU.h(e.message), 'schlecht'); }
    });
  });

  rahmen.querySelectorAll('[data-kind-speichern]').forEach(k => {
    k.addEventListener('click', async () => {
      const wahl = rahmen.querySelector('[data-kind="' + k.dataset.kindSpeichern + '"]');
      if (!wahl) return;
      if (wahl.value === '0') return;
      try {
        await PU.ruf('kind_setzen', { eltern: Number(k.dataset.kindSpeichern), kind: Number(wahl.value) });
        PU.melden('Kind verknüpft: ' + PU.h(wahl.options[wahl.selectedIndex].textContent) + '.', 'gut');
        PU.klasseZeichnen();
      } catch (e) { PU.melden(PU.h(e.message), 'schlecht'); }
    });
  });

  rahmen.querySelectorAll('[data-kind-loesen]').forEach(k => {
    k.addEventListener('click', async () => {
      const [eltern, kind] = k.dataset.kindLoesen.split(':').map(Number);
      if (!confirm('Die Verknüpfung mit ' + kindName(kind) + ' lösen?\n\nDas Elternkonto kann diesem Kind ' +
                   'danach keine Token mehr senden, und ein Familienplan gilt für das Kind nicht mehr.')) return;
      try {
        await PU.ruf('kind_loesen', { eltern, kind });
        PU.melden('Verknüpfung gelöst.', 'gut');
        PU.klasseZeichnen();
      } catch (e) { PU.melden(PU.h(e.message), 'schlecht'); }
    });
  });

  rahmen.querySelectorAll('[data-zuruecksetzen]').forEach(k => {
    k.addEventListener('click', async () => {
      const neu = prompt('Neues Kennwort (mindestens 8 Zeichen):');
      if (!neu) return;
      try {
        await PU.ruf('kennwort_zuruecksetzen', { lernender: Number(k.dataset.zuruecksetzen), neu: neu });
        PU.melden('Kennwort gesetzt.', 'gut');
      } catch (e) { PU.melden(PU.h(e.message), 'schlecht'); }
    });
  });

  /* ---------------------------------------------------- Konto anlegen */
  ziel.appendChild(PU.el('h2', '', 'Konto anlegen'));
  const form = document.createElement('form');
  form.className = 'tor-form';
  form.style.maxWidth = '420px';
  form.innerHTML =
    '<label>Kennung <input name="kennung" required pattern="[a-z0-9][a-z0-9._\\-]{2,31}"></label>' +
    '<label>Anzeigename <input name="anzeigename" required></label>' +
    '<label>Kennwort <input name="kennwort" type="password" required minlength="8"></label>' +
    '<label>Gruppe <input name="gruppe" placeholder="z. B. 8b (optional)"></label>' +
    '<label>Ebene <select name="rolle">' + PU.ebenenOptionen('schueler') + '</select></label>';
  const knopf = PU.el('button', 'knopf', 'Anlegen');
  knopf.type = 'submit';
  form.appendChild(knopf);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const daten = {};
    new FormData(form).forEach((w, n) => { daten[n] = w; });
    try {
      await PU.ruf('konto_anlegen', daten);
      PU.melden('Konto angelegt.', 'gut');
      PU.klasseZeichnen();
    } catch (fehler) { PU.melden(PU.h(fehler.message), 'schlecht'); }
  });
  ziel.appendChild(form);

  /* ---------------------------------------------------- Lehrstoff prüfen */
  ziel.appendChild(PU.el('h2', '', 'Lehrstoff'));
  ziel.appendChild(PU.el('p', 'hinweis',
    'Liest den Vault neu ein und meldet jede Aufgabe, die sich nicht parsen ' +
    'lässt — doppelte Kennung, unbekannter Typ, Lösung ohne passenden Baustein.'));
  const pruefKnopf = PU.el('button', 'knopf still', 'Lehrstoff prüfen');
  const pruefErg = PU.el('div');
  pruefKnopf.addEventListener('click', async () => {
    pruefErg.innerHTML = '<p class="klein">Prüfe …</p>';
    try {
      const r = await PU.ruf('stoff_pruefen');
      if (!r.fehler.length) {
        pruefErg.innerHTML = '<div class="ergebnis richtig"><div class="ergebnis-kopf">' +
          '<span class="zeichen">✓</span>Ohne Befund</div><p>' + r.kurse + ' Kurse, ' +
          r.aufgaben + ' Aufgaben.</p></div>';
      } else {
        pruefErg.innerHTML = '<div class="ergebnis falsch"><div class="ergebnis-kopf">' +
          '<span class="zeichen">✕</span>' + r.fehler.length + ' Fehler</div><ul>' +
          r.fehler.map(f => '<li>' + PU.h(f) + '</li>').join('') + '</ul></div>';
      }
    } catch (e) { pruefErg.innerHTML = '<p class="fehler">' + PU.h(e.message) + '</p>'; }
  });
  ziel.appendChild(pruefKnopf);
  ziel.appendChild(pruefErg);
};
