<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — die Werkstatt: ob sie frei ist, ob sie eingerichtet ist, und
 * wie sie geöffnet wird.
 *
 * Die Werkstatt ist eine eigene Anwendung (DeepSeek Harness, Ordner
 * `werkstatt/`, Port 3081). Sie ist **bis zum 7. Kurs gesperrt**: frei mit
 * dem 7. Kurs zu 100 %, Admins sofort (damit der Betreiber sie prüfen kann).
 *
 * Entschieden wird hier, auf dem Server — nicht am Knopf. Wer frei ist, bekommt
 * beim Öffnen ein **Ticket** (`data/werkstatt/ticket.json`): zufällig, zwei
 * Minuten gültig, nur für einen Start. `werkstatt/werkzeuge/starten.mjs`
 * verbraucht es und startet ohne gültiges Ticket nicht.
 *
 * Grenze: Das ist eine Sperre auf demselben Rechner. Wer Schreibrechte auf den
 * Programmordner hat, kann sie umgehen. Auf Schulrechnern gehört der Ordner
 * deshalb dem Verwalter-Konto.
 *
 * Unabhängig vom Werkstatt-Coder (srv/coder.php): Der Coder ist ein Schalter
 * der Academy mit eigener Modellliste. Die Freigabe-Bedingung (Kurs 7 zu 100 %)
 * ist dieselbe und kommt deshalb aus derselben Stelle: pu_coder_kurs().
 */

require_once PU_ROOT . '/srv/coder.php';

/** Der Port der Werkstatt (werkzeuge/starten.mjs, Vorgabe). */
const PU_WERKSTATT_PORT = 3081;

/** So lange gilt ein Ticket. Kurz: Es soll nur den Start tragen, nicht liegen bleiben. */
const PU_WERKSTATT_TICKET_SEK = 120;

/** Der Werkstatt-Ordner. Tests legen ihn über PU_TEST_WERKSTATT um. */
function pu_werkstatt_ordner(): string
{
    $t = getenv('PU_TEST_WERKSTATT');
    return is_string($t) && $t !== '' ? $t : PU_ROOT . '/werkstatt';
}

/** Die Ticketdatei. Tests legen sie über PU_TEST_WERKSTATT_TICKET um. */
function pu_werkstatt_ticket_pfad(): string
{
    $t = getenv('PU_TEST_WERKSTATT_TICKET');
    return is_string($t) && $t !== '' ? $t : PU_ROOT . '/data/werkstatt/ticket.json';
}

/**
 * Ist die Werkstatt auf diesem Rechner eingerichtet?
 *
 * Drei Dinge müssen da sein: der Harness, seine Abhängigkeiten, das Profil.
 * Fehlt eines, hilft `werkstatt/WERKSTATT-EINRICHTEN.bat`.
 */
function pu_werkstatt_eingerichtet(): bool
{
    $w = pu_werkstatt_ordner();
    return is_file($w . '/deepseek-harness/apps/cli/src/bin.ts')
        && is_dir($w . '/deepseek-harness/node_modules')
        && is_file($w . '/.dsh/profiles/promptheus/package.json');
}

/** Läuft schon eine Werkstatt? Eine schlichte Verbindung auf den Port. */
function pu_werkstatt_laeuft(): bool
{
    $s = @fsockopen('127.0.0.1', PU_WERKSTATT_PORT, $nr, $txt, 0.4);
    if ($s === false) return false;
    fclose($s);
    return true;
}

/**
 * Darf dieser Lernende die Werkstatt öffnen — und wenn nicht, warum nicht.
 *
 *   betreiber   frei ohne Kurs (Ebene admin, siehe pu_token_frei())
 *   …           sonst der Weg über die Stufen und den 7. Kurs, pu_kurs7_weg():
 *               stufen_offen, kurs_fehlt, kurs_leer, kurs_offen, test, kurs
 */
