<?php
declare(strict_types=1);
/**
 * Bewertung — jeder der zwölf Typen mit richtiger, falscher und leerer Antwort.
 *
 * Die leere Antwort ist der Fall, der am ehesten durchrutscht: eine Prüfung,
 * die `[] === []` vergleicht, hält ein leeres Feld für richtig — und dann
 * bekäme jeder die volle Punktzahl fürs Nichtstun.
 */

require_once __DIR__ . '/hilfe.php';
require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../srv/kurse.php';
require_once __DIR__ . '/../srv/bewertung.php';

/** Kurzform: bewertet und gibt zurueck, ob richtig. */
function r(array $a, $antwort): bool { return pu_bewerten($a, $antwort)['richtig']; }
function p(array $a, $antwort): int  { return pu_bewerten($a, $antwort)['punkte']; }

// ================================================================ denkaufgabe
gruppe('denkaufgabe');
$a = ['id' => 'T1', 'typ' => 'denkaufgabe', 'titel' => 't', 'punkte' => 20,
      'optionen' => ['rot', 'grün', 'blau'], 'loesung' => 'grün'];
pruefe('richtige Antwort',            r($a, ['grün']));
pruefe('richtig auch als Skalar',     r($a, 'grün'));
// mb_strtolower muss auch Umlaute umsetzen — strtolower kann das nicht.
pruefe('Gross/Kleinschreibung egal',  r($a, ['GRÜN']));
pruefe('falsche Antwort',            !r($a, ['rot']));
pruefe('leere Antwort ist falsch',   !r($a, []));
pruefe('null ist falsch',            !r($a, null));
pruefe('zu viele Antworten falsch',  !r($a, ['grün', 'rot']));
gleich('null Punkte bei falsch', 0, p($a, ['rot']));
gleich('volle Punkte bei richtig', 20, p($a, ['grün']));

$m = $a; $m['loesung'] = ['rot', 'blau'];
pruefe('Mehrfachauswahl, Reihenfolge egal', r($m, ['blau', 'rot']));
pruefe('Mehrfachauswahl, eine fehlt',      !r($m, ['rot']));
pruefe('Doppelte werden entfernt',          r($m, ['rot', 'blau', 'rot']));

// ================================================================ plugplay
gruppe('plugplay');
$a = ['id' => 'T2', 'typ' => 'plugplay', 'titel' => 't', 'punkte' => 30,
      'bausteine' => ['a', 'b', 'c', 'd'], 'loesung' => ['a', 'c']];
pruefe('richtige Menge',            r($a, ['a', 'c']));
pruefe('Reihenfolge egal',          r($a, ['c', 'a']));
pruefe('einer zu viel ist falsch', !r($a, ['a', 'c', 'b']));
pruefe('einer fehlt ist falsch',   !r($a, ['a']));
pruefe('leer ist falsch',          !r($a, []));

// ================================================================ schiebe
gruppe('schiebe');
$a = ['id' => 'T3', 'typ' => 'schiebe', 'titel' => 't', 'punkte' => 30,
      'bausteine' => ['x', 'y', 'z'], 'loesung' => ['y', 'x', 'z']];
pruefe('richtige Folge',             r($a, ['y', 'x', 'z']));
pruefe('falsche Reihenfolge',       !r($a, ['x', 'y', 'z']));
pruefe('richtige Menge reicht nicht',!r($a, ['z', 'x', 'y']));
pruefe('leer ist falsch',           !r($a, []));

// ================================================================ uebereinstimmung
gruppe('uebereinstimmung');
$a = ['id' => 'T4', 'typ' => 'uebereinstimmung', 'titel' => 't', 'punkte' => 25,
      'links' => ['eins', 'zwei'], 'rechts' => ['A', 'B'],
      'loesung' => ['eins' => 'A', 'zwei' => 'B']];
pruefe('richtige Paare',        r($a, ['eins' => 'A', 'zwei' => 'B']));
pruefe('vertauscht ist falsch',!r($a, ['eins' => 'B', 'zwei' => 'A']));
pruefe('eines fehlt',          !r($a, ['eins' => 'A']));
pruefe('leer ist falsch',      !r($a, []));
pruefe('kein Feld ist falsch', !r($a, 'A'));

