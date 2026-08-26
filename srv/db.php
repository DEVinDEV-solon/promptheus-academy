<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Datenbankschema.
 *
 * Idempotente Migrationen: pu_db_migrate() darf bei jedem Start laufen.
 * Der Stand steht in PRAGMA user_version.
 *
 * Wichtig: Diese Tabellen sind ein Index ueber den LERNSTAND, nicht der
 * Lehrstoff. Lektionen, Aufgaben und Prüfungen liegen als Notizen in
 * `brain/`. Löscht man promptheus.db, ist der komplette Lehrstoff da —
 * nur die Lernstände und Urkunden sind weg. Nie umgekehrt bauen.
 */

const PU_DB_VERSION = 8;

function pu_db_migrate(PDO $pdo): void
{
    $ist = (int)$pdo->query('PRAGMA user_version')->fetchColumn();
    if ($ist >= PU_DB_VERSION) return;

    if ($ist < 1) pu_db_v1($pdo);
    if ($ist < 2) pu_db_v2($pdo);
    if ($ist < 3) pu_db_v3($pdo);
    if ($ist < 4) pu_db_v4($pdo);
    if ($ist < 5) pu_db_v5($pdo);
    if ($ist < 6) pu_db_v6($pdo);
    if ($ist < 7) pu_db_v7($pdo);
    if ($ist < 8) pu_db_v8($pdo);

    $pdo->exec('PRAGMA user_version = ' . PU_DB_VERSION);
}

