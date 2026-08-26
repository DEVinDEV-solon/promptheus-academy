<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — die Kennzahlen der Kopfzeile.
 *
 * Seit das Menü links steht, ist die Kopfzeile frei. Sie trägt jetzt Zahlen,
 * und zwar je nach Ebene andere: eine Schülerin will ihre Punkte sehen, eine
 * Lehrkraft ihre Klasse, die Verwaltung offene Abos und den Token-Verbrauch.
 *
 * Warum das hier in PHP steht und nicht im JavaScript:
 *
 *   1. **Prüfbar.** `tests/schale_test.php` kann eine Ebene bauen und
 *      nachsehen, was oben steht. Eine Zahl, die nur im Browser entsteht,
 *      lässt sich nur im Browser prüfen.
 *   2. **Ohne Flackern.** Die Werte stehen schon im HTML. Kämen sie per
 *      Nachladen, stünde die Leiste beim ersten Anblick leer.
 *   3. **Ein Ort.** Wer eine Kennzahl hinzufügt, ändert diese Datei — nicht
 *      das Markup und das Skript und die Übersetzung.
 *
 * **Nicht die Ebene entscheidet, sondern das Recht.** Dieselbe Regel wie im
 * Menü: wer `klassen.view` bekommt, sieht die Klassenzahlen, auch wenn die
 * Rechte-Matrix von der Vorgabe abweicht.
 */

require_once __DIR__ . '/rechte.php';
require_once __DIR__ . '/punkte.php';

/**
 * Grosse Zahlen kurz.
 *
 * In einer Kopfzeile ist „2.400.000" eine Wand. Ab einer Million wird
 * gerundet — die genaue Zahl steht im Cockpit, hier zählt die Grössenordnung.
 */
function pu_kurzzahl(int $n): string
{
    if ($n < 0)        return '−' . pu_kurzzahl(-$n);
    if ($n < 10000)    return number_format($n, 0, ',', '.');
    if ($n < 1000000)  return number_format($n / 1000, ($n < 100000 ? 1 : 0), ',', '.') . 'k';
    return number_format($n / 1000000, 1, ',', '.') . ' Mio';
}

/**
 * Wie weit reicht der Blick dieses Kontos?
 *
 * Eine Lehrkraft sieht ihre Gruppe, die Verwaltung die ganze Academy. Der
 * Unterschied hängt an `schulen.manage` — wer Schulen verwalten darf, zählt
 * über alle; wer nur `klassen.view` hat, zählt die eigene Gruppe.
 *
 * Ohne eigene Gruppe zählt auch eine Lehrkraft über alle: eine leere Gruppe
 * als Filter ergäbe eine leere Klasse, und eine Null in der Kopfzeile, die
 * nur an einem fehlenden Feld liegt, ist schlimmer als keine Zahl.
 */
function pu_kennzahl_umfang(array $wer): array
{
    $gruppe = trim((string)($wer['gruppe'] ?? ''));

    if (pu_recht_hat('schulen.manage', $wer) || $gruppe === '') {
        return ['wo' => '1=1', 'werte' => [], 'wort' => 'Academy'];
    }
    return ['wo' => 'gruppe = ?', 'werte' => [$gruppe], 'wort' => $gruppe];
}

/** Eine Zeile für die Kopfzeile. */
function pu_kennzahl(string $schluessel, string $wert, string $kurz,
                     string $titel, string $ton = 'normal', bool $live = false): array
{
    return ['schluessel' => $schluessel, 'wert' => $wert, 'kurz' => $kurz,
            'titel' => $titel, 'ton' => $ton, 'live' => $live];
}

/**
 * Die Kennzahlen für ein Konto, in der Reihenfolge, in der sie oben stehen.
 *
 * `live` markiert die drei, die sich während des Lernens ändern: die schreibt
 * `PU.standSetzen()` nach jeder Abgabe neu. Alle anderen stehen fest, bis die
 * Seite neu geladen wird — eine Kopfzeile, die im Sekundentakt die Zahl der
 * Konten nachrechnet, kostet Abfragen ohne Nutzen.
 */
