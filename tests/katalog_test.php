<?php
declare(strict_types=1);
/**
 * Der Modellkatalog — alles, was sich ohne Netz prüfen lässt.
 *
 * Geholt wird hier nichts. Was geprüft wird, ist das, woran die Modellwahl
 * tatsächlich scheitern kann: die Umformung eines Katalogeintrags und das
 * Suchen darin.
 *
 * **Die eine Angabe, auf die es ankommt, ist `kann_ton`.** Sie trennt die
 * Handvoll Modelle, mit denen Vorlesen überhaupt geht, von den vierhundert,
 * mit denen es nicht geht. Steht sie falsch, wählt jemand ein Modell, bekommt
 * Text statt Ton und sucht den Fehler bei der Stimme.
 */
require_once __DIR__ . '/hilfe.php';
test_db_vorbereiten();

require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../srv/einstellungen.php';
require_once __DIR__ . '/../srv/katalog.php';

/** Ein Eintrag, wie ihn OpenRouter liefert. */
function roh(string $id, array $aus = ['text'], float $ein = 0.000001,
             float $raus = 0.000002, array $hinein = ['text']): array
{
    return [
        'id'   => $id,
        'name' => strtoupper($id),
        'description'    => 'Ein Modell.',
        'context_length' => 128000,
        'architecture'   => ['input_modalities' => $hinein, 'output_modalities' => $aus],
        'pricing'        => ['prompt' => (string)$ein, 'completion' => (string)$raus],
    ];
}

// ================================================================ Umformen
gruppe('Ein Eintrag wird auf das Nötige gebracht');

$m = pu_katalog_eintrag(roh('openai/gpt-audio-mini', ['text', 'audio'], 0.0000006, 0.0000024,
                            ['text', 'audio']));

gleich('die Kennung bleibt', 'openai/gpt-audio-mini', $m['id']);
gleich('der Hersteller ist der Teil vor dem Schrägstrich', 'openai', $m['hersteller']);
gleich('die Kontextlänge kommt mit', 128000, $m['kontext']);

// Die Spalte, die diese ganze Datei rechtfertigt.
pruefe('gibt Ton aus',  $m['kann_ton']);
pruefe('hört auch zu',  $m['hoert_zu']);
pruefe('und es kostet', !$m['frei']);

$m = pu_katalog_eintrag(roh('deepseek/deepseek-chat'));
pruefe('ein gewöhnliches Modell gibt keinen Ton aus', !$m['kann_ton']);

// Ein Eintrag ohne Kennung ist unbrauchbar und fliegt heraus, statt als leere
// Zeile in der Liste zu stehen.
gleich('ohne Kennung kein Eintrag', null, pu_katalog_eintrag(['name' => 'Namenlos']));

// Ein Katalog, dem ein Feld fehlt, darf die Modellwahl nicht lahmlegen.
$m = pu_katalog_eintrag(['id' => 'nackt/modell']);
gleich('ein fast leerer Eintrag bleibt brauchbar', 'nackt/modell', $m['id']);
gleich('…und fällt beim Namen auf die Kennung zurück', 'nackt/modell', $m['name']);
gleich('…kein Kontext gemeldet, keine Zahl erfunden', 0, $m['kontext']);

// Ohne Schrägstrich ist die Kennung selbst der Hersteller — das kommt bei
// Sondereinträgen vor und darf nicht in einer leeren Gruppe enden.
gleich('ohne Schrägstrich ist die Kennung der Hersteller',
       'sonderfall', pu_katalog_eintrag(['id' => 'sonderfall'])['hersteller']);

// ================================================================ Kostenlos
gruppe('Was als kostenlos gilt');

pruefe('beide Preise null ist kostenlos',
       pu_katalog_eintrag(roh('x/y', ['text'], 0, 0))['frei']);
pruefe('die Endung :free zählt auch',
       pu_katalog_eintrag(roh('x/y:free', ['text'], 0.001, 0.002))['frei']);
pruefe('ein Preis heisst nicht kostenlos',
       !pu_katalog_eintrag(roh('x/y', ['text'], 0.000001, 0))['frei']);

// ================================================================ Suchen
gruppe('In der Liste suchen');

$liste = array_map('pu_katalog_eintrag', [
    roh('openai/gpt-audio',      ['text', 'audio']),
    roh('openai/gpt-audio-mini', ['text', 'audio']),
    roh('openai/gpt-5.5'),
    roh('x-ai/grok-voice-tts-1.0', ['audio']),
    roh('deepseek/deepseek-chat'),
    roh('stealth/ox-alpha', ['text'], 0, 0),
]);

gleich('ohne Filter alle', 6, count(pu_katalog_filter($liste)));

gleich('nach Hersteller', 3, count(pu_katalog_filter($liste, 'openai')));

