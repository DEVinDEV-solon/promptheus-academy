<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — „Wie weit bin ich?" (srv/kursstand.php).
 *
 * Diese Zahlen stehen dem Lernenden neben dem Stoff und sagen ihm, wie weit
 * er ist und worin er gut war. Sie dürfen nicht schmeicheln und nicht
 * verrutschen — deshalb werden hier nicht nur Summen geprüft, sondern die
 * Regeln dahinter:
 *
 *   · „stark" heisst *erster* Versuch, ohne Hinweis, ohne Musterlösung
 *   · eine einzelne Aufgabe ergibt noch keine Stärke
 *   · „zuletzt" ist der jüngste Versuch, auch wenn zwei dieselbe Sekunde tragen
 *   · der nächste Schritt ist genau einer, nie eine Auswahl
 *
 * Absolute Aufgabenzahlen stehen bewusst NICHT im Test: der Stoff wächst,
 * und ein Test, der bei jeder neuen Lektion rot wird, wird abgeschaltet.
 *
 * Aufruf:
 *     php -d extension=pdo_sqlite -d extension=sqlite3 tests/kursstand_test.php
 */

require_once __DIR__ . '/hilfe.php';
test_db_vorbereiten();

require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../srv/rechte.php';
require_once __DIR__ . '/../srv/lernende.php';
require_once __DIR__ . '/../srv/kurse.php';
require_once __DIR__ . '/../srv/punkte.php';
require_once __DIR__ . '/../srv/kursstand.php';

const KURS = '10_Stufen/01_Entdecker';

$ich = pu_lernenden_anlegen('probant', 'Probant', 'probe1234', 'schueler');
$k   = pu_kurs(KURS);

pruefe('Der Probekurs ist da', $k !== null);
pruefe('…und hat mehrere Lektionen', count($k['lektionen']) >= 3);

/** Trägt einen Versuch ein. */
function versuch(int $wer, array $a, bool $richtig, int $hinweise = 0, bool $loesung = false): void
{
    pu_versuch_eintragen(
        $wer, $a, 'probe',
        ['richtig' => $richtig, 'anteil' => $richtig ? 1.0 : 0.0,
         'begruendung' => '', 'max' => (int)$a['punkte']],
        ['punkte' => $richtig ? (int)$a['punkte'] : 0, 'max' => (int)$a['punkte'], 'tempobonus' => 0],
        $hinweise, $loesung, 30
    );
}

$lek1 = $k['lektionen'][0];
$lek2 = $k['lektionen'][1];

// ================================================================ Leerer Stand
gruppe('Vor dem ersten Versuch');

$s = pu_kurs_stand($ich, KURS);
gleich('nichts gelöst',            0,     $s['geloest']);
gleich('null Prozent',             0,     $s['prozent']);
gleich('keine Stärke behauptet',   0,     count($s['stark']));
gleich('nichts zuletzt gemacht',   null,  $s['zuletzt']);
pruefe('alle Aufgaben sind offen', $s['offene_ges'] === $s['aufgaben_ges']);
gleich('der nächste Schritt ist eine Lektion', 'lektion', $s['naechster_schritt']['art']);
gleich('…und zwar die erste',      1,     $s['naechster_schritt']['nr']);
gleich('sie gilt als nicht angefangen', false, $s['naechster_schritt']['angefangen']);

// ================================================================ Erste Lektion
gruppe('Die erste Lektion ganz lösen');

foreach ($lek1['aufgaben'] as $a) versuch($ich, $a, true);

$s = pu_kurs_stand($ich, KURS);
gleich('so viele gelöst wie Aufgaben in Lektion 1', count($lek1['aufgaben']), $s['geloest']);
gleich('Lektion 1 ist fertig',      true,  $s['lektionen'][0]['fertig']);
gleich('Lektion 2 noch nicht',      false, $s['lektionen'][1]['fertig']);
gleich('der nächste Schritt ist Lektion 2', 2, $s['naechster_schritt']['nr']);
pruefe('Punkte sind angekommen', $s['punkte'] > 0);
pruefe('mehr möglich als geholt', $s['punkte_moeglich'] > $s['punkte']);

gleich('zuletzt war es Lektion 1', 1, $s['zuletzt']['nr']);

// ================================================================ Stärken
gruppe('„Stark" ist keine Höflichkeit');

