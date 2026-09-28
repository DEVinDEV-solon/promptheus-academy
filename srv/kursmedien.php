<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — die Kursmedien vom eigenen Server holen (Entscheid 28.09.2026).
 *
 * Die Aufnahmen neben den Kursen (Video, Hörfolge, Song — alles, was die
 * Playlist rechts zeigt) liegen nicht im Git-Repo: Sie sind gross, und das
 * Repo ist öffentlich. Sie kommen als eigenes **Kursmedien-Paket** über
 * denselben Weg wie die Updates:
 *
 *     Entwickler-PC  werkzeuge/medien_paket_bauen.php → promptheus-medien-X.Y.Z.zip
 *     Server         SFTP-Eingang → Cockpit „Updates → Kursmedien“: prüfen, freigeben
 *     Feed           der signierte Update-Feed trägt `medien` (Stand, Prüfsumme, Grösse)
 *     Academy        hier: laden, gegen den Feed prüfen, Datei für Datei prüfen,
 *                    unter medien/ ablegen
 *
 * **Was hier nie passiert:** Eine Datei ausserhalb von `medien/` schreiben,
 * eine Datei ohne Medien-Endung schreiben, oder eine Datei löschen, die nicht
 * aus einem früheren Kursmedien-Paket stammt. Eigene Aufnahmen, die jemand
 * selbst in medien/ gelegt hat, bleiben unberührt.
 */

require_once __DIR__ . '/aktualisierung.php';
require_once __DIR__ . '/medien.php';

/** Nur diese Endungen — dieselben, die die Playlist zeigt (srv/medien.php). */
function pu_med_endungen(): array
{
    return array_merge(PU_MEDIEN_VIDEO, PU_MEDIEN_TON);
}

/**
 * Darf dieser Pfad in einem Kursmedien-Paket stehen? Die Update-Regel
 * (pu_akt_pfad_ok) und zusätzlich: unter `medien/`, mit Medien-Endung, keine
 * Zwischenkopie (`….tmp.mp3`).
 */
function pu_med_pfad_ok(string $p): bool
{
    if (!pu_akt_pfad_ok($p) || !str_starts_with($p, 'medien/')) {
        return false;
    }
    $name = strtolower(basename($p));
    if (str_contains($name, '.tmp.') || str_ends_with($name, '.tmp')) {
        return false;
    }
    return in_array(pathinfo($name, PATHINFO_EXTENSION), pu_med_endungen(), true);
}

/** Welcher Stand ist installiert? `stand` leer: noch keiner. */
function pu_med_installiert(): array
{
    $d = pu_akt_ordner() . '/medien.json';
    $j = is_file($d) ? json_decode((string)file_get_contents($d), true) : null;
    return is_array($j) && pu_akt_fassung_ok((string)($j['stand'] ?? ''))
        ? ['stand' => $j['stand'], 'dateien' => is_array($j['dateien'] ?? null) ? $j['dateien'] : [],
           'zeit' => (string)($j['zeit'] ?? '')]
        : ['stand' => '', 'dateien' => [], 'zeit' => ''];
}

/**
 * Das Angebot aus einem geprüften Feed — oder null, wenn der Feed keines
 * trägt oder der Stand schon da ist.
 */
function pu_med_angebot(array $rumpf): ?array
{
    $m = $rumpf['medien'] ?? null;
    if (!is_array($m) || !pu_akt_fassung_ok((string)($m['stand'] ?? ''))
        || !preg_match('/^[0-9a-f]{64}$/', (string)($m['sha256'] ?? ''))
        || (int)($m['groesse'] ?? 0) <= 0) {
        return null;
    }
    if (pu_akt_rang($m['stand']) <= pu_akt_rang(pu_med_installiert()['stand'])) {
        return null;
    }
    return ['stand' => $m['stand'], 'sha256' => $m['sha256'], 'groesse' => (int)$m['groesse'],
            'dateien' => (int)($m['dateien'] ?? 0), 'datum' => (string)($m['datum'] ?? '')];
}

/**
 * Spielt ein geladenes Kursmedien-Paket ein. Ohne Netz, damit der Test es
 * direkt rufen kann.
 *
 * 1. Manifest prüfen: Art „medien“, Stand wie erwartet, jeder Pfad pu_med_pfad_ok.
 * 2. Jede Datei in einen Zwischenordner entpacken und ihre Prüfsumme prüfen.
 *    Stimmt eine nicht, wird nichts eingespielt.
 * 3. Erst dann an ihren Platz unter medien/ (unverändert: nicht anfassen).
 * 4. Was im vorigen Kursmedien-Paket stand und im neuen fehlt, entfernen.
 *
 * @return array{ok:bool, meldung:string, neu:int, gleich:int, entfernt:int}
 */
