# Schullisten — was hier hineingehört

Jede Datei in diesem Ordner ist **eine Quelle**: eine Stadt, ein Landkreis
oder ein Bundesland. Aus ihnen wird das Einrichtungsverzeichnis gefüllt, aus
dem bei der Registrierung ausgewählt wird.

Eine Liste muss **nicht vollständig sein**, um brauchbar zu sein. Stadt und
Schulname genügen. Was fehlt, trägt bei der Registrierung die Schule selbst
nach — sie kennt ihre Anschrift, und für sie ist es ein Feld statt unserer
Recherche für tausend andere.

---

## Das Format

```json
{
  "meta": {
    "bundesland": "Baden-Württemberg",
    "quelle": "Stadt Musterstadt – Schulverzeichnis (musterstadt.de/schulen)",
    "stand": "2026-09-21",
    "anzahl_eintraege": 42
  },
  "schulen": {
    "grundschulen": [
      { "name": "Grundschule Am Rain", "adresse": "Schulstr. 5, 71638 Musterstadt" },
      { "name": "Pestalozzischule", "adresse": "Musterstadt" }
    ],
    "gymnasien": [
      { "name": "Mörike-Gymnasium", "adresse": "Seestr. 80, 71638 Musterstadt",
        "webseite": "https://moerike-gymnasium.example" }
    ]
  }
}
```

### Der Kopf

| Feld | Pflicht | Bemerkung |
|---|---|---|
| `bundesland` | ja | ausgeschrieben |
| `quelle` | ja | woher die Liste stammt — wird bei jeder Zeile mitgeführt |
| `stand` | ja | `JJJJ-MM-TT` |
| `anzahl_eintraege` | nein | wenn angegeben, zählt der Einleser nach und meldet Abweichungen |

### Die Gruppen

Der Gruppenname bestimmt die Schulart. Erkannt werden:

`grundschulen` · `hauptschulen` · `werkrealschulen` · `realschulen` ·
`gemeinschaftsschulen` · `gesamtschulen` · `sekundarschulen` · `gymnasien` ·
`foerderschulen` · `sonderpaedagogik` · `berufliche_schulen` ·
`berufskollegs` · `privatschulen` · `hochschulen` · `weitere_schulen`

`weitere_schulen` ist das Sammelbecken: dort wird am Namen entschieden
(Waldorf und Montessori werden Privatschulen, Internate und Akademien fallen
heraus). Wer die Art sicher kennt, schreibt sie direkt in den Eintrag:
`"art": "grundschule"`.

### Ein Eintrag

| Feld | Pflicht | Bemerkung |
|---|---|---|
| `name` | **ja** | der vollständige Name |
| `adresse` | nein | als ein Satz: `"Schulstr. 5, 71638 Musterstadt"` — oder nur `"Musterstadt"` |
| `strasse`, `plz`, `ort` | nein | getrennt statt `adresse`; wird bevorzugt, wenn vorhanden |
| `art` | nein | überschreibt die Gruppe |
| `schulnummer` | nein | die amtliche Nummer, wenn die Quelle sie hat |
| `webseite` | nein | hilft, zwei gleichnamige Schulen zu unterscheiden |
| `traeger` | nein | z. B. `öffentlich`, `privat (Ersatzschule)` |

**Der Ort sollte immer dastehen**, auch wenn sonst nichts bekannt ist. Ohne
ihn kann der Einleser zwei gleichnamige Schulen in zwei Städten nicht
auseinanderhalten und verwirft die zweite.

---

## Die flache Liste — das zweite erlaubte Format

Wer eine Stadt- oder Landkreisseite abschreibt, bekommt selten Gruppen. Er
bekommt eine Reihe. Deshalb darf eine Datei hier auch so aussehen:

```json
[
  { "name": "Buchhaldenschule", "ort": "Aidlingen", "typ": "Grundschule",
    "strasse": "Buchhaldenstraße 4", "plz": "71134",
    "website": "http://www.buchhaldenschule.de/" },
  { "name": "Abendgymnasium Stuttgart", "ort": "Stuttgart", "typ": "Privatschule" }
]
```

Kein Kopf, keine Gruppen, `website` statt `webseite`, und `null` ist erlaubt.
Davor steht `vps/db/wandeln_liste.php`, der daraus das Format oben macht.

**`typ` darf zweierlei bedeuten.** Manche Quellen schreiben dort die Schulart
(„Grund- und Werkrealschule"), andere den Träger („Öffentlich", „Privat").
Der Wandler erkennt den Unterschied: steht dort nur ein Trägerwort, holt er
die Art aus dem **Namen** — „Eugen-Bolz-Schule Grundschule" sagt sie ja
selbst. Wo beides fehlt, wird die Zeile `sonstige`, und die Einrichtung
berichtigt das bei der Registrierung.

Bei zusammengesetzten Formen gilt, was **zuerst** dasteht: „Grund- und
Werkrealschule" wird eine Grundschule, „Schulverbund (Werkrealschule/
Realschule/Gymnasium)" eine Hauptschule. Das ist eine Wahl und keine
Wahrheit — eine Verbundschule ist beides. Aber es ist die Wahl, die die
Quelle selbst getroffen hat, als sie den Namen schrieb.

---

## Einlesen

```bash
php vps/db/einlesen_schulen.php --datei=secondbrain/90_Quellen/schulen/<datei>.json --ziel=/srv/daten
```

`--probe` zeigt, was passieren würde, und ändert nichts.

Eine flache Liste geht erst durch den Wandler. Beides zusammen, für alle
Dateien in diesem Ordner:

```bash
for f in secondbrain/90_Quellen/schulen/*.json; do h="/tmp/$(basename "$f")"; if head -c1 "$f" | grep -q '\['; then php vps/db/wandeln_liste.php --datei="$f" --ziel="$h"; else cp "$f" "$h"; fi; php vps/db/einlesen_schulen.php --datei="$h" --ziel=/srv/daten; done
```

Das gewandelte Ergebnis wird nicht aufbewahrt. Hier liegt die Quelle so, wie
sie kam; das Hausformat entsteht bei jedem Lauf neu.

Zweimal einlesen doppelt nichts — dafür sorgt ein eindeutiger Index in der
Datenbank, nicht das Skript. Der Einleser meldet am Ende, wie viele Zeilen
neu waren, wie viele schon dastanden, welche er keiner Art zuordnen konnte
und wie viele ohne vollständige Anschrift hereingekommen sind.

---

## Amtliche Landesverzeichnisse

Wo es ein amtliches Verzeichnis gibt, ist es besser als jede Stadtliste: es
ist vollständig, wird gepflegt und bringt die **amtliche Schulnummer** mit —
den einzigen Schlüssel, der eine Umbenennung übersteht.

Für solche Quellen steht je Land ein **Wandler** davor, der nichts tut, als
das Landesformat in dieses hier zu überführen. Das Muster ist
`vps/db/wandeln_nrw.php` (5 445 Schulen, freie CSV, täglich erneuert).

Welche Länder wie zu bekommen sind, steht in
`Pläne/70_Webseite_Registrierung/Einrichtungsdatenbank-Recherche.md`.
