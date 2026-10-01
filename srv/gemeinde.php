<?php
declare(strict_types=1);
/**
 * PROMPTHEUS — die Gemeinde, von der Academy aus (Runde 3b des Cockpit-Plans).
 *
 * Zwei Hälften:
 *
 *   **Meine Produkte** (lokal). Prompts, Skills und Plugins kommen per Klick
 *   aus der Werkstatt oder dem Dashboard (oder werden von Hand eingelegt) und
 *   bleiben hier, bis ihr Urheber sie freischaltet. **Freischalten geht erst
 *   mit Bild und Kategorie** (E17). Minderjährige brauchen das Mit-Siegel
 *   einer Lehrkraft, der Eltern oder der Verwaltung. Vor dem Hochladen prüft
 *   die Academy dasselbe wie der Server — wer hier scheitert, soll wissen,
 *   warum, bevor etwas das Haus verlässt.
 *
 *   **Schaufenster** (über den Server). Werke anderer ansehen, liken,
 *   kommentieren, melden. Nur registrierte Academies sehen die Gemeinde (E19).
 *
 * **Was hinausgeht:** das Pseudonym `L-<Nummer>`, das Synonym, Titel,
 * Beschreibung, Kategorie, Paket und Bild — alles bereinigt. **Nie:** der
 * Name, die Kennung, die Klasse, die Schule. Persönliche Angaben werden zu
 * „xxx“ (E16); die Oberfläche zeigt dazu die rot umrandete Verbotsregel.
 */

require_once PU_ROOT . '/srv/pii.php';
require_once PU_ROOT . '/srv/relay.php';
require_once PU_ROOT . '/srv/profil.php';
require_once PU_ROOT . '/srv/lernende.php';   // pu_lehrer_sieht (Klassen der Lehrkraft)

// Wortgleich mit gemeinsam/gemeinde.php des Servers (Kategorien.md).
const PU_GEM_HAUPTFELDER = ['A' => 'Schulbedarf (KI)', 'B' => 'Schulbedarf (Lernstoff)', 'C' => 'Berufssparten'];
const PU_GEM_ARTEN = ['prompt', 'systemprompt', 'skill', 'plugin', 'vorlage', 'formular', 'bildprompt', 'videoprompt', 'sammlung'];
const PU_GEM_ZIELGRUPPEN = ['verwaltung', 'lehrkraft', 'eltern', 'schueler', 'allgemein'];
const PU_GEM_MEDIEN = ['text', 'formular', 'format', 'bild', 'video', 'ton', 'code'];
const PU_GEM_LIZENZEN = ['CC-BY-4.0', 'CC-BY-NC-4.0', 'CC-BY-SA-4.0'];
const PU_GEM_PAKET_MAX = 2_097_152;
const PU_GEM_ENTPACKT_MAX = 10_485_760;
const PU_GEM_DATEI_MAX = 2_097_152;
const PU_GEM_EINTRAEGE_MAX = 200;
const PU_GEM_BILD_MAX = 1_048_576;
const PU_GEM_BILD_PX = 1600;
const PU_GEM_TITEL_MAX = 80;
const PU_GEM_BESCHREIBUNG_MAX = 1000;
const PU_GEM_KOMMENTAR_MAX = 1000;
const PU_GEM_ENDUNGEN = ['md', 'txt', 'json', 'yaml', 'yml', 'csv', 'py', 'js', 'mjs', 'ts', 'php', 'html', 'css'];
const PU_GEM_OHNE_ENDUNG = ['LICENSE', 'README', 'NOTICE'];
const PU_GEM_SPERRE = '~(^|/)(\.env[^/]*|\.git(/|$)|node_modules/|data/|daten/|80_PRIVAT/|[^/]*\.(db|sqlite|sqlite3|pem|key|p12|pfx)$|id_(rsa|ed25519)[^/]*$)~i';

/** Gründe des Servers (und der eigenen Prüfung) als Sätze. */
const PU_GEM_GRUENDE = [
    'konto_unbekannt'   => 'Dein Konto ist beim Server noch nicht gemeldet. Einmal „Stand vom Server holen“ im Cockpit drücken.',
    'kein_rufname'      => 'Wähle zuerst dein Synonym (Einstellungen → Profil).',
    'rufname_form'      => 'Das Synonym hat 3 bis 24 Zeichen: Buchstaben, Ziffern, Leerzeichen, Punkt, Unterstrich, Bindestrich.',
    'rufname_klarname'  => 'Das sieht aus wie ein echter Name oder eine persönliche Angabe. Nimm ein ausgedachtes Synonym.',
    'rufname_vergeben'  => 'Dieses Synonym trägt schon jemand in der Community. Nimm ein anderes.',
    'paket_gross'       => 'Das Paket ist zu groß (höchstens 2 MB gepackt, 10 MB entpackt).',
    'paket_form'        => 'Das Paket ist kein gültiges ZIP.',
    'paket_eintraege'   => 'Zu viele Dateien im Paket (höchstens 200).',
    'paket_pfad'        => 'Ein Dateipfad im Paket ist nicht erlaubt.',
    'paket_gesperrt'    => 'Im Paket liegt etwas, das nie in die Community darf (z. B. .env, Datenbank, Schlüssel).',
    'paket_endung'      => 'Nur Textdateien: md, txt, json, yaml, csv, py, js, ts, php, html, css.',
    'paket_datei_gross' => 'Eine Datei im Paket ist zu groß (höchstens 2 MB).',
    'paket_binaer'      => 'Eine Datei im Paket ist kein Text.',
    'paket_leer'        => 'Das Paket ist leer.',
    'paket_pii'         => 'Im Paket stehen persönliche Angaben (siehe Verbotsregel). Bitte entfernen.',
    'paket_technik'     => 'Der Server kann gerade keine Pakete prüfen.',
    'bild_gross'        => 'Das Bild fehlt oder ist zu groß (höchstens 1 MB).',
    'bild_typ'          => 'Als Bild gehen JPG, PNG oder ein kurzes GIF.',
    'bild_masse'        => 'Das Bild muss zwischen 64 und 1600 Pixel breit und hoch sein.',
    'bild_technik'      => 'Der Server kann gerade keine Bilder prüfen.',
    'kategorie'         => 'Die Kategorie ist unvollständig.',
    'lizenz'            => 'Bitte eine Lizenz wählen.',
    'mit_siegel_fehlt'  => 'Für Minderjährige braucht es das Mit-Siegel einer Lehrkraft, der Eltern oder der Verwaltung.',
    'schon_da'          => 'Genau dieses Paket liegt schon in der Community.',
    'nicht_gefunden'    => 'Das gibt es (nicht mehr).',
    'eigenes_werk'      => 'Das eigene Werk kann man nicht liken.',
    'form'              => 'Die Angaben sind unvollständig.',
    'nichts_umwandelbar' => 'Gerade ist nichts umwandelbar: keine Talente oder der Monatsdeckel ist erreicht.',
    // Community im Browser (Plan 30_Community)
    'rufname_fehlt'     => 'Wähle zuerst dein Synonym (Einstellungen → Profil).',
    'nicht_registriert' => 'Die Community gibt es nur für registrierte Academies.',
    'kein_abo'          => 'Für dein Konto läuft noch kein Abo.',
    'nicht_freigegeben' => 'Die Community ist für diese Einrichtung gerade nicht freigegeben.',
    'marke_form'        => 'Der Server hat eine unlesbare Antwort geschickt.',
];

