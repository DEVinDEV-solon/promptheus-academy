<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — die Gemeinde von der Academy aus (Runde 3b): Synonym, Meine
 * Produkte, Mit-Siegel, Freischalten, Abgleich, Kommentar.
 *
 * Läuft ohne Server: `PU_RELAY_SENDER` spielt ihn. Geprüft wird vor allem,
 * was nicht hinausgehen darf (Namen, Kennungen, persönliche Angaben) und was
 * ohne Bild, Kategorie oder Mit-Siegel nicht geht.
 *
 * Aufruf:
 *     php -d extension=pdo_sqlite -d extension=sqlite3 -d extension=sodium -d extension=mbstring
 *         -d extension=zip -d extension=gd tests/gemeinde_test.php
 */

require_once __DIR__ . '/hilfe.php';
$db_datei = test_db_vorbereiten();

$ordner = sys_get_temp_dir() . '/pu_gt_' . bin2hex(random_bytes(6));
putenv('PU_TEST_IDENT=' . $ordner);
putenv('PU_TEST_ENV=' . sys_get_temp_dir() . '/pu_gt_' . bin2hex(random_bytes(6)) . '.env');
$ablage = dirname($db_datei) . '/' . pathinfo($db_datei, PATHINFO_FILENAME) . '_daten';
register_shutdown_function(static function () use ($ordner, $ablage, $db_datei) {
    foreach ([$ordner, $ablage] as $o) {
        if (!is_dir($o)) {
            continue;
        }
        $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($o, FilesystemIterator::SKIP_DOTS),
            RecursiveIteratorIterator::CHILD_FIRST);
        foreach ($it as $f) {
            $f->isDir() ? @rmdir($f->getPathname()) : @unlink($f->getPathname());
        }
        @rmdir($o);
    }
    @unlink($db_datei);
});

require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../srv/rechte.php';
require_once __DIR__ . '/../srv/lernende.php';
require_once __DIR__ . '/../srv/profil.php';
require_once __DIR__ . '/../srv/abo.php';
require_once __DIR__ . '/../srv/gemeinde.php';
foreach (['sodium', 'zip', 'gd'] as $e) {
    if (!extension_loaded($e)) {
        echo "\n$e fehlt — Aufruf mit  -d extension=$e\n";
        exit(2);
    }
}

// ── Der Server, nachgespielt ─────────────────────────────────────────────────
$GLOBALS['rufe'] = [];
$GLOBALS['antworten'] = [];
$GLOBALS['PU_RELAY_SENDER'] = static function (string $json): array {
    $a = json_decode($json, true);
    $rumpf = json_decode((string)$a['rumpf'], true);
    $GLOBALS['rufe'][] = ['zweck' => $rumpf['zweck'], 'nutzlast' => $rumpf['nutzlast'] ?? [], 'roh' => $json];
    $f = $GLOBALS['antworten'][$rumpf['zweck']] ?? static fn() => ['ok' => false, 'grund' => 'unbekannter_zweck'];
    return ['status' => 200, 'rumpf' => (string)json_encode($f($rumpf['nutzlast'] ?? [], $rumpf))];
};
$vps = sodium_crypto_sign_keypair();
putenv('PU_RELAY_URL=https://relay.example.test/relay/');
putenv('PU_VPS_SCHLUESSEL=' . base64_encode(sodium_crypto_sign_publickey($vps)));
$GLOBALS['antworten']['registrieren'] = static function (array $n, array $rumpf) use ($vps): array {
    $b = ['iid' => $rumpf['iid'], 'mandant' => 'M-TEST', 'plan' => 'schule',
          'gueltig_bis' => gmdate('Y-m-d\TH:i:s\Z', time() + 30 * 86400), 'kid' => 'web-1'];
    return ['ok' => true, 'bescheinigung' => $b,
            'signatur' => base64_encode(sodium_crypto_sign_detached(pu_ident_kanonisch($b), sodium_crypto_sign_secretkey($vps)))];
};
pruefe('registriert', pu_relay_registrieren('AAAAA-BBBBB-CCCCC-DDDDD')['ok'] === true);
$GLOBALS['antworten']['konten'] = static fn(array $n) => ['ok' => true, 'topf' => 0,
    'konten' => array_map(static fn($k) => ['konto' => $k['konto'], 'rolle' => $k['rolle'], 'aktiv' => true, 'tokens' => 0], $n['konten'])];
