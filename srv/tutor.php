<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Die vier Tutor-Agenten.
 *
 * Prometheus erklärt, Athena kommentiert, Hermes findet, Hephaistos hilft bei
 * Code. Alle vier sprechen ueber denselben Weg nach draussen — wahlweise die
 * Claude-CLI (wie ADVOCAT) oder OpenRouter mit dem Schlüssel aus der .env.
 * Welcher, entscheidet `pu_tutor_weg()`; alles darüber weiss davon nichts.
 *
 * **Was der Tutor NICHT tut: Punkte vergeben.** Athena schreibt eine Anmerkung
 * unter eine bewertete Freitextantwort; die Punktzahl steht zu diesem Zeitpunkt
 * schon fest und wird nicht mehr angefasst. Der Grund steht in PLAN.md,
 * Abschnitt 4: ein Modell, das heute 55 und morgen 70 Punkte gibt, macht jede
 * Prüfungsordnung wertlos.
 *
 * **Fällt die CLI aus, bleibt die Academy benutzbar.** Jede Funktion hier gibt bei
 * einem Fehler eine leere Antwort mit Begründung zurueck und wirft nicht. Ein
 * Lernender, der eine Aufgabe lösen will, darf nicht daran scheitern, dass ein
 * Sprachmodell gerade nicht erreichbar ist.
 */

require_once __DIR__ . '/einstellungen.php';

/**
 * Ist ein Tutor-Modell eingerichtet UND eingeschaltet?
 *
 * Nach aussen geht nur dieser Boolean — nie ein Pfad, nie ein Schlüssel. Ein
 * Tutor kann die Agenten uniweit abschalten (Einstellungen › Tutor-KI);
 * dann ist die Academy sofort wieder rein deterministisch.
 */
function pu_tutor_bereit(): bool
{
    if (!pu_regel_an('tutor_an')) return false;
    return pu_tutor_weg() !== '';
}

/**
 * Welcher Weg zum Sprachmodell?
 *
 * Es gibt zwei, und sie schliessen einander nicht aus:
 *
 *   `cli`         die Claude-CLI als Unterprozess. Läuft über das Abo des
 *                 Rechners, kostet keine API-Abrechnung, braucht aber eine
 *                 eingerichtete CLI — auf einem Schulrechner selten.
 *   `openrouter`  ein HTTPS-Aufruf mit dem Schlüssel aus `PU_OPENROUTER_API_KEY`.
 *                 Braucht nichts ausser dem Schlüssel und läuft überall.
 *
 * `auto` (die Vorgabe) nimmt OpenRouter, wenn ein Schlüssel hinterlegt ist,
 * sonst die CLI. Diese Reihenfolge ist Absicht: wer den Schlüssel einträgt,
 * hat sich für ihn entschieden.
 *
 * @return string 'cli' | 'openrouter' | '' (nichts eingerichtet)
 */
function pu_tutor_weg(): string
{
    $wunsch = pu_regel('tutor_weg');

    if ($wunsch === 'cli')        return pu_claude_bin()   !== '' ? 'cli' : '';
    if ($wunsch === 'openrouter') return pu_or_schluessel() !== '' ? 'openrouter' : '';

    if (pu_or_schluessel() !== '') return 'openrouter';
    if (pu_claude_bin()    !== '') return 'cli';
    return '';
}

/** Ist dieser eine Agent freigegeben? */
function pu_agent_frei(string $agent): bool
{
    $schluessel = 'agent_' . strtolower(trim($agent));
    if (!isset(PU_EINST_GLOBAL[$schluessel])) return false;
    return pu_regel_an($schluessel);
}

/**
 * Das Modell für die Tutoren.
 *
 * Vorrang hat die Einstellung in der Oberfläche, dann die .env, dann die
 * Vorgabe. So kann ein Tutor das Modell wechseln, ohne eine Datei zu
 * bearbeiten — und wer die .env pflegt, behält seinen Weg.
 *
 * Die beiden Wege haben getrennte Modellnamen, weil sie verschiedene
 * Namensräume haben: die CLI kennt `claude-sonnet-5`, OpenRouter kennt
 * `anthropic/claude-sonnet-4.5`. Ein gemeinsames Feld führte verlässlich
 * dazu, dass nach einem Wechsel des Weges ein unbekanntes Modell dasteht.
 */
function pu_tutor_modell(): string
{
    if (pu_tutor_weg() === 'openrouter') return pu_or_modell();

    $gesetzt = pu_regel('tutor_modell');
    if ($gesetzt !== '') return $gesetzt;
    return pu_env('PU_MODELL', 'claude-sonnet-5');
}

// ================================================================ OpenRouter
/**
 * Der Schlüssel. Er wird gelesen und NIE zurückgegeben.
 *
 * Nach aussen geht ausschliesslich `pu_geheimnis_stand()` — "gesetzt: ja"
 * plus Zeichenzahl. Kein Anfang, kein Ende: ein Ausschnitt eines Schlüssels
 * ist ein Ausschnitt eines Schlüssels.
 */
function pu_or_schluessel(): string
{
    return trim(pu_env('PU_OPENROUTER_API_KEY', ''));
}

