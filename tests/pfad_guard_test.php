<?php
declare(strict_types=1);
/**
 * Pfadwachen — kein Ausbruch aus brain/, und router.php sperrt, was er sperren soll.
 *
 * `router.php` wird hier nicht über HTTP geprüft, sondern durch Nachstellen
 * der Anfrage: die Datei liest `$_SERVER['REQUEST_URI']` und gibt `true`
 * zurück, wenn sie den Pfad abweist. Ein echter Server wäre gründlicher, aber
 * er müsste in jedem Testlauf hochgefahren werden — und dann liefe der Test
 * seltener. Ein Test, der nicht läuft, prüft nichts.
 */

require_once __DIR__ . '/hilfe.php';
test_db_vorbereiten();

require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../srv/rechte.php';
require_once __DIR__ . '/../srv/einstellungen.php';
require_once __DIR__ . '/../srv/medien.php';

// ================================================================ brain-Pfade
gruppe('pu_brain_pfad — kein Ausbruch');
$raus = [
    '../lib.php',
    '../../.env',
    'index/../../.env',
    '..\\..\\api.php',
    '/etc/passwd',
    'C:/Windows/system.ini',
];
foreach ($raus as $p) {
    pruefe('abgewiesen: ' . $p, pu_brain_pfad($p) === null);
}

pruefe('leerer Pfad abgewiesen', pu_brain_pfad('') === null);
pruefe('Nullbyte abgewiesen', pu_brain_pfad("index.md\0.txt") === null);

gruppe('pu_brain_pfad — Erlaubtes geht durch');
pruefe('Hub-Note gefunden', pu_brain_pfad('PROMPTHEUS WISSEN.md') !== null);
pruefe('Notiz im Unterordner', pu_brain_pfad('000_Academy/Leitbild.md') !== null);
pruefe('fuehrender Schraegstrich stoert nicht', pu_brain_pfad('/index.md') !== null);
pruefe('Rueckstrich wird umgesetzt', pu_brain_pfad('000_Academy\\Leitbild.md') !== null);

// Noch nicht vorhandene Datei in vorhandenem Ordner: erlaubt (Neuanlage).
pruefe('neue Datei im Vault erlaubt', pu_brain_pfad('99_Inbox/neu.md') !== null);
pruefe('neue Datei außerhalb abgewiesen', pu_brain_pfad('../neu.md') === null);

gruppe('pu_pfad_in_wurzel — Praefixfalle');
pruefe('gleicher Ordner', pu_pfad_in_wurzel('/a/brain', '/a/brain'));
pruefe('darunter',        pu_pfad_in_wurzel('/a/brain/x.md', '/a/brain'));
pruefe('Nachbar mit gleichem Präfix NICHT darunter',
       !pu_pfad_in_wurzel('/a/brain_alt/x.md', '/a/brain'));
pruefe('leere Wurzel fällt durch', !pu_pfad_in_wurzel('/a', ''));

gruppe('pu_brain_rel');
$abs = pu_brain_pfad('000_Academy/Leitbild.md');
gleich('zurueck in den relativen Pfad', '000_Academy/Leitbild.md', pu_brain_rel((string)$abs));
gleich('außerhalb gibt leer', '', pu_brain_rel('C:/anderswo/x.md'));

// ================================================================ router.php
gruppe('router.php weist ab');

/**
 * Stellt eine Anfrage nach und gibt zurueck, ob der Router sie sperrt.
 *
 * `header()` und `http_response_code()` melden im CLI "headers already sent",
 * weil der Test vorher schon geschrieben hat. Das ist kein Befund, sondern
 * die Umgebung — geprueft wird der Rueckgabewert. Die Meldungen werden
 * deshalb gezielt hier unterdrueckt, nicht global: sonst verlore der Test
 * jede andere Warnung gleich mit.
 */
function router_sperrt(string $uri): bool
{
    $_SERVER['REQUEST_URI'] = $uri;
    $vorher = error_reporting();
    error_reporting($vorher & ~E_WARNING);
    ob_start();
    $gesperrt = (bool)(require __DIR__ . '/../router.php');
    ob_end_clean();
    error_reporting($vorher);
    return $gesperrt;
}

