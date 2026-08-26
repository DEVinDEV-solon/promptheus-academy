/* PROMPTHEUS — Die Zielseite: der Zusatzkurs „Brand-Guideline" in ganzer Länge.
 *
 * **Warum eine eigene Seite und nicht ein Absatz mehr auf der Karte.**
 * Die Zielkarte hat vier Zeilen. Vier Zeilen können ein Versprechen geben, aber
 * sie können es nicht begründen — und dieser Kurs ist der einzige, den niemand
 * vorher gesehen hat. Wer nicht versteht, was eine Brand-Guideline ist, liest
 * auf der Karte „Farben und Schrift bündeln" und denkt an ein Farbfeld. Der
 * Wert liegt woanders: Man beschreibt seinen Stil **einmal** und bekommt ihn
 * danach aus jedem Modell zurück, ohne ihn je wieder einzutippen.
 *
 * Das lässt sich nicht behaupten, das muss man zeigen. Deshalb steht neben
 * jedem Abschnitt ein Beispiel (`zielbilder.js`), und deshalb ist die Seite
 * lang genug, um die vier Gruppen — Schule, Lehrende, Eltern, Lernende —
 * einzeln anzusprechen. Ein Satz für alle vier wäre für keine der vier einer.
 *
 * **Sie ist kein Kurs.** Hier wird nichts gelernt und nichts gespeichert; es
 * ist die Auskunft darüber, was am Ende wartet. Deshalb ein Fenster und keine
 * Ansicht: Man geht hinein, liest, und ist wieder dort, wo man war.
 */
'use strict';

window.PU = window.PU || {};

/* ---------------------------------------------------------------- Inhalt
 * Die Abschnitte stehen als Daten und nicht als HTML-Block, weil jeder
 * dieselbe Form hat: Augenmerk, Überschrift, Text, Beispiel. Wo die Form
 * feststeht, gehört sie an eine Stelle — sonst rutscht beim fünften Abschnitt
 * ein Absatz aus der Spalte, und niemand sieht es.
 *
 * `foto` ist ein Angebot, keine Zusage: Liegt die Datei da, wird sie statt der
 * Zeichnung gezeigt. Fehlt sie, bleibt die Zeichnung stehen. Die Seite ist zu
 * jedem Zeitpunkt vollständig — auch bevor ein einziges Bild erzeugt wurde.
 */
