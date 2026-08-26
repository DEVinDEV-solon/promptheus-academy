<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Testhilfe.
 *
 * Schlicht und ohne Fremdpakete, nach dem Muster von scripts/Advocat/tests.
 * Jeder Test ist eine PHP-Datei, die diese Datei einbindet, `pruefe()` ruft
 * und am Ende `bilanz()`.
 *
 * Aufruf immer mit zugeschalteten Erweiterungen:
 *     php -d extension=pdo_sqlite -d extension=sqlite3 tests/<datei>.php
 */

$GLOBALS['pu_test'] = ['ok' => 0, 'fehler' => [], 'gruppe' => ''];

function gruppe(string $name): void
{
    $GLOBALS['pu_test']['gruppe'] = $name;
    echo "\n── $name\n";
}

function pruefe(string $was, bool $bedingung, string $zusatz = ''): void
{
    if ($bedingung) {
        $GLOBALS['pu_test']['ok']++;
        return;
    }
    $text = $GLOBALS['pu_test']['gruppe'] . ' › ' . $was . ($zusatz !== '' ? "  ($zusatz)" : '');
    $GLOBALS['pu_test']['fehler'][] = $text;
    echo "   ✕ $was" . ($zusatz !== '' ? "  ($zusatz)" : '') . "\n";
}

function gleich(string $was, $erwartet, $ist): void
{
    $ok = $erwartet === $ist;
    pruefe($was, $ok, $ok ? '' : 'erwartet ' . kurz($erwartet) . ', ist ' . kurz($ist));
}

function kurz($x): string
{
    $s = is_string($x) ? $x : var_export($x, true);
    $s = preg_replace('/\s+/', ' ', $s) ?? $s;
    return mb_strlen($s) > 120 ? mb_substr($s, 0, 117) . '…' : $s;
}

/** Erwartet, dass der Aufruf eine Ausnahme wirft. */
function wirft(string $was, callable $f, string $enthaelt = ''): void
{
    try {
        $f();
    } catch (Throwable $e) {
        if ($enthaelt !== '' && !str_contains($e->getMessage(), $enthaelt)) {
            pruefe($was, false, 'falsche Meldung: ' . $e->getMessage());
            return;
        }
        pruefe($was, true);
        return;
    }
    pruefe($was, false, 'es wurde keine Ausnahme geworfen');
}

function bilanz(): never
{
    $t = $GLOBALS['pu_test'];
    $n = count($t['fehler']);
    echo "\n" . str_repeat('─', 60) . "\n";
    if ($n === 0) {
        echo "✓ {$t['ok']} Prüfungen, alle grün.\n";
        exit(0);
    }
    echo "✕ $n von " . ($t['ok'] + $n) . " Prüfungen fehlgeschlagen:\n";
    foreach ($t['fehler'] as $f) echo "   - $f\n";
    exit(1);
}

/**
 * Eine Wegwerf-Datenbank für Tests.
 *
 * Legt PU_DB auf eine eigene Datei um, BEVOR lib.php geladen wird. Ein Test,
 * der die echte data/promptheus.db benutzt, würde die Lernstände der Klasse
 * mit Testkonten verunreinigen — und beim Aufräumen im Zweifel löschen.
 */
function test_db_vorbereiten(): string
{
    $datei = sys_get_temp_dir() . '/pu_test_' . bin2hex(random_bytes(6)) . '.db';
    putenv('PU_TEST_DB=' . $datei);
    return $datei;
}
