<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — die Verbindung zum Relay.
 *
 * Die einzige Stelle im Programm, die mit unserem Server spricht. Alles
 * andere bleibt auf diesem Rechner.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * Was hier bewusst NICHT passiert
 *
 * **Keine Entscheidung wird hier getroffen.** Ob eine Installation
 * freigeschaltet ist, entscheidet der Server. Was dieses Programm mit der
 * Antwort macht, ist Anzeige — und Anzeige lässt sich auf einem fremden
 * Rechner ohnehin umschreiben. Wer hier eine Prüfung einbaut und sich darauf
 * verlässt, hat ein Schloss gebaut, dessen Schlüssel beim Einbrecher liegt.
 *
 * **Keine Inhalte im Protokoll.** Geloggt wird Zweck und Ergebnis, nie der
 * Rumpf und nie die Antwort.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * Offline ist ein Zustand, kein Fehler
 *
 * Die Academy läuft ohne Netz. Scheitert ein Aufruf, gibt diese Datei einen
 * Grund zurück und nichts weiter — sie wirft nicht, sie blockiert nicht, und
 * sie rechnet keinen Stand hoch. Der zuletzt bekannte Stand bleibt stehen,
 * mit seinem Zeitstempel daneben.
 */

require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/identitaet.php';

const PU_RELAY_ZEIT_VERBINDEN = 8;    // Sekunden bis zur Verbindung
const PU_RELAY_ZEIT_GESAMT    = 25;   // Sekunden für den ganzen Aufruf
const PU_RELAY_VERSUCHE       = 3;    // bei 5xx und Netzfehlern

/**
 * Die Gründe, die der Server nennt, in Sätzen.
 *
 * Der Server schickt Kürzel — er soll nichts über den Zustand verraten und
 * keine Sprache kennen müssen. Übersetzt wird hier, wo ohnehin die Sprache
 * des Nutzers bekannt ist.
 */
const PU_RELAY_GRUENDE = [
    'form'              => 'Die Anfrage war unvollständig. Bitte noch einmal versuchen.',
    'nicht_kanonisch'   => 'Die Anfrage war nicht in der erwarteten Form.',
    'zu_gross'          => 'Die Anfrage war zu gross.',
    'unbekannt'         => 'Diese Installation ist dem Server nicht bekannt. Zuerst registrieren.',
    'gesperrt'          => 'Diese Installation ist gesperrt. Der Kundenbereich sagt, warum.',
    'umgezogen'         => 'Diese Installation wurde auf einen anderen Rechner übertragen.',
    'mandant_gesperrt'  => 'Das Konto der Einrichtung ist gesperrt.',
    'notaus'            => 'Die Einrichtung hat den Zugang vorübergehend angehalten.',
    'zeit'              => 'Die Uhr dieses Rechners weicht zu stark ab. Bitte die Uhrzeit prüfen.',
    'wiederholt'        => 'Diese Anfrage lief schon. Bitte eine neue stellen.',
    'signatur'          => 'Die Unterschrift passt nicht. Der Schlüssel dieser Installation stimmt nicht mehr.',
    'code_unbekannt'    => 'Diesen Freischaltcode kennt der Server nicht.',
    'code_verbraucht'   => 'Dieser Freischaltcode wurde schon benutzt.',
    'code_abgelaufen'   => 'Dieser Freischaltcode ist abgelaufen. Im Kundenbereich einen neuen holen.',
    'schon_registriert' => 'Diese Installation ist bereits registriert.',
    'iid_passt_nicht'   => 'Schlüssel und Installations-ID passen nicht zusammen.',
    'schluessel'        => 'Der Schlüssel dieser Installation ist beschädigt.',
    'unbekannter_zweck' => 'Der Server kennt diese Anfrage nicht. Vermutlich ist das Programm älter als er.',
    'serverfehler'      => 'Auf dem Server ist etwas schiefgegangen. Später noch einmal versuchen.',
    'nur_post'          => 'Der Server hat die Anfrage abgewiesen.',
    'kein_netz'         => 'Keine Verbindung zum Server. Die Academy läuft weiter — nur der Kontostand bleibt stehen.',
    'keine_adresse'     => 'Es ist keine Serveradresse eingetragen (PU_RELAY_URL).',
    'keine_identitaet'  => 'Diese Installation hat noch keine Identität. Sie entsteht bei der Registrierung.',
    'antwort_unlesbar'  => 'Die Antwort des Servers war unlesbar.',
];

