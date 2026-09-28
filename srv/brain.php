<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Markdown aus dem Vault ins Fenster.
 *
 * Der Lehrstoff liegt als Markdown in `brain/`. Hier wird daraus HTML.
 *
 * Diese Datei hiess einmal "Bibliothek" und lieferte den ganzen Vault an eine
 * eigene Ansicht: Baum, Notiz, Rueckverweise, Suche. Die Ansicht ist wieder
 * ausgebaut — sie stand neben dem Lernweg und zog davon ab, statt zu tragen.
 * Was blieb, ist der Teil, den die Lektionen wirklich brauchen.
 *
 * Der Vault selbst bleibt gesperrt: `router.php` weist `brain/` ueber HTTP mit
 * 403 ab, und alles, was hinausgeht, laeuft durch `api.php`. Das ist keine
 * Vorsichtsmassnahme fuer den Notfall, sondern der Normalfall — der Lehrstoff
 * traegt die Loesungen.
 */

/**
 * Kleiner Markdown-Wandler.
 *
 * Kein vollständiges Markdown und mit Absicht keine Bibliothek: PROMPTHEUS
 * läuft ohne Composer. Unterstuetzt wird, was im Lehrstoff vorkommt —
 * Ueberschriften, Absätze, Listen, Tabellen, Code, Zitate, Fettdruck,
 * Kursiv, Links und Wikilinks.
 *
 * **Erst escapen, dann auszeichnen.** Der Vault ist von Hand geschrieben, aber
 * geerntete Notizen tragen fremden Text. Ein `<script>` in einer Quelle darf
 * die Bibliothek nicht übernehmen.
 */
