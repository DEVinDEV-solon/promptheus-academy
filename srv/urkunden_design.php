<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Design der Abschluss-Urkunde: Vorlagen, Gestaltung, DIN A4.
 *
 * Der Name und der Prüfcode sind fest (srv/abschluss.php). **Die Gestaltung
 * gehört dem Teilnehmer**: welche Vorlage, welche Schrift für „Urkunde" und
 * für den eigenen Namen, wie gross, wie gesperrt, wie viel Luft. Sie lässt
 * sich jederzeit ändern und ist nicht Teil des Siegels.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * Die Vorlagen liegen im Wissensspeicher
 *
 *     secondbrain/60_Urkunden/
 *       01_schlicht/            <variante>/vorlage.json  [+ hintergrund.jpg]
 *       02_historisch-siegel/   <variante>/vorlage.json  [+ hintergrund.jpg]
 *       03_historisch-blumen/   <variante>/vorlage.json  [+ hintergrund.jpg]
 *       _unterschriften/        prometheus.png, athena.png, hermes.png
 *
 * Eine neue Variante ist ein neuer Ordner mit einer `vorlage.json` — kein
 * Code. Fehlt das Hintergrundbild, zeichnet diese Datei einen Schmuck aus
 * CSS und SVG, der zum `stil` der Gruppe passt.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * Unsere Grenzen, dann die des Teilnehmers
 *
 * Jede Vorlage legt den Textbereich in Millimetern fest (`inhalt_mm`) — er
 * liegt innerhalb des Motivs, damit Ranken und Siegel nie unter den Text
 * rutschen. Dazu Vorgaben und Grenzen: was der Teilnehmer an einem Regler
 * dreht, wird hier auf die Grenzen der Vorlage geklemmt. Die Oberfläche
 * zeigt die Grenzen nur an; gelten tun sie hier.
 *
 * Die Seite ist eigenständig: Hintergrund, Unterschriften und Schriften
 * stehen als data:-Adressen darin. Wer sie speichert, hat eine Urkunde, die
 * ohne PROMPTHEUS und ohne Netz aussieht wie gedruckt.
 */

require_once __DIR__ . '/../lib.php';

define('PU_URKUNDEN_VORLAGEN', ($p = getenv('PU_TEST_URKUNDEN_VORLAGEN')) !== false && $p !== ''
    ? $p
    : PU_BRAIN . '/60_Urkunden');

/** Die drei Gruppen. Reihenfolge = Anzeige. */
const PU_URKUNDEN_GRUPPEN = [
    '01_schlicht'          => ['name' => 'Schlicht & sachlich',   'stil' => 'schlicht'],
    '02_historisch-siegel' => ['name' => 'Historisch mit Siegel', 'stil' => 'siegel'],
    '03_historisch-blumen' => ['name' => 'Historisch mit Blumen', 'stil' => 'blumen'],
];

/**
 * Die fünf Schriften — alle unter der SIL Open Font License, also frei zum
 * Mitliefern und Einbetten (Lizenztexte daneben). Die Dateien kommen von
 * Fontsource und liegen je Zeichensatz getrennt unter assets/fonts/urkunde/:
 * `%s` ist `latin` bzw. `latin-ext`. Was da ist, wird in die Seite
 * eingebettet; fehlt etwas, greift der Stapel aus Systemschriften.
 */
const PU_URKUNDEN_SCHRIFTEN = [
    'cinzel'         => ['name' => 'Cinzel — römische Versalien',   'datei' => 'cinzel-%s-400-normal.woff2',
                         'stapel' => '"Cinzel", "Trajan Pro", "Palatino Linotype", Palatino, Georgia, serif'],
    'garamond'       => ['name' => 'EB Garamond — klassisch',       'datei' => 'eb-garamond-%s-400-normal.woff2',
                         'stapel' => '"EB Garamond", Garamond, "Palatino Linotype", Georgia, serif'],
    'cormorant'      => ['name' => 'Cormorant — fein, kursiv',      'datei' => 'cormorant-garamond-%s-500-italic.woff2',
                         'stapel' => '"Cormorant Garamond", "Book Antiqua", "Palatino Linotype", Georgia, serif',
                         'kursiv' => true],
    'fraktur'        => ['name' => 'Unifraktur — gebrochene Schrift', 'datei' => 'unifrakturmaguntia-%s-400-normal.woff2',
                         'stapel' => '"UnifrakturMaguntia", "Old English Text MT", "Palatino Linotype", serif'],
    'schreibschrift' => ['name' => 'Great Vibes — Schreibschrift',  'datei' => 'great-vibes-%s-400-normal.woff2',
                         'stapel' => '"Great Vibes", "Segoe Script", "Brush Script MT", cursive'],
];

