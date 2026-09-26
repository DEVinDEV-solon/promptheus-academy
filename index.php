<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Login-Gate und App-Shell.
 *
 * Die Seite entscheidet drei Fälle:
 *   1. Es gibt noch kein Konto  -> Einrichtung (erstes Konto wird Tutor)
 *   2. Niemand ist angemeldet   -> Anmeldung
 *   3. Angemeldet               -> die Academy
 *
 * Der Lehrstoff steht NICHT in dieser Datei. Er kommt ueber `api.php`, damit
 * `pu_aufgabe_oeffentlich()` dazwischen sitzt: was hier ins HTML gerendert
 * würde, wäre im Quelltext lesbar — auch die Lösung.
 *
 * **Die Darstellung steht dagegen schon im HTML**, als `data-`Angaben am
 * `<html>`-Element. Käme sie erst per JavaScript nach, sähe jeder Lernende
 * beim Laden für einen Lidschlag das falsche Thema — und wer die Academy abends
 * hell aufblitzen sieht, glaubt der Einstellung beim nächsten Mal nicht mehr.
 */

require_once __DIR__ . '/lib.php';
require_once __DIR__ . '/srv/db.php';
require_once __DIR__ . '/srv/rechte.php';
require_once __DIR__ . '/srv/abo.php';
require_once __DIR__ . '/srv/preistafel.php';
require_once __DIR__ . '/srv/lernende.php';
require_once __DIR__ . '/srv/einstellungen.php';
require_once __DIR__ . '/srv/varianten.php';
require_once __DIR__ . '/srv/tutor.php';
require_once __DIR__ . '/srv/kennzahlen.php';

$leer  = pu_leer();
$wer   = pu_wer();
$offen = $wer === null;

// Vor der Anmeldung gibt es keine persönlichen Einstellungen — das Tor
// erscheint in der Vorgabe. Danach gelten die des Kontos.
$einst = $offen ? [] : pu_einst_person((int)$wer['id']);
$thema = $einst['thema'] ?? PU_EINST_PERSON['thema']['vorgabe'];

// Die Farbvariante steht nur zur Wahl, wenn die Academy-Regel sie freigibt.
// Ist sie aus, gilt die Vorgabe für alle — auch für jemanden, der sich früher
// einmal eine andere gewählt hat. Eine abgeschaltete Regel muss auch
// rückwirkend gelten, sonst ist sie keine.
$variantenAn = pu_regel_an('farbvarianten');
$variante    = $variantenAn
    ? ($einst['variante'] ?? PU_VARIANTE_VORGABE)
    : PU_VARIANTE_VORGABE;

// **Die Palette bestimmt hell oder dunkel, nicht umgekehrt.** Eine Palette ist
// entweder das eine oder das andere; „Olymp in hell" wäre eine andere Palette.
// Sind Varianten an, folgt das Thema also dem Grundton — und der ☀/☾-Knopf
// wechselt zur Partnerpalette statt eine Farbwelt aufzuhellen, für die sie
// nicht gebaut ist.
//
// Ohne Varianten bleibt alles wie zuvor: dann entscheidet die Themawahl.
if ($variantenAn) {
    $v = pu_variante($variante);

    // Wer in den Einstellungen „hell" wählt, meint es auch dann, wenn gerade
    // eine dunkle Palette gilt — dann wechselt die Palette zu ihrem hellen
    // Partner. Ohne das wäre die Themawahl bei aktiven Varianten wirkungslos:
    // man klickt „hell" und es bleibt dunkel.
    //
    // Bei „auto" bleibt die Palette stehen: was das Betriebssystem gerade
    // sagt, weiss erst der Browser, und eine Palette, die sich beim Laden
    // umentscheidet, wäre schlimmer als eine, die steht.
    $wunsch = $einst['thema'] ?? PU_EINST_PERSON['thema']['vorgabe'];
    if (($wunsch === 'hell' || $wunsch === 'dunkel') && $v['grundton'] !== $wunsch) {
        $variante = $v['partner'];
        $v = pu_variante($variante);
    }

    $thema = $v['grundton'];
}

// Die Feineinstellung steht als Inline-Style am <html>, nicht in einer
// Stilregel: sie ist persönlich, gilt also nur für diese eine Auslieferung.
// Und sie steht schon im HTML, nicht erst per JavaScript — käme sie nach,
// sähe man beim Laden für einen Lidschlag das kräftigere Bild.
$feinstil = $variantenAn ? pu_feinstil($einst) : '';

// Was im Menü steht, entscheidet die Rechte-Matrix — nicht die Ebene. Der
// Tokenicer braucht zweierlei: die Academy-Regel (ist er überhaupt in Betrieb?)
// und das Recht (darf diese Ebene ihn benutzen?).
$tokenicerAn = !$offen && pu_regel_an('tokenicer') && pu_recht_hat('tokenicer.nutzen', $wer);
$darfKlasse  = !$offen && pu_recht_hat('klassen.view', $wer);
$darfTutor   = !$offen && pu_regel_an('tutor_an') && pu_recht_hat('tutor.fragen', $wer);
$darfCockpit = !$offen && pu_recht_hat('abo.sehen', $wer);

// Der Monatswechsel läuft beim ersten Aufruf nach dem Stichtag, nicht über
// eine geplante Aufgabe: auf einem Rechner, der abends aus ist, feuert ein
// Zeitplan nicht, und dann fehlt das Kontingent bis zum nächsten Start.
if (!$offen) pu_abos_verlaengern();

// Was oben in der Kopfzeile steht. Serverseitig, damit die Leiste beim
// ersten Anblick nicht leer ist — und damit ein Test nachsehen kann, was
// eine Ebene dort zu sehen bekommt.
$kennzahlen = $offen ? [] : pu_kennzahlen($wer);

