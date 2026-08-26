<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — Sprachausgabe: geschriebenen Text vorlesen lassen.
 *
 * Das Gegenstück zu `srv/sprache.php`. Dort geht Ton hinein und Text kommt
 * heraus; hier geht Text hinein und Ton kommt heraus.
 *
 * **Der Unterschied ist wichtig, und er ist nicht technisch.** Die Erkennung
 * läuft auf diesem Rechner — eine Aufnahme verlässt ihn nie. Die Ausgabe läuft
 * über OpenRouter, also über das Netz. Was vorgelesen werden soll, geht damit
 * an einen fremden Dienst. Deshalb ist sie ab Werk **aus**, und deshalb steht
 * es in den Einstellungen dabei.
 *
 * ## Es gibt ZWEI Wege, und sie schliessen einander aus
 *
 * Das ist die wichtigste Erkenntnis in dieser Datei, und sie ist gemessen:
 * OpenRouter hat für Sprachausgabe **zwei getrennte Endpunkte**, und kein
 * Modell kann beide. Wer den falschen nimmt, bekommt eine Fehlermeldung, die
 * so klingt, als gäbe es das Modell nicht.
 *
 * **Weg 1 — `chat/completions` („chat").** Für Modelle, die neben Text auch
 * Ton ausgeben:
 *
 *     "modalities": ["text", "audio"],
 *     "audio":  { "voice": "alloy", "format": "pcm16" },
 *     "stream": true
 *
 * Der Strom ist Bedingung, nicht Feinheit: Ohne ihn kommt
 * `400: Audio output requires stream: true`. Und im Strom liefert dieser Weg
 * **nur pcm16** — mp3 endet in `400: Provider returned error`. Beides gemessen
 * an `openai/gpt-audio-mini`.
 *
 * **Weg 2 — `audio/speech` („tts").** Für reine Vorlesemodelle. Die
 * OpenAI-Form, roh, ohne Strom und ohne JSON:
 *
 *     { "model": …, "input": …, "voice": "eve", "response_format": "mp3" }
 *
 * Zurück kommen unmittelbar die Tonbytes. Erlaubt sind hier nur `mp3` und
 * `pcm` — genau andersherum als oben.
 *
 * Am 23.08.2026 gemessen: `openai/gpt-audio-mini` läuft **nur** über Weg 1
 * (`audio/speech` sagt „Model does not exist"), `x-ai/grok-voice-tts-1.0`
 * **nur** über Weg 2 (`chat/completions` sagt „No endpoints found that support
 * the requested output modalities"). Deshalb wird der Weg gewählt und im
 * Zweifel gewechselt — siehe `pu_stimme_weg_fuer()` und `pu_stimme_lauf()`.
 *
 * ## Welche Modelle das können
 *
 * Welche es sind, steht nicht hier: Der Katalog wird geholt
 * (`srv/katalog.php`) und in den Einstellungen nach „gibt Ton aus" gefiltert.
 * Eine Liste im Quelltext wäre am Tag nach dem Schreiben falsch.
 *
 * **Und der Katalog ist selbst unvollständig.** `x-ai/grok-voice-tts-1.0`
 * steht in keinem der 422 Einträge von `/api/v1/models` — mit Schlüssel wie
 * ohne —, es gibt das Modell aber. Wer die Kennung kennt, bekommt sie deshalb
 * einzeln nachgeschlagen (`pu_katalog_einzeln()`). Jeder Modellname bleibt
 * eintragbar, auch einer, den es heute noch nicht gibt.
 */

/**
 * Stimmen als **Vorschlag**, nicht als Gesetz.
 *
 * Die Namen gehören zum Modell, nicht zur Academy — und sie sind je Anbieter
 * verschieden. Eine geschlossene Liste hätte deshalb genau die Modelle
 * ausgesperrt, um die es hier geht. Das Feld bleibt frei beschreibbar; das
 * hier ist die Auswahl, die man anklicken kann, ohne nachzuschlagen.
 *
 * Beide Gruppen sind ausprobiert, nicht abgeschrieben: Die sechs Grok-Namen
 * wurden gegen `audio/speech` durchgezählt (was nicht ging, gab 404).
 */
const PU_STIMMEN = [
    // OpenAI — Weg 1 (chat/completions)
    'alloy'   => 'Alloy — ruhig, neutral · OpenAI',
    'echo'    => 'Echo — dunkler, getragen · OpenAI',
    'fable'   => 'Fable — erzählend · OpenAI',
    'onyx'    => 'Onyx — tief · OpenAI',
    'nova'    => 'Nova — hell, freundlich · OpenAI',
    'shimmer' => 'Shimmer — weich · OpenAI',

    // Grok Voice TTS — Weg 2 (audio/speech). Wie sie klingen, steht bewusst
    // nicht dabei: Das gehört gehört, nicht behauptet. Der Probelauf spielt sie ab.
    'eve'     => 'Eve · Grok',
    'ara'     => 'Ara · Grok',
    'leo'     => 'Leo · Grok',
    'rex'     => 'Rex · Grok',
    'sal'     => 'Sal · Grok',
    'gork'    => 'Gork · Grok',
];

/**
 * Tonformate — und es sind genau zwei, weil mehr nirgends funktionieren.
 *
 * Vorher standen hier vier. `opus` und `wav` sind geflogen: Weg 1 nimmt im
 * Strom nur pcm16, Weg 2 nur mp3 und pcm. Eine Auswahl anzubieten, die auf
 * beiden Wegen scheitert, ist keine Freiheit, sondern eine Falle.
 *
 * `pcm16` sind nackte Abtastwerte ohne Kopf — ein Browser kann damit nichts
 * anfangen. Sie bekommen in `pu_stimme_wav()` einen WAV-Kopf und sind danach
 * eine gewöhnliche Datei.
 */
const PU_STIMM_FORMATE = ['pcm16', 'mp3'];

/**
 * Welche Stimme zu welchem Modell gehört.
 *
 * **Das ist die häufigste Fehlerquelle der ganzen Sprachausgabe**, und sie
 * sieht nach etwas anderem aus. Wer das Modell wechselt und die Stimme stehen
 * lässt, bekommt gemessen:
 *
 *   · Grok mit „alloy"        → `404: Provider returned 404`
 *   · gpt-audio-mini mit „eve" → `400: Provider returned error`
 *
 * Beide Meldungen sagen nichts, und keine erwähnt die Stimme. Man sucht dann
 * beim Format, beim Schlüssel, beim Guthaben — überall ausser dort, wo es
 * liegt. Diese Tabelle ist der Grund, warum die Meldung es jetzt sagen kann.
 */
const PU_STIMM_FAMILIEN = [
    'openai' => ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'],
    'grok'   => ['eve', 'ara', 'leo', 'rex', 'sal', 'gork'],
];

/**
 * Die Tutoren, die eine eigene Stimme bekommen können.
 *
 * **Hier steht nur, WER eine Stimme haben kann — nicht, welche.** Das ist die
 * Trennung, auf die es ankommt: Eine Zuordnung „Prometheus klingt wie rex" im
 * Quelltext wäre beim nächsten Modellwechsel falsch und müsste von jemandem
 * geändert werden, der PHP schreiben kann. Welche Stimme wohin gehört, steht
 * in den Einstellungen und wird dort angehört, verglichen und umgestellt.
 *
 * Warum es die Aufteilung überhaupt gibt: **Vier Tutoren mit einer Stimme sind
 * kein Chor, sondern ein Fehler.** Prometheus, Hermes und Hephaistos sind
 * Männer, Athena ist eine Frau. Eine Stimme für alle macht aus der Göttin der
 * Weisheit einen Mann, und das hört man beim ersten Satz.
 */
const PU_STIMM_AGENTEN = ['prometheus', 'athena', 'hermes', 'hephaistos'];

/**
 * Vier Regler, mit denen sich eine Stimme nachjustieren lässt.
 *
 * **Sie wirken im Browser, nicht am Dienst — und das ist gemessen, nicht
 * bequem.** Der naheliegende Weg wäre `speed` in der Anfrage. OpenRouter nimmt
 * das Feld an und gibt 200 zurück; die Aufnahme ist danach exakt gleich lang.
 * Am 24.08.2026 gegen `x-ai/grok-voice-tts-1.0` gemessen, Dauer aus den rohen
 * Abtastwerten gerechnet:
 *
 *     ohne 2,63 s · speed 0.25 → 2,55 s · speed 1.0 → 2,71 s · speed 4.0 → 2,63 s
 *
 * Ein Faktor 16 im Wert, kein Unterschied im Ton — und zwei identische Aufrufe
 * schwanken stärker (2,63 gegen 2,47) als die beiden Extreme. Der Wert wird
 * geschluckt. Regler darauf wären vier Attrappen.
 *
 * Im Browser wirken sie dagegen sofort, kosten nichts und lassen sich am
 * fertigen Ton ausprobieren, ohne ihn neu zu bezahlen. Das ist zum Justieren
 * sogar der bessere Ort: Man zieht und hört, statt zu zahlen und zu hoffen.
 *
 * Was jeder tut, in einem Wort — mehr passt nicht über einen kleinen Regler,
 * und mehr braucht es auch nicht:
 *
 *   · Tempo      — schneller oder langsamer, die Tonhöhe bleibt
 *   · Tiefe      — mehr oder weniger Bass; macht eine Stimme voller oder dünner
 *   · Klarheit   — mehr oder weniger Höhen; macht sie deutlicher oder weicher
 *   · Lautstärke — nur lauter oder leiser
 */
const PU_STIMM_REGLER = [
    'tempo'    => ['wort' => 'Tempo',      'min' => 70,  'max' => 130, 'vorgabe' => 100, 'einheit' => '%'],
    'tiefe'    => ['wort' => 'Tiefe',      'min' => -12, 'max' => 12,  'vorgabe' => 0,   'einheit' => 'dB'],
    'klarheit' => ['wort' => 'Klarheit',   'min' => -12, 'max' => 12,  'vorgabe' => 0,   'einheit' => 'dB'],
    'laut'     => ['wort' => 'Lautstärke', 'min' => 30,  'max' => 130, 'vorgabe' => 100, 'einheit' => '%'],
];

/**
 * Die Reglerstellung eines Tutors.
 *
 * Gespeichert wird als eine Zeile mit vier Zahlen (`100,0,0,100`) und nicht als
 * vier Einträge je Tutor. Sechzehn Einstellungen für vier Regler wären eine
 * Tabelle, in der man nichts mehr findet — und sie gehören ohnehin zusammen:
 * Wer eine Stimme justiert, verstellt selten nur eine davon.
 *
 * Jeder Wert wird auf seinen Bereich gestutzt statt abgewiesen. Eine
 * Reglerstellung ist keine Eingabe, bei der ein Tippfehler Schaden anrichtet —
 * und ein Fehler beim Vorlesen, weil in einer Einstellung „140" steht, wäre
 * unverhältnismässig.
 */
function pu_stimme_klang(string $agent = '', int $lernender = 0): array
{
    $agent = strtolower(trim($agent));
    if (!in_array($agent, PU_STIMM_AGENTEN, true)) return pu_stimme_klang_lesen('');

    return pu_stimme_klang_lesen(pu_stimme_eigen_oder_regel('klang_' . $agent, $lernender));
}

/**
 * Der eigene Wert, sonst der der Academy.
 *
 * Zwei Ebenen und keine dritte: Was der Einzelne für sich gesetzt hat, sonst
 * was die Academy vorgibt. Leer zählt dabei als „nichts gesetzt" und nicht als
 * Wert — sonst könnte man eine eigene Einstellung nie mehr abwählen, sondern
 * nur noch durch eine andere ersetzen.
 *
 * `$lernender = 0` heisst „niemand bestimmtes": dann gilt nur die Regel. Das
 * ist der Fall bei Probeläufen der Verwaltung, wo gerade die Academy-Vorgabe
 * geprüft werden soll und nicht die private Vorliebe des Prüfenden.
 */
function pu_stimme_eigen_oder_regel(string $schluessel, int $lernender): string
{
    if ($lernender > 0 && function_exists('pu_einst')) {
        $eigen = trim(pu_einst($lernender, $schluessel));
        if ($eigen !== '') return $eigen;
    }
    return trim(pu_regel($schluessel));
}

function pu_stimme_klang_lesen(string $roh): array
{
    $teile = $roh === '' ? [] : explode(',', $roh);
    $aus   = [];
    $i     = 0;

    foreach (PU_STIMM_REGLER as $name => $r) {
        $wert = isset($teile[$i]) && is_numeric(trim($teile[$i]))
              ? (int)round((float)trim($teile[$i]))
              : $r['vorgabe'];

        $aus[$name] = max($r['min'], min($r['max'], $wert));
        $i++;
    }
    return $aus;
}

/** Steht der Klang auf Werk? Dann kann die Wiedergabe den ganzen Umweg sparen. */
function pu_stimme_klang_neutral(array $klang): bool
{
    foreach (PU_STIMM_REGLER as $name => $r) {
        if (($klang[$name] ?? $r['vorgabe']) !== $r['vorgabe']) return false;
    }
    return true;
}

/**
 * Die Stimme für einen Tutor.
 *
 * Drei Stufen, und mehr sind es absichtlich nicht:
 *
 *   1. Was DIESER Lernende für diesen Tutor eingetragen hat.
 *   2. Sonst, was die Academy für diesen Tutor eingetragen hat.
 *   3. Sonst die allgemeine Stimme.
 *
 * Die erste Stufe kam dazu, damit jeder seinen Tutor selbst einstellen kann,
 * ohne ihn allen anderen mitzuverstellen. Sie kostet nichts: Ein Stimmname
 * ist ein Wort, kein Modell — die Rechnung ändert sich dadurch nicht.
 *
 * Kein Automatismus dazwischen. Wer eine Stimme geändert haben will, ändert
 * sie — und findet sie beim nächsten Mal genau dort wieder, wo er sie gesetzt
 * hat. Eine Regel, die dazwischenfunkt, wäre bequemer und unvorhersehbar.
 */
function pu_stimme_fuer(string $agent = '', int $lernender = 0): string
{
    $agent = strtolower(trim($agent));

    if (in_array($agent, PU_STIMM_AGENTEN, true)) {
        $eigen = pu_stimme_eigen_oder_regel('stimme_' . $agent, $lernender);
        if ($eigen !== '') return $eigen;
    }
    return pu_stimme_name();
}

/** Zu welcher Familie ein Modell gehört — oder '' , wenn unbekannt. */
function pu_stimme_familie(string $modell): string
{
    $m = strtolower($modell);
    if (str_contains($m, 'grok'))    return 'grok';
    if (str_starts_with($m, 'openai/') || str_contains($m, 'gpt-audio')) return 'openai';
    return '';
}

/**
 * Passt diese Stimme zu diesem Modell?
 *
 * `null` heisst „weiss ich nicht" und ist die ehrliche Antwort für jedes
 * Modell, das hier nicht eingetragen ist. Ein `false` auf Verdacht würde eine
 * gültige Einstellung anmeckern — und beim nächsten neuen Anbieter läge es
 * falsch.
 */
function pu_stimme_passt(string $modell, string $name): ?bool
{
    $f = pu_stimme_familie($modell);
    if ($f === '' || $name === '') return null;

    // Nur wenn die Stimme einer ANDEREN bekannten Familie gehört, ist sie
    // sicher falsch. Ein unbekannter Name kann eine neue Stimme sein.
    if (in_array($name, PU_STIMM_FAMILIEN[$f], true)) return true;

    foreach (PU_STIMM_FAMILIEN as $andere => $namen) {
        if ($andere !== $f && in_array($name, $namen, true)) return false;
    }
    return null;
}

/**
 * Welcher der beiden Endpunkte benutzt wird.
 *
 * `auto` schlägt im Katalog nach: Meldet das Modell `speech`, ist es ein reines
 * Vorlesemodell (Weg 2); meldet es `audio`, kann es beides (Weg 1). Steht es
 * nirgends, wird Weg 1 versucht — und bei der typischen Fehlermeldung des
 * falschen Weges einmal gewechselt. Ein Fehlversuch kostet keine Token, nur
 * eine halbe Sekunde.
 */
const PU_STIMM_WEGE = ['auto', 'chat', 'tts'];

/** Abtastrate für `pcm16`. 24 kHz ist, was der OpenAI-Weg im Strom schickt. */
const PU_STIMME_PCM_RATE = 24000;

/**
 * Wie lang ein Stück Text höchstens sein darf.
 *
 * Nicht als Schikane, sondern als Kostenbremse: Vorlesen wird nach Ton
 * abgerechnet, und eine ganze Lektion am Stück ist ein Betrag, den niemand
 * erwartet hat. Wer mehr braucht, liest in Abschnitten vor — das ist ohnehin
 * angenehmer zu hören.
 */
const PU_STIMME_MAX_ZEICHEN = 2000;

function pu_stimme_an(): bool
{
    return pu_regel('stimme_an') === 'an';
}

/** Das Modell fürs Vorlesen. Leer heisst: die Vorgabe. */
function pu_stimme_modell(): string
{
    $gesetzt = pu_regel('stimme_modell');
    if ($gesetzt !== '') return $gesetzt;
    return pu_env('PU_STIMME_MODELL', 'openai/gpt-audio-mini');
}

/**
 * Die Stimme. Frei eintragbar, weil jeder Anbieter eigene Namen hat.
 *
 * Eine Liste erlaubter Werte hätte `x-ai/grok-voice-tts-1.0` unbenutzbar
 * gemacht: Dessen Stimmen heissen nicht „alloy". Geprüft wird deshalb nur die
 * Form (Buchstaben, Ziffern, Strich), nicht der Inhalt — und ob es die Stimme
 * beim gewählten Modell wirklich gibt, sagt der Probelauf.
 */
function pu_stimme_name(): string
{
    $s = trim(pu_regel('stimme_name'));
    return $s !== '' ? $s : pu_stimme_vorgabe(pu_stimme_modell());
}

/**
 * Die passende Vorgabestimme für ein Modell.
 *
 * **Vorher stand hier hart „alloy", und genau das war der Fehler.** Wer das
 * Modell auf Grok umstellte und die Stimme nie angefasst hatte, bekam
 * `404: Provider returned 404` — eine Meldung über eine Einstellung, die er nie
 * gesetzt hatte. „Leer" darf nicht „OpenAI" heissen, sondern muss „das, was zu
 * diesem Modell gehört" heissen.
 */
function pu_stimme_vorgabe(string $modell): string
{
    $f = pu_stimme_familie($modell);
    return $f !== '' ? PU_STIMM_FAMILIEN[$f][0] : 'alloy';
}

/**
 * Das gewünschte Tonformat. Vorgabe ist `pcm16`, und das ist gemessen.
 *
 * Naheliegend wäre mp3: spielt überall, ist klein. Auf Weg 1 kommt damit aber
 * `400: Provider returned error` zurück. Auf Weg 2 ist es andersherum — dort
 * geht mp3 und pcm16 heisst `pcm`. Was tatsächlich verlangt wird, entscheidet
 * deshalb `pu_stimme_endformat()`; das hier ist nur der Wunsch.
 */
function pu_stimme_format(): string
{
    $f = pu_regel('stimme_format');
    return in_array($f, PU_STIMM_FORMATE, true) ? $f : 'pcm16';
}

/** Welcher Endpunkt — `auto`, `chat` oder `tts`. */
function pu_stimme_weg(): string
{
    $w = pu_regel('stimme_weg');
    return in_array($w, PU_STIMM_WEGE, true) ? $w : 'auto';
}

/**
 * Was auf diesem Weg wirklich herauskommt.
 *
 * Weg 1 kann im Strom nur pcm16 — der Wunsch nach mp3 wird dort stillschweigend
 * zu pcm16, weil die Alternative ein Fehler wäre statt Ton. Weg 2 kann beides,
 * nimmt den Wunsch also ernst.
 */
function pu_stimme_endformat(string $weg, string $wunsch): string
{
    if ($weg === 'chat') return 'pcm16';
    return $wunsch === 'mp3' ? 'mp3' : 'pcm16';
}

function pu_stimme_mime(string $format): string
{
    // pcm16 kommt nackt an und geht als WAV hinaus — der Kopf wird in
    // `pu_stimme_wav()` aufgesetzt, bevor irgendetwas gespeichert wird.
    return $format === 'mp3' ? 'audio/mpeg' : 'audio/wav';
}

/**
 * Welcher Weg für dieses Modell.
 *
 * Nachgeschlagen wird **nur im Zwischenspeicher** des Katalogs, nie im Netz:
 * Ein zusätzlicher Aufruf vor jedem Vorlesen wäre eine Verzögerung, die nichts
 * einbringt — der Rückfall in `pu_stimme_lauf()` fängt den Irrtum ohnehin ab.
 */
function pu_stimme_weg_fuer(string $modell): string
{
    $gesetzt = pu_stimme_weg();
    if ($gesetzt !== 'auto') return $gesetzt;

    require_once PU_ROOT . '/srv/katalog.php';

    $datei = pu_katalog_datei();
    if (is_file($datei)) {
        $j = json_decode((string)@file_get_contents($datei), true);
        foreach (($j['modelle'] ?? []) as $m) {
            if (($m['id'] ?? '') !== $modell) continue;
            $aus = $m['aus'] ?? [];
            if (in_array('speech', $aus, true)) return 'tts';
            if (in_array('audio',  $aus, true)) return 'chat';
            break;
        }
    }

    // Unbekannt: Weg 1, weil das Vorgabemodell dorthin gehört. Liegt es
    // daneben, wechselt `pu_stimme_lauf()` einmal — das kostet keine Token.
    return 'chat';
}

// ---------------------------------------------------------------- Der Speicher
/**
 * **Zweimal derselbe Satz kostet einmal.**
 *
 * Vorgelesenes ist teuer und ändert sich nicht: Derselbe Text mit derselben
 * Stimme im selben Modell ergibt dasselbe Tonstück. Ein Lernender, der eine
 * Erklärung dreimal hört, soll sie nicht dreimal bezahlen — und beim zweiten
 * Klick soll sie sofort da sein, nicht nach vier Sekunden.
 *
 * Der Schlüssel ist der Hash über alles, was das Ergebnis bestimmt. Ändert
 * sich die Stimme, ist es ein anderer Schlüssel; ändert sich ein Komma im
 * Text, ebenso.
 */
function pu_stimme_ablage(): string
{
    $ordner = PU_DATA . '/tmp/stimme';
    if (!is_dir($ordner)) @mkdir($ordner, 0777, true);
    return $ordner;
}

function pu_stimme_schluessel(string $text, string $modell, string $name, string $format): string
{
    return hash('sha256', $modell . "\0" . $name . "\0" . $format . "\0" . $text);
}

/**
 * Was zu diesem Schlüssel abgelegt ist — samt Format.
 *
 * **Gesucht wird über alle Formate, nicht über eines.** Der Grund: Welches
 * Format wirklich herauskommt, hängt am gewählten Weg, und der kann beim
 * Rückfall gewechselt haben. Ein Fund unter der falschen Endung wäre sonst
 * kein Fund, und derselbe Satz würde ein zweites Mal bezahlt. Zwei
 * Dateiabfragen sind billiger als ein Modellaufruf.
 *
 * @return array{roh: string, format: string}|null
 */
function pu_stimme_gespeichert(string $schluessel, string $format = ''): ?array
{
    $formate = $format !== '' ? [$format] : PU_STIMM_FORMATE;

    foreach ($formate as $f) {
        $datei = pu_stimme_ablage() . '/' . $schluessel . '.' . $f;
        if (!is_file($datei)) continue;

        // Ein Tonstück, das älter als 30 Tage ist, fliegt heraus. Sonst wächst
        // der Ordner unbegrenzt mit Texten, die längst umgeschrieben wurden.
        if (time() - (int)filemtime($datei) > 30 * 86400) { @unlink($datei); continue; }

        $roh = @file_get_contents($datei);
        if ($roh === false) continue;
        return ['roh' => $roh, 'format' => $f];
    }
    return null;
}

function pu_stimme_ablegen(string $schluessel, string $format, string $roh): void
{
    @file_put_contents(pu_stimme_ablage() . '/' . $schluessel . '.' . $format, $roh);
}

// ---------------------------------------------------------------- Das Archiv
/**
 * Jede Sprachausgabe wird zusätzlich aufbewahrt — nach Nutzer getrennt.
 *
 * **Der Unterschied zum Zwischenspeicher ist der Zweck, nicht der Ort.** Der
 * Zwischenspeicher in `data/tmp/stimme` heisst so, weil er einer ist: Namen aus
 * Prüfsummen, nach 30 Tagen weg, für Menschen unlesbar. Er spart Geld und ist
 * sonst nichts.
 *
 * Das Archiv in `data/voice/<kennung>` ist das Gegenteil: lesbare Namen, nach
 * Zeit sortiert, jede Datei mit dem Text daneben. Man kann hineinsehen,
 * anhören, weitergeben — und nachvollziehen, was ein Konto sich hat vorlesen
 * lassen.
 *
 * Zwei Entscheidungen, die dabei Absicht sind:
 *
 *   · **Neben jeder Tondatei liegt der Text als `.txt`.** Ein Ordner voller
 *     Tondateien ist ein Ordner, den man abspielen muss, um ihn zu durchsuchen.
 *   · **Abgelegt wird nur, was neu erzeugt wurde.** Ein zweiter Klick auf
 *     denselben Satz kommt aus dem Zwischenspeicher und legt nichts noch einmal
 *     ab — sonst stünde derselbe Ton zwanzigmal da.
 */
function pu_stimme_archiv_wurzel(): string
{
    return PU_DATA . '/voice';
}

/**
 * Der Ordner eines Kontos.
 *
 * Der Name wird **hart entschärft**: Was aus der Datenbank kommt, hat in einem
 * Dateipfad nichts verloren, solange es nicht geprüft ist. Ein Konto mit einem
 * `..` in der Kennung würde sonst aus `data/` heraus schreiben.
 */
function pu_stimme_archiv_ordner(int $lernender): string
{
    require_once PU_ROOT . '/srv/profil.php';

    $p       = pu_profil($lernender);
    $kennung = pu_stimme_dateiname((string)($p['kennung'] ?? ''), 40);
    if ($kennung === '') $kennung = 'konto-' . $lernender;

    return pu_stimme_archiv_wurzel() . '/' . $kennung;
}

/**
 * Aus beliebigem Text einen Dateinamen machen, der auf jedem System trägt.
 *
 * Umlaute werden umgeschrieben statt weggeworfen: „Für" soll „fuer" heissen und
 * nicht „fr". Windows verträgt zwar Umlaute in Dateinamen, aber ein Archiv,
 * das man kopiert, landet irgendwann auf einem System, das sie anders kodiert.
 */
function pu_stimme_dateiname(string $text, int $max = 48): string
{
    $t = mb_strtolower(trim($text));
    $t = strtr($t, ['ä' => 'ae', 'ö' => 'oe', 'ü' => 'ue', 'ß' => 'ss',
                    'á' => 'a', 'à' => 'a', 'é' => 'e', 'è' => 'e', 'í' => 'i',
                    'ó' => 'o', 'ú' => 'u', 'ñ' => 'n', 'ç' => 'c']);
    $t = (string)preg_replace('/[^a-z0-9]+/u', '-', $t);
    $t = trim($t, '-');

    if ($t === '') return '';
    return mb_substr($t, 0, $max);
}

/**
 * Legt ein erzeugtes Tonstück im Archiv des Kontos ab.
 *
 * @return string der geschriebene Pfad, oder '' wenn nichts geschrieben wurde
 */
function pu_stimme_archivieren(int $lernender, string $text, string $roh,
                               string $format, array $wie = []): string
{
    if (pu_regel('stimme_archiv') !== 'an') return '';

    $ordner = pu_stimme_archiv_ordner($lernender);
    if (!is_dir($ordner) && !@mkdir($ordner, 0777, true) && !is_dir($ordner)) return '';

    // Die letzten acht Zeichen der Prüfsumme im Namen: Damit lässt sich ohne
    // Dateiliste feststellen, ob derselbe Satz schon einmal abgelegt wurde —
    // nach einem Ablauf des Zwischenspeichers käme er sonst ein zweites Mal.
    $marke = substr((string)($wie['schluessel'] ?? ''), -8);
    if ($marke !== '' && glob($ordner . '/*_' . $marke . '.*')) return '';

    $endung = $format === 'mp3' ? 'mp3' : 'wav';   // pcm16 trägt hier schon einen WAV-Kopf

    $teile = array_filter([
        date('Y-m-d_H-i-s'),
        pu_stimme_dateiname((string)($wie['agent'] ?? ''), 16),
        pu_stimme_dateiname((string)($wie['stimme'] ?? ''), 16),
        pu_stimme_dateiname($text, 48),
        $marke,
    ], fn($s) => $s !== '');

    $rumpf = $ordner . '/' . implode('_', $teile);

    if (@file_put_contents($rumpf . '.' . $endung, $roh) === false) return '';

    // Der Text daneben, damit der Ordner lesbar bleibt. Er trägt auch, womit
    // gesprochen wurde — ohne das liesse sich später nicht sagen, warum zwei
    // Aufnahmen desselben Satzes verschieden klingen.
    @file_put_contents($rumpf . '.txt', implode("\n", [
        'Zeit:   ' . date('d.m.Y H:i:s'),
        'Tutor:  ' . ((string)($wie['agent'] ?? '') ?: '—'),
        'Stimme: ' . (string)($wie['stimme'] ?? ''),
        'Modell: ' . (string)($wie['modell'] ?? ''),
        'Format: ' . $format,
        '',
        $text,
        '',
    ]));

    return $rumpf . '.' . $endung;
}

// ---------------------------------------------------------------- Vorlesen
/**
 * Liest einen Text vor.
 *
 * @return array{ok: bool, ton: string, mime: string, format: string,
 *                transkript: string, tokens: int, dauer: float,
 *                aus_speicher: bool, fehler: string}
 *
 * Wie überall hier: Fehler werfen nicht, sie kommen zurück. Eine Lektion, die
 * sich nicht vorlesen lässt, ist immer noch eine Lektion, die man liest.
 */
function pu_vorlesen(int $lernender, string $text, array $zusatz = []): array
{
    require_once PU_ROOT . '/srv/tutor.php';
    require_once PU_ROOT . '/srv/abo.php';

    $leer = ['ok' => false, 'ton' => '', 'mime' => '', 'format' => '',
             'transkript' => '', 'tokens' => 0, 'dauer' => 0.0,
             'aus_speicher' => false, 'fehler' => ''];

    $text = trim($text);
    if ($text === '') {
        return array_merge($leer, ['fehler' => 'Es ist kein Text da, der vorgelesen werden könnte.']);
    }
    if (!pu_stimme_an()) {
        return array_merge($leer, ['fehler' => 'Die Sprachausgabe ist abgeschaltet.']);
    }

    if (mb_strlen($text) > PU_STIMME_MAX_ZEICHEN) {
        return array_merge($leer, ['fehler' => sprintf(
            'Das sind %s Zeichen. Vorgelesen werden höchstens %s auf einmal — '
            . 'sonst wird ein Klick teurer, als irgendjemand erwartet.',
            number_format(mb_strlen($text), 0, ',', '.'),
            number_format(PU_STIMME_MAX_ZEICHEN, 0, ',', '.'))]);
    }

    /* Ein Probelauf darf ein Modell ausprobieren, das noch nicht gespeichert
       ist. Sonst müsste man erst übernehmen und dann testen — und wüsste beim
       ersten Fehlschlag nicht mehr, was vorher eingetragen war. Wer diese
       Überschreibungen setzen darf, entscheidet `api.php`; hier kommen sie nur
       an. */
    $modell = trim((string)($zusatz['modell'] ?? '')) ?: pu_stimme_modell();

    // Die Stimme kommt vom Tutor, wenn einer genannt ist — sonst die
    // allgemeine. Eine ausdrücklich mitgegebene Stimme (Probelauf) sticht beide.
    $name = trim((string)($zusatz['stimme'] ?? ''))
            ?: pu_stimme_fuer((string)($zusatz['agent'] ?? ''), $lernender);
    $format = (string)($zusatz['format'] ?? '');
    if (!in_array($format, PU_STIMM_FORMATE, true)) $format = pu_stimme_format();
    $mime   = pu_stimme_mime($format);

    // ------------------------------------------------------------ Aus dem Speicher
    $schluessel = pu_stimme_schluessel($text, $modell, $name, $format);
    $fertig     = pu_stimme_gespeichert($schluessel);
    if ($fertig !== null) {
        return array_merge($leer, ['ok' => true, 'ton' => base64_encode($fertig['roh']),
                                   'mime' => pu_stimme_mime($fertig['format']),
                                   'format' => $fertig['format'],
                                   'aus_speicher' => true]);
    }

    // ------------------------------------------------------------ Das Tor
    //
    // Dieselbe Schranke wie beim Tutor und bei der Erkennung: Vorlesen kostet,
    // also gilt der Minus-Rahmen. Gefragt wird VOR dem Aufruf — danach wäre er
    // bezahlt. Ebene 1 ist ausgenommen (pu_token_frei).
    $tor = pu_token_tor($lernender);
    if (!$tor['offen']) {
        return array_merge($leer, ['fehler' => $tor['meldung']['titel'],
                                   'stopp'  => $tor['meldung']]);
    }

    $schluesselOr = pu_or_schluessel();
    if ($schluesselOr === '') {
        return array_merge($leer, ['fehler' => 'Es ist kein OpenRouter-Schlüssel hinterlegt.']);
    }

    $erg = pu_stimme_lauf($text, $modell, $name, $format, $schluesselOr);
    if (!$erg['ok']) return array_merge($leer, $erg);

    $roh = base64_decode($erg['ton'], true);
    if ($roh === false || $roh === '') {
        return array_merge($leer, ['dauer' => $erg['dauer'],
            'fehler' => 'Die Antwort enthielt keinen brauchbaren Ton.']);
    }

    // Abgelegt wird unter dem Format, das WIRKLICH kam — nicht unter dem
    // gewünschten. Beim Rückfall auf den anderen Weg sind das zwei verschiedene.
    $kam = $erg['format'] !== '' ? $erg['format'] : $format;
    pu_stimme_ablegen($schluessel, $kam, $roh);

    // Und ins Archiv des Kontos — lesbar benannt, mit dem Text daneben.
    // Nur hier, nicht beim Treffer im Zwischenspeicher: Ein zweiter Klick auf
    // denselben Satz soll nicht dieselbe Aufnahme ein zweites Mal ablegen.
    pu_stimme_archivieren($lernender, $text, $roh, $kam, [
        'schluessel' => $schluessel,
        'agent'      => (string)($zusatz['agent'] ?? ''),
        'stimme'     => $name,
        'modell'     => $modell,
    ]);

    // Gebucht wird, was gemessen wurde. Meldet der Dienst keine Zahl, wird
    // geschätzt — und dann steht `geschaetzt = 1` an der Buchung, damit das
    // Cockpit es hinschreiben kann. Weg 2 meldet grundsätzlich keine: Von dort
    // kommen rohe Tonbytes, kein JSON mit einer Abrechnung.
    $gemessen = $erg['tokens'] > 0;
    $tokens   = $gemessen ? $erg['tokens'] : pu_stimme_schaetzung($text);
    pu_token_verbrauchen($lernender, (string)($zusatz['wofuer'] ?? '') ?: 'Vorlesen',
                         $tokens, !$gemessen, $modell);

    pu_protokoll($lernender, 'vorlesen', $modell,
                 sprintf('%d Zeichen, %.1fs, Weg %s', mb_strlen($text), $erg['dauer'],
                         (string)($erg['weg'] ?? '?')));

    return array_merge($leer, ['ok' => true, 'ton' => $erg['ton'],
                               'mime' => pu_stimme_mime($kam), 'format' => $kam,
                               'weg' => (string)($erg['weg'] ?? ''),
                               'transkript' => $erg['transkript'],
                               'tokens' => $tokens, 'dauer' => $erg['dauer']]);
}

/**
 * Wenn der Dienst keine Tokenzahl meldet.
 *
 * Grob, und es steht dabei. Gerechnet wird über die Sprechdauer: rund 150
 * Wörter je Minute (dieselbe Zahl wie in `srv/sprecher.php`) und dieselbe
 * Pauschale je Minute wie bei der Erkennung. Eine Schätzung, die sich genauer
 * gibt, als sie ist, wäre schlimmer als gar keine.
 */
function pu_stimme_schaetzung(string $text): int
{
    $woerter = count(preg_split('/\s+/u', trim($text), -1, PREG_SPLIT_NO_EMPTY) ?: []);
    $minuten = max(1, (int)ceil($woerter / 150));
    return $minuten * PU_TOKEN_JE_MINUTE;
}

/**
 * Der Weichensteller: erst den passenden Weg, im Zweifel den anderen.
 *
 * **Warum der zweite Versuch sein muss.** Kein Modell kann beide Endpunkte,
 * und welcher der richtige ist, steht im Katalog — der unvollständig ist. Wer
 * ein Modell einträgt, das dort fehlt, bekäme sonst eine Fehlermeldung, obwohl
 * das Modell funktioniert; genau so hat sich `x-ai/grok-voice-tts-1.0`
 * gemeldet. Ein Fehlversuch kostet keine Token, nur eine halbe Sekunde — das
 * ist billiger als ein Mensch, der eine Einstellung sucht, die stimmt.
 *
 * Gewechselt wird **nur** bei den beiden Meldungen, die den falschen Weg
 * bedeuten. Bei „kein Guthaben" oder „Stimme unbekannt" wäre ein zweiter
 * Versuch nur ein zweiter Fehlschlag.
 *
 * @return array{ok: bool, ton: string, format: string, transkript: string,
 *                tokens: int, dauer: float, weg: string, fehler: string}
 */
function pu_stimme_lauf(string $text, string $modell, string $name,
                        string $format, string $schluessel, string $weg = ''): array
{
    if ($weg === '') $weg = pu_stimme_weg_fuer($modell);

    $erg = $weg === 'tts'
         ? pu_stimme_tts($text, $modell, $name, $format, $schluessel)
         : pu_stimme_chat($text, $modell, $name, $format, $schluessel);
    $erg['weg'] = $weg;

    if ($erg['ok'] || !pu_stimme_falscher_weg($erg['fehler'])) return $erg;

    $ander = $weg === 'tts' ? 'chat' : 'tts';
    $zweit = $ander === 'tts'
           ? pu_stimme_tts($text, $modell, $name, $format, $schluessel)
           : pu_stimme_chat($text, $modell, $name, $format, $schluessel);
    $zweit['weg']   = $ander;
    $zweit['dauer'] = round($erg['dauer'] + $zweit['dauer'], 1);

    // Scheitert auch der zweite, gilt die Meldung des zweiten — sie gehört zu
    // dem Weg, der für dieses Modell wahrscheinlicher war.
    return $zweit;
}

/**
 * Sagt eine Fehlermeldung, dass der falsche Endpunkt gewählt wurde?
 *
 * Beide Sätze sind wörtlich gemessen:
 *   · Weg 1 mit einem TTS-Modell: „No endpoints found that support the
 *     requested output modalities"
 *   · Weg 2 mit einem Chat-Modell: „Model … does not exist"
 *
 * Der zweite ist der gefährlichere: Er klingt, als gäbe es das Modell nicht.
 * Es gibt es — nur nicht dort.
 */
function pu_stimme_falscher_weg(string $fehler): bool
{
    return stripos($fehler, 'output modalities') !== false
        || stripos($fehler, 'does not exist')    !== false;
}

/**
 * **Weg 1** — `chat/completions` mit Ton als zweiter Ausgabeform.
 *
 * Getrennt von `pu_vorlesen()`, damit die Prüfungen den Rumpf bauen und ansehen
 * können, ohne ins Netz zu gehen.
 *
 * @return array{ok: bool, ton: string, format: string, transkript: string,
 *                tokens: int, dauer: float, fehler: string}
 */
function pu_stimme_chat(string $text, string $modell, string $name,
                        string $format, string $schluessel): array
{
    require_once PU_ROOT . '/srv/tutor.php';

    // Weg 1 kann im Strom nur pcm16. Ein Wunsch nach mp3 wird hier still
    // erfüllt statt beantwortet — die Alternative wäre ein Fehler statt Ton.
    $format = pu_stimme_endformat('chat', $format);

    $start = microtime(true);
    $rumpf = pu_stimme_rumpf($text, $modell, $name, $format);

    $ch = curl_init('https://openrouter.ai/api/v1/chat/completions');
    $ca = pu_ca_bundle();
    if ($ca !== '') curl_setopt($ch, CURLOPT_CAINFO, $ca);

    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $rumpf,
        CURLOPT_RETURNTRANSFER => true,
        // Vorlesen dauert länger als eine Textantwort: Der Ton muss erst
        // erzeugt und dann übertragen werden. Die Zeitgrenze der Tutoren wäre
        // hier zu knapp und der Abbruch käme mitten im Satz.
        CURLOPT_TIMEOUT        => max(30, (int)pu_regel('tutor_zeitgrenze') * 2),
        CURLOPT_CONNECTTIMEOUT => 15,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
        CURLOPT_HTTPHEADER     => [
            'Authorization: Bearer ' . $schluessel,
            'Content-Type: application/json',
            'HTTP-Referer: https://promptheus.local',
            'X-Title: PROMPTHEUS',
        ],
    ]);

    $antwort = curl_exec($ch);
    $code    = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $netz    = curl_error($ch);
    curl_close($ch);

    $dauer = round(microtime(true) - $start, 1);
    $leer  = ['ok' => false, 'ton' => '', 'format' => $format, 'transkript' => '',
              'tokens' => 0, 'dauer' => $dauer, 'fehler' => ''];

    if ($antwort === false) {
        return array_merge($leer, ['fehler' => 'OpenRouter war nicht erreichbar: ' . $netz]);
    }

    // Ein Fehler kommt NICHT als Strom, sondern als gewöhnliches JSON mit
    // einem Fehlercode. Deshalb wird zuerst danach gesehen und erst dann
    // zerlegt.
    if ($code >= 400) {
        $j     = json_decode((string)$antwort, true);
        $grund = is_array($j) ? (string)($j['error']['message'] ?? '') : '';
        return array_merge($leer, ['fehler' => pu_stimme_deutung($code, $grund, $modell, $format, $name)]);
    }

    $strom = pu_stimme_sse((string)$antwort);
    if ($strom['fehler'] !== '') {
        return array_merge($leer, ['fehler' => pu_stimme_deutung(0, $strom["fehler"], $modell, $format, $name)]);
    }

    $roh = pu_stimme_fuegen($strom['teile']);

    if ($roh === '') {
        // Der Strom lief, aber es kam kein Ton darin vor — das Modell hat den
        // Text gelesen statt ihn vorzulesen. Keine Panne der Verbindung,
        // sondern die falsche Wahl des Modells, und die Meldung sagt das.
        $stattdessen = trim($strom['text']);
        return array_merge($leer, ['fehler' =>
            'Das Modell „' . $modell . '" hat keinen Ton zurückgegeben'
            . ($stattdessen !== '' ? ', sondern Text: „' . mb_substr($stattdessen, 0, 120) . '…"' : '')
            . '. Trage in den Einstellungen ein Modell ein, das Ton ausgibt — '
            . 'die Liste lässt sich dort nach „gibt Ton aus" filtern.']);
    }

    if ($format === 'pcm16') $roh = pu_stimme_wav($roh);

    return array_merge($leer, [
        'ok'         => true,
        'ton'        => base64_encode($roh),
        'transkript' => $strom['transkript'],
        'tokens'     => $strom['tokens'],
    ]);
}

/**
 * **Weg 2** — `audio/speech`, der eigene Vorleseendpunkt.
 *
 * Für reine Vorlesemodelle wie `x-ai/grok-voice-tts-1.0`. Er ist in jeder
 * Hinsicht schlichter als Weg 1: kein Strom, kein JSON, keine Systemzeile.
 * Text hinein, Tonbytes heraus.
 *
 * Drei Unterschiede, die man kennen muss:
 *
 *   · **Kein Transkript.** Es kommt kein Text zurück, also lässt sich nicht
 *     prüfen, ob wörtlich vorgelesen wurde. Bei einem reinen Vorlesemodell ist
 *     das kein Verlust — es kann gar nicht antworten.
 *   · **Keine Tokenzahl.** Rohe Bytes tragen keine Abrechnung. Gebucht wird
 *     deshalb geschätzt, und das steht an der Buchung.
 *   · **Kein Systemauftrag.** Es gibt keine Rolle „system"; das Modell liest,
 *     was dasteht. Die Verschärfung aus Weg 1 („Füge NICHTS hinzu") ist hier
 *     weder nötig noch möglich.
 */
function pu_stimme_tts(string $text, string $modell, string $name,
                       string $format, string $schluessel): array
{
    require_once PU_ROOT . '/srv/tutor.php';

    $format = pu_stimme_endformat('tts', $format);
    $start  = microtime(true);

    $ch = curl_init('https://openrouter.ai/api/v1/audio/speech');
    $ca = pu_ca_bundle();
    if ($ca !== '') curl_setopt($ch, CURLOPT_CAINFO, $ca);

    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => pu_stimme_tts_rumpf($text, $modell, $name, $format),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => max(30, (int)pu_regel('tutor_zeitgrenze') * 2),
        CURLOPT_CONNECTTIMEOUT => 15,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
        CURLOPT_HTTPHEADER     => [
            'Authorization: Bearer ' . $schluessel,
            'Content-Type: application/json',
            'HTTP-Referer: https://promptheus.local',
            'X-Title: PROMPTHEUS',
        ],
    ]);

    $antwort = curl_exec($ch);
    $code    = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $typ     = (string)curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
    $netz    = curl_error($ch);
    curl_close($ch);

    $dauer = round(microtime(true) - $start, 1);
    $leer  = ['ok' => false, 'ton' => '', 'format' => $format, 'transkript' => '',
              'tokens' => 0, 'dauer' => $dauer, 'fehler' => ''];

    if ($antwort === false) {
        return array_merge($leer, ['fehler' => 'OpenRouter war nicht erreichbar: ' . $netz]);
    }

    if ($code >= 400 || str_contains(strtolower($typ), 'json')) {
        $j     = json_decode((string)$antwort, true);
        $grund = is_array($j) ? (string)($j['error']['message'] ?? '') : '';
        return array_merge($leer, ['fehler' => pu_stimme_deutung($code, $grund, $modell, $format, $name)]);
    }

    $roh = (string)$antwort;
    if ($roh === '') {
        return array_merge($leer, ['fehler' => 'Die Antwort enthielt keinen Ton.']);
    }

    // `pcm` kommt nackt an, genau wie auf Weg 1 — und bekommt denselben Kopf.
    if ($format === 'pcm16') $roh = pu_stimme_wav($roh);

    return array_merge($leer, ['ok' => true, 'ton' => base64_encode($roh)]);
}

