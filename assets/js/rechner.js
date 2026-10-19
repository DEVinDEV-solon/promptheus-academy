/* PROMPTHEUS — Taschenrechner über einer Aufgabe.
 *
 * Seit die Kurse rechnen lassen (Brutto und Netto, Rabatt, Skonto, Spanne),
 * steht an jeder Aufgabe neben Tokenicer und Lösungsweg ein Rechner. Wie der
 * Tokenicer als Fenster: aufmachen, rechnen, zumachen — die halb geschriebene
 * Antwort bleibt, wo sie ist.
 *
 * Zwei Teile:
 *  - der Rechner mit Prozenttaste wie auf dem Handy: „595 − 19 %“ zieht 19 %
 *    von 595 ab, „500 + 19 %“ schlägt sie auf, „595 × 19 %“ ist der Anteil;
 *  - darunter der Prozentrechner für die häufigen Fälle, vor allem
 *    „595 Euro enthalten 19 % Umsatzsteuer — wie viel ist netto?“.
 *
 * **Kein eval.** Der Ausdruck wird von einem kleinen Parser gelesen, der nur
 * Zahlen, + − × ÷, Klammern und % kennt. Alles andere ist ein Fehler.
 */
'use strict';

/* ============================================================ Rechnen */

/** Zerlegt den Ausdruck. Komma und Punkt sind beide Dezimalzeichen. */
function rechnerZerlegen(text) {
  const t = String(text).replace(/\s+/g, '')
    .replace(/[×xX*]/g, '*').replace(/[÷:/]/g, '/').replace(/[−–]/g, '-');
  const teile = [];
  let i = 0;
  while (i < t.length) {
    const c = t[i];
    const zahl = /^\d+(?:[.,]\d+)?|^[.,]\d+/.exec(t.slice(i));
    if (zahl) {
      teile.push({ art: 'zahl', wert: parseFloat(zahl[0].replace(',', '.')) });
      i += zahl[0].length;
      continue;
    }
    if ('+-*/()%'.includes(c)) { teile.push({ art: c }); i++; continue; }
    throw new Error('Unbekanntes Zeichen: ' + c);
  }
  return teile;
}

/**
 * Rechnet einen Ausdruck aus.
 *
 * Die Prozenttaste folgt der Handy-Regel: Steht „b %“ hinter + oder −, ist
 * es ein Anteil des Werts davor (a ± a·b/100). Bei × und ÷ ist es einfach
 * b/100. Allein steht „19 %“ für 0,19.
 *
 * @returns {number}
 */
PU.rechnerRechnen = function (text) {
  const t = rechnerZerlegen(text);
  if (!t.length) throw new Error('Nichts zu rechnen.');
  let p = 0;
  const sieh = () => t[p];
  const nimm = (art) => {
    if (!t[p] || t[p].art !== art) throw new Error('Da fehlt etwas: ' + art);
    p++;
  };

  // Rückgabe: { v: Wert, pz: true, wenn es ein „b %“ ohne Bezug ist }
  function faktor() {
    const x = sieh();
    if (!x) throw new Error('Der Ausdruck endet zu früh.');
    if (x.art === '-' || x.art === '+') {
      p++;
      const f = faktor();
      return { v: x.art === '-' ? -f.v : f.v, pz: f.pz };
    }
    let r;
    if (x.art === 'zahl') { p++; r = { v: x.wert, pz: false }; }
    else if (x.art === '(') { p++; r = { v: summe().v, pz: false }; nimm(')'); }
    else throw new Error('Hier wird eine Zahl erwartet.');
    if (sieh() && sieh().art === '%') { p++; r = { v: r.v, pz: true }; }
    return r;
  }

  function produkt() {
    let l = faktor();
    while (sieh() && (sieh().art === '*' || sieh().art === '/')) {
      const op = sieh().art; p++;
      const r = faktor();
      const lv = l.pz ? l.v / 100 : l.v;
      const rv = r.pz ? r.v / 100 : r.v;
      if (op === '/' && rv === 0) throw new Error('Durch null lässt sich nicht teilen.');
      l = { v: op === '*' ? lv * rv : lv / rv, pz: false };
    }
    return l;
  }

  function summe() {
    let l = produkt();
    if (l.pz) l = { v: l.v / 100, pz: false };
    while (sieh() && (sieh().art === '+' || sieh().art === '-')) {
      const op = sieh().art; p++;
      const r = produkt();
      const anteil = r.pz ? l.v * r.v / 100 : r.v;
      l = { v: op === '+' ? l.v + anteil : l.v - anteil, pz: false };
    }
    return l;
  }

  const erg = summe();
  if (p < t.length) throw new Error('Der Ausdruck ist nicht vollständig.');
  if (!isFinite(erg.v)) throw new Error('Das Ergebnis ist keine Zahl.');
  // Gleitkomma-Reste wie 0,1 + 0,2 = 0,30000000000000004 abschneiden.
  return Math.round(erg.v * 1e10) / 1e10;
};

