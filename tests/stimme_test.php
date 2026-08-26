<?php
declare(strict_types=1);
/**
 * Sprachausgabe — alles, was sich ohne Netz und ohne Schlüssel prüfen lässt.
 *
 * **Was hier NICHT geprüft wird, und warum das dabeisteht:** Ob OpenRouter auf
 * diesen Rumpf wirklich Ton zurückgibt, kann nur ein echter Aufruf zeigen. Der
 * braucht einen Schlüssel und Guthaben und gehört damit nicht in eine
 * Prüfung, die bei jedem Lauf durchläuft. Dafür gibt es den Probelauf in den
 * Einstellungen (`pu_stimme_probe`), und der sagt, was tatsächlich zurückkam.
 *
 * Geprüft wird hier alles davor: der Rumpf, die Vorgaben, die Grenzen, das
 * Tor, der Zwischenspeicher.
 */
require_once __DIR__ . '/hilfe.php';
test_db_vorbereiten();

require_once __DIR__ . '/../lib.php';
require_once __DIR__ . '/../srv/rechte.php';
require_once __DIR__ . '/../srv/lernende.php';
require_once __DIR__ . '/../srv/profil.php';
require_once __DIR__ . '/../srv/einstellungen.php';
require_once __DIR__ . '/../srv/abo.php';
require_once __DIR__ . '/../srv/tutor.php';
require_once __DIR__ . '/../srv/stimme.php';

$chef  = pu_lernenden_anlegen('chefin', 'Chefin', 'probe1234', 'admin');
$kind  = pu_lernenden_anlegen('kind',   'Kind',   'probe1234', 'schueler');

// ================================================================ Vorgaben
gruppe('Die Vorgaben');

gleich('ab Werk aus — sie kostet Geld und gibt Text aus dem Haus',
       'aus', pu_regel('stimme_an'));
pruefe('…und damit ist die Ausgabe abgeschaltet', !pu_stimme_an());

gleich('das Vorgabemodell gibt wirklich Ton aus',
       'openai/gpt-audio-mini', pu_stimme_modell());
gleich('die Vorgabestimme',  'alloy', pu_stimme_name());
/* **Das Vorgabeformat ist gemessen, nicht gewählt.** mp3 wäre naheliegend und
   scheitert: Über OpenRouter kommt Ton nur im Strom, und dort liefert der
   OpenAI-Weg nackte Abtastwerte. Gegen openai/gpt-audio-mini geprüft — mp3
   endete mit „Provider returned error", pcm16 mit 158 KB Ton. */
gleich('das Vorgabeformat',  'pcm16', pu_stimme_format());

/* **Es gibt nur noch zwei Formate, und das ist eine Streichung.** Vorher
   standen hier vier; `opus` und `wav` funktionieren auf keinem der beiden
   Wege — Weg 1 nimmt im Strom nur pcm16, Weg 2 nur mp3 und pcm. Eine Auswahl
   anzubieten, die überall scheitert, ist keine Freiheit, sondern eine Falle. */
gleich('zwei Formate, mehr geht nirgends', ['pcm16', 'mp3'], PU_STIMM_FORMATE);
gleich('mp3 wird richtig ausgezeichnet',   'audio/mpeg', pu_stimme_mime('mp3'));

// pcm16 geht als WAV hinaus: Es bekommt in `pu_stimme_wav()` einen Kopf, bevor
// irgendetwas gespeichert wird. Nackt könnte kein Browser es abspielen.
gleich('pcm16 wird als wav ausgezeichnet', 'audio/wav', pu_stimme_mime('pcm16'));

/* **Die Stimme ist frei eintragbar, und das war eine Korrektur.**
   „alloy", „nova" und die anderen sind die Stimmnamen von OpenAI. Andere
   Anbieter — x-ai etwa — haben eigene. Eine geschlossene Liste hätte die
   ausgesperrt, und die Meldung hätte nicht gesagt, warum. */
pu_einst_global_setzen('stimme_name', 'nova');
gleich('eine bekannte Stimme wird genommen', 'nova', pu_stimme_name());

gleich('eine fremde Stimme geht durch — der Anbieter kennt seine Namen selbst',
       'eve', pu_einst_global_setzen('stimme_name', 'eve'));
gleich('…und sie wirkt', 'eve', pu_stimme_name());

pu_einst_global_setzen('stimme_name', '');
gleich('leer fällt auf alloy zurück', 'alloy', pu_stimme_name());

// Die Form wird trotzdem geprüft: Was hier durchginge, stünde ungeprüft im
// Rumpf, und die Anfrage würde als Ganzes abgewiesen.
wirft('ein Wert mit Leerzeichen wird abgewiesen',
      fn() => pu_einst_global_setzen('stimme_name', 'zwei worte'), 'unerlaubte Schreibweise');

// Der Modellname muss frei eintragbar bleiben: Es soll möglich sein, ein
// Modell einzutragen, das es heute noch nicht gibt.
gleich('ein beliebiger Modellname geht durch',
       'fish-audio/s2.1-pro-free:free',
       pu_einst_global_setzen('stimme_modell', 'fish-audio/s2.1-pro-free:free'));
pu_einst_global_setzen('stimme_modell', '');

