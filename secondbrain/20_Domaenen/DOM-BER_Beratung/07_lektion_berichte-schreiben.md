---
type: lesson
title: "Berichte schreiben"
description: "Die Antwort zuerst, die Gründe danach, die Belege zuletzt. Das Modell entwirft, du entscheidest, was stehen bleibt."
tags:
  - lesson
  - domaene
  - dom-ber
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 15
---

# Berichte schreiben

## Die Antwort zuerst

Ein Kunde liest von einem Bericht oft nur die erste Seite. Deshalb steht
dort nicht die Einleitung, sondern **die Antwort auf die Kernfrage** aus
Lektion 3. Erst danach kommen die Gründe, und erst danach die Belege. Diese
Ordnung heißt **Pyramidenprinzip**: oben die Spitze, darunter das, was sie
trägt.

| Ebene | Inhalt | Beispiel |
|---|---|---|
| Spitze | die Antwort | „Den Außendienst Nord bis Mitte 2027 auf Telefon umstellen.“ |
| Gründe | drei bis fünf Stützen | Fahrzeiten, Auftragsgrößen, Abbruchquote |
| Belege | Zahlen und Quellen | die Materialliste aus Lektion 4, die Rechnungen aus Lektion 5 |

```aufgabe
id: D5-17
typ: schiebe
titel: "Die Pyramide bauen"
punkte: 25
frage: "In welcher Reihenfolge stehen diese Teile in einem Bericht nach dem Pyramidenprinzip?"
bausteine:
  - "Tabelle mit den Fahrzeiten 2023 bis 2025"
  - "Empfehlung: Außendienst Nord auf Telefonvertrieb umstellen"
  - "Grund: Die Fahrzeiten sind um ein Drittel gestiegen"
loesung:
  - "Empfehlung: Außendienst Nord auf Telefonvertrieb umstellen"
  - "Grund: Die Fahrzeiten sind um ein Drittel gestiegen"
  - "Tabelle mit den Fahrzeiten 2023 bis 2025"
richtzeit_s: 50
erklaerung: |
  Antwort, Grund, Beleg. Wer nur die erste Zeile liest, weiß, was zu tun
  ist. Wer zweifelt, findet darunter die Gründe und ganz unten die Zahlen.
```

## Was das Modell dabei tun darf

Ein Modell ist ein guter Entwurfsschreiber, wenn es das richtige Material
bekommt: die Auftragsklärung, die geprüfte Materialliste, die gerechneten
Zahlen. Bekommt es nur ein Thema, schreibt es einen Bericht, der klingt wie
jeder andere — und füllt Lücken mit Erfundenem.

Drei Regeln für den Berichtsentwurf:

1. **Nur aus geprüftem Material.** Das Modell bekommt die Materialliste,
   nicht das offene Netz.
2. **Keine neuen Zahlen.** Jede Zahl im Entwurf muss in der Materialliste
   oder in deiner Rechnung stehen. Das kann eine Regel prüfen.
3. **Unsicherheit bleibt sichtbar.** Wo die Daten dünn sind, steht das im
   Bericht. Ein Modell glättet so etwas gern weg.

```aufgabe
id: D5-18
typ: denkaufgabe
titel: "Die neue Zahl im Entwurf"
punkte: 25
frage: "Im Berichtsentwurf des Modells steht: „Branchenweit sinken die Kosten je Abschluss im Telefonvertrieb um 30 Prozent.“ In deiner Materialliste steht diese Zahl nicht. Was tust du?"
optionen:
  - "Stehen lassen, sie klingt plausibel."
  - "Streichen oder eine geprüfte Quelle suchen, bevor sie bleibt."
  - "Auf 25 Prozent abrunden, um vorsichtig zu sein."
  - "Das Modell fragen, woher es die Zahl hat, und der Antwort glauben."
loesung: "Streichen oder eine geprüfte Quelle suchen, bevor sie bleibt."
richtzeit_s: 50
erklaerung: |
  Eine Zahl ohne Beleg ist im Bericht eine Behauptung unter deinem Namen.
  Abrunden macht sie nicht wahrer, und die Antwort des Modells auf
  „Woher?“ entsteht genauso wie die Zahl selbst.
```

## Die Zusammenfassung für die Geschäftsführung

```aufgabe
id: D5-19
typ: planung
titel: "Eine Seite für die Chefin"
punkte: 40
frage: "Schreibe die Zusammenfassung eines erdachten Berichts für die Geschäftsführung. Sie beginnt mit der Empfehlung, nennt mindestens einen Grund und sagt offen, wo eine Unsicherheit bleibt. Zwischen 40 und 150 Wörtern."
pruefungen:
  - art: mindestens_woerter
    wert: 40
    punkte: 10
    begruendung: "Mindestens 40 Wörter."
  - art: hoechstens_woerter
    wert: 150
    punkte: 10
    begruendung: "Höchstens 150 Wörter — sie passt auf eine Seite."
  - art: enthaelt_eines
    werte: [empfehl, wir raten, sollte, sollten]
    punkte: 10
    begruendung: "Du sprichst eine Empfehlung aus."
  - art: enthaelt_eines
    werte: [unsicher, offen, nicht belegt, annahme, vorbehalt, risiko, unklar]
    punkte: 10
    begruendung: "Du benennst eine Unsicherheit."
richtzeit_s: 480
erklaerung: |
  Die Grenze nach oben ist Absicht: Wer die Antwort nicht in 150 Wörtern
  sagen kann, hat sie noch nicht. Und die benannte Unsicherheit ist kein
  Zeichen von Schwäche - sie ist das, was einen Bericht von Werbung
  unterscheidet.
```