/** Das Modell für den OpenRouter-Weg. */
function pu_or_modell(): string
{
    $gesetzt = pu_regel('or_modell');
    if ($gesetzt !== '') return $gesetzt;
    return pu_env('PU_OPENROUTER_MODELL', 'anthropic/claude-sonnet-4.5');
}

/**
 * Sucht eine Wurzelzertifikatsliste.
 *
 * Der Grund, warum diese Funktion existiert: die PHP-Installation aus dem
 * Windows-Paketverwalter bringt KEINE mit. `curl.cainfo` ist leer, und jeder
 * HTTPS-Aufruf endet mit "unable to get local issuer certificate". Gemessen,
 * nicht vermutet — der erste Aufruf gegen OpenRouter scheiterte genau daran.
 *
 * Die naheliegende Abkürzung wäre, die Prüfung abzuschalten. Das kommt nicht
 * in Frage: über diese Verbindung geht ein API-Schlüssel, und eine
 * ungeprüfte TLS-Verbindung kann jeder im selben Netz mitlesen. Stattdessen
 * wird eine Liste gesucht, die auf diesem Rechner ohnehin liegt.
 *
 * Reihenfolge: erst die .env (wer es genau wissen will), dann die
 * PHP-Einstellungen, dann die üblichen Orte. Findet sich nichts, wird nichts
 * gesetzt — dann entscheidet curl wie bisher, und die Fehlermeldung sagt,
 * was fehlt.
 */
function pu_ca_bundle(): string
{
    static $pfad = null;
    if ($pfad !== null) return $pfad;

    $kandidaten = array_filter([
        pu_env('PU_CA_BUNDLE', ''),
        (string)ini_get('curl.cainfo'),
        (string)ini_get('openssl.cafile'),
        'C:/Program Files/Git/mingw64/etc/ssl/certs/ca-bundle.crt',
        'C:/Program Files/Git/mingw64/ssl/certs/ca-bundle.crt',
        'C:/Windows/System32/curl-ca-bundle.crt',
        '/etc/ssl/certs/ca-certificates.crt',
        '/etc/pki/tls/certs/ca-bundle.crt',
    ]);

    foreach ($kandidaten as $k) {
        if ($k !== '' && is_file($k)) return $pfad = $k;
    }
    return $pfad = '';
}

/**
 * Fragt ein Modell über OpenRouter.
 *
 * Bewusst schmal gehalten: eine Nachricht, eine Antwort, kein Verlauf, keine
 * Werkzeuge. Die Academy braucht nichts davon — sie stellt einem Tutor eine Frage
 * mit einem Kontext und bekommt Text zurück.
 *
 * Fehler werfen nicht, sondern kommen als `['ok' => false, 'fehler' => …]`
 * zurück. Ein Lernender, der eine Aufgabe lösen will, darf nicht daran
 * scheitern, dass gerade kein Netz da ist.
 *
 * @return array{ok: bool, text: string, fehler: string, dauer: float}
 */
