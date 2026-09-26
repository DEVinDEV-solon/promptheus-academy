<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Pläne, Token-Konto, Platzgrenze.
 *
 * An dieser Rechnung hängt Geld. Sie wird deshalb nicht auf „läuft
 * durch" geprüft, sondern auf die Aussagen, die sie macht:
 *
 *   · die Schule ist je Kopf am günstigsten — das ist die Zusage am Tor
 *   · der Kontostand ist die Summe der Buchungen, sonst nichts
 *   · es verfällt nichts, weder Kontingent noch Gekauftes (Cockpit-Plan E4)
 *   · ein Schüler ohne eigenes Abo ist über Klasse oder Schule gedeckt
 *   · Geschätztes bleibt als geschätzt erkennbar
 *
 * Aufruf:
 *     php -d extension=pdo_sqlite -d extension=sqlite3 tests/abo_test.php
 */

require_once __DIR__ . '/hilfe.php';
test_db_vorbereiten();

require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../srv/rechte.php';
require_once __DIR__ . '/../srv/lernende.php';
require_once __DIR__ . '/../srv/profil.php';
require_once __DIR__ . '/../srv/abo.php';

// ================================================================ Preistafel
gruppe('Die Preistafel');

gleich('Es gibt vier Pläne', 4, count(PU_PLAENE));
gleich('Es gibt drei Pakete', 3, count(PU_TOKENPAKETE));

// Die Zusage am Tor: je Kopf ist die Schule am günstigsten. Wäre das nicht
// so, zerfiele jede Einrichtung in Einzelkonten — und der Satz auf der
// Startseite wäre eine Unwahrheit.
$jeKopf = [];
foreach (PU_PLAENE as $k => $p) $jeKopf[$k] = pu_plan_je_kopf($p);

pruefe('Schule ist je Kopf am günstigsten',
       $jeKopf['schule'] === min($jeKopf), implode(' · ', array_map(
           fn($k, $v) => "$k: $v ct", array_keys($jeKopf), $jeKopf)));
pruefe('…dann die Klasse',   $jeKopf['klasse']  < $jeKopf['familie']);
pruefe('…dann die Familie',  $jeKopf['familie'] < $jeKopf['schueler']);

gleich('Der Klassenplan fasst 30 Schüler', 30, PU_PLAENE['klasse']['plaetze']);

foreach (PU_PLAENE as $k => $p) {
    pruefe("Plan $k hat ein Kontingent", $p['kontingent'] > 0);
    pruefe("Plan $k kostet etwas",       $p['cent'] > 0);
    pruefe("Plan $k nennt seine Trägerart",
           in_array($p['traeger_art'], ['person', 'klasse', 'schule'], true));
}

// Ein grösseres Paket muss je Euro mehr bringen — sonst wäre es keins.
$jeEuro = [];
foreach (PU_TOKENPAKETE as $k => $p) $jeEuro[$k] = $p['tokens'] / $p['cent'];
pruefe('Mittel bringt je Euro mehr als Klein', $jeEuro['mittel'] > $jeEuro['klein']);
pruefe('Gross bringt je Euro mehr als Mittel', $jeEuro['gross']  > $jeEuro['mittel']);

gleich('Cent werden deutsch formatiert', '4,90 €',   pu_eur(490));
gleich('…auch mit Tausendern',           '1.499,00 €', pu_eur(149900));

gruppe('Der Monatswechsel');

gleich('normaler Monat',        '2026-09-22', pu_monat_weiter('2026-08-22'));
gleich('Jahreswechsel',         '2027-01-15', pu_monat_weiter('2026-12-15'));
// Der 31. Januar hat im Februar kein Gegenstück — dann der Monatsletzte.
gleich('31. Januar wird zum 28. Februar', '2026-02-28', pu_monat_weiter('2026-01-31'));
gleich('31. Mai wird zum 30. Juni',       '2026-06-30', pu_monat_weiter('2026-05-31'));

// ================================================================ Buchen
gruppe('Ein Plan wird gebucht');

$chef   = pu_lernenden_anlegen('chef', 'Chefin', 'probe1234');
$lehrer = pu_lernenden_anlegen('kramer', 'Kramer', 'probe1234', 'lehrer', '6a');
pu_profil_setzen($lehrer, 'schule', 'Gesamtschule Am Hangweg');

$abo = pu_abo_buchen('klasse', $lehrer, '6a', 'klasse', $chef);

gleich('der Plan steht',        'klasse', $abo['plan']);
gleich('…und läuft',            true,     $abo['laeuft']);
gleich('…ist aber unbestätigt', false,    $abo['bestaetigt']);
gleich('Start ist heute',       pu_heute(), $abo['start']);
gleich('nächste Zahlung in einem Monat', pu_monat_weiter(pu_heute()), $abo['naechste_zahlung']);

wirft('ein erfundener Plan wird abgewiesen',
      fn() => pu_abo_buchen('person', $chef, '', 'gold', $chef), 'Diesen Plan gibt es nicht');

