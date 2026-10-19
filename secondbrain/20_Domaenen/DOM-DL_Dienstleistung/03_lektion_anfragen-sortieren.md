---
type: lesson
title: "Anfragen sortieren"
description: "Kontaktformular, E-Mail, Nachricht: Ein Modell sortiert freien Text zuverlässig in feste Kategorien und erkennt Dringendes. Was heikel ist, landet bei einem Menschen."
tags:
  - lesson
  - domaene
  - dom-dl
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 15
---

# Anfragen sortieren

## Wo die Regel aufhört

Die Online-Buchung aus Lektion 2 deckt nur einen Teil ab. Der Rest kommt als
freier Text: „Können Sie nächste Woche mal vorbeikommen, die Heizung macht
komische Geräusche?" oder „Ich habe die Rechnung doppelt bekommen."

Freier Text lässt sich mit Stichwortregeln schlecht sortieren. Hier ist ein
Modell stark: Es ordnet jede Anfrage einer **festen Liste von Kategorien** zu.
Fest heißt: Die Liste gibst du vor. Darf das Modell eigene Kategorien
erfinden, kannst du am Ende nichts mehr zählen und nichts mehr weiterleiten.

```aufgabe
id: D2-06
typ: quizkarten
titel: "Vier Fächer für den Posteingang"
punkte: 30
frage: "Sortiere die Anfragen in die Kategorien eines Handwerksbetriebs."
karten:
  - "Hätten Sie am Donnerstagvormittag Zeit für eine Wartung?"
  - "Was würde ein neues Bad mit bodengleicher Dusche ungefähr kosten?"
  - "Seit Ihrer Reparatur tropft es mehr als vorher."
  - "Ich habe die Rechnung vom März zweimal bekommen."
  - "Können wir den Termin am Montag auf Mittwoch verschieben?"
  - "Bitte schicken Sie mir ein Angebot für zwei neue Heizkörper."
stapel: [Termin, Angebot, Beschwerde, Rechnung]
loesung:
  "Hätten Sie am Donnerstagvormittag Zeit für eine Wartung?": Termin
  "Was würde ein neues Bad mit bodengleicher Dusche ungefähr kosten?": Angebot
  "Seit Ihrer Reparatur tropft es mehr als vorher.": Beschwerde
  "Ich habe die Rechnung vom März zweimal bekommen.": Rechnung
  "Können wir den Termin am Montag auf Mittwoch verschieben?": Termin
  "Bitte schicken Sie mir ein Angebot für zwei neue Heizkörper.": Angebot
richtzeit_s: 90
erklaerung: |
  Termin, Angebot, Beschwerde, Rechnung - vier Fächer, die jeweils an eine
  andere Stelle gehen. Die Kategorie entscheidet, wer sich kümmert. Deshalb
  muss sie stimmen, und deshalb prüfst du anfangs jede Woche eine Stichprobe.
```

## Was nie nur automatisch beantwortet wird

Neben der Kategorie fragt ein guter Ablauf: **Ist das dringend oder heikel?**
Ein Wasserrohrbruch kann nicht bis Montag warten. Eine Kündigung, eine
Schadensmeldung oder eine Frage mit rechtlichen Folgen braucht einen
Menschen, der antwortet, auch wenn das Modell einen schönen Entwurf schreiben
könnte.

```aufgabe
id: D2-07
typ: denkaufgabe
mehrfach: true
titel: "Sofort zum Menschen"
punkte: 30
frage: "Welche Anfragen sollte der Ablauf sofort an einen Menschen weiterleiten, statt automatisch zu antworten? Mehrere Antworten sind richtig."
optionen:
  - "„Wasser läuft aus der Decke, bitte kommen Sie schnell!“"
  - "„Hiermit kündige ich den Wartungsvertrag zum Jahresende.“"
  - "„Durch Ihre Arbeit ist mein Parkett beschädigt worden.“"
  - "„Wie sind Ihre Öffnungszeiten am Samstag?“"
  - "„Wo kann ich bei Ihnen parken?“"
loesung:
  - "„Wasser läuft aus der Decke, bitte kommen Sie schnell!“"
  - "„Hiermit kündige ich den Wartungsvertrag zum Jahresende.“"
  - "„Durch Ihre Arbeit ist mein Parkett beschädigt worden.“"
richtzeit_s: 75
erklaerung: |
  Notfall, Kündigung und Schadensmeldung haben Folgen, die eine schnelle,
  verbindliche Reaktion eines Menschen brauchen. Öffnungszeiten und Parken
  sind feste Informationen - die darf ein Werkzeug aus einer geprüften Liste
  beantworten.
```
