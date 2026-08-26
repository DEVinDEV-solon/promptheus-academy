<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Farbvarianten.
 *
 * Sechs fertige Paletten, zwischen denen man umschalten kann, wenn die
 * Academy-Regel `farbvarianten` an ist. Nach dem Muster von Odysseus: eine
 * benannte Tabelle, eine Auswahl im Kopf, gespeichert je Person.
 *
 * **Warum überhaupt.** Dieselbe Oberfläche muss einem Neunjährigen und einer
 * Schulleiterin gefallen. Das geht nicht mit einer Palette — aber auch nicht
 * mit einem freien Farbwähler: dann stellt jemand Gelb auf Weiss und liest
 * nichts mehr. Sechs geprüfte Paletten sind der Mittelweg: Auswahl ja,
 * Unlesbarkeit nein.
 *
 * **Jede Variante ist gemessen.** `tests/varianten_test.php` rechnet für jede
 * den Kontrast von Schrift gegen Grund und von Schrift-2 gegen Grund-2 aus
 * und besteht nur, wenn beide über 4,5:1 liegen. Eine Palette, die schön
 * aussieht und die man nicht lesen kann, kommt hier nicht durch.
 *
 * **Eine Palette ist hell oder dunkel — das ist keine zweite Einstellung.**
 * „Olymp in hell" gibt es nicht; das wäre eine andere Palette. Deshalb trägt
 * jede ihren `grundton` und einen `partner` auf der anderen Seite: der
 * Hell/Dunkel-Knopf wechselt zur Partnerpalette, statt eine Farbwelt
 * aufzuhellen, die dafür nicht gebaut ist.
 *
 * Das war anfangs anders gelöst und falsch: Themenblock und Variantenblock
 * hatten dieselbe Spezifität, der Variantenblock stand später — also gewann
 * er immer, und der Hell-Schalter wirkte nur noch dort, wo zufällig eine
 * Regel mit höherer Spezifität stand (die Kopfleiste). Zwei Angaben, die
 * dieselben Farben setzen, sind keine zwei Einstellungen, sondern ein Fehler.
 */

/**
 * Die Paletten.
 *
 * Nur die Werte, die eine Variante wirklich ausmachen — alles andere leiten
 * die vorhandenen Regeln daraus ab. Eine Palette mit vierzig Feldern wäre
 * vierzigmal die Gelegenheit, eine Zeile zu vergessen.
 */