// Urkunde prüfen geht ohne Anmeldung — deshalb hat die Anmeldeseite einen
// eigenen kleinen Bereich dafür. Ein Arbeitgeber soll eine Urkunde prüfen
// können, ohne ein Konto zu haben.
?><!doctype html>
<html lang="de"
      data-thema="<?= pu_h($thema) ?>"
      data-schrift="<?= pu_h($einst['schriftgroesse'] ?? 'normal') ?>"
      data-textschrift="<?= pu_h($einst['textschrift'] ?? 'serif') ?>"
      data-kontrast="<?= pu_h($einst['kontrast'] ?? 'normal') ?>"
      data-bewegung="<?= pu_h($einst['bewegung'] ?? 'normal') ?>"
      data-breite="<?= pu_h($einst['breite'] ?? 'normal') ?>"
      data-variante="<?= pu_h($variante) ?>"<?php
      if ($feinstil !== ''): ?>
      style="<?= pu_h($feinstil) ?>"<?php endif; ?>>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="referrer" content="no-referrer">
<title>PROMPTHEUS ACADEMY — KI-Feuer für junge Köpfe</title>
<link rel="icon" href="<?= pu_v('assets/img/promptheus.svg') ?>" type="image/svg+xml">
<link rel="stylesheet" href="<?= pu_v('assets/css/promptheus.css') ?>">
<!-- Die Markenebene liegt darüber: Ornamente, Lapis, durchscheinende Flächen,
     das Hintergrundbild. Zuerst die Bausteine, dann die Marke — die
     Reihenfolge ist die Regel, nicht der Zufall. -->
<link rel="stylesheet" href="<?= pu_v('assets/css/marke.css') ?>">
<?php if ($offen): ?>
<!-- Die Landingpage: die oeffentliche Startseite mit Login-Schirm und Preisen.
     Nur vor der Anmeldung geladen, damit die Academy nichts Ueberfluessiges traegt. -->
<link rel="stylesheet" href="<?= pu_v('assets/css/landing.css') ?>">
<?php endif; ?>
<?php if ($variantenAn): ?>
<!-- Die Farbvarianten stehen im Dokument, nicht in einer Datei: die Paletten
     liegen in PHP (die Auswahlliste braucht sie), und zwei Orte für dieselben
     Farben wären zwei Wahrheiten. Ein paar hundert Byte im Kopf sind billiger
     als eine Palette, die im Menü anders heisst als auf dem Bildschirm.

     **Nur wenn die Regel an ist.** Sonst stünden hier Farbangaben, die
     dieselbe Spezifität haben wie der Hell-Block und später kommen — dann
     bliebe die Seite dunkel, egal was der Hell/Dunkel-Knopf sagt. Genau so
     war es, bevor dieser Zweig hier stand. -->
<style><?= pu_varianten_css() ?></style>
<?php endif; ?>
<script>
  /* "auto" heißt: dem Betriebssystem folgen. Das steht hier oben und nicht in
     app.js, weil es VOR dem ersten Anstrich der Seite entschieden sein muss. */
  (function () {
    var w = document.documentElement;
    if (w.dataset.thema === 'auto') {
      var dunkel = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      w.dataset.themaEffektiv = dunkel ? 'dunkel' : 'hell';
    } else {
      w.dataset.themaEffektiv = w.dataset.thema;
    }
  })();
</script>
</head>
<?php
// Der Feuer-Höhepunkt zeigt ein Standbild — und, wenn eine Videospur vorliegt,
// einen kurzen Clip, den die Seite beim Scrollen von Hand durchfährt. Ob die
// Spur da ist, entscheidet der Server: ein <video> mit toter Quelle lädt sonst
// ins Leere. Die Spur wird örtlich ausgeliefert, nichts geht dabei hinaus.
$peakVideo = $offen && is_file(PU_ROOT . '/assets/video/peak.mp4');
// Der sprechende Prometheus neben „So lernst du". Stumm gestartet; der Ton
// wird im Bedienfeld des Videos zugeschaltet.
$methodeVideo = $offen && is_file(PU_ROOT . '/assets/video/methode-prometheus.mp4');
?>
<body class="<?= $offen ? ('landing' . ($peakVideo ? ' hat-peak-video' : '')) : 'uni' ?>">

<?php if ($offen): ?>
<!-- ==================================================== Landingpage
     Die öffentliche Startseite. Der Login steht NICHT hier — er ist ein eigener
     Schirm, der über den Knopf rechts oben erscheint. Die Seite ist eine
     Scroll-Folge mit wechselnden Mitteln: Held, angehaltene Frage, Aufdecken,
     gestaffeltes Raster, Stufen-Zug, der Feuer-Höhepunkt, Preise, Abschluss. -->
<header class="lp-bar" id="lp-bar">
  <a class="lp-wort" href="#">
    <span class="lp-flamme" aria-hidden="true">🔥</span><b>PROMPTHEUS</b><span>Academy</span>
  </a>
  <nav class="lp-bar-nav" aria-label="Abschnitte">
    <a class="lp-nav-fern" href="#methode">Methode</a>
    <a class="lp-nav-fern" href="#stufen">Stufen</a>
    <a class="lp-nav-fern" href="#preise">Preise</a>
    <button class="knopf" type="button" data-login-auf><?= $leer ? 'Academy einrichten' : 'Anmelden' ?></button>
  </nav>
</header>

