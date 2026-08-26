<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Bewertung. Deterministisch, ohne Sprachmodell.
 *
 * Der Grundsatz aus PLAN.md, Abschnitt 1: *Punkte rechnet kein Sprachmodell.*
 * Derselbe Versuch muss beim zweiten Lauf dasselbe Ergebnis geben, sonst hängt
 * eine Urkunde an einem Modelllauf und die Prüfungsordnung ist wertlos.
 *
 * Das kostet etwas, und der Preis ist bewusst bezahlt: Freitext wird nicht
 * "verstanden", sondern gegen Prüfungen gehalten, die in der Aufgabe stehen.
 * Athena schreibt darunter eine Anmerkung — sie hilft beim Lernen und rührt
 * den Punktestand nicht an.
 *
 * Rückgabe jeder Bewertung:
 *   ['richtig' => bool, 'punkte' => int, 'max' => int,
 *    'teil' => array, 'rueckmeldung' => string]
 */

/**
 * Bewertet eine Antwort gegen die vollständige Aufgabe.
 *
 * @param array $a       Aufgabe in Serverfassung (mit loesung)
 * @param mixed $antwort wie vom Frontend geliefert
 */
function pu_bewerten(array $a, $antwort): array
{
    $max = (int)$a['punkte'];

    $treffer = match ($a['typ']) {
        'denkaufgabe', 'raeumlich' => pu_b_menge((array)$a['loesung'], $antwort),
        'plugplay'                 => pu_b_menge((array)$a['loesung'], $antwort),
        'schiebe'                  => pu_b_folge((array)$a['loesung'], $antwort),
        'uebereinstimmung'         => pu_b_paare((array)$a['loesung'], $antwort),
        'mathe'                    => pu_b_zahl($a, $antwort),
        'secret'                   => pu_b_secret((string)$a['loesung'], $antwort),
        'sicherheit'               => pu_b_zeilen((array)$a['zeilen'], $antwort),
        'technisch', 'krypto'      => pu_b_pruefer($a, $antwort),
        'multitask'                => null,   // eigener Weg, siehe unten
        'planung'                  => null,   // eigener Weg, siehe unten
    };

    if ($a['typ'] === 'multitask') return pu_b_multitask($a, $antwort);
    if ($a['typ'] === 'planung')   return pu_b_planung($a, $antwort);

    return [
        'richtig'      => $treffer,
        'punkte'       => $treffer ? $max : 0,
        'max'          => $max,
        'teil'         => [],
        'rueckmeldung' => $treffer ? pu_lob($a['id']) : pu_ermutigung($a['id']),
    ];
}

// ================================================================ Bausteine

/** Antwort auf eine Liste von Zeichenketten bringen. */
function pu_b_liste($antwort): array
{
    if (is_array($antwort)) return array_values(array_map(fn($x) => trim((string)$x), $antwort));
    $s = trim((string)$antwort);
    return $s === '' ? [] : [$s];
}

/**
 * Mengengleichheit: dieselben Elemente, Reihenfolge egal, keine Doppelten.
 *
 * Doppelte in der Antwort werden entfernt, bevor verglichen wird. Wer eine
 * Option zweimal anklickt, hat sie einmal gemeint — das ist eine
 * Bedienungssache, keine falsche Antwort.
 */
function pu_b_menge(array $loesung, $antwort): bool
{
    $l = array_unique(array_map(fn($x) => mb_strtolower(trim((string)$x)), $loesung));
    $a = array_unique(array_map('mb_strtolower', pu_b_liste($antwort)));
    sort($l); sort($a);
    return $l === $a;
}

/** Folgengleichheit: dieselben Elemente in derselben Reihenfolge. */
function pu_b_folge(array $loesung, $antwort): bool
{
    $l = array_map(fn($x) => mb_strtolower(trim((string)$x)), $loesung);
    $a = array_map('mb_strtolower', pu_b_liste($antwort));
    return $l === $a;
}

/** Paarabbildung: jede linke Seite muss auf die richtige rechte zeigen. */
function pu_b_paare(array $loesung, $antwort): bool
{
    if (!is_array($antwort)) return false;
    if (count($antwort) !== count($loesung)) return false;
    foreach ($loesung as $links => $rechts) {
        $gegeben = $antwort[(string)$links] ?? null;
        if ($gegeben === null) return false;
        if (mb_strtolower(trim((string)$gegeben)) !== mb_strtolower(trim((string)$rechts))) return false;
    }
    return true;
}