function pu_werkstatt_stand(int $lernender): array
{
    require_once PU_ROOT . '/srv/abo.php';
    require_once PU_ROOT . '/srv/kursstand.php';

    $aus = [
        'frei'         => false,
        'grund'        => '',
        'prozent'      => 0,
        'kurs'         => null,
        'eingerichtet' => pu_werkstatt_eingerichtet(),
        'laeuft'       => false,
        'port'         => PU_WERKSTATT_PORT,
    ];

    if (pu_token_frei($lernender)) {
        $aus['laeuft'] = pu_werkstatt_laeuft();
        return ['frei' => true, 'grund' => 'betreiber'] + $aus;
    }

    $weg = pu_kurs7_weg($lernender);
    if ($weg['frei']) $aus['laeuft'] = pu_werkstatt_laeuft();
    return $weg + $aus;
}

/**
 * Stellt ein Ticket aus. Nur nach pu_werkstatt_stand()['frei'] aufrufen.
 *
 * `$academy` ist der Ursprung dieser Academy (`http://127.0.0.1:8801`), damit
 * die Werkstatt weiss, wohin ihr Knopf „Community“ führt.
 *
 * Geschrieben wird atomar (temporär + umbenennen), damit starten.mjs nie eine
 * halbe Datei liest. Die Lernenden-ID steht darin für das Protokoll, nicht für
 * eine Anmeldung: Die Werkstatt hat ihre eigene.
 */
function pu_werkstatt_ticket(int $lernender, string $academy = ''): array
{
    $pfad = pu_werkstatt_ticket_pfad();
    $dir  = dirname($pfad);
    if (!is_dir($dir) && !@mkdir($dir, 0700, true) && !is_dir($dir)) {
        throw new RuntimeException('Ticket-Ordner nicht anlegbar: ' . $dir);
    }

    $ticket = [
        'nonce'     => bin2hex(random_bytes(16)),
        'lernender' => $lernender,
        'ablauf'    => time() + PU_WERKSTATT_TICKET_SEK,
    ];
    // Wo diese Academy läuft: Der Knopf „Community“ der Werkstatt leitet
    // dorthin zurück (community_oeffnen). Nur dieser Rechner, nie ein fremder.
    if (preg_match('#^http://(127\.0\.0\.1|localhost):\d{1,5}\z#', $academy)) {
        $ticket['academy'] = $academy;
    }
    $tmp = $pfad . '.' . bin2hex(random_bytes(4)) . '.tmp';
    if (file_put_contents($tmp, json_encode($ticket), LOCK_EX) === false || !rename($tmp, $pfad)) {
        @unlink($tmp);
        throw new RuntimeException('Ticket nicht schreibbar.');
    }
    @chmod($pfad, 0600);
    return $ticket;
}

/**
 * Startet die Werkstatt im eigenen Fenster (Windows) bzw. im Hintergrund.
 *
 * Der Harness öffnet danach selbst den Browser — mit seinem Zugangstoken in
 * der Adresse. Diese Adresse kennt nur er; die Academy öffnet deshalb nichts.
 *
 * **Windows: ohne geerbte Handles.** Ein Kind von `popen`/`proc_open` erbt
 * alle vererbbaren Handles dieses PHP-Servers, auch den lauschenden Socket
 * auf Port 8801. `start` gibt sie weiter. Lief die Werkstatt länger als die
 * Academy, hielt sie den alten Socket fest: Die neu gestartete Academy lauschte
 * daneben, der Browser landete aber beim alten Socket, und niemand antwortete
 * (gemessen am 03.10.2026). `Start-Process` ohne Umleitung startet über die
 * Shell, und dabei erbt das Kind nichts. Die PowerShell dazwischen erbt den
 * Socket zwar auch, ist aber nach einem Augenblick wieder weg.
 */