$GLOBALS['antworten']['rufname'] = static fn(array $n) => ['ok' => true, 'rufname' => $n['rufname']];

// ── Personen ─────────────────────────────────────────────────────────────────
$lehrer = pu_lernenden_anlegen('lehrkraft', 'Frau Lehrerin', 'geheim1234', 'lehrer');
$kind   = pu_lernenden_anlegen('nele', 'Nele Beispiel', 'geheim1234', 'schueler');
$papa   = pu_lernenden_anlegen('papa', 'Herr Beispiel', 'geheim1234', 'eltern');
$fremd  = pu_lernenden_anlegen('andere', 'Andere Mutter', 'geheim1234', 'eltern');
pu_db()->prepare('UPDATE lernende SET kind_von = ? WHERE id = ?')->execute([$kind, $papa]);
$person = static fn(int $id) => pu_gem_person($id);

function bild_png(int $b = 200, int $h = 150): string
{
    $g = imagecreatetruecolor($b, $h);
    imagefill($g, 0, 0, imagecolorallocate($g, 220, 90, 30));
    ob_start();
    imagepng($g);
    return (string)ob_get_clean();
}

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Synonym im Profil');

wirft('ein Vorname als Pseudonym geht nicht', fn() => pu_profil_setzen($kind, 'pseudonym', 'Nele'), 'echter Name');
wirft('der eigene Nachname auch nicht', fn() => pu_profil_setzen($kind, 'pseudonym', 'Beispiel99'), 'echter Name');
wirft('länger als 24 Zeichen nicht', fn() => pu_profil_setzen($kind, 'pseudonym', str_repeat('x', 25)));
gleich('ein ausgedachtes geht', 'Funkenflug', pu_profil_setzen($kind, 'pseudonym', 'Funkenflug'));
gleich('leer lassen geht (dann kein Beitrag)', '', pu_profil_setzen($lehrer, 'pseudonym', ''));

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Produkt einlegen');

$r = pu_produkt_anlegen($kind, 'Brüche mit Pizza von Nele', 'Erklärt Brüche.', ['prompt.md' => "# Brüche\nMit Pizza."], 'werkstatt');
pruefe('angelegt', $r['ok'], $r['grund'] ?? '');
$id = (int)$r['id'];
$p = pu_produkt($id);
gleich('Titel bereinigt', 'Brüche mit Pizza von xxx', $p['titel']);
gleich('aus der Werkstatt', 'werkstatt', $p['herkunft']);
pruefe('das Paket liegt neben der Test-Datenbank, nicht in data/', is_file($ablage . '/produkte/' . $id . '/paket.zip'));
gleich('es fehlen Bild, Kategorie und Mit-Siegel', ['bild', 'kategorie', 'siegel'], $p['fehlt']);
pruefe('noch nicht freischaltbar', !$p['freischaltbar']);
gleich('.env im Paket', 'paket_gesperrt', pu_produkt_anlegen($kind, 'X', '', ['a.md' => 'x', '.env' => 'A=1'])['grund'] ?? '');
gleich('Programm im Paket', 'paket_endung', pu_produkt_anlegen($kind, 'X', '', ['setup.exe' => 'MZ'])['grund'] ?? '');
gleich('Zip-Slip', 'paket_pfad', pu_produkt_anlegen($kind, 'X', '', ['../boese.md' => 'x'])['grund'] ?? '');
$r = pu_produkt_anlegen($kind, 'X', '', ['a.md' => 'Ruf an: 0151 23456789']);
gleich('Telefonnummer im Paket', 'paket_pii', $r['grund'] ?? '');
gleich('… mit Datei und Regel', ['a.md', 'telefon'], [$r['hart'][0]['datei'] ?? '', $r['hart'][0]['regel'] ?? '']);
$z = pu_gem_zip_lesen(pu_gem_zip_bauen(['a.md' => 'eins', 'sub/b.txt' => 'zwei']));
gleich('ein ZIP lässt sich einlegen und wieder lesen', ['a.md' => 'eins', 'sub/b.txt' => 'zwei'], $z['dateien'] ?? null);

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Bild und Kategorie');

