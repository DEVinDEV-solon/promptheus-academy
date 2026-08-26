<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Sprachnachricht zu Text, auf diesem Rechner.
 *
 * **Der Ton verlässt den Rechner nie.** Das ist keine Vorsicht, sondern die
 * Bedingung dafür, dass es diese Funktion überhaupt gibt: Hier sprechen
 * Kinder. In einer Aufnahme steckt eine Stimme, ein Name, ein Zimmer im
 * Hintergrund — nichts davon lässt sich filtern, bevor es weggeht. Also geht
 * es nicht weg.
 *
 * Erkannt wird mit whisper.cpp, örtlich. Erst das **Ergebnis** ist Text, und
 * Text nimmt denselben Weg wie jeder getippte Satz: der Lernende liest ihn,
 * kann ihn ändern, und erst dann geht er an einen Tutor.
 *
 * Der Ablauf:
 *   1. ffmpeg wandelt die Aufnahme in 16-kHz-Mono-WAV — das Format, das die
 *      Erkennung erwartet.
 *   2. whisper.cpp erkennt, mit fest eingestelltem Deutsch.
 *   3. Beide Zwischendateien werden in einem `finally` gelöscht, auch wenn
 *      unterwegs etwas schiefgeht.
 *
 * **PROMPTHEUS bringt whisper nicht mit** (das Sprachmodell allein ist über
 * ein Gigabyte). Gesucht wird an den üblichen Orten — auch in den anderen
 * Programmen des Hauses, wenn sie auf demselben Rechner liegen. Fehlt etwas,
 * sagt `pu_sprache_bereit()`, **was** fehlt und wohin es gehört. Ein „geht
 * nicht" ohne Grund kostet eine halbe Stunde.
 */

/** Tonarten, die ffmpeg zuverlässig öffnet. */
const PU_TON_ARTEN = ['webm', 'ogg', 'oga', 'opus', 'mp3', 'wav', 'm4a', 'aac', 'flac'];

/** Grenzen. Eine Sprachnachricht an einen Tutor ist keine Vorlesung. */
const PU_TON_MAX_MB    = 5;
const PU_TON_MAX_SEK   = 180;
const PU_TON_ZEITLIMIT = 300;

/**
 * Sucht ein Werkzeug — .env, eigener Ordner, Nachbarprogramme, PATH.
 *
 * Nach dem Muster von `ad_werkzeug()` in ADVOCAT, wo dieselbe Frage schon
 * gelöst ist. Übernommen ist das Muster, nicht die Datei.
 */
function pu_werkzeug(string $envName, array $relativ, string $imPfad, array $fest = []): ?string
{
    static $merk = [];
    if (array_key_exists($envName, $merk)) return $merk[$envName];

    $glatt = fn(string $p): string => str_replace('\\', '/', $p);

    // 1. Fester Pfad aus der .env — wer es genau weiss, sagt es hier.
    $aus = trim(pu_env($envName, ''));
    if ($aus !== '' && is_file($aus)) return $merk[$envName] = $glatt($aus);

    // 2. Tragbar: im eigenen Programmordner
    foreach ($relativ as $rel) {
        $p = PU_ROOT . '/werkzeuge/' . ltrim($rel, '/');
        if (is_file($p)) return $merk[$envName] = $glatt($p);
    }

    // 3. Nachbarprogramme auf demselben Rechner
    foreach ($fest as $p) {
        if (is_file($p)) return $merk[$envName] = $glatt($p);
    }

    // 4. PATH
    $win = stripos(PHP_OS_FAMILY, 'Windows') === 0;
    $wo  = @shell_exec(($win ? 'where ' : 'command -v ') . $imPfad . ($win ? ' 2>NUL' : ' 2>/dev/null'));
    if (is_string($wo)) {
        $erste = trim(strtok($wo, "\r\n") ?: '');
        if ($erste !== '' && is_file($erste)) return $merk[$envName] = $glatt($erste);
    }

    return $merk[$envName] = null;
}

/** Die Nachbarprogramme, die whisper und ffmpeg schon mitbringen. */
function pu_nachbarn(string $unterordner): array
{
    $haus = dirname(PU_ROOT);          // …/scripts
    return [
        $haus . '/Advocat/werkzeuge/' . $unterordner,
        $haus . '/VoiceVibe/_whisper.cpp/' . $unterordner,
        $haus . '/Werkstatt/_whisper.cpp/' . $unterordner,
    ];
}

