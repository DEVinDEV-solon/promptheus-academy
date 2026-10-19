---
type: lesson
title: "Bürgeranfragen"
description: "Ein Chatbot auf der Behördenseite beantwortet allgemeine Fragen rund um die Uhr. Er sagt, dass er eine KI ist, verweist auf amtliche Quellen und gibt Einzelfälle an die Sachbearbeitung."
tags:
  - lesson
  - domaene
  - dom-buero2
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 14
---

# Bürgeranfragen

## Allgemein ja, Einzelfall nein

Viele Anrufe im Bürgerbüro drehen sich um dieselben Fragen: Öffnungszeiten,
benötigte Unterlagen, Formulare. Ein **Chatbot** auf der Webseite der Behörde
kann sie beantworten, aus geprüften Informationen der Behörde, mit Link auf
die amtliche Seite.

Fragen zum **eigenen Verfahren** gehören nicht dazu. Warum ein Antrag
abgelehnt wurde oder ob eine Frist verlängert wird, ist Sache der
Sachbearbeitung (Lektion 6).

```aufgabe
id: D10-16
typ: quizkarten
titel: "Chatbot oder Sachbearbeitung?"
punkte: 30
frage: "Beantwortet der Chatbot die Frage, oder gibt er sie an die Sachbearbeitung weiter?"
karten:
  - "Wann hat das Bürgerbüro am Donnerstag geöffnet?"
  - "Welche Unterlagen brauche ich für einen neuen Personalausweis?"
  - "Warum wurde mein Antrag auf Wohngeld abgelehnt?"
  - "Kann ich die Frist für meinen Widerspruch verlängern?"
  - "Wo finde ich das Formular für die Anmeldung eines Hundes?"
stapel: [Chatbot antwortet, an die Sachbearbeitung]
loesung:
  "Wann hat das Bürgerbüro am Donnerstag geöffnet?": Chatbot antwortet
  "Welche Unterlagen brauche ich für einen neuen Personalausweis?": Chatbot antwortet
  "Warum wurde mein Antrag auf Wohngeld abgelehnt?": an die Sachbearbeitung
  "Kann ich die Frist für meinen Widerspruch verlängern?": an die Sachbearbeitung
  "Wo finde ich das Formular für die Anmeldung eines Hundes?": Chatbot antwortet
richtzeit_s: 75
erklaerung: |
  Allgemeine Auskünfte aus geprüften Informationen kann der Chatbot geben.
  Fragen zum eigenen Verfahren brauchen die Akte und eine verantwortliche
  Person - und manchmal eine Entscheidung.
```

## Was ein Behörden-Chatbot können muss

Eine Behörde ist an mehr gebunden als ein Unternehmen. Ihr Chatbot muss
barrierefrei bedienbar sein, darf niemanden über seine Natur täuschen (AI
Act, Art. 50) und darf keine Daten abfragen, die er für die Auskunft nicht
braucht.

```aufgabe
id: D10-17
typ: plugplay
titel: "Anforderungen an den Chatbot"
punkte: 30
frage: "Welche Eigenschaften gehören zu einem guten Chatbot auf einer Behördenseite?"
bausteine:
  - "Er gibt sich als KI-Assistent zu erkennen"
  - "Er verlinkt die amtliche Seite, aus der seine Antwort stammt"
  - "Er bietet einen Weg zu einem Menschen an"
  - "Er ist barrierefrei bedienbar, auch mit Tastatur und Vorlesefunktion"
  - "Er sagt verbindliche Bearbeitungszeiten zu"
  - "Er fragt im Chat nach Gesundheitsdaten, um besser zu helfen"
loesung:
  - "Er gibt sich als KI-Assistent zu erkennen"
  - "Er verlinkt die amtliche Seite, aus der seine Antwort stammt"
  - "Er bietet einen Weg zu einem Menschen an"
  - "Er ist barrierefrei bedienbar, auch mit Tastatur und Vorlesefunktion"
richtzeit_s: 75
erklaerung: |
  Ehrlich, belegt, mit Ausweg und für alle bedienbar. Verbindliche Zusagen
  kann er nicht halten, und sensible Daten braucht er für allgemeine
  Auskünfte nicht.
```
