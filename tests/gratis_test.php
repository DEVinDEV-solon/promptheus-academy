<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — der Gratis-Zugang `familie-frei` in der Academy
 * (Plan 20_Geschaeft/FAMILIE-UND-GRATIS-ZUGANG-PLAN.md §3.3).
 *
 * Mit einer signierten Test-Bescheinigung (`plan = familie-frei`, `plan_bis`):
 * Elternkonto und Kinder haben den Familienplan ohne Token, Community und
 * Werkstatt sind offen (die Werkstatt weiter erst nach Kurs 7), das Tor ist
 * nur mit eigenem Schlüssel offen, der Verbrauch wird als „eigen“ gebucht,
 * vier Wochen vor dem Ende kommt die Ankündigung, und nach dem Ende oder dem
 * Widerruf fällt alles auf „ohne Plan“ zurück.
 *
 * Aufruf:
 *     php -d extension=pdo_sqlite -d extension=sqlite3 -d extension=sodium -d extension=mbstring
 *         tests/gratis_test.php
 */

require_once __DIR__ . '/hilfe.php';
$db_datei = test_db_vorbereiten();

$ordner = sys_get_temp_dir() . '/pu_gr_' . bin2hex(random_bytes(6));
$envDatei = sys_get_temp_dir() . '/pu_gr_' . bin2hex(random_bytes(6)) . '.env';
putenv('PU_TEST_IDENT=' . $ordner);
putenv('PU_TEST_ENV=' . $envDatei);
// Der Name des Schlüssels einmal; der Wert entsteht im Lauf und taugt für nichts.
const SCHLUESSEL_NAME = 'PU_OPENROUTER' . '_API_KEY';
putenv(SCHLUESSEL_NAME . '=');
register_shutdown_function(static function () use ($ordner, $db_datei, $envDatei) {
    if (is_dir($ordner)) {
        $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($ordner, FilesystemIterator::SKIP_DOTS),
            RecursiveIteratorIterator::CHILD_FIRST);
        foreach ($it as $f) {
            $f->isDir() ? @rmdir($f->getPathname()) : @unlink($f->getPathname());
        }
        @rmdir($ordner);
    }
    @unlink($db_datei);
    @unlink($envDatei);
});

require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../srv/rechte.php';
require_once __DIR__ . '/../srv/lernende.php';
require_once __DIR__ . '/../srv/profil.php';
require_once __DIR__ . '/../srv/abo.php';
require_once __DIR__ . '/../srv/familie.php';
require_once __DIR__ . '/../srv/gemeinde.php';
require_once __DIR__ . '/../srv/coder.php';
if (!extension_loaded('sodium')) {
    echo "\nsodium fehlt — Aufruf mit  -d extension=sodium\n";
    exit(2);
}

$GLOBALS['PU_TEST_ART'] = 'eltern';

// ── Der Server, nachgespielt ─────────────────────────────────────────────────
$vps = sodium_crypto_sign_keypair();
putenv('PU_RELAY_URL=https://relay.example.test/relay/');
putenv('PU_VPS_SCHLUESSEL=' . base64_encode(sodium_crypto_sign_publickey($vps)));

/** Eine Bescheinigung, unterschrieben wie vom Server. `plan_bis` null = ohne Feld. */
function besch(string $vps, string $iid, string $plan, ?string $planBis, int $gueltigSek = 30 * 86400): array
{
    $b = ['iid' => $iid, 'mandant' => 'M-TEST', 'art' => 'eltern', 'plan' => $plan,
          'gueltig_bis' => gmdate('Y-m-d\TH:i:s\Z', time() + $gueltigSek), 'kid' => 'web-1'];
    if ($planBis !== null) $b['plan_bis'] = $planBis;
    return ['bescheinigung' => $b,
            'signatur' => base64_encode(sodium_crypto_sign_detached(pu_ident_kanonisch($b), sodium_crypto_sign_secretkey($vps)))];
}