$s = $a; $s['links'] = ['Ein Satz: mit Doppelpunkt']; $s['rechts'] = ['Antwort'];
$s['loesung'] = ['Ein Satz: mit Doppelpunkt' => 'Antwort'];
pruefe('Schlüssel mit Doppelpunkt', r($s, ['Ein Satz: mit Doppelpunkt' => 'Antwort']));

// ================================================================ mathe
gruppe('mathe');
$a = ['id' => 'T5', 'typ' => 'mathe', 'titel' => 't', 'punkte' => 20,
      'loesung' => 1000, 'toleranz' => 50];
pruefe('exakt',                     r($a, '1000'));
pruefe('am Rand der Toleranz',      r($a, '1050'));
pruefe('knapp darüber ist falsch',!r($a, '1051'));
pruefe('deutsche Schreibweise',     r($a, '1.000'));
pruefe('Komma als Dezimaltrenner',  r($a, '1000,0'));
pruefe('Text ist falsch',          !r($a, 'tausend'));
pruefe('leer ist falsch',          !r($a, ''));

$t = ['id' => 'T5b', 'typ' => 'mathe', 'titel' => 't', 'punkte' => 20, 'loesung' => 42];
pruefe('ohne Toleranz exakt',       r($t, '42'));
pruefe('ohne Toleranz daneben',    !r($t, '43'));

// ================================================================ raeumlich
gruppe('raeumlich');
$a = ['id' => 'T6', 'typ' => 'raeumlich', 'titel' => 't', 'punkte' => 25,
      'diagramm' => "A --> B", 'optionen' => ['A', 'B'], 'loesung' => 'B'];
pruefe('richtig',           r($a, ['B']));
pruefe('falsch',           !r($a, ['A']));
pruefe('leer ist falsch',  !r($a, []));

// ================================================================ secret
gruppe('secret');
$a = ['id' => 'T7', 'typ' => 'secret', 'titel' => 't', 'punkte' => 30,
      'dump' => "log\ntoken=PROMPTHEUS{abc}", 'loesung' => 'PROMPTHEUS{abc}'];
pruefe('richtig',                    r($a, 'PROMPTHEUS{abc}'));
pruefe('mit Leerraum drumherum',     r($a, '  PROMPTHEUS{abc}  '));
pruefe('Gross/Klein egal',           r($a, 'promptheus{abc}'));
pruefe('falsches Geheimnis',        !r($a, 'PROMPTHEUS{xyz}'));
pruefe('leer ist falsch',           !r($a, ''));

// ================================================================ sicherheit
gruppe('sicherheit');
$a = ['id' => 'T8', 'typ' => 'sicherheit', 'titel' => 't', 'punkte' => 40,
      'code' => "a\nb\nc\nd", 'zeilen' => [1, 3]];
pruefe('richtige Zeilen',            r($a, [1, 3]));
pruefe('Reihenfolge egal',           r($a, [3, 1]));
pruefe('als Zeichenketten',          r($a, ['1', '3']));
pruefe('eine zu viel',              !r($a, [1, 2, 3]));
pruefe('eine fehlt',                !r($a, [1]));
pruefe('leere Auswahl ist falsch',  !r($a, []));

// ================================================================ technisch
gruppe('technisch');
$a = ['id' => 'T9', 'typ' => 'technisch', 'titel' => 't', 'punkte' => 30,
      'pruefer' => 'sha256_von', 'eingabe' => 'PROMPTHEUS'];
pruefe('richtiger Hash',         r($a, hash('sha256', 'PROMPTHEUS')));
pruefe('Grossbuchstaben-Hex',    r($a, strtoupper(hash('sha256', 'PROMPTHEUS'))));
pruefe('falscher Hash',         !r($a, hash('sha256', 'promptheus')));
pruefe('leer ist falsch',       !r($a, ''));

$b = ['id' => 'T9b', 'typ' => 'technisch', 'titel' => 't', 'punkte' => 20,
      'pruefer' => 'base64_dekodiert', 'eingabe' => base64_encode('Feuer')];