function pu_or_lauf(string $prompt, string $systemtext, int $limit = 0, int $maxTokens = 0,
                    string $modell = ''): array
{
    $schluessel = pu_or_schluessel();
    if ($schluessel === '') {
        return ['ok' => false, 'text' => '', 'dauer' => 0.0,
                'fehler' => 'Es ist kein OpenRouter-Schlüssel hinterlegt.'];
    }
    if ($limit <= 0) $limit = max(15, (int)pu_regel('tutor_zeitgrenze'));

    $start = microtime(true);

    // Wie viel Platz die Antwort bekommt.
    //
    // 1200 reicht für eine Tutorantwort — bis ein denkendes Modell davor
    // 1000 Token lang überlegt. Dann ist der Platz weg, bevor die Antwort
    // anfängt, und es kommt gar nichts. Gemessen an deepseek-v4-flash beim
    // Schreiben der Sprechertexte: zwei von vier scheiterten so.
    //
    // Wer eine lange oder formstrenge Antwort erwartet, gibt deshalb mehr mit.
    // `$modell` überschreibt die Einstellung, ohne sie zu ändern. Das ist für
    // den Probelauf da: Ein Modell aus dem Katalog soll sich ausprobieren
    // lassen, BEVOR es übernommen wird — sonst müsste man das bisherige
    // überschreiben und wüsste beim Fehlschlag nicht mehr, was dort stand.
    $rumpf = json_encode([
        'model'       => $modell !== '' ? $modell : pu_or_modell(),
        'max_tokens'  => $maxTokens > 0 ? max(300, min(8000, $maxTokens)) : 1200,
        'temperature' => 0.4,
        'messages'    => [
            ['role' => 'system', 'content' => $systemtext],
            ['role' => 'user',   'content' => $prompt],
        ],
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    $ch = curl_init('https://openrouter.ai/api/v1/chat/completions');

    // Die Zertifikatsliste wird gesetzt, wenn eine gefunden wurde. Ohne sie
    // bleibt es bei der Vorgabe von curl — geprüft wird in jedem Fall.
    $ca = pu_ca_bundle();
    if ($ca !== '') curl_setopt($ch, CURLOPT_CAINFO, $ca);

    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $rumpf,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => $limit,
        CURLOPT_CONNECTTIMEOUT => 15,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
        CURLOPT_HTTPHEADER     => [
            'Authorization: Bearer ' . $schluessel,
            'Content-Type: application/json',
            // OpenRouter bittet um diese beiden Angaben. Sie nennen das
            // Programm, nicht den Rechner und nicht den Lernenden.
            'HTTP-Referer: https://promptheus.local',
            'X-Title: PROMPTHEUS',
        ],
    ]);

    $antwort = curl_exec($ch);
    $code    = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $fehler  = curl_error($ch);
    curl_close($ch);

    $dauer = round(microtime(true) - $start, 1);

    if ($antwort === false) {
        // Bei einem Zertifikatsfehler steht die Ursache nicht in der
        // curl-Meldung, sondern in dem, was curl NICHT hatte: eine Liste der
        // Aussteller. Deshalb sagt die Antwort hier, welche Liste benutzt
        // wurde — oder dass keine gefunden wurde. Ohne diesen Zusatz ist
        // "unable to get local issuer certificate" eine Suchaufgabe.
        $zusatz = '';
        if (stripos($fehler, 'certificate') !== false || stripos($fehler, 'SSL') !== false) {
            $ca = pu_ca_bundle();
            $zusatz = $ca === ''
                ? ' — Auf diesem Rechner wurde keine Liste vertrauenswürdiger Zertifikate'
                  . ' gefunden. Trage den Pfad zu einer ca-bundle.crt als PU_CA_BUNDLE in'
                  . ' die .env ein (Git bringt eine mit).'
                : ' — Benutzt wurde ' . $ca . '. Passt die Liste nicht, setze PU_CA_BUNDLE'
                  . ' in der .env auf eine andere.';
        }

        return ['ok' => false, 'text' => '', 'dauer' => $dauer,
                'fehler' => 'OpenRouter war nicht erreichbar: ' . $fehler . $zusatz];
    }

    $j = json_decode((string)$antwort, true);

    if ($code >= 400) {
        // Die Meldung von OpenRouter geht mit hinaus, der Schlüssel nie: sie
        // trägt den Grund ("no credits", "invalid model"), und ohne ihn sucht
        // ein Tutor im Falschen.
        $grund = is_array($j) ? (string)($j['error']['message'] ?? '') : '';
        return ['ok' => false, 'text' => '', 'dauer' => $dauer,
                'fehler' => 'OpenRouter meldet ' . $code . ($grund !== '' ? ': ' . $grund : '.')];
    }

    // Wo die Antwort steht — und wann sie keine ist.
    //
    // `content` ist der Normalfall. Denkende Modelle legen ihre Ausgabe
    // manchmal in `reasoning` ab und lassen `content` leer — gemessen an
    // deepseek-v4-flash. Dafür gibt es den Rückfall.
    //
    // **Der Rückfall gilt aber nur, wenn das Modell fertig geworden ist.**
    // Bricht es mit `finish_reason = length` ab, steht in `reasoning` kein
    // Ergebnis, sondern ein abgeschnittener Denkprozess — und der ist als
    // Antwort schlimmer als gar nichts. Gemessen beim Schreiben der
    // Sprechertexte: statt 200 Wörtern kamen 658 Wörter Selbstgespräch
    // („Der Nutzer möchte…", „Ich interpretiere…"), sauber ins Archiv
    // geschrieben. Genau davor schützt diese Unterscheidung.
    $wahl  = is_array($j) ? ($j['choices'][0] ?? []) : [];
    $ende  = (string)($wahl['finish_reason'] ?? $wahl['native_finish_reason'] ?? '');
    $abbruch = ($ende === 'length');

    $text        = '';
    $ausGedanken = false;

    $inhalt = $wahl['message']['content'] ?? $wahl['text'] ?? null;
    if (is_string($inhalt) && trim($inhalt) !== '') {
        $text = trim($inhalt);
    } elseif (!$abbruch) {
        foreach ([$wahl['message']['reasoning'] ?? null,
                  $wahl['message']['reasoning_content'] ?? null] as $kandidat) {
            if (is_string($kandidat) && trim($kandidat) !== '') {
                $text        = trim($kandidat);
                $ausGedanken = true;
                break;
            }
        }
    }

    // Steuertoken heraus, bevor irgendetwas damit passiert — auch bevor auf
    // „leer" geprüft wird: eine Antwort, die nur aus einem Steuertoken besteht,
    // ist keine Antwort, sondern ein Fehlschlag.
    $text = pu_modell_saeubern($text);

    if ($text === '') {
        return ['ok' => false, 'text' => '', 'dauer' => $dauer,
                'fehler' => $abbruch
                    ? 'Das Modell ' . pu_or_modell() . ' hat so lange nachgedacht, dass '
                    . 'für die Antwort kein Platz mehr war. Ein kürzerer Auftrag oder ein '
                    . 'Modell ohne Denkschritt hilft.'
                    : 'Das Modell ' . pu_or_modell() . ' hat nichts geantwortet'
                    . ($ende !== '' ? ' (Abbruchgrund: ' . $ende . ')' : '')
                    . '. Ein anderes Modell in den Einstellungen hilft meist.'];
    }

    // Was der Aufruf gekostet hat — gemessen, nicht geschätzt.
    //
    // OpenRouter meldet die tatsächlich abgerechneten Token in `usage`. Genau
    // die gehören ins Token-Cockpit; eine eigene Schätzung mit dem Tokenicer
    // wäre nah dran, aber eben nicht die Zahl, die auf der Rechnung steht.
    // Fehlt `usage` (manche Anbieter lassen es weg), bleibt es bei 0 und das
    // Cockpit sagt „nicht gemeldet" statt eine Zahl zu erfinden.
    $u = is_array($j) ? ($j['usage'] ?? []) : [];

    return ['ok' => true, 'text' => $text, 'fehler' => '', 'dauer' => $dauer,
            // Kam der Text aus dem Denkbereich statt aus der Antwort? Wer
            // etwas Formstrenges will (einen Sprechertext etwa), weist ihn
            // dann besser ab.
            'aus_gedanken' => $ausGedanken,
            'modell'  => (string)($j['model'] ?? pu_or_modell()),
            'token_ein'  => (int)($u['prompt_tokens'] ?? 0),
            'token_aus'  => (int)($u['completion_tokens'] ?? 0),
            'token'      => (int)($u['total_tokens'] ??
                            ((int)($u['prompt_tokens'] ?? 0) + (int)($u['completion_tokens'] ?? 0)))];
}

