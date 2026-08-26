/* PROMPTHEUS — Aufgaben zeichnen und Antworten einsammeln.
 *
 * Je Typ ein Paar: `zeichnen(feld, a)` baut die Bedienung, `antwort(feld, a)`
 * liest sie aus. Getrennt, damit derselbe Typ in der Lektion und in der
 * Prüfung ohne Zweig funktioniert — der Unterschied zwischen beiden ist der
 * Fuss (Hinweise, Musterlösung), nicht die Aufgabe.
 *
 * Was hier NICHT steht: die Lösung. Sie hat den Server nie verlassen. Was
 * "richtig" ist, erfährt diese Datei erst aus der Antwort auf `abgeben`.
 */
'use strict';

PU.TYPEN = {};

/* ============================================================ Auswahl */
/** Optionen als anklickbare Kästen. Mehrfach- oder Einfachauswahl. */
function auswahlZeichnen(feld, a, mehrfach) {
  const liste = PU.el('div', 'optionen');
  (a.optionen || []).forEach((opt, i) => {
    const kennung = 'o_' + a.id + '_' + i;
    const label = PU.el('label', 'option');
    label.innerHTML =
      '<input type="' + (mehrfach ? 'checkbox' : 'radio') + '" name="' + PU.h(a.id) +
      '" id="' + kennung + '" value="' + PU.h(opt) + '">' +
      '<span>' + PU.h(opt) + '</span>';
    label.querySelector('input').addEventListener('change', () => {
      if (!mehrfach) liste.querySelectorAll('.option').forEach(o => o.classList.remove('gewaehlt'));
      label.classList.toggle('gewaehlt', label.querySelector('input').checked);
    });
    liste.appendChild(label);
  });
  feld.appendChild(liste);
}

function auswahlAntwort(feld) {
  return Array.from(feld.querySelectorAll('.optionen input:checked')).map(i => i.value);
}

PU.TYPEN.denkaufgabe = {
  // Mehrfachauswahl, wenn die Aufgabe es sagt. Vorgabe ist Einfachauswahl:
  // Kästchen statt Punkte verraten sonst, dass mehrere Antworten stimmen.
  zeichnen: (f, a) => auswahlZeichnen(f, a, a.mehrfach === true),
  antwort:  (f) => auswahlAntwort(f)
};

PU.TYPEN.raeumlich = {
  zeichnen: (f, a) => {
    if (a.diagramm) {
      const pre = PU.el('pre', 'code');
      pre.appendChild(PU.el('code', '', PU.h(a.diagramm)));
      f.appendChild(pre);
    }
    auswahlZeichnen(f, a, a.mehrfach === true);
  },
  antwort: (f) => auswahlAntwort(f)
};

/* ============================================================ Bausteine */
/**
 * Bausteine in eine Ablage bringen.
 *
 * Zwei Wege, absichtlich: ziehen UND anklicken. Ziehen geht auf einem
 * Tablet schlecht und mit der Tastatur gar nicht — eine Academy, die Zwölfjährige
 * einlaedt, darf keine Aufgabe haben, die nur mit der Maus lösbar ist.
 */
function bausteineZeichnen(feld, a, geordnet) {
  const vorrat = PU.el('div', 'bausteine');
  const ablage = PU.el('div', 'ablage' + (geordnet ? ' geordnet' : ''));
  ablage.setAttribute('role', 'list');

  (a.bausteine || []).forEach(text => {
    const b = PU.el('span', 'baustein', PU.h(text));
    b.draggable = true;
    b.tabIndex = 0;
    b.dataset.wert = text;
    b.setAttribute('role', 'button');
    b.setAttribute('aria-label', text + ' — hinzufügen');

    const schieben = () => {
      (b.parentElement === ablage ? vorrat : ablage).appendChild(b);
      b.setAttribute('aria-label', text + (b.parentElement === ablage ? ' — entfernen' : ' — hinzufügen'));
    };
    b.addEventListener('click', schieben);
    b.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); schieben(); }
    });

    b.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', text);
      b.classList.add('zieht');
    });
    b.addEventListener('dragend', () => b.classList.remove('zieht'));

    vorrat.appendChild(b);
  });

  [vorrat, ablage].forEach(zone => {
    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('ueber'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('ueber'));
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('ueber');
      const wert = e.dataTransfer.getData('text/plain');
      const el = feld.querySelector('.baustein[data-wert="' + CSS.escape(wert) + '"]');
      if (!el) return;
      // Vor dem Element ablegen, ueber dem losgelassen wurde — sonst liesse
      // sich die Reihenfolge nur durch Herausnehmen und Neuanhaengen ändern.
      const ziel = e.target.closest('.baustein');
      if (ziel && ziel !== el && ziel.parentElement === zone) zone.insertBefore(el, ziel);
      else zone.appendChild(el);
    });
  });

  feld.appendChild(ablage);
  feld.appendChild(PU.el('p', 'klein', geordnet
    ? 'Ziehe die Bausteine in die Ablage — oder klicke sie an. Die Reihenfolge zählt.'
    : 'Ziehe die passenden Bausteine in die Ablage — oder klicke sie an.'));
  feld.appendChild(vorrat);
}

