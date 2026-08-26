<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — die Schale: Kennzahlen der Kopfzeile und das Gerüst darum.
 *
 * Geprüft wird zweierlei:
 *
 *   1. **Was oben steht.** `pu_kennzahlen()` gibt je Ebene andere Zahlen aus.
 *      Eine Schülerin darf dort nicht sehen, wie viele Abos offen sind — und
 *      eine Lehrkraft soll ihre Klasse sehen, nicht die ganze Academy.
 *   2. **Dass das Gerüst zusammenpasst.** Die Leiste, ihre Ziehgriffe und die
 *      drei Breiten-Variablen sind über drei Dateien verteilt: Markup, Stil,
 *      Skript. Ein umbenannter Bezeichner fällt beim Betrachten nicht auf —
 *      die Leiste klappt dann einfach nicht mehr zu, und niemand merkt es,
 *      bis jemand darauf klickt.
 *
 * Aufruf:
 *     php -d extension=pdo_sqlite -d extension=sqlite3 tests/schale_test.php
 */

require_once __DIR__ . '/hilfe.php';
test_db_vorbereiten();

require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../srv/rechte.php';
require_once __DIR__ . '/../srv/lernende.php';
require_once __DIR__ . '/../srv/profil.php';
require_once __DIR__ . '/../srv/abo.php';
require_once __DIR__ . '/../srv/kennzahlen.php';

/** Das Konto so, wie `pu_wer()` es liefert. */
function konto(int $id): array
{
    $st = pu_db()->prepare('SELECT * FROM lernende WHERE id = ?');
    $st->execute([$id]);
    return $st->fetch();
}

/** Die Schlüssel der Kennzahlen in ihrer Reihenfolge. */
function schluessel(array $wer): array
{
    return array_column(pu_kennzahlen($wer), 'schluessel');
}

// ================================================================ Kurzzahl
gruppe('Grosse Zahlen kurz');

gleich('Null bleibt Null',            '0',       pu_kurzzahl(0));
gleich('Dreistellig unverändert',     '947',     pu_kurzzahl(947));
gleich('Tausender mit Punkt',         '9.999',   pu_kurzzahl(9999));
gleich('Ab zehntausend in k',         '12,5k',   pu_kurzzahl(12500));
gleich('Sechsstellig ohne Komma',     '150k',    pu_kurzzahl(150000));
gleich('Ab einer Million in Mio',     '2,4 Mio', pu_kurzzahl(2400000));

// Ein Verbrauch kann durch ein Storno rechnerisch negativ werden. Dann muss
// dort ein Minus stehen und keine falsche Zahl.
gleich('Negatives behält das Zeichen', '−1.200', pu_kurzzahl(-1200));

// ================================================================ Konten
gruppe('Die Konten für die Prüfung');

$admin  = pu_lernenden_anlegen('chefin',  'Chefin',  'probe1234');           // erstes = admin
$lehrer = pu_lernenden_anlegen('kramer',  'Kramer',  'probe1234', 'lehrer', '6a');
$nele   = pu_lernenden_anlegen('nele',    'Nele',    'probe1234', 'schueler', '6a');
$tom    = pu_lernenden_anlegen('tom',     'Tom',     'probe1234', 'schueler', '6a');
$fremd  = pu_lernenden_anlegen('lisa',    'Lisa',    'probe1234', 'schueler', '9c');
$mutter = pu_lernenden_anlegen('mutter',  'Mutter',  'probe1234', 'eltern',   '6a');

gleich('Das erste Konto ist Admin', 'admin', (string)konto($admin)['rolle']);

// ================================================================ Je Ebene
gruppe('Was eine Ebene oben sieht');

$sSchueler = schluessel(konto($nele));
$sEltern   = schluessel(konto($mutter));
$sLehrer   = schluessel(konto($lehrer));
$sAdmin    = schluessel(konto($admin));

gleich('Schüler sehen nur den eigenen Stand',
       ['punkte', 'titel', 'serie'], $sSchueler);
gleich('Eltern ebenso',
       ['punkte', 'titel', 'serie'], $sEltern);

pruefe('Lehrkräfte sehen zusätzlich die Klasse',
       in_array('lernende', $sLehrer, true) && in_array('heute', $sLehrer, true),
       implode(' · ', $sLehrer));

// **Das ist die eigentliche Zusage dieser Trennung.** Eine Lehrkraft ist keine
// Verwaltung: was die Academy an Abos einnimmt, geht sie nichts an.
pruefe('…aber keine Abo-Zahlen',
       !in_array('abos_offen', $sLehrer, true) &&
       !in_array('token_monat', $sLehrer, true),
       implode(' · ', $sLehrer));

pruefe('Der Admin sieht beides',
       in_array('lernende', $sAdmin, true) && in_array('abos_offen', $sAdmin, true) &&
       in_array('token_monat', $sAdmin, true),
       implode(' · ', $sAdmin));

pruefe('Der eigene Stand steht überall vorn',
       array_slice($sAdmin, 0, 3) === ['punkte', 'titel', 'serie'],
       implode(' · ', $sAdmin));

// ================================================================ Umfang
gruppe('Wie weit der Blick reicht');

$uLehrer = pu_kennzahl_umfang(konto($lehrer));
$uAdmin  = pu_kennzahl_umfang(konto($admin));

gleich('Die Lehrkraft zählt ihre Gruppe', '6a',      $uLehrer['wort']);
gleich('Der Admin zählt über alle',       'Academy', $uAdmin['wort']);

