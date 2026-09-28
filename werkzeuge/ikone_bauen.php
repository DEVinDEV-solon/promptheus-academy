<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — baut die Programm-Ikone für die Desktop-Verknüpfung.
 *
 *     php -d extension=gd werkzeuge/ikone_bauen.php
 *
 * Ergebnis: assets/img/promptheus.ico — die Flamme aus assets/img/promptheus.svg
 * auf dunklem Schmiede-Grund (grund-2, Rand rand-hell aus Brand/brand-props.json),
 * in 256, 64, 48, 32, 24 und 16 Pixeln. Windows nimmt für Desktop, Startmenü
 * und Taskleiste jeweils die passende Grösse.
 *
 * Warum hier gerechnet und nicht aus dem SVG gewandelt: Auf einem Entwickler-PC
 * gibt es keinen SVG-Wandler, auf den man sich verlassen kann. Der Umriss der
 * Flamme ist klein (zwei Bézierkurven, ein Bogen, zwei Kurven) — er steht unten
 * als Punktefolge und wird mit vierfacher Auflösung gefüllt und verkleinert.
 * Ändert sich das Logo, gehört der Pfad hier nachgezogen.
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}
if (!function_exists('imagecreatetruecolor')) {
    fwrite(STDERR, "Die PHP-Erweiterung gd fehlt (-d extension=gd).\n");
    exit(2);
}

const IKONE_GROESSEN = [256, 64, 48, 32, 24, 16];
const IKONE_GRUND    = [0x1c, 0x18, 0x15];   // grund-2 der Schmiede
const IKONE_RAND     = [0x50, 0x43, 0x38];   // rand-hell
// Verlauf des SVG, von unten (0) nach oben (1).
const IKONE_VERLAUF  = [[0.0, [0xff, 0x4d, 0x1c]], [0.55, [0xff, 0x9d, 0x2e]], [1.0, [0xff, 0xe0, 0x8a]]];

/** Kubische Bézierkurve als Punkte (ohne Startpunkt). */
function bezier(array $p0, array $p1, array $p2, array $p3, int $n = 24): array
{
    $aus = [];
    for ($i = 1; $i <= $n; $i++) {
        $t = $i / $n; $u = 1 - $t;
        $aus[] = [
            $u ** 3 * $p0[0] + 3 * $u ** 2 * $t * $p1[0] + 3 * $u * $t ** 2 * $p2[0] + $t ** 3 * $p3[0],
            $u ** 3 * $p0[1] + 3 * $u ** 2 * $t * $p1[1] + 3 * $u * $t ** 2 * $p2[1] + $t ** 3 * $p3[1],
        ];
    }
    return $aus;
}

/**
 * Der Umriss aus promptheus.svg (viewBox 0 0 48 64):
 * M24 2 C24 2 8 20 8 36 a16 16 0 0 0 32 0 C40 26 30 22 30 12
 * c0 0 -6 6 -6 14 c0 0 -6 -6 -6 -16 c0 0 6 -8 6 -8 z
 */
function flamme(): array
{
    $pkte = [[24, 2]];
    $pkte = array_merge($pkte, bezier([24, 2], [24, 2], [8, 20], [8, 36]));
    // Halbkreis unten: Mitte (24,36), Radius 16, von links (8,36) nach rechts (40,36) über unten.
    for ($i = 1; $i <= 32; $i++) {
        $w = M_PI - $i / 32 * M_PI;              // 180° → 0°
        $pkte[] = [24 + 16 * cos($w), 36 + 16 * sin($w)];
    }
    $pkte = array_merge($pkte, bezier([40, 36], [40, 26], [30, 22], [30, 12]));
    $pkte = array_merge($pkte, bezier([30, 12], [30, 12], [24, 18], [24, 26]));
    $pkte = array_merge($pkte, bezier([24, 26], [24, 26], [18, 20], [18, 10]));
    $pkte = array_merge($pkte, bezier([18, 10], [18, 10], [24, 2], [24, 2]));
    return $pkte;
}

function farbe_im_verlauf(float $t): array
{
    $v = IKONE_VERLAUF;
    for ($i = 1; $i < count($v); $i++) {
        if ($t <= $v[$i][0]) {
            $a = $v[$i - 1]; $b = $v[$i];
            $f = ($t - $a[0]) / ($b[0] - $a[0]);
            return array_map(static fn($x, $y) => (int)round($x + ($y - $x) * $f), $a[1], $b[1]);
        }
    }
    return $v[count($v) - 1][1];
}

