<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — der Tausch der Programmdateien und der Rückweg.
 *
 * Läuft nur aus `srv/aktualisieren_cli.php`, das `PROMPTHEUS-START.bat` vor
 * dem Serverstart aufruft. Solange der Server läuft, sind seine Dateien in
 * Benutzung; deshalb wird hier und nicht in api.php getauscht.
 *
 * Reihenfolge beim Tausch:
 *   1. Bereitgelegtes noch einmal gegen sein Manifest prüfen.
 *   2. Sichern: Datenbank (VACUUM INTO) und jede Programmdatei, die berührt
 *      wird, als ZIP nach data/aktualisierung/sicherung/<Zeit>-<alt>-<neu>/.
 *   3. Neue Dateien an ihren Platz; `PROMPTHEUS-START.bat` nur als `.neu`
 *      daneben (die laufende bat liest sich zeilenweise selbst nach).
 *   4. Dateien löschen, die im alten Manifest standen und im neuen fehlen —
 *      und Ordner, die dadurch leer geworden sind.
 *   5. `manifest.json` der neuen Fassung in die Wurzel.
 * Geht dazwischen etwas schief, wird aus der Sicherung zurückgelegt.
 *
 * **Nie berührt:** alles, was `pu_akt_pfad_ok()` verbietet — `data/`,
 * `.env*`, `php/`, `.git/`. Die Funktionen nehmen die Wurzel als Parameter,
 * damit der Test in einem Wegwerfordner tauschen kann.
 */

require_once __DIR__ . '/aktualisierung.php';

/**
 * Die Startdatei. Bis 28.09.2026 hiess sie `promptheus-start.bat`; seitdem in
 * Grossbuchstaben. Windows unterscheidet die Schreibweise nicht — beide Namen
 * sind DIESELBE Datei. Deshalb wird sie überall ohne Rücksicht auf die
 * Schreibweise erkannt (pu_akt_ist_bat), und nichts wird gelöscht, nur weil
 * es im neuen Manifest anders geschrieben steht (pu_akt_entfallen). Sonst
 * löschte das Update die neue Startdatei gleich nach dem Ablegen wieder.
 */
const PU_AKT_BAT = 'PROMPTHEUS-START.bat';

/** Ist das die Startdatei — in jeder Schreibweise? */
function pu_akt_ist_bat(string $p): bool
{
    return strcasecmp($p, PU_AKT_BAT) === 0;
}

/** Pfade ohne Doppelte, die sich nur in der Schreibweise unterscheiden. */
function pu_akt_ohne_schreibweise(array $pfade): array
{
    $aus = [];
    foreach ($pfade as $p) {
        $aus[strtolower((string)$p)] ??= (string)$p;
    }
    return array_values($aus);
}

/** Was im alten Manifest steht und im neuen fehlt — ohne auf die Schreibweise zu achten. */
function pu_akt_entfallen(array $alt, array $neu): array
{
    $da = array_flip(array_map('strtolower', $neu));
    return array_values(array_filter($alt, static fn($p) => !isset($da[strtolower((string)$p)])));
}

function pu_akt_log(string $ordner, string $zeile): void
{
    @file_put_contents($ordner . '/protokoll.log', gmdate('Y-m-d\TH:i:s\Z') . ' ' . $zeile . "\n", FILE_APPEND | LOCK_EX);
}

/**
 * Eine neue, leere Datei unter einem kurzen Pfad (Systemtemp). Für libzip
 * und SQLite, die unter Windows nur bis 260 Zeichen arbeiten.
 */
function pu_akt_kurz_neu(string $vorsilbe): string
{
    $d = tempnam(sys_get_temp_dir(), $vorsilbe);
    if ($d === false) {
        throw new RuntimeException('Keine Temp-Datei.');
    }
    return $d;
}

/** Verschiebt (auch über Laufwerksgrenzen); PHP selbst kennt lange Pfade. */
function pu_akt_verschieben(string $von, string $nach): bool
{
    if (@rename($von, $nach)) {
        return true;
    }
    if (@copy($von, $nach)) {
        @unlink($von);
        return true;
    }
    return false;
}

