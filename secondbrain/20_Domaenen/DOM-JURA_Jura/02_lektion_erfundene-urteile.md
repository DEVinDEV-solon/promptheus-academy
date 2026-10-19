---
type: lesson
title: "Erfundene Urteile"
description: "Gericht, Datum, Aktenzeichen — alles plausibel, alles erfunden. Wie Modelle Fundstellen halluzinieren und wie du jedes Zitat prüfst, bevor es in einem Schreiben steht."
tags:
  - lesson
  - domaene
  - dom-jura
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 14
---

# Erfundene Urteile

## Der Fall, den alle kennen

2023 reichte eine Anwaltskanzlei in New York einen Schriftsatz ein, der sich
auf sechs Gerichtsentscheidungen stützte. Keine davon existierte. Ein
Sprachmodell hatte sie geliefert, samt Aktenzeichen und Zitaten. Das Gericht
verhängte eine Geldstrafe. Seitdem sind weltweit viele ähnliche Fälle bekannt
geworden, auch vor deutschen Gerichten fielen Schriftsätze mit erfundenen
Fundstellen auf.

Du kennst den Grund aus Stufe 1: Ein Modell sagt das wahrscheinlichste
nächste Wort vorher. Ein Aktenzeichen hat eine feste Form, also erzeugt es
eines in dieser Form, ob es existiert oder nicht.

```aufgabe
id: D6-03
typ: plugplay
titel: "Was ein prüfbares Zitat braucht"
punkte: 25
frage: "Welche Angaben machen ein Urteilszitat prüfbar?"
bausteine:
  - "Gericht"
  - "Datum der Entscheidung"
  - "Aktenzeichen"
  - "Randnummer der zitierten Stelle"
  - "Das Modell ist sich sicher"
  - "Das Zitat klingt plausibel"
loesung:
  - "Gericht"
  - "Datum der Entscheidung"
  - "Aktenzeichen"
  - "Randnummer der zitierten Stelle"
richtzeit_s: 60
erklaerung: |
  Mit Gericht, Datum und Aktenzeichen lässt sich die Entscheidung in einer
  Datenbank finden, mit der Randnummer die zitierte Stelle. Sicherheit und
  Plausibilität sind genau die Eigenschaften, die auch eine Erfindung hat.
```

## Jedes Zitat einmal in der Hand

Die Regel ist einfach und ohne Ausnahme: **Kein Zitat geht hinaus, das nicht
ein Mensch in der Originalquelle gesehen hat.** Das kostet ein paar Minuten
pro Fundstelle. Ein erfundenes Urteil in einem Schreiben kostet den Ruf.

```aufgabe
id: D6-04
typ: schiebe
titel: "Der Prüfweg eines Zitats"
punkte: 25
frage: "Bring die Schritte, mit denen du ein vom Modell genanntes Urteil prüfst, in die richtige Reihenfolge."
bausteine:
  - "Prüfen, ob die Entscheidung noch aktuell ist und nicht aufgehoben wurde"
  - "Die Entscheidung im Volltext öffnen"
  - "Erst dann das Zitat in das Schreiben übernehmen"
  - "Aktenzeichen in einer Rechtsprechungsdatenbank suchen"
  - "Die zitierte Aussage an der genannten Stelle finden"
loesung:
  - "Aktenzeichen in einer Rechtsprechungsdatenbank suchen"
  - "Die Entscheidung im Volltext öffnen"
  - "Die zitierte Aussage an der genannten Stelle finden"
  - "Prüfen, ob die Entscheidung noch aktuell ist und nicht aufgehoben wurde"
  - "Erst dann das Zitat in das Schreiben übernehmen"
richtzeit_s: 70
erklaerung: |
  Finden, öffnen, die Stelle lesen, Aktualität prüfen, übernehmen. Auch ein
  echtes Urteil kann falsch zitiert sein: Das Modell erfindet manchmal nur
  den Satz, nicht das Aktenzeichen.
```

```aufgabe
id: D6-05
typ: denkaufgabe
titel: "Nicht auffindbar"
punkte: 25
frage: "Das Modell nennt „BGH, Urteil vom 12.03.2021, Az. VIII ZR 999/20“. In keiner Datenbank ist es zu finden. Was tust du?"
optionen:
  - "Das Zitat als nicht belegt behandeln und streichen."
  - "Das Modell fragen, ob es sicher ist, und bei Ja übernehmen."
  - "Das Zitat übernehmen und „vgl.“ davorschreiben."
  - "Das Aktenzeichen leicht ändern, bis eines gefunden wird."
loesung: "Das Zitat als nicht belegt behandeln und streichen."
richtzeit_s: 50
erklaerung: |
  Fragt man ein Modell, ob seine Quelle echt ist, bestätigt es oft - das ist
  keine Prüfung. Was sich nicht finden lässt, existiert für dein Schreiben
  nicht. Ein „vgl.“ macht aus einer Erfindung keine Quelle.
```
