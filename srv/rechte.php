<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Fünf Ebenen, eine Rechte-Matrix.
 *
 * Aus `Login-Level-Rechte-Plan.md` und der Muster-Seite unter
 * `tests/Login-Levelsystem/` ist hier das laufende Stück geworden: dieselbe
 * Matrix, nur dass sie jetzt greift. Was in der Matrix aus steht, endet im
 * Programm mit 403 — nicht mit einem ausgeblendeten Knopf.
 *
 * **Eine Prüfung, kein Rollen-Vergleich.** Nirgends im Programm steht
 * `if ($rolle === 'lehrer')`. Überall steht `pu_recht_fordern('kurse.manage')`.
 * Der Unterschied zeigt sich an dem Tag, an dem eine Schule ihren Lehrern das
 * Veröffentlichen erlauben will: dann wird ein Schalter umgelegt, und keine
 * Zeile Code angefasst.
 *
 * **Admin ist abgeschottet.** Ebene 1 hat alles und gibt nichts weiter. Es
 * gibt kein Erben von oben nach unten: die Ebene Verwaltung bekommt genau
 * das, was in ihrer Spalte steht. Und die Rechte mit `nur_admin` lassen sich
 * für keine andere Ebene einschalten — auch nicht versehentlich, auch nicht
 * über die API. Wer den API-Schlüssel setzen darf, gibt Geld aus; wer die
 * Rechte-Matrix ändern darf, kann sich jedes andere Recht selbst geben.
 *
 * **Die Admin-Spalte ist festgenagelt.** Sie liesse sich sonst abschalten —
 * und danach käme niemand mehr an die Matrix heran. Dieselbe Überlegung wie
 * beim letzten Tutor, der sich nicht selbst entmachten darf.
 *
 * Gespeichert werden nur die **Abweichungen** von der Vorgabe. Ein neues
 * Recht taucht damit von selbst mit seiner Vorgabe auf, statt zu fehlen, und
 * „Zurück zur Standard-Matrix" ist ein DELETE.
 */

// ---------------------------------------------------------------- Die Ebenen
//
// Reihenfolge = Anzeige-Reihenfolge, von oben (Plattform) nach unten
// (einfacher Zugang). Sie sagt nichts über Vererbung: die gibt es nicht.
const PU_EBENEN = [
    'admin'      => ['anzeige' => 'Admin',      'hinweis' => 'Plattform · allumfassend'],
    'verwaltung' => ['anzeige' => 'Verwaltung', 'hinweis' => 'Schule · Direktor'],
    'lehrer'     => ['anzeige' => 'Lehrer',     'hinweis' => 'Unterricht · Tutor'],
    'eltern'     => ['anzeige' => 'Eltern',     'hinweis' => 'Erziehungsberechtigte'],
    'schueler'   => ['anzeige' => 'Schüler',    'hinweis' => 'Lernender · einfacher Zugang'],
];

/**
 * Die Matrix.
 *
 * `vorgabe` ist die Spalte aus dem Plan, §2. `nur_admin` heisst: dieses Recht
 * gehört Ebene 1 allein und ist für die anderen vier nicht einschaltbar.
 *
 * `aktionen` nennt die API-Aktionen, die dieses Recht wirklich prüfen. Das
 * ist kein Kommentar, sondern der Prüfstein: `tests/rechte_test.php` liest
 * diese Liste gegen `api.php` und schlägt an, wenn eine Aktion darin fehlt
 * oder eine genannte Aktion es nicht gibt. Ein Schalter, der nichts schaltet,
 * ist schlimmer als kein Schalter — er verspricht Sicherheit.
 */