<div class="lp" id="lp">

  <!-- 1 · Held (Parallax) -->
  <section class="lp-hero lp-sektion">
    <?php if (is_file(PU_ROOT . '/assets/video/peak-m.mp4')): ?>
    <!-- Der Prometheus als vollflächige, stumme Endlosschleife hinter dem Held.
         Das Standbild dient als Poster und als Rückfall bei „weniger Bewegung". -->
    <video class="lp-hero-video" autoplay muted loop playsinline preload="auto"
           poster="<?= pu_v('assets/img/background/promptheus-background.jpg') ?>" aria-hidden="true">
      <source src="<?= pu_v('assets/video/peak-m.mp4') ?>" type="video/mp4">
    </video>
    <?php endif; ?>
    <div class="lp-mitte lp-hero-inhalt">
      <p class="lp-kicker">KI-Academy · läuft auf deinem Rechner</p>
      <h1>KI-Feuer für <span class="glimm">junge Köpfe</span></h1>
      <p class="lp-lead">Lerne, wie Sprachmodelle wirklich arbeiten. Nicht durch
        Videos, sondern durch eigene Aufgaben. Ab neun Jahren, bis neunzig.</p>
      <div class="lp-cta">
        <button class="knopf gross" type="button" data-login-auf><?= $leer ? 'Academy einrichten' : 'Anmelden' ?></button>
        <a class="knopf still gross" href="#methode">Was du lernst</a>
      </div>
      <p class="lp-mini">
        <span>🔒 Keine Cloud, kein fremder Server</span>
        <span><b>✓</b> Preise ohne Konto sichtbar</span>
        <span>🖥 Ohne Internet nutzbar</span>
      </p>
    </div>
  </section>

  <!-- 2 · Frage (angehaltener Rahmen, Zeilen bauen sich auf) -->
  <section class="lp-frage" aria-label="Warum eigene Aufgaben">
    <div class="lp-frage-bahn">
      <div class="lp-frage-halt">
        <p class="lp-frage-text">
          <span class="z">Über KI gibt es tausend Videos.</span>
          <span class="z">Zusehen ist nicht können.</span>
          <span class="z glut">Feuer bekommt, wer es selbst entfacht.</span>
        </p>
      </div>
    </div>
  </section>

  <!-- 3 · Methode (Wisch-Aufdecken) -->
  <section class="lp-methode lp-sektion" id="methode">
    <div class="lp-mitte lp-methode-raster">
      <?php if ($methodeVideo): ?>
      <!-- Prometheus als stille Schleife. Rahmen mit Mäander verziert und
           pulsierend. Ohne Ton, läuft von selbst. -->
      <figure class="lp-video-rahmen">
        <video class="lp-video" loop muted autoplay playsinline
               preload="metadata" poster="<?= pu_v('assets/img/community.jpg') ?>">
          <source src="<?= pu_v('assets/video/methode-prometheus.mp4') ?>" type="video/mp4">
        </video>
      </figure>
      <?php else: ?>
      <div class="lp-wisch" style="background-image:url('<?= pu_v('assets/img/community.jpg') ?>')">
        <span class="lp-wisch-schrift">Du baust, statt zuzusehen.</span>
      </div>
      <?php endif; ?>
      <div class="lp-auf">
        <p class="lp-kicker">So lernst du</p>
        <h2>Du benutzt KI, um sie zu verstehen.</h2>
        <p class="lp-lead">Jede Lektion ist kurz, dann kommt eine Aufgabe. Zwölf
          Arten, von der Denkaufgabe bis zur Sicherheitslücke.</p>
        <ol class="lp-schritte">
          <li><span class="num">01</span><span><b>Lies eine kurze Lektion.</b>
            <span class="was">Ein Thema, klar erklärt, kein Fachwort ohne Erklärung.</span></span></li>
          <li><span class="num">02</span><span><b>Löse eine Aufgabe.</b>
            <span class="was">Schieben, zuordnen, rechnen, einen Prompt schreiben.</span></span></li>
          <li><span class="num">03</span><span><b>Bekomme sofort Rückmeldung.</b>
            <span class="was">Punkte rechnet die Academy, nicht das Sprachmodell.</span></span></li>
          <li><span class="num">04</span><span><b>Steig auf.</b>
            <span class="was">Vom Funken zum Prometheus, Stufe für Stufe.</span></span></li>
        </ol>
      </div>
    </div>
  </section>

  <!-- 4 · Substanz (gestaffeltes Raster) -->
  <section class="lp-features lp-sektion">
    <div class="lp-mitte">
      <div class="lp-auf lp-features-intro">
        <p class="lp-kicker">Worauf sie steht</p>
        <h2>Eine Academy, die man ernst nehmen kann.</h2>
      </div>
      <div class="lp-features-raster">
        <article class="lp-feature"><span class="sym" aria-hidden="true">🔥</span>
          <h3>Vier Tutoren</h3><p>Prometheus, Athena, Hermes und Hephaistos. Je
          nach Fach hilft ein anderer weiter.</p></article>
        <article class="lp-feature"><span class="sym" aria-hidden="true">✓</span>
          <h3>Punkte rechnet kein Modell</h3><p>Bewertung, Prüfungen und Urkunden
          sind deterministisch, mit Prüfcode zum Nachprüfen.</p></article>
        <article class="lp-feature"><span class="sym" aria-hidden="true">🖥</span>
          <h3>Läuft auf deinem Rechner</h3><p>Kein CDN, keine Webschrift, kein
          fremder Server. Lernstände bleiben örtlich.</p></article>
        <article class="lp-feature"><span class="sym" aria-hidden="true">📚</span>
          <h3>Sechs Stufen, zehn Fächer</h3><p>Von den Grundlagen bis zur ganzen
          Problemlösung, dazu Kurse für Handel, Jura, Büro und mehr.</p></article>
        <article class="lp-feature"><span class="sym" aria-hidden="true">🧮</span>
          <h3>Tokenicer</h3><p>Sieh, wie ein Modell deinen Text in Token zerlegt,
          und was ein Satz an Rechenzeit kostet.</p></article>
        <article class="lp-feature"><span class="sym" aria-hidden="true">🎨</span>
          <h3>Sechs Farbwelten</h3><p>Hell und dunkel, mit gemessenen Kontrasten.
          Auch für Rot-Grün-Blinde lesbar.</p></article>
        <article class="lp-feature"><span class="sym" aria-hidden="true">🎓</span>
          <h3>Für Familie und Schule</h3><p>Fünf Rechte-Ebenen, Klassenübersicht
          für Lehrkräfte, ein ruhiger Blick für Eltern.</p></article>
        <article class="lp-feature"><span class="sym" aria-hidden="true">🗣</span>
          <h3>Sprache und Glossar</h3><p>Frag per Sprachnachricht, und schlag
          jedes Fachwort an einer Stelle nach.</p></article>
      </div>
    </div>
  </section>

  <!-- 5 · Stufen (seitlicher Zug) -->
  <section class="lp-stufen lp-sektion" id="stufen">
    <div class="lp-mitte">
      <div class="lp-stufen-kopf lp-auf">
        <div class="lp-schmal">
          <p class="lp-kicker">Der Weg</p>
          <h2>Sechs Stufen, vom Funken zum Meister.</h2>
        </div>
        <p class="lp-stufen-hint">Läuft von selbst · zum Anhalten mit der Maus darüber</p>
      </div>
      <!-- Zweimal dieselben sechs Karten: der Zug wandert stetig, und nach
           genau einer Runde deckt die Kopie den Anfang, ohne sichtbaren Sprung. -->
      <div class="lp-zug-rahmen">
        <div class="lp-zug">
          <?php for ($runde = 0; $runde < 2; $runde++):
            foreach (PU_STUFEN as $nr => $s):
              $bild = strtolower(substr($s['schluessel'], 3)); ?>
          <article class="lp-stufe"<?= $runde ? ' aria-hidden="true"' : '' ?>
                   style="background-image:url('<?= pu_v('assets/img/stufen/' . $bild . '.jpg') ?>')">
            <div class="lp-stufe-inhalt">
              <div class="lp-stufe-nr">Stufe <?= (int)$nr ?></div>
              <h3><?= pu_h($s['name']) ?></h3>
              <p><?= pu_h($s['titel']) ?></p>
            </div>
          </article>
          <?php endforeach; endfor; ?>
        </div>
      </div>
    </div>
  </section>

  <!-- 6 · Höhepunkt: Prometheus bringt das Feuer.
       Das Markenbild füllt den Schirm, die Glut wächst, der Spruch entzündet
       sich Zeile für Zeile. Liegt eine Videospur vor, fährt landing.js sie beim
       Scrollen von Hand durch; sonst trägt das Standbild denselben Moment. -->
  <section class="lp-peak" aria-label="Prometheus bringt das Feuer">
    <div class="lp-peak-bahn">
      <div class="lp-peak-halt">
        <div class="lp-peak-bild" aria-hidden="true"
             style="background-image:url('<?= pu_v('assets/img/background/promptheus-background.jpg') ?>')"></div>
        <?php if ($peakVideo): ?>
        <video class="lp-peak-video" src="<?= pu_v('assets/video/peak.mp4') ?>"
               preload="auto" muted playsinline aria-hidden="true"></video>
        <?php endif; ?>
        <p class="lp-peak-text">
          <span class="z">Prometheus brachte den Menschen das Feuer.</span>
          <span class="z gold">PROMPTHEUS bringt ihnen das KI-Feuer.</span>
          <span class="z feuer">KI-Feuer für junge Köpfe.</span>
        </p>
      </div>
    </div>
  </section>

  <!-- 6.5 · Community-Netzwerk (Vorschau). Das Feuer, einmal gebracht, springt
       weiter. Eine Vorschau, kein Versprechen mit Datum. -->
  <section class="lp-community lp-sektion" aria-label="Community-Netzwerk">
    <div class="lp-mitte">
      <div class="lp-community-karte lp-auf"
           style="background-image:url('<?= pu_v('assets/img/community.jpg') ?>')">
        <div class="lp-community-inhalt">
          <p class="lp-kicker">Bald · Netzwerk</p>
          <h2>Ein Funke wird zum Lauffeuer.</h2>
          <p class="lp-lead">Wir vernetzen deine Schule mit anderen Schulen und
            Universitäten. Tausende Prompts, Skills und Plugins, geteilt von
            kreativen Köpfen, frei für alle.</p>
          <p class="lp-community-claim">Von Vielen, für Alle.</p>
          <span class="lp-tag">In Vorbereitung</span>
        </div>
      </div>
    </div>
  </section>

  <!-- 7 · Preise (ruhiges Absetzen). Dieselbe Tafel wie im Cockpit, nur ohne
       Buchen-Knöpfe: buchen kann man erst nach der Anmeldung. -->
  <section class="lp-preise lp-sektion" id="preise">
    <div class="lp-mitte">
      <div class="lp-preise-kopf lp-auf">
        <p class="lp-kicker">Zugang wählen</p>
        <h2>Vier Wege in dieselbe Academy.</h2>
        <p class="hinweis">Der Unterschied ist, für wie viele. <b>Je Student ist
          die Schule am günstigsten.</b> Die Preise stehen offen, buchen kannst
          du nach der Anmeldung. Jedes neue Konto startet mit
          <b><?= number_format(PU_PROBE_TOKEN, 0, ',', '.') ?> Token zum
          Ausprobieren</b>, geschenkt und ohne Verfallsdatum.</p>
      </div>

      <?= pu_preistafel_html() ?>

      <!-- Die zwei Wege stehen direkt unter der Tafel: wer gerade einen Preis
           gelesen hat, will als Nächstes wissen, was passiert, wenn er zugreift
           — und die Antwort ist bei Abo und Token nicht dieselbe. -->
      <?= pu_wege_html() ?>

      <!-- Token stehen auf einer eigenen, deckenden Fläche: über dem Prometheus
           wäre die feine Tabelle sonst kaum zu lesen. -->
      <div class="lp-token">
        <h3>Token nachlegen</h3>
        <p class="hinweis">In jedem Plan steckt ein monatliches Token-Kontingent.
          Wer mehr braucht, legt nach. <b>Token verfallen nie</b>, weder gekaufte
          noch das Kontingent: Was 365 Tage nach der Buchung noch frei ist, wird
          innerhalb der eigenen Einrichtung weiterverteilt.</p>
        <?= pu_pakete_html() ?>

        <h3>Was ein Token freischaltet</h3>
        <?= pu_werkzeuge_html() ?>

        <p class="klein" style="margin-top:1.2rem">Alle Beträge in Euro, brutto,
          ohne ausgewiesene Umsatzsteuer. Gebucht wird in der Academy, bezahlt
          wird auf Rechnung. Es ist kein Zahlungsdienst eingebunden, und es werden
          keine Kartendaten erhoben.</p>
      </div>
    </div>
  </section>

  <!-- 8 · Abschluss (fest, kein Ausklang) -->
  <section class="lp-close lp-sektion">
    <div class="lp-close-karte lp-auf">
      <p class="lp-kicker">Fang an</p>
      <h2>Hol dir das Feuer.</h2>
      <p class="lp-lead"><?= $leer
        ? 'Richte die Academy ein. Das erste Konto wird Tutor und legt danach weitere Konten an.'
        : 'Melde dich an und mach dort weiter, wo du warst.' ?></p>
      <div class="lp-cta">
        <button class="knopf gross" type="button" data-login-auf><?= $leer ? 'Academy einrichten' : 'Anmelden' ?></button>
        <a class="knopf still gross" href="#preise">Preise ansehen</a>
      </div>
    </div>
    <!-- Der Fussteil: links das Zeichen, rechts das Rechtliche. Die Jahreszahl
         kommt aus date('Y') und nicht aus dem Text — ein Impressum, in dem ab
         dem 1. Januar das falsche Jahr steht, ist der klassische Fall von
         „einmal geschrieben, nie wieder angesehen". -->
    <footer class="lp-fuss">
      <p class="lp-fuss-links">© <?= date('Y') ?> <span class="lp-fuss-wort">PROMPTHEUS Academy</span></p>
      <nav class="lp-fuss-rechts" aria-label="Rechtliches">
        <a href="recht.php?t=impressum">Impressum</a>
        <a href="recht.php?t=datenschutz">Datenschutz</a>
        <a href="recht.php?t=agb">AGB</a>
      </nav>
    </footer>
  </section>