wirft('SVG ist kein Bild', fn() => pu_produkt_bild($id, $kind, '<svg xmlns="http://www.w3.org/2000/svg"/>'), 'JPG');
wirft('zu klein', fn() => pu_produkt_bild($id, $kind, bild_png(20, 20)), 'Pixel');
wirft('fremdes Produkt', fn() => pu_produkt_bild($id, $papa, bild_png()), 'gibt es nicht');
pu_produkt_bild($id, $kind, bild_png());
pruefe('das Bild ist gesetzt', !in_array('bild', pu_produkt($id)['fehlt'], true));
pruefe('als data:-Adresse für die Vorschau', str_starts_with(pu_produkt_bild_daten($id), 'data:image/png;base64,'));
wirft('eine erfundene Kategorie', fn() => pu_produkt_aendern($id, $kind, ['art' => 'virus']), 'Kategorie');
$a = pu_produkt_aendern($id, $kind, ['titel' => 'Brüche mit Pizza', 'beschreibung' => 'Für die 6b, ruf 0151 2345678 an',
    'hauptfeld' => 'B', 'art' => 'prompt', 'zielgruppe' => 'schueler', 'medium' => 'text', 'lizenz' => 'CC-BY-4.0']);
gleich('die Beschreibung wird bereinigt gespeichert', 'Für die xxx, ruf xxx an', pu_produkt($id)['beschreibung']);
gleich('… und die Verbotsregeln kommen zurück', ['telefon', 'klasse'], array_column($a['regeln'], 'regel'));
gleich('jetzt fehlt nur das Mit-Siegel', ['siegel'], pu_produkt($id)['fehlt']);

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Mit-Siegel');

$liste = pu_produkte($person($lehrer), true);
gleich('die Lehrkraft sieht, was auf ihr Siegel wartet', [$id], array_column($liste['siegeln'], 'id'));
gleich('… mit dem Namen (der bleibt hier)', 'Nele Beispiel', $liste['siegeln'][0]['urheber'] ?? '');
gleich('fremde Eltern sehen nichts', [], pu_produkte($person($fremd), true)['siegeln']);
wirft('fremde Eltern können nicht siegeln', fn() => pu_produkt_siegeln($id, $person($fremd)), 'nicht gegenzeichnen');
wirft('das Kind sich selbst nicht', fn() => pu_produkt_siegeln($id, $person($kind)), 'nicht gegenzeichnen');
pu_produkt_siegeln($id, $person($papa));
pruefe('die eigenen Eltern können', (int)pu_produkt($id)['siegel_von'] === $papa);
pruefe('jetzt ist es freischaltbar', pu_produkt($id)['freischaltbar']);
pu_produkt_aendern($id, $kind, ['titel' => 'Brüche mit Pizza (neu)', 'hauptfeld' => 'B', 'art' => 'prompt',
    'zielgruppe' => 'schueler', 'medium' => 'text']);
gleich('wer danach den Titel ändert, braucht ein neues Siegel', ['siegel'], pu_produkt($id)['fehlt']);
pu_produkt_siegeln($id, $person($lehrer));

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Freischalten');

$GLOBALS['rufe'] = [];
$GLOBALS['antworten']['werk_hochladen'] = static fn(array $n) => ['ok' => true, 'id' => 'W-AAAAAAAAAAAAAAAA',
    'status' => 'wartet_auf_freigabe', 'vorpruefung' => 'unauffaellig'];
