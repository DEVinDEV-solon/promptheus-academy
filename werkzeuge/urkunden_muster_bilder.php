<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Musterbilder der Urkunde für die Webseite (16:9).
 *
 * Legt je zwei echte Muster-Seiten des Urkunden-Generators nebeneinander auf
 * einen ruhigen Schmiede-Hintergrund und fotografiert das Ganze mit einem
 * Chrome/Edge ohne Fenster: 1920 × 1080, als JPG.
 *
 * Die Urkunden werden **nicht gemalt**, sondern sind dieselben Seiten, die die
 * Academy druckt — mit Stempel „Muster", ohne echten Namen und ohne echten
 * Prüfcode. Ein Bildgenerator verfälscht Schrift; hier stimmt jeder Buchstabe.
 * Eine gemalte Szene dahinter: vps/verwaltung/urkunden/SYSTEMPROMPT-webseite-muster-16-9.md
 *
 * Aufruf (Beispiel, aus der Wurzel der Academy):
 *
 *   php -d extension=gd werkzeuge/urkunden_muster_bilder.php --ziel=C:\bilder ^
 *       --paar=01_schlicht/klar,01_schlicht/schmiede ^
 *       --paar=02_historisch-siegel/pergament,03_historisch-blumen/rosen
 *
 * Optional: --name="Alex Muster" (Vorgabe), --stufe=0 (Abschluss) bzw. 1–6,
 * --browser=<Pfad zu chrome.exe/msedge.exe>. Ohne GD bleibt es bei PNG.
 */

if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }

$opt = ['ziel' => '', 'name' => 'Alex Muster', 'stufe' => '0', 'browser' => ''];
$paare = [];
foreach (array_slice($argv, 1) as $a) {
    if (!preg_match('/^--([a-z]+)=(.*)$/', $a, $m)) continue;
    if ($m[1] === 'paar') $paare[] = array_map('trim', explode(',', $m[2]));
    elseif (array_key_exists($m[1], $opt)) $opt[$m[1]] = $m[2];
}
if ($opt['ziel'] === '' || $paare === []) {
    fwrite(STDERR, "Aufruf: php werkzeuge/urkunden_muster_bilder.php --ziel=<ordner> --paar=<a>,<b> [--paar=…]\n");
    exit(2);
}

// Die Seiten brauchen keine echte Datenbank — eine leere, weggeworfene genügt.
putenv('PU_TEST_DB=' . sys_get_temp_dir() . '/pu_musterbild_' . getmypid() . '.db');
require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../srv/db.php';
require_once __DIR__ . '/../srv/abschluss.php';

/** Ein Chrome oder Edge, der ohne Fenster Bilder machen kann. */
function browser_finden(string $wunsch): ?string
{
    $liste = array_filter([
        $wunsch,
        getenv('ProgramFiles') . '\\Google\\Chrome\\Application\\chrome.exe',
        getenv('ProgramFiles(x86)') . '\\Google\\Chrome\\Application\\chrome.exe',
        getenv('ProgramFiles(x86)') . '\\Microsoft\\Edge\\Application\\msedge.exe',
        getenv('ProgramFiles') . '\\Microsoft\\Edge\\Application\\msedge.exe',
        '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
    ]);
    foreach ($liste as $p) if (is_file($p)) return $p;
    return null;
}

/** Eine Muster-Seite, für das Einbetten vorbereitet: ohne Tisch, auf volle Breite. */
function muster_seite(string $variante, string $name, int $stufe): string
{
    $v = pu_urkunden_variante($variante);
    if ($v === null) throw new RuntimeException("Diese Vorlage gibt es nicht: $variante");
    $stufe = isset(PU_STUFEN[$stufe]) ? $stufe : 0;
    $html = pu_urkunden_seite($v, [], [
        'stufe' => $stufe, 'name' => $name, 'datum' => date('d.m.Y'), 'durchgang' => 1,
        'punkte' => $stufe ? 118 : 684,
        'pruefcode' => $stufe ? 'PU-' . $stufe . '-XXXXXXXX' : 'PU-A-XXXXXXXX',
        'konto_hash' => 'KH-XXXXXXXXXXXXXXXX', 'siegel' => 'XXXX-XXXX-XXXX-XXXX-XXXX', 'muster' => true,
    ]);
    // Nach dem eigenen Skript der Seite: Blatt genau auf Rahmenbreite, ohne Rand.
    $nach = '<style>body{background:transparent!important;padding:0!important}'
          . '.blatt{box-shadow:none!important}</style><script>(function(){'
          . 'var b=document.querySelector(".blatt"),h=document.querySelector(".buehne");'
          . 'var s=document.documentElement.clientWidth/b.offsetWidth;'
          . 'b.style.transform="scale("+s+")";h.style.height=(b.offsetHeight*s)+"px";})();</script>';
    return str_replace('</body>', $nach . '</body>', $html);
}

