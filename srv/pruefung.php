<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Prüfungen und Stufenfreigabe.
 *
 * Eine Prüfung ist eine Lektion mit `type: exam`. Sie unterscheidet sich in
 * genau drei Punkten von einer Lektion:
 *
 *   1. Sie wird am Stück bewertet, nicht Aufgabe für Aufgabe.
 *   2. Es gibt keine Hinweise und keine Musterlösung während des Laufs.
 *   3. Sie schaltet die nächste Stufe frei und erzeugt eine Urkunde.
 *
 * Punkt 2 ist der Grund, warum die Prüfungsantworten NICHT ueber denselben
 * Weg laufen wie eine normale Aufgabe: dort darf man einen Hinweis kaufen.
 */

/** Ist die Stufe für diesen Lernenden freigeschaltet? */
function pu_stufe_frei(int $lernender, int $stufe): bool
{
    if ($stufe <= 1) return true;                 // Stufe 1 steht jedem offen
    return pu_stufe_bestanden($lernender, $stufe - 1);
}

/**
 * Sind alle sechs Stufen bestanden?
 *
 * Gezählt wird gegen `PU_STUFEN` und nicht gegen die Kursordner im Vault: Ein
 * Stufenordner, der noch nicht geschrieben ist, darf den Abschluss nicht
 * verschenken — und einer, der versehentlich dort liegt, ihn nicht sperren.
 */
function pu_alle_stufen_bestanden(int $lernender): bool
{
    foreach (array_keys(PU_STUFEN) as $nr) {
        if (!pu_stufe_bestanden($lernender, (int)$nr)) return false;
    }
    return true;
}

function pu_stufe_bestanden(int $lernender, int $stufe): bool
{
    $st = pu_db()->prepare(
        'SELECT COUNT(*) FROM pruefungen WHERE lernender = ? AND stufe = ? AND bestanden = 1'
    );
    $st->execute([$lernender, $stufe]);
    return ((int)$st->fetchColumn()) > 0;
}

/** Die höchste freigeschaltete Stufe. Mindestens 1. */
function pu_hoechste_stufe(int $lernender): int
{
    $st = pu_db()->prepare(
        'SELECT COALESCE(MAX(stufe), 0) FROM pruefungen WHERE lernender = ? AND bestanden = 1'
    );
    $st->execute([$lernender]);
    return min(count(PU_STUFEN), ((int)$st->fetchColumn()) + 1);
}

/**
 * Nimmt eine Prüfung ab.
 *
 * @param array $antworten Aufgabenkennung => Antwort
 * @return array Ergebnis mit Einzelbewertungen
 */
function pu_pruefung_abnehmen(int $lernender, string $kurspfad, array $antworten): array
{
    require_once PU_ROOT . '/srv/kurse.php';
    require_once PU_ROOT . '/srv/bewertung.php';
    require_once PU_ROOT . '/srv/punkte.php';
    require_once PU_ROOT . '/srv/zertifikat.php';

    $kurs = pu_kurs($kurspfad);
    if ($kurs === null || $kurs['pruefung'] === null) {
        throw new RuntimeException('Zu diesem Kurs gibt es keine Prüfung.');
    }

    $stufe   = (int)$kurs['stufe'];
    $grenze  = (int)$kurs['bestehen_prozent'];
    $punkte  = 0;
    $max     = 0;
    $einzeln = [];

    foreach ($kurs['pruefung']['aufgaben'] as $a) {
        $erg = pu_bewerten($a, $antworten[$a['id']] ?? null);
        $punkte += (int)$erg['punkte'];
        $max    += (int)$erg['max'];

        // Der Versuch wird eingetragen, aber ohne Hinweisabzug und ohne
        // Speed-Bonus: in einer Prüfung gibt es beides nicht.
        $st = pu_db()->prepare(
            'INSERT INTO versuche
               (lernender, aufgabe_id, stufe, typ, antwort, punkte, max_punkte,
                richtig, hinweise, loesung_ges, dauer_s, zeitpunkt, tag)
             VALUES (?,?,?,?,?,?,?,?,0,0,0,?,?)'
        );
        $antwort = $antworten[$a['id']] ?? null;
        $st->execute([
            $lernender, (string)$a['id'], $stufe, (string)$a['typ'],
            is_scalar($antwort) ? (string)$antwort : (string)json_encode($antwort, JSON_UNESCAPED_UNICODE),
            (int)$erg['punkte'], (int)$erg['max'], $erg['richtig'] ? 1 : 0,
            pu_jetzt(), pu_heute(),
        ]);

        $einzeln[] = [
            'id'      => (string)$a['id'],
            'titel'   => (string)$a['titel'],
            'punkte'  => (int)$erg['punkte'],
            'max'     => (int)$erg['max'],
            'richtig' => (bool)$erg['richtig'],
            // Nach der Abgabe darf die Erklärung heraus — vorher nie.
            'erklaerung' => (string)($a['erklaerung'] ?? ''),
            'teil'    => $erg['teil'],
        ];
    }

    $prozent   = $max > 0 ? (int)round($punkte * 100 / $max) : 0;
    $bestanden = $prozent >= $grenze;

    $st = pu_db()->prepare(
        'INSERT INTO pruefungen (lernender, stufe, punkte, max_punkte, bestanden, zeitpunkt)
         VALUES (?,?,?,?,?,?)'
    );
    $st->execute([$lernender, $stufe, $punkte, $max, $bestanden ? 1 : 0, pu_jetzt()]);

    pu_protokoll($lernender, 'pruefung', $kurspfad,
        sprintf('%d/%d (%d%%) — %s', $punkte, $max, $prozent, $bestanden ? 'bestanden' : 'nicht bestanden'));

    $urkunde = null;
    if ($bestanden) {
        $urkunde = pu_urkunde_ausstellen($lernender, $stufe, $punkte);
    }

    pu_punkte_neu_rechnen($lernender);
    pu_serie_nachfuehren($lernender);

    require_once PU_ROOT . '/srv/badges.php';
    $neue = pu_badges_pruefen($lernender);

    return [
        'punkte'      => $punkte,
        'max'         => $max,
        'prozent'     => $prozent,
        'grenze'      => $grenze,
        'bestanden'   => $bestanden,
        'stufe'       => $stufe,
        'einzeln'     => $einzeln,
        'urkunde'     => $urkunde,
        'neue_badges' => $neue,
        'naechste_frei' => $bestanden && isset(PU_STUFEN[$stufe + 1]) ? $stufe + 1 : null,
    ];
}

/** Alle Prüfungsergebnisse eines Lernenden. */
function pu_pruefungen(int $lernender): array
{
    $st = pu_db()->prepare(
        'SELECT stufe, punkte, max_punkte, bestanden, zeitpunkt FROM pruefungen
         WHERE lernender = ? ORDER BY zeitpunkt DESC'
    );
    $st->execute([$lernender]);
    return $st->fetchAll();
}
