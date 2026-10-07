# BILDGENERATOR — Ausbau: Video, Seitenchat, Drehbuch, Video-Clone

Stand: 24.09.2026 · baut auf [Bildgenerator-Plan.md](Bildgenerator-Plan.md) auf · Vorbild: CINEMA-STUDIO

## Ziel
1. **Video erzeugen** mit denselben Bedienmustern wie beim Bild (Chips, Kosten, Bildwand, `…`-Menü).
2. **Seitenchat rechts** (auf-/zuklappbar): ein Assistent, der Prompts vorschlägt und sie per Klick
   oder automatisch ins Bild- bzw. Video-Eingabefeld einträgt.
3. **Drehbuch** und **Video-Clone** aus CINEMA-STUDIO als Chat-Modi übernehmen.
4. **Einstellungen:** Claude-CLI (Abo) an/aus, OpenRouter als Alternative bzw. Rückfallebene.

## Phase 1 — Video erzeugen
**Schnittstelle (OpenRouter, geprüft 24.09.2026):**
- Katalog `GET /api/v1/videos/models` (29 Modelle: Veo 3.1, Sora 2 Pro, Kling 3.0, Seedance 2.x,
  Hailuo 3, Runway Gen-4.5, Wan 3.0, Grok Imagine Video …). Je Modell: `supported_resolutions`,
  `supported_aspect_ratios`, `supported_durations`, `supported_frame_images` (first/last_frame),
  `generate_audio`, `seed`, `pricing_skus` (Preis je Sekunde nach Auflösung und Ton).
- Auftrag `POST /api/v1/videos` → `id`, `status: pending`; Abfrage `GET /api/v1/videos/{id}`
  (`pending | in_progress | completed | failed`, `usage.cost`); Datei `GET /api/v1/videos/{id}/content?index=0`.
- Abfragetakt serverseitig 15–30 s; Aufträge überleben keinen Serverneustart → offene OpenRouter-Ids
  in `data/video_auftraege.json` sichern und nach dem Start weiter abfragen (bezahlte Videos nie verlieren).

**Oberfläche:**
- Oben im Eingabefeld Umschalter **Bild | Video**. Video-Chips: Modell · Format · Auflösung ·
  Dauer · Ton an/aus · Anzahl. Nur was das Modell kann.
- `+`: **Startbild / Endbild** (aus Bibliothek oder Upload). Neu im `…`-Menü eines Bildes: **Animieren**.
- Kosten exakt aus `pricing_skus`: Sekunden × Preis je Sekunde (Auflösung/Ton), z. B. Veo 3.1 Fast
  8 s 1080p mit Ton ≈ 0,96 $. Danach Messwert aus `usage.cost`.
- Bildwand: Video-Kacheln spielen beim Überfahren stumm ab, Dauer-Plakette. Leuchtkasten mit Player.
- Filter „Alle / Bilder / Videos“ in Bibliothek, Favoriten, Ordnern.
- Video-Aktionen: Öffnen, Neu erzeugen, Wiederverwenden, Letztes Bild als Startbild (Fortsetzung),
  Hochskalieren (`flux-video-upscale`), Herunterladen, Teilen, Ordner, Veröffentlichen, Papierkorb.

**Server:** Wiedergabe mit HTTP-Range (Vorspulen). Vorschaubild per ffmpeg, wenn vorhanden, sonst
erstes Bild im Browser. Datei-Grenze je Video 500 MB.

## Phase 2 — Seitenchat
- Rechte Spalte, auf-/zuklappbar (Zustand gemerkt), eigene Chatliste je Nutzer (`data/chats/<nutzer>/`).
- **Gehirn** (Einstellung):
  - **Claude-CLI (Abo)**: `claude -p --output-format stream-json`, Prompt über stdin, Modell wählbar.
    Nur OAuth-Abo: `ANTHROPIC_API_KEY`/`ANTHROPIC_AUTH_TOKEN` werden im Unterprozess entfernt.
    **Ohne Werkzeuge** (`--tools ""`), leeres Arbeitsverzeichnis, kein `bypassPermissions` — der Chat
    darf auf dem Rechner nichts ausführen (strenger als CINEMA-STUDIO).
  - **OpenRouter** (Textmodell wählbar, z. B. DeepSeek/Gemini) — wenn die CLI aus ist oder ausfällt
    (Rückfallebene einstellbar).
  - Bilder im Chat → immer OpenRouter-Vision (die CLI sieht keine Bilder), wie in CINEMA-STUDIO.
- **Kontext:** Der Systemprompt kennt die aktuellen Modelle mit ihren Fähigkeiten und Preisen, damit
  Vorschläge gültig sind (kein 4K bei einem 1K-Modell).
- **Prompt-Karten:** Der Assistent gibt Vorschläge als ```` ```bildprompt ```` / ```` ```videoprompt ````
  (JSON: prompt, modell, format, auflösung, dauer, ton, anzahl). Im Chat erscheinen sie als Karte
  mit Knöpfen **In Bild-Eingabe** / **In Video-Eingabe** / **Direkt erzeugen** (mit Kostenangabe).
  Schalter „Vorschläge automatisch eintragen“.
- Umgekehrt: Knopf am Eingabefeld **„Mit Assistent verbessern“** schickt den aktuellen Prompt in den Chat.
- Antworten laufen live ein (Streaming), Abbrechen-Knopf, Verlauf kürzen/zurücksetzen.

## Phase 3 — Drehbuch (Chat-Modus)
- Geführter Ablauf nach CINEMA (verkürzt): Briefing → Konzept → Stil/Technik → Szenenliste →
  Figuren/Elemente → Ton/Musik → Abschluss/CTA.