// ================================================================ Der Rumpf
gruppe('Der Anfragerumpf');

$rumpf = json_decode(pu_stimme_rumpf('Guten Morgen.', 'openai/gpt-audio-mini', 'nova', 'mp3'), true);

gleich('das Modell steht drin', 'openai/gpt-audio-mini', $rumpf['model']);

// **Die zwei Felder, ohne die kein Ton kommt.** Fehlt eines, antwortet das
// Modell mit Text — und der Fehler sieht dann aus wie ein Modellfehler.
gleich('Ton wird ausdrücklich verlangt', ['text', 'audio'], $rumpf['modalities']);
gleich('die Stimme steht im Rumpf',      'nova', $rumpf['audio']['voice']);
gleich('das Format auch',                'mp3',  $rumpf['audio']['format']);

// Ohne die Systemzeile BEANTWORTET das Modell den Text, statt ihn vorzulesen.
// Steht in der Vorlage eine Frage, käme sonst eine Antwort heraus.
gleich('zwei Nachrichten: Auftrag und Text', 2, count($rumpf['messages']));
gleich('die erste ist die Systemzeile', 'system', $rumpf['messages'][0]['role']);
/* **Und sie musste nachgeschärft werden.** Die erste Fassung sagte „lies
   wörtlich vor, antworte nicht darauf" — gemessen an openai/gpt-audio-mini las
   das Modell den Satz vor und hängte drei eigene an. Erst „Füge NICHTS hinzu"
   plus „höre nach dem letzten Wort sofort auf" hielt es. Der Unterschied waren
   758 KB gegen 158 KB Ton, und abgerechnet wird nach Ton. */
$sys = $rumpf['messages'][0]['content'];
pruefe('…und sie sagt: Wort für Wort',      str_contains($sys, 'Wort für Wort'));
pruefe('…nur das und sonst nichts',         str_contains($sys, 'AUSSCHLIESSLICH'));
pruefe('…nichts hinzufügen',                str_contains($sys, 'Füge NICHTS hinzu'));
pruefe('…nach dem letzten Wort aufhören',   str_contains($sys, 'sofort auf'));
pruefe('…und Fragen im Text nicht beantworten',
       str_contains($sys, 'beantworte sie nicht'));
gleich('der Text steht unverändert als Benutzerzeile',
       'Guten Morgen.', $rumpf['messages'][1]['content']);

// Umlaute dürfen nicht als ü hinausgehen — vorgelesen würde das falsch.
pruefe('Umlaute bleiben Umlaute',
       str_contains(pu_stimme_rumpf('Grüße', 'm', 'alloy', 'mp3'), 'Grüße'));

/* **Das Feld, ohne das gar nichts kommt.**
   Gemessen, nicht vermutet: Ohne `stream` antwortet OpenRouter mit
   „400: Audio output requires stream: true" — unabhängig vom Modell. Der erste
   Bau hier hatte es nicht, und der Fehler sah aus wie ein Modell, das keinen
   Ton kann. Diese Prüfung ist der Grund, warum das nicht wiederkommt. */
gleich('der Strom wird verlangt', true, $rumpf['stream']);
gleich('…und am Ende sollen die Token dabeistehen',
       true, $rumpf['stream_options']['include_usage']);

// ================================================================ Der Strom
gruppe('Den Strom zerlegen');

// So sieht eine echte Antwort aus: Häppchen, Kommentare, Herzschlag, [DONE].
$strom = implode("\n", [
    ': ping',
    'data: {"choices":[{"delta":{"audio":{"data":"SGFs","transcript":"Hal"}}}]}',
    '',
    'data: {"choices":[{"delta":{"audio":{"data":"bG8h","transcript":"lo!"}}}]}',
    'data: {"usage":{"total_tokens":142}}',
    'data: [DONE]',
]);
$s = pu_stimme_sse($strom);

gleich('kein Fehler',            '',      $s['fehler']);
gleich('zwei Häppchen',          2,       count($s['teile']));
gleich('das Transkript wächst mit', 'Hallo!', $s['transkript']);
gleich('die Tokenzahl kommt am Ende an', 142, $s['tokens']);
gleich('zusammengesetzt ergibt es den Ton', 'Hallo!', pu_stimme_fuegen($s['teile']));

// Ein Anbieter, der nicht stückelt, legt alles in eine fertige Nachricht.
$s = pu_stimme_sse('data: {"choices":[{"message":{"audio":{"data":"SGFsbG8h"}}}]}');
gleich('auch ein Stück am Stück wird gefunden', 'Hallo!', pu_stimme_fuegen($s['teile']));

// Ein Fehler mitten im Strom darf nicht als „kein Ton" durchgehen — sonst
// stünde da „das Modell gibt keinen Ton aus", obwohl das Guthaben leer ist.
$s = pu_stimme_sse('data: {"error":{"message":"Kein Guthaben."}}');
gleich('ein Fehler im Strom kommt heraus', 'Kein Guthaben.', $s['fehler']);

// Antwortet das Modell mit Text statt mit Ton, wird der Text mitgenommen — er
// steht später in der Meldung und ist der Beweis, dass falsch gewählt wurde.
$s = pu_stimme_sse('data: {"choices":[{"delta":{"content":"Guten Tag!"}}]}');
gleich('kein Ton',            0,            count($s['teile']));
gleich('aber der Text steht da', 'Guten Tag!', $s['text']);

