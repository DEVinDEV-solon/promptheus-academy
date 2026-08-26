<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Grundlagen: .env, Verzeichnisse, Anmeldung, Datenbank, Pfadwachen.
 *
 * Aufgebaut nach dem Muster von scripts/Advocat/lib.php, damit niemand zwei
 * Bauweisen lernen muss. Die Unterschiede sind bewusst:
 *
 *   - Mehrbenutzer. ADVOCAT hat einen Anwender, PROMPTHEUS eine Klasse.
 *     Deshalb liegt die Anmeldung in der Datenbank, nicht in der .env.
 *   - Der Vault ist Lehrstoff, nicht Beweismittel. Er darf gelesen und
 *     (vom Tutor) geschrieben werden, aber nie ueber HTTP ausgeliefert.
 */

const PU_ROOT      = __DIR__;
const PU_DATA      = PU_ROOT . '/data';

/**
 * Der Ablageort der Datenbank.
 *
 * `PU_TEST_DB` ist ausschließlich für die Testreihe da: ein Test, der die
 * echte `data/promptheus.db` benutzt, legt Testkonten in die Lernstände der
 * Klasse — und räumt sie im Zweifel mit auf. Die Umgebungsvariable wird nur
 * von `tests/hilfe.php` gesetzt; im Betrieb ist sie leer.
 */
define('PU_DB', ($t = getenv('PU_TEST_DB')) !== false && $t !== ''
    ? $t
    : PU_DATA . '/promptheus.db');
/**
 * Die .env.
 *
 * Umlegbar aus demselben Grund wie die Datenbank: die Einstellungen können
 * einen Schlüssel HINEINSCHREIBEN (Einstellungen › Tutor-KI). Ein Test, der
 * das prüft, darf nicht die echte .env des Rechners umschreiben — dort steht
 * der Schlüssel, mit dem die Academy arbeitet.
 */
define('PU_ENV_DATEI', ($e = getenv('PU_TEST_ENV')) !== false && $e !== ''
    ? $e
    : PU_ROOT . '/.env');
const PU_LOGS      = PU_DATA . '/logs';
const PU_TMP       = PU_DATA . '/tmp';
const PU_URKUNDEN  = PU_DATA . '/urkunden';
/**
 * Der Vault.
 *
 * Er hiess anfangs `brain/` und heisst jetzt `secondbrain/` — so wie in den
 * anderen Projekten des Hauses. Der Konstantenname bleibt `PU_BRAIN`, weil
 * er an rund zwanzig Stellen steht und ein Umbenennen dort nichts besser
 * machte; der Pfad ist die Angabe, die stimmen muss.
 *
 * Der ältere Ordner wird noch erkannt: eine Installation, die noch `brain/`
 * hat, soll nicht mit einer leeren Kursliste dastehen und raten müssen.
 */
define('PU_BRAIN', is_dir(PU_ROOT . '/secondbrain') || !is_dir(PU_ROOT . '/brain')
    ? PU_ROOT . '/secondbrain'
    : PU_ROOT . '/brain');
const PU_PROMPTS   = PU_ROOT . '/prompts';
const PU_VORLAGEN  = PU_ROOT . '/vorlagen';

/** Die zwölf Aufgabentypen aus dem Konzeptplan. Ein dreizehnter ist ein Fehler. */
const PU_TYPEN = [
    'denkaufgabe', 'plugplay', 'schiebe', 'uebereinstimmung', 'multitask',
    'mathe', 'raeumlich', 'secret', 'sicherheit', 'technisch', 'krypto', 'planung',
];

