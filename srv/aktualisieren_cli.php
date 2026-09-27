<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — spielt ein bereitgelegtes Update ein (oder nimmt es zurück).
 *
 * Wird von `promptheus-start.bat` **vor** dem Serverstart aufgerufen, nie
 * über das Netz. Endet immer mit 0: die bat startet danach den Server, ob der
 * Tausch gelang oder nicht — eine Academy, die nach einem missglückten Update
 * gar nicht mehr startet, wäre schlimmer als eine, die die alte Fassung zeigt.
 *
 *     php srv/aktualisieren_cli.php
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/aktualisierung_tausch.php';

$ordner = pu_akt_ordner();
if (is_file($ordner . '/zurueck')) {
    echo "  Vorige Fassung wird wiederhergestellt ...\n";
    $r = pu_akt_zurueck(PU_ROOT, $ordner, PU_DB);
} elseif (is_file($ordner . '/bereit.json')) {
    echo "  Update wird eingespielt ...\n";
    $r = pu_akt_tausch(PU_ROOT, $ordner, PU_DB);
} else {
    exit(0);
}
// Nur ASCII im Konsolenfenster: cmd zeigt UTF-8 nicht überall richtig.
$text = strtr($r['meldung'], ['ä' => 'ae', 'ö' => 'oe', 'ü' => 'ue', 'Ä' => 'Ae', 'Ö' => 'Oe', 'Ü' => 'Ue', 'ß' => 'ss', '→' => '->']);
echo '  ' . ($r['ok'] ? 'OK: ' : 'FEHLER: ') . $text . "\n";
exit(0);
