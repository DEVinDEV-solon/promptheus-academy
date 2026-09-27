/* PROMPTHEUS — Updates in der Oberfläche.
 *
 * Zwei Stellen:
 *   1. Die Notiz unten links, direkt über „Abmelden“ — nur für Ebene 1
 *      (die Datei wird nur geladen, wenn das Recht aktualisierung.verwalten
 *      besteht). „Neue Fassung · Was neu ist · Installieren ×“.
 *   2. Einstellungen → Wartung → Abschnitt „Aktualisierung“.
 *
 * Nachgefragt wird beim Start und danach stündlich; der Server fragt beim
 * Update-Server aber nur, wenn die eingestellten Stunden (Vorgabe 24) um
 * sind. Die Antwort kommt deshalb fast immer sofort aus dem gespeicherten Stand.
 */
'use strict';

window.PU = window.PU || {};

(function () {
  const TAKT = 60 * 60 * 1000;
  let stand = null;

  function notiz() { return document.getElementById('akt-notiz'); }

  /* ------------------------------------------------------------ Notiz */
  function zeichnen() {
    const n = notiz();
    if (!n) return;
    const a = stand && stand.angebot;
    const sichtbar = !!(a && !stand.ausgeblendet);
    const leisteKnopf = document.getElementById('knopf-leiste');
    if (leisteKnopf) leisteKnopf.classList.toggle('akt-punkt', sichtbar);
    if (!sichtbar) { n.hidden = true; n.innerHTML = ''; return; }

    const bereit = stand.bereit === a.fassung;
    n.innerHTML =
      '<div class="akt-kopf">' +
        '<b>Neue Fassung ' + PU.h(a.fassung) + '</b>' +
        '<button type="button" class="akt-zu" aria-label="Notiz ausblenden" title="Ausblenden">×</button>' +
      '</div>' +
      (a.wichtig ? '<p class="akt-wichtig">Sicherheits-Update. Bitte bald installieren.</p>' : '') +
      '<p class="akt-klein">Installiert: ' + PU.h(stand.fassung) + '</p>' +
      (a.hinweise ? '<details class="akt-neu"><summary>Was neu ist</summary><div>' + PU.h(a.hinweise) + '</div></details>' : '') +
      '<button type="button" class="knopf akt-los">' + (bereit ? 'Neu starten und installieren' : 'Installieren') + '</button>';
    n.hidden = false;

    n.querySelector('.akt-zu').addEventListener('click', async () => {
      n.hidden = true;
      if (leisteKnopf) leisteKnopf.classList.remove('akt-punkt');
      try { await PU.ruf('update_ausblenden', { fassung: a.fassung }); } catch (e) { /* bleibt bis zum nächsten Laden weg */ }
      if (stand) stand.ausgeblendet = true;
    });
    n.querySelector('.akt-los').addEventListener('click', (ev) => installieren(ev.currentTarget));
  }

  /* ------------------------------------------------------------ Ablauf */
  async function installieren(knopf) {
    if (knopf) knopf.disabled = true;
    try {
      if (!stand || stand.bereit !== (stand.angebot && stand.angebot.fassung)) {
        PU.melden('Die neue Fassung wird geladen und geprüft …', 'gold');
        const j = await PU.ruf('update_laden');
        stand = j;
        if (!j.geladen) { PU.melden(PU.h(j.meldung), 'schlecht'); zeichnen(); wartungNeu(); return; }
      }
      await neustarten('update_neustart');
    } catch (e) {
      PU.melden(PU.h(e.message), 'schlecht');
    } finally {
      if (knopf) knopf.disabled = false;
    }
  }

  async function neustarten(aktion) {
    const j = await PU.ruf(aktion);
    if (!j.neustart) { PU.melden(PU.h(j.meldung), 'warnung'); return; }
    warten();
  }

  /** Nach dem Neustart: fragen, bis der Server wieder antwortet, dann neu laden. */
  function warten() {
    const schleier = document.createElement('div');
    schleier.className = 'akt-schleier';
    schleier.setAttribute('role', 'alert');
    schleier.innerHTML = '<div><b>Die Academy startet neu.</b><p>Die Programmdateien werden getauscht. ' +
      'Das dauert meist unter einer Minute. Bitte das schwarze Fenster nicht schliessen.</p></div>';
    document.body.appendChild(schleier);
    const bis = Date.now() + 180000;
    const versuch = async () => {
      try {
        const r = await fetch('api.php', { method: 'POST', headers: { 'Content-Type': 'application/json' },
                                           body: JSON.stringify({ aktion: 'zustand' }), cache: 'no-store' });
        if (r.ok) { location.reload(); return; }
      } catch (e) { /* Server noch weg */ }
      if (Date.now() < bis) setTimeout(versuch, 1500);
      else schleier.querySelector('p').textContent =
        'Der Server antwortet noch nicht. Bitte im schwarzen Fenster nachsehen und die Seite dann neu laden.';
    };
    setTimeout(versuch, 2500);
  }

  async function holen(aktion) {
    try {
      stand = await PU.ruf(aktion || 'update_stand');
      zeichnen();
      wartungNeu();
    } catch (e) { /* still: die Notiz ist eine Zugabe, kein Muss */ }
    return stand;
  }

  PU.aktStart = function () {
    if (!notiz()) return;
    holen();
    setInterval(holen, TAKT);
  };

  /* ------------------------------------------------------------ Wartung */
  let wartungZiel = null;

  function wartungNeu() { if (wartungZiel && wartungZiel.isConnected) PU.aktWartung(wartungZiel, true); }

  function zeit(t) { return t ? t.replace('T', ' ').replace('Z', ' UTC') : 'noch nie'; }

  PU.aktWartung = async function (ziel, schonGeholt) {
    wartungZiel = ziel;
    if (!schonGeholt) {
      ziel.innerHTML = '<p class="hinweis">Stand wird gelesen …</p>';
      await holen();
      if (!stand) { ziel.innerHTML = '<p class="fehler">Der Update-Stand liess sich nicht lesen.</p>'; return; }
    }
    const s = stand;
    const a = s.angebot;
    ziel.innerHTML = '';
    ziel.appendChild(PU.el('h4', '', 'Aktualisierung'));

    const info = PU.el('p', 'hinweis');
    info.innerHTML = 'Installiert: <b>' + PU.h(s.fassung) + '</b> · Kanal ' + PU.h(s.kanal) +
      ' · zuletzt nachgesehen: ' + PU.h(zeit(s.geprueft_am)) +
      (s.weg ? ' (' + (s.weg === 'relay' ? 'über den Relay, registriert' : 'anonym') + ')' : '');
    ziel.appendChild(info);
    if (!s.schluessel) {
      ziel.appendChild(PU.el('p', 'hinweis', 'In dieser Fassung ist noch kein Update-Schlüssel eingebaut. ' +
        'Neue Fassungen werden erst erkannt, wenn er es ist.'));
    }
    if (s.fehler) ziel.appendChild(PU.el('p', 'fehler', PU.h(s.fehler)));
    ziel.appendChild(PU.el('p', '', a
      ? 'Neue Fassung ' + PU.h(a.fassung) + (a.wichtig ? ' (Sicherheits-Update)' : '') + ' ist verfügbar' +
        (s.bereit === a.fassung ? ' und bereits geladen.' : '.')
      : 'Diese Fassung ist aktuell.'));

    const reihe = PU.el('div', 'einst-gruppe');
    const knopf = (text, still, fn) => {
      const k = PU.el('button', 'knopf' + (still ? ' still' : ''), text);
      k.type = 'button';
      k.addEventListener('click', async () => {
        k.disabled = true;
        try { await fn(); } catch (e) { PU.melden(PU.h(e.message), 'schlecht'); }
        finally { k.disabled = false; }
      });
      reihe.appendChild(k);
    };
    knopf('Jetzt nach Updates suchen', true, async () => {
      await holen('update_suchen');
      PU.melden(stand && stand.angebot ? 'Neue Fassung ' + PU.h(stand.angebot.fassung) + ' gefunden.'
                                       : (stand && stand.fehler ? PU.h(stand.fehler) : 'Keine neuere Fassung.'),
                stand && stand.angebot ? 'gold' : '');
    });
    if (a && s.bereit !== a.fassung) knopf('Laden und prüfen', true, async () => {
      const j = await PU.ruf('update_laden');
      stand = j; zeichnen(); wartungNeu();
      PU.melden(PU.h(j.meldung), j.geladen ? 'gut' : 'schlecht');
    });
    if (a && s.bereit === a.fassung) knopf('Neu starten und installieren', false, () => neustarten('update_neustart'));
    if (s.sicherungen && s.sicherungen.length) knopf('Vorige Fassung wiederherstellen', true, async () => {
      const letzte = s.sicherungen[0];
      if (!confirm('Zurück auf ' + (letzte.von || 'den Stand vor dem Update') + '? Die Academy startet dazu neu. ' +
                   'Lernstände bleiben erhalten.')) return;
      await neustarten('update_zurueck');
    });
    ziel.appendChild(reihe);

    if (!s.neustart) {
      ziel.appendChild(PU.el('p', 'hinweis', 'Diese Academy wurde nicht über promptheus-start.bat gestartet. ' +
        'Das Einspielen geschieht dann beim nächsten Start über die bat.'));
    }

    // Automatische Prüfung
    const auto = PU.el('div', 'einst-gruppe');
    auto.innerHTML = '<label><input type="checkbox" id="akt-auto"' + (s.pruefen_an ? ' checked' : '') + '> ' +
      'Automatisch nachsehen, alle</label> <input type="number" id="akt-stunden" min="1" max="168" value="' +
      (s.stunden || 24) + '" class="akt-stunden"> Stunden';
    ziel.appendChild(auto);
    const speichern = async () => {
      try {
        stand = await PU.ruf('update_einstellen', {
          pruefen: document.getElementById('akt-auto').checked ? 'an' : 'aus',
          stunden: String(document.getElementById('akt-stunden').value || '24') });
        PU.melden('Gespeichert.', 'gut');
      } catch (e) { PU.melden(PU.h(e.message), 'schlecht'); }
    };
    auto.querySelector('#akt-auto').addEventListener('change', speichern);
    auto.querySelector('#akt-stunden').addEventListener('change', speichern);
    ziel.appendChild(PU.el('p', 'hinweis', 'Beim Nachsehen gehen nur die installierte Fassung und der Kanal an ' +
      'promptheus-academy.de (registrierte Academies zusätzlich ihre Kennung ohne Namen). ' +
      'Geladen wird nur, was mit dem eingebauten Schlüssel unterschrieben ist.'));
  };
})();