const PU_RECHTE = [
    // ------------------------------------------------------ System & Dashboard
    ['name' => 'dashboard.view', 'gruppe' => 'System & Dashboard',
     'was' => 'Kurse, Lektionen und das Menü sehen',
     'vorgabe' => ['admin' => 1, 'verwaltung' => 1, 'lehrer' => 1, 'eltern' => 1, 'schueler' => 1],
     'aktionen' => ['kurse', 'kurs', 'lektion']],

    ['name' => 'rechte.einstellungen', 'gruppe' => 'System & Dashboard',
     'was' => 'Rechte-Matrix ändern', 'nur_admin' => true,
     'aktionen' => ['rechte_lesen', 'recht_setzen', 'rechte_zuruecksetzen']],

    ['name' => 'sicherheit.einstellungen', 'gruppe' => 'System & Dashboard',
     'was' => 'Datenschutz-, Widerrufs- und Protokoll-Einstellungen', 'nur_admin' => true,
     'aktionen' => []],

    ['name' => 'login.einstellungen', 'gruppe' => 'System & Dashboard',
     'was' => 'Anmeldung und Erscheinungsbild der Academy', 'nur_admin' => true,
     'aktionen' => []],

    // ------------------------------------------------------ Schulverwaltung
    ['name' => 'schulen.manage', 'gruppe' => 'Schulverwaltung',
     'was' => 'Schulen anlegen, ändern, entfernen', 'nur_admin' => true,
     'aktionen' => []],

    ['name' => 'klassen.view', 'gruppe' => 'Schulverwaltung',
     'was' => 'Klassenübersicht sehen',
     'vorgabe' => ['admin' => 1, 'verwaltung' => 1, 'lehrer' => 1, 'eltern' => 0, 'schueler' => 0],
     'aktionen' => ['klasse']],

    ['name' => 'klassen.manage', 'gruppe' => 'Schulverwaltung',
     'was' => 'Klassen und Gruppen verwalten',
     'vorgabe' => ['admin' => 1, 'verwaltung' => 1, 'lehrer' => 0, 'eltern' => 0, 'schueler' => 0],
     'aktionen' => []],

    // Ein Konto wirklich uebernehmen, um einen Ablauf ueber mehrere Rollen zu
    // pruefen. **Nur Ebene 1, in der Vorgabe sonst ueberall 0** — auch bei der
    // Verwaltung. Wer uebernehmen darf, kann alles tun, was das uebernommene
    // Konto darf; das ist kein Recht, das man aus Bequemlichkeit
    // weiterreicht. Jede Handlung steht mit beiden Namen im Protokoll.
    ['name' => 'rollen.uebernehmen', 'gruppe' => 'Schulverwaltung',
     'was' => 'Ein anderes Konto übernehmen, um Abläufe zu prüfen',
     'vorgabe' => ['admin' => 1, 'verwaltung' => 0, 'lehrer' => 0, 'eltern' => 0, 'schueler' => 0],
     // Nur das Übernehmen hängt am Recht. **`rolle_zurueck` steht bewusst
     // NICHT hier**: Der Rückweg ins eigene Konto darf an keinem Recht hängen,
     // sonst sperrt sich Ebene 1 im Konto eines Schülers ein und kommt nur
     // über Abmelden wieder heraus.
     'aktionen' => ['rolle_uebernehmen']],

    // ------------------------------------------------ Lehrkörper, Eltern, Lernende
    ['name' => 'lernende.manage', 'gruppe' => 'Lehrkörper, Eltern & Lernende',
     'was' => 'Konten anlegen, Kennwörter zurücksetzen',
     'vorgabe' => ['admin' => 1, 'verwaltung' => 1, 'lehrer' => 1, 'eltern' => 0, 'schueler' => 0],
     'aktionen' => ['konto_anlegen', 'kennwort_zuruecksetzen', 'profil_pflegen']],

    ['name' => 'schueler.view', 'gruppe' => 'Lehrkörper, Eltern & Lernende',
     'was' => 'Antworten und Versuche einzelner Lernender ansehen',
     'vorgabe' => ['admin' => 1, 'verwaltung' => 1, 'lehrer' => 1, 'eltern' => 0, 'schueler' => 0],
     'aktionen' => ['versuche_zu']],

    ['name' => 'lehrkraefte.view', 'gruppe' => 'Lehrkörper, Eltern & Lernende',
     'was' => 'Lehrkraft-Konten einsehen',
     'vorgabe' => ['admin' => 1, 'verwaltung' => 1, 'lehrer' => 1, 'eltern' => 0, 'schueler' => 0],
     'aktionen' => []],

    ['name' => 'lehrkraefte.manage', 'gruppe' => 'Lehrkörper, Eltern & Lernende',
     'was' => 'Lehrkraft-Konten anlegen und entfernen',
     'vorgabe' => ['admin' => 1, 'verwaltung' => 1, 'lehrer' => 0, 'eltern' => 0, 'schueler' => 0],
     'aktionen' => []],

    ['name' => 'eltern.manage', 'gruppe' => 'Lehrkörper, Eltern & Lernende',
     'was' => 'Eltern-Konten verwalten und mit einem Kind verknüpfen',
     'vorgabe' => ['admin' => 1, 'verwaltung' => 1, 'lehrer' => 0, 'eltern' => 0, 'schueler' => 0],
     'aktionen' => ['kind_setzen']],

    ['name' => 'rollen.manage', 'gruppe' => 'Lehrkörper, Eltern & Lernende',
     'was' => 'Ebene eines Kontos ändern', 'nur_admin' => true,
     'aktionen' => ['rolle_setzen']],

    // ------------------------------------------------------ Inhalte & Kurse
    ['name' => 'kurse.manage', 'gruppe' => 'Inhalte & Kurse',
     'was' => 'Kurse pflegen',
     'vorgabe' => ['admin' => 1, 'verwaltung' => 1, 'lehrer' => 1, 'eltern' => 0, 'schueler' => 0],
     'aktionen' => []],

    ['name' => 'kurse.veroeffentlichen', 'gruppe' => 'Inhalte & Kurse',
     'was' => 'Kurs für alle freigeben',
     'vorgabe' => ['admin' => 1, 'verwaltung' => 1, 'lehrer' => 0, 'eltern' => 0, 'schueler' => 0],
     'aktionen' => []],

    ['name' => 'lektionen.manage', 'gruppe' => 'Inhalte & Kurse',
     'was' => 'Lektionen und Aufgaben pflegen, Stoff prüfen',
     'vorgabe' => ['admin' => 1, 'verwaltung' => 1, 'lehrer' => 1, 'eltern' => 0, 'schueler' => 0],
     'aktionen' => ['stoff_pruefen']],

    ['name' => 'lektionen.freigabe', 'gruppe' => 'Inhalte & Kurse',
     'was' => 'Geprüfte Lektionen freigeben',
     'vorgabe' => ['admin' => 1, 'verwaltung' => 1, 'lehrer' => 0, 'eltern' => 0, 'schueler' => 0],
     'aktionen' => []],

    // ------------------------------------------ Lernen, Prüfung & Fortschritt
    ['name' => 'lernen.ausfuehren', 'gruppe' => 'Lernen, Prüfung & Fortschritt',
     'was' => 'Aufgaben lösen und abgeben',
     'vorgabe' => ['admin' => 1, 'verwaltung' => 1, 'lehrer' => 1, 'eltern' => 0, 'schueler' => 1],
     'aktionen' => ['abgeben', 'hinweis', 'loesung_zeigen', 'vertiefung']],

    ['name' => 'pruefung.ausfuehren', 'gruppe' => 'Lernen, Prüfung & Fortschritt',
     'was' => 'Prüfungen ablegen',
     'vorgabe' => ['admin' => 1, 'verwaltung' => 1, 'lehrer' => 1, 'eltern' => 0, 'schueler' => 1],
     'aktionen' => ['pruefung_start', 'pruefung_abgeben']],

    ['name' => 'pruefung.bewerten', 'gruppe' => 'Lernen, Prüfung & Fortschritt',
     'was' => 'Freitext-Bewertungen freigeben',
     'vorgabe' => ['admin' => 1, 'verwaltung' => 1, 'lehrer' => 0, 'eltern' => 0, 'schueler' => 0],
     'aktionen' => []],

    ['name' => 'urkunde.ausstellen', 'gruppe' => 'Lernen, Prüfung & Fortschritt',
     'was' => 'Urkunden ausstellen und widerrufen',
     'vorgabe' => ['admin' => 1, 'verwaltung' => 1, 'lehrer' => 0, 'eltern' => 0, 'schueler' => 0],
     'aktionen' => ['urkunde_widerrufen']],

    ['name' => 'fortschritt.eigen', 'gruppe' => 'Lernen, Prüfung & Fortschritt',
     'was' => 'Den eigenen Lernstand sehen',
     'vorgabe' => ['admin' => 1, 'verwaltung' => 1, 'lehrer' => 1, 'eltern' => 1, 'schueler' => 1],
     'aktionen' => ['stand', 'kurs_stand']],

    ['name' => 'auswertung.lehrersehen', 'gruppe' => 'Lernen, Prüfung & Fortschritt',
     'was' => 'Auswertung über alle Lernenden sehen',
     'vorgabe' => ['admin' => 1, 'verwaltung' => 1, 'lehrer' => 1, 'eltern' => 0, 'schueler' => 0],
     'aktionen' => []],

    // ------------------------------------------------------ Academy-Betrieb
    //
    // Diese drei stehen nicht im Plan §2 — es gab sie dort noch nicht. Sie
    // sind aber die drei Knöpfe, die in der laufenden Academy am meisten anrichten
    // können, und darum gehören sie in dieselbe Matrix wie alles andere.
    ['name' => 'regeln.manage', 'gruppe' => 'Academy-Betrieb',
     'was' => 'Academy-Regeln ändern (Punkte, Boni, Abschaltungen)',
     'vorgabe' => ['admin' => 1, 'verwaltung' => 1, 'lehrer' => 0, 'eltern' => 0, 'schueler' => 0],
     'aktionen' => ['regel_setzen']],

    ['name' => 'ki.einstellungen', 'gruppe' => 'Academy-Betrieb',
     'was' => 'Tutor-Modell und Zugangsschlüssel setzen', 'nur_admin' => true,
     'aktionen' => ['geheimnis_setzen', 'tutor_probe', 'or_katalog']],

    ['name' => 'wartung.ausfuehren', 'gruppe' => 'Academy-Betrieb',
     'was' => 'Punkte neu rechnen, Protokolle leeren', 'nur_admin' => true,
     'aktionen' => ['wartung']],

    ['name' => 'tutor.fragen', 'gruppe' => 'Academy-Betrieb',
     'was' => 'Die Tutor-Agenten fragen (kostet Modell-Aufrufe)',
     'vorgabe' => ['admin' => 1, 'verwaltung' => 1, 'lehrer' => 1, 'eltern' => 0, 'schueler' => 1],
     'aktionen' => ['tutor_fragen']],

    ['name' => 'tokenicer.nutzen', 'gruppe' => 'Academy-Betrieb',
     'was' => 'Den Tokenicer benutzen',
     'vorgabe' => ['admin' => 1, 'verwaltung' => 1, 'lehrer' => 1, 'eltern' => 1, 'schueler' => 1],
     'aktionen' => ['tok', 'tok_modelle']],

    // ------------------------------------------------------ Geld
    //
    // Getrennt in sehen · verwalten · bestätigen. Das ist keine Pedanterie:
    // „bestätigen" ersetzt den Zahlungseingang, und wer das darf, kann sich
    // jeden Plan selbst freischalten. Deshalb Ebene 1 allein.
    ['name' => 'abo.sehen', 'gruppe' => 'Plan & Token',
     'was' => 'Den eigenen Plan und den Tokenstand sehen',
     'vorgabe' => ['admin' => 1, 'verwaltung' => 1, 'lehrer' => 1, 'eltern' => 1, 'schueler' => 1],
     'aktionen' => ['cockpit']],

    ['name' => 'abo.verwalten', 'gruppe' => 'Plan & Token',
     'was' => 'Pläne buchen und beenden',
     // Für Lehrkräfte ab Werk AUS — aber umschaltbar. Eine Schule, die ihren
     // Lehrkräften den Klassenplan selbst überlassen will, legt hier einen
     // Schalter um und ändert keine Zeile Code.
     'vorgabe' => ['admin' => 1, 'verwaltung' => 1, 'lehrer' => 0, 'eltern' => 0, 'schueler' => 0],
     'aktionen' => ['abo_buchen', 'abo_beenden', 'abos_alle']],

    ['name' => 'token.einzahlen', 'gruppe' => 'Plan & Token',
     'was' => 'Token-Pakete vormerken',
     'vorgabe' => ['admin' => 1, 'verwaltung' => 1, 'lehrer' => 0, 'eltern' => 1, 'schueler' => 0],
     'aktionen' => ['token_einzahlen']],

    ['name' => 'abo.bestaetigen', 'gruppe' => 'Plan & Token',
     'was' => 'Zahlungseingang bestätigen', 'nur_admin' => true,
     'aktionen' => ['abo_bestaetigen']],

    /* Talente an die eigene Kette weitergeben.
     *
     * Ab Werk für die vier oberen Ebenen an, für Schüler aus — ein Schüler
     * hat niemanden unter sich (siehe PU_TALENT_KETTE), das Recht wäre bei
     * ihm ein Schalter ohne Wirkung. Umschaltbar bleibt es trotzdem: Eine
     * Academy, die Eltern nichts weitergeben lassen will, legt hier um.
     *
     * Es ist ausdrücklich NICHT `nur_admin`. Genau darin liegt der Zweck:
     * Verteilen soll auch die Verwaltung, der Lehrer und das Elternhaus
     * können, jeder in seinem Umkreis. Die Grenze zieht nicht dieses Recht,
     * sondern die Kette — wer es hat, erreicht damit trotzdem nur, wer unter
     * ihm steht. */
    ['name' => 'talente.senden', 'gruppe' => 'Plan & Token',
     'was' => 'Talente an die eigene Kette weiterreichen',
     'vorgabe' => ['admin' => 1, 'verwaltung' => 1, 'lehrer' => 1, 'eltern' => 1, 'schueler' => 0],
     'aktionen' => ['talente_ziele', 'talente_senden']],

    ['name' => 'sprache.nutzen', 'gruppe' => 'Academy-Betrieb',
     'was' => 'Sprachnachrichten diktieren (Erkennung läuft örtlich)',
     'vorgabe' => ['admin' => 1, 'verwaltung' => 1, 'lehrer' => 1, 'eltern' => 1, 'schueler' => 1],
     'aktionen' => ['sprache_erkennen']],

    // Getrennt vom Diktieren, weil es etwas anderes ist: Die Erkennung bleibt
    // auf diesem Rechner, das Vorlesen geht über OpenRouter hinaus und kostet
    // je Tonsekunde. Wer das eine erlaubt, hat damit nicht das andere erlaubt.
    ['name' => 'stimme.nutzen', 'gruppe' => 'Academy-Betrieb',
     'was' => 'Texte vorlesen lassen (läuft über OpenRouter und kostet Token)',
     'vorgabe' => ['admin' => 1, 'verwaltung' => 1, 'lehrer' => 1, 'eltern' => 1, 'schueler' => 1],
     'aktionen' => ['vorlesen']],

    // Die Persona-Vorschau. `nur_admin`, und damit gilt dasselbe wie für die
    // Ebene selbst: Sie lässt sich über die Matrix NICHT weitergeben
    // (pu_recht_hat bricht bei nur_admin für jede andere Ebene ab). Eine
    // Vorschau, die eine Lehrkraft einnehmen könnte, wäre kein Schaden — aber
    // die Rechte bleiben dabei unverändert, und dann sähe die Lehrkraft
    // Lösungen, die sie in ihrer Rolle nicht sehen soll.
    ['name' => 'persona.nutzen', 'gruppe' => 'Academy-Betrieb',
     'was' => 'Kurse als andere Persona ansehen (Vorschau, ändert keine Daten)',
     'nur_admin' => true,
     'vorgabe' => ['admin' => 1, 'verwaltung' => 0, 'lehrer' => 0, 'eltern' => 0, 'schueler' => 0],
     'aktionen' => ['persona', 'persona_setzen']],

    ['name' => 'stimme.pruefen', 'gruppe' => 'Academy-Betrieb',
     'was' => 'Probelauf der Sprachausgabe in den Einstellungen',
     'vorgabe' => ['admin' => 1, 'verwaltung' => 1, 'lehrer' => 0, 'eltern' => 0, 'schueler' => 0],
     'aktionen' => ['stimme_probe']],

    // ------------------------------------------------------ Netzwerk (später)
    //
    // Der Community-Pool aus dem Netzwerk-Vorplan gibt es noch nicht. Die
    // Rechte stehen trotzdem hier, damit die Matrix vollständig ist — und mit
    // leerer Aktionsliste, damit die Oberfläche „noch nicht in Betrieb"
    // dazuschreibt statt Wirkung vorzutäuschen.
    ['name' => 'pool.download', 'gruppe' => 'Netzwerk / Community',
     'was' => 'Bausteine aus dem Gemeinschafts-Pool laden',
     'vorgabe' => ['admin' => 1, 'verwaltung' => 1, 'lehrer' => 1, 'eltern' => 1, 'schueler' => 1],
     'aktionen' => []],

    ['name' => 'pool.upload', 'gruppe' => 'Netzwerk / Community',
     'was' => 'Eigenes in den Pool geben',
     'vorgabe' => ['admin' => 1, 'verwaltung' => 1, 'lehrer' => 1, 'eltern' => 0, 'schueler' => 0],
     'aktionen' => []],

    ['name' => 'pool.kuratieren', 'gruppe' => 'Netzwerk / Community',
     'was' => 'Den Pool aufräumen und Doppeltes zusammenlegen', 'nur_admin' => true,
     'aktionen' => []],
];

