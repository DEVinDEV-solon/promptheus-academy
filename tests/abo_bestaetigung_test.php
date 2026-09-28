<?php
declare(strict_types=1);
/**
 * Plan-Buchungen: offen melden, Bestätigung des Servers übernehmen.
 *
 * Ebene 1 gibt es vor Ort nicht (nur der Betreiber). Darum schickt der
 * Abgleich `stand` die offenen Buchungen zum Server, und die Nummern, die der
 * Betreiber dort bestätigt hat, kommen zurück (28.09.2026).
 */

require_once __DIR__ . '/hilfe.php';
test_db_vorbereiten();

require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../srv/rechte.php';
require_once __DIR__ . '/../srv/lernende.php';
require_once __DIR__ . '/../srv/profil.php';
require_once __DIR__ . '/../srv/abo.php';
require_once __DIR__ . '/../srv/relay.php';

$chef   = pu_lernenden_anlegen('leitung', 'Leitung', 'probe1234');
$schule = pu_abo_buchen('schule', $chef, 'Testschule', 'schule', $chef);
$eigen  = pu_abo_buchen('person', $chef, 'Max Mustermann', 'schueler', $chef);

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Was zum Server geht');
$offen = pu_relay_abos_offen();
gleich('beide offenen Buchungen', 2, count($offen));
$nachId = array_column($offen, null, 'id');
gleich('der Schulplan mit Namen der Einrichtung', 'Testschule', $nachId[$schule['id']]['traeger_name']);
gleich('der Personenplan ohne Namen', '', $nachId[$eigen['id']]['traeger_name']);
pruefe('keine Felder über Personen (nur Plan, Art, Name des Trägers, Start, läuft)',
       array_keys($offen[0]) === ['id', 'plan', 'traeger_art', 'traeger_name', 'start', 'laeuft']);

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Was vom Server zurückkommt');
gleich('eine bestätigte Nummer wird übernommen', 1, pu_relay_abos_bestaetigen([$schule['id'], 'x', -3, 99999]));
$st = pu_db()->prepare('SELECT bestaetigt FROM abos WHERE id = ?');
$st->execute([$schule['id']]);
gleich('… das Abo ist bestätigt', 1, (int)$st->fetchColumn());
$st = pu_db()->prepare("SELECT MIN(bestaetigt) FROM token_buchungen WHERE abo = ?");
$st->execute([$schule['id']]);
gleich('… samt Kontingent-Buchung', 1, (int)$st->fetchColumn());
gleich('ein zweites Mal ändert nichts', 0, pu_relay_abos_bestaetigen([$schule['id']]));
gleich('danach ist nur noch der Personenplan offen', [$eigen['id']], array_column(pu_relay_abos_offen(), 'id'));

bilanz();
