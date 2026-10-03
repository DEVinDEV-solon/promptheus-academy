<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — der Audit-Trail: was Academy, Schutzschicht und Werkstatt
 * getan haben, manipulationssicher und ohne Geheimnisse.
 *
 * Übernommen aus dem Hermy Audit-Trail (`scripts/audittrail`, Python), dort
 * erprobt. Dieselben drei Zusagen:
 *
 *   1. **Schwärzen vor dem Speichern.** Schlüssel, Tokens, Kennwörter werden zu
 *      `[REDACTED:typ]`, E-Mail und IBAN zu einem festen Pseudonym
 *      `[PII:typ:#…]`, die übrigen harten PII-Treffer der Academy zu „xxx“.
 *      Der Audit-Trail beweist, DASS etwas geschah, nie mit dem Wert selbst.
 *   2. **Hash-Kette.** `entry_hash = sha256(prev_hash + "\n" + kanonisches JSON)`
 *      über alle Felder ausser der Kette selbst. Jede nachträgliche Änderung,
 *      Umsortierung oder Löschung bricht die Kette ab der Stelle;
 *      pu_audit_pruefen() nennt die erste kaputte Laufnummer. Die Rechnung ist
 *      dieselbe wie bei Hermy, ein Export lässt sich dort nachprüfen.
 *   3. **Anker.** Eine Kette allein merkt nicht, wenn die NEUESTEN Einträge
 *      fehlen — sie endet nur früher. Jeder Eintrag schreibt deshalb auch
 *      „seq hash“ in eine Ankerdatei daneben; die Prüfung vergleicht beides.
 *
 * **Eine eigene Ebene.** Die Daten liegen in `data/audit/audit.sqlite`, nicht in
 * der Datenbank der Academy. Die Tabelle ist per Auslöser nur anhängbar:
 * UPDATE und DELETE brechen ab.
 *
 * **Woher die Einträge kommen.** Die Academy schreibt direkt (pu_audit). Die
 * Schutzschicht und der Sitzungsleser der Werkstatt laufen in Node und
 * schreiben Zeilen in `data/audit/spool/*.jsonl`; pu_audit_einlesen() nimmt
 * sie in die Kette auf — idempotent über die `audit_id`, und noch einmal
 * geschwärzt. Was dort ankommt, wird nicht geglaubt, sondern behandelt wie
 * jede andere Eingabe.
 */

require_once PU_ROOT . '/srv/pii.php';

/** Der Ordner des Audit-Trails. Tests legen ihn über PU_TEST_AUDIT um. */
function pu_audit_ordner(): string
{
    $t = getenv('PU_TEST_AUDIT');
    return is_string($t) && $t !== '' ? $t : PU_DATA . '/audit';
}

/** Der Anfang jeder Kette. */
const PU_AUDIT_GENESIS = '0000000000000000000000000000000000000000000000000000000000000000';

/** Die Felder, die in den Hash eingehen — in dieser Reihenfolge, wie bei Hermy. */
const PU_AUDIT_FELDER = [
    'audit_id', 'ts',
    'actor_type', 'actor_id', 'actor_role',
    'action_type', 'action_category', 'action_description',
    'resource', 'outcome', 'severity',
    'project', 'tenant', 'session_id', 'model',
    'metadata', 'pii_handling', 'retention_days',
];

/** Erlaubte Werte; alles andere wird auf die Vorgabe gesetzt, nicht abgelehnt. */
const PU_AUDIT_ERGEBNISSE = ['success', 'allowed', 'blocked', 'denied', 'error', 'pending'];
const PU_AUDIT_STUFEN     = ['info', 'warning', 'critical'];
const PU_AUDIT_AKTEURE    = ['user', 'agent', 'system'];

/** Die Quellen, nach denen die Oberfläche filtert (metadata.source). */
const PU_AUDIT_QUELLEN = [
    'academy'       => 'Academy',
    'schutzschicht' => 'Schutzschicht',
    'werkstatt'     => 'Werkstatt-Sitzung',
];

// ═════════════════════════════════════════════════════════════════════════════
// Schwärzen
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Geheimnisse, spezifisch vor allgemein. Wortgleich mit Hermy
 * (`audittrail/redaction.py`) und mit `werkstatt/werkzeuge/schutz/maske.mjs`.
 *
 * @return list<array{0:string,1:string}>  [Typ, PCRE]
 */
