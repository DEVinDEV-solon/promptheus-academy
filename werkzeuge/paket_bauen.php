<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — baut das Update-Paket einer Fassung (Entwickler-PC).
 *
 *     php werkzeuge/paket_bauen.php                      Fassung aus VERSION
 *     php werkzeuge/paket_bauen.php --fassung=0.9.1      andere Fassung (Probelauf)
 *     php werkzeuge/paket_bauen.php --mindestens=1.0.0   ab welcher Fassung erlaubt
 *     php werkzeuge/paket_bauen.php --hinweise=HINWEISE.md   „Was neu ist“ ins Manifest
 *
 * Ergebnis: dist/promptheus-academy-<fassung>.zip mit manifest.json (jede
 * Datei mit SHA-256). Genommen wird, was Git kennt (`git ls-files`) — ohne
 * data/, .env*, php/, tests/, setup/, vps/, werkzeuge/, dist/ und Punktordner.
 * Mit --fassung steht die Fassung auch in der VERSION-Datei IM PAKET; die
 * VERSION im Arbeitsordner bleibt, wie sie ist.
 *
 * Danach (Release-Checkliste, vps/Pläne/90_Updates/UPDATE-PLAN.md):
 *     gh release create v<fassung> dist/promptheus-academy-<fassung>.zip --notes-file HINWEISE.md
 * und im Cockpit: Updates → Releases → Holen · Prüfen · Freigeben.
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}
if (!class_exists('ZipArchive')) {
    fwrite(STDERR, "Die PHP-Erweiterung zip fehlt (-d extension=zip).\n");
    exit(2);
}

require_once __DIR__ . '/../srv/aktualisierung.php';   // pu_akt_pfad_ok, pu_akt_fassung_ok

$opt = getopt('', ['fassung:', 'mindestens:', 'hinweise:']);
$wurzel = dirname(__DIR__);
$fassung = (string)($opt['fassung'] ?? trim((string)@file_get_contents($wurzel . '/VERSION')));
$mindestens = (string)($opt['mindestens'] ?? '0.0.0');
if (!pu_akt_fassung_ok($fassung) || !pu_akt_fassung_ok($mindestens)) {
    fwrite(STDERR, "Fassung und --mindestens brauchen die Form 1.2.3.\n");
    exit(2);
}
$hinweise = '';
if (isset($opt['hinweise'])) {
    $hinweise = trim((string)@file_get_contents((string)$opt['hinweise']));
}

// Was Git kennt, NUL-getrennt (Umlaute in Pfaden bleiben unversehrt).
$roh = shell_exec('git -C ' . escapeshellarg($wurzel) . ' -c core.quotepath=off ls-files -z');
if (!is_string($roh) || $roh === '') {
    fwrite(STDERR, "git ls-files lieferte nichts. Im Repo aufrufen, git muss im PATH sein.\n");
    exit(2);
}
$weg = ['data', 'php', 'tests', 'setup', 'vps', 'werkzeuge', 'dist', 'node_modules'];
$dateien = [];
foreach (explode("\0", rtrim($roh, "\0")) as $p) {
    $erstes = strtolower(explode('/', $p)[0]);
    if (in_array($erstes, $weg, true) || str_starts_with($erstes, '.') || $p === 'manifest.json') {
        continue;
    }
    if (!pu_akt_pfad_ok($p)) {
        fwrite(STDERR, "Übersprungen (Pfad nicht erlaubt): $p\n");
        continue;
    }
    if (!is_file($wurzel . '/' . $p)) {
        continue;   // gelöscht, aber noch nicht committet
    }
    $dateien[] = $p;
}
sort($dateien, SORT_STRING);

$manifest = ['paket' => 1, 'fassung' => $fassung, 'mindestens' => $mindestens,
             'erstellt' => gmdate('Y-m-d\TH:i:s\Z'), 'dateien' => []];
if ($hinweise !== '') {
    $manifest['hinweise'] = mb_substr($hinweise, 0, 4000);
}
foreach ($dateien as $p) {
    $manifest['dateien'][$p] = $p === 'VERSION' ? hash('sha256', $fassung . "\n") : hash_file('sha256', $wurzel . '/' . $p);
}
if (!isset($manifest['dateien']['VERSION'])) {
    $manifest['dateien']['VERSION'] = hash('sha256', $fassung . "\n");
}

@mkdir($wurzel . '/dist', 0775, true);
$ziel = $wurzel . '/dist/promptheus-academy-' . $fassung . '.zip';
@unlink($ziel);
$zip = new ZipArchive();
if ($zip->open($ziel, ZipArchive::CREATE) !== true) {
    fwrite(STDERR, "Das Paket lässt sich nicht anlegen: $ziel\n");
    exit(1);
}
$zip->addFromString('manifest.json', json_encode($manifest, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
foreach (array_keys($manifest['dateien']) as $p) {
    $voll = $wurzel . '/' . $p;
    if ($p === 'VERSION') {
        $zip->addFromString('VERSION', $fassung . "\n");
    } elseif (strlen($voll) > 240) {
        // libzip öffnet Dateien erst beim Schliessen und scheitert unter
        // Windows an Pfaden über 260 Zeichen — PHP selbst nicht. Lange Pfade
        // deshalb über PHP lesen (Probelauf 27.09.2026).
        $zip->addFromString($p, (string)file_get_contents($voll));
    } else {
        $zip->addFile($voll, $p);
    }
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
    $inhalt = $probe->getFromName($p);
    if ($inhalt === false || !hash_equals($sha, hash('sha256', $inhalt))) {
        fwrite(STDERR, "Gegenprobe: $p fehlt im Paket oder stimmt nicht.\n");
        $probe->close();
        @unlink($ziel);
        exit(1);
    }
}
$probe->close();

printf("Paket: dist/promptheus-academy-%s.zip\n  %d Dateien, %s MB, SHA-256 %s\n",
    $fassung, count($manifest['dateien']), number_format(filesize($ziel) / 1048576, 1, ',', '.'), hash_file('sha256', $ziel));
printf("Weiter:\n  gh release create v%s dist/promptheus-academy-%s.zip --title \"%s\" --notes-file HINWEISE.md\n",
    $fassung, $fassung, $fassung);
