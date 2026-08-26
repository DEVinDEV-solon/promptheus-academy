<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Die Rechte-Matrix.
 *
 * Zwei Sorten Prüfungen stehen hier, und die zweite ist die wichtigere.
 *
 * **Erstens:** die Matrix selbst — jede Zelle aus `Login-Level-Rechte-Plan.md`
 * §2, die Abschottung von Ebene 1, die Hash-Kette im Protokoll.
 *
 * **Zweitens:** der Abgleich mit `api.php`. Ein Schalter, der nichts
 * schaltet, ist schlimmer als kein Schalter — er verspricht Sicherheit. Also
 * wird gelesen, was in api.php wirklich geprüft wird, und mit der Liste in
 * PU_RECHTE verglichen. Wer eine Aktion hinzufügt und die Prüfung vergisst,
 * bekommt hier ein rotes Kreuz statt einer offenen Tür.
 *
 * Aufruf:
 *     php -d extension=pdo_sqlite -d extension=sqlite3 tests/rechte_test.php
 */

require_once __DIR__ . '/hilfe.php';
test_db_vorbereiten();

require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../srv/rechte.php';
require_once __DIR__ . '/../srv/lernende.php';

/** Kurzform: darf diese Ebene das? */
function darf(string $ebene, string $recht): bool
{
    return pu_recht_hat($recht, ['rolle' => $ebene]);
}

// ============================================================ Vorgabe-Matrix
gruppe('Die Matrix aus dem Plan');

pruefe('Ebene 1 hat alles', (function () {
    foreach (PU_RECHTE as $r) {
        if (!darf('admin', $r['name'])) return false;
    }
    return true;
})());

gleich('Verwaltung darf Konten anlegen',      true,  darf('verwaltung', 'lernende.manage'));
gleich('Verwaltung darf Kurse freigeben',     true,  darf('verwaltung', 'kurse.veroeffentlichen'));
gleich('Lehrer darf Kurse pflegen',           true,  darf('lehrer', 'kurse.manage'));
gleich('Lehrer darf sie NICHT freigeben',     false, darf('lehrer', 'kurse.veroeffentlichen'));
gleich('Schüler darf Aufgaben lösen',         true,  darf('schueler', 'lernen.ausfuehren'));
gleich('Schüler darf keine Konten anlegen',   false, darf('schueler', 'lernende.manage'));
gleich('Schüler sieht keine fremden Antworten', false, darf('schueler', 'schueler.view'));
gleich('Eltern lösen keine Aufgaben',         false, darf('eltern', 'lernen.ausfuehren'));
gleich('Eltern sehen den Fortschritt',        true,  darf('eltern', 'fortschritt.eigen'));
gleich('Eltern sehen keine Klassenliste',     false, darf('eltern', 'klassen.view'));

// ============================================================ Ebene 1 abgeschottet
gruppe('Ebene 1 ist abgeschottet');

foreach (['rollen.manage', 'ki.einstellungen', 'wartung.ausfuehren',
          'rechte.einstellungen', 'schulen.manage', 'pool.kuratieren'] as $nur1) {
    foreach (['verwaltung', 'lehrer', 'eltern', 'schueler'] as $e) {
        gleich("$e hat $nur1 nicht", false, darf($e, $nur1));
    }
}

wirft('Die Admin-Spalte lässt sich nicht abschalten',
      fn() => pu_recht_setzen('admin', 'rechte.einstellungen', false, 1),
      'Admin-Spalte');

wirft('Ein Ebene-1-Recht lässt sich nicht weitergeben',
      fn() => pu_recht_setzen('verwaltung', 'rollen.manage', true, 1),
      'Ebene 1 allein');

wirft('Unbekannte Ebene wird abgewiesen',
      fn() => pu_recht_setzen('hausmeister', 'kurse.manage', true, 1), 'Ebene');

wirft('Unbekanntes Recht wird abgewiesen',
      fn() => pu_recht_setzen('lehrer', 'kaffee.holen', true, 1), 'Recht');

