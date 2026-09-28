<?php
declare(strict_types=1);
/**
 * Die Rolle kommt aus der Registrierung (Entscheid des Betreibers 28.09.2026).
 *
 * Die Aussagen, an denen es hängt:
 *
 *   · ohne Bescheinigung ist jedes Konto Schüler — was immer in der DB steht
 *   · die Art der Registrierung legt fest, welche Ebenen es hier gibt
 *   · Verwaltung und Eltern geben nur weiter, was sie selbst haben, und nie
 *     an die eigene Spalte
 *   · der Server-Schlüssel steht im Programm, nicht in der .env
 */
require_once __DIR__ . '/hilfe.php';
test_db_vorbereiten();

require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../srv/rechte.php';
require_once __DIR__ . '/../srv/lernende.php';
require_once __DIR__ . '/../srv/identitaet.php';

$als = static fn(string $rolle): array => ['id' => 0, 'rolle' => $rolle];

// ================================================================ Ohne Registrierung
gruppe('Ohne Registrierung ist jeder Schüler');
$GLOBALS['PU_TEST_ART'] = '';
gleich('Art ist leer', '', pu_art());
foreach (['admin', 'verwaltung', 'lehrer', 'eltern', 'schueler'] as $r) {
    gleich("DB „$r“ wirkt als Schüler", 'schueler', pu_ebene($als($r)));
}
pruefe('…und darf keinen Tutor-Schlüssel eintragen', !pu_recht_hat('ki.einstellungen', $als('admin')));
pruefe('…und keine Rechte verteilen', !pu_recht_hat('rechte.einstellungen', $als('admin')));
pruefe('…und keine Konten anlegen', !pu_recht_hat('lernende.manage', $als('admin')));

// ================================================================ Familie
gruppe('Registriert als Eltern (Familie)');
$GLOBALS['PU_TEST_ART'] = 'eltern';
gleich('Inhaber ist Eltern', 'eltern', pu_art_inhaber());
gleich('altes admin wird Eltern', 'eltern', pu_ebene($als('admin')));
gleich('Lehrer gibt es in der Familie nicht', 'schueler', pu_ebene($als('lehrer')));
gleich('Verwaltung auch nicht', 'schueler', pu_ebene($als('verwaltung')));
gleich('Kind bleibt Schüler', 'schueler', pu_ebene($als('schueler')));
pruefe('Eltern tragen den Tutor-Schlüssel ein', pu_recht_hat('ki.einstellungen', $als('eltern')));
pruefe('Eltern spielen Updates ein', pu_recht_hat('aktualisierung.verwalten', $als('eltern')));
pruefe('Eltern verteilen Rechte', pu_recht_hat('rechte.einstellungen', $als('eltern')));
pruefe('Kind trägt ab Werk keinen Schlüssel ein', !pu_recht_hat('ki.einstellungen', $als('schueler')));

// Weitergeben: an das Kind ja, an sich selbst nein, Fremdes nein.
$eltern = $als('eltern');
$geht = static function (string $ebene, string $recht) use ($eltern): string {
    try { pu_recht_setzen_darf($ebene, $recht, $eltern); return 'ja'; }
    catch (RuntimeException $f) { return $f->getMessage(); }
};
gleich('Eltern geben dem Kind den Schlüssel', 'ja', $geht('schueler', 'ki.einstellungen'));
pruefe('…nicht an die eigene Spalte', str_contains($geht('eltern', 'klassen.view'), 'eigene Spalte'));
pruefe('…nichts, was sie selbst nicht haben', str_contains($geht('schueler', 'klassen.view'), 'selbst hat'));
pruefe('…nicht das Recht, Rechte zu verteilen', str_contains($geht('schueler', 'rechte.einstellungen'), 'Ebene 1'));
pruefe('…nicht an Ebenen, die es hier nicht gibt', str_contains($geht('lehrer', 'ki.einstellungen'), 'nicht'));

pu_recht_setzen('schueler', 'ki.einstellungen', true, 1, $eltern);
pruefe('nach dem Umlegen darf das Kind', pu_recht_hat('ki.einstellungen', $als('schueler')));
pu_recht_setzen('schueler', 'ki.einstellungen', false, 1, $eltern);
pruefe('…und wieder nicht', !pu_recht_hat('ki.einstellungen', $als('schueler')));

// ================================================================ Schule
gruppe('Registriert als Schule');
$GLOBALS['PU_TEST_ART'] = 'schule';
gleich('altes admin wird Verwaltung', 'verwaltung', pu_ebene($als('admin')));
gleich('Lehrer bleibt Lehrer', 'lehrer', pu_ebene($als('lehrer')));
pruefe('Lehrer tragen keinen Schlüssel ein', !pu_recht_hat('ki.einstellungen', $als('lehrer')));
pruefe('Verwaltung trägt ihn ein', pu_recht_hat('ki.einstellungen', $als('verwaltung')));
pruefe('Plattformrechte bleiben beim Betreiber', !pu_recht_hat('persona.nutzen', $als('verwaltung'))
       && !pu_recht_hat('abo.bestaetigen', $als('verwaltung')));

gruppe('Konten anlegen: nie höher als die eigene Ebene');
pruefe('Lehrer legt keine Verwaltung an', !in_array('verwaltung', PU_ANLEGEN['lehrer'], true));
pruefe('Eltern legen keine Lehrer an', !in_array('lehrer', PU_ANLEGEN['eltern'], true));
pruefe('Schüler legen nichts an', PU_ANLEGEN['schueler'] === []);
$api = (string)file_get_contents(__DIR__ . '/../api.php');
pruefe('api.php: konto_anlegen prüft PU_ANLEGEN',
       (bool)preg_match("/case 'konto_anlegen'.{0,400}PU_ANLEGEN/s", $api));

// ================================================================ Ersteinrichtung
gruppe('Ersteinrichtung und Registrierung');
pruefe('api.php: einrichten legt einen Schüler an',
       (bool)preg_match("/case 'einrichten'.{0,900}'schueler'\s*\)/s", $api));
pruefe('api.php: registrieren setzt den Inhaber',
       (bool)preg_match("/case 'relay_registrieren'.{0,900}pu_art_inhaber/s", $api));
pruefe('api.php: rollen_erklaert ohne Recht lesbar',
       (bool)preg_match("/case 'rollen_erklaert':\s*\n?\s*pu_json_out/s", str_replace("\r", '', $api)));

// ================================================================ Schlüssel
gruppe('Der Server-Schlüssel steht im Programm');
putenv('PU_VPS_SCHLUESSEL=' . base64_encode(random_bytes(32)));
$GLOBALS['PU_TEST_MODUS'] = false;
gleich('außerhalb des Testlaufs zählt die Umgebung nicht',
       (string)(PU_VPS_SCHLUESSEL['vps-1'] ?? ''), pu_ident_vps_schluessel('vps-1'));
gleich('…und eine fremde Kennung gibt es nicht', '', pu_ident_vps_schluessel('boese-1'));
$GLOBALS['PU_TEST_MODUS'] = true;
putenv('PU_VPS_SCHLUESSEL=');

$relay = (string)file_get_contents(__DIR__ . '/../srv/relay.php');
pruefe('relay.php schreibt keinen Server-Schlüssel mehr in die .env',
       !str_contains($relay, "pu_env_datei_setzen('PU_VPS_SCHLUESSEL'"));
$ident = (string)file_get_contents(__DIR__ . '/../srv/identitaet.php');
pruefe('identitaet.php liest den Schlüssel nicht aus der .env',
       !str_contains($ident, "pu_env('PU_VPS_SCHLUESSEL'"));

bilanz();
