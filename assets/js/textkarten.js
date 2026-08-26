/* PROMPTHEUS — freistehende Texte bekommen eine Fläche.
 *
 * **Das Problem.** Seit hinter jeder Seite ein Bild liegt, steht ein Teil des
 * Textes buchstäblich im Freien: Überschriften und die Hinweiszeilen darunter
 * liegen direkt auf dem Grund, während alles andere in Karten sitzt. Auf
 * ruhigem Grund ging das; über einem Bild ist es der Unterschied zwischen
 * lesen und entziffern.
 *
 * **Warum nicht einfach im CSS.** Weil Überschrift und Hinweis zwei getrennte
 * Elemente sind. Gäbe man jedem eine eigene Fläche, stünden dort zwei Kästen
 * übereinander statt eines Blocks — und zwischen ihnen ein Streifen
 * Hintergrund. Sie müssen zusammen in **eine** Fläche, und dafür braucht es
 * ein umschliessendes Element, das es im HTML nicht gibt.
 *
 * **Warum ein Beobachter und kein Aufruf je Ansicht.** Die Ansichten zeichnen
 * teils asynchron und an mehreren Stellen nach. Ein Aufruf nach `zeichnen()`
 * würde die Hälfte verpassen; ein Aufruf in jeder Zeichenfunktion wäre ein
 * Dutzend Stellen, an denen man es beim nächsten Mal vergisst. Der Beobachter
 * fasst alles, auch in Ansichten, die niemand dafür angefasst hat.
 *
 * Angefasst wird nur, was **direktes Kind** eines Ansichtsbehälters ist. Was
 * schon in einer Karte, einem Kasten oder einer Tabelle steckt, hat seine
 * Fläche und bleibt unberührt.
 */
'use strict';

(function () {

  /* Elemente, die eingepackt werden, wenn sie frei stehen. */
  const PACKEN = ['H1', 'H2', 'H3', 'P', 'UL', 'OL'];

  /* Was nie eingepackt wird — es hat entweder schon eine Fläche oder ist
     Zierde. Das Zierband etwa ist ein Ornamentstreifen; in einer Karte wäre
     es ein Ornament in einem Rahmen, also genau das, was BRAND.md verbietet. */
  const NIE = 'zierband,karten,karte,challenge-reihe,mit-spalte,tabellenrahmen,' +
              'badge-liste,gespraech,tutor-form,seitenspalte,medien-kasten,' +
              'hinweis-kasten,ergebnis,textkarte';

  function frei(el) {
    if (!el || el.nodeType !== 1) return false;
    if (!PACKEN.includes(el.tagName)) return false;
    if (el.dataset.gepackt === '1') return false;
    for (const k of NIE.split(',')) if (el.classList.contains(k)) return false;
    return true;
  }

  /**
   * Packt aufeinanderfolgende freie Elemente in eine gemeinsame Fläche.
   *
   * „Aufeinanderfolgend" ist der Kern: Überschrift plus Hinweis plus
   * Erklärabsatz gehören zusammen und bekommen **eine** Karte. Sobald etwas
   * dazwischenkommt — ein Kartengitter, eine Tabelle —, fängt der nächste
   * Block an.
   */
  function packen(behaelter) {
    let kind = behaelter.firstElementChild;

    while (kind) {
      if (!frei(kind)) { kind = kind.nextElementSibling; continue; }

      const gruppe = [kind];
      let naechst = kind.nextElementSibling;
      while (frei(naechst)) { gruppe.push(naechst); naechst = naechst.nextElementSibling; }

      // Eine einzelne Zeile bekommt keine Karte. Ein Kasten um drei Wörter
      // sieht aus wie ein Fehler, und die Seite zerfällt in lauter Rähmchen.
      //
      // **Ausnahme: die Überschrift einer Ansicht.** „Klasse" ist ein Wort und
      // stand deshalb frei, während „Cockpit" samt Vorspann eine Fläche bekam
      // — zwei Seiten desselben Programms sahen verschieden aus. Ein H1 ist
      // immer ein Seitentitel, nie eine verirrte Zeile.
      const zeichen = gruppe.reduce((n, e) => n + e.textContent.trim().length, 0);
      const titel   = gruppe[0].tagName === 'H1';
      if (gruppe.length >= 2 || zeichen > 90 || titel) {
        const karte = document.createElement('div');
        // Der Seitentitel wird eigens benannt: alle Ansichten sollen dieselbe
        // Kopfhöhe haben, damit beim Wechsel nichts hüpft. Eine Fläche mitten
        // im Text darf dagegen so hoch sein, wie ihr Inhalt es verlangt.
        karte.className = 'textkarte' +
          (titel && kind === behaelter.firstElementChild ? ' titelkarte' : '');
        kind.parentNode.insertBefore(karte, kind);
        gruppe.forEach(e => { e.dataset.gepackt = '1'; karte.appendChild(e); });
      } else {
        gruppe.forEach(e => { e.dataset.gepackt = '1'; });
      }

      kind = naechst;
    }
  }

  /* -------- Beobachten
     Der Umbau ist selbst eine Änderung. Ohne Abschalten während des Packens
     würde der Beobachter sich endlos selbst auslösen. */
  const behaelter = document.querySelectorAll('#haupt .view');
  if (!behaelter.length) return;

  const beobachter = new MutationObserver(() => {
    beobachter.disconnect();
    behaelter.forEach(packen);
    anschalten();
  });

  function anschalten() {
    behaelter.forEach(b => beobachter.observe(b, { childList: true }));
  }

  behaelter.forEach(packen);
  anschalten();

})();
