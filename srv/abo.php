<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Zugangspläne, Token-Konto, Finanzzentrale.
 *
 * **Hier wird nichts bezahlt.** Es wird gebucht. Ein Zahlungsdienst braucht
 * einen erreichbaren Server, ein Händlerkonto, AGB und eine
 * Widerrufsbelehrung — die Academy läuft auf 127.0.0.1. Was hier passiert, ist
 * die Buchführung davor: wer welchen Plan hat, seit wann, was verbraucht
 * wurde. „Buchen" merkt vor; bestätigt wird von Hand auf Ebene 1.
 *
 * **Der Kontostand ist die Summe der Buchungen.** Er steht nirgends
 * gespeichert. Dieselbe Entscheidung wie bei den Punkten, und aus demselben
 * Grund: ein zweiter Ort für dieselbe Zahl ist der Ort, an dem sie irgendwann
 * abweicht — bei Geld merkt man das erst, wenn jemand sich beschwert.
 *
 * **Verbraucht wird, was gemessen wurde.** Über OpenRouter kommt die
 * tatsächlich abgerechnete Tokenzahl zurück; die wird gebucht. Wo nicht
 * gemessen werden kann (Claude-CLI, Sprachdauer), steht `geschaetzt = 1` an
 * der Buchung, und das Cockpit schreibt es hin. Eine Zahl, die sich als
 * genauer ausgibt, als sie ist, ist schlimmer als keine.
 */

// ---------------------------------------------------------------- Die Preistafel
//
// Alle Beträge in Cent, damit nichts gerundet wird, was nicht gerundet werden
// soll. Monatlich, brutto, ohne ausgewiesene Umsatzsteuer — für eine
// Preisübersicht reicht das, für eine Rechnung nicht.
//
// Die Staffel ist so gelegt, dass die Schule **je Kopf am günstigsten** ist.
// Das ist keine Kosmetik: eine Einrichtung, die 300 Konten bezahlt, soll
// nicht mehr zahlen als 300 Einzelkonten, sonst zerfällt sie in Einzelkonten.
const PU_PLAENE = [
    'schueler' => [
        'name'        => 'Schüler',
        'cent'        => 990,
        'plaetze'     => 1,
        'traeger_art' => 'person',
        'kontingent'  => 150000,
        'kurz'        => 'Ein Lernender, ein Zugang.',
        'fuer'        => 'Wer allein lernt — zu Hause, ohne Schule dahinter.',
        'enthalten'   => [
            'Alle sechs Stufen und die Fachkurse',
            'Die vier Tutoren',
            'Urkunden mit Prüfcode',
            '150.000 Token im Monat',
        ],
    ],
    'familie' => [
        'name'        => 'Familie',
        'cent'        => 1990,
        'plaetze'     => 3,
        'eltern'      => 2,
        'traeger_art' => 'person',
        'kontingent'  => 400000,
        'kurz'        => 'Bis zu drei Kinder und zwei Elternkonten.',
        'fuer'        => 'Geschwister, und Eltern, die mitlesen wollen.',
        'enthalten'   => [
            'Alles aus dem Schüler-Plan, für bis zu 3 Kinder',
            '2 Elternzugänge mit Blick auf das eigene Kind',
            '400.000 Token im Monat für alle zusammen',
        ],
    ],
    'klasse' => [
        'name'        => 'Klasse',
        'cent'        => 12900,
        'plaetze'     => 30,
        'traeger_art' => 'klasse',
        'kontingent'  => 2000000,
        'kurz'        => 'Eine Lehrkraft, eine Klasse, bis zu 30 Schüler.',
        'fuer'        => 'Wenn eine Lehrkraft anfangen will, ohne dass die '
                       . 'ganze Schule mitzieht.',
        'enthalten'   => [
            'Bis zu 30 Schülerzugänge in einer Gruppe',
            '1 Lehrkraft mit Klassenübersicht und Lösungen',
            'Stoff prüfen, Kennwörter zurücksetzen',
            '2.000.000 Token im Monat für die Klasse',
        ],
    ],
    'schule' => [
        'name'        => 'Schule',
        'cent'        => 39900,
        'plaetze'     => 300,
        'traeger_art' => 'schule',
        'kontingent'  => 10000000,
        'kurz'        => 'Bis zu 300 Schüler, Lehrkräfte ohne Begrenzung.',
        'fuer'        => 'Die ganze Einrichtung — der günstigste Weg je Student.',
        'enthalten'   => [
            'Bis zu 300 Schülerzugänge',
            'Lehrkräfte und Elternkonten ohne Begrenzung',
            'Rechte-Matrix, eigene Academy-Regeln, Wartung',
            '10.000.000 Token im Monat für die Schule',
        ],
    ],
];

/** Die drei Nachkauf-Pakete. Gekaufte Token verfallen nicht. */
const PU_TOKENPAKETE = [
    'klein'  => ['name' => 'Klein',  'cent' => 500,  'tokens' => 500000],
    'mittel' => ['name' => 'Mittel', 'cent' => 1500, 'tokens' => 1750000],
    'gross'  => ['name' => 'Groß',   'cent' => 4000, 'tokens' => 5000000],
];

/**
 * Der Gratis-Testzugang: **100.000 Token, einmalig, beim Anlegen des Kontos.**
 *
 * Die Zahl ist nicht gegriffen. Das kleinste Paket kostet 5 € für 500.000
 * Token, also 100.000 Token je Euro — der Testzugang ist damit **genau einen
 * Euro wert**, gerechnet zum eigenen Ladenpreis und nicht zu einem, den wir uns
 * dafür zurechtlegen.
 *
 * Er verfällt **nicht** (`verfaellt = ''`) und zählt wie gekauftes Guthaben.
 * Ein Probierguthaben mit Ablaufdatum zwingt zum Ausprobieren unter Zeitdruck,
 * und das ist das Gegenteil dessen, wofür es da ist.
 *
 * Missbrauchsseite, offen benannt: wer viele Konten anlegt, sammelt viele
 * Testzugänge. Lokal ist das egal (es ist der eigene Rechner und der eigene
 * Schlüssel). Sobald die Gemeinde-Abrechnung läuft, hängt der Testzugang am
 * bezahlten Konto und nicht an der Kennung — siehe
 * TALENTE-TOKEN-COMMUNITY-VPS-PLAN, §7.
 */
const PU_PROBE_TOKEN = 100000;

/**
 * Schreibt den Testzugang gut — genau einmal je Konto.
 *
 * Die Sperre ist die Buchung selbst: gibt es schon eine Zeile der Art `probe`,
 * passiert nichts. Kein Merkfeld am Konto, das mit dem Journal auseinanderlaufen
 * könnte.
 */
function pu_probe_gutschreiben(int $person): bool
{
    $st = pu_db()->prepare(
        "SELECT COUNT(*) FROM token_buchungen WHERE lernender = ? AND art = 'probe'");
    $st->execute([$person]);
    if ((int)$st->fetchColumn() > 0) return false;

    pu_token_eintragen($person, 0, 'probe', 'Gratis-Testzugang', PU_PROBE_TOKEN);
    return true;
}

/**
 * Wofür Token draufgehen — die Pauschalen.
 *
 * `bereit => false` heisst: gibt es noch nicht. Die Zeilen stehen trotzdem
 * hier, weil sie erklären, wofür ein Paket reicht — aber die Oberfläche zeigt
 * sie grau und ohne Knopf. Eine Pauschale, die man nicht ausgeben kann, muss
 * auch so aussehen.
 *
 * Die fünf unteren gehören zur **Design-Werkstatt**: eine eigene Seite mit
 * linkem Menü, auf der Texte, Bilder, Präsentationen, Musik und Videos
 * entstehen. Sie kommt später; die Preise stehen schon, damit niemand ein
 * Paket kauft und hinterher erfährt, was es kostet.
 */
