<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Einstellungen.
 *
 * Zwei Ebenen, streng getrennt:
 *
 *   **persönlich**  Darstellung und Lerngewohnheiten. Jeder Lernende stellt
 *                   sie für sich; sie ändern nie eine Punktzahl.
 *   **uniweit**     Regeln des Betriebs. Nur ein Tutor darf sie ändern, und
 *                   sie gelten ab dem nächsten Versuch — nie rückwirkend.
 *
 * Die Regel dahinter steht in PLAN.md, Abschnitt 1: eine Urkunde, die heute
 * anders zustande käme als gestern, ist wertlos. Deshalb rechnet
 * `pu_punkte_neu_rechnen()` aus den gespeicherten Versuchen und nicht aus den
 * heutigen Regeln — wer den Tempobonus abschaltet, nimmt niemandem Punkte weg,
 * die er gestern verdient hat.
 *
 * **Kein Schlüssel kommt vom Browser durch.** Was hier nicht in einer der
 * beiden Listen steht, wird abgewiesen. Sonst könnte ein Aufruf mit
 * `{"schluessel":"beliebig"}` die Tabelle zumüllen oder einen Wert setzen, den
 * der Code später blind liest.
 */

// ================================================================ Listen
/**
 * Persönliche Einstellungen: Vorgabe und erlaubte Werte.
 *
 * `werte` = feste Auswahl, `zahl` = [min, max]. Freitext gibt es hier
 * absichtlich nicht: von Lernenden wird nichts Unbegrenztes gespeichert.
 */
