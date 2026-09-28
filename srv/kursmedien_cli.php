<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — holt die Kursmedien beim Start (28.09.2026).
 *
 * Wird von `PROMPTHEUS-START.bat` **vor** dem Serverstart aufgerufen. So
 * bekommt jede Installation die Aufnahmen der Kurse, ohne dass jemand einen
 * Knopf drückt — auch eine frische, nicht registrierte, auf der noch niemand
 * das Recht „Updates verwalten“ hat. Die Regeln stehen in
 * pu_med_beim_start() (srv/kursmedien.php).
 *
 * Geladen wird vor dem Server, nicht aus ihm heraus: Der eingebaute
 * PHP-Server bedient eine Anfrage nach der anderen, ein Download von 30 MB
 * darin hielte die ganze Academy an.
 *
 * Endet immer mit 0 — ohne Netz startet die Academy eben ohne neue Aufnahmen.
 *
 *     php -r "require 'srv/kursmedien_cli.php';"     (so ruft es die bat)
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

$aus = static function (string $t): void {
    // Nur ASCII im Konsolenfenster: cmd zeigt UTF-8 nicht überall richtig.
    echo '  ' . strtr($t, ['ä' => 'ae', 'ö' => 'oe', 'ü' => 'ue', 'Ä' => 'Ae', 'Ö' => 'Oe', 'Ü' => 'Ue',
                           'ß' => 'ss', '„' => '"', '“' => '"', '—' => '-', '…' => '...']) . "\n";
};

try {
    require_once __DIR__ . '/kursmedien.php';
    pu_med_beim_start(PU_ROOT, $aus);
} catch (Throwable $e) {
    $aus('Kursmedien: nicht geladen (' . $e->getMessage() . ').');
}
exit(0);
