<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Personas: einen Kurs mit fremden Augen durchgehen.
 *
 * Dieselbe Lektion, dieselbe Aufgabe, derselbe Tutor — und vier verschiedene
 * Antworten. Das ist die **Dialektik** der Academy: Ein Zwölfjähriger bekommt
 * eine andere Erklärung als die Schulleitung, und beide sollen richtig sein.
 *
 * Nachprüfen liess sich das bisher nur, indem man sich viermal an- und
 * abmeldete. Vier Sitzungen für einen Vergleich, und zwischen dem ersten und
 * dem vierten Blick liegen Minuten — man vergleicht dann Erinnerungen, nicht
 * Antworten.
 *
 * ## Was eine Persona ändert — und was ausdrücklich nicht
 *
 * Sie überlagert **das Profil**, aus dem sich der Stoff formt:
 *
 *   · den Systemtext der Tutoren (`pu_profil_block`, `pu_ebenen_kontext`)
 *   · welche Aufnahmen und Sprechertexte gezeigt werden
 *
 * Sie ändert **keine Rechte**. Das ist die wichtigste Zeile dieser Datei.
 * Würde sie es tun, könnte sich der Admin als Schüler aussperren — und käme
 * dann nicht mehr an den Knopf, mit dem er zurückschaltet. Eine Vorschau, aus
 * der man nicht herausfindet, ist keine Vorschau, sondern eine Falle.
 *
 * Sie ändert auch **nichts an der Datenbank**. Sie steht in der Sitzung und
 * ist mit dem Abmelden weg. Kein Konto wird umgeschrieben, kein Fortschritt
 * verfälscht.
 */

/**
 * Die Vorlagen.
 *
 * `kontext` zeigt auf den Ordner in `secondbrain/000_Kontext/`, `zielgruppe`
 * auf den Aufnahmen-Unterordner. Beide Namen stehen hier, damit man sieht,
 * dass sie NICHT immer gleich heissen: die Ebene `verwaltung` heisst bei den
 * Aufnahmen `schule`.
 */
const PU_PERSONEN = [
    'schule' => [
        'name'   => 'Schulleitung',
        'rolle'  => 'verwaltung',
        'alter'  => 52,
        'gruppe' => '',
        'was'    => 'Ordnet ein: Lehrplan, Zeit, Aufwand.',
    ],
    'lehrer' => [
        'name'   => 'Lehrkraft',
        'rolle'  => 'lehrer',
        'alter'  => 41,
        'gruppe' => '',
        'was'    => 'Braucht Unterrichtsware: Einstieg, Fehlvorstellung, Übung.',
    ],
    'eltern' => [
        'name'   => 'Elternteil',
        'rolle'  => 'eltern',
        'alter'  => 44,
        'gruppe' => '',
        'was'    => 'Will wissen, was das Kind lernt und warum es sich lohnt.',
    ],
    'schueler' => [
        'name'   => 'Lernende:r',
        'rolle'  => 'schueler',
        'alter'  => 12,
        'gruppe' => '6a',
        'was'    => 'Wird direkt angesprochen. Das Alter entscheidet den Ton.',
        // Nur für Lernende: Das Alter ist hier die eigentliche Stellschraube.
        // Ein Zehnjähriger und ein Siebzehnjähriger bekommen denselben Stoff
        // in zwei verschiedenen Sprachen — und genau das soll vergleichbar sein.
        'klassen' => [
            '5a'  => 10, '6a' => 11, '7a' => 12, '8a' => 13,
            '9a'  => 14, '10a' => 15, 'Q1' => 17,
        ],
    ],
];

/**
 * Nur Ebene 1. Dieselbe Prüfung wie beim Minus-Rahmen, aus demselben Grund.
 *
 * `$wer` ist im Betrieb immer null — dann wird die angemeldete Person gefragt.
 * Der Parameter ist für die Prüfungen da: `pu_wer()` merkt sich seine Antwort
 * für die Dauer des Aufrufs (statischer Zwischenspeicher), und ein Test, der
 * zwei Konten vergleichen will, käme sonst nicht an das zweite heran.
 */
