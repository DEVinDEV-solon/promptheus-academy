<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Punkte, Serie (Streak), Titel.
 *
 * Alles deterministisch. Zwei Entscheidungen tragen den Rest:
 *
 *   1. **Gezählt wird der beste Versuch je Aufgabe, nicht die Summe.**
 *      Sonst wäre die günstigste Lernstrategie, dieselbe Aufgabe zwanzigmal
 *      zu lösen — und die Punktzahl sägte am eigenen Zweck.
 *
 *   2. **Der Tageswechsel ist Ortszeit.** In UTC risse die Serie eines
 *      Lernenden im Sommer abends um zwei, an einem Tag, an dem er gelernt
 *      hat. Das wäre kein Rundungsfehler, sondern eine falsche Auskunft
 *      ueber seine Leistung.
 */

require_once __DIR__ . '/einstellungen.php';

/**
 * Punkte für einen bewerteten Versuch.
 *
 * @param array $bewertung Ergebnis aus pu_bewerten()
 * @param int   $hinweise  wie viele Hinweise gekauft wurden
 * @param bool  $loesung   wurde die Musterlösung angezeigt?
 * @param int   $dauer_s   Bearbeitungsdauer
 * @param array $a         die Aufgabe (für Hinweiskosten und Richtzeit)
 */
function pu_punkte_rechnen(array $bewertung, int $hinweise, bool $loesung, int $dauer_s, array $a): array
{
    $roh = (int)$bewertung['punkte'];

    // Wer sich die Lösung zeigen lässt, bekommt null Punkte — aber der Stoff
    // bleibt. Das ist der Sinn des Knopfes: weiterkommen ohne zu verhungern.
    if ($loesung) {
        return ['punkte' => 0, 'abzug' => $roh, 'bonus' => 0, 'grund' => 'Musterlösung angezeigt'];
    }

    // Hinweiskosten stehen in der Aufgabe, nicht in einer Faustregel hier.
    $kosten = 0;
    $liste  = array_values((array)($a['hinweise'] ?? []));
    for ($i = 0; $i < min($hinweise, count($liste)); $i++) {
        $kosten += (int)($liste[$i]['kostet'] ?? 0);
    }

    $punkte = max(0, $roh - $kosten);

    // Speed-Bonus, gedeckelt.
    //
    // Der Deckel ist der Punkt: ohne ihn belohnte die Academy schnelles Raten
    // statt Denken. Mit ihm ist der Bonus eine Anerkennung für jemanden, der
    // es wirklich schon kann — und nur bei einer vollständig richtigen
    // Antwort.
    //
    // Bonus und Deckel stehen in den Academy-Regeln (Einstellungen › Academy-Regeln).
    // Sie wirken ab dem nächsten Versuch: was gestern gerechnet wurde, steht
    // in `versuche` und wird von einer Regeländerung nicht angefasst.
    $deckel = max(0, min(50, (int)pu_regel('tempobonus_deckel'))) / 100;
    if (!pu_regel_an('tempobonus')) $deckel = 0.0;

    $bonus = 0;
    $richtzeit = (int)($a['richtzeit_s'] ?? 0);
    if ($deckel > 0 && $punkte > 0 && $bewertung['richtig']
        && $richtzeit > 0 && $dauer_s > 0 && $dauer_s < $richtzeit) {
        $anteil = 1.0 - ($dauer_s / $richtzeit);          // 0 … 1
        $bonus  = (int)round($punkte * min($deckel, $anteil * $deckel));
    }

    return [
        'punkte' => $punkte + $bonus,
        'abzug'  => $kosten,
        'bonus'  => $bonus,
        'grund'  => $kosten > 0 ? "$hinweise Hinweis(e) genutzt" : '',
    ];
}

/**
 * Traegt einen Versuch ein und führt Konto, Serie und Badges nach.
 *
 * @return array Was sich geaendert hat — für die Rueckmeldung im Fenster.
 */
