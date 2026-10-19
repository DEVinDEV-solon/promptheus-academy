<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Token senden, Tokenbuch und Token-Gutscheine mit QR-Code.
 *
 * Geprüft wird vor allem, was NICHT gehen darf: einen Gutschein ohne Deckung
 * ausstellen, ihn zweimal einlösen, mit der falschen Ebene einlösen, ihn nach
 * dem Einlösen noch widerrufen. Und dass jede Buchung im Tokenbuch Woher und
 * Wohin trägt.
 *
 * Aufruf:
 *     php -d extension=pdo_sqlite -d extension=sqlite3 -d extension=mbstring tests/codes_test.php
 */

require_once __DIR__ . '/hilfe.php';
$db_datei = test_db_vorbereiten();
register_shutdown_function(static fn() => @unlink($db_datei));

require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../srv/db.php';
require_once __DIR__ . '/../srv/rechte.php';
require_once __DIR__ . '/../srv/lernende.php';
require_once __DIR__ . '/../srv/profil.php';
require_once __DIR__ . '/../srv/abo.php';
require_once __DIR__ . '/../srv/codes.php';

$chef    = pu_lernenden_anlegen('chef', 'Chef', 'geheim1234', 'admin');
$schule  = pu_lernenden_anlegen('sekretariat', 'Sekretariat', 'geheim1234', 'verwaltung');
$lehrerA = pu_lernenden_anlegen('lehrera', 'Lehrkraft A', 'geheim1234', 'lehrer');
$lehrerB = pu_lernenden_anlegen('lehrerb', 'Lehrkraft B', 'geheim1234', 'lehrer');
$ana     = pu_lernenden_anlegen('ana', 'Ana Klarname', 'geheim1234', 'schueler', '7a');
$ben     = pu_lernenden_anlegen('ben', 'Ben', 'geheim1234', 'schueler', '7b');
$mama    = pu_lernenden_anlegen('mama', 'Mama', 'geheim1234', 'eltern');
$papa    = pu_lernenden_anlegen('papa', 'Papa', 'geheim1234', 'eltern', '7a');
$extern  = pu_lernenden_anlegen('extern', 'Extern', 'geheim1234', 'schueler', '7a');

foreach ([$schule, $lehrerA, $lehrerB, $ana, $ben, $mama, $papa] as $w) {
    pu_profil_setzen($w, 'schule', 'Gesamtschule Am Hangweg');
}
pu_profil_setzen($extern, 'schule', 'Andere Schule');
pu_profil_kind_setzen($mama, $ana);   // Mama → Ana (7a)
pu_profil_kind_setzen($papa, $ben);   // Papa → Ben (7b), auch wenn bei ihm „7a" steht
pu_db()->prepare('UPDATE lernende SET pseudonym = ? WHERE id = ?')->execute(['Eule_K7R2M', $ana]);

$ids = static fn(array $l) => array_map('intval', array_column($l, 'id'));

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Schema');
gleich('Stand 14', 14, (int)pu_db()->query('PRAGMA user_version')->fetchColumn());
$sp = array_column(pu_db()->query('PRAGMA table_info(token_buchungen)')->fetchAll(), 'name');
pruefe('Buchung hat Gegenkonto und Beleg', in_array('gegen', $sp, true) && in_array('beleg', $sp, true));

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Token senden: die Lehrkraft erreicht nur ihre Klassen');

gleich('ohne Klasse: niemand', [], pu_talente_empfaenger($lehrerA));
pu_lehrer_gruppen_setzen($lehrerA, '7a', $schule);
$a = $ids(pu_talente_empfaenger($lehrerA));
sort($a);
$soll = [$ana, $extern, $mama];
sort($soll);
gleich('Klasse 7a: Ana, Extern (7a) und Anas Mutter', $soll, $a);
pruefe('… nicht Ben aus der 7b', !in_array($ben, $a, true));
pruefe('… nicht Bens Vater, auch wenn bei ihm „7a" steht', !in_array($papa, $a, true));
pruefe('… nicht Lehrkraft B', !in_array($lehrerB, $a, true));
$s = $ids(pu_talente_empfaenger($schule));
pruefe('die Schule erreicht Lehrkräfte', in_array($lehrerA, $s, true) && in_array($lehrerB, $s, true));
pruefe('… aber keine fremde Schule', !in_array($extern, $s, true));
$namen = array_column(pu_talente_empfaenger($lehrerA), 'name', 'id');
gleich('in der Liste steht das Pseudonym, nicht der Klarname', 'Eule_K7R2M', $namen[$ana] ?? null);

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Tokenbuch: woher und wohin');

