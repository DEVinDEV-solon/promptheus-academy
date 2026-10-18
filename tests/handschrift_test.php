<?php
declare(strict_types=1);
/**
 * Die Handschrift: Guideline je Konto nach dem 7. Kurs.
 *
 * Geprüft wird, was schiefgehen könnte: Persönliches im Systemprompt, eine
 * fremde Handschrift in der Werkstatt, ein Freischalten vor dem Kurs, HTML aus
 * der Eingabe auf der eigenen Seite, `{{` im Persona-Block.
 *
 * Aufruf:
 *     php -d extension=pdo_sqlite -d extension=sqlite3 tests/handschrift_test.php
 */

require_once __DIR__ . '/hilfe.php';
test_db_vorbereiten();

$tmp = sys_get_temp_dir() . '/pu_handschrift_' . bin2hex(random_bytes(5));
putenv('PU_TEST_HANDSCHRIFT=' . $tmp . '/handschrift');
putenv('PU_TEST_WERKSTATT=' . $tmp . '/ws');
putenv('PU_TEST_WERKSTATT_TICKET=' . $tmp . '/werkstatt/ticket.json');

require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../srv/db.php';
require_once __DIR__ . '/../srv/einstellungen.php';
require_once __DIR__ . '/../srv/lernende.php';
require_once __DIR__ . '/../srv/handschrift.php';

$chef     = pu_lernenden_anlegen('chef', 'Chef', 'probe1234', 'admin');
$schueler = pu_lernenden_anlegen('probant', 'Probant', 'probe1234', 'schueler');

/** Eine vollständige Brand-Guideline, wie sie aus dem Assistenten kommt. */
$voll = [
    'art' => 'marke',
    'ausweis' => ['was' => 'Fahrradladen Kette & Co', 'fuer_wen' => 'Pendler im Viertel',
                  'satz' => 'Wir halten dich am Rollen.', 'bild' => 'eine offene Werkstatt',
                  'haltung' => 'erklären statt verkaufen', 'unbekannt' => 'fällt weg'],
    'persoenlichkeit' => [
        ['eigenschaft' => 'direkt', 'aber_nicht' => 'schroff'],
        ['eigenschaft' => 'hilfsbereit', 'aber_nicht' => 'aufdringlich'],
        ['eigenschaft' => 'handfest', 'aber_nicht' => 'grob'],
    ],
    'register' => [['gruppe' => 'Kunden', 'aenderung' => 'kurz, mit Preis']],
    'sprache' => ['ansprache' => 'du',
                  'paare' => [['gut' => 'Fertig ab Donnerstag.', 'schlecht' => 'Bald!!!']],
                  'verbote' => ['mega', 'Mega', 'unglaublich']],
    'gestalt' => ['farben' => [
        ['name' => 'weiter', 'hex' => '#B74E0C', 'bedeutung' => 'hier geht es weiter'],
        ['name' => 'geschafft', 'hex' => '#9a6a00', 'bedeutung' => 'das hast du erreicht'],
        ['name' => 'erklärt', 'hex' => '#2f6394', 'bedeutung' => 'hier wird erklärt'],
    ], 'schrift' => 'Atkinson Hyperlegible'],
    'formen' => [['anlass' => 'Terminbestätigung', 'form' => '2 Sätze, Datum zuerst'],
                 ['anlass' => 'Reparaturangebot', 'form' => 'Preis, Dauer, Weg']],
    'trennlinie' => ['fest' => ['Ansprache du', 'Verbotsliste'], 'frei' => ['Beispiele']],
    'absage' => 'Jede Absage nennt einen anderen Laden',
];

// ================================================================ Freigabe
gruppe('Freigabe');

pruefe('Schüler ohne Stufen ist nicht frei', !pu_handschrift_frei($schueler)['frei']);
gleich('… und der Grund nennt die Stufen', 'stufen_offen', pu_handschrift_frei($schueler)['grund']);
pruefe('Betreiber ist frei', pu_handschrift_frei($chef)['frei']);
gleich('Schüler bekommt die persönliche Guideline', 'persoenlich', pu_handschrift_vorgabe_art($schueler));
gleich('Admin bekommt die Brand-Guideline', 'marke', pu_handschrift_vorgabe_art($chef));

// ================================================================ Säubern
gruppe('Säubern');

$s = pu_handschrift_saeubern($voll)['daten'];
pruefe('unbekannte Schlüssel fallen weg', !isset($s['ausweis']['unbekannt']));
gleich('Hexwerte werden klein geschrieben', '#b74e0c', $s['gestalt']['farben'][0]['hex']);
gleich('Umlaute im Tokennamen werden umschrieben', 'erklaert', $s['gestalt']['farben'][2]['name']);
gleich('doppelte Verbote (gross/klein) fallen weg', ['mega', 'unglaublich'], $s['sprache']['verbote']);

