<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Profil, Sprachstil und der geschichtete Systemtext.
 *
 * Hier hängt zweierlei dran, und beides ist heikel:
 *
 * **Erstens der Ton.** Aus Alter und Ebene wird abgeleitet, wie ein Tutor
 * spricht. Die erste Fassung leitete auch bei Erwachsenen aus dem Alter ab
 * und schickte einem 44-jährigen Handwerker „Fachbegriffe darfst du
 * voraussetzen" — direkt gegen die Elternregel im selben Prompt. Deshalb
 * steht diese Zelle hier ausdrücklich drin.
 *
 * **Zweitens, was hinausgeht.** Der Systemtext geht an ein Sprachmodell,
 * also aus dem Haus. Klarname, Kennung und Kennwort-Hash haben darin nichts
 * zu suchen — geprüft wird das, nicht behauptet.
 *
 * Aufruf:
 *     php -d extension=pdo_sqlite -d extension=sqlite3 tests/profil_test.php
 */

require_once __DIR__ . '/hilfe.php';
test_db_vorbereiten();

require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../srv/rechte.php';
require_once __DIR__ . '/../srv/lernende.php';
require_once __DIR__ . '/../srv/tutor.php';
require_once __DIR__ . '/../srv/profil.php';

// ================================================================ Felder
gruppe('Profilfelder setzen');

$id = pu_lernenden_anlegen('kind', 'Marie Musterfrau', 'probe1234', 'schueler');

gleich('Pseudonym wird gesetzt', 'Nele', pu_profil_setzen($id, 'pseudonym', 'Nele'));
gleich('Alter wird gesetzt',     '11',   pu_profil_setzen($id, 'lebensalter', '11'));
gleich('Klasse wird gesetzt',    '6a',   pu_profil_setzen($id, 'gruppe', '6a'));

$p = pu_profil($id);
gleich('…und kommt so zurück', 'Nele', $p['pseudonym']);
gleich('Alter als Zahl',        11,     $p['lebensalter']);

// Ohne Pseudonym tritt man unter dem Anzeigenamen auf — das ist eine
// Entscheidung des Kontos, kein Versehen, und darf nicht leer bleiben.
$ohne = pu_lernenden_anlegen('ohne', 'Ohne Pseudonym', 'probe1234', 'schueler');
gleich('Ohne Pseudonym gilt der Anzeigename', 'Ohne Pseudonym', pu_profil($ohne)['pseudonym']);

gruppe('Was abgewiesen wird');

wirft('ein erfundenes Feld',
      fn() => pu_profil_setzen($id, 'rolle', 'admin'), 'Unbekanntes Profilfeld');
wirft('ein Alter jenseits von Gut und Böse',
      fn() => pu_profil_setzen($id, 'lebensalter', '999'), 'zwischen 0 und 120');
wirft('ein Alter, das keins ist',
      fn() => pu_profil_setzen($id, 'lebensalter', 'elf'), 'muss eine Zahl sein');
wirft('ein unbekannter Sprachstil',
      fn() => pu_profil_setzen($id, 'sprachstil', 'poetisch'), 'kennt diesen Wert nicht');
wirft('eine zu lange Notiz',
      fn() => pu_profil_setzen($id, 'notiz', str_repeat('x', 401)), 'höchstens 400');

// Die Rolle ist kein Profilfeld — das ist der Grund für die Whitelist.
$st = pu_db()->prepare('SELECT rolle FROM lernende WHERE id = ?');
$st->execute([$id]);
gleich('…und die Ebene steht unverändert', 'schueler', (string)$st->fetchColumn());

gleich('Zeilenumbrüche fliegen aus einzeiligen Feldern',
       'Klasse 6a', pu_profil_setzen($id, 'gruppe', "Klasse\n6a"));
pu_profil_setzen($id, 'gruppe', '6a');

// ================================================================ Sprachstil
gruppe('Der Sprachstil folgt Alter UND Ebene');

/** Baut ein Profil im Kopf, ohne Datenbank. */
function prof(string $rolle, int $alter, string $stil = ''): array
{
    return ['rolle' => $rolle, 'lebensalter' => $alter, 'sprachstil' => $stil,
            'pseudonym' => 'X', 'gruppe' => '', 'schule' => '', 'notiz' => ''];
}

gleich('Schüler, 10 Jahre  → einfach',  'einfach',  pu_sprachstil(prof('schueler', 10)));
gleich('Schüler, 12 Jahre  → einfach',  'einfach',  pu_sprachstil(prof('schueler', 12)));
gleich('Schüler, 13 Jahre  → normal',   'normal',   pu_sprachstil(prof('schueler', 13)));
gleich('Schüler, 17 Jahre  → normal',   'normal',   pu_sprachstil(prof('schueler', 17)));
gleich('Schüler, 19 Jahre  → fachlich', 'fachlich', pu_sprachstil(prof('schueler', 19)));
gleich('Schüler ohne Alter → normal',   'normal',   pu_sprachstil(prof('schueler', 0)));

// Der Fehler, den die erste Fassung machte: bei Erwachsenen sagt das Alter
// nichts über das Vorwissen. Ein Elternteil ist erwachsen und trotzdem Laie.
gleich('Eltern, 44 Jahre → normal, nicht fachlich', 'normal', pu_sprachstil(prof('eltern', 44)));
gleich('Eltern, 25 Jahre → normal',                 'normal', pu_sprachstil(prof('eltern', 25)));
gleich('Lehrer, 38 Jahre → fachlich',   'fachlich', pu_sprachstil(prof('lehrer', 38)));
gleich('Verwaltung       → fachlich',   'fachlich', pu_sprachstil(prof('verwaltung', 54)));
gleich('Admin ohne Alter → fachlich',   'fachlich', pu_sprachstil(prof('admin', 0)));

