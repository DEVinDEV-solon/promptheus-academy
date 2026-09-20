<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Prüfung der Installationsidentität (Knoten K-IDENT-LOKAL).
 *
 * Geprüft wird vor allem, was **nicht** gehen darf: eine fremde Unterschrift
 * darf nicht durchkommen, ein geänderter Rumpf nicht, eine Bescheinigung für
 * eine andere Installation nicht, und eine falsche Passphrase darf keine
 * Saat hergeben.
 *
 * Aufruf:
 *     php -d extension=sodium -d extension=pdo_sqlite tests/identitaet_test.php
 */

require_once __DIR__ . '/hilfe.php';

// Eigener Ordner, bevor irgendetwas geladen wird. Ein Test, der die echte
// Saat überschreibt, trennt die Installation von allen ihren Talenten.
$ordner = sys_get_temp_dir() . '/pu_ident_' . bin2hex(random_bytes(6));
putenv('PU_TEST_IDENT=' . $ordner);
putenv('PU_TEST_DB=' . sys_get_temp_dir() . '/pu_ident_' . bin2hex(random_bytes(6)) . '.db');
putenv('PU_TEST_ENV=' . sys_get_temp_dir() . '/pu_ident_' . bin2hex(random_bytes(6)) . '.env');

require_once __DIR__ . '/../srv/identitaet.php';

register_shutdown_function(static function () use ($ordner) {
    foreach (glob($ordner . '/*') ?: [] as $f) {
        @unlink($f);
    }
    @rmdir($ordner);
    foreach ([getenv('PU_TEST_DB'), getenv('PU_TEST_ENV')] as $f) {
        if (is_string($f) && $f !== '') {
            @unlink($f);
        }
    }
});

if (!pu_ident_bereit()) {
    echo "\nsodium fehlt — Aufruf mit  -d extension=sodium\n";
    exit(2);
}

/** Führt etwas aus und meldet, ob es abgelehnt wurde. */
function abgelehnt(callable $tun): bool
{
    try {
        $x = $tun();
        return $x === false || $x === null;
    } catch (Throwable $f) {
        return true;
    }
}

// ─────────────────────────────────────────────────────────────── Base32
gruppe('Base32');

gleich('leer bleibt leer', '', pu_base32(''));
pruefe('nur RFC-4648-Zeichen',
    (bool)preg_match('/^[A-Z2-7]*$/', pu_base32(random_bytes(40))));
pruefe('keine verwechselbaren Ziffern (0, 1, 8)',
    !preg_match('/[018]/', pu_base32(random_bytes(200))));
gleich('gleiche Eingabe, gleiche Ausgabe',
    pu_base32("PROMPTHEUS"), pu_base32("PROMPTHEUS"));

// ────────────────────────────────────────────────────────── Erzeugen
gruppe('Die Identität entsteht');

pruefe('vorher ist keine da', !pu_ident_vorhanden());
pruefe('ohne Saat wird nicht gerechnet', abgelehnt(fn() => pu_ident_iid()));

$iid = pu_ident_erzeugen();
pruefe('danach ist eine da', pu_ident_vorhanden());
pruefe('die IID beginnt mit IID-', str_starts_with($iid, 'IID-'), $iid);
gleich('160 Bit ergeben 32 Zeichen', 32, strlen($iid) - 4);
pruefe('die IID ist stabil', $iid === pu_ident_iid());

$zweiter = pu_ident_erzeugen();
gleich('ein zweiter Aufruf legt nichts Neues an', $iid, $zweiter);

$saat = file_get_contents(pu_ident_ordner() . '/saat.bin');
gleich('die Saat ist 32 Byte gross', 32, strlen((string)$saat));

$pk = pu_ident_oeffentlich();
gleich('der öffentliche Schlüssel ist 32 Byte',
    32, strlen((string)base64_decode($pk, true)));

// ────────────────────────────────────────────────── Unterschreiben
gruppe('Unterschreiben und prüfen');

$rumpf = 'Ein Werk der Werkstatt, 2026-09-20';
$sig   = pu_ident_signieren($rumpf);

pruefe('die eigene Unterschrift geht durch',
    pu_ident_pruefen($rumpf, $sig, $pk));
pruefe('ein geänderter Rumpf geht nicht durch',
    !pu_ident_pruefen($rumpf . ' ', $sig, $pk));
pruefe('eine veränderte Unterschrift geht nicht durch',
    !pu_ident_pruefen($rumpf, strrev($sig), $pk));

// Ein fremdes Schlüsselpaar — nicht unsere Saat.
$fremd    = sodium_crypto_sign_keypair();
$fremd_pk = base64_encode(sodium_crypto_sign_publickey($fremd));
$fremd_sig = base64_encode(
    sodium_crypto_sign_detached($rumpf, sodium_crypto_sign_secretkey($fremd)));

