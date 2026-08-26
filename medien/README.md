# medien/ — Video und Hörfolge neben dem Stoff

Hier liegen die Aufnahmen, die rechts neben Kursen und Lektionen erscheinen:
oben ein Video, darunter ein Podcast in Teilen. Am Ende eines Kurses steht
dasselbe noch einmal als **Fazit** — der Rückblick über alles, was in den
Lektionen einzeln vorkam.

## Es gibt keine Zuordnungsdatei

Was im Ordner liegt, erscheint. Kein `medien.json`, keine Datenbank, kein
Eintrag im Programm. Eine zweite Stelle, an der dieselbe Zuordnung steht,
wäre die erste, die veraltet, sobald jemand eine Datei umbenennt.

## Der Aufbau

```
medien/<Kurspfad>/kurs/          Video + Hörfolge auf der Kursseite
medien/<Kurspfad>/fazit/         Video + Hörfolge am Kursende
medien/<Kurspfad>/<Lektion>/     Video + Hörfolge in der Lektion
```

`<Kurspfad>` ist der Pfad des Kurses im Wissensspeicher, `<Lektion>` der
Dateiname der Lektion **ohne** `.md`. Beispiel:

```
medien/10_Stufen/01_Entdecker/kurs/video.mp4
medien/10_Stufen/01_Entdecker/kurs/01_worum-es-geht.mp3
medien/10_Stufen/01_Entdecker/kurs/02_wie-die-stufe-aufgebaut-ist.mp3

medien/10_Stufen/01_Entdecker/01_lektion_was-ist-ki/video.mp4
medien/10_Stufen/01_Entdecker/01_lektion_was-ist-ki/01_der-begriff.mp3

medien/10_Stufen/01_Entdecker/fazit/video.mp4
medien/10_Stufen/01_Entdecker/fazit/01_was-haengen-bleibt.mp3
```

## Die Regeln je Ordner

| Was | Wie |
|---|---|
| Video | höchstens **eines**, `.mp4`, `.webm` oder `.m4v` |
| Ton | beliebig viele, `.mp3`, `.m4a`, `.ogg`, `.opus`, `.wav` |
| Reihenfolge | nach Dateinamen — deshalb führende Nummer |
| Titel | aus dem Dateinamen: `03_kosten-je-1000-token.mp3` → „3 · Kosten je 1000 Token" |

Liegen zwei Videos im selben Ordner, gewinnt das erste. Zwei nebeneinander
wären eine Entscheidung, die niemand getroffen hat.

## Was ohne Aufnahmen passiert

Nichts Schlimmes: die Spalte bleibt für Lernende einfach aus. Ein **Tutor**
sieht stattdessen den Pfad, unter dem die Dateien erwartet werden — sonst
müsste er im Quelltext nachsehen, um eine Aufnahme abzulegen.

## Auslieferung

Die Dateien liefert der eingebaute PHP-Server **direkt** aus, nicht durch
`api.php`: eine laufende Aufnahme durch PHP zu reichen würde die einzige
Verbindung dieses Servers belegen, solange sie spielt.

Bereichsanfragen (Range) kann der eingebaute Server nicht — er schickt immer
die ganze Datei. Örtlich stört das nicht, weil der Browser sie ohnehin lädt
und danach springen kann. Wer sehr grosse Videos ablegt oder die Academy über
ein Netz betreibt, stellt einen richtigen Webserver davor.

Davor steht trotzdem die Anmeldung: `router.php` weist `/medien/…` ohne
Sitzung mit 403 ab.

## Wo die Aufnahmen herkommen

Sie werden nicht mitgeliefert. Zwei Wege haben sich bewährt:

1. **Selbst sprechen.** Eine Lektion laut vorlesen dauert vier bis sechs
   Minuten und ist die beste Hörfolge, die es dazu gibt.
2. **NotebookLM.** Lektion hineingeben, „Audio Overview" erzeugen lassen,
   die Datei hier ablegen. Achtung: das ist eine fremde Zusammenfassung —
   sie gehört gehört, bevor sie einer Klasse vorgespielt wird.

Der Dateiname trägt die Nummer, sonst nichts: `01_`, `02_`, `03_`.
