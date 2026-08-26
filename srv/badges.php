<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Badges.
 *
 * Jeder Badge ist eine reine Funktion ueber `versuche`, `pruefungen` und
 * `streak`. Das hat einen praktischen Grund: so lässt sich ein Badge, der
 * später dazukommt, NACHTRAEGLICH verleihen. Wer die Bedingung vor Monaten
 * erfuellt hat, bekommt ihn beim nächsten Aufruf — ohne Datenwanderung und
 * ohne dass jemand von vorn anfangen muss.
 *
 * Die Bedingungen stammen aus dem Konzeptplan, Abschnitt 7.
 */

function pu_badge_katalog(): array
{
    return [
        'erster_funke' => [
            'symbol'      => '🔥',
            'name'        => 'Erster Funke',
            'bedingung'   => 'Erste Aufgabe gelöst',
            'pruefung'    => fn(int $l): bool => pu_zaehl(
                'SELECT COUNT(*) FROM versuche WHERE lernender = ? AND richtig = 1', [$l]) >= 1,
        ],
        'prompt_meister' => [
            'symbol'      => '⚡',
            'name'        => 'Prompt-Meister',
            'bedingung'   => '10 Freitext-Aufgaben erfolgreich geschrieben',
            'pruefung'    => fn(int $l): bool => pu_zaehl(
                "SELECT COUNT(DISTINCT aufgabe_id) FROM versuche
                 WHERE lernender = ? AND richtig = 1 AND typ = 'planung'", [$l]) >= 10,
        ],
        'logik_guru' => [
            'symbol'      => '🧩',
            'name'        => 'Logik-Guru',
            'bedingung'   => '25 Denkaufgaben ohne Fehlversuch gelöst',
            // "ohne Fehler" heißt: beim ERSTEN Versuch richtig. Deshalb wird
            // die Zahl der Versuche je Aufgabe geprueft, nicht nur das Ergebnis.
            'pruefung'    => fn(int $l): bool => pu_zaehl(
                "SELECT COUNT(*) FROM (
                     SELECT aufgabe_id FROM versuche
                     WHERE lernender = ? AND typ IN ('denkaufgabe','raeumlich')
                     GROUP BY aufgabe_id
                     HAVING COUNT(*) = 1 AND MAX(richtig) = 1 AND MAX(hinweise) = 0
                 )", [$l]) >= 25,
        ],
        'key_keeper' => [
            'symbol'      => '🔑',
            'name'        => 'Key-Keeper',
            'bedingung'   => 'Secret-Aufgabe ohne Hinweis gelöst',
            'pruefung'    => fn(int $l): bool => pu_zaehl(
                "SELECT COUNT(*) FROM versuche
                 WHERE lernender = ? AND typ = 'secret' AND richtig = 1
                   AND hinweise = 0 AND loesung_ges = 0", [$l]) >= 1,
        ],
        'waechter' => [
            'symbol'      => '🛡️',
            'name'        => 'Wächter',
            'bedingung'   => 'Alle Sicherheits-Aufgaben einer Stufe bestanden',
            'pruefung'    => 'pu_badge_waechter',
        ],
        'architekt' => [
            'symbol'      => '🏗️',
            'name'        => 'Architekt',
            'bedingung'   => 'Vollständiges Multiagenten-Design erstellt',
            'pruefung'    => fn(int $l): bool => pu_zaehl(
                "SELECT COUNT(*) FROM versuche
                 WHERE lernender = ? AND typ = 'planung' AND richtig = 1 AND stufe >= 4", [$l]) >= 1,
        ],
        'diamant_streak' => [
            'symbol'      => '💎',
            'name'        => 'Diamant-Streak',
            'bedingung'   => '7 Tage täglich mindestens eine Aufgabe',
            // Ueber `bestwert`, nicht ueber `tage`: wer die Serie einmal
            // erreicht hat, behaelt den Badge auch nach einer Pause. Ein
            // Abzeichen, das man wieder verliert, ist eine Strafe für Urlaub.
            'pruefung'    => fn(int $l): bool => pu_zaehl(
                'SELECT COALESCE(MAX(bestwert), 0) FROM streak WHERE lernender = ?', [$l]) >= 7,
        ],
        'durchstarter' => [
            'symbol'      => '🚀',
            'name'        => 'Durchstarter',
            'bedingung'   => 'Eine Stufe in unter einer Woche abgeschlossen',
            'pruefung'    => 'pu_badge_durchstarter',
        ],
    ];
}

/** Kleiner Helfer: erste Spalte der ersten Zeile als int. */
function pu_zaehl(string $sql, array $werte): int
{
    $st = pu_db()->prepare($sql);
    $st->execute($werte);
    return (int)$st->fetchColumn();
}

/**
 * Wächter: in mindestens einer Stufe sind ALLE Sicherheits-Aufgaben richtig.
 *
 * Wird gegen den Vault geprueft, nicht gegen die Datenbank: die Datenbank
 * kennt nur, was jemand versucht hat, aber nicht, was es gibt. "Alle" lässt
 * sich nur beantworten, wenn man den Bestand kennt.
 */
function pu_badge_waechter(int $lernender): bool
{
    require_once PU_ROOT . '/srv/kurse.php';

    $je_stufe = [];
    foreach (pu_index()['aufgaben'] as $id => $a) {
        if ($a['typ'] !== 'sicherheit') continue;
        $je_stufe[(int)($a['stufe'] ?? 0)][] = $id;
    }
    if ($je_stufe === []) return false;

    foreach ($je_stufe as $stufe => $ids) {
        if ($stufe <= 0 || $ids === []) continue;
        $platz = implode(',', array_fill(0, count($ids), '?'));
        $st = pu_db()->prepare(
            "SELECT COUNT(DISTINCT aufgabe_id) FROM versuche
             WHERE lernender = ? AND richtig = 1 AND aufgabe_id IN ($platz)"
        );
        $st->execute(array_merge([$lernender], $ids));
        if ((int)$st->fetchColumn() === count($ids)) return true;
    }
    return false;
}

/** Durchstarter: zwischen erster Aufgabe und bestandener Prüfung < 7 Tage. */
function pu_badge_durchstarter(int $lernender): bool
{
    $st = pu_db()->prepare(
        'SELECT stufe, MIN(zeitpunkt) AS bestanden FROM pruefungen
         WHERE lernender = ? AND bestanden = 1 GROUP BY stufe'
    );
    $st->execute([$lernender]);

    foreach ($st->fetchAll() as $p) {
        $st2 = pu_db()->prepare(
            'SELECT MIN(zeitpunkt) FROM versuche WHERE lernender = ? AND stufe = ?'
        );
        $st2->execute([$lernender, (int)$p['stufe']]);
        $start = $st2->fetchColumn();
        if ($start === false || $start === null) continue;

        $tage = (strtotime((string)$p['bestanden']) - strtotime((string)$start)) / 86400.0;
        if ($tage >= 0 && $tage < 7) return true;
    }
    return false;
}

/**
 * Prüft alle Badges und verleiht, was faellig ist.
 *
 * @return array<int, array> die NEU verliehenen Badges — für die Meldung im Fenster
 */
function pu_badges_pruefen(int $lernender): array
{
    $hat = pu_badges($lernender);
    $neu = [];

    foreach (pu_badge_katalog() as $kennung => $b) {
        if (isset($hat[$kennung])) continue;

        // Der Eintrag ist entweder ein Closure oder ein Funktionsname —
        // beides ist in PHP so aufrufbar.
        $pruefung = $b['pruefung'];
        if (!$pruefung($lernender)) continue;

        $st = pu_db()->prepare(
            'INSERT OR IGNORE INTO badges (lernender, badge, verliehen_am) VALUES (?,?,?)'
        );
        $st->execute([$lernender, $kennung, pu_jetzt()]);

        pu_protokoll($lernender, 'badge', $kennung, $b['name']);
        $neu[] = ['kennung' => $kennung, 'symbol' => $b['symbol'], 'name' => $b['name']];
    }

    return $neu;
}

/** Alle verliehenen Badges eines Lernenden, nach Kennung. */
function pu_badges(int $lernender): array
{
    $st = pu_db()->prepare('SELECT badge, verliehen_am FROM badges WHERE lernender = ?');
    $st->execute([$lernender]);
    $aus = [];
    foreach ($st->fetchAll() as $r) $aus[(string)$r['badge']] = (string)$r['verliehen_am'];
    return $aus;
}

/** Katalog mit Verleihstand — für die Fortschrittsansicht. */
function pu_badges_uebersicht(int $lernender): array
{
    $hat = pu_badges($lernender);
    $aus = [];
    foreach (pu_badge_katalog() as $kennung => $b) {
        $aus[] = [
            'kennung'   => $kennung,
            'symbol'    => $b['symbol'],
            'name'      => $b['name'],
            'bedingung' => $b['bedingung'],
            'hat'       => isset($hat[$kennung]),
            'seit'      => $hat[$kennung] ?? '',
        ];
    }
    return $aus;
}