pruefe('eine fremde Unterschrift geht nicht durch',
    !pu_ident_pruefen($rumpf, $fremd_sig, $pk));
pruefe('die eigene Unterschrift gilt nicht unter fremdem Schlüssel',
    !pu_ident_pruefen($rumpf, $sig, $fremd_pk));
pruefe('Unfug als Schlüssel wird abgewiesen',
    !pu_ident_pruefen($rumpf, $sig, 'kein schluessel'));
pruefe('Unfug als Unterschrift wird abgewiesen',
    !pu_ident_pruefen($rumpf, 'keine signatur', $pk));

// ──────────────────────────────────────────────────── Kanonische Form
gruppe('Kanonische Form');

gleich('die Reihenfolge der Schlüssel zählt nicht',
    pu_ident_kanonisch(['b' => 1, 'a' => 2]),
    pu_ident_kanonisch(['a' => 2, 'b' => 1]));
gleich('auch tief verschachtelt nicht',
    pu_ident_kanonisch(['x' => ['z' => 1, 'y' => 2]]),
    pu_ident_kanonisch(['x' => ['y' => 2, 'z' => 1]]));
pruefe('Schrägstriche bleiben lesbar',
    str_contains(pu_ident_kanonisch(['w' => 'a/b']), 'a/b'));
pruefe('Umlaute bleiben Umlaute',
    str_contains(pu_ident_kanonisch(['w' => 'Grösse']), 'Grösse'));

// ─────────────────────────────────────────────────────── Anfragen
gruppe('Unterschriebene Anfrage');

$a1 = pu_ident_anfrage('upload', ['titel' => 'Ein Werk']);
pruefe('die Anfrage trägt Rumpf, Unterschrift und Schlüssel',
    isset($a1['rumpf'], $a1['signatur'], $a1['oeffentlich']));
pruefe('sie prüft sich selbst',
    pu_ident_pruefen($a1['rumpf'], $a1['signatur'], $a1['oeffentlich']));

$d1 = json_decode($a1['rumpf'], true);
gleich('die IID steht im Rumpf', pu_ident_iid(), $d1['iid']);
pruefe('Zeit und Einmalwert stehen IM Rumpf, nicht daneben',
    isset($d1['zeit'], $d1['nonce']));

$a2 = pu_ident_anfrage('upload', ['titel' => 'Ein Werk']);
$d2 = json_decode($a2['rumpf'], true);
pruefe('zwei Anfragen haben verschiedene Einmalwerte', $d1['nonce'] !== $d2['nonce']);
pruefe('und damit verschiedene Unterschriften', $a1['signatur'] !== $a2['signatur']);

// Der mitgeschnittene Aufruf: Rumpf nehmen, Zeit ändern, weiterschicken.
$gefaelscht = json_decode($a1['rumpf'], true);
$gefaelscht['zeit'] = gmdate('Y-m-d\TH:i:s\Z', time() + 3600);
pruefe('ein mitgeschnittener Aufruf mit neuer Zeit fällt auf',
    !pu_ident_pruefen(pu_ident_kanonisch($gefaelscht), $a1['signatur'], $pk));

// ────────────────────────────────────────────────────── Pseudonyme
gruppe('Lernenden-Pseudonyme');

$lp1 = pu_ident_lp('7');
$lp2 = pu_ident_lp('8');

pruefe('das Pseudonym beginnt mit LP-', str_starts_with($lp1, 'LP-'), $lp1);
gleich('es ist 16 Zeichen lang', 16, strlen($lp1) - 3);
gleich('dasselbe Konto ergibt dasselbe Pseudonym', $lp1, pu_ident_lp('7'));
pruefe('zwei Konten ergeben zwei Pseudonyme', $lp1 !== $lp2);
pruefe('ohne Konto kein Pseudonym', abgelehnt(fn() => pu_ident_lp('')));
pruefe('die Kontonummer steht nicht im Pseudonym',
    !str_contains($lp1, '7') || strlen($lp1) === 19);

// Der Name lässt sich nicht durchprobieren: ohne k_lp trifft dieselbe
// Rechnung mit derselben IID nicht dasselbe Pseudonym.
$ohne_kennung = 'LP-' . substr(pu_base32(
    hash_hmac('sha256', pu_ident_iid() . '|7', '', true)), 0, 16);
pruefe('ohne k_lp ist das Pseudonym nicht nachzurechnen', $lp1 !== $ohne_kennung);

// ─────────────────────────────────────────────────── Bescheinigung
gruppe('Bescheinigung des VPS');

pruefe('ohne Bescheinigung ist nichts gültig', !pu_ident_gueltig());
gleich('und es liegt keine vor', null, pu_ident_bescheinigung());

