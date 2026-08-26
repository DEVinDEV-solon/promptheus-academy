/* PROMPTHEUS — Beispielbilder für die Zielseite (Zusatzkurs Brand-Guideline).
 *
 * **Warum gezeichnet und nicht fotografiert.**
 * Der Kurs behauptet, eine Handschrift sei sichtbar. Ein Foto von einer Schule
 * zeigt eine Schule; es zeigt nicht, dass drei Aushänge dieselbe Handschrift
 * tragen. Dafür muss man die drei Aushänge nebeneinander sehen — und das ist
 * eine Zeichnung, keine Aufnahme.
 *
 * Wo Atmosphäre trägt statt Beweis, steht in `ziel.js` ein Dateiname daneben.
 * Liegt die Datei da, wird sie gezeigt; fehlt sie, bleibt die Zeichnung. Die
 * Seite ist damit zu jedem Zeitpunkt vollständig.
 *
 * **Farben kommen aus den Tokens.** Inline-SVG erbt `var(--…)` vom Dokument,
 * also stimmt jede Zeichnung in allen sechs Varianten, hell wie dunkel, ohne
 * zweite Fassung.
 */
'use strict';

window.PU = window.PU || {};
PU.zielBild = {};

/* ---------------------------------------------------------------- Werkzeug */

/** Rahmen um eine Zeichnung. Alle Beispiele teilen dieselbe Bühne — sonst
 *  springt beim Scrollen die Bildbreite von Abschnitt zu Abschnitt. */
function buehne(inhalt) {
  return '<svg class="ziel-svg" viewBox="0 0 560 380" role="img" ' +
         'xmlns="http://www.w3.org/2000/svg">' + inhalt + '</svg>';
}

/** Ein Blatt Papier: Kopfbalken in einer Farbe, Titelzeile, Textzeilen.
 *  Das ist der Baustein, aus dem fast jedes Beispiel besteht — ein Aushang,
 *  ein Arbeitsblatt und ein Angebot unterscheiden sich nur in Beschriftung
 *  und Farbe, und genau das ist die Aussage. */
function blatt(x, y, w, h, o) {
  o = o || {};
  const kopf   = o.kopf || 'var(--glut)';
  const zeilen = o.zeilen === undefined ? 4 : o.zeilen;
  const marke  = o.marke === undefined ? true : o.marke;
  let s = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" ' +
          'rx="6" fill="var(--grund-2)" stroke="var(--rand-hell)"/>' +
          '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="7" ' +
          'rx="6" fill="' + kopf + '"/>' +
          '<rect x="' + x + '" y="' + (y + 4) + '" width="' + w + '" height="3" fill="' + kopf + '"/>';

  if (marke) {
    s += '<circle cx="' + (x + 15) + '" cy="' + (y + 24) + '" r="6" fill="none" ' +
         'stroke="' + kopf + '" stroke-width="1.6"/>' +
         '<rect x="' + (x + 26) + '" y="' + (y + 20) + '" width="' + Math.round(w * 0.34) + '" height="7" ' +
         'rx="3" fill="var(--schrift-2)" opacity=".75"/>';
  }

  if (o.titel) {
    s += '<text x="' + (x + 12) + '" y="' + (y + (marke ? 50 : 30)) + '" ' +
         'font-size="13.5" font-weight="700" fill="var(--schrift)" ' +
         'font-family="var(--sans)">' + o.titel + '</text>';
  }

  let ty = y + (marke ? 62 : 42) + (o.titel ? 0 : -14);
  for (let i = 0; i < zeilen; i++) {
    const br = Math.round((w - 24) * (i === zeilen - 1 ? 0.55 : (i % 2 ? 0.92 : 1)));
    s += '<rect x="' + (x + 12) + '" y="' + ty + '" width="' + br + '" height="5" ' +
         'rx="2.5" fill="var(--schrift-3)" opacity=".5"/>';
    ty += 12;
  }

  if (o.knopf) {
    s += '<rect x="' + (x + 12) + '" y="' + (y + h - 26) + '" width="' + Math.round(w * 0.48) + '" ' +
         'height="15" rx="4" fill="' + kopf + '"/>';
  }
  return s;
}

/** Beschriftung unter einem Beispiel. Ohne sie muss man raten, was man sieht. */
function schild(x, y, text, farbe) {
  return '<text x="' + x + '" y="' + y + '" font-size="13" ' +
         'fill="' + (farbe || 'var(--schrift-2)') + '" font-family="var(--sans)" ' +
         'text-anchor="middle">' + text + '</text>';
}

function ueber(x, y, text, farbe) {
  return '<text x="' + x + '" y="' + y + '" font-size="14" font-weight="700" ' +
         'letter-spacing=".06em" fill="' + (farbe || 'var(--schrift-2)') + '" ' +
         'font-family="var(--sans)">' + text + '</text>';
}

/** Eine Sprechblase aus einem Chatfenster. */
function blase(x, y, w, o) {
  o = o || {};
  const h = o.h || 46;
  const f = o.farbe || 'var(--grund-3)';
  let s = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" ' +
          'rx="8" fill="' + f + '" stroke="' + (o.rand || 'var(--rand)') + '"/>';
  let ty = y + 15;
  const n = o.zeilen || 2;
  for (let i = 0; i < n; i++) {
    const br = Math.round((w - 22) * (i === n - 1 ? 0.6 : 0.95));
    s += '<rect x="' + (x + 11) + '" y="' + ty + '" width="' + br + '" height="5" rx="2.5" ' +
         'fill="' + (o.text || 'var(--schrift-3)') + '" opacity=".6"/>';
    ty += 11;
  }
  return s;
}

