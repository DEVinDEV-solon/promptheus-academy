---
type: lesson
title: "Betrieb, Fehler, Wartung"
description: "Eine Lösung im Einsatz braucht Augen: Protokolle, Überwachung, ein Weg für Fehlermeldungen — und regelmäßige Pflege, weil sich die Welt um sie herum ändert."
tags:
  - lesson
  - stufe-6
  - betrieb
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 6
dauer_min: 16
---

# Betrieb, Fehler, Wartung

## Fertig ist der Anfang

Eine Lösung, die gebaut, getestet und von Menschen benutzt wird, ist **im
Betrieb**. Ab jetzt läuft sie, während du etwas anderes tust — und genau das
macht diesen Abschnitt schwierig: Probleme passieren, wenn niemand hinsieht.

Betrieb heißt deshalb vor allem: **dafür sorgen, dass du es merkst, wenn etwas
nicht stimmt** — bevor es die Nutzer merken.

## Drei Augen

| Auge | Frage | Beispiel |
|---|---|---|
| **Protokoll** | Was ist passiert? | „08:00 Termine gelesen: 4. 08:00 Nachricht gesendet." |
| **Überwachung** | Läuft es gerade? | Eine Meldung, wenn heute um 8:05 noch keine Nachricht raus ist |
| **Rückmeldeweg** | Was sagen die Nutzer? | Eine Adresse oder ein Knopf „Hier stimmt etwas nicht" |

Ein Protokoll, das niemand liest, hilft erst, wenn schon etwas passiert ist.
Die Überwachung meldet sich von selbst. Und der Rückmeldeweg fängt das, was
keine Maschine bemerkt: dass die Nachricht zwar kommt, aber Unsinn enthält.

Stufe 5 gilt auch hier: **Ins Protokoll gehört, was passiert ist — nicht das
Geheimnis und nicht mehr personenbezogene Daten als nötig.**

```aufgabe
id: E6-11
typ: uebereinstimmung
titel: "Welches Auge sieht es?"
punkte: 30
frage: "Ordne jedes Problem dem Auge zu, das es am ehesten bemerkt."
links:
  - "Die Nachricht wurde heute gar nicht gesendet"
  - "Seit dem Update fasst das Modell Termine falsch zusammen"
  - "Du willst wissen, warum letzten Dienstag ein Termin fehlte"
rechts:
  - "Die Überwachung"
  - "Der Rückmeldeweg der Nutzer"
  - "Das Protokoll"
loesung:
  "Die Nachricht wurde heute gar nicht gesendet": "Die Überwachung"
  "Seit dem Update fasst das Modell Termine falsch zusammen": "Der Rückmeldeweg der Nutzer"
  "Du willst wissen, warum letzten Dienstag ein Termin fehlte": "Das Protokoll"
richtzeit_s: 70
erklaerung: |
  Ein Ausfall fällt der Überwachung auf, falscher Inhalt den Menschen, und
  die Ursache im Nachhinein findet man im Protokoll. Jedes Auge sieht etwas,
  das die anderen übersehen.
```

## Wenn ein Fehler gemeldet wird

Ein guter Ablauf für Fehler ist kurz und immer gleich:

1. **Nachstellen.** Kannst du den Fehler selbst auslösen? Wenn nicht, fehlt dir
   noch eine Angabe.
2. **Test schreiben.** Ein Test, der genau diesen Fehler zeigt — er muss jetzt
   rot sein (Lektion 3).
3. **Beheben.** Bis der neue Test grün ist und alle alten auch.
4. **Sichern und ausrollen**, mit einer Beschreibung, die den Fehler nennt.

Schritt 2 ist der wichtigste und wird am häufigsten übersprungen. Ohne ihn
kommt derselbe Fehler bei der nächsten Änderung zurück, und niemand merkt es.

```aufgabe
id: E6-12
typ: schiebe
titel: "Ein Fehler, sauber behoben"
punkte: 30
frage: "Eine Nutzerin meldet: „Termine um Mitternacht fehlen in der Nachricht.“ Bring die Schritte in die richtige Reihenfolge."
bausteine:
  - "Einen Test schreiben, der einen Termin um 00:00 prüft und jetzt fehlschlägt"
  - "Den Fehler mit einem Termin um 00:00 selbst nachstellen"
  - "Den Code ändern, bis alle Tests grün sind"
  - "Den Stand sichern und die neue Fassung ausrollen"
loesung:
  - "Den Fehler mit einem Termin um 00:00 selbst nachstellen"
  - "Einen Test schreiben, der einen Termin um 00:00 prüft und jetzt fehlschlägt"
  - "Den Code ändern, bis alle Tests grün sind"
  - "Den Stand sichern und die neue Fassung ausrollen"
richtzeit_s: 75
erklaerung: |
  Nachstellen, festhalten, beheben, ausrollen. Mitternacht ist übrigens eine
  klassische Grenze - der Test bleibt für immer und schützt davor, dass
  der Fehler wiederkommt.
```

## Wartung: die Welt ändert sich

Auch eine Lösung ohne Fehler muss gepflegt werden, weil sich ihre Umgebung
ändert:

- Der **Modellanbieter** stellt ein Modell ein oder ändert es — Antworten
  werden anders, Preise auch. (Die Academy selbst musste eine Lektion ändern,
  weil ein Modell aus einem Werkzeug verschwand.)
- Eine **Schnittstelle** ändert ihre Felder — der Vertrag aus Stufe 4 bricht.
- **Bibliotheken** bekommen Sicherheitsupdates, die eingespielt werden müssen.
- **Zugänge** laufen ab oder müssen erneuert werden (Stufe 5, Lektion 4).

Deshalb gehört zu jeder Lösung im Betrieb ein **fester Wartungstermin** —
einmal im Monat oder im Quartal — mit einer kurzen Liste: Tests laufen lassen,
Protokolle durchsehen, Zugänge prüfen, Updates einspielen.

```aufgabe
id: E6-13
typ: plugplay
titel: "Auf die Wartungsliste"
punkte: 25
frage: "Was gehört auf die monatliche Wartungsliste einer Lösung, die ein externes Modell nutzt?"
bausteine:
  - "Alle automatischen Tests laufen lassen"
  - "Prüfen, ob das genutzte Modell angekündigt eingestellt wird"
  - "Den Code komplett neu schreiben"
  - "Prüfen, welche Zugänge bald ablaufen oder nicht mehr gebraucht werden"
  - "Die Protokolle auf Warnungen und Fehler durchsehen"
loesung:
  - "Alle automatischen Tests laufen lassen"
  - "Prüfen, ob das genutzte Modell angekündigt eingestellt wird"
  - "Prüfen, welche Zugänge bald ablaufen oder nicht mehr gebraucht werden"
  - "Die Protokolle auf Warnungen und Fehler durchsehen"
richtzeit_s: 70
erklaerung: |
  Wartung ist Hinsehen, nicht Neubauen. Wer jeden Monat zehn Minuten
  hinsieht, erlebt selten eine böse Überraschung - und wenn, dann früh.
```
