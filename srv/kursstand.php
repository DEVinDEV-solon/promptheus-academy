<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — „Wie weit bin ich?" für einen einzelnen Kurs.
 *
 * Die Fragen neben der Lektion — *Wie weit bin ich schon? Wo war ich stark?
 * Was fehlt noch?* — beantwortet **die Datenbank**, kein Sprachmodell.
 *
 * Das ist keine Sparsamkeit, sondern der Kern der Sache: Es geht um Zahlen
 * über die eigene Arbeit. Ein Modell würde sie erfinden können, und ein
 * Lernender, der einmal gemerkt hat, dass die Academy ihm etwas Falsches über
 * seinen eigenen Stand erzählt, glaubt ihr nichts mehr. Der Tutor daneben
 * darf reden; hier wird gezählt.
 *
 * **„Stark" heisst hier etwas Bestimmtes:** beim *ersten* Versuch richtig,
 * ohne Hinweis und ohne Musterlösung. Alles andere wäre geschmeichelt —
 * und ein Lob, das jeder bekommt, ist keins.
 */

/**
 * Der Stand eines Lernenden in genau einem Kurs.
 *
 * Liefert Zahlen, keine Sätze. Formuliert wird in der Oberfläche
 * (`assets/kursstand.js`) — dort steht auch, in welchem Ton.
 */