/* ================================================================ 1. Das Problem
   Drei Ausgaben aus derselben Werkstatt, drei Handschriften. Der Fehler ist
   nicht, dass eine davon schlecht wäre — jede für sich ist in Ordnung. Der
   Fehler ist, dass sie nicht zusammengehören. */

PU.zielBild.ohneGuideline = function () {
  return buehne(
    ueber(14, 22, 'OHNE GUIDELINE', 'var(--schlecht)') +
    blatt(14, 36, 165, 150, { kopf: '#6d5ce7', titel: 'Newsletter', zeilen: 4 }) +
    blatt(197, 36, 165, 150, { kopf: 'var(--gut)', titel: 'Aushang', zeilen: 4, knopf: true }) +
    blatt(380, 36, 165, 150, { kopf: '#e0457b', titel: 'Elternbrief', zeilen: 5 }) +
    schild(96,  204, 'andere Farbe') + schild(279, 204, 'andere Form') +
    schild(462, 204, 'andere Stimme') +

    ueber(14, 242, 'MIT GUIDELINE', 'var(--gut)') +
    blatt(14, 252, 165, 92, { kopf: 'var(--glut)', titel: 'Newsletter', zeilen: 2 }) +
    blatt(197, 252, 165, 92, { kopf: 'var(--glut)', titel: 'Aushang', zeilen: 2 }) +
    blatt(380, 252, 165, 92, { kopf: 'var(--glut)', titel: 'Elternbrief', zeilen: 2 }) +
    '<path d="M14 356 H545" stroke="var(--glut)" stroke-width="2" opacity=".55"/>' +
    schild(279, 374, 'eine Handschrift', 'var(--glut)')
  );
};

/* ================================================================ 2. Das Dokument
   Wie eine Guideline aussieht, wenn sie fertig ist. Nicht dick — zwei Seiten,
   die man ganz liest. */

PU.zielBild.dokument = function () {
  /* Drei Farben, nicht fünf. Eine Palette mit zwei stummen Grautönen sieht in
     einem Beispiel wie ein unfertiges Feld aus — und die Regel, die hier
     gezeigt wird, lautet ohnehin: Jede Farbe hat eine Bedeutung. Wo keine
     Bedeutung ist, gehört auch kein Feld hin. */
  let felder = '';
  const farben = [
    ['var(--glut)',  'weiter'],
    ['var(--gold)',  'geschafft'],
    ['var(--lapis)', 'erkl&#228;rt']
  ];
  farben.forEach((f, i) => {
    const x = 222 + i * 62;
    felder += '<rect x="' + x + '" y="112" width="52" height="30" rx="5" ' +
              'fill="' + f[0] + '" stroke="var(--rand)"/>' +
              '<text x="' + (x + 26) + '" y="158" font-size="11.5" ' +
              'fill="var(--schrift-3)" font-family="var(--sans)" ' +
              'text-anchor="middle">' + f[1] + '</text>';
  });

  return buehne(
    '<rect x="14" y="14" width="532" height="352" rx="10" fill="var(--grund-2)" ' +
    'stroke="var(--rand-hell)"/>' +
    '<rect x="14" y="14" width="532" height="9" rx="9" fill="var(--glut)"/>' +
    '<rect x="14" y="18" width="532" height="5" fill="var(--glut)"/>' +

    '<text x="38" y="56" font-size="18" font-weight="700" fill="var(--schrift)" ' +
    'font-family="var(--serif)">Brand-Guideline</text>' +
    '<text x="38" y="74" font-size="13" fill="var(--schrift-3)" ' +
    'font-family="var(--sans)">zwei Seiten, acht Felder</text>' +

    ueber(38, 106, 'STIMME') +
    '<rect x="38" y="112" width="160" height="9" rx="4" fill="var(--schrift-2)" opacity=".6"/>' +
    '<rect x="38" y="127" width="128" height="9" rx="4" fill="var(--schrift-2)" opacity=".4"/>' +

    ueber(222, 106, 'FARBE') + felder +

    ueber(38, 176, 'SPRACHE') +
    '<text x="38" y="198" font-size="13.5" fill="var(--gut)" font-family="var(--mono)">' +
    '&#10003; Noch 3 von 6 Stufen.</text>' +
    '<text x="38" y="218" font-size="13.5" fill="var(--schlecht)" font-family="var(--mono)">' +
    '&#10007; Wow, weiter so!</text>' +

    ueber(38, 252, 'FORM') +
    '<rect x="38" y="260" width="228" height="1" fill="var(--rand-hell)"/>' +
    '<text x="38" y="278" font-size="13" fill="var(--schrift-2)" font-family="var(--sans)">' +
    'Antwort · 2 bis 5 S&#228;tze</text>' +
    '<text x="38" y="296" font-size="13" fill="var(--schrift-2)" font-family="var(--sans)">' +
    'Absage · was, warum, wie weiter</text>' +

    ueber(300, 176, 'NIE') +
    '<text x="300" y="198" font-size="13" fill="var(--schrift-2)" font-family="var(--sans)">' +
    'Superlative</text>' +
    '<text x="300" y="216" font-size="13" fill="var(--schrift-2)" font-family="var(--sans)">' +
    'Ausrufezeichen</text>' +
    '<text x="300" y="234" font-size="13" fill="var(--schrift-2)" font-family="var(--sans)">' +
    'erfundene Zahlen</text>' +

    '<rect x="300" y="256" width="208" height="86" rx="7" fill="var(--grund-3)" ' +
    'stroke="var(--lapis)"/>' +
    '<text x="314" y="278" font-size="12.5" fill="var(--lapis)" font-family="var(--mono)">' +
    'SYSTEMPROMPT</text>' +
    '<text x="314" y="298" font-size="12" fill="var(--schrift-2)" font-family="var(--mono)">' +
    'Haltung: erkl&#228;ren.</text>' +
    '<text x="314" y="314" font-size="12" fill="var(--schrift-2)" font-family="var(--mono)">' +
    'Ansprache: du.</text>' +
    '<text x="314" y="330" font-size="12" fill="var(--schrift-2)" font-family="var(--mono)">' +
    'Form: 2-5 S&#228;tze.</text>'
  );
};

