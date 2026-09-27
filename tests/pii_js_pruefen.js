// PROMPTHEUS — Hilfe für tests/pii_test.php: legt alle Sätze aus der Datei
// (Argument 2) mit assets/js/pii.js aus und gibt das Ergebnis als JSON aus.
// Aufruf: node tests/pii_js_pruefen.js srv/pii_regeln.json saetze.json
'use strict';
const fs = require('fs');
const pii = require('../assets/js/pii.js');
pii.laden(JSON.parse(fs.readFileSync(process.argv[2], 'utf8')));
const saetze = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
const aus = saetze.map(s => {
  const p = pii.pruefen(s);
  return { text: p.text, regeln: p.treffer.map(t => t.regel).sort() };
});
process.stdout.write(JSON.stringify(aus));
