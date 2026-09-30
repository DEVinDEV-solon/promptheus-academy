<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — die Sitzung gehört genau einer Installation.
 *
 * Laufen zwei Academies auf einem Rechner (Hauptordner auf 8801, Testordner
 * auf 8802), teilen sie sich zweierlei, wenn man nichts tut:
 *
 *   **Das Cookie.** Browser trennen Cookies nach Rechnername, nicht nach Port.
 *   Hiessen beide Sitzungen `PROMPTHEUS`, überschriebe die Anmeldung an der
 *   einen die an der anderen — man flöge abwechselnd aus beiden heraus
 *   (Testordner, 30.09.2026).
 *
 *   **Den Sitzungsordner.** PHP legt Sitzungen ab Werk im Temp-Ordner des
 *   Systems ab, für beide derselbe. Ein Cookie der einen Installation lüde
 *   dann die Sitzung der anderen — mit einer Konto-Nummer, die in dieser
 *   Datenbank einem ganz anderen Konto gehören kann.
 *
 * Deshalb bekommt jede Installation einen eigenen Namen (aus ihrem Ordner
 * abgeleitet, also stabil über Neustarts und Portwechsel) und einen eigenen
 * Ordner unter `data/`.
 *
 * Ohne Datenbank und ohne lib.php: router.php braucht das schon, bevor
 * irgendetwas anderes geladen ist.
 */

/** Der Cookie-Name dieser Installation, z. B. `PROMPTHEUS_3f9a1c07b2`. */
function pu_sitzung_name(string $wurzel): string
{
    $pfad = realpath($wurzel) ?: $wurzel;
    // Windows kennt keinen Unterschied zwischen C:\X und c:\x — der Name soll
    // es auch nicht kennen, sonst hinge die Anmeldung an der Schreibweise.
    $pfad = strtolower(str_replace('\\', '/', $pfad));
    return 'PROMPTHEUS_' . substr(hash('sha256', $pfad), 0, 10);
}

/** Der Ordner für die Sitzungsdateien dieser Installation. */
function pu_sitzung_ordner(string $wurzel): string
{
    return rtrim($wurzel, '/\\') . '/data/sitzungen';
}

/** Name, Ordner und Cookie-Regeln setzen und die Sitzung öffnen. */
function pu_sitzung_oeffnen(string $wurzel): void
{
    if (session_status() === PHP_SESSION_ACTIVE) return;

    $ordner = pu_sitzung_ordner($wurzel);
    if (!is_dir($ordner)) @mkdir($ordner, 0700, true);
    if (is_dir($ordner) && is_writable($ordner)) session_save_path($ordner);

    session_name(pu_sitzung_name($wurzel));
    session_set_cookie_params(['lifetime' => 0, 'httponly' => true, 'samesite' => 'Lax']);
    session_start();
}
