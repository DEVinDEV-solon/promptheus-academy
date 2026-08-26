<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Spracherkennung, örtlich.
 *
 * Der Test läuft auch dort, wo whisper NICHT installiert ist — und das ist
 * Absicht: die Academy soll auf einem Rechner ohne Sprachmodell nicht kaputt
 * sein, sondern ruhig sagen, was fehlt. Genau das wird hier geprüft.
 *
 * Der echte Erkennungslauf kommt nur dazu, wenn whisper, ffmpeg und ein
 * Modell da sind. Fehlt eins, sagt der Test es und geht weiter. Ein Test,
 * der wegen einer fehlenden 1,4-GB-Datei rot wird, wird abgeschaltet.
 *
 * Aufruf:
 *     php -d extension=pdo_sqlite -d extension=sqlite3 tests/sprache_test.php
 */

require_once __DIR__ . '/hilfe.php';
test_db_vorbereiten();

require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../srv/rechte.php';
require_once __DIR__ . '/../srv/abo.php';
require_once __DIR__ . '/../srv/sprache.php';

// ================================================================ Werkzeuge
gruppe('Was da ist und was fehlt');

$stand = pu_sprache_bereit();

pruefe('Der Stand nennt alle drei Werkzeuge',
       array_key_exists('ffmpeg', $stand) && array_key_exists('whisper', $stand)
       && array_key_exists('modell', $stand));

pruefe('Er sagt IMMER etwas', trim($stand['hinweis']) !== '');

if ($stand['ok']) {
    gleich('nichts fehlt', [], $stand['fehlt']);
    pruefe('der Hinweis sagt, dass es örtlich läuft',
           str_contains($stand['hinweis'], 'diesem Rechner'));
    pruefe('ffmpeg ist eine Datei',  is_file($stand['ffmpeg']));
    pruefe('whisper ist eine Datei', is_file($stand['whisper']));
    pruefe('ein Modell ist benannt', $stand['modell'] !== '');
} else {
    // Der wichtigere Fall: was fehlt, muss BENANNT sein — nicht nur, dass
    // etwas fehlt. Ein „geht nicht" ohne Grund kostet eine halbe Stunde.
    pruefe('es steht da, WAS fehlt', $stand['fehlt'] !== []);
    pruefe('…und wohin es gehört',
           str_contains($stand['hinweis'], 'werkzeuge/')
           || str_contains($stand['hinweis'], '.env'));
    echo "   (whisper ist hier nicht eingerichtet — der Erkennungslauf entfällt.)\n";
}

// ================================================================ Grenzen
gruppe('Grenzen');

pruefe('höchstens 5 MB',      PU_TON_MAX_MB === 5);
pruefe('höchstens 3 Minuten', PU_TON_MAX_SEK === 180);
pruefe('webm wird angenommen',  in_array('webm', PU_TON_ARTEN, true));
pruefe('exe wird nicht angenommen', !in_array('exe', PU_TON_ARTEN, true));

$weg = pu_sprache_erkennen(PU_DATA . '/gibt-es-nicht.webm');
gleich('eine fehlende Datei wird abgewiesen', false, $weg['ok']);
pruefe('…mit einem Grund', trim($weg['fehler']) !== '');

// Zu gross: eine Datei anlegen, die über der Grenze liegt.
$tmp = PU_DATA . '/tmp';
if (!is_dir($tmp)) @mkdir($tmp, 0777, true);
$dick = $tmp . '/zu_dick.wav';
file_put_contents($dick, str_repeat('x', (PU_TON_MAX_MB + 1) * 1048576));

$erg = pu_sprache_erkennen($dick);
@unlink($dick);

if ($stand['ok']) {
    gleich('eine zu grosse Aufnahme wird abgewiesen', false, $erg['ok']);
    pruefe('…und die Meldung nennt die Grenze',
           str_contains($erg['fehler'], (string)PU_TON_MAX_MB));
} else {
    pruefe('ohne whisper wird ohnehin abgewiesen', $erg['ok'] === false);
}

// ================================================================ Umrechnung
gruppe('Was eine Sprachnachricht kostet');

gleich('1.000 Token je angefangene Minute', 1000, PU_TOKEN_JE_MINUTE);

$werkzeug = null;
foreach (PU_WERKZEUGE as $w) if ($w['schluessel'] === 'sprache') $werkzeug = $w;

