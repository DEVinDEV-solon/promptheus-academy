/* PROMPTHEUS — Die vier Tutoren, ein Gespräch.
 *
 * **Ein Chat, vier Agenten.** Vorher standen oben vier Karten zum Auswählen —
 * man musste sich also entscheiden, *bevor* man wusste, was man fragen will.
 * Jetzt läuft ein einziges Gespräch, und wen man anspricht, entscheidet man
 * im Satz: `@athena was fehlt meiner Antwort noch?`
 *
 * Das ist näher an dem, wie man mit Menschen redet. Und es macht den
 * Unterschied zwischen den vieren sichtbar, statt ihn zur Vorbedingung zu
 * machen: wer @hermes anspricht, sieht an der Antwort, wofür Hermes gut ist.
 *
 * Ohne Anrede antwortet Prometheus, der Haupttutor. Wer einfach nur eine
 * Frage hat, muss über die Rollenverteilung gar nicht nachdenken.
 *
 * Sie erklären, sie bewerten nicht. Das steht auch auf der Seite, damit
 * niemand den Tutor fragt, ob die Punkte nicht doch anders sein könnten.
 */
'use strict';

PU.AGENTEN = [
  { kennung: 'prometheus', name: 'Prometheus', symbol: '🔥',
    rolle: 'Haupttutor — erklärt Begriffe, ordnet ein, motiviert.' },
  { kennung: 'athena', name: 'Athena', symbol: '🦉',
    rolle: 'Prüferin — sagt dir, was an einer Antwort noch fehlt.' },
  { kennung: 'hermes', name: 'Hermes', symbol: '📚',
    rolle: 'Bibliothekar — findet Stoff und Quellen im Wissensspeicher.' },
  { kennung: 'hephaistos', name: 'Hephaistos', symbol: '⚒️',
    rolle: 'Werkzeugmeister — hilft bei Code, APIs und Kryptografie.' }
];

PU.tutorZustand = { verlauf: [] };

/**
 * Wen spricht dieser Satz an?
 *
 * Die Anrede wird aus dem Text gelesen und dabei **entfernt** — was an das
 * Modell geht, ist die Frage, nicht die Adressierung. Steht keine drin,
 * antwortet Prometheus.
 *
 * Mehrere Anreden in einem Satz: die erste gilt. Vier Tutoren gleichzeitig zu
 * fragen wäre viermal dieselbe Rechnung für eine Antwort, die niemand liest.
 */
PU.tutorAnrede = function (text) {
  const treffer = text.match(/@([a-zäöü]+)/i);
  if (!treffer) return { agent: 'prometheus', frage: text.trim(), genannt: false };

  const a = PU.AGENTEN.find(x => x.kennung === treffer[1].toLowerCase());
  if (!a) return { agent: 'prometheus', frage: text.trim(), genannt: false };

  return {
    agent: a.kennung,
    frage: text.replace(treffer[0], '').replace(/\s{2,}/g, ' ').trim(),
    genannt: true
  };
};

/**
 * Das Gespräch der Tutor-Ansicht leeren.
 *
 * Wie im Seitenmenü gilt: Der Verlauf steht nur im Browser und wird bei keiner
 * Frage mitgeschickt — es gibt keine Sitzung am Server, die hier endete. Was
 * verschwindet, ist die Anzeige.
 *
 * Zwei Dinge werden mit aufgeräumt, die man leicht vergisst: das halb getippte
 * Feld und der Blick. Wer „Neu" drückt, will vorn anfangen und nicht neben
 * einem leeren Gespräch seinen alten Satz stehen sehen.
 */
PU.tutorNeuAnsicht = function () {
  PU.tutorZustand.verlauf = [];

  const g = document.getElementById('tutor-gespraech');
  if (g) g.innerHTML = '';

  const feld = document.querySelector('#view-tutor .tutor-form textarea');
  if (feld) { feld.value = ''; feld.focus(); }
};

