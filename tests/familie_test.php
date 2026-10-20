<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Familien-Konten (Plan 20_Geschaeft/FAMILIE-UND-GRATIS-ZUGANG-PLAN.md §2).
 *
 * Bis zu drei Kinder je Elternkonto, ein Elternkonto je Kind, Eltern legen auf
 * dem Familienrechner ihre Kinder selbst an, der Familienplan gilt für die
 * Kinder (nach der Schule), und überall, wo vorher `kind_von` galt, gelten
 * jetzt alle Kinder.
 *
 * Aufruf:
 *     php -d extension=pdo_sqlite -d extension=sqlite3 -d extension=mbstring tests/familie_test.php
 */

require_once __DIR__ . '/hilfe.php';
$db_datei = test_db_vorbereiten();
register_shutdown_function(static fn() => @unlink($db_datei));

require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../srv/db.php';
require_once __DIR__ . '/../srv/rechte.php';
require_once __DIR__ . '/../srv/lernende.php';
require_once __DIR__ . '/../srv/profil.php';
require_once __DIR__ . '/../srv/abo.php';
require_once __DIR__ . '/../srv/familie.php';
require_once __DIR__ . '/../srv/gemeinde.php';
require_once __DIR__ . '/../srv/raenge.php';

$chef   = pu_lernenden_anlegen('chef', 'Chef', 'geheim1234', 'admin');
$schule = pu_lernenden_anlegen('sekretariat', 'Sekretariat', 'geheim1234', 'verwaltung');
$lehrer = pu_lernenden_anlegen('lehrer', 'Lehrkraft', 'geheim1234', 'lehrer');
$mama   = pu_lernenden_anlegen('mama', 'Mama', 'geheim1234', 'eltern');
$papa   = pu_lernenden_anlegen('papa', 'Papa', 'geheim1234', 'eltern');
$a      = pu_lernenden_anlegen('kinda', 'Kind A', 'geheim1234', 'schueler', '5a');
$b      = pu_lernenden_anlegen('kindb', 'Kind B', 'geheim1234', 'schueler', '7b');
$c      = pu_lernenden_anlegen('kindc', 'Kind C', 'geheim1234', 'schueler');
$d      = pu_lernenden_anlegen('kindd', 'Kind D', 'geheim1234', 'schueler');
$fremd  = pu_lernenden_anlegen('fremd', 'Fremd', 'geheim1234', 'schueler', '5a');

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Schema');
gleich('Stand 15', 15, (int)pu_db()->query('PRAGMA user_version')->fetchColumn());

pu_db()->prepare('UPDATE lernende SET kind_von = ? WHERE id = ?')->execute([$a, $papa]);
gleich('Altspalte wird mitgelesen', [$a], pu_eltern_kinder($papa));
gleich('… auch von der Kindseite', $papa, pu_kind_eltern($a));
pu_db_v15(pu_db());
gleich('Migration übernimmt kind_von in die Tabelle', 1,
       (int)pu_db()->query("SELECT COUNT(*) FROM eltern_kinder WHERE eltern = $papa AND kind = $a")->fetchColumn());
pu_profil_kind_setzen($papa, 0, $chef);
gleich('alle lösen', [], pu_eltern_kinder($papa));
gleich('… auch die Altspalte', 0, pu_profil($papa)['kind_von']);

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Bis zu drei Kinder, ein Elternkonto je Kind');

