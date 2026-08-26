<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Tokenicer: echte BPE-Zerlegung, lokal und offline.
 *
 * Übernommen aus `scripts/tokenicer` (Python) und nach PHP übersetzt. Die
 * Vokabulardateien sind dieselben — OpenAIs tiktoken-Rangdateien, einmalig
 * heruntergeladen und hier unter `vocab/` abgelegt. Kein Netzverkehr, kein
 * Fremdpaket: der Text eines Lernenden verlässt den Rechner nie.
 *
 * **Der Grund, warum die Übersetzung KÜRZER ist als das Original.** Python
 * kann in `re` keine Unicode-Eigenschaftsklassen (`\p{L}`, `\p{N}` …).
 * Deshalb ist der Vorzerleger dort von Hand als Scanner über `unicodedata`
 * nachgebaut — sauber gemacht, aber zweihundert Zeilen, die genau das tun,
 * was der Originalausdruck sagt. PCRE kann diese Klassen. Hier steht deshalb
 * wieder der Ausdruck selbst, so wie tiktoken ihn benutzt. Weniger Code,
 * weniger Stellen, an denen die Nachbildung vom Original abweichen kann.
 *
 * `(*UCP)` am Anfang jedes Musters ist dabei nicht Zierde: ohne diese
 * Angabe ist `\s` in PCRE nur ASCII-Leerraum, und ein geschütztes Leerzeichen
 * (U+00A0) fiele in eine andere Regel als bei tiktoken. Getestet wird das
 * gegen die Python-Fassung, siehe tests/tokenicer_test.php.
 */

const PU_TOK_VOCAB = PU_ROOT . '/vocab';

/**
 * Die vier Encodings mit ihrem Vorzerlege-Ausdruck.
 *
 * Zeichentreu aus tiktoken übernommen. Wer hier etwas ändert, ändert die
 * Tokenzahl — und damit eine Zahl, die als "exakt wie bei OpenAI" angezeigt
 * wird. Änderungen gehören deshalb zusammen mit einem Testvektor.
 */
const PU_TOK_MUSTER = [
    'o200k_base' =>
        "/(*UCP)[^\r\n\p{L}\p{N}]?[\p{Lu}\p{Lt}\p{Lm}\p{Lo}\p{M}]*[\p{Ll}\p{Lm}\p{Lo}\p{M}]+(?i:'s|'t|'re|'ve|'m|'ll|'d)?"
        . "|[^\r\n\p{L}\p{N}]?[\p{Lu}\p{Lt}\p{Lm}\p{Lo}\p{M}]+[\p{Ll}\p{Lm}\p{Lo}\p{M}]*(?i:'s|'t|'re|'ve|'m|'ll|'d)?"
        . "|\p{N}{1,3}"
        . "| ?[^\s\p{L}\p{N}]+[\r\n\/]*"
        . "|\s*[\r\n]+"
        . "|\s+(?!\S)"
        . "|\s+/u",

    'cl100k_base' =>
        "/(*UCP)(?i:'s|'t|'re|'ve|'m|'ll|'d)"
        . "|[^\r\n\p{L}\p{N}]?\p{L}+"
        . "|\p{N}{1,3}"
        . "| ?[^\s\p{L}\p{N}]+[\r\n]*"
        . "|\s*[\r\n]+"
        . "|\s+(?!\S)"
        . "|\s+/u",

    'p50k_base' =>
        "/(*UCP)'s|'t|'re|'ve|'m|'ll|'d"
        . "| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+"
        . "|\s+(?!\S)|\s+/u",

    'r50k_base' =>
        "/(*UCP)'s|'t|'re|'ve|'m|'ll|'d"
        . "| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+"
        . "|\s+(?!\S)|\s+/u",
];

/**
 * Die Modelle in der Oberfläche.
 *
 * `exakt` ist die wichtigste Spalte und steht deshalb im Fenster als `≈`
 * daneben: gerechnet wird immer mit OpenAIs BPE. Für OpenAI-Modelle ist das
 * die Wahrheit, für Claude, Gemini, Grok, DeepSeek und Llama eine Näherung —
 * die benutzen eigene Zerleger, die nicht offen als tiktoken-Datei vorliegen.
 * Eine Näherung als exakte Zahl auszugeben wäre eine falsche Auskunft über
 * Kosten, und Kosten sind in Stufe 2 ein eigener Lerngegenstand.
 */
const PU_TOK_MODELLE = [
    ['id' => 'gpt-5.5',  'name' => 'GPT-5.5',        'haus' => 'OpenAI',    'enc' => 'o200k_base',  'exakt' => true],
    ['id' => 'opus-5',   'name' => 'Claude Opus 5',  'haus' => 'Anthropic', 'enc' => 'o200k_base',  'exakt' => false],
    ['id' => 'gemini',   'name' => 'Gemini',         'haus' => 'Google',    'enc' => 'o200k_base',  'exakt' => false],
    ['id' => 'grok',     'name' => 'Grok',           'haus' => 'xAI',       'enc' => 'o200k_base',  'exakt' => false],
    ['id' => 'deepseek', 'name' => 'DeepSeek',       'haus' => 'DeepSeek',  'enc' => 'o200k_base',  'exakt' => false],
    ['id' => 'llama',    'name' => 'Llama',          'haus' => 'Meta',      'enc' => 'o200k_base',  'exakt' => false],
    ['id' => 'gpt-4',    'name' => 'GPT-4 / 3.5',    'haus' => 'OpenAI',    'enc' => 'cl100k_base', 'exakt' => true],
    ['id' => 'gpt-2',    'name' => 'GPT-2 / GPT-3',  'haus' => 'OpenAI',    'enc' => 'r50k_base',   'exakt' => true],
];

