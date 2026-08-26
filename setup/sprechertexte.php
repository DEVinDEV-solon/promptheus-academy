<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Sprechertexte schreiben lassen.
 *
 * Für jeden Kurs, jede Lektion und jede Prüfung vier Fassungen: Schüler,
 * Eltern, Lehrkraft, Schulleitung. Bei 43 Stücken sind das 172 Texte — die
 * schreibt niemand von Hand, und niemand hält sie von Hand aktuell, wenn sich
 * eine Lektion ändert.
 *
 * **Wiederholbar.** Was schon liegt, wird übersprungen; mit `--neu` wird es
 * überschrieben. Ändert sich eine Lektion, löscht man die vier Dateien dazu
 * und lässt das Skript nochmal laufen.
 *
 * **Es kostet Geld.** Jeder Text ist ein Modellaufruf. Das Skript sagt vorher,
 * wie viele es werden, und bucht den Verbrauch auf das angegebene Konto —
 * sichtbar im Cockpit, wie jeder andere Verbrauch auch.
 *
 * Aufruf:
 *     php -d extension=pdo_sqlite -d extension=sqlite3 setup/sprechertexte.php --was
 *     …                                                --kurs=10_Stufen/01_Entdecker
 *     …                                                --alle
 *     …                                                --alle --neu
 *
 *     --was              nur zeigen, was fehlt (kostet nichts)
 *     --kurs=<pfad>      nur dieser Kurs
 *     --gruppe=<name>    nur diese Zielgruppe (schueler|eltern|lehrer|schule)
 *     --alle             wirklich alle fehlenden schreiben
 *     --neu              vorhandene überschreiben
 *     --konto=<kennung>  auf wen der Verbrauch gebucht wird (Vorgabe: erster Admin)
 */

require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../srv/db.php';
require_once __DIR__ . '/../srv/rechte.php';
require_once __DIR__ . '/../srv/kurse.php';
require_once __DIR__ . '/../srv/profil.php';
require_once __DIR__ . '/../srv/abo.php';
require_once __DIR__ . '/../srv/tutor.php';
require_once __DIR__ . '/../srv/tokenicer.php';
require_once __DIR__ . '/../srv/sprecher.php';

// ---------------------------------------------------------------- Aufrufzeile
$opt = ['was' => false, 'alle' => false, 'neu' => false,
        'kurs' => '', 'gruppe' => '', 'konto' => '', 'nur' => 0];

foreach (array_slice($argv, 1) as $a) {
    if ($a === '--was')  { $opt['was']  = true; continue; }
    if ($a === '--alle') { $opt['alle'] = true; continue; }
    if ($a === '--neu')  { $opt['neu']  = true; continue; }
    if (str_starts_with($a, '--nur=')) { $opt['nur'] = (int)substr($a, 6); continue; }
    foreach (['kurs', 'gruppe', 'konto'] as $f) {
        if (str_starts_with($a, "--$f=")) $opt[$f] = substr($a, strlen($f) + 3);
    }
}

$gruppen = array_keys(PU_ZIELGRUPPEN);
if ($opt['gruppe'] !== '') {
    if (!isset(PU_ZIELGRUPPEN[$opt['gruppe']])) {
        exit("Unbekannte Zielgruppe: {$opt['gruppe']}\nMöglich: " . implode(' · ', $gruppen) . "\n");
    }
    $gruppen = [$opt['gruppe']];
}

$stuecke = pu_sprecher_stuecke($opt['kurs']);
if ($stuecke === []) exit("Zu „{$opt['kurs']}\" gibt es keinen Kurs.\n");

// ---------------------------------------------------------------- Was fehlt?
$offen = [];
foreach ($stuecke as $s) {
    foreach ($gruppen as $g) {
        $rel  = pu_sprecher_pfad($s['kurs'], $s['stueck'], $g);
        $voll = PU_BRAIN . '/' . $rel;
        if (is_file($voll) && !$opt['neu']) continue;
        $offen[] = ['stueck' => $s, 'gruppe' => $g, 'datei' => $voll, 'rel' => $rel];
    }
}

$da = count($stuecke) * count($gruppen) - count($offen);

// --nur=<n>: zum Vorführen und Nachschärfen. Erst ein paar ansehen, dann den
// Rest laufen lassen — 172 Aufrufe auf Verdacht sind eine teure Art,
// festzustellen, dass der Ton nicht stimmt.
if ($opt['nur'] > 0) $offen = array_slice($offen, 0, $opt['nur']);

echo "\n";
echo count($stuecke) . " Stücke × " . count($gruppen) . " Zielgruppen = "
   . (count($stuecke) * count($gruppen)) . " Sprechertexte\n";
echo "  vorhanden: $da\n";
echo "  zu schreiben: " . count($offen) . "\n\n";

if ($offen === []) exit("Nichts zu tun.\n");

