<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Talente gutschreiben, von Hand.
 *
 * **Wofür das da ist.** Auf dieser Academy bezahlt niemand etwas: Es ist kein
 * Zahlungsdienst eingebunden, und „Vormerken" schreibt nur eine Buchung, die
 * auf einen Haken wartet. Wer das Ding betreibt, braucht trotzdem Guthaben —
 * für sich, um zu arbeiten, und für die Konten unter ihm, um es zu verteilen.
 * Genau dafür ist dieses Skript da und für nichts sonst.
 *
 * **Warum es keinen Knopf in der Oberfläche gibt.** Wer sich selbst Guthaben
 * schreiben kann, hat keine Grenze mehr — und ein solcher Knopf wäre ab dem
 * Tag, an dem ein Konto übernommen wird, das interessanteste Ziel der ganzen
 * Academy. Hier braucht es Zugriff auf den Ordner und die Kommandozeile, also
 * ohnehin schon die Datenbank in der Hand.
 *
 * Gebucht wird als `gutschrift` und nicht als `einzahlung`: Eine Einzahlung
 * behauptet, jemand habe ein Paket gekauft. Das wäre hier gelogen, und ein
 * Journal, dessen Einträge ihre Herkunft verschleiern, ist keines.
 *
 * Aufruf:
 *     php -d extension=pdo_sqlite setup/gutschrift.php <kennung> <talente> "<grund>"
 *
 * Beispiel:
 *     php -d extension=pdo_sqlite setup/gutschrift.php solon 50000000 "Betriebsguthaben"
 *
 * Ohne Argumente zeigt es nur den Stand aller Konten und ändert nichts.
 */

if (PHP_SAPI !== 'cli') {
    // Über HTTP ist der Ordner ohnehin gesperrt (router.php). Diese Zeile ist
    // der zweite Riegel für den Fall, dass jemand den Router vergisst.
    http_response_code(403);
    exit("Nur über die Kommandozeile.\n");
}

require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../srv/rechte.php';
require_once __DIR__ . '/../srv/profil.php';
require_once __DIR__ . '/../srv/abo.php';

/** Ein Konto über seine Kennung. */
function gut_konto(string $kennung): ?array
{
    $st = pu_db()->prepare('SELECT id, kennung, anzeigename, rolle FROM lernende WHERE kennung = ?');
    $st->execute([$kennung]);
    $r = $st->fetch();
    return $r === false ? null : $r;
}

function gut_zahl(int $n): string { return number_format($n, 0, ',', '.'); }

/** Der Stand aller Konten — die Übersicht, mit der man anfängt. */
function gut_uebersicht(): void
{
    echo str_pad('KONTO', 16), str_pad('EBENE', 12),
         str_pad('ÜBRIG', 16, ' ', STR_PAD_LEFT),
         str_pad('VERBRAUCHT', 16, ' ', STR_PAD_LEFT), "\n";
    echo str_repeat('─', 60), "\n";

    foreach (pu_db()->query('SELECT id, kennung, rolle FROM lernende ORDER BY id') as $r) {
        $s = pu_token_stand((int)$r['id']);
        echo str_pad((string)$r['kennung'], 16),
             str_pad((string)$r['rolle'], 12),
             str_pad(gut_zahl((int)$s['rest']), 16, ' ', STR_PAD_LEFT),
             str_pad(gut_zahl((int)$s['verbraucht']), 16, ' ', STR_PAD_LEFT), "\n";
    }
}

// ------------------------------------------------------------------ Lauf
$kennung = $argv[1] ?? '';
$betrag  = (int)($argv[2] ?? 0);
$grund   = (string)($argv[3] ?? '');

if ($kennung === '') {
    echo "Stand aller Konten. Es wurde nichts geändert.\n\n";
    gut_uebersicht();
    echo "\nGutschreiben:\n";
    echo "  php -d extension=pdo_sqlite setup/gutschrift.php <kennung> <talente> \"<grund>\"\n";
    exit(0);
}

$konto = gut_konto($kennung);
if ($konto === null) {
    fwrite(STDERR, "Dieses Konto gibt es nicht: $kennung\n");
    exit(1);
}
if ($betrag <= 0) {
    fwrite(STDERR, "Der Betrag muss grösser als null sein.\n");
    exit(1);
}
if (trim($grund) === '') {
    fwrite(STDERR, "Eine Gutschrift braucht einen Grund — er steht später im Journal.\n");
    exit(1);
}

$vorher = pu_token_stand((int)$konto['id']);
$erg    = pu_token_gutschreiben((int)$konto['id'], $betrag, $grund, (int)$konto['id']);

printf("Gutgeschrieben: %s Talente an %s (%s).\n",
       gut_zahl($betrag), $konto['kennung'], $konto['rolle']);
printf("Grund: %s\n", $grund);
printf("Stand: %s → %s\n",
       gut_zahl((int)$vorher['rest']), gut_zahl((int)$erg['stand']['rest']));
echo "\n";
gut_uebersicht();
