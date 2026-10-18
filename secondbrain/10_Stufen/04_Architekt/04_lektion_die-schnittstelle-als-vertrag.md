---
type: lesson
title: "Die Schnittstelle als Vertrag"
description: "Was zwei Teile eines Systems voneinander erwarten dürfen — Pflichtfelder, Formate und was passiert, wenn sich eine Seite nicht daran hält."
tags:
  - lesson
  - stufe-4
  - api
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 4
dauer_min: 16
---

# Die Schnittstelle als Vertrag

## Zwei Teile, eine Abmachung

Wenn ein Agent einem anderen etwas übergibt, ist das wie eine Lieferung
zwischen zwei Betrieben: Beide müssen sich vorher einig sein, **was geliefert
wird und in welcher Form**. Diese Abmachung heißt Schnittstelle — und weil
sie so verbindlich sein muss wie ein Vertrag, nennt man sie auch so.

Ein Schnittstellenvertrag beantwortet vier Fragen:

| Frage | Beispiel: Rechercheur → Verfasser |
|---|---|
| **Welche Felder?** | `thema`, `quellen`, `kernaussagen` |
| **Welche Pflicht?** | `thema` und `kernaussagen` immer, `quellen` darf leer sein |
| **Welches Format je Feld?** | `quellen` ist eine Liste von Adressen, `kernaussagen` eine Liste von Sätzen |
| **Was bei Verstoß?** | Der Verfasser lehnt ab und meldet, statt zu raten |

Die vierte Frage wird am häufigsten vergessen — und sie ist die wichtigste.

## Warum Modelle besonders strenge Verträge brauchen

Zwischen zwei gewöhnlichen Programmen hält ein Vertrag fast von selbst: Das
eine Programm liefert jedes Mal exakt dieselbe Form. Ein Modell nicht. Es
liefert **meistens** die vereinbarte Form — und manchmal ein Feld zu viel,
eines zu wenig, oder einen freundlichen Satz vor dem JSON („Gerne, hier ist
das Ergebnis:"). Das ist die Wahlfreiheit aus Stufe 1, an der falschen Stelle.

Deshalb gilt für jede Übergabe, an der ein Modell beteiligt ist:

> **Prüfen, bevor weitergegeben wird.** Nicht der Empfänger soll raten müssen,
> sondern der Absender wird zurückgewiesen.

```aufgabe
id: E4-08
typ: denkaufgabe
titel: "Wer prüft?"
punkte: 25
frage: "Ein Modell liefert seine Ergebnisse als JSON an ein Programm, das Rechnungen schreibt. Wo sollte geprüft werden, ob das JSON dem Vertrag entspricht?"
mehrfach: true
optionen:
  - "Direkt nach der Ausgabe des Modells, bevor es weitergegeben wird"
  - "Gar nicht, das Modell hält sich an die Anweisung"
  - "Beim Empfänger, bevor er eine Rechnung schreibt"
  - "Einmal im Monat in einer Stichprobe"
loesung:
  - "Direkt nach der Ausgabe des Modells, bevor es weitergegeben wird"
  - "Beim Empfänger, bevor er eine Rechnung schreibt"
richtzeit_s: 60
erklaerung: |
  Am besten an beiden Enden: Der Absender weist ab, was er nicht liefern
  sollte, und der Empfänger nimmt nichts an, was er nicht versteht. Eine
  Stichprobe ersetzt das nicht - sie findet den Fehler erst nach der
  falschen Rechnung.
```

## Ein Vertrag, aufgeschrieben

Verträge schreibt man auf, damit beide Seiten dasselbe meinen. Für JSON gibt
es dafür eine eigene Form (*JSON Schema*), aber für den Anfang reicht eine
klare Tabelle — und ein **Beispiel**, wie in Stufe 2: Ein Beispiel zeigt die
Form deutlicher als jede Beschreibung.

```json
{
  "thema": "Ladezeiten von Elektroautos",
  "kernaussagen": ["Schnellladen dauert meist 20 bis 40 Minuten."],
  "quellen": []
}
```

```aufgabe
id: E4-09
typ: technisch
titel: "Liefere nach Vertrag"
punkte: 35
frage: "Schreibe ein gültiges JSON nach dem Vertrag oben: Thema „Wärmepumpen im Altbau“, mindestens eine Kernaussage, die Quellen dürfen leer sein. Die drei Schlüssel thema, kernaussagen und quellen müssen vorhanden sein."
pruefer: json_gueltig
schluessel: [thema, kernaussagen, quellen]
richtzeit_s: 180
hinweise:
  - text: "Nimm das Beispiel oben als Vorlage und tausche nur die Werte aus. Eine leere Liste schreibt man []."
    kostet: 5
erklaerung: |
  Ein gültiges Beispiel:
  {"thema": "Wärmepumpen im Altbau", "kernaussagen": ["Oft reichen größere Heizkörper."], "quellen": []}
  Fehlt ein Schlüssel, bricht der Vertrag - auch wenn der Inhalt gut ist.
```

## Was ein Vertrag nicht regelt

Ein Vertrag sagt, **welche Form** die Daten haben. Er sagt nicht, ob sie
**stimmen**. Eine Kernaussage kann formal korrekt und inhaltlich erfunden sein.
Dafür braucht es die Quellenkritik aus Stufe 2 — oder, im System, einen
Prüfer aus Lektion 2.

```aufgabe
id: E4-10
typ: uebereinstimmung
titel: "Form oder Inhalt?"
punkte: 25
frage: "Ordne jedem Problem zu, wer es findet."
links:
  - "Das Feld kernaussagen fehlt"
  - "Eine Kernaussage behauptet etwas Falsches"
  - "Das Datum steht als 3.11.26 statt 2026-11-03"
  - "Eine Quelle existiert nicht"
rechts:
  - "Die Vertragsprüfung: Pflichtfeld"
  - "Ein inhaltlicher Prüfer"
  - "Die Vertragsprüfung: Format"
  - "Ein inhaltlicher Prüfer, der die Quelle aufruft"
loesung:
  "Das Feld kernaussagen fehlt": "Die Vertragsprüfung: Pflichtfeld"
  "Eine Kernaussage behauptet etwas Falsches": "Ein inhaltlicher Prüfer"
  "Das Datum steht als 3.11.26 statt 2026-11-03": "Die Vertragsprüfung: Format"
  "Eine Quelle existiert nicht": "Ein inhaltlicher Prüfer, der die Quelle aufruft"
richtzeit_s: 80
erklaerung: |
  Form prüft eine Regel, schnell und kostenlos. Inhalt prüft ein Prüfer, der
  nachsieht. Beides zusammen macht eine Übergabe verlässlich - eines allein
  nicht.
```
