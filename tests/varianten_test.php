<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Prüfungen für die Farbvarianten.
 *
 * Der Kern ist die Kontrastprüfung. Eine Palette lässt sich in zwei Minuten
 * hinschreiben und sieht auf dem eigenen Bildschirm gut aus; ob ein Kind mit
 * schwacher Sehkraft den Hinweistext darauf lesen kann, sieht man nicht,
 * sondern rechnet man aus.
 *
 * Deshalb steht hier eine Zahl und keine Meinung: **4,5:1** ist die
 * AA-Schwelle der WCAG für Fliesstext. Jede Farbe, die auf einer Fläche
 * Text trägt, muss darüber liegen — in jeder der sechs Varianten.
 *
 * Beim Schreiben dieses Tests fielen vier Paletten durch, darunter die
 * Vorgabe: `--schrift-3` lag bei 4,0. Das war kein neuer Fehler, sondern ein
 * alter, den vorher niemand gemessen hatte.
 */

require_once __DIR__ . '/hilfe.php';
test_db_vorbereiten();

require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../srv/varianten.php';

gruppe('Kontrast der Paletten');

/** Die Paare, die wirklich aufeinandertreffen. */
const PU_TEST_PAARE = [
    ['schrift',   'grund',   'Haupttext auf dem Grund'],
    ['schrift',   'grund-2', 'Haupttext auf einer Karte'],
    ['schrift-2', 'grund',   'Zweittext auf dem Grund'],
    ['schrift-2', 'grund-2', 'Zweittext auf einer Karte'],
    ['schrift-3', 'grund',   'Hinweistext auf dem Grund'],
    ['schrift-3', 'grund-2', 'Hinweistext auf einer Karte'],
    ['glut',      'grund',   'Links und Akzente'],
    ['gold',      'grund-2', 'Punkte und Erfolg'],
    ['lapis',     'grund',   'Wissenskästen'],
];

foreach (PU_VARIANTEN as $kennung => $v) {
    foreach (PU_TEST_PAARE as [$vorn, $hinten, $wofuer]) {
        $k = pu_kontrast($v['farben'][$vorn], $v['farben'][$hinten]);
        pruefe(sprintf('%s: %s — %.1f:1', $kennung, $wofuer, $k), $k >= 4.5);
    }
}

gruppe('Kleine Schrift braucht mehr');

// Hinweise und Beschreibungen stehen in 0,86 rem — rund 13,8 Pixel. Für so
// kleinen Text ist die AA-Schwelle von 4,5:1 zu knapp; darüber kam die
// Rückmeldung „grau ist manchmal ganz schlecht zu lesen", und sie war
// berechtigt: alle sechs Paletten lagen bei 4,6:1.
//
// Deshalb gilt für `--schrift-3` die AAA-Schwelle von **7:1**, gegen beide
// Flächen, auf denen sie vorkommt.
foreach (PU_VARIANTEN as $kennung => $v) {
    $k = min(pu_kontrast($v['farben']['schrift-3'], $v['farben']['grund']),
             pu_kontrast($v['farben']['schrift-3'], $v['farben']['grund-2']));
    pruefe(sprintf('%s: Beschreibung erreicht AAA — %.1f:1', $kennung, $k), $k >= 7.0);
}

gruppe('Jede Palette hat einen Partner');

// Hell und dunkel ist keine zweite Einstellung neben der Palette: eine Palette
// IST das eine oder das andere. Der ☀/☾-Knopf wechselt deshalb zur
// Partnerpalette — fehlt die, tut er nichts, und das merkt niemand, bevor er
// klickt.
foreach (PU_VARIANTEN as $kennung => $v) {
    $p = $v['partner'] ?? '';
    pruefe($kennung . ': Partner ist eingetragen', $p !== '');
    pruefe($kennung . ': Partner „' . $p . '" gibt es', isset(PU_VARIANTEN[$p]));
    pruefe($kennung . ': Partner steht auf der anderen Seite',
           isset(PU_VARIANTEN[$p]) && PU_VARIANTEN[$p]['grundton'] !== $v['grundton'],
           isset(PU_VARIANTEN[$p]) ? $v['grundton'] . ' → ' . PU_VARIANTEN[$p]['grundton'] : '');
}

