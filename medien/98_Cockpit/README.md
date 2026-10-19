# medien/98_Cockpit — Erklärstücke neben den Knöpfen im Cockpit

Neben den Knöpfen der Karten „Token senden", „Token-Gutscheine mit QR-Code",
„Gutschein einlösen" und „Tokenbuch" steht ein Knopf **„▶ Erklärung anhören"**
(`assets/js/gutscheine.js`, `PU.hoerKnopf`). Er spielt eine Aufnahme, die Sinn,
Anwendungsbereiche und Kontrolle der Karte erklärt — in der Fassung für die
Person, die gerade angemeldet ist. Die Aufnahmen kommen wie alle anderen mit dem
Medienpaket (`werkzeuge/medien_paket_bauen.php`). Fehlt eine, fehlt der Knopf.

## Dateinamen

`<karte>_<zielgruppe>.mp3`, gesucht in dieser Reihenfolge (`srv/medien.php`,
`pu_cockpit_hoer`):

1. die Fassung der eigenen Zielgruppe: `schule` (Verwaltung, auch Ebene 1),
   `lehrer`, `eltern`, `schueler`
2. sonst `<karte>_alle.mp3`

| Datei | Wer hört sie | Länge |
|---|---|---|
| `token-senden_schule.mp3` | Schulleitung, Ebene 1 | ca. 2:15 |
| `token-senden_lehrer.mp3` | Lehrkräfte | ca. 2:00 |
| `token-senden_eltern.mp3` | Eltern | ca. 1:30 |
| `gutscheine_schule.mp3` | Schulleitung, Ebene 1 | ca. 2:35 |
| `gutscheine_lehrer.mp3` | Lehrkräfte | ca. 2:05 |
| `einloesen_alle.mp3` | alle | ca. 1:40 |
| `tokenbuch_schule.mp3` | Schulleitung, Ebene 1 | ca. 2:00 |
| `tokenbuch_lehrer.mp3` | Lehrkräfte | ca. 1:25 |
| `tokenbuch_eltern.mp3` | Eltern | ca. 1:25 |

Schüler hören nur `einloesen_alle.mp3`; für sie gibt es zu den anderen Karten
keine Fassung (Senden und Gutscheine sehen sie nicht).

## Entstehung

Die Sprechertexte liegen daneben als `<name>_sprechertext.md` (gitignored, wie
alle Sprechertexte unter `medien/`). Vertont mit OpenRouter
`x-ai/grok-voice-tts-1.0`, Stimme **Sal** (wie die Fachkurse), an Absätzen
geteilt und mit 0,7 s Pause per ffmpeg verbunden. Beim Vertonen wird „QR"
als „Ku-Er" gesprochen; „PROMPTHEUS" steht im Text als „Prompt Heus".

**Das Wort „hier" kommt in keinem Sprechertext vor.** Grok liest es als
„Heier", und auch die Umschrift „Hear" klang am Satzanfang schlecht (Hinweis
des Betreibers 19.10.2026). Die Stücke beginnen deshalb mit „Diese Karte
heisst …" bzw. „Das ist dein Tokenbuch".

Die Adresse trägt den Dateistand (`?v=…`), damit ein Browser eine neu
vertonte Fassung holt statt der alten aus dem Zwischenspeicher. An den Dienst gingen
nur diese Erklärtexte, keine Daten von Personen.

Ändert sich eine Karte, ändert sich der Text: Sprechertext anpassen, die mp3
löschen, neu vertonen, ins nächste Medienpaket.