// Ein Tippfehler in einer Prüfung soll eine geschlossene Tür ergeben, keine
// offene. Sonst wäre jede falsch geschriebene Prüfung ein stiller Freibrief.
gleich('Ein unbekanntes Recht hat niemand', false, darf('lehrer', 'gibtsnicht.blah'));
gleich('…ausser Ebene 1, die alles hat',    true,  darf('admin', 'gibtsnicht.blah'));

// ============================================================ Umschalten
gruppe('Umschalten wirkt sofort');

gleich('vorher: Lehrer darf nicht freigeben', false, darf('lehrer', 'kurse.veroeffentlichen'));
pu_recht_setzen('lehrer', 'kurse.veroeffentlichen', true, 1);
gleich('nachher: Lehrer darf freigeben',      true,  darf('lehrer', 'kurse.veroeffentlichen'));
gleich('und niemand sonst hat sich geändert', false, darf('eltern', 'kurse.veroeffentlichen'));

pu_recht_setzen('schueler', 'lernen.ausfuehren', false, 1);
gleich('Ein Recht lässt sich auch wegnehmen', false, darf('schueler', 'lernen.ausfuehren'));

$a = pu_rechte_ausgabe();
gleich('zwei Abweichungen von der Vorgabe', 2, $a['abweichungen']);

// Zurück auf die Vorgabe heisst: die Abweichung verschwindet, nicht dass
// eine zweite Abweichung dazukommt.
pu_recht_setzen('schueler', 'lernen.ausfuehren', true, 1);
gleich('zurück auf Vorgabe löscht die Abweichung', 1, pu_rechte_ausgabe()['abweichungen']);

pu_recht_zuruecksetzen(1);
gleich('Zurücksetzen räumt alles ab',          0,     pu_rechte_ausgabe()['abweichungen']);
gleich('und die Vorgabe steht wieder',         false, darf('lehrer', 'kurse.veroeffentlichen'));

// ============================================================ Protokoll
gruppe('Protokoll mit Hash-Kette');

$kette = pu_recht_kette_pruefen();
pruefe('Die Kette ist heil', $kette['ok'], 'Bruch bei ' . $kette['bruch']);
pruefe('Es steht etwas darin', $kette['geprueft'] >= 4, 'nur ' . $kette['geprueft']);

$letzte = pu_recht_audit(1)[0];
gleich('Der letzte Eintrag ist das Zurücksetzen', 'zurueckgesetzt', $letzte['aktion']);

// Wer eine Zeile nachträglich ändert, bricht die Kette — sichtbar. Genau
// dafür ist sie da: sie verhindert kein Löschen, aber unbemerktes Löschen.
$nr = (int)pu_db()->query('SELECT MIN(nr) FROM rechte_audit')->fetchColumn();
pu_db()->exec("UPDATE rechte_audit SET recht = 'heimlich.geaendert' WHERE nr = $nr");

$kaputt = pu_recht_kette_pruefen();
gleich('Eine nachträgliche Änderung bricht die Kette', false, $kaputt['ok']);
gleich('…und zwar genau an der Stelle',                $nr,   $kaputt['bruch']);

pu_db()->exec('DELETE FROM rechte_audit');

// ============================================================ Ebenen der Konten
gruppe('Konten und Ebenen');

$erst = pu_lernenden_anlegen('erster', 'Erster', 'kennwort1');
$zwei = pu_lernenden_anlegen('zweiter', 'Zweiter', 'kennwort2');

$hole = function (int $id): string {
    $st = pu_db()->prepare('SELECT rolle FROM lernende WHERE id = ?');
    $st->execute([$id]);
    return (string)$st->fetchColumn();
};

gleich('Das erste Konto wird Admin', 'admin',    $hole($erst));
gleich('Das zweite wird Schüler',    'schueler', $hole($zwei));

wirft('Eine erfundene Ebene wird beim Anlegen abgewiesen',
      fn() => pu_lernenden_anlegen('dritter', 'Dritter', 'kennwort3', 'hausmeister'),
      'Unbekannte Ebene');

