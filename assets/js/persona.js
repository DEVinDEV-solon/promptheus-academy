/* PROMPTHEUS — Die Persona-Vorschau hinter dem „P" im Kopf.
 *
 * Dieselbe Lektion mit fremden Augen ansehen: Der Tutor antwortet dann so, wie
 * er einem Zwölfjährigen antworten würde, und die Aufnahmen sind die für
 * Lernende. Gedacht für den Vergleich — man fragt dasselbe zweimal und sieht,
 * ob die Dialektik trägt.
 *
 * **Zwei Dinge, die dieses Fenster leisten muss, und beide sind unauffällig:**
 *
 * 1. Man muss jederzeit sehen, dass eine Persona aktiv ist. Wer vergisst, dass
 *    er als Schüler unterwegs ist, hält eine kindgerechte Antwort für die
 *    Antwort des Tutors — und bessert am falschen Ende nach. Deshalb das Band
 *    unter dem Kopf, nicht nur ein anderer Knopfzustand.
 * 2. Man muss mit EINEM Klick zurück. Der Zurück-Knopf steht deshalb im Band
 *    und nicht im Menü, das man erst öffnen müsste.
 */
'use strict';

PU.persona = null;

/* Der Aufbau. Läuft einmal beim Start; ohne den Knopf (also für alle ausser
   Ebene 1) passiert gar nichts. */
PU.personaStart = function () {
  const knopf = document.getElementById('knopf-persona');
  if (!knopf) return;

  knopf.addEventListener('click', (e) => {
    e.stopPropagation();
    const offen = document.getElementById('persona-menue');
    if (offen) { personaMenueZu(); return; }
    personaMenueAuf(knopf);
  });

  // Beim Laden holen, was gilt: Eine Persona überlebt das Neuladen der Seite,
  // weil sie in der Sitzung steht. Ohne diesen Aufruf stünde nach F5 kein
  // Band mehr da, obwohl der Tutor weiter als Schüler antwortet.
  PU.ruf('persona').then(j => {
    PU.persona = j.jetzt || null;
    personaBandZeichnen();
  }).catch(() => {});
};

/* ---------------------------------------------------------------- Das Menü */

async function personaMenueAuf(knopf) {
  let j;
  try { j = await PU.ruf('persona'); }
  catch (e) { PU.melden(PU.h(e.message), 'schlecht'); return; }

  PU.persona = j.jetzt || null;

  const menue = PU.el('div', 'persona-menue');
  menue.id = 'persona-menue';
  menue.setAttribute('role', 'menu');

  menue.appendChild(PU.el('div', 'persona-kopf',
    'Kurs mit fremden Augen ansehen'));
  const hinweis = PU.el('p', 'persona-warum');
  hinweis.textContent = 'Ändert, wie die Tutoren antworten und welche Aufnahmen '
                      + 'du hörst. Deine Rechte bleiben, wie sie sind.';
  menue.appendChild(hinweis);

  j.personen.forEach(p => {
    const klassen = Object.keys(p.klassen || {});
    if (!klassen.length) {
      menue.appendChild(personaZeile(p.schluessel, '', p.name, p.was, p.alter));
      return;
    }
    /* Für Lernende eine Zeile je Klasse. Das Alter ist hier die eigentliche
       Stellschraube — zwischen 5a und Q1 liegen sieben Jahre, und der Tutor
       redet mit einem Zehnjährigen anders als mit einem Siebzehnjährigen.
       Genau dieser Unterschied soll vergleichbar werden. */
    menue.appendChild(PU.el('div', 'persona-trenner', p.name));
    klassen.forEach(k => {
      menue.appendChild(personaZeile(p.schluessel, k, k, p.was, p.klassen[k]));
    });
  });

  if (PU.persona) {
    const zurueck = PU.el('button', 'persona-zeile persona-zurueck',
                          '↩ Zurück zu mir selbst');
    zurueck.type = 'button';
    zurueck.addEventListener('click', () => personaWaehlen('', ''));
    menue.appendChild(zurueck);
  }

  document.body.appendChild(menue);
  knopf.setAttribute('aria-expanded', 'true');

  // Ausserhalb klicken oder Esc schliesst. Der Horcher hängt am Dokument und
  // wird beim Schliessen wieder abgenommen — sonst sammeln sich bei jedem
  // Öffnen neue an.
  setTimeout(() => {
    document.addEventListener('click', personaMenueZu);
    document.addEventListener('keydown', personaEscape);
  }, 0);

  const r = knopf.getBoundingClientRect();
  menue.style.top   = (r.bottom + 6) + 'px';
  menue.style.right = Math.max(8, window.innerWidth - r.right) + 'px';
  menue.addEventListener('click', e => e.stopPropagation());
}