$r = pu_produkt_freischalten($id, $person($kind));
pruefe('hochgeladen', $r['ok'] === true, $r['text'] ?? '');
gleich('Konten und Synonym gehen vorher mit', ['konten', 'rufname', 'werk_hochladen'], array_column($GLOBALS['rufe'], 'zweck'));
$n = $GLOBALS['rufe'][2]['nutzlast'];
gleich('als Pseudonym, nie als Name', 'L-' . $kind, $n['konto']);
gleich('das Siegel als Pseudonym der Lehrkraft', 'L-' . $lehrer, $n['bestaetigt_durch']);
pruefe('minderjährig gemeldet', $n['minderjaehrig'] === true);
gleich('die Kategorie geht mit', ['B', 'prompt', 'schueler', 'text'], [$n['hauptfeld'], $n['art'], $n['zielgruppe'], $n['medium']]);
gleich('das Paket kommt heil an', ['prompt.md' => "# Brüche\nMit Pizza."], pu_gem_zip_lesen((string)base64_decode($n['paket']))['dateien'] ?? null);
pruefe('das Bild geht mit', str_starts_with((string)base64_decode($n['bild']), "\x89PNG"));
$alles = implode(' ', array_column($GLOBALS['rufe'], 'roh'));
pruefe('in keinem Ruf steht ein Name oder eine Kennung',
    !preg_match('/Nele Beispiel|Frau Lehrerin|Herr Beispiel|"nele"|"lehrkraft"|"papa"|0151/', $alles));
$p = pu_produkt($id);
gleich('wartet auf Freigabe, mit der Kennung vom Server', ['wartet_auf_freigabe', 'W-AAAAAAAAAAAAAAAA'], [$p['server_status'], $p['werk_id']]);
pruefe('nicht mehr bearbeitbar', !$p['bearbeitbar']);
wirft('Ändern nach dem Hochladen geht nicht', fn() => pu_produkt_aendern($id, $kind, ['titel' => 'x']), 'nicht mehr');
gleich('ein zweites Freischalten geht nicht', false, pu_produkt_freischalten($id, $person($kind))['ok']);

// Der Server lehnt ab — die Academy erfährt den Grund.
$GLOBALS['antworten']['meine_werke'] = static fn() => ['ok' => true, 'werke' => [
    ['id' => 'W-AAAAAAAAAAAAAAAA', 'status' => 'abgelehnt', 'ablehnung' => 'Bitte ein eigenes Bild nehmen.']]];
pu_produkte_abgleichen($person($kind));
$p = pu_produkt($id);
gleich('abgelehnt, mit Grund', ['abgelehnt', 'Bitte ein eigenes Bild nehmen.'], [$p['server_status'], $p['ablehnung']]);
pruefe('… und wieder bearbeitbar', $p['bearbeitbar']);

// Ohne Siegel lehnt schon die Academy ab.
$r2 = pu_produkt_anlegen($kind, 'Zweites', '', ['b.md' => 'Noch ein Prompt.']);
pu_produkt_bild((int)$r2['id'], $kind, bild_png());
pu_produkt_aendern((int)$r2['id'], $kind, ['titel' => 'Zweites', 'hauptfeld' => 'A', 'art' => 'skill', 'zielgruppe' => 'schueler', 'medium' => 'text']);
$GLOBALS['rufe'] = [];
$f = pu_produkt_freischalten((int)$r2['id'], $person($kind));
pruefe('ohne Mit-Siegel: nicht hochgeladen, mit Satz', !$f['ok'] && str_contains($f['text'], 'Mit-Siegel'));
gleich('… und nichts ging an den Server', [], $GLOBALS['rufe']);

// Erwachsene brauchen kein Siegel.
pu_profil_setzen($papa, 'pseudonym', 'Bergkristall');
$r3 = pu_produkt_anlegen($papa, 'Elternbrief-Vorlage', '', ['vorlage.md' => 'Liebe Eltern, …']);
pu_produkt_bild((int)$r3['id'], $papa, bild_png());
pu_produkt_aendern((int)$r3['id'], $papa, ['titel' => 'Elternbrief-Vorlage', 'hauptfeld' => 'C', 'art' => 'vorlage',
    'zielgruppe' => 'eltern', 'medium' => 'text']);