function pu_ffmpeg_bin(): ?string
{
    return pu_werkzeug('PU_FFMPEG_BIN',
        ['ffmpeg/ffmpeg.exe', 'ffmpeg/bin/ffmpeg.exe', 'ffmpeg/ffmpeg'],
        'ffmpeg',
        array_map(fn($p) => $p . '/ffmpeg.exe', pu_nachbarn('ffmpeg')));
}

function pu_whisper_bin(): ?string
{
    $kandidaten = [];
    foreach (pu_nachbarn('whisper') as $ordner) {
        foreach (['whisper-cli.exe', 'main.exe', 'whisper-cli', 'main'] as $name) {
            $kandidaten[] = $ordner . '/' . $name;
        }
    }
    // VoiceVibe legt die Binärdateien direkt neben die Modelle.
    $haus = dirname(PU_ROOT);
    foreach (['VoiceVibe/_whisper.cpp', 'Werkstatt/_whisper.cpp'] as $rel) {
        foreach (['whisper-cli.exe', 'main.exe', 'build/bin/whisper-cli.exe'] as $name) {
            $kandidaten[] = $haus . '/' . $rel . '/' . $name;
        }
    }

    return pu_werkzeug('PU_WHISPER_BIN',
        ['whisper/whisper-cli.exe', 'whisper/main.exe', 'whisper/whisper-cli'],
        'whisper-cli', $kandidaten);
}

/**
 * Alle gefundenen Sprachmodelle, das grösste zuerst.
 *
 * Eine Liste und nicht eines, weil das grösste nicht immer läuft: whisper.cpp
 * lädt das ganze Modell in den Arbeitsspeicher, und `ggml-medium.bin` sind
 * 1,4 GB. Ist die nicht frei, bricht es mit `GGML_ASSERT(ctx->mem_buffer !=
 * NULL)` ab — gemessen auf diesem Rechner bei 3,2 GB frei.
 *
 * Deshalb wird der Reihe nach probiert: erst das genaueste, dann das
 * nächstkleinere. Ein Rechner mit wenig Speicher bekommt eine etwas gröbere
 * Erkennung statt einer Fehlermeldung.
 */
function pu_whisper_modelle(): array
{
    $aus = trim(pu_env('PU_WHISPER_MODELL', ''));
    if ($aus !== '' && is_file($aus)) return [str_replace('\\', '/', $aus)];

    $orte = array_merge(
        [PU_ROOT . '/werkzeuge/whisper'],
        pu_nachbarn('whisper'),
        [dirname(PU_ROOT) . '/VoiceVibe/_whisper.cpp/models',
         dirname(PU_ROOT) . '/Werkstatt/_whisper.cpp/models']
    );

    $gefunden = [];
    foreach (['large-v3-turbo', 'large-v3', 'large', 'medium', 'small', 'base', 'tiny'] as $g) {
        foreach ([$g, $g . '.de', $g . '-q5_0'] as $name) {
            foreach ($orte as $ordner) {
                $p = $ordner . '/ggml-' . $name . '.bin';
                if (is_file($p)) $gefunden[] = str_replace('\\', '/', $p);
            }
        }
    }
    return array_values(array_unique($gefunden));
}

/** Das erste brauchbare Modell — für die Anzeige „was ist eingerichtet". */
function pu_whisper_modell(): ?string
{
    $alle = pu_whisper_modelle();
    return $alle === [] ? null : $alle[0];
}

/**
 * Ist alles da? Sagt, WAS fehlt — nicht nur, dass etwas fehlt.
 *
 * Genau das ist die Grundlage für „später nachinstallieren": auf einem
 * anderen Server steht dann hier, welche zwei Dateien noch gebraucht werden
 * und in welchen Ordner sie gehören.
 */
