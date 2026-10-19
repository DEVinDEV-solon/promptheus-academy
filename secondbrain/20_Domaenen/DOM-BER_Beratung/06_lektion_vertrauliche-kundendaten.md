---
type: lesson
title: "Vertrauliche Kundendaten"
description: "Was ein Kunde dir anvertraut, darf nicht in fremden Rechenzentren landen. Pseudonymisieren, Anbieter prüfen, Notizen bereinigen."
tags:
  - lesson
  - domaene
  - dom-ber
  - datenschutz
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 14
---

# Vertrauliche Kundendaten

## Zwei Arten von Geheimnis

In der Beratung hast du es mit zwei Arten von schutzwürdigen Daten zu tun:

- **Geschäftsgeheimnisse** des Kunden: Umsätze, Margen, Pläne, Probleme.
  Geschützt durch den Vertrag, meist eine Geheimhaltungsvereinbarung.
- **Personenbezogene Daten**: Namen in Interviewnotizen, Gehaltslisten,
  Kundenlisten des Kunden. Geschützt durch die DSGVO.

Beides darf nicht einfach in ein Modell eines fremden Anbieters kopiert
werden. Ein Text, den du an eine Schnittstelle schickst, verlässt dein
Haus — das war die Lehre aus Stufe 5.

## Vor dem Modell: bereinigen

Die einfachste Schutzmaßnahme ist die, bei der nichts Schutzwürdiges mehr
übrig ist. **Pseudonymisieren** heißt: Namen und Kennungen durch Platzhalter
ersetzen, die Zuordnung bleibt bei dir. Aus „Frau Berger, Leiterin Einkauf"
wird „Person A, Einkauf". Für die Themenanalyse aus Lektion 2 reicht das
völlig.

```aufgabe
id: D5-15
typ: plugplay
titel: "Was muss raus?"
punkte: 30
frage: "Du willst Interviewnotizen von einem externen Modell nach Themen bündeln lassen. Welche Angaben ersetzt du vorher durch Platzhalter?"
bausteine:
  - "Vor- und Nachnamen der Befragten"
  - "Die Aussage „Die Abstimmung mit dem Lager dauert zu lange“"
  - "Die private Handynummer am Rand der Notiz"
  - "Der genaue Firmenname des Kunden"
  - "Das Wort „Lieferverzug“"
loesung:
  - "Vor- und Nachnamen der Befragten"
  - "Die private Handynummer am Rand der Notiz"
  - "Der genaue Firmenname des Kunden"
richtzeit_s: 80
hinweise:
  - text: "Was braucht das Modell, um Themen zu erkennen — und was nicht?"
    kostet: 5
erklaerung: |
  Für Themen braucht das Modell den Inhalt der Aussagen, nicht die Personen
  und nicht den Firmennamen. Was es nicht braucht, bekommt es nicht. Das
  ist Datenminimierung - der einfachste Grundsatz der DSGVO.
```

## Den Anbieter prüfen

Manchmal geht es nicht ohne echte Daten, etwa bei der Analyse einer
Kundenliste. Dann zählt, **wohin** sie gehen:

- Gibt es einen **Auftragsverarbeitungsvertrag** (Art. 28 DSGVO) mit dem
  Anbieter?
- Werden die Eingaben **zum Training** verwendet? Wenn ja: nicht nutzen.
- Wo stehen die Server, und wie lange werden Eingaben gespeichert?
- Ginge es auch mit einem **lokalen Modell**, das das Haus nie verlässt?

```aufgabe
id: D5-16
typ: uebereinstimmung
titel: "Maßnahme und Zweck"
punkte: 30
frage: "Ordne jeder Maßnahme ihren Zweck zu."
links: [Pseudonymisieren, Auftragsverarbeitungsvertrag, Lokales Modell, Löschfrist]
rechts:
  - "Die Daten verlassen das eigene Haus gar nicht."
  - "Das Modell sieht keine Namen, die Zuordnung bleibt bei dir."
  - "Der Anbieter ist vertraglich an deine Weisungen gebunden."
  - "Nach Projektende liegen keine Kundendaten mehr herum."
loesung:
  Pseudonymisieren: "Das Modell sieht keine Namen, die Zuordnung bleibt bei dir."
  Auftragsverarbeitungsvertrag: "Der Anbieter ist vertraglich an deine Weisungen gebunden."
  "Lokales Modell": "Die Daten verlassen das eigene Haus gar nicht."
  Löschfrist: "Nach Projektende liegen keine Kundendaten mehr herum."
richtzeit_s: 90
erklaerung: |
  Keine dieser Maßnahmen ersetzt die anderen. Die stärkste ist die, bei der
  die Daten das Haus nicht verlassen; die schwächste ist ein Vertrag ohne
  Prüfung, was der Anbieter wirklich tut.
```

Wichtig für alle folgenden Lektionen: Die Frage „Darf das ans Modell?"
stellst du **vor** jedem Schritt, nicht nachher. Ein Text, der einmal
verschickt ist, kommt nicht zurück.

```aufgabe
id: D5-25
typ: quizkarten
titel: "Darf das ans Modell?"
punkte: 25
frage: "Lege jede Karte auf den passenden Stapel: Darf sie an ein externes Modell, erst nach dem Bereinigen, oder gar nicht?"
karten:
  - "Eine öffentliche Branchenstudie, die du zusammenfassen willst"
  - "Interviewnotizen mit Namen der Befragten"
  - "Die unveröffentlichten Quartalszahlen des Kunden, bevor eine Vertraulichkeitszusage des Anbieters geprüft ist"
  - "Eine Gehaltsliste mit Namen, um „mal schnell“ den Durchschnitt zu bilden"
  - "Die allgemeine Frage, wie man eine Kundenbefragung aufbaut"
stapel: [darf direkt, erst bereinigen, gar nicht]
loesung:
  "Eine öffentliche Branchenstudie, die du zusammenfassen willst": darf direkt
  "Interviewnotizen mit Namen der Befragten": erst bereinigen
  "Die unveröffentlichten Quartalszahlen des Kunden, bevor eine Vertraulichkeitszusage des Anbieters geprüft ist": gar nicht
  "Eine Gehaltsliste mit Namen, um „mal schnell“ den Durchschnitt zu bilden": gar nicht
  "Die allgemeine Frage, wie man eine Kundenbefragung aufbaut": darf direkt
richtzeit_s: 90
hinweise:
  - text: "Einen Durchschnitt rechnet die Tabelle - dafür braucht es gar kein Modell."
    kostet: 5
erklaerung: |
  Öffentliches und Allgemeines darf direkt hinaus. Notizen werden
  pseudonymisiert, dann reicht der Inhalt. Vertrauliche Zahlen ohne geprüfte
  Zusage und eine Gehaltsliste mit Namen gehören nicht hinaus - den
  Durchschnitt rechnet ohnehin die Tabelle (Lektion 5).
```
