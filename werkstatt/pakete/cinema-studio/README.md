# PROMPTHEUS Cinema Studio (vormals MULTI-LLM)

Lokale Plattform für Bilder, Videos und Sprache über **einen** OpenRouter-Anschluss, mit Seitenchat
(Claude-CLI/OpenRouter), Drehbuch, Video-Clone und strukturierter Ablage. Pläne: [plan/](plan/)
(Bildgenerator-Plan, Video-und-Chat-Plan, Audio-Katalog-Ablage-Plan).

## Quelle und Laufort
- **Quelle (versioniert):** `werkstatt\pakete\cinema-studio` im PROMPTHEUS-Repo. Nur hier ändern.
- **Laufort (nicht versioniert):** `werkstatt\scripts\CINEMA-STUDIO`. Dort liegen `.env`, `data\`, `zugang\` und die
  `Ablage\` der erzeugten Medien.
- `node werkzeuge/bauen.mjs` spiegelt den Code am Ende an den Laufort, allein geht es mit
  `node werkzeuge/cinema_spiegeln.mjs`. Gespiegelt wird nur die Liste `TEILE` in `werkzeuge/cinema_spiegeln.mjs`;
  Laufzeitdaten werden nie angefasst. Änderungen direkt am Laufort gehen beim nächsten Spiegeln verloren.

## Starten
1. Geöffnet wird Cinema Studio **aus der PROMPTHEUS-Werkstatt** (Menülink links „Cinema-Studio“). Die Werkstatt
   legt ein Ticket nach `zugang/ticket.json` (höchstens 2 Minuten, einmalig) und startet `CINEMA-STUDIO-START.bat`.
   Ohne gültiges Ticket beendet sich `server.py` mit Rückgabewert 3 und einem Hinweis (`zugang.py`).
   Einen Start ohne Ticket gibt es bewusst nicht.
2. **Keine Anmeldung** (seit 06.10.2026). Bei jedem Klick legt die Werkstatt eine Einlassmarke ab
   (`zugang/einlass.json`: nur sha256, 60 s, einmalig) und hängt sie hinter `#e=` an die Adresse. Die Seite
   löscht sie sofort aus der Adresszeile und tauscht sie über `POST /api/einlass` gegen das Sitzungs-Cookie.
   Der Einlass führt immer in das Konto `werkstatt` (Administrator, ohne Passwort, wird beim ersten Mal
   angelegt). Ohne Marke zeigt die Seite nur den Weg über die Werkstatt.
3. **An die Werkstatt gebunden** (seit 06.10.2026): Bei jedem Klick schreibt die Werkstatt `zugang/werkstatt.json`
   mit ihrem Arbeitsordner und ihrer Schutzschicht (`zugang.bindung`). Dann gilt:
   - **Ablage** in `<Arbeitsordner der Werkstatt>\Cinema-Studio\Bilder|Videos|Audio\JJJJ-MM\…` — ohne
     Nutzer-Zwischenordner, Vorrang vor der Einstellung „Ablage-Ordner“. Ein neuer Arbeitsordner gilt ohne Neustart.
   - **Schlüssel**: alle OpenRouter-Aufrufe gehen über die Schutzschicht (`or_basis()`), die den Schlüssel der
     Werkstatt einsetzt, maskiert und protokolliert. Cinema Studio schickt nur den Platzhalter `schutzschicht`;
     ein eigener Schlüssel wird dann abgelehnt. Ist die Werkstatt zu, sagt die Fehlermeldung genau das.
4. Ohne Bindung (nur noch für Tests) gilt der frühere Weg — OpenRouter-Schlüssel: Einstellungen → Anschluss. Alternativ
   `env.beispiel` als `.env` kopieren oder `OPENROUTER_API_KEY` in der Umgebung setzen (hat Vorrang).

Voraussetzung: Python 3.10+ (nur Standardbibliothek, keine Pakete).

## Aufbau
| Datei | Rolle |
|---|---|
| `server.py` | HTTP-Server (nur `127.0.0.1`), Konten, Bibliothek, Aufträge, OpenRouter `/api/v1/images`, Kostenschätzung |
| `assistent.py` · `klon.py` · `audio.py` | Seitenchat (CLI/OpenRouter) · Video-Clone · Sprachausgabe & Klang |
| `lokal_stimme/` | Lokale Stimmklonung: Anbindung (`__init__.py`) und Dienst (`dienst.py`, eigene Python-Umgebung) |
| `web/index.html`, `web/app.css`, `web/app.js` | Oberfläche (ohne Framework) |
| `web/chat.js` · `web/medien.js` | Seitenchat · Audio, Modellkatalog, Modellwahl mit Kosten, Speichern/Ablage |
| `web/influencer.js` · `web/influencer_vorlagen.json` | Menü „Influencer“: Charaktere bauen (Panel, Galerie, Lotse mit Pfeilen) · 64 Vorlagen aus `vps/Pläne/100_Cinema-Studio/charakter.md`; Daten in `data/influencer.json`. Unterpunkt „Bewegung“ zeigt Muster-Rezepte (`web/muster_*.webp` als Beispiel für @Bild 1) und übergibt den Prompt an Video-Clone/Chat |
| `Ablage/` | **Alle erzeugten Dateien**, strukturiert: `<nutzer>/Bilder\|Videos\|Audio/JJJJ-MM/Datum_Uhrzeit_Stichwort_Id` — nicht in git |
| `data/` | Verwaltung: JSON-Dateien, `uploads/`, `audio_roh/` (Originale für „Klang anpassen“), `stimmen/` (eigene Stimmproben), `chats/`, `cache/` — nicht in git |
| `tests/test_server.py` | Offline-Tests (OpenRouter simuliert): `python -m unittest discover -s tests -v` |