function pu_sprache_bereit(): array
{
    $ffmpeg  = pu_ffmpeg_bin();
    $whisper = pu_whisper_bin();
    $modell  = pu_whisper_modell();

    $fehlt = [];
    if ($ffmpeg  === null) $fehlt[] = 'ffmpeg';
    if ($whisper === null) $fehlt[] = 'whisper.cpp (whisper-cli)';
    if ($modell  === null) $fehlt[] = 'ein Sprachmodell (ggml-*.bin)';

    return [
        'ok'      => $fehlt === [],
        'fehlt'   => $fehlt,
        'ffmpeg'  => $ffmpeg  ?? '',
        'whisper' => $whisper ?? '',
        // Welches Modell am Ende läuft, entscheidet sich erst beim Erkennen:
        // reicht der Speicher für das grösste nicht, fällt der Server auf ein
        // kleineres zurück. Hier steht deshalb, was GEFUNDEN wurde.
        'modell'  => $modell === null ? '' : basename($modell),
        'modelle' => array_map('basename', pu_whisper_modelle()),
        'hinweis' => $fehlt === []
            ? 'Die Erkennung läuft vollständig auf diesem Rechner. '
              . 'Nichts von der Aufnahme geht hinaus.'
            : 'Es fehlt: ' . implode(', ', $fehlt) . '. Ablegen unter '
              . 'werkzeuge/whisper/ im Programmordner, oder den Pfad als '
              . 'PU_WHISPER_BIN und PU_WHISPER_MODELL in die .env schreiben.',
    ];
}

/**
 * Erkennt eine Aufnahme.
 *
 * @param string $datei  hochgeladene Tondatei (wird NICHT gelöscht — das macht
 *                       der Aufrufer, der sie angelegt hat)
 * @return array{ok:bool,text:string,sekunden:int,tokens:int,fehler:string,modell:string}
 */
