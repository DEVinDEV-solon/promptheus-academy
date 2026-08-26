<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Die Ernte.
 *
 * Holt EINMAL Fakten aus den freigegebenen Ordnern der anderen OKF-Vaults und
 * legt sie als eigene Notizen in `brain/90_Quellen/<kennung>/` ab — mit
 * Herkunft und Prüfsumme. Im Betrieb fasst PROMPTHEUS keinen fremden Vault an.
 *
 * Aufruf:
 *     php setup/ernte.php              zeigt, was passieren würde
 *     php setup/ernte.php --schreiben  führt es aus
 *     php setup/ernte.php --pruefen    meldet nur Änderungen an der Quelle
 *
 * Drei Regeln, die die Bauweise bestimmen:
 *
 *  1. **Die Sperrliste gewinnt gegen die Freigabeliste.** Sie steht hier im
 *     Code, nicht in `quellen.json` — sonst liesse sie sich durch einen
 *     Eintrag in der Freigabeliste abschalten.
 *
 *  2. **Handverlesenes wird nie überschrieben.** Wer eine geerntete Notiz
 *     nachbearbeitet und `handverlesen: true` setzt, bekommt beim nächsten
 *     Lauf eine Meldung — keine stille Ersetzung seiner Arbeit.
 *
 *  3. **Änderungen wandern ins Archiv, sie verschwinden nicht.** Aendert sich
 *     die Quelle, geht die alte Fassung nach `brain/_archiv/`.
 */

require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../srv/kurse.php';

/**
 * Was NIE geerntet wird, egal was die Freigabeliste sagt.
 *
 * `data`, `.obsidian`, `.git` — dort liegen Mandatsakten, Schlüssel und
 * Verlauf. `80_PRIVAT` ist der Privatordner im GLANZZ-Vault. `99_Rohdaten`
 * trägt ungeprueftes Material; in einer Lehr-App wäre das eine Behauptung
 * ohne Beleg. `_archiv` ist Überholtes.
 */
const PU_SPERRE_SEGMENTE = [
    'data', '.obsidian', '.git', '.versionen', '.claude', '.a0proj', '.specify',
    '80_PRIVAT', '99_Rohdaten', '_archiv', '_scripts', 'node_modules', '__pycache__',
];

/** Dateien, die nie mitgehen — auch nicht in einem freigegebenen Ordner. */
function pu_ernte_datei_gesperrt(string $name): bool
{
    $klein = strtolower($name);
    if (str_starts_with($klein, '.env')) return true;
    if (str_ends_with($klein, '.db') || str_ends_with($klein, '.sqlite')) return true;
    if (str_ends_with($klein, '.key') || str_ends_with($klein, '.pem')) return true;
    // Nur Markdown wird Lehrstoff. Alles andere wäre ein Anhang ohne Prüfung.
    if (!str_ends_with($klein, '.md')) return true;
    return false;
}

/** Traegt der Pfad ein gesperrtes Segment? Vergleich Segment für Segment. */
function pu_ernte_pfad_gesperrt(string $pfad): bool
{
    foreach (explode('/', str_replace('\\', '/', $pfad)) as $teil) {
        if ($teil === '') continue;
        foreach (PU_SPERRE_SEGMENTE as $sperre) {
            if (strcasecmp($teil, $sperre) === 0) return true;
        }
    }
    return false;
}

// ================================================================ Lauf
$argumente  = $argv ?? [];
$schreiben  = in_array('--schreiben', $argumente, true);
$nurPruefen = in_array('--pruefen', $argumente, true);

$konfig = json_decode((string)file_get_contents(__DIR__ . '/quellen.json'), true);
if (!is_array($konfig)) {
    fwrite(STDERR, "setup/quellen.json ist kein gueltiges JSON.\n");
    exit(1);
}

$wurzel = rtrim(str_replace('\\', '/', (string)$konfig['wurzel']), '/');
$ziel   = PU_BRAIN . '/90_Quellen';

$zahl = ['gelesen' => 0, 'neu' => 0, 'geändert' => 0, 'gleich' => 0,
         'handverlesen' => 0, 'gesperrt' => 0, 'fehlt' => 0];
$meldungen = [];

echo "PROMPTHEUS — Ernte" . ($schreiben ? '' : ' (Probelauf, nichts wird geschrieben)') . "\n";
echo str_repeat('=', 64) . "\n\n";

