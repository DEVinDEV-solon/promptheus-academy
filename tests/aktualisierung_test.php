<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Prüfung der Updates in der Academy (Knoten K-NOTIZ und
 * K-EINSPIELEN, vps/Pläne/90_Updates/UPDATE-PLAN.md).
 *
 * Der Update-Server wird nachgespielt (eigenes Schlüsselpaar, eigene Feeds,
 * eigene Pakete); getauscht wird in einem Wegwerfordner, nie in dieser
 * Academy. Geprüft wird vor allem, was nicht gehen darf: ein Feed mit falscher
 * Unterschrift, ein abgelaufener, ein älterer; ein Paket, das nicht zur
 * Unterschrift passt; ein Tausch, der `data/` oder `.env` berührt.
 *
 * Aufruf:
 *     php -d extension=pdo_sqlite -d extension=sqlite3 -d extension=mbstring
 *         -d extension=sodium -d extension=zip tests/aktualisierung_test.php
 */

require_once __DIR__ . '/hilfe.php';

$tmp = sys_get_temp_dir() . '/pu_akt_' . bin2hex(random_bytes(6));
@mkdir($tmp . '/akt', 0775, true);
@mkdir($tmp . '/ident', 0775, true);
file_put_contents($tmp . '/test.env', "# leer\n");
putenv('PU_TEST_DB=' . $tmp . '/academy.db');
putenv('PU_TEST_ENV=' . $tmp . '/test.env');
putenv('PU_TEST_AKT=' . $tmp . '/akt');
putenv('PU_TEST_IDENT=' . $tmp . '/ident');
putenv('PU_RELAY_URL=');

register_shutdown_function(static function () use ($tmp) {
    $weg = static function (string $p) use (&$weg): void {
        if (is_dir($p) && !is_link($p)) {
            foreach (scandir($p) ?: [] as $e) {
                if ($e !== '.' && $e !== '..') $weg("$p/$e");
            }
            @rmdir($p);
        } else {
            @unlink($p);
        }
    };
    $weg($tmp);
});

if (!extension_loaded('sodium') || !class_exists('ZipArchive')) {
    echo "\nsodium oder zip fehlt — Aufruf mit  -d extension=sodium -d extension=zip\n";
    exit(2);
}

require_once __DIR__ . '/../srv/aktualisierung_tausch.php';
require_once __DIR__ . '/../srv/rechte.php';

// ── Der Server, nachgespielt ────────────────────────────────────────────────
$paar = sodium_crypto_sign_keypair();
$sk = sodium_crypto_sign_secretkey($paar);
putenv('PU_AKT_OEFFENTLICH=rel-1:' . base64_encode(sodium_crypto_sign_publickey($paar)));

function feed(string $sk, array $fassungen, int $gueltig = 86400, ?string $erstellt = null, string $kid = 'rel-1'): array
{
    $rumpf = json_encode(['feed' => 1, 'kid' => $kid, 'kanal' => 'stabil',
        'erstellt' => $erstellt ?? gmdate('Y-m-d\TH:i:s\Z'), 'gueltig_bis' => gmdate('Y-m-d\TH:i:s\Z', time() + $gueltig),
        'fassungen' => $fassungen], JSON_UNESCAPED_SLASHES);
    return ['rumpf' => $rumpf, 'signatur' => base64_encode(sodium_crypto_sign_detached($rumpf, $sk)), 'kid' => $kid];
}

function eintrag(string $f, string $sha = '', int $anteil = 100, string $min = '0.0.0', bool $wichtig = false, int $groesse = 10): array
{
    return ['fassung' => $f, 'sha256' => $sha !== '' ? $sha : str_repeat('a', 64), 'groesse' => $groesse, 'anteil' => $anteil,
            'mindestens' => $min, 'wichtig' => $wichtig, 'hinweise' => "Neu in $f", 'datum' => gmdate('Y-m-d\TH:i:s\Z'), 'kanal' => 'stabil'];
}

function paket(string $ziel, string $f, array $dateien, string $min = '0.0.0', ?callable $verderben = null): string
{
    $m = ['paket' => 1, 'fassung' => $f, 'mindestens' => $min, 'dateien' => []];
    foreach ($dateien as $p => $inhalt) $m['dateien'][$p] = hash('sha256', $inhalt);
    if ($verderben) $verderben($m, $dateien);
    @unlink($ziel);
    $z = new ZipArchive();
    $z->open($ziel, ZipArchive::CREATE);
    $z->addFromString('manifest.json', json_encode($m, JSON_UNESCAPED_SLASHES));
    foreach ($dateien as $p => $inhalt) $z->addFromString($p, $inhalt);
    $z->close();
    return $ziel;
}

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Fassung und Adresse');

