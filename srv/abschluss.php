<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — die Abschluss-Urkunde nach allen sechs Stufen.
 *
 * Die Stufen-Urkunden (srv/zertifikat.php) tragen den Anzeigenamen und
 * entstehen von selbst. Die Abschluss-Urkunde ist anders: sie trägt den
 * **echten Vor- und Nachnamen**, den der Lernende selbst einträgt — und dieser
 * Name ist danach fest. Ohne Sprachmodell, ohne Server, ohne dass die
 * Academy-Leitung oder ein Administrator den Namen je im Klartext zu sehen
 * bekommt: er wird auf diesem Rechner verschlüsselt abgelegt.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * Ein Name je Durchgang
 *
 * Ein Durchgang ist: alle sechs Stufenprüfungen bestanden. Der erste zählt ab
 * Beginn, jeder weitere nur mit Prüfungen, die **nach** der letzten
 * Abschluss-Urkunde bestanden wurden (gemessen an der Prüfungsnummer). Je Durchgang gibt es genau eine
 * Abschluss-Urkunde — `UNIQUE (lernender, durchgang)` in der Datenbank sorgt
 * dafür, nicht eine Abfrage im Code. Zwei gleichzeitige Klicks mit zwei
 * verschiedenen Namen ergeben eine Urkunde und eine Absage.
 *
 * Wer seinen Namen ändern will (Heirat, Tippfehler), legt die Kurse 1 bis 6
 * noch einmal ab — kostenlos, Prüfungen brauchen kein Token — und bekommt
 * eine neue Urkunde mit dem neuen Namen. Die alte bleibt, wie sie war.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * Die Kryptografie
 *
 *     abschluss.key (32 Byte, zufällig, data/urkunden/)
 *       ├── kdf 1 → k_name   secretbox: der Name liegt nur verschlüsselt vor
 *       └── kdf 2 → k_siegel BLAKE2b mit Schlüssel:
 *                              Konto-Hash  = H(k, konto|id|kennung|angelegt)
 *                              Siegel      = H(k, code|konto|durchgang|name|…)
 *
 * Das Siegel bindet den Namen an Konto, Prüfcode und Durchgang. Wer in der
 * Datenbank den verschlüsselten Namen einer anderen Zeile hineinkopiert oder
 * den Durchgang umschreibt, bekommt beim Öffnen „Siegel gebrochen" statt einer
 * Urkunde. Der Schlüssel ist eigener als die Installationsidentität
 * (srv/identitaet.php): die entsteht erst bei der Registrierung, und wer nur
 * die sechs Stufen spielt, registriert sich nie.
 *
 * **Der Schlüssel gehört in die Sicherung.** Ohne ihn lassen sich die Namen
 * nicht mehr lesen — das ist der Preis dafür, dass sie niemand sonst liest.
 */

require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/urkunden_design.php';

/** Ablageort des Schlüssels. Im Test umlegbar, wie Datenbank und Saat. */
define('PU_ABSCHLUSS_ORDNER', ($p = getenv('PU_TEST_URKUNDEN')) !== false && $p !== ''
    ? $p
    : PU_URKUNDEN);

const PU_ABSCHLUSS_DATEI = 'abschluss.key';
const PU_ABSCHLUSS_KDF   = 'pu-urk--';     // genau acht Zeichen, so will es libsodium
const PU_ABSCHLUSS_NAME_MAX = 60;          // Zeichen je Vor- und Nachname

// ── Schlüssel ────────────────────────────────────────────────────────────────

/**
 * Liest den Schlüssel; legt ihn beim ersten Mal an.
 *
 * Erst neben die Zieldatei schreiben, dann umbenennen — ein halb
 * geschriebener Schlüssel sähe aus wie ein ganzer und machte jeden Namen
 * danach unlesbar.
 */
function pu_abschluss_schluessel(): string
{
    if (!function_exists('sodium_crypto_secretbox')) {
        throw new RuntimeException(
            'Für die Abschluss-Urkunde fehlt die PHP-Erweiterung sodium. '
            . 'PROMPTHEUS-START.bat schaltet sie ein.');
    }
    $ordner = PU_ABSCHLUSS_ORDNER;
    $datei  = $ordner . '/' . PU_ABSCHLUSS_DATEI;

    if (!is_file($datei)) {
        if (!is_dir($ordner) && !@mkdir($ordner, 0700, true) && !is_dir($ordner)) {
            throw new RuntimeException('Der Urkundenordner lässt sich nicht anlegen.');
        }
        $neu = random_bytes(SODIUM_CRYPTO_KDF_KEYBYTES);
        $vorlaeufig = $datei . '.neu';
        if (file_put_contents($vorlaeufig, $neu, LOCK_EX) !== strlen($neu)) {
            @unlink($vorlaeufig);
            throw new RuntimeException('Der Urkundenschlüssel liess sich nicht schreiben.');
        }
        @chmod($vorlaeufig, 0600);
        // Zwei Anfragen zugleich: die zweite findet die Datei schon vor und
        // nimmt die. `rename` überschreibt unter Windows nicht.
        if (!is_file($datei) && !@rename($vorlaeufig, $datei)) {
            @unlink($vorlaeufig);
            if (!is_file($datei)) {
                throw new RuntimeException('Der Urkundenschlüssel liess sich nicht ablegen.');
            }
        }
        @unlink($vorlaeufig);
        sodium_memzero($neu);
    }

    $k = (string)file_get_contents($datei);
    if (strlen($k) !== SODIUM_CRYPTO_KDF_KEYBYTES) {
        throw new RuntimeException(
            'Der Urkundenschlüssel ist beschädigt. Aus der Sicherung einspielen, nicht neu erzeugen — '
            . 'sonst sind alle eingetragenen Namen verloren.');
    }
    return $k;
}

