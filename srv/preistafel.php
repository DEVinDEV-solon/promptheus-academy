<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — die Preistafel als HTML.
 *
 * Sie steht an zwei Orten: am Tor, wo sie **ohne Anmeldung** lesbar sein muss
 * (wer wissen will, was etwas kostet, soll sich dafür nicht erst ein Konto
 * anlegen), und im Cockpit beim Nachbuchen. Damit beide dieselbe Tafel zeigen,
 * wird sie hier gebaut und nicht zweimal.
 *
 * Serverseitig gerendert, ohne JavaScript: eine Preisübersicht, die erst nach
 * einem Skript erscheint, ist für Suchmaschinen und für abgeschaltetes
 * JavaScript nicht da.
 */

/**
 * Die vier Pläne als Karten.
 *
 * @param string $jetzt  Schlüssel des laufenden Plans — der bekommt eine Marke
 * @param bool   $knoepfe Knöpfe zeigen? Am Tor nicht: dort kann man nichts buchen.
 */
function pu_preistafel_html(string $jetzt = '', bool $knoepfe = false): string
{
    $h = '<div class="preistafel">';

    foreach (PU_PLAENE as $schluessel => $p) {
        $laeuft = $schluessel === $jetzt;

        // Die Schule trägt die Empfehlung, weil sie je Kopf am günstigsten
        // ist — das ist eine Tatsache aus der Tabelle, keine Meinung.
        $beste = $schluessel === 'schule';

        $h .= '<article class="preis-karte' . ($laeuft ? ' laeuft' : '') .
              ($beste ? ' beste' : '') . '">';

        if ($laeuft)      $h .= '<div class="preis-marke">dein Plan</div>';
        elseif ($beste)   $h .= '<div class="preis-marke still">je Student am günstigsten</div>';

        $h .= '<h3>' . pu_h($p['name']) . '</h3>'
            . '<div class="preis-betrag">' . pu_h(pu_eur($p['cent']))
            . '<span class="preis-takt">im Monat</span></div>';

        if ($p['plaetze'] > 1) {
            $h .= '<div class="preis-kopf">' . pu_h(pu_eur(pu_plan_je_kopf($p)))
                . ' je Platz</div>';
        }

        $h .= '<p class="preis-kurz">' . pu_h($p['kurz']) . '</p>'
            . '<ul class="preis-liste">';

        foreach ($p['enthalten'] as $z) {
            $h .= '<li>' . pu_h($z) . '</li>';
        }

        $h .= '</ul><p class="preis-fuer">' . pu_h($p['fuer']) . '</p>';

        if ($knoepfe && !$laeuft) {
            $h .= '<button class="knopf still" type="button" data-plan="'
                . pu_h($schluessel) . '">' . pu_h($p['name']) . ' buchen</button>';
        }

        $h .= '</article>';
    }

    return $h . '</div>';
}

/** Die drei Token-Pakete. */
function pu_pakete_html(bool $knoepfe = false): string
{
    $h = '<div class="paket-reihe">';

    foreach (PU_TOKENPAKETE as $schluessel => $p) {
        // Der Aufschlag gegenüber dem kleinsten Paket — gerechnet, nicht
        // behauptet. Wer „25 % mehr" schreibt, ohne es auszurechnen, hat es
        // irgendwann falsch stehen.
        $klein = PU_TOKENPAKETE['klein'];
        $jeEuro      = $p['tokens'] / max(1, $p['cent']);
        $jeEuroKlein = $klein['tokens'] / max(1, $klein['cent']);
        $mehr = (int)round(($jeEuro / $jeEuroKlein - 1) * 100);

        $h .= '<div class="paket">'
            . '<div class="paket-name">' . pu_h($p['name']) . '</div>'
            . '<div class="paket-preis">' . pu_h(pu_eur($p['cent'])) . '</div>'
            . '<div class="paket-tokens">' . number_format($p['tokens'], 0, ',', '.')
            . ' Token</div>'
            . ($mehr > 0 ? '<div class="paket-mehr">+' . $mehr . ' % je Euro</div>' : '')
            . ($knoepfe
                ? '<button class="knopf still" type="button" data-paket="'
                  . pu_h($schluessel) . '">Vormerken</button>'
                : '')
            . '</div>';
    }

    return $h . '</div>';
}

/**
 * Die zwei Wege — und warum sie rechtlich verschieden enden.
 *
 * **Nicht der Tarif entscheidet, sondern was gekauft wird.** Ein Abo ist eine
 * Dienstleistung: das Widerrufsrecht bleibt vierzehn Tage bestehen, egal ob
 * Schüler-, Familien-, Klassen- oder Schulplan. Ein Token-Paket ist ein
 * digitaler Inhalt: dort erlischt es, sobald mit Zustimmung sofort
 * freigeschaltet wird (§ 356 Abs. 5 BGB).
 *
 * Wer kauft, entscheidet etwas anderes: ob es überhaupt ein Widerrufsrecht
 * gibt. Verbraucher ja, Schulen und Träger nein — die sind Unternehmer
 * (§ 14 BGB). Zwei Achsen, nicht eine, und sie werden hier auch als zwei
 * dargestellt. Eine Tafel, die beides in eine Zeile presst, erzeugt genau die
 * Verwechslung, die später als Beschwerde zurückkommt.
 *
 * Die beiden Häkchen stehen **nicht** hier, sondern im Kauf selbst: eine
 * Zustimmung gehört zu einer bestimmten Bestellung und nicht zu einer
 * Übersichtsseite. Eine Vorab-Zustimmung auf Vorrat wäre keine.
 */
