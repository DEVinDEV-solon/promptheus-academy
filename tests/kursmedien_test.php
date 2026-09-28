<?php
declare(strict_types=1);
/**
 * Kursmedien vom eigenen Server (srv/kursmedien.php, Entscheid 28.09.2026).
 *
 * Die Zusagen:
 *   · nur unter medien/, nur Medien-Endungen — sonst wird das ganze Paket abgewiesen
 *   · stimmt eine Prüfsumme nicht, wird nichts eingespielt
 *   · was im vorigen Paket stand und im neuen fehlt, geht; eigene Aufnahmen bleiben
 *   · das Angebot kommt nur aus dem unterschriebenen Feed und nur, wenn es neuer ist
 *   · Laden: Grösse und Prüfsumme des Downloads müssen zum Feed passen
 */
require_once __DIR__ . '/hilfe.php';

$tmp = sys_get_temp_dir() . '/pu_med_' . bin2hex(random_bytes(6));
@mkdir($tmp . '/akt', 0775, true);
@mkdir($tmp . '/wurzel/medien/eigene', 0775, true);
file_put_contents($tmp . '/test.env', "# leer\n");
putenv('PU_TEST_DB=' . $tmp . '/academy.db');
putenv('PU_TEST_ENV=' . $tmp . '/test.env');
putenv('PU_TEST_AKT=' . $tmp . '/akt');
register_shutdown_function(static function () use ($tmp) {
    $weg = static function (string $p) use (&$weg): void {
        if (is_dir($p) && !is_link($p)) {
            foreach (scandir($p) ?: [] as $e) {
                if ($e !== '.' && $e !== '..') $weg("$p/$e");
            }
            @rmdir($p);
        } else {
            @unlink($p);
        }
    };
    $weg($tmp);
});
if (!class_exists('ZipArchive')) {
    echo "\nzip fehlt — Aufruf mit  -d extension=zip\n";
    exit(2);
}

require_once __DIR__ . '/../srv/kursmedien.php';

$w = $tmp . '/wurzel';

/** Ein Kursmedien-Paket; `$verderben` darf Manifest oder Inhalte ändern. */
function medienpaket(string $ziel, string $stand, array $dateien, ?callable $verderben = null): string
{
    $m = ['paket' => 1, 'art' => 'medien', 'fassung' => $stand, 'mindestens' => '0.0.0', 'dateien' => []];
    foreach ($dateien as $p => $inhalt) $m['dateien'][$p] = hash('sha256', $inhalt);
    if ($verderben) $verderben($m, $dateien);
    @unlink($ziel);
    $z = new ZipArchive();
    $z->open($ziel, ZipArchive::CREATE);
    $z->addFromString('manifest.json', json_encode($m, JSON_UNESCAPED_SLASHES));
    foreach ($dateien as $p => $inhalt) $z->addFromString($p, $inhalt);
    $z->close();
    return $ziel;
}

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Welche Pfade ins Paket dürfen');
pruefe('Ton unter medien/', pu_med_pfad_ok('medien/10_Stufen/01_Entdecker/kurs/entdecker/1-entdecker.wav'));
pruefe('Song mit Leerzeichen', pu_med_pfad_ok('medien/10_Stufen/01_Entdecker/kurs/entdecker/DIE 5 VON DER PROMPTHEUS ACADEMY.mp3'));
pruefe('Video unter medien/', pu_med_pfad_ok('medien/10_Stufen/01_Entdecker/kurs/video.mp4'));
pruefe('nicht ausserhalb von medien/', !pu_med_pfad_ok('index.php') && !pu_med_pfad_ok('assets/x.mp3'));
pruefe('kein PHP unter medien/', !pu_med_pfad_ok('medien/x.php'));
pruefe('keine Rohdatei', !pu_med_pfad_ok('medien/a/1-entdecker.pcm16'));
pruefe('keine Zwischenkopie', !pu_med_pfad_ok('medien/a/DIE 5.mp3.tmp.mp3'));
pruefe('kein ..', !pu_med_pfad_ok('medien/../index.php') && !pu_med_pfad_ok('medien/a/../../x.mp3'));
pruefe('kein Texteintrag', !pu_med_pfad_ok('medien/a/titel.md'));

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Das Angebot aus dem Feed');
$sha = str_repeat('a', 64);
gleich('ohne medien im Feed: keins', null, pu_med_angebot(['feed' => 1, 'fassungen' => []]));
$ang = pu_med_angebot(['medien' => ['stand' => '1.0.0', 'sha256' => $sha, 'groesse' => 1234, 'dateien' => 7]]);
gleich('mit medien: Stand', '1.0.0', $ang['stand'] ?? null);
gleich('… und Grösse', 1234, $ang['groesse'] ?? null);
gleich('falsche Prüfsumme: keins', null, pu_med_angebot(['medien' => ['stand' => '1.0.0', 'sha256' => 'xyz', 'groesse' => 1]]));
gleich('falscher Stand: keins', null, pu_med_angebot(['medien' => ['stand' => '1.0', 'sha256' => $sha, 'groesse' => 1]]));

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Einspielen');
$a1 = "RIFF-eins"; $a2 = "ID3-song"; $a3 = "ID3-drei";
file_put_contents($w . '/medien/eigene/meins.mp3', 'selbst aufgenommen');
$r = pu_med_einspielen(medienpaket($tmp . '/m1.zip', '1.0.0', [
    'medien/kurs/1-teil.wav' => $a1, 'medien/kurs/2_Song.mp3' => $a2]), $w, '1.0.0');