/** Ein Teilschlüssel: 1 = Name verschlüsseln, 2 = Siegel und Konto-Hash. */
function pu_abschluss_teil(int $nr): string
{
    $k = pu_abschluss_schluessel();
    $t = sodium_crypto_kdf_derive_from_key(32, $nr, PU_ABSCHLUSS_KDF, $k);
    sodium_memzero($k);
    return $t;
}

// ── Konto-Hash, Siegel, Name ─────────────────────────────────────────────────

/**
 * Der Konto-Hash: steht auf der Urkunde und in der öffentlichen Prüfung.
 *
 * Mit Schlüssel gerechnet, damit niemand ihn aus Kennung und Nummer
 * nachrechnen und so ein Konto einer Urkunde zuordnen kann. Die Anlage-Zeit
 * steht mit drin: ein gelöschtes und unter derselben Kennung neu angelegtes
 * Konto ist ein anderes Konto.
 */
function pu_abschluss_konto_hash(int $lernender): string
{
    $st = pu_db()->prepare('SELECT kennung, angelegt FROM lernende WHERE id = ?');
    $st->execute([$lernender]);
    $r = $st->fetch();
    if ($r === false) throw new RuntimeException('Dieses Konto gibt es nicht.');

    $k = pu_abschluss_teil(2);
    $h = sodium_crypto_generichash(
        'konto|' . $lernender . '|' . $r['kennung'] . '|' . $r['angelegt'], $k, 20);
    sodium_memzero($k);

    require_once __DIR__ . '/identitaet.php';     // pu_base32
    return 'KH-' . substr(pu_base32($h), 0, 16);
}

/**
 * Das Siegel über alles, was auf der Urkunde nicht mehr wechseln darf.
 * `test` gehört dazu: aus einer Testurkunde wird durch Umschreiben der
 * Spalte keine echte — das Siegel bricht.
 */
