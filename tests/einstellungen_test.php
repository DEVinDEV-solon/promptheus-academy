<?php
declare(strict_types=1);
/**
 * Einstellungen, Medien, Tages-Challenge, Lob.
 *
 * Der Schwerpunkt liegt auf dem, was schiefgehen KANN, und das ist hier
 * immer dasselbe: etwas, das von aussen kommt, wird zu weit hineingelassen.
 * Ein Schlüsselname vom Browser, ein Ordnername aus dem Vault, ein Wert, der
 * als Zahl aussieht. Deshalb prüft der grösste Teil dieser Datei Abweisungen.
 *
 * Die .env wird auf eine Wegwerfdatei umgelegt (PU_TEST_ENV), bevor lib.php
 * lädt. Ohne das schriebe der Test einen Probeschlüssel in die echte .env —
 * dort, wo der Schlüssel steht, mit dem die Academy arbeitet.
 *
 * Aufruf:
 *     php -d extension=pdo_sqlite -d extension=sqlite3 tests/einstellungen_test.php
 */

require_once __DIR__ . '/hilfe.php';
test_db_vorbereiten();

$envDatei = sys_get_temp_dir() . '/pu_test_env_' . bin2hex(random_bytes(5)) . '.env';
file_put_contents($envDatei, "# Probe\nPU_PORT=8801\nPU_OPENROUTER_API_KEY=\n");
putenv('PU_TEST_ENV=' . $envDatei);

require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../srv/db.php';
require_once __DIR__ . '/../srv/einstellungen.php';
require_once __DIR__ . '/../srv/medien.php';
require_once __DIR__ . '/../srv/motivation.php';
require_once __DIR__ . '/../srv/kurse.php';
require_once __DIR__ . '/../srv/bewertung.php';
require_once __DIR__ . '/../srv/punkte.php';
require_once __DIR__ . '/../srv/badges.php';
require_once __DIR__ . '/../srv/pruefung.php';
require_once __DIR__ . '/../srv/zertifikat.php';
require_once __DIR__ . '/../srv/lernende.php';

$ich = pu_lernenden_anlegen('probant', 'Probant', 'probe1234', 'schueler');

// ================================================================ persönlich
gruppe('Persönliche Einstellungen');

$vorgabe = pu_einst_person($ich);
gleich('Vorgabe: dunkles Thema', 'dunkel', $vorgabe['thema']);
gleich('Vorgabe: 160 Wörter Vertiefung', '160', $vorgabe['infos_woerter']);
pruefe('jede beschriebene Einstellung hat einen Wert',
       count($vorgabe) === count(PU_EINST_PERSON));

gleich('setzen gibt den bereinigten Wert zurück', 'hell',
       pu_einst_person_setzen($ich, 'thema', '  hell  '));
gleich('und er kommt auch wieder heraus', 'hell', pu_einst($ich, 'thema'));

wirft('unbekannter Schlüssel wird abgewiesen',
      fn() => pu_einst_person_setzen($ich, 'beliebig', 'x'), 'Unbekannte Einstellung');
wirft('unerlaubter Wert wird abgewiesen',
      fn() => pu_einst_person_setzen($ich, 'thema', 'neon'), 'Unerlaubter Wert');
wirft('Zahl ausserhalb der Grenzen',
      fn() => pu_einst_person_setzen($ich, 'lob_dauer', '999'), 'zwischen 0 und 60');
wirft('Text, wo eine Zahl hingehört',
      fn() => pu_einst_person_setzen($ich, 'lob_dauer', 'lang'), 'braucht eine Zahl');

gleich('0 Sekunden sind erlaubt — dann bleibt das Fenster stehen', '0',
       pu_einst_person_setzen($ich, 'lob_dauer', '0'));

// Zwei Lernende, zwei Vorlieben. Der Fehler, den diese Prüfung fängt: ein
// Zwischenspeicher, der den ersten Lernenden für alle beantwortet.
$zweiter = pu_lernenden_anlegen('probant2', 'Zweite', 'probe1234', 'schueler');
pu_einst_person_setzen($zweiter, 'thema', 'dunkel');
gleich('der erste behält sein Thema', 'hell', pu_einst($ich, 'thema'));
gleich('der zweite sein eigenes', 'dunkel', pu_einst($zweiter, 'thema'));