function bausteineAntwort(feld) {
  return Array.from(feld.querySelectorAll('.ablage .baustein')).map(b => b.dataset.wert);
}

PU.TYPEN.schiebe  = { zeichnen: (f, a) => bausteineZeichnen(f, a, true),  antwort: bausteineAntwort };
PU.TYPEN.plugplay = { zeichnen: (f, a) => bausteineZeichnen(f, a, false), antwort: bausteineAntwort };

/* ============================================================ Zuordnung */
PU.TYPEN.uebereinstimmung = {
  zeichnen: (feld, a) => {
    const gitter = PU.el('div', 'paare');
    (a.links || []).forEach((links, i) => {
      const zeile = PU.el('div', 'paar');
      zeile.appendChild(PU.el('div', 'paar-links', PU.h(links)));
      zeile.appendChild(PU.el('div', 'paar-pfeil', '→'));

      const wahl = document.createElement('select');
      wahl.dataset.links = links;
      wahl.setAttribute('aria-label', 'Zuordnung für ' + links);
      wahl.innerHTML = '<option value="">— wählen —</option>' +
        (a.rechts || []).map(r => '<option value="' + PU.h(r) + '">' + PU.h(r) + '</option>').join('');
      zeile.appendChild(wahl);
      gitter.appendChild(zeile);
    });
    feld.appendChild(gitter);
  },
  antwort: (feld) => {
    const aus = {};
    feld.querySelectorAll('.paar select').forEach(s => { if (s.value) aus[s.dataset.links] = s.value; });
    return aus;
  }
};

/* ============================================================ Zahl / Text */
function textfeldZeichnen(feld, a, mehrzeilig, platzhalter) {
  const el = document.createElement(mehrzeilig ? 'textarea' : 'input');
  el.className = 'antwortfeld';
  el.placeholder = platzhalter || '';
  el.setAttribute('aria-label', 'Deine Antwort');
  if (!mehrzeilig) el.type = 'text';
  feld.appendChild(el);
}

function textfeldAntwort(feld) {
  const el = feld.querySelector('.antwortfeld');
  return el ? el.value : '';
}

PU.TYPEN.mathe = {
  zeichnen: (f, a) => {
    textfeldZeichnen(f, a, false, a.einheit ? ('Zahl in ' + a.einheit) : 'Deine Zahl');
    if (a.einheit) f.appendChild(PU.el('p', 'klein', 'Einheit: ' + PU.h(a.einheit)));
  },
  antwort: textfeldAntwort
};

PU.TYPEN.technisch = { zeichnen: (f, a) => textfeldZeichnen(f, a, false, 'Dein Ergebnis'), antwort: textfeldAntwort };
PU.TYPEN.krypto    = { zeichnen: (f, a) => textfeldZeichnen(f, a, false, 'Dein Ergebnis'), antwort: textfeldAntwort };

PU.TYPEN.planung = {
  zeichnen: (feld, a) => {
    textfeldZeichnen(feld, a, true, 'Schreibe deine Antwort …');
    const zaehler = PU.el('p', 'klein', '0 Wörter');
    feld.appendChild(zaehler);
    feld.querySelector('.antwortfeld').addEventListener('input', e => {
      const n = e.target.value.trim().split(/\s+/).filter(Boolean).length;
      zaehler.textContent = n + (n === 1 ? ' Wort' : ' Wörter');
    });
  },
  antwort: textfeldAntwort
};

/* ============================================================ Secret */
PU.TYPEN.secret = {
  zeichnen: (feld, a) => {
    feld.appendChild(PU.el('div', 'dump', PU.h(a.dump)));
    feld.appendChild(PU.el('p', 'klein',
      'Gesucht ist eine Zeichenkette im Format <code>PROMPTHEUS{…}</code>. ' +
      'Alle Geheimnisse in dieser Academy sind Attrappen — echte Schlüssel kommen hier nie vor.'));
    textfeldZeichnen(feld, a, false, 'PROMPTHEUS{…}');
  },
  antwort: textfeldAntwort
};

