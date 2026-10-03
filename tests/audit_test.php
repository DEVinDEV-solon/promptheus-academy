<?php
declare(strict_types=1);
/**
 * Der Audit-Trail: schwärzt vor dem Speichern, kettet, erkennt jede Änderung.
 *
 * Geprüft wird vor allem, was NICHT gehen darf: ein Geheimnis im Speicher, eine
 * unbemerkte Änderung, eine gelöschte letzte Zeile, ein doppelt eingelesener
 * Spool, ein Blick in fremde Einträge.
 *
 * Testgeheimnisse werden hier zusammengesetzt, damit keine Zeichenkette in der
 * Datei selbst wie ein echter Schlüssel aussieht.
 *
 * Aufruf:
 *     php -d extension=pdo_sqlite -d extension=sqlite3 tests/audit_test.php
 */

require_once __DIR__ . '/hilfe.php';
test_db_vorbereiten();

$tmp = sys_get_temp_dir() . '/pu_audit_' . bin2hex(random_bytes(4));
mkdir($tmp, 0700, true);
putenv('PU_TEST_AUDIT=' . $tmp);

require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../srv/db.php';
require_once __DIR__ . '/../srv/audit.php';

$schluessel = 'sk-' . 'or-v1-' . str_repeat('a1B2', 12);
$token      = 'gh' . 'p_' . str_repeat('Zx9', 10);
$mail       = 'kind' . '@' . 'beispiel.de';

// ================================================================ Schwärzen
gruppe('Schwärzen');

$s = pu_audit_schwaerzen("Mein Schlüssel ist $schluessel und $token");
pruefe('OpenRouter-Schlüssel geschwärzt', !str_contains($s, $schluessel) && str_contains($s, '[REDACTED:'), $s);
pruefe('GitHub-Token geschwärzt', !str_contains($s, $token));
$s = pu_audit_schwaerzen('passwort = geheim12345');
pruefe('Zuweisung mit Kennwort geschwärzt', !str_contains($s, 'geheim12345') && (str_contains($s, 'generic-secret') || str_contains($s, 'xxx')), $s);
$a = pu_audit_schwaerzen("Schreib an $mail");
$b = pu_audit_schwaerzen("Noch einmal $mail");
pruefe('E-Mail pseudonymisiert', !str_contains($a, $mail) && str_contains($a, '[PII:email:#'), $a);
preg_match('/\[PII:email:#([0-9a-f]+)\]/', $a, $m1);
preg_match('/\[PII:email:#([0-9a-f]+)\]/', $b, $m2);
pruefe('gleicher Wert → gleiches Pseudonym', ($m1[1] ?? 'x') === ($m2[1] ?? 'y'));
gleich('gewöhnlicher Text bleibt', 'Die Werkstatt startet.', pu_audit_schwaerzen('Die Werkstatt startet.'));
$tief = pu_audit_schwaerzen_tief(['befehl' => "echo $schluessel", 'session_id' => 'a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6']);
pruefe('Metadaten: Text geschwärzt', !str_contains($tief['befehl'], $schluessel));
gleich('Metadaten: Kennung bleibt', 'a1b2c3d4-e5f6-a7b8-c9d0-e1f2a3b4c5d6', $tief['session_id']);

// ================================================================ Kette
gruppe('Kette');

$r1 = pu_audit_schreiben(['action_type' => 'werkstatt_oeffnen', 'action_description' => "Start mit $schluessel",
                          'metadata' => ['source' => 'academy', 'lernender' => 7]]);
$r2 = pu_audit_schreiben(['action_type' => 'werkstatt_neustart', 'metadata' => ['source' => 'academy', 'lernender' => 8]]);
pu_audit(7, 'test', 'dritter Eintrag');
pruefe('drei Einträge geschrieben', $r1['neu'] && $r2['neu'] && $r2['seq'] === $r1['seq'] + 1);

$roh = pu_audit_db()->query('SELECT action_description FROM events WHERE seq = ' . $r1['seq'])->fetchColumn();
pruefe('im Speicher kein Schlüssel', !str_contains((string)$roh, $schluessel), (string)$roh);

$p = pu_audit_pruefen();
pruefe('Kette ist heil', $p['ok'] && $p['anzahl'] === 3 && $p['bruch_seq'] === null, kurz($p));
gleich('Anker stimmt', true, $p['anker']['ok']);

$wieder = pu_audit_schreiben(['audit_id' => $r1['audit_id'], 'action_type' => 'anders']);
pruefe('gleiche audit_id: nichts Neues (idempotent)', !$wieder['neu'] && $wieder['seq'] === $r1['seq']);

wirft('UPDATE wird abgewiesen', static fn() =>
    pu_audit_db()->exec("UPDATE events SET action_description = 'x' WHERE seq = " . $r2['seq']), 'nur anhaengen');
wirft('DELETE wird abgewiesen', static fn() =>
    pu_audit_db()->exec('DELETE FROM events WHERE seq = ' . $r2['seq']), 'nur anhaengen');

