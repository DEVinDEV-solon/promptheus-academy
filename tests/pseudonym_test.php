<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — der Name in der Academy (srv/pseudonym.php).
 *
 * Entscheid 04.10.2026: Pflicht beim ersten Anmelden, unter 18 nur aus dem
 * Baukasten (128 × 128), Form `<Namensteil>_<Kennung>` mit 5 Zeichen Kennung,
 * Änderung höchstens alle 30 Tage.
 *
 * Der Baukasten wird hier VOLLSTÄNDIG geprüft, jede der 16.384 Kombinationen:
 * Ein einziger Vorname darin wäre ein Klarname, den die Academy selbst
 * vorschlägt.
 *
 * Aufruf:
 *     php -d extension=pdo_sqlite -d extension=sqlite3 tests/pseudonym_test.php
 */

require_once __DIR__ . '/hilfe.php';
test_db_vorbereiten();

require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../srv/rechte.php';
require_once __DIR__ . '/../srv/lernende.php';
require_once __DIR__ . '/../srv/profil.php';
require_once __DIR__ . '/../srv/gemeinde.php';
require_once __DIR__ . '/../srv/pseudonym.php';

const KENNUNG_MUSTER = '/^[23456789BCDFGHJKMNPQRSTVWXZ]{5}$/';

// ================================================================ Baukasten
gruppe('Der Baukasten');

$b = pu_pseudo_baukasten();
gleich('128 Vorsilben', 128, count($b['vorsilben']));
gleich('128 Figuren',   128, count($b['figuren']));
gleich('keine Vorsilbe doppelt', 128, count(array_unique($b['vorsilben'])));
gleich('keine Figur doppelt',    128, count(array_unique($b['figuren'])));

$pii = json_decode((string)file_get_contents(PU_PII_DATEI), true);
$vornamen = array_flip(array_map('mb_strtolower', $pii['listen']['vornamen']));
$teileVorname = [];
foreach (array_merge($b['vorsilben'], $b['figuren']) as $w) {
    if (isset($vornamen[mb_strtolower($w)])) $teileVorname[] = $w;
}
gleich('kein Wortteil ist ein Vorname', [], $teileVorname);

$rang = array_flip(pu_pseudo_rangwoerter());
$schlecht = ['form' => [], 'synonym' => [], 'rang' => []];
$zahl = 0;
foreach ($b['vorsilben'] as $v) {
    foreach ($b['figuren'] as $f) {
        $teil = pu_pseudo_zusammen($v, $f);
        if (in_array($teil, $b['gesperrt'], true)) continue;
        $zahl++;
        if (!preg_match('/^\p{L}[\p{L}\p{N}]{2,17}$/u', $teil)) $schlecht['form'][] = $teil;
        if (isset($rang[mb_strtolower($teil)])) $schlecht['rang'][] = $teil;
        // Der volle Name, wie er in die Community geht.
        if (pu_synonym_fehler($teil . '_BCDFG') !== null) $schlecht['synonym'][] = $teil;
    }
}
gleich('alle Kombinationen ausser den gesperrten', 128 * 128 - count($b['gesperrt']), $zahl);
gleich('jede Kombination hat die Form (3–18 Zeichen)', [], array_slice($schlecht['form'], 0, 5));
gleich('keine Kombination ist ein Rang',               [], array_slice($schlecht['rang'], 0, 5));
gleich('jede Kombination besteht die Community-Prüfung', [], array_slice($schlecht['synonym'], 0, 5));
pruefe('Goldfänger ist dabei', pu_pseudo_im_baukasten('Goldfänger'));
pruefe('Goldschmied ist gesperrt (Nachname)', !pu_pseudo_im_baukasten('Goldschmied'));
pruefe('Feuerfuchs ist gesperrt (Marke)', !pu_pseudo_im_baukasten('Feuerfuchs'));

$v = pu_pseudo_vorschlaege(3);
gleich('drei Vorschläge', 3, count(array_unique($v)));
pruefe('alle aus dem Baukasten', count(array_filter($v, 'pu_pseudo_im_baukasten')) === 3, implode(', ', $v));

// ================================================================ Kennung
gruppe('Die Kennung');

$ok = true;
for ($i = 0; $i < 2000; $i++) {
    $k = pu_pseudo_kennung_wuerfeln();
    if (!preg_match(KENNUNG_MUSTER, $k) || preg_match('/[AEIOUYL01]/', $k)) { $ok = false; break; }
}
pruefe('5 Zeichen, ohne Vokale, ohne 0/1/L', $ok);

$konten = [];
for ($i = 0; $i < 25; $i++) {
    $konten[] = pu_lernenden_anlegen('konto' . $i, 'Konto ' . $i, 'probe1234', 'schueler');
}
$kennungen = array_map('pu_pseudo_kennung', $konten);
gleich('jede Kennung nur einmal auf der Installation', 25, count(array_unique($kennungen)));
gleich('die Kennung bleibt fest', $kennungen[0], pu_pseudo_kennung($konten[0]));

pruefe('zerlegen: neue Form', pu_pseudo_zerlegen('Goldfänger_BCDFG') === ['teil' => 'Goldfänger', 'kennung' => 'BCDFG']);
pruefe('zerlegen: eine Kennung mit Vokal ist keine', pu_pseudo_zerlegen('Goldfänger_EVA23') === null);
gleich('Anrede nur mit dem Namensteil', 'Goldfänger', pu_pseudo_anrede('Goldfänger_BCDFG'));
gleich('alte Form bleibt ganz', 'Funkenflug', pu_pseudo_anrede('Funkenflug'));

// ================================================================ Regeln
gruppe('Unter 18 nur der Baukasten');