function pu_persona_darf(?array $wer = null): bool
{
    require_once PU_ROOT . '/srv/rechte.php';
    return pu_ebene($wer) === 'admin';
}

/**
 * Die gerade eingenommene Persona — oder null.
 *
 * Sie wird bei JEDEM Zugriff gegen das Recht geprüft, nicht nur beim Setzen.
 * Sonst bliebe eine Persona wirksam, die jemand gesetzt hat, bevor ihm die
 * Ebene entzogen wurde.
 */
function pu_persona(?array $wer = null): ?array
{
    if (empty($_SESSION['persona']) || !is_array($_SESSION['persona'])) return null;
    if (!pu_persona_darf($wer)) return null;
    return $_SESSION['persona'];
}

/**
 * Persona einnehmen oder ablegen.
 *
 * @param string $schluessel  einer aus PU_PERSONEN, oder '' zum Ablegen
 * @param string $klasse      nur bei 'schueler': setzt Klasse UND Alter
 */
function pu_persona_setzen(string $schluessel, string $klasse = '', ?array $wer = null): ?array
{
    if (!pu_persona_darf($wer)) {
        throw new RuntimeException('Personas sind der Ebene 1 vorbehalten.');
    }

    if ($schluessel === '') { unset($_SESSION['persona']); return null; }

    $v = PU_PERSONEN[$schluessel] ?? null;
    if ($v === null) throw new RuntimeException('Diese Persona gibt es nicht: ' . $schluessel);

    $alter  = (int)$v['alter'];
    $gruppe = (string)$v['gruppe'];

    if ($klasse !== '' && isset($v['klassen'][$klasse])) {
        $gruppe = $klasse;
        $alter  = (int)$v['klassen'][$klasse];
    }

    $_SESSION['persona'] = [
        'schluessel' => $schluessel,
        'name'       => $v['name'],
        'rolle'      => $v['rolle'],
        'lebensalter'=> $alter,
        'gruppe'     => $gruppe,
    ];

    pu_protokoll(pu_wer()['id'] ?? 0, 'persona', $schluessel,
                 $gruppe !== '' ? $gruppe . ', ' . $alter . ' Jahre' : (string)$alter . ' Jahre');

    return $_SESSION['persona'];
}

/**
 * Das Profil, mit dem der Stoff geformt wird.
 *
 * **Der eine Ort, an dem die Persona wirkt.** Wer die Antwort eines Tutors
 * bauen will, fragt hier und nicht bei `pu_profil()`. Alles andere —
 * Kontoliste, Klassenübersicht, Urkunden — fragt weiter direkt und sieht
 * deshalb immer die Wahrheit.
 *
 * Die Überlagerung greift nur für die **eigene** Kennung. Wer die Klasse
 * ansieht, sieht seine Schüler unverändert; sonst trüge plötzlich jedes Kind
 * das Alter der Persona.
 */
function pu_profil_wirksam(int $id): ?array
{
    require_once PU_ROOT . '/srv/profil.php';

    $echt = pu_profil($id);
    if ($echt === null) return null;

    $p = pu_persona();
    if ($p === null) return $echt;

    $ich = pu_wer();
    if ($ich === null || (int)$ich['id'] !== $id) return $echt;

    return array_merge($echt, [
        'rolle'       => $p['rolle'],
        'lebensalter' => (int)$p['lebensalter'],
        'gruppe'      => $p['gruppe'],
        // Der angezeigte Name wandert mit: Im Systemtext steht sonst „Solon,
        // 60 Jahre, Schüler in 6a" — eine Person, die es nicht gibt, und das
        // Modell reimt sich etwas darauf zusammen.
        'anzeigename' => $p['name'],
        'pseudonym'   => '',
    ]);
}

/** Für die Oberfläche: was zur Wahl steht und was gerade gilt. */
function pu_persona_liste(): array
{
    $aus = [];
    foreach (PU_PERSONEN as $k => $v) {
        $aus[] = [
            'schluessel' => $k,
            'name'       => $v['name'],
            'was'        => $v['was'],
            'alter'      => $v['alter'],
            'klassen'    => $v['klassen'] ?? [],
        ];
    }
    return ['personen' => $aus, 'jetzt' => pu_persona(), 'darf' => pu_persona_darf()];
}
