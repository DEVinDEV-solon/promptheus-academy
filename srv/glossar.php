<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — das Glossar: Begriffe lesen, im Text verlinken, Fragen stellen.
 *
 * Die Begriffe liegen als OKF-Notizen in `secondbrain/90_Bibliothek/Glossar/`,
 * eine Datei je Begriff. Das ist der Grund, warum es diese Datei gibt: Die
 * verwandten Schlagworte, die im Programm neben der Erklärung stehen, sind die
 * **Wikilinks der Notiz**. Sie kommen aus der Verbindung selbst und nicht aus
 * einer zweiten, von Hand gepflegten Liste, die eines Tages etwas anderes sagt.
 *
 * Drei Aufgaben:
 *
 *   1. **Lesen.** Aus 36 Dateien wird ein Verzeichnis: Titel, ein Satz,
 *      Suchworte, Nachbarn, Beleg.
 *   2. **Verlinken.** Wo ein Begriff im Lehrstoff vorkommt, wird er
 *      anklickbar — im Fliesstext, nicht in Code, nicht in Überschriften.
 *   3. **Fragen.** Aus Begriff und gewünschter Tiefe wird die Frage, die im
 *      Chat steht.
 *
 * **Die Frage verrät nichts über den Fragenden.** Das ist keine Kleinigkeit:
 * Wer liest „erklär mir das für einen Zwölfjährigen mit 250 Punkten", fühlt
 * sich vorgeführt — auch wenn es stimmt. Alter, Klasse, Ebene und Punktestand
 * stehen deshalb ausschliesslich im **Systemtext** (`pu_systemtext()` über
 * `pu_profil()`), den niemand zu sehen bekommt. Im Chatfenster steht ein Satz,
 * den ein Erwachsener genauso stellen würde.
 */

require_once __DIR__ . '/brain.php';   // pu_md
require_once __DIR__ . '/kurse.php';   // pu_frontmatter, pu_ohne_erste_h1

const PU_GLOSSAR_ORDNER = 'secondbrain/90_Bibliothek/Glossar';

/** Kürzestes Wort, das noch verlinkt wird. Kürzeres trifft zu oft daneben. */
const PU_GLOSSAR_MINDESTLAENGE = 3;

// ---------------------------------------------------------------- Lesen

/**
 * Alle Begriffe, einmal je Anfrage gelesen.
 *
 * @return array<string, array{slug:string,titel:string,was:string,tags:array,
 *                             worte:array,verwandt:array,rumpf:string}>
 */
function pu_glossar(): array
{
    static $verzeichnis = null;
    if ($verzeichnis !== null) return $verzeichnis;

    $verzeichnis = [];
    $ordner = PU_ROOT . '/' . PU_GLOSSAR_ORDNER;
    if (!is_dir($ordner)) return $verzeichnis;

    foreach (scandir($ordner) ?: [] as $datei) {
        if (!str_ends_with($datei, '.md')) continue;
        if (str_starts_with($datei, '_')) continue;      // die Nabe ist kein Begriff

        $slug = substr($datei, 0, -3);
        $eintrag = pu_glossar_lesen($ordner . '/' . $datei, $slug);
        if ($eintrag !== null) $verzeichnis[$slug] = $eintrag;
    }

    return $verzeichnis;
}

/** Eine Begriffsnotiz zerlegen. */
function pu_glossar_lesen(string $pfad, string $slug): ?array
{
    $fm = pu_frontmatter((string)file_get_contents($pfad));

    // `pu_frontmatter()` nennt die Kopfdaten `meta`, nicht `kopf`.
    $k = $fm['meta'] ?? [];

    $titel = trim((string)($k['title'] ?? ''));
    if ($titel === '') return null;                   // ohne Titel kein Begriff

    // Nachbarn: alle Wikilinks des Rumpfes, die selbst Begriffe sind. Welche
    // das sind, entscheidet sich erst, wenn alle gelesen wurden — deshalb hier
    // roh sammeln und in pu_glossar_begriff() sieben.
    preg_match_all('/\[\[([^\]|#]+)/u', $fm['rumpf'], $treffer);
    $verwandt = array_values(array_unique(array_map('trim', $treffer[1] ?? [])));

    return [
        'slug'     => $slug,
        'titel'    => $titel,
        'was'      => trim((string)($k['description'] ?? '')),
        'tags'     => (array)($k['tags'] ?? []),
        'worte'    => pu_glossar_worte($titel, $k),
        'verwandt' => $verwandt,
        'rumpf'    => $fm['rumpf'],
    ];
}