pruefe('base64 dekodiert',       r($b, 'Feuer'));
pruefe('base64 falsch',         !r($b, 'Wasser'));

$c = ['id' => 'T9c', 'typ' => 'technisch', 'titel' => 't', 'punkte' => 20,
      'pruefer' => 'json_gueltig', 'schluessel' => ['name', 'wert']];
pruefe('gueltiges JSON mit Schluesseln', r($c, '{"name":"x","wert":1}'));
pruefe('JSON ohne Pflichtschluessel',   !r($c, '{"name":"x"}'));
pruefe('kaputtes JSON',                 !r($c, '{name:'));

$d = ['id' => 'T9d', 'typ' => 'technisch', 'titel' => 't', 'punkte' => 20,
      'pruefer' => 'gibt_es_nicht'];
wirft('unbekannter Prüfer bricht laut ab',
      fn() => pu_bewerten($d, 'x'), 'unbekannter Prüfer');

// ================================================================ krypto
gruppe('krypto');
$a = ['id' => 'TA', 'typ' => 'krypto', 'titel' => 't', 'punkte' => 25,
      'pruefer' => 'beginnt_mit', 'praefix' => 'G', 'laenge' => 56];
$gut = 'G' . str_repeat('A', 55);
pruefe('richtige Adresse',        r($a, $gut));
pruefe('falscher Anfangsbuchstabe', !r($a, 'S' . str_repeat('A', 55)));
pruefe('zu kurz',                !r($a, 'G' . str_repeat('A', 40)));

// ================================================================ multitask
gruppe('multitask');
$a = ['id' => 'TB', 'typ' => 'multitask', 'titel' => 't', 'punkte' => 40,
      'schritte' => [
        ['typ' => 'denkaufgabe', 'titel' => 's1', 'punkte' => 15,
         'optionen' => ['ja', 'nein'], 'loesung' => 'ja'],
        ['typ' => 'mathe', 'titel' => 's2', 'punkte' => 25, 'loesung' => 7],
      ]];
$erg = pu_bewerten($a, [['ja'], '7']);
pruefe('beide Schritte richtig', $erg['richtig']);
gleich('volle Punkte', 40, $erg['punkte']);

$erg = pu_bewerten($a, [['ja'], '8']);
pruefe('ein Schritt falsch ist nicht richtig', !$erg['richtig']);
gleich('Teilpunkte für den richtigen Schritt', 15, $erg['punkte']);
gleich('Teilliste hat zwei Eintraege', 2, count($erg['teil']));

$erg = pu_bewerten($a, []);
gleich('leere Antwort gibt null Punkte', 0, $erg['punkte']);

// ================================================================ planung
gruppe('planung');
$a = ['id' => 'TC', 'typ' => 'planung', 'titel' => 't', 'punkte' => 60,
      'pruefungen' => [
        ['art' => 'enthaelt_alle', 'werte' => ['rolle', 'ziel'], 'punkte' => 30],
        ['art' => 'mindestens_woerter', 'wert' => 10, 'punkte' => 10],
        ['art' => 'enthaelt_nicht', 'werte' => ['passwort'], 'punkte' => 20],
      ]];

$voll = 'Die Rolle ist klar und das Ziel steht fest, damit jeder genau weiß worum es geht.';
$erg = pu_bewerten($a, $voll);
gleich('alle Prüfungen erfuellt', 60, $erg['punkte']);
pruefe('gilt als richtig', $erg['richtig']);

$erg = pu_bewerten($a, 'Rolle und Ziel, aber zu kurz.');
gleich('Mindestlaenge nicht erfuellt', 50, $erg['punkte']);

$erg = pu_bewerten($a, $voll . ' Mein passwort lautet geheim.');
gleich('verbotener Begriff kostet', 40, $erg['punkte']);