// Alte Datenbestände tragen noch die zwei alten Rollen. Sie müssen weiter
// zu einer Ebene führen — und Unbekanntes zur Ebene mit den wenigsten
// Rechten, nicht zur höchsten.
gleich('tutor gilt als Lehrer',        'lehrer',   pu_ebene(['rolle' => 'tutor']));
gleich('lernender gilt als Schüler',   'schueler', pu_ebene(['rolle' => 'lernender']));
gleich('Unbekanntes wird zum Schüler', 'schueler', pu_ebene(['rolle' => 'quatsch']));
gleich('Ein Konto ohne Ebene ist Schüler', 'schueler', pu_ebene([]));

// ============================================================ Abgleich mit api.php
gruppe('Jeder Schalter schaltet wirklich');

$api = (string)file_get_contents(__DIR__ . '/../api.php');

/**
 * Welches Recht fordert der Zweig einer Aktion?
 *
 * Gelesen wird der Text zwischen `case 'name':` und dem nächsten `case '`.
 * Das ist grob, reicht aber genau für die Frage, die hier zählt: steht in
 * diesem Zweig ein pu_recht_fordern, und wenn ja, welches.
 */
function api_wache(string $api, string $aktion): ?string
{
    $start = strpos($api, "case '$aktion':");
    if ($start === false) return null;

    $naechste = strpos($api, "        case '", $start + 10);
    $block = substr($api, $start, $naechste === false ? 2000 : $naechste - $start);

    return preg_match("/pu_recht_fordern\('([^']+)'\)/", $block, $t) ? $t[1] : '';
}

foreach (PU_RECHTE as $r) {
    foreach ($r['aktionen'] as $aktion) {
        $wache = api_wache($api, $aktion);
        pruefe("Aktion $aktion gibt es in api.php", $wache !== null);
        if ($wache === null) continue;
        gleich("Aktion $aktion prüft {$r['name']}", $r['name'], $wache);
    }
}

// Und die Gegenrichtung: keine Aktion ohne Wache, ausser den bewusst freien.
//
//   anmelden/einrichten/urkunde_pruefen — vor der Anmeldung erreichbar
//   zustand                             — sagt nur, ob jemand angemeldet ist
//   abmelden/kennwort_aendern/name_aendern/einst_*  — das eigene Konto
//   urkunde_html                        — prüft selbst, ob es die eigene ist
//   rolle_zurueck                       — der Rückweg ins eigene Konto darf an
//                                         keinem Recht hängen, sonst sperrt sich
//                                         Ebene 1 im Konto eines Schülers ein und
//                                         käme nur über Abmelden wieder heraus.
//                                         Das Übernehmen selbst ist bewacht.
$ohneWache = ['anmelden', 'einrichten', 'urkunde_pruefen', 'zustand', 'abmelden',
              'kennwort_aendern', 'name_aendern', 'einst_lesen', 'einst_setzen',
              'urkunde_html', 'profil_lesen', 'profil_setzen', 'sprache_stand',
              'rolle_zurueck'];

preg_match_all("/^        case '([a-z_]+)':/m", $api, $treffer);
$alle = array_unique($treffer[1]);
pruefe('api.php hat Aktionen', count($alle) > 20, count($alle) . ' gefunden');

foreach ($alle as $aktion) {
    if (in_array($aktion, $ohneWache, true)) continue;
    $wache = api_wache($api, $aktion);
    pruefe("Aktion $aktion hat eine Wache", $wache !== null && $wache !== '',
           'kein pu_recht_fordern im Zweig');
}

// Jede Wache muss ein Recht nennen, das es gibt — sonst hätte sie die Tür
// zwar zu, aber niemand könnte sie je öffnen.
preg_match_all("/pu_recht_fordern\('([^']+)'\)/", $api, $gefordert);
foreach (array_unique($gefordert[1]) as $recht) {
    pruefe("Gefordertes Recht $recht steht in der Matrix", pu_recht($recht) !== null);
}

bilanz();