/**
 * Die Wörter, unter denen ein Begriff im Text gefunden wird.
 *
 * Aus dem Titel: der Teil vor der Klammer **und** der Teil darin. „LLM
 * (Sprachmodell)" soll unter beiden Namen greifen — im Lehrstoff steht mal das
 * eine, mal das andere.
 *
 * Dazu `aliase:` aus der Frontmatter, wo der Titel nicht reicht.
 */
function pu_glossar_worte(string $titel, array $kopf): array
{
    $worte = [];

    if (preg_match('/^(.*?)\s*\((.+?)\)\s*$/u', $titel, $t)) {
        $worte[] = trim($t[1]);
        $worte[] = trim($t[2]);
    } else {
        $worte[] = $titel;
    }

    foreach ((array)($kopf['aliase'] ?? []) as $a) {
        $a = trim((string)$a);
        if ($a !== '') $worte[] = $a;
    }

    // Kurzes fliegt raus: „KI" in jedem zweiten Satz zu unterstreichen macht
    // aus dem Lehrstoff einen Teppich.
    $worte = array_filter($worte, static fn($w) =>
        mb_strlen($w) >= PU_GLOSSAR_MINDESTLAENGE);

    return array_values(array_unique($worte));
}

/**
 * Ein Begriff mit allem, was die Modalseite braucht.
 *
 * `verwandt` ist hier gesiebt: nur Wikilinks, die wirklich ein Begriff sind.
 * Ein Verweis auf eine geerntete Quelle steht unter `beleg` und ist kein
 * anklickbares Schlagwort — er führt aus dem Glossar hinaus.
 */
function pu_glossar_begriff(string $slug): ?array
{
    $alle = pu_glossar();
    if (!isset($alle[$slug])) return null;

    $b = $alle[$slug];
    $nachbarn = [];
    foreach ($b['verwandt'] as $ziel) {
        if (isset($alle[$ziel]) && $ziel !== $slug) {
            $nachbarn[] = ['slug' => $ziel,
                           'titel' => $alle[$ziel]['titel'],
                           'was'   => $alle[$ziel]['was']];
        }
    }

    return [
        'slug'     => $b['slug'],
        'titel'    => $b['titel'],
        'was'      => $b['was'],
        'html'     => pu_ohne_erste_h1(pu_md($b['rumpf'])),
        'verwandt' => $nachbarn,
    ];
}

/** Nur Titel und Satz — für die Übersicht, ohne 36 Rümpfe zu rendern. */
function pu_glossar_liste(): array
{
    $aus = [];
    foreach (pu_glossar() as $b) {
        $aus[] = ['slug' => $b['slug'], 'titel' => $b['titel'], 'was' => $b['was']];
    }
    usort($aus, static fn($x, $y) => strcasecmp($x['titel'], $y['titel']));
    return $aus;
}

// ---------------------------------------------------------------- Verlinken

/**
 * Begriffe im fertigen HTML anklickbar machen.
 *
 * **Warum auf dem HTML und nicht auf dem Markdown.** Im Markdown stünde der
 * Begriff auch in Codeblöcken, in Bildunterschriften und mitten in Wikilinks;
 * nach dem Rendern ist zu sehen, wo Fliesstext ist und wo nicht.
 *
 * Gearbeitet wird zwischen den Spitzklammern, nie darin — ein Begriff, der in
 * ein `href` gerät, zerstört den Link. Übersprungen werden ausserdem:
 *
 *   · `<code>` und `<pre>` — dort steht Text, der genau so gemeint ist
 *   · `<a>` — ein Link im Link ist keiner
 *   · `<h1>` bis `<h3>` — Überschriften sind Wegweiser, keine Nachschlagewerke
 *
 * Jeder Begriff wird **einmal** verlinkt, beim ersten Vorkommen. Sonst wäre
 * eine Lektion über Token ein Feld aus Unterstrichen.
 */
