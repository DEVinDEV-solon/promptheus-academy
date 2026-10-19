<?php
declare(strict_types=1);
/**
 * Die Medienspalte beim Kunden (srv/medien.php, 28.09.2026).
 *
 * Das Kursmedien-Paket liefert die Rohdatei `.pcm16` nicht mit. Die
 * gesprochenen Teile eines Kurses müssen trotzdem als Folge durchlaufen —
 * erkannt an ihrem Eintrag in `titel.md`. Ein Lied daneben läuft nicht von
 * selbst weiter.
 */
require_once __DIR__ . '/hilfe.php';
test_db_vorbereiten();
require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../srv/einstellungen.php';
require_once __DIR__ . '/../srv/medien.php';

$probe = '_pu_test_' . bin2hex(random_bytes(4));
$ordner = PU_ROOT . '/medien/' . $probe . '/kurs';
@mkdir($ordner, 0775, true);
register_shutdown_function(static function () use ($ordner, $probe) {
    foreach (glob($ordner . '/songs/*') ?: [] as $f) @unlink($f);
    @rmdir($ordner . '/songs');
    foreach (glob($ordner . '/*') ?: [] as $f) @unlink($f);
    @rmdir($ordner);
    @rmdir(dirname($ordner));
    $leer = PU_ROOT . '/medien/' . $probe . ' Kurs 7/kurs';
    foreach (glob($leer . '/*') ?: [] as $f) @unlink($f);
    @rmdir($leer);
    @rmdir(dirname($leer));
});

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Erklärteile ohne Rohdatei');
file_put_contents($ordner . '/1-teil.wav', 'RIFF');
file_put_contents($ordner . '/2-teil.wav', 'RIFF');
file_put_contents($ordner . '/2_Song-am-Rand.mp3', 'ID3');
// Mit gemischten Zeilenenden, wie sie ein Git-Checkout auf Windows liefert.
file_put_contents($ordner . '/titel.md', "# Titel\n1-teil = Das Feuer\r\n2-teil = Die Stücke\n");

$m = pu_medien($probe, 'kurs');
gleich('die Teile aus titel.md sind Erklärstücke, das Lied nicht', ['erklaer', 'erklaer', 'weiteres'],
       array_column($m['audio'], 'gruppe'));
gleich('… mit ihren Titeln, in ihrer Reihenfolge', ['Das Feuer', 'Die Stücke'],
       array_slice(array_column($m['audio'], 'titel'), 0, 2));
pruefe('… und sie laufen als Folge durch', $m['audio'][0]['kette'] && !$m['audio'][2]['kette']);
pruefe('die Adresse zeigt unter medien/', str_starts_with($m['audio'][0]['url'], 'medien/' . $probe . '/kurs/'));

gruppe('Abschnitt Songs');
@mkdir($ordner . '/songs', 0775, true);
file_put_contents($ordner . '/songs/01_das-feuer-bleibt-bei-dir.mp3', 'ID3');
file_put_contents($ordner . '/songs/02_die-5.mp3', 'ID3');
// Ein Titel in songs/titel.md macht ein Lied NICHT zum Erklärstück.
file_put_contents($ordner . '/songs/titel.md', "01_das-feuer-bleibt-bei-dir = Das Feuer bleibt bei dir\n");
$m = pu_medien($probe, 'kurs');
gleich('Reihenfolge: Erklärstücke, Übriges, dann der Abschnitt', ['erklaer', 'erklaer', 'weiteres', 'songs', 'songs'],
       array_column($m['audio'], 'gruppe'));
gleich('der Abschnitt trägt die Überschrift „Songs“', ['', '', '', 'Songs', 'Songs'],
       array_column($m['audio'], 'abschnitt'));
pruefe('… seine Lieder laufen nicht von selbst weiter', !$m['audio'][3]['kette'] && !$m['audio'][4]['kette']);
gleich('… und behalten ihren Titel aus titel.md', 'Das Feuer bleibt bei dir', $m['audio'][3]['titel']);
pruefe('… Adresse unter songs/', str_contains($m['audio'][3]['url'], '/kurs/songs/01_das-feuer-bleibt-bei-dir.mp3'));

gruppe('Kurspfad mit Leerzeichen (Kurs 7)');
$k7 = PU_ROOT . '/medien/' . $probe . ' Kurs 7/kurs';
@mkdir($k7, 0775, true);
file_put_contents($k7 . '/01_der-7-kurs-hoer-zu.mp3', 'ID3');
$m7 = pu_medien($probe . ' Kurs 7', 'kurs');
gleich('ein Ordner mit Leerzeichen wird gelesen', 1, count($m7['audio']));
pruefe('… und die Adresse ist kodiert', str_contains($m7['audio'][0]['url'] ?? '', '%20Kurs%207/kurs/01_der-7-kurs-hoer-zu.mp3'));
pruefe('ein Teil mit Leerzeichen am Rand bleibt verboten', !pu_medien_teil_ok(' kurs') && !pu_medien_teil_ok('kurs '));
pruefe('… und .. bleibt verboten', !pu_medien_teil_ok('..') && pu_medien_ordner('..', 'kurs') === null);

gruppe('Ohne Aufnahme');
foreach (glob($ordner . '/songs/*') ?: [] as $f) @unlink($f);
@rmdir($ordner . '/songs');
foreach (glob($ordner . '/*.{wav,mp3}', GLOB_BRACE) ?: [] as $f) @unlink($f);
pruefe('nur titel.md: leer — die Spalte zeigt den Ablage-Hinweis', pu_medien_leer(pu_medien($probe, 'kurs')));

bilanz();
