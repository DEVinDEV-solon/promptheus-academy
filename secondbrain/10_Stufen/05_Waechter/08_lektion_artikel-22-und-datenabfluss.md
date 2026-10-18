---
type: lesson
title: "Artikel 22 und der Weg zum Modell"
description: "Wann eine Maschine nicht allein über Menschen entscheiden darf — und was passiert, wenn personenbezogene Daten an einen Modellanbieter gehen."
tags:
  - lesson
  - stufe-5
  - datenschutz
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 5
dauer_min: 18
---

# Artikel 22 und der Weg zum Modell

> Auch diese Lektion ist keine Rechtsberatung. Sie zeigt, an welchen Stellen
> ein Entwurf rechtlich heikel wird, damit du dort nachfragst.

## Artikel 22: keine Entscheidung allein durch die Maschine

In Stufe 1, Lektion 5 hast du zwischen folgenlosen und folgenreichen
Entscheidungen unterschieden. Die DSGVO zieht an genau dieser Stelle eine
Grenze. Artikel 22 sagt sinngemäß:

> Eine Person hat das Recht, **nicht einer ausschließlich automatisierten
> Entscheidung** unterworfen zu werden, die ihr gegenüber **rechtliche Wirkung**
> entfaltet oder sie in ähnlicher Weise **erheblich beeinträchtigt**.

Drei Merkmale müssen zusammenkommen:

| Merkmal | Beispiel |
|---|---|
| **Ausschließlich automatisiert** | Kein Mensch prüft inhaltlich, bevor die Entscheidung wirkt |
| **Eine Entscheidung** | Nicht nur eine Empfehlung, sondern etwas, das gilt |
| **Erhebliche Wirkung** | Kredit abgelehnt, Bewerbung aussortiert, Vertrag gekündigt |

Es gibt Ausnahmen — wenn die Entscheidung für einen Vertrag erforderlich ist,
ein Gesetz sie erlaubt oder die Person ausdrücklich eingewilligt hat. Aber auch
dann muss der Verantwortliche Schutzmaßnahmen treffen, mindestens: **Die Person
kann verlangen, dass ein Mensch eingreift, ihren Standpunkt darlegen und die
Entscheidung anfechten.**

```aufgabe
id: E5-21
typ: plugplay
titel: "Fällt das unter Artikel 22?"
punkte: 30
frage: "Wähle die Fälle, in denen eine ausschließlich automatisierte Entscheidung mit erheblicher Wirkung vorliegt."
bausteine:
  - "Ein System lehnt Kreditanträge unter einem Punktwert automatisch ab, niemand sieht sie an"
  - "Ein Modell sortiert Mails in Ordner, ein Mensch liest alle"
  - "Bewerbungen ohne bestimmte Stichworte werden automatisch abgesagt"
  - "Ein Modell schlägt eine Absage vor, die Personalleiterin prüft jeden Fall und entscheidet"
  - "Ein Shop zeigt je nach Wetter andere Startbilder"
loesung:
  - "Ein System lehnt Kreditanträge unter einem Punktwert automatisch ab, niemand sieht sie an"
  - "Bewerbungen ohne bestimmte Stichworte werden automatisch abgesagt"
richtzeit_s: 90
hinweise:
  - text: "Prüfe alle drei Merkmale: ausschließlich automatisiert, eine Entscheidung, erhebliche Wirkung."
    kostet: 6
erklaerung: |
  Kreditablehnung und automatische Absage erfüllen alle drei Merkmale. Beim
  Vorschlag mit menschlicher Prüfung entscheidet ein Mensch. Mails sortieren
  und Startbilder haben keine erhebliche Wirkung.
```

## Der Mensch muss wirklich entscheiden

Eine häufige Umgehung ist der **Stempel-Mensch**: Formal klickt jemand auf
„bestätigen", aber er sieht nur die Empfehlung, hat keine Zeit und übernimmt
sie jedes Mal. Das ist im Sinne der Vorschrift keine menschliche Entscheidung.
Eine echte Prüfung heißt: Der Mensch sieht die **Grundlage** der Entscheidung,
hat die **Befugnis**, anders zu entscheiden, und tut es auch, wenn es nötig ist.