/**
 * Steuertoken aus einer Modellantwort entfernen.
 *
 * Ein Sprachmodell trennt seine Rollen mit Sondertoken. Normalerweise
 * schneidet der Anbieter sie ab; manche tun es nicht, und dann steht am Ende
 * der Antwort `<｜end▁of▁sentence｜>` im Fenster — gesehen bei DeepSeek über
 * OpenRouter. Für einen Lernenden ist das kein Hinweis, sondern Kauderwelsch.
 *
 * **Zwei Strengegrade, und der Unterschied ist wichtig:**
 *
 * Die DeepSeek-Form benutzt Sonderzeichen (`｜` U+FF5C, `▁` U+2581), die in
 * deutschem Fliesstext nicht vorkommen. Die wird überall entfernt.
 *
 * Die geschweiften Formen (`<|im_end|>`, `<|endoftext|>`) werden **nur am
 * Rand** entfernt. Denn diese Academy unterrichtet Tokenisierung: eine Lektion
 * darf `<|endoftext|>` mitten im Satz erklären, und ein Tutor, der darüber
 * spricht, ebenso. Was das Modell versehentlich anhängt, steht immer am Anfang
 * oder am Ende — was es erklärt, steht mittendrin. Diese Unterscheidung kostet
 * eine Zeile mehr und rettet den Kurs, um den es hier geht.
 */
function pu_modell_saeubern(string $text): string
{
    // 1. Die Sonderzeichen-Form: immer und überall.
    $text = (string)preg_replace('/<\x{FF5C}[^>]{0,40}\x{FF5C}>/u', '', $text);

    // 2. Die geschweifte Form und `</s>`: nur am Rand, in Schleife, weil
    //    manche Modelle zwei davon hintereinander anhängen.
    $rand = '/^\s*(?:<\|[a-z0-9_]{1,30}\|>|<\/s>)|(?:<\|[a-z0-9_]{1,30}\|>|<\/s>)\s*$/i';
    for ($i = 0; $i < 4; $i++) {
        $neu = (string)preg_replace($rand, '', $text);
        if ($neu === $text) break;
        $text = $neu;
    }

    return trim($text);
}

/**
 * Der eine Weg nach draussen — egal welcher.
 *
 * Alles oberhalb (die vier Agenten, Athenas Anmerkung, die Vertiefung) ruft
 * NUR diese Funktion. Dadurch gibt es genau eine Stelle, an der entschieden
 * wird, wohin die Frage geht; ein zweiter Aufrufpfad wäre die Stelle, an der
 * eine Abschaltung später nicht greift.
 */
function pu_modell_lauf(string $prompt, string $systemtext, int $limit = 0, int $maxTokens = 0): array
{
    // PHP bricht eine Anfrage nach 30 Sekunden ab — im eingebauten Server die
    // Vorgabe. Ein Tutor darf laut Einstellung aber bis zu 300 Sekunden
    // brauchen. Ohne diese Zeile endet jede längere Antwort als leere Seite
    // mit "Maximum execution time exceeded" im Serverprotokoll, während das
    // Fenster nur "Der Server hat kein JSON geantwortet" zeigt. Gemessen an
    // einer Vertiefung, die nach 47 Sekunden abgeschnitten wurde.
    //
    // Angehoben wird nur für diesen einen Aufruf und mit Zuschlag: die
    // Zeitgrenze soll der Tutor-Code durchsetzen, nicht PHP — der kann
    // aufräumen und eine verständliche Meldung zurückgeben.
    $grenze = $limit > 0 ? $limit : max(15, (int)pu_regel('tutor_zeitgrenze'));
    @set_time_limit($grenze + 15);

    return match (pu_tutor_weg()) {
        'openrouter' => pu_or_lauf($prompt, $systemtext, $limit, $maxTokens),
        'cli'        => pu_cli_lauf($prompt, $systemtext, $limit),
        default      => ['ok' => false, 'text' => '', 'dauer' => 0.0,
                         'fehler' => 'Es ist kein Tutor-Modell eingerichtet. '
                                   . 'Alle Kurse, Aufgaben und Prüfungen laufen trotzdem.'],
    };
}