const PU_WERKZEUGE = [
    ['schluessel' => 'tutor',   'name' => 'Tutor fragen',          'bereit' => true,
     'pauschale' => 0,      'einheit' => 'gemessen je Antwort',
     'was' => 'Was das Modell wirklich verbraucht hat — nicht geschätzt.'],
    ['schluessel' => 'sprache', 'name' => 'Sprachnachricht',       'bereit' => true,
     'pauschale' => 1000,   'einheit' => 'je angefangene Minute',
     'was' => 'Erkennung läuft auf diesem Rechner. Der Betrag deckt die Rechenzeit.'],
    ['schluessel' => 'dokument','name' => 'Dokument hochladen',    'bereit' => false,
     'pauschale' => 250,    'einheit' => 'je 1.000 Zeichen',
     'was' => 'Ein Dokument als Zusammenhang für eine Frage.'],

    ['schluessel' => 'text',    'name' => 'Text erzeugen',         'bereit' => false,
     'pauschale' => 1000,   'einheit' => 'je 700 Wörter', 'werkstatt' => true,
     'was' => 'Entwürfe, Zusammenfassungen, Umschreiben.'],
    ['schluessel' => 'bild',    'name' => 'Bild',                  'bereit' => false,
     'pauschale' => 4000,   'einheit' => 'je Bild', 'werkstatt' => true,
     'was' => 'Illustrationen für eigene Kurse und Präsentationen.'],
    ['schluessel' => 'folien',  'name' => 'Präsentation',          'bereit' => false,
     'pauschale' => 25000,  'einheit' => 'je 10 Folien', 'werkstatt' => true,
     'was' => 'Foliensatz mit Gliederung, Text und Bildern.'],
    ['schluessel' => 'musik',   'name' => 'Musik',                 'bereit' => false,
     'pauschale' => 40000,  'einheit' => 'je 30 Sekunden', 'werkstatt' => true,
     'was' => 'Hintergrundmusik und Jingles für eigene Videos.'],
    ['schluessel' => 'video',   'name' => 'Video',                 'bereit' => false,
     'pauschale' => 120000, 'einheit' => 'je 10 Sekunden', 'werkstatt' => true,
     'was' => 'Kurze Erklärvideos aus Text und Bildern.'],
];

/** Token je angefangene Minute Sprachnachricht. */
const PU_TOKEN_JE_MINUTE = 1000;

// ---------------------------------------------------------------- Der Minus-Rahmen
/**
 * **Wie weit ein Konto ins Minus laufen darf — und warum es das überhaupt darf.**
 *
 * Zwei Fehler sind hier möglich, und der eine ist genauso schlimm wie der andere.
 *
 * Der erste: hart bei null abschalten. Dann sitzt ein Kind mitten in der Aufgabe
 * vor einem Tutor, der nicht mehr antwortet, und lernt die falsche Lektion —
 * nämlich dass Lernen aufhört, wenn Geld aufhört. Genau deshalb stand hier
 * lange gar keine Grenze.
 *
 * Der zweite: gar nicht abschalten. Dann läuft das Minus, solange jemand
 * weitermacht, und die Rechnung wächst ohne Deckel. Das ist kein hypothetischer
 * Fall: ein Konto, das nie aufhört zu fragen, ist der Normalfall bei jemandem,
 * dem es Spass macht.
 *
 * Der Rahmen ist der Ausweg: **das Minus ist erlaubt, aber es ist endlich.**
 * Es trägt über die angefangene Lektion und hört danach auf.
 *
 * ## Woher die 40.000 kommen
 *
 * Nicht gegriffen, sondern aus dem Journal dieser Academy gerechnet:
 *
 * - Eine Tutorantwort kostet **im Schnitt 3.300 Token** (21 echte Antworten in
 *   `token_buchungen`, Spanne 2.906 bis 4.397 — gemessen, nicht geschätzt).
 * - Die längste Lektion der Academy hat **3,4 Aufgaben** (01_Entdecker: 24
 *   Aufgaben auf 7 Lektionen). Aufgerundet: 4.
 * - **Viel Unterstützung** heisst hier: dreimal fragen je Aufgabe. Einmal beim
 *   Anfangen, einmal beim Feststecken, einmal nach der Abgabe. Wer öfter fragt,
 *   lässt sich die Aufgabe erzählen.
 *
 * 4 Aufgaben × 3 Antworten × 3.300 Token = 39.600 → **40.000**.
 *
 * Das ist die Grenze, die der Nutzer beschrieben hat: weit genug, dass man eine
 * ganze Lektion zu Ende bringt und nicht mitten im Satz abgeschnitten wird —
 * und nah genug, dass man am Ende weiss, dass man nur so weit gekommen ist,
 * *weil* dauernd jemand geholfen hat.
 *
 * **Einmal je Konto, nicht einmal je Lektion.** Ein Rahmen, der sich mit jeder
 * neuen Lektion erneuert, ist wieder unendlich, nur langsamer. Er wird
 * verbraucht und dann ist er verbraucht; erst eine Einzahlung öffnet ihn wieder,
 * und zwar dadurch, dass das Konto gar nicht mehr im Minus steht.
 *
 * Gerechnet wird er wie alles hier: aus den Buchungen. Es gibt kein Feld
 * „Rahmen verbraucht", das mit dem Journal auseinanderlaufen könnte.
 */
const PU_MINUS_RAHMEN = 40000;

/**
 * Ab wann gewarnt wird: wenn weniger als **eine Lektion** übrig ist.
 *
 * Dieselbe Zahl, absichtlich. Die Warnung sagt damit etwas Wahres und
 * Nachprüfbares — „das reicht noch etwa für eine Lektion" — statt einer
 * Prozentzahl, die niemandem sagt, wie lange er noch arbeiten kann.
 */
const PU_TOKEN_WARNUNG = PU_MINUS_RAHMEN;

/**
 * Was eine Tutorantwort im Schnitt kostet — die Zahl, mit der aus Token eine
 * Vorstellung wird.
 *
 * „Noch 38.000 Token" sagt niemandem etwas. „Noch ungefähr elf Antworten" sagt
 * jedem alles. Umgerechnet wird deshalb überall, wo ein Mensch die Zahl liest.
 *
 * Gemessen an 21 echten Antworten im Journal (Schnitt 3.315, Spanne 2.906 bis
 * 4.397). Aufgerundet auf 3.300, weil eine Schätzung, die zu wenig Antworten
 * verspricht, der freundlichere Fehler ist als eine, die zu viele verspricht.
 */
const PU_TUTORANTWORT = 3300;

// ---------------------------------------------------------------- Nachschlagen

function pu_plan(string $name): ?array
{
    return PU_PLAENE[$name] ?? null;
}

/** Cent als „4,90 €". */
function pu_eur(int $cent): string
{
    return number_format($cent / 100, 2, ',', '.') . ' €';
}

/** Was ein Platz im Monat kostet — die Zahl, die die Staffel begründet. */
function pu_plan_je_kopf(array $plan): int
{
    return (int)round($plan['cent'] / max(1, $plan['plaetze']));
}

// ---------------------------------------------------------------- Abo finden

/**
 * Welches Abo trägt dieses Konto?
 *
 * Drei Stufen, in dieser Reihenfolge: das eigene Abo, das der Klasse, das der
 * Schule. Ein Schüler ohne eigenes Abo ist über seine Klasse gedeckt, und
 * diese Klasse ist sein `gruppe`-Eintrag — es muss nirgends eine
 * Mitgliederliste gepflegt werden, die dann veraltet.
 *
 * Gefunden wird nur, was **läuft**. Ein beendetes Abo deckt niemanden.
 */