/**
 * Zahl mit Toleranz.
 *
 * Ohne Toleranz wäre eine Kostenschätzung ueber Token praktisch nie richtig:
 * 0,0031 statt 0,0030 ist dieselbe Erkenntnis. Die Toleranz steht in der
 * Aufgabe, damit sie zum Stoff passt und nicht zu einer Faustregel im Code.
 */
function pu_b_zahl(array $a, $antwort): bool
{
    $roh = trim((string)(is_array($antwort) ? ($antwort[0] ?? '') : $antwort));
    if ($roh === '') return false;

    $roh = pu_zahl_lesen($roh);
    if ($roh === null) return false;

    $ist  = $roh;
    $soll = (float)$a['loesung'];
    $tol  = (float)($a['toleranz'] ?? 0);
    return abs($ist - $soll) <= $tol + 1e-9;
}

/**
 * Liest eine Zahl in deutscher ODER englischer Schreibweise.
 *
 * Der Fall, der das nötig macht: ein deutscher Lernender tippt für
 * tausend `1.000`. Ohne diese Funktion liest PHP daraus 1,0 — und markiert
 * eine richtige Antwort als falsch. Das ist kein Randfall, das ist die
 * übliche Schreibweise der Zielgruppe.
 *
 * Die Regeln, in dieser Reihenfolge:
 *
 *   1. Punkt UND Komma  → das zuletzt stehende Zeichen ist das Dezimaltrenn-
 *                         zeichen, das andere ist Tausendertrennung.
 *                         `1.234,56` = 1234,56 · `1,234.56` = 1234,56
 *   2. nur Komma        → Dezimalkomma.  `1000,5` = 1000,5
 *   3. nur Punkte, und der Aufbau ist eine reine Dreiergruppierung
 *                       → Tausendertrennung.  `1.000` = 1000 · `1.234.567`
 *   4. sonst            → Dezimalpunkt.  `1.5` = 1,5 · `0.0031` = 0,0031
 *
 * Regel 3 und 4 sind der einzige echte Kompromiss: `1.000` könnte in
 * englischer Schreibweise auch 1,0 heißen. Da die Academy deutsch ist, gewinnt
 * die deutsche Lesart. Wer 1,0 meint, schreibt `1` oder `1,0` — beides wird
 * verstanden.
 *
 * @return float|null null, wenn es keine Zahl ist
 */
function pu_zahl_lesen(string $roh): ?float
{
    $s = str_replace([' ', "\u{00A0}", "'"], '', trim($roh));
    if ($s === '') return null;

    $hatPunkt = str_contains($s, '.');
    $hatKomma = str_contains($s, ',');

    if ($hatPunkt && $hatKomma) {
        $dezimal = strrpos($s, '.') > strrpos($s, ',') ? '.' : ',';
        $tausend = $dezimal === '.' ? ',' : '.';
        $s = str_replace($tausend, '', $s);
        $s = str_replace($dezimal, '.', $s);
    } elseif ($hatKomma) {
        $s = str_replace(',', '.', $s);
    } elseif ($hatPunkt && preg_match('/^-?\d{1,3}(\.\d{3})+$/', $s)) {
        $s = str_replace('.', '', $s);
    }

    return is_numeric($s) ? (float)$s : null;
}

/**
 * Attrappe finden. Gross/klein egal, Leerraum getrimmt.
 *
 * Bewusst nachsichtig: geprueft wird, ob jemand das Geheimnis GEFUNDEN hat,
 * nicht ob er es fehlerfrei abschreiben kann.
 */
function pu_b_secret(string $loesung, $antwort): bool
{
    $a = trim((string)(is_array($antwort) ? ($antwort[0] ?? '') : $antwort));
    return $a !== '' && strcasecmp($a, trim($loesung)) === 0;
}

/** Verwundbare Zeilen: dieselben Zeilennummern, Reihenfolge egal. */
function pu_b_zeilen(array $zeilen, $antwort): bool
{
    $l = array_unique(array_map('intval', $zeilen));
    $a = array_unique(array_map('intval', pu_b_liste($antwort)));
    sort($l); sort($a);
    return $l === $a && $l !== [];
}

