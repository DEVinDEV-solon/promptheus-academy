<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — baut das Kursmedien-Paket (Entwickler-PC).
 *
 *     php werkzeuge/medien_paket_bauen.php --stand=1.0.0
 *     php werkzeuge/medien_paket_bauen.php --stand=1.0.1 --quelle=D:\…\PROMPTHEUS
 *
 * Genommen wird jede Datei unter `<quelle>/medien/`, die die Playlist neben
 * den Kursen zeigt: Video (mp4, webm, m4v) und Ton (mp3, m4a, ogg, opus, wav).
 * Nicht: Rohdateien (.pcm16), Zwischenkopien (….tmp.mp3), Texte (die stehen
 * im Git-Repo). `--quelle` ist der Academy-Ordner, in dem die Aufnahmen
 * liegen — sie sind nicht im Repo, der Worktree hat sie also meist nicht.
 *
 * Ergebnis: dist/promptheus-medien-<stand>.zip mit manifest.json (Art
 * „medien“, jede Datei mit SHA-256).
 *
 * Danach: per SFTP in den Update-Eingang des Servers legen
 * (promptheus-privat/daten/aktualisierung/eingang/), im Cockpit unter
 * Updates → Kursmedien übernehmen, prüfen, freigeben.
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}
if (!class_exists('ZipArchive')) {
    fwrite(STDERR, "Die PHP-Erweiterung zip fehlt (-d extension=zip).\n");
    exit(2);
}
require_once __DIR__ . '/../srv/kursmedien.php';   // pu_med_pfad_ok, pu_akt_fassung_ok

$opt = getopt('', ['stand:', 'quelle:']);
$wurzel = dirname(__DIR__);
$stand = (string)($opt['stand'] ?? '');
if (!pu_akt_fassung_ok($stand)) {
    fwrite(STDERR, "--stand braucht die Form 1.2.3 (höher als der zuletzt freigegebene).\n");
    exit(2);
}
$quelle = rtrim(str_replace('\\', '/', (string)($opt['quelle'] ?? $wurzel)), '/');
if (!is_dir($quelle . '/medien')) {
    fwrite(STDERR, "Kein Ordner medien/ unter $quelle.\n");
    exit(2);
}

$dateien = [];
$it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($quelle . '/medien', FilesystemIterator::SKIP_DOTS));
foreach ($it as $f) {
    if (!$f->isFile()) {
        continue;
    }
    $p = 'medien/' . ltrim(substr(str_replace('\\', '/', $f->getPathname()), strlen($quelle . '/medien')), '/');
    if (!pu_med_pfad_ok($p)) {
        continue;   // Text, Rohdatei, Zwischenkopie — gehört nicht ins Paket
    }
    $dateien[] = $p;
}
sort($dateien, SORT_STRING);
if ($dateien === []) {
    fwrite(STDERR, "Unter $quelle/medien liegen keine Aufnahmen.\n");
    exit(1);
}

$manifest = ['paket' => 1, 'art' => 'medien', 'fassung' => $stand, 'mindestens' => '0.0.0',
             'erstellt' => gmdate('Y-m-d\TH:i:s\Z'), 'dateien' => []];
foreach ($dateien as $p) {
    $manifest['dateien'][$p] = hash_file('sha256', $quelle . '/' . $p);
}

@mkdir($wurzel . '/dist', 0775, true);
$ziel = $wurzel . '/dist/promptheus-medien-' . $stand . '.zip';
@unlink($ziel);
$zip = new ZipArchive();
if ($zip->open($ziel, ZipArchive::CREATE) !== true) {
    fwrite(STDERR, "Das Paket lässt sich nicht anlegen: $ziel\n");
    exit(1);
}
$zip->addFromString('manifest.json', json_encode($manifest, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
foreach (array_keys($manifest['dateien']) as $p) {
    $zip->addFile($quelle . '/' . $p, $p);
    // Ton und Video sind schon gepackt; noch einmal packen kostet nur Zeit.
    $zip->setCompressionName($p, ZipArchive::CM_STORE);
}
if (!$zip->close()) {
    fwrite(STDERR, "Das Paket liess sich nicht schreiben: " . $zip->getStatusString() . "\n");
    @unlink($ziel);
    exit(1);
}
// Gegenprobe: jede Datei des Manifests steht im Paket, mit ihrer Prüfsumme.
$probe = new ZipArchive();
$probe->open($ziel, ZipArchive::RDONLY);
foreach ($manifest['dateien'] as $p => $sha) {
    $s = $probe->getStream($p);
    $h = hash_init('sha256');
    while ($s !== false && !feof($s)) {
        hash_update($h, (string)fread($s, 1 << 16));
    }
    if ($s === false || !hash_equals($sha, hash_final($h))) {
        fwrite(STDERR, "Gegenprobe: $p fehlt im Paket oder stimmt nicht.\n");
        $probe->close();
        @unlink($ziel);
        exit(1);
    }
    fclose($s);
}
$probe->close();

printf("Kursmedien: dist/promptheus-medien-%s.zip\n  %d Dateien, %s MB, SHA-256 %s\n",
    $stand, count($manifest['dateien']), number_format(filesize($ziel) / 1048576, 1, ',', '.'), hash_file('sha256', $ziel));
foreach ($dateien as $p) {
    echo "  · $p\n";
}
echo "Weiter: per SFTP nach promptheus-privat/daten/aktualisierung/eingang/, dann Cockpit → Updates → Kursmedien.\n";
