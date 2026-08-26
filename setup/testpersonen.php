<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — fünf Testpersonen, eine je Ebene.
 *
 * Zum Ausprobieren der fünf Zugangsebenen: einmal aufrufen, danach kann man
 * sich als Admin, Schulleitung, Lehrerin, Vater und Schülerin anmelden und
 * sehen, was jede Ebene sieht — und wie unterschiedlich dieselbe Frage
 * beantwortet wird.
 *
 * **Die Zugangsdaten sind absichtlich trivial** (`test1` … `test5`, Kennwort
 * jeweils `test1234`). Das ist für einen Rechner unter 127.0.0.1 in Ordnung
 * und für alles andere nicht. Wer die Academy ins Netz stellt, löscht diese fünf
 * Konten zuerst — dafür gibt es `--weg`.
 *
 * Aufruf:
 *     php -d extension=pdo_sqlite -d extension=sqlite3 setup/testpersonen.php
 *     …                                                setup/testpersonen.php --weg
 *
 * Der Aufruf ist **wiederholbar**: bestehende Testkonten werden aktualisiert,
 * nicht verdoppelt. Andere Konten fasst das Skript nie an.
 */

require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../srv/db.php';
require_once __DIR__ . '/../srv/rechte.php';
require_once __DIR__ . '/../srv/lernende.php';
require_once __DIR__ . '/../srv/profil.php';

const PU_TEST_KENNWORT = 'test1234';

/**
 * Die fünf.
 *
 * Die Namen sind erfunden, aber nicht beliebig: jede Person hat einen Grund,
 * hier zu sein, und dieser Grund steht in `notiz`. Genau der geht an die
 * Tutoren und macht aus derselben Frage eine andere Antwort.
 */
const PU_TESTPERSONEN = [
    [
        'kennung' => 'test1', 'name' => 'Testperson 1', 'ebene' => 'admin',
        'pseudonym' => 'Daidalos', 'alter' => 0, 'gruppe' => '',
        'schule' => 'PROMPTHEUS (Betrieb)',
        'notiz'  => 'Betreibt die Academy technisch. Richtet Konten ein, pflegt den '
                  . 'Lehrstoff und beantwortet Rückfragen der Schulen.',
    ],
    [
        'kennung' => 'test2', 'name' => 'Testperson 2', 'ebene' => 'verwaltung',
        'pseudonym' => 'Frau Söll', 'alter' => 54, 'gruppe' => '',
        'schule' => 'Gesamtschule Am Hangweg',
        'notiz'  => 'Schulleiterin. Muss dem Elternbeirat erklären, warum eine KI-Academy '
                  . 'an der Schule steht, und dem Kollegium, wer sie pflegt. Wenig Zeit, '
                  . 'braucht Formulierungen zum Weitergeben.',
    ],
    [
        'kennung' => 'test3', 'name' => 'Testperson 3', 'ebene' => 'lehrer',
        'pseudonym' => 'Herr Kramer', 'alter' => 38, 'gruppe' => '6a',
        'schule' => 'Gesamtschule Am Hangweg',
        'notiz'  => 'Unterrichtet Mathe und Informatik, Klassenlehrer der 6a. Hat KI '
                  . 'selbst erst angefangen zu lernen. Braucht Einstiege, typische '
                  . 'Fehlvorstellungen und Differenzierung für 45 Minuten.',
    ],
    [
        'kennung' => 'test4', 'name' => 'Testperson 4', 'ebene' => 'eltern',
        'pseudonym' => 'Herr Baumann', 'alter' => 44, 'gruppe' => '',
        'schule' => 'Gesamtschule Am Hangweg',
        'notiz'  => 'Vater von Testperson 5. Arbeitet im Handwerk, hat mit KI wenig zu '
                  . 'tun und ist eher besorgt. Will beim Abendessen mitreden können, '
                  . 'ohne die Hausaufgaben zu machen.',
        'kind'   => 'test5',
    ],
    [
        'kennung' => 'test5', 'name' => 'Testperson 5', 'ebene' => 'schueler',
        'pseudonym' => 'Nele', 'alter' => 11, 'gruppe' => '6a',
        'schule' => 'Gesamtschule Am Hangweg',
        'notiz'  => 'Elf Jahre, Klasse 6a. Zockt viel, hat schon Bilder mit KI gemacht, '
                  . 'aber noch nie darüber nachgedacht, wie das funktioniert. Wird '
                  . 'ungeduldig, wenn Erklärungen lang werden.',
    ],
];