pruefe('pu_fassung liest VERSION', pu_akt_fassung_ok(pu_fassung()), pu_fassung());
gleich('Vorgabe-Adresse', 'https://promptheus-academy.de/aktualisierung/', pu_akt_url());
putenv('PU_AKTUALISIERUNG_URL=http://boese.example/aktualisierung');
gleich('http zu fremdem Host: zurück zur Vorgabe', PU_AKT_URL_VORGABE, pu_akt_url());
putenv('PU_AKTUALISIERUNG_URL=http://127.0.0.1:8870/aktualisierung');
gleich('http zu 127.0.0.1 (Probelauf) erlaubt', 'http://127.0.0.1:8870/aktualisierung/', pu_akt_url());
putenv('PU_AKTUALISIERUNG_URL=');
gleich('Kanal ohne .env: stabil', 'stabil', pu_akt_kanal());
putenv('PU_UPDATE_KANAL=alles');
gleich('krummer Kanal: stabil', 'stabil', pu_akt_kanal());
putenv('PU_UPDATE_KANAL=');
$e1 = pu_akt_eimer();
pruefe('Eimer liegt zwischen 0 und 99', $e1 >= 0 && $e1 <= 99);
gleich('und bleibt derselbe', $e1, pu_akt_eimer());

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Feed prüfen');

$gut = feed($sk, [eintrag('1.1.0')]);
pruefe('echter Feed: angenommen', pu_akt_feed_pruefen($gut)['ok']);
$fremd = feed(sodium_crypto_sign_secretkey(sodium_crypto_sign_keypair()), [eintrag('1.1.0')]);
gleich('fremder Schlüssel: signatur', 'signatur', pu_akt_feed_pruefen($fremd)['grund']);
$verbogen = $gut;
$verbogen['rumpf'] = str_replace('"anteil":100', '"anteil":99', $gut['rumpf']);
gleich('veränderter Rumpf: signatur', 'signatur', pu_akt_feed_pruefen($verbogen)['grund']);
gleich('unbekannte Kennung: abgewiesen', 'schluessel_unbekannt', pu_akt_feed_pruefen(feed($sk, [], 86400, null, 'rel-9'))['grund']);
gleich('abgelaufen: abgewiesen', 'abgelaufen', pu_akt_feed_pruefen(feed($sk, [], -10))['grund']);
gleich('älter als der letzte: abgewiesen', 'aelter',
       pu_akt_feed_pruefen(feed($sk, [], 86400, '2026-01-01T00:00:00Z'), '2026-06-01T00:00:00Z')['grund']);
gleich('ohne Unterschrift: abgewiesen', 'signatur', pu_akt_feed_pruefen(['rumpf' => $gut['rumpf'], 'signatur' => '', 'kid' => 'rel-1'])['grund']);

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Angebot');

$r = json_decode($gut['rumpf'], true);
gleich('1.1.0 für 1.0.0', '1.1.0', pu_akt_angebot($r, '1.0.0', 50)['fassung'] ?? null);
gleich('nichts für 1.1.0', null, pu_akt_angebot($r, '1.1.0', 50));
gleich('nichts für 1.2.0 (keine Rückwärtsfassung)', null, pu_akt_angebot($r, '1.2.0', 50));
$r = ['fassungen' => [eintrag('1.1.0', '', 30), eintrag('1.2.0', '', 100, '1.1.0'), eintrag('1.0.5')]];
gleich('Anteil 30 %, Eimer 29: bekommt 1.1.0', '1.1.0', pu_akt_angebot($r, '1.0.0', 29)['fassung'] ?? null);
gleich('Anteil 30 %, Eimer 30: bekommt nur 1.0.5', '1.0.5', pu_akt_angebot($r, '1.0.0', 30)['fassung'] ?? null);
gleich('mindestens 1.1.0: 1.1.0 bekommt 1.2.0', '1.2.0', pu_akt_angebot($r, '1.1.0', 99)['fassung'] ?? null);
gleich('krumme SHA: übergangen', null, pu_akt_angebot(['fassungen' => [eintrag('2.0.0', 'xyz')]], '1.0.0', 0));

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Nachsehen (anonym) und Notiz');