function pu_versuch_eintragen(
    int $lernender, array $a, $antwort, array $bewertung,
    array $punkte, int $hinweise, bool $loesung, int $dauer_s
): array {
    $pdo = pu_db();

    $st = $pdo->prepare(
        'INSERT INTO versuche
           (lernender, aufgabe_id, stufe, typ, antwort, punkte, max_punkte,
            richtig, hinweise, loesung_ges, dauer_s, zeitpunkt, tag)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)'
    );
    $st->execute([
        $lernender,
        (string)$a['id'],
        (int)($a['stufe'] ?? 0),
        (string)$a['typ'],
        is_scalar($antwort) ? (string)$antwort : (string)json_encode($antwort, JSON_UNESCAPED_UNICODE),
        (int)$punkte['punkte'],
        (int)$bewertung['max'],
        $bewertung['richtig'] ? 1 : 0,
        $hinweise,
        $loesung ? 1 : 0,
        $dauer_s,
        pu_jetzt(),
        pu_heute(),
    ]);

    $vorher = pu_konto($lernender);

    // Erst den Bonus buchen, dann rechnen — sonst fehlte er in der Summe, die
    // gleich zurückgeht, und erschiene erst beim nächsten Laden der Seite.
    $tagesbonus = $bewertung['richtig']
        ? pu_tagesbonus_buchen($lernender, (string)$a['id'])
        : null;

    $konto  = pu_punkte_neu_rechnen($lernender);
    $serie  = pu_serie_nachfuehren($lernender);

    require_once PU_ROOT . '/srv/badges.php';
    $neue = pu_badges_pruefen($lernender);

    pu_protokoll($lernender, 'versuch', (string)$a['id'],
        sprintf('%d/%d Punkte, %s', $punkte['punkte'], $bewertung['max'],
            $bewertung['richtig'] ? 'richtig' : 'falsch'));

    return [
        'konto'         => $konto,
        'titel_neu'     => $konto['titel'] !== $vorher['titel'] ? $konto['titel'] : null,
        'serie'         => $serie,
        'neue_badges'   => $neue,
        'tagesbonus'    => $tagesbonus,
    ];
}

/**
 * Bucht den Bonus der Tages-Challenge — einmal je Tag.
 *
 * Die Aufgabe des Tages gibt ihre normalen Punkte wie jede andere; der Bonus
 * kommt obendrauf, weil sie an diesem Tag gelöst wurde. Deshalb sitzt er in
 * einer eigenen Tabelle und nicht im Versuch: derselbe Versuch, morgen
 * wiederholt, ist derselbe Versuch — der Tag ist es nicht.
 *
 * Doppelbuchung verhindert der Primärschlüssel (lernender, tag), nicht eine
 * Abfrage davor. Zwei Fenster, zweimal abgegeben, gleicher Tag: die zweite
 * Einfügung scheitert, und das ist die richtige Antwort.
 *
 * @return array|null ['punkte' => int, 'aufgabe' => string] oder null
 */
function pu_tagesbonus_buchen(int $lernender, string $aufgabe_id): ?array
{
    if (!pu_regel_an('tagesaufgabe')) return null;

    $bonus = (int)pu_regel('tagesbonus');
    if ($bonus <= 0) return null;

    if (pu_tagesaufgabe_id($lernender) !== $aufgabe_id) return null;

    try {
        $st = pu_db()->prepare(
            'INSERT INTO tagesbonus (lernender, tag, aufgabe_id, punkte, zeitpunkt)
             VALUES (?,?,?,?,?)'
        );
        $st->execute([$lernender, pu_heute(), $aufgabe_id, $bonus, pu_jetzt()]);
    } catch (PDOException $e) {
        if (str_contains($e->getMessage(), 'UNIQUE') || str_contains($e->getMessage(), 'constraint')) {
            return null;                       // heute schon bekommen
        }
        throw $e;
    }

    pu_protokoll($lernender, 'tagesbonus', $aufgabe_id, $bonus . ' Punkte');
    return ['punkte' => $bonus, 'aufgabe' => $aufgabe_id];
}

/** Summe aller Tagesboni eines Lernenden. */
function pu_tagesbonus_summe(int $lernender): int
{
    $st = pu_db()->prepare('SELECT COALESCE(SUM(punkte), 0) FROM tagesbonus WHERE lernender = ?');
    $st->execute([$lernender]);
    return (int)$st->fetchColumn();
}

