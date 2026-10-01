<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — der Knopf „Community“ der Werkstatt (Plan 30_Community):
 * Zugang (Registrierung, Abo), Einlassmarke, Ziel der Weiterleitung.
 *
 * Läuft ohne Server: `PU_RELAY_SENDER` spielt ihn. Geprüft wird vor allem,
 * was nicht passieren darf: ein Einlass ohne Abo, ein Name in der Anfrage,
 * eine Antwort des Servers, die ungeprüft in die Kopfzeile `Location` käme.
 *
 * Aufruf:
 *     php -d extension=pdo_sqlite -d extension=sqlite3 -d extension=sodium -d extension=mbstring
 *         -d extension=zip -d extension=gd tests/gemeinde_einlass_test.php
 */

require_once __DIR__ . '/hilfe.php';
$db_datei = test_db_vorbereiten();

$ordner = sys_get_temp_dir() . '/pu_ge_' . bin2hex(random_bytes(6));
putenv('PU_TEST_IDENT=' . $ordner);
putenv('PU_TEST_ENV=' . sys_get_temp_dir() . '/pu_ge_' . bin2hex(random_bytes(6)) . '.env');
register_shutdown_function(static function () use ($ordner, $db_datei) {
    if (is_dir($ordner)) {
        $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($ordner, FilesystemIterator::SKIP_DOTS),
            RecursiveIteratorIterator::CHILD_FIRST);
        foreach ($it as $f) {
            $f->isDir() ? @rmdir($f->getPathname()) : @unlink($f->getPathname());
        }
        @rmdir($ordner);
    }
    @unlink($db_datei);
});

require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../srv/rechte.php';
require_once __DIR__ . '/../srv/lernende.php';
require_once __DIR__ . '/../srv/profil.php';
require_once __DIR__ . '/../srv/abo.php';
require_once __DIR__ . '/../srv/gemeinde.php';
if (!extension_loaded('sodium')) {
    echo "\nsodium fehlt — Aufruf mit  -d extension=sodium\n";
    exit(2);
}

// ── Der Server, nachgespielt ─────────────────────────────────────────────────
$GLOBALS['rufe'] = [];
$GLOBALS['antworten'] = [];
$GLOBALS['PU_RELAY_SENDER'] = static function (string $json): array {
    $a = json_decode($json, true);
    $rumpf = json_decode((string)$a['rumpf'], true);
    $GLOBALS['rufe'][] = ['zweck' => $rumpf['zweck'], 'nutzlast' => $rumpf['nutzlast'] ?? [], 'roh' => $json];
    $f = $GLOBALS['antworten'][$rumpf['zweck']] ?? static fn() => ['ok' => false, 'grund' => 'unbekannter_zweck'];
    return ['status' => 200, 'rumpf' => (string)json_encode($f($rumpf['nutzlast'] ?? [], $rumpf))];
};
$vps = sodium_crypto_sign_keypair();
putenv('PU_RELAY_URL=https://relay.example.test/relay/');
putenv('PU_VPS_SCHLUESSEL=' . base64_encode(sodium_crypto_sign_publickey($vps)));
$GLOBALS['antworten']['registrieren'] = static function (array $n, array $rumpf) use ($vps): array {
    $b = ['iid' => $rumpf['iid'], 'mandant' => 'M-TEST', 'plan' => 'schule',
          'gueltig_bis' => gmdate('Y-m-d\TH:i:s\Z', time() + 30 * 86400), 'kid' => 'web-1'];
    return ['ok' => true, 'bescheinigung' => $b,
            'signatur' => base64_encode(sodium_crypto_sign_detached(pu_ident_kanonisch($b), sodium_crypto_sign_secretkey($vps)))];
};
$GLOBALS['antworten']['konten'] = static fn(array $n) => ['ok' => true, 'topf' => 0,
    'konten' => array_map(static fn($k) => ['konto' => $k['konto'], 'rolle' => $k['rolle'], 'aktiv' => true, 'tokens' => 0], $n['konten'])];