/**
 * Der Zeiger springt ins Eingabefeld.
 *
 * **Wer den Tutor aufruft, will etwas fragen** — nicht erst ein Feld suchen und
 * anklicken. Ein Chat, der mit einem Klick beginnt, den man ohnehin gleich
 * macht, verlangt ihn ohne Grund.
 *
 * Warum verzögert: Die Ansicht wird sichtbar geschaltet, bevor sie zeichnet,
 * aber der Klick, der hierher geführt hat, ist noch nicht fertig — ein
 * Menüknopf holt sich den Blick beim Loslassen zurück. Der Sprung in den
 * nächsten Bilddurchlauf lässt ihn erst zu Ende gehen.
 *
 * `preventScroll`, weil `PU.wechsel` gerade nach oben gescrollt hat: Ein Feld
 * unten im Bild würde die Seite sofort wieder hinunterziehen.
 */
function feldFokus() {
  requestAnimationFrame(() => {
    const feld = document.querySelector('#view-tutor .tutor-form textarea');
    if (feld) feld.focus({ preventScroll: true });
  });
}

PU.tutorZeichnen = function () {
  const ziel = document.getElementById('view-tutor');

  // Beim zweiten Besuch steht alles schon — der Blick gehört trotzdem ins
  // Feld. Vorher endete dieser Weg hier, und man landete nirgends.
  if (ziel.dataset.bereit === '1') { feldFokus(); return; }

  ziel.dataset.bereit = '1';
  ziel.innerHTML = '';

  // Zwei Spalten: das Gespräch bekommt zwei Drittel, daneben steht, wer die
  // vier sind. Über die ganze Breite war der Chat eine sehr lange Zeile — und
  // lange Zeilen liest niemand gern.
  //
  // Der Titel steht IN der linken Spalte, nicht darüber. Stand er über dem
  // Gitter, begann die Karte rechts erst unterhalb von ihm und liess oben
  // einen Streifen leer; so fangen beide Spalten auf derselben Höhe an.
  const gitter = PU.el('div', 'mit-spalte');
  const links  = PU.el('div', 'tutor-spalte');
  const kopfkarte = PU.el('div', 'textkarte titelkarte');
  kopfkarte.appendChild(PU.el('h1', '', 'Frag einen Tutor'));
  // Ein Satz, kein Absatz: wie die Anrede funktioniert, steht rechts neben
  // den Tutoren. Hier steht nur, was jemanden zum Fragen bringt — nämlich
  // dass Fragen nichts kostet.
  kopfkarte.appendChild(PU.el('p', 'hinweis',
    'Vier Tutoren, ein Gespräch. Frag ruhig zweimal dasselbe — ungeduldig ' +
    'werden sie nicht, und Punkte kostet es dich keine.'));

  /* Von vorn anfangen — derselbe Knopf wie im rechten Seitenmenü, damit man
     ihn nicht an zwei Orten verschieden suchen muss. Er steht in der Kopfkarte
     und nicht über dem Eingabefeld: Unten liegt „Abschicken", und ein Knopf,
     der direkt daneben das Geschriebene wegräumt, wird irgendwann versehentlich
     getroffen. */
  const neu = PU.el('button', 'knopf still schmal tutor-neu', 'Neu');
  neu.type  = 'button';
  neu.title = 'Von vorn anfangen';
  neu.addEventListener('click', PU.tutorNeuAnsicht);
  kopfkarte.appendChild(neu);

  links.appendChild(kopfkarte);
  gitter.appendChild(links);
  gitter.appendChild(tutorSeitenkarte());
  ziel.appendChild(gitter);

  const gespraech = PU.el('div', 'gespraech');
  gespraech.id = 'tutor-gespraech';
  links.appendChild(gespraech);

  const form = document.createElement('form');
  form.className = 'tutor-form';
  form.innerHTML =
    '<div class="tutor-anreden"></div>' +
    '<div class="tutor-eingabe">' +
      '<textarea name="frage" rows="1" required ' +
        'placeholder="Frag etwas — oder sprich einen Tutor mit @ an"></textarea>' +
      '<span class="eingabe-werkzeuge"></span>' +
      '<button class="knopf schick" type="submit" title="Abschicken (Return oder Strg+Return)" ' +
        'aria-label="Frage abschicken">➤</button>' +
    '</div>';
  links.appendChild(form);

  // Das Mikrofon steht zwischen Feld und Absenden — dieselbe Reihe, aber ein
  // eigener Knopf: aufnehmen und abschicken sind zwei Entscheidungen, und wer
  // sie zu einer macht, verschickt irgendwann etwas, das niemand sagen wollte.
  if (PU.mikroKnopfBauen) {
    PU.mikroKnopfBauen(form, k => form.querySelector('.eingabe-werkzeuge').appendChild(k));
  }

  // -------- Die Anrede-Knöpfe
  //
  // Sie schreiben `@name ` in das Feld, statt eine Auswahl umzustellen.
  // Dadurch steht die Anrede sichtbar im Satz und lässt sich ändern oder
  // löschen wie jedes andere Wort — ein Schalter, den man nicht sieht,
  // steht irgendwann falsch.
  const reihe = form.querySelector('.tutor-anreden');
  PU.AGENTEN.forEach(a => {
    const k = PU.el('button', 'anrede-knopf', a.symbol + ' @' + a.kennung);
    k.type  = 'button';
    k.title = a.rolle;
    k.addEventListener('click', () => anredeSetzen(form.frage, a.kennung));
    reihe.appendChild(k);
  });

  const feld = form.frage;
  feld.addEventListener('input', () => hoeheAnpassen(feld));

  // Return schickt ab, Umschalt+Return macht eine neue Zeile — und Strg+Return
  // schickt ebenfalls, damit derselbe Griff in allen drei Chats funktioniert.
  // Die Regel steht in PU.tastenSenden (app.js) und nicht dreimal einzeln da.
  PU.tastenSenden(feld, form, true);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const roh = feld.value.trim();
    if (!roh) return;

    const { agent, frage, genannt } = PU.tutorAnrede(roh);
    if (frage === '') {
      PU.melden('Da fehlt noch die Frage — die Anrede allein reicht nicht.', 'schlecht');
      return;
    }

    feld.value = '';
    hoeheAnpassen(feld);
    // `roh` steht da, `frage` geht hinaus — und `frage` wird vorgelesen.
    // Die Anrede `@athena` ist Adressierung, kein Satzteil; sie im Ton zu
    // wiederholen, macht aus einer Frage eine Ansage.
    nachricht(gespraech, 'ich', 'Du', roh, agent, frage);

    const knopf = form.querySelector('button[type=submit]');
    knopf.disabled = true;

    // Dieselbe Welle wie im Seitenmenü und im Glossar — PU.denktNachricht in
    // app.js. Hier stand vorher „denkt nach …" als blosser Text.
    const warte = PU.denktNachricht(agentName(agent), agent);
    gespraech.appendChild(warte);
    ansEnde(gespraech);

    try {
      const j = await PU.ruf('tutor_fragen', {
        agent: agent,
        frage: frage,
        // Der Kurs muss mit, sonst hat „dieser Kurs" keinen Gegenstand.
        kurs: (PU.lernenZustand || {}).kurs || '',
        lektion: PU.lernenZustand && PU.lernenZustand.lektion ? PU.lernenZustand.lektion : ''
      });
      // Ist das Guthaben zu Ende, kommt statt einer Antwort ein Schild — als
      // Fenster, nicht als rote Zeile im Verlauf. Im Gespräch bleibt trotzdem
      // eine kurze Zeile stehen: Wer das Fenster wegklickt, soll später noch
      // sehen können, warum an dieser Stelle Schluss war.
      if (PU.stoppGezeigt(j)) {
        PU.denktAntwort(warte, j.stopp.titel + '\n\n' + j.stopp.weiter, true);
      } else {
        PU.denktAntwort(warte, j.ok ? j.text : j.fehler, !j.ok);
      }
    } catch (fehler) {
      PU.denktAntwort(warte, fehler.message, true);
    } finally {
      knopf.disabled = false;
      // Eine lange Antwort schiebt das Ende aus dem Bild. Deshalb wandert das
      // Gespräch nach oben weg, nicht der Blick nach unten hinterher: unten
      // stehen die letzten Zeilen und gleich darunter das Eingabefeld — man
      // bleibt an der Stelle, an der man weiterschreibt.
      ansEnde(gespraech);
      feld.focus();
    }
  });

  hoeheAnpassen(feld);
  feldFokus();
};

