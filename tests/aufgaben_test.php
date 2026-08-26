<?php
declare(strict_types=1);
/**
 * Parser — YAML-Teilmenge, Frontmatter, Aufgabenblöcke.
 *
 * Der wichtigste Test hier ist der letzte: `loesung`, `hinweise` und
 * `erklaerung` dürfen in der Frontend-Fassung **nicht** vorkommen. Fiele
 * dieser Test aus, würde die Academy weiter laufen und jeder Lernende bekäme die
 * Lösung im Quelltext mitgeliefert — sichtbar wäre nichts.
 */

require_once __DIR__ . '/hilfe.php';
require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../srv/kurse.php';

// ================================================================ YAML
gruppe('YAML — Skalare');
$y = pu_yaml_parse("a: 1\nb: 2.5\nc: true\nd: false\ne: null\nf: Text ohne Anfuehrung\ng: \"in Anfuehrung\"\nh: 'einfach'");
gleich('Ganzzahl',      1, $y['a']);
gleich('Kommazahl',     2.5, $y['b']);
gleich('true',          true, $y['c']);
gleich('false',         false, $y['d']);
gleich('null',          null, $y['e']);
gleich('freier Text',   'Text ohne Anfuehrung', $y['f']);
gleich('doppelte Anfuehrung', 'in Anfuehrung', $y['g']);
gleich('einfache Anfuehrung', 'einfach', $y['h']);

gruppe('YAML — Listen');
$y = pu_yaml_parse("fluss: [a, b, c]\nblock:\n  - x\n  - y\nleer: []");
gleich('Fluss-Liste',  ['a', 'b', 'c'], $y['fluss']);
gleich('Block-Liste',  ['x', 'y'], $y['block']);
gleich('leere Liste',  [], $y['leer']);

$y = pu_yaml_parse("f: [\"a, mit Komma\", b]");
gleich('Komma in Anfuehrung wird nicht getrennt', ['a, mit Komma', 'b'], $y['f']);

gruppe('YAML — Karten und Verschachtelung');
$y = pu_yaml_parse("k:\n  eins: A\n  zwei: B");
gleich('verschachtelte Karte', ['eins' => 'A', 'zwei' => 'B'], $y['k']);

$y = pu_yaml_parse("l:\n  - text: Erster\n    kostet: 5\n  - text: Zweiter\n    kostet: 10");
gleich('Liste von Karten', 2, count($y['l']));
gleich('erste Karte', ['text' => 'Erster', 'kostet' => 5], $y['l'][0]);
gleich('zweite Karte', ['text' => 'Zweiter', 'kostet' => 10], $y['l'][1]);

gruppe('YAML — Schlüssel in Anführungszeichen');
$y = pu_yaml_parse("\"Ein Satz mit Leerzeichen\": Antwort");
gleich('Schlüssel mit Leerzeichen', ['Ein Satz mit Leerzeichen' => 'Antwort'], $y);

$y = pu_yaml_parse("\"Frage: mit Doppelpunkt\": Antwort");
gleich('Schlüssel mit Doppelpunkt', ['Frage: mit Doppelpunkt' => 'Antwort'], $y);

// Der Grund, warum diese Unterscheidung nötig ist: ein Listeneintrag in
// Anführungszeichen ist KEIN Paar.
$y = pu_yaml_parse("l:\n  - \"Nur ein Text\"\n  - \"Noch einer\"");
gleich('Text in Anfuehrung bleibt Listeneintrag', ['Nur ein Text', 'Noch einer'], $y['l']);

gruppe('YAML — Blocktext');
$y = pu_yaml_parse("t: |\n  Zeile eins\n  Zeile zwei\nnach: da");
gleich('Blocktext behaelt Umbrueche', "Zeile eins\nZeile zwei", $y['t']);
gleich('danach geht es weiter', 'da', $y['nach']);

$y = pu_yaml_parse("t: >\n  Zeile eins\n  Zeile zwei");
gleich('gefalteter Blocktext', 'Zeile eins Zeile zwei', $y['t']);

gruppe('YAML — Kommentare');
$y = pu_yaml_parse("# ganze Zeile\na: 1   # dahinter\nb: \"mit # in Anfuehrung\"");
gleich('Kommentarzeile übersprungen', 1, $y['a']);
gleich('Kommentar hinter dem Wert entfernt', 1, $y['a']);
gleich('Raute in Anfuehrung bleibt', 'mit # in Anfuehrung', $y['b']);

