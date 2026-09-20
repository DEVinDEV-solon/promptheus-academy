<?php
declare(strict_types=1);
/**
 * Der Coder der Werkstatt: Modellwahl und Freigabe nach dem 7. Kurs.
 *
 * Geprüft wird vor allem, was NICHT gehen darf: ein Modell ausserhalb der
 * Liste, eine Freigabe vor 100 %, eine Freigabe durch einen leeren Kurs.
 *
 * Aufruf:
 *     php -d extension=pdo_sqlite -d extension=sqlite3 tests/coder_test.php
 */

require_once __DIR__ . '/hilfe.php';
test_db_vorbereiten();

require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../srv/db.php';
require_once __DIR__ . '/../srv/einstellungen.php';
require_once __DIR__ . '/../srv/lernende.php';
require_once __DIR__ . '/../srv/coder.php';

$chef    = pu_lernenden_anlegen('chef', 'Chef', 'probe1234', 'admin');
$schueler = pu_lernenden_anlegen('probant', 'Probant', 'probe1234', 'schueler');

// ================================================================ Modelle
gruppe('Freigegebene Modelle');

gleich('Hausmodell ab Werk', 'deepseek/deepseek-v4.1-flash', pu_regel('coder_modell'));
gleich('Hausmodell steht vorn, die Auswahl dahinter',
       ['deepseek/deepseek-v4.1-flash', 'anthropic/claude-sonnet-5', 'anthropic/claude-opus-5'],
       pu_coder_modelle());
gleich('ohne eigene Wahl gilt das Hausmodell', 'deepseek/deepseek-v4.1-flash',
       pu_coder_modell($schueler));

pu_einst_global_setzen('coder_auswahl', 'deepseek/deepseek-v4.1-flash,anthropic/claude-opus-5');
gleich('das Hausmodell steht nicht doppelt da',
       ['deepseek/deepseek-v4.1-flash', 'anthropic/claude-opus-5'], pu_coder_modelle());

wirft('Leerzeichen in der Liste werden abgewiesen',
      fn() => pu_einst_global_setzen('coder_auswahl', 'a/b, c/d'), 'unerlaubte Schreibweise');
wirft('mehr als 12 Modelle werden abgewiesen',
      fn() => pu_einst_global_setzen('coder_auswahl',
                  implode(',', array_map(fn($i) => "x/m$i", range(1, 13)))), 'unerlaubte Schreibweise');
wirft('Einschleusung im Hausmodell wird abgewiesen',
      fn() => pu_einst_global_setzen('coder_modell', 'a/b; rm -rf /'), 'unerlaubte Schreibweise');

gruppe('Eigene Wahl');

gleich('ein freigegebenes Modell lässt sich wählen', 'anthropic/claude-opus-5',
       pu_einst_person_setzen($schueler, 'coder_modell', 'anthropic/claude-opus-5'));
gleich('und gilt dann', 'anthropic/claude-opus-5', pu_coder_modell($schueler));

wirft('ein Modell ausserhalb der Liste wird abgewiesen',
      fn() => pu_einst_person_setzen($schueler, 'coder_modell', 'openai/sehr-teuer'),
      'nicht freigegeben');
gleich('die alte Wahl bleibt nach der Abweisung stehen', 'anthropic/claude-opus-5',
       pu_coder_modell($schueler));

// Die Academy streicht das Modell — der Lernende fällt zurück, statt darauf
// sitzenzubleiben.
pu_einst_global_setzen('coder_auswahl', '');
gleich('gestrichen: zurück aufs Hausmodell', 'deepseek/deepseek-v4.1-flash',
       pu_coder_modell($schueler));
gleich('leer wählen heisst: Hausmodell', '', pu_einst_person_setzen($schueler, 'coder_modell', ''));
pu_einst_global_setzen('coder_auswahl', 'anthropic/claude-sonnet-5,anthropic/claude-opus-5');

// ================================================================ Freigabe
gruppe('Freigabe');

gleich('ab Werk aus — für jeden', 'aus', pu_coder_stand($schueler)['grund']);
pruefe('auch der Admin nicht, solange der Schalter aus ist', !pu_coder_frei($chef));

pu_einst_global_setzen('coder_an', 'an');
pruefe('der Admin darf vorab prüfen', pu_coder_frei($chef));
gleich('und zwar als Betreiber', 'betreiber', pu_coder_stand($chef)['grund']);

$kurs = pu_coder_kurs();
pruefe('der 7. Kurs liegt im Vault', $kurs !== null);

if ($kurs !== null) {
    $ids = [];
    foreach ($kurs['lektionen'] as $l) foreach ($l['aufgaben'] as $a) $ids[] = (string)$a['id'];

    if ($ids === []) {
        gleich('ein leerer Kurs schaltet nichts frei', 'kurs_leer', pu_coder_stand($schueler)['grund']);
    } else {
        gleich('vor dem Kurs gesperrt', 'kurs_offen', pu_coder_stand($schueler)['grund']);
        pruefe('pu_coder_frei sagt dasselbe', !pu_coder_frei($schueler));

        $st = pu_db()->prepare(
            "INSERT INTO versuche (lernender, aufgabe_id, punkte, max_punkte, richtig, zeitpunkt, tag)
             VALUES (?, ?, 10, 10, 1, datetime('now'), date('now'))");

        // Alle bis auf eine: noch nicht frei. Bei 200 Aufgaben stünde da
        // gerundet „100 %" — die Freigabe darf daran nicht hängen.
        foreach (array_slice($ids, 0, -1) as $id) $st->execute([$schueler, $id]);
        pruefe('eine Aufgabe fehlt: gesperrt', !pu_coder_frei($schueler));

        // Ein falscher Versuch zählt nicht als gelöst.
        pu_db()->prepare(
            "INSERT INTO versuche (lernender, aufgabe_id, punkte, max_punkte, richtig, zeitpunkt, tag)
             VALUES (?, ?, 0, 10, 0, datetime('now'), date('now'))")
            ->execute([$schueler, end($ids)]);
        pruefe('ein falscher Versuch schaltet nicht frei', !pu_coder_frei($schueler));

        $st->execute([$schueler, end($ids)]);
        pruefe('alle gelöst: frei', pu_coder_frei($schueler));
        gleich('frei durch den Kurs', 'kurs', pu_coder_stand($schueler)['grund']);
        gleich('100 %', 100, pu_coder_stand($schueler)['prozent']);
    }
}

gruppe('Ohne Modell');

pu_einst_global_setzen('coder_modell', '');
gleich('leeres Hausmodell: das erste der Auswahl übernimmt', 'anthropic/claude-sonnet-5',
       pu_coder_modelle()[0]);
pu_einst_global_setzen('coder_auswahl', '');
gleich('gar kein Modell: gesperrt, auch für den Admin', 'kein_modell', pu_coder_stand($chef)['grund']);

bilanz();