/** Legt eine neue Bescheinigung ab und liest den Plan neu. */
function setze(string $vps, string $plan, ?string $planBis, int $gueltigSek = 30 * 86400): void
{
    $s = besch($vps, pu_ident_iid(), $plan, $planBis, $gueltigSek);
    if (!pu_ident_bescheinigung_setzen($s['bescheinigung'], $s['signatur'])) {
        throw new RuntimeException('Bescheinigung nicht abgelegt.');
    }
    pu_plan_laut_server(true);
}

$tag = static fn(int $n) => gmdate('Y-m-d', time() + $n * 86400);

$GLOBALS['PU_RELAY_SENDER'] = static function (string $json) use ($vps, $tag): array {
    $a = json_decode($json, true);
    $rumpf = json_decode((string)$a['rumpf'], true);
    $aus = match ($rumpf['zweck']) {
        'registrieren' => ['ok' => true] + besch($vps, $rumpf['iid'], 'familie-frei', $tag(60)),
        'konten'       => ['ok' => true, 'topf' => 0, 'konten' => []],
        default        => ['ok' => false, 'grund' => 'unbekannter_zweck'],
    };
    return ['status' => 200, 'rumpf' => (string)json_encode($aus)];
};

// ── Personen ─────────────────────────────────────────────────────────────────
$mama  = pu_lernenden_anlegen('mama', 'Mama', 'geheim1234', 'eltern');
$papa  = pu_lernenden_anlegen('papa', 'Papa', 'geheim1234', 'eltern');
$a     = pu_lernenden_anlegen('kinda', 'Kind A', 'geheim1234', 'schueler');
$b     = pu_lernenden_anlegen('kindb', 'Kind B', 'geheim1234', 'schueler');
$fremd = pu_lernenden_anlegen('fremd', 'Fremd', 'geheim1234', 'schueler');
pu_eltern_kind_hinzu($mama, $a, $mama);
pu_eltern_kind_hinzu($mama, $b, $mama);

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Ohne Registrierung kein Gratis-Zugang');
gleich('kein Plan laut Server', false, pu_plan_laut_server(true)['gratis']);
gleich('Mama ohne Abo', null, pu_abo_fuer($mama));

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Bescheinigung familie-frei');
pruefe('registriert', pu_relay_registrieren('AAAAA-BBBBB-CCCCC-DDDDD')['ok'] === true);
$s = pu_plan_laut_server(true);
pruefe('gratis laut Server', $s['gratis'] && $s['plan'] === 'familie-frei');
gleich('plan_bis', $tag(60), $s['plan_bis']);
gleich('noch 60 Tage', 60, $s['tage']);

