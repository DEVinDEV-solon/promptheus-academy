<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Lernende, Fortschritt, Klassenübersicht.
 *
 * Mehrbenutzer, aber lokal: alle Konten liegen in derselben SQLite auf
 * demselben Rechner. Es gibt zwei Rollen und keine dritte:
 *
 *   `lernender` sieht seinen eigenen Stand.
 *   `tutor`     sieht die Gruppe, legt Konten an, widerruft Urkunden.
 *
 * Eine dritte Rolle wäre heute Vorratsbau. Wenn eine Schule mehrere Klassen
 * getrennt braucht, ist `gruppe` der Ansatzpunkt — nicht eine neue Rolle.
 */

/**
 * Legt einen Lernenden an.
 *
 * Das erste Konto wird automatisch **Admin** — Ebene 1. Ohne diese Regel
 * gaebe es nach der Einrichtung niemanden, der weitere Konten anlegen darf,
 * und niemanden, der an die Rechte-Matrix kaeme: ein Programm, das sich
 * selbst aussperrt.
 *
 * Alle weiteren Konten sind Schueler, bis jemand mit `rollen.manage` sie
 * hebt. Die Ebenen stehen in PU_EBENEN (srv/rechte.php).
 */
function pu_lernenden_anlegen(string $kennung, string $anzeigename, string $kennwort, string $rolle = '', string $gruppe = ''): int
{
    $kennung = strtolower(trim($kennung));

    if (!preg_match('/^[a-z0-9][a-z0-9._-]{2,31}$/', $kennung)) {
        throw new RuntimeException('Kennung: 3-32 Zeichen, klein, nur a-z 0-9 . _ -');
    }
    if (trim($anzeigename) === '') {
        throw new RuntimeException('Ein Anzeigename fehlt.');
    }
    if (strlen($kennwort) < 8) {
        // Acht Zeichen, nicht zwölf: die Academy läuft auf 127.0.0.1, und ein
        // Zwoelfzeichen-Zwang für Zwölfjährige erzeugt Zettel am Monitor.
        throw new RuntimeException('Das Kennwort braucht mindestens 8 Zeichen.');
    }

    // Die Ebenen stehen in srv/rechte.php. Wer Konten anlegt, braucht sie —
    // also wird sie hier geholt und nicht darauf gehofft, dass der Aufrufer
    // daran gedacht hat.
    require_once PU_ROOT . '/srv/rechte.php';

    $erste = ((int)pu_db()->query('SELECT COUNT(*) FROM lernende')->fetchColumn()) === 0;
    if ($rolle === '') $rolle = $erste ? 'admin' : 'schueler';
    if (!isset(PU_EBENEN[$rolle])) {
        throw new RuntimeException('Unbekannte Ebene: ' . $rolle);
    }

    // Ist im Plan noch Platz? Gefragt wird beim ANLEGEN, nicht beim Anmelden:
    // wer schon drin ist, fliegt nicht raus, weil jemand anders einen Platz
    // belegt hat. Nur Schülerkonten zählen — eine Lehrkraft belegt keinen.
    if ($rolle === 'schueler') {
        require_once PU_ROOT . '/srv/abo.php';
        $platz = pu_platz_frei(trim($gruppe), '');
        if (!$platz['ok']) throw new RuntimeException($platz['grund']);
    }

    $st = pu_db()->prepare(
        'INSERT INTO lernende (kennung, anzeigename, rolle, kennwort_hash, gruppe, angelegt)
         VALUES (?,?,?,?,?,?)'
    );
    try {
        $st->execute([
            $kennung, trim($anzeigename), $rolle,
            password_hash($kennwort, PASSWORD_DEFAULT), trim($gruppe), pu_jetzt(),
        ]);
    } catch (PDOException $e) {
        if (str_contains($e->getMessage(), 'UNIQUE')) {
            throw new RuntimeException('Diese Kennung gibt es schon.');
        }
        throw $e;
    }

    $id = (int)pu_db()->lastInsertId();
    pu_protokoll($id, 'konto_angelegt', $kennung, $rolle);

    // Der Gratis-Testzugang: 100.000 Token, einmalig, ohne Verfall. Er wird
    // hier gutgeschrieben und nicht beim ersten Anmelden, damit ein Konto von
    // der ersten Sekunde an benutzbar ist — auch das allererste, das noch gar
    // keinen Plan hinter sich hat.
    require_once PU_ROOT . '/srv/abo.php';
    pu_probe_gutschreiben($id);

    return $id;
}

/** Kennwort neu setzen. Der Lernende selbst oder ein Tutor. */
function pu_kennwort_setzen(int $lernender, string $neu, int $durch): void
{
    if (strlen($neu) < 8) throw new RuntimeException('Das Kennwort braucht mindestens 8 Zeichen.');
    $st = pu_db()->prepare('UPDATE lernende SET kennwort_hash = ? WHERE id = ?');
    $st->execute([password_hash($neu, PASSWORD_DEFAULT), $lernender]);
    pu_protokoll($durch, 'kennwort', (string)$lernender, $durch === $lernender ? 'selbst' : 'durch Tutor');
}