// Wer „openai" tippt, darf nicht daran scheitern, dass der Eintrag anders
// geschrieben ist — und wer nur einen Teil weiss, soll trotzdem finden.
gleich('Gross- und Kleinschreibung egal', 3, count(pu_katalog_filter($liste, 'OpenAI')));
gleich('ein Teil des Namens genügt',      1, count(pu_katalog_filter($liste, 'x-ai')));

gleich('im Namen suchen', 2, count(pu_katalog_filter($liste, '', 'gpt-audio')));
gleich('beides zusammen', 1, count(pu_katalog_filter($liste, 'x-ai', 'grok')));

/* **Der Filter, wegen dem der Katalog überhaupt hereingeholt wird.**
   Ohne ihn müsste man vierhundert Modelle durchsehen, um die drei zu finden,
   mit denen Vorlesen geht. */
$ton = pu_katalog_filter($liste, '', '', 'ton');
gleich('nur mit Tonausgabe', 3, count($ton));
pruefe('und x-ai ist dabei — es kann das wirklich',
       in_array('x-ai/grok-voice-tts-1.0', array_column($ton, 'id'), true));

gleich('nur kostenlose', 1, count(pu_katalog_filter($liste, '', '', 'frei')));
gleich('Filter lassen sich kombinieren',
       2, count(pu_katalog_filter($liste, 'openai', '', 'ton')));

gleich('was es nicht gibt, kommt leer zurück',
       0, count(pu_katalog_filter($liste, 'gibtesnicht')));

// ================================================================ Tippfehler
gruppe('Eine Suche darf nicht an einem Bindestrich scheitern');

/* **Der gemessene Fall.** Der Hersteller von Grok heisst bei OpenRouter
   `x-ai`. Wer „xai" eintippt — und das tut jeder —, fand vorher nichts, weil
   ein Strich dazwischenstand. Eine Suche, die „gibt es nicht" über etwas sagt,
   das da ist, ist schlimmer als gar keine Antwort. */
gleich('xai findet x-ai',      1, count(pu_katalog_filter($liste, 'xai')));
gleich('X-AI auch',            1, count(pu_katalog_filter($liste, 'X-AI')));
gleich('mit Leerzeichen auch', 1, count(pu_katalog_filter($liste, ' x ai ')));

gleich('gpt audio findet gpt-audio', 2, count(pu_katalog_filter($liste, '', 'gpt audio')));
gleich('gptaudio auch',              2, count(pu_katalog_filter($liste, '', 'gptaudio')));

gruppe('Wer einen Modellnamen ins Herstellerfeld tippt');

/* „grok" ist kein Hersteller. Sieben Modelle heissen aber so — eine leere
   Liste wäre formal richtig und praktisch unbrauchbar. */
$s = pu_katalog_suchen($liste, 'grok');
gleich('gefunden wird trotzdem', 1, count($s['treffer']));
pruefe('…und es steht dran, dass ausgewichen wurde', $s['ausweich']);

$s = pu_katalog_suchen($liste, 'openai');
pruefe('ein echter Hersteller weicht nicht aus', !$s['ausweich']);
gleich('…und findet seine drei',                3, count($s['treffer']));

// Der Filter bleibt beim Ausweichen erhalten — sonst käme bei „nur mit
// Tonausgabe" plötzlich ein Modell zurück, das keinen Ton kann.
$s = pu_katalog_suchen($liste, 'grok', '', 'ton');
gleich('der Tonfilter gilt auch beim Ausweichen', 1, count($s['treffer']));
$s = pu_katalog_suchen($liste, 'deepseek', '', 'ton');
gleich('…und schliesst aus, was keinen Ton kann', 0, count($s['treffer']));

$s = pu_katalog_suchen($liste, 'gibtesnirgends');
gleich('was es wirklich nicht gibt, bleibt leer', 0, count($s['treffer']));
pruefe('…und dann wird auch nichts behauptet',    !$s['ausweich']);

// ================================================================ Hersteller
gruppe('Die Herstellerliste — das erste Feld in der Oberfläche');

$h = pu_katalog_hersteller($liste);
gleich('vier Hersteller', 4, count($h));

// Sortiert nach Anzahl: Wer „Hersteller" liest, sucht meist einen der grossen.
gleich('der grösste steht oben', 'openai', $h[0]['name']);
gleich('…mit seiner Anzahl',      3,        $h[0]['anzahl']);
gleich('…und wie viele davon Ton können', 2, $h[0]['ton']);

// ================================================================ Preise
gruppe('Preise, die man vergleichen kann');

// Je Token wären es Zahlen mit sieben Nullen. Je Million ist die einzige
// Einheit, in der zwei Modelle nebeneinander etwas bedeuten.
gleich('je Million Token', 1.0,  pu_katalog_preis(0.000001));
gleich('auch krumme Beträge', 0.6, pu_katalog_preis(0.0000006));

bilanz();