function pu_gem_grund_text(string $grund): string
{
    return PU_GEM_GRUENDE[$grund] ?? pu_relay_grund_text($grund);
}

/** Das Pseudonym einer Person für den Server — nie Name oder Kennung. */
function pu_gem_konto(int $lernender): string
{
    return 'L-' . $lernender;
}

/** Die eigene Person, wie die Gemeinde-Funktionen sie brauchen (Rolle, Kind). */
function pu_gem_person(int $id): array
{
    $s = pu_db()->prepare('SELECT id, rolle, kind_von, lebensalter FROM lernende WHERE id = ?');
    $s->execute([$id]);
    return $s->fetch() ?: ['id' => $id, 'rolle' => '', 'kind_von' => 0, 'lebensalter' => 0];
}

// ═════════════════════════════════════════════════════════════════════════════
// Synonym (E15)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Prüft ein Synonym wie der Server — und zusätzlich gegen den eigenen
 * Anzeigenamen und die Kennung, die nur hier bekannt sind.
 *
 * @return string|null Grund-Kürzel oder null
 */
function pu_synonym_fehler(string $synonym, ?array $profil = null): ?string
{
    $synonym = trim(preg_replace('/\s+/u', ' ', $synonym) ?? '');
    if (!preg_match('/^[\p{L}\p{N}][\p{L}\p{N} ._-]{1,22}[\p{L}\p{N}]$/u', $synonym)) {
        return 'rufname_form';
    }
    if (pu_pii_pruefen($synonym)['treffer'] !== []) {
        return 'rufname_klarname';
    }
    $j = json_decode((string)file_get_contents(PU_PII_DATEI), true);
    $namen = array_map(static fn($n) => mb_strtolower((string)$n), $j['listen']['vornamen'] ?? []);
    $eigen = [];
    if ($profil !== null) {
        foreach (preg_split('/[\s._\d-]+/u', mb_strtolower((string)($profil['anzeigename'] ?? '') . ' '
                 . (string)($profil['kennung'] ?? ''))) ?: [] as $t) {
            if (mb_strlen($t) >= 3) {
                $eigen[] = $t;
            }
        }
    }
    foreach (preg_split('/[\s._\d-]+/u', mb_strtolower($synonym)) ?: [] as $wort) {
        if ($wort !== '' && (in_array($wort, $namen, true) || in_array($wort, $eigen, true))) {
            return 'rufname_klarname';
        }
    }
    return null;
}

/**
 * Meldet das Synonym an den Server (und vorher die Konten, damit der Server
 * das Pseudonym kennt). Einmal je Stunde reicht für die Konten.
 */
function pu_gem_synonym_melden(array $ich): array
{
    $roh = pu_db()->prepare('SELECT pseudonym, anzeigename, kennung FROM lernende WHERE id = ?');
    $roh->execute([(int)$ich['id']]);
    $z = $roh->fetch() ?: [];
    $synonym = (string)($z['pseudonym'] ?? '');
    if ($synonym === '') {
        return ['ok' => false, 'grund' => 'kein_rufname'];
    }
    if (($f = pu_synonym_fehler($synonym, $z)) !== null) {
        return ['ok' => false, 'grund' => $f];
    }
    $k = pu_gem_konten_sicher();
    if (!$k['ok']) {
        return $k;
    }
    $r = pu_relay_ruf('rufname', ['konto' => pu_gem_konto((int)$ich['id']), 'rufname' => $synonym]);
    if ($r['ok']) {
        pu_setting_setzen('gemeinde_synonym_' . (int)$ich['id'], $synonym);
    }
    return $r;
}

/** Sind die Konten in der letzten Stunde gemeldet worden? Sonst jetzt. */
function pu_gem_konten_sicher(): array
{
    $zuletzt = (int)pu_setting('gemeinde_konten_gemeldet', '0');
    if (time() - $zuletzt < 3600) {
        return ['ok' => true];
    }
    $r = pu_relay_konten();
    if ($r['ok']) {
        pu_setting_setzen('gemeinde_konten_gemeldet', (string)time());
    }
    return $r;
}

