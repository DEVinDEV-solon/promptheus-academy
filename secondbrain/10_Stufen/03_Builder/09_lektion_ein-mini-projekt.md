---
type: lesson
title: "Ein Mini-Projekt planen und fertigstellen"
description: "Alles aus dieser Stufe an einem Stück: ein kleiner Ablauf, der wirklich läuft — vom Blatt Papier bis zur ersten Woche Betrieb."
tags:
  - lesson
  - stufe-3
  - projekt
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 3
dauer_min: 30
---

# Ein Mini-Projekt planen und fertigstellen

## Klein ist kein Makel

Das häufigste Ende eines ersten Automationsprojekts ist nicht ein Fehler,
sondern **kein Ende**: Es wird größer, während man baut, und wird nie fertig.
Deshalb ist die wichtigste Eigenschaft deines ersten Projekts, dass es
**klein** ist. So klein, dass du es an einem Nachmittag bauen kannst.

Gute erste Projekte:

- Jeden Morgen die Termine des Tages als eine Nachricht.
- Anhänge bestimmter Absender automatisch in einen Ordner.
- Neue Formulareinträge zusammengefasst einmal am Tag.

Schlechte erste Projekte: „Ein Agent, der meine Mails beantwortet." Das ist
kein Projekt, das ist eine Stufe — genauer: Stufe 4 bis 6.

## Der Bauplan in sechs Fragen

Jede Lektion dieser Stufe hat eine Frage beigesteuert:

| Frage | aus Lektion |
|---|---|
| Was ist Eingang, was Ausgang? | 2 — Ein Ablauf auf Papier |
| Wo braucht es ein Modell, wo reicht eine Regel? | 2 und 6 |
| Welche Werkzeuge braucht der Ablauf, und was darf er? | 5 — Werkzeuge |
| Was passiert, wenn etwas schiefgeht? | 7 — Wenn es schiefgeht |
| Was kostet er im Monat? | 8 — Was ein Ablauf kostet |
| Woran merke ich, dass er funktioniert? | Stufe 6 wird das vertiefen |

```aufgabe
id: E3-23
typ: schiebe
titel: "In welcher Reihenfolge baut man?"
punkte: 30
frage: "Bring die Arbeitsschritte eines Mini-Projekts in eine sinnvolle Reihenfolge."
bausteine:
  - "Eine Woche laufen lassen und die Ergebnisse ansehen"
  - "Den Ablauf auf Papier zeichnen, mit allen Pfeilen"
  - "Mit drei Testfällen ausprobieren, auch einem leeren"
  - "Die Bausteine zusammenstecken"
  - "Kosten für einen Monat überschlagen"
loesung:
  - "Den Ablauf auf Papier zeichnen, mit allen Pfeilen"
  - "Kosten für einen Monat überschlagen"
  - "Die Bausteine zusammenstecken"
  - "Mit drei Testfällen ausprobieren, auch einem leeren"
  - "Eine Woche laufen lassen und die Ergebnisse ansehen"
richtzeit_s: 90
hinweise:
  - text: "Was musst du wissen, bevor du entscheidest, ob sich der Bau überhaupt lohnt?"
    kostet: 5
erklaerung: |
  Zeichnen, rechnen, bauen, testen, beobachten. Die Kosten stehen vor dem
  Bau: Ein Ablauf, der mehr kostet als die Zeit, die er spart, wird gar
  nicht erst gebaut.
```

## Die erste Woche

Ein Ablauf ist nicht fertig, wenn er einmal funktioniert hat. Er ist fertig,
wenn er **eine Woche lang** funktioniert hat — mit allem, was eine echte Woche
mitbringt: dem Montag mit doppelt so vielen Mails, der Mail ohne Betreff, dem
Anhang im falschen Format.

Schau in dieser Woche jeden Tag einmal hin. Nicht, ob er läuft — sondern ob
das **Ergebnis** stimmt. Ein Ablauf, der zuverlässig das Falsche tut, läuft
auch.

```aufgabe
id: E3-24
typ: denkaufgabe
titel: "Woran merkst du es?"
punkte: 25
frage: "Dein Ablauf legt seit vier Tagen Rechnungen ab, ohne Fehlermeldung. Was ist die beste Prüfung, ob er richtig arbeitet?"
optionen:
  - "Keine Fehlermeldung heißt, alles ist gut."
  - "Stichprobe: Fünf Rechnungen aus dem Postfach suchen und nachsehen, ob jede im richtigen Ordner liegt."
  - "Das Modell fragen, ob es alles richtig gemacht hat."
  - "Prüfen, ob der Ablauf als „aktiv“ angezeigt wird."
loesung: "Stichprobe: Fünf Rechnungen aus dem Postfach suchen und nachsehen, ob jede im richtigen Ordner liegt."
richtzeit_s: 60
erklaerung: |
  Die Stichprobe geht vom Eingang aus und prüft den Ausgang - unabhängig vom
  Ablauf selbst. „Aktiv" und „keine Fehlermeldung" sagen nur, dass er läuft,
  nicht, dass er stimmt.
```

## Dein Projekt

```aufgabe
id: E3-25
typ: planung
titel: "Dein Bauplan"
punkte: 60
frage: "Schreibe den Bauplan für dein Mini-Projekt. Beantworte die sechs Fragen aus der Tabelle oben: Eingang und Ausgang, Regel oder Modell, Werkzeuge, Fehlerfall, Kosten, Erfolgsprüfung. Mindestens 100 Wörter."
pruefungen:
  - art: mindestens_woerter
    wert: 100
    punkte: 10
    begruendung: "Mindestens 100 Wörter."
  - art: enthaelt_eines
    werte: [eingang, auslöser, kommt an, startet]
    punkte: 10
    begruendung: "Du nennst den Eingang oder Auslöser."
  - art: enthaelt_eines
    werte: [regel, modell]
    punkte: 10
    begruendung: "Du sagst, wo eine Regel und wo ein Modell entscheidet."
  - art: enthaelt_eines
    werte: [fehler, schiefgeht, abbrechen, wiederholen, mensch fragen, melden]
    punkte: 10
    begruendung: "Du legst fest, was im Fehlerfall passiert."
  - art: enthaelt_eines
    werte: [kosten, euro, cent, tokens, kostenlos, preis]
    punkte: 10
    begruendung: "Du überschlägst die Kosten."
  - art: enthaelt_eines
    werte: [stichprobe, prüfe, merke, funktioniert, erfolgreich, test]
    punkte: 10
    begruendung: "Du sagst, woran du merkst, dass es funktioniert."
richtzeit_s: 900
erklaerung: |
  Wer diese sechs Fragen beantwortet hat, bevor er baut, hat den größten
  Teil der Arbeit erledigt. Das Zusammenstecken ist danach der kleinere Teil.
  In Stufe 4 wird aus einem Ablauf ein System aus mehreren Teilen.
```
