<?php
declare(strict_types=1);
/**
 * Tokenicer — die BPE-Zerlegung gegen feste Vektoren.
 *
 * Die ersten drei Prüfungen sind die dokumentierten tiktoken-Testvektoren.
 * Sie stehen hier, weil dieselbe Zahl im Fenster als „exakt wie bei OpenAI"
 * beworben wird: eine Zahl mit diesem Anspruch braucht einen Beleg, der bei
 * jeder Änderung mitläuft.
 *
 * Die übrigen Werte wurden gegen die Python-Fassung in scripts/tokenicer
 * abgeglichen — dieselben Texte, dieselben IDs, alle vier Encodings. Wer
 * hier etwas ändert und einen dieser Werte anfassen muss, ändert die
 * Tokenzahl der Academy und sollte sehr genau wissen, warum.
 *
 * Aufruf:
 *     php -d extension=pdo_sqlite -d memory_limit=512M tests/tokenicer_test.php
 */

require_once __DIR__ . '/hilfe.php';
test_db_vorbereiten();

require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../srv/tokenicer.php';

/** Kurzform: nur die IDs. */
function ids(string $text, string $enc): array
{
    return pu_tok_kodieren($text, $enc)['ids'];
}

// ================================================================ Testvektoren
gruppe('tiktoken-Testvektoren');

gleich('cl100k "hello world"', [15339, 1917], ids('hello world', 'cl100k_base'));
gleich('cl100k "tiktoken is great!"', [83, 1609, 5963, 374, 2294, 0],
       ids('tiktoken is great!', 'cl100k_base'));
gleich('r50k "hello world"', [31373, 995], ids('hello world', 'r50k_base'));

// ================================================================ Deutsch
gruppe('Deutsch kostet mehr — die Aussage aus Lektion 3');

gleich('o200k: Künstliche Intelligenz = 6 Tokens', 6, count(ids('Künstliche Intelligenz', 'o200k_base')));
gleich('o200k: Artificial intelligence = 2 Tokens', 2, count(ids('Artificial intelligence', 'o200k_base')));

// Diese vier Zahlen stehen wörtlich in der Lektion und in einer Aufgabe.
// Weicht die Engine ab, ist die Aufgabe unlösbar — deshalb stehen sie hier.
gleich('Aufgabe E1-15: Wasserzeichenentfernung = 6', 6,
       count(ids('Wasserzeichenentfernung', 'o200k_base')));
gleich('Aufgabe E1-17: street = 1', 1, count(ids('street', 'o200k_base')));
gleich('Aufgabe E1-17: Straße = 2', 2, count(ids('Straße', 'o200k_base')));
gleich('Aufgabe E1-17: Erdbeere = 4', 4, count(ids('Erdbeere', 'o200k_base')));
gleich('Aufgabe E1-17: Donaudampfschifffahrtsgesellschaft = 10', 10,
       count(ids('Donaudampfschifffahrtsgesellschaft', 'o200k_base')));

gleich('Lektion 3: derselbe Satz, älterer Zerleger = 9', 9,
       count(ids('Die Hauptstadt von Frankreich ist Paris.', 'cl100k_base')));
gleich('Lektion 3: derselbe Satz, neuer Zerleger = 7', 7,
       count(ids('Die Hauptstadt von Frankreich ist Paris.', 'o200k_base')));

// ================================================================ Randfälle
gruppe('Randfälle');

gleich('leerer Text gibt nichts', [], ids('', 'o200k_base'));
pruefe('ein Leerzeichen ist ein Token', count(ids(' ', 'o200k_base')) === 1);
pruefe('Zeilenumbrüche zerfallen nicht in Einzelbytes',
       count(ids("Zeile1\r\nZeile2\n", 'o200k_base')) <= 8);

// Der Fall, für den `(*UCP)` im Muster steht: ohne diese Angabe ist \s in
// PCRE nur ASCII-Leerraum, und ein geschütztes Leerzeichen liefe in eine
// andere Regel als bei tiktoken.
$geschuetzt = pu_tok_kodieren("geschützt\u{00A0}Leerzeichen", 'o200k_base');
pruefe('geschütztes Leerzeichen zerlegt wie bei tiktoken',
       count($geschuetzt['ids']) === 5, 'ist ' . count($geschuetzt['ids']));

wirft('unbekanntes Encoding wird abgewiesen',
      fn() => pu_tok_kodieren('x', 'gibtsnicht'), 'Unbekanntes Encoding');

// ================================================================ Anzeige
gruppe('Anzeige: mehrteilige Zeichen');

// 🔥 allein ist EIN Token — häufige Emojis haben einen eigenen Eintrag.
// Gegen die Python-Fassung nachgemessen; die erste Fassung dieses Tests nahm
// das Gegenteil an und lag falsch.
gleich('ein häufiges Emoji ist ein Token', 1, count(pu_tok_kodieren('🔥', 'o200k_base')['ids']));

// Seltenere Zeichen zerfallen dagegen — und dann darf nur das abschliessende
// Token das Zeichen zeigen, sonst stünde ein Ersatzzeichen in der Anzeige.
$eule = pu_tok_kodieren('🦉⚒️', 'o200k_base');
pruefe('seltene Emojis brauchen mehrere Tokens', count($eule['ids']) === 6,
       'ist ' . count($eule['ids']));
pruefe('angefangene Zeichen zeigen nichts', $eule['tokens'][0]['teil'] === true);
gleich('zusammengesetzt kommt das Zeichen heraus', '🦉⚒️',
       implode('', array_column($eule['tokens'], 'text')));

$cjk = pu_tok_kodieren('中文测试', 'o200k_base');
$zusammen = implode('', array_column($cjk['tokens'], 'text'));
gleich('zusammengesetzt ergibt sich der Text wieder', '中文测试', $zusammen);

$deutsch = pu_tok_kodieren('Grüße aus Köln', 'o200k_base');
gleich('auch mit Umlauten', 'Grüße aus Köln', implode('', array_column($deutsch['tokens'], 'text')));

gruppe('Zählungen');
$r = pu_tok_kodieren("Ein Satz mit sechs Wörtern hier.", 'o200k_base');
gleich('Wörter werden gezählt', 6, $r['woerter']);
gleich('Zeichen werden in Zeichen gezählt, nicht in Bytes', 32, $r['zeichen']);

gruppe('Modelle');
gleich('unbekanntes Modell fällt auf das erste zurück', 'gpt-5.5', pu_tok_modell('gibtsnicht')['id']);
gleich('Claude ist eine Näherung', false, pu_tok_modell('opus-5')['exakt']);
gleich('GPT-4 rechnet mit cl100k', 'cl100k_base', pu_tok_modell('gpt-4')['enc']);
foreach (PU_TOK_MODELLE as $m) {
    pruefe('Modell ' . $m['id'] . ' hat ein bekanntes Encoding',
           isset(PU_TOK_MUSTER[$m['enc']]));
}

bilanz();
