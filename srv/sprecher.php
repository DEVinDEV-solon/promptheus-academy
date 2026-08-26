<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Sprechertexte für Video und Ton.
 *
 * Zu jedem Kurs, jeder Lektion und jeder Prüfung gehört ein gesprochener
 * Text — und zwar **vier Mal**, für vier verschiedene Menschen. Derselbe
 * Stoff, vier Fassungen:
 *
 *   Schüler   — im Ton seiner Stufe. Ein Elfjähriger in Stufe 1 hört etwas
 *               anderes als ein Sechzehnjähriger in Stufe 5.
 *   Eltern    — was das Kind gerade lernt und wie man hilft, ohne die
 *               Aufgabe zu übernehmen.
 *   Lehrer    — Unterrichtsware: Einstieg, Fehlvorstellung, Zeitbedarf.
 *   Schule    — Einordnung zum Weitergeben, an Kollegium und Elternbeirat.
 *
 * **Warum das nicht ein Text mit vier Anreden ist.** Ein Sprechertext, der
 * für alle passt, passt für keinen: die Lehrerin überspringt die Erklärung,
 * das Kind versteht die Didaktik nicht, und die Schulleitung wollte nie
 * wissen, was ein Token ist. Vier Aufnahmen sind teurer als eine — aber eine,
 * die niemand zu Ende hört, ist teurer als vier.
 *
 * Die Texte liegen als OKF-Notizen in `secondbrain/50_Sprecher_Bilder_Videos`
 * und tragen im Frontmatter ihre Herkunft: welche Lektion, welche Zielgruppe,
 * und welche Kontextdatei aus `000_Kontext` beim Schreiben mitgewirkt hat.
 * Damit ist jeder Text rückverfolgbar — man sieht, warum er so klingt.
 */

/** Wo die Sprechertexte liegen. */
const PU_SPRECHER = '50_Sprecher_Bilder_Videos';

/**
 * Die vier Zielgruppen.
 *
 * `kontext` nennt den Ordner in `000_Kontext`, aus dem beim Schreiben
 * gelesen wird — das ist die Verknüpfung, die im Frontmatter landet.
 * `ebene` ist die Zugangsebene im Programm; darüber hängt der Text später
 * an der Rechte-Matrix.
 */
const PU_ZIELGRUPPEN = [
    'schueler' => [
        'name'    => 'Schüler',
        'ebene'   => 'schueler',
        'kontext' => 'schueler',
        'woerter' => 200,
        'auftrag' => 'Sprich den Lernenden direkt an. Fang mit einer Frage oder einer '
                   . 'Beobachtung an, die er kennt — nicht mit einer Definition. Ein '
                   . 'Bild aus seinem Alltag trägt weiter als ein korrekter Fachsatz.',
    ],
    'eltern' => [
        'name'    => 'Eltern',
        'ebene'   => 'eltern',
        'kontext' => 'eltern',
        'woerter' => 180,
        'auftrag' => 'Erkläre, was das Kind hier gerade lernt und warum es sich lohnt. '
                   . 'Schliesse mit einer Frage, die man beim Abendessen stellen kann. '
                   . 'Keine Lösungen, keine Bewertung des Kindes.',
    ],
    'lehrer' => [
        'name'    => 'Lehrkraft',
        'ebene'   => 'lehrer',
        'kontext' => 'lehrer',
        'woerter' => 220,
        'auftrag' => 'Liefere Unterrichtsware: der Einstieg für die Stunde, die typische '
                   . 'Fehlvorstellung, an der die Klasse hängenbleibt, und wie lange das '
                   . 'realistisch dauert. Keine Definition — die kennt sie.',
    ],
    'schule' => [
        'name'    => 'Schulleitung',
        'ebene'   => 'verwaltung',
        'kontext' => 'schule',
        'woerter' => 160,
        'auftrag' => 'Ordne ein: wo das im Lehrplan sitzt, was es an Zeit kostet, was man '
                   . 'dem Elternbeirat dazu sagt. Ein Satz muss sich wörtlich in einen '
                   . 'Elternbrief übernehmen lassen.',
    ],
];