function pu_wege_html(): string
{
    $weg = function (string $nr, string $name, string $was, string $folge,
                     string $rest, string $knopf): string {
        return '<article class="weg-karte">'
             . '<p class="weg-nr">' . pu_h($nr) . '</p>'
             . '<h4>' . pu_h($name) . '</h4>'
             . '<p class="weg-was">' . pu_h($was) . '</p>'
             . '<p class="weg-folge"><b>' . pu_h($folge) . '</b></p>'
             . '<p class="klein">' . $rest . '</p>'
             . '<button class="knopf" type="button" data-login-auf>' . pu_h($knopf) . '</button>'
             . '</article>';
    };

    return '<div class="wege">'
         . '<h3>Zwei Wege, zwei Rechtsfolgen</h3>'
         . '<p class="hinweis">Welcher davon gilt, hängt daran, <b>was</b> du kaufst '
         . '— nicht daran, welchen Tarif du wählst. Alle vier Pläne sind derselbe Weg.</p>'
         . '<div class="weg-reihe">'
         . $weg('Weg 1', 'Zugang im Abo',
                'Ein Plan, monatlich. Rechtlich eine Dienstleistung.',
                '14 Tage Widerruf — bleibt bestehen.',
                'Beginnt der Zugang auf deinen Wunsch sofort, zahlst du bei einem '
                . 'Widerruf nur den bis dahin genutzten Anteil. Monatlich kündbar.',
                'Zugang wählen')
         . $weg('Weg 2', 'Token nachlegen',
                'Ein Guthabenpaket. Rechtlich ein digitaler Inhalt.',
                'Widerruf erlischt bei sofortiger Freischaltung.',
                'Dafür setzt du beim Kauf zwei Häkchen — sie stehen dort und nicht '
                . 'hier, weil eine Zustimmung zu einer bestimmten Bestellung gehört. '
                . 'Ohne die Häkchen kannst du trotzdem kaufen und behältst deine '
                . '14 Tage; die Token kommen dann nach Fristablauf.',
                'Token nachlegen')
         . '</div>'
         . '<p class="klein weg-fuss">Das Widerrufsrecht haben <b>Verbraucher</b>. '
         . 'Schulen und Träger sind Unternehmer nach § 14 BGB und haben keines — '
         . 'für sie gilt die monatliche Laufzeit. Einzelheiten in der '
         . '<a href="recht.php?t=widerruf">Widerrufsbelehrung</a>.</p>'
         . '</div>';
}

/**
 * Wofür die Token draufgehen.
 *
 * Was es noch nicht gibt, steht grau und ohne Knopf da — eine Pauschale, die
 * man nicht ausgeben kann, muss auch so aussehen. Die fünf mit `werkstatt`
 * gehören zur Design-Werkstatt, die später als eigene Seite kommt.
 */
function pu_werkzeuge_html(): string
{
    $zeile = function (array $w): string {
        $preis = $w['pauschale'] > 0
            ? number_format($w['pauschale'], 0, ',', '.') . ' Token'
            : 'nach Verbrauch';

        return '<tr' . ($w['bereit'] ? '' : ' class="spaeter"') . '>'
             . '<td>' . pu_h($w['name']) . ($w['bereit'] ? '' : ' <span class="klein">— in Vorbereitung</span>') . '</td>'
             . '<td class="zahl">' . pu_h($preis) . '</td>'
             . '<td class="klein">' . pu_h($w['einheit']) . '</td>'
             . '<td class="klein">' . pu_h($w['was']) . '</td></tr>';
    };

    $jetzt = array_filter(PU_WERKZEUGE, fn($w) => empty($w['werkstatt']));
    $werk  = array_filter(PU_WERKZEUGE, fn($w) => !empty($w['werkstatt']));

    $h = '<table class="werkzeug-tafel"><thead><tr>'
       . '<th>Wofür</th><th class="zahl">Pauschale</th><th>je</th><th>Was das ist</th>'
       . '</tr></thead><tbody>';

    foreach ($jetzt as $w) $h .= $zeile($w);

    $h .= '<tr class="tafel-trenner"><td colspan="4">'
        . '<b>Design-Werkstatt</b> — eine eigene Seite mit Werkzeugen für Texte, '
        . 'Bilder, Präsentationen, Musik und Videos. Sie kommt später; die Preise '
        . 'stehen schon hier, damit niemand ein Paket kauft und hinterher erfährt, '
        . 'was es kostet.</td></tr>';

    foreach ($werk as $w) $h .= $zeile($w);

    return $h . '</tbody></table>';
}