/** Die drei Unterzeichner, in einer Linie unten auf jeder Urkunde. */
const PU_URKUNDEN_UNTERZEICHNER = [
    'prometheus' => ['name' => 'Prometheus', 'rolle' => 'Haupttutor'],
    'athena'     => ['name' => 'Athena',     'rolle' => 'Prüferin'],
    'hermes'     => ['name' => 'Hermes',     'rolle' => 'Bibliothekar'],
];

/** Vorgaben für alles, was eine vorlage.json nicht nennt. */
const PU_URKUNDEN_GRUND = [
    'name'         => '',
    'beschreibung' => '',
    'farben' => [
        'papier' => '#ffffff', 'schrift' => '#1a1714', 'titel' => '#1a1714',
        'name' => '#1a1714', 'akzent' => '#4e82b6', 'linie' => '#b9b0a4',
    ],
    'inhalt_mm'   => ['oben' => 30, 'unten' => 22, 'links' => 26, 'rechts' => 26],
    'text_groesse' => 11.5,
    'vorgabe' => [
        'titel_schrift' => 'cinzel', 'titel_schreibweise' => 'gross', 'titel_groesse' => 34,
        'titel_sperrung' => 0.12, 'name_schrift' => 'garamond', 'name_groesse' => 26,
        'abstand' => 1.0, 'zeilenabstand' => 1.45,
    ],
    'grenzen' => [
        'titel_groesse' => [24, 46], 'titel_sperrung' => [0.0, 0.4], 'name_groesse' => [18, 36],
        'abstand' => [0.7, 1.5], 'zeilenabstand' => [1.25, 1.85],
    ],
    'schriften_titel' => ['cinzel', 'garamond', 'cormorant', 'fraktur', 'schreibschrift'],
    'schriften_name'  => ['cinzel', 'garamond', 'cormorant', 'fraktur', 'schreibschrift'],
];

/**
 * Die äussersten Grenzen, die eine vorlage.json setzen darf. Die `grenzen`
 * in PU_URKUNDEN_GRUND sind nur die Vorgabe für Vorlagen ohne eigene — eine
 * Schreibschrift braucht mehr Grösse als Versalien, und die Vorlage soll das
 * sagen dürfen, ohne dass der Code geändert wird.
 */
const PU_URKUNDEN_ABSOLUT = [
    'titel_groesse' => [16, 80], 'titel_sperrung' => [0.0, 0.6], 'name_groesse' => [12, 60],
    'abstand' => [0.5, 2.0], 'zeilenabstand' => [1.0, 2.2],
];

const PU_URKUNDEN_BILD_MAX = 12 * 1024 * 1024;   // Hintergrund, eingebettet

// ── Vorlagen lesen ───────────────────────────────────────────────────────────

/** Alle Varianten, gruppiert. Ohne die Layoutdaten — für die Auswahl. */
function pu_urkunden_varianten(): array
{
    $aus = [];
    foreach (PU_URKUNDEN_GRUPPEN as $gruppe => $g) {
        $liste = [];
        foreach (glob(PU_URKUNDEN_VORLAGEN . '/' . $gruppe . '/*/vorlage.json') ?: [] as $datei) {
            $id = $gruppe . '/' . basename(dirname($datei));
            $v  = pu_urkunden_variante($id);
            if ($v === null) continue;
            $liste[] = ['id' => $id, 'name' => $v['name'], 'beschreibung' => $v['beschreibung'],
                        'hat_bild' => $v['bild'] !== null, 'vorgabe' => $v['vorgabe'],
                        'grenzen' => $v['grenzen'], 'schriften_titel' => $v['schriften_titel'],
                        'schriften_name' => $v['schriften_name']];
        }
        $aus[] = ['id' => $gruppe, 'name' => $g['name'], 'varianten' => $liste];
    }
    return $aus;
}

/** Die Schriften für die Auswahlliste. */
function pu_urkunden_schriften(): array
{
    $aus = [];
    foreach (PU_URKUNDEN_SCHRIFTEN as $id => $s) {
        $aus[] = ['id' => $id, 'name' => $s['name'], 'stapel' => $s['stapel'],
                  'kursiv' => !empty($s['kursiv'])];
    }
    return $aus;
}

