/* PROMPTHEUS — der Name in der Academy (Pseudonym).
 *
 * Beim ersten Anmelden jedes Kontos ist die Wahl Pflicht: Das Fenster hat
 * keinen Schliessen-Knopf, Esc und ein Klick daneben tun nichts. Danach öffnet
 * es sich aus Einstellungen › Profil, dort mit Schliessen und mit der Frist.
 *
 * Die Regeln stehen im Server (srv/pseudonym.php), nicht hier: Diese Datei
 * zeigt nur, was er erlaubt, und schickt die Wahl hin. Geprüft wird dort.
 */
(function () {
  'use strict';

  /** Datum ohne Uhrzeit, deutsch. */
  function datum(iso) {
    const d = new Date(iso);
    return isNaN(d) ? '' : d.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  /**
   * Das Fenster.
   * @param {boolean} pflicht - ohne Ausweg (erstes Anmelden) oder aus den Einstellungen
   */
  PU.pseudonymFenster = async function (pflicht) {
    let daten;
    try {
      daten = await PU.ruf('pseudonym_stand', {});
    } catch (e) {
      PU.melden(PU.h(e.message), 'schlecht');
      return;
    }
    const stand = daten.stand;

    let flaeche;
    if (pflicht) {
      // Ein frisches Element: so hängt kein Horcher eines früheren Fensters
      // daran, der es per Esc oder Klick daneben schliessen könnte.
      const alt = document.getElementById('modal');
      if (!alt) return;
      const modal = alt.cloneNode(false);
      alt.replaceWith(modal);
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');
      modal.setAttribute('aria-labelledby', 'ps-titel');
      modal.innerHTML =
        '<div class="modal-flaeche ps-flaeche"><div class="modal-kopf">' +
        '<h2 id="ps-titel">Dein Name in der Academy</h2></div>' +
        '<div class="modal-inhalt breit"></div></div>';
      flaeche = modal.querySelector('.modal-inhalt');
    } else {
      flaeche = PU.modalZeigen('Dein Name in der Academy');
      if (!flaeche) return;
      flaeche.parentElement.classList.add('ps-flaeche');
    }

    const gesperrt = !pflicht && stand.aenderbar_ab !== '';
    const kennung = stand.kennung;

    flaeche.innerHTML =
      '<div class="ps">' +
      '<p class="ps-satz">Dieser Name begleitet dich überall. Die Tutoren sprechen dich so an, ' +
      'Hephaistos kennt dich so in der Werkstatt, und in der Community sehen ihn andere. ' +
      'Dein echter Name taucht dort nie auf.</p>' +
      '<ol class="ps-weg" aria-label="Wo dein Name erscheint">' +
      '<li><b>Academy</b><span>Tutoren</span></li>' +
      '<li><b>Werkstatt</b><span>Hephaistos</span></li>' +
      '<li><b>Community</b><span>mit Kennung</span></li></ol>' +
      '<p class="ps-satz">Darum hat er nichts mit dir zu tun: kein Vorname, kein Nachname, ' +
      'kein Geburtsjahr, keine Schule. <strong>Wähle mit Bedacht:</strong> Ändern lässt er sich ' +
      'danach nur alle ' + stand.sperrtage + ' Tage.</p>' +
      (gesperrt
        ? '<p class="ps-frist" role="status">Du trägst <b>' + PU.h(stand.teil) + '</b>. ' +
          'Ändern kannst du ihn wieder ab dem ' + PU.h(datum(stand.aenderbar_ab)) + '.</p>'
        : '<fieldset class="ps-wahl"><legend>Würfle deinen Namen</legend>' +
          '<div class="ps-vorschlaege" role="group" aria-label="Vorschläge"></div>' +
          '<button type="button" class="knopf still ps-wuerfeln">Neu würfeln</button>' +
          (stand.nur_baukasten ? ''
            : '<label class="ps-eigen">Oder ein eigener Name ' +
              '<input type="text" maxlength="18" autocomplete="off" spellcheck="false" ' +
              'pattern="[A-Za-zÄÖÜäöü][A-Za-zÄÖÜäöü0-9]{2,17}" placeholder="z. B. Nachtfalke"></label>') +
          '</fieldset>' +
          '<p class="ps-vorschau" aria-live="polite"></p>' +
          '<p class="ps-kennung">Die Kennung <code>_' + PU.h(kennung) + '</code> gehört fest zu ' +
          'deinem Konto. In der Community steht sie hinter deinem Namen, damit dich niemand ' +
          'nachahmen kann. Angesprochen wirst du nur mit dem Namen davor.</p>' +
          '<label class="ps-ok"><input type="checkbox"> Ich habe gelesen, wo mein Name erscheint ' +
          'und dass ich ihn nur alle ' + stand.sperrtage + ' Tage ändern kann.</label>' +
          '<p class="fehler" role="alert"></p>' +
          '<div class="ps-fuss"><button type="button" class="knopf ps-nehmen" disabled>' +
          'Diesen Namen nehmen</button></div>') +
      '</div>';

    if (gesperrt) return;

    const vorschlaege = flaeche.querySelector('.ps-vorschlaege');
    const eigen = flaeche.querySelector('.ps-eigen input');
    const vorschau = flaeche.querySelector('.ps-vorschau');
    const ok = flaeche.querySelector('.ps-ok input');
    const nehmen = flaeche.querySelector('.ps-nehmen');
    const fehler = flaeche.querySelector('.fehler');
    let gewaehlt = '';

    function auffrischen() {
      vorschau.innerHTML = gewaehlt
        ? 'So heisst du: <b>' + PU.h(gewaehlt) + '</b><span class="ps-k">_' + PU.h(kennung) + '</span>'
        : 'Wähle einen Namen.';
      nehmen.disabled = !(gewaehlt && ok.checked);
    }

    function zeigen(liste) {
      vorschlaege.innerHTML = '';
      liste.forEach((name) => {
        const b = PU.el('button', 'ps-wuerfel', PU.h(name));
        b.type = 'button';
        b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', () => {
          vorschlaege.querySelectorAll('.ps-wuerfel').forEach(x => x.setAttribute('aria-pressed', 'false'));
          b.setAttribute('aria-pressed', 'true');
          if (eigen) eigen.value = '';
          gewaehlt = name;
          fehler.textContent = '';
          auffrischen();
        });
        vorschlaege.appendChild(b);
      });
    }

    zeigen(daten.vorschlaege || []);
    if (stand.teil) { gewaehlt = stand.teil; }
    auffrischen();

    flaeche.querySelector('.ps-wuerfeln').addEventListener('click', async () => {
      try {
        const j = await PU.ruf('pseudonym_wuerfeln', {});
        zeigen(j.vorschlaege || []);
      } catch (e) { fehler.textContent = e.message; }
    });

    if (eigen) eigen.addEventListener('input', () => {
      vorschlaege.querySelectorAll('.ps-wuerfel').forEach(x => x.setAttribute('aria-pressed', 'false'));
      gewaehlt = eigen.value.trim();
      fehler.textContent = '';
      auffrischen();
    });

    ok.addEventListener('change', auffrischen);

    nehmen.addEventListener('click', async () => {
      nehmen.disabled = true;
      fehler.textContent = '';
      try {
        await PU.ruf('pseudonym_setzen', { teil: gewaehlt, verstanden: ok.checked ? '1' : '' });
        // Neu laden: Der Name steht an vielen Stellen der Seite.
        location.reload();
      } catch (e) {
        fehler.textContent = e.message;
        auffrischen();
      }
    });
  };

  /** Beim Laden: Ist die Wahl offen, kommt sie vor allem anderen. */
  PU.pseudonymStart = function () {
    if (PU.pseudonym && PU.pseudonym.pflicht) PU.pseudonymFenster(true);
  };
})();