/* ================================================================ 3. Dialektik
   Zwei Kräfte, eine Grenze. Keine Waage — eine Waage suggeriert, man müsse
   ausgleichen. Man muss trennen. */

PU.zielBild.dialektik = function () {
  return buehne(
    '<rect x="14" y="30" width="252" height="150" rx="9" fill="var(--grund-2)" ' +
    'stroke="var(--rand-hell)"/>' +
    ueber(32, 58, 'STIL', 'var(--glut)') +
    '<text x="32" y="82" font-size="14" fill="var(--schrift)" font-family="var(--sans)">' +
    'unverwechselbar sein</text>' +
    '<text x="32" y="112" font-size="13" fill="var(--schrift-3)" font-family="var(--sans)">' +
    'Allein: f&#252;nf brillante Texte,</text>' +
    '<text x="32" y="130" font-size="13" fill="var(--schrift-3)" font-family="var(--sans)">' +
    'f&#252;nf verschiedene H&#228;user.</text>' +
    '<path d="M32 148 h96" stroke="var(--glut)" stroke-width="3"/>' +
    '<path d="M136 148 h20" stroke="var(--glut)" stroke-width="3" opacity=".5"/>' +
    '<path d="M164 148 h10" stroke="var(--glut)" stroke-width="3" opacity=".25"/>' +

    '<rect x="294" y="30" width="252" height="150" rx="9" fill="var(--grund-2)" ' +
    'stroke="var(--rand-hell)"/>' +
    ueber(312, 58, 'KONSISTENZ', 'var(--lapis)') +
    '<text x="312" y="82" font-size="14" fill="var(--schrift)" font-family="var(--sans)">' +
    'verl&#228;sslich sein</text>' +
    '<text x="312" y="112" font-size="13" fill="var(--schrift-3)" font-family="var(--sans)">' +
    'Allein: fehlerfrei,</text>' +
    '<text x="312" y="130" font-size="13" fill="var(--schrift-3)" font-family="var(--sans)">' +
    'austauschbar, tot.</text>' +
    '<path d="M312 148 h126" stroke="var(--lapis)" stroke-width="3"/>' +
    '<path d="M446 148 h4" stroke="var(--lapis)" stroke-width="3"/>' +
    '<path d="M458 148 h4" stroke="var(--lapis)" stroke-width="3"/>' +

    '<path d="M140 180 L280 216 L420 180" fill="none" stroke="var(--rand-hell)" ' +
    'stroke-width="1.5" stroke-dasharray="4 4"/>' +

    '<rect x="66" y="226" width="428" height="128" rx="9" fill="var(--grund-3)" ' +
    'stroke="var(--gold)"/>' +
    schild(280, 252, 'DIE TRENNLINIE', 'var(--gold)') +
    '<path d="M280 264 V342" stroke="var(--gold)" stroke-width="2"/>' +
    '<text x="262" y="288" font-size="14" font-weight="700" fill="var(--schrift)" ' +
    'font-family="var(--sans)" text-anchor="end">FEST</text>' +
    '<text x="262" y="308" font-size="12.5" fill="var(--schrift-2)" font-family="var(--sans)" ' +
    'text-anchor="end">Haltung · Ansprache</text>' +
    '<text x="262" y="326" font-size="12.5" fill="var(--schrift-2)" font-family="var(--sans)" ' +
    'text-anchor="end">Farbsinn · L&#228;nge</text>' +
    '<text x="298" y="288" font-size="14" font-weight="700" fill="var(--schrift)" ' +
    'font-family="var(--sans)">FREI</text>' +
    '<text x="298" y="308" font-size="12.5" fill="var(--schrift-2)" font-family="var(--sans)">' +
    'Wortwahl · Beispiel</text>' +
    '<text x="298" y="326" font-size="12.5" fill="var(--schrift-2)" font-family="var(--sans)">' +
    'Satzbau · Reihenfolge</text>'
  );
};

/* ================================================================ 4. ChatBot
   Dieselbe Frage, zweimal gestellt. Links raten, rechts wissen. */