/** Ist das aktuelle Synonym schon beim Server bekannt? */
function pu_gem_synonym_gemeldet(int $lernender): bool
{
    $s = pu_db()->prepare('SELECT pseudonym FROM lernende WHERE id = ?');
    $s->execute([$lernender]);
    $jetzt = (string)($s->fetchColumn() ?: '');
    return $jetzt !== '' && pu_setting('gemeinde_synonym_' . $lernender, '') === $jetzt;
}

// ═════════════════════════════════════════════════════════════════════════════
// Meine Produkte (K-WERK-LOKAL)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Wo Produkte und zwischengespeicherte Bilder liegen: neben der Datenbank.
 * Im Betrieb ist das `data/`; ein Test mit eigener Datenbank bekommt einen
 * eigenen Ordner und kann nie die Dateien echter Produkte berühren.
 */
function pu_gem_ablage(): string
{
    if (PU_DB === PU_DATA . '/promptheus.db') {
        return PU_DATA;
    }
    return dirname(PU_DB) . '/' . pathinfo(PU_DB, PATHINFO_FILENAME) . '_daten';
}

function pu_produkt_ordner(int $id): string
{
    return pu_gem_ablage() . '/produkte/' . $id;
}

/** Ist diese Person minderjährig? Schüler ohne Altersangabe gelten als minderjährig. */
function pu_gem_minderjaehrig(array $person): bool
{
    if (($person['rolle'] ?? '') !== 'schueler') {
        return false;
    }
    $alter = (int)($person['lebensalter'] ?? 0);
    return $alter === 0 || $alter < 18;
}

/**
 * Prüft Dateien für ein Paket — dieselben Regeln wie der Server.
 *
 * @param array<string,string> $dateien Pfad → Inhalt
 * @return array{ok:bool, grund?:string, datei?:string, hart?:list<array{datei:string, regel:string, titel:string, text:string}>,
 *               weich?:list<string>}
 */
function pu_gem_dateien_pruefen(array $dateien): array
{
    if ($dateien === [] ) {
        return ['ok' => false, 'grund' => 'paket_leer'];
    }
    if (count($dateien) > PU_GEM_EINTRAEGE_MAX) {
        return ['ok' => false, 'grund' => 'paket_eintraege'];
    }
    $summe = 0;
    $hart = [];
    $weich = [];
    foreach ($dateien as $pfad => $inhalt) {
        $pfad = (string)$pfad;
        if ($pfad === '' || strlen($pfad) > 200 || !mb_check_encoding($pfad, 'UTF-8')
            || preg_match('~(^/|\\\\|^[A-Za-z]:|(^|/)\.\.(/|$)|[\x00-\x1f])~', $pfad)) {
            return ['ok' => false, 'grund' => 'paket_pfad', 'datei' => mb_substr($pfad, 0, 80)];
        }
        if (preg_match(PU_GEM_SPERRE, $pfad)) {
            return ['ok' => false, 'grund' => 'paket_gesperrt', 'datei' => $pfad];
        }
        $name = basename($pfad);
        $endung = strtolower(pathinfo($name, PATHINFO_EXTENSION));
        if (!in_array($endung, PU_GEM_ENDUNGEN, true) && !($endung === '' && in_array($name, PU_GEM_OHNE_ENDUNG, true))) {
            return ['ok' => false, 'grund' => 'paket_endung', 'datei' => $pfad];
        }
        if (strlen($inhalt) > PU_GEM_DATEI_MAX) {
            return ['ok' => false, 'grund' => 'paket_datei_gross', 'datei' => $pfad];
        }
        $summe += strlen($inhalt);
        if ($summe > PU_GEM_ENTPACKT_MAX) {
            return ['ok' => false, 'grund' => 'paket_gross'];
        }
        if (!mb_check_encoding($inhalt, 'UTF-8') || str_contains($inhalt, "\0")) {
            return ['ok' => false, 'grund' => 'paket_binaer', 'datei' => $pfad];
        }
        foreach (pu_pii_pruefen($inhalt, true)['treffer'] as $t) {
            if ($t['art'] === 'hart') {
                $hart[] = ['datei' => $pfad, 'regel' => $t['regel'], 'titel' => $t['titel'], 'text' => $t['text']];
            } else {
                $weich[$t['titel']] = true;
            }
        }
    }
    if ($hart !== []) {
        return ['ok' => false, 'grund' => 'paket_pii', 'hart' => $hart];
    }
    return ['ok' => true, 'weich' => array_keys($weich)];
}

/** Liest die Dateien eines ZIP (für den Import eines fertigen Pakets). */
function pu_gem_zip_lesen(string $roh): array
{
    if ($roh === '' || strlen($roh) > PU_GEM_PAKET_MAX || !str_starts_with($roh, "PK\x03\x04") || !class_exists('ZipArchive')) {
        return ['ok' => false, 'grund' => $roh !== '' && strlen($roh) > PU_GEM_PAKET_MAX ? 'paket_gross' : 'paket_form'];
    }
    $tmp = tempnam(sys_get_temp_dir(), 'pz');
    file_put_contents($tmp, $roh);
    $zip = new ZipArchive();
    $dateien = [];
    try {
        if ($zip->open($tmp, ZipArchive::RDONLY) !== true) {
            return ['ok' => false, 'grund' => 'paket_form'];
        }
        if ($zip->numFiles > PU_GEM_EINTRAEGE_MAX) {
            return ['ok' => false, 'grund' => 'paket_eintraege'];
        }
        for ($i = 0; $i < $zip->numFiles; $i++) {
            $name = (string)$zip->getNameIndex($i);
            if (str_ends_with($name, '/')) {
                continue;
            }
            $st = $zip->statIndex($i);
            if ((int)($st['size'] ?? 0) > PU_GEM_DATEI_MAX) {
                return ['ok' => false, 'grund' => 'paket_datei_gross', 'datei' => $name];
            }
            $dateien[$name] = (string)$zip->getFromIndex($i, PU_GEM_DATEI_MAX + 1);
        }
    } finally {
        $zip->close();
        @unlink($tmp);
    }
    return ['ok' => true, 'dateien' => $dateien];
}