/** Zahl deutsch, ohne Tausenderpunkte — so lässt sie sich weiterrechnen. */
PU.rechnerZahl = function (n) {
  return n.toLocaleString('de-DE', { maximumFractionDigits: 10, useGrouping: false });
};

/** Betrag deutsch, mindestens zwei Nachkommastellen — für Geld und Prozente. */
function rechnerBetrag(n) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}

/** Liest eine Eingabe wie „1.190,00“ oder „595“ als Zahl. */
function rechnerLesen(text) {
  let s = String(text || '').trim().replace(/\s|€|%/g, '');
  if (s === '') return null;
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  const n = Number(s);
  return isFinite(n) ? n : null;
}

/* ============================================================ Fenster */

/**
 * Öffnet den Rechner.
 *
 * @param {HTMLElement|null} antwortfeld  Textfeld der Aufgabe — gibt es eines,
 *        bietet der Rechner an, das Ergebnis hineinzuschreiben.
 */
PU.rechnerModal = function (antwortfeld) {
  const flaeche = PU.modalZeigen('Taschenrechner');
  if (!flaeche) return;
  flaeche.classList.remove('breit');
  flaeche.closest('.modal-flaeche').classList.add('rechner-flaeche');

  const gitter = PU.el('div', 'rechner');
  flaeche.appendChild(gitter);

  // ---------------- Links: der Rechner
  const links = PU.el('div', 'rechner-teil');
  links.appendChild(PU.el('h3', '', 'Rechnen'));
  const anzeige = document.createElement('input');
  anzeige.type = 'text';
  anzeige.className = 'rechner-anzeige';
  anzeige.inputMode = 'decimal';
  anzeige.autocomplete = 'off';
  anzeige.placeholder = 'z. B. 595 − 19 %';
  anzeige.setAttribute('aria-label', 'Rechnung');
  const ergebnis = PU.el('p', 'rechner-ergebnis', '&nbsp;');
  ergebnis.setAttribute('aria-live', 'polite');
  links.appendChild(anzeige);
  links.appendChild(ergebnis);

  let letztes = null;   // zuletzt ausgerechnetes Ergebnis (Zahl)
  const verlauf = PU.el('ul', 'rechner-verlauf');

  function ausrechnen() {
    const text = anzeige.value.trim();
    if (!text) return;
    try {
      const v = PU.rechnerRechnen(text);
      letztes = v;
      ergebnis.textContent = '= ' + PU.rechnerZahl(v);
      ergebnis.classList.remove('fehler');
      const li = PU.el('li', '', PU.h(text) + ' = <b>' + PU.h(PU.rechnerZahl(v)) + '</b>');
      li.title = 'Ergebnis wieder in die Rechnung holen';
      li.addEventListener('click', () => { anzeige.value = PU.rechnerZahl(v); anzeige.focus(); });
      verlauf.prepend(li);
      while (verlauf.children.length > 5) verlauf.lastChild.remove();
      anzeige.value = PU.rechnerZahl(v);
      uebernehmen.disabled = false;
    } catch (e) {
      ergebnis.textContent = e.message;
      ergebnis.classList.add('fehler');
    }
  }

  function tippen(zeichen) {
    if (zeichen === 'C') { anzeige.value = ''; ergebnis.innerHTML = '&nbsp;'; ergebnis.classList.remove('fehler'); }
    else if (zeichen === '⌫') anzeige.value = anzeige.value.slice(0, -1);
    else if (zeichen === '=') ausrechnen();
    else anzeige.value += zeichen;
    anzeige.focus();
  }

  anzeige.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); ausrechnen(); }
  });

  const tasten = PU.el('div', 'rechner-tasten');
  [
    ['C', 'Alles löschen'], ['(', 'Klammer auf'], [')', 'Klammer zu'], ['⌫', 'Letztes Zeichen löschen'],
    ['7'], ['8'], ['9'], ['÷', 'geteilt durch'],
    ['4'], ['5'], ['6'], ['×', 'mal'],
    ['1'], ['2'], ['3'], ['−', 'minus'],
    ['0'], [',', 'Komma'], ['%', 'Prozent'], ['+', 'plus'],
  ].forEach(([z, name]) => {
    const k = PU.el('button', 'rechner-taste' + (/[÷×−+%]/.test(z) ? ' op' : '') + (z === 'C' ? ' weg' : ''), PU.h(z));
    k.type = 'button';
    if (name) k.setAttribute('aria-label', name);
    k.addEventListener('click', () => tippen(z));
    tasten.appendChild(k);
  });
  const gleich = PU.el('button', 'rechner-taste gleich', '=');
  gleich.type = 'button';
  gleich.setAttribute('aria-label', 'Ausrechnen');
  gleich.addEventListener('click', () => tippen('='));
  tasten.appendChild(gleich);
  links.appendChild(tasten);

  const uebernehmen = PU.el('button', 'knopf klein', 'Ergebnis in die Antwort übernehmen');
  uebernehmen.type = 'button';
  uebernehmen.disabled = true;
  uebernehmen.addEventListener('click', () => {
    if (letztes === null || !antwortfeld) return;
    antwortfeld.value = PU.rechnerZahl(letztes);
    antwortfeld.dispatchEvent(new Event('input', { bubbles: true }));
    PU.modalSchliessen();
    antwortfeld.focus();
  });
  if (antwortfeld) links.appendChild(uebernehmen);
  links.appendChild(verlauf);
  gitter.appendChild(links);

  // ---------------- Rechts: Prozentrechner
  const rechts = PU.el('div', 'rechner-teil');
  rechts.appendChild(PU.el('h3', '', 'Prozente'));
  rechts.appendChild(PU.el('p', 'klein',
    'Betrag und Prozentsatz eingeben — die häufigen Rechnungen stehen sofort darunter. ' +
    'Ein Klick auf ein Ergebnis holt es in den Rechner.'));

  const feldBetrag = document.createElement('input');
  feldBetrag.type = 'text'; feldBetrag.inputMode = 'decimal'; feldBetrag.value = '';
  feldBetrag.placeholder = 'z. B. 595'; feldBetrag.className = 'rechner-feld';
  const feldSatz = document.createElement('input');
  feldSatz.type = 'text'; feldSatz.inputMode = 'decimal'; feldSatz.value = '19';
  feldSatz.className = 'rechner-feld';
  const zeileEingabe = PU.el('div', 'rechner-eingaben');
  const lb = PU.el('label', '', '<span>Betrag</span>'); lb.appendChild(feldBetrag);
  const ls = PU.el('label', '', '<span>Prozent</span>'); ls.appendChild(feldSatz);
  zeileEingabe.appendChild(lb); zeileEingabe.appendChild(ls);
  rechts.appendChild(zeileEingabe);

  const tabelle = PU.el('div', 'rechner-prozente');
  rechts.appendChild(tabelle);

  function prozenteZeigen() {
    const b = rechnerLesen(feldBetrag.value);
    const s = rechnerLesen(feldSatz.value);
    tabelle.innerHTML = '';
    if (b === null || s === null) {
      tabelle.appendChild(PU.el('p', 'klein', 'Gib einen Betrag und einen Prozentsatz ein.'));
      return;
    }
    const bt = rechnerBetrag(b), st = PU.rechnerZahl(s);
    const netto = b / (1 + s / 100);
    [
      ['Enthält ' + st + ' %: netto', bt + ' ÷ ' + PU.rechnerZahl(1 + s / 100), netto],
      ['… darin enthalten (' + st + ' %)', bt + ' − netto', b - netto],
      ['Zuzüglich ' + st + ' % (z. B. brutto aus netto)', bt + ' × ' + PU.rechnerZahl(1 + s / 100), b * (1 + s / 100)],
      ['Abzüglich ' + st + ' % (z. B. Rabatt, Skonto)', bt + ' × ' + PU.rechnerZahl(1 - s / 100), b * (1 - s / 100)],
      [st + ' % von ' + bt, bt + ' × ' + PU.rechnerZahl(s / 100), b * s / 100],
    ].forEach(([was, wie, wert]) => {
      const gerundet = Math.round(wert * 1e10) / 1e10;
      const z = PU.el('button', 'rechner-zeile');
      z.type = 'button';
      z.innerHTML = '<span class="was">' + PU.h(was) + '<small>' + PU.h(wie) + '</small></span>' +
                    '<b>' + PU.h(rechnerBetrag(gerundet)) + '</b>';
      z.title = 'In den Rechner übernehmen';
      z.addEventListener('click', () => {
        anzeige.value = PU.rechnerZahl(gerundet);
        letztes = gerundet;
        ergebnis.textContent = '= ' + PU.rechnerZahl(gerundet);
        ergebnis.classList.remove('fehler');
        uebernehmen.disabled = false;
        anzeige.focus();
      });
      tabelle.appendChild(z);
    });
  }
  feldBetrag.addEventListener('input', prozenteZeigen);
  feldSatz.addEventListener('input', prozenteZeigen);
  prozenteZeigen();
  gitter.appendChild(rechts);

  anzeige.focus();
};
