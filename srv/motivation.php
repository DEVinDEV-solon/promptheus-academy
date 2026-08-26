<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Motivationssprüche für das Lob-Fenster.
 *
 * Die Sprüche stehen im Vault (`brain/00_Fundament/motivation.md`) und nicht
 * im Code: ein Tutor, der seiner Klasse eigene Sätze geben will, soll eine
 * Notiz bearbeiten und nicht PHP. Fehlt die Notiz, greift die Liste hier —
 * die Academy bleibt benutzbar, auch wenn jemand im Vault aufgeräumt hat.
 *
 * Kein Sprachmodell. Ein Lob, das erst nach zwei Sekunden Wartezeit erscheint
 * und bei fehlender CLI ganz ausbleibt, wäre kein Lob.
 */

/** Die Notfall-Liste. Kurz, konkret, ohne Ausrufezeichenhagel. */
const PU_MOTIVATION_FALLBACK = [
    'Gut gedacht. Genau so entsteht Können.',
    'Das war kein Glück — das war Verstehen.',
    'Wer eine Frage löst, hat schon die nächste verdient.',
    'Der Funke ist da. Halte ihn am Brennen.',
    'Richtig. Und beim nächsten Mal geht es schneller.',
    'Du hast das Muster erkannt. Das ist die halbe Wissenschaft.',
    'Feuer entsteht durch Reibung. Weiter reiben.',
    'Ein Schritt mehr als gestern. Mehr braucht es nicht.',
];

/**
 * Liest die Sprüche aus dem Vault.
 *
 * Erkannt wird jede Aufzählungszeile (`- …`) unterhalb der Überschrift. Alles
 * andere in der Notiz ist Text für Menschen und wird übergangen — so kann die
 * Notiz erklären, wofür die Sprüche da sind, ohne dass die Erklärung selbst
 * als Spruch im Fenster landet.
 */
function pu_motivation_liste(): array
{
    static $liste = null;
    if ($liste !== null) return $liste;

    // Zwei mögliche Orte, weil der Vault einen Unterordner je Projekt bekommen
    // hat: `00_Fundament/promptheus/` ist der heutige, `00_Fundament/` der
    // frühere. Gesucht wird der erste, den es gibt.
    $datei = '';
    foreach (['/00_Fundament/promptheus/motivation.md', '/00_Fundament/motivation.md'] as $wo) {
        if (is_file(PU_BRAIN . $wo)) { $datei = PU_BRAIN . $wo; break; }
    }
    $aus = [];

    if ($datei !== '') {
        $roh = (string)file_get_contents($datei);
        $fm  = pu_frontmatter($roh);
        foreach (preg_split('/\r?\n/', $fm['rumpf'] !== '' ? $fm['rumpf'] : $roh) ?: [] as $zeile) {
            if (preg_match('/^\s*-\s+(\S.*)$/u', $zeile, $m)) {
                $satz = trim($m[1]);
                if ($satz !== '' && mb_strlen($satz) <= 160) $aus[] = $satz;
            }
        }
    }

    return $liste = ($aus !== [] ? $aus : PU_MOTIVATION_FALLBACK);
}

/**
 * Einen Spruch ziehen.
 *
 * Der Keim ist die Aufgabenkennung plus der Tag: dieselbe Aufgabe zweimal am
 * selben Tag zeigt denselben Satz (sonst wirkte das Fenster wie ein
 * Glücksrad), morgen einen anderen.
 */
function pu_motivation(string $keim): string
{
    $liste = pu_motivation_liste();
    $zahl  = hexdec(substr(hash('sha256', $keim . '|' . pu_heute()), 0, 6));
    return $liste[$zahl % count($liste)];
}