// ================================================================ uniweit
gruppe('Academy-Regeln');

gleich('Vorgabe: Tempobonus an', 'an', pu_regel('tempobonus'));
gleich('Vorgabe: Deckel 20 %', '20', pu_regel('tempobonus_deckel'));
pruefe('pu_regel_an liest den Schalter', pu_regel_an('tempobonus'));

pu_einst_global_setzen('tempobonus', 'aus');
pruefe('Änderung wirkt sofort', !pu_regel_an('tempobonus'));

wirft('unbekannte Regel wird abgewiesen',
      fn() => pu_einst_global_setzen('weltherrschaft', 'an'), 'Unbekannte Einstellung');
wirft('Modellname mit Semikolon wird abgewiesen',
      fn() => pu_einst_global_setzen('or_modell', 'gut; rm -rf /'), 'unerlaubte Schreibweise');
gleich('ein gültiger Modellname geht durch', 'anthropic/claude-sonnet-4.5',
       pu_einst_global_setzen('or_modell', 'anthropic/claude-sonnet-4.5'));
gleich('leer ist erlaubt und heisst: Vorgabe', '', pu_einst_global_setzen('or_modell', ''));

// ================================================================ Punkte und Regeln
gruppe('Regeln wirken auf die Punkte — aber erst ab jetzt');

$a = ['id' => 'T-1', 'typ' => 'denkaufgabe', 'punkte' => 100, 'richtzeit_s' => 100,
      'hinweise' => [], 'loesung' => ['x']];
$bew = ['richtig' => true, 'punkte' => 100, 'max' => 100, 'teil' => [], 'rueckmeldung' => ''];

pu_einst_global_setzen('tempobonus', 'aus');
gleich('ohne Tempobonus gibt es keinen Zuschlag', 0,
       pu_punkte_rechnen($bew, 0, false, 1, $a)['bonus']);

pu_einst_global_setzen('tempobonus', 'an');
pu_einst_global_setzen('tempobonus_deckel', '20');
pruefe('mit Bonus ist es mehr als der Grundwert',
       pu_punkte_rechnen($bew, 0, false, 1, $a)['bonus'] > 0);

pu_einst_global_setzen('tempobonus_deckel', '50');
gleich('der Deckel begrenzt den Zuschlag', 50, pu_punkte_rechnen($bew, 0, false, 1, $a)['bonus']);
pu_einst_global_setzen('tempobonus_deckel', '20');

// ================================================================ Tages-Challenge
gruppe('Tages-Challenge');

$heute = pu_tagesaufgabe_id($ich);
pruefe('es gibt eine Aufgabe des Tages', $heute !== '');
gleich('sie ist beim zweiten Fragen dieselbe', $heute, pu_tagesaufgabe_id($ich));

$bonus = pu_tagesbonus_buchen($ich, $heute);
pruefe('der Bonus wird gebucht', $bonus !== null && $bonus['punkte'] === 25);
gleich('ein zweites Mal am selben Tag nicht', null, pu_tagesbonus_buchen($ich, $heute));
gleich('die Summe steht einmal da', 25, pu_tagesbonus_summe($ich));

gleich('eine andere Aufgabe bekommt keinen Bonus', null,
       pu_tagesbonus_buchen($zweiter, 'gibt-es-nicht'));

// Der Bonus muss die Neuberechnung überleben — sonst verschwände er beim
// nächsten "Punkte neu rechnen" in der Wartung.
$konto = pu_punkte_neu_rechnen($ich);
gleich('der Bonus steckt im neu gerechneten Konto', 25, $konto['summe']);

pu_einst_global_setzen('tagesaufgabe', 'aus');
gleich('abgeschaltet gibt es keine Tagesaufgabe', null, pu_tagesaufgabe($ich));
pu_einst_global_setzen('tagesaufgabe', 'an');

pu_einst_global_setzen('tagesbonus', '0');
gleich('Bonus 0 bucht nichts', null, pu_tagesbonus_buchen($zweiter, pu_tagesaufgabe_id($zweiter)));
pu_einst_global_setzen('tagesbonus', '25');

// ================================================================ Medien
gruppe('Medien — Pfadwache');

