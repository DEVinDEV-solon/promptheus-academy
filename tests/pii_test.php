<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — der PII-Filter der Academy (K-PII, Runde 3b).
 *
 * Drei Dinge:
 *   1. Jede Regel rechnet ihre Beispiele nach (wie auf dem Server).
 *   2. **Dieselben Sätze in JavaScript** (assets/js/pii.js, über Node): Die
 *      Verbotsregel beim Tippen muss genau das zeigen, was PHP und der Server
 *      entscheiden. Ohne Node wird das übersprungen und gesagt.
 *   3. Das Synonym: kein Klarname, nicht der eigene Name, nicht die Kennung.
 *
 * Aufruf:
 *     php -d extension=mbstring -d extension=pdo_sqlite tests/pii_test.php
 */

require_once __DIR__ . '/hilfe.php';
test_db_vorbereiten();
require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../srv/gemeinde.php';

$json = json_decode((string)file_get_contents(PU_PII_DATEI), true);

gruppe('Jede Regel und ihre Beispiele (PHP)');
$saetze = [];
foreach ($json['regeln'] as $r) {
    foreach ($r['treffer'] ?? [] as $satz) {
        $saetze[] = $satz;
        pruefe($r['id'] . ' trifft „' . $satz . '“', in_array($r['id'], pu_pii_kuerzel(pu_pii_pruefen($satz)), true));
    }
    foreach ($r['kein_treffer'] ?? [] as $satz) {
        $saetze[] = $satz;
        pruefe($r['id'] . ' lässt „' . $satz . '“ stehen', !in_array($r['id'], pu_pii_kuerzel(pu_pii_pruefen($satz)), true));
    }
}
$saetze = array_merge($saetze, [
    'Hi ich heiße Nele, bin 11 Jahre alt und gehe in die 6c. Ruf mich an: 0151 23456789!',
    'Tolles Werk! Der Prompt ist 12 Zeilen lang und nutzt max_tokens 800.',
    'Grüße aus Stuttgart von Leon',
    'Ümläute: Jonas wohnt in München, 🙂 Mail nele@example.org',
    'Karte 4111 1111 1111 1111 und Zahl 1234 5678 9012 3456',
]);

gruppe('PHP und JavaScript entscheiden gleich');
$node = trim((string)shell_exec(PHP_OS_FAMILY === 'Windows' ? 'where node 2>NUL' : 'command -v node 2>/dev/null'));
if ($node === '') {
    echo "   (Node fehlt — der Vergleich mit assets/js/pii.js wird übersprungen)\n";
} else {
    $tmp = tempnam(sys_get_temp_dir(), 'pu_pii');
    file_put_contents($tmp, json_encode($saetze, JSON_UNESCAPED_UNICODE));
    $aus = shell_exec('node ' . escapeshellarg(__DIR__ . '/pii_js_pruefen.js') . ' ' . escapeshellarg(PU_PII_DATEI)
        . ' ' . escapeshellarg($tmp) . ' 2>&1');
    @unlink($tmp);
    $js = json_decode((string)$aus, true);
    pruefe('pii.js läuft', is_array($js) && count($js) === count($saetze), mb_substr((string)$aus, 0, 200));
    foreach ($saetze as $i => $satz) {
        $p = pu_pii_pruefen($satz);
        $regeln = pu_pii_kuerzel($p);
        sort($regeln);
        gleich('gleich: „' . mb_substr($satz, 0, 50) . '“', ['text' => $p['text'], 'regeln' => $regeln], $js[$i] ?? null);
    }
}

gruppe('Synonym');
$ich = ['anzeigename' => 'Karla Beispielfrau', 'kennung' => 'kbeispiel'];
gleich('ein ausgedachtes Synonym geht', null, pu_synonym_fehler('Funkenflug', $ich));
gleich('mit Ziffern und Punkt geht', null, pu_synonym_fehler('Eule.42', $ich));
gleich('Vorname aus der Liste nicht', 'rufname_klarname', pu_synonym_fehler('Mila', $ich));
gleich('… auch nicht mit Ziffern', 'rufname_klarname', pu_synonym_fehler('mila2014', $ich));
gleich('der eigene Nachname nicht', 'rufname_klarname', pu_synonym_fehler('Beispielfrau', $ich));
gleich('die eigene Kennung nicht', 'rufname_klarname', pu_synonym_fehler('kbeispiel', $ich));
gleich('keine Telefonnummer', 'rufname_klarname', pu_synonym_fehler('0151 234567', $ich));
gleich('zu kurz', 'rufname_form', pu_synonym_fehler('ab', $ich));
gleich('zu lang', 'rufname_form', pu_synonym_fehler(str_repeat('x', 25), $ich));
gleich('keine Sonderzeichen', 'rufname_form', pu_synonym_fehler('<b>', $ich));

bilanz();
