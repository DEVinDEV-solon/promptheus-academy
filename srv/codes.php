<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Token-Gutscheine mit QR-Code (Entscheid des Betreibers 19.10.2026).
 *
 * Eine Schule oder Lehrkraft stellt Gutscheine aus — etwa zwanzig Kärtchen für
 * den Elternabend —, und wer einen davon in DIESER Academy einlöst, bekommt
 * die Token gutgeschrieben. Die Webseite zählt nichts und löst nichts ein:
 * Buchhaltung und Zuordnung bleiben in der Installation, die den Gutschein
 * ausgestellt hat.
 *
 * **Der Betrag wird beim Ausstellen reserviert, nicht beim Einlösen.** Sonst
 * könnte eine Lehrkraft mit 10.000 Token hundert Gutscheine à 5.000 drucken,
 * und wer zu spät einlöst, hält ein Kärtchen ohne Deckung in der Hand. So ist
 * jeder Gutschein gedeckt, solange er umläuft:
 *
 *   ausstellen   code_aus      beim Aussteller −Betrag (reserviert)
 *   einlösen     code_ein      beim Einlösenden +Betrag, Gegenkonto = Aussteller
 *   widerrufen   code_zurueck  beim Aussteller +Betrag (nur nicht eingelöste)
 *   ablaufen     code_zurueck  ebenso, von selbst nach 7 Tagen (`gueltig_bis`)
 *
 * Alle vier Zeilen tragen den Gutschein als Beleg (`token_buchungen.beleg`),
 * das Tokenbuch zeigt daraus Woher und Wohin (pu_tokenbuch).
 *
 * **Ein Code ist so viel wert wie sein Betrag** — wer ihn hat, löst ihn ein.
 * Er geht deshalb weder in den QR-Code (der führt nur zur Webseite) noch ins
 * Protokoll oder den Audit-Trail; dort steht die Nummer des Gutscheins und
 * seine letzten vier Zeichen. Lesbar ist er nur für den Aussteller.
 *
 * **Wer darf was.** Ausstellen über das Recht `codes.ausstellen`, und zwar nur
 * für eine Ebene unter sich (PU_TALENT_KETTE). Einlösen über `codes.einloesen`,
 * nur mit einem Konto genau der Ebene, für die der Gutschein gedacht ist, und
 * nie den eigenen.
 */

require_once PU_ROOT . '/srv/abo.php';

/** Ohne 0/O und 1/I — ein Code wird abgetippt, nicht kopiert. */
const PU_CODE_ZEICHEN = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const PU_CODE_LAENGE  = 12;          // 60 Bit — zum Raten zu viel
const PU_CODE_ANZAHL_MAX = 50;       // je Ausstellung, fünf A4-Seiten
/* Sieben Tage, fest (Entscheid des Betreibers 19.10.2026). Ein Gutschein vom
   Elternabend soll in der Woche danach eingelöst werden: Die kurze Frist
   schafft Aufmerksamkeit, und wer ausstellt, weiss, dass reservierte Token
   nach einer Woche wieder bei ihm sind — kein Kärtchen läuft monatelang um. */
const PU_CODE_TAGE    = 7;
const PU_CODE_FEHLVERSUCHE = 10;     // je Konto und Stunde

/** Wohin der QR-Code führt, je Zielgruppe. Der Code selbst steht nicht darin. */
const PU_CODE_LINK = [
    'eltern'     => 'https://promptheus-academy.de/eltern.php',
    'lehrer'     => 'https://promptheus-academy.de/lehrkraefte.php',
    'verwaltung' => 'https://promptheus-academy.de/schulen.php',
    'schueler'   => 'https://promptheus-academy.de/',
];

/** Ein neuer Code, in Vierergruppen: `ABCD-EFGH-JKLM`. */
function pu_code_neu(): string
{
    $roh = '';
    $n = strlen(PU_CODE_ZEICHEN);
    for ($i = 0; $i < PU_CODE_LAENGE; $i++) $roh .= PU_CODE_ZEICHEN[random_int(0, $n - 1)];
    return implode('-', str_split($roh, 4));
}

