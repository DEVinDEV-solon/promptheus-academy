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
require_once __DIR__ . '/../srv/pruefung.php';

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
        // Der Weg: erst die sechs Stufen, dann der 7. Kurs. Wer die Aufgaben
        // des 7. Kurses löst, ohne die Stufen zu haben, bekommt nichts.
        $andrer = pu_lernenden_anlegen('abkuerzer', 'Abkürzer', 'probe1234', 'schueler');
        $voll = pu_db()->prepare(
            "INSERT INTO versuche (lernender, aufgabe_id, punkte, max_punkte, richtig, zeitpunkt, tag)
             VALUES (?, ?, 10, 10, 1, datetime('now'), date('now'))");
        foreach ($ids as $id) $voll->execute([$andrer, $id]);
        gleich('7. Kurs gelöst, Stufen offen: gesperrt', 'stufen_offen', pu_werkstatt_stand($andrer)['grund']);
        pruefe('…und der Kurs selbst ist zu', !pu_kurs_frei($andrer, $kurs));

        gleich('ohne Stufen gesperrt', 'stufen_offen', pu_werkstatt_stand($schueler)['grund']);
        $pr = pu_db()->prepare(
            "INSERT INTO pruefungen (lernender, stufe, punkte, max_punkte, bestanden, zeitpunkt)
             VALUES (?, ?, 100, 100, 1, datetime('now'))");
        foreach (array_keys(PU_STUFEN) as $nr) {
            if ((int)$nr < 6) $pr->execute([$schueler, (int)$nr]);
        }
        gleich('fünf Stufen reichen nicht', 'stufen_offen', pu_werkstatt_stand($schueler)['grund']);
        $pr->execute([$schueler, 6]);
        pruefe('sechs Stufen: der 7. Kurs ist offen', pu_kurs_frei($schueler, $kurs));
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

// ================================================================ Testbetrieb
gruppe('Testbetrieb: 7. Kurs als fertig markieren');

$probe = pu_lernenden_anlegen('testling', 'Testling', 'probe1234', 'schueler');
$fehler = static function (callable $f): string {
    try { $f(); return ''; } catch (DomainException $e) { return $e->getMessage(); }
};
pruefe('ohne Testbetrieb: abgelehnt',
       $fehler(fn() => pu_kurs7_test_setzen($probe, true, $chef)) !== '');
pu_setting_setzen('urkunden_testbetrieb', '1');
pruefe('ohne Stufen: abgelehnt, auch im Test',
       $fehler(fn() => pu_kurs7_test_setzen($probe, true, $chef)) !== '');
$pr = pu_db()->prepare(
    "INSERT INTO pruefungen (lernender, stufe, punkte, max_punkte, bestanden, zeitpunkt, test)
     VALUES (?, ?, 100, 100, 1, datetime('now'), 1)");
foreach (array_keys(PU_STUFEN) as $nr) $pr->execute([$probe, (int)$nr]);
pruefe('Stufen da, Kurs offen: gesperrt', !pu_werkstatt_stand($probe)['frei']);
gleich('markieren geht jetzt', '', $fehler(fn() => pu_kurs7_test_setzen($probe, true, $chef)));
pruefe('markiert: frei', pu_werkstatt_stand($probe)['frei']);
gleich('…und zwar als Test', 'test', pu_werkstatt_stand($probe)['grund']);
gleich('nur dieses Konto', [$probe], pu_kurs7_test_konten());
pu_setting_setzen('urkunden_testbetrieb', '0');
pruefe('Testbetrieb aus: wieder gesperrt', !pu_werkstatt_stand($probe)['frei']);
pu_setting_setzen('urkunden_testbetrieb', '1');
pu_kurs7_test_setzen($probe, false, $chef);
pruefe('zurückgenommen: gesperrt', !pu_werkstatt_stand($probe)['frei']);
gleich('Liste leer', [], pu_kurs7_test_konten());
pu_setting_setzen('urkunden_testbetrieb', '0');

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
pruefe('ohne Adresse keine Academy im Ticket', !isset($t2['academy']));

// Der Knopf „Community“ der Werkstatt führt zurück in diese Academy.
gleich('Ticket trägt die Adresse der Academy', 'http://127.0.0.1:8802',
       pu_werkstatt_ticket($chef, 'http://127.0.0.1:8802')['academy'] ?? null);
gleich('… auch localhost', 'http://localhost:8801', pu_werkstatt_ticket($chef, 'http://localhost:8801')['academy'] ?? null);
foreach (['http://boese.example:8801', 'http://127.0.0.1:8801/pfad', 'https://127.0.0.1:8801',
          "http://127.0.0.1:8801\r\nX: 1", "http://127.0.0.1:8801\n", 'http://127.0.0.1'] as $fremd) {
    pruefe('keine fremde Adresse: ' . addcslashes($fremd, "\r\n"), !isset(pu_werkstatt_ticket($chef, $fremd)['academy']));
}

// ================================================================ Neu starten
gruppe('Werkstatt beenden (für den Neustart)');

exec('where node 2>NUL', $wo, $rc);
if (PHP_OS_FAMILY !== 'Windows' || $rc !== 0) {
    gleich('ausserhalb von Windows: nicht unterstützt', PHP_OS_FAMILY === 'Windows' ? 'ohne node' : 'nicht_windows',
           PHP_OS_FAMILY === 'Windows' ? 'ohne node' : (pu_werkstatt_beenden(39999)['grund'] ?? ''));
} else {
    $node = trim((string)$wo[0]);
    $port = random_int(39000, 39900);
    // Ein Schein-Starter wie werkzeuge/starten.mjs: startet einen Dienst, der
    // sich wie der Harness ausweist (--profile promptheus), und wartet.
    $lausch = "require('http').createServer(()=>{}).listen(Number(process.argv.at(-1)),'127.0.0.1')";
    file_put_contents($tmp . '/starten.mjs', "import { spawn } from 'node:child_process'\n"
        . "const k = spawn(process.execPath, ['-e', " . json_encode($lausch) . ", '--', '--profile', 'promptheus', '--port', '$port'], { stdio: 'ignore' })\n"
        . "k.on('exit', () => process.exit(0))\n");
    $starter = proc_open([$node, $tmp . '/starten.mjs'], [], $rohr);
    $fremdPort = $port + 1;
    $fremd = proc_open([$node, '-e', $lausch, '--', (string)$fremdPort], [], $rohr2);
    $da = static function (int $p): bool {
        for ($i = 0; $i < 40; $i++) {
            $s = @fsockopen('127.0.0.1', $p, $n, $t, 0.2);
            if ($s !== false) { fclose($s); return true; }
            usleep(100000);
        }
        return false;
    };
    pruefe('Schein-Werkstatt lauscht', $da($port));
    pruefe('fremder Dienst lauscht', $da($fremdPort));

    gleich('fremder Dienst auf dem Port: nicht anfassen', 'fremd', pu_werkstatt_beenden($fremdPort, 2)['grund'] ?? null);
    pruefe('… läuft weiter', proc_get_status($fremd)['running']);

    $r = pu_werkstatt_beenden($port);
    pruefe('Werkstatt beendet', ($r['ok'] ?? false) && ($r['beendet'] ?? false), kurz($r));
    pruefe('… Port frei', @fsockopen('127.0.0.1', $port, $n, $t, 0.3) === false);
    usleep(300000);
    pruefe('… und der Starter mit ihr', !proc_get_status($starter)['running']);
    gleich('nichts mehr da: ok, nichts beendet', ['ok' => true, 'beendet' => false], pu_werkstatt_beenden($port));

    proc_terminate($fremd);
    proc_close($fremd);
    proc_close($starter);
}

bilanz();