const PU_EINST_PERSON = [
    // -------- Darstellung
    'thema'          => ['vorgabe' => 'dunkel', 'werte' => ['auto', 'hell', 'dunkel']],
    'schriftgroesse' => ['vorgabe' => 'normal', 'werte' => ['klein', 'normal', 'gross', 'riesig']],
    'textschrift'    => ['vorgabe' => 'serif',  'werte' => ['serif', 'sans']],
    'kontrast'       => ['vorgabe' => 'normal', 'werte' => ['normal', 'hoch']],
    'bewegung'       => ['vorgabe' => 'normal', 'werte' => ['normal', 'wenig']],
    'breite'         => ['vorgabe' => 'normal', 'werte' => ['schmal', 'normal', 'breit']],

    // Welche Farbvariante. Greift nur, wenn die Academy-Regel
    // "farbvarianten" an ist — sonst gilt überall die Vorgabe. Die Paletten
    // stehen in srv/varianten.php; die Namen hier sind die Wache dagegen,
    // dass über die Schnittstelle eine erfundene Variante gesetzt wird.
    'variante'       => ['vorgabe' => 'schmiede',
                         'werte'  => ['schmiede','pergament','olymp','marmor','terrakotta','funkenflug']],

    // -------- Feineinstellung der Bilder
    //
    // Zwei Regler in Prozent, weil „wie stark ein Bild durchkommt" niemand aus
    // einer Palette ableiten kann: das hängt am Bildschirm, am Licht im Raum
    // und am Geschmack. Ein Wert, den man nur im CSS ändern kann, ist für
    // jeden ausser dem Entwickler nicht vorhanden.
    //
    // 100 heisst „wie in der Variante festgelegt", 0 heisst „gar nicht".
    // Prozent statt Faktoren, damit an einem Schieberegler eine Zahl steht,
    // die man laut vorlesen kann.
    'bild_anteil'    => ['vorgabe' => '100', 'zahl' => [0, 100]],
    'karten_anteil'  => ['vorgabe' => '100', 'zahl' => [0, 100]],

    // -------- Eigene Farben
    //
    // Sechs Felder: drei Akzente und drei Schriftstufen. **Nicht** die
    // Grundflächen — wer den Grund frei wählen darf, stellt irgendwann
    // Hellgrau auf Weiss und liest nichts mehr. Die Schrift dagegen muss
    // wählbar sein: welches Grau auf welchem Bildschirm noch lesbar ist,
    // entscheidet das Auge davor, nicht die Palette.
    //
    // Die Oberfläche rechnet dabei live mit und warnt, sobald eine Farbe
    // gegen ihre Fläche unter 4,5:1 fällt. Verboten wird nichts.
    //
    // Leer heisst: die Farbe der gewählten Variante gilt.
    'farbe_glut'     => ['vorgabe' => '', 'text' => '/^(#[0-9a-fA-F]{6})?$/'],
    'farbe_gold'     => ['vorgabe' => '', 'text' => '/^(#[0-9a-fA-F]{6})?$/'],
    'farbe_lapis'    => ['vorgabe' => '', 'text' => '/^(#[0-9a-fA-F]{6})?$/'],

    // Hier standen `farbe_titel`, `farbe_unter` und `farbe_text` — die drei
    // Schriftstufen einer Karte. Sie sind heraus: Eine im Dunkeln gewählte
    // Schriftfarbe steht nach dem Wechsel auf eine helle Palette hell auf
    // hell, und der Text ist weg. Begründung bei PU_EIGENE_FARBEN in
    // srv/varianten.php.
    //
    // Wer die Werte früher gesetzt hat, verliert nichts Sichtbares: Sie stehen
    // noch in der Datenbank, werden aber nicht mehr gelesen — `pu_einst_person`
    // nimmt nur Schlüssel an, die hier stehen.

    // -------- Lernen
    'medienspalte'   => ['vorgabe' => 'ja',     'werte' => ['ja', 'nein']],
    'hinweis_fragen' => ['vorgabe' => 'ja',     'werte' => ['ja', 'nein']],
    'zeit_anzeigen'  => ['vorgabe' => 'nein',   'werte' => ['ja', 'nein']],
    'athena_auto'    => ['vorgabe' => 'ja',     'werte' => ['ja', 'nein']],
    'infos_woerter'  => ['vorgabe' => '160',    'zahl'  => [60, 400]],
    'tagesziel'      => ['vorgabe' => '100',    'zahl'  => [0, 2000]],

    // -------- Lob
    'lob_popup'      => ['vorgabe' => 'ja',     'werte' => ['ja', 'nein']],
    'lob_dauer'      => ['vorgabe' => '6',      'zahl'  => [0, 60]],

    // -------- Die eigene Tutorstimme
    //
    // Dieselben acht Schlüssel gibt es unten in PU_EINST_GLOBAL noch einmal.
    // Das ist keine Doppelung aus Versehen, sondern zwei Ebenen mit
    // verschiedenen Aufgaben:
    //
    //   global   — was die Academy einstellt. Gilt für jeden, der nichts
    //              Eigenes gesetzt hat, und ist damit die Vorgabe des Hauses.
    //   persönlich — was ein Einzelner für sich davon abweichend will.
    //
    // Der Grund für die persönliche Ebene: Wie eine Stimme klingt, entscheidet
    // das Ohr davor. Der eine hört bei 100 % Tempo nicht mit, der andere
    // schläft bei 85 % ein. Das ist so wenig academyweit zu regeln wie die
    // Schriftgrösse — und die steht aus genau demselben Grund seit jeher hier.
    //
    // **Warum es nicht die Academy-Regel ersetzt:** Ein Lernender, der die
    // Regel selbst schreiben dürfte, änderte die Stimme für alle. Deshalb
    // schreibt die Oberfläche für gewöhnliche Nutzer hierher und nur die
    // Verwaltung in die Regel. Gelesen wird persönlich zuerst, Regel danach —
    // siehe `pu_stimme_fuer()` und `pu_stimme_klang()` in srv/stimme.php.
    //
    // Leer heisst überall: „nichts Eigenes, nimm die Academy-Vorgabe."
    // Der leere Wert MUSS deshalb durch das Muster kommen, sonst liesse sich
    // eine einmal gesetzte eigene Stimme nie wieder abwählen.
    'stimme_prometheus'  => ['vorgabe' => '', 'text' => '#^([A-Za-z0-9][A-Za-z0-9._-]{0,40})?$#'],
    'stimme_athena'      => ['vorgabe' => '', 'text' => '#^([A-Za-z0-9][A-Za-z0-9._-]{0,40})?$#'],
    'stimme_hermes'      => ['vorgabe' => '', 'text' => '#^([A-Za-z0-9][A-Za-z0-9._-]{0,40})?$#'],
    'stimme_hephaistos'  => ['vorgabe' => '', 'text' => '#^([A-Za-z0-9][A-Za-z0-9._-]{0,40})?$#'],

    'klang_prometheus'   => ['vorgabe' => '', 'text' => '#^(-?\d{1,3}(,-?\d{1,3}){3})?$#'],
    'klang_athena'       => ['vorgabe' => '', 'text' => '#^(-?\d{1,3}(,-?\d{1,3}){3})?$#'],
    'klang_hermes'       => ['vorgabe' => '', 'text' => '#^(-?\d{1,3}(,-?\d{1,3}){3})?$#'],
    'klang_hephaistos'   => ['vorgabe' => '', 'text' => '#^(-?\d{1,3}(,-?\d{1,3}){3})?$#'],
];