// ---------------------------------------------------------------- Aufräumen
if (in_array('--weg', $argv, true)) {
    $pdo = pu_db();
    $weg = 0;
    foreach (PU_TESTPERSONEN as $p) {
        $st = $pdo->prepare('SELECT id FROM lernende WHERE kennung = ?');
        $st->execute([$p['kennung']]);
        $id = $st->fetchColumn();
        if ($id === false) continue;

        // Der letzte Admin darf nicht verschwinden — sonst kommt niemand mehr
        // an die Rechte-Matrix. Dieselbe Regel wie in api.php.
        if ($p['ebene'] === 'admin') {
            $andere = (int)$pdo->query(
                "SELECT COUNT(*) FROM lernende WHERE rolle = 'admin' AND kennung <> 'test1'"
            )->fetchColumn();
            if ($andere === 0) {
                echo "  ! test1 bleibt: es wäre der letzte Admin.\n";
                continue;
            }
        }

        $st = $pdo->prepare('DELETE FROM lernende WHERE id = ?');
        $st->execute([(int)$id]);
        $weg++;
    }
    echo "$weg Testkonten entfernt.\n";
    exit(0);
}

// ---------------------------------------------------------------- Anlegen
$pdo = pu_db();
$ids = [];

foreach (PU_TESTPERSONEN as $p) {
    $st = $pdo->prepare('SELECT id FROM lernende WHERE kennung = ?');
    $st->execute([$p['kennung']]);
    $id = $st->fetchColumn();

    if ($id === false) {
        // Ist die Academy noch leer, wird das erste Konto ohnehin Admin — die
        // Reihenfolge oben sorgt dafür, dass das test1 ist.
        $id = pu_lernenden_anlegen($p['kennung'], $p['name'], PU_TEST_KENNWORT,
                                   $p['ebene'], $p['gruppe']);
        $wie = 'angelegt';
    } else {
        $id = (int)$id;
        $st = $pdo->prepare('UPDATE lernende SET anzeigename = ?, rolle = ?, gruppe = ? WHERE id = ?');
        $st->execute([$p['name'], $p['ebene'], $p['gruppe'], $id]);
        pu_kennwort_setzen($id, PU_TEST_KENNWORT, $id);
        $wie = 'aufgefrischt';
    }

    pu_profil_setzen($id, 'pseudonym',   $p['pseudonym']);
    pu_profil_setzen($id, 'lebensalter', (string)$p['alter']);
    pu_profil_setzen($id, 'schule',      $p['schule']);
    pu_profil_setzen($id, 'notiz',       $p['notiz']);

    $ids[$p['kennung']] = $id;
    printf("  %-6s %-12s %-11s %s\n", $p['kennung'], $p['pseudonym'], $p['ebene'], $wie);
}

// Eltern → Kind. Erst jetzt, wenn alle Konten stehen.
foreach (PU_TESTPERSONEN as $p) {
    if (!isset($p['kind'])) continue;
    pu_profil_kind_setzen($ids[$p['kennung']], $ids[$p['kind']] ?? 0);
    echo "  test4 ist mit " . $p['kind'] . " verknüpft (sieht nur dieses Kind).\n";
}

echo "\nAnmelden mit Kennung + Kennwort '" . PU_TEST_KENNWORT . "'.\n";
echo "Wieder entfernen: php setup/testpersonen.php --weg\n";