PU.zielBild.chatbot = function () {
  return buehne(
    '<rect x="14" y="14" width="252" height="352" rx="9" fill="var(--grund-2)" ' +
    'stroke="var(--rand-hell)"/>' +
    ueber(32, 40, 'OHNE VORGABE', 'var(--schlecht)') +
    blase(32, 54, 216, { zeilen: 1, h: 30, farbe: 'var(--grund-3)' }) +
    schild(140, 100, 'Frage 1') +
    blase(32, 110, 216, { zeilen: 4, h: 68 }) +
    blase(32, 190, 216, { zeilen: 1, h: 30, farbe: 'var(--grund-3)' }) +
    schild(140, 236, 'Frage 2') +
    blase(32, 246, 216, { zeilen: 6, h: 92 }) +
    '<text x="140" y="358" font-size="13" fill="var(--schlecht)" ' +
    'font-family="var(--sans)" text-anchor="middle">jedes Mal anders lang</text>' +

    '<rect x="294" y="14" width="252" height="352" rx="9" fill="var(--grund-2)" ' +
    'stroke="var(--glut)"/>' +
    ueber(312, 40, 'MIT GUIDELINE', 'var(--gut)') +
    '<rect x="312" y="50" width="216" height="34" rx="6" fill="var(--grund-3)" ' +
    'stroke="var(--lapis)"/>' +
    '<text x="322" y="63" font-size="11.5" fill="var(--lapis)" font-family="var(--mono)">' +
    'SYSTEMPROMPT</text>' +
    '<text x="322" y="77" font-size="11.5" fill="var(--schrift-2)" font-family="var(--mono)">' +
    'du · 2-5 S&#228;tze · erkl&#228;ren</text>' +
    blase(312, 96, 216, { zeilen: 1, h: 30, farbe: 'var(--grund-3)' }) +
    schild(420, 142, 'Frage 1') +
    blase(312, 152, 216, { zeilen: 3, h: 56, rand: 'var(--glut)' }) +
    blase(312, 220, 216, { zeilen: 1, h: 30, farbe: 'var(--grund-3)' }) +
    schild(420, 266, 'Frage 2') +
    blase(312, 276, 216, { zeilen: 3, h: 56, rand: 'var(--glut)' }) +
    '<text x="420" y="358" font-size="13" fill="var(--gut)" ' +
    'font-family="var(--sans)" text-anchor="middle">immer dieselbe Form</text>'
  );
};

/* ================================================================ 5. Agent
   Ein Agent schreibt nicht nur, er tut. Also gehört in die Guideline, wie er
   berichtet — und wo er stehenbleibt. */

PU.zielBild.agent = function () {
  return buehne(
    '<rect x="14" y="20" width="532" height="120" rx="9" fill="var(--grund-2)" ' +
    'stroke="var(--schlecht)"/>' +
    ueber(34, 46, 'OHNE REGEL', 'var(--schlecht)') +
    '<text x="34" y="86" font-size="21" fill="var(--schrift)" font-family="var(--mono)">' +
    '&#8250; Fertig.</text>' +
    '<text x="34" y="114" font-size="13" fill="var(--schrift-3)" font-family="var(--sans)">' +
    'Was getan? Was kam heraus? Was fehlt noch?</text>' +

    '<rect x="14" y="160" width="532" height="204" rx="9" fill="var(--grund-2)" ' +
    'stroke="var(--gut)"/>' +
    ueber(34, 186, 'MIT REGEL', 'var(--gut)') +
    '<text x="34" y="216" font-size="14" fill="var(--schrift)" font-family="var(--mono)">' +
    '&#8250; 24 Aufgaben geprüft.</text>' +
    '<text x="34" y="238" font-size="14" fill="var(--schrift)" font-family="var(--mono)">' +
    '&#8250; 21 richtig, 3 mit Tippfehler.</text>' +
    '<text x="34" y="260" font-size="14" fill="var(--schrift)" font-family="var(--mono)">' +
    '&#8250; Offen: Aufgabe 17, kein Text.</text>' +

    '<rect x="34" y="282" width="492" height="62" rx="7" fill="var(--grund-3)" ' +
    'stroke="var(--warn)"/>' +
    '<text x="48" y="304" font-size="12.5" fill="var(--warn)" font-family="var(--sans)" ' +
    'font-weight="700">HALT VOR DEM UNUMKEHRBAREN</text>' +
    '<text x="48" y="326" font-size="13" fill="var(--schrift-2)" font-family="var(--sans)">' +
    '&#8222;Ich w&#252;rde 3 Konten l&#246;schen. Soll ich?&#8220;</text>'
  );
};

/* ================================================================ 6. Mehr-Agenten
   Der teuerste Fehler wäre, den Absatz fünfmal zu schreiben. Eine Datei,
   fünf Verweise. */