function pu_relay_grund_text(string $grund): string
{
    return PU_RELAY_GRUENDE[$grund] ?? 'Der Server hat die Anfrage abgewiesen (' . $grund . ').';
}

function pu_relay_url(): string
{
    return rtrim(pu_env('PU_RELAY_URL', ''), '/');
}

function pu_relay_nein(string $grund): array
{
    return ['ok' => false, 'grund' => $grund, 'text' => pu_relay_grund_text($grund)];
}

/**
 * Ein einzelner Aufruf. Nichts weiter — kein Wiederholen, kein Auswerten.
 *
 * Austauschbar, damit die Tests ohne Server laufen: `PU_RELAY_SENDER` nimmt
 * eine Funktion, die dasselbe liefert wie curl. Im Betrieb ist er leer.
 *
 * Die Wiederholung steht mit Absicht **nicht** hier, sondern eine Ebene
 * darueber. Sonst wuerde ein Test, der diese Funktion ersetzt, die
 * Wiederholungsregel gleich mit ersetzen — und genau die soll geprueft
 * werden. (Gefunden von tests/relay_test.php, 20.09.2026.)
 */
function pu_relay_transport(string $json): array
{
    $ersatz = $GLOBALS['PU_RELAY_SENDER'] ?? null;
    if (is_callable($ersatz)) {
        return $ersatz($json);
    }

    $ch = curl_init(pu_relay_url());
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $json,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => PU_RELAY_ZEIT_VERBINDEN,
        CURLOPT_TIMEOUT        => PU_RELAY_ZEIT_GESAMT,
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
        // Keine Umleitungen: Wer uns umleitet, bekommt unsere
        // unterschriebene Anfrage — und die gilt nur für unseren Server.
        CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
    ]);
    $bundle = function_exists('pu_ca_bundle') ? pu_ca_bundle() : '';
    if ($bundle !== '') {
        curl_setopt($ch, CURLOPT_CAINFO, $bundle);
    }
    $rumpf  = curl_exec($ch);
    $status = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);

    return ['status' => $status, 'rumpf' => is_string($rumpf) ? $rumpf : ''];
}

/**
 * Schickt einen Rumpf und wiederholt, wo Wiederholen etwas bringt.
 *
 * **Nur bei Netzfehlern und 5xx.** Ein 4xx noch zweimal zu senden heisst,
 * denselben abgelehnten Freischaltcode dreimal zu verbrennen — und beim
 * Relay dreimal in die Mengenbegrenzung zu laufen, die es spaeter geben wird.
 *
 * Die Pause waechst mit dem Versuch. Drei Aufrufe im selben Augenblick sind
 * kein Wiederholen, sondern dreimal derselbe Fehlschlag.
 */
function pu_relay_senden_roh(string $json): array
{
    $letzter = ['status' => 0, 'rumpf' => ''];
    for ($versuch = 1; $versuch <= PU_RELAY_VERSUCHE; $versuch++) {
        $letzter = pu_relay_transport($json);
        if ($letzter['status'] !== 0 && $letzter['status'] < 500) {
            break;
        }
        if ($versuch < PU_RELAY_VERSUCHE) {
            usleep(50000 * $versuch);
        }
    }
    return $letzter;
}

/**
 * Baut eine unterschriebene Anfrage, schickt sie und liest die Antwort.
 */
function pu_relay_ruf(string $zweck, array $nutzlast = []): array
{
    if (pu_relay_url() === '') {
        return pu_relay_nein('keine_adresse');
    }
    if (!pu_ident_vorhanden()) {
        return pu_relay_nein('keine_identitaet');
    }

    try {
        $anfrage = pu_ident_anfrage($zweck, $nutzlast);
    } catch (Throwable $f) {
        return pu_relay_nein('keine_identitaet');
    }

    $antwort = pu_relay_senden_roh((string)json_encode($anfrage,
        JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));

    if ($antwort['status'] === 0) {
        return pu_relay_nein('kein_netz');
    }
    $daten = json_decode($antwort['rumpf'], true);
    if (!is_array($daten)) {
        return pu_relay_nein('antwort_unlesbar');
    }
    if (($daten['ok'] ?? false) !== true) {
        $grund = (string)($daten['grund'] ?? 'serverfehler');
        return pu_relay_nein($grund);
    }
    $daten['ok'] = true;
    return $daten;
}