- Ergebnis: rechts im Chat eine **Szenenliste**, je Szene ein Video-Prompt (+ optional Startbild-Prompt).
  Knöpfe: Szene erzeugen · alle Szenen erzeugen (mit Gesamtkostenfreigabe) · als Markdown exportieren
  (`data/drehbuecher/`). Elemente (Figur, Produkt) werden als Referenzen durchgereicht → gleiche Figur
  in allen Szenen.

## Phase 4 — Video-Clone (Chat-Modus)
- Quelle: Link (yt-dlp) oder hochgeladene Datei. ffmpeg zerlegt in Szenen/Bilder, ein Vision-Modell
  (OpenRouter, Gemini) beschreibt sie → **Klon-Bauplan**: Aufbau, Schnitte, Kamera, Hook, CTA.
- Regel wie in CINEMA: **Form übernehmen, Inhalt nicht kopieren**, Fremdmarken durch die eigene ersetzen.
  Der Bauplan wird zum Drehbuch (Phase 3) und damit zu Video-Prompts.
- Werkzeuge ffmpeg, yt-dlp werden gesucht wie in CINEMA (`D:\Werkzeuge\…`, PATH); fehlt eines, sagt
  die Oberfläche das und der Modus bleibt aus. Eigene Kopie der Logik (`klon.py`), kein Import aus
  CINEMA-STUDIO — beide Programme bleiben unabhängig.

## Einstellungen (neu gegliedert)
| Reiter | Inhalt |
|---|---|
| Anschluss | OpenRouter-Schlüssel (optional, wenn nur Claude-Chat genutzt wird — dann aber keine Bilder/Videos), Katalog neu laden |
| Assistent | Claude-CLI an/aus, Claude-Modell, CLI-Status (gefunden? angemeldet?), OpenRouter-Chatmodell, Vision-Modell, Rückfall auf OpenRouter an/aus, Prompts automatisch eintragen |
| Modelle | Standardmodelle Bild/Video, empfohlene Modelle, 4:5 strecken/zuschneiden |
| Video | Standard-Dauer, Ton standardmäßig an/aus, Abfragetakt |
| Werkzeuge | Pfade ffmpeg / yt-dlp / claude (erkannt oder manuell) |
| Anzeige | Währung, Kurs |

## Datenschutz / Recht
- Chatinhalte gehen an Anthropic (Claude-CLI) bzw. OpenRouter + Modellanbieter; Hinweis im Chat-Kopf.
- Video-Clone: nur Material analysieren, an dem Nutzungsrechte bestehen oder das zur Analyse öffentlich
  zugänglich ist; Downloads können den Nutzungsbedingungen der Plattform widersprechen — Hinweis in der UI.
- Keine Videos realer Personen ohne Einwilligung (Hinweis wie bei Bildern).

## Reihenfolge und Prüfung
Jede Phase einzeln bauen, testen (Offline-Tests mit simuliertem OpenRouter/CLI), im Browser prüfen,
committen. Echte Läufe (kosten Guthaben bzw. Abo-Kontingent) nur nach Freigabe, zuerst der
günstigste Fall (4 s, 720p, ohne Ton).

## Stand (25.09.2026)
- Stufe 1 Video: fertig (Commit e187683f). Stufe 2+3 Seitenchat + Drehbuch: fertig (0c7862b5).
- Stufe 4 Video-Clone: fertig. Ein echter Analyselauf (4-s-Testvideo) kostete 0,0045 $.
- Offen: echter Videolauf bei OpenRouter (erst nach Freigabe), Video-Aktionen „Hochskalieren“
  (flux-video-upscale) und „Bearbeiten“ (flux-video-edit / aleph) am fertigen Video.

## Entscheidungen des Nutzers (24.09.2026)
1. **Claude-Modell flexibel:** alle Opus- und Sonnet-Versionen im Chat einstellbar (Aliase `opus`/`sonnet`
   = jeweils neueste, feste Versionen, eigene Modell-ID; nur `claude-opus-*`/`claude-sonnet-*` erlaubt).
2. **Video-Clone:** externe Links inkl. X/Twitter (YouTube, TikTok, Instagram …) **und** eigene Uploads.
3. **Kein Austausch mit CINEMA-STUDIO.** Alle Skripte liegen im Programmordner des Bildgenerators,
   beide Programme bleiben unabhängig.

## Preisberechnung Video (Katalogfelder `pricing_skus`, Stand 24.09.2026)
Uneinheitlich je Anbieter, daher Reihenfolge der Suche:
- `$ je Sekunde`: `duration_seconds_{with|without}_audio_{auflösung}` → `…_{with|without}_audio` →
  `{text|image}_to_video_duration_seconds_{auflösung}` → `duration_seconds_{auflösung}` → `duration_seconds`
- `Cent je Sekunde`: `cents_per_second_output_{auflösung}`, `cents_per_video_output_second_{auflösung}`,
  `cents_per_second_output`; dazu `minimum_cents_per_generation`, `cents_per_image_input`.
- `video_tokens[_{auflösung}|_without_audio]` (Seedance): Tokens ≈ Breite × Höhe × 24 fps / 1024 je
  Sekunde → als **Schätzung** gekennzeichnet.
- Modelle ohne Dauerangabe (Video-Bearbeitung/Hochskalieren/Avatar) erscheinen nicht in der
  Erzeugen-Auswahl; sie dienen später als Aktionen am fertigen Video.
