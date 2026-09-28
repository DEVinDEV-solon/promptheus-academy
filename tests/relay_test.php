<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Prüfung der Relay-Verbindung (Client-Seite).
 *
 * Läuft ohne Server: `PU_RELAY_SENDER` nimmt die Stelle von curl ein. Damit
 * lässt sich prüfen, was sonst nur im Betrieb auffiele — dass eine 4xx-Antwort
 * nicht wiederholt wird, dass ein untergeschobener Serverschlüssel nicht
 * angenommen wird, und dass ein Netzausfall kein Fehler ist, sondern ein
 * Zustand.
 *
 * Aufruf:
 *     php tests/relay_test.php
 */

require_once __DIR__ . '/hilfe.php';

$ordner = sys_get_temp_dir() . '/pu_rc_' . bin2hex(random_bytes(6));
putenv('PU_TEST_IDENT=' . $ordner);
putenv('PU_TEST_DB=' . sys_get_temp_dir() . '/pu_rc_' . bin2hex(random_bytes(6)) . '.db');
putenv('PU_TEST_ENV=' . sys_get_temp_dir() . '/pu_rc_' . bin2hex(random_bytes(6)) . '.env');

require_once __DIR__ . '/../srv/relay.php';

register_shutdown_function(static function () use ($ordner) {
    foreach (glob($ordner . '/*') ?: [] as $f) { @unlink($f); }
    @rmdir($ordner);
    foreach ([getenv('PU_TEST_DB'), getenv('PU_TEST_ENV')] as $f) {
        if (is_string($f) && $f !== '') { @unlink($f); }
    }
});

if (!pu_ident_bereit()) {
    echo "\nsodium fehlt.\n";
    exit(2);
}

// ── Der Server, nachgespielt ─────────────────────────────────────────────────
$GLOBALS['ruf_zaehler'] = 0;
$GLOBALS['letzte_anfrage'] = null;

/** Setzt einen Ersatz für curl ein. */
function server(callable $antwort): void
{
    $GLOBALS['PU_RELAY_SENDER'] = static function (string $json) use ($antwort): array {
        $GLOBALS['ruf_zaehler']++;
        $GLOBALS['letzte_anfrage'] = json_decode($json, true);
        return $antwort($GLOBALS['letzte_anfrage']);
    };
}

function antwortet(int $status, array $daten): callable
{
    return static fn(array $a): array => [
        'status' => $status,
        'rumpf'  => (string)json_encode($daten),
    ];
}

$vps    = sodium_crypto_sign_keypair();
$vps_pk = base64_encode(sodium_crypto_sign_publickey($vps));
$vps_sk = sodium_crypto_sign_secretkey($vps);

/** Baut eine echte, unterschriebene Bescheinigung wie der Server. */
function bescheinigung(string $iid, string $sk, string $plan = 'schule-klein',
                       int $tage = 30): array
{
    $b = [
        'iid'         => $iid,
        'mandant'     => 'M-TEST',
        'plan'        => $plan,
        'gueltig_bis' => gmdate('Y-m-d\TH:i:s\Z', time() + $tage * 86400),
        'kid'         => 'vps-1',
    ];
    return ['bescheinigung' => $b,
            'signatur' => base64_encode(
                sodium_crypto_sign_detached(pu_ident_kanonisch($b), $sk))];
}

// ───────────────────────────────────────────────────── Ohne Voraussetzungen
gruppe('Ohne Adresse und ohne Identität');

// Seit 28.09.2026 gibt es eine Vorgabe: Ohne sie könnte sich eine frische
// Installation nie registrieren — und ohne Registrierung ist jeder Schüler.
putenv('PU_RELAY_URL=');
gleich('ohne Eintrag: die Vorgabe', PU_RELAY_URL_VORGABE, pu_relay_url());
putenv('PU_RELAY_URL=http://server.example.test/relay/');
gleich('unverschlüsselt nach draussen: nein, die Vorgabe', PU_RELAY_URL_VORGABE, pu_relay_url());
putenv('PU_RELAY_URL=http://127.0.0.1:8870/relay/');
gleich('unverschlüsselt auf diesen Rechner: ja (Probelauf)', 'http://127.0.0.1:8870/relay/', pu_relay_url());
// Ohne Schrägstrich leitet der Webserver um (301, HTML) — und Umleitungen
// folgt die Academy nicht. Deshalb wird er immer ergänzt.
putenv('PU_RELAY_URL=https://relay.example.test/relay');
gleich('der Schrägstrich am Ende wird ergänzt', 'https://relay.example.test/relay/', pu_relay_url());
gleich('die Vorgabe hat ihn auch', '/', substr(PU_RELAY_URL_VORGABE, -1));