$GLOBALS['antworten']['rufname'] = static fn(array $n) => ['ok' => true, 'rufname' => $n['rufname']];
$marke = rtrim(strtr(base64_encode(random_bytes(32)), '+/', '-_'), '=');
$GLOBALS['antworten']['einlass_holen'] = static fn(array $n) => ['ok' => true, 'marke' => $GLOBALS['marke'], 'gilt_sek' => 60];
$GLOBALS['marke'] = $marke;

/** Nur die Aufrufe eines Zwecks. */
function rufe(string $zweck): array
{
    return array_values(array_filter($GLOBALS['rufe'], static fn($r) => $r['zweck'] === $zweck));
}

// ── Personen ─────────────────────────────────────────────────────────────────
$chef   = pu_lernenden_anlegen('chef', 'Chef Beispiel', 'geheim1234', 'admin');
$lehrer = pu_lernenden_anlegen('lehrkraft', 'Frau Lehrerin', 'geheim1234', 'lehrer');
$nele   = pu_lernenden_anlegen('nele', 'Nele Beispiel', 'geheim1234', 'schueler');
$tim    = pu_lernenden_anlegen('tim', 'Tim Beispiel', 'geheim1234', 'schueler');
$ich = static fn(int $id) => ['id' => $id];

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Zugang ohne Registrierung');

gleich('Schüler: nicht registriert', 'nicht_registriert', pu_gem_zugang($nele)['grund']);
gleich('Admin: Community braucht die Registrierung', 'nicht_registriert', pu_gem_zugang($chef)['grund']);
pruefe('Admin: Werkstatt geht auch ohne', pu_gem_zugang($chef, true)['ok']);
gleich('Schüler: Werkstatt nicht ohne', 'nicht_registriert', pu_gem_zugang($nele, true)['grund']);
$r = pu_gem_einlass($ich($nele), 'olymp');
pruefe('Einlass ohne Registrierung: Werbe-Modal', !$r['ok'] && !empty($r['werbung']));
gleich('… und keine Anfrage hinaus', 0, count($GLOBALS['rufe']));

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Zugang mit Registrierung');

pruefe('registriert', pu_relay_registrieren('AAAAA-BBBBB-CCCCC-DDDDD')['ok'] === true);
gleich('Schüler ohne Abo', 'kein_abo', pu_gem_zugang($nele)['grund']);
gleich('… auch nicht in die Werkstatt', 'kein_abo', pu_gem_zugang($nele, true)['grund']);
pruefe('Admin braucht kein Abo', pu_gem_zugang($chef)['ok']);
$r = pu_gem_einlass($ich($nele), 'olymp');
pruefe('ohne Abo: Werbe-Modal', !$r['ok'] && !empty($r['werbung']) && $r['grund'] === 'kein_abo');
gleich('… und keine Marke geholt', 0, count(rufe('einlass_holen')));

pu_abo_buchen('person', $nele, 'Nele', 'schueler', $chef);
pruefe('eigenes Abo öffnet', pu_gem_zugang($nele)['ok'] && pu_gem_zugang($nele, true)['ok']);
gleich('Tim hat noch keins', 'kein_abo', pu_gem_zugang($tim)['grund']);
pu_db()->prepare("UPDATE lernende SET gruppe = '6a' WHERE id = ?")->execute([$tim]);
pu_abo_buchen('klasse', $lehrer, '6a', 'klasse', $chef);
pruefe('Abo der Klasse öffnet', pu_gem_zugang($tim)['ok']);

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Einlass');

$r = pu_gem_einlass($ich($nele), 'olymp');
gleich('ohne Synonym kein Einlass', 'kein_rufname', $r['grund'] ?? null);
pruefe('… und kein Werbe-Modal (das hilft hier nicht)', empty($r['werbung']));
gleich('… und keine Marke geholt', 0, count(rufe('einlass_holen')));
pruefe('Satz dazu', str_contains(pu_gem_grund_text('kein_rufname'), 'Synonym'));