$gesendet = [];
$feed_jetzt = $gut;
$GLOBALS['PU_AKT_SENDER'] = static function (string $url, ?string $post, ?string $ziel) use (&$gesendet, &$feed_jetzt): array {
    $gesendet[] = [$url, $post];
    if (str_contains($url, '?kanal=')) {
        return ['status' => 200, 'rumpf' => json_encode(['ok' => true] + $feed_jetzt)];
    }
    return ['status' => 404, 'rumpf' => ''];
};
$eigene = pu_fassung();
$feed_jetzt = feed($sk, [eintrag('9.0.0', '', 100)]);
$s = pu_akt_pruefen(true);
gleich('Angebot 9.0.0 liegt im Stand', '9.0.0', $s['angebot']['fassung'] ?? null);
gleich('anonym, per GET mit Kanal', [PU_AKT_URL_VORGABE . '?kanal=stabil', null], $gesendet[0]);
pruefe('nichts aus der Datenbank geht mit', !str_contains($gesendet[0][0], 'lern'));
$anzahl = count($gesendet);
pu_akt_pruefen();
gleich('nicht fällig: keine zweite Nachfrage', $anzahl, count($gesendet));

$o = pu_akt_oberflaeche(1);
pruefe('Oberfläche: Angebot, nicht ausgeblendet', ($o['angebot']['fassung'] ?? '') === '9.0.0' && !$o['ausgeblendet']);
pu_akt_ausblenden(1, '9.0.0');
pruefe('× blendet für diese Person aus', pu_akt_oberflaeche(1)['ausgeblendet']);
pruefe('… nicht für eine andere', !pu_akt_oberflaeche(2)['ausgeblendet']);

$feed_jetzt = feed($sk, [eintrag('9.0.1', '', 100, '0.0.0', true)]);
pu_akt_pruefen(true);
pruefe('neue Fassung: Notiz wieder da', !pu_akt_oberflaeche(1)['ausgeblendet']);
pu_akt_ausblenden(1, '9.0.1');
pruefe('wichtig: × gilt für heute', pu_akt_oberflaeche(1)['ausgeblendet']);
pu_setting_setzen('update_aus_1', '9.0.1|' . (time() - 90000));
pruefe('wichtig: am nächsten Tag wieder da', !pu_akt_oberflaeche(1)['ausgeblendet']);

$feed_jetzt = $fremd;
$s = pu_akt_pruefen(true);
gleich('gefälschter Feed: Fehler signatur', 'signatur', $s['fehler']);
pruefe('… und ein Fehler hält die nächste Frage eine Stunde auf', $s['naechste'] >= time() + 3500);

$feed_jetzt = feed($sk, [], 86400, '2020-01-01T00:00:00Z');
gleich('ein alter Feed wird nach einem neueren verworfen', 'aelter', pu_akt_pruefen(true)['fehler']);

pu_einst_global_setzen('update_pruefen', 'aus');
pu_setting_setzen('update_stand', json_encode(['naechste' => 0] + pu_akt_stand()));
$anzahl = count($gesendet);
pu_akt_pruefen();
gleich('automatisch aus: keine Nachfrage von selbst', $anzahl, count($gesendet));
pu_einst_global_setzen('update_pruefen', 'an');

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Laden und bereitlegen');

$dateien = ['index.php' => "<?php echo 'neu';\n", 'srv/neu.php' => "<?php // neu\n", 'VERSION' => "9.1.0\n"];
$zipdatei = paket($tmp . '/p.zip', '9.1.0', $dateien);
$inhalt = (string)file_get_contents($zipdatei);
$liefern = $inhalt;
$GLOBALS['PU_AKT_SENDER'] = static function (string $url, ?string $post, ?string $ziel) use (&$feed_jetzt, &$liefern, &$gesendet): array {
    $gesendet[] = [$url, $post];
    if (str_contains($url, '?kanal=')) {
        return ['status' => 200, 'rumpf' => json_encode(['ok' => true] + $feed_jetzt)];
    }
    if (str_contains($url, 'paket.php?f=9.1.0') && $ziel !== null) {
        file_put_contents($ziel, $liefern);
        return ['status' => 200, 'rumpf' => ''];
    }
    return ['status' => 404, 'rumpf' => ''];
};
$feed_jetzt = feed($sk, [eintrag('9.1.0', hash('sha256', $inhalt), 100, '0.0.0', false, strlen($inhalt))]);
pu_akt_pruefen(true);

