<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Updates: nachsehen, prüfen, laden, bereitlegen.
 *
 * Bauplan: vps/Pläne/90_Updates/UPDATE-PLAN.md. Der Server schiebt nichts;
 * diese Datei **holt**. Sie fragt beim Öffnen und danach höchstens alle
 * 24 Stunden, ob es eine neuere Fassung gibt, und nimmt die Antwort nur an,
 * wenn sie mit dem eingebauten öffentlichen Schlüssel unterschrieben ist.
 *
 * Getauscht wird hier nichts. Das tut `srv/aktualisieren_cli.php`, das
 * `promptheus-start.bat` beim Neustart **vor** dem Server aufruft — solange
 * der Server läuft, liegen seine eigenen Dateien in Benutzung.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * Was hinausgeht
 *
 * Nicht registriert: eine GET-Anfrage mit dem Kanal. Registriert: die
 * signierte Relay-Anfrage `fassung` mit Fassung und Kanal (dazu, wie jede
 * Relay-Anfrage, die pseudonyme IID). Keine Namen, keine Lernstände, nichts
 * aus `data/`. Die IP-Adresse sieht der Server technisch bedingt.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * Warum die Paketadresse nicht im Feed steht
 *
 * Sie wird hier aus `PU_AKTUALISIERUNG_URL` gebildet. Stünde sie im Feed,
 * könnte ein Fehler auf dem Server die Academy auf einen fremden Rechner
 * schicken. So kann sie nur dorthin, wo sie ohnehin fragt.
 */

require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/einstellungen.php';
require_once __DIR__ . '/relay.php';

/**
 * Die öffentlichen Schlüssel, mit denen der Server den Update-Feed
 * unterschreibt. Der Wert kommt aus dem Cockpit (Updates → Test und
 * Prüfstand), sobald dort der Schlüssel angelegt ist. Öffentlich, darf in Git.
 * Mehrere Einträge erlauben einen Wechsel ohne Stichtag.
 */
const PU_AKT_SCHLUESSEL = [
    'rel-1' => 'dMan56vgDR7Mel1DitnpdK1Bdrx8+4ggHRMvG4C0mIM=',
];
const PU_AKT_URL_VORGABE  = 'https://promptheus-academy.de/aktualisierung/';
const PU_AKT_ZEIT         = 5;                    // Sekunden für die Nachfrage
const PU_AKT_ZEIT_LADEN   = 900;                  // Sekunden für den Download
const PU_AKT_MAX_PAKET    = 800 * 1024 * 1024;
const PU_AKT_MAX_ENTPACKT = 1536 * 1024 * 1024;
const PU_AKT_MAX_DATEI    = 50 * 1024 * 1024;
const PU_AKT_MAX_DATEIEN  = 20000;
const PU_AKT_NOCHMAL      = 3600;                 // nach einem Fehlschlag frühestens so viel später
/** Erste Pfadstücke, die ein Paket nie berühren darf — dieselbe Liste wie auf dem Server. */
const PU_AKT_VERBOTEN     = ['data', 'php', '.git', '.github', '.claude', 'vps', 'node_modules'];

// ─────────────────────────────────────────────────────────────── Grundlagen

/** Arbeitsordner für Pakete, Sicherungen und Merker (`data/aktualisierung`). */
function pu_akt_ordner(string $unter = ''): string
{
    $basis = ($t = getenv('PU_TEST_AKT')) !== false && $t !== '' ? $t : PU_DATA . '/aktualisierung';
    $o = $basis . ($unter !== '' ? '/' . $unter : '');
    if (!is_dir($o) && !@mkdir($o, 0775, true) && !is_dir($o)) {
        throw new RuntimeException('Der Ordner für Updates lässt sich nicht anlegen.');
    }
    return $o;
}

function pu_akt_fassung_ok(string $f): bool
{
    return (bool)preg_match('/^(0|[1-9]\d{0,2})\.(0|[1-9]\d{0,2})\.(0|[1-9]\d{0,2})$/', $f);
}

