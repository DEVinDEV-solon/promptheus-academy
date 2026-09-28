<?php
declare(strict_types=1);
/**
 * Der Markdown-Wandler für den Lehrstoff (srv/brain.php).
 *
 * Der Anlass (28.09.2026): Jede umbrochene Quellzeile wurde ein eigener
 * Absatz, jede `>`-Zeile ein eigenes Zitat. Die Lektionen standen mit
 * doppeltem Abstand und zerrissenen Sätzen da.
 */
require_once __DIR__ . '/hilfe.php';
require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../srv/brain.php';

$ohneUmbruch = static fn(string $h): string => str_replace("\n", '', $h);

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Absätze');
gleich('umbrochene Zeilen sind EIN Absatz', '<p>Ein Satz, der im Quelltext umbrochen ist.</p>',
       pu_md("Ein Satz, der im\nQuelltext umbrochen ist."));
gleich('eine Leerzeile trennt Absätze', '<p>Eins.</p><p>Zwei.</p>', $ohneUmbruch(pu_md("Eins.\n\nZwei.")));
gleich('zwei Leerzeichen am Zeilenende: sichtbarer Umbruch', '<p>Zeile eins<br>Zeile zwei</p>',
       pu_md("Zeile eins  \nZeile zwei"));
gleich('Windows-Zeilenenden ebenso', '<p>a b</p>', pu_md("a\r\nb"));
gleich('eine Überschrift beendet den Absatz', '<p>Text</p><h2>Titel</h2>', $ohneUmbruch(pu_md("Text\n## Titel")));

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Zitate');
gleich('ein Zitat über zwei Zeilen ist EIN Zitat',
       '<blockquote><p>Es bekommt einen Text und rechnet weiter.</p></blockquote>',
       pu_md("> Es bekommt einen Text\n> und rechnet weiter."));
gleich('`>` allein trennt Absätze im Zitat', '<blockquote><p>Eins.</p><p>Zwei.</p></blockquote>',
       pu_md("> Eins.\n>\n> Zwei."));
gleich('danach geht der Text normal weiter', '<blockquote><p>Z</p></blockquote><p>Text</p>',
       $ohneUmbruch(pu_md("> Z\n\nText")));

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Hinweiskästen (Obsidian-Schreibweise)');
gleich('[!merke] mit eigenem Titel',
       '<aside class="kasten kasten-merke"><div class="kasten-titel">Das Wichtigste</div><p>Ein LLM sagt das nächste Stück voraus.</p></aside>',
       pu_md("> [!merke] Das Wichtigste\n> Ein LLM sagt das\n> nächste Stück voraus."));
pruefe('[!warning] ohne Titel heisst „Achtung“', str_contains(pu_md("> [!warning]\n> Vorsicht."), '<div class="kasten-titel">Achtung</div>'));
pruefe('… und trägt die Farbe achtung', str_contains(pu_md("> [!warning]\n> Vorsicht."), 'kasten-achtung'));
pruefe('eine unbekannte Art bleibt ein Zitat, nichts geht verloren',
       str_contains(pu_md("> [!unsinn] X\n> Text"), '<blockquote>') && str_contains(pu_md("> [!unsinn] X\n> Text"), 'Text'));
pruefe('ein Titel wird escaped', !str_contains(pu_md("> [!merke] <script>x</script>\n> a"), '<script>'));

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Listen');
gleich('ein umbrochener Listenpunkt bleibt EIN Punkt', '<ul><li>Erster Punkt, der weitergeht</li><li>Zweiter</li></ul>',
       $ohneUmbruch(pu_md("- Erster Punkt,\n  der weitergeht\n- Zweiter")));
gleich('nummerierte Liste', '<ol><li>a</li><li>b</li></ol>', $ohneUmbruch(pu_md("1. a\n2. b")));
gleich('Wechsel ul → ol', '<ul><li>a</li></ul><ol><li>b</li></ol>', $ohneUmbruch(pu_md("- a\n1. b")));

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Aufgaben-Platzhalter');
$h = $ohneUmbruch(pu_md("Text davor\n<<<AUFGABE:E1-01>>>\nText danach"));
gleich('bleibt ein Absatz für sich — auch ohne Leerzeilen',
       '<p>Text davor</p><p>&lt;&lt;&lt;AUFGABE:E1-01&gt;&gt;&gt;</p><p>Text danach</p>', $h);
$h = $ohneUmbruch(pu_md("- Punkt\n<<<AUFGABE:E1-02>>>"));
gleich('… auch direkt unter einem Listenpunkt', '<ul><li>Punkt</li></ul><p>&lt;&lt;&lt;AUFGABE:E1-02&gt;&gt;&gt;</p>', $h);

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Was gleich bleibt');
gleich('Code bleibt zeilengenau', "<pre class=\"code\"><code>\nzeile 1\nzeile 2\n</code></pre>",
       pu_md("```\nzeile 1\nzeile 2\n```"));
pruefe('Tabellen', str_contains(pu_md("| a | b |\n|---|---|\n| 1 | 2 |"), '<td>1</td><td>2</td>'));
gleich('Trennlinie', '<hr>', pu_md('---'));
pruefe('HTML im Text wird escaped', !str_contains(pu_md("<script>alert(1)</script>\nweiter"), '<script>'));

// ─────────────────────────────────────────────────────────────────────────────
gruppe('Die echte Lektion „Was ist KI“');
$roh = (string)@file_get_contents(__DIR__ . '/../secondbrain/10_Stufen/01_Entdecker/01_lektion_was-ist-ki.md');
if ($roh === '') {
    pruefe('Lektion vorhanden (übersprungen: kein Vault)', true);
} else {
    require_once __DIR__ . '/../srv/kurse.php';
    $html = pu_md(pu_frontmatter($roh)['rumpf']);
    gleich('das Zitat „Es bekommt einen Text …“ ist EIN Zitat', 1,
           substr_count($html, '<blockquote><p>Es bekommt einen Text'));
    pruefe('… und nicht zerrissen', str_contains($html, 'am wahrscheinlichsten als nächstes kommt.'));
    pruefe('„Aber — … wird —“ läuft im selben Absatz weiter',
           (bool)preg_match('#wird — das Modell weiß <strong>nicht#u', $html));
}

bilanz();
