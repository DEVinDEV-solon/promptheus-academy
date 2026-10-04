<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — das Pseudonym eines Kontos.
 *
 * Der Name, unter dem jemand in der Academy, in der Werkstatt und in der
 * Community auftritt. Er wird gleich beim ersten Anmelden gewählt (Pflicht)
 * und lässt sich danach nur alle 30 Tage ändern (Entscheid 04.10.2026).
 *
 * ──────────────────────────────────────────────────────────────────────────
 * Die Form:  <Namensteil>_<Kennung>      z. B. Goldfänger_7K2QX
 *
 *   Namensteil  Unter 18 nur aus dem Baukasten (Vorsilbe + Figur, 128 × 128,
 *               `pseudonym_baukasten.json`). Ab 18 auch frei, mit Prüfung.
 *               Angesprochen wird man nur damit („Hallo Goldfänger").
 *   Kennung     5 Zeichen, zufällig, je Konto fest. Sie bleibt, wenn der
 *               Namensteil wechselt — so bleibt man in der Community
 *               wiedererkennbar, und zwei Goldfänger sind zwei verschiedene.
 *
 * **Warum die Kennung keine Vokale hat.** Aus 2–9 und Konsonanten lässt sich
 * kein Wort und kein Vorname bilden. Eine Kennung „EVA23" wäre sonst ein
 * Vorname im Pseudonym, und die Klarnamen-Prüfung schlüge an.
 *
 * **Warum sie zufällig ist und nicht aus dem LP berechnet.** Das LP
 * (`pu_ident_lp`) benennt den Ordner und gilt im Cockpit. Hinge die Kennung
 * daran, liesse sich ein Community-Name mit Ordner und Installation verknüpfen.
 *
 * **Was der Name nicht ist:** kein Schlüssel. Er ist änderbar; Ordner, Cockpit
 * und Fernwartung arbeiten mit IID und LP.
 */

require_once __DIR__ . '/../lib.php';

/** Die Zeichen der Kennung: Ziffern 2–9 und Konsonanten ohne L und Y. */
const PU_PSEUDO_ZEICHEN = '23456789BCDFGHJKMNPQRSTVWXZ';
const PU_PSEUDO_KENNUNG_LAENGE = 5;
/** So lange gilt ein gewählter Name, bevor er wieder geändert werden darf. */
const PU_PSEUDO_SPERRTAGE = 30;
/** Ab diesem Alter ist auch ein frei gewählter Namensteil erlaubt. */
const PU_PSEUDO_FREI_AB = 18;
const PU_PSEUDO_BAUKASTEN = __DIR__ . '/pseudonym_baukasten.json';

/** Rückmeldungen. Ton der Marke: erklären, nicht schimpfen. */
const PU_PSEUDO_TEXTE = [
    'form'      => 'Der Name hat 3 bis 18 Zeichen, beginnt mit einem Buchstaben und besteht nur aus Buchstaben und Ziffern.',
    'baukasten' => 'Bis 18 Jahre wählst du deinen Namen aus dem Baukasten. Würfle, bis dir einer gefällt.',
    'rang'      => 'Das ist ein Rang, eine Stufe oder ein Tutor der Academy. Nimm einen eigenen Namen.',
    'jahr'      => 'Eine Jahreszahl verrät leicht dein Alter. Lass sie weg.',
    'klarname'  => 'Das sieht aus wie ein echter Name oder eine persönliche Angabe. Nimm einen ausgedachten Namen.',
    'gesperrt'  => 'Diesen Namen gibt es im Baukasten nicht. Würfle einen anderen.',
    'frist'     => 'Deinen Namen kannst du nur alle 30 Tage ändern.',
];

/** Der Baukasten, einmal gelesen. */
function pu_pseudo_baukasten(): array
{
    static $b = null;
    if ($b === null) {
        $b = json_decode((string)file_get_contents(PU_PSEUDO_BAUKASTEN), true, 512, JSON_THROW_ON_ERROR);
    }
    return $b;
}

/** Vorsilbe + Figur, so wie der Baukasten sie zusammensetzt. */
function pu_pseudo_zusammen(string $vorsilbe, string $figur): string
{
    return $vorsilbe . $figur;
}

/** Ist dieser Namensteil eine erlaubte Kombination aus dem Baukasten? */
function pu_pseudo_im_baukasten(string $teil): bool
{
    static $alle = null;
    if ($alle === null) {
        $b = pu_pseudo_baukasten();
        $alle = [];
        foreach ($b['vorsilben'] as $v) {
            foreach ($b['figuren'] as $f) $alle[pu_pseudo_zusammen($v, $f)] = true;
        }
        foreach ($b['gesperrt'] as $g) unset($alle[$g]);
    }
    return isset($alle[$teil]);
}

/**
 * Zufällige Vorschläge aus dem Baukasten.
 * @return list<string>
 */
function pu_pseudo_vorschlaege(int $anzahl = 3): array
{
    $b = pu_pseudo_baukasten();
    $aus = [];
    $versuche = 0;
    while (count($aus) < $anzahl && $versuche++ < 100) {
        $teil = pu_pseudo_zusammen(
            $b['vorsilben'][random_int(0, count($b['vorsilben']) - 1)],
            $b['figuren'][random_int(0, count($b['figuren']) - 1)]
        );
        if (pu_pseudo_im_baukasten($teil) && !in_array($teil, $aus, true)) $aus[] = $teil;
    }
    return $aus;
}

/** Eine neue zufällige Kennung (nicht auf Eindeutigkeit geprüft). */
function pu_pseudo_kennung_wuerfeln(): string
{
    $z = PU_PSEUDO_ZEICHEN;
    $k = '';
    for ($i = 0; $i < PU_PSEUDO_KENNUNG_LAENGE; $i++) $k .= $z[random_int(0, strlen($z) - 1)];
    return $k;
}

/**
 * Zerlegt ein Pseudonym der neuen Form.
 * @return array{teil:string,kennung:string}|null null, wenn es nicht die Form hat
 */
function pu_pseudo_zerlegen(string $pseudonym): ?array
{
    $muster = '/^(\p{L}[\p{L}\p{N}]{2,17})_([' . PU_PSEUDO_ZEICHEN . ']{' . PU_PSEUDO_KENNUNG_LAENGE . '})$/u';
    if (!preg_match($muster, $pseudonym, $m)) return null;
    return ['teil' => $m[1], 'kennung' => $m[2]];
}

/** Die Anrede: nur der Namensteil. Ein Pseudonym alter Form bleibt ganz. */
function pu_pseudo_anrede(string $pseudonym): string
{
    return pu_pseudo_zerlegen($pseudonym)['teil'] ?? $pseudonym;
}

/**
 * Gilt für dieses Konto nur der Baukasten?
 *
 * Unter 18 ja. Bei Schülerkonten auch ohne Altersangabe: ein leeres Alter
 * heisst „nicht gesagt", und dann gilt die vorsichtigere Regel.
 *
 * Gefragt wird die echte Rolle, nicht die Ebene aus `pu_ebene()`: Die wird
 * ohne Registrierung auf „Schüler" gedeckelt. Das betrifft die Rechte, nicht
 * das Alter — der Admin einer noch nicht registrierten Installation ist
 * deshalb kein Kind.
 */
function pu_pseudo_nur_baukasten(array $profil): bool
{
    $alter = (int)($profil['lebensalter'] ?? 0);
    if ($alter > 0) return $alter < PU_PSEUDO_FREI_AB;
    // Unbekannte Rollen zählen wie Schüler: die vorsichtigere Regel.
    return !in_array((string)($profil['rolle'] ?? ''), ['admin', 'verwaltung', 'lehrer', 'tutor', 'eltern'], true);
}

/** Wörter, die nach Rang aussehen: Stufen, Titel, Tutoren. */
function pu_pseudo_rangwoerter(): array
{
    $w = ['prometheus', 'athena', 'hermes', 'hephaistos', 'solon', 'tutor', 'admin', 'academy', 'promptheus'];
    foreach (PU_STUFEN as $s) $w[] = mb_strtolower($s['name']);
    foreach (PU_TITEL as $t) $w[] = mb_strtolower($t);
    return array_values(array_unique($w));
}

/**
 * Die echten Namen von der eigenen Urkunde, nur im Speicher entschlüsselt.
 * @return list<string> kleingeschrieben, ab 3 Zeichen
 */
function pu_pseudo_urkundennamen(int $id): array
{
    $aus = [];
    try {
        require_once __DIR__ . '/abschluss.php';
        $st = pu_db()->prepare('SELECT vorname_geheim, nachname_geheim FROM abschluesse WHERE lernender = ?');
        $st->execute([$id]);
        foreach ($st as $z) {
            foreach (['vorname_geheim', 'nachname_geheim'] as $feld) {
                $n = mb_strtolower(trim((string)(pu_abschluss_entschluesseln((string)$z[$feld]) ?? '')));
                foreach (preg_split('/[\s-]+/u', $n) ?: [] as $t) {
                    if (mb_strlen($t) >= 3) $aus[] = $t;
                }
            }
        }
    } catch (Throwable) {
        // Keine Urkunde oder kein Schlüssel: dann gibt es nichts zu vergleichen.
    }
    return $aus;
}

/**
 * Prüft einen Namensteil. Die Reihenfolge ist Absicht: erst die Form, dann der
 * Klarname (der wichtigste Grund), dann Rang und Jahr, zuletzt der Baukasten.
 *
 * @return string|null ein Schlüssel aus PU_PSEUDO_TEXTE oder null
 */
function pu_pseudo_teil_fehler(string $teil, array $profil): ?string
{
    if (!preg_match('/^\p{L}[\p{L}\p{N}]{2,17}$/u', $teil)) return 'form';

    require_once __DIR__ . '/gemeinde.php';
    if (pu_synonym_fehler($teil, $profil) !== null) return 'klarname';
    $klein = mb_strtolower($teil);
    foreach (pu_pseudo_urkundennamen((int)($profil['id'] ?? 0)) as $n) {
        if (str_contains($klein, $n)) return 'klarname';
    }

    $baukasten = pu_pseudo_im_baukasten($teil);
    if (!$baukasten) {
        foreach (pu_pseudo_rangwoerter() as $r) {
            if ($klein === $r) return 'rang';
        }
        if (preg_match('/(19\d\d|20[0-4]\d)/', $teil)) return 'jahr';
    }

    if (pu_pseudo_nur_baukasten($profil) && !$baukasten) return 'baukasten';
    return null;
}

/** Die Rohdaten eines Kontos für diese Datei. */
function pu_pseudo_konto(int $id): ?array
{
    $st = pu_db()->prepare('SELECT id, kennung, anzeigename, rolle, lebensalter, pseudonym,
                                   pseudonym_kennung, pseudonym_seit FROM lernende WHERE id = ?');
    $st->execute([$id]);
    $z = $st->fetch();
    return $z === false ? null : $z;
}

/**
 * Die Kennung des Kontos. Beim ersten Mal wird sie ausgewürfelt, auf dieser
 * Installation eindeutig gemacht und festgehalten.
 */
function pu_pseudo_kennung(int $id): string
{
    $z = pu_pseudo_konto($id);
    if ($z === null) throw new RuntimeException('Dieses Konto gibt es nicht.');
    if ((string)$z['pseudonym_kennung'] !== '') return (string)$z['pseudonym_kennung'];

    $frei = pu_db()->prepare('SELECT COUNT(*) FROM lernende WHERE pseudonym_kennung = ?');
    for ($i = 0; $i < 50; $i++) {
        $k = pu_pseudo_kennung_wuerfeln();
        $frei->execute([$k]);
        if ((int)$frei->fetchColumn() === 0) {
            pu_db()->prepare('UPDATE lernende SET pseudonym_kennung = ? WHERE id = ?')->execute([$k, $id]);
            return $k;
        }
    }
    throw new RuntimeException('Keine freie Kennung gefunden.');
}

/** Ab wann der Name wieder geändert werden darf ('' = jetzt). */
function pu_pseudo_aenderbar_ab(array $konto): string
{
    $seit = (string)($konto['pseudonym_seit'] ?? '');
    if ($seit === '' || (string)$konto['pseudonym'] === '') return '';
    $ab = strtotime($seit . ' +' . PU_PSEUDO_SPERRTAGE . ' days');
    return ($ab !== false && $ab > time()) ? gmdate('Y-m-d\TH:i:s\Z', $ab) : '';
}

/**
 * Der Stand für die Oberfläche.
 *
 * `pflicht` heisst: Vor allem anderen muss ein Name gewählt werden. Das gilt,
 * solange kein Pseudonym der neuen Form gesetzt ist — auch für Konten, die
 * noch ein altes, freies Pseudonym tragen.
 */
function pu_pseudo_stand(int $id): array
{
    $z = pu_pseudo_konto($id);
    if ($z === null) throw new RuntimeException('Dieses Konto gibt es nicht.');
    $kennung = pu_pseudo_kennung($id);
    $teile = pu_pseudo_zerlegen((string)$z['pseudonym']);
    return [
        'pflicht'       => $teile === null,
        'pseudonym'     => $teile === null ? '' : (string)$z['pseudonym'],
        'teil'          => $teile['teil'] ?? '',
        'kennung'       => $kennung,
        'nur_baukasten' => pu_pseudo_nur_baukasten($z),
        'aenderbar_ab'  => pu_pseudo_aenderbar_ab($z),
        'sperrtage'     => PU_PSEUDO_SPERRTAGE,
    ];
}

/**
 * Setzt den Namensteil. Die Kennung bleibt, der volle Name wird daraus.
 *
 * Leer setzen heisst zurücksetzen (etwa durch die Verwaltung, wenn ein Name
 * nicht passt): Das geht ohne Frist, und beim nächsten Anmelden kommt die
 * Pflicht zur Wahl wieder.
 *
 * @return string der volle Name, '' beim Zurücksetzen
 * @throws RuntimeException mit einem Text aus PU_PSEUDO_TEXTE
 */
function pu_pseudo_setzen(int $id, string $teil): string
{
    $z = pu_pseudo_konto($id);
    if ($z === null) throw new RuntimeException('Dieses Konto gibt es nicht.');

    $teil = trim($teil);
    if ($teil === '') {
        pu_db()->prepare("UPDATE lernende SET pseudonym = '', pseudonym_seit = '' WHERE id = ?")->execute([$id]);
        return '';
    }
    // Wer den vollen Namen hineinreicht, meint den Namensteil.
    $teil = pu_pseudo_zerlegen($teil)['teil'] ?? $teil;

    $fehler = pu_pseudo_teil_fehler($teil, $z);
    if ($fehler !== null) throw new RuntimeException(PU_PSEUDO_TEXTE[$fehler]);

    $voll = $teil . '_' . pu_pseudo_kennung($id);
    if ($voll === (string)$z['pseudonym']) return $voll;
    if (pu_pseudo_aenderbar_ab($z) !== '' && pu_pseudo_zerlegen((string)$z['pseudonym']) !== null) {
        throw new RuntimeException(PU_PSEUDO_TEXTE['frist']);
    }

    pu_db()->prepare('UPDATE lernende SET pseudonym = ?, pseudonym_seit = ? WHERE id = ?')
           ->execute([$voll, gmdate('Y-m-d H:i:s'), $id]);
    return $voll;
}
