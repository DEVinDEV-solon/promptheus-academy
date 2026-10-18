<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — die Handschrift: die Guideline eines Kontos aus dem 7. Kurs.
 *
 * Der 7. Kurs lehrt die acht Felder einer Brand-Guideline. Hier wird daraus
 * etwas, das bleibt: **ein Dokument je Konto**, auf diesem Rechner, und
 * dasselbe Dokument an jeder Stelle, die für dieses Konto etwas herstellt —
 * der Werkstatt-Coder (Hephaistos) und der Assistent im Cinema Studio.
 *
 * Zwei Arten, dieselben acht Felder:
 *
 *   marke        Brand-Guideline — für Erwachsene, Vereine, Gewerbe
 *   persoenlich  persönliche Guideline — für Schüler; weniger Pflichtfelder
 *
 * Die Vorgabe kommt aus der Rolle (Schüler → persönlich), umstellen darf jeder.
 *
 * **Wann:** erst mit dem 7. Kurs zu 100 % (oder als Betreiber). Eingerichtet
 * wird hinter den Aufgaben, nicht als Aufgabe — sonst stünde jeder, der den
 * Kurs schon abgeschlossen hat, wieder vor einer gesperrten Werkstatt.
 *
 * **Wo:** `data/handschrift/<konto>/` — `handschrift.json` (die Felder) und
 * daraus erzeugt `BRAND.md`, `systemprompt.txt`, `stil.css`. `data/` geht nie
 * ins Repo. Später spiegelt der persönliche Secondbrain (Phase D) dieselben
 * Dateien nach `000_Kontext/stil/`.
 *
 * **Übergabe:** Beim Öffnen der Werkstatt legt die Academy den Block des
 * startenden Kontos nach `data/werkstatt/handschrift.json`. Die Werkstatt
 * baut ihn beim Start in die Persona ein, das Cinema Studio liest ihn bei
 * jeder Anfrage. Die Werkstatt selbst kennt keine Konten der Academy — das
 * Ticket sagt ihr, wer sie geöffnet hat, und genau dessen Handschrift liegt dort.
 *
 * **Datenschutz:** Jede freie Eingabe läuft durch die PII-Sperre (srv/pii.php);
 * Fundstellen werden zu „xxx“, bevor sie gespeichert werden. Der Block geht
 * mit jeder Anfrage von Coder und Cinema-Assistent an das Sprachmodell
 * (OpenRouter) — deshalb steht das im Einrichtungsfenster, und deshalb gehört
 * hier nichts Persönliches hinein.
 */

require_once PU_ROOT . '/srv/pii.php';

const PU_HANDSCHRIFT_ARTEN   = ['marke', 'persoenlich'];
const PU_HANDSCHRIFT_ANREDEN = ['du', 'Sie', 'ihr'];
const PU_HANDSCHRIFT_VERSION = 1;

/** Längen und Mengen. Zwei Seiten sind die Obergrenze (Lektion 2) — das hier hält sie ein. */
const PU_HANDSCHRIFT_GRENZEN = [
    'text'            => 200,
    'wort'            => 40,
    'persoenlichkeit' => 4,
    'register'        => 3,
    'paare'           => 3,
    'verbote'         => 20,
    'farben'          => 3,
    'formen'          => 5,
    'fest'            => 6,
    'frei'            => 6,
];

/**
 * Was eine Guideline mindestens braucht, damit sie übergeben wird.
 * Weniger ist ein Entwurf: gespeichert, aber nicht im Einsatz.
 */
const PU_HANDSCHRIFT_MINDEST = [
    'marke'       => ['ausweis' => ['was', 'fuer_wen', 'haltung'], 'persoenlichkeit' => 3,
                      'paare' => 1, 'verbote' => 1, 'farben' => 3, 'formen' => 2, 'fest' => 1],
    'persoenlich' => ['ausweis' => ['was', 'haltung'], 'persoenlichkeit' => 2,
                      'paare' => 0, 'verbote' => 1, 'farben' => 3, 'formen' => 1, 'fest' => 0],
];

/** Der Ordner aller Handschriften. Tests legen ihn über PU_TEST_HANDSCHRIFT um. */
function pu_handschrift_wurzel(): string
{
    $t = getenv('PU_TEST_HANDSCHRIFT');
    return is_string($t) && $t !== '' ? $t : PU_DATA . '/handschrift';
}

function pu_handschrift_ordner(int $lernender): string
{
    if ($lernender <= 0) throw new InvalidArgumentException('Ungültiges Konto.');
    return pu_handschrift_wurzel() . '/' . $lernender;
}

/** Die Übergabedatei für Werkstatt und Cinema Studio — neben dem Ticket der Werkstatt. */
function pu_handschrift_uebergabe_pfad(): string
{
    require_once PU_ROOT . '/srv/werkstatt.php';
    return dirname(pu_werkstatt_ticket_pfad()) . '/handschrift.json';
}

