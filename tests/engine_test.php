<?php
declare(strict_types=1);
/**
 * Engine — Punkte, Serie, Titel, Abzeichen, Prüfungen, Urkunden.
 *
 * Läuft gegen eine Wegwerf-Datenbank. Ein Test, der die echte
 * `data/promptheus.db` benutzt, legt Testkonten in die Lernstände einer Klasse
 * — und räumt sie beim Aufräumen im Zweifel mit weg.
 */

require_once __DIR__ . '/hilfe.php';
$dbDatei = test_db_vorbereiten();

require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../srv/db.php';
require_once __DIR__ . '/../srv/kurse.php';
require_once __DIR__ . '/../srv/bewertung.php';
require_once __DIR__ . '/../srv/punkte.php';
require_once __DIR__ . '/../srv/badges.php';
require_once __DIR__ . '/../srv/pruefung.php';
require_once __DIR__ . '/../srv/zertifikat.php';
require_once __DIR__ . '/../srv/lernende.php';

register_shutdown_function(function () use ($dbDatei) {
    foreach ([$dbDatei, $dbDatei . '-wal', $dbDatei . '-shm'] as $f) @unlink($f);
});

gleich('Testdatenbank wird benutzt', $dbDatei, PU_DB);

// ================================================================ Konten
gruppe('Konten');
pruefe('anfangs ist die Academy leer', pu_leer());

// Das erste Konto ist die Ebene 1 — sonst käme nach der Einrichtung
// niemand an die Rechte-Matrix. Siehe tests/rechte_test.php.
$tutor = pu_lernenden_anlegen('tutor', 'Die Tutorin', 'geheim12345');
pruefe('erstes Konto wird Admin', (function ($id) {
    $st = pu_db()->prepare('SELECT rolle FROM lernende WHERE id = ?');
    $st->execute([$id]);
    return $st->fetchColumn() === 'admin';
})($tutor));
pruefe('danach ist die Academy nicht mehr leer', !pu_leer());

$l = pu_lernenden_anlegen('lisa', 'Lisa', 'geheim12345');
pruefe('zweites Konto wird Schüler', (function ($id) {
    $st = pu_db()->prepare('SELECT rolle FROM lernende WHERE id = ?');
    $st->execute([$id]);
    return $st->fetchColumn() === 'schueler';
})($l));

wirft('doppelte Kennung abgewiesen',
  fn() => pu_lernenden_anlegen('lisa', 'Lisa Zwei', 'geheim12345'), 'gibt es schon');
wirft('zu kurzes Kennwort abgewiesen',
  fn() => pu_lernenden_anlegen('kurt', 'Kurt', 'kurz'), 'mindestens 8');
wirft('unzulässige Kennung abgewiesen',
  fn() => pu_lernenden_anlegen('Lisa Mueller', 'X', 'geheim12345'), 'Kennung');

// ================================================================ Punkte
gruppe('Punkte rechnen');
$a = ['id' => 'X1', 'typ' => 'denkaufgabe', 'titel' => 'T', 'punkte' => 100,
      'optionen' => ['a', 'b'], 'loesung' => 'a', 'richtzeit_s' => 100,
      'hinweise' => [['text' => 'h1', 'kostet' => 10], ['text' => 'h2', 'kostet' => 20]]];
$bew = pu_bewerten($a, ['a']);

gleich('ohne Hilfe volle Punkte', 100, pu_punkte_rechnen($bew, 0, false, 0, $a)['punkte']);
gleich('ein Hinweis kostet 10',    90, pu_punkte_rechnen($bew, 1, false, 0, $a)['punkte']);
gleich('zwei Hinweise kosten 30',  70, pu_punkte_rechnen($bew, 2, false, 0, $a)['punkte']);
gleich('mehr Hinweise als es gibt kostet nicht mehr', 70,
       pu_punkte_rechnen($bew, 9, false, 0, $a)['punkte']);
gleich('Musterlösung gibt null',   0, pu_punkte_rechnen($bew, 0, true, 0, $a)['punkte']);