$liefern = $inhalt . 'x';
$l = pu_akt_laden();
pruefe('verändertes Paket: verworfen', !$l['ok'] && str_contains($l['meldung'], 'Unterschrift'), $l['meldung']);
pruefe('… nichts bereitgelegt', pu_akt_bereit() === null);

$liefern = $inhalt;
$l = pu_akt_laden();
pruefe('echtes Paket: geladen und bereitgelegt', $l['ok'], $l['meldung']);
gleich('bereit.json nennt 9.1.0', '9.1.0', pu_akt_bereit()['fassung'] ?? null);
pruefe('entpackt und geprüft unter <fassung>/neu', is_file($tmp . '/akt/9.1.0/neu/srv/neu.php'));
pruefe('die Paketadresse kam aus der eigenen Einstellung, nicht aus dem Feed',
       str_starts_with(end($gesendet)[0], PU_AKT_URL_VORGABE . 'paket.php?f=9.1.0'));

// Ein Paket, das signiert ist, aber einen Ausbruch enthält: das Entpacken hält.
$boese = paket($tmp . '/b.zip', '9.2.0', ['index.php' => 'x', '../ausbruch.php' => 'x']);
$e = pu_akt_entpacken($boese, $tmp . '/akt/probe', '9.2.0', '1.0.0');
pruefe('Zip-Slip beim Entpacken: abgewiesen', !$e['ok']);
pruefe('… nichts ausserhalb angelegt', !is_file($tmp . '/akt/ausbruch.php'));
$e = pu_akt_entpacken(paket($tmp . '/c.zip', '9.2.0', ['data/promptheus.db' => 'x']), $tmp . '/akt/probe', '9.2.0', '1.0.0');
pruefe('data/ im Paket: abgewiesen', !$e['ok']);
$e = pu_akt_entpacken(paket($tmp . '/d.zip', '9.2.0', ['index.php' => 'x'], '9.0.0'), $tmp . '/akt/probe', '9.2.0', '1.0.0');
pruefe('„mindestens“ nicht erfüllt: abgewiesen', !$e['ok'], $e['grund']);

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Tausch im Wegwerfordner');

$w = $tmp . '/wurzel';
@mkdir($w . '/data', 0775, true);
@mkdir($w . '/srv', 0775, true);
file_put_contents($w . '/index.php', "<?php echo 'alt';\n");
file_put_contents($w . '/alt.php', "<?php // entfällt\n");
file_put_contents($w . '/VERSION', "1.0.0\n");
file_put_contents($w . '/.env', "PU_GEHEIM=bleibt\n");
file_put_contents($w . '/promptheus-start.bat', "@echo alt\r\n");
file_put_contents($w . '/manifest.json', json_encode(['paket' => 1, 'fassung' => '1.0.0', 'dateien' => [
    'index.php' => hash_file('sha256', $w . '/index.php'), 'alt.php' => hash_file('sha256', $w . '/alt.php'),
    'VERSION' => hash_file('sha256', $w . '/VERSION'), 'promptheus-start.bat' => hash_file('sha256', $w . '/promptheus-start.bat')]]));
$db = $w . '/data/promptheus.db';
$pdo = new PDO('sqlite:' . $db);
$pdo->exec('CREATE TABLE lernende (id INTEGER PRIMARY KEY, name TEXT); INSERT INTO lernende (name) VALUES (\'Probe\'); PRAGMA user_version = 5');
$pdo = null;
$db_vorher = hash_file('sha256', $db);
$env_vorher = hash_file('sha256', $w . '/.env');

// Bereitlegen wie pu_akt_laden, aber für 1.1.0
$neu_dateien = ['index.php' => "<?php echo 'neu';\n", 'srv/neu.php' => "<?php // neu\n", 'VERSION' => "1.1.0\n",
                'promptheus-start.bat' => "@echo neu\r\n"];
$e = pu_akt_entpacken(paket($tmp . '/n.zip', '1.1.0', $neu_dateien), $tmp . '/akt/1.1.0/neu', '1.1.0', '1.0.0');
pruefe('neues Paket entpackt', $e['ok'], $e['grund']);
file_put_contents($tmp . '/akt/bereit.json', json_encode(['fassung' => '1.1.0']));