// ================================================================ Frontmatter
gruppe('Frontmatter');
$fm = pu_frontmatter("---\ntype: lesson\ntitle: \"T\"\n---\n\n# Rumpf\n\nText.");
gleich('type gelesen', 'lesson', $fm['meta']['type']);
gleich('title gelesen', 'T', $fm['meta']['title']);
pruefe('Rumpf beginnt mit der Überschrift', str_starts_with(trim($fm['rumpf']), '# Rumpf'));

$fm = pu_frontmatter("Kein Frontmatter hier.");
gleich('ohne Frontmatter leere Meta', [], $fm['meta']);
gleich('ohne Frontmatter voller Rumpf', 'Kein Frontmatter hier.', $fm['rumpf']);

$fm = pu_frontmatter("\xEF\xBB\xBF---\ntype: lesson\n---\nX");
gleich('BOM stoert nicht', 'lesson', $fm['meta']['type']);

// ================================================================ Aufgabenblöcke
gruppe('Aufgabenblöcke');
$text = "Vorher\n\n```aufgabe\nid: A1\ntyp: denkaufgabe\ntitel: \"T\"\npunkte: 20\n"
      . "optionen: [a, b]\nloesung: a\n```\n\nNachher\n\n"
      . "```aufgabe\nid: A2\ntyp: mathe\ntitel: \"M\"\npunkte: 15\nloesung: 42\n```\n";
$auf = pu_aufgaben_aus_text($text, 'test.md');
gleich('zwei Aufgaben gefunden', 2, count($auf));
gleich('erste Kennung', 'A1', $auf[0]['id']);
gleich('zweite Kennung', 'A2', $auf[1]['id']);

$ohne = pu_aufgaben_aus_text("Nur Text, kein Block.", 'test.md');
gleich('ohne Block leere Liste', [], $ohne);

// Ein gewoehnlicher Codeblock ist keine Aufgabe.
$code = pu_aufgaben_aus_text("```php\nid: A1\n```", 'test.md');
gleich('gewoehnlicher Codeblock wird nicht gelesen', [], $code);

// ================================================================ Strenge
gruppe('Der Parser bricht laut ab');
function block(string $inhalt): callable {
    return fn() => pu_aufgaben_aus_text("```aufgabe\n$inhalt\n```", 'test.md');
}

wirft('unbekannter Typ',
  block("id: X1\ntyp: gibtsnicht\ntitel: T\npunkte: 20"), 'unbekannter Typ');
wirft('Feld id fehlt',
  block("typ: denkaufgabe\ntitel: T\npunkte: 20"), "Feld 'id' fehlt");
wirft('Feld punkte fehlt',
  block("id: X1\ntyp: denkaufgabe\ntitel: T"), "Feld 'punkte' fehlt");
wirft('zu wenige Punkte',
  block("id: X1\ntyp: denkaufgabe\ntitel: T\npunkte: 5\noptionen: [a]\nloesung: a"), 'zwischen 10 und 100');
wirft('zu viele Punkte',
  block("id: X1\ntyp: denkaufgabe\ntitel: T\npunkte: 500\noptionen: [a]\nloesung: a"), 'zwischen 10 und 100');
wirft('unzulässige Kennung',
  block("id: \"a b\"\ntyp: denkaufgabe\ntitel: T\npunkte: 20\noptionen: [a]\nloesung: a"), 'unzulässig');
wirft('Pflichtfeld des Typs fehlt',
  block("id: X1\ntyp: schiebe\ntitel: T\npunkte: 20\nbausteine: [a, b]"), "braucht das Feld 'loesung'");
wirft('Lösung nennt unbekannten Baustein',
  block("id: X1\ntyp: schiebe\ntitel: T\npunkte: 20\nbausteine: [a, b]\nloesung: [a, c]"),
  'Bausteine, die es nicht gibt');
wirft('Lösung nennt unbekannte Option',
  block("id: X1\ntyp: denkaufgabe\ntitel: T\npunkte: 20\noptionen: [a, b]\nloesung: c"),
  'Optionen, die es nicht gibt');
wirft('Secret ohne Marke',
  block("id: X1\ntyp: secret\ntitel: T\npunkte: 20\ndump: x\nloesung: \"geheim123\""),
  'PROMPTHEUS{');
wirft('Zuordnung unvollständig',
  block("id: X1\ntyp: uebereinstimmung\ntitel: T\npunkte: 20\nlinks: [a, b]\nrechts: [A, B]\nloesung:\n  a: A"),
  'genau ein Paar');