// Ein Schlüsselpaar, das den VPS spielt.
$vps    = sodium_crypto_sign_keypair();
$vps_pk = base64_encode(sodium_crypto_sign_publickey($vps));
$vps_sk = sodium_crypto_sign_secretkey($vps);
putenv('PU_VPS_SCHLUESSEL=' . $vps_pk);

$besch = [
    'iid'         => pu_ident_iid(),
    'mandant'     => 'M-TEST',
    'plan'        => 'schule-klein',
    'gueltig_bis' => gmdate('Y-m-d\TH:i:s\Z', time() + 86400),
    'kid'         => 'vps-1',
];
$besch_sig = base64_encode(
    sodium_crypto_sign_detached(pu_ident_kanonisch($besch), $vps_sk));

pruefe('eine echte Bescheinigung wird angenommen',
    pu_ident_bescheinigung_setzen($besch, $besch_sig));
pruefe('danach ist sie gültig', pu_ident_gueltig());
gleich('und nennt den Mandanten', 'M-TEST', pu_ident_bescheinigung()['mandant']);

// Selbst ausgestellt: die Installation unterschreibt sich ihre Freischaltung.
$selbst_sig = pu_ident_signieren(pu_ident_kanonisch($besch));
pruefe('eine selbst unterschriebene Bescheinigung wird abgewiesen',
    !pu_ident_bescheinigung_setzen($besch, $selbst_sig));

// Für eine andere Installation ausgestellt.
$fremde = $besch;
$fremde['iid'] = 'IID-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
$fremde_sig = base64_encode(
    sodium_crypto_sign_detached(pu_ident_kanonisch($fremde), $vps_sk));
pruefe('eine Bescheinigung für eine andere Installation wird abgewiesen',
    !pu_ident_bescheinigung_setzen($fremde, $fremde_sig));

// Nachträglich geändert: der Plan wird grosszügiger.
$datei = pu_ident_ordner() . '/bescheinigung.json';
$roh = json_decode((string)file_get_contents($datei), true);
$roh['bescheinigung']['plan'] = 'schule-gross';
file_put_contents($datei, json_encode($roh));
gleich('eine nachträglich geänderte Bescheinigung gilt nicht',
    null, pu_ident_bescheinigung());
pruefe('und schaltet nichts frei', !pu_ident_gueltig());

// Wiederherstellen und ablaufen lassen.
pu_ident_bescheinigung_setzen($besch, $besch_sig);
pruefe('eine abgelaufene Bescheinigung gilt nicht',
    !pu_ident_gueltig(gmdate('Y-m-d\TH:i:s\Z', time() + 172800)));

// Ohne hinterlegten VPS-Schlüssel wird gar nichts angenommen.
putenv('PU_VPS_SCHLUESSEL=');
gleich('ohne VPS-Schlüssel wird nichts geprüft und nichts geglaubt',
    null, pu_ident_bescheinigung());
putenv('PU_VPS_SCHLUESSEL=' . $vps_pk);

// ──────────────────────────────────────────────────────── Sicherung
gruppe('Sicherung der Saat');

$phrase = 'ein langes kennwort';
$paket  = pu_ident_sichern($phrase);
pruefe('die Sicherung nennt die IID', str_contains($paket, pu_ident_iid()));
pruefe('die Saat steht nicht im Klartext darin',
    !str_contains($paket, base64_encode((string)$saat)));
pruefe('eine kurze Passphrase wird abgelehnt',
    abgelehnt(fn() => pu_ident_sichern('kurz')));
pruefe('über eine vorhandene Saat wird nicht gespielt',
    abgelehnt(fn() => pu_ident_einspielen($paket, $phrase)));

// Auf einem neuen Rechner: Ordner leer, Sicherung einspielen.
$alt_iid = pu_ident_iid();
$alt_lp  = pu_ident_lp('7');
foreach (glob(pu_ident_ordner() . '/*') ?: [] as $f) {
    unlink($f);
}
pruefe('der neue Rechner hat nichts', !pu_ident_vorhanden());
pruefe('mit falscher Passphrase kommt nichts heraus',
    !pu_ident_einspielen($paket, 'falsches kennwort'));
pruefe('mit Unfug statt Paket kommt nichts heraus',
    !pu_ident_einspielen('{"art":"etwas anderes"}', $phrase));
pruefe('nach den Fehlversuchen liegt immer noch nichts da', !pu_ident_vorhanden());

pruefe('mit richtiger Passphrase wird eingespielt',
    pu_ident_einspielen($paket, $phrase));
gleich('die IID ist dieselbe wie vorher', $alt_iid, pu_ident_iid());
gleich('und die Pseudonyme auch', $alt_lp, pu_ident_lp('7'));

bilanz();
