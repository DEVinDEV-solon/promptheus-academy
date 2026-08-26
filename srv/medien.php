<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Video und Podcast neben dem Stoff.
 *
 * Zu jedem Kurs und zu jeder Lektion gehört rechts eine Spalte: oben ein
 * Video, darunter eine Hörfolge, die den Stoff in Teilen erzählt. Am Ende
 * eines Kurses steht dasselbe noch einmal als Fazit — ein Rückblick über
 * alles, was in den Lektionen einzeln vorkam.
 *
 * **Kein Verzeichnis, keine Datenbank, keine JSON-Pflege.** Was da ist, ist
 * da: der Ordner wird gelesen, und was darin liegt, erscheint. Eine
 * Zuordnungsdatei wäre ein zweiter Ort, an dem dasselbe steht — und der
 * erste, der veraltet, sobald jemand eine Datei umbenennt.
 *
 * Der Aufbau, eine Regel für alles:
 *
 *     medien/<Kurspfad>/kurs/          Video + Hörfolge zur Kursseite
 *     medien/<Kurspfad>/fazit/         Video + Hörfolge am Kursende
 *     medien/<Kurspfad>/<Lektion>/     Video + Hörfolge zur Lektion
 *
 * Je Ordner höchstens EIN Video (`video.mp4`, `.webm`, `.m4v`) und beliebig
 * viele Tonspuren (`.mp3`, `.m4a`, `.ogg`, `.opus`, `.wav`), sortiert nach
 * Dateinamen. Deshalb tragen sie eine führende Nummer:
 *
 *     01_was-ist-ki.mp3  ->  "1 · Was ist KI"
 *
 * Ausgeliefert werden die Dateien NICHT durch PHP, sondern direkt vom
 * Server: eine Aufnahme durch ein PHP-Skript zu reichen hiesse, sie in den
 * Arbeitsspeicher zu holen und die einzige Verbindung des eingebauten
 * Servers so lange zu belegen, wie sie läuft.
 *
 * Bereichsanfragen (Range) beherrscht der eingebaute PHP-Server allerdings
 * nicht — gemessen: auf `Range: 0-99` antwortet er mit 200 und der ganzen
 * Datei. Örtlich fällt das nicht auf, weil der Browser die Datei ohnehin
 * ganz lädt und danach springen kann. Für sehr grosse Videos oder einen
 * Betrieb über das Netz gehört ein richtiger Webserver davor.
 *
 * `router.php` hält davor die Anmeldung fest; ohne Sitzung gibt es 403.
 */

const PU_MEDIEN = PU_ROOT . '/medien';

const PU_MEDIEN_VIDEO = ['mp4', 'webm', 'm4v'];
const PU_MEDIEN_TON   = ['mp3', 'm4a', 'ogg', 'opus', 'wav'];

/**
 * Prüft einen Pfadteil.
 *
 * Erlaubt sind Buchstaben, Ziffern, Punkt, Strich, Unterstrich — kein `..`,
 * kein Schrägstrich, kein Nullbyte. Die Teile kommen aus Kurs- und
 * Lektionspfaden und damit mittelbar aus dem Vault; ein Ordnername mit `..`
 * darin wäre sonst ein Ausbruch aus `medien/`.
 */
function pu_medien_teil_ok(string $teil): bool
{
    if ($teil === '' || $teil === '.' || $teil === '..') return false;
    return (bool)preg_match('/^[A-Za-z0-9._-]+$/', $teil);
}

/**
 * Setzt einen Medienpfad zusammen und prüft ihn.
 *
 * @return string|null absoluter Ordner oder null, wenn etwas nicht stimmt
 */