$schnell = pu_punkte_rechnen($bew, 0, false, 1, $a);
pruefe('Schnelligkeitsbonus greift', $schnell['bonus'] > 0);
pruefe('Bonus ist auf 20 % gedeckelt', $schnell['bonus'] <= 20, 'ist ' . $schnell['bonus']);
gleich('ohne Richtzeit kein Bonus', 0,
       pu_punkte_rechnen($bew, 0, false, 1, array_diff_key($a, ['richtzeit_s' => 1]))['bonus']);

$falsch = pu_bewerten($a, ['b']);
gleich('falsche Antwort gibt null', 0, pu_punkte_rechnen($falsch, 0, false, 1, $a)['punkte']);
gleich('kein Bonus auf eine falsche Antwort', 0, pu_punkte_rechnen($falsch, 0, false, 1, $a)['bonus']);

// ================================================================ Konto
gruppe('Punktekonto');
gleich('anfangs null', 0, pu_konto($l)['summe']);
gleich('anfangs Funke', 'Funke', pu_konto($l)['titel']);

$erg = pu_versuch_eintragen($l, $a, ['a'], $bew, pu_punkte_rechnen($bew, 0, false, 0, $a), 0, false, 0);
gleich('Konto nach einem Versuch', 100, $erg['konto']['summe']);

// Zweiter, schlechterer Versuch derselben Aufgabe.
$schwach = pu_punkte_rechnen($bew, 2, false, 0, $a);
pu_versuch_eintragen($l, $a, ['a'], $bew, $schwach, 2, false, 0);
gleich('nur der beste Versuch zählt', 100, pu_konto($l)['summe']);

// Zweiter, besserer Versuch einer anderen Aufgabe.
$b = $a; $b['id'] = 'X2';
pu_versuch_eintragen($l, $b, ['a'], $bew, pu_punkte_rechnen($bew, 0, false, 0, $b), 0, false, 0);
gleich('zweite Aufgabe zählt dazu', 200, pu_konto($l)['summe']);

gruppe('Titel');
gleich('0 Punkte',      'Funke',      pu_titel(0));
gleich('499 Punkte',    'Funke',      pu_titel(499));
gleich('500 Punkte',    'Flamme',     pu_titel(500));
gleich('1499 Punkte',   'Flamme',     pu_titel(1499));
gleich('1500 Punkte',   'Fackel',     pu_titel(1500));
gleich('3500 Punkte',   'Feuer',      pu_titel(3500));
gleich('7000 Punkte',   'Inferno',    pu_titel(7000));
gleich('12000 Punkte',  'Prometheus', pu_titel(12000));
gleich('weit darüber', 'Prometheus', pu_titel(999999));

$n = pu_bis_naechster_titel(400);
gleich('nächster Titel',  'Flamme', $n['titel']);
gleich('noch fehlende Punkte', 100, $n['fehlt']);
pruefe('auf der höchsten Stufe kein nächster', pu_bis_naechster_titel(12000) === null);

// ================================================================ Serie
gruppe('Serie');
$s = pu_serie($l);
gleich('erster Tag zählt eins', 1, $s['tage']);
pruefe('heute schon gelernt', $s['heute']);

// Gestern gelernt -> Serie läuft weiter
pu_db()->prepare('UPDATE streak SET letzter = ?, tage = 3, bestwert = 3 WHERE lernender = ?')
       ->execute([date('Y-m-d', strtotime('-1 day')), $l]);
$s = pu_serie_nachfuehren($l);
gleich('gestern gelernt: Serie waechst', 4, $s['tage']);

// Lücke -> Serie beginnt neu, Bestwert bleibt
pu_db()->prepare('UPDATE streak SET letzter = ?, tage = 9, bestwert = 9 WHERE lernender = ?')
       ->execute([date('Y-m-d', strtotime('-5 days')), $l]);
$s = pu_serie_nachfuehren($l);
gleich('nach einer Lücke beginnt die Serie neu', 1, $s['tage']);
gleich('die Bestmarke bleibt', 9, $s['bestwert']);