// ---------------------------------------------------------------- Nachschlagen

/** Ein Recht aus der Liste, oder null. */
function pu_recht(string $name): ?array
{
    static $index = null;
    if ($index === null) {
        $index = [];
        foreach (PU_RECHTE as $r) $index[$r['name']] = $r;
    }
    return $index[$name] ?? null;
}

/** Ist dieses Recht ausschliesslich Ebene 1 vorbehalten? */
function pu_recht_nur_admin(string $name): bool
{
    $r = pu_recht($name);
    return $r !== null && !empty($r['nur_admin']);
}

/** Die Vorgabe-Spalte eines Rechts. */
function pu_recht_vorgabe(array $recht, string $ebene): bool
{
    if ($ebene === 'admin') return true;                 // Ebene 1 hat alles.
    if (!empty($recht['nur_admin'])) return false;       // …und teilt nichts.
    return !empty($recht['vorgabe'][$ebene]);
}

/**
 * Die vollständige Matrix: Ebene → Recht → darf.
 *
 * Vorgabe aus dem Code, darübergelegt die Abweichungen aus der Datenbank.
 * Die Admin-Spalte wird nicht überlagert — sie ist immer ganz an.
 */
function pu_recht_matrix(bool $neu = false): array
{
    static $matrix = null;
    if ($matrix !== null && !$neu) return $matrix;

    $matrix = [];
    foreach (PU_EBENEN as $ebene => $_) {
        foreach (PU_RECHTE as $r) {
            $matrix[$ebene][$r['name']] = pu_recht_vorgabe($r, $ebene);
        }
    }

    $st = pu_db()->query('SELECT ebene, recht, erlaubt FROM rechte_abweichung');
    foreach ($st as $zeile) {
        $ebene = (string)$zeile['ebene'];
        $recht = (string)$zeile['recht'];
        if ($ebene === 'admin') continue;                       // festgenagelt
        if (!isset($matrix[$ebene][$recht])) continue;          // Recht entfallen
        if (pu_recht_nur_admin($recht)) continue;               // nie weitergebbar
        $matrix[$ebene][$recht] = ((int)$zeile['erlaubt'] === 1);
    }

    return $matrix;
}