foreach (['..', '../..', 'kurs/../..', 'C:/Windows', '', '.', "kurs\0"] as $boese) {
    gleich('abgewiesen: ' . var_export($boese, true), null,
           pu_medien_ordner('10_Stufen/01_Entdecker', $boese));
}
gleich('auch ein Kurspfad mit .. wird abgewiesen', null,
       pu_medien_ordner('10_Stufen/../../..', 'kurs'));

gruppe('Medien — Titel aus dem Dateinamen');

gleich('Nummer und Titel getrennt', [3, 'Kosten je 1000 token'],
       pu_medien_titel('03_kosten-je-1000-token.mp3'));
gleich('ohne Nummer', [null, 'Video'], pu_medien_titel('video.mp4'));
gleich('Unterstriche werden zu Leerzeichen', [1, 'Worum es geht'],
       pu_medien_titel('01_worum_es_geht.mp3'));
gleich('nur eine Nummer ergibt einen Ersatztitel', [7, 'Teil'], pu_medien_titel('07_.mp3'));

gruppe('Medien — leerer Ordner');
$leer = pu_medien('10_Stufen/gibt-es-nicht', 'kurs');
pruefe('nichts gefunden heisst: leer, nicht Fehler', pu_medien_leer($leer));
gleich('der erwartete Ordner steht trotzdem dabei', '10_Stufen/gibt-es-nicht/kurs', $leer['ordner']);

pu_einst_global_setzen('medien', 'aus');
pruefe('abgeschaltet ist alles leer', pu_medien_leer(pu_medien('10_Stufen/01_Entdecker', 'kurs')));
pu_einst_global_setzen('medien', 'an');

// ================================================================ Motivation
gruppe('Motivationssprüche');

$liste = pu_motivation_liste();
pruefe('es gibt Sprüche', count($liste) >= 8);
pruefe('keiner ist zu lang für das Fenster',
       count(array_filter($liste, fn($s) => mb_strlen($s) > 160)) === 0);

$eins = pu_motivation('E1-01');
pruefe('ein Spruch kommt heraus', $eins !== '');
gleich('derselbe Keim am selben Tag: derselbe Spruch', $eins, pu_motivation('E1-01'));
pruefe('ein anderer Keim darf einen anderen Spruch geben',
       count(array_unique(array_map('pu_motivation', ['A', 'B', 'C', 'D', 'E', 'F']))) > 1);

// ================================================================ .env
gruppe('.env schreiben');

pruefe('vorher ist kein Schlüssel gesetzt', pu_geheimnis_stand('PU_OPENROUTER_API_KEY')['gesetzt'] === false);

pu_env_setzen('PU_OPENROUTER_API_KEY', 'sk-or-probe-0123456789');
$inhalt = (string)file_get_contents($envDatei);
pruefe('der Wert steht in der Datei', str_contains($inhalt, 'PU_OPENROUTER_API_KEY=sk-or-probe-0123456789'));
pruefe('der Kommentar steht noch da', str_contains($inhalt, '# Probe'));
pruefe('die anderen Zeilen sind unangetastet', str_contains($inhalt, 'PU_PORT=8801'));
pruefe('der Schlüssel steht nur einmal da', substr_count($inhalt, 'PU_OPENROUTER_API_KEY=') === 1);

wirft('ein fremder Schlüssel darf nicht geschrieben werden',
      fn() => pu_env_setzen('PATH', 'boese'), 'darf nicht gesetzt werden');
wirft('ein Zeilenumbruch im Wert wird abgewiesen',
      fn() => pu_env_setzen('PU_CLAUDE_BIN', "a\nPU_OPENROUTER_API_KEY=geklaut"), 'Zeilenumbruch');

pruefe('die Einschleusung ist nicht in der Datei gelandet',
       !str_contains((string)file_get_contents($envDatei), 'geklaut'));

// Der Stand wird aus der bereits gelesenen .env beantwortet; deshalb prüft
// diese Zeile den WERT nicht, sondern nur, dass nach aussen nie einer geht.
$stand = pu_geheimnis_stand('PU_PORT');
pruefe('der Stand nennt nur "gesetzt" und eine Länge',
       array_keys($stand) === ['gesetzt', 'zeichen']);

@unlink($envDatei);
bilanz();