// ================================================================ Prüfer
/**
 * Die feste Liste der Prüfroutinen für `technisch` und `krypto`.
 *
 * Eine Notiz nennt hier nur einen NAMEN. Es gibt kein `eval`, keinen
 * dynamischen Aufruf und keinen Prozessstart aus dem Lehrstoff heraus: eine
 * Notiz darf Lehrstoff sein, nie Code. Wer eine neue Prüfung braucht, trägt
 * sie hier ein — dann steht sie im Test und in der Versionsgeschichte.
 *
 * Jede Routine bekommt (Antwort, Aufgabe) und gibt bool.
 */
function pu_pruefer_liste(): array
{
    return [
        // --- Hashes: die Antwort ist der Hash der Aufgabeneingabe
        'sha256_von'   => fn(string $x, array $a): bool =>
            strcasecmp(trim($x), hash('sha256', (string)($a['eingabe'] ?? ''))) === 0,
        'sha1_von'     => fn(string $x, array $a): bool =>
            strcasecmp(trim($x), hash('sha1', (string)($a['eingabe'] ?? ''))) === 0,
        'md5_von'      => fn(string $x, array $a): bool =>
            strcasecmp(trim($x), hash('md5', (string)($a['eingabe'] ?? ''))) === 0,

        // --- Wie viele Zeichen hat ein SHA-256 in Hex? Mathe am Gegenstand.
        'hash_laenge'  => fn(string $x, array $a): bool =>
            (int)trim($x) === strlen(hash((string)($a['algorithmus'] ?? 'sha256'), (string)($a['eingabe'] ?? ''))),

        // --- Base64 in beide Richtungen
        'base64_dekodiert' => fn(string $x, array $a): bool =>
            trim($x) === trim((string)base64_decode((string)($a['eingabe'] ?? ''), true)),
        'base64_kodiert'   => fn(string $x, array $a): bool =>
            trim($x) === base64_encode((string)($a['eingabe'] ?? '')),

        // --- Caesar/ROT13 — das erste Verschluesselungsspiel in Stufe 5
        'rot13'        => fn(string $x, array $a): bool =>
            strcasecmp(trim($x), str_rot13((string)($a['eingabe'] ?? ''))) === 0,

        // --- Hex
        'hex_kodiert'  => fn(string $x, array $a): bool =>
            strcasecmp(trim($x), bin2hex((string)($a['eingabe'] ?? ''))) === 0,
        'hex_dekodiert'=> fn(string $x, array $a): bool =>
            trim($x) === (string)@hex2bin((string)($a['eingabe'] ?? '')),

        // --- Token schätzen: rund vier Zeichen je Token im Deutschen.
        //     Die Toleranz ist großzügig, weil die Faustregel es ist —
        //     gelernt werden soll die Größenordnung, nicht eine Zahl.
        'token_anzahl' => function (string $x, array $a): bool {
            $roh = trim(str_replace(',', '.', $x));
            if (!is_numeric($roh)) return false;
            $soll = (int)ceil(mb_strlen((string)($a['eingabe'] ?? '')) / 4);
            return abs((float)$roh - $soll) <= max(2.0, $soll * 0.25);
        },

        // --- Kosten schätzen: tokens/1e6 * preis. Toleranz aus der Aufgabe.
        'kosten_estimate' => function (string $x, array $a): bool {
            $roh = trim(str_replace(',', '.', $x));
            if (!is_numeric($roh)) return false;
            $soll = ((float)($a['tokens'] ?? 0) / 1000000.0) * (float)($a['preis_pro_mio'] ?? 0);
            $tol  = (float)($a['toleranz'] ?? 0.01);
            return abs((float)$roh - $soll) <= $tol + 1e-9;
        },

        // --- Gültiges JSON abliefern (Stufe 4, API-Grundlagen)
        'json_gueltig' => function (string $x, array $a): bool {
            $d = json_decode(trim($x), true);
            if (!is_array($d)) return false;
            foreach ((array)($a['schluessel'] ?? []) as $k) {
                if (!array_key_exists((string)$k, $d)) return false;
            }
            return true;
        },

        // --- Eine Zeichenkette finden, die mit einem Präfix beginnt
        //     (Ledger-Adressen in Stufe 5: Stellar-Konten beginnen mit G).
        'beginnt_mit'  => fn(string $x, array $a): bool =>
            str_starts_with(trim($x), (string)($a['praefix'] ?? ''))
            && mb_strlen(trim($x)) === (int)($a['laenge'] ?? mb_strlen(trim($x))),
    ];
}

