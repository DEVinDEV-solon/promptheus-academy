<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Lehrstoff lesen: Frontmatter, Aufgabenblöcke, Kursindex.
 *
 * Der Lehrstoff liegt als OKF-Notizen in `brain/`. Diese Datei ist der einzige
 * Weg hinein. Sie tut drei Dinge:
 *
 *   1. YAML-Teilmenge lesen (Frontmatter und Aufgabenblöcke)
 *   2. Aufgaben aus Lektionen holen und STRENG pruefen
 *   3. einen Index ueber alle Kurse aufbauen
 *
 * Warum streng: eine Aufgabe mit unbekanntem Typ oder doppelter Kennung wird
 * hier zum Fehler, nicht zur Warnung. Eine still übersprungene Aufgabe fällt
 * niemandem auf — der Kurs sieht vollständig aus, ist es aber nicht. Und ein
 * doppeltes `id` hängt den Lernstand an die Lesereihenfolge der Dateien:
 * dieselbe Antwort wäre je nach Betriebssystem richtig oder falsch.
 */

// ================================================================ YAML
/**
 * Liest die YAML-Teilmenge, die PROMPTHEUS braucht — und nur die.
 *
 * Unterstuetzt: Einrückung als Verschachtelung, `schluessel: wert`,
 * Fluss-Listen `[a, b]`, Block-Listen `- eintrag` (Skalar oder Karte),
 * Block-Text `|` und `>`, Kommentare, einfache und doppelte Anführungszeichen.
 *
 * Bewusst NICHT unterstützt: Anker, Verweise, mehrere Dokumente,
 * Fluss-Karten `{a: 1}`, Mehrzeiler ohne Blockmarke. Ein eigener Parser statt
 * einer Bibliothek, weil PROMPTHEUS ohne Composer läuft; eng gehalten, weil
 * ein grosszuegiger Parser Tippfehler stillschweigend hinnimmt.
 *
 * @throws RuntimeException bei nicht lesbarer Einrückung
 */
function pu_yaml_parse(string $text): array
{
    $zeilen = preg_split('/\r\n|\r|\n/', $text) ?: [];
    $pos    = 0;
    $wert   = pu_yaml_block($zeilen, $pos, 0);
    return is_array($wert) ? $wert : [];
}

/**
 * Liest einen Block ab $pos, dessen Einrückung mindestens $tiefe ist.
 * Gibt eine Karte oder eine Liste zurueck.
 */
function pu_yaml_block(array $zeilen, int &$pos, int $tiefe): array
{
    $ergebnis = [];
    $istListe = null;

    while ($pos < count($zeilen)) {
        $roh = $zeilen[$pos];

        // Leerzeile und Kommentarzeile überspringen
        if (trim($roh) === '' || preg_match('/^\s*#/', $roh)) { $pos++; continue; }

        $ein = strlen($roh) - strlen(ltrim($roh, ' '));
        if ($ein < $tiefe) break;                 // Block zu Ende
        if ($ein > $tiefe) {
            // Tiefere Einrückung ohne Elternschlüssel: unlesbar.
            throw new RuntimeException('YAML: unerwartete Einrückung in Zeile: ' . trim($roh));
        }

        $zeile = trim($roh);

        // ---------------------------------------------------- Listeneintrag
        if (str_starts_with($zeile, '- ') || $zeile === '-') {
            if ($istListe === false) {
                throw new RuntimeException('YAML: Liste und Karte gemischt bei: ' . $zeile);
            }
            $istListe = true;
            $rest = trim(substr($zeile, 1));
            $pos++;

            if ($rest === '') {
                // "- " allein: der Eintrag steht eingerueckt darunter.
                $ergebnis[] = pu_yaml_block($zeilen, $pos, pu_yaml_naechste_tiefe($zeilen, $pos, $tiefe));
                continue;
            }

            $paar = pu_yaml_paar_zerlegen($rest);
            if ($paar !== null) {
                // "- schluessel: wert" — eine Karte, deren erste Zeile mit
                // dem Strich beginnt. Die folgenden Zeilen gehören dazu,
                // wenn sie tiefer eingerueckt sind als der Strich.
                $karte = [];
                pu_yaml_paar($zeilen, $pos, $tiefe + 2, $karte, $paar[0], $paar[1]);
                $weiter = pu_yaml_block($zeilen, $pos, $tiefe + 2);
                foreach ($weiter as $k => $v) $karte[$k] = $v;
                $ergebnis[] = $karte;
                continue;
            }

            $ergebnis[] = pu_yaml_skalar($rest);
            continue;
        }

        // ---------------------------------------------------- Schlüssel: Wert
        $paar = pu_yaml_paar_zerlegen($zeile);
        if ($paar === null) {
            throw new RuntimeException('YAML: Zeile ist kein Paar und kein Listeneintrag: ' . $zeile);
        }
        if ($istListe === true) {
            throw new RuntimeException('YAML: Karte und Liste gemischt bei: ' . $zeile);
        }
        $istListe = false;
        $pos++;
        pu_yaml_paar($zeilen, $pos, $tiefe, $ergebnis, $paar[0], $paar[1]);
    }

    return $ergebnis;
}