$t = pu_akt_tausch($w, $tmp . '/akt', $db);
pruefe('Tausch gelingt', $t['ok'], $t['meldung']);
gleich('index.php ist neu', "<?php echo 'neu';\n", file_get_contents($w . '/index.php'));
pruefe('srv/neu.php ist da', is_file($w . '/srv/neu.php'));
pruefe('alt.php ist weg (stand im alten Manifest, fehlt im neuen)', !is_file($w . '/alt.php'));
gleich('VERSION ist 1.1.0', "1.1.0\n", file_get_contents($w . '/VERSION'));
gleich('.env unberührt', $env_vorher, hash_file('sha256', $w . '/.env'));
gleich('Datenbank unberührt', $db_vorher, hash_file('sha256', $db));
gleich('die laufende bat unberührt', "@echo alt\r\n", file_get_contents($w . '/promptheus-start.bat'));
gleich('die neue bat liegt als .neu daneben', "@echo neu\r\n", (string)@file_get_contents($w . '/promptheus-start.bat.neu'));
pruefe('bereit.json ist weg', !is_file($tmp . '/akt/bereit.json'));
pruefe('das Entpackte ist aufgeräumt', !is_dir($tmp . '/akt/1.1.0'));
$sich = pu_akt_sicherungen();
pruefe('eine Sicherung mit Programm und Datenbank', count($sich) === 1
    && is_file($sich[0]['pfad'] . '/programm.zip') && is_file($sich[0]['pfad'] . '/promptheus.db'));
gleich('… von 1.0.0 nach 1.1.0', ['1.0.0', '1.1.0'], [$sich[0]['von'], $sich[0]['nach']]);

// Rückweg
@unlink($w . '/promptheus-start.bat.neu');   // die bat hätte sie beim Neustart verschoben …
file_put_contents($w . '/promptheus-start.bat', "@echo neu\r\n");   // … so
$z = pu_akt_zurueck($w, $tmp . '/akt', $db);
pruefe('Rückweg gelingt', $z['ok'], $z['meldung']);
gleich('index.php wieder alt', "<?php echo 'alt';\n", file_get_contents($w . '/index.php'));
pruefe('alt.php wieder da', is_file($w . '/alt.php'));
pruefe('srv/neu.php wieder weg', !is_file($w . '/srv/neu.php'));
gleich('VERSION wieder 1.0.0', "1.0.0\n", file_get_contents($w . '/VERSION'));
gleich('die alte bat liegt als .neu daneben (die laufende bleibt)', "@echo alt\r\n", (string)@file_get_contents($w . '/promptheus-start.bat.neu'));
gleich('Datenbank unverändert (Schema gleich, nichts zurückgelegt)', $db_vorher, hash_file('sha256', $db));
gleich('.env unberührt', $env_vorher, hash_file('sha256', $w . '/.env'));
gleich('die Sicherung zählt nicht mehr als Rückweg', [], pu_akt_sicherungen());

// Tausch mit Schemaänderung und Rückweg: Datenbank wird zurückgelegt.
@unlink($w . '/promptheus-start.bat.neu');
file_put_contents($w . '/promptheus-start.bat', "@echo alt\r\n");
pu_akt_entpacken(paket($tmp . '/n.zip', '1.1.0', $neu_dateien), $tmp . '/akt/1.1.0/neu', '1.1.0', '1.0.0');
file_put_contents($tmp . '/akt/bereit.json', json_encode(['fassung' => '1.1.0']));
pruefe('zweiter Tausch gelingt', pu_akt_tausch($w, $tmp . '/akt', $db)['ok']);
$pdo = new PDO('sqlite:' . $db);
$pdo->exec('PRAGMA user_version = 6; INSERT INTO lernende (name) VALUES (\'nach dem Update\')');
$pdo = null;
$z = pu_akt_zurueck($w, $tmp . '/akt', $db);
pruefe('Rückweg mit Schemaänderung', $z['ok'] && str_contains($z['meldung'], 'Datenbank'), $z['meldung']);
gleich('Schema wieder 5', 5, pu_akt_db_version($db));
pruefe('die neuere Datenbank bleibt als .nach-1.1.0 liegen', is_file($db . '.nach-1.1.0'));

