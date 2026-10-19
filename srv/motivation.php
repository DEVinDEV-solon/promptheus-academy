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

/** Die Zielgruppen, in denen Sprüche gehalten werden: fünf Altersbänder von
 *  kindgerecht bis akademisch, dann die drei Rollen der Erwachsenen, die nicht
 *  selbst Lernende sind. Reihenfolge zählt beim Lesen der Überschriften:
 *  „grundschule" muss vor „schule" geprüft werden. */
const PU_MOTIVATION_BAENDER = ['grundschule', 'unterstufe', 'mittelstufe', 'oberstufe', 'erwachsen',
                               'eltern', 'lehrkraft', 'schule'];

/** Die Rollen-Gruppen. Fehlt ihnen ein eigener Pool, sprechen sie wie Erwachsene. */
const PU_MOTIVATION_ROLLEN = ['eltern', 'lehrkraft', 'schule'];

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
    if (in_array($band, PU_MOTIVATION_ROLLEN, true) && !empty($pools['erwachsen'])) return $pools['erwachsen'];
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

// ================================================================ Titel

/** Wenn die Notiz fehlt: ein Titel, der für jede Gruppe und jede Aufgabe passt. */
const PU_LOBTITEL_FALLBACK = ['Genau richtig', 'Richtig gelöst', 'Treffer', 'Sauber gelöst'];

/** Die beiden Register der Aufgabenart-Titel. Kinder: Grundschule und Unterstufe. */
function pu_lobtitel_register(string $gruppe): string
{
    return in_array($gruppe, ['grundschule', 'unterstufe'], true) ? 'kinder' : 'gross';
}

/**
 * Liest die Titel aus `lob-titel.md` (Formel 2: geteilt plus spezifisch).
 *
 * `kern[<gruppe>]` sind die Titel je Zielgruppe, `art[<typ>][kinder|gross]` die
 * je Aufgabenart. Eine Überschrift mit „Kern“ und einem Gruppennamen beginnt
 * einen Kern-Pool, eine mit „Aufgabenart“ und dem Typ in Klammern einen
 * Art-Pool. Jede andere Überschrift beendet den Pool — so bleiben Aufzählungen
 * in erklärenden Abschnitten der Notiz draussen.
 *
 * @return array{kern: array<string,string[]>, art: array<string,array<string,string[]>>}
 */
function pu_lobtitel_pools(): array
{
    static $pools = null;
    if ($pools !== null) return $pools;

    $pools = ['kern' => [], 'art' => []];
    $datei = '';
    foreach (['/00_Fundament/promptheus/lob-titel.md', '/00_Fundament/lob-titel.md'] as $wo) {
        if (is_file(PU_BRAIN . $wo)) { $datei = PU_BRAIN . $wo; break; }
    }
    if ($datei === '') return $pools;

    $roh = (string)file_get_contents($datei);
    $fm  = pu_frontmatter($roh);
    $ziel = null;   // Verweis auf den Pool, in den gerade gelesen wird
    foreach (preg_split('/\r?\n/', $fm['rumpf'] !== '' ? $fm['rumpf'] : $roh) ?: [] as $zeile) {
        if (preg_match('/^#{1,6}\s*(.+)$/u', $zeile, $h)) {
            unset($ziel);
            $ziel  = null;
            $titel = mb_strtolower($h[1]);
            if (str_contains($titel, 'aufgabenart') && preg_match('/\(([a-z]+)\)/', $titel, $t)
                && in_array($t[1], PU_TYPEN, true)) {
                $reg = str_contains($titel, 'kinder') ? 'kinder' : 'gross';
                $pools['art'][$t[1]][$reg] ??= [];
                $ziel = &$pools['art'][$t[1]][$reg];
            } elseif (str_contains($titel, 'kern')) {
                foreach (PU_MOTIVATION_BAENDER as $b) {
                    if (str_contains($titel, $b)) {
                        $pools['kern'][$b] ??= [];
                        $ziel = &$pools['kern'][$b];
                        break;
                    }
                }
            }
            continue;
        }
        if ($ziel !== null && preg_match('/^\s*-\s+(\S.*)$/u', $zeile, $m)) {
            $t = trim($m[1]);
            if ($t !== '' && mb_strlen($t) <= 40 && !in_array($t, $ziel, true)) $ziel[] = $t;
        }
    }
    unset($ziel);
    return $pools;
}

/**
 * Einen Titel ziehen — konditioniert auf Person und Aufgabe (Formel 3).
 *
 * Kandidaten sind der Kern der Zielgruppe und der Kopf der Aufgabenart im
 * passenden Register, zusammen in einem Topf. Fehlt der Kern einer Rollen-Gruppe,
 * gilt der Erwachsenen-Kern; fehlt alles, die kleine Liste im Code. Der zuletzt
 * gezeigte Titel wird übersprungen.
 *
 * @param string $gruppe  eine aus PU_MOTIVATION_BAENDER
 * @param string $typ     der Aufgabentyp (PU_TYPEN), leer = nur Kern
 * @param string $ausser  der zuletzt gezeigte Titel
 */
function pu_lobtitel(string $gruppe, string $typ = '', string $ausser = ''): string
{
    $pools = pu_lobtitel_pools();
    $kern  = $pools['kern'][$gruppe] ?? [];
    if ($kern === [] && in_array($gruppe, PU_MOTIVATION_ROLLEN, true)) $kern = $pools['kern']['erwachsen'] ?? [];
    if ($kern === [] && !isset($pools['kern'][$gruppe])) $kern = $pools['kern']['mittelstufe'] ?? [];
    $art   = $pools['art'][$typ][pu_lobtitel_register($gruppe)] ?? [];

    $liste = array_values(array_unique(array_merge($kern, $art)));
    if ($liste === []) $liste = PU_LOBTITEL_FALLBACK;

    if ($ausser !== '' && count($liste) > 1) {
        $liste = array_values(array_filter($liste, fn($s) => $s !== $ausser));
    }
    return $liste[random_int(0, count($liste) - 1)];
}
