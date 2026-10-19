---
type: lesson
title: "Der AI Act im Betrieb"
description: "Die KI-Verordnung der EU sortiert nach Risiko: verboten, hohes Risiko, Transparenzpflicht, geringes Risiko. Wer KI im Betrieb einsetzt, muss wissen, wo seine Werkzeuge stehen."
tags:
  - lesson
  - domaene
  - dom-jura
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 16
---

# Der AI Act im Betrieb

## Vier Stufen nach Risiko

Die DSGVO aus Lektion 6 schützt Daten. Die **KI-Verordnung der EU**, kurz AI
Act, regelt KI-Systeme selbst. Sie ordnet sie nach dem Risiko für Menschen:

- **Verboten** (Art. 5, seit Februar 2025): etwa Systeme, die Menschen nach
  ihrem Sozialverhalten bewerten, oder Emotionserkennung am Arbeitsplatz und
  in der Bildung.
- **Hohes Risiko** (Anhang III): etwa KI bei der Auswahl von Bewerbungen,
  bei der Kreditwürdigkeit von Privatpersonen oder bei der Bewertung in
  Prüfungen. Hier gelten strenge Pflichten, unter anderem menschliche Aufsicht.
- **Transparenzpflicht** (Art. 50): Chatbots müssen sich als KI zu erkennen
  geben, täuschend echte KI-Bilder und -Videos müssen gekennzeichnet sein.
- **Geringes Risiko:** etwa Spamfilter oder Rechtschreibhilfe, ohne besondere
  Pflichten.

Die Pflichten gelten gestaffelt. Über die genauen Daten für Hochrisiko-
Systeme wurde in der EU zuletzt noch einmal verhandelt. Den aktuellen Stand
liest du auf EUR-Lex nach (Lektion 3), nicht beim Modell.

```aufgabe
id: D6-16
typ: quizkarten
titel: "Wo steht das System?"
punkte: 35
frage: "Lege jedes KI-System auf den Stapel seiner Risikostufe."
karten:
  - "Eine Kamera erkennt die Stimmung von Beschäftigten im Büro"
  - "Ein Werkzeug sortiert Bewerbungen vor"
  - "Ein Chatbot beantwortet Fragen auf der Firmenwebseite"
  - "Ein Spamfilter sortiert E-Mails"
  - "Ein System prüft die Kreditwürdigkeit von Privatkunden"
  - "Ein täuschend echtes KI-Video zeigt den Geschäftsführer bei einer Rede, die er nie hielt"
stapel: [verboten, hohes Risiko, Transparenzpflicht, geringes Risiko]
loesung:
  "Eine Kamera erkennt die Stimmung von Beschäftigten im Büro": verboten
  "Ein Werkzeug sortiert Bewerbungen vor": hohes Risiko
  "Ein Chatbot beantwortet Fragen auf der Firmenwebseite": Transparenzpflicht
  "Ein Spamfilter sortiert E-Mails": geringes Risiko
  "Ein System prüft die Kreditwürdigkeit von Privatkunden": hohes Risiko
  "Ein täuschend echtes KI-Video zeigt den Geschäftsführer bei einer Rede, die er nie hielt": Transparenzpflicht
richtzeit_s: 110
erklaerung: |
  Emotionserkennung am Arbeitsplatz ist verboten. Bewerbungsauswahl und
  Kreditprüfung entscheiden über Lebenschancen - hohes Risiko. Chatbot und
  Deepfake müssen sich zu erkennen geben. Der Spamfilter ist Alltag.
```

## Eine Pflicht für alle

Eine Pflicht trifft jede Firma, die KI-Werkzeuge einsetzt, unabhängig von der
Risikostufe, und sie gilt schon seit Februar 2025.

```aufgabe
id: D6-17
typ: denkaufgabe
titel: "Artikel 4"
punkte: 25
frage: "Was verlangt Art. 4 des AI Act von einer Firma, deren Beschäftigte KI-Werkzeuge nutzen?"
optionen:
  - "Sie muss dafür sorgen, dass die Beschäftigten über ausreichende KI-Kompetenz verfügen."
  - "Sie muss jedes Werkzeug bei einer Behörde anmelden."
  - "Sie darf nur Werkzeuge aus der EU einsetzen."
  - "Sie muss jede KI-Antwort von einem Anwalt prüfen lassen."
loesung: "Sie muss dafür sorgen, dass die Beschäftigten über ausreichende KI-Kompetenz verfügen."
richtzeit_s: 50
erklaerung: |
  KI-Kompetenz heißt: wissen, was das Werkzeug kann, wo es irrt und welche
  Regeln gelten. Eine Schulung wie diese ist ein Weg dahin, eine klare
  interne Regel ein zweiter.
```