function pu_medien_ordner(string $kurspfad, string $unter): ?string
{
    // `$unter` darf mehrstufig sein („kurs/eltern"), damit eine Zielgruppe
    // ihre eigenen Aufnahmen bekommen kann. Zerlegt wird trotzdem in
    // einzelne Teile — jeder einzeln geprüft, sonst wäre der Schrägstrich
    // ein Loch in der Pfadwache.
    $teile = array_merge(
        preg_split('#[/\\\\]+#', trim($kurspfad, '/')) ?: [],
        preg_split('#[/\\\\]+#', trim($unter, '/')) ?: []
    );
    foreach ($teile as $t) {
        if (!pu_medien_teil_ok((string)$t)) return null;
    }

    $pfad = PU_MEDIEN . '/' . implode('/', $teile);
    if (!is_dir($pfad)) return null;

    // Gürtel und Hosenträger: auch nach der Zeichenprüfung wird gegen die
    // aufgelöste Wurzel geprüft. Ein Verweis (Junction, Symlink) im
    // Medienordner käme sonst an der Zeichenprüfung vorbei.
    $echt = realpath($pfad);
    if ($echt === false || !pu_pfad_in_wurzel($echt, (string)(realpath(PU_MEDIEN) ?: PU_MEDIEN))) {
        return null;
    }
    return $echt;
}

/**
 * Liest einen Medienordner.
 *
 * @return array{video: ?array, audio: array, ordner: string}
 */
/**
 * Ordnernamen, die eine Zielgruppe meinen und deshalb NICHT mitgelesen werden.
 *
 * Alles andere unter einem Medienordner ist eine gewöhnliche Ablage, die man
 * angelegt hat, um Ordnung zu halten — und deren Aufnahmen sollen erscheinen.
 * Vorher verschwanden sie spurlos: Wer seine fünf Folgen in einen Unterordner
 * legte, sah eine leere Titelliste und keinen Hinweis, warum.
 */
const PU_MEDIEN_ZIELGRUPPEN = ['eltern', 'lehrer', 'schule', 'schueler'];

/**
 * Liest einen Medienordner — samt seiner gewöhnlichen Unterordner, eine Ebene tief.
 *
 * @return array{video: ?array, audio: array, ordner: string}
 */