/* ============================================================ Sicherheit */
PU.TYPEN.sicherheit = {
  zeichnen: (feld, a) => {
    feld.appendChild(PU.el('p', 'klein', 'Klicke die Zeilen an, die eine Schwachstelle enthalten.'));
    const kasten = PU.el('div', 'codezeilen');
    String(a.code || '').split('\n').forEach((text, i) => {
      const zeile = PU.el('div', 'codezeile');
      zeile.dataset.nr = String(i + 1);
      zeile.tabIndex = 0;
      zeile.setAttribute('role', 'checkbox');
      zeile.setAttribute('aria-checked', 'false');
      zeile.setAttribute('aria-label', 'Zeile ' + (i + 1) + ': ' + text);
      zeile.innerHTML = '<span class="nr">' + (i + 1) + '</span><span class="txt">' + PU.h(text) + '</span>';

      const um = () => {
        zeile.classList.toggle('gewaehlt');
        zeile.setAttribute('aria-checked', zeile.classList.contains('gewaehlt') ? 'true' : 'false');
      };
      zeile.addEventListener('click', um);
      zeile.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); um(); }
      });
      kasten.appendChild(zeile);
    });
    feld.appendChild(kasten);
  },
  antwort: (feld) => Array.from(feld.querySelectorAll('.codezeile.gewaehlt')).map(z => Number(z.dataset.nr))
};

/* ============================================================ Multitask */
PU.TYPEN.multitask = {
  zeichnen: (feld, a) => {
    (a.schritte || []).forEach((s, i) => {
      const block = PU.el('div', 'multi-schritt');
      block.dataset.schritt = String(i);
      block.style.margin = '1.2rem 0';
      block.appendChild(PU.el('h5', '', 'Schritt ' + (i + 1) +
        (s.titel ? ' — ' + PU.h(s.titel) : '') +
        ' <span class="aufgabe-punkte">' + (s.punkte || 0) + ' P</span>'));
      if (s.frage) block.appendChild(PU.el('p', '', PU.h(s.frage)));

      const inner = PU.el('div', 'multi-feld');
      const bau = PU.TYPEN[s.typ];
      if (bau) bau.zeichnen(inner, Object.assign({}, s, { id: a.id + '_' + i }));
      block.appendChild(inner);
      feld.appendChild(block);
    });
  },
  antwort: (feld, a) => {
    const aus = [];
    (a.schritte || []).forEach((s, i) => {
      const block = feld.querySelector('.multi-schritt[data-schritt="' + i + '"] .multi-feld');
      const bau = PU.TYPEN[s.typ];
      aus.push(block && bau ? bau.antwort(block, s) : null);
    });
    return aus;
  }
};

/* ============================================================ Rahmen */
/**
 * Zeichnet eine vollständige Aufgabe samt Fuss.
 *
 * @param {Object} opt  {pruefung: bool}  In der Prüfung gibt es keine
 *                      Hinweise, keine Musterlösung und keine Einzelabgabe —
 *                      das ist der ganze Unterschied.
 */
/**
 * Was im Tokenicer stehen soll, wenn er von einer Aufgabe aus aufgeht.
 *
 * Die Frage, und dazu die Bausteine oder Optionen der Aufgabe — bei einer
 * Aufgabe über Tokenlängen sind genau die Wörter interessant, zwischen denen
 * gewählt werden soll. Die Lösung ist nicht dabei: die kommt gar nicht erst
 * in den Browser (siehe pu_aufgabe_oeffentlich).
 */
function tokenicerText(a) {
  const teile = [a.frage || ''];

  if (Array.isArray(a.optionen))   teile.push(a.optionen.join('\n'));
  if (Array.isArray(a.bausteine))  teile.push(a.bausteine.join('\n'));
  if (Array.isArray(a.links))      teile.push(a.links.join('\n'));

  return teile.filter(t => t && String(t).trim() !== '').join('\n');
}