function pu_med_einspielen(string $zip_datei, string $wurzel, string $stand): array
{
    $nein = static fn (string $t): array => ['ok' => false, 'meldung' => $t, 'neu' => 0, 'gleich' => 0, 'entfernt' => 0];
    if (!class_exists('ZipArchive')) {
        return $nein('Die PHP-Erweiterung zip fehlt (php.ini: extension=zip).');
    }
    $zwischen = pu_akt_ordner('medien-neu');
    pu_akt_ordner_weg($zwischen);
    // pu_akt_entpacken prüft Manifest, Pfadregel der Updates, Grössen und
    // jede Prüfsumme — und entpackt nur in den Zwischenordner.
    $e = pu_akt_entpacken($zip_datei, $zwischen, $stand, '999.999.999');
    if (!$e['ok']) {
        pu_akt_ordner_weg($zwischen);
        return $nein('Kursmedien abgewiesen: ' . $e['grund']);
    }
    $m = $e['manifest'];
    if (($m['art'] ?? '') !== 'medien') {
        pu_akt_ordner_weg($zwischen);
        return $nein('Das ist kein Kursmedien-Paket.');
    }
    foreach (array_keys($m['dateien']) as $p) {
        if (!pu_med_pfad_ok((string)$p)) {
            pu_akt_ordner_weg($zwischen);
            return $nein('Kursmedien abgewiesen: unerlaubter Pfad ' . mb_substr((string)$p, 0, 80));
        }
    }

    $neu = 0; $gleich = 0; $entfernt = 0;
    foreach ($m['dateien'] as $p => $sha) {
        $ziel = $wurzel . '/' . $p;
        if (is_file($ziel) && hash_equals($sha, (string)hash_file('sha256', $ziel))) {
            $gleich++;
            continue;
        }
        @mkdir(dirname($ziel), 0775, true);
        $tmp = $ziel . '.pu-neu';
        if (!@copy($zwischen . '/' . $p, $tmp) || !@rename($tmp, $ziel)) {
            @unlink($tmp);
            pu_akt_ordner_weg($zwischen);
            return ['ok' => false, 'meldung' => 'Eine Datei liess sich nicht ablegen (läuft sie gerade?): ' . $p
                    . '. Bereits abgelegte Dateien bleiben; bitte erneut laden.', 'neu' => $neu, 'gleich' => $gleich, 'entfernt' => 0];
        }
        $neu++;
    }
    $vorher = pu_med_installiert()['dateien'];
    $da = array_flip(array_map('strtolower', array_keys($m['dateien'])));
    foreach ($vorher as $p) {
        $p = (string)$p;
        if (pu_med_pfad_ok($p) && !isset($da[strtolower($p)]) && is_file($wurzel . '/' . $p)) {
            @unlink($wurzel . '/' . $p);
            $entfernt++;
        }
    }
    pu_akt_ordner_weg($zwischen);
    file_put_contents(pu_akt_ordner() . '/medien.json', json_encode([
        'stand' => $stand, 'dateien' => array_keys($m['dateien']), 'zeit' => gmdate('Y-m-d\TH:i:s\Z'),
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
    return ['ok' => true, 'meldung' => "Kursmedien $stand eingespielt: $neu neu, $gleich unverändert"
            . ($entfernt > 0 ? ", $entfernt entfernt" : '') . '.', 'neu' => $neu, 'gleich' => $gleich, 'entfernt' => $entfernt];
}

/**
 * Lädt das angebotene Kursmedien-Paket, prüft Grösse und Prüfsumme gegen den
 * signierten Feed und spielt es ein.
 */
function pu_med_laden(string $wurzel = PU_ROOT): array
{
    $a = pu_akt_stand()['medien'] ?? null;
    if (!is_array($a) || !pu_akt_fassung_ok((string)($a['stand'] ?? ''))) {
        return ['ok' => false, 'meldung' => 'Es gibt gerade keine neueren Kursmedien.'];
    }
    $stand = $a['stand'];
    $ordner = pu_akt_ordner('medien-laden');
    $zip = $ordner . '/paket.zip';
    $r = pu_akt_http(pu_akt_url() . 'paket.php?m=' . $stand, null, $zip, PU_AKT_ZEIT_LADEN);
    if ($r['status'] !== 200 || !is_file($zip)) {
        pu_akt_ordner_weg($ordner);
        return ['ok' => false, 'meldung' => $r['status'] === 0 ? 'Der Update-Server war nicht erreichbar.'
            : 'Die Kursmedien liessen sich nicht laden (Antwort ' . $r['status'] . ').'];
    }
    if ((int)filesize($zip) !== (int)$a['groesse'] || !hash_equals($a['sha256'], (string)hash_file('sha256', $zip))) {
        pu_akt_ordner_weg($ordner);
        return ['ok' => false, 'meldung' => 'Das geladene Paket stimmt nicht mit der Unterschrift überein. Es wurde verworfen.'];
    }
    $e = pu_med_einspielen($zip, $wurzel, $stand);
    pu_akt_ordner_weg($ordner);
    if ($e['ok']) {
        $s = pu_akt_stand();
        $s['medien'] = null;
        pu_akt_stand_setzen($s);
    }
    return ['ok' => $e['ok'], 'meldung' => $e['meldung']];
}
