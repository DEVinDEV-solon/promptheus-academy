# PROMPTHEUS ACADEMY

Ein Lernprogramm über den Umgang mit Sprachmodellen. Es läuft **lokal auf dem
eigenen Rechner** unter `127.0.0.1` — kein Konto in der Cloud, keine Telemetrie,
keine Installation von Datenbank oder Webserver.

Sechs Stufen führen von den Grundlagen bis zum eigenen Agenten. Vier Tutoren
(Prometheus, Athena, Hermes, Hephaistos) begleiten dabei; bewertet wird
deterministisch aus den Versuchen, nicht von einem Modell — eine Urkunde, die
heute anders zustande käme als gestern, wäre wertlos.

## Starten

```bat
promptheus-start.bat
```

Danach im Browser: <http://127.0.0.1:8801/>

Das Startskript benutzt das mitgelieferte PHP unter `php\php8.2\`. Wer ein
eigenes PHP hat:

```bat
php -S 127.0.0.1:8801 -t . router.php
```

Was ein Rechner mitbringen muss, steht in [REQUIREMENTS.md](REQUIREMENTS.md):
PHP 8.3 (8.2 genügt) mit `pdo_sqlite`, `sqlite3`, `mbstring`, `curl`, `openssl`.

## Aufbau

| Ordner | Inhalt |
|---|---|
| `srv/` | der Kern: Kurse, Aufgaben, Punkte, Prüfungen, Tutoren, Einstellungen |
| `assets/` | Oberfläche (JavaScript, CSS, Bilder) |
| `secondbrain/` | der Lehrstoff als Markdown — ein neuer Kurs ist eine neue Datei, kein Codeeingriff |
| `Brand/` | die verbindliche Marke: Farben, Schrift, Ton |
| `recht/` | AGB, Datenschutz, AVV, Impressum, Widerruf (Entwürfe) |
| `tests/` | eigene Prüfungen, ohne Fremdpaket |
| `vps/` | die Serverseite (Relay, Kundenbereich, Verwaltung) — noch nicht gebaut |
| `data/` | Datenbank und Lernstände. **Bleibt lokal und gehört nicht ins Git.** |

## Tests

```bat
php\php8.2\php.exe -d extension=pdo_sqlite -d extension=sqlite3 -d extension=mbstring tests\einstellungen_test.php
```

Jeder Test ist eine PHP-Datei, die `tests/hilfe.php` einbindet und mit
`bilanz()` endet.

## KI-Tutoren einrichten (optional)

Die Kurse, Aufgaben, Prüfungen und Urkunden laufen **ohne Sprachmodell**. Wer
die Tutoren sprechen lassen will, kopiert `.env.example` nach `.env` und trägt
einen OpenRouter-Schlüssel ein — oder setzt ihn in den Einstellungen unter
„Tutor-KI". Der Schlüssel wird nie angezeigt, auch nicht teilweise.

## Lizenz

**PolyForm Shield 1.0.0** — benutzen, ändern und weitergeben ist erlaubt, auch
geschäftlich; nicht erlaubt ist ein konkurrierendes Produkt aus PROMPTHEUS oder
Teilen davon.

- Verbindlicher Text: [LICENSE](LICENSE)
- Erklärung in einfachen Worten: [LIZENZ.md](LIZENZ.md)

**Was Nutzer mit dem Programm erstellen, gehört ihnen.** Die Lizenz gilt für
PROMPTHEUS, nicht für die eigenen Inhalte.