/** Die Bühne 16:9 mit zwei Urkunden. */
function buehne(array $seiten): string
{
    $rahmen = '';
    foreach ($seiten as $i => $html) {
        $dreh = $i === 0 ? -3.2 : 2.6;
        $rahmen .= '<div class="u u' . $i . '" style="transform:rotate(' . $dreh . 'deg)">'
                 . '<iframe scrolling="no" srcdoc="' . htmlspecialchars($html, ENT_QUOTES) . '"></iframe></div>';
    }
    // Farben der Marke „Schmiede" als feste Werte: das hier wird ein Bild,
    // kein Stylesheet der Seite.
    return '<!doctype html><html><head><meta charset="utf-8"><style>'
         . 'html,body{margin:0;width:1920px;height:1080px;overflow:hidden}'
         . 'body{background:radial-gradient(ellipse 60% 70% at 50% 42%,#3a2a1c 0%,#1d1612 55%,#0f0c0a 100%)}'
         . 'body:before{content:"";position:absolute;inset:0;background:'
         . 'radial-gradient(ellipse 30% 40% at 12% 88%,rgba(255,122,26,.20),transparent 70%),'
         . 'radial-gradient(ellipse 35% 45% at 90% 10%,rgba(232,163,61,.14),transparent 70%)}'
         . '.u{position:absolute;top:95px;width:630px;height:891px;'
         . 'box-shadow:0 30px 60px rgba(0,0,0,.55),0 8px 18px rgba(0,0,0,.45)}'
         . '.u0{left:280px}.u1{left:1010px}'
         . 'iframe{border:0;width:630px;height:891px;display:block;background:transparent}'
         . '</style></head><body>' . $rahmen . '</body></html>';
}

$browser = browser_finden($opt['browser']);
if ($browser === null) { fwrite(STDERR, "Kein Chrome/Edge gefunden — --browser=<Pfad> angeben.\n"); exit(1); }

$ziel = rtrim($opt['ziel'], '/\\');
if (!is_dir($ziel) && !mkdir($ziel, 0755, true)) { fwrite(STDERR, "Ziel nicht anlegbar: $ziel\n"); exit(1); }
$profil = sys_get_temp_dir() . '/pu_musterbild_profil_' . getmypid();

foreach ($paare as $nr => $paar) {
    if (count($paar) !== 2) { fwrite(STDERR, "--paar braucht genau zwei Vorlagen\n"); exit(2); }
    $seiten = array_map(fn($v) => muster_seite($v, $opt['name'], (int)$opt['stufe']), $paar);
    $html = $ziel . '/urkunde-muster-' . ($nr + 1) . '.html';
    $png  = $ziel . '/urkunde-muster-' . ($nr + 1) . '.png';
    file_put_contents($html, buehne($seiten));

    $url = 'file:///' . str_replace('\\', '/', realpath($html));
    $befehl = escapeshellarg($browser) . ' --headless=new --disable-gpu --no-first-run --hide-scrollbars'
            . ' --user-data-dir=' . escapeshellarg($profil) . ' --window-size=1920,1080'
            . ' --virtual-time-budget=4000 --screenshot=' . escapeshellarg($png) . ' ' . escapeshellarg($url);
    @unlink($png);
    exec($befehl . ' 2>&1', $aus, $code);
    // Chrome kehrt unter Windows manchmal zurück, bevor die Datei da ist.
    for ($i = 0; $i < 40 && !is_file($png); $i++) usleep(250000);
    if (!is_file($png)) { fwrite(STDERR, "Kein Bild entstanden für Paar " . ($nr + 1) . "\n"); exit(1); }
    @unlink($html);

    if (function_exists('imagecreatefrompng')) {
        $bild = imagecreatefrompng($png);
        $jpg  = substr($png, 0, -4) . '.jpg';
        imagejpeg($bild, $jpg, 82);
        imagedestroy($bild);
        @unlink($png);
        echo "ok $jpg\n";
    } else {
        echo "ok $png (ohne GD bleibt es PNG)\n";
    }
}
@unlink(sys_get_temp_dir() . '/pu_musterbild_' . getmypid() . '.db');