const PU_VARIANTEN = [
    'schmiede' => [
        'name'     => 'Schmiede',
        'was'      => 'Die Vorgabe: Glut auf dunklem Grund, Gold für Erfolg.',
        'partner'  => 'pergament',
        'grundton' => 'dunkel',
        'farben'   => [
            'grund' => '#14110f', 'grund-2' => '#1c1815', 'grund-3' => '#262019',
            'rand'  => '#3a3129', 'rand-hell' => '#504338',
            'schrift' => '#ede5db', 'schrift-2' => '#b3a596', 'schrift-3' => '#aaa39c',
            'glut' => '#ff7a1c', 'glut-hell' => '#ffa347', 'glut-tief' => '#c14e00',
            'gold' => '#ffc94d', 'lapis' => '#4e82b6',
        ],
    ],

    'pergament' => [
        'name'     => 'Pergament',
        'was'      => 'Hell und warm, wie ein Buch bei Tageslicht.',
        'partner'  => 'schmiede',
        'grundton' => 'hell',
        'farben'   => [
            'grund' => '#f7f3ec', 'grund-2' => '#fffdfa', 'grund-3' => '#efe8dc',
            'rand'  => '#ddd2c0', 'rand-hell' => '#c4b49a',
            'schrift' => '#241d16', 'schrift-2' => '#55483c', 'schrift-3' => '#5a5046',
            'glut' => '#b74e0c', 'glut-hell' => '#e2711d', 'glut-tief' => '#8f3800',
            'gold' => '#9a6a00', 'lapis' => '#2f6394',
        ],
    ],

    'olymp' => [
        'name'     => 'Olymp',
        'was'      => 'Nachtblau mit Gold — ruhiger als die Glut, für lange Sitzungen.',
        'partner'  => 'marmor',
        'grundton' => 'dunkel',
        'farben'   => [
            'grund' => '#0d1420', 'grund-2' => '#141d2c', 'grund-3' => '#1c2839',
            'rand'  => '#2c3a4f', 'rand-hell' => '#3e5069',
            'schrift' => '#e4ebf5', 'schrift-2' => '#a3b2c6', 'schrift-3' => '#9da9b9',
            'glut' => '#5b9bd8', 'glut-hell' => '#8dbcea', 'glut-tief' => '#2c5f96',
            'gold' => '#ffd27a', 'lapis' => '#7fb0dd',
        ],
    ],

    'marmor' => [
        'name'     => 'Marmor',
        'was'      => 'Hell und kühl, sehr ruhig. Für Bildschirme in hellen Räumen.',
        'partner'  => 'olymp',
        'grundton' => 'hell',
        'farben'   => [
            'grund' => '#f4f5f7', 'grund-2' => '#ffffff', 'grund-3' => '#e8eaee',
            'rand'  => '#d3d7de', 'rand-hell' => '#b3bac5',
            'schrift' => '#1a1e26', 'schrift-2' => '#454c58', 'schrift-3' => '#4d535e',
            'glut' => '#9a5b1e', 'glut-hell' => '#b06d28', 'glut-tief' => '#6d3c0d',
            'gold' => '#8a6a12', 'lapis' => '#2a5d90',
        ],
    ],

    'terrakotta' => [
        'name'     => 'Terrakotta',
        'was'      => 'Erdig und warm — gebrannter Ton statt schwarzer Bildschirm.',
        'partner'  => 'pergament',
        'grundton' => 'dunkel',
        'farben'   => [
            'grund' => '#20120e', 'grund-2' => '#2b1a14', 'grund-3' => '#38231b',
            'rand'  => '#4d3225', 'rand-hell' => '#6b4632',
            'schrift' => '#f3e3d5', 'schrift-2' => '#c3a794', 'schrift-3' => '#b5a69b',
            'glut' => '#e0642f', 'glut-hell' => '#f08a58', 'glut-tief' => '#a33d13',
            'gold' => '#e8b45c', 'lapis' => '#5f93ab',
        ],
    ],

    'funkenflug' => [
        'name'     => 'Funkenflug',
        'was'      => 'Kräftig und bunt. Gedacht für die jüngeren Stufen.',
        'partner'  => 'marmor',
        'grundton' => 'dunkel',
        'farben'   => [
            'grund' => '#161028', 'grund-2' => '#211838', 'grund-3' => '#2d2149',
            'rand'  => '#413063', 'rand-hell' => '#5b4487',
            'schrift' => '#f2ecff', 'schrift-2' => '#c0b3dd', 'schrift-3' => '#ada2c8',
            'glut' => '#ff8a3d', 'glut-hell' => '#ffab6b', 'glut-tief' => '#d1550e',
            'gold' => '#ffd93d', 'lapis' => '#6ac9e8',
        ],
    ],
];

/** Die Vorgabe, wenn niemand etwas gewählt hat. */
const PU_VARIANTE_VORGABE = 'schmiede';

function pu_variante(string $kennung): ?array
{
    return PU_VARIANTEN[$kennung] ?? null;
}

/**
 * Alle Varianten für die Oberfläche — mit den zwei Farben, die eine Vorschau
 * braucht, aber ohne die ganze Palette. Die steht im Stylesheet.
 */
function pu_varianten_liste(): array
{
    $aus = [];
    foreach (PU_VARIANTEN as $k => $v) {
        $aus[] = [
            'kennung'  => $k,
            'name'     => $v['name'],
            'was'      => $v['was'],
            'grundton' => $v['grundton'],
            'partner'  => $v['partner'],
            'grund'    => $v['farben']['grund'],
            'glut'     => $v['farben']['glut'],
            'gold'     => $v['farben']['gold'],
        ];
    }
    return $aus;
}

/**
 * Erzeugt den CSS-Block für alle Varianten.
 *
 * Warum erzeugt statt von Hand geschrieben: die Paletten stehen hier oben in
 * PHP, weil die Oberfläche sie für die Auswahlliste braucht. Stünden sie
 * zusätzlich als CSS in einer Datei, gäbe es zwei Wahrheiten — und eines
 * Tages eine Variante, die im Menü anders heisst als auf dem Bildschirm.
 */