</div><!-- .lp -->

<!-- ==================================================== Login-Schirm
     Erscheint über den Knopf rechts oben. Dann ist nur er zu sehen. Die Karte
     mit Anmeldung, Einrichtung und Urkundenprüfung ist dieselbe wie bisher. -->
<div class="login-schirm" id="login-schirm" hidden>
  <button class="login-zurueck" type="button" data-login-zu>← Zurück zur Startseite</button>
  <div class="tor-karte">
    <div class="flamme" aria-hidden="true">
      <svg viewBox="0 0 48 64" width="56" height="74">
        <path d="M24 2C24 2 8 20 8 36a16 16 0 0 0 32 0C40 26 30 22 30 12c0 0-6 6-6 14 0 0-6-6-6-16 0 0 6-8 6-8z"
              fill="url(#g)"/>
        <defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stop-color="#ff4d1c"/><stop offset=".55" stop-color="#ff9d2e"/>
          <stop offset="1" stop-color="#ffe08a"/>
        </linearGradient></defs>
      </svg>
    </div>
    <h1>PROMPTHEUS</h1>
    <p class="wortmarke-fuss">Academy</p>
    <p class="motto">KI-Feuer für junge Köpfe</p>

    <?php if ($leer): ?>
      <form id="form-einrichten" class="tor-form" autocomplete="off">
        <p class="hinweis">
          Noch kein Konto. Das erste Konto wird <strong>Tutor</strong> und darf
          danach weitere Konten anlegen.
        </p>
        <label>Kennung <input name="kennung" required minlength="3" maxlength="32"
               pattern="[a-z0-9][a-z0-9._-]{2,31}" placeholder="z. B. solon"></label>
        <label>Anzeigename <input name="anzeigename" required maxlength="60" placeholder="z. B. Solon"></label>
        <label>Kennwort <input name="kennwort" type="password" required minlength="8"></label>
        <button type="submit" class="knopf groß">Academy einrichten</button>
        <p class="fehler" id="tor-fehler" role="alert"></p>
      </form>
    <?php else: ?>
      <form id="form-anmelden" class="tor-form" autocomplete="off">
        <label>Kennung <input name="kennung" required autofocus></label>
        <label>Kennwort <input name="kennwort" type="password" required></label>
        <button type="submit" class="knopf groß">Anmelden</button>
        <p class="fehler" id="tor-fehler" role="alert"></p>
      </form>
    <?php endif; ?>

    <details class="urkunde-pruefen">
      <summary>Eine Urkunde prüfen</summary>
      <p class="hinweis">
        Der Prüfcode steht auf jeder PROMPTHEUS-Urkunde. Die Auskunft nennt
        Stufe, Datum und Gültigkeit — keinen Namen.
      </p>
      <form id="form-urkunde" autocomplete="off">
        <label>Prüfcode <input name="code" placeholder="PU-1-ABCD2345" required></label>
        <button type="submit" class="knopf">Prüfen</button>
      </form>
      <div id="urkunde-ergebnis"></div>
    </details>
  </div>
