/* PROMPTHEUS — prüft assets/js/qr.js gegen eine unabhängige Umsetzung.
 *
 * Die Referenz ist der QR-Kern von Kazuhiko Arase, den npm im Paket
 * `qrcode-terminal` mitliefert. Er wird nur hier gelesen, nie ausgeliefert.
 * Verglichen wird Modul für Modul, mit derselben Version und derselben Maske —
 * die Wahl der Maske darf verschieden ausfallen, das Ergebnis je Maske nicht.
 *
 * Aufruf: node tests/qr_js_pruefen.js <Pfad zu vendor/QRCode>
 * Ausgabe: eine Zeile JSON {ok, fehler:[…], geprueft}
 */
'use strict';
const path = require('path');
const QR = require(path.join(__dirname, '..', 'assets', 'js', 'qr.js'));

const refPfad = process.argv[2];
const RefQR = require(path.join(refPfad, 'index.js'));
const RefStufe = require(path.join(refPfad, 'QRErrorCorrectLevel.js'));

const fehler = [];
let geprueft = 0;

const texte = [
  'A', 'https://promptheus-academy.de/eltern.php',
  'https://promptheus-academy.de/lehrkraefte.php', 'https://promptheus-academy.de/',
];
// Längen quer durch die Versionen 1 bis etwa 15.
for (let n = 1; n <= 400; n += (n < 60 ? 3 : 23)) {
  let t = '';
  for (let i = 0; i < n; i++) t += String.fromCharCode(33 + (i * 7 + n) % 90);
  texte.push(t);
}

/* Ein bekannter Fehler der Referenz: Version 15 in Stufe H führt sie mit 132
   statt 223 Datenbytes — es fehlen die 7 langen Blöcke. Diese Stelle wird übersprungen;
   alle anderen Versionen und Stufen müssen übereinstimmen. */
const REF_FEHLER = new Set(['15H']);

for (const text of texte) {
  for (const stufe of ['L', 'M', 'Q', 'H']) {
    let eigen;
    try { eigen = QR.matrix(text, { stufe, maske: 0 }); } catch (e) { continue; }
    if (REF_FEHLER.has(eigen.version + stufe)) continue;
    for (let maske = 0; maske < 8; maske++) {
      const q = QR.matrix(text, { stufe, maske, version: eigen.version });
      const ref = new RefQR(eigen.version, RefStufe[stufe]);
      ref.addData(text);
      // makeImpl mit fester Maske, ohne die eigene Maskenwahl der Referenz.
      ref.makeImpl(false, maske);
      let gleich = ref.getModuleCount() === q.groesse;
      for (let y = 0; gleich && y < q.groesse; y++) {
        for (let x = 0; x < q.groesse; x++) {
          if (ref.isDark(y, x) !== q.dunkel(x, y)) { gleich = false; break; }
        }
      }
      geprueft++;
      if (!gleich) fehler.push(`Länge ${text.length}, Stufe ${stufe}, Version ${eigen.version}, Maske ${maske}`);
    }
  }
}

// Die Blockaufteilung aller 40 Versionen gegen die Tabellen der Referenz.
const RefBlock = require(path.join(refPfad, 'QRRSBlock.js'));
for (let v = 1; v <= 40; v++) {
  for (const stufe of ['L', 'M', 'Q', 'H']) {
    if (REF_FEHLER.has(v + stufe)) continue;
    const zu = b => b.map(x => x.gesamt + '/' + x.daten).sort().join(',');
    const ref = RefBlock.getRSBlocks(v, RefStufe[stufe]).map(x => ({ gesamt: x.totalCount, daten: x.dataCount }));
    geprueft++;
    if (zu(ref) !== zu(QR.bloecke(v, stufe))) fehler.push(`Blöcke Version ${v} Stufe ${stufe}`);
  }
}
// Die eine Ausnahme nach der Norm: 15-H sind 11 × 12 + 7 × 13 = 223 Datenbytes.
const h15 = QR.bloecke(15, 'H').reduce((s, b) => s + b.daten, 0);
geprueft++;
if (h15 !== 223) fehler.push('Version 15 Stufe H: ' + h15 + ' statt 223 Datenbytes');

// Die automatische Wahl liefert eine gültige Maske und die kleinste Version.
const auto = QR.matrix('https://promptheus-academy.de/eltern.php');
if (!(auto.maske >= 0 && auto.maske <= 7)) fehler.push('automatische Maske ausserhalb 0–7');
if (auto.version !== 3) fehler.push('Elternseite sollte in Version 3 passen, ist ' + auto.version);

const svg = QR.svg('https://promptheus-academy.de/', { titel: 'Test <b>' });
if (!svg.startsWith('<svg') || svg.includes('<b>')) fehler.push('SVG unsauber');

console.log(JSON.stringify({ ok: fehler.length === 0, fehler: fehler.slice(0, 10), geprueft }));