/** Liest ein Manifest (Datei) oder gibt ein leeres zurück. */
function pu_akt_manifest_lesen(string $datei): array
{
    $j = is_file($datei) ? json_decode((string)file_get_contents($datei), true) : null;
    if (!is_array($j) || !is_array($j['dateien'] ?? null)) {
        return ['fassung' => '', 'dateien' => []];
    }
    $d = [];
    foreach ($j['dateien'] as $p => $sha) {
        if (is_string($p) && pu_akt_pfad_ok($p)) {
            $d[$p] = (string)$sha;
        }
    }
    return ['fassung' => (string)($j['fassung'] ?? ''), 'dateien' => $d];
}

function pu_akt_db_version(string $db_datei): int
{
    if (!is_file($db_datei)) {
        return -1;
    }
    try {
        return (int)(new PDO('sqlite:' . $db_datei))->query('PRAGMA user_version')->fetchColumn();
    } catch (Throwable) {
        return -1;
    }
}

/** Datei an ihren Platz, über eine Zwischendatei (kein halber Stand bei Abbruch). */
function pu_akt_ablegen_datei(string $quelle, string $ziel): void
{
    $o = dirname($ziel);
    if (!is_dir($o) && !@mkdir($o, 0775, true) && !is_dir($o)) {
        throw new RuntimeException("Ordner lässt sich nicht anlegen: $o");
    }
    $tmp = $ziel . '.pu-neu';
    if (!@copy($quelle, $tmp)) {
        throw new RuntimeException("Datei lässt sich nicht schreiben: $ziel");
    }
    if (!@rename($tmp, $ziel)) {
        @unlink($tmp);
        throw new RuntimeException("Datei lässt sich nicht ersetzen: $ziel");
    }
}

/**
 * Sichert die genannten Programmdateien (soweit vorhanden) und die Datenbank.
 * @return string Pfad des Sicherungsordners
 */
