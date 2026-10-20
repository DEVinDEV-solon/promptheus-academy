/* PROMPTHEUS — Cockpit-Karte „Meine Kinder“ für Elternkonten (20.10.2026).
 *
 * Eltern sehen ihre verknüpften Kinder (bis zu drei) mit dem Verbrauch der
 * letzten 30 Tage, legen auf dem Familienrechner Kinderkonten an und lösen
 * Verknüpfungen. Was erlaubt ist, entscheidet der Server (srv/familie.php);
 * gezeigt wird nie, WAS ein Kind den Tutor gefragt hat, nur wie viel.
 */
'use strict';

(function () {
  const zahl = n => new Intl.NumberFormat('de-DE').format(n);

  PU.familieKasten = function () {
    const k = PU.el('section', 'cockpit-block');
    k.appendChild(PU.el('h2', '', 'Meine Kinder'));
    const bereich = PU.el('div', 'talent-bereich');
    bereich.innerHTML = '<p class="leer-hinweis">Lade …</p>';
    k.appendChild(bereich);
    PU.ruf('kinder_meine').then(j => malen(bereich, j))
      .catch(e => { bereich.innerHTML = '<p class="fehler">' + PU.h(e.message) + '</p>'; });
    return k;
  };

  function malen(bereich, j) {
    bereich.innerHTML = '';

    bereich.appendChild(PU.el('p', 'hinweis',
      'Hier stehen die Kinder, die mit deinem Konto verknüpft sind, bis zu ' + j.max + '. ' +
      'Du siehst, wie viel jedes Kind in den letzten 30 Tagen beim Tutor verbraucht hat, ' +
      'aber nicht, was es gefragt hat. ' +
      (j.plan && j.plan.gratis
        ? 'Dein Gratis-Zugang gilt auch für deine Kinder. Einen Topf gibt es nicht: Die Tutoren laufen ' +
          'für alle über euren eigenen Schlüssel, solange die Schule eines Kindes keinen eigenen Plan hat.'
        : j.plan && j.plan.familie
        ? 'Dein Plan „' + PU.h(j.plan.name) + '“ gilt auch für deine Kinder: Sie arbeiten aus deinem Topf, ' +
          'solange ihre Schule keinen eigenen Plan hat.'
        : 'Mit einem Familienplan arbeiten deine Kinder aus deinem Topf.') +
      (j.familienrechner ? '' : ' In der Schule verknüpft die Schulleitung im Menü „Klasse“ die Kinder mit deinem Konto.')));

    if (j.kinder.length) {
      const rahmen = PU.el('div', 'tabellenrahmen');
      let html = '<table><thead><tr><th>Kind</th><th>Anmeldename</th><th>Klasse</th>' +
                 '<th class="zahl">Fragen</th><th class="zahl">Token</th><th>Guthaben</th><th></th></tr></thead><tbody>';
      const lage = { offen: 'reicht', knapp: '⚠ knapp', minus: '⚠ im Minus-Rahmen', stopp: '✕ aufgebraucht', unbegrenzt: 'ohne Grenze',
        eigener_schluessel: 'eigener Schlüssel', schluessel: '✕ Schlüssel fehlt' };
      j.kinder.forEach(c => {
        html += '<tr><td>' + PU.h(c.name) + '</td><td><code>' + PU.h(c.kennung) + '</code></td>' +
          '<td>' + PU.h(c.gruppe || '—') + '</td>' +
          '<td class="zahl">' + zahl(c.fragen) + '</td><td class="zahl">' + zahl(c.tokens) + '</td>' +
          '<td class="klein">' + PU.h(lage[c.lage] || c.lage) + '</td>' +
          '<td><button type="button" class="knopf still schmal" data-loesen="' + c.id + '">lösen</button></td></tr>';
      });
      rahmen.innerHTML = html + '</tbody></table>';
      bereich.appendChild(rahmen);
      bereich.appendChild(PU.el('p', 'klein', 'Fragen und Token: die letzten 30 Tage, seit ' + PU.h(j.seit.split('-').reverse().join('.')) + '.'));

      rahmen.addEventListener('click', async e => {
        const id = parseInt(e.target.getAttribute('data-loesen'), 10);
        if (!id) return;
        const c = j.kinder.find(x => x.id === id);
        if (!confirm('Die Verknüpfung mit ' + c.name + ' lösen?\n\nDu kannst diesem Kind danach keine Token ' +
                     'mehr senden, und dein Familienplan gilt für es nicht mehr. Das Konto des Kindes bleibt bestehen.')) return;
        try {
          malen(bereich, await PU.ruf('kind_loesen_eigen', { kind: id }));
          PU.melden('Verknüpfung gelöst.', 'gut');
        } catch (f) { PU.melden(PU.h(f.message), 'schlecht'); }
      });
    } else {
      bereich.appendChild(PU.el('p', 'leer-hinweis', 'Noch kein Kind verknüpft.'));
    }

    if (!j.darf_anlegen) return;

    // ---- Kinderkonto anlegen (nur auf dem Familienrechner)
    const form = PU.el('div', 'gut-formular');
    const feld = (typ, platz, attr) => {
      const e = document.createElement('input');
      e.type = typ; e.placeholder = platz;
      Object.entries(attr || {}).forEach(([a, b]) => e.setAttribute(a, b));
      return e;
    };
    const beschr = (text, el) => {
      const l = PU.el('label', 'gut-feld');
      l.appendChild(PU.el('span', 'klein', PU.h(text)));
      l.appendChild(el);
      return l;
    };
    const name = feld('text', 'zum Beispiel: Lena', { maxlength: '60', autocomplete: 'off' });
    const kennung = feld('text', 'zum Beispiel: lena', { maxlength: '40', autocomplete: 'off', spellcheck: 'false' });
    const kennwort = feld('password', 'mindestens 8 Zeichen', { minlength: '8', autocomplete: 'new-password' });
    const los = PU.el('button', 'knopf', 'Kind anlegen');
    los.type = 'button';
    form.appendChild(beschr('Name des Kindes', name));
    form.appendChild(beschr('Anmeldename', kennung));
    form.appendChild(beschr('Kennwort', kennwort));
    form.appendChild(los);
    bereich.appendChild(PU.el('h3', '', 'Kinderkonto anlegen'));
    bereich.appendChild(PU.el('p', 'klein',
      'Dein Kind meldet sich mit Anmeldename und Kennwort an und wählt beim ersten Mal ein Pseudonym. ' +
      'Unter diesem Namen tritt es in der Academy auf. Noch ' + (j.max - j.kinder.length) + ' Platz' +
      (j.max - j.kinder.length === 1 ? '' : 'e') + ' frei.'));
    bereich.appendChild(form);
    const bericht = PU.el('p', 'warum');
    bereich.appendChild(bericht);

    los.addEventListener('click', async () => {
      if (kennwort.value.length < 8) { bericht.innerHTML = '<b style="color:var(--schlecht)">✕ Das Kennwort braucht mindestens 8 Zeichen.</b>'; return; }
      los.disabled = true;
      try {
        const r = await PU.ruf('kind_anlegen_eigen', {
          anzeigename: name.value, kennung: kennung.value, kennwort: kennwort.value });
        PU.melden('Kinderkonto angelegt und verknüpft.', 'gut');
        malen(bereich, r);
      } catch (f) {
        bericht.innerHTML = '<b style="color:var(--schlecht)">✕ ' + PU.h(f.message) + '</b>';
        los.disabled = false;
      }
    });
  }
})();