putenv('PU_RELAY_URL=https://relay.example.test/relay/');
gleich('ohne Identität: klare Ansage', 'keine_identitaet', pu_relay_ruf('stand')['grund']);

$zustand = pu_relay_zustand();
pruefe('der Zustand fragt nicht beim Server nach', $GLOBALS['ruf_zaehler'] === 0);
pruefe('und meldet: nicht registriert', $zustand['registriert'] === false);

// ────────────────────────────────────────────────────────── Registrierung
gruppe('Registrierung');

server(antwortet(404, ['ok' => false, 'grund' => 'code_unbekannt']));
$GLOBALS['ruf_zaehler'] = 0;
$r = pu_relay_registrieren('FALSCHER-CODE');
gleich('ein unbekannter Code kommt als Grund zurück', 'code_unbekannt', $r['grund']);
gleich('eine 4xx-Antwort wird NICHT wiederholt', 1, $GLOBALS['ruf_zaehler']);
pruefe('der Satz dazu nennt den Code', str_contains($r['text'], 'Freischaltcode'));
pruefe('die Identität ist trotzdem entstanden', pu_ident_vorhanden());

$iid = pu_ident_iid();

// Der Server antwortet richtig.
$echt = bescheinigung($iid, $vps_sk);
server(antwortet(200, ['ok' => true] + $echt + ['vps_schluessel' => $vps_pk]));
putenv('PU_VPS_SCHLUESSEL=' . $vps_pk);

$r = pu_relay_registrieren('GUTER-CODE');
pruefe('mit gültigem Code geht sie durch', $r['ok'] === true, (string)($r['grund'] ?? ''));
pruefe('die Bescheinigung liegt danach vor', pu_ident_bescheinigung() !== null);
pruefe('und sie gilt', pu_ident_gueltig());

$a = $GLOBALS['letzte_anfrage'];
$rumpf = json_decode($a['rumpf'], true);
gleich('der Zweck steht im unterschriebenen Rumpf', 'registrieren', $rumpf['zweck']);
gleich('der Code auch', 'GUTER-CODE', $rumpf['nutzlast']['code']);
pruefe('der öffentliche Schlüssel geht mit', ($a['oeffentlich'] ?? '') === pu_ident_oeffentlich());
pruefe('die Systemart ist eine von dreien',
    in_array($rumpf['nutzlast']['systemart'], ['windows', 'macos', 'linux', ''], true));
pruefe('kein Gerätename in der Anfrage',
    !str_contains($a['rumpf'], gethostname() ?: '###'));

// ──────────────────────────────────────── Ein untergeschobener Server
gruppe('Ein untergeschobener Server');

$falsch = sodium_crypto_sign_keypair();
$falsch_sig = base64_encode(sodium_crypto_sign_detached(
    pu_ident_kanonisch($echt['bescheinigung']),
    sodium_crypto_sign_secretkey($falsch)));

server(antwortet(200, ['ok' => true,
    'bescheinigung' => $echt['bescheinigung'], 'signatur' => $falsch_sig]));
$r = pu_relay_registrieren('NOCH-EIN-CODE');
gleich('eine fremd unterschriebene Bescheinigung wird abgelehnt', 'signatur', $r['grund']);

// Eine Bescheinigung für eine andere Installation.
$fremde = bescheinigung('IID-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', $vps_sk);
server(antwortet(200, ['ok' => true] + $fremde));
gleich('eine Bescheinigung für eine andere Installation wird abgelehnt',
    'signatur', pu_relay_registrieren('UND-NOCH-EINER')['grund']);

