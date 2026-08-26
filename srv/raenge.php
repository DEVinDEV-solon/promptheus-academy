<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Ränge und Abzeichen, je Ebene verschieden.
 *
 * **Der Mangel, den das hier behebt:** Auf der Fortschrittsseite standen
 * „Funke", „Flamme", „Fackel" und acht Abzeichen — ohne ein Wort darüber,
 * woran sie hängen. Wer das nicht erraten hat, hat es nicht verstanden, und
 * eine Auszeichnung, deren Bedingung man nicht kennt, motiviert niemanden.
 *
 * Deshalb trägt hier **jede** Leiter ihre Messgrösse mit: `woran` steht als
 * Satz daneben, und die Oberfläche schreibt ihn hin.
 *
 * **Und je Ebene eine andere.** Ein Elternteil löst keine Aufgaben — ihm
 * „Funke, 0 Punkte" anzuzeigen, wäre eine Auszeichnung für etwas, das er gar
 * nicht tun soll. Eine Lehrkraft misst sich nicht an eigenen Punkten,
 * sondern daran, wie weit ihre Klasse kommt. Eine Schulleitung an der
 * Reichweite. Nur der Lernende sammelt Punkte.
 *
 * Die Feuer-Bilder bleiben durchgehend — es ist dieselbe Academy. Was sich
 * ändert, ist, **wofür** das Feuer steht: beim Schüler für das eigene
 * Lernen, beim Lehrer für das Weitergeben, bei den Eltern für das
 * Begleiten, bei der Schule für das Verbreiten.
 */

/**
 * Die vier Leitern.
 *
 * `stufen` ist aufsteigend: Schwelle => Name. `woran` sagt in einem Satz,
 * was gezählt wird — das ist die Zeile, die vorher fehlte.
 */
const PU_RANGLEITERN = [
    'schueler' => [
        'was'    => 'Punkte',
        'woran'  => 'Punkte aus gelösten Aufgaben. Hinweise kosten, Tempo bringt '
                  . 'einen kleinen Bonus, und die Tages-Challenge gibt extra.',
        'einheit'=> 'Punkte',
        'stufen' => [
            0     => 'Funke',
            500   => 'Flamme',
            1500  => 'Fackel',
            3500  => 'Feuer',
            7000  => 'Inferno',
            12000 => 'Prometheus',
        ],
    ],

    'lehrer' => [
        'was'    => 'begleitete Lernende',
        'woran'  => 'Wie viele deiner Lernenden mindestens eine Aufgabe gelöst haben. '
                  . 'Nicht deine eigenen Punkte — es geht nicht darum, dass du lernst, '
                  . 'sondern dass sie es tun.',
        'einheit'=> 'Lernende in Bewegung',
        'stufen' => [
            0  => 'Anzünder',
            1  => 'Funkenschläger',
            5  => 'Fackelträger',
            15 => 'Feuerhüter',
            30 => 'Lichtbringer',
        ],
    ],

    'eltern' => [
        'was'    => 'Fortschritt des Kindes',
        'woran'  => 'Wie weit dein Kind gekommen ist — nicht, wie oft du hier warst. '
                  . 'Die Academy zählt nicht mit, wer zuschaut.',
        'einheit'=> 'gelöste Aufgaben deines Kindes',
        'stufen' => [
            0  => 'Neugierig',
            1  => 'Mitlesend',
            10 => 'Begleitend',
            30 => 'Vertraut',
            60 => 'Weggefährte',
        ],
    ],

    'verwaltung' => [
        'was'    => 'aktive Lernende',
        'woran'  => 'Wie viele Lernende an dieser Einrichtung schon etwas gelöst haben. '
                  . 'Eine Zahl über die Reichweite, keine über die Qualität.',
        'einheit'=> 'aktive Lernende',
        'stufen' => [
            0   => 'Erste Kerze',
            1   => 'Ein Klassenraum',
            25  => 'Ein Jahrgang',
            75  => 'Die Schule',
            200 => 'Leuchtturm',
        ],
    ],
];

