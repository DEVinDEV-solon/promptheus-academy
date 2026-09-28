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

/** Die Altersbänder, in denen Sprüche gehalten werden — von kindgerecht bis
 *  akademisch. Reihenfolge = Alter aufsteigend. */
const PU_MOTIVATION_BAENDER = ['grundschule', 'unterstufe', 'mittelstufe', 'oberstufe', 'erwachsen'];

/**
 * Liest die Sprüche aus dem Vault, getrennt nach Altersband.
 *
 * Erkannt wird jede Aufzählungszeile (`- …`); ihr Band ergibt sich aus der
 * zuletzt gelesenen Überschrift (enthält sie „grundschule", „unterstufe",
 * „mittelstufe", „oberstufe" oder „erwachsen"). Was unter keiner solchen
 * Überschrift steht, landet im gemeinsamen Pool „alle". Alles andere in der
 * Notiz ist Text für Menschen und wird übergangen — so kann die Notiz erklären,
 * wofür die Sprüche da sind, ohne dass die Erklärung selbst im Fenster landet.
 *
 * @return array<string,string[]>  Schlüssel: 'alle' + PU_MOTIVATION_BAENDER
 */
function pu_motivation_pools(): array
{
    static $pools = null;
    if ($pools !== null) return $pools;

    // Zwei mögliche Orte, weil der Vault einen Unterordner je Projekt bekommen
    // hat: `00_Fundament/promptheus/` ist der heutige, `00_Fundament/` der
    // frühere. Gesucht wird der erste, den es gibt.
    $datei = '';
    foreach (['/00_Fundament/promptheus/motivation.md', '/00_Fundament/motivation.md'] as $wo) {
        if (is_file(PU_BRAIN . $wo)) { $datei = PU_BRAIN . $wo; break; }
    }

    $pools = ['alle' => []];
    foreach (PU_MOTIVATION_BAENDER as $b) $pools[$b] = [];

    if ($datei !== '') {
        $roh = (string)file_get_contents($datei);
        $fm  = pu_frontmatter($roh);
        $wo  = 'alle';
        foreach (preg_split('/\r?\n/', $fm['rumpf'] !== '' ? $fm['rumpf'] : $roh) ?: [] as $zeile) {
            if (preg_match('/^#{1,6}\s*(.+)$/u', $zeile, $h)) {
                $titel = mb_strtolower($h[1]);
                $wo = 'alle';
                foreach (PU_MOTIVATION_BAENDER as $b) {
                    if (str_contains($titel, $b)) { $wo = $b; break; }
                }
                continue;
            }
            if (preg_match('/^\s*-\s+(\S.*)$/u', $zeile, $m)) {
                $satz = trim($m[1]);
                if ($satz !== '' && mb_strlen($satz) <= 160) $pools[$wo][] = $satz;
            }
        }
    }

    if ($pools['alle'] === []) $pools['alle'] = PU_MOTIVATION_FALLBACK;
    return $pools;
}

/**
 * Die Spruchliste für ein Altersband. Hat das Band einen eigenen Pool, wird nur
 * dieser genommen — ein akademischer Satz im Fenster eines Achtjährigen wäre
 * genau der Bruch, den wir vermeiden wollen. Fehlt der Pool, greift „alle".
 */
function pu_motivation_liste(string $band = ''): array
{
    $pools = pu_motivation_pools();
    if ($band !== '' && !empty($pools[$band])) return $pools[$band];
    return $pools['alle'];
}

/**
 * Einen Spruch ziehen — bei jeder Antwort einen frischen.
 *
 * **Zufall, nicht Tag-für-Tag festgelegt.** Eine frühere Fassung zeigte
 * dieselbe Aufgabe am selben Tag immer mit demselben Satz. Das war ruhig, aber
 * langweilig: Wer zehn Aufgaben löst, will nicht zehnmal dasselbe Lob. Jetzt
 * wird gezogen, und der zuletzt gezeigte Satz wird nach Möglichkeit übersprungen
 * — damit sich nichts unmittelbar wiederholt. Das Altersband wählt den Pool,
 * so klingt das Lob für die Grundschule anders als für die Oberstufe.
 *
 * @param string $band    eines aus PU_MOTIVATION_BAENDER (leer = Pool „alle")
 * @param string $ausser  der zuletzt gezeigte Satz, der vermieden werden soll
 */
function pu_motivation(string $band = '', string $ausser = ''): string
{
    $liste = pu_motivation_liste($band);
    if ($liste === []) return '';

    if ($ausser !== '' && count($liste) > 1) {
        $liste = array_values(array_filter($liste, fn($s) => $s !== $ausser));
        if ($liste === []) return $ausser;   // war der einzige — dann eben er
    }
    return $liste[random_int(0, count($liste) - 1)];
}