/** Die sechs Stufen. Reihenfolge = Aufstiegsreihenfolge. */
const PU_STUFEN = [
    1 => ['schluessel' => '01_Entdecker',  'name' => 'ENTDECKER',  'titel' => 'Grundlagen'],
    2 => ['schluessel' => '02_Priester',   'name' => 'PRIESTER',   'titel' => 'Prompting & Logik'],
    3 => ['schluessel' => '03_Builder',    'name' => 'BUILDER',    'titel' => 'Erste Automationen'],
    4 => ['schluessel' => '04_Architekt',  'name' => 'ARCHITEKT',  'titel' => 'Multiagenten & Systeme'],
    5 => ['schluessel' => '05_Waechter',   'name' => 'WAECHTER',   'titel' => 'Sicherheit & Krypto'],
    6 => ['schluessel' => '06_Meister',    'name' => 'MEISTER',    'titel' => 'Komplette Problemlösung'],
];

/**
 * Die Titelstufen. Untergrenze => Titel.
 *
 * Aufsteigend sortiert; pu_titel() läuft von oben nach unten und nimmt den
 * ersten Treffer. Eine absteigende Liste hätte dieselbe Wirkung, aber die
 * Grenzen lesen sich hier so, wie sie im Konzeptplan stehen.
 */
const PU_TITEL = [
    0     => 'Funke',
    500   => 'Flamme',
    1500  => 'Fackel',
    3500  => 'Feuer',
    7000  => 'Inferno',
    12000 => 'Prometheus',
];

// ---------------------------------------------------------------- .env
/** Liest .env einmal ein. Werte gehen nie an das Frontend. */
function pu_env(string $name, string $fallback = ''): string
{
    static $env = null;
    if ($env === null) {
        $env  = [];
        $file = PU_ENV_DATEI;
        if (is_file($file)) {
            foreach (file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
                $line = trim($line);
                if ($line === '' || $line[0] === '#' || !str_contains($line, '=')) continue;
                [$k, $v] = explode('=', $line, 2);
                $env[trim($k)] = trim(trim(trim($v), '"'), "'");
            }
        }
    }
    $v = $env[$name] ?? '';

    // Zweitrangig die Prozessumgebung: eine Starterdatei kann EINE Instanz
    // festlegen (anderer Port), ohne die gemeinsame .env zu ändern.
    if ($v === '') {
        $p = getenv($name);
        if (is_string($p) && trim($p) !== '') $v = trim($p);
    }

    return $v !== '' ? $v : $fallback;
}

// ---------------------------------------------------------------- Verzeichnisse
function pu_ensure_dirs(): void
{
    foreach ([PU_DATA, PU_LOGS, PU_TMP, PU_URKUNDEN] as $d) {
        if (!is_dir($d)) @mkdir($d, 0775, true);
    }
}

// ---------------------------------------------------------------- Datenbank
function pu_db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) return $pdo;

    pu_ensure_dirs();

    // Klare Diagnose statt "could not find driver": unter Windows ist
    // pdo_sqlite in der ausgelieferten php.ini häufig auskommentiert.
    if (!in_array('sqlite', PDO::getAvailableDrivers(), true)) {
        throw new RuntimeException(
            'Die PHP-Erweiterung pdo_sqlite ist nicht geladen. '
            . 'PROMPTHEUS bitte ueber promptheus-start.bat starten (schaltet sie zu) '
            . 'oder in der php.ini die Zeile ";extension=pdo_sqlite" entkommentieren.'
        );
    }

    $pdo = new PDO('sqlite:' . PU_DB, null, null, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
    $pdo->exec('PRAGMA journal_mode = WAL');
    $pdo->exec('PRAGMA foreign_keys = ON');

    require_once PU_ROOT . '/srv/db.php';
    pu_db_migrate($pdo);

    return $pdo;
}