/**
 * Uniweite Einstellungen. Nur Tutoren.
 *
 * `text` ist hier erlaubt, aber eng geführt: der Modellname geht als Argument
 * an einen Unterprozess. Deshalb steht ein Muster daneben, statt den Wert
 * durchzureichen.
 */
const PU_EINST_GLOBAL = [
    // -------- Punkte und Prüfung
    'tempobonus'        => ['vorgabe' => 'an', 'werte' => ['an', 'aus']],
    'tempobonus_deckel' => ['vorgabe' => '20', 'zahl'  => [0, 50]],
    'tagesbonus'        => ['vorgabe' => '25', 'zahl'  => [0, 200]],
    'hinweise_erlaubt'  => ['vorgabe' => 'an', 'werte' => ['an', 'aus']],
    'loesung_erlaubt'   => ['vorgabe' => 'an', 'werte' => ['an', 'aus']],
    'mischen'           => ['vorgabe' => 'an', 'werte' => ['an', 'aus']],
    'tagesaufgabe'      => ['vorgabe' => 'an', 'werte' => ['an', 'aus']],

    // -------- Werkzeuge
    'tokenicer'         => ['vorgabe' => 'an', 'werte' => ['an', 'aus']],
    'medien'            => ['vorgabe' => 'an', 'werte' => ['an', 'aus']],

    // Farbvarianten. Ab Werk AUS: die Academy hat eine Handschrift, und sechs
    // Paletten zur Wahl schwächen sie. Wer sie braucht — weil eine Klasse
    // lieber bunt lernt oder ein Bildschirm im Sonnenlicht steht —, schaltet
    // sie hier zu, und dann erscheint der Wähler im Kopf.
    'farbvarianten'     => ['vorgabe' => 'aus', 'werte' => ['an', 'aus']],

    // -------- Tutoren
    'tutor_an'          => ['vorgabe' => 'an', 'werte' => ['an', 'aus']],

    // Spracheingabe. Ab Werk AN, weil die Erkennung auf diesem Rechner läuft
    // und die Aufnahme ihn nicht verlässt (srv/sprache.php). Wäre sie ein
    // Dienst im Netz, stünde hier 'aus'.
    'spracheingabe'     => ['vorgabe' => 'an', 'werte' => ['an', 'aus']],

    // -------- Sprachausgabe (Vorlesen)
    //
    // Ab Werk **aus**, und das ist der Unterschied zur Eingabe eine Zeile
    // höher: Die Erkennung läuft auf diesem Rechner, das Vorlesen läuft über
    // OpenRouter. Was vorgelesen werden soll, geht also an einen fremden
    // Dienst — und es kostet je Tonsekunde. Beides gehört eingeschaltet, nicht
    // vorgefunden.
    'stimme_an'         => ['vorgabe' => 'aus', 'werte' => ['an', 'aus']],

    // Derselbe Prüfausdruck wie bei `or_modell`: Es muss jeder Modellname
    // eintragbar sein, auch einer, den es heute noch nicht gibt.
    'stimme_modell'     => ['vorgabe' => '',   'text'  => '#^[A-Za-z0-9][A-Za-z0-9._:/-]{0,80}$#'],

    // Auch die Stimme ist frei eintragbar, und das war eine Korrektur: „alloy",
    // „nova" und die anderen sind die Namen von OpenAI. Ein anderer Anbieter
    // wie x-ai hat eigene — mit einer festen Liste wäre er hier unbenutzbar
    // gewesen, ohne dass die Meldung das gesagt hätte. Geprüft wird die Form,
    // nicht der Inhalt; ob es die Stimme gibt, sagt der Probelauf. Leer = alloy.
    'stimme_name'       => ['vorgabe' => '',   'text'  => '#^[A-Za-z0-9][A-Za-z0-9._-]{0,40}$#'],

    /* **Eine Stimme je Tutor.** Vier Tutoren mit einer Stimme sind kein Chor,
       sondern ein Fehler: Prometheus, Hermes und Hephaistos sind Männer,
       Athena ist eine Frau.

       Sie stehen einzeln hier und nicht als Zuordnung im Quelltext, damit man
       sie auf der Oberfläche umstellen kann. Eine Regel „Prometheus klingt wie
       rex" wäre beim nächsten Modellwechsel falsch — und nur von jemandem zu
       ändern, der PHP schreibt. Leer heisst: die allgemeine Stimme. */
    /* Die Reglerstellung je Tutor: vier Zahlen in einer Zeile
       (`Tempo,Tiefe,Klarheit,Lautstärke`), siehe PU_STIMM_REGLER in
       srv/stimme.php. Vier Einträge je Tutor wären sechzehn Zeilen für vier
       Regler — eine Tabelle, in der man nichts mehr findet. Und sie gehören
       zusammen: Wer eine Stimme justiert, verstellt selten nur eine davon. */
    'klang_prometheus'  => ['vorgabe' => '', 'text' => '#^-?\d{1,3}(,-?\d{1,3}){3}$#'],
    'klang_athena'      => ['vorgabe' => '', 'text' => '#^-?\d{1,3}(,-?\d{1,3}){3}$#'],
    'klang_hermes'      => ['vorgabe' => '', 'text' => '#^-?\d{1,3}(,-?\d{1,3}){3}$#'],
    'klang_hephaistos'  => ['vorgabe' => '', 'text' => '#^-?\d{1,3}(,-?\d{1,3}){3}$#'],

    'stimme_prometheus' => ['vorgabe' => '',   'text'  => '#^[A-Za-z0-9][A-Za-z0-9._-]{0,40}$#'],
    'stimme_athena'     => ['vorgabe' => '',   'text'  => '#^[A-Za-z0-9][A-Za-z0-9._-]{0,40}$#'],
    'stimme_hermes'     => ['vorgabe' => '',   'text'  => '#^[A-Za-z0-9][A-Za-z0-9._-]{0,40}$#'],
    'stimme_hephaistos' => ['vorgabe' => '',   'text'  => '#^[A-Za-z0-9][A-Za-z0-9._-]{0,40}$#'],

    // **Zwei Formate, weil mehr nirgends funktionieren.** Am 23.08.2026
    // gemessen: Weg 1 (chat/completions) nimmt im Strom nur pcm16 — mp3 endet
    // in „Provider returned error". Weg 2 (audio/speech) nimmt nur mp3 und
    // pcm. `opus` und `wav` gehen auf keinem von beiden; sie standen hier und
    // sind geflogen. Eine Auswahl anzubieten, die überall scheitert, ist keine
    // Freiheit, sondern eine Falle.
    'stimme_format'     => ['vorgabe' => 'pcm16', 'werte' => ['pcm16', 'mp3']],

    /* Jede erzeugte Sprachausgabe wird zusätzlich in `data/voice/<kennung>`
       aufbewahrt — lesbar benannt, mit dem Text als .txt daneben.

       Ab Werk **an**, weil das der Zweck ist: nachhören, weitergeben,
       nachvollziehen, was ein Konto sich hat vorlesen lassen. Wer den Platz
       braucht, schaltet es ab — eine Minute Ton als WAV sind rund 3 MB, und
       das summiert sich in einer Klasse schneller, als man denkt. Der
       Zwischenspeicher bleibt davon unberührt; er spart Geld und ist nach 30
       Tagen ohnehin weg. */
    'stimme_archiv'     => ['vorgabe' => 'an', 'werte' => ['an', 'aus']],

    // Welcher der beiden Endpunkte. `auto` schlägt im Katalog nach und wechselt
    // im Zweifel einmal — siehe srv/stimme.php. Von Hand setzt man das nur,
    // wenn ein Modell im Katalog falsch gemeldet ist.
    'stimme_weg'        => ['vorgabe' => 'auto', 'werte' => ['auto', 'chat', 'tts']],

    // Was passiert, wenn das Tokenkonto leer ist — und zwar WANN, nicht OB.
    //
    // Ab Werk `aus`: Bei null wird nicht sofort gesperrt, sondern der
    // Minus-Rahmen trägt noch eine Lektion weit (srv/abo.php,
    // PU_MINUS_RAHMEN). Ein Kind, dem mitten in der Aufgabe der Tutor
    // abgeschaltet wird, weil die Schule nicht nachgebucht hat, lernt die
    // falsche Lektion.
    //
    // `an` heisst: schon bei null Schluss, ohne Rahmen. Für eine Einrichtung,
    // die keine Überziehung will, egal wie klein.
    //
    // **Beide Wege enden im Stopp.** Es gibt keine Stellung, in der die Kosten
    // eines Lernenden unbegrenzt weiterlaufen — die gab es früher, und genau
    // das war der Fehler.
    //
    // Die einzige Ausnahme ist Ebene 1 (`pu_token_frei()`): Der Betreiber
    // bezahlt die Rechnung selbst und baut damit die Academy. Für ihn greift
    // weder der Rahmen noch dieser Schalter.
    'token_sperre'      => ['vorgabe' => 'aus', 'werte' => ['an', 'aus']],
    'tutor_weg'         => ['vorgabe' => 'auto', 'werte' => ['auto', 'cli', 'openrouter']],
    'or_modell'         => ['vorgabe' => '',   'text'  => '#^[A-Za-z0-9][A-Za-z0-9._:/-]{0,80}$#'],
    'agent_prometheus'  => ['vorgabe' => 'an', 'werte' => ['an', 'aus']],
    'agent_athena'      => ['vorgabe' => 'an', 'werte' => ['an', 'aus']],
    'agent_hermes'      => ['vorgabe' => 'an', 'werte' => ['an', 'aus']],
    'agent_hephaistos'  => ['vorgabe' => 'an', 'werte' => ['an', 'aus']],
    'athena_anmerkung'  => ['vorgabe' => 'an', 'werte' => ['an', 'aus']],
    'weitere_infos'     => ['vorgabe' => 'an', 'werte' => ['an', 'aus']],
    'tutor_modell'      => ['vorgabe' => '',   'text'  => '/^[A-Za-z0-9][A-Za-z0-9._:-]{0,60}$/'],
    'tutor_zeitgrenze'  => ['vorgabe' => '90', 'zahl'  => [15, 300]],
];

