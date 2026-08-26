/* PROMPTHEUS — Tokenicer: sehen, wie ein Modell Text zerlegt.
 *
 * Übernommen aus scripts/tokenicer und in die Academy eingebaut. Die Rechnung
 * macht der Server mit OpenAIs echten BPE-Tabellen (srv/tokenicer.php); hier
 * steht nur, wie das Ergebnis aussieht.
 *
 * **Warum das ein Menüpunkt ist und kein Spielzeug.** Token sind die Einheit,
 * in der Sprachmodelle rechnen, lesen und abrechnen. Wer einmal gesehen hat,
 * dass „Übungsaufgabe" in vier Stücke zerfällt und "exercise" in eines,
 * versteht drei Dinge auf einmal: warum Deutsch teurer ist, warum ein Modell
 * Buchstaben nicht zählen kann, und warum ein Kontextfenster in Token
 * gemessen wird und nicht in Wörtern. Stufe 1 hat dazu eine eigene Lektion.
 *
 * Die Zerlegung läuft entkoppelt: getippt wird laufend, gerechnet wird, wenn
 * die Finger 250 Millisekunden stillstehen. Ohne diese Bremse ginge je
 * Tastendruck eine Anfrage hinaus.
 */
'use strict';

PU.TOK_BEISPIEL = 'Künstliche Intelligenz zerlegt Text in Token.\n' +
                  'Artificial intelligence splits text into tokens.';

PU.tokZustand = { modell: 'gpt-5.5', modelle: null, letzterText: null, uhr: null };

/* Die Ansicht im Menü. */
PU.tokenicerZeichnen = async function () {
  const ziel = document.getElementById('view-tokenicer');
  if (!ziel || ziel.dataset.bereit === '1') return;
  ziel.dataset.bereit = '1';

  if (!await PU.tokenicerBauen(ziel)) ziel.dataset.bereit = '';
};

/**
 * Der Tokenicer als Fenster über der Aufgabe.
 *
 * Er steht auch an den Fragen selbst, nicht nur im Menü — und das ist der
 * Punkt: wer bei einer Aufgabe wissen will, in wie viele Stücke ein Wort
 * zerfällt, soll nicht die Ansicht wechseln, dort tippen und danach den Weg
 * zurücksuchen. Die halb geschriebene Antwort bliebe unterwegs liegen.
 *
 * Der Fragetext steht schon im Feld, damit sofort etwas zu sehen ist.
 */
PU.tokenicerModal = async function (starttext) {
  const flaeche = PU.modalZeigen('Tokenicer');
  if (!flaeche) return;
  await PU.tokenicerBauen(flaeche, starttext);
};

/**
 * Baut den Tokenicer in ein beliebiges Element.
 *
 * @returns {Promise<boolean>} false, wenn die Modelle nicht zu holen waren
 */