foreach ($konfig['vaults'] as $v) {
    $kennung = (string)$v['kennung'];
    $vault   = (string)$v['vault'];
    echo "── $kennung  ($vault)\n";

    foreach ((array)$v['ordner'] as $eintrag) {
        $quelle = $wurzel . '/' . $vault . '/' . $eintrag;

        if (pu_ernte_pfad_gesperrt($vault . '/' . $eintrag)) {
            echo "   ⛔ $eintrag — Sperrliste. Uebersprungen.\n";
            $zahl['gesperrt']++;
            continue;
        }

        if (is_file($quelle)) {
            $dateien = [$quelle];
        } elseif (is_dir($quelle)) {
            $dateien = pu_ernte_sammeln($quelle);
        } else {
            echo "   ？ $eintrag — nicht gefunden.\n";
            $zahl['fehlt']++;
            continue;
        }

        foreach ($dateien as $datei) {
            $rel = ltrim(substr(str_replace('\\', '/', $datei),
                strlen($wurzel . '/' . $vault) + 1), '/');

            if (pu_ernte_pfad_gesperrt($rel) || pu_ernte_datei_gesperrt(basename($datei))) {
                $zahl['gesperrt']++;
                continue;
            }

            $zahl['gelesen']++;
            $ergebnis = pu_ernte_eine($datei, $rel, $kennung, $vault, $ziel, $schreiben && !$nurPruefen);
            $zahl[$ergebnis['art']]++;
            if ($ergebnis['meldung'] !== '') {
                echo '   ' . $ergebnis['zeichen'] . ' ' . $ergebnis['meldung'] . "\n";
                $meldungen[] = $ergebnis['meldung'];
            }
        }
    }
    echo "\n";
}

echo str_repeat('=', 64) . "\n";
printf("gelesen %d · neu %d · geändert %d · unverändert %d · handverlesen %d · gesperrt %d · fehlt %d\n",
    $zahl['gelesen'], $zahl['neu'], $zahl['geändert'], $zahl['gleich'],
    $zahl['handverlesen'], $zahl['gesperrt'], $zahl['fehlt']);

if (!$schreiben) {
    echo "\nProbelauf. Zum Ausfuehren:  php setup/ernte.php --schreiben\n";
}
exit(0);

// ================================================================ Bausteine

/** Alle .md-Dateien unterhalb eines Ordners, ohne gesperrte Zweige. */
function pu_ernte_sammeln(string $ordner): array
{
    $aus = [];
    $it = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($ordner, FilesystemIterator::SKIP_DOTS)
    );
    foreach ($it as $datei) {
        if (!$datei->isFile()) continue;
        $pfad = str_replace('\\', '/', $datei->getPathname());
        if (pu_ernte_pfad_gesperrt(substr($pfad, strlen(str_replace('\\', '/', $ordner))))) continue;
        if (pu_ernte_datei_gesperrt($datei->getFilename())) continue;
        $aus[] = $pfad;
    }
    sort($aus);
    return $aus;
}

/**
 * Erntet eine Datei.
 *
 * @return array{art: string, zeichen: string, meldung: string}
 */