function pu_akt_rang(string $f): int
{
    if (!pu_akt_fassung_ok($f)) {
        return -1;
    }
    [$a, $b, $c] = array_map('intval', explode('.', $f));
    return $a * 1000000 + $b * 1000 + $c;
}

/** Wie auf dem Server (`gemeinsam/aktualisierung.php`): Zeichen für Zeichen dieselbe Regel. */
function pu_akt_pfad_ok(string $p): bool
{
    if ($p === '' || strlen($p) > 240 || str_contains($p, '\\') || str_contains($p, ':')
        || preg_match('/[\x00-\x1f\x7f]/', $p) || $p[0] === '/') {
        return false;
    }
    $stuecke = explode('/', $p);
    foreach ($stuecke as $s) {
        if ($s === '' || $s === '.' || $s === '..') {
            return false;
        }
        if (str_starts_with(strtolower($s), '.env')) {
            return false;
        }
    }
    return !in_array(strtolower($stuecke[0]), PU_AKT_VERBOTEN, true);
}

/** Der Kanal: stabil, ausser `.env` sagt `PU_UPDATE_KANAL=test|probe`. */
function pu_akt_kanal(): string
{
    $k = pu_env('PU_UPDATE_KANAL', 'stabil');
    return in_array($k, ['probe', 'test', 'stabil'], true) ? $k : 'stabil';
}

/**
 * Die Adresse des Feeds (mit / am Ende). `https` ist Pflicht; `http` nur zu
 * diesem Rechner selbst — für den Probelauf mit einem Server auf 127.0.0.1.
 */
function pu_akt_url(): string
{
    $u = pu_env('PU_AKTUALISIERUNG_URL', PU_AKT_URL_VORGABE);
    $u = rtrim($u, '/') . '/';
    if (str_starts_with($u, 'https://')
        || preg_match('#^http://(127\.0\.0\.1|localhost)(:\d{1,5})?/#', $u)) {
        return $u;
    }
    return PU_AKT_URL_VORGABE;
}

/**
 * Alle bekannten öffentlichen Schlüssel. Zusätzlich darf `.env` einen
 * eintragen (`PU_AKT_OEFFENTLICH=kid:base64`) — für den Probelauf gegen einen
 * eigenen Testserver. Wer die `.env` schreiben kann, hat den Rechner ohnehin.
 */
function pu_akt_schluessel(): array
{
    $k = PU_AKT_SCHLUESSEL;
    $zusatz = pu_env('PU_AKT_OEFFENTLICH', '');
    if (preg_match('#^([a-z0-9-]{3,16}):([A-Za-z0-9+/=]{40,60})$#', $zusatz, $m)) {
        $k[$m[1]] = $m[2];
    }
    return $k;
}

/** Der feste Eimer 0–99 dieser Installation (für den stufenweisen Anteil). */
function pu_akt_eimer(): int
{
    $d = pu_akt_ordner() . '/eimer';
    $w = is_file($d) ? trim((string)file_get_contents($d)) : '';
    if (!preg_match('/^[0-9a-f]{32}$/', $w)) {
        $w = bin2hex(random_bytes(16));
        @file_put_contents($d, $w, LOCK_EX);
    }
    return (int)(hexdec(substr(hash('sha256', $w), 0, 8)) % 100);
}

// ─────────────────────────────────────────────────────────────── Netz

/**
 * Ein Ruf nach aussen. `$post` gesetzt: POST mit JSON. `$ziel` gesetzt: der
 * Rumpf geht in diese Datei. Keine Weiterleitungen.
 *
 * Im Test ersetzt `$GLOBALS['PU_AKT_SENDER']` den Ruf:
 *     fn(string $url, ?string $post, ?string $ziel): array{status:int, rumpf:string}
 */
