# okf-format — Open Knowledge Format (selbst dokumentiert)

Das Format, in dem dieses Vault Wissen ablegt, damit Mensch **und** Agenten es maschinell nutzen
können. `type: foundation`.

## Das Format in Kürze (OKF v0.1)
Jede Nicht-Reserved-`.md` beginnt mit YAML-Frontmatter:

```yaml
type: <PFLICHT>          # entity/token · entity/person · … · analysis · verdict · opportunity/* · foundation · law · source
title: <Anzeigename>
description: <ein Satz>
tags: [<kebab-case; Achsen: Art · Chain · Domäne · Status>]
timestamp: <ISO 8601>
ampel: 🟢|🟡|🔴          # wo eine Bewertung sinnvoll ist
konfidenz: 0.0–1.0        # bei Analysen/Verdikten
```

**Reserved-Dateien:** `index.md` (Navigation, **kein** Frontmatter) · `log.md` (Änderungshistorie).
Kontext entsteht über Wikilinks `[[…]]`; eine Entität existiert genau **einmal** als Datei.

---

## Qualitäts-Gate — Struktur-Compliance (kein 100 %-Gewicht)

Punktet nicht im Index (siehe [../index.md](../index.md)); entscheidet, ob eine Notiz **überhaupt zählt**.
Nicht-OKF-konforme Notizen dürfen nicht in gewichtete Bewertungen einfließen.

### Format-Ampel

| Ampel | Zustand | Wirkung |
|:---:|---|---|
| 🟢 | Frontmatter vollständig (type/title/description/tags/timestamp), korrekt abgelegt, verlinkt | zählt voll |
| 🟡 | kleinere Mängel (fehlende `description`/`tags`, dünne Verlinkung) | zählt, mit Hinweis + Fix-Vorschlag |
| 🔴 | kein `type` / kein Frontmatter / falsch abgelegt | **zählt nicht** — erst aufräumen |

### Übersetzungsformat — Verwertbarkeit
| Beleg-Notiz | Umgang |
|---|---|
| OKF-konform, `type` + Quelle vorhanden | als Beleg zulässig |
| Rohzulauf (99_Rohdaten/, Telegram-Dump) | erst zu OKF-Konzept veredeln, dann zitieren |
| Ohne `type`/Herkunft | nicht als Beleg verwenden |

### Anwendung durch Agenten
Vor dem Zitieren Format prüfen; 🔴-Notizen zuerst über den Button **🧹 OKF-Check** in Ordnung bringen.
Nach jeder Änderung `index.md` + `log.md` des Ordners fortschreiben.