PU.zielBild.system = function () {
  const rollen = [
    ['Tutor',    'antwortet Lernenden',  'var(--glut)'],
    ['Prüfer',   'bewertet Aufgaben',    'var(--gold)'],
    ['Sprecher', 'schreibt Vertontes',   'var(--lapis)'],
    ['Autor',    'schreibt Lektionen',   'var(--gut)']
  ];

  let kaesten = '';
  rollen.forEach((r, i) => {
    const x = 14 + i * 136;
    kaesten +=
      '<path d="M280 148 C280 190, ' + (x + 55) + ' 176, ' + (x + 55) + ' 218" ' +
      'fill="none" stroke="' + r[2] + '" stroke-width="1.6" opacity=".8"/>' +
      '<rect x="' + x + '" y="218" width="110" height="108" rx="8" fill="var(--grund-2)" ' +
      'stroke="' + r[2] + '"/>' +
      '<rect x="' + x + '" y="218" width="110" height="5" rx="5" fill="' + r[2] + '"/>' +
      '<text x="' + (x + 55) + '" y="248" font-size="14.5" font-weight="700" ' +
      'fill="var(--schrift)" font-family="var(--sans)" text-anchor="middle">' + r[0] + '</text>' +
      '<text x="' + (x + 55) + '" y="270" font-size="12" fill="var(--schrift-3)" ' +
      'font-family="var(--sans)" text-anchor="middle">' + r[1].split(' ')[0] + '</text>' +
      '<text x="' + (x + 55) + '" y="284" font-size="12" fill="var(--schrift-3)" ' +
      'font-family="var(--sans)" text-anchor="middle">' + r[1].split(' ').slice(1).join(' ') + '</text>' +
      '<rect x="' + (x + 16) + '" y="298" width="78" height="4" rx="2" fill="var(--schrift-3)" opacity=".45"/>' +
      '<rect x="' + (x + 16) + '" y="308" width="60" height="4" rx="2" fill="var(--schrift-3)" opacity=".45"/>';
  });

  return buehne(
    '<rect x="176" y="20" width="208" height="128" rx="9" fill="var(--grund-3)" ' +
    'stroke="var(--glut)" stroke-width="1.6"/>' +
    '<rect x="176" y="20" width="208" height="7" rx="7" fill="var(--glut)"/>' +
    '<text x="280" y="56" font-size="15" font-weight="700" fill="var(--schrift)" ' +
    'font-family="var(--serif)" text-anchor="middle">Brand-Guideline</text>' +
    '<text x="280" y="76" font-size="12" fill="var(--schrift-3)" ' +
    'font-family="var(--sans)" text-anchor="middle">eine Datei</text>' +
    '<rect x="198" y="92" width="164" height="5" rx="2.5" fill="var(--schrift-3)" opacity=".5"/>' +
    '<rect x="198" y="104" width="140" height="5" rx="2.5" fill="var(--schrift-3)" opacity=".5"/>' +
    '<rect x="198" y="116" width="164" height="5" rx="2.5" fill="var(--schrift-3)" opacity=".5"/>' +
    '<rect x="198" y="128" width="96" height="5" rx="2.5" fill="var(--schrift-3)" opacity=".5"/>' +
    kaesten +
    '<text x="280" y="352" font-size="13" fill="var(--schrift-2)" ' +
    'font-family="var(--sans)" text-anchor="middle">' +
    'unver&#228;ndert bei allen &#183; dazu je eine Rolle</text>' +
    '<text x="280" y="370" font-size="13" fill="var(--gold)" ' +
    'font-family="var(--sans)" text-anchor="middle">' +
    'Eine &#196;nderung oben wirkt unten viermal.</text>'
  );
};

/* ================================================================ 7. Schule */

PU.zielBild.schule = function () {
  return buehne(
    ueber(14, 26, 'EINE SCHULE, EIN GESICHT', 'var(--glut)') +
    blatt(14, 40, 168, 156, { kopf: 'var(--glut)', titel: 'Tag der offenen T&#252;r', zeilen: 3, knopf: true }) +
    blatt(196, 40, 168, 156, { kopf: 'var(--glut)', titel: 'Schulanmeldung', zeilen: 4 }) +
    blatt(378, 40, 168, 156, { kopf: 'var(--glut)', titel: 'Pressemitteilung', zeilen: 4 }) +
    schild(98, 214, 'Plakat, drau&#223;en') +
    schild(280, 214, 'Formular, Sekretariat') +
    schild(462, 214, 'Text, Zeitung') +

    '<rect x="14" y="238" width="532" height="126" rx="9" fill="var(--grund-3)" ' +
    'stroke="var(--rand-hell)"/>' +
    ueber(34, 266, 'WAS DIE GUIDELINE HIER REGELT') +
    '<text x="34" y="292" font-size="13" fill="var(--schrift-2)" font-family="var(--sans)">' +
    '&#183; Wie das Sekretariat auf eine Absage antwortet</text>' +
    '<text x="34" y="312" font-size="13" fill="var(--schrift-2)" font-family="var(--sans)">' +
    '&#183; Ob im Elternbrief geduzt oder gesiezt wird &#8212; &#252;berall gleich</text>' +
    '<text x="34" y="332" font-size="13" fill="var(--schrift-2)" font-family="var(--sans)">' +
    '&#183; Welche Farbe die Schule ist, und welche sie nie ist</text>' +
    '<text x="34" y="352" font-size="13" fill="var(--schrift-2)" font-family="var(--sans)">' +
    '&#183; Was der Schul-ChatBot antwortet, wenn er etwas nicht wei&#223;</text>'
  );
};

/* ================================================================ 8. Lehrer */