function pu_akt_http(string $url, ?string $post = null, ?string $ziel = null, int $zeit = PU_AKT_ZEIT): array
{
    $ersatz = $GLOBALS['PU_AKT_SENDER'] ?? null;
    if (is_callable($ersatz)) {
        return $ersatz($url, $post, $ziel);
    }
    if (!function_exists('curl_init')) {
        return ['status' => 0, 'rumpf' => ''];
    }
    $c = curl_init($url);
    $fh = null;
    $opt = [
        CURLOPT_CONNECTTIMEOUT => min(5, $zeit),
        CURLOPT_TIMEOUT        => $zeit,
        CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
        CURLOPT_PROTOCOLS      => CURLPROTO_HTTPS | CURLPROTO_HTTP,
        CURLOPT_USERAGENT      => 'PROMPTHEUS-Academy/' . pu_fassung(),
    ];
    if ($post !== null) {
        $opt[CURLOPT_POST] = true;
        $opt[CURLOPT_POSTFIELDS] = $post;
        $opt[CURLOPT_HTTPHEADER] = ['Content-Type: application/json'];
    }
    if ($ziel !== null) {
        $fh = fopen($ziel, 'wb');
        if ($fh === false) {
            return ['status' => 0, 'rumpf' => ''];
        }
        $opt[CURLOPT_FILE] = $fh;
        $opt[CURLOPT_MAXFILESIZE_LARGE] = PU_AKT_MAX_PAKET;
    } else {
        $opt[CURLOPT_RETURNTRANSFER] = true;
    }
    curl_setopt_array($c, $opt);
    $bundle = function_exists('pu_ca_bundle') ? pu_ca_bundle() : '';
    if ($bundle !== '') {
        curl_setopt($c, CURLOPT_CAINFO, $bundle);
    }
    $rumpf = curl_exec($c);
    $status = (int)curl_getinfo($c, CURLINFO_RESPONSE_CODE);
    curl_close($c);
    if ($fh !== null) {
        fclose($fh);
    }
    return ['status' => $status, 'rumpf' => is_string($rumpf) ? $rumpf : ''];
}

/**
 * Holt den Umschlag des Feeds. Registriert: über den Relay (meldet dabei die
 * Fassung). Sonst: anonym per GET.
 *
 * @return array{ok:bool, grund:string, umschlag:?array, weg:string}
 */