// Der Fall, der beim ersten Testlauf durchgerutscht ist: `enthaelt_nicht` ist
// von einer leeren Antwort trivial erfuellt. Wer nichts schreibt, nennt auch
// kein Passwort — und bekaeme dafür Punkte. Deshalb gibt eine leere Antwort
// jetzt ausnahmslos null.
gleich('leere Antwort gibt null', 0, pu_bewerten($a, '')['punkte']);
gleich('leere Antwort auch als Feld', 0, pu_bewerten($a, [])['punkte']);
gleich('nur Leerzeichen gibt null', 0, pu_bewerten($a, "   \n  ")['punkte']);
pruefe('Rueckmeldung sagt es deutlich',
       str_contains(pu_bewerten($a, '')['rueckmeldung'], 'nichts abgegeben'));

// Wortgrenzen: "ziel" darf nicht in "erzielen" treffen
$g = ['id' => 'TD', 'typ' => 'planung', 'titel' => 't', 'punkte' => 10,
      'pruefungen' => [['art' => 'enthaelt_alle', 'werte' => ['ziel'], 'punkte' => 10]]];
gleich('Wortgrenze beachtet', 0, pu_bewerten($g, 'Wir wollen etwas erzielen.')['punkte']);
gleich('eigenstaendiges Wort trifft', 10, pu_bewerten($g, 'Das Ziel ist klar.')['punkte']);

// ---------------------------------------------------------------- Wortstämme
//
// **Der Anfang zählt, das Ende nicht.** Die Aufgaben suchen mit Stämmen
// (`pruef`, `verifizier`, `quelle`), und im Deutschen hängt an einem Stamm
// fast immer noch etwas dran. Wurde auch rechts eine Wortgrenze verlangt, war
// so eine Prüfung nur zu bestehen, indem man den blanken Stamm hinschrieb —
// also nie. Gemeldet an E1-14: eine Antwort mit „Ich prüfe die Angaben nach",
// „verifizieren" und „kontrollieren" bekam null von 15 Punkten.
gruppe('Wortstämme treffen gebeugte Formen');

$s = ['id' => 'TS', 'typ' => 'planung', 'titel' => 't', 'punkte' => 10,
      'pruefungen' => [['art' => 'enthaelt_eines',
                        'werte' => ['pruef', 'verifizier', 'kontrollier'], 'punkte' => 10]]];

foreach (['Ich prüfe die Angaben nach.'     => 'prüfe',
          'Ich werde alles verifizieren.'   => 'verifizieren',
          'Das lässt sich kontrollieren.'   => 'kontrollieren',
          'Ich prüfte jede Quelle einzeln.' => 'prüfte',
          'Prüfen ist der erste Schritt.'   => 'Prüfen, gross geschrieben'] as $satz => $was) {
    gleich('„' . $was . '" trifft den Stamm', 10, pu_bewerten($s, $satz)['punkte']);
}

// **Die linke Grenze bleibt, und das ist Absicht.** Ein Stamm muss am
// Wortanfang stehen. Damit trifft `pruef` NICHT in „überprüfen" — dort steht
// eine Vorsilbe davor. Das ist keine Lücke, sondern der Grund, warum die
// Aufgaben `überprüf` und `nachprüf` zusätzlich aufführen: Wer eine Vorsilbe
// zulassen will, schreibt sie hin. Ohne die linke Grenze träfe `ziel` in
// „erzielen" und `api` in „kapital" — dafür ist sie da.
gleich('eine Vorsilbe davor trifft nicht', 0,
       pu_bewerten($s, 'Eine Überprüfung steht noch aus.')['punkte']);
gleich('…und mit dem passenden Stamm dann doch', 10,
       pu_bewerten(['id' => 'TS2', 'typ' => 'planung', 'titel' => 't', 'punkte' => 10,
                    'pruefungen' => [['art' => 'enthaelt_eines',
                                      'werte' => ['überprüf'], 'punkte' => 10]]],
                   'Eine Überprüfung steht noch aus.')['punkte']);

// Und die Umlaut-Vereinheitlichung gilt weiter in beide Richtungen: Wer ohne
// Umlaute tippt, soll dieselbe Punktzahl bekommen.
gleich('ohne Umlaut getippt trifft auch', 10,
       pu_bewerten($s, 'Ich pruefe alle Angaben nach.')['punkte']);