pu_token_gutschreiben($schule, 100000, 'Start für die Probe', $chef);
pu_talente_senden($schule, $lehrerA, 40000, 'Für die 7a');
pu_talente_senden($lehrerA, $ana, 5000, 'Projektwoche');

$buch = pu_tokenbuch($lehrerA);
gleich('eigenes Buch', 'eigen', $buch['umfang']);
$ein = array_values(array_filter($buch['buchungen'], fn($b) => $b['art'] === 'talent_ein'))[0] ?? null;
gleich('Eingang: von der Schule', 'Sekretariat', $ein['von']['name'] ?? null);
pruefe('… an mich', ($ein['an']['du'] ?? false) === true);
$aus = array_values(array_filter($buch['buchungen'], fn($b) => $b['art'] === 'talent_aus'))[0] ?? null;
pruefe('Ausgang: von mich', ($aus['von']['du'] ?? false) === true);
gleich('… an Ana unter ihrem Pseudonym', 'Eule_K7R2M', $aus['an']['name'] ?? null);
gleich('… mit dem Betrag', -5000, $aus['tokens'] ?? null);
$g = pu_db()->query("SELECT gegen FROM token_buchungen WHERE art = 'talent_aus' AND lernender = $lehrerA")->fetchColumn();
gleich('das Gegenkonto steht als Nummer an der Buchung', $ana, (int)$g);

$schulbuch = pu_tokenbuch($schule, true);
gleich('Schulbuch', 'schule', $schulbuch['umfang']);
$arten = array_count_values(array_column($schulbuch['buchungen'], 'art'));
pruefe('die Schule sieht auch die Überweisung der Lehrkraft an Ana',
       count(array_filter($schulbuch['buchungen'], fn($b) => $b['art'] === 'talent_ein' && $b['an']['name'] === 'Eule_K7R2M')) === 1);
pu_token_verbrauchen($ana, 'Tutor: Lektion 1', 300);
pruefe('… aber nicht Anas Verbrauch',
       count(array_filter(pu_tokenbuch($schule, true)['buchungen'], fn($b) => $b['art'] === 'verbrauch')) === 0);
$v = array_values(array_filter(pu_tokenbuch($ana)['buchungen'], fn($b) => $b['art'] === 'verbrauch'))[0] ?? null;
gleich('Verbrauch: wohin = Tutor', 'Tutor', $v['an']['name'] ?? null);

// Alte Überweisung ohne Gegenkonto: der Name kommt aus dem Text.
pu_token_eintragen($ben, 0, 'talent_ein', 'Von Oma — Geburtstag', 1000);
$alt = array_values(array_filter(pu_tokenbuch($ben)['buchungen'], fn($b) => $b['art'] === 'talent_ein'))[0] ?? null;
gleich('alte Buchung: Absender aus dem Text', 'Oma', $alt['von']['name'] ?? null);

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Gutscheine ausstellen');

gleich('Lehrkraft stellt für Eltern und Schüler aus', ['eltern', 'schueler'], pu_code_zielebenen($lehrerA));
gleich('Schüler für niemanden', [], pu_code_zielebenen($ana));
$vorher = pu_token_stand($lehrerA)['rest'];
gleich('Lehrkraft A: Testzugang + 40.000 von der Schule − 5.000 an Ana', PU_PROBE_TOKEN + 35000, $vorher);
$zuViel = intdiv($vorher, 50) + 100;   // 50 Gutscheine, zusammen mehr als da ist