/** Was jemand eintippt, in die gespeicherte Form: gross, ohne Leerzeichen. */
function pu_code_normalisieren(string $eingabe): string
{
    $roh = strtoupper((string)preg_replace('/[^A-Za-z0-9]/', '', $eingabe));
    if (strlen($roh) !== PU_CODE_LAENGE) return '';
    if (strspn($roh, PU_CODE_ZEICHEN) !== PU_CODE_LAENGE) return '';
    return implode('-', str_split($roh, 4));
}

/** Für Protokoll und fremde Augen: nur die letzten vier Zeichen. */
function pu_code_kurz(string $code): string
{
    return '…' . substr($code, -4);
}

/** Für welche Ebenen darf dieses Konto Gutscheine ausstellen? */
function pu_code_zielebenen(int $wer): array
{
    require_once PU_ROOT . '/srv/profil.php';
    require_once PU_ROOT . '/srv/rechte.php';
    $p = pu_profil($wer);
    return $p === null ? [] : (PU_TALENT_KETTE[pu_ebene($p)] ?? []);
}

/**
 * Gutscheine ausstellen und den Gesamtbetrag sofort reservieren.
 *
 * Alles oder nichts: Reicht das Guthaben nicht für alle, wird keiner
 * ausgestellt — eine halbe Ausstellung druckt niemand.
 *
 * @return array{codes: array<int,array>, summe:int, stand:array}
 */