function pu_b_pruefer(array $a, $antwort): bool
{
    $name  = (string)$a['pruefer'];
    $liste = pu_pruefer_liste();
    if (!isset($liste[$name])) {
        // Laut, nicht still: eine Aufgabe mit unbekanntem Prüfer wäre sonst
        // für jeden Lernenden unlösbar, ohne dass jemand erfährt warum.
        throw new RuntimeException("Aufgabe {$a['id']}: unbekannter Prüfer '$name'.");
    }
    $x = (string)(is_array($antwort) ? ($antwort[0] ?? '') : $antwort);
    return $liste[$name]($x, $a);
}

// ================================================================ Multitask
/**
 * Mehrere Schritte in Folge. Teilpunkte je Schritt.
 *
 * Teilpunkte, weil ein Multitask sonst die härteste Aufgabe der Academy wäre:
 * vier Schritte richtig und einer falsch gaebe null. Das entmutigt genau die
 * Lernenden, die schon fast durch sind.
 */
function pu_b_multitask(array $a, $antwort): array
{
    $antworten = is_array($antwort) ? $antwort : [];
    $punkte = 0; $teil = [];

    foreach ((array)$a['schritte'] as $i => $s) {
        $s['id']     = (string)$a['id'] . '-' . ($i + 1);
        $s['titel']  = (string)($s['titel'] ?? ('Schritt ' . ($i + 1)));
        $s['punkte'] = (int)($s['punkte'] ?? 0);

        $erg = pu_bewerten($s, $antworten[$i] ?? ($antworten[(string)$i] ?? null));
        $punkte += $erg['punkte'];
        $teil[]  = [
            'schritt'  => $i + 1,
            'titel'    => $s['titel'],
            'richtig'  => $erg['richtig'],
            'punkte'   => $erg['punkte'],
            'max'      => $erg['max'],
        ];
    }

    $max = (int)$a['punkte'];
    return [
        'richtig'      => $punkte >= $max,
        'punkte'       => $punkte,
        'max'          => $max,
        'teil'         => $teil,
        'rueckmeldung' => $punkte >= $max
            ? pu_lob($a['id'])
            : sprintf('%d von %d Schritten sitzen. Schau dir die roten noch einmal an.',
                count(array_filter($teil, fn($t) => $t['richtig'])), count($teil)),
    ];
}

// ================================================================ Freitext
/**
 * Freitext gegen deterministische Prüfungen.
 *
 * Hier liegt der wichtigste Kompromiss der ganzen Academy. Ein Sprachmodell
 * könnte einen Plan besser beurteilen als diese Regeln — aber es würde
 * heute 55 und morgen 70 Punkte geben, und eine Urkunde wäre dann keine
 * Aussage mehr, sondern eine Momentaufnahme.
 *
 * Also: die Punkte kommen aus den Prüfungen, die in der Aufgabe stehen.
 * Was das Modell zu sagen hat, steht darunter und ändert nichts.
 */