</div><!-- .login-schirm -->

<script src="<?= pu_v('assets/js/tor.js') ?>"></script>
<script src="<?= pu_v('assets/js/landing.js') ?>"></script>

<?php else: ?>
<!-- ======================================================== Academy

     Drei Spalten statt einer Zeile: das Menü links, der Stoff in der Mitte,
     der Tutor rechts. Dazwischen liegen Ziehgriffe — wer im Tutorfenster
     arbeitet, zieht den Stoff schmal; wer nur liest, klappt das Menü weg.

     Dadurch ist der Kopf frei geworden. Er trägt jetzt Kennzahlen, je nach
     Ebene andere. Was dort steht, entscheidet `pu_kennzahlen()` in
     srv/kennzahlen.php — nicht dieses Markup.                             -->
<?php if (pu_uebernommen()): $echt = pu_wer_echt(); ?>
<!-- Das Übernahme-Band. Serverseitig gerendert und nicht wegklickbar: Wer
     unter fremdem Namen handelt, soll das nicht vergessen können — und der
     Weg zurück soll immer sichtbar sein, auch wenn das übernommene Konto gar
     nichts darf. -->
<div class="uebernahme-band" role="status">
  <span class="ub-zeichen" aria-hidden="true">🎭</span>
  <span>Du handelst gerade als <b><?= pu_h($wer['anzeigename']) ?></b>
    (<?= pu_h(PU_EBENEN[$wer['rolle']]['anzeige'] ?? $wer['rolle']) ?>).
    Angemeldet bist du als <b><?= pu_h($echt['anzeigename'] ?? '') ?></b>.
    Alles, was du tust, steht mit beiden Namen im Protokoll.</span>
  <button class="knopf still" type="button" id="knopf-rolle-zurueck">Zurück zu meinem Konto</button>
</div>
<?php endif; ?>

<div class="schale">

