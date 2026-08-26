<?php
declare(strict_types=1);
/**
 * Persona-Vorschau — einen Kurs mit fremden Augen ansehen.
 *
 * Die drei Aussagen, an denen alles hängt:
 *
 *   · sie ändert das Profil, aus dem sich der Stoff formt
 *   · sie ändert KEINE Rechte — sonst sperrt sich Ebene 1 selbst aus
 *   · sie steht in der Sitzung, nicht in der Datenbank
 *
 * Die mittlere ist die wichtigste. Eine Vorschau, aus der man nicht mehr
 * herausfindet, ist keine Vorschau, sondern eine Falle.
 */
require_once __DIR__ . '/hilfe.php';
test_db_vorbereiten();

require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../srv/rechte.php';
require_once __DIR__ . '/../srv/lernende.php';
require_once __DIR__ . '/../srv/profil.php';
require_once __DIR__ . '/../srv/einstellungen.php';
require_once __DIR__ . '/../srv/medien.php';
require_once __DIR__ . '/../srv/persona.php';

$_SESSION = [];

$chef = pu_lernenden_anlegen('chefin', 'Chefin', 'probe1234', 'admin');
$kind = pu_lernenden_anlegen('kind',   'Kind',   'probe1234', 'schueler', '6a');

/* Angemeldet ist für den ganzen Lauf die Chefin. `pu_wer()` merkt sich seine
   Antwort für die Dauer des Prozesses und lässt sich nicht umstellen — wo ein
   anderes Konto geprüft wird, wird es deshalb ausdrücklich mitgegeben. */
$_SESSION['pu_id'] = $chef;
$alsKind = ['id' => $kind, 'rolle' => 'schueler'];

// ================================================================ Vorlagen
gruppe('Die Vorlagen');

pruefe('es gibt vier', count(PU_PERSONEN) === 4);
foreach (['schule', 'lehrer', 'eltern', 'schueler'] as $k) {
    pruefe('„' . $k . '" ist dabei', isset(PU_PERSONEN[$k]));
}

// Jede Persona muss auf eine ECHTE Ebene zeigen, sonst findet
// `pu_ebenen_kontext()` keinen Kontextordner und der Systemtext bleibt dünn.
foreach (PU_PERSONEN as $k => $v) {
    pruefe('„' . $k . '" zeigt auf eine gültige Ebene', isset(PU_EBENEN[$v['rolle']]),
           'rolle: ' . $v['rolle']);
}

// Beim Schüler ist das Alter die Stellschraube — zwischen der jüngsten und der
// ältesten Klasse müssen echte Jahre liegen, sonst gibt es nichts zu vergleichen.
$kl = PU_PERSONEN['schueler']['klassen'];
pruefe('mehrere Klassen zur Wahl', count($kl) >= 5);
pruefe('…und sie decken eine Spanne ab', (max($kl) - min($kl)) >= 5,
       'von ' . min($kl) . ' bis ' . max($kl));

// ================================================================ Wer darf
gruppe('Nur Ebene 1');

pruefe('ein Schülerkonto darf nicht', !pu_persona_darf($alsKind));
wirft('…und wird abgewiesen',
      fn() => pu_persona_setzen('lehrer', '', $alsKind), 'Ebene 1 vorbehalten');

pruefe('Ebene 1 darf', pu_persona_darf());

// ================================================================ Einnehmen
gruppe('Eine Persona einnehmen');

gleich('am Anfang keine', null, pu_persona());
gleich('…und das Profil ist das echte', 'admin', pu_profil_wirksam($chef)['rolle']);

$p = pu_persona_setzen('eltern');
gleich('die Persona steht',        'eltern', $p['schluessel']);
gleich('…und ist abrufbar',        'eltern', pu_persona()['schluessel']);

$w = pu_profil_wirksam($chef);
gleich('das wirksame Profil trägt die Rolle',  'eltern',         $w['rolle']);
gleich('…und das Alter der Persona',           44,               $w['lebensalter']);
gleich('…und ihren Namen',                     'Elternteil',     $w['anzeigename']);

