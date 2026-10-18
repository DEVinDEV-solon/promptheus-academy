---
type: lesson
title: "DSGVO in der Praxis"
description: "Personenbezogene Daten, Rechtsgrundlage und die Grundsätze, die jede Automation betreffen — ohne Paragrafenreiterei, aber mit den Stellen, an denen es wirklich zählt."
tags:
  - lesson
  - stufe-5
  - datenschutz
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 5
dauer_min: 18
---

# DSGVO in der Praxis

> Diese Lektion erklärt, wie die Datenschutz-Grundverordnung (DSGVO) auf
> Automationen wirkt. Sie ist keine Rechtsberatung — im Einzelfall entscheidet
> die Fachperson für Datenschutz in deinem Betrieb oder deiner Schule.

## Wann geht mich das an?

Die DSGVO gilt, sobald **personenbezogene Daten** verarbeitet werden. Das sind
alle Angaben, die sich auf einen bestimmten oder bestimmbaren Menschen
beziehen (Art. 4 Nr. 1). Der Begriff ist weiter, als die meisten denken:

- Offensichtlich: Name, Anschrift, Telefonnummer, E-Mail-Adresse.
- Weniger offensichtlich: eine Kundennummer, eine IP-Adresse, ein Foto, die
  Stimme in einer Aufnahme, die Uhrzeit, zu der jemand sich anmeldet.
- **Bestimmbar** reicht: Auch „die Lehrerin der 7b, die Mathe unterrichtet"
  ist personenbezogen, obwohl kein Name fällt.

Verarbeiten heißt praktisch alles: erheben, speichern, lesen, weiterleiten,
auswerten, löschen. Jede Automation, die Kundenmails liest, verarbeitet
personenbezogene Daten.

```aufgabe
id: E5-18
typ: plugplay
titel: "Personenbezogen oder nicht?"
punkte: 30
frage: "Wähle die Angaben, die personenbezogen sind."
bausteine:
  - "Kundennummer 40817 in einer Bestellliste"
  - "Die durchschnittliche Temperatur im Oktober"
  - "Eine Sprachnachricht einer Kundin"
  - "Der Satz „Der neue Hausmeister der Grundschule Lindenweg fehlt oft.“"
  - "Die Zahl der verkauften Schuhe pro Woche, ohne Käufer"
loesung:
  - "Kundennummer 40817 in einer Bestellliste"
  - "Eine Sprachnachricht einer Kundin"
  - "Der Satz „Der neue Hausmeister der Grundschule Lindenweg fehlt oft.“"
richtzeit_s: 80
hinweise:
  - text: "Kann man mit der Angabe — allein oder mit anderem Wissen — auf einen bestimmten Menschen schließen?"
    kostet: 5
erklaerung: |
  Kundennummer und Stimme führen zu einem Menschen, und „der neue Hausmeister
  dieser Schule" ist ohne Namen eindeutig bestimmbar. Wetter und anonyme
  Verkaufszahlen beziehen sich auf niemanden.
```

## Die Grundsätze (Art. 5)

Sieben Grundsätze gelten für jede Verarbeitung. Für Automationen sind vier
besonders wichtig:

| Grundsatz | Bedeutet für deinen Ablauf |
|---|---|
| **Zweckbindung** | Daten nur für den Zweck nutzen, für den sie erhoben wurden. Bewerbungen nicht nachträglich für Werbung auswerten. |
| **Datenminimierung** | Nur verarbeiten, was nötig ist. Der Zusammenfasser braucht den Text, nicht die Telefonnummer. |
| **Speicherbegrenzung** | Nicht länger aufheben als nötig. Jeder Zustand (Stufe 4) braucht eine Löschfrist. |
| **Integrität und Vertraulichkeit** | Angemessen schützen: Rechte (Lektion 4), Verschlüsselung (Lektion 5). |

Dazu kommen Rechtmäßigkeit und Transparenz, Richtigkeit und die
**Rechenschaftspflicht**: Wer verarbeitet, muss nachweisen können, dass er
sich an all das hält. Ein Protokoll, das zeigt, welcher Agent wann welche
Daten gelesen hat, ist deshalb nicht nur Sicherheit, sondern auch Nachweis.