/**
 * Das Eingabefeld wächst mit dem Text.
 *
 * Eine Zeile am Anfang, mehr erst wenn nötig — und höchstens sechs, sonst
 * schiebt ein langer Text den Absenden-Knopf aus dem Bild.
 */
function hoeheAnpassen(feld) {
  feld.style.height = 'auto';
  const zeile = parseFloat(getComputedStyle(feld).lineHeight) || 22;
  feld.style.height = Math.min(feld.scrollHeight, zeile * 6 + 16) + 'px';
}

/** Setzt oder ersetzt die Anrede am Satzanfang. */
function anredeSetzen(feld, kennung) {
  const ohne = feld.value.replace(/^\s*@[a-zäöü]+\s*/i, '');
  feld.value = '@' + kennung + ' ' + ohne;
  feld.focus();
  feld.setSelectionRange(feld.value.length, feld.value.length);
  hoeheAnpassen(feld);
}

/**
 * Die Karte neben dem Gespräch.
 *
 * Sie füllt den Raum, der sonst leer bliebe, und tut dabei etwas Nützliches:
 * sie erklärt, wofür die vier gut sind. Ein Klick übernimmt die Anrede ins
 * Feld — man muss den Namen nicht abtippen.
 */
function tutorSeitenkarte() {
  const spalte = PU.el('aside', 'seitenspalte');

  const wer = PU.el('div', 'medien-kasten');
  wer.innerHTML = '<h4>Wer dir antwortet</h4>' +
    '<p class="klein">Ein Gespräch, vier Tutoren. Wen du ansprichst, entscheidest ' +
    'du im Satz: ohne Anrede antwortet Prometheus, mit <code>@name</code> ein ' +
    'bestimmter. <b>Ein Klick fragt ihn gleich, was er kann</b> — die Antwort ' +
    'sagt mehr als die Zeile hier, und man kann sie sich vorlesen lassen.</p>';

  PU.AGENTEN.forEach(a => {
    const k = PU.el('button', 'tutor-zeile');
    k.type = 'button';
    k.innerHTML = '<div class="name">' + a.symbol + ' ' + PU.h(a.name) + '</div>' +
                  '<div class="klein">' + PU.h(a.rolle) + '</div>';

    /* **Der Klick fragt, statt nur zu tippen.**
       Vorher trug er `@athena ` ins Feld ein und liess einen davor sitzen: Man
       hatte den Namen, aber noch keine Frage — und die Zeile daneben sagte
       schon alles, was man dann selbst hätte fragen können. Jetzt kommt eine
       richtige Antwort, in der Stimme des Tutors und in seinem Ton. Das ist
       zugleich die ehrlichste Vorstellung: Wer wissen will, was Athena kann,
       soll es von Athena hören und nicht von einer Bildunterschrift. */
    k.addEventListener('click', () => tutorVorstellen(a.kennung));
    wer.appendChild(k);
  });
  spalte.appendChild(wer);

  // Was die Tutoren NICHT tun — an der Stelle, an der man es liest, bevor man
  // fragt. Als Satz mitten im Gespräch würde es untergehen.
  const grenzen = PU.el('div', 'medien-kasten');
  grenzen.innerHTML = '<h4>Was sie nicht tun</h4>' +
    '<p class="klein">Sie vergeben <b>keine Punkte</b> und ändern keine Bewertung — ' +
    'die rechnet die Academy selbst aus, damit dieselbe Antwort immer dieselbe ' +
    'Punktzahl bekommt.</p>' +
    '<p class="klein">Solange eine Aufgabe offen ist, nennen sie <b>keine Lösung</b> — ' +
    'sondern den Weg dorthin. Die Lösung steht gar nicht in dem, was sie zu sehen ' +
    'bekommen.</p>' +
    '<p class="klein">Wenn sie etwas nicht wissen, sagen sie es.</p>';
  spalte.appendChild(grenzen);

  return spalte;
}

