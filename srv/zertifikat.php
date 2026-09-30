<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Urkunden.
 *
 * Eine Urkunde ist eine HTML-Seite aus `vorlagen/urkunde/abschluss.html` mit einem
 * Prüfcode — für Stufen- und Abschluss-Urkunde dieselbe, gestaltet über
 * srv/urkunden_design.php. Kein PDF: das braeuchte eine Bibliothek, und der Browser druckt
 * HTML nach PDF, ohne dass PROMPTHEUS dafür etwas mitbringen muss.
 *
 * **Der Prüfcode nennt keinen Namen.** Das ist die wichtigste Entscheidung
 * hier. Die Nachschlag-Route ist absichtlich ohne Anmeldung erreichbar — ein
 * Arbeitgeber oder eine Schule soll eine Urkunde pruefen können, ohne ein
 * Konto zu haben. Gäbe die Antwort den Namen zurueck, wäre die Liste aller
 * Codes ein Namensverzeichnis der Lernenden, und die sind teils minderjährig.
 * Also: die Antwort bestaetigt, was auf der vorgelegten Urkunde steht —
 * Stufe, Datum, Gültigkeit —, sie verrät nichts Neues.
 */

/**
 * Erzeugt einen Prüfcode.
 *
 * `PU-<stufe>-<8 Zeichen aus einem Zufallswert>`. Der Code hängt NICHT am
 * Namen oder an der Kennung: wäre er ableitbar, könnte jeder die Urkunde
 * eines anderen erraten und damit dessen Lernstand nachschlagen.
 */
function pu_pruefcode(int $stufe): string
{
    $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';  // ohne I, O, 0, 1
    $teil = '';
    for ($i = 0; $i < 8; $i++) {
        $teil .= $alphabet[random_int(0, strlen($alphabet) - 1)];
    }
    return sprintf('PU-%d-%s', $stufe, $teil);
}

/** Stellt eine Urkunde aus. Bei einer Kollision wird neu gewuerfelt. */
function pu_urkunde_ausstellen(int $lernender, int $stufe, int $punkte): array
{
    $pdo = pu_db();

    for ($versuch = 0; $versuch < 5; $versuch++) {
        $code = pu_pruefcode($stufe);
        try {
            $st = $pdo->prepare(
                'INSERT INTO urkunden (pruefcode, lernender, stufe, punkte, ausgestellt)
                 VALUES (?,?,?,?,?)'
            );
            $st->execute([$code, $lernender, $stufe, $punkte, pu_jetzt()]);
            pu_protokoll($lernender, 'urkunde', $code, 'Stufe ' . $stufe);
            return ['pruefcode' => $code, 'stufe' => $stufe, 'ausgestellt' => pu_jetzt()];
        } catch (PDOException $e) {
            // Nur eine Schluesselkollision wird wiederholt. Jeder andere
            // Datenbankfehler geht weiter nach oben — sonst verschwiegen wir
            // hier eine kaputte Datenbank hinter fünf stillen Versuchen.
            if (!str_contains($e->getMessage(), 'UNIQUE')) throw $e;
        }
    }
    throw new RuntimeException('Es konnte kein freier Prüfcode gefunden werden.');
}

/**
 * Schlaegt einen Prüfcode nach. Ohne Anmeldung erreichbar.
 *
 * Gibt KEINEN Namen zurueck. Siehe Kopfkommentar.
 */
function pu_urkunde_pruefen(string $code): array
{
    $code = strtoupper(trim($code));
    // Die Abschluss-Urkunde nach allen sechs Stufen hat ihr eigenes Modul —
    // dieselbe Regel: kein Name in der Antwort.
    if (preg_match('/^PU-A-[A-Z2-9]{8}$/', $code)) {
        require_once __DIR__ . '/abschluss.php';
        return pu_abschluss_pruefen($code);
    }
    if (!preg_match('/^PU-[1-6]-[A-Z2-9]{8}$/', $code)) {
        return ['gefunden' => false, 'grund' => 'Das ist kein PROMPTHEUS-Prüfcode.'];
    }

    $st = pu_db()->prepare(
        'SELECT stufe, punkte, ausgestellt, widerrufen FROM urkunden WHERE pruefcode = ?'
    );
    $st->execute([$code]);
    $row = $st->fetch();

    if ($row === false) {
        return ['gefunden' => false, 'grund' => 'Zu diesem Code gibt es keine Urkunde.'];
    }

    $stufe = (int)$row['stufe'];
    return [
        'gefunden'   => true,
        'gueltig'    => $row['widerrufen'] === '',
        'stufe'      => $stufe,
        'stufe_name' => PU_STUFEN[$stufe]['name'] ?? '',
        'punkte'     => (int)$row['punkte'],
        'ausgestellt'=> substr((string)$row['ausgestellt'], 0, 10),
        'widerrufen' => (string)$row['widerrufen'],
    ];
}