```aufgabe
id: E5-19
typ: uebereinstimmung
titel: "Welcher Grundsatz ist verletzt?"
punkte: 30
frage: "Ordne jedem Fall den Grundsatz zu, gegen den er verstößt."
links:
  - "Ein Agent schickt ganze Kundenakten an ein Modell, um nur die Anrede zu bestimmen"
  - "Bewerbungsunterlagen werden nach der Absage noch fünf Jahre aufbewahrt"
  - "Adressen aus Anmeldungen für einen Kurs werden für einen Newsletter genutzt"
  - "Alle Agenten haben Lesezugriff auf die komplette Personalakte"
rechts:
  - "Datenminimierung"
  - "Speicherbegrenzung"
  - "Zweckbindung"
  - "Integrität und Vertraulichkeit"
loesung:
  "Ein Agent schickt ganze Kundenakten an ein Modell, um nur die Anrede zu bestimmen": "Datenminimierung"
  "Bewerbungsunterlagen werden nach der Absage noch fünf Jahre aufbewahrt": "Speicherbegrenzung"
  "Adressen aus Anmeldungen für einen Kurs werden für einen Newsletter genutzt": "Zweckbindung"
  "Alle Agenten haben Lesezugriff auf die komplette Personalakte": "Integrität und Vertraulichkeit"
richtzeit_s: 90
erklaerung: |
  Zu viel geschickt, zu lange behalten, für etwas anderes benutzt, zu weit
  geöffnet - das sind die vier häufigsten Datenschutzfehler in
  Automationen, und jeder lässt sich beim Entwurf vermeiden.
```

## Die Rechtsgrundlage (Art. 6)

Verarbeiten ist nur erlaubt, wenn eine **Rechtsgrundlage** vorliegt. Die
häufigsten im Alltag:

- **Vertrag** — die Daten sind nötig, um einen Vertrag zu erfüllen (die
  Lieferadresse für die Lieferung).
- **Rechtliche Pflicht** — ein Gesetz verlangt es (Rechnungen aufbewahren).
- **Berechtigtes Interesse** — abgewogen gegen die Interessen der Betroffenen.
- **Einwilligung** — freiwillig, informiert, jederzeit widerrufbar.

Für den Entwurf heißt das: **Zu jedem Datenfluss gehört die Frage „auf welcher
Grundlage?"** Wer sie nicht beantworten kann, sollte den Fluss nicht bauen.

## Die Rechte der Betroffenen

Menschen haben Rechte gegenüber dem, der ihre Daten verarbeitet: Auskunft,
Berichtigung, Löschung, Widerspruch und weitere. Für eine Automation bedeutet
das eine sehr praktische Anforderung:

> **Du musst wissen, wo die Daten einer Person überall liegen** — sonst kannst
> du weder Auskunft geben noch löschen.

Verstreute Kopien in Protokollen, Zwischenspeichern und Verläufen sind deshalb
nicht nur ein Sicherheitsproblem (Lektion 1), sondern auch ein
Datenschutzproblem.

```aufgabe
id: E5-20
typ: denkaufgabe
titel: "Der Löschantrag"
punkte: 25
frage: "Eine Kundin verlangt die Löschung ihrer Daten. Dein Agent hat ihre Mails zusammengefasst und die Zusammenfassungen in einer Notizdatenbank abgelegt. Was gilt?"
optionen:
  - "Es reicht, die ursprünglichen Mails zu löschen."
  - "Auch die Zusammenfassungen sind personenbezogen und müssen gelöscht werden, soweit keine Aufbewahrungspflicht greift."
  - "Zusammenfassungen sind vom Modell erzeugt und deshalb keine personenbezogenen Daten."
  - "Löschen ist bei automatisch erzeugten Daten technisch nicht möglich."
loesung: "Auch die Zusammenfassungen sind personenbezogen und müssen gelöscht werden, soweit keine Aufbewahrungspflicht greift."
richtzeit_s: 60
erklaerung: |
  Eine Zusammenfassung über eine bestimmte Kundin bezieht sich auf sie - egal,
  wer sie geschrieben hat. Deshalb gehört in jeden Entwurf eine Antwort auf
  die Frage: Wo landen abgeleitete Daten, und wie löschen wir sie?
```