function pu_akt_feed_holen(): array
{
    $weg = 'anonym';
    if (pu_relay_url() !== '' && pu_ident_vorhanden()) {
        $weg = 'relay';
        try {
            $anfrage = pu_ident_anfrage('fassung', ['fassung' => pu_fassung(), 'kanal' => pu_akt_kanal()]);
        } catch (Throwable) {
            return ['ok' => false, 'grund' => 'keine_identitaet', 'umschlag' => null, 'weg' => $weg];
        }
        $r = pu_akt_http(pu_relay_url(), (string)json_encode($anfrage, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
    } else {
        $r = pu_akt_http(pu_akt_url() . '?kanal=' . pu_akt_kanal());
    }
    if ($r['status'] === 0) {
        return ['ok' => false, 'grund' => 'kein_netz', 'umschlag' => null, 'weg' => $weg];
    }
    $j = json_decode($r['rumpf'], true);
    if (!is_array($j)) {
        return ['ok' => false, 'grund' => 'antwort_unlesbar', 'umschlag' => null, 'weg' => $weg];
    }
    if (($j['ok'] ?? false) !== true) {
        return ['ok' => false, 'grund' => (string)($j['grund'] ?? 'serverfehler'), 'umschlag' => null, 'weg' => $weg];
    }
    $u = $weg === 'relay' ? ($j['umschlag'] ?? null) : $j;
    if (!is_array($u) || !is_string($u['rumpf'] ?? null) || !is_string($u['signatur'] ?? null)) {
        return ['ok' => false, 'grund' => 'antwort_unlesbar', 'umschlag' => null, 'weg' => $weg];
    }
    return ['ok' => true, 'grund' => '', 'umschlag' => $u, 'weg' => $weg];
}

// ─────────────────────────────────────────────────────────────── Feed prüfen

/**
 * Prüft den Umschlag: Schlüssel bekannt, Unterschrift echt, Form stimmt,
 * noch gültig, nicht älter als der zuletzt angenommene Feed.
 *
 * @return array{ok:bool, grund:string, rumpf:?array}
 */
function pu_akt_feed_pruefen(array $umschlag, string $zuletzt_erstellt = ''): array
{
    $nein = static fn (string $g): array => ['ok' => false, 'grund' => $g, 'rumpf' => null];
    $kid = (string)($umschlag['kid'] ?? '');
    $schluessel = pu_akt_schluessel();
    if (!isset($schluessel[$kid])) {
        return $nein('schluessel_unbekannt');
    }
    $pk = base64_decode($schluessel[$kid], true);
    $sig = base64_decode((string)($umschlag['signatur'] ?? ''), true);
    $rumpf_roh = (string)($umschlag['rumpf'] ?? '');
    if ($pk === false || strlen($pk) !== SODIUM_CRYPTO_SIGN_PUBLICKEYBYTES
        || $sig === false || strlen($sig) !== SODIUM_CRYPTO_SIGN_BYTES
        || !sodium_crypto_sign_verify_detached($sig, $rumpf_roh, $pk)) {
        return $nein('signatur');
    }
    $r = json_decode($rumpf_roh, true);
    if (!is_array($r) || ($r['feed'] ?? null) !== 1 || ($r['kid'] ?? '') !== $kid
        || !is_array($r['fassungen'] ?? null) || !is_string($r['erstellt'] ?? null) || !is_string($r['gueltig_bis'] ?? null)) {
        return $nein('form');
    }
    $bis = strtotime($r['gueltig_bis']);
    if ($bis === false || $bis < time()) {
        return $nein('abgelaufen');
    }
    // ISO-Zeiten in UTC lassen sich als Zeichenkette vergleichen.
    if ($zuletzt_erstellt !== '' && strcmp($r['erstellt'], $zuletzt_erstellt) < 0) {
        return $nein('aelter');
    }
    return ['ok' => true, 'grund' => '', 'rumpf' => $r];
}

/** Die Fassung, die diese Installation angeboten bekommt — oder null. */
function pu_akt_angebot(array $rumpf, string $eigene, int $eimer): ?array
{
    $bestes = null;
    foreach ($rumpf['fassungen'] as $z) {
        if (!is_array($z) || !pu_akt_fassung_ok((string)($z['fassung'] ?? ''))
            || !preg_match('/^[0-9a-f]{64}$/', (string)($z['sha256'] ?? ''))) {
            continue;
        }
        if (pu_akt_rang($z['fassung']) <= pu_akt_rang($eigene)) {
            continue;
        }
        if (pu_akt_rang((string)($z['mindestens'] ?? '0.0.0')) > pu_akt_rang($eigene)) {
            continue;
        }
        if ($eimer >= (int)($z['anteil'] ?? 0)) {
            continue;
        }
        if ($bestes === null || pu_akt_rang($z['fassung']) > pu_akt_rang($bestes['fassung'])) {
            $bestes = [
                'fassung'  => $z['fassung'],
                'sha256'   => $z['sha256'],
                'groesse'  => (int)($z['groesse'] ?? 0),
                'hinweise' => mb_substr((string)($z['hinweise'] ?? ''), 0, 2000),
                'wichtig'  => (bool)($z['wichtig'] ?? false),
                'datum'    => (string)($z['datum'] ?? ''),
                'kanal'    => (string)($z['kanal'] ?? ''),
            ];
        }
    }
    return $bestes;
}

// ─────────────────────────────────────────────────────────────── Stand

function pu_akt_stand(): array
{
    $j = json_decode(pu_setting('update_stand', ''), true);
    return (is_array($j) ? $j : []) + ['geprueft_am' => '', 'naechste' => 0, 'letzter_feed' => '',
        'angebot' => null, 'fehler' => '', 'weg' => ''];
}

function pu_akt_stand_setzen(array $s): void
{
    pu_setting_setzen('update_stand', (string)json_encode($s, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
}

/**
 * Fragt nach, wenn es fällig ist (oder `$jetzt`), und legt das Ergebnis ab.
 * Fällig: automatische Prüfung an und die letzte länger her als die
 * eingestellten Stunden. Nach einem Fehlschlag frühestens eine Stunde später.
 */
function pu_akt_pruefen(bool $jetzt = false): array
{
    $s = pu_akt_stand();
    $faellig = $jetzt || (pu_regel_an('update_pruefen') && time() >= (int)$s['naechste']);
    if (!$faellig) {
        return $s;
    }
    $h = pu_akt_feed_holen();
    $s['geprueft_am'] = gmdate('Y-m-d\TH:i:s\Z');
    $s['weg'] = $h['weg'];
    if ($h['ok']) {
        $p = pu_akt_feed_pruefen($h['umschlag'], (string)$s['letzter_feed']);
        if ($p['ok']) {
            $s['letzter_feed'] = $p['rumpf']['erstellt'];
            $s['angebot'] = pu_akt_angebot($p['rumpf'], pu_fassung(), pu_akt_eimer());
            $s['fehler'] = '';
            $s['naechste'] = time() + 3600 * max(1, (int)pu_regel('update_stunden'));
        } else {
            $s['fehler'] = $p['grund'];
            $s['naechste'] = time() + PU_AKT_NOCHMAL;
        }
    } else {
        $s['fehler'] = $h['grund'];
        $s['naechste'] = time() + PU_AKT_NOCHMAL;
    }
    // Ein Angebot, das inzwischen installiert ist, ist keins mehr.
    if (is_array($s['angebot']) && pu_akt_rang($s['angebot']['fassung']) <= pu_akt_rang(pu_fassung())) {
        $s['angebot'] = null;
    }
    pu_akt_stand_setzen($s);
    return $s;
}

function pu_akt_grund_text(string $g): string
{
    return [
        ''                     => '',
        'kein_netz'            => 'Der Update-Server war nicht erreichbar.',
        'antwort_unlesbar'     => 'Die Antwort des Update-Servers war nicht lesbar.',
        'signatur'             => 'Die Antwort trug keine gültige Unterschrift und wurde verworfen.',
        'schluessel_unbekannt' => 'Die Antwort war mit einem unbekannten Schlüssel unterschrieben.',
        'abgelaufen'           => 'Die Antwort war abgelaufen und wurde verworfen.',
        'aelter'               => 'Die Antwort war älter als die letzte und wurde verworfen.',
        'form'                 => 'Die Antwort hatte nicht die erwartete Form.',
        'nicht_eingerichtet'   => 'Der Update-Server ist noch nicht eingerichtet.',
        'zu_oft'               => 'Zu viele Nachfragen; später noch einmal.',
        'keine_identitaet'     => 'Die Kennung dieser Installation liess sich nicht lesen.',
    ][$g] ?? (function_exists('pu_relay_grund_text') ? pu_relay_grund_text($g) : 'Unbekannter Fehler.');
}

/** Ausgeblendet? × gilt je Person und Fassung; bei „wichtig“ nur 24 Stunden. */
function pu_akt_ausgeblendet(int $lernender, ?array $angebot): bool
{
    if ($angebot === null) {
        return false;
    }
    $w = explode('|', pu_setting('update_aus_' . $lernender, ''));
    if (($w[0] ?? '') !== $angebot['fassung']) {
        return false;
    }
    return !$angebot['wichtig'] || (int)($w[1] ?? 0) > time() - 86400;
}

function pu_akt_ausblenden(int $lernender, string $fassung): void
{
    if (!pu_akt_fassung_ok($fassung)) {
        throw new RuntimeException('Keine Fassung.');
    }
    pu_setting_setzen('update_aus_' . $lernender, $fassung . '|' . time());
}

/** Was die Oberfläche braucht (Notiz und Wartung). */
function pu_akt_oberflaeche(int $lernender, bool $jetzt = false): array
{
    $s = pu_akt_pruefen($jetzt);
    // Nach dem Einspielen ist das gespeicherte Angebot die eigene Fassung —
    // bis zur nächsten Nachfrage. Dann ist es keins mehr (Probelauf 27.09.2026).
    if (is_array($s['angebot']) && pu_akt_rang($s['angebot']['fassung']) <= pu_akt_rang(pu_fassung())) {
        $s['angebot'] = null;
    }
    $bereit = pu_akt_bereit();
    return [
        'fassung'     => pu_fassung(),
        'kanal'       => pu_akt_kanal(),
        'weg'         => $s['weg'],
        'geprueft_am' => $s['geprueft_am'],
        'fehler'      => pu_akt_grund_text((string)$s['fehler']),
        'angebot'     => $s['angebot'],
        'ausgeblendet'=> pu_akt_ausgeblendet($lernender, $s['angebot']),
        'bereit'      => $bereit['fassung'] ?? '',
        'neustart'    => pu_akt_neustart_moeglich(),
        'sicherungen' => array_map(static fn ($x) => ['name' => $x['name'], 'von' => $x['von'], 'nach' => $x['nach'],
                                                       'zeit' => $x['zeit']], pu_akt_sicherungen()),
        'pruefen_an'  => pu_regel_an('update_pruefen'),
        'stunden'     => (int)pu_regel('update_stunden'),
        'schluessel'  => pu_akt_schluessel() !== [],
    ];
}

// ─────────────────────────────────────────────────────────────── Laden und bereitlegen

function pu_akt_bereit(): ?array
{
    $d = pu_akt_ordner() . '/bereit.json';
    $j = is_file($d) ? json_decode((string)file_get_contents($d), true) : null;
    return is_array($j) && pu_akt_fassung_ok((string)($j['fassung'] ?? '')) ? $j : null;
}

/**
 * Prüft ein ZIP und entpackt es nach `$ziel` — nur, wenn alles stimmt.
 * Dieselben Regeln wie auf dem Server; zusätzlich muss die Fassung passen und
 * „mindestens“ erfüllt sein.
 *
 * @return array{ok:bool, grund:string, manifest:?array}
 */
function pu_akt_entpacken(string $zip_datei, string $ziel, string $fassung, string $eigene): array
{
    $nein = static fn (string $g): array => ['ok' => false, 'grund' => $g, 'manifest' => null];
    if (!class_exists('ZipArchive')) {
        return $nein('Die PHP-Erweiterung zip fehlt (php.ini: extension=zip).');
    }
    // libzip öffnet unter Windows nur Pfade bis 260 Zeichen; die Academy liegt
    // oft tiefer. Dann über eine Kopie unter kurzem Pfad (Probelauf 27.09.2026).
    $kurz = null;
    if (strlen($zip_datei) > 200) {
        $kurz = tempnam(sys_get_temp_dir(), 'pup');
        if ($kurz === false || !@copy($zip_datei, $kurz)) {
            return $nein('Das Paket liess sich nicht zum Prüfen öffnen.');
        }
    }
    $zip = new ZipArchive();
    if ($zip->open($kurz ?? $zip_datei, ZipArchive::RDONLY) !== true) {
        if ($kurz !== null) {
            @unlink($kurz);
        }
        return $nein('Das Paket ist kein lesbares ZIP.');
    }
    try {
        $m = json_decode((string)$zip->getFromName('manifest.json'), true);
        if (!is_array($m) || ($m['paket'] ?? null) !== 1 || !is_array($m['dateien'] ?? null)
            || ($m['fassung'] ?? '') !== $fassung) {
            return $nein('Das Manifest fehlt oder passt nicht zur Fassung.');
        }
        if (pu_akt_rang((string)($m['mindestens'] ?? '0.0.0')) > pu_akt_rang($eigene)) {
            return $nein('Diese Fassung setzt eine neuere Ausgangsfassung voraus.');
        }
        $liste = $m['dateien'];
        if (count($liste) === 0 || count($liste) > PU_AKT_MAX_DATEIEN) {
            return $nein('Das Manifest listet keine oder zu viele Dateien.');
        }
        foreach ($liste as $pfad => $sha) {
            if (!is_string($pfad) || !pu_akt_pfad_ok($pfad) || $pfad === 'manifest.json'
                || !is_string($sha) || !preg_match('/^[0-9a-f]{64}$/', $sha)) {
                return $nein('Unerlaubter Eintrag im Manifest.');
            }
        }
        if (is_dir($ziel)) {
            pu_akt_ordner_weg($ziel);
        }
        @mkdir($ziel, 0775, true);
        $summe = 0;
        $gesehen = [];
        for ($i = 0; $i < $zip->numFiles; $i++) {
            $st = $zip->statIndex($i);
            $name = (string)($st['name'] ?? '');
            if ($name === 'manifest.json' || str_ends_with($name, '/')) {
                continue;
            }
            if (!pu_akt_pfad_ok($name) || !isset($liste[$name]) || isset($gesehen[$name])) {
                return $nein('Unerlaubte oder unbekannte Datei im Paket.');
            }
            $datei = $ziel . '/' . $name;
            @mkdir(dirname($datei), 0775, true);
            $ein = $zip->getStream($name);
            $aus = fopen($datei, 'wb');
            if ($ein === false || $aus === false) {
                return $nein('Eine Datei liess sich nicht entpacken.');
            }
            $h = hash_init('sha256');
            $n = 0;
            while (!feof($ein)) {
                $s = fread($ein, 1 << 16);
                if ($s === false) {
                    break;
                }
                $n += strlen($s);
                $summe += strlen($s);
                if ($n > PU_AKT_MAX_DATEI || $summe > PU_AKT_MAX_ENTPACKT) {
                    fclose($ein);
                    fclose($aus);
                    return $nein('Das Paket wäre entpackt zu gross.');
                }
                hash_update($h, $s);
                fwrite($aus, $s);
            }
            fclose($ein);
            fclose($aus);
            if (!hash_equals($liste[$name], hash_final($h))) {
                return $nein('Prüfsumme stimmt nicht: ' . $name);
            }
            $gesehen[$name] = true;
        }
        if (count($gesehen) !== count($liste)) {
            return $nein('Das Paket ist unvollständig.');
        }
        file_put_contents($ziel . '/manifest.json', json_encode($m, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
        return ['ok' => true, 'grund' => '', 'manifest' => $m];
    } finally {
        $zip->close();
        if ($kurz !== null) {
            @unlink($kurz);
        }
    }
}

/**
 * Lädt das angebotene Paket, prüft Grösse und SHA-256 gegen den signierten
 * Feed, entpackt und prüft jede Datei, legt `bereit.json` an.
 */
function pu_akt_laden(): array
{
    $a = pu_akt_stand()['angebot'];
    if (!is_array($a)) {
        return ['ok' => false, 'meldung' => 'Es gibt gerade keine neuere Fassung.'];
    }
    $f = $a['fassung'];
    $ordner = pu_akt_ordner($f);
    $zip = $ordner . '/paket.zip';
    $r = pu_akt_http(pu_akt_url() . 'paket.php?f=' . $f, null, $zip, PU_AKT_ZEIT_LADEN);
    if ($r['status'] !== 200 || !is_file($zip)) {
        pu_akt_ordner_weg($ordner);
        return ['ok' => false, 'meldung' => $r['status'] === 0 ? 'Der Update-Server war nicht erreichbar.'
            : 'Das Paket liess sich nicht laden (Antwort ' . $r['status'] . ').'];
    }
    if ((int)filesize($zip) !== (int)$a['groesse'] || !hash_equals($a['sha256'], hash_file('sha256', $zip))) {
        pu_akt_ordner_weg($ordner);
        return ['ok' => false, 'meldung' => 'Das geladene Paket stimmt nicht mit der Unterschrift überein. Es wurde verworfen.'];
    }
    $e = pu_akt_entpacken($zip, $ordner . '/neu', $f, pu_fassung());
    @unlink($zip);
    if (!$e['ok']) {
        pu_akt_ordner_weg($ordner);
        return ['ok' => false, 'meldung' => $e['grund']];
    }
    file_put_contents(pu_akt_ordner() . '/bereit.json', json_encode([
        'fassung' => $f, 'von' => pu_fassung(), 'sha256' => $a['sha256'], 'zeit' => gmdate('Y-m-d\TH:i:s\Z'),
    ], JSON_UNESCAPED_SLASHES));
    return ['ok' => true, 'meldung' => "Fassung $f ist geladen, geprüft und bereitgelegt."];
}

/** Startete die bat diese Academy (dann kann sie neu starten)? */
function pu_akt_neustart_moeglich(): bool
{
    return PHP_OS_FAMILY === 'Windows' && getenv('PU_START_BAT') === '1';
}

/** Merker für die bat: nach dem Beenden nicht aufhören, sondern neu starten. */
function pu_akt_neustart_merken(bool $zurueck = false): void
{
    $o = pu_akt_ordner();
    if ($zurueck) {
        file_put_contents($o . '/zurueck', gmdate('c'));
    }
    file_put_contents($o . '/neustart', gmdate('c'));
}

/** Rekursiv löschen — nur innerhalb des Update-Ordners. */
function pu_akt_ordner_weg(string $pfad): void
{
    $basis = realpath(pu_akt_ordner());
    $echt = realpath($pfad);
    if ($basis === false || $echt === false || !str_starts_with($echt, $basis)) {
        return;
    }
    if (is_dir($echt) && !is_link($echt)) {
        foreach (scandir($echt) ?: [] as $e) {
            if ($e !== '.' && $e !== '..') {
                pu_akt_ordner_weg($echt . DIRECTORY_SEPARATOR . $e);
            }
        }
        @rmdir($echt);
    } else {
        @unlink($echt);
    }
}

/** Vorhandene Sicherungen, neueste zuerst. */
function pu_akt_sicherungen(): array
{
    $aus = [];
    foreach (glob(pu_akt_ordner('sicherung') . '/*/info.json') ?: [] as $i) {
        $j = json_decode((string)file_get_contents($i), true);
        if (is_array($j) && empty($j['zurueckgenommen'])) {
            $aus[] = ['name' => basename(dirname($i)), 'von' => (string)($j['von'] ?? ''), 'nach' => (string)($j['nach'] ?? ''),
                      'zeit' => (string)($j['zeit'] ?? ''), 'pfad' => dirname($i)];
        }
    }
    usort($aus, static fn ($a, $b) => strcmp($b['name'], $a['name']));
    return $aus;
}

/**
 * Antwortet auf „neu starten“ und beendet danach den eigenen Prozess.
 *
 * Nur unter der bat (Windows, `PU_START_BAT=1`): Die bat sieht nach dem
 * Ende des Servers den Merker `neustart`, spielt ein (oder zurück) und startet
 * neu. Ohne bat wird nur der Merker für den nächsten Start gesetzt.
 *
 * Erst antworten, dann gehen — mit Länge, damit der Browser die Antwort
 * vollständig hat, bevor die Verbindung abreisst.
 */
function pu_akt_neustart_antworten(bool $zurueck): never
{
    if (!pu_akt_neustart_moeglich()) {
        if ($zurueck) {
            file_put_contents(pu_akt_ordner() . '/zurueck', gmdate('c'));
        }
        pu_json_out(['ok' => true, 'neustart' => false,
            'meldung' => 'Bitte die Academy beenden und mit promptheus-start.bat neu starten. Beim Start wird '
                       . ($zurueck ? 'die vorige Fassung wiederhergestellt.' : 'das Update eingespielt.')]);
    }
    pu_akt_neustart_merken($zurueck);
    $aus = (string)json_encode(['ok' => true, 'neustart' => true], JSON_UNESCAPED_UNICODE);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('Content-Length: ' . strlen($aus));
    header('Connection: close');
    echo $aus;
    flush();
    usleep(300000);
    // Nur der eigene Prozess. getmypid() ist eine Zahl; nichts von aussen fliesst ein.
    exec('taskkill /F /PID ' . (int)getmypid() . ' >NUL 2>&1');
    exit;
}