wirft('eine Farbe, die keine ist, wird abgewiesen',
      fn() => pu_handschrift_saeubern(['gestalt' => ['farben' => [['hex' => 'red; } body {']]]]), 'kein Farbwert');

$lang = pu_handschrift_saeubern(['ausweis' => ['was' => str_repeat('x', 500)]])['daten'];
gleich('Texte werden auf 200 Zeichen gekürzt', 200, mb_strlen($lang['ausweis']['was']));

$viel = pu_handschrift_saeubern(['persoenlichkeit' => array_fill(0, 9, ['eigenschaft' => 'a'])])['daten'];
gleich('höchstens vier Eigenschaften', 4, count($viel['persoenlichkeit']));

$zeile = pu_handschrift_saeubern(['ausweis' => ['haltung' => "eins\nzwei\tdrei"]])['daten'];
gleich('Zeilenumbrüche werden zu Leerzeichen', 'eins zwei drei', $zeile['ausweis']['haltung']);

gleich('unbekannte Ansprache wird zu „du“', 'du',
       pu_handschrift_saeubern(['sprache' => ['ansprache' => 'Eure Hoheit']])['daten']['sprache']['ansprache']);

// ================================================================ PII
gruppe('PII-Sperre');

$p = pu_handschrift_saeubern(['ausweis' => ['was' => 'Schreib mir: jemand@example.com']]);
pruefe('E-Mail-Adresse wird ersetzt', !str_contains($p['daten']['ausweis']['was'], '@example.com'),
       $p['daten']['ausweis']['was']);
pruefe('… und als Treffer gemeldet', $p['treffer'] !== []);
gleich('… mit dem Feld, nicht mit dem Wert', 'ausweis.was', $p['treffer'][0]['feld'] ?? '');
pruefe('der Treffer enthält den Wert nicht', !str_contains(json_encode($p['treffer']), 'jemand@'));

// ================================================================ Vollständig
gruppe('Vollständig');

pruefe('eine leere Guideline ist nicht vollständig', pu_handschrift_fehlt(pu_handschrift_leer('marke')) !== []);
gleich('die Beispiel-Guideline ist vollständig', [], pu_handschrift_fehlt($s));
$halb = $s; $halb['gestalt']['farben'][2]['bedeutung'] = '';
pruefe('eine Farbe ohne Bedeutung zählt nicht', pu_handschrift_fehlt($halb) !== []);
$pers = pu_handschrift_saeubern(['art' => 'persoenlich',
    'ausweis' => ['was' => 'meine Comics', 'haltung' => 'ehrlich'],
    'persoenlichkeit' => [['eigenschaft' => 'witzig'], ['eigenschaft' => 'genau']],
    'sprache' => ['verbote' => ['krass']],
    'gestalt' => ['farben' => $voll['gestalt']['farben']],
    'formen' => [['anlass' => 'Comicseite', 'form' => '4 Bilder']]])['daten'];
gleich('die persönliche Guideline braucht weniger', [], pu_handschrift_fehlt($pers));

// ================================================================ Erzeugtes
gruppe('Erzeugte Dateien');

$sp = pu_handschrift_systemprompt($s);
gleich('der Baustein hat sechs Zeilen', 6, count(explode("\n", trim($sp))));
pruefe('… mit der Verbotsliste', str_contains($sp, 'nie vor: mega, unglaublich'));
pruefe('… mit der Absage-Regel', str_contains($sp, 'Absagen: Jede Absage nennt einen anderen Laden.'));
pruefe('… ohne Hexwerte', !str_contains($sp, '#b74e0c'));

$css = pu_handschrift_css($s);
pruefe('die Farben werden Tokens', str_contains($css, '--weiter: #b74e0c;'));
pruefe('… mit Bedeutung als Kommentar', str_contains($css, '/* hier geht es weiter */'));
$boese = $s; $boese['gestalt']['farben'][0]['bedeutung'] = 'ende */ body{display:none} /*';
pruefe('ein Kommentarende in der Bedeutung bricht das CSS nicht auf', !str_contains(pu_handschrift_css($boese), 'ende */'));

$md = pu_handschrift_brand_md($s);
foreach (['## 1 · Ausweis', '## 5 · Gestalt', '## 7 · Einsatz', '## 8 · Trennlinie'] as $kopf) {
    pruefe("BRAND.md hat „{$kopf}“", str_contains($md, $kopf));
}
pruefe('ein & im Namen bleibt im Dokument', str_contains($md, 'Kette & Co'));