// ---------------------------------------------------------------- Anmeldung
function pu_session_start(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) return;

    // Auf der Kommandozeile gibt es keine Sitzung und keine Kopfzeilen. Ein
    // Prüflauf, der `pu_wer()` benutzt, bekäme hier sonst drei Warnungen je
    // Aufruf — „Session cannot be started after headers have already been
    // sent" —, und die stehen dann zwischen den Ergebnissen. `$_SESSION` ist
    // im Prüflauf ein gewöhnliches Feld; das genügt völlig.
    if (PHP_SAPI === 'cli') {
        if (!isset($_SESSION)) $_SESSION = [];
        return;
    }

    session_name('PROMPTHEUS');
    session_set_cookie_params(['lifetime' => 0, 'httponly' => true, 'samesite' => 'Lax']);
    session_start();
}

/** Der angemeldete Lernende, oder null. */
function pu_wer(): ?array
{
    static $wer = null;
    static $geprueft = false;
    if ($geprueft) return $wer;
    $geprueft = true;

    pu_session_start();
    $id = (int)($_SESSION['pu_id'] ?? 0);
    if ($id <= 0) return null;

    $st = pu_db()->prepare('SELECT id, kennung, anzeigename, rolle, gruppe FROM lernende WHERE id = ?');
    $st->execute([$id]);
    $row = $st->fetch();
    $wer = $row !== false ? $row : null;
    return $wer;
}

function pu_ist_angemeldet(): bool { return pu_wer() !== null; }

// ---------------------------------------------------------------- Rollenübernahme
//
// Ebene 1 kann ein anderes Konto **wirklich übernehmen**, statt nur seine
// Ansicht nachzustellen. Nur so lässt sich ein Ablauf zu Ende prüfen, der über
// mehrere Rollen läuft — ein Schüler bucht, die Einrichtung bestätigt, der
// Schüler bekommt die Token. Eine Vorschau, die nichts schreibt, hört genau an
// der Stelle auf, an der es interessant wird.
//
// Der Preis ist offen zu benennen: Wer übernimmt, handelt unter fremdem Namen.
// Drei Gegengewichte, und alle drei sind Bauart und nicht Vorsatz:
//
//   1. `pu_wer_echt()` merkt sich, wer wirklich am Rechner sitzt.
//   2. **Jeder Protokolleintrag trägt beide Namen** — solange übernommen ist,
//      steht am Eintrag „(übernommen von <kennung>)". Rückwirkend lässt sich
//      also nachlesen, wer gehandelt hat.
//   3. Die Oberfläche zeigt ein Dauerband, das nicht wegklickbar ist.
//
// Was ausdrücklich NICHT geht: eine andere Ebene 1 übernehmen. Das brächte
// keinen Erkenntnisgewinn und verwischt nur, wer wen übernommen hat.

/** Wer wirklich angemeldet ist — bei Übernahme also die Ebene 1 dahinter. */
function pu_wer_echt(): ?array
{
    pu_session_start();
    $id = (int)($_SESSION['pu_echt'] ?? 0);
    if ($id <= 0) return pu_wer();

    $st = pu_db()->prepare('SELECT id, kennung, anzeigename, rolle, gruppe FROM lernende WHERE id = ?');
    $st->execute([$id]);
    $row = $st->fetch();
    return $row !== false ? $row : null;
}

/**
 * Läuft gerade eine Übernahme?
 *
 * **Startet absichtlich keine Sitzung.** pu_protokoll() fragt bei jedem
 * Eintrag hier nach; würde dabei eine Sitzung angelegt, schickte auch der
 * Testlauf auf der Kommandozeile Kopfzeilen los. Im Browser läuft die Sitzung
 * längst — pu_wer() hat sie geöffnet, bevor irgendetwas protokolliert wird.
 */
function pu_uebernommen(): bool
{
    if (session_status() !== PHP_SESSION_ACTIVE) return false;
    return (int)($_SESSION['pu_echt'] ?? 0) > 0;
}

// Es gab hier einmal ein pu_ist_tutor(). Es ist weg, und das mit Absicht:
// wer was darf, beantwortet seit den fünf Ebenen ausschliesslich
// pu_recht_hat() in srv/rechte.php. Eine zweite Stelle, die dieselbe Frage
// anders beantwortet, ist genau die Sorte Lücke, durch die ein Recht
// hindurchfällt.