pu_eltern_kind_hinzu($mama, $a, $schule);
pu_eltern_kind_hinzu($mama, $b, $schule);
pu_profil_kind_setzen($mama, $c, $schule);       // alte Schnittstelle: dazunehmen
gleich('drei Kinder', [$a, $b, $c], pu_eltern_kinder($mama));
gleich('kind_von zeigt auf das erste', $a, pu_profil($mama)['kind_von']);
wirft('kein viertes', fn() => pu_eltern_kind_hinzu($mama, $d, $schule), 'höchstens 3');
wirft('kein Kind mit zwei Elternkonten', fn() => pu_eltern_kind_hinzu($papa, $a, $schule), 'anderen Elternkonto');
wirft('nur Schülerkonten', fn() => pu_eltern_kind_hinzu($mama, $lehrer, $schule), 'Schülerkonto');
wirft('nur bei Elternkonten', fn() => pu_eltern_kind_hinzu($lehrer, $d, $schule), 'Elternkonto');
pu_eltern_kind_hinzu($mama, $a, $schule);
gleich('doppelt verknüpfen ändert nichts', [$a, $b, $c], pu_eltern_kinder($mama));
pu_eltern_kind_loesen($mama, $a, $schule);
gleich('lösen', [$b, $c], pu_eltern_kinder($mama));
gleich('kind_von rückt nach', $b, pu_profil($mama)['kind_von']);
pu_eltern_kind_hinzu($mama, $a, $schule);
$prot = (int)pu_db()->query("SELECT COUNT(*) FROM protokoll WHERE aktion IN ('kind_verknuepft','kind_geloest')")->fetchColumn();
pruefe('im Protokoll', $prot >= 5, (string)$prot);

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Token senden: Eltern an alle eigenen Kinder');

$ziele = array_map('intval', array_column(pu_talente_empfaenger($mama), 'id'));
sort($ziele);
gleich('Mama erreicht A, B, C', [$a, $b, $c], $ziele);
pruefe('… nicht das fremde Kind', !in_array($fremd, $ziele, true));
gleich('Papa ohne Kind erreicht niemanden', [], pu_talente_empfaenger($papa));

pu_lehrer_gruppen_setzen($lehrer, '7b', $schule);
$l = array_map('intval', array_column(pu_talente_empfaenger($lehrer), 'id'));
pruefe('Lehrkraft der 7b erreicht Mama über Kind B', in_array($mama, $l, true));
pruefe('… und Kind B', in_array($b, $l, true));
pruefe('… nicht Kind A aus der 5a', !in_array($a, $l, true));

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Der Familientopf');

gleich('Kind ohne Plan: kein Abo', null, pu_abo_fuer($c));
$fam = pu_abo_buchen('person', $mama, '', 'familie', $chef);
$abo = pu_abo_fuer($c);
gleich('Kind C schöpft aus dem Familienplan der Mutter', (int)$fam['id'], (int)($abo['id'] ?? 0));
gleich('Belegte Plätze: drei Kinder', 3, (int)pu_abo_fuer($mama)['belegt']);
pu_token_verbrauchen($c, 'Tutor: Probe', 1000);
gleich('Verbrauch des Kindes steht im Topf der Mutter', 1000, pu_token_stand($mama)['verbraucht']);

$schulAbo = pu_abo_buchen('schule', $schule, 'Gesamtschule', 'schule', $chef);
pu_profil_setzen($b, 'schule', 'Gesamtschule');
gleich('Schule vor Familie: Kind B zahlt die Schule', (int)$schulAbo['id'], (int)(pu_abo_fuer($b)['id'] ?? 0));

$einzel = pu_abo_buchen('person', $papa, '', 'schueler', $chef);
pu_eltern_kind_hinzu($papa, $d, $chef);
gleich('Ein Kind-Plan des Vaters gilt nicht für sein Kind', null, pu_abo_fuer($d));

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Meine Kinder (Eltern selbst)');

$GLOBALS['PU_TEST_ART'] = 'schule';
wirft('in der Schule legt die Schulleitung an',
      fn() => pu_familie_kind_anlegen($papa, 'neu1', 'Neu', 'geheim1234'), 'Schulleitung');
$GLOBALS['PU_TEST_ART'] = 'eltern';
$neu = pu_familie_kind_anlegen($papa, 'neu1', 'Neu', 'geheim1234');
gleich('auf dem Familienrechner: angelegt und verknüpft', [$d, $neu], pu_eltern_kinder($papa));
gleich('… als Schülerkonto', 'schueler', pu_profil($neu)['rolle']);

$aus = pu_familie_ausgabe($mama);
$cZeile = array_values(array_filter($aus['kinder'], fn($k) => $k['id'] === $c))[0] ?? null;
gleich('Verbrauch je Kind: Token', 1000, $cZeile['tokens'] ?? null);
gleich('… und Zahl der Fragen', 1, $cZeile['fragen'] ?? null);
pruefe('… aber keine Frage im Wortlaut', !array_key_exists('wofuer', $cZeile ?? []));
pruefe('Mama: voll, kein Anlegen mehr', $aus['darf_anlegen'] === false);
pruefe('Familienplan erkannt', ($aus['plan']['familie'] ?? false) === true);