// Ein Schulplan auf einer Person wäre 149 Euro für ein Konto, und niemand
// merkt es. Deshalb muss der Plan zur Trägerart passen.
wirft('ein Schulplan passt nicht auf eine Person',
      fn() => pu_abo_buchen('person', $chef, '', 'schule', $chef), 'gilt für schule');

wirft('einem Klassenplan ohne Klassennamen fehlt etwas',
      fn() => pu_abo_buchen('klasse', $lehrer, '', 'klasse', $chef), 'Klassenname');

// ================================================================ Wer ist gedeckt
gruppe('Wer über welches Abo läuft');

$nele = pu_lernenden_anlegen('nele', 'Nele', 'probe1234', 'schueler', '6a');
pu_profil_setzen($nele, 'schule', 'Gesamtschule Am Hangweg');

$ihr = pu_abo_fuer($nele);
pruefe('Nele ist über die Klasse gedeckt', $ihr !== null);
gleich('…und zwar über den Klassenplan', 'klasse', $ihr['plan'] ?? '');

// Ein Kind ohne Klasse und ohne Schule hat kein Abo — und die Academy läuft
// trotzdem. Sie ist ein Lernprogramm, keine Schranke.
$frei = pu_lernenden_anlegen('einzeln', 'Einzeln', 'probe1234', 'schueler');
gleich('ohne Klasse und Schule kein Abo', null, pu_abo_fuer($frei));

// Das eigene Abo schlägt das der Klasse.
pu_abo_buchen('person', $nele, '', 'schueler', $chef);
gleich('ein eigenes Abo geht vor', 'schueler', pu_abo_fuer($nele)['plan']);

// ================================================================ Plätze
gruppe('Die Platzgrenze');

$abo2 = pu_abo_fuer($lehrer);
gleich('die Klasse hat 30 Plätze', 30, $abo2['plaetze']);

// Lehrkraft und Elternteil belegen keinen Schülerplatz — sonst wäre eine
// Klasse mit 30 Kindern schon beim Anlegen voll.
$vorher = $abo2['belegt'];
pu_lernenden_anlegen('mutter', 'Mutter', 'probe1234', 'eltern', '6a');
gleich('ein Elternkonto belegt keinen Platz', $vorher, pu_abo_fuer($lehrer)['belegt']);

// Die Klasse auffüllen, bis sie voll ist.
$da = pu_abo_fuer($lehrer)['belegt'];
$aufKlassenplan = 0;   // eines der Kinder wird weiter unten noch gebraucht
for ($i = $da; $i < 30; $i++) {
    $k = pu_lernenden_anlegen('kind' . $i, 'Kind ' . $i, 'probe1234', 'schueler', '6a');
    if ($aufKlassenplan === 0) $aufKlassenplan = $k;
}
gleich('jetzt sind 30 Plätze belegt', 30, pu_abo_fuer($lehrer)['belegt']);

wirft('das 31. Konto wird abgewiesen',
      fn() => pu_lernenden_anlegen('zuviel', 'Zu viel', 'probe1234', 'schueler', '6a'),
      'ist voll');

// Wer drin ist, bleibt drin — die Grenze gilt beim Anlegen, nicht beim Zählen.
gleich('die vorhandenen 30 bleiben', 30, pu_abo_fuer($lehrer)['belegt']);

// In einer anderen Klasse ist Platz.
$andere = pu_lernenden_anlegen('anders', 'Andere', 'probe1234', 'schueler', '7b');
pruefe('eine andere Klasse ist nicht betroffen', $andere > 0);

// ================================================================ Token
gruppe('Das Token-Konto');

$stand = pu_token_stand($nele);
pruefe('das Kontingent ist gutgeschrieben', $stand['kontingent'] > 0);
gleich('noch nichts verbraucht', 0, $stand['verbraucht']);
// Gekauft ist noch nichts. Was dasteht, ist der Gratis-Testzugang aus dem
// Anlegen des Kontos — er zählt wie Guthaben, weil er nicht verfällt.
gleich('nur der Testzugang liegt als Guthaben da', PU_PROBE_TOKEN, $stand['gekauft']);

$vorher = $stand['rest'];
pu_token_verbrauchen($nele, 'Tutor · prometheus', 1200, false, 'deepseek/v4');
$stand = pu_token_stand($nele);

gleich('der Verbrauch steht drin',     1200,            $stand['verbraucht']);
gleich('…und geht vom Rest ab',        $vorher - 1200,  $stand['rest']);
gleich('in der Anzeige geht der Verbrauch zuerst gegen das Kontingent',
       PU_PROBE_TOKEN, $stand['guthaben']);

// Ein Fehlschlag kostet nichts: 0 Token werden nicht gebucht.
$vorher = $stand['verbraucht'];
pu_token_verbrauchen($nele, 'Tutor · athena', 0);
gleich('null Token werden nicht gebucht', $vorher, pu_token_stand($nele)['verbraucht']);

gruppe('Einzahlen und bestätigen');

$e = pu_token_einzahlen($nele, 'mittel', $chef);
gleich('das Paket bringt Token', PU_TOKENPAKETE['mittel']['tokens'], $e['tokens']);

