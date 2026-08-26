---
type: source
title: "OKF-Format Dokumentation v0.1"
description: "Vollständige Spezifikation des Open Knowledge Format (OKF) v0.1 — Frontmatter-Pflichtfelder, type-Vokabular, Ampel-System, Konfidenz-Skala, Reserved-Dateien, Verknüpfungsregeln, Tag-Konventionen."
tags:
  - source
  - foundation
  - okf-format
  - spezifikation
  - dokumentation
  - yaml
  - frontmatter
timestamp: 2026-08-18T17:43:48+00:00
kontext: "[[PROMPTHEUS WISSEN]]"
handverlesen: false
herkunft:
  vault: "25_Führungskompetenz"
  pfad: "00_Fundament/okf-format/okf-format-dokumentation.md"
  geerntet: 2026-08-18T17:43:48+00:00
  pruefsumme: "sha256:d7e8b1c571680b02cc811323883b4287a63e82c0fb7ece521bd3c9c280240df3"
---


# OKF-Format Dokumentation v0.1

## Überblick

Das **Open Knowledge Format (OKF)** ist eine Markdown-basierte Spezifikation für strukturierte Wissensdokumente in Obsidian-Vaults. Es definiert:

- **YAML-Frontmatter** mit Pflicht- und Optionalfeldern
- **Type-Vokabular** zur Klassifikation von Dokumenten
- **Ampel-System** zur Prioritäts- und Statusmarkierung
- **Konfidenz-Skala** zur Evidenzbewertung
- **Reserved-Dateien** mit spezieller Semantik
- **Verknüpfungsregeln** für Obsidian-Wikilinks
- **Tag-Konventionen** für hierarchische Verschlagwortung

OKF ist **Obsidian-kompatibel** und nutzt nativ YAML-Frontmatter, Wikilinks (`*...*`) und Tags (`#tag`).

---

## 1. Frontmatter-Pflichtfelder

Jedes OKF-Dokument muss folgenden YAML-Frontmatter enthalten:

### 1.1 `type`

**Wert:** Ein Wert aus dem Type-Vokabular (siehe Abschnitt 2).

```yaml
type: foundation
```

### 1.2 `title`

**Wert:** String. Mensch-lesbarer Titel des Dokuments. Sollte den Dateinamen widerspiegeln, darf aber Leer- und Sonderzeichen enthalten.

```yaml
title: "Psychological Safety (Psychologische Sicherheit)"
```

### 1.3 `description`

**Wert:** String. Ein-Satz-Zusammenfassung des Inhalts. Maximal empfohlen: 200 Zeichen.

```yaml
description: "Gemeinsame Überzeugung, dass ein Team sicher für zwischenmenschliche Risikobereitschaft ist."
```

### 1.4 `tags`

**Wert:** Liste von Strings. Mindestens ein Tag. Erstes Tag sollte der `type` sein. Siehe Abschnitt 7 für Konventionen.

```yaml
tags:
  - foundation
  - psychological-safety
  - edmondson
```

### 1.5 `timestamp`

**Wert:** ISO 8601 Datum-Zeit-String mit Zeitzone. Zeitpunkt der letzten wesentlichen Bearbeitung.

```yaml
timestamp: 2026-08-17T00:00:00+02:00
```

### 1.6 `ampel`

**Wert:** Ein Emoji-Wert aus dem Ampel-System (siehe Abschnitt 3).

```yaml
ampel: "🟢"
```

### 1.7 `konfidenz`

**Wert:** Ein Wert aus der Konfidenz-Skala (siehe Abschnitt 4).

```yaml
konfidenz: hoch
```

### Vollständiges Beispiel

```yaml
---
type: foundation
title: "Psychological Safety (Psychologische Sicherheit)"
description: "Gemeinsame Überzeugung, dass ein Team sicher für zwischenmenschliche Risikobereitschaft ist."
tags:
  - foundation
  - psychological-safety
  - edmondson
timestamp: 2026-08-17T00:00:00+02:00
ampel: "🟢"
konfidenz: hoch
---
```

### 1.8 Optionalfelder

Zusätzlich zu den Pflichtfeldern sind folgende Felder definiert. Sie sind nie erforderlich,
aber wenn sie verwendet werden, gilt die hier festgelegte Bedeutung.