pruefe('die gültige Bescheinigung von vorhin steht noch', pu_ident_gueltig());

// ────────────────────────────────────────────────────────── Standabfrage
gruppe('Standabfrage');

server(antwortet(200, ['ok' => true] + bescheinigung($iid, $vps_sk) + [
    'stand' => ['mandant' => 'M-TEST', 'plan' => 'schule-klein',
                'tokens' => 9750, 'heute' => 250, 'tagesdeckel' => 0],
]));
$s = pu_relay_stand();
pruefe('geht durch', $s['ok'] === true);
gleich('nennt den Stand', 9750, $s['stand']['tokens']);
pruefe('und wann er gezogen wurde', ($s['gezogen_am'] ?? '') !== '');

$a1 = json_decode($GLOBALS['letzte_anfrage']['rumpf'], true);
pu_relay_stand();
$a2 = json_decode($GLOBALS['letzte_anfrage']['rumpf'], true);
pruefe('jede Anfrage hat einen eigenen Einmalwert', $a1['nonce'] !== $a2['nonce']);

// ───────────────────────────────────────────────── Offline und Serverfehler
gruppe('Offline ist ein Zustand, kein Fehler');

$GLOBALS['PU_RELAY_SENDER'] = static function (string $json): array {
    $GLOBALS['ruf_zaehler']++;
    return ['status' => 0, 'rumpf' => ''];     // curl kommt nicht durch
};
$GLOBALS['ruf_zaehler'] = 0;
$s = pu_relay_stand();
gleich('ohne Netz: Grund statt Ausnahme', 'kein_netz', $s['grund']);
pruefe('der Satz beruhigt', str_contains($s['text'], 'läuft weiter'));
gleich('dreimal versucht', PU_RELAY_VERSUCHE, $GLOBALS['ruf_zaehler']);
pruefe('die Bescheinigung bleibt trotzdem gültig', pu_ident_gueltig());

$GLOBALS['ruf_zaehler'] = 0;
server(antwortet(500, ['ok' => false, 'grund' => 'serverfehler']));
$s = pu_relay_stand();
gleich('bei 500: Grund', 'serverfehler', $s['grund']);
gleich('und dreimal versucht', PU_RELAY_VERSUCHE, $GLOBALS['ruf_zaehler']);

$GLOBALS['ruf_zaehler'] = 0;
server(antwortet(403, ['ok' => false, 'grund' => 'gesperrt']));
$s = pu_relay_stand();
gleich('bei 403: Grund', 'gesperrt', $s['grund']);
gleich('und nur einmal versucht', 1, $GLOBALS['ruf_zaehler']);

server(static fn(array $a): array => ['status' => 200, 'rumpf' => 'kein json']);
gleich('eine unlesbare Antwort wird als solche gemeldet',
    'antwort_unlesbar', pu_relay_stand()['grund']);

server(antwortet(403, ['ok' => false, 'grund' => 'etwas_ganz_neues']));
pruefe('ein unbekannter Grund bekommt trotzdem einen Satz',
    str_contains(pu_relay_stand()['text'], 'etwas_ganz_neues'));

// ───────────────────────────────────────── Modell über den Relay (Runde 2)
gruppe('Modell über den Relay');

$GLOBALS['ruf_zaehler'] = 0;
server(antwortet(200, ['ok' => true, 'antwort' => 'Feuer bringt Licht.', 'modell' => 'anthropic/claude-haiku-4.5',
    'verbrauch' => ['eingabe' => 120, 'ausgabe' => 30, 'gesamt' => 150, 'geschaetzt' => false],
    'stand' => ['tokens' => 9600, 'heute' => 400, 'tagesdeckel' => 0]]));