## Wissenswertes
- **Modellkatalog** kommt live aus `GET /api/v1/images/models` (+ `/endpoints` für Preise), 24 h im
  Cache `data/cache/modelle.json`. Die Chips (Seitenverhältnis, Qualität, Auflösung) zeigen nur, was das
  Modell laut Katalog kann.
- **Kosten:** Schätzung aus der Preisliste (`megapixel`/`image` exakt, `token` über geschätzte Tokens je
  Bild). Nach jedem Auftrag ersetzt der echte Wert aus `usage.cost` die Schätzung
  (`data/kosten_mittel.json`, gleitender Mittelwert).
- **4:5 bei allen Modellen:** Kann ein Modell 4:5 nicht selbst, fragt der Server das nächstliegende
  Format an (logarithmischer Abstand, z. B. 3:4 oder 2:3) und markiert das Bild mit `zuschnitt` und
  `anpassung`. Die Oberfläche **streckt** es standardmäßig auf 4:5 (ganzes Bild, Rahmen bleiben; bei
  GPT Image 3:4 → 4:5 ca. 7 % Stauchung) oder schneidet mittig zu (Einstellungen → Modelle) und ersetzt
  es (`aktion: zuschnitt`, Format wird geprüft). Es wird immer nur eine Achse verkleinert, nie hochgerechnet.
  Weitere Zuschnittformate: `ZUSCHNITT_FORMATE` (server.py) und `ZUSCHNITT` (app.js) gemeinsam erweitern.
- **Video** (Umschalter Bild | Video im Eingabefeld): Katalog `GET /api/v1/videos/models`, Auftrag
  `POST /api/v1/videos`, Abfrage `GET /api/v1/videos/{id}`, Datei `…/content?index=0`. Offene Aufträge
  stehen in `data/video_offen.json` und werden nach einem Neustart weiter abgefragt — ein bezahltes
  Video geht nicht verloren. Beim Download folgt der Server einer Weiterleitung **ohne** Schlüssel.
  Preis je Sekunde aus `pricing_skus` (Suchreihenfolge: plan/Video-und-Chat-Plan.md), danach Messwert
  je Sekunde. Ab 2 $ je Auftrag fragt die Oberfläche nach. Wiedergabe mit HTTP-Range (Vorspulen).
  Aktionen: **Animieren** (Bild → Startbild), **Fortsetzen** (letztes Videobild → Startbild).
- **Seitenchat rechts** (`web/chat.js`, `assistent.py`): Gehirn Claude-CLI über das Abo
  (`claude -p --output-format stream-json`, Modell wählbar: `opus`/`sonnet`/feste Opus-/Sonnet-IDs) oder
  OpenRouter; bei CLI-Fehler Ausweichen auf OpenRouter, Bilder im Chat immer über ein Vision-Modell.
  Die CLI läuft **ohne Werkzeuge** (`--tools ""`), ohne MCP-Server (`--strict-mcp-config`), in
  `data/assistent_arbeit/`, `ANTHROPIC_API_KEY`/`ANTHROPIC_AUTH_TOKEN` werden entfernt. Hooks der
  Nutzereinstellungen laufen weiter (Audit-Trail). Antworten kommen als NDJSON-Strom.
  Vorschläge als ```` ```bildprompt ```` / ```` ```videoprompt ```` → Karten mit „In Eingabe“ /
  „Direkt erzeugen“; Modus **Drehbuch** mit „Alle Szenen erzeugen“ und Markdown-Export.
  Chats liegen in `data/chats/<nutzer>/`.
- **Video-Clone** (Chat-Modus, `klon.py`): Link über yt-dlp (≤ 720p, ≤ 500 MB, keine lokalen/privaten
  Adressen) oder eigener Upload (`POST /api/klon/upload`, Rohdaten ≤ 500 MB, Format an den ersten Bytes
  geprüft) → ffmpeg-Szenenerkennung → ≤ 24 Standbilder → ein Vision-Aufruf (`klon_modell`) → Analyse
  (Hook, Stil, Rhythmus, CTA, Szenen, Fremdmarken). Die Analyse hängt am Chat (`chat.klon.bericht`) und
  geht in jede Assistenten-Anweisung; der Assistent baut daraus Bauplan und Szenen-Prompts für die
  eigene Marke. Das Quellvideo wird nach der Analyse gelöscht, Standbilder bleiben in `data/klon/<job>/`.