/**
 * Eine Variante, vollständig und bereinigt — null, wenn es sie nicht gibt.
 *
 * Die Kennung ist `<gruppe>/<ordner>`. Sie kommt aus dem Browser; deshalb erst
 * das Muster, dann die bekannte Gruppe, dann der echte Pfad unterhalb des
 * Vorlagenordners. Ein `../` kommt an keiner der drei Stellen durch.
 */
function pu_urkunden_variante(string $id): ?array
{
    if (!preg_match('~^([0-9a-z_-]{1,40})/([0-9a-z_-]{1,40})$~', $id, $m)) return null;
    if (!isset(PU_URKUNDEN_GRUPPEN[$m[1]])) return null;

    $ordner = PU_URKUNDEN_VORLAGEN . '/' . $m[1] . '/' . $m[2];
    $wurzel = realpath(PU_URKUNDEN_VORLAGEN);
    $echt   = realpath($ordner);
    if ($wurzel === false || $echt === false || !str_starts_with($echt, $wurzel . DIRECTORY_SEPARATOR)) return null;
    if (!is_file($ordner . '/vorlage.json')) return null;

    $roh = json_decode((string)file_get_contents($ordner . '/vorlage.json'), true);
    if (!is_array($roh)) return null;

    $g = PU_URKUNDEN_GRUND;
    $v = [
        'id'           => $id,
        'gruppe'       => $m[1],
        'stil'         => PU_URKUNDEN_GRUPPEN[$m[1]]['stil'],
        'name'         => mb_substr(trim((string)($roh['name'] ?? $m[2])), 0, 60),
        'beschreibung' => mb_substr(trim((string)($roh['beschreibung'] ?? '')), 0, 240),
        'farben'       => $g['farben'],
        'inhalt_mm'    => $g['inhalt_mm'],
        'text_groesse' => pu_urkunden_zahl($roh['text_groesse'] ?? null, 8, 16, $g['text_groesse']),
        'grenzen'      => $g['grenzen'],
        'schriften_titel' => $g['schriften_titel'],
        'schriften_name'  => $g['schriften_name'],
        'bild'         => null,
    ];

    foreach ($g['farben'] as $k => $vorgabe) {
        $f = (string)($roh['farben'][$k] ?? '');
        if (preg_match('/^#[0-9a-fA-F]{6}$/', $f)) $v['farben'][$k] = strtolower($f);
    }
    // Der Textbereich: mindestens 12 mm Rand (Drucker schneiden sonst ab),
    // und zusammen nie so viel, dass für den Text nichts bleibt.
    foreach (['oben' => 150, 'unten' => 120, 'links' => 70, 'rechts' => 70] as $k => $max) {
        $v['inhalt_mm'][$k] = pu_urkunden_zahl($roh['inhalt_mm'][$k] ?? null, 12, $max, $g['inhalt_mm'][$k]);
    }
    foreach (PU_URKUNDEN_ABSOLUT as $k => [$lo, $hi]) {
        $gr = $roh['grenzen'][$k] ?? null;
        if (is_array($gr) && count($gr) === 2) {
            $a = pu_urkunden_zahl($gr[0], $lo, $hi, $lo);
            $b = pu_urkunden_zahl($gr[1], $lo, $hi, $hi);
            $v['grenzen'][$k] = [min($a, $b), max($a, $b)];
        }
    }
    foreach (['schriften_titel', 'schriften_name'] as $k) {
        if (is_array($roh[$k] ?? null)) {
            $l = array_values(array_filter($roh[$k], static fn($s) => is_string($s) && isset(PU_URKUNDEN_SCHRIFTEN[$s])));
            if ($l !== []) $v[$k] = $l;
        }
    }
    // Die Vorgabe der Vorlage läuft durch dieselbe Klemme wie ein Wunsch.
    $v['vorgabe'] = $g['vorgabe'];
    $v['vorgabe'] = pu_urkunden_design_klemmen($v, is_array($roh['vorgabe'] ?? null) ? $roh['vorgabe'] : []);

    foreach (['jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp'] as $end => $mime) {
        $bild = $ordner . '/hintergrund.' . $end;
        if (is_file($bild) && filesize($bild) <= PU_URKUNDEN_BILD_MAX) {
            $v['bild'] = ['pfad' => $bild, 'mime' => $mime];
            break;
        }
    }
    return $v;
}

function pu_urkunden_zahl($wert, float $lo, float $hi, float $vorgabe): float
{
    if (!is_numeric($wert)) return $vorgabe;
    return max($lo, min($hi, (float)$wert));
}