// Zweimal am selben Tag zählt nur einmal
$vor = pu_serie_nachfuehren($l)['tage'];
$nach = pu_serie_nachfuehren($l)['tage'];
gleich('zweimal am selben Tag zählt einmal', $vor, $nach);

// Eine Serie, die gestern endete, läuft noch
pu_db()->prepare('UPDATE streak SET letzter = ?, tage = 4 WHERE lernender = ?')
       ->execute([date('Y-m-d', strtotime('-1 day')), $l]);
gleich('gestern zuletzt: Serie läuft', 4, pu_serie($l)['tage']);
pu_db()->prepare('UPDATE streak SET letzter = ? WHERE lernender = ?')
       ->execute([date('Y-m-d', strtotime('-3 days')), $l]);
gleich('vor drei Tagen zuletzt: Serie ist gerissen', 0, pu_serie($l)['tage']);
gleich('Bestmarke bleibt trotzdem', 9, pu_serie($l)['bestwert']);

// ================================================================ Abzeichen
gruppe('Abzeichen');
$hat = pu_badges($l);
pruefe('Erster Funke wurde verliehen', isset($hat['erster_funke']));

// Nachtraegliche Verleihung: Bestwert 9 erfuellt die Sieben-Tage-Bedingung.
$neu = pu_badges_pruefen($l);
$hat = pu_badges($l);
pruefe('Diamant-Streak nachtraeglich verliehen', isset($hat['diamant_streak']));

// Key-Keeper: Secret ohne Hinweis
$sec = ['id' => 'S1', 'typ' => 'secret', 'titel' => 'T', 'punkte' => 30,
        'dump' => 'x', 'loesung' => 'PROMPTHEUS{ok}'];
$sb  = pu_bewerten($sec, 'PROMPTHEUS{ok}');
pu_versuch_eintragen($l, $sec, 'PROMPTHEUS{ok}', $sb, pu_punkte_rechnen($sb, 0, false, 0, $sec), 0, false, 0);
pruefe('Key-Keeper verliehen', isset(pu_badges($l)['key_keeper']));

// Ein Abzeichen wird nicht zweimal verliehen
$vorher = count(pu_badges($l));
pu_badges_pruefen($l);
gleich('kein Abzeichen doppelt', $vorher, count(pu_badges($l)));

$ueb = pu_badges_uebersicht($l);
gleich('Katalog hat acht Abzeichen', 8, count($ueb));
pruefe('jedes trägt eine Bedingung', !array_filter($ueb, fn($b) => $b['bedingung'] === ''));

// ================================================================ Wiederherstellung
gruppe('Das Konto lässt sich wiederherstellen');
$summe = pu_konto($l)['summe'];
pu_db()->exec('DELETE FROM punkte_konto');
gleich('nach dem Loeschen null', 0, pu_konto($l)['summe']);
pu_punkte_neu_rechnen($l);
gleich('aus den Versuchen wiederhergestellt', $summe, pu_konto($l)['summe']);

// ================================================================ Stufen
gruppe('Stufenfreigabe');
pruefe('Stufe 1 ist immer frei',      pu_stufe_frei($l, 1));
pruefe('Stufe 2 ist zunaechst zu',   !pu_stufe_frei($l, 2));
gleich('höchste Stufe ist anfangs 1', 1, pu_hoechste_stufe($l));

