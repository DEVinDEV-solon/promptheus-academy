<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — die Rechtstexte als Seite.
 *
 * Impressum, Datenschutzerklärung, AGB und Widerrufsbelehrung stehen als
 * Markdown in `recht/`. Diese Datei rendert sie. **Damit gibt es sie genau
 * einmal** — nicht einmal als Datei für den Anwalt und einmal als HTML für die
 * Seite, die dann irgendwann auseinanderlaufen. Bei einem Impressum ist das
 * keine Ordnungsliebe: die veraltete Fassung ist die abmahnfähige.
 *
 * Erreichbar ohne Anmeldung, und das muss so sein. Ein Impressum hinter einem
 * Login ist keines.
 *
 * Der Ordner `recht/` selbst ist in `router.php` gesperrt. Nicht weil die Texte
 * geheim wären — sie sind das Gegenteil davon —, sondern damit es nur einen Weg
 * zu ihnen gibt: diesen hier, mit Entwurfshinweis und Datum. Eine roh
 * ausgelieferte .md-Datei trüge beides nicht.
 */

require_once __DIR__ . '/lib.php';
require_once __DIR__ . '/srv/brain.php';        // pu_md()
require_once __DIR__ . '/srv/einstellungen.php';
require_once __DIR__ . '/srv/varianten.php';

/**
 * Was ausgeliefert wird — eine feste Liste, kein Pfad aus der Adresszeile.
 *
 * `?t=` wird als Schlüssel gelesen, nie als Dateiname. Damit ist der Weg zu
 * `../data/promptheus.db` nicht zugestellt, sondern gar nicht vorhanden.
 *
 * `README.md` und `AVV.md` fehlen mit Absicht: das eine ist eine Notiz an uns
 * selbst, das andere eine Vorlage, die man einer Schule schickt. Kein Aushang.
 */
const PU_RECHT = [
    'impressum'   => ['datei' => 'IMPRESSUM.md',   'titel' => 'Impressum'],
    'datenschutz' => ['datei' => 'DATENSCHUTZ.md', 'titel' => 'Datenschutz'],
    'agb'         => ['datei' => 'AGB.md',         'titel' => 'AGB'],
    'widerruf'    => ['datei' => 'WIDERRUF.md',    'titel' => 'Widerrufsbelehrung'],
];

$schluessel = strtolower(trim((string)($_GET['t'] ?? 'impressum')));
if (!isset(PU_RECHT[$schluessel])) $schluessel = 'impressum';

$doku = PU_RECHT[$schluessel];
$roh  = @file_get_contents(PU_ROOT . '/recht/' . $doku['datei']);

/**
 * Frontmatter und Entwurfs-Zitat abschneiden.
 *
 * Beides gehört zur Datei, nicht auf die Seite: die YAML-Kopfzeilen sind für den
 * Vault, und das `> Entwurf, ungeprüft`-Zitat verweist auf `README.md`, das es
 * hier nicht gibt. Der Hinweis geht dabei nicht verloren — er steht unten als
 * eigener Kasten, und zwar auffälliger als vorher.
 */
function pu_recht_rumpf(string $text): string
{
    $text = preg_replace('/\A---\R.*?\R---\R/s', '', $text) ?? $text;
    $text = ltrim($text);
    // Ein zusammenhängender Block aus Zitatzeilen am Anfang.
    $text = preg_replace('/\A(?:>[^\n]*\n)+\s*/', '', $text) ?? $text;

    return ltrim($text);
}

/**
 * Umbrochene Zeilen zu Absätzen zusammenfalten.
 *
 * `pu_md()` macht aus **jeder** Zeile einen eigenen Absatz. Für den Lehrstoff
 * geht das auf, dort steht ein Gedanke auf einer Zeile. Ein Rechtstext ist auf
 * 80 Zeichen umbrochen, und ungefaltet zerfiele jeder Satz in drei Absätze —
 * ein Impressum, das aussieht wie ein Gedicht.
 *
 * Gefaltet wird nur gewöhnliche Prosa. Überschriften, Listen, Tabellen,
 * Zitate, Trennlinien und Codeblöcke bleiben Zeile für Zeile, wie sie sind.
 *
 * **Ein Rückstrich am Zeilenende erzwingt den Umbruch** — das ist die
 * Markdown-Konvention, und Anschriften brauchen sie: „Straße" und „PLZ Ort"
 * gehören untereinander, nicht in einen Fließtext.
 */
function pu_recht_falten(string $text): string
{
    $aus     = [];
    $absatz  = '';
    $inCode  = false;

    $abgeben = function () use (&$absatz, &$aus): void {
        if ($absatz !== '') { $aus[] = $absatz; $absatz = ''; }
    };

    foreach (preg_split('/\R/', $text) ?: [] as $zeile) {
        if (str_starts_with(ltrim($zeile), '```')) {
            $abgeben();
            $aus[]  = $zeile;
            $inCode = !$inCode;
            continue;
        }
        if ($inCode) { $aus[] = $zeile; continue; }

        $t = trim($zeile);

        // Alles, was pu_md() an der Zeile selbst erkennt, bleibt eine Zeile.
        $sonder = $t === ''
            || preg_match('/^(#{1,6}\s|>|\||[-*+]\s|\d+\.\s|---$|\*\*\*$|___$)/', $t) === 1;

        if ($sonder) { $abgeben(); $aus[] = $zeile; continue; }

        $hart = str_ends_with($t, '\\');
        if ($hart) $t = rtrim(substr($t, 0, -1));

        $absatz = $absatz === '' ? $t : $absatz . ' ' . $t;
        if ($hart) $absatz .= '⟪BR⟫';
    }
    $abgeben();

    // Markdown-Fluchtzeichen. pu_md_inline() kennt sie nicht und würde aus
    // „(\*)" im Widerrufsformular eine Kursivschrift machen.
    $text = implode("\n", $aus);
    return str_replace(['\\*', '\\_'], ['⟪AST⟫', '⟪UNT⟫'], $text);
}

