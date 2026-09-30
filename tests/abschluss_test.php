<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Abschluss-Urkunde nach allen sechs Stufen (srv/abschluss.php).
 *
 * Geprüft wird vor allem, was **nicht** gehen darf: eine Urkunde vor der
 * sechsten Stufe, ein zweiter Name im selben Durchgang, ein Name im Klartext
 * in der Datenbank, ein Name in der öffentlichen Prüfung, ein umkopierter
 * Name, ein fremder Blick — und der Blick von Ebene 1.
 *
 * Aufruf:
 *     php -d extension=sodium -d extension=pdo_sqlite tests/abschluss_test.php
 */

require_once __DIR__ . '/hilfe.php';
$dbDatei = test_db_vorbereiten();
$ordner  = sys_get_temp_dir() . '/pu_abschluss_' . bin2hex(random_bytes(6));
putenv('PU_TEST_URKUNDEN=' . $ordner);

require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../srv/db.php';
require_once __DIR__ . '/../srv/rechte.php';
require_once __DIR__ . '/../srv/lernende.php';
require_once __DIR__ . '/../srv/zertifikat.php';
require_once __DIR__ . '/../srv/abschluss.php';

const VORLAGE = '01_schlicht/klar';

register_shutdown_function(static function () use ($dbDatei, $ordner) {
    foreach ([$dbDatei, $dbDatei . '-wal', $dbDatei . '-shm'] as $f) @unlink($f);
    foreach (glob($ordner . '/*') ?: [] as $f) @unlink($f);
    @rmdir($ordner);
});

if (!function_exists('sodium_crypto_secretbox')) {
    echo "\nsodium fehlt — Aufruf mit  -d extension=sodium\n";
    exit(2);
}

/** Legt ein Konto an und setzt Schule und Eltern-Verknüpfung direkt. */
function konto(string $kennung, string $rolle, string $schule = '', int $kind = 0): array
{
    $id = pu_lernenden_anlegen($kennung, ucfirst($kennung), 'geheim12345', $rolle);
    pu_db()->prepare('UPDATE lernende SET rolle = ?, schule = ?, kind_von = ? WHERE id = ?')
           ->execute([$rolle, $schule, $kind, $id]);
    $st = pu_db()->prepare('SELECT * FROM lernende WHERE id = ?');
    $st->execute([$id]);
    return $st->fetch();
}

