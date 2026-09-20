<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — die Identität dieser Installation.
 *
 * Eine Installation weist sich gegenüber dem VPS mit einem Schlüsselpaar aus,
 * nicht mit einem Namen. Daraus folgt alles Weitere: die Installations-ID,
 * die Pseudonyme der Lernenden, die Unterschrift unter jedem Upload.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * Warum kein „Hash aus Schulname und Benutzername"
 *
 * Weil er nicht anonym ist und sich nicht widerrufen lässt. Namen und Schulen
 * sind aufzählbar: wer den Hash einer Klasse haben will, probiert dreissig
 * Vornamen gegen eine Schulliste durch und hat sie. Und ist der Hash einmal
 * draussen, gibt es keinen zweiten — der Name bleibt ja derselbe.
 *
 * Ein Schlüsselpaar hat beide Eigenschaften: aus dem öffentlichen Teil lässt
 * sich nichts über den Menschen gewinnen, und ein verlorener Schlüssel wird
 * gesperrt und durch einen neuen ersetzt.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * Ein Geheimnis, alles andere abgeleitet
 *
 *     saat (32 Byte, zufällig)
 *       ├── sodium_crypto_sign_seed_keypair  →  Ed25519-Paar  →  IID
 *       └── sodium_crypto_kdf_derive_from_key →  k_lp         →  Pseudonyme
 *
 * Nur die Saat ist geheim und nur sie muss gesichert werden. Zwei Geheimnisse
 * nebeneinander wären zwei Gelegenheiten, eines davon zu verlieren.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * Was diese Datei NICHT tut
 *
 * Sie spricht mit niemandem. Kein HTTP, keine Registrierung, keine Prüfung
 * einer Bescheinigung gegen einen Server — das gehört in `srv/relay.php`.
 * Hier wird gerechnet und auf die Platte geschrieben, sonst nichts.
 */

require_once __DIR__ . '/../lib.php';

/**
 * Der Ablageort. Umlegbar wie die Datenbank und aus demselben Grund: ein
 * Test, der die echte Saat überschreibt, macht die Installation wertlos —
 * alle Talente und alle hochgeladenen Werke hängen an ihr.
 */
define('PU_IDENT_ORDNER', ($p = getenv('PU_TEST_IDENT')) !== false && $p !== ''
    ? $p
    : PU_DATA . '/identitaet');

const PU_IDENT_SAAT    = 'saat.bin';
const PU_IDENT_BESCH   = 'bescheinigung.json';
const PU_IDENT_KDF_LP  = 'pu-lp---';     // genau acht Zeichen, so will es libsodium
const PU_IDENT_LP_LAENGE = 16;           // Zeichen des Pseudonyms nach „LP-"

/** Ohne libsodium geht hier nichts. Einmal prüfen, verständlich melden. */
function pu_ident_bereit(): bool
{
    return extension_loaded('sodium');
}

function pu_ident_fordere_sodium(): void
{
    if (!pu_ident_bereit()) {
        throw new RuntimeException(
            'Die Erweiterung sodium fehlt. In php.ini eintragen: extension=sodium '
            . '— die Datei php_sodium.dll liegt bereits im ext-Ordner.');
    }
}

// ── Base32 ───────────────────────────────────────────────────────────────────

/**
 * Base32 nach RFC 4648, ohne Auffüllzeichen.
 *
 * Nicht Base64 und nicht Hex: Die Installations-ID wird vorgelesen, abgetippt
 * und in eine Zeile geschrieben. Base32 kennt keine Gross-/Kleinschreibung,
 * kein `+`, kein `/` und kein `=` — und mit dem RFC-Alphabet auch keine 0, 1
 * und 8, die man mit O, I und B verwechselt.
 */
function pu_base32(string $roh): string
{
    $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    $bits = '';
    for ($i = 0, $n = strlen($roh); $i < $n; $i++) {
        $bits .= str_pad(decbin(ord($roh[$i])), 8, '0', STR_PAD_LEFT);
    }
    $aus = '';
    foreach (str_split($bits, 5) as $fuenf) {
        if (strlen($fuenf) < 5) {
            $fuenf = str_pad($fuenf, 5, '0');
        }
        $aus .= $alphabet[bindec($fuenf)];
    }
    return $aus;
}

