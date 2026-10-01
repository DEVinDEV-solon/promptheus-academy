<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — JSON-Schnittstelle.
 *
 * Der einzige Weg an den Lehrstoff. `router.php` weist `brain/` ueber HTTP mit
 * 403 ab; alles, was die Oberfläche sieht, kommt durch diese Datei — und damit
 * durch die Anmeldung und durch `pu_aufgabe_oeffentlich()`, das Lösung,
 * Hinweise und Erklärung heraussiebt.
 *
 * **Zwei Aktionen sind absichtlich ohne Anmeldung erreichbar:**
 *   `anmelden`        — sonst käme niemand hinein
 *   `urkunde_pruefen` — ein Dritter soll eine Urkunde pruefen können, ohne
 *                       ein Konto zu haben. Die Antwort nennt keinen Namen.
 *
 * `tests/api_abgleich_test.php` prueft, dass jede in `assets/*.js` gerufene
 * Aktion hier einen Zweig hat. Diese eine Prüfung faengt die Drift ab, die
 * sich sonst erst im Fenster zeigt — als "Antwort war kein JSON".
 */

require_once __DIR__ . '/lib.php';
require_once __DIR__ . '/srv/db.php';
require_once __DIR__ . '/srv/rechte.php';
require_once __DIR__ . '/srv/kurse.php';
require_once __DIR__ . '/srv/kursbild.php';
require_once __DIR__ . '/srv/bewertung.php';
require_once __DIR__ . '/srv/punkte.php';
require_once __DIR__ . '/srv/badges.php';
require_once __DIR__ . '/srv/pruefung.php';
require_once __DIR__ . '/srv/zertifikat.php';
require_once __DIR__ . '/srv/abschluss.php';
require_once __DIR__ . '/srv/lernende.php';
require_once __DIR__ . '/srv/brain.php';
require_once __DIR__ . '/srv/tutor.php';
require_once __DIR__ . '/srv/einstellungen.php';
require_once __DIR__ . '/srv/medien.php';
require_once __DIR__ . '/srv/motivation.php';
require_once __DIR__ . '/srv/tokenicer.php';
require_once __DIR__ . '/srv/kursstand.php';
require_once __DIR__ . '/srv/profil.php';
require_once __DIR__ . '/srv/abo.php';
require_once __DIR__ . '/srv/glossar.php';
require_once __DIR__ . '/srv/sprache.php';
require_once __DIR__ . '/srv/stimme.php';
require_once __DIR__ . '/srv/persona.php';
require_once __DIR__ . '/srv/katalog.php';
require_once __DIR__ . '/srv/raenge.php';
require_once __DIR__ . '/srv/coder.php';
require_once __DIR__ . '/srv/werkstatt.php';
require_once __DIR__ . '/srv/relay.php';
require_once __DIR__ . '/srv/gemeinde.php';
require_once __DIR__ . '/srv/aktualisierung.php';

header('X-Content-Type-Options: nosniff');

$aktion = (string)($_POST['aktion'] ?? $_GET['aktion'] ?? '');
$roh    = file_get_contents('php://input');
$body   = ($roh !== false && $roh !== '') ? json_decode($roh, true) : null;
if (is_array($body) && isset($body['aktion'])) $aktion = (string)$body['aktion'];
$D = is_array($body) ? $body : $_POST;

/** Feldzugriff mit Vorgabe. */
function d(string $name, $vorgabe = '')
{
    global $D;
    return $D[$name] ?? $vorgabe;
}

/**
 * Weiterleiten statt JSON — nur für `community_oeffnen`, das der Browser als
 * Seite öffnet (Knopf der Werkstatt). Kein Referer, nichts im Zwischenspeicher:
 * Das Ziel trägt eine Einlassmarke.
 */
function api_umleiten(string $ziel): never
{
    header('Cache-Control: no-store');
    header('Referrer-Policy: no-referrer');
    header('Location: ' . $ziel, true, 302);
    exit;
}