// Das echte Profil bleibt unangetastet. Würde die Persona in die Datenbank
// schreiben, wäre eine Vorschau eine Kontoänderung — und beim nächsten
// Anmelden wäre die Chefin ein Elternteil.
gleich('das ECHTE Profil bleibt unberührt', 'admin', pu_profil($chef)['rolle']);

// ================================================================ Die Zusage
gruppe('Rechte bleiben unberührt — die wichtigste Zusage');

// `eltern` darf keine Lektionen pflegen. Würde die Persona die Rechte
// mitziehen, wäre Ebene 1 jetzt ausgesperrt — und käme nicht mehr an den
// Knopf, mit dem sie zurückschaltet.
pruefe('Ebene bleibt admin',        pu_ebene() === 'admin');
pruefe('darf weiter Stoff pflegen', pu_recht_hat('lektionen.manage'));
pruefe('darf weiter Rechte setzen', pu_recht_hat('rechte.matrix'));
pruefe('darf die Persona wieder ablegen', pu_persona_darf());

// ================================================================ Klassen
gruppe('Beim Schüler entscheidet die Klasse das Alter');

pu_persona_setzen('schueler', '5a');
$w = pu_profil_wirksam($chef);
gleich('Klasse 5a', '5a', $w['gruppe']);
gleich('…und zehn Jahre', 10, $w['lebensalter']);

pu_persona_setzen('schueler', 'Q1');
$w = pu_profil_wirksam($chef);
gleich('Q1',              'Q1', $w['gruppe']);
gleich('…und 17 Jahre',   17,   $w['lebensalter']);

// Eine erfundene Klasse ändert das Alter nicht heimlich, sondern fällt auf
// die Vorgabe der Persona zurück.
pu_persona_setzen('schueler', 'gibtesnicht');
gleich('unbekannte Klasse fällt auf die Vorgabe zurück',
       PU_PERSONEN['schueler']['gruppe'], pu_profil_wirksam($chef)['gruppe']);

wirft('eine erfundene Persona wird abgewiesen',
      fn() => pu_persona_setzen('hausmeister'), 'gibt es nicht');

// ================================================================ Aufnahmen
gruppe('Die Aufnahmen folgen der Persona mit');

// Ohne Persona hört Ebene 1, was für alle da ist.
pu_persona_setzen('');
gleich('ohne Persona: die Fassung für alle', '', pu_medien_zielgruppe(pu_profil($chef)));

foreach (['eltern' => 'eltern', 'lehrer' => 'lehrer',
          'schule' => 'schule', 'schueler' => 'schueler'] as $persona => $ordner) {
    pu_persona_setzen($persona);
    gleich('als „' . $persona . '" die Fassung „' . $ordner . '"',
           $ordner, pu_medien_zielgruppe(pu_profil($chef)));
}

// ================================================================ Ablegen
gruppe('Und wieder zurück');

pu_persona_setzen('');
gleich('die Persona ist weg',              null,    pu_persona());
gleich('das Profil ist wieder das eigene', 'admin', pu_profil_wirksam($chef)['rolle']);

// Nur die EIGENE Kennung wird überlagert. Wer die Klasse ansieht, sieht seine
// Schüler unverändert — sonst trüge plötzlich jedes Kind das Alter der Persona.
pu_persona_setzen('schueler', 'Q1');
gleich('ein fremdes Konto bleibt, wie es ist', 'schueler', pu_profil_wirksam($kind)['rolle']);
gleich('…mit seinem eigenen Alter',
       pu_profil($kind)['lebensalter'], pu_profil_wirksam($kind)['lebensalter']);
gleich('…und seiner eigenen Klasse', '6a', pu_profil_wirksam($kind)['gruppe']);

// Verliert jemand die Ebene, wirkt eine gesetzte Persona nicht weiter — auch
// dann nicht, wenn sie noch in der Sitzung steht.
gleich('ohne Ebene 1 wirkt eine gesetzte Persona nicht', null, pu_persona($alsKind));

bilanz();