function pu_abschluss_siegel(string $code, string $konto, int $durchgang,
                             string $name, string $ausgestellt, int $punkte, int $test = 0): string
{
    $felder = [
        'code' => $code, 'konto' => $konto, 'durchgang' => $durchgang,
        'name' => $name, 'ausgestellt' => $ausgestellt, 'punkte' => $punkte,
    ];
    if ($test !== 0) $felder['test'] = 1;
    $rumpf = json_encode($felder, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    $k = pu_abschluss_teil(2);
    $s = sodium_crypto_generichash('siegel|' . $rumpf, $k, 32);
    sodium_memzero($k);
    return sodium_bin2hex($s);
}

/** Für die Urkunde: die ersten 20 Zeichen, in Vierergruppen. */
function pu_abschluss_siegel_kurz(string $siegel): string
{
    return strtoupper(implode('-', str_split(substr($siegel, 0, 20), 4)));
}

function pu_abschluss_verschluesseln(string $name): string
{
    $k = pu_abschluss_teil(1);
    $nonce = random_bytes(SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);
    $geheim = sodium_crypto_secretbox($name, $nonce, $k);
    sodium_memzero($k);
    return base64_encode($nonce . $geheim);
}

/** Null, wenn der Name sich nicht entschlüsseln lässt (anderer Schlüssel, Eingriff). */
function pu_abschluss_entschluesseln(string $b64): ?string
{
    $roh = base64_decode($b64, true);
    if ($roh === false || strlen($roh) <= SODIUM_CRYPTO_SECRETBOX_NONCEBYTES) return null;
    $k = pu_abschluss_teil(1);
    $klar = sodium_crypto_secretbox_open(
        substr($roh, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES),
        substr($roh, 0, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES), $k);
    sodium_memzero($k);
    return $klar === false ? null : $klar;
}

/**
 * Prüft und vereinheitlicht einen Namensteil.
 *
 * Buchstaben aller Schriften, dazu Leerzeichen, Bindestrich, Apostroph und
 * Punkt — „Anna-Lena", „O'Brien", „Dr. med." gehen, Ziffern und Zeichen wie
 * `<` nicht. Doppelte Leerzeichen werden eins; eine Urkunde mit einem
 * unsichtbaren Doppel-Leerzeichen sähe aus wie ein Druckfehler.
 */
function pu_abschluss_namensteil(string $teil, string $was): string
{
    $teil = trim((string)preg_replace('/\s+/u', ' ', $teil));
    if ($teil === '') throw new InvalidArgumentException("Bitte den $was eintragen.");
    if (mb_strlen($teil) > PU_ABSCHLUSS_NAME_MAX) {
        throw new InvalidArgumentException("Der $was ist zu lang (höchstens " . PU_ABSCHLUSS_NAME_MAX . ' Zeichen).');
    }
    if (!preg_match("/^\\p{L}[\\p{L}\\p{M} .'’-]*$/u", $teil)) {
        throw new InvalidArgumentException(
            "Im $was sind nur Buchstaben, Leerzeichen, Bindestrich, Apostroph und Punkt erlaubt.");
    }
    return $teil;
}

// ── Durchgänge ───────────────────────────────────────────────────────────────

/** Die Abschluss-Urkunden eines Kontos, neueste zuletzt. Ohne Namen. */
function pu_abschluesse(int $lernender): array
{
    $st = pu_db()->prepare(
        'SELECT pruefcode, durchgang, konto_hash, punkte, ausgestellt, widerrufen, design, test
           FROM abschluesse WHERE lernender = ? ORDER BY durchgang');
    $st->execute([$lernender]);
    $gedruckt = pu_db()->prepare(
        "SELECT COUNT(*) FROM urkunden_meldungen WHERE pruefcode = ? AND ereignis = 'gedruckt'");
    return array_map(static function (array $r) use ($gedruckt) {
        $gedruckt->execute([$r['pruefcode']]);
        return [
            'pruefcode'   => (string)$r['pruefcode'],
            'durchgang'   => (int)$r['durchgang'],
            'konto_hash'  => (string)$r['konto_hash'],
            'punkte'      => (int)$r['punkte'],
            'ausgestellt' => (string)$r['ausgestellt'],
            'widerrufen'  => (string)$r['widerrufen'],
            'design'      => pu_abschluss_design_lesen((string)$r['design']),
            'gedruckt'    => (int)$gedruckt->fetchColumn(),
            'test'        => (int)$r['test'] === 1,
        ];
    }, $st->fetchAll());
}

/**
 * Wo steht dieses Konto im laufenden Durchgang?
 *
 * Gezählt wird gegen PU_STUFEN, nicht gegen die Kursordner — wie bei
 * pu_alle_stufen_bestanden(). Je Stufe zählt die beste bestandene Prüfung
 * seit der letzten Abschluss-Urkunde; `bis` ist die höchste Prüfungsnummer,
 * die der Durchgang verbraucht. Die Grenze ist eine Nummer, keine Uhrzeit —
 * siehe pu_db_v11().
 *
 * @return array{durchgang:int, erster:bool, bis:int, stufen:array<int,int>, fertig:bool, punkte:int}
 */
function pu_abschluss_lauf(int $lernender): array
{
    $pdo = pu_db();
    $st = $pdo->prepare(
        'SELECT durchgang, bis_pruefung FROM abschluesse
          WHERE lernender = ? ORDER BY durchgang DESC LIMIT 1');
    $st->execute([$lernender]);
    $letzte = $st->fetch();

    $seit      = $letzte === false ? 0 : (int)$letzte['bis_pruefung'];
    $durchgang = $letzte === false ? 1 : (int)$letzte['durchgang'] + 1;

    $st = $pdo->prepare(
        'SELECT stufe, MAX(punkte) AS punkte, MAX(id) AS bis, MAX(test) AS test FROM pruefungen
          WHERE lernender = ? AND bestanden = 1 AND id > ?
          GROUP BY stufe');
    $st->execute([$lernender, $seit]);
    $stufen = [];
    $bis    = $seit;
    $test   = 0;
    foreach ($st->fetchAll() as $r) {
        $stufen[(int)$r['stufe']] = (int)$r['punkte'];
        $bis  = max($bis, (int)$r['bis']);
        // Eine einzige Test-Prüfung im Durchgang macht die Urkunde zur
        // Testurkunde — auch wenn die übrigen echt bestanden sind.
        $test = max($test, (int)$r['test']);
    }

    $fertig = true;
    $punkte = 0;
    foreach (array_keys(PU_STUFEN) as $nr) {
        if (!isset($stufen[$nr])) { $fertig = false; continue; }
        $punkte += $stufen[$nr];
    }

    return ['durchgang' => $durchgang, 'erster' => $letzte === false, 'bis' => $bis,
            'stufen' => $stufen, 'fertig' => $fertig, 'punkte' => $punkte, 'test' => $test];
}

/**
 * Alles, was die Oberfläche zum Abschluss braucht — für das eigene Konto.
 *
 * Der zuletzt eingetragene Name wird als Vorschlag für einen weiteren
 * Durchgang zurückgegeben: er gehört dem Lernenden, und wer nur einen
 * Tippfehler korrigiert, soll nicht alles neu tippen.
 */
function pu_abschluss_stand(int $lernender): array
{
    $lauf  = pu_abschluss_lauf($lernender);
    $liste = pu_abschluesse($lernender);

    $vorschlag = ['vorname' => '', 'nachname' => ''];
    if ($liste !== []) {
        $st = pu_db()->prepare(
            'SELECT vorname_geheim, nachname_geheim FROM abschluesse
              WHERE lernender = ? ORDER BY durchgang DESC LIMIT 1');
        $st->execute([$lernender]);
        $r = $st->fetch();
        if ($r !== false) {
            $vorschlag = [
                'vorname'  => pu_abschluss_entschluesseln((string)$r['vorname_geheim']) ?? '',
                'nachname' => pu_abschluss_entschluesseln((string)$r['nachname_geheim']) ?? '',
            ];
        }
    }

    return [
        'durchgang'  => $lauf['durchgang'],
        'faellig'    => $lauf['fertig'],
        'stufen'     => array_map('intval', array_keys($lauf['stufen'])),
        'gesamt'     => count(PU_STUFEN),
        'urkunden'   => $liste,
        'vorschlag'  => $vorschlag,
        'test'       => $lauf['test'] === 1,
    ];
}

/**
 * Stellt die Abschluss-Urkunde aus.
 *
 * `$bestaetigung` ist der vollständige Name, ein zweites Mal getippt. Stimmt
 * er nicht Zeichen für Zeichen, wird nichts ausgestellt — die Oberfläche
 * fragt das ab, aber die Regel steht hier, damit sie auch ohne die Oberfläche
 * gilt.
 *
 * `BEGIN IMMEDIATE` nimmt die Schreibsperre vor dem Nachsehen: zwei
 * Anfragen zugleich sehen nicht beide „noch keine Urkunde".
 */
function pu_abschluss_ausstellen(int $lernender, string $vorname, string $nachname,
                                 string $bestaetigung, string $variante = '', array $design = []): array
{
    // Während einer Rollenübernahme handelt jemand anderes im Konto. Den
    // echten Namen trägt aber nur der Mensch selbst ein — nicht die
    // Academy-Leitung, nicht ein Administrator. Einzige Ausnahme: eine
    // Testurkunde im Testbetrieb (geprüft unten, sobald der Durchgang
    // feststeht) — damit sich jede Kontoart ausprobieren lässt.
    if (pu_uebernommen() && !pu_urkunden_testbetrieb()) {
        throw new DomainException('Während einer Rollenübernahme wird keine Abschluss-Urkunde ausgestellt.');
    }

    // Schritt 1 vor Schritt 2: erst ein Design, dann der Name.
    $gestaltung = pu_abschluss_design_bauen($variante, $design);
    if ($gestaltung === null) {
        throw new InvalidArgumentException('Bitte zuerst ein Design für die Urkunde wählen.');
    }

    $vorname  = pu_abschluss_namensteil($vorname, 'Vorname');
    $nachname = pu_abschluss_namensteil($nachname, 'Nachname');
    $name     = $vorname . ' ' . $nachname;

    if (trim((string)preg_replace('/\s+/u', ' ', $bestaetigung)) !== $name) {
        throw new InvalidArgumentException(
            'Die Bestätigung stimmt nicht mit dem Namen überein. Bitte den vollständigen Namen '
            . 'genau so noch einmal eintragen, wie er auf der Urkunde stehen soll.');
    }

    $konto = pu_abschluss_konto_hash($lernender);
    $pdo   = pu_db();
    $pdo->exec('BEGIN IMMEDIATE');
    try {
        $lauf = pu_abschluss_lauf($lernender);
        if (!$lauf['fertig']) {
            throw new RuntimeException($lauf['erster']
                ? 'Die Abschluss-Urkunde gibt es erst, wenn alle sechs Stufen bestanden sind.'
                : 'Für diesen Durchgang gibt es schon eine Abschluss-Urkunde. Ein neuer Name braucht '
                  . 'einen neuen Durchgang: alle sechs Stufenprüfungen noch einmal bestehen.');
        }
        if (pu_uebernommen() && $lauf['test'] === 0) {
            throw new DomainException('Während einer Rollenübernahme wird nur eine Testurkunde ausgestellt, '
                . 'keine echte.');
        }

        $jetzt = pu_jetzt();
        $code  = '';
        for ($versuch = 0; $versuch < 5; $versuch++) {
            $kandidat = pu_abschluss_code();
            $st = $pdo->prepare('SELECT 1 FROM abschluesse WHERE pruefcode = ?');
            $st->execute([$kandidat]);
            if ($st->fetchColumn() === false) { $code = $kandidat; break; }
        }
        if ($code === '') throw new RuntimeException('Es konnte kein freier Prüfcode gefunden werden.');

        $siegel = pu_abschluss_siegel($code, $konto, $lauf['durchgang'], $name, $jetzt,
                                      $lauf['punkte'], $lauf['test']);

        $st = $pdo->prepare(
            'INSERT INTO abschluesse
               (pruefcode, lernender, durchgang, konto_hash, vorname_geheim, nachname_geheim,
                siegel, punkte, ausgestellt, bis_pruefung, design, test)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?)');
        $st->execute([$code, $lernender, $lauf['durchgang'], $konto,
                      pu_abschluss_verschluesseln($vorname), pu_abschluss_verschluesseln($nachname),
                      $siegel, $lauf['punkte'], $jetzt, $lauf['bis'],
                      json_encode($gestaltung, JSON_UNESCAPED_UNICODE), $lauf['test']]);

        // Protokoll und Meldung nennen Code und Durchgang, nie den Namen.
        pu_protokoll($lernender, 'abschluss', $code,
                     'Durchgang ' . $lauf['durchgang'] . ($lauf['test'] ? ' (Test)' : ''));
        pu_abschluss_melden($code, $lauf['durchgang'], 'ausgestellt', $gestaltung['variante']);
        $pdo->exec('COMMIT');
    } catch (Throwable $e) {
        $pdo->exec('ROLLBACK');
        if ($e instanceof PDOException && str_contains($e->getMessage(), 'UNIQUE')) {
            throw new RuntimeException('Für diesen Durchgang wurde gerade eine Abschluss-Urkunde ausgestellt.');
        }
        throw $e;
    }

    return ['pruefcode' => $code, 'durchgang' => $lauf['durchgang'],
            'konto_hash' => $konto, 'ausgestellt' => $jetzt];
}

/** `PU-A-` + acht Zeichen, dasselbe Alphabet wie bei den Stufen-Urkunden. */
function pu_abschluss_code(): string
{
    $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    $teil = '';
    for ($i = 0; $i < 8; $i++) $teil .= $alphabet[random_int(0, strlen($alphabet) - 1)];
    return 'PU-A-' . $teil;
}

// ── Lesen, prüfen, drucken ───────────────────────────────────────────────────

/**
 * Eine Abschluss-Urkunde mit entschlüsseltem Namen und geprüftem Siegel.
 *
 * `siegel_ok` ist false, wenn der Name sich nicht entschlüsseln lässt oder
 * nicht mehr zu Konto, Code und Durchgang passt. Dann darf keine Urkunde
 * gedruckt werden.
 */
function pu_abschluss_lesen(string $code): ?array
{
    $code = strtoupper(trim($code));
    if (!preg_match('/^PU-A-[A-Z2-9]{8}$/', $code)) return null;

    $st = pu_db()->prepare('SELECT * FROM abschluesse WHERE pruefcode = ?');
    $st->execute([$code]);
    $r = $st->fetch();
    if ($r === false) return null;

    $vor  = pu_abschluss_entschluesseln((string)$r['vorname_geheim']);
    $nach = pu_abschluss_entschluesseln((string)$r['nachname_geheim']);
    $name = ($vor === null || $nach === null) ? null : $vor . ' ' . $nach;

    $ok = false;
    if ($name !== null) {
        $soll = pu_abschluss_siegel($code, (string)$r['konto_hash'], (int)$r['durchgang'],
                                    $name, (string)$r['ausgestellt'], (int)$r['punkte'], (int)$r['test']);
        // Der Konto-Hash wird frisch gerechnet: eine Zeile, die auf ein
        // anderes Konto umgehängt wurde, fällt hier auf.
        $ok = hash_equals($soll, (string)$r['siegel'])
           && hash_equals(pu_abschluss_konto_hash((int)$r['lernender']), (string)$r['konto_hash']);
    }

    return [
        'pruefcode'   => $code,
        'lernender'   => (int)$r['lernender'],
        'durchgang'   => (int)$r['durchgang'],
        'konto_hash'  => (string)$r['konto_hash'],
        'name'        => $ok ? $name : null,
        'siegel'      => (string)$r['siegel'],
        'siegel_ok'   => $ok,
        'punkte'      => (int)$r['punkte'],
        'ausgestellt' => (string)$r['ausgestellt'],
        'widerrufen'  => (string)$r['widerrufen'],
        'design'      => pu_abschluss_design_lesen((string)$r['design']),
        'test'        => (int)$r['test'] === 1,
    ];
}

/**
 * Öffentliche Prüfung eines `PU-A-`-Codes — ohne Namen, wie bei den Stufen.
 * Der Konto-Hash steht auf der Urkunde; wer prüft, vergleicht ihn.
 */
function pu_abschluss_pruefen(string $code): array
{
    $a = pu_abschluss_lesen($code);
    if ($a === null) return ['gefunden' => false, 'grund' => 'Zu diesem Code gibt es keine Urkunde.'];
    return [
        'gefunden'    => true,
        'art'         => 'abschluss',
        // Eine Testurkunde ist nie gültig — sie ist zum Ausprobieren da.
        'gueltig'     => $a['widerrufen'] === '' && $a['siegel_ok'] && !$a['test'],
        'siegel_ok'   => $a['siegel_ok'],
        'test'        => $a['test'],
        'durchgang'   => $a['durchgang'],
        'konto_hash'  => $a['konto_hash'],
        'siegel_kurz' => pu_abschluss_siegel_kurz($a['siegel']),
        'punkte'      => $a['punkte'],
        'ausgestellt' => substr($a['ausgestellt'], 0, 10),
        'widerrufen'  => $a['widerrufen'],
    ];
}

/**
 * Darf `$wer` diese Abschluss-Urkunde öffnen und drucken?
 *
 * `$wer` ist der echte Mensch hinter der Anfrage — während einer
 * Rollenübernahme also der Übernehmende, nicht das übernommene Konto
 * (api.php reicht pu_wer_echt() herein).
 *
 * Der Lernende selbst immer. Sonst braucht es das Recht
 * `urkunde.nachdrucken` UND den Umkreis aus srv/abo.php: Verwaltung und
 * Lehrkräfte ihre Schule, Eltern ihr verknüpftes Kind — bei einer
 * Familien-Registrierung alle Kinderkonten, die sie freigeschaltet haben.
 */
function pu_abschluss_darf_sehen(array $wer, int $lernender, bool $test = false): bool
{
    if ((int)$wer['id'] === $lernender) return true;

    require_once __DIR__ . '/rechte.php';
    // Ebene 1 ist die Plattform, nicht die Schule. Sie hat sonst jedes Recht
    // (pu_recht_hat) — hier nicht: die Zusage an die Lernenden lautet, dass
    // weder Academy-Leitung noch Administrator den Namen verarbeiten.
    // Ausnahme: Testurkunden im Testbetrieb — die trägt kein echter Mensch.
    if (pu_ebene($wer) === 'admin') return $test && pu_urkunden_testbetrieb();
    if (!pu_recht_hat('urkunde.nachdrucken', $wer)) return false;

    require_once __DIR__ . '/profil.php';
    require_once __DIR__ . '/abo.php';
    $ich  = pu_profil((int)$wer['id']);
    $ziel = pu_profil($lernender);
    if ($ich === null || $ziel === null) return false;

    $ebene = pu_ebene($ich);
    if ($ebene === 'eltern' && pu_art() === 'eltern' && ($ziel['rolle'] ?? '') === 'schueler') {
        return true;
    }
    return pu_talent_im_umkreis($ich, $ziel, $ebene);
}

/**
 * Die Abschluss-Urkunden im eigenen Umkreis — für Schule, Lehrkraft, Eltern.
 * Mit Anzeigename bzw. Pseudonym, **nicht** mit dem echten Namen: der steht
 * nur auf der Urkunde selbst.
 */
function pu_abschluesse_umkreis(array $wer): array
{
    $st = pu_db()->query(
        "SELECT a.pruefcode, a.lernender, a.durchgang, a.ausgestellt, a.widerrufen, a.test, a.design,
                l.anzeigename, l.pseudonym, l.gruppe, l.rolle,
                (SELECT COUNT(*) FROM urkunden_meldungen m
                  WHERE m.pruefcode = a.pruefcode AND m.ereignis = 'gedruckt') AS gedruckt
           FROM abschluesse a JOIN lernende l ON l.id = a.lernender
          ORDER BY a.ausgestellt DESC");
    $aus = [];
    foreach ($st->fetchAll() as $r) {
        if ((int)$r['lernender'] === (int)$wer['id']) continue;
        if (!pu_abschluss_darf_sehen($wer, (int)$r['lernender'], (int)$r['test'] === 1)) continue;
        $aus[] = [
            'pruefcode'   => (string)$r['pruefcode'],
            'wer'         => trim((string)$r['pseudonym']) !== '' ? (string)$r['pseudonym'] : (string)$r['anzeigename'],
            'ebene'       => (string)$r['rolle'],
            'gruppe'      => (string)$r['gruppe'],
            'durchgang'   => (int)$r['durchgang'],
            'ausgestellt' => (string)$r['ausgestellt'],
            'widerrufen'  => (string)$r['widerrufen'],
            'test'        => (int)$r['test'] === 1,
            'variante'    => (string)(pu_abschluss_design_lesen((string)$r['design'])['variante'] ?? ''),
            'gedruckt'    => (int)$r['gedruckt'],
        ];
    }
    return $aus;
}

/** Ein Tutor kann widerrufen. Der Durchgang bleibt verbraucht — kein Umweg zum neuen Namen. */
function pu_abschluss_widerrufen(string $code, int $durch): bool
{
    $code = strtoupper(trim($code));
    $st = pu_db()->prepare("UPDATE abschluesse SET widerrufen = ? WHERE pruefcode = ? AND widerrufen = ''");
    $st->execute([pu_jetzt(), $code]);
    $ok = $st->rowCount() > 0;
    if ($ok) {
        pu_protokoll($durch, 'abschluss_widerruf', $code, '');
        $a = pu_abschluss_lesen($code);
        pu_abschluss_melden($code, (int)($a['durchgang'] ?? 0), 'widerrufen', (string)($a['design']['variante'] ?? ''));
    }
    return $ok;
}

/**
 * Die Urkunde als eigenständige HTML-Seite.
 *
 * Jeder Abruf durch eine andere Person als den Lernenden kommt ins Protokoll
 * — mit Code und Ebene, ohne Namen. Ist das Siegel gebrochen, gibt es statt
 * der Urkunde eine Seite, die das sagt.
 */
function pu_abschluss_html(string $code, array $wer): ?string
{
    $a = pu_abschluss_lesen($code);
    if ($a === null) return null;
    if (!pu_abschluss_darf_sehen($wer, $a['lernender'], $a['test'])) {
        throw new DomainException('Diese Urkunde darfst du nicht öffnen.');
    }

    if ((int)$wer['id'] !== $a['lernender']) {
        require_once __DIR__ . '/rechte.php';
        pu_protokoll((int)$wer['id'], 'abschluss_abruf', $a['pruefcode'], 'Ebene ' . pu_ebene($wer));
    }

    if (!$a['siegel_ok']) {
        return '<!doctype html><meta charset="utf-8"><title>Siegel gebrochen</title>'
             . '<body style="font-family:Georgia,serif;background:#14110f;color:#ede5db;padding:3rem">'
             . '<h1>✕ Siegel gebrochen</h1><p>Die Urkunde <code>' . pu_h($a['pruefcode']) . '</code> '
             . 'passt nicht mehr zu ihrem Siegel: der Name wurde nachträglich verändert, oder der '
             . 'Urkundenschlüssel dieses Rechners ist ein anderer. Sie wird nicht gedruckt.</p>'
             . '<p>Abhilfe: <code>data/urkunden/abschluss.key</code> aus der Sicherung einspielen.</p></body>';
    }

    // Die gespeicherte Gestaltung — oder, falls ihre Vorlage inzwischen fehlt,
    // die erste vorhandene. Eine gelöschte Vorlage darf keine Urkunde sperren.
    $v = pu_urkunden_variante((string)($a['design']['variante'] ?? '')) ?? pu_urkunden_erste_variante();
    if ($v === null) return null;

    return pu_urkunden_seite($v, $a['design'], [
        'name'       => (string)$a['name'],
        'datum'      => date('d.m.Y', strtotime($a['ausgestellt'])),
        'durchgang'  => $a['durchgang'],
        'punkte'     => $a['punkte'],
        'pruefcode'  => $a['pruefcode'],
        'konto_hash' => $a['konto_hash'],
        'siegel'     => pu_abschluss_siegel_kurz($a['siegel']),
        'widerrufen' => $a['widerrufen'] !== '',
        'test'       => $a['test'],
        'code_fuer_druck' => $a['pruefcode'],
    ]);
}

/**
 * Die Musterseite für Schritt 1 und die Vorschau vor dem Ausstellen:
 * dieselbe Seite, mit Platzhaltern und dem Stempel „Muster".
 */
function pu_abschluss_muster(string $variante, array $design = []): ?string
{
    $v = pu_urkunden_variante($variante);
    if ($v === null) return null;
    return pu_urkunden_seite($v, $design, [
        'name' => 'Vorname Nachname', 'datum' => date('d.m.Y'), 'durchgang' => 1, 'punkte' => 0,
        'pruefcode' => 'PU-A-XXXXXXXX', 'konto_hash' => 'KH-XXXXXXXXXXXXXXXX',
        'siegel' => 'XXXX-XXXX-XXXX-XXXX-XXXX', 'muster' => true,
    ]);
}

// ── Gestaltung ───────────────────────────────────────────────────────────────

/** Variante + geklemmte Werte — null, wenn es die Variante nicht gibt. */
function pu_abschluss_design_bauen(string $variante, array $wunsch): ?array
{
    $v = pu_urkunden_variante($variante);
    if ($v === null) return null;
    return ['variante' => $v['id']] + pu_urkunden_design_klemmen($v, $wunsch);
}

function pu_abschluss_design_lesen(string $json): array
{
    $d = json_decode($json, true);
    return is_array($d) ? $d : [];
}

function pu_urkunden_erste_variante(): ?array
{
    foreach (pu_urkunden_varianten() as $g) {
        foreach ($g['varianten'] as $v) return pu_urkunden_variante($v['id']);
    }
    return null;
}

/**
 * Speichert die Gestaltung — nur der Teilnehmer selbst, für seine eigene
 * Urkunde. Schule, Lehrkraft und Eltern drucken, was er gewählt hat.
 * Gemeldet wird nur, wenn sich wirklich etwas geändert hat.
 */
function pu_abschluss_design_setzen(int $lernender, string $code, string $variante, array $wunsch): array
{
    $a = pu_abschluss_lesen($code);
    if ($a === null || $a['lernender'] !== $lernender) {
        throw new DomainException('Das ist nicht deine Urkunde.');
    }
    if (pu_uebernommen() && !($a['test'] && pu_urkunden_testbetrieb())) {
        throw new DomainException('Während einer Rollenübernahme wird die Urkunde nicht umgestaltet.');
    }
    $neu = pu_abschluss_design_bauen($variante, $wunsch);
    if ($neu === null) throw new InvalidArgumentException('Dieses Design gibt es nicht.');

    if ($neu != $a['design']) {
        pu_db()->prepare('UPDATE abschluesse SET design = ? WHERE pruefcode = ?')
               ->execute([json_encode($neu, JSON_UNESCAPED_UNICODE), $a['pruefcode']]);
        pu_abschluss_melden($a['pruefcode'], $a['durchgang'], 'gestaltet', $neu['variante']);
    }
    return $neu;
}

/** Ein Druck (oder „als PDF sichern") — gezählt für die Rückmeldung. */
function pu_abschluss_gedruckt(string $code, array $wer): bool
{
    $a = pu_abschluss_lesen($code);
    if ($a === null || !$a['siegel_ok'] || !pu_abschluss_darf_sehen($wer, $a['lernender'], $a['test'])) return false;
    pu_abschluss_melden($a['pruefcode'], $a['durchgang'], 'gedruckt', (string)($a['design']['variante'] ?? ''));
    return true;
}

// ── Rückmeldung ans Cockpit ──────────────────────────────────────────────────

const PU_ABSCHLUSS_EREIGNISSE = ['ausgestellt', 'gestaltet', 'gedruckt', 'widerrufen'];

/** Legt eine Meldung in den Postausgang. Nie mit Namen, nie mit Konto. */
function pu_abschluss_melden(string $code, int $durchgang, string $ereignis, string $variante): void
{
    if (!in_array($ereignis, PU_ABSCHLUSS_EREIGNISSE, true)) return;
    // Testurkunden melden mit — gekennzeichnet, damit das Cockpit sie nicht
    // mitzählt, aber sehen kann, dass der Generator auf dem Testrechner läuft.
    $st = pu_db()->prepare('SELECT test FROM abschluesse WHERE pruefcode = ?');
    $st->execute([$code]);
    $test = (int)$st->fetchColumn();
    pu_db()->prepare('INSERT INTO urkunden_meldungen (pruefcode, durchgang, ereignis, variante, test, zeitpunkt)
                      VALUES (?,?,?,?,?,?)')
           ->execute([$code, $durchgang, $ereignis, $variante, $test, pu_jetzt()]);
}

/** Die Meldungen zu einer Urkunde, älteste zuerst — für die Anzeige vor Ort. */
function pu_abschluss_meldungen(string $code): array
{
    $st = pu_db()->prepare('SELECT ereignis, variante, zeitpunkt, gesendet FROM urkunden_meldungen
                             WHERE pruefcode = ? ORDER BY id');
    $st->execute([strtoupper(trim($code))]);
    return $st->fetchAll();
}

/**
 * Schickt den Postausgang an den Server (Relay-Zweck `urkunden`).
 *
 * Läuft nur für registrierte Installationen und nur mit, wenn ohnehin ein
 * Abgleich stattfindet (pu_relay_stand). Kennt der Server den Zweck noch
 * nicht oder ist er nicht erreichbar, bleibt alles liegen — es geht nichts
 * verloren, und die Academy läuft weiter.
 *
 * @return int Anzahl der angenommenen Meldungen
 */
function pu_abschluss_meldungen_senden(): int
{
    require_once __DIR__ . '/relay.php';
    if (!pu_ident_vorhanden()) return 0;

    $st = pu_db()->query("SELECT id, pruefcode, durchgang, ereignis, variante, test, zeitpunkt
                            FROM urkunden_meldungen WHERE gesendet = '' ORDER BY id LIMIT 200");
    $offen = $st->fetchAll();
    if ($offen === []) return 0;

    $nutzlast = array_map(static fn(array $m) => [
        'code' => (string)$m['pruefcode'], 'durchgang' => (int)$m['durchgang'],
        'ereignis' => (string)$m['ereignis'], 'variante' => (string)$m['variante'],
        'test' => (int)$m['test'], 'zeit' => (string)$m['zeitpunkt'],
    ], $offen);

    $aus = pu_relay_ruf('urkunden', ['meldungen' => $nutzlast]);
    if (!$aus['ok']) return 0;

    $jetzt = pu_jetzt();
    $upd = pu_db()->prepare('UPDATE urkunden_meldungen SET gesendet = ? WHERE id = ?');
    foreach ($offen as $m) $upd->execute([$jetzt, (int)$m['id']]);
    return count($offen);
}

// ── Testbetrieb ──────────────────────────────────────────────────────────────
//
// Auf einem Testrechner (z. B. C:\Promptheus-Test-Ordner) soll sich jede
// Kontoart bis zur Urkunde führen lassen, ohne sechs Prüfungen zu schreiben.
// Der Schalter steht in Einstellungen → Urkunden und braucht das Recht
// `urkunde.ausstellen`. Was er erzeugt, ist ehrlich gekennzeichnet:
//
//   - die Prüfungen tragen `test = 1`,
//   - jede Urkunde aus einem solchen Durchgang ist eine Testurkunde — mit
//     Stempel, mitversiegelt, und die öffentliche Prüfung nennt sie ungültig,
//   - die Meldungen ans Cockpit tragen `test = 1`.
//
// Echte Urkunden und echte Prüfungen fasst der Testbetrieb nie an.

function pu_urkunden_testbetrieb(): bool
{
    return pu_setting('urkunden_testbetrieb') === '1';
}

function pu_urkunden_testbetrieb_setzen(bool $an, int $durch): void
{
    pu_setting_setzen('urkunden_testbetrieb', $an ? '1' : '0');
    pu_protokoll($durch, 'urkunden_testbetrieb', $an ? 'an' : 'aus', '');
}

/** Konten, die `$wer` im Testbetrieb bis zur Urkunde führen darf. */
function pu_urkunden_testkonto_erlaubt(array $wer, int $lernender): bool
{
    require_once __DIR__ . '/rechte.php';
    require_once __DIR__ . '/profil.php';
    require_once __DIR__ . '/abo.php';
    if ((int)$wer['id'] === $lernender) return true;
    $ich  = pu_profil((int)$wer['id']);
    $ziel = pu_profil($lernender);
    if ($ich === null || $ziel === null) return false;
    return pu_talent_im_umkreis($ich, $ziel, pu_ebene($ich));
}

/** Trägt die sechs Stufenprüfungen als bestanden ein — als Test. */
function pu_abschluss_test_bestehen(int $lernender, int $durch): void
{
    if (!pu_urkunden_testbetrieb()) {
        throw new DomainException('Der Testbetrieb für Urkunden ist ausgeschaltet.');
    }
    $st = pu_db()->prepare('SELECT 1 FROM lernende WHERE id = ?');
    $st->execute([$lernender]);
    if ($st->fetchColumn() === false) throw new InvalidArgumentException('Dieses Konto gibt es nicht.');

    $ins = pu_db()->prepare(
        'INSERT INTO pruefungen (lernender, stufe, punkte, max_punkte, bestanden, zeitpunkt, test)
         VALUES (?,?,100,100,1,?,1)');
    foreach (array_keys(PU_STUFEN) as $nr) $ins->execute([$lernender, (int)$nr, pu_jetzt()]);
    pu_protokoll($durch, 'abschluss_test', 'Konto ' . $lernender, 'sechs Stufen als bestanden (Test)');
}

/**
 * Nimmt den Test zurück: Test-Prüfungen und Testurkunden des Kontos fallen
 * weg, damit sich der Weg zur Urkunde noch einmal gehen lässt. Echte
 * Prüfungen und echte Urkunden bleiben unberührt.
 *
 * @return array{pruefungen:int, urkunden:int}
 */
function pu_abschluss_test_zuruecksetzen(int $lernender, int $durch): array
{
    if (!pu_urkunden_testbetrieb()) {
        throw new DomainException('Der Testbetrieb für Urkunden ist ausgeschaltet.');
    }
    $pdo = pu_db();
    $pdo->exec('BEGIN IMMEDIATE');
    try {
        $p = $pdo->prepare('DELETE FROM pruefungen WHERE lernender = ? AND test = 1');
        $p->execute([$lernender]);
        $u = $pdo->prepare('DELETE FROM abschluesse WHERE lernender = ? AND test = 1');
        $u->execute([$lernender]);
        $pdo->exec('COMMIT');
    } catch (Throwable $e) {
        $pdo->exec('ROLLBACK');
        throw $e;
    }
    pu_protokoll($durch, 'abschluss_test', 'Konto ' . $lernender, 'Test zurückgesetzt');
    return ['pruefungen' => $p->rowCount(), 'urkunden' => $u->rowCount()];
}

// ── Überblick für Einstellungen → Urkunden ───────────────────────────────────

/**
 * Was der Reiter „Urkunden" zeigt — je nach Recht mehr oder weniger.
 *
 *   jeder           der eigene Stand und der Weg zum Generator
 *   nachdrucken     die Urkunden im eigenen Umkreis (ohne echte Namen)
 *   ausstellen      Sicherheit (Schlüssel, Postausgang) und der Testbetrieb
 */
function pu_urkunden_uebersicht(array $wer): array
{
    require_once __DIR__ . '/rechte.php';
    $id = (int)$wer['id'];
    $eigen = pu_abschluss_stand($id);

    $aus = [
        'eigen' => [
            'faellig'  => $eigen['faellig'],
            'stufen'   => count($eigen['stufen']),
            'gesamt'   => $eigen['gesamt'],
            'urkunden' => count($eigen['urkunden']),
        ],
        'testbetrieb'  => pu_urkunden_testbetrieb(),
        'nachdrucken'  => pu_recht_hat('urkunde.nachdrucken', $wer),
        'verwalten'    => pu_recht_hat('urkunde.ausstellen', $wer),
        'umkreis'      => [],
        'sicherheit'   => null,
        'konten'       => [],
    ];
    if ($aus['nachdrucken'] || $aus['verwalten']) $aus['umkreis'] = pu_abschluesse_umkreis($wer);

    if ($aus['verwalten']) {
        $m = pu_db()->query("SELECT
                SUM(gesendet = '') AS offen, SUM(gesendet <> '') AS gesendet, MAX(gesendet) AS zuletzt
              FROM urkunden_meldungen")->fetch();
        $alle = pu_db()->query('SELECT COUNT(*) AS n, SUM(test) AS t, SUM(widerrufen <> \'\') AS w
                                  FROM abschluesse')->fetch();
        require_once __DIR__ . '/identitaet.php';
        $aus['sicherheit'] = [
            'schluessel_da' => is_file(PU_ABSCHLUSS_ORDNER . '/' . PU_ABSCHLUSS_DATEI),
            'schluessel_ort' => 'data/urkunden/' . PU_ABSCHLUSS_DATEI,
            'registriert'   => pu_ident_vorhanden(),
            'offen'         => (int)$m['offen'],
            'gesendet'      => (int)$m['gesendet'],
            'zuletzt'       => (string)$m['zuletzt'],
            'urkunden'      => (int)$alle['n'],
            'test'          => (int)$alle['t'],
            'widerrufen'    => (int)$alle['w'],
        ];
    }

    if ($aus['verwalten'] && $aus['testbetrieb']) {
        $st = pu_db()->query('SELECT id, kennung, anzeigename, pseudonym, rolle FROM lernende ORDER BY rolle, anzeigename');
        foreach ($st->fetchAll() as $r) {
            if (!pu_urkunden_testkonto_erlaubt($wer, (int)$r['id'])) continue;
            $s = pu_abschluss_stand((int)$r['id']);
            $aus['konten'][] = [
                'id'       => (int)$r['id'],
                'kennung'  => (string)$r['kennung'],
                'name'     => trim((string)$r['pseudonym']) !== '' ? (string)$r['pseudonym'] : (string)$r['anzeigename'],
                'ebene'    => (string)$r['rolle'],
                'stufen'   => count($s['stufen']),
                'faellig'  => $s['faellig'],
                'test'     => $s['test'],
                'urkunden' => count($s['urkunden']),
                'testurkunden' => count(array_filter($s['urkunden'], static fn($u) => !empty($u['test']))),
                'ich'      => (int)$r['id'] === $id,
            ];
        }
    }
    return $aus;
}