/** Schüler bekommen die persönliche Guideline, alle anderen die Brand-Guideline. */
function pu_handschrift_vorgabe_art(int $lernender): string
{
    require_once PU_ROOT . '/srv/profil.php';
    require_once PU_ROOT . '/srv/rechte.php';
    $p = pu_profil($lernender);
    return $p !== null && pu_ebene($p) !== 'schueler' ? 'marke' : 'persoenlich';
}

/**
 * Darf dieses Konto seine Handschrift einrichten?
 * Dieselbe Rechnung wie für Werkstatt und Coder (pu_coder_stand).
 *
 * @return array{frei:bool, grund:string, prozent:int}
 */
function pu_handschrift_frei(int $lernender): array
{
    require_once PU_ROOT . '/srv/coder.php';
    require_once PU_ROOT . '/srv/abo.php';

    if (pu_token_frei($lernender)) return ['frei' => true, 'grund' => 'betreiber', 'prozent' => 100];
    $w = pu_kurs7_weg($lernender);
    return ['frei' => (bool)$w['frei'], 'grund' => (string)$w['grund'], 'prozent' => (int)$w['prozent']];
}

// ─────────────────────────────────────────────────────────── Form und Prüfung

/** Eine leere Guideline der gegebenen Art. */
function pu_handschrift_leer(string $art): array
{
    return [
        'version'         => PU_HANDSCHRIFT_VERSION,
        'art'             => in_array($art, PU_HANDSCHRIFT_ARTEN, true) ? $art : 'persoenlich',
        'ausweis'         => ['was' => '', 'fuer_wen' => '', 'satz' => '', 'bild' => '', 'haltung' => ''],
        'persoenlichkeit' => [],
        'register'        => [],
        'sprache'         => ['ansprache' => 'du', 'paare' => [], 'verbote' => []],
        'gestalt'         => ['farben' => [], 'schrift' => ''],
        'formen'          => [],
        'trennlinie'      => ['fest' => [], 'frei' => []],
        'absage'          => '',
        'geaendert'       => '',
    ];
}

/**
 * Bringt eine Eingabe in Form: unbekannte Schlüssel fallen weg, Texte werden
 * gekürzt und durch die PII-Sperre geschickt, Listen gedeckelt, leere Zeilen
 * verworfen. Wirft nur bei einer Farbe, die keine ist — alles andere wird
 * still auf das Erlaubte zurückgeschnitten.
 *
 * @return array{daten:array, treffer:list<array{feld:string, titel:string, text:string}>}
 */