function pu_glossar_verlinken(string $html, ?array $verzeichnis = null): string
{
    $alle = $verzeichnis ?? pu_glossar();
    if ($alle === []) return $html;

    $muster = pu_glossar_muster($alle);
    if ($muster === '') return $html;

    $stumm   = 0;          // Verschachtelungstiefe in code/pre/a/hN
    $benutzt = [];
    $aus     = '';
    $rest    = $html;

    while ($rest !== '') {
        $spitz = strpos($rest, '<');

        if ($spitz === false) {
            $aus .= $stumm > 0 ? $rest : pu_glossar_ersetzen($rest, $muster, $alle, $benutzt);
            break;
        }

        $text = substr($rest, 0, $spitz);
        $aus .= $stumm > 0 ? $text : pu_glossar_ersetzen($text, $muster, $alle, $benutzt);

        $zu = strpos($rest, '>', $spitz);
        if ($zu === false) { $aus .= substr($rest, $spitz); break; }

        $tag  = substr($rest, $spitz, $zu - $spitz + 1);
        $aus .= $tag;
        $rest = substr($rest, $zu + 1);

        if (preg_match('~^</?(code|pre|a|h1|h2|h3)\b~i', $tag, $t)) {
            if ($tag[1] === '/') $stumm = max(0, $stumm - 1);
            else                 $stumm++;
        }
    }

    return $aus;
}

/** Ein Suchmuster über alle Begriffe, längste zuerst. */
function pu_glossar_muster(array $alle): string
{
    $worte = [];
    foreach ($alle as $slug => $b) {
        foreach ($b['worte'] as $w) $worte[$w] = $slug;
    }
    if ($worte === []) return '';

    // Längste zuerst: sonst schluckt „Token" das „Kontextfenster" nicht, aber
    // „Prompt" schluckt „Prompt-Muster", wo es eines gäbe.
    $liste = array_keys($worte);
    usort($liste, static fn($a, $b) => mb_strlen($b) <=> mb_strlen($a));

    $teile = array_map(static fn($w) => preg_quote($w, '~'), $liste);

    // Deutsche Beugung: „Token" trifft auch „Tokens", „Stufe" auch „Stufen".
    // Die Endung gehört mit in den Treffer, sonst steht der Unterstrich unter
    // dem halben Wort.
    return '~(?<![\p{L}\p{N}\-])(' . implode('|', $teile)
         . ')(s|n|en|e|es|er|em)?(?![\p{L}\p{N}\-])~ui';
}

/**
 * Rückwärtssuche vom gefundenen Wort zum Begriff.
 *
 * Gebaut wird sie einmal je Wortschatz. Der Zwischenspeicher hängt an der
 * Zusammensetzung, nicht an der Anzahl: Zwei verschiedene Verzeichnisse mit
 * gleich vielen Begriffen gibt es im Test durchaus, und dann hätte eine
 * Zählung die falsche Zuordnung geliefert.
 */
function pu_glossar_zuordnung(array $alle): array
{
    static $gemerkt = [];

    $kennung = md5(implode('|', array_keys($alle)));
    if (isset($gemerkt[$kennung])) return $gemerkt[$kennung];

    $z = [];
    foreach ($alle as $slug => $b) {
        foreach ($b['worte'] as $w) $z[mb_strtolower($w)] = $slug;
    }

    return $gemerkt[$kennung] = $z;
}

/** Ein Stück Fliesstext — jeder Begriff höchstens einmal. */
function pu_glossar_ersetzen(string $text, string $muster, array $alle, array &$benutzt): string
{
    if (trim($text) === '') return $text;

    $zuordnung = pu_glossar_zuordnung($alle);

    return (string)preg_replace_callback($muster,
        static function (array $t) use (&$benutzt, $zuordnung, $alle): string {
            $wort = $t[0];
            $slug = $zuordnung[mb_strtolower($t[1])] ?? '';
            if ($slug === '' || isset($benutzt[$slug])) return $wort;

            $benutzt[$slug] = true;
            return '<button type="button" class="begriff" data-begriff="'
                 . htmlspecialchars($slug, ENT_QUOTES, 'UTF-8') . '" title="'
                 . htmlspecialchars($alle[$slug]['was'], ENT_QUOTES, 'UTF-8')
                 . '">' . $wort . '</button>';
        }, $text);
}

