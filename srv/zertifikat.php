<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Urkunden.
 *
 * Eine Urkunde ist eine HTML-Seite aus `vorlagen/urkunde/` mit einem
 * Prüfcode. Kein PDF: das braeuchte eine Bibliothek, und der Browser druckt
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
        'SELECT pruefcode, stufe, punkte, ausgestellt, widerrufen FROM urkunden
         WHERE lernender = ? ORDER BY stufe'
    );
    $st->execute([$lernender]);
    return $st->fetchAll();
}

/**
 * Baut die Urkunde als HTML.
 *
 * Die Vorlage ist eine gewoehnliche HTML-Datei mit Platzhaltern `{{name}}`.
 * Alles wird escaped eingesetzt — der Anzeigename kommt vom Lernenden, und
 * ein Anzeigename mit einem Script-Tag darf keine Urkunde übernehmen.
 */
function pu_urkunde_html(string $code): ?string
{
    $st = pu_db()->prepare(
        'SELECT u.stufe, u.punkte, u.ausgestellt, u.widerrufen, l.anzeigename
         FROM urkunden u JOIN lernende l ON l.id = u.lernender
         WHERE u.pruefcode = ?'
    );
    $st->execute([strtoupper(trim($code))]);
    $row = $st->fetch();
    if ($row === false) return null;

    $vorlage = PU_VORLAGEN . '/urkunde/urkunde.html';
    if (!is_file($vorlage)) return null;

    $stufe = (int)$row['stufe'];
    $ersatz = [
        '{{name}}'        => pu_h((string)$row['anzeigename']),
        '{{stufe}}'       => (string)$stufe,
        '{{stufe_name}}'  => pu_h(PU_STUFEN[$stufe]['name'] ?? ''),
        '{{stufe_titel}}' => pu_h(PU_STUFEN[$stufe]['titel'] ?? ''),
        '{{punkte}}'      => (string)(int)$row['punkte'],
        '{{datum}}'       => pu_h(date('d.m.Y', strtotime((string)$row['ausgestellt']))),
        '{{pruefcode}}'   => pu_h(strtoupper(trim($code))),
        '{{widerrufen}}'  => $row['widerrufen'] !== '' ? 'widerrufen' : '',
    ];

    return strtr((string)file_get_contents($vorlage), $ersatz);
}