PU.tokenicerBauen = async function (ziel, starttext) {
  if (!PU.tokZustand.modelle) {
    try {
      const j = await PU.ruf('tok_modelle');
      PU.tokZustand.modelle = j.modelle;
      PU.tokZustand.max = j.max;
    } catch (e) {
      ziel.innerHTML = '<p class="fehler">' + PU.h(e.message) + '</p>';
      return false;
    }
  }

  ziel.innerHTML = '';

  // ---------------- Zwei Spalten, und zwar von ganz oben
  //
  // Titel, Erklärung und Modellwahl standen früher ÜBER dem Gitter, quer über
  // beide Spalten. Dadurch begannen die Token-IDs rechts erst gut zehn
  // Zentimeter weiter unten, und daneben stand nichts. Jetzt gehören sie in
  // die linke Spalte, wo sie hingehören: sie erklären das Eingabefeld.
  const gitter = PU.el('div', 'tok-gitter');
  const links  = PU.el('div');
  const rechts = PU.el('div');
  gitter.appendChild(links);
  gitter.appendChild(rechts);
  ziel.appendChild(gitter);

  // Die Fläche wird hier von Hand gesetzt. textkarten.js packt nur, was direkt
  // im Ansichtsbehälter steht — der Titel steht jetzt aber eine Ebene tiefer,
  // in der linken Spalte. Ohne diese Karte stünde er als einziger Titel im
  // Programm ohne Rahmen.
  const kopfkarte = PU.el('div', 'textkarte titelkarte');
  kopfkarte.appendChild(PU.el('h1', 'tok-titel', 'Tokenicer'));
  kopfkarte.appendChild(PU.el('p', 'hinweis',
    'Sieh nach, wie ein Sprachmodell deinen Text zerlegt. Gerechnet wird mit OpenAIs ' +
    'echten BPE-Tabellen — auf diesem Rechner. Der Text geht nirgendwo hin.'));
  links.appendChild(kopfkarte);

  // ---------------- Modellwahl
  const wahl = PU.el('div', 'tok-modelle');
  PU.tokZustand.modelle.forEach(m => {
    const k = PU.el('button', 'tok-modell' + (m.id === PU.tokZustand.modell ? ' aktiv' : ''));
    k.type = 'button';
    k.innerHTML = PU.h(m.name) + (m.exakt ? '' : ' <span class="ca" title="Näherung">≈</span>');
    k.title = m.haus + ' · ' + m.enc + (m.exakt ? ' · exakt' : ' · Näherung');
    k.addEventListener('click', () => {
      PU.tokZustand.modell = m.id;
      wahl.querySelectorAll('.tok-modell').forEach(x => x.classList.remove('aktiv'));
      k.classList.add('aktiv');
      PU.tokZustand.letzterText = null;      // gleiche Eingabe, anderes Modell
      rechnen();
    });
    wahl.appendChild(k);
  });
  links.appendChild(wahl);

  const feld = document.createElement('textarea');
  feld.id = 'tok-eingabe';
  feld.placeholder = 'Text hier eintippen oder einfügen …';
  // Kommt der Tokenicer von einer Aufgabe, steht deren Frage schon drin —
  // sonst der Satz, an dem der Unterschied zwischen Deutsch und Englisch am
  // schnellsten zu sehen ist.
  feld.value = (starttext && starttext.trim() !== '') ? starttext : PU.TOK_BEISPIEL;
  links.appendChild(feld);

  const zahlen = PU.el('div', 'tok-zahlen');
  links.appendChild(zahlen);

  links.appendChild(PU.el('h3', '', 'So zerfällt der Text'));
  const bloecke = PU.el('div', 'tok-bloecke');
  links.appendChild(bloecke);

  rechts.appendChild(PU.el('h3', '', 'Token-IDs'));
  const ids = PU.el('div', 'tok-ids');
  rechts.appendChild(ids);

  const erklaerung = PU.el('div', 'vertiefung');
  erklaerung.style.marginTop = '1.2rem';
  erklaerung.innerHTML =
    '<h4>Was du hier siehst</h4>' +
    '<p>Jeder farbige Block ist <b>ein Token</b> — eine Einheit, die das Modell als Ganzes ' +
    'verarbeitet. Häufige Wörter sind ein Token, seltene zerfallen in mehrere.</p>' +
    '<p>Probier den Unterschied aus: schreib dasselbe auf Deutsch und auf Englisch. ' +
    'Deutsch braucht meist mehr Token für denselben Inhalt — und wer je 1000 Token ' +
    'bezahlt, bezahlt für Deutsch mehr.</p>' +
    '<p>Ein schraffierter Block ist ein Token, das ein Zeichen nur <i>anfängt</i>: ' +
    'Emojis und chinesische Zeichen brauchen mehrere Token, und erst der letzte zeigt ' +
    'das Zeichen. Genau deshalb kann ein Modell Buchstaben nicht verlässlich zählen — ' +
    'es sieht keine Buchstaben.</p>';
  rechts.appendChild(erklaerung);

  // ---------------- Rechnen
  async function rechnen() {
    const text = feld.value;
    if (text === PU.tokZustand.letzterText) return;
    PU.tokZustand.letzterText = text;

    if (text === '') {
      zahlen.innerHTML = '';
      bloecke.innerHTML = '<span class="klein">Noch nichts eingegeben.</span>';
      ids.textContent = '';
      return;
    }

    let j;
    try {
      j = await PU.ruf('tok', { text: text, modell: PU.tokZustand.modell });
    } catch (e) {
      bloecke.innerHTML = '<span class="fehler">' + PU.h(e.message) + '</span>';
      return;
    }

    const anzahl = j.ids.length;
    zahlen.innerHTML =
      kachel(anzahl, 'Token' + (j.modell.exakt ? '' : ' (Näherung)'), true) +
      kachel(j.zeichen, 'Zeichen') +
      kachel(j.woerter, 'Wörter') +
      // Dezimalkomma, nicht Punkt: die Academy ist deutsch, und „4.9" liest sich
      // hier wie eine Versionsnummer.
      kachel(j.zeichen ? (j.zeichen / Math.max(1, anzahl)).toFixed(1).replace('.', ',') : '0',
             'Zeichen je Token');

    // Farben laufen im Kreis, damit Nachbarn sich unterscheiden. Sie tragen
    // keine Bedeutung — die Grenze ist die Aussage, nicht die Farbe.
    bloecke.innerHTML = j.tokens.map((t, i) =>
      '<span class="tok-block ' + (t.teil ? 'teil' : 'f' + (i % 5)) + '" title="ID ' + t.id + '">' +
      (t.teil ? '·' : PU.h(t.text).replace(/\n/g, '⏎\n')) + '</span>'
    ).join('');

    ids.textContent = '[' + j.ids.join(', ') + ']';

    if (j.gekappt) {
      PU.melden('Der Text wurde bei ' + PU.tokZustand.max + ' Zeichen gekappt.', 'schlecht');
    }
  }

  function kachel(zahl, was, betont) {
    return '<div class="tok-zahl' + (betont ? ' betont' : '') + '">' +
           '<div class="zahl">' + PU.h(String(zahl)) + '</div>' +
           '<div class="was">' + PU.h(was) + '</div></div>';
  }

  feld.addEventListener('input', () => {
    if (PU.tokZustand.uhr) clearTimeout(PU.tokZustand.uhr);
    PU.tokZustand.uhr = setTimeout(rechnen, 250);
  });

  // Der Merker gehört zum Feld, nicht zum Programm: ein zweites Fenster mit
  // demselben Text muss trotzdem rechnen.
  PU.tokZustand.letzterText = null;
  rechnen();
  return true;
};