/**
 * Der Rumpf für Weg 2 — als eigene Funktion, damit eine Prüfung ihn ansehen
 * kann, ohne dass ein Schlüssel oder eine Netzverbindung nötig wäre.
 *
 * `pcm16` heisst hier `pcm`. Derselbe Ton, ein anderer Name — und ein falscher
 * Name wird nicht etwa übergangen, sondern weist die ganze Anfrage ab.
 */
function pu_stimme_tts_rumpf(string $text, string $modell, string $name, string $format): string
{
    return (string)json_encode([
        'model'           => $modell,
        'input'           => $text,
        'voice'           => $name,
        'response_format' => $format === 'mp3' ? 'mp3' : 'pcm',
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}

/**
 * Aus einer Fehlermeldung von OpenRouter eine machen, mit der man weiterkommt.
 *
 * Die zwei Fälle, die tatsächlich vorkommen, stehen hier mit Namen. Der erste
 * ist der Grund, warum es diese Funktion gibt: „Audio output requires stream:
 * true" enthält das Wort „audio", und die frühere Deutung hat daraus „dieses
 * Modell kann keinen Ton" gemacht. Das war falsch und schickte die Suche in
 * die falsche Richtung — das Modell konnte es, die Anfrage war unvollständig.
 */
function pu_stimme_deutung(int $code, string $grund, string $modell, string $format = '',
                           string $name = ''): string
{
    $kopf = $code > 0 ? 'OpenRouter meldet ' . $code . ($grund !== '' ? ': ' : '') : '';

    /* **Die häufigste Ursache, und die einzige, die man sehen kann, bevor man
       fragt: die Stimme gehört zu einem anderen Modell.** Gemessen sind beide
       Richtungen — Grok mit „alloy" gibt `404: Provider returned 404`,
       gpt-audio-mini mit „eve" gibt `400: Provider returned error`. Keine der
       beiden Meldungen erwähnt die Stimme; man sucht dann beim Format, beim
       Schlüssel, beim Guthaben. Deshalb steht dieser Fall vor allen anderen. */
    if (pu_stimme_passt($modell, $name) === false) {
        $f      = pu_stimme_familie($modell);
        $moegen = implode(', ', PU_STIMM_FAMILIEN[$f] ?? []);
        return $kopf . $grund
            . ' — Die Stimme „' . $name . '" gehört nicht zu „' . $modell . '". '
            . 'Stimmnamen gelten je Modell, nicht allgemein: Dieses Modell kennt '
            . $moegen . '. Stelle die Stimme um, dann läuft es.';
    }

    /* **Der falsche Endpunkt — beide Richtungen.** Diese zwei Meldungen kommen
       zuerst, weil beide harmlos aussehende Wörter enthalten, die eine spätere
       Regel sonst abfängt. „does not exist" ist die gefährlichere: Sie klingt,
       als gäbe es das Modell nicht. Es gibt es — nur nicht dort. Im Betrieb
       sieht man sie selten, weil `pu_stimme_lauf()` einmal wechselt; steht sie
       trotzdem da, sind beide Wege gescheitert. */
    if (stripos($grund, 'output modalities') !== false) {
        return $kopf . $grund
            . ' — „' . $modell . '" gibt Ton nicht neben Text aus, sondern ist ein '
            . 'reines Vorlesemodell. Dafür gibt es den anderen Weg (audio/speech); '
            . 'er wurde bereits versucht und hat ebenfalls nicht geantwortet.';
    }

    if (stripos($grund, 'does not exist') !== false) {
        return $kopf . $grund
            . ' — Das heisst nicht, dass es das Modell nicht gibt, sondern dass es '
            . 'den Vorleseendpunkt nicht bedient. Der andere Weg (chat/completions) '
            . 'wurde bereits versucht und hat ebenfalls nicht geantwortet.';
    }

    /* Der zweite gemessene Fall, und der unfreundlichste: „Provider returned
       error" sagt gar nichts. Gemessen kam er, wenn das Tonformat nicht
       durchgeht — mp3 scheitert bei openai/gpt-audio-mini, pcm16 läuft. Ohne
       diesen Zusatz sucht man bei Modell, Stimme und Schlüssel und findet
       nichts, weil alle drei richtig waren. */
    if ($format !== '' && $format !== 'pcm16'
        && (stripos($grund, 'provider returned') !== false || stripos($grund, 'format') !== false)) {
        return $kopf . $grund
            . ' — Wahrscheinlich liegt es am Tonformat „' . $format . '". Im Strom '
            . 'liefert der OpenAI-Weg nur pcm16; mp3 wird dort abgewiesen. '
            . 'Stelle das Tonformat auf pcm16 — es wird hier zu einer WAV-Datei gemacht.';
    }

    if (stripos($grund, 'stream') !== false) {
        return $kopf . $grund
            . ' — Das ist ein Fehler in dieser Academy, nicht in deiner Einstellung: '
            . 'Ton wird nur im Strom ausgeliefert. Ab dieser Fassung wird er verlangt; '
            . 'kommt die Meldung trotzdem, melde sie bitte.';
    }

    if (stripos($grund, 'voice') !== false) {
        return $kopf . $grund
            . ' — „' . $modell . '" kennt die eingestellte Stimme offenbar nicht. '
            . 'Die Namen sind je Anbieter verschieden: alloy und nova gehören zu OpenAI, '
            . 'andere Anbieter haben eigene.';
    }

    if (stripos($grund, 'modalit') !== false || stripos($grund, 'not support') !== false) {
        return $kopf . $grund
            . ' — „' . $modell . '" gibt offenbar keinen Ton aus. Es können das nur '
            . 'wenige Modelle; die Liste in den Einstellungen lässt sich danach filtern.';
    }

    return $kopf . $grund;
}

// ---------------------------------------------------------------- Der Strom
/**
 * Zerlegt eine SSE-Antwort.
 *
 * Eigene Funktion, weil sie sich ohne Netz und ohne Schlüssel prüfen lässt —
 * und weil an ihr das ganze Vorlesen hängt. Eine Zerlegung, die ein Häppchen
 * verliert, ergibt Ton mit einem Loch, und das fällt beim Hören auf, aber nicht
 * beim Lesen des Quelltexts.
 *
 * Gelesen wird defensiv: Kommentarzeilen (`:` am Anfang, der Herzschlag),
 * `[DONE]`, leere Zeilen und alles, was kein JSON ist, werden übergangen.
 *
 * @return array{teile: string[], transkript: string, text: string,
 *                tokens: int, fehler: string}
 */
function pu_stimme_sse(string $roh): array
{
    $teile      = [];
    $transkript = '';
    $text       = '';
    $tokens     = 0;
    $fehler     = '';

    foreach (preg_split("/\r\n|\n|\r/", $roh) ?: [] as $zeile) {
        $zeile = trim($zeile);
        if ($zeile === '' || $zeile[0] === ':') continue;
        if (!str_starts_with($zeile, 'data:')) continue;

        $nutz = trim(substr($zeile, 5));
        if ($nutz === '' || $nutz === '[DONE]') continue;

        $j = json_decode($nutz, true);
        if (!is_array($j)) continue;

        if (isset($j['error'])) {
            $fehler = trim((string)($j['error']['message'] ?? 'Unbekannter Fehler im Strom.'));
            continue;
        }

        foreach (($j['choices'] ?? []) as $wahl) {
            if (!is_array($wahl)) continue;

            // `delta` ist der Normalfall. `message` steht daneben, weil ein
            // Anbieter, der nicht stückelt, die fertige Nachricht in ein
            // einziges Häppchen legt — dann steht der ganze Ton dort.
            foreach (['delta', 'message'] as $ort) {
                $teil = $wahl[$ort] ?? null;
                if (!is_array($teil)) continue;

                if (is_string($teil['content'] ?? null)) $text .= $teil['content'];

                $a = $teil['audio'] ?? null;
                if (!is_array($a)) continue;
                if (is_string($a['data'] ?? null) && $a['data'] !== '') $teile[] = $a['data'];
                if (is_string($a['transcript'] ?? null))                $transkript .= $a['transcript'];
            }
        }

        // Die Tokenzahl kommt am Ende in einem eigenen Häppchen — dafür steht
        // `stream_options.include_usage` im Rumpf. Ohne das wird geschätzt.
        if (isset($j['usage']['total_tokens'])) $tokens = (int)$j['usage']['total_tokens'];
    }

    return ['teile' => $teile, 'transkript' => trim($transkript),
            'text' => trim($text), 'tokens' => $tokens, 'fehler' => $fehler];
}

/**
 * Setzt die Base64-Häppchen zu einer Tondatei zusammen.
 *
 * **Warum das nicht einfach `base64_decode(implode(...))` ist.** Es gibt zwei
 * Arten, wie Anbieter stückeln, und sie vertragen sich nicht:
 *
 *   · Der Ton wird als EINE lange Base64-Zeichenkette zerschnitten. Dann sind
 *     die Stücke einzeln oft ungültig (Länge nicht durch vier teilbar), aber
 *     aneinandergehängt ergeben sie das Ganze.
 *   · Jedes Stück ist für sich vollständig kodiert, mit eigenem Polster („=").
 *     Dann ist die Aneinanderreihung ungültig, und jedes Stück muss einzeln
 *     entschlüsselt werden.
 *
 * Der strenge Modus von `base64_decode` unterscheidet die beiden Fälle
 * zuverlässig: Ein Polster mitten in der Zeichenkette lässt ihn scheitern.
 * Deshalb wird zuerst das Ganze versucht und erst danach Stück für Stück —
 * und nicht umgekehrt.
 */
function pu_stimme_fuegen(array $teile): string
{
    if ($teile === []) return '';

    $ganz = base64_decode(implode('', $teile), true);
    if ($ganz !== false && $ganz !== '') return $ganz;

    $roh = '';
    foreach ($teile as $t) {
        $d = base64_decode((string)$t, true);
        if ($d === false) return '';
        $roh .= $d;
    }
    return $roh;
}

/**
 * Setzt nackten Abtastwerten einen WAV-Kopf auf.
 *
 * `pcm16` ist genau das: Zahlen ohne Angabe, wie schnell sie abgespielt
 * gehören. Ein Browser spielt das nicht ab — nicht falsch, sondern gar nicht.
 * Die 44 Bytes hier sind die Angabe, und danach ist es eine gewöhnliche Datei,
 * die jedes Programm öffnet.
 */
function pu_stimme_wav(string $pcm, int $rate = PU_STIMME_PCM_RATE,
                       int $kanaele = 1, int $bits = 16): string
{
    $ausrichtung = (int)($kanaele * $bits / 8);

    return 'RIFF' . pack('V', 36 + strlen($pcm)) . 'WAVE'
         . 'fmt ' . pack('VvvVVvv', 16, 1, $kanaele, $rate,
                         $rate * $ausrichtung, $ausrichtung, $bits)
         . 'data' . pack('V', strlen($pcm)) . $pcm;
}

/**
 * Der Anfragerumpf — als eigene Funktion, damit eine Prüfung ihn ansehen kann,
 * ohne dass ein Schlüssel oder eine Netzverbindung nötig wäre.
 *
 * Die Systemzeile ist der Grund, warum überhaupt eine da ist: Ohne sie
 * BEANTWORTET das Modell den Text, statt ihn vorzulesen. „Lies vor" muss
 * dastehen, sonst kommt bei einer Frage im Text eine Antwort heraus.
 */
function pu_stimme_rumpf(string $text, string $modell, string $name, string $format): string
{
    return (string)json_encode([
        'model'      => $modell,
        'modalities' => ['text', 'audio'],
        'audio'      => ['voice' => $name, 'format' => $format],

        // **Ohne diese Zeile kommt kein Ton, sondern 400.** OpenRouter liefert
        // Tonausgabe ausschliesslich im Strom aus — gemessen, nicht vermutet:
        // „Audio output requires stream: true".
        'stream'         => true,
        // Und damit am Ende des Stroms die verbrauchten Token stehen. Fehlt
        // das, wird geschätzt, und an der Buchung steht „geschätzt".
        'stream_options' => ['include_usage' => true],

        'messages'   => [
            ['role' => 'system', 'content' =>
                'Du bist eine reine Vorlesestimme, kein Gesprächspartner. '
              . 'Sprich AUSSCHLIESSLICH den Text der nächsten Nachricht, Wort für Wort, auf Deutsch. '
              . 'Beginne mit dem ersten Wort und höre nach dem letzten Wort sofort auf. '
              . 'Füge NICHTS hinzu: keine Begrüßung, keine Erklärung, keine Zusammenfassung, '
              . 'keine Fortsetzung, keinen eigenen Satz. '
              . 'Enthält der Text eine Frage, lies die Frage vor — beantworte sie nicht. '
              . 'Sprich ruhig und deutlich.'],
            ['role' => 'user', 'content' => $text],
        ],
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}

/**
 * Ein Probelauf für die Einstellungen.
 *
 * Er sagt, was wirklich passiert ist — Modell, Stimme, Dauer, Grösse, und ob
 * das Transkript zum Auftrag passt. Ein „funktioniert" ohne Zahlen wäre hier
 * wertlos: Der häufigste Fehler ist ein Modell, das antwortet statt vorzulesen,
 * und das sieht man nur am Transkript.
 */
function pu_stimme_probe(int $lernender, array $ueber = []): array
{
    $satz = 'Prometheus brachte den Menschen das Feuer.';

    // Was geprüft wurde, wird zurückgemeldet — nicht, was eingestellt ist. Bei
    // einem Probelauf mit einem noch nicht übernommenen Modell wären das zwei
    // verschiedene Dinge, und der Bericht nennt dann das falsche.
    $modell = trim((string)($ueber['modell'] ?? '')) ?: pu_stimme_modell();
    $stimme = trim((string)($ueber['stimme'] ?? '')) ?: pu_stimme_name();
    $format = (string)($ueber['format'] ?? '');
    if (!in_array($format, PU_STIMM_FORMATE, true)) $format = pu_stimme_format();

    $erg = pu_vorlesen($lernender, $satz, ['wofuer' => 'Vorlesen · Probe',
                                           'modell' => $modell, 'stimme' => $stimme,
                                           'format' => $format]);

    $roh = $erg['ok'] ? base64_decode($erg['ton'], true) : '';

    return [
        'ok'          => $erg['ok'],
        'fehler'      => $erg['fehler'],
        'modell'      => $modell,
        'stimme'      => $stimme,
        // Gemeldet wird das Format, das WIRKLICH kam. Wer mp3 wünscht und auf
        // Weg 1 landet, bekommt pcm16 — ein Bericht, der trotzdem „mp3" sagt,
        // wäre der falsche Bericht.
        'format'      => $erg['format'] !== '' ? $erg['format'] : $format,
        'satz'        => $satz,
        'transkript'  => $erg['transkript'],
        'passt'       => $erg['transkript'] === ''
                         || str_contains(mb_strtolower($erg['transkript']), 'prometheus'),
        'weg'         => (string)($erg['weg'] ?? ''),
        'bytes'       => is_string($roh) ? strlen($roh) : 0,
        'dauer'       => $erg['dauer'],
        'tokens'      => $erg['tokens'],
        'aus_speicher'=> $erg['aus_speicher'],
        'ton'         => $erg['ton'],
        'mime'        => $erg['mime'],
    ];
}