wirft('nicht für die eigene Ebene', fn() => pu_codes_ausstellen($lehrerA, 1, 1000, 'lehrer'), 'Ebene');
wirft('nicht nach oben', fn() => pu_codes_ausstellen($lehrerA, 1, 1000, 'verwaltung'), 'Ebene');
wirft('nicht mehr als 50', fn() => pu_codes_ausstellen($lehrerA, 51, 100, 'eltern'), '50');
wirft('nicht unter dem Mindestbetrag', fn() => pu_codes_ausstellen($lehrerA, 1, 10, 'eltern'), 'Token');
wirft('nicht ohne Deckung', fn() => pu_codes_ausstellen($lehrerA, 50, $zuViel, 'eltern'), 'reicht dein Guthaben nicht');
gleich('… und dann ist nichts reserviert', $vorher, pu_token_stand($lehrerA)['rest']);
gleich('… und kein Gutschein angelegt', 0, (int)pu_db()->query('SELECT COUNT(*) FROM token_codes')->fetchColumn());

$erg = pu_codes_ausstellen($lehrerA, 6, 5000, 'eltern', 'Elternabend <b>7a</b>');
gleich('sechs Gutscheine', 6, count($erg['codes']));
gleich('Summe 30.000', 30000, $erg['summe']);
gleich('beim Ausstellen reserviert', $vorher - 30000, pu_token_stand($lehrerA)['rest']);
gleich('kein Verbrauch', 0, pu_token_stand($lehrerA)['verbraucht']);
$c = $erg['codes'][0];
pruefe('Code-Form ABCD-EFGH-JKLM', (bool)preg_match('/^[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$/', $c['code']), $c['code']);
gleich('Notiz ohne HTML', 'Elternabend 7a', $c['notiz']);
gleich('Link zur Elternseite, ohne Code', 'https://promptheus-academy.de/eltern.php', $c['link']);
gleich('offen', 'offen', $c['zustand']);
gleich('gültig genau 7 Tage', date('Y-m-d', strtotime('+7 days')), $c['gueltig_bis']);
gleich('alle Codes verschieden', 6, count(array_unique(array_column($erg['codes'], 'code'))));
$prot = (string)pu_db()->query("SELECT notiz FROM protokoll WHERE aktion = 'codes_ausgestellt' ORDER BY id DESC LIMIT 1")->fetchColumn();
pruefe('im Protokoll', str_contains($prot, '6 × 5000'), $prot);
pruefe('… ohne einen Code im Klartext', !str_contains($prot, $c['code']));
gleich('30.000 reserviert', 30000, pu_codes_ausgabe($lehrerA)['reserviert']);

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Gutscheine einlösen');

gleich('Normalform: klein und ohne Striche geht', $c['code'], pu_code_normalisieren(strtolower(str_replace('-', ' ', $c['code']))));
gleich('falsche Länge ergibt nichts', '', pu_code_normalisieren('ABC'));
gleich('verbotene Zeichen (0, O, 1, I) ergeben nichts', '', pu_code_normalisieren('0000-OOOO-1111'));

wirft('mit der falschen Ebene nicht (Schüler statt Eltern)', fn() => pu_code_einloesen($ana, $c['code']), 'Eltern');
wirft('den eigenen nicht', fn() => pu_code_einloesen($lehrerA, $c['code']), 'eigenen');
wirft('einen unbekannten nicht', fn() => pu_code_einloesen($mama, 'ABCD-EFGH-JKLM'), 'kennt diese Academy nicht');

$vorherMama = pu_token_stand($mama)['rest'];
$e = pu_code_einloesen($mama, strtolower($c['code']));
gleich('Mama bekommt 5.000', $vorherMama + 5000, pu_token_stand($mama)['rest']);
gleich('… von Lehrkraft A', 'Lehrkraft A', $e['von']);
gleich('beim Aussteller ändert sich nichts mehr', $vorher - 30000, pu_token_stand($lehrerA)['rest']);
wirft('kein zweites Mal', fn() => pu_code_einloesen($papa, $c['code']), 'schon eingelöst');
wirft('eingelöst lässt sich nicht widerrufen', fn() => pu_code_widerrufen($lehrerA, $c['id']), 'eingelöst');