// ── Die Saat ─────────────────────────────────────────────────────────────────

function pu_ident_ordner(): string
{
    return PU_IDENT_ORDNER;
}

function pu_ident_vorhanden(): bool
{
    return is_file(PU_IDENT_ORDNER . '/' . PU_IDENT_SAAT);
}

/**
 * Legt die Identität an — einmal je Installation.
 *
 * **Erst bei der Registrierung, nicht bei der Installation.** Wer nur die
 * Kurse 1 bis 6 spielt, registriert sich nie; für den entstünde sonst ein
 * Schlüssel, den niemand braucht und der trotzdem gesichert werden müsste.
 *
 * Ruft man die Funktion zweimal, passiert beim zweiten Mal nichts. Eine neue
 * Saat über eine alte zu schreiben hiesse, jede Bescheinigung, jedes
 * Pseudonym und jedes hochgeladene Werk von dieser Installation zu trennen.
 */
function pu_ident_erzeugen(): string
{
    pu_ident_fordere_sodium();

    if (pu_ident_vorhanden()) {
        return pu_ident_iid();
    }

    $ordner = PU_IDENT_ORDNER;
    if (!is_dir($ordner) && !@mkdir($ordner, 0700, true) && !is_dir($ordner)) {
        throw new RuntimeException("Ordner lässt sich nicht anlegen: $ordner");
    }

    $saat = random_bytes(SODIUM_CRYPTO_SIGN_SEEDBYTES);
    $datei = $ordner . '/' . PU_IDENT_SAAT;

    // Erst neben die Zieldatei schreiben, dann umbenennen. Ein Stromausfall
    // mitten im Schreiben hinterliesse sonst eine halbe Saat — und eine halbe
    // Saat sieht aus wie eine ganze.
    $vorlaeufig = $datei . '.neu';
    if (file_put_contents($vorlaeufig, $saat, LOCK_EX) !== strlen($saat)) {
        @unlink($vorlaeufig);
        throw new RuntimeException('Die Saat liess sich nicht schreiben.');
    }
    // Unter Windows tut chmod nichts; dort schützt der Ordner unter dem
    // Benutzerprofil. Unter Linux und macOS ist es die eine Zeile, die
    // verhindert, dass ein anderes Konto die Saat liest.
    @chmod($vorlaeufig, 0600);
    if (!rename($vorlaeufig, $datei)) {
        @unlink($vorlaeufig);
        throw new RuntimeException('Die Saat liess sich nicht ablegen.');
    }
    sodium_memzero($saat);

    return pu_ident_iid();
}

/** Liest die Saat. Nur innerhalb dieser Datei benutzen. */
function pu_ident_saat(): string
{
    pu_ident_fordere_sodium();
    $datei = PU_IDENT_ORDNER . '/' . PU_IDENT_SAAT;
    if (!is_file($datei)) {
        throw new RuntimeException(
            'Diese Installation hat noch keine Identität. '
            . 'Sie entsteht bei der Registrierung.');
    }
    $saat = (string)file_get_contents($datei);
    if (strlen($saat) !== SODIUM_CRYPTO_SIGN_SEEDBYTES) {
        throw new RuntimeException(
            'Die Saat hat die falsche Länge — die Datei ist beschädigt. '
            . 'Aus einer Sicherung einspielen, nicht neu erzeugen.');
    }
    return $saat;
}

/** Das Schlüsselpaar aus der Saat. Bei jedem Aufruf dasselbe. */
function pu_ident_paar(): array
{
    $saat = pu_ident_saat();
    $paar = sodium_crypto_sign_seed_keypair($saat);
    sodium_memzero($saat);
    return [
        'oeffentlich' => sodium_crypto_sign_publickey($paar),
        'geheim'      => sodium_crypto_sign_secretkey($paar),
    ];
}

function pu_ident_oeffentlich(): string
{
    return base64_encode(pu_ident_paar()['oeffentlich']);
}

