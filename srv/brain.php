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
/**
 * Prüft einen Bildpfad aus dem Markdown und gibt ihn zurück — oder ''.
 *
 * Erlaubt sind nur Pfade unter `medien/` und `assets/`, relativ zum Programm-
 * ordner, ohne `..`, ohne Schema. Ein Bild aus dem Vault selbst wird NICHT
 * ausgeliefert: dort liegen die Rohquellen.
 */
function pu_md_bild(string $pfad): string
{
    $pfad = trim($pfad);
    if ($pfad === '' || str_contains($pfad, '..') || preg_match('#^[a-z]+:#i', $pfad)) return '';
    $pfad = '/' . ltrim($pfad, '/');
    if (!str_starts_with($pfad, '/medien/') && !str_starts_with($pfad, '/assets/')) return '';
    if (!preg_match('/^[\/A-Za-z0-9 ._%-]+$/', $pfad)) return '';
    return $pfad;
}

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
    $klein  = null;      // Zeilen eines klein gesetzten Blocks (null: keiner offen)

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
    /* Ein klein gesetzter Block: beginnt mit ~ an der Zeilenspitze, endet mit ~
       am Zeilenende. Jede Quellzeile bleibt eine Zeile — hier ist der Umbruch
       Inhalt, nicht Satzbau. */
    $kleinZu = static function () use (&$klein, &$aus): void {
        if ($klein !== null && $klein !== []) {
            $aus[] = '<p class="md-klein">'
                   . implode('<br>', array_map('pu_md_inline', $klein)) . '</p>';
        }
        $klein = null;
    };
    $allesZu = static function () use ($absatzZu, $listeZu, $zitatZu, $kleinZu): void {
        $absatzZu(); $listeZu(); $zitatZu(); $kleinZu();
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

        // ---------------------------------------------------------- Bild
        // Eine Zeile für sich: ![Beschriftung](/medien/pfad/bild.jpg)
        if (preg_match('/^!\[([^\]]*)\]\(([^)\s]+)\)\s*$/', $zeile, $m)) {
            $allesZu();
            if ($inTabelle) { $aus[] = '</table></div>'; $inTabelle = false; }
            $bild = pu_md_bild($m[2]);
            if ($bild !== '') {
                // Rahmen und Breite stehen zusätzlich als Attribut/Inline-Stil am
                // Element: So sitzt das Bild auch dann richtig, wenn ein altes
                // Stylesheet im Browser liegt. Das Ornament kommt aus dem CSS.
                $stil = 'max-width:720px;width:100%;margin:1.8rem auto;padding:16px;'
                      . 'border:1px solid var(--gold,#ffc94d);border-radius:10px;'
                      . 'box-sizing:border-box;background:var(--grund-2,#1c1815)';
                $bildstil = 'display:block;width:100%;max-width:100%;height:auto;border-radius:6px';
                $aus[] = '<figure class="lektion-bild" style="' . pu_h($stil) . '">'
                       . '<span class="lb-band lb-oben" aria-hidden="true"></span>'
                       . '<span class="lb-band lb-unten" aria-hidden="true"></span>'
                       . '<span class="lb-band lb-links" aria-hidden="true"></span>'
                       . '<span class="lb-band lb-rechts" aria-hidden="true"></span>'
                       . '<img src="' . pu_h($bild) . '" alt="' . pu_h($m[1]) . '" width="720"'
                       // Kein loading="lazy": Beim Drucken lädt der Browser
                       // Bilder ausserhalb des Sichtfelds nicht nach — im PDF
                       // erschien dann nur das erste Bild einer Seite.
                       . ' style="' . pu_h($bildstil) . '">'
                       . ($m[1] !== '' ? '<figcaption>' . pu_md_inline($m[1]) . '</figcaption>' : '')
                       . '</figure>';
            }
            continue;
        }

        // ---------------------------------------------------------- Illustration
        // :::zeitstrahl setzt die animierte Zeitachse — fest im Code, weil sie
        // Grafik ist und kein Inhalt: Der Stoff bleibt reiner Text.
        if (preg_match('/^:::([a-z-]+)\s*$/', $zeile, $m)) {
            $allesZu();
            if ($inTabelle) { $aus[] = '</table></div>'; $inTabelle = false; }
            if ($m[1] === 'ornament') {
                // Zierband als Trenner: dasselbe Mäander wie in der Marke,
                // eine Kachel hoch, über die volle Textbreite.
                $aus[] = '<div class="zierband trenn-ornament" role="separator" aria-hidden="true"></div>';
            }
            if ($m[1] === 'zeitstrahl') {
                $achse = '<svg viewBox="0 0 1000 490" preserveAspectRatio="xMidYMid meet" aria-hidden="true">';
                $achse .= '<path class="linie" style="animation-delay:.1s;animation-duration:3.4s" d="M60 120 H940" />';
                $achse .= '<g class="station" style="--d:0.1s">'
                       . '<circle cx="60" cy="120" r="7" />'
                       . '<text class="jahr" x="60" y="100">um 300 v. Chr.</text>'
                       . '<text class="name" x="60" y="150">Aristoteles</text>'
                       . '<text class="sache" x="60" y="167">Logik als Lehrstoff</text></g>';
                $achse .= '<g class="station" style="--d:0.59s">'
                       . '<circle cx="186" cy="120" r="7" />'
                       . '<text class="jahr" x="186" y="100">um 150 v. Chr.</text>'
                       . '<text class="name" x="186" y="150">Griechen</text>'
                       . '<text class="sache" x="186" y="167">Astrolabium</text></g>';
                $achse .= '<g class="station" style="--d:1.07s">'
                       . '<circle cx="311" cy="120" r="7" />'
                       . '<text class="jahr" x="311" y="100">1673</text>'
                       . '<text class="name" x="311" y="150">G. W. Leibniz</text>'
                       . '<text class="sache" x="311" y="167">Staffelwalzen</text></g>';
                $achse .= '<g class="station" style="--d:1.56s">'
                       . '<circle cx="437" cy="120" r="7" />'
                       . '<text class="jahr" x="437" y="100">1703</text>'
                       . '<text class="name" x="437" y="150">G. W. Leibniz</text>'
                       . '<text class="sache" x="437" y="167">Dualzahlen</text></g>';
                $achse .= '<g class="station" style="--d:2.04s">'
                       . '<circle cx="563" cy="120" r="7" />'
                       . '<text class="jahr" x="563" y="100">1804</text>'
                       . '<text class="name" x="563" y="150">J. M. Jacquard</text>'
                       . '<text class="sache" x="563" y="167">Lochkarte</text></g>';
                $achse .= '<g class="station" style="--d:2.53s">'
                       . '<circle cx="689" cy="120" r="7" />'
                       . '<text class="jahr" x="689" y="100">1830</text>'
                       . '<text class="name" x="689" y="150">C. Babbage</text>'
                       . '<text class="sache" x="689" y="167">Analytical Engine</text></g>';
                $achse .= '<g class="station" style="--d:3.01s">'
                       . '<circle cx="814" cy="120" r="7" />'
                       . '<text class="jahr" x="814" y="100">1843</text>'
                       . '<text class="name" x="814" y="150">A. Lovelace</text>'
                       . '<text class="sache" x="814" y="167">erstes Programm</text></g>';
                $achse .= '<g class="station" style="--d:3.5s">'
                       . '<circle cx="940" cy="120" r="7" />'
                       . '<text class="jahr" x="940" y="100">1900</text>'
                       . '<text class="name" x="940" y="150">D. Hilbert</text>'
                       . '<text class="sache" x="940" y="167">23 Probleme</text></g>';
                /* Verbinder: vom Ende der ersten Reihe hinunter und zurück an
                   den Anfang der zweiten — sonst wirken die zwei Reihen wie
                   zwei Listen statt wie eine Zeitachse. */
                $achse .= '<path class="linie verbinder" d="M940 120 L940 215 Q940 238 918 238 L82 238 Q60 238 60 260 L60 350" />';
                $achse .= '<path class="linie" style="animation-delay:4.4s;animation-duration:3.4s" d="M60 350 H940" />';
                $achse .= '<g class="station" style="--d:4.4s">'
                       . '<circle cx="60" cy="350" r="7" />'
                       . '<text class="jahr jahr-ende" x="48" y="330">1931</text>'
                       . '<text class="name" x="60" y="380">K. Gödel</text>'
                       . '<text class="sache" x="60" y="397">Unvollständigkeit</text></g>';
                $achse .= '<g class="station" style="--d:4.78s">'
                       . '<circle cx="158" cy="350" r="7" />'
                       . '<text class="jahr" x="158" y="330">1936</text>'
                       . '<text class="name" x="158" y="380">A. Turing</text>'
                       . '<text class="sache" x="158" y="397">Turing-Maschine</text></g>';
                $achse .= '<g class="station" style="--d:5.16s">'
                       . '<circle cx="256" cy="350" r="7" />'
                       . '<text class="jahr" x="256" y="330">1941</text>'
                       . '<text class="name" x="256" y="380">K. Zuse</text>'
                       . '<text class="sache" x="256" y="397">Z3</text></g>';
                $achse .= '<g class="station" style="--d:5.53s">'
                       . '<circle cx="353" cy="350" r="7" />'
                       . '<text class="jahr" x="353" y="330">1945</text>'
                       . '<text class="name" x="353" y="380">J. von Neumann</text>'
                       . '<text class="sache" x="353" y="397">EDVAC</text></g>';
                $achse .= '<g class="station" style="--d:5.91s">'
                       . '<circle cx="451" cy="350" r="7" />'
                       . '<text class="jahr" x="451" y="330">1950</text>'
                       . '<text class="name" x="451" y="380">A. Turing</text>'
                       . '<text class="sache" x="451" y="397">Turing-Test</text></g>';
                $achse .= '<g class="station" style="--d:6.29s">'
                       . '<circle cx="549" cy="350" r="7" />'
                       . '<text class="jahr" x="549" y="330">1956</text>'
                       . '<text class="name" x="549" y="380">A. Newell / H. Simon</text>'
                       . '<text class="sache" x="549" y="397">Logic Theorist</text></g>';
                $achse .= '<g class="station" style="--d:6.67s">'
                       . '<circle cx="647" cy="350" r="7" />'
                       . '<text class="jahr" x="647" y="330">1971</text>'
                       . '<text class="name" x="647" y="380">L. Chua</text>'
                       . '<text class="sache" x="647" y="397">Memristor</text></g>';
                $achse .= '<g class="station" style="--d:7.04s">'
                       . '<circle cx="744" cy="350" r="7" />'
                       . '<text class="jahr" x="744" y="330">1986</text>'
                       . '<text class="name" x="744" y="380">G. Hinton</text>'
                       . '<text class="sache" x="744" y="397">Backpropagation</text></g>';
                $achse .= '<g class="station" style="--d:7.42s">'
                       . '<circle cx="842" cy="350" r="7" />'
                       . '<text class="jahr" x="842" y="330">2012</text>'
                       . '<text class="name" x="842" y="380">A. Krizhevsky</text>'
                       . '<text class="sache" x="842" y="397">ImageNet</text></g>';
                $achse .= '<g class="station" style="--d:7.8s">'
                       . '<circle cx="940" cy="350" r="7" />'
                       . '<text class="jahr" x="940" y="330">2022</text>'
                       . '<text class="name" x="940" y="380">OpenAI</text>'
                       . '<text class="sache" x="940" y="397">ChatGPT</text></g>';
                $achse .= '</svg>';
                $aus[] = '<div class="illu illu-zeitstrahl" role="img"'
                       . ' aria-label="Zeitachse der Geschichte der künstlichen Intelligenz">'
                       . $achse . '</div>';
            }
            continue;
        }

        // ---------------------------------------------------------- Zentriert
        // Eine Zeile, die mit -> beginnt und mit <- endet, steht mittig — gedacht
        // für Bildunterschriften direkt unter einer Abbildung.
        if (preg_match('/^\s*->(.*)<-\s*$/', $zeile, $m)) {
            $allesZu();
            if ($inTabelle) { $aus[] = '</table></div>'; $inTabelle = false; }
            $aus[] = '<p class="md-mitte">' . pu_md_inline(trim($m[1])) . '</p>';
            continue;
        }

        // ---------------------------------------------------------- Kleiner Block
        // ~ am Zeilenanfang öffnet, ~ am Zeilenende schliesst. Dazwischen bleibt
        // jede Zeile eine Zeile. Ein Block, der nicht schliesst, endet an der
        // nächsten Leerzeile oder am nächsten Block.
        if ($klein !== null) {
            $innen = rtrim($zeile);
            if (trim($innen) === '') { $kleinZu(); continue; }
            if (str_ends_with($innen, '~')) {
                $innen = rtrim(substr($innen, 0, -1));
                if ($innen !== '') $klein[] = $innen;
                $kleinZu();
            } else {
                $klein[] = $innen;
            }
            continue;
        }
        if (preg_match('/^\s*~(?!~)(.*)$/', $zeile, $m)) {
            $absatzZu(); $listeZu(); $zitatZu();
            $innen = rtrim($m[1]);
            if (str_ends_with($innen, '~')) {         // einzeilig: ~Text~
                $innen = rtrim(substr($innen, 0, -1));
                if ($innen !== '') {
                    $aus[] = '<p class="md-klein">' . pu_md_inline($innen) . '</p>';
                }
            } else {
                $klein = [$innen];
            }
            continue;
        }

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
            /* Etappen-Überschriften bekommen zwei Teile: „Etappe 3 —" und den
               Titel. Nur so kann ein Umbruch auf der Fluchtlinie des Titels
               landen („1830, London: …") statt am linken Rand zu kleben —
               bei reinem Text entscheidet der Browser, wo die zweite Zeile
               anfängt, und sie fängt immer vorne an. */
            if ($n === 2 && preg_match('/^(Etappe\s+\d+\s+—)\s+(.+)$/u', $m[2], $e)) {
                $aus[] = '<h2 class="etappe-kopf"><span class="etappe-nr">' . pu_h($e[1]) . '</span>'
                       . '<span class="etappe-titel">' . pu_md_inline($e[2]) . '</span></h2>';
                continue;
            }
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
 *
 * Erst zusammensetzen, dann auszeichnen: Wurde jede Zeile einzeln
 * ausgezeichnet, blieb ein Fettdruck über einen Zeilenumbruch als `**…**`
 * stehen (bis 19.10.2026 in rund achtzig Absätzen des Stoffs). Der harte
 * Umbruch wartet als "\n" — das übersteht pu_h() — und wird erst danach
 * zum <br>.
 */
function pu_md_zeilen(array $zeilen): string
{
    $text = '';
    $n = count($zeilen);
    foreach ($zeilen as $i => $z) {
        $hart = preg_match('/(  |\\\\)$/', $z) === 1;
        $z = rtrim(preg_replace('/\\\\$/', '', $z) ?? $z);
        $text .= ltrim($z);
        if ($i < $n - 1) $text .= $hart ? "\n" : ' ';
    }
    return str_replace("\n", '<br>', pu_md_inline($text));
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

    // Kursiv auch mit Unterstrichen — _so_. Die Wächter links und rechts sorgen
    // dafür, dass Pfade und Dateinamen wie 20_Domaenen unangetastet bleiben:
    // dort steht der Unterstrich zwischen Wortzeichen, nicht frei.
    $s = preg_replace('/(?<![\w_])_([^_\n]+)_(?![\w_])/', '<em>$1</em>', $s) ?? $s;

    // Kleiner gesetzt: ~so~. Gedacht für Klammern, Herkunftsangaben und
    // Nebensätze — nicht für ganze Absätze. Zwei Tilden bleiben unberührt,
    // und die Tilde muss am Text kleben: „~100 Quellen, ~200 Seiten" meint
    // „ungefähr", nicht „klein".
    $s = preg_replace('/(?<![~\w])~(?=\S)([^~\n]*?\S)~(?![~\w])/u', '<small>$1</small>', $s) ?? $s;

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
