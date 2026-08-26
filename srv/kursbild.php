<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — welches Bild gehört auf welche Kurskarte.
 *
 * **Eine Regel statt eines Katalogs.** Der Ordnername des Kurses ergibt den
 * Dateinamen: `10_Stufen/01_Entdecker` → `entdecker.jpg`,
 * `20_Domaenen/DOM-BER_Beratung` → `beratung.jpg`. Eine Liste, in der jeder
 * Kurs noch einmal von Hand steht, wäre die Stelle, an der beim nächsten Kurs
 * jemand den Eintrag vergisst — und dann fehlt das Bild ohne Fehlermeldung.
 *
 * Damit die Regel ohne Ausnahmen gilt, heissen die drei Dateien, die vorher
 * anders hiessen, jetzt wie ihr Ordner (`personal.jpg` → `personalverwaltung.jpg`
 * und so fort). Drei Umbenennungen sind billiger als eine Ausnahmetabelle, die
 * für immer mitgepflegt werden muss.
 *
 * Gibt es kein Bild, kommt `''` zurück und die Karte bleibt schlicht. Ein
 * fehlendes Bild darf nie eine leere Fläche mit einem gebrochenen Symbol sein.
 */

/** Wo die Kursbilder liegen — einmal, damit der Pfad nicht wandert. */
const PU_KURSBILD_ORDNER = 'assets/img/kurse';

/**
 * Der Dateiname zu einem Kurspfad, oder '' wenn es keinen gibt.
 *
 * @param string $pfad z.B. "10_Stufen/01_Entdecker"
 * @return string  URL ab Wurzel, z.B. "assets/img/kurse/entdecker.jpg"
 */
function pu_kursbild(string $pfad): string
{
    $letzt = basename(str_replace('\\', '/', $pfad));

    // Der Ordner trägt vorn eine Ordnungszahl oder ein Kürzel, hinter dem
    // ersten Unterstrich steht der Name: `01_Entdecker`, `DOM-BER_Beratung`.
    $pos  = strpos($letzt, '_');
    $name = $pos === false ? $letzt : substr($letzt, $pos + 1);

    $slug = pu_slug($name);
    if ($slug === '') return '';

    return pu_kursbild_datei($slug);
}

/**
 * Prüft, ob es zu einem Namen eine Bilddatei gibt.
 *
 * Getrennt von `pu_kursbild()`, weil auch die Tages-Challenge ein Bild hat
 * (`challenge.jpg`), das zu keinem Kursordner gehört.
 */
function pu_kursbild_datei(string $slug): string
{
    // Die Pfadwache greift auch hier: der Name kommt zwar aus dem eigenen
    // Ordnerbaum, aber ein Kursordner ist eine Datei auf der Platte, und
    // Dateinamen sind Eingaben wie andere auch.
    if ($slug === '' || strpos($slug, '..') !== false
        || strpos($slug, '/') !== false || strpos($slug, "\0") !== false) {
        return '';
    }

    $rel = PU_KURSBILD_ORDNER . '/' . $slug . '.jpg';
    if (!is_file(PU_ROOT . '/' . $rel)) return '';

    // Mit führendem Schrägstrich. Die Oberfläche setzt den Pfad in eine
    // CSS-Variable, und eine relative URL darin wird gegen das Stylesheet
    // aufgelöst, nicht gegen die Seite — aus `assets/img/…` wurde deshalb
    // `/assets/css/assets/img/…` und jedes Bild lief in einen 404.
    return '/' . $rel;
}
