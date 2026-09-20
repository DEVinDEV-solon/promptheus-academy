<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Wer da fragt.
 *
 * Ein Tutor, der jedem dasselbe erzählt, ist für jeden der falsche. Ein
 * Elfjähriger in Klasse 6 braucht ein Bild und einen kurzen Satz; eine
 * Lehrerin, die dieselbe Lektion vorbereitet, braucht die Fachbegriffe und
 * den Hinweis, woran ihre Klasse hängenbleiben wird. Beide fragen vielleicht
 * denselben Satz.
 *
 * Deshalb geht mit jeder Frage ein **Profil** an das Modell: Ebene, Alter,
 * Klasse, Sprachstil — und der Kontext der Ebene aus
 * `secondbrain/000_Kontext/<ebene>/`. Was dort in Markdown steht, ist
 * redaktionell und ohne Programmieren änderbar: eine Schule, die anders
 * spricht, schreibt es dort hin und ändert keine Zeile Code.
 *
 * **Was NICHT hinausgeht:** Klarname, Kennung, Kennwort-Hash, Punktestände
 * einzelner Aufgaben. Der Tutor braucht sie nicht. Nach aussen trägt eine
 * Person ihr Pseudonym — so steht es in `Login-Level-Rechte-Plan.md` §4, und
 * hier ist die Stelle, an der es eingehalten wird.
 */

/** Die Felder, die sich am eigenen Profil ändern lassen. */
const PU_PROFIL_FELDER = [
    'pseudonym'   => ['art' => 'text', 'max' => 40,
                      'was' => 'Name, unter dem du in der Academy auftrittst'],
    'lebensalter' => ['art' => 'zahl', 'min' => 0, 'max' => 120,
                      'was' => 'Alter in Jahren (0 = nicht angeben)'],
    'gruppe'      => ['art' => 'text', 'max' => 40,
                      'was' => 'Klasse oder Gruppe, z. B. 6a'],
    'schule'      => ['art' => 'text', 'max' => 80,
                      'was' => 'Schule oder Einrichtung'],
    'sprachstil'  => ['art' => 'wahl', 'werte' => ['', 'einfach', 'normal', 'fachlich'],
                      'was' => 'Wie ausführlich und fachlich die Tutoren antworten'],
    'notiz'       => ['art' => 'text', 'max' => 400,
                      'was' => 'Was die Tutoren über dich wissen sollen'],
];

/**
 * Das Profil eines Kontos, wie es gespeichert ist.
 *
 * @return array{id:int,kennung:string,anzeigename:string,rolle:string,pseudonym:string,
 *               lebensalter:int,gruppe:string,schule:string,sprachstil:string,
 *               notiz:string,kind_von:int}
 */
function pu_profil(int $id): ?array
{
    $st = pu_db()->prepare(
        'SELECT id, kennung, anzeigename, rolle, pseudonym, lebensalter,
                gruppe, schule, sprachstil, notiz, kind_von
         FROM lernende WHERE id = ?'
    );
    $st->execute([$id]);
    $r = $st->fetch();
    if ($r === false) return null;

    return [
        'id'          => (int)$r['id'],
        'kennung'     => (string)$r['kennung'],
        'anzeigename' => (string)$r['anzeigename'],
        'rolle'       => (string)$r['rolle'],
        // Wer kein Pseudonym gesetzt hat, tritt unter seinem Anzeigenamen
        // auf. Das ist eine bewusste Entscheidung des Kontos, kein Versehen.
        'pseudonym'   => ((string)$r['pseudonym']) !== ''
                            ? (string)$r['pseudonym'] : (string)$r['anzeigename'],
        'lebensalter' => (int)$r['lebensalter'],
        'gruppe'      => (string)$r['gruppe'],
        'schule'      => (string)$r['schule'],
        'sprachstil'  => (string)$r['sprachstil'],
        'notiz'       => (string)$r['notiz'],
        'kind_von'    => (int)$r['kind_von'],
    ];
}

/**
 * Setzt ein Profilfeld. Gibt den gespeicherten Wert zurück.
 *
 * Whitelist wie überall sonst: der Feldname kommt aus dem Browser, und ohne
 * diese Prüfung wäre `rolle` ein Profilfeld.
 */