/**
 * Wie alt die Zuhörer einer Stufe ungefähr sind.
 *
 * Die Stufe ist die einzige Altersachse, die die Academy wirklich hat — ein
 * Geburtsdatum steht nirgends, und in einer Klasse sitzen ohnehin drei
 * Jahrgänge. Für den Ton eines Sprechertextes reicht das: der Unterschied
 * zwischen elf und siebzehn ist gross genug, um ihn zu hören.
 */
function pu_stufen_alter(int $stufe): array
{
    return match (true) {
        $stufe <= 0 => ['von' => 14, 'bis' => 18, 'wie' => 'Jugendliche und Erwachsene'],
        $stufe <= 2 => ['von' => 10, 'bis' => 12, 'wie' => 'Kinder der Klassen 5 und 6'],
        $stufe <= 4 => ['von' => 13, 'bis' => 15, 'wie' => 'Jugendliche der Klassen 7 bis 9'],
        default     => ['von' => 16, 'bis' => 18, 'wie' => 'Jugendliche der Oberstufe'],
    };
}

/**
 * Nimmt aus dem Stoff heraus, was den Zuhörer nichts angeht.
 *
 * In den Lektionen stehen Abschnitte über den Wissensspeicher selbst — wo
 * eine Zahl herkommt, unter welchem Ordner sie abgelegt ist, welche
 * Prüfsumme sie trägt. Das ist für die Pflege des Vaults wichtig und für
 * einen Elfjährigen im Video vollkommen bedeutungslos.
 *
 * Bleibt es im Stoff stehen, landet es im Sprechertext: „Die technischen
 * Angaben stammen aus dem Wissensspeicher 21_Wasserzeichen und sind unter
 * 90_Quellen abgelegt." Genau so ist es einmal passiert.
 *
 * Geschnitten wird der ganze Abschnitt bis zur nächsten Überschrift — und
 * zusätzlich jede Zeile, die einen Vault-Ordner nennt.
 */