/**
 * Die Installations-ID: `IID-` + Base32 über BLAKE2b-160 des öffentlichen
 * Schlüssels. 160 Bit sind 32 Zeichen — kurz genug zum Vorlesen, lang genug,
 * dass niemand zwei Installationen mit derselben ID findet.
 */
function pu_ident_iid(): string
{
    $pk = pu_ident_paar()['oeffentlich'];
    return 'IID-' . pu_base32(sodium_crypto_generichash($pk, '', 20));
}

// ── Unterschreiben und prüfen ────────────────────────────────────────────────

/**
 * Unterschreibt einen Rumpf. Losgelöste Signatur, base64.
 *
 * Losgelöst und nicht eingebettet, damit der Server den Rumpf ansehen kann,
 * ohne ihn erst auspacken zu müssen — und damit im Protokoll steht, was
 * unterschrieben wurde, und nicht ein undurchsichtiger Block.
 */
function pu_ident_signieren(string $rumpf): string
{
    $paar = pu_ident_paar();
    $sig = sodium_crypto_sign_detached($rumpf, $paar['geheim']);
    sodium_memzero($paar['geheim']);
    return base64_encode($sig);
}

/** Prüft eine Unterschrift gegen einen öffentlichen Schlüssel (base64). */
function pu_ident_pruefen(string $rumpf, string $signatur, string $pk_b64): bool
{
    if (!pu_ident_bereit()) {
        return false;
    }
    $sig = base64_decode($signatur, true);
    $pk  = base64_decode($pk_b64, true);
    if ($sig === false || $pk === false
        || strlen($sig) !== SODIUM_CRYPTO_SIGN_BYTES
        || strlen($pk) !== SODIUM_CRYPTO_SIGN_PUBLICKEYBYTES) {
        return false;
    }
    try {
        return sodium_crypto_sign_verify_detached($sig, $rumpf, $pk);
    } catch (Throwable $f) {
        return false;
    }
}

/**
 * Bringt Daten in eine Form, die auf beiden Seiten Zeichen für Zeichen gleich
 * ist: Schlüssel sortiert, keine Leerzeichen, Schrägstriche und Umlaute
 * unmaskiert.
 *
 * Ohne das prüft der Server eine andere Zeichenkette, als der Client
 * unterschrieben hat, und die Signatur ist grundlos falsch — ein Fehler, den
 * man stundenlang an der falschen Stelle sucht.
 */
function pu_ident_kanonisch(array $daten): string
{
    $sortieren = static function (array $a) use (&$sortieren): array {
        ksort($a, SORT_STRING);
        foreach ($a as $k => $v) {
            if (is_array($v)) {
                $a[$k] = $sortieren($v);
            }
        }
        return $a;
    };
    $json = json_encode($sortieren($daten),
        JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRESERVE_ZERO_FRACTION);
    if ($json === false) {
        throw new RuntimeException('Die Daten lassen sich nicht kanonisch schreiben.');
    }
    return $json;
}

/**
 * Baut eine unterschriebene Anfrage an den VPS.
 *
 * Zeitpunkt und Einmalwert gehören **in** den unterschriebenen Rumpf, nicht
 * daneben. Stünden sie daneben, könnte jemand einen mitgeschnittenen Aufruf
 * mit neuer Zeit erneut senden, und die Unterschrift stimmte weiterhin.
 */
function pu_ident_anfrage(string $zweck, array $nutzlast = []): array
{
    $rumpf = [
        'zweck'    => $zweck,
        'iid'      => pu_ident_iid(),
        'zeit'     => gmdate('Y-m-d\TH:i:s\Z'),
        'nonce'    => bin2hex(random_bytes(16)),
        'nutzlast' => $nutzlast,
    ];
    $kanonisch = pu_ident_kanonisch($rumpf);
    return [
        'rumpf'       => $kanonisch,
        'signatur'    => pu_ident_signieren($kanonisch),
        'oeffentlich' => pu_ident_oeffentlich(),
    ];
}

// ── Lernenden-Pseudonyme ─────────────────────────────────────────────────────