// ================================================================ Prüfung
/**
 * Prüft einen Wert gegen seine Beschreibung.
 *
 * @return string der bereinigte Wert
 * @throws RuntimeException wenn er nicht passt
 */
function pu_einst_pruefen(array $bes, string $schluessel, string $wert): string
{
    $wert = trim($wert);

    if (isset($bes['werte'])) {
        if (!in_array($wert, $bes['werte'], true)) {
            throw new RuntimeException("Unerlaubter Wert für $schluessel.");
        }
        return $wert;
    }

    if (isset($bes['zahl'])) {
        if (!preg_match('/^-?\d{1,6}$/', $wert)) {
            throw new RuntimeException("$schluessel braucht eine Zahl.");
        }
        [$min, $max] = $bes['zahl'];
        $n = (int)$wert;
        if ($n < $min || $n > $max) {
            throw new RuntimeException("$schluessel muss zwischen $min und $max liegen.");
        }
        return (string)$n;
    }

    if (isset($bes['text'])) {
        if ($wert !== '' && !preg_match($bes['text'], $wert)) {
            throw new RuntimeException("$schluessel hat eine unerlaubte Schreibweise.");
        }
        return $wert;
    }

    throw new RuntimeException("Unbeschriebene Einstellung: $schluessel");
}

/** Marke, die die Zwischenspeicher nach jedem Schreiben ungültig macht. */
function pu_einst_frisch(): void
{
    $GLOBALS['pu_einst_stand'] = ($GLOBALS['pu_einst_stand'] ?? 0) + 1;
}

