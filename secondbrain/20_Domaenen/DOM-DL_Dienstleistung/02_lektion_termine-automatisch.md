---
type: lesson
title: "Termine automatisch"
description: "Online-Buchung, Puffer, Erinnerung: Terminvergabe ist fast reine Regelarbeit. Wer die Regeln sauber festlegt, spart jeden Tag eine Stunde Telefon."
tags:
  - lesson
  - domaene
  - dom-dl
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 14
---

# Termine automatisch

## Terminvergabe ist Regelarbeit

Ein Buchungssystem braucht kein Sprachmodell. Es braucht **Regeln**: Wann ist
geöffnet? Wie lange dauert welche Leistung? Wie viel Puffer liegt zwischen zwei
Terminen? Wer darf was buchen?

Das ist die Lehre aus Stufe 3: Was sich vollständig als Regel aufschreiben
lässt, gehört in eine Regel. Sie ist schneller, billiger und irrt nie
zufällig.

```aufgabe
id: D2-03
typ: mathe
titel: "Wie viele Termine passen hinein?"
punkte: 25
frage: "Ein Betrieb arbeitet von 8 bis 17 Uhr mit einer Stunde Mittagspause. Eine Leistung dauert 45 Minuten, danach kommen 15 Minuten Puffer. Wie viele Termine passen an einem Tag hinein?"
loesung: 8
toleranz: 0
einheit: "Termine"
richtzeit_s: 80
hinweise:
  - text: "Erst die Arbeitszeit in Minuten, dann durch die Länge eines Termins samt Puffer teilen."
    kostet: 5
erklaerung: |
  9 Stunden minus 1 Stunde Pause sind 8 Stunden, also 480 Minuten. Ein
  Termin mit Puffer braucht 60 Minuten. 480 / 60 = 8 Termine. Ohne Puffer
  wären es rechnerisch zehn - und jeder Verzug schiebt sich durch den Tag.
```

## Der Weg einer Buchung

```aufgabe
id: D2-04
typ: schiebe
titel: "Von der Leistung zur Erinnerung"
punkte: 25
frage: "Bring die Schritte einer Online-Buchung in die richtige Reihenfolge."
bausteine:
  - "System schickt die Bestätigung"
  - "Kundin wählt die Leistung"
  - "System schickt 24 Stunden vorher eine Erinnerung"
  - "System zeigt die freien Zeiten für diese Leistung"
  - "Kundin bucht einen Termin"
loesung:
  - "Kundin wählt die Leistung"
  - "System zeigt die freien Zeiten für diese Leistung"
  - "Kundin bucht einen Termin"
  - "System schickt die Bestätigung"
  - "System schickt 24 Stunden vorher eine Erinnerung"
richtzeit_s: 60
erklaerung: |
  Die Leistung kommt zuerst, weil von ihr die Dauer abhängt - und damit,
  welche Zeiten überhaupt frei sind. Bestätigung und Erinnerung sind Routine,
  die ohne Menschen läuft.
```

## Wenn niemand kommt

Termine, zu denen niemand erscheint, kosten Dienstleister viel Geld. Die
wirksamsten Mittel sind unspektakulär: eine Erinnerung und ein einfacher Weg,
abzusagen. Wer einen Termin mit einem Klick absagen kann, sagt ab, statt
einfach wegzubleiben, und der Termin lässt sich neu vergeben.

```aufgabe
id: D2-05
typ: denkaufgabe
titel: "Die leeren Termine"
punkte: 25
frage: "In einer Praxis erscheinen 12 Prozent der gebuchten Termine nicht. Was hilft am ehesten, ohne die Kundschaft zu verärgern?"
optionen:
  - "Eine Erinnerung vor dem Termin, mit einem Link zum einfachen Absagen oder Verschieben."
  - "Wer einmal fehlt, wird automatisch für alle Buchungen gesperrt."
  - "Das Modell sagt voraus, wer fehlen wird, und diese Personen bekommen keine Termine mehr."
  - "Jeden Termin doppelt vergeben."
loesung: "Eine Erinnerung vor dem Termin, mit einem Link zum einfachen Absagen oder Verschieben."
richtzeit_s: 60
erklaerung: |
  Erinnerung und einfache Absage lösen das Problem an der Ursache.
  Automatische Sperren und Vorhersagen über einzelne Menschen sind
  Entscheidungen über Personen ohne Prüfung - genau das, wovor Art. 22 DSGVO
  schützt (Stufe 5). Doppelt vergeben verärgert alle, die doch kommen.
```
