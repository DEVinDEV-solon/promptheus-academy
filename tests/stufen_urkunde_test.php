<?php
declare(strict_types=1);
/**
 * Die Stufen-Urkunde im Generator (30.09.2026).
 *
 * Bis dahin öffnete „öffnen" ein festes Blatt im Querformat. Jetzt läuft auch
 * die Urkunde einer einzelnen Stufe durch die Vorlagen der Abschluss-Urkunde.
 * Geprüft wird: der richtige Text je Art, die eigene Gestaltung (nur für die
 * eigene Urkunde), und die zwei neuen Schalter einer Vorlage — `titel_im_bild`
 * und `nur_mit_bild`.
 */

require_once __DIR__ . '/hilfe.php';
test_db_vorbereiten();

// Eigener Vorlagenordner: die echten Vorlagen plus eine mit Bild und Titel im Bild.
$tmp = sys_get_temp_dir() . '/pu_stufen_urk_' . bin2hex(random_bytes(4));
$vorlagen = $tmp . '/60_Urkunden';
$kopieren = static function (string $von, string $nach) use (&$kopieren): void {
    @mkdir($nach, 0700, true);
    foreach (scandir($von) ?: [] as $e) {
        if ($e === '.' || $e === '..') continue;
        is_dir("$von/$e") ? $kopieren("$von/$e", "$nach/$e") : copy("$von/$e", "$nach/$e");
    }
};
$kopieren(__DIR__ . '/../secondbrain/60_Urkunden', $vorlagen);
putenv('PU_TEST_URKUNDEN_VORLAGEN=' . $vorlagen);
putenv('PU_TEST_URKUNDEN=' . $tmp . '/urk');

register_shutdown_function(static function () use ($tmp) {
    $weg = static function (string $p) use (&$weg): void {
        if (is_dir($p)) { foreach (scandir($p) ?: [] as $e) if ($e !== '.' && $e !== '..') $weg("$p/$e"); @rmdir($p); }
        else @unlink($p);
    };
    $weg($tmp);
});

require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../srv/db.php';
require_once __DIR__ . '/../srv/lernende.php';
require_once __DIR__ . '/../srv/zertifikat.php';
require_once __DIR__ . '/../srv/abschluss.php';

$anna = pu_lernenden_anlegen('anna', 'Anna', 'geheim12345', 'schueler');
$ben  = pu_lernenden_anlegen('ben', 'Ben', 'geheim12345', 'schueler');

// ================================================================ Datenbank
gruppe('Datenbank');
$spalten = array_column(pu_db()->query('PRAGMA table_info(urkunden)')->fetchAll(), 'name');
pruefe('urkunden hat die Spalte design', in_array('design', $spalten, true));
gleich('Schema-Stand 12', 12, (int)pu_db()->query('PRAGMA user_version')->fetchColumn());

// ================================================================ Stufen-Urkunde
gruppe('Stufen-Urkunde');
$u = pu_urkunde_ausstellen($anna, 1, 120);
$liste = pu_urkunden($anna);
gleich('noch nie gestaltet: design null', null, $liste[0]['design']);

$html = (string)pu_urkunde_html($u['pruefcode']);
pruefe('keine offenen Platzhalter', $html !== '' && !str_contains($html, '{{'));
pruefe('A4 hoch — dasselbe Blatt wie die Abschluss-Urkunde', str_contains($html, 'size: A4 portrait'));
pruefe('Stufe und Name der Stufe', str_contains($html, 'Stufe 1 · ENTDECKER · Grundlagen'));
pruefe('Text der Stufe, nicht der sechs Stufen', str_contains($html, 'die Abschlussprüfung der Stufe 1')
       && !str_contains($html, 'alle sechs Stufen'));
pruefe('Anzeigename steht drauf', str_contains($html, '>Anna<'));
pruefe('Prüfcode steht drauf', str_contains($html, $u['pruefcode']));
pruefe('kein Konto-Hash, kein Siegel', !str_contains($html, 'Konto-Hash') && !str_contains($html, '<b>Siegel</b>'));
pruefe('Punkte der einen Prüfung', str_contains($html, '120 Punkte in der Prüfung'));
pruefe('meldet keinen Druck ans Cockpit', str_contains($html, "var code = '';"));
pruefe('kein Stempel', str_contains($html, '<div class="stempel"></div>'));