/**
 * Registrierung: der Freischaltcode wird gegen eine Bescheinigung getauscht.
 *
 * **Hier entsteht die Identität** — nicht bei der Installation. Wer nur die
 * Kurse 1 bis 6 spielt, bekommt keinen Schlüssel.
 */
function pu_relay_registrieren(string $code): array
{
    $code = trim($code);
    if ($code === '') {
        return pu_relay_nein('form');
    }
    if (pu_relay_url() === '') {
        return pu_relay_nein('keine_adresse');
    }

    try {
        pu_ident_erzeugen();
    } catch (Throwable $f) {
        return pu_relay_nein('keine_identitaet');
    }

    $aus = pu_relay_ruf('registrieren', [
        'code'      => $code,
        'fassung'   => pu_env('PU_FASSUNG', ''),
        // Nur die Art des Systems, nie der Gerätename. Der Server braucht sie
        // für die Statistik und für das Einrichtungsskript der Werkstatt —
        // mehr sagt sie nicht, und mehr soll sie nicht sagen.
        'systemart' => pu_relay_systemart(),
    ]);
    if (!$aus['ok']) {
        return $aus;
    }

    // Der Server nennt seinen öffentlichen Schlüssel mit. Übernommen wird er
    // nur, wenn noch keiner eingetragen ist: sonst könnte ein
    // untergeschobener Server den echten verdrängen.
    if (pu_env('PU_VPS_SCHLUESSEL', '') === '' && isset($aus['vps_schluessel'])
        && function_exists('pu_env_setzen')) {
        pu_env_setzen('PU_VPS_SCHLUESSEL', (string)$aus['vps_schluessel']);
    }

    if (!pu_ident_bescheinigung_setzen(
            (array)$aus['bescheinigung'], (string)$aus['signatur'])) {
        return pu_relay_nein('signatur');
    }
    return ['ok' => true, 'bescheinigung' => $aus['bescheinigung']];
}

/**
 * Stand ziehen. Erneuert nebenbei die Bescheinigung.
 *
 * Der gezogene Stand wird **neben** den lokalen gestellt, nicht darüber:
 * lokal steht, was hier verbraucht wurde, zentral steht, was der Server
 * gebucht hat. Zwei Zahlen, die dasselbe behaupten und auseinanderlaufen
 * können, wären schlimmer als eine fehlende.
 */
function pu_relay_stand(): array
{
    $aus = pu_relay_ruf('stand');
    if (!$aus['ok']) {
        return $aus;
    }
    if (isset($aus['bescheinigung'], $aus['signatur'])) {
        pu_ident_bescheinigung_setzen((array)$aus['bescheinigung'], (string)$aus['signatur']);
    }
    return ['ok' => true, 'stand' => $aus['stand'] ?? [],
            'gezogen_am' => gmdate('Y-m-d\TH:i:s\Z')];
}

/** windows, macos oder linux — sonst nichts. */
function pu_relay_systemart(): string
{
    return match (PHP_OS_FAMILY) {
        'Windows' => 'windows',
        'Darwin'  => 'macos',
        'Linux'   => 'linux',
        default   => '',
    };
}

/**
 * Was die Oberfläche anzeigt: verbunden, offline, nicht registriert.
 *
 * Fragt **nicht** beim Server nach. Ein Reiter in den Einstellungen darf
 * nicht bei jedem Öffnen eine Netzanfrage auslösen.
 */
function pu_relay_zustand(): array
{
    $b = pu_ident_bescheinigung();
    return [
        'adresse'      => pu_relay_url() !== '',
        'registriert'  => pu_ident_vorhanden(),
        'iid'          => pu_ident_vorhanden() ? pu_ident_iid() : '',
        'bescheinigt'  => $b !== null,
        'gueltig'      => pu_ident_gueltig(),
        'gueltig_bis'  => (string)($b['gueltig_bis'] ?? ''),
        'plan'         => (string)($b['plan'] ?? ''),
    ];
}