/**
 * Das Pseudonym eines Kontos dieser Installation.
 *
 *     LP = "LP-" + base32( HMAC-SHA256( k_lp, IID | lernender ) )[0..15]
 *
 * Drei Eigenschaften, alle gewollt:
 *
 * - **stabil** — dasselbe Konto ergibt immer dasselbe Pseudonym, sonst liesse
 *   sich kein Guthaben darauf führen;
 * - **nicht rückrechenbar** — ohne `k_lp` ist aus dem Pseudonym nichts zu
 *   gewinnen, auch nicht durch Durchprobieren, weil `k_lp` zufällig ist und
 *   nicht aus Namen besteht;
 * - **nicht übergreifend verknüpfbar** — derselbe Mensch auf zwei
 *   Installationen hat zwei Pseudonyme. Die Gemeinde soll nicht
 *   zusammenrechnen können, wer wo lernt.
 */
function pu_ident_lp(string $lernender): string
{
    pu_ident_fordere_sodium();
    if ($lernender === '') {
        throw new InvalidArgumentException('Ohne Konto kein Pseudonym.');
    }
    $saat = pu_ident_saat();
    $k_lp = sodium_crypto_kdf_derive_from_key(32, 1, PU_IDENT_KDF_LP, $saat);
    sodium_memzero($saat);

    $roh = hash_hmac('sha256', pu_ident_iid() . '|' . $lernender, $k_lp, true);
    sodium_memzero($k_lp);

    return 'LP-' . substr(pu_base32($roh), 0, PU_IDENT_LP_LAENGE);
}

// ── Die Bescheinigung des VPS ────────────────────────────────────────────────

/**
 * Legt die Bescheinigung ab — aber nur, wenn ihre Unterschrift stimmt.
 *
 * Der öffentliche Schlüssel des VPS kommt mit dem Programm und steht in
 * `PU_VPS_SCHLUESSEL`. Ohne ihn wird nichts angenommen: eine Bescheinigung,
 * die niemand prüft, ist eine Behauptung.
 */