function pu_medien(string $kurspfad, string $unter): array
{
    $leer = ['video' => null, 'audio' => [], 'ordner' => trim($kurspfad, '/') . '/' . $unter];

    if (!pu_regel_an('medien')) return $leer;

    $ordner = pu_medien_ordner($kurspfad, $unter);
    if ($ordner === null) return $leer;

    // Der Ordner selbst, dann seine Unterordner — Zielgruppen ausgenommen, die
    // haben ihren eigenen Weg über `$unter`.
    $orte = [['pfad' => $ordner, 'rel' => '']];
    foreach (scandir($ordner) ?: [] as $name) {
        if ($name === '.' || $name === '..') continue;
        if (!is_dir($ordner . '/' . $name)) continue;
        if (in_array(strtolower($name), PU_MEDIEN_ZIELGRUPPEN, true)) continue;
        if (!pu_medien_teil_ok($name)) continue;
        $orte[] = ['pfad' => $ordner . '/' . $name, 'rel' => $name . '/'];
    }

    $video = null;
    $audio = [];

    foreach ($orte as $ort) {
        $titel = pu_medien_titelliste($ort['pfad']);

        $namen = scandir($ort['pfad']) ?: [];
        sort($namen, SORT_NATURAL | SORT_FLAG_CASE);

        // Nackte Abtastwerte bekommen einmalig einen WAV-Kopf und liegen danach
        // als gewöhnliche Datei daneben — siehe pu_medien_pcm_wandeln().
        foreach ($namen as $name) {
            if (strtolower((string)pathinfo($name, PATHINFO_EXTENSION)) === 'pcm16') {
                pu_medien_pcm_wandeln($ort['pfad'] . '/' . $name);
            }
        }

        $namen = scandir($ort['pfad']) ?: [];
        sort($namen, SORT_NATURAL | SORT_FLAG_CASE);

        foreach ($namen as $name) {
            $voll = $ort['pfad'] . '/' . $name;
            if ($name === '.' || $name === '..' || !is_file($voll)) continue;

            $endung = strtolower((string)pathinfo($name, PATHINFO_EXTENSION));
            $rumpf  = (string)pathinfo($name, PATHINFO_FILENAME);

            // Die Quelldatei selbst wird nicht ausgeliefert: Roh kann sie kein
            // Browser abspielen, und zweimal in der Liste stünde sie sonst auch.
            if ($endung === 'pcm16') continue;

            $url = 'medien/' . trim($kurspfad, '/') . '/' . $unter . '/'
                 . $ort['rel'] . rawurlencode($name);
            [$nummer, $name_titel] = pu_medien_titel($name);

            if (in_array($endung, PU_MEDIEN_VIDEO, true)) {
                // Das erste Video gewinnt. Zwei Videos nebeneinander wären eine
                // Entscheidung, die niemand getroffen hat.
                if ($video === null) {
                    $video = ['url' => $url, 'titel' => $name_titel,
                              'groesse' => (int)filesize($voll)];
                }
                continue;
            }

            if (!in_array($endung, PU_MEDIEN_TON, true)) continue;

            /* **Erklärstück oder Beiwerk — daran hängt, was von selbst
               weiterläuft.** Ein Kurs, der in fünf Teilen erzählt wird, soll
               durchlaufen wie eine Folge; ein Lied dazwischen soll das nicht.
               Erkannt wird es an der Quelle: Was aus einer `.pcm16` entstanden
               ist, wurde für diesen Kurs gesprochen. */
            $ausPcm  = is_file($ort['pfad'] . '/' . $rumpf . '.pcm16');
            $eigener = $titel[mb_strtolower($rumpf)] ?? '';

            $audio[] = [
                'url'     => $url,
                'titel'   => $eigener !== '' ? $eigener : $name_titel,
                'nr'      => $nummer,
                'gruppe'  => $ausPcm ? 'erklaer' : 'weiteres',
                'kette'   => $ausPcm,
                'groesse' => (int)filesize($voll),
            ];
        }
    }

    /* Erst die Erklärstücke nach ihrer Nummer, dann alles Übrige. Die
       Reihenfolge ist hier keine Geschmacksfrage: Teil 3 vor Teil 1 gehört zu
       hören ergibt eine andere Geschichte. */
    usort($audio, function ($a, $b) {
        if ($a['gruppe'] !== $b['gruppe']) return $a['gruppe'] === 'erklaer' ? -1 : 1;
        $an = $a['nr'] ?? PHP_INT_MAX;
        $bn = $b['nr'] ?? PHP_INT_MAX;
        if ($an !== $bn) return $an <=> $bn;
        return strnatcasecmp($a['titel'], $b['titel']);
    });

    return ['video' => $video, 'audio' => $audio, 'ordner' => $leer['ordner']];
}

/**
 * Gibt nackten Abtastwerten einen WAV-Kopf — einmal, dann liegt die Datei da.
 *
 * **Warum überhaupt.** Die Sprachausgabe liefert `pcm16`: Zahlen ohne Angabe,
 * wie schnell sie abgespielt gehören. Ein Browser spielt das nicht ab — nicht
 * falsch, sondern gar nicht. Die 44 Bytes hier sind die Angabe.
 *
 * **Warum als Datei und nicht im Vorbeigehen.** Aufnahmen liefert der
 * eingebaute Server direkt aus. Durch PHP gereicht, belegte jede laufende
 * Aufnahme dessen einzige Verbindung, solange sie spielt — und niemand käme in
 * der Zeit an eine Lektion (siehe router.php). Umgewandelt wird deshalb einmal
 * beim Einlesen, danach ist es eine gewöhnliche Datei.
 *
 * Wer eine Aufnahme austauscht, bekommt sie neu umgewandelt: Verglichen wird
 * die Änderungszeit, nicht nur, ob schon etwas da ist.
 */