$kind = pu_lernenden_anlegen('kind', 'Marie Musterfrau', 'probe1234', 'schueler');
pruefe('Schüler ohne Alter: nur Baukasten', pu_pseudo_stand($kind)['nur_baukasten']);
wirft('frei ausgedacht geht nicht', fn() => pu_pseudo_setzen($kind, 'Bergkristall'), 'Baukasten');
wirft('ein Vorname geht nicht', fn() => pu_pseudo_setzen($kind, 'Nele'), 'echter Name');
wirft('der eigene Name auch nicht', fn() => pu_pseudo_setzen($kind, 'Musterfrau'), 'echter Name');
$voll = pu_pseudo_setzen($kind, 'Nachtfalke');
pruefe('aus dem Baukasten geht, mit Kennung', (bool)preg_match('/^Nachtfalke_[23456789BCDFGHJKMNPQRSTVWXZ]{5}$/', $voll), $voll);
pruefe('der volle Name besteht die Community-Prüfung', pu_synonym_fehler($voll) === null);

$siebzehn = pu_lernenden_anlegen('siebzehn', 'Siebzehn', 'probe1234', 'schueler');
pu_profil_setzen($siebzehn, 'lebensalter', '17');
wirft('mit 17: nur Baukasten', fn() => pu_pseudo_setzen($siebzehn, 'Bergkristall'), 'Baukasten');
$achtzehn = pu_lernenden_anlegen('achtzehn', 'Achtzehn', 'probe1234', 'schueler');
pu_profil_setzen($achtzehn, 'lebensalter', '18');
pruefe('mit 18: frei', str_starts_with(pu_pseudo_setzen($achtzehn, 'Bergkristall'), 'Bergkristall_'));

gruppe('Ab 18: frei, mit Prüfung');

// Die echte Rolle zählt, nicht die (ohne Registrierung gedeckelte) Ebene.
pruefe('Admin ohne Alter: frei', !pu_pseudo_nur_baukasten(['rolle' => 'admin', 'lebensalter' => 0]));
pruefe('Admin mit 15: Baukasten', pu_pseudo_nur_baukasten(['rolle' => 'admin', 'lebensalter' => 15]));
pruefe('unbekannte Rolle: Baukasten', pu_pseudo_nur_baukasten(['rolle' => 'gast', 'lebensalter' => 0]));

$lehrer = pu_lernenden_anlegen('lehrkraft', 'Frau Lehrerin', 'probe1234', 'lehrer');
pruefe('Lehrkraft ohne Alter: frei', !pu_pseudo_stand($lehrer)['nur_baukasten']);
wirft('ein Tutor ist kein Name',  fn() => pu_pseudo_setzen($lehrer, 'Prometheus'), 'Rang');
wirft('eine Stufe auch nicht',    fn() => pu_pseudo_setzen($lehrer, 'Entdecker'), 'Rang');
wirft('ein Titel auch nicht',     fn() => pu_pseudo_setzen($lehrer, 'Funke'), 'Rang');
wirft('ein Geburtsjahr nicht',    fn() => pu_pseudo_setzen($lehrer, 'Stern2011'), 'Jahreszahl');
wirft('Sonderzeichen nicht',      fn() => pu_pseudo_setzen($lehrer, 'Stern Licht'), '3 bis 18');
wirft('zu lang nicht',            fn() => pu_pseudo_setzen($lehrer, str_repeat('x', 19)), '3 bis 18');
pruefe('frei ausgedacht geht', str_starts_with(pu_pseudo_setzen($lehrer, 'Bergkristall'), 'Bergkristall_'));

// ================================================================ Frist und Stand
gruppe('Ändern nur alle 30 Tage');

$k1 = pu_pseudo_kennung($kind);
wirft('gleich danach ändern geht nicht', fn() => pu_pseudo_setzen($kind, 'Goldfänger'), '30 Tage');
gleich('denselben Namen noch einmal: kein Fehler', $voll, pu_pseudo_setzen($kind, 'Nachtfalke'));
pruefe('der Stand nennt das Datum', pu_pseudo_stand($kind)['aenderbar_ab'] !== '');

pu_db()->prepare('UPDATE lernende SET pseudonym_seit = ? WHERE id = ?')
       ->execute([gmdate('Y-m-d H:i:s', time() - 31 * 86400), $kind]);
$neu = pu_pseudo_setzen($kind, 'Goldfänger');
gleich('nach 31 Tagen geht es', 'Goldfänger_' . $k1, $neu);
gleich('die Kennung ist geblieben', $k1, pu_pseudo_zerlegen($neu)['kennung']);

gleich('zurücksetzen geht ohne Frist', '', pu_pseudo_setzen($kind, ''));
pruefe('danach ist die Wahl wieder Pflicht', pu_pseudo_stand($kind)['pflicht']);
gleich('und die Kennung bleibt', $k1, pu_pseudo_stand($kind)['kennung']);

gruppe('Wer wählen muss');

$neuKonto = pu_lernenden_anlegen('frisch', 'Frisch', 'probe1234', 'schueler');
pruefe('ein neues Konto muss wählen', pu_pseudo_stand($neuKonto)['pflicht']);
pu_db()->prepare("UPDATE lernende SET pseudonym = 'Funkenflug' WHERE id = ?")->execute([$neuKonto]);
pruefe('ein Pseudonym alter Form auch', pu_pseudo_stand($neuKonto)['pflicht']);
pu_pseudo_setzen($neuKonto, 'Sternenläufer');
pruefe('nach der Wahl nicht mehr', !pu_pseudo_stand($neuKonto)['pflicht']);
gleich('der Tutor spricht nur den Namensteil an', 'Sternenläufer', pu_pseudo_anrede(pu_profil($neuKonto)['pseudonym']));

bilanz();