$m = pu_relay_modell([['rolle' => 'user', 'text' => 'Was bringt Prometheus?']], 'anthropic/claude-haiku-4.5', 800, 'LP-7');
pruefe('geht durch', $m['ok'] === true);
gleich('liefert die Antwort', 'Feuer bringt Licht.', $m['antwort']);
gleich('und den Stand laut Server', 9600, $m['stand']['tokens']);
$rumpf = json_decode($GLOBALS['letzte_anfrage']['rumpf'], true);
gleich('der Zweck steht im unterschriebenen Rumpf', 'modell', $rumpf['zweck']);
gleich('die Nachrichten gehen als rolle/text mit',
    [['rolle' => 'user', 'text' => 'Was bringt Prometheus?']], $rumpf['nutzlast']['nachrichten']);
gleich('Modell, Deckel und Konto gehen mit', ['anthropic/claude-haiku-4.5', 800, 'LP-7'],
    [$rumpf['nutzlast']['modell'], $rumpf['nutzlast']['max_tokens'], $rumpf['nutzlast']['konto']]);
pruefe('kein öffentlicher Schlüssel bei einer bekannten Installation', !isset($GLOBALS['letzte_anfrage']['oeffentlich'])
    || $GLOBALS['letzte_anfrage']['oeffentlich'] === pu_ident_oeffentlich());

$GLOBALS['ruf_zaehler'] = 0;
server(antwortet(502, ['ok' => false, 'grund' => 'modell_fehler']));
$m = pu_relay_modell([['rolle' => 'user', 'text' => 'Noch einmal?']]);
gleich('bei 502: Grund', 'modell_fehler', $m['grund']);
gleich('und NICHT wiederholt (der Einmalwert ist verbraucht)', 1, $GLOBALS['ruf_zaehler']);
pruefe('der Satz sagt, dass nichts abgebucht wurde', str_contains($m['text'], 'nichts abgebucht'));

$GLOBALS['ruf_zaehler'] = 0;
$GLOBALS['PU_RELAY_SENDER'] = static function (string $json): array {
    $GLOBALS['ruf_zaehler']++;
    return ['status' => 0, 'rumpf' => ''];
};
gleich('ohne Netz: kein_netz', 'kein_netz', pu_relay_modell([['rolle' => 'user', 'text' => 'Hallo?']])['grund']);
gleich('… auch hier nur ein Versuch', 1, $GLOBALS['ruf_zaehler']);

server(antwortet(402, ['ok' => false, 'grund' => 'kein_guthaben']));
pruefe('kein Guthaben: ein Satz', str_contains(pu_relay_modell([['rolle' => 'user', 'text' => 'x']])['text'], 'Guthaben'));

// ───────────────────────────────────────── Konten melden (Runde 3a)
gruppe('Konten melden');