// Müll darf nichts umwerfen.
$s = pu_stimme_sse("keine data-Zeile\ndata: {kaputt\ndata:\n\n");
gleich('unlesbare Zeilen werden übergangen', 0, count($s['teile']));

// ---- Zusammensetzen: die zwei Arten, wie Anbieter stückeln
gruppe('Base64 zusammensetzen — beide Arten');

// (1) Eine lange Kodierung zerschnitten: einzeln ungültig, zusammen richtig.
$ganz  = base64_encode('Prometheus');
$stuecke = str_split($ganz, 5);
pruefe('die Stücke sind einzeln ungültig',
       base64_decode($stuecke[1], true) === false || strlen($stuecke[1]) % 4 !== 0);
gleich('zusammengehängt ergeben sie das Ganze', 'Prometheus', pu_stimme_fuegen($stuecke));

// (2) Jedes Stück für sich kodiert, mit eigenem Polster.
gleich('einzeln kodierte Stücke werden einzeln entschlüsselt', 'Prometheus',
       pu_stimme_fuegen([base64_encode('Prome'), base64_encode('theus')]));

gleich('nichts drin, nichts raus', '', pu_stimme_fuegen([]));

// ---- pcm16 bekommt einen Kopf
gruppe('Nackte Abtastwerte werden abspielbar');

$wav = pu_stimme_wav(str_repeat("\x00\x01", 100));
gleich('es ist eine RIFF-Datei', 'RIFF', substr($wav, 0, 4));
gleich('…vom Typ WAVE',          'WAVE', substr($wav, 8, 4));
gleich('der Kopf ist 44 Bytes lang', 244, strlen($wav));
gleich('die Länge im Kopf stimmt', 200, unpack('V', substr($wav, 40, 4))[1]);

// ---- Fehlerdeutung
gruppe('Was eine Fehlermeldung sagen soll');

/* Der Fall, der diese Funktion nötig gemacht hat: „Audio output requires
   stream: true" enthält das Wort „audio", und die frühere Deutung machte
   daraus „dieses Modell kann keinen Ton". Das war falsch und schickte die
   Suche in die falsche Richtung — das Modell konnte es, die Anfrage war
   unvollständig. */
$m = pu_stimme_deutung(400, 'Audio output requires stream: true', 'x-ai/grok-voice-tts-1.0');
pruefe('der Strom-Fehler zeigt auf die Academy, nicht auf das Modell',
       str_contains($m, 'Fehler in dieser Academy'));
pruefe('…und behauptet NICHT, das Modell könne keinen Ton',
       !str_contains($m, 'gibt offenbar keinen Ton aus'));

/* Der zweite gemessene Fall. „Provider returned error" sagt gar nichts — und
   kam, weil mp3 im Strom nicht durchgeht. Ohne diese Deutung sucht man bei
   Modell, Stimme und Schlüssel und findet nichts, weil alle drei richtig sind. */
$m = pu_stimme_deutung(400, 'Provider returned error', 'openai/gpt-audio-mini', 'mp3');
pruefe('ein nichtssagender Anbieterfehler zeigt auf das Format',
       str_contains($m, 'pcm16'));
$m = pu_stimme_deutung(400, 'Provider returned error', 'openai/gpt-audio-mini', 'pcm16');
pruefe('…aber nicht, wenn pcm16 schon eingestellt ist', !str_contains($m, 'Stelle das Tonformat'));

$m = pu_stimme_deutung(400, 'Invalid voice: alloy', 'x-ai/grok-voice-tts-1.0');
pruefe('ein Stimmfehler zeigt auf die Stimme', str_contains($m, 'Stimme'));

$m = pu_stimme_deutung(400, 'Model does not support modalities', 'openai/gpt-4o');
pruefe('ein Modalitätsfehler zeigt auf das Modell',
       str_contains($m, 'gibt offenbar keinen Ton aus'));

// ================================================================ Zwei Wege
gruppe('Es gibt zwei Endpunkte, und kein Modell kann beide');

/* **Die Erkenntnis, die alles daran erklärt.** Gemessen am 23.08.2026:
   `openai/gpt-audio-mini` läuft nur über chat/completions — audio/speech sagt
   dort „Model does not exist". `x-ai/grok-voice-tts-1.0` läuft nur über
   audio/speech — chat/completions sagt „No endpoints found that support the
   requested output modalities". Wer den falschen Weg nimmt, bekommt eine
   Meldung, die klingt, als gäbe es das Modell nicht. */
pruefe('die Meldung von Weg 1 mit einem TTS-Modell wird erkannt',
       pu_stimme_falscher_weg('No endpoints found that support the requested output modalities: text, audio'));
pruefe('die Meldung von Weg 2 mit einem Chat-Modell auch',
       pu_stimme_falscher_weg('Model openai/gpt-audio-mini does not exist'));