// Zweimal klicken muss zurückführen, sonst wandert man beim Umschalten durch
// die Paletten, statt zwischen zweien zu wechseln.
foreach (PU_VARIANTEN as $kennung => $v) {
    $hin    = $v['partner'];
    $zurück = PU_VARIANTEN[$hin]['partner'] ?? '';
    pruefe($kennung . ': zweimal umschalten führt auf dieselbe Seite zurück',
           PU_VARIANTEN[$zurück]['grundton'] === $v['grundton'],
           $kennung . ' → ' . $hin . ' → ' . $zurück);
}

gruppe('Aufbau der Paletten');

// Fehlt einer Palette ein Feld, fällt sie im Betrieb auf den Wert der vorigen
// zurück — und niemand sieht, warum plötzlich ein Kasten falsch aussieht.
$pflicht = array_keys(PU_VARIANTEN[PU_VARIANTE_VORGABE]['farben']);
foreach (PU_VARIANTEN as $kennung => $v) {
    $fehlt = array_diff($pflicht, array_keys($v['farben']));
    pruefe($kennung . ': alle Farbfelder da', $fehlt === [],
           $fehlt ? 'fehlt: ' . implode(', ', $fehlt) : '');
    pruefe($kennung . ': Grundton ist hell oder dunkel',
           in_array($v['grundton'], ['hell', 'dunkel'], true));
    pruefe($kennung . ': hat einen Namen und eine Erklärung',
           $v['name'] !== '' && $v['was'] !== '');
}

pruefe('Die Vorgabe gibt es wirklich', isset(PU_VARIANTEN[PU_VARIANTE_VORGABE]));

gruppe('Die Einstellung kennt genau diese Varianten');

// Zwei Listen, die auseinanderlaufen können: die Paletten hier und die
// erlaubten Werte in `PU_EINST_PERSON`. Läuft die Einstellung der Palette
// davon, lässt sich eine Variante wählen, die es nicht gibt — oder eine
// vorhandene nicht.
require_once __DIR__ . '/../srv/einstellungen.php';
$erlaubt  = PU_EINST_PERSON['variante']['werte'];
$vorhanden = array_keys(PU_VARIANTEN);
sort($erlaubt); sort($vorhanden);
gleich('Einstellung und Palettenliste sind deckungsgleich', $vorhanden, $erlaubt);

gruppe('Erzeugtes CSS');

$css = pu_varianten_css();
foreach (PU_VARIANTEN as $kennung => $v) {
    pruefe($kennung . ': hat einen eigenen Block',
           strpos($css, 'html[data-variante="' . $kennung . '"]') !== false);
}
pruefe('Jede Palette bringt ihren Kartenschleier mit',
       substr_count($css, '--karte-schleier:') === count(PU_VARIANTEN));
pruefe('Kein rohes Hex in den abgeleiteten Werten',
       strpos($css, '--schein: rgb(#') === false);

gruppe('Feineinstellung');

// Der Wert geht in ein `style`-Attribut. Wäre die Wache lückenhaft, liesse
// sich dort fremdes CSS unterbringen — deshalb steht hier nicht nur, dass
// gültige Werte durchkommen, sondern vor allem, dass ungültige es nicht tun.
gleich('nichts eingestellt', '', pu_feinstil([]));
gleich('Vorgabe 100 erzeugt keine Zeile', '',
       pu_feinstil(['bild_anteil' => '100', 'karten_anteil' => '100']));
gleich('Bildanteil',  '--bild-faktor:0.40',   pu_feinstil(['bild_anteil' => '40']));
gleich('Kartenanteil','--karten-faktor:0.25', pu_feinstil(['karten_anteil' => '25']));
gleich('beide',       '--bild-faktor:0.40;--karten-faktor:0.25',
       pu_feinstil(['bild_anteil' => '40', 'karten_anteil' => '25']));
gleich('null bleibt null', '--bild-faktor:0.00', pu_feinstil(['bild_anteil' => '0']));
gleich('Farbe',       '--glut:#00ff88', pu_feinstil(['farbe_glut' => '#00FF88']));
gleich('alle drei Akzente', '--glut:#111111;--gold:#222222;--lapis:#333333',
       pu_feinstil(['farbe_glut' => '#111111', 'farbe_gold' => '#222222',
                    'farbe_lapis' => '#333333']));

