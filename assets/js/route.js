/* PROMPTHEUS — Adressen für die Academy.
 *
 * Die Academy ist EINE Seite, die ihre Ansichten austauscht. Ohne Adresse
 * heisst das: der Zurück-Knopf des Browsers führt aus dem Programm hinaus,
 * Neuladen wirft einen an den Anfang, und einen Kurs kann man niemandem
 * schicken. Drei Beschwerden, eine Ursache.
 *
 * **Warum die Raute und nicht saubere Pfade.** `#/kurs/…` braucht vom Server
 * gar nichts: Der Teil hinter der Raute wird nie mitgeschickt. Echte Pfade
 * (`/kurs/…`) müssten alle auf index.php zeigen, und `router.php` liefert für
 * sie heute 404 — die Academy soll aber auch dann laufen, wenn sie jemand aus
 * einem Ordner heraus mit einem beliebigen Server startet. Die Raute ist hier
 * nicht der Kompromiss, sondern die passende Wahl.
 *
 * **Es gibt nur eine Wahrheit.** Der Zustand steht in `PU.aktuell` und
 * `PU.lernenZustand`; die Adresse wird daraus GEBAUT und nie umgekehrt
 * gepflegt. Zwei Orte für dieselbe Angabe wären zwei Orte, an denen sie
 * auseinanderlaufen kann — und man merkt es erst, wenn jemand einen Link
 * verschickt, der woandershin führt.
 */
'use strict';

window.PU = window.PU || {};

/** Die Ansichten, die eine eigene Adresse haben. */
PU.ROUTE_ANSICHTEN = ['lernen', 'fortschritt', 'tutor', 'tokenicer', 'klasse', 'cockpit'];

/** Die drei Orte innerhalb von „Lernen", die tiefer liegen als die Liste. */
PU.ROUTE_LERNORTE = { kurs: 'kurs', lektion: 'lektion', pruefung: 'pruefung' };

/**
 * Fenster mit eigener Adresse.
 *
 * Ein Fenster ist keine Ansicht: Es ersetzt die Seite nicht, es legt sich
 * darüber. Trotzdem bekommt es eine Adresse, denn im Menü steht es neben den
 * Ansichten — und ein Menüpunkt, den man nicht verschicken und nach dem
 * Neuladen nicht wiederfinden kann, ist ein Fremdkörper in einer Leiste, in
 * der alles andere beides kann.
 *
 * Die Ansicht darunter bleibt, was sie war. Deshalb steht hier nur der Name
 * des Fensters, und `routeAnwenden` wechselt für ihn nichts.
 */
PU.ROUTE_FENSTER = { ziel: 'ziel' };

/**
 * Wie viele Adressen diese Sitzung schon durchlaufen hat.
 *
 * Nur dafür da, den Zurück-Knopf ehrlich zu halten: Bei 0 liegt hinter uns
 * kein eigener Schritt mehr, und `history.back()` würde die Academy verlassen.
 * `history.length` taugt dafür nicht — es zählt auch, was vor uns im selben
 * Tab war.
 */
PU.routeSchritte = 0;

/* ---------------------------------------------------------------- Lesen */

/**
 * Die Adresse in einen Zustand übersetzen.
 *
 * Der Pfad einer Lektion enthält selbst Schrägstriche
 * (`10_Stufen/01_Entdecker/02_Token.md`). Deshalb wird nur am ERSTEN
 * Schrägstrich getrennt; alles danach ist der Pfad, ungeteilt.
 */