| Feld | Gilt für | Bedeutung |
|------|----------|-----------|
| `aliases` | alle | Liste alternativer Schreibweisen. **Pflicht bei Entitäten**, deren Wikilink-Name vom Dateinamen abweicht — sonst bricht der Graph. |
| `quellen` | `analysis`, `verdict`, `source` | Liste von Quellen (Vault-Pfad oder URL). |
| `entitaeten` | `analysis`, `verdict` | Liste verknüpfter Entitäten als Wikilinks. |
| `schule` | `entity-person` | Theorieschule oder Forschungstradition. |
| `autor`, `jahr` | `entity-system` | Urheber und Erscheinungsjahr des Systems. |
| `evidenz` | `entity-system` | Einzeiler zur Evidenzlage. |
| `kategorie` | `entity-system` | Gruppierung (Führungssystem, Anreizsystem, Diagnoseinstrument …). |
| `rolle` | `agent`, `entity-org` | Funktion der Rolle bzw. der Organisation. |
| `zielordner` | `agent` | Ordner, in den der Agent schreibt. |
| `thema`, `fragestellung` | `analysis` | Ursprüngliche Fragestellung des Runs. |

**Alias-Regel (verbindlich).** Entitätsdateien tragen kebab-case-Dateinamen
(`bass-burns.md`), werden aber unter ihrem Sprechnamen verlinkt (`*Bass & Burns*`).
Ohne `aliases` löst Obsidian diesen Link nicht auf und die Kante fehlt im Graphen.
Jede Entität führt daher alle im Vault verwendeten Linknamen als `aliases`.

---

## 2. Type-Vokabular

Der `type`-Wert klassifiziert die Art des Dokuments. Folgende Werte sind definiert:

### 2.1 Basis-Vokabular

| Type | Beschreibung | Beispiel |
|------|--------------|----------|
| `foundation` | Fundamentale Konzepte, Theorien, Modelle | psychological-safety.md |
| `practice` | Praktische Methoden, Instrumente, Übungen | feedback-regeln.md |
| `case` | Fallbeispiele, Fallstudien | fallbeispiel-team-a.md |
| `reflection` | Persönliche Reflexionen, Journal-Einträge | wochenreflexion-2026-w33.md |
| `reference` | Referenzmaterial, Quellen, Literaturempfehlungen | ENTITAETEN_LISTE.md |
| `meta` | Meta-Dokumente über den Vault, Prozesse, Konventionen | GESAMTKONZEPT.md |
| `index` | Index- und Übersichtsdateien (Reserved) | index.md |
| `log` | Änderungs- und Aktivitätslogs (Reserved) | log.md |

### 2.2 Domänen-Vokabular (25_Führungskompetenz)

Ergänzend zum Basis-Vokabular gelten in diesem Vault folgende Types. Sie sind in
*SOUL* und im *OKF-Verknüpfungs-Systemprompt* identisch geführt.

| Type | Wofür | Ablageort |
|------|-------|-----------|
| `entity-person` | Autor, Forscher, Führungspersönlichkeit | `20_Entitaeten/personen/` |
| `entity-system` | Führungssystem, Anreizsystem, Modell, Instrument | `20_Entitaeten/systeme/` |
| `entity-org` | Organisation, Forschungsinstitut, Unternehmen | `20_Entitaeten/organisationen/` |
| `entity-theme` | Thematischer Sammelknoten | `20_Entitaeten/themen/` |
| `theme` | Wissensdomäne, laufende Fragestellung | `10_Themen/` |
| `analysis` | Ausgearbeitete Analyse, Mirofish-Report | `70_Analysen/` |
| `verdict` | Bewertung mit Fazit (wirkt / versagt) | `80_Bewertungen/` |
| `source` | Quellen-/Belegnotiz (Buch, Studie, Vortrag) | `90_Quellen/` |
| `law` | Rechtsnorm, Regulierung (Arbeitsrecht, Mitbestimmung) | `90_Quellen/` |
| `agent` | Agenten-Regelwerk, Systemprompt | `SOUL.md`, `000_Kontext/agenten/`, `30_Agenten/` |
| `context` | Firmen-, Domänen- und Vault-Kontext | `000_Kontext/` |