function pu_medien_pcm_wandeln(string $pcm, int $rate = 24000): bool
{
    if (!is_file($pcm)) return false;

    $wav = preg_replace('/\.pcm16$/i', '.wav', $pcm);
    if ($wav === null || $wav === $pcm) return false;

    if (is_file($wav) && filemtime($wav) >= filemtime($pcm)) return true;

    $roh = @file_get_contents($pcm);
    if ($roh === false || $roh === '') return false;

    $kopf = 'RIFF' . pack('V', 36 + strlen($roh)) . 'WAVE'
          . 'fmt ' . pack('VvvVVvv', 16, 1, 1, $rate, $rate * 2, 2, 16)
          . 'data' . pack('V', strlen($roh));

    return @file_put_contents($wav, $kopf . $roh) !== false;
}

/**
 * Eigene Titel aus einer `titel.md` neben den Aufnahmen.
 *
 * **Der Grund, warum es diese Datei gibt:** In eine `.pcm16` lässt sich kein
 * Titel schreiben — sie hat keinen Platz dafür, sie ist nur eine Reihe von
 * Zahlen. Und den Dateinamen zu ändern hiesse, die Reihenfolge anzufassen.
 * Also steht der Titel daneben, in einer Zeile, die man ohne Werkzeug ändern kann:
 *
 *     1-entdecker = Das Feuer, das du schon trägst
 *
 * Links der Dateiname ohne Endung, rechts der Titel. Fehlt die Datei oder eine
 * Zeile, gilt weiter der Dateiname — nichts geht kaputt, es wird nur weniger schön.
 */
function pu_medien_titelliste(string $ordner): array
{
    $datei = $ordner . '/titel.md';
    if (!is_file($datei)) return [];

    $aus = [];
    foreach (preg_split('/\R/', (string)@file_get_contents($datei)) ?: [] as $zeile) {
        $zeile = trim($zeile);
        if ($zeile === '' || $zeile[0] === '#') continue;

        $teile = explode('=', $zeile, 2);
        if (count($teile) !== 2) continue;

        $schluessel = mb_strtolower(trim($teile[0]));
        $wert       = trim($teile[1]);
        if ($schluessel !== '' && $wert !== '') $aus[$schluessel] = $wert;
    }
    return $aus;
}

/**
 * Macht aus einem Dateinamen Nummer und Titel.
 *
 *     03_kosten-je-1000-token.mp3  ->  [3,    "Kosten je 1000 Token"]
 *     video.mp4                    ->  [null, "Video"]
 *
 * Nummer und Titel bleiben GETRENNT. Zusammengeklebt („3 · Kosten …") stünde
 * die Zahl in der Titelliste zweimal da — einmal als Ordnungszahl der Liste
 * und einmal im Titel. Genau so sah es im ersten Anlauf aus.
 *
 * @return array{0: ?int, 1: string}
 */
function pu_medien_titel(string $dateiname): array
{
    $roh = (string)pathinfo($dateiname, PATHINFO_FILENAME);

    $nummer = null;
    if (preg_match('/^(\d{1,3})[._-]+(.*)$/', $roh, $m)) {
        $nummer = (int)$m[1];
        $roh    = $m[2];
    }

    $text = trim(str_replace(['-', '_', '.'], ' ', $roh));
    $text = preg_replace('/\s+/u', ' ', $text) ?? $text;
    if ($text === '') $text = 'Teil';
    $text = mb_strtoupper(mb_substr($text, 0, 1)) . mb_substr($text, 1);

    return [$nummer, $text];
}

/**
 * Alle Medien eines Kurses in einem Rutsch — für die Kursseite.
 *
 * `fazit` ist der Rückblick am Kursende. Er kommt aus einem eigenen Ordner
 * und nicht aus der letzten Lektion: das Fazit fasst den ganzen Kurs zusammen
 * und gehört keiner einzelnen Lektion.
 */