$stand = pu_token_stand($nele);
gleich('…zählt aber erst nach der Bestätigung',
       PU_PROBE_TOKEN, $stand['gekauft']);
gleich('…und steht solange als offen',
       PU_TOKENPAKETE['mittel']['tokens'], $stand['offen']);

wirft('ein erfundenes Paket wird abgewiesen',
      fn() => pu_token_einzahlen($nele, 'riesig', $chef), 'Dieses Paket gibt es nicht');

// Bestätigen schaltet die Einzahlungen des Abos frei.
$eigenes = pu_abo_fuer($nele);
pu_abo_bestaetigen($eigenes['id'], $chef);

$stand = pu_token_stand($nele);
gleich('nach der Bestätigung zählt es',
       PU_TOKENPAKETE['mittel']['tokens'] + PU_PROBE_TOKEN, $stand['gekauft']);
gleich('…und nichts ist mehr offen', 0, $stand['offen']);

gruppe('Es verfällt nichts — auch das Kontingent nicht');

// Neue Kontingente tragen kein Verfallsdatum.
$st = pu_db()->prepare("SELECT COUNT(*) FROM token_buchungen
                         WHERE abo = ? AND art = 'kontingent' AND verfaellt <> ''");
$st->execute([$eigenes['id']]);
gleich('neue Kontingente haben kein Verfallsdatum', 0, (int)$st->fetchColumn());

// Eine ältere Zeile aus der Zeit, als das Kontingent noch verfiel: Ihr Datum
// liegt in der Vergangenheit, und sie zählt trotzdem voll mit.
$vorher = pu_token_stand($nele);
pu_token_eintragen($nele, $eigenes['id'], 'kontingent', 'Alter Monat',
                   999000, 0, false, '', '2020-01-01');
$stand = pu_token_stand($nele);
gleich('ein altes Kontingent mit Datum zählt voll mit',
       $vorher['kontingent'] + 999000, $stand['kontingent']);
gleich('…und erhöht den Rest', $vorher['rest'] + 999000, $stand['rest']);
gleich('das Gekaufte bleibt unberührt',
       PU_TOKENPAKETE['mittel']['tokens'] + PU_PROBE_TOKEN, $stand['gekauft']);

// Derselbe Zeitraum wird nicht zweimal gutgeschrieben — auch dann nicht, wenn
// die vorhandene Zeile noch das alte Format hat (Datum in `verfaellt`).
$plan = pu_plan((string)$eigenes['plan']);
$ab = '2031-03-15';
pu_token_eintragen($nele, $eigenes['id'], 'kontingent', 'Monatskontingent alt',
                   (int)$plan['kontingent'], 0, false, '', pu_monat_weiter($ab));
$zeilen = static function () use ($eigenes): int {
    $st = pu_db()->prepare("SELECT COUNT(*) FROM token_buchungen WHERE abo = ? AND art = 'kontingent'");
    $st->execute([$eigenes['id']]);
    return (int)$st->fetchColumn();
};
$n = $zeilen();
pu_kontingent_gutschreiben((int)$eigenes['id'], $nele, $plan, $ab);
gleich('alter Zeitraum im alten Format: keine zweite Gutschrift', $n, $zeilen());
pu_kontingent_gutschreiben((int)$eigenes['id'], $nele, $plan, '2031-05-15');
gleich('neuer Zeitraum: eine Gutschrift', $n + 1, $zeilen());
pu_kontingent_gutschreiben((int)$eigenes['id'], $nele, $plan, '2031-05-15');
gleich('derselbe neue Zeitraum noch einmal: keine', $n + 1, $zeilen());

gruppe('Der Gratis-Testzugang');

// Er soll einen Euro wert sein — gerechnet zum eigenen Ladenpreis, nicht zu
// einem, den wir uns dafür zurechtlegen. Wenn das kleinste Paket sich ändert,
// muss diese Prüfung anschlagen.
gleich('ist genau einen Euro wert, zum Preis des kleinsten Pakets',
       (int)round(PU_TOKENPAKETE['klein']['tokens'] / (PU_TOKENPAKETE['klein']['cent'] / 100)),
       PU_PROBE_TOKEN);

pruefe('war beim Anlegen des Kontos schon da', pu_probe_gutschreiben($nele) === false);

$vorherGekauft = pu_token_stand($nele)['gekauft'];
pu_probe_gutschreiben($nele);
gleich('und ein zweiter Versuch bringt nichts',
       $vorherGekauft, pu_token_stand($nele)['gekauft']);

// Kein Verfallsdatum: sonst wäre es ein Probierguthaben unter Zeitdruck.
$st = pu_db()->prepare(
    "SELECT verfaellt FROM token_buchungen WHERE lernender = ? AND art = 'probe'");
$st->execute([$nele]);
gleich('und verfällt nie', '', (string)$st->fetchColumn());

// ================================================================ Das Tor
//
// Der Teil, der verhindert, dass die Kosten ins Unendliche laufen. Er wird an
// einem eigenen Konto geprüft, das **kein Abo** hat: dann ist der Testzugang
// von 100.000 Token alles, was dasteht, und jede Zahl unten ist nachrechenbar.
gruppe('Der Minus-Rahmen — das Konto läuft nicht unendlich ins Minus');

$knapp = pu_lernenden_anlegen('knapp', 'Knapp', 'probe1234', 'schueler', '9z');
gleich('kein Abo, also nur der Testzugang', null, pu_abo_fuer($knapp));
gleich('und der steht bereit', PU_PROBE_TOKEN, pu_token_stand($knapp)['rest']);

gleich('am Anfang ist alles offen', 'offen', pu_token_stand($knapp)['lage']);
pruefe('…und das Tor auch', pu_token_tor($knapp)['offen']);

// -------- Knapp: weniger als eine Lektion übrig
pu_token_verbrauchen($knapp, 'Tutor · prometheus', PU_PROBE_TOKEN - PU_TOKEN_WARNUNG + 1);
gleich('unter einer Lektion Rest wird gewarnt', 'knapp', pu_token_stand($knapp)['lage']);
pruefe('…gesperrt wird deshalb nichts', pu_token_tor($knapp)['offen']);

// -------- Minus: der Rahmen trägt
pu_token_verbrauchen($knapp, 'Tutor · prometheus', PU_TOKEN_WARNUNG);
$s = pu_token_stand($knapp);
pruefe('jetzt steht das Konto im Minus', $s['rest'] < 0, 'Rest: ' . $s['rest']);
gleich('…und der Rahmen trägt', 'minus', $s['lage']);
pruefe('Das Tor bleibt offen — niemand wird mitten in der Aufgabe ausgesperrt',
       pu_token_tor($knapp)['offen']);

// -------- Der Rahmen ist so gross wie eine gut begleitete Lektion
gleich('der Rahmen reicht für rund zwölf Tutorantworten',
       12, (int)floor(PU_MINUS_RAHMEN / PU_TUTORANTWORT));

// -------- Stopp: der Rahmen ist aufgebraucht
//
// **Der Kern der Sache.** Ohne diese Prüfung läuft das Minus weiter, solange
// jemand weiterfragt — und genau das soll nicht mehr gehen.
pu_token_verbrauchen($knapp, 'Tutor · prometheus', PU_MINUS_RAHMEN);
$s = pu_token_stand($knapp);
gleich('der Rahmen ist aufgebraucht', 0, $s['rahmen_rest']);
gleich('…die Lage heisst Stopp',      'stopp', $s['lage']);

$tor = pu_token_tor($knapp);
pruefe('und das Tor ist zu', !$tor['offen']);
pruefe('mit einem Schild, nicht mit einem Fehler', is_array($tor['meldung']));

// -------- Das Minus wächst nicht weiter, egal wie oft noch gebucht wird
$tief = pu_token_stand($knapp)['minus'];
pu_token_verbrauchen($knapp, 'Tutor · prometheus', 50000);
pruefe('der Rahmen erneuert sich nicht — er bleibt aufgebraucht',
       pu_token_stand($knapp)['rahmen_rest'] === 0);
pruefe('…und das Tor bleibt zu', !pu_token_tor($knapp)['offen']);
pruefe('das Minus ist gewachsen, weil weiter gebucht wurde',
       pu_token_stand($knapp)['minus'] > $tief);

// -------- Was auf dem Schild steht
gruppe('Das Schild beim Stopp');

$m = pu_nachlade_meldung($knapp, pu_token_stand($knapp));
pruefe('es nennt zuerst, was geschafft wurde', $m['bilanz'] !== '');
pruefe('es erklärt, warum jetzt Schluss ist',  $m['grund']  !== '');
pruefe('Lesen und Aufgaben lösen geht weiter', str_contains($m['weiter'], 'kostet nichts'));

$arten = array_column($m['wege'], 'art');
pruefe('es zeigt den Weg über das kleine Paket', in_array('paket', $arten, true));
pruefe('…und den Weg über die Gemeinschaft',    in_array('talente', $arten, true));

$paket = $m['wege'][array_search('paket', $arten, true)];
pruefe('das kleine Paket kostet 5 Euro', str_contains($paket['titel'], '5,00 €'),
       'Titel: ' . $paket['titel']);
pruefe('…und es steht dran, dass es für einen ganzen Kurs reicht',
       str_contains($paket['text'], 'ganzen Kurs'));

$talente = $m['wege'][array_search('talente', $arten, true)];
pruefe('der Talente-Weg nennt die Bedingung: etwas können, das andere brauchen',
       str_contains($talente['text'], 'das andere gerade brauchen'));
pruefe('…und gibt sich nicht als fertig aus, solange die Gemeinschaft fehlt',
       $talente['bald'] === true);

// Ein Schüler auf einem Klassenplan kann selbst nichts nachkaufen — ihm „5 Euro
// nachladen" hinzuhalten, wäre eine Aufforderung an das falsche Ohr. (Nele
// taugt dafür nicht: sie hat weiter oben ein eigenes Abo bekommen.)
gleich('das Kind hängt am Klassenplan', 'klasse', pu_abo_fuer($aufKlassenplan)['plan']);
$mKlasse = pu_nachlade_meldung($aufKlassenplan, pu_token_stand($aufKlassenplan));
$artenK  = array_column($mKlasse['wege'], 'art');
pruefe('auf einem fremden Plan steht statt des Pakets der Träger',
       in_array('traeger', $artenK, true) && !in_array('paket', $artenK, true));
pruefe('der Talente-Weg steht auch dort', in_array('talente', $artenK, true));

// -------- Die harte Sperre: gar kein Rahmen
gruppe('token_sperre = an — Schluss bei null');

$hart = pu_lernenden_anlegen('hart', 'Hart', 'probe1234', 'schueler', '9z');
pu_token_verbrauchen($hart, 'Tutor · prometheus', PU_PROBE_TOKEN);

gleich('ohne Sperre trägt der Rahmen noch', 'minus', pu_token_stand($hart)['lage']);
pruefe('…und das Tor ist offen', pu_token_tor($hart)['offen']);

pu_einst_global_setzen('token_sperre', 'an');
pruefe('mit Sperre ist bei null Schluss', !pu_token_tor($hart)['offen']);
gleich('…und das Schild sagt, warum', 'gesperrt',
       pu_token_tor($hart)['meldung']['lage']);
pu_einst_global_setzen('token_sperre', 'aus');

// -------- Ebene 1 kennt keine Grenze
//
// Der Betreiber bezahlt die Rechnung selbst und baut damit die Academy. Ein
// Tor, das ihm beim Prüfen den Tutor abschaltet, ist eine Schranke gegen die
// eigene Werkstatt.
gruppe('Der Admin läuft unbegrenzt');

$admin = pu_lernenden_anlegen('chef2', 'Chefin', 'probe1234', 'admin');
gleich('das Konto steht auf Ebene 1', 'admin', pu_ebene(pu_profil($admin)));
pruefe('…und ist damit von der Grenze ausgenommen', pu_token_frei($admin));

// Weit über jeden Rahmen hinaus verbrauchen.
pu_token_verbrauchen($admin, 'Tutor · prometheus', PU_PROBE_TOKEN + PU_MINUS_RAHMEN * 5);

$s = pu_token_stand($admin);
pruefe('das Konto steht tief im Minus', $s['minus'] > PU_MINUS_RAHMEN,
       'Minus: ' . $s['minus']);
gleich('…der Rahmen ist längst aufgebraucht', 0, $s['rahmen_rest']);
pruefe('trotzdem ist das Tor offen', pu_token_tor($admin)['offen']);
gleich('…und es steht dran, warum', true, pu_token_tor($admin)['unbegrenzt']);

// Auch die harte Sperre gilt für Ebene 1 nicht — sonst wäre der Schalter ein
// Weg, sich selbst auszusperren.
pu_einst_global_setzen('token_sperre', 'an');
pruefe('auch token_sperre = an ändert daran nichts', pu_token_tor($admin)['offen']);
pu_einst_global_setzen('token_sperre', 'aus');

// Keine Warnung und kein Schild: „noch elf Fragen" wäre für dieses Konto falsch.
$lage = pu_token_lage($admin);
gleich('die Lage heisst unbegrenzt', 'unbegrenzt', $lage['lage']);
gleich('…ohne Restzahl',             null,         $lage['antworten']);
gleich('…und ohne Schild',           null,         $lage['meldung']);

// **Gebucht wird trotzdem.** Die Ausnahme hebt die Grenze auf, nicht die
// Buchführung — sonst stünde der Verbrauch der Testläufe nirgends, und man
// sähe ihn zum ersten Mal auf der Rechnung des Anbieters.
pruefe('der Verbrauch steht trotzdem im Journal', $s['verbraucht'] > 0);
pruefe('…und taucht im Cockpit auf', count(pu_cockpit($admin)['letzte']) > 0);

// Die Ausnahme gilt NUR für Ebene 1. Eine Schule, deren Lehrerkonten
// unbegrenzt verbrauchen, hat das Kostenproblem wieder, wegen dem es den
// Rahmen gibt. Diese Prüfung schlägt an, wenn die Ausnahme nach unten rutscht.
foreach (['verwaltung', 'lehrer', 'eltern', 'schueler'] as $ebene) {
    $wer = pu_lernenden_anlegen('frei_' . $ebene, 'Test ' . $ebene, 'probe1234', $ebene);
    pruefe($ebene . ' ist NICHT ausgenommen', !pu_token_frei($wer));
}

// -------- Nachlegen macht wieder auf
gruppe('Nachlegen öffnet das Tor wieder');

$ein = pu_token_einzahlen($hart, 'klein', $chef);
pruefe('vorgemerkt allein reicht nicht — es ist ja nichts bestätigt',
       pu_token_stand($hart)['rest'] <= 0);

pu_db()->prepare('UPDATE token_buchungen SET bestaetigt = 1 WHERE id = ?')->execute([$ein['id']]);
$s = pu_token_stand($hart);
pruefe('nach der Bestätigung steht wieder Guthaben da', $s['rest'] > 0);
gleich('…die Lage ist wieder offen', 'offen', $s['lage']);
pruefe('…und das Tor auch',          pu_token_tor($hart)['offen']);
gleich('das Minus ist weg',          0, $s['minus']);
gleich('…und damit steht der ganze Rahmen wieder bereit',
       PU_MINUS_RAHMEN, $s['rahmen_rest']);

gruppe('Widerruf beim Token-Kauf');

// § 356 Abs. 5 BGB verlangt ZWEIERLEI: das ausdrückliche Verlangen und die
// Kenntnisbestätigung. Ein einzelnes Häkchen lässt das Recht bestehen — das
// ist die Prüfung, die anschlägt, wenn jemand die Bedingung zu „oder"
// vereinfacht.
$zustimmungVon = function (int $id): string {
    $st = pu_db()->prepare('SELECT zustimmung FROM token_buchungen WHERE id = ?');
    $st->execute([$id]);
    return (string)$st->fetchColumn();
};

$ohne = pu_token_einzahlen($nele, 'klein', $chef);
gleich('ohne Häkchen bleibt das Widerrufsrecht', 'bleibt', $ohne['widerruf']);
gleich('…und es steht keine Zustimmung an der Buchung', '', $zustimmungVon($ohne['id']));

$halb = pu_token_einzahlen($nele, 'klein', $chef, true, false);
gleich('ein einzelnes Häkchen genügt nicht', 'bleibt', $halb['widerruf']);
gleich('…auch nicht das andere allein', 'bleibt',
       pu_token_einzahlen($nele, 'klein', $chef, false, true)['widerruf']);

$beide = pu_token_einzahlen($nele, 'klein', $chef, true, true);
gleich('beide zusammen lassen es erlöschen', 'erloschen', $beide['widerruf']);
pruefe('…und der Zeitpunkt steht an der Buchung',
       $zustimmungVon($beide['id']) !== '', 'Zustimmung: ' . $zustimmungVon($beide['id']));

// Die Häkchen sind keine Kaufbedingung: ohne sie geht der Kauf durch.
pruefe('ein Kauf ohne Häkchen wird trotzdem gebucht', $ohne['id'] > 0);

gruppe('Gemessen und geschätzt bleiben unterscheidbar');

pu_token_verbrauchen($nele, 'Tutor · cli', 500, true, 'claude-cli');

$st = pu_db()->prepare(
    "SELECT COUNT(*) FROM token_buchungen WHERE lernender = ? AND geschaetzt = 1");
$st->execute([$nele]);
gleich('eine geschätzte Buchung', 1, (int)$st->fetchColumn());

$st = pu_db()->prepare(
    "SELECT COUNT(*) FROM token_buchungen
     WHERE lernender = ? AND art = 'verbrauch' AND geschaetzt = 0");
$st->execute([$nele]);
gleich('eine gemessene Buchung', 1, (int)$st->fetchColumn());

// ================================================================ Cockpit
gruppe('Das Cockpit');

$c = pu_cockpit($nele);
pruefe('es kennt den Plan',       $c['abo'] !== null);
pruefe('es kennt den Stand',      isset($c['stand']['rest']));
pruefe('es listet den Verbrauch', count($c['verbrauch']) >= 1);
pruefe('es listet Buchungen',     count($c['letzte']) >= 1);
pruefe('es bringt die Preistafel mit', count($c['plaene']) === 4);

$geschaetzt = array_filter($c['verbrauch'], fn($v) => $v['geschaetzt']);
pruefe('Geschätztes ist auch im Cockpit markiert', count($geschaetzt) >= 1);

// Jeder sieht nur sich. Das ist keine Feinheit: im Cockpit stehen Beträge.
$fremd = pu_cockpit($frei);
gleich('ein fremdes Konto hat nichts verbraucht', 0, $fremd['stand']['verbraucht']);
gleich('…und keinen Plan',                        null, $fremd['abo']);

// ================================================================ Beenden
gruppe('Beenden');

pu_abo_beenden($eigenes['id'], $chef);
gleich('danach greift wieder die Klasse', 'klasse', pu_abo_fuer($nele)['plan']);

// ================================================================ Träger
//
// Steht am Ende, weil es Abos anlegt und die Prüfungen davor sonst auf einem
// anderen Stand sässen.
gruppe('Ein Personenplan hat keinen Träger');

// Gemeldet aus dem Cockpit: ein Schülerplan zeigte „für dieses Konto
// PROMPTHEUS GYMNASIUM". Das Formular bat darum, das Feld leerzulassen — aber
// eine Bitte im Kleingedruckten ist keine Regel. Jetzt wird der Name
// verworfen, statt bedeutungslos in der Datenbank zu stehen.
$mitName = pu_abo_buchen('person', $frei, 'PROMPTHEUS GYMNASIUM', 'schueler', $chef);
gleich('ein mitgeschickter Name wird verworfen', '', $mitName['traeger_name']);

// Bei Klasse und Schule ist der Name dagegen der Schlüssel, über den Konten
// zugeordnet werden — dort muss er stehenbleiben.
$mitKlasse = pu_abo_buchen('klasse', $lehrer, '7c', 'klasse', $chef);
gleich('bei der Klasse bleibt er stehen', '7c', $mitKlasse['traeger_name']);

$mitSchule = pu_abo_buchen('schule', $chef, 'PROMPTHEUS GYMNASIUM', 'schule', $chef);
gleich('bei der Schule ebenso', 'PROMPTHEUS GYMNASIUM', $mitSchule['traeger_name']);

// ================================================================ Gutschrift
/*
 * **Die Gutschrift ist die Buchung ohne Zahlung.** Sie ist der Weg, auf dem
 * der Betreiber sich und seinen Konten Guthaben gibt, damit auf der eigenen
 * Academy überhaupt gearbeitet werden kann — es ist ja kein Zahlungsdienst
 * eingebunden.
 *
 * Zwei Dinge müssen dabei stimmen, und beide sind still, wenn sie es nicht
 * tun: Sie muss SOFORT gelten (eine Einzahlung wartet auf einen Haken, den
 * hier niemand setzt), und sie muss im Kontostand ANKOMMEN. Eine Buchung, die
 * im Journal steht und in der Summe fehlt, sieht wie ein Erfolg aus.
 */
gruppe('Gutschreiben ohne Zahlung');

$betreiber = pu_lernenden_anlegen('betrieb', 'Betrieb', 'probe1234', 'admin');
$vorherBetrieb = pu_token_stand($betreiber)['rest'];

$gut = pu_token_gutschreiben($betreiber, 50000000, 'Betriebsguthaben', $betreiber);
gleich('der Betrag kommt im Stand an',
       $vorherBetrieb + 50000000, pu_token_stand($betreiber)['rest']);

$zeile = pu_db()->query(
    "SELECT art, cent, bestaetigt FROM token_buchungen ORDER BY id DESC LIMIT 1")->fetch();

/* Eigene Art und nicht `einzahlung`: Eine Einzahlung behauptet, jemand habe
   ein Paket gekauft. Das wäre gelogen, und ein Journal, dessen Einträge ihre
   Herkunft verschleiern, ist keines. */
gleich('sie heisst „gutschrift"', 'gutschrift', $zeile['art']);
gleich('…und nennt keinen Preis',  0, (int)$zeile['cent']);

/* Sofort gültig. `pu_token_eintragen` setzt `bestaetigt = 0` NUR für
   `einzahlung` — stünde die Gutschrift dort, wartete sie ewig auf einen
   Zahlungseingang, den es nicht gibt. */
gleich('sie gilt sofort', 1, (int)$zeile['bestaetigt']);

/* Und sie ist kein Verbrauch. Derselbe Satz wie bei den Talenten, und aus
   demselben Grund: Der Balken „wohin geht mein Geld" darf davon nichts
   sehen. */
gleich('kein Verbrauch', 0, pu_token_stand($betreiber)['verbraucht']);

wirft('null geht nicht',
      fn() => pu_token_gutschreiben($betreiber, 0, 'Nichts'), 'ist positiv');
wirft('ohne Grund geht nicht',
      fn() => pu_token_gutschreiben($betreiber, 1000, '  '), 'braucht einen Grund');

// ================================================================ Talente weiterreichen
/*
 * **Hier wird Guthaben verschoben — also wird jede Aussage einzeln geprüft.**
 *
 * Der teuerste Fehler wäre kein Absturz, sondern eine Überweisung, die
 * gutschreibt, ohne abzubuchen: Sie fällt niemandem auf, weil sich beide
 * Seiten über mehr Guthaben freuen. Deshalb steht unter jeder Prüfung, die
 * einen Empfang bestätigt, auch eine, die den Abgang bestätigt.
 */
gruppe('Talente gehen die Kette hinunter, nie hinauf');

$dir     = pu_lernenden_anlegen('direktion', 'Direktion',    'probe1234', 'verwaltung', '');
$papa    = pu_lernenden_anlegen('papa',      'Papa',         'probe1234', 'eltern',   '8d');
$sohn    = pu_lernenden_anlegen('sohn',      'Sohn',         'probe1234', 'schueler', '8d');
$fremdes = pu_lernenden_anlegen('fremd',     'Fremdes Kind', 'probe1234', 'schueler', '8d');

foreach ([$dir, $papa, $sohn, $fremdes] as $w) {
    pu_profil_setzen($w, 'schule', 'Gesamtschule Am Hangweg');
}
pu_profil_kind_setzen($papa, $sohn);

// -------- Wer wen erreicht
$ketteChef = array_column(pu_talente_empfaenger($chef), 'id');
pruefe('der Admin erreicht die Verwaltung', in_array($dir,  $ketteChef, true));
pruefe('…und die Schüler',                  in_array($sohn, $ketteChef, true));
pruefe('…aber nie sich selbst',            !in_array($chef, $ketteChef, true));

$ketteLehrer = array_column(pu_talente_empfaenger($lehrer), 'id');
pruefe('der Lehrer erreicht Eltern', in_array($papa, $ketteLehrer, true));
pruefe('…und Schüler seiner Schule',  in_array($sohn, $ketteLehrer, true));

/* Nach oben ist zu. Ein Schüler, der seinem Lehrer Guthaben schicken kann,
   macht aus einem Journaleintrag eine Frage, die man ihm nicht ansieht:
   Geschenk oder Bitte um eine bessere Note. */
pruefe('…aber nicht die Verwaltung über ihm', !in_array($dir, $ketteLehrer, true));

$kettePapa = array_column(pu_talente_empfaenger($papa), 'id');
gleich('ein Elternteil erreicht genau sein Kind', [$sohn], $kettePapa);

/* Die Gegenprobe zur Richtung von `kind_von`: Sie steht am ELTERNkonto und
   zeigt auf das Kind. Andersherum gelesen bekäme jeder Elternteil eine leere
   Liste — ohne Fehlermeldung, also unbemerkt. */
pruefe('…und nicht das Kind der Nachbarn', !in_array($fremdes, $kettePapa, true));

gleich('ein Schüler erreicht niemanden', [], pu_talente_empfaenger($sohn));

// -------- Der Umkreis
$extern = pu_lernenden_anlegen('extern', 'Extern', 'probe1234', 'schueler', '1a');
pu_profil_setzen($extern, 'schule', 'Andere Schule');

pruefe('die Verwaltung erreicht keine fremde Schule',
       !in_array($extern, array_column(pu_talente_empfaenger($dir), 'id'), true));
pruefe('der Admin dagegen schon',
       in_array($extern, array_column(pu_talente_empfaenger($chef), 'id'), true));

// -------- Die Buchung
$vorherSohn = pu_token_stand($sohn)['rest'];
pu_token_eintragen($papa, 0, 'einzahlung', 'Startguthaben für die Prüfung', 50000);
$vorherPapa = pu_token_stand($papa)['rest'];

$erg = pu_talente_senden($papa, $sohn, 12000, 'Für die Prüfungswoche');
gleich('der Betrag steht in der Antwort', 12000, $erg['betrag']);
gleich('beim Kind gutgeschrieben',   $vorherSohn + 12000, pu_token_stand($sohn)['rest']);
gleich('…und beim Elternteil abgebucht', $vorherPapa - 12000, pu_token_stand($papa)['rest']);

/* Der wichtigste Satz dieses Blocks: **Eine Überweisung ist kein Verbrauch.**
   Landete sie dort, wäre der Balken „wohin geht mein Geld" falsch — und zwar
   in die Richtung, die niemand nachrechnet. */
gleich('beim Empfänger kein Verbrauch', 0, pu_token_stand($sohn)['verbraucht']);
gleich('…und beim Absender auch nicht', 0, pu_token_stand($papa)['verbraucht']);

// -------- Was nicht geht
wirft('nicht an sich selbst',
      fn() => pu_talente_senden($papa, $papa, 1000), 'sich selbst');
wirft('nicht die Kette hinauf',
      fn() => pu_talente_senden($sohn, $papa, 1000), 'darfst du keine Talente');
wirft('nicht an ein fremdes Kind',
      fn() => pu_talente_senden($papa, $fremdes, 1000), 'darfst du keine Talente');
wirft('nicht unter dem kleinsten Betrag',
      fn() => pu_talente_senden($papa, $sohn, 1), 'kleinste Betrag');
wirft('nicht über der Obergrenze',
      fn() => pu_talente_senden($papa, $sohn, PU_TALENT_MAX + 1), 'höchstens');

/* **Niemand verschenkt den Minus-Rahmen.** Er trägt eine angefangene Lektion
   über die Ziellinie; er ist keine Kreditlinie für Geschenke. Geprüft wird
   deshalb gegen `rest` und nicht gegen `rahmen_rest`. */
$restPapa = pu_token_stand($papa)['rest'];
wirft('nicht mehr, als da ist',
      fn() => pu_talente_senden($papa, $sohn, $restPapa + 1), 'reicht dein Guthaben nicht');
gleich('…und dann ist auch nichts abgebucht', $restPapa, pu_token_stand($papa)['rest']);

/* Ebene 1 ist ausgenommen, weil sie ohnehin ohne Grenze verbraucht
   (`pu_token_frei`). Ein Admin, der erst einzahlen müsste, um verteilen zu
   dürfen, wäre eine Schranke ohne Zweck. */
$vorherDir = pu_token_stand($dir)['rest'];
pu_talente_senden($chef, $dir, 30000, 'Startpaket');
gleich('der Admin verteilt ohne eigenes Guthaben',
       $vorherDir + 30000, pu_token_stand($dir)['rest']);

// -------- Das Protokoll
$prot = pu_db()->query(
    "SELECT aktion FROM protokoll
      WHERE aktion IN ('talente_gesendet','talente_empfangen')
      ORDER BY id DESC LIMIT 2")->fetchAll();

gleich('jede Überweisung schreibt zwei Zeilen', 2, count($prot));
$arten = array_column($prot, 'aktion');
sort($arten);
gleich('eine gesendet, eine empfangen', ['talente_empfangen', 'talente_gesendet'], $arten);

bilanz();