PU.zielBild.lehrer = function () {
  return buehne(
    ueber(14, 26, 'DREI FL&#196;CHEN, EIN UNTERRICHT', 'var(--lapis)') +
    blatt(14, 40, 168, 150, { kopf: 'var(--lapis)', titel: 'Arbeitsblatt', zeilen: 5 }) +
    '<rect x="196" y="40" width="168" height="150" rx="6" fill="var(--grund-2)" ' +
    'stroke="var(--rand-hell)"/>' +
    '<rect x="196" y="40" width="168" height="7" rx="6" fill="var(--lapis)"/>' +
    '<rect x="196" y="44" width="168" height="3" fill="var(--lapis)"/>' +
    '<text x="280" y="88" font-size="16" font-weight="700" fill="var(--schrift)" ' +
    'font-family="var(--serif)" text-anchor="middle">Was ist</text>' +
    '<text x="280" y="110" font-size="16" font-weight="700" fill="var(--lapis)" ' +
    'font-family="var(--serif)" text-anchor="middle">ein Token?</text>' +
    '<rect x="228" y="132" width="104" height="4" rx="2" fill="var(--schrift-3)" opacity=".5"/>' +
    '<rect x="242" y="144" width="76" height="4" rx="2" fill="var(--schrift-3)" opacity=".5"/>' +
    blatt(378, 40, 168, 150, { kopf: 'var(--lapis)', titel: 'Elterninfo', zeilen: 4 }) +
    schild(98, 208, 'Papier') + schild(280, 208, 'Projektion') + schild(462, 208, 'Nach Hause') +

    '<rect x="14" y="232" width="532" height="132" rx="9" fill="var(--grund-2)" ' +
    'stroke="var(--lapis)"/>' +
    ueber(34, 258, 'DER BILDUNGSAUFTRAG IM DOKUMENT', 'var(--lapis)') +
    '<text x="34" y="286" font-size="13.5" fill="var(--schrift)" font-family="var(--sans)">' +
    '&#8222;Ich sage nie, etwas sei einfach.&#8220;</text>' +
    '<text x="34" y="308" font-size="13" fill="var(--schrift-3)" font-family="var(--sans)">' +
    'Wer es dann nicht schafft, h&#228;lt sich f&#252;r dumm. Das ist keine</text>' +
    '<text x="34" y="326" font-size="13" fill="var(--schrift-3)" font-family="var(--sans)">' +
    'Geschmacksfrage, sondern P&#228;dagogik &#8212; und sie geh&#246;rt aufgeschrieben,</text>' +
    '<text x="34" y="344" font-size="13" fill="var(--schrift-3)" font-family="var(--sans)">' +
    'sonst gilt sie nur, solange man daran denkt.</text>'
  );
};

/* ================================================================ 9. Eltern */

PU.zielBild.eltern = function () {
  const faecher = [
    ['Handwerk',  'Angebot',        'var(--glut)'],
    ['Praxis',    'Aushang',        'var(--gut)'],
    ['Gastro',    'Karte',          'var(--gold)'],
    ['B&#252;ro', 'Bewerbung',      'var(--lapis)']
  ];
  let s = ueber(14, 26, 'DIESELBE METHODE, VIER BERUFE');
  faecher.forEach((f, i) => {
    const x = 14 + i * 136;
    s += blatt(x, 40, 110, 132, { kopf: f[2], titel: f[1], zeilen: 3, marke: true }) +
         schild(x + 55, 190, f[0], f[2]);
  });

  return buehne(
    s +
    '<rect x="14" y="212" width="532" height="152" rx="9" fill="var(--grund-3)" ' +
    'stroke="var(--rand-hell)"/>' +
    ueber(34, 240, 'DER SATZ, DER DAS GELD SPART') +
    '<text x="34" y="270" font-size="14" fill="var(--schrift)" font-family="var(--sans)">' +
    'Ein Angebot schreiben lassen, ohne jedes Mal zu erkl&#228;ren,</text>' +
    '<text x="34" y="290" font-size="14" fill="var(--schrift)" font-family="var(--sans)">' +
    'wie man schreibt.</text>' +
    '<text x="34" y="322" font-size="13" fill="var(--schrift-3)" font-family="var(--sans)">' +
    'Ohne Dokument: die Stilvorgabe wandert in jeden einzelnen Auftrag &#8212;</text>' +
    '<text x="34" y="340" font-size="13" fill="var(--schrift-3)" font-family="var(--sans)">' +
    'jedes Mal neu getippt, jedes Mal etwas anders.</text>' +
    '<text x="34" y="358" font-size="13" fill="var(--gold)" font-family="var(--sans)">' +
    'Mit Dokument: einmal oben, danach nie wieder.</text>'
  );
};

/* ================================================================ 10. Schüler */

PU.zielBild.schueler = function () {
  return buehne(
    ueber(14, 26, 'PRAKTISCH', 'var(--glut)') +
    blatt(14, 40, 168, 140, { kopf: 'var(--glut)', titel: 'Bewerbung', zeilen: 4 }) +
    blatt(196, 40, 168, 140, { kopf: 'var(--glut)', titel: 'Referat', zeilen: 4 }) +
    blatt(378, 40, 168, 140, { kopf: 'var(--glut)', titel: 'Vereinsplakat', zeilen: 3, knopf: true }) +
    schild(98, 198, 'Praktikumsplatz') +
    schild(280, 198, 'Vortrag, Klasse 9') +
    schild(462, 198, 'Turnier am Samstag') +

    ueber(14, 236, 'PRIVAT', 'var(--gold)') +
    '<rect x="14" y="250" width="252" height="114" rx="9" fill="var(--grund-2)" ' +
    'stroke="var(--gold)"/>' +
    '<circle cx="52" cy="288" r="18" fill="var(--grund-3)" stroke="var(--gold)"/>' +
    '<rect x="80" y="278" width="120" height="7" rx="3.5" fill="var(--schrift-2)" opacity=".8"/>' +
    '<rect x="80" y="292" width="86" height="6" rx="3" fill="var(--schrift-3)" opacity=".6"/>' +
    '<rect x="32" y="322" width="216" height="5" rx="2.5" fill="var(--schrift-3)" opacity=".45"/>' +
    '<rect x="32" y="334" width="164" height="5" rx="2.5" fill="var(--schrift-3)" opacity=".45"/>' +
    schild(140, 358, 'eigener Kanal') +

    '<rect x="294" y="250" width="252" height="114" rx="9" fill="var(--grund-3)" ' +
    'stroke="var(--rand-hell)"/>' +
    '<text x="312" y="278" font-size="13" fill="var(--schrift-2)" font-family="var(--sans)">' +
    'Der eigene Bot antwortet</text>' +
    '<text x="312" y="298" font-size="13" fill="var(--schrift-2)" font-family="var(--sans)">' +
    'so, wie du schreibst &#8212; nicht so,</text>' +
    '<text x="312" y="318" font-size="13" fill="var(--schrift-2)" font-family="var(--sans)">' +
    'wie ein Modell ab Werk schreibt.</text>' +
    '<text x="312" y="346" font-size="13" fill="var(--gold)" font-family="var(--sans)">' +
    'Das ist der ganze Unterschied.</text>'
  );
};