pruefe('Stand 1.0.0 eingespielt', $r['ok'], $r['meldung']);
gleich('… zwei neu', 2, $r['neu']);
gleich('… Datei liegt da', $a1, (string)@file_get_contents($w . '/medien/kurs/1-teil.wav'));
gleich('… installierter Stand', '1.0.0', pu_med_installiert()['stand']);
pruefe('… Zwischenordner aufgeräumt', !is_dir($tmp . '/akt/medien-neu'));
gleich('danach kein Angebot für denselben Stand', null,
       pu_med_angebot(['medien' => ['stand' => '1.0.0', 'sha256' => $sha, 'groesse' => 1]]));

$r = pu_med_einspielen(medienpaket($tmp . '/m2.zip', '1.0.1', [
    'medien/kurs/1-teil.wav' => $a1, 'medien/kurs/3-teil.mp3' => $a3]), $w, '1.0.1');
pruefe('Stand 1.0.1 eingespielt', $r['ok'], $r['meldung']);
gleich('… eine unverändert, eine neu', [1, 1], [$r['gleich'], $r['neu']]);
pruefe('… der Song aus 1.0.0 ist weg (fehlt im neuen Paket)', !is_file($w . '/medien/kurs/2_Song.mp3'));
gleich('… eine entfernt', 1, $r['entfernt']);
gleich('eigene Aufnahme bleibt unberührt', 'selbst aufgenommen', (string)@file_get_contents($w . '/medien/eigene/meins.mp3'));

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Was abgewiesen wird — und dann nichts schreibt');
$vorher = hash_file('sha256', $w . '/medien/kurs/3-teil.mp3');
$r = pu_med_einspielen(medienpaket($tmp . '/b1.zip', '1.0.2', [
    'medien/kurs/3-teil.mp3' => 'NEU', 'index.php' => '<?php boese();']), $w, '1.0.2');
pruefe('Datei ausserhalb von medien/: abgewiesen', !$r['ok'], $r['meldung']);
gleich('… und nichts geändert', $vorher, hash_file('sha256', $w . '/medien/kurs/3-teil.mp3'));
pruefe('… index.php nicht angelegt', !is_file($w . '/index.php'));

$r = pu_med_einspielen(medienpaket($tmp . '/b2.zip', '1.0.2', ['medien/kurs/x.php' => '<?php boese();']), $w, '1.0.2');
pruefe('PHP unter medien/: abgewiesen', !$r['ok']);
pruefe('… nicht angelegt', !is_file($w . '/medien/kurs/x.php'));

$r = pu_med_einspielen(medienpaket($tmp . '/b3.zip', '1.0.2', ['medien/kurs/3-teil.mp3' => 'NEU'],
    static function (array &$m): void { $m['dateien']['medien/kurs/3-teil.mp3'] = str_repeat('0', 64); }), $w, '1.0.2');
pruefe('falsche Prüfsumme: abgewiesen', !$r['ok']);
gleich('… und nichts geändert', $vorher, hash_file('sha256', $w . '/medien/kurs/3-teil.mp3'));

$r = pu_med_einspielen(medienpaket($tmp . '/b4.zip', '1.0.2', ['medien/kurs/3-teil.mp3' => 'NEU'],
    static function (array &$m): void { unset($m['art']); }), $w, '1.0.2');
pruefe('ohne Art „medien“ (ein Programm-Paket): abgewiesen', !$r['ok']);

$r = pu_med_einspielen(medienpaket($tmp . '/b5.zip', '1.0.3', ['medien/kurs/3-teil.mp3' => 'NEU']), $w, '1.0.2');
pruefe('anderer Stand als erwartet: abgewiesen', !$r['ok']);
gleich('installierter Stand bleibt 1.0.1', '1.0.1', pu_med_installiert()['stand']);

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Laden prüft gegen den Feed');
$zip = medienpaket($tmp . '/l.zip', '1.1.0', ['medien/kurs/4-teil.mp3' => 'VIER']);
$roh = (string)file_get_contents($zip);
$GLOBALS['PU_AKT_SENDER'] = static function (string $url, ?string $post, ?string $ziel) use (&$roh): array {
    if ($ziel !== null) { file_put_contents($ziel, $roh); }
    return ['status' => str_contains($url, 'paket.php?m=1.1.0') ? 200 : 404, 'rumpf' => ''];
};
$s = pu_akt_stand();
$s['medien'] = ['stand' => '1.1.0', 'sha256' => hash('sha256', $roh), 'groesse' => strlen($roh)];
pu_akt_stand_setzen($s);
$r = pu_med_laden($w);
pruefe('passendes Paket: geladen', $r['ok'], $r['meldung']);
gleich('… Datei liegt da', 'VIER', (string)@file_get_contents($w . '/medien/kurs/4-teil.mp3'));
gleich('… Angebot erledigt', null, pu_akt_stand()['medien']);