function pu_profil_setzen(int $id, string $feld, string $wert): string
{
    if (!isset(PU_PROFIL_FELDER[$feld])) {
        throw new RuntimeException('Unbekanntes Profilfeld: ' . $feld);
    }
    $f = PU_PROFIL_FELDER[$feld];
    $wert = trim($wert);

    if ($f['art'] === 'zahl') {
        if ($wert !== '' && !preg_match('/^\d{1,3}$/', $wert)) {
            throw new RuntimeException($feld . ' muss eine Zahl sein.');
        }
        $z = (int)$wert;
        if ($z < $f['min'] || $z > $f['max']) {
            throw new RuntimeException($feld . ' muss zwischen ' . $f['min'] .
                                       ' und ' . $f['max'] . ' liegen.');
        }
        $wert = (string)$z;
    } elseif ($f['art'] === 'wahl') {
        if (!in_array($wert, $f['werte'], true)) {
            throw new RuntimeException($feld . ' kennt diesen Wert nicht: ' . $wert);
        }
    } else {
        if (mb_strlen($wert) > $f['max']) {
            throw new RuntimeException($feld . ' darf höchstens ' . $f['max'] .
                                       ' Zeichen haben.');
        }
        // Zeilenumbrüche nur in der Notiz — alles andere ist eine Zeile.
        if ($feld !== 'notiz') $wert = preg_replace('/\s+/u', ' ', $wert) ?? $wert;
    }

    $st = pu_db()->prepare("UPDATE lernende SET $feld = ? WHERE id = ?");
    $st->execute([$wert, $id]);
    return $wert;
}

/** Verknüpft ein Elternkonto mit genau einem Kind. 0 hebt die Verknüpfung auf. */
function pu_profil_kind_setzen(int $eltern, int $kind): void
{
    if ($kind !== 0) {
        $k = pu_profil($kind);
        if ($k === null) throw new RuntimeException('Dieses Konto gibt es nicht.');
        if ($kind === $eltern) throw new RuntimeException('Ein Konto kann nicht sein eigenes Kind sein.');
    }
    $st = pu_db()->prepare('UPDATE lernende SET kind_von = ? WHERE id = ?');
    $st->execute([$kind, $eltern]);
}

// ---------------------------------------------------------------- Sprachstil

/**
 * Wie ausführlich und fachlich geantwortet wird.
 *
 * Gesetzt schlägt abgeleitet: wer „fachlich" gewählt hat, bekommt fachlich,
 * auch mit zwölf.
 *
 * **Das Alter zählt nur bei Lernenden.** Es sagt etwas über Lesegewohnheit
 * und Vorwissen, solange jemand in der Schule sitzt — bei Erwachsenen sagt
 * es nichts. Ein 44-jähriger Vater, der beruflich Fliesen legt, ist kein
 * Fachpublikum, nur weil er älter ist als die Lehrerin. Die erste Fassung
 * hier rechnete genau so und schickte ihm „Fachbegriffe darfst du
 * voraussetzen" — direkt gegen die Elternregel zwei Absätze weiter unten.
 *
 * Bei allen anderen entscheidet die Ebene: wer unterrichtet oder die Academy
 * betreibt, arbeitet mit dem Stoff. Eltern tun das nicht.
 */
function pu_sprachstil(array $profil): string
{
    if ($profil['sprachstil'] !== '') return $profil['sprachstil'];

    $ebene = pu_ebene($profil);

    if ($ebene === 'schueler' || $ebene === '') {
        $alter = (int)$profil['lebensalter'];
        if ($alter === 0)  return 'normal';
        if ($alter <= 12)  return 'einfach';
        if ($alter <= 17)  return 'normal';
        return 'fachlich';
    }

    // Eltern sind erwachsen, aber Laien — das ist „normal", nicht „fachlich".
    return $ebene === 'eltern' ? 'normal' : 'fachlich';
}

/** Der Satz, der dem Modell sagt, wie es sprechen soll. */
function pu_sprachstil_regel(string $stil): string
{
    return match ($stil) {
        'einfach' => 'Sprich einfach. Kurze Sätze, ein Bild oder Beispiel aus dem Alltag, '
                   . 'höchstens ein Fachwort je Antwort — und das erklärst du sofort. '
                   . 'Keine Aufzählung mit mehr als drei Punkten.',
        'fachlich' => 'Sprich fachlich. Fachbegriffe darfst du voraussetzen. Sei knapp und '
                    . 'genau; nenne Randfälle und Grenzen, statt sie zu glätten.',
        default   => 'Sprich klar und ohne Fachjargon, aber ohne zu vereinfachen. '
                   . 'Ein Fachwort darf vorkommen, wenn du es beim ersten Mal erklärst.',
    };
}