PU.aufgabeZeichnen = function (ziel, a, opt) {
  opt = opt || {};
  const bau = PU.TYPEN[a.typ];

  const kasten = PU.el('div', 'aufgabe');
  kasten.dataset.aufgabe = a.id;
  if (a.stand && a.stand.richtig) kasten.classList.add('gelöst');

  const kopf = PU.el('div', 'aufgabe-kopf');
  kopf.innerHTML =
    '<h4>' + PU.h(a.titel) + '</h4>' +
    '<span class="aufgabe-punkte">' + a.punkte + ' Punkte</span>';
  kasten.appendChild(kopf);
  kasten.appendChild(PU.el('div', 'aufgabe-marke', PU.h(a.typ) +
    (a.stand && a.stand.richtig ? ' · bereits gelöst' : '')));

  if (a.frage) {
    const frage = PU.el('p', 'aufgabe-frage', PU.h(a.frage));

    // Der Tokenicer steht an der Frage, nicht nur im Menü. Wer hier wissen
    // will, in wie viele Stücke ein Wort zerfällt, würde sonst die Ansicht
    // wechseln, dort tippen und den Weg zurücksuchen — und die halb
    // geschriebene Antwort bliebe unterwegs liegen. Deshalb ein Fenster:
    // aufmachen, nachsehen, zumachen, weiterschreiben.
    if (PU.tokenicerModal && PU.darf('tokenicer.nutzen')) {
      const k = PU.el('button', 'tok-ruf', '🔤 Tokenicer');
      k.type  = 'button';
      k.title = 'Diesen Text zerlegen lassen — das Fenster legt sich über die Aufgabe.';
      k.addEventListener('click', () => PU.tokenicerModal(tokenicerText(a)));
      frage.appendChild(document.createTextNode(' '));
      frage.appendChild(k);
    }

    // Der Tutor zur Aufgabe. **Er nennt die Lösung nicht** — sie steht gar
    // nicht in dem, was der Server ihm gibt (pu_aufgabe_oeffentlich siebt
    // sie heraus). Was er kann, ist zeigen, woran man eine Möglichkeit
    // ausschliesst. Nach der richtigen Antwort fällt die Sperre weg, dann
    // ist es Vertiefung statt Verrat.
    if (PU.tutorPanelOeffnen && PU.tutorBereit && PU.darf('tutor.fragen') && !opt.pruefung) {
      const geloest = !!(a.stand && a.stand.richtig);
      const t = PU.el('button', 'tok-ruf tutor-ruf',
                      geloest ? '💬 Vertiefen' : '💬 Lösungsweg');
      t.type  = 'button';
      t.title = geloest
        ? 'Über diese Aufgabe sprechen — jetzt darf auch die Lösung vorkommen.'
        : 'Den Weg zeigen lassen, nicht die Lösung. Öffnet sich rechts daneben.';
      t.addEventListener('click', () => PU.tutorPanelOeffnen({
        aufgabe: a.id, aufgabeTitel: a.titel,
        lektion: opt.lektion || '', agent: 'athena'
      }));
      frage.appendChild(document.createTextNode(' '));
      frage.appendChild(t);
    }

    kasten.appendChild(frage);
  }

  const feld = PU.el('div', 'aufgabe-feld');
  if (bau) bau.zeichnen(feld, a);
  else feld.appendChild(PU.el('p', 'fehler', 'Unbekannter Aufgabentyp: ' + PU.h(a.typ)));
  kasten.appendChild(feld);

  const ergebnis = PU.el('div', 'aufgabe-ergebnis');
  const start = Date.now();
  let hinweise = 0;
  let loesungGesehen = false;

  // Die laufende Zeit. Sie zählt ohnehin — für den Tempobonus —, aber sie
  // steht nur da, wenn jemand sie sehen will: manche denken mit Uhr ruhiger,
  // andere hetzen. Deshalb Einstellungssache und nicht Vorgabe.
  let uhr = null;
  if (!opt.pruefung && PU.eJa('zeit_anzeigen')) {
    const anzeige = PU.el('span', 'aufgabe-zeit klein', '0:00');
    anzeige.style.marginLeft = '.6rem';
    kopf.querySelector('.aufgabe-punkte').appendChild(anzeige);
    uhr = setInterval(() => {
      const s = Math.round((Date.now() - start) / 1000);
      anzeige.textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
    }, 1000);
  }

  // Wer nicht lernen darf, sieht den Stoff, aber keine Knöpfe darunter. Das
  // ist der Eltern-Zugang: mitlesen ja, für das Kind abgeben nein. Ohne diese
  // Abfrage stünde dort ein Knopf, der nur eine abschlägige Antwort holt.
  if (!opt.pruefung && !PU.darf('lernen.ausfuehren')) {
    kasten.appendChild(PU.el('p', 'klein',
      'Mitlesen ja, abgeben nein — diese Aufgabe gehört dem Lernenden.'));
    ziel.appendChild(kasten);
    return { kasten: kasten, antwort: () => (bau ? bau.antwort(feld, a) : null) };
  }

  if (!opt.pruefung) {
    const fuss = PU.el('div', 'aufgabe-fuss');

    const abgeben = PU.el('button', 'knopf', 'Abgeben');
    fuss.appendChild(abgeben);

    const rechts = PU.el('div', 'rechts');
    let hinweisKnopf = null;
    if (a.hinweis_anzahl > 0) {
      hinweisKnopf = PU.el('button', 'knopf still',
        'Hinweis (−' + (a.hinweis_kosten[0] || 0) + ')');
      rechts.appendChild(hinweisKnopf);
    }
    const loesungKnopf = PU.el('button', 'knopf still', 'Lösung zeigen');
    rechts.appendChild(loesungKnopf);
    fuss.appendChild(rechts);
    kasten.appendChild(fuss);
    kasten.appendChild(ergebnis);

    if (hinweisKnopf) hinweisKnopf.addEventListener('click', async () => {
      // Die Rückfrage lässt sich abschalten (Einstellungen › Lernen). Wer sie
      // an hat, wird vor dem Punktabzug gefragt — ein Hinweis, den man aus
      // Versehen kauft, ärgert mehr, als er hilft.
      if (PU.eJa('hinweis_fragen')) {
        const kostet = a.hinweis_kosten[hinweise] || 0;
        if (!confirm('Hinweis ' + (hinweise + 1) + ' anzeigen? Das kostet ' + kostet + ' Punkte.')) return;
      }
      try {
        const j = await PU.ruf('hinweis', { id: a.id, nr: hinweise });
        hinweise++;
        const k = PU.el('div', 'hinweis-kasten',
          '<b>Hinweis ' + hinweises(hinweise) + '</b> ' + PU.h(j.text) +
          ' <span class="klein">(−' + j.kostet + ' Punkte)</span>');
        feld.parentElement.insertBefore(k, feld.nextSibling);
        if (hinweise >= a.hinweis_anzahl) hinweisKnopf.disabled = true;
        else hinweisKnopf.textContent = 'Hinweis (−' + (a.hinweis_kosten[hinweise] || 0) + ')';
      } catch (e) { PU.melden(PU.h(e.message), 'schlecht'); }
    });

    loesungKnopf.addEventListener('click', async () => {
      if (!confirm('Die Lösung anzeigen? Diese Aufgabe gibt dann keine Punkte mehr — der Stoff bleibt aber.')) return;
      try {
        const j = await PU.ruf('loesung_zeigen', { id: a.id });
        loesungGesehen = true;
        loesungKnopf.disabled = true;
        ergebnis.innerHTML =
          '<div class="hinweis-kasten"><b>Lösung</b><br>' +
          '<code>' + PU.h(JSON.stringify(j.loesung !== null ? j.loesung : j.zeilen)) + '</code>' +
          (j.erklaerung ? '<p style="margin-top:.6rem">' + PU.h(j.erklaerung) + '</p>' : '') +
          '</div>';
      } catch (e) { PU.melden(PU.h(e.message), 'schlecht'); }
    });

    abgeben.addEventListener('click', async () => {
      abgeben.disabled = true;
      try {
        const antwort = bau ? bau.antwort(feld, a) : null;
        const j = await PU.ruf('abgeben', {
          id: a.id, antwort: antwort, hinweise: hinweise,
          loesung_gesehen: loesungGesehen,
          anmerkung: PU.eJa('athena_auto'),
          dauer_s: Math.round((Date.now() - start) / 1000)
        });
        ergebnis.innerHTML = ergebnisHtml(j);
        kasten.classList.toggle('gelöst', j.richtig);
        PU.ertragMelden(j);

        if (j.richtig) {
          if (uhr) { clearInterval(uhr); uhr = null; }
          PU.lobZeigen(j.motivation, j.punkte);
          if (j.vertiefung_moeglich) infosKnopfZeigen(ergebnis, a);
        }
      } catch (e) {
        PU.melden(PU.h(e.message), 'schlecht');
      } finally {
        abgeben.disabled = false;
      }
    });
  }

  // Wer die Aufgabe früher schon richtig hatte, bekommt den Vertiefungsknopf
  // sofort — er müsste sie sonst noch einmal lösen, um an etwas zu kommen,
  // das er sich bereits verdient hat.
  if (!opt.pruefung && a.stand && a.stand.richtig && PU.tutorBereit) {
    infosKnopfZeigen(ergebnis, a);
  }

  ziel.appendChild(kasten);
  return {
    kasten: kasten,
    antwort: () => (bau ? bau.antwort(feld, a) : null)
  };
};

