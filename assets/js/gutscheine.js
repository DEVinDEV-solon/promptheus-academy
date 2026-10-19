/* PROMPTHEUS — Tokenbuch, Token-Gutscheine mit QR-Code, Gutschein einlösen.
 *
 * Drei Kästen im Cockpit (assets/js/abo.js ruft sie). Was erlaubt ist,
 * entscheidet der Server (srv/codes.php, srv/abo.php → pu_tokenbuch); hier
 * wird nur gezeichnet.
 *
 * **Der QR-Code trägt nur den Link zur Webseite, nicht den Gutschein-Code.**
 * Ein Code ist so viel wert wie sein Betrag; im Link stünde er in jedem
 * Server- und Statistikprotokoll der Webseite. Er steht deshalb lesbar auf dem
 * Kärtchen und wird in der Academy eingetippt.
 */
'use strict';

(function () {
  const zahl = n => new Intl.NumberFormat('de-DE').format(n);
  const datum = iso => {
    if (!iso) return '—';
    const t = String(iso).slice(0, 10).split('-');
    return t.length === 3 ? t[2] + '.' + t[1] + '.' + t[0] : iso;
  };
  const wort = {
    einzahlung: 'Kauf', kontingent: 'Kontingent', verbrauch: 'Verbrauch', storno: 'Storno',
    probe: 'Testzugang', gutschrift: 'Gutschrift',
    talent_ein: 'Erhalten', talent_aus: 'Gesendet',
    code_aus: 'Gutschein ausgestellt', code_ein: 'Gutschein eingelöst', code_zurueck: 'Gutschein zurück',
  };
  const fluss = ['talent_ein', 'talent_aus', 'code_aus', 'code_ein', 'code_zurueck'];

  function knopf(text, still) {
    const k = PU.el('button', 'knopf' + (still ? ' still' : ''), PU.h(text));
    k.type = 'button';
    return k;
  }

  function feld(typ, attr) {
    const e = document.createElement(typ === 'select' ? 'select' : 'input');
    if (typ !== 'select') e.type = typ;
    Object.entries(attr || {}).forEach(([k, v]) => e.setAttribute(k, v));
    return e;
  }

  function beschriftet(text, el) {
    const l = PU.el('label', 'gut-feld');
    l.appendChild(PU.el('span', 'klein', PU.h(text)));
    l.appendChild(el);
    return l;
  }

  // ================================================================ Tokenbuch
  /**
   * Jede Buchung mit Woher und Wohin. Die Liste wird nachgeladen: Sie ist bei
   * der Schulleitung die längste Tabelle im Cockpit, und wer nur nachsehen
   * will, wie viel noch da ist, braucht sie nicht.
   */
  PU.tokenbuchKasten = function (d) {
    const k = PU.el('section', 'cockpit-block');
    k.appendChild(PU.el('h2', '', 'Tokenbuch — woher, wohin'));
    k.appendChild(PU.el('p', 'hinweis',
      'Jede Buchung mit Absender und Empfänger. Namen stehen so da, wie die Konten in der ' +
      'Academy auftreten — mit Pseudonym, wo eines gewählt ist.' +
      (d.darf_tokenbuch_schule
        ? ' Unter „Ganze Schule" stehen dazu alle Überweisungen und Gutscheine zwischen Konten ' +
          'deiner Schule; fremder Verbrauch nicht.'
        : '')));

    const leiste = PU.el('div', 'gut-leiste');
    let umfang = 'eigen', nurFluss = false, alle = [], zeigen = 30;

    const art = feld('select', { 'aria-label': 'Welche Buchungen' });
    art.innerHTML = '<option value="alle">Alle Buchungen</option>' +
                    '<option value="fluss">Nur Senden und Gutscheine</option>';
    leiste.appendChild(art);

    if (d.darf_tokenbuch_schule) {
      const wo = feld('select', { 'aria-label': 'Wessen Buchungen' });
      wo.innerHTML = '<option value="eigen">Mein Konto</option><option value="schule">Ganze Schule</option>';
      wo.addEventListener('change', () => { umfang = wo.value; laden(); });
      leiste.appendChild(wo);
    }
    k.appendChild(leiste);

    const bereich = PU.el('div', 'tabellenrahmen');
    k.appendChild(bereich);
    const mehr = knopf('Mehr zeigen', true);
    mehr.hidden = true;
    k.appendChild(mehr);

    const malen = () => {
      const liste = nurFluss ? alle.filter(b => fluss.includes(b.art)) : alle;
      if (!liste.length) {
        bereich.innerHTML = '<p class="leer-hinweis">Noch nichts gebucht.</p>';
        mehr.hidden = true;
        return;
      }
      const name = p => PU.h(p.name) + (p.du ? ' <span class="klein">(du)</span>' : '') +
                        (p.ebene && !p.du ? ' <span class="klein">· ' + PU.h(p.ebene) + '</span>' : '');
      let html = '<table class="tokenbuch"><thead><tr><th>Wann</th><th>Was</th><th>Von</th>' +
                 '<th>An</th><th class="zahl">Token</th><th>Stand</th></tr></thead><tbody>';
      liste.slice(0, zeigen).forEach(b => {
        html += '<tr><td class="klein">' + PU.h(b.zeitpunkt.slice(0, 16)) + '</td>' +
          '<td>' + PU.h(wort[b.art] || b.art) +
            (b.wofuer ? '<br><span class="klein">' + PU.h(b.wofuer) + '</span>' : '') + '</td>' +
          '<td>' + name(b.von) + '</td><td>' + name(b.an) + '</td>' +
          '<td class="zahl ' + (b.tokens < 0 ? 'minus' : 'plus') + '">' +
            (b.tokens > 0 ? '+' : b.tokens < 0 ? '−' : '') + zahl(Math.abs(b.tokens)) + '</td>' +
          '<td class="klein">' + PU.h(b.status) + (b.bestaetigt ? '' : ' <b>offen</b>') + '</td></tr>';
      });
      bereich.innerHTML = html + '</tbody></table>';
      mehr.hidden = liste.length <= zeigen;
    };

    const laden = () => {
      bereich.innerHTML = '<p class="leer-hinweis">Lade Tokenbuch …</p>';
      zeigen = 30;
      PU.ruf('tokenbuch', { umfang }).then(j => { alle = j.buchungen; malen(); })
        .catch(e => { bereich.innerHTML = '<p class="fehler">' + PU.h(e.message) + '</p>'; });
    };
    art.addEventListener('change', () => { nurFluss = art.value === 'fluss'; malen(); });
    mehr.addEventListener('click', () => { zeigen += 50; malen(); });
    laden();
    return k;
  };

  // ======================================================= Gutschein einlösen
  PU.einloesenKasten = function () {
    const k = PU.el('section', 'cockpit-block');
    k.appendChild(PU.el('h2', '', 'Gutschein einlösen'));
    k.appendChild(PU.el('p', 'hinweis',
      'Hast du ein Kärtchen mit einem Token-Gutschein bekommen, etwa von der Schule oder einer ' +
      'Lehrkraft? Tippe den Code ein — gross oder klein, mit oder ohne Striche. Die Token kommen ' +
      'sofort auf dein Konto. Ein Code gilt 7 Tage und nur in der Academy, die ihn ausgestellt hat.'));

    const zeile = PU.el('div', 'talent-zeile');
    const ein = feld('text', { 'aria-label': 'Gutschein-Code', placeholder: 'ABCD-EFGH-JKLM',
                               maxlength: '20', autocomplete: 'off', spellcheck: 'false' });
    ein.classList.add('code-eingabe');
    const los = knopf('Einlösen');
    zeile.appendChild(ein);
    zeile.appendChild(los);
    k.appendChild(zeile);
    const bericht = PU.el('p', 'warum');
    k.appendChild(bericht);

    const einloesen = async () => {
      if (!ein.value.trim()) return;
      los.disabled = true;
      bericht.textContent = 'Löse ein …';
      try {
        const j = await PU.ruf('code_einloesen', { code: ein.value });
        PU.melden(zahl(j.eingeloest.tokens) + ' Token gutgeschrieben, von <b>' +
                  PU.h(j.eingeloest.von) + '</b>.', 'gut');
        PU.cockpitStand = j;
        PU.cockpitNeuMalen();
      } catch (e) {
        bericht.innerHTML = '<b style="color:var(--schlecht)">✕ ' + PU.h(e.message) + '</b>';
        los.disabled = false;
      }
    };
    los.addEventListener('click', einloesen);
    ein.addEventListener('keydown', e => { if (e.key === 'Enter') einloesen(); });
    return k;
  };

  // ======================================================= Gutscheine mit QR
  const qrCache = {};
  const qr = link => (qrCache[link] = qrCache[link] ||
    PU.qr.svg(link, { stufe: 'M', titel: 'QR-Code: ' + link }));

  PU.gutscheinKasten = function () {
    const k = PU.el('section', 'cockpit-block');
    k.appendChild(PU.el('h2', '', 'Token-Gutscheine mit QR-Code'));
    k.appendChild(PU.el('p', 'hinweis',
      'Für den Elternabend oder die Klasse: Du stellst Kärtchen mit je einem Code aus, druckst ' +
      'sie oder schickst den Text weiter. Der Betrag wird <b>beim Ausstellen reserviert</b> — ' +
      'jeder Gutschein ist gedeckt, solange er umläuft. Ein Code gilt <b>7 Tage</b>, danach ' +
      'funktioniert er nicht mehr und die Token kommen von selbst zu dir zurück. Eingelöst wird ' +
      'mit einem Konto in dieser Academy; wer eingelöst hat, steht danach hier und im Tokenbuch. ' +
      'Vorher widerrufen geht auch.'));
    k.appendChild(PU.el('p', 'hinweis',
      'Der QR-Code führt zur Webseite (für Eltern: Elternseite), wo steht, was die Academy ist und ' +
      'wie man sie bekommt. Der Code selbst steht nicht im QR-Code, nur lesbar daneben — er ist ' +
      'Geld wert und gehört nicht in die Protokolle einer Webseite. Erzeugt wird alles hier auf ' +
      'dem Rechner, ohne Dienst im Netz.'));

    const bereich = PU.el('div', 'talent-bereich');
    bereich.innerHTML = '<p class="leer-hinweis">Lade Gutscheine …</p>';
    k.appendChild(bereich);
    PU.ruf('codes_liste').then(j => gutscheinMalen(bereich, j, []))
      .catch(e => { bereich.innerHTML = '<p class="fehler">' + PU.h(e.message) + '</p>'; });
    return k;
  };

  function gutscheinMalen(bereich, j, neu) {
    bereich.innerHTML = '';

    // ---- Ausstellen
    const form = PU.el('div', 'gut-formular');
    const anzahl = feld('number', { min: '1', max: String(j.anzahl_max), step: '1', value: '10' });
    const tokens = feld('number', { min: String(j.min), max: String(j.max), step: '100', value: '5000' });
    const fuer = feld('select');
    j.ziele.forEach(z => {
      const o = document.createElement('option');
      o.value = z.ebene; o.textContent = z.anzeige;
      // Wofür die Karte gebaut ist: Eltern zur Academy holen.
      if (z.ebene === 'eltern') o.selected = true;
      fuer.appendChild(o);
    });
    const anlass = feld('text', { maxlength: '60', placeholder: 'zum Beispiel: Elternabend 7a' });
    const aus = knopf('Ausstellen');

    form.appendChild(beschriftet('Anzahl', anzahl));
    form.appendChild(beschriftet('Token je Gutschein', tokens));
    form.appendChild(beschriftet('Für', fuer));
    form.appendChild(beschriftet('Anlass (steht auf dem Kärtchen)', anlass));
    form.appendChild(aus);
    bereich.appendChild(form);

    const summe = PU.el('p', 'warum');
    const rechnen = () => {
      const n = parseInt(anzahl.value, 10) || 0, t = parseInt(tokens.value, 10) || 0;
      summe.innerHTML = zahl(n) + ' × ' + zahl(t) + ' = <b>' + zahl(n * t) + ' Token</b> werden reserviert. ' +
        (j.frei ? 'Dein Konto verbraucht ohne Grenze; gebucht wird trotzdem.'
                : 'Verfügbar: ' + zahl(Math.max(0, j.stand.rest)) + ' Token' +
                  (j.reserviert ? ', in offenen Gutscheinen reserviert: ' + zahl(j.reserviert) : '') + '.') +
        ' Jeder Code gilt ' + j.tage + ' Tage, danach verfällt er und die Token kommen zu dir zurück.';
    };
    [anzahl, tokens].forEach(e => e.addEventListener('input', rechnen));
    rechnen();
    bereich.appendChild(summe);
    const bericht = PU.el('p', 'warum');
    bereich.appendChild(bericht);

    aus.addEventListener('click', async () => {
      const n = parseInt(anzahl.value, 10), t = parseInt(tokens.value, 10);
      if (isNaN(n) || isNaN(t)) return;
      const z = fuer.options[fuer.selectedIndex];
      if (!confirm(n + ' Gutscheine à ' + zahl(t) + ' Token für ' + (z ? z.textContent : '') +
                   ' ausstellen?\n\n' + zahl(n * t) + ' Token werden dir jetzt abgebucht und ' +
                   'reserviert. Nicht eingelöste kommen bei Widerruf oder Ablauf zurück.')) return;
      aus.disabled = true;
      bericht.textContent = 'Stelle aus …';
      try {
        const r = await PU.ruf('codes_ausstellen', {
          anzahl: n, tokens: t, fuer: fuer.value, notiz: anlass.value, sicher: 'ja'
        });
        PU.melden(n + ' Gutscheine ausgestellt, ' + zahl(r.summe) + ' Token reserviert.', 'gut');
        gutscheinMalen(bereich, r, r.neu.map(c => c.id));
      } catch (e) {
        bericht.innerHTML = '<b style="color:var(--schlecht)">✕ ' + PU.h(e.message) + '</b>';
        aus.disabled = false;
      }
    });

    // ---- Vorschau des QR-Codes für die gewählte Zielgruppe
    if (j.ziele.length) {
      const vor = PU.el('div', 'gut-vorschau');
      const zeigen = () => {
        const link = j.links[fuer.value] || '';
        vor.innerHTML = '<div class="gut-qr">' + qr(link) + '</div>' +
          '<p class="klein">So sieht der QR-Code auf dem Kärtchen aus. Er führt zu<br><code>' +
          PU.h(link) + '</code></p>';
      };
      fuer.addEventListener('change', zeigen);
      zeigen();
      bereich.appendChild(vor);
    }

    // ---- Liste
    if (!j.codes.length) {
      bereich.appendChild(PU.el('p', 'leer-hinweis', 'Noch keine Gutscheine ausgestellt.'));
      return;
    }

    const offen = j.codes.filter(c => c.zustand === 'offen');
    const gewaehlt = new Set(neu.length ? neu : offen.map(c => c.id));

    const leiste = PU.el('div', 'gut-leiste');
    const drucken = knopf('Ausgewählte drucken');
    const kopieren = knopf('Text kopieren', true);
    const mail = PU.el('a', 'knopf still', 'Per Mail');
    const alleWahl = knopf('Alle offenen wählen', true);
    [drucken, kopieren, mail, alleWahl].forEach(e => leiste.appendChild(e));
    bereich.appendChild(leiste);

    const textfeld = document.createElement('textarea');
    textfeld.readOnly = true;
    textfeld.rows = 5;
    textfeld.className = 'gut-text';
    textfeld.setAttribute('aria-label', 'Text der ausgewählten Gutscheine');

    const rahmen = PU.el('div', 'tabellenrahmen');
    bereich.appendChild(rahmen);
    bereich.appendChild(textfeld);

    const zustand = c => c.zustand === 'eingeloest'
      ? '✓ eingelöst von <b>' + PU.h(c.eingeloest_von) + '</b> am ' + PU.h(datum(c.eingeloest_am))
      : c.zustand === 'zurueck'
        ? '↩ ' + PU.h(c.zurueck_grund) + ' am ' + PU.h(datum(c.zurueck_am))
        : 'offen bis ' + PU.h(datum(c.gueltig_bis));

    let html = '<table><thead><tr><th></th><th>Code</th><th class="zahl">Token</th><th>Für</th>' +
               '<th>Anlass</th><th>Zustand</th><th></th></tr></thead><tbody>';
    j.codes.forEach(c => {
      const o = c.zustand === 'offen';
      html += '<tr' + (neu.includes(c.id) ? ' class="gut-neu"' : '') + '>' +
        '<td>' + (o ? '<input type="checkbox" data-wahl="' + c.id + '"' +
                       (gewaehlt.has(c.id) ? ' checked' : '') + ' aria-label="Gutschein wählen">' : '') + '</td>' +
        '<td><code class="gut-code">' + PU.h(c.code) + '</code></td>' +
        '<td class="zahl">' + zahl(c.tokens) + '</td>' +
        '<td>' + PU.h(c.fuer_anzeige) + '</td>' +
        '<td class="klein">' + PU.h(c.notiz) + '</td>' +
        '<td class="klein">' + zustand(c) + '</td>' +
        '<td>' + (o ? '<button type="button" class="knopf still klein" data-widerruf="' + c.id + '">Widerrufen</button>' : '') + '</td>' +
        '</tr>';
    });
    rahmen.innerHTML = html + '</tbody></table>';

    const auswahl = () => offen.filter(c => gewaehlt.has(c.id));
    const kartenText = c =>
      'PROMPTHEUS Academy — Gutschein über ' + zahl(c.tokens) + ' Token\n' +
      'Code: ' + c.code + ' (gültig bis ' + datum(c.gueltig_bis) + ')\n' +
      (c.notiz ? c.notiz + '\n' : '') +
      'Einlösen: mit deinem Konto in der Academy anmelden, dann Cockpit → Gutschein einlösen.\n' +
      'Was die Academy ist und wie du sie bekommst: ' + c.link;

    const auffrischen = () => {
      const w = auswahl();
      textfeld.value = w.map(kartenText).join('\n\n');
      drucken.disabled = kopieren.disabled = !w.length;
      const body = textfeld.value;
      // Ein Mail-Link trägt den Text in der Adresse; über rund 1.800 Zeichen
      // schneiden ihn manche Mailprogramme ab. Dann lieber drucken oder kopieren.
      const zuLang = body.length > 1800;
      mail.href = !w.length || zuLang ? '#' : 'mailto:?subject=' +
        encodeURIComponent('Gutschein für die PROMPTHEUS Academy') + '&body=' + encodeURIComponent(body);
      mail.classList.toggle('aus', !w.length || zuLang);
      mail.title = zuLang ? 'Zu viele Gutscheine für eine Mail — drucken oder Text kopieren.' : '';
      bericht.textContent = w.length ? w.length + ' Gutscheine ausgewählt.' : '';
    };

    rahmen.addEventListener('change', e => {
      const id = parseInt(e.target.getAttribute('data-wahl'), 10);
      if (!id) return;
      if (e.target.checked) gewaehlt.add(id); else gewaehlt.delete(id);
      auffrischen();
    });
    rahmen.addEventListener('click', async e => {
      const id = parseInt(e.target.getAttribute('data-widerruf'), 10);
      if (!id) return;
      const c = j.codes.find(x => x.id === id);
      if (!confirm('Gutschein ' + c.code + ' widerrufen?\n\nEr wird ungültig, die ' + zahl(c.tokens) +
                   ' Token kommen auf dein Konto zurück.')) return;
      try {
        const r = await PU.ruf('code_widerrufen', { id });
        PU.melden('Gutschein widerrufen, ' + zahl(c.tokens) + ' Token zurückgebucht.', 'gut');
        gutscheinMalen(bereich, r, []);
      } catch (f) {
        bericht.innerHTML = '<b style="color:var(--schlecht)">✕ ' + PU.h(f.message) + '</b>';
      }
    });
    alleWahl.addEventListener('click', () => {
      offen.forEach(c => gewaehlt.add(c.id));
      rahmen.querySelectorAll('[data-wahl]').forEach(x => { x.checked = true; });
      auffrischen();
    });
    mail.addEventListener('click', e => { if (mail.classList.contains('aus')) e.preventDefault(); });
    kopieren.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(textfeld.value);
        PU.melden('Text kopiert.', 'gut');
      } catch (f) {
        // Ohne Zugriff auf die Zwischenablage: markieren, Strg+C bleibt.
        textfeld.focus();
        textfeld.select();
        bericht.textContent = 'Der Text ist markiert — mit Strg+C kopieren.';
      }
    });
    drucken.addEventListener('click', () => druckbogen(auswahl()));
    auffrischen();
  }

  // ================================================================ Druck
  /**
   * A4 mit zehn Kärtchen je Seite (2 × 5), Schnittlinien gestrichelt.
   *
   * Gedruckt wird aus derselben Seite heraus: Der Bogen wird angehängt, der
   * Rest der Academy per `@media print` ausgeblendet, danach ist er wieder weg.
   * Ein eigenes Fenster bräuchte eine zweite Seite mit eigenem Stil.
   */
  function druckbogen(liste) {
    if (!liste.length) return;
    const alt = document.getElementById('druck-bogen');
    if (alt) alt.remove();
    const bogen = PU.el('div', '');
    bogen.id = 'druck-bogen';

    for (let i = 0; i < liste.length; i += 10) {
      const seite = PU.el('div', 'druck-seite');
      liste.slice(i, i + 10).forEach(c => {
        const karte = PU.el('div', 'druck-karte');
        karte.innerHTML =
          '<div class="druck-qr">' + qr(c.link) + '</div>' +
          '<div class="druck-text">' +
            '<div class="druck-marke">PROMPTHEUS ACADEMY</div>' +
            '<div class="druck-titel">Gutschein über ' + zahl(c.tokens) + ' Token</div>' +
            (c.notiz ? '<div class="druck-anlass">' + PU.h(c.notiz) + '</div>' : '') +
            '<div class="druck-code-titel">Dein Code</div>' +
            '<div class="druck-code">' + PU.h(c.code) + '</div>' +
            '<div class="druck-frist">Gültig bis ' + PU.h(datum(c.gueltig_bis)) + ' — danach verfällt der Code.</div>' +
            '<div class="druck-klein">Einlösen: in der Academy mit deinem Konto anmelden, ' +
              'dann Cockpit → Gutschein einlösen.</div>' +
            '<div class="druck-klein">QR-Code scannen: was die Academy ist und wie du sie bekommst.</div>' +
          '</div>';
        seite.appendChild(karte);
      });
      bogen.appendChild(seite);
    }

    document.body.appendChild(bogen);
    document.body.classList.add('druckt-gutscheine');
    const weg = () => {
      document.body.classList.remove('druckt-gutscheine');
      bogen.remove();
      window.removeEventListener('afterprint', weg);
    };
    window.addEventListener('afterprint', weg);
    window.print();
  }
})();
