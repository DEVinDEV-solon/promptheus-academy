<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — das Glossar: Begriffe, Verlinkung, Fragen.
 *
 * Die wichtigste Prüfung steht ganz oben und ist keine technische:
 *
 *   **Die Frage im Chatfenster verrät nichts über den Fragenden.**
 *
 * Dass die Antwort für eine Sechstklässlerin anders ausfällt als für ihre
 * Lehrerin, entscheidet der Systemtext — und den sieht niemand. Stünde im
 * Fenster „erklär mir das für einen Zwölfjährigen mit 250 Punkten", wäre die
 * Anpassung eine Bloßstellung. Diese Datei erzwingt, dass das nicht passiert.
 *
 * Daneben: dass die Verlinkung den Lehrstoff nicht zerlegt (kein Begriff in
 * Code, in Überschriften oder mitten in einem Link), und dass kein Begriff auf
 * eine Notiz zeigt, die es nicht gibt.
 *
 * Aufruf:
 *     php -d extension=pdo_sqlite -d extension=sqlite3 tests/glossar_test.php
 */

require_once __DIR__ . '/hilfe.php';
test_db_vorbereiten();

require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../srv/glossar.php';

// ============================================ Die Frage verrät nichts
gruppe('Die Frage im Fenster ist neutral');

// Wörter, die im sichtbaren Fragetext nichts zu suchen haben. Sie stehen für
// das, was der Systemtext weiß und der Chat nicht zeigen darf.
$verboten = ['jahr', 'alter', 'klasse', 'stufe', 'punkt', 'schüler', 'schueler',
             'kind', 'anfänger', 'anfaenger', 'einfach für', 'kindgerecht',
             'niveau', 'ebene', 'lehrer', 'eltern'];

foreach (array_keys(PU_GLOSSAR_ARTEN) as $art) {
    $frage = mb_strtolower(pu_glossar_frage('token', $art));

    $treffer = [];
    foreach ($verboten as $w) if (str_contains($frage, $w)) $treffer[] = $w;

    pruefe("„$art" . '" nennt nichts über den Fragenden',
           $treffer === [], implode(', ', $treffer) . ' in: ' . $frage);
}

// Sie muss den Begriff nennen — sonst weiß der Lesende nicht, wonach gefragt
// wurde, wenn er den Verlauf später wieder aufschlägt.
foreach (array_keys(PU_GLOSSAR_ARTEN) as $art) {
    pruefe("„$art" . '" nennt den Begriff',
           str_contains(pu_glossar_frage('token', $art), 'Token'));
}

// Der Klammerzusatz gehört nicht in die Frage: „Was bedeutet LLM (Sprachmodell)?"
// klingt nach Formular, nicht nach einer Frage, die jemand stellt.
$f = pu_glossar_frage('llm', 'erst');
pruefe('Der Klammerzusatz bleibt draußen',
       str_contains($f, 'LLM') && !str_contains($f, '(Sprachmodell)'), $f);

// Ein unbekannter Begriff darf keine Ausnahme werfen — die Frage nimmt dann
// die Kennung. Ein Fehler an dieser Stelle wäre ein leeres Fenster.
pruefe('Unbekannter Begriff bricht nicht ab',
       str_contains(pu_glossar_frage('gibt-es-nicht', 'erst'), 'gibt-es-nicht'));

// ============================================ Die vier Tiefen
gruppe('Die vier Tiefen');

gleich('Es gibt vier Arten', 4, count(PU_GLOSSAR_ARTEN));
pruefe('„erst" hat keinen Knopf', PU_GLOSSAR_ARTEN['erst']['knopf'] === '');

$knoepfe = pu_glossar_knoepfe();
gleich('Drei Knöpfe über dem Feld', 3, count($knoepfe));
gleich('Ihre Aufschriften', ['Weiter', 'Tiefer', 'Voll'], array_column($knoepfe, 'knopf'));

// Sie sind dialektisch gestuft, nicht bloß länger: „voll" muss nach Grenzen
// fragen, sonst ist es nur „tiefer" mit mehr Wörtern.
pruefe('„voll" fragt auch nach den Grenzen',
       str_contains(pu_glossar_frage('token', 'voll'), 'Grenzen'));
pruefe('„voll" verlangt ein gelöstes Problem',
       str_contains(pu_glossar_frage('token', 'voll'), 'Problem'));
pruefe('„tiefer" fragt nach dem Irrtum',
       str_contains(pu_glossar_frage('token', 'tiefer'), 'Irrtum'));

// ============================================ Der Bestand
gruppe('Der Bestand');

$alle = pu_glossar();
pruefe('Es gibt Begriffe', count($alle) >= 30, count($alle) . ' gefunden');

foreach ($alle as $slug => $b) {
    if ($b['titel'] === '' || $b['was'] === '') {
        pruefe("„$slug" . '" hat Titel und Beschreibung', false);
    }
    if ($b['worte'] === []) {
        pruefe("„$slug" . '" hat mindestens ein Suchwort', false);
    }
}
pruefe('Alle Begriffe haben Titel, Satz und Suchwort', true);

