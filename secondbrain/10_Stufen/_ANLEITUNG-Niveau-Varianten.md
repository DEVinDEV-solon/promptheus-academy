---
type: note
title: "Anleitung: Niveau-Varianten für Lektionen"
description: "Wie eine Lektion für 5a anders klingt als für 10a — ohne den Programmcode anzufassen."
tags:
  - anleitung
  - didaktik
  - niveau
timestamp: 2026-09-22T00:00:00+02:00
---

# Niveau-Varianten — dieselbe Wahrheit, die Ansprache des Lernenden

Die Academy passt Lektion, Frage, Erklärung und Lob an das **Niveau** des
Lernenden an. Das Niveau ist eine einzige Achse mit drei Stufen:

| Niveau | Für wen (Anhalt) | Ton |
|---|---|---|
| `einfach` | Klasse 1–7 / bis ~12 Jahre | kurz, bildhaft, ein Fachwort je Antwort |
| `normal` | Klasse 8–10 / 13–17 Jahre | klar, ohne Fachjargon, aber ohne zu vereinfachen |
| `fachlich` | Oberstufe, Erwachsene, Lehrkräfte, Verwaltung | knapp, genau, Fachbegriffe erlaubt |

**Woher das Niveau kommt:** aus dem Profil. Zuerst zählt das eingetragene
Alter; fehlt es, tritt die **Klasse** an seine Stelle (`5a` → Schuljahr 5 ≈ 11
Jahre → `einfach`; `10a` → `normal`; `Q2` → `fachlich`). Wer selbst einen
Sprachstil gewählt hat, bekommt diesen. Das rechnet `pu_niveau()` in
`srv/profil.php` — dieselbe Achse gilt für Tutor, Lektion und Motivation, damit
nie zwei Wahrheiten entstehen.

**Die eiserne Regel:** Angepasst wird die **Ansprache**, nie die richtige
Antwort. `loesung` und `optionen` bleiben immer kanonisch. Sonst wäre dieselbe
Aufgabe je nach Niveau richtig oder falsch.

Alles ist **redaktionell**: man bearbeitet Notizen, keinen Code. Fehlt eine
Variante, greift automatisch die kanonische Fassung (`normal`).

## 1. Aufgaben — einzelne Felder anpassen

In einem `aufgabe`-Block dürfen drei Felder eine Niveau-Fassung bekommen:
`frage`, `erklaerung`, `hinweise`. Man hängt `_einfach` oder `_fachlich` an:

````text
```aufgabe
id: E1-01
typ: denkaufgabe
titel: "Was tut ein Sprachmodell?"
punkte: 20
frage: "Ein LLM bekommt einen Text. Was macht es damit?"
frage_einfach: "Ein Sprachmodell bekommt einen Text. Was macht es damit?"
frage_fachlich: "Ein LLM erhält eine Eingabesequenz. Welche Operation beschreibt sein Vorgehen am genauesten?"
optionen:
  - "…"                     # bleiben kanonisch, für alle gleich
loesung: "…"                # bleibt kanonisch
erklaerung: |
  Basis-Erklärung.
erklaerung_einfach: |
  Kürzer, mit einem Bild.
```
````

Wer keine `_einfach`-Fassung schreibt, bekommt für `einfach` die kanonische —
das ist in Ordnung. Fang mit den Aufgaben an, bei denen die Sprache am meisten
im Weg steht.

## 2. Lektionstext — eine ganze Prosafassung

Für den Fließtext legt man **neben** die Lektion eine Datei mit dem Niveau im
Namen:

```
01_lektion_was-ist-ki.md            ← kanonisch (normal)
01_lektion_was-ist-ki.einfach.md    ← kürzere, bildhafte Fassung
01_lektion_was-ist-ki.fachlich.md   ← knappe, präzise Fassung
```

Die Variantendatei trägt **nur die Prosa**. Damit die Aufgaben an der richtigen
Stelle erscheinen, setzt man dort schlanke Platzhalter mit derselben ID:

````text
```aufgabe
id: E1-01
```
````

Die Aufgaben selbst kommen immer aus der kanonischen Lektion (nur über die
`_einfach`/`_fachlich`-Felder angepasst); der Inhalt des Platzhalters zählt
nicht. `normal` hat nie eine eigene Datei — das ist die kanonische Lektion.

> Variantendateien werden vom Kursindex **nicht** als eigene Lektion gezählt
> (sonst gäbe es die Aufgaben doppelt). Das erledigt `pu_lektion_rumpf()` in
> `srv/kurse.php`.

## 3. Motivation — eigene Sprüche je Altersband

Die Motivation ist **feiner** gestaffelt als die Lektion: nicht drei Niveaus,
sondern fünf **Altersbänder**, weil ein Lob sehr vom Alter abhängt. Das Band
kommt aus `pu_altersband()` (Alter, sonst Klasse; Erwachsene, die keine Schüler
sind, bekommen den erwachsenen Ton).

Die Sätze stehen in `00_Fundament/promptheus/motivation.md`, je Band ein
Abschnitt, dessen Überschrift das Stichwort enthält:

| Überschrift enthält | Band | Für |
|---|---|---|
| `grundschule` | grundschule | Klasse 1–4, kindgerecht |
| `unterstufe`  | unterstufe  | Klasse 5–7 |
| `mittelstufe` | mittelstufe | Klasse 8–10 (auch der neutrale Rückfall) |
| `oberstufe`   | oberstufe   | Klasse 11–13, anspruchsvoll/literarisch |
| `erwachsen`   | erwachsen   | Erwachsene, Beruf; technisch/sozial-pädagogisch |

Bei **jeder** richtigen Antwort wird ein Satz **zufällig** aus dem passenden
Band gezogen; der zuletzt gezeigte wird übersprungen, so wiederholt sich nichts
unmittelbar. Fehlt zu einem Band ein Pool, greift der gemeinsame Rückfall im
Programm. Die Regeln für gute Sprüche (Leistung statt Person loben, kurz, kein
Ausrufezeichenhagel, zum Alter passend, ≤ 160 Zeichen) stehen in derselben
Datei.

## Kurz geprüft

- 5a und 10a sollen sich unterscheiden? Alter **oder** Klasse muss im Profil
  stehen — ohne beides fällt alles auf `normal` zurück.
- Nichts sickert durch: die `_einfach`/`_fachlich`-Felder werden entfernt,
  bevor eine Aufgabe an den Browser geht (geprüft in `tests/aufgaben_test.php`).
- Die Ableitung selbst ist in `tests/profil_test.php` festgehalten.