/**
 * Einen Tutor sich selbst vorstellen lassen.
 *
 * Setzt die Frage ins Feld und schickt sie ab — über `requestSubmit`, damit
 * derselbe Weg läuft wie beim Tippen: dieselbe Prüfung, dieselbe Welle,
 * dieselben Knöpfe an der Antwort. Ein eigener Aufruf hier wäre ein zweiter
 * Pfad, der beim nächsten Umbau vergessen wird.
 *
 * Während schon eine Frage läuft, passiert nichts: Zwei Anfragen gleichzeitig
 * wären zwei Rechnungen für eine Antwort, die man dann durcheinander liest.
 */
function tutorVorstellen(kennung) {
  const form = document.querySelector('#view-tutor .tutor-form');
  const feld = form && form.frage;
  if (!feld) return;

  const knopf = form.querySelector('button[type=submit]');
  if (knopf && knopf.disabled) return;

  feld.value = '@' + kennung + ' Was kannst du?';
  hoeheAnpassen(feld);
  form.requestSubmit();
}

function agentName(kennung) {
  const a = PU.AGENTEN.find(x => x.kennung === kennung);
  return a ? a.symbol + ' ' + a.name : kennung;
}

/**
 * Eine Zeile ins Gespräch.
 *
 * @param text   was dasteht — bei der eigenen Zeile mit Anrede
 * @param agent  wessen Stimme
 * @param sprich was vorgelesen wird, falls das nicht `text` ist
 */
