# MULTI-LLM — Ausbau: Audio, Modellkatalog, Ablage, Umbenennung

Stand: 25.09.2026 · baut auf [Video-und-Chat-Plan.md](Video-und-Chat-Plan.md) auf

## Wünsche des Nutzers
1. Menüpunkt **Audio**: Sprachmodelle wählen (z. B. `x-ai/grok-voice-tts-1.0`, Gemini-TTS, auch `:free`),
   Stimme wählen, Feinjustierung wie in PROMPTHEUS (Tempo, Tiefe, Klarheit, Lautstärke) — kompakt in den
   Einstellungen, ohne viel Platz.
2. **Strukturierte Ablage** aller Bilder, Videos, Audios im Programm (bisher landete „Herunterladen“ in Downloads).
3. **Modellkatalog**: immer aktuell von OpenRouter holen, ohne Nachschauen; Kosten (Ein-/Ausgabe bzw. was zählt)
   kompakt neben jedem Modell — überall.
4. **Analyse-Modell für Video-Clone** komfortabel anzeigen und wählen.
5. Name **MULTI-LLM** statt Bildgenerator; **DEVinDEV-Logo** links oben neben dem Namen.

## Fakten (geprüft 25.09.2026)
- Sprache: `POST /api/v1/audio/speech` (OpenAI-kompatibel: `model`, `input`, `voice`, `response_format` mp3|pcm,
  `speed`) → Antwort sind die Audio-Bytes. Katalog: `GET /api/v1/models?output_modalities=speech` (20 Modelle,
  darunter `deepgram/flux-tts:free`, `fish-audio/s2.1-pro-free:free`). Preis je Zeichen (`pricing.prompt`).
- Stimmen liefert die API nicht; sie stehen maschinenlesbar in `https://openrouter.ai/<modell>/llms.txt`
  (Zeile `- voice: "a" | "b" …`, sonst freier Text mit Beispielwert). Grok: eve, ara, rex, sal, leo.
- Das Logo liegt als `logo64.jpg` vor (gewünscht war „logo69.jpg“ — gibt es nicht).
- `google/gemini-3.8-flash:batch` ist ein Textmodell (Batch-Variante); die Sprachvarianten heißen
  `google/gemini-3.8-flash-tts` und `…-lite-tts` und sind enthalten.

## Entscheidungen
| Thema | Entscheidung |
|---|---|
| Regler | Wie PROMPTHEUS: Tempo 70–130 %, Tiefe ±12 dB (Bass 220 Hz), Klarheit ±12 dB (Höhen 3,2 kHz), Lautstärke 30–130 %. Probehören im Browser (Web Audio, kostet nichts); beim Speichern per ffmpeg eingerechnet (`atempo`, `bass`, `treble`, `volume`). Das Original bleibt erhalten → „Klang anpassen“ jederzeit ohne neue Kosten. |
| Stimmprofile | Benannte Profile (Modell · Stimme · 4 Regler) in Einstellungen → Audio, eine kompakte Zeile je Profil. Im Eingabefeld wählbar. |
| Stimmproben | „Anhören“ erzeugt einmal je Modell+Stimme eine kurze Probe und speichert sie (kostet < 0,001 $, bei `:free` nichts). |
| Ablage | `Ablage/<nutzer>/<Bilder|Videos|Audio>/<JJJJ-MM>/<JJJJ-MM-TT_HHMM>_<stichwort>_<id>.<endung>`, Pfad einstellbar. Bestehende Dateien werden beim Start einmalig einsortiert. „Speichern unter …“ (Ordnerwahl im Browser) statt blindem Download, dazu „Im Ordner zeigen“ (Explorer). |
| Katalog | Neuer Menüpunkt **Modelle**: Bild · Video · Sprache · Text/Chat · Vision mit Suche, Kosten, NEU-Kennzeichen, „als Standard“. Kataloge aktualisieren sich im Hintergrund alle 6 h; verschwindet ein gewähltes Modell, weist die App darauf hin. |
| Kostenformat | Bild ≈ $/Bild · Video $/s · Sprache $/1.000 Zeichen · Text Ein/Aus $/Mio. Tokens · `:free` = „kostenlos“. Eine gemeinsame Modellwahl mit Kosten ersetzt die Datalist-Felder in den Einstellungen. |
| Name | Oberfläche, Titel, Starter (`MULTI-LLM-START.bat`), Kopfzeilen an OpenRouter heißen MULTI-LLM. Der **Ordner** `scripts/Bildgenerator` bleibt vorerst (dort liegen `.env`, Logo, fremde Dateien); Umbenennung beim Zusammenführen, nach Rückfrage. |

## Nachtrag: Stimmen klonen (Wunsch 25.09.2026)
- Klonen per `input_references` (eine `input_audio`-Probe, optional eine `text`-Abschrift, ≤ 15 MB).
  Laut `/models/<id>/endpoints` (`supports_voice_cloning`) können das derzeit nur **Fish Audio S2.1 Pro** und
  **S2.1 Pro Free** (kostenlos). Die App liest die Fähigkeit live aus und bietet nur passende Modelle an.
- Probe per **Mikrofon** (MediaRecorder, mit Pegel und 30-s-Grenze) oder **Upload**; ffmpeg macht daraus
  MP3 mono ≤ 30 s. Vorlesetext zum Ablesen. Speichern nur mit bestätigter Einwilligung (eigene Stimme oder
  ausdrückliche Einwilligung der Person); Hinweis auf biometrische Daten (DSGVO Art. 9) und Täuschungsverbot.
- Google-Stimmen: Gemini-TTS liefert 30 Stimmen (Zephyr, Puck, Charon, Kore …), automatisch aus dem Katalog.

## Stand (25.09.2026)
Umgesetzt und getestet (18 Offline-Tests; echter Lauf nur mit `deepgram/flux-tts:free`, kostenlos).
Beim Umstellen hat die laufende App die 57 vorhandenen Bilder in die Ablage einsortiert – alle Einträge geprüft.

## Prüfung
Offline-Tests (Stimmen-Auslese, Preise, Ablage-Pfade und -Einsortierung, Sprachauftrag mit simuliertem
OpenRouter, Klang-Einrechnung mit echtem ffmpeg). Echter Sprachlauf nur mit einem `:free`-Modell (kostenlos).