function pu_abo_fuer(int $person): ?array
{
    require_once PU_ROOT . '/srv/profil.php';

    $p = pu_profil($person);
    if ($p === null) return null;

    $pdo = pu_db();

    // 1. Eigenes Abo
    $st = $pdo->prepare(
        "SELECT * FROM abos WHERE traeger_art = 'person' AND traeger = ? AND laeuft = 1
         ORDER BY id DESC LIMIT 1");
    $st->execute([$person]);
    $a = $st->fetch();
    if ($a !== false) return pu_abo_aufbereiten($a);

    // 2. Abo der Klasse — der Fall „eine Lehrkraft meldet ihre Klasse an"
    if ($p['gruppe'] !== '') {
        $st = $pdo->prepare(
            "SELECT * FROM abos WHERE traeger_art = 'klasse' AND traeger_name = ? AND laeuft = 1
             ORDER BY id DESC LIMIT 1");
        $st->execute([$p['gruppe']]);
        $a = $st->fetch();
        if ($a !== false) return pu_abo_aufbereiten($a);
    }

    // 3. Abo der Schule
    if ($p['schule'] !== '') {
        $st = $pdo->prepare(
            "SELECT * FROM abos WHERE traeger_art = 'schule' AND traeger_name = ? AND laeuft = 1
             ORDER BY id DESC LIMIT 1");
        $st->execute([$p['schule']]);
        $a = $st->fetch();
        if ($a !== false) return pu_abo_aufbereiten($a);
    }

    return null;
}

/** Ergänzt ein Abo aus der Datenbank um alles, was sich ausrechnen lässt. */
function pu_abo_aufbereiten(array $a): array
{
    $plan = pu_plan((string)$a['plan']) ?? PU_PLAENE['schueler'];

    return [
        'id'               => (int)$a['id'],
        'plan'             => (string)$a['plan'],
        'plan_name'        => $plan['name'],
        'traeger_art'      => (string)$a['traeger_art'],
        'traeger'          => (int)$a['traeger'],
        'traeger_name'     => (string)$a['traeger_name'],
        'start'            => (string)$a['start'],
        'naechste_zahlung' => (string)$a['naechste_zahlung'],
        'laeuft'           => ((int)$a['laeuft']) === 1,
        'bestaetigt'       => ((int)$a['bestaetigt']) === 1,
        'notiz'            => (string)$a['notiz'],
        'cent'             => (int)$plan['cent'],
        'preis'            => pu_eur((int)$plan['cent']),
        'plaetze'          => (int)$plan['plaetze'],
        'kontingent'       => (int)$plan['kontingent'],
        'belegt'           => pu_plaetze_belegt($a),
    ];
}

/**
 * Wie viele Plätze sind belegt?
 *
 * Gezählt werden **Lernende**, nicht alle Konten: eine Lehrkraft und ein
 * Elternteil belegen keinen Schülerplatz. Sonst wäre eine Klasse mit 30
 * Kindern und einem Lehrer schon beim Anlegen voll.
 */
function pu_plaetze_belegt(array $abo): int
{
    $pdo = pu_db();

    return match ((string)$abo['traeger_art']) {
        'klasse' => (int)(function () use ($pdo, $abo) {
            $st = $pdo->prepare(
                "SELECT COUNT(*) FROM lernende WHERE gruppe = ? AND rolle = 'schueler'");
            $st->execute([(string)$abo['traeger_name']]);
            return $st->fetchColumn();
        })(),
        'schule' => (int)(function () use ($pdo, $abo) {
            $st = $pdo->prepare(
                "SELECT COUNT(*) FROM lernende WHERE schule = ? AND rolle = 'schueler'");
            $st->execute([(string)$abo['traeger_name']]);
            return $st->fetchColumn();
        })(),
        default => 1,
    };
}

/**
 * Ist noch Platz? Wird beim ANLEGEN eines Kontos gefragt, nicht beim Anmelden.
 *
 * Wer schon drin ist, fliegt nicht raus, weil jemand anders einen Platz
 * belegt hat. Ein Kind, das sich mitten im Kurs nicht mehr anmelden kann,
 * versteht die Welt nicht mehr — und hat recht damit.
 */
function pu_platz_frei(string $gruppe, string $schule): array
{
    $pdo = pu_db();

    foreach ([['klasse', $gruppe], ['schule', $schule]] as [$art, $name]) {
        if ($name === '') continue;

        $st = $pdo->prepare(
            "SELECT * FROM abos WHERE traeger_art = ? AND traeger_name = ? AND laeuft = 1
             ORDER BY id DESC LIMIT 1");
        $st->execute([$art, $name]);
        $a = $st->fetch();
        if ($a === false) continue;

        $abo  = pu_abo_aufbereiten($a);
        $frei = $abo['plaetze'] - $abo['belegt'];

        if ($frei <= 0) {
            return ['ok' => false, 'abo' => $abo,
                    'grund' => sprintf('Der Plan „%s" für %s ist voll: %d von %d Plätzen belegt.',
                                       $abo['plan_name'], $name, $abo['belegt'], $abo['plaetze'])];
        }
        return ['ok' => true, 'abo' => $abo, 'frei' => $frei, 'grund' => ''];
    }

    // Kein Abo gefunden — dann gibt es auch keine Grenze. Die Academy läuft ohne
    // Plan weiter; sie ist ein Lernprogramm, keine Schranke.
    return ['ok' => true, 'abo' => null, 'frei' => -1, 'grund' => ''];
}

// ---------------------------------------------------------------- Abo buchen

/**
 * Legt ein Abo an — vorgemerkt, nicht bezahlt.
 *
 * `bestaetigt = 0`, bis Ebene 1 den Haken setzt. Bis dahin läuft alles: der
 * Zugang ist offen, das Kontingent ist gutgeschrieben, und überall steht
 * dran, dass die Bestätigung fehlt. Ein Zugang, der auf eine Überweisung
 * wartet, ist für eine Schulklasse am Montagmorgen kein Zugang.
 */
function pu_abo_buchen(string $art, int $traeger, string $traegerName,
                       string $plan, int $wer, string $notiz = ''): array
{
    $p = pu_plan($plan);
    if ($p === null) throw new RuntimeException('Diesen Plan gibt es nicht: ' . $plan);

    if (!in_array($art, ['person', 'klasse', 'schule'], true)) {
        throw new RuntimeException('Unbekannte Trägerart: ' . $art);
    }
    if ($art !== 'person' && trim($traegerName) === '') {
        throw new RuntimeException($art === 'klasse'
            ? 'Für einen Klassenplan fehlt der Klassenname.'
            : 'Für einen Schulplan fehlt der Name der Einrichtung.');
    }

    // **Ein Personenplan hat keinen Träger ausser dem Konto.** Wird trotzdem
    // ein Name mitgeschickt — das Formular zeigte das Feld lange auch dann —,
    // wird er hier verworfen und nicht gespeichert. Sonst stünde er in der
    // Datenbank, ohne irgendetwas zu bedeuten, und im Cockpit erschiene
    // „für dieses Konto PROMPTHEUS GYMNASIUM": zwei Angaben, die einander
    // widersprechen. Genau so ist es gemeldet worden.
    if ($art === 'person') $traegerName = '';

    // Der Plan muss zur Trägerart passen. Ein Schulplan auf einer Person
    // wäre 149 Euro für ein Konto, und niemand merkt es.
    if ($p['traeger_art'] !== $art) {
        throw new RuntimeException(sprintf('Der Plan „%s" gilt für %s, nicht für %s.',
                                           $p['name'], $p['traeger_art'], $art));
    }

    $pdo = pu_db();

    // Ein laufendes Abo desselben Trägers wird abgelöst, nicht verdoppelt.
    $st = $pdo->prepare(
        "UPDATE abos SET laeuft = 0 WHERE laeuft = 1 AND traeger_art = ?
         AND (traeger = ? OR (traeger_name <> '' AND traeger_name = ?))");
    $st->execute([$art, $traeger, trim($traegerName)]);

    $heute = pu_heute();
    $st = $pdo->prepare(
        'INSERT INTO abos (traeger_art, traeger, traeger_name, plan, start,
                           naechste_zahlung, laeuft, bestaetigt, notiz, angelegt_von, angelegt)
         VALUES (?,?,?,?,?,?,1,0,?,?,?)');
    $st->execute([$art, $traeger, trim($traegerName), $plan, $heute,
                  pu_monat_weiter($heute), trim($notiz), $wer, pu_jetzt()]);

    $id = (int)$pdo->lastInsertId();
    pu_kontingent_gutschreiben($id, $traeger, $p, $heute);
    pu_protokoll($wer, 'abo', $art . ':' . ($traegerName !== '' ? $traegerName : (string)$traeger), $plan);

    $st = $pdo->prepare('SELECT * FROM abos WHERE id = ?');
    $st->execute([$id]);
    return pu_abo_aufbereiten($st->fetch());
}

/** Setzt den Haken. Nur Ebene 1 — das ist der Ersatz für den Zahlungseingang. */
function pu_abo_bestaetigen(int $abo, int $wer): void
{
    $st = pu_db()->prepare('UPDATE abos SET bestaetigt = 1 WHERE id = ?');
    $st->execute([$abo]);
    pu_db()->prepare('UPDATE token_buchungen SET bestaetigt = 1 WHERE abo = ?')->execute([$abo]);
    pu_protokoll($wer, 'abo_bestaetigt', (string)$abo, '');
}

function pu_abo_beenden(int $abo, int $wer): void
{
    $st = pu_db()->prepare('UPDATE abos SET laeuft = 0 WHERE id = ?');
    $st->execute([$abo]);
    pu_protokoll($wer, 'abo_beendet', (string)$abo, '');
}

/** Ein Monat weiter, auf denselben Tag. Der 31. wird zum Monatsletzten. */
function pu_monat_weiter(string $tag): string
{
    $z = strtotime($tag);
    if ($z === false) $z = time();

    $j = (int)date('Y', $z);
    $m = (int)date('n', $z) + 1;
    $t = (int)date('j', $z);
    if ($m > 12) { $m = 1; $j++; }

    $letzter = (int)date('t', mktime(0, 0, 0, $m, 1, $j));
    return sprintf('%04d-%02d-%02d', $j, $m, min($t, $letzter));
}

/**
 * Der Monatswechsel — läuft beim ersten Aufruf nach dem Stichtag.
 *
 * Kein Cron: auf einem Rechner, der abends ausgeschaltet wird, feuert er
 * nicht, und dann fehlt das Kontingent bis zum nächsten Neustart. So passiert
 * es genau dann, wenn jemand die Academy benutzt — also wenn es gebraucht wird.
 *
 * @return int wie viele Abos verlängert wurden
 */
function pu_abos_verlaengern(): int
{
    $heute = pu_heute();
    $pdo   = pu_db();

    $faellig = $pdo->prepare('SELECT * FROM abos WHERE laeuft = 1 AND naechste_zahlung <= ?');
    $faellig->execute([$heute]);

    $n = 0;
    foreach ($faellig->fetchAll() as $a) {
        $plan = pu_plan((string)$a['plan']);
        if ($plan === null) continue;

        $neu = pu_monat_weiter((string)$a['naechste_zahlung']);
        // Bei langer Pause mehrfach weiterrücken, statt rückwirkend zu buchen.
        while ($neu <= $heute) $neu = pu_monat_weiter($neu);

        $st = $pdo->prepare('UPDATE abos SET naechste_zahlung = ? WHERE id = ?');
        $st->execute([$neu, (int)$a['id']]);

        pu_kontingent_gutschreiben((int)$a['id'], (int)$a['traeger'], $plan, $heute);
        $n++;
    }
    return $n;
}

// ---------------------------------------------------------------- Token

/**
 * Das Monatskontingent gutschreiben — je Abo und Zeitraum genau einmal.
 *
 * **Es verfällt nie**, wie gekaufte Token auch (Cockpit-Plan E4, vom User
 * bestätigt am 26.09.2026). Jede Gutschrift ist ein eigenes Los und wird für
 * sich gerechnet: Was 365 Tage nach der Buchung davon noch frei ist, bringt
 * die Einrichtung in Umlauf, 10 % bleiben. Das rechnet maßgeblich der Server;
 * hier wird nur gebucht und angezeigt.
 *
 * Bis 26.09.2026 verfiel das Kontingent am Monatsende, und `verfaellt` trug
 * das Ende des Zeitraums. Solche älteren Zeilen zählen jetzt voll mit; ihr
 * Datum dient nur noch dazu, denselben Zeitraum nicht zweimal gutzuschreiben.
 * Neue Zeilen lassen `verfaellt` leer und tragen den Zeitraum im Text.
 */
function pu_kontingent_gutschreiben(int $abo, int $person, array $plan, string $ab): void
{
    $bis    = pu_monat_weiter($ab);
    $wofuer = 'Monatskontingent ' . $plan['name'] . ' bis ' . $bis;

    // Nicht zweimal im selben Zeitraum — alte Zeilen (Datum in `verfaellt`)
    // und neue (Zeitraum im Text) gleichermassen.
    $st = pu_db()->prepare(
        "SELECT COUNT(*) FROM token_buchungen
          WHERE abo = ? AND art = 'kontingent' AND (verfaellt = ? OR wofuer = ?)");
    $st->execute([$abo, $bis, $wofuer]);
    if ((int)$st->fetchColumn() > 0) return;

    pu_token_eintragen($person, $abo, 'kontingent', $wofuer, (int)$plan['kontingent']);
}

/** Eine Zeile ins Journal. Die einzige Stelle, die schreibt. */
function pu_token_eintragen(int $person, int $abo, string $art, string $wofuer,
                            int $tokens, int $cent = 0, bool $geschaetzt = false,
                            string $modell = '', string $verfaellt = '',
                            string $zustimmung = ''): int
{
    $st = pu_db()->prepare(
        'INSERT INTO token_buchungen
           (lernender, abo, art, wofuer, tokens, cent, geschaetzt, verfaellt, modell,
            bestaetigt, zeitpunkt, tag, zustimmung)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)');
    $st->execute([$person, $abo, $art, mb_substr($wofuer, 0, 120), $tokens, $cent,
                  $geschaetzt ? 1 : 0, $verfaellt, $modell,
                  $art === 'einzahlung' ? 0 : 1, pu_jetzt(), pu_heute(), $zustimmung]);

    return (int)pu_db()->lastInsertId();
}

/**
 * Verbrauch buchen. Wird von pu_tutor_fragen() gerufen — der einzigen Stelle,
 * an der ein Modellaufruf hinausgeht.
 */
function pu_token_verbrauchen(int $person, string $wofuer, int $tokens,
                              bool $geschaetzt = false, string $modell = ''): void
{
    if ($tokens <= 0) return;

    $abo = pu_abo_fuer($person);
    pu_token_eintragen($person, $abo['id'] ?? 0, 'verbrauch', $wofuer,
                       -$tokens, 0, $geschaetzt, $modell);
}

/**
 * Ein Paket vormerken. Bestätigt wird von Hand — es ist ja nichts bezahlt.
 *
 * **Die beiden Häkchen entscheiden über das Widerrufsrecht, nicht über den
 * Kauf.** Sie sind darum keine Bedingung: wer sie nicht setzt, kauft trotzdem
 * — und behält seine vierzehn Tage. Wer sie setzt, bekommt die Token sofort und
 * verliert das Recht (§ 356 Abs. 5 BGB). Ein Kauf, den man ohne Rechtsverzicht
 * nicht abschliessen kann, wäre genau der Zwang, den die Vorschrift verbietet.
 *
 * Gespeichert wird der Zeitpunkt, und zwar an dieser Buchung. Wo nichts steht,
 * ist nichts eingeholt worden, und dann gilt die Frist.
 */
function pu_token_einzahlen(int $person, string $paket, int $wer,
                            bool $sofortGewuenscht = false,
                            bool $verlustBekannt = false): array
{
    $p = PU_TOKENPAKETE[$paket] ?? null;
    if ($p === null) throw new RuntimeException('Dieses Paket gibt es nicht: ' . $paket);

    // Nur beide zusammen wirken. Ein einzelnes Häkchen lässt das Recht bestehen
    // — die Vorschrift verlangt Verlangen UND Kenntnisbestätigung.
    $zustimmung = ($sofortGewuenscht && $verlustBekannt) ? pu_jetzt() : '';

    $abo = pu_abo_fuer($person);
    $id  = pu_token_eintragen($person, $abo['id'] ?? 0, 'einzahlung',
                              'Paket ' . $p['name'] . ' (' . pu_eur((int)$p['cent']) . ')',
                              (int)$p['tokens'], (int)$p['cent'], false, '', '', $zustimmung);

    pu_protokoll($wer, 'token_paket', (string)$person, $paket);
    return ['id' => $id, 'tokens' => (int)$p['tokens'], 'cent' => (int)$p['cent'],
            'bestaetigt' => false,
            'widerruf'   => $zustimmung === '' ? 'bleibt' : 'erloschen'];
}

/**
 * Talente gutschreiben, ohne dass jemand bezahlt hat.
 *
 * **Warum das eine eigene Buchungsart bekommt und keine „Einzahlung" ist.**
 * Eine Einzahlung behauptet, jemand habe ein Paket gekauft; sie trägt einen
 * Betrag in Cent und wartet auf den Haken von Ebene 1, der den
 * Zahlungseingang ersetzt. Eine Gutschrift behauptet nichts davon. Sie ist
 * das, was ein Betreiber tut, damit auf seiner eigenen Academy gearbeitet
 * werden kann — und im Journal soll genau das stehen und nicht „Einzahlung,
 * 0,00 €". Eine Buchung, die ihre Herkunft verschleiert, ist in einem
 * Journal der teuerste Eintrag.
 *
 * Sie ist **sofort bestätigt**: Es gibt keinen Zahlungseingang, auf den man
 * warten könnte. `pu_token_eintragen()` setzt `bestaetigt = 0` nur für
 * `einzahlung`, alles andere gilt sofort.
 *
 * Kein API-Zweig, mit Absicht: Wer sich selbst Guthaben schreiben kann, hat
 * keine Grenze mehr. Das geht über die Kommandozeile mit Zugriff auf den
 * Ordner — also von jemandem, der ohnehin die Datenbank in der Hand hält.
 */
function pu_token_gutschreiben(int $person, int $tokens, string $grund, int $wer = 0): array
{
    if ($tokens <= 0) throw new RuntimeException('Eine Gutschrift ist positiv.');
    if (trim($grund) === '') throw new RuntimeException('Eine Gutschrift braucht einen Grund.');

    $id = pu_token_eintragen($person, 0, 'gutschrift', trim($grund), $tokens);
    pu_protokoll($wer > 0 ? $wer : $person, 'token_gutschrift', (string)$person,
                 $tokens . ' — ' . trim($grund));

    return ['id' => $id, 'tokens' => $tokens, 'stand' => pu_token_stand($person)];
}

/**
 * Der Stand eines Kontos.
 *
 * Gerechnet, nicht gespeichert. Es verfällt nichts: Jedes Kontingent zählt,
 * auch ältere Zeilen mit einem Datum in `verfaellt` (siehe
 * `pu_kontingent_gutschreiben`).
 */
function pu_token_stand(int $person): array
{
    $pdo   = pu_db();
    $abo   = pu_abo_fuer($person);

    // Alles, was zu diesem Konto UND zu seinem Abo gehört: bei einem
    // Klassenplan verbraucht die ganze Klasse aus einem Topf.
    $wo    = 'lernender = ?';
    $werte = [$person];
    if ($abo !== null) {
        $wo    = '(lernender = ? OR abo = ?)';
        $werte = [$person, $abo['id']];
    }

    $summe = function (string $zusatz) use ($pdo, $wo, $werte): int {
        $st = $pdo->prepare("SELECT COALESCE(SUM(tokens), 0) FROM token_buchungen
                             WHERE $wo $zusatz");
        $st->execute($werte);
        return (int)$st->fetchColumn();
    };

    /* Der Testzugang zählt wie gekauftes Guthaben: er verfällt nicht, und er
       wird nach dem Kontingent verbraucht. Getrennt gebucht bleibt er trotzdem,
       damit im Journal sichtbar ist, woher er kam.

       **Überwiesene Talente zählen genauso.** `talent_ein` steht mit einem
       Plus im Journal, `talent_aus` mit einem Minus — die Summe stimmt
       deshalb von selbst, ohne zweite Rechnung. Sie in den Verbrauch zu
       legen wäre der naheliegende und falsche Weg: Ein Geschenk ist keine
       Tutorfrage, und im Verbrauchsbalken würde es die Zahl verderben, an
       der man abliest, wohin das Geld wirklich geht. */
    $gekauft    = $summe("AND art IN ('einzahlung', 'probe', 'gutschrift',
                                      'talent_ein', 'talent_aus')
                          AND bestaetigt = 1");
    $kontingent = $summe("AND art = 'kontingent'");
    $verbraucht = -$summe("AND art = 'verbrauch'");
    $offen      = $summe("AND art = 'einzahlung' AND bestaetigt = 0");

    // Angezeigt wird der Verbrauch zuerst gegen das Kontingent. Das ist nur
    // die Aufteilung für die Anzeige: Welches Los wie viel frei hat und wann
    // es verteilt wird, rechnet der Server je Gutschrift.
    $ausKontingent = min($verbraucht, $kontingent);
    $ausGuthaben   = max(0, $verbraucht - $kontingent);

    $rest = max(0, $kontingent - $ausKontingent) + ($gekauft - $ausGuthaben);

    // Wie tief im Minus, und wie viel vom Rahmen ist davon noch übrig.
    // Beides fällt aus derselben Zahl — ein zweiter Speicherort wäre der,
    // der irgendwann abweicht.
    $minus      = max(0, -$rest);
    $rahmenRest = max(0, PU_MINUS_RAHMEN - $minus);

    // Vier Lagen, und die Oberfläche muss keine Schwellen kennen. Sie fragt
    // nach `lage` und zeigt, was dazu gehört. Stünden die Vergleiche im
    // JavaScript, gäbe es die Grenze zweimal — und die zweite wäre falsch,
    // sobald jemand hier eine Zahl ändert.
    $lage = match (true) {
        $rahmenRest <= 0            => 'stopp',   // aus, bis nachgelegt wird
        $rest       <= 0            => 'minus',   // der Rahmen trägt gerade
        $rest <= PU_TOKEN_WARNUNG   => 'knapp',   // noch etwa eine Lektion
        default                     => 'offen',
    };

    return [
        'kontingent'       => $kontingent,
        'kontingent_rest'  => max(0, $kontingent - $ausKontingent),
        'gekauft'          => $gekauft,
        'guthaben'         => $gekauft - $ausGuthaben,
        'verbraucht'       => $verbraucht,
        'offen'            => $offen,
        'rest'             => $rest,
        'leer'             => $rest <= 0,
        'minus'            => $minus,
        'rahmen'           => PU_MINUS_RAHMEN,
        'rahmen_rest'      => $rahmenRest,
        'lage'             => $lage,
        'stopp'            => $lage === 'stopp',
    ];
}

// ---------------------------------------------------------------- Das Tor
/**
 * **Wer verbraucht ohne Grenze?** Genau Ebene 1, sonst niemand.
 *
 * Steht als eigene Funktion da und nicht als `pu_ebene(...) === 'admin'` mitten
 * im Tor: Die Frage „wer ist von der Grenze ausgenommen" wird an drei Stellen
 * gestellt (Tor, Lage, Cockpit-Anzeige), und drei Vergleiche wären drei Orte,
 * an denen die Antwort auseinanderlaufen kann.
 *
 * Bewusst **nicht** über ein Recht aus der Matrix: Rechte lassen sich je Ebene
 * umstellen, und ein versehentlich weitergegebenes „unbegrenzt" fällt erst in
 * der Abrechnung auf. Die Ebene selbst ist nicht umstellbar (`pu_recht_matrix()`
 * nagelt die Admin-Spalte fest), und damit ist auch diese Ausnahme nicht
 * versehentlich weiterzureichen.
 */
function pu_token_frei(int $person): bool
{
    require_once PU_ROOT . '/srv/profil.php';
    require_once PU_ROOT . '/srv/rechte.php';

    $p = pu_profil($person);
    return $p !== null && pu_ebene($p) === 'admin';
}

/**
 * **Darf dieses Konto gerade noch einen Modellaufruf auslösen?**
 *
 * Die eine Stelle, die das entscheidet. Gefragt wird sie *vor* dem Aufruf —
 * gebucht wird danach, in `pu_token_verbrauchen()`. Diese Reihenfolge ist der
 * ganze Unterschied zwischen einer Grenze und einer Statistik.
 *
 * Zwei Wege enden im Stopp, und das ist Absicht:
 *
 * - **`token_sperre = an`** — hart bei null. Für eine Einrichtung, die keine
 *   Überziehung will, egal wie klein.
 * - **`token_sperre = aus`** (ab Werk) — der Rahmen trägt noch eine Lektion,
 *   dann ist Schluss. Die Einstellung verschiebt den Stopp, sie schafft ihn
 *   nicht ab. Eine Einstellung, mit der die Kosten unbegrenzt weiterlaufen,
 *   gibt es nicht mehr.
 */
function pu_token_tor(int $person): array
{
    require_once PU_ROOT . '/srv/einstellungen.php';

    $stand = pu_token_stand($person);

    // **Ebene 1 hat kein Tor.** Der Betreiber bezahlt die Rechnung selbst; ihm
    // beim Aufbauen und Prüfen den Tutor abzuschalten, wäre eine Schranke gegen
    // die eigene Werkstatt. Getestet wird das Tor deshalb mit einem Schülerkonto
    // und nicht mit dem eigenen — sonst merkt man nie, dass es klemmt.
    //
    // Nur Admin, ausdrücklich nicht die Verwaltung und nicht die Lehrkräfte:
    // Eine Schule, deren Lehrerkonten unbegrenzt verbrauchen, hat genau das
    // Kostenproblem wieder, wegen dem der Rahmen existiert.
    //
    // **Gebucht wird trotzdem.** Die Ausnahme hebt die Grenze auf, nicht die
    // Buchführung: Im Cockpit steht weiter, was ein Testlauf gekostet hat.
    // Ein Verbrauch, der nirgends auftaucht, ist der, den man in der
    // Abrechnung des Anbieters zum ersten Mal sieht.
    if (pu_token_frei($person)) {
        return ['offen' => true, 'stand' => $stand, 'meldung' => null,
                'unbegrenzt' => true];
    }

    // `pu_regel()`, nicht `pu_einst_global()`: das eine liest EINEN Wert, das
    // andere gibt die ganze Tafel zurück. Mit dem falschen davon war die harte
    // Sperre wirkungslos — sie verglich ein Array mit einem Text.
    $hart  = pu_regel('token_sperre') === 'an';

    $zu = $hart ? $stand['rest'] <= 0 : $stand['stopp'];
    if (!$zu) return ['offen' => true, 'stand' => $stand, 'meldung' => null];

    return [
        'offen'   => false,
        'stand'   => $stand,
        'meldung' => pu_nachlade_meldung($person, $stand, $hart),
    ];
}

/**
 * Was auf dem Schild steht, wenn zu ist.
 *
 * An einer Stelle, weil derselbe Text an drei Orten auftaucht: im Tutorfenster,
 * im Seitenmenü und im Cockpit. Drei Fassungen desselben Satzes werden
 * unweigerlich zu drei verschiedenen Sätzen.
 *
 * **Der Ton ist der Punkt.** Wer hier ankommt, hat nichts falsch gemacht — er
 * hat gearbeitet, bis das Guthaben alle war. Also wird zuerst gesagt, was er
 * geschafft hat, und erst danach, was es kostet weiterzumachen. Ein Schild, das
 * mit „Guthaben aufgebraucht" anfängt, liest sich wie eine Schranke; eines, das
 * mit einer Zahl anfängt, die man selbst erarbeitet hat, wie eine Zwischenbilanz.
 */
function pu_nachlade_meldung(int $person, array $stand, bool $hart = false): array
{
    $abo      = pu_abo_fuer($person);
    $antwortn = (int)round($stand['verbraucht'] / PU_TUTORANTWORT);
    $klein    = PU_TOKENPAKETE['klein'];

    // Ein Schüler in einer Klasse oder Schule kann nichts nachkaufen — das
    // Konto gehört der Einrichtung. Ihm „5 Euro nachladen" hinzuhalten, wäre
    // eine Aufforderung an das falsche Ohr.
    $fremd = $abo !== null && $abo['traeger_art'] !== 'person';

    $wege = [];
    if (!$fremd) {
        $wege[] = [
            'art'  => 'paket',
            'titel'=> 'Für ' . pu_eur((int)$klein['cent']) . ' weitermachen',
            'text' => sprintf(
                'Das kleine Paket sind %s Token — rund %d Tutorantworten. '
                . 'Das reicht erfahrungsgemäss für einen ganzen Kurs, nicht nur '
                . 'für die nächste Lektion.',
                number_format((int)$klein['tokens'], 0, ',', '.'),
                (int)round((int)$klein['tokens'] / PU_TUTORANTWORT)),
            'ziel' => '#/cockpit',
            'knopf'=> 'Paket ansehen',
        ];
    } else {
        $wege[] = [
            'art'  => 'traeger',
            'titel'=> 'Deine ' . ($abo['traeger_art'] === 'klasse' ? 'Klasse' : 'Schule') . ' fragen',
            'text' => sprintf(
                'Dieses Konto läuft über den Plan „%s" von %s. Nachgelegt wird '
                . 'dort, nicht hier — sag deiner Lehrkraft Bescheid.',
                $abo['plan_name'], $abo['traeger_name']),
            'ziel' => '',
            'knopf'=> '',
        ];
    }

    // Der zweite Weg, und für manche der einzige: Talente verdienen statt
    // kaufen. Er steht hier gleichberechtigt daneben und nicht als Fussnote —
    // wer sich nichts leisten kann, soll nicht das Kleingedruckte lesen müssen,
    // um zu erfahren, dass es einen Weg ohne Geld gibt.
    $wege[] = [
        'art'  => 'talente',
        'titel'=> 'Talente verdienen statt kaufen',
        'text' => 'Wer keine Talente hat, hat dafür Zeit und Talent. In der '
                . 'Gemeinschaft stellen Lernende Aufträge ein — ein Bild, ein '
                . 'Text, eine Stimme, ein Schnitt. Wer liefert, bekommt Talente '
                . 'dafür, und ein Talent ist ein Token. Wenn du etwas kannst, '
                . 'das andere gerade brauchen, musst du nichts bezahlen.',
        'ziel' => '',
        'knopf'=> '',
        // Ehrlich bleiben: die Gemeinschaft läuft auf dem Server, nicht auf
        // diesem Rechner. Ein Knopf, der ins Leere führt, wäre schlimmer als
        // ein Satz, der sagt, dass es noch nicht so weit ist.
        'bald' => !pu_gemeinschaft_da(),
    ];

    return [
        'lage'      => $hart ? 'gesperrt' : 'stopp',
        'titel'     => $hart
            ? 'Das Konto ist leer — und diese Academy überzieht nicht.'
            : 'Bis hierher hat es gereicht.',
        'bilanz'    => sprintf(
            'Du hast %s Token verbraucht, ungefähr %d Tutorantworten. %s',
            number_format($stand['verbraucht'], 0, ',', '.'),
            max(1, $antwortn),
            $hart ? '' : 'Die letzte Lektion ging schon auf Kredit.'),
        'grund'     => $hart
            ? 'Für dieses Konto ist eingestellt, dass bei null Schluss ist.'
            : sprintf(
                'Ab hier ist zu. Nicht mitten in einer Aufgabe — der Rahmen von '
                . '%s Token trägt genau eine Lektion weit, damit niemand im Satz '
                . 'abgeschnitten wird. Der ist jetzt aufgebraucht.',
                number_format(PU_MINUS_RAHMEN, 0, ',', '.')),
        'wege'      => $wege,
        'weiter'    => 'Lesen, Aufgaben lösen und abgeben geht weiter — das '
                     . 'kostet nichts. Zu ist nur der Tutor.',
    ];
}

/**
 * Die kurze Fassung für die Oberfläche — was angezeigt werden muss, mehr nicht.
 *
 * Bewusst nicht der ganze Kontostand: Ob ein Kind in Klasse 6 noch 38.000 oder
 * 12.000 Token hat, ist keine Auskunft, sondern eine Zahl. Was es braucht, ist
 * „reicht noch etwa für elf Fragen" — und ob gleich Schluss ist.
 */
function pu_token_lage(int $person): array
{
    $stand = pu_token_stand($person);

    // Ebene 1 bekommt keine Warnung und kein Schild — es gilt ja keine Grenze.
    // Der Verbrauch steht trotzdem im Cockpit; hier geht es nur darum, wovor
    // gewarnt wird. „Nur noch elf Fragen" wäre für dieses Konto schlicht falsch.
    if (pu_token_frei($person)) {
        return ['lage' => 'unbegrenzt', 'rest' => $stand['rest'],
                'antworten' => null, 'minus' => $stand['minus'],
                'rahmen' => PU_MINUS_RAHMEN, 'meldung' => null];
    }

    // Im Minus zählt, was der Rahmen noch trägt; darüber, was übrig ist.
    $uebrig = $stand['rest'] > 0 ? $stand['rest'] : $stand['rahmen_rest'];

    return [
        'lage'      => $stand['lage'],
        'rest'      => $stand['rest'],
        'antworten' => (int)floor($uebrig / PU_TUTORANTWORT),
        'minus'     => $stand['minus'],
        'rahmen'    => PU_MINUS_RAHMEN,
        // Das Schild kommt nur mit, wenn es auch gebraucht wird. Es jedes Mal
        // mitzuschicken hiesse, den Text bei jedem Seitenaufruf zu bauen.
        'meldung'   => $stand['lage'] === 'stopp'
            ? pu_nachlade_meldung($person, $stand)
            : null,
    ];
}

/**
 * Läuft die Gemeinschaft schon?
 *
 * Sie gehört auf den Server (TALENTE-TOKEN-COMMUNITY-VPS-PLAN, §4). Lokal gibt
 * es sie nicht, und solange das so ist, sagt die Meldung „bald" statt einen
 * Knopf anzubieten, der nirgends hinführt.
 */
function pu_gemeinschaft_da(): bool
{
    return false;
}

// ------------------------------------------------------- Talente weiterreichen
/**
 * **Wer darf wem Talente geben — und warum nur nach unten.**
 *
 * Die Kette folgt der Ebenenliste in `PU_EBENEN`: Admin, Verwaltung, Lehrer,
 * Eltern, Schüler. Jeder gibt an die Ebenen UNTER sich, niemand an die über
 * sich und niemand an seinesgleichen.
 *
 * Das ist eine Entscheidung und keine technische Notwendigkeit, also steht
 * der Grund hier: Talente sind Geld. Wäre die Richtung frei, könnte ein
 * Schüler seinem Lehrer Guthaben schicken — und ob das ein Geschenk war oder
 * eine Bitte um eine bessere Note, sieht man einem Journaleintrag nicht an.
 * Nach unten ist der Fluss dagegen genau der, den die Sache verlangt: Wer
 * bezahlt, verteilt.
 *
 * Der Umkreis kommt dazu, damit Ebene allein nicht genügt:
 *
 *   Admin        alle. Er trägt die Plattform.
 *   Verwaltung   alle in ihrer Schule.
 *   Lehrer       Eltern und Schüler in seiner Schule.
 *   Eltern       ihre eigenen Kinder (`kind_von`), sonst niemanden.
 *   Schüler      niemanden.
 *
 * **Eine leere Schule öffnet nicht die Tür.** Steht bei einer Verwaltung kein
 * Schulname, sieht sie nur Konten, bei denen ebenfalls keiner steht — nicht
 * alle. Sonst wäre ein vergessenes Feld ein Schlüssel zur ganzen Academy.
 */
const PU_TALENT_KETTE = [
    'admin'      => ['verwaltung', 'lehrer', 'eltern', 'schueler'],
    'verwaltung' => ['lehrer', 'eltern', 'schueler'],
    'lehrer'     => ['eltern', 'schueler'],
    'eltern'     => ['schueler'],
    'schueler'   => [],
];

/** Der kleinste und der grösste Betrag einer Überweisung. */
const PU_TALENT_MIN = 100;
const PU_TALENT_MAX = 2000000;

/**
 * An wen darf dieses Konto Talente geben?
 *
 * Gibt fertige Zeilen für die Oberfläche zurück, damit die Liste nicht an
 * zwei Orten entsteht: Was hier nicht steht, nimmt `pu_talente_senden()`
 * hinterher auch nicht an — beide fragen dieselbe Funktion.
 */
function pu_talente_empfaenger(int $wer): array
{
    require_once PU_ROOT . '/srv/profil.php';
    require_once PU_ROOT . '/srv/rechte.php';

    $ich = pu_profil($wer);
    if ($ich === null) return [];

    // `pu_ebene` und nicht `$ich['rolle']`: Es gibt Rollen, die keine Ebene
    // sind (siehe rechte.php). Die eine Funktion, die das entscheidet, ist
    // schon da — eine zweite Auslegung hier wäre die, die abweicht.
    $ebene = pu_ebene($ich);
    $unten = PU_TALENT_KETTE[$ebene] ?? [];
    if ($unten === []) return [];

    $platz = implode(',', array_fill(0, count($unten), '?'));
    $sql   = "SELECT id, kennung, anzeigename, pseudonym, rolle, gruppe, schule, kind_von
                FROM lernende
               WHERE rolle IN ($platz) AND id <> ?
               ORDER BY rolle, anzeigename";
    $st = pu_db()->prepare($sql);
    $st->execute(array_merge($unten, [$wer]));

    $aus = [];
    foreach ($st->fetchAll() as $r) {
        if (!pu_talent_im_umkreis($ich, $r, $ebene)) continue;

        /* Der angezeigte Name folgt derselben Regel wie überall sonst: Wo ein
           Pseudonym steht, gilt das Pseudonym. Eine Empfängerliste, die den
           Klarnamen eines Minderjährigen ausbreitet, wäre die Hintertür an der
           Zusage in Login-Level-Rechte-Plan.md §4 vorbei. */
        $name = trim((string)$r['pseudonym']) !== ''
              ? (string)$r['pseudonym'] : (string)$r['anzeigename'];

        $aus[] = [
            'id'      => (int)$r['id'],
            'kennung' => (string)$r['kennung'],
            'name'    => $name,
            'ebene'   => (string)$r['rolle'],
            'ebene_anzeige' => PU_EBENEN[(string)$r['rolle']]['anzeige'] ?? (string)$r['rolle'],
            'gruppe'  => (string)$r['gruppe'],
            'schule'  => (string)$r['schule'],
        ];
    }
    return $aus;
}

/** Liegt der Empfänger im Umkreis des Absenders? Siehe PU_TALENT_KETTE. */
function pu_talent_im_umkreis(array $ich, array $ziel, string $ebene): bool
{
    switch ($ebene) {
        case 'admin':
            return true;

        case 'verwaltung':
        case 'lehrer':
            // Gleiche Schule, und zwar buchstäblich gleich — auch dann, wenn
            // beide Felder leer sind. Das ist der Einzelplatz-Fall: eine
            // Academy ohne eingetragene Schule ist eine Schule.
            return trim((string)($ich['schule'] ?? '')) === trim((string)($ziel['schule'] ?? ''));

        case 'eltern':
            /* **Die Richtung steht am Elternkonto, nicht am Kind.**
               `pu_profil_kind_setzen($eltern, $kind)` schreibt `kind_von` in
               die Zeile der ELTERN und trägt dort die Nummer des Kindes ein
               (siehe srv/profil.php). Andersherum gelesen — „das Kind zeigt
               auf seine Eltern" — träfe die Bedingung nie zu, und der
               Elternteil bekäme eine leere Liste ohne Fehlermeldung.

               Damit erreicht ein Elternkonto genau ein Kind. Das ist keine
               Einschränkung dieser Funktion, sondern die des Feldes: Es fasst
               eine Nummer. Wer zwei Kinder hat, braucht ein zweites Konto
               oder ein zweites Feld — das wäre ein eigener Umbau. */
            return (int)($ich['kind_von'] ?? 0) === (int)($ziel['id'] ?? 0);
    }
    return false;
}

/**
 * Talente überweisen.
 *
 * Zwei Zeilen im Journal, in einer Transaktion: beim Absender ein Minus, beim
 * Empfänger ein Plus. Kein Kontostand wird fortgeschrieben — der Stand ist
 * die Summe der Buchungen, wie überall in dieser Datei.
 *
 * **`abo` bleibt auf 0.** Eine Überweisung gehört der Person, nicht dem Topf.
 * Stünde die Abo-Nummer dabei, liefe sie bei einem Klassenplan in den
 * gemeinsamen Topf, aus dem beide ohnehin schöpfen — und die Buchung wäre ein
 * teurer Weg, nichts zu tun.
 *
 * **Niemand überweist sich ins Minus.** Der Minus-Rahmen ist dafür da, dass
 * eine angefangene Lektion nicht mitten im Satz abbricht; er ist keine
 * Kreditlinie, aus der man Geschenke macht. Deshalb wird gegen `rest`
 * geprüft und nicht gegen `rahmen_rest`.
 *
 * Ausgenommen ist Ebene 1: Sie verbraucht ohnehin ohne Grenze
 * (`pu_token_frei`), und ein Admin, der erst einzahlen müsste, um verteilen zu
 * können, wäre eine Schranke ohne Zweck.
 */
function pu_talente_senden(int $von, int $an, int $betrag, string $notiz = ''): array
{
    require_once PU_ROOT . '/srv/profil.php';

    if ($von === $an) {
        throw new RuntimeException('An sich selbst kann man keine Talente überweisen.');
    }
    if ($betrag < PU_TALENT_MIN) {
        throw new RuntimeException(sprintf(
            'Der kleinste Betrag sind %s Talente.', number_format(PU_TALENT_MIN, 0, ',', '.')));
    }
    if ($betrag > PU_TALENT_MAX) {
        throw new RuntimeException(sprintf(
            'Auf einmal gehen höchstens %s Talente.', number_format(PU_TALENT_MAX, 0, ',', '.')));
    }

    // Die Erlaubnis kommt aus derselben Liste, die die Oberfläche anzeigt.
    // Eine zweite Prüfung mit eigener Logik wäre die, die irgendwann abweicht.
    $ziel = null;
    foreach (pu_talente_empfaenger($von) as $e) {
        if ($e['id'] === $an) { $ziel = $e; break; }
    }
    if ($ziel === null) {
        throw new RuntimeException('An dieses Konto darfst du keine Talente überweisen.');
    }

    $ich = pu_profil($von);
    if (!pu_token_frei($von)) {
        $stand = pu_token_stand($von);
        if ((int)$stand['rest'] < $betrag) {
            throw new RuntimeException(sprintf(
                'Dafür reicht dein Guthaben nicht: %s Talente verfügbar, %s gefordert.',
                number_format(max(0, (int)$stand['rest']), 0, ',', '.'),
                number_format($betrag, 0, ',', '.')));
        }
    }

    // `pu_profil` gibt bei `pseudonym` schon den Anzeigenamen zurück, wenn
    // keins gesetzt ist. Der Absender steht damit beim Empfänger im Journal
    // unter demselben Namen, unter dem er überall sonst auftritt.
    $meinName = (string)($ich['pseudonym'] ?? '');

    // Der Verwendungszweck wird gekappt, bevor er ins Journal geht: `wofuer`
    // fasst 120 Zeichen, und ein abgeschnittener Grund ist besser als eine
    // abgeschnittene Empfängerzeile davor.
    $zusatz = trim($notiz) === '' ? '' : ' — ' . mb_substr(trim($notiz), 0, 60);

    $pdo = pu_db();
    $pdo->beginTransaction();
    try {
        $ab = pu_token_eintragen($von, 0, 'talent_aus',
                                 'An ' . $ziel['name'] . $zusatz, -$betrag);
        $zu = pu_token_eintragen($an, 0, 'talent_ein',
                                 'Von ' . $meinName . $zusatz, $betrag);
        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }

    /* Zwei Protokollzeilen, eine je Konto. Wer später fragt „wo kommen die
       her", schaut beim Empfänger — und findet dort den Absender, ohne die
       ganze Academy durchsehen zu müssen. */
    pu_protokoll($von, 'talente_gesendet',  (string)$an,  $betrag . ' an ' . $ziel['kennung']);
    pu_protokoll($an,  'talente_empfangen', (string)$von, $betrag . ' von ' . ($ich['kennung'] ?? ''));

    return [
        'betrag'    => $betrag,
        'an'        => $ziel,
        'buchungen' => ['aus' => $ab, 'ein' => $zu],
        'stand'     => pu_token_stand($von),
    ];
}

// ---------------------------------------------------------------- Cockpit

/**
 * Alles für die Finanzzentrale in einem Aufruf.
 *
 * Absichtlich einer: Plan, Stand und Verbrauch stehen nebeneinander auf einer
 * Seite, und drei Aufrufe könnten drei verschiedene Stände zeigen.
 */
function pu_cockpit(int $person): array
{
    $abo   = pu_abo_fuer($person);
    $stand = pu_token_stand($person);
    $pdo   = pu_db();

    $wo    = 'lernender = ?';
    $werte = [$person];
    if ($abo !== null) { $wo = '(lernender = ? OR abo = ?)'; $werte = [$person, $abo['id']]; }

    // Verbrauch der letzten 30 Tage, nach Art gebündelt.
    $seit = date('Y-m-d', strtotime('-30 days'));
    $st = $pdo->prepare(
        "SELECT wofuer, COUNT(*) AS anzahl, SUM(-tokens) AS tokens, MAX(geschaetzt) AS geschaetzt
         FROM token_buchungen
         WHERE $wo AND art = 'verbrauch' AND tag >= ?
         GROUP BY wofuer ORDER BY tokens DESC LIMIT 12");
    $st->execute(array_merge($werte, [$seit]));

    $nachArt = [];
    foreach ($st->fetchAll() as $r) {
        $nachArt[] = ['wofuer' => (string)$r['wofuer'], 'anzahl' => (int)$r['anzahl'],
                      'tokens' => (int)$r['tokens'], 'geschaetzt' => ((int)$r['geschaetzt']) === 1];
    }

    // Die letzten Buchungen, egal welcher Art.
    $st = $pdo->prepare(
        "SELECT * FROM token_buchungen WHERE $wo ORDER BY id DESC LIMIT 15");
    $st->execute($werte);

    $letzte = [];
    foreach ($st->fetchAll() as $r) {
        $letzte[] = [
            'art'        => (string)$r['art'],
            'wofuer'     => (string)$r['wofuer'],
            'tokens'     => (int)$r['tokens'],
            'cent'       => (int)$r['cent'],
            'eur'        => (int)$r['cent'] > 0 ? pu_eur((int)$r['cent']) : '',
            'geschaetzt' => ((int)$r['geschaetzt']) === 1,
            'bestaetigt' => ((int)$r['bestaetigt']) === 1,
            'modell'     => (string)$r['modell'],
            'zeitpunkt'  => (string)$r['zeitpunkt'],
        ];
    }

    return [
        'abo'      => $abo,
        'stand'    => $stand,
        // Ob für dieses Konto überhaupt eine Grenze gilt. Steht neben dem
        // Stand und nicht darin: `pu_token_stand()` rechnet Buchungen zusammen
        // und weiss nichts über Ebenen — das soll auch so bleiben.
        'unbegrenzt' => pu_token_frei($person),
        'verbrauch'=> $nachArt,
        'letzte'   => $letzte,
        'plaene'   => PU_PLAENE,
        'pakete'   => PU_TOKENPAKETE,
        'werkzeuge'=> PU_WERKZEUGE,
        'seit'     => $seit,
    ];
}

/** Alle Abos — für Ebene 1 und die Verwaltung. */
function pu_abos_alle(): array
{
    $aus = [];
    foreach (pu_db()->query('SELECT * FROM abos ORDER BY laeuft DESC, id DESC LIMIT 100') as $a) {
        $aus[] = pu_abo_aufbereiten($a);
    }
    return $aus;
}