// ---------------------------------------------------------------- Ebenen-Kontext

/**
 * Der redaktionelle Kontext einer Ebene aus dem Wissensspeicher.
 *
 * Liest `secondbrain/000_Kontext/<ebene>/*.md`. Wer die Academy an eine Schule
 * anpassen will, schreibt dort — nicht hier. Genau dafür liegt der Ordner im
 * Vault und nicht im Programm.
 *
 * Gekappt wird hart: der Kontext ist die Begleitmusik, nicht das Stück. Ohne
 * Grenze wächst er mit jeder Datei, die jemand ablegt, und schiebt irgendwann
 * die eigentliche Lektion aus dem Fenster.
 */
function pu_ebenen_kontext(string $ebene, int $grenze = 3500): string
{
    require_once PU_ROOT . '/srv/kurse.php';      // pu_frontmatter

    // Der Ordner heisst `schule`, die Ebene `verwaltung`. Im Programm ist
    // „Verwaltung" genauer (es kann auch ein Träger sein); im Vault, wo
    // Menschen schreiben, heisst es Schule. Diese eine Zeile hält beides
    // auseinander, statt eines von beiden umzubenennen.
    $ordnerName = ['verwaltung' => 'schule'][$ebene] ?? pu_slug($ebene);
    $ordner = PU_BRAIN . '/000_Kontext/' . $ordnerName;
    if (!is_dir($ordner)) return '';

    // Dateien mit Unterstrich sind Notizen für Menschen (`_index.md`) und
    // gehören nicht in den Prompt. Sie stünden sonst wegen der Sortierung
    // sogar ganz vorn und fräßen den Platz des eigentlichen Kontexts.
    $dateien = array_values(array_filter(
        glob($ordner . '/*.md') ?: [],
        fn($d) => !str_starts_with(basename($d), '_')
    ));
    sort($dateien);

    $teile = [];
    $laenge = 0;

    foreach ($dateien as $d) {
        $roh = (string)file_get_contents($d);
        $fm  = pu_frontmatter($roh);
        $text = trim($fm['rumpf'] !== '' ? $fm['rumpf'] : $roh);
        if ($text === '') continue;

        if ($laenge + mb_strlen($text) > $grenze) {
            $text = mb_substr($text, 0, max(0, $grenze - $laenge));
            if (trim($text) !== '') $teile[] = $text;
            break;
        }
        $teile[] = $text;
        $laenge += mb_strlen($text);
    }

    return implode("\n\n", $teile);
}

// ---------------------------------------------------------------- Der Prompt-Block

/**
 * Der Block „Mit wem du sprichst", der jedem Tutor-Prompt vorangeht.
 *
 * Er enthält kein Geheimnis und keinen Klarnamen — nur das, was für eine
 * passende Antwort nötig ist. Wer nichts angegeben hat, taucht mit nichts
 * auf: eine Zeile „Alter: unbekannt" verleitet ein Modell dazu, danach zu
 * fragen, statt einfach zu antworten.
 */