function pu_kennzahlen(array $wer): array
{
    $id  = (int)($wer['id'] ?? 0);
    $pdo = pu_db();
    $aus = [];

    // ---------------------------------------------------------- Der eigene Stand
    // Den hat jede Ebene. Auch eine Verwaltung lernt — und wenn nicht, steht
    // dort eben eine Null, die ehrlich ist.
    $konto = pu_konto($id);
    $serie = pu_serie($id);

    $aus[] = pu_kennzahl('punkte', (string)$konto['summe'], 'Punkte',
                         'Deine Punkte', 'gold', true);
    $aus[] = pu_kennzahl('titel', (string)$konto['titel'], 'Titel',
                         'Dein Titel — er wächst mit den Punkten', 'normal', true);
    $aus[] = pu_kennzahl('serie', '🔥 ' . (int)$serie['tage'], 'Serie',
                         'Tage in Folge gelernt', 'glut', true);

    // ---------------------------------------------------------- Klasse und Schule
    if (pu_recht_hat('klassen.view', $wer)) {
        $u = pu_kennzahl_umfang($wer);

        $st = $pdo->prepare("SELECT COUNT(*) FROM lernende WHERE {$u['wo']}");
        $st->execute($u['werte']);
        $lernende = (int)$st->fetchColumn();

        // Wer heute schon etwas abgegeben hat. Das ist die eine Zahl, die eine
        // Lehrkraft am Morgen wirklich wissen will.
        $st = $pdo->prepare(
            "SELECT COUNT(DISTINCT v.lernender) FROM versuche v
             JOIN lernende l ON l.id = v.lernender
             WHERE substr(v.zeitpunkt, 1, 10) = ? AND {$u['wo']}");
        $st->execute(array_merge([pu_heute()], $u['werte']));
        $heute = (int)$st->fetchColumn();

        $aus[] = pu_kennzahl('lernende', (string)$lernende, $u['wort'],
                             'Konten in ' . $u['wort'], 'lapis');
        $aus[] = pu_kennzahl('heute', $heute . ' / ' . $lernende, 'Heute aktiv',
                             'So viele haben heute mindestens eine Aufgabe abgegeben',
                             $heute > 0 ? 'gut' : 'normal');
    }

    // ---------------------------------------------------------- Plan und Token
    // `abo.bestaetigen` steht bewusst nicht mit in der Bedingung: wer nur
    // bestätigen darf, aber nicht verwaltet, bekommt die offenen Abos trotzdem
    // zu sehen — es ist genau seine Arbeit.
    if (pu_recht_hat('abo.verwalten', $wer) || pu_recht_hat('abo.bestaetigen', $wer)) {
        $offen = (int)$pdo->query(
            'SELECT COUNT(*) FROM abos WHERE laeuft = 1 AND bestaetigt = 0')->fetchColumn();

        $st = $pdo->prepare(
            "SELECT COALESCE(SUM(-tokens), 0) FROM token_buchungen
             WHERE art = 'verbrauch' AND tag >= ?");
        $st->execute([date('Y-m-01')]);
        $monat = (int)$st->fetchColumn();

        $aus[] = pu_kennzahl('abos_offen', (string)$offen, 'Abos offen',
                             $offen > 0
                                 ? 'So viele Abos warten auf eine Bestätigung'
                                 : 'Kein Abo wartet auf eine Bestätigung',
                             $offen > 0 ? 'warn' : 'normal');
        $aus[] = pu_kennzahl('token_monat', pu_kurzzahl($monat), 'Token im Monat',
                             'Verbrauch seit dem Monatsersten — gemessen und geschätzt zusammen',
                             'lapis');
    }

    return $aus;
}