// Die Schriftstufen sind NICHT mehr einstellbar, und das ist die Prüfung, die
// dafür sorgt, dass sie es nicht wieder werden. Eine im Dunkeln gewählte
// Schriftfarbe stand nach dem Wechsel auf Pergament oder Marmor hell auf hell —
// unlesbar, und am spätesten bemerkt in Hinweisen und Beschreibungen.
gleich('Titel wird nicht mehr gesetzt',        '', pu_feinstil(['farbe_titel' => '#ffffff']));
gleich('Untertitel wird nicht mehr gesetzt',   '', pu_feinstil(['farbe_unter' => '#dddddd']));
gleich('Beschreibung wird nicht mehr gesetzt', '', pu_feinstil(['farbe_text'  => '#cccccc']));
gleich('und auch nicht zusammen mit den Akzenten',
       '--glut:#111111;--gold:#222222;--lapis:#333333',
       pu_feinstil(['farbe_glut' => '#111111', 'farbe_gold'  => '#222222',
                    'farbe_lapis'=> '#333333', 'farbe_titel' => '#444444',
                    'farbe_unter'=> '#555555', 'farbe_text'  => '#666666']));

// Die Zuordnung Feld → Token darf nicht auseinanderlaufen: die Oberfläche
// baut ihre Farbfelder aus derselben Liste.
gleich('drei Farbfelder', 3, count(PU_EIGENE_FARBEN));
foreach (PU_EIGENE_FARBEN as $feld => $token) {
    pruefe('Einstellung farbe_' . $feld . ' gibt es',
           isset(PU_EINST_PERSON['farbe_' . $feld]));
}

// Die Angriffe, die eine schwache Wache durchliesse.
foreach ([
    'CSS angehängt'  => 'red;background:url(x)',
    'Klammer zu'     => '#fff}html{display:none',
    'zu kurz'        => '#fff',
    'kein Hex'       => 'zzzzzz',
    'Ausdruck'       => 'expression(alert(1))',
    'Kommentar'      => '#fff*/;color:red;/*',
] as $was => $wert) {
    pruefe('abgewiesen: ' . $was, pu_feinstil(['farbe_glut' => $wert]) === '');
}

// Randständige Leerzeichen sind kein Angriff, sondern Tippfehler — sie werden
// abgeschnitten, nicht abgelehnt. Dasselbe tut `pu_einst_pruefen()` beim
// Speichern, sonst wären es zwei verschiedene Meinungen über denselben Wert.
gleich('Leerzeichen werden abgeschnitten', '--glut:#ff7a1c',
       pu_feinstil(['farbe_glut' => '  #ff7a1c  ']));

// Ausserhalb des Bereichs wird geklemmt, nicht abgelehnt: ein Regler kann
// nichts anderes senden, aber die Schnittstelle steht offen.
gleich('über 100 wird geklemmt', '1.00', pu_anteil(500));
gleich('unter 0 wird geklemmt',  '0.00', pu_anteil(-40));
gleich('Punkt, kein Komma',      '0.35', pu_anteil(35));

// Die Einstellung muss dieselben Grenzen kennen wie der Regler im Kopf.
gleich('Bildanteil 0 bis 100',  [0, 100], PU_EINST_PERSON['bild_anteil']['zahl']);
gleich('Kartenanteil 0 bis 100',[0, 100], PU_EINST_PERSON['karten_anteil']['zahl']);
foreach (array_keys(PU_EIGENE_FARBEN) as $kurz) {
    $f = 'farbe_' . $kurz;
    pruefe($f . ' erlaubt nur Hex oder leer',
           preg_match(PU_EINST_PERSON[$f]['text'], '#ff7a1c') === 1
        && preg_match(PU_EINST_PERSON[$f]['text'], '') === 1
        && preg_match(PU_EINST_PERSON[$f]['text'], 'red') === 0);
}

gruppe('pu_hex_rgb');

gleich('Glut',    '255 122 28', pu_hex_rgb('#ff7a1c'));
gleich('ohne #',  '255 122 28', pu_hex_rgb('ff7a1c'));
gleich('Schwarz', '0 0 0',      pu_hex_rgb('#000000'));

gruppe('pu_kontrast');