/**
 * Ein Konto übernehmen. Nur mit `rollen.uebernehmen`, also nur Ebene 1.
 *
 * Der eigene Statischer-Zwischenspeicher von pu_wer() macht die Umschaltung
 * innerhalb desselben Aufrufs unsichtbar — deshalb antwortet die API mit
 * „neu laden", statt so zu tun, als wäre der Wechsel schon vollzogen.
 */
function pu_rolle_uebernehmen(int $ziel): void
{
    require_once PU_ROOT . '/srv/rechte.php';
    if (!pu_recht_hat('rollen.uebernehmen')) {
        throw new RuntimeException('Dafür fehlt dir das Recht.');
    }

    // Immer vom echten Konto aus rechnen: sonst könnte man sich von Übernahme
    // zu Übernahme weiterhangeln und am Ende wäre nicht mehr feststellbar,
    // wer angefangen hat.
    $echt = pu_wer_echt();
    if ($echt === null) throw new RuntimeException('Niemand angemeldet.');
    if ($ziel === (int)$echt['id']) throw new RuntimeException('Das bist du selbst.');

    $st = pu_db()->prepare('SELECT id, kennung, rolle FROM lernende WHERE id = ?');
    $st->execute([$ziel]);
    $z = $st->fetch();
    if ($z === false) throw new RuntimeException('Dieses Konto gibt es nicht.');

    // Eine andere Ebene 1 zu übernehmen brächte keinen Erkenntnisgewinn und
    // verwischt nur, wer wen übernommen hat.
    if ((string)$z['rolle'] === 'admin') {
        throw new RuntimeException('Ein Admin-Konto lässt sich nicht übernehmen.');
    }

    pu_session_start();
    $_SESSION['pu_echt'] = (int)$echt['id'];
    $_SESSION['pu_id']   = (int)$z['id'];

    pu_protokoll((int)$echt['id'], 'rolle_uebernommen', (string)$z['kennung'],
                 'Ebene ' . $z['rolle']);
}

/** Zurück ins eigene Konto. Geht immer — auch ohne das Recht von vorhin. */
function pu_rolle_zurueck(): void
{
    pu_session_start();
    $zurueck = (int)($_SESSION['pu_echt'] ?? 0);
    if ($zurueck <= 0) return;

    // Erst protokollieren, dann umschalten: solange die Übernahme läuft,
    // hängt pu_protokoll() den Vermerk „übernommen von …" an, und genau der
    // gehört an diese Zeile.
    $w = pu_wer();
    pu_protokoll($zurueck, 'rolle_zurueck', $w !== null ? (string)$w['kennung'] : '', '');

    unset($_SESSION['pu_echt']);
    $_SESSION['pu_id'] = $zurueck;
}

/**
 * Anmeldung gegen den Kennwort-Hash in der Datenbank.
 *
 * Kein Klartext-Kennwort in der .env wie bei ADVOCAT: dort gibt es einen
 * Anwender, hier eine Klasse. Ein gemeinsames .env-Kennwort wäre ein
 * gemeinsames Konto, und ein gemeinsames Konto hat keinen Lernstand.
 */
function pu_anmelden(string $kennung, string $kennwort): bool
{
    $kennung = strtolower(trim($kennung));
    if ($kennung === '' || $kennwort === '') return false;

    $st = pu_db()->prepare('SELECT id, kennwort_hash FROM lernende WHERE kennung = ?');
    $st->execute([$kennung]);
    $row = $st->fetch();

    // Auch bei unbekannter Kennung wird gehasht, damit die Antwortzeit nicht
    // verrät, welche Kennungen es gibt.
    $hash = $row !== false ? (string)$row['kennwort_hash'] : '$2y$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv';
    $ok   = password_verify($kennwort, $hash) && $row !== false;

    if ($ok) {
        pu_session_start();
        session_regenerate_id(true);
        $_SESSION['pu_id'] = (int)$row['id'];
        pu_protokoll((int)$row['id'], 'anmeldung', $kennung, 'erfolgreich');
    } else {
        pu_protokoll(0, 'anmeldung', $kennung, 'fehlgeschlagen');
    }
    return $ok;
}

