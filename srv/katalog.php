<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — der Modellkatalog von OpenRouter.
 *
 * Bis hierher stand in den Einstellungen ein leeres Textfeld und daneben ein
 * Link nach draussen. Wer ein Modell wechseln wollte, öffnete einen Reiter,
 * suchte die Kennung, kopierte sie zurück und hoffte, dass er die richtige
 * erwischt hatte — denn die Überschrift auf der Stöberseite ist nicht die
 * Kennung. Eine falsche Kennung ergibt stumme Tutoren und eine Fehlermeldung,
 * die nach einem Netzproblem aussieht.
 *
 * Diese Datei holt die Liste stattdessen selbst. `…/api/v1/models` ist
 * **öffentlich**: Sie braucht keinen Schlüssel und funktioniert deshalb auch,
 * bevor einer hinterlegt ist. Das ist der Grund, warum das Stöbern hier vor dem
 * Einrichten kommen darf und nicht danach.
 *
 * ## Was normalisiert wird — und warum
 *
 * OpenRouter liefert je Eintrag rund zwanzig Felder. Gebraucht werden sechs.
 * Der Rest wird weggelassen, nicht weil er uninteressant wäre, sondern weil
 * eine zwischengespeicherte Datei sonst mit jedem Katalogumbau kaputtgeht.
 *
 * Zwei abgeleitete Angaben sind wichtiger als alles Übrige:
 *
 *   · `kann_ton` — gibt das Modell Ton AUS? Das trennt die Handvoll Modelle,
 *     mit denen Vorlesen überhaupt geht, von den vierhundert, mit denen es
 *     nicht geht. Ohne diese Spalte sucht man den Fehler bei der Stimme.
 *   · `frei` — kostet es nichts? Für eine Academy, die alles selbst bezahlt,
 *     ist das keine Nebensache.
 */

const PU_KATALOG_URL = 'https://openrouter.ai/api/v1/models';

/**
 * Wie lange eine geholte Liste gilt: zwölf Stunden.
 *
 * Der Katalog ändert sich in Wochen, nicht in Minuten. Bei jedem Öffnen der
 * Einstellungen ins Netz zu gehen, machte das Fenster langsam und den Dienst
 * ohne Not zum Nadelöhr. Wer trotzdem sofort die neueste Liste will, hat den
 * Knopf „Neu holen" — das ist der ehrlichere Weg als eine kurze Frist.
 */
const PU_KATALOG_FRIST = 12 * 3600;

/**
 * Wie ein Katalogeintrag sagt, dass er sprechen kann — und es sind zwei Wörter.
 *
 * **Gemessen, und es war eine Korrektur.** `openai/gpt-audio-mini` meldet
 * `output_modalities: ["audio"]`. `x-ai/grok-voice-tts-1.0` meldet dagegen
 * `["speech"]` und `modality: "text->speech"`. Wer nur auf „audio" prüft,
 * übersieht ausgerechnet die reinen Sprechmodelle — also die, um die es hier
 * geht. Ein Filter, der das Naheliegende ausschliesst, ist schlimmer als
 * keiner: Er sagt „gibt es nicht", und man glaubt ihm.
 */
const PU_TON_WOERTER = ['audio', 'speech'];

function pu_katalog_kann_ton(array $aus, string $modalitaet = ''): bool
{
    if (array_intersect(PU_TON_WOERTER, $aus)) return true;

    // Manche Einträge führen die Ausgabeform nur in `modality` („text->speech").
    foreach (PU_TON_WOERTER as $w) {
        if (str_contains(strtolower($modalitaet), '>' . $w)) return true;
    }
    return false;
}

function pu_katalog_datei(): string
{
    $ordner = PU_DATA . '/tmp';
    if (!is_dir($ordner)) @mkdir($ordner, 0777, true);
    return $ordner . '/or-modelle.json';
}