function pu_kurs_stand(int $lernender, string $pfad): array
{
    require_once PU_ROOT . '/srv/kurse.php';
    require_once PU_ROOT . '/srv/punkte.php';

    $k = pu_kurs($pfad);
    if ($k === null) throw new RuntimeException('Diesen Kurs gibt es nicht.');

    // ---------------------------------------------------------- Aufgaben sammeln
    $alle    = [];      // id => ['titel','typ','punkte','lektion','lektion_titel','nr']
    $lektion = [];

    foreach ($k['lektionen'] as $i => $l) {
        $ids = [];
        foreach ($l['aufgaben'] as $a) {
            $alle[(string)$a['id']] = [
                'titel'         => (string)$a['titel'],
                'typ'           => (string)$a['typ'],
                'punkte'        => (int)$a['punkte'],
                'lektion'       => (string)$l['pfad'],
                'lektion_titel' => (string)$l['titel'],
                'nr'            => $i + 1,
            ];
            $ids[] = (string)$a['id'];
        }
        $lektion[] = [
            'pfad' => (string)$l['pfad'], 'titel' => (string)$l['titel'],
            'nr' => $i + 1, 'ids' => $ids,
        ];
    }

    if ($alle === []) {
        return [
            'kurs' => ['pfad' => $k['pfad'], 'titel' => $k['titel'],
                       'art' => $k['art'], 'stufe' => (int)$k['stufe']],
            'leer' => true, 'lektionen' => [], 'offene' => [], 'stark' => [],
            'aufgaben_ges' => 0, 'geloest' => 0, 'prozent' => 0,
            'punkte' => 0, 'punkte_moeglich' => 0,
            'naechster_schritt' => null, 'zuletzt' => null,
        ];
    }

    // ---------------------------------------------------------- Versuche holen
    //
    // Ein Rutsch für den ganzen Kurs statt einer Abfrage je Aufgabe: bei
    // 47 Aufgaben wären das 47 Wege zur Platte, für dieselbe Antwort.
    $platz = implode(',', array_fill(0, count($alle), '?'));
    $st = pu_db()->prepare(
        "SELECT aufgabe_id,
                MAX(richtig)                                   AS je_richtig,
                MAX(punkte)                                    AS best,
                COUNT(*)                                       AS versuche,
                MAX(zeitpunkt)                                 AS zuletzt,
                MAX(id)                                        AS letzte_id
         FROM versuche
         WHERE lernender = ? AND aufgabe_id IN ($platz)
         GROUP BY aufgabe_id"
    );
    $st->execute(array_merge([$lernender], array_keys($alle)));

    $stand = [];
    foreach ($st->fetchAll() as $r) {
        $stand[(string)$r['aufgabe_id']] = [
            'richtig'  => ((int)$r['je_richtig']) === 1,
            'punkte'   => (int)$r['best'],
            'versuche' => (int)$r['versuche'],
            'zuletzt'  => (string)$r['zuletzt'],
            'letzte_id'=> (int)$r['letzte_id'],
        ];
    }

    // Der jeweils ERSTE Versuch je Aufgabe — für die Frage nach der Stärke.
    $erste = [];
    $st2 = pu_db()->prepare(
        "SELECT v.aufgabe_id, v.richtig, v.hinweise, v.loesung_ges, v.dauer_s
         FROM versuche v
         JOIN (SELECT aufgabe_id, MIN(id) AS erste FROM versuche
               WHERE lernender = ? AND aufgabe_id IN ($platz)
               GROUP BY aufgabe_id) f ON f.erste = v.id"
    );
    $st2->execute(array_merge([$lernender], array_keys($alle)));
    foreach ($st2->fetchAll() as $r) {
        $erste[(string)$r['aufgabe_id']] = [
            'richtig' => ((int)$r['richtig']) === 1,
            'sauber'  => ((int)$r['richtig']) === 1
                         && (int)$r['hinweise'] === 0 && (int)$r['loesung_ges'] === 0,
            'dauer'   => (int)$r['dauer_s'],
        ];
    }

    // ---------------------------------------------------------- Zusammenzählen
    $geloest = 0; $punkte = 0; $moeglich = 0;
    $offene  = []; $starkTyp = []; $zuletzt = null;

    foreach ($alle as $id => $a) {
        $moeglich += $a['punkte'];
        $s = $stand[$id] ?? null;

        if ($s !== null && $s['richtig']) {
            $geloest++;
            $punkte += $s['punkte'];
        } else {
            $offene[] = [
                'id' => $id, 'titel' => $a['titel'], 'typ' => $a['typ'],
                'punkte' => $a['punkte'], 'lektion' => $a['lektion'],
                'lektion_titel' => $a['lektion_titel'], 'nr' => $a['nr'],
                // Angefangen und nicht geschafft ist etwas anderes als nie
                // angefasst — die Oberfläche sagt es unterschiedlich.
                'versucht' => $s !== null,
            ];
        }

        // Verglichen wird die laufende Nummer, nicht der Zeitstempel: zwei
        // Abgaben in derselben Sekunde tragen dieselbe Zeit, und dann wäre
        // „zuletzt" eine Frage der Sortierreihenfolge statt der Wahrheit.
        if ($s !== null && ($zuletzt === null || $s['letzte_id'] > $zuletzt['id'])) {
            $zuletzt = ['id' => $s['letzte_id'], 'zeit' => $s['zuletzt'],
                        'lektion' => $a['lektion'],
                        'lektion_titel' => $a['lektion_titel'], 'nr' => $a['nr']];
        }

        $e = $erste[$id] ?? null;
        if ($e === null) continue;

        if (!isset($starkTyp[$a['typ']])) $starkTyp[$a['typ']] = ['sauber' => 0, 'gesamt' => 0];
        $starkTyp[$a['typ']]['gesamt']++;
        if ($e['sauber']) $starkTyp[$a['typ']]['sauber']++;
    }

    // ---------------------------------------------------------- Stärken
    //
    // Erst ab zwei Aufgabenblöcken derselben Sorte: aus einer einzigen
    // richtigen Antwort eine „Stärke" zu machen, wäre eine Behauptung.
    $stark = [];
    foreach ($starkTyp as $typ => $z) {
        if ($z['gesamt'] < 2 || $z['sauber'] === 0) continue;
        $stark[] = [
            'typ'     => $typ,
            'sauber'  => $z['sauber'],
            'gesamt'  => $z['gesamt'],
            'prozent' => (int)round($z['sauber'] * 100 / $z['gesamt']),
        ];
    }
    usort($stark, fn($a, $b) => [$b['prozent'], $b['gesamt']] <=> [$a['prozent'], $a['gesamt']]);

    // ---------------------------------------------------------- Lektionen
    $lekAus = [];
    foreach ($lektion as $l) {
        $ges = count($l['ids']);
        $ok  = 0;
        foreach ($l['ids'] as $id) if (!empty($stand[$id]['richtig'])) $ok++;
        $lekAus[] = [
            'pfad' => $l['pfad'], 'titel' => $l['titel'], 'nr' => $l['nr'],
            'aufgaben' => $ges, 'geloest' => $ok,
            'fertig' => $ges > 0 && $ok === $ges,
            'angefangen' => $ok > 0,
        ];
    }

    // ---------------------------------------------------------- Nächster Schritt
    //
    // Genau EIN Vorschlag, nie eine Liste zum Aussuchen. Wer fragt, was als
    // Nächstes dran ist, will keine zweite Entscheidung.
    $naechster = null;
    foreach ($lekAus as $l) {
        if ($l['aufgaben'] > 0 && !$l['fertig']) {
            $naechster = [
                'art' => 'lektion', 'pfad' => $l['pfad'], 'titel' => $l['titel'],
                'nr' => $l['nr'], 'offen' => $l['aufgaben'] - $l['geloest'],
                'angefangen' => $l['angefangen'],
            ];
            break;
        }
    }
    if ($naechster === null && $k['pruefung'] !== null) {
        $naechster = ['art' => 'pruefung', 'pfad' => $k['pfad'],
                      'titel' => (string)$k['pruefung']['titel'], 'nr' => 0, 'offen' => 0];
    }
    if ($naechster === null) {
        $naechster = ['art' => 'fertig', 'pfad' => $k['pfad'],
                      'titel' => $k['titel'], 'nr' => 0, 'offen' => 0];
    }

    return [
        'kurs' => ['pfad' => $k['pfad'], 'titel' => $k['titel'],
                   'art' => $k['art'], 'stufe' => (int)$k['stufe']],
        'leer'             => false,
        'aufgaben_ges'     => count($alle),
        'geloest'          => $geloest,
        'prozent'          => (int)round($geloest * 100 / max(1, count($alle))),
        'punkte'           => $punkte,
        'punkte_moeglich'  => $moeglich,
        'lektionen'        => $lekAus,
        'offene'           => array_slice($offene, 0, 6),
        'offene_ges'       => count($offene),
        'stark'            => array_slice($stark, 0, 3),
        'naechster_schritt' => $naechster,
        'zuletzt'          => $zuletzt,
        'serie'            => pu_serie($lernender)['tage'] ?? 0,
    ];
}