/**
 * Zerlegt "schluessel: wert" — auch mit Schlüssel in Anführungszeichen.
 *
 * Ohne Anführungszeichen darf ein Schlüssel nur aus `A-Za-z0-9_.-` bestehen.
 * Das reicht für Feldnamen, aber nicht für Zuordnungsaufgaben: dort steht
 * links ein ganzer Satz, und ein Satz enthaelt Leerzeichen und gelegentlich
 * einen Doppelpunkt. Ein Schlüssel in Anführungszeichen ist die Schreibweise,
 * die YAML dafür vorsieht — und ohne sie müsste man den Lehrstoff dem Parser
 * anpassen statt umgekehrt.
 *
 * Ein Listeneintrag wie `- "Nur ein Text"` ist KEIN Paar: das Muster verlangt
 * einen Doppelpunkt nach dem schliessenden Anführungszeichen.
 *
 * @return array{0: string, 1: string}|null [Schlüssel, Rohwert]
 */
function pu_yaml_paar_zerlegen(string $zeile): ?array
{
    if (preg_match('/^"((?:[^"\\\\]|\\\\.)*)"\s*:\s*(.*)$/', $zeile, $m)) {
        return [str_replace(['\\"', '\\\\'], ['"', '\\'], $m[1]), $m[2]];
    }
    if (preg_match("/^'((?:[^']|'')*)'\s*:\s*(.*)$/", $zeile, $m)) {
        return [str_replace("''", "'", $m[1]), $m[2]];
    }
    // Unbequotete Schlüssel dürfen Buchstaben JEDER Sprache tragen, nicht nur
    // a-z. Gefunden an einer Zuordnungsaufgabe, deren linke Seite `Straße:`
    // hiess: mit einer reinen ASCII-Klasse fiel die Zeile durch, die Aufgabe
    // galt als kaputt, und die Lektion hatte stillschweigend eine Aufgabe
    // weniger. In einer deutschen Academy ist das kein Randfall.
    if (preg_match('/^([\p{L}\p{N}_.-]+)\s*:\s*(.*)$/u', $zeile, $m)) {
        return [$m[1], $m[2]];
    }
    return null;
}

/** Legt ein Paar ab; holt bei leerem Wert oder Blockmarke den Rumpf nach. */
function pu_yaml_paar(array $zeilen, int &$pos, int $tiefe, array &$ziel, string $schluessel, string $wert): void
{
    $wert = rtrim($wert);

    // Blocktext:  schluessel: |   /   schluessel: >
    if ($wert === '|' || $wert === '|-' || $wert === '>' || $wert === '>-') {
        $ziel[$schluessel] = pu_yaml_blocktext($zeilen, $pos, $tiefe, $wert[0] === '>');
        return;
    }

    // Leerer Wert: Rumpf steht eingerueckt darunter (Karte oder Liste).
    if ($wert === '') {
        $unter = pu_yaml_naechste_tiefe($zeilen, $pos, $tiefe);
        if ($unter === null) { $ziel[$schluessel] = ''; return; }
        $ziel[$schluessel] = pu_yaml_block($zeilen, $pos, $unter);
        return;
    }

    $ziel[$schluessel] = pu_yaml_skalar($wert);
}

/**
 * Wie tief ist der nächste inhaltliche Block?
 *
 * Eine Liste darf auf derselben Höhe wie ihr Schlüssel stehen (gaengiges
 * YAML), eine Karte muss tiefer stehen. Deshalb wird hier gemessen statt
 * angenommen: `$tiefe + 2` fest zu verdrahten hätte jede Liste verworfen,
 * die nicht eingerueckt ist — und das ist die häufigere Schreibweise.
 */
function pu_yaml_naechste_tiefe(array $zeilen, int $pos, int $tiefe): ?int
{
    for ($i = $pos; $i < count($zeilen); $i++) {
        $roh = $zeilen[$i];
        if (trim($roh) === '' || preg_match('/^\s*#/', $roh)) continue;
        $ein = strlen($roh) - strlen(ltrim($roh, ' '));
        if ($ein > $tiefe) return $ein;
        if ($ein === $tiefe && str_starts_with(trim($roh), '- ')) return $ein;
        return null;
    }
    return null;
}