function pu_md(string $text): string
{
    $zeilen = preg_split('/\r\n|\r|\n/', $text) ?: [];
    $aus    = [];
    $inCode = false;
    $inTabelle = false;

    /* **Ein Absatz ist, was zwischen zwei Leerzeilen steht — nicht eine Zeile.**
       Der Lehrstoff ist im Quelltext nach etwa 75 Zeichen umbrochen. Bis
       28.09.2026 wurde jede dieser Zeilen ein eigener <p>: Die Lektion stand
       mit Absatzabstand zwischen allen Bildschirmzeilen da, ein Zitat zerfiel
       in lauter einzelne Balken, und ein Satz über zwei Zeilen riss mitten
       durch. Jetzt sammeln drei Puffer, was zusammengehört, und erst eine
       Leerzeile oder ein anderer Block schliesst sie. */
    $absatz = [];        // Zeilen des laufenden Absatzes
    $zitat  = null;      // Zeilen des laufenden Zitats (null: keins offen)
    $liste  = null;      // 'ul' | 'ol' | null
    $punkt  = null;      // Zeilen des laufenden Listenpunkts

    $absatzZu = static function () use (&$absatz, &$aus): void {
        if ($absatz !== []) $aus[] = '<p>' . pu_md_zeilen($absatz) . '</p>';
        $absatz = [];
    };
    $punktZu = static function () use (&$punkt, &$aus): void {
        if ($punkt !== null) $aus[] = '<li>' . pu_md_zeilen($punkt) . '</li>';
        $punkt = null;
    };
    $listeZu = static function () use (&$liste, &$aus, $punktZu): void {
        $punktZu();
        if ($liste !== null) $aus[] = "</$liste>";
        $liste = null;
    };
    $zitatZu = static function () use (&$zitat, &$aus): void {
        if ($zitat !== null) $aus[] = pu_md_zitat($zitat);
        $zitat = null;
    };
    $allesZu = static function () use ($absatzZu, $listeZu, $zitatZu): void {
        $absatzZu(); $listeZu(); $zitatZu();
    };

    foreach ($zeilen as $zeile) {
        // ---------------------------------------------------------- Code
        if (preg_match('/^```(.*)$/', $zeile, $m)) {
            if ($inCode) { $aus[] = '</code></pre>'; $inCode = false; }
            else {
                $allesZu();
                if ($inTabelle) { $aus[] = '</table></div>'; $inTabelle = false; }
                $aus[] = '<pre class="code"><code>';
                $inCode = true;
            }
            continue;
        }
        if ($inCode) { $aus[] = pu_h($zeile); continue; }

        // ---------------------------------------------------------- Tabelle
        if (str_starts_with(trim($zeile), '|') && str_ends_with(trim($zeile), '|')) {
            $zellen = array_map('trim', explode('|', trim(trim($zeile), '|')));
            // Trennzeile |---|---| erzeugt keine Ausgabe.
            if (preg_match('/^[\s:|-]+$/', $zeile)) continue;
            if (!$inTabelle) {
                $allesZu();
                $aus[] = '<div class="tabellenrahmen"><table>';
                $inTabelle = true;
                $aus[] = '<tr>' . implode('', array_map(fn($z) => '<th>' . pu_md_inline($z) . '</th>', $zellen)) . '</tr>';
                continue;
            }
            $aus[] = '<tr>' . implode('', array_map(fn($z) => '<td>' . pu_md_inline($z) . '</td>', $zellen)) . '</tr>';
            continue;
        }
        if ($inTabelle) { $aus[] = '</table></div>'; $inTabelle = false; }

        // ---------------------------------------------------------- Zitat
        // Vor der Leerzeile geprüft: `>` allein ist eine Leerzeile IM Zitat.
        if (preg_match('/^\s{0,3}>\s?(.*)$/', $zeile, $m)) {
            $absatzZu(); $listeZu();
            $zitat ??= [];
            $zitat[] = $m[1];
            continue;
        }

        // ---------------------------------------------------------- Leerzeile
        if (trim($zeile) === '') {
            $allesZu();
            continue;
        }

        // ---------------------------------------------------------- Überschrift
        if (preg_match('/^(#{1,6})\s+(.*)$/', $zeile, $m)) {
            $allesZu();
            $n = strlen($m[1]);
            $aus[] = "<h$n>" . pu_md_inline($m[2]) . "</h$n>";
            continue;
        }

        // ---------------------------------------------------------- Trennlinie
        if (preg_match('/^\s*(---|\*\*\*|___)\s*$/', $zeile)) {
            $allesZu();
            $aus[] = '<hr>';
            continue;
        }

        // ---------------------------------------------------------- Listen
        $ul = preg_match('/^\s*[-*+]\s+(.*)$/', $zeile, $mu);
        $ol = !$ul && preg_match('/^\s*\d+\.\s+(.*)$/', $zeile, $mo);
        if ($ul || $ol) {
            $absatzZu(); $zitatZu();
            $art = $ul ? 'ul' : 'ol';
            if ($liste !== $art) { $listeZu(); $aus[] = "<$art>"; $liste = $art; }
            $punktZu();
            $punkt = [$ul ? $mu[1] : $mo[1]];
            continue;
        }

        // ---------------------------------------------------------- Aufgabe
        // Der Platzhalter einer Aufgabe (api.php) bleibt ein Absatz für sich —
        // auch direkt unter einer Liste oder einem Zitat.
        if (str_starts_with($zeile, '<<<AUFGABE:')) {
            $allesZu();
            $absatz = [$zeile];
            $absatzZu();
            continue;
        }

        // ---------------------------------------------------------- Fortsetzung
        // Eine Zeile direkt unter einem Listenpunkt gehört zu ihm (Markdown
        // nennt das „faule Fortsetzung“); im Zitat ebenso.
        if ($punkt !== null) { $punkt[] = trim($zeile); continue; }
        if ($zitat !== null) { $zitat[] = trim($zeile); continue; }

        // ---------------------------------------------------------- Absatz
        $absatz[] = $zeile;
    }

    if ($inCode)    $aus[] = '</code></pre>';
    if ($inTabelle) $aus[] = '</table></div>';
    $allesZu();

    return implode("\n", array_filter($aus, fn($z) => $z !== ''));
}

/**
 * Zeilen eines Absatzes zu einem Text. Ein Umbruch im Quelltext ist ein
 * Leerzeichen; nur zwei Leerzeichen oder ein `\` am Zeilenende erzwingen
 * einen sichtbaren Umbruch (wie in jedem Markdown).
 */
function pu_md_zeilen(array $zeilen): string
{
    $aus = '';
    $n = count($zeilen);
    foreach ($zeilen as $i => $z) {
        $hart = preg_match('/(  |\\\\)$/', $z) === 1;
        $z = rtrim(preg_replace('/\\\\$/', '', $z) ?? $z);
        $aus .= pu_md_inline(ltrim($z));
        if ($i < $n - 1) $aus .= $hart ? '<br>' : ' ';
    }
    return $aus;
}