PU.ZIEL_ABSCHNITTE = [
  {
    id: 'problem',
    augenmerk: 'Das Problem',
    titel: 'Ein Modell hat keinen Stil. Es hat einen Durchschnitt.',
    text: [
      'Frag dasselbe Modell dreimal nach einem Text, und du bekommst drei ' +
      'Texte. Jeder für sich brauchbar. Zusammen ergeben sie nichts: andere ' +
      'Länge, andere Anrede, andere Vorliebe für Aufzählungen.',

      'Das liegt nicht an der Frage. Ein Sprachmodell antwortet aus dem, was ' +
      'im Mittel geschrieben wurde — und der Mittelwert von allem hat keine ' +
      'Handschrift. Wer eine will, muss sie mitliefern.',

      'Die übliche Antwort darauf ist, den Stil in jede Anfrage zu tippen. ' +
      'Das funktioniert und kostet jedes Mal Zeit. Schlimmer: Es kommt jedes ' +
      'Mal etwas anders heraus, weil man nie zweimal genau dasselbe schreibt. ' +
      'Nach vier Wochen hat man vier Stile und weiß nicht mehr, welcher der ' +
      'richtige war.'
    ],
    bild: 'ohneGuideline'
  },

  {
    id: 'was',
    augenmerk: 'Die Antwort',
    titel: 'Zwei Seiten, die alles Weitere entscheiden.',
    text: [
      'Eine Brand-Guideline ist ein kurzes Dokument, das festhält, wie du ' +
      'klingst, wie du aussiehst und was du nie tust. Nicht als Gefühl, ' +
      'sondern in Feldern, die man vorlesen kann.',

      'Acht Felder reichen: Wer du bist. Für wen. Die Haltung. Die Ansprache. ' +
      'Drei Farben und was jede <b>bedeutet</b>. Ein Gut-und-Schlecht-Paar je ' +
      'Regel. Die Form je Anlass. Und die Verbotsliste.',

      '<b>Zwei Seiten sind die Obergrenze, nicht das Minimum.</b> Eine ' +
      'Guideline, die niemand ganz liest, wirkt wie keine — und sie muss in ' +
      'einen Systemprompt passen. Das ist kein Zufall, das ist das Maß.',

      'PROMPTHEUS hat so ein Dokument. Es liegt in der Bibliothek, es gilt ' +
      'für jede Zeile auf diesem Bildschirm, und im Kurs baust du deins in ' +
      'genau derselben Ordnung.'
    ],
    bild: 'dokument'
  },

  {
    id: 'dialektik',
    augenmerk: 'Der Widerspruch',
    titel: 'Stil und Konsistenz ziehen gegeneinander.',
    text: [
      '<b>Stil</b> heißt unverwechselbar sein. Je eigener die Handschrift, ' +
      'desto klarer erkennt man dich wieder.',

      '<b>Konsistenz</b> heißt verlässlich sein. Je fester die Regel, desto ' +
      'weniger Raum bleibt für das Eigene im einzelnen Fall.',

      'Wer nur das Erste verfolgt, bekommt fünf brillante Texte, die nach ' +
      'fünf verschiedenen Häusern klingen. Wer nur das Zweite verfolgt, ' +
      'bekommt Formularsprache: fehlerfrei, austauschbar, tot.',

      'Der Ausweg ist nicht die Mitte. Es ist eine Grenze an der richtigen ' +
      'Stelle: <b>Fest ist, was der Leser wiedererkennen soll. Frei ist, was ' +
      'der Anlass verlangt.</b>',

      'Wo diese Linie bei dir läuft, ist die eigentliche Arbeit des Kurses. ' +
      'Sie ist bei einer Zahnarztpraxis woanders als bei einem Skateshop, und ' +
      'beide Male ist sie richtig.'
    ],
    bild: 'dialektik'
  },

  {
    id: 'chatbot',
    augenmerk: 'Einsatz · Stufe 1',
    titel: 'Der einzelne ChatBot: einmal oben, danach nie wieder.',
    text: [
      'Die Guideline kommt in den Systemprompt — die Anweisung, die über ' +
      'jedem Gespräch steht und die niemand mehr sieht. Das ist der ganze ' +
      'Trick, und er ist mehr wert als jede Formulierungskunst am ' +
      'Einzelprompt: Was oben steht, gilt für jede Antwort, ohne dass jemand ' +
      'es wiederholt.',

      'Sechs Zeilen genügen für den Anfang: Haltung, Ansprache, Form, ' +
      'Verbote, und was bei einer Absage passiert.',

      'Im Kurs schreibst du diese Zeilen aus deinem eigenen Dokument heraus ' +
      'und siehst am selben Bot, wie sich die Antworten davor und danach ' +
      'unterscheiden. <b>Kein „bitte", kein „versuche"</b> — eine Regel im ' +
      'Systemprompt ist ein Zustand, keine Bitte.'
    ],
    bild: 'chatbot'
  },

  {
    id: 'agent',
    augenmerk: 'Einsatz · Stufe 2',
    titel: 'Der Agent tut etwas. Also gehört mehr ins Dokument.',
    text: [
      'Ein Agent schreibt nicht nur, er handelt: Er sucht, rechnet, legt an, ' +
      'ändert. Damit kommen zwei Regelsorten dazu, die ein ChatBot nicht ' +
      'braucht.',

      '<b>Wie er berichtet.</b> „Fertig" ist keine Meldung. Was getan wurde, ' +
      'was dabei herauskam, was noch offen ist — drei Teile, immer in dieser ' +
      'Reihenfolge. Wer das nicht festlegt, bekommt mal einen Roman und mal ' +
      'ein Wort.',

      '<b>Wo er stehenbleibt.</b> Vor dem Unumkehrbaren wird gefragt. Das ist ' +
      'keine technische Einstellung, das ist Marke: Ein Werkzeug, das ' +
      'ungefragt löscht, ist ein anderes Werkzeug — auch wenn es dasselbe ' +
      'Modell benutzt.'
    ],
    bild: 'agent'
  },

  {
    id: 'system',
    augenmerk: 'Einsatz · Stufe 3',
    titel: 'Mehrere Agenten: hier zahlt sich das Dokument aus.',
    text: [
      'Vier Agenten, viermal einzeln formuliert, ergeben vier Marken. Die ' +
      'Lösung ist nicht, denselben Absatz viermal zu schreiben — nach dem ' +
      'dritten Nachziehen weicht einer ab, und niemand merkt es.',

      '<b>Eine Datei, vier Verweise.</b> Jeder Agent bekommt die Guideline ' +
      'unverändert, dazu seine Rolle: Der eine antwortet Lernenden, der ' +
      'andere bewertet, der dritte schreibt Sprechtext, der vierte Lektionen.',

      'Was dabei entsteht, ist der eigentliche Wert: <b>Die Ausgaben passen ' +
      'zueinander, obwohl sie aus verschiedenen Läufen kommen.</b> Der Prüfer ' +
      'widerspricht dem Tutor nicht im Ton, der Sprecher klingt wie der Autor ' +
      'schreibt.',

      'Und eine Änderung ist eine Zeile. Sie greift überall gleichzeitig — ' +
      'das ist der Unterschied zwischen einem System und vier Werkzeugen, die ' +
      'zufällig nebeneinanderstehen.'
    ],
    bild: 'system'
  },

  {
    id: 'schule',
    augenmerk: 'Für die Schule',
    titel: 'Außenwirkung und Sekretariat sprechen dieselbe Sprache.',
    text: [
      'Eine Schule schreibt mehr, als ihr bewusst ist: Anmeldeformulare, ' +
      'Elternbriefe, Aushänge, Pressemitteilungen, Absagen, die Seite im ' +
      'Netz. Meistens schreibt jede Stelle für sich, und man sieht es.',

      'Mit einem Dokument sieht man stattdessen die Schule. Das wirkt nach ' +
      'außen — bei Eltern, die zwischen zwei Häusern wählen — und es spart ' +
      'nach innen Zeit: Das Sekretariat muss nicht abwägen, wie man auf eine ' +
      'Absage antwortet. Es steht da.',

      '<b>Und es entscheidet, was der Schul-Bot sagt, wenn er etwas nicht ' +
      'weiß.</b> Diese eine Antwort formt das Bild der Schule stärker als ' +
      'jedes Plakat, weil sie am häufigsten vorkommt.',

      'Im Kurs entsteht das Dokument gemeinsam: Die Klasse erarbeitet es für ' +
      'die eigene Schule. Was dabei herauskommt, ist kein Übungsstück, ' +
      'sondern brauchbar.'
    ],
    bild: 'schule',
    foto: 'assets/img/ziel/schule.jpg'
  },

  {
    id: 'lehrer',
    augenmerk: 'Für Lehrende',
    titel: 'Der Bildungsauftrag, aufgeschrieben statt vorausgesetzt.',
    text: [
      'Arbeitsblatt, Folie, Elterninfo — drei Flächen, ein Unterricht. Wenn ' +
      'sie zusammenpassen, muss niemand sich neu orientieren, und die ' +
      'Aufmerksamkeit bleibt beim Stoff.',

      'Wichtiger ist der zweite Teil. In einer Lehr-Guideline stehen Sätze ' +
      'wie <i>„Ich sage nie, etwas sei einfach"</i>. Wer es dann nicht ' +
      'schafft, hält sich für dumm. Das ist keine Geschmacksfrage, sondern ' +
      'Pädagogik — und sie gehört aufgeschrieben, sonst gilt sie nur, solange ' +
      'man daran denkt.',

      'Sobald sie aufgeschrieben ist, gilt sie auch für die Werkzeuge: Der ' +
      'Bot, der Übungsaufgaben erzeugt, hält sich an denselben Satz. Ohne ' +
      'Dokument tut er das nicht — er hat den Mittelwert des Internets ' +
      'gelernt, und der sagt ständig, etwas sei einfach.',

      '<b>Damit wird die Guideline zum Werkzeug der Fachkonferenz:</b> ein ' +
      'Blatt, auf das man sich einigt, statt sechs Auffassungen davon, wie ' +
      'man mit Klasse 7 spricht.'
    ],
    bild: 'lehrer',
    foto: 'assets/img/ziel/lehrer.jpg'
  },

  {
    id: 'eltern',
    augenmerk: 'Für Eltern',
    titel: 'Dieselbe Methode, egal welcher Beruf.',
    text: [
      'Der Handwerksbetrieb schreibt Angebote. Die Praxis schreibt Aushänge ' +
      'und Terminabsagen. Das Café schreibt Karten und Ankündigungen. Das ' +
      'Büro schreibt Bewerbungen und Berichte.',

      'Vier Berufe, vier Textsorten — und dieselbe Frage darunter: Wie ' +
      'schreibe <i>ich</i>, damit ein Modell es für mich fortsetzen kann?',

      'Der Satz, der das Geld spart, lautet: <b>Ein Angebot schreiben lassen, ' +
      'ohne jedes Mal zu erklären, wie man schreibt.</b> Ohne Dokument wandert ' +
      'die Stilvorgabe in jeden einzelnen Auftrag, jedes Mal neu getippt, ' +
      'jedes Mal etwas anders. Mit Dokument steht sie einmal oben.',

      'Für Selbständige kommt etwas dazu, das über Zeit hinausgeht: Ein ' +
      'kleiner Betrieb hat selten ein Corporate Design, und ein Studio dafür ' +
      'kostet vierstellig. Zwei Seiten, die festhalten, wie man klingt und ' +
      'aussieht, sind der brauchbare Anfang davon — und sie entstehen an ' +
      'einem Abend, zusammen mit dem eigenen Kind.'
    ],
    bild: 'eltern',
    foto: 'assets/img/ziel/eltern.jpg'
  },

  {
    id: 'schueler',
    augenmerk: 'Für Lernende',
    titel: 'Praktisch heute, privat morgen.',
    text: [
      '<b>Praktisch:</b> die Bewerbung um den Praktikumsplatz, das Referat, ' +
      'das Plakat für das Turnier am Samstag. Alles Dinge, bei denen man ' +
      'gerade jetzt nicht weiß, wie man anfängt — und bei denen eine ' +
      'Vorlage aus dem Netz sofort nach Vorlage aussieht.',

      '<b>Privat:</b> der eigene Kanal, der eigene Bot, das eigene Projekt. ' +
      'Wer seinen Stil beschrieben hat, bekommt Antworten, die nach ihm ' +
      'klingen — und nicht nach einem Modell ab Werk. Das ist der ganze ' +
      'Unterschied, und man hört ihn sofort.',

      'Dazu kommt das, was der Kurs nebenbei beibringt: sich selbst zu ' +
      'beschreiben. Vier Eigenschaften nennen und je eine Gegenprobe dazu — ' +
      '„genau, aber nicht pedantisch" — ist eine Übung, die weit über ' +
      'Sprachmodelle hinaus trägt.',

      'Am Ende steht eine eigene Webseite, gebaut nach dem eigenen Dokument. ' +
      'Nicht als Vorlage mit ausgetauschten Farben, sondern aus Entscheidungen, ' +
      'die man begründen kann.'
    ],
    bild: 'schueler',
    foto: 'assets/img/ziel/schueler.jpg'
  },

  {
    id: 'paket',
    augenmerk: 'Zum Mitnehmen',
    titel: 'Als Paket herunterladen. Frei benutzbar, für immer.',
    text: [
      'Am Ende steht ein Ordner, und den bekommst du als <b>.zip</b>: dein ' +
      'Dokument, der Systemprompt-Baustein, die Seite mit ihren Farbtokens, ' +
      'die Prüfliste. Alles lesbare Dateien — kein Format, das nur in dieser ' +
      'Academy aufgeht.',

      'Die Vorlage und die Bausteine stehen unter <b>MIT</b> und ' +
      '<b>Apache&nbsp;2.0</b>. Beide erlauben dasselbe: benutzen, ändern, ' +
      'weitergeben, verkaufen — ohne zu fragen und ohne zu zahlen. Apache 2.0 ' +
      'gibt zusätzlich eine Patentzusage, was für Betriebe zählt, die etwas ' +
      'darauf aufbauen wollen. <b>Du wählst, welche der beiden du nimmst.</b>',

      '<b>Was du hineingeschrieben hast, gehört dir allein.</b> Deine Marke, ' +
      'deine Sätze, deine Farben — darauf hat die Academy keinen Anspruch und ' +
      'erteilt dir auch keine Erlaubnis dafür. Eine Lizenz auf deine eigene ' +
      'Handschrift wäre eine Anmaßung. Lizenziert ist nur, was wir beigelegt ' +
      'haben.',

      'Damit lässt sich das Ergebnis in ein Schulprojekt legen, in ein ' +
      'Geschäft mitnehmen oder öffentlich stellen, ohne noch einmal nach ' +
      'Erlaubnis zu fragen. Das ist der Sinn: <b>Von Vielen, für Alle.</b>'
    ],
    bild: 'paket'
  },

  {
    id: 'ergebnis',
    augenmerk: 'Am Ende',
    titel: 'Vier Dinge, die du behältst.',
    text: [
      '<b>Das Dokument.</b> Zwei Seiten, acht Felder, deine Antworten.',

      '<b>Der Systemprompt-Baustein.</b> Herausgezogen aus dem Dokument, ' +
      'einsetzbar in jeden Bot, jeden Agenten, jedes System.',

      '<b>Die Webseite.</b> Gebaut nach dem Dokument, damit sichtbar wird, ' +
      'dass es trägt.',

      '<b>Die Prüfliste.</b> Zehn Fragen, die vor dem Abgeben durchgegangen ' +
      'werden — von dir oder von einem Modell, das dein Dokument kennt.',

      'Der Kurs ist der Abschluss der sechs Stufen und kostet nichts extra. ' +
      'Er setzt sie voraus: Ohne zu wissen, wie ein Modell Wörter zerlegt und ' +
      'warum ein Systemprompt anders wirkt als eine Frage, schreibt man ein ' +
      'Dokument, das gut klingt und nichts ändert.'
    ],
    bild: 'ergebnis'
  }
];