/** Höchstlänge einer Eingabe. Schützt Fenster und Server vor einem Buchkapitel. */
const PU_TOK_MAX = 20000;

function pu_tok_modell(string $id): array
{
    foreach (PU_TOK_MODELLE as $m) if ($m['id'] === $id) return $m;
    return PU_TOK_MODELLE[0];
}

// ================================================================ Vokabular
/**
 * Lädt die Rangtabelle eines Encodings: Bytefolge -> Rang.
 *
 * Die Rohdatei ist Base64 je Zeile; sie zu lesen kostet bei o200k rund
 * 200 000 Zeilen. Deshalb wird das Ergebnis EINMAL als serialisierte Datei
 * neben die Datenbank gelegt und danach von dort geladen — messbar schneller,
 * und der Zwischenspeicher ist jederzeit wegwerfbar: fehlt er, wird er neu
 * gebaut.
 *
 * Der Zwischenspeicher trägt die Änderungszeit der Rohdatei im Namen. Damit
 * kann er nicht veralten, ohne dass es auffällt — der Fall, den man sonst
 * erst bemerkt, wenn eine Tokenzahl unerklärlich falsch ist.
 */
function pu_tok_ranks(string $enc): array
{
    static $geladen = [];
    if (isset($geladen[$enc])) return $geladen[$enc];

    if (!isset(PU_TOK_MUSTER[$enc])) {
        throw new RuntimeException('Unbekanntes Encoding: ' . $enc);
    }

    $roh = PU_TOK_VOCAB . '/' . $enc . '.tiktoken';
    if (!is_file($roh)) {
        throw new RuntimeException("Die Vokabeldatei $enc.tiktoken fehlt in vocab/.");
    }

    pu_ensure_dirs();
    $kalt = PU_TMP . '/tok_' . $enc . '_' . filemtime($roh) . '.ser';

    if (is_file($kalt)) {
        $daten = @unserialize((string)file_get_contents($kalt), ['allowed_classes' => false]);
        if (is_array($daten) && $daten !== []) return $geladen[$enc] = $daten;
    }

    $ranks = [];
    $fh = fopen($roh, 'rb');
    if ($fh === false) throw new RuntimeException("$enc.tiktoken lässt sich nicht lesen.");
    while (($zeile = fgets($fh)) !== false) {
        $zeile = trim($zeile);
        if ($zeile === '') continue;
        $teile = explode(' ', $zeile, 2);
        if (count($teile) !== 2) continue;
        $b = base64_decode($teile[0], true);
        if ($b === false) continue;
        $ranks[$b] = (int)$teile[1];
    }
    fclose($fh);

    // Alte Zwischenspeicher desselben Encodings wegräumen, sonst sammeln sich
    // nach jedem Vokabeltausch Dateien von je mehreren Megabyte an.
    foreach (glob(PU_TMP . '/tok_' . $enc . '_*.ser') ?: [] as $alt) @unlink($alt);
    @file_put_contents($kalt, serialize($ranks));

    return $geladen[$enc] = $ranks;
}

// ================================================================ BPE
/**
 * Byte-Pair-Encoding eines Stücks — in tiktokens Verschmelzungsreihenfolge.
 *
 * Immer wird das Paar mit dem KLEINSTEN Rang zusammengezogen, nicht das erste
 * beste. Der Rang ist die Reihenfolge, in der die Verschmelzungen beim
 * Training gelernt wurden; sie zu vertauschen ergäbe eine plausibel aussehende
 * und falsche Zerlegung.
 *
 * @param array  $ranks  Bytefolge -> Rang
 * @param string $stueck rohe Bytes eines vorzerlegten Stücks
 * @return string[] die Teile in Reihenfolge
 */
function pu_tok_bpe(array $ranks, string $stueck): array
{
    $n = strlen($stueck);
    if ($n <= 1) return [$stueck];

    $teile = str_split($stueck);

    while (true) {
        $bestI = -1;
        $bestR = null;
        $anzahl = count($teile);
        for ($k = 0; $k < $anzahl - 1; $k++) {
            $paar = $teile[$k] . $teile[$k + 1];
            $r = $ranks[$paar] ?? null;
            if ($r !== null && ($bestR === null || $r < $bestR)) {
                $bestR = $r;
                $bestI = $k;
            }
        }
        if ($bestI < 0) break;

        array_splice($teile, $bestI, 2, [$teile[$bestI] . $teile[$bestI + 1]]);
    }

    return $teile;
}

