<?php
declare(strict_types=1);
/**
 * Die Sitzung gehört genau einer Installation (srv/sitzung.php).
 *
 * Geprüft wird, was schiefging, als Hauptordner und Testordner nebeneinander
 * liefen: derselbe Cookie-Name für beide, derselbe Sitzungsordner für beide.
 */

require_once __DIR__ . '/hilfe.php';
require_once __DIR__ . '/../srv/sitzung.php';

gruppe('Cookie-Name');

$a = sys_get_temp_dir() . '/pu_sitzung_a_' . bin2hex(random_bytes(3));
$b = sys_get_temp_dir() . '/pu_sitzung_b_' . bin2hex(random_bytes(3));
@mkdir($a, 0700, true);
@mkdir($b, 0700, true);

pruefe('Form PROMPTHEUS_ + 10 Hexzeichen', (bool)preg_match('/^PROMPTHEUS_[0-9a-f]{10}$/', pu_sitzung_name($a)));
pruefe('zwei Installationen: zwei Namen', pu_sitzung_name($a) !== pu_sitzung_name($b));
gleich('derselbe Ordner: derselbe Name', pu_sitzung_name($a), pu_sitzung_name($a));
gleich('Schreibweise egal (Gross/klein, Schrägstriche)',
       pu_sitzung_name($a), pu_sitzung_name(strtoupper(str_replace('/', '\\', $a))));
pruefe('nicht mehr der alte gemeinsame Name', pu_sitzung_name($a) !== 'PROMPTHEUS');

gruppe('Sitzungsordner');

pruefe('liegt unter data/ der Installation', str_ends_with(str_replace('\\', '/', pu_sitzung_ordner($a)), '/data/sitzungen'));
pruefe('zwei Installationen: zwei Ordner', pu_sitzung_ordner($a) !== pu_sitzung_ordner($b));

gruppe('Aufrufer');

$lib    = (string)file_get_contents(__DIR__ . '/../lib.php');
$router = (string)file_get_contents(__DIR__ . '/../router.php');
pruefe('lib.php öffnet über pu_sitzung_oeffnen', str_contains($lib, 'pu_sitzung_oeffnen(PU_ROOT)'));
pruefe('router.php öffnet über pu_sitzung_oeffnen', str_contains($router, 'pu_sitzung_oeffnen(__DIR__)'));
pruefe("kein session_name('PROMPTHEUS') mehr", !preg_match("/session_name\('PROMPTHEUS'\)/", $lib . $router));

@rmdir($a);
@rmdir($b);
bilanz();