- **Anzahl > n des Modells:** der Server schickt dann mehrere Einzelaufrufe parallel.
- **Sicherheit:** Sitzungs-Cookie HttpOnly/SameSite=Strict + CSRF-Kopf, Host-Prüfung gegen
  DNS-Rebinding, Einlass nur mit Marke aus der Werkstatt (`zugang.py`), Bilder mit `sandbox`-CSP ausgeliefert.
  Der Schlüssel geht nie an den Browser; die Kontoanzeige gibt das Schlüssel-Label bewusst nicht weiter.
- **Datenschutz:** Beschreibungen und Referenzbilder gehen an OpenRouter und den Modellanbieter.

- **Audio** (Menü „Audio“, `audio.py`): Katalog `GET /api/v1/models?output_modalities=speech`, Stimmen je Modell aus
  `https://openrouter.ai/<modell>/llms.txt` (braucht einen eigenen User-Agent, sonst 403), Erzeugung
  `POST /api/v1/audio/speech`. Regler wie PROMPTHEUS (Tempo 70–130 %, Tiefe/Klarheit ±12 dB, Lautstärke 30–130 %):
  Probehören per Web Audio (kostenlos), beim Speichern per ffmpeg eingerechnet; das Original liegt in
  `data/audio_roh/` → „Klang anpassen“ ohne neue Kosten. Stimmproben einmal je Modell+Stimme in `data/cache/stimmproben/`.
  Stimmprofile (Modell · Stimme · Regler) in Einstellungen → Audio.
- **Stimmen klonen**: nur Modelle mit `supports_voice_cloning` (derzeit Fish Audio S2.1 Pro und S2.1 Pro Free).
  Probe per Mikrofon (MediaRecorder) oder Upload, `POST /api/stimme_upload` (Rohdaten ≤ 15 MB), per ffmpeg auf MP3
  mono ≤ 30 s gebracht; Anlegen nur mit bestätigter Einwilligung. Beim Erzeugen gehen Probe und Abschrift als
  `input_references` mit — **ohne** `voice`: Probe und Stimme zusammen lehnt Fish Audio mit 400 ab. Biometrische
  Daten → Hinweis in der Oberfläche.
- **Standard-Stimmprofil**: Einstellungen → Audio → „Standard“ an einem Profil. Das Audio-Eingabefeld startet immer
  damit (auch mit geklonter Stimme, Feld „eigene Stimme“ im Profil); im Stimmenmenü mit ★ markiert.
- **Feinjustierung speichern**: im Klang-Regler des Eingabefelds „Speichern unter …“ (Name/Titel) sichert Modell,
  Stimme, eigene Stimme und die vier Regler als Stimmprofil (`POST /api/stimmprofil_speichern`, nur Admin, gleicher
  Name ohne Groß/klein überschreibt nach Rückfrage); die Liste daneben lädt eine gespeicherte Einstellung.
- **Lokal klonen** (`lokal_stimme/`): Chatterbox Multilingual (Resemble AI, MIT-Lizenz, 23 Sprachen) läuft auf diesem
  Rechner — kostenlos, die Stimmprobe verlässt den PC nicht. Erscheint im Katalog als „Chatterbox Multilingual (lokal)“,
  sobald die Laufzeit installiert ist. Die Laufzeit (venv mit PyTorch/CUDA, Modelldateien in `hf/`, `dienst.log`) liegt
  in `LOKAL_STIMME_HOME`, Standard `D:\zarbot\lokal_stimme` — ein kurzer Pfad, weil lange Pfade unter Windows
  abgeschaltet sind und PyTorch sonst an 260 Zeichen scheitert. `dienst.py` wird beim ersten Bedarf gestartet
  (nur `127.0.0.1`, bei jedem Start ein freier Port – fest nur mit `LOKAL_STIMME_PORT`; ein belegter Port wird nicht
  still mitbenutzt), braucht einen Zugangscode, den das Portal bei jedem Start neu erzeugt, liefert gleich MP3
  (libsndfile, ohne ffmpeg; WAV nur als Rückfall),
  lädt das Modell beim ersten Auftrag (~4 GB Grafikspeicher) und endet mit dem Portal. Text wird satzweise erzeugt.
  Neu einrichten: `python -m venv D:\zarbot\lokal_stimme\venv`, dann darin
  `pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu128` und `pip install chatterbox-tts`.
- **Modellkatalog** (Menü „Modelle“): Bild · Video · Sprache · Text · Vision mit Kosten, NEU/FREI, „Als Standard“,
  Empfehlungen; Hintergrund-Aktualisierung alle 6 h; Hinweis, wenn ein gewähltes Modell verschwunden ist.
- **Ablage**: `bild_speichern()` schreibt direkt in die Ablage; `ablage_einsortieren()` verschiebt beim Start alte,
  flache Dateien (Fehler je Datei werden übersprungen, nie der Start). Pfade > 240 Zeichen verlieren das Stichwort.
  Tests setzen `BILDGEN_ABLAGE` auf einen Temp-Ordner. „Speichern unter …“ (File System Access API) und
  „Im Ordner zeigen“ (Explorer) statt blindem Download.