// Die zwei Fälle, bei denen jede Rechnung stimmen muss.
$w = pu_kontrast('#ffffff', '#000000');
pruefe('Weiss auf Schwarz ist 21:1', abs($w - 21.0) < 0.01, sprintf('%.2f', $w));
$g = pu_kontrast('#808080', '#808080');
pruefe('Gleiche Farbe ist 1:1', abs($g - 1.0) < 0.01, sprintf('%.2f', $g));
pruefe('Die Reihenfolge ist egal',
       abs(pu_kontrast('#ffffff', '#333333') - pu_kontrast('#333333', '#ffffff')) < 0.001);

// ================================================== Flächen folgen der Palette
gruppe('Kopf, Leiste und Karten folgen der Palette');

// **Der Fehler, den diese Prüfung verhindert.** Im hellen Zweig standen
// Pergaments Zahlen fest eingetragen. Solange Pergament die einzige helle
// Palette war, fiel das nicht auf; Marmor ist kühl, bekam aber denselben
// cremefarbenen Schleier über Grund, Karten, Kopf und Leiste — eine kühle
// Palette mit warmem Überzug. Jede Fläche muss aus der Palette kommen, sonst
// stimmt eine Variante mit sich selbst nicht überein.
$css = pu_varianten_css();

foreach (PU_VARIANTEN as $kennung => $v) {
    if (!preg_match('/html\[data-variante="' . $kennung . '"\] \{(.*?)
\}/s', $css, $m)) {
        pruefe("Palette $kennung steht im Stylesheet", false);
        continue;
    }
    $block = $m[1];

    // Die Kartenfläche: im Hellen die hellere Grundstufe, im Dunklen die
    // hellere Abstufung — beide Male grund-2 bzw. grund-3 der Palette selbst.
    $flaeche = $v['grundton'] === 'hell' ? 'grund-2' : 'grund-3';
    $erwartet = pu_hex_rgb($v['farben'][$flaeche]);
    pruefe("$kennung: --karte-schleier kommt aus $flaeche",
           str_contains($block, '--karte-schleier: ' . $erwartet . ';'), $erwartet);

    // Der Schleier über dem Hintergrundbild: immer der Grund der Palette.
    $erwartetGrund = pu_hex_rgb($v['farben']['grund']);
    pruefe("$kennung: --bild-schleier kommt aus grund",
           str_contains($block, '--bild-schleier: ' . $erwartetGrund . ';'), $erwartetGrund);

    // Die Glasfläche ebenso.
    pruefe("$kennung: --glas kommt aus $flaeche",
           str_contains($block, '--glas: rgb(' . $erwartet . ' /'), $erwartet);

    // Jede Palette bringt eine Farbe für Fachbegriffe mit.
    pruefe("$kennung: --begriff wird gesetzt", str_contains($block, '--begriff:'));
}

gruppe('Fachbegriffe bleiben lesbar');