// Testpersonen direkt in die Wegwerf-Datenbank (die Spalte für den
// Kennwort-Hash bekommt einen Platzhalter, hier meldet sich niemand an).
$spalte_hash = 'kennwort' . '_hash';
$jetzt = gmdate('Y-m-d\TH:i:s\Z');
$neu = pu_db()->prepare("INSERT INTO lernende (kennung, anzeigename, rolle, $spalte_hash, gruppe, angelegt)
                         VALUES (?, ?, ?, '-', '5b', ?)");
foreach ([['leitung', 'Frau Leitung', 'admin'], ['nele', 'Nele Beispiel', 'schueler'],
          ['papa', 'Herr Beispiel', 'eltern'], ['lk', 'Frau Lehrerin', 'lehrer']] as [$k, $n, $r]) {
    $neu->execute([$k, $n, $r, $jetzt]);
}
$ids = pu_db()->query('SELECT kennung, id FROM lernende')->fetchAll(PDO::FETCH_KEY_PAIR);
$gesendet = [];
$GLOBALS['ruf_zaehler'] = 0;
// Der Server kennt noch L-99 (hier längst gelöscht) als aktiv.
server(static function (array $a) use (&$gesendet, $ids): array {
    $rumpf = json_decode($a['rumpf'], true);
    $gesendet[] = $rumpf['nutzlast']['konten'];
    $zurueck = [['konto' => 'L-99', 'rolle' => 'schueler', 'aktiv' => true, 'tokens' => 0]];
    foreach ($rumpf['nutzlast']['konten'] as $k) {
        $zurueck[] = ['konto' => $k['konto'], 'rolle' => $k['rolle'], 'aktiv' => $k['rolle'] !== 'weg',
                      'tokens' => $k['konto'] === 'L-' . $ids['papa'] ? 100000 : 0];
    }
    return ['status' => 200, 'rumpf' => (string)json_encode(['ok' => true, 'konten' => $zurueck, 'topf' => 9700000])];
});
$k = pu_relay_konten();
pruefe('gemeldet', $k['ok'] === true, (string)($k['grund'] ?? ''));
gleich('Pseudonym und Rolle, Admin als Verwaltung', [
    ['konto' => 'L-' . $ids['leitung'], 'rolle' => 'verwaltung'], ['konto' => 'L-' . $ids['nele'], 'rolle' => 'schueler'],
    ['konto' => 'L-' . $ids['papa'], 'rolle' => 'eltern'], ['konto' => 'L-' . $ids['lk'], 'rolle' => 'lehrer']], $gesendet[0] ?? []);
$alles = json_encode($gesendet, JSON_UNESCAPED_UNICODE);
pruefe('kein Name, keine Kennung, keine Gruppe geht mit',
    !preg_match('/Nele|Beispiel|Leitung|Lehrerin|nele|papa|"5b"/', $alles));
gleich('wer hier gelöscht ist, geht als „weg“ hinterher', [['konto' => 'L-99', 'rolle' => 'weg']], $gesendet[1] ?? []);
gleich('zwei Rufe', 2, $GLOBALS['ruf_zaehler']);
gleich('das eigene Guthaben laut Server', 100000, $k['konten']['L-' . $ids['papa']] ?? -1);
gleich('der Topf der Einrichtung', 9700000, $k['topf']);

server(antwortet(409, ['ok' => false, 'grund' => 'zu_viele_konten']));
$k = pu_relay_konten();
pruefe('zu viele Konten: abgewiesen, mit einem Satz', !$k['ok'] && str_contains(pu_relay_grund_text((string)$k['grund']), '5.000'));

// ─────────────────────────────────────────────────────────── Zustand
gruppe('Zustand für die Oberfläche');

$GLOBALS['ruf_zaehler'] = 0;
$z = pu_relay_zustand();
gleich('ohne Netzanfrage', 0, $GLOBALS['ruf_zaehler']);
pruefe('registriert', $z['registriert'] === true);
gleich('nennt die IID', $iid, $z['iid']);
gleich('und den Plan', 'schule-klein', $z['plan']);
pruefe('gültig', $z['gueltig'] === true);

// Die kanonische Form muss Zeichen für Zeichen der des Servers gleichen
// (tests/relay_test.php dort erwartet dieselbe Zeichenkette). Listen bleiben
// Listen, auch ab elf Einträgen (27.09.2026).
gruppe('Kanonische Form');
gleich('eine Liste mit zwölf Einträgen bleibt eine Liste', '{"a":[0,1,2,3,4,5,6,7,8,9,10,11],"b":1}',
    pu_ident_kanonisch(['b' => 1, 'a' => range(0, 11)]));

// Alle Gründe, die der Server kennt, haben einen Satz.
gruppe('Übersetzung der Gründe');
$vom_server = ['form', 'nicht_kanonisch', 'zu_gross', 'unbekannt', 'gesperrt',
    'umgezogen', 'mandant_gesperrt', 'notaus', 'zeit', 'wiederholt', 'signatur',
    'code_unbekannt', 'code_verbraucht', 'code_abgelaufen', 'schon_registriert',
    'iid_passt_nicht', 'schluessel', 'unbekannter_zweck', 'serverfehler', 'nur_post',
    'kein_tarif', 'modell_nicht_im_tarif', 'kein_guthaben', 'tagesdeckel', 'zu_viele',
    'modell_aus', 'modell_fehler', 'zu_viele_konten'];
$ohne = array_values(array_diff($vom_server, array_keys(PU_RELAY_GRUENDE)));
pruefe('jeder Grund des Servers hat einen deutschen Satz', $ohne === [],
    implode(', ', $ohne));

bilanz();
