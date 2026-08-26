<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Sprechertexte: Struktur, Herkunft, Grenzen.
 *
 * Geprüft wird das Gerüst, nicht der Inhalt: dass jedes Stück des Lehrstoffs
 * vier Fassungen bekommt, dass jede ihre Herkunft trägt, und dass **keine
 * Lösung** in einen Sprechertext gerät — der wird vorgelesen, und ein Video,
 * das die Antwort verrät, macht die Aufgabe wertlos.
 *
 * Was hier NICHT geprüft wird: ob der Text gut ist. Das kann kein Test, das
 * liest ein Mensch. Deshalb tragen alle erzeugten Texte `stand: entwurf`.
 *
 * Aufruf:
 *     php -d extension=pdo_sqlite -d extension=sqlite3 tests/sprecher_test.php
 */

require_once __DIR__ . '/hilfe.php';
test_db_vorbereiten();

require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../srv/rechte.php';
require_once __DIR__ . '/../srv/abo.php';
require_once __DIR__ . '/../srv/profil.php';
require_once __DIR__ . '/../srv/kurse.php';
require_once __DIR__ . '/../srv/sprecher.php';

// ================================================================ Zielgruppen
gruppe('Die vier Zielgruppen');

gleich('Es sind vier', 4, count(PU_ZIELGRUPPEN));

foreach (PU_ZIELGRUPPEN as $k => $z) {
    pruefe("$k hat einen Namen",   trim($z['name']) !== '');
    pruefe("$k hat einen Auftrag", mb_strlen($z['auftrag']) > 40);
    pruefe("$k nennt eine Ebene",  isset(PU_EBENEN[$z['ebene']]));
    pruefe("$k hat eine Wortgrenze", $z['woerter'] >= 100 && $z['woerter'] <= 400);

    // Der Kontextordner muss es geben — sonst schreibt das Modell ohne die
    // Kenntnis, für wen es schreibt, und das war der ganze Punkt.
    pruefe("$k hat einen Kontext im Vault",
           pu_ebenen_kontext($z['kontext']) !== '', 'Ordner: ' . $z['kontext']);
}

gruppe('Das Alter folgt der Stufe');

gleich('Stufe 1 ist Klasse 5/6',      10, pu_stufen_alter(1)['von']);
gleich('Stufe 2 auch',                12, pu_stufen_alter(2)['bis']);
gleich('Stufe 3 ist älter',           13, pu_stufen_alter(3)['von']);
gleich('Stufe 6 ist Oberstufe',       16, pu_stufen_alter(6)['von']);
gleich('Fachkurse sind für Ältere',   14, pu_stufen_alter(0)['von']);

// Die Bänder müssen aufsteigen, sonst wäre die Staffel keine.
$vorher = 0;
foreach ([1, 2, 3, 4, 5, 6] as $st) {
    $von = pu_stufen_alter($st)['von'];
    pruefe("Stufe $st ist nicht jünger als die davor", $von >= $vorher, "$von < $vorher");
    $vorher = $von;
}

// ================================================================ Stücke
gruppe('Jedes Stück des Stoffs kommt vor');

$stuecke = pu_sprecher_stuecke();
pruefe('Es gibt Stücke', count($stuecke) > 10, count($stuecke) . ' gefunden');

$index = pu_index();
$sollKurse = count($index['kurse']);
$sollLek   = 0;
$sollPruef = 0;
foreach ($index['kurse'] as $k) {
    $sollLek += count($k['lektionen']);
    if ($k['pruefung'] !== null) $sollPruef++;
}

$ist = ['kurs' => 0, 'lektion' => 0, 'pruefung' => 0];
foreach ($stuecke as $s) $ist[$s['art']]++;

gleich('jeder Kurs ist dabei',     $sollKurse, $ist['kurs']);
gleich('jede Lektion ist dabei',   $sollLek,   $ist['lektion']);
gleich('jede Prüfung ist dabei',   $sollPruef, $ist['pruefung']);

foreach ($stuecke as $s) {
    pruefe('Stück hat einen Titel: ' . $s['stueck'], trim($s['titel']) !== '');
    pruefe('Stück nennt seine Quelle: ' . $s['stueck'], trim($s['quelle']) !== '');
}

gruppe('Nach Kurs filtern');

$nur = pu_sprecher_stuecke('10_Stufen/01_Entdecker');
pruefe('der Filter greift', count($nur) < count($stuecke) && count($nur) > 0);
foreach ($nur as $s) {
    pruefe('nur dieser Kurs', str_starts_with($s['kurs'], '10_Stufen/01_Entdecker'));
}
gleich('ein erfundener Kurs liefert nichts', [], pu_sprecher_stuecke('gibt/es/nicht'));

// ================================================================ Keine Lösungen
gruppe('Keine Lösung im Sprechertext');

// Das ist die wichtigste Prüfung hier. Der Stoff, der an das Modell geht,
// darf die Aufgabenblöcke nicht enthalten — sie tragen `loesung:`, und ein
// Video, das die Antwort verrät, macht die Aufgabe wertlos.
$mitAufgaben = array_filter($stuecke, fn($s) => $s['aufgaben'] > 0);
pruefe('Es gibt Stücke mit Aufgaben', count($mitAufgaben) > 0);

foreach ($mitAufgaben as $s) {
    pruefe('kein Aufgabenblock in: ' . $s['stueck'],
           !str_contains($s['text'], '```aufgabe'));
    pruefe('kein Lösungsfeld in: ' . $s['stueck'],
           !preg_match('/^\s*loesung:/m', $s['text']));
    pruefe('kein Hinweisfeld in: ' . $s['stueck'],
           !preg_match('/^\s*hinweise:/m', $s['text']));
}