<nav class="leiste" id="leiste" aria-label="Hauptmenü">
  <div class="leiste-kopf">
    <a class="marke" href="#/lernen" data-ansicht="lernen">
      <span class="marke-flamme">🔥</span>
      <span class="marke-text">PROMPTHEUS</span>
      <span class="marke-zusatz">Academy</span>
    </a>
  </div>

  <!-- Jeder Punkt trägt ein Zeichen und ein Wort. Das Zeichen bleibt stehen,
       wenn die Leiste schmal gezogen wird — so bleibt das Menü auch bei
       120 Pixeln benutzbar, statt zu Buchstabensalat zu werden.

       **Es sind Links, keine Knöpfe.** Ein Knopf, der eine Ansicht austauscht,
       sieht aus wie Navigation und ist keine: Der Zurück-Knopf des Browsers
       führt aus dem Programm, Neuladen wirft einen an den Anfang, und
       „in neuem Tab öffnen" gibt es nicht. Mit `href="#/…"` erledigt das der
       Browser, und assets/js/route.js macht daraus wieder eine Ansicht. -->
  <div class="leiste-liste" id="menue">
    <a class="menue-knopf" href="#/lernen" data-ansicht="lernen"><span
      class="menue-zeichen" aria-hidden="true">📚</span><span class="menue-wort">Lernen</span></a>
    <a class="menue-knopf" href="#/fortschritt" data-ansicht="fortschritt"><span
      class="menue-zeichen" aria-hidden="true">📈</span><span class="menue-wort">Fortschritt</span></a>
    <?php if ($darfTutor): ?>
      <a class="menue-knopf" href="#/tutor" data-ansicht="tutor"><span
        class="menue-zeichen" aria-hidden="true">💬</span><span class="menue-wort">Tutor</span></a>
    <?php endif; ?>
    <?php if ($tokenicerAn): ?>
      <a class="menue-knopf" href="#/tokenicer" data-ansicht="tokenicer"><span
        class="menue-zeichen" aria-hidden="true">🧮</span><span class="menue-wort">Tokenicer</span></a>
    <?php endif; ?>
    <?php if ($darfKlasse): ?>
      <a class="menue-knopf" href="#/klasse" data-ansicht="klasse"><span
        class="menue-zeichen" aria-hidden="true">🎓</span><span class="menue-wort">Klasse</span></a>
    <?php endif; ?>
    <?php if ($darfCockpit): ?>
      <a class="menue-knopf" href="#/cockpit" data-ansicht="cockpit"><span
        class="menue-zeichen" aria-hidden="true">📊</span><span class="menue-wort">Cockpit</span></a>
    <?php endif; ?>

    <!-- Der siebte Kurs steht abgesetzt am Ende: Er ist keine Ansicht, sondern
         ein Fenster über der Seite — und er ist auch kein Ort, an dem man
         arbeitet, sondern die Auskunft darüber, was am Ende wartet. Eine
         eigene Adresse hat er trotzdem (`#/ziel`), damit er sich verhält wie
         alles andere im Menü: teilbar, neu ladbar, mit Zurück-Knopf. -->
    <a class="menue-knopf menue-geschenk" href="#/ziel" data-ansicht="ziel"><span
      class="menue-zeichen" aria-hidden="true">🎁</span><span class="menue-wort">Der 7. Kurs</span></a>
  </div>

  <!-- Der Fuss: was die Seite aussehen lässt, plus der Ausgang. Die Farbliste
       klappt hier nach OBEN auf — nach unten läge sie jenseits des Randes. -->
  <div class="leiste-fuss">

    <?php if ($variantenAn): ?>
    <!-- Der Farbwähler erscheint nur, wenn die Regel ihn freigibt. Ein Knopf,
         der eine abgeschaltete Möglichkeit anbietet, ist schlimmer als keiner:
         man klickt und nichts geschieht. -->
    <div class="variantenwahl">
      <button class="kopf-symbol" id="knopf-variante" type="button"
              aria-haspopup="listbox" aria-expanded="false"
              title="Farbvariante wählen" aria-label="Farbvariante wählen">🎨</button>
      <div class="variantenliste hidden" id="variantenliste"
           aria-label="Farben und Bilder">

        <p class="wahl-kopf lbl">Fertige Paletten</p>
        <div role="listbox" aria-label="Farbvarianten"><?php
        foreach (pu_varianten_liste() as $v): ?>
        <button class="variante-zeile<?= $v['kennung'] === $variante ? ' aktiv' : '' ?>"
                type="button" role="option"
                aria-selected="<?= $v['kennung'] === $variante ? 'true' : 'false' ?>"
                data-variante="<?= pu_h($v['kennung']) ?>"
                data-grundton="<?= pu_h($v['grundton']) ?>"
                data-partner="<?= pu_h($v['partner']) ?>">
          <span class="variante-probe" aria-hidden="true"
                style="background:<?= pu_h($v['grund']) ?>">
            <i style="background:<?= pu_h($v['glut']) ?>"></i><i
               style="background:<?= pu_h($v['gold']) ?>"></i>
          </span>
          <span class="variante-text">
            <span class="variante-name"><?= pu_h($v['name']) ?>
              <span class="variante-ton" aria-hidden="true"><?=
                $v['grundton'] === 'hell' ? '☀' : '☾' ?></span></span>
            <span class="variante-was"><?= pu_h($v['was']) ?></span>
          </span>
        </button><?php endforeach; ?>
        </div>

        <!-- ============================================== Feineinstellung

             Zwei Regler und drei Farbfelder. Alles darüber hinaus wäre ein
             zweites Einstellungsfenster im Kopf — und dafür gibt es die
             Einstellungsseite.

             Warum hier und nicht dort: „das Bild ist mir zu stark" merkt man,
             während man auf die Seite schaut. Ein Regler, für den man erst die
             Ansicht wechseln muss, wird nicht benutzt. -->
        <details class="fein" id="fein">
          <summary>Feineinstellung</summary>

          <div class="fein-inhalt">
            <label class="regler">
              <span class="regler-kopf">
                <span>Hintergrundbild</span>
                <output class="val" id="aus-bild">100 %</output>
              </span>
              <input type="range" id="reg-bild" min="0" max="100" step="5"
                     value="<?= pu_h($einst['bild_anteil'] ?? '100') ?>">
              <span class="klein regler-was">Der Prometheus hinter der Seite.
                0 % schaltet ihn aus.</span>
            </label>

            <label class="regler">
              <span class="regler-kopf">
                <span>Bilder auf Karten</span>
                <output class="val" id="aus-karten">100 %</output>
              </span>
              <input type="range" id="reg-karten" min="0" max="100" step="5"
                     value="<?= pu_h($einst['karten_anteil'] ?? '100') ?>">
              <span class="klein regler-was">Die Kursbilder. Der Text bleibt in
                jeder Stellung lesbar — schwächer heisst nur ruhiger.</span>
            </label>

            <p class="lbl" style="margin:.9rem 0 .3rem">Akzentfarben</p>
            <div class="farbfelder">
              <label class="farbfeld">
                <input type="color" id="farb-glut"
                       value="<?= pu_h($einst['farbe_glut'] ?: '#ff7a1c') ?>">
                <span><b>Glut</b><br><span class="klein">weiter</span></span>
              </label>
              <label class="farbfeld">
                <input type="color" id="farb-gold"
                       value="<?= pu_h($einst['farbe_gold'] ?: '#ffc94d') ?>">
                <span><b>Gold</b><br><span class="klein">geschafft</span></span>
              </label>
              <label class="farbfeld">
                <input type="color" id="farb-lapis"
                       value="<?= pu_h($einst['farbe_lapis'] ?: '#4e82b6') ?>">
                <span><b>Lapis</b><br><span class="klein">erklärt</span></span>
              </label>
            </div>

            <!-- Hier standen drei Farbfelder für Titel, Untertitel und
                 Beschreibung. Sie sind heraus, und der Grund gehört
                 aufgeschrieben: Eine Schriftfarbe, die im Dunkeln gut aussieht,
                 ist ein helles Grau — nach dem Wechsel auf Pergament oder
                 Marmor stand sie hell auf hell, und der Text war weg. Am
                 spätesten fiel es dort auf, wo es am meisten stört: in
                 Hinweisen und Beschreibungen.
                 Die Schriftstufen kommen jetzt immer aus der Palette; für die
                 ist der Kontrast gerechnet (tests/varianten_test.php). -->

            <p class="klein farb-warnung hidden" id="farb-warnung" role="status"></p>

            <p class="klein" style="color:var(--schrift-3)">
              Die Grundflächen bleiben bei der Palette — wer die frei wählt,
              macht seine Seite irgendwann unlesbar.
            </p>

            <button class="knopf still klein" type="button" id="fein-zurueck">
              Auf die Palette zurücksetzen
            </button>
          </div>
        </details>
      </div>
    </div>
    <?php endif; ?>

    <button class="kopf-symbol" id="knopf-thema" type="button"
            title="Hell oder dunkel" aria-label="Zwischen hell und dunkel wechseln">
      <span class="symbol-sonne" aria-hidden="true">☀</span>
      <span class="symbol-mond"  aria-hidden="true">☾</span>
    </button>

    <button class="kopf-symbol" id="knopf-einstellungen" type="button"
            title="Einstellungen" aria-label="Einstellungen öffnen">⚙</button>

    <button class="menue-knopf schmal" id="knopf-abmelden"
            title="<?= pu_h($wer['anzeigename']) ?> abmelden">Abmelden</button>
  </div>

  <!-- Der Ziehgriff sitzt AUF der Kante, nicht daneben: eine eigene Spalte
       zwischen Menü und Stoff wäre ein Streifen, den man erst trifft, wenn
       man ihn sucht. Doppelklick setzt die Breite zurück. -->
  <div class="griff griff-leiste" id="griff-leiste" role="separator"
       aria-orientation="vertical" tabindex="0"
       title="Ziehen — Doppelklick setzt zurück"
       aria-label="Breite des Menüs ändern"></div>
