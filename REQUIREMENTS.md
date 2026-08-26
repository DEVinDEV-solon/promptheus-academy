---
type: requirements
title: "REQUIREMENTS — was ein Rechner braucht, damit PROMPTHEUS läuft"
description: "Vollständige Liste der Voraussetzungen für PROMPTHEUS ACADEMY: PHP 8.3 mit den nötigen Erweiterungen, optional Whisper und TTS. Ohne Administratorrechte, lokal auf 127.0.0.1."
tags: [requirements, installation, php, windows]
timestamp: 2026-08-26T00:00:00+02:00
status: gueltig
---

# REQUIREMENTS — was PROMPTHEUS braucht

## Pflicht — ohne das startet nichts

| Programm | Version | Wofür |
|---|---|---|
| **PHP** | **8.3.x** (8.2 geht auch) | der ganze Server; eingebauter Webserver (`php -S`), keine weitere Software nötig |

### PHP-Erweiterungen (müssen aktiviert sein)

| Erweiterung | Wofür | In `php.ini` |
|---|---|---|
| `pdo_sqlite` | die Datenbank (`data/promptheus.db`) | `extension=pdo_sqlite` |
| `sqlite3` | Datenbank-Zugriff | `extension=sqlite3` |
| `mbstring` | Umlaute, UTF-8-Saiten | `extension=mbstring` |
| `curl` | Tutor-Anbindung (optional nutzbar) | `extension=curl` |
| `openssl` | verschlüsselte Verbindungen zum Tutor | `extension=openssl` |
| `session` | Login, Lernstände | meist eingebaut |

> **Windows-Falle:** Die WinGet-/Standard-`php.ini` hat `pdo_sqlite` und
> `sqlite3` oft auskommentiert. Entweder die Zeilen freischalten oder beim
> Start mit `-d extension=pdo_sqlite -d extension=sqlite3` nachhelfen.
> Das Installationspaket liefert eine fertige `php.ini` mit, bei der genau
> diese Erweiterungen an sind.

## Starten (nach der Installation)

```bat
:: im entpackten Ordner:
php\php.exe -c php\php.ini -S 127.0.0.1:8801 -t . router.php
:: dann Browser öffnen: http://127.0.0.1:8801/
```

Ohne eigenes PHP-Verzeichnis einfach:

```bat
php -S 127.0.0.1:8801 -t . router.php
```

## Optional — erst mal aus

| Programm | Wofür | Bemerkung |
|---|---|---|
| **whisper.cpp** + Modell (~1 GB) | Spracheingabe/Sprachausgabe lokal | großes Paket, optionale Nachrüstung |
| **OpenRouter-API-Key** (`.env`) | KI-Tutor über das Internet | `.env.example` → `.env` kopieren, Key eintragen |
| Python 3.10+ | nur für Werkzeuge in `tests/`, nicht für den Betrieb | |

## Nicht nötig / bewusst nicht

| Programm | Warum nicht |
|---|---|
| MySQL/Postgres | SQLite reicht, null Installation |
| Apache/Nginx | der eingebaute PHP-Server reicht auf 127.0.0.1 |
| Node/npm | kein Build-Schritt, alles ist fertig |
| Docker | nur für den späteren VPS-Betrieb, nicht lokal |

---

*Der Plan dahinter: [vps/plan/INSTALLATIONSPAKET-PLAN.md](vps/plan/INSTALLATIONSPAKET-PLAN.md)*