/**
 * Ein Rohbeitrag aus dem Katalog auf das, was hier gebraucht wird.
 *
 * Alle Felder werden defensiv gelesen: Fehlt eines, steht dort ein leerer Wert
 * und der Eintrag bleibt brauchbar. Ein Katalog, an dem sich ein Feld ändert,
 * darf nicht die ganze Modellwahl lahmlegen.
 */
function pu_katalog_eintrag(array $roh): ?array
{
    $id = trim((string)($roh['id'] ?? ''));
    if ($id === '') return null;

    $ein = $roh['architecture']['input_modalities']  ?? [];
    $aus = $roh['architecture']['output_modalities'] ?? [];
    if (!is_array($ein)) $ein = [];
    if (!is_array($aus)) $aus = [];

    $preisEin = (float)($roh['pricing']['prompt']     ?? 0);
    $preisAus = (float)($roh['pricing']['completion'] ?? 0);
    $art      = (string)($roh['architecture']['modality'] ?? '');

    // Der Hersteller ist der Teil vor dem Schrägstrich — „openai/gpt-audio"
    // gehört zu „openai". Steht keiner da, ist die Kennung selbst der
    // Hersteller; das kommt bei Sondereinträgen vor.
    $teile      = explode('/', $id, 2);
    $hersteller = count($teile) === 2 ? $teile[0] : $id;

    return [
        'id'          => $id,
        'name'        => trim((string)($roh['name'] ?? $id)),
        'hersteller'  => $hersteller,
        'kontext'     => (int)($roh['context_length'] ?? 0),
        'ein'         => array_values(array_map('strval', $ein)),
        'aus'         => array_values(array_map('strval', $aus)),

        // **Die Spalte, die diese ganze Datei rechtfertigt.**
        'kann_ton'    => pu_katalog_kann_ton($aus, $art),
        'hoert_zu'    => (bool)array_intersect(PU_TON_WOERTER, $ein),
        'ungelistet'  => false,

        // Ein Modell gilt als frei, wenn beide Preise null sind. Die Endung
        // „:free" allein reicht nicht als Beweis, ist aber ein sicherer
        // Hinweis — beides zusammen ergibt die verlässlichere Antwort.
        'frei'        => ($preisEin <= 0 && $preisAus <= 0) || str_ends_with($id, ':free'),
        'preis_ein'   => $preisEin,
        'preis_aus'   => $preisAus,

        // Gekürzt, weil die vollständigen Beschreibungen mehrere hundert
        // Zeichen haben und die Liste sonst unlesbar wird.
        'kurz'        => mb_substr(trim((string)($roh['description'] ?? '')), 0, 220),
    ];
}

/**
 * Holt den Katalog aus dem Netz.
 *
 * Kein Schlüssel im Aufruf: Der Endpunkt ist offen, und was nicht mitgeschickt
 * wird, kann auch nicht verloren gehen.
 *
 * @return array{ok: bool, modelle: array, fehler: string}
 */
function pu_katalog_holen(): array
{
    require_once PU_ROOT . '/srv/tutor.php';   // pu_ca_bundle()

    $ch = curl_init(PU_KATALOG_URL);
    $ca = pu_ca_bundle();
    if ($ca !== '') curl_setopt($ch, CURLOPT_CAINFO, $ca);

    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 30,
        CURLOPT_CONNECTTIMEOUT => 15,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
        CURLOPT_HTTPHEADER     => ['HTTP-Referer: https://promptheus.local', 'X-Title: PROMPTHEUS'],
    ]);

    $antwort = curl_exec($ch);
    $code    = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $netz    = curl_error($ch);
    curl_close($ch);

    if ($antwort === false) {
        return ['ok' => false, 'modelle' => [],
                'fehler' => 'Der Katalog war nicht erreichbar: ' . $netz];
    }
    if ($code >= 400) {
        return ['ok' => false, 'modelle' => [], 'fehler' => 'Der Katalog meldet ' . $code . '.'];
    }

    $j = json_decode((string)$antwort, true);
    if (!is_array($j) || !is_array($j['data'] ?? null)) {
        return ['ok' => false, 'modelle' => [],
                'fehler' => 'Der Katalog kam in einer Form zurück, die hier nicht gelesen werden kann.'];
    }

    $modelle = [];
    foreach ($j['data'] as $roh) {
        if (!is_array($roh)) continue;
        $e = pu_katalog_eintrag($roh);
        if ($e !== null) $modelle[] = $e;
    }

    usort($modelle, fn($a, $b) => strcmp($a['id'], $b['id']));
    return ['ok' => true, 'modelle' => $modelle, 'fehler' => ''];
}