function pu_ident_bescheinigung_setzen(array $bescheinigung, string $signatur): bool
{
    $pk = pu_env('PU_VPS_SCHLUESSEL', '');
    if ($pk === '') {
        return false;
    }
    if (!pu_ident_pruefen(pu_ident_kanonisch($bescheinigung), $signatur, $pk)) {
        return false;
    }
    if (($bescheinigung['iid'] ?? '') !== pu_ident_iid()) {
        return false;   // ausgestellt für eine andere Installation
    }

    $ordner = PU_IDENT_ORDNER;
    if (!is_dir($ordner) && !@mkdir($ordner, 0700, true) && !is_dir($ordner)) {
        return false;
    }
    $inhalt = json_encode(
        ['bescheinigung' => $bescheinigung, 'signatur' => $signatur],
        JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    return file_put_contents($ordner . '/' . PU_IDENT_BESCH, $inhalt, LOCK_EX) !== false;
}

/**
 * Liest die abgelegte Bescheinigung und prüft sie erneut.
 *
 * Erneut, weil zwischen Ablegen und Lesen jemand die Datei geändert haben
 * könnte — sie liegt schliesslich auf dem Rechner dessen, der von ihr
 * profitiert.
 */
function pu_ident_bescheinigung(): ?array
{
    $datei = PU_IDENT_ORDNER . '/' . PU_IDENT_BESCH;
    if (!is_file($datei)) {
        return null;
    }
    $roh = json_decode((string)file_get_contents($datei), true);
    if (!is_array($roh) || !isset($roh['bescheinigung'], $roh['signatur'])) {
        return null;
    }
    $pk = pu_env('PU_VPS_SCHLUESSEL', '');
    if ($pk === '' || !pu_ident_pruefen(
            pu_ident_kanonisch($roh['bescheinigung']), (string)$roh['signatur'], $pk)) {
        return null;
    }
    return $roh['bescheinigung'];
}

/** Gilt die Bescheinigung jetzt noch? */
function pu_ident_gueltig(?string $jetzt = null): bool
{
    $b = pu_ident_bescheinigung();
    if ($b === null) {
        return false;
    }
    $bis = (string)($b['gueltig_bis'] ?? '');
    return $bis !== '' && $bis > ($jetzt ?? gmdate('Y-m-d\TH:i:s\Z'));
}

// ── Sicherung ────────────────────────────────────────────────────────────────

/**
 * Die Saat verschlüsselt ausgeben, mit einer Passphrase, die nur der Nutzer
 * kennt.
 *
 * Ohne diese Möglichkeit bedeutet ein kaputter Rechner: alle Talente weg,
 * alle Werke von der Installation getrennt, und die Verwaltung der Schule
 * muss jedes Pseudonym von Hand neu zuordnen.
 */
function pu_ident_sichern(string $passphrase): string
{
    pu_ident_fordere_sodium();
    if (strlen($passphrase) < 12) {
        throw new InvalidArgumentException(
            'Die Passphrase ist zu kurz — mindestens zwölf Zeichen. '
            . 'Sie ist das Einzige, was die Sicherung schützt.');
    }
    $salz = random_bytes(SODIUM_CRYPTO_PWHASH_SALTBYTES);
    $schluessel = sodium_crypto_pwhash(
        SODIUM_CRYPTO_SECRETBOX_KEYBYTES, $passphrase, $salz,
        SODIUM_CRYPTO_PWHASH_OPSLIMIT_INTERACTIVE,
        SODIUM_CRYPTO_PWHASH_MEMLIMIT_INTERACTIVE);
    $nonce = random_bytes(SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);
    $saat = pu_ident_saat();
    $kiste = sodium_crypto_secretbox($saat, $nonce, $schluessel);
    sodium_memzero($saat);
    sodium_memzero($schluessel);

    return json_encode([
        'art'   => 'promptheus-identitaet',
        'fassung' => 1,
        'iid'   => pu_ident_iid(),
        'salz'  => base64_encode($salz),
        'nonce' => base64_encode($nonce),
        'kiste' => base64_encode($kiste),
    ], JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
}

/**
 * Spielt eine Sicherung ein. Weigert sich, eine vorhandene Saat zu
 * überschreiben — wer wirklich ersetzen will, löscht sie vorher von Hand und
 * hat dann wenigstens einmal darüber nachgedacht.
 */
function pu_ident_einspielen(string $paket, string $passphrase): bool
{
    pu_ident_fordere_sodium();
    if (pu_ident_vorhanden()) {
        throw new RuntimeException(
            'Hier liegt schon eine Identität. Eine Sicherung darüber zu '
            . 'spielen würde die bestehende verlieren.');
    }
    $d = json_decode($paket, true);
    if (!is_array($d) || ($d['art'] ?? '') !== 'promptheus-identitaet') {
        return false;
    }
    $salz  = base64_decode((string)($d['salz'] ?? ''), true);
    $nonce = base64_decode((string)($d['nonce'] ?? ''), true);
    $kiste = base64_decode((string)($d['kiste'] ?? ''), true);
    if ($salz === false || $nonce === false || $kiste === false
        || strlen($salz) !== SODIUM_CRYPTO_PWHASH_SALTBYTES
        || strlen($nonce) !== SODIUM_CRYPTO_SECRETBOX_NONCEBYTES) {
        return false;
    }
    $schluessel = sodium_crypto_pwhash(
        SODIUM_CRYPTO_SECRETBOX_KEYBYTES, $passphrase, $salz,
        SODIUM_CRYPTO_PWHASH_OPSLIMIT_INTERACTIVE,
        SODIUM_CRYPTO_PWHASH_MEMLIMIT_INTERACTIVE);
    $saat = sodium_crypto_secretbox_open($kiste, $nonce, $schluessel);
    sodium_memzero($schluessel);
    if ($saat === false || strlen($saat) !== SODIUM_CRYPTO_SIGN_SEEDBYTES) {
        return false;   // falsche Passphrase oder beschädigtes Paket
    }

    $ordner = PU_IDENT_ORDNER;
    if (!is_dir($ordner) && !@mkdir($ordner, 0700, true) && !is_dir($ordner)) {
        return false;
    }
    $datei = $ordner . '/' . PU_IDENT_SAAT;
    $ok = file_put_contents($datei, $saat, LOCK_EX) === strlen($saat);
    @chmod($datei, 0600);
    sodium_memzero($saat);
    return $ok;
}