/* ---------------------------------------------------------------- Aufbau */

/**
 * Die Beispielspalte eines Abschnitts.
 *
 * Ein Foto ist ein Angebot: Steht in den Daten ein Dateiname und liegt die
 * Datei wirklich da, tritt das Foto an die Stelle der Zeichnung. Fehlt sie,
 * bleibt die Zeichnung — geprüft wird das am `error` des Bildes selbst und
 * nicht mit einer Anfrage vorab, denn die kostet einen Rundlauf für eine
 * Auskunft, die der Browser ohnehin gleich hat.
 */
function beispielSpalte(a) {
  const spalte = PU.el('figure', 'ziel-beispiel');
  const zeichnung = (PU.zielBild[a.bild] || function () { return ''; })();

  if (!a.foto) { spalte.innerHTML = zeichnung; return spalte; }

  const bild = PU.el('img', 'ziel-foto');
  bild.src = a.foto;
  bild.alt = '';           // Der Text daneben sagt schon, was zu sehen ist.
  bild.loading = 'lazy';
  bild.addEventListener('error', () => { spalte.innerHTML = zeichnung; });
  spalte.appendChild(bild);
  return spalte;
}

function abschnitt(a) {
  const s = PU.el('section', 'ziel-abschnitt');
  s.id = 'ziel-' + a.id;

  const text = PU.el('div', 'ziel-text');
  text.innerHTML =
    '<p class="ziel-augenmerk">' + PU.h(a.augenmerk) + '</p>' +
    '<h2>' + PU.h(a.titel) + '</h2>' +
    a.text.map(t => '<p>' + t + '</p>').join('');

  s.appendChild(text);
  s.appendChild(beispielSpalte(a));
  return s;
}