// Nicht jeder Fehler ist ein Wegfehler. Bei „kein Guthaben" wäre ein zweiter
// Versuch auf dem anderen Weg nur ein zweiter Fehlschlag — und eine zweite
// Rechnung, falls er doch durchginge.
pruefe('leeres Guthaben ist KEIN Wegfehler',   !pu_stimme_falscher_weg('Insufficient credits'));
pruefe('eine unbekannte Stimme auch nicht',    !pu_stimme_falscher_weg('Invalid voice: alloy'));
pruefe('und ein Zeitablauf erst recht nicht',  !pu_stimme_falscher_weg('Timeout'));

// „does not exist" darf nicht als „gibt es nicht" gedeutet werden.
$m = pu_stimme_deutung(400, 'Model x/y does not exist', 'x/y');
pruefe('…sondern als falscher Endpunkt', str_contains($m, 'nicht bedient'));

// ---- Was auf welchem Weg herauskommt
gruppe('Das Format hängt am Weg, nicht am Wunsch');

// Weg 1 kann im Strom nur pcm16 — ein Wunsch nach mp3 wird still erfüllt,
// weil die Alternative ein Fehler wäre statt Ton.
gleich('Weg 1 liefert immer pcm16',        'pcm16', pu_stimme_endformat('chat', 'mp3'));
gleich('…auch wenn pcm16 gewünscht war',   'pcm16', pu_stimme_endformat('chat', 'pcm16'));

// Weg 2 kann beides und nimmt den Wunsch ernst.
gleich('Weg 2 nimmt mp3 ernst',   'mp3',   pu_stimme_endformat('tts', 'mp3'));
gleich('…und pcm16 auch',         'pcm16', pu_stimme_endformat('tts', 'pcm16'));

gleich('mp3 ist mpeg', 'audio/mpeg', pu_stimme_mime('mp3'));
gleich('pcm16 geht als wav hinaus, weil es einen Kopf bekommt',
       'audio/wav', pu_stimme_mime('pcm16'));

// ---- Der Rumpf von Weg 2
gruppe('Der Rumpf für audio/speech');

$t = json_decode(pu_stimme_tts_rumpf('Guten Morgen.', 'x-ai/grok-voice-tts-1.0', 'eve', 'mp3'), true);
gleich('das Modell steht drin', 'x-ai/grok-voice-tts-1.0', $t['model']);
gleich('der Text heisst hier „input", nicht „messages"', 'Guten Morgen.', $t['input']);
gleich('die Stimme steht oben, nicht in einem Unterfeld', 'eve', $t['voice']);
gleich('und das Format heisst response_format', 'mp3', $t['response_format']);

/* **pcm16 heisst hier `pcm`.** Derselbe Ton, ein anderer Name — und ein
   falscher Name wird nicht übergangen, sondern weist die ganze Anfrage ab:
   „expected one of mp3|pcm". */
gleich('pcm16 wird zu pcm', 'pcm',
       json_decode(pu_stimme_tts_rumpf('x', 'm', 'eve', 'pcm16'), true)['response_format']);

// Umlaute dürfen auch hier nicht als ü hinausgehen.
pruefe('Umlaute bleiben Umlaute',
       str_contains(pu_stimme_tts_rumpf('Grüße', 'm', 'eve', 'mp3'), 'Grüße'));

// Es gibt keine Systemzeile: Das Modell kann gar nicht antworten, also muss man
// es auch nicht davon abhalten.
pruefe('kein Systemauftrag — er wäre hier sinnlos', !isset($t['messages']));
pruefe('und kein Strom — es kommen rohe Bytes',     !isset($t['stream']));

// ================================================================ Grenzen
gruppe('Was gar nicht erst hinausgeht');

// Abgeschaltet heisst abgeschaltet — auch für Ebene 1.
pu_einst_global_setzen('stimme_an', 'aus');
$e = pu_vorlesen($chef, 'Ein Satz.');
pruefe('abgeschaltet gibt keinen Ton', !$e['ok']);
pruefe('…und sagt es',                 str_contains($e['fehler'], 'abgeschaltet'));

pu_einst_global_setzen('stimme_an', 'an');

$e = pu_vorlesen($chef, '   ');
pruefe('leerer Text wird abgewiesen', !$e['ok']);
pruefe('…mit Begründung',             str_contains($e['fehler'], 'kein Text'));

// Die Kostenbremse: Eine ganze Lektion am Stück ist ein Betrag, den niemand
// erwartet hat. Der Schnitt passiert VOR dem Aufruf, nicht danach.
$lang = str_repeat('Ein ziemlich langer Satz. ', 200);
pruefe('der Text ist wirklich zu lang', mb_strlen($lang) > PU_STIMME_MAX_ZEICHEN);
$e = pu_vorlesen($chef, $lang);
pruefe('zu langer Text wird abgewiesen', !$e['ok']);
pruefe('…und die Meldung nennt beide Zahlen',
       str_contains($e['fehler'], '2.000') && str_contains($e['fehler'], 'Zeichen'));

// ================================================================ Das Tor
gruppe('Vorlesen kostet — also gilt der Minus-Rahmen');

// Das Kind über den Rahmen hinaus verbrauchen lassen.
pu_token_verbrauchen($kind, 'Tutor · prometheus', PU_PROBE_TOKEN + PU_MINUS_RAHMEN + 1);
gleich('das Konto ist gestoppt', 'stopp', pu_token_stand($kind)['lage']);