function pu_db_v1(PDO $pdo): void
{
    // ------------------------------------------------------------ Lernende
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS lernende (
            id             INTEGER PRIMARY KEY AUTOINCREMENT,
            kennung        TEXT NOT NULL UNIQUE,
            anzeigename    TEXT NOT NULL,
            rolle          TEXT NOT NULL DEFAULT 'schueler',
            kennwort_hash  TEXT NOT NULL,
            gruppe         TEXT NOT NULL DEFAULT '',
            angelegt       TEXT NOT NULL
        )
    ");

    // ------------------------------------------------------------ Versuche
    //
    // `antwort` steht im Klartext, weil ein Tutor sehen muss, WO jemand hängt
    // — nicht nur, dass er hängt. Genau deshalb ist data/ gitignored und
    // ueber HTTP mit 403 gesperrt.
    //
    // Mehrere Versuche je Aufgabe sind erlaubt und gewollt: Lernen ist
    // Wiederholung. Gezählt wird der beste Versuch (siehe srv/punkte.php).
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS versuche (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            lernender    INTEGER NOT NULL REFERENCES lernende(id) ON DELETE CASCADE,
            aufgabe_id   TEXT NOT NULL,
            stufe        INTEGER NOT NULL DEFAULT 0,
            typ          TEXT NOT NULL DEFAULT '',
            antwort      TEXT NOT NULL DEFAULT '',
            punkte       INTEGER NOT NULL DEFAULT 0,
            max_punkte   INTEGER NOT NULL DEFAULT 0,
            richtig      INTEGER NOT NULL DEFAULT 0,
            hinweise     INTEGER NOT NULL DEFAULT 0,
            loesung_ges  INTEGER NOT NULL DEFAULT 0,
            dauer_s      INTEGER NOT NULL DEFAULT 0,
            zeitpunkt    TEXT NOT NULL,
            tag          TEXT NOT NULL
        )
    ");
    $pdo->exec('CREATE INDEX IF NOT EXISTS ix_versuche_lernender ON versuche(lernender, aufgabe_id)');
    $pdo->exec('CREATE INDEX IF NOT EXISTS ix_versuche_tag ON versuche(lernender, tag)');

    // ------------------------------------------------------------ Fortschritt
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS fortschritt (
            lernender  INTEGER NOT NULL REFERENCES lernende(id) ON DELETE CASCADE,
            kurs       TEXT NOT NULL,
            lektion    TEXT NOT NULL,
            zustand    TEXT NOT NULL DEFAULT 'offen',
            geaendert  TEXT NOT NULL,
            PRIMARY KEY (lernender, kurs, lektion)
        )
    ");

    // ------------------------------------------------------------ Punkte
    //
    // Abgeleiteter Wert, absichtlich gespeichert: die Bestenliste und der
    // Titel werden auf jeder Seite gebraucht, und eine Summe ueber alle
    // Versuche jedes Mal neu zu rechnen wäre Arbeit ohne Ertrag.
    // pu_punkte_neu_rechnen() stellt ihn aus `versuche` wieder her — die
    // Versuche bleiben die Wahrheit.
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS punkte_konto (
            lernender  INTEGER PRIMARY KEY REFERENCES lernende(id) ON DELETE CASCADE,
            summe      INTEGER NOT NULL DEFAULT 0,
            titel      TEXT NOT NULL DEFAULT 'Funke',
            geaendert  TEXT NOT NULL
        )
    ");

    // ------------------------------------------------------------ Badges
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS badges (
            lernender    INTEGER NOT NULL REFERENCES lernende(id) ON DELETE CASCADE,
            badge        TEXT NOT NULL,
            verliehen_am TEXT NOT NULL,
            PRIMARY KEY (lernender, badge)
        )
    ");

    // ------------------------------------------------------------ Serie
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS streak (
            lernender  INTEGER PRIMARY KEY REFERENCES lernende(id) ON DELETE CASCADE,
            tage       INTEGER NOT NULL DEFAULT 0,
            letzter    TEXT NOT NULL DEFAULT '',
            bestwert   INTEGER NOT NULL DEFAULT 0
        )
    ");

    // ------------------------------------------------------------ Prüfungen
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS pruefungen (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            lernender  INTEGER NOT NULL REFERENCES lernende(id) ON DELETE CASCADE,
            stufe      INTEGER NOT NULL,
            punkte     INTEGER NOT NULL,
            max_punkte INTEGER NOT NULL,
            bestanden  INTEGER NOT NULL DEFAULT 0,
            zeitpunkt  TEXT NOT NULL
        )
    ");
    $pdo->exec('CREATE INDEX IF NOT EXISTS ix_pruefungen_lernender ON pruefungen(lernender, stufe)');

    // ------------------------------------------------------------ Urkunden
    //
    // `pruefcode` ist der oeffentliche Teil: ein Dritter darf ihn ohne
    // Anmeldung nachschlagen. Deshalb liefert die Nachschlag-Route Stufe,
    // Datum und Gültigkeit — aber KEINEN Namen. Sonst wäre die Codeliste
    // ein Namensverzeichnis der Lernenden.
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS urkunden (
            pruefcode  TEXT PRIMARY KEY,
            lernender  INTEGER NOT NULL REFERENCES lernende(id) ON DELETE CASCADE,
            stufe      INTEGER NOT NULL,
            punkte     INTEGER NOT NULL,
            ausgestellt TEXT NOT NULL,
            widerrufen TEXT NOT NULL DEFAULT ''
        )
    ");

    // ------------------------------------------------------------ Protokoll
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS protokoll (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            zeitpunkt   TEXT NOT NULL,
            lernender   INTEGER NULL,
            aktion      TEXT NOT NULL,
            gegenstand  TEXT NOT NULL DEFAULT '',
            notiz       TEXT NOT NULL DEFAULT ''
        )
    ");
    $pdo->exec('CREATE INDEX IF NOT EXISTS ix_protokoll_zeit ON protokoll(zeitpunkt)');

    // ------------------------------------------------------------ Einstellungen
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS einstellungen (
            schluessel TEXT PRIMARY KEY,
            wert       TEXT NOT NULL DEFAULT ''
        )
    ");
}