function pu_b_planung(array $a, $antwort): array
{
    $text  = trim((string)(is_array($antwort) ? implode("\n", $antwort) : $antwort));
    $klein = mb_strtolower($text);
    $worte = preg_split('/\s+/u', $text, -1, PREG_SPLIT_NO_EMPTY) ?: [];

    $max = (int)$a['punkte'];

    // Eine leere Antwort gibt null Punkte — ausnahmslos.
    //
    // Ohne diese Zeile wären alle `enthaelt_nicht`-Prüfungen trivial
    // erfuellt: wer nichts schreibt, nennt auch kein Passwort. Gemessen an
    // der Prüfung von Stufe 1 gab eine vollständig leere Abgabe dadurch
    // 5 Punkte. Das ist wenig — aber es ist die falsche Richtung, und bei
    // einer Aufgabe mit mehreren Verbotspruefungen wäre es viel.
    if ($text === '') {
        return [
            'richtig' => false,
            'punkte'  => 0,
            'max'     => $max,
            'teil'    => array_map(fn($p) => [
                'art'         => (string)($p['art'] ?? ''),
                'erfuellt'    => false,
                'punkte'      => 0,
                'max'         => (int)($p['punkte'] ?? 0),
                'begruendung' => (string)($p['begruendung'] ?? ''),
            ], (array)$a['pruefungen']),
            'rueckmeldung' => 'Es wurde nichts abgegeben.',
        ];
    }

    $punkte = 0; $teil = [];

    foreach ((array)$a['pruefungen'] as $p) {
        $art     = (string)$p['art'];
        $wert    = $p['wert'] ?? null;
        $werte   = array_map(fn($w) => mb_strtolower(trim((string)$w)), (array)($p['werte'] ?? []));
        $pPunkte = (int)($p['punkte'] ?? 0);

        $ok = match ($art) {
            'enthaelt_alle'      => pu_b_alle_enthalten($klein, $werte),
            'enthaelt_eines'     => pu_b_eines_enthalten($klein, $werte),
            'enthaelt_nicht'     => !pu_b_eines_enthalten($klein, $werte),
            'mindestens_woerter' => count($worte) >= (int)$wert,
            'hoechstens_woerter' => count($worte) <= (int)$wert,
            'reihenfolge'        => pu_b_reihenfolge($klein, $werte),
            'muster'             => (bool)preg_match('/' . str_replace('/', '\/', (string)$wert) . '/iu', $text),
            default              => throw new RuntimeException(
                                        "Aufgabe {$a['id']}: unbekannte Prüfungsart '$art'."),
        };

        if ($ok) $punkte += $pPunkte;
        $teil[] = [
            'art'         => $art,
            'erfuellt'    => $ok,
            'punkte'      => $ok ? $pPunkte : 0,
            'max'         => $pPunkte,
            'begruendung' => (string)($p['begruendung'] ?? pu_b_pruefung_text($art, $werte, $wert)),
        ];
    }

    $max = (int)$a['punkte'];
    return [
        'richtig'      => $punkte >= $max,
        'punkte'       => $punkte,
        'max'          => $max,
        'teil'         => $teil,
        'rueckmeldung' => $punkte >= $max
            ? pu_lob($a['id'])
            : 'Die Punkte stehen fest. Was noch fehlt, steht in der Liste darunter.',
    ];
}

/**
 * Vereinheitlicht Umlaute für den Vergleich: ä → ae, ö → oe, ü → ue, ß → ss.
 *
 * Der Fall, der das nötig macht, stand im eigenen Lehrstoff: eine Prüfung
 * suchte den Begriff `einschränkung`, ein Lernender schreibt aber
 * „Einschränkung". Die Prüfung wäre damit für jeden unerfüllbar gewesen, der
 * korrektes Deutsch tippt — und die Aufgabe hätte still zu wenig Punkte
 * gegeben, ohne dass jemand den Grund gesehen hätte.
 *
 * Vereinheitlicht wird auf BEIDEN Seiten. Damit trifft jede Schreibweise die
 * jeweils andere, und auf einer Tastatur ohne Umlaute bleibt die Academy
 * benutzbar.
 */
function pu_umlaut_normal(string $s): string
{
    return strtr($s, [
        'ä' => 'ae', 'ö' => 'oe', 'ü' => 'ue', 'ß' => 'ss',
        'Ä' => 'ae', 'Ö' => 'oe', 'Ü' => 'ue',
    ]);
}

/**
 * Kommt der Begriff im Text vor?
 *
 * **Der Anfang zählt, das Ende nicht.** Ein Suchbegriff muss an einem Wortanfang
 * stehen, darf aber weitergehen: `verifizier` trifft „verifizieren",
 * `quelle` trifft „Quellen", `pruef` trifft „prüfe" und „prüfst".
 *
 * ## Warum das so sein muss
 *
 * Vorher wurde auf BEIDEN Seiten eine Wortgrenze verlangt. Der Zweck war
 * richtig — „api" soll nicht in „kapital" treffen —, aber dafür genügt die
 * LINKE Grenze: in „kapital" steht vor „api" ein „k", also greift sie schon
 * dort. Die rechte Grenze hat nichts abgewehrt und dafür jede gebeugte Form
 * ausgeschlossen.
 *
 * Und die Aufgaben arbeiten mit **Stämmen**, nicht mit ganzen Wörtern:
 * `pruef`, `verifizier`, `kontrollier`, `nachschlag`. Im Deutschen hängt an
 * einem Stamm fast immer noch etwas dran. Mit der rechten Grenze war eine
 * solche Prüfung nur zu bestehen, indem man den blanken Stamm hinschrieb —
 * also nie.
 *
 * Gemeldet an E1-14 „Deine Prüfregel": Eine Antwort, die mit „Ich prüfe die
 * Angaben nach" beginnt und weiter unten „verifizieren" und „kontrollieren"
 * schreibt, bekam für das Kriterium „Du sagst, dass du die Angaben nachprüfst"
 * **null von 15 Punkten**. Alle sechs erlaubten Wörter standen sinngemäß da.
 *
 * Das war kein Ausrutscher einer Aufgabe, sondern galt für jede Prüfung mit
 * einem Stamm — still und ohne dass die Punktzahl den Grund verraten hätte.
 */