/**
 * Die Zielseite öffnen.
 *
 * Die beiden Zahlen kommen von der Karte, die geklickt wurde — „Lernen" zählt
 * bestandene Kurse, „Dein Stand" zählt Urkunden. Beide wissen es selbst; die
 * Seite rechnet nichts nach, sie schreibt es nur hin.
 */
PU.zielSeite = function (geschafft, gesamt) {
  /* Ohne Zahlen aufgerufen — über den Menüpunkt oder eine geteilte Adresse.
     Dann kommt der Stand aus dem, was zuletzt eine Karte gezählt hat. Ist auch
     das nicht da (Neuladen direkt auf `#/ziel`), bleibt die Zahl **weg**. Eine
     erfundene „noch 6 von 6" wäre schlimmer als keine: Sie stünde bei jemandem,
     der schon vier Stufen hat, und wäre schlicht falsch. */
  if (geschafft === undefined && gesamt === undefined) {
    const s = PU.zielStand || {};
    geschafft = s.geschafft;
    gesamt    = s.gesamt;
  }
  if (!gesamt) gesamt = Object.keys(PU.stufen || {}).length || 6;

  const bekannt = typeof geschafft === 'number';
  const offen   = bekannt ? Math.max(0, gesamt - geschafft) : 0;
  const fertig  = bekannt && gesamt > 0 && offen === 0;

  const flaeche = PU.modalVollbild(
    'Brand-Guideline',
    'Der 7. Kurs nach Stufe ' + gesamt + ' — deine eigene Marke, deine eigene Webseite.');
  if (!flaeche) return;

  // Damit die Adresse `#/ziel` stimmt, auch wenn die Karte das Fenster geöffnet
  // hat und nicht der Menüpunkt.
  PU.fensterOffen = 'ziel';
  if (PU.routeSchreiben) PU.routeSchreiben();

  const seite = PU.el('div', 'ziel-seite');

  /* Der Aufmacher trägt den Kern in drei Sätzen. Wer nach dem ersten Bildschirm
     abbricht, soll trotzdem wissen, worum es geht. */
  const kopf = PU.el('header', 'ziel-kopf' + (fertig ? ' feier' : ''));

  const kopftext = PU.el('div', 'ziel-kopftext');
  kopftext.innerHTML =
    '<p class="ziel-augenmerk">Das Ziel der sechs Stufen</p>' +
    '<h1>Beschreibe deinen Stil einmal.<br>Bekomme ihn danach aus jedem Modell zurück.</h1>' +
    '<p class="ziel-vorspann">Eine Brand-Guideline ist kein Farbfeld und kein Logo-Handbuch. ' +
    'Sie ist die Beschreibung deiner Handschrift in einer Form, die ein Mensch lesen ' +
    'und eine Maschine befolgen kann — für einen ChatBot, für einen Agenten mit ' +
    'Werkzeugen, für ein ganzes System aus mehreren.</p>' +
    '<p class="ziel-stand">' + (bekannt
      ? (fertig
          ? 'Alle Stufen bestanden. Der Kurs steht auf deiner Glückwunschseite bereit.'
          : 'Noch <b>' + offen + '</b> von ' + gesamt + ' Stufen, dann ist er frei.')
      : 'Frei nach der bestandenen Prüfung der letzten Stufe.') + '</p>';
  kopf.appendChild(kopftext);

  /* Rechts neben dem Kopf steht das Aufmacherbild. Es nutzt nicht nur den
     Raum: Der Kopf ist der einzige Abschnitt ohne Beispiel daneben, und ohne
     eines beginnt eine Seite aus zwölf Bildpaaren mit einer leeren Hälfte. */
  kopf.appendChild(beispielSpalte({ bild: 'kopfbild', foto: 'assets/img/ziel/kopf.jpg' }));

  seite.appendChild(kopf);

  PU.ZIEL_ABSCHNITTE.forEach(a => seite.appendChild(abschnitt(a)));

  /* Der Schluss nennt den Stand ein zweites Mal — wer bis hierher gelesen hat,
     ist zwei Bildschirmhöhen vom Kopf entfernt und weiß nicht mehr, wo er steht. */
  const schluss = PU.el('footer', 'ziel-schluss');
  schluss.innerHTML =
    '<p>' + (fertig
      ? 'Du hast alle sechs Stufen. Der Kurs wartet.'
      : 'Noch <b>' + offen + '</b> von ' + gesamt + ' Stufen. Der Kurs kostet nichts ' +
        'extra und läuft nicht ab.') + '</p>';

  const zurueck = PU.el('button', 'knopf', fertig ? 'Zum Kurs' : 'Weiterlernen');
  zurueck.type = 'button';
  zurueck.addEventListener('click', () => {
    PU.modalSchliessen();
    if (PU.wechsel) PU.wechsel('lernen');
  });
  schluss.appendChild(zurueck);
  seite.appendChild(schluss);

  flaeche.appendChild(seite);
};