/** Packt Dateien zu einem ZIP. */
function pu_gem_zip_bauen(array $dateien): string
{
    $tmp = tempnam(sys_get_temp_dir(), 'pz');
    $zip = new ZipArchive();
    $zip->open($tmp, ZipArchive::OVERWRITE);
    ksort($dateien, SORT_STRING);
    foreach ($dateien as $pfad => $inhalt) {
        $zip->addFromString((string)$pfad, $inhalt);
    }
    $zip->close();
    $roh = (string)file_get_contents($tmp);
    @unlink($tmp);
    return $roh;
}

/**
 * Legt ein Produkt an. `$herkunft`: `werkstatt` (per Klick aus Werkstatt
 * oder Dashboard) oder `eingelegt` (von Hand). Titel und Beschreibung werden
 * bereinigt gespeichert.
 *
 * @param array<string,string> $dateien Pfad → Inhalt
 */
function pu_produkt_anlegen(int $lernender, string $titel, string $beschreibung, array $dateien,
                            string $herkunft = 'eingelegt'): array
{
    $titel = trim($titel);
    if ($titel === '' || mb_strlen($titel) > PU_GEM_TITEL_MAX || mb_strlen($beschreibung) > PU_GEM_BESCHREIBUNG_MAX) {
        return ['ok' => false, 'grund' => 'form'];
    }
    $p = pu_gem_dateien_pruefen($dateien);
    if (!$p['ok']) {
        return $p;
    }
    $jetzt = pu_jetzt();
    pu_db()->prepare('INSERT INTO produkte (lernender, titel, beschreibung, herkunft, angelegt, geaendert) VALUES (?, ?, ?, ?, ?, ?)')
        ->execute([$lernender, pu_pii_maskieren($titel), pu_pii_maskieren(trim($beschreibung)),
                   $herkunft === 'werkstatt' ? 'werkstatt' : 'eingelegt', $jetzt, $jetzt]);
    $id = (int)pu_db()->lastInsertId();
    $ordner = pu_produkt_ordner($id);
    if (!is_dir($ordner)) {
        mkdir($ordner, 0700, true);
    }
    file_put_contents($ordner . '/paket.zip', pu_gem_zip_bauen($dateien));
    return ['ok' => true, 'id' => $id, 'weich' => $p['weich']];
}

/** Ein Produkt, mit dem, was zum Freischalten noch fehlt. */
function pu_produkt(int $id): ?array
{
    $s = pu_db()->prepare('SELECT p.*, l.rolle, l.lebensalter, l.pseudonym FROM produkte p JOIN lernende l ON l.id = p.lernender WHERE p.id = ?');
    $s->execute([$id]);
    $p = $s->fetch();
    if ($p === false) {
        return null;
    }
    $fehlt = [];
    if ($p['bild_typ'] === '' || !is_file(pu_produkt_ordner($id) . '/bild.' . $p['bild_typ'])) {
        $fehlt[] = 'bild';
    }
    if (!isset(PU_GEM_HAUPTFELDER[$p['hauptfeld']]) || !in_array($p['art'], PU_GEM_ARTEN, true)
        || !in_array($p['zielgruppe'], PU_GEM_ZIELGRUPPEN, true) || !in_array($p['medium'], PU_GEM_MEDIEN, true)) {
        $fehlt[] = 'kategorie';
    }
    $p['minderjaehrig'] = pu_gem_minderjaehrig($p);
    if ($p['minderjaehrig'] && (int)$p['siegel_von'] === 0) {
        $fehlt[] = 'siegel';
    }
    if ((string)$p['pseudonym'] === '' || pu_synonym_fehler((string)$p['pseudonym']) !== null) {
        $fehlt[] = 'synonym';
    }
    $p['fehlt'] = $fehlt;
    $p['freischaltbar'] = $fehlt === [] && in_array($p['server_status'], ['', 'abgelehnt', 'widerrufen'], true);
    $p['bearbeitbar'] = in_array($p['server_status'], ['', 'abgelehnt', 'widerrufen'], true);
    unset($p['pseudonym'], $p['lebensalter']);
    return $p;
}

