---
type: kontext
tags: [bereich/00-kontext, kontext]
---

# Vault Kontext

Dieses Vault ist das Zweite Gehirn von Solon.

## Über mich

Solon, Full-Stack Softwareentwickler und Automations-Spezialist. Betreibt DEVinDEV Development (devndev.de) und das Agent0-Projekt (agent0.de). Arbeitet mit einem breiten Stack: PHP 8.2/Laravel, JS, CSS, PostgreSQL, Linux/Docker, Node-RED/n8n, Telegram-Bots. Mandanten kommen ausschließlich über Empfehlungen — von Heilpraktikern bis Taxiunternehmen. Ausführliches Profil in [[00 Kontext/Über mich]].

## Vault-Struktur

- **00 Kontext/**: Persönliches Kontext-Profil (Über mich, ICP, Angebot, Schreibstil, Branding). Zentrale Referenz für alle inhaltlichen Aufgaben. Lies diese Dateien wenn du Content erstellst, Mails schreibst oder Angebote formulierst.
- **01 Inbox/**: Schnelle Gedanken, Brain Dumps, unverarbeitete Notizen. Alles was noch keinen festen Platz hat landet hier.
- **02 Projekte/**: Aktive Projekte mit konkretem Ziel und Enddatum. Projekte starten als einzelne .md Datei. Nur bei komplexen Projekten mit mehreren Dateien wird ein Unterordner erstellt.
- **03 Bereiche/**: Laufende Verantwortungsbereiche ohne Enddatum. Jeder Bereich ist ein eigener Ordner, weil Bereiche über die Zeit wachsen und mehrere Dateien sammeln.
- **04 Ressourcen/**: Referenzmaterial, Wissen, gesammelte Informationen. Jedes Thema ist ein eigener Ordner.
- **05 Daily Notes/**: Tägliches Logbuch. Was an einem Tag passiert ist, welche Entscheidungen getroffen wurden, was offen ist. Gibt Claude die Kontinuität zwischen Sessions.
- **06 Archiv/**: Abgeschlossene Projekte und inaktive Bereiche. Aus dem aktiven Blickfeld, aber durchsuchbar.
- **07 Anhänge/**: Bilder, PDFs, Medien. Obsidian legt hier automatisch alle eingefügten Dateien ab.

## Regeln für dieses Vault

- Nutze `[[Wikilinks]]` für Verknüpfungen zwischen Notizen
- Neue Notizen ohne klaren Platz kommen in 01 Inbox/
- Halte Notizen atomar: eine Idee pro Notiz wo möglich. Ausnahme: Daily Notes fassen einen ganzen Tag zusammen.
- Daily Notes im Format: YYYY-MM-DD.md (z.B. 2026-04-01.md) — sortieren automatisch chronologisch.
- Nutze YAML Frontmatter: tags, status (aktiv/abgeschlossen/pausiert), date
- Dateinamen in normaler Schreibweise mit Leerzeichen und Großbuchstaben: Beschreibender Name.md
- Neue Projekte bekommen eine einzelne .md Datei direkt unter 02 Projekte/. Unterordner nur wenn das Projekt mehrere Dateien braucht.
- Bereiche und Ressourcen sind immer Ordner, weil sie über die Zeit wachsen.
- Abgeschlossene Projekte nach 06 Archiv/ verschieben — nur auf Anweisung, nicht eigenständig.
- Wenn du Dateien erstellst oder verschiebst, erkläre kurz warum.
- Bevor du Dateien löschst oder überschreibst, frag nach.
- Wenn Solon sagt "merk dir das" oder "speicher das": Schreibregeln → 00 Kontext/Schreibstil.md, Projekt-Infos → jeweilige Projekt-Datei, technische Erkenntnisse → 04 Ressourcen/, Vault-Regeln → diese CLAUDE.md. Im Zweifel kurz fragen.

## Datenschutz & PII

**Pflichtregeln — keine Ausnahmen:**
- Namen, Adressen, E-Mails, Geburtstage, Geschlecht und Telefonnummern werden grundsätzlich durch Variablen ersetzt.
- Schema: `{{NAME_1}}`, `{{EMAIL_1}}`, `{{TEL_1}}`, `{{ADRESSE_1}}`, `{{DATUM_GEB_1}}`, `{{GESCHLECHT_1}}`
- Tippfehler von Solon werden automatisch aus dem Kontext korrigiert — nie kommentieren, einfach machen.

## Prompt & Agenten-Regeln

- Prompts werden für maximale Effizienz und Token-Ersparnis optimiert — kein Ballast.
- Bei erkennbaren Verhaltensänderungen durch neue Modellversionen: expliziter Hinweis geben.
- Sprache: .md-Dateien auf Deutsch. Code grundsätzlich auf Englisch. Englisch nur wenn technisch notwendig, dann mit kurzem Hinweis warum.
- Kein Gendern (kein *, :, /innen). Neutral, direkt, keine Floskeln.

## Session-Routinen

### Bei Session-Start
1. Prüfe 01 Inbox/ auf neue Notizen, zeige was drin liegt, biete an die Einträge einzusortieren.

### Kontext bei Bedarf
Wenn Solon fragt "Was ist gerade aktuell?" oder "Wo war ich stehen geblieben?": Lies die letzten 2-3 Daily Notes in 05 Daily Notes/ und die aktiven Projekt-Dateien in 02 Projekte/ und gib ein kompaktes Briefing.

### Bei Session-Ende
Biete an:
1. Einen Daily Note Eintrag in 05 Daily Notes/ zu erstellen mit Zusammenfassung des Tages.
2. Neue Erkenntnisse als Notizen zu speichern.
3. Die Inbox aufzuräumen falls nötig.