// Ein Text, den es sonst nirgends gibt: Läge er im Zwischenspeicher, käme er
// von dort und das Tor wäre gar nicht gefragt worden.
$e = pu_vorlesen($kind, 'Ein Satz, den niemand sonst vorliest. ' . bin2hex(random_bytes(6)));
pruefe('gestopptes Konto bekommt keinen Ton', !$e['ok']);
pruefe('…und das Schild kommt mit, nicht nur ein Fehler', isset($e['stopp']));

/* Ebene 1 kennt keine Grenze. Gefragt wird hier das **Tor** und nicht
   `pu_vorlesen()` — und das ist der Unterschied zwischen einer Prüfung und
   einer Rechnung: Liegt auf diesem Rechner ein OpenRouter-Schlüssel, ginge
   `pu_vorlesen()` für Ebene 1 wirklich ins Netz und kostete bei jedem
   Testlauf Geld. Genau das ist beim Bau passiert, und es fiel nur auf, weil
   der Ton danach im Zwischenspeicher lag und die nächste Prüfung umwarf. */
pruefe('Ebene 1 kommt am Tor vorbei', pu_token_tor($chef)['offen']);
pruefe('…und das gestoppte Konto nicht',  !pu_token_tor($kind)['offen']);

// ================================================================ Schätzung
gruppe('Wenn keine Tokenzahl gemeldet wird');

// 150 Wörter je Minute, dieselbe Zahl wie bei den Sprechertexten.
gleich('ein kurzer Satz ist eine angefangene Minute',
       PU_TOKEN_JE_MINUTE, pu_stimme_schaetzung('Drei kurze Wörter'));
gleich('300 Wörter sind zwei Minuten',
       2 * PU_TOKEN_JE_MINUTE, pu_stimme_schaetzung(str_repeat('wort ', 300)));

// ================================================================ Speicher
gruppe('Zweimal derselbe Satz kostet einmal');

$s1 = pu_stimme_schluessel('Hallo', 'm', 'alloy', 'mp3');
gleich('derselbe Text ergibt denselben Schlüssel',
       $s1, pu_stimme_schluessel('Hallo', 'm', 'alloy', 'mp3'));

// Alles, was den Klang bestimmt, muss den Schlüssel ändern — sonst bekäme man
// nach einem Stimmwechsel die alte Stimme aus dem Speicher zurück.
pruefe('ein anderer Text ergibt einen anderen',   $s1 !== pu_stimme_schluessel('Hallo!', 'm', 'alloy', 'mp3'));
pruefe('eine andere Stimme ergibt einen anderen', $s1 !== pu_stimme_schluessel('Hallo', 'm', 'nova',  'mp3'));
pruefe('ein anderes Modell ergibt einen anderen', $s1 !== pu_stimme_schluessel('Hallo', 'x', 'alloy', 'mp3'));
pruefe('ein anderes Format ergibt einen anderen', $s1 !== pu_stimme_schluessel('Hallo', 'm', 'alloy', 'pcm16'));

// Ablegen und wiederfinden.
pu_stimme_ablegen($s1, 'mp3', 'TONDATEN');
gleich('was abgelegt wurde, kommt zurück', 'TONDATEN', pu_stimme_gespeichert($s1)['roh']);
gleich('…und sagt, in welchem Format',     'mp3',      pu_stimme_gespeichert($s1)['format']);
gleich('was nie abgelegt wurde, nicht',    null,       pu_stimme_gespeichert('gibtesnicht'));

/* **Gesucht wird über alle Formate, nicht über eines.** Welches Format
   herauskommt, hängt am Weg — und der kann beim Rückfall gewechselt haben.
   Ein Fund unter der falschen Endung wäre kein Fund, und derselbe Satz würde
   ein zweites Mal bezahlt. */
$quer = pu_stimme_schluessel('Quer', 'm', 'eve', 'pcm16');
pu_stimme_ablegen($quer, 'mp3', 'ALS-MP3-GEKOMMEN');
gleich('als mp3 abgelegt wird auch gefunden, wenn pcm16 gewünscht war',
       'ALS-MP3-GEKOMMEN', pu_stimme_gespeichert($quer)['roh']);
gleich('…und das gemeldete Format ist das echte', 'mp3', pu_stimme_gespeichert($quer)['format']);

// Ein altes Stück fliegt heraus statt veraltet zurückzukommen.
$alt = pu_stimme_schluessel('Alt', 'm', 'alloy', 'mp3');
pu_stimme_ablegen($alt, 'mp3', 'ALT');
touch(PU_DATA . '/tmp/stimme/' . $alt . '.mp3', time() - 31 * 86400);
gleich('älter als 30 Tage wird verworfen', null, pu_stimme_gespeichert($alt));

// Und der Speicher greift VOR dem Tor: Ein gestopptes Konto darf hören, was
// schon bezahlt ist. Sonst wäre dieselbe Erklärung plötzlich weg, obwohl sie
// nichts mehr kostet.
$fertig = pu_stimme_schluessel('Schon da.', pu_stimme_modell(), pu_stimme_name(), pu_stimme_format());
pu_stimme_ablegen($fertig, pu_stimme_format(), 'TONDATEN');
$e = pu_vorlesen($kind, 'Schon da.');
pruefe('gestopptes Konto hört, was schon im Speicher liegt', $e['ok']);
pruefe('…und es steht dran, dass es von dort kam',           $e['aus_speicher']);