$liste = array_column(pu_codes_liste($lehrerA), null, 'id');
gleich('Liste: eingelöst', 'eingeloest', $liste[$c['id']]['zustand']);
gleich('… von Mama', 'Mama', $liste[$c['id']]['eingeloest_von']);

$buch = pu_tokenbuch($lehrerA)['buchungen'];
$zeile = array_values(array_filter($buch, fn($b) => $b['art'] === 'code_aus' && str_contains($b['wofuer'], substr($c['code'], -4))))[0] ?? null;
gleich('Tokenbuch des Ausstellers: an wen eingelöst', 'Mama', $zeile['an']['name'] ?? null);
pruefe('… mit Zeitpunkt', str_starts_with((string)($zeile['status'] ?? ''), 'eingelöst 20'), (string)($zeile['status'] ?? ''));
$mb = array_values(array_filter(pu_tokenbuch($mama)['buchungen'], fn($b) => $b['art'] === 'code_ein'))[0] ?? null;
gleich('Tokenbuch der Mutter: von Lehrkraft A', 'Lehrkraft A', $mb['von']['name'] ?? null);
gleich('… den Code sieht sie nur gekürzt', 'Gutschein …' . substr($c['code'], -4), $mb['status'] ?? null);
$sb = array_values(array_filter(pu_tokenbuch($schule, true)['buchungen'], fn($b) => $b['art'] === 'code_ein'))[0] ?? null;
pruefe('die Schule sieht das Einlösen', $sb !== null && $sb['von']['name'] === 'Lehrkraft A' && $sb['an']['name'] === 'Mama');

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Widerruf und Ablauf');

$zwei = $erg['codes'][1];
wirft('fremde nicht widerrufen', fn() => pu_code_widerrufen($schule, $zwei['id']), 'nicht ausgestellt');
$r0 = pu_token_stand($lehrerA)['rest'];
pu_code_widerrufen($lehrerA, $zwei['id']);
gleich('Widerruf bucht zurück', $r0 + 5000, pu_token_stand($lehrerA)['rest']);
wirft('… danach nicht einlösbar', fn() => pu_code_einloesen($papa, $zwei['code']), 'gilt nicht mehr');
wirft('… und nicht zweimal zurück', fn() => pu_code_widerrufen($lehrerA, $zwei['id']), 'zurückgebucht');

$drei = $erg['codes'][2];
pu_db()->prepare('UPDATE token_codes SET gueltig_bis = ? WHERE id = ?')->execute(['2020-01-01', $drei['id']]);
$r1 = pu_token_stand($lehrerA)['rest'];
wirft('abgelaufen nicht einlösbar', fn() => pu_code_einloesen($papa, $drei['code']), 'abgelaufen');
gleich('… und von selbst zurückgebucht', $r1 + 5000, pu_token_stand($lehrerA)['rest']);
gleich('verfallen bucht nichts doppelt', 0, pu_codes_verfallen());

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Raten wird gebremst');

for ($i = 0; $i < PU_CODE_FEHLVERSUCHE - 1; $i++) {
    try { pu_code_einloesen($papa, 'ZZZZ-ZZZZ-ZZZ' . PU_CODE_ZEICHEN[$i]); } catch (Throwable $t) {}
}
$vier = $erg['codes'][3];
wirft('nach zehn Fehlversuchen ist Pause, auch für einen echten Code',
      fn() => pu_code_einloesen($papa, $vier['code']), 'Zu viele');
pruefe('der echte Code ist danach noch offen',
       array_column(pu_codes_liste($lehrerA), 'zustand', 'id')[$vier['id']] === 'offen');

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Rechte');

$r = array_column(PU_RECHTE, null, 'name');
gleich('Ausstellen: Schule ja, Lehrkraft ja, Eltern nein, Schüler nein', [1, 1, 0, 0],
       array_values(array_intersect_key($r['codes.ausstellen']['vorgabe'], array_flip(['verwaltung', 'lehrer', 'eltern', 'schueler']))));
