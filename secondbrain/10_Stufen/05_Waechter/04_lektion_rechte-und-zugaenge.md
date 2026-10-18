---
type: lesson
title: "Rechte und Zugänge"
description: "Das geringste nötige Recht, getrennte Schlüssel je Aufgabe und warum ein Zugang, den niemand mehr braucht, ein offenes Fenster ist."
tags:
  - lesson
  - stufe-5
  - sicherheit
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 5
dauer_min: 15
---

# Rechte und Zugänge

## Die Frage aus Stufe 4, jetzt als Regel

In Stufe 4, Lektion 6 stand eine Frage je Agent: *Was ist das Schlimmste, das
er mit seinen Rechten anrichten kann?* Die vorige Lektion hat gezeigt, warum
diese Frage keine Theorie ist: Ein Modell kann zu Dingen überredet werden. Was
es dann tun kann, bestimmen allein seine Rechte.

Daraus wird hier eine Regel, die in der Sicherheit seit Jahrzehnten gilt:

> **Das Prinzip des geringsten Rechts (*Least Privilege*): Jeder Teil eines
> Systems — Mensch, Programm, Agent — bekommt genau die Rechte, die er für
> seine Aufgabe braucht. Nicht mehr, und nicht länger als nötig.**

## Vier Fragen an jeden Zugang

| Frage | Schlecht | Gut |
|---|---|---|
| **Was darf er?** | Voller Zugriff auf das Postfach | Nur lesen, nur Ordner „Eingang" |
| **Wie lange?** | Für immer | Bis das Projekt endet, dann löschen |
| **Wer teilt ihn?** | Ein Schlüssel für alle Agenten | Ein eigener Schlüssel je Agent |
| **Wer sieht, was er tut?** | Niemand | Jeder Aufruf wird protokolliert — ohne das Geheimnis |

Der dritte Punkt wird oft unterschätzt. **Teilen sich drei Agenten einen
Schlüssel, weiß niemand, welcher was getan hat** — und wird einer
kompromittiert, müssen alle drei neu eingerichtet werden.

```aufgabe
id: E5-08
typ: denkaufgabe
titel: "Der gemeinsame Schlüssel"
punkte: 25
frage: "Drei Agenten nutzen denselben API-Schlüssel. Einer davon hat sich über eine Injection zu teuren Aufrufen verleiten lassen. Welche Probleme entstehen dadurch, dass der Schlüssel geteilt ist?"
mehrfach: true
optionen:
  - "Im Protokoll lässt sich nicht erkennen, welcher Agent die Aufrufe gemacht hat."
  - "Sperrt man den Schlüssel, stehen alle drei Agenten still."
  - "Das Modell wird dadurch dümmer."
  - "Geteilte Schlüssel sind langsamer."
loesung:
  - "Im Protokoll lässt sich nicht erkennen, welcher Agent die Aufrufe gemacht hat."
  - "Sperrt man den Schlüssel, stehen alle drei Agenten still."
richtzeit_s: 60
erklaerung: |
  Ein Schlüssel je Agent bedeutet: Man sieht, wer es war, und man sperrt nur
  ihn. Mit Geschwindigkeit oder Modellqualität hat das nichts zu tun.
```

## Lesen, schreiben, löschen

Die gröbste und wirksamste Unterscheidung ist die zwischen **lesen** und
**verändern**. Du kennst sie aus Stufe 4 als `GET` gegenüber `POST` und
`DELETE`. Viele Dienste erlauben, Schlüssel genau so zu beschränken — und es
lohnt sich fast immer:

- Ein Agent, der **Berichte erstellt**, braucht nur Lesezugriff auf die Daten.
- Ein Agent, der **Termine anlegt**, braucht Schreibrecht im Kalender — aber
  kein Löschrecht.
- **Löschen** braucht so gut wie nie ein Agent. Wenn doch, dann mit Freigabe.

```aufgabe
id: E5-09
typ: uebereinstimmung
titel: "Wie viel Recht?"
punkte: 30
frage: "Ordne jedem Agenten das kleinste Recht zu, mit dem er seine Aufgabe erfüllt."
links:
  - "Erstellt eine Wochenübersicht der Verkäufe"
  - "Trägt neue Anmeldungen in eine Tabelle ein"
  - "Räumt alte Entwürfe auf, die älter als ein Jahr sind"
rechts:
  - "Nur lesen"
  - "Lesen und neue Zeilen anlegen"
  - "Löschen, aber nur mit Freigabe durch einen Menschen"
loesung:
  "Erstellt eine Wochenübersicht der Verkäufe": "Nur lesen"
  "Trägt neue Anmeldungen in eine Tabelle ein": "Lesen und neue Zeilen anlegen"
  "Räumt alte Entwürfe auf, die älter als ein Jahr sind": "Löschen, aber nur mit Freigabe durch einen Menschen"
richtzeit_s: 75
erklaerung: |
  Übersichten lesen nur. Anmeldungen kommen dazu, ohne dass Bestehendes
  verändert werden muss. Und Löschen ist unumkehrbar - also Freigabe.
```

## Zugänge, die niemand mehr braucht

Der gefährlichste Zugang ist oft nicht der mächtigste, sondern der
**vergessene**: der Schlüssel aus einem Probeprojekt vom letzten Jahr, das
Konto einer Praktikantin, die längst weg ist, die Testintegration, die noch
läuft. Niemand beobachtet ihn, niemand vermisst ihn, wenn er missbraucht wird.

Deshalb gehört zu jedem Zugang ein **Ablaufdatum** oder wenigstens ein Termin,
an dem er überprüft wird. Und wenn ein Schlüssel offen lag — in einem
Protokoll, einem Commit, einem Chat (Lektion 1) —, gilt immer dieselbe
Antwort: **sofort sperren und durch einen neuen ersetzen.** Man nennt das
*Rotation*. Löschen der Fundstelle allein reicht nicht: Wer ihn gesehen hat,
hat ihn.

```aufgabe
id: E5-10
typ: schiebe
titel: "Ein Schlüssel lag offen"
punkte: 30
frage: "Ein API-Schlüssel stand versehentlich in einem öffentlichen Commit. Bring die Schritte in die richtige Reihenfolge."
bausteine:
  - "Prüfen, ob in der Zwischenzeit verdächtige Aufrufe stattfanden"
  - "Den Schlüssel beim Anbieter sperren"
  - "Einen neuen Schlüssel erzeugen und sicher hinterlegen"
  - "Festhalten, wie es passiert ist, damit es nicht wieder passiert"
loesung:
  - "Den Schlüssel beim Anbieter sperren"
  - "Einen neuen Schlüssel erzeugen und sicher hinterlegen"
  - "Prüfen, ob in der Zwischenzeit verdächtige Aufrufe stattfanden"
  - "Festhalten, wie es passiert ist, damit es nicht wieder passiert"
richtzeit_s: 80
erklaerung: |
  Zuerst sperren - jede Minute zählt. Dann ersetzen, damit das System
  weiterläuft. Dann nachsehen, ob jemand ihn schon benutzt hat. Und zuletzt
  die Ursache beheben. Den Commit zu löschen steht nicht auf der Liste: Der
  Schlüssel ist trotzdem gesehen worden.
```