// ================================================================ Je Tutor
gruppe('Jeder Tutor bekommt seine eigene Stimme');

/* **Vier Tutoren mit einer Stimme sind kein Chor, sondern ein Fehler.**
   Prometheus, Hermes und Hephaistos sind Männer, Athena ist eine Frau. Eine
   Stimme für alle macht aus der Göttin der Weisheit einen Mann.

   Welche Stimme wohin gehört, steht NICHT im Quelltext: Eine Zuordnung
   „Prometheus klingt wie rex" wäre beim nächsten Modellwechsel falsch — und
   nur von jemandem zu ändern, der PHP schreibt. Hier steht nur, WER eine
   eigene haben kann. */
gleich('vier Tutoren', 4, count(PU_STIMM_AGENTEN));

pu_einst_global_setzen('stimme_name', 'rex');
gleich('ohne eigene Stimme gilt die allgemeine', 'rex', pu_stimme_fuer('athena'));

pu_einst_global_setzen('stimme_athena', 'eve');
gleich('Athena bekommt ihre eigene',  'eve', pu_stimme_fuer('athena'));
gleich('…und die anderen bleiben',    'rex', pu_stimme_fuer('prometheus'));
gleich('…auch ohne Tutor',            'rex', pu_stimme_fuer(''));

// Gross- und Kleinschreibung darf hier nicht entscheiden: Der Name kommt aus
// dem Browser, und dort steht er mal so und mal so.
gleich('die Schreibweise ist egal', 'eve', pu_stimme_fuer('Athena'));

// Ein erfundener Tutor bekommt keine erfundene Stimme, sondern die allgemeine.
gleich('ein unbekannter Tutor fällt zurück', 'rex', pu_stimme_fuer('zeus'));

pu_einst_global_setzen('stimme_athena', '');
gleich('geleert gilt wieder die allgemeine', 'rex', pu_stimme_fuer('athena'));

/* **Und „leer" heisst nicht „alloy".** Vorher stand die Vorgabe hart auf der
   OpenAI-Stimme: Wer das Modell auf Grok umstellte und die Stimme nie angefasst
   hatte, bekam `404: Provider returned 404` — eine Meldung über eine
   Einstellung, die er nie gesetzt hatte. */
pu_einst_global_setzen('stimme_name', '');
pu_einst_global_setzen('stimme_modell', 'x-ai/grok-voice-tts-1.0');
gleich('leer heisst „was zu diesem Modell gehört"', 'eve', pu_stimme_name());
pu_einst_global_setzen('stimme_modell', 'openai/gpt-audio-mini');
gleich('…und beim anderen Modell etwas anderes',    'alloy', pu_stimme_name());
pu_einst_global_setzen('stimme_modell', '');

// ================================================================ Regler
gruppe('Vier Regler, die im Browser wirken');

/* **Warum im Browser und nicht am Dienst — gemessen, nicht bequem.**
   OpenRouter nimmt ein `speed`-Feld an und gibt 200 zurück; die Aufnahme ist
   danach exakt gleich lang. Am 24.08.2026 gegen x-ai/grok-voice-tts-1.0, Dauer
   aus den rohen Abtastwerten: ohne 2,63 s · speed 0.25 → 2,55 s · speed 4.0 →
   2,63 s. Ein Faktor 16 im Wert, kein Unterschied im Ton — und zwei identische
   Aufrufe schwanken stärker als die beiden Extreme. Der Wert wird geschluckt. */
gleich('vier Regler', 4, count(PU_STIMM_REGLER));

$k = pu_stimme_klang_lesen('');
gleich('ohne Angabe steht alles auf Werk', 100, $k['tempo']);
gleich('…und die Klangfarbe auf null',       0, $k['tiefe']);
pruefe('…und das gilt als neutral', pu_stimme_klang_neutral($k));

$k = pu_stimme_klang_lesen('120,-6,4,80');
gleich('Tempo',      120, $k['tempo']);
gleich('Tiefe',       -6, $k['tiefe']);
gleich('Klarheit',     4, $k['klarheit']);
gleich('Lautstärke',  80, $k['laut']);
pruefe('…und das ist nicht mehr neutral', !pu_stimme_klang_neutral($k));

/* Gestutzt statt abgewiesen: Eine Reglerstellung ist keine Eingabe, bei der ein
   Tippfehler Schaden anrichtet. Ein Fehler beim Vorlesen, weil in einer
   Einstellung „999" steht, wäre unverhältnismässig. */
$k = pu_stimme_klang_lesen('999,-99,99,-5');
gleich('zu hoch wird gestutzt',  130, $k['tempo']);
gleich('zu tief auch',           -12, $k['tiefe']);
gleich('…in beide Richtungen',    12, $k['klarheit']);
gleich('…und bei jedem Regler',   30, $k['laut']);