/**
 * v2 — persönliche Einstellungen und der Tagesbonus.
 *
 * Beide Tabellen kommen nachträglich, weil die Academy erst ohne sie lief. Das ist
 * der Regelfall und kein Versehen: `pu_db_migrate()` darf bei jedem Start
 * laufen, und eine bestehende data/promptheus.db mit Lernständen wird
 * ergänzt statt neu angelegt.
 */
function pu_db_v2(PDO $pdo): void
{
    // ------------------------------------------------------------ Einstellungen je Person
    //
    // Getrennt von `einstellungen`: dort stehen die Regeln der Academy, hier die
    // Vorlieben eines Menschen. In eine Tabelle geworfen, müsste jede Abfrage
    // zwischen "gilt für alle" und "gilt für mich" unterscheiden — und einmal
    // vergessen hiesse, dass die Schriftgröße eines Lernenden die Regeln der
    // Prüfung überschreibt.
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS person_einstellungen (
            lernender  INTEGER NOT NULL REFERENCES lernende(id) ON DELETE CASCADE,
            schluessel TEXT NOT NULL,
            wert       TEXT NOT NULL DEFAULT '',
            PRIMARY KEY (lernender, schluessel)
        )
    ");

    // ------------------------------------------------------------ Tages-Challenge
    //
    // Der Bonus steht hier und nicht in `versuche`, weil er kein Versuch ist:
    // er hängt am TAG, nicht an der Aufgabe. Der Primärschlüssel (lernender,
    // tag) ist die eigentliche Regel — einmal je Tag, und die Datenbank
    // sorgt dafür, nicht eine Prüfung im Code.
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS tagesbonus (
            lernender  INTEGER NOT NULL REFERENCES lernende(id) ON DELETE CASCADE,
            tag        TEXT NOT NULL,
            aufgabe_id TEXT NOT NULL DEFAULT '',
            punkte     INTEGER NOT NULL DEFAULT 0,
            zeitpunkt  TEXT NOT NULL,
            PRIMARY KEY (lernender, tag)
        )
    ");
}

/**
 * v3 — eine Spalte zurück auf ASCII.
 *
 * `fortschritt` und `punkte_konto` trugen zeitweise eine Spalte `geändert`.
 * Der Umlaut kam aus einer Aufräumrunde, die Fliesstext von `ae/oe/ue` auf
 * `äöü` gebracht hat und dabei über ein paar Zeichen zu weit ging: Spalten-
 * namen sind Bezeichner, kein Text.
 *
 * Der Schaden war still und deshalb bösartig. Eine Datenbank, die noch die
 * ASCII-Spalte hatte, beantwortete jedes `INSERT … geändert` mit
 * "no column named geändert" — der Lernfortschritt wurde nicht mehr
 * gespeichert, die Academy lief ansonsten weiter, und im Fenster war nichts zu
 * sehen. Nur data/logs/fehler.log wusste davon.
 *
 * Diese Migration räumt beide Richtungen auf: eine in der Zwischenzeit
 * angelegte Datenbank bekommt ihre Spalte umbenannt, eine ältere bleibt
 * unangetastet.
 */
function pu_db_v3(PDO $pdo): void
{
    foreach (['fortschritt', 'punkte_konto'] as $tabelle) {
        $spalten = [];
        foreach ($pdo->query("PRAGMA table_info($tabelle)") as $s) {
            $spalten[] = (string)$s['name'];
        }
        if ($spalten === []) continue;                       // Tabelle gibt es nicht

        if (in_array('geändert', $spalten, true) && !in_array('geaendert', $spalten, true)) {
            $pdo->exec("ALTER TABLE $tabelle RENAME COLUMN \"geändert\" TO geaendert");
        }
    }
}