// ================================================================ persönlich
/** Alle persönlichen Einstellungen eines Lernenden, mit Vorgaben aufgefüllt. */
function pu_einst_person(int $lernender): array
{
    static $zwischen = [];
    static $stand    = -1;

    $jetzt = (int)($GLOBALS['pu_einst_stand'] ?? 0);
    if ($stand !== $jetzt) { $zwischen = []; $stand = $jetzt; }
    if (isset($zwischen[$lernender])) return $zwischen[$lernender];

    $aus = [];
    foreach (PU_EINST_PERSON as $k => $b) $aus[$k] = (string)$b['vorgabe'];

    $st = pu_db()->prepare('SELECT schluessel, wert FROM person_einstellungen WHERE lernender = ?');
    $st->execute([$lernender]);
    foreach ($st->fetchAll() as $r) {
        $k = (string)$r['schluessel'];
        if (isset(PU_EINST_PERSON[$k])) $aus[$k] = (string)$r['wert'];
    }

    return $zwischen[$lernender] = $aus;
}

/** Ein einzelner persönlicher Wert. */
function pu_einst(int $lernender, string $schluessel): string
{
    return pu_einst_person($lernender)[$schluessel] ?? '';
}

function pu_einst_person_setzen(int $lernender, string $schluessel, string $wert): string
{
    if (!isset(PU_EINST_PERSON[$schluessel])) {
        throw new RuntimeException('Unbekannte Einstellung: ' . $schluessel);
    }
    $wert = pu_einst_pruefen(PU_EINST_PERSON[$schluessel], $schluessel, $wert);

    $st = pu_db()->prepare(
        'INSERT INTO person_einstellungen (lernender, schluessel, wert) VALUES (?,?,?)
         ON CONFLICT(lernender, schluessel) DO UPDATE SET wert = excluded.wert'
    );
    $st->execute([$lernender, $schluessel, $wert]);
    pu_einst_frisch();
    return $wert;
}

