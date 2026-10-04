<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — die Klassen der Lehrkraft (Plan 30_Community, C8).
 *
 * Die Schule ordnet einer Lehrkraft Klassen zu, auch mehrere. Ohne Zuordnung
 * sieht die Lehrkraft keine Schüler und gibt kein Mit-Siegel. Verwaltung und
 * Admin sehen alle Konten. Geprüft wird vor allem, was eine Lehrkraft NICHT
 * sieht: fremde Klassen, Eltern, andere Lehrkräfte.
 *
 * Aufruf:
 *     php -d extension=pdo_sqlite -d extension=sqlite3 -d extension=mbstring tests/klassen_test.php
 */

require_once __DIR__ . '/hilfe.php';
$db_datei = test_db_vorbereiten();
register_shutdown_function(static fn() => @unlink($db_datei));

require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../srv/db.php';
require_once __DIR__ . '/../srv/rechte.php';
require_once __DIR__ . '/../srv/lernende.php';
require_once __DIR__ . '/../srv/profil.php';
require_once __DIR__ . '/../srv/gemeinde.php';

$chef    = pu_lernenden_anlegen('chef', 'Chef', 'geheim1234', 'admin');
$schule  = pu_lernenden_anlegen('sekretariat', 'Sekretariat', 'geheim1234', 'verwaltung');
$lehrerA = pu_lernenden_anlegen('lehrera', 'Lehrkraft A', 'geheim1234', 'lehrer');
$lehrerB = pu_lernenden_anlegen('lehrerb', 'Lehrkraft B', 'geheim1234', 'lehrer');
$ana     = pu_lernenden_anlegen('ana', 'Ana', 'geheim1234', 'schueler', '7a');
$ben     = pu_lernenden_anlegen('ben', 'Ben', 'geheim1234', 'schueler', '7b');
$cem     = pu_lernenden_anlegen('cem', 'Cem', 'geheim1234', 'schueler', '8c');
$ohne    = pu_lernenden_anlegen('dora', 'Dora', 'geheim1234', 'schueler');
$mama    = pu_lernenden_anlegen('mama', 'Mama', 'geheim1234', 'eltern', '7a');

$person = static function (int $id): array {
    $s = pu_db()->prepare('SELECT id, rolle, gruppe, kind_von FROM lernende WHERE id = ?');
    $s->execute([$id]);
    return $s->fetch();
};
$ids = static fn(array $liste) => array_map('intval', array_column($liste, 'id'));

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Ohne Zuordnung');

$stand = (int)pu_db()->query('PRAGMA user_version')->fetchColumn();
pruefe('Schema ist mindestens auf Stand 12 (lehrer_gruppen)', $stand >= 12, 'ist ' . $stand);
gleich('Lehrkraft ohne Klasse: keine', [], pu_lehrer_gruppen($lehrerA));
gleich('… sieht in der Klassenübersicht nur sich', [$lehrerA], $ids(pu_klasse($person($lehrerA))));
gleich('Verwaltung sieht alle', 9, count(pu_klasse($person($schule))));
gleich('ohne Fragenden (Werkzeuge): alle', 9, count(pu_klasse()));
pruefe('… und siegelt nicht', !pu_gem_darf_siegeln($person($lehrerA), ['lernender' => $ana]));
pruefe('Verwaltung siegelt', pu_gem_darf_siegeln($person($schule), ['lernender' => $ana]));

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Zuordnen');

gleich('mehrere Klassen, als Text', ['7a', '8c'], pu_lehrer_gruppen_setzen($lehrerA, ' 8c, 7a ,7a,, ', $schule));
gleich('gespeichert', ['7a', '8c'], pu_lehrer_gruppen($lehrerA));
gleich('… als Liste ersetzt sie', ['7b'], pu_lehrer_gruppen_setzen($lehrerB, ['7b'], $schule));
wirft('nur bei Lehrkräften', fn() => pu_lehrer_gruppen_setzen($ana, '7a', $schule), 'Lehrkraft');
wirft('auch nicht bei der Verwaltung', fn() => pu_lehrer_gruppen_setzen($schule, '7a', $chef), 'Lehrkraft');
wirft('zu langer Name', fn() => pu_lehrer_gruppen_setzen($lehrerA, str_repeat('x', 41), $schule), '40');
wirft('kein HTML im Namen', fn() => pu_lehrer_gruppen_setzen($lehrerA, '7a<script>', $schule), '<');
wirft('höchstens 30 Klassen', fn() => pu_lehrer_gruppen_setzen($lehrerA, array_map(fn($i) => "K$i", range(1, 31)), $schule), '30');
gleich('ein Fehler ändert nichts', ['7a', '8c'], pu_lehrer_gruppen($lehrerA));
$p = pu_db()->query("SELECT notiz FROM protokoll WHERE aktion = 'klassen' ORDER BY id DESC LIMIT 1")->fetchColumn();
pruefe('im Protokoll', is_string($p) && str_contains($p, '7b'), (string)$p);

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Mit Zuordnung');

$a = $ids(pu_klasse($person($lehrerA)));
sort($a);
gleich('Lehrkraft A: sie selbst, Ana (7a), Cem (8c)', [$lehrerA, $ana, $cem], $a);
pruefe('… nicht Ben aus der 7b', !in_array($ben, $a, true));
pruefe('… nicht die Mutter, auch wenn bei ihr „7a“ steht', !in_array($mama, $a, true));
pruefe('… nicht Lehrkraft B', !in_array($lehrerB, $a, true));
pruefe('… nicht Dora ohne Klasse', !in_array($ohne, $a, true));
$b = $ids(pu_klasse($person($lehrerB)));
sort($b);
gleich('Lehrkraft B: sie selbst und Ben', [$lehrerB, $ben], $b);

pruefe('A siegelt Ana', pu_gem_darf_siegeln($person($lehrerA), ['lernender' => $ana]));
pruefe('A siegelt Cem', pu_gem_darf_siegeln($person($lehrerA), ['lernender' => $cem]));
pruefe('A siegelt Ben nicht', !pu_gem_darf_siegeln($person($lehrerA), ['lernender' => $ben]));
pruefe('A siegelt Dora (ohne Klasse) nicht', !pu_gem_darf_siegeln($person($lehrerA), ['lernender' => $ohne]));
pruefe('B siegelt Ben', pu_gem_darf_siegeln($person($lehrerB), ['lernender' => $ben]));

pu_lehrer_gruppen_setzen($lehrerA, '', $schule);
gleich('Zuordnung entfernen: wieder nur sie selbst', [$lehrerA], $ids(pu_klasse($person($lehrerA))));
pruefe('… und kein Siegel mehr', !pu_gem_darf_siegeln($person($lehrerA), ['lernender' => $ana]));

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Recht');

$r = array_values(array_filter(PU_RECHTE, fn($x) => $x['name'] === 'klassen.manage'))[0];
pruefe('Zuordnen hängt an klassen.manage', in_array('lehrer_klassen_setzen', $r['aktionen'], true));
gleich('… Vorgabe: Verwaltung ja, Lehrkraft nein', [1, 0], [$r['vorgabe']['verwaltung'], $r['vorgabe']['lehrer']]);

bilanz();