$abo = pu_abo_fuer($mama);
pruefe('Elternkonto hat das Gratis-Abo', ($abo['gratis'] ?? false) === true && $abo['plan'] === 'familie-frei');
gleich('… nicht in der Tabelle (eigene Nummer)', PU_ABO_GRATIS, $abo['id']);
gleich('… keine Token', 0, $abo['kontingent']);
gleich('… 3 Kinderplätze, 2 belegt', [3, 2], [$abo['plaetze'], $abo['belegt']]);
gleich('… kein Preis', 0, $abo['cent']);
pruefe('… bestätigt (nichts zu zahlen)', $abo['bestaetigt'] === true);
pruefe('Kind A hat ihn über die Eltern', !empty(pu_abo_fuer($a)['gratis']));
pruefe('Kind B ebenso', !empty(pu_abo_fuer($b)['gratis']));
gleich('Papa (zweites Elternkonto) nicht', null, pu_abo_fuer($papa));
gleich('fremdes Kind nicht', null, pu_abo_fuer($fremd));
gleich('pu_plan kennt den Plan (Elternplatz)', 1, pu_plan('familie-frei')['eltern']);
pruefe('… steht aber nicht auf der Preistafel', !isset(pu_plaene_heute()['familie-frei']));
wirft('buchen lässt er sich nicht', fn() => pu_abo_buchen('person', $mama, '', 'familie-frei', $mama), 'Gratis-Zugang');

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Community und Werkstatt');
pruefe('Community offen für die Eltern', pu_gem_zugang($mama)['ok']);
pruefe('Community offen für das Kind', pu_gem_zugang($a)['ok']);
pruefe('Werkstatt-Zugang (Abo) offen', pu_gem_zugang($a, true)['ok']);
gleich('fremdes Kind: kein Abo', 'kein_abo', pu_gem_zugang($fremd)['grund']);
gleich('Werkstatt weiter erst nach Kurs 7', false, pu_kurs7_weg($a)['frei']);

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Ohne eigenen Schlüssel ist das Tor zu');
$tor = pu_token_tor($a);
pruefe('zu', $tor['offen'] === false);
gleich('Schild: Schlüssel, nicht Guthaben', 'schluessel', $tor['meldung']['lage'] ?? '');
gleich('Kind bekommt keinen Knopf', '', $tor['meldung']['wege'][0]['knopf'] ?? 'x');
$torM = pu_token_tor($mama);
gleich('Eltern: Knopf in die Einstellungen', 'ki', $torM['meldung']['wege'][0]['einst'] ?? '');
pruefe('… mit Datenschutz-Satz', str_contains($torM['meldung']['wege'][0]['text'] ?? '', 'direkt an OpenRouter'));
gleich('Lage für die Oberfläche', 'schluessel', pu_token_lage($a)['lage']);
pruefe('Probeguthaben öffnet nichts', pu_token_stand($a)['rest'] > 0 && !pu_token_tor($a)['offen']);

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Mit eigenem Schlüssel ist es offen');
putenv(SCHLUESSEL_NAME . '=' . 'probe-' . bin2hex(random_bytes(6)));
pruefe('Schlüssel erkannt', pu_gratis_schluessel_da());
$tor = pu_token_tor($a);
pruefe('offen', $tor['offen'] === true && !empty($tor['eigener_schluessel']));
gleich('Lage', 'eigener_schluessel', pu_token_lage($a)['lage']);
pruefe('Abo meldet den Schlüssel', pu_abo_fuer($mama)['schluessel'] === true);

$restVorher = pu_token_stand($a)['rest'];
pu_token_verbrauchen($a, 'Tutor · Athena', 1200, false, 'openai/gpt-4o-mini');
$zeile = pu_db()->query("SELECT art, abo, tokens FROM token_buchungen WHERE lernender = $a ORDER BY id DESC LIMIT 1")->fetch();
gleich('gebucht als „eigen“', 'eigen', $zeile['art']);
gleich('… am Gratis-Abo', PU_ABO_GRATIS, (int)$zeile['abo']);
gleich('… mit dem Verbrauch', -1200, (int)$zeile['tokens']);
gleich('der Stand bleibt (kein Minus aus fremder Rechnung)', $restVorher, pu_token_stand($a)['rest']);
$cp = pu_cockpit($mama);
pruefe('Cockpit der Eltern zeigt den Verbrauch des Kindes',
       in_array('Tutor · Athena', array_column($cp['verbrauch'], 'wofuer'), true));