function pu_werkstatt_starten(): void
{
    $w = pu_werkstatt_ordner();
    if (PHP_OS_FAMILY === 'Windows') {
        $bat = str_replace('/', '\\', $w . '/WERKSTATT-START.bat');
        // Einfache Anführungszeichen sind in PowerShell der einzige Sonderfall
        // in '…': verdoppeln. Den Fenstertitel setzt die Batch-Datei selbst.
        $ps = "Start-Process -FilePath 'cmd.exe' -WindowStyle Minimized "
            . "-WorkingDirectory '" . str_replace("'", "''", str_replace('/', '\\', $w)) . "' "
            . "-ArgumentList '/c', '\"" . str_replace("'", "''", $bat) . "\"'";
        $h = proc_open(['powershell.exe', '-NoProfile', '-NonInteractive', '-Command', $ps],
            [1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $rohr);
        if (is_resource($h)) {
            fclose($rohr[1]);
            fclose($rohr[2]);
            proc_close($h);
        }
        return;
    }
    $cmd = 'cd ' . escapeshellarg($w) . ' && nohup node werkzeuge/starten.mjs >/dev/null 2>&1 &';
    exec($cmd);
}

/**
 * Beendet die laufende Werkstatt — und nur sie.
 *
 * Für den Fall, dass ihr Browserfenster weg ist: Die Adresse mit dem
 * Zugangstoken kennt nur der Harness, und ohne Token lässt er niemanden
 * hinein („dsh web authentication required“). Dann hilft nur ein Neustart.
 *
 * Beendet wird der Prozess auf dem Port, aber nur, wenn er wirklich die
 * Werkstatt ist (`--profile promptheus`). Mit ihm gehen Starter und Fenster,
 * aus denen er kam (`starten.mjs`, `WERKSTATT-START.bat`), damit kein
 * verwaistes Konsolenfenster mit „Werkstatt beendet“ stehen bleibt.
 *
 * @return array ok + beendet (bool); sonst grund: fremd (etwas anderes auf
 *               dem Port), haengt (Port nach dem Beenden noch belegt),
 *               nicht_windows
 */
function pu_werkstatt_beenden(int $port = PU_WERKSTATT_PORT, float $warten = 8.0): array
{
    if (PHP_OS_FAMILY !== 'Windows') {
        return ['ok' => false, 'grund' => 'nicht_windows'];
    }
    // Feste Befehlsfolge; eingesetzt wird nur die Portnummer (eine Zahl).
    $skript = <<<PS
\$c = Get-NetTCPConnection -LocalPort {$port} -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not \$c) { 'frei'; exit 0 }
\$p = Get-CimInstance Win32_Process -Filter "ProcessId=\$(\$c.OwningProcess)"
if (-not \$p -or \$p.CommandLine -notmatch '--profile promptheus') { 'fremd'; exit 0 }
\$wurzel = \$p; \$q = \$p
for (\$i = 0; \$i -lt 4; \$i++) {
  \$q = Get-CimInstance Win32_Process -Filter "ProcessId=\$(\$q.ParentProcessId)" -ErrorAction SilentlyContinue
  if (-not \$q -or (\$q.CommandLine -notmatch 'starten\.mjs|WERKSTATT-START\.bat')) { break }
  \$wurzel = \$q
}
& taskkill.exe /PID \$wurzel.ProcessId /T /F | Out-Null
'beendet'
PS;
    $h = proc_open(['powershell.exe', '-NoProfile', '-NonInteractive', '-Command', $skript],
        [1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $rohr);
    if (!is_resource($h)) {
        return ['ok' => false, 'grund' => 'haengt'];
    }
    $aus = trim((string)stream_get_contents($rohr[1]));
    fclose($rohr[1]);
    fclose($rohr[2]);
    proc_close($h);
    $letzte = trim((string)strrchr("\n" . $aus, "\n"));

    if ($letzte === 'frei') {
        return ['ok' => true, 'beendet' => false];
    }
    if ($letzte === 'fremd') {
        return ['ok' => false, 'grund' => 'fremd'];
    }
    // Warten, bis der Port wirklich frei ist — sonst scheitert der Neustart.
    $bis = microtime(true) + $warten;
    while (microtime(true) < $bis) {
        $s = @fsockopen('127.0.0.1', $port, $nr, $txt, 0.3);
        if ($s === false) {
            return ['ok' => true, 'beendet' => true];
        }
        fclose($s);
        usleep(200000);
    }
    return ['ok' => false, 'grund' => 'haengt'];
}