/** Sammelt einen Blocktext. Bei `>` werden Zeilen zusammengezogen. */
function pu_yaml_blocktext(array $zeilen, int &$pos, int $tiefe, bool $gefaltet): string
{
    $teile = [];
    $innen = null;
    while ($pos < count($zeilen)) {
        $roh = $zeilen[$pos];
        if (trim($roh) === '') { $teile[] = ''; $pos++; continue; }
        $ein = strlen($roh) - strlen(ltrim($roh, ' '));
        if ($ein <= $tiefe) break;
        if ($innen === null) $innen = $ein;
        $teile[] = substr($roh, min($innen, $ein));
        $pos++;
    }
    while ($teile !== [] && end($teile) === '') array_pop($teile);
    return $gefaltet ? implode(' ', array_map('trim', $teile)) : implode("\n", $teile);
}

/** Einzelwert: Fluss-Liste, Zahl, Wahrheitswert, null oder Zeichenkette. */
function pu_yaml_skalar(string $wert)
{
    $wert = trim($wert);

    // Kommentar hinter dem Wert entfernen — aber nicht in Anführungszeichen.
    if ($wert !== '' && $wert[0] !== '"' && $wert[0] !== "'" && $wert[0] !== '[') {
        $wert = trim(preg_replace('/\s+#.*$/', '', $wert) ?? $wert);
    }

    // Fluss-Liste [a, b, "c, d"]
    if (str_starts_with($wert, '[') && str_ends_with($wert, ']')) {
        $innen = trim(substr($wert, 1, -1));
        if ($innen === '') return [];
        $teile = pu_yaml_fluss_teilen($innen);
        return array_map('pu_yaml_skalar', $teile);
    }

    if (strlen($wert) >= 2) {
        $a = $wert[0]; $z = $wert[strlen($wert) - 1];
        if ($a === '"' && $z === '"') {
            return str_replace(['\\n', '\\"', '\\\\'], ["\n", '"', '\\'], substr($wert, 1, -1));
        }
        if ($a === "'" && $z === "'") {
            return str_replace("''", "'", substr($wert, 1, -1));
        }
    }

    $klein = strtolower($wert);
    if ($klein === 'true' || $klein === 'yes')  return true;
    if ($klein === 'false' || $klein === 'no')  return false;
    if ($klein === 'null' || $klein === '~' || $wert === '') return null;
    if (preg_match('/^-?\d+$/', $wert))         return (int)$wert;
    if (preg_match('/^-?\d*\.\d+$/', $wert))    return (float)$wert;

    return $wert;
}

/** Teilt eine Fluss-Liste an Kommas, die nicht in Anführungszeichen stehen. */
function pu_yaml_fluss_teilen(string $s): array
{
    $teile = []; $puffer = ''; $quote = '';
    for ($i = 0; $i < strlen($s); $i++) {
        $c = $s[$i];
        if ($quote !== '') {
            $puffer .= $c;
            if ($c === $quote) $quote = '';
            continue;
        }
        if ($c === '"' || $c === "'") { $quote = $c; $puffer .= $c; continue; }
        if ($c === ',') { $teile[] = trim($puffer); $puffer = ''; continue; }
        $puffer .= $c;
    }
    if (trim($puffer) !== '') $teile[] = trim($puffer);
    return $teile;
}

// ================================================================ Frontmatter
/**
 * Trennt YAML-Frontmatter vom Rumpf.
 *
 * @return array{meta: array, rumpf: string}
 */
function pu_frontmatter(string $text): array
{
    // BOM entfernen — Obsidian schreibt keinen, ein Windows-Editor schon.
    $text = preg_replace('/^\xEF\xBB\xBF/', '', $text) ?? $text;

    if (!preg_match('/^---\r?\n(.*?)\r?\n---\r?\n?(.*)$/s', $text, $m)) {
        return ['meta' => [], 'rumpf' => $text];
    }
    return ['meta' => pu_yaml_parse($m[1]), 'rumpf' => $m[2]];
}

// ================================================================ Aufgaben
/**
 * Holt alle Aufgabenblöcke aus einem Lektionstext.
 *
 * Ein Block ist ein umzäunter Abschnitt mit der Sprachmarke `aufgabe`.
 * Er steht IN der Lektion, damit Aufgabe und Stoff zusammen wandern.
 *
 * @param string $quelle Vaultpfad der Lektion — nur für Fehlermeldungen
 * @return array<int, array> Aufgaben in Reihenfolge des Vorkommens
 * @throws RuntimeException bei ungültiger Aufgabe
 */
function pu_aufgaben_aus_text(string $text, string $quelle = ''): array
{
    if (!preg_match_all('/^```aufgabe[ \t]*\r?\n(.*?)^```[ \t]*$/ms', $text, $treffer)) {
        return [];
    }

    $aufgaben = [];
    foreach ($treffer[1] as $nr => $roh) {
        try {
            $a = pu_yaml_parse($roh);
        } catch (Throwable $e) {
            throw new RuntimeException(
                sprintf('%s, Aufgabenblock %d: %s', $quelle !== '' ? $quelle : '(Text)', $nr + 1, $e->getMessage())
            );
        }
        $a['quelle_datei'] = $quelle;
        $aufgaben[] = pu_aufgabe_pruefen($a, $quelle, $nr + 1);
    }
    return $aufgaben;
}