/** Wie ein Hinweiskasten heisst, wenn er selbst keinen Titel trägt. */
const PU_MD_KAESTEN = [
    'merke'    => 'Merke',    'note'     => 'Merke',   'info'    => 'Merke',   'abstract' => 'Merke',
    'tipp'     => 'Tipp',     'tip'      => 'Tipp',    'hint'    => 'Tipp',
    'beispiel' => 'Beispiel', 'example'  => 'Beispiel',
    'achtung'  => 'Achtung',  'warning'  => 'Achtung', 'caution' => 'Achtung', 'danger' => 'Achtung',
    'frage'    => 'Frage',    'question' => 'Frage',   'faq'     => 'Frage',
];
/** Und welche Farbe er trägt — nur vier, damit Farbe etwas heisst. */
const PU_MD_KASTEN_FARBE = ['merke' => 'merke', 'note' => 'merke', 'info' => 'merke', 'abstract' => 'merke',
    'tipp' => 'tipp', 'tip' => 'tipp', 'hint' => 'tipp', 'beispiel' => 'beispiel', 'example' => 'beispiel',
    'achtung' => 'achtung', 'warning' => 'achtung', 'caution' => 'achtung', 'danger' => 'achtung',
    'frage' => 'frage', 'question' => 'frage', 'faq' => 'frage'];

/**
 * Ein Zitat — oder ein Hinweiskasten in Obsidian-Schreibweise:
 *
 *     > [!merke] Das Wichtigste
 *     > Ein Sprachmodell sagt das nächste Textstück voraus.
 *
 * Ein `>` allein trennt Absätze im selben Kasten. Unbekannte Arten werden ein
 * gewöhnliches Zitat — der Text geht nie verloren.
 */
function pu_md_zitat(array $zeilen): string
{
    $art = null;
    $titel = '';
    if ($zeilen !== [] && preg_match('/^\[!([A-Za-z]+)\][+-]?\s*(.*)$/', trim($zeilen[0]), $m)
        && isset(PU_MD_KAESTEN[strtolower($m[1])])) {
        $art = strtolower($m[1]);
        $titel = trim($m[2]) !== '' ? pu_md_inline(trim($m[2])) : PU_MD_KAESTEN[$art];
        array_shift($zeilen);
    }

    $absaetze = [];
    $jetzt = [];
    foreach ($zeilen as $z) {
        if (trim($z) === '') {
            if ($jetzt !== []) $absaetze[] = $jetzt;
            $jetzt = [];
            continue;
        }
        $jetzt[] = $z;
    }
    if ($jetzt !== []) $absaetze[] = $jetzt;
    $innen = implode('', array_map(static fn(array $a) => '<p>' . pu_md_zeilen($a) . '</p>', $absaetze));

    if ($art === null) {
        return '<blockquote>' . $innen . '</blockquote>';
    }
    $farbe = PU_MD_KASTEN_FARBE[$art];
    return '<aside class="kasten kasten-' . $farbe . '"><div class="kasten-titel">' . $titel . '</div>'
         . $innen . '</aside>';
}

/** Auszeichnung innerhalb einer Zeile. Escapen kommt zuerst. */
function pu_md_inline(string $s): string
{
    $s = pu_h($s);

    // Code zuerst, damit Sternchen darin nicht als Fettdruck gelesen werden.
    $s = preg_replace('/`([^`]+)`/', '<code>$1</code>', $s) ?? $s;

    $s = preg_replace('/\*\*([^*]+)\*\*/', '<strong>$1</strong>', $s) ?? $s;
    $s = preg_replace('/(?<![\w*])\*([^*]+)\*(?![\w*])/', '<em>$1</em>', $s) ?? $s;

    // Wikilinks: [[pfad|Text]] oder [[pfad]]
    $s = preg_replace_callback('/\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/', function (array $m): string {
        $ziel = trim($m[1]);
        $text = trim($m[2] ?? '') !== '' ? $m[2] : basename($ziel);
        return '<a href="#" class="wikilink" data-ziel="' . pu_h($ziel) . '">' . $text . '</a>';
    }, $s) ?? $s;

    // Gewöhnliche Links — nur http(s), damit kein javascript: durchkommt.
    $s = preg_replace_callback('/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/', function (array $m): string {
        return '<a href="' . $m[2] . '" target="_blank" rel="noopener noreferrer">' . $m[1] . '</a>';
    }, $s) ?? $s;

    return $s;
}