function pu_varianten_css(): string
{
    $aus = '';
    foreach (PU_VARIANTEN as $k => $v) {
        $zeilen = [];
        foreach ($v['farben'] as $name => $wert) {
            $zeilen[] = '  --' . $name . ': ' . $wert . ';';
        }
        // Aus dem Grundton leiten sich die Werte ab, die vom Helligkeitstyp
        // abhängen — Kartenschleier, Ornamentstärke, Bildstärke. Sonst müsste
        // jede Palette sie mitschleppen.
        if ($v['grundton'] === 'hell') {
            // **Aus der Palette, nicht fest eingetragen.** Hier standen lange
            // Pergaments Werte als Zahlen — sie waren richtig, solange
            // Pergament die einzige helle Palette war. Marmor ist kühl, bekam
            // aber denselben cremefarbenen Schleier über Grund, Karten und
            // Leiste: eine kühle Palette mit warmem Überzug. Für Pergament
            // ändert sich durch die Ableitung nichts (grund-2 ist #fffdfa,
            // grund ist #f7f3ec — genau die alten Zahlen).
            $zeilen[] = '  --karte-schleier: ' . pu_hex_rgb($v['farben']['grund-2']) . ';';
            $zeilen[] = '  --kd-0: .97; --kd-1: .94; --kd-2: .80; --kd-3: .62;';
            $zeilen[] = '  --bild-staerke: .09; --bild-schleier: '
                      . pu_hex_rgb($v['farben']['grund']) . ';';
            $zeilen[] = '  --ornament-farbe: var(--glut-tief);';
            $zeilen[] = '  --ornament-staerke: .055; --ornament-fein: .035;';
            $zeilen[] = '  --liquid-staerke: .30;';
            $zeilen[] = '  --glas: rgb(' . pu_hex_rgb($v['farben']['grund-2']) . ' / .78);';
            // Fachbegriffe stehen mitten im Fliesstext und brauchen darum mehr
            // als eine Auszeichnungsfarbe. Siehe pu_hex_dunkler().
            $zeilen[] = '  --begriff: ' . pu_hex_dunkler($v['farben']['gold'], .70) . ';';
        } else {
            $zeilen[] = '  --karte-schleier: ' . pu_hex_rgb($v['farben']['grund-3']) . ';';
            $zeilen[] = '  --kd-0: .96; --kd-1: .90; --kd-2: .66; --kd-3: .42;';
            $zeilen[] = '  --bild-staerke: .20; --bild-schleier: '
                      . pu_hex_rgb($v['farben']['grund']) . ';';
            $zeilen[] = '  --ornament-farbe: var(--gold);';
            $zeilen[] = '  --ornament-staerke: .07; --ornament-fein: .045;';
            $zeilen[] = '  --liquid-staerke: .55;';
            $zeilen[] = '  --glas: rgb(' . pu_hex_rgb($v['farben']['grund-3']) . ' / .72);';
            // Auf dunklem Grund leuchtet das Gold der Palette schon von selbst.
            $zeilen[] = '  --begriff: var(--gold);';
        }
        $zeilen[] = '  --schein: rgb(' . pu_hex_rgb($v['farben']['glut']) . ' / .10);';
        $zeilen[] = '  --schein-tor: rgb(' . pu_hex_rgb($v['farben']['glut']) . ' / .16);';
        $zeilen[] = '  --lapis-flor: rgb(' . pu_hex_rgb($v['farben']['lapis']) . ' / .13);';

        $aus .= 'html[data-variante="' . $k . '"] {' . "\n" . implode("\n", $zeilen) . "\n}\n";
    }
    return $aus;
}

/**
 * Welches Einstellungsfeld welches Token überschreibt.
 *
 * Eine Liste statt einzelner Zeilen: die Oberfläche, der Inline-Style und das
 * Zurücksetzen müssen dieselben Paare kennen. Stünden sie dreimal da, fehlte
 * beim nächsten Feld irgendwo eines.
 *
 * **Nur die Akzente. Die drei Schriftstufen standen hier und sind heraus.**
 * Der Grund kam aus dem Betrieb: Eine Schriftfarbe, die im Dunkeln gut
 * aussieht, ist ein helles Grau — und dieselbe Farbe steht nach dem Wechsel
 * auf Pergament oder Marmor hell auf hell. Der Text war dann weg, und zwar an
 * den Stellen, an denen man es am spätesten merkt: in Hinweisen und
 * Beschreibungen.
 *
 * Man hätte es abfangen können: Kontrast messen, im Zweifel verwerfen. Das
 * wäre eine Einstellung, die manchmal wirkt und manchmal nicht, ohne dass
 * jemand sähe, warum. **Schrift ist deshalb Standard.** Wer die Farbwelt
 * ändern will, ändert die Akzente oder wechselt die Palette — die sechs
 * Paletten bringen ihre Schriftstufen mit, und für die ist der Kontrast
 * gerechnet und geprüft.
 *
 * Früher gespeicherte Werte werden dadurch wirkungslos, nicht ungültig: Was
 * nicht in dieser Liste steht, kommt nicht ins Dokument.
 */
const PU_EIGENE_FARBEN = [
    'glut'  => 'glut',       // Akzent — Links, Hauptknopf, Fortschritt
    'gold'  => 'gold',       // Erfolg — Punkte, Ränge, Abzeichen
    'lapis' => 'lapis',      // Erklärung — Wissenskästen, Tutoren
];

