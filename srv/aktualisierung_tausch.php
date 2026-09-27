<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — der Tausch der Programmdateien und der Rückweg.
 *
 * Läuft nur aus `srv/aktualisieren_cli.php`, das `promptheus-start.bat` vor
 * dem Serverstart aufruft. Solange der Server läuft, sind seine Dateien in
 * Benutzung; deshalb wird hier und nicht in api.php getauscht.
 *
 * Reihenfolge beim Tausch:
 *   1. Bereitgelegtes noch einmal gegen sein Manifest prüfen.
 *   2. Sichern: Datenbank (VACUUM INTO) und jede Programmdatei, die berührt
 *      wird, als ZIP nach data/aktualisierung/sicherung/<Zeit>-<alt>-<neu>/.
 *   3. Neue Dateien an ihren Platz; `promptheus-start.bat` nur als `.neu`
 *      daneben (die laufende bat liest sich zeilenweise selbst nach).
 *   4. Dateien löschen, die im alten Manifest standen und im neuen fehlen.
 *   5. `manifest.json` der neuen Fassung in die Wurzel.
 * Geht dazwischen etwas schief, wird aus der Sicherung zurückgelegt.
 *
 * **Nie berührt:** alles, was `pu_akt_pfad_ok()` verbietet — `data/`,
 * `.env*`, `php/`, `.git/`. Die Funktionen nehmen die Wurzel als Parameter,
 * damit der Test in einem Wegwerfordner tauschen kann.
 */

require_once __DIR__ . '/aktualisierung.php';

const PU_AKT_BAT = 'promptheus-start.bat';

function pu_akt_log(string $ordner, string $zeile): void
{
    @file_put_contents($ordner . '/protokoll.log', gmdate('Y-m-d\TH:i:s\Z') . ' ' . $zeile . "\n", FILE_APPEND | LOCK_EX);
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
    $zip = new ZipArchive();
    if ($zip->open($s . '/programm.zip', ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
        throw new RuntimeException('Die Programmsicherung lässt sich nicht anlegen.');
    }
    $gesichert = [];
    foreach (array_unique($pfade) as $p) {
        if (pu_akt_pfad_ok($p) && is_file($wurzel . '/' . $p)) {
            $zip->addFile($wurzel . '/' . $p, $p);
            $gesichert[] = $p;
        }
    }
    if (is_file($wurzel . '/manifest.json')) {
        $zip->addFile($wurzel . '/manifest.json', 'manifest.json');
    }
    if (!$zip->close()) {
        throw new RuntimeException('Die Programmsicherung liess sich nicht schreiben.');
    }
    $dbv = -1;
    if (is_file($db_datei)) {
        $pdo = new PDO('sqlite:' . $db_datei);
        $pdo->exec('VACUUM INTO ' . $pdo->quote($s . '/promptheus.db'));
        $dbv = pu_akt_db_version($db_datei);
    }
    file_put_contents($s . '/info.json', json_encode([
        'von' => $von, 'nach' => $nach, 'zeit' => gmdate('Y-m-d\TH:i:s\Z'),
        'dateien' => $gesichert, 'db_version' => $dbv, 'manifest_vorher' => is_file($wurzel . '/manifest.json'),
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    return $s;
}

/**
 * Legt die Programmdateien einer Sicherung zurück. Dateien, die es vorher
 * nicht gab (`$dazu`), werden entfernt.
 */
function pu_akt_zuruecklegen(string $wurzel, string $sicherung, array $dazu): void
{
    $info = json_decode((string)file_get_contents($sicherung . '/info.json'), true) ?: [];
    $vorher = array_flip((array)($info['dateien'] ?? []));
    $zip = new ZipArchive();
    if ($zip->open($sicherung . '/programm.zip', ZipArchive::RDONLY) !== true) {
        throw new RuntimeException('Die Programmsicherung ist nicht lesbar.');
    }
    for ($i = 0; $i < $zip->numFiles; $i++) {
        $name = (string)$zip->getNameIndex($i);
        if ($name !== 'manifest.json' && !pu_akt_pfad_ok($name)) {
            continue;
        }
        $inhalt = (string)$zip->getFromIndex($i);
        $ziel = $wurzel . '/' . $name;
        if ($name === PU_AKT_BAT) {
            // Die laufende bat nie überschreiben (siehe Kopf): daneben legen,
            // die bat verschiebt sie selbst. Gleich? Dann nichts tun.
            @unlink($wurzel . '/' . PU_AKT_BAT . '.neu');
            if (is_file($ziel) && hash_equals(hash_file('sha256', $ziel), hash('sha256', $inhalt))) {
                continue;
            }
            $ziel .= '.neu';
        }
        @mkdir(dirname($ziel), 0775, true);
        $tmp = $ziel . '.pu-alt';
        if (file_put_contents($tmp, $inhalt) === false || !@rename($tmp, $ziel)) {
            @unlink($tmp);
            $zip->close();
            throw new RuntimeException("Datei lässt sich nicht zurücklegen: $name");
        }
    }
    $zip->close();
    foreach ($dazu as $p) {
        if ($p !== PU_AKT_BAT && pu_akt_pfad_ok($p) && !isset($vorher[$p]) && is_file($wurzel . '/' . $p)) {
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
    $entfallen = array_diff(array_keys($m_alt['dateien']), array_keys($m_neu['dateien']));

    // 2. Sichern
    try {
        $sicherung = pu_akt_sichern($wurzel, $ordner, $db_datei,
            array_merge(array_keys($m_alt['dateien']), array_keys($m_neu['dateien'])), $von, $nach);
    } catch (Throwable $f) {
        return $ende(false, 'Sicherung fehlgeschlagen, nichts getauscht: ' . $f->getMessage());
    }

    // 3.–5. Tauschen
    try {
        foreach ($m_neu['dateien'] as $p => $_) {
            $ziel = $p === PU_AKT_BAT ? $wurzel . '/' . PU_AKT_BAT . '.neu' : $wurzel . '/' . $p;
            if ($p === PU_AKT_BAT && is_file($wurzel . '/' . $p)
                && hash_file('sha256', $wurzel . '/' . $p) === $m_neu['dateien'][$p]) {
                continue;   // unverändert: nichts neben die laufende bat legen
            }
            pu_akt_ablegen_datei($neu . '/' . $p, $ziel);
        }
        foreach ($entfallen as $p) {
            if ($p !== PU_AKT_BAT && is_file($wurzel . '/' . $p)) {
                @unlink($wurzel . '/' . $p);
            }
        }
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