pruefe('die Preistafel kennt die Sprachnachricht', $werkzeug !== null);
gleich('…mit derselben Pauschale', PU_TOKEN_JE_MINUTE, $werkzeug['pauschale'] ?? 0);
gleich('…und sie ist in Betrieb',  true, $werkzeug['bereit'] ?? false);

// Die Design-Werkstatt ist es ausdrücklich NICHT. Eine Pauschale, die man
// ausgeben könnte, obwohl es das Werkzeug nicht gibt, wäre ein Versprechen.
$werkstatt = array_filter(PU_WERKZEUGE, fn($w) => !empty($w['werkstatt']));
gleich('fünf Werkstatt-Werkzeuge', 5, count($werkstatt));
foreach ($werkstatt as $w) {
    gleich('„' . $w['name'] . '" ist noch nicht in Betrieb', false, $w['bereit']);
    pruefe('…hat aber schon einen Preis', $w['pauschale'] > 0);
}

// ================================================================ Echter Lauf
gruppe('Ein echter Erkennungslauf');

if (!$stand['ok']) {
    echo "   (übersprungen — es fehlt: " . implode(', ', $stand['fehlt']) . ")\n";
    bilanz();
}

// Eine Tondatei aus dem Windows-Sprachausgabe-Dienst. Sie ist der einzige
// Weg, hier ohne Mikrofon an echte gesprochene Sprache zu kommen.
$satz = 'Die Hauptstadt von Frankreich ist Paris.';
$wav  = str_replace('\\', '/', PU_DATA) . '/tmp/probe_' . bin2hex(random_bytes(4)) . '.wav';

// Über eine Skriptdatei, nicht über -Command: unter Windows setzt
// escapeshellarg() doppelte Anführungszeichen, und der PowerShell-Befehl
// enthält selbst welche — beides hebt sich auf, und es kommt keine Datei
// heraus. Gemessen, nicht vermutet.
//
// Das BOM am Anfang ist Pflicht: ohne es liest PowerShell die Datei als
// CP1252, und Umlaute werden zu Buchstabensalat.
$ps1 = str_replace(DIRECTORY_SEPARATOR, '/', PU_DATA)
     . '/tmp/tts_' . bin2hex(random_bytes(4)) . '.ps1';

$zeilen = [
    'Add-Type -AssemblyName System.Speech',
    '$s = New-Object System.Speech.Synthesis.SpeechSynthesizer',
    '$s.SetOutputToWaveFile("' . $wav . '")',
    '$s.Speak("' . $satz . '")',
    '$s.Dispose()',
];
file_put_contents($ps1, "\xEF\xBB\xBF" . implode("\r\n", $zeilen) . "\r\n");

@exec('powershell -NoProfile -ExecutionPolicy Bypass -File '
      . escapeshellarg($ps1) . ' 2>&1', $aus, $code);
@unlink($ps1);

if (!is_file($wav) || filesize($wav) < 5000) {
    @unlink($wav);
    echo "   (übersprungen — es liess sich keine Probeaufnahme erzeugen.)\n";
    bilanz();
}

$erg = pu_sprache_erkennen($wav);
@unlink($wav);

pruefe('die Erkennung läuft durch', $erg['ok'], $erg['fehler']);

if ($erg['ok']) {
    // Nicht auf den Wortlaut prüfen: eine Erkennung ist nie zeichengenau,
    // und ein Test, der an einem Komma scheitert, prüft die falsche Sache.
    // Geprüft wird, ob der Inhalt angekommen ist.
    $klein = mb_strtolower($erg['text']);
    pruefe('„Paris" wurde verstanden', str_contains($klein, 'paris'), $erg['text']);
    pruefe('„Frankreich" wurde verstanden', str_contains($klein, 'frankreich'), $erg['text']);

    pruefe('die Dauer wurde gemessen', $erg['sekunden'] >= 1, $erg['sekunden'] . ' s');
    gleich('eine angefangene Minute kostet die Pauschale',
           PU_TOKEN_JE_MINUTE, $erg['tokens']);
    pruefe('das Modell steht dabei', $erg['modell'] !== '');
}

// Aufräumen ist Teil der Sache: der Rohton darf nicht liegenbleiben.
$reste = glob(PU_DATA . '/tmp/sprache_*.wav') ?: [];
gleich('keine Zwischendateien bleiben liegen', [], $reste);

bilanz();