function pu_audit_geheim_muster(): array
{
    return [
        ['private-key', '/-----BEGIN[ A-Z]*PRIVATE KEY-----[\s\S]*?-----END[ A-Z]*PRIVATE KEY-----/'],
        ['aws-access-key', '/\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/'],
        ['jwt', '/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/'],
        ['bearer-token', '/\b[Bb]earer\s+[A-Za-z0-9._\-]{12,}/'],
        ['slack-token', '/\bxox[baprs]-[A-Za-z0-9-]{10,}\b/'],
        ['github-token', '/\bgh[pousr]_[A-Za-z0-9]{20,}\b/'],
        ['openai-key', '/\bsk-[A-Za-z0-9_\-]{20,}\b/'],
        ['telegram-bot-token', '/\b\d{6,12}:[A-Za-z0-9_\-]{30,}\b/'],
        ['google-oauth-secret', '/\bGOCSPX-[A-Za-z0-9_\-]{20,}/'],
        ['google-api-key', '/\bAIza[0-9A-Za-z_\-]{30,}/'],
        ['google-refresh-token', '/\b1\/\/[0-9A-Za-z_\-]{30,}/'],
        // Undurchsichtige Zeichenketten: Buchstaben UND Ziffern, mindestens 32.
        ['opaque-token', '/(?<![A-Za-z0-9_\-])(?=[A-Za-z0-9_\-#]*\d)(?=[A-Za-z0-9_\-#]*[A-Za-z])'
            . '[A-Za-z0-9_\-]{32,}(?:#[A-Za-z0-9_\-]{8,})?(?![A-Za-z0-9_\-])/'],
    ];
}

/** „schlüssel = wert“ mit einem Namen, der nach Geheimnis klingt. */
const PU_AUDIT_ZUWEISUNG = '/(?i)(?P<k>(?:api[_-]?key|secret|password|passwd|passwort|kennwort|token|access[_-]?key|private[_-]?key))(?P<sep>\s*[:=]\s*)(?P<v>[\'"]?[A-Za-z0-9\/+_\-\.]{8,}[\'"]?)/';

/** Das Salz für Pseudonyme: zufällig je Installation, nie im Protokoll. */
function pu_audit_salz(): string
{
    static $salz = null;
    if ($salz !== null) return $salz;
    $pfad = pu_audit_ordner() . '/salz';
    if (is_file($pfad)) {
        $salz = trim((string)file_get_contents($pfad));
        if ($salz !== '') return $salz;
    }
    pu_audit_ordner_anlegen();
    $salz = bin2hex(random_bytes(16));
    @file_put_contents($pfad, $salz, LOCK_EX);
    @chmod($pfad, 0600);
    return $salz;
}

/** Ersetzt jedes Geheimnis durch seinen Typ. */
function pu_audit_geheim_schwaerzen(string $text): string
{
    if ($text === '') return $text;
    foreach (pu_audit_geheim_muster() as [$typ, $muster]) {
        $text = (string)preg_replace($muster, '[REDACTED:' . $typ . ']', $text);
    }
    return (string)preg_replace_callback(PU_AUDIT_ZUWEISUNG,
        static fn($m) => $m['k'] . $m['sep'] . '[REDACTED:generic-secret]', $text);
}

/**
 * Schwärzt einen Text vollständig: Geheimnisse, dann E-Mail/IBAN als festes
 * Pseudonym (gleicher Wert → gleiches Zeichen, so bleiben Einträge derselben
 * Person zuordenbar), dann die harten PII-Regeln der Academy.
 */
function pu_audit_schwaerzen(string $text): string
{
    if ($text === '') return $text;
    $text = pu_audit_geheim_schwaerzen($text);
    $salz = pu_audit_salz();
    foreach ([
        'email' => '/\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b/',
        'iban'  => '/\b[A-Z]{2}\d{2}(?:[ ]?[A-Za-z0-9]){11,30}\b/',
    ] as $typ => $muster) {
        $text = (string)preg_replace_callback($muster, static fn($m) =>
            '[PII:' . $typ . ':#' . substr(hash('sha256', $salz . '|' . $m[0]), 0, 12) . ']', $text);
    }
    try {
        $text = pu_pii_pruefen($text, true)['text'];
    } catch (Throwable $e) {
        // Ohne Regelwerk bleibt es bei Geheimnissen und Pseudonymen. Das Protokoll
        // darf deshalb nicht stehen bleiben; es fällt aber in der Prüfung auf.
    }
    return $text;
}

/** Schlüssel in `metadata`, deren Werte Kennungen sind und nicht geschwärzt werden. */
function pu_audit_kennungs_schluessel(string $k): bool
{
    return (bool)preg_match('/(^|_)(id|ids|hash|sha256|seq|nonce_sha256|call_id)$/i', $k);
}