/** Ebene 1 misst nichts — sie betreibt. */
function pu_rangleiter(string $ebene): ?array
{
    if ($ebene === 'admin') return null;
    return PU_RANGLEITERN[$ebene] ?? PU_RANGLEITERN['schueler'];
}

/**
 * Womit diese Person gemessen wird — die eine Zahl hinter ihrem Rang.
 *
 * Jede Ebene zählt etwas anderes. Gezählt wird immer **Bewegung**, nicht
 * Anwesenheit: wer angemeldet ist, zählt nicht; wer etwas gelöst hat, zählt.
 */
function pu_rang_zahl(int $person, string $ebene): int
{
    require_once PU_ROOT . '/srv/profil.php';
    require_once PU_ROOT . '/srv/punkte.php';

    $pdo = pu_db();
    $p   = pu_profil($person);
    if ($p === null) return 0;

    return match ($ebene) {
        'schueler' => (int)pu_konto($person)['summe'],

        'lehrer' => (int)(function () use ($pdo, $p) {
            if ($p['gruppe'] === '') return 0;
            $st = $pdo->prepare(
                "SELECT COUNT(DISTINCT v.lernender) FROM versuche v
                 JOIN lernende l ON l.id = v.lernender
                 WHERE l.gruppe = ? AND l.rolle = 'schueler' AND v.richtig = 1");
            $st->execute([$p['gruppe']]);
            return $st->fetchColumn();
        })(),

        'eltern' => (int)(function () use ($pdo, $p) {
            if ($p['kind_von'] === 0) return 0;
            $st = $pdo->prepare(
                'SELECT COUNT(DISTINCT aufgabe_id) FROM versuche
                 WHERE lernender = ? AND richtig = 1');
            $st->execute([$p['kind_von']]);
            return $st->fetchColumn();
        })(),

        'verwaltung' => (int)(function () use ($pdo, $p) {
            if ($p['schule'] === '') return 0;
            $st = $pdo->prepare(
                "SELECT COUNT(DISTINCT v.lernender) FROM versuche v
                 JOIN lernende l ON l.id = v.lernender
                 WHERE l.schule = ? AND l.rolle = 'schueler' AND v.richtig = 1");
            $st->execute([$p['schule']]);
            return $st->fetchColumn();
        })(),

        default => 0,
    };
}

/**
 * Der vollständige Rang: wo man steht, was das heisst, was fehlt.
 *
 * @return array|null null für Ebene 1 — der Betrieb hat keinen Rang
 */
function pu_rang(int $person, string $ebene = ''): ?array
{
    require_once PU_ROOT . '/srv/rechte.php';
    require_once PU_ROOT . '/srv/profil.php';

    if ($ebene === '') $ebene = pu_ebene(pu_profil($person) ?? []);

    $leiter = pu_rangleiter($ebene);
    if ($leiter === null) return null;

    $zahl = pu_rang_zahl($person, $ebene);

    $jetzt   = '';
    $naechst = null;
    foreach ($leiter['stufen'] as $grenze => $name) {
        if ($zahl >= $grenze) {
            $jetzt = $name;
        } elseif ($naechst === null) {
            $naechst = ['name' => $name, 'grenze' => $grenze, 'fehlt' => $grenze - $zahl];
        }
    }

    return [
        'ebene'    => $ebene,
        'rang'     => $jetzt,
        'zahl'     => $zahl,
        'einheit'  => $leiter['einheit'],
        'woran'    => $leiter['woran'],
        'was'      => $leiter['was'],
        'naechst'  => $naechst,
        'stufen'   => $leiter['stufen'],
        'hoechste' => $naechst === null,
    ];
}

// ---------------------------------------------------------------- Abzeichen

/**
 * Welche Abzeichen gelten für welche Ebene.
 *
 * Die acht bestehenden gehören dem Lernenden — sie messen gelöste Aufgaben.
 * Für die anderen drei gibt es eigene, kurze Reihen: was ihnen tatsächlich
 * gelingt, ist etwas anderes als das, was ein Schüler schafft.
 *
 * Bewusst wenige. Acht Abzeichen für einen Elternteil, der zweimal im Monat
 * hineinsieht, wären acht Enttäuschungen.
 */
const PU_ABZEICHEN_EBENE = [
    'lehrer' => [
        'erste_klasse' => [
            'symbol' => '🎒', 'name' => 'Erste Klasse',
            'bedingung' => 'Ein Lernender deiner Gruppe hat etwas gelöst',
            'ab' => 1,
        ],
        'halbe_klasse' => [
            'symbol' => '👥', 'name' => 'Die halbe Klasse',
            'bedingung' => '15 Lernende deiner Gruppe sind in Bewegung',
            'ab' => 15,
        ],
        'voller_raum' => [
            'symbol' => '🏫', 'name' => 'Voller Raum',
            'bedingung' => '30 Lernende deiner Gruppe sind in Bewegung',
            'ab' => 30,
        ],
    ],
    'eltern' => [
        'erster_blick' => [
            'symbol' => '👀', 'name' => 'Erster Blick',
            'bedingung' => 'Dein Kind hat die erste Aufgabe gelöst',
            'ab' => 1,
        ],
        'dran_geblieben' => [
            'symbol' => '🤝', 'name' => 'Drangeblieben',
            'bedingung' => 'Dein Kind hat 30 Aufgaben gelöst',
            'ab' => 30,
        ],
    ],
    'verwaltung' => [
        'angefangen' => [
            'symbol' => '🕯️', 'name' => 'Angefangen',
            'bedingung' => 'Der erste Lernende der Einrichtung ist in Bewegung',
            'ab' => 1,
        ],
        'ein_jahrgang' => [
            'symbol' => '🏫', 'name' => 'Ein Jahrgang',
            'bedingung' => '25 Lernende der Einrichtung sind in Bewegung',
            'ab' => 25,
        ],
        'leuchtturm' => [
            'symbol' => '🗼', 'name' => 'Leuchtturm',
            'bedingung' => '200 Lernende der Einrichtung sind in Bewegung',
            'ab' => 200,
        ],
    ],
];

/**
 * Die Abzeichen einer Ebene mit Stand.
 *
 * Für Lernende bleibt der bestehende Katalog aus `srv/badges.php` — er misst
 * einzelne Leistungen (Freitexte, Denkaufgaben, Serien) und ist mehr als eine
 * Schwelle. Für die anderen drei reicht die Zahl aus `pu_rang_zahl()`.
 */
function pu_abzeichen(int $person, string $ebene): array
{
    if ($ebene === 'schueler') {
        require_once PU_ROOT . '/srv/badges.php';
        $hat = pu_badges($person);
        $aus = [];
        foreach (pu_badge_katalog() as $kennung => $b) {
            $aus[] = [
                'kennung'   => $kennung,
                'symbol'    => $b['symbol'],
                'name'      => $b['name'],
                'bedingung' => $b['bedingung'],
                'hat'       => in_array($kennung, $hat, true),
            ];
        }
        return $aus;
    }

    $reihe = PU_ABZEICHEN_EBENE[$ebene] ?? [];
    if ($reihe === []) return [];

    $zahl = pu_rang_zahl($person, $ebene);
    $aus  = [];
    foreach ($reihe as $kennung => $b) {
        $aus[] = [
            'kennung'   => $kennung,
            'symbol'    => $b['symbol'],
            'name'      => $b['name'],
            'bedingung' => $b['bedingung'],
            'hat'       => $zahl >= $b['ab'],
        ];
    }
    return $aus;
}