try {
    // ============================================================ ohne Anmeldung
    switch ($aktion) {
        case 'zustand':
            $w = pu_wer();
            pu_json_out([
                'ok'          => true,
                'angemeldet'  => $w !== null,
                'leer'        => pu_leer(),
                'wer'         => $w === null ? null : [
                    'id' => (int)$w['id'], 'name' => $w['anzeigename'],
                    'kennung' => $w['kennung'], 'rolle' => $w['rolle'],
                ],
                'tutor_bereit' => pu_tutor_bereit(),
            ]);

        case 'anmelden':
            $ok = pu_anmelden((string)d('kennung'), (string)d('kennwort'));
            if (!$ok) pu_fehler('Kennung oder Kennwort stimmt nicht.', 401);
            $w = pu_wer();
            pu_json_out(['ok' => true, 'wer' => [
                'id' => (int)$w['id'], 'name' => $w['anzeigename'],
                'kennung' => $w['kennung'], 'rolle' => $w['rolle'],
            ]]);

        case 'einrichten':
            // Nur solange es kein Konto gibt. Das erste Konto ist Schüler
            // (Entscheid 28.09.2026): Die Adminrolle des Kunden entsteht nur
            // durch die Registrierung (relay_registrieren), nie hier. Vorher
            // stand hier 'admin' — jede Installation hatte damit eine
            // Plattform-Rolle, ohne dass jemand bezahlt hatte.
            if (!pu_leer()) pu_fehler('Die Academy ist bereits eingerichtet.', 403);
            $id = pu_lernenden_anlegen(
                (string)d('kennung'), (string)d('anzeigename'), (string)d('kennwort'), 'schueler'
            );
            pu_anmelden((string)d('kennung'), (string)d('kennwort'));
            pu_json_out(['ok' => true, 'id' => $id]);

        case 'urkunde_pruefen':
            pu_json_out(['ok' => true, 'ergebnis' => pu_urkunde_pruefen((string)d('code', $_GET['code'] ?? ''))]);

    }

    // ============================================================ ab hier Anmeldung
    $ich = pu_wer();
    // Der Knopf „Community“ der Werkstatt öffnet eine Seite, keinen Abruf:
    // ohne Anmeldung zur Anmeldung, nicht zu einem JSON-Fehler.
    if ($ich === null && $aktion === 'community_oeffnen') api_umleiten('./');
    if ($ich === null) pu_fehler('Bitte anmelden.', 401);
    $ichId = (int)$ich['id'];

    // Es gibt kein `if ($rolle === ...)` mehr. Wer was darf, steht in der
    // Rechte-Matrix (srv/rechte.php) — hier wird nur gefragt.
    $ebene = pu_ebene($ich);

    switch ($aktion) {

        // ---------------------------------------------------------- Konto
        case 'abmelden':
            pu_abmelden();
            pu_json_out(['ok' => true]);

        case 'kennwort_aendern':
            pu_kennwort_setzen($ichId, (string)d('neu'), $ichId);
            pu_json_out(['ok' => true]);

        // ---------------------------------------------------------- Kurse
        case 'kurse': {
            pu_recht_fordern('dashboard.view');
            $index = pu_index();
            $stand = pu_stand($ichId);
            $liste = [];
            foreach ($index['kurse'] as $pfad => $k) {
                /* Ein Zusatzkurs wird erst frei, wenn ALLE Stufen bestanden
                   sind — er ist der Abschluss, kein Wahlkurs nebenher. Wer den
                   Stoff pflegt, kommt trotzdem hinein: sonst liesse sich ein
                   Kurs nicht Korrektur lesen, bevor ihn jemand erreicht. */
                $frei = pu_kurs_frei($ichId, $k) || pu_recht_hat('lektionen.manage');
                $gel  = 0; $ges = 0;
                foreach ($k['lektionen'] as $l) {
                    foreach ($l['aufgaben'] as $a) {
                        $ges++;
                        if (!empty($stand['gelöst'][$a['id']]['richtig'])) $gel++;
                    }
                }
                $liste[] = [
                    'pfad' => $pfad, 'art' => $k['art'], 'code' => $k['code'],
                    'titel' => $k['titel'], 'untertitel' => $k['untertitel'],
                    'stufe' => $k['stufe'], 'dauer_h' => $k['dauer_h'],
                    'geruest' => $k['geruest'], 'frei' => $frei,
                    'lektionen' => count($k['lektionen']),
                    'aufgaben_ges' => $ges, 'aufgaben_geloest' => $gel,
                    'punkte_max' => $k['punkte_max'],
                    'hat_pruefung' => $k['pruefung'] !== null,
                    'bestanden' => $k['art'] === 'stufe' && pu_stufe_bestanden($ichId, (int)$k['stufe']),
                    // Leer, wenn es kein Bild gibt — die Karte bleibt dann
                    // schlicht, statt eine gebrochene Fläche zu zeigen.
                    'bild' => pu_kursbild($pfad),
                ];
            }
            pu_json_out(['ok' => true, 'kurse' => $liste, 'stand' => $stand,
                         'challenge_bild' => pu_kursbild_datei('challenge'),
                         'fehler_im_stoff' => pu_recht_hat('lektionen.manage') ? $index['fehler'] : []]);
        }

        /* Der Stand der beiden letzten Menüpunkte: „Der 7. Kurs" und
           „Werkstatt". Beide stehen immer im Menü und schalten sich frei,
           wenn der Weg so weit ist — sechs Stufen, dann der 7. Kurs zu 100 %.
           Ob wirklich geöffnet werden darf, prüfen `kurs` und
           `werkstatt_oeffnen` selbst; das hier ist nur die Anzeige. */
        case 'werkstatt_menue': {
            pu_recht_fordern('dashboard.view');
            $k7 = pu_coder_kurs();
            $w  = pu_werkstatt_stand($ichId);
            pu_json_out(['ok' => true,
                'kurs7' => [
                    'frei' => $k7 !== null && (pu_kurs_frei($ichId, $k7) || pu_recht_hat('lektionen.manage')),
                    'pfad' => $k7['pfad'] ?? '',
                ],
                'werkstatt' => $w,
                // Ohne Registrierung oder Abo zeigt das Fenster das Werbe-Modal (C1).
                'zugang' => pu_gem_zugang($ichId, true),
            ]);
        }

        case 'kurs': {
            pu_recht_fordern('dashboard.view');
            $k = pu_kurs((string)d('pfad'));
            if ($k === null) pu_fehler('Diesen Kurs gibt es nicht.', 404);
            if (!pu_kurs_frei($ichId, $k) && !pu_recht_hat('lektionen.manage')) {
                pu_fehler('Dieser Kurs ist noch nicht freigeschaltet.', 403);
            }
            $stand = pu_geloest($ichId);
            $lek = [];
            foreach ($k['lektionen'] as $l) {
                $lek[] = [
                    'pfad' => $l['pfad'], 'titel' => $l['titel'],
                    'beschreibung' => $l['beschreibung'], 'dauer_min' => $l['dauer_min'],
                    'aufgaben' => count($l['aufgaben']),
                    'gelöst'  => count(array_filter($l['aufgaben'],
                                    fn($a) => !empty($stand[$a['id']]['richtig']))),
                ];
            }
            pu_json_out(['ok' => true, 'kurs' => [
                'pfad' => $k['pfad'], 'titel' => $k['titel'], 'untertitel' => $k['untertitel'],
                'code' => $k['code'], 'stufe' => $k['stufe'], 'dauer_h' => $k['dauer_h'],
                'geruest' => $k['geruest'], 'kopf' => pu_glossar_verlinken(pu_ohne_erste_h1(pu_md($k['kopf']))),
                'bestehen_prozent' => $k['bestehen_prozent'],
                'hat_pruefung' => $k['pruefung'] !== null,
                'bestanden' => pu_stufe_bestanden($ichId, (int)$k['stufe']),
                'lektionen' => $lek,
                'medien'    => pu_medien_kurs($k['pfad'], pu_medien_zielgruppe($ich)),
            ]]);
        }

        case 'lektion': {
            pu_recht_fordern('dashboard.view');
            $rel  = (string)d('pfad');
            $kurs = pu_kurs(dirname($rel));
            if ($kurs === null) pu_fehler('Diese Lektion gehört zu keinem Kurs.', 404);
            if (!pu_kurs_frei($ichId, $kurs) && !pu_recht_hat('lektionen.manage')) {
                pu_fehler('Dieser Kurs ist noch nicht freigeschaltet.', 403);
            }

            $lek = null;
            foreach ($kurs['lektionen'] as $l) if ($l['pfad'] === $rel) $lek = $l;
            if ($lek === null) pu_fehler('Diese Lektion gibt es nicht.', 404);

            $stand  = pu_geloest($ichId);

            // Das Niveau des Lernenden (einfach|normal|fachlich) bestimmt, welche
            // Fassung von Prosa und Aufgaben er bekommt — dieselbe Wahrheit,
            // seine Ansprache.
            $niveau = pu_niveau(pu_profil($ichId));

            // Der Rumpf wird OHNE die Aufgabenblöcke gerendert — die Aufgaben
            // kommen getrennt und gesiebt. Stuende der Block im Text, gaebe der
            // Server die Lösung im Klartext mit heraus.
            $rumpfquelle = pu_lektion_rumpf($lek, $niveau);
            $rumpf = preg_replace_callback(
                '/^```aufgabe[ \t]*\r?\n(.*?)^```[ \t]*$/ms',
                function (array $m): string {
                    preg_match('/^id:\s*(\S+)/m', $m[1], $t);
                    return "\n<<<AUFGABE:" . ($t[1] ?? '') . ">>>\n";
                },
                $rumpfquelle
            ) ?? $rumpfquelle;

            // Fachbegriffe werden anklickbar. Erst rendern, dann verlinken:
            // im Markdown stünde der Begriff auch in Codeblöcken.
            $html = pu_glossar_verlinken(pu_ohne_erste_h1(pu_md($rumpf)));
            $html = preg_replace('#<p>&lt;&lt;&lt;AUFGABE:([A-Za-z0-9_-]+)&gt;&gt;&gt;</p>#',
                '<div class="aufgabe-platz" data-aufgabe="$1"></div>', $html) ?? $html;

            $aufgaben = [];
            foreach ($lek['aufgaben'] as $a) {
                $oeff = pu_aufgabe_oeffentlich(pu_aufgabe_fuer_niveau($a, $niveau));
                $oeff['stand'] = $stand[$a['id']] ?? null;
                $aufgaben[] = $oeff;
            }

            pu_fortschritt_setzen($ichId, $kurs['pfad'], $rel, 'laufend');

            // Nachbarn mitgeben: der übliche Weg durch einen Kurs ist vorwärts.
            // Ohne diese zwei Zeilen müsste jeder, der eine Lektion zu Ende
            // hat, über die Kursübersicht — für den Normalfall ein Umweg.
            $nummer = 0; $vorige = null; $naechste = null;
            foreach (array_values($kurs['lektionen']) as $i => $x) {
                if ($x['pfad'] !== $rel) continue;
                $nummer = $i + 1;
                $v = $kurs['lektionen'][$i - 1] ?? null;
                $n = $kurs['lektionen'][$i + 1] ?? null;
                if ($v) $vorige   = ['pfad' => $v['pfad'], 'titel' => $v['titel'], 'nr' => $i];
                if ($n) $naechste = ['pfad' => $n['pfad'], 'titel' => $n['titel'], 'nr' => $i + 2];
            }

            pu_json_out(['ok' => true, 'lektion' => [
                'pfad' => $rel, 'titel' => $lek['titel'], 'kurs' => $kurs['pfad'],
                'kurs_titel' => $kurs['titel'], 'dauer_min' => $lek['dauer_min'],
                'nr' => $nummer, 'vorige' => $vorige, 'naechste' => $naechste,
                'html' => $html, 'aufgaben' => $aufgaben,
                'medien' => pu_medien_lektion($kurs['pfad'], $rel, pu_medien_zielgruppe($ich)),
            ]]);
        }

        // ---------------------------------------------------------- Aufgaben
        case 'hinweis': {
            pu_recht_fordern('lernen.ausfuehren');
            if (!pu_regel_an('hinweise_erlaubt')) pu_fehler('Hinweise sind abgeschaltet.', 403);
            $a = pu_aufgabe((string)d('id'));
            if ($a === null) pu_fehler('Diese Aufgabe gibt es nicht.', 404);
            $a = pu_aufgabe_fuer_niveau($a, pu_niveau(pu_profil($ichId)));
            $nr = max(0, (int)d('nr', 0));
            $liste = array_values((array)($a['hinweise'] ?? []));
            if (!isset($liste[$nr])) pu_fehler('Mehr Hinweise gibt es nicht.', 404);
            pu_protokoll($ichId, 'hinweis', (string)$a['id'], 'Nr. ' . ($nr + 1));
            pu_json_out(['ok' => true, 'text' => (string)$liste[$nr]['text'],
                         'kostet' => (int)($liste[$nr]['kostet'] ?? 0)]);
        }

        case 'loesung_zeigen': {
            pu_recht_fordern('lernen.ausfuehren');
            if (!pu_regel_an('loesung_erlaubt')) pu_fehler('Die Musterlösung ist abgeschaltet.', 403);
            $a = pu_aufgabe((string)d('id'));
            if ($a === null) pu_fehler('Diese Aufgabe gibt es nicht.', 404);
            $a = pu_aufgabe_fuer_niveau($a, pu_niveau(pu_profil($ichId)));
            pu_protokoll($ichId, 'loesung_gezeigt', (string)$a['id'], '');
            pu_json_out(['ok' => true,
                'loesung'    => $a['loesung'] ?? null,
                'zeilen'     => $a['zeilen'] ?? null,
                'erklaerung' => (string)($a['erklaerung'] ?? ''),
            ]);
        }

        case 'abgeben': {
            pu_recht_fordern('lernen.ausfuehren');
            $a = pu_aufgabe((string)d('id'));
            if ($a === null) pu_fehler('Diese Aufgabe gibt es nicht.', 404);
            // Niveau des Lernenden: passt Erklärung und Lob an — die Bewertung
            // rechnet weiter gegen die kanonische Lösung, die unberührt bleibt.
            // Das Altersband ist feiner als das Niveau und wählt den Ton des Lobs.
            $prof   = pu_profil($ichId);
            $niveau = pu_niveau($prof);
            $band   = pu_altersband($prof);
            $a = pu_aufgabe_fuer_niveau($a, $niveau);

            $antwort  = d('antwort', null);
            $hinweise = max(0, (int)d('hinweise', 0));
            $loesung  = (bool)d('loesung_gesehen', false);
            $dauer    = max(0, (int)d('dauer_s', 0));

            $bew = pu_bewerten($a, $antwort);
            $pkt = pu_punkte_rechnen($bew, $hinweise, $loesung, $dauer, $a);
            $erg = pu_versuch_eintragen($ichId, $a, $antwort, $bew, $pkt, $hinweise, $loesung, $dauer);

            // Athenas Anmerkung — nach der Bewertung, ohne Einfluss auf sie.
            $anmerkung = '';
            if ($a['typ'] === 'planung' && (bool)d('anmerkung', true)) {
                $anmerkung = pu_athena_anmerkung($ichId, $a,
                    is_scalar($antwort) ? (string)$antwort : (string)json_encode($antwort), $bew);
            }

            pu_json_out(['ok' => true,
                'richtig'      => $bew['richtig'],
                'punkte'       => $pkt['punkte'],
                'max'          => $bew['max'],
                'abzug'        => $pkt['abzug'],
                'bonus'        => $pkt['bonus'],
                'teil'         => $bew['teil'],
                'rueckmeldung' => $bew['rueckmeldung'],
                'erklaerung'   => $bew['richtig'] ? (string)($a['erklaerung'] ?? '') : '',
                'anmerkung'    => $anmerkung,
                'konto'        => $erg['konto'],
                'titel_neu'    => $erg['titel_neu'],
                'serie'        => $erg['serie'],
                'neue_badges'  => $erg['neue_badges'],
                'tagesbonus'   => $erg['tagesbonus'],

                // Der Spruch kommt aus dem Vault und ohne Sprachmodell — ein
                // Lob, das erst nach zwei Sekunden erscheint, ist keins. Bei
                // jeder Antwort ein frischer, altersgerechter Satz; der zuletzt
                // gezeigte (vom Browser mitgeschickt) wird vermieden.
                'motivation'   => $bew['richtig']
                    ? pu_motivation($band, (string)d('letzte_motivation', '')) : '',

                // Ob "Weitere Infos" angeboten wird, entscheidet der Server:
                // die Vertiefung braucht die CLI, und der Knopf soll nicht
                // dastehen, wenn dahinter nur eine Fehlermeldung wartet.
                'vertiefung_moeglich' => $bew['richtig'] && pu_tutor_bereit() && pu_regel_an('weitere_infos'),
            ]);
        }

        // ---------------------------------------------------------- Prüfung
        case 'pruefung_start': {
            pu_recht_fordern('pruefung.ausfuehren');
            $k = pu_kurs((string)d('pfad'));
            if ($k === null || $k['pruefung'] === null) pu_fehler('Zu diesem Kurs gibt es keine Prüfung.', 404);
            if (!pu_kurs_frei($ichId, $k) && !pu_recht_hat('lektionen.manage')) {
                pu_fehler('Dieser Kurs ist noch nicht freigeschaltet.', 403);
            }
            $aufgaben = array_map('pu_aufgabe_oeffentlich', $k['pruefung']['aufgaben']);
            pu_protokoll($ichId, 'pruefung_start', $k['pfad'], '');
            pu_json_out(['ok' => true, 'pruefung' => [
                'kurs' => $k['pfad'], 'titel' => $k['pruefung']['titel'],
                // Für die Pfadleiste: sie soll den Kurs beim Namen nennen und
                // nicht „Kurs" schreiben, wenn der Name bekannt ist.
                'kurs_titel' => $k['titel'],
                'stufe' => $k['stufe'], 'bestehen_prozent' => $k['bestehen_prozent'],
                'html' => pu_glossar_verlinken(pu_ohne_erste_h1(pu_md(preg_replace('/^```aufgabe[ \t]*\r?\n.*?^```[ \t]*$/ms', '', $k['pruefung']['rumpf']) ?? ''))),
                'aufgaben' => $aufgaben,
            ]]);
        }

        case 'pruefung_abgeben': {
            pu_recht_fordern('pruefung.ausfuehren');
            $antworten = (array)d('antworten', []);
            pu_json_out(['ok' => true,
                'ergebnis' => pu_pruefung_abnehmen($ichId, (string)d('pfad'), $antworten)]);
        }

        // ---------------------------------------------------------- Fortschritt
        //
        // Der Stand in EINEM Kurs — die Antwort auf die Fragen neben der
        // Lektion. Gerechnet, nicht erzählt: siehe srv/kursstand.php.
        case 'kurs_stand':
            pu_recht_fordern('fortschritt.eigen');
            pu_json_out(['ok' => true, 'stand' => pu_kurs_stand($ichId, (string)d('pfad'))]);

        case 'stand':
            pu_recht_fordern('fortschritt.eigen');
            // Rang und Abzeichen kommen je Ebene verschieden: ein Elternteil
            // löst keine Aufgaben, und „Funke, 0 Punkte" wäre für ihn eine
            // Auszeichnung für etwas, das er gar nicht tun soll.
            pu_json_out(['ok' => true, 'stand' => pu_stand($ichId),
                         'tagesaufgabe' => pu_tagesaufgabe($ichId),
                         'rang'      => pu_rang($ichId, $ebene),
                         'abzeichen' => pu_abzeichen($ichId, $ebene),
                         // Die Tokenlage hängt hier mit dran, weil `stand`
                         // ohnehin beim Laden gerufen wird. Ein eigener Aufruf
                         // dafür wäre eine zweite Runde für eine Zahl, die
                         // niemand einzeln braucht — und die Warnung soll da
                         // sein, bevor jemand gegen die Grenze läuft, nicht
                         // erst danach.
                         'token'     => pu_token_lage($ichId),
                         // Ob ein Vorlese-Knopf überhaupt erscheinen darf.
                         // Beides muss stimmen: eingeschaltet UND erlaubt.
                         'stimme'    => pu_stimme_an() && pu_recht_hat('stimme.nutzen')]);

        case 'urkunde_html': {
            $code = (string)d('code', $_GET['code'] ?? '');
            $meine = array_column(pu_urkunden($ichId), 'pruefcode');
            if (!pu_recht_hat('urkunde.ausstellen') && !in_array(strtoupper(trim($code)), $meine, true)) {
                pu_fehler('Das ist nicht deine Urkunde.', 403);
            }
            $html = pu_urkunde_html($code);
            if ($html === null) pu_fehler('Zu diesem Code gibt es keine Urkunde.', 404);
            header('Content-Type: text/html; charset=utf-8');
            header('Cache-Control: no-store');
            echo $html;
            exit;
        }

        // ---------------------------------------------------------- Abschluss-Urkunde
        //
        // Nach allen sechs Stufen, mit dem echten Namen (srv/abschluss.php).
        // Ohne Sprachmodell und ohne Server: der Name bleibt auf diesem
        // Rechner und liegt nur verschlüsselt in der Datenbank.
        case 'abschluss_stand':
            pu_recht_fordern('fortschritt.eigen');
            pu_json_out(['ok' => true, 'abschluss' => pu_abschluss_stand($ichId)]);

        case 'abschluss_ausstellen': {
            // Nicht `pruefung.ausfuehren`: die Tür ist das Bestehen aller sechs
            // Stufen (pu_abschluss_lauf). Wer einen Stand hat, darf die Urkunde
            // dazu holen — auch ein Elternkonto im Testbetrieb.
            pu_recht_fordern('fortschritt.eigen');
            try {
                $u = pu_abschluss_ausstellen($ichId, (string)d('vorname'), (string)d('nachname'),
                                             (string)d('bestaetigung'), (string)d('variante'),
                                             (array)d('design', []));
            } catch (InvalidArgumentException | DomainException $e) {
                pu_fehler($e->getMessage(), 400);
            } catch (RuntimeException $e) {
                pu_fehler($e->getMessage(), 409);
            }
            pu_json_out(['ok' => true, 'urkunde' => $u]);
        }

        // Schritt 1 und 3: Vorlagen, Musterseite, eigene Gestaltung. Die
        // Gestaltung gehört dem Teilnehmer; Name und Prüfcode bleiben fest.
        case 'abschluss_vorlagen':
            pu_recht_fordern('fortschritt.eigen');
            pu_json_out(['ok' => true, 'gruppen' => pu_urkunden_varianten(),
                         'schriften' => pu_urkunden_schriften()]);

        case 'abschluss_muster': {
            pu_recht_fordern('fortschritt.eigen');
            $html = pu_abschluss_muster((string)d('variante', $_GET['variante'] ?? ''));
            if ($html === null) pu_fehler('Dieses Design gibt es nicht.', 404);
            header('Content-Type: text/html; charset=utf-8');
            header('Cache-Control: no-store');
            echo $html;
            exit;
        }

        case 'abschluss_design_setzen': {
            pu_recht_fordern('fortschritt.eigen');
            try {
                $neu = pu_abschluss_design_setzen($ichId, (string)d('code'), (string)d('variante'),
                                                  (array)d('design', []));
            } catch (InvalidArgumentException | DomainException $e) {
                pu_fehler($e->getMessage(), 400);
            }
            pu_json_out(['ok' => true, 'design' => $neu]);
        }

        case 'abschluss_gedruckt':
            // Bewacht sich selbst wie abschluss_html: wer öffnen darf, darf drucken.
            pu_json_out(['ok' => pu_abschluss_gedruckt((string)d('code'), pu_wer_echt() ?? $ich)]);

        // Einstellungen → Urkunden: Überblick, Sicherheit, Testbetrieb.
        case 'urkunden_uebersicht':
            pu_recht_fordern('fortschritt.eigen');
            pu_json_out(['ok' => true, 'uebersicht' => pu_urkunden_uebersicht(pu_wer_echt() ?? $ich)]);

        case 'urkunden_testbetrieb':
            pu_recht_fordern('urkunde.ausstellen');
            pu_urkunden_testbetrieb_setzen((bool)d('an', false), $ichId);
            pu_json_out(['ok' => true, 'an' => pu_urkunden_testbetrieb()]);

        case 'urkunden_test_bestehen': {
            pu_recht_fordern('urkunde.ausstellen');
            $ziel = (int)d('lernender');
            if (!pu_urkunden_testkonto_erlaubt(pu_wer_echt() ?? $ich, $ziel)) {
                pu_fehler('Dieses Konto liegt nicht in deinem Bereich.', 403);
            }
            try { pu_abschluss_test_bestehen($ziel, $ichId); }
            catch (InvalidArgumentException | DomainException $e) { pu_fehler($e->getMessage(), 400); }
            pu_json_out(['ok' => true]);
        }

        case 'urkunden_test_zuruecksetzen': {
            pu_recht_fordern('urkunde.ausstellen');
            $ziel = (int)d('lernender');
            if (!pu_urkunden_testkonto_erlaubt(pu_wer_echt() ?? $ich, $ziel)) {
                pu_fehler('Dieses Konto liegt nicht in deinem Bereich.', 403);
            }
            try { $weg = pu_abschluss_test_zuruecksetzen($ziel, $ichId); }
            catch (InvalidArgumentException | DomainException $e) { pu_fehler($e->getMessage(), 400); }
            pu_json_out(['ok' => true, 'entfernt' => $weg]);
        }

        case 'urkunden_test_kurs7': {
            pu_recht_fordern('urkunde.ausstellen');
            $ziel = (int)d('lernender');
            if (!pu_urkunden_testkonto_erlaubt(pu_wer_echt() ?? $ich, $ziel)) {
                pu_fehler('Dieses Konto liegt nicht in deinem Bereich.', 403);
            }
            try { pu_kurs7_test_setzen($ziel, (bool)d('an', true), $ichId); }
            catch (DomainException $e) { pu_fehler($e->getMessage(), 400); }
            pu_json_out(['ok' => true]);
        }

        case 'abschluss_liste':
            pu_recht_fordern('urkunde.nachdrucken');
            pu_json_out(['ok' => true, 'urkunden' => pu_abschluesse_umkreis(pu_wer_echt() ?? $ich)]);

        case 'abschluss_html': {
            // Bewacht sich selbst: der Lernende immer, sonst Recht UND Umkreis
            // (pu_abschluss_darf_sehen). Gefragt wird für den echten Menschen —
            // eine Rollenübernahme macht aus Ebene 1 keinen Schüler.
            $echt = pu_wer_echt() ?? $ich;
            try {
                $html = pu_abschluss_html((string)d('code', $_GET['code'] ?? ''), $echt);
            } catch (DomainException $e) {
                pu_fehler($e->getMessage(), 403);
            }
            if ($html === null) pu_fehler('Zu diesem Code gibt es keine Abschluss-Urkunde.', 404);
            header('Content-Type: text/html; charset=utf-8');
            header('Cache-Control: no-store');
            echo $html;
            exit;
        }

        // ---------------------------------------------------------- Tutor-Agenten
        case 'tutor_fragen': {
            pu_recht_fordern('tutor.fragen');
            if (!pu_tutor_bereit()) {
                pu_json_out(['ok' => false, 'fehler' =>
                    'Es ist kein Tutor-Modell eingerichtet. Alle Kurse und Aufgaben laufen trotzdem.']);
            }
            $kontext = [];

            // **Welcher Kurs gerade offen ist.** Ohne diese Angabe war „Was
            // lerne ich in diesem Kurs?" für das Modell eine Frage ohne
            // Gegenstand — es kannte den Kurs nicht und fragte zurück. Die
            // Kurskarte sammelte den Titel zwar ein, schickte ihn aber nie mit.
            //
            // Mitgeschickt wird der Pfad, nicht der Titel: aus dem Pfad kann
            // der Server den wirklichen Kurs laden. Ein Titel allein wäre eine
            // Behauptung des Browsers.
            $kurs = trim((string)d('kurs', ''));
            if ($kurs !== '') {
                $k = pu_kurs($kurs);
                // Dieselbe Schranke wie auf der Kursseite: eine gesperrte
                // Stufe wird auch dann nicht erzählt, wenn man danach fragt.
                if ($k !== null
                    && (pu_kurs_frei($ichId, $k) || pu_recht_hat('lektionen.manage'))) {
                    $kontext['kurs'] = pu_kurs_als_text($k);
                }
            }

            $lek = (string)d('lektion', '');
            if ($lek !== '') {
                $abs = pu_brain_pfad($lek);
                if ($abs !== null && is_file($abs)) {
                    $fm = pu_frontmatter((string)file_get_contents($abs));
                    // Aufgabenblöcke heraus: sie tragen die Lösung.
                    $kontext['lektion'] = preg_replace('/^```aufgabe[ \t]*\r?\n.*?^```[ \t]*$/ms', '', $fm['rumpf']) ?? '';
                }
            }
            // Sitzt der Lernende an einer bestimmten Aufgabe, kommt sie mit —
            // aber nur in der öffentlichen Fassung. Lösung, Hinweise und
            // Erklärung sind darin nicht enthalten, also kann das Modell sie
            // auch nicht ausplaudern: es kennt sie nicht. Das ist der
            // eigentliche Schutz, nicht die Bitte im Systemtext.
            $wegModus    = false;
            $mitLoesung  = false;

            // **Wer den Stoff pflegt, bekommt ihn ganz zu sehen.**
            //
            // `lektionen.manage` heisst wörtlich „Lektionen und Aufgaben pflegen,
            // Stoff prüfen". Wer das darf, prüft die Aufgabe — und kann das nicht,
            // solange der Tutor ihm Lösung, Hinweise und Erklärung verschweigt.
            // Genau darum ging es bei der Meldung, die Tutoren hätten im
            // Seiten-Chat „immer noch die Grenzen drin": Der Riegel sitzt doppelt,
            // einmal als Regel im Systemtext (`$wegModus`) und einmal dadurch,
            // dass `pu_aufgabe_oeffentlich()` die Lösung gar nicht erst
            // mitschickt. Beide müssen fallen, sonst fällt keiner.
            //
            // Für Lernende ändert sich nichts: Sie haben dieses Recht nicht, und
            // der eigentliche Schutz bleibt derselbe — was nicht im Kontext steht,
            // kann das Modell nicht ausplaudern.
            $pflegt = pu_recht_hat('lektionen.manage');

            $aufgabeId = trim((string)d('aufgabe', ''));
            if ($aufgabeId !== '') {
                $a = pu_aufgabe($aufgabeId);
                if ($a !== null) {
                    $stand = pu_geloest($ichId);
                    $geloest = !empty($stand[$aufgabeId]['richtig']);

                    // Vor der richtigen Antwort: Weg zeigen, Ziel verschweigen.
                    // Danach darf geredet werden — dann ist es Vertiefung.
                    // Wer den Stoff pflegt, ist von beidem ausgenommen.
                    $wegModus   = !$geloest && !$pflegt;
                    $mitLoesung = $geloest || $pflegt;

                    // Die volle Aufgabe nur für die Pflege, sonst die öffentliche
                    // Fassung ohne Lösung, Hinweise und Erklärung.
                    $kontext['aufgabe'] = pu_aufgabe_als_text(
                        $pflegt ? $a : pu_aufgabe_oeffentlich($a));

                    if ($mitLoesung && is_scalar($a['loesung'] ?? null)) {
                        $kontext['loesung'] = (string)$a['loesung'];
                    }
                }
            }

            $erg = pu_tutor_fragen($ichId, (string)d('agent', 'prometheus'),
                                   (string)d('frage'), $kontext, $mitLoesung, $wegModus);
            // `stopp` muss mit: ohne den Schlüssel käme im Browser nur der
            // Titel als roter Fehler an, und die beiden Wege zum Weitermachen
            // blieben unsichtbar. Die Antwort wird hier ja nicht durchgereicht,
            // sondern Feld für Feld neu gebaut — was nicht aufgezählt ist,
            // fällt weg.
            pu_json_out(['ok' => $erg['ok'], 'text' => $erg['text'],
                         'fehler' => $erg['fehler'], 'weg_modus' => $wegModus]
                        + (isset($erg['stopp']) ? ['stopp' => $erg['stopp']] : []));
        }

        // ------------------------------------------------------------ Glossar
        //
        // Drei Aktionen: das Verzeichnis, ein Begriff samt Nachbarn, und die
        // Frage an den Tutor. Die dritte läuft absichtlich durch
        // `pu_tutor_fragen()` und nicht an ihr vorbei — dort sitzt der
        // Systemtext mit dem Profil, dort wird protokolliert, dort wird
        // gebucht. Ein zweiter Weg wäre ein zweiter Ort zum Vergessen.

        case 'glossar':
            pu_recht_fordern('lernen.ausfuehren');
            pu_json_out(['ok' => true, 'begriffe' => pu_glossar_liste()]);

        case 'glossar_begriff': {
            pu_recht_fordern('lernen.ausfuehren');
            $b = pu_glossar_begriff(trim((string)d('slug')));
            if ($b === null) pu_fehler('Diesen Begriff gibt es im Glossar nicht.', 404);
            pu_json_out(['ok' => true, 'begriff' => $b,
                         'arten' => pu_glossar_knoepfe()]);
        }

        case 'glossar_fragen': {
            pu_recht_fordern('tutor.fragen');
            if (!pu_tutor_bereit()) {
                pu_json_out(['ok' => false, 'fehler' =>
                    'Es ist kein Tutor-Modell eingerichtet. Das Glossar selbst liest sich trotzdem.']);
            }

            $slug = trim((string)d('slug'));
            $b    = pu_glossar_begriff($slug);
            if ($b === null) pu_fehler('Diesen Begriff gibt es im Glossar nicht.', 404);

            $art = (string)d('art', 'erst');
            if (!isset(PU_GLOSSAR_ARTEN[$art])) $art = 'erst';
            $emoji = (string)d('emoji', '0') === '1';

            // Eine eigene Frage schlägt die vorgefertigte. Wer selbst tippt,
            // will nicht die Grundfrage beantwortet bekommen.
            $eigen = trim((string)d('frage', ''));
            $frage = $eigen !== '' ? mb_substr($eigen, 0, 2000) : pu_glossar_frage($slug, $art);

            // **Der Begriffstext geht als Zusammenhang mit, nicht als Frage.**
            // Damit steht die eigene Erklärung der Academy im Prompt und der
            // Tutor erfindet keine zweite daneben.
            $kontext = ['quelle' => $b['titel'] . ' — ' . $b['was'] . "

"
                                  . strip_tags($b['html'])];

            $erg = pu_tutor_fragen($ichId, 'prometheus', $frage, $kontext, false, false, [
                'regeln' => pu_glossar_regeln($art, $emoji),
                'wofuer' => 'Glossar · ' . $slug,
            ]);

            // Im Beitragsformat wird nachgeräumt: Absätze werden durch eine
            // Leerzeile getrennt, auch wenn das Modell nur umgebrochen hat.
            // Was kopiert wird, soll in einem fremden Textfeld so aussehen
            // wie hier.
            $text = ($erg['ok'] && $emoji) ? pu_glossar_beitrag($erg['text']) : $erg['text'];

            // Die Antwort wird verlinkt zurückgegeben: Steht darin ein weiterer
            // Fachbegriff, soll man ihn anklicken können, statt ihn abzutippen.
            $html = $erg['ok'] ? pu_glossar_verlinken(pu_md($text)) : '';

            pu_json_out(['ok' => $erg['ok'], 'frage' => $frage,
                         'text' => $text, 'html' => $html,
                         'fehler' => $erg['fehler']]
                        + (isset($erg['stopp']) ? ['stopp' => $erg['stopp']] : []));
        }

        // ---------------------------------------------------------- Vertiefung
        case 'vertiefung': {
            pu_recht_fordern('lernen.ausfuehren');
            $a = pu_aufgabe((string)d('id'));
            if ($a === null) pu_fehler('Diese Aufgabe gibt es nicht.', 404);

            // Nur nach einer richtigen Antwort. Sonst wäre die Vertiefung der
            // bequemste Weg, sich die Lösung erzählen zu lassen: sie darf den
            // Stoff der Aufgabe nennen, weil sie voraussetzt, dass er sitzt.
            $stand = pu_geloest($ichId);
            if (empty($stand[(string)$a['id']]['richtig'])) {
                pu_fehler('Vertiefungen gibt es nach einer richtigen Antwort.', 403);
            }

            $text = '';
            $abs  = ($a['lektion'] ?? '') !== '' ? pu_brain_pfad((string)$a['lektion']) : null;
            if ($abs !== null && is_file($abs)) {
                $fm   = pu_frontmatter((string)file_get_contents($abs));
                $text = preg_replace('/^```aufgabe[ \t]*\r?\n.*?^```[ \t]*$/ms', '', $fm['rumpf']) ?? '';
            }

            $woerter = (int)pu_einst($ichId, 'infos_woerter');
            $erg = pu_vertiefung($ichId, $a, $text, $woerter);
            pu_json_out(['ok' => $erg['ok'], 'text' => $erg['text'],
                         'fehler' => $erg['fehler'], 'woerter' => $woerter]);
        }

        // ---------------------------------------------------------- Tokenicer
        case 'tok': {
            pu_recht_fordern('tokenicer.nutzen');
            if (!pu_regel_an('tokenicer')) pu_fehler('Der Tokenicer ist abgeschaltet.', 403);

            $roh  = (string)d('text', '');
            $text = mb_strlen($roh) > PU_TOK_MAX ? mb_substr($roh, 0, PU_TOK_MAX) : $roh;

            $m = pu_tok_modell((string)d('modell', 'opus-5'));
            $r = pu_tok_kodieren($text, $m['enc']);

            pu_json_out(['ok' => true, 'modell' => $m,
                         'gekappt' => mb_strlen($roh) > PU_TOK_MAX] + $r);
        }

        case 'tok_modelle':
            pu_recht_fordern('tokenicer.nutzen');
            pu_json_out(['ok' => true, 'modelle' => PU_TOK_MODELLE, 'max' => PU_TOK_MAX]);

        // ---------------------------------------------------------- Einstellungen
        case 'einst_lesen': {
            $aus = [
                'person'       => pu_einst_person($ichId),
                'beschreibung' => PU_EINST_PERSON,
                'ich'          => ['kennung' => $ich['kennung'], 'name' => $ich['anzeigename'],
                                   'rolle' => $ich['rolle'], 'gruppe' => $ich['gruppe']],
            ];

            // Was das Fenster zeigen darf, entscheidet die Matrix — Reiter
            // für Reiter. Ein Lehrer sieht die Academy-Regeln, aber nicht den
            // API-Schlüssel; Geheimnisse gehen ohnehin nur als
            // "gesetzt: ja/nein" hinaus, nie als Wert.
            $aus['ebene']         = $ebene;
            $aus['ebene_anzeige'] = PU_EBENEN[$ebene]['anzeige'] ?? $ebene;
            // Die Rechte der SICHT (Persona-Vorschau): Reiter erscheinen wie bei
            // der gewählten Ebene. Geprüft wird trotzdem jede Aktion mit $ich.
            $aus['rechte']        = pu_recht_meine(pu_sicht_wer($ich));

            /* Was der Reiter „Sprache & Stimme" braucht — und zwar für JEDEN,
               nicht nur für die Verwaltung. Dort stellt sich jeder seine
               eigene Tutorstimme ein.

               Nichts davon ist ein Geheimnis: Es sind Stimmnamen und ein
               Schalter. Das Modell und der Schlüssel bleiben aussen vor, sie
               stehen weiterhin nur im Tutor-KI-Zweig oben — ein Lernender soll
               sich kein teureres Modell aussuchen können. */
            $aus['stimme_stand'] = [
                'an'       => pu_regel_an('stimme_an'),
                'familien' => PU_STIMM_FAMILIEN,
                'vorgaben' => array_combine(
                    PU_STIMM_AGENTEN,
                    array_map(fn($a) => pu_stimme_fuer($a), PU_STIMM_AGENTEN)),
            ];

            /* Der Coder der Werkstatt: frei oder nicht, warum, und welche
               Modelle zur Wahl stehen. Für jeden — wer noch nicht darf, soll
               sehen, wie weit es noch ist. Nichts davon ist ein Geheimnis;
               der Schlüssel bleibt im Tutor-KI-Zweig. */
            $aus['coder_stand'] = pu_coder_stand($ichId);

            /* Die Werkstatt (eigene Anwendung, Port 3081): frei ab Kurs 7,
               Admins sofort. Auch gesperrt sichtbar — mit dem Stand in %. */
            $aus['werkstatt_stand'] = pu_werkstatt_stand($ichId);

            /* Die Stimmen des festen Stimm-Modells — für jeden, weil jeder
               unter „Sprache & Stimme" seine eigene wählen darf. */
            $aus['stimmen'] = ['modell' => pu_stimme_modell(), 'liste' => pu_stimme_liste(),
                               'vorgabe' => pu_stimme_name()];

            if (pu_recht_hat('regeln.manage')) {
                $aus['global']              = pu_einst_global();
                $aus['global_beschreibung'] = PU_EINST_GLOBAL;
            }

            if (pu_recht_hat('ki.einstellungen')) {
                $aus['tutor_stand'] = [
                    'weg'          => pu_tutor_weg(),
                    // Registriert, Adresse da, Bescheinigung gueltig? Fragt nicht beim Server nach.
                    'server_bereit' => pu_server_bereit(),
                    'cli_gefunden' => pu_claude_bin() !== '',
                    'cli_name'     => pu_claude_bin() === '' ? '' : basename(pu_claude_bin()),
                    'modell'       => pu_tutor_modell(),
                    'or_modell'    => pu_or_modell(),
                    'bereit'       => pu_tutor_bereit(),
                    'token'        => pu_geheimnis_stand('CLAUDE_CODE_OAUTH_TOKEN'),
                    'or_key'       => pu_geheimnis_stand('PU_OPENROUTER_API_KEY'),

                    // Welche Zertifikatsliste die HTTPS-Verbindung benutzt.
                    // Steht hier, weil ein leerer Eintrag genau eine
                    // Fehlermeldung erklärt: "unable to get local issuer
                    // certificate". Ohne diese Zeile sucht man im Netz.
                    'ca_bundle'    => pu_ca_bundle(),

                    // Welche Stimmnamen zu welchem Modell gehören. Steht hier
                    // und nicht in der Oberfläche, damit die Namen nicht an
                    // zwei Stellen gepflegt werden müssen und auseinanderlaufen.
                    'stimm_familien' => PU_STIMM_FAMILIEN,
                ];
            }

            // Die Kennzahlen der Academy braucht nur der Wartungs-Reiter. Sie
            // hier trotzdem mitzuschicken hiesse, jedem Lehrer bei jedem
            // Öffnen der Einstellungen den Stoff-Index zu berechnen.
            if (pu_recht_hat('wartung.ausfuehren')) {
                $aus['uni'] = pu_uni_stand();
            }
            pu_json_out(['ok' => true] + $aus);
        }

        case 'einst_setzen': {
            if (in_array((string)d('schluessel'), PU_EINST_PUNKTE, true)) {
                pu_recht_fordern('lernen.selbst_regeln');
            }
            if (preg_match('/^stimme_(name|prometheus|athena|hermes|hephaistos)$/', (string)d('schluessel'))) {
                pu_stimme_pruefen((string)d('wert'));
            }
            $wert = pu_einst_person_setzen($ichId, (string)d('schluessel'), (string)d('wert'));
            pu_json_out(['ok' => true, 'wert' => $wert]);
        }

        // ---------------------------------------------------------- Profil
        //
        // Das eigene Profil darf jeder pflegen — es geht um die eigene
        // Anrede und darum, wie die Tutoren mit einem reden. Fremde Profile
        // sind eine andere Sache und haben eine eigene Aktion darunter.
        case 'profil_lesen':
            pu_json_out(['ok' => true,
                'profil'       => pu_profil($ichId),
                'felder'       => PU_PROFIL_FELDER,
                'sprachstil'   => pu_sprachstil(pu_profil($ichId)),
                'kontext_da'   => pu_ebenen_kontext($ebene) !== '',
            ]);

        case 'profil_setzen': {
            $wert = pu_profil_setzen($ichId, (string)d('feld'), (string)d('wert'));
            pu_json_out(['ok' => true, 'wert' => $wert,
                         'sprachstil' => pu_sprachstil(pu_profil($ichId))]);
        }

        case 'profil_pflegen': {
            pu_recht_fordern('lernende.manage');
            $ziel = (int)d('lernender');
            if (pu_profil($ziel) === null) pu_fehler('Dieses Konto gibt es nicht.', 404);
            $wert = pu_profil_setzen($ziel, (string)d('feld'), (string)d('wert'));
            pu_protokoll($ichId, 'profil', (string)$ziel, (string)d('feld'));
            pu_json_out(['ok' => true, 'wert' => $wert]);
        }

        case 'kind_setzen': {
            pu_recht_fordern('eltern.manage');
            pu_profil_kind_setzen((int)d('eltern'), (int)d('kind'));
            pu_protokoll($ichId, 'kind', (string)(int)d('eltern'), (string)(int)d('kind'));
            pu_json_out(['ok' => true]);
        }

        case 'name_aendern': {
            $neu = trim((string)d('anzeigename'));
            if ($neu === '' || mb_strlen($neu) > 60) pu_fehler('Der Anzeigename passt so nicht.');
            /* **Ein neuer Name legt das alte Pseudonym ab.**
               Sonst spricht der Tutor weiter den an, der dieses Konto vorher
               war: „Hallo, Daidalos" zu jemandem, der Alpay heisst. Ein
               Pseudonym veraltet still, weil niemand daran denkt, es nachzu-
               ziehen — und still falsch ist schlimmer als gar nicht da.

               Danach greift der Rückfall in `pu_profil()`: Angesprochen wird
               mit dem Namen aus den Einstellungen, bis jemand ausdrücklich ein
               neues Pseudonym setzt. Die Zusage, dass ein selbst gewähltes
               Pseudonym den Klarnamen ersetzt, bleibt damit unberührt. */
            $st = pu_db()->prepare("UPDATE lernende SET anzeigename = ?, pseudonym = '' WHERE id = ?");
            $st->execute([$neu, $ichId]);
            pu_protokoll($ichId, 'name_geaendert', $neu, 'Pseudonym zurückgesetzt');
            pu_json_out(['ok' => true, 'anzeigename' => $neu]);
        }

        // ------------------------------------------------- Verwaltung & Betrieb
        case 'regel_setzen': {
            pu_recht_fordern('regeln.manage');
            if (preg_match('/^stimme_(name|prometheus|athena|hermes|hephaistos)$/', (string)d('schluessel'))) {
                pu_stimme_pruefen((string)d('wert'));
            }
            $wert = pu_einst_global_setzen((string)d('schluessel'), (string)d('wert'));
            pu_protokoll($ichId, 'regel', (string)d('schluessel'), $wert);
            pu_json_out(['ok' => true, 'wert' => $wert]);
        }

        case 'geheimnis_setzen': {
            pu_recht_fordern('ki.einstellungen');
            $name = (string)d('name');
            $wert = trim((string)d('wert'));
            pu_env_setzen($name, $wert);

            // Protokolliert wird, DASS gesetzt wurde. Der Wert steht nicht im
            // Protokoll — ein Protokoll ist eine Datei, die man weitergibt.
            pu_protokoll($ichId, 'geheimnis', $name, $wert === '' ? 'gelöscht' : 'gesetzt');
            pu_json_out(['ok' => true, 'stand' => pu_geheimnis_stand($name)]);
        }

        // ------------------------------------------------ Werkstatt (Port 3081)
        //
        // Frei ab Kurs 7 zu 100 %, Admins sofort — geprüft HIER, vor dem
        // Ticket. Der Knopf in der Oberfläche ist nur Anzeige.
        case 'werkstatt_oeffnen': {
            if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') pu_fehler('Nur per POST.', 405);

            $st = pu_werkstatt_stand($ichId);
            if (!$st['frei'])         pu_fehler('Die Werkstatt ist erst mit dem 7. Kurs frei.', 403);
            $zu = pu_gem_zugang($ichId, true);
            if (!$zu['ok'])           pu_fehler(pu_gem_grund_text($zu['grund']) . ' Die Werkstatt gehört zum Abo.', 403);
            if (!$st['eingerichtet']) pu_fehler('Die Werkstatt ist auf diesem Rechner noch nicht eingerichtet: '
                                               . 'werkstatt\\WERKSTATT-EINRICHTEN.bat ausführen.', 409);
            if ($st['laeuft']) {
                pu_json_out(['ok' => true, 'laeuft' => true, 'port' => $st['port']]);
            }

            pu_werkstatt_ticket($ichId);
            pu_werkstatt_starten();
            pu_protokoll($ichId, 'werkstatt', 'oeffnen', $st['grund']);
            pu_json_out(['ok' => true, 'laeuft' => false, 'gestartet' => true, 'port' => $st['port']]);
        }

        case 'tutor_probe': {
            pu_recht_fordern('ki.einstellungen');

            $frage  = 'Antworte mit genau einem Wort: bereit.';
            $system = 'Du bist ein Prüfsignal. Antworte knapp.';

            // Mit Modellnamen wird genau dieses eine geprüft, und zwar über
            // OpenRouter — dort kommt es her. Ohne Namen bleibt es beim
            // eingerichteten Weg, der auch die Claude-CLI sein kann.
            $modell = trim((string)d('modell', ''));
            $erg = $modell !== ''
                 ? pu_or_lauf($frage, $system, 45, 0, $modell)
                 : pu_modell_lauf($frage, $system, 45);

            pu_json_out(['ok' => $erg['ok'], 'text' => mb_substr($erg['text'], 0, 200),
                         'modell' => $modell !== '' ? $modell : pu_tutor_modell(),
                         'fehler' => $erg['fehler'], 'dauer' => $erg['dauer']]);
        }

        case 'wartung': {
            pu_recht_fordern('wartung.ausfuehren');
            pu_json_out(['ok' => true] + pu_wartung((string)d('was'), $ichId));
        }

        // ------------------------------------------------ Updates (90_Updates)
        //
        // Nur Ebene 1. `update_stand` fragt beim Update-Server nur nach, wenn
        // es fällig ist (Regel update_stunden) — sonst liefert es den
        // gespeicherten Stand sofort. Getauscht wird nicht hier, sondern beim
        // Neustart in srv/aktualisieren_cli.php.
        case 'update_stand':
            pu_recht_fordern('aktualisierung.verwalten');
            pu_json_out(['ok' => true] + pu_akt_oberflaeche($ichId));

        case 'update_suchen':
            pu_recht_fordern('aktualisierung.verwalten');
            pu_json_out(['ok' => true] + pu_akt_oberflaeche($ichId, true));

        case 'update_laden': {
            pu_recht_fordern('aktualisierung.verwalten');
            $r = pu_akt_laden();
            pu_protokoll($ichId, 'update_laden', $r['ok'] ? 'ok' : 'fehler', '');
            pu_json_out(['ok' => true, 'geladen' => $r['ok'], 'meldung' => $r['meldung']]
                        + pu_akt_oberflaeche($ichId));
        }

        // Kursmedien (Video, Hörfolge, Song neben den Kursen) vom eigenen Server:
        // laden, gegen den signierten Feed prüfen, unter medien/ ablegen.
        // Kein Neustart nötig — die Playlist liest den Ordner bei jedem Aufruf.
        case 'update_medien': {
            pu_recht_fordern('aktualisierung.verwalten');
            require_once PU_ROOT . '/srv/kursmedien.php';
            @set_time_limit(0);
            $r = pu_med_laden();
            pu_protokoll($ichId, 'update_medien', $r['ok'] ? 'ok' : 'fehler', '');
            pu_json_out(['ok' => true, 'geladen' => $r['ok'], 'meldung' => $r['meldung']]
                        + pu_akt_oberflaeche($ichId));
        }

        case 'update_neustart':
            pu_recht_fordern('aktualisierung.verwalten');
            if (pu_akt_bereit() === null) {
                pu_fehler('Es ist nichts bereitgelegt. Zuerst laden.');
            }
            pu_protokoll($ichId, 'update_neustart', '', '');
            pu_akt_neustart_antworten(false);

        case 'update_zurueck':
            pu_recht_fordern('aktualisierung.verwalten');
            if (pu_akt_sicherungen() === []) {
                pu_fehler('Es gibt keine Sicherung, zu der zurückgegangen werden könnte.');
            }
            pu_protokoll($ichId, 'update_zurueck', '', '');
            pu_akt_neustart_antworten(true);

        case 'update_ausblenden':
            pu_recht_fordern('aktualisierung.verwalten');
            try {
                pu_akt_ausblenden($ichId, (string)d('fassung', ''));
            } catch (RuntimeException $f) {
                pu_fehler($f->getMessage());
            }
            pu_json_out(['ok' => true]);

        case 'update_einstellen':
            pu_recht_fordern('aktualisierung.verwalten');
            try {
                pu_einst_global_setzen('update_pruefen', (string)d('pruefen', 'an'));
                pu_einst_global_setzen('update_stunden', (string)d('stunden', '24'));
            } catch (RuntimeException $f) {
                pu_fehler($f->getMessage());
            }
            pu_json_out(['ok' => true] + pu_akt_oberflaeche($ichId));

        case 'rolle_setzen': {
            pu_recht_fordern('rollen.manage');
            $ziel  = (int)d('lernender');
            $ebeneNeu = (string)d('rolle');
            if (!isset(PU_EBENEN[$ebeneNeu])) pu_fehler('Diese Ebene gibt es nicht.');

            // Der letzte Admin darf nicht weggenommen werden — auch nicht von
            // sich selbst. Danach käme niemand mehr an die Rechte-Matrix, an
            // den Schlüssel und an die Wartung: die Academy hätte sich ohne
            // Vorwarnung ausgesperrt, und ohne Admin gibt es keinen Weg
            // zurück ausser einem Eingriff in die Datenbank.
            if ($ebeneNeu !== 'admin') {
                $st = pu_db()->prepare("SELECT COUNT(*) FROM lernende WHERE rolle = 'admin' AND id <> ?");
                $st->execute([$ziel]);
                if ((int)$st->fetchColumn() === 0) {
                    pu_fehler('Es muss mindestens einen Admin geben.');
                }
            }

            $st = pu_db()->prepare('UPDATE lernende SET rolle = ? WHERE id = ?');
            $st->execute([$ebeneNeu, $ziel]);
            pu_protokoll($ichId, 'ebene', (string)$ziel, $ebeneNeu);

            // Auch das gehört ins Rechte-Protokoll: wer jemanden zum Admin
            // macht, gibt ihm jedes Recht auf einmal.
            pu_recht_protokoll($ichId, 'ebene:' . $ebeneNeu, $ebeneNeu, '#' . $ziel, true);
            pu_json_out(['ok' => true]);
        }

        // ------------------------------------------------ Plan & Token
        //
        // Hier wird nichts bezahlt, hier wird gebucht. Der Zahlungseingang
        // ist ein Haken, den Ebene 1 setzt — siehe srv/abo.php.
        case 'cockpit':
            pu_recht_fordern('abo.sehen');
            pu_json_out(['ok' => true] + pu_cockpit($ichId) + [
                'darf_buchen'      => pu_recht_hat('abo.verwalten'),
                'darf_einzahlen'   => pu_recht_hat('token.einzahlen'),
                'darf_bestaetigen' => pu_recht_hat('abo.bestaetigen'),
                // Bestätigt wird sonst vom Server — das geht nur registriert.
                'registriert'      => (function () {
                    require_once __DIR__ . '/srv/relay.php';
                    return pu_relay_zustand()['registriert'];
                })(),

                // Recht UND jemand darunter. Das Recht allein genügt nicht:
                // Ein Kasten „Talente weitergeben" ohne einen einzigen
                // möglichen Empfänger ist ein Versprechen, das die Liste
                // gleich wieder zurücknimmt.
                'darf_senden'      => pu_recht_hat('talente.senden')
                                      && pu_talente_empfaenger($ichId) !== [],
                'alle'             => pu_recht_hat('abo.verwalten') ? pu_abos_alle() : [],
            ]);

        // ------------------------------------------------ Server (Relay)
        //
        // Registrierung und Stand beim Server. `relay_zustand` fragt nicht
        // beim Server nach — ein Reiter darf nicht bei jedem Öffnen eine
        // Netzanfrage auslösen. `relay_stand` tut es, auf Knopfdruck.
        case 'relay_zustand':
            pu_recht_fordern('abo.sehen');
            pu_json_out(['ok' => true, 'zustand' => pu_relay_zustand(),
                         'darf_registrieren' => pu_art() === '' || pu_recht_hat('registrierung.verwalten')]);

        case 'relay_stand': {
            pu_recht_fordern('abo.sehen');
            $artVorher = pu_art();
            $r = pu_relay_stand();
            // Kommt hier die ERSTE gültige Bescheinigung an, war die
            // Registrierung am Server erfolgreich, aber lokal nicht
            // angenommen (Probelauf 28.09.2026: falsche Schlüsselkennung).
            // Dann wird wie beim Registrieren nachgeholt, was fehlt: Wer hier
            // klickt, wird Inhaber. Vorher gab es auf diesem Rechner nur
            // Schüler — dieselbe Lage wie vor einer Registrierung.
            if ($r['ok'] && $artVorher === '' && ($inhaber = pu_art_inhaber(pu_art(true))) !== '') {
                pu_db()->prepare('UPDATE lernende SET rolle = ? WHERE id = ?')
                       ->execute([$inhaber, $ichId]);
                pu_protokoll($ichId, 'registrierung', 'nachgeholt', '');
                $r['neu_laden'] = true;
            }
            // Nebenbei die Konten melden (Pseudonym + Rolle) und das eigene
            // Guthaben holen — scheitert das, bleibt der Stand trotzdem gültig.
            if ($r['ok']) {
                $k = pu_relay_konten();
                $r['eigen'] = $k['ok'] ? (int)($k['konten']['L-' . $ichId] ?? 0) : null;
                $r['topf'] = $k['ok'] ? (int)$k['topf'] : null;
                $r['konten_gemeldet'] = $k['ok'] ? count($k['konten']) : 0;
                $r['konten_meldung'] = $k['ok'] ? '' : pu_relay_grund_text((string)($k['grund'] ?? ''));
            }
            pu_json_out($r + ['zustand' => pu_relay_zustand(),
                              'meldung' => $r['ok'] ? '' : pu_relay_grund_text((string)($r['grund'] ?? ''))]);
        }

        case 'relay_registrieren': {
            // Solange der Rechner nicht registriert ist, darf es jeder — es
            // gibt dann nur Schüler, und irgendwer muss den Code eingeben.
            // Danach nur, wer das Recht hat.
            if (pu_art() !== '') pu_recht_fordern('registrierung.verwalten');
            $r = pu_relay_registrieren((string)d('code', ''));
            // Wer registriert, wird Inhaber: die Adminrolle des Kunden, die
            // die Art der Registrierung festlegt (PU_ARTEN).
            if ($r['ok'] && ($inhaber = pu_art_inhaber(pu_art(true))) !== '') {
                pu_db()->prepare('UPDATE lernende SET rolle = ? WHERE id = ?')
                       ->execute([$inhaber, $ichId]);
            }
            // Protokolliert wird, DASS registriert wurde, nie der Code.
            pu_protokoll($ichId, 'registrierung', $r['ok'] ? 'ok' : (string)($r['grund'] ?? ''), '');
            pu_json_out(['ok' => $r['ok'], 'zustand' => pu_relay_zustand(),
                         'meldung' => $r['ok'] ? '' : pu_relay_grund_text((string)($r['grund'] ?? ''))]);
        }

        // ------------------------------------------------ Gemeinde (Runde 3b)
        //
        // Die Gemeinde gibt es nur über den Server; ohne Registrierung zeigt
        // die Oberfläche, warum nicht. Hinaus geht nur das Pseudonym `L-<id>`
        // und das Synonym — nie Name, Kennung, Klasse oder Schule.
        /* Der Knopf „Community“ der Werkstatt (Plan 30_Community). Ein GET, den
           der Browser als Seite öffnet; am Ende steht immer eine Weiterleitung:
             - in die Community mit Einlassmarke im Fragment (#e=…), oder
             - ohne Registrierung oder Abo ins Werbe-Modal (#/werbung), oder
             - bei einem anderen Hindernis in die Ansicht „Community“ mit Satz.
           Eine fremde Seite, die diesen Link auslöst, schickt die Person in
           ihre eigene Community — mehr kann sie damit nicht. */
        case 'community_oeffnen': {
            pu_recht_fordern('gemeinde.ansehen');
            if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') pu_fehler('Nur per GET.', 405);
            $v = is_string($_GET['v'] ?? null) ? (string)$_GET['v'] : '';
            $r = pu_gem_einlass($ich, $v);
            if ($r['ok']) api_umleiten($r['ziel']);
            if (!empty($r['werbung'])) api_umleiten('./#/werbung');
            pu_gem_hinweis_setzen(pu_gem_grund_text((string)$r['grund']));
            api_umleiten('./#/gemeinde');
        }

        case 'gemeinde_start': {
            pu_recht_fordern('gemeinde.ansehen');
            $z = pu_relay_zustand();
            $st = pu_db()->prepare('SELECT pseudonym, anzeigename, kennung FROM lernende WHERE id = ?');
            $st->execute([$ichId]);
            $p = $st->fetch() ?: [];
            $syn = (string)($p['pseudonym'] ?? '');
            $fehler = $syn === '' ? 'kein_rufname' : pu_synonym_fehler($syn, $p);
            pu_json_out(['ok' => true,
                'registriert' => (bool)($z['registriert'] ?? false) && (bool)($z['gueltig'] ?? false),
                'synonym' => $syn, 'synonym_fehler' => $fehler === null ? '' : pu_gem_grund_text($fehler),
                // Einmal-Hinweis, wenn der Knopf der Werkstatt hier gelandet ist.
                'hinweis' => pu_gem_hinweis_nehmen(),
                // Community im Browser (Knopf der Werkstatt): sonst Werbe-Modal.
                'zugang' => pu_gem_zugang($ichId),
                'darf' => ['mitmachen' => pu_recht_hat('gemeinde.mitmachen'),
                           'veroeffentlichen' => pu_recht_hat('gemeinde.veroeffentlichen'),
                           'siegeln' => pu_recht_hat('gemeinde.siegel')],
                'kategorien' => ['hauptfeld' => PU_GEM_HAUPTFELDER, 'art' => PU_GEM_ARTEN,
                                 'zielgruppe' => PU_GEM_ZIELGRUPPEN, 'medium' => PU_GEM_MEDIEN, 'lizenz' => PU_GEM_LIZENZEN],
            ]);
        }

        case 'pii_regeln':
            // Das Regelwerk für die Prüfung beim Tippen (assets/js/pii.js).
            pu_recht_fordern('gemeinde.ansehen');
            pu_json_out(['ok' => true, 'regeln' => json_decode((string)file_get_contents(PU_PII_DATEI), true)]);

        case 'gemeinde_werke': {
            pu_recht_fordern('gemeinde.ansehen');
            $filter = [];
            foreach (['hauptfeld', 'art', 'zielgruppe', 'medium', 'rufname'] as $f) {
                if ((string)d($f, '') !== '') $filter[$f] = mb_substr((string)d($f, ''), 0, 40);
            }
            $filter['seite'] = max(0, (int)d('seite', 0));
            pu_json_out(pu_gem_ruf('werke', $ich, $filter));
        }

        case 'gemeinde_werk':
            pu_recht_fordern('gemeinde.ansehen');
            pu_json_out(pu_gem_ruf('werk', $ich, ['id' => (string)d('id', '')]));

        case 'gemeinde_bild':
            pu_recht_fordern('gemeinde.ansehen');
            pu_json_out(['ok' => true, 'bild' => pu_gem_bild($ich, (string)d('id', ''))]);

        case 'gemeinde_paket': {
            pu_recht_fordern('gemeinde.ansehen');
            $r = pu_gem_ruf('werk_datei', $ich, ['id' => (string)d('id', ''), 'was' => 'paket']);
            pu_json_out($r['ok'] ? ['ok' => true, 'inhalt' => (string)($r['inhalt'] ?? '')] : $r);
        }

        case 'gemeinde_synonym': {
            pu_recht_fordern('gemeinde.mitmachen');
            $r = pu_gem_synonym_melden($ich);
            pu_json_out(['ok' => $r['ok'], 'text' => $r['ok'] ? '' : pu_gem_grund_text((string)($r['grund'] ?? ''))]);
        }

        case 'gemeinde_like':
            pu_recht_fordern('gemeinde.mitmachen');
            pu_json_out(pu_gem_ruf('like', $ich, ['id' => (string)d('id', ''), 'an' => (bool)d('an', true)]));

        case 'gemeinde_kommentar': {
            pu_recht_fordern('gemeinde.mitmachen');
            $a = d('antwort_auf', null);
            pu_json_out(pu_gem_kommentar($ich, (string)d('id', ''), (string)d('text', ''),
                                         $a === null || $a === '' ? null : (int)$a));
        }

        case 'gemeinde_melden':
            pu_recht_fordern('gemeinde.mitmachen');
            pu_json_out(pu_gem_ruf('melden', $ich, ['ziel_art' => (string)d('ziel_art', ''),
                'ziel' => (string)d('ziel', ''), 'grund' => mb_substr((string)d('grund', ''), 0, 300)]));

        case 'gemeinde_talente':
            // Eigener Stand und die Bestenliste der letzten Woche (mit Synonymen).
            pu_recht_fordern('gemeinde.ansehen');
            pu_json_out(pu_gem_talente($ich));

        case 'gemeinde_talente_abholen': {
            pu_recht_fordern('gemeinde.mitmachen');
            $m = d('menge', null);
            $r = pu_gem_talente_abholen($ich, $m === null || $m === '' ? null : max(1, (int)$m));
            if ($r['ok']) pu_protokoll($ichId, 'talente_abholen', (string)($r['beleg']['talente'] ?? 0), '');
            pu_json_out($r);
        }

        case 'produkte': {
            pu_recht_fordern('gemeinde.veroeffentlichen');
            if ((bool)d('abgleichen', false)) pu_produkte_abgleichen($ich);
            $liste = pu_produkte(pu_gem_person($ichId), pu_recht_hat('gemeinde.siegel'));
            foreach (['eigene', 'siegeln'] as $teil) {
                foreach ($liste[$teil] as &$p) {
                    $p['bild'] = pu_produkt_bild_daten((int)$p['id']);
                    $p['dateien'] = pu_produkt_dateien((int)$p['id']);
                }
                unset($p);
            }
            pu_json_out(['ok' => true] + $liste);
        }

        case 'produkt_anlegen': {
            pu_recht_fordern('gemeinde.veroeffentlichen');
            // Dateien kommen als Liste {pfad, inhalt(base64)} oder als ein ZIP.
            $dateien = [];
            if ((string)d('zip', '') !== '') {
                $z = pu_gem_zip_lesen((string)base64_decode((string)d('zip', ''), true));
                if (!$z['ok']) pu_json_out(['ok' => false, 'text' => pu_gem_grund_text($z['grund'])]);
                $dateien = $z['dateien'];
            } else {
                foreach ((array)d('dateien', []) as $f) {
                    if (!is_array($f)) continue;
                    $dateien[(string)($f['pfad'] ?? '')] = (string)base64_decode((string)($f['inhalt'] ?? ''), true);
                }
            }
            $r = pu_produkt_anlegen($ichId, (string)d('titel', ''), (string)d('beschreibung', ''), $dateien,
                                    (string)d('herkunft', 'eingelegt'));
            if (!$r['ok']) $r['text'] = pu_gem_grund_text($r['grund']) . (isset($r['datei']) ? ' (' . $r['datei'] . ')' : '');
            pu_json_out($r);
        }

        case 'produkt_aendern':
            pu_recht_fordern('gemeinde.veroeffentlichen');
            pu_json_out(['ok' => true] + pu_produkt_aendern((int)d('id', 0), $ichId, [
                'titel' => (string)d('titel', ''), 'beschreibung' => (string)d('beschreibung', ''),
                'hauptfeld' => (string)d('hauptfeld', ''), 'art' => (string)d('art', ''),
                'zielgruppe' => (string)d('zielgruppe', ''), 'medium' => (string)d('medium', ''),
                'lizenz' => (string)d('lizenz', 'CC-BY-4.0')]));

        case 'produkt_bild':
            pu_recht_fordern('gemeinde.veroeffentlichen');
            pu_produkt_bild((int)d('id', 0), $ichId, (string)base64_decode((string)d('bild', ''), true));
            pu_json_out(['ok' => true, 'bild' => pu_produkt_bild_daten((int)d('id', 0))]);

        case 'produkt_loeschen':
            pu_recht_fordern('gemeinde.veroeffentlichen');
            pu_produkt_loeschen((int)d('id', 0), $ichId);
            pu_json_out(['ok' => true]);

        case 'produkt_siegeln':
            pu_recht_fordern('gemeinde.siegel');
            pu_produkt_siegeln((int)d('id', 0), pu_gem_person($ichId));
            pu_protokoll($ichId, 'mit_siegel', 'Produkt ' . (int)d('id', 0), '');
            pu_json_out(['ok' => true]);

        case 'produkt_freischalten':
            pu_recht_fordern('gemeinde.veroeffentlichen');
            pu_json_out(pu_produkt_freischalten((int)d('id', 0), pu_gem_person($ichId)));

        case 'produkt_zurueckziehen':
            pu_recht_fordern('gemeinde.veroeffentlichen');
            pu_json_out(pu_produkt_zurueckziehen((int)d('id', 0), pu_gem_person($ichId)));

        case 'abo_buchen': {
            pu_recht_fordern('abo.verwalten');
            $abo = pu_abo_buchen(
                (string)d('traeger_art', 'person'),
                (int)d('traeger', $ichId),
                (string)d('traeger_name', ''),
                (string)d('plan'),
                $ichId,
                (string)d('notiz', ''),
                (string)d('takt', 'monatlich'),
                (int)d('zusatz', 0)
            );
            // Gleich beim Server melden, damit der Betreiber die Zahlung
            // bestätigen kann. Scheitert das (offline, nicht registriert),
            // holt es der nächste Abgleich nach — die Buchung steht trotzdem.
            $gemeldet = false;
            require_once __DIR__ . '/srv/relay.php';
            if (pu_relay_zustand()['registriert']) {
                $gemeldet = pu_relay_stand()['ok'] ?? false;
            }
            pu_json_out(['ok' => true, 'abo' => $abo, 'gemeldet' => $gemeldet]);
        }

        // ------------------------------------------------ Talente weiterreichen
        //
        // Getrennt in zwei Aktionen, weil die Oberfläche die Liste braucht,
        // bevor jemand einen Betrag eintippt — und weil ein Aufruf, der beides
        // täte, beim Zeichnen der Seite schon eine Überweisung wäre.
        case 'talente_ziele':
            pu_recht_fordern('talente.senden');
            pu_json_out(['ok' => true,
                         'ziele'  => pu_talente_empfaenger($ichId),
                         'stand'  => pu_token_stand($ichId),
                         'frei'   => pu_token_frei($ichId),
                         'min'    => PU_TALENT_MIN,
                         'max'    => PU_TALENT_MAX]);

        case 'talente_senden': {
            pu_recht_fordern('talente.senden');

            /* Die Bestätigung steht als eigenes Feld in der Anfrage und nicht
               nur als Rückfrage im Browser. Eine Rückfrage, die allein im
               JavaScript sitzt, ist keine — wer die Aktion direkt aufruft,
               kommt an ihr vorbei. Hier ist sie Teil der Anfrage: ohne
               `sicher` geht nichts hinaus, und im Journal steht hinterher,
               dass sie da war. */
            if ((string)d('sicher', '') !== 'ja') {
                pu_fehler('Die Überweisung muss bestätigt werden.', 400);
            }

            $erg = pu_talente_senden($ichId, (int)d('an'), (int)d('betrag'),
                                     (string)d('notiz', ''));
            pu_json_out(['ok' => true, 'überweisung' => $erg] + pu_cockpit($ichId));
        }

        case 'abo_bestaetigen':
            pu_recht_fordern('abo.bestaetigen');
            pu_abo_bestaetigen((int)d('abo'), $ichId);
            pu_json_out(['ok' => true] + pu_cockpit($ichId));

        case 'abo_beenden':
            pu_recht_fordern('abo.verwalten');
            pu_abo_beenden((int)d('abo'), $ichId);
            pu_json_out(['ok' => true] + pu_cockpit($ichId));

        case 'abos_alle':
            pu_recht_fordern('abo.verwalten');
            pu_json_out(['ok' => true, 'abos' => pu_abos_alle()]);

        case 'token_einzahlen': {
            pu_recht_fordern('token.einzahlen');
            // Die beiden Widerrufs-Häkchen. Fehlen sie, bleibt das
            // Widerrufsrecht bestehen — der Kauf geht trotzdem durch.
            $erg = pu_token_einzahlen(
                (int)d('fuer', $ichId), (string)d('paket'), $ichId,
                (bool)d('sofort', false), (bool)d('verlust_bekannt', false));
            pu_json_out(['ok' => true, 'buchung' => $erg] + pu_cockpit($ichId));
        }

        // ------------------------------------------------ Sprachnachricht
        //
        // Die Aufnahme geht in data/tmp, wird erkannt und sofort gelöscht —
        // auch wenn unterwegs etwas schiefgeht. Zurück kommt nur Text, und
        // der landet im Eingabefeld, nicht direkt beim Tutor: man soll lesen
        // können, was verstanden wurde, bevor es hinausgeht.
        case 'sprache_erkennen': {
            pu_recht_fordern('sprache.nutzen');
            if (!pu_regel_an('spracheingabe')) {
                pu_fehler('Die Spracheingabe ist abgeschaltet.', 403);
            }

            // Auch die Spracherkennung kostet, also gilt hier dasselbe Tor wie
            // beim Tutor — und zwar bevor die Datei überhaupt angenommen wird.
            // Erst hochladen, erkennen und dann sagen „geht nicht" wäre die
            // Rechenzeit trotzdem los.
            $tor = pu_token_tor($ichId);
            if (!$tor['offen']) {
                pu_json_out(['ok' => false, 'text' => '', 'sekunden' => 0, 'tokens' => 0,
                             'stopp' => $tor['meldung'], 'fehler' => $tor['meldung']['titel']]);
            }

            $datei = $_FILES['ton'] ?? null;
            if (!is_array($datei) || ($datei['error'] ?? 1) !== UPLOAD_ERR_OK) {
                pu_fehler('Es ist keine Aufnahme angekommen.');
            }

            $art = strtolower(pathinfo((string)($datei['name'] ?? ''), PATHINFO_EXTENSION));
            if ($art !== '' && !in_array($art, PU_TON_ARTEN, true)) {
                pu_fehler('Diese Tonart nimmt die Academy nicht an: ' . $art);
            }

            $tmp = PU_DATA . '/tmp';
            if (!is_dir($tmp)) @mkdir($tmp, 0777, true);
            $ziel = $tmp . '/ton_' . bin2hex(random_bytes(6)) . '.' . ($art !== '' ? $art : 'webm');

            if (!@move_uploaded_file((string)$datei['tmp_name'], $ziel)) {
                pu_fehler('Die Aufnahme liess sich nicht ablegen.', 500);
            }

            try {
                $erg = pu_sprache_erkennen($ziel);
            } finally {
                @unlink($ziel);
            }

            if ($erg['ok']) {
                pu_token_verbrauchen($ichId, 'Sprachnachricht', (int)$erg['tokens'],
                                     true, 'whisper ' . $erg['modell']);
                pu_protokoll($ichId, 'sprache', $erg['modell'], $erg['sekunden'] . 's');
            }

            pu_json_out(['ok' => $erg['ok'], 'text' => $erg['text'],
                         'sekunden' => $erg['sekunden'], 'tokens' => $erg['tokens'],
                         'fehler' => $erg['fehler']]);
        }

        // ------------------------------------------------ Personas
        //
        // Die Wache steht hier UND in `pu_persona_setzen()`. Das ist keine
        // Doppelung aus Versehen: `persona.nutzen` ist `nur_admin` und damit
        // über die Matrix nicht weitergebbar — aber die Funktion wird auch von
        // `pu_persona()` bei jedem Lesezugriff geprüft, und dort gibt es keinen
        // API-Zweig, an dem eine Wache stehen könnte.
        case 'persona':
            pu_recht_fordern('persona.nutzen');
            pu_json_out(['ok' => true] + pu_persona_liste());

        case 'persona_setzen': {
            pu_recht_fordern('persona.nutzen');
            $jetzt = pu_persona_setzen((string)d('persona', ''), (string)d('klasse', ''));
            // Die Oberfläche baut sich ohne Neuladen um: Rechte und Stil der
            // Sicht kommen gleich mit (pu_sicht_wer). Geprüft wird weiter echt.
            $sicht = pu_sicht_wer();
            pu_json_out(['ok' => true, 'jetzt' => $jetzt,
                         'rechte' => pu_recht_meine($sicht),
                         'sicht_ebene' => pu_ebene($sicht),
                         'stil' => pu_stil_wirksam(pu_einst_person($ichId), $sicht)]);
        }

        // ------------------------------------------------ Vorlesen
        //
        // Der Ton kommt als Base64 im JSON zurück und nicht als eigene Datei.
        // Grund: Eine Datei bräuchte eine Adresse, und eine Adresse, unter der
        // ein Tonstück liegt, wäre für jeden abrufbar, der sie errät. So geht
        // das Stück durch dieselbe angemeldete Verbindung wie alles andere.
        case 'vorlesen': {
            pu_recht_fordern('stimme.nutzen');

            // Der Tutor entscheidet die Stimme. Das Modell und das Format
            // bleiben absichtlich aussen vor: Ein Lernender soll sich nicht
            // sein eigenes Modell aussuchen und auf fremde Rechnung teurer
            // machen. Ein Stimmname kostet nichts.
            $erg = pu_vorlesen($ichId, (string)d('text'),
                               ['wofuer' => (string)d('wofuer', '') ?: 'Vorlesen',
                                'agent'  => (string)d('agent', '')]);

            // Die Reglerstellung geht mit: Sie wirkt beim Abspielen im
            // Browser, nicht beim Erzeugen — siehe PU_STIMM_REGLER.
            //
            // Mit `$ichId`: Die Regler sind die des Hörenden, nicht die der
            // Academy. Wer sein Tempo eingestellt hat, bekommt sein Tempo.
            pu_json_out(['ok' => $erg['ok'], 'ton' => $erg['ton'], 'mime' => $erg['mime'],
                         'klang' => pu_stimme_klang((string)d('agent', ''), $ichId),
                         'transkript' => $erg['transkript'], 'dauer' => $erg['dauer'],
                         'aus_speicher' => $erg['aus_speicher'], 'fehler' => $erg['fehler']]
                        + (isset($erg['stopp']) ? ['stopp' => $erg['stopp']] : []));
        }

        case 'stimme_probe': {
            pu_recht_fordern('stimme.pruefen');

            // Ein Modell darf hier ausprobiert werden, ohne es vorher zu
            // übernehmen — deshalb die drei Überschreibungen. Sie kommen nur
            // an dieser Stelle in Frage: `vorlesen` nimmt sie nicht entgegen,
            // sonst könnte ein Lernender sich sein eigenes Modell aussuchen
            // und auf fremde Rechnung teurer machen.
            $ueber = ['modell' => (string)d('modell', ''),
                      'stimme' => (string)d('stimme', ''),
                      'format' => (string)d('format', '')];

            pu_json_out(['ok' => true, 'probe' => pu_stimme_probe($ichId, $ueber)]);
        }

        // ------------------------------------------------------- Modellkatalog
        //
        // Die Liste ist öffentlich und braucht keinen Schlüssel — man kann
        // also stöbern, BEVOR einer hinterlegt ist. Das Recht hängt trotzdem
        // an den KI-Einstellungen: Hier wird eingerichtet, nicht gelernt.
        case 'or_katalog': {
            pu_recht_fordern('ki.einstellungen');

            $k = pu_katalog((string)d('frisch', '') === '1');
            $s = pu_katalog_suchen($k['modelle'], (string)d('hersteller', ''),
                                   (string)d('suche', ''), (string)d('nur', ''));
            $treffer = $s['treffer'];

            /* **Die Liste ist unvollständig, und das ist kein Lesefehler.**
               `x-ai/grok-voice-tts-1.0` steht in keinem der 422 Einträge — mit
               Schlüssel wie ohne —, es gibt das Modell aber, und direkt
               eingetragen funktioniert es. Wer eine vollständige Kennung tippt
               und nichts findet, bekommt deshalb eine Einzelabfrage statt einer
               leeren Liste. Gefunden wird sie gemerkt: einmal fragen genügt. */
            $ungelistet = false;
            if ($treffer === []) {
                foreach ([(string)d('hersteller', ''), (string)d('suche', '')] as $wort) {
                    $einzeln = pu_katalog_einzeln($wort);
                    if ($einzeln === null) continue;
                    pu_katalog_merken($einzeln);
                    $treffer    = [$einzeln];
                    $ungelistet = true;
                    break;
                }
            }

            // Gekappt wird bei 300. Wer ohne Filter sucht, bekommt sonst
            // vierhundert Einträge in ein Auswahlfeld — das ist keine Liste
            // mehr, sondern eine Wand. Die Zahl der Treffer steht dabei,
            // damit man merkt, dass gekappt wurde.
            pu_json_out([
                'ok'         => $k['ok'],
                'fehler'     => $k['fehler'],
                'geholt'     => $k['geholt'],
                'alt'        => $k['alt'],
                'gesamt'     => count($k['modelle']),
                'gefunden'   => count($treffer),

                // Wurde im Namen statt beim Hersteller gefunden? Die Oberfläche
                // sagt es dann hin — sonst sähe es aus, als gäbe es einen
                // Hersteller „grok", und beim nächsten Mal sucht man wieder so.
                'ausweich'   => $s['ausweich'],

                // Kam der Treffer aus der Einzelabfrage statt aus der Liste?
                'ungelistet' => $ungelistet,
                'hersteller' => pu_katalog_hersteller($k['modelle']),
                'modelle'    => array_slice($treffer, 0, 300),
            ]);
        }

        case 'sprache_stand':
            pu_recht_fordern('sprache.nutzen');
            pu_json_out(['ok' => true, 'an' => pu_regel_an('spracheingabe')]
                        + pu_sprache_bereit());

        // ------------------------------------------------------- Rechte-Matrix
        //
        // Drei Aktionen, ein Recht: wer die Matrix ändern darf, darf sie auch
        // sehen. Eine getrennte Lese-Erlaubnis waere ein Recht, das niemand
        // je anders setzen wuerde.
        case 'rechte_lesen':
            pu_recht_fordern('rechte.einstellungen');
            pu_json_out(['ok' => true] + pu_rechte_ausgabe());

        // Rollen & Rechte zum Nachlesen — für jeden Angemeldeten, auch
        // unregistriert (Entscheid 28.09.2026). Nur lesen, ohne Protokoll.
        case 'rollen_erklaert':
            pu_json_out(['ok' => true] + pu_rechte_ausgabe(false));

        case 'recht_setzen':
            pu_recht_fordern('rechte.einstellungen');
            pu_recht_setzen((string)d('ebene'), (string)d('recht'),
                            (bool)d('an', false), $ichId);
            pu_json_out(['ok' => true] + pu_rechte_ausgabe());

        case 'rechte_zuruecksetzen':
            pu_recht_fordern('rechte.einstellungen');
            $weg = pu_recht_zuruecksetzen($ichId);
            pu_json_out(['ok' => true, 'geloescht' => $weg] + pu_rechte_ausgabe());

        case 'klasse': {
            pu_recht_fordern('klassen.view');
            // Eine Lehrkraft sieht nur ihre Klassen (C8); wer zuordnen darf,
            // bekommt dazu die Klassen jeder Lehrkraft.
            $klasse = pu_klasse($ich);
            $zuordnung = [];
            if (pu_recht_hat('klassen.manage')) {
                foreach ($klasse as $l) {
                    if (pu_ebene($l) === 'lehrer') $zuordnung[(string)$l['id']] = pu_lehrer_gruppen((int)$l['id']);
                }
            }
            pu_json_out(['ok' => true, 'klasse' => $klasse, 'lehrer_klassen' => (object)$zuordnung,
                         'meine_klassen' => $ebene === 'lehrer' ? pu_lehrer_gruppen($ichId) : null]);
        }

        // Die Schule ordnet einer Lehrkraft Klassen zu (Plan 30_Community, C8).
        case 'lehrer_klassen_setzen': {
            pu_recht_fordern('klassen.manage');
            if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') pu_fehler('Nur per POST.', 405);
            $liste = pu_lehrer_gruppen_setzen((int)d('lehrer', 0), d('klassen', ''), $ichId);
            pu_json_out(['ok' => true, 'klassen' => $liste]);
        }

        // ------------------------------------------------ Rollenübernahme
        //
        // Antwort ist immer „neu laden": Rechte, Menü und Kennzahlen stehen
        // serverseitig im HTML, und ein halb umgeschaltetes Fenster wäre
        // schlimmer als ein kurzer Neuaufbau.
        case 'rolle_uebernehmen': {
            pu_recht_fordern('rollen.uebernehmen');
            pu_rolle_uebernehmen((int)d('lernender'));
            pu_json_out(['ok' => true, 'neu_laden' => true]);
        }

        // **Kein Rechtebedarf.** Zurück ins eigene Konto muss auch dann gehen,
        // wenn das übernommene Konto gar nichts darf — sonst sperrt sich Ebene 1
        // im Konto eines Schülers ein und kommt nur über Abmelden wieder heraus.
        case 'rolle_zurueck': {
            pu_rolle_zurueck();
            pu_json_out(['ok' => true, 'neu_laden' => true]);
        }

        case 'konto_anlegen':
            pu_recht_fordern('lernende.manage');
            // Nie höher als die eigene Ebene (PU_ANLEGEN), und nur, was es
            // auf diesem Rechner geben kann (PU_ARTEN).
            $neueRolle = (string)d('rolle', 'schueler');
            if (!in_array($neueRolle, PU_ANLEGEN[$ebene] ?? [], true)
                || pu_ebene_gedeckelt($neueRolle) !== $neueRolle) {
                pu_fehler('Diese Ebene kannst du hier nicht anlegen: ' . $neueRolle, 403);
            }
            pu_json_out(['ok' => true, 'id' => pu_lernenden_anlegen(
                (string)d('kennung'), (string)d('anzeigename'), (string)d('kennwort'),
                (string)d('rolle', 'schueler'), (string)d('gruppe', '')
            )]);

        case 'kennwort_zuruecksetzen':
            pu_recht_fordern('lernende.manage');
            pu_kennwort_setzen((int)d('lernender'), (string)d('neu'), $ichId);
            pu_json_out(['ok' => true]);

        case 'versuche_zu':
            pu_recht_fordern('schueler.view');
            pu_json_out(['ok' => true,
                'versuche' => pu_versuche_zu((int)d('lernender'), (string)d('aufgabe_id'))]);

        case 'urkunde_widerrufen':
            pu_recht_fordern('urkunde.ausstellen');
            pu_json_out(['ok' => pu_urkunde_widerrufen((string)d('code'), $ichId)]);

        case 'stoff_pruefen': {
            pu_recht_fordern('lektionen.manage');
            $index = pu_index(true);
            pu_json_out(['ok' => true, 'fehler' => $index['fehler'],
                'kurse' => count($index['kurse']), 'aufgaben' => count($index['aufgaben'])]);
        }

        default:
            pu_fehler('Unbekannte Aktion: ' . $aktion, 404);
    }
} catch (Throwable $e) {
    @file_put_contents(PU_LOGS . '/fehler.log',
        pu_jetzt() . ' ' . $aktion . ': ' . $e->getMessage() . "\n", FILE_APPEND);
    pu_fehler($e->getMessage(), 500);
}