pu_db()->prepare("UPDATE lernende SET pseudonym = 'Funkenschmied' WHERE id = ?")->execute([$nele]);
$r = pu_gem_einlass($ich($nele), 'olymp');
pruefe('Einlass mit Synonym und Abo', $r['ok'] ?? false, kurz($r));
gleich('Ziel: Community neben dem Relay, Marke und Palette im Fragment',
    'https://relay.example.test/gemeinde/#e=' . $marke . '&v=olymp', $r['ziel'] ?? null);
gleich('Synonym vorher gemeldet', 1, count(rufe('rufname')));
$e = rufe('einlass_holen');
gleich('eine Marke geholt', 1, count($e));
gleich('… mit Pseudonym und Palette', ['konto' => 'L-' . $nele, 'variante' => 'olymp'], $e[0]['nutzlast']);
pruefe('kein Name, keine Kennung in der Anfrage',
    !str_contains($e[0]['roh'], 'Nele') && !str_contains($e[0]['roh'], '"nele"'));

$r = pu_gem_einlass($ich($nele), 'lila"><script>');
gleich('unbekannte Palette fällt weg', 'https://relay.example.test/gemeinde/#e=' . $marke, $r['ziel'] ?? null);
gleich('… und geht nicht hinaus', ['konto' => 'L-' . $nele], rufe('einlass_holen')[1]['nutzlast']);
gleich('Synonym nur einmal gemeldet', 1, count(rufe('rufname')));

$GLOBALS['marke'] = $marke . "\r\nSet-Cookie: x=1";
$r = pu_gem_einlass($ich($nele), '');
gleich('Marke in falscher Form: nicht in die Kopfzeile', 'marke_form', $r['grund'] ?? null);
pruefe('… kein Ziel', !isset($r['ziel']));
$GLOBALS['marke'] = $marke;

$GLOBALS['antworten']['einlass_holen'] = static fn() => ['ok' => false, 'grund' => 'rufname_fehlt'];
$r = pu_gem_einlass($ich($nele), '');
gleich('Server kennt das Synonym nicht', 'rufname_fehlt', $r['grund'] ?? null);
pruefe('… mit Satz', str_contains(pu_gem_grund_text('rufname_fehlt'), 'Synonym'));
$GLOBALS['antworten']['einlass_holen'] = static fn() => ['ok' => false, 'grund' => 'nicht_freigegeben'];
gleich('Community gesperrt', 'nicht_freigegeben', pu_gem_einlass($ich($nele), '')['grund'] ?? null);

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Adresse und Hinweis');

gleich('Vorgabe', 'https://promptheus-academy.de/gemeinde/',
    (static function () { putenv('PU_RELAY_URL='); return pu_gem_adresse(); })());
putenv('PU_RELAY_URL=http://127.0.0.1:8899/relay/');
gleich('Testserver auf diesem Rechner', 'http://127.0.0.1:8899/gemeinde/', pu_gem_adresse());
putenv('PU_RELAY_URL=https://beispiel.test/academy/relay/');
gleich('Relay in einem Unterordner', 'https://beispiel.test/academy/gemeinde/', pu_gem_adresse());
putenv('PU_RELAY_URL=http://boese.example/relay/');
gleich('fremder Server ohne https: Vorgabe', 'https://promptheus-academy.de/gemeinde/', pu_gem_adresse());

pu_gem_hinweis_setzen('Wähle zuerst dein Synonym.');
gleich('Hinweis kommt einmal', 'Wähle zuerst dein Synonym.', pu_gem_hinweis_nehmen());
gleich('… und dann nicht mehr', '', pu_gem_hinweis_nehmen());

bilanz();
