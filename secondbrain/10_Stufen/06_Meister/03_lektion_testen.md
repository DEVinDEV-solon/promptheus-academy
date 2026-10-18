---
type: lesson
title: "Testen: woher weißt du, dass es stimmt?"
description: "Testfälle mit erwarteter Antwort, Grenzen und Sonderfälle, automatische Tests — und wie man etwas testet, das nie zweimal gleich antwortet."
tags:
  - lesson
  - stufe-6
  - testen
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 6
dauer_min: 18
---

# Testen: woher weißt du, dass es stimmt?

## „Es läuft" ist keine Antwort

Diese Frage steht seit Lektion 1 im Raum: *Woran merke ich, dass es
funktioniert?* Die Antwort heißt **Test**: ein Fall, bei dem du vorher weißt,
was herauskommen muss — und dann nachsiehst, ob es herauskommt.

Ein Test hat immer drei Teile:

| Teil | Beispiel: Rabattfunktion |
|---|---|
| **Eingabe** | Einkauf über 100 Euro |
| **Erwartet** | 90 Euro |
| **Tatsächlich** | Was das Programm liefert |

Stimmen Erwartet und Tatsächlich überein, ist der Test bestanden. Das klingt
banal. Es ist aber der Unterschied zwischen „ich glaube, es geht" und „es geht
in diesen zwölf Fällen nachweislich".

## Welche Fälle?

Nicht beliebige. Du kennst die gefährlichen Stellen aus Stufe 3, Lektion 4:

1. **Der Normalfall** — der, für den das Programm gebaut ist.
2. **Die Grenze** — genau 100 Euro, genau Mitternacht, genau die erste Zeile.
3. **Der leere Fall** — keine Eingabe, leere Liste, leere Datei.
4. **Der falsche Fall** — Text statt Zahl, ein Datum in falscher Form.

Drei Tests im Normalfall beweisen weniger als ein Test an der Grenze. Wer nur
testet, was ohnehin funktioniert, begeht den Bestätigungsfehler aus Stufe 2.

```aufgabe
id: E6-05
typ: uebereinstimmung
titel: "Welche Sorte Testfall?"
punkte: 30
frage: "Eine Funktion berechnet das Alter aus dem Geburtsdatum. Ordne jeden Testfall seiner Sorte zu."
links:
  - "Geboren am 15.03.2000, heute ist der 19.10.2026"
  - "Geboren genau heute vor 18 Jahren"
  - "Kein Geburtsdatum angegeben"
  - "Geburtsdatum „gestern Abend“"
rechts:
  - "Normalfall"
  - "Grenze"
  - "Leerer Fall"
  - "Falscher Fall"
loesung:
  "Geboren am 15.03.2000, heute ist der 19.10.2026": "Normalfall"
  "Geboren genau heute vor 18 Jahren": "Grenze"
  "Kein Geburtsdatum angegeben": "Leerer Fall"
  "Geburtsdatum „gestern Abend“": "Falscher Fall"
richtzeit_s: 80
erklaerung: |
  Der Geburtstag selbst ist die Grenze, an der „17" zu „18" wird - genau
  dort irren Programme am häufigsten. Der leere und der falsche Fall prüfen,
  ob das Programm sauber ablehnt statt abzustürzen.
```

## Tests, die sich selbst ausführen

Tests von Hand sind mühsam, und deshalb macht man sie irgendwann nicht mehr.
Die Lösung: **Tests als kleines Programm**, das bei jeder Änderung alle Fälle
durchgeht und meldet, ob alle bestanden sind.

```python
def test_rabatt():
    assert rabatt(50)  == 50      # Normalfall unter der Grenze
    assert rabatt(100) == 90      # genau an der Grenze
    assert rabatt(200) == 180     # Normalfall darüber
    assert rabatt(0)   == 0       # leerer Einkauf
```

Diese Academy selbst hat Hunderte solcher Tests. Jedes Mal, bevor eine neue
Fassung veröffentlicht wird, laufen sie alle durch — und wenn einer rot wird,
geht nichts raus.

```aufgabe
id: E6-06
typ: denkaufgabe
titel: "Wann laufen die Tests?"
punkte: 20
frage: "Wann sollten automatische Tests laufen?"
optionen:
  - "Einmal, wenn das Programm fertig ist"
  - "Nach jeder Änderung, bevor sie gesichert wird"
  - "Nur, wenn ein Nutzer einen Fehler meldet"
  - "Einmal im Jahr"
loesung: "Nach jeder Änderung, bevor sie gesichert wird"
richtzeit_s: 45
erklaerung: |
  Ein Test findet einen Fehler am billigsten, kurz nachdem er entstanden ist
  - dann weißt du noch, welche Änderung schuld war. Das passt zum Ablauf
  aus Lektion 2: ändern, testen, sichern.
```

## Wie testet man ein Modell?

Hier wird es knifflig. Ein Modell antwortet nicht zweimal gleich (Stufe 1,
Lektion 4). Einen Test „erwartet wird genau dieser Satz" besteht es nie. Die
Antwort: **Man testet Eigenschaften statt Wortlaute** — genau wie die
Prüfpunkte der Gegenprobe im 7. Kurs.

| Statt | Teste |
|---|---|
| „Die Antwort lautet: …" | Ist die Antwort höchstens 100 Wörter lang? |
| | Enthält sie den Namen des Produkts? |
| | Ist sie gültiges JSON mit den Pflichtfeldern? |
| | Enthält sie keines der verbotenen Wörter? |

Und weil die Antworten schwanken: **mehrmals laufen lassen**. Ein Test, der in
zehn von zehn Läufen besteht, sagt mehr als einer, der einmal bestanden hat.

```aufgabe
id: E6-07
typ: plugplay
titel: "Prüfbare Eigenschaften"
punkte: 30
frage: "Ein Modell soll Produktbeschreibungen schreiben. Welche dieser Prüfungen lassen sich automatisch und zuverlässig ausführen?"
bausteine:
  - "Die Beschreibung hat höchstens 80 Wörter"
  - "Die Beschreibung ist überzeugend"
  - "Der Produktname kommt mindestens einmal vor"
  - "Die Beschreibung enthält kein Ausrufezeichen"
  - "Die Beschreibung gefällt der Zielgruppe"
loesung:
  - "Die Beschreibung hat höchstens 80 Wörter"
  - "Der Produktname kommt mindestens einmal vor"
  - "Die Beschreibung enthält kein Ausrufezeichen"
richtzeit_s: 70
erklaerung: |
  Länge, Vorkommen und verbotene Zeichen lassen sich zählen. „Überzeugend"
  und „gefällt" sind Urteile - die prüft man mit Menschen, wie die nächste
  Lektion zeigt.
```