// ================================================================ Gestaltung
gruppe('Gestaltung');
$fehler = static function (callable $f): string {
    try { $f(); return ''; } catch (Throwable $e) { return get_class($e); }
};
gleich('fremde Urkunde: abgelehnt', 'DomainException',
       $fehler(fn() => pu_urkunde_design_setzen($ben, $u['pruefcode'], '02_historisch-siegel/pergament', [])));
gleich('unbekanntes Design: abgelehnt', 'InvalidArgumentException',
       $fehler(fn() => pu_urkunde_design_setzen($anna, $u['pruefcode'], '01_schlicht/../../lib', [])));

$d = pu_urkunde_design_setzen($anna, strtolower($u['pruefcode']), '02_historisch-siegel/pergament',
                              ['name_groesse' => 999, 'titel_schrift' => 'fraktur']);
gleich('gespeichert mit Variante', '02_historisch-siegel/pergament', $d['variante']);
pruefe('geklemmt auf die Grenzen der Vorlage', $d['name_groesse'] <= 38);
gleich('in der Liste zu sehen', '02_historisch-siegel/pergament', pu_urkunden($anna)[0]['design']['variante'] ?? null);
pruefe('die Seite nimmt die Farben der Variante', str_contains((string)pu_urkunde_html($u['pruefcode']), '#7a1515'));

pu_urkunde_widerrufen($u['pruefcode'], $anna);
pruefe('widerrufen: Stempel', str_contains((string)pu_urkunde_html($u['pruefcode']), '>widerrufen<'));
gleich('widerrufen: nicht mehr gestaltbar', 'DomainException',
       $fehler(fn() => pu_urkunde_design_setzen($anna, $u['pruefcode'], '01_schlicht/klar', [])));

// ================================================================ Muster
gruppe('Muster');
$m3 = (string)pu_abschluss_muster('01_schlicht/klar', [], 3);
pruefe('Muster einer Stufe: Stufe 3', str_contains($m3, 'Stufe 3 · BUILDER') && str_contains($m3, 'PU-3-XXXXXXXX'));
pruefe('Muster einer Stufe: Stempel', str_contains($m3, '>Muster<'));
$mA = (string)pu_abschluss_muster('01_schlicht/klar', [], 99);
pruefe('unbekannte Stufe: Abschluss-Muster', str_contains($mA, 'alle sechs Stufen') && str_contains($mA, 'Konto-Hash'));

// ================================================================ Titel im Bild
gruppe('Vorlage mit dem Wort im Bild');
$ordner = $vorlagen . '/02_historisch-siegel/probe-siegel';
@mkdir($ordner, 0700, true);
file_put_contents($ordner . '/vorlage.json', json_encode([
    'name' => 'Probe', 'beschreibung' => 'Titel steckt im Bild', 'titel_im_bild' => true, 'nur_mit_bild' => true,
]));
$ids = static fn(): array => array_merge(...array_map(
    static fn(array $g) => array_column($g['varianten'], 'id'), pu_urkunden_varianten()));
pruefe('ohne Bild: nicht in der Auswahl', !in_array('02_historisch-siegel/probe-siegel', $ids(), true));

// Ein 1×1-PNG genügt: es geht um den Schalter, nicht um das Motiv.
file_put_contents($ordner . '/hintergrund.png', base64_decode(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='));
pruefe('mit Bild: in der Auswahl', in_array('02_historisch-siegel/probe-siegel', $ids(), true));
$eintrag = null;
foreach (pu_urkunden_varianten() as $g) foreach ($g['varianten'] as $v) if ($v['id'] === '02_historisch-siegel/probe-siegel') $eintrag = $v;
pruefe('die Oberfläche erfährt: Titel im Bild', !empty($eintrag['titel_im_bild']));
$mp = (string)pu_abschluss_muster('02_historisch-siegel/probe-siegel');
pruefe('die Seite blendet den eigenen Titel aus', str_contains($mp, 'titel-im-bild') && str_contains($mp, 'mit-bild'));
$ohne = (string)pu_abschluss_muster('02_historisch-siegel/pergament');
pruefe('andere Vorlagen behalten ihren Titel', !str_contains($ohne, 'class="blatt siegel titel-im-bild'));

bilanz();