</nav>

<div class="saeule">
<header class="kopf">
  <button class="kopf-symbol" id="knopf-leiste" type="button"
          aria-controls="leiste" aria-expanded="true"
          title="Menü ein- oder ausklappen" aria-label="Menü ein- oder ausklappen">☰</button>

  <!-- Die Kennzahlen. Serverseitig gesetzt, damit die Leiste beim ersten
       Anblick nicht leer steht; die drei mit `live` schreibt PU.standSetzen()
       nach jeder Abgabe neu. -->
  <div class="kennzahlen" id="kennzahlen">
    <?php foreach ($kennzahlen as $kz): ?>
    <span class="kennzahl ton-<?= pu_h($kz['ton']) ?>" title="<?= pu_h($kz['titel']) ?>">
      <span class="kz-wert" id="kz-<?= pu_h($kz['schluessel']) ?>"><?= pu_h($kz['wert']) ?></span>
      <span class="kz-kurz"><?= pu_h($kz['kurz']) ?></span>
    </span>
    <?php endforeach; ?>
  </div>

  <?php if ($darfTutor): ?>
  <!-- Der Tutor steht oben rechts, nicht unten im Menü. Er ist der Knopf, den
       man mitten in einer Aufgabe drückt — und dann zählt der kurze Weg:
       oben rechts ist er von jeder Stelle der Seite aus zwei Zentimeter
       entfernt, im Menüfuss wäre er ganz unten links. -->
  <div class="kopf-rechts">
    <?php if (pu_ebene() === 'admin'): ?>
    <!-- Die Persona-Vorschau. Nur Ebene 1 sieht sie überhaupt.

         Sie steht hier oben und nicht in den Einstellungen, weil sie beim
         DURCHGEHEN gebraucht wird: Man liest eine Lektion, fragt den Tutor,
         wechselt die Persona und fragt dieselbe Frage noch einmal. Läge der
         Schalter drei Klicks weit weg, verglichen man Erinnerungen statt
         Antworten.

         Das „P" bleibt ein Buchstabe und wird kein Symbol: Es gibt kein
         Piktogramm für „sieh es mit fremden Augen", und ein erfundenes müsste
         man erklären. -->
    <button class="kopf-symbol gross" id="knopf-persona" type="button"
            title="Als andere Person ansehen — für den Vergleich der Dialektik"
            aria-label="Persona wählen" aria-haspopup="true" aria-expanded="false">P</button>
    <?php endif; ?>
    <button class="kopf-symbol gross" id="knopf-glossar" type="button"
            title="Glossar — alle Fachwörter der Academy"
            aria-label="Glossar öffnen">📖</button>
    <button class="kopf-symbol gross" id="knopf-tutor" type="button"
            title="Tutor öffnen — er erscheint rechts neben dem Stoff"
            aria-label="Tutor als Seitenmenü öffnen">💬</button>
  </div>
  <?php endif; ?>
