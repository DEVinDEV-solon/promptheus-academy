<?php
declare(strict_types=1);
/**
 * Die Werkstatt: gesperrt bis Kurs 7, Admins sofort, Ticket nur für Freie.
 *
 * Geprüft wird vor allem, was NICHT gehen darf: frei vor 100 %, frei durch
 * einen falschen Versuch, ein Ticket, das länger als zwei Minuten gilt.
 *
 * Aufruf:
 *     php -d extension=pdo_sqlite -d extension=sqlite3 tests/werkstatt_test.php
 */

require_once __DIR__ . '/hilfe.php';
test_db_vorbereiten();

$tmp = sys_get_temp_dir() . '/pu_werkstatt_' . bin2hex(random_bytes(4));
mkdir($tmp . '/ws', 0700, true);
putenv('PU_TEST_WERKSTATT=' . $tmp . '/ws');
putenv('PU_TEST_WERKSTATT_TICKET=' . $tmp . '/data/ticket.json');

require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../srv/db.php';
require_once __DIR__ . '/../srv/einstellungen.php';
require_once __DIR__ . '/../srv/lernende.php';
require_once __DIR__ . '/../srv/werkstatt.php';

$chef     = pu_lernenden_anlegen('chef', 'Chef', 'probe1234', 'admin');
$schueler = pu_lernenden_anlegen('probant', 'Probant', 'probe1234', 'schueler');

// ================================================================ Einrichtung
gruppe('Einrichtung');

pruefe('leerer Ordner: nicht eingerichtet', !pu_werkstatt_eingerichtet());
@mkdir($tmp . '/ws/deepseek-harness/apps/cli/src', 0700, true);
file_put_contents($tmp . '/ws/deepseek-harness/apps/cli/src/bin.ts', '');
pruefe('nur der Harness: noch nicht eingerichtet', !pu_werkstatt_eingerichtet());
@mkdir($tmp . '/ws/deepseek-harness/node_modules', 0700, true);
pruefe('ohne Profil: noch nicht eingerichtet', !pu_werkstatt_eingerichtet());
@mkdir($tmp . '/ws/.dsh/profiles/promptheus', 0700, true);
file_put_contents($tmp . '/ws/.dsh/profiles/promptheus/package.json', '{}');
pruefe('Harness, Abhängigkeiten, Profil: eingerichtet', pu_werkstatt_eingerichtet());

// ================================================================ Freigabe
gruppe('Freigabe');

pruefe('der Admin darf sofort', pu_werkstatt_stand($chef)['frei']);
gleich('und zwar als Betreiber', 'betreiber', pu_werkstatt_stand($chef)['grund']);
pruefe('der Stand meldet die Einrichtung', pu_werkstatt_stand($chef)['eingerichtet']);

// Unabhängig vom Coder-Schalter: Der steht ab Werk auf aus.
pruefe('Coder-Schalter aus hält die Werkstatt nicht zu', pu_regel('coder_an') !== 'an');

$kurs = pu_coder_kurs();
pruefe('der 7. Kurs liegt im Vault', $kurs !== null);

if ($kurs !== null) {
    $ids = [];
    foreach ($kurs['lektionen'] as $l) foreach ($l['aufgaben'] as $a) $ids[] = (string)$a['id'];

    if ($ids === []) {
        gleich('ein leerer Kurs schaltet nichts frei', 'kurs_leer', pu_werkstatt_stand($schueler)['grund']);
    } else {
        gleich('vor dem Kurs gesperrt', 'kurs_offen', pu_werkstatt_stand($schueler)['grund']);

        $st = pu_db()->prepare(
            "INSERT INTO versuche (lernender, aufgabe_id, punkte, max_punkte, richtig, zeitpunkt, tag)
             VALUES (?, ?, 10, 10, 1, datetime('now'), date('now'))");
        foreach (array_slice($ids, 0, -1) as $id) $st->execute([$schueler, $id]);
        pruefe('eine Aufgabe fehlt: gesperrt', !pu_werkstatt_stand($schueler)['frei']);

        pu_db()->prepare(
            "INSERT INTO versuche (lernender, aufgabe_id, punkte, max_punkte, richtig, zeitpunkt, tag)
             VALUES (?, ?, 0, 10, 0, datetime('now'), date('now'))")
            ->execute([$schueler, end($ids)]);
        pruefe('ein falscher Versuch schaltet nicht frei', !pu_werkstatt_stand($schueler)['frei']);

        $st->execute([$schueler, end($ids)]);
        pruefe('alle gelöst: frei', pu_werkstatt_stand($schueler)['frei']);
        gleich('frei durch den Kurs', 'kurs', pu_werkstatt_stand($schueler)['grund']);
        gleich('100 %', 100, pu_werkstatt_stand($schueler)['prozent']);
    }
}

// ================================================================ Ticket
gruppe('Ticket');

$t = pu_werkstatt_ticket($chef);
$datei = json_decode((string)file_get_contents(pu_werkstatt_ticket_pfad()), true);
pruefe('Ticket liegt als Datei', is_array($datei));
gleich('die Datei trägt dieselbe Nonce', $t['nonce'], $datei['nonce'] ?? null);
pruefe('Nonce: 32 Hexzeichen', (bool)preg_match('/^[0-9a-f]{32}$/', $t['nonce']));
pruefe('gilt höchstens zwei Minuten', $t['ablauf'] <= time() + 120 && $t['ablauf'] > time());
$t2 = pu_werkstatt_ticket($chef);
pruefe('jedes Ticket ist neu', $t2['nonce'] !== $t['nonce']);
pruefe('keine Reste vom atomaren Schreiben', glob(dirname(pu_werkstatt_ticket_pfad()) . '/*.tmp') === []);

bilanz();