/**
 * Prüft eine Aufgabe auf Vollständigkeit und Plausibilität.
 *
 * Laut abbrechen ist hier richtig: der Fehler steckt im Lehrstoff, und der
 * wird beim Schreiben gemacht, nicht beim Lernen. `kurse_test.php` faehrt
 * diese Prüfung ueber den ganzen Vault — so fällt ein Tippfehler beim Test
 * auf und nicht einem Lernenden mitten in der Prüfung.
 *
 * @throws RuntimeException
 */
function pu_aufgabe_pruefen(array $a, string $quelle, int $nr): array
{
    $wo = sprintf('%s, Aufgabe %d', $quelle !== '' ? $quelle : '(Text)', $nr);

    foreach (['id', 'typ', 'titel', 'punkte'] as $pflicht) {
        if (!isset($a[$pflicht]) || $a[$pflicht] === '' || $a[$pflicht] === null) {
            throw new RuntimeException("$wo: Feld '$pflicht' fehlt.");
        }
    }

    $a['id']  = (string)$a['id'];
    $a['typ'] = (string)$a['typ'];

    if (!in_array($a['typ'], PU_TYPEN, true)) {
        throw new RuntimeException(
            "$wo: unbekannter Typ '{$a['typ']}'. Erlaubt: " . implode(', ', PU_TYPEN)
        );
    }

    $a['punkte'] = (int)$a['punkte'];
    if ($a['punkte'] < 10 || $a['punkte'] > 100) {
        throw new RuntimeException("$wo: punkte muss zwischen 10 und 100 liegen, ist {$a['punkte']}.");
    }

    if (!preg_match('/^[A-Za-z0-9][A-Za-z0-9_-]{1,31}$/', $a['id'])) {
        throw new RuntimeException("$wo: id '{$a['id']}' ist unzulässig (2-32 Zeichen, A-Z a-z 0-9 _ -).");
    }

    // Je Typ die Felder, ohne die die Bewertung nichts vergleichen kann.
    $braucht = match ($a['typ']) {
        'denkaufgabe'      => ['optionen', 'loesung'],
        'plugplay',
        'schiebe'          => ['bausteine', 'loesung'],
        'uebereinstimmung' => ['links', 'rechts', 'loesung'],
        'multitask'        => ['schritte'],
        'mathe'            => ['loesung'],
        'raeumlich'        => ['optionen', 'loesung'],
        'secret'           => ['dump', 'loesung'],
        'sicherheit'       => ['code', 'zeilen'],
        'technisch',
        'krypto'           => ['pruefer'],
        'planung'          => ['pruefungen'],
    };
    foreach ($braucht as $feld) {
        if (!isset($a[$feld])) {
            throw new RuntimeException("$wo: Typ '{$a['typ']}' braucht das Feld '$feld'.");
        }
    }

    // Eine Attrappe muss als Attrappe erkennbar sein. Ein Secret ohne die
    // Marke könnte ein echter Schlüssel sein — und genau das verbietet
    // Stufe 5, die diese Aufgaben stellt.
    if ($a['typ'] === 'secret' && !str_starts_with((string)$a['loesung'], 'PROMPTHEUS{')) {
        throw new RuntimeException("$wo: secret-Lösung muss im Format PROMPTHEUS{...} stehen.");
    }

    if ($a['typ'] === 'schiebe' || $a['typ'] === 'plugplay') {
        $bs = (array)$a['bausteine'];
        $lo = (array)$a['loesung'];
        $fehlt = array_diff($lo, $bs);
        if ($fehlt !== []) {
            throw new RuntimeException("$wo: Lösung nennt Bausteine, die es nicht gibt: " . implode(', ', $fehlt));
        }
    }

    if ($a['typ'] === 'denkaufgabe' || $a['typ'] === 'raeumlich') {
        $op = array_map('strval', (array)$a['optionen']);
        $lo = array_map('strval', (array)$a['loesung']);
        $fehlt = array_diff($lo, $op);
        if ($fehlt !== []) {
            throw new RuntimeException("$wo: Lösung nennt Optionen, die es nicht gibt: " . implode(', ', $fehlt));
        }
    }

    if ($a['typ'] === 'uebereinstimmung') {
        $links  = array_map('strval', (array)$a['links']);
        $rechts = array_map('strval', (array)$a['rechts']);
        foreach ((array)$a['loesung'] as $l => $r) {
            if (!in_array((string)$l, $links, true))  throw new RuntimeException("$wo: Lösungspaar nennt linke Seite '$l', die es nicht gibt.");
            if (!in_array((string)$r, $rechts, true)) throw new RuntimeException("$wo: Lösungspaar nennt rechte Seite '$r', die es nicht gibt.");
        }
        if (count((array)$a['loesung']) !== count($links)) {
            throw new RuntimeException("$wo: es muss zu jeder linken Seite genau ein Paar geben.");
        }
    }

    if ($a['typ'] === 'planung') {
        $summe = 0;
        foreach ((array)$a['pruefungen'] as $p) {
            if (!is_array($p) || !isset($p['art'])) throw new RuntimeException("$wo: jede Prüfung braucht eine 'art'.");
            $summe += (int)($p['punkte'] ?? 0);
        }
        if ($summe !== $a['punkte']) {
            throw new RuntimeException("$wo: Prüfungen ergeben $summe Punkte, die Aufgabe nennt {$a['punkte']}.");
        }
    }

    if ($a['typ'] === 'multitask') {
        $summe = 0;
        foreach ((array)$a['schritte'] as $i => $s) {
            if (!is_array($s) || !isset($s['typ'])) throw new RuntimeException("$wo: Schritt " . ($i+1) . " braucht einen 'typ'.");
            if (!in_array((string)$s['typ'], PU_TYPEN, true)) throw new RuntimeException("$wo: Schritt " . ($i+1) . " hat unbekannten Typ '{$s['typ']}'.");
            if ((string)$s['typ'] === 'multitask') throw new RuntimeException("$wo: ein Multitask darf keinen Multitask enthalten.");
            $summe += (int)($s['punkte'] ?? 0);
        }
        if ($summe !== $a['punkte']) {
            throw new RuntimeException("$wo: Schritte ergeben $summe Punkte, die Aufgabe nennt {$a['punkte']}.");
        }
    }

    foreach ((array)($a['hinweise'] ?? []) as $i => $h) {
        if (!is_array($h) || !isset($h['text'])) throw new RuntimeException("$wo: Hinweis " . ($i+1) . " braucht 'text'.");
        if ((int)($h['kostet'] ?? 0) < 0) throw new RuntimeException("$wo: Hinweis " . ($i+1) . " darf nicht negativ kosten.");
    }

    return $a;
}