/** Die Produkte einer Person; dazu, wer ein Mit-Siegel von mir braucht. */
function pu_produkte(array $ich, bool $darf_siegeln): array
{
    $s = pu_db()->prepare('SELECT id FROM produkte WHERE lernender = ? ORDER BY id DESC');
    $s->execute([(int)$ich['id']]);
    $eigene = array_values(array_filter(array_map(static fn($id) => pu_produkt((int)$id), $s->fetchAll(PDO::FETCH_COLUMN))));
    $siegeln = [];
    if ($darf_siegeln) {
        $s = pu_db()->query("SELECT p.id FROM produkte p JOIN lernende l ON l.id = p.lernender
                              WHERE l.rolle = 'schueler' AND p.siegel_von = 0 AND p.server_status IN ('', 'abgelehnt', 'widerrufen')
                              ORDER BY p.id DESC LIMIT 200");
        foreach ($s->fetchAll(PDO::FETCH_COLUMN) as $id) {
            $p = pu_produkt((int)$id);
            if ($p !== null && $p['minderjaehrig'] && (int)$p['lernender'] !== (int)$ich['id'] && pu_gem_darf_siegeln($ich, $p)) {
                $siegeln[] = $p + ['urheber' => pu_gem_urheber_anzeige((int)$p['lernender'])];
            }
        }
    }
    return ['eigene' => $eigene, 'siegeln' => $siegeln];
}

/** Wer ein Siegel gibt, sieht, für wen — lokal, mit Namen (es bleibt hier). */
function pu_gem_urheber_anzeige(int $id): string
{
    $s = pu_db()->prepare('SELECT anzeigename FROM lernende WHERE id = ?');
    $s->execute([$id]);
    return (string)($s->fetchColumn() ?: '');
}

/**
 * Darf `$ich` das Produkt gegenzeichnen? Verwaltung: jedes Schülerprodukt
 * dieser Academy. Lehrkraft: nur aus den Klassen, die ihr die Schule
 * zugeordnet hat (Plan 30_Community, C8). Eltern: nur das des eigenen Kindes.
 *
 * In einer Familien-Installation (Registrierung „Eltern“, 28.09.2026) gibt es
 * nur Eltern und ihre Kinder — dort zeichnen die Eltern jedes Kind dieses
 * Rechners gegen, auch bei mehreren Geschwistern. Ohne ihr Siegel geht nichts
 * eines Kindes ins Web.
 *
 * Gezählt wird die gedeckelte Ebene: ein von Hand in die Datenbank
 * geschriebenes `verwaltung` gibt auf einem Familienrechner kein Siegel.
 */
function pu_gem_darf_siegeln(array $ich, array $produkt): bool
{
    return match (pu_ebene_gedeckelt((string)$ich['rolle'])) {
        'admin', 'verwaltung' => true,
        // Nur Schüler der Klassen, die die Schule zugeordnet hat (C8).
        'lehrer' => pu_lehrer_sieht((int)$ich['id'], (int)$produkt['lernender']),
        'eltern' => pu_art() === 'eltern' || (int)($ich['kind_von'] ?? 0) === (int)$produkt['lernender'],
        default => false,
    };
}

function pu_produkt_eigen(int $id, int $lernender): array
{
    $p = pu_produkt($id);
    if ($p === null || (int)$p['lernender'] !== $lernender) {
        throw new RuntimeException('Dieses Produkt gibt es nicht.');
    }
    return $p;
}

/** Titel, Beschreibung, Kategorie, Lizenz ändern — solange nicht hochgeladen (oder abgelehnt). */
function pu_produkt_aendern(int $id, int $lernender, array $f): array
{
    $p = pu_produkt_eigen($id, $lernender);
    if (!$p['bearbeitbar']) {
        throw new RuntimeException('Hochgeladene Produkte werden nicht mehr geändert. Zurückziehen, dann neu.');
    }
    $titel = trim((string)($f['titel'] ?? $p['titel']));
    $beschreibung = trim((string)($f['beschreibung'] ?? $p['beschreibung']));
    if ($titel === '' || mb_strlen($titel) > PU_GEM_TITEL_MAX || mb_strlen($beschreibung) > PU_GEM_BESCHREIBUNG_MAX) {
        throw new RuntimeException(PU_GEM_GRUENDE['form']);
    }
    $w = [];
    foreach (['hauptfeld' => array_keys(PU_GEM_HAUPTFELDER), 'art' => PU_GEM_ARTEN, 'zielgruppe' => PU_GEM_ZIELGRUPPEN,
              'medium' => PU_GEM_MEDIEN, 'lizenz' => PU_GEM_LIZENZEN] as $k => $erlaubt) {
        $v = (string)($f[$k] ?? $p[$k]);
        if ($v !== '' && !in_array($v, $erlaubt, true)) {
            throw new RuntimeException(PU_GEM_GRUENDE[$k === 'lizenz' ? 'lizenz' : 'kategorie']);
        }
        $w[$k] = $v;
    }
    $pt = pu_pii_pruefen($titel);
    $pb = pu_pii_pruefen($beschreibung);
    // Wer nach einem Siegel noch etwas ändert, braucht ein neues Siegel.
    $siegel_weg = ($pt['text'] !== $p['titel'] || $pb['text'] !== $p['beschreibung']) ? ', siegel_von = 0, siegel_am = \'\'' : '';
    pu_db()->prepare("UPDATE produkte SET titel = ?, beschreibung = ?, hauptfeld = ?, art = ?, zielgruppe = ?, medium = ?,
                      lizenz = ?, geaendert = ? $siegel_weg WHERE id = ?")
        ->execute([$pt['text'], $pb['text'], $w['hauptfeld'], $w['art'], $w['zielgruppe'], $w['medium'], $w['lizenz'], pu_jetzt(), $id]);
    return ['regeln' => array_values(array_map(static fn($t) => ['regel' => $t['regel'], 'titel' => $t['titel'], 'text' => $t['text']],
        array_merge($pt['treffer'], $pb['treffer'])))];
}

/** Setzt das Bild. JPG, PNG oder GIF, höchstens 1 MB und 1600 px (der Server reinigt es). */
function pu_produkt_bild(int $id, int $lernender, string $roh): void
{
    $p = pu_produkt_eigen($id, $lernender);
    if (!$p['bearbeitbar']) {
        throw new RuntimeException('Hochgeladene Produkte werden nicht mehr geändert.');
    }
    if ($roh === '' || strlen($roh) > PU_GEM_BILD_MAX) {
        throw new RuntimeException(PU_GEM_GRUENDE['bild_gross']);
    }
    $typ = match (true) {
        str_starts_with($roh, "\xFF\xD8\xFF") => 'jpg',
        str_starts_with($roh, "\x89PNG\r\n\x1A\n") => 'png',
        str_starts_with($roh, 'GIF87a'), str_starts_with($roh, 'GIF89a') => 'gif',
        default => '',
    };
    $info = $typ === '' ? false : @getimagesizefromstring($roh);
    if ($info === false || $info[2] !== ['jpg' => IMAGETYPE_JPEG, 'png' => IMAGETYPE_PNG, 'gif' => IMAGETYPE_GIF][$typ]) {
        throw new RuntimeException(PU_GEM_GRUENDE['bild_typ']);
    }
    if ($info[0] < 64 || $info[1] < 64 || $info[0] > PU_GEM_BILD_PX || $info[1] > PU_GEM_BILD_PX) {
        throw new RuntimeException(PU_GEM_GRUENDE['bild_masse']);
    }
    $ordner = pu_produkt_ordner($id);
    foreach (['jpg', 'png', 'gif'] as $alt) {
        @unlink($ordner . '/bild.' . $alt);
    }
    file_put_contents($ordner . '/bild.' . $typ, $roh);
    pu_db()->prepare('UPDATE produkte SET bild_typ = ?, geaendert = ? WHERE id = ?')->execute([$typ, pu_jetzt(), $id]);
}

/** Das Bild eines eigenen Produkts als data:-Adresse (für die Vorschau). */
function pu_produkt_bild_daten(int $id): string
{
    $p = pu_produkt($id);
    $datei = $p === null || $p['bild_typ'] === '' ? '' : pu_produkt_ordner($id) . '/bild.' . $p['bild_typ'];
    if ($datei === '' || !is_file($datei)) {
        return '';
    }
    $mime = ['jpg' => 'image/jpeg', 'png' => 'image/png', 'gif' => 'image/gif'][$p['bild_typ']];
    return 'data:' . $mime . ';base64,' . base64_encode((string)file_get_contents($datei));
}

/** Dateiliste eines Produkts. */
function pu_produkt_dateien(int $id): array
{
    $z = pu_gem_zip_lesen((string)@file_get_contents(pu_produkt_ordner($id) . '/paket.zip'));
    return $z['ok'] ? array_map(static fn($p, $i) => ['pfad' => $p, 'bytes' => strlen($i)], array_keys($z['dateien']), $z['dateien']) : [];
}

function pu_produkt_loeschen(int $id, int $lernender): void
{
    pu_produkt_eigen($id, $lernender);
    $ordner = pu_produkt_ordner($id);
    foreach (glob($ordner . '/*') ?: [] as $f) {
        @unlink($f);
    }
    @rmdir($ordner);
    pu_db()->prepare('DELETE FROM produkte WHERE id = ?')->execute([$id]);
}

/** Das Mit-Siegel geben (Lehrkraft, Verwaltung, Eltern des Kindes). */
function pu_produkt_siegeln(int $id, array $ich): void
{
    $p = pu_produkt($id);
    if ($p === null || !$p['minderjaehrig'] || !pu_gem_darf_siegeln($ich, $p) || (int)$p['lernender'] === (int)$ich['id']) {
        throw new RuntimeException('Dieses Produkt kannst du nicht gegenzeichnen.');
    }
    pu_db()->prepare('UPDATE produkte SET siegel_von = ?, siegel_am = ? WHERE id = ?')->execute([(int)$ich['id'], pu_jetzt(), $id]);
}

/**
 * Schaltet ein Produkt frei: Synonym melden, Paket prüfen, hochladen. Danach
 * wartet es auf dem Server auf die Freigabe (LLM prüft vor, ein Mensch
 * entscheidet).
 */
function pu_produkt_freischalten(int $id, array $ich): array
{
    $p = pu_produkt_eigen($id, (int)$ich['id']);
    if (!$p['freischaltbar']) {
        $was = ['bild' => 'ein Bild', 'kategorie' => 'die Kategorie', 'siegel' => 'das Mit-Siegel', 'synonym' => 'dein Synonym'];
        return ['ok' => false, 'text' => $p['fehlt'] === [] ? 'Dieses Produkt ist schon hochgeladen.'
            : 'Zum Freischalten fehlt noch: ' . implode(', ', array_map(static fn($f) => $was[$f] ?? $f, $p['fehlt'])) . '.'];
    }
    $ordner = pu_produkt_ordner($id);
    $paket = (string)@file_get_contents($ordner . '/paket.zip');
    $z = pu_gem_zip_lesen($paket);
    $pr = $z['ok'] ? pu_gem_dateien_pruefen($z['dateien']) : $z;
    if (!$pr['ok']) {
        return ['ok' => false, 'grund' => $pr['grund'], 'text' => pu_gem_grund_text($pr['grund']), 'hart' => $pr['hart'] ?? []];
    }
    if (!pu_gem_synonym_gemeldet((int)$ich['id'])) {
        $s = pu_gem_synonym_melden($ich);
        if (!$s['ok']) {
            return ['ok' => false, 'grund' => $s['grund'], 'text' => pu_gem_grund_text((string)$s['grund'])];
        }
    }
    $nutzlast = [
        'konto' => pu_gem_konto((int)$ich['id']), 'titel' => $p['titel'], 'beschreibung' => $p['beschreibung'],
        'hauptfeld' => $p['hauptfeld'], 'art' => $p['art'], 'zielgruppe' => $p['zielgruppe'], 'medium' => $p['medium'],
        'werklizenz' => $p['lizenz'], 'minderjaehrig' => $p['minderjaehrig'],
        'paket' => base64_encode($paket),
        'bild' => base64_encode((string)file_get_contents($ordner . '/bild.' . $p['bild_typ'])),
    ];
    if ($p['minderjaehrig']) {
        $nutzlast['bestaetigt_durch'] = pu_gem_konto((int)$p['siegel_von']);
    }
    $r = pu_relay_ruf('werk_hochladen', $nutzlast, true);
    if (!$r['ok']) {
        return ['ok' => false, 'grund' => $r['grund'], 'text' => pu_gem_grund_text((string)$r['grund'])];
    }
    pu_db()->prepare("UPDATE produkte SET werk_id = ?, hochgeladen = ?, server_status = 'wartet_auf_freigabe', ablehnung = '' WHERE id = ?")
        ->execute([(string)$r['id'], pu_jetzt(), $id]);
    return ['ok' => true, 'werk_id' => (string)$r['id']];
}

/** Holt den Stand der eigenen Werke vom Server (frei, abgelehnt mit Grund …). */
function pu_produkte_abgleichen(array $ich): array
{
    $r = pu_relay_ruf('meine_werke', ['konto' => pu_gem_konto((int)$ich['id'])]);
    if (!$r['ok']) {
        return $r;
    }
    $st = pu_db()->prepare('UPDATE produkte SET server_status = ?, ablehnung = ? WHERE werk_id = ? AND lernender = ?');
    foreach ((array)($r['werke'] ?? []) as $w) {
        if (is_array($w) && is_string($w['id'] ?? null)) {
            $st->execute([(string)($w['status'] ?? ''), (string)($w['ablehnung'] ?? ''), $w['id'], (int)$ich['id']]);
        }
    }
    return ['ok' => true];
}

/** Zieht ein hochgeladenes Werk zurück (auch schon freigegebene). */
function pu_produkt_zurueckziehen(int $id, array $ich): array
{
    $p = pu_produkt_eigen($id, (int)$ich['id']);
    if ($p['werk_id'] === '') {
        return ['ok' => false, 'text' => 'Dieses Produkt ist nicht hochgeladen.'];
    }
    $r = pu_relay_ruf('werk_zurueckziehen', ['konto' => pu_gem_konto((int)$ich['id']), 'id' => $p['werk_id']]);
    if (!$r['ok'] && ($r['grund'] ?? '') !== 'nicht_gefunden') {
        return ['ok' => false, 'text' => pu_gem_grund_text((string)$r['grund'])];
    }
    pu_db()->prepare("UPDATE produkte SET server_status = 'widerrufen' WHERE id = ?")->execute([$id]);
    return ['ok' => true];
}

// ═════════════════════════════════════════════════════════════════════════════
// Schaufenster (über den Server)
// ═════════════════════════════════════════════════════════════════════════════

/** Ein Aufruf an die Gemeinde mit dem eigenen Pseudonym; Fehler als Satz. */
function pu_gem_ruf(string $zweck, array $ich, array $nutzlast = [], bool $einmal = false): array
{
    $r = pu_relay_ruf($zweck, ['konto' => pu_gem_konto((int)$ich['id'])] + $nutzlast, $einmal);
    if (!$r['ok']) {
        $r['text'] = pu_gem_grund_text((string)($r['grund'] ?? ''));
    }
    return $r;
}

/** Ein Kommentar: erst hier bereinigen (die Verbotsregel sieht man sofort), dann der Server. */
function pu_gem_kommentar(array $ich, string $werk, string $text, ?int $antwort_auf): array
{
    $text = trim($text);
    if ($text === '' || mb_strlen($text) > PU_GEM_KOMMENTAR_MAX) {
        return ['ok' => false, 'text' => 'Ein Kommentar hat 1 bis 1000 Zeichen.'];
    }
    if (!pu_gem_synonym_gemeldet((int)$ich['id'])) {
        $s = pu_gem_synonym_melden($ich);
        if (!$s['ok']) {
            return ['ok' => false, 'grund' => $s['grund'], 'text' => pu_gem_grund_text((string)$s['grund'])];
        }
    }
    $p = pu_pii_pruefen($text);
    $n = ['id' => $werk, 'text' => $p['text']];
    if ($antwort_auf !== null) {
        $n['antwort_auf'] = $antwort_auf;
    }
    $r = pu_gem_ruf('kommentar', $ich, $n, true);
    if ($r['ok']) {
        // Die Regeln beider Seiten zusammen: was hier schon griff, zählt mit.
        $r['regeln'] = array_values(array_column(array_merge(
            array_map(static fn($t) => ['regel' => $t['regel'], 'titel' => $t['titel'], 'text' => $t['text']], $p['treffer']),
            (array)($r['regeln'] ?? [])), null, 'regel'));
    }
    return $r;
}

/** Bild eines Werks, zwischengespeichert (Werke ändern sich nach der Freigabe nicht). */
function pu_gem_bild(array $ich, string $werk): string
{
    if (!preg_match('/^W-[A-Z2-7]{16}$/', $werk)) {
        return '';
    }
    $ordner = pu_gem_ablage() . '/gemeinde_cache';
    foreach (['jpg', 'png', 'gif'] as $t) {
        if (is_file("$ordner/$werk.$t")) {
            return 'data:image/' . ($t === 'jpg' ? 'jpeg' : $t) . ';base64,' . base64_encode((string)file_get_contents("$ordner/$werk.$t"));
        }
    }
    $r = pu_gem_ruf('werk_datei', $ich, ['id' => $werk, 'was' => 'bild']);
    $typ = (string)($r['typ'] ?? '');
    $roh = base64_decode((string)($r['inhalt'] ?? ''), true);
    if (!$r['ok'] || !in_array($typ, ['jpg', 'png', 'gif'], true) || $roh === false) {
        return '';
    }
    if (!is_dir($ordner)) {
        mkdir($ordner, 0700, true);
    }
    file_put_contents("$ordner/$werk.$typ", $roh);
    return 'data:image/' . ($typ === 'jpg' ? 'jpeg' : $typ) . ';base64,' . base64_encode($roh);
}

// ═════════════════════════════════════════════════════════════════════════════
// Talente (Runde 3c)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Talente kommen aus der wöchentlichen Bestenliste der Likes (ganze
 * Gemeinde) und einmal zum Start. Der Server führt das Talentbuch; hier wird
 * nur angezeigt und umgewandelt (1:1 in Token, Monatsdeckel je Konto).
 */
function pu_gem_talente(array $ich): array
{
    return pu_gem_ruf('talente', $ich);
}

/** Wandelt Talente in Token um; ohne Menge alles, was der Deckel erlaubt. */
function pu_gem_talente_abholen(array $ich, ?int $menge = null): array
{
    return pu_gem_ruf('talente_abholen', $ich, $menge === null ? [] : ['menge' => $menge], true);
}
// ═════════════════════════════════════════════════════════════════════════════
// Community im Browser: der Einlass (Plan 30_Community, C1–C5)
// ═════════════════════════════════════════════════════════════════════════════
//
// Der Knopf „Community“ der Werkstatt öffnet `api.php?aktion=community_oeffnen`.
// Die Academy kennt die Person (Sitzung), hat den Schlüssel und weiss, ob ein
// Abo läuft. Sie holt beim Server eine Einlassmarke (60 s, einmal) und leitet
// auf `…/gemeinde/#e=<Marke>` weiter. Hinter `#` geht die Marke an keinen
// Server und in kein Protokoll; die Seite tauscht sie sofort gegen ein Cookie.

/**
 * Darf dieses Konto in die Community im Browser — oder, mit `$werkstatt`, in
 * die Werkstatt? Sonst zeigt die Oberfläche das Werbe-Modal (C1).
 *
 *   nicht_registriert  keine gültige Bescheinigung: Ohne Schlüssel verlässt
 *                      keine Anfrage den Rechner, die Community ist zu.
 *   kein_abo           weder eigenes Abo noch eines der Klasse oder Schule
 *
 * Admins brauchen kein Abo (pu_token_frei). Für die Werkstatt brauchen sie
 * auch keine Registrierung — sie läuft auf diesem Rechner, und der Betreiber
 * soll sie prüfen können, bevor es einen Code gibt.
 */
function pu_gem_zugang(int $lernender, bool $werkstatt = false): array
{
    require_once PU_ROOT . '/srv/abo.php';

    $admin = pu_token_frei($lernender);
    if ($werkstatt && $admin) {
        return ['ok' => true, 'grund' => ''];
    }
    $z = pu_relay_zustand();
    if (!$z['registriert'] || !$z['gueltig']) {
        return ['ok' => false, 'grund' => 'nicht_registriert'];
    }
    if (!$admin && pu_abo_fuer($lernender) === null) {
        return ['ok' => false, 'grund' => 'kein_abo'];
    }
    return ['ok' => true, 'grund' => ''];
}

/**
 * Die Adresse der Community: neben dem Relay auf demselben Server.
 * `https://promptheus-academy.de/relay/` → `https://promptheus-academy.de/gemeinde/`.
 */
function pu_gem_adresse(): string
{
    $relay = pu_relay_url();
    if (preg_match('#/relay/$#', $relay)) {
        return substr($relay, 0, -strlen('relay/')) . 'gemeinde/';
    }
    $p = parse_url($relay);
    return $p['scheme'] . '://' . $p['host'] . (isset($p['port']) ? ':' . $p['port'] : '') . '/gemeinde/';
}

/**
 * Holt die Einlassmarke und baut das Ziel der Weiterleitung.
 *
 * @param string $variante Palette der Werkstatt (`?v=`); Unbekanntes fällt weg.
 * @return array ok + ziel, oder ok=false + grund (+ werbung, wenn das Werbe-Modal gemeint ist)
 */
function pu_gem_einlass(array $ich, string $variante = ''): array
{
    require_once PU_ROOT . '/srv/varianten.php';

    $id = (int)$ich['id'];
    $z = pu_gem_zugang($id);
    if (!$z['ok']) {
        return $z + ['werbung' => true];
    }
    if (!pu_gem_synonym_gemeldet($id)) {
        $s = pu_gem_synonym_melden($ich);
        if (!$s['ok']) {
            return ['ok' => false, 'grund' => (string)($s['grund'] ?? 'serverfehler')];
        }
    }
    $v = array_key_exists($variante, PU_VARIANTEN) ? $variante : '';
    $r = pu_gem_ruf('einlass_holen', $ich, $v === '' ? [] : ['variante' => $v], true);
    if (!$r['ok']) {
        return ['ok' => false, 'grund' => (string)($r['grund'] ?? 'serverfehler')];
    }
    // Die Marke landet in einer Kopfzeile (Location): nur die erwartete Form.
    $marke = (string)($r['marke'] ?? '');
    if (!preg_match('/^[A-Za-z0-9_-]{43}$/', $marke)) {
        return ['ok' => false, 'grund' => 'marke_form'];
    }
    pu_protokoll($id, 'gemeinde', 'einlass', $v);
    return ['ok' => true, 'ziel' => pu_gem_adresse() . '#e=' . $marke . ($v !== '' ? '&v=' . $v : '')];
}

/**
 * Ein Satz für die Ansicht „Community“ der Academy, einmal. Wenn der Knopf
 * der Werkstatt nicht in die Community führen konnte (Synonym fehlt, Server
 * nicht erreichbar), landet man dort und liest, warum.
 */
function pu_gem_hinweis_setzen(string $text): void
{
    pu_session_start();
    $_SESSION['pu_gem_hinweis'] = mb_substr($text, 0, 300);
}

function pu_gem_hinweis_nehmen(): string
{
    pu_session_start();
    $t = (string)($_SESSION['pu_gem_hinweis'] ?? '');
    unset($_SESSION['pu_gem_hinweis']);
    return $t;
}