function pu_profil_block(array $profil): string
{
    $ebene = pu_ebene($profil);
    $stil  = pu_sprachstil($profil);

    $wer = match ($ebene) {
        'admin'      => 'betreibt diese Academy (Ebene 1, Administration)',
        'verwaltung' => 'leitet eine Schule oder verwaltet sie',
        'lehrer'     => 'unterrichtet und betreut Lernende',
        'eltern'     => 'ist Elternteil eines Lernenden und lernt hier nicht selbst',
        default      => 'lernt hier',
    };

    /* **Hier steht das Pseudonym, und das bleibt so.**
     *
     * Es war verlockend, den Anzeigenamen zu nehmen: Alpay meldete sich an und
     * der Tutor sagte „Hallo, Daidalos" — der Name der Testperson, die dieses
     * Konto vorher war. Der Anzeigename hätte das sofort behoben.
     *
     * Er hätte aber auch die Zusage gebrochen, dass der Klarname eines
     * Lernenden diesen Rechner nicht verlässt (`Login-Level-Rechte-Plan.md` §4,
     * geprüft in `profil_test.php`). In einer Academy mit Minderjährigen ist
     * das keine Formalie.
     *
     * Der Fehler lag woanders: Ein Pseudonym veraltete beim **Umbenennen** des
     * Kontos still weiter. Behoben wird er dort, wo er entsteht — `name_aendern`
     * in api.php legt es ab. Danach greift der Rückfall in `pu_profil()`, und
     * angesprochen wird mit dem Namen aus den Einstellungen. */
    $z = ['## Mit wem du sprichst', '', 'Anrede: **' . $profil['pseudonym'] . '** — ' . $wer . '.'];

    if ($profil['lebensalter'] > 0) $z[] = 'Alter: ' . $profil['lebensalter'] . ' Jahre.';
    if ($profil['gruppe'] !== '')   $z[] = 'Klasse/Gruppe: ' . $profil['gruppe'] . '.';
    if ($profil['schule'] !== '')   $z[] = 'Einrichtung: ' . $profil['schule'] . '.';
    if ($profil['notiz'] !== '')    $z[] = 'Eigene Angabe: ' . $profil['notiz'];

    $z[] = '';
    $z[] = pu_sprachstil_regel($stil);

    // Für die drei Ebenen, die nicht selbst lernen, ist die Frage fast immer
    // eine andere: nicht „wie löse ich das", sondern „wie begleite ich den,
    // der es löst". Ein Tutor, der das nicht weiss, antwortet am Anliegen
    // vorbei — höflich und nutzlos.
    $z[] = match ($ebene) {
        'eltern' => "\nDiese Person löst keine Aufgaben. Sie will verstehen, woran ihr Kind "
                  . 'gerade arbeitet und wie sie helfen kann, ohne die Aufgabe zu übernehmen. '
                  . 'Gib ihr Gesprächsanlässe und Einordnung, keine Lösungen und keine '
                  . 'Bewertung des Kindes.',
        'lehrer' => "\nDiese Person unterrichtet. Sie fragt selten aus eigenem Interesse, "
                  . 'sondern weil sie es morgen erklären muss. Eine reine Definition nützt '
                  . "ihr nichts — die kennt sie.\n\n"
                  . 'Gib ihr deshalb bei einer fachlichen Frage **ungefragt dazu**: die '
                  . 'typische Fehlvorstellung, an der eine Klasse hängenbleibt, und einen '
                  . 'Einstieg, den man vorführen kann. Wo es passt auch: Differenzierung '
                  . "nach oben und unten, und wie lange das realistisch dauert.\n\n"
                  . 'Sie darf den Stoff mitsamt Lösungen kennen — das ist der Unterschied '
                  . 'zur Schüler-Ebene.',
        'verwaltung' => "\nDiese Person leitet eine Schule. Was sie bekommt, muss sie "
                      . "**weitergeben** können — an Kollegium, Elternbeirat oder Schulamt.\n\n"
                      . 'Nützlich sind: Überblick, Einordnung in den Lehrplan, Aufwand in '
                      . 'Stunden, Datenschutz. Wo es passt, gib ihr einen Satz mit, den sie '
                      . 'wörtlich in einen Elternbrief übernehmen kann. Keine fachliche '
                      . 'Kleinarbeit und keine Begeisterung — sie entscheidet, sie lernt nicht.',
        'admin' => "\nDiese Person betreibt die Academy und darf technische Antworten bekommen.",
        default => '',
    };

    return trim(implode("\n", $z));
}

/**
 * Der vollständige Systemtext für einen Agenten.
 *
 * Vier Schichten, immer in dieser Reihenfolge:
 *
 *   1. `prompts/SOUL.md`   — Haltung der Academy. Gilt für alle vier Tutoren.
 *   2. `prompts/AGENTS.md` — die gemeinsamen Regeln (keine Punkte, keine
 *                            Lösung ohne Abgabe, Deutsch, kurz).
 *   3. `prompts/<agent>.md`— was diesen einen Tutor ausmacht.
 *   4. Profil + Ebenen-Kontext — mit wem er gerade spricht.
 *
 * Die Reihenfolge ist nicht beliebig: das Besondere steht hinter dem
 * Allgemeinen, damit es im Zweifel gewinnt. Und das Gegenüber steht ganz
 * hinten, weil es die Antwort formt, nicht die Haltung.
 */