// ---------------------------------------------------------------- Ebene & Prüfung

/**
 * Die Ebene eines Kontos.
 *
 * Alte Kontenstände tragen noch `tutor`/`lernender`. Die Migration in
 * `srv/db.php` schreibt sie um; diese Umsetzung hier ist der Gürtel dazu,
 * falls eine Datenbank aus einer alten Sicherung zurückkommt. Unbekanntes
 * wird zum Schüler — der Ebene mit den wenigsten Rechten.
 */
function pu_ebene(?array $wer = null): string
{
    if ($wer === null) $wer = pu_wer();
    if ($wer === null) return '';

    $rolle = (string)($wer['rolle'] ?? '');
    if (isset(PU_EBENEN[$rolle])) return $rolle;

    return match ($rolle) {
        'tutor'     => 'lehrer',
        'lernender' => 'schueler',
        default     => 'schueler',
    };
}

/** Darf die angemeldete Person (oder `$wer`) das? */
function pu_recht_hat(string $recht, ?array $wer = null): bool
{
    $ebene = pu_ebene($wer);
    if ($ebene === '') return false;
    if ($ebene === 'admin') return true;

    $matrix = pu_recht_matrix();

    // Ein unbekanntes Recht ist nie erlaubt. Ein Tippfehler in einer Prüfung
    // soll eine geschlossene Tür ergeben, keine offene.
    return $matrix[$ebene][$recht] ?? false;
}