/** Sucht die Claude-CLI. Leerstring, wenn es sie nicht gibt. */
function pu_claude_bin(): string
{
    static $bin = null;
    if ($bin !== null) return $bin;

    $gesetzt = pu_env('PU_CLAUDE_BIN', '');
    if ($gesetzt !== '' && is_file($gesetzt)) return $bin = $gesetzt;

    // Windows und POSIX in einem Durchgang.
    foreach (['claude.cmd', 'claude.exe', 'claude'] as $name) {
        foreach (explode(PATH_SEPARATOR, (string)getenv('PATH')) as $ordner) {
            $ordner = trim($ordner);
            if ($ordner === '') continue;
            $kandidat = rtrim(str_replace('\\', '/', $ordner), '/') . '/' . $name;
            if (is_file($kandidat)) return $bin = $kandidat;
        }
    }
    return $bin = '';
}

/**
 * Umgebung für den Unterprozess.
 *
 * `PATH` muss drin sein, sonst findet der Starter die CLI nicht. Und die drei
 * ANTHROPIC-Variablen müssen DRAUSSEN sein, damit die CLI ueber das Abo läuft
 * und nicht ueber die API abrechnet. Das ist Absicht, nicht Aufräumen.
 */
function pu_cli_umgebung(): array
{
    $env = getenv();
    if (!is_array($env)) $env = [];

    foreach (['ANTHROPIC_API_KEY', 'ANTHROPIC_AUTH_TOKEN', 'ANTHROPIC_BASE_URL'] as $weg) {
        unset($env[$weg]);
    }

    $token = pu_env('CLAUDE_CODE_OAUTH_TOKEN', '');
    if ($token !== '') $env['CLAUDE_CODE_OAUTH_TOKEN'] = $token;

    return array_filter($env, 'is_string');
}

/**
 * Ruft die CLI auf.
 *
 * Ein-/Ausgabe ueber DATEIEN statt Rohre: unter Windows sind Rohre mit
 * proc_open nicht verlässlich zu bedienen — dieselbe Erfahrung, die ADVOCAT
 * schon gemacht hat. Argumente als Feld, damit PHP das Programm unmittelbar
 * startet und nicht ueber cmd.exe.
 *
 * @return array{ok: bool, text: string, fehler: string, dauer: float}
 */
function pu_cli_lauf(string $prompt, string $systemtext, int $limit = 0): array
{
    if ($limit <= 0) $limit = max(15, (int)pu_regel('tutor_zeitgrenze'));

    $bin = pu_claude_bin();
    if ($bin === '') {
        return ['ok' => false, 'text' => '', 'dauer' => 0.0,
                'fehler' => 'Die Claude-CLI wurde nicht gefunden. Der Tutor bleibt stumm; alles andere läuft weiter.'];
    }

    pu_ensure_dirs();
    $marke = bin2hex(random_bytes(6));
    $dIn   = PU_TMP . "/cli_$marke.in";
    $dOut  = PU_TMP . "/cli_$marke.out";
    $dErr  = PU_TMP . "/cli_$marke.err";
    $dSys  = PU_TMP . "/cli_$marke.sys";

    file_put_contents($dIn, $prompt);
    file_put_contents($dSys, $systemtext);

    $args = [$bin, '-p', '--output-format', 'json',
             '--model', pu_tutor_modell(),
             '--append-system-prompt-file', $dSys];

    $rohre = [0 => ['file', $dIn, 'r'], 1 => ['file', $dOut, 'w'], 2 => ['file', $dErr, 'w']];
    $start = microtime(true);

    // Ein leeres Arbeitsverzeichnis: die CLI soll den Vault NICHT als
    // Arbeitsordner sehen. Sonst könnte sie eine Musterlösung lesen und in
    // einen Hinweis schreiben — und niemandem fällt es auf.
    $leer = PU_TMP . '/leer';
    if (!is_dir($leer)) @mkdir($leer, 0775, true);

    $p = @proc_open($args, $rohre, $pipes, $leer, pu_cli_umgebung());
    if (!is_resource($p)) {
        pu_cli_aufraeumen([$dIn, $dOut, $dErr, $dSys]);
        return ['ok' => false, 'text' => '', 'dauer' => 0.0,
                'fehler' => 'Die Claude-CLI liess sich nicht starten.'];
    }

    $ende = microtime(true) + $limit;
    while (microtime(true) < $ende) {
        $s = proc_get_status($p);
        if (!$s['running']) break;
        usleep(200000);
    }
    $s = proc_get_status($p);
    if ($s['running']) { @proc_terminate($p, 9); @proc_close($p); $abbruch = true; }
    else               { @proc_close($p); $abbruch = false; }

    $aus  = (string)@file_get_contents($dOut);
    $fehl = (string)@file_get_contents($dErr);
    pu_cli_aufraeumen([$dIn, $dOut, $dErr, $dSys]);

    if ($abbruch) {
        return ['ok' => false, 'text' => '', 'dauer' => round(microtime(true) - $start, 1),
                'fehler' => "Der Tutor hat nach $limit Sekunden nicht geantwortet."];
    }

    $j    = json_decode($aus, true);
    $text = is_array($j) ? trim((string)($j['result'] ?? $j['text'] ?? '')) : trim($aus);
    // Auch hier: Steuertoken heraus, bevor „leer" geprüft wird. Der CLI-Weg
    // leckt sie zwar nicht, aber die Prüfung gehört an beide Ausgänge —
    // sonst ist sie beim nächsten Modellwechsel an einem davon vergessen.
    $text = pu_modell_saeubern($text);
    if ($text === '') {
        return ['ok' => false, 'text' => '', 'dauer' => round(microtime(true) - $start, 1),
                'fehler' => 'Der Tutor hat nichts geantwortet. ' . mb_substr(trim($fehl), 0, 200)];
    }

    return ['ok' => true, 'text' => $text, 'fehler' => '', 'dauer' => round(microtime(true) - $start, 1)];
}

