<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Wache vor dem eingebauten PHP-Server.
 *
 * `php -S … -t <ordner>` liefert ALLES aus, was im Ordner liegt. In NACHBARPROGRAMM
 * war das gemessen ein Download der Datenbank ohne Anmeldung. Hier wäre es:
 *
 *     GET /data/promptheus.db      alle Lernstände einer Klasse
 *     GET /brain/10_Stufen/…       jede Musterlösung, vor der Prüfung
 *
 * Das zweite ist der Grund, der ueber die NACHBARPROGRAMM-Wache hinausgeht: der
 * Lehrstoff trägt die Lösungen. Waere `brain/` statisch abrufbar, könnte
 * jeder Lernende die Prüfung im zweiten Browsertab nachschlagen — und
 * niemandem fällt es auf, weil das Ergebnis genauso aussieht wie Können.
 *
 * Deshalb läuft der Server ab jetzt MIT diesem Skript:
 *
 *     php -S 127.0.0.1:8801 -t "<ordner>" router.php
 *
 * `return false` heißt: der eingebaute Server macht weiter wie bisher — der
 * Router entscheidet nur, was er gar nicht erst zu sehen bekommt.
 *
 * Lehrstoff geht ausschließlich ueber `api.php` hinaus: dort sitzt die
 * Anmeldung, und dort wird die Lösung erst nach der Abgabe freigegeben.
 */