/** Ein Tutor kann eine Urkunde widerrufen. Gelöscht wird sie nie. */
function pu_urkunde_widerrufen(string $code, int $durch): bool
{
    if (str_starts_with(strtoupper(trim($code)), 'PU-A-')) {
        require_once __DIR__ . '/abschluss.php';
        return pu_abschluss_widerrufen($code, $durch);
    }
    $st = pu_db()->prepare(
        "UPDATE urkunden SET widerrufen = ? WHERE pruefcode = ? AND widerrufen = ''"
    );
    $st->execute([pu_jetzt(), strtoupper(trim($code))]);
    $ok = $st->rowCount() > 0;
    if ($ok) pu_protokoll($durch, 'urkunde_widerruf', strtoupper(trim($code)), '');
    return $ok;
}

/** Alle Urkunden eines Lernenden. */
function pu_urkunden(int $lernender): array
{
    $st = pu_db()->prepare(
        'SELECT pruefcode, stufe, punkte, ausgestellt, widerrufen, design FROM urkunden
         WHERE lernender = ? ORDER BY stufe'
    );
    $st->execute([$lernender]);
    $aus = $st->fetchAll();
    foreach ($aus as &$u) {
        $d = json_decode((string)$u['design'], true);
        $u['design'] = is_array($d) ? $d : null;       // null = noch nie gestaltet
    }
    return $aus;
}

/**
 * Baut die Urkunde einer Stufe als HTML — mit denselben Vorlagen, Schriften
 * und Druckregeln wie die Abschluss-Urkunde (srv/urkunden_design.php).
 *
 * Bis zum 30.09.2026 hatte die Stufen-Urkunde ein eigenes, festes Blatt im
 * Querformat. Wer „öffnen" drückte, bekam genau das — und keinen Generator.
 * Jetzt gestaltet jeder auch diese Urkunden selbst; ohne eigene Wahl gilt die
 * erste Vorlage.
 *
 * Der Name ist hier der Anzeigename, wie bisher. Versiegelt wird erst der
 * echte Name auf der Abschluss-Urkunde.
 */
function pu_urkunde_html(string $code): ?string
{
    require_once PU_ROOT . '/srv/abschluss.php';

    $st = pu_db()->prepare(
        'SELECT u.pruefcode, u.stufe, u.punkte, u.ausgestellt, u.widerrufen, u.design, l.anzeigename
         FROM urkunden u JOIN lernende l ON l.id = u.lernender
         WHERE u.pruefcode = ?'
    );
    $st->execute([strtoupper(trim($code))]);
    $row = $st->fetch();
    if ($row === false) return null;

    $design = pu_abschluss_design_lesen((string)$row['design']);
    $v = pu_urkunden_variante((string)($design['variante'] ?? '')) ?? pu_urkunden_erste_variante();
    if ($v === null) return null;

    return pu_urkunden_seite($v, $design, [
        'stufe'      => (int)$row['stufe'],
        'name'       => (string)$row['anzeigename'],
        'datum'      => date('d.m.Y', strtotime((string)$row['ausgestellt'])),
        'punkte'     => (int)$row['punkte'],
        'pruefcode'  => (string)$row['pruefcode'],
        'widerrufen' => $row['widerrufen'] !== '',
    ]);
}

/**
 * Speichert die Gestaltung einer Stufen-Urkunde — nur für die eigene.
 * Anders als bei der Abschluss-Urkunde geht dazu keine Meldung ans Cockpit:
 * Stufen-Urkunden werden dort nicht geführt.
 */
function pu_urkunde_design_setzen(int $lernender, string $code, string $variante, array $wunsch): array
{
    require_once PU_ROOT . '/srv/abschluss.php';

    $st = pu_db()->prepare('SELECT pruefcode, widerrufen FROM urkunden WHERE pruefcode = ? AND lernender = ?');
    $st->execute([strtoupper(trim($code)), $lernender]);
    $row = $st->fetch();
    if ($row === false) throw new DomainException('Das ist nicht deine Urkunde.');
    if ($row['widerrufen'] !== '') throw new DomainException('Diese Urkunde ist widerrufen.');

    $neu = pu_abschluss_design_bauen($variante, $wunsch);
    if ($neu === null) throw new InvalidArgumentException('Dieses Design gibt es nicht.');

    pu_db()->prepare('UPDATE urkunden SET design = ? WHERE pruefcode = ?')
           ->execute([json_encode($neu, JSON_UNESCAPED_UNICODE), $row['pruefcode']]);
    return $neu;
}