function nachricht(kasten, art, von, text, agent, sprich) {
  const el = PU.el('div', 'nachricht ' + art);
  el.innerHTML = '<div class="von">' + PU.h(von) + '</div>' +
                 '<div class="text" style="white-space:pre-wrap"></div>';
  el.querySelector('.text').textContent = text;

  // Auch eine Antwort, die aus dem Verlauf wiederhergestellt wird, bekommt
  // ihre Knöpfe — sie ist nicht weniger kopierbar, weil sie älter ist.
  //
  // Die eigene Frage ebenso. Das ist dieselbe Unterhaltung wie im Seitenmenü,
  // nur in der großen Ansicht: Würde sie sich hier anders verhalten, wäre das
  // ein Unterschied, den niemand erklären könnte.
  if (art === 'agent') PU.antwortKnoepfe(el, text, agent);
  else                 PU.eigeneKnoepfe(el, text, { agent: agent, sprich: sprich });

  kasten.appendChild(el);
  ansEnde(kasten);
  return el;
}

/**
 * Ans Ende des Gesprächs.
 *
 * `scrollIntoView` hat vorher die ganze Seite verschoben, wenn die Antwort
 * länger war als das Fenster — dann stand die Eingabe irgendwo unterhalb des
 * Bildrands. Gescrollt wird deshalb der Gesprächskasten selbst.
 */
function ansEnde(kasten) {
  kasten.scrollTop = kasten.scrollHeight;
  // Noch einmal nach dem Umbruch: die Höhe steht erst fest, wenn der Text
  // gesetzt ist.
  requestAnimationFrame(() => { kasten.scrollTop = kasten.scrollHeight; });
}
