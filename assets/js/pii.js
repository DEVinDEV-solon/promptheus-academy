/* PROMPTHEUS — persönliche Angaben erkennen, schon beim Tippen (K-PII, Runde 3b).
 *
 * „Kinder machen gerne Blödsinn“ (User, 27.09.2026): Namen, Orte, Alter,
 * Geburtstage, Telefonnummern, Klassen, Schlüssel, Kartennummern werden zu
 * „xxx“, und eine rot umrandete Verbotsregel sagt, warum.
 *
 * Das Regelwerk ist `srv/pii_regeln.json` — dasselbe wie in `srv/pii.php` und
 * auf dem Server. Diese Datei legt es in JavaScript aus; der Test
 * (tests/pii_test.php) rechnet alle Beispiele in beiden Sprachen nach.
 * Der Server prüft trotzdem noch einmal: was hier geschieht, ist Hilfe.
 *
 * Läuft im Browser (PU.pii) und in Node (module.exports) — für den Test.
 */
(function (wurzel, fabrik) {
  'use strict';
  const pii = fabrik();
  if (typeof module === 'object' && module.exports) {
    module.exports = pii;
  } else {
    wurzel.PU = wurzel.PU || {};
    wurzel.PU.pii = pii;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  let regeln = null;
  let ersatz = 'xxx';

  // Nur Syntaxzeichen maskieren: im u-Modus ist `\-` ausserhalb einer Klasse ein Fehler.
  const maske = s => String(s).replace(/[\\^$.*+?()[\]{}|\/]/g, '\\$&');

  /** Übersetzt das Regelwerk (JSON wie in srv/pii_regeln.json). */
  function laden(json) {
    ersatz = json.ersatz || 'xxx';
    regeln = json.regeln.map(r => {
      let muster, schalter;
      if (r.liste) {
        const woerter = (json.listen[r.liste] || []).slice()
          .sort((a, b) => b.length - a.length).map(maske);
        muster = '(?<![\\p{L}\\p{N}_])(?:' + woerter.join('|') + ')(?![\\p{L}\\p{N}_])';
        schalter = 'u';
      } else {
        muster = r.muster;
        schalter = r.schalter || 'u';
      }
      return {
        id: r.id, art: r.art, titel: r.titel, text: r.text,
        re: new RegExp(muster, 'gd' + schalter.replace(/[^imsu]/g, '')),
        ersetze: r.ersetze || 0, pruefung: r.pruefung || ''
      };
    });
  }

  /** Luhn-Prüfung für Kartennummern. */
  function luhn(zahl) {
    const z = String(zahl).replace(/\D/g, '');
    if (z.length < 13) return false;
    let summe = 0, doppelt = false;
    for (let i = z.length - 1; i >= 0; i--) {
      let d = z.charCodeAt(i) - 48;
      if (doppelt) { d *= 2; if (d > 9) d -= 9; }
      summe += d;
      doppelt = !doppelt;
    }
    return summe % 10 === 0;
  }

  /**
   * Prüft einen Text. Gibt den bereinigten Text und die Treffer zurück
   * (Regel, Titel, Erklärung — nie den Wert). `nurHart`: Listen nur melden.
   */
  function pruefen(text, nurHart) {
    if (!regeln) return { text: text, treffer: [], hart: false };
    const stellen = [];
    const treffer = new Map();
    for (const r of regeln) {
      r.re.lastIndex = 0;
      let m;
      while ((m = r.re.exec(text)) !== null) {
        if (m[0] === '') { r.re.lastIndex++; continue; }
        const wert = m[r.ersetze];
        const ort = m.indices && m.indices[r.ersetze];
        if (wert === undefined || !ort || wert === '') continue;
        if (r.pruefung === 'luhn' && !luhn(wert)) continue;
        if (!treffer.has(r.id)) treffer.set(r.id, { regel: r.id, art: r.art, titel: r.titel, text: r.text });
        if (!nurHart || r.art === 'hart') stellen.push([ort[0], ort[1]]);
      }
    }
    stellen.sort((a, b) => (a[0] - b[0]) || (b[1] - a[1]));
    const zusammen = [];
    for (const s of stellen) {
      const letzte = zusammen[zusammen.length - 1];
      if (letzte && s[0] <= letzte[1]) letzte[1] = Math.max(letzte[1], s[1]);
      else zusammen.push([s[0], s[1]]);
    }
    let aus = text;
    for (let i = zusammen.length - 1; i >= 0; i--) {
      aus = aus.slice(0, zusammen[i][0]) + ersatz + aus.slice(zusammen[i][1]);
    }
    const liste = [...treffer.values()];
    return { text: aus, treffer: liste, hart: liste.some(t => t.art === 'hart') };
  }

  return { laden: laden, pruefen: pruefen, luhn: luhn, bereit: () => regeln !== null };
});