// Alle Aufgaben der ersten Lektion waren im ersten Versuch richtig und ohne
// Hilfe — die Sorten mit mindestens zwei Aufgaben müssen als Stärke auftauchen.
$typen = [];
foreach ($lek1['aufgaben'] as $a) $typen[$a['typ']] = ($typen[$a['typ']] ?? 0) + 1;
$mitZwei = array_keys(array_filter($typen, fn($n) => $n >= 2));

foreach ($mitZwei as $t) {
    $treffer = array_filter($s['stark'], fn($x) => $x['typ'] === $t);
    pruefe("Sorte $t gilt als Stärke", count($treffer) === 1);
    foreach ($treffer as $x) gleich("…und zwar zu 100 %", 100, $x['prozent']);
}

foreach ($s['stark'] as $x) {
    pruefe('keine Stärke aus einer einzigen Aufgabe: ' . $x['typ'], $x['gesamt'] >= 2);
}

// ================================================================ Mit Hilfe gelöst
gruppe('Mit Hinweis gelöst ist gelöst, aber nicht stark');

$a2 = $lek2['aufgaben'][0];
versuch($ich, $a2, true, 2);                 // richtig, aber mit zwei Hinweisen

$s = pu_kurs_stand($ich, KURS);
pruefe('die Aufgabe zählt als gelöst',
       $s['lektionen'][1]['geloest'] === 1);

$typ2 = (string)$a2['typ'];
$eintrag = array_values(array_filter($s['stark'], fn($x) => $x['typ'] === $typ2));
if ($eintrag !== []) {
    pruefe("Sorte $typ2 zählt den Hinweis-Treffer nicht als sauber",
           $eintrag[0]['sauber'] < $eintrag[0]['gesamt'],
           $eintrag[0]['sauber'] . ' von ' . $eintrag[0]['gesamt']);
}

// ================================================================ Zweiter Anlauf
gruppe('Erst falsch, dann richtig');

$a3 = $lek2['aufgaben'][1] ?? null;
if ($a3 !== null) {
    versuch($ich, $a3, false);
    $s = pu_kurs_stand($ich, KURS);

    $offen = array_values(array_filter($s['offene'], fn($o) => $o['id'] === $a3['id']));
    pruefe('die Aufgabe steht noch offen', count($offen) === 1);
    if ($offen !== []) {
        gleich('…aber als angefangen', true, $offen[0]['versucht']);
    }

    versuch($ich, $a3, true);
    $s = pu_kurs_stand($ich, KURS);
    pruefe('nach dem zweiten Anlauf ist sie gelöst',
           count(array_filter($s['offene'], fn($o) => $o['id'] === $a3['id'])) === 0);

    $eintrag = array_values(array_filter($s['stark'], fn($x) => $x['typ'] === (string)$a3['typ']));
    if ($eintrag !== []) {
        pruefe('der erste, falsche Versuch bleibt in der Stärke-Rechnung stehen',
               $eintrag[0]['sauber'] < $eintrag[0]['gesamt']);
    }

    gleich('zuletzt war es jetzt Lektion 2', 2, $s['zuletzt']['nr']);
}

// ================================================================ Grenzen
gruppe('Grenzen und Randfälle');

pruefe('höchstens sechs offene Aufgaben in der Vorschau', count($s['offene']) <= 6);
pruefe('…aber die Gesamtzahl bleibt vollständig', $s['offene_ges'] >= count($s['offene']));
pruefe('höchstens drei Stärken', count($s['stark']) <= 3);

$sortiert = $s['stark'];
usort($sortiert, fn($a, $b) => [$b['prozent'], $b['gesamt']] <=> [$a['prozent'], $a['gesamt']]);
gleich('die stärkste Sorte steht vorn', $sortiert, $s['stark']);

wirft('ein erfundener Kurs wird abgewiesen',
      fn() => pu_kurs_stand($ich, 'gibt/es/nicht'), 'gibt es nicht');

// Ein zweiter Lernender darf vom ersten nichts sehen. Das ist keine
// Feinheit: die Karte steht neben dem Stoff und würde sonst fremde
// Lernstände anzeigen.
gruppe('Jeder sieht nur sich');

$andere = pu_lernenden_anlegen('zweite', 'Zweite', 'probe1234', 'schueler');
$s2 = pu_kurs_stand($andere, KURS);
gleich('der zweite Lernende hat nichts gelöst', 0, $s2['geloest']);
gleich('…und keine Stärken',                    0, count($s2['stark']));
pruefe('während der erste weiterhin seine hat', pu_kurs_stand($ich, KURS)['geloest'] > 0);

bilanz();
