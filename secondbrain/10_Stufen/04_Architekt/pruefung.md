---
type: exam
title: "Abschlussprüfung — Stufe 4 ARCHITEKT"
description: "Sechs Aufgaben zu Mustern, Schnittstellen, Zustand, Aufsicht und Ausfall. 60 % zum Bestehen."
tags:
  - exam
  - stufe-4
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 4
---

# Abschlussprüfung — ARCHITEKT

Sechs Aufgaben, **200 Punkte**, zum Bestehen 60 % — also 120.

```aufgabe
id: P4-01
typ: uebereinstimmung
titel: "Drei Muster"
punkte: 30
frage: "Ordne jedem Muster seine Beschreibung zu."
links:
  - "Kette"
  - "Dirigent"
  - "Prüfer"
rechts:
  - "Jeder gibt sein Ergebnis an den nächsten weiter"
  - "Einer verteilt Teilaufgaben und setzt die Ergebnisse zusammen"
  - "Einer erzeugt, ein zweiter prüft und schickt zurück"
loesung:
  Kette: "Jeder gibt sein Ergebnis an den nächsten weiter"
  Dirigent: "Einer verteilt Teilaufgaben und setzt die Ergebnisse zusammen"
  Prüfer: "Einer erzeugt, ein zweiter prüft und schickt zurück"
erklaerung: |
  Kette, Dirigent, Prüfer - die drei Grundformen mehrerer Agenten.
```

```aufgabe
id: P4-02
typ: plugplay
titel: "Wiederholen oder nicht?"
punkte: 30
frage: "Bei welchen Statuscodes lohnt sich eine Wiederholung nach einer Wartezeit?"
bausteine:
  - "500"
  - "403"
  - "503"
  - "404"
  - "429"
loesung:
  - "500"
  - "503"
  - "429"
erklaerung: |
  5xx sind vorübergehende Probleme des Dienstes, 429 heißt „langsamer".
  403 und 404 bleiben, wie sie sind.
```

```aufgabe
id: P4-03
typ: denkaufgabe
titel: "Das vergessliche System"
punkte: 30
frage: "Ein Agent bestellt jede Nacht Material nach, und manchmal wird dasselbe zweimal bestellt. Was fehlt am wahrscheinlichsten?"
optionen:
  - "Ein größeres Kontextfenster"
  - "Ein Zustand, in dem steht, was schon bestellt ist, und idempotente Bestellungen"
  - "Ein freundlicherer Systemprompt"
  - "Eine höhere Temperatur"
loesung: "Ein Zustand, in dem steht, was schon bestellt ist, und idempotente Bestellungen"
erklaerung: |
  Ein Modell erinnert sich an nichts. Das System muss wissen, was erledigt
  ist, und eine Bestellung darf bei Wiederholung nicht doppelt ausgeführt
  werden.
```

```aufgabe
id: P4-04
typ: uebereinstimmung
titel: "Aufsicht"
punkte: 30
frage: "Ordne jedem Schritt die passende Aufsicht zu."
links:
  - "Einem Mitarbeiter kündigen"
  - "Interne Notizen ablegen"
  - "Täglich 5.000 Bildbeschreibungen erzeugen"
rechts:
  - "Vorher freigeben"
  - "Nachher prüfen"
  - "Stichprobe"
loesung:
  "Einem Mitarbeiter kündigen": "Vorher freigeben"
  "Interne Notizen ablegen": "Nachher prüfen"
  "Täglich 5.000 Bildbeschreibungen erzeugen": "Stichprobe"
erklaerung: |
  Folgenreich und unumkehrbar heißt vorher. Leicht zu korrigieren heißt
  nachher. Große Mengen heißen Stichprobe.
```

```aufgabe
id: P4-05
typ: technisch
titel: "Ein Vertrag, erfüllt"
punkte: 30
frage: "Schreibe ein gültiges JSON für die Übergabe einer Anmeldung mit den Schlüsseln name, kurs und plaetze_frei (eine Zahl)."
pruefer: json_gueltig
schluessel: [name, kurs, plaetze_frei]
erklaerung: |
  Zum Beispiel: {"name": "Ada", "kurs": "Yoga", "plaetze_frei": 3}
```

```aufgabe
id: P4-06
typ: planung
titel: "Ein Entwurf, begründet"
punkte: 50
frage: "Entwirf in mindestens 80 Wörtern ein System aus mindestens drei Teilen, das Reklamationen in einem Onlineshop bearbeitet. Nenne, wer welche Entscheidung trifft, wo ein Mensch freigibt und was bei einem Ausfall passiert."
pruefungen:
  - art: mindestens_woerter
    wert: 80
    punkte: 10
    begruendung: "Mindestens 80 Wörter."
  - art: enthaelt_eines
    werte: [entscheidet, zuständig, besitzer]
    punkte: 10
    begruendung: "Du sagst, wer welche Entscheidung trifft."
  - art: enthaelt_eines
    werte: [freigabe, freigeben, mensch, bestätigt]
    punkte: 10
    begruendung: "Du legst eine Freigabe fest."
  - art: enthaelt_eines
    werte: [ausfall, fällt aus, antwortet nicht, zeitgrenze]
    punkte: 10
    begruendung: "Du regelst den Ausfall."
  - art: enthaelt_eines
    werte: [zustand, datenbank, liste, gespeichert, akte]
    punkte: 10
    begruendung: "Du sagst, wo der Zustand liegt."
erklaerung: |
  Entscheidung, Freigabe, Ausfall und Zustand - wer diese vier festlegt, hat
  ein System entworfen und nicht nur eine Idee.
```
