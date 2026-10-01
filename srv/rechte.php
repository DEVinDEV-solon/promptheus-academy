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
 * über die API. Seit 28.09.2026 betreiben Verwaltung und Eltern ihre Academy
 * selbst: Tutor-Schlüssel, Updates, Wartung und die Matrix gehören ihnen —
 * mit der Grenze, dass sie nur weitergeben, was sie selbst haben, und nie
 * an die eigene Spalte (pu_recht_setzen_darf).
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
 * Die Rolle kommt aus der Registrierung (Entscheid des Betreibers 28.09.2026).
 *
 * Die Ebene eines Kontos steht in der Datenbank — aber sie wirkt nur, soweit
 * die Bescheinigung des Servers sie deckt. Die Bescheinigung ist vom Server
 * unterschrieben (srv/identitaet.php) und nennt die **Art** der Registrierung.
 * Die Art legt fest, welche Ebenen es auf diesem Rechner geben kann und
 * welche das zahlende Konto bekommt (`inhaber` — die Adminrolle des Kunden,
 * nicht die des Betreibers).
 *
 *   ohne Bescheinigung   jeder ist Schüler. Die Academy lässt sich ansehen,
 *                        aber niemand kann einen Schlüssel eintragen, Rechte
 *                        verteilen oder Konten anlegen.
 *   betreiber            DEVinDEV selbst — nur auf eigenen Rechnern.
 *
 * Wer die Datenbank ändert und sich `verwaltung` einträgt, bleibt damit ohne
 * Bescheinigung trotzdem Schüler. Wer den Code ändert, kann alles — das ist
 * auf dem eigenen Rechner nicht zu verhindern. Was Geld kostet (Token,
 * Server-Tutor, Community, Updates), prüft deshalb der Server selbst.
 *
 * Die Arten entsprechen `mandanten.art` auf dem Server.
 */
const PU_ARTEN = [
    'betreiber'    => ['inhaber' => 'admin',
                       'ebenen'  => ['admin', 'verwaltung', 'lehrer', 'eltern', 'schueler']],
    'schule'       => ['inhaber' => 'verwaltung',
                       'ebenen'  => ['verwaltung', 'lehrer', 'eltern', 'schueler']],
    'hochschule'   => ['inhaber' => 'verwaltung',
                       'ebenen'  => ['verwaltung', 'lehrer', 'eltern', 'schueler']],
    'privatschule' => ['inhaber' => 'verwaltung',
                       'ebenen'  => ['verwaltung', 'lehrer', 'eltern', 'schueler']],
    'traeger'      => ['inhaber' => 'verwaltung',
                       'ebenen'  => ['verwaltung', 'lehrer', 'eltern', 'schueler']],
    // Eine Lehrkraft, die selbst zahlt, betreibt ihre Klasse wie eine kleine
    // Schule: Sie verwaltet, legt Schüler und Eltern an.
    'lehrkraft'    => ['inhaber' => 'verwaltung',
                       'ebenen'  => ['verwaltung', 'eltern', 'schueler']],
    // Familie: Eltern verwalten, Kinder lernen. Keine Schule, keine Lehrkraft.
    'eltern'       => ['inhaber' => 'eltern',
                       'ebenen'  => ['eltern', 'schueler']],
    // Ein Erwachsener, der für sich selbst lernt: verwaltet und lernt zugleich.
    'einzelperson' => ['inhaber' => 'verwaltung',
                       'ebenen'  => ['verwaltung']],
];

/**
 * Die Art der Registrierung dieses Rechners — leer ohne gültige Bescheinigung.
 *
 * Im Testlauf gilt `$GLOBALS['PU_TEST_ART']` (tests/hilfe.php). Den Schalter
 * kann nur PHP-Code setzen, keine .env und keine Startdatei.
 */