// Halb ausgefüllt darf nicht halb kaputt sein.
$k = pu_stimme_klang_lesen('110');
gleich('was dasteht, gilt',            110, $k['tempo']);
gleich('was fehlt, steht auf Werk',    100, $k['laut']);

$k = pu_stimme_klang_lesen('unsinn,,x,');
gleich('Unsinn fällt auf Werk zurück', 100, $k['tempo']);

// Je Tutor gespeichert — und ein unbekannter Tutor bekommt keine erfundene Stellung.
pu_einst_global_setzen('klang_athena', '90,3,-2,110');
gleich('Athenas Stellung',    90, pu_stimme_klang('athena')['tempo']);
gleich('Prometheus unberührt', 100, pu_stimme_klang('prometheus')['tempo']);
gleich('ein erfundener Tutor bekommt Werk', 100, pu_stimme_klang('zeus')['tempo']);
pu_einst_global_setzen('klang_athena', '');

wirft('eine kaputte Zeile wird gar nicht erst gespeichert',
      fn() => pu_einst_global_setzen('klang_athena', '100,0,0'), 'unerlaubte Schreibweise');

// ================================================================ Eigene Stimme
/* **Jeder stellt seinen Tutor selbst ein — ohne ihn allen zu verstellen.**
 *
 * Vorher gab es nur die Academy-Regel. Sie erreichte nur die Verwaltung, und
 * wer sie erreichte, änderte die Stimme für alle. Jetzt liegt darüber eine
 * persönliche Ebene. Geprüft wird genau die Reihenfolge — sie ist der ganze
 * Zweck der Änderung, und eine vertauschte Reihenfolge fiele sonst erst auf,
 * wenn ein Schüler die Stimme der Klasse umstellt. */
gruppe('Die eigene Stimme sticht die der Academy');

pu_einst_global_setzen('stimme_name',   'rex');
pu_einst_global_setzen('stimme_athena', 'eve');

gleich('ohne eigene Wahl gilt die Academy-Vorgabe',
       'eve', pu_stimme_fuer('athena', $kind));

pu_einst_person_setzen($kind, 'stimme_athena', 'nova');
gleich('das Kind hört jetzt seine eigene',
       'nova', pu_stimme_fuer('athena', $kind));
gleich('…und alle anderen weiter die der Academy',
       'eve', pu_stimme_fuer('athena', $chef));

/* `0` heisst „niemand bestimmtes". Das ist der Fall beim Probelauf der
   Verwaltung: Dort soll die Vorgabe der Academy geprüft werden und nicht die
   private Vorliebe dessen, der gerade auf den Knopf drückt. */
gleich('ohne Person zählt nur die Regel', 'eve', pu_stimme_fuer('athena'));

/* Leer muss abwählbar sein. Zählte der leere Wert als Wert, käme man nie
   wieder zur Academy-Vorgabe zurück — nur zu einer anderen eigenen Stimme. */
pu_einst_person_setzen($kind, 'stimme_athena', '');
gleich('geleert gilt wieder die Academy-Vorgabe',
       'eve', pu_stimme_fuer('athena', $kind));

// Ein Tutor ohne Academy-Eintrag: die eigene Wahl sticht auch die allgemeine.
pu_einst_person_setzen($kind, 'stimme_prometheus', 'onyx');
gleich('eigene Wahl vor der allgemeinen Stimme',
       'onyx', pu_stimme_fuer('prometheus', $kind));
gleich('…und für andere bleibt es die allgemeine',
       'rex', pu_stimme_fuer('prometheus', $chef));
pu_einst_person_setzen($kind, 'stimme_prometheus', '');

// Dasselbe für die vier Regler.
pu_einst_global_setzen('klang_athena', '90,3,-2,110');
gleich('ohne eigene Regler gilt die Academy',
       90, pu_stimme_klang('athena', $kind)['tempo']);

pu_einst_person_setzen($kind, 'klang_athena', '125,0,0,100');
gleich('eigene Reglerstellung sticht',
       125, pu_stimme_klang('athena', $kind)['tempo']);
gleich('…und lässt die der Academy unberührt',
       90, pu_stimme_klang('athena', $chef)['tempo']);

pu_einst_person_setzen($kind, 'klang_athena', '');
gleich('geleert gilt wieder die Academy',
       90, pu_stimme_klang('athena', $kind)['tempo']);
pu_einst_global_setzen('klang_athena', '');

/* Eine kaputte eigene Zeile wird ebenso abgewiesen wie eine kaputte der
   Academy. Sonst hinge die Wache nur an der Ebene, die die Verwaltung
   benutzt — und die persönliche Ebene wäre das Loch daneben. */
wirft('auch persönlich wird eine kaputte Zeile abgewiesen',
      fn() => pu_einst_person_setzen($kind, 'klang_athena', '100,0,0'),
      'unerlaubte Schreibweise');
wirft('…und ein Stimmname mit Leerzeichen ebenso',
      fn() => pu_einst_person_setzen($kind, 'stimme_athena', 'e ve'),
      'unerlaubte Schreibweise');

// ================================================================ Archiv
gruppe('Jede Aufnahme wird aufbewahrt — nach Konto getrennt');

gleich('ab Werk an', 'an', pu_regel('stimme_archiv'));