// Die echte Aufgabe aus der Meldung, mit der echten Antwort.
$e114 = pu_aufgabe('E1-14');
if ($e114 !== null) {
    $antwort = "Ich prüfe die Angaben nach. "
      . "1. Quellen verifizieren — jede angegebene Quelle direkt aufrufen und kontrollieren, "
      . "ob sie existiert und die Behauptung tatsächlich stützt. "
      . "2. Behauptungen gegenprüfen — unabhängige Gegenrecherche über Suchmaschine "
      . "und Sekundärquellen; Übereinstimmung, Abweichung oder Fehlen notieren. "
      . "3. KI-Spuren bewerten — generische Formulierungen, runde Statistiken ohne Fundstelle.";
    gleich('E1-14 „Deine Prüfregel" gibt jetzt die volle Punktzahl',
           (int)$e114['punkte'], pu_bewerten($e114, $antwort)['punkte']);
}

// Reihenfolge
$o = ['id' => 'TE', 'typ' => 'planung', 'titel' => 't', 'punkte' => 10,
      'pruefungen' => [['art' => 'reihenfolge', 'werte' => ['erst', 'dann'], 'punkte' => 10]]];
gleich('richtige Reihenfolge', 10, pu_bewerten($o, 'Erst dies, dann das.')['punkte']);
gleich('falsche Reihenfolge',   0, pu_bewerten($o, 'Dann das, erst dies.')['punkte']);

// Muster
$mu = ['id' => 'TF', 'typ' => 'planung', 'titel' => 't', 'punkte' => 10,
       'pruefungen' => [['art' => 'muster', 'wert' => '\\d{4}', 'punkte' => 10]]];
gleich('Muster trifft', 10, pu_bewerten($mu, 'Im Jahr 2026 war das so.')['punkte']);
gleich('Muster trifft nicht', 0, pu_bewerten($mu, 'Im Jahr war das so.')['punkte']);

$un = ['id' => 'TG', 'typ' => 'planung', 'titel' => 't', 'punkte' => 10,
       'pruefungen' => [['art' => 'gibt_es_nicht', 'punkte' => 10]]];
wirft('unbekannte Prüfungsart bricht laut ab',
      fn() => pu_bewerten($un, 'x'), 'unbekannte Prüfungsart');

// ================================================================ Reproduzierbarkeit
gruppe('Reproduzierbarkeit');
$a = ['id' => 'TH', 'typ' => 'denkaufgabe', 'titel' => 't', 'punkte' => 20,
      'optionen' => ['a', 'b'], 'loesung' => 'a'];
$e1 = pu_bewerten($a, ['b']);
$e2 = pu_bewerten($a, ['b']);
gleich('dieselbe Rueckmeldung beim zweiten Lauf', $e1['rueckmeldung'], $e2['rueckmeldung']);
pruefe('Rueckmeldung ist nicht leer', $e1['rueckmeldung'] !== '');

gruppe('Zahlen lesen');
gleich('deutsche Tausender',      1000.0, pu_zahl_lesen('1.000'));
gleich('deutsche Tausender lang', 1234567.0, pu_zahl_lesen('1.234.567'));
gleich('deutsch mit Dezimale',    1234.56, pu_zahl_lesen('1.234,56'));
gleich('englisch mit Dezimale',   1234.56, pu_zahl_lesen('1,234.56'));
gleich('Dezimalkomma',            1000.5, pu_zahl_lesen('1000,5'));
gleich('Dezimalpunkt',            1.5,    pu_zahl_lesen('1.5'));
gleich('kleiner Dezimalpunkt',    0.0031, pu_zahl_lesen('0.0031'));
gleich('negative Zahl',          -42.0,   pu_zahl_lesen('-42'));
gleich('Leerzeichen egal',        1000.0, pu_zahl_lesen(' 1.000 '));
pruefe('Text ist keine Zahl',  pu_zahl_lesen('tausend') === null);
pruefe('leer ist keine Zahl',  pu_zahl_lesen('') === null);
pruefe('1.0000 ist Dezimalpunkt, keine Tausender', abs((float)pu_zahl_lesen('1.0000') - 1.0) < 1e-9);

bilanz();