wirft('Prüfungen ergeben nicht die Gesamtpunktzahl',
  block("id: X1\ntyp: planung\ntitel: T\npunkte: 50\npruefungen:\n  - art: mindestens_woerter\n    wert: 10\n    punkte: 20"),
  'die Aufgabe nennt 50');
wirft('Multitask-Schritte ergeben nicht die Gesamtpunktzahl',
  block("id: X1\ntyp: multitask\ntitel: T\npunkte: 50\nschritte:\n  - typ: mathe\n    punkte: 20\n    loesung: 1"),
  'die Aufgabe nennt 50');
wirft('Multitask im Multitask',
  block("id: X1\ntyp: multitask\ntitel: T\npunkte: 20\nschritte:\n  - typ: multitask\n    punkte: 20"),
  'keinen Multitask enthalten');
wirft('Hinweis ohne Text',
  block("id: X1\ntyp: mathe\ntitel: T\npunkte: 20\nloesung: 1\nhinweise:\n  - kostet: 5"),
  "braucht 'text'");

// ================================================================ Das Sieb
gruppe('Die oeffentliche Fassung verrät nichts');
$a = pu_aufgaben_aus_text(
  "```aufgabe\nid: S1\ntyp: schiebe\ntitel: \"T\"\npunkte: 30\n"
  . "bausteine: [a, b, c]\nloesung: [c, a, b]\n"
  . "hinweise:\n  - text: \"Der Hinweis\"\n    kostet: 5\n"
  . "erklaerung: |\n  Die Erklärung.\n```", 'test.md')[0];

$oeff = pu_aufgabe_oeffentlich($a);
$json = json_encode($oeff, JSON_UNESCAPED_UNICODE);

pruefe('loesung ist entfernt',        !isset($oeff['loesung']));
pruefe('hinweise sind entfernt',      !isset($oeff['hinweise']));
pruefe('erklaerung ist entfernt',     !isset($oeff['erklaerung']));
pruefe('Hinweistext kommt nicht vor', !str_contains($json, 'Der Hinweis'));
pruefe('Erklärung kommt nicht vor',  !str_contains($json, 'Die Erklärung'));
gleich('Anzahl der Hinweise bleibt sichtbar', 1, $oeff['hinweis_anzahl']);
gleich('Kosten der Hinweise bleiben sichtbar', [5], $oeff['hinweis_kosten']);
gleich('Bausteine bleiben vollständig', 3, count($oeff['bausteine']));

// Weitere geheime Felder
$b = pu_aufgaben_aus_text(
  "```aufgabe\nid: S2\ntyp: sicherheit\ntitel: \"T\"\npunkte: 30\n"
  . "code: |\n  a\n  b\nzeilen: [1]\n```", 'test.md')[0];
pruefe('zeilen sind entfernt', !isset(pu_aufgabe_oeffentlich($b)['zeilen']));

$c = pu_aufgaben_aus_text(
  "```aufgabe\nid: S3\ntyp: technisch\ntitel: \"T\"\npunkte: 30\n"
  . "pruefer: sha256_von\neingabe: X\n```", 'test.md')[0];
pruefe('pruefer ist entfernt', !isset(pu_aufgabe_oeffentlich($c)['pruefer']));

$d = pu_aufgaben_aus_text(
  "```aufgabe\nid: S4\ntyp: planung\ntitel: \"T\"\npunkte: 20\n"
  . "pruefungen:\n  - art: mindestens_woerter\n    wert: 5\n    punkte: 20\n```", 'test.md')[0];
pruefe('pruefungen sind entfernt', !isset(pu_aufgabe_oeffentlich($d)['pruefungen']));

$e = pu_aufgaben_aus_text(
  "```aufgabe\nid: S5\ntyp: mathe\ntitel: \"T\"\npunkte: 20\n"
  . "loesung: 42\ntoleranz: 3\n```", 'test.md')[0];
pruefe('toleranz ist entfernt', !isset(pu_aufgabe_oeffentlich($e)['toleranz']));

gruppe('Mischen ist reproduzierbar');
$m1 = pu_aufgabe_oeffentlich($a)['bausteine'];
$m2 = pu_aufgabe_oeffentlich($a)['bausteine'];
gleich('zweimal dieselbe Reihenfolge', $m1, $m2);
pruefe('gemischt, nicht in Lösungsreihenfolge', $m1 !== ['c', 'a', 'b'] || count($m1) < 3);
gleich('kein Baustein verloren', ['a', 'b', 'c'], (function ($x) { sort($x); return $x; })($m1));

bilanz();