function pu_cli_aufraeumen(array $dateien): void
{
    foreach ($dateien as $d) @unlink($d);
}

/** Lädt den Systemprompt eines Agenten. */
function pu_agent_prompt(string $agent): string
{
    $datei = PU_PROMPTS . '/' . pu_slug($agent) . '.md';
    if (!is_file($datei)) return '';
    $fm = pu_frontmatter((string)file_get_contents($datei));
    return $fm['rumpf'] !== '' ? $fm['rumpf'] : (string)file_get_contents($datei);
}

/**
 * Fragt einen Agenten.
 *
 * @param string $agent      prometheus|athena|hermes|hephaistos
 * @param string $frage      die Frage des Lernenden
 * @param array  $kontext    ['lektion' => Text, 'quelle' => Text, 'aufgabe' => Titel]
 * @param bool   $mit_loesung darf die Lösung im Kontext stehen? Nur NACH der Abgabe.
 */
/**
 * Der Zusatz für den Weg-Modus.
 *
 * Steht als Konstante hier und nicht in `prompts/`, weil er keine
 * Geschmacksfrage ist: Wer ihn ändert, ändert, ob die Academy Aufgaben verrät.
 */
const PU_WEG_REGEL = <<<'TEXT'


## Zusatzregel für diese Antwort — wichtiger als alles andere

Der Lernende sitzt gerade AN dieser Aufgabe und hat sie noch nicht gelöst.

**Nenne die Lösung nicht.** Nicht direkt, nicht umschrieben, nicht "nur als
Beispiel", nicht am Ende als Kontrolle. Auch dann nicht, wenn er ausdrücklich
darum bittet — dann sag freundlich, dass die Aufgabe ihm gehört.

Zeige stattdessen den **Weg**:
- Welche Frage stellt man sich hier zuerst?
- Woran erkennt man, dass eine Überlegung in die falsche Richtung geht?
- Welche Stelle in der Lektion gehört zu dieser Aufgabe?

Bei Auswahlfragen: erkläre, **wie man Möglichkeiten ausschliesst** — welche
Eigenschaft eine Antwort haben müsste, damit sie stimmen kann, und woran man
sieht, dass eine nicht passt. Sage nie, welche übrig bleibt.

Wenn er schon einen eigenen Gedanken hat, geh darauf ein: sag, ob die
Richtung trägt, ohne das Ziel zu nennen.
TEXT;