/**
 * Rechnet das Punktekonto aus den Versuchen neu.
 *
 * `punkte_konto` ist ein abgeleiteter Wert, absichtlich gespeichert, weil er
 * auf jeder Seite gebraucht wird. Die Wahrheit stehen in `versuche` — deshalb
 * gibt es diese Funktion: das Konto lässt sich jederzeit wiederherstellen.
 */
function pu_punkte_neu_rechnen(int $lernender): array
{
    // Bester Versuch je Aufgabe. Siehe Kopfkommentar, Entscheidung 1.
    $summe = (int)pu_db()->query(
        'SELECT COALESCE(SUM(best), 0) FROM (
             SELECT MAX(punkte) AS best FROM versuche
             WHERE lernender = ' . (int)$lernender . '
             GROUP BY aufgabe_id
         )'
    )->fetchColumn();

    // Der Tagesbonus kommt aus einer eigenen Tabelle dazu. Er steckt bewusst
    // nicht in `versuche`: dort zählt der BESTE Versuch je Aufgabe, und ein
    // Bonus, der in einem Versuch steckte, verschwände beim nächsten
    // schlechteren Versuch derselben Aufgabe wieder.
    $summe += pu_tagesbonus_summe($lernender);

    $titel = pu_titel($summe);

    $st = pu_db()->prepare(
        'INSERT INTO punkte_konto (lernender, summe, titel, geaendert) VALUES (?,?,?,?)
         ON CONFLICT(lernender) DO UPDATE SET summe = excluded.summe,
             titel = excluded.titel, geaendert = excluded.geaendert'
    );
    $st->execute([$lernender, $summe, $titel, pu_jetzt()]);

    return ['summe' => $summe, 'titel' => $titel, 'nächster' => pu_bis_naechster_titel($summe)];
}

function pu_konto(int $lernender): array
{
    $st = pu_db()->prepare('SELECT summe, titel FROM punkte_konto WHERE lernender = ?');
    $st->execute([$lernender]);
    $row = $st->fetch();
    $summe = $row === false ? 0 : (int)$row['summe'];
    return [
        'summe'     => $summe,
        'titel'     => $row === false ? 'Funke' : (string)$row['titel'],
        'nächster' => pu_bis_naechster_titel($summe),
    ];
}

/**
 * Führt die Serie nach: ein Tag mit mindestens einer geloesten Aufgabe.
 *
 * Drei Fälle, und der dritte ist der, den man vergisst: mehrmals am selben
 * Tag zu lernen darf die Serie nicht mehrfach hochzählen.
 */
function pu_serie_nachfuehren(int $lernender): array
{
    $heute = pu_heute();

    $st = pu_db()->prepare('SELECT tage, letzter, bestwert FROM streak WHERE lernender = ?');
    $st->execute([$lernender]);
    $row = $st->fetch();

    $tage     = $row === false ? 0  : (int)$row['tage'];
    $letzter  = $row === false ? '' : (string)$row['letzter'];
    $bestwert = $row === false ? 0  : (int)$row['bestwert'];

    if ($letzter === $heute) {
        // Schon heute gezählt — nichts tun.
    } elseif ($letzter === date('Y-m-d', strtotime($heute . ' -1 day'))) {
        $tage++;                      // gestern auch gelernt: Serie läuft
    } else {
        $tage = 1;                    // Lücke (oder erster Tag): neu beginnen
    }

    $bestwert = max($bestwert, $tage);

    $st = pu_db()->prepare(
        'INSERT INTO streak (lernender, tage, letzter, bestwert) VALUES (?,?,?,?)
         ON CONFLICT(lernender) DO UPDATE SET tage = excluded.tage,
             letzter = excluded.letzter, bestwert = excluded.bestwert'
    );
    $st->execute([$lernender, $tage, $heute, $bestwert]);

    return ['tage' => $tage, 'letzter' => $heute, 'bestwert' => $bestwert];
}

