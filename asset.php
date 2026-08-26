<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Auslieferung von Anhängen aus dem Vault, mit Anmeldung.
 *
 * `router.php` sperrt `brain/` komplett. Trotzdem müssen Bilder in einer
 * Lektion angezeigt werden können — ein Architekturdiagramm in Stufe 4 ist
 * kein Beiwerk, sondern die Aufgabe. Diese Datei ist der einzige Weg dorthin,
 * und sie ist eng gefasst:
 *
 *   - nur unterhalb von `brain/99_Anhaenge/`
 *   - nur die MIME-Typen aus der Liste unten
 *   - nur mit Anmeldung
 *
 * Kein Markdown: Notizen gehen ueber `api.php`, weil dort das Sieb sitzt, das
 * Lösungen heraushält. Wuerde diese Datei auch `.md` ausliefern, wäre die
 * Sperre in `router.php` umsonst.
 */

require_once __DIR__ . '/lib.php';
require_once __DIR__ . '/srv/db.php';
require_once __DIR__ . '/srv/lernende.php';

if (!pu_ist_angemeldet()) {
    http_response_code(401);
    header('Content-Type: text/plain; charset=utf-8');
    echo "401 — bitte anmelden.\n";
    exit;
}

const PU_MIME = [
    'png'  => 'image/png',
    'jpg'  => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'gif'  => 'image/gif',
    'webp' => 'image/webp',
    'svg'  => 'image/svg+xml',
    'pdf'  => 'application/pdf',
];

$rel = (string)($_GET['datei'] ?? '');
$abs = pu_brain_pfad($rel);

$anhaenge = str_replace('\\', '/', (string)realpath(PU_BRAIN . '/99_Anhaenge'));

if ($abs === null || $anhaenge === '' || !pu_pfad_in_wurzel($abs, $anhaenge) || !is_file($abs)) {
    http_response_code(404);
    header('Content-Type: text/plain; charset=utf-8');
    echo "404 — nicht gefunden.\n";
    exit;
}

$endung = strtolower(pathinfo($abs, PATHINFO_EXTENSION));
if (!isset(PU_MIME[$endung])) {
    http_response_code(415);
    header('Content-Type: text/plain; charset=utf-8');
    echo "415 — dieser Dateityp wird nicht ausgeliefert.\n";
    exit;
}

// SVG kann Skript tragen. Als Anhang gehen sie deshalb nur mit einer strengen
// Richtlinie hinaus, und nie als Seite, die im selben Ursprung läuft.
header('Content-Type: ' . PU_MIME[$endung]);
header('Content-Length: ' . (string)filesize($abs));
header('X-Content-Type-Options: nosniff');
header("Content-Security-Policy: default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'");
header('Cache-Control: private, max-age=300');

readfile($abs);