/**
 * Klemmt einen Gestaltungswunsch auf die Grenzen der Variante.
 * Was fehlt oder nicht passt, nimmt die Vorgabe der Variante.
 */
function pu_urkunden_design_klemmen(array $v, array $w): array
{
    $vor = $v['vorgabe'];
    $gr  = $v['grenzen'];
    $wahl = static fn(string $k, array $erlaubt) =>
        in_array($w[$k] ?? null, $erlaubt, true) ? $w[$k]
            : (in_array($vor[$k], $erlaubt, true) ? $vor[$k] : $erlaubt[0]);
    // Auch die Vorgabe wird geklemmt: eine vorlage.json, deren Vorgabe
    // ausserhalb ihrer eigenen Grenzen liegt, soll nicht durchrutschen.
    $zahl = static function (string $k, int $stellen) use ($w, $vor, $gr): float {
        [$lo, $hi] = $gr[$k];
        $basis = pu_urkunden_zahl($vor[$k], $lo, $hi, $lo);
        return round(pu_urkunden_zahl($w[$k] ?? null, $lo, $hi, $basis), $stellen);
    };

    return [
        'titel_schrift'      => $wahl('titel_schrift', $v['schriften_titel']),
        'titel_schreibweise' => $wahl('titel_schreibweise', ['gross', 'normal']),
        'titel_groesse'      => $zahl('titel_groesse', 1),
        'titel_sperrung'     => $zahl('titel_sperrung', 3),
        'name_schrift'       => $wahl('name_schrift', $v['schriften_name']),
        'name_groesse'       => $zahl('name_groesse', 1),
        'abstand'            => $zahl('abstand', 2),
        'zeilenabstand'      => $zahl('zeilenabstand', 2),
    ];
}

// ── Die Seite ────────────────────────────────────────────────────────────────

/**
 * Baut die Urkunde als eigenständige A4-Seite.
 *
 * @param array $daten name, datum, durchgang, punkte, pruefcode, konto_hash,
 *                     siegel, widerrufen, muster (bool), code_fuer_druck ('' = keine Meldung)
 */