function pu_handschrift_saeubern(array $roh): array
{
    $g = PU_HANDSCHRIFT_GRENZEN;
    $treffer = [];

    $text = static function ($wert, string $feld, int $max = 0) use (&$treffer, $g): string {
        $s = is_scalar($wert) ? (string)$wert : '';
        if (!mb_check_encoding($s, 'UTF-8')) $s = mb_convert_encoding($s, 'UTF-8', 'UTF-8');
        // Steuerzeichen und Zeilenumbrüche raus: Jede Angabe ist eine Zeile.
        $s = trim(preg_replace('/[\x00-\x1f\x7f]+/u', ' ', $s) ?? '');
        $s = preg_replace('/\s{2,}/u', ' ', $s) ?? $s;
        $s = mb_substr($s, 0, $max > 0 ? $max : $g['text']);
        if ($s === '') return '';
        $p = pu_pii_pruefen($s);
        foreach ($p['treffer'] as $t) $treffer[] = ['feld' => $feld, 'titel' => $t['titel'], 'text' => $t['text']];
        return $p['text'];
    };
    $liste = static fn($w): array => is_array($w) ? array_values($w) : [];

    $art = in_array($roh['art'] ?? '', PU_HANDSCHRIFT_ARTEN, true) ? (string)$roh['art'] : 'persoenlich';
    $d = pu_handschrift_leer($art);

    $aus = is_array($roh['ausweis'] ?? null) ? $roh['ausweis'] : [];
    foreach (array_keys($d['ausweis']) as $k) $d['ausweis'][$k] = $text($aus[$k] ?? '', 'ausweis.' . $k);

    foreach (array_slice($liste($roh['persoenlichkeit'] ?? []), 0, $g['persoenlichkeit']) as $i => $z) {
        $z = is_array($z) ? $z : [];
        $e = $text($z['eigenschaft'] ?? '', "persoenlichkeit.$i", $g['wort']);
        $n = $text($z['aber_nicht'] ?? '', "persoenlichkeit.$i", $g['wort']);
        if ($e !== '') $d['persoenlichkeit'][] = ['eigenschaft' => $e, 'aber_nicht' => $n];
    }

    foreach (array_slice($liste($roh['register'] ?? []), 0, $g['register']) as $i => $z) {
        $z = is_array($z) ? $z : [];
        $gr = $text($z['gruppe'] ?? '', "register.$i", $g['wort'] * 2);
        $ae = $text($z['aenderung'] ?? '', "register.$i");
        if ($gr !== '') $d['register'][] = ['gruppe' => $gr, 'aenderung' => $ae];
    }

    $spr = is_array($roh['sprache'] ?? null) ? $roh['sprache'] : [];
    $d['sprache']['ansprache'] = in_array($spr['ansprache'] ?? '', PU_HANDSCHRIFT_ANREDEN, true)
        ? (string)$spr['ansprache'] : 'du';
    foreach (array_slice($liste($spr['paare'] ?? []), 0, $g['paare']) as $i => $z) {
        $z = is_array($z) ? $z : [];
        $gut = $text($z['gut'] ?? '', "sprache.paare.$i");
        $sch = $text($z['schlecht'] ?? '', "sprache.paare.$i");
        if ($gut !== '' && $sch !== '') $d['sprache']['paare'][] = ['gut' => $gut, 'schlecht' => $sch];
    }
    $verbote = [];
    foreach ($liste($spr['verbote'] ?? []) as $i => $w) {
        $w = $text($w, "sprache.verbote.$i", $g['wort']);
        if ($w !== '' && !in_array(mb_strtolower($w), array_map('mb_strtolower', $verbote), true)) $verbote[] = $w;
        if (count($verbote) >= $g['verbote']) break;
    }
    $d['sprache']['verbote'] = $verbote;

    $ges = is_array($roh['gestalt'] ?? null) ? $roh['gestalt'] : [];
    $namen = [];
    foreach (array_slice($liste($ges['farben'] ?? []), 0, $g['farben']) as $i => $z) {
        $z = is_array($z) ? $z : [];
        $hex = strtolower(trim((string)($z['hex'] ?? '')));
        if ($hex === '') continue;
        if (!preg_match('/^#[0-9a-f]{6}$/', $hex)) {
            throw new DomainException('Farbe ' . ($i + 1) . ' ist kein Farbwert wie #b74e0c.');
        }
        $name = pu_handschrift_tokenname((string)($z['name'] ?? ''), $i);
        while (in_array($name, $namen, true)) $name .= '-' . ($i + 1);
        $namen[] = $name;
        $d['gestalt']['farben'][] = ['name' => $name, 'hex' => $hex,
                                     'bedeutung' => $text($z['bedeutung'] ?? '', "gestalt.farben.$i")];
    }
    $d['gestalt']['schrift'] = $text($ges['schrift'] ?? '', 'gestalt.schrift', 80);

    foreach (array_slice($liste($roh['formen'] ?? []), 0, $g['formen']) as $i => $z) {
        $z = is_array($z) ? $z : [];
        $an = $text($z['anlass'] ?? '', "formen.$i", 80);
        $fo = $text($z['form'] ?? '', "formen.$i");
        if ($an !== '' && $fo !== '') $d['formen'][] = ['anlass' => $an, 'form' => $fo];
    }

    $tl = is_array($roh['trennlinie'] ?? null) ? $roh['trennlinie'] : [];
    foreach (['fest', 'frei'] as $seite) {
        foreach (array_slice($liste($tl[$seite] ?? []), 0, $g[$seite]) as $i => $w) {
            $w = $text($w, "trennlinie.$seite.$i", 100);
            if ($w !== '') $d['trennlinie'][$seite][] = $w;
        }
    }

    $d['absage'] = $text($roh['absage'] ?? '', 'absage');

    return ['daten' => $d, 'treffer' => $treffer];
}

/**
 * Ein CSS-Name aus der Eingabe: klein, Buchstaben, Ziffern, Bindestrich.
 * Umlaute werden umschrieben, damit „erklärt“ zu `--erklaert` wird (Lektion 6).
 */
function pu_handschrift_tokenname(string $name, int $nr): string
{
    $n = mb_strtolower(trim($name));
    $n = strtr($n, ['ä' => 'ae', 'ö' => 'oe', 'ü' => 'ue', 'ß' => 'ss']);
    $n = preg_replace('/[^a-z0-9]+/', '-', $n) ?? '';
    $n = trim($n, '-');
    if ($n === '' || !preg_match('/^[a-z]/', $n)) $n = 'farbe-' . ($nr + 1);
    return substr($n, 0, 24);
}

/**
 * Was noch fehlt, damit die Guideline in den Einsatz geht.
 * @return list<string> lesbare Punkte; leer heisst vollständig
 */