/** Eine Grösse als Bild (GD, mit Alphakanal). */
function ikone_bild(int $n): GdImage
{
    $s = 4;                                   // Überabtastung
    $N = $n * $s;
    $bild = imagecreatetruecolor($N, $N);
    imagesavealpha($bild, true);
    imagealphablending($bild, false);
    imagefill($bild, 0, 0, imagecolorallocatealpha($bild, 0, 0, 0, 127));
    imagealphablending($bild, true);

    // Grund: abgerundetes Quadrat mit Rand (ab 32 px; darunter nur Fläche).
    $r = (int)round($N * 0.2);
    $rand = $n >= 32 ? max($s, (int)round($N / 64)) : 0;
    $abgerundet = static function ($bild, int $x1, int $y1, int $x2, int $y2, int $r, int $farbe): void {
        imagefilledrectangle($bild, $x1 + $r, $y1, $x2 - $r, $y2, $farbe);
        imagefilledrectangle($bild, $x1, $y1 + $r, $x2, $y2 - $r, $farbe);
        foreach ([[$x1 + $r, $y1 + $r], [$x2 - $r, $y1 + $r], [$x1 + $r, $y2 - $r], [$x2 - $r, $y2 - $r]] as [$cx, $cy]) {
            imagefilledellipse($bild, $cx, $cy, 2 * $r, 2 * $r, $farbe);
        }
    };
    if ($rand > 0) {
        $abgerundet($bild, 0, 0, $N - 1, $N - 1, $r, imagecolorallocate($bild, ...IKONE_RAND));
    }
    $abgerundet($bild, $rand, $rand, $N - 1 - $rand, $N - 1 - $rand, max(1, $r - $rand),
                imagecolorallocate($bild, ...IKONE_GRUND));

    // Flamme: Maske zeichnen, dann Zeile für Zeile mit dem Verlauf füllen.
    $h = $N * ($n <= 24 ? 0.86 : 0.78);
    $k = $h / 50;                             // Umriss reicht von y=2 bis y=52
    $w = 40 * $k;                             // …und von x=8 bis x=40
    $x0 = ($N - $w) / 2 - 8 * $k;
    $y0 = ($N - $h) / 2 - 2 * $k;
    $maske = imagecreatetruecolor($N, $N);
    imagefill($maske, 0, 0, 0);
    $weiss = imagecolorallocate($maske, 255, 255, 255);
    $flach = [];
    foreach (flamme() as [$x, $y]) { $flach[] = (int)round($x0 + $x * $k); $flach[] = (int)round($y0 + $y * $k); }
    imagefilledpolygon($maske, $flach, $weiss);
    $oben = $y0 + 2 * $k; $unten = $y0 + 52 * $k;
    for ($y = 0; $y < $N; $y++) {
        $t = max(0.0, min(1.0, ($unten - $y) / ($unten - $oben)));
        $f = imagecolorallocate($bild, ...farbe_im_verlauf($t));
        for ($x = 0; $x < $N; $x++) {
            if ((imagecolorat($maske, $x, $y) & 0xFF) > 0) imagesetpixel($bild, $x, $y, $f);
        }
    }
    imagedestroy($maske);

    $klein = imagecreatetruecolor($n, $n);
    imagesavealpha($klein, true);
    imagealphablending($klein, false);
    imagefill($klein, 0, 0, imagecolorallocatealpha($klein, 0, 0, 0, 127));
    imagecopyresampled($klein, $bild, 0, 0, 0, 0, $n, $n, $N, $N);
    imagedestroy($bild);
    return $klein;
}

function ikone_png(GdImage $bild): string
{
    ob_start();
    imagepng($bild, null, 9);
    return (string)ob_get_clean();
}

/**
 * Klassisches ICO-Bitmap (32 Bit BGRA, von unten nach oben, dazu die leere
 * UND-Maske). So erwarten es ältere Programme für die kleinen Grössen; PNG
 * im ICO versteht nicht jeder Leser (.NET etwa scheitert daran).
 */
function ikone_dib(GdImage $bild): string
{
    $n = imagesx($bild);
    $kopf = pack('VVVvvVVVVVV', 40, $n, 2 * $n, 1, 32, 0, $n * $n * 4, 0, 0, 0, 0);
    $pixel = '';
    for ($y = $n - 1; $y >= 0; $y--) {
        for ($x = 0; $x < $n; $x++) {
            $c = imagecolorat($bild, $x, $y);
            $a = (int)round((127 - (($c >> 24) & 0x7F)) * 255 / 127);
            $pixel .= chr($c & 0xFF) . chr(($c >> 8) & 0xFF) . chr(($c >> 16) & 0xFF) . chr($a);
        }
    }
    $zeile = (int)(ceil($n / 32) * 4);        // UND-Maske: 1 Bit je Pixel, auf 4 Byte aufgefüllt
    return $kopf . $pixel . str_repeat("\0", $zeile * $n);
}

// ICO: Kopf, ein Eintrag je Grösse, dann die Bilddaten — 256 als PNG (so
// macht es Windows selbst), die kleineren als Bitmap.
$bilder = [];
foreach (IKONE_GROESSEN as $n) {
    $b = ikone_bild($n);
    $bilder[$n] = $n >= 256 ? ikone_png($b) : ikone_dib($b);
    if ($n >= 256 && in_array('--png', $argv, true)) {
        // Zum Ansehen: die grösste Stufe zusätzlich als PNG.
        file_put_contents(dirname(__DIR__) . '/assets/img/promptheus-ikone-256.png', $bilder[$n]);
        echo "dazu: assets/img/promptheus-ikone-256.png\n";
    }
    imagedestroy($b);
}
$kopf = pack('vvv', 0, 1, count($bilder));
$daten = '';
$versatz = 6 + 16 * count($bilder);
foreach ($bilder as $n => $roh) {
    $kopf .= pack('CCCCvvVV', $n >= 256 ? 0 : $n, $n >= 256 ? 0 : $n, 0, 0, 1, 32, strlen($roh), $versatz + strlen($daten));
    $daten .= $roh;
}
$ziel = dirname(__DIR__) . '/assets/img/promptheus.ico';
file_put_contents($ziel, $kopf . $daten);
echo 'geschrieben: assets/img/promptheus.ico (' . strlen($kopf . $daten) . " Byte, " . count($bilder) . " Grössen)\n";