function pu_sprache_erkennen(string $datei): array
{
    $stand = pu_sprache_bereit();
    if (!$stand['ok']) {
        return ['ok' => false, 'text' => '', 'sekunden' => 0, 'tokens' => 0,
                'modell' => '', 'fehler' => $stand['hinweis']];
    }
    if (!is_file($datei)) {
        return ['ok' => false, 'text' => '', 'sekunden' => 0, 'tokens' => 0,
                'modell' => '', 'fehler' => 'Die Aufnahme ist nicht angekommen.'];
    }

    $mb = filesize($datei) / 1048576;
    if ($mb > PU_TON_MAX_MB) {
        return ['ok' => false, 'text' => '', 'sekunden' => 0, 'tokens' => 0, 'modell' => '',
                'fehler' => sprintf('Die Aufnahme ist %.1f MB gross — mehr als %d MB nimmt '
                                  . 'die Academy nicht an.', $mb, PU_TON_MAX_MB)];
    }

    $tmp = PU_DATA . '/tmp';
    if (!is_dir($tmp)) @mkdir($tmp, 0777, true);
    $wav = $tmp . '/sprache_' . bin2hex(random_bytes(6)) . '.wav';

    try {
        // ---------------------------------------------------- 1. ffmpeg
        $cmd = escapeshellarg((string)pu_ffmpeg_bin())
             . ' -nostdin -hide_banner -loglevel error -y'
             . ' -i ' . escapeshellarg($datei)
             . ' -ar 16000 -ac 1 -c:a pcm_s16le'
             . ' -t ' . PU_TON_MAX_SEK
             . ' ' . escapeshellarg($wav);

        // `-nostdin` ist Pflicht: ohne das wartet ffmpeg unter Windows auf
        // eine Eingabe, die nie kommt, und der Aufruf hängt bis zum Zeitlimit.
        @exec($cmd . ' 2>&1', $aus, $code);

        if ($code !== 0 || !is_file($wav)) {
            return ['ok' => false, 'text' => '', 'sekunden' => 0, 'tokens' => 0, 'modell' => '',
                    'fehler' => 'Die Aufnahme liess sich nicht umwandeln. '
                              . mb_substr(implode(' ', array_slice($aus, -3)), 0, 200)];
        }

        // Dauer aus der WAV-Grösse: 16.000 Abtastungen je Sekunde, 2 Byte,
        // ein Kanal. Genauer als ffprobe zu rufen, und ein Aufruf weniger.
        $sekunden = (int)ceil(max(0, filesize($wav) - 44) / 32000);

        // ---------------------------------------------------- 2. whisper.cpp
        //
        // Der Reihe nach, grösstes Modell zuerst. whisper.cpp lädt das ganze
        // Modell in den Arbeitsspeicher; ist der knapp, bricht es mit
        // `GGML_ASSERT(ctx->mem_buffer != NULL)` ab. Gemessen auf diesem
        // Rechner: ggml-medium.bin (1,4 GB) scheitert bei 3,2 GB frei,
        // ggml-small.bin läuft und liefert denselben Satz.
        //
        // Deshalb wird nicht aufgegeben, sondern das nächstkleinere probiert.
        // Eine etwas gröbere Erkennung ist besser als eine Fehlermeldung.
        @set_time_limit(PU_TON_ZEITLIMIT + 15);

        $txt     = $wav . '.txt';
        $log     = $wav . '.log';
        $text    = '';
        $genutzt = '';
        $grund   = '';

        foreach (pu_whisper_modelle() as $modell) {
            @unlink($txt);

            // stderr geht in eine Datei, nicht in die Ausgabe: whisper
            // schreibt dort auch im Erfolgsfall („reading audio data …"), und
            // das würde sonst als erkannter Text durchgehen.
            $cmd = escapeshellarg((string)pu_whisper_bin())
                 . ' -m ' . escapeshellarg($modell)
                 . ' -f ' . escapeshellarg($wav)
                 . ' -l de -nt -np'
                 . ' --output-txt --output-file ' . escapeshellarg($wav)
                 . ' 2>' . escapeshellarg($log);

            $aus = [];
            @exec($cmd, $aus, $code);

            $meldung = is_file($log) ? (string)file_get_contents($log) : '';
            @unlink($log);

            if (is_file($txt)) {
                $text = trim((string)file_get_contents($txt));
                @unlink($txt);
            }

            if ($text !== '') { $genutzt = basename($modell); break; }

            // **Kein Text heisst: das nächste Modell probieren.** Hier stand
            // vorher eine Prüfung auf die Fehlermeldung — „mem_buffer",
            // „GGML_ASSERT" —, und nur dann ging es weiter.
            //
            // Gemessen: whisper.cpp stirbt mit dem grossen Modell etwa jedes
            // sechste Mal als harter Absturz (Exit 139) und schreibt dabei
            // **gar nichts** nach stderr. Dann traf keines der Muster, die
            // Schleife brach ab, und der Lernende bekam „Es wurde nichts
            // verstanden" zu lesen — obwohl das kleine Modell danebenlag und
            // den Satz zuverlässig erkennt.
            //
            // Ein Fehler, den man am Wortlaut erkennen muss, ist ein Fehler,
            // den man eines Tages nicht erkennt. Die Regel ist jetzt die
            // Wirkung, nicht die Meldung: kein Text, nächstes Modell. Es
            // kostet im schlimmsten Fall zwei Anläufe mehr, einmal.
            $grund = trim(mb_substr($meldung, -200));
        }

        if ($text === '') {
            return ['ok' => false, 'text' => '', 'sekunden' => $sekunden, 'tokens' => 0,
                    'modell' => '',
                    'fehler' => $grund !== ''
                        ? 'Die Erkennung ist fehlgeschlagen: ' . $grund
                        : 'Es wurde nichts verstanden. Sprich etwas näher am Mikrofon.'];
        }

        // Whisper setzt bei Stille gern Klammerbemerkungen wie [Musik].
        $text = trim(preg_replace('/\s*[\[\(](Musik|Applaus|Geräusch\w*|BLANK_AUDIO)[\]\)]\s*/iu',
                                  ' ', $text) ?? $text);

        return [
            'ok'       => $text !== '',
            'text'     => $text,
            'sekunden' => $sekunden,
            // Aufgerundet auf angefangene Minuten — so steht es in der
            // Preistafel, und so wird es gebucht.
            'tokens'   => (int)ceil(max(1, $sekunden) / 60) * PU_TOKEN_JE_MINUTE,
            'modell'   => $genutzt,
            'fehler'   => $text === '' ? 'Es wurde nichts verstanden.' : '',
        ];
    } finally {
        @unlink($wav);
        @unlink($wav . '.txt');
        @unlink($wav . '.log');
    }
}
