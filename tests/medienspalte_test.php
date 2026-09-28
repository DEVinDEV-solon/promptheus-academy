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
register_shutdown_function(static function () use ($ordner) {
    foreach (glob($ordner . '/*') ?: [] as $f) @unlink($f);
    @rmdir($ordner);
    @rmdir(dirname($ordner));
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

gruppe('Ohne Aufnahme');
foreach (glob($ordner . '/*.{wav,mp3}', GLOB_BRACE) ?: [] as $f) @unlink($f);
pruefe('nur titel.md: leer — die Spalte zeigt den Ablage-Hinweis', pu_medien_leer(pu_medien($probe, 'kurs')));

bilanz();
