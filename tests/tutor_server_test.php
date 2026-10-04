<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — der Tutor über den Server (Weg `server`, Cockpit-Plan K-RELAY-MODELL).
 *
 * Läuft ohne Server: `PU_RELAY_SENDER` spielt den Relay. Geprüft wird, was
 * im Betrieb teuer wäre, wenn es nicht stimmt:
 *
 *   · der Weg `server` steht erst nach der Registrierung zur Wahl
 *   · `auto` nimmt einen eigenen Schlüssel vor dem Server, den Server vor der CLI
 *   · über den Server bucht nur der Server — lokal entsteht keine zweite Zahl
 *   · das lokale Tor sperrt den Server-Weg nicht (der Server ist das Tor)
 *   · mit geht ein Pseudonym (`L-<Nummer>`), nie die Kennung
 *
 * Aufruf:
 *     php -d extension=pdo_sqlite -d extension=sqlite3 -d extension=sodium -d extension=mbstring tests/tutor_server_test.php
 */

require_once __DIR__ . '/hilfe.php';
test_db_vorbereiten();

$ordner = sys_get_temp_dir() . '/pu_ts_' . bin2hex(random_bytes(6));
putenv('PU_TEST_IDENT=' . $ordner);
putenv('PU_TEST_ENV=' . sys_get_temp_dir() . '/pu_ts_' . bin2hex(random_bytes(6)) . '.env');
putenv('PU_OPENROUTER_API_KEY=');
register_shutdown_function(static function () use ($ordner) {
    foreach (glob($ordner . '/*') ?: [] as $f) { @unlink($f); }
    @rmdir($ordner);
    foreach ([getenv('PU_TEST_DB'), getenv('PU_TEST_ENV')] as $f) {
        if (is_string($f) && $f !== '') { @unlink($f); }
    }
});

require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../srv/rechte.php';
require_once __DIR__ . '/../srv/lernende.php';
require_once __DIR__ . '/../srv/profil.php';
require_once __DIR__ . '/../srv/abo.php';
require_once __DIR__ . '/../srv/tutor.php';
require_once __DIR__ . '/../srv/relay.php';

if (!pu_ident_bereit()) {
    echo "\nsodium fehlt.\n";
    exit(2);
}

// ── Der Relay, nachgespielt ──────────────────────────────────────────────────
$GLOBALS['rufe'] = [];
function relay(callable $antwort): void
{
    $GLOBALS['PU_RELAY_SENDER'] = static function (string $json) use ($antwort): array {
        $a = json_decode($json, true);
        $GLOBALS['rufe'][] = $a;
        return $antwort(json_decode((string)$a['rumpf'], true));
    };
}

$vps = sodium_crypto_sign_keypair();
$vps_pk = base64_encode(sodium_crypto_sign_publickey($vps));

$ich = pu_lernenden_anlegen('nele', 'Nele Beispiel', 'geheim1234', 'schueler');
pu_profil_setzen($ich, 'pseudonym', 'Funkenfalke');

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Vor der Registrierung');

putenv('PU_RELAY_URL=https://relay.example.test/relay/');
pruefe('der Server steht nicht zur Wahl', pu_server_bereit() === false);
pu_einst_global_setzen('tutor_weg', 'server');
gleich('„server“ gewünscht, aber nicht registriert → kein Weg', '', pu_tutor_weg());
gleich('… und keine Netzanfrage dafür', 0, count($GLOBALS['rufe']));
pu_einst_global_setzen('tutor_weg', 'auto');

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Registrieren');

relay(static function (array $rumpf) use ($vps): array {
    $b = ['iid' => $rumpf['iid'], 'mandant' => 'M-TEST', 'plan' => 'schule',
          'gueltig_bis' => gmdate('Y-m-d\TH:i:s\Z', time() + 30 * 86400), 'kid' => 'web-1'];
    return ['status' => 200, 'rumpf' => json_encode(['ok' => true, 'bescheinigung' => $b,
        'signatur' => base64_encode(sodium_crypto_sign_detached(pu_ident_kanonisch($b),
            sodium_crypto_sign_secretkey($vps)))])];
});
putenv('PU_VPS_SCHLUESSEL=' . $vps_pk);
$r = pu_relay_registrieren('AAAAA-BBBBB-CCCCC-DDDDD');
pruefe('registriert', $r['ok'] === true, (string)($r['grund'] ?? ''));
pruefe('jetzt steht der Server zur Wahl', pu_server_bereit());
gleich('auto ohne eigenen Schlüssel → Server', 'server', pu_tutor_weg());
gleich('Modellanzeige: Vorgabe des Tarifs', 'Vorgabe des Tarifs', pu_tutor_modell());

putenv('PU_OPENROUTER_API_KEY=sk-or-test-nicht-echt');
gleich('auto mit eigenem Schlüssel → OpenRouter', 'openrouter', pu_tutor_weg());
pu_einst_global_setzen('tutor_weg', 'server');
gleich('ausdrücklich „server“ → Server, auch mit eigenem Schlüssel', 'server', pu_tutor_weg());
putenv('PU_OPENROUTER_API_KEY=');
pu_einst_global_setzen('tutor_weg', 'auto');

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Tutor über den Server');