/**
 * Entfernt aus einer Aufgabe alles, was die Antwort verrät.
 *
 * Diese Fassung — und nur diese — geht ans Frontend. Sie ist der Grund, warum
 * `brain/` ueber HTTP gesperrt ist: wäre der Vault statisch abrufbar, wäre
 * dieses Sieb wirkungslos.
 *
 * Die Bausteine werden gemischt, aber mit einem festen Keim aus der
 * Aufgabenkennung: dieselbe Aufgabe sieht bei jedem Aufruf gleich aus (sonst
 * springt die Anzeige beim Neuladen), aber nicht in der Lösungsreihenfolge.
 */
function pu_aufgabe_oeffentlich(array $a): array
{
    $geheim = ['loesung', 'hinweise', 'erklaerung', 'zeilen', 'pruefer', 'pruefungen', 'toleranz'];
    $oeff   = [];
    foreach ($a as $k => $v) {
        if (in_array($k, $geheim, true)) continue;
        $oeff[$k] = $v;
    }

    // Wie viele Hinweise es gibt und was sie kosten, darf man wissen —
    // sonst kann niemand entscheiden, ob er einen kauft.
    $oeff['hinweis_anzahl'] = count((array)($a['hinweise'] ?? []));
    $oeff['hinweis_kosten'] = array_map(
        fn($h) => (int)($h['kostet'] ?? 0),
        array_values((array)($a['hinweise'] ?? []))
    );

    // Das Mischen lässt sich uniweit abschalten (Einstellungen › Academy-Regeln).
    // Für eine Klasse, die eine Aufgabe gemeinsam am Beamer bespricht, ist
    // "die dritte Option" sonst für jeden eine andere.
    $mischen = !function_exists('pu_regel_an') || pu_regel_an('mischen');
    if ($mischen) {
        foreach (['bausteine', 'optionen', 'rechts'] as $feld) {
            if (isset($oeff[$feld]) && is_array($oeff[$feld])) {
                $oeff[$feld] = pu_mischen(array_values($oeff[$feld]), $a['id'] . $feld);
            }
        }
    }

    if ($a['typ'] === 'multitask') {
        $oeff['schritte'] = array_map(
            fn($s) => pu_aufgabe_oeffentlich(is_array($s) ? $s + ['id' => $a['id'], 'titel' => '', 'punkte' => 10] : []),
            (array)$a['schritte']
        );
    }

    return $oeff;
}

/**
 * Eine öffentliche Aufgabe als lesbarer Text — für den Tutor.
 *
 * Erwartet die **gesiebte** Fassung aus pu_aufgabe_oeffentlich(). Was hier
 * hineingegeben wird, geht an ein Sprachmodell; eine Aufgabe mit ihrem
 * `loesung`-Feld wäre die Lösung im Prompt.
 */
