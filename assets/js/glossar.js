/* PROMPTHEUS — das Glossar als Vollbildfenster.
 *
 * Ein unterstrichenes Wort im Lehrstoff, ein Klick, und das Fenster steht da:
 * links der Tutor, rechts unsere eigene Erklärung samt Nachbarbegriffen. Die
 * Frage ist schon gestellt, der Tutor denkt schon nach — man muss nichts
 * tippen, um eine Antwort zu bekommen.
 *
 * **Was im Chatfenster steht, verrät nichts über den Fragenden.** Alter,
 * Klasse, Ebene und Punktestand entscheiden die Antwort, aber sie stehen im
 * Systemtext, den niemand sieht (`pu_systemtext()` über `pu_profil()`). Im
 * Fenster steht eine Frage, die jeder gestellt haben könnte. Wer läse „erklär
 * mir das für einen Zwölfjährigen", fühlte sich vorgeführt — auch wenn es
 * stimmt.
 *
 * **Die Antwort ist selbst wieder verlinkt.** Steht darin ein weiterer
 * Fachbegriff, ist er anklickbar und wird zur nächsten Frage — im selben
 * Gespräch, ohne Umweg über das Eingabefeld.
 */
'use strict';

(function () {

  const P = window.PU = window.PU || {};

  const ZUSTAND = {
    slug:    '',
    titel:   '',
    laeuft:  false,
    arten:   [],
    emoji:   false
  };

  /* Der Emoji-Schalter gehört zum Gerät, nicht zur Person: Wer am Handy Texte
     zum Weiterschicken erzeugt, will das nicht auch am Schul-Laptop. */
  function emojiLesen() {
    try { return localStorage.getItem('pu_glossar_emoji') === '1'; } catch (e) { return false; }
  }
  function emojiSchreiben(an) {
    try { localStorage.setItem('pu_glossar_emoji', an ? '1' : '0'); } catch (e) { /* egal */ }
  }

  /* ---------------------------------------------------------------- Öffnen */

  P.begriffOeffnen = async function (slug) {
    if (!slug) return;

    // Ein Fenster über dem Fenster wäre eine Sackgasse: Wer im Glossar auf
    // einen weiteren Begriff klickt, wechselt DIESES Fenster — der Verlauf
    // bleibt stehen, und man sieht, woher man kam.
    const schonOffen = document.getElementById('glossar-fenster') !== null;

    ZUSTAND.slug  = slug;
    ZUSTAND.emoji = emojiLesen();

    if (!schonOffen) rahmenBauen();

    let j;
    try {
      j = await P.ruf('glossar_begriff', { slug: slug });
    } catch (fehler) {
      rechtsFehler(fehler.message);
      return;
    }

    ZUSTAND.titel = j.begriff.titel;
    ZUSTAND.arten = j.arten || [];

    kopfSetzen(j.begriff.titel, j.begriff.was);
    rechtsZeichnen(j.begriff);
    knoepfeZeichnen();

    fragen('erst');
  };

  /**
   * Das Glossar von vorn — ohne dass man vorher ein Wort im Text getroffen hat.
   *
   * Zwei Drittel der Begriffe stehen (noch) in keiner Lektion: Die späteren
   * Stufen sind erst Gerüste, und Hardware und Robotik kommen dort erst. Ein
   * Nachschlagewerk, das man nur durch Zufall betritt, ist keines.
   */
  P.glossarOeffnen = async function () {
    if (!document.getElementById('glossar-fenster')) rahmenBauen();

    ZUSTAND.slug  = '';
    ZUSTAND.emoji = emojiLesen();
    ZUSTAND.arten = [];

    kopfSetzen('Glossar', 'Fachwörter der Academy — such dir eines aus.');
    knoepfeZeichnen();

    const verlauf = document.getElementById('gl-verlauf');
    verlauf.innerHTML = '';
    const hinweis = P.el('div', 'gl-nachricht tutor');
    hinweis.innerHTML =
      '<div class="von">🔥 Prometheus</div><div class="text">' +
      'Wähl rechts einen Begriff — ich erkläre ihn dir dann hier. ' +
      'Oder tipp unten deine eigene Frage.</div>';
    verlauf.appendChild(hinweis);

    let j;
    try {
      j = await P.ruf('glossar');
    } catch (fehler) {
      rechtsFehler(fehler.message);
      return;
    }

    listeZeichnen(j.begriffe);
  };

  /** Alle Begriffe rechts, mit Suchfeld darüber. */
  function listeZeichnen(begriffe) {
    const seite = document.getElementById('gl-seite');
    if (!seite) return;

    let html = '<div class="gl-kasten"><h4>Alle Begriffe (' + begriffe.length + ')</h4>' +
      '<div class="gl-suchzeile">' +
        '<input type="search" id="gl-suche" placeholder="Suchen …" ' +
               'aria-label="Begriff suchen" autocomplete="off">' +
      '</div>' +
      '<div class="gl-nachbarn" id="gl-liste">';

    begriffe.forEach((b) => {
      html += '<button type="button" class="gl-nachbar" data-begriff="' + P.h(b.slug) + '" ' +
                'data-suche="' + P.h((b.titel + ' ' + b.was).toLowerCase()) + '">' +
                '<span class="name">' + P.h(b.titel) + '</span>' +
                '<span class="klein">' + P.h(b.was) + '</span>' +
              '</button>';
    });

    seite.innerHTML = html + '</div></div>';
    seite.scrollTop = 0;

    // Suchen ohne Serverweg: 67 Einträge stehen schon da, und ein Aufruf je
    // Tastendruck wäre Aufwand für nichts.
    const feld = document.getElementById('gl-suche');
    feld.addEventListener('input', () => {
      const q = feld.value.trim().toLowerCase();
      document.querySelectorAll('#gl-liste .gl-nachbar').forEach((k) => {
        k.hidden = q !== '' && !k.dataset.suche.includes(q);
      });
    });
    feld.focus();
  }

  /* ---------------------------------------------------------------- Gerüst */

  function rahmenBauen() {
    const modal = document.getElementById('modal');
    if (!modal) return;

    modal.classList.remove('hidden');
    modal.classList.add('vollbild');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-voll');

    modal.innerHTML =
      '<div class="modal-flaeche gl-flaeche" id="glossar-fenster">' +
        '<div class="modal-kopf">' +
          '<div class="gl-kopftext">' +
            '<h2 id="gl-titel">…</h2>' +
            '<p class="klein" id="gl-was"></p>' +
          '</div>' +
          '<button class="modal-zu" type="button" aria-label="Schliessen">×</button>' +
        '</div>' +

        '<div class="gl-koerper">' +
          '<div class="gl-chat">' +
            '<div class="gl-verlauf" id="gl-verlauf"></div>' +
            '<form class="gl-form" id="gl-form">' +
              '<div class="gl-knoepfe" id="gl-knoepfe"></div>' +
              '<div class="tutor-eingabe">' +
                '<textarea name="frage" rows="1" ' +
                  'placeholder="Oder frag etwas Eigenes zu diesem Begriff …"></textarea>' +
                '<button class="knopf schick" type="submit" ' +
                  'title="Abschicken (Eingabetaste)" aria-label="Frage abschicken">➤</button>' +
              '</div>' +
            '</form>' +
          '</div>' +

          '<aside class="gl-seite" id="gl-seite"></aside>' +
        '</div>' +
      '</div>';

    modal.querySelector('.modal-zu').addEventListener('click', schliessen);
    modal.addEventListener('click', (e) => { if (e.target === modal) schliessen(); });
    document.addEventListener('keydown', escapeTaste);

    const form = document.getElementById('gl-form');
    const feld = form.frage;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const t = feld.value.trim();
      if (!t) return;
      feld.value = '';
      feld.style.height = '';
      fragen('', t);
    });

    // Return sendet, Umschalt+Return bricht um, Strg+Return sendet ebenfalls —
    // gemeinsame Regel in PU.tastenSenden (app.js).
    PU.tastenSenden(feld, form, true);

    feld.addEventListener('input', () => {
      feld.style.height = 'auto';
      const zeile = parseFloat(getComputedStyle(feld).lineHeight) || 22;
      feld.style.height = Math.min(feld.scrollHeight, zeile * 5 + 16) + 'px';
    });
  }

  function escapeTaste(e) { if (e.key === 'Escape') schliessen(); }

  function schliessen() {
    const modal = document.getElementById('modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('vollbild');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-voll');
    modal.innerHTML = '';
    document.removeEventListener('keydown', escapeTaste);
    ZUSTAND.slug = '';
    ZUSTAND.laeuft = false;
  }

  function kopfSetzen(titel, was) {
    const t = document.getElementById('gl-titel');
    const w = document.getElementById('gl-was');
    if (t) t.textContent = titel;
    if (w) w.textContent = was || '';
  }

  /* ------------------------------------------------------------ Rechte Seite
     Unsere eigene Erklärung — nicht die des Modells. Sie steht daneben, damit
     man vergleichen kann, was die Academy sagt und was der Tutor daraus macht.
     Darunter die Nachbarn aus dem Graphen: dieselben Wikilinks, die in der
     Notiz stehen. */

  function rechtsZeichnen(b) {
    const seite = document.getElementById('gl-seite');
    if (!seite) return;

    let html =
      '<div class="gl-kasten">' +
        '<h4>Im Glossar</h4>' +
        '<div class="gl-text">' + b.html + '</div>' +
      '</div>';

    if (b.verwandt && b.verwandt.length) {
      html += '<div class="gl-kasten"><h4>Hängt zusammen mit</h4><div class="gl-nachbarn">';
      b.verwandt.forEach((n) => {
        html += '<button type="button" class="gl-nachbar" data-begriff="' + P.h(n.slug) + '">' +
                  '<span class="name">' + P.h(n.titel) + '</span>' +
                  '<span class="klein">' + P.h(n.was) + '</span>' +
                '</button>';
      });
      html += '</div></div>';
    }

    seite.innerHTML = html;
    seite.scrollTop = 0;
  }

  function rechtsFehler(text) {
    const seite = document.getElementById('gl-seite');
    if (seite) seite.innerHTML = '<p class="fehler">' + P.h(text) + '</p>';
  }

  /* ---------------------------------------------------------------- Knöpfe */

  function knoepfeZeichnen() {
    const reihe = document.getElementById('gl-knoepfe');
    if (!reihe) return;

    reihe.innerHTML = '';

    // Drei Tiefen, dialektisch gestuft: erst die Sache, dann was fehlt, dann
    // der ganze Zusammenhang samt Grenzen.
    ZUSTAND.arten.forEach((a) => {
      const k = P.el('button', 'gl-tiefe', P.h(a.knopf));
      k.type = 'button';
      k.dataset.art = a.art;
      k.title = ({
        weiter: 'Was gehört noch dazu — mit einem Beispiel aus dem Alltag',
        tiefer: 'Wie es genau funktioniert, und der häufigste Irrtum dabei',
        voll:   'Alles: worum, warum, wofür, Vorteile, Grenzen, gelöstes Problem'
      })[a.art] || '';
      k.addEventListener('click', () => fragen(a.art));
      reihe.appendChild(k);
    });

    // Der vierte Knopf ist kein Frageknopf, sondern ein Schalter: Er ändert die
    // FORM der nächsten Antwort, nicht ihren Inhalt. Mit Emoji kommt ein Text
    // heraus, den man kopieren und weiterschicken kann.
    const em = P.el('button', 'gl-emoji' + (ZUSTAND.emoji ? ' an' : ''), '😊');
    em.type = 'button';
    em.setAttribute('aria-pressed', ZUSTAND.emoji ? 'true' : 'false');
    em.title = 'Antworten zum Weiterschicken: Titel, kurze Abschnitte, Emoji, Schlagworte';
    em.addEventListener('click', () => {
      ZUSTAND.emoji = !ZUSTAND.emoji;
      emojiSchreiben(ZUSTAND.emoji);
      em.classList.toggle('an', ZUSTAND.emoji);
      em.setAttribute('aria-pressed', ZUSTAND.emoji ? 'true' : 'false');
      P.melden(ZUSTAND.emoji
        ? 'Nächste Antwort als Beitrag zum Weiterschicken.'
        : 'Nächste Antwort wieder in gewöhnlichen Absätzen.', 'gold');
    });
    reihe.appendChild(em);
  }

  /* ---------------------------------------------------------------- Fragen */

  async function fragen(art, eigenerText) {
    if (ZUSTAND.laeuft || !ZUSTAND.slug) return;
    ZUSTAND.laeuft = true;
    knoepfeSperren(true);

    const verlauf = document.getElementById('gl-verlauf');
    const platz   = denktAn(verlauf);

    try {
      const j = await P.ruf('glossar_fragen', {
        slug:  ZUSTAND.slug,
        art:   art || 'erst',
        emoji: ZUSTAND.emoji ? '1' : '0',
        frage: eigenerText || ''
      });

      platz.remove();
      nachrichtIch(verlauf, j.frage);

      // Guthaben zu Ende: das Schild als Fenster, im Verlauf nur eine Zeile.
      if (j.ok)                    nachrichtTutor(verlauf, j.html, j.text);
      else if (PU.stoppGezeigt(j)) nachrichtFehler(verlauf, j.stopp.titel + ' ' + j.stopp.weiter);
      else                         nachrichtFehler(verlauf, j.fehler);

    } catch (fehler) {
      platz.remove();
      nachrichtFehler(verlauf, fehler.message);
    } finally {
      ZUSTAND.laeuft = false;
      knoepfeSperren(false);
      ansEnde(verlauf);
    }
  }

  function knoepfeSperren(zu) {
    document.querySelectorAll('#gl-knoepfe .gl-tiefe, #gl-form .knopf.schick')
      .forEach((k) => { k.disabled = zu; });
  }

  /* ------------------------------------------------------------ Nachrichten */

  function nachrichtIch(verlauf, text) {
    const el = P.el('div', 'gl-nachricht ich');
    el.innerHTML = '<div class="von">Du</div><div class="text"></div>';
    // Die Frage kommt mit **Fettung** aus dem Server. Sie wird hier gesetzt und
    // nicht gerendert: ein einziges Auszeichnungszeichen, das reicht.
    el.querySelector('.text').innerHTML =
      P.h(text).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
    verlauf.appendChild(el);
    ansEnde(verlauf);
  }

  function nachrichtTutor(verlauf, html, roh) {
    const el = P.el('div', 'gl-nachricht tutor');
    el.innerHTML = '<div class="von">🔥 Prometheus</div><div class="text">' + html + '</div>';

    /* Kopieren und Vorlesen kommen aus `PU.antwortKnoepfe` in app.js —
       dieselben Knöpfe wie in der Tutoransicht und im Seitenmenü.

       **Und sie hängen an nichts mehr.** Vorher stand das Kopieren hier nur
       da, wenn die Einstellung „Emoji" an war — zwei Dinge, die miteinander
       nichts zu tun haben. Wer die Emoji abschaltete, verlor ohne Vorwarnung
       den Kopierknopf; Vorlesen gab es hier gar nicht.

       Weitergegeben wird der ROHTEXT, nicht das HTML: Was in ein Textfeld
       eines anderen Programms eingefügt wird, soll dort so aussehen wie hier —
       Absätze, keine Spitzklammern. Vorgelesen erst recht nicht. */
    P.antwortKnoepfe(el, roh, 'prometheus');

    // Teilen nur, wenn der Browser es kann. Ein Knopf, der nichts tut, ist
    // schlimmer als keiner — und hinausgeschickt wird ausschliesslich über
    // das Fenster, das der Browser selbst öffnet.
    if (navigator.share) {
      const fuss = P.el('div', 'gl-fuss');
      const teilen = P.el('button', 'knopf still klein', '↗ Teilen');
      teilen.type = 'button';
      teilen.addEventListener('click', () => {
        navigator.share({ text: roh }).catch(() => { /* abgebrochen */ });
      });
      fuss.appendChild(teilen);
      el.appendChild(fuss);
    }

    verlauf.appendChild(el);
    ansEnde(verlauf);
  }

  function nachrichtFehler(verlauf, text) {
    const el = P.el('div', 'gl-nachricht tutor fehler');
    el.innerHTML = '<div class="von">🔥 Prometheus</div><div class="text"></div>';
    el.querySelector('.text').textContent = text || 'Da ging etwas schief.';
    verlauf.appendChild(el);
    ansEnde(verlauf);
  }

  /* Drei Punkte in einer Welle. Ohne dieses Zeichen sieht ein Fenster, das
     zehn Sekunden nachdenkt, kaputt aus — und man klickt noch einmal. */
  function denktAn(verlauf) {
    const el = P.el('div', 'gl-nachricht tutor denkt');
    el.innerHTML =
      '<div class="von">🔥 Prometheus</div>' +
      '<div class="text denkt-zeile" role="status" aria-live="polite">' +
        '<span class="denkt-wort">denkt nach</span>' +
        '<span class="denkt-punkte" aria-hidden="true"><i></i><i></i><i></i></span>' +
      '</div>';
    verlauf.appendChild(el);
    ansEnde(verlauf);
    return el;
  }

  function ansEnde(kasten) {
    if (kasten) kasten.scrollTop = kasten.scrollHeight;
  }

  /* Wohnt jetzt in app.js als `PU.inZwischenablage` — dieselbe Funktion wird
     auch im Seiten-Chat und in der Tutoransicht gebraucht. Hier bleibt nur der
     kurze Weg dorthin stehen, damit die Aufrufe unten unverändert bleiben. */
  function inZwischenablage(text, knopf) {
    return P.inZwischenablage(text, knopf);
  }

  /* -------------------------------------------------------------- Anklicken
     Ein einziger Zuhörer am Dokument statt einer Bindung je Wort. Der Lehrstoff
     wird bei jedem Ansichtswechsel neu gebaut; ein Zuhörer, der beim Aufbau
     gesetzt wird, fehlt beim zweiten Mal. */
  document.addEventListener('click', (e) => {
    const knopf = e.target.closest('.begriff, .gl-nachbar');
    if (!knopf || !knopf.dataset.begriff) return;
    e.preventDefault();
    P.begriffOeffnen(knopf.dataset.begriff);
  });

})();