$pfad = (string)parse_url((string)($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH);
$pfad = strtolower(str_replace('\\', '/', rawurldecode($pfad)));

/**
 * Liefert eine Datei mit Byte-Bereichen aus.
 *
 * Der eingebaute PHP-Server kennt keine `Range`-Anfragen: Er schickt immer die
 * ganze Datei mit Status 200. Ein Browser, der „ab Byte 4.200.000" fragt und
 * die ganze Datei bekommt, gibt den Regler im Player zwar frei — springen kann
 * er nicht. Genau das war am 23.10.2026 der Grund, warum sich die Hörfolge
 * nicht vorspulen ließ.
 *
 * Deshalb übernimmt der Router die Auslieferung für `medien/` selbst: mit
 * `Accept-Ranges`, mit `206` und `Content-Range`, in Blöcken von 256 KB.
 *
 * Bedingt definiert: Die Tests binden den Router mehrmals ein.
 */
if (!function_exists('pu_datei_mit_bereichen')) {
function pu_datei_mit_bereichen(string $datei): void
{
    $groesse = (int)filesize($datei);
    $typ = match (strtolower(pathinfo($datei, PATHINFO_EXTENSION))) {
        'mp3'         => 'audio/mpeg',
        'mp4', 'm4v'  => 'video/mp4',
        'webm'        => 'video/webm',
        'ogg', 'opus' => 'audio/ogg',
        'wav'         => 'audio/wav',
        'm4a'         => 'audio/mp4',
        'jpg', 'jpeg' => 'image/jpeg',
        'png'         => 'image/png',
        'webp'        => 'image/webp',
        default       => 'application/octet-stream',
    };

    $start = 0;
    $ende  = $groesse - 1;
    if (isset($_SERVER['HTTP_RANGE'])
        && preg_match('/bytes=(\d*)-(\d*)/', (string)$_SERVER['HTTP_RANGE'], $m)) {
        if ($m[1] === '' && $m[2] !== '') {
            $start = max(0, $groesse - (int)$m[2]);      // „die letzten N Bytes"
        } else {
            $start = (int)$m[1];
            if ($m[2] !== '') $ende = min((int)$m[2], $groesse - 1);
        }
        if ($start > $ende || $start >= $groesse) {
            http_response_code(416);
            header('Content-Range: bytes */' . $groesse);
            return;
        }
        http_response_code(206);
        header('Content-Range: bytes ' . $start . '-' . $ende . '/' . $groesse);
    } else {
        http_response_code(200);
    }

    header('Content-Type: ' . $typ);
    header('Accept-Ranges: bytes');
    header('Content-Length: ' . ($ende - $start + 1));
    header('Cache-Control: public, max-age=3600');

    $fp = fopen($datei, 'rb');
    if ($fp === false) return;
    fseek($fp, $start);
    $rest = $ende - $start + 1;
    while ($rest > 0 && !feof($fp)) {
        $lese = (int)min(262144, $rest);
        echo fread($fp, $lese);
        $rest -= $lese;
        flush();
    }
    fclose($fp);
}
}

/**
 * Was nie ueber HTTP hinausgeht.
 *
 * `data`       — Lernstände, Antworten, Urkunden, Protokoll, Datenbank.
 *                Antworten Minderjähriger; das ist keine Beiläufigkeit.
 * `brain`      — der Lehrstoff samt Lösungen und Hinweisen.
 * `.obsidian`  — Vault-Konfiguration; in Plugin-Ordnern stehen Schlüssel.
 * `prompts`    — die Systemprompts der Tutor-Agenten. Wer sie liest, kennt
 *                die Grenzen, die Athena setzt.
 * `setup`      — die Ernte samt Freigabeliste, also die Pfade fremder Vaults.
 * `tests`      — Testdaten enthalten Musterlösungen.
 * `recht`      — die Rechtstexte. Nicht geheim, im Gegenteil: sie sollen
 *                gelesen werden. Gesperrt ist nur der rohe Ordner, damit es
 *                genau einen Weg zu ihnen gibt — `recht.php`, mit
 *                Entwurfshinweis. Eine roh ausgelieferte .md-Datei trägt den
 *                nicht, und ein Impressum ohne Stand ist ein Risiko.
 * `vocab`      — die BPE-Tabellen des Tokenicers. Kein Geheimnis, aber sieben
 *                Megabyte, die niemand im Browser braucht: der Tokenicer
 *                rechnet auf dem Server.
 * `.env`       — die Schlüssel. `.env.example` trägt keine Werte und
 *                könnte mit; sie fällt hier trotzdem heraus, weil eine
 *                Ausnahme an dieser Stelle mehr kostet als sie nützt.
 * `vps`        — die Serverseite: Relay, Hauptbuch, Kundenbereich,
 *                Verwaltung. Sie gehoert auf den VPS und laeuft nie auf dem
 *                Rechner eines Kunden. Die Sperre steht hier, solange der
 *                Ordner noch LEER ist — danach waere sie eine Reparatur.
 *                Wer sie streicht, liefert den Teil aus, der die
 *                Freischaltung durchsetzt, an den aus, der freigeschaltet
 *                werden soll. Siehe LIZENZ-RELAY-PLAN.md.
 */
$gesperrt = false;
foreach (explode('/', trim($pfad, '/')) as $teil) {
    if ($teil === 'data' || $teil === 'brain' || $teil === 'secondbrain' || $teil === '.obsidian'
        || $teil === 'prompts' || $teil === 'setup' || $teil === 'tests'
        || $teil === 'recht' || $teil === 'vps'
        || $teil === 'vocab' || $teil === '.git' || $teil === '.versionen'
        || $teil === 'werkzeuge' || $teil === 'dist' || $teil === 'manifest.json'
        || $teil === '.env' || str_starts_with($teil, '.env.')) {
        $gesperrt = true;
        break;
    }
}

/**
 * `medien/` liegt dazwischen: keine Lösung, aber auch nichts für die Strasse.
 *
 * Videos und Hörfolgen liefert der eingebaute Server direkt aus. Durch PHP
 * gereicht, belegte jede laufende Aufnahme die einzige Verbindung dieses
 * Servers, solange sie spielt — und niemand käme in der Zeit an eine
 * Lektion.
 *
 * Statisch heißt aber auch: an api.php vorbei. Deshalb steht hier die
 * Anmeldung davor, und zwar ohne Datenbank — es genügt zu wissen, dass eine
 * Sitzung besteht. Wer sie hat, hat sich angemeldet.
 */
if (!$gesperrt && str_starts_with(trim($pfad, '/'), 'medien/')) {
    if (function_exists('pu_session_start')) {
        pu_session_start();
    } elseif (session_status() !== PHP_SESSION_ACTIVE) {
        // Derselbe Name und derselbe Ordner wie in lib.php — sonst fände der
        // Router die Anmeldung nicht, die api.php angelegt hat.
        require_once __DIR__ . '/srv/sitzung.php';
        @pu_sitzung_oeffnen(__DIR__);
    }
    if ((int)($_SESSION['pu_id'] ?? 0) <= 0) $gesperrt = true;

    /* Angemeldet und erlaubt: Jetzt liefert der Router selbst aus, damit der
       Browser Byte-Bereiche bekommt. Den Pfad dafür aus der Anfrage nehmen —
       `$pfad` ist kleingeschrieben, und ein Kursordner heißt
       `DOM-KI-Geschichte`; klein geschrieben fände man ihn nicht. */
    if (!$gesperrt) {
        $roh    = rawurldecode((string)parse_url((string)($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH));
        $datei  = realpath(__DIR__ . '/' . ltrim(str_replace('\\', '/', $roh), '/'));
        $wurzel = realpath(__DIR__ . '/medien');
        if ($datei !== false && $wurzel !== false && is_file($datei)
            && str_starts_with(str_replace('\\', '/', $datei), str_replace('\\', '/', $wurzel) . '/')) {
            pu_datei_mit_bereichen($datei);
            return true;
        }
    }
}

if ($gesperrt) {
    http_response_code(403);
    header('Content-Type: text/plain; charset=utf-8');
    header('Cache-Control: no-store');
    echo "403 — dieser Pfad wird nicht ausgeliefert.\n";
    echo "Lehrstoff geht ausschließlich ueber api.php hinaus, mit Anmeldung.\n";
    return true;
}

// PHP-Dateien im Wurzelverzeichnis sind Einstiegspunkte und dürfen laufen.
// Alles andere (Bilder, CSS, JS aus assets/) liefert der eingebaute Server.
return false;