/**
 * Was jeder Tutor über sein eigenes Haus weiss.
 *
 * **Warum das fest im Systemtext steht und nicht als Quelle nachgeladen wird.**
 * Der Kontext eines Tutors ist sonst absichtlich eng: die offene Lektion, die
 * genannte Quelle — nie der ganze Vault. Das ist richtig, führte aber zu einer
 * Lücke, die jeder sofort findet: Im freien Gespräch, ohne offenen Kurs, wusste
 * der Tutor nicht, was die Academy überhaupt anbietet. Auf „Was kann ich hier
 * lernen?" gab es kein Wissen, nur Höflichkeit.
 *
 * Es steht deshalb hier, kurz gehalten und in Zeilen statt in Absätzen: Dieser
 * Block geht bei **jeder** Frage mit, und was jedes Mal mitgeht, muss klein
 * sein. Die sechs Stufen kommen aus `PU_STUFEN` und nicht aus einem zweiten
 * Text — sonst stünde nach der ersten Umbenennung etwas anderes hier als im
 * Programm. Die ausführliche Fassung liegt für Menschen im Vault unter
 * `10_Stufen/Der siebte Kurs.md`.
 */
function pu_academy_wissen(): string
{
    $zeilen = [];
    foreach (PU_STUFEN as $nr => $s) {
        $zeilen[] = sprintf('- Stufe %d — %s: %s', $nr, $s['name'], $s['titel']);
    }

    return "## Die Academy\n\n"
        . "Sechs Stufen, jede mit Prüfung und Urkunde. Stufe 1 steht jedem offen; "
        . "jede weitere wird frei, sobald die vorige bestanden ist.\n\n"
        . implode("\n", $zeilen) . "\n\n"
        . "Daneben laufen zehn Fachkurse (`DOM-…`) für einzelne Anwendungsbereiche. "
        . "Sie setzen Stufe 1 bis 3 voraus.\n\n"
        . "**Der 7. Kurs — Brand-Guideline** (in der Oberfläche auch „Dein Ziel“): "
        . "der Abschluss hinter allen sechs Stufen, geschenkt, ohne Prüfung und ohne "
        . "Urkunde. Er zeigt, wie man seinen eigenen Stil **einmal** beschreibt und "
        . "danach aus jedem Modell zurückbekommt — als kurzes Dokument, das ein "
        . "Mensch lesen und eine Maschine befolgen kann. Inhalt: Ausweis, "
        . "Persönlichkeit, Register, Sprache, Farbbedeutung, Ausgabeformen, der "
        . "Systemprompt-Baustein daraus, und die Trennlinie zwischen dem, was fest "
        . "ist, und dem, was frei bleibt. Eingesetzt wird er auf drei Stufen: "
        . "einzelner ChatBot, Agent mit Werkzeugen, System aus mehreren Agenten. "
        . "Am Ende steht ein Paket zum Herunterladen (Dokument, Systemprompt, "
        . "eigene Webseite, Prüfliste) unter der PolyForm Shield 1.0.0 — die Lizenz "
        . "gilt für Vorlage und Bausteine und erlaubt auch den geschäftlichen "
        . "Einsatz, nur kein Konkurrenzprodukt zur Academy; die eigenen Inhalte "
        . "gehören dem Lernenden.\n\n"
        . "Frei wird er nach der bestandenen Prüfung der sechsten Stufe. Wer danach "
        . "fragt, bevor er so weit ist: Der Abstand steht auf der Karte „Dein Ziel“ "
        . "und hinter dem Menüpunkt „Der 7. Kurs“.";
}

function pu_systemtext(string $agent, ?array $profil = null): string
{
    require_once PU_ROOT . '/srv/kurse.php';      // pu_frontmatter

    $schichten = [];

    foreach (['SOUL', 'AGENTS'] as $gemeinsam) {
        $datei = PU_PROMPTS . '/' . $gemeinsam . '.md';
        if (!is_file($datei)) continue;
        $fm = pu_frontmatter((string)file_get_contents($datei));
        $t  = trim($fm['rumpf'] !== '' ? $fm['rumpf'] : (string)file_get_contents($datei));
        if ($t !== '') $schichten[] = $t;
    }

    $eigen = pu_agent_prompt($agent);
    if (trim($eigen) !== '') $schichten[] = trim($eigen);

    $schichten[] = pu_academy_wissen();

    if ($profil !== null) {
        $schichten[] = pu_profil_block($profil);

        $kontext = pu_ebenen_kontext(pu_ebene($profil));
        if ($kontext !== '') {
            $schichten[] = "## Kontext dieser Ebene\n\n" .
                "Redaktionell gepflegt in `secondbrain/000_Kontext/`. Er sagt dir, in " .
                "welcher Welt diese Person steht — nicht, was du antworten sollst.\n\n" .
                $kontext;
        }
    }

    return implode("\n\n---\n\n", $schichten);
}