/**
 * Die persönliche Feineinstellung als Inline-Style.
 *
 * Sie überschreibt gezielt drei Dinge der gewählten Variante: wie stark das
 * Hintergrundbild durchkommt, wie stark die Kartenbilder durchkommen, und die
 * drei Akzentfarben.
 *
 * **Warum als Faktor und nicht als fertiger Wert.** Das Hintergrundbild hat je
 * nach Ort verschiedene Stärken — Seite, Tor, Tor mit Animation. Ein fester
 * Wert am `<html>` würde alle drei plattmachen und das Tor genauso blass
 * lassen wie eine Kursseite. Ein Faktor multipliziert stattdessen, was an der
 * jeweiligen Stelle steht, und die Abstufung bleibt erhalten.
 *
 * @param array $einst die persönlichen Einstellungen
 * @return string  Inhalt für `style="…"`, oder '' wenn nichts abweicht
 */
function pu_feinstil(array $einst): string
{
    $teile = [];

    // 100 % ist die Vorgabe und braucht keine Zeile.
    $bild = (int)($einst['bild_anteil'] ?? 100);
    if ($bild !== 100) {
        $teile[] = '--bild-faktor:' . pu_anteil($bild);
    }

    $karten = (int)($einst['karten_anteil'] ?? 100);
    if ($karten !== 100) {
        $teile[] = '--karten-faktor:' . pu_anteil($karten);
    }

    foreach (PU_EIGENE_FARBEN as $feld => $token) {
        $wert = trim((string)($einst['farbe_' . $feld] ?? ''));
        // Die Wache steht schon in `PU_EINST_PERSON`; hier noch einmal, weil
        // dieser Wert ungeprüft in ein style-Attribut ginge. Zwei Wachen an
        // einer Stelle, an der eine Lücke fremdes CSS einschleusen liesse,
        // sind keine zu viel.
        if (preg_match('/^#[0-9a-fA-F]{6}$/', $wert)) {
            $teile[] = '--' . $token . ':' . strtolower($wert);
        }
    }

    return implode(';', $teile);
}

/** Prozent → Faktor mit zwei Nachkommastellen, ohne Gebietsschema-Überraschung. */
function pu_anteil(int $prozent): string
{
    $p = max(0, min(100, $prozent));
    return number_format($p / 100, 2, '.', '');
}

/** `#ff7a1c` → `255 122 28` — die Schreibweise, die `rgb(… / …)` braucht. */
function pu_hex_rgb(string $hex): string
{
    $hex = ltrim($hex, '#');
    return hexdec(substr($hex, 0, 2)) . ' '
         . hexdec(substr($hex, 2, 2)) . ' '
         . hexdec(substr($hex, 4, 2));
}

/**
 * Eine Farbe abdunkeln — für Fachbegriffe auf hellen Paletten.
 *
 * Das Gold jeder hellen Palette ist als **Auszeichnungsfarbe** gewählt: für
 * eine Zahl, einen Namen, einen Rahmen. Als Farbe für Fliesstext, der mitten
 * in einer Lektion steht, reicht es nicht — Pergaments `#9a6a00` auf `#f7f3ec`
 * kommt auf 4,3:1 und verfehlt damit sogar AA für gewöhnliche Schrift.
 *
 * Statt für jede Palette eine zweite Goldfarbe zu pflegen (und irgendwann eine
 * zu vergessen), wird sie abgeleitet. Der Faktor ist so gewählt, dass alle
 * hellen Paletten über 7:1 kommen, also AAA.
 */
function pu_hex_dunkler(string $hex, float $faktor): string
{
    $hex = ltrim($hex, '#');
    $aus = '#';
    for ($i = 0; $i < 3; $i++) {
        $wert = (int)round(hexdec(substr($hex, $i * 2, 2)) * $faktor);
        $aus .= str_pad(dechex(max(0, min(255, $wert))), 2, '0', STR_PAD_LEFT);
    }
    return $aus;
}

/**
 * Kontrast zweier Farben nach WCAG.
 *
 * Steht hier und nicht im Test, weil die Regel zur Palette gehört: wer eine
 * Variante ergänzt, soll sie im selben Atemzug prüfen können.
 */
function pu_kontrast(string $hex1, string $hex2): float
{
    $l = function (string $hex): float {
        $hex = ltrim($hex, '#');
        $k = [];
        for ($i = 0; $i < 3; $i++) {
            $v = hexdec(substr($hex, $i * 2, 2)) / 255;
            $k[] = $v <= 0.03928 ? $v / 12.92 : (($v + 0.055) / 1.055) ** 2.4;
        }
        return 0.2126 * $k[0] + 0.7152 * $k[1] + 0.0722 * $k[2];
    };
    $a = $l($hex1); $b = $l($hex2);
    return (max($a, $b) + 0.05) / (min($a, $b) + 0.05);
}