// ================================================================ Der Auftrag
gruppe('Der Auftrag ans Modell');

$eins = $stuecke[1];

foreach (array_keys(PU_ZIELGRUPPEN) as $g) {
    $a = pu_sprecher_auftrag($eins, $g);

    pruefe("$g: Systemtext ist da",  mb_strlen($a['system']) > 500);
    pruefe("$g: Prompt ist da",      mb_strlen($a['prompt']) > 100);
    pruefe("$g: die Wortgrenze steht drin",
           str_contains($a['system'], (string)PU_ZIELGRUPPEN[$g]['woerter']));
    pruefe("$g: der Zielgruppen-Kontext ist mit drin",
           str_contains($a['system'], 'Wer diese Menschen sind'));
    pruefe("$g: der Titel steht im Prompt", str_contains($a['prompt'], $eins['titel']));

    // Ein Sprechertext wird vorgelesen — das muss dem Modell gesagt werden,
    // sonst kommt Markdown zurück.
    pruefe("$g: der Hinweis aufs Vorlesen steht drin", str_contains($a['system'], 'VORGELESEN'));
}

// Nur die Schüler-Fassung nennt ein Alter. Bei Erwachsenen wäre es
// bedeutungslos — und ein Modell, das es liest, richtet den Ton daran aus.
pruefe('Schüler: das Alter steht im Auftrag',
       str_contains(pu_sprecher_auftrag($eins, 'schueler')['system'], 'Jahre alt'));
pruefe('Lehrkraft: kein Alter im Auftrag',
       !str_contains(pu_sprecher_auftrag($eins, 'lehrer')['system'], 'Jahre alt'));

// „Ganzer Kurs" war einmal mehrdeutig — ein Modell verstand es als „ein Text
// je Lektion" und lief beim Nachdenken in die Token-Grenze.
$kursStueck = array_values(array_filter($stuecke, fn($s) => $s['art'] === 'kurs'))[0];
$kursAuftrag = pu_sprecher_auftrag($kursStueck, 'schueler');
pruefe('bei einem Kurs steht ausdrücklich EIN Text',
       str_contains($kursAuftrag['prompt'], 'EIN zusammenhängender'));

// ================================================================ Die Notiz
gruppe('Die OKF-Notiz');

$notiz = pu_sprecher_notiz($eins, 'eltern',
    "Dein Kind lernt gerade, wie ein Sprachmodell Text liest. Frag es doch mal, "
  . "was ein Token ist.", 'probe/modell');

pruefe('Frontmatter beginnt die Datei', str_starts_with($notiz, "---\n"));
pruefe('type ist gesetzt',       str_contains($notiz, 'type: sprechertext'));
pruefe('Zielgruppe steht drin',  str_contains($notiz, 'zielgruppe: eltern'));
pruefe('Ebene steht drin',       str_contains($notiz, 'ebene: eltern'));
// Schrägstriche im Frontmatter dürfen nicht als \/ dastehen — YAML liest
// das anders, und ein Pfad, den man nicht kopieren kann, ist keiner.
pruefe('die Quelle steht drin',  str_contains($notiz, $eins['quelle']));
pruefe('…ohne escapte Schrägstriche', !str_contains($notiz, '\/'));
pruefe('die Kontextdatei steht drin',
       str_contains($notiz, '000_Kontext/eltern'));
pruefe('das Modell steht drin',  str_contains($notiz, 'probe/modell'));
pruefe('Stand ist Entwurf',      str_contains($notiz, 'stand: entwurf'));
pruefe('OKF-Kontext ist verknüpft', str_contains($notiz, 'kontext: "[[PROMPTHEUS WISSEN]]"'));
pruefe('der Wikilink zum Kontext steht drin', str_contains($notiz, '[[eltern]]'));
pruefe('der Text selbst steht drin', str_contains($notiz, 'was ein Token ist'));

// Wörter und Sekunden müssen zusammenpassen — sonst plant jemand mit einer
// Zahl, die niemand gerechnet hat.
$probetext = "Dein Kind lernt gerade, wie ein Sprachmodell Text liest. Frag es doch mal, "
           . "was ein Token ist.";

preg_match('/woerter: (\d+)/', $notiz, $w);
preg_match('/sekunden: (\d+)/', $notiz, $sek);
gleich('die Wörter sind gezählt',
       count(preg_split('/\s+/u', $probetext, -1, PREG_SPLIT_NO_EMPTY)), (int)$w[1]);
pruefe('die Sekunden passen zur Wortzahl',
       (int)$sek[1] === (int)round((int)$w[1] / 150 * 60), $sek[1] . ' s');

gruppe('Pfade');

$p = pu_sprecher_pfad('10_Stufen/01_Entdecker', '02_lektion_tokens', 'lehrer');
gleich('der Pfad steht unter 50_Sprecher_Bilder_Videos',
       '50_Sprecher_Bilder_Videos/10_Stufen/01_Entdecker/02_lektion_tokens__lehrer.md', $p);

// Vier Zielgruppen, vier verschiedene Dateien — sonst überschreiben sie sich.
$pfade = array_map(
    fn($g) => pu_sprecher_pfad('a', 'b', $g),
    array_keys(PU_ZIELGRUPPEN));
gleich('jede Zielgruppe hat ihre eigene Datei', 4, count(array_unique($pfade)));

bilanz();