**Schreibweise:** Entity-Types werden mit **Bindestrich** geschrieben (`entity-person`), nicht mit
Schrägstrich. Die frühere Schreibweise `entity/person` ist **veraltet** und wurde am 2026-08-17
vault-weit normalisiert. Der Schrägstrich bleibt zulässig als *Tag* (`tags: [entity/person]`), weil
Obsidian dort hierarchische Tags unterstützt (siehe Abschnitt 7.1).

### 2.3 Erweiterung

Das Vokabular kann erweitert werden. Neue Types sollten:
- Eindeutig und beschreibend sein.
- In dieser Dokumentation nachgetragen werden.
- Nicht mit bestehenden Types überlappen.

---

## 3. Ampel-System

Das Ampel-System markiert Status, Priorität oder Reife eines Dokuments.

| Wert | Bedeutung | Typische Anwendung |
|------|-----------|--------------------|
| 🟢 | Grün | Freigegeben, geprüft, hochreif, aktiv nutzbar |
| 🟡 | Gelb | In Arbeit, unklar, mittelreif, prüfen empfohlen |
| 🔴 | Rot | Blockiert, fehlerhaft, niedrigreif, kritisch, nicht nutzen |

### Interpretationskontext

Die Ampel wird je nach `type` unterschiedlich interpretiert:

- **foundation**: Reife der Evidenz und Dokumentation. 🟢 = robust, 🟡 = teils unsicher, 🔴 = spekulativ.
- **practice**: Freigabestatus. 🟢 = freigegeben, 🟡 = Entwurf, 🔴 = nicht anwenden.
- **case**: Validierungsstatus. 🟢 = validiert, 🟡 = unbestätigt, 🔴 = widerlegt.
- **reflection**: Persönliche Einschätzung. 🟢 = klar, 🟡 = offen, 🔴 = kritisch.

### YAML-Kodierung

Da Emojis in YAML als Strings kodiert werden müssen, wird der Wert in Anführungszeichen gesetzt:

```yaml
ampel: "🟢"
```

---

## 4. Konfidenz-Skala

Die Konfidenz-Skala bewertet die Evidenz- oder Glaubwürdigkeitsstufe des Dokuments.

| Wert | Bedeutung | Kriterien |
|------|-----------|-----------|
| `hoch` | Hohe Konfidenz | Robuste Evidenz, mehrfach repliziert, breite Akzeptanz, klare Quellen |
| `mittel` | Mittlere Konfidenz | Plausibel, teils belegt, einige Quellen, aber Unsicherheiten |
| `niedrig` | Niedrige Konfidenz | Spekulativ, anekdotisch, einzelne Quelle, unsicher |

### Anwendung

- **Konfidenz bezieht sich auf den Inhalt**, nicht auf die Dokumentation selbst.
- Bei `foundation`-Dokumenten: Evidenzlage der wissenschaftlichen Aussagen.
- Bei `practice`: empirische Fundierung der Methode.
- Bei `case`: Generalisierbarkeit des Falls.

### Relation zur Ampel

Konfidenz und Ampel sind **unabhängig**:

- 🟢 + hoch: Idealfall — robust und freigegeben.
- 🟡 + hoch: Freigegeben, aber Evidenz teils unsicher.
- 🟢 + niedrig: Freigegeben, aber spekulativ — z. B. Hypothese als Arbeitsthese.
- 🔴 + hoch: Blockiert trotz hoher Evidenz — z. B. ethisch problematisch.

---

## 5. Reserved-Dateien

Folgende Dateinamen haben eine spezielle Semantik und sollten nicht für reguläre Dokumente verwendet werden.