function pu_aufgabe_als_text(array $a): string
{
    $z = ['# ' . (string)($a['titel'] ?? ''), 'Art: ' . (string)($a['typ'] ?? '')];

    if (($a['frage'] ?? '') !== '') $z[] = (string)$a['frage'];

    foreach (['optionen' => 'Antwortmöglichkeiten', 'bausteine' => 'Bausteine',
              'links' => 'Linke Seite', 'rechts' => 'Rechte Seite'] as $feld => $wie) {
        if (empty($a[$feld]) || !is_array($a[$feld])) continue;
        $z[] = $wie . ":\n- " . implode("\n- ", array_map('strval', $a[$feld]));
    }

    if (!empty($a['schritte']) && is_array($a['schritte'])) {
        foreach (array_values($a['schritte']) as $i => $s) {
            $z[] = 'Schritt ' . ($i + 1) . ': ' . (string)($s['frage'] ?? $s['titel'] ?? '');
        }
    }

    return implode("\n\n", array_filter($z, fn($t) => trim($t) !== ''));
}

/**
 * Ein Kurs als lesbarer Text — für den Tutor.
 *
 * Damit „Was lerne ich in diesem Kurs?" beantwortbar wird. Ohne diesen Block
 * bekam das Modell die Frage ohne Gegenstand und fragte zurück; genau das war
 * die Antwort „Was willst du wissen?".
 *
 * **Nur Öffentliches.** Titel, Einleitung und die Lektionsliste mit ihren
 * Beschreibungen — dasselbe, was die Kursseite ohnehin an den Browser
 * schickt. Aufgaben, Prüfungsinhalte und Lösungen gehören nicht hierher: der
 * Tutor soll den Weg zeigen und nicht das Ziel verraten. Von der Prüfung steht
 * darum nur, **dass** es sie gibt.
 *
 * Die Einleitung wird gekürzt. Ein Kurskopf kann lang sein, und ein Prompt,
 * der bei jeder Frage denselben Aufsatz mitträgt, kostet bei jeder Frage
 * dieselben Token.
 */
function pu_kurs_als_text(array $k): string
{
    $kopf = trim((string)($k['titel'] ?? ''));
    if (($k['untertitel'] ?? '') !== '') $kopf .= ' — ' . (string)$k['untertitel'];

    $z = ['# ' . $kopf];

    $rahmen = [];
    if ((int)($k['stufe'] ?? 0) > 0)   $rahmen[] = 'Stufe ' . (int)$k['stufe'];
    if ((float)($k['dauer_h'] ?? 0) > 0) $rahmen[] = 'etwa ' . $k['dauer_h'] . ' Stunden';
    if (!empty($k['pruefung']))        $rahmen[] = 'schliesst mit einer Prüfung ab';
    if ($rahmen !== []) $z[] = implode(', ', $rahmen) . '.';

    // Der Kurskopf geht als Markdown mit, so wie er im Vault steht: ein Modell
    // liest Auszeichnung ohne Mühe, und sie herauszurechnen hiesse, die
    // Betonung wegzuwerfen, die der Autor der Lektion gesetzt hat.
    if (($k['kopf'] ?? '') !== '') {
        $z[] = "## Worum es geht\n" . mb_substr(trim((string)$k['kopf']), 0, 1500);
    }

    if (!empty($k['lektionen']) && is_array($k['lektionen'])) {
        $zeilen = [];
        foreach (array_values($k['lektionen']) as $i => $l) {
            $zeile = ($i + 1) . '. ' . (string)($l['titel'] ?? '');
            if (($l['beschreibung'] ?? '') !== '') $zeile .= ' — ' . (string)$l['beschreibung'];
            $zeilen[] = $zeile;
        }
        $z[] = "## Die Lektionen der Reihe nach\n" . implode("\n", $zeilen);
    }

    return implode("\n\n", array_filter($z, fn($t) => trim($t) !== ''));
}

/**
 * Nimmt die erste Überschrift aus gerendertem HTML.
 *
 * Der Titel steht im Frontmatter und wird von der Oberfläche als `<h1>`
 * gesetzt. Steht er im Rumpf noch einmal — und das tut er in fast jeder
 * Lektion —, erscheint er zweimal untereinander. Gemessen an
 * „Mensch oder Maschine?", das sauber doppelt dastand.
 *
 * Entfernt wird nur eine **führende** Überschrift, und nur die erste. Eine
 * `<h1>` mitten im Text ist eine Absicht des Autors und bleibt.
 */
function pu_ohne_erste_h1(string $html): string
{
    return preg_replace('#^\s*<h1[^>]*>.*?</h1>\s*#is', '', $html, 1) ?? $html;
}

/** Mischt eine Liste reproduzierbar. Gleicher Keim, gleiche Reihenfolge. */
function pu_mischen(array $liste, string $keim): array
{
    $paare = [];
    foreach ($liste as $i => $wert) {
        $paare[] = [substr(hash('sha256', $keim . '|' . $i . '|' . (is_scalar($wert) ? (string)$wert : '')), 0, 16), $wert];
    }
    usort($paare, fn($a, $b) => strcmp($a[0], $b[0]));
    return array_column($paare, 1);
}