/** Gibt es überhaupt ein Konto? Entscheidet, ob index.php die Einrichtung zeigt. */
function pu_leer(): bool
{
    return ((int)pu_db()->query('SELECT COUNT(*) FROM lernende')->fetchColumn()) === 0;
}

// ---------------------------------------------------------------- Fortschritt
function pu_fortschritt_setzen(int $lernender, string $kurs, string $lektion, string $zustand): void
{
    if (!in_array($zustand, ['offen', 'laufend', 'fertig'], true)) return;
    $st = pu_db()->prepare(
        'INSERT INTO fortschritt (lernender, kurs, lektion, zustand, geaendert) VALUES (?,?,?,?,?)
         ON CONFLICT(lernender, kurs, lektion) DO UPDATE SET
             zustand = excluded.zustand, geaendert = excluded.geaendert'
    );
    $st->execute([$lernender, $kurs, $lektion, $zustand, pu_jetzt()]);
}

function pu_fortschritt(int $lernender): array
{
    $st = pu_db()->prepare('SELECT kurs, lektion, zustand FROM fortschritt WHERE lernender = ?');
    $st->execute([$lernender]);
    $aus = [];
    foreach ($st->fetchAll() as $r) $aus[(string)$r['lektion']] = (string)$r['zustand'];
    return $aus;
}

/**
 * Welche Aufgaben hat der Lernende schon gelöst?
 *
 * @return array Aufgabenkennung => bester Punktestand
 */
function pu_geloest(int $lernender): array
{
    $st = pu_db()->prepare(
        'SELECT aufgabe_id, MAX(punkte) AS best, MAX(richtig) AS richtig
         FROM versuche WHERE lernender = ? GROUP BY aufgabe_id'
    );
    $st->execute([$lernender]);
    $aus = [];
    foreach ($st->fetchAll() as $r) {
        $aus[(string)$r['aufgabe_id']] = ['punkte' => (int)$r['best'], 'richtig' => ((int)$r['richtig']) === 1];
    }
    return $aus;
}

// ---------------------------------------------------------------- Übersicht
/**
 * Der vollständige Stand eines Lernenden — Kopfzeile, Fortschritt, Bestenliste.
 */
function pu_stand(int $lernender): array
{
    require_once PU_ROOT . '/srv/punkte.php';
    require_once PU_ROOT . '/srv/badges.php';
    require_once PU_ROOT . '/srv/pruefung.php';
    require_once PU_ROOT . '/srv/zertifikat.php';

    $konto = pu_konto($lernender);
    return [
        'konto'      => $konto,
        'serie'      => pu_serie($lernender),
        'badges'     => pu_badges_uebersicht($lernender),
        'pruefungen' => pu_pruefungen($lernender),
        'urkunden'   => pu_urkunden($lernender),
        'hoechste_stufe' => pu_hoechste_stufe($lernender),
        'gelöst'    => pu_geloest($lernender),
        'fortschritt'=> pu_fortschritt($lernender),
    ];
}

/**
 * Die Klasse — nur für Tutoren.
 *
 * Zeigt Namen und Punktestand. Nicht die Antworten: die stehen in `versuche`
 * und werden erst gezeigt, wenn ein Tutor gezielt eine Aufgabe aufmacht.
 * Eine Übersicht, die nebenbei jede Antwort ausbreitet, lädt zum Stoebern
 * ein statt zum Helfen.
 */
function pu_klasse(): array
{
    $rows = pu_db()->query(
        "SELECT l.id, l.kennung, l.anzeigename, l.rolle, l.gruppe,
                l.pseudonym, l.lebensalter, l.schule, l.kind_von,
                COALESCE(k.summe, 0) AS punkte, COALESCE(k.titel, 'Funke') AS titel,
                COALESCE(s.tage, 0) AS serie,
                (SELECT COUNT(*) FROM versuche v WHERE v.lernender = l.id) AS versuche,
                (SELECT COUNT(*) FROM pruefungen p WHERE p.lernender = l.id AND p.bestanden = 1) AS stufen,
                (SELECT COUNT(*) FROM badges b WHERE b.lernender = l.id) AS badges
         FROM lernende l
         LEFT JOIN punkte_konto k ON k.lernender = l.id
         LEFT JOIN streak s ON s.lernender = l.id
         ORDER BY punkte DESC, l.anzeigename"
    )->fetchAll();

    return $rows;
}

/** Die Antworten eines Lernenden zu einer Aufgabe — nur für Tutoren. */
function pu_versuche_zu(int $lernender, string $aufgabe_id): array
{
    $st = pu_db()->prepare(
        'SELECT antwort, punkte, max_punkte, richtig, hinweise, loesung_ges, zeitpunkt
         FROM versuche WHERE lernender = ? AND aufgabe_id = ? ORDER BY zeitpunkt'
    );
    $st->execute([$lernender, $aufgabe_id]);
    return $st->fetchAll();
}