/* ================================================================ 11. Das Paket
   Was im Ordner liegt, wenn der Kurs vorbei ist. Dateinamen statt Symbolen:
   Ein Paket, dessen Inhalt man nicht lesen kann, wirkt wie ein Versprechen —
   eine Dateiliste ist eine Auskunft. */

PU.zielBild.paket = function () {
  const dateien = [
    ['BRAND.md',           'dein Dokument, zwei Seiten', 'var(--glut)'],
    ['systemprompt.txt',   'der Baustein zum Einsetzen', 'var(--lapis)'],
    ['index.html',         'deine Seite',                'var(--gut)'],
    ['stil.css',           'deine Farben als Tokens',    'var(--gut)'],
    ['PRUEFLISTE.md',      'zehn Fragen vor dem Abgeben','var(--gold)'],
    ['LIZENZ.md',          'MIT · Apache 2.0',           'var(--schrift-2)']
  ];

  let liste = '';
  dateien.forEach((d, i) => {
    const y = 78 + i * 34;
    liste +=
      '<rect x="30" y="' + y + '" width="368" height="26" rx="5" ' +
      'fill="var(--grund-3)" stroke="var(--rand)"/>' +
      '<rect x="30" y="' + y + '" width="3.5" height="26" rx="2" fill="' + d[2] + '"/>' +
      '<text x="44" y="' + (y + 18) + '" font-size="13" fill="var(--schrift)" ' +
      'font-family="var(--mono)">' + d[0] + '</text>' +
      '<text x="390" y="' + (y + 18) + '" font-size="12" fill="var(--schrift-3)" ' +
      'font-family="var(--sans)" text-anchor="end">' + d[1] + '</text>';
  });

  return buehne(
    '<rect x="14" y="14" width="532" height="352" rx="10" fill="var(--grund-2)" ' +
    'stroke="var(--rand-hell)"/>' +
    '<rect x="14" y="14" width="532" height="9" rx="9" fill="var(--gold)"/>' +
    '<rect x="14" y="18" width="532" height="5" fill="var(--gold)"/>' +
    '<text x="30" y="52" font-size="15.5" font-weight="700" fill="var(--schrift)" ' +
    'font-family="var(--mono)">meine-marke.zip</text>' +
    liste +

    /* Die beiden Siegel stehen rechts als Spalte, nicht unter der Liste: Sie
       gehören nicht zu einer Datei, sie gelten für das ganze Paket. */
    '<rect x="414" y="78" width="118" height="118" rx="9" fill="var(--grund-3)" ' +
    'stroke="var(--gut)"/>' +
    '<text x="473" y="112" font-size="15" font-weight="700" fill="var(--gut)" ' +
    'font-family="var(--sans)" text-anchor="middle">MIT</text>' +
    '<text x="473" y="140" font-size="12" fill="var(--schrift-2)" ' +
    'font-family="var(--sans)" text-anchor="middle">benutzen,</text>' +
    '<text x="473" y="158" font-size="12" fill="var(--schrift-2)" ' +
    'font-family="var(--sans)" text-anchor="middle">&#228;ndern,</text>' +
    '<text x="473" y="176" font-size="12" fill="var(--schrift-2)" ' +
    'font-family="var(--sans)" text-anchor="middle">verkaufen</text>' +

    '<rect x="414" y="208" width="118" height="118" rx="9" fill="var(--grund-3)" ' +
    'stroke="var(--lapis)"/>' +
    '<text x="473" y="242" font-size="15" font-weight="700" fill="var(--lapis)" ' +
    'font-family="var(--sans)" text-anchor="middle">Apache 2</text>' +
    '<text x="473" y="270" font-size="12" fill="var(--schrift-2)" ' +
    'font-family="var(--sans)" text-anchor="middle">dasselbe,</text>' +
    '<text x="473" y="288" font-size="12" fill="var(--schrift-2)" ' +
    'font-family="var(--sans)" text-anchor="middle">plus Patent-</text>' +
    '<text x="473" y="306" font-size="12" fill="var(--schrift-2)" ' +
    'font-family="var(--sans)" text-anchor="middle">zusage</text>' +

    '<rect x="30" y="286" width="368" height="66" rx="7" fill="var(--grund-3)" ' +
    'stroke="var(--gold)"/>' +
    '<text x="44" y="310" font-size="12.5" font-weight="700" fill="var(--gold)" ' +
    'font-family="var(--sans)">DEINE INHALTE GEH&#214;REN DIR</text>' +
    '<text x="44" y="332" font-size="12" fill="var(--schrift-2)" ' +
    'font-family="var(--sans)">Die Lizenz gilt f&#252;r Vorlage und Bausteine,</text>' +
    '<text x="44" y="348" font-size="12" fill="var(--schrift-2)" ' +
    'font-family="var(--sans)">nicht f&#252;r das, was du hineingeschrieben hast.</text>'
  );
};