/**
 * Der Katalog, wie ihn die Oberfläche bekommt.
 *
 * **Eine alte Liste ist besser als keine.** Schlägt das Holen fehl und liegt
 * eine abgelaufene Datei da, wird die genommen und das Alter dazugesagt. Ein
 * Rechner ohne Netz soll seine Modelle trotzdem noch aufzählen können; nur
 * behaupten darf er nicht, die Liste sei aktuell.
 *
 * @return array{ok: bool, modelle: array, geholt: int, alt: bool, fehler: string}
 */
function pu_katalog(bool $frisch = false): array
{
    $datei = pu_katalog_datei();
    $liegt = null;

    if (is_file($datei)) {
        $j = json_decode((string)@file_get_contents($datei), true);
        if (is_array($j) && is_array($j['modelle'] ?? null)) $liegt = $j;
    }

    $alter = $liegt === null ? PHP_INT_MAX : time() - (int)($liegt['geholt'] ?? 0);
    if (!$frisch && $liegt !== null && $alter < PU_KATALOG_FRIST) {
        return ['ok' => true, 'modelle' => $liegt['modelle'],
                'geholt' => (int)$liegt['geholt'], 'alt' => false, 'fehler' => ''];
    }

    $neu = pu_katalog_holen();
    if ($neu['ok']) {
        @file_put_contents($datei, (string)json_encode(
            ['geholt' => time(), 'modelle' => $neu['modelle']],
            JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
        return ['ok' => true, 'modelle' => $neu['modelle'],
                'geholt' => time(), 'alt' => false, 'fehler' => ''];
    }

    if ($liegt !== null) {
        return ['ok' => true, 'modelle' => $liegt['modelle'],
                'geholt' => (int)$liegt['geholt'], 'alt' => true, 'fehler' => $neu['fehler']];
    }
    return ['ok' => false, 'modelle' => [], 'geholt' => 0, 'alt' => false, 'fehler' => $neu['fehler']];
}

// ------------------------------------------------------------ Ungelistete
/**
 * Ein einzelnes Modell nachschlagen — auch eines, das in der Liste fehlt.
 *
 * **Das ist der Fall, den die Liste allein nicht löst.** `/api/v1/models` gibt
 * 422 Einträge zurück, mit Schlüssel wie ohne. `x-ai/grok-voice-tts-1.0` ist
 * nicht darunter — es gibt das Modell aber, und direkt eingetragen funktioniert
 * es. Über `/api/v1/models/{id}/endpoints` kommt es zum Vorschein.
 *
 * Es ist also nicht so, dass die Liste unvollständig gelesen würde: Sie ist
 * unvollständig. Wer die Kennung kennt, soll deshalb nicht schlechter dastehen
 * als vorher, sondern besser — Preis, Kontextlänge und Ausgabeform kommen mit.
 */
function pu_katalog_einzeln(string $id): ?array
{
    require_once PU_ROOT . '/srv/tutor.php';

    $id = trim($id, " \t\n\r/");
    // Ohne Schrägstrich ist es keine Kennung, sondern ein Suchwort — und ein
    // Aufruf ins Netz für jedes getippte Wort wäre eine Zumutung für beide Seiten.
    if ($id === '' || !str_contains($id, '/')) return null;
    if (!preg_match('#^[A-Za-z0-9~][A-Za-z0-9._:/-]{0,80}$#', $id)) return null;

    $ch = curl_init('https://openrouter.ai/api/v1/models/' . $id . '/endpoints');
    $ca = pu_ca_bundle();
    if ($ca !== '') curl_setopt($ch, CURLOPT_CAINFO, $ca);

    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 20,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
        CURLOPT_HTTPHEADER     => ['HTTP-Referer: https://promptheus.local', 'X-Title: PROMPTHEUS'],
    ]);

    $antwort = curl_exec($ch);
    $code    = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);

    if ($antwort === false || $code >= 400) return null;

    $d = json_decode((string)$antwort, true)['data'] ?? null;
    if (!is_array($d) || trim((string)($d['id'] ?? '')) === '') return null;

    return pu_katalog_aus_endpunkten($d);
}