// ---------------------------------------------------------------- Fragen

/**
 * Die vier Tiefen, in denen nach einem Begriff gefragt wird.
 *
 * Sie sind dialektisch gebaut und nicht bloss länger werdend: Erst die Sache
 * (These), dann was dagegen spricht oder fehlt (Antithese), dann der
 * Zusammenhang, in dem beides gilt (Synthese).
 *
 * `knopf` steht auf dem Knopf, `frage` steht danach im Chatfenster.
 */
const PU_GLOSSAR_ARTEN = [
    'erst' => [
        'knopf' => '',
        'frage' => 'Was bedeutet **%s**? Sag mir kurz, worum es geht, warum es '
                 . 'das überhaupt gibt und wo mir das begegnet.',
    ],
    'weiter' => [
        'knopf' => 'Weiter',
        'frage' => 'Erzähl weiter über **%s**: Was gehört noch dazu, das bisher '
                 . 'nicht vorkam? Nenn ein Beispiel aus dem Alltag, an dem man '
                 . 'sieht, wofür es gut ist.',
    ],
    'tiefer' => [
        'knopf' => 'Tiefer',
        'frage' => 'Geh tiefer bei **%s**: Wie funktioniert das genau? Was ist '
                 . 'der häufigste Irrtum dabei, und woran merke ich, dass ich '
                 . 'es wirklich verstanden habe?',
    ],
    'voll' => [
        'knopf' => 'Voll',
        'frage' => 'Bitte vollständig zu **%s**: Worum geht es, warum gibt es '
                 . 'das, wofür wird es eingesetzt, welche Vorteile bringt es '
                 . 'und wo sind die Grenzen? Zeig zum Schluss ein Beispiel, in '
                 . 'dem damit ein echtes Problem gelöst wird — und eines, in '
                 . 'dem es der falsche Weg wäre.',
    ],
];

/**
 * Die Knöpfe über dem Eingabefeld — alle Tiefen ausser der ersten.
 *
 * „Erst" hat keinen Knopf: Sie ist die Frage, die beim Anklicken des Begriffs
 * schon gestellt wurde. Ein Knopf, der wiederholt, was gerade geschah, ist
 * einer zu viel.
 */
function pu_glossar_knoepfe(): array
{
    $aus = [];
    foreach (PU_GLOSSAR_ARTEN as $art => $d) {
        if ($d['knopf'] === '') continue;
        $aus[] = ['art' => $art, 'knopf' => $d['knopf']];
    }
    return $aus;
}

/**
 * Die Frage, die im Chatfenster erscheint.
 *
 * **Hier steht nichts über den Fragenden.** Kein Alter, keine Klasse, keine
 * Ebene, kein Punktestand. Dass die Antwort für eine Sechstklässlerin anders
 * ausfällt als für ihre Lehrerin, entscheidet der Systemtext — und den sieht
 * niemand. Im Fenster steht ein Satz, den jeder gestellt haben könnte.
 */
function pu_glossar_frage(string $slug, string $art = 'erst'): string
{
    $alle = pu_glossar();
    $titel = $alle[$slug]['titel'] ?? $slug;

    // Der Titel ohne Klammerzusatz: „LLM (Sprachmodell)" fragt sich als „LLM".
    if (preg_match('/^(.*?)\s*\(.+?\)\s*$/u', $titel, $t)) $titel = trim($t[1]);

    $vorlage = PU_GLOSSAR_ARTEN[$art]['frage'] ?? PU_GLOSSAR_ARTEN['erst']['frage'];
    return sprintf($vorlage, $titel);
}

