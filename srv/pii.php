<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — keine persönlichen Angaben in der Gemeinde (K-PII, Runde 3b).
 *
 * „Kinder machen gerne Blödsinn“ (User, 27.09.2026). Namen, Orte, Alter,
 * Geburtstage, Telefonnummern, Klassen, Schlüssel, Kartennummern werden zu
 * „xxx“; die Academy zeigt dazu beim Tippen eine rot umrandete Verbotsregel.
 * Der Server prüft **noch einmal** — was die Academy tut, ist Hilfe, was hier
 * geschieht, ist Sicherung.
 *
 * **Ein Regelwerk, zwei Auslegungen.** Die Regeln stehen in
 * `pii_regeln.json`; die Academy hat eine wortgleiche Kopie und legt sie in
 * PHP und JavaScript aus. Jede Regel trägt Beispiele, die beide Seiten im
 * Test nachrechnen.
 *
 * Zwei Arten:
 *   - `hart`  — eindeutig (Telefon, E-Mail, Schlüssel …): immer ersetzen.
 *   - `weich` — nach Liste (Vornamen, Orte): kann auch ein Wort sein, das
 *     zufällig so heisst. In Texten wird ersetzt; in Paketen (Code) wird nur
 *     gemeldet, ein Mensch entscheidet.
 *
 * Gespeichert wird von einem Treffer nie der Wert, nur das Regel-Kürzel.
 */

const PU_PII_DATEI = __DIR__ . '/pii_regeln.json';

/**
 * Die Regeln, übersetzt in PCRE. Einmal je Aufruf.
 *
 * @return array{ersatz:string, regeln:list<array{id:string, art:string, titel:string, text:string,
 *               regex:string, ersetze:int, pruefung:string}>}
 */
function pu_pii_regeln(): array
{
    static $fertig = null;
    if ($fertig !== null) {
        return $fertig;
    }
    $j = json_decode((string)file_get_contents(PU_PII_DATEI), true, 512, JSON_THROW_ON_ERROR);
    $regeln = [];
    foreach ($j['regeln'] as $r) {
        if (isset($r['liste'])) {
            $woerter = array_map(static fn($w) => preg_quote((string)$w, '~'), $j['listen'][$r['liste']] ?? []);
            usort($woerter, static fn($a, $b) => strlen($b) <=> strlen($a));   // längste zuerst
            $muster = '(?<![\p{L}\p{N}_])(?:' . implode('|', $woerter) . ')(?![\p{L}\p{N}_])';
            $schalter = 'u';
        } else {
            $muster = (string)$r['muster'];
            $schalter = (string)($r['schalter'] ?? 'u');
        }
        if (str_contains($muster, '~') || preg_match('/[^imsu]/', $schalter)) {
            throw new RuntimeException('PII-Regel ' . $r['id'] . ': Muster oder Schalter nicht erlaubt.');
        }
        $regex = '~' . $muster . '~' . $schalter;
        if (@preg_match($regex, '') === false) {
            throw new RuntimeException('PII-Regel ' . $r['id'] . ' lässt sich nicht übersetzen.');
        }
        $regeln[] = [
            'id' => (string)$r['id'], 'art' => (string)$r['art'], 'titel' => (string)$r['titel'],
            'text' => (string)$r['text'], 'regex' => $regex, 'ersetze' => (int)($r['ersetze'] ?? 0),
            'pruefung' => (string)($r['pruefung'] ?? ''),
        ];
    }
    return $fertig = ['ersatz' => (string)$j['ersatz'], 'regeln' => $regeln];
}

/** Luhn-Prüfung für Kartennummern (nur Ziffern zählen). */
function pu_pii_luhn(string $zahl): bool
{
    $ziffern = preg_replace('/\D/', '', $zahl) ?? '';
    if (strlen($ziffern) < 13) {
        return false;
    }
    $summe = 0;
    $doppelt = false;
    for ($i = strlen($ziffern) - 1; $i >= 0; $i--) {
        $d = (int)$ziffern[$i];
        if ($doppelt) {
            $d *= 2;
            if ($d > 9) {
                $d -= 9;
            }
        }
        $summe += $d;
        $doppelt = !$doppelt;
    }
    return $summe % 10 === 0;
}

/**
 * Prüft einen Text. Gibt den Text mit „xxx“ an jeder Fundstelle zurück und
 * die Liste der Treffer (Regel, Titel, Erklärung — nie der Wert).
 *
 * `$nur_hart`: weiche Regeln (Listen) nicht ersetzen, nur melden.
 *
 * @return array{text:string, treffer:list<array{regel:string, art:string, titel:string, text:string}>, hart:bool}
 */
function pu_pii_pruefen(string $text, bool $nur_hart = false): array
{
    if (!mb_check_encoding($text, 'UTF-8')) {
        $text = mb_convert_encoding($text, 'UTF-8', 'UTF-8');
    }
    $r = pu_pii_regeln();
    $stellen = [];   // [von, bis] in Byte
    $treffer = [];
    foreach ($r['regeln'] as $regel) {
        if (!preg_match_all($regel['regex'], $text, $alle, PREG_SET_ORDER | PREG_OFFSET_CAPTURE)) {
            continue;
        }
        foreach ($alle as $m) {
            $g = $m[$regel['ersetze']] ?? $m[0];
            if (!is_array($g) || $g[1] < 0 || $g[0] === '') {
                continue;
            }
            if ($regel['pruefung'] === 'luhn' && !pu_pii_luhn($g[0])) {
                continue;
            }
            $treffer[$regel['id']] = ['regel' => $regel['id'], 'art' => $regel['art'],
                                      'titel' => $regel['titel'], 'text' => $regel['text']];
            if (!$nur_hart || $regel['art'] === 'hart') {
                $stellen[] = [$g[1], $g[1] + strlen($g[0])];
            }
        }
    }
    // Überlappende Stellen zusammenlegen, dann von hinten ersetzen.
    usort($stellen, static fn($a, $b) => $a[0] <=> $b[0] ?: $b[1] <=> $a[1]);
    $zusammen = [];
    foreach ($stellen as $s) {
        $n = count($zusammen);
        if ($n > 0 && $s[0] <= $zusammen[$n - 1][1]) {
            $zusammen[$n - 1][1] = max($zusammen[$n - 1][1], $s[1]);
        } else {
            $zusammen[] = $s;
        }
    }
    for ($i = count($zusammen) - 1; $i >= 0; $i--) {
        [$von, $bis] = $zusammen[$i];
        $text = substr($text, 0, $von) . $r['ersatz'] . substr($text, $bis);
    }
    $liste = array_values($treffer);
    return ['text' => $text, 'treffer' => $liste,
            'hart' => array_filter($liste, static fn($t) => $t['art'] === 'hart') !== []];
}

/** Nur der bereinigte Text. */
function pu_pii_maskieren(string $text): string
{
    return pu_pii_pruefen($text)['text'];
}

/** Nur die Regel-Kürzel der Treffer — das, was gespeichert werden darf. */
function pu_pii_kuerzel(array $pruefung): array
{
    return array_column($pruefung['treffer'], 'regel');
}
