---
type: lesson
title: "Personaldaten und Betriebsrat"
description: "Beschäftigtendaten sind besonders schutzwürdig, Gesundheitsdaten erst recht. Und ein KI-Werkzeug, das Verhalten oder Leistung auswerten kann, braucht in Betrieben mit Betriebsrat dessen Zustimmung."
tags:
  - lesson
  - domaene
  - dom-pers
  - datenschutz
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 15
---

# Personaldaten und Betriebsrat

## Was ins Werkzeug darf

Nach der Einstellung (Lektionen 2 bis 5) beginnt die eigentliche
Personalverwaltung: Verträge, Gehälter, Urlaub, Krankmeldungen. Die Daten
von Beschäftigten sind besonders schutzwürdig. Gesundheitsdaten zählen zu den
besonderen Kategorien nach Art. 9 DSGVO und brauchen eine eigene
Rechtsgrundlage.

Die Frage aus allen Fachkursen gilt hier verschärft: Braucht das Werkzeug
diese Daten für die Aufgabe überhaupt?

```aufgabe
id: D9-13
typ: quizkarten
titel: "Darf das ins Werkzeug?"
punkte: 30
frage: "Darf das in das freigegebene KI-Werkzeug der Personalabteilung, oder gehört es nicht hinein?"
karten:
  - "Eine allgemeine Frage zur Berechnung von Urlaub bei Teilzeit"
  - "Die Krankheitsdiagnosen eines Mitarbeiters"
  - "Die interne Reisekostenrichtlinie, um Fragen dazu zu beantworten"
  - "Leistungsbeurteilungen mit Namen, um eine Rangliste zu erstellen"
  - "Ein Musterarbeitsvertrag ohne Namen, um ihn verständlicher zu formulieren"
stapel: [darf hinein, gehört nicht hinein]
loesung:
  "Eine allgemeine Frage zur Berechnung von Urlaub bei Teilzeit": darf hinein
  "Die Krankheitsdiagnosen eines Mitarbeiters": gehört nicht hinein
  "Die interne Reisekostenrichtlinie, um Fragen dazu zu beantworten": darf hinein
  "Leistungsbeurteilungen mit Namen, um eine Rangliste zu erstellen": gehört nicht hinein
  "Ein Musterarbeitsvertrag ohne Namen, um ihn verständlicher zu formulieren": darf hinein
richtzeit_s: 80
erklaerung: |
  Allgemeine Fragen, Richtlinien und Muster ohne Namen sind unproblematisch.
  Diagnosen braucht kein Werkzeug. Und eine Rangliste aus Beurteilungen wäre
  eine automatisierte Bewertung von Menschen - genau das, was Lektion 3
  ausschließt.
```

## Der Betriebsrat entscheidet mit

Gibt es im Betrieb einen Betriebsrat, hat er bei der Einführung technischer
Einrichtungen, die **dazu geeignet** sind, Verhalten oder Leistung der
Beschäftigten zu überwachen, ein Mitbestimmungsrecht (§ 87 Abs. 1 Nr. 6
Betriebsverfassungsgesetz). Es kommt nicht darauf an, ob die Firma das
tatsächlich vorhat. Viele KI-Werkzeuge im Büro werten Aktivitäten aus und
fallen darunter. Üblich ist eine **Betriebsvereinbarung**, die regelt, was
das Werkzeug darf und was nicht.

```aufgabe
id: D9-14
typ: denkaufgabe
titel: "Nur ein Assistent"
punkte: 25
frage: "Eine Firma mit Betriebsrat will einen KI-Assistenten im Büroprogramm einführen. Er kann unter anderem anzeigen, wer wie viele Dokumente bearbeitet. Die Geschäftsführung sagt: „Das wollen wir gar nicht auswerten.“ Muss der Betriebsrat trotzdem beteiligt werden?"
optionen:
  - "Ja, weil das Werkzeug dazu geeignet ist, Leistung zu überwachen, egal was die Firma vorhat."
  - "Nein, weil die Firma die Auswertung nicht nutzen will."
  - "Nein, KI-Werkzeuge sind von der Mitbestimmung ausgenommen."
  - "Nur, wenn mehr als hundert Beschäftigte es nutzen."
loesung: "Ja, weil das Werkzeug dazu geeignet ist, Leistung zu überwachen, egal was die Firma vorhat."
richtzeit_s: 60
erklaerung: |
  Es zählt, was das Werkzeug kann, nicht was beabsichtigt ist. Eine
  Betriebsvereinbarung schafft Klarheit für beide Seiten - und Vertrauen, ohne
  das ein solches Werkzeug ohnehin kaum genutzt wird.
```