// ================================================================ Zerlegung
/**
 * Zerlegt einen Text in Tokens.
 *
 * @return array{ids: int[], tokens: array, zeichen: int, woerter: int, encoding: string}
 */
function pu_tok_kodieren(string $text, string $enc): array
{
    if (!isset(PU_TOK_MUSTER[$enc])) {
        throw new RuntimeException('Unbekanntes Encoding: ' . $enc);
    }
    if ($text === '') {
        return ['ids' => [], 'tokens' => [], 'zeichen' => 0, 'woerter' => 0, 'encoding' => $enc];
    }

    $ranks = pu_tok_ranks($enc);

    $stuecke = [];
    preg_match_all(PU_TOK_MUSTER[$enc], $text, $treffer);
    $stuecke = $treffer[0] ?? [];

    $ids = [];
    $roh = [];
    foreach ($stuecke as $stueck) {
        if ($stueck === '') continue;
        $teile = isset($ranks[$stueck]) ? [$stueck] : pu_tok_bpe($ranks, $stueck);
        foreach ($teile as $t) {
            if (!isset($ranks[$t])) {
                // Kann nur passieren, wenn die Vokabeldatei beschädigt ist:
                // die BPE endet immer bei Einzelbytes, und die stehen alle
                // in der Tabelle. Lieber laut als mit falscher Zahl.
                throw new RuntimeException('Die Vokabeldatei ' . $enc . ' ist unvollständig.');
            }
            $ids[] = $ranks[$t];
            $roh[] = $t;
        }
    }

    return [
        'ids'      => $ids,
        'tokens'   => pu_tok_beschriften($ids, $roh),
        'zeichen'  => mb_strlen($text),
        'woerter'  => count(preg_split('/\s+/u', trim($text), -1, PREG_SPLIT_NO_EMPTY) ?: []),
        'encoding' => $enc,
    ];
}

/**
 * Macht aus Byte-Tokens anzeigbare Tokens.
 *
 * Ein Umlaut, ein Emoji oder ein chinesisches Zeichen zerfällt oft über zwei
 * oder drei Tokens. Byteweise dekodiert ergäbe das ein „�" mitten in der
 * Anzeige — und genau daran würden Lernende die falsche Lehre ziehen, das
 * Modell habe das Zeichen kaputtgemacht.
 *
 * Deshalb dasselbe Verfahren wie im Original: die Bytes laufen durch einen
 * fortlaufenden Puffer. Ein Token, das ein Zeichen nur anfängt, zeigt nichts
 * (`teil = true`); das abschliessende Token zeigt das ganze Zeichen.
 */
function pu_tok_beschriften(array $ids, array $roh): array
{
    $tokens = [];
    $rest   = '';
    $anzahl = count($roh);

    foreach ($roh as $k => $bytes) {
        $puffer = $rest . $bytes;
        $letzte = ($k === $anzahl - 1);

        if ($letzte) {
            $text = $puffer;
            $rest = '';
        } else {
            $schnitt = pu_tok_utf8_ende($puffer);
            $text    = substr($puffer, 0, $schnitt);
            $rest    = substr($puffer, $schnitt);
        }

        if ($text !== '' && !mb_check_encoding($text, 'UTF-8')) {
            $text = mb_convert_encoding($text, 'UTF-8', 'UTF-8');
        }

        $tokens[] = ['id' => $ids[$k], 'text' => $text, 'teil' => $text === ''];
    }

    return $tokens;
}

/**
 * Wo endet in diesem Puffer das letzte VOLLSTÄNDIGE UTF-8-Zeichen?
 *
 * Gesucht wird vom Ende her das letzte Startbyte; reicht der Puffer für die
 * angekündigte Länge nicht aus, bleibt es liegen. Höchstens drei Bytes
 * müssen dafür betrachtet werden — länger ist keine UTF-8-Folge.
 */
function pu_tok_utf8_ende(string $puffer): int
{
    $n = strlen($puffer);
    for ($i = $n - 1; $i >= 0 && $i >= $n - 3; $i--) {
        $b = ord($puffer[$i]);
        if (($b & 0xC0) === 0x80) continue;              // Folgebyte, weiter zurück

        $laenge = match (true) {
            ($b & 0x80) === 0x00 => 1,
            ($b & 0xE0) === 0xC0 => 2,
            ($b & 0xF0) === 0xE0 => 3,
            ($b & 0xF8) === 0xF0 => 4,
            default              => 1,                   // ungültiges Byte: durchlassen
        };
        return ($i + $laenge <= $n) ? $n : $i;
    }
    return $n;
}

// ================================================================ Kosten
/**
 * Was 1000 Token an einem Text kosten würden.
 *
 * Bewusst OHNE Preistabelle: Preise ändern sich, und eine veraltete Zahl in
 * einer Lernplattform ist schlimmer als keine. Der Tokenicer liefert die
 * Menge, den Preis trägt der Lernende in Stufe 2 selbst ein — das ist dort
 * der Lerngegenstand.
 */
function pu_tok_kosten(int $tokens, float $preis_je_1000): float
{
    return round($tokens / 1000 * $preis_je_1000, 6);
}