$muss_sperren = [
    '/data/promptheus.db',
    '/data/logs/fehler.log',
    '/brain/index.md',
    '/brain/10_Stufen/01_Entdecker/pruefung.md',
    '/.obsidian/graph.json',
    '/prompts/athena.md',
    '/setup/quellen.json',
    '/tests/bewertung_test.php',
    '/.env',
    '/.env.example',
    '/.git/config',
    '/DATA/promptheus.db',
    '/BRAIN/index.md',
    '/x/../brain/index.md',

    /* Die Serverseite. Sie gehoert auf den VPS und darf auf dem Rechner eines
       Kunden nie erreichbar sein — dort laege sonst der Teil offen, der die
       Freischaltung durchsetzt, und zwar bei dem, der freigeschaltet werden
       soll. Der Ordner ist heute leer; die Pruefung steht trotzdem schon hier,
       damit die Sperre nicht erst auffaellt, wenn Code darin liegt. */
    '/vps/relay/index.php',
    '/vps/verwaltung/login.php',
    '/vps/db/schema.sql',
    '/VPS/relay/index.php',
];
foreach ($muss_sperren as $u) {
    pruefe('403 für ' . $u, router_sperrt($u));
}

// Der wichtigste Einzelfall: die Prüfung eines Kurses. Waere sie statisch
// abrufbar, könnte jeder Lernende sie im zweiten Fenster nachschlagen.
pruefe('Pruefungsdatei ist statisch nicht erreichbar',
       router_sperrt('/brain/10_Stufen/02_Priester/pruefung.md'));

$muss_durchlassen = [
    '/',
    '/index.php',
    '/api.php',
    '/assets/css/promptheus.css',
    '/assets/css/marke.css',
    '/assets/js/app.js',
    '/assets/img/promptheus.svg',
    '/assets/img/background/promptheus-background.jpg',
    '/assets/img/kurse/entdecker.jpg',
];
foreach ($muss_durchlassen as $u) {
    pruefe('durchgelassen: ' . $u, !router_sperrt($u));
}

// ================================================================ Slug
gruppe('pu_slug');
gleich('Umlaute',        'aeoeue-strasse', pu_slug('ÄÖÜ Straße'));
gleich('Sonderzeichen',  'a-b-c', pu_slug('a/b\\c'));
gleich('Randstriche weg','test', pu_slug('  --Test--  '));
gleich('leer bleibt leer','', pu_slug('!!!'));

// ================================================================ Medien je Zielgruppe
gruppe('Mehrstufige Medienordner');

// Seit es Aufnahmen je Zielgruppe gibt, darf `$unter` mehrstufig sein
// („kurs/eltern"). Der Schrägstrich darf aber kein Loch in die Wache
// reissen: zerlegt wird in Teile, und jeder Teil wird einzeln geprüft.
// Angelegt, geprüft, weggeräumt: pu_medien_ordner() weist auch einen
// Ordner ab, den es nicht gibt — die Prüfung braucht ihn also wirklich.
$probe = PU_MEDIEN . '/10_Stufen/01_Entdecker/kurs/eltern';
@mkdir($probe, 0777, true);

pruefe('kurs/eltern ist erlaubt',
       pu_medien_ordner('10_Stufen/01_Entdecker', 'kurs/eltern') !== null);
pruefe('…und liegt unter dem Medienordner',
       str_starts_with(str_replace('\\', '/', (string)pu_medien_ordner('10_Stufen/01_Entdecker', 'kurs/eltern')),
                       str_replace('\\', '/', PU_MEDIEN)));

@rmdir($probe);

foreach (['kurs/..', 'kurs/../../geheim', '../kurs/eltern', 'kurs/el tern',
          'kurs/eltern;rm', 'kurs/eltern' . chr(0), 'kurs//..//x'] as $boese) {
    pruefe('abgewiesen: ' . str_replace(chr(0), '[NUL]', $boese),
           pu_medien_ordner('10_Stufen/01_Entdecker', $boese) === null);
}

// Der Rückfall: ohne eigene Aufnahme bekommt die Zielgruppe die gemeinsame.
$alle  = pu_medien_fuer('10_Stufen/01_Entdecker', 'kurs');
$eltern = pu_medien_fuer('10_Stufen/01_Entdecker', 'kurs', 'eltern');
gleich('ohne eigene Aufnahme gilt die gemeinsame',
       count($alle['audio']), count($eltern['audio']));

gleich('Ebene 1 hört, was für alle da ist', '', pu_medien_zielgruppe(['rolle' => 'admin']));
gleich('ein Elternkonto hört die Eltern-Fassung', 'eltern',
       pu_medien_zielgruppe(['rolle' => 'eltern']));
gleich('die Verwaltung hört die Schul-Fassung', 'schule',
       pu_medien_zielgruppe(['rolle' => 'verwaltung']));

bilanz();
