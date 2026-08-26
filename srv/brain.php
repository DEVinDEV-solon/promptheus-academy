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
    $inListe = null;
    $inTabelle = false;

    foreach ($zeilen as $zeile) {
        // ---------------------------------------------------------- Code
        if (preg_match('/^```(.*)$/', $zeile, $m)) {
            if ($inCode) { $aus[] = '</code></pre>'; $inCode = false; }
            else {
                $aus[] = pu_md_schliessen($inListe, $inTabelle);
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
                $aus[] = pu_md_schliessen($inListe, false);
                $inListe = null;
                $aus[] = '<div class="tabellenrahmen"><table>';
                $inTabelle = true;
                $aus[] = '<tr>' . implode('', array_map(fn($z) => '<th>' . pu_md_inline($z) . '</th>', $zellen)) . '</tr>';
                continue;
            }
            $aus[] = '<tr>' . implode('', array_map(fn($z) => '<td>' . pu_md_inline($z) . '</td>', $zellen)) . '</tr>';
            continue;
        }
        if ($inTabelle) { $aus[] = '</table></div>'; $inTabelle = false; }

        // ---------------------------------------------------------- Leerzeile
        if (trim($zeile) === '') {
            $aus[] = pu_md_schliessen($inListe, false);
            $inListe = null;
            continue;
        }

        // ---------------------------------------------------------- Überschrift
        if (preg_match('/^(#{1,6})\s+(.*)$/', $zeile, $m)) {
            $aus[] = pu_md_schliessen($inListe, false); $inListe = null;
            $n = strlen($m[1]);
            $aus[] = "<h$n>" . pu_md_inline($m[2]) . "</h$n>";
            continue;
        }

        // ---------------------------------------------------------- Trennlinie
        if (preg_match('/^\s*(---|\*\*\*|___)\s*$/', $zeile)) {
            $aus[] = pu_md_schliessen($inListe, false); $inListe = null;
            $aus[] = '<hr>';
            continue;
        }

        // ---------------------------------------------------------- Zitat
        if (preg_match('/^>\s?(.*)$/', $zeile, $m)) {
            $aus[] = pu_md_schliessen($inListe, false); $inListe = null;
            $aus[] = '<blockquote>' . pu_md_inline($m[1]) . '</blockquote>';
            continue;
        }

        // ---------------------------------------------------------- Listen
        if (preg_match('/^\s*[-*+]\s+(.*)$/', $zeile, $m)) {
            if ($inListe !== 'ul') { $aus[] = pu_md_schliessen($inListe, false); $aus[] = '<ul>'; $inListe = 'ul'; }
            $aus[] = '<li>' . pu_md_inline($m[1]) . '</li>';
            continue;
        }
        if (preg_match('/^\s*\d+\.\s+(.*)$/', $zeile, $m)) {
            if ($inListe !== 'ol') { $aus[] = pu_md_schliessen($inListe, false); $aus[] = '<ol>'; $inListe = 'ol'; }
            $aus[] = '<li>' . pu_md_inline($m[1]) . '</li>';
            continue;
        }

        // ---------------------------------------------------------- Absatz
        if ($inListe !== null) { $aus[] = pu_md_schliessen($inListe, false); $inListe = null; }
        $aus[] = '<p>' . pu_md_inline($zeile) . '</p>';
    }

    if ($inCode)    $aus[] = '</code></pre>';
    if ($inTabelle) $aus[] = '</table></div>';
    $aus[] = pu_md_schliessen($inListe, false);

    return implode("\n", array_filter($aus, fn($z) => $z !== ''));
}

function pu_md_schliessen(?string $liste, bool $tabelle): string
{
    $aus = '';
    if ($liste === 'ul') $aus .= '</ul>';
    if ($liste === 'ol') $aus .= '</ol>';
    if ($tabelle)        $aus .= '</table></div>';
    return $aus;
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