function pu_abmelden(): void
{
    pu_session_start();
    $w = pu_wer();
    if ($w !== null) pu_protokoll((int)$w['id'], 'abmeldung', $w['kennung'], '');
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
    }
    session_destroy();
}

// ---------------------------------------------------------------- Protokoll
/** Jeder Punkt, jede Urkunde, jede Anmeldung. Nie ohne Zeitstempel. */
function pu_protokoll(int $lernender, string $aktion, string $gegenstand, string $notiz = ''): void
{
    try {
        // Läuft eine Rollenübernahme, trägt JEDER Eintrag beide Namen. Der
        // Eintrag bleibt beim übernommenen Konto — dort ist die Handlung ja
        // passiert —, aber wer sie ausgelöst hat, steht daneben. Ohne diese
        // Zeile wäre die Übernahme ein Weg, unter fremdem Namen spurlos zu
        // handeln, und das wäre sie dann zu Recht nicht wert.
        if (pu_uebernommen()) {
            $echt = pu_wer_echt();
            if ($echt !== null) {
                $notiz = trim($notiz . ' (übernommen von ' . $echt['kennung'] . ')');
            }
        }

        $st = pu_db()->prepare(
            'INSERT INTO protokoll (zeitpunkt, lernender, aktion, gegenstand, notiz)
             VALUES (?, ?, ?, ?, ?)'
        );
        $st->execute([pu_jetzt(), $lernender ?: null, $aktion, $gegenstand, $notiz]);
    } catch (Throwable $e) {
        // Das Protokoll darf den Betrieb nicht anhalten. Es fällt aber auf:
        // die Fehlerdatei liegt daneben.
        @file_put_contents(PU_LOGS . '/fehler.log',
            pu_jetzt() . " protokoll: " . $e->getMessage() . "\n", FILE_APPEND);
    }
}

// ---------------------------------------------------------------- Zeit
/**
 * Ortszeit, nicht UTC.
 *
 * Der Tageswechsel bestimmt die Serie (Streak). Rechnete PROMPTHEUS in UTC,
 * riss die Serie eines Lernenden im Sommer abends um zwei — an einem Tag, an
 * dem er gelernt hat. Das wäre kein Rundungsfehler, das wäre eine falsche
 * Auskunft ueber seine Leistung.
 */
function pu_jetzt(): string { return date('Y-m-d H:i:s'); }
function pu_heute(): string { return date('Y-m-d'); }

// ---------------------------------------------------------------- Pfadwachen
/**
 * Liegt $pfad wirklich unterhalb von $wurzel?
 *
 * Ein reiner Präfixvergleich reicht nicht: "brain_alt" beginnt mit "brain"
 * und würde faelschlich durchgelassen. Deshalb wird der Trennzeichen-
 * Anschluss erzwungen.
 */
function pu_pfad_in_wurzel(string $pfad, string $wurzel): bool
{
    $pfad   = rtrim(str_replace('\\', '/', $pfad), '/');
    $wurzel = rtrim(str_replace('\\', '/', $wurzel), '/');
    if ($wurzel === '') return false;
    if (strcasecmp($pfad, $wurzel) === 0) return true;
    return strncasecmp($pfad, $wurzel . '/', strlen($wurzel) + 1) === 0;
}

/**
 * Löst einen relativen Vaultpfad auf und prueft ihn gegen brain/.
 * Gibt den absoluten Pfad zurueck oder null, wenn er ausbrechen würde.
 */