function pu_urkunden_seite(array $v, array $design, array $daten): string
{
    $d = pu_urkunden_design_klemmen($v, $design);
    $f = $v['farben'];
    $i = $v['inhalt_mm'];

    // Alle erlaubten Schriften, nicht nur die gewählten: die Oberfläche
    // tauscht sie in der Vorschau live aus, ohne die Seite neu zu laden.
    $schriften = '';
    foreach (array_unique(array_merge(['garamond'], $v['schriften_titel'], $v['schriften_name'])) as $s) {
        $schriften .= pu_urkunden_font_face($s);
    }

    $bild = '';
    if ($v['bild'] !== null) {
        $bild = 'data:' . $v['bild']['mime'] . ';base64,' . base64_encode((string)file_get_contents($v['bild']['pfad']));
    }

    $unterschriften = '';
    foreach (PU_URKUNDEN_UNTERZEICHNER as $id => $u) {
        $png = PU_URKUNDEN_VORLAGEN . '/_unterschriften/' . $id . '.png';
        $zug = is_file($png) && filesize($png) <= 2 * 1024 * 1024
            ? '<img alt="" src="data:image/png;base64,' . base64_encode((string)file_get_contents($png)) . '">'
            : '';
        $unterschriften .= '<div class="unterschrift"><div class="zug">' . $zug . '</div>'
            . '<div class="u-name">' . pu_h($u['name']) . '</div>'
            . '<div class="u-rolle">' . pu_h($u['rolle']) . '</div></div>';
    }

    $titel = $d['titel_schreibweise'] === 'gross' ? 'URKUNDE' : 'Urkunde';
    $stufen = implode(' · ', array_map(static fn(array $s) => pu_h($s['name']), array_values(PU_STUFEN)));
    $muster = !empty($daten['muster']);

    $vars = [
        '--papier' => $f['papier'], '--schrift' => $f['schrift'], '--titel-farbe' => $f['titel'],
        '--name-farbe' => $f['name'], '--akzent' => $f['akzent'], '--linie' => $f['linie'],
        '--rand-oben' => $i['oben'] . 'mm', '--rand-unten' => $i['unten'] . 'mm',
        '--rand-links' => $i['links'] . 'mm', '--rand-rechts' => $i['rechts'] . 'mm',
        '--text-groesse' => $v['text_groesse'] . 'pt',
        '--titel-schrift' => PU_URKUNDEN_SCHRIFTEN[$d['titel_schrift']]['stapel'],
        '--titel-stil' => !empty(PU_URKUNDEN_SCHRIFTEN[$d['titel_schrift']]['kursiv']) ? 'italic' : 'normal',
        '--titel-groesse' => $d['titel_groesse'] . 'pt',
        '--titel-sperrung' => $d['titel_sperrung'] . 'em',
        '--name-schrift' => PU_URKUNDEN_SCHRIFTEN[$d['name_schrift']]['stapel'],
        '--name-stil' => !empty(PU_URKUNDEN_SCHRIFTEN[$d['name_schrift']]['kursiv']) ? 'italic' : 'normal',
        '--name-groesse' => $d['name_groesse'] . 'pt',
        '--abstand' => (string)$d['abstand'], '--zeilenabstand' => (string)$d['zeilenabstand'],
        '--grund-schrift' => PU_URKUNDEN_SCHRIFTEN['garamond']['stapel'],
    ];
    $root = '';
    foreach ($vars as $k => $wert) $root .= $k . ':' . $wert . ';';

    $ersatz = [
        '{{titel_seite}}'  => pu_h(($muster ? 'Muster — ' : '') . 'PROMPTHEUS Abschluss-Urkunde ' . ($daten['pruefcode'] ?? '')),
        '{{root}}'         => $root,
        '{{schriften}}'    => $schriften,
        '{{bild}}'         => $bild !== '' ? 'url("' . $bild . '")' : 'none',
        '{{stil}}'         => pu_h($v['stil']) . ($bild !== '' ? ' mit-bild' : ''),
        '{{schmuck}}'      => $bild !== '' ? '' : pu_urkunden_schmuck($v['stil']),
        '{{titel}}'        => $titel,
        '{{name}}'         => pu_h((string)($daten['name'] ?? '')),
        '{{stufen}}'       => $stufen,
        '{{datum}}'        => pu_h((string)($daten['datum'] ?? '')),
        '{{durchgang}}'    => (string)(int)($daten['durchgang'] ?? 1),
        '{{punkte}}'       => (string)(int)($daten['punkte'] ?? 0),
        '{{pruefcode}}'    => pu_h((string)($daten['pruefcode'] ?? '')),
        '{{konto_hash}}'   => pu_h((string)($daten['konto_hash'] ?? '')),
        '{{siegel}}'       => pu_h((string)($daten['siegel'] ?? '')),
        '{{unterschriften}}' => $unterschriften,
        '{{stempel}}'      => $muster ? 'Muster'
                              : (!empty($daten['widerrufen']) ? 'widerrufen'
                              : (!empty($daten['test']) ? 'Testurkunde' : '')),
        '{{druck_code}}'   => pu_h((string)($daten['code_fuer_druck'] ?? '')),
    ];
    $vorlage = (string)file_get_contents(PU_VORLAGEN . '/urkunde/abschluss.html');
    return strtr($vorlage, $ersatz);
}

/**
 * Die Zeichenbereiche der beiden Teildateien — wie Fontsource sie schneidet.
 * `latin` trägt Deutsch samt Umlauten und ß, `latin-ext` Namen wie Łukasz,
 * Şahin oder Dvořák. Der Browser lädt je Zeichen nur die Datei, die es hat.
 */
const PU_URKUNDEN_ZEICHEN = [
    'latin'     => 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,'
                 . 'U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD',
    'latin-ext' => 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,'
                 . 'U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,'
                 . 'U+2C60-2C7F,U+A720-A7FF',
];

/** @font-face für eine Schrift — je Zeichensatz eingebettet, wenn die Datei da ist. */
function pu_urkunden_font_face(string $id): string
{
    $s = PU_URKUNDEN_SCHRIFTEN[$id] ?? null;
    if ($s === null) return '';
    $familie = trim(explode(',', $s['stapel'])[0], ' "');
    $aus = '';
    foreach (PU_URKUNDEN_ZEICHEN as $satz => $bereich) {
        $datei = PU_ROOT . '/assets/fonts/urkunde/' . sprintf($s['datei'], $satz);
        if (!is_file($datei)) continue;       // dann trägt der Systemstapel
        $aus .= '@font-face{font-family:"' . $familie . '";font-style:' . (!empty($s['kursiv']) ? 'italic' : 'normal')
              . ';font-display:block;unicode-range:' . $bereich
              . ';src:url(data:font/woff2;base64,' . base64_encode((string)file_get_contents($datei))
              . ') format("woff2");}';
    }
    return $aus;
}

