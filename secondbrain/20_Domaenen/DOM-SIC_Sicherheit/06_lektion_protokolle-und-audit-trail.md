---
type: lesson
title: "Protokolle und Audit-Trail"
description: "Wer hat wann was getan, und mit welchem Ergebnis? Ein gutes Protokoll beantwortet das, ohne selbst zum Leck zu werden. Eine Hashkette macht sichtbar, wenn jemand nachträglich etwas ändert."
tags:
  - lesson
  - domaene
  - dom-sic
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 16
---

# Protokolle und Audit-Trail

## Was hineingehört

In Lektion 5 war das Protokoll eine der wirksamen Maßnahmen. Ein
**Audit-Trail** ist ein Protokoll, auf das man sich verlassen kann: Es hält
fest, wer wann was getan hat, auch und gerade bei KI-Agenten. Aber ein
Protokoll kann selbst zum Leck werden, wenn zu viel darin steht.

```aufgabe
id: D7-13
typ: plugplay
titel: "Ein guter Protokolleintrag"
punkte: 25
frage: "Was gehört in den Protokolleintrag, wenn ein KI-Agent eine Rechnung ablegt?"
bausteine:
  - "Zeitpunkt"
  - "Welcher Agent mit welchem Konto gehandelt hat"
  - "Welche Aktion an welcher Datei"
  - "Ergebnis und gegebenenfalls wer freigegeben hat"
  - "Das vollständige Passwort des Postfachs"
  - "Der gesamte Inhalt jeder gelesenen Mail"
loesung:
  - "Zeitpunkt"
  - "Welcher Agent mit welchem Konto gehandelt hat"
  - "Welche Aktion an welcher Datei"
  - "Ergebnis und gegebenenfalls wer freigegeben hat"
richtzeit_s: 70
erklaerung: |
  Wer, wann, was, mit welchem Ergebnis - das reicht, um jeden Vorgang
  nachzuvollziehen. Passwörter und ganze Mailinhalte machen aus dem Protokoll
  ein Ziel für Angreifer und eine Sammlung personenbezogener Daten.
```

## Die Hashkette

Ein Protokoll nützt nur, wenn niemand es heimlich ändern kann. Ein bewährter
Weg ist die **Hashkette**: Jeder Eintrag bekommt einen Fingerabdruck (Hash,
Stufe 5), der aus seinem Inhalt **und** dem Fingerabdruck des vorigen
Eintrags berechnet wird. Ändert jemand einen alten Eintrag, passt sein
Fingerabdruck nicht mehr, und mit ihm keiner der folgenden.

```aufgabe
id: D7-14
typ: technisch
titel: "Ein Fingerabdruck"
punkte: 30
frage: "Bilde den SHA-256-Hash der Zeichenkette Rechnung 2026-117 freigegeben (genau so, mit den zwei Leerzeichen, ohne Zeilenumbruch) und gib ihn in Kleinbuchstaben als Hex an."
pruefer: sha256_von
eingabe: "Rechnung 2026-117 freigegeben"
richtzeit_s: 240
hinweise:
  - text: "In der Kommandozeile: echo -n \"Rechnung 2026-117 freigegeben\" | sha256sum. Ohne -n hasht du einen Zeilenumbruch mit."
    kostet: 8
  - text: "In Python: hashlib.sha256(\"Rechnung 2026-117 freigegeben\".encode()).hexdigest()"
    kostet: 8
erklaerung: |
  Ein einziges geändertes Zeichen - etwa „2026-118“ - ergibt einen völlig
  anderen Hash. Genau das macht die Kette fälschungssicher: Niemand kann
  einen Eintrag ändern, ohne dass die Prüfsummen auseinanderlaufen.
```

```aufgabe
id: D7-15
typ: denkaufgabe
titel: "Eintrag 17 wird geändert"
punkte: 25
frage: "In einem Protokoll mit Hashkette ändert jemand nachträglich Eintrag 17 von 40. Was zeigt die Prüfung der Kette?"
optionen:
  - "Ab Eintrag 17 passen die Fingerabdrücke nicht mehr, die Änderung fällt auf."
  - "Nichts, solange die Änderung klein ist."
  - "Nur Eintrag 17 fällt auf, die anderen bleiben in Ordnung."
  - "Die Kette repariert sich selbst."
loesung: "Ab Eintrag 17 passen die Fingerabdrücke nicht mehr, die Änderung fällt auf."
richtzeit_s: 60
erklaerung: |
  Jeder Fingerabdruck hängt am vorigen. Wer Eintrag 17 ändert, müsste alle
  folgenden neu berechnen - und genau das fällt auf, wenn der letzte
  Fingerabdruck zusätzlich an einem zweiten, sicheren Ort liegt.
```