/* **Der Ordnername wird hart entschärft.** Was aus der Datenbank kommt, hat in
   einem Dateipfad nichts verloren, solange es nicht geprüft ist — ein Konto mit
   „..“ in der Kennung würde sonst aus `data/` heraus schreiben. */
gleich('Umlaute werden umgeschrieben, nicht weggeworfen',
       'fuer-uebermorgen', pu_stimme_dateiname('Für Übermorgen'));
gleich('Punkte und Schrägstriche fallen weg',
       'a-b-c', pu_stimme_dateiname('../a/b.c'));
gleich('nichts Brauchbares ergibt nichts', '', pu_stimme_dateiname('...'));
gleich('und es wird gekürzt', 10, mb_strlen(pu_stimme_dateiname(str_repeat('wort ', 40), 10)));

pruefe('kein Ausbruch aus dem Archiv möglich',
       !str_contains(pu_stimme_dateiname('../../etc'), '.'));

$ordner = pu_stimme_archiv_ordner($kind);
pruefe('jedes Konto hat seinen eigenen Ordner',
       str_ends_with(str_replace('\\', '/', $ordner), '/voice/kind'));
pruefe('…und er liegt unter data/voice',
       str_contains(str_replace('\\', '/', $ordner), '/data/voice/'));

// Ablegen und wiederfinden.
$pfad = pu_stimme_archivieren($kind, 'Guten Morgen, Welt.', 'TONDATEN', 'mp3',
                              ['schluessel' => str_repeat('a', 64), 'agent' => 'athena',
                               'stimme' => 'eve', 'modell' => 'x-ai/grok-voice-tts-1.0']);
pruefe('die Aufnahme liegt da',      $pfad !== '' && is_file($pfad));
pruefe('der Name ist lesbar',        str_contains($pfad, 'guten-morgen-welt'));
pruefe('…und nennt den Tutor',       str_contains($pfad, 'athena'));
pruefe('…und die Stimme',            str_contains($pfad, 'eve'));

// Der Text daneben — sonst ist ein Ordner voller Tondateien ein Ordner, den man
// abspielen muss, um ihn zu durchsuchen.
$txt = preg_replace('/\.mp3$/', '.txt', $pfad);
pruefe('der Text liegt daneben',        is_file($txt));
$inhalt = (string)file_get_contents($txt);
pruefe('…mit dem vollen Wortlaut',      str_contains($inhalt, 'Guten Morgen, Welt.'));
pruefe('…und womit gesprochen wurde',   str_contains($inhalt, 'x-ai/grok-voice-tts-1.0'));

// Zweimal dasselbe legt nicht zweimal ab: Ein zweiter Klick kommt sonst nach
// einem Ablauf des Zwischenspeichers als zweite Datei im Archiv an.
$nochmal = pu_stimme_archivieren($kind, 'Guten Morgen, Welt.', 'TONDATEN', 'mp3',
                                 ['schluessel' => str_repeat('a', 64)]);
gleich('dieselbe Aufnahme kommt nicht zweimal', '', $nochmal);

// Abgeschaltet heisst abgeschaltet.
pu_einst_global_setzen('stimme_archiv', 'aus');
gleich('ausgeschaltet wird nichts abgelegt', '',
       pu_stimme_archivieren($kind, 'Etwas anderes.', 'TON', 'mp3', ['schluessel' => 'bbbbbbbb']));
pu_einst_global_setzen('stimme_archiv', 'an');

// pcm16 trägt bereits einen WAV-Kopf und heisst deshalb auch so — eine Datei
// namens „.pcm16" könnte kein Abspielprogramm öffnen.
$w = pu_stimme_archivieren($kind, 'Nackt.', 'TON', 'pcm16', ['schluessel' => 'cccccccc']);
pruefe('pcm16 landet als .wav im Archiv', str_ends_with($w, '.wav'));

// Aufräumen: Was diese Prüfung angelegt hat, bleibt nicht liegen.
foreach (glob($ordner . '/*') ?: [] as $f) @unlink($f);
@rmdir($ordner);

// ================================================================ Wegwahl
gruppe('Welchen Weg ein Modell nimmt');

pu_einst_global_setzen('stimme_weg', 'chat');
gleich('von Hand gesetzt gilt für alle', 'chat', pu_stimme_weg_fuer('x-ai/grok-voice-tts-1.0'));
pu_einst_global_setzen('stimme_weg', 'tts');
gleich('…in beide Richtungen',           'tts',  pu_stimme_weg_fuer('openai/gpt-audio-mini'));

pu_einst_global_setzen('stimme_weg', 'auto');
gleich('auto ist die Vorgabe', 'auto', pu_regel('stimme_weg'));

/* `auto` schlägt nur im Zwischenspeicher nach, nie im Netz: Ein zusätzlicher
   Aufruf vor jedem Vorlesen wäre eine Verzögerung, die nichts einbringt — der
   Rückfall fängt den Irrtum ohnehin ab. Steht nichts da, gilt Weg 1, weil das
   Vorgabemodell dorthin gehört. */
gleich('ein unbekanntes Modell nimmt Weg 1', 'chat', pu_stimme_weg_fuer('erfunden/gibtesnicht'));

bilanz();