function pu_codes_ausstellen(int $von, int $anzahl, int $tokens, string $fuerEbene,
                             string $notiz = ''): array
{
    if (!in_array($fuerEbene, pu_code_zielebenen($von), true)) {
        throw new RuntimeException('Für diese Ebene darfst du keine Gutscheine ausstellen.');
    }
    if ($anzahl < 1 || $anzahl > PU_CODE_ANZAHL_MAX) {
        throw new RuntimeException('Auf einmal gehen 1 bis ' . PU_CODE_ANZAHL_MAX . ' Gutscheine.');
    }
    if ($tokens < PU_TALENT_MIN || $tokens > PU_TALENT_MAX) {
        throw new RuntimeException(sprintf('Ein Gutschein hat %s bis %s Token.',
            number_format(PU_TALENT_MIN, 0, ',', '.'), number_format(PU_TALENT_MAX, 0, ',', '.')));
    }
    $notiz = mb_substr(trim(strip_tags($notiz)), 0, 60);
    $summe = $anzahl * $tokens;

    if (!pu_token_frei($von)) {
        $rest = (int)pu_token_stand($von)['rest'];
        if ($rest < $summe) {
            throw new RuntimeException(sprintf(
                'Dafür reicht dein Guthaben nicht: %s Token verfügbar, %s Gutscheine à %s brauchen %s.',
                number_format(max(0, $rest), 0, ',', '.'), $anzahl,
                number_format($tokens, 0, ',', '.'), number_format($summe, 0, ',', '.')));
        }
    }

    // Gültig bis einschliesslich des siebten Tages nach dem Ausstellen.
    $bis = date('Y-m-d', strtotime('+' . PU_CODE_TAGE . ' days'));
    $pdo = pu_db();
    $neu = [];
    $pdo->beginTransaction();
    try {
        $ein = $pdo->prepare('INSERT INTO token_codes (code, von, tokens, fuer_ebene, notiz, angelegt, gueltig_bis)
                              VALUES (?,?,?,?,?,?,?)');
        $bel = $pdo->prepare('UPDATE token_codes SET buchung_aus = ? WHERE id = ?');
        for ($i = 0; $i < $anzahl; $i++) {
            // Ein Zusammenstoss bei 60 Bit ist so unwahrscheinlich, dass ein
            // zweiter Versuch genügt; der UNIQUE-Index hält den Rest auf.
            $code = pu_code_neu();
            try {
                $ein->execute([$code, $von, $tokens, $fuerEbene, $notiz, pu_jetzt(), $bis]);
            } catch (PDOException $e) {
                $code = pu_code_neu();
                $ein->execute([$code, $von, $tokens, $fuerEbene, $notiz, pu_jetzt(), $bis]);
            }
            $id = (int)$pdo->lastInsertId();
            $b  = pu_token_eintragen($von, 0, 'code_aus',
                    'Gutschein ' . pu_code_kurz($code) . ' für ' . (PU_EBENEN[$fuerEbene]['anzeige'] ?? $fuerEbene)
                    . ($notiz !== '' ? ' — ' . $notiz : ''),
                    -$tokens, beleg: $id);
            $bel->execute([$b, $id]);
            $neu[] = $id;
        }
        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }

    pu_protokoll($von, 'codes_ausgestellt', $fuerEbene,
                 $anzahl . ' × ' . $tokens . ' Token, gültig bis ' . $bis . ', Nr. ' . min($neu) . '–' . max($neu));

    return ['codes' => pu_codes_liste($von, $neu), 'summe' => $summe, 'stand' => pu_token_stand($von)];
}

/**
 * Abgelaufene, nicht eingelöste Gutscheine zurückbuchen.
 *
 * Läuft bei jedem Blick auf die Liste und vor jedem Einlösen — es gibt keinen
 * Zeitplan in dieser Academy, und ein Ablauf, der erst beim nächsten Blick
 * gebucht wird, ist genauso richtig, solange niemand vorher einlösen kann.
 */
function pu_codes_verfallen(): int
{
    $st = pu_db()->prepare("SELECT id FROM token_codes
                             WHERE eingeloest_von = 0 AND zurueck_am = '' AND gueltig_bis < ?");
    $st->execute([pu_heute()]);
    $n = 0;
    foreach ($st->fetchAll(PDO::FETCH_COLUMN) as $id) {
        if (pu_code_zurueckbuchen((int)$id, 'abgelaufen', 0)) $n++;
    }
    return $n;
}

/** Bucht einen nicht eingelösten Gutschein zum Aussteller zurück. */
function pu_code_zurueckbuchen(int $id, string $grund, int $wer): bool
{
    $pdo = pu_db();
    $pdo->beginTransaction();
    try {
        // Die Bedingung steht im UPDATE, nicht davor: zwei gleichzeitige
        // Aufrufe (Einlösen und Widerrufen) können so nicht beide gewinnen.
        $st = $pdo->prepare("UPDATE token_codes SET zurueck_am = ?, zurueck_grund = ?
                              WHERE id = ? AND eingeloest_von = 0 AND zurueck_am = ''");
        $st->execute([pu_jetzt(), $grund, $id]);
        if ($st->rowCount() !== 1) { $pdo->rollBack(); return false; }

        $c = $pdo->prepare('SELECT * FROM token_codes WHERE id = ?');
        $c->execute([$id]);
        $c = $c->fetch();
        pu_token_eintragen((int)$c['von'], 0, 'code_zurueck',
            'Gutschein ' . pu_code_kurz((string)$c['code']) . ' ' . $grund, (int)$c['tokens'], beleg: $id);
        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }
    pu_protokoll($wer > 0 ? $wer : (int)$c['von'], 'code_zurueck', (string)$id,
                 $grund . ', ' . (int)$c['tokens'] . ' Token, ' . pu_code_kurz((string)$c['code']));
    return true;
}

/** Ein eigener, noch nicht eingelöster Gutschein wird ungültig, der Betrag kommt zurück. */
function pu_code_widerrufen(int $wer, int $id): array
{
    $st = pu_db()->prepare('SELECT von, eingeloest_von, zurueck_am FROM token_codes WHERE id = ?');
    $st->execute([$id]);
    $c = $st->fetch();
    if ($c === false || (int)$c['von'] !== $wer) {
        throw new RuntimeException('Diesen Gutschein hast du nicht ausgestellt.');
    }
    if ((int)$c['eingeloest_von'] > 0) throw new RuntimeException('Der Gutschein ist schon eingelöst.');
    if ((string)$c['zurueck_am'] !== '') throw new RuntimeException('Der Gutschein ist schon zurückgebucht.');

    pu_code_zurueckbuchen($id, 'widerrufen', $wer);
    return ['stand' => pu_token_stand($wer)];
}

/**
 * Einen Gutschein einlösen.
 *
 * Geprüft wird in dieser Reihenfolge, und die Meldungen verraten nicht mehr
 * als nötig: Ob ein falscher Code „nie existiert" oder „schon eingelöst"
 * ist, sagt nur die zweite Meldung — und die bekommt nur, wer einen echten
 * Code in der Hand hat.
 */
function pu_code_einloesen(int $wer, string $eingabe): array
{
    require_once PU_ROOT . '/srv/profil.php';
    require_once PU_ROOT . '/srv/rechte.php';

    // Raten bremsen: zehn Fehlversuche je Stunde, dann ist Pause.
    $st = pu_db()->prepare("SELECT COUNT(*) FROM protokoll
                             WHERE lernender = ? AND aktion = 'code_fehlversuch' AND zeitpunkt >= ?");
    $st->execute([$wer, date('Y-m-d H:i:s', time() - 3600)]);
    if ((int)$st->fetchColumn() >= PU_CODE_FEHLVERSUCHE) {
        throw new RuntimeException('Zu viele falsche Codes in der letzten Stunde. Bitte später noch einmal.');
    }
    $fehler = static function (string $warum, string $meldung) use ($wer): never {
        pu_protokoll($wer, 'code_fehlversuch', '', $warum);
        throw new RuntimeException($meldung);
    };

    $code = pu_code_normalisieren($eingabe);
    if ($code === '') $fehler('Form', 'So sieht ein Gutschein-Code nicht aus: zwölf Zeichen, etwa ABCD-EFGH-JKLM.');

    pu_codes_verfallen();

    $st = pu_db()->prepare('SELECT * FROM token_codes WHERE code = ?');
    $st->execute([$code]);
    $c = $st->fetch();
    if ($c === false) $fehler('unbekannt', 'Diesen Code kennt diese Academy nicht. Gutscheine gelten nur in der Academy, die sie ausgestellt hat.');

    $id = (int)$c['id'];
    if ((int)$c['eingeloest_von'] > 0) $fehler('eingelöst ' . $id, 'Dieser Gutschein ist schon eingelöst.');
    if ((string)$c['zurueck_am'] !== '') $fehler('zurück ' . $id, 'Dieser Gutschein gilt nicht mehr (' . $c['zurueck_grund'] . ').');
    if ((int)$c['von'] === $wer) $fehler('eigener ' . $id, 'Den eigenen Gutschein kann man nicht einlösen — widerrufen geht im Cockpit.');

    $ich = pu_profil($wer);
    if ($ich === null || pu_ebene($ich) !== (string)$c['fuer_ebene']) {
        $fehler('Ebene ' . $id, 'Dieser Gutschein ist für ' . (PU_EBENEN[(string)$c['fuer_ebene']]['anzeige'] ?? $c['fuer_ebene'])
                . ' gedacht und lässt sich mit diesem Konto nicht einlösen.');
    }

    $pdo = pu_db();
    $pdo->beginTransaction();
    try {
        $up = $pdo->prepare("UPDATE token_codes SET eingeloest_von = ?, eingeloest_am = ?
                              WHERE id = ? AND eingeloest_von = 0 AND zurueck_am = ''");
        $up->execute([$wer, pu_jetzt(), $id]);
        if ($up->rowCount() !== 1) {
            $pdo->rollBack();
            throw new RuntimeException('Dieser Gutschein ist gerade eingelöst worden.');
        }
        $aussteller = pu_konten_namen([(int)$c['von']])[(int)$c['von']]['name'];
        $b = pu_token_eintragen($wer, 0, 'code_ein',
                'Gutschein von ' . $aussteller . ((string)$c['notiz'] !== '' ? ' — ' . $c['notiz'] : ''),
                (int)$c['tokens'], gegen: (int)$c['von'], beleg: $id);
        $pdo->prepare('UPDATE token_codes SET buchung_ein = ? WHERE id = ?')->execute([$b, $id]);
        $pdo->commit();
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        throw $e;
    }

    pu_protokoll($wer, 'code_eingeloest', (string)$id,
                 (int)$c['tokens'] . ' Token von ' . (int)$c['von'] . ', ' . pu_code_kurz($code));
    pu_protokoll((int)$c['von'], 'code_eingeloest_bei', (string)$id,
                 (int)$c['tokens'] . ' Token an ' . $wer . ', ' . pu_code_kurz($code));

    return ['tokens' => (int)$c['tokens'], 'von' => $aussteller, 'stand' => pu_token_stand($wer)];
}

/**
 * Die Gutscheine eines Ausstellers, neueste zuerst — mit Code, Status und
 * dem Pseudonym dessen, der eingelöst hat.
 *
 * @param int[] $nur nur diese Nummern (nach dem Ausstellen)
 */
function pu_codes_liste(int $von, array $nur = [], int $grenze = 300): array
{
    $wo = 'von = ?';
    $werte = [$von];
    if ($nur !== []) {
        $wo .= ' AND id IN (' . implode(',', array_fill(0, count($nur), '?')) . ')';
        $werte = array_merge($werte, array_map('intval', $nur));
    }
    $grenze = max(1, min(500, $grenze));
    $st = pu_db()->prepare("SELECT * FROM token_codes WHERE $wo ORDER BY id DESC LIMIT $grenze");
    $st->execute($werte);
    $zeilen = $st->fetchAll();
    $namen = pu_konten_namen(array_column($zeilen, 'eingeloest_von'));

    $aus = [];
    foreach ($zeilen as $c) {
        $ein = (int)$c['eingeloest_von'];
        $aus[] = [
            'id'          => (int)$c['id'],
            'code'        => (string)$c['code'],
            'tokens'      => (int)$c['tokens'],
            'fuer'        => (string)$c['fuer_ebene'],
            'fuer_anzeige'=> PU_EBENEN[(string)$c['fuer_ebene']]['anzeige'] ?? (string)$c['fuer_ebene'],
            'notiz'       => (string)$c['notiz'],
            'angelegt'    => (string)$c['angelegt'],
            'gueltig_bis' => (string)$c['gueltig_bis'],
            'zustand'     => $ein > 0 ? 'eingeloest' : ((string)$c['zurueck_am'] !== '' ? 'zurueck' : 'offen'),
            'eingeloest_von' => $ein > 0 ? ($namen[$ein]['name'] ?? '') : '',
            'eingeloest_am'  => (string)$c['eingeloest_am'],
            'zurueck_am'     => (string)$c['zurueck_am'],
            'zurueck_grund'  => (string)$c['zurueck_grund'],
            'link'        => PU_CODE_LINK[(string)$c['fuer_ebene']] ?? PU_CODE_LINK['schueler'],
        ];
    }
    return $aus;
}

/** Alles für die Gutschein-Karte im Cockpit. */
function pu_codes_ausgabe(int $von): array
{
    pu_codes_verfallen();
    $codes = pu_codes_liste($von);
    $offen = array_filter($codes, static fn($c) => $c['zustand'] === 'offen');
    return [
        'codes'      => $codes,
        'reserviert' => array_sum(array_column($offen, 'tokens')),
        'ziele'      => array_map(static fn($e) => ['ebene' => $e, 'anzeige' => PU_EBENEN[$e]['anzeige'] ?? $e],
                                  pu_code_zielebenen($von)),
        'stand'      => pu_token_stand($von),
        'frei'       => pu_token_frei($von),
        'min'        => PU_TALENT_MIN,
        'max'        => PU_TALENT_MAX,
        'anzahl_max' => PU_CODE_ANZAHL_MAX,
        'tage'       => PU_CODE_TAGE,
        'links'      => PU_CODE_LINK,
    ];
}