function pu_ernte_eine(string $datei, string $rel, string $kennung, string $vault,
                       string $ziel, bool $schreiben): array
{
    $roh = (string)file_get_contents($datei);
    $fm  = pu_frontmatter($roh);
    $sha = hash('sha256', $roh);

    // Der Name kommt aus dem GANZEN Quellpfad, nicht aus dem Dateinamen.
    //
    // Gemessen beim ersten Probelauf: von 177 Dateien hiessen 19 `index.md`.
    // Mit `basename` wären daraus neunzehn Notizen mit demselben Ziel
    // geworden — die letzte hätte alle vorigen überschrieben, und in der
    // Zusammenfassung hätte trotzdem "177 neu" gestanden. Ein Fehler, der
    // sich selbst zudeckt.
    // Fuehrende Nummernordner (`00_Fundament`, `05_Methodologie`) fallen weg:
    // sie sind die Ordnung des QUELLVAULTS und sagen hier nichts. Was
    // unterscheidet, ist der Zweig darunter.
    $kurz = preg_replace('#^\d+[_-][^/]*/#', '', preg_replace('/\.md$/i', '', $rel) ?? $rel) ?? $rel;
    $name = pu_slug($kurz);
    if ($name === '') $name = pu_slug(preg_replace('/\.md$/i', '', $rel) ?? $rel);
    if ($name === '') $name = 'notiz';
    $zieldat = $ziel . '/' . $kennung . '/' . $name . '.md';

    // Zweite Wache: zwei verschiedene Quellen dürfen nie dasselbe Ziel
    // treffen. Der Slug wirft Sonderzeichen weg, und zwei Pfade könnten
    // sich genau darin unterscheiden.
    static $vergeben = [];
    if (isset($vergeben[$zieldat]) && $vergeben[$zieldat] !== $rel) {
        return ['art' => 'gesperrt', 'zeichen' => '⚠',
                'meldung' => "$kennung/$name — Namenskollision mit {$vergeben[$zieldat]}. Uebersprungen."];
    }
    $vergeben[$zieldat] = $rel;

    // Handverlesenes bleibt unangetastet.
    if (is_file($zieldat)) {
        $alt = pu_frontmatter((string)file_get_contents($zieldat));
        if (!empty($alt['meta']['handverlesen'])) {
            $gleich = (string)($alt['meta']['herkunft']['pruefsumme'] ?? '') === 'sha256:' . $sha;
            return ['art' => 'handverlesen', 'zeichen' => '✋',
                    'meldung' => $gleich
                        ? ''
                        : "$kennung/$name — handverlesen, Quelle hat sich geändert. Bitte pruefen."];
        }
        if ((string)($alt['meta']['herkunft']['pruefsumme'] ?? '') === 'sha256:' . $sha) {
            return ['art' => 'gleich', 'zeichen' => '·', 'meldung' => ''];
        }
        // Geaendert: alte Fassung ins Archiv, dann ersetzen.
        if ($schreiben) {
            $archiv = PU_BRAIN . '/_archiv/90_Quellen/' . $kennung;
            if (!is_dir($archiv)) @mkdir($archiv, 0775, true);
            @copy($zieldat, $archiv . '/' . $name . '.' . date('Ymd-His') . '.md');
            pu_write_file($zieldat, pu_ernte_notiz($fm, $rel, $vault, $sha));
        }
        return ['art' => 'geändert', 'zeichen' => '↻', "meldung" => "$kennung/$name — Quelle geändert, erneuert."];
    }

    if ($schreiben) {
        pu_write_file($zieldat, pu_ernte_notiz($fm, $rel, $vault, $sha));
    }
    return ['art' => 'neu', 'zeichen' => '+', 'meldung' => "$kennung/$name"];
}

/**
 * Baut die Quellnotiz.
 *
 * Der Rumpf wird übernommen, das Frontmatter neu gesetzt: die Quellvaults
 * benutzen `type: fundament`, `ampel`, `konfidenz` und andere Felder in
 * eigenen Auspraegungen. Ein durchgereichtes Frontmatter wäre in PROMPTHEUS
 * teils ungueltig — und `kurse_test.php` würde es zu Recht anmeckern.
 *
 * Wikilinks werden ENTSCHAERFT. Sie zeigen auf Notizen im Quellvault, die es
 * hier nicht gibt; als Link wären sie in der Bibliothek durchweg tot. Als
 * Kursivtext bleibt lesbar, worauf sich der Text bezieht.
 */
function pu_ernte_notiz(array $fm, string $rel, string $vault, string $sha): string
{
    $titel = (string)($fm['meta']['title'] ?? basename($rel, '.md'));
    $besch = (string)($fm['meta']['description'] ?? '');
    $tags  = array_values(array_filter(array_map(
        fn($t) => pu_slug((string)$t),
        (array)($fm['meta']['tags'] ?? [])
    )));
    array_unshift($tags, 'source');
    $tags = array_values(array_unique($tags));

    $rumpf = preg_replace_callback('/\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/', function (array $m): string {
        $text = trim($m[2] ?? '') !== '' ? $m[2] : basename(trim($m[1]));
        return '*' . $text . '*';
    }, $fm['rumpf']) ?? $fm['rumpf'];

    $kopf = "---\n"
        . "type: source\n"
        . 'title: ' . json_encode($titel, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n"
        . 'description: ' . json_encode($besch, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n"
        . "tags:\n" . implode('', array_map(fn($t) => "  - $t\n", $tags))
        . 'timestamp: ' . date('c') . "\n"
        . "kontext: \"[[PROMPTHEUS WISSEN]]\"\n"
        . "handverlesen: false\n"
        . "herkunft:\n"
        . '  vault: ' . json_encode($vault, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n"
        . '  pfad: ' . json_encode($rel, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n"
        . '  geerntet: ' . date('c') . "\n"
        . '  pruefsumme: "sha256:' . $sha . "\"\n"
        . "---\n\n";

    $fuss = "\n\n---\n\n"
        . "> **Herkunft.** Diese Notiz wurde aus dem Wissensspeicher `$vault`\n"
        . "> geerntet (`$rel`). Sie wird von PROMPTHEUS nicht verändert;\n"
        . "> Änderungen gehören in den Quellvault. Verweise auf Notizen, die es\n"
        . "> nur dort gibt, stehen hier kursiv statt als Link.\n";

    return $kopf . rtrim($rumpf) . $fuss;
}