/**
 * Die Antwort der Einzelabfrage auf dieselbe Form bringen wie ein Listeneintrag.
 *
 * Der Unterschied im Aufbau: Der Preis steht dort nicht oben, sondern **je
 * Anbieter** in `endpoints`. Genommen wird der günstigste — das ist der, über
 * den OpenRouter im Zweifel auch leitet.
 */
function pu_katalog_aus_endpunkten(array $d): array
{
    $preisEin = null;
    $preisAus = 0.0;
    $kontext  = 0;

    foreach (($d['endpoints'] ?? []) as $e) {
        if (!is_array($e)) continue;
        $p = (float)($e['pricing']['prompt'] ?? 0);
        if ($preisEin === null || $p < $preisEin) {
            $preisEin = $p;
            $preisAus = (float)($e['pricing']['completion'] ?? 0);
        }
        $kontext = max($kontext, (int)($e['context_length'] ?? 0));
    }

    $m = pu_katalog_eintrag([
        'id'   => $d['id'],
        'name' => $d['name'] ?? $d['id'],
        'description'    => $d['description'] ?? '',
        'context_length' => $kontext,
        'architecture'   => $d['architecture'] ?? [],
        'pricing'        => ['prompt' => (string)($preisEin ?? 0), 'completion' => (string)$preisAus],
    ]);

    $m['ungelistet'] = true;
    return $m;
}

/**
 * Ein nachgeschlagenes Modell in den Zwischenspeicher aufnehmen.
 *
 * Damit die Frage nur einmal gestellt werden muss: Was einmal gefunden wurde,
 * steht beim nächsten Öffnen in der Liste — und zwar als das, was es ist, mit
 * dem Vermerk „nicht in der öffentlichen Liste".
 */