// Eine Datei lässt sich nicht ersetzen (unter Windows: gesperrt; hier: ein
// Ordner steht im Weg). Der Tausch bricht ab, alles andere wird
// zurückgelegt, VERSION bleibt alt.
@unlink($w . '/promptheus-start.bat.neu');
file_put_contents($w . '/promptheus-start.bat', "@echo alt\r\n");
@mkdir($w . '/srv/zz_gesperrt.php', 0775, true);
file_put_contents($w . '/srv/zz_gesperrt.php/drin', 'x');
$gesperrt = $neu_dateien + ['srv/zz_gesperrt.php' => "<?php // neu\n"];
pu_akt_entpacken(paket($tmp . '/g.zip', '1.1.0', $gesperrt), $tmp . '/akt/1.1.0/neu', '1.1.0', '1.0.0');
file_put_contents($tmp . '/akt/bereit.json', json_encode(['fassung' => '1.1.0']));
$t = pu_akt_tausch($w, $tmp . '/akt', $db);
pruefe('gesperrte Datei: Tausch bricht ab und legt zurück', !$t['ok'] && str_contains($t['meldung'], 'zurückgelegt'), $t['meldung']);
gleich('… index.php wieder alt', "<?php echo 'alt';\n", file_get_contents($w . '/index.php'));
gleich('… VERSION bleibt 1.0.0', "1.0.0\n", file_get_contents($w . '/VERSION'));
pruefe('… srv/neu.php wieder weg', !is_file($w . '/srv/neu.php'));
pruefe('… keine neue bat daneben', !is_file($w . '/promptheus-start.bat.neu'));
@unlink($w . '/srv/zz_gesperrt.php/drin');
@rmdir($w . '/srv/zz_gesperrt.php');

// Ein verändertes Bereitgelegtes wird nicht eingespielt.
pu_akt_entpacken(paket($tmp . '/n.zip', '1.1.0', $neu_dateien), $tmp . '/akt/1.1.0/neu', '1.1.0', '1.0.0');
file_put_contents($tmp . '/akt/1.1.0/neu/index.php', "<?php system('boese');\n");
file_put_contents($tmp . '/akt/bereit.json', json_encode(['fassung' => '1.1.0']));
$t = pu_akt_tausch($w, $tmp . '/akt', $db);
pruefe('verändert zwischen Laden und Neustart: nicht eingespielt', !$t['ok'], $t['meldung']);
gleich('… index.php bleibt alt', "<?php echo 'alt';\n", file_get_contents($w . '/index.php'));
pruefe('… und das Protokoll sagt es', str_contains((string)file_get_contents($tmp . '/akt/protokoll.log'), 'FEHLER'));

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Rechte');

$recht = pu_recht('aktualisierung.verwalten');
pruefe('Recht aktualisierung.verwalten gibt es', $recht !== null);
pruefe('… nur für Ebene 1', !empty($recht['nur_admin']));
$api = (string)file_get_contents(__DIR__ . '/../api.php');
foreach (['update_stand', 'update_suchen', 'update_laden', 'update_neustart', 'update_zurueck',
          'update_ausblenden', 'update_einstellen'] as $a) {
    pruefe("api.php: $a ist bewacht", (bool)preg_match("/case '$a':\\s*\\n\\s*pu_recht_fordern\\('aktualisierung\\.verwalten'\\)/", $api)
        || (bool)preg_match("/case '$a': \\{\\s*\\n\\s*pu_recht_fordern\\('aktualisierung\\.verwalten'\\)/", $api));
}
pruefe('router.php sperrt werkzeuge/ und dist/',
       str_contains((string)file_get_contents(__DIR__ . '/../router.php'), "\$teil === 'werkzeuge'"));

gruppe('Vertrauen für HTTPS');
// Probelauf 27.09.2026: Das PHP von php.net bringt keine CA-Liste mit. Ohne
// Git fand pu_ca_bundle() keine, und jeder Abruf scheiterte still.
pruefe('pu_curl_vertrauen() kommt mit lib.php', function_exists('pu_curl_vertrauen'));
$ch = curl_init('https://127.0.0.1/');
pu_curl_vertrauen($ch);
curl_close($ch);
pruefe('pu_curl_vertrauen() setzt ohne Fehler', true);
foreach (['srv/aktualisierung.php', 'srv/relay.php', 'srv/tutor.php', 'srv/katalog.php', 'srv/stimme.php'] as $f) {
    $t = (string)file_get_contents(__DIR__ . '/../' . $f);
    pruefe("$f: jeder curl-Aufruf geht über pu_curl_vertrauen()",
           substr_count($t, 'curl_init(') === substr_count($t, 'pu_curl_vertrauen($'));
}

bilanz();
