/* PROMPTHEUS — QR-Codes, hier im Browser gerechnet.
 *
 * Eigene, kleine Umsetzung der Norm ISO/IEC 18004 (Byte-Modus, Version 1–40,
 * Fehlerkorrektur L/M/Q/H) — ohne Fremdbibliothek und ohne Dienst im Netz.
 * Ein QR-Dienst bekäme mit jedem Bild den Text, der darin steht; die Academy
 * schickt nichts hinaus (Brand/BRAND.md, Abschnitt 9).
 *
 * Geprüft wird sie in tests/codes_test.php (über tests/qr_js_pruefen.js) gegen eine zweite, unabhängige
 * Umsetzung (die in npm mitgelieferte von Kazuhiko Arase) — Bit für Bit, für
 * viele Längen, alle vier Stufen und alle acht Masken.
 *
 *   PU.qr.matrix('https://…')        → { groesse, version, maske, dunkel(x, y) }
 *   PU.qr.svg('https://…', {rand: 4}) → '<svg …>' (Module als ein Pfad)
 */
(function () {
  'use strict';

  const STUFE = { L: 0, M: 1, Q: 2, H: 3 };
  const FORMAT_BITS = [1, 0, 3, 2];   // L, M, Q, H — so steht es in der Norm

  // Fehlerkorrektur-Bytes je Block und Zahl der Blöcke, je Stufe und Version.
  const ECC_JE_BLOCK = [
    [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
    [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  ];
  const BLOECKE = [
    [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
    [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
    [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
    [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
  ];

  /** Module, die Daten tragen können (alles ausser den festen Mustern). */
  function rohModule(v) {
    let n = (16 * v + 128) * v + 64;
    if (v >= 2) {
      const a = Math.floor(v / 7) + 2;
      n -= (25 * a - 10) * a - 55;
      if (v >= 7) n -= 36;
    }
    return n;
  }

  function datenBytes(v, s) {
    return Math.floor(rohModule(v) / 8) - ECC_JE_BLOCK[s][v] * BLOECKE[s][v];
  }

  // ---------------------------------------------------- Reed-Solomon in GF(256)
  function mal(x, y) {
    let z = 0;
    for (let i = 7; i >= 0; i--) {
      z = (z << 1) ^ ((z >>> 7) * 0x11d);
      z ^= ((y >>> i) & 1) * x;
    }
    return z;
  }

  function teiler(grad) {
    const r = new Array(grad).fill(0);
    r[grad - 1] = 1;
    let wurzel = 1;
    for (let i = 0; i < grad; i++) {
      for (let j = 0; j < r.length; j++) {
        r[j] = mal(r[j], wurzel);
        if (j + 1 < r.length) r[j] ^= r[j + 1];
      }
      wurzel = mal(wurzel, 0x02);
    }
    return r;
  }

  function rest(daten, t) {
    const r = new Array(t.length).fill(0);
    for (const b of daten) {
      const f = b ^ r.shift();
      r.push(0);
      for (let i = 0; i < t.length; i++) r[i] ^= mal(t[i], f);
    }
    return r;
  }

  // ---------------------------------------------------------------- Kodieren
  function utf8(text) {
    return Array.from(new TextEncoder().encode(String(text)));
  }

  /** Bits des Byte-Segments samt Abschluss und Füllbytes. */
  function nutzdaten(bytes, v, s) {
    const bits = [];
    const schreib = (wert, n) => { for (let i = n - 1; i >= 0; i--) bits.push((wert >>> i) & 1); };
    schreib(0b0100, 4);
    schreib(bytes.length, v <= 9 ? 8 : 16);
    bytes.forEach(b => schreib(b, 8));

    const platz = datenBytes(v, s) * 8;
    schreib(0, Math.min(4, platz - bits.length));
    schreib(0, (8 - bits.length % 8) % 8);
    for (let fuell = 0xec; bits.length < platz; fuell ^= 0xec ^ 0x11) schreib(fuell, 8);

    const aus = [];
    for (let i = 0; i < bits.length; i += 8) {
      let b = 0;
      for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j];
      aus.push(b);
    }
    return aus;
  }

  /** In Blöcke teilen, je Block die Korrektur anhängen, verschränken. */
  function mitKorrektur(daten, v, s) {
    const anzahl = BLOECKE[s][v];
    const eccLen = ECC_JE_BLOCK[s][v];
    const roh = Math.floor(rohModule(v) / 8);
    const kurze = anzahl - roh % anzahl;
    const kurzLen = Math.floor(roh / anzahl);
    const t = teiler(eccLen);

    const bloecke = [];
    for (let i = 0, k = 0; i < anzahl; i++) {
      const teil = daten.slice(k, k + kurzLen - eccLen + (i < kurze ? 0 : 1));
      k += teil.length;
      const ecc = rest(teil, t);
      if (i < kurze) teil.push(0);
      bloecke.push(teil.concat(ecc));
    }

    const aus = [];
    for (let i = 0; i < bloecke[0].length; i++) {
      bloecke.forEach((b, j) => {
        if (i !== kurzLen - eccLen || j >= kurze) aus.push(b[i]);
      });
    }
    return aus;
  }

  // ------------------------------------------------------------- Die Matrix
  function ausrichtung(v) {
    if (v === 1) return [];
    const n = Math.floor(v / 7) + 2;
    const schritt = v === 32 ? 26 : Math.ceil((v * 4 + 4) / (n * 2 - 2)) * 2;
    const aus = [6];
    for (let pos = v * 4 + 17 - 7; aus.length < n; pos -= schritt) aus.splice(1, 0, pos);
    return aus;
  }

  function aufbauen(v, s, codewoerter, maske) {
    const g = v * 4 + 17;
    const feld = Array.from({ length: g }, () => new Array(g).fill(false));
    const fest = Array.from({ length: g }, () => new Array(g).fill(false));
    const setz = (x, y, d) => { feld[y][x] = d; fest[y][x] = true; };

    for (let i = 0; i < g; i++) { setz(6, i, i % 2 === 0); setz(i, 6, i % 2 === 0); }

    const finder = (cx, cy) => {
      for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
        const d = Math.max(Math.abs(dx), Math.abs(dy)), x = cx + dx, y = cy + dy;
        if (x >= 0 && x < g && y >= 0 && y < g) setz(x, y, d !== 2 && d !== 4);
      }
    };
    finder(3, 3); finder(g - 4, 3); finder(3, g - 4);

    const pos = ausrichtung(v), letzt = pos.length - 1;
    pos.forEach((py, i) => pos.forEach((px, j) => {
      if ((i === 0 && j === 0) || (i === 0 && j === letzt) || (i === letzt && j === 0)) return;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
        setz(px + dx, py + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
      }
    }));

    const format = () => {
      const d = (FORMAT_BITS[s] << 3) | maske;
      let r = d;
      for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537);
      const b = ((d << 10) | r) ^ 0x5412;
      const bit = i => ((b >>> i) & 1) !== 0;
      for (let i = 0; i <= 5; i++) setz(8, i, bit(i));
      setz(8, 7, bit(6)); setz(8, 8, bit(7)); setz(7, 8, bit(8));
      for (let i = 9; i < 15; i++) setz(14 - i, 8, bit(i));
      for (let i = 0; i < 8; i++) setz(g - 1 - i, 8, bit(i));
      for (let i = 8; i < 15; i++) setz(8, g - 15 + i, bit(i));
      setz(8, g - 8, true);
    };
    format();

    if (v >= 7) {
      let r = v;
      for (let i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11) * 0x1f25);
      const b = (v << 12) | r;
      for (let i = 0; i < 18; i++) {
        const d = ((b >>> i) & 1) !== 0, a = g - 11 + i % 3, c = Math.floor(i / 3);
        setz(a, c, d); setz(c, a, d);
      }
    }

    // Die Daten im Zickzack von unten rechts, zwei Spalten breit.
    let i = 0;
    for (let rechts = g - 1; rechts >= 1; rechts -= 2) {
      if (rechts === 6) rechts = 5;
      for (let senk = 0; senk < g; senk++) for (let j = 0; j < 2; j++) {
        const x = rechts - j;
        const y = ((rechts + 1) & 2) === 0 ? g - 1 - senk : senk;
        if (!fest[y][x] && i < codewoerter.length * 8) {
          feld[y][x] = ((codewoerter[i >>> 3] >>> (7 - (i & 7))) & 1) !== 0;
          i++;
        }
      }
    }

    const formel = [
      (x, y) => (x + y) % 2 === 0,
      (x, y) => y % 2 === 0,
      (x, y) => x % 3 === 0,
      (x, y) => (x + y) % 3 === 0,
      (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
      (x, y) => x * y % 2 + x * y % 3 === 0,
      (x, y) => (x * y % 2 + x * y % 3) % 2 === 0,
      (x, y) => ((x + y) % 2 + x * y % 3) % 2 === 0,
    ][maske];
    for (let y = 0; y < g; y++) for (let x = 0; x < g; x++) {
      if (!fest[y][x] && formel(x, y)) feld[y][x] = !feld[y][x];
    }
    return feld;
  }

  /** Strafpunkte nach der Norm (vier Regeln); die kleinste Summe gewinnt. */
  function strafe(feld) {
    const g = feld.length;
    let p = 0;
    const zeile = (get) => {
      for (let a = 0; a < g; a++) {
        let lauf = 1;
        for (let b = 1; b <= g; b++) {
          if (b < g && get(a, b) === get(a, b - 1)) { lauf++; continue; }
          if (lauf >= 5) p += lauf - 2;
          lauf = 1;
        }
        // Regel 3: 1:1:3:1:1 mit vier hellen Modulen davor oder danach.
        for (let b = 0; b + 6 < g; b++) {
          const muster = [1, 0, 1, 1, 1, 0, 1].every((m, k) => get(a, b + k) === (m === 1));
          if (!muster) continue;
          const hell = (von, bis) => { for (let k = von; k < bis; k++) if (k >= 0 && k < g && get(a, k)) return false; return true; };
          if (hell(b - 4, b) || hell(b + 7, b + 11)) p += 40;
        }
      }
    };
    zeile((a, b) => feld[a][b]);
    zeile((a, b) => feld[b][a]);
    for (let y = 0; y + 1 < g; y++) for (let x = 0; x + 1 < g; x++) {
      const c = feld[y][x];
      if (c === feld[y][x + 1] && c === feld[y + 1][x] && c === feld[y + 1][x + 1]) p += 3;
    }
    let dunkel = 0;
    feld.forEach(r => r.forEach(m => { if (m) dunkel++; }));
    p += Math.floor(Math.abs(dunkel * 20 - g * g * 10) / (g * g)) * 10;
    return p;
  }

  /**
   * Die Matrix zu einem Text.
   *
   * @param {string} text
   * @param {{stufe?: 'L'|'M'|'Q'|'H', version?: number, maske?: number}} [opt]
   */
  function matrix(text, opt) {
    opt = opt || {};
    const s = STUFE[opt.stufe || 'M'];
    if (s === undefined) throw new Error('Unbekannte Fehlerkorrektur: ' + opt.stufe);
    const bytes = utf8(text);

    let v = opt.version || 0;
    if (!v) {
      for (v = 1; v <= 40; v++) {
        if (4 + (v <= 9 ? 8 : 16) + bytes.length * 8 <= datenBytes(v, s) * 8) break;
      }
      if (v > 40) throw new Error('Der Text ist für einen QR-Code zu lang.');
    } else if (4 + (v <= 9 ? 8 : 16) + bytes.length * 8 > datenBytes(v, s) * 8) {
      throw new Error('Der Text passt nicht in Version ' + v + '.');
    }

    const codewoerter = mitKorrektur(nutzdaten(bytes, v, s), v, s);
    let maske = opt.maske, feld;
    if (maske === undefined) {
      let beste = Infinity;
      for (let m = 0; m < 8; m++) {
        const f = aufbauen(v, s, codewoerter, m), st = strafe(f);
        if (st < beste) { beste = st; feld = f; maske = m; }
      }
    } else {
      feld = aufbauen(v, s, codewoerter, maske);
    }
    return { groesse: feld.length, version: v, maske, dunkel: (x, y) => feld[y][x] };
  }

  /**
   * Als SVG: ein einziger Pfad für alle dunklen Module, mit Ruhezone.
   * Schwarz auf Weiss, fest und unabhängig von der Farbvariante: Ein Scanner
   * braucht den Kontrast, und ein heller Code auf dunklem Grund wird von
   * manchen Handys gar nicht gelesen.
   */
  function svg(text, opt) {
    opt = opt || {};
    const q = matrix(text, opt);
    const rand = opt.rand === undefined ? 4 : opt.rand;
    const n = q.groesse + rand * 2;
    let d = '';
    for (let y = 0; y < q.groesse; y++) for (let x = 0; x < q.groesse; x++) {
      if (q.dunkel(x, y)) d += 'M' + (x + rand) + ' ' + (y + rand) + 'h1v1h-1z';
    }
    const titel = String(opt.titel || 'QR-Code').replace(/[<>&"]/g, '');
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + n + ' ' + n + '" ' +
      'shape-rendering="crispEdges" role="img" aria-label="' + titel + '">' +
      '<rect width="' + n + '" height="' + n + '" fill="#fff"/>' +
      '<path d="' + d + '" fill="#000"/></svg>';
  }

  // `bloecke` nur für tests/qr_js_pruefen.js: die Blockaufteilung je Version.
  const bloecke = (v, stufe) => {
    const s = STUFE[stufe], n = BLOECKE[s][v], roh = Math.floor(rohModule(v) / 8);
    const kurz = Math.floor(roh / n), ecc = ECC_JE_BLOCK[s][v], aus = [];
    for (let i = 0; i < n; i++) {
      const gesamt = kurz + (i < n - roh % n ? 0 : 1);
      aus.push({ gesamt, daten: gesamt - ecc });
    }
    return aus;
  };

  const QR = { matrix, svg, bloecke };
  if (typeof module === 'object' && module.exports) module.exports = QR;
  if (typeof window !== 'undefined' && window.PU) window.PU.qr = QR;
})();
