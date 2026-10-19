---
type: lesson
title: "Bewerbungen vorsortieren"
description: "KI in der Bewerberauswahl gilt nach dem AI Act als hohes Risiko. Was ein Werkzeug darf, warum ein Mensch jede Bewerbung sieht, und was passiert, wenn ein System aus alten Entscheidungen lernt."
tags:
  - lesson
  - domaene
  - dom-pers
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
dauer_min: 16
---

# Bewerbungen vorsortieren

## Was aus alten Entscheidungen gelernt wird

Auf die Anzeige aus Lektion 2 kommen zweihundert Bewerbungen. Die Versuchung
ist groß, ein Werkzeug vorsortieren zu lassen. Das bekannteste Warnbeispiel
stammt von Amazon: Ein Auswahlsystem, das aus den Einstellungen der
vergangenen zehn Jahre gelernt hatte, bewertete Bewerbungen von Frauen
schlechter. Amazon gab das System 2018 auf.

```aufgabe
id: D9-05
typ: denkaufgabe
titel: "Warum das System Frauen benachteiligte"
punkte: 25
frage: "Warum bewertete das Auswahlsystem Bewerbungen von Frauen schlechter, obwohl niemand ihm das beigebracht hatte?"
optionen:
  - "Es hatte aus früheren Einstellungen gelernt, bei denen überwiegend Männer genommen wurden, und dieses Muster übernommen."
  - "Weil Frauen schlechtere Bewerbungen schreiben."
  - "Weil ein Programmierer es absichtlich so eingestellt hatte."
  - "Weil das System zu wenig Rechenleistung hatte."
loesung: "Es hatte aus früheren Einstellungen gelernt, bei denen überwiegend Männer genommen wurden, und dieses Muster übernommen."
richtzeit_s: 60
erklaerung: |
  Ein System, das aus vergangenen Entscheidungen lernt, lernt auch deren
  Vorurteile - und wendet sie auf jede neue Bewerbung an, schneller und
  gleichmäßiger, als ein Mensch es je könnte.
```

## Was das Recht verlangt

Drei Regeln treffen sich hier:

- **AI Act:** KI-Systeme, die Bewerbungen auswählen, filtern oder bewerten,
  sind Hochrisiko-Systeme. Wer sie einsetzt, muss unter anderem menschliche
  Aufsicht sicherstellen und Betroffene informieren.
- **Art. 22 DSGVO:** Niemand darf einer Entscheidung unterworfen werden, die
  ausschließlich automatisiert getroffen wird und ihn erheblich betrifft.
  Eine Absage ist so eine Entscheidung.
- **AGG** (Lektion 2): Auch ein Werkzeug darf nicht benachteiligen.

Dazu kommt, was du aus dem Fachkurs Sicherheit kennst: Bewerbungen können
versteckte Anweisungen an das Werkzeug enthalten.

```aufgabe
id: D9-06
typ: denkaufgabe
mehrfach: true
titel: "Vorsortieren, aber richtig"
punkte: 30
frage: "Eine Firma will ein Werkzeug zur Vorsortierung einsetzen. Was gehört dazu? Mehrere Antworten sind richtig."
optionen:
  - "Ein Mensch liest jede Bewerbung selbst, bevor abgesagt wird."
  - "Bewerbende werden informiert, dass ein KI-Werkzeug beteiligt ist."
  - "Die Kriterien sind festgelegt und auf Benachteiligung geprüft."
  - "Das Werkzeug sagt den unteren 80 Prozent automatisch ab."
  - "Niemand erfährt vom Werkzeug, damit keiner es austrickst."
loesung:
  - "Ein Mensch liest jede Bewerbung selbst, bevor abgesagt wird."
  - "Bewerbende werden informiert, dass ein KI-Werkzeug beteiligt ist."
  - "Die Kriterien sind festgelegt und auf Benachteiligung geprüft."
richtzeit_s: 80
erklaerung: |
  Menschliche Prüfung, Transparenz und geprüfte Kriterien. Eine automatische
  Absage verstößt gegen Art. 22 DSGVO, Verschweigen gegen die
  Informationspflichten. Wo es einen Betriebsrat gibt, ist er ebenfalls zu
  beteiligen (Lektion 6).
```

## Ein fairer Ablauf

```aufgabe
id: D9-07
typ: schiebe
titel: "Vom Profil zur Entscheidung"
punkte: 25
frage: "Bring die Schritte einer fairen, KI-unterstützten Vorauswahl in die richtige Reihenfolge."
bausteine:
  - "Ein Mensch liest jede Bewerbung und entscheidet über die Einladung"
  - "Anforderungsprofil mit Muss- und Kann-Kriterien festlegen"
  - "Absagen freundlich und ohne Hinweise auf geschützte Merkmale formulieren"
  - "Werkzeug ordnet die Angaben jeder Bewerbung den Kriterien zu, mit Fundstelle"
  - "Kriterien gewichten und auf Benachteiligung prüfen"
loesung:
  - "Anforderungsprofil mit Muss- und Kann-Kriterien festlegen"
  - "Kriterien gewichten und auf Benachteiligung prüfen"
  - "Werkzeug ordnet die Angaben jeder Bewerbung den Kriterien zu, mit Fundstelle"
  - "Ein Mensch liest jede Bewerbung und entscheidet über die Einladung"
  - "Absagen freundlich und ohne Hinweise auf geschützte Merkmale formulieren"
richtzeit_s: 70
erklaerung: |
  Das Werkzeug ordnet zu, es urteilt nicht. Mit Fundstelle kann der Mensch
  jede Zuordnung in Sekunden prüfen. Die Kriterien stehen fest, bevor die
  erste Bewerbung gelesen wird - sonst passen sie sich unbemerkt an.
```
