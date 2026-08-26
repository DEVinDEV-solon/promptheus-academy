---
type: index
title: "Sprechertexte, Bilder und Videos"
description: "Zu jedem Kurs, jeder Lektion und jeder Prüfung vier Sprechertexte — für Schüler, Eltern, Lehrkräfte und Schulleitung. Jeder Text trägt im Frontmatter, aus welchem Stoff und welchem Zielgruppen-Kontext er entstanden ist."
tags:
  - index
  - sprechertext
  - medien
timestamp: 2026-08-22T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
---

# Sprechertexte, Bilder und Videos

Hier liegt, was gesprochen und gezeigt wird. Der Aufbau spiegelt den Lehrstoff:

```
50_Sprecher_Bilder_Videos/
  10_Stufen/01_Entdecker/
    _kurs__schueler.md          ← Vorstellung des Kurses, für Lernende
    _kurs__eltern.md
    _kurs__lehrer.md
    _kurs__schule.md
    01_lektion_was-ist-ki__schueler.md
    …
    _pruefung__schueler.md
  20_Domaenen/DOM-JURA_Jura/
    …
```

## Warum vier Fassungen

Derselbe Stoff, vier verschiedene Menschen:

| Wer | Was der Text leistet | Länge |
|---|---|---|
| **Schüler** | erklärt im Ton seiner Stufe, mit einem Bild aus dem Alltag | ~200 Wörter |
| **Eltern** | was das Kind lernt, und eine Frage fürs Abendessen | ~180 Wörter |
| **Lehrkraft** | Einstieg, typische Fehlvorstellung, Zeitbedarf | ~220 Wörter |
| **Schulleitung** | Einordnung, Aufwand, ein Satz für den Elternbrief | ~160 Wörter |

**Ein Text für alle passt für keinen.** Die Lehrerin überspringt die Erklärung, das Kind versteht die Didaktik nicht, und die Schulleitung wollte nie wissen, was ein Token ist. Vier Aufnahmen sind teurer als eine — aber eine, die niemand zu Ende hört, ist teurer als vier.

## Der Ton richtet sich nach der Stufe

Bei den Schüler-Fassungen entscheidet die Stufe über das Alter der Zuhörer. Sie ist die einzige Altersachse, die die Academy wirklich hat:

| Stufe | Zuhörer |
|---|---|
| 1–2 | Kinder der Klassen 5 und 6, etwa 10 bis 12 |
| 3–4 | Jugendliche der Klassen 7 bis 9, etwa 13 bis 15 |
| 5–6 | Oberstufe, etwa 16 bis 18 |
| Fachkurse | Jugendliche und Erwachsene |

## Jeder Text sagt, woher er kommt

Im Frontmatter steht die Herkunft — Stoff, Zielgruppe, Kontextdatei, Modell:

```yaml
zielgruppe: eltern
ebene: eltern
quelle: "10_Stufen/01_Entdecker/02_lektion_wie-ein-modell-liest.md"
kontextdatei: "000_Kontext/eltern"
stufe: 1
alter_von: 10
alter_bis: 12
woerter: 174
sekunden: 70
stand: entwurf
```

Damit sieht man, **warum ein Text so klingt** — und ein Text, dessen Herkunft man nicht kennt, lässt sich nicht überarbeiten. Die `kontextdatei` zeigt auf den Ordner in [[000_Kontext]], aus dem beim Schreiben gelesen wurde; dieselben Dateien lesen auch die Tutoren. Ändert sich dort der Ton, ändert sich auch der Ton der Sprechertexte.

## Neu erzeugen

```
php -d extension=pdo_sqlite -d extension=sqlite3 setup/sprechertexte.php --was
php …                                            setup/sprechertexte.php --alle
```

`--was` zeigt nur, was fehlt, und kostet nichts. Erst `--alle` schreibt und ruft dafür je Text ein Sprachmodell — der Verbrauch landet im Cockpit wie jeder andere auch.

Ändert sich eine Lektion, löscht man die vier Dateien dazu und lässt das Skript nochmal laufen. Was schon liegt, wird sonst übersprungen.

## Stand

Alle erzeugten Texte tragen `stand: entwurf`. Vor der Aufnahme gehören sie einmal laut gelesen — was sich verhaspelt, ist zu lang. Wer einen Text überarbeitet, setzt `stand: geprueft`.

Bilder und Videos zu einem Stück gehören in denselben Ordner. Die App sucht ihre Mediendateien aber nicht hier, sondern unter `medien/` im Programmordner — siehe `medien/README.md`.
