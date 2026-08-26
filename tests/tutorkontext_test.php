<?php
declare(strict_types=1);
/**
 * Der Kurs im Tutor-Kontext, und die Steuertoken in der Antwort.
 *
 * Zwei Fehler, gemeldet aus dem Kurs „Entdecker": auf die vorgeschlagene
 * Frage „Was lerne ich in diesem Kurs?" kam „Was willst du wissen?" plus ein
 * rohes Modell-Steuertoken.
 *
 * Der erste Fehler war eine **fehlende Angabe**: die Kurskarte sammelte den
 * Kurstitel ein, aber `tutor_fragen` schickte nur `lektion` und `aufgabe` mit.
 * Auf der Kursseite ist `lektion` leer — das Modell bekam also eine Frage über
 * „diesen Kurs" ohne jeden Kurs und fragte folgerichtig zurück.
 *
 * Der zweite war eine **fehlende Säuberung**: manche Anbieter schneiden das
 * Rollentrennzeichen nicht ab.
 *
 * Beides wird hier geprüft, ohne ein Modell zu rufen: geprüft wird, was in den
 * Prompt geht und was aus dem Text herauskommt.
 */

require_once __DIR__ . '/hilfe.php';
require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../srv/kurse.php';
require_once __DIR__ . '/../srv/tutor.php';

// ================================================================ Kurs als Text
gruppe('Ein Kurs wird zu Tutor-Kontext');

$kurs = [
    'pfad' => '10_Stufen/01_Entdecker', 'titel' => 'Entdecker',
    'untertitel' => 'Die erste Begegnung mit dem Feuer',
    'stufe' => 1, 'dauer_h' => 4,
    'kopf' => "Hier lernst du, **was** ein Sprachmodell ist.\n\nUnd was nicht.",
    'pruefung' => ['rumpf' => 'geheim'],
    'lektionen' => [
        ['pfad' => 'a.md', 'titel' => 'Mensch oder Maschine?',
         'beschreibung' => 'Woran du eine Maschinenantwort erkennst.',
         'aufgaben' => [['id' => 'A1', 'loesung' => 'die geheime Loesung']]],
        ['pfad' => 'b.md', 'titel' => 'Was ist ein Token?',
         'beschreibung' => 'Wie Text in Stücke zerfällt.', 'aufgaben' => []],
    ],
];

$text = pu_kurs_als_text($kurs);

pruefe('der Titel steht drin',      str_contains($text, 'Entdecker'));
pruefe('der Untertitel auch',       str_contains($text, 'Die erste Begegnung'));
pruefe('die Stufe steht drin',      str_contains($text, 'Stufe 1'));
pruefe('die Dauer steht drin',      str_contains($text, '4 Stunden'));
// Der Kurskopf geht als Markdown mit, so wie er im Vault steht. Ein Modell
// liest Auszeichnung ohne Mühe, und sie herauszurechnen hiesse, die Betonung
// wegzuwerfen, die der Autor gesetzt hat.
pruefe('die Einleitung steht drin', str_contains($text, '**was** ein Sprachmodell ist'));

// Der eigentliche Punkt: die Frage „Was lerne ich hier?" ist damit
// beantwortbar, weil die Lektionen mit ihren Beschreibungen dastehen.
pruefe('Lektion 1 steht drin', str_contains($text, 'Mensch oder Maschine?'));
pruefe('Lektion 2 steht drin', str_contains($text, 'Was ist ein Token?'));
pruefe('mit Beschreibung',     str_contains($text, 'Wie Text in Stücke zerfällt.'));
pruefe('in der richtigen Reihenfolge',
       strpos($text, 'Mensch oder Maschine?') < strpos($text, 'Was ist ein Token?'));

// Und die Grenze: der Tutor soll den Weg zeigen, nicht das Ziel verraten.
pruefe('KEINE Lösung im Kurstext', !str_contains($text, 'die geheime Loesung'));
pruefe('KEIN Prüfungsinhalt',      !str_contains($text, 'geheim'));
pruefe('dass es eine Prüfung gibt, steht drin', str_contains($text, 'Prüfung'));

gruppe('Ein Kurs ohne Beiwerk bricht nicht');

$karg = pu_kurs_als_text(['titel' => 'Nackt']);
gleich('nur die Überschrift', '# Nackt', trim($karg));

// ================================================================ Steuertoken
gruppe('Steuertoken kommen nicht ins Fenster');

// Genau der gemeldete Fall.
gleich('DeepSeeks Satzende faellt weg',
       'Was willst du wissen?',
       pu_modell_saeubern("Was willst du wissen?<\u{FF5C}end\u{2581}of\u{2581}sentence\u{FF5C}>"));

gleich('auch am Anfang',
       'Hallo.',
       pu_modell_saeubern("<\u{FF5C}Assistant\u{FF5C}>Hallo."));

gleich('auch mittendrin — die Zeichen gibt es in keinem deutschen Satz',
       'Erst dies. Dann das.',
       pu_modell_saeubern("Erst dies. <\u{FF5C}User\u{FF5C}>Dann das."));

gleich('geschweifte Form am Ende',   'Fertig.', pu_modell_saeubern('Fertig.<|im_end|>'));
gleich('zwei hintereinander',        'Fertig.', pu_modell_saeubern('Fertig.<|im_end|><|endoftext|>'));
gleich('die alte Form',              'Fertig.', pu_modell_saeubern('Fertig.</s>'));
gleich('am Anfang',                  'Fertig.', pu_modell_saeubern('<|im_start|>Fertig.'));

// **Die Unterscheidung, um die es geht.** Diese Academy unterrichtet
// Tokenisierung. Ein Tutor, der `<|endoftext|>` erklaert, darf dabei nicht
// zensiert werden — der Fehler waere still und genau im falschen Kurs.
gleich('ein erklaertes Steuertoken mitten im Satz bleibt stehen',
       'Das Zeichen <|endoftext|> beendet den Text.',
       pu_modell_saeubern('Das Zeichen <|endoftext|> beendet den Text.'));

gleich('eine Antwort nur aus Steuertoken ist leer — also ein Fehlschlag',
       '', pu_modell_saeubern("<\u{FF5C}end\u{2581}of\u{2581}sentence\u{FF5C}>"));

gleich('gewoehnlicher Text bleibt unberuehrt',
       'Ein Token ist ein Textstück.',
       pu_modell_saeubern('Ein Token ist ein Textstück.'));

// HTML darf nicht zum Opfer fallen: `<b>` sieht dem Muster nicht aehnlich,
// aber die Pruefung kostet nichts und faengt eine zu gierige Regel.
gleich('Auszeichnung bleibt', '**fett** und <b>fett</b>',
       pu_modell_saeubern('**fett** und <b>fett</b>'));

bilanz();