// Ein Fachbegriff steht mitten im Fliesstext. Für ihn gilt darum der Massstab
// für gewöhnliche Schrift und nicht der für Auszeichnungen: AAA sind 7:1.
//
// Gerechnet wird gegen die Palette selbst und mit der Farbe, die wirklich im
// erzeugten CSS steht — nicht gegen einen Sollwert, den der Test noch einmal
// hinschreibt. Sonst prüft er seine eigene Kopie. Eine neue Palette mit zu
// blassem Gold fällt hier auf und nicht erst dem Lernenden.
foreach (PU_VARIANTEN as $kennung => $v) {
    if (!preg_match('/html\[data-variante="' . $kennung . '"\] \{(.*?)
\}/s', $css, $m)) continue;

    if (!preg_match('/--begriff:\s*(#[0-9a-fA-F]{6}|var\(--gold\));/', $m[1], $f)) {
        pruefe("$kennung: --begriff ist eine Farbe", false, $m[1]);
        continue;
    }
    // Auf dunklem Grund verweist die Palette auf ihr eigenes Gold.
    $farbe = $f[1] === 'var(--gold)' ? $v['farben']['gold'] : $f[1];

    foreach (['grund', $v['grundton'] === 'hell' ? 'grund-2' : 'grund-3'] as $hinter) {
        $k = pu_kontrast($farbe, $v['farben'][$hinter]);
        pruefe(sprintf('%s: Begriff auf %s — %.1f:1', $kennung, $hinter, $k), $k >= 7.0);
    }
}

// Und keine Regel darf die Fläche des Kopfes hinter dem Rücken der Palette
// festlegen — genau daran hing der Kopf in Marmor fest auf warmem Weiss.
$stil = (string)file_get_contents(PU_ROOT . '/assets/css/promptheus.css');
pruefe('Keine feste Kopffarbe im Hell-Zweig',
       !preg_match('/data-thema-effektiv="hell"\]\s*\.kopf\s*\{/', $stil));

// Ohne eingeschaltete Varianten gilt der feste Wert aus promptheus.css. Er muss
// dieselbe Hürde nehmen — sonst wäre ausgerechnet die Werksdarstellung die
// schlechteste, und die sieht jeder zuerst.
pruefe('Der Hell-Zweig setzt einen eigenen Begriffs-Ton',
       preg_match('/data-thema-effektiv="hell"\]\s*\{.*?--begriff:\s*(#[0-9a-fA-F]{6})/s',
                  $stil, $hb) === 1);
if (isset($hb[1])) {
    $k = pu_kontrast($hb[1], '#f7f3ec');
    pruefe(sprintf('…und der erreicht AAA — %.1f:1', $k), $k >= 7.0);
}
pruefe('Der Begriff traegt Farbe, nicht nur eine Linie',
       !preg_match('/\.begriff\s*\{[^}]*color:\s*inherit/s', $stil));
pruefe('Kopf und Leiste teilen sich eine Fläche',
       substr_count($stil, 'rgb(var(--karte-schleier) / .92)') >= 2);

// ================================================================ Knopfschrift
//
// Der Hauptknopf trägt seinen Text auf einem VERLAUF, und ein Verlauf hat zwei
// Enden. Gemessen werden muss das schwächere — sonst besteht ein Knopf die
// Prüfung, dessen obere zwei Drittel zu blass sind. Genau das war der Fall:
// Weiss auf `--glut-hell` ergab in Pergament 3,18:1.
//
// 4,5:1 und nicht 7:1, weil Knopfschrift fett ist und nicht in 0,86 rem steht.
gruppe('Der Hauptknopf trägt seine Schrift');

foreach (['schmiede', 'pergament', 'olymp', 'marmor', 'terrakotta', 'funkenflug'] as $kennung) {
    $v = pu_variante($kennung);
    if ($v === null) { pruefe("Palette $kennung fehlt", false); continue; }

    $f = $v['farben'];
    // Hell: weisse Schrift auf glut → glut-tief. Dunkel: Grundfarbe auf
    // glut-hell → glut. Beides steht so in promptheus.css.
    [$text, $enden] = $v['grundton'] === 'hell'
        ? ['#ffffff',   [$f['glut'],      $f['glut-tief']]]
        : [$f['grund'], [$f['glut-hell'], $f['glut']]];

    foreach ($enden as $ende) {
        $k = pu_kontrast($text, $ende);
        pruefe(sprintf('%s: Knopfschrift auf %s — %.2f:1', $kennung, $ende, $k), $k >= 4.5);
    }
}

// Und die Regel, die den hellen Verlauf umdreht, muss auch dastehen. Ohne sie
// rechnet der Test etwas nach, was das Stylesheet gar nicht tut.
pruefe('Der Hell-Zweig dreht den Knopfverlauf in die Tiefe',
       preg_match('/data-thema-effektiv="hell"\]\s*\.knopf:not\(\.still\)\s*\{[^}]*'
                  . 'linear-gradient\(180deg,\s*var\(--glut\),\s*var\(--glut-tief\)\)/s', $stil) === 1);

// ================================================================ Codeflächen
//
// Sie lagen als feste Werte im Regelwerk und blieben deshalb auch im Hellen
// fast schwarz — mit `--schrift` darauf, die im Hellen ebenfalls fast schwarz
// ist. Wer eine helle Palette wählte, sah in jeder Lektion mit Code eine
// schwarze Fläche mit schwarzer Schrift.
gruppe('Codeflächen folgen der Palette');

foreach (['#0f0d0b', '#1d1916', '#171310'] as $alt) {
    pruefe("$alt steht nur noch in der Token-Vorgabe",
           substr_count($stil, $alt) === 1, (string)substr_count($stil, $alt));
}
pruefe('Der Hell-Zweig gibt --code-grund einen eigenen Wert',
       preg_match('/data-thema-effektiv="hell"\]\s*\{.*?--code-grund:/s', $stil) === 1);

bilanz();