/* ================================================================ 12. Ergebnis */

PU.zielBild.ergebnis = function () {
  const stuecke = [
    ['Das Dokument',   'zwei Seiten, acht Felder'],
    ['Der Baustein',   'f&#252;r jeden Systemprompt'],
    ['Die Webseite',   'gebaut nach dem Dokument'],
    ['Die Pr&#252;fliste', 'zehn Fragen vor dem Abgeben']
  ];
  let s = '';
  stuecke.forEach((st, i) => {
    const y = 30 + i * 84;
    s += '<rect x="14" y="' + y + '" width="532" height="70" rx="8" fill="var(--grund-2)" ' +
         'stroke="var(--rand-hell)"/>' +
         '<rect x="14" y="' + y + '" width="4" height="70" rx="2" fill="var(--gold)"/>' +
         '<text x="36" y="' + (y + 30) + '" font-size="15.5" font-weight="700" ' +
         'fill="var(--schrift)" font-family="var(--serif)">' + st[0] + '</text>' +
         '<text x="36" y="' + (y + 52) + '" font-size="13" fill="var(--schrift-3)" ' +
         'font-family="var(--sans)">' + st[1] + '</text>' +
         '<text x="524" y="' + (y + 42) + '" font-size="19" fill="var(--gold)" ' +
         'font-family="var(--sans)" text-anchor="end">&#10003;</text>';
  });
  return buehne(s);
};

/* ================================================================ Aufmacher

   Das Bild neben dem Kopf der Zielseite. Es hat eine andere Aufgabe als die
   elf darunter: Die erklären, dieses hier soll in zwei Sekunden den Satz
   zeigen, um den es geht — einmal beschreiben, überall zurückbekommen.

   Deshalb kein Beispiel, sondern eine Bewegung: links das Dokument, rechts
   drei Ausgaben, dazwischen der Weg. Wer nur das Bild ansieht und weitergeht,
   hat den Kern trotzdem gesehen. */

PU.zielBild.kopfbild = function () {
  const ausgaben = [
    ['Chat',    'var(--glut)'],
    ['Seite',   'var(--gold)'],
    ['Brief',   'var(--lapis)']
  ];

  let rechts = '';
  ausgaben.forEach((a, i) => {
    const y = 34 + i * 110;
    rechts +=
      '<path d="M258 190 C300 190, 320 ' + (y + 45) + ', 356 ' + (y + 45) + '" ' +
      'fill="none" stroke="' + a[1] + '" stroke-width="1.8" opacity=".75"/>' +
      '<rect x="356" y="' + y + '" width="190" height="90" rx="8" ' +
      'fill="var(--grund-2)" stroke="' + a[1] + '"/>' +
      '<rect x="356" y="' + y + '" width="190" height="5" rx="5" fill="' + a[1] + '"/>' +
      '<text x="372" y="' + (y + 30) + '" font-size="14" font-weight="700" ' +
      'fill="var(--schrift)" font-family="var(--sans)">' + a[0] + '</text>' +
      '<rect x="372" y="' + (y + 42) + '" width="158" height="5" rx="2.5" fill="var(--schrift-3)" opacity=".5"/>' +
      '<rect x="372" y="' + (y + 54) + '" width="140" height="5" rx="2.5" fill="var(--schrift-3)" opacity=".5"/>' +
      '<rect x="372" y="' + (y + 66) + '" width="96"  height="5" rx="2.5" fill="var(--schrift-3)" opacity=".5"/>';
  });

  return buehne(
    '<rect x="14" y="96" width="230" height="190" rx="10" fill="var(--grund-3)" ' +
    'stroke="var(--glut)" stroke-width="1.6"/>' +
    '<rect x="14" y="96" width="230" height="8" rx="8" fill="var(--glut)"/>' +
    '<text x="129" y="136" font-size="16" font-weight="700" fill="var(--schrift)" ' +
    'font-family="var(--serif)" text-anchor="middle">Deine</text>' +
    '<text x="129" y="158" font-size="16" font-weight="700" fill="var(--glut)" ' +
    'font-family="var(--serif)" text-anchor="middle">Handschrift</text>' +
    '<text x="129" y="180" font-size="12.5" fill="var(--schrift-3)" ' +
    'font-family="var(--sans)" text-anchor="middle">einmal beschrieben</text>' +
    '<rect x="42" y="202" width="174" height="6" rx="3" fill="var(--schrift-3)" opacity=".45"/>' +
    '<rect x="42" y="216" width="148" height="6" rx="3" fill="var(--schrift-3)" opacity=".45"/>' +
    '<rect x="42" y="230" width="174" height="6" rx="3" fill="var(--schrift-3)" opacity=".45"/>' +
    '<rect x="42" y="244" width="110" height="6" rx="3" fill="var(--schrift-3)" opacity=".45"/>' +
    '<text x="129" y="272" font-size="12" fill="var(--gold)" ' +
    'font-family="var(--mono)" text-anchor="middle">BRAND.md</text>' +
    rechts +
    '<text x="280" y="356" font-size="13" fill="var(--schrift-2)" ' +
    'font-family="var(--sans)" text-anchor="middle">' +
    '&#252;berall dieselbe Stimme &#8212; ohne sie je wieder einzutippen</text>'
  );
};