/**
 * v4 — fünf Ebenen statt zwei Rollen.
 *
 * Bis hierher kannte die Academy `tutor` und `lernender`. Der
 * Login-Level-Rechte-Plan kennt fünf Ebenen, und die Rechte-Matrix in
 * `srv/rechte.php` rechnet mit ihnen. Diese Migration schreibt die alten
 * Namen um — einmal, nicht bei jedem Start:
 *
 *   lernender → schueler
 *   tutor     → lehrer
 *   und das **erste** Tutor-Konto → admin
 *
 * Warum das erste: es ist das Konto, das die Academy eingerichtet hat. Ohne
 * diesen Schritt gäbe es nach der Migration keinen Admin mehr, und die
 * Rechte-Matrix, die Wartung und der API-Schlüssel wären für niemanden
 * erreichbar — die Academy hätte sich beim Update selbst ausgesperrt.
 */
function pu_db_v4(PDO $pdo): void
{
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS rechte_abweichung (
            ebene    TEXT NOT NULL,
            recht    TEXT NOT NULL,
            erlaubt  INTEGER NOT NULL DEFAULT 0,
            PRIMARY KEY (ebene, recht)
        )
    ");

    // Append-only mit Hash-Kette: jeder Eintrag trägt den Hash seines
    // Vorgängers (siehe pu_recht_protokoll). Kein UPDATE, kein DELETE.
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS rechte_audit (
            nr      INTEGER PRIMARY KEY AUTOINCREMENT,
            zeit    TEXT NOT NULL,
            person  INTEGER NOT NULL DEFAULT 0,
            aktion  TEXT NOT NULL,
            ebene   TEXT NOT NULL DEFAULT '',
            recht   TEXT NOT NULL DEFAULT '',
            wert    INTEGER NOT NULL DEFAULT 0,
            vorher  TEXT NOT NULL DEFAULT '',
            hash    TEXT NOT NULL
        )
    ");

    // Gibt es die Kontentabelle noch nicht (frische Datenbank), ist hier
    // nichts umzuschreiben — pu_lernenden_anlegen() vergibt die Ebenen dann
    // von Anfang an richtig.
    $da = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name='lernende'")
              ->fetchColumn();
    if ($da === false) return;

    $erster = $pdo->query("SELECT id FROM lernende WHERE rolle = 'tutor' ORDER BY id ASC LIMIT 1")
                  ->fetchColumn();

    $pdo->exec("UPDATE lernende SET rolle = 'schueler' WHERE rolle = 'lernender'");
    $pdo->exec("UPDATE lernende SET rolle = 'lehrer'   WHERE rolle = 'tutor'");

    if ($erster !== false) {
        $st = $pdo->prepare("UPDATE lernende SET rolle = 'admin' WHERE id = ?");
        $st->execute([(int)$erster]);
    }
}

/**
 * v5 — wer da eigentlich lernt.
 *
 * Bis hierher wusste die Academy von einem Konto nur Kennung, Anzeigename und
 * Ebene. Damit lässt sich niemand ansprechen: ein Elfjähriger in Klasse 6
 * und eine Lehrerin brauchen nicht dieselbe Erklärung, und ein Tutor, der
 * beides gleich behandelt, ist für beide der falsche.
 *
 * Die Felder sind alle freiwillig. Ein leeres Alter heisst „nicht gesagt",
 * nicht „null Jahre" — und die Academy fragt dann eben allgemeiner.
 *
 *   pseudonym    Anzeigename nach aussen. Minderjährige bleiben pseudonym,
 *                so steht es in Login-Level-Rechte-Plan.md §4.
 *   lebensalter  Zahl. Heisst nicht `alter`, weil ALTER ein SQL-Wort ist.
 *   schule       Freitext; eigene Tabelle gibt es noch nicht.
 *   kind_von     Eltern → Kind. Ein Elternkonto sieht damit genau eines.
 *   sprachstil   einfach | normal | fachlich — überschreibt die Ableitung
 *                aus dem Alter, wenn jemand es anders will.
 *
 * Die Klasse steht weiterhin in `gruppe`: das Feld gibt es seit v1, es wird
 * in der Klassenübersicht angezeigt, und ein zweites Feld für dieselbe
 * Sache wäre die sichere Art, beide widersprüchlich zu füllen.
 */