/** Schwärzt alle Text-Blätter einer Struktur (ausser Kennungsfeldern). */
function pu_audit_schwaerzen_tief(mixed $wert, string $schluessel = ''): mixed
{
    if (is_string($wert)) {
        return pu_audit_kennungs_schluessel($schluessel) ? $wert : pu_audit_schwaerzen($wert);
    }
    if (is_array($wert)) {
        $aus = [];
        foreach ($wert as $k => $v) $aus[$k] = pu_audit_schwaerzen_tief($v, is_string($k) ? $k : $schluessel);
        return $aus;
    }
    return $wert;
}

// ═════════════════════════════════════════════════════════════════════════════
// Speicher
// ═════════════════════════════════════════════════════════════════════════════

function pu_audit_ordner_anlegen(): void
{
    $o = pu_audit_ordner();
    foreach ([$o, $o . '/spool'] as $d) {
        if (!is_dir($d) && !@mkdir($d, 0700, true) && !is_dir($d)) {
            throw new RuntimeException('Audit-Ordner nicht anlegbar.');
        }
    }
}

function pu_audit_db(): PDO
{
    static $pdo = null, $fuer = null;
    $pfad = pu_audit_ordner() . '/audit.sqlite';
    if ($pdo instanceof PDO && $fuer === $pfad) return $pdo;

    pu_audit_ordner_anlegen();
    $pdo = new PDO('sqlite:' . $pfad, null, null, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
    $fuer = $pfad;
    $pdo->exec('PRAGMA journal_mode = WAL');
    $pdo->exec('PRAGMA busy_timeout = 5000');
    $pdo->exec('CREATE TABLE IF NOT EXISTS events (
        seq INTEGER PRIMARY KEY AUTOINCREMENT,
        audit_id TEXT NOT NULL UNIQUE,
        ts TEXT NOT NULL,
        actor_type TEXT, actor_id TEXT, actor_role TEXT,
        action_type TEXT, action_category TEXT, action_description TEXT,
        resource TEXT, outcome TEXT, severity TEXT,
        project TEXT, tenant TEXT, session_id TEXT, model TEXT,
        metadata TEXT, pii_handling TEXT, retention_days INTEGER,
        prev_hash TEXT NOT NULL, entry_hash TEXT NOT NULL,
        lernender INTEGER, quelle TEXT)');
    $pdo->exec('CREATE INDEX IF NOT EXISTS events_ts ON events(ts)');
    $pdo->exec('CREATE INDEX IF NOT EXISTS events_lernender ON events(lernender)');
    $pdo->exec('CREATE INDEX IF NOT EXISTS events_quelle ON events(quelle)');
    // Nur anhängen. Wer hier ändern will, muss die Auslöser löschen — und das
    // bricht die Kette sichtbar, sobald er etwas umschreibt.
    $pdo->exec("CREATE TRIGGER IF NOT EXISTS events_nur_anhaengen_u BEFORE UPDATE ON events
                BEGIN SELECT RAISE(ABORT, 'audit: nur anhaengen'); END");
    $pdo->exec("CREATE TRIGGER IF NOT EXISTS events_nur_anhaengen_d BEFORE DELETE ON events
                BEGIN SELECT RAISE(ABORT, 'audit: nur anhaengen'); END");
    return $pdo;
}

/** Kanonisches JSON wie Pythons json.dumps(sort_keys=True, separators=(',',':'), ensure_ascii=False). */
function pu_audit_kanonisch(mixed $wert): string
{
    $sortiert = static function (mixed $w) use (&$sortiert): mixed {
        if (!is_array($w)) return $w;
        if ($w === []) return new stdClass();
        if (array_is_list($w)) return array_map($sortiert, $w);
        ksort($w, SORT_STRING);
        return (object)array_map($sortiert, $w);
    };
    return (string)json_encode($sortiert($wert),
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRESERVE_ZERO_FRACTION);
}

/** Der Hash eines Eintrags aus seinem Vorgänger und seinen Feldern. */
function pu_audit_hash(string $vorher, array $felder): string
{
    $nutzlast = [];
    foreach (PU_AUDIT_FELDER as $f) $nutzlast[$f] = $felder[$f] ?? null;
    return hash('sha256', $vorher . "\n" . pu_audit_kanonisch($nutzlast));
}

function pu_audit_jetzt(): string
{
    return gmdate('Y-m-d\TH:i:s\Z');
}

/**
 * Hängt einen Eintrag an. Der einzige Schreibweg.
 *
 * Fehlende Felder bekommen Vorgaben; unbekannte Werte für Ergebnis, Stufe und
 * Akteur fallen auf die Vorgabe zurück. Gibt es die `audit_id` schon, passiert
 * nichts (idempotent) — so kann der Spool beliebig oft eingelesen werden.
 *
 * @return array{seq:int, audit_id:string, neu:bool}
 */
function pu_audit_schreiben(array $e): array
{
    $id = (string)($e['audit_id'] ?? '');
    if (!preg_match('/^[A-Za-z0-9_\-]{6,80}$/', $id)) {
        $id = 'aud_' . gmdate('Ymd') . '_' . bin2hex(random_bytes(6));
    }
    $meta = $e['metadata'] ?? [];
    if (!is_array($meta)) $meta = [];
    $meta = pu_audit_schwaerzen_tief($meta);

    $felder = [
        'audit_id'           => $id,
        'ts'                 => preg_match('/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/', (string)($e['ts'] ?? ''))
                                ? (string)$e['ts'] : pu_audit_jetzt(),
        'actor_type'         => in_array($e['actor_type'] ?? '', PU_AUDIT_AKTEURE, true) ? $e['actor_type'] : 'system',
        'actor_id'           => mb_substr(pu_audit_schwaerzen((string)($e['actor_id'] ?? 'system')), 0, 80),
        'actor_role'         => mb_substr((string)($e['actor_role'] ?? 'system'), 0, 40),
        'action_type'        => mb_substr(preg_replace('/[^a-z0-9_\-]/', '', strtolower((string)($e['action_type'] ?? 'event'))) ?: 'event', 0, 60),
        'action_category'    => mb_substr((string)($e['action_category'] ?? 'operation'), 0, 40),
        'action_description' => mb_substr(pu_audit_schwaerzen((string)($e['action_description'] ?? '')), 0, 1000),
        'resource'           => mb_substr(pu_audit_schwaerzen((string)($e['resource'] ?? '')), 0, 400),
        'outcome'            => in_array($e['outcome'] ?? '', PU_AUDIT_ERGEBNISSE, true) ? $e['outcome'] : 'success',
        'severity'           => in_array($e['severity'] ?? '', PU_AUDIT_STUFEN, true) ? $e['severity'] : 'info',
        'project'            => mb_substr((string)($e['project'] ?? 'promptheus'), 0, 120),
        'tenant'             => mb_substr((string)($e['tenant'] ?? ''), 0, 60),
        'session_id'         => mb_substr(preg_replace('/[^A-Za-z0-9_\-:.]/', '', (string)($e['session_id'] ?? '')), 0, 120),
        'model'              => mb_substr(pu_audit_schwaerzen((string)($e['model'] ?? '')), 0, 120),
        'metadata'           => $meta,
        'pii_handling'       => mb_substr((string)($e['pii_handling'] ?? 'masked'), 0, 30),
        'retention_days'     => max(1, min(3650, (int)($e['retention_days'] ?? 365))),
    ];
    $lernender = isset($meta['lernender']) && is_numeric($meta['lernender']) ? (int)$meta['lernender'] : null;
    $quelle    = is_string($meta['source'] ?? null) ? mb_substr($meta['source'], 0, 30) : 'academy';

    $db = pu_audit_db();
    $db->exec('BEGIN IMMEDIATE');
    try {
        $da = $db->prepare('SELECT seq FROM events WHERE audit_id = ?');
        $da->execute([$id]);
        $vorhanden = $da->fetchColumn();
        if ($vorhanden !== false) {
            $db->exec('COMMIT');
            return ['seq' => (int)$vorhanden, 'audit_id' => $id, 'neu' => false];
        }
        $letzter = $db->query('SELECT entry_hash FROM events ORDER BY seq DESC LIMIT 1')->fetchColumn();
        $vorher  = $letzter === false ? PU_AUDIT_GENESIS : (string)$letzter;
        $hash    = pu_audit_hash($vorher, $felder);

        $spalten = array_merge(PU_AUDIT_FELDER, ['prev_hash', 'entry_hash', 'lernender', 'quelle']);
        $werte = [];
        foreach (PU_AUDIT_FELDER as $f) {
            $werte[] = $f === 'metadata' ? pu_audit_kanonisch($felder['metadata']) : $felder[$f];
        }
        array_push($werte, $vorher, $hash, $lernender, $quelle);
        $db->prepare('INSERT INTO events (' . implode(',', $spalten) . ') VALUES ('
            . implode(',', array_fill(0, count($spalten), '?')) . ')')->execute($werte);
        $seq = (int)$db->lastInsertId();
        $db->exec('COMMIT');
    } catch (Throwable $t) {
        $db->exec('ROLLBACK');
        throw $t;
    }
    @file_put_contents(pu_audit_ordner() . '/audit.anker', $seq . ' ' . $hash . "\n", FILE_APPEND | LOCK_EX);
    return ['seq' => $seq, 'audit_id' => $id, 'neu' => true];
}

/**
 * Ein Eintrag der Academy, im Namen eines Kontos. Scheitert er, läuft der
 * Betrieb weiter; die Fehlerdatei nimmt es auf (wie pu_protokoll).
 */
function pu_audit(int $lernender, string $aktion, string $beschreibung, array $mehr = []): void
{
    try {
        $meta = array_merge(['source' => 'academy'], $mehr['metadata'] ?? []);
        if ($lernender > 0) $meta['lernender'] = $lernender;
        pu_audit_schreiben([
            'actor_type'         => $mehr['actor_type'] ?? ($lernender > 0 ? 'user' : 'system'),
            'actor_id'           => $lernender > 0 ? 'L-' . $lernender : 'academy',
            'actor_role'         => $mehr['actor_role'] ?? 'lernender',
            'action_type'        => $aktion,
            'action_category'    => $mehr['action_category'] ?? 'operation',
            'action_description' => $beschreibung,
            'resource'           => $mehr['resource'] ?? '',
            'outcome'            => $mehr['outcome'] ?? 'success',
            'severity'           => $mehr['severity'] ?? 'info',
            'metadata'           => $meta,
            'retention_days'     => $mehr['retention_days'] ?? 365,
        ]);
    } catch (Throwable $e) {
        @file_put_contents(PU_LOGS . '/fehler.log', pu_jetzt() . ' audit: ' . $e->getMessage() . "\n", FILE_APPEND);
    }
}

// ═════════════════════════════════════════════════════════════════════════════
// Prüfen
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Rechnet die ganze Kette nach.
 *
 * @return array{ok:bool, anzahl:int, bruch_seq:?int, grund:string, luecken:list<array{0:int,1:int}>,
 *               anker:array{ok:?bool,grund:string}, kopf:string}
 */
function pu_audit_pruefen(): array
{
    $db = pu_audit_db();
    $vorher = PU_AUDIT_GENESIS;
    $anzahl = 0; $bruch = null; $grund = ''; $luecken = []; $letzteSeq = null; $kopf = '';
    $st = $db->query('SELECT * FROM events ORDER BY seq ASC');
    while ($z = $st->fetch()) {
        $anzahl++;
        $seq = (int)$z['seq'];
        if ($letzteSeq !== null && $seq !== $letzteSeq + 1) $luecken[] = [$letzteSeq + 1, $seq - 1];
        $letzteSeq = $seq;
        if ($bruch !== null) continue;
        $felder = $z;
        $felder['metadata'] = json_decode((string)$z['metadata'], true) ?? [];
        $felder['retention_days'] = (int)$z['retention_days'];
        if ($z['prev_hash'] !== $vorher) {
            $bruch = $seq; $grund = 'Verweis auf den Vorgänger stimmt nicht';
        } elseif (pu_audit_hash($vorher, $felder) !== $z['entry_hash']) {
            $bruch = $seq; $grund = 'Inhalt wurde nach dem Schreiben verändert';
        }
        $vorher = (string)$z['entry_hash'];
        $kopf = $vorher;
    }

    // Der Anker: die letzte Zeile der Ankerdatei muss in der Datenbank stehen.
    $anker = ['ok' => null, 'grund' => 'noch kein Anker'];
    $pfad = pu_audit_ordner() . '/audit.anker';
    if (is_file($pfad)) {
        $zeilen = file($pfad, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
        $letzte = trim((string)end($zeilen));
        if (preg_match('/^(\d+) ([0-9a-f]{64})$/', $letzte, $m)) {
            $h = $db->prepare('SELECT entry_hash FROM events WHERE seq = ?');
            $h->execute([(int)$m[1]]);
            $treffer = $h->fetchColumn();
            if ($treffer === false) {
                $anker = ['ok' => false, 'grund' => 'Einträge nach Laufnummer ' . (int)$m[1] . ' fehlen in der Datenbank'];
            } elseif ($treffer !== $m[2]) {
                $anker = ['ok' => false, 'grund' => 'Eintrag ' . (int)$m[1] . ' passt nicht zum Anker'];
            } else {
                $anker = ['ok' => true, 'grund' => 'Anker stimmt (Laufnummer ' . (int)$m[1] . ')'];
            }
        }
    }

    return [
        'ok'        => $bruch === null && $luecken === [] && $anker['ok'] !== false,
        'anzahl'    => $anzahl,
        'bruch_seq' => $bruch,
        'grund'     => $grund,
        'luecken'   => $luecken,
        'anker'     => $anker,
        'kopf'      => $kopf,
    ];
}

// ═════════════════════════════════════════════════════════════════════════════
// Spool: was Node schreibt
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Nimmt neue Zeilen aus `spool/*.jsonl` in die Kette auf.
 *
 * Merkt sich je Datei, bis wohin gelesen wurde (`.offsets.json`). Eine halbe
 * letzte Zeile (die Datei wird gerade geschrieben) bleibt für das nächste Mal.
 *
 * @return array{neu:int, doppelt:int, kaputt:int, dateien:int}
 */
function pu_audit_einlesen(): array
{
    pu_audit_ordner_anlegen();
    $ordner  = pu_audit_ordner() . '/spool';
    $merkPfad = $ordner . '/.offsets.json';
    $merk = is_file($merkPfad) ? (json_decode((string)file_get_contents($merkPfad), true) ?: []) : [];
    $aus = ['neu' => 0, 'doppelt' => 0, 'kaputt' => 0, 'dateien' => 0];

    foreach (glob($ordner . '/*.jsonl') ?: [] as $datei) {
        $name = basename($datei);
        $groesse = (int)filesize($datei);
        $ab = (int)($merk[$name] ?? 0);
        if ($ab > $groesse) $ab = 0;                // neu angelegt
        if ($ab === $groesse) continue;
        $aus['dateien']++;
        $h = fopen($datei, 'rb');
        if ($h === false) continue;
        fseek($h, $ab);
        while (($zeile = fgets($h)) !== false) {
            if (!str_ends_with($zeile, "\n")) break;  // halbe Zeile: später
            $ab += strlen($zeile);
            $e = json_decode(trim($zeile), true);
            if (!is_array($e)) { $aus['kaputt']++; continue; }
            $e = array_intersect_key($e, array_flip(PU_AUDIT_FELDER));
            if (!is_array($e['metadata'] ?? null)) $e['metadata'] = [];
            // Die Quelle bestimmt nicht der Schreiber allein: nur bekannte Werte.
            if (!isset(PU_AUDIT_QUELLEN[$e['metadata']['source'] ?? ''])) $e['metadata']['source'] = 'werkstatt';
            try {
                $r = pu_audit_schreiben($e);
                $r['neu'] ? $aus['neu']++ : $aus['doppelt']++;
            } catch (Throwable $t) {
                $aus['kaputt']++;
            }
        }
        fclose($h);
        $merk[$name] = $ab;
    }
    @file_put_contents($merkPfad, json_encode($merk), LOCK_EX);
    return $aus;
}

// ═════════════════════════════════════════════════════════════════════════════
// Lesen
// ═════════════════════════════════════════════════════════════════════════════

/**
 * WHERE-Teil aus den Filtern der Oberfläche. Alles geht als Parameter hinein.
 *
 * @param ?int $nurLernender  gesetzt: nur Einträge dieses Kontos
 * @return array{0:string,1:list<mixed>}
 */
function pu_audit_bedingung(array $f, ?int $nurLernender): array
{
    $w = []; $p = [];
    if ($nurLernender !== null) { $w[] = 'lernender = ?'; $p[] = $nurLernender; }
    if (preg_match('/^\d{4}-\d\d-\d\d$/', (string)($f['von'] ?? ''))) { $w[] = 'ts >= ?'; $p[] = $f['von'] . 'T00:00:00Z'; }
    if (preg_match('/^\d{4}-\d\d-\d\d$/', (string)($f['bis'] ?? ''))) { $w[] = 'ts <= ?'; $p[] = $f['bis'] . 'T23:59:59Z'; }
    foreach (['outcome' => PU_AUDIT_ERGEBNISSE, 'severity' => PU_AUDIT_STUFEN, 'actor_type' => PU_AUDIT_AKTEURE] as $feld => $erlaubt) {
        if (in_array($f[$feld] ?? '', $erlaubt, true)) { $w[] = "$feld = ?"; $p[] = $f[$feld]; }
    }
    if (isset(PU_AUDIT_QUELLEN[$f['quelle'] ?? ''])) { $w[] = 'quelle = ?'; $p[] = $f['quelle']; }
    if (preg_match('/^[a-z0-9_\-]{2,60}$/', (string)($f['action_type'] ?? ''))) { $w[] = 'action_type = ?'; $p[] = $f['action_type']; }
    if (preg_match('/^[A-Za-z0-9_\-:.]{4,120}$/', (string)($f['session_id'] ?? ''))) { $w[] = 'session_id = ?'; $p[] = $f['session_id']; }
    $q = trim((string)($f['q'] ?? ''));
    if ($q !== '') {
        $like = '%' . str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], mb_substr($q, 0, 80)) . '%';
        $w[] = "(action_description LIKE ? ESCAPE '\\' OR resource LIKE ? ESCAPE '\\' OR action_type LIKE ? ESCAPE '\\')";
        array_push($p, $like, $like, $like);
    }
    return [$w === [] ? '' : 'WHERE ' . implode(' AND ', $w), $p];
}

/** Eine Zeile für die Oberfläche. */
function pu_audit_zeile(array $z): array
{
    $z['seq'] = (int)$z['seq'];
    $z['retention_days'] = (int)$z['retention_days'];
    $z['lernender'] = $z['lernender'] === null ? null : (int)$z['lernender'];
    $z['metadata'] = json_decode((string)$z['metadata'], true) ?? [];
    return $z;
}

/** @return array{eintraege:list<array>, gesamt:int, seite:int, je:int} */
function pu_audit_liste(array $f, int $seite, int $je, ?int $nurLernender): array
{
    $je = max(10, min(200, $je));
    $seite = max(1, $seite);
    [$wo, $p] = pu_audit_bedingung($f, $nurLernender);
    $db = pu_audit_db();
    $n = $db->prepare("SELECT COUNT(*) FROM events $wo");
    $n->execute($p);
    $st = $db->prepare("SELECT * FROM events $wo ORDER BY seq DESC LIMIT $je OFFSET " . (($seite - 1) * $je));
    $st->execute($p);
    return [
        'eintraege' => array_map('pu_audit_zeile', $st->fetchAll()),
        'gesamt'    => (int)$n->fetchColumn(),
        'seite'     => $seite,
        'je'        => $je,
    ];
}

/** Kennzahlen für die Kopfzeile und die Diagramme. */
function pu_audit_kennzahlen(?int $nurLernender): array
{
    [$wo, $p] = pu_audit_bedingung([], $nurLernender);
    $db = pu_audit_db();
    $zaehl = static function (string $spalte) use ($db, $wo, $p): array {
        $st = $db->prepare("SELECT $spalte AS k, COUNT(*) AS n FROM events $wo GROUP BY $spalte ORDER BY n DESC LIMIT 12");
        $st->execute($p);
        $aus = [];
        foreach ($st->fetchAll() as $z) $aus[(string)$z['k']] = (int)$z['n'];
        return $aus;
    };
    $ab = gmdate('Y-m-d', time() - 13 * 86400) . 'T00:00:00Z';
    $tage = $db->prepare('SELECT substr(ts,1,10) AS tag, COUNT(*) AS n FROM events '
        . ($wo === '' ? 'WHERE' : $wo . ' AND') . ' ts >= ? GROUP BY tag ORDER BY tag');
    $tage->execute(array_merge($p, [$ab]));
    $proTag = [];
    for ($i = 13; $i >= 0; $i--) $proTag[gmdate('Y-m-d', time() - $i * 86400)] = 0;
    foreach ($tage->fetchAll() as $z) $proTag[$z['tag']] = (int)$z['n'];

    // Was die Schutzschicht ersetzt hat, summiert nach Art (nur Zahlen).
    $maskiert = [];
    $ms = $db->prepare("SELECT metadata FROM events " . ($wo === '' ? 'WHERE' : $wo . ' AND') . " quelle = 'schutzschicht'");
    $ms->execute($p);
    foreach ($ms->fetchAll(PDO::FETCH_COLUMN) as $m) {
        foreach ((json_decode((string)$m, true)['maskiert'] ?? []) as $art => $n) {
            if (is_string($art) && is_numeric($n)) $maskiert[$art] = ($maskiert[$art] ?? 0) + (int)$n;
        }
    }
    arsort($maskiert);

    $g = $db->prepare("SELECT COUNT(*) AS n, MAX(ts) AS zuletzt FROM events $wo");
    $g->execute($p);
    $ges = $g->fetch() ?: ['n' => 0, 'zuletzt' => null];

    return [
        'gesamt'      => (int)$ges['n'],
        'zuletzt'     => $ges['zuletzt'],
        'pro_tag'     => $proTag,
        'ergebnis'    => $zaehl('outcome'),
        'stufe'       => $zaehl('severity'),
        'aktion'      => $zaehl('action_type'),
        'quelle'      => $zaehl('quelle'),
        'maskiert'    => $maskiert,
        'quellen'     => PU_AUDIT_QUELLEN,
    ];
}

/** Export als CSV oder JSON — dieselben Filter wie die Liste, höchstens 20 000 Einträge. */
function pu_audit_export(array $f, string $format, ?int $nurLernender): string
{
    [$wo, $p] = pu_audit_bedingung($f, $nurLernender);
    $st = pu_audit_db()->prepare("SELECT * FROM events $wo ORDER BY seq ASC LIMIT 20000");
    $st->execute($p);
    $zeilen = array_map('pu_audit_zeile', $st->fetchAll());
    if ($format === 'json') {
        return (string)json_encode($zeilen, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    }
    $spalten = array_merge(['seq'], PU_AUDIT_FELDER, ['prev_hash', 'entry_hash']);
    $h = fopen('php://temp', 'w+');
    fputcsv($h, $spalten, ';', '"', '');
    foreach ($zeilen as $z) {
        $z['metadata'] = pu_audit_kanonisch($z['metadata']);
        // Keine Formel-Einschleusung in Tabellenprogrammen.
        fputcsv($h, array_map(static fn($s) => is_string($s) && preg_match('/^[=+\-@]/', $s) ? "'" . $s : $s,
            array_map(static fn($c) => $z[$c] ?? '', $spalten)), ';', '"', '');
    }
    rewind($h);
    return (string)stream_get_contents($h);
}

// ═════════════════════════════════════════════════════════════════════════════
// Die Werkstatt-Seite
// ═════════════════════════════════════════════════════════════════════════════

/** Der Werkstatt-Ordner (wie pu_werkstatt_ordner, ohne dessen Abhängigkeiten). */
function pu_audit_werkstatt(): string
{
    $t = getenv('PU_TEST_WERKSTATT');
    return is_string($t) && $t !== '' ? $t : PU_ROOT . '/werkstatt';
}

/**
 * Was die Schutzschicht über sich meldet (`data/werkstatt/schutzschicht.json`,
 * geschrieben von `werkstatt/werkzeuge/schutz/schutzschicht.mjs`) — und ob sie
 * wirklich antwortet. Die Datei nennt Quellen und Anzahlen, nie Werte.
 */
function pu_audit_schutzschicht_stand(): array
{
    $pfad = PU_DATA . '/werkstatt/schutzschicht.json';
    $s = is_file($pfad) ? (json_decode((string)file_get_contents($pfad), true) ?: []) : [];
    $port = (int)($s['port'] ?? 0);
    $laeuft = false;
    if ($port > 0 && $port < 65536) {
        $h = @fsockopen('127.0.0.1', $port, $nr, $txt, 0.3);
        if ($h !== false) { fclose($h); $laeuft = true; }
    }
    return [
        'bekannt'    => $s !== [],
        'laeuft'     => $laeuft,
        'port'       => $port ?: null,
        'gestartet'  => $s['gestartet'] ?? null,
        'ziel'       => $s['ziel'] ?? null,
        'quellen'    => array_values(array_filter((array)($s['quellen'] ?? []), 'is_array')),
        'regeln'     => (int)($s['regeln'] ?? 0),
        'anfragen'   => (int)($s['anfragen'] ?? 0),
        'angehalten' => (int)($s['angehalten'] ?? 0),
        'maskiert'   => (array)($s['maskiert'] ?? []),
    ];
}

/**
 * Liest die Sitzungsprotokolle der Werkstatt in den Spool
 * (`werkstatt/werkzeuge/schutz/sitzungen.mjs --einmal`). Feste Befehlsfolge;
 * es wird nichts aus einer Eingabe eingesetzt. Ohne Node oder Werkstatt: leer.
 *
 * @return array{ok:bool, grund?:string, neu?:int, sitzungen?:int}
 */
function pu_audit_sitzungen_lesen(): array
{
    $skript = pu_audit_werkstatt() . '/werkzeuge/schutz/sitzungen.mjs';
    if (!is_file($skript)) return ['ok' => false, 'grund' => 'werkstatt_fehlt'];
    $h = @proc_open(['node', $skript, '--einmal', '--json'], [1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $rohr,
        dirname($skript));
    if (!is_resource($h)) return ['ok' => false, 'grund' => 'node_fehlt'];
    stream_set_timeout($rohr[1], 60);
    $aus = (string)stream_get_contents($rohr[1]);
    fclose($rohr[1]);
    fclose($rohr[2]);
    $code = proc_close($h);
    $j = json_decode(trim((string)strrchr("\n" . trim($aus), "\n")), true);
    if ($code !== 0 || !is_array($j)) return ['ok' => false, 'grund' => 'lesefehler'];
    return ['ok' => true] + array_intersect_key($j, array_flip(['neu', 'sitzungen', 'dateien']));
}