function pu_serie(int $lernender): array
{
    $st = pu_db()->prepare('SELECT tage, letzter, bestwert FROM streak WHERE lernender = ?');
    $st->execute([$lernender]);
    $row = $st->fetch();
    if ($row === false) return ['tage' => 0, 'letzter' => '', 'bestwert' => 0];

    // Eine Serie, die gestern endete, läuft noch — sie reisst erst, wenn ein
    // ganzer Tag ohne Aufgabe vergangen ist. Angezeigt wird deshalb 0, sobald
    // der letzte Tag aelter als gestern ist, ohne die Bestmarke anzutasten.
    $gestern = date('Y-m-d', strtotime(pu_heute() . ' -1 day'));
    $laeuft  = ($row['letzter'] === pu_heute() || $row['letzter'] === $gestern);

    return [
        'tage'     => $laeuft ? (int)$row['tage'] : 0,
        'letzter'  => (string)$row['letzter'],
        'bestwert' => (int)$row['bestwert'],
        'heute'    => $row['letzter'] === pu_heute(),
    ];
}

// ---------------------------------------------------------------- Tages-Challenge
/**
 * Die Bonusaufgabe des Tages.
 *
 * Aus dem Tagesdatum gezogen, nicht zufällig: alle bekommen dieselbe Aufgabe,
 * damit man darüber reden kann. Und beim Neuladen bleibt es dieselbe.
 *
 * Gezogen wird nur aus Stufen, die der Lernende freigeschaltet hat — sonst
 * wäre die Tages-Challenge für einen Anfänger regelmäßig eine Aufgabe aus
 * Stufe 6 und damit keine Einladung, sondern eine Abfuhr.
 */
function pu_tagesaufgabe(int $lernender): ?array
{
    require_once PU_ROOT . '/srv/kurse.php';

    if (!pu_regel_an('tagesaufgabe')) return null;

    $id = pu_tagesaufgabe_id($lernender);
    if ($id === '') return null;

    $a = pu_aufgabe($id);
    if ($a === null) return null;

    // "Erledigt" heisst hier RICHTIG gelöst, nicht bloss abgegeben. Sonst
    // verschwände die Challenge nach dem ersten Fehlversuch — und mit ihr die
    // Einladung, es noch einmal zu probieren.
    $st = pu_db()->prepare(
        'SELECT COUNT(*) FROM versuche
         WHERE lernender = ? AND aufgabe_id = ? AND tag = ? AND richtig = 1'
    );
    $st->execute([$lernender, $id, pu_heute()]);
    $geloest = ((int)$st->fetchColumn()) > 0;

    $st = pu_db()->prepare('SELECT punkte FROM tagesbonus WHERE lernender = ? AND tag = ?');
    $st->execute([$lernender, pu_heute()]);
    $gebucht = $st->fetchColumn();

    return [
        'aufgabe'   => pu_aufgabe_oeffentlich($a),
        'kurs'      => (string)($a['kurs'] ?? ''),
        'lektion'   => (string)($a['lektion'] ?? ''),
        'erledigt'  => $geloest,
        'bonus'     => (int)pu_regel('tagesbonus'),
        'bonus_erhalten' => $gebucht === false ? 0 : (int)$gebucht,
    ];
}

/**
 * Welche Aufgabe ist heute die Challenge?
 *
 * Aus dem Datum gezogen und deshalb ohne Speicher: dieselbe Frage gibt am
 * selben Tag dieselbe Antwort — beim Anzeigen und beim Buchen des Bonus.
 * Stünde die Auswahl in einer Tabelle, müssten beide Wege sie gleich lesen,
 * und einer von beiden würde es irgendwann anders tun.
 *
 * Gezogen wird nur aus freigeschalteten Stufen. Für einen Anfänger wäre eine
 * Aufgabe aus Stufe 6 keine Einladung, sondern eine Abfuhr.
 */
function pu_tagesaufgabe_id(int $lernender): string
{
    require_once PU_ROOT . '/srv/kurse.php';
    require_once PU_ROOT . '/srv/pruefung.php';

    $hoechste   = pu_hoechste_stufe($lernender);
    $kandidaten = [];
    foreach (pu_index()['aufgaben'] as $id => $a) {
        if ((int)($a['stufe'] ?? 0) > 0 && (int)$a['stufe'] <= $hoechste) $kandidaten[] = $id;
    }
    if ($kandidaten === []) return '';

    sort($kandidaten);
    $keim = hexdec(substr(hash('sha256', pu_heute() . '|' . $hoechste), 0, 8));
    return (string)$kandidaten[$keim % count($kandidaten)];
}