// **Kein toter Verweis.** Ein Nachbar, den es nicht gibt, wäre im Fenster ein
// Knopf, der ins Leere führt — und im Graphen ein Ast ohne Blatt.
$tot = [];
foreach ($alle as $slug => $b) {
    foreach ($b['verwandt'] as $ziel) {
        if (isset($alle[$ziel])) continue;
        // Verweise auf geerntete Quellen sind erlaubt: sie führen aus dem
        // Glossar hinaus und erscheinen nicht als anklickbarer Nachbar.
        $treffer = glob(PU_ROOT . '/secondbrain/90_Quellen/*/' . $ziel . '.md') ?: [];
        if ($treffer === []) $tot[] = "$slug → $ziel";
    }
}
pruefe('Kein Verweis zeigt ins Leere', $tot === [], implode(' · ', $tot));

// Die Nachbarn im Fenster sind gesiebt: nur echte Begriffe, nie der Begriff selbst.
$b = pu_glossar_begriff('token');
pruefe('„token" existiert', $b !== null);
pruefe('Nachbarn sind alle Begriffe',
       array_reduce($b['verwandt'], fn($t, $n) => $t && isset($alle[$n['slug']]), true));
pruefe('Der Begriff ist nicht sein eigener Nachbar',
       !in_array('token', array_column($b['verwandt'], 'slug'), true));
pruefe('Der Rumpf wird als HTML geliefert', str_contains($b['html'], '<'));

// ============================================ Verlinkung
gruppe('Verlinkung im Lehrstoff');

$probe = pu_glossar_verlinken('<p>Ein Modell rechnet mit Token.</p>');
pruefe('Ein Begriff im Fliesstext wird verlinkt',
       str_contains($probe, 'data-begriff="token"'), $probe);

// Deutsche Beugung: die Endung gehört mit in den Treffer, sonst steht der
// Unterstrich unter dem halben Wort.
$mehr = pu_glossar_verlinken('<p>Zwei Tokens sind zwei Stücke.</p>');
pruefe('Auch die Mehrzahl wird gefunden', str_contains($mehr, 'data-begriff="token"'));
pruefe('…und ganz unterstrichen', str_contains($mehr, '>Tokens</button>'), $mehr);

// Was schon Text ist, bleibt Text.
$code = pu_glossar_verlinken('<p><code>Token</code> ist hier ein Bezeichner.</p>');
pruefe('In <code> wird nichts verlinkt',
       !str_contains(substr($code, 0, (int)strpos($code, '</code>')), 'data-begriff'), $code);

$pre = pu_glossar_verlinken("<pre>Token = 1\nPrompt = 2</pre>");
pruefe('In <pre> wird nichts verlinkt', !str_contains($pre, 'data-begriff'), $pre);

$titel = pu_glossar_verlinken('<h2>Was ein Token ist</h2><p>Ein Prompt dazu.</p>');
pruefe('In Überschriften wird nichts verlinkt',
       !str_contains(substr($titel, 0, (int)strpos($titel, '</h2>')), 'data-begriff'), $titel);
pruefe('…im Absatz darunter aber schon', str_contains($titel, 'data-begriff="prompt"'));

// **Ein Link im Link ist keiner** — und ein Begriff, der in ein href gerät,
// zerstört die Adresse. Beides wird hier geprüft.
$link = pu_glossar_verlinken('<p><a href="/token/prompt.html">Ein Token</a> steht dort.</p>');
pruefe('In <a> wird nichts verlinkt', !str_contains($link, 'data-begriff'), $link);
pruefe('Die Adresse bleibt unversehrt', str_contains($link, 'href="/token/prompt.html"'), $link);

// Ein Begriff, viele Vorkommen, ein Unterstrich.
$oft = pu_glossar_verlinken('<p>Token, Token und nochmal Token.</p>');
gleich('Jeder Begriff wird höchstens einmal verlinkt', 1,
       substr_count($oft, 'data-begriff="token"'));

// Ein Wort, das nur zufällig so anfängt, ist kein Treffer.
$falsch = pu_glossar_verlinken('<p>Die Tokenisierung selbst steht woanders.</p>');
pruefe('Kein Treffer mitten im Wort',
       !str_contains($falsch, 'data-begriff'), $falsch);

// Ohne Begriffe bleibt der Text, wie er ist.
gleich('Ein leeres Verzeichnis lässt den Text in Ruhe',
       '<p>Token.</p>', pu_glossar_verlinken('<p>Token.</p>', []));

// ============================================ Beitragsformat
gruppe('Der Text zum Weiterschicken');

$roh = "🤖 Was ist ein LLM?\n📦 Ein LLM ist ein Sprachmodell,\ndas mit viel Text "
     . "trainiert wurde.\n⚙️ Es rät das nächste Stück.\n💡 Kurz gesagt: ein Rater.\n"
     . "#Sprachmodell #KI";
$beitrag = pu_glossar_beitrag($roh);

gleich('Fünf Abschnitte', 5, substr_count($beitrag, "\n\n") + 1);
pruefe('Zwischen den Abschnitten steht eine Leerzeile',
       str_contains($beitrag, "LLM?\n\n📦"), $beitrag);