/**
 * Einen Beitrag in Absätze bringen.
 *
 * Das Format verlangt eine Leerzeile zwischen den Abschnitten, und die Regel
 * sagt das auch — nur hält sich ein Sprachmodell nicht immer daran. Gemessen:
 * Es liefert die Abschnitte oft mit einfachem Zeilenumbruch, und in einem
 * fremden Textfeld sieht das dann aus wie ein Block statt wie ein Beitrag.
 *
 * Also wird nachgeräumt statt gehofft. Eine Zeile, die mit einem Bildzeichen
 * oder einem Doppelkreuz beginnt, fängt einen neuen Abschnitt an; alles andere
 * gehört zum vorigen. Am Ende steht zwischen den Abschnitten genau eine
 * Leerzeile — im Text zum Kopieren und in der Anzeige.
 */
function pu_glossar_beitrag(string $text): string
{
    $bloecke = [];
    $aktuell = '';

    foreach (preg_split('/\r\n|\r|\n/', $text) ?: [] as $zeile) {
        $zeile = trim($zeile);
        if ($zeile === '') continue;

        $neuerBlock = (bool)preg_match(
            '/^(?:[\x{1F000}-\x{1FAFF}\x{2600}-\x{27BF}\x{2B00}-\x{2BFF}'
          . '\x{2190}-\x{21FF}\x{FE0F}\x{2049}\x{203C}]|#\S)/u',
            $zeile);

        if ($neuerBlock) {
            if ($aktuell !== '') $bloecke[] = $aktuell;
            $aktuell = $zeile;
        } else {
            $aktuell = $aktuell === '' ? $zeile : $aktuell . ' ' . $zeile;
        }
    }

    if ($aktuell !== '') $bloecke[] = $aktuell;

    return $bloecke === [] ? $text : implode("\n\n", $bloecke);
}

/**
 * Zusatzregeln für den Systemtext — Form der Antwort, nicht ihr Inhalt.
 *
 * Ohne Emoji: gewöhnliche Erklärung in Absätzen.
 *
 * Mit Emoji: die Antwort soll sich weiterschicken lassen. Ein Titel als Frage,
 * vier bis fünf Abschnitte mit je einem Zeichen davor, ein Schlusssatz, drei
 * Schlagworte. Das ist kein Schmuck — es ist ein Format, das auf einem
 * Handybildschirm gelesen wird und in ein Textfeld passt.
 */
function pu_glossar_regeln(string $art, bool $emoji): string
{
    $regeln = "\n\n---\n\n## Für diese Antwort\n\n";

    if (!$emoji) {
        $regeln .= "Schreib in gewöhnlichen Absätzen, ohne Emoji und ohne "
                 . "Aufzählungszeichen am Zeilenanfang. Keine Überschrift über "
                 . "der Antwort — sie steht in einem Chatfenster, nicht in "
                 . "einem Dokument.\n";
    } else {
        $regeln .= <<<'TEXT'
Gib die Antwort so aus, dass man sie kopieren und als Beitrag verschicken kann.
Genau dieses Gerüst, nichts davor und nichts danach:

1. **Erste Zeile:** ein Emoji, dann die Frage als Titel — neugierig gestellt,
   nicht als Überschrift eines Aufsatzes.
2. **Dann vier bis fünf Abschnitte**, jeder beginnt mit einem eigenen Emoji und
   umfasst ein bis zwei Sätze. Zwischen den Abschnitten eine Leerzeile.
   Der Reihe nach: was es ist · wie es arbeitet · wofür es taugt · was man
   wissen muss (die Grenze, die Warnung) .
3. **Schlusszeile:** ein Emoji, dann der Kern in einem Satz, dazu eine kurze
   Einladung zu antworten.
4. **Letzte Zeile:** drei bis vier Schlagworte mit Doppelkreuz, deutsch.

Kein Abschnitt länger als zwei Sätze. Duze die Lesenden. Keine Werbesprache,
keine Superlative — die Sache ist interessant genug.
TEXT;
    }

    if ($art === 'voll') {
        $regeln .= "\n\nDie Frage verlangt Vollständigkeit: Lass keinen der "
                 . "genannten Punkte aus, auch nicht die Grenzen.\n";
    }

    return $regeln;
}