// ================================================================ uniweit
function pu_einst_global(): array
{
    $aus = [];
    foreach (PU_EINST_GLOBAL as $k => $b) $aus[$k] = (string)$b['vorgabe'];

    foreach (pu_db()->query('SELECT schluessel, wert FROM einstellungen')->fetchAll() as $r) {
        $k = (string)$r['schluessel'];
        if (isset(PU_EINST_GLOBAL[$k])) $aus[$k] = (string)$r['wert'];
    }
    return $aus;
}

/** Ein uniweiter Wert. Gilt sofort — aber nur für kommende Versuche. */
function pu_regel(string $schluessel): string
{
    static $alle  = null;
    static $stand = -1;

    $jetzt = (int)($GLOBALS['pu_einst_stand'] ?? 0);
    if ($alle === null || $stand !== $jetzt) { $alle = pu_einst_global(); $stand = $jetzt; }

    return $alle[$schluessel] ?? (string)(PU_EINST_GLOBAL[$schluessel]['vorgabe'] ?? '');
}

/** Kurzform für die Schalter. */
function pu_regel_an(string $schluessel): bool
{
    return pu_regel($schluessel) === 'an';
}

function pu_einst_global_setzen(string $schluessel, string $wert): string
{
    if (!isset(PU_EINST_GLOBAL[$schluessel])) {
        throw new RuntimeException('Unbekannte Einstellung: ' . $schluessel);
    }
    $wert = pu_einst_pruefen(PU_EINST_GLOBAL[$schluessel], $schluessel, $wert);
    pu_setting_setzen($schluessel, $wert);
    pu_einst_frisch();
    return $wert;
}