$fam = pu_familie_ausgabe($mama);
gleich('„Meine Kinder“ zählt ihn mit', 1200, $fam['kinder'][0]['tokens'] ?? null);
$buch = pu_tokenbuch($mama);
$eigen = array_values(array_filter($buch['buchungen'], static fn($r) => $r['art'] === 'eigen'));
pruefe('Tokenbuch: „eigener Schlüssel“', ($eigen[0]['an'] ?? '') !== '' && str_contains(json_encode($eigen[0]['an']), 'eigener Schl'));

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Ankündigung vier Wochen vorher');
gleich('bei 60 Tagen noch keine', null, pu_gratis_hinweis($mama));
setze($vps, 'familie-frei', $tag(20));
$h = pu_gratis_hinweis($mama);
pruefe('bei 20 Tagen: Ankündigung', $h !== null);
pruefe('… mit Datum', str_contains($h['titel'] ?? '', date('d.m.Y', strtotime($tag(20) . ' 00:00:00 UTC'))));
pruefe('… was endet, bleibt, weitergeht', ($h['endet'] ?? '') !== '' && ($h['bleibt'] ?? '') !== '' && ($h['weiter'] ?? '') !== '');
gleich('nicht für das Kind', null, pu_gratis_hinweis($a));
gleich('nicht für Papa', null, pu_gratis_hinweis($papa));
$jetzt = time();
pu_gratis_hinweis_aus($mama, $jetzt);
gleich('weggeklickt: weg', null, pu_gratis_hinweis($mama, $jetzt + 86400));
pruefe('nach einer Woche wieder da', pu_gratis_hinweis($mama, $jetzt + 8 * 86400) !== null);
gleich('am letzten Tag: 0 Tage', 0, (static function () use ($vps, $tag) {
    setze($vps, 'familie-frei', $tag(0));
    return pu_plan_laut_server()['tage'];
})());
pruefe('… und noch gratis', pu_plan_laut_server()['gratis']);

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Ein gekauftes Abo gilt vor dem Gratis-Zugang');
setze($vps, 'familie-frei', $tag(20));
$kauf = pu_abo_buchen('person', $mama, '', 'familie', $mama);
gleich('Eltern: Familienplan', 'familie', pu_abo_fuer($mama)['plan']);
gleich('Kind: Familienplan der Eltern', 'familie', pu_abo_fuer($a)['plan']);
gleich('keine Ankündigung mehr', null, pu_gratis_hinweis($mama, $jetzt + 30 * 86400));
pruefe('Tor wieder über Token', !isset(pu_token_tor($a)['eigener_schluessel']));
pu_abo_beenden($kauf['id'], $mama);
pruefe('beendet: wieder gratis', !empty(pu_abo_fuer($mama)['gratis']));

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Ende, Widerruf, Grenzfälle');
setze($vps, 'familie-frei', $tag(-1));
$s = pu_plan_laut_server();
pruefe('nach plan_bis: nicht mehr gratis', !$s['gratis'] && $s['abgelaufen']);
gleich('… Eltern ohne Abo', null, pu_abo_fuer($mama));
gleich('… Community zu', 'kein_abo', pu_gem_zugang($a)['grund']);
gleich('… Tor wie ohne Plan (Probeguthaben)', true, pu_token_tor($a)['offen'] && !isset(pu_token_tor($a)['eigener_schluessel']));

setze($vps, 'frei', null);
gleich('Widerruf (Plan „frei“): kein Abo', null, pu_abo_fuer($mama));

setze($vps, 'familie-frei', null);
gleich('familie-frei ohne plan_bis gilt nicht', false, pu_plan_laut_server()['gratis']);

setze($vps, 'familie-frei', 'morgen');
gleich('plan_bis in falscher Form gilt nicht', false, pu_plan_laut_server()['gratis']);

setze($vps, 'familie-frei', $tag(60), -60);
gleich('abgelaufene Bescheinigung: kein Gratis-Zugang', false, pu_plan_laut_server()['gratis']);

setze($vps, 'familie-frei', $tag(60));
$GLOBALS['PU_TEST_ART'] = 'schule';
gleich('nur in einer Familien-Installation', null, pu_abo_fuer($mama));
$GLOBALS['PU_TEST_ART'] = 'eltern';
pruefe('zurück in der Familie: wieder gratis', !empty(pu_abo_fuer($mama)['gratis']));

// Eine Bescheinigung, die nicht vom Server stammt, legt sich gar nicht erst ab.
$falsch = besch($vps, pu_ident_iid(), 'familie-frei', $tag(400));
$fremdSchl = sodium_crypto_sign_keypair();
$falsch['signatur'] = base64_encode(sodium_crypto_sign_detached(pu_ident_kanonisch($falsch['bescheinigung']),
                                    sodium_crypto_sign_secretkey($fremdSchl)));
pruefe('fremde Unterschrift wird abgewiesen', !pu_ident_bescheinigung_setzen($falsch['bescheinigung'], $falsch['signatur']));
gleich('… es gilt weiter die echte', $tag(60), pu_plan_laut_server(true)['plan_bis']);

bilanz();