gleich('Eine eigene Wahl schlägt jede Ableitung',
       'fachlich', pu_sprachstil(prof('schueler', 11, 'fachlich')));
gleich('…auch in die andere Richtung',
       'einfach',  pu_sprachstil(prof('lehrer', 38, 'einfach')));

foreach (['einfach', 'normal', 'fachlich'] as $stil) {
    pruefe("Zu $stil gibt es eine Regel", trim(pu_sprachstil_regel($stil)) !== '');
}

// ================================================================ Profilblock
gruppe('Der Block für das Modell');

$block = pu_profil_block(pu_profil($id));
pruefe('nennt das Pseudonym',        str_contains($block, 'Nele'));
pruefe('nennt Alter und Klasse',     str_contains($block, '11 Jahre') && str_contains($block, '6a'));
pruefe('trägt die Sprachregel',      str_contains($block, 'Kurze Sätze'));
pruefe('nennt NICHT den Klarnamen',  !str_contains($block, 'Musterfrau'));
pruefe('nennt NICHT die Kennung',    !str_contains($block, 'kind'));

// Leere Felder tauchen gar nicht auf: eine Zeile „Alter: unbekannt" verleitet
// ein Modell dazu, danach zu fragen, statt einfach zu antworten.
$leer = pu_profil_block(pu_profil($ohne));
pruefe('kein Alter, keine Alterszeile', !str_contains($leer, 'Alter:'));
pruefe('keine Klasse, keine Klassenzeile', !str_contains($leer, 'Klasse/Gruppe:'));

// Die drei Ebenen, die nicht selbst lernen, brauchen ihre eigene Ansage.
$eltern = pu_lernenden_anlegen('vater', 'Vater', 'probe1234', 'eltern');
pruefe('Eltern bekommen die Eltern-Regel',
       str_contains(pu_profil_block(pu_profil($eltern)), 'löst keine Aufgaben'));

$lehrer = pu_lernenden_anlegen('lehrkraft', 'Lehrkraft', 'probe1234', 'lehrer');
pruefe('Lehrkräfte bekommen die Lehrer-Regel',
       str_contains(pu_profil_block(pu_profil($lehrer)), 'Fehlvorstellung'));

// Die Lehrer-Regel fordert AKTIV mehr als eine Definition — das ist der
// Unterschied zwischen „darf fachlich antworten" und „liefert Unterrichtsware".
pruefe('…und verlangt Zugaben ohne Nachfrage',
       str_contains(pu_profil_block(pu_profil($lehrer)), 'ungefragt dazu'));

$leiter = pu_lernenden_anlegen('leitung', 'Leitung', 'probe1234', 'verwaltung');
pruefe('Die Schulleitung bekommt etwas zum Weitergeben',
       str_contains(pu_profil_block(pu_profil($leiter)), 'Elternbrief'));

// ================================================================ Systemtext
gruppe('Der geschichtete Systemtext');

$sys = pu_systemtext('prometheus', pu_profil($id));

pruefe('SOUL ist drin',           str_contains($sys, 'Verstehen schlägt Bestehen'));
pruefe('AGENTS ist drin',         str_contains($sys, 'Die gemeinsamen Regeln'));
pruefe('der eigene Prompt ist drin', str_contains($sys, 'Prometheus'));
pruefe('das Profil ist drin',     str_contains($sys, 'Mit wem du sprichst'));

// Die Reihenfolge ist nicht Geschmack: das Besondere steht hinter dem
// Allgemeinen, damit es im Zweifel gewinnt.
$posSoul   = strpos($sys, 'Verstehen schlägt Bestehen');
$posAgents = strpos($sys, 'Die gemeinsamen Regeln');
$posProfil = strpos($sys, 'Mit wem du sprichst');
pruefe('SOUL steht vor AGENTS',   $posSoul < $posAgents);
pruefe('das Profil steht zuletzt', $posProfil > $posAgents);

pruefe('ohne Profil geht es auch', trim(pu_systemtext('prometheus', null)) !== '');
pruefe('…dann ohne Profilblock',
       !str_contains(pu_systemtext('prometheus', null), 'Mit wem du sprichst'));

// Was aus dem Haus geht, darf keinen Klarnamen tragen.
gruppe('Was nicht hinausgeht');

pruefe('kein Klarname im Systemtext', !str_contains($sys, 'Musterfrau'));
pruefe('kein Kennwort-Hash',          !str_contains($sys, '$2y$'));

// ================================================================ Ebenen-Kontext
gruppe('Kontext aus dem Vault');

foreach (['schueler', 'eltern', 'lehrer', 'verwaltung'] as $e) {
    pruefe("Für $e liegt Kontext bereit", pu_ebenen_kontext($e) !== '');
}
pruefe('Eine erfundene Ebene liefert nichts', pu_ebenen_kontext('hausmeister') === '');

$lang = pu_ebenen_kontext('schueler', 200);
pruefe('die Grenze wird eingehalten', mb_strlen($lang) <= 260, mb_strlen($lang) . ' Zeichen');

// ================================================================ Eltern und Kind
gruppe('Eltern sehen genau ein Kind');

pu_profil_kind_setzen($eltern, $id);
gleich('das Kind ist verknüpft', $id, pu_profil($eltern)['kind_von']);

wirft('ein Konto kann nicht sein eigenes Kind sein',
      fn() => pu_profil_kind_setzen($eltern, $eltern), 'eigenes Kind');
wirft('ein erfundenes Kind wird abgewiesen',
      fn() => pu_profil_kind_setzen($eltern, 99999), 'gibt es nicht');

pu_profil_kind_setzen($eltern, 0);
gleich('die Verknüpfung lässt sich lösen', 0, pu_profil($eltern)['kind_von']);

bilanz();