$html = pu_handschrift_html(pu_handschrift_saeubern(['ausweis' => ['satz' => '<script>alert(1)</script>']])['daten']);
pruefe('die eigene Seite escaped die Eingabe', !str_contains($html, '<script>') && str_contains($html, '&lt;script&gt;'));

$block = pu_handschrift_agentenblock(pu_handschrift_saeubern(['ausweis' => ['was' => 'a {{model}} b']])['daten']);
pruefe('der Agentenblock trägt kein {{', !str_contains($block, '{{'));
pruefe('der Agentenblock trennt Herstellen und Sprechen', str_contains($block, 'Wie du selbst mit dem Nutzer sprichst'));

$zip = pu_handschrift_paket($s);
$datei = $tmp . '/paket.zip';
@mkdir($tmp, 0700, true);
file_put_contents($datei, $zip);
$z = new ZipArchive();
$z->open($datei);
$namen = [];
for ($i = 0; $i < $z->numFiles; $i++) $namen[] = $z->getNameIndex($i);
$z->close();
sort($namen);
gleich('das Paket hat die sechs Dateien aus Lektion 6',
       ['BRAND.md', 'LIZENZ.md', 'PRUEFLISTE.md', 'index.html', 'stil.css', 'systemprompt.txt'], $namen);

// ================================================================ Ablage und Übergabe
gruppe('Ablage und Übergabe');

pruefe('ohne Speichern gibt es keine Guideline', pu_handschrift($chef) === null);
$r = pu_handschrift_speichern($chef, $voll);
gleich('Speichern meldet nichts Fehlendes', [], $r['fehlt']);
foreach (['handschrift.json', 'BRAND.md', 'systemprompt.txt', 'stil.css'] as $f) {
    pruefe("$f liegt im Ordner des Kontos", is_file(pu_handschrift_ordner($chef) . '/' . $f));
}
gleich('Lesen gibt zurück, was gespeichert wurde', 'Fahrradladen Kette & Co', pu_handschrift($chef)['ausweis']['was']);
pruefe('eine fremde Guideline ist nicht sichtbar', pu_handschrift($schueler) === null);

pruefe('ohne Werkstatt gibt es keine Übergabe', pu_handschrift_uebergabe_konto() === null);
pu_handschrift_uebergeben($chef);
$u = json_decode((string)file_get_contents(pu_handschrift_uebergabe_pfad()), true);
gleich('die Übergabe gehört dem öffnenden Konto', $chef, $u['lernender']);
pruefe('… und trägt den Block', str_contains($u['block'], 'Fahrradladen'));
pruefe('… und die Kurzfassung für das Cinema Studio', str_contains($u['kurz'], '#b74e0c = hier geht es weiter'));

$geaendert = $voll; $geaendert['ausweis']['satz'] = 'Neu gesagt.';
pu_handschrift_speichern($chef, $geaendert);
$u = json_decode((string)file_get_contents(pu_handschrift_uebergabe_pfad()), true);
pruefe('Speichern erneuert die Übergabe des eigenen Kontos', str_contains($u['block'], 'Neu gesagt.'));

pu_handschrift_uebergeben($schueler);
$u = json_decode((string)file_get_contents(pu_handschrift_uebergabe_pfad()), true);
gleich('öffnet ein anderes Konto, gehört die Übergabe ihm', $schueler, $u['lernender']);
gleich('… und die Handschrift des ersten ist weg', '', $u['block']);

pu_handschrift_speichern($chef, $voll);
$u = json_decode((string)file_get_contents(pu_handschrift_uebergabe_pfad()), true);
gleich('Speichern eines anderen Kontos fasst die Übergabe nicht an', '', $u['block']);

pu_handschrift_uebergeben($chef);
pu_handschrift_loeschen($chef);
pruefe('Löschen entfernt die Guideline', pu_handschrift($chef) === null);
$u = json_decode((string)file_get_contents(pu_handschrift_uebergabe_pfad()), true);
gleich('… und leert die Übergabe', '', $u['block']);

$entwurf = $voll; $entwurf['formen'] = [];
pu_handschrift_speichern($chef, $entwurf);
$u = json_decode((string)file_get_contents(pu_handschrift_uebergabe_pfad()), true);
gleich('ein Entwurf geht nicht in den Einsatz', '', $u['block']);

$stand = pu_handschrift_stand($chef);
pruefe('der Stand nennt, was fehlt', $stand['fehlt'] !== [] && !$stand['im_einsatz']);

bilanz();