</header>

<main id="haupt">
  <!-- Zurück-Knopf und Brotkrume, über jeder Ansicht. Gefüllt von
       assets/js/route.js: zuerst grob aus der Adresse, damit hier kein Loch
       klafft, während geladen wird — dann von der Ansicht selbst mit den
       richtigen Titeln, sobald sie sie kennt. -->
  <nav class="pfadleiste" id="pfadleiste"></nav>

  <section class="view" id="view-lernen"></section>
  <section class="view hidden" id="view-fortschritt"></section>
  <?php if ($darfTutor): ?>
    <section class="view hidden" id="view-tutor"></section>
  <?php endif; ?>
  <?php if ($tokenicerAn): ?>
    <section class="view hidden" id="view-tokenicer"></section>
  <?php endif; ?>
  <?php if ($darfKlasse): ?>
    <section class="view hidden" id="view-klasse"></section>
  <?php endif; ?>
  <?php if ($darfCockpit): ?>
    <section class="view hidden" id="view-cockpit"></section>
  <?php endif; ?>
</main>

</div><!-- .saeule -->
</div><!-- .schale -->

<div id="melder" class="melder" role="status" aria-live="polite"></div>

<!-- Das Lob-Fenster. Es steht leer im HTML, damit es nichts aufzubauen gibt,
     wenn es gebraucht wird: es soll im selben Moment da sein wie das ✓. -->
<div id="lob" class="lob hidden" role="alertdialog" aria-hidden="true"></div>

<!-- Die Modalseite der Einstellungen. Ein Fenster, zwei Welten: die Reiter
     für alle und die für Tutoren stehen darin nebeneinander — ein zweites
     Zahnrad an anderer Stelle fände niemand. -->
<div id="modal" class="modal hidden" role="dialog" aria-modal="true" aria-hidden="true"></div>

<script>
  window.PU = {
    wer:   <?= json_encode(['id' => (int)$wer['id'], 'name' => $wer['anzeigename'],
                            'kennung' => $wer['kennung'], 'rolle' => $wer['rolle'],
                            'ebene' => pu_ebene($wer),
                            'ebene_anzeige' => PU_EBENEN[pu_ebene($wer)]['anzeige']],
                            JSON_UNESCAPED_UNICODE) ?>,
    // Die Rechte kommen mit der Seite, damit die Oberflaeche nichts anbietet,
    // was hinterher 403 gibt. Sie sind eine Anzeige-Hilfe, keine Sicherung:
    // geprueft wird jede Aktion noch einmal in api.php.
    rechte: <?= json_encode(pu_recht_meine($wer), JSON_UNESCAPED_UNICODE) ?>,
    stufen: <?= json_encode(PU_STUFEN, JSON_UNESCAPED_UNICODE) ?>,
    einst:  <?= json_encode($einst, JSON_UNESCAPED_UNICODE) ?>,
    tutorBereit: <?= pu_tutor_bereit() ? 'true' : 'false' ?>
  };
</script>
<script src="<?= pu_v('assets/js/schale.js') ?>"></script>
<!-- Der Router steht VOR app.js: `PU.wechsel()` ruft ihn, sobald eine Ansicht
     erscheint. Käme er später, wäre der erste Wechsel ohne Adresse. -->
<script src="<?= pu_v('assets/js/route.js') ?>"></script>
<script src="<?= pu_v('assets/js/app.js') ?>"></script>
<script src="<?= pu_v('assets/js/einstellungen.js') ?>"></script>
<script src="<?= pu_v('assets/js/medien.js') ?>"></script>
<script src="<?= pu_v('assets/js/aufgabe.js') ?>"></script>
<script src="<?= pu_v('assets/js/lernen.js') ?>"></script>
<!-- Die Zielseite hängt an der Zielkarte, und die steht in `lernen.js` wie in
     `fortschritt.js`. Deshalb dazwischen: `zielbilder.js` legt nur Zeichnungen
     ab, `ziel.js` baut daraus das Fenster. -->
<script src="<?= pu_v('assets/js/zielbilder.js') ?>"></script>
<script src="<?= pu_v('assets/js/ziel.js') ?>"></script>
<script src="<?= pu_v('assets/js/fortschritt.js') ?>"></script>
<script src="<?= pu_v('assets/js/kursstand.js') ?>"></script>
<?php if ($darfTutor): ?>
  <script src="<?= pu_v('assets/js/tutor.js') ?>"></script>
  <script src="<?= pu_v('assets/js/tutorpanel.js') ?>"></script>
<?php endif; ?>
<?php if ($tokenicerAn): ?>
  <script src="<?= pu_v('assets/js/tokenicer.js') ?>"></script>
<?php endif; ?>
<?php if ($darfKlasse): ?>
  <script src="<?= pu_v('assets/js/klasse.js') ?>"></script>
<?php endif; ?>
<?php if ($darfCockpit): ?>
  <script src="<?= pu_v('assets/js/abo.js') ?>"></script>
<?php endif; ?>
<?php if ($variantenAn): ?>
  <script src="<?= pu_v('assets/js/varianten.js') ?>"></script>
<?php endif; ?>
<!-- Zuletzt: er beobachtet, was die anderen zeichnen, und packt freistehende
     Texte in eine Fläche. Vor ihnen geladen hätte er nichts zu tun. -->
<script src="<?= pu_v('assets/js/glossar.js') ?>"></script>
<script src="<?= pu_v('assets/js/textkarten.js') ?>"></script>
<?php if (pu_ebene() === 'admin'): ?>
<!-- Nur für Ebene 1: Ohne den Knopf im Kopf hätte die Datei nichts zu tun. -->
<script src="<?= pu_v('assets/js/persona.js') ?>"></script>
<?php endif; ?>
<script>PU.start(); if (PU.personaStart) PU.personaStart();</script>
<?php endif; ?>

</body>
</html>
