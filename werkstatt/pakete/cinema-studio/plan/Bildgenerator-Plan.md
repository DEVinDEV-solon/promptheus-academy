# BILDGENERATOR — Plan

Stand: 23.09.2026 · Ordner: `scripts/Bildgenerator`

## Ziel
Lokales, login-geschütztes Bildgenerator-Dashboard. Mehrere Bildmodelle laufen über **einen**
OpenRouter-Anschluss. Die Bedienung folgt den Vorlagen (Eingabefeld mit Auswahl-Chips wie in den
Screenshots), die Plattform folgt CINEMA-STUDIO (dunkle Oberfläche, Gold-Bronze-Akzent,
aufklappbares Menü links, Profil unten links). Alles auf Deutsch.

## Entscheidungen
| Thema | Entscheidung | Grund |
|---|---|---|
| Server | Python-Standardbibliothek (`server.py`, `ThreadingHTTPServer`), keine Pakete | Bildaufträge dauern 10–90 s; der PHP-Built-in-Server ist einfädig und würde die Oberfläche blockieren |
| Bindung | nur `127.0.0.1`, Port `BILDGEN_PORT` (Standard 8796) | globale Sicherheitsregel |
| Anschluss | OpenRouter `POST /api/v1/images` | eigener Bild-Endpunkt: `aspect_ratio`, `resolution`, `quality`, `n`, `input_references` |
| Modellkatalog | `GET /api/v1/images/models` + `/endpoints` je Modell, 24 h zwischengespeichert | Auswahlfelder zeigen nur, was das Modell wirklich kann |
| Schlüssel | `OPENROUTER_API_KEY` aus der Umgebung (zsec-fähig) oder `.env`; nie an den Browser | Secrets-Hygiene |
| Daten | JSON-Dateien + Bilddateien in `data/` | wie CINEMA-STUDIO, kein DB-Server |
| Konten | PBKDF2-SHA256, erstes Konto = Admin, Sitzungs-Cookie HttpOnly + CSRF-Kopf | Login, Profil, Passwort ändern |

## Kostenanzeige (rechts im Bedienfeld)
Preis je Modell aus den Endpunkt-Preisen (`unit`: `token`, `megapixel`, `image`).
- `megapixel`/`image`: direkt rechnen (Megapixel aus Auflösung × Seitenverhältnis).
- `token`: Tokenzahl je Bild geschätzt (OpenAI nach Qualität, Gemini nach Auflösung, sonst ~4.175).
- Nach jedem Auftrag liefert OpenRouter `usage.cost` → der gemessene Mittelwert je
  Modell/Einstellung ersetzt die Schätzung. Die Anzeige sagt, ob Schätzung oder Messwert.
- Kontostand des Schlüssels über `GET /api/v1/key` im Profilbereich.

## Oberfläche
1. **Menü links (auf-/zuklappbar):** Erstellen · Bibliothek · Favoriten · Ordner (Untermenü) ·
   Elemente · Veröffentlicht · Verbrauch · Papierkorb. Unten: Kontostand + Profilknopf →
   Profil, Passwort ändern, Einstellungen, Benutzer (Admin), Abmelden.
2. **Bildwand:** letzte Bilder als Raster, nach Tag gruppiert, scrollt hinter dem schwebenden
   Eingabefeld. Laufende Aufträge als Platzhalter.
3. **Eingabefeld:** `+` (Referenzbilder hochladen / Elemente), Beschreibung, Chips:
   Modell (Suche, empfohlene Modelle, Kennzeichen NEU/PREMIUM) · Seitenverhältnis · Qualität ·
   Auflösung · Anzahl 1–4 · Knopf „Erzeugen" mit Kosten. Chips erscheinen nur, wenn das Modell
   den Parameter kennt. Strg+Enter erzeugt.
4. **Je Bild:** oben links Auswahlkästchen (Mehrfachauswahl → Leiste mit Herunterladen,
   In Ordner, Papierkorb); rechts senkrecht Favorit · Herunterladen · Kopieren · `…`.
5. **Menü `…`:** Öffnen · Neu erzeugen · Wiederverwenden · Element erstellen › · Element zuweisen ·
   Weitere › (Variationen, Hochskalieren 4K, Hintergrund entfernen, Als Referenz) · Favorit ·
   Teilen › · In Ordner › · Veröffentlichen · Herunterladen · In den Papierkorb.
6. **Tooltips** an allen Bedienelementen.

## Bildformat 4:5 (Nachtrag 23.09.2026)
4:5 ist bei jedem Modell wählbar. Modelle ohne 4:5 (GPT Image, FLUX, Grok, Recraft V4.1) erzeugen im
nächstliegenden Format (GPT Image: 3:4). Standard ist **Strecken** auf 4:5, weil Bilder oft einen Rahmen
haben, der beim Zuschneiden angeschnitten würde (3:4 → 4:5 ≈ 7 % Stauchung). Zuschneiden bleibt in den
Einstellungen wählbar. Im Menü steht „gestreckt“ bzw. „per Zuschnitt“, der Tooltip nennt die Verzerrung.

## Elemente
Benannte Referenzsets (Figur, Produkt, Stil). Aus einem Bild erstellen oder ihm zuweisen; im
Eingabefeld über `+` auswählen → die Bilder gehen als `input_references` mit.

## Datenschutz
Beschreibungen und Referenzbilder gehen an OpenRouter und den jeweiligen Modellanbieter
(Drittland möglich). Hinweis in den Einstellungen; keine Fotos realer Personen ohne Einwilligung.

## Dateien
`server.py` · `web/index.html` · `web/app.css` · `web/app.js` · `BILDGENERATOR-START.bat` ·
`.env.example` · `.gitignore` · `tests/test_server.py` · `data/` (Nutzerbestand, gitignored)

## Prüfung
- `python -m py_compile server.py`, Unit-Tests für Kosten, Passwort, Pfadschutz.
- Start im Browser-Pane: Einrichtung, Login, Modellwahl, Chips, Menüs, Tooltips, Mobilbreite.
- Ein echter Erzeugungslauf braucht einen gesetzten Schlüssel und kostet Guthaben → nicht automatisch.

## Offen / später
Inpainting/Maskieren, Video, Freigabe ins LAN (nur nach Rückfrage).