/** Wie pu_recht_hat, nur dass es hier endet, wenn das Recht fehlt. */
function pu_recht_fordern(string $recht): void
{
    if (pu_recht_hat($recht)) return;

    $r = pu_recht($recht);
    $was = $r === null ? $recht : $r['was'];
    pu_fehler('Dafür fehlt dir das Recht: ' . $was . ' (' . $recht . ')', 403);
}

/** Alle Rechte der angemeldeten Person als flache Liste — für die Oberfläche. */
function pu_recht_meine(?array $wer = null): array
{
    $aus = [];
    foreach (PU_RECHTE as $r) {
        if (pu_recht_hat($r['name'], $wer)) $aus[] = $r['name'];
    }
    return $aus;
}

// ---------------------------------------------------------------- Ändern

/**
 * Legt einen Schalter der Matrix um.
 *
 * Abgewiesen wird: die Admin-Spalte, ein `nur_admin`-Recht ausserhalb von
 * Ebene 1, unbekannte Ebenen und unbekannte Rechte. Alles andere wird als
 * Abweichung gespeichert — oder gelöscht, wenn es wieder der Vorgabe
 * entspricht. So bleibt die Tabelle klein und sagt genau, was jemand
 * absichtlich anders wollte.
 */
function pu_recht_setzen(string $ebene, string $recht, bool $an, int $person): void
{
    if (!isset(PU_EBENEN[$ebene])) {
        throw new RuntimeException('Diese Ebene gibt es nicht: ' . $ebene);
    }
    if ($ebene === 'admin') {
        throw new RuntimeException(
            'Die Admin-Spalte lässt sich nicht ändern — sonst sperrt sich die Academy selbst aus.');
    }
    $r = pu_recht($recht);
    if ($r === null) {
        throw new RuntimeException('Dieses Recht gibt es nicht: ' . $recht);
    }
    if (!empty($r['nur_admin'])) {
        throw new RuntimeException(
            'Dieses Recht gehört Ebene 1 allein und lässt sich nicht weitergeben: ' . $recht);
    }

    $vorher = pu_recht_matrix()[$ebene][$recht];
    if ($vorher === $an) return;                        // nichts zu tun, nichts zu protokollieren

    if (pu_recht_vorgabe($r, $ebene) === $an) {
        $st = pu_db()->prepare('DELETE FROM rechte_abweichung WHERE ebene = ? AND recht = ?');
        $st->execute([$ebene, $recht]);
    } else {
        $st = pu_db()->prepare(
            'INSERT INTO rechte_abweichung (ebene, recht, erlaubt) VALUES (?, ?, ?)
             ON CONFLICT(ebene, recht) DO UPDATE SET erlaubt = excluded.erlaubt');
        $st->execute([$ebene, $recht, $an ? 1 : 0]);
    }

    pu_recht_protokoll($person, $an ? 'an' : 'aus', $ebene, $recht, $an);

    // Die Matrix wird im selben Request noch einmal gelesen — für die Antwort
    // an den Browser. Ohne dieses Auffrischen zeigte sie den Stand von vorhin.
    pu_recht_matrix(true);
}

/** Alles zurück auf die Vorgabe aus dem Plan. */
function pu_recht_zuruecksetzen(int $person): int
{
    $anzahl = (int)pu_db()->query('SELECT COUNT(*) FROM rechte_abweichung')->fetchColumn();
    pu_db()->exec('DELETE FROM rechte_abweichung');
    if ($anzahl > 0) pu_recht_protokoll($person, 'zurueckgesetzt', '', '', false);
    pu_recht_matrix(true);
    return $anzahl;
}

// ---------------------------------------------------------------- Protokoll

/**
 * Append-only mit Hash-Kette.
 *
 * Jeder Eintrag trägt den Hash seines Vorgängers. Wer eine Zeile
 * nachträglich ändert oder herausnimmt, bricht die Kette ab dieser Stelle —
 * sichtbar für jeden, der `pu_recht_kette_pruefen()` laufen lässt. Das ist
 * kein Schutz gegen Löschen, sondern gegen unbemerktes Löschen; mehr kann
 * eine Datei auf demselben Rechner nicht leisten.
 *
 * Im Protokoll steht nie ein Kennwort und nie eine Antwort — nur Ebene,
 * Recht, Wert und wer es war.
 */
function pu_recht_protokoll(int $person, string $aktion, string $ebene,
                            string $recht, bool $wert): void
{
    $vorher = (string)(pu_db()
        ->query('SELECT hash FROM rechte_audit ORDER BY nr DESC LIMIT 1')
        ->fetchColumn() ?: str_repeat('0', 64));

    $zeit = pu_jetzt();
    $hash = hash('sha256', $vorher . '|' . $zeit . '|' . $person . '|' . $aktion .
                           '|' . $ebene . '|' . $recht . '|' . ($wert ? '1' : '0'));

    $st = pu_db()->prepare(
        'INSERT INTO rechte_audit (zeit, person, aktion, ebene, recht, wert, vorher, hash)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    $st->execute([$zeit, $person, $aktion, $ebene, $recht, $wert ? 1 : 0, $vorher, $hash]);
}

/** Die letzten Einträge, neueste zuerst. */
function pu_recht_audit(int $anzahl = 25): array
{
    $anzahl = max(1, min(200, $anzahl));
    $st = pu_db()->query(
        'SELECT nr, zeit, person, aktion, ebene, recht, wert, hash
         FROM rechte_audit ORDER BY nr DESC LIMIT ' . $anzahl);

    $namen = [];
    foreach (pu_db()->query('SELECT id, anzeigename FROM lernende') as $l) {
        $namen[(int)$l['id']] = (string)$l['anzeigename'];
    }

    $aus = [];
    foreach ($st as $z) {
        $aus[] = [
            'nr'    => (int)$z['nr'],
            'zeit'  => (string)$z['zeit'],
            'wer'   => $namen[(int)$z['person']] ?? ('#' . (int)$z['person']),
            'aktion' => (string)$z['aktion'],
            'ebene' => (string)$z['ebene'],
            'recht' => (string)$z['recht'],
            'wert'  => ((int)$z['wert'] === 1),
            'hash'  => substr((string)$z['hash'], 0, 8),
        ];
    }
    return $aus;
}

/**
 * Läuft die Kette durch und sagt, ab welcher Zeile sie bricht.
 *
 * @return array{ok: bool, geprueft: int, bruch: int}
 */
function pu_recht_kette_pruefen(): array
{
    $vorher   = str_repeat('0', 64);
    $geprueft = 0;

    foreach (pu_db()->query('SELECT * FROM rechte_audit ORDER BY nr ASC') as $z) {
        $soll = hash('sha256', $vorher . '|' . $z['zeit'] . '|' . $z['person'] . '|' .
                     $z['aktion'] . '|' . $z['ebene'] . '|' . $z['recht'] . '|' .
                     ((int)$z['wert'] === 1 ? '1' : '0'));

        if ($soll !== $z['hash'] || $vorher !== $z['vorher']) {
            return ['ok' => false, 'geprueft' => $geprueft, 'bruch' => (int)$z['nr']];
        }
        $vorher = (string)$z['hash'];
        $geprueft++;
    }
    return ['ok' => true, 'geprueft' => $geprueft, 'bruch' => 0];
}

// ---------------------------------------------------------------- Für die Oberfläche

/**
 * Alles, was die Rechte-Seite braucht, in einem Stück.
 *
 * Absichtlich ein Aufruf: die Seite zeigt Matrix, Vorschau und Protokoll
 * nebeneinander, und drei Aufrufe könnten drei verschiedene Stände zeigen.
 */
function pu_rechte_ausgabe(): array
{
    $matrix  = pu_recht_matrix();
    $gruppen = [];

    foreach (PU_RECHTE as $r) {
        $gruppen[$r['gruppe']][] = [
            'name'      => $r['name'],
            'was'       => $r['was'],
            'nur_admin' => !empty($r['nur_admin']),
            'wirkt'     => !empty($r['aktionen']),
            'aktionen'  => $r['aktionen'],
            'stand'     => array_map(
                fn($e) => $matrix[$e][$r['name']],
                array_combine(array_keys(PU_EBENEN), array_keys(PU_EBENEN))),
            'vorgabe'   => array_map(
                fn($e) => pu_recht_vorgabe($r, $e),
                array_combine(array_keys(PU_EBENEN), array_keys(PU_EBENEN))),
        ];
    }

    $abweichungen = (int)pu_db()->query('SELECT COUNT(*) FROM rechte_abweichung')->fetchColumn();

    return [
        'ebenen'       => PU_EBENEN,
        'gruppen'      => $gruppen,
        'abweichungen' => $abweichungen,
        'audit'        => pu_recht_audit(12),
        'kette'        => pu_recht_kette_pruefen(),
    ];
}