function hinweises(n) { return n === 1 ? '' : n; }

/**
 * "Weitere Infos" — erscheint erst NACH einer richtigen Antwort.
 *
 * Der Text landet in der rechten Spalte, nicht unter der Aufgabe: unten
 * schöbe er die nächste Aufgabe weg, und wer weiterlesen will, verlöre den
 * Faden. Rechts steht er neben dem, worauf er sich bezieht.
 *
 * Die Länge steht in den persönlichen Einstellungen und wird auf dem Server
 * hart durchgesetzt — die Spalte soll nicht überlaufen, egal wie gesprächig
 * ein Modell gerade ist.
 */
function infosKnopfZeigen(ergebnis, a) {
  if (ergebnis.querySelector('.infos-knopf')) return;

  const knopf = PU.el('button', 'knopf still infos-knopf', '💡 Weitere Infos');
  knopf.type = 'button';
  knopf.style.marginTop = '.6rem';
  knopf.title = 'Prometheus vertieft das Thema in höchstens ' + PU.e('infos_woerter') + ' Wörtern';

  knopf.addEventListener('click', async () => {
    knopf.disabled = true;
    knopf.textContent = '💡 Prometheus schreibt …';
    try {
      const j = await PU.ruf('vertiefung', { id: a.id });
      if (!j.ok) {
        PU.melden(PU.h(j.fehler || 'Die Vertiefung kam nicht zustande.'), 'schlecht');
        knopf.disabled = false;
        knopf.textContent = '💡 Weitere Infos';
        return;
      }
      const kasten = PU.spalteText('💡 ' + a.titel, j.text,
        'Prometheus, höchstens ' + j.woerter + ' Wörter · erklärt, bewertet nicht');
      if (!kasten) {
        // Keine Spalte da (etwa in einer schmalen Ansicht): dann eben hier.
        ergebnis.appendChild(PU.el('div', 'anmerkung',
          '<b>💡 Weitere Infos:</b> ' + PU.h(j.text)));
      }
      knopf.textContent = '💡 Noch mehr';
      knopf.disabled = false;
    } catch (e) {
      PU.melden(PU.h(e.message), 'schlecht');
      knopf.disabled = false;
      knopf.textContent = '💡 Weitere Infos';
    }
  });

  ergebnis.appendChild(knopf);
}