function pu_tutor_fragen(int $lernender, string $agent, string $frage, array $kontext = [], bool $mit_loesung = false, bool $weg_modus = false, array $zusatz = []): array
{
    $agent = strtolower(trim($agent));
    if (!in_array($agent, ['prometheus', 'athena', 'hermes', 'hephaistos'], true)) {
        return ['ok' => false, 'text' => '', 'fehler' => 'Unbekannter Agent.'];
    }
    if (!pu_tutor_bereit()) {
        return ['ok' => false, 'text' => '', 'fehler' => 'Die Tutoren sind abgeschaltet.'];
    }
    if (!pu_agent_frei($agent)) {
        return ['ok' => false, 'text' => '', 'fehler' => 'Dieser Tutor ist gerade nicht im Dienst.'];
    }

    // ------------------------------------------------------------------ Das Tor
    //
    // **Vor dem Modellaufruf, nicht danach.** Hier laufen alle vier Agenten
    // zusammen, dazu Athenas Anmerkung, die Vertiefung und das Glossar — dieselbe
    // Stelle, an der weiter unten gebucht wird. Eine Grenze, die erst nach dem
    // Aufruf greift, hat den Aufruf schon bezahlt.
    //
    // `stopp` statt `fehler`: die Oberfläche soll kein rotes Fehlerfeld zeigen,
    // sondern das Schild mit den beiden Wegen. Ein leeres Konto ist keine Panne.
    require_once PU_ROOT . '/srv/abo.php';
    $tor = pu_token_tor($lernender);
    if (!$tor['offen']) {
        return ['ok' => false, 'text' => '', 'stopp' => $tor['meldung'],
                'fehler' => $tor['meldung']['titel']];
    }

    // Der Systemtext ist geschichtet: SOUL (Haltung) + AGENTS (gemeinsame
    // Regeln) + der eigene Prompt des Tutors + wer da gerade fragt. Die
    // letzte Schicht macht aus derselben Frage eine andere Antwort — für ein
    // Kind in Klasse 6 eine andere als für die Lehrerin, die dieselbe
    // Lektion vorbereitet. Siehe srv/profil.php.
    require_once PU_ROOT . '/srv/profil.php';
    require_once PU_ROOT . '/srv/persona.php';
    // `pu_profil_wirksam` statt `pu_profil`: Nimmt Ebene 1 gerade eine Persona
    // ein, formt sich die Antwort nach ihr. Ohne Persona ist es dasselbe
    // Profil wie vorher — die Zeile ändert für Lernende nichts.
    $system = pu_systemtext($agent, pu_profil_wirksam($lernender));

    // **Der Lernende sitzt noch an der Aufgabe.** Die Lösung steht ohnehin
    // nicht im Prompt — sie wird von pu_aufgabe_oeffentlich() herausgesiebt,
    // bevor irgendetwas hinausgeht. Diese Regel sorgt für das Zweite: dass
    // der Tutor nicht auch noch rät und dabei zufällig richtig liegt.
    if ($weg_modus) {
        $system .= PU_WEG_REGEL;
    }

    // Zusatzregeln für diesen einen Aufruf. Das Glossar schickt hierüber die
    // Form der Antwort mit — Absätze oder Beitragsformat, mit Emoji oder ohne.
    // Sie gehören in den Systemtext und nicht in die Frage: Was der Lernende
    // im Fenster liest, soll seine Frage sein und keine Formatanweisung.
    if (($zusatz['regeln'] ?? '') !== '') {
        $system .= (string)$zusatz['regeln'];
    }

    // Der Kontext ist die offene Lektion und die genannte Quelle — nie der
    // ganze Vault. Und die Lösung erst nach der Abgabe: sonst wäre der
    // freundlichste Weg zur Antwort, den Tutor danach zu fragen.
    $teile = [];
    // Der Kurs steht zuerst: er ist der weiteste Rahmen, und ohne ihn ist
    // „dieser Kurs" in der Frage des Lernenden ein Wort ohne Gegenstand.
    if (($kontext['kurs']    ?? '') !== '') $teile[] = "## Kurs\n" . mb_substr((string)$kontext['kurs'], 0, 4000);
    if (($kontext['aufgabe'] ?? '') !== '') $teile[] = "## Aufgabe\n" . $kontext['aufgabe'];
    if (($kontext['lektion'] ?? '') !== '') $teile[] = "## Lektion\n" . mb_substr((string)$kontext['lektion'], 0, 6000);
    if (($kontext['quelle']  ?? '') !== '') $teile[] = "## Quelle\n"  . mb_substr((string)$kontext['quelle'], 0, 4000);
    if ($mit_loesung && ($kontext['loesung'] ?? '') !== '') {
        $teile[] = "## Musterlösung (der Lernende hat bereits abgegeben)\n" . $kontext['loesung'];
    }
    $teile[] = "## Frage des Lernenden\n" . mb_substr($frage, 0, 4000);

    $prompt = implode("

", $teile);
    $erg    = pu_modell_lauf($prompt, $system);

    pu_protokoll($lernender, 'tutor', $agent,
        sprintf('%s, %.1fs', $erg['ok'] ? 'geantwortet' : 'Fehler', $erg['dauer'] ?? 0));

    // ------------------------------------------------------------- Verbrauch
    //
    // **Die einzige Stelle, an der gebucht wird.** Hier laufen alle vier
    // Agenten zusammen, dazu Athenas Anmerkung und die Vertiefung — ein
    // zweiter Buchungspunkt wäre der, den man später vergisst.
    //
    // Nur bei einer Antwort. Ein Fehlschlag kostet kein Guthaben; wer nichts
    // bekommen hat, soll nichts bezahlen.
    if ($erg['ok']) {
        require_once PU_ROOT . '/srv/abo.php';
        pu_token_verbrauchen($lernender, (string)($zusatz['wofuer'] ?? '') ?: ('Tutor · ' . $agent),
                             ...pu_verbrauch_messen($prompt, $system, $erg));
    }

    return $erg;
}

/**
 * Wie viele Token hat dieser Aufruf gekostet — und wie sicher ist die Zahl?
 *
 * Über OpenRouter kommt sie mit der Antwort zurück; die wird gebucht. Der
 * Claude-CLI-Weg meldet nichts, also wird mit demselben Tokenizer gerechnet,
 * den auch der Tokenicer benutzt (`srv/tokenicer.php`, gegen die
 * Python-Vorlage geprüft). Das Ergebnis ist gut, aber es ist eine Schätzung —
 * und genau so wird es gebucht und angezeigt.
 *
 * @return array{0:int,1:bool,2:string} Token, geschätzt?, Modellname
 */
function pu_verbrauch_messen(string $prompt, string $system, array $erg): array
{
    $gemessen = (int)($erg['token'] ?? 0);
    if ($gemessen > 0) {
        return [$gemessen, false, (string)($erg['modell'] ?? '')];
    }

    require_once PU_ROOT . '/srv/tokenicer.php';

    try {
        $hin  = count(pu_tok_kodieren($system . "

" . $prompt, 'o200k_base')['ids']);
        $zur  = count(pu_tok_kodieren((string)$erg['text'], 'o200k_base')['ids']);
        return [$hin + $zur, true, pu_tutor_modell()];
    } catch (Throwable $e) {
        // Lieber gar nicht buchen als eine erfundene Zahl. Das Cockpit zeigt
        // dann eine Lücke, und eine sichtbare Lücke ist ehrlicher als eine
        // unsichtbare Falschbuchung.
        return [0, true, pu_tutor_modell()];
    }
}

/**
 * Athenas Anmerkung zu einer bereits bewerteten Freitextantwort.
 *
 * Die Punkte stehen fest, bevor diese Funktion läuft, und sie werden hier
 * nicht zurückgegeben — nicht als Vorschlag, nicht als Korrektur. Athena hat
 * genau eine Aufgabe: sagen, was der Lernende beim nächsten Mal anders macht.
 */
function pu_athena_anmerkung(int $lernender, array $a, string $antwort, array $bewertung): string
{
    if (!pu_tutor_bereit() || !pu_regel_an('athena_anmerkung')) return '';

    $offen = array_filter($bewertung['teil'] ?? [], fn($t) => empty($t['erfuellt']));
    $liste = implode("\n", array_map(fn($t) => '- ' . (string)$t['begruendung'], $offen));

    $frage = "Der Lernende hat diese Antwort abgegeben:\n\n"
           . mb_substr($antwort, 0, 3000) . "\n\n"
           . sprintf("Bewertet wurde mit %d von %d Punkten.\n", $bewertung['punkte'], $bewertung['max'])
           . ($liste !== '' ? "Nicht erfuellt wurden:\n$liste\n" : "Alle Prüfungen wurden erfuellt.\n")
           . "\nSchreibe zwei bis vier Sätze: was war gut, und was macht er beim nächsten Mal anders? "
           . "Nenne KEINE Punktzahl und schlage keine andere Bewertung vor.";

    $erg = pu_tutor_fragen($lernender, 'athena', $frage, ['aufgabe' => (string)$a['titel']], true);
    return $erg['ok'] ? $erg['text'] : '';
}

// ================================================================ Vertiefung
/**
 * "Weitere Infos" — Prometheus vertieft ein Thema, das gerade sass.
 *
 * Erst nach einer RICHTIGEN Antwort, und deshalb darf die Musterlösung im
 * Kontext stehen: wer die Aufgabe gelöst hat, kennt sie bereits.
 *
 * Die Wortgrenze wird zweimal durchgesetzt — einmal als Bitte an das Modell,
 * einmal hart im Code. Das ist kein Misstrauen, sondern Arbeitsteilung: die
 * Bitte sorgt für einen Text, der zu Ende gedacht ist, das Kappen dafür, dass
 * die Spalte nie überläuft. Nur die Bitte hiesse, die Gestaltung der Seite
 * einem Sprachmodell zu überlassen.
 *
 * @param int $woerter gewünschte Höchstzahl (60 … 400)
 */
function pu_vertiefung(int $lernender, array $a, string $lektionstext, int $woerter): array
{
    if (!pu_regel_an('weitere_infos')) {
        return ['ok' => false, 'text' => '', 'fehler' => 'Vertiefungen sind abgeschaltet.'];
    }

    $woerter = max(60, min(400, $woerter));

    $frage = sprintf(
        "Der Lernende hat die Aufgabe \"%s\" RICHTIG gelöst und möchte mehr über das Thema wissen.\n\n"
        . "Schreibe eine Vertiefung in HÖCHSTENS %d Wörtern:\n"
        . "- knüpfe an das an, was er gerade verstanden hat,\n"
        . "- bringe genau einen neuen Gedanken oder ein konkretes Beispiel,\n"
        . "- schliesse mit einer Frage, über die er weiterdenken kann.\n\n"
        . "Kein Lob, keine Wiederholung der Aufgabe, keine Aufzählung von Definitionen. "
        . "Fliesstext, du-Form, Deutsch.",
        (string)$a['titel'], $woerter
    );

    $erg = pu_tutor_fragen($lernender, 'prometheus', $frage, [
        'aufgabe' => (string)$a['titel'],
        'lektion' => $lektionstext,
        'loesung' => is_scalar($a['loesung'] ?? null) ? (string)$a['loesung'] : '',
    ], true);

    if (!$erg['ok']) return $erg;

    $erg['text']    = pu_woerter_kappen($erg['text'], $woerter);
    $erg['woerter'] = $woerter;
    return $erg;
}

/**
 * Kappt einen Text auf eine Wortzahl, ohne mitten im Satz aufzuhören.
 *
 * Gesucht wird das letzte Satzende innerhalb der Grenze. Gibt es keines —
 * etwa bei einem einzigen langen Satz —, wird hart gekappt und ein Auslassungs-
 * zeichen angehängt. Ein halber Satz ohne Zeichen läse sich wie ein Fehler.
 */
function pu_woerter_kappen(string $text, int $max): string
{
    $text  = trim($text);
    $worte = preg_split('/\s+/u', $text, -1, PREG_SPLIT_NO_EMPTY) ?: [];
    if (count($worte) <= $max) return $text;

    $teil = implode(' ', array_slice($worte, 0, $max));

    if (preg_match('/^(.*[.!?…])[^.!?…]*$/su', $teil, $m) && mb_strlen($m[1]) > mb_strlen($teil) / 2) {
        return trim($m[1]);
    }
    return rtrim($teil, " ,;:-") . ' …';
}