// ================================================================ Kursindex
/**
 * Baut den Index ueber alle Kurse im Vault.
 *
 * Einmal je Anfrage, im Speicher gehalten. Kein Zwischenspeicher auf der
 * Platte: der Vault hat wenige hundert Dateien, und ein Zwischenspeicher, der
 * nach einer Kursänderung veraltet ist, kostet mehr Zeit beim Suchen des
 * Fehlers als er beim Lesen einspart.
 *
 * @return array{kurse: array, aufgaben: array, fehler: array}
 */
function pu_index(bool $neu = false): array
{
    static $index = null;
    if ($index !== null && !$neu) return $index;

    $kurse         = [];
    $aufgaben      = [];
    $pruefungs_ids = [];
    $fehler        = [];

    foreach (['10_Stufen', '20_Domaenen'] as $bereich) {
        $wurzel = PU_BRAIN . '/' . $bereich;
        if (!is_dir($wurzel)) continue;

        foreach (scandir($wurzel) ?: [] as $eintrag) {
            if ($eintrag === '.' || $eintrag === '..') continue;
            $kursdir = $wurzel . '/' . $eintrag;
            if (!is_dir($kursdir)) continue;

            $kurs = pu_kurs_lesen($bereich . '/' . $eintrag, $fehler);
            if ($kurs === null) continue;

            foreach ($kurs['lektionen'] as $lek) {
                foreach ($lek['aufgaben'] as $a) {
                    if (isset($aufgaben[$a['id']])) {
                        // Doppelte Kennung ist ein Fehler, keine Warnung:
                        // welche Aufgabe der Lernstand meint, hänge sonst an
                        // der Lesereihenfolge des Dateisystems.
                        $fehler[] = sprintf(
                            'Aufgabenkennung "%s" kommt zweimal vor: %s und %s.',
                            $a['id'], $aufgaben[$a['id']]['quelle_datei'], $a['quelle_datei']
                        );
                        continue;
                    }
                    $a['kurs']    = $kurs['pfad'];
                    $a['lektion'] = (string)$lek['pfad'];
                    $a['stufe']   = (int)($kurs['stufe'] ?? 0);
                    $aufgaben[$a['id']] = $a;
                }
            }

            // Prüfungsaufgaben kommen BEWUSST nicht in `$aufgaben`.
            //
            // Der Index ist das, was `hinweis`, `loesung_zeigen` und `abgeben`
            // erreichen können. Stuenden die Prüfungsaufgaben darin, könnte
            // jeder Lernende sich ihre Lösungen einzeln anzeigen lassen und
            // danach die Prüfung schreiben — und niemandem fiele es auf.
            //
            // Auf doppelte Kennungen müssen sie trotzdem geprueft werden:
            // sonst faende `pu_aufgabe()` eine gleichnamige Lektionsaufgabe
            // und bewertete die Prüfung gegen die falsche Lösung.
            if ($kurs['pruefung'] !== null) {
                foreach ($kurs['pruefung']['aufgaben'] as $a) {
                    if (isset($aufgaben[$a['id']]) || isset($pruefungs_ids[$a['id']])) {
                        $fehler[] = sprintf(
                            'Aufgabenkennung "%s" kommt zweimal vor: %s und %s.',
                            $a['id'],
                            $aufgaben[$a['id']]['quelle_datei'] ?? ($pruefungs_ids[$a['id']] ?? '?'),
                            $a['quelle_datei']
                        );
                        continue;
                    }
                    $pruefungs_ids[$a['id']] = $a['quelle_datei'];
                }
            }

            $kurse[$kurs['pfad']] = $kurs;
        }
    }

    // Stufenkurse nach Stufe, Domänenkurse nach Code — die Reihenfolge im
    // Menü ist die Aufstiegsreihenfolge, nicht die des Dateisystems.
    uasort($kurse, function (array $a, array $b): int {
        $sa = ($a['art'] === 'stufe') ? 0 : 1;
        $sb = ($b['art'] === 'stufe') ? 0 : 1;
        if ($sa !== $sb) return $sa <=> $sb;
        if ($sa === 0) return ((int)$a['stufe']) <=> ((int)$b['stufe']);
        return strcmp((string)$a['code'], (string)$b['code']);
    });

    $index = ['kurse' => $kurse, 'aufgaben' => $aufgaben, 'fehler' => $fehler];
    return $index;
}