function pu_handschrift_fehlt(array $d): array
{
    $m = PU_HANDSCHRIFT_MINDEST[$d['art']] ?? PU_HANDSCHRIFT_MINDEST['persoenlich'];
    $namen = ['was' => 'Ausweis: Was', 'fuer_wen' => 'Ausweis: Für wen', 'haltung' => 'Ausweis: Haltung'];
    $aus = [];
    foreach ($m['ausweis'] as $k) if (($d['ausweis'][$k] ?? '') === '') $aus[] = $namen[$k];

    $zaehl = [
        'persoenlichkeit' => [count($d['persoenlichkeit']), 'Persönlichkeit: Eigenschaften'],
        'paare'           => [count($d['sprache']['paare']), 'Sprache: Gut/Schlecht-Paare'],
        'verbote'         => [count($d['sprache']['verbote']), 'Sprache: Verbotsliste'],
        'formen'          => [count($d['formen']), 'Ausgabeformen'],
        'fest'            => [count($d['trennlinie']['fest']), 'Trennlinie: fest'],
    ];
    foreach ($zaehl as $k => [$ist, $name]) {
        if ($ist < $m[$k]) $aus[] = $name . ' (' . $ist . ' von ' . $m[$k] . ')';
    }
    $farben = array_filter($d['gestalt']['farben'], static fn($f) => $f['bedeutung'] !== '');
    if (count($farben) < $m['farben']) {
        $aus[] = 'Gestalt: ' . $m['farben'] . ' Farben mit Bedeutung (' . count($farben) . ')';
    }
    return $aus;
}

// ─────────────────────────────────────────────────────────── Lesen und Schreiben

/** Die gespeicherte Guideline, oder null. */
function pu_handschrift(int $lernender): ?array
{
    $pfad = pu_handschrift_ordner($lernender) . '/handschrift.json';
    if (!is_file($pfad)) return null;
    $j = json_decode((string)file_get_contents($pfad), true);
    if (!is_array($j)) return null;
    // Durch dieselbe Säuberung wie beim Speichern: Eine Datei, die jemand von
    // Hand geändert hat, kommt nicht ungeprüft in einen Systemprompt.
    try { $d = pu_handschrift_saeubern($j)['daten']; } catch (DomainException) { return null; }
    $d['geaendert'] = is_string($j['geaendert'] ?? null) ? $j['geaendert'] : '';
    return $d;
}

/** Atomar schreiben: erst daneben, dann umbenennen. */
function pu_handschrift_datei(string $pfad, string $inhalt): void
{
    $dir = dirname($pfad);
    if (!is_dir($dir) && !@mkdir($dir, 0700, true) && !is_dir($dir)) {
        throw new RuntimeException('Ordner nicht anlegbar: ' . basename($dir));
    }
    $tmp = $pfad . '.' . bin2hex(random_bytes(4)) . '.tmp';
    if (file_put_contents($tmp, $inhalt, LOCK_EX) === false || !rename($tmp, $pfad)) {
        @unlink($tmp);
        throw new RuntimeException('Nicht schreibbar: ' . basename($pfad));
    }
    @chmod($pfad, 0600);
}

/**
 * Speichert die Guideline und legt die erzeugten Dateien daneben.
 *
 * @return array{daten:array, treffer:list<array>, fehlt:list<string>}
 */