function pu_brain_pfad(string $relativ): ?string
{
    $relativ = str_replace('\\', '/', trim($relativ));
    $relativ = ltrim($relativ, '/');
    if ($relativ === '' || str_contains($relativ, "\0")) return null;

    $wurzel = realpath(PU_BRAIN);
    if ($wurzel === false) return null;
    $wurzel = str_replace('\\', '/', $wurzel);

    $ziel = $wurzel . '/' . $relativ;
    $echt = realpath($ziel);

    if ($echt !== false) {
        $echt = str_replace('\\', '/', $echt);
        return pu_pfad_in_wurzel($echt, $wurzel) ? $echt : null;
    }

    // Ziel existiert noch nicht -> Elternordner pruefen (Notiz neu anlegen).
    $eltern = realpath(dirname($ziel));
    if ($eltern === false) return null;
    $eltern = str_replace('\\', '/', $eltern);
    if (!pu_pfad_in_wurzel($eltern, $wurzel)) return null;
    return $eltern . '/' . basename($ziel);
}

/** Wandelt einen absoluten Pfad zurueck in den relativen Vaultpfad. */
function pu_brain_rel(string $absolut): string
{
    $wurzel  = str_replace('\\', '/', (string)realpath(PU_BRAIN));
    $absolut = str_replace('\\', '/', $absolut);
    if (pu_pfad_in_wurzel($absolut, $wurzel)) {
        return ltrim(substr($absolut, strlen($wurzel)), '/');
    }
    return '';
}

// ---------------------------------------------------------------- Dateien
/** Schreibt atomar: erst .tmp, dann umbenennen. Kein halb geschriebener Zustand. */
function pu_write_file(string $file, string $inhalt): bool
{
    $dir = dirname($file);
    if (!is_dir($dir) && !@mkdir($dir, 0775, true)) return false;
    $tmp = $file . '.tmp';
    if (@file_put_contents($tmp, $inhalt, LOCK_EX) === false) return false;
    if (!@rename($tmp, $file)) { @unlink($tmp); return false; }
    return true;
}

/** Slug für Datei- und Ordnernamen: klein, ohne Umlaute, ohne Sonderzeichen. */
function pu_slug(string $s): string
{
    $s = strtr($s, [
        'ä'=>'ae','ö'=>'oe','ü'=>'ue','Ä'=>'ae','Ö'=>'oe','Ü'=>'ue','ß'=>'ss',
        'é'=>'e','è'=>'e','ê'=>'e','á'=>'a','à'=>'a','í'=>'i','ó'=>'o','ú'=>'u','ç'=>'c',
    ]);
    $s = strtolower($s);
    $s = preg_replace('/[^a-z0-9]+/', '-', $s) ?? '';
    return trim($s, '-');
}

// ---------------------------------------------------------------- Titel
function pu_titel(int $punkte): string
{
    $titel = 'Funke';
    foreach (PU_TITEL as $grenze => $name) {
        if ($punkte >= $grenze) $titel = $name;
    }
    return $titel;
}

/** Wie viele Punkte bis zum nächsten Titel? null, wenn der höchste erreicht ist. */
function pu_bis_naechster_titel(int $punkte): ?array
{
    foreach (PU_TITEL as $grenze => $name) {
        if ($punkte < $grenze) return ['titel' => $name, 'fehlt' => $grenze - $punkte, 'grenze' => $grenze];
    }
    return null;
}

// ---------------------------------------------------------------- Ausgabe
function pu_json_out(array $daten, int $code = 200): never
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($daten, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function pu_fehler(string $text, int $code = 400): never
{
    pu_json_out(['ok' => false, 'fehler' => $text], $code);
}

/** Cache-Buster für Assets: Zeitstempel der Datei. */
function pu_v(string $rel): string
{
    $f = PU_ROOT . '/' . ltrim($rel, '/');
    return $rel . '?v=' . (is_file($f) ? (string)filemtime($f) : '0');
}

function pu_h(?string $s): string
{
    return htmlspecialchars((string)$s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}
