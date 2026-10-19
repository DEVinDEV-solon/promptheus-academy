---
type: lesson
title: "Ein Chatbot an der Tür"
description: "Ein Chatbot auf der Webseite beantwortet Fragen rund um die Uhr. Er sagt, dass er eine KI ist, kennt seine Grenzen und gibt Zusagen an Menschen ab. Was er verspricht, gilt nämlich."
tags:
  - lesson
  - domaene
  - dom-dl
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 15
---

# Ein Chatbot an der Tür

## Was er sagt, hast du gesagt

Bis hier hat das Modell Entwürfe geschrieben, die ein Mensch sehen konnte
(Lektionen 3 bis 5). Ein Chatbot auf der Webseite antwortet direkt, ohne dass
jemand mitliest. Das ändert alles.

Ein bekannter Fall aus Kanada (2024): Der Chatbot einer Fluggesellschaft
erklärte einem Kunden eine Erstattungsregel, die es so nicht gab. Der Kunde
verließ sich darauf. Die Gesellschaft argumentierte, der Chatbot sei
gewissermaßen selbst verantwortlich. Das Schiedsgericht sah das anders.

```aufgabe
id: D2-13
typ: denkaufgabe
titel: "Wer steht dafür gerade?"
punkte: 25
frage: "Der Chatbot deiner Webseite sagt einer Kundin einen Rabatt von 20 Prozent zu, den es nicht gibt. Wer muss sich dafür verantworten?"
optionen:
  - "Der Betrieb, denn der Chatbot spricht auf seiner Webseite in seinem Namen."
  - "Niemand, Chatbots sind bekanntlich unzuverlässig."
  - "Der Anbieter des Sprachmodells allein."
  - "Die Kundin, sie hätte nachfragen müssen."
loesung: "Der Betrieb, denn der Chatbot spricht auf seiner Webseite in seinem Namen."
richtzeit_s: 50
erklaerung: |
  So hat es das Schiedsgericht im Fall der Fluggesellschaft gesehen: Die
  Firma ist für alle Informationen auf ihrer Webseite verantwortlich, auch für
  die des Chatbots. Was er zusagt, musst du im Zweifel einlösen.
```

## Was der Chatbot selbst darf

Daraus folgt die Arbeitsteilung: Der Chatbot beantwortet, was in einer
**geprüften Wissensliste** steht, und schlägt freie Termine vor. Alles, was
eine Zusage oder Ermessen braucht, übergibt er an einen Menschen, mit einem
klaren Satz statt einer Ausrede.

```aufgabe
id: D2-14
typ: quizkarten
titel: "Selbst antworten oder übergeben?"
punkte: 30
frage: "Was darf der Chatbot selbst beantworten, und was übergibt er an einen Menschen?"
karten:
  - "Wann haben Sie am Samstag geöffnet?"
  - "Bekomme ich 20 Prozent Rabatt, wenn ich zwei Termine buche?"
  - "Was kostet ein Herrenhaarschnitt laut Preisliste?"
  - "Ihr Mitarbeiter hat meine Jacke beschädigt, was jetzt?"
  - "Haben Sie diese Woche noch einen freien Termin?"
  - "Können Sie meine Daten bei Ihnen löschen?"
stapel: [Chatbot antwortet, an einen Menschen]
loesung:
  "Wann haben Sie am Samstag geöffnet?": Chatbot antwortet
  "Bekomme ich 20 Prozent Rabatt, wenn ich zwei Termine buche?": an einen Menschen
  "Was kostet ein Herrenhaarschnitt laut Preisliste?": Chatbot antwortet
  "Ihr Mitarbeiter hat meine Jacke beschädigt, was jetzt?": an einen Menschen
  "Haben Sie diese Woche noch einen freien Termin?": Chatbot antwortet
  "Können Sie meine Daten bei Ihnen löschen?": an einen Menschen
richtzeit_s: 90
erklaerung: |
  Öffnungszeiten, Preise aus der Liste und freie Termine sind geprüfte
  Fakten. Rabatt, Schaden und ein Löschantrag nach DSGVO brauchen einen
  Menschen, der entscheidet und dafür geradesteht.
```

## Ehrlich sagen, was er ist

Ein Chatbot gibt sich nicht als Mensch aus. Der AI Act der EU verlangt in
Art. 50, dass Menschen erfahren, wenn sie mit einer KI sprechen. Unabhängig
davon ist es schlicht ehrlich, und es senkt die Erwartung an Zusagen.

```aufgabe
id: D2-15
typ: plugplay
titel: "Die Begrüßung"
punkte: 25
frage: "Welche Sätze gehören in die Begrüßung des Chatbots?"
bausteine:
  - "Ich bin ein KI-Assistent des Salons Haarwerk."
  - "Für Zusagen zu Preisen oder Reklamationen verbinde ich Sie mit dem Team."
  - "Ich bin Maria aus dem Kundenservice."
  - "Bitte geben Sie hier Ihre Kreditkartennummer ein."
  - "Ich kann Öffnungszeiten, Preise und freie Termine nennen."
loesung:
  - "Ich bin ein KI-Assistent des Salons Haarwerk."
  - "Für Zusagen zu Preisen oder Reklamationen verbinde ich Sie mit dem Team."
  - "Ich kann Öffnungszeiten, Preise und freie Termine nennen."
richtzeit_s: 70
erklaerung: |
  Sagen, was er ist, was er kann und wann ein Mensch übernimmt. „Maria aus
  dem Kundenservice" täuscht einen Menschen vor. Zahlungsdaten gehören nie in
  ein Chatfenster - dafür gibt es eine sichere Bezahlseite.
```