$zahlen = [];
foreach (pu_kennzahlen(konto($lehrer)) as $k) $zahlen[$k['schluessel']] = $k['wert'];

// Sechs Konten gibt es, aber nur vier in der 6a: Kramer, Nele, Tom, Mutter.
// Lisa (9c) und die Chefin (ohne Gruppe) dürfen nicht mitgezählt werden.
gleich('Nur die eigene Gruppe wird gezählt', '4', $zahlen['lernende']);

$zahlen = [];
foreach (pu_kennzahlen(konto($admin)) as $k) $zahlen[$k['schluessel']] = $k['wert'];
gleich('Der Admin zählt alle sechs', '6', $zahlen['lernende']);

// Eine Lehrkraft ohne eigene Gruppe zählt über alle. Eine Null, die nur an
// einem leeren Feld liegt, wäre eine falsche Auskunft.
$ohne = pu_lernenden_anlegen('vertretung', 'Vertretung', 'probe1234', 'lehrer');
gleich('Lehrkraft ohne Gruppe zählt über alle',
       'Academy', pu_kennzahl_umfang(konto($ohne))['wort']);

// ================================================================ Form
gruppe('Die Form jeder Kennzahl');

$erlaubt = ['normal', 'gold', 'glut', 'lapis', 'gut', 'warn'];
$alle    = pu_kennzahlen(konto($admin));

foreach ($alle as $k) {
    pruefe('„' . $k['schluessel'] . '" ist vollständig',
           isset($k['wert'], $k['kurz'], $k['titel'], $k['ton'], $k['live']) &&
           $k['kurz'] !== '' && $k['titel'] !== '',
           kurz($k));
    pruefe('„' . $k['schluessel'] . '" hat einen bekannten Ton',
           in_array($k['ton'], $erlaubt, true), $k['ton']);
}

// Für jeden Ton muss es eine Stilregel geben, sonst steht die Zahl in der
// Erbfarbe und die Unterscheidung, für die der Ton da ist, fällt aus.
$css = (string)file_get_contents(PU_ROOT . '/assets/css/promptheus.css');
foreach ($erlaubt as $ton) {
    pruefe("Der Ton „$ton\" hat eine Stilregel",
           str_contains($css, '.kennzahl.ton-' . $ton));
}

// ================================================================ Gerüst
gruppe('Das Gerüst hält zusammen');

$html   = (string)file_get_contents(PU_ROOT . '/index.php');
$schale = (string)file_get_contents(PU_ROOT . '/assets/js/schale.js');
$app    = (string)file_get_contents(PU_ROOT . '/assets/js/app.js');

foreach (['leiste', 'griff-leiste', 'knopf-leiste', 'kennzahlen'] as $id) {
    pruefe("Das Markup hat id=\"$id\"", str_contains($html, 'id="' . $id . '"'));
}
foreach (['leiste', 'griff-leiste', 'knopf-leiste'] as $id) {
    pruefe("schale.js greift auf „$id\" zu", str_contains($schale, "'" . $id . "'"));
}

// Die drei Breiten: schale.js schreibt sie, das Stylesheet muss sie kennen.
// Sonst zieht der Griff eine Variable, die niemand liest.
foreach (['--leiste-breite', '--panel-breite', '--spalte-breite'] as $token) {
    pruefe("schale.js kennt $token",  str_contains($schale, $token));
    pruefe("Das Stylesheet nutzt $token", substr_count($css, $token) >= 2);
}

// Die drei fortlaufenden Kennzahlen schreibt PU.standSetzen() nach jeder
// Abgabe fort. Wer eine vierte auf `live` setzt, ohne app.js anzufassen,
// bekommt eine Zahl, die bis zum Neuladen falsch stehen bleibt.
foreach ($alle as $k) {
    if (!$k['live']) continue;
    pruefe('app.js schreibt „' . $k['schluessel'] . '" fort',
           str_contains($app, "'kz-" . $k['schluessel'] . "'"));
}

gleich('Genau drei Kennzahlen laufen mit', 3,
       count(array_filter($alle, fn($k) => $k['live'])));

// ================================================================ Kästen
gruppe('Der Einzug in den Kästen');

// **Zweimal falsch gebaut, deshalb hier festgenagelt.** Erst wurden einzelne
// Kinder eingerückt (p, ul, ol) — dann klebte der nächste Kasten wieder am
// Rand, weil sein Inhalt nicht in der Liste stand. Dann rückte `> *` alles
// ein — aber ein `<button>` mit `width: auto` schrumpft auf seinen Inhalt,
// auch mit `display: block`. Die Tutorzeile sah nur richtig aus, solange ihr
// Text zufällig lang genug war.
//
// Richtig ist: Der Abstand sitzt am Kasten, die Kinder brauchen nichts, und
// was volle Breite will, zieht sich mit negativem Rand heraus.
pruefe('Der Kasten trägt den Innenabstand selbst',
       (bool)preg_match('/\.medien-kasten \{[^}]*padding:\s*0 \.9rem \.9rem/s', $css));
pruefe('Die Überschrift zieht sich auf volle Breite',
       (bool)preg_match('/\.medien-kasten > h4 \{[^}]*margin:\s*0 -\.9rem/s', $css));
pruefe('Kein Einzug mehr an den Kindern',
       !str_contains($css, '.medien-kasten > * { margin-left'));

bilanz();