wirft('fremdes Kind lösen geht nicht', fn() => pu_familie_kind_loesen($papa, $a), 'nicht mit deinem Konto');
pu_familie_kind_loesen($papa, $neu);
gleich('eigenes Kind lösen', [$d], pu_eltern_kinder($papa));
$GLOBALS['PU_TEST_ART'] = 'betreiber';

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Siegel und Rang mit mehreren Kindern');

$GLOBALS['PU_TEST_ART'] = 'schule';
pruefe('Mama siegelt das Werk von Kind C', pu_gem_darf_siegeln(pu_profil($mama), ['lernender' => $c]));
pruefe('… nicht das eines fremden Kindes', !pu_gem_darf_siegeln(pu_profil($mama), ['lernender' => $fremd]));
$GLOBALS['PU_TEST_ART'] = 'betreiber';
pu_db()->prepare('INSERT INTO versuche (lernender, aufgabe_id, antwort, richtig, zeitpunkt, tag) VALUES (?,?,?,?,?,?)')
       ->execute([$a, 'x1', '', 1, pu_jetzt(), pu_heute()]);
pu_db()->prepare('INSERT INTO versuche (lernender, aufgabe_id, antwort, richtig, zeitpunkt, tag) VALUES (?,?,?,?,?,?)')
       ->execute([$c, 'x1', '', 1, pu_jetzt(), pu_heute()]);
gleich('Rangzahl der Mutter: gelöste Aufgaben aller Kinder', 2, pu_rang_zahl($mama, 'eltern'));

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Rechte');
$r = array_column(PU_RECHTE, null, 'name');
gleich('familie.kinder: nur Eltern ab Werk', [0, 0, 1, 0],
       array_values(array_intersect_key($r['familie.kinder']['vorgabe'], array_flip(['verwaltung', 'lehrer', 'eltern', 'schueler']))));
pruefe('kind_loesen hängt an eltern.manage', in_array('kind_loesen', $r['eltern.manage']['aktionen'], true));

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Schulgrenze (1.1.15) bei mehreren Kindern');
$artVorher = $GLOBALS['PU_TEST_ART'];
$GLOBALS['PU_TEST_ART'] = 'betreiber';
$oma = pu_lernenden_anlegen('oma', 'Oma', 'geheim1234', 'eltern');
pu_profil_setzen($oma, 'schule', 'Schule Nord');
$e1 = pu_lernenden_anlegen('enkel1', 'Enkel 1', 'geheim1234', 'schueler');
wirft('Kind aus einer anderen Schule', fn() => pu_eltern_kind_hinzu($oma, $e1, $chef), 'derselben Schule');
pu_profil_setzen($e1, 'schule', 'Schule Nord');
wirft('fremde Verwaltung verknüpft nicht', fn() => pu_eltern_kind_hinzu($oma, $e1, $schule), 'nicht zu deiner Schule');
pu_eltern_kind_hinzu($oma, $e1, $chef);
gleich('admin ist nicht an die Schule gebunden', [$e1], pu_eltern_kinder($oma));
wirft('fremde Verwaltung löst nicht', fn() => pu_eltern_kind_loesen($oma, $e1, $schule), 'nicht zu deiner Schule');
wirft('… auch nicht über die alte Schnittstelle',
      fn() => pu_profil_kind_setzen($oma, 0, pu_profil($schule)), 'nicht zu deiner Schule');
gleich('… die Verknüpfung bleibt', [$e1], pu_eltern_kinder($oma));
$GLOBALS['PU_TEST_ART'] = 'eltern';
$neu = pu_familie_kind_anlegen($oma, 'enkel2', 'Enkel 2', 'geheim1234');
gleich('selbst angelegtes Kind erbt die Schule', 'Schule Nord', pu_profil($neu)['schule']);
gleich('… und ist verknüpft', [$e1, $neu], pu_eltern_kinder($oma));
$GLOBALS['PU_TEST_ART'] = $artVorher;

bilanz();