// ================================================================ .env
/**
 * Schreibt EINEN Schlüssel in die .env, ohne den Rest anzufassen.
 *
 * Kommentare und Reihenfolge bleiben stehen: die Datei ist auch Dokumentation,
 * und ein Programm, das sie beim Speichern glattbügelt, nimmt dem nächsten
 * Leser die Begründungen weg.
 *
 * Nur Schlüssel aus dieser Liste. Die .env ist keine Ablage für beliebige
 * Werte aus dem Browser.
 */
const PU_ENV_SCHREIBBAR = ['CLAUDE_CODE_OAUTH_TOKEN', 'PU_CLAUDE_BIN', 'PU_OPENROUTER_API_KEY'];

function pu_env_setzen(string $name, string $wert): void
{
    if (!in_array($name, PU_ENV_SCHREIBBAR, true)) {
        throw new RuntimeException('Dieser Schlüssel darf nicht gesetzt werden.');
    }
    // Ein Zeilenumbruch im Wert erzeugte eine zweite Zuweisung.
    if (preg_match('/[\r\n]/', $wert)) {
        throw new RuntimeException('Der Wert darf keinen Zeilenumbruch enthalten.');
    }

    $datei  = PU_ENV_DATEI;
    $alt    = is_file($datei) ? (string)file_get_contents($datei) : '';
    $zeilen = $alt === '' ? [] : (preg_split('/\r?\n/', $alt) ?: []);

    $neu       = $name . '=' . $wert;
    $getroffen = false;
    foreach ($zeilen as $i => $z) {
        if (preg_match('/^\s*' . preg_quote($name, '/') . '\s*=/', $z)) {
            $zeilen[$i] = $neu;
            $getroffen  = true;
            break;
        }
    }
    if (!$getroffen) $zeilen[] = $neu;

    if (!pu_write_file($datei, rtrim(implode("\n", $zeilen), "\n") . "\n")) {
        throw new RuntimeException('Die .env liess sich nicht schreiben.');
    }
    @chmod($datei, 0600);
}

/**
 * Was über ein Geheimnis nach aussen darf: ob es da ist. Sonst nichts.
 *
 * Kein Anfang, kein Ende, kein Ausschnitt — ein Ausschnitt eines Tokens ist
 * bereits ein Ausschnitt eines Tokens. Die Zeichenzahl steht dabei, weil sie
 * beim Erkennen eines abgeschnittenen Einfügens hilft und für sich genommen
 * nichts verrät.
 */
function pu_geheimnis_stand(string $name): array
{
    $w = pu_env($name, '');
    return ['gesetzt' => $w !== '', 'zeichen' => strlen($w)];
}

// ================================================================ Wartung
/**
 * Zahlen über den Betrieb — für den Reiter „Wartung".
 *
 * Alles davon liesse sich auch auf der Kommandozeile herausfinden. Genau
 * deshalb steht es hier: ein Tutor an einer Schule hat keine Kommandozeile,
 * und ohne diese Zahlen merkt niemand, dass seit drei Wochen niemand mehr
 * geübt hat oder dass der Lehrstoff einen Fehler trägt.
 */
function pu_uni_stand(): array
{
    require_once PU_ROOT . '/srv/kurse.php';

    $pdo   = pu_db();
    $zahl  = fn(string $sql): int => (int)$pdo->query($sql)->fetchColumn();
    $index = pu_index();

    return [
        'konten'      => $zahl('SELECT COUNT(*) FROM lernende'),
        'versuche'    => $zahl('SELECT COUNT(*) FROM versuche'),
        'pruefungen'  => $zahl('SELECT COUNT(*) FROM pruefungen'),
        'urkunden'    => $zahl("SELECT COUNT(*) FROM urkunden WHERE widerrufen = ''"),
        'letzter_tag' => (string)($pdo->query('SELECT MAX(tag) FROM versuche')->fetchColumn() ?: ''),
        'kurse'       => count($index['kurse']),
        'aufgaben'    => count($index['aufgaben']),
        'stoff_fehler'=> $index['fehler'],
        'db_bytes'    => is_file(PU_DB) ? (int)filesize(PU_DB) : 0,
        'db_version'  => (int)$pdo->query('PRAGMA user_version')->fetchColumn(),
    ];
}

