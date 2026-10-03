<?php
declare(strict_types=1);
/**
 * Herkunftsschutz der API: Eine Seite aus der Werkstatt (127.0.0.1:3081) ist
 * für den Browser dieselbe Site wie die Academy (:8801) — das Anmelde-Cookie
 * geht mit. Ohne Prüfung könnte eine solche Seite im Namen der angemeldeten
 * Person handeln. api_fremde_herkunft() weist das ab.
 *
 * Jeder Fall läuft in einem eigenen PHP-Prozess, weil api.php mit exit endet.
 *
 * Aufruf:
 *     php -d extension=pdo_sqlite -d extension=sqlite3 tests/herkunft_test.php
 */

require_once __DIR__ . '/hilfe.php';
$db = test_db_vorbereiten();

/** Ruft api.php mit den gegebenen Kopfzeilen auf und liefert die Antwort. */
function api_mit(array $server, string $aktion, string $methode = 'POST'): string
{
    $php = PHP_BINARY;
    $setz = '';
    foreach ($server as $k => $v) $setz .= '$_SERVER[' . var_export($k, true) . ']=' . var_export($v, true) . ';';
    $code = $setz . '$_SERVER["REQUEST_METHOD"]=' . var_export($methode, true) . ';'
          . '$_SERVER["HTTP_HOST"]="127.0.0.1:8801";'
          . '$_GET["aktion"]=' . var_export($aktion, true) . ';'
          . 'chdir(' . var_export(dirname(__DIR__), true) . ');'
          . 'include "api.php";';
    $h = proc_open([$php, '-d', 'extension=pdo_sqlite', '-d', 'extension=sqlite3', '-r', $code],
        [1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $rohr, null,
        ['PU_TEST_DB' => getenv('PU_TEST_DB'), 'PU_TEST_AUDIT' => getenv('PU_TEST_AUDIT')] + getenv());
    $aus = (string)stream_get_contents($rohr[1]);
    fclose($rohr[1]); fclose($rohr[2]); proc_close($h);
    return $aus;
}

$fremdText = 'fremden Seite';

gruppe('Eigene Anfragen');
$ok = '"ok":true';
pruefe('ohne Kopfzeilen (Kommandozeile): beantwortet', str_contains(api_mit([], 'zustand'), $ok));
pruefe('same-origin: beantwortet', str_contains(api_mit(['HTTP_SEC_FETCH_SITE' => 'same-origin'], 'zustand'), $ok));
pruefe('eigene Origin: beantwortet', str_contains(api_mit(['HTTP_ORIGIN' => 'http://127.0.0.1:8801'], 'zustand'), $ok));

gruppe('Fremde Anfragen');
pruefe('same-site (Werkstatt-Seite): abgewiesen',
    str_contains(api_mit(['HTTP_SEC_FETCH_SITE' => 'same-site'], 'zustand'), $fremdText));
pruefe('cross-site: abgewiesen',
    str_contains(api_mit(['HTTP_SEC_FETCH_SITE' => 'cross-site'], 'abmelden'), $fremdText));
pruefe('fremde Origin ohne Sec-Fetch: abgewiesen',
    str_contains(api_mit(['HTTP_ORIGIN' => 'http://127.0.0.1:3081'], 'werkstatt_oeffnen'), $fremdText));
pruefe('Origin „null“: abgewiesen', str_contains(api_mit(['HTTP_ORIGIN' => 'null'], 'zustand'), $fremdText));

gruppe('Erlaubte Ausnahmen');
pruefe('community_oeffnen als Seitenaufruf: nicht abgewiesen', !str_contains(api_mit(
    ['HTTP_SEC_FETCH_SITE' => 'same-site', 'HTTP_SEC_FETCH_MODE' => 'navigate'], 'community_oeffnen', 'GET'), $fremdText));
pruefe('community_oeffnen per fetch: abgewiesen', str_contains(api_mit(
    ['HTTP_SEC_FETCH_SITE' => 'same-site', 'HTTP_SEC_FETCH_MODE' => 'cors'], 'community_oeffnen', 'GET'), $fremdText));
pruefe('urkunde_pruefen von aussen: beantwortet', str_contains(api_mit(
    ['HTTP_SEC_FETCH_SITE' => 'cross-site'], 'urkunde_pruefen', 'GET'), $ok));

bilanz();
