---
type: lesson
title: "Was du einer KI nie anvertraust"
description: "Alles, was du eintippst, verlässt deinen Rechner. Was deshalb nie hineingehört — und warum genau das der Grund ist, in Stufe 2 genau fragen zu lernen."
tags:
  - lesson
  - stufe-1
  - datenschutz
timestamp: 2026-10-19T00:00:00+02:00
kontext: "[[PROMPTHEUS WISSEN]]"
stufe: 1
dauer_min: 11
---

# Was du einer KI nie anvertraust

## Wohin dein Text geht

Wenn du einem Chat etwas schreibst, fühlt es sich an wie ein Gespräch unter
vier Augen. Technisch passiert etwas anderes: **Dein Text wird an die Rechner
eines Anbieters geschickt**, dort verarbeitet und die Antwort zurückgeschickt.
Je nach Anbieter und Einstellung wird er dort gespeichert, von Menschen zur
Kontrolle gelesen oder sogar zum Training späterer Modelle verwendet.

Das heißt nicht, dass jeder Anbieter etwas Böses tut. Es heißt: **Was du
eintippst, hast du aus der Hand gegeben.** Du kannst es nicht zurückholen.

## Was nie hineingehört

| Was | Warum |
|---|---|
| **Passwörter und Zugangscodes** | Wer sie hat, ist du — auch dann, wenn sie in einem Protokoll landen |
| **Daten anderer Menschen** | Namen, Adressen, Fotos, Noten deiner Mitschüler oder Kollegen gehören dir nicht |
| **Gesundheitsangaben** | Besonders geschützt, auch deine eigenen |
| **Geheimes aus Schule oder Betrieb** | Klassenarbeiten vor dem Termin, Verträge, Kundendaten |

Die zweite Zeile wird am häufigsten vergessen. „Schreib eine Antwort an meinen
Nachbarn Herrn Müller, Gartenweg 5, wegen seiner Hecke" — da stehen Name und
Adresse eines Menschen, der nie gefragt wurde.

```aufgabe
id: E1-24
typ: plugplay
titel: "Darf das in den Chat?"
punkte: 30
frage: "Welche dieser Eingaben sind unbedenklich?"
bausteine:
  - "Erkläre mir, wie man einen Bruch kürzt"
  - "Mein Passwort für die Schulplattform lautet … — ist das sicher genug?"
  - "Hier ist die Notenliste meiner Klasse mit allen Namen, sortiere sie"
  - "Gib mir Tipps, wie ich mich auf ein Referat vorbereite"
  - "Formuliere eine Absage an einen Nachbarn, ohne Namen und Adresse"
loesung:
  - "Erkläre mir, wie man einen Bruch kürzt"
  - "Gib mir Tipps, wie ich mich auf ein Referat vorbereite"
  - "Formuliere eine Absage an einen Nachbarn, ohne Namen und Adresse"
richtzeit_s: 70
hinweise:
  - text: "Enthält die Eingabe ein Geheimnis oder Daten eines anderen Menschen?"
    kostet: 5
erklaerung: |
  Erklärungen, Tipps und Entwürfe ohne Namen sind unbedenklich. Ein Passwort
  gehört nie in einen Chat - auch nicht zum „Prüfen". Und die Notenliste
  enthält Daten von Menschen, die nicht gefragt wurden.
```

## Platzhalter statt Namen

Oft brauchst du die echten Angaben gar nicht. Das Modell schreibt dir einen
genauso guten Brief, wenn du statt des Namens **[NAME]** schreibst und den
echten Namen danach selbst einsetzt. Das ist ein Trick, den du in Stufe 5 als
Profi-Werkzeug wiedersiehst — er heißt dort *Pseudonymisieren*.

Diese Academy macht es dir übrigens vor: Wo du Text eingibst, der an ein Modell
gehen könnte, ersetzt sie erkennbare Namen, Mailadressen und Telefonnummern
durch „xxx".

```aufgabe
id: E1-25
typ: denkaufgabe
titel: "Der bessere Auftrag"
punkte: 25
frage: "Du willst eine Glückwunschkarte für deine Tante Sabine Berger zum 60. schreiben lassen. Welcher Auftrag gibt dem Modell alles, was es braucht, und nicht mehr?"
optionen:
  - "„Schreib eine Karte für Sabine Berger, Lindenstraße 12, geboren am 4. März 1966.“"
  - "„Schreib einen herzlichen Glückwunsch zum 60. für meine Tante, die gern wandert. Statt des Namens schreib [NAME].“"
  - "„Schreib irgendwas Nettes.“"
  - "„Hier ist das Familienfoto, schreib passend dazu.“"
loesung: "„Schreib einen herzlichen Glückwunsch zum 60. für meine Tante, die gern wandert. Statt des Namens schreib [NAME].“"
richtzeit_s: 50
erklaerung: |
  Anlass, Beziehung und ein persönliches Detail machen die Karte gut -
  Name, Adresse und Geburtsdatum braucht das Modell dafür nicht. „Irgendwas
  Nettes" ist zu wenig: Wie man genau genug fragt, ist der Stoff von Stufe 2.
```

## Wie es weitergeht

Damit endet die erste Stufe. Du weißt jetzt, was in einem Modell passiert: Es
zerlegt Text in Tokens, berechnet Zahlen, wählt ein Stück, und es weiß nur, was
es gelernt hat. Du weißt, warum es erfindet, warum man KI-Text nicht sicher
erkennt, und was nie hineingehört.

Was noch fehlt, ist die andere Seite: **wie man einem solchen Modell so genau
sagt, was man will, dass ein brauchbares Ergebnis herauskommt.** Das ist Stufe
2. Und du hast in dieser Lektion schon den ersten Schritt gesehen: Ein guter
Auftrag enthält, was nötig ist — und nichts, was nicht hineingehört.

```aufgabe
id: E1-26
typ: uebereinstimmung
titel: "Die Stufe in vier Sätzen"
punkte: 30
frage: "Ordne jeder Erkenntnis aus dieser Stufe ihre Begründung zu."
links:
  - "Ein Modell kann Buchstaben schlecht zählen"
  - "Ein Modell antwortet zweimal verschieden"
  - "Ein Modell erfindet Quellen"
  - "Ein Modell kennt das Ergebnis von gestern nicht"
rechts:
  - "Es sieht Tokens, keine Buchstaben"
  - "Es zieht das nächste Token mit einer Wahrscheinlichkeit"
  - "Für das Modell gibt es keinen Unterschied zwischen wahr und klingt richtig"
  - "Seine Trainingsdaten enden an einem Stichtag"
loesung:
  "Ein Modell kann Buchstaben schlecht zählen": "Es sieht Tokens, keine Buchstaben"
  "Ein Modell antwortet zweimal verschieden": "Es zieht das nächste Token mit einer Wahrscheinlichkeit"
  "Ein Modell erfindet Quellen": "Für das Modell gibt es keinen Unterschied zwischen wahr und klingt richtig"
  "Ein Modell kennt das Ergebnis von gestern nicht": "Seine Trainingsdaten enden an einem Stichtag"
richtzeit_s: 80
erklaerung: |
  Vier Eigenschaften, ein Bild: ein Modell, das Text in Stücke zerlegt und
  das wahrscheinlich nächste Stück wählt, aus dem, was es einmal gelernt hat.
  Das ist das Fundament für alles, was folgt.
```