function pu_db_v5(PDO $pdo): void
{
    $da = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name='lernende'")
              ->fetchColumn();
    if ($da === false) return;

    $spalten = [];
    foreach ($pdo->query('PRAGMA table_info(lernende)') as $s) $spalten[] = (string)$s['name'];

    $neu = [
        'pseudonym'   => "TEXT NOT NULL DEFAULT ''",
        'lebensalter' => 'INTEGER NOT NULL DEFAULT 0',
        'schule'      => "TEXT NOT NULL DEFAULT ''",
        'kind_von'    => 'INTEGER NOT NULL DEFAULT 0',
        'sprachstil'  => "TEXT NOT NULL DEFAULT ''",
        'notiz'       => "TEXT NOT NULL DEFAULT ''",
    ];

    foreach ($neu as $name => $art) {
        if (in_array($name, $spalten, true)) continue;
        $pdo->exec("ALTER TABLE lernende ADD COLUMN $name $art");
    }
}

/**
 * v6 — Zugangsplaene und das Token-Konto.
 *
 * Zwei Tabellen, und die zweite ist die wichtigere: `token_buchungen` ist ein
 * **Journal**, kein Kontostand. Der Stand ist die Summe der Buchungen und
 * steht nirgends gespeichert.
 *
 * Das ist dieselbe Entscheidung wie bei den Punkten: ein zweiter Ort, an dem
 * dieselbe Zahl steht, ist der Ort, an dem sie irgendwann abweicht — und bei
 * Geld faellt das erst auf, wenn jemand sich beschwert.
 *
 * `abos.traeger_art` sagt, WER zahlt:
 *   person  ein einzelnes Konto (Schueler- oder Familienplan)
 *   klasse  eine Lehrkraft fuer ihre Gruppe (bis 30 Schueler)
 *   schule  eine Einrichtung
 *
 * `bestaetigt` ist der Ersatz fuer einen Zahlungsdienst: gebucht wird
 * vorgemerkt, und erst Ebene 1 setzt den Haken. Solange das nicht passiert
 * ist, laeuft alles weiter — es steht nur ueberall dran.
 */
function pu_db_v6(PDO $pdo): void
{
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS abos (
            id               INTEGER PRIMARY KEY AUTOINCREMENT,
            traeger_art      TEXT NOT NULL DEFAULT 'person',
            traeger          INTEGER NOT NULL DEFAULT 0,
            traeger_name     TEXT NOT NULL DEFAULT '',
            plan             TEXT NOT NULL,
            start            TEXT NOT NULL,
            naechste_zahlung TEXT NOT NULL,
            laeuft           INTEGER NOT NULL DEFAULT 1,
            bestaetigt       INTEGER NOT NULL DEFAULT 0,
            notiz            TEXT NOT NULL DEFAULT '',
            angelegt_von     INTEGER NOT NULL DEFAULT 0,
            angelegt         TEXT NOT NULL
        )
    ");
    $pdo->exec('CREATE INDEX IF NOT EXISTS ix_abos_traeger ON abos(traeger_art, traeger, laeuft)');

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS token_buchungen (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            lernender   INTEGER NOT NULL DEFAULT 0,
            abo         INTEGER NOT NULL DEFAULT 0,
            art         TEXT NOT NULL,
            wofuer      TEXT NOT NULL DEFAULT '',
            tokens      INTEGER NOT NULL DEFAULT 0,
            cent        INTEGER NOT NULL DEFAULT 0,
            geschaetzt  INTEGER NOT NULL DEFAULT 0,
            verfaellt   TEXT NOT NULL DEFAULT '',
            modell      TEXT NOT NULL DEFAULT '',
            bestaetigt  INTEGER NOT NULL DEFAULT 1,
            zeitpunkt   TEXT NOT NULL,
            tag         TEXT NOT NULL
        )
    ");
    $pdo->exec('CREATE INDEX IF NOT EXISTS ix_token_wer ON token_buchungen(lernender, tag)');
    $pdo->exec('CREATE INDEX IF NOT EXISTS ix_token_abo ON token_buchungen(abo, art)');
}