function pu_handschrift_speichern(int $lernender, array $roh): array
{
    $s = pu_handschrift_saeubern($roh);
    $d = $s['daten'];
    $d['geaendert'] = gmdate('c');

    $o = pu_handschrift_ordner($lernender);
    pu_handschrift_datei($o . '/handschrift.json',
        json_encode($d, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    pu_handschrift_datei($o . '/BRAND.md', pu_handschrift_brand_md($d));
    pu_handschrift_datei($o . '/systemprompt.txt', pu_handschrift_systemprompt($d));
    pu_handschrift_datei($o . '/stil.css', pu_handschrift_css($d));

    // Wer die Werkstatt gerade offen hat, bekommt den neuen Stand gleich —
    // das Cinema Studio liest ihn bei der nächsten Anfrage, Hephaistos beim
    // nächsten Start der Werkstatt.
    if (pu_handschrift_uebergabe_konto() === $lernender) pu_handschrift_uebergeben($lernender);

    return ['daten' => $d, 'treffer' => $s['treffer'], 'fehlt' => pu_handschrift_fehlt($d)];
}

/** Löscht die Guideline eines Kontos samt erzeugter Dateien. */
function pu_handschrift_loeschen(int $lernender): void
{
    $o = pu_handschrift_ordner($lernender);
    foreach (['handschrift.json', 'BRAND.md', 'systemprompt.txt', 'stil.css'] as $f) @unlink($o . '/' . $f);
    @rmdir($o);
    if (pu_handschrift_uebergabe_konto() === $lernender) pu_handschrift_uebergeben($lernender);
}

// ─────────────────────────────────────────────────────────── Übergabe

/** Für welches Konto liegt die Übergabe gerade? null: keine. */
function pu_handschrift_uebergabe_konto(): ?int
{
    $pfad = pu_handschrift_uebergabe_pfad();
    if (!is_file($pfad)) return null;
    $j = json_decode((string)@file_get_contents($pfad, false, null, 0, 65536), true);
    return is_array($j) && is_int($j['lernender'] ?? null) ? $j['lernender'] : null;
}

/**
 * Legt die Handschrift dieses Kontos für Werkstatt und Cinema Studio bereit.
 *
 * Auch ohne (vollständige) Guideline wird geschrieben — mit leerem Block.
 * So gehört die Datei immer dem Konto, das die Werkstatt zuletzt geöffnet
 * hat, und nie bleibt die Handschrift eines anderen liegen.
 */
function pu_handschrift_uebergeben(int $lernender): void
{
    $d = pu_handschrift($lernender);
    $voll = $d !== null && pu_handschrift_fehlt($d) === [];
    $aus = [
        'version'   => PU_HANDSCHRIFT_VERSION,
        'lernender' => $lernender,
        'art'       => $d['art'] ?? '',
        'stand'     => $voll ? (string)$d['geaendert'] : '',
        'block'     => $voll ? pu_handschrift_agentenblock($d) : '',
        'kurz'      => $voll ? pu_handschrift_kurz($d) : '',
        'farben'    => $voll ? $d['gestalt']['farben'] : [],
    ];
    pu_handschrift_datei(pu_handschrift_uebergabe_pfad(),
        json_encode($aus, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
}

// ─────────────────────────────────────────────────────────── Erzeugte Texte

/** Die Persönlichkeit als eine Zeile: „genau, aber nicht pedantisch · …“. */
function pu_handschrift_eigenschaften(array $d): string
{
    return implode(' · ', array_map(
        static fn($p) => $p['eigenschaft'] . ($p['aber_nicht'] !== '' ? ', aber nicht ' . $p['aber_nicht'] : ''),
        $d['persoenlichkeit']));
}

/**
 * Der Systemprompt-Baustein — die sechs Zeilen aus Lektion 4: Rolle, Haltung,
 * Ansprache, Antwortform, Verbotsliste, Regel für Absagen. Hexwerte gehören
 * nicht hinein; ein Textmodell braucht sie beim Antworten nicht.
 */
function pu_handschrift_systemprompt(array $d): string
{
    $a = $d['ausweis'];
    $rolle = $d['art'] === 'marke'
        ? 'Du schreibst für ' . ($a['was'] ?: 'diese Marke') . ($a['fuer_wen'] !== '' ? ' — für ' . $a['fuer_wen'] : '') . '.'
        : 'Du schreibst in meiner Handschrift: ' . ($a['was'] ?: 'meine Projekte') . ($a['fuer_wen'] !== '' ? ' — für ' . $a['fuer_wen'] : '') . '.';
    $haltung = 'Haltung: ' . ($a['haltung'] ?: '—') . '.'
        . ($d['persoenlichkeit'] !== [] ? ' Persönlichkeit: ' . pu_handschrift_eigenschaften($d) . '.' : '');
    $anrede = ['du' => 'Sprich die Leser immer mit „du“ an.', 'Sie' => 'Sprich die Leser immer mit „Sie“ an.',
               'ihr' => 'Sprich die Leser immer mit „ihr“ an.'][$d['sprache']['ansprache']];
    $form = $d['formen'] === [] ? 'Antwortform: kurz und klar.'
        : 'Antwortform: ' . implode('; ', array_map(static fn($f) => $f['anlass'] . ' → ' . $f['form'], $d['formen'])) . '.';
    $verbot = $d['sprache']['verbote'] === [] ? 'Verbotsliste: keine Superlative.'
        : 'Diese Wörter kommen nie vor: ' . implode(', ', $d['sprache']['verbote']) . '.';
    $absage = 'Absagen: ' . ($d['absage'] !== '' ? rtrim($d['absage'], '.') . '.' : 'Jede Absage nennt einen Weg.');

    return implode("\n", [$rolle, $haltung, $anrede, $form, $verbot, $absage]) . "\n";
}

/** Gut/Schlecht-Paare als Liste. */
function pu_handschrift_paare_md(array $d): string
{
    return implode("\n", array_map(
        static fn($p) => "- Gut: „{$p['gut']}“ — Schlecht: „{$p['schlecht']}“", $d['sprache']['paare']));
}

/** Die Farben als Liste: `--weiter` #b74e0c — hier geht es weiter. */
function pu_handschrift_farben_md(array $d): string
{
    return implode("\n", array_map(
        static fn($f) => "- `--{$f['name']}` {$f['hex']} — {$f['bedeutung']}", $d['gestalt']['farben']));
}

/**
 * Der Block für Agenten, die etwas **herstellen** (Werkstatt-Coder,
 * Cinema-Assistent): der Baustein plus das, was ein Bild- oder Seitenbauer
 * braucht und ein Chatbot nicht — Farben mit Bedeutung, Paare, Trennlinie.
 */
function pu_handschrift_agentenblock(array $d): string
{
    $wer = $d['art'] === 'marke' ? 'Brand-Guideline' : 'persönliche Guideline';
    $t = ["## Handschrift des Kontos ($wer aus dem 7. Kurs)", '',
          'Alles, was du für dieses Konto herstellst — Texte, Seiten, Bilder, Videos, Prompts —, folgt diesen Regeln. '
          . 'Wie du selbst mit dem Nutzer sprichst, bleibt bei deiner eigenen Rolle.', '',
          '### Baustein', '', trim(pu_handschrift_systemprompt($d))];
    if ($d['ausweis']['satz'] !== '') array_push($t, '', 'Der Satz: „' . $d['ausweis']['satz'] . '“');
    if ($d['ausweis']['bild'] !== '') array_push($t, 'Das Bild: ' . $d['ausweis']['bild']);
    if ($d['gestalt']['farben'] !== []) {
        array_push($t, '', '### Farben (jede trägt eine Bedeutung; Farbe trägt nie allein eine Aussage)', '',
                   pu_handschrift_farben_md($d));
    }
    if ($d['gestalt']['schrift'] !== '') array_push($t, '', 'Schrift: ' . $d['gestalt']['schrift']);
    if ($d['sprache']['paare'] !== []) array_push($t, '', '### Gut und schlecht', '', pu_handschrift_paare_md($d));
    if ($d['register'] !== []) {
        array_push($t, '', '### Register (die Haltung ändert sich nie)', '',
                   implode("\n", array_map(static fn($r) => "- {$r['gruppe']}: {$r['aenderung']}", $d['register'])));
    }
    if ($d['trennlinie']['fest'] !== [] || $d['trennlinie']['frei'] !== []) {
        array_push($t, '', '### Trennlinie', '',
                   'Fest (immer gleich): ' . (implode('; ', $d['trennlinie']['fest']) ?: '—'),
                   'Frei (nach Anlass): ' . (implode('; ', $d['trennlinie']['frei']) ?: '—'));
    }
    // `{{` würde der Harness als Vorlagenvariable lesen und den Start abbrechen.
    return str_replace(['{{', '}}'], ['{ {', '} }'], implode("\n", $t)) . "\n";
}

/** Die Kurzfassung für das Feld „Brand-Guideline“ im Cinema Studio (≤ 2000 Zeichen). */
function pu_handschrift_kurz(array $d): string
{
    $t = [];
    if ($d['ausweis']['was'] !== '')     $t[] = 'Was: ' . $d['ausweis']['was'];
    if ($d['ausweis']['haltung'] !== '') $t[] = 'Haltung: ' . $d['ausweis']['haltung'];
    if ($d['persoenlichkeit'] !== [])    $t[] = 'Ton: ' . pu_handschrift_eigenschaften($d);
    if ($d['gestalt']['farben'] !== []) {
        $t[] = 'Farben: ' . implode(', ', array_map(static fn($f) => $f['hex'] . ' = ' . $f['bedeutung'], $d['gestalt']['farben']));
    }
    if ($d['gestalt']['schrift'] !== '') $t[] = 'Schrift: ' . $d['gestalt']['schrift'];
    if ($d['sprache']['verbote'] !== []) $t[] = 'No-Gos: ' . implode(', ', $d['sprache']['verbote']);
    return mb_substr(implode("\n", $t), 0, 2000);
}

/** Das Dokument — die acht Felder in der Reihenfolge des Kurses. */
function pu_handschrift_brand_md(array $d): string
{
    $a = $d['art'] === 'marke';
    $x = $d['ausweis'];
    // Tabellenzellen dürfen keinen senkrechten Strich tragen.
    $zelle = static fn(string $s): string => str_replace('|', '\|', $s);
    $leer = static fn(string $s): string => $s !== '' ? $zelle($s) : '—';
    $t = [
        '# ' . ($a ? 'Brand-Guideline' : 'Meine Guideline') . ($x['was'] !== '' ? ' — ' . $x['was'] : ''), '',
        '> Erstellt im 7. Kurs der PROMPTHEUS Academy. Was hier steht, gehört dir allein.', '',
        '## 1 · Ausweis', '',
        '| Feld | Antwort |', '|---|---|',
        '| Was | ' . $leer($x['was']) . ' |',
        '| Für wen | ' . $leer($x['fuer_wen']) . ' |',
        '| Der Satz | ' . $leer($x['satz']) . ' |',
        '| Das Bild | ' . $leer($x['bild']) . ' |',
        '| Die Haltung | ' . $leer($x['haltung']) . ' |', '',
        '## 2 · Persönlichkeit', '',
        $d['persoenlichkeit'] === [] ? '—' : implode("\n", array_map(
            static fn($p) => '- ' . $p['eigenschaft'] . ($p['aber_nicht'] !== '' ? ', aber nicht ' . $p['aber_nicht'] : ''),
            $d['persoenlichkeit'])), '',
        '## 3 · Register', '',
        $d['register'] === [] ? '—' : implode("\n", array_map(
            static fn($r) => "- **{$r['gruppe']}:** {$r['aenderung']}", $d['register'])), '',
        '## 4 · Sprache', '',
        'Ansprache: **' . $d['sprache']['ansprache'] . '**', '',
        $d['sprache']['paare'] === [] ? '' : pu_handschrift_paare_md($d) . "\n",
        'Verbotsliste: ' . ($d['sprache']['verbote'] === [] ? '—' : implode(', ', $d['sprache']['verbote'])), '',
        '## 5 · Gestalt', '',
        $d['gestalt']['farben'] === [] ? '—' : pu_handschrift_farben_md($d),
        $d['gestalt']['schrift'] !== '' ? "\nSchrift: " . $d['gestalt']['schrift'] : '', '',
        '## 6 · Ausgabeformen', '',
        $d['formen'] === [] ? '—' : implode("\n", array_map(
            static fn($f) => "- **{$f['anlass']}:** {$f['form']}", $d['formen'])), '',
        '## 7 · Einsatz', '',
        '```text', trim(pu_handschrift_systemprompt($d)), '```', '',
        '## 8 · Trennlinie', '',
        '| Fest | Frei |', '|---|---|',
    ];
    $n = max(count($d['trennlinie']['fest']), count($d['trennlinie']['frei']), 1);
    for ($i = 0; $i < $n; $i++) {
        $t[] = '| ' . $zelle($d['trennlinie']['fest'][$i] ?? '') . ' | ' . $zelle($d['trennlinie']['frei'][$i] ?? '') . ' |';
    }
    $md = implode("\n", $t);
    return preg_replace("/\n{3,}/", "\n\n", $md) . "\n";
}

/** Die Farben als Tokens (Lektion 6): einmal oben, danach nur noch Namen. */
function pu_handschrift_css(array $d): string
{
    $z = [':root {'];
    foreach ($d['gestalt']['farben'] as $f) {
        $kommentar = str_replace(['*/', '/*'], '', $f['bedeutung']);
        $z[] = sprintf('  --%s: %s;%s', $f['name'], $f['hex'], $kommentar !== '' ? '   /* ' . $kommentar . ' */' : '');
    }
    $z[] = '}';
    $erste = $d['gestalt']['farben'][0]['name'] ?? null;
    if ($erste !== null) {
        $z[] = '';
        $z[] = '.knopf { background: var(--' . $erste . '); color: #fff; }';
    }
    return implode("\n", $z) . "\n";
}

/** Die eigene Seite — die Probe aufs Dokument (Lektion 6). Alles escaped. */
function pu_handschrift_html(array $d): string
{
    $h = static fn(string $s): string => htmlspecialchars($s, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $x = $d['ausweis'];
    $titel = $x['was'] !== '' ? $x['was'] : 'Meine Seite';
    $farben = $d['gestalt']['farben'];
    $f = static fn(int $i): string => isset($farben[$i]) ? 'var(--' . $farben[$i]['name'] . ')' : 'currentColor';
    $eigen = implode('', array_map(static fn($p) => '<li>' . $h($p['eigenschaft']) . '</li>', $d['persoenlichkeit']));
    return "<!doctype html>\n<html lang=\"de\">\n<head>\n<meta charset=\"utf-8\">\n"
        . "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n"
        . '<title>' . $h($titel) . "</title>\n<link rel=\"stylesheet\" href=\"stil.css\">\n"
        . "<style>\n  body { font-family: system-ui, sans-serif; max-width: 42rem; margin: 3rem auto; padding: 0 1rem; line-height: 1.55; }\n"
        . '  h1 { color: ' . $f(0) . "; }\n  .erklaert { border-left: 4px solid " . $f(2) . "; padding-left: 1rem; }\n"
        . "  .knopf { display: inline-block; padding: .7rem 1.2rem; border-radius: .4rem; text-decoration: none; }\n</style>\n</head>\n<body>\n"
        . '<h1>' . $h($x['satz'] !== '' ? $x['satz'] : $titel) . "</h1>\n"
        . ($x['fuer_wen'] !== '' ? '<p>' . $h($titel) . ' — für ' . $h($x['fuer_wen']) . ".</p>\n" : '')
        . ($x['haltung'] !== '' ? '<p class="erklaert">' . $h($x['haltung']) . "</p>\n" : '')
        . ($eigen !== '' ? "<ul>$eigen</ul>\n" : '')
        . "<p><a class=\"knopf\" href=\"#\">Weiter</a></p>\n</body>\n</html>\n";
}

/** Die zehn Fragen vor dem Abgeben (Lektion 6). */
function pu_handschrift_pruefliste(): string
{
    return "# Prüfliste — zehn Fragen vor dem Abgeben\n\n"
        . "1. Könnte dieser Text unter einem fremden Namen stehen, ohne aufzufallen?\n"
        . "2. Steht irgendwo ein Superlativ oder ein Wort von deiner Verbotsliste?\n"
        . "3. Stimmt die Ansprache — durchgehend?\n"
        . "4. Ist jeder Fachbegriff beim ersten Auftreten erklärt?\n"
        . "5. Nennt jede Absage einen Weg?\n"
        . "6. Ist jede Zahl belegt?\n"
        . "7. Trägt eine Farbe hier wirklich ihre Bedeutung?\n"
        . "8. Trägt Farbe irgendwo **allein** eine Aussage?\n"
        . "9. Hat die Antwort die Form, die du für diesen Anlass festgelegt hast?\n"
        . "10. Bei mehreren Agenten: haben alle **dieselbe** Fassung deines Dokuments?\n";
}

/** Was für das Paket gilt — und was nicht (Lektion 6). */
function pu_handschrift_lizenz(): string
{
    return "# Lizenz\n\n"
        . "**Vorlage und Bausteine** dieses Pakets (Aufbau von `BRAND.md`, `index.html`, `stil.css`, "
        . "`PRUEFLISTE.md`) stehen unter der PolyForm Shield 1.0.0 — derselben Lizenz wie die "
        . "PROMPTHEUS Academy: https://polyformproject.org/licenses/shield/1.0.0/\n\n"
        . "Du darfst sie benutzen, ändern und weitergeben, auch geschäftlich. Nicht erlaubt ist, "
        . "daraus ein Produkt zu machen, das der Academy Konkurrenz macht.\n\n"
        . "**Was du hineingeschrieben hast, gehört dir allein.** Deine Marke, deine Sätze, deine "
        . "Farben. Darauf hat die Academy keinen Anspruch, und sie erteilt dafür auch keine Erlaubnis.\n";
}

/**
 * Das Paket als ZIP (Lektion 6): sechs lesbare Dateien.
 * @return string der Inhalt der ZIP-Datei
 */
function pu_handschrift_paket(array $d): string
{
    if (!class_exists('ZipArchive')) throw new RuntimeException('Auf diesem Rechner fehlt die ZIP-Erweiterung von PHP.');
    $tmp = tempnam(sys_get_temp_dir(), 'puhs');
    if ($tmp === false) throw new RuntimeException('Kein Platz für das Paket.');
    $z = new ZipArchive();
    if ($z->open($tmp, ZipArchive::OVERWRITE) !== true) { @unlink($tmp); throw new RuntimeException('Paket nicht anlegbar.'); }
    $z->addFromString('BRAND.md', pu_handschrift_brand_md($d));
    $z->addFromString('systemprompt.txt', pu_handschrift_systemprompt($d));
    $z->addFromString('index.html', pu_handschrift_html($d));
    $z->addFromString('stil.css', pu_handschrift_css($d));
    $z->addFromString('PRUEFLISTE.md', pu_handschrift_pruefliste());
    $z->addFromString('LIZENZ.md', pu_handschrift_lizenz());
    $z->close();
    $roh = (string)file_get_contents($tmp);
    @unlink($tmp);
    return $roh;
}

/** Der Stand für die Oberfläche. */
function pu_handschrift_stand(int $lernender): array
{
    $frei = pu_handschrift_frei($lernender);
    $d = pu_handschrift($lernender);
    return [
        'frei'         => $frei['frei'],
        'grund'        => $frei['grund'],
        'prozent'      => $frei['prozent'],
        'vorgabe_art'  => pu_handschrift_vorgabe_art($lernender),
        'vorhanden'    => $d !== null,
        'daten'        => $d ?? pu_handschrift_leer(pu_handschrift_vorgabe_art($lernender)),
        'fehlt'        => $d !== null ? pu_handschrift_fehlt($d) : null,
        'systemprompt' => $d !== null ? pu_handschrift_systemprompt($d) : '',
        'im_einsatz'   => pu_handschrift_uebergabe_konto() === $lernender && $d !== null && pu_handschrift_fehlt($d) === [],
        'grenzen'      => PU_HANDSCHRIFT_GRENZEN,
        'mindest'      => PU_HANDSCHRIFT_MINDEST,
    ];
}
