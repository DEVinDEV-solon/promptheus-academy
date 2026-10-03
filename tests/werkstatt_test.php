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

// ================================================================ Erster Start
gruppe('Erster Start');

@mkdir($tmp . '/data', 0700, true);
pruefe('ohne Markierung: der erste Start', pu_werkstatt_erster_start());
pruefe('danach nicht mehr', !pu_werkstatt_erster_start());

// ================================================================ Schutzliste
gruppe('Schutzliste (Namen als Fingerabdrücke)');

pu_lernenden_anlegen('beispielkonto', 'Mia Beispielkind', 'probe1234', 'schueler');
$n = pu_werkstatt_schutzliste();
$liste = json_decode((string)file_get_contents($tmp . '/data/schutz-namen.json'), true);
pruefe('Liste geschrieben', $n >= 2 && count($liste['hashes'] ?? []) === $n);
pruefe('kein Name im Klartext', !str_contains(json_encode($liste), 'beispiel') && !str_contains(json_encode($liste), 'Mia'));
gleich('längste Wortfolge', 2, $liste['laengste']);
// Node rechnet dieselben Fingerabdrücke: der Name verschwindet aus einem Text.
$maske = str_replace('\\', '/', realpath(__DIR__ . '/../werkstatt/werkzeuge/schutz/maske.mjs'));
$js = 'import("file:///' . $maske . '").then(m => { const n = m.namenLaden(process.argv[1]);'
    . ' console.log(m.maskeBauen({ namen: n }).text("Ich bin Mia Beispielkind. Kennung: beispielkonto")) })';
$h = proc_open(['node', '-e', $js, $tmp . '/data/schutz-namen.json'], [1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $rohr);
$aus = trim((string)stream_get_contents($rohr[1]));
fclose($rohr[1]); fclose($rohr[2]); proc_close($h);
gleich('Node maskiert die Namen aus der Liste', 'Ich bin [PERSON]. Kennung: [PERSON]', $aus);

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

// ================================================================ Zur Werkstatt
gruppe('Adresse für „Zur Werkstatt“');

// Ein erfundenes Token: Die Prüfung gilt der Form, nicht dem Wert.
$probe = 'http://127.0.0.1:' . PU_WERKSTATT_PORT . '/?token=pu-test-' . bin2hex(random_bytes(8));
$apfad = pu_werkstatt_adresse_pfad();
gleich('liegt neben dem Ticket', dirname(pu_werkstatt_ticket_pfad()), dirname($apfad));
$ablegen = function (array $j) use ($apfad): void { file_put_contents($apfad, json_encode($j)); };

@unlink($apfad);
gleich('Werkstatt aus: keine Adresse', ['adresse' => null, 'grund' => 'aus'], pu_werkstatt_adresse($chef, false));
gleich('läuft, aber noch keine Datei', 'fehlt', pu_werkstatt_adresse($chef, true)['grund']);
$ablegen(['adresse' => $probe, 'lernender' => $chef, 'port' => PU_WERKSTATT_PORT]);
gleich('eigenes Konto: Adresse', ['adresse' => $probe, 'grund' => 'ok'], pu_werkstatt_adresse($chef, true));
gleich('anderes Konto: nichts', ['adresse' => null, 'grund' => 'fremd'], pu_werkstatt_adresse($schueler, true));
gleich('läuft nicht mehr: nichts, auch mit Datei', 'aus', pu_werkstatt_adresse($chef, false)['grund']);
$ablegen(['adresse' => $probe, 'lernender' => null]);
gleich('Start ohne Ticket gehört niemandem', 'fremd', pu_werkstatt_adresse($chef, true)['grund']);
$ablegen(['adresse' => $probe, 'lernender' => (string)$chef]);
gleich('Konto als Text zählt nicht', 'fremd', pu_werkstatt_adresse($chef, true)['grund']);
foreach (['http://127.0.0.1:3082/?token=x', 'http://localhost:' . PU_WERKSTATT_PORT . '/?token=x',
          'http://boese.example:' . PU_WERKSTATT_PORT . '/', 'javascript:alert(1)',
          $probe . ' x', $probe . "\n", 'http://127.0.0.1:' . PU_WERKSTATT_PORT . '/' . str_repeat('a', 2100)] as $falsch) {
    $ablegen(['adresse' => $falsch, 'lernender' => $chef]);
    gleich('falsche Form abgelehnt: ' . addcslashes(substr($falsch, 0, 40), "\r\n"), 'ungueltig', pu_werkstatt_adresse($chef, true)['grund']);
}
file_put_contents($apfad, '{kein json');
gleich('kaputte Datei: ungültig', 'ungueltig', pu_werkstatt_adresse($chef, true)['grund']);

// Dieselbe Datei, wie starten.mjs sie schreibt (werkzeuge/adresse.mjs).
@unlink($apfad);
$modul = 'file:///' . str_replace('\\', '/', realpath(__DIR__ . '/../werkstatt/werkzeuge/adresse.mjs'));
$js = 'const m = await import(process.argv[1]);'
    . 'const a = m.adresseAusZeile("dsh web: " + process.argv[2], ' . PU_WERKSTATT_PORT . ');'
    . 'm.adresseSchreiben(a, { lernender: Number(process.argv[3]), port: ' . PU_WERKSTATT_PORT . ' }, process.argv[4]);';
$h = proc_open(['node', '--input-type=module', '-e', $js, $modul, $probe, (string)$chef, $apfad],
    [1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $rohr);
if (is_resource($h)) {
    stream_get_contents($rohr[1]); $fehlerText = stream_get_contents($rohr[2]);
    fclose($rohr[1]); fclose($rohr[2]);
    $rc = proc_close($h);
    if ($rc === 0) {
        gleich('Node schreibt, PHP liest: dieselbe Adresse', ['adresse' => $probe, 'grund' => 'ok'], pu_werkstatt_adresse($chef, true));
    } else {
        pruefe('Node schreibt die Datei', false, trim((string)$fehlerText));
    }
} else {
    pruefe('node nicht gefunden — Gegenprobe übersprungen', true);
}
@unlink($apfad);

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