Das ist dieselbe Lehre wie in Stufe 4: Aufsicht muss dort sitzen, wo sie zählt,
und sie muss echt sein — sonst ist sie Dekoration.

## Der Weg zum Modell

Jetzt die zweite Hälfte, und sie betrifft fast jede Automation in dieser
Academy: **Wenn ein Agent einen Text an ein Sprachmodell schickt, verlässt
dieser Text dein System.** Er geht an einen Anbieter, oft in einem anderen
Land. Steckt darin ein Name, eine Mail, eine Kundennummer, sind das
personenbezogene Daten, die an einen Dritten fließen.

Daraus folgen Fragen, die jeder Entwurf beantworten muss:

1. **Ist das nötig?** Datenminimierung aus Lektion 7: Muss der Name mit, oder
   reicht „die Kundin"?
2. **Wer ist der Anbieter, und wo verarbeitet er?** Bei Verarbeitung im Auftrag
   braucht es einen **Auftragsverarbeitungsvertrag** (Art. 28). Bei
   Verarbeitung außerhalb der EU gelten besondere Regeln für Übermittlungen in
   Drittländer.
3. **Was macht der Anbieter mit den Daten?** Speichert er sie? Nutzt er sie zum
   Training? Das steht in seinen Bedingungen — und muss vorher geprüft werden.
4. **Lässt es sich pseudonymisieren?** Namen und Nummern werden vor dem Versand
   durch Platzhalter ersetzt und nach der Antwort wieder eingesetzt.

```aufgabe
id: E5-22
typ: schiebe
titel: "Pseudonymisieren, Schritt für Schritt"
punkte: 30
frage: "Ein Agent soll eine Beschwerde von Frau Weber mit einem externen Modell beantworten. Bring die Schritte in eine datensparsame Reihenfolge."
bausteine:
  - "Die Antwort an den Agenten zurückgeben"
  - "Den pseudonymisierten Text an das Modell schicken"
  - "Name und Kundennummer durch Platzhalter wie [KUNDIN] und [NR] ersetzen"
  - "Die Platzhalter in der Antwort wieder durch die echten Angaben ersetzen"
loesung:
  - "Name und Kundennummer durch Platzhalter wie [KUNDIN] und [NR] ersetzen"
  - "Den pseudonymisierten Text an das Modell schicken"
  - "Die Platzhalter in der Antwort wieder durch die echten Angaben ersetzen"
  - "Die Antwort an den Agenten zurückgeben"
richtzeit_s: 80
erklaerung: |
  Ersetzt wird vor dem Versand, zurückgesetzt nach der Antwort - in deinem
  System. Das Modell sieht nie, um wen es geht, und kann trotzdem eine
  passende Antwort schreiben.
```

## Die Academy als Beispiel

Diese Academy sperrt in Kommentaren und Eingaben, die an Modelle gehen,
erkennbare Namen, Mailadressen und Nummern — du hast vielleicht schon einmal
„xxx" statt eines Namens gesehen. Das ist genau diese Lektion als Programm:
**Was nicht hinausgehen muss, geht nicht hinaus.**

```aufgabe
id: E5-23
typ: denkaufgabe
titel: "Was muss mit?"
punkte: 25
frage: "Ein Agent soll entscheiden, ob eine Kundenmail eine Beschwerde ist. Welche Angaben braucht das Modell dafür?"
optionen:
  - "Den Mailtext ohne Absender, Signatur und Kundennummer"
  - "Die komplette Mail mit allen Kopfzeilen"
  - "Den Mailtext und die Kundenakte, damit es mehr Zusammenhang hat"
  - "Den Namen der Kundin, damit es höflich bleiben kann"
loesung: "Den Mailtext ohne Absender, Signatur und Kundennummer"
richtzeit_s: 50
erklaerung: |
  Ob etwas eine Beschwerde ist, steht im Text. Absender, Signatur, Nummer und
  Akte ändern daran nichts - sie würden nur unnötig personenbezogene Daten an
  einen Dritten schicken.
```