/** Trägt eine bestandene Prüfung ein — `$abstand` Sekunden in der Zukunft. */
function bestehen(int $l, int $stufe, int $abstand = 0): void
{
    pu_db()->prepare('INSERT INTO pruefungen (lernender, stufe, punkte, max_punkte, bestanden, zeitpunkt)
                      VALUES (?,?,?,?,1,?)')
           ->execute([$l, $stufe, 90 + $stufe, 100, date('Y-m-d H:i:s', time() + $abstand)]);
}

$lisa = konto('lisa', 'schueler', 'Musterschule');
$L    = (int)$lisa['id'];

// ================================================================ Vor dem Abschluss
gruppe('Vor der sechsten Stufe');
for ($s = 1; $s <= 5; $s++) bestehen($L, $s);
$st = pu_abschluss_stand($L);
pruefe('fünf Stufen: noch nicht fällig', !$st['faellig']);
gleich('Durchgang 1', 1, $st['durchgang']);
wirft('keine Urkunde vor der sechsten Stufe',
      fn() => pu_abschluss_ausstellen($L, 'Lisa', 'Muster', 'Lisa Muster', VORLAGE), 'alle sechs');

// ================================================================ Ausstellen
gruppe('Ausstellen');
bestehen($L, 6);
pruefe('sechs Stufen: fällig', pu_abschluss_stand($L)['faellig']);

wirft('Bestätigung muss übereinstimmen',
      fn() => pu_abschluss_ausstellen($L, 'Lisa', 'Muster', 'Lisa Mustr', VORLAGE), 'Bestätigung');
wirft('keine Ziffern im Namen',
      fn() => pu_abschluss_ausstellen($L, 'L1sa', 'Muster', 'L1sa Muster', VORLAGE), 'Buchstaben');
wirft('kein Markup im Namen',
      fn() => pu_abschluss_ausstellen($L, '<b>Lisa', 'Muster', '<b>Lisa Muster', VORLAGE), 'Buchstaben');
wirft('leerer Nachname wird abgewiesen',
      fn() => pu_abschluss_ausstellen($L, 'Lisa', '  ', 'Lisa', VORLAGE), 'Nachname');

$u1 = pu_abschluss_ausstellen($L, '  Anna-Lena ', "O'Brien  Müller", "Anna-Lena O'Brien Müller", VORLAGE);
pruefe('Prüfcode hat die Form PU-A-…', (bool)preg_match('/^PU-A-[A-Z2-9]{8}$/', $u1['pruefcode']));
gleich('erster Durchgang', 1, $u1['durchgang']);
pruefe('Konto-Hash hat die Form KH-…', (bool)preg_match('/^KH-[A-Z2-7]{16}$/', $u1['konto_hash']));
pruefe('Schlüsseldatei liegt im Testordner', is_file($ordner . '/abschluss.key'));

// ================================================================ Nur ein Name je Durchgang
gruppe('Ein Name je Durchgang');
wirft('zweite Urkunde mit anderem Namen wird abgewiesen',
      fn() => pu_abschluss_ausstellen($L, 'Erika', 'Anders', 'Erika Anders', VORLAGE), 'schon eine');
wirft('auch mit demselben Namen keine zweite',
      fn() => pu_abschluss_ausstellen($L, 'Anna-Lena', "O'Brien Müller", "Anna-Lena O'Brien Müller", VORLAGE));
wirft('die Datenbank selbst verweigert den zweiten Eintrag', function () use ($L) {
    pu_db()->prepare("INSERT INTO abschluesse (pruefcode, lernender, durchgang, konto_hash,
                        vorname_geheim, nachname_geheim, siegel, ausgestellt)
                      VALUES ('PU-A-ZZZZZZZZ', ?, 1, 'x', 'x', 'x', 'x', 'x')")->execute([$L]);
}, 'UNIQUE');
gleich('genau eine Urkunde', 1, count(pu_abschluesse($L)));

// ================================================================ Verschlüsselt, ohne Namen nach aussen
gruppe('Datenschutz');
$roh = json_encode(pu_db()->query('SELECT * FROM abschluesse')->fetchAll(), JSON_UNESCAPED_UNICODE);
pruefe('Vorname steht nicht im Klartext in der Datenbank', !str_contains($roh, 'Anna'));
pruefe('Nachname steht nicht im Klartext in der Datenbank', !str_contains($roh, 'Müller'));
$prot = json_encode(pu_db()->query('SELECT * FROM protokoll')->fetchAll(), JSON_UNESCAPED_UNICODE);
pruefe('das Protokoll nennt den Namen nicht', !str_contains($prot, 'Anna') && !str_contains($prot, 'Müller'));

$p = pu_urkunde_pruefen(strtolower($u1['pruefcode']));
pruefe('öffentliche Prüfung findet sie', $p['gefunden'] && $p['gueltig']);
gleich('Art ist abschluss', 'abschluss', $p['art']);
gleich('Konto-Hash in der Prüfung', $u1['konto_hash'], $p['konto_hash']);
$pj = json_encode($p, JSON_UNESCAPED_UNICODE);
pruefe('die Auskunft nennt KEINEN Namen', !str_contains($pj, 'Anna') && !str_contains($pj, 'Müller'));
pruefe('die Auskunft nennt keine Kennung', !str_contains($pj, 'lisa'));
pruefe('unbekannter PU-A-Code nicht gefunden', !pu_urkunde_pruefen('PU-A-AAAAAAAA')['gefunden']);

$html = pu_abschluss_html($u1['pruefcode'], $lisa);
pruefe('die Urkunde trägt den Namen', str_contains((string)$html, 'Anna-Lena O&#039;Brien Müller'),
       'doppelte Leerzeichen zusammengezogen, Apostroph escaped');
pruefe('die Urkunde trägt den Konto-Hash', str_contains((string)$html, $u1['konto_hash']));
pruefe('keine offenen Platzhalter', !str_contains((string)$html, '{{'));

gleich('Vorschlag für den nächsten Durchgang: Vorname', 'Anna-Lena', pu_abschluss_stand($L)['vorschlag']['vorname']);

// ================================================================ Manipulation
gruppe('Siegel');
$erika = konto('erika', 'schueler', 'Musterschule');
$E = (int)$erika['id'];
for ($s = 1; $s <= 6; $s++) bestehen($E, $s);
$u2 = pu_abschluss_ausstellen($E, 'Erika', 'Beispiel', 'Erika Beispiel', VORLAGE);

// Erikas verschlüsselten Namen in Lisas Zeile kopieren.
$st = pu_db()->prepare('SELECT vorname_geheim, nachname_geheim FROM abschluesse WHERE pruefcode = ?');
$st->execute([$u2['pruefcode']]);
$fremd = $st->fetch();
$st->execute([$u1['pruefcode']]);
$echt = $st->fetch();
pu_db()->prepare('UPDATE abschluesse SET vorname_geheim = ?, nachname_geheim = ? WHERE pruefcode = ?')
       ->execute([$fremd['vorname_geheim'], $fremd['nachname_geheim'], $u1['pruefcode']]);
$a = pu_abschluss_lesen($u1['pruefcode']);
pruefe('umkopierter Name bricht das Siegel', !$a['siegel_ok']);
pruefe('ohne Siegel kein Name', $a['name'] === null);
pruefe('öffentliche Prüfung meldet ungültig', !pu_urkunde_pruefen($u1['pruefcode'])['gueltig']);
pruefe('statt Urkunde die Meldung „Siegel gebrochen"',
       str_contains((string)pu_abschluss_html($u1['pruefcode'], $lisa), 'Siegel gebrochen'));

pu_db()->prepare('UPDATE abschluesse SET vorname_geheim = ?, nachname_geheim = ? WHERE pruefcode = ?')
       ->execute([$echt['vorname_geheim'], $echt['nachname_geheim'], $u1['pruefcode']]);
pruefe('zurückgesetzt: Siegel wieder heil', pu_abschluss_lesen($u1['pruefcode'])['siegel_ok']);

// Auf Erika umhängen verweigert schon UNIQUE (sie hat Durchgang 1) — also
// auf ein drittes Konto ohne Urkunde.
$max = konto('max', 'schueler', 'Musterschule');
pu_db()->prepare('UPDATE abschluesse SET lernender = ? WHERE pruefcode = ?')->execute([(int)$max['id'], $u1['pruefcode']]);
pruefe('auf ein anderes Konto umgehängt: Siegel gebrochen', !pu_abschluss_lesen($u1['pruefcode'])['siegel_ok']);
pu_db()->prepare('UPDATE abschluesse SET lernender = ? WHERE pruefcode = ?')->execute([$L, $u1['pruefcode']]);

// ================================================================ Neuer Durchgang
gruppe('Neuer Durchgang, neuer Name');
for ($s = 1; $s <= 5; $s++) bestehen($L, $s, 5);
$st = pu_abschluss_stand($L);
gleich('Durchgang 2 läuft', 2, $st['durchgang']);
pruefe('fünf neue Stufen reichen nicht', !$st['faellig']);
gleich('fünf Stufen im neuen Durchgang gezählt', 5, count($st['stufen']));
bestehen($L, 6, 5);
pruefe('sechs neue Stufen: fällig', pu_abschluss_stand($L)['faellig']);

$u3 = pu_abschluss_ausstellen($L, 'Anna-Lena', 'Schmidt', 'Anna-Lena Schmidt', VORLAGE);
gleich('zweiter Durchgang', 2, $u3['durchgang']);
gleich('derselbe Konto-Hash', $u1['konto_hash'], $u3['konto_hash']);
pruefe('neue Urkunde trägt den neuen Namen',
       str_contains((string)pu_abschluss_html($u3['pruefcode'], $lisa), 'Anna-Lena Schmidt'));
pruefe('alte Urkunde bleibt beim alten Namen',
       str_contains((string)pu_abschluss_html($u1['pruefcode'], $lisa), 'Müller'));
wirft('auch im zweiten Durchgang kein zweiter Name',
      fn() => pu_abschluss_ausstellen($L, 'Anna', 'Meier', 'Anna Meier', VORLAGE), 'schon eine');

// ================================================================ Wer darf öffnen
gruppe('Wer darf öffnen und drucken');
$lehrer  = konto('lehrer', 'lehrer', 'Musterschule');
$fremdL  = konto('fremdlehrer', 'lehrer', 'Andere Schule');
$schule  = konto('direktion', 'verwaltung', 'Musterschule');
$eltern  = konto('mama', 'eltern', 'Musterschule', $L);
$fremdE  = konto('papa', 'eltern', 'Musterschule', $E);
$admin   = konto('betreiber', 'admin');

pruefe('der Lernende selbst',              pu_abschluss_darf_sehen($lisa, $L));
pruefe('Mitschülerin nicht',               !pu_abschluss_darf_sehen($erika, $L));
pruefe('Lehrkraft derselben Schule',       pu_abschluss_darf_sehen($lehrer, $L));
pruefe('Lehrkraft einer anderen Schule nicht', !pu_abschluss_darf_sehen($fremdL, $L));
pruefe('Schulverwaltung derselben Schule', pu_abschluss_darf_sehen($schule, $L));
pruefe('Eltern des Kindes',                pu_abschluss_darf_sehen($eltern, $L));
pruefe('Eltern eines anderen Kindes nicht', !pu_abschluss_darf_sehen($fremdE, $L));
pruefe('Ebene 1 (Administrator) nicht',    !pu_abschluss_darf_sehen($admin, $L));
wirft('Admin bekommt die Urkunde nicht',   fn() => pu_abschluss_html($u1['pruefcode'], $admin), 'nicht öffnen');

$liste = array_column(pu_abschluesse_umkreis($eltern), 'pruefcode');
pruefe('Eltern sehen beide Urkunden ihres Kindes', in_array($u1['pruefcode'], $liste, true)
       && in_array($u3['pruefcode'], $liste, true));
pruefe('Eltern sehen nicht die eines fremden Kindes', !in_array($u2['pruefcode'], $liste, true));
pruefe('die Liste nennt keinen echten Namen',
       !str_contains(json_encode(pu_abschluesse_umkreis($schule), JSON_UNESCAPED_UNICODE), 'Schmidt'));
gleich('Admin: leere Liste', [], pu_abschluesse_umkreis($admin));

$vorher = (int)pu_db()->query("SELECT COUNT(*) FROM protokoll WHERE aktion = 'abschluss_abruf'")->fetchColumn();
pu_abschluss_html($u1['pruefcode'], $lehrer);
$nachher = (int)pu_db()->query("SELECT COUNT(*) FROM protokoll WHERE aktion = 'abschluss_abruf'")->fetchColumn();
gleich('ein fremder Abruf wird protokolliert', $vorher + 1, $nachher);

// Familien-Registrierung: Eltern sehen die Kinderkonten, die sie freigeschaltet haben.
$GLOBALS['PU_TEST_ART'] = 'eltern';
$elternOhne = konto('oma', 'eltern', '', 0);
pruefe('Familie: Eltern sehen jedes Kinderkonto', pu_abschluss_darf_sehen($elternOhne, $E));
$GLOBALS['PU_TEST_ART'] = 'betreiber';

// ================================================================ Widerruf
gruppe('Widerruf');
pruefe('Widerruf greift', pu_urkunde_widerrufen($u3['pruefcode'], (int)$schule['id']));
pruefe('danach ungültig', !pu_urkunde_pruefen($u3['pruefcode'])['gueltig']);
pruefe('der Durchgang bleibt verbraucht', !pu_abschluss_stand($L)['faellig']);
pruefe('zweiter Widerruf tut nichts', !pu_urkunde_widerrufen($u3['pruefcode'], (int)$schule['id']));

// ================================================================ Vorlagen
gruppe('Vorlagen');
$gruppen = pu_urkunden_varianten();
gleich('drei Gruppen', ['01_schlicht', '02_historisch-siegel', '03_historisch-blumen'], array_column($gruppen, 'id'));
foreach ($gruppen as $g) pruefe("Gruppe {$g['id']} hat eine Variante", count($g['varianten']) >= 1);
pruefe('Schlicht hat mehrere Varianten', count($gruppen[0]['varianten']) >= 2);
pruefe('„../" kommt nicht durch',             pu_urkunden_variante('01_schlicht/../../lib') === null);
pruefe('unbekannte Gruppe kommt nicht durch', pu_urkunden_variante('99_fremd/klar') === null);
pruefe('Backslash kommt nicht durch',         pu_urkunden_variante('01_schlicht\\klar') === null);
gleich('fünf Schriften', 5, count(PU_URKUNDEN_SCHRIFTEN));

$klar = pu_urkunden_variante(VORLAGE);
$d = pu_urkunden_design_klemmen($klar, ['titel_groesse' => 999, 'name_groesse' => -5,
    'titel_schrift' => 'comic-sans', 'titel_schreibweise' => '<script>', 'abstand' => 'viel']);
gleich('Titelgrösse auf die Obergrenze geklemmt', (float)$klar['grenzen']['titel_groesse'][1], $d['titel_groesse']);
gleich('Namensgrösse auf die Untergrenze geklemmt', (float)$klar['grenzen']['name_groesse'][0], $d['name_groesse']);
gleich('fremde Schrift → Vorgabe', $klar['vorgabe']['titel_schrift'], $d['titel_schrift']);
gleich('fremde Schreibweise → Vorgabe', $klar['vorgabe']['titel_schreibweise'], $d['titel_schreibweise']);
gleich('Unsinn als Zahl → Vorgabe', $klar['vorgabe']['abstand'], $d['abstand']);

$rosen = pu_urkunden_variante('03_historisch-blumen/rosen');
gleich('eigene Grenzen der Vorlage gelten (über der Grundvorgabe)', [34.0, 64.0], $rosen['grenzen']['titel_groesse']);
gleich('Vorgabe der Vorlage bleibt erhalten', 52.0, $rosen['vorgabe']['titel_groesse']);
$wild = pu_urkunden_design_klemmen($rosen, ['titel_groesse' => 500]);
gleich('auch eigene Grenzen sind eine Obergrenze', 64.0, $wild['titel_groesse']);

$muster = (string)pu_abschluss_muster('02_historisch-siegel/pergament');
pruefe('Muster trägt den Stempel', str_contains($muster, '>Muster<'));
pruefe('Muster ohne offene Platzhalter', !str_contains($muster, '{{'));
pruefe('Muster: A4 hoch', str_contains($muster, 'size: A4 portrait'));
pruefe('Muster: Farben der Variante', str_contains($muster, '#7a1515'));
pruefe('Muster: drei Unterzeichner', substr_count($muster, 'class="unterschrift"') === 3
       && str_contains($muster, 'Prometheus') && str_contains($muster, 'Athena') && str_contains($muster, 'Hermes'));
pruefe('Muster meldet keinen Druck', str_contains($muster, "var code = '';"));
foreach (PU_URKUNDEN_SCHRIFTEN as $id => $s) {
    pruefe("Schriftdatei $id (latin) liegt bei", is_file(PU_ROOT . '/assets/fonts/urkunde/' . sprintf($s['datei'], 'latin')));
}
pruefe('Schriften sind eingebettet, je Zeichensatz', substr_count($muster, '@font-face') >= 5
       && str_contains($muster, 'unicode-range:U+0100') && str_contains($muster, 'data:font/woff2;base64,'));
pruefe('keine Anfrage nach draussen für Schriften', !str_contains($muster, 'fonts.googleapis') && !str_contains($muster, 'jsdelivr'));

// ================================================================ Gestaltung
gruppe('Gestaltung und Meldungen');
$zoe = konto('zoe', 'schueler', 'Musterschule');
$Z = (int)$zoe['id'];
for ($s = 1; $s <= 6; $s++) bestehen($Z, $s);
wirft('ohne Design kein Ausstellen', fn() => pu_abschluss_ausstellen($Z, 'Zoe', 'Test', 'Zoe Test'), 'Design');
wirft('unbekanntes Design wird abgewiesen',
      fn() => pu_abschluss_ausstellen($Z, 'Zoe', 'Test', 'Zoe Test', '01_schlicht/gibtsnicht'), 'Design');
$uz = pu_abschluss_ausstellen($Z, 'Zoe', 'Test', 'Zoe Test', '03_historisch-blumen/rosen', ['name_groesse' => 33]);
$az = pu_abschluss_lesen($uz['pruefcode']);
gleich('gewähltes Design gespeichert', '03_historisch-blumen/rosen', $az['design']['variante']);
gleich('Wunsch beim Ausstellen übernommen', 33.0, (float)$az['design']['name_groesse']);

$zaehl = fn(string $e) => count(array_filter(pu_abschluss_meldungen($uz['pruefcode']), fn($m) => $m['ereignis'] === $e));
gleich('Meldung „ausgestellt"', 1, $zaehl('ausgestellt'));

wirft('fremde Urkunde lässt sich nicht umgestalten',
      fn() => pu_abschluss_design_setzen($L, $uz['pruefcode'], VORLAGE, []), 'nicht deine');
$neu = pu_abschluss_design_setzen($Z, $uz['pruefcode'], '02_historisch-siegel/pergament', ['titel_groesse' => 50]);
gleich('Design gewechselt', '02_historisch-siegel/pergament', $neu['variante']);
gleich('eine Meldung „gestaltet"', 1, $zaehl('gestaltet'));
pu_abschluss_design_setzen($Z, $uz['pruefcode'], '02_historisch-siegel/pergament', ['titel_groesse' => 50]);
gleich('dieselbe Gestaltung meldet nichts Neues', 1, $zaehl('gestaltet'));
pruefe('Name bleibt nach dem Umgestalten', str_contains((string)pu_abschluss_html($uz['pruefcode'], $zoe), 'Zoe Test'));
pruefe('Siegel bleibt nach dem Umgestalten heil', pu_abschluss_lesen($uz['pruefcode'])['siegel_ok']);

pruefe('Druck durch die Teilnehmerin zählt', pu_abschluss_gedruckt($uz['pruefcode'], $zoe));
pruefe('Druck durch die Lehrkraft zählt',    pu_abschluss_gedruckt($uz['pruefcode'], $lehrer));
pruefe('Druck durch Fremde zählt nicht',     !pu_abschluss_gedruckt($uz['pruefcode'], $erika));
gleich('zwei Drucke gezählt', 2, $zaehl('gedruckt'));
$liste = pu_abschluesse($Z);
gleich('die Übersicht nennt die Drucke', 2, $liste[0]['gedruckt']);

$alle = json_encode(pu_db()->query('SELECT * FROM urkunden_meldungen')->fetchAll(), JSON_UNESCAPED_UNICODE);
pruefe('Meldungen nennen keinen Namen', !str_contains($alle, 'Zoe') && !str_contains($alle, 'Test')
       && !str_contains($alle, 'Anna') && !str_contains($alle, 'Müller'));
pruefe('Meldungen nennen kein Konto', !str_contains($alle, 'KH-') && !str_contains($alle, 'zoe'));
gleich('ohne Registrierung wird nichts gesendet', 0, pu_abschluss_meldungen_senden());

// Vertrag mit dem Server (promptheus-devindev, gemeinsam/urkunden.php,
// PU_URKUNDEN_FELDER): genau diese Felder, sonst weist er die Sendung ab.
$form = pu_abschluss_meldungen_form(pu_db()->query('SELECT * FROM urkunden_meldungen ORDER BY id LIMIT 3')->fetchAll());
$felder = array_keys($form[0]);
sort($felder);
gleich('Meldungsform = Serverform', ['code', 'durchgang', 'ereignis', 'nr', 'test', 'variante', 'zeit'], $felder);
pruefe('nr ist die Postausgangsnummer, fortlaufend', $form[0]['nr'] >= 1 && $form[1]['nr'] > $form[0]['nr']);
pruefe('Zeit in der Serverform (JJJJ-MM-TT hh:mm:ss)',
       (bool)preg_match('/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/', $form[0]['zeit']));
pruefe('Code in der Serverform', (bool)preg_match('/^PU-A-[A-Z2-9]{8}$/', $form[0]['code']));
pruefe('… und nichts als gesendet markiert',
       (int)pu_db()->query("SELECT COUNT(*) FROM urkunden_meldungen WHERE gesendet <> ''")->fetchColumn() === 0);

// ================================================================ Testbetrieb
gruppe('Testbetrieb');
$tom = konto('tom', 'eltern', 'Musterschule');
$T = (int)$tom['id'];
pruefe('ab Werk aus', !pu_urkunden_testbetrieb());
wirft('ohne Testbetrieb kein Test-Bestehen', fn() => pu_abschluss_test_bestehen($T, (int)$schule['id']), 'ausgeschaltet');
pu_urkunden_testbetrieb_setzen(true, (int)$schule['id']);
pruefe('eingeschaltet', pu_urkunden_testbetrieb());

pu_abschluss_test_bestehen($T, (int)$schule['id']);
$st = pu_abschluss_stand($T);
pruefe('Elternkonto: alle sechs Stufen (Test)', $st['faellig'] && $st['test']);
$ut = pu_abschluss_ausstellen($T, 'Tom', 'Tester', 'Tom Tester', VORLAGE);
$at = pu_abschluss_lesen($ut['pruefcode']);
pruefe('die Urkunde ist eine Testurkunde', $at['test'] && $at['siegel_ok']);
pruefe('Stempel „Testurkunde"', str_contains((string)pu_abschluss_html($ut['pruefcode'], $tom), '>Testurkunde<'));
$pt = pu_urkunde_pruefen($ut['pruefcode']);
pruefe('öffentliche Prüfung: gefunden, aber nicht gültig', $pt['gefunden'] && !$pt['gueltig'] && $pt['test']);
$mt = pu_db()->prepare('SELECT MIN(test) FROM urkunden_meldungen WHERE pruefcode = ?');
$mt->execute([$ut['pruefcode']]);
gleich('Meldungen tragen das Testzeichen', 1, (int)$mt->fetchColumn());

pu_db()->prepare('UPDATE abschluesse SET test = 0 WHERE pruefcode = ?')->execute([$ut['pruefcode']]);
pruefe('Test-Zeichen heimlich entfernt: Siegel bricht', !pu_abschluss_lesen($ut['pruefcode'])['siegel_ok']);
pu_db()->prepare('UPDATE abschluesse SET test = 1 WHERE pruefcode = ?')->execute([$ut['pruefcode']]);

pruefe('Admin sieht Testurkunden im Testbetrieb', pu_abschluss_darf_sehen($admin, $T, true));
pruefe('Admin sieht echte Urkunden weiterhin nicht', !pu_abschluss_darf_sehen($admin, $L, false));

$ue = pu_urkunden_uebersicht($schule);
pruefe('Verwaltung: Sicherheit und Konten', $ue['verwalten'] && $ue['sicherheit'] !== null && $ue['konten'] !== []);
pruefe('Verwaltung sieht Tom in der Testliste', in_array($T, array_column($ue['konten'], 'id'), true));
$us = pu_urkunden_uebersicht($lisa);
pruefe('Schüler: keine Sicherheit, keine Konten', !$us['verwalten'] && $us['sicherheit'] === null && $us['konten'] === []);
pruefe('Lehrkraft einer anderen Schule darf Tom nicht testen', !pu_urkunden_testkonto_erlaubt($fremdL, $T));

$echtVorher = (int)pu_db()->query('SELECT COUNT(*) FROM pruefungen WHERE test = 0')->fetchColumn();
$weg = pu_abschluss_test_zuruecksetzen($T, (int)$schule['id']);
gleich('sechs Test-Prüfungen entfernt', 6, $weg['pruefungen']);
gleich('eine Testurkunde entfernt', 1, $weg['urkunden']);
gleich('echte Prüfungen bleiben', $echtVorher, (int)pu_db()->query('SELECT COUNT(*) FROM pruefungen WHERE test = 0')->fetchColumn());
pruefe('echte Urkunden bleiben', pu_abschluss_lesen($u1['pruefcode']) !== null);
pruefe('Tom ist wieder am Anfang', !pu_abschluss_stand($T)['faellig'] && pu_abschluesse($T) === []);

// Eine echte Stufe plus Test-Stufen = Testurkunde.
bestehen($T, 1);
pu_abschluss_test_bestehen($T, (int)$schule['id']);
pruefe('gemischt echt + Test bleibt Test', pu_abschluss_stand($T)['test']);
pu_abschluss_test_zuruecksetzen($T, (int)$schule['id']);
pu_urkunden_testbetrieb_setzen(false, (int)$schule['id']);

// ================================================================ Schlüssel weg
gruppe('Ohne Schlüssel');
@unlink($ordner . '/abschluss.key');
pruefe('mit neuem Schlüssel ist der alte Name nicht lesbar', !pu_abschluss_lesen($u1['pruefcode'])['siegel_ok']);

bilanz();