// Wer die Auslöser entfernt und ändert, fällt in der Prüfung auf.
$db = pu_audit_db();
$db->exec('DROP TRIGGER events_nur_anhaengen_u');
$db->exec("UPDATE events SET action_description = 'umgeschrieben' WHERE seq = " . $r2['seq']);
$p = pu_audit_pruefen();
pruefe('Änderung erkannt', !$p['ok'] && $p['bruch_seq'] === $r2['seq'], kurz($p));
$db->exec("UPDATE events SET action_description = '' WHERE seq = " . $r2['seq']);
pruefe('zurückgesetzt: wieder heil', pu_audit_pruefen()['ok']);

$db->exec('DROP TRIGGER events_nur_anhaengen_d');
$letzte = (int)$db->query('SELECT MAX(seq) FROM events')->fetchColumn();
$db->exec('DELETE FROM events WHERE seq = ' . $letzte);
$p = pu_audit_pruefen();
pruefe('gelöschte letzte Zeile: Anker schlägt an', !$p['ok'] && $p['anker']['ok'] === false, kurz($p));

// Frische Kette für die übrigen Gruppen.
$tmp2 = $tmp . '/zwei';
mkdir($tmp2, 0700, true);
putenv('PU_TEST_AUDIT=' . $tmp2);

// ================================================================ Spool
gruppe('Spool');

pu_audit_ordner_anlegen();
$zeilen = [
    ['audit_id' => 'aud_sch_0001', 'ts' => '2026-10-03T10:00:00Z', 'actor_type' => 'agent', 'actor_id' => 'hephaistos',
     'action_type' => 'llm_anfrage', 'action_description' => "Anfrage mit $schluessel",
     'metadata' => ['source' => 'schutzschicht', 'lernender' => 7, 'maskiert' => ['geheim' => 2, 'pii' => 1]]],
    ['audit_id' => 'aud_sch_0002', 'action_type' => 'llm_anfrage', 'outcome' => 'blocked', 'severity' => 'critical',
     'metadata' => ['source' => 'erfunden', 'maskiert' => ['geheim' => 1]]],
];
$spool = $tmp2 . '/spool/schutzschicht-2026-10-03.jsonl';
file_put_contents($spool, implode("\n", array_map('json_encode', $zeilen)) . "\n" . '{"action_type":"spae');
$e = pu_audit_einlesen();
gleich('zwei Zeilen neu, halbe Zeile wartet', ['neu' => 2, 'doppelt' => 0, 'kaputt' => 0, 'dateien' => 1], $e);
file_put_contents($spool, 'ter", "metadata": {}}' . "\n", FILE_APPEND);
$e = pu_audit_einlesen();
gleich('vervollständigte Zeile wird gelesen (ohne audit_id: neu)', 1, $e['neu']);
$e = pu_audit_einlesen();
gleich('nochmal einlesen: nichts Neues', 0, $e['neu']);
$quelle = pu_audit_db()->query("SELECT quelle FROM events WHERE audit_id = 'aud_sch_0002'")->fetchColumn();
gleich('unbekannte Quelle wird zu werkstatt', 'werkstatt', $quelle);
$roh = (string)pu_audit_db()->query("SELECT action_description FROM events WHERE audit_id = 'aud_sch_0001'")->fetchColumn();
pruefe('Spool wird beim Einlesen noch einmal geschwärzt', !str_contains($roh, $schluessel), $roh);
pruefe('Kette nach dem Einlesen heil', pu_audit_pruefen()['ok']);

// ================================================================ Lesen
gruppe('Lesen');

pu_audit(8, 'fremd', 'Eintrag von Konto 8');
$alle = pu_audit_liste([], 1, 50, null);
$eigen = pu_audit_liste([], 1, 50, 7);
pruefe('Admin sieht alles', $alle['gesamt'] === 4, kurz($alle['gesamt']));
pruefe('Konto 7 sieht nur seine', $eigen['gesamt'] === 1 && $eigen['eintraege'][0]['lernender'] === 7, kurz($eigen['gesamt']));
gleich('Filter Ergebnis', 1, pu_audit_liste(['outcome' => 'blocked'], 1, 50, null)['gesamt']);
gleich('Filter Quelle', 1, pu_audit_liste(['quelle' => 'schutzschicht'], 1, 50, null)['gesamt']);
gleich('Volltext', 1, pu_audit_liste(['q' => 'Konto 8'], 1, 50, null)['gesamt']);
gleich('Volltext mit % wird nicht zum Joker', 0, pu_audit_liste(['q' => '%'], 1, 50, null)['gesamt']);
$k = pu_audit_kennzahlen(null);
gleich('Kennzahl: maskierte Geheimnisse summiert', 2, $k['maskiert']['geheim'] ?? 0);
gleich('Kennzahl: 14 Tage', 14, count($k['pro_tag']));
$csv = pu_audit_export([], 'csv', null);
pruefe('CSV mit Kopfzeile und Hash', str_starts_with($csv, 'seq;audit_id;ts') && str_contains($csv, 'entry_hash'));
pruefe('CSV ohne Schlüssel', !str_contains($csv, $schluessel));
$json = json_decode(pu_audit_export([], 'json', 7), true);
pruefe('JSON-Export nur eigene', is_array($json) && count($json) === 1);

bilanz();