pruefe('Eine umgebrochene Zeile wird angehängt',
       str_contains($beitrag, 'Sprachmodell, das mit viel Text trainiert wurde.'), $beitrag);
pruefe('Die Schlagworte stehen für sich',
       str_contains($beitrag, "\n\n#Sprachmodell #KI"), $beitrag);

// Was schon Absätze hat, wird nicht doppelt getrennt.
$sauber = pu_glossar_beitrag("🤖 Titel\n\n📦 Absatz\n\n💡 Schluss");
gleich('Bereits getrennte Abschnitte bleiben drei', 3, substr_count($sauber, "\n\n") + 1);

// Text ohne Bildzeichen darf nicht zerfallen.
gleich('Text ohne Emoji bleibt ein Block',
       'Ein Satz. Noch einer.', pu_glossar_beitrag("Ein Satz.\nNoch einer."));

// ============================================ Regeln für den Systemtext
gruppe('Die Regeln für die Antwortform');

$ohne = pu_glossar_regeln('erst', false);
$mit  = pu_glossar_regeln('erst', true);

pruefe('Ohne Emoji: gewöhnliche Absätze', str_contains($ohne, 'ohne Emoji'));
pruefe('Mit Emoji: Anweisung zum Weiterschicken', str_contains($mit, 'verschicken'));
pruefe('Mit Emoji: Schlagworte am Ende', str_contains($mit, 'Schlagworte'));
pruefe('Die beiden Formen unterscheiden sich', $ohne !== $mit);

pruefe('„voll" fordert Vollständigkeit ein',
       str_contains(pu_glossar_regeln('voll', false), 'Vollständigkeit'));
pruefe('„erst" fordert sie nicht',
       !str_contains(pu_glossar_regeln('erst', false), 'Vollständigkeit'));

// **Auch die Regeln verraten nichts über den Fragenden.** Sie gehen in den
// Systemtext, aber sie beschreiben die Form der Antwort — nicht die Person.
foreach (['erst', 'voll'] as $art) {
    foreach ([true, false] as $emoji) {
        $r = mb_strtolower(pu_glossar_regeln($art, $emoji));
        $treffer = [];
        foreach (['jahre alt', 'klassenstufe', 'punktestand'] as $w) {
            if (str_contains($r, $w)) $treffer[] = $w;
        }
        pruefe("Regeln ($art, " . ($emoji ? 'Emoji' : 'schlicht') . ') bleiben sachlich',
               $treffer === [], implode(', ', $treffer));
    }
}

// ============================================ Zusammenspiel
gruppe('Das Zusammenspiel hält');

$js  = (string)file_get_contents(PU_ROOT . '/assets/js/glossar.js');
$css = (string)file_get_contents(PU_ROOT . '/assets/css/promptheus.css');
$api = (string)file_get_contents(PU_ROOT . '/api.php');
$app = (string)file_get_contents(PU_ROOT . '/assets/js/app.js');

foreach (['glossar', 'glossar_begriff', 'glossar_fragen'] as $aktion) {
    pruefe("api.php kennt „$aktion" . '"', str_contains($api, "case '$aktion'"));
}
pruefe('Der Lehrstoff wird verlinkt ausgeliefert',
       substr_count($api, 'pu_glossar_verlinken(') >= 3);

pruefe('Das Skript ruft die drei Aktionen', str_contains($js, "'glossar_begriff'")
       && str_contains($js, "'glossar_fragen'"));

// **Ein Nachschlagewerk braucht einen Eingang.** Zwei Drittel der Begriffe
// stehen in keiner Lektion — die späteren Stufen sind erst Gerüste. Ohne
// eigenen Knopf wären sie unerreichbar, und niemand würde es merken.
$html = (string)file_get_contents(PU_ROOT . '/index.php');
pruefe('Es gibt einen Knopf ins Glossar', str_contains($html, 'id="knopf-glossar"'));
pruefe('app.js hängt ihn an', str_contains($app, 'knopf-glossar'));
pruefe('Das Skript kann von vorn öffnen', str_contains($js, 'glossarOeffnen'));
pruefe('Die Übersicht hat ein Suchfeld', str_contains($js, 'gl-suche'));

// Der Bestand ist grösser als der Lehrstoff — das ist Absicht und soll so
// bleiben: Ein Begriff gehört ins Glossar, sobald er irgendwo gebraucht wird,
// nicht erst wenn die Lektion dazu geschrieben ist.
pruefe('Mehr Begriffe als heute im Stoff vorkommen', count($alle) > 50,
       count($alle) . ' Begriffe');
pruefe('Der Klick am Dokument hängt an .begriff', str_contains($js, ".begriff"));

foreach (['.begriff', '.gl-verlauf', '.gl-seite', '.denkt-punkte', '.gl-emoji'] as $klasse) {
    pruefe("Stilregel für $klasse", str_contains($css, $klasse));
}

// Beide Spalten des Fensters scrollen für sich — sonst schiebt das Lesen
// rechts den Chat links weg.
pruefe('Verlauf und Seite scrollen getrennt',
       substr_count($css, 'overscroll-behavior: contain') >= 2);

bilanz();