function pu_art(bool $neu = false): string
{
    static $art = null;
    if ($neu) $art = null;

    if (!empty($GLOBALS['PU_TEST_MODUS']) && array_key_exists('PU_TEST_ART', $GLOBALS)) {
        $t = (string)$GLOBALS['PU_TEST_ART'];
        return isset(PU_ARTEN[$t]) ? $t : '';
    }
    if ($art !== null) return $art;

    $art = '';
    try {
        require_once __DIR__ . '/identitaet.php';
        $b = pu_ident_bescheinigung();
        $a = (string)($b['art'] ?? '');
        if ($b !== null && isset(PU_ARTEN[$a])) $art = $a;
    } catch (Throwable) {
        $art = '';      // ohne sodium oder mit kaputter Datei: nicht registriert
    }
    return $art;
}

/** Die Ebene, die das zahlende Konto bei dieser Art bekommt ('' = keine). */
function pu_art_inhaber(?string $art = null): string
{
    return PU_ARTEN[$art ?? pu_art()]['inhaber'] ?? '';
}

/**
 * Die gespeicherte Ebene, gedeckelt durch die Art.
 *
 * Was die Art nicht kennt, wird Schüler — mit einer Ausnahme: ein altes
 * `admin` aus der Zeit vor der Registrierungspflicht wird zum Inhaber der
 * Art. Das war das erste Konto, und bei einer registrierten Installation hat
 * es auch gezahlt.
 */
function pu_ebene_gedeckelt(string $ebene, ?string $art = null): string
{
    $regel = PU_ARTEN[$art ?? pu_art()] ?? null;
    if ($regel === null) return 'schueler';
    if (in_array($ebene, $regel['ebenen'], true)) return $ebene;
    return $ebene === 'admin' ? $regel['inhaber'] : 'schueler';
}

/**
 * Wer welche Ebene anlegen darf. Nie höher als die eigene — sonst legte eine
 * Lehrkraft sich eine Verwaltung an und meldete sich mit ihr an.
 */
