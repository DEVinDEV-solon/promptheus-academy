---
type: lesson
title: "DSGVO-Prüfung"
description: "Vier Werkzeuge der DSGVO begegnen dir bei jedem KI-Einsatz: Verzeichnis, Vertrag zur Auftragsverarbeitung, Folgenabschätzung, Information der Betroffenen. Ein Modell hilft beim Entwurf, prüfen musst du."
tags:
  - lesson
  - domaene
  - dom-jura
  - datenschutz
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 16
---

# DSGVO-Prüfung

## Vier Werkzeuge der DSGVO

In Stufe 5 hast du die Grundsätze kennengelernt: Rechtsgrundlage,
Zweckbindung, Datenminimierung. Wenn eine Firma ein KI-Werkzeug mit
personenbezogenen Daten einführt, werden sie zu konkreten Unterlagen:

```aufgabe
id: D6-14
typ: uebereinstimmung
titel: "Die Unterlagen der DSGVO"
punkte: 30
frage: "Ordne jedem Begriff seine Bedeutung zu."
links:
  - "Verzeichnis von Verarbeitungstätigkeiten"
  - "Vertrag zur Auftragsverarbeitung"
  - "Datenschutz-Folgenabschätzung"
  - "Informationspflicht"
rechts:
  - "Liste aller Verarbeitungen mit Zweck, Daten, Empfängern und Löschfristen"
  - "Bindet einen Dienstleister, der Daten im Auftrag verarbeitet, an deine Weisungen"
  - "Vorab-Prüfung bei Verarbeitungen mit voraussichtlich hohem Risiko für Betroffene"
  - "Betroffene erfahren, wer ihre Daten wofür verarbeitet"
loesung:
  "Verzeichnis von Verarbeitungstätigkeiten": "Liste aller Verarbeitungen mit Zweck, Daten, Empfängern und Löschfristen"
  "Vertrag zur Auftragsverarbeitung": "Bindet einen Dienstleister, der Daten im Auftrag verarbeitet, an deine Weisungen"
  "Datenschutz-Folgenabschätzung": "Vorab-Prüfung bei Verarbeitungen mit voraussichtlich hohem Risiko für Betroffene"
  "Informationspflicht": "Betroffene erfahren, wer ihre Daten wofür verarbeitet"
richtzeit_s: 90
erklaerung: |
  Verzeichnis (Art. 30), Auftragsverarbeitung (Art. 28), Folgenabschätzung
  (Art. 35), Information (Art. 13 und 14). Ein Modell kann für jede dieser
  Unterlagen einen guten Entwurf schreiben - wenn du ihm die echten Fakten
  gibst. Prüfen und verantworten musst du ihn.
```

## Wer braucht einen Vertrag zur Auftragsverarbeitung?

Die häufigste Frage beim KI-Einsatz: Verarbeitet der Anbieter die Daten **in
meinem Auftrag und nach meinen Weisungen**? Dann braucht es einen Vertrag zur
Auftragsverarbeitung. Wer dagegen eine eigene Leistung in eigener
Verantwortung erbringt, ist kein Auftragsverarbeiter. Und wo gar keine Daten
das Haus verlassen, gibt es niemanden, mit dem man einen Vertrag schließen
müsste.

```aufgabe
id: D6-15
typ: quizkarten
titel: "Vertrag nötig?"
punkte: 30
frage: "Braucht die Firma für diesen Fall einen Vertrag zur Auftragsverarbeitung?"
karten:
  - "Ein Cloud-Dienst schreibt Kundengespräche mit und fasst sie zusammen"
  - "Ein KI-Anbieter beantwortet über seine Schnittstelle Kundenanfragen mit Kundendaten"
  - "Ein Sprachmodell läuft auf dem eigenen Server im eigenen Haus"
  - "Die Post stellt Briefe an Kunden zu"
  - "Der Hosting-Anbieter betreibt die Webseite mit dem Kontaktformular"
stapel: [Vertrag nötig, kein Vertrag nötig]
loesung:
  "Ein Cloud-Dienst schreibt Kundengespräche mit und fasst sie zusammen": Vertrag nötig
  "Ein KI-Anbieter beantwortet über seine Schnittstelle Kundenanfragen mit Kundendaten": Vertrag nötig
  "Ein Sprachmodell läuft auf dem eigenen Server im eigenen Haus": kein Vertrag nötig
  "Die Post stellt Briefe an Kunden zu": kein Vertrag nötig
  "Der Hosting-Anbieter betreibt die Webseite mit dem Kontaktformular": Vertrag nötig
richtzeit_s: 90
hinweise:
  - text: "Verarbeitet der Anbieter die Daten nach deinen Weisungen, oder erbringt er eine eigene Leistung?"
    kostet: 5
erklaerung: |
  Transkription, KI-Schnittstelle und Hosting verarbeiten Daten in deinem
  Auftrag. Die Post erbringt eine eigene Leistung, und beim eigenen Server
  verlassen die Daten das Haus nicht. In Grenzfällen entscheidet die
  Datenschutzberatung - nicht das Modell.
```
