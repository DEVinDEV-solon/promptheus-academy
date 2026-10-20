<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Meine Kinder: Eltern verwalten ihre eigenen Kinder (20.10.2026).
 *
 * Plan 20_Geschaeft/FAMILIE-UND-GRATIS-ZUGANG-PLAN.md §2.2 und §2.4.
 *
 * **Der Umkreis ist die eigene Familie**, nicht eine Ebene der Rechte-Matrix:
 * Ein Elternkonto sieht genau die Kinder, die mit ihm verknüpft sind
 * (`eltern_kinder`, srv/profil.php). Dafür braucht es kein Menü „Klasse“ und
 * kein `eltern.manage` — das bleibt bei der Schulleitung, die in einer Schule
 * fremde Schülerkonten mit Eltern verknüpft.
 *
 * **Anlegen nur auf dem Familienrechner** (Registrierung „eltern“). In einer
 * Schule legt die Schulleitung die Kinderkonten an; ein Elternteil, das sich
 * dort selbst Schülerkonten erzeugt, legte Konten an der Schule vorbei an.
 *
 * **Verbrauch ja, Fragen nein.** Der Familienplan verspricht einen Blick auf
 * jedes Kind und dessen Verbrauch. Gezeigt werden Summe und Zahl der
 * Tutorfragen der letzten 30 Tage — nie, was gefragt wurde.
 */

require_once PU_ROOT . '/srv/profil.php';
require_once PU_ROOT . '/srv/rechte.php';
require_once PU_ROOT . '/srv/abo.php';

/** Darf dieses Konto auf diesem Rechner selbst Kinderkonten anlegen? */
function pu_familie_darf_anlegen(int $eltern): bool
{
    $p = pu_profil($eltern);
    return $p !== null && pu_ebene($p) === 'eltern' && pu_art() === 'eltern'
        && count(pu_eltern_kinder($eltern)) < PU_KINDER_MAX;
}

/** Alles für die Karte „Meine Kinder“. */
function pu_familie_ausgabe(int $eltern): array
{
    $seit = date('Y-m-d', strtotime('-30 days'));
    $verbrauch = pu_db()->prepare(
        "SELECT COUNT(*) AS fragen, COALESCE(SUM(-tokens), 0) AS tokens
           FROM token_buchungen WHERE lernender = ? AND art = 'verbrauch' AND tag >= ?");

    $kinder = [];
    foreach (pu_eltern_kinder($eltern) as $id) {
        $k = pu_profil($id);
        if ($k === null) continue;
        $verbrauch->execute([$id, $seit]);
        $v = $verbrauch->fetch();
        $lage = pu_token_lage($id);
        $kinder[] = [
            'id'       => $id,
            // pu_profil gibt bei leerem Pseudonym schon den Anzeigenamen zurück.
            'name'     => (string)$k['pseudonym'],
            'kennung'  => (string)$k['kennung'],
            'gruppe'   => (string)$k['gruppe'],
            'fragen'   => (int)$v['fragen'],
            'tokens'   => (int)$v['tokens'],
            'rest'     => (int)$lage['rest'],
            'lage'     => (string)$lage['lage'],
        ];
    }

    $abo = pu_abo_fuer($eltern);
    return [
        'kinder'      => $kinder,
        'max'         => PU_KINDER_MAX,
        'darf_anlegen'=> pu_familie_darf_anlegen($eltern),
        'familienrechner' => pu_art() === 'eltern',
        'plan'        => $abo === null ? null : [
            'name'    => (string)$abo['plan_name'],
            'familie' => (int)(pu_plan((string)$abo['plan'])['eltern'] ?? 0) >= 1,
        ],
        'seit'        => $seit,
    ];
}

/**
 * Ein Kinderkonto anlegen und gleich verknüpfen.
 *
 * Erst prüfen, dann anlegen: Ein Konto, das angelegt wird und danach an der
 * Obergrenze scheitert, stünde ohne Eltern in der Academy.
 */
function pu_familie_kind_anlegen(int $eltern, string $kennung, string $anzeigename,
                                 string $kennwort): int
{
    require_once PU_ROOT . '/srv/lernende.php';

    $p = pu_profil($eltern);
    if ($p === null || pu_ebene($p) !== 'eltern') {
        throw new RuntimeException('Kinderkonten legt hier nur ein Elternkonto an.');
    }
    if (pu_art() !== 'eltern') {
        throw new RuntimeException('In einer Schule legt die Schulleitung die Kinderkonten an.');
    }
    if (count(pu_eltern_kinder($eltern)) >= PU_KINDER_MAX) {
        throw new RuntimeException('Ein Elternkonto hat höchstens ' . PU_KINDER_MAX . ' Kinder.');
    }

    $id = pu_lernenden_anlegen($kennung, $anzeigename, $kennwort, 'schueler', '');
    pu_eltern_schule_erben($eltern, $id);
    pu_eltern_kind_hinzu($eltern, $id, $eltern);
    return $id;
}

/** Ein eigenes Kind lösen. Fremde Kinder gibt es hier nicht. */
function pu_familie_kind_loesen(int $eltern, int $kind): void
{
    if (!in_array($kind, pu_eltern_kinder($eltern), true)) {
        throw new RuntimeException('Dieses Kind ist nicht mit deinem Konto verknüpft.');
    }
    pu_eltern_kind_loesen($eltern, $kind, $eltern);
}