const PU_ANLEGEN = [
    'admin'      => ['admin', 'verwaltung', 'lehrer', 'eltern', 'schueler'],
    'verwaltung' => ['verwaltung', 'lehrer', 'eltern', 'schueler'],
    'lehrer'     => ['eltern', 'schueler'],
    'eltern'     => ['eltern', 'schueler'],
    'schueler'   => [],
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
     'aktionen' => ['kurse', 'kurs', 'lektion', 'werkstatt_menue']],

    ['name' => 'rechte.einstellungen', 'gruppe' => 'System & Dashboard',
     // Seit 28.09.2026 auch Verwaltung und Eltern: Sie betreiben ihre Academy
     // selbst. Weitergeben dürfen sie nur, was sie selbst haben, und nie an
     // die eigene Spalte (pu_recht_setzen).
     'was' => 'Rechte-Matrix ändern (nur weitergeben, was man selbst hat)',
     'vorgabe' => ['admin' => 1, 'verwaltung' => 1, 'lehrer' => 0, 'eltern' => 1, 'schueler' => 0],
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
     'was' => 'Klassen und Gruppen verwalten, Lehrkräften ihre Klassen zuordnen',
     'vorgabe' => ['admin' => 1, 'verwaltung' => 1, 'lehrer' => 0, 'eltern' => 0, 'schueler' => 0],
     'aktionen' => ['lehrer_klassen_setzen']],

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
     'was' => 'Urkunden widerrufen, Urkunden-Sicherheit sehen, Testbetrieb schalten',
     'vorgabe' => ['admin' => 1, 'verwaltung' => 1, 'lehrer' => 0, 'eltern' => 0, 'schueler' => 0],
     'aktionen' => ['urkunde_widerrufen', 'urkunden_testbetrieb', 'urkunden_test_bestehen',
                    'urkunden_test_zuruecksetzen', 'urkunden_test_kurs7']],

    // Die Abschluss-Urkunde trägt den echten Namen (srv/abschluss.php). Den
    // Lernenden selbst fragt niemand nach einem Recht — für alle anderen gilt
    // dieses UND der Umkreis: Schule und Lehrkraft ihre Schule, Eltern ihre
    // freigeschalteten Kinder. Ebene 1 bleibt trotz Admin-Spalte draussen;
    // das prüft pu_abschluss_darf_sehen() eigens.
    ['name' => 'urkunde.nachdrucken', 'gruppe' => 'Lernen, Prüfung & Fortschritt',
     'was' => 'Abschluss-Urkunden der eigenen Schüler oder Kinder erneut öffnen und drucken',
     'vorgabe' => ['admin' => 1, 'verwaltung' => 1, 'lehrer' => 1, 'eltern' => 1, 'schueler' => 0],
     'aktionen' => ['abschluss_liste']],

    ['name' => 'fortschritt.eigen', 'gruppe' => 'Lernen, Prüfung & Fortschritt',
     'was' => 'Den eigenen Lernstand sehen',
     'vorgabe' => ['admin' => 1, 'verwaltung' => 1, 'lehrer' => 1, 'eltern' => 1, 'schueler' => 1],
     'aktionen' => ['stand', 'kurs_stand']],

    // Tagesziel und Rückfrage vor einem Hinweis. Beides dreht an den Punkten:
    // Das Ziel legt fest, wofür man sich anstrengt, die Rückfrage schützt vor
    // dem versehentlichen Hinweis, der Punkte kostet. Für Schüler ab Werk AUS
    // (Entscheid des Betreibers 28.09.2026) — sie lernen mit der Vorgabe, bis
    // ein Erwachsener den Schalter hier umlegt. Keine Aktion: geprüft wird in
    // `einst_setzen` für die Schlüssel aus PU_EINST_PUNKTE.
    ['name' => 'lernen.selbst_regeln', 'gruppe' => 'Lernen, Prüfung & Fortschritt',
     'was' => 'Tagesziel und Rückfrage vor Hinweisen selbst einstellen',
     'vorgabe' => ['admin' => 1, 'verwaltung' => 1, 'lehrer' => 1, 'eltern' => 1, 'schueler' => 0],
     'aktionen' => []],

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
     // Wer den Schlüssel einträgt, zahlt: Verwaltung und Eltern. Einem Kind
     // geben es die Eltern über die Matrix, sonst gibt es keinen Tutor.
     'was' => 'Tutor-Modell und Zugangsschlüssel setzen (kostet Geld)',
     'vorgabe' => ['admin' => 1, 'verwaltung' => 1, 'lehrer' => 0, 'eltern' => 1, 'schueler' => 0],
     'aktionen' => ['geheimnis_setzen', 'tutor_probe', 'or_katalog']],

    ['name' => 'wartung.ausfuehren', 'gruppe' => 'Academy-Betrieb',
     'was' => 'Punkte neu rechnen, Protokolle leeren',
     'vorgabe' => ['admin' => 1, 'verwaltung' => 1, 'lehrer' => 0, 'eltern' => 1, 'schueler' => 0],
     'aktionen' => ['wartung']],

    /* Updates: die Notiz über „Abmelden“ sehen, eine neue Fassung laden,
       mit Neustart einspielen und zurücknehmen. Wer das darf, tauscht das
       Programm aller auf diesem Rechner — deshalb der Inhaber: Verwaltung
       bzw. Eltern (seit 28.09.2026, vorher nur Ebene 1). */
    ['name' => 'aktualisierung.verwalten', 'gruppe' => 'Academy-Betrieb',
     'was' => 'Updates sehen, laden, einspielen und zurücknehmen',
     'vorgabe' => ['admin' => 1, 'verwaltung' => 1, 'lehrer' => 0, 'eltern' => 1, 'schueler' => 0],
     'aktionen' => ['update_stand', 'update_suchen', 'update_laden', 'update_neustart',
                    'update_zurueck', 'update_ausblenden', 'update_einstellen', 'update_medien']],

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
     'aktionen' => ['cockpit', 'relay_zustand', 'relay_stand']],

    /* Die Installation beim Server registrieren: den Code aus der Zahlung
       gegen eine Bescheinigung tauschen. Dabei entsteht das Schlüsselpaar der
       Installation. Wer bezahlt hat, registriert — also Verwaltung und
       Eltern, nicht Lehrkräfte und nicht Lernende. */
    ['name' => 'registrierung.verwalten', 'gruppe' => 'Plan & Token',
     'was' => 'Die Academy mit dem Registrierungscode beim Server anmelden',
     'vorgabe' => ['admin' => 1, 'verwaltung' => 1, 'lehrer' => 0, 'eltern' => 1, 'schueler' => 0],
     'aktionen' => ['relay_registrieren']],

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

    // ------------------------------------------------------ Gemeinde
    //
    // Runde 3b des Cockpit-Plans. Sichtbar ist die Gemeinde nur, wenn diese
    // Academy registriert ist; hinaus gehen nur Pseudonym und Synonym. Wer
    // moderiert, sitzt im Cockpit des Betreibers — hier gibt es dafür kein Recht.
    ['name' => 'gemeinde.ansehen', 'gruppe' => 'Community',
     'was' => 'Werke der Community ansehen und herunterladen, die Community im Browser öffnen',
     'vorgabe' => ['admin' => 1, 'verwaltung' => 1, 'lehrer' => 1, 'eltern' => 1, 'schueler' => 1],
     'aktionen' => ['gemeinde_start', 'pii_regeln', 'gemeinde_werke', 'gemeinde_werk', 'gemeinde_bild', 'gemeinde_paket',
                    'gemeinde_talente', 'community_oeffnen']],

    ['name' => 'gemeinde.mitmachen', 'gruppe' => 'Community',
     'was' => 'Liken, kommentieren, melden (unter dem eigenen Synonym)',
     'vorgabe' => ['admin' => 1, 'verwaltung' => 1, 'lehrer' => 1, 'eltern' => 1, 'schueler' => 1],
     'aktionen' => ['gemeinde_synonym', 'gemeinde_like', 'gemeinde_kommentar', 'gemeinde_melden', 'gemeinde_talente_abholen']],

    /* Eigene Produkte (Prompts, Skills, Plugins) freischalten. Minderjährige
       brauchen dafür zusätzlich das Mit-Siegel (nächstes Recht) — das prüft
       die Academy und der Server, nicht dieser Schalter. */
    ['name' => 'gemeinde.veroeffentlichen', 'gruppe' => 'Community',
     'was' => 'Eigene Produkte in die Community geben',
     'vorgabe' => ['admin' => 1, 'verwaltung' => 1, 'lehrer' => 1, 'eltern' => 1, 'schueler' => 1],
     'aktionen' => ['produkte', 'produkt_anlegen', 'produkt_aendern', 'produkt_bild', 'produkt_loeschen',
                    'produkt_freischalten', 'produkt_zurueckziehen']],

    ['name' => 'gemeinde.siegel', 'gruppe' => 'Community',
     'was' => 'Die Veröffentlichung eines Minderjährigen gegenzeichnen (Mit-Siegel)',
     'vorgabe' => ['admin' => 1, 'verwaltung' => 1, 'lehrer' => 1, 'eltern' => 1, 'schueler' => 0],
     'aktionen' => ['produkt_siegeln']],

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
     // Für Schüler ab Werk AUS (Entscheid des Betreibers 28.09.2026): Ein
     // offenes Mikrofon bei einem Kind schalten Erwachsene zu, nicht das
     // Programm. Ohne dieses Recht erscheint das 🎤 weder beim Tutor noch im
     // Seitenchat (sprache_stand antwortet 403, der Knopf entfällt).
     'vorgabe' => ['admin' => 1, 'verwaltung' => 1, 'lehrer' => 1, 'eltern' => 1, 'schueler' => 0],
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
 *
 * Seit 28.09.2026 deckelt die Registrierung (PU_ARTEN): Ohne Bescheinigung
 * ist jeder Schüler, was immer in der Datenbank steht.
 */