function pu_sprecher_stoff_saeubern(string $text): string
{
    // Abschnitte, die von der Ablage handeln statt vom Thema.
    $text = preg_replace(
        '/^##+\s*(Womit dieser Kurs arbeitet|Quellen?|Herkunft|Belege|Fundstellen)\b.*?'
        . '(?=^##|\z)/msi', '', $text) ?? $text;

    // Einzelne Zeilen mit Vault-Bezug — auch mitten in einem sonst
    // brauchbaren Abschnitt.
    $zeilen = preg_split('/
?
/', $text) ?: [];
    $raus   = '#(90_Quellen|00_Fundament|10_Stufen|20_Domaenen|000_Kontext|secondbrain'
            . '|Wissensspeicher|Prüfsumme|OKF)#iu';

    $behalten = array_filter($zeilen, fn($z) => !preg_match($raus, $z));

    return trim(preg_replace('/
{3,}/', "

", implode("
", $behalten)) ?? $text);
}

/** Der Dateipfad eines Sprechertextes, relativ zum Vault. */
function pu_sprecher_pfad(string $kurspfad, string $stueck, string $zielgruppe): string
{
    return PU_SPRECHER . '/' . $kurspfad . '/' . $stueck . '__' . $zielgruppe . '.md';
}

/**
 * Alle Stücke, für die ein Sprechertext gebraucht wird.
 *
 * Ein Stück ist ein Kurs, eine Lektion oder eine Prüfung. Zurück kommt alles,
 * was der Schreiber braucht — der Text selbst inbegriffen, damit er nicht
 * nochmal in den Vault greifen muss.
 */
function pu_sprecher_stuecke(string $nurKurs = ''): array
{
    require_once PU_ROOT . '/srv/kurse.php';

    $aus   = [];
    $index = pu_index();

    foreach ($index['kurse'] as $pfad => $k) {
        if ($nurKurs !== '' && !str_starts_with($pfad, $nurKurs)) continue;

        $aus[] = [
            'art'      => 'kurs',
            'kurs'     => $pfad,
            'stueck'   => '_kurs',
            'titel'    => (string)$k['titel'],
            'stufe'    => (int)$k['stufe'],
            'quelle'   => $pfad . '/_index.md',
            'text'     => pu_sprecher_stoff_saeubern((string)$k['kopf']),
            'aufgaben' => 0,
        ];

        foreach ($k['lektionen'] as $l) {
            $aus[] = [
                'art'      => 'lektion',
                'kurs'     => $pfad,
                'stueck'   => pathinfo((string)$l['pfad'], PATHINFO_FILENAME),
                'titel'    => (string)$l['titel'],
                'stufe'    => (int)$k['stufe'],
                'quelle'   => (string)$l['pfad'],
                // Die Aufgabenblöcke heraus: sie tragen die Lösung, und ein
                // Sprechertext, der die Lösung verrät, ist eine Falle im Video.
                'text'     => preg_replace('/^```aufgabe[ \t]*\r?\n.*?^```[ \t]*$/ms', '',
                                           (string)$l['rumpf']) ?? '',
                'aufgaben' => count($l['aufgaben']),
            ];
        }

        if ($k['pruefung'] !== null) {
            $aus[] = [
                'art'      => 'pruefung',
                'kurs'     => $pfad,
                'stueck'   => '_pruefung',
                'titel'    => (string)$k['pruefung']['titel'],
                'stufe'    => (int)$k['stufe'],
                'quelle'   => $pfad,
                'text'     => preg_replace('/^```aufgabe[ \t]*\r?\n.*?^```[ \t]*$/ms', '',
                                           (string)$k['pruefung']['rumpf']) ?? '',
                'aufgaben' => count($k['pruefung']['aufgaben']),
            ];
        }
    }

    return $aus;
}

/**
 * Der Auftrag an das Modell für einen Sprechertext.
 *
 * Der Zielgruppen-Kontext aus `000_Kontext` geht mit — dieselben Dateien, die
 * auch die Tutoren lesen. Dadurch klingt ein Sprechertext für Eltern wie ein
 * Tutor, der mit Eltern spricht, und nicht wie ein zweites System.
 */
function pu_sprecher_auftrag(array $stueck, string $zielgruppe): array
{
    require_once PU_ROOT . '/srv/profil.php';

    $z     = PU_ZIELGRUPPEN[$zielgruppe];
    $alter = pu_stufen_alter((int)$stueck['stufe']);

    // Präzise sagen, WAS entstehen soll. „Für einen ganzen Kurs" hat ein
    // Modell einmal so verstanden, dass es sechs Texte schreiben soll — einen
    // je Lektion —, und ist beim Nachdenken darüber in die Token-Grenze
    // gelaufen. Ein mehrdeutiger Auftrag kostet mehr als ein langer.
    $wasArt = match ($stueck['art']) {
        'kurs'     => 'die Vorstellung eines ganzen Kurses — EIN zusammenhängender '
                    . 'Text, der neugierig macht, wie ein Trailer. Nicht ein Text je '
                    . 'Lektion; die haben ihre eigenen',
        'pruefung' => 'die Abschlussprüfung eines Kurses — was dort verlangt wird und '
                    . 'wie man hingeht',
        default    => 'eine einzelne Lektion',
    };

    $system = "Du schreibst **Sprechertexte** für die Videos einer KI-Academy.\n\n"
        . "Ein Sprechertext wird VORGELESEN. Er muss also klingen, wenn man ihn hört — "
        . "keine Aufzählungen, keine Überschriften, keine Klammern, keine Emojis, keine "
        . "Markdown-Zeichen. Ganze Sätze, die man in einem Atemzug sprechen kann.\n\n"
        . "Du schreibst für: **" . $z['name'] . "**.\n\n"
        . $z['auftrag'] . "\n\n"
        . "Länge: höchstens " . $z['woerter'] . " Wörter. Lieber kürzer.\n\n"
        . "Kein Vorwort („In diesem Video…“), kein Nachwort („Viel Erfolg!“), keine "
        . "Begrüssung. Fang mit dem ersten Satz an, der etwas sagt.

"
        . "**Sprich nie über die Academy selbst.** Keine Dateinamen, keine Ordner, keine "
        . "Quellenangaben, keine Prüfsummen, kein „Wissensspeicher\". Der Zuhörer will "
        . "das Thema hören, nicht wissen, wo es abgelegt ist.

"
        . "**Antworte sofort mit dem fertigen Text.** Kein Nachdenken davor, keine "
        . "Überlegungen zur Aufgabe, keine Rückfrage — nur der Text, der gesprochen "
        . "wird. Nichts davor, nichts danach.";

    if ($zielgruppe === 'schueler') {
        $system .= "\n\nDie Zuhörer sind " . $alter['wie'] . ", etwa "
                 . $alter['von'] . " bis " . $alter['bis'] . " Jahre alt. "
                 . "Sprich so, wie man mit ihnen spricht — nicht darüber, wie man mit "
                 . "ihnen sprechen sollte.";
    }

    $kontext = pu_ebenen_kontext($z['kontext'], 2500);
    if ($kontext !== '') {
        $system .= "\n\n---\n\n## Wer diese Menschen sind\n\n" . $kontext;
    }

    $prompt = "Schreibe den Sprechertext für " . $wasArt . ".\n\n"
        . "## Titel\n" . $stueck['titel'] . "\n\n"
        . ($stueck['aufgaben'] > 0
            ? "## Umfang\nDazu gehören " . $stueck['aufgaben'] . " Aufgaben.\n\n"
            : '')
        . "## Der Stoff\n\n" . mb_substr(trim((string)$stueck['text']), 0, 7000);

    return ['system' => $system, 'prompt' => $prompt];
}

/**
 * Baut die OKF-Notiz zu einem fertigen Sprechertext.
 *
 * Das Frontmatter trägt die Herkunft: welches Stück, welche Zielgruppe, aus
 * welcher Kontextdatei. Damit sieht jeder, warum ein Text so klingt — und ein
 * Text, dessen Herkunft man nicht kennt, lässt sich nicht überarbeiten.
 */
function pu_sprecher_notiz(array $stueck, string $zielgruppe, string $text, string $modell): string
{
    $z     = PU_ZIELGRUPPEN[$zielgruppe];
    $alter = pu_stufen_alter((int)$stueck['stufe']);
    $woerter = count(preg_split('/\s+/u', trim($text), -1, PREG_SPLIT_NO_EMPTY) ?: []);

    // Etwa 150 gesprochene Wörter je Minute — die übliche Annahme für
    // ruhiges Vorlesen. Sie steht als Anhaltspunkt dabei, nicht als Zusage.
    $sekunden = (int)round($woerter / 150 * 60);

    $titel = $stueck['titel'] . ' — für ' . $z['name'];

    $kopf = [
        '---',
        'type: sprechertext',
        'title: ' . json_encode($titel, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        'description: ' . json_encode(
            'Sprechertext für ' . $z['name'] . ', ' . $woerter . ' Wörter, etwa '
            . $sekunden . ' Sekunden gesprochen.', JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        'tags:',
        '  - sprechertext',
        '  - ' . $zielgruppe,
        '  - ' . $stueck['art'],
        ($stueck['stufe'] > 0 ? '  - stufe-' . $stueck['stufe'] : '  - fachkurs'),
        'timestamp: ' . date('c'),
        'kontext: "[[PROMPTHEUS WISSEN]]"',
        '',
        '# Herkunft — was diesen Text geformt hat',
        'zielgruppe: ' . $zielgruppe,
        'ebene: ' . $z['ebene'],
        'quelle: ' . json_encode($stueck['quelle'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        'kontextdatei: ' . json_encode('000_Kontext/' . $z['kontext'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        'stufe: ' . $stueck['stufe'],
        'alter_von: ' . $alter['von'],
        'alter_bis: ' . $alter['bis'],
        'woerter: ' . $woerter,
        'sekunden: ' . $sekunden,
        'modell: ' . json_encode($modell, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        'stand: entwurf',
        '---',
        '',
        '# ' . $titel,
        '',
        '> **Gesprochen etwa ' . $sekunden . ' Sekunden** (' . $woerter . ' Wörter). ',
        '> Zielgruppe: ' . $z['name'] . ' · Kontext: [[' . $z['kontext'] . ']] · ',
        '> Stoff: [[' . pathinfo($stueck['quelle'], PATHINFO_FILENAME) . ']]',
        '',
        '## Sprechertext',
        '',
        trim($text),
        '',
        '## Zum Aufnehmen',
        '',
        '- **Stand:** Entwurf. Vor der Aufnahme einmal laut lesen — was sich',
        '  verhaspelt, ist zu lang.',
        '- Der Text ist für **' . $z['name'] . '** geschrieben. Die anderen drei',
        '  Fassungen liegen daneben und sagen bewusst etwas anderes.',
        '- Bild und Video zu diesem Stück gehören in denselben Ordner.',
        '',
    ];

    return implode("\n", $kopf);
}
