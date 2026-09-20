<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — der Coder der Werkstatt: welches Modell, und für wen.
 *
 * Die Werkstatt ist der Schritt aus den Kursen in die eigene Arbeit. Ihr
 * Agent schreibt Code und führt ihn aus — deshalb hängt er an zwei Dingen,
 * die hier und nur hier entschieden werden:
 *
 *   **Welches Modell.** Die Academy legt ein Hausmodell fest und eine kurze
 *   Liste weiterer, die sie bezahlen will. Ein Lernender wählt daraus, nicht
 *   darüber hinaus: Ein freies Feld wäre eine Einladung, das teuerste Modell
 *   im Katalog einzutragen, und die Rechnung ginge an die Academy.
 *
 *   **Ob überhaupt.** Erst mit dem 7. Kurs zu 100 %. Der Kurs ist ein langes
 *   Interview, aus dem die persönliche Brand-Guideline entsteht — und genau
 *   die liest der Coder, bevor er irgendetwas baut. Ohne sie produziert er
 *   den Durchschnitt, den der Kurs abgewöhnen soll. 100 % statt „bestanden",
 *   weil es hier nichts zu bestehen gibt: Eine halbe Guideline ist keine.
 *
 * Gefragt wird die Freigabe auf dem Server, vor jedem Aufruf — nicht am Knopf.
 * Ein ausgegrauter Knopf hält niemanden auf, der die Schnittstelle kennt.
 *
 * Der Schlüssel ist derselbe wie für die Tutoren (`PU_OPENROUTER_API_KEY`).
 * Ein zweiter wäre eine zweite Stelle, an der ein Geheimnis liegt.
 */

/** Der Kurs, der den Coder freischaltet — über seinen Code, nicht den Ordner. */
const PU_CODER_KURS = 'KURS-7';

/** Höchstens so viele Modelle in der Auswahl. Eine Liste ist eine Entscheidung, kein Katalog. */
const PU_CODER_AUSWAHL_MAX = 12;

/**
 * Alle freigegebenen Modelle: das Hausmodell zuerst, dann die Auswahl.
 *
 * Doppelte fallen heraus — wer das Hausmodell auch in die Auswahl schreibt,
 * soll es nicht zweimal in der Liste sehen.
 */
function pu_coder_modelle(): array
{
    $liste = [trim(pu_regel('coder_modell'))];
    foreach (explode(',', pu_regel('coder_auswahl')) as $m) $liste[] = trim($m);

    return array_values(array_unique(array_filter($liste, fn($m) => $m !== '')));
}

/**
 * Das Modell, mit dem der Coder für diesen Lernenden arbeitet.
 *
 * Die eigene Wahl gilt nur, solange sie freigegeben ist. Streicht die
 * Academy ein Modell aus der Liste, fällt jeder, der es gewählt hatte,
 * still auf das Hausmodell zurück — statt auf einem Modell zu bleiben, das
 * niemand mehr bezahlen will.
 */
function pu_coder_modell(int $lernender): string
{
    $modelle = pu_coder_modelle();
    $eigen   = pu_einst($lernender, 'coder_modell');

    if ($eigen !== '' && in_array($eigen, $modelle, true)) return $eigen;
    return $modelle[0] ?? '';
}

/** Der Kurs aus dem Index, oder null, wenn er (noch) nicht im Vault liegt. */
function pu_coder_kurs(): ?array
{
    require_once PU_ROOT . '/srv/kurse.php';

    foreach (pu_index()['kurse'] as $k) {
        if (($k['code'] ?? '') === PU_CODER_KURS) return $k;
    }
    return null;
}

/**
 * Darf dieser Lernende den Coder benutzen — und wenn nicht, warum nicht.
 *
 * `grund` ist ein Kürzel, kein Satz; formuliert wird in der Oberfläche:
 *
 *   aus         der Schalter der Academy steht auf aus
 *   kein_modell weder Hausmodell noch Auswahl eingetragen
 *   kurs_fehlt  der 7. Kurs liegt nicht im Vault
 *   kurs_leer   der 7. Kurs hat noch keine Aufgaben — dann schaltet er nichts frei
 *   kurs_offen  angefangen oder nicht, aber keine 100 %
 *   betreiber   frei ohne Kurs: Ebene 1, siehe pu_token_frei()
 *   kurs        frei, weil der Kurs vollständig ist
 *
 * **Ein leerer Kurs schaltet nicht frei.** 0 von 0 Aufgaben wären
 * rechnerisch „alles gelöst" — und der Coder stünde jedem offen, solange der
 * Kurs nur ein Gerüst ist.
 */
function pu_coder_stand(int $lernender): array
{
    require_once PU_ROOT . '/srv/abo.php';
    require_once PU_ROOT . '/srv/kursstand.php';

    $aus = [
        'an'      => pu_regel_an('coder_an'),
        'frei'    => false,
        'grund'   => '',
        'prozent' => 0,
        'kurs'    => null,
        'modell'  => pu_coder_modell($lernender),
        'modelle' => pu_coder_modelle(),
    ];

    if (!$aus['an'])           return ['grund' => 'aus'] + $aus;
    if ($aus['modell'] === '') return ['grund' => 'kein_modell'] + $aus;

    // Der Betreiber muss die Werkstatt ausprobieren können, bevor irgendwer
    // den Kurs abgeschlossen hat — sonst gäbe es keinen Weg, sie zu prüfen.
    if (pu_token_frei($lernender)) return ['frei' => true, 'grund' => 'betreiber'] + $aus;

    $k = pu_coder_kurs();
    if ($k === null) return ['grund' => 'kurs_fehlt'] + $aus;
    $aus['kurs'] = ['pfad' => $k['pfad'], 'titel' => $k['titel']];

    $s = pu_kurs_stand($lernender, $k['pfad']);
    if (!empty($s['leer'])) return ['grund' => 'kurs_leer'] + $aus;

    $aus['prozent'] = (int)$s['prozent'];
    if ((int)$s['geloest'] < (int)$s['aufgaben_ges']) return ['grund' => 'kurs_offen'] + $aus;

    return ['frei' => true, 'grund' => 'kurs'] + $aus;
}

/** Kurzform für die Stellen, die nur Ja oder Nein brauchen. */
function pu_coder_frei(int $lernender): bool
{
    return pu_coder_stand($lernender)['frei'];
}