function personaZeile(schluessel, klasse, name, was, alter) {
  const jetzt = PU.persona;
  const aktiv = jetzt && jetzt.schluessel === schluessel &&
                (klasse === '' || jetzt.gruppe === klasse);

  const k = PU.el('button', 'persona-zeile' + (aktiv ? ' aktiv' : ''));
  k.type = 'button';
  k.setAttribute('role', 'menuitem');
  k.innerHTML = '<span class="persona-name">' + PU.h(name) +
                '<span class="persona-alter">' + alter + ' J.</span></span>' +
                '<span class="persona-was">' + PU.h(was) + '</span>';
  k.addEventListener('click', () => personaWaehlen(schluessel, klasse));
  return k;
}

function personaMenueZu() {
  const m = document.getElementById('persona-menue');
  if (m) m.remove();
  const k = document.getElementById('knopf-persona');
  if (k) k.setAttribute('aria-expanded', 'false');
  document.removeEventListener('click', personaMenueZu);
  document.removeEventListener('keydown', personaEscape);
}

function personaEscape(e) { if (e.key === 'Escape') personaMenueZu(); }

/* ---------------------------------------------------------------- Wechseln */

async function personaWaehlen(schluessel, klasse) {
  personaMenueZu();
  try {
    const j = await PU.ruf('persona_setzen', { persona: schluessel, klasse: klasse });
    PU.persona = j.jetzt || null;
  } catch (e) {
    PU.melden(PU.h(e.message), 'schlecht');
    return;
  }

  personaBandZeichnen();

  /* Die offene Ansicht neu zeichnen, damit die Aufnahmen zur neuen Persona
     passen. Der Tutorverlauf bleibt absichtlich stehen: Er ist ja genau das,
     was verglichen werden soll — die alte Antwort oben, die neue darunter. */
  const a = PU.ANSICHTEN[PU.aktuell];
  if (a && a.zeichnen) a.zeichnen();

  PU.melden(PU.persona
    ? 'Du siehst die Academy jetzt als <b>' + PU.h(PU.persona.name) +
      (PU.persona.gruppe ? ', ' + PU.h(PU.persona.gruppe) : '') + '</b>. ' +
      'Frag den Tutor dasselbe noch einmal.'
    : 'Zurück in der eigenen Sicht.', 'gold');
}

/* ---------------------------------------------------------------- Das Band */

function personaBandZeichnen() {
  const alt = document.getElementById('persona-band');
  if (alt) alt.remove();
  document.body.classList.toggle('mit-persona', !!PU.persona);
  if (!PU.persona) return;

  const p = PU.persona;
  const band = PU.el('div', 'persona-band');
  band.id = 'persona-band';
  band.setAttribute('role', 'status');
  band.innerHTML =
    '<span class="persona-band-marke">Vorschau</span>' +
    '<span>Du siehst alles als <b>' + PU.h(p.name) + '</b>' +
    (p.gruppe ? ', Klasse ' + PU.h(p.gruppe) : '') +
    ', ' + p.lebensalter + ' Jahre. Deine Rechte sind unverändert.</span>';

  const zurueck = PU.el('button', 'knopf still schmal', 'Zurück zu mir');
  zurueck.type = 'button';
  zurueck.addEventListener('click', () => personaWaehlen('', ''));
  band.appendChild(zurueck);

  const kopf = document.querySelector('header.kopf');
  if (kopf && kopf.parentNode) kopf.parentNode.insertBefore(band, kopf.nextSibling);
  else document.body.prepend(band);
}