function pu_b_enthaelt(string $heuhaufen, string $nadel): bool
{
    if ($nadel === '') return true;

    $heuhaufen = pu_umlaut_normal($heuhaufen);
    $nadel     = pu_umlaut_normal($nadel);

    // Enthält die Nadel Leerzeichen oder Sonderzeichen, wird schlicht gesucht;
    // bei einem einzelnen Wort muss sie an einem Wortanfang stehen.
    if (preg_match('/^[\p{L}\p{N}_-]+$/u', $nadel)) {
        return (bool)preg_match('/(?<![\p{L}\p{N}])' . preg_quote($nadel, '/') . '/u', $heuhaufen);
    }
    return str_contains($heuhaufen, $nadel);
}

function pu_b_alle_enthalten(string $text, array $werte): bool
{
    foreach ($werte as $w) if (!pu_b_enthaelt($text, $w)) return false;
    return $werte !== [];
}

function pu_b_eines_enthalten(string $text, array $werte): bool
{
    foreach ($werte as $w) if (pu_b_enthaelt($text, $w)) return true;
    return false;
}

/** Kommen die Begriffe in dieser Reihenfolge vor? */
function pu_b_reihenfolge(string $text, array $werte): bool
{
    // Dieselbe Vereinheitlichung wie in pu_b_enthaelt — sonst wäre die
    // Schreibweise hier wieder entscheidend, und zwar nur hier.
    $text = pu_umlaut_normal($text);
    $ab = 0;
    foreach ($werte as $w) {
        $w = pu_umlaut_normal($w);
        $p = mb_strpos($text, $w, $ab);
        if ($p === false) return false;
        $ab = $p + mb_strlen($w);
    }
    return true;
}

/** Ersatztext, wenn die Aufgabe keine eigene Begründung nennt. */
function pu_b_pruefung_text(string $art, array $werte, $wert): string
{
    return match ($art) {
        'enthaelt_alle'      => 'Alle diese Begriffe kommen vor: ' . implode(', ', $werte),
        'enthaelt_eines'     => 'Mindestens einer dieser Begriffe kommt vor: ' . implode(', ', $werte),
        'enthaelt_nicht'     => 'Keiner dieser Begriffe kommt vor: ' . implode(', ', $werte),
        'mindestens_woerter' => 'Mindestens ' . (int)$wert . ' Wörter',
        'hoechstens_woerter' => 'Höchstens ' . (int)$wert . ' Wörter',
        'reihenfolge'        => 'Diese Begriffe in dieser Reihenfolge: ' . implode(' → ', $werte),
        'muster'             => 'Der Text entspricht dem geforderten Muster',
        default              => $art,
    };
}

// ================================================================ Rueckmeldung
/**
 * Ermutigung statt "Falsch."
 *
 * Reproduzierbar aus der Aufgabenkennung gewaehlt, nicht zufällig: derselbe
 * Fehlversuch soll denselben Satz geben. Ein Satz, der beim Neuladen wechselt,
 * wirkt wie eine Maschine, die würfelt.
 */
function pu_ermutigung(string $keim): string
{
    $saetze = [
        'Fast! Schau dir den vorletzten Schritt noch einmal an.',
        'Der Ansatz stimmt — an einer Stelle kippt er noch.',
        'Nicht ganz. Lies die Aufgabe noch einmal langsam; die Antwort steckt darin.',
        'Starke Logik, falsches Ergebnis. Das passiert den Besten.',
        'Noch nicht. Ein Hinweis kostet ein paar Punkte und spart dir viel Zeit.',
        'Knapp daneben. Manchmal hilft es, laut mitzusprechen.',
    ];
    return $saetze[hexdec(substr(hash('sha256', $keim . 'e'), 0, 4)) % count($saetze)];
}

function pu_lob(string $keim): string
{
    $saetze = [
        'Sitzt. Weiter so.',
        'Richtig — und ohne Umweg.',
        'Genau das war gemeint.',
        'Sauber gelöst.',
        'Das war die Antwort. Nächste Aufgabe.',
        'Treffer. Du hast das Muster erkannt.',
    ];
    return $saetze[hexdec(substr(hash('sha256', $keim . 'l'), 0, 4)) % count($saetze)];
}