/**
 * Schmuck aus SVG, solange zur Variante kein Hintergrundbild liegt.
 * Liegt nur ausserhalb des Textbereichs — der Text bleibt immer lesbar.
 */
function pu_urkunden_schmuck(string $stil): string
{
    return match ($stil) {
        'siegel' => <<<'SVG'
<svg class="schmuck" viewBox="0 0 210 297" preserveAspectRatio="none" aria-hidden="true">
  <g fill="none" stroke="var(--akzent)" stroke-width=".55" opacity=".75">
    <rect x="9" y="9" width="192" height="279" rx="1.5"/>
    <rect x="12" y="12" width="186" height="273" rx="1" stroke-width=".3"/>
    <path d="M14 58 C 14 30, 30 16, 60 16 M 20 60 c 0 -18 10 -30 30 -30 c 10 0 14 8 8 13 c -5 4 -11 -1 -8 -5
             M 60 16 c 22 0 34 6 50 2 c 8 -2 12 4 6 7 c -6 3 -9 -3 -5 -5"/>
    <path d="M196 239 C 196 267, 180 281, 150 281 M 190 237 c 0 18 -10 30 -30 30 c -10 0 -14 -8 -8 -13 c 5 -4 11 1 8 5"/>
  </g>
  <g transform="translate(174 262)">
    <path d="M -6 10 L -14 30 M 4 10 L 10 31" stroke="#8b6b3a" stroke-width="1.1" fill="none"/>
    <circle r="13.5" fill="#9e1b1b"/>
    <circle r="13.5" fill="none" stroke="#6e0f0f" stroke-width="1.6" stroke-dasharray="2.2 1.4"/>
    <circle r="9" fill="none" stroke="#c7443d" stroke-width=".7"/>
    <text y="4.2" text-anchor="middle" font-family="Georgia, serif" font-size="12" fill="#f3d6c8" opacity=".85">P</text>
  </g>
</svg>
SVG,
        'blumen' => <<<'SVG'
<svg class="schmuck" viewBox="0 0 210 297" preserveAspectRatio="none" aria-hidden="true">
  <g fill="none" stroke="var(--akzent)" stroke-width=".55" opacity=".8">
    <rect x="10" y="10" width="190" height="277" rx="3"/>
    <path d="M 44 16 c 18 -4 30 6 46 2 c 8 -2 12 4 6 7 M 16 44 c -4 18 6 30 2 46 c -2 8 4 12 7 6"/>
    <path d="M 166 281 c -18 4 -30 -6 -46 -2 c -8 2 -12 -4 -6 -7 M 194 253 c 4 -18 -6 -30 -2 -46 c 2 -8 -4 -12 -7 -6"/>
  </g>
  <g id="rosen">
    <ellipse cx="22" cy="30" rx="7" ry="4" fill="#7f9a5e" transform="rotate(-35 22 30)"/>
    <ellipse cx="34" cy="16" rx="6" ry="3.4" fill="#6f8b52" transform="rotate(20 34 16)"/>
    <circle cx="22" cy="20" r="9" fill="#e7a3ad"/><circle cx="22" cy="20" r="6" fill="#d98592"/>
    <path d="M 18 20 a 4 4 0 1 1 8 0 a 2.5 2.5 0 1 1 -5 0" fill="none" stroke="#b9606e" stroke-width=".8"/>
    <circle cx="36" cy="27" r="5.5" fill="#efb9c1"/><circle cx="36" cy="27" r="3" fill="#e095a1"/>
  </g>
  <use href="#rosen" transform="rotate(180 105 148.5)"/>
</svg>
SVG,
        default => <<<'SVG'
<svg class="schmuck" viewBox="0 0 210 297" preserveAspectRatio="none" aria-hidden="true">
  <defs><linearGradient id="band" x1="0" x2="1"><stop offset="0" stop-color="var(--akzent)"/>
    <stop offset=".55" stop-color="var(--akzent)" stop-opacity=".35"/><stop offset="1" stop-color="var(--akzent)" stop-opacity="0"/></linearGradient></defs>
  <rect x="0" y="0" width="16" height="297" fill="url(#band)"/>
  <rect x="22" y="12" width="176" height="273" fill="none" stroke="var(--linie)" stroke-width=".35"/>
</svg>
SVG,
    };
}