/**
 * Die Wartungsarbeiten.
 *
 * Nur solche, die sich WIEDERHOLEN lassen, ohne Schaden anzurichten: Punkte
 * und Abzeichen werden aus den Versuchen neu abgeleitet, der Lehrstoff wird
 * gelesen, das Protokoll wird gezeigt. Nichts hier löscht etwas — Löschen
 * gehört nicht hinter einen Knopf, den man beim Stöbern findet.
 */
function pu_wartung(string $was, int $durch): array
{
    require_once PU_ROOT . '/srv/punkte.php';
    require_once PU_ROOT . '/srv/badges.php';
    require_once PU_ROOT . '/srv/kurse.php';

    switch ($was) {
        case 'punkte_neu': {
            $ids = pu_db()->query('SELECT id FROM lernende')->fetchAll(PDO::FETCH_COLUMN);
            foreach ($ids as $id) pu_punkte_neu_rechnen((int)$id);
            pu_protokoll($durch, 'wartung', 'punkte_neu', count($ids) . ' Konten');
            return ['getan' => count($ids) . ' Konten neu gerechnet.'];
        }

        case 'badges_neu': {
            $ids   = pu_db()->query('SELECT id FROM lernende')->fetchAll(PDO::FETCH_COLUMN);
            $summe = 0;
            foreach ($ids as $id) $summe += count(pu_badges_pruefen((int)$id));
            pu_protokoll($durch, 'wartung', 'badges_neu', $summe . ' neu');
            return ['getan' => $summe . ' Abzeichen nachträglich verliehen.'];
        }

        case 'stoff': {
            $index = pu_index(true);
            return ['getan' => sprintf('%d Kurse, %d Aufgaben, %d Fehler.',
                        count($index['kurse']), count($index['aufgaben']), count($index['fehler'])),
                    'fehler' => $index['fehler']];
        }

        case 'protokoll': {
            $rows = pu_db()->query(
                'SELECT p.zeitpunkt, p.aktion, p.gegenstand, p.notiz,
                        COALESCE(l.anzeigename, "—") AS wer
                 FROM protokoll p LEFT JOIN lernende l ON l.id = p.lernender
                 ORDER BY p.id DESC LIMIT 80'
            )->fetchAll();
            return ['protokoll' => $rows];
        }

        /* **Veraltete Pseudonyme ablegen.**
         *
         * Ein Pseudonym ist der Name, unter dem jemand nach aussen auftritt —
         * auch gegenüber den Tutoren, damit der Klarname diesen Rechner nicht
         * verlässt. Wird ein Konto aber umbenannt, gehört das alte Pseudonym
         * zu jemandem, den es nicht mehr gibt: „Hallo, Daidalos" zu jemandem,
         * der Alpay heisst.
         *
         * Beim Umbenennen wird es seither abgelegt (api.php, `name_aendern`).
         * Für Konten, die vorher umbenannt wurden, gibt es diesen Knopf — und
         * er ist ein Knopf und kein Automatismus: Wer sich sein Pseudonym
         * selbst ausgesucht hat, soll es nicht bei einer Wartung verlieren,
         * ohne dass jemand das entschieden hat.
         *
         * Danach greift der Rückfall in `pu_profil()`: Angesprochen wird mit
         * dem Namen aus den Einstellungen.
         */
        case 'pseudonyme': {
            $st = pu_db()->query("SELECT COUNT(*) FROM lernende WHERE pseudonym <> ''");
            $wieviele = (int)$st->fetchColumn();

            pu_db()->exec("UPDATE lernende SET pseudonym = '' WHERE pseudonym <> ''");
            pu_protokoll($durch, 'wartung', 'pseudonyme', $wieviele . ' abgelegt');

            return ['getan' => $wieviele === 0
                ? 'Es war kein Pseudonym gesetzt — alle werden bereits mit ihrem Namen angesprochen.'
                : $wieviele . ' Pseudonym(e) abgelegt. Angesprochen wird jetzt mit dem Namen '
                  . 'aus den Einstellungen. Wer wieder eines will, trägt es im Profil ein.'];
        }

        case 'stand':
            return ['uni' => pu_uni_stand()];
    }

    throw new RuntimeException('Unbekannte Wartungsarbeit.');
}