pu_db()->prepare('INSERT INTO pruefungen (lernender, stufe, punkte, max_punkte, bestanden, zeitpunkt)
                  VALUES (?,1,180,200,1,?)')->execute([$l, pu_jetzt()]);
pruefe('nach bestandener Stufe 1 ist Stufe 2 frei', pu_stufe_frei($l, 2));
pruefe('Stufe 3 bleibt zu',                        !pu_stufe_frei($l, 3));
gleich('höchste Stufe ist jetzt 2', 2, pu_hoechste_stufe($l));

// ================================================================ Urkunden
gruppe('Urkunden');
$u = pu_urkunde_ausstellen($l, 1, 180);
pruefe('Prüfcode hat die richtige Form',
       (bool)preg_match('/^PU-1-[A-Z2-9]{8}$/', $u['pruefcode']), $u['pruefcode']);

$p = pu_urkunde_pruefen($u['pruefcode']);
pruefe('Urkunde gefunden', $p['gefunden']);
pruefe('Urkunde gueltig',  $p['gueltig']);
gleich('Stufe stimmt', 1, $p['stufe']);

// Der wichtigste Test des ganzen Bereichs.
$json = json_encode($p, JSON_UNESCAPED_UNICODE);
pruefe('die Auskunft nennt KEINEN Namen', !str_contains($json, 'Lisa'));
pruefe('die Auskunft nennt keine Kennung', !str_contains($json, 'lisa'));

pruefe('Kleinschreibung wird erkannt', pu_urkunde_pruefen(strtolower($u['pruefcode']))['gefunden']);
pruefe('unbekannter Code nicht gefunden', !pu_urkunde_pruefen('PU-1-AAAAAAAA')['gefunden']);
pruefe('Unsinn wird abgewiesen',          !pu_urkunde_pruefen('hallo')['gefunden']);
pruefe('falsche Stufe im Muster abgewiesen', !pu_urkunde_pruefen('PU-9-AAAAAAAA')['gefunden']);

pruefe('Widerruf greift', pu_urkunde_widerrufen($u['pruefcode'], $tutor));
pruefe('nach Widerruf ungueltig', !pu_urkunde_pruefen($u['pruefcode'])['gueltig']);
pruefe('aber weiterhin auffindbar', pu_urkunde_pruefen($u['pruefcode'])['gefunden']);
pruefe('zweiter Widerruf tut nichts', !pu_urkunde_widerrufen($u['pruefcode'], $tutor));

// Zwei Urkunden haben nie denselben Code
$codes = [];
for ($i = 0; $i < 25; $i++) $codes[] = pu_urkunde_ausstellen($l, 2, 150)['pruefcode'];
gleich('25 Urkunden, 25 verschiedene Codes', 25, count(array_unique($codes)));

// ================================================================ Prüfung
gruppe('Prüfung abnehmen');
$erg = pu_pruefung_abnehmen($l, '10_Stufen/01_Entdecker', [
    'P1-01' => ['Es berechnet wiederholt das wahrscheinlichste nächste Token und zieht eines.'],
    'P1-02' => '1500',
    'P1-05' => ['Weil das nächste Token nach Wahrscheinlichkeit gezogen wird, nicht fest gewählt.',
                'Bei Temperatur 0 würde zweimal dasselbe herauskommen.'],
]);
gleich('sieben Einzelergebnisse', 7, count($erg['einzeln']));
pruefe('Punkte wurden vergeben', $erg['punkte'] > 0);
pruefe('nicht bestanden bei drei von sieben', !$erg['bestanden'], $erg['prozent'] . ' %');
pruefe('ohne Bestehen keine Urkunde', $erg['urkunde'] === null);

$leer = pu_pruefung_abnehmen($l, '10_Stufen/01_Entdecker', []);
gleich('leere Prüfung gibt null Punkte', 0, $leer['punkte']);
pruefe('leere Prüfung ist nicht bestanden', !$leer['bestanden']);

pruefe('Wiederholung ist erlaubt', pu_pruefung_abnehmen($l, '10_Stufen/01_Entdecker', [])['stufe'] === 1);

wirft('Kurs ohne Prüfung bricht ab',
  fn() => pu_pruefung_abnehmen($l, '20_Domaenen/DOM-JURA_Jura', []), 'keine Prüfung');

// ================================================================ Protokoll
gruppe('Protokoll');
$n = (int)pu_db()->query('SELECT COUNT(*) FROM protokoll')->fetchColumn();
pruefe('es wurde protokolliert', $n > 0, "$n Eintraege");
$arten = pu_db()->query('SELECT DISTINCT aktion FROM protokoll')->fetchAll(PDO::FETCH_COLUMN);
foreach (['versuch', 'pruefung', 'urkunde', 'badge', 'konto_angelegt'] as $art) {
    pruefe("Aktion '$art' wird protokolliert", in_array($art, $arten, true));
}

bilanz();