$s = pu_akt_stand();
$s['medien'] = ['stand' => '1.2.0', 'sha256' => str_repeat('b', 64), 'groesse' => strlen($roh)];
pu_akt_stand_setzen($s);
$roh = (string)file_get_contents(medienpaket($tmp . '/l2.zip', '1.2.0', ['medien/kurs/5-teil.mp3' => 'FUENF']));
$GLOBALS['PU_AKT_SENDER'] = static function (string $url, ?string $post, ?string $ziel) use (&$roh): array {
    if ($ziel !== null) { file_put_contents($ziel, $roh); }
    return ['status' => 200, 'rumpf' => ''];
};
$r = pu_med_laden($w);
pruefe('Download passt nicht zur Unterschrift: verworfen', !$r['ok'] && str_contains($r['meldung'], 'Unterschrift'), $r['meldung']);
pruefe('… nichts abgelegt', !is_file($w . '/medien/kurs/5-teil.mp3'));

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Beim Start (vor dem Server)');
$rufe = [];
$roh = (string)file_get_contents(medienpaket($tmp . '/s.zip', '1.3.0', ['medien/kurs/6-teil.mp3' => 'SECHS']));
// Kein Netz für den Feed; nur das Paket ist zu haben.
$GLOBALS['PU_AKT_SENDER'] = static function (string $url, ?string $post, ?string $ziel) use (&$roh, &$rufe): array {
    $rufe[] = $url;
    if (str_contains($url, 'paket.php?m=1.3.0')) {
        if ($ziel !== null) file_put_contents($ziel, $roh);
        return ['status' => 200, 'rumpf' => ''];
    }
    return ['status' => 0, 'rumpf' => ''];
};

pu_einst_global_setzen('update_pruefen', 'aus');
gleich('Update-Prüfung abgeschaltet: nichts, kein Netz', [[], []], [pu_med_beim_start($w), $rufe]);
pu_einst_global_setzen('update_pruefen', 'an');

$s = pu_akt_stand();
$s['medien'] = null;
$s['naechste'] = time() + 3600;
pu_akt_stand_setzen($s);
gleich('schon Kursmedien da, Prüfung nicht fällig: nichts, kein Netz', [[], []], [pu_med_beim_start($w), $rufe]);

@unlink(pu_akt_ordner() . '/medien.json');
$z = pu_med_beim_start($w);
pruefe('erster Start ohne Netz: fragt trotzdem sofort nach', $rufe !== []);
pruefe('… und sagt, dass es beim nächsten Start wieder versucht', count($z) === 1 && str_contains($z[0], 'nächsten Start'), $z[0] ?? '');

// Erster Start mit einem Angebot aus einem früher angenommenen Feed.
$rufe = [];
$s = pu_akt_stand();
$s['medien'] = ['stand' => '1.3.0', 'sha256' => hash('sha256', $roh), 'groesse' => strlen($roh)];
pu_akt_stand_setzen($s);
$gesagt = [];
$z = pu_med_beim_start($w, static function (string $t) use (&$gesagt): void { $gesagt[] = $t; });
pruefe('erster Start: lädt', count($z) === 2 && str_starts_with($z[0], 'Lade die Kursmedien 1.3.0') && str_starts_with($z[1], 'OK'),
       implode(' | ', $z));
gleich('… die Zeilen kommen auch einzeln beim Aufrufer an', $z, $gesagt);
gleich('… die Datei liegt da', 'SECHS', (string)@file_get_contents($w . '/medien/kurs/6-teil.mp3'));
gleich('… und der Stand ist vermerkt', '1.3.0', pu_med_installiert()['stand']);

gruppe('Werkzeug und Oberfläche');
$bat = (string)file_get_contents(__DIR__ . '/../PROMPTHEUS-START.bat');
$vorServer = strpos($bat, "srv/kursmedien_cli.php");
pruefe('Startdatei holt die Kursmedien — vor dem Serverstart',
       $vorServer !== false && $vorServer < (int)strpos($bat, ' -S 127.0.0.1:'));
$cli = (string)file_get_contents(__DIR__ . '/../srv/kursmedien_cli.php');
pruefe('das Startprogramm endet immer mit 0 und nur auf der Kommandozeile',
       str_contains($cli, "PHP_SAPI !== 'cli'") && str_ends_with(rtrim($cli), 'exit(0);'));
pruefe('Werkzeug nimmt dieselbe Pfadregel', str_contains((string)file_get_contents(__DIR__ . '/../werkzeuge/medien_paket_bauen.php'), 'pu_med_pfad_ok($p)'));
$api = (string)file_get_contents(__DIR__ . '/../api.php');
pruefe('api.php: update_medien fordert aktualisierung.verwalten',
       (bool)preg_match("/case 'update_medien'.{0,200}pu_recht_fordern\('aktualisierung\.verwalten'\)/s", $api));

bilanz();