/**
 * v7 — die Widerrufs-Zustimmung an der Buchung.
 *
 * Token sind **digitale Inhalte**: das Widerrufsrecht erlischt nach § 356
 * Abs. 5 BGB nur dann, wenn der Käufer zweierlei getan hat — ausdrücklich
 * verlangt, dass sofort begonnen wird, UND bestätigt, dass er damit das
 * Widerrufsrecht verliert. Wer das nicht nachweisen kann, hat es nicht.
 *
 * Deshalb steht der Nachweis **an der Buchung** und nicht im Protokoll: die
 * Zustimmung gehört zu genau diesem Kauf. Ein Protokolleintrag daneben wäre
 * eine zweite Wahrheit, die man später zusammensuchen müsste — und das ist der
 * Zustand, in dem man sie nicht findet.
 *
 * Leeres Feld heisst „nicht eingeholt", und dann ist das Widerrufsrecht da.
 * Das ist die richtige Vorgabe: es fehlt niemandem etwas, wenn es zu viel ist.
 */
function pu_db_v7(PDO $pdo): void
{
    $da = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name='token_buchungen'")
              ->fetchColumn();
    if ($da === false) return;

    $spalten = [];
    foreach ($pdo->query('PRAGMA table_info(token_buchungen)') as $s) $spalten[] = (string)$s['name'];

    if (!in_array('zustimmung', $spalten, true)) {
        $pdo->exec("ALTER TABLE token_buchungen ADD COLUMN zustimmung TEXT NOT NULL DEFAULT ''");
    }
}

/**
 * v8 — Trägernamen an Personenplänen aufräumen.
 *
 * Ein Schüler- oder Familienplan hängt am Konto und hat keinen anderen Träger.
 * Das Buchungsformular zeigte das Feld „Für wen" trotzdem immer an und bat
 * darunter, es leerzulassen — eine Bitte im Kleingedruckten ist keine Regel.
 * Wer eine Schule betreibt, trug sie ein, und im Cockpit stand dann
 * „für dieses Konto PROMPTHEUS GYMNASIUM": zwei Angaben, die einander
 * widersprechen.
 *
 * `pu_abo_buchen()` verwirft den Namen jetzt. Damit bleibt der Bestand — und
 * der wird hier bereinigt, denn eine Angabe, die nichts bedeutet, soll auch
 * nicht dastehen. Verloren geht nichts: **für Personenpläne wurde dieses Feld
 * nie ausgewertet**; die Zuordnung läuft über `traeger`, nicht über den Namen.
 */
function pu_db_v8(PDO $pdo): void
{
    $da = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name='abos'")
              ->fetchColumn();
    if ($da === false) return;

    $pdo->exec("UPDATE abos SET traeger_name = '' WHERE traeger_art = 'person' AND traeger_name <> ''");
}

// ---------------------------------------------------------------- Einstellungen
function pu_setting(string $schluessel, string $fallback = ''): string
{
    $st = pu_db()->prepare('SELECT wert FROM einstellungen WHERE schluessel = ?');
    $st->execute([$schluessel]);
    $w = $st->fetchColumn();
    return $w === false ? $fallback : (string)$w;
}

function pu_setting_setzen(string $schluessel, string $wert): void
{
    $st = pu_db()->prepare(
        'INSERT INTO einstellungen (schluessel, wert) VALUES (?, ?)
         ON CONFLICT(schluessel) DO UPDATE SET wert = excluded.wert'
    );
    $st->execute([$schluessel, $wert]);
}