$GLOBALS['rufe'] = [];
relay(static fn(array $rumpf): array => ['status' => 200, 'rumpf' => json_encode([
    'ok' => true, 'antwort' => 'Ein Token ist ein Stück Text.', 'modell' => 'anthropic/claude-haiku-4.5',
    'verbrauch' => ['eingabe' => 900, 'ausgabe' => 40, 'gesamt' => 940, 'geschaetzt' => false, 'buchung' => 7],
    'stand' => ['tokens' => 99060, 'heute' => 940, 'tagesdeckel' => 0]])]);

$zeilen = static function () use ($ich): int {
    $st = pu_db()->prepare("SELECT COUNT(*) FROM token_buchungen WHERE lernender = ? AND art = 'verbrauch'");
    $st->execute([$ich]);
    return (int)$st->fetchColumn();
};
$vorher = $zeilen();
$e = pu_tutor_fragen($ich, 'prometheus', 'Was ist ein Token?');
pruefe('der Tutor antwortet', $e['ok'] === true, (string)($e['fehler'] ?? ''));
gleich('mit der Antwort vom Server', 'Ein Token ist ein Stück Text.', $e['text']);
pruefe('als Server-Antwort erkennbar', ($e['server'] ?? false) === true);
gleich('der Stand laut Server kommt mit', 99060, $e['server_stand']['tokens'] ?? -1);
gleich('lokal wird NICHT gebucht (der Server hat gebucht)', $vorher, $zeilen());
gleich('ein Aufruf', 1, count($GLOBALS['rufe']));

$rumpf = json_decode((string)$GLOBALS['rufe'][0]['rumpf'], true);
gleich('Zweck modell', 'modell', $rumpf['zweck']);
gleich('Konto als Pseudonym', 'L-' . $ich, $rumpf['nutzlast']['konto']);
gleich('Systemtext und Frage als zwei Nachrichten', ['system', 'user'],
    array_column($rumpf['nutzlast']['nachrichten'], 'rolle'));
pruefe('die Frage steht drin', str_contains($rumpf['nutzlast']['nachrichten'][1]['text'], 'Was ist ein Token?'));
pruefe('angeredet wird mit dem Pseudonym', str_contains($rumpf['nutzlast']['nachrichten'][0]['text'], 'Funkenfalke'));
pruefe('der Klarname geht nicht mit', !str_contains($GLOBALS['rufe'][0]['rumpf'], 'Nele Beispiel'));
pruefe('die Kennung geht nicht mit', !preg_match('/\bnele\b/', $GLOBALS['rufe'][0]['rumpf']));
pruefe('kein Modell vorgegeben (der Tarif entscheidet)', !isset($rumpf['nutzlast']['modell']));

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Der Server ist das Tor');

// Lokal tief im Minus: das lokale Tor stünde auf „stopp“.
pu_token_verbrauchen($ich, 'Test: lokal leer', 5_000_000);
pruefe('lokal steht das Tor auf stopp', pu_token_tor($ich)['offen'] === false);
$GLOBALS['rufe'] = [];
$e = pu_tutor_fragen($ich, 'prometheus', 'Und jetzt?');
pruefe('über den Server wird trotzdem gefragt', $e['ok'] === true && count($GLOBALS['rufe']) === 1);

relay(static fn(array $rumpf): array => ['status' => 402,
    'rumpf' => json_encode(['ok' => false, 'grund' => 'kein_guthaben'])]);
$vorher = $zeilen();
$e = pu_tutor_fragen($ich, 'prometheus', 'Noch eine?');
pruefe('kein Guthaben auf dem Server → keine Antwort', $e['ok'] === false);
pruefe('… mit einem Satz dazu', str_contains($e['fehler'], 'Guthaben'), $e['fehler']);
gleich('… und lokal nichts gebucht', $vorher, $zeilen());

relay(static fn(array $rumpf): array => ['status' => 502,
    'rumpf' => json_encode(['ok' => false, 'grund' => 'modell_fehler'])]);
$GLOBALS['rufe'] = [];
$e = pu_tutor_fragen($ich, 'prometheus', 'Hallo?');
pruefe('Modellfehler → keine Antwort', $e['ok'] === false);
gleich('… und nur ein Versuch', 1, count($GLOBALS['rufe']));

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Andere Wege buchen weiter lokal');

// Mit eigenem Schlüssel ist OpenRouter der Weg — und das lokale Tor gilt wieder.
putenv('PU_OPENROUTER_API_KEY=sk-or-test-nicht-echt');
$GLOBALS['rufe'] = [];
$e = pu_tutor_fragen($ich, 'prometheus', 'Geht das?');
pruefe('lokal im Minus + eigener Schlüssel → das lokale Tor sperrt', $e['ok'] === false && isset($e['stopp']));
gleich('… und nichts geht an den Server', 0, count($GLOBALS['rufe']));
putenv('PU_OPENROUTER_API_KEY=');

// ================================================================ Tutor-Modell fest
gruppe('Tutor-Modell fest (30.09.2026)');

gleich('die Tutoren laufen über OpenRouter mit GPT-4o-mini', 'openai/gpt-4o-mini', pu_or_modell());
pu_einst_global_setzen('or_modell', 'anthropic/claude-opus-5');
gleich('eine Einstellung ändert das Modell nicht', 'openai/gpt-4o-mini', pu_or_modell());
putenv('PU_OPENROUTER_MODELL=anthropic/claude-opus-5');
gleich('die .env auch nicht', 'openai/gpt-4o-mini', pu_or_modell());
putenv('PU_OPENROUTER_MODELL');
pu_einst_global_setzen('or_modell', '');

bilanz();