function pu_akt_sichern(string $wurzel, string $ordner, string $db_datei, array $pfade, string $von, string $nach): string
{
    // Zeit vorn (sortiert = zeitlich), dazu ein Zufallsstück: zwei Sicherungen
    // in derselben Sekunde bekämen sonst denselben Ordner, und VACUUM INTO
    // schreibt nie über eine vorhandene Datei.
    $name = gmdate('Ymd-His') . '-' . ($von !== '' ? $von : 'ohne') . '-' . $nach . '-' . bin2hex(random_bytes(3));
    $s = $ordner . '/sicherung/' . $name;
    if (!@mkdir($s, 0775, true)) {
        throw new RuntimeException('Der Sicherungsordner lässt sich nicht anlegen.');
    }
    // libzip und VACUUM INTO arbeiten unter Windows nur bis 260 Zeichen; die
    // Academy liegt oft tiefer (Probelauf 27.09.2026). Beide schreiben deshalb
    // in einen kurzen Temp-Pfad, PHP verschiebt danach an den Platz.
    $zip_tmp = pu_akt_kurz_neu('pus');
    $zip = new ZipArchive();
    if ($zip->open($zip_tmp, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
        throw new RuntimeException('Die Programmsicherung lässt sich nicht anlegen.');
    }
    $gesichert = [];
    foreach (pu_akt_ohne_schreibweise($pfade) as $p) {
        $voll = $wurzel . '/' . $p;
        if (pu_akt_pfad_ok($p) && is_file($voll)) {
            // libzip scheitert unter Windows an Pfaden über 260 Zeichen, PHP
            // nicht: lange Pfade deshalb über PHP lesen (Probelauf 27.09.2026).
            if (strlen($voll) > 240) {
                $zip->addFromString($p, (string)file_get_contents($voll));
            } else {
                $zip->addFile($voll, $p);
            }
            $gesichert[] = $p;
        }
    }
    if (is_file($wurzel . '/manifest.json')) {
        $zip->addFile($wurzel . '/manifest.json', 'manifest.json');
    }
    if (!$zip->close() || !pu_akt_verschieben($zip_tmp, $s . '/programm.zip')) {
        @unlink($zip_tmp);
        throw new RuntimeException('Die Programmsicherung liess sich nicht schreiben.');
    }
    $dbv = -1;
    if (is_file($db_datei)) {
        $db_tmp = pu_akt_kurz_neu('pud');
        @unlink($db_tmp);   // VACUUM INTO schreibt nie über eine vorhandene Datei
        $pdo = new PDO('sqlite:' . $db_datei);
        $pdo->exec('VACUUM INTO ' . $pdo->quote($db_tmp));
        $pdo = null;
        if (!pu_akt_verschieben($db_tmp, $s . '/promptheus.db')) {
            throw new RuntimeException('Die Datenbanksicherung liess sich nicht ablegen.');
        }
        $dbv = pu_akt_db_version($db_datei);
    }
    file_put_contents($s . '/info.json', json_encode([
        'von' => $von, 'nach' => $nach, 'zeit' => gmdate('Y-m-d\TH:i:s\Z'),
        'dateien' => $gesichert, 'db_version' => $dbv, 'manifest_vorher' => is_file($wurzel . '/manifest.json'),
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    return $s;
}

/**
 * Ordner, die durch das Löschen von `$pfade` leer geworden sind, ebenfalls
 * entfernen — die tiefsten zuerst, nie die Wurzel. `rmdir` scheitert an jedem
 * Ordner, in dem noch etwas liegt; Eigenes der Schule bleibt so unberührt.
 * (1.0.8 → 1.1.0 liess z. B. `secondbrain/90_Bibliothek/Glossar` leer stehen.)
 */
function pu_akt_leere_ordner_weg(string $wurzel, array $pfade): void
{
    $ordner = [];
    foreach ($pfade as $p) {
        for ($d = dirname((string)$p); $d !== '.' && $d !== '/' && $d !== '\\' && $d !== ''; $d = dirname($d)) {
            $ordner[$d] = substr_count($d, '/');
        }
    }
    arsort($ordner);
    foreach (array_keys($ordner) as $d) {
        $voll = $wurzel . '/' . $d;
        if (pu_akt_pfad_ok($d . '/x') && is_dir($voll) && !is_link($voll) && count((array)@scandir($voll)) === 2) {
            @rmdir($voll);
        }
    }
}

/**
 * Legt die Programmdateien einer Sicherung zurück. Dateien, die es vorher
 * nicht gab (`$dazu`), werden entfernt.
 */
function pu_akt_zuruecklegen(string $wurzel, string $sicherung, array $dazu): void
{
    $info = json_decode((string)file_get_contents($sicherung . '/info.json'), true) ?: [];
    $vorher = array_flip(array_map('strtolower', (array)($info['dateien'] ?? [])));
    $zip_kurz = pu_akt_kurz_neu('pur');
    $zip = new ZipArchive();
    if (!@copy($sicherung . '/programm.zip', $zip_kurz) || $zip->open($zip_kurz, ZipArchive::RDONLY) !== true) {
        @unlink($zip_kurz);
        throw new RuntimeException('Die Programmsicherung ist nicht lesbar.');
    }
    register_shutdown_function(static function () use ($zip_kurz) { @unlink($zip_kurz); });
    // Nicht beim ersten Fehler aufhören: jede Datei, die sich zurücklegen
    // lässt, wird zurückgelegt; gemeldet wird am Ende, was nicht ging.
    $gescheitert = [];
    for ($i = 0; $i < $zip->numFiles; $i++) {
        $name = (string)$zip->getNameIndex($i);
        if ($name !== 'manifest.json' && !pu_akt_pfad_ok($name)) {
            continue;
        }
        $inhalt = (string)$zip->getFromIndex($i);
        $ziel = $wurzel . '/' . $name;
        if (pu_akt_ist_bat($name)) {
            // Die laufende bat nie überschreiben (siehe Kopf): daneben legen,
            // die bat verschiebt sie selbst. Gleich? Dann nichts tun.
            @unlink($wurzel . '/' . PU_AKT_BAT . '.neu');
            if (is_file($ziel) && hash_equals(hash_file('sha256', $ziel), hash('sha256', $inhalt))) {
                continue;
            }
            $ziel = $wurzel . '/' . PU_AKT_BAT . '.neu';
        }
        if (!pu_akt_ist_bat($name) && is_file($ziel) && hash_equals(hash_file('sha256', $ziel), hash('sha256', $inhalt))) {
            continue;   // schon so: nicht anfassen
        }
        @mkdir(dirname($ziel), 0775, true);
        $tmp = $ziel . '.pu-alt';
        if (file_put_contents($tmp, $inhalt) === false || !@rename($tmp, $ziel)) {
            @unlink($tmp);
            $gescheitert[] = $name;
        }
    }
    $zip->close();
    if ($gescheitert !== []) {
        throw new RuntimeException('Nicht zurückgelegt: ' . implode(', ', array_slice($gescheitert, 0, 5))
            . (count($gescheitert) > 5 ? ' und ' . (count($gescheitert) - 5) . ' weitere' : ''));
    }
    foreach ($dazu as $p) {
        if (!pu_akt_ist_bat($p) && pu_akt_pfad_ok($p) && !isset($vorher[strtolower($p)]) && is_file($wurzel . '/' . $p)) {
            @unlink($wurzel . '/' . $p);
        }
    }
    if (empty($info['manifest_vorher']) && is_file($wurzel . '/manifest.json')) {
        @unlink($wurzel . '/manifest.json');
    }
}

/**
 * Spielt das Bereitgelegte ein.
 * @return array{ok:bool, meldung:string}
 */
function pu_akt_tausch(string $wurzel, string $ordner, string $db_datei): array
{
    $b = is_file($ordner . '/bereit.json') ? json_decode((string)file_get_contents($ordner . '/bereit.json'), true) : null;
    if (!is_array($b) || !pu_akt_fassung_ok((string)($b['fassung'] ?? ''))) {
        return ['ok' => false, 'meldung' => 'Nichts bereitgelegt.'];
    }
    $nach = $b['fassung'];
    $neu = $ordner . '/' . $nach . '/neu';
    $m_neu = pu_akt_manifest_lesen($neu . '/manifest.json');
    $ende = static function (bool $ok, string $text) use ($ordner, $nach): array {
        @unlink($ordner . '/bereit.json');
        pu_akt_ordner_weg($ordner . '/' . $nach);
        pu_akt_log($ordner, ($ok ? 'OK ' : 'FEHLER ') . $text);
        return ['ok' => $ok, 'meldung' => $text];
    };
    if ($m_neu['fassung'] !== $nach || $m_neu['dateien'] === []) {
        return $ende(false, "Bereitgelegtes Manifest passt nicht zu $nach.");
    }
    // 1. Noch einmal prüfen — zwischen Laden und Neustart kann Zeit vergehen.
    foreach ($m_neu['dateien'] as $p => $sha) {
        if (!is_file($neu . '/' . $p) || !hash_equals($sha, hash_file('sha256', $neu . '/' . $p))) {
            return $ende(false, "Bereitgelegte Datei verändert oder fehlt: $p");
        }
    }
    $m_alt = pu_akt_manifest_lesen($wurzel . '/manifest.json');
    $von = pu_akt_fassung_ok(trim((string)@file_get_contents($wurzel . '/VERSION'))) ? trim((string)file_get_contents($wurzel . '/VERSION')) : '';
    $entfallen = pu_akt_entfallen(array_keys($m_alt['dateien']), array_keys($m_neu['dateien']));

    // 2. Sichern
    try {
        $sicherung = pu_akt_sichern($wurzel, $ordner, $db_datei,
            array_merge(array_keys($m_alt['dateien']), array_keys($m_neu['dateien'])), $von, $nach);
    } catch (Throwable $f) {
        return $ende(false, 'Sicherung fehlgeschlagen, nichts getauscht: ' . $f->getMessage());
    }

    // 3.–5. Tauschen
    try {
        // VERSION zuletzt: bricht der Tausch ab, meldet die Academy nie eine
        // Fassung, deren Dateien sie nicht vollständig hat.
        $reihe = array_keys($m_neu['dateien']);
        usort($reihe, static fn ($a, $b) => ($a === 'VERSION') <=> ($b === 'VERSION') ?: strcmp($a, $b));
        foreach ($reihe as $p) {
            $ziel = pu_akt_ist_bat($p) ? $wurzel . '/' . PU_AKT_BAT . '.neu' : $wurzel . '/' . $p;
            // Unverändert: nicht anfassen — weniger Schreiben, weniger, was
            // gesperrt sein kann (und nichts neben die laufende bat legen).
            if (is_file($wurzel . '/' . $p) && hash_equals($m_neu['dateien'][$p], hash_file('sha256', $wurzel . '/' . $p))) {
                continue;
            }
            pu_akt_ablegen_datei($neu . '/' . $p, $ziel);
        }
        foreach ($entfallen as $p) {
            if (!pu_akt_ist_bat($p) && is_file($wurzel . '/' . $p)) {
                @unlink($wurzel . '/' . $p);
            }
        }
        pu_akt_leere_ordner_weg($wurzel, $entfallen);
        pu_akt_ablegen_datei($neu . '/manifest.json', $wurzel . '/manifest.json');
    } catch (Throwable $f) {
        try {
            pu_akt_zuruecklegen($wurzel, $sicherung, array_keys($m_neu['dateien']));
            @unlink($wurzel . '/' . PU_AKT_BAT . '.neu');
            return $ende(false, 'Tausch abgebrochen und zurückgelegt: ' . $f->getMessage());
        } catch (Throwable $g) {
            return $ende(false, 'Tausch abgebrochen, Zurücklegen AUCH fehlgeschlagen (' . $g->getMessage()
                . '). Sicherung liegt in ' . basename($sicherung) . '.');
        }
    }
    return $ende(true, ($von !== '' ? $von : 'ohne Fassung') . " → $nach eingespielt (Sicherung " . basename($sicherung) . ').');
}

/**
 * Nimmt das letzte Update zurück: Programmdateien aus der jüngsten Sicherung.
 * Die Datenbank nur, wenn das Update ihr Schema geändert hat — dann bleibt
 * die neuere als `promptheus.db.nach-<fassung>` liegen.
 */
function pu_akt_zurueck(string $wurzel, string $ordner, string $db_datei): array
{
    @unlink($ordner . '/zurueck');
    $sicherungen = [];
    foreach (glob($ordner . '/sicherung/*/info.json') ?: [] as $i) {
        $j = json_decode((string)file_get_contents($i), true);
        if (is_array($j) && empty($j['zurueckgenommen'])) {
            $sicherungen[basename(dirname($i))] = $j;
        }
    }
    if ($sicherungen === []) {
        pu_akt_log($ordner, 'FEHLER Rückweg: keine Sicherung.');
        return ['ok' => false, 'meldung' => 'Keine Sicherung vorhanden.'];
    }
    krsort($sicherungen, SORT_STRING);
    $name = array_key_first($sicherungen);
    $info = $sicherungen[$name];
    $pfad = $ordner . '/sicherung/' . $name;
    $jetzt = pu_akt_manifest_lesen($wurzel . '/manifest.json');
    $jetzt_fassung = trim((string)@file_get_contents($wurzel . '/VERSION'));
    try {
        pu_akt_zuruecklegen($wurzel, $pfad, array_keys($jetzt['dateien']));
        $db_hinweis = '';
        if (is_file($pfad . '/promptheus.db') && (int)$info['db_version'] !== pu_akt_db_version($db_datei)) {
            @copy($db_datei, $db_datei . '.nach-' . (pu_akt_fassung_ok($jetzt_fassung) ? $jetzt_fassung : 'update'));
            pu_akt_ablegen_datei($pfad . '/promptheus.db', $db_datei);
            @unlink($db_datei . '-wal');
            @unlink($db_datei . '-shm');
            $db_hinweis = ' Datenbank zurückgelegt (Schema hatte sich geändert).';
        }
    } catch (Throwable $f) {
        pu_akt_log($ordner, 'FEHLER Rückweg: ' . $f->getMessage());
        return ['ok' => false, 'meldung' => 'Rückweg fehlgeschlagen: ' . $f->getMessage()];
    }
    $info['zurueckgenommen'] = gmdate('Y-m-d\TH:i:s\Z');
    file_put_contents($pfad . '/info.json', json_encode($info, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    $text = 'Zurück auf ' . ($info['von'] !== '' ? $info['von'] : 'den Stand vor dem Update') . '.' . $db_hinweis;
    pu_akt_log($ordner, 'OK ' . $text);
    return ['ok' => true, 'meldung' => $text];
}
