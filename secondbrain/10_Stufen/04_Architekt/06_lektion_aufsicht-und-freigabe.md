---
type: lesson
title: "Aufsicht und Freigabe"
description: "Wo ein Mensch im System sitzt, was jeder Agent darf — und warum das Recht zum Handeln enger sein muss als das Recht zum Vorschlagen."
tags:
  - lesson
  - stufe-4
  - aufsicht
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 4
dauer_min: 15
---

# Aufsicht und Freigabe

## Der Mensch ist ein Bauteil

In Lektion 1 hast du die Freigabe im Diagramm gefunden: der letzte Punkt, bevor
etwas nach außen geht. In Stufe 3 war „einen Menschen fragen" eine von drei
Antworten auf einen Fehler. Jetzt wird daraus ein Grundsatz für ganze Systeme:

> **Ein System entscheidet nicht, ob ein Mensch eingreifen darf. Es wird so
> gebaut, dass er es an den richtigen Stellen muss.**

Die richtigen Stellen sind die, an denen etwas **unumkehrbar** wird oder
**Folgen für Menschen** hat — das Kriterium aus Stufe 1, Lektion 5.

## Drei Stufen der Aufsicht

| Stufe | Der Mensch … | Passt für |
|---|---|---|
| **Vorher freigeben** | entscheidet, bevor gehandelt wird | Zahlungen, Kündigungen, alles nach außen |
| **Nachher prüfen** | sieht sich an, was passiert ist, und kann zurücknehmen | Ablage, interne Entwürfe |
| **Stichprobe** | sieht sich regelmäßig einen Teil an | große Mengen folgenloser Schritte |

Mehr Aufsicht ist nicht immer besser. Ein Mensch, der hundert Freigaben am Tag
klicken soll, klickt irgendwann blind — dann ist die Freigabe nur noch ein
Stempel. **Aufsicht muss dort sitzen, wo sie zählt, und nur dort.**

```aufgabe
id: E4-14
typ: uebereinstimmung
titel: "Welche Aufsicht passt?"
punkte: 30
frage: "Ordne jedem Schritt die passende Form der Aufsicht zu."
links:
  - "Eine Überweisung an einen Lieferanten ausführen"
  - "Eingehende Rechnungen in Ordner sortieren"
  - "Täglich 2.000 Produktbeschreibungen übersetzen"
rechts:
  - "Vorher freigeben"
  - "Nachher prüfen"
  - "Stichprobe"
loesung:
  "Eine Überweisung an einen Lieferanten ausführen": "Vorher freigeben"
  "Eingehende Rechnungen in Ordner sortieren": "Nachher prüfen"
  "Täglich 2.000 Produktbeschreibungen übersetzen": "Stichprobe"
richtzeit_s: 70
erklaerung: |
  Geld ist weg, wenn es weg ist - also vorher. Eine falsch abgelegte Datei
  lässt sich verschieben - also nachher. Und 2.000 Texte am Tag kann niemand
  einzeln lesen - also eine Stichprobe, die groß genug ist.
```

## Was jeder Agent darf

Die zweite Hälfte der Aufsicht steckt nicht im Menschen, sondern in den
**Rechten**. Jeder Agent bekommt nur die Werkzeuge, die er für seine Aufgabe
braucht — das kennst du aus Stufe 3 als Werkzeugbeschreibung und aus Lektion 3
als Methode: Wer nur lesen soll, bekommt nur `GET`.

Der Grundsatz heißt in der Sicherheit *Least Privilege*, das geringste
nötige Recht, und Stufe 5 vertieft ihn. Für den Entwurf reicht eine Frage je
Agent: **Was ist das Schlimmste, das er mit seinen Rechten anrichten kann?**
Ist die Antwort unangenehm, sind die Rechte zu weit.

```aufgabe
id: E4-15
typ: denkaufgabe
titel: "Zu viele Rechte"
punkte: 25
frage: "Ein Agent soll Kundenanfragen zusammenfassen. Welche Rechte braucht er?"
mehrfach: true
optionen:
  - "Anfragen lesen"
  - "Anfragen löschen"
  - "Eine Zusammenfassung in eine Notiz schreiben"
  - "Mails im Namen der Firma versenden"
loesung:
  - "Anfragen lesen"
  - "Eine Zusammenfassung in eine Notiz schreiben"
richtzeit_s: 60
erklaerung: |
  Lesen und eine Notiz schreiben - mehr braucht er nicht. Löschen und
  Versenden wären Rechte, deren Missbrauch (durch einen Fehler oder einen
  eingeschleusten Text) echten Schaden anrichtet, ohne dass die Aufgabe sie
  je verlangt hätte.
```

## Die Freigabe gut bauen

Eine Freigabe ist nur so gut wie das, was der Mensch dabei sieht. Die Regeln aus
Stufe 3, Lektion 7 gelten weiter — worum geht es, warum wird gefragt, was soll
entschieden werden —, und zwei kommen im System dazu:

1. **Der Mensch sieht, was wirklich ausgeführt wird**, nicht eine Beschreibung
   davon. Also den Betrag und den Empfänger, nicht „eine Zahlung".
2. **Ohne Antwort passiert nichts.** Eine Freigabe, die nach einer Stunde von
   selbst als „ja" gilt, ist keine.

```aufgabe
id: E4-16
typ: plugplay
titel: "Eine ehrliche Freigabe"
punkte: 25
frage: "Wähle die Eigenschaften, die eine Freigabe für eine Zahlung haben muss."
bausteine:
  - "Sie zeigt Betrag, Empfänger und Verwendungszweck"
  - "Sie gilt nach 60 Minuten ohne Antwort als erteilt"
  - "Ohne ausdrückliches Ja wird nichts ausgeführt"
  - "Sie zeigt nur „Bitte Zahlung prüfen“"
  - "Sie nennt den Grund, warum gefragt wird"
loesung:
  - "Sie zeigt Betrag, Empfänger und Verwendungszweck"
  - "Ohne ausdrückliches Ja wird nichts ausgeführt"
  - "Sie nennt den Grund, warum gefragt wird"
richtzeit_s: 70
erklaerung: |
  Wer freigibt, muss sehen, was er freigibt, und wissen, warum er gefragt
  wird. Eine stillschweigende Zustimmung nach Zeitablauf macht aus der
  Freigabe einen Wecker.
```
