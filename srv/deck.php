<?php
declare(strict_types=1);
/**
 * PROMPTHEUS DECK — die Zentrale für alle Programme auf diesem Rechner.
 *
 * DECK liegt in `deck/` (Python, Port 8800), startet Programme ohne eigenes
 * Fenster und führt die Academy-Programme fest. Beim Start hinterlegt es Port
 * und Startweg in `%LOCALAPPDATA%\PROMPTHEUS\deck.json`. **Nur daran** erkennt
 * die Academy, dass DECK installiert ist: Dann steht in der Community der Knopf
 * „PROMPTHEUS DECK ›“, und die Werkstatt startet über DECK statt im eigenen
 * Fenster. Ohne die Datei ändert sich nichts.
 */

/**
 * Ist DECK auf diesem Rechner installiert — und auf welchem Port?
 *
 * @return array{port:int, adresse:string}|null
 */
function pu_deck(): ?array
{
    $basis = getenv('LOCALAPPDATA');
    if (!is_string($basis) || $basis === '') return null;
    $datei = $basis . DIRECTORY_SEPARATOR . 'PROMPTHEUS' . DIRECTORY_SEPARATOR . 'deck.json';
    if (!is_file($datei)) return null;
    $j = json_decode((string)@file_get_contents($datei), true);
    $port = is_array($j) ? (int)($j['port'] ?? 0) : 0;
    // Nur ein Port, nie eine Adresse aus der Datei: der Knopf führt immer auf diesen Rechner.
    if ($port < 1024 || $port > 65535) return null;
    return ['port' => $port, 'adresse' => 'http://127.0.0.1:' . $port . '/'];
}

/**
 * Einen festen DECK-Eintrag starten lassen — unsichtbar statt im eigenen Fenster.
 *
 * Das Ticket hat die Academy vorher abgelegt; `direkt` sagt DECK, dass es nicht
 * noch einmal zur Freigabe schicken soll. Die Startdateien prüfen das Ticket
 * weiterhin selbst — DECK öffnet also keine Tür, die die Academy nicht öffnet.
 *
 * @param string $eintrag die feste Kennung in DECK (pa-werkstatt, pa-cinema-studio)
 * @return bool true, wenn DECK den Start angenommen hat; sonst startet der Aufrufer wie bisher
 */
function pu_deck_starten(string $eintrag): bool
{
    $d = pu_deck();
    if ($d === null || !preg_match('/^[a-z0-9-]{1,64}$/', $eintrag)) return false;
    $ctx = stream_context_create(['http' => [
        'method'        => 'POST',
        'timeout'       => 4,
        'ignore_errors' => true,
        'header'        => "Content-Type: application/json\r\nX-Cockpit: 1\r\n",
        'content'       => (string)json_encode(['id' => $eintrag, 'direkt' => true]),
    ]]);
    $antwort = @file_get_contents($d['adresse'] . 'api/starten', false, $ctx);
    $j = is_string($antwort) ? json_decode($antwort, true) : null;
    return is_array($j) && ($j['ok'] ?? false) === true;
}
