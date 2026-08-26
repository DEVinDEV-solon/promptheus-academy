<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Wache vor dem eingebauten PHP-Server.
 *
 * `php -S … -t <ordner>` liefert ALLES aus, was im Ordner liegt. In ADVOCAT
 * war das gemessen ein Download der Datenbank ohne Anmeldung. Hier wäre es:
 *
 *     GET /data/promptheus.db      alle Lernstände einer Klasse
 *     GET /brain/10_Stufen/…       jede Musterlösung, vor der Prüfung
 *
 * Das zweite ist der Grund, der ueber die ADVOCAT-Wache hinausgeht: der
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
        session_name('PROMPTHEUS');
        @session_start();
    }
    if ((int)($_SESSION['pu_id'] ?? 0) <= 0) $gesperrt = true;
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