/** Liest einen Kursordner: kurs.json, _index.md, Lektionen, Prüfung. */
function pu_kurs_lesen(string $rel, array &$fehler): ?array
{
    $dir = PU_BRAIN . '/' . $rel;

    $meta = [];
    if (is_file($dir . '/kurs.json')) {
        $roh = json_decode((string)file_get_contents($dir . '/kurs.json'), true);
        if (!is_array($roh)) {
            $fehler[] = "$rel/kurs.json ist kein gueltiges JSON.";
            return null;
        }
        $meta = $roh;
    } else {
        $fehler[] = "$rel: kurs.json fehlt.";
        return null;
    }

    $kopf = '';
    if (is_file($dir . '/_index.md')) {
        $fm   = pu_frontmatter((string)file_get_contents($dir . '/_index.md'));
        $kopf = $fm['rumpf'];
    }

    $lektionen = [];
    $dateien   = scandir($dir) ?: [];
    sort($dateien, SORT_NATURAL);
    foreach ($dateien as $datei) {
        if (!preg_match('/^\d+_.*\.md$/', $datei)) continue;
        $lek = pu_lektion_lesen($rel . '/' . $datei, $fehler);
        if ($lek !== null) $lektionen[] = $lek;
    }

    $pruefung = null;
    if (is_file($dir . '/pruefung.md')) {
        $pruefung = pu_lektion_lesen($rel . '/pruefung.md', $fehler);
    }

    /* Welche Art Kurs das ist.
     *
     * Der Ordner allein entscheidet es nicht mehr. Ein Kurs in `10_Stufen/`
     * ist eine **Stufe**, wenn seine Nummer in `PU_STUFEN` steht — sonst ein
     * **Zusatzkurs**, der dort mitwohnt.
     *
     * Der Grund ist der siebte Kurs. Er gehört sachlich hinter die sechs
     * Stufen und liegt deshalb in ihrem Ordner. Zählte er als Stufe, wäre er
     * Stufe 7: Die Zielkarte spräche von sieben Stufen, `pu_stufe_frei(7)`
     * suchte eine bestandene Prüfung für Stufe 6→7, und der Satz „Noch 3 von
     * 6" stimmte nirgends mehr. Die Nummer in PU_STUFEN ist die ehrlichere
     * Grenze als der Ordnername: Sie sagt, was wirklich eine Stufe mit
     * Prüfung und Urkunde ist.
     */
    $stufeNr = (int)($meta['stufe'] ?? 0);
    $art = !str_starts_with($rel, '10_Stufen/')
        ? 'domaene'
        : (isset(PU_STUFEN[$stufeNr]) ? 'stufe' : 'zusatz');

    return [
        'pfad'      => $rel,
        'art'       => $art,
        'code'      => (string)($meta['code'] ?? basename($rel)),
        'titel'     => (string)($meta['titel'] ?? basename($rel)),
        'untertitel'=> (string)($meta['untertitel'] ?? ''),
        'stufe'     => (int)($meta['stufe'] ?? 0),
        'dauer_h'   => (string)($meta['dauer_h'] ?? ''),
        'voraussetzung' => (int)($meta['voraussetzung'] ?? 0),
        'bestehen_prozent' => (int)($meta['bestehen_prozent'] ?? 60),
        'geruest'   => (bool)($meta['geruest'] ?? false),
        'kopf'      => $kopf,
        'lektionen' => $lektionen,
        'pruefung'  => $pruefung,
        'punkte_max'=> array_sum(array_map(
            fn($l) => array_sum(array_map(fn($a) => (int)$a['punkte'], $l['aufgaben'])),
            $lektionen
        )),
    ];
}

/** Liest eine Lektion: Frontmatter, Rumpf, Aufgaben. */
function pu_lektion_lesen(string $rel, array &$fehler): ?array
{
    $abs = pu_brain_pfad($rel);
    if ($abs === null || !is_file($abs)) { $fehler[] = "$rel: nicht lesbar."; return null; }

    $text = (string)file_get_contents($abs);
    $fm   = pu_frontmatter($text);

    try {
        $aufgaben = pu_aufgaben_aus_text($fm['rumpf'], $rel);
    } catch (Throwable $e) {
        $fehler[] = $e->getMessage();
        $aufgaben = [];
    }

    return [
        'pfad'     => $rel,
        'titel'    => (string)($fm['meta']['title'] ?? basename($rel, '.md')),
        'beschreibung' => (string)($fm['meta']['description'] ?? ''),
        'dauer_min'=> (int)($fm['meta']['dauer_min'] ?? 0),
        'typ'      => (string)($fm['meta']['type'] ?? 'lesson'),
        'rumpf'    => $fm['rumpf'],
        'aufgaben' => $aufgaben,
    ];
}

/** Eine Aufgabe nach Kennung — die vollständige Fassung, nur für den Server. */
function pu_aufgabe(string $id): ?array
{
    return pu_index()['aufgaben'][$id] ?? null;
}

/** Ein Kurs nach Pfad. */
function pu_kurs(string $pfad): ?array
{
    return pu_index()['kurse'][$pfad] ?? null;
}
