---
type: lesson
title: "Abläufe automatisieren"
description: "Auslöser, Bedingung, Aktion, Fehlerfall: So ist jeder automatische Ablauf gebaut. Wer ihn mit alten Fällen testet und eine Woche parallel laufen lässt, schläft danach ruhiger."
tags:
  - lesson
  - domaene
  - dom-buero
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 16
---

# Abläufe automatisieren

## Vier Teile, immer dieselben

Erkennen, auslesen, benennen, ablegen (Lektionen 2 bis 5): Jetzt soll das
von selbst passieren. Werkzeuge wie Power Automate, Zapier oder n8n bauen
Abläufe immer aus denselben Teilen. Du kennst das Muster aus Stufe 3:

- **Auslöser:** Was startet den Ablauf?
- **Bedingung:** Wann soll er etwas tun, wann nicht?
- **Aktion:** Was tut er?
- **Fehlerfall:** Was passiert, wenn es schiefgeht?

Der Fehlerfall wird am häufigsten vergessen. Ein Ablauf ohne Fehlerfall
scheitert leise, und niemand merkt es, bis eine Mahnung kommt.

```aufgabe
id: D3-14
typ: uebereinstimmung
titel: "Die vier Teile eines Ablaufs"
punkte: 25
frage: "Ordne jedem Teil des Ablaufs das passende Beispiel zu."
links: [Auslöser, Bedingung, Aktion, Fehlerfall]
rechts:
  - "Eine neue E-Mail mit Anhang trifft ein."
  - "Der Anhang ist eine PDF-Datei und als Rechnung erkannt."
  - "Die Datei wird benannt und im Ordner Buchhaltung abgelegt."
  - "Scheitert die Ablage, bekommt das Sekretariat eine Nachricht."
loesung:
  Auslöser: "Eine neue E-Mail mit Anhang trifft ein."
  Bedingung: "Der Anhang ist eine PDF-Datei und als Rechnung erkannt."
  Aktion: "Die Datei wird benannt und im Ordner Buchhaltung abgelegt."
  Fehlerfall: "Scheitert die Ablage, bekommt das Sekretariat eine Nachricht."
richtzeit_s: 70
erklaerung: |
  Mit diesen vier Teilen lässt sich jeder Ablauf auf Papier beschreiben,
  bevor er gebaut wird. Fehlt einer, fehlt eine Entscheidung - meistens die
  über den Fehlerfall.
```

## Lohnt sich das?

Bevor du baust, rechne. Ein Ablauf kostet Zeit beim Einrichten und bei der
Pflege. Er lohnt sich, wenn er oft genug läuft.

```aufgabe
id: D3-15
typ: mathe
titel: "Die gesparte Zeit"
punkte: 25
frage: "Im Büro kommen jeden Arbeitstag 25 Rechnungen per Mail. Das Ablegen von Hand dauert 2 Minuten je Rechnung. Wie viele Stunden spart ein Ablauf, der das übernimmt, in einem Jahr mit 220 Arbeitstagen?"
loesung: 183.3
toleranz: 0.5
einheit: "Stunden"
richtzeit_s: 100
hinweise:
  - text: "Erst die Minuten pro Tag, dann aufs Jahr, dann durch 60."
    kostet: 5
erklaerung: |
  25 × 2 = 50 Minuten am Tag, mal 220 Tage sind 11.000 Minuten, also rund
  183 Stunden - mehr als vier Arbeitswochen. Davon gehen Einrichtung und
  Stichprobenprüfung ab, aber es bleibt viel übrig.
```

## Einführen, ohne zu stolpern

Ein neuer Ablauf wird nicht am Montag eingeschaltet und am Freitag bereut. Er
wird vorher mit echten, alten Fällen geprüft und eine Zeit lang **parallel**
zum Menschen betrieben, bis klar ist, dass er tut, was er soll.

```aufgabe
id: D3-16
typ: schiebe
titel: "Vom Papier zum Betrieb"
punkte: 25
frage: "Bring die Schritte beim Einführen eines neuen Ablaufs in die richtige Reihenfolge."
bausteine:
  - "Ablauf freischalten, mit Protokoll jeder Aktion"
  - "Eine Woche parallel zur Arbeit von Hand laufen lassen"
  - "Ablauf auf Papier beschreiben: Auslöser, Bedingung, Aktion, Fehlerfall"
  - "Abweichungen auswerten und den Ablauf nachbessern"
  - "Mit zwanzig alten Fällen testen"
loesung:
  - "Ablauf auf Papier beschreiben: Auslöser, Bedingung, Aktion, Fehlerfall"
  - "Mit zwanzig alten Fällen testen"
  - "Eine Woche parallel zur Arbeit von Hand laufen lassen"
  - "Abweichungen auswerten und den Ablauf nachbessern"
  - "Ablauf freischalten, mit Protokoll jeder Aktion"
richtzeit_s: 70
erklaerung: |
  Erst denken, dann mit Bekanntem testen, dann im Echtbetrieb neben dem
  Menschen vergleichen. Das Protokoll am Ende macht nachvollziehbar, was der
  Ablauf wann getan hat - das wird wichtig, wenn einmal etwas fehlt.
```