gleich('Einlösen: alle', [1, 1, 1, 1],
       array_values(array_intersect_key($r['codes.einloesen']['vorgabe'], array_flip(['verwaltung', 'lehrer', 'eltern', 'schueler']))));
gleich('Schulbuch: nur die Schulleitung', [1, 0, 0, 0],
       array_values(array_intersect_key($r['tokenbuch.schule']['vorgabe'], array_flip(['verwaltung', 'lehrer', 'eltern', 'schueler']))));

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Erklärstücke neben den Knöpfen');

require_once __DIR__ . '/../srv/medien.php';
$probe = 'tests/_hoerprobe_' . getmypid();
@mkdir(PU_ROOT . '/' . $probe, 0777, true);
foreach (['token-senden_schule', 'token-senden_lehrer', 'token-senden_eltern',
          'einloesen_alle', 'tokenbuch_schule'] as $n) {
    file_put_contents(PU_ROOT . "/$probe/$n.mp3", 'x');
}
$fuer = static fn(int $id) => pu_cockpit_hoer(pu_profil($id), $probe);

gleich('Schulleitung: ihre Fassung', $probe . '/token-senden_schule.mp3', $fuer($schule)['token-senden'] ?? null);
gleich('Lehrkraft: ihre Fassung', $probe . '/token-senden_lehrer.mp3', $fuer($lehrerA)['token-senden'] ?? null);
gleich('Eltern: ihre Fassung', $probe . '/token-senden_eltern.mp3', $fuer($mama)['token-senden'] ?? null);
gleich('Ebene 1 hört die Fassung der Schulleitung', $probe . '/token-senden_schule.mp3', $fuer($chef)['token-senden'] ?? null);
gleich('ohne eigene Fassung: die für alle', $probe . '/einloesen_alle.mp3', $fuer($ana)['einloesen'] ?? null);
pruefe('Schüler: keine Fassung zum Senden, also kein Knopf', !isset($fuer($ana)['token-senden']));
pruefe('fehlt die Aufnahme, fehlt der Knopf', !isset($fuer($lehrerA)['tokenbuch']) && !isset($fuer($lehrerA)['gutscheine']));

foreach (glob(PU_ROOT . "/$probe/*.mp3") ?: [] as $f) @unlink($f);
@rmdir(PU_ROOT . '/' . $probe);
gleich('ohne Medienpaket: gar keine', [], pu_cockpit_hoer(pu_profil($schule), $probe));

// ─────────────────────────────────────────────────────────────────────────────
gruppe('QR-Code: Bit für Bit gegen eine zweite Umsetzung');

$node = trim((string)shell_exec(PHP_OS_FAMILY === 'Windows' ? 'where node 2>NUL' : 'command -v node 2>/dev/null'));
$node = trim(explode("\n", $node)[0]);
$ref = '';
if ($node !== '') {
    // Die Referenz liefert npm selbst mit (qrcode-terminal). Sie wird nur
    // gelesen, nie ausgeliefert.
    $kandidat = dirname($node) . '/node_modules/npm/node_modules/qrcode-terminal/vendor/QRCode';
    if (is_file($kandidat . '/index.js')) $ref = $kandidat;
}
if ($ref === '') {
    echo "   (Node oder die Referenz fehlt — der QR-Vergleich wird übersprungen)\n";
} else {
    $aus = shell_exec('node ' . escapeshellarg(__DIR__ . '/qr_js_pruefen.js') . ' ' . escapeshellarg($ref) . ' 2>&1');
    $js = json_decode((string)$aus, true);
    pruefe('qr.js stimmt mit der Referenz überein', is_array($js) && $js['ok'] === true, mb_substr((string)$aus, 0, 300));
    pruefe('… in über tausend Fällen', is_array($js) && $js['geprueft'] > 1000, (string)($js['geprueft'] ?? ''));
}

bilanz();