function pu_medien_kurs(string $kurspfad, string $zielgruppe = ''): array
{
    return [
        'kurs'  => pu_medien_fuer($kurspfad, 'kurs',  $zielgruppe),
        'fazit' => pu_medien_fuer($kurspfad, 'fazit', $zielgruppe),
    ];
}

/**
 * Medien für eine bestimmte Zielgruppe — mit Rückfall auf die gemeinsamen.
 *
 * Zu jedem Stück gibt es vier Sprechertexte (Schüler, Eltern, Lehrkraft,
 * Schulleitung), also können auch vier Aufnahmen entstehen. Sie liegen in
 * einem Unterordner:
 *
 *     medien/10_Stufen/01_Entdecker/kurs/schueler/01_worum-es-geht.mp3
 *     medien/10_Stufen/01_Entdecker/kurs/eltern/01_worum-es-geht.mp3
 *     medien/10_Stufen/01_Entdecker/kurs/01_worum-es-geht.mp3   ← für alle
 *
 * **Der Rückfall ist der Punkt.** Wer nur eine Aufnahme hat, legt sie wie
 * bisher direkt in den Ordner, und alle hören dieselbe. Wer für eine
 * Zielgruppe eine eigene aufnimmt, legt sie in den Unterordner — und nur
 * diese Gruppe bekommt sie zu hören. Man muss also nicht 172 Aufnahmen
 * haben, bevor überhaupt etwas läuft.
 */
function pu_medien_fuer(string $kurspfad, string $unter, string $zielgruppe = ''): array
{
    if ($zielgruppe !== '') {
        $eigen = pu_medien($kurspfad, $unter . '/' . $zielgruppe);
        if (!pu_medien_leer($eigen)) return $eigen;
    }
    return pu_medien($kurspfad, $unter);
}

/**
 * Die Medien einer Lektion.
 *
 * Der Ordnername ist der Dateiname der Lektion ohne `.md`. Damit steht die
 * Zuordnung im Dateisystem und nirgends sonst — wer eine Lektion umbenennt,
 * benennt den Medienordner mit um und merkt es sofort, statt später eine
 * Zuordnungsdatei zu vergessen.
 */
function pu_medien_lektion(string $kurspfad, string $lektionspfad, string $zielgruppe = ''): array
{
    $name = (string)pathinfo($lektionspfad, PATHINFO_FILENAME);
    return pu_medien_fuer($kurspfad, $name, $zielgruppe);
}

/**
 * Welche Aufnahmen gehören zu dieser Person?
 *
 * Die Zielgruppe folgt der Zugangsebene: ein Schülerkonto hört die
 * Schüler-Fassung, ein Elternkonto die für Eltern. Die Ebene `verwaltung`
 * heisst bei den Aufnahmen `schule` — so wie der Ordner im Vault.
 */
function pu_medien_zielgruppe(array $wer): string
{
    require_once PU_ROOT . '/srv/rechte.php';
    require_once PU_ROOT . '/srv/persona.php';

    // Nimmt Ebene 1 gerade eine Persona ein, hört sie deren Fassung. Sonst
    // bliebe die Vorschau auf halbem Weg stehen: Der Tutor spräche wie zu
    // einem Kind, und daneben liefe die Aufnahme für die Schulleitung.
    $p = pu_persona();
    if ($p !== null) {
        return match ($p['rolle']) {
            'eltern'     => 'eltern',
            'lehrer'     => 'lehrer',
            'verwaltung' => 'schule',
            default      => 'schueler',
        };
    }

    return match (pu_ebene($wer)) {
        'eltern'     => 'eltern',
        'lehrer'     => 'lehrer',
        'verwaltung' => 'schule',
        'admin'      => '',        // Ebene 1 hört, was für alle da ist
        default      => 'schueler',
    };
}

/** Liegt überhaupt etwas vor? Entscheidet, ob die Spalte erscheint. */
function pu_medien_leer(array $m): bool
{
    return ($m['video'] ?? null) === null && ($m['audio'] ?? []) === [];
}