function pu_katalog_merken(array $modell): void
{
    $datei = pu_katalog_datei();
    if (!is_file($datei)) return;

    $j = json_decode((string)@file_get_contents($datei), true);
    if (!is_array($j) || !is_array($j['modelle'] ?? null)) return;

    foreach ($j['modelle'] as $m) {
        if (($m['id'] ?? '') === $modell['id']) return;   // steht schon da
    }

    $j['modelle'][] = $modell;
    usort($j['modelle'], fn($a, $b) => strcmp($a['id'], $b['id']));
    @file_put_contents($datei, (string)json_encode($j,
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
}

/**
 * Die Hersteller mit Anzahl — das erste der beiden Felder in der Oberfläche.
 *
 * Sortiert nach Anzahl, nicht alphabetisch: Wer „Hersteller" liest, sucht
 * meistens einen der grossen, und der soll oben stehen.
 */
function pu_katalog_hersteller(array $modelle): array
{
    $zaehlung = [];
    foreach ($modelle as $m) {
        $h = $m['hersteller'];
        if (!isset($zaehlung[$h])) $zaehlung[$h] = ['name' => $h, 'anzahl' => 0, 'ton' => 0];
        $zaehlung[$h]['anzahl']++;
        if (!empty($m['kann_ton'])) $zaehlung[$h]['ton']++;
    }
    $aus = array_values($zaehlung);
    usort($aus, fn($a, $b) => $b['anzahl'] <=> $a['anzahl'] ?: strcmp($a['name'], $b['name']));
    return $aus;
}

/**
 * Sucht in der Liste.
 *
 * @param string $hersteller Teil eines Herstellernamens, leer = alle
 * @param string $suche      Teil einer Kennung oder eines Namens
 * @param string $nur        '' | 'ton' (gibt Ton aus) | 'frei' (kostenlos)
 *
 * Beide Textfelder suchen als **Teilzeichenkette und ohne Rücksicht auf
 * Gross- und Kleinschreibung**. Wer „openai" tippt, will nicht daran
 * scheitern, dass der Eintrag „OpenAI" heisst; und wer nur „audio" weiss,
 * soll gpt-audio finden, ohne den Hersteller zu kennen.
 */
function pu_katalog_filter(array $modelle, string $hersteller = '', string $suche = '',
                           string $nur = ''): array
{
    $hersteller = pu_katalog_schlicht($hersteller);
    $suche      = pu_katalog_schlicht($suche);

    $treffer = [];
    foreach ($modelle as $m) {
        if ($nur === 'ton'  && empty($m['kann_ton'])) continue;
        if ($nur === 'frei' && empty($m['frei']))     continue;

        if ($hersteller !== ''
            && !str_contains(pu_katalog_schlicht($m['hersteller']), $hersteller)) continue;

        if ($suche !== ''
            && !str_contains(pu_katalog_schlicht($m['id']), $suche)
            && !str_contains(pu_katalog_schlicht($m['name']), $suche)) continue;

        $treffer[] = $m;
    }
    return $treffer;
}

/**
 * Alles weg, was beim Tippen anders geraten kann: Striche, Punkte, Schrägstriche,
 * Gross- und Kleinschreibung.
 *
 * **Der Grund ist gemessen, nicht ausgedacht.** Der Hersteller von Grok heisst
 * bei OpenRouter `x-ai`. Wer „xai" eintippt — was jeder tut — fand vorher
 * nichts, weil ein Strich dazwischenstand. Eine Suche, die an einem Bindestrich
 * scheitert, ist als Suche nutzlos: Sie sagt „gibt es nicht" über etwas, das da
 * ist, und das ist schlimmer als gar keine Antwort.
 *
 * Dasselbe gilt in der anderen Richtung: „gpt audio", „gpt-audio" und
 * „gptaudio" führen alle auf `openai/gpt-audio-mini`.
 */
function pu_katalog_schlicht(string $s): string
{
    return (string)preg_replace('/[^a-z0-9]/', '', mb_strtolower(trim($s)));
}

/**
 * Suchen mit Ausweichweg.
 *
 * Findet das Herstellerfeld keinen Hersteller, war meistens ein **Modellname**
 * gemeint: „grok" ist kein Hersteller (der heisst `x-ai`), aber sieben Modelle
 * heissen so. Statt einer leeren Liste wird dann im Namen gesucht — und gesagt,
 * dass ausgewichen wurde. Stillschweigend etwas anderes zu suchen, als man
 * gefragt wurde, wäre die schlechtere Hälfte dieser Hilfe.
 *
 * @return array{treffer: array, ausweich: bool}
 */
function pu_katalog_suchen(array $modelle, string $hersteller = '', string $suche = '',
                           string $nur = ''): array
{
    $treffer = pu_katalog_filter($modelle, $hersteller, $suche, $nur);
    if ($treffer !== [] || trim($hersteller) === '') {
        return ['treffer' => $treffer, 'ausweich' => false];
    }

    // Den Herstellerbegriff als Namensteil lesen — und ein zweites Suchwort,
    // falls eines dasteht, weiter berücksichtigen.
    $ausweich = pu_katalog_filter(
        pu_katalog_filter($modelle, '', $hersteller, $nur), '', $suche, '');

    return ['treffer' => $ausweich, 'ausweich' => $ausweich !== []];
}

/** Preis je Million Token, gerundet — die Zahl, die man vergleichen kann. */
function pu_katalog_preis(float $jeToken): float
{
    return round($jeToken * 1000000, 3);
}