function pu_ebene(?array $wer = null): string
{
    if ($wer === null) $wer = pu_wer();
    if ($wer === null) return '';

    $rolle = (string)($wer['rolle'] ?? '');
    $ebene = isset(PU_EBENEN[$rolle]) ? $rolle : match ($rolle) {
        'tutor'     => 'lehrer',
        'lernender' => 'schueler',
        default     => 'schueler',
    };
    return pu_ebene_gedeckelt($ebene);
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
function pu_recht_setzen(string $ebene, string $recht, bool $an, int $person,
                         ?array $wer = null): void
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
    pu_recht_setzen_darf($ebene, $recht, $wer);

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

/**
 * Darf `$wer` diesen Schalter umlegen? Ebene 1 darf alles; der Inhaber einer
 * Academy (Verwaltung, Eltern) nur mit drei Grenzen (28.09.2026):
 *
 *   · nur Rechte, die er selbst hat — sonst gäbe er einem Kind, was er
 *     selbst nicht darf, und holte es sich über das Kind zurück
 *   · nie die eigene Spalte — sonst gäbe er sich selbst alles
 *   · nur Ebenen, die es auf diesem Rechner geben kann (PU_ARTEN)
 *
 * Die Matrix selbst weiterzugeben, bleibt Ebene 1 vorbehalten.
 */
function pu_recht_setzen_darf(string $ebene, string $recht, ?array $wer = null): void
{
    // Ohne angemeldetes Konto ruft das Programm selbst (Tests, Werkzeuge auf
    // der Kommandozeile). Über api.php kommt man hier nie ohne Anmeldung an:
    // `recht_setzen` fordert vorher das Recht.
    if ($wer === null && pu_wer() === null) return;

    $meine = pu_ebene($wer);
    if ($meine === 'admin') return;

    if ($ebene === $meine) {
        throw new RuntimeException('Die eigene Spalte lässt sich nicht ändern — sonst gäbe man sich jedes Recht selbst.');
    }
    if ($recht === 'rechte.einstellungen') {
        throw new RuntimeException('Das Recht, Rechte zu verteilen, gibt nur Ebene 1 weiter.');
    }
    if (!pu_recht_hat($recht, $wer)) {
        throw new RuntimeException('Weitergeben lässt sich nur, was man selbst hat: ' . $recht);
    }
    if (!in_array($ebene, PU_ARTEN[pu_art()]['ebenen'] ?? [], true)) {
        throw new RuntimeException('Diese Ebene gibt es auf diesem Rechner nicht: ' . $ebene);
    }
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
function pu_rechte_ausgabe(bool $mitProtokoll = true): array
{
    $matrix  = pu_recht_matrix();
    $gruppen = [];
    $darfAendern = pu_recht_hat('rechte.einstellungen');

    // Welche Zelle `$wer` umlegen dürfte — dieselbe Prüfung wie beim Setzen,
    // damit die Oberfläche nichts anbietet, was hinterher abgewiesen wird.
    $aenderbar = static function (array $r, string $e) use ($darfAendern): bool {
        if (!$darfAendern || $e === 'admin' || !empty($r['nur_admin'])) return false;
        try {
            pu_recht_setzen_darf($e, $r['name']);
            return true;
        } catch (RuntimeException) {
            return false;
        }
    };

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
            'aenderbar' => array_map(
                fn($e) => $aenderbar($r, $e),
                array_combine(array_keys(PU_EBENEN), array_keys(PU_EBENEN))),
        ];
    }

    $abweichungen = (int)pu_db()->query('SELECT COUNT(*) FROM rechte_abweichung')->fetchColumn();

    $art = pu_art();
    $aus = [
        'ebenen'       => PU_EBENEN,
        'gruppen'      => $gruppen,
        'abweichungen' => $abweichungen,
        // Woher die Rolle kommt: die Art der Registrierung, welche Ebenen es
        // hier geben kann, und welche die eigene ist.
        'art'          => $art,
        'inhaber'      => pu_art_inhaber($art),
        'ebenen_hier'  => PU_ARTEN[$art]['ebenen'] ?? ['schueler'],
        'meine_ebene'  => pu_ebene(),
        'darf_aendern' => $darfAendern,
    ];
    if ($mitProtokoll) {
        $aus['audit'] = pu_recht_audit(12);
        $aus['kette'] = pu_recht_kette_pruefen();
    }
    return $aus;
}