/** Baut den Ergebniskasten. Farbe UND Zeichen UND Wort — nie nur Farbe. */
function ergebnisHtml(j) {
  let html = '<div class="ergebnis ' + (j.richtig ? 'richtig' : 'falsch') + '">' +
    '<div class="ergebnis-kopf"><span class="zeichen">' + (j.richtig ? '✓' : '✕') + '</span>' +
    (j.richtig ? 'Richtig' : 'Noch nicht richtig') +
    ' — ' + j.punkte + ' von ' + j.max + ' Punkten</div>';

  if (j.abzug > 0) html += '<p class="klein">−' + j.abzug + ' für genutzte Hinweise</p>';
  if (j.bonus > 0) html += '<p class="klein">+' + j.bonus + ' Schnelligkeitsbonus</p>';

  html += '<p>' + PU.h(j.rueckmeldung) + '</p>';

  if (j.teil && j.teil.length) {
    html += '<ul class="teilliste">';
    j.teil.forEach(t => {
      const ok = t.erfuellt !== undefined ? t.erfuellt : t.richtig;
      html += '<li><span class="zeichen ' + (ok ? 'erfuellt' : 'offen') + '">' +
        (ok ? '✓' : '✕') + '</span><span>' +
        PU.h(t.begruendung || t.titel || ('Schritt ' + t.schritt)) +
        ' <span class="klein">(' + t.punkte + '/' + t.max + ')</span></span></li>';
    });
    html += '</ul>';
  }

  if (j.erklaerung) html += '<p class="anmerkung"><b>Warum:</b> ' + PU.h(j.erklaerung) + '</p>';
  if (j.anmerkung)  html += '<div class="anmerkung"><b>Athena:</b> ' + PU.h(j.anmerkung) + '</div>';

  return html + '</div>';
}

PU.ergebnisHtml = ergebnisHtml;