if ($opt['was'] || !$opt['alle']) {
    // Ohne --alle wird NICHTS geschrieben. Ein Skript, das beim ersten Aufruf
    // 172 Modellaufrufe startet, ist eine Falle — und die Rechnung kommt
    // hinterher.
    $nachArt = [];
    foreach ($offen as $o) {
        $k = $o['stueck']['kurs'];
        $nachArt[$k] = ($nachArt[$k] ?? 0) + 1;
    }
    foreach ($nachArt as $kurs => $n) printf("  %-42s %3d\n", $kurs, $n);

    echo "\nGeschätzt: rund " . number_format(count($offen) * 2600, 0, ',', '.')
       . " Token und " . ceil(count($offen) * 9 / 60) . " Minuten.\n";
    echo "Zum Schreiben: dieselbe Zeile mit --alle\n";
    exit(0);
}

// ---------------------------------------------------------------- Konto
$pdo = pu_db();
if ($opt['konto'] !== '') {
    $st = $pdo->prepare('SELECT id FROM lernende WHERE kennung = ?');
    $st->execute([$opt['konto']]);
    $konto = (int)$st->fetchColumn();
    if ($konto === 0) exit("Dieses Konto gibt es nicht: {$opt['konto']}\n");
} else {
    $konto = (int)$pdo->query("SELECT id FROM lernende WHERE rolle = 'admin' ORDER BY id LIMIT 1")
                      ->fetchColumn();
}

if (!pu_tutor_bereit()) {
    exit("Es ist kein Tutor-Modell eingerichtet — ohne Modell keine Texte.\n"
       . "Einstellungen › Tutor-KI, oder PU_OPENROUTER_API_KEY in der .env.\n");
}

echo "Schreibe mit " . pu_tutor_modell() . ", Verbrauch geht auf Konto #$konto.\n";
echo str_repeat('─', 64) . "\n";

// ---------------------------------------------------------------- Schreiben
$start   = microtime(true);
$fertig  = 0;
$fehler  = 0;
$tokens  = 0;

foreach ($offen as $i => $o) {
    $s = $o['stueck'];
    $g = $o['gruppe'];

    printf("%3d/%d  %-11s %-34s %s … ",
           $i + 1, count($offen), $g, mb_substr($s['titel'], 0, 32), $s['art']);

    $auftrag = pu_sprecher_auftrag($s, $g);
    // Reichlich Platz: der Text selbst braucht kaum 400 Token, aber ein
    // denkendes Modell überlegt davor. Ist der Platz dann voll, kommt gar
    // nichts — siehe max_tokens in pu_or_lauf.
    $erg = pu_modell_lauf($auftrag['prompt'], $auftrag['system'], 150, 4000);

    // Ein Text aus dem Denkbereich ist kein Sprechertext, sondern ein
    // Selbstgespräch. Er darf nicht ins Archiv — dort würde er als fertig
    // gelten und irgendwann jemand vorlesen.
    if ($erg['ok'] && !empty($erg['aus_gedanken'])) {
        $erg['ok']     = false;
        $erg['fehler'] = 'Das Modell hat nur nachgedacht und nichts geantwortet.';
    }

    if (!$erg['ok'] || trim($erg['text']) === '') {
        echo "FEHLER: " . mb_substr($erg['fehler'], 0, 70) . "\n";
        $fehler++;
        // Nach drei Fehlschlägen hintereinander aufhören: meist ist der
        // Schlüssel leer oder das Modell weg, und 170 weitere Versuche
        // machen es nicht besser.
        if ($fehler >= 3 && $fertig === 0) {
            exit("\nDreimal hintereinander nichts bekommen — abgebrochen.\n");
        }
        continue;
    }

    // Was ein Sprechertext nicht verträgt: Markdown. Er wird vorgelesen.
    $text = trim($erg['text']);
    $text = preg_replace('/^#{1,6}\s+/m', '', $text) ?? $text;
    $text = str_replace(['**', '__', '`'], '', $text);
    $text = preg_replace('/^\s*[-*]\s+/m', '', $text) ?? $text;
    $text = trim(preg_replace('/\n{3,}/', "\n\n", $text) ?? $text);

    @mkdir(dirname($o['datei']), 0777, true);
    file_put_contents($o['datei'],
        pu_sprecher_notiz($s, $g, $text, (string)($erg['modell'] ?? pu_tutor_modell())));

    // Verbrauch buchen — gemessen, wenn das Modell es meldet, sonst geschätzt.
    [$t, $geschaetzt, $modell] = pu_verbrauch_messen($auftrag['prompt'], $auftrag['system'], $erg);
    if ($t > 0) {
        pu_token_verbrauchen($konto, 'Sprechertext · ' . $g, $t, $geschaetzt, $modell);
        $tokens += $t;
    }

    $woerter = count(preg_split('/\s+/u', $text, -1, PREG_SPLIT_NO_EMPTY) ?: []);
    printf("%d Wörter, %d Token%s\n", $woerter, $t, $geschaetzt ? ' (geschätzt)' : '');
    $fertig++;
}

$dauer = round(microtime(true) - $start);

echo str_repeat('─', 64) . "\n";
printf("%d geschrieben, %d Fehler, %s Token, %d:%02d Minuten.\n",
       $fertig, $fehler, number_format($tokens, 0, ',', '.'),
       intdiv((int)$dauer, 60), (int)$dauer % 60);
echo "Sie liegen in secondbrain/" . PU_SPRECHER . "/ — Stand: Entwurf.\n";