gleich('Eltern: ohne Siegel freischaltbar', [], pu_produkt((int)$r3['id'])['fehlt']);

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Kommentar');

$GLOBALS['rufe'] = [];
$GLOBALS['antworten']['kommentar'] = static fn(array $n) => ['ok' => true, 'id' => 7, 'text' => $n['text'], 'status' => 'sichtbar', 'regeln' => []];
$k = pu_gem_kommentar($person($kind), 'W-BBBBBBBBBBBBBBBB', 'Super! Ich heiße Nele, ruf an: 0151 23456789', null);
pruefe('angenommen', $k['ok'] === true);
$gesendet = end($GLOBALS['rufe'])['nutzlast']['text'];
gleich('schon in der Academy bereinigt, bevor es hinausgeht', 'Super! Ich heiße xxx, ruf an: xxx', $gesendet);
gleich('die Verbotsregeln kommen für die Anzeige zurück', ['telefon', 'name_satz', 'vorname'], array_column($k['regeln'], 'regel'));
gleich('leerer Kommentar geht nicht', false, pu_gem_kommentar($person($kind), 'W-BBBBBBBBBBBBBBBB', '   ', null)['ok']);

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Bild aus der Gemeinde, zwischengespeichert');

$GLOBALS['rufe'] = [];
$png = bild_png(100, 80);
$GLOBALS['antworten']['werk_datei'] = static fn() => ['ok' => true, 'typ' => 'png', 'inhalt' => base64_encode($png)];
$b1 = pu_gem_bild($person($kind), 'W-CCCCCCCCCCCCCCCC');
$b2 = pu_gem_bild($person($kind), 'W-CCCCCCCCCCCCCCCC');
gleich('dasselbe Bild zweimal', $b1, $b2);
gleich('… aber nur ein Ruf', 1, count($GLOBALS['rufe']));
gleich('eine krumme Kennung wird nicht gefragt', '', pu_gem_bild($person($kind), '../../etc'));

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Talente');

$GLOBALS['rufe'] = [];
$GLOBALS['antworten']['talente'] = static fn() => ['ok' => true, 'talente' => 18500, 'umwandelbar' => 18500,
    'monat_umgewandelt' => 0, 'deckel_monat' => 150000, 'woche' => '2026-W39', 'bestenliste' => []];
gleich('Stand vom Server', 18500, pu_gem_talente($person($kind))['talente'] ?? -1);
gleich('… mit dem Pseudonym gefragt', 'L-' . $kind, $GLOBALS['rufe'][0]['nutzlast']['konto'] ?? '');
$GLOBALS['antworten']['talente_abholen'] = static fn(array $n) => ['ok' => false, 'grund' => 'nichts_umwandelbar'];
$r = pu_gem_talente_abholen($person($kind));
pruefe('nichts umwandelbar: ein Satz dazu', !$r['ok'] && str_contains($r['text'], 'Monatsdeckel'));
$GLOBALS['rufe'] = [];
$GLOBALS['antworten']['talente_abholen'] = static fn(array $n) => ['ok' => true, 'beleg' => ['talente' => $n['menge'] ?? 18500]];
gleich('mit Menge', 500, pu_gem_talente_abholen($person($kind), 500)['beleg']['talente'] ?? 0);
gleich('… ein einziger Ruf (keine Wiederholung bei Geld)', 1, count($GLOBALS['rufe']));

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Löschen');

pu_produkt_loeschen((int)$r2['id'], $kind);
pruefe('der Ordner ist weg', !is_dir($ablage . '/produkte/' . (int)$r2['id']));
wirft('ein fremdes Produkt löscht man nicht', fn() => pu_produkt_loeschen($id, $papa), 'gibt es nicht');

bilanz();