PU.routeLesen = function () {
  const roh = String(location.hash || '').replace(/^#\/?/, '');
  if (roh === '') return { ansicht: 'lernen', wo: 'liste', pfad: '', fenster: '' };

  const schnitt = roh.indexOf('/');
  const kopf = schnitt === -1 ? roh : roh.slice(0, schnitt);
  let rest = schnitt === -1 ? '' : roh.slice(schnitt + 1);
  try { rest = decodeURIComponent(rest); } catch (e) { /* kaputte Adresse: roh lassen */ }

  // Ein Fenster lässt die Ansicht darunter stehen. Beim ersten Laden gibt es
  // noch keine — dann ist es die Kursliste, wie überall sonst auch.
  if (PU.ROUTE_FENSTER[kopf]) {
    return { ansicht: PU.aktuell || 'lernen', wo: (PU.lernenZustand || {}).wo || 'liste',
             pfad: '', fenster: kopf };
  }
  if (PU.ROUTE_LERNORTE[kopf] && rest !== '') {
    return { ansicht: 'lernen', wo: kopf, pfad: rest, fenster: '' };
  }
  if (PU.ROUTE_ANSICHTEN.indexOf(kopf) !== -1) {
    return { ansicht: kopf, wo: 'liste', pfad: '', fenster: '' };
  }
  return { ansicht: 'lernen', wo: 'liste', pfad: '', fenster: '' };
};

/* ---------------------------------------------------------------- Schreiben */

/** Die Adresse, die zum jetzigen Zustand gehört. */
PU.routeBauen = function () {
  // Ein offenes Fenster gewinnt: Es ist das, was gerade zu sehen ist.
  if (PU.fensterOffen) return '#/' + PU.fensterOffen;
  if (PU.aktuell !== 'lernen') return '#/' + PU.aktuell;

  const z = PU.lernenZustand || {};
  // encodeURI und nicht encodeURIComponent: die Schrägstriche im Pfad sollen
  // Schrägstriche bleiben, damit die Adresse lesbar ist. Umlaute und
  // Leerzeichen werden trotzdem verpackt.
  if (z.wo === 'kurs'     && z.kurs)    return '#/kurs/'     + encodeURI(z.kurs);
  if (z.wo === 'lektion'  && z.lektion) return '#/lektion/'  + encodeURI(z.lektion);
  if (z.wo === 'pruefung' && z.kurs)    return '#/pruefung/' + encodeURI(z.kurs);
  return '#/lernen';
};

/**
 * Die Adresse nachziehen.
 *
 * **Nur wenn sie sich unterscheidet.** Sonst legt jeder Aufruf einen weiteren
 * gleichen Eintrag im Verlauf an, und der Zurück-Knopf müsste erst fünfmal
 * durch dieselbe Seite, bevor sich etwas bewegt. Weil hier verglichen wird,
 * braucht es auch keine Sperre gegen das eigene `hashchange`: Ein Schreiben,
 * das nichts ändert, löst keines aus.
 *
 * @param {boolean} ersetzen true = keinen neuen Verlaufseintrag anlegen
 */
PU.routeSchreiben = function (ersetzen) {
  const soll = PU.routeBauen();
  if (location.hash === soll) return;

  if (ersetzen && history.replaceState) {
    history.replaceState(null, '', location.pathname + location.search + soll);
    return;
  }
  location.hash = soll;
  PU.routeSchritte++;
};

/* ---------------------------------------------------------------- Anwenden */

/**
 * Die Adresse zum Zustand machen — beim Laden und bei jedem `hashchange`.
 *
 * Führt die Adresse ins Leere (eine Ansicht, die diese Ebene nicht sehen
 * darf), landet man auf der Kursliste, und die Adresse wird **ersetzt** statt
 * angehängt: Ein Verlaufseintrag, der nirgendwohin führt, ist eine Falle für
 * den Zurück-Knopf.
 */
PU.routeAnwenden = function () {
  const r = PU.routeLesen();

  /* Fenster zuerst — und zwar in beide Richtungen. Ohne den zweiten Teil bliebe
     das Fenster stehen, wenn jemand mit dem Zurück-Knopf aus ihm herausgeht:
     Die Adresse wäre wieder die Ansicht, das Fenster läge weiter darüber. */
  if (r.fenster) {
    if (PU.fensterOffen !== r.fenster) {
      PU.fensterOffen = r.fenster;
      if (r.fenster === 'ziel' && PU.zielSeite) PU.zielSeite();
    }
    return;                       // Die Ansicht darunter bleibt, wie sie war.
  }
  if (PU.fensterOffen) {
    PU.fensterOffen = '';
    if (PU.modalSchliessen) PU.modalSchliessen();
  }

  if (r.ansicht === 'lernen') {
    PU.lernenZustand = {
      wo:      r.wo,
      kurs:    (r.wo === 'kurs' || r.wo === 'pruefung') ? r.pfad : (PU.lernenZustand || {}).kurs || null,
      lektion: r.wo === 'lektion' ? r.pfad : null,
      herVon:  null
    };
  }

  if (!PU.wechsel(r.ansicht)) {
    PU.lernenZustand = { wo: 'liste', kurs: null, lektion: null };
    PU.wechsel('lernen');
    PU.routeSchreiben(true);
  }
};

PU.routeStart = function () {
  window.addEventListener('hashchange', function () {
    PU.routeSchritte++;
    PU.routeAnwenden();
  });
  PU.routeAnwenden();
  // Beim ersten Anzeigen die Adresse ergänzen, ohne einen Eintrag anzulegen:
  // sonst müsste man einmal zurück, um von „/" auf „/#/lernen" zu kommen.
  PU.routeSchreiben(true);
};

/* ============================================================ Die Pfadleiste
 *
 * Zurück-Knopf und Brotkrume in einer Zeile, über allem, in jeder Ansicht.
 *
 * Die Brotkrume wird ZWEIMAL gesetzt: einmal grob aus der Adresse, sofort beim
 * Wechsel — damit dort nie ein Loch klafft, während geladen wird —, und dann
 * noch einmal von der Ansicht selbst, sobald sie die richtigen Titel kennt.
 * Der Kurstitel steht nicht in der Adresse, nur sein Pfad.
 */

PU.ANSICHT_NAMEN = {
  lernen: 'Lernen', fortschritt: 'Fortschritt', tutor: 'Tutor',
  tokenicer: 'Tokenicer', klasse: 'Klasse', cockpit: 'Cockpit'
};

/**
 * @param {Array} teile Liste aus [Beschriftung, Adresse|null]. Der letzte
 *                      Eintrag ist der Ort selbst und bekommt keine Adresse.
 */
PU.pfadSetzen = function (teile) {
  const leiste = document.getElementById('pfadleiste');
  if (!leiste) return;

  leiste.innerHTML = '';

  // Der Zurück-Knopf. Er wird nicht versteckt, wenn nichts dahinter liegt,
  // sondern abgeschaltet: ein Knopf, der beim Laden erscheint und wieder
  // verschwindet, lässt die Zeile springen.
  const zurueck = PU.el('button', 'pfad-zurueck', '‹ Zurück');
  zurueck.type = 'button';
  zurueck.disabled = PU.routeSchritte < 1;
  zurueck.title = zurueck.disabled
    ? 'Hier bist du gestartet — dahinter liegt nichts mehr.'
    : 'Einen Schritt zurück';
  zurueck.addEventListener('click', () => history.back());
  leiste.appendChild(zurueck);

  const krume = PU.el('nav', 'pfad-krume');
  krume.setAttribute('aria-label', 'Pfad');

  teile.forEach((t, i) => {
    if (i > 0) {
      const trenner = PU.el('span', 'pfad-trenner', '›');
      trenner.setAttribute('aria-hidden', 'true');
      krume.appendChild(trenner);
    }
    if (t[1]) {
      // Ein echter Link, kein Knopf mit Klickhorcher: damit „in neuem Tab
      // öffnen" und das Kopieren der Adresse funktionieren.
      const a = PU.el('a', 'pfad-glied', PU.h(t[0]));
      a.href = t[1];
      krume.appendChild(a);
    } else {
      const s = PU.el('span', 'pfad-glied jetzt', PU.h(t[0]));
      s.setAttribute('aria-current', 'page');
      krume.appendChild(s);
    }
  });

  leiste.appendChild(krume);
};

/** Die grobe Krume, allein aus der Adresse — bevor Titel geladen sind. */
PU.pfadAusRoute = function () {
  const r = PU.routeLesen();

  if (r.ansicht !== 'lernen') {
    return PU.pfadSetzen([['Home', '#/lernen'], [PU.ANSICHT_NAMEN[r.ansicht] || r.ansicht, null]]);
  }
  if (r.wo === 'liste') return PU.pfadSetzen([['Home', null]]);

  // Der Kurstitel fehlt hier noch. „Kurs" ist ein ehrlicher Platzhalter für
  // den Augenblick, in dem geladen wird — die Ansicht setzt gleich nach.
  const wort = r.wo === 'lektion' ? 'Lektion' : (r.wo === 'pruefung' ? 'Prüfung' : 'Kurs');
  return PU.pfadSetzen([['Home', '#/lernen'], [wort, null]]);
};