> **Klarstellung (2026-08-17).** Reserved-Dateien tragen **ebenfalls Frontmatter** — mit
> `type: index` bzw. `type: log`. Eine ältere Regel im
> *OKF-Verknüpfungs-Systemprompt* behauptete das Gegenteil
> („Diesen beiden Dateien niemals Frontmatter hinzufügen"). Diese Spezifikation ist die
> normative Quelle; der Systemprompt wurde entsprechend korrigiert. Grund: Ohne `type` fallen
> Index- und Log-Dateien durch jede Validierung und zählen nach der Format-Ampel als 🔴.

### 5.1 `index.md`

**Zweck:** Index- oder Übersichtsdatei für einen Ordner oder den gesamten Vault.

**Frontmatter:**
```yaml
type: index
```

**Inhalt:** Liste aller Dokumente im jeweiligen Ordner mit kurzer Beschreibung und Verknüpfung. Kann automatisch generiert oder manuell gepflegt werden.

**Position:** Typischerweise im Wurzel- oder Ordnerverzeichnis.

### 5.2 `log.md`

**Zweck:** Änderungs- und Aktivitätslog für den Vault oder einen Ordner.

**Frontmatter:**
```yaml
type: log
```

**Inhalt:** Chronologische Liste von Änderungen mit Datum, Art der Änderung und verantwortlicher Person. Format:

```markdown
## 2026-08-17

- **psychological-safety.md**: Erstellt (hoch, 🟢)
- **meaningful-work.md**: Erstellt (mittel, 🟡)
```

**Position:** Im Wurzelverzeichnis oder pro Ordner, wenn granulare Logs gewünscht sind.

### 5.3 Weitere Reserved-Namen

- `README.md`: Falls eine klassische README gewünscht ist — OKF-kompatibel mit `type: meta`.
- `template.md`: Wenn als Vorlage verwendet — OKF-kompatibel mit `type: meta`.

---

## 6. Verknüpfungsregeln

### 6.1 Wikilinks

OKF nutzt Obsidian-Wikilinks zur Verknüpfung von Dokumenten:

```markdown
Siehe *psychological-safety* für Details.
```

- Der Link-Target ist der Dateiname **ohne** `.md`-Erweiterung.
- Obsidian erstellt automatisch Backlinks im verlinkten Dokument.
- Links können Alias-Namen tragen: `*Psych Safety*`.

### 6.2 Verknüpfungs-Richtlinien

1. **Vermeide isolation**: Jedes `foundation`-Dokument sollte mindestens eine Verknüpfung zu einem anderen Dokument enthalten.
2. **Vermeide link-fragmentation**: Verlinke nicht auf nicht-existierende Dokumente, es sei denn, die Erstellung ist geplant.
3. **Bidirektional**: Wenn A → B verlinkt, sollte B → A verlinkt werden (in der "Verknüpfte Entitäten"-Section).
4. **Section "Verknüpfte Entitäten"**: Jedes `foundation`-Dokument endet mit einer Section, die alle verknüpften Dokumente auflistet.

### 6.3 Verknüpfungs-Section

Standardisierte Section am Ende von `foundation`-Dokumenten:

```markdown
## Verknüpfte Entitäten

- ***dokument-name***: Kurze Beschreibung der Relation.
```

---

## 7. Tag-Konventionen

### 7.1 Hierarchische Tags

Tags können hierarchisch mit `/` strukturiert werden:

```yaml
tags:
  - foundation/psychological-safety
  - team/effectiveness
```

Obsidian unterstützt hierarchische Tags in der Tag-Ansicht.

### 7.2 Erstes Tag = Type

Das erste Tag in der Liste sollte dem `type`-Wert entsprechen:

```yaml
type: foundation
tags:
  - foundation          # Erstes Tag = type
  - psychological-safety
  - edmondson
```

### 7.3 Tag-Namenskonventionen

- **Kleinbuchstaben**: `psychological-safety`, nicht `PsychologicalSafety`.
- **Bindestrich**: Mehrwort-Tags mit `-`, nicht `_` oder Leerzeichen.
- **Keine Umlaute**: `fuehrung`, nicht `führung`.
- **Kurz und beschreibend**: 1–3 Wörter, max. 30 Zeichen.

### 7.4 Tag-Kategorien

Empfohlene Tag-Kategorien für den Vault:

- **type-tags**: `foundation`, `practice`, `case`, `reflection`, `reference`, `meta`
- **thematische-tags**: `psychological-safety`, `meaningful-work`, `wertschaetzung`
- **autor-tags**: `edmondson`, `herzberg`, `cameron`, `bakker`
- **methoden-tags**: `jd-r-modell`, `appreciative-inquiry`, `mbi`
- **kontext-tags**: `team`, `fuehrung`, `organisation`, `kultur`

---

## 8. Content-Struktur für Foundation-Dokumente

`foundation`-Dokumente folgen einer Standardstruktur mit folgenden Sections:

### 8.1 Kern

Definition des Konzepts, zentrale Begriffe, Abgrenzung zu verwandten Konzepten.

### 8.2 Mechanismus

Wie funktioniert das Konzept? Wirkungspfade, theoretische Grundlagen, Kausalketten.

### 8.3 Evidenzlage

Primärliteratur, Sekundärliteratur, Replikationen, Evidenzbewertung (mit Tabelle).

### 8.4 Anwendung

Praxisrelevanz, Anwendungshinweise für Führungskräfte, Instrumente.

### 8.5 Grenzen

Kritik, Limitationen, kulturelle und kontextuelle Einschränkungen.

### 8.6 Verknüpfte Entitäten

Liste verknüpfter Dokumente mit Relationsbeschreibung.

### Vollständiges Section-Template

```markdown
# [Titel]

## Kern
...

## Mechanismus
...

## Evidenzlage
...

## Anwendung
...

## Grenzen
...

## Verknüpfte Entitäten
...
```

---

## 9. Datei- und Ordnernamen

### 9.1 Dateinamen

- **Kleinbuchstaben**: `psychological-safety.md`, nicht `PsychologicalSafety.md`.
- **Bindestrich**: Mehrwort-Dateinamen mit `-`.
- **Keine Umlaute**: `fuehrung.md`, nicht `führung.md`.
- **Keine Leerzeichen**: Leerzeichen vermeiden; Bindestrich verwenden.
- **`.md`-Erweiterung**: Alle OKF-Dokumente haben `.md`.

### 9.2 Ordnernamen

- Gleiche Konvention wie Dateinamen.
- Numerische Präfixe für Reihenfolge: `00_Fundament/`, `01_Praxis/`, `02_Faelle/`.

### 9.3 Vault-Struktur

Empfohlene Vault-Struktur:

```
25_Fuehrungskompetenz/
├── 00_Fundament/
│   ├── feel-good-philosophie/
│   │   ├── psychological-safety.md
│   │   ├── meaningful-work.md
│   │   ├── wertschaetzung-anerkennung.md
│   │   ├── work-life-integration.md
│   │   └── positive-organizational-scholarship.md
│   └── okf-format/
│       └── okf-format-dokumentation.md
├── 01_Praxis/
├── 02_Faelle/
├── 03_Reflexion/
├── 04_Referenz/
├── index.md
└── log.md
```

---

## 10. Validierung

### 10.1 Pflichtfeld-Check

Ein OKF-Dokument ist gültig, wenn:

1. YAML-Frontmatter vorhanden ist.
2. Alle Pflichtfelder gesetzt sind: `type`, `title`, `description`, `tags`, `timestamp`, `ampel`, `konfidenz`.
3. `type` ein Wert aus dem Vokabular ist.
4. `ampel` einer der drei Emoji-Werte ist.
5. `konfidenz` einer der drei Werte `hoch`, `mittel`, `niedrig` ist.
6. `tags` mindestens ein Element enthält.
7. `timestamp` ISO 8601-konform ist.

### 10.2 Empfohlene Checks

- `tags[0]` == `type`.
- Section "Verknüpfte Entitäten" vorhanden bei `foundation`.
- Alle Wikilinks zeigen auf existierende Dokumente.
- Dateiname entspricht `title` (normalisiert).

---

## 11. Versionierung

Dies ist **OKF v0.1**. Änderungen an der Spezifikation werden in `log.md` dokumentiert.

### Zukünftige Erweiterungen (v0.2+)

- `relations`-Feld im Frontmatter für typisierte Relationen.
- `sources`-Feld für strukturierte Quellenangaben.
- `reviewers`-Feld für Review-Prozesse.
- Automatische Validierungsskripte.

---

## Verknüpfte Entitäten

- ***psychological-safety***: Beispiel eines `foundation`-Dokuments nach OKF v0.1.
- ***meaningful-work***: Weiteres `foundation`-Beispiel.
- ***wertschaetzung-anerkennung***: Weiteres `foundation`-Beispiel.
- ***work-life-integration***: Weiteres `foundation`-Beispiel.
- ***positive-organizational-scholarship***: Weiteres `foundation`-Beispiel.

---

> **Herkunft.** Diese Notiz wurde aus dem Wissensspeicher `25_Führungskompetenz`
> geerntet (`00_Fundament/okf-format/okf-format-dokumentation.md`). Sie wird von PROMPTHEUS nicht veraendert;
> Aenderungen gehoeren in den Quellvault. Verweise auf Notizen, die es
> nur dort gibt, stehen hier kursiv statt als Link.
