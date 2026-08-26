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

  const rahmen = PU.el('div', 'tabellenrahmen');
  let html = '<table><tr><th>Name</th><th>Kennung</th><th>Gruppe</th>' +
             '<th>Punkte</th><th>Titel</th><th>Serie</th>' +
             '<th>Stufen</th><th>Abzeichen</th><th>Versuche</th><th></th></tr>';
  j.klasse.forEach(l => {
    html += '<tr>' +
      '<td>' + PU.h(l.anzeigename) + (l.rolle === 'schueler' ? '' : ' <span class="klein">(' + PU.h(PU.ebenenKurz(l.rolle)) + ')</span>') + '</td>' +
      '<td><code>' + PU.h(l.kennung) + '</code></td>' +
      '<td>' + PU.h(l.gruppe) + '</td>' +
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
    '<label>Kennung <input name="kennung" required pattern="[a-z0-9][a-z0-9._-]{2,31}"></label>' +
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