/**
 * Verweise zwischen den Rechtstexten begehbar machen.
 *
 * `pu_md()` verlinkt nur http(s) — mit gutem Grund, es rendert sonst Lehrstoff
 * aus fremden Quellen. Die Verweise von den AGB auf die Widerrufsbelehrung
 * blieben dadurch als roher Klammerausdruck stehen. Also hier, nach dem
 * Rendern, und **nur gegen die feste Liste oben**: was nicht darin steht,
 * bleibt Text.
 */
function pu_recht_verweise(string $html): string
{
    $zuSchluessel = [];
    foreach (PU_RECHT as $s => $d) $zuSchluessel[$d['datei']] = $s;

    return preg_replace_callback(
        '/\[([^\]]+)\]\(([A-Za-z_]+\.md)\)/',
        function (array $m) use ($zuSchluessel): string {
            $ziel = $zuSchluessel[$m[2]] ?? null;
            if ($ziel === null) return $m[1];      // Verweis fällt weg, Text bleibt
            return '<a href="recht.php?t=' . $ziel . '">' . $m[1] . '</a>';
        },
        $html
    ) ?? $html;
}

/**
 * Die Marken wieder auflösen, die pu_recht_falten() gesetzt hat.
 *
 * Zuletzt, nach dem Rendern: `⟪BR⟫` wird zum einzigen Stück HTML, das aus dem
 * Text selbst kommt — und es kann nur von uns stammen, weil die Zeichen in
 * keiner Quelldatei vorkommen.
 */
function pu_recht_marken(string $html): string
{
    return str_replace(['⟪BR⟫', '⟪AST⟫', '⟪UNT⟫'], ['<br>', '*', '_'], $html);
}

$inhalt = $roh === false
    ? '<p>Dieser Text liegt gerade nicht vor.</p>'
    : pu_recht_marken(pu_recht_verweise(pu_md(pu_recht_falten(pu_recht_rumpf($roh)))));

// Dieselbe Vorgabe wie am Tor: vor der Anmeldung gibt es keine persönlichen
// Einstellungen, also erscheint die Seite in der Werksdarstellung.
$thema = PU_EINST_PERSON['thema']['vorgabe'];
?><!doctype html>
<html lang="de" data-thema="<?= pu_h($thema) ?>" data-variante="<?= pu_h(PU_VARIANTE_VORGABE) ?>">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="referrer" content="no-referrer">
<meta name="robots" content="noindex">
<title><?= pu_h($doku['titel']) ?> — PROMPTHEUS ACADEMY</title>
<link rel="icon" href="<?= pu_v('assets/img/promptheus.svg') ?>" type="image/svg+xml">
<link rel="stylesheet" href="<?= pu_v('assets/css/promptheus.css') ?>">
<link rel="stylesheet" href="<?= pu_v('assets/css/marke.css') ?>">
<link rel="stylesheet" href="<?= pu_v('assets/css/landing.css') ?>">
<script>
  (function () {
    var w = document.documentElement;
    if (w.dataset.thema === 'auto') {
      var dunkel = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      w.dataset.themaEffektiv = dunkel ? 'dunkel' : 'hell';
    } else {
      w.dataset.themaEffektiv = w.dataset.thema;
    }
  })();
</script>
</head>
<body class="landing recht-seite">

<header class="lp-bar">
  <a class="lp-wort" href="index.php">
    <span class="lp-flamme" aria-hidden="true">🔥</span><b>PROMPTHEUS</b><span>Academy</span>
  </a>
  <!-- Der Rückweg steht LINKS von den Rechtstexten: er gehört nicht zur Reihe
       der vier, sondern führt aus ihr heraus. Dunkel, weil er über dem hellen
       Teil des Hintergrundbildes liegen kann. -->
  <nav class="lp-bar-nav" aria-label="Rechtliches">
    <a class="knopf recht-heim" href="index.php">Zur Startseite</a>
    <?php foreach (PU_RECHT as $s => $d): ?>
      <a class="lp-nav-fern" href="recht.php?t=<?= pu_h($s) ?>"<?= $s === $schluessel ? ' aria-current="page"' : '' ?>><?= pu_h($d['titel']) ?></a>
    <?php endforeach; ?>
  </nav>
</header>

<main class="recht-blatt">
  <?= $inhalt ?>

  <!-- Der Entwurfshinweis steht am Ende und nicht am Anfang: wer die Seite
       aufruft, sucht eine Anschrift oder einen Absatz, nicht unsere Selbst-
       auskunft. Verschwiegen wird er deshalb nicht. -->
  <aside class="recht-warnung">
    <p><b>Entwurf.</b> Dieser Text ist noch nicht anwaltlich geprüft und enthält
      Stellen, die noch zu füllen sind. Er beschreibt, was gelten soll, und ist
      noch keine verbindliche Erklärung.</p>
  </aside>
</main>

<footer class="lp-fuss">
  <p class="lp-fuss-links">© <?= date('Y') ?> PROMPTHEUS Academy</p>
  <nav class="lp-fuss-rechts" aria-label="Rechtliches">
    <a href="recht.php?t=impressum">Impressum</a>
    <a href="recht.php?t=datenschutz">Datenschutz</a>
    <a href="recht.php?t=agb">AGB</a>
  </nav>
</footer>

</body>
</html>
